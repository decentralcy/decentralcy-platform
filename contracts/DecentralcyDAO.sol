// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DecentralcyToken.sol";

contract DecentralcyDAO {
    DecentralcyToken public immutable token;
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        ProposalType proposalType;
        address targetAddress;
        uint256 targetJobId;
        bool favorWorker;
    }
    
    enum ProposalType {
        DISPUTE_RESOLUTION,
        PLATFORM_FEE_CHANGE,
        GOVERNANCE_CHANGE
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public votingPower;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_TOKEN_THRESHOLD = 50 * 10**18; // 50 tokens to create proposal
    uint256 public constant QUORUM_PERCENTAGE = 20; // 20% of total supply needed
    
    address public tempAgencyContract;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool successful);
    
    constructor(address _token, address _tempAgencyContract) {
        token = DecentralcyToken(_token);
        tempAgencyContract = _tempAgencyContract;
    }
    
    modifier onlyTokenHolder() {
        require(token.balanceOf(msg.sender) >= MIN_TOKEN_THRESHOLD, "Insufficient tokens to participate");
        _;
    }
    
    function createDisputeProposal(
        string memory _title,
        string memory _description,
        uint256 _jobId,
        bool _favorWorker
    ) external onlyTokenHolder {
        uint256 proposalId = proposalCount++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            description: _description,
            proposer: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            endTime: block.timestamp + VOTING_PERIOD,
            executed: false,
            proposalType: ProposalType.DISPUTE_RESOLUTION,
            targetAddress: address(0),
            targetJobId: _jobId,
            favorWorker: _favorWorker
        });
        
        emit ProposalCreated(proposalId, msg.sender, _title);
    }
    
    function createGovernanceProposal(
        string memory _title,
        string memory _description,
        address _targetAddress
    ) external onlyTokenHolder {
        uint256 proposalId = proposalCount++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            description: _description,
            proposer: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            endTime: block.timestamp + VOTING_PERIOD,
            executed: false,
            proposalType: ProposalType.GOVERNANCE_CHANGE,
            targetAddress: _targetAddress,
            targetJobId: 0,
            favorWorker: false
        });
        
        emit ProposalCreated(proposalId, msg.sender, _title);
    }
    
    function vote(uint256 _proposalId, bool _support) external onlyTokenHolder {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp < proposal.endTime, "Voting period ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        
        uint256 weight = token.balanceOf(msg.sender);
        votingPower[_proposalId][msg.sender] = weight;
        hasVoted[_proposalId][msg.sender] = true;
        
        if (_support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, weight);
    }
    
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 quorum = (token.totalSupply() * QUORUM_PERCENTAGE) / 100;
        require(totalVotes >= quorum, "Quorum not reached");
        
        bool passed = proposal.votesFor > proposal.votesAgainst;
        proposal.executed = true;
        
        if (passed && proposal.proposalType == ProposalType.DISPUTE_RESOLUTION) {
            // Execute dispute resolution
            (bool success,) = tempAgencyContract.call(
                abi.encodeWithSignature(
                    "resolveDispute(uint256,bool)",
                    proposal.targetJobId,
                    proposal.favorWorker
                )
            );
            emit ProposalExecuted(_proposalId, success);
        } else {
            emit ProposalExecuted(_proposalId, passed);
        }
    }
    
    function getProposalVotes(uint256 _proposalId) external view returns (uint256 votesFor, uint256 votesAgainst) {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.votesFor, proposal.votesAgainst);
    }
    
    function getUserVotingPower(address _user) external view returns (uint256) {
        return token.balanceOf(_user);
    }
    
    function isQuorumReached(uint256 _proposalId) external view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 quorum = (token.totalSupply() * QUORUM_PERCENTAGE) / 100;
        return totalVotes >= quorum;
    }
    
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](proposalCount);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < proposalCount; i++) {
            if (block.timestamp < proposals[i].endTime && !proposals[i].executed) {
                activeIds[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeIds[i];
        }
        
        return result;
    }
}
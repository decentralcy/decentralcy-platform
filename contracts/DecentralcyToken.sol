// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title DecentralcyToken (DCNTRC)
 * @dev The native governance and utility token of the Decentralcy ecosystem
 * 
 * "Is a man not entitled to the sweat of his brow? 'No,' says the centralized platform, 
 * it belongs to the middleman. 'No,' says the regulator, it belongs to the system. 
 * 'No,' says the gatekeeper, it belongs to everyone else. I rejected those answers. 
 * Instead, I chose something different. I chose the impossible. I chose… Decentralcy."
 * 
 * - Genesis Message, inscribed forever on the blockchain
 */
contract DecentralcyToken is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
    
    // 🌟 GENESIS MESSAGE - Immortalized like Satoshi's Bitcoin message
    string public constant GENESIS_MESSAGE = 
        "Is a man not entitled to the sweat of his brow? 'No,' says the centralized platform, "
        "it belongs to the middleman. 'No,' says the regulator, it belongs to the system. "
        "'No,' says the gatekeeper, it belongs to everyone else. I rejected those answers. "
        "Instead, I chose something different. I chose the impossible. I chose... Decentralcy.";
    
    // Token Economics
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion DCNTRC
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million initial
    
    // Emission rates for different activities
    uint256 public constant JOB_COMPLETION_REWARD = 10 * 10**18; // 10 DCNTRC per job
    uint256 public constant REPUTATION_MILESTONE_REWARD = 50 * 10**18; // 50 DCNTRC per milestone
    uint256 public constant GOVERNANCE_PARTICIPATION_REWARD = 5 * 10**18; // 5 DCNTRC per vote
    uint256 public constant PLATFORM_VERIFICATION_REWARD = 100 * 10**18; // 100 DCNTRC for verification
    
    // Staking and governance
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    mapping(address => uint256) public governanceWeight;
    
    // Platform fee distribution
    mapping(address => uint256) public feeRewards;
    uint256 public totalFeePool;
    
    // Events
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event GovernanceReward(address indexed user, uint256 amount);
    event JobCompletionReward(address indexed worker, uint256 amount);
    event FeeDistributed(uint256 totalAmount, uint256 stakersShare);
    
    constructor() ERC20("Decentralcy Token", "DCNTRC") ERC20Permit("Decentralcy Token") {
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Emit genesis message in contract creation
        emit GenesisMessage(GENESIS_MESSAGE, block.timestamp, block.number);
    }
    
    // Custom event for the genesis message
    event GenesisMessage(string message, uint256 timestamp, uint256 blockNumber);
    
    /**
     * @dev Mint new tokens for platform rewards (only owner can call)
     */
    function mintReward(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Stake tokens for governance and fee sharing
     */
    function stakeTokens(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to staking
        _transfer(msg.sender, address(this), amount);
        
        // Update staking records
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        // Calculate governance weight (longer staking = more weight)
        _updateGovernanceWeight(msg.sender);
        
        emit TokensStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstakeTokens(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        // Calculate staking rewards
        uint256 stakingDuration = block.timestamp - stakingTimestamp[msg.sender];
        uint256 rewards = _calculateStakingRewards(amount, stakingDuration);
        
        // Update records
        stakedBalance[msg.sender] -= amount;
        _updateGovernanceWeight(msg.sender);
        
        // Transfer tokens back + rewards
        _transfer(address(this), msg.sender, amount);
        if (rewards > 0 && totalSupply() + rewards <= MAX_SUPPLY) {
            _mint(msg.sender, rewards);
        }
        
        emit TokensUnstaked(msg.sender, amount, rewards);
    }
    
    /**
     * @dev Reward user for job completion
     */
    function rewardJobCompletion(address worker) external onlyOwner {
        require(totalSupply() + JOB_COMPLETION_REWARD <= MAX_SUPPLY, "Exceeds max supply");
        _mint(worker, JOB_COMPLETION_REWARD);
        emit JobCompletionReward(worker, JOB_COMPLETION_REWARD);
    }
    
    /**
     * @dev Reward user for governance participation
     */
    function rewardGovernanceParticipation(address voter) external onlyOwner {
        require(totalSupply() + GOVERNANCE_PARTICIPATION_REWARD <= MAX_SUPPLY, "Exceeds max supply");
        _mint(voter, GOVERNANCE_PARTICIPATION_REWARD);
        emit GovernanceReward(voter, GOVERNANCE_PARTICIPATION_REWARD);
    }
    
    /**
     * @dev Distribute platform fees to token stakers
     */
    function distributeFees() external payable {
        require(msg.value > 0, "No fees to distribute");
        
        totalFeePool += msg.value;
        uint256 totalStaked = balanceOf(address(this));
        
        if (totalStaked > 0) {
            // Distribute proportionally to stakers
            // This is simplified - in production, you'd use a more sophisticated mechanism
            emit FeeDistributed(msg.value, totalStaked);
        }
    }
    
    /**
     * @dev Get user's governance voting power
     */
    function getVotingPower(address user) external view returns (uint256) {
        return governanceWeight[user];
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Calculate staking rewards based on amount and duration
     */
    function _calculateStakingRewards(uint256 amount, uint256 duration) internal pure returns (uint256) {
        // 5% APY for staking, calculated per second
        uint256 annualRate = 500; // 5% * 100 for precision
        uint256 secondsInYear = 365 * 24 * 60 * 60;
        return (amount * annualRate * duration) / (10000 * secondsInYear);
    }
    
    /**
     * @dev Update governance weight based on staked amount and duration
     */
    function _updateGovernanceWeight(address user) internal {
        uint256 staked = stakedBalance[user];
        uint256 duration = block.timestamp - stakingTimestamp[user];
        
        // Weight = staked amount * sqrt(days staked) for diminishing returns
        uint256 daysStaked = duration / (24 * 60 * 60);
        governanceWeight[user] = staked * _sqrt(daysStaked + 1);
    }
    
    /**
     * @dev Square root function for governance weight calculation
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 xx = x;
        uint256 r = 1;
        if (xx >= 0x100000000000000000000000000000000) { xx >>= 128; r <<= 64; }
        if (xx >= 0x10000000000000000) { xx >>= 64; r <<= 32; }
        if (xx >= 0x100000000) { xx >>= 32; r <<= 16; }
        if (xx >= 0x10000) { xx >>= 16; r <<= 8; }
        if (xx >= 0x100) { xx >>= 8; r <<= 4; }
        if (xx >= 0x10) { xx >>= 4; r <<= 2; }
        if (xx >= 0x8) { r <<= 1; }
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        r = (r + x / r) >> 1;
        uint256 r1 = x / r;
        return (r < r1 ? r : r1);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
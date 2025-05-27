// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MultiTokenPayment
 * @dev Enhanced escrow system supporting multiple ERC20 tokens (USDC, DAI, USDT, etc.)
 */
contract MultiTokenPayment is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Supported tokens with their details
    struct TokenInfo {
        address tokenAddress;
        string symbol;
        uint8 decimals;
        bool isActive;
        uint256 minimumAmount; // Minimum payment in token units
    }

    // Job structure with multi-token support
    struct Job {
        uint256 id;
        address employer;
        address worker;
        string title;
        string description;
        address paymentToken; // Token contract address (0x0 for ETH)
        uint256 paymentAmount;
        uint256 platformFee; // Platform fee in basis points (e.g., 250 = 2.5%)
        JobStatus status;
        uint256 deadline;
        bool disputed;
        uint256 createdAt;
    }

    enum JobStatus {
        Open,
        Assigned,
        InProgress,
        Completed,
        Paid,
        Disputed,
        Cancelled
    }

    // Events
    event JobCreated(
        uint256 indexed jobId,
        address indexed employer,
        address indexed paymentToken,
        uint256 paymentAmount,
        string title
    );
    
    event JobAssigned(uint256 indexed jobId, address indexed worker);
    event JobCompleted(uint256 indexed jobId);
    event PaymentReleased(
        uint256 indexed jobId,
        address indexed worker,
        address indexed paymentToken,
        uint256 amount,
        uint256 platformFee
    );
    event DisputeRaised(uint256 indexed jobId, address indexed disputeRaiser);
    event TokenAdded(address indexed tokenAddress, string symbol);
    event TokenStatusUpdated(address indexed tokenAddress, bool isActive);

    // State variables
    mapping(uint256 => Job) public jobs;
    mapping(address => TokenInfo) public supportedTokens;
    mapping(address => uint256) public platformBalances; // Platform fee balances per token
    
    address[] public tokenList;
    uint256 public jobCounter;
    uint256 public defaultPlatformFee = 250; // 2.5% default fee
    address public feeRecipient;

    // Common token addresses (mainnet)
    address public constant USDC = 0xA0b86a33E6417aB0C8a3cf5e7c8D9Ca57fE9B4d2; // Example address
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        
        // Add common stablecoins
        _addToken(USDC, "USDC", 6, 1000000); // $1 minimum
        _addToken(DAI, "DAI", 18, 1000000000000000000); // $1 minimum
        _addToken(USDT, "USDT", 6, 1000000); // $1 minimum
    }

    /**
     * @dev Create a new job with specified token payment
     */
    function createJob(
        string memory _title,
        string memory _description,
        address _paymentToken,
        uint256 _paymentAmount,
        uint256 _deadline
    ) external payable nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_paymentAmount > 0, "Payment amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 jobId = ++jobCounter;
        uint256 platformFee = (_paymentAmount * defaultPlatformFee) / 10000;

        if (_paymentToken == address(0)) {
            // ETH payment
            require(msg.value == _paymentAmount + platformFee, "Incorrect ETH amount");
        } else {
            // ERC20 token payment
            require(supportedTokens[_paymentToken].isActive, "Token not supported");
            require(_paymentAmount >= supportedTokens[_paymentToken].minimumAmount, "Amount below minimum");
            
            IERC20(_paymentToken).safeTransferFrom(
                msg.sender,
                address(this),
                _paymentAmount + platformFee
            );
        }

        jobs[jobId] = Job({
            id: jobId,
            employer: msg.sender,
            worker: address(0),
            title: _title,
            description: _description,
            paymentToken: _paymentToken,
            paymentAmount: _paymentAmount,
            platformFee: platformFee,
            status: JobStatus.Open,
            deadline: _deadline,
            disputed: false,
            createdAt: block.timestamp
        });

        emit JobCreated(jobId, msg.sender, _paymentToken, _paymentAmount, _title);
        return jobId;
    }

    /**
     * @dev Assign job to a worker
     */
    function assignJob(uint256 _jobId, address _worker) external {
        Job storage job = jobs[_jobId];
        require(job.employer == msg.sender, "Only employer can assign job");
        require(job.status == JobStatus.Open, "Job not available for assignment");
        require(_worker != address(0), "Invalid worker address");

        job.worker = _worker;
        job.status = JobStatus.Assigned;

        emit JobAssigned(_jobId, _worker);
    }

    /**
     * @dev Mark job as completed by worker
     */
    function completeJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.worker == msg.sender, "Only assigned worker can complete job");
        require(job.status == JobStatus.Assigned || job.status == JobStatus.InProgress, "Invalid job status");

        job.status = JobStatus.Completed;
        emit JobCompleted(_jobId);
    }

    /**
     * @dev Release payment to worker (called by employer)
     */
    function releasePayment(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.employer == msg.sender, "Only employer can release payment");
        require(job.status == JobStatus.Completed, "Job not completed");
        require(!job.disputed, "Job is disputed");

        job.status = JobStatus.Paid;

        // Update platform fee balance
        platformBalances[job.paymentToken] += job.platformFee;

        // Transfer payment to worker
        if (job.paymentToken == address(0)) {
            // ETH payment
            payable(job.worker).transfer(job.paymentAmount);
        } else {
            // ERC20 token payment
            IERC20(job.paymentToken).safeTransfer(job.worker, job.paymentAmount);
        }

        emit PaymentReleased(_jobId, job.worker, job.paymentToken, job.paymentAmount, job.platformFee);
    }

    /**
     * @dev Raise a dispute for a job
     */
    function raiseDispute(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.employer == msg.sender || job.worker == msg.sender, "Only job participants can raise dispute");
        require(job.status == JobStatus.Completed || job.status == JobStatus.Assigned, "Invalid status for dispute");

        job.disputed = true;
        job.status = JobStatus.Disputed;

        emit DisputeRaised(_jobId, msg.sender);
    }

    /**
     * @dev Resolve dispute (only owner/arbitrator)
     */
    function resolveDispute(
        uint256 _jobId,
        uint256 _employerAmount,
        uint256 _workerAmount
    ) external onlyOwner nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.disputed, "Job not disputed");
        require(_employerAmount + _workerAmount <= job.paymentAmount, "Invalid distribution amounts");

        job.disputed = false;
        job.status = JobStatus.Paid;

        // Update platform fee balance
        platformBalances[job.paymentToken] += job.platformFee;

        // Distribute payments
        if (_workerAmount > 0) {
            if (job.paymentToken == address(0)) {
                payable(job.worker).transfer(_workerAmount);
            } else {
                IERC20(job.paymentToken).safeTransfer(job.worker, _workerAmount);
            }
        }

        if (_employerAmount > 0) {
            if (job.paymentToken == address(0)) {
                payable(job.employer).transfer(_employerAmount);
            } else {
                IERC20(job.paymentToken).safeTransfer(job.employer, _employerAmount);
            }
        }

        emit PaymentReleased(_jobId, job.worker, job.paymentToken, _workerAmount, job.platformFee);
    }

    /**
     * @dev Add a new supported token
     */
    function addToken(
        address _tokenAddress,
        string memory _symbol,
        uint8 _decimals,
        uint256 _minimumAmount
    ) external onlyOwner {
        _addToken(_tokenAddress, _symbol, _decimals, _minimumAmount);
    }

    function _addToken(
        address _tokenAddress,
        string memory _symbol,
        uint8 _decimals,
        uint256 _minimumAmount
    ) internal {
        require(_tokenAddress != address(0), "Invalid token address");
        require(!supportedTokens[_tokenAddress].isActive, "Token already supported");

        supportedTokens[_tokenAddress] = TokenInfo({
            tokenAddress: _tokenAddress,
            symbol: _symbol,
            decimals: _decimals,
            isActive: true,
            minimumAmount: _minimumAmount
        });

        tokenList.push(_tokenAddress);
        emit TokenAdded(_tokenAddress, _symbol);
    }

    /**
     * @dev Toggle token active status
     */
    function setTokenStatus(address _tokenAddress, bool _isActive) external onlyOwner {
        require(supportedTokens[_tokenAddress].tokenAddress != address(0), "Token not found");
        supportedTokens[_tokenAddress].isActive = _isActive;
        emit TokenStatusUpdated(_tokenAddress, _isActive);
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees(address _token, uint256 _amount) external onlyOwner {
        require(platformBalances[_token] >= _amount, "Insufficient balance");
        platformBalances[_token] -= _amount;

        if (_token == address(0)) {
            payable(feeRecipient).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(feeRecipient, _amount);
        }
    }

    /**
     * @dev Get all supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * @dev Get token info
     */
    function getTokenInfo(address _token) external view returns (TokenInfo memory) {
        return supportedTokens[_token];
    }

    /**
     * @dev Get job details
     */
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }

    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        defaultPlatformFee = _fee;
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Emergency function to recover stuck tokens
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(owner(), _amount);
        }
    }
}
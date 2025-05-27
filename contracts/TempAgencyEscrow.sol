// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TempAgencyEscrow {
    address public owner;
    uint256 public platformFeePercent = 10; // 10% platform fee

    struct Job {
        string title;
        string description;
        address payable employer;
        address payable worker;
        uint256 paymentAmount;
        bool isFilled;
        bool isPaidOut;
        uint256 createdAt;
        uint256 deadline;
        bool disputed;
    }

    Job[] public jobs;
    
    mapping(uint256 => address[]) public jobApplicants;
    mapping(address => uint256) public workerRatings;
    mapping(address => uint256) public employerRatings;
    mapping(address => uint256) public completedJobs;

    event JobPosted(uint256 indexed jobId, address indexed employer, uint256 paymentAmount);
    event JobFilled(uint256 indexed jobId, address indexed worker, uint256 paymentAmount);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 payout);
    event DisputeRaised(uint256 indexed jobId, address indexed raiser);
    event WorkerRated(address indexed worker, uint256 rating);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier jobExists(uint256 _jobId) {
        require(_jobId < jobs.length, "Job does not exist");
        _;
    }

    function postJob(
        string memory _title, 
        string memory _description,
        uint256 _deadline
    ) public payable {
        require(msg.value > 0, "Payment required to post job");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        jobs.push(Job({
            title: _title,
            description: _description,
            employer: payable(msg.sender),
            worker: payable(address(0)),
            paymentAmount: msg.value,
            isFilled: false,
            isPaidOut: false,
            createdAt: block.timestamp,
            deadline: _deadline,
            disputed: false
        }));

        emit JobPosted(jobs.length - 1, msg.sender, msg.value);
    }

    function applyForJob(uint256 _jobId) public jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(!job.isFilled, "Job already filled");
        require(job.employer != msg.sender, "Cannot apply to your own job");
        require(block.timestamp < job.deadline, "Job deadline passed");
        
        // Check if already applied
        address[] storage applicants = jobApplicants[_jobId];
        for (uint i = 0; i < applicants.length; i++) {
            require(applicants[i] != msg.sender, "Already applied to this job");
        }
        
        jobApplicants[_jobId].push(msg.sender);
    }

    function acceptWorker(uint256 _jobId, address _worker) public jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.employer == msg.sender, "Only employer can accept workers");
        require(!job.isFilled, "Job already filled");
        
        // Verify worker applied
        bool hasApplied = false;
        address[] storage applicants = jobApplicants[_jobId];
        for (uint i = 0; i < applicants.length; i++) {
            if (applicants[i] == _worker) {
                hasApplied = true;
                break;
            }
        }
        require(hasApplied, "Worker has not applied to this job");

        job.worker = payable(_worker);
        job.isFilled = true;

        emit JobFilled(_jobId, _worker, job.paymentAmount);
    }

    function completeJob(uint256 _jobId) public jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.worker == msg.sender, "Only assigned worker can complete job");
        require(job.isFilled && !job.isPaidOut, "Job not ready for completion");
        require(!job.disputed, "Job is disputed");

        uint256 fee = (job.paymentAmount * platformFeePercent) / 100;
        uint256 payout = job.paymentAmount - fee;

        job.worker.transfer(payout);
        payable(owner).transfer(fee);
        job.isPaidOut = true;

        completedJobs[msg.sender]++;
        
        emit JobCompleted(_jobId, msg.sender, payout);
    }

    function raiseDispute(uint256 _jobId) public jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(
            job.employer == msg.sender || job.worker == msg.sender,
            "Only employer or worker can raise dispute"
        );
        require(job.isFilled && !job.isPaidOut, "Invalid job state for dispute");
        
        job.disputed = true;
        emit DisputeRaised(_jobId, msg.sender);
    }

    function resolveDispute(uint256 _jobId, bool _favorWorker) public onlyOwner jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.disputed, "Job is not disputed");
        require(!job.isPaidOut, "Job already paid out");

        if (_favorWorker) {
            uint256 fee = (job.paymentAmount * platformFeePercent) / 100;
            uint256 payout = job.paymentAmount - fee;
            job.worker.transfer(payout);
            payable(owner).transfer(fee);
            completedJobs[job.worker]++;
        } else {
            job.employer.transfer(job.paymentAmount);
        }

        job.isPaidOut = true;
        job.disputed = false;
    }

    function rateWorker(address _worker, uint256 _rating) public {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(completedJobs[_worker] > 0, "Worker has no completed jobs");
        
        workerRatings[_worker] = _rating;
        emit WorkerRated(_worker, _rating);
    }

    function getJobsCount() public view returns (uint256) {
        return jobs.length;
    }

    function getJobApplicants(uint256 _jobId) public view returns (address[] memory) {
        return jobApplicants[_jobId];
    }

    function getWorkerStats(address _worker) public view returns (uint256 rating, uint256 completed) {
        return (workerRatings[_worker], completedJobs[_worker]);
    }

    function setPlatformFee(uint256 _feePercent) public onlyOwner {
        require(_feePercent <= 20, "Fee cannot exceed 20%");
        platformFeePercent = _feePercent;
    }

    function withdrawEmergency() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
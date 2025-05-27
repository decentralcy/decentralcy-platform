import { ethers } from "ethers";
import { web3Service } from "./web3";

// TempAgencyEscrow contract ABI - Enhanced version with dispute resolution and ratings
const TEMP_AGENCY_ABI = [
  "function owner() public view returns (address)",
  "function platformFeePercent() public view returns (uint256)",
  "function jobs(uint256) public view returns (string title, string description, address employer, address worker, uint256 paymentAmount, bool isFilled, bool isPaidOut, uint256 createdAt, uint256 deadline, bool disputed)",
  "function postJob(string memory _title, string memory _description, uint256 _deadline) public payable",
  "function applyForJob(uint256 _jobId) public",
  "function acceptWorker(uint256 _jobId, address _worker) public",
  "function completeJob(uint256 _jobId) public",
  "function raiseDispute(uint256 _jobId) public",
  "function resolveDispute(uint256 _jobId, bool _favorWorker) public",
  "function rateWorker(address _worker, uint256 _rating) public",
  "function getJobsCount() public view returns (uint256)",
  "function getJobApplicants(uint256 _jobId) public view returns (address[])",
  "function getWorkerStats(address _worker) public view returns (uint256 rating, uint256 completed)",
  "function setPlatformFee(uint256 _feePercent) public",
  "event JobPosted(uint256 indexed jobId, address indexed employer, uint256 paymentAmount)",
  "event JobFilled(uint256 indexed jobId, address indexed worker, uint256 paymentAmount)",
  "event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 payout)",
  "event DisputeRaised(uint256 indexed jobId, address indexed raiser)",
  "event WorkerRated(address indexed worker, uint256 rating)"
];

// Default contract address - should be set via environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export interface ContractJob {
  title: string;
  description: string;
  employer: string;
  worker: string;
  paymentAmount: ethers.BigNumber;
  isFilled: boolean;
  isPaidOut: boolean;
  createdAt: ethers.BigNumber;
  deadline: ethers.BigNumber;
  disputed: boolean;
}

export interface WorkerStats {
  rating: number;
  completed: number;
}

export class TempAgencyContract {
  private contract: ethers.Contract | null = null;

  getContract(): ethers.Contract {
    if (!this.contract) {
      const signer = web3Service.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, TEMP_AGENCY_ABI, signer);
    }
    return this.contract;
  }

  async postJob(title: string, description: string, paymentAmount: string): Promise<ethers.ContractTransaction> {
    const contract = this.getContract();
    const value = web3Service.parseEther(paymentAmount);
    
    try {
      const tx = await contract.postJob(title, description, { value });
      return tx;
    } catch (error: any) {
      throw new Error(`Failed to post job: ${error.message}`);
    }
  }

  async applyForJob(jobId: number): Promise<ethers.ContractTransaction> {
    const contract = this.getContract();
    
    try {
      const tx = await contract.applyForJob(jobId);
      return tx;
    } catch (error: any) {
      throw new Error(`Failed to apply for job: ${error.message}`);
    }
  }

  async getJobsCount(): Promise<number> {
    const contract = this.getContract();
    
    try {
      const count = await contract.getJobsCount();
      return count.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get jobs count: ${error.message}`);
    }
  }

  async getJob(jobId: number): Promise<ContractJob> {
    const contract = this.getContract();
    
    try {
      const job = await contract.jobs(jobId);
      return {
        title: job.title,
        description: job.description,
        employer: job.employer,
        worker: job.worker,
        paymentAmount: job.paymentAmount,
        isFilled: job.isFilled,
        isPaidOut: job.isPaidOut,
      };
    } catch (error: any) {
      throw new Error(`Failed to get job: ${error.message}`);
    }
  }

  async getPlatformFee(): Promise<number> {
    const contract = this.getContract();
    
    try {
      const fee = await contract.platformFeePercent();
      return fee.toNumber();
    } catch (error: any) {
      throw new Error(`Failed to get platform fee: ${error.message}`);
    }
  }

  async estimateGas(method: string, ...args: any[]): Promise<ethers.BigNumber> {
    const contract = this.getContract();
    
    try {
      return await contract.estimateGas[method](...args);
    } catch (error: any) {
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }

  onJobPosted(callback: (jobId: number, employer: string, paymentAmount: ethers.BigNumber) => void): void {
    const contract = this.getContract();
    contract.on("JobPosted", callback);
  }

  onJobFilled(callback: (jobId: number, worker: string, paymentAmount: ethers.BigNumber) => void): void {
    const contract = this.getContract();
    contract.on("JobFilled", callback);
  }

  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const tempAgencyContract = new TempAgencyContract();

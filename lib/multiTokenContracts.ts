import { ethers } from "ethers";
import { web3Service } from "./web3";

// Multi-token payment contract interface
export interface MultiTokenContract {
  createJob: (
    title: string,
    description: string,
    paymentToken: string,
    paymentAmount: string,
    deadline: number
  ) => Promise<ethers.ContractTransaction>;
  
  assignJob: (jobId: number, worker: string) => Promise<ethers.ContractTransaction>;
  completeJob: (jobId: number) => Promise<ethers.ContractTransaction>;
  releasePayment: (jobId: number) => Promise<ethers.ContractTransaction>;
  raiseDispute: (jobId: number) => Promise<ethers.ContractTransaction>;
  
  getJob: (jobId: number) => Promise<any>;
  getSupportedTokens: () => Promise<string[]>;
  getTokenInfo: (tokenAddress: string) => Promise<any>;
}

// Supported tokens with Bitcoin integration via wrapped Bitcoin (WBTC)
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  isStablecoin: boolean;
  minimumAmount: string;
  category: "crypto" | "stablecoin" | "bitcoin";
  description: string;
}

export const SUPPORTED_TOKENS: TokenInfo[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    icon: "⟐",
    isStablecoin: false,
    minimumAmount: "0.001",
    category: "crypto",
    description: "Native Ethereum cryptocurrency"
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC mainnet
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    icon: "₿",
    isStablecoin: false,
    minimumAmount: "0.0001",
    category: "bitcoin",
    description: "Bitcoin on Ethereum - 1:1 backed by Bitcoin"
  },
  {
    address: "0xA0b86a33E6417aB0C8a3cf5e7c8D9Ca57fE9B4d2",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "🔵",
    isStablecoin: true,
    minimumAmount: "1",
    category: "stablecoin",
    description: "Fully regulated USD stablecoin"
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    icon: "🟡",
    isStablecoin: true,
    minimumAmount: "1",
    category: "stablecoin",
    description: "Decentralized algorithmic stablecoin"
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    icon: "🟢",
    isStablecoin: true,
    minimumAmount: "1",
    category: "stablecoin",
    description: "Most widely used stablecoin"
  }
];

// Multi-token contract ABI (simplified for demo)
const MULTI_TOKEN_ABI = [
  "function createJob(string title, string description, address paymentToken, uint256 paymentAmount, uint256 deadline) external payable returns (uint256)",
  "function assignJob(uint256 jobId, address worker) external",
  "function completeJob(uint256 jobId) external",
  "function releasePayment(uint256 jobId) external",
  "function raiseDispute(uint256 jobId) external",
  "function getJob(uint256 jobId) external view returns (tuple(uint256 id, address employer, address worker, string title, string description, address paymentToken, uint256 paymentAmount, uint256 platformFee, uint8 status, uint256 deadline, bool disputed, uint256 createdAt))",
  "function getSupportedTokens() external view returns (address[] memory)",
  "function getTokenInfo(address token) external view returns (tuple(address tokenAddress, string symbol, uint8 decimals, bool isActive, uint256 minimumAmount))",
  "event JobCreated(uint256 indexed jobId, address indexed employer, address indexed paymentToken, uint256 paymentAmount, string title)",
  "event PaymentReleased(uint256 indexed jobId, address indexed worker, address indexed paymentToken, uint256 amount, uint256 platformFee)"
];

// ERC20 token ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)"
];

export class MultiTokenService {
  private contract: ethers.Contract | null = null;
  private contractAddress: string = ""; // Will be set when contract is deployed

  constructor() {
    this.initializeContract();
  }

  private async initializeContract() {
    try {
      const provider = web3Service.getProvider();
      if (provider && this.contractAddress) {
        this.contract = new ethers.Contract(this.contractAddress, MULTI_TOKEN_ABI, provider);
      }
    } catch (error) {
      console.error("Failed to initialize multi-token contract:", error);
    }
  }

  // Get token balance for user
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const provider = web3Service.getProvider();
      if (!provider) throw new Error("Provider not available");

      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        // ETH balance
        const balance = await provider.getBalance(userAddress);
        return ethers.formatEther(balance);
      } else {
        // ERC20 token balance
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(userAddress);
        const decimals = await tokenContract.decimals();
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return "0";
    }
  }

  // Check token allowance
  async getTokenAllowance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const provider = web3Service.getProvider();
      if (!provider || !this.contractAddress) return "0";

      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        return "0"; // ETH doesn't need allowance
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await tokenContract.allowance(userAddress, this.contractAddress);
      const decimals = await tokenContract.decimals();
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      console.error("Failed to get token allowance:", error);
      return "0";
    }
  }

  // Approve token spending
  async approveToken(tokenAddress: string, amount: string): Promise<ethers.ContractTransaction> {
    try {
      const signer = web3Service.getSigner();
      if (!signer || !this.contractAddress) throw new Error("Signer not available");

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = await tokenContract.decimals();
      const amountBN = ethers.parseUnits(amount, decimals);
      
      return await tokenContract.approve(this.contractAddress, amountBN);
    } catch (error) {
      console.error("Failed to approve token:", error);
      throw error;
    }
  }

  // Create job with multi-token payment
  async createJob(
    title: string,
    description: string,
    paymentToken: string,
    paymentAmount: string,
    deadline: number
  ): Promise<ethers.ContractTransaction> {
    try {
      const signer = web3Service.getSigner();
      if (!signer || !this.contract) throw new Error("Contract not available");

      const contractWithSigner = this.contract.connect(signer);
      const token = SUPPORTED_TOKENS.find(t => t.address === paymentToken);
      if (!token) throw new Error("Unsupported token");

      const amountBN = ethers.parseUnits(paymentAmount, token.decimals);
      const platformFee = amountBN * BigInt(250) / BigInt(10000); // 2.5% fee
      const totalAmount = amountBN + platformFee;

      if (paymentToken === "0x0000000000000000000000000000000000000000") {
        // ETH payment
        return await contractWithSigner.createJob(
          title,
          description,
          paymentToken,
          amountBN,
          deadline,
          { value: totalAmount }
        );
      } else {
        // ERC20 token payment
        return await contractWithSigner.createJob(
          title,
          description,
          paymentToken,
          amountBN,
          deadline
        );
      }
    } catch (error) {
      console.error("Failed to create job:", error);
      throw error;
    }
  }

  // Get token price in USD (mock implementation - in production, use price oracle)
  async getTokenPriceUSD(tokenAddress: string): Promise<number> {
    const mockPrices: { [key: string]: number } = {
      "0x0000000000000000000000000000000000000000": 2000, // ETH
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": 43000, // WBTC
      "0xA0b86a33E6417aB0C8a3cf5e7c8D9Ca57fE9B4d2": 1, // USDC
      "0x6B175474E89094C44Da98b954EedeAC495271d0F": 1, // DAI
      "0xdAC17F958D2ee523a2206206994597C13D831ec7": 1, // USDT
    };

    return mockPrices[tokenAddress] || 0;
  }

  // Convert amount between tokens
  async convertTokenAmount(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<string> {
    try {
      const fromPrice = await this.getTokenPriceUSD(fromToken);
      const toPrice = await this.getTokenPriceUSD(toToken);
      
      if (!fromPrice || !toPrice) return "0";

      const fromTokenInfo = SUPPORTED_TOKENS.find(t => t.address === fromToken);
      const toTokenInfo = SUPPORTED_TOKENS.find(t => t.address === toToken);
      
      if (!fromTokenInfo || !toTokenInfo) return "0";

      const amountNum = parseFloat(amount);
      const usdValue = amountNum * fromPrice;
      const convertedAmount = usdValue / toPrice;

      return convertedAmount.toFixed(toTokenInfo.decimals > 6 ? 6 : toTokenInfo.decimals);
    } catch (error) {
      console.error("Failed to convert token amount:", error);
      return "0";
    }
  }

  // Get transaction history for a user
  async getUserTransactionHistory(userAddress: string): Promise<any[]> {
    try {
      if (!this.contract) return [];

      // Get events for jobs created by user
      const jobCreatedFilter = this.contract.filters.JobCreated(null, userAddress);
      const createdEvents = await this.contract.queryFilter(jobCreatedFilter);

      // Get events for payments received by user
      const paymentFilter = this.contract.filters.PaymentReleased(null, userAddress);
      const paymentEvents = await this.contract.queryFilter(paymentFilter);

      return [...createdEvents, ...paymentEvents].sort((a, b) => 
        b.blockNumber - a.blockNumber
      );
    } catch (error) {
      console.error("Failed to get transaction history:", error);
      return [];
    }
  }

  // Set contract address (for when contract is deployed)
  setContractAddress(address: string) {
    this.contractAddress = address;
    this.initializeContract();
  }
}

export const multiTokenService = new MultiTokenService();
import { ethers } from "ethers";

// Your LIVE deployed contract on Sepolia testnet! 🎉
export const LIVE_CONTRACTS = {
  sepolia: {
    decentralcyTest: {
      address: "0x2394bf201e9e2b245047e6a11c73241c82cf2b57",
      abi: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function owner() view returns (address)",
        "function deployedAt() view returns (uint256)",
        "function getMessage() view returns (string)"
      ],
      network: "sepolia",
      chainId: 11155111
    }
  }
};

export class LiveContractService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;

  async connectToLiveContract(): Promise<{
    success: boolean;
    contractData?: any;
    error?: string;
  }> {
    try {
      // Connect to user's wallet
      if (!window.ethereum) {
        return {
          success: false,
          error: "Please install MetaMask to interact with live contracts"
        };
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await this.provider.send("eth_requestAccounts", []);
      
      // Check if we're on Sepolia
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        return {
          success: false,
          error: "Please switch to Sepolia testnet in MetaMask"
        };
      }

      // Connect to your live contract
      const contractConfig = LIVE_CONTRACTS.sepolia.decentralcyTest;
      this.contract = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        this.provider
      );

      // Read contract data
      const [name, symbol, owner, deployedAt, message] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.owner(),
        this.contract.deployedAt(),
        this.contract.getMessage()
      ]);

      const contractData = {
        address: contractConfig.address,
        name,
        symbol,
        owner,
        deployedAt: new Date(Number(deployedAt) * 1000).toISOString(),
        message,
        network: "Sepolia Testnet",
        etherscanLink: `https://sepolia.etherscan.io/address/${contractConfig.address}`
      };

      return {
        success: true,
        contractData
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect to contract"
      };
    }
  }

  async getContractBalance(): Promise<string> {
    if (!this.provider || !this.contract) {
      throw new Error("Not connected to contract");
    }

    const balance = await this.provider.getBalance(this.contract.target);
    return ethers.formatEther(balance);
  }

  async getCurrentGasPrice(): Promise<string> {
    if (!this.provider) {
      throw new Error("Not connected to provider");
    }

    const feeData = await this.provider.getFeeData();
    return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
  }

  getContractAddress(): string {
    return LIVE_CONTRACTS.sepolia.decentralcyTest.address;
  }

  getEtherscanLink(): string {
    return `https://sepolia.etherscan.io/address/${this.getContractAddress()}`;
  }
}

export const liveContract = new LiveContractService();
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      return address;
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async checkConnection(): Promise<string | null> {
    if (!window.ethereum) return null;

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        return accounts[0];
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    return this.signer;
  }

  getProvider(): ethers.providers.Web3Provider {
    if (!this.provider) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    return this.provider;
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatEther(value: string | ethers.BigNumber): string {
    return ethers.utils.formatEther(value);
  }

  parseEther(value: string): ethers.BigNumber {
    return ethers.utils.parseEther(value);
  }
}

export const web3Service = new Web3Service();

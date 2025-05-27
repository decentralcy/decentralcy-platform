import { ethers } from "ethers";

interface RPCEndpoint {
  name: string;
  url: string;
  priority: number;
  maxRetries: number;
  timeout: number;
  isHealthy: boolean;
  lastChecked: number;
}

export class RPCFailoverProvider {
  private endpoints: RPCEndpoint[] = [];
  private currentProviderIndex = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private provider: ethers.JsonRpcProvider | null = null;

  constructor() {
    this.initializeEndpoints();
    this.startHealthChecking();
    this.selectBestProvider();
  }

  private initializeEndpoints() {
    // Primary RPC endpoints (you'll need to add your API keys)
    this.endpoints = [
      {
        name: "Alchemy Mainnet",
        url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY || 'demo'}`,
        priority: 1,
        maxRetries: 3,
        timeout: 5000,
        isHealthy: true,
        lastChecked: 0
      },
      {
        name: "Infura Mainnet",
        url: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID || 'demo'}`,
        priority: 2,
        maxRetries: 3,
        timeout: 5000,
        isHealthy: true,
        lastChecked: 0
      },
      {
        name: "QuickNode",
        url: import.meta.env.VITE_QUICKNODE_URL || "https://greatest-capable-tent.quiknode.pro/demo/",
        priority: 3,
        maxRetries: 2,
        timeout: 6000,
        isHealthy: true,
        lastChecked: 0
      },
      {
        name: "Ankr Public",
        url: "https://rpc.ankr.com/eth",
        priority: 4,
        maxRetries: 2,
        timeout: 8000,
        isHealthy: true,
        lastChecked: 0
      },
      {
        name: "CloudFlare Public",
        url: "https://cloudflare-eth.com",
        priority: 5,
        maxRetries: 1,
        timeout: 10000,
        isHealthy: true,
        lastChecked: 0
      }
    ];
  }

  private async checkEndpointHealth(endpoint: RPCEndpoint): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      const controller = new AbortController();
      
      // Set timeout
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
      
      // Simple health check - get latest block number
      const blockNumber = await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('Timeout')));
        })
      ]);
      
      clearTimeout(timeoutId);
      
      // Consider healthy if we got a reasonable block number
      return typeof blockNumber === 'number' && blockNumber > 0;
    } catch (error) {
      console.warn(`RPC Health Check Failed for ${endpoint.name}:`, error);
      return false;
    }
  }

  private async startHealthChecking() {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      for (const endpoint of this.endpoints) {
        const isHealthy = await this.checkEndpointHealth(endpoint);
        endpoint.isHealthy = isHealthy;
        endpoint.lastChecked = Date.now();
        
        if (!isHealthy && this.currentProviderIndex === this.endpoints.indexOf(endpoint)) {
          // Current provider is unhealthy, switch to backup
          console.warn(`Current RPC provider ${endpoint.name} is unhealthy, switching to backup`);
          this.selectBestProvider();
        }
      }
    }, 30000);
  }

  private selectBestProvider() {
    // Sort by priority and health status
    const healthyEndpoints = this.endpoints
      .filter(endpoint => endpoint.isHealthy)
      .sort((a, b) => a.priority - b.priority);

    if (healthyEndpoints.length === 0) {
      console.error("No healthy RPC endpoints available! Using fallback.");
      this.currentProviderIndex = 0; // Use first endpoint as fallback
    } else {
      this.currentProviderIndex = this.endpoints.indexOf(healthyEndpoints[0]);
    }

    // Create new provider instance
    const selectedEndpoint = this.endpoints[this.currentProviderIndex];
    this.provider = new ethers.JsonRpcProvider(selectedEndpoint.url);
    
    console.log(`Selected RPC Provider: ${selectedEndpoint.name}`);
  }

  public getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      this.selectBestProvider();
    }
    return this.provider!;
  }

  public async executeWithFailover<T>(
    operation: (provider: ethers.JsonRpcProvider) => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const provider = this.getProvider();
        return await operation(provider);
      } catch (error) {
        lastError = error as Error;
        console.warn(`RPC operation failed (attempt ${attempt + 1}/${maxAttempts}):`, error);
        
        // Mark current provider as unhealthy and switch
        const currentEndpoint = this.endpoints[this.currentProviderIndex];
        currentEndpoint.isHealthy = false;
        this.selectBestProvider();
        
        // Wait a bit before retrying
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    throw new Error(`All RPC providers failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }

  public getHealthStatus() {
    return {
      currentProvider: this.endpoints[this.currentProviderIndex],
      healthyProviders: this.endpoints.filter(e => e.isHealthy).length,
      totalProviders: this.endpoints.length,
      endpoints: this.endpoints.map(e => ({
        name: e.name,
        isHealthy: e.isHealthy,
        priority: e.priority,
        lastChecked: e.lastChecked
      }))
    };
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Global instance
export const rpcProvider = new RPCFailoverProvider();

// Enhanced Web3 utilities with failover
export const web3Utils = {
  async getBalance(address: string): Promise<string> {
    return rpcProvider.executeWithFailover(async (provider) => {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    });
  },

  async getBlockNumber(): Promise<number> {
    return rpcProvider.executeWithFailover(async (provider) => {
      return await provider.getBlockNumber();
    });
  },

  async getGasPrice(): Promise<string> {
    return rpcProvider.executeWithFailover(async (provider) => {
      const gasPrice = await provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    });
  },

  async estimateGas(transaction: any): Promise<string> {
    return rpcProvider.executeWithFailover(async (provider) => {
      const estimate = await provider.estimateGas(transaction);
      return estimate.toString();
    });
  },

  async sendTransaction(transaction: any): Promise<string> {
    return rpcProvider.executeWithFailover(async (provider) => {
      const tx = await provider.sendTransaction(transaction);
      return tx.hash;
    });
  }
};
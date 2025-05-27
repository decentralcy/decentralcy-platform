import { ethers } from "ethers";
import { rpcProvider } from "./rpcProvider";

export interface GasData {
  slow: {
    gasPrice: string;
    estimatedTime: string;
    costUSD: string;
  };
  standard: {
    gasPrice: string;
    estimatedTime: string;
    costUSD: string;
  };
  fast: {
    gasPrice: string;
    estimatedTime: string;
    costUSD: string;
  };
  instant: {
    gasPrice: string;
    estimatedTime: string;
    costUSD: string;
  };
  currentBaseFee?: string;
  nextBaseFee?: string;
  timestamp: number;
}

export interface OptimizationSuggestion {
  type: 'save' | 'speed' | 'optimal' | 'warning';
  title: string;
  description: string;
  savings?: string;
  action?: string;
}

export class GasOptimizationService {
  private gasData: GasData | null = null;
  private ethPrice: number = 2000; // Default ETH price, will be updated
  private updateInterval: NodeJS.Timeout | null = null;
  private listeners: ((data: GasData) => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  private async startMonitoring() {
    // Update gas prices every 15 seconds
    this.updateInterval = setInterval(async () => {
      await this.updateGasData();
      await this.updateEthPrice();
    }, 15000);

    // Initial update
    await this.updateGasData();
    await this.updateEthPrice();
  }

  private async updateGasData() {
    try {
      const provider = rpcProvider.getProvider();
      const feeData = await provider.getFeeData();
      const block = await provider.getBlock("latest");

      if (!feeData.gasPrice) {
        throw new Error("Unable to fetch gas price");
      }

      const baseGasPrice = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
      const baseFee = block?.baseFeePerGas ? Number(ethers.formatUnits(block.baseFeePerGas, 'gwei')) : 0;

      // Calculate different speed tiers
      this.gasData = {
        slow: {
          gasPrice: (baseGasPrice * 0.85).toFixed(1),
          estimatedTime: "2-5 minutes",
          costUSD: this.calculateCostUSD(baseGasPrice * 0.85, 21000)
        },
        standard: {
          gasPrice: baseGasPrice.toFixed(1),
          estimatedTime: "1-2 minutes",
          costUSD: this.calculateCostUSD(baseGasPrice, 21000)
        },
        fast: {
          gasPrice: (baseGasPrice * 1.2).toFixed(1),
          estimatedTime: "30-60 seconds",
          costUSD: this.calculateCostUSD(baseGasPrice * 1.2, 21000)
        },
        instant: {
          gasPrice: (baseGasPrice * 1.5).toFixed(1),
          estimatedTime: "15-30 seconds",
          costUSD: this.calculateCostUSD(baseGasPrice * 1.5, 21000)
        },
        currentBaseFee: baseFee.toFixed(1),
        nextBaseFee: this.predictNextBaseFee(baseFee).toFixed(1),
        timestamp: Date.now()
      };

      // Notify listeners
      this.listeners.forEach(listener => listener(this.gasData!));

    } catch (error) {
      console.error("Failed to update gas data:", error);
    }
  }

  private async updateEthPrice() {
    try {
      // You can replace this with a real price API
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      this.ethPrice = data.ethereum?.usd || 2000;
    } catch (error) {
      console.warn("Failed to update ETH price, using cached value");
    }
  }

  private calculateCostUSD(gasPriceGwei: number, gasLimit: number): string {
    const ethCost = (gasPriceGwei * gasLimit) / 1e9;
    const usdCost = ethCost * this.ethPrice;
    return usdCost < 0.01 ? '<$0.01' : `$${usdCost.toFixed(2)}`;
  }

  private predictNextBaseFee(currentBaseFee: number): number {
    // Simple prediction based on network congestion
    // In reality, this would use block utilization data
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    return currentBaseFee * (1 + variation);
  }

  public getGasData(): GasData | null {
    return this.gasData;
  }

  public getOptimizationSuggestions(transactionType: 'simple' | 'contract' | 'defi'): OptimizationSuggestion[] {
    if (!this.gasData) return [];

    const suggestions: OptimizationSuggestion[] = [];
    const currentGas = parseFloat(this.gasData.standard.gasPrice);
    const slowGas = parseFloat(this.gasData.slow.gasPrice);
    const fastGas = parseFloat(this.gasData.fast.gasPrice);

    // Gas price level suggestions
    if (currentGas < 20) {
      suggestions.push({
        type: 'optimal',
        title: 'Great Time to Transact!',
        description: 'Gas prices are currently low. Perfect time for transactions.',
        action: 'Use Standard Speed'
      });
    } else if (currentGas > 50) {
      suggestions.push({
        type: 'warning',
        title: 'High Gas Prices',
        description: 'Consider waiting or using Layer 2 solutions to save on fees.',
        savings: `Save up to ${((currentGas - slowGas) / currentGas * 100).toFixed(0)}%`,
        action: 'Wait or Use L2'
      });
    }

    // Transaction type specific suggestions
    if (transactionType === 'simple') {
      suggestions.push({
        type: 'save',
        title: 'Use Slow Speed for Simple Transfers',
        description: 'Simple ETH transfers can use slower speeds safely.',
        savings: this.calculateSavings(fastGas, slowGas),
        action: 'Select Slow Speed'
      });
    } else if (transactionType === 'defi') {
      suggestions.push({
        type: 'speed',
        title: 'Consider Fast Speed for DeFi',
        description: 'DeFi transactions benefit from faster confirmation to avoid slippage.',
        action: 'Use Fast Speed'
      });
    }

    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 18) { // UTC peak hours
      suggestions.push({
        type: 'warning',
        title: 'Peak Hours Detected',
        description: 'Gas prices are typically higher during US business hours.',
        action: 'Consider waiting until later'
      });
    }

    return suggestions;
  }

  private calculateSavings(highPrice: number, lowPrice: number): string {
    const savings = ((highPrice - lowPrice) / highPrice * 100);
    return `${savings.toFixed(0)}% savings`;
  }

  public subscribeToUpdates(callback: (data: GasData) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async estimateTransactionCost(
    to: string, 
    data: string = "0x", 
    value: string = "0"
  ): Promise<{
    gasLimit: string;
    costs: {
      slow: string;
      standard: string;
      fast: string;
      instant: string;
    };
  }> {
    const provider = rpcProvider.getProvider();
    
    // Estimate gas limit
    const gasLimit = await provider.estimateGas({
      to,
      data,
      value: ethers.parseEther(value || "0")
    });

    const gasLimitNumber = Number(gasLimit);
    
    if (!this.gasData) {
      throw new Error("Gas data not available");
    }

    return {
      gasLimit: gasLimit.toString(),
      costs: {
        slow: this.calculateCostUSD(parseFloat(this.gasData.slow.gasPrice), gasLimitNumber),
        standard: this.calculateCostUSD(parseFloat(this.gasData.standard.gasPrice), gasLimitNumber),
        fast: this.calculateCostUSD(parseFloat(this.gasData.fast.gasPrice), gasLimitNumber),
        instant: this.calculateCostUSD(parseFloat(this.gasData.instant.gasPrice), gasLimitNumber)
      }
    };
  }

  public destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.listeners = [];
  }
}

// Global instance
export const gasOptimizer = new GasOptimizationService();
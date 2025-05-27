import { ethers } from "ethers";
import { rpcProvider } from "../client/src/lib/rpcProvider";

interface MonitoringAlert {
  id: string;
  type: 'security' | 'performance' | 'financial' | 'governance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  contractAddress: string;
  transactionHash?: string;
  timestamp: number;
  resolved: boolean;
}

interface ContractMetrics {
  totalJobs: number;
  totalVolume: string;
  activeJobs: number;
  failedTransactions: number;
  averageGasUsed: string;
  lastActivity: number;
}

export class ContractMonitoringService {
  private alerts: MonitoringAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private contracts: Map<string, any> = new Map();
  private metrics: Map<string, ContractMetrics> = new Map();

  // Contract addresses (will be populated after deployment)
  private contractAddresses = {
    tempAgencyEscrow: process.env.TEMP_AGENCY_ESCROW_ADDRESS || '',
    multiTokenPayment: process.env.MULTI_TOKEN_PAYMENT_ADDRESS || '',
    decentralcyToken: process.env.DECENTRALCY_TOKEN_ADDRESS || ''
  };

  async startMonitoring(): Promise<void> {
    console.log('🔍 Starting contract monitoring system...');
    
    // Initialize contract instances
    await this.initializeContracts();
    
    // Start monitoring loops
    this.monitoringInterval = setInterval(async () => {
      await this.performSecurityChecks();
      await this.updateMetrics();
      await this.checkForAnomalies();
    }, 30000); // Check every 30 seconds

    console.log('✅ Contract monitoring active');
  }

  private async initializeContracts(): Promise<void> {
    const provider = rpcProvider.getProvider();

    // TempAgencyEscrow ABI (minimal for monitoring)
    const escrowABI = [
      "event JobCreated(uint256 indexed jobId, address indexed employer, uint256 amount)",
      "event JobCompleted(uint256 indexed jobId, address indexed worker)",
      "event DisputeRaised(uint256 indexed jobId, address indexed raiser)",
      "event EmergencyPause(address indexed admin)",
      "function paused() view returns (bool)",
      "function totalJobs() view returns (uint256)",
      "function getJobDetails(uint256) view returns (uint256, address, address, uint8)"
    ];

    // MultiTokenPayment ABI
    const paymentABI = [
      "event PaymentProcessed(address indexed token, uint256 amount, address indexed to)",
      "event TokenAdded(address indexed token)",
      "function supportedTokens(address) view returns (bool)"
    ];

    // DecentralcyToken ABI
    const tokenABI = [
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)"
    ];

    if (this.contractAddresses.tempAgencyEscrow) {
      this.contracts.set('escrow', new ethers.Contract(
        this.contractAddresses.tempAgencyEscrow,
        escrowABI,
        provider
      ));
    }

    if (this.contractAddresses.multiTokenPayment) {
      this.contracts.set('payment', new ethers.Contract(
        this.contractAddresses.multiTokenPayment,
        paymentABI,
        provider
      ));
    }

    if (this.contractAddresses.decentralcyToken) {
      this.contracts.set('token', new ethers.Contract(
        this.contractAddresses.decentralcyToken,
        tokenABI,
        provider
      ));
    }
  }

  private async performSecurityChecks(): Promise<void> {
    try {
      // Check if contracts are paused
      const escrowContract = this.contracts.get('escrow');
      if (escrowContract) {
        const isPaused = await escrowContract.paused();
        if (isPaused) {
          this.createAlert({
            type: 'security',
            severity: 'critical',
            title: 'Contract Paused',
            description: 'TempAgencyEscrow contract is currently paused',
            contractAddress: this.contractAddresses.tempAgencyEscrow
          });
        }
      }

      // Check for unusual gas usage
      await this.checkGasUsagePatterns();

      // Monitor for large transactions
      await this.monitorLargeTransactions();

    } catch (error) {
      console.error('Security check failed:', error);
      this.createAlert({
        type: 'performance',
        severity: 'medium',
        title: 'Monitoring Error',
        description: `Security check failed: ${error}`,
        contractAddress: 'system'
      });
    }
  }

  private async updateMetrics(): Promise<void> {
    try {
      const escrowContract = this.contracts.get('escrow');
      if (escrowContract) {
        const totalJobs = await escrowContract.totalJobs();
        
        const metrics: ContractMetrics = {
          totalJobs: Number(totalJobs),
          totalVolume: '0', // Would calculate from events
          activeJobs: 0, // Would calculate from job statuses
          failedTransactions: 0,
          averageGasUsed: '150000',
          lastActivity: Date.now()
        };

        this.metrics.set('escrow', metrics);
      }
    } catch (error) {
      console.warn('Failed to update metrics:', error);
    }
  }

  private async checkForAnomalies(): Promise<void> {
    // Check for unusual patterns
    const escrowMetrics = this.metrics.get('escrow');
    if (escrowMetrics) {
      // Check if no activity for too long (6 hours)
      const sixHours = 6 * 60 * 60 * 1000;
      if (Date.now() - escrowMetrics.lastActivity > sixHours) {
        this.createAlert({
          type: 'performance',
          severity: 'medium',
          title: 'Low Activity Detected',
          description: 'No contract activity detected for over 6 hours',
          contractAddress: this.contractAddresses.tempAgencyEscrow
        });
      }

      // Check for high failure rate
      if (escrowMetrics.failedTransactions > 10) {
        this.createAlert({
          type: 'performance',
          severity: 'high',
          title: 'High Transaction Failure Rate',
          description: `${escrowMetrics.failedTransactions} failed transactions detected`,
          contractAddress: this.contractAddresses.tempAgencyEscrow
        });
      }
    }
  }

  private async checkGasUsagePatterns(): Promise<void> {
    // Monitor gas usage for potential attacks
    const provider = rpcProvider.getProvider();
    const latestBlock = await provider.getBlock('latest');
    
    if (latestBlock?.transactions) {
      for (const txHash of latestBlock.transactions.slice(0, 10)) {
        try {
          const tx = await provider.getTransaction(txHash);
          if (tx && this.isOurContract(tx.to)) {
            const gasUsed = Number(tx.gasLimit);
            if (gasUsed > 1000000) { // > 1M gas
              this.createAlert({
                type: 'security',
                severity: 'high',
                title: 'High Gas Usage Transaction',
                description: `Transaction using ${gasUsed} gas detected`,
                contractAddress: tx.to || 'unknown',
                transactionHash: txHash
              });
            }
          }
        } catch (error) {
          // Skip failed transaction lookups
        }
      }
    }
  }

  private async monitorLargeTransactions(): Promise<void> {
    // Monitor for unusually large value transfers
    const provider = rpcProvider.getProvider();
    
    try {
      const tokenContract = this.contracts.get('token');
      if (tokenContract) {
        // Listen for large token transfers (simulated for now)
        const largeTransferThreshold = ethers.parseEther("10000"); // 10k tokens
        
        // In production, this would use event filters
        // const filter = tokenContract.filters.Transfer();
        // const events = await tokenContract.queryFilter(filter, -100);
      }
    } catch (error) {
      console.warn('Large transaction monitoring failed:', error);
    }
  }

  private isOurContract(address: string | null): boolean {
    if (!address) return false;
    return Object.values(this.contractAddresses).includes(address.toLowerCase());
  }

  private createAlert(alertData: Omit<MonitoringAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: MonitoringAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);

    // Log critical alerts immediately
    if (alert.severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${alert.title} - ${alert.description}`);
      this.sendImmediateNotification(alert);
    } else if (alert.severity === 'high') {
      console.warn(`⚠️ HIGH SEVERITY: ${alert.title} - ${alert.description}`);
    }

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  private async sendImmediateNotification(alert: MonitoringAlert): Promise<void> {
    // In production, this would:
    // 1. Send email/SMS to administrators
    // 2. Post to Discord/Slack channels
    // 3. Trigger PagerDuty alerts
    // 4. Update status page
    
    console.log(`📧 Sending immediate notification for: ${alert.title}`);
    
    // For now, we'll simulate notification
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  public getAlerts(severity?: string): MonitoringAlert[] {
    if (severity) {
      return this.alerts.filter(alert => alert.severity === severity && !alert.resolved);
    }
    return this.alerts.filter(alert => !alert.resolved);
  }

  public getMetrics(): Map<string, ContractMetrics> {
    return new Map(this.metrics);
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alert resolved: ${alert.title}`);
      return true;
    }
    return false;
  }

  public getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    activeAlerts: number;
    criticalAlerts: number;
    lastCheck: number;
  } {
    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (activeAlerts.filter(a => a.severity === 'high').length > 0) {
      status = 'warning';
    }

    return {
      status,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      lastCheck: Date.now()
    };
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Contract monitoring stopped');
    }
  }

  // OpenZeppelin Defender integration setup
  public generateDefenderConfig(): any {
    return {
      contracts: [
        {
          name: "TempAgencyEscrow",
          address: this.contractAddresses.tempAgencyEscrow,
          abi: [], // Would include full ABI
          network: "mainnet", // or testnet
          monitors: [
            {
              type: "event",
              events: ["JobCreated", "JobCompleted", "DisputeRaised", "EmergencyPause"],
              severity: "medium"
            },
            {
              type: "function",
              functions: ["pause", "unpause"],
              severity: "critical"
            }
          ]
        },
        {
          name: "MultiTokenPayment", 
          address: this.contractAddresses.multiTokenPayment,
          monitors: [
            {
              type: "event",
              events: ["PaymentProcessed"],
              conditions: {
                amount: { gt: "1000000000000000000000" } // > 1000 tokens
              },
              severity: "high"
            }
          ]
        }
      ],
      notifications: [
        {
          type: "discord",
          webhook: process.env.DISCORD_WEBHOOK_URL
        },
        {
          type: "email",
          emails: [process.env.ADMIN_EMAIL]
        }
      ]
    };
  }
}

export const contractMonitoring = new ContractMonitoringService();
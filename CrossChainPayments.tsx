import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowRightLeft, 
  Globe, 
  Zap, 
  DollarSign, 
  Clock, 
  Shield,
  TrendingDown,
  Network,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

interface CrossChainPaymentsProps {
  userAddress: string;
  isConnected: boolean;
  jobPaymentAmount: string;
  onPaymentComplete?: (txHash: string) => void;
}

interface SupportedChain {
  id: number;
  name: string;
  symbol: string;
  logo: string;
  rpcUrl: string;
  gasPrice: string;
  avgConfirmTime: string;
  bridgeFee: string;
  color: string;
  isTestnet?: boolean;
}

interface PaymentRoute {
  fromChain: SupportedChain;
  toChain: SupportedChain;
  estimatedTime: string;
  totalFees: string;
  steps: PaymentStep[];
}

interface PaymentStep {
  id: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  estimatedTime: string;
}

export default function CrossChainPayments({ 
  userAddress, 
  isConnected, 
  jobPaymentAmount,
  onPaymentComplete 
}: CrossChainPaymentsProps) {
  const [selectedFromChain, setSelectedFromChain] = useState<SupportedChain | null>(null);
  const [selectedToChain, setSelectedToChain] = useState<SupportedChain | null>(null);
  const [paymentRoute, setPaymentRoute] = useState<PaymentRoute | null>(null);
  const [bridgeProgress, setBridgeProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Supported blockchain networks
  const supportedChains: SupportedChain[] = [
    {
      id: 1,
      name: "Ethereum Mainnet",
      symbol: "ETH",
      logo: "⟠",
      rpcUrl: "https://mainnet.infura.io/v3/",
      gasPrice: "25 gwei",
      avgConfirmTime: "~15 sec",
      bridgeFee: "0.005 ETH",
      color: "bg-blue-500"
    },
    {
      id: 137,
      name: "Polygon",
      symbol: "MATIC",
      logo: "⬟",
      rpcUrl: "https://polygon-rpc.com/",
      gasPrice: "30 gwei",
      avgConfirmTime: "~2 sec",
      bridgeFee: "0.001 ETH",
      color: "bg-purple-500"
    },
    {
      id: 42161,
      name: "Arbitrum One",
      symbol: "ARB",
      logo: "◉",
      rpcUrl: "https://arb1.arbitrum.io/rpc",
      gasPrice: "0.1 gwei",
      avgConfirmTime: "~1 sec",
      bridgeFee: "0.002 ETH",
      color: "bg-blue-600"
    },
    {
      id: 10,
      name: "Optimism",
      symbol: "OP",
      logo: "🔴",
      rpcUrl: "https://mainnet.optimism.io",
      gasPrice: "0.001 gwei",
      avgConfirmTime: "~2 sec",
      bridgeFee: "0.003 ETH",
      color: "bg-red-500"
    },
    {
      id: 56,
      name: "BNB Smart Chain",
      symbol: "BNB",
      logo: "🟡",
      rpcUrl: "https://bsc-dataseed.binance.org/",
      gasPrice: "5 gwei",
      avgConfirmTime: "~3 sec",
      bridgeFee: "0.002 ETH",
      color: "bg-yellow-500"
    },
    {
      id: 43114,
      name: "Avalanche C-Chain",
      symbol: "AVAX",
      logo: "🔺",
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: "25 nAVAX",
      avgConfirmTime: "~2 sec",
      bridgeFee: "0.004 ETH",
      color: "bg-red-600"
    }
  ];

  // Calculate payment route when chains are selected
  useEffect(() => {
    if (selectedFromChain && selectedToChain && selectedFromChain.id !== selectedToChain.id) {
      calculatePaymentRoute();
    }
  }, [selectedFromChain, selectedToChain]);

  const calculatePaymentRoute = () => {
    if (!selectedFromChain || !selectedToChain) return;

    // Simulate route calculation
    const route: PaymentRoute = {
      fromChain: selectedFromChain,
      toChain: selectedToChain,
      estimatedTime: "5-15 minutes",
      totalFees: calculateTotalFees(),
      steps: [
        {
          id: "1",
          description: `Lock funds on ${selectedFromChain.name}`,
          status: "pending",
          estimatedTime: "1-2 minutes"
        },
        {
          id: "2", 
          description: "Cross-chain bridge verification",
          status: "pending",
          estimatedTime: "3-10 minutes"
        },
        {
          id: "3",
          description: `Release funds on ${selectedToChain.name}`,
          status: "pending", 
          estimatedTime: "1-3 minutes"
        }
      ]
    };

    setPaymentRoute(route);
  };

  const calculateTotalFees = () => {
    if (!selectedFromChain || !selectedToChain) return "0";
    
    const bridgeFee = parseFloat(selectedFromChain.bridgeFee);
    const gasFee = 0.002; // Estimated gas
    return (bridgeFee + gasFee).toFixed(4) + " ETH";
  };

  const executeCrossChainPayment = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      setBridgeProgress(0);
      
      if (!paymentRoute) throw new Error("No payment route calculated");

      // Simulate cross-chain payment process
      for (let i = 0; i < paymentRoute.steps.length; i++) {
        const step = paymentRoute.steps[i];
        
        // Update step status
        paymentRoute.steps[i].status = "processing";
        setPaymentRoute({ ...paymentRoute });
        
        // Simulate processing time
        await new Promise(resolve => {
          const duration = 2000 + Math.random() * 3000; // 2-5 seconds
          let progress = (i / paymentRoute.steps.length) * 100;
          
          const interval = setInterval(() => {
            progress += 2;
            setBridgeProgress(Math.min(progress, ((i + 1) / paymentRoute.steps.length) * 100));
          }, 100);
          
          setTimeout(() => {
            clearInterval(interval);
            resolve(void 0);
          }, duration);
        });
        
        // Complete step
        paymentRoute.steps[i].status = "completed";
        paymentRoute.steps[i].txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        setPaymentRoute({ ...paymentRoute });
        
        setBridgeProgress(((i + 1) / paymentRoute.steps.length) * 100);
      }
      
      return "0x" + Math.random().toString(16).substr(2, 64);
    },
    onSuccess: (txHash) => {
      toast({
        title: "Cross-Chain Payment Successful!",
        description: `Payment bridged from ${selectedFromChain?.name} to ${selectedToChain?.name}`,
      });
      onPaymentComplete?.(txHash);
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Cross-Chain Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const switchToChain = async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      toast({
        title: "Network Switched",
        description: `Switched to ${supportedChains.find(c => c.id === chainId)?.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" />
            Cross-Chain Payments
          </CardTitle>
          <CardDescription>
            Pay workers across multiple blockchains with automatic bridging and lowest fees
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chain Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">From Network</CardTitle>
            <CardDescription>Select your source blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => {
              const chain = supportedChains.find(c => c.id.toString() === value);
              setSelectedFromChain(chain || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{chain.logo}</span>
                      <div>
                        <div className="font-medium">{chain.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Gas: {chain.gasPrice} • {chain.avgConfirmTime}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFromChain && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Network Fee:</span>
                  <span className="font-medium">{selectedFromChain.gasPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Bridge Fee:</span>
                  <span className="font-medium">{selectedFromChain.bridgeFee}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">To Network</CardTitle>
            <CardDescription>Select destination blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => {
              const chain = supportedChains.find(c => c.id.toString() === value);
              setSelectedToChain(chain || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{chain.logo}</span>
                      <div>
                        <div className="font-medium">{chain.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Gas: {chain.gasPrice} • {chain.avgConfirmTime}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedToChain && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>Network Fee:</span>
                  <span className="font-medium">{selectedToChain.gasPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Confirmation Time:</span>
                  <span className="font-medium">{selectedToChain.avgConfirmTime}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Route */}
      {paymentRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Payment Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Summary */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Payment Amount</span>
                </div>
                <div className="text-lg font-bold">{jobPaymentAmount} ETH</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Total Fees</span>
                </div>
                <div className="text-lg font-bold">{paymentRoute.totalFees}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Est. Time</span>
                </div>
                <div className="text-lg font-bold">{paymentRoute.estimatedTime}</div>
              </div>
            </div>

            {/* Bridge Progress */}
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bridge Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(bridgeProgress)}%</span>
                </div>
                <Progress value={bridgeProgress} className="h-3" />
              </div>
            )}

            {/* Payment Steps */}
            <div className="space-y-3">
              <h4 className="font-medium">Payment Steps</h4>
              {paymentRoute.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Expected: {step.estimatedTime}
                    </p>
                    {step.txHash && (
                      <p className="text-xs font-mono text-blue-600 mt-1">
                        TX: {step.txHash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant={
                      step.status === "completed" ? "default" :
                      step.status === "processing" ? "secondary" :
                      step.status === "failed" ? "destructive" : "outline"
                    }>
                      {step.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Execute Payment */}
            <div className="pt-4 border-t">
              <Button 
                onClick={() => executeCrossChainPayment.mutate()}
                disabled={isProcessing || !isConnected}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Bridging Payment...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Cross-Chain Payment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
              Cross-Chain Revolution
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Break free from single-chain limitations! Pay workers on their preferred networks, 
              enjoy lower fees on Layer 2s, and access global talent without network barriers.
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center justify-center gap-2">
                <Network className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">6+ Networks</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Up to 99% Lower Fees</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Trustless Bridging</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
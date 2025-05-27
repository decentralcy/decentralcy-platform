import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bitcoin,
  DollarSign,
  Zap,
  Shield,
  TrendingUp,
  Wallet,
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiChainPaymentGatewayProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface PaymentToken {
  symbol: string;
  name: string;
  icon: string;
  network: string;
  address: string;
  decimals: number;
  currentPrice: number;
  balance: number;
  gasOptimized: boolean;
  instantSettlement: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  fees: string;
  settlementTime: string;
  supported: boolean;
  networks: string[];
}

interface Transaction {
  id: string;
  type: 'payment' | 'received' | 'escrow';
  amount: number;
  token: string;
  network: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
  timestamp: string;
  counterparty: string;
  description: string;
}

export default function MultiChainPaymentGateway({ 
  userAddress, 
  isConnected, 
  userType 
}: MultiChainPaymentGatewayProps) {
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Supported payment tokens across multiple chains
  const supportedTokens: PaymentToken[] = [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '💲',
      network: 'ethereum',
      address: '0xA0b86a33E6441E85e5DE448C9F7899A90B1e03B8',
      decimals: 6,
      currentPrice: 1.00,
      balance: 2500.50,
      gasOptimized: true,
      instantSettlement: true
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: '🔶',
      network: 'ethereum',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      currentPrice: 1.00,
      balance: 1850.25,
      gasOptimized: true,
      instantSettlement: true
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '♦️',
      network: 'ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      currentPrice: 2247.83,
      balance: 0.85,
      gasOptimized: false,
      instantSettlement: true
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      network: 'bitcoin',
      address: 'native',
      decimals: 8,
      currentPrice: 42150.00,
      balance: 0.025,
      gasOptimized: true,
      instantSettlement: false
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      icon: '🔺',
      network: 'polygon',
      address: '0x0000000000000000000000000000000000001010',
      decimals: 18,
      currentPrice: 0.82,
      balance: 500.00,
      gasOptimized: true,
      instantSettlement: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Polygon)',
      icon: '💲',
      network: 'polygon',
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
      currentPrice: 1.00,
      balance: 750.00,
      gasOptimized: true,
      instantSettlement: true
    }
  ];

  // Payment methods with different features
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Wallet,
      description: 'Pay with Bitcoin, Ethereum, USDC, DAI, and other cryptocurrencies',
      fees: '0.5% - 2.5%',
      settlementTime: 'Instant to 30 minutes',
      supported: true,
      networks: ['Ethereum', 'Bitcoin', 'Polygon', 'Arbitrum', 'Optimism']
    },
    {
      id: 'lightning',
      name: 'Lightning Network',
      icon: Zap,
      description: 'Ultra-fast Bitcoin payments with minimal fees',
      fees: '< $0.01',
      settlementTime: 'Instant',
      supported: true,
      networks: ['Bitcoin Lightning']
    },
    {
      id: 'stablecoin',
      name: 'Stablecoins',
      icon: DollarSign,
      description: 'Stable value payments with USDC, DAI, and USDT',
      fees: '0.1% - 1%',
      settlementTime: 'Instant',
      supported: true,
      networks: ['Ethereum', 'Polygon', 'Arbitrum']
    }
  ];

  // Mock transaction history
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'received',
      amount: 2500,
      token: 'USDC',
      network: 'ethereum',
      status: 'confirmed',
      hash: '0x8f4e...9b2c',
      timestamp: '2024-01-15 14:30',
      counterparty: 'DeFi Protocol Inc.',
      description: 'Payment for Smart Contract Audit project'
    },
    {
      id: '2',
      type: 'payment',
      amount: 500,
      token: 'DAI',
      network: 'ethereum',
      status: 'confirmed',
      hash: '0x3c7a...5f8e',
      timestamp: '2024-01-12 09:15',
      counterparty: 'Platform Fee',
      description: 'Monthly premium subscription'
    },
    {
      id: '3',
      type: 'escrow',
      amount: 1250,
      token: 'USDC',
      network: 'polygon',
      status: 'pending',
      hash: '0x1d5c...8e2f',
      timestamp: '2024-01-10 16:45',
      counterparty: 'NFT Marketplace',
      description: 'Escrow for Frontend Development project'
    }
  ];

  useEffect(() => {
    if (isConnected) {
      setTransactions(mockTransactions);
    }
  }, [isConnected]);

  const calculateUSDValue = (amount: number, token: string): number => {
    const tokenData = supportedTokens.find(t => t.symbol === token);
    return tokenData ? amount * tokenData.currentPrice : 0;
  };

  const processPayment = async () => {
    if (!paymentAmount || !recipientAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and recipient address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'payment',
        amount: parseFloat(paymentAmount),
        token: selectedToken,
        network: selectedNetwork,
        status: 'pending',
        hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        timestamp: new Date().toLocaleString(),
        counterparty: recipientAddress.slice(0, 6) + '...' + recipientAddress.slice(-4),
        description: `Payment sent via ${selectedNetwork}`
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setIsProcessing(false);
      setPaymentAmount('');
      setRecipientAddress('');

      toast({
        title: "🚀 Payment Initiated!",
        description: `Sending ${paymentAmount} ${selectedToken} on ${selectedNetwork}`,
      });

      // Simulate confirmation after a delay
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === newTransaction.id 
              ? { ...tx, status: 'confirmed' as const }
              : tx
          )
        );
        
        toast({
          title: "✅ Payment Confirmed!",
          description: "Transaction has been confirmed on the blockchain",
        });
      }, 10000);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            Multi-Chain Payment Gateway
          </CardTitle>
          <CardDescription>
            Connect your wallet to access multi-chain cryptocurrency payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect Wallet for Payments</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Gateway Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-blue-600" />
                Multi-Chain Payment Gateway
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
              </CardTitle>
              <CardDescription>
                Send and receive payments across multiple blockchain networks
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-muted-foreground">Networks</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">$5,247.58</div>
              <div className="text-sm text-muted-foreground">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Supported Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">0.5%</div>
              <div className="text-sm text-muted-foreground">Average Fees</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">Instant</div>
              <div className="text-sm text-muted-foreground">Settlement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Your Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportedTokens.map((token, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{token.icon}</span>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.network}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{token.balance.toFixed(token.decimals <= 8 ? token.decimals : 2)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${calculateUSDValue(token.balance, token.symbol).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {token.gasOptimized && (
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Low Fees
                      </Badge>
                    )}
                    {token.instantSettlement && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Instant
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-blue-600" />
            Send Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Token</label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedTokens.map((token) => (
                      <SelectItem key={`${token.symbol}-${token.network}`} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{token.icon}</span>
                          <span>{token.symbol}</span>
                          <span className="text-xs text-muted-foreground">({token.network})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-3 border rounded-lg pr-20"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {selectedToken}
                </span>
              </div>
              {paymentAmount && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${calculateUSDValue(parseFloat(paymentAmount), selectedToken).toFixed(2)} USD
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Address</label>
              <input
                type="text"
                placeholder="0x... or wallet address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <Button 
              onClick={processPayment} 
              disabled={isProcessing || !paymentAmount || !recipientAddress}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Send Payment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const MethodIcon = method.icon;
              return (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MethodIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>Fees: {method.fees}</span>
                        <span>Settlement: {method.settlementTime}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={method.supported ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {method.supported ? 'Available' : 'Coming Soon'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <div>
                      <div className="font-medium">
                        {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.token}
                      </div>
                      <div className="text-sm text-muted-foreground">{tx.description}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(tx.status)}>
                    {tx.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{tx.timestamp}</div>
                  <Button variant="ghost" size="sm" className="text-xs mt-1">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Coins, DollarSign, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";
import { SUPPORTED_TOKENS } from "./TokenSelector";

interface MultiTokenDashboardProps {
  userAddress: string;
}

interface TokenBalance {
  token: typeof SUPPORTED_TOKENS[0];
  balance: string;
  usdValue: string;
  change24h: number;
}

interface Transaction {
  id: string;
  type: "received" | "sent" | "escrow";
  token: string;
  amount: string;
  usdValue: string;
  from?: string;
  to?: string;
  jobTitle?: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
}

export default function MultiTokenDashboard({ userAddress }: MultiTokenDashboardProps) {
  // Mock data - in production, this would come from blockchain and price APIs
  const tokenBalances: TokenBalance[] = [
    {
      token: SUPPORTED_TOKENS[0], // ETH
      balance: "2.45",
      usdValue: "4,900.00",
      change24h: 3.2
    },
    {
      token: SUPPORTED_TOKENS[1], // WBTC
      balance: "0.1143",
      usdValue: "4,915.00",
      change24h: 1.8
    },
    {
      token: SUPPORTED_TOKENS[2], // USDC
      balance: "1,250.00",
      usdValue: "1,250.00",
      change24h: 0.1
    },
    {
      token: SUPPORTED_TOKENS[3], // DAI
      balance: "875.50",
      usdValue: "875.50",
      change24h: -0.1
    },
    {
      token: SUPPORTED_TOKENS[4], // USDT
      balance: "500.00",
      usdValue: "500.00",
      change24h: 0.0
    }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: "1",
      type: "received",
      token: "WBTC",
      amount: "0.0234",
      usdValue: "1,005.00",
      from: "0x1234...5678",
      jobTitle: "DeFi Protocol Audit",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "completed"
    },
    {
      id: "2",
      type: "sent",
      token: "USDC",
      amount: "150.00",
      usdValue: "150.00",
      to: "0x9876...4321",
      jobTitle: "Logo Design Project",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "completed"
    },
    {
      id: "3",
      type: "escrow",
      token: "ETH",
      amount: "0.75",
      usdValue: "1,500.00",
      jobTitle: "Smart Contract Development",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "pending"
    },
    {
      id: "4",
      type: "received",
      token: "DAI",
      amount: "500.00",
      usdValue: "500.00",
      from: "0x5555...6666",
      jobTitle: "Content Writing",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "completed"
    }
  ];

  const totalPortfolioValue = tokenBalances.reduce((sum, balance) => 
    sum + parseFloat(balance.usdValue.replace(/,/g, "")), 0
  );

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "WBTC":
        return <Bitcoin className="w-5 h-5 text-orange-500" />;
      case "ETH":
        return <span className="text-lg">⟐</span>;
      case "USDC":
        return <span className="text-lg">🔵</span>;
      case "DAI":
        return <span className="text-lg">🟡</span>;
      case "USDT":
        return <span className="text-lg">🟢</span>;
      default:
        return <Coins className="w-5 h-5" />;
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "pending") return <Shield className="w-4 h-4 text-yellow-500" />;
    if (type === "received") return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
    if (type === "sent") return <ArrowUpRight className="w-4 h-4 text-red-500" />;
    return <Shield className="w-4 h-4 text-blue-500" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+2.1% (24h)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bitcoin Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              <span className="font-bold">0.1143 WBTC</span>
            </div>
            <div className="text-sm text-muted-foreground">$4,915.00</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stablecoin Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold mb-2">$2,625.50</div>
            <div className="text-sm text-muted-foreground">USDC + DAI + USDT</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balances">Token Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="analytics">Payment Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <div className="grid gap-4">
            {tokenBalances.map((balance, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTokenIcon(balance.token.symbol)}
                      <div>
                        <div className="font-medium">{balance.token.name}</div>
                        <div className="text-sm text-muted-foreground">{balance.token.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold">{balance.balance} {balance.token.symbol}</div>
                      <div className="text-sm text-muted-foreground">${balance.usdValue}</div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={balance.change24h >= 0 ? "default" : "destructive"}>
                        {balance.change24h >= 0 ? "+" : ""}{balance.change24h}%
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Portfolio allocation bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Portfolio allocation</span>
                      <span>{((parseFloat(balance.usdValue.replace(/,/g, "")) / totalPortfolioValue) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(parseFloat(balance.usdValue.replace(/,/g, "")) / totalPortfolioValue) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type, tx.status)}
                      <div>
                        <div className="font-medium">
                          {tx.type === "received" ? "Payment Received" : 
                           tx.type === "sent" ? "Payment Sent" : "Escrow Locked"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.jobTitle && `${tx.jobTitle} • `}
                          {formatTimeAgo(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getTokenIcon(tx.token)}
                        <span className="font-bold">
                          {tx.type === "sent" ? "-" : tx.type === "received" ? "+" : "🔒"} {tx.amount} {tx.token}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">${tx.usdValue}</div>
                    </div>
                    
                    <Badge 
                      variant={
                        tx.status === "completed" ? "default" : 
                        tx.status === "pending" ? "secondary" : "destructive"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </div>
                  
                  {(tx.from || tx.to) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {tx.from && `From: ${tx.from}`}
                      {tx.to && `To: ${tx.to}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Methods Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Usage</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Bitcoin (WBTC)</span>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔵</span>
                      <span className="text-sm">USDC</span>
                    </div>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⟐</span>
                      <span className="text-sm">Ethereum</span>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Earnings by Token */}
            <Card>
              <CardHeader>
                <CardTitle>Total Earnings</CardTitle>
                <CardDescription>All-time by token</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">WBTC</span>
                  </div>
                  <span className="font-medium">$12,450</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔵</span>
                    <span className="text-sm">USDC</span>
                  </div>
                  <span className="font-medium">$8,950</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⟐</span>
                    <span className="text-sm">ETH</span>
                  </div>
                  <span className="font-medium">$6,700</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🟡</span>
                    <span className="text-sm">DAI</span>
                  </div>
                  <span className="font-medium">$3,200</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revolutionary Message */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Bitcoin className="w-8 h-8 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    Bitcoin + Multi-Token Revolution
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You're pioneering the future of work payments. No traditional banks, no centralized control - 
                    just direct Bitcoin and cryptocurrency payments secured by blockchain technology.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      View All Transactions
                    </Button>
                    <Button size="sm">
                      Export Payment History
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
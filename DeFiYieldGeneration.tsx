import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Coins, 
  Shield, 
  Zap, 
  Target,
  ArrowUpRight,
  PieChart,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeFiYieldGenerationProps {
  userAddress: string;
  isConnected: boolean;
  escrowedJobs: any[];
}

interface YieldProtocol {
  id: string;
  name: string;
  protocol: string;
  logo: string;
  apy: number;
  tvl: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  minDeposit: string;
  lockPeriod: string;
  autoCompounding: boolean;
  rewards: string[];
}

interface YieldPosition {
  id: string;
  jobId: number;
  jobTitle: string;
  principal: string;
  protocol: YieldProtocol;
  deposited: string;
  currentValue: string;
  yield: string;
  apy: number;
  depositedAt: Date;
  estimatedCompletion: Date;
  status: 'active' | 'matured' | 'withdrawn';
}

export default function DeFiYieldGeneration({ 
  userAddress, 
  isConnected, 
  escrowedJobs 
}: DeFiYieldGenerationProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<YieldProtocol | null>(null);
  const [yieldPositions, setYieldPositions] = useState<YieldPosition[]>([]);
  const { toast } = useToast();

  // DeFi protocols for yield generation
  const yieldProtocols: YieldProtocol[] = [
    {
      id: "aave",
      name: "Aave V3",
      protocol: "Aave",
      logo: "👻",
      apy: 4.2,
      tvl: "$8.2B",
      riskLevel: "low",
      description: "Blue-chip lending protocol with battle-tested security",
      minDeposit: "0.01 ETH",
      lockPeriod: "None",
      autoCompounding: true,
      rewards: ["Interest on deposits", "Safety module rewards"]
    },
    {
      id: "compound",
      name: "Compound V3",
      protocol: "Compound", 
      logo: "🏦",
      apy: 3.8,
      tvl: "$2.1B",
      riskLevel: "low",
      description: "Established lending market with governance tokens",
      minDeposit: "0.01 ETH",
      lockPeriod: "None",
      autoCompounding: false,
      rewards: ["COMP tokens", "Interest earnings"]
    },
    {
      id: "lido",
      name: "Lido Staking",
      protocol: "Lido",
      logo: "🔥",
      apy: 5.1,
      tvl: "$14.8B",
      riskLevel: "medium",
      description: "Liquid staking with stETH tokens for Ethereum 2.0",
      minDeposit: "0.01 ETH",
      lockPeriod: "Flexible",
      autoCompounding: true,
      rewards: ["ETH 2.0 staking rewards", "LDO tokens"]
    },
    {
      id: "yearn",
      name: "Yearn Vaults",
      protocol: "Yearn",
      logo: "💙",
      apy: 6.7,
      tvl: "$450M",
      riskLevel: "medium",
      description: "Automated yield farming strategies",
      minDeposit: "0.1 ETH",
      lockPeriod: "None",
      autoCompounding: true,
      rewards: ["Optimized yield", "Strategy tokens"]
    },
    {
      id: "convex",
      name: "Convex Finance",
      protocol: "Convex",
      logo: "🔺",
      apy: 8.3,
      tvl: "$1.2B",
      riskLevel: "high",
      description: "Boosted Curve rewards with CVX incentives",
      minDeposit: "0.05 ETH",
      lockPeriod: "Variable",
      autoCompounding: true,
      rewards: ["CRV rewards", "CVX tokens", "Boosted APY"]
    }
  ];

  // Mock yield positions
  const mockPositions: YieldPosition[] = [
    {
      id: "pos_1",
      jobId: 1,
      jobTitle: "Smart Contract Audit",
      principal: "2.5",
      protocol: yieldProtocols[0],
      deposited: "2.5",
      currentValue: "2.547",
      yield: "0.047",
      apy: 4.2,
      depositedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: "active"
    },
    {
      id: "pos_2", 
      jobId: 2,
      jobTitle: "DeFi Protocol Development",
      principal: "5.0",
      protocol: yieldProtocols[2],
      deposited: "5.0",
      currentValue: "5.123",
      yield: "0.123",
      apy: 5.1,
      depositedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "active"
    }
  ];

  useEffect(() => {
    setYieldPositions(mockPositions);
  }, []);

  const depositToYieldMutation = useMutation({
    mutationFn: async ({ jobId, protocolId }: { jobId: number; protocolId: string }) => {
      // Simulate DeFi deposit transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const protocol = yieldProtocols.find(p => p.id === protocolId);
      if (!protocol) throw new Error("Protocol not found");

      const job = escrowedJobs.find(j => j.id === jobId);
      if (!job) throw new Error("Job not found");

      const newPosition: YieldPosition = {
        id: `pos_${Date.now()}`,
        jobId,
        jobTitle: job.title,
        principal: job.paymentAmount,
        protocol,
        deposited: job.paymentAmount,
        currentValue: job.paymentAmount,
        yield: "0",
        apy: protocol.apy,
        depositedAt: new Date(),
        estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "active"
      };

      setYieldPositions(prev => [...prev, newPosition]);
      
      return { 
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        position: newPosition
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Escrow Deposited for Yield! 🚀",
        description: `Your escrowed funds are now earning ${data.position.protocol.apy}% APY`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const withdrawYieldMutation = useMutation({
    mutationFn: async (positionId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setYieldPositions(prev => 
        prev.map(pos => 
          pos.id === positionId 
            ? { ...pos, status: "withdrawn" as const }
            : pos
        )
      );
      
      return { transactionHash: "0x" + Math.random().toString(16).substr(2, 64) };
    },
    onSuccess: () => {
      toast({
        title: "Yield Withdrawn Successfully!",
        description: "Principal + yield returned to escrow contract",
      });
    }
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalValue = () => {
    return yieldPositions
      .filter(pos => pos.status === 'active')
      .reduce((sum, pos) => sum + parseFloat(pos.currentValue), 0);
  };

  const calculateTotalYield = () => {
    return yieldPositions
      .filter(pos => pos.status === 'active')
      .reduce((sum, pos) => sum + parseFloat(pos.yield), 0);
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return "Completed";
    if (diffInDays === 0) return "Due today";
    return `${diffInDays} days remaining`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deposited</p>
                <p className="text-2xl font-bold">{calculateTotalValue().toFixed(3)} ETH</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Yield Earned</p>
                <p className="text-2xl font-bold text-green-600">+{calculateTotalYield().toFixed(4)} ETH</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Positions</p>
                <p className="text-2xl font-bold">{yieldPositions.filter(p => p.status === 'active').length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg APY</p>
                <p className="text-2xl font-bold">
                  {yieldPositions.length > 0 
                    ? (yieldPositions.reduce((sum, pos) => sum + pos.apy, 0) / yieldPositions.length).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="protocols">Available Protocols</TabsTrigger>
          <TabsTrigger value="positions">Active Positions</TabsTrigger>
          <TabsTrigger value="analytics">Yield Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yieldProtocols.map((protocol) => (
              <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{protocol.logo}</div>
                      <div>
                        <CardTitle className="text-base">{protocol.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{protocol.protocol}</p>
                      </div>
                    </div>
                    <Badge className={getRiskColor(protocol.riskLevel)}>
                      {protocol.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">APY:</span>
                      <div className="font-bold text-green-600">{protocol.apy}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">TVL:</span>
                      <div className="font-medium">{protocol.tvl}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Deposit:</span>
                      <div className="font-medium">{protocol.minDeposit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lock Period:</span>
                      <div className="font-medium">{protocol.lockPeriod}</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {protocol.description}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Rewards:</h4>
                    <div className="flex flex-wrap gap-1">
                      {protocol.rewards.map((reward, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reward}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {protocol.autoCompounding && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Zap className="w-3 h-3" />
                      Auto-compounding enabled
                    </div>
                  )}

                  <Button 
                    onClick={() => setSelectedProtocol(protocol)}
                    className="w-full"
                    size="sm"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Deposit Escrow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          {yieldPositions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Positions</h3>
                <p className="text-muted-foreground mb-4">
                  Start earning yield on your escrowed funds by depositing to a DeFi protocol
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {yieldPositions.map((position) => (
                <Card key={position.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{position.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Job #{position.jobId} • {position.protocol.name}
                        </p>
                      </div>
                      <Badge className={
                        position.status === 'active' ? 'bg-green-100 text-green-800' :
                        position.status === 'matured' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {position.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Principal:</span>
                        <div className="font-bold">{position.principal} ETH</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Current Value:</span>
                        <div className="font-bold">{position.currentValue} ETH</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Yield Earned:</span>
                        <div className="font-bold text-green-600">+{position.yield} ETH</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">APY:</span>
                        <div className="font-bold">{position.apy}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Job completion: {formatTimeRemaining(position.estimatedCompletion)}
                      </div>
                      
                      {position.status === 'active' && (
                        <Button 
                          onClick={() => withdrawYieldMutation.mutate(position.id)}
                          disabled={withdrawYieldMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          Withdraw Early
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Yield Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Yield Generated:</span>
                    <span className="font-bold text-green-600">+{calculateTotalYield().toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Monthly Yield:</span>
                    <span className="font-bold">+0.024 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Performing Protocol:</span>
                    <span className="font-bold">Convex (8.3% APY)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={40} className="w-20 h-2" />
                      <span className="text-sm">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-20 h-2" />
                      <span className="text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk</span>
                    <div className="flex items-center gap-2">
                      <Progress value={25} className="w-20 h-2" />
                      <span className="text-sm">25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Revolutionary Impact */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
              Productive Capital Revolution
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Traditional escrow systems lock up capital unproductively. Decentralcy's DeFi integration 
              ensures your escrowed funds earn yield while maintaining security - turning every job 
              into a profitable investment opportunity for both parties.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-green-600 text-white">Productive Escrow</Badge>
              <Badge className="bg-blue-600 text-white">Risk-Managed Yield</Badge>
              <Badge className="bg-purple-600 text-white">Auto-Compounding</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
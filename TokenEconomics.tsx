import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Lock, Gift, Zap, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TokenEconomicsProps {
  userAddress: string;
}

interface TokenBalance {
  available: string;
  staked: string;
  locked: string;
  rewards: string;
  totalEarned: string;
}

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  duration: number;
  minStake: string;
  totalStaked: string;
  userStaked: string;
}

interface RewardHistory {
  id: number;
  type: string;
  amount: string;
  reason: string;
  date: string;
}

export default function TokenEconomics({ userAddress }: TokenEconomicsProps) {
  const [stakingAmount, setStakingAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState("");

  const queryClient = useQueryClient();

  // Fetch token balance
  const { data: tokenBalance } = useQuery<TokenBalance>({
    queryKey: ["/api/tokens/balance", userAddress],
    enabled: !!userAddress,
  });

  // Fetch staking pools
  const { data: stakingPools = [] } = useQuery<StakingPool[]>({
    queryKey: ["/api/tokens/staking-pools"],
  });

  // Fetch reward history
  const { data: rewardHistory = [] } = useQuery<RewardHistory[]>({
    queryKey: ["/api/tokens/rewards", userAddress],
    enabled: !!userAddress,
  });

  // Stake tokens mutation
  const stakeTokensMutation = useMutation({
    mutationFn: async ({ poolId, amount }: { poolId: string; amount: string }) => {
      return await apiRequest("/api/tokens/stake", "POST", { poolId, amount, user: userAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/balance", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/staking-pools"] });
      setStakingAmount("");
    },
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/tokens/claim-rewards", "POST", { user: userAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/balance", userAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/rewards", userAddress] });
    },
  });

  const handleStake = () => {
    if (selectedPool && stakingAmount) {
      stakeTokensMutation.mutate({ poolId: selectedPool, amount: stakingAmount });
    }
  };

  const getTotalValue = () => {
    if (!tokenBalance) return "0";
    const available = parseFloat(tokenBalance.available || "0");
    const staked = parseFloat(tokenBalance.staked || "0");
    const rewards = parseFloat(tokenBalance.rewards || "0");
    return (available + staked + rewards).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Coins className="h-6 w-6" />
        <h2 className="text-2xl font-bold">DTA Token Economics</h2>
      </div>

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="economics">Tokenomics</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenBalance?.available || "0"}</div>
                <p className="text-xs text-muted-foreground">DTA tokens ready to use</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Staked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenBalance?.staked || "0"}</div>
                <p className="text-xs text-muted-foreground">Earning rewards</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{tokenBalance?.rewards || "0"}</div>
                <p className="text-xs text-muted-foreground">Claimable rewards</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalValue()}</div>
                <p className="text-xs text-muted-foreground">DTA total holdings</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Portfolio Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available Tokens</span>
                  <span>{((parseFloat(tokenBalance?.available || "0") / parseFloat(getTotalValue() || "1")) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(parseFloat(tokenBalance?.available || "0") / parseFloat(getTotalValue() || "1")) * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Staked Tokens</span>
                  <span>{((parseFloat(tokenBalance?.staked || "0") / parseFloat(getTotalValue() || "1")) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(parseFloat(tokenBalance?.staked || "0") / parseFloat(getTotalValue() || "1")) * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending Rewards</span>
                  <span>{((parseFloat(tokenBalance?.rewards || "0") / parseFloat(getTotalValue() || "1")) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(parseFloat(tokenBalance?.rewards || "0") / parseFloat(getTotalValue() || "1")) * 100} />
              </div>
            </CardContent>
          </Card>

          {parseFloat(tokenBalance?.rewards || "0") > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <span>Claim Rewards</span>
                </CardTitle>
                <CardDescription>
                  You have {tokenBalance?.rewards} DTA tokens ready to claim
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => claimRewardsMutation.mutate()}
                  disabled={claimRewardsMutation.isPending}
                  className="w-full"
                >
                  {claimRewardsMutation.isPending ? "Claiming..." : `Claim ${tokenBalance?.rewards} DTA`}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="staking" className="space-y-4">
          <div className="grid gap-4">
            {stakingPools.map((pool) => (
              <Card key={pool.id} className={selectedPool === pool.id ? "ring-2 ring-blue-500" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Lock className="h-5 w-5" />
                        <span>{pool.name}</span>
                      </CardTitle>
                      <CardDescription>
                        {pool.duration} days lock period
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {pool.apy}% APY
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Min Stake:</span>
                      <div className="font-semibold">{pool.minStake} DTA</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Your Stake:</span>
                      <div className="font-semibold">{pool.userStaked} DTA</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Staked:</span>
                      <div className="font-semibold">{pool.totalStaked} DTA</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Pool Utilization:</span>
                      <div className="font-semibold">78%</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setSelectedPool(pool.id)}
                    variant={selectedPool === pool.id ? "default" : "outline"}
                    className="w-full"
                  >
                    {selectedPool === pool.id ? "Selected" : "Select Pool"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPool && (
            <Card>
              <CardHeader>
                <CardTitle>Stake Tokens</CardTitle>
                <CardDescription>
                  Stake your DTA tokens to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder="Enter DTA amount"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Available: {tokenBalance?.available || "0"} DTA
                  </div>
                </div>
                
                <Button
                  onClick={handleStake}
                  disabled={!stakingAmount || stakeTokensMutation.isPending}
                  className="w-full"
                >
                  {stakeTokensMutation.isPending ? "Staking..." : "Stake Tokens"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <span>Earned Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {tokenBalance?.totalEarned || "0"} DTA
                </div>
                <p className="text-sm text-gray-500">Total rewards earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Current APY</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12.5%</div>
                <p className="text-sm text-gray-500">Weighted average APY</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>
                Your recent token rewards and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rewardHistory.length ? (
                  rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{reward.reason}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(reward.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+{reward.amount} DTA</div>
                        <Badge variant="outline" className="text-xs">
                          {reward.type}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rewards yet</p>
                    <p className="text-sm">Start staking or participating to earn rewards</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Token Economics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Supply:</span>
                  <span className="font-semibold">1,000,000 DTA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Circulating Supply:</span>
                  <span className="font-semibold">450,000 DTA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Staked Tokens:</span>
                  <span className="font-semibold">180,000 DTA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform Treasury:</span>
                  <span className="font-semibold">120,000 DTA</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Utility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Governance</Badge>
                    <span className="text-sm">Vote on platform decisions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Staking</Badge>
                    <span className="text-sm">Earn rewards and increase voting power</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Premium</Badge>
                    <span className="text-sm">Access premium features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Disputes</Badge>
                    <span className="text-sm">Participate in dispute resolution</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>
                How platform fees are distributed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Token Holders (Staking Rewards)</span>
                  <span className="font-semibold">40%</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Platform Development</span>
                  <span className="font-semibold">30%</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Treasury Reserve</span>
                  <span className="font-semibold">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Operations & Security</span>
                  <span className="font-semibold">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
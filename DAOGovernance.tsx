import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Vote, Users, Coins, ShieldCheck, Award, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface DAOGovernanceProps {
  userAddress: string;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  type: string;
  proposer: string;
  votesFor: string;
  votesAgainst: string;
  totalVotes: string;
  status: string;
  deadline: string;
  executed: boolean;
  createdAt: string;
}

interface TokenStats {
  totalSupply: string;
  userBalance: string;
  stakedAmount: string;
  votingPower: string;
  rewardsClaimed: string;
}

export default function DAOGovernance({ userAddress }: DAOGovernanceProps) {
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    type: "platform_improvement",
    action: ""
  });

  const queryClient = useQueryClient();

  // Fetch DAO proposals
  const { data: proposals = [] } = useQuery<Proposal[]>({
    queryKey: ["/api/dao/proposals"],
  });

  // Fetch user's token stats
  const { data: tokenStats } = useQuery<TokenStats>({
    queryKey: ["/api/dao/token-stats", userAddress],
    enabled: !!userAddress,
  });

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: any) => {
      return await apiRequest("/api/dao/proposals", "POST", proposalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
      setNewProposal({ title: "", description: "", type: "platform_improvement", action: "" });
    },
  });

  // Vote on proposal mutation
  const voteProposalMutation = useMutation({
    mutationFn: async ({ proposalId, support }: { proposalId: number; support: boolean }) => {
      return await apiRequest(`/api/dao/proposals/${proposalId}/vote`, "POST", { support, voter: userAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/proposals"] });
    },
  });

  // Stake tokens mutation
  const stakeTokensMutation = useMutation({
    mutationFn: async (amount: string) => {
      return await apiRequest("/api/dao/stake", "POST", { amount, user: userAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dao/token-stats", userAddress] });
    },
  });

  const handleCreateProposal = () => {
    createProposalMutation.mutate({
      ...newProposal,
      proposer: userAddress,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
  };

  const handleVote = (proposalId: number, support: boolean) => {
    voteProposalMutation.mutate({ proposalId, support });
  };

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case "platform_improvement": return "bg-blue-500";
      case "fee_adjustment": return "bg-green-500";
      case "governance_change": return "bg-purple-500";
      case "treasury_allocation": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500";
      case "passed": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "executed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Vote className="h-6 w-6" />
        <h2 className="text-2xl font-bold">DAO Governance</h2>
      </div>

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
          <TabsTrigger value="tokens">DTA Tokens</TabsTrigger>
          <TabsTrigger value="stats">DAO Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          <div className="grid gap-4">
            {proposals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active proposals</p>
                    <p className="text-sm">Be the first to propose platform improvements!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onVote={handleVote}
                  userAddress={userAddress}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Create New Proposal</span>
              </CardTitle>
              <CardDescription>
                Propose changes to the platform that require community approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="proposal-type">Proposal Type</Label>
                <Select
                  value={newProposal.type}
                  onValueChange={(value) => setNewProposal(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform_improvement">Platform Improvement</SelectItem>
                    <SelectItem value="fee_adjustment">Fee Adjustment</SelectItem>
                    <SelectItem value="governance_change">Governance Change</SelectItem>
                    <SelectItem value="treasury_allocation">Treasury Allocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="proposal-title">Title</Label>
                <Input
                  id="proposal-title"
                  placeholder="Brief, descriptive title for your proposal"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="proposal-description">Description</Label>
                <Textarea
                  id="proposal-description"
                  placeholder="Detailed explanation of the proposal, its benefits, and implementation plan..."
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="proposal-action">Action/Implementation</Label>
                <Textarea
                  id="proposal-action"
                  placeholder="Specific actions required to implement this proposal..."
                  value={newProposal.action}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, action: e.target.value }))}
                />
              </div>

              <Button
                onClick={handleCreateProposal}
                disabled={!newProposal.title || !newProposal.description || createProposalMutation.isPending}
                className="w-full"
              >
                {createProposalMutation.isPending ? "Creating Proposal..." : "Submit Proposal"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>Your DTA Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{tokenStats?.userBalance || "0"} DTA</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Staked:</span>
                    <span>{tokenStats?.stakedAmount || "0"} DTA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Voting Power:</span>
                    <span>{tokenStats?.votingPower || "0"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rewards Claimed:</span>
                    <span>{tokenStats?.rewardsClaimed || "0"} DTA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Stake Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Stake DTA tokens to increase your voting power and earn rewards.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder="Enter DTA amount"
                  />
                </div>
                <Button 
                  onClick={() => stakeTokensMutation.mutate("100")}
                  className="w-full"
                  disabled={stakeTokensMutation.isPending}
                >
                  {stakeTokensMutation.isPending ? "Staking..." : "Stake Tokens"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Total Supply</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenStats?.totalSupply || "1,000,000"} DTA</div>
                <p className="text-sm text-gray-500">Maximum token supply</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Active Voters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-gray-500">Participated in last vote</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Treasury Value</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$247,892</div>
                <p className="text-sm text-gray-500">Total DAO treasury</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent DAO Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">Platform fee reduced to 2.5%</span>
                  <Badge className="bg-green-500">Executed</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">New dispute resolution tier added</span>
                  <Badge className="bg-blue-500">Active</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">Worker verification system upgrade</span>
                  <Badge className="bg-purple-500">Passed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProposalCard({ 
  proposal, 
  onVote, 
  userAddress 
}: { 
  proposal: Proposal; 
  onVote: (id: number, support: boolean) => void;
  userAddress: string;
}) {
  const [hasVoted, setHasVoted] = useState(false);
  
  const totalVotes = parseFloat(proposal.totalVotes || "0");
  const votesFor = parseFloat(proposal.votesFor || "0");
  const supportPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  
  const isActive = proposal.status === "active" && new Date() < new Date(proposal.deadline);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            <CardDescription>
              Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={proposal.status === "active" ? "bg-blue-500" : proposal.status === "passed" ? "bg-green-500" : "bg-red-500"}>
              {proposal.status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className={proposal.type === "platform_improvement" ? "border-blue-500" : "border-green-500"}>
              {proposal.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{proposal.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Support: {supportPercentage.toFixed(1)}%</span>
            <span>{proposal.totalVotes} total votes</span>
          </div>
          <Progress value={supportPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>For: {proposal.votesFor}</span>
            <span>Against: {proposal.votesAgainst}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {isActive ? `Voting ends: ${format(new Date(proposal.deadline), "PPp")}` : 
           `Ended: ${format(new Date(proposal.deadline), "PPp")}`}
        </div>

        {isActive && !hasVoted && (
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                onVote(proposal.id, true);
                setHasVoted(true);
              }}
              className="flex-1"
              variant="default"
            >
              Vote For
            </Button>
            <Button
              onClick={() => {
                onVote(proposal.id, false);
                setHasVoted(true);
              }}
              className="flex-1"
              variant="outline"
            >
              Vote Against
            </Button>
          </div>
        )}

        {hasVoted && (
          <div className="text-center text-green-600 bg-green-50 p-2 rounded text-sm">
            ✓ You have voted on this proposal
          </div>
        )}
      </CardContent>
    </Card>
  );
}
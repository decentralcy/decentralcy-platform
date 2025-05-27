import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Vote, 
  Users, 
  Shield, 
  Gavel, 
  Clock, 
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye,
  MessageSquare,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DAOGovernanceSystemProps {
  userAddress: string;
  isConnected: boolean;
  userTokenBalance: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'platform' | 'treasury' | 'governance' | 'dispute' | 'integration';
  proposer: string;
  proposerReputation: number;
  status: 'active' | 'passed' | 'failed' | 'executed' | 'cancelled';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorumRequired: number;
  passThreshold: number; // percentage needed to pass
  startTime: Date;
  endTime: Date;
  executionDelay: number; // hours after passing before execution
  tokenSnapshot: number;
  discussionCount: number;
  actions?: ProposalAction[];
}

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
  description: string;
}

interface VoteRecord {
  proposalId: string;
  voter: string;
  choice: 'for' | 'against' | 'abstain';
  votingPower: number;
  timestamp: Date;
  reason?: string;
}

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  totalVoters: number;
  averageParticipation: number;
  treasuryBalance: string;
  tokenSupply: number;
}

export default function DAOGovernanceSystem({ 
  userAddress, 
  isConnected, 
  userTokenBalance 
}: DAOGovernanceSystemProps) {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [newProposalTitle, setNewProposalTitle] = useState("");
  const [newProposalDescription, setNewProposalDescription] = useState("");
  const [newProposalCategory, setNewProposalCategory] = useState<string>("");
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | 'abstain'>('for');
  const [voteReason, setVoteReason] = useState("");
  const { toast } = useToast();

  // Mock governance data
  const mockProposals: Proposal[] = [
    {
      id: "prop_1",
      title: "Reduce Platform Fees from 2.5% to 2.0%",
      description: "Proposal to make Decentralcy more competitive by reducing platform fees, which will increase worker earnings and attract more users to the platform.",
      category: "platform",
      proposer: "0x1234567890123456789012345678901234567890",
      proposerReputation: 95,
      status: "active",
      votesFor: 1247,
      votesAgainst: 342,
      votesAbstain: 89,
      totalVotes: 1678,
      quorumRequired: 2000,
      passThreshold: 60,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      executionDelay: 48,
      tokenSnapshot: 10000,
      discussionCount: 23,
      actions: [
        {
          target: "0xPlatformContract",
          value: "0",
          calldata: "0x...",
          description: "Update platform fee to 2.0%"
        }
      ]
    },
    {
      id: "prop_2",
      title: "Treasury Allocation for Marketing Campaign",
      description: "Allocate 50 ETH from treasury for a comprehensive marketing campaign to increase platform adoption and attract high-quality developers.",
      category: "treasury",
      proposer: "0x2345678901234567890123456789012345678901",
      proposerReputation: 87,
      status: "active",
      votesFor: 892,
      votesAgainst: 654,
      votesAbstain: 156,
      totalVotes: 1702,
      quorumRequired: 2000,
      passThreshold: 55,
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      executionDelay: 72,
      tokenSnapshot: 10000,
      discussionCount: 41
    },
    {
      id: "prop_3",
      title: "Implement Quadratic Voting for Future Proposals",
      description: "Upgrade the governance system to use quadratic voting, which reduces the influence of large token holders and gives more voice to smaller stakeholders.",
      category: "governance",
      proposer: userAddress,
      proposerReputation: 78,
      status: "passed",
      votesFor: 2341,
      votesAgainst: 567,
      votesAbstain: 234,
      totalVotes: 3142,
      quorumRequired: 2000,
      passThreshold: 65,
      startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      executionDelay: 48,
      tokenSnapshot: 10000,
      discussionCount: 67
    }
  ];

  const governanceStats: GovernanceStats = {
    totalProposals: 47,
    activeProposals: 2,
    totalVoters: 1204,
    averageParticipation: 34.2,
    treasuryBalance: "247.8 ETH",
    tokenSupply: 10000000
  };

  const mockVoteRecords: VoteRecord[] = [
    {
      proposalId: "prop_1",
      voter: userAddress,
      choice: "for",
      votingPower: userTokenBalance,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      reason: "Platform fees should be competitive to attract more users"
    }
  ];

  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: { title: string; description: string; category: string }) => {
      // Simulate proposal creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProposal: Proposal = {
        id: `prop_${Date.now()}`,
        title: proposalData.title,
        description: proposalData.description,
        category: proposalData.category as any,
        proposer: userAddress,
        proposerReputation: 85,
        status: "active",
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        totalVotes: 0,
        quorumRequired: 2000,
        passThreshold: 60,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        executionDelay: 48,
        tokenSnapshot: 10000,
        discussionCount: 0
      };

      return newProposal;
    },
    onSuccess: () => {
      toast({
        title: "Proposal Created! 🗳️",
        description: "Your proposal has been submitted to the DAO for voting.",
      });
      setNewProposalTitle("");
      setNewProposalDescription("");
      setNewProposalCategory("");
    },
    onError: (error: any) => {
      toast({
        title: "Proposal Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const castVoteMutation = useMutation({
    mutationFn: async (voteData: { proposalId: string; choice: string; reason: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const voteRecord: VoteRecord = {
        proposalId: voteData.proposalId,
        voter: userAddress,
        choice: voteData.choice as any,
        votingPower: userTokenBalance,
        timestamp: new Date(),
        reason: voteData.reason
      };

      return voteRecord;
    },
    onSuccess: () => {
      toast({
        title: "Vote Cast Successfully! ✅",
        description: "Your vote has been recorded on the blockchain.",
      });
      setVoteReason("");
    }
  });

  const delegateVotesMutation = useMutation({
    mutationFn: async (delegateTo: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { delegateTo, votingPower: userTokenBalance };
    },
    onSuccess: (data) => {
      toast({
        title: "Votes Delegated!",
        description: `Delegated ${data.votingPower} votes to ${data.delegateTo.slice(0, 8)}...`,
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'executed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'platform':
        return <Shield className="w-4 h-4" />;
      case 'treasury':
        return <TrendingUp className="w-4 h-4" />;
      case 'governance':
        return <Vote className="w-4 h-4" />;
      case 'dispute':
        return <Gavel className="w-4 h-4" />;
      case 'integration':
        return <Plus className="w-4 h-4" />;
      default:
        return <Vote className="w-4 h-4" />;
    }
  };

  const calculateVotePercentage = (votes: number, totalVotes: number) => {
    return totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return "Voting ended";
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${diffInHours % 24}h remaining`;
  };

  const hasUserVoted = (proposalId: string) => {
    return mockVoteRecords.some(vote => vote.proposalId === proposalId && vote.voter === userAddress);
  };

  const getUserVotingPower = () => {
    return userTokenBalance;
  };

  return (
    <div className="w-full space-y-6">
      {/* Governance Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">{governanceStats.totalProposals}</p>
              </div>
              <Vote className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Voters</p>
                <p className="text-2xl font-bold">{governanceStats.totalVoters}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participation Rate</p>
                <p className="text-2xl font-bold">{governanceStats.averageParticipation}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Treasury Balance</p>
                <p className="text-2xl font-bold">{governanceStats.treasuryBalance}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Voting Power */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Your Voting Power</h3>
              <p className="text-sm text-muted-foreground">Based on your DCNTRC token holdings and reputation</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{getUserVotingPower()} votes</div>
              <Badge className="bg-blue-100 text-blue-800">
                <Crown className="w-3 h-3 mr-1" />
                Active Voter
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
          <TabsTrigger value="history">Voting History</TabsTrigger>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
          <TabsTrigger value="delegate">Delegate Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {mockProposals.filter(p => p.status === 'active').map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                      {getCategoryIcon(proposal.category)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{proposal.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        By {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-6)} • 
                        Reputation: {proposal.proposerReputation}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                    <Badge variant="outline">
                      {proposal.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm">{proposal.description}</p>

                {/* Voting Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Voting Progress</span>
                    <span>{proposal.totalVotes} / {proposal.quorumRequired} votes</span>
                  </div>
                  <Progress 
                    value={(proposal.totalVotes / proposal.quorumRequired) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Vote Breakdown */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                    <div className="font-bold text-green-600">{proposal.votesFor}</div>
                    <div className="text-green-600">For ({calculateVotePercentage(proposal.votesFor, proposal.totalVotes).toFixed(1)}%)</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    <div className="font-bold text-red-600">{proposal.votesAgainst}</div>
                    <div className="text-red-600">Against ({calculateVotePercentage(proposal.votesAgainst, proposal.totalVotes).toFixed(1)}%)</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-950/20 rounded">
                    <div className="font-bold text-gray-600">{proposal.votesAbstain}</div>
                    <div className="text-gray-600">Abstain ({calculateVotePercentage(proposal.votesAbstain, proposal.totalVotes).toFixed(1)}%)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeRemaining(proposal.endTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {proposal.discussionCount} comments
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    
                    {!hasUserVoted(proposal.id) && proposal.status === 'active' && (
                      <Button 
                        onClick={() => setSelectedProposal(proposal)}
                        size="sm"
                      >
                        <Vote className="w-4 h-4 mr-1" />
                        Vote
                      </Button>
                    )}
                    
                    {hasUserVoted(proposal.id) && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Voted
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {mockProposals.filter(p => p.status !== 'active').map((proposal) => (
              <Card key={proposal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ended: {proposal.endTime.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(proposal.status)}>
                        {proposal.status}
                      </Badge>
                      {hasUserVoted(proposal.id) && (
                        <Badge className="bg-blue-100 text-blue-800">
                          You voted
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New Proposal</CardTitle>
              <CardDescription>
                Submit a proposal for community voting (requires minimum reputation)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Proposal Title</label>
                <Input
                  placeholder="Enter a clear and descriptive title"
                  value={newProposalTitle}
                  onChange={(e) => setNewProposalTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newProposalCategory} onValueChange={setNewProposalCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proposal category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Platform Changes</SelectItem>
                    <SelectItem value="treasury">Treasury Management</SelectItem>
                    <SelectItem value="governance">Governance Updates</SelectItem>
                    <SelectItem value="dispute">Dispute Resolution</SelectItem>
                    <SelectItem value="integration">New Integrations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Detailed Description</label>
                <Textarea
                  placeholder="Provide a comprehensive description of your proposal, including rationale, implementation details, and expected outcomes..."
                  value={newProposalDescription}
                  onChange={(e) => setNewProposalDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button
                onClick={() => createProposalMutation.mutate({
                  title: newProposalTitle,
                  description: newProposalDescription,
                  category: newProposalCategory
                })}
                disabled={createProposalMutation.isPending || !newProposalTitle || !newProposalDescription || !newProposalCategory}
                className="w-full"
              >
                {createProposalMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Proposal...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delegate Voting Power</CardTitle>
              <CardDescription>
                Delegate your votes to trusted community members who actively participate in governance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Delegate Address</label>
                <Input placeholder="0x... address of trusted delegate" />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Your Current Voting Power</h4>
                <div className="text-2xl font-bold">{getUserVotingPower()} votes</div>
                <p className="text-sm text-muted-foreground">
                  Based on {userTokenBalance} DCNTRC tokens
                </p>
              </div>

              <Button 
                onClick={() => delegateVotesMutation.mutate("0x1234567890123456789012345678901234567890")}
                disabled={delegateVotesMutation.isPending}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Delegate Votes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Voting Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Vote on Proposal</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedProposal(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedProposal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProposal.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Your Vote</label>
                <Select value={voteChoice} onValueChange={(value) => setVoteChoice(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for">✅ Vote For</SelectItem>
                    <SelectItem value="against">❌ Vote Against</SelectItem>
                    <SelectItem value="abstain">⚪ Abstain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Voting Reason (Optional)</label>
                <Textarea
                  placeholder="Explain your reasoning for this vote..."
                  value={voteReason}
                  onChange={(e) => setVoteReason(e.target.value)}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span>Your voting power:</span>
                <span className="font-bold">{getUserVotingPower()} votes</span>
              </div>

              <Button
                onClick={() => {
                  castVoteMutation.mutate({
                    proposalId: selectedProposal.id,
                    choice: voteChoice,
                    reason: voteReason
                  });
                  setSelectedProposal(null);
                }}
                disabled={castVoteMutation.isPending}
                className="w-full"
              >
                Cast Vote
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revolutionary Impact */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
              True Democratic Governance
            </h3>
            <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
              Decentralcy's DAO puts power in the hands of the community. No corporate boardrooms, 
              no executive decisions - every major platform change requires community consensus. 
              Your vote shapes the future of decentralized work.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-blue-600 text-white">Community Controlled</Badge>
              <Badge className="bg-purple-600 text-white">Transparent Voting</Badge>
              <Badge className="bg-green-600 text-white">On-Chain Governance</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
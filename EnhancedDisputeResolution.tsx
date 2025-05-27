import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Scale, AlertTriangle, Users, Clock, FileText, CheckCircle, XCircle, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DisputeCase {
  id: string;
  jobId: number;
  jobTitle: string;
  plaintiff: string;
  defendant: string;
  arbitrators: string[];
  status: 'pending' | 'evidence_collection' | 'arbitration' | 'voting' | 'resolved' | 'appealed';
  category: 'payment' | 'quality' | 'timeline' | 'scope' | 'communication';
  description: string;
  evidence: Evidence[];
  votes: ArbitratorVote[];
  resolution?: DisputeResolution;
  timeline: DisputeEvent[];
  createdAt: Date;
  deadline: Date;
  escrowAmount: string;
  platformStake: string;
}

interface Evidence {
  id: string;
  submittedBy: string;
  type: 'text' | 'file' | 'link' | 'screenshot';
  title: string;
  content: string;
  fileUrl?: string;
  timestamp: Date;
  verified: boolean;
}

interface ArbitratorVote {
  arbitratorId: string;
  decision: 'plaintiff' | 'defendant' | 'split';
  reasoning: string;
  recommendedSplit?: {
    plaintiffAmount: string;
    defendantAmount: string;
    platformFee: string;
  };
  timestamp: Date;
  confidence: number; // 1-10 scale
}

interface DisputeResolution {
  decision: 'plaintiff_wins' | 'defendant_wins' | 'split_decision';
  distributionPlan: {
    plaintiffAmount: string;
    defendantAmount: string;
    platformFee: string;
    arbitratorRewards: string;
  };
  finalReasoning: string;
  consensusScore: number;
  appealable: boolean;
  appealDeadline?: Date;
}

interface DisputeEvent {
  id: string;
  type: 'created' | 'evidence_submitted' | 'arbitrator_assigned' | 'vote_cast' | 'resolved' | 'appealed';
  actor: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface EnhancedDisputeResolutionProps {
  userAddress: string;
  selectedJobId?: number;
}

export default function EnhancedDisputeResolution({ userAddress, selectedJobId }: EnhancedDisputeResolutionProps) {
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [newEvidence, setNewEvidence] = useState("");
  const [votingReasoning, setVotingReasoning] = useState("");
  const [selectedDecision, setSelectedDecision] = useState<'plaintiff' | 'defendant' | 'split'>('plaintiff');
  const { toast } = useToast();

  // Mock dispute data - in production this would come from your database
  const mockDisputes: DisputeCase[] = [
    {
      id: "dispute_1",
      jobId: 1,
      jobTitle: "Blockchain Developer Position",
      plaintiff: userAddress,
      defendant: "0x1234567890123456789012345678901234567890",
      arbitrators: [
        "0xArb1111111111111111111111111111111111111111",
        "0xArb2222222222222222222222222222222222222222", 
        "0xArb3333333333333333333333333333333333333333"
      ],
      status: "arbitration",
      category: "quality",
      description: "The delivered smart contract code does not meet the specified requirements and contains critical security vulnerabilities.",
      evidence: [
        {
          id: "ev_1",
          submittedBy: userAddress,
          type: "text",
          title: "Quality Issues Report",
          content: "The delivered code has multiple security vulnerabilities including reentrancy attacks and lacks proper access controls.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          verified: true
        },
        {
          id: "ev_2",
          submittedBy: "0x1234567890123456789012345678901234567890",
          type: "file",
          title: "Code Delivery Documentation",
          content: "Complete smart contract implementation with test suite",
          fileUrl: "ipfs://QmCodeDelivery123...",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          verified: true
        }
      ],
      votes: [
        {
          arbitratorId: "0xArb1111111111111111111111111111111111111111",
          decision: "plaintiff",
          reasoning: "After reviewing the code, there are indeed critical security issues that need to be addressed.",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          confidence: 8
        }
      ],
      timeline: [
        {
          id: "ev_t1",
          type: "created",
          actor: userAddress,
          description: "Dispute raised regarding work quality",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: "ev_t2", 
          type: "arbitrator_assigned",
          actor: "system",
          description: "3 arbitrators assigned to case",
          timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      escrowAmount: "2.5 ETH",
      platformStake: "0.125 ETH"
    }
  ];

  const submitEvidenceMutation = useMutation({
    mutationFn: async (evidenceData: { disputeId: string; title: string; content: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return evidenceData;
    },
    onSuccess: () => {
      setNewEvidence("");
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      toast({
        title: "Evidence Submitted",
        description: "Your evidence has been added to the case file.",
      });
    },
  });

  const castVoteMutation = useMutation({
    mutationFn: async (voteData: { disputeId: string; decision: string; reasoning: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return voteData;
    },
    onSuccess: () => {
      setVotingReasoning("");
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      toast({
        title: "Vote Cast Successfully",
        description: "Your arbitration decision has been recorded.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending Review" },
      evidence_collection: { color: "bg-blue-100 text-blue-800", label: "Collecting Evidence" },
      arbitration: { color: "bg-purple-100 text-purple-800", label: "Under Arbitration" },
      voting: { color: "bg-orange-100 text-orange-800", label: "Arbitrator Voting" },
      resolved: { color: "bg-green-100 text-green-800", label: "Resolved" },
      appealed: { color: "bg-red-100 text-red-800", label: "Under Appeal" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      payment: { color: "bg-red-100 text-red-800", label: "Payment Issue" },
      quality: { color: "bg-orange-100 text-orange-800", label: "Quality Dispute" },
      timeline: { color: "bg-blue-100 text-blue-800", label: "Timeline Issue" },
      scope: { color: "bg-purple-100 text-purple-800", label: "Scope Dispute" },
      communication: { color: "bg-teal-100 text-teal-800", label: "Communication" },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.quality;
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return "Expired";
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ${diffInHours % 24}h remaining`;
  };

  const isArbitrator = (dispute: DisputeCase) => {
    return dispute.arbitrators.includes(userAddress);
  };

  const isParticipant = (dispute: DisputeCase) => {
    return dispute.plaintiff === userAddress || dispute.defendant === userAddress;
  };

  const selectedDisputeData = mockDisputes.find(d => d.id === selectedDispute);

  return (
    <div className="w-full space-y-6">
      {/* Dispute Cases Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6" />
            Enhanced Dispute Resolution
          </CardTitle>
          <CardDescription>
            Professional arbitration system with expert panels and evidence collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockDisputes.map((dispute) => (
              <div
                key={dispute.id}
                onClick={() => setSelectedDispute(dispute.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedDispute === dispute.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{dispute.jobTitle}</h3>
                    <p className="text-sm text-muted-foreground">Case #{dispute.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(dispute.status)}
                    {getCategoryBadge(dispute.category)}
                  </div>
                </div>
                
                <p className="text-sm mb-3">{dispute.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>Escrow: {dispute.escrowAmount}</span>
                    <span>Arbitrators: {dispute.arbitrators.length}</span>
                    <span>Evidence: {dispute.evidence.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    {formatTimeRemaining(dispute.deadline)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Dispute View */}
      {selectedDisputeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Case Details: {selectedDisputeData.jobTitle}</span>
              <div className="flex gap-2">
                {getStatusBadge(selectedDisputeData.status)}
                {getCategoryBadge(selectedDisputeData.category)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="arbitration">Arbitration</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Dispute Details</h4>
                      <p className="text-sm text-muted-foreground">{selectedDisputeData.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Participants</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Plaintiff</Badge>
                          <span className="text-sm font-mono">{selectedDisputeData.plaintiff.slice(0, 6)}...{selectedDisputeData.plaintiff.slice(-4)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Defendant</Badge>
                          <span className="text-sm font-mono">{selectedDisputeData.defendant.slice(0, 6)}...{selectedDisputeData.defendant.slice(-4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Financial Stakes</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Escrow Amount:</span>
                          <span className="font-medium">{selectedDisputeData.escrowAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Stake:</span>
                          <span className="font-medium">{selectedDisputeData.platformStake}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolution Deadline:</span>
                          <span className="font-medium">{formatTimeRemaining(selectedDisputeData.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Arbitration Panel</h4>
                      <div className="space-y-2">
                        {selectedDisputeData.arbitrators.map((arbitrator, index) => (
                          <div key={arbitrator} className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{index + 1}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-mono">{arbitrator.slice(0, 6)}...{arbitrator.slice(-4)}</span>
                            {selectedDisputeData.votes.find(v => v.arbitratorId === arbitrator) && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <div className="space-y-4">
                  {selectedDisputeData.evidence.map((evidence) => (
                    <Card key={evidence.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{evidence.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Submitted by {evidence.submittedBy.slice(0, 6)}...{evidence.submittedBy.slice(-4)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={evidence.verified ? "default" : "secondary"}>
                              {evidence.verified ? "Verified" : "Pending"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {evidence.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm">{evidence.content}</p>
                        {evidence.fileUrl && (
                          <Button variant="outline" size="sm" className="mt-2">
                            <FileText className="w-4 h-4 mr-1" />
                            View File
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isParticipant(selectedDisputeData) && selectedDisputeData.status === 'evidence_collection' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Submit Evidence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Describe your evidence and provide details..."
                        value={newEvidence}
                        onChange={(e) => setNewEvidence(e.target.value)}
                      />
                      <Button 
                        onClick={() => submitEvidenceMutation.mutate({
                          disputeId: selectedDisputeData.id,
                          title: "Additional Evidence",
                          content: newEvidence
                        })}
                        disabled={!newEvidence.trim() || submitEvidenceMutation.isPending}
                      >
                        Submit Evidence
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="arbitration" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Arbitrator Votes</h4>
                    <div className="space-y-3">
                      {selectedDisputeData.votes.map((vote) => (
                        <Card key={vote.arbitratorId}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>A</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {vote.arbitratorId.slice(0, 6)}...{vote.arbitratorId.slice(-4)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Confidence: {vote.confidence}/10
                                  </p>
                                </div>
                              </div>
                              <Badge variant={vote.decision === 'plaintiff' ? 'destructive' : 'default'}>
                                {vote.decision === 'plaintiff' ? 'Supports Plaintiff' : 
                                 vote.decision === 'defendant' ? 'Supports Defendant' : 'Split Decision'}
                              </Badge>
                            </div>
                            <p className="text-sm">{vote.reasoning}</p>
                            <div className="text-xs text-muted-foreground mt-2">
                              Voted: {vote.timestamp.toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {isArbitrator(selectedDisputeData) && selectedDisputeData.status === 'arbitration' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cast Your Vote</CardTitle>
                        <CardDescription>
                          Review all evidence carefully before making your decision
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Decision</label>
                          <div className="flex gap-2">
                            {['plaintiff', 'defendant', 'split'].map((decision) => (
                              <Button
                                key={decision}
                                variant={selectedDecision === decision ? 'default' : 'outline'}
                                onClick={() => setSelectedDecision(decision as any)}
                                size="sm"
                              >
                                {decision === 'plaintiff' ? 'Support Plaintiff' :
                                 decision === 'defendant' ? 'Support Defendant' : 'Split Decision'}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Textarea
                          placeholder="Provide detailed reasoning for your decision..."
                          value={votingReasoning}
                          onChange={(e) => setVotingReasoning(e.target.value)}
                        />

                        <Button 
                          onClick={() => castVoteMutation.mutate({
                            disputeId: selectedDisputeData.id,
                            decision: selectedDecision,
                            reasoning: votingReasoning
                          })}
                          disabled={!votingReasoning.trim() || castVoteMutation.isPending}
                          className="w-full"
                        >
                          Cast Vote
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  {selectedDisputeData.timeline.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {index < selectedDisputeData.timeline.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>by {event.actor === 'system' ? 'System' : `${event.actor.slice(0, 6)}...${event.actor.slice(-4)}`}</span>
                          <span>•</span>
                          <span>{event.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
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
import { AlertTriangle, Vote, Users, Clock, CheckCircle, XCircle, Scale } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { Job, Dispute, DisputeVote } from "@shared/schema";

interface DisputeCenterProps {
  userAddress: string;
}

interface DisputeWithJob extends Dispute {
  job: Job;
  votes: DisputeVote[];
  totalVotingPower: string;
  favorPlaintiffPower: string;
  favorDefendantPower: string;
}

export default function DisputeCenter({ userAddress }: DisputeCenterProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [newDisputeForm, setNewDisputeForm] = useState({
    reason: "",
    evidence: "",
    disputeType: "quality",
    stakeAmount: "0.01"
  });

  const queryClient = useQueryClient();

  // Fetch user's jobs that can be disputed
  const { data: userJobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs/user", userAddress],
    enabled: !!userAddress,
  });

  // Fetch all disputes
  const { data: disputes = [] } = useQuery<DisputeWithJob[]>({
    queryKey: ["/api/disputes"],
  });

  // Fetch user's voting power
  const { data: votingPower = 0 } = useQuery<number>({
    queryKey: ["/api/voting-power", userAddress],
    enabled: !!userAddress,
  });

  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: async (disputeData: any) => {
      return await apiRequest("/api/disputes", "POST", disputeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      setNewDisputeForm({ reason: "", evidence: "", disputeType: "quality", stakeAmount: "0.01" });
      setSelectedJobId(null);
    },
  });

  // Vote on dispute mutation
  const voteDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, favorPlaintiff, reasoning }: { disputeId: number; favorPlaintiff: boolean; reasoning: string }) => {
      return await apiRequest(`/api/disputes/${disputeId}/vote`, "POST", { favorPlaintiff, reasoning, voterAddress: userAddress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
    },
  });

  const handleCreateDispute = () => {
    if (!selectedJobId) return;
    
    createDisputeMutation.mutate({
      jobId: selectedJobId,
      raiserAddress: userAddress,
      reason: newDisputeForm.reason,
      evidence: newDisputeForm.evidence,
      disputeType: newDisputeForm.disputeType,
      stakeAmount: newDisputeForm.stakeAmount,
      votingDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    });
  };

  const handleVote = (disputeId: number, favorPlaintiff: boolean, reasoning: string) => {
    voteDisputeMutation.mutate({ disputeId, favorPlaintiff, reasoning });
  };

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-500";
      case "voting": return "bg-blue-500";
      case "resolved": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getVotingProgress = (dispute: DisputeWithJob) => {
    const total = parseFloat(dispute.totalVotingPower || "0");
    const favor = parseFloat(dispute.favorPlaintiffPower || "0");
    return total > 0 ? (favor / total) * 100 : 50;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Scale className="h-6 w-6" />
        <h2 className="text-2xl font-bold">DAO Dispute Resolution</h2>
      </div>

      <Tabs defaultValue="disputes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="disputes">Active Disputes</TabsTrigger>
          <TabsTrigger value="create">Raise Dispute</TabsTrigger>
          <TabsTrigger value="voting">My Voting Power</TabsTrigger>
        </TabsList>

        <TabsContent value="disputes" className="space-y-4">
          <div className="grid gap-4">
            {disputes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active disputes</p>
                    <p className="text-sm">The community is working harmoniously!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              disputes.map((dispute) => (
                <DisputeCard
                  key={dispute.id}
                  dispute={dispute}
                  userAddress={userAddress}
                  onVote={handleVote}
                  votingPower={votingPower}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Raise a Dispute</span>
              </CardTitle>
              <CardDescription>
                Disputes require a stake and community voting. Use this responsibly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="job-select">Select Job</Label>
                <Select onValueChange={(value) => setSelectedJobId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job to dispute" />
                  </SelectTrigger>
                  <SelectContent>
                    {userJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title} - {job.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dispute-type">Dispute Type</Label>
                <Select
                  value={newDisputeForm.disputeType}
                  onValueChange={(value) => setNewDisputeForm(prev => ({ ...prev, disputeType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Work Quality</SelectItem>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="scope">Scope Disagreement</SelectItem>
                    <SelectItem value="behavior">Unprofessional Behavior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stake-amount">Stake Amount (ETH)</Label>
                <Input
                  id="stake-amount"
                  type="number"
                  step="0.01"
                  value={newDisputeForm.stakeAmount}
                  onChange={(e) => setNewDisputeForm(prev => ({ ...prev, stakeAmount: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reason">Dispute Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain the issue clearly and objectively..."
                  value={newDisputeForm.reason}
                  onChange={(e) => setNewDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="evidence">Evidence (Links, descriptions, etc.)</Label>
                <Textarea
                  id="evidence"
                  placeholder="Provide any supporting evidence, links to files, screenshots, etc..."
                  value={newDisputeForm.evidence}
                  onChange={(e) => setNewDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
                />
              </div>

              <Button
                onClick={handleCreateDispute}
                disabled={!selectedJobId || !newDisputeForm.reason || createDisputeMutation.isPending}
                className="w-full"
              >
                {createDisputeMutation.isPending ? "Creating Dispute..." : "Raise Dispute"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="h-5 w-5" />
                <span>Your Voting Power</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>DTA Token Balance:</span>
                <Badge variant="secondary">{votingPower} DTA</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Reputation Multiplier:</span>
                <Badge variant="secondary">1.0x</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Activity Bonus:</span>
                <Badge variant="secondary">+10%</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total Voting Power:</span>
                <Badge>{(votingPower * 1.1).toFixed(2)} VP</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Voting power determines the weight of your vote in dispute resolution. 
                Earn more by holding DTA tokens and participating in governance.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DisputeCard({ 
  dispute, 
  userAddress, 
  onVote, 
  votingPower 
}: { 
  dispute: DisputeWithJob; 
  userAddress: string; 
  onVote: (disputeId: number, favorPlaintiff: boolean, reasoning: string) => void;
  votingPower: number;
}) {
  const [voteReasoning, setVoteReasoning] = useState("");
  const [showVoting, setShowVoting] = useState(false);
  
  const hasVoted = dispute.votes.some(vote => vote.voterAddress === userAddress);
  const isExpired = dispute.votingDeadline && new Date() > new Date(dispute.votingDeadline);
  const canVote = !hasVoted && !isExpired && dispute.status === "voting" && votingPower > 0;
  
  const votingProgress = dispute.totalVotingPower ? 
    (parseFloat(dispute.favorPlaintiffPower) / parseFloat(dispute.totalVotingPower)) * 100 : 50;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{dispute.job?.title}</CardTitle>
            <CardDescription>
              Dispute #{dispute.id} • Raised by {dispute.raiserAddress.slice(0, 6)}...{dispute.raiserAddress.slice(-4)}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={dispute.status === "open" ? "bg-yellow-500" : dispute.status === "voting" ? "bg-blue-500" : "bg-green-500"}>
              {dispute.status.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {dispute.disputeType}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Dispute Reason:</h4>
          <p className="text-sm text-gray-600">{dispute.reason}</p>
        </div>

        {dispute.evidence && (
          <div>
            <h4 className="font-semibold mb-2">Evidence:</h4>
            <p className="text-sm text-gray-600">{dispute.evidence}</p>
          </div>
        )}

        {dispute.status === "voting" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Voting Progress</span>
              <span>{dispute.votes?.length || 0} votes cast</span>
            </div>
            <Progress value={votingProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Favor Plaintiff: {dispute.favorPlaintiffPower || "0"} VP</span>
              <span>Favor Defendant: {(parseFloat(dispute.totalVotingPower || "0") - parseFloat(dispute.favorPlaintiffPower || "0")).toFixed(2)} VP</span>
            </div>
          </div>
        )}

        {dispute.votingDeadline && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Voting {isExpired ? "ended" : "ends"}: {format(new Date(dispute.votingDeadline), "PPp")}
            </span>
          </div>
        )}

        {canVote && (
          <div className="space-y-3 border-t pt-4">
            {!showVoting ? (
              <Button onClick={() => setShowVoting(true)} className="w-full">
                Cast Your Vote
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Explain your reasoning for this vote..."
                  value={voteReasoning}
                  onChange={(e) => setVoteReasoning(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onVote(dispute.id, true, voteReasoning)}
                    className="flex-1"
                    variant="default"
                    disabled={!voteReasoning.trim()}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Favor Plaintiff
                  </Button>
                  <Button
                    onClick={() => onVote(dispute.id, false, voteReasoning)}
                    className="flex-1"
                    variant="outline"
                    disabled={!voteReasoning.trim()}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Favor Defendant
                  </Button>
                </div>
                <Button
                  onClick={() => setShowVoting(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {hasVoted && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">You have voted on this dispute</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
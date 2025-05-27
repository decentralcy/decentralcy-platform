import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Clock } from "lucide-react";
import { Job } from "@shared/schema";
import { tempAgencyContract } from "@/lib/contracts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DisputeResolutionProps {
  job: Job;
  userAddress: string;
}

export default function DisputeResolution({ job, userAddress }: DisputeResolutionProps) {
  const [disputeReason, setDisputeReason] = useState("");
  const [isRaisingDispute, setIsRaisingDispute] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canRaiseDispute = 
    (job.employerAddress.toLowerCase() === userAddress.toLowerCase() || 
     job.workerAddress?.toLowerCase() === userAddress.toLowerCase()) &&
    job.status === "filled" && 
    !job.disputed;

  const raiseDisputeMutation = useMutation({
    mutationFn: async () => {
      if (!job.contractJobId || !disputeReason.trim()) {
        throw new Error("Missing contract job ID or dispute reason");
      }

      // Raise dispute on smart contract
      const tx = await tempAgencyContract.raiseDispute(job.contractJobId);
      const receipt = await tx.wait();

      // Create dispute record in database
      await apiRequest("POST", "/api/disputes", {
        jobId: job.id,
        raiserAddress: userAddress,
        reason: disputeReason,
        evidence: "", // Could be IPFS hash in the future
      });

      // Update job status
      await apiRequest("PATCH", `/api/jobs/${job.id}`, {
        disputed: true,
        status: "disputed",
      });

      return receipt;
    },
    onSuccess: () => {
      toast({
        title: "Dispute Raised Successfully",
        description: "Your dispute has been submitted for review. Platform administrators will investigate.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setDisputeReason("");
      setIsRaisingDispute(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Raise Dispute",
        description: error.message,
      });
    },
  });

  if (job.disputed) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Job Under Dispute
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge className="bg-orange-100 text-orange-800">
              <Clock className="mr-1 h-3 w-3" />
              Under Review
            </Badge>
            <p className="text-orange-700">
              This job is currently under dispute review. Platform administrators are investigating the issue.
              Payment is locked until resolution.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canRaiseDispute) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center text-yellow-800">
          <Shield className="mr-2 h-5 w-5" />
          Dispute Resolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isRaisingDispute ? (
          <div className="space-y-3">
            <p className="text-yellow-700">
              Having issues with this job? Our dispute resolution system ensures fair outcomes for all parties.
            </p>
            <Button
              onClick={() => setIsRaisingDispute(true)}
              variant="outline"
              className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Raise Dispute
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-2">
                Describe the Issue
              </label>
              <Textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain the problem with this job (e.g., work not delivered as agreed, payment issues, communication problems)..."
                rows={4}
                className="border-yellow-300 focus:border-yellow-500"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => raiseDisputeMutation.mutate()}
                disabled={raiseDisputeMutation.isPending || !disputeReason.trim()}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                {raiseDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
              </Button>
              <Button
                onClick={() => setIsRaisingDispute(false)}
                variant="outline"
                className="border-yellow-400 text-yellow-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Code, Palette, TrendingUp } from "lucide-react";
import { Job } from "@shared/schema";
import { web3Service } from "@/lib/web3";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: number) => void;
  isConnected: boolean;
  userAddress?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "development":
      return <Code className="text-blue-600 h-5 w-5" />;
    case "design":
      return <Palette className="text-purple-600 h-5 w-5" />;
    case "marketing":
      return <TrendingUp className="text-green-600 h-5 w-5" />;
    default:
      return <Code className="text-blue-600 h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "development":
      return "bg-blue-100";
    case "design":
      return "bg-purple-100";
    case "marketing":
      return "bg-green-100";
    default:
      return "bg-blue-100";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-green-100 text-green-800">Open</Badge>;
    case "filled":
      return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
};

export default function JobCard({ job, onApply, isConnected, userAddress }: JobCardProps) {
  const isOwnJob = userAddress && job.employerAddress.toLowerCase() === userAddress.toLowerCase();
  const canApply = isConnected && !isOwnJob && job.status === "open";

  const handleApply = () => {
    if (onApply && canApply) {
      onApply(job.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 ${getCategoryColor(job.category)} rounded-lg flex items-center justify-center`}>
              {getCategoryIcon(job.category)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <p className="text-sm text-gray-600">
                {web3Service.formatAddress(job.employerAddress)}
              </p>
            </div>
          </div>
          {getStatusBadge(job.status)}
        </div>
        
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {job.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="h-3 w-3" />
              <span className="text-sm">{job.duration}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-3 w-3" />
              <span className="text-sm">{job.location}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {job.paymentAmount} ETH
              </div>
              <div className="text-sm text-gray-600">Escrowed Payment</div>
            </div>
            {job.status === "open" && (
              <Button 
                onClick={handleApply}
                disabled={!canApply}
                className={canApply ? "bg-primary text-white hover:bg-primary/90" : ""}
              >
                {isOwnJob ? "Your Job" : canApply ? "Apply Now" : "Connect Wallet"}
              </Button>
            )}
            {job.status === "filled" && (
              <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                Filled
              </Button>
            )}
            {job.status === "completed" && (
              <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

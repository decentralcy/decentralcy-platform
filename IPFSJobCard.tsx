import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Globe, Shield, Hash, Download, ExternalLink, FileText, CheckCircle } from "lucide-react";
import { ipfsService } from "@/lib/ipfs";
import type { Job } from "@shared/schema";

interface IPFSJobCardProps {
  job: Job & { ipfsHash?: string; attachmentHashes?: string[] };
  onApply?: (jobId: number) => void;
  isConnected: boolean;
  userAddress?: string;
}

interface JobMetadata {
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  skills: string[];
  category: string;
  location: string;
  duration: string;
  attachmentHashes?: string[];
  createdAt: string;
  version: string;
}

export default function IPFSJobCard({ job, onApply, isConnected, userAddress }: IPFSJobCardProps) {
  const [ipfsMetadata, setIpfsMetadata] = useState<JobMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [ipfsError, setIpfsError] = useState<string | null>(null);

  useEffect(() => {
    if (job.ipfsHash) {
      loadIPFSMetadata();
    }
  }, [job.ipfsHash]);

  const loadIPFSMetadata = async () => {
    if (!job.ipfsHash) return;
    
    setIsLoadingMetadata(true);
    setIpfsError(null);
    
    try {
      const metadata = await ipfsService.getJobMetadata(job.ipfsHash);
      if (metadata) {
        setIpfsMetadata(metadata);
      } else {
        setIpfsError("Failed to load IPFS content");
      }
    } catch (error) {
      console.error("Error loading IPFS metadata:", error);
      setIpfsError("IPFS content unavailable");
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: "bg-green-100 text-green-800", label: "Open" },
      assigned: { color: "bg-blue-100 text-blue-800", label: "Assigned" },
      inprogress: { color: "bg-yellow-100 text-yellow-800", label: "In Progress" },
      completed: { color: "bg-purple-100 text-purple-800", label: "Completed" },
      paid: { color: "bg-gray-100 text-gray-800", label: "Paid" },
      disputed: { color: "bg-red-100 text-red-800", label: "Disputed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const openIPFSLink = (hash: string) => {
    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
  };

  // Use IPFS metadata if available, otherwise fall back to database data
  const displayData = ipfsMetadata || {
    title: job.title,
    description: job.description,
    requirements: [],
    deliverables: [],
    skills: [],
    category: job.category,
    location: job.location,
    duration: job.duration
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{displayData.title}</CardTitle>
            <CardDescription className="text-base">
              {displayData.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(job.status)}
            {job.ipfsHash && (
              <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                <Globe className="w-3 h-3 mr-1" />
                IPFS Stored
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Category:</span>
            <div className="font-medium">{displayData.category}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Location:</span>
            <div className="font-medium">{displayData.location}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Duration:</span>
            <div className="font-medium">{displayData.duration}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Payment:</span>
            <div className="font-medium">{job.paymentAmount} ETH</div>
          </div>
        </div>

        {/* Skills */}
        {displayData.skills && displayData.skills.length > 0 && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Required Skills:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {displayData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Requirements (IPFS only) */}
        {ipfsMetadata && ipfsMetadata.requirements.length > 0 && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Requirements:</span>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              {ipfsMetadata.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Deliverables (IPFS only) */}
        {ipfsMetadata && ipfsMetadata.deliverables.length > 0 && (
          <div>
            <span className="text-sm font-medium text-muted-foreground">Deliverables:</span>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              {ipfsMetadata.deliverables.map((deliverable, index) => (
                <li key={index}>{deliverable}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* IPFS Information */}
        {job.ipfsHash && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Decentralized Storage</span>
            </div>
            
            {isLoadingMetadata && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                Loading from IPFS...
              </div>
            )}

            {ipfsError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {ipfsError} - Using cached data
              </div>
            )}

            {ipfsMetadata && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Content verified from IPFS
              </div>
            )}

            <div className="flex items-center gap-2">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <code className="text-xs text-muted-foreground font-mono">
                {job.ipfsHash.slice(0, 20)}...
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openIPFSLink(job.ipfsHash!)}
                className="h-6 px-2 text-xs"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            {/* Attachments */}
            {job.attachmentHashes && job.attachmentHashes.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Attachments:</span>
                <div className="space-y-1 mt-1">
                  {job.attachmentHashes.map((hash, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <code className="text-xs text-muted-foreground font-mono">
                        {hash.slice(0, 15)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openIPFSLink(hash)}
                        className="h-5 px-1 text-xs"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Posted: {formatDate(job.createdAt)}
          </div>
          
          <div className="flex gap-2">
            {job.ipfsHash && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openIPFSLink(job.ipfsHash!)}
              >
                <Globe className="w-4 h-4 mr-1" />
                View on IPFS
              </Button>
            )}
            
            {onApply && isConnected && job.status === "open" && userAddress !== job.employerAddress && (
              <Button onClick={() => onApply(job.id)} size="sm">
                Apply Now
              </Button>
            )}
          </div>
        </div>

        {/* Decentralization Benefits */}
        {job.ipfsHash && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-xs text-green-700 dark:text-green-300">
                <div className="font-medium mb-1">Decentralized & Immutable</div>
                <div>This job description is permanently stored on IPFS, ensuring it cannot be censored, modified, or taken down by any single entity.</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
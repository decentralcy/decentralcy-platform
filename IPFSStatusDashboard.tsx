import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Globe, Database, Shield, Hash, ExternalLink, CheckCircle, AlertCircle, FileText } from "lucide-react";

interface IPFSStatusDashboardProps {
  userAddress: string;
}

interface IPFSStats {
  isConnected: boolean;
  totalJobs: number;
  totalProfiles: number;
  totalFiles: number;
  totalStorage: string;
  networkPeers: number;
  recentUploads: {
    hash: string;
    type: 'job' | 'profile' | 'file';
    title: string;
    timestamp: Date;
    size: string;
  }[];
}

export default function IPFSStatusDashboard({ userAddress }: IPFSStatusDashboardProps) {
  const [ipfsStats, setIpfsStats] = useState<IPFSStats>({
    isConnected: true, // Simulated for demo
    totalJobs: 12,
    totalProfiles: 3,
    totalFiles: 28,
    totalStorage: "2.4 MB",
    networkPeers: 157,
    recentUploads: [
      {
        hash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        type: "job",
        title: "Blockchain Developer Position",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: "15.2 KB"
      },
      {
        hash: "bafybeihkoviema7g3gxyt6la7b7kbbblgxdhm2pfmw7kd6ko2gxwrqbdru4",
        type: "profile",
        title: "Updated Worker Profile",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        size: "8.7 KB"
      },
      {
        hash: "bafybeiecucjdvd4aekzm5u5yoqp3nk5cgwjj5y3h3khpxkej3k7z9u9k5y",
        type: "file",
        title: "Project_Specification.pdf",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        size: "1.2 MB"
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = async () => {
    setIsLoading(true);
    // Simulate API call to get real IPFS stats
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'profile':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'file':
        return <Globe className="w-4 h-4 text-purple-500" />;
      default:
        return <Hash className="w-4 h-4 text-gray-500" />;
    }
  };

  const openIPFSLink = (hash: string) => {
    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
  };

  return (
    <div className="w-full space-y-6">
      {/* IPFS Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            IPFS Network Status
          </CardTitle>
          <CardDescription>
            Your connection to the InterPlanetary File System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${ipfsStats.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">
                  {ipfsStats.isConnected ? 'Connected' : 'Disconnected'}
                </div>
                <div className="text-sm text-muted-foreground">Network Status</div>
              </div>
            </div>
            
            <div>
              <div className="font-bold text-xl">{ipfsStats.networkPeers}</div>
              <div className="text-sm text-muted-foreground">Network Peers</div>
            </div>
            
            <div>
              <div className="font-bold text-xl">{ipfsStats.totalStorage}</div>
              <div className="text-sm text-muted-foreground">Total Stored</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshStats}
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh Stats"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Job Postings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipfsStats.totalJobs}</div>
            <div className="text-sm text-muted-foreground">Stored on IPFS</div>
            <Progress value={75} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" />
              Worker Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipfsStats.totalProfiles}</div>
            <div className="text-sm text-muted-foreground">Decentralized profiles</div>
            <Progress value={45} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              Files & Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipfsStats.totalFiles}</div>
            <div className="text-sm text-muted-foreground">Attachments & media</div>
            <Progress value={60} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent IPFS Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent IPFS Uploads</CardTitle>
          <CardDescription>
            Your latest content stored on the decentralized web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ipfsStats.recentUploads.map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getTypeIcon(upload.type)}
                  <div>
                    <div className="font-medium">{upload.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(upload.timestamp)} • {upload.size}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {upload.type}
                  </Badge>
                  <code className="text-xs text-muted-foreground font-mono">
                    {upload.hash.slice(0, 12)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openIPFSLink(upload.hash)}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IPFS Benefits & Education */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Shield className="w-5 h-5" />
              Decentralization Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Content cannot be censored or taken down</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Immutable records prevent tampering</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Global accessibility without borders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No single point of failure</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Database className="w-5 h-5" />
              Technical Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-green-700 dark:text-green-300">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>Content-addressed using cryptographic hashes</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Distributed across global peer network</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Built-in deduplication and versioning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Automatic content pinning and backup</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IPFS Network Info */}
      <Card>
        <CardHeader>
          <CardTitle>IPFS Network Information</CardTitle>
          <CardDescription>
            Understanding the decentralized infrastructure powering Decentralcy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">What is IPFS?</h4>
                <p className="text-sm text-muted-foreground">
                  The InterPlanetary File System is a distributed system for storing and accessing 
                  files, websites, applications, and data. Unlike traditional web servers, IPFS 
                  creates a resilient network where content is distributed across many nodes.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">How it Powers Decentralcy</h4>
                <p className="text-sm text-muted-foreground">
                  Your job postings, worker profiles, and attachments are stored permanently on 
                  IPFS, ensuring they remain accessible even if Decentralcy's servers go offline. 
                  This creates true decentralization and censorship resistance.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Revolutionary Impact:</strong> By using IPFS, Decentralcy eliminates traditional 
                corporate control over your work data. Your content lives on the decentralized web forever.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
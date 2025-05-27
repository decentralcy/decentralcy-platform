import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Coins, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Copy,
  Wallet,
  ArrowRight,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

interface SmartContractManagerProps {
  userAddress: string;
  isConnected: boolean;
}

interface ContractJob {
  id: number;
  title: string;
  employer: string;
  worker: string;
  paymentAmount: string;
  paymentToken: string;
  status: 'open' | 'assigned' | 'completed' | 'paid' | 'disputed';
  escrowLocked: boolean;
  transactionHash?: string;
  contractAddress?: string;
  deadline: Date;
  createdAt: Date;
}

interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  blockNumber?: number;
}

export default function SmartContractManager({ userAddress, isConnected }: SmartContractManagerProps) {
  const [activeTransactions, setActiveTransactions] = useState<TransactionStatus[]>([]);
  const [selectedJob, setSelectedJob] = useState<ContractJob | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const { toast } = useToast();

  // Mock contract jobs data - in production this would come from blockchain
  const mockContractJobs: ContractJob[] = [
    {
      id: 1,
      title: "Smart Contract Audit for DeFi Protocol",
      employer: "0x1234567890123456789012345678901234567890",
      worker: userAddress,
      paymentAmount: "2.5",
      paymentToken: "ETH",
      status: "assigned",
      escrowLocked: true,
      transactionHash: "0xabc123...",
      contractAddress: "0xdef456...",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: "NFT Marketplace Development",
      employer: userAddress,
      worker: "0x9876543210987654321098765432109876543210",
      paymentAmount: "1.8",
      paymentToken: "ETH",
      status: "completed",
      escrowLocked: true,
      transactionHash: "0x789xyz...",
      contractAddress: "0x123abc...",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  // Smart contract interactions
  const createJobMutation = useMutation({
    mutationFn: async (jobData: { title: string; paymentAmount: string; worker: string }) => {
      if (!window.ethereum) throw new Error("MetaMask not found");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Simulate contract deployment
      const tx = await signer.sendTransaction({
        to: "0x0000000000000000000000000000000000000000", // Contract factory
        value: ethers.parseEther(jobData.paymentAmount),
        data: "0x" // Contract creation data
      });

      setActiveTransactions(prev => [...prev, {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }]);

      return tx;
    },
    onSuccess: (tx) => {
      toast({
        title: "Job Contract Created!",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const completeJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      if (!window.ethereum) throw new Error("MetaMask not found");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Simulate job completion transaction
      const tx = await signer.sendTransaction({
        to: selectedJob?.contractAddress,
        data: "0x" // Complete job function call
      });

      setActiveTransactions(prev => [...prev, {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }]);

      return tx;
    },
    onSuccess: () => {
      toast({
        title: "Job Marked Complete!",
        description: "Waiting for employer confirmation to release escrow.",
      });
    }
  });

  const releaseEscrowMutation = useMutation({
    mutationFn: async (jobId: number) => {
      if (!window.ethereum) throw new Error("MetaMask not found");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Simulate escrow release transaction
      const tx = await signer.sendTransaction({
        to: selectedJob?.contractAddress,
        data: "0x" // Release escrow function call
      });

      setActiveTransactions(prev => [...prev, {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }]);

      return tx;
    },
    onSuccess: () => {
      toast({
        title: "Escrow Released!",
        description: "Payment has been sent to the worker.",
      });
    }
  });

  const estimateGas = async (operation: string) => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Simulate gas estimation
      setGasEstimate("0.0024 ETH (~$4.20)");
    } catch (error) {
      console.error("Gas estimation failed:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard.",
    });
  };

  const openEtherscan = (hash: string) => {
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: "bg-blue-100 text-blue-800", label: "Open", icon: <Clock className="w-3 h-3" /> },
      assigned: { color: "bg-yellow-100 text-yellow-800", label: "In Progress", icon: <ArrowRight className="w-3 h-3" /> },
      completed: { color: "bg-green-100 text-green-800", label: "Completed", icon: <CheckCircle className="w-3 h-3" /> },
      paid: { color: "bg-purple-100 text-purple-800", label: "Paid", icon: <CheckCircle className="w-3 h-3" /> },
      disputed: { color: "bg-red-100 text-red-800", label: "Disputed", icon: <AlertTriangle className="w-3 h-3" /> },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return "Overdue";
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d remaining`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Blockchain Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Smart Contract Manager
          </CardTitle>
          <CardDescription>
            Manage blockchain interactions, escrow, and trustless payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">
                  {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isConnected ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Connect MetaMask'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Network</div>
                <div className="text-sm text-muted-foreground">Ethereum Mainnet</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">Gas Price</div>
                <div className="text-sm text-muted-foreground">25 gwei (~$2.40)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Transactions */}
      {activeTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTransactions.map((tx) => (
                <div key={tx.hash} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <div>
                      <p className="font-medium">Transaction Pending</p>
                      <p className="text-sm text-muted-foreground">{tx.hash.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tx.confirmations}/12 confirmations</Badge>
                    <Button variant="ghost" size="sm" onClick={() => openEtherscan(tx.hash)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Jobs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Contracts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {mockContractJobs.filter(job => ['assigned', 'completed'].includes(job.status)).map((job) => (
              <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedJob(job)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">Contract #{job.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(job.status)}
                      <div className="flex items-center gap-1">
                        {job.escrowLocked ? <Lock className="w-3 h-3 text-orange-500" /> : <Unlock className="w-3 h-3 text-green-500" />}
                        <span className="text-xs text-muted-foreground">
                          {job.escrowLocked ? 'Escrowed' : 'Released'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Payment:</span>
                      <div className="font-medium">{job.paymentAmount} {job.paymentToken}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Employer:</span>
                      <div className="font-mono text-xs">{job.employer.slice(0, 6)}...{job.employer.slice(-4)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Worker:</span>
                      <div className="font-mono text-xs">{job.worker.slice(0, 6)}...{job.worker.slice(-4)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <div className="font-medium">{formatTimeRemaining(job.deadline)}</div>
                    </div>
                  </div>

                  {job.contractAddress && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-mono">{job.contractAddress}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(job.contractAddress!);
                      }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {mockContractJobs.filter(job => job.status === 'paid').map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">Completed on {job.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+{job.paymentAmount} {job.paymentToken}</div>
                      <Badge className="bg-green-100 text-green-800">Paid</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">4.3 ETH</p>
                  </div>
                  <Coins className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Contracts</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gas Spent</p>
                    <p className="text-2xl font-bold">0.024 ETH</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Actions Modal */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contract Actions: {selectedJob.title}</span>
              <Button variant="ghost" onClick={() => setSelectedJob(null)}>×</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                All actions are secured by smart contracts. Transactions are irreversible once confirmed.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Contract Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span className="font-medium">{selectedJob.paymentAmount} {selectedJob.paymentToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Escrow Status:</span>
                    <span className={selectedJob.escrowLocked ? 'text-orange-600' : 'text-green-600'}>
                      {selectedJob.escrowLocked ? 'Locked' : 'Released'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Estimate:</span>
                    <span>{gasEstimate || 'Calculating...'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Available Actions</h4>
                <div className="space-y-2">
                  {selectedJob.worker === userAddress && selectedJob.status === 'assigned' && (
                    <Button 
                      onClick={() => completeJobMutation.mutate(selectedJob.id)}
                      disabled={completeJobMutation.isPending}
                      className="w-full"
                      onMouseEnter={() => estimateGas('complete')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Job Complete
                    </Button>
                  )}
                  
                  {selectedJob.employer === userAddress && selectedJob.status === 'completed' && (
                    <Button 
                      onClick={() => releaseEscrowMutation.mutate(selectedJob.id)}
                      disabled={releaseEscrowMutation.isPending}
                      className="w-full"
                      onMouseEnter={() => estimateGas('release')}
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Release Escrow
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" onClick={() => openEtherscan(selectedJob.transactionHash!)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
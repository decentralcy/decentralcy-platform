import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Shield, 
  Key, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Minus,
  Copy,
  ExternalLink,
  Vote,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiSigWalletIntegrationProps {
  userAddress: string;
  isConnected: boolean;
}

interface MultiSigWallet {
  id: string;
  address: string;
  name: string;
  description: string;
  owners: string[];
  threshold: number;
  balance: string;
  transactionCount: number;
  createdAt: Date;
  network: string;
}

interface PendingTransaction {
  id: string;
  walletId: string;
  to: string;
  value: string;
  data: string;
  description: string;
  confirmations: string[];
  requiredConfirmations: number;
  deadline: Date;
  createdBy: string;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: Date;
}

interface WalletOwner {
  address: string;
  name?: string;
  role: 'owner' | 'admin' | 'executor';
  addedAt: Date;
}

export default function MultiSigWalletIntegration({ userAddress, isConnected }: MultiSigWalletIntegrationProps) {
  const [selectedWallet, setSelectedWallet] = useState<MultiSigWallet | null>(null);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [newThreshold, setNewThreshold] = useState(2);
  const [transactionTo, setTransactionTo] = useState("");
  const [transactionValue, setTransactionValue] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const { toast } = useToast();

  // Mock data for multi-sig wallets
  const mockWallets: MultiSigWallet[] = [
    {
      id: "wallet_1",
      address: "0x1234567890123456789012345678901234567890",
      name: "High-Value Job Escrow",
      description: "Multi-sig wallet for jobs above 10 ETH requiring additional security",
      owners: [
        userAddress,
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012"
      ],
      threshold: 2,
      balance: "25.7 ETH",
      transactionCount: 12,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      network: "Ethereum"
    },
    {
      id: "wallet_2", 
      address: "0x4567890123456789012345678901234567890123",
      name: "Platform Treasury",
      description: "Multi-sig for platform revenue and governance decisions",
      owners: [
        userAddress,
        "0x5678901234567890123456789012345678901234",
        "0x6789012345678901234567890123456789012345",
        "0x7890123456789012345678901234567890123456"
      ],
      threshold: 3,
      balance: "142.3 ETH",
      transactionCount: 47,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      network: "Ethereum"
    }
  ];

  const mockPendingTransactions: PendingTransaction[] = [
    {
      id: "tx_1",
      walletId: "wallet_1",
      to: "0x9876543210987654321098765432109876543210",
      value: "5.0",
      data: "0x",
      description: "Release payment for Smart Contract Audit project",
      confirmations: [userAddress],
      requiredConfirmations: 2,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdBy: userAddress,
      status: "pending",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: "tx_2",
      walletId: "wallet_2", 
      to: "0x1111222233334444555566667777888899990000",
      value: "10.0",
      data: "0x",
      description: "Platform development funding for Q1 2024",
      confirmations: [
        "0x5678901234567890123456789012345678901234",
        "0x6789012345678901234567890123456789012345"
      ],
      requiredConfirmations: 3,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdBy: "0x5678901234567890123456789012345678901234",
      status: "pending",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  const createWalletMutation = useMutation({
    mutationFn: async (params: { owners: string[]; threshold: number; name: string; description: string }) => {
      // Simulate multi-sig wallet creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newWallet: MultiSigWallet = {
        id: `wallet_${Date.now()}`,
        address: "0x" + Math.random().toString(16).substr(2, 40),
        name: params.name,
        description: params.description,
        owners: params.owners,
        threshold: params.threshold,
        balance: "0 ETH",
        transactionCount: 0,
        createdAt: new Date(),
        network: "Ethereum"
      };

      return {
        wallet: newWallet,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64)
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Multi-Sig Wallet Created! 🔐",
        description: `Wallet deployed at ${data.wallet.address.slice(0, 8)}...`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Wallet Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const submitTransactionMutation = useMutation({
    mutationFn: async (params: { walletId: string; to: string; value: string; description: string }) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: PendingTransaction = {
        id: `tx_${Date.now()}`,
        walletId: params.walletId,
        to: params.to,
        value: params.value,
        data: "0x",
        description: params.description,
        confirmations: [userAddress],
        requiredConfirmations: selectedWallet?.threshold || 2,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: userAddress,
        status: "pending",
        createdAt: new Date()
      };

      return newTransaction;
    },
    onSuccess: () => {
      toast({
        title: "Transaction Submitted!",
        description: "Waiting for other owners to confirm",
      });
      setTransactionTo("");
      setTransactionValue("");
      setTransactionDescription("");
    }
  });

  const confirmTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { transactionId, confirmed: true };
    },
    onSuccess: () => {
      toast({
        title: "Transaction Confirmed!",
        description: "Your confirmation has been recorded",
      });
    }
  });

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return "Expired";
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d remaining`;
  };

  const isUserOwner = (wallet: MultiSigWallet) => {
    return wallet.owners.includes(userAddress);
  };

  const hasUserConfirmed = (transaction: PendingTransaction) => {
    return transaction.confirmations.includes(userAddress);
  };

  const getConfirmationProgress = (transaction: PendingTransaction) => {
    return (transaction.confirmations.length / transaction.requiredConfirmations) * 100;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-500" />
            Multi-Signature Wallet Integration
          </CardTitle>
          <CardDescription>
            Enhanced security for high-value contracts through multi-party approval
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
          <TabsTrigger value="pending">Pending Transactions</TabsTrigger>
          <TabsTrigger value="create">Create Wallet</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {mockWallets.map((wallet) => (
              <Card 
                key={wallet.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedWallet?.id === wallet.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedWallet(wallet)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{wallet.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{wallet.description}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      {wallet.threshold}/{wallet.owners.length} Multi-Sig
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded">
                      {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(wallet.address);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Balance:</span>
                      <div className="font-bold">{wallet.balance}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transactions:</span>
                      <div className="font-bold">{wallet.transactionCount}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Owners ({wallet.owners.length}):</span>
                    <div className="flex -space-x-2">
                      {wallet.owners.slice(0, 3).map((owner, index) => (
                        <Avatar key={index} className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {owner.slice(2, 4).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {wallet.owners.length > 3 && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                          +{wallet.owners.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {isUserOwner(wallet) && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      You are an owner
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {mockPendingTransactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Pending Transactions</h3>
                <p className="text-muted-foreground">
                  All multi-sig transactions have been completed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockPendingTransactions.map((transaction) => {
                const wallet = mockWallets.find(w => w.id === transaction.walletId);
                return (
                  <Card key={transaction.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{transaction.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {wallet?.name} • To: {transaction.to.slice(0, 8)}...{transaction.to.slice(-6)}
                          </p>
                        </div>
                        <Badge className={
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'executed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <div className="font-bold">{transaction.value} ETH</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Confirmations:</span>
                          <div className="font-bold">
                            {transaction.confirmations.length}/{transaction.requiredConfirmations}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Deadline:</span>
                          <div className="font-bold">{formatTimeRemaining(transaction.deadline)}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Confirmation Progress</span>
                          <span>{Math.round(getConfirmationProgress(transaction))}%</span>
                        </div>
                        <Progress value={getConfirmationProgress(transaction)} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Created {transaction.createdAt.toLocaleDateString()}
                        </div>

                        {transaction.status === 'pending' && isUserOwner(wallet!) && !hasUserConfirmed(transaction) && (
                          <Button
                            onClick={() => confirmTransactionMutation.mutate(transaction.id)}
                            disabled={confirmTransactionMutation.isPending}
                            size="sm"
                          >
                            <Vote className="w-4 h-4 mr-2" />
                            Confirm Transaction
                          </Button>
                        )}

                        {hasUserConfirmed(transaction) && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            You confirmed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New Multi-Sig Wallet</CardTitle>
              <CardDescription>
                Set up a secure multi-signature wallet for high-value transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Wallet Name</label>
                  <Input placeholder="e.g., High-Value Job Escrow" />
                </div>
                <div>
                  <label className="text-sm font-medium">Required Confirmations</label>
                  <Select value={newThreshold.toString()} onValueChange={(value) => setNewThreshold(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} of {num + 1} signatures required
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Describe the purpose of this multi-sig wallet..." />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Wallet Owners</label>
                  <span className="text-xs text-muted-foreground">
                    {newThreshold} of {newThreshold + 1} signatures will be required
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="0x... owner address"
                      value={newOwnerAddress}
                      onChange={(e) => setNewOwnerAddress(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <span className="text-sm font-mono">{userAddress}</span>
                      <Badge className="bg-green-600 text-white">You (Owner)</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => createWalletMutation.mutate({
                  owners: [userAddress, newOwnerAddress].filter(Boolean),
                  threshold: newThreshold,
                  name: "New Multi-Sig Wallet",
                  description: "Secure wallet for high-value transactions"
                })}
                disabled={createWalletMutation.isPending || !newOwnerAddress}
                className="w-full"
                size="lg"
              >
                {createWalletMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Wallet...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Create Multi-Sig Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {!selectedWallet ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a Wallet</h3>
                <p className="text-muted-foreground">
                  Choose a wallet from the "My Wallets" tab to manage it
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Submit Transaction */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submit New Transaction</CardTitle>
                  <CardDescription>
                    Create a transaction that requires {selectedWallet.threshold} confirmations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Recipient Address</label>
                      <Input
                        placeholder="0x..."
                        value={transactionTo}
                        onChange={(e) => setTransactionTo(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Amount (ETH)</label>
                      <Input
                        placeholder="0.0"
                        value={transactionValue}
                        onChange={(e) => setTransactionValue(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Transaction Description</label>
                    <Textarea
                      placeholder="Describe the purpose of this transaction..."
                      value={transactionDescription}
                      onChange={(e) => setTransactionDescription(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={() => submitTransactionMutation.mutate({
                      walletId: selectedWallet.id,
                      to: transactionTo,
                      value: transactionValue,
                      description: transactionDescription
                    })}
                    disabled={submitTransactionMutation.isPending || !transactionTo || !transactionValue}
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Submit for Multi-Sig Approval
                  </Button>
                </CardContent>
              </Card>

              {/* Wallet Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wallet Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Current Threshold:</span>
                      <div className="font-bold">{selectedWallet.threshold} of {selectedWallet.owners.length}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Total Owners:</span>
                      <div className="font-bold">{selectedWallet.owners.length}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Wallet Owners:</span>
                    {selectedWallet.owners.map((owner, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-mono">{owner.slice(0, 12)}...{owner.slice(-8)}</span>
                        {owner === userAddress && (
                          <Badge className="bg-blue-100 text-blue-800">You</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Security Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">
              Enterprise-Grade Security
            </h3>
            <p className="text-purple-700 dark:text-purple-300 max-w-2xl mx-auto">
              Multi-signature wallets eliminate single points of failure for high-value contracts. 
              Require multiple parties to approve transactions, preventing unauthorized access and 
              ensuring transparency in financial operations.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-purple-600 text-white">Multi-Party Approval</Badge>
              <Badge className="bg-blue-600 text-white">Zero Single Points of Failure</Badge>
              <Badge className="bg-green-600 text-white">Transparent Operations</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Wallet, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

interface EnhancedWalletConnectProps {
  userAddress: string;
  isConnected: boolean;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  chainName: string;
  ensName?: string;
}

export default function EnhancedWalletConnect({ 
  userAddress, 
  isConnected, 
  onConnect, 
  onDisconnect 
}: EnhancedWalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  // Network configurations
  const networks = {
    1: { name: "Ethereum Mainnet", color: "bg-blue-500" },
    5: { name: "Goerli Testnet", color: "bg-yellow-500" },
    11155111: { name: "Sepolia Testnet", color: "bg-purple-500" },
    137: { name: "Polygon", color: "bg-purple-600" },
    42161: { name: "Arbitrum", color: "bg-blue-600" }
  };

  useEffect(() => {
    if (isConnected && userAddress) {
      loadWalletInfo();
    }
  }, [isConnected, userAddress]);

  const loadWalletInfo = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(userAddress);
      const network = await provider.getNetwork();
      
      // Try to resolve ENS name
      let ensName;
      try {
        ensName = await provider.lookupAddress(userAddress);
      } catch (e) {
        // ENS resolution failed, that's okay
      }

      setWalletInfo({
        address: userAddress,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        chainName: networks[Number(network.chainId) as keyof typeof networks]?.name || "Unknown Network",
        ensName
      });
    } catch (error) {
      console.error("Failed to load wallet info:", error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please make sure MetaMask is unlocked.");
      }

      const address = accounts[0];
      onConnect(address);
      
      toast({
        title: "Wallet Connected Successfully!",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      setError(error.message || "Failed to connect wallet");
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onDisconnect();
    setWalletInfo(null);
    setShowDetails(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected.",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress);
    toast({
      title: "Address Copied!",
      description: "Wallet address copied to clipboard.",
    });
  };

  const openEtherscan = () => {
    const baseUrl = walletInfo?.chainId === 1 ? "https://etherscan.io" : "https://goerli.etherscan.io";
    window.open(`${baseUrl}/address/${userAddress}`, '_blank');
  };

  const switchNetwork = async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      toast({
        title: "Network Switched",
        description: `Switched to ${networks[chainId as keyof typeof networks]?.name}`,
      });
      
      // Reload wallet info
      setTimeout(loadWalletInfo, 1000);
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            Connect Your Wallet
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to access Decentralcy's decentralized marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have MetaMask?
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Install MetaMask
            </Button>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="font-medium mb-1">Secure Connection</div>
                <div>Your wallet connection is secure and private. Decentralcy never stores your private keys.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userAddress.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {walletInfo?.ensName || `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Connected
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      {showDetails && walletInfo && (
        <CardContent className="space-y-4">
          {/* Balance */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-bold">{parseFloat(walletInfo.balance).toFixed(4)} ETH</p>
            </div>
            <Button variant="ghost" size="sm" onClick={loadWalletInfo}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${networks[walletInfo.chainId as keyof typeof networks]?.color || 'bg-gray-500'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="font-medium">{walletInfo.chainName}</p>
              </div>
            </div>
            {walletInfo.chainId !== 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => switchNetwork(1)}
              >
                Switch to Mainnet
              </Button>
            )}
          </div>

          {/* Address Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyAddress} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </Button>
            <Button variant="outline" size="sm" onClick={openEtherscan} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          </div>

          {/* ENS Badge */}
          {walletInfo.ensName && (
            <Badge className="w-full justify-center bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              ENS Name Resolved
            </Badge>
          )}

          {/* Disconnect */}
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={disconnectWallet}
            className="w-full"
          >
            Disconnect Wallet
          </Button>

          {/* Security Info */}
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-xs text-green-700 dark:text-green-300">
                <div className="font-medium mb-1">Secure & Private</div>
                <div>Your connection is encrypted and your keys remain in your wallet.</div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
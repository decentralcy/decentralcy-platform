import { useState, useEffect } from "react";
import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import EnhancedFrontendExperience from "@/components/EnhancedFrontendExperience";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { 
  Wallet, 
  Globe, 
  Sparkles, 
  Shield, 
  Zap,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

function Router() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userType, setUserType] = useState<'worker' | 'employer' | 'both'>('worker');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkWalletConnection();
    
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet!');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Globe className="w-12 h-12 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 animate-ping"></div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Decentralcy
            </h1>
            <p className="text-muted-foreground">Loading your decentralized workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Decentralcy
              </span>
            </Link>
            
            <div className="hidden md:flex gap-6">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Sparkles className="w-4 h-4" />
                Home
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Zap className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="w-10 h-10 p-0"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {isConnected ? (
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Connected
                </Badge>
                <div className="text-sm font-mono text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
              </div>
            ) : (
              <Button onClick={connectWallet} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden w-10 h-10 p-0"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {showMobileMenu && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-6 space-y-4">
              <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                <Sparkles className="w-4 h-4" />
                Home
              </Link>
              <Link href="/dashboard" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                <Zap className="w-4 h-4" />
                Dashboard
              </Link>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 mb-4"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                
                {isConnected ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      Connected
                    </Badge>
                    <div className="text-sm font-mono text-muted-foreground">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <Button onClick={connectWallet} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Switch>
          <Route path="/">
            <EnhancedFrontendExperience 
              userAddress={userAddress}
              isConnected={isConnected}
              userType={userType}
            />
          </Route>
          <Route path="/dashboard">
            <UnifiedDashboard 
              userAddress={userAddress}
              isConnected={isConnected}
              userType={userType}
              userTier="free"
            />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Decentralcy
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                The revolutionary decentralized work platform. Where work is valued without middlemen, where trust is earned by code, not contracts.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Find Work</div>
                <div>Hire Talent</div>
                <div>Smart Contracts</div>
                <div>Reputation System</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Multi-Chain Payments</div>
                <div>AI Job Matching</div>
                <div>Analytics Dashboard</div>
                <div>Blockchain Security</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Help Center</div>
                <div>Community</div>
                <div>Documentation</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Decentralcy. Built on blockchain technology for the future of work.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

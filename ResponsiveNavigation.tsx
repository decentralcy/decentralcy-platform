import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  Search, 
  MessageCircle, 
  Scale, 
  User, 
  Briefcase,
  Bell,
  Settings,
  LogOut,
  Wallet,
  TrendingUp,
  Shield,
  Globe
} from "lucide-react";
import { useLocation } from "wouter";
import EnhancedWalletConnect from "./EnhancedWalletConnect";
import NotificationCenter from "./NotificationCenter";

interface ResponsiveNavigationProps {
  userAddress: string;
  isConnected: boolean;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
  description: string;
}

export default function ResponsiveNavigation({ 
  userAddress, 
  isConnected, 
  onConnect, 
  onDisconnect 
}: ResponsiveNavigationProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/',
      description: 'Platform overview and quick actions'
    },
    {
      id: 'jobs',
      label: 'Find Work',
      icon: Search,
      href: '/jobs',
      description: 'Browse and search for job opportunities'
    },
    {
      id: 'post-job',
      label: 'Post Job',
      icon: Briefcase,
      href: '/post-job',
      description: 'Create new job postings with IPFS storage'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      href: '/messages',
      badge: 3,
      description: 'Communicate with employers and workers'
    },
    {
      id: 'disputes',
      label: 'Disputes',
      icon: Scale,
      href: '/disputes',
      badge: 1,
      description: 'Resolve conflicts through arbitration'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/profile',
      description: 'Manage your worker profile and reputation'
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
    setIsMobileMenuOpen(false);
  };

  // Desktop Navigation
  const DesktopNav = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
      {/* Logo and Brand */}
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Decentralcy</h1>
            <p className="text-xs text-muted-foreground">Decentralized Work</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={isActiveRoute(item.href) ? "default" : "ghost"}
            className="w-full justify-start h-12"
            onClick={() => handleNavigation(item.href)}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge className="h-5 w-5 p-0 text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="space-y-3">
          {/* Wallet Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isConnected ? 'Wallet Connected' : 'Not Connected'}
              </p>
              {isConnected && (
                <p className="text-xs text-muted-foreground font-mono">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWalletModal(true)}
            >
              <Wallet className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Navigation
  const MobileNav = () => (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold">Decentralcy</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="py-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4 mb-6 bg-muted/50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {isConnected ? userAddress.slice(2, 4).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </p>
                    {isConnected && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWalletModal(true)}
                  >
                    <Wallet className="w-4 h-4" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={isActiveRoute(item.href) ? "default" : "ghost"}
                      className="w-full justify-start h-12"
                      onClick={() => handleNavigation(item.href)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                      {item.badge && (
                        <Badge className="h-5 w-5 p-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </nav>

                {/* Platform Stats */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                    Platform Impact
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex justify-between">
                      <span>Active Jobs:</span>
                      <span className="font-medium">847</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <span className="font-medium">2,847 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workers:</span>
                      <span className="font-medium">1,204</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-8 space-y-2">
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  {isConnected && (
                    <Button variant="destructive" className="w-full" onClick={onDisconnect}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-12 relative ${
                isActiveRoute(item.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">{item.badge}</span>
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWalletModal(false)}
              className="absolute -top-2 -right-2 z-10"
            >
              ×
            </Button>
            <EnhancedWalletConnect
              userAddress={userAddress}
              isConnected={isConnected}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(false)}
              className="absolute -top-2 -right-2 z-10"
            >
              ×
            </Button>
            <NotificationCenter userAddress={userAddress} />
          </div>
        </div>
      )}

      {/* Revolution Message */}
      <div className="hidden lg:block fixed bottom-4 left-4 w-56">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="font-medium mb-1">Revolutionary Platform</div>
                <div>Work without middlemen. Trust through code. Power to workers.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
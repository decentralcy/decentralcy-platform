import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  AlertTriangle, 
  MessageCircle, 
  Briefcase, 
  Scale, 
  Coins,
  Clock,
  X,
  Settings,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationCenterProps {
  userAddress: string;
}

interface Notification {
  id: string;
  type: 'job' | 'message' | 'payment' | 'dispute' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: any;
}

export default function NotificationCenter({ userAddress }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'job' | 'message' | 'payment' | 'dispute'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Mock notifications - in production this would come from your backend
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "job",
      title: "New Job Application",
      description: "Alice Smith applied for your Smart Contract Audit position",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: "high",
      actionUrl: "/jobs/1/applications"
    },
    {
      id: "2", 
      type: "payment",
      title: "Payment Received",
      description: "2.5 ETH received for completing DeFi Protocol Audit",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "message",
      title: "New Message",
      description: "John Doe sent you a message about the NFT Marketplace project",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      priority: "medium",
      actionUrl: "/messages/conv_123"
    },
    {
      id: "4",
      type: "dispute",
      title: "Dispute Update",
      description: "Arbitrator has voted in your favor for case #DIS-001",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: false,
      priority: "urgent"
    },
    {
      id: "5",
      type: "job",
      title: "Job Deadline Reminder",
      description: "Smart Contract Development project deadline is in 2 days",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      priority: "medium"
    },
    {
      id: "6",
      type: "system",
      title: "Platform Update",
      description: "New IPFS integration is now live! Your job descriptions are now stored permanently on the decentralized web.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: false,
      priority: "low"
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'payment':
        return <Coins className="w-4 h-4 text-yellow-500" />;
      case 'dispute':
        return <Scale className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Bell className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    toast({
      title: "All notifications marked as read",
      description: "Your notification center is now up to date.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
    
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">{unreadCount}</span>
                </div>
              )}
            </div>
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'job', label: 'Jobs' },
            { key: 'message', label: 'Messages' },
            { key: 'payment', label: 'Payments' }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab.key as any)}
              className="text-xs h-7"
            >
              {tab.label}
              {tab.key === 'unread' && unreadCount > 0 && (
                <Badge className="ml-1 h-4 w-4 p-0 text-xs">{unreadCount}</Badge>
              )}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Settings Panel */}
        {showSettings && (
          <>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
              <h4 className="font-medium text-sm">Notification Preferences</h4>
              <div className="space-y-2">
                {[
                  { type: 'job', label: 'Job Applications & Updates' },
                  { type: 'message', label: 'New Messages' },
                  { type: 'payment', label: 'Payment Notifications' },
                  { type: 'dispute', label: 'Dispute Updates' },
                  { type: 'system', label: 'Platform Updates' }
                ].map((pref) => (
                  <div key={pref.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(pref.type)}
                      <span className="text-sm">{pref.label}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs h-5 ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-6"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                      
                      {notification.actionUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs h-7"
                          onClick={() => {
                            markAsRead(notification.id);
                            // Navigate to action URL
                            console.log('Navigate to:', notification.actionUrl);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
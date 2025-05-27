import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Globe,
  Star,
  Wallet,
  Shield,
  Trophy,
  Target,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Calendar,
  MessageSquare,
  Video,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedFrontendExperienceProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface AnimatedStat {
  id: string;
  label: string;
  value: number;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  color: string;
  icon: any;
}

interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function EnhancedFrontendExperience({ 
  userAddress, 
  isConnected, 
  userType 
}: EnhancedFrontendExperienceProps) {
  const [animatedStats, setAnimatedStats] = useState<AnimatedStat[]>([]);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();

  // Initialize animated statistics
  useEffect(() => {
    const stats: AnimatedStat[] = [
      {
        id: 'total-earnings',
        label: 'Total Earnings',
        value: 0,
        targetValue: 24750,
        prefix: '$',
        color: 'text-green-600',
        icon: TrendingUp
      },
      {
        id: 'active-jobs',
        label: 'Active Jobs',
        value: 0,
        targetValue: 8,
        color: 'text-blue-600',
        icon: Zap
      },
      {
        id: 'reputation-score',
        label: 'Reputation Score',
        value: 0,
        targetValue: 92,
        suffix: '/100',
        color: 'text-purple-600',
        icon: Star
      },
      {
        id: 'job-matches',
        label: 'Perfect Matches',
        value: 0,
        targetValue: 15,
        color: 'text-orange-600',
        icon: Target
      }
    ];

    setAnimatedStats(stats);

    // Animate stats on load
    const animateStats = () => {
      stats.forEach((stat, index) => {
        setTimeout(() => {
          const duration = 2000;
          const steps = 60;
          const increment = stat.targetValue / steps;
          let currentValue = 0;

          const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= stat.targetValue) {
              currentValue = stat.targetValue;
              clearInterval(interval);
            }

            setAnimatedStats(prev => 
              prev.map(s => 
                s.id === stat.id 
                  ? { ...s, value: Math.floor(currentValue) }
                  : s
              )
            );
          }, duration / steps);
        }, index * 200);
      });
    };

    if (isConnected) {
      setTimeout(animateStats, 500);
    }
  }, [isConnected]);

  // Welcome animation sequence
  useEffect(() => {
    if (isConnected && showWelcomeAnimation) {
      const welcomeSequence = [
        { delay: 1000, message: "🎉 Welcome to Decentralcy!" },
        { delay: 2000, message: "🚀 Your Web3 workspace is ready" },
        { delay: 3000, message: "💰 Start earning with blockchain payments" },
        { delay: 4000, message: "🌟 Your reputation is permanently yours" }
      ];

      welcomeSequence.forEach(({ delay, message }) => {
        setTimeout(() => {
          toast({
            title: message,
            description: "Experience the future of work",
          });
        }, delay);
      });

      setTimeout(() => setShowWelcomeAnimation(false), 5000);
    }
  }, [isConnected, showWelcomeAnimation]);

  // Real-time notifications simulation
  useEffect(() => {
    if (!isConnected) return;

    const notificationTypes = [
      {
        type: 'success' as const,
        titles: ['New Job Match!', 'Payment Received!', 'Review Added!'],
        messages: ['Perfect match found for your skills', 'USDC payment confirmed', 'New 5-star review received']
      },
      {
        type: 'info' as const,
        titles: ['Platform Update', 'New Feature', 'Tip'],
        messages: ['Enhanced matching algorithm deployed', 'Video chat now available', 'Complete your profile for better matches']
      }
    ];

    const interval = setInterval(() => {
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const randomTitle = randomType.titles[Math.floor(Math.random() * randomType.titles.length)];
      const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

      const newNotification: NotificationToast = {
        id: Date.now().toString(),
        type: randomType.type,
        title: randomTitle,
        message: randomMessage,
        timestamp: new Date(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);

      if (soundEnabled) {
        // Play notification sound (would be actual audio in production)
        console.log('🔔 Notification sound played');
      }

      toast({
        title: randomTitle,
        description: randomMessage,
      });
    }, 15000); // New notification every 15 seconds

    return () => clearInterval(interval);
  }, [isConnected, soundEnabled]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info': return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'warning': return <Shield className="w-5 h-5 text-yellow-600" />;
      case 'error': return <Zap className="w-5 h-5 text-red-600" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10 text-white animate-spin" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Welcome to Decentralcy
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  The Revolutionary Decentralized Work Platform
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Blockchain-powered • Zero middlemen • Instant payments</span>
                  </div>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet to Start
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Your decentralized workspace is ready to earn
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleDarkMode}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Animated Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {animatedStats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <StatIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold text-white`}>
                        {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                      </div>
                      <div className="text-blue-100 text-sm">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Find Jobs',
            description: 'AI-powered matching',
            icon: Target,
            color: 'from-blue-500 to-blue-600',
            action: 'Browse 15 perfect matches'
          },
          {
            title: 'Send Payment',
            description: 'Multi-chain support',
            icon: Wallet,
            color: 'from-green-500 to-green-600',
            action: 'Pay with crypto instantly'
          },
          {
            title: 'Video Call',
            description: 'Built-in communication',
            icon: Video,
            color: 'from-purple-500 to-purple-600',
            action: 'Start client meeting'
          },
          {
            title: 'View Analytics',
            description: 'Earnings & performance',
            icon: TrendingUp,
            color: 'from-orange-500 to-orange-600',
            action: 'Track your growth'
          }
        ].map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <ItemIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                    <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                      {item.action}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Activity Feed */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Live Activity Feed
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                Live
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">{notification.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Jobs Completed', progress: 75, target: '6/8 jobs' },
                { label: 'Earnings Goal', progress: 85, target: '$2,125/$2,500' },
                { label: 'Client Satisfaction', progress: 95, target: '4.8/5.0 stars' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.target}</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '2:00 PM', title: 'Client Review Call', type: 'video' },
                { time: '4:30 PM', title: 'Smart Contract Deployment', type: 'work' },
                { time: '6:00 PM', title: 'Team Stand-up Meeting', type: 'meeting' }
              ].map((event, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.time}</div>
                  </div>
                  <Button size="sm" variant="ghost">
                    {event.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Success Metrics */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Your Success Story
          </CardTitle>
          <CardDescription>
            Track your journey to decentralized work success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { metric: 'Total Earned', value: '$24,750', growth: '+18%', icon: TrendingUp },
              { metric: 'Perfect Reviews', value: '47', growth: '+12%', icon: Star },
              { metric: 'Repeat Clients', value: '76%', growth: '+8%', icon: Users }
            ].map((item, index) => {
              const MetricIcon = item.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <MetricIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.metric}</div>
                  <Badge className="bg-green-100 text-green-800">
                    {item.growth} this month
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
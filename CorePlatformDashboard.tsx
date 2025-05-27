import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, Scale, Users, Briefcase, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import AdvancedJobSearch from "./AdvancedJobSearch";
import MessagingSystem from "./MessagingSystem";
import EnhancedDisputeResolution from "./EnhancedDisputeResolution";
import ReputationLeaderboard from "./ReputationLeaderboard";

interface CorePlatformDashboardProps {
  userAddress: string;
  isConnected: boolean;
}

interface PlatformStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalWorkers: number;
  activeDisputes: number;
  resolvedDisputes: number;
  avgJobCompletion: string;
  platformVolume: string;
}

export default function CorePlatformDashboard({ userAddress, isConnected }: CorePlatformDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Platform statistics (in production, this would come from your analytics API)
  const platformStats: PlatformStats = {
    totalJobs: 847,
    activeJobs: 156,
    completedJobs: 691,
    totalWorkers: 1204,
    activeDisputes: 7,
    resolvedDisputes: 123,
    avgJobCompletion: "4.2 days",
    platformVolume: "2,847 ETH"
  };

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create a new job posting with IPFS storage",
      icon: <Briefcase className="w-5 h-5" />,
      color: "bg-blue-500",
      action: () => console.log("Navigate to job posting")
    },
    {
      title: "Find Work",
      description: "Browse available jobs and opportunities",
      icon: <Search className="w-5 h-5" />,
      color: "bg-green-500",
      action: () => setActiveTab("search")
    },
    {
      title: "Messages",
      description: "Check your conversations and notifications",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-purple-500",
      action: () => setActiveTab("messaging")
    },
    {
      title: "Dispute Center",
      description: "Manage disputes and arbitration cases",
      icon: <Scale className="w-5 h-5" />,
      color: "bg-orange-500",
      action: () => setActiveTab("disputes")
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Platform Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{platformStats.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="text-green-600">
                +12% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workers</p>
                <p className="text-2xl font-bold">{platformStats.totalWorkers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="text-green-600">
                +8% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Volume</p>
                <p className="text-2xl font-bold">{platformStats.platformVolume}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="text-green-600">
                +24% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Disputes</p>
                <p className="text-2xl font-bold">{platformStats.activeDisputes}</p>
              </div>
              <Scale className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="text-red-600">
                2 urgent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to the most common platform activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
                onClick={action.action}
              >
                <div className={`p-3 rounded-full ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Job Search</TabsTrigger>
          <TabsTrigger value="messaging">Messages</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Job Completion Rate</span>
                  <Badge className="bg-green-100 text-green-800">94.3%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Job Duration</span>
                  <span className="text-sm font-medium">{platformStats.avgJobCompletion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dispute Resolution Rate</span>
                  <Badge className="bg-blue-100 text-blue-800">97.1%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Worker Satisfaction</span>
                  <Badge className="bg-purple-100 text-purple-800">4.8/5.0</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm">Job completed successfully</p>
                      <p className="text-xs text-muted-foreground">DeFi Protocol Audit - 2.5 ETH</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm">New job posted</p>
                      <p className="text-xs text-muted-foreground">Smart Contract Development</p>
                    </div>
                    <span className="text-xs text-muted-foreground">4h ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm">Dispute raised</p>
                      <p className="text-xs text-muted-foreground">Quality concerns on NFT project</p>
                    </div>
                    <span className="text-xs text-muted-foreground">6h ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <Users className="w-4 h-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm">New worker verified</p>
                      <p className="text-xs text-muted-foreground">Blockchain specialist joined</p>
                    </div>
                    <span className="text-xs text-muted-foreground">8h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revolutionary Mission Statement */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  Revolutionizing Work Through Decentralization
                </h3>
                <p className="text-blue-700 dark:text-blue-300 max-w-3xl mx-auto">
                  Decentralcy eliminates traditional corporate middlemen and creates a truly free marketplace where 
                  work is valued without intermediaries, trust is built through code, and workers control their destiny. 
                  Join the revolution against outdated employment structures.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <Badge className="bg-blue-600 text-white">Zero Middlemen</Badge>
                  <Badge className="bg-purple-600 text-white">Full Transparency</Badge>
                  <Badge className="bg-green-600 text-white">Worker Owned</Badge>
                  <Badge className="bg-orange-600 text-white">Blockchain Secured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <AdvancedJobSearch userAddress={userAddress} isConnected={isConnected} />
        </TabsContent>

        <TabsContent value="messaging">
          <MessagingSystem userAddress={userAddress} />
        </TabsContent>

        <TabsContent value="disputes">
          <EnhancedDisputeResolution userAddress={userAddress} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <ReputationLeaderboard userAddress={userAddress} />
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex justify-around">
          {quickActions.slice(0, 4).map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-1"
              onClick={action.action}
            >
              {action.icon}
              <span className="text-xs">{action.title.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
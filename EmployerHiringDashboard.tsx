import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Star,
  Target,
  Award,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployerHiringDashboardProps {
  userAddress: string;
  isConnected: boolean;
}

interface HiringMetrics {
  totalJobsPosted: number;
  activeJobs: number;
  totalApplications: number;
  averageTimeToHire: string;
  successfulHires: number;
  totalSpent: string;
  averageJobValue: string;
  workerRetentionRate: number;
}

interface JobPosting {
  id: string;
  title: string;
  category: string;
  budget: string;
  deadline: Date;
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  applications: number;
  views: number;
  postedAt: Date;
  assignedWorker?: WorkerMatch;
  urgency: 'low' | 'medium' | 'high';
}

interface WorkerMatch {
  address: string;
  name: string;
  avatar: string;
  rating: number;
  completedJobs: number;
  matchScore: number;
  skills: string[];
  hourlyRate: string;
  responseTime: string;
  availability: 'available' | 'busy' | 'unavailable';
  verified: boolean;
}

interface HiringRecommendation {
  type: 'budget' | 'timeline' | 'skills' | 'worker';
  title: string;
  description: string;
  action: string;
  impact: 'low' | 'medium' | 'high';
}

export default function EmployerHiringDashboard({ userAddress, isConnected }: EmployerHiringDashboardProps) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  // Mock hiring metrics
  const hiringMetrics: HiringMetrics = {
    totalJobsPosted: 24,
    activeJobs: 5,
    totalApplications: 187,
    averageTimeToHire: "3.2 days",
    successfulHires: 19,
    totalSpent: "47.8 ETH",
    averageJobValue: "2.52 ETH",
    workerRetentionRate: 84
  };

  // Mock job postings
  const jobPostings: JobPosting[] = [
    {
      id: "job_1",
      title: "DeFi Frontend Development",
      category: "Frontend",
      budget: "3.5 ETH",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "active",
      applications: 12,
      views: 89,
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      urgency: "high"
    },
    {
      id: "job_2",
      title: "Smart Contract Audit",
      category: "Security",
      budget: "5.0 ETH",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "in_progress",
      applications: 8,
      views: 156,
      postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      urgency: "medium",
      assignedWorker: {
        address: "0x1234...",
        name: "Sarah Chen",
        avatar: "SC",
        rating: 4.9,
        completedJobs: 47,
        matchScore: 95,
        skills: ["Smart Contracts", "Security", "Solidity"],
        hourlyRate: "0.08 ETH/hr",
        responseTime: "< 2 hours",
        availability: "busy",
        verified: true
      }
    },
    {
      id: "job_3",
      title: "NFT Marketplace Backend",
      category: "Backend",
      budget: "4.2 ETH",
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: "completed",
      applications: 15,
      views: 203,
      postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      urgency: "low"
    }
  ];

  // Mock worker recommendations
  const workerRecommendations: WorkerMatch[] = [
    {
      address: "0x5678...",
      name: "Alex Rodriguez",
      avatar: "AR",
      rating: 4.8,
      completedJobs: 32,
      matchScore: 92,
      skills: ["React", "TypeScript", "Web3", "DeFi"],
      hourlyRate: "0.06 ETH/hr",
      responseTime: "< 1 hour",
      availability: "available",
      verified: true
    },
    {
      address: "0x9abc...",
      name: "Jordan Kim",
      avatar: "JK",
      rating: 4.7,
      completedJobs: 28,
      matchScore: 88,
      skills: ["Frontend", "React", "Next.js", "UI/UX"],
      hourlyRate: "0.05 ETH/hr",
      responseTime: "< 3 hours",
      availability: "available",
      verified: false
    }
  ];

  // Mock hiring recommendations
  const hiringRecommendations: HiringRecommendation[] = [
    {
      type: "budget",
      title: "Optimize Job Budgets",
      description: "Your average job budget is 15% higher than market rate for similar projects",
      action: "Review budget allocation",
      impact: "medium"
    },
    {
      type: "timeline",
      title: "Extend Application Period",
      description: "Jobs with longer application periods receive 40% more quality applications",
      action: "Increase deadline by 3-5 days",
      impact: "high"
    },
    {
      type: "worker",
      title: "Re-engage Top Performers",
      description: "3 high-rated workers you've worked with are currently available",
      action: "Send direct invitations",
      impact: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = jobPostings.filter(job => 
    filterStatus === 'all' || job.status === filterStatus
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Employer Hiring Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive analytics and tools for efficient hiring and workforce management
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{hiringMetrics.activeJobs}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{hiringMetrics.totalApplications}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time to Hire</p>
                <p className="text-2xl font-bold">{hiringMetrics.averageTimeToHire}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{hiringMetrics.totalSpent}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Job Management</TabsTrigger>
          <TabsTrigger value="recommendations">Worker Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Hiring Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiring Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-bold">79%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker Retention:</span>
                    <span className="font-bold">{hiringMetrics.workerRetentionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Job Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold">4.6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Job Value:</span>
                    <span className="font-bold">{hiringMetrics.averageJobValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per Hire:</span>
                    <span className="font-bold">0.12 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fees:</span>
                    <span className="font-bold">1.2 ETH</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Applications:</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Rate:</span>
                    <span className="font-bold">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interview Rate:</span>
                    <span className="font-bold">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Hiring Recommendations</CardTitle>
              <CardDescription>
                AI-powered insights to improve your hiring outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hiringRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge className={`${getImpactColor(rec.impact)} bg-opacity-20`}>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <Button variant="outline" size="sm">
                      {rec.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {/* Job Filters */}
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.category} • Posted {job.postedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getUrgencyColor(job.urgency)}>
                        {job.urgency}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Budget:</span>
                      <div className="font-medium">{job.budget}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Applications:</span>
                      <div className="font-medium">{job.applications}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Views:</span>
                      <div className="font-medium">{job.views}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Deadline:</span>
                      <div className="font-medium">{job.deadline.toLocaleDateString()}</div>
                    </div>
                  </div>

                  {job.assignedWorker && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {job.assignedWorker.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{job.assignedWorker.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {job.assignedWorker.rating}
                            </span>
                            <span>{job.assignedWorker.completedJobs} jobs</span>
                            <Badge className={getAvailabilityColor(job.assignedWorker.availability)}>
                              {job.assignedWorker.availability}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Applications ({job.applications})
                    </Button>
                    {job.status === 'active' && (
                      <Button variant="outline" size="sm">
                        Edit Job
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommended Workers</CardTitle>
              <CardDescription>
                AI-matched workers based on your hiring history and job requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerRecommendations.map((worker) => (
                  <div key={worker.address} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {worker.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {worker.name}
                            {worker.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {worker.rating}
                            </span>
                            <span>{worker.completedJobs} jobs completed</span>
                            <span>{worker.responseTime} response</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{worker.matchScore}%</div>
                        <div className="text-xs text-muted-foreground">match score</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {worker.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            <span className="font-medium">Rate:</span> {worker.hourlyRate}
                          </span>
                          <Badge className={getAvailabilityColor(worker.availability)}>
                            {worker.availability}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Profile
                          </Button>
                          <Button size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Hiring Analytics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiring Timeline Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Job Posting to First Application</span>
                    <span className="font-medium">4.2 hours</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Application Review Time</span>
                    <span className="font-medium">1.8 days</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Contract Assignment</span>
                    <span className="font-medium">2.1 days</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget vs Actual Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Budget Allocated:</span>
                    <span className="font-medium">52.0 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Spend:</span>
                    <span className="font-medium">47.8 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget Efficiency:</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hiring Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">↑ 23%</div>
                  <div className="text-sm text-muted-foreground">Application Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">↑ 15%</div>
                  <div className="text-sm text-muted-foreground">Hire Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">↓ 18%</div>
                  <div className="text-sm text-muted-foreground">Time to Hire</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employer Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
              Data-Driven Hiring Excellence
            </h3>
            <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
              Our advanced hiring analytics help employers make better decisions, reduce time-to-hire, 
              and build stronger relationships with top talent. AI-powered recommendations ensure 
              you find the perfect match for every project.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-blue-600 text-white">Smart Recommendations</Badge>
              <Badge className="bg-green-600 text-white">Performance Analytics</Badge>
              <Badge className="bg-purple-600 text-white">Cost Optimization</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
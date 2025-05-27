import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Zap,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  Bell,
  Filter,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RealTimeJobMatchingProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  duration: string;
  postedTime: string;
  matchScore: number;
  urgent: boolean;
  verified: boolean;
  applicants: number;
  estimatedEarnings: number;
}

interface MatchingPreferences {
  minHourlyRate: number;
  maxHourlyRate: number;
  preferredSkills: string[];
  workType: 'remote' | 'onsite' | 'hybrid' | 'any';
  availability: 'immediate' | 'within_week' | 'within_month';
  jobDuration: 'short_term' | 'long_term' | 'project_based' | 'any';
}

export default function RealTimeJobMatching({ 
  userAddress, 
  isConnected, 
  userType 
}: RealTimeJobMatchingProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    minHourlyRate: 25,
    maxHourlyRate: 150,
    preferredSkills: ['React', 'TypeScript', 'Node.js'],
    workType: 'remote',
    availability: 'immediate',
    jobDuration: 'any'
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const { toast } = useToast();

  // Simulated real-time job matches based on user profile
  const generateJobMatches = (): JobMatch[] => {
    const jobs: JobMatch[] = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'DeFi Protocol Inc.',
        description: 'Build cutting-edge DeFi interfaces with React and Web3 integration. Work on revolutionary blockchain applications.',
        skills: ['React', 'TypeScript', 'Web3', 'DeFi'],
        hourlyRate: 85,
        location: 'Remote',
        duration: '3-6 months',
        postedTime: '2 minutes ago',
        matchScore: 95,
        urgent: true,
        verified: true,
        applicants: 3,
        estimatedEarnings: 17000
      },
      {
        id: '2',
        title: 'Blockchain Smart Contract Auditor',
        company: 'Security Labs',
        description: 'Audit Solidity smart contracts for security vulnerabilities. Ensure protocol safety and user protection.',
        skills: ['Solidity', 'Security', 'Auditing', 'DeFi'],
        hourlyRate: 120,
        location: 'Remote',
        duration: '2-4 weeks',
        postedTime: '5 minutes ago',
        matchScore: 88,
        urgent: false,
        verified: true,
        applicants: 1,
        estimatedEarnings: 9600
      },
      {
        id: '3',
        title: 'Web3 Frontend Developer',
        company: 'NFT Marketplace',
        description: 'Create responsive Web3 interfaces for NFT trading platform. Work with cutting-edge blockchain technology.',
        skills: ['React', 'Web3', 'NFTs', 'Ethers.js'],
        hourlyRate: 75,
        location: 'Remote',
        duration: '1-2 months',
        postedTime: '8 minutes ago',
        matchScore: 92,
        urgent: false,
        verified: true,
        applicants: 7,
        estimatedEarnings: 12000
      },
      {
        id: '4',
        title: 'DApp Backend Engineer',
        company: 'Crypto Startup',
        description: 'Build scalable backend infrastructure for decentralized applications. Handle high-volume blockchain data.',
        skills: ['Node.js', 'PostgreSQL', 'Blockchain', 'APIs'],
        hourlyRate: 90,
        location: 'Remote',
        duration: '4-8 months',
        postedTime: '12 minutes ago',
        matchScore: 85,
        urgent: true,
        verified: false,
        applicants: 5,
        estimatedEarnings: 28800
      },
      {
        id: '5',
        title: 'Solidity Developer',
        company: 'DeFi Foundation',
        description: 'Develop and deploy smart contracts for yield farming protocol. Shape the future of decentralized finance.',
        skills: ['Solidity', 'DeFi', 'Smart Contracts', 'Testing'],
        hourlyRate: 100,
        location: 'Remote',
        duration: '6+ months',
        postedTime: '15 minutes ago',
        matchScore: 90,
        urgent: false,
        verified: true,
        applicants: 2,
        estimatedEarnings: 48000
      }
    ];

    return jobs.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Initialize job matching
  useEffect(() => {
    if (isConnected && userType !== 'employer') {
      setIsMatching(true);
      setTimeout(() => {
        setMatches(generateJobMatches());
        setIsMatching(false);
        
        toast({
          title: "🎯 Perfect Matches Found!",
          description: "5 high-quality job matches based on your profile",
        });
      }, 2000);
    }
  }, [isConnected, userType]);

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeUpdates || !isConnected) return;

    const interval = setInterval(() => {
      // Simulate new job appearing
      const newJob: JobMatch = {
        id: Date.now().toString(),
        title: 'Urgent: Web3 Integration Specialist',
        company: 'Emerging Protocol',
        description: 'Immediate need for Web3 integration on existing platform. High priority project with excellent compensation.',
        skills: ['Web3', 'React', 'Integration'],
        hourlyRate: 110,
        location: 'Remote',
        duration: '2-3 weeks',
        postedTime: 'Just now',
        matchScore: 97,
        urgent: true,
        verified: true,
        applicants: 0,
        estimatedEarnings: 8800
      };

      setMatches(prev => [newJob, ...prev.slice(0, 4)]);
      
      toast({
        title: "🚨 New Perfect Match!",
        description: `${newJob.title} - ${newJob.matchScore}% match`,
      });
    }, 30000); // New job every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates, isConnected]);

  const applyToJob = (jobId: string) => {
    const job = matches.find(j => j.id === jobId);
    if (job) {
      toast({
        title: "🎉 Application Submitted!",
        description: `Applied to ${job.title} at ${job.company}`,
      });
    }
  };

  const saveJob = (jobId: string) => {
    toast({
      title: "❤️ Job Saved!",
      description: "Added to your favorites list",
    });
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            AI-Powered Job Matching
          </CardTitle>
          <CardDescription>
            Connect your wallet to start receiving personalized job matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect Wallet to Start Matching</Button>
        </CardContent>
      </Card>
    );
  }

  if (userType === 'employer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Talent Matching System
          </CardTitle>
          <CardDescription>
            Find the perfect candidates for your job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Briefcase className="w-16 h-16 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold">Employer Matching Dashboard</h3>
            <p className="text-muted-foreground">
              Post jobs and receive matched candidate recommendations based on skills, experience, and availability.
            </p>
            <Button>Post New Job</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Matching Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                AI-Powered Job Matching
                {isMatching && <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />}
              </CardTitle>
              <CardDescription>
                Real-time job recommendations tailored to your skills and preferences
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
              <div className="text-sm text-muted-foreground">Perfect Matches</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Real-time Updates: {realTimeUpdates ? 'ON' : 'OFF'}
              </Badge>
              <Badge variant="outline">
                Match Rate: 87%
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Adjust Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Matching in Progress */}
      {isMatching && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold">Finding Perfect Matches...</h3>
              <p className="text-muted-foreground">
                Analyzing your skills, preferences, and market opportunities
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Matches */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Job Matches</h3>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notification Settings
            </Button>
          </div>

          {matches.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{job.title}</h4>
                      {job.verified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {job.urgent && (
                        <Badge className="bg-red-100 text-red-800">
                          <Zap className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  <Badge className={`${getMatchColor(job.matchScore)} px-3 py-1`}>
                    {job.matchScore}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>${job.hourlyRate}/hour</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>{job.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span>{job.applicants} applicants</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Estimated Earnings</div>
                      <div className="text-lg font-semibold text-green-600">
                        ${job.estimatedEarnings.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => saveJob(job.id)}>
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => applyToJob(job.id)}>
                        Apply Now
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Posted {job.postedTime}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Your Matching Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-muted-foreground">Average Match Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24</div>
              <div className="text-sm text-muted-foreground">Matches This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">$89</div>
              <div className="text-sm text-muted-foreground">Avg. Hourly Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
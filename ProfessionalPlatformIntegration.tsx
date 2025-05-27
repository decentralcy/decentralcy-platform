import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Github, 
  Linkedin, 
  CheckCircle, 
  ExternalLink,
  Star,
  GitBranch,
  Users,
  Award,
  Shield,
  RefreshCw,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalPlatformIntegrationProps {
  userAddress: string;
  isConnected: boolean;
}

interface GitHubProfile {
  username: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
  recentActivity: GitHubActivity[];
  verified: boolean;
  verifiedAt?: Date;
  profileScore: number;
}

interface GitHubActivity {
  type: 'commit' | 'pr' | 'issue' | 'release';
  repo: string;
  description: string;
  date: Date;
  impact: 'low' | 'medium' | 'high';
}

interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  connections: number;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: LinkedInSkill[];
  verified: boolean;
  verifiedAt?: Date;
  profileScore: number;
}

interface LinkedInExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  current: boolean;
}

interface LinkedInEducation {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface LinkedInSkill {
  name: string;
  endorsements: number;
  verified: boolean;
}

interface VerificationReward {
  platform: 'github' | 'linkedin';
  reputationBonus: number;
  tokenReward: number;
  badgeUnlocked: string;
  profileVisibilityIncrease: number;
}

export default function ProfessionalPlatformIntegration({ 
  userAddress, 
  isConnected 
}: ProfessionalPlatformIntegrationProps) {
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [verificationStep, setVerificationStep] = useState<'input' | 'verify' | 'complete'>('input');
  const { toast } = useToast();

  // Mock GitHub profile data
  const mockGitHubProfile: GitHubProfile = {
    username: "blockchain_dev",
    name: "Alex Chen",
    bio: "Full-stack developer specializing in DeFi and smart contracts",
    followers: 342,
    following: 89,
    publicRepos: 47,
    totalStars: 1203,
    topLanguages: ["Solidity", "TypeScript", "Rust", "Go"],
    verified: false,
    profileScore: 87,
    recentActivity: [
      {
        type: "commit",
        repo: "defi-lending-protocol",
        description: "Implemented flash loan functionality",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        impact: "high"
      },
      {
        type: "pr",
        repo: "ethereum/solidity",
        description: "Fixed compiler optimization bug",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        impact: "medium"
      },
      {
        type: "release",
        repo: "smart-contract-auditor",
        description: "Released v2.1.0 with gas optimization",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        impact: "high"
      }
    ]
  };

  // Mock LinkedIn profile data
  const mockLinkedInProfile: LinkedInProfile = {
    name: "Alex Chen",
    headline: "Senior Blockchain Developer | DeFi Specialist | Smart Contract Auditor",
    location: "San Francisco, CA",
    connections: 1247,
    verified: false,
    profileScore: 92,
    experience: [
      {
        company: "DeFi Innovations Inc.",
        position: "Senior Blockchain Developer",
        duration: "2022 - Present",
        description: "Lead development of decentralized lending protocols with $50M+ TVL",
        current: true
      },
      {
        company: "CryptoSec Audits",
        position: "Smart Contract Auditor",
        duration: "2021 - 2022",
        description: "Audited 50+ smart contracts, identified critical vulnerabilities",
        current: false
      }
    ],
    education: [
      {
        institution: "Stanford University",
        degree: "Master of Science",
        field: "Computer Science",
        year: "2021"
      }
    ],
    skills: [
      { name: "Solidity", endorsements: 89, verified: true },
      { name: "Smart Contracts", endorsements: 76, verified: true },
      { name: "DeFi", endorsements: 54, verified: false },
      { name: "Blockchain Architecture", endorsements: 43, verified: true }
    ]
  };

  const verifyGitHubMutation = useMutation({
    mutationFn: async (username: string) => {
      setVerificationStep('verify');
      
      // Simulate GitHub verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In production, this would make actual GitHub API calls
      const profile = { ...mockGitHubProfile, username, verified: true, verifiedAt: new Date() };
      
      const reward: VerificationReward = {
        platform: 'github',
        reputationBonus: 15,
        tokenReward: 50,
        badgeUnlocked: "Code Contributor",
        profileVisibilityIncrease: 25
      };

      return { profile, reward };
    },
    onSuccess: (data) => {
      setVerificationStep('complete');
      toast({
        title: "GitHub Verified! 🎉",
        description: `Earned +${data.reward.reputationBonus} reputation and ${data.reward.tokenReward} DCNTRC tokens!`,
      });
    },
    onError: (error: any) => {
      setVerificationStep('input');
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyLinkedInMutation = useMutation({
    mutationFn: async (profileUrl: string) => {
      setVerificationStep('verify');
      
      // Simulate LinkedIn verification process
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const profile = { ...mockLinkedInProfile, verified: true, verifiedAt: new Date() };
      
      const reward: VerificationReward = {
        platform: 'linkedin',
        reputationBonus: 20,
        tokenReward: 75,
        badgeUnlocked: "Professional Verified",
        profileVisibilityIncrease: 35
      };

      return { profile, reward };
    },
    onSuccess: (data) => {
      setVerificationStep('complete');
      toast({
        title: "LinkedIn Verified! 🎉",
        description: `Earned +${data.reward.reputationBonus} reputation and ${data.reward.tokenReward} DCNTRC tokens!`,
      });
    },
    onError: (error: any) => {
      setVerificationStep('input');
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return <GitBranch className="w-4 h-4" />;
      case 'pr':
        return <Plus className="w-4 h-4" />;
      case 'release':
        return <Award className="w-4 h-4" />;
      default:
        return <Github className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" />
            Professional Platform Integration
          </CardTitle>
          <CardDescription>
            Verify your GitHub and LinkedIn profiles to boost credibility and earn rewards
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="github" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="github">GitHub Integration</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="space-y-6">
          {/* GitHub Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                GitHub Profile Verification
              </CardTitle>
              <CardDescription>
                Connect your GitHub profile to showcase your development experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationStep === 'input' && (
                <>
                  <div>
                    <label className="text-sm font-medium">GitHub Username</label>
                    <Input
                      placeholder="Enter your GitHub username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Verification Benefits:</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        +15 reputation points
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        50 DCNTRC tokens reward
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        +25% profile visibility
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        "Code Contributor" badge
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => verifyGitHubMutation.mutate(githubUsername)}
                    disabled={!githubUsername || verifyGitHubMutation.isPending}
                    className="w-full"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Verify GitHub Profile
                  </Button>
                </>
              )}

              {verificationStep === 'verify' && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h3 className="font-semibold">Verifying GitHub Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzing your repositories, contributions, and activity...
                    </p>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              )}

              {verificationStep === 'complete' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-green-600">GitHub Verified!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your profile has been successfully verified and linked.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GitHub Profile Preview */}
          {mockGitHubProfile.verified && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">GitHub Profile Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockGitHubProfile.publicRepos}</div>
                      <div className="text-sm text-muted-foreground">Repositories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockGitHubProfile.totalStars}</div>
                      <div className="text-sm text-muted-foreground">Total Stars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockGitHubProfile.followers}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockGitHubProfile.profileScore}</div>
                      <div className="text-sm text-muted-foreground">Profile Score</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {mockGitHubProfile.topLanguages.map((lang, index) => (
                          <Badge key={index} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockGitHubProfile.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.repo}</span>
                            <Badge className={getImpactColor(activity.impact)} variant="outline">
                              {activity.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-6">
          {/* LinkedIn Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                LinkedIn Profile Verification
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn profile to showcase your professional experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationStep === 'input' && (
                <>
                  <div>
                    <label className="text-sm font-medium">LinkedIn Profile URL</label>
                    <Input
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Verification Benefits:</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        +20 reputation points
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        75 DCNTRC tokens reward
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        +35% profile visibility
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        "Professional Verified" badge
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => verifyLinkedInMutation.mutate(linkedinUrl)}
                    disabled={!linkedinUrl || verifyLinkedInMutation.isPending}
                    className="w-full"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    Verify LinkedIn Profile
                  </Button>
                </>
              )}

              {verificationStep === 'verify' && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h3 className="font-semibold">Verifying LinkedIn Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzing your experience, skills, and professional network...
                    </p>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              )}

              {verificationStep === 'complete' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-green-600">LinkedIn Verified!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your profile has been successfully verified and linked.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LinkedIn Profile Preview */}
          {mockLinkedInProfile.verified && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">LinkedIn Profile Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{mockLinkedInProfile.name}</h3>
                      <p className="text-muted-foreground">{mockLinkedInProfile.headline}</p>
                      <p className="text-sm text-muted-foreground">{mockLinkedInProfile.location}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{mockLinkedInProfile.connections}</div>
                        <div className="text-sm text-muted-foreground">Connections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{mockLinkedInProfile.experience.length}</div>
                        <div className="text-sm text-muted-foreground">Positions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{mockLinkedInProfile.profileScore}</div>
                        <div className="text-sm text-muted-foreground">Profile Score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Professional Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockLinkedInProfile.experience.map((exp, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{exp.position}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={exp.current ? "default" : "outline"}>
                              {exp.current ? "Current" : "Previous"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{exp.duration}</p>
                          </div>
                        </div>
                        <p className="text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skills & Endorsements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {mockLinkedInProfile.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          {skill.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <Badge variant="outline">{skill.endorsements} endorsements</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Verification Benefits */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
              Professional Verification Rewards
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Verified professionals earn significantly more on Decentralcy! GitHub verification 
              shows technical expertise while LinkedIn verification demonstrates professional credibility. 
              Both increase your profile visibility and unlock premium job opportunities.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-green-600 text-white">Higher Job Match Rate</Badge>
              <Badge className="bg-blue-600 text-white">Premium Job Access</Badge>
              <Badge className="bg-purple-600 text-white">Token Rewards</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
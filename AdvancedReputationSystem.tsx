import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star,
  Shield,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  ExternalLink,
  Trophy,
  Target,
  Zap,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvancedReputationSystemProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface ReputationMetrics {
  overallScore: number;
  totalReviews: number;
  averageRating: number;
  completionRate: number;
  onTimeDelivery: number;
  communicationScore: number;
  qualityScore: number;
  responseTime: number; // hours
  repeatClientRate: number;
  blockchainVerified: number;
}

interface Review {
  id: string;
  clientAddress: string;
  clientName: string;
  projectTitle: string;
  rating: number;
  comment: string;
  skills: string[];
  projectValue: number;
  completedDate: string;
  verificationHash: string;
  onChain: boolean;
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
}

interface SkillVerification {
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verifiedBy: string[];
  projectsCompleted: number;
  averageRating: number;
  lastUpdated: string;
  blockchainCertified: boolean;
}

export default function AdvancedReputationSystem({ 
  userAddress, 
  isConnected, 
  userType 
}: AdvancedReputationSystemProps) {
  const [metrics, setMetrics] = useState<ReputationMetrics>({
    overallScore: 0,
    totalReviews: 0,
    averageRating: 0,
    completionRate: 0,
    onTimeDelivery: 0,
    communicationScore: 0,
    qualityScore: 0,
    responseTime: 0,
    repeatClientRate: 0,
    blockchainVerified: 0
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [skillVerifications, setSkillVerifications] = useState<SkillVerification[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'reviews' | 'skills' | 'achievements'>('overview');
  const { toast } = useToast();

  // Load reputation data when connected
  useEffect(() => {
    if (isConnected && userAddress) {
      loadReputationData();
    }
  }, [isConnected, userAddress]);

  const loadReputationData = () => {
    // Simulated reputation data based on blockchain verification
    const mockMetrics: ReputationMetrics = {
      overallScore: 92,
      totalReviews: 47,
      averageRating: 4.8,
      completionRate: 98,
      onTimeDelivery: 95,
      communicationScore: 4.9,
      qualityScore: 4.7,
      responseTime: 2.3,
      repeatClientRate: 76,
      blockchainVerified: 89
    };

    const mockReviews: Review[] = [
      {
        id: '1',
        clientAddress: '0x742d...8c4f',
        clientName: 'DeFi Protocol Inc.',
        projectTitle: 'Smart Contract Audit & Security Review',
        rating: 5,
        comment: 'Exceptional work on our DeFi protocol audit. Found critical vulnerabilities and provided comprehensive solutions. Delivered ahead of schedule with detailed documentation.',
        skills: ['Solidity', 'Security Audit', 'DeFi'],
        projectValue: 15000,
        completedDate: '2024-01-15',
        verificationHash: '0x8f4e...9b2c',
        onChain: true,
        categories: {
          communication: 5,
          quality: 5,
          timeliness: 5,
          professionalism: 5
        }
      },
      {
        id: '2',
        clientAddress: '0x9a1b...7e3d',
        clientName: 'NFT Marketplace',
        projectTitle: 'Frontend Development for NFT Trading Platform',
        rating: 5,
        comment: 'Outstanding React development skills. Created a beautiful, responsive interface with excellent Web3 integration. Great communication throughout the project.',
        skills: ['React', 'TypeScript', 'Web3', 'UI/UX'],
        projectValue: 8500,
        completedDate: '2024-01-08',
        verificationHash: '0x3c7a...5f8e',
        onChain: true,
        categories: {
          communication: 5,
          quality: 5,
          timeliness: 4,
          professionalism: 5
        }
      },
      {
        id: '3',
        clientAddress: '0x6f2e...4a9b',
        clientName: 'Crypto Startup',
        projectTitle: 'Backend API Development',
        rating: 4,
        comment: 'Solid backend development work. Built scalable APIs with good performance. Some minor delays but overall quality was excellent.',
        skills: ['Node.js', 'PostgreSQL', 'API Development'],
        projectValue: 6200,
        completedDate: '2023-12-22',
        verificationHash: '0x1d5c...8e2f',
        onChain: true,
        categories: {
          communication: 4,
          quality: 5,
          timeliness: 3,
          professionalism: 4
        }
      }
    ];

    const mockSkills: SkillVerification[] = [
      {
        skill: 'Solidity',
        level: 'Expert',
        verifiedBy: ['DeFi Protocol Inc.', 'Security Labs', 'Blockchain Academy'],
        projectsCompleted: 12,
        averageRating: 4.9,
        lastUpdated: '2024-01-15',
        blockchainCertified: true
      },
      {
        skill: 'React',
        level: 'Advanced',
        verifiedBy: ['NFT Marketplace', 'Web3 Agency', 'Tech Startup'],
        projectsCompleted: 18,
        averageRating: 4.7,
        lastUpdated: '2024-01-08',
        blockchainCertified: true
      },
      {
        skill: 'Smart Contract Security',
        level: 'Expert',
        verifiedBy: ['Security Firm', 'DeFi Protocol Inc.'],
        projectsCompleted: 8,
        averageRating: 5.0,
        lastUpdated: '2024-01-15',
        blockchainCertified: true
      },
      {
        skill: 'TypeScript',
        level: 'Advanced',
        verifiedBy: ['Multiple Clients'],
        projectsCompleted: 15,
        averageRating: 4.6,
        lastUpdated: '2024-01-01',
        blockchainCertified: false
      }
    ];

    setMetrics(mockMetrics);
    setReviews(mockReviews);
    setSkillVerifications(mockSkills);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Advanced Reputation System
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your blockchain-verified reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect Wallet to View Reputation</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reputation Overview Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Reputation Score
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </CardTitle>
              <CardDescription>
                Blockchain-verified professional reputation and reviews
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{metrics.overallScore}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.totalReviews}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-yellow-600">{metrics.averageRating}</span>
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.blockchainVerified}%</div>
              <div className="text-sm text-muted-foreground">Blockchain Verified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'reviews', label: 'Reviews', icon: MessageSquare },
          { id: 'skills', label: 'Skills', icon: Target },
          { id: 'achievements', label: 'Achievements', icon: Trophy }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setSelectedTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'On-Time Delivery', value: metrics.onTimeDelivery, max: 100 },
                  { label: 'Communication Score', value: metrics.communicationScore * 20, max: 100 },
                  { label: 'Quality Score', value: metrics.qualityScore * 20, max: 100 },
                  { label: 'Repeat Client Rate', value: metrics.repeatClientRate, max: 100 }
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className={`text-sm font-medium ${getScoreColor(metric.value)}`}>
                        {metric.value}%
                      </span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.responseTime}h</div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.repeatClientRate}%</div>
                    <div className="text-sm text-muted-foreground">Repeat Clients</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.blockchainVerified}%</div>
                    <div className="text-sm text-muted-foreground">Verified Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {selectedTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{review.projectTitle}</h4>
                      {review.onChain && (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          On-Chain
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{review.clientName}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{review.clientAddress}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${review.projectValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">{review.comment}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {review.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(review.categories).map(([category, rating]) => (
                      <div key={category} className="text-center">
                        <div className="text-sm font-medium capitalize">{category}</div>
                        <div className="flex items-center justify-center gap-1">
                          {renderStars(rating)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                    <span>Completed: {review.completedDate}</span>
                    {review.onChain && (
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on Blockchain
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Skills Tab */}
      {selectedTab === 'skills' && (
        <div className="space-y-4">
          {skillVerifications.map((skill, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{skill.skill}</h4>
                      <Badge className={`${skill.blockchainCertified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {skill.level}
                      </Badge>
                      {skill.blockchainCertified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Verified by {skill.verifiedBy.length} clients • {skill.projectsCompleted} projects completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-lg font-bold">{skill.averageRating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {skill.lastUpdated}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Perfect Score Champion', description: '10+ projects with 5-star ratings', icon: Trophy, earned: true },
            { title: 'Speed Demon', description: 'Delivered 20+ projects ahead of schedule', icon: Zap, earned: true },
            { title: 'Security Expert', description: 'Completed 5+ security audit projects', icon: Shield, earned: true },
            { title: 'Blockchain Pioneer', description: '100% on-chain verified reviews', icon: Award, earned: false },
            { title: 'Client Favorite', description: '80%+ repeat client rate', icon: ThumbsUp, earned: true },
            { title: 'Platform Ambassador', description: 'Top 1% of all freelancers', icon: Star, earned: false }
          ].map((achievement, index) => {
            const AchievementIcon = achievement.icon;
            return (
              <Card key={index} className={achievement.earned ? 'border-yellow-200' : 'opacity-60'}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <AchievementIcon className={`w-6 h-6 ${
                        achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
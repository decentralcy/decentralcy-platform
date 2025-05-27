import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  TrendingUp, 
  Award, 
  Shield,
  CheckCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ReputationSystemProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface WorkerReputation {
  walletAddress: string;
  overallScore: number;
  totalJobs: number;
  averageRating: number;
  onTimeDelivery: number;
  communicationScore: number;
  qualityScore: number;
  rehireRate: number;
  skillsVerified: string[];
  badges: ReputationBadge[];
  recentReviews: JobReview[];
  performanceMetrics: PerformanceMetrics;
}

interface JobReview {
  id: string;
  jobTitle: string;
  employerAddress: string;
  employerName?: string;
  rating: number;
  review: string;
  categories: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  createdAt: Date;
  jobValue: string;
  verified: boolean;
}

interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
  criteria: string;
}

interface PerformanceMetrics {
  completionRate: number;
  averageDeliveryTime: string;
  clientSatisfaction: number;
  repeatClientRate: number;
  disputeRate: number;
  responseTime: string;
  availabilityScore: number;
}

export default function ReputationSystem({ userAddress, isConnected, userType }: ReputationSystemProps) {
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [newReview, setNewReview] = useState({
    rating: 5,
    review: "",
    categories: {
      quality: 5,
      communication: 5,
      timeliness: 5,
      professionalism: 5
    }
  });
  const { toast } = useToast();

  // Fetch worker reputation data
  const { data: reputation, isLoading } = useQuery({
    queryKey: ['/api/reputation', userAddress],
    enabled: isConnected && userType !== 'employer'
  });

  // Mock reputation data for demonstration
  const mockReputation: WorkerReputation = {
    walletAddress: userAddress,
    overallScore: 847,
    totalJobs: 23,
    averageRating: 4.8,
    onTimeDelivery: 96,
    communicationScore: 4.9,
    qualityScore: 4.7,
    rehireRate: 78,
    skillsVerified: ["React", "Smart Contracts", "UI/UX Design", "TypeScript"],
    badges: [
      {
        id: "badge_1",
        name: "Top Performer",
        description: "Completed 20+ jobs with 4.5+ rating",
        icon: "🏆",
        rarity: "epic",
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        criteria: "20+ jobs, 4.5+ rating, 95%+ on-time delivery"
      },
      {
        id: "badge_2",
        name: "Communication Expert",
        description: "Exceptional communication skills",
        icon: "💬",
        rarity: "rare",
        earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        criteria: "4.8+ communication score across 10+ jobs"
      },
      {
        id: "badge_3",
        name: "Blockchain Specialist",
        description: "Verified expertise in blockchain development",
        icon: "⛓️",
        rarity: "legendary",
        earnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        criteria: "Smart contract audit passed + 15+ blockchain projects"
      }
    ],
    recentReviews: [
      {
        id: "review_1",
        jobTitle: "DeFi Protocol Development",
        employerAddress: "0x1234567890123456789012345678901234567890",
        employerName: "CryptoStart Inc",
        rating: 5,
        review: "Exceptional work! Delivered ahead of schedule with clean, well-documented code. Communication was excellent throughout the project.",
        categories: {
          quality: 5,
          communication: 5,
          timeliness: 5,
          professionalism: 5
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        jobValue: "3.5 ETH",
        verified: true
      },
      {
        id: "review_2",
        jobTitle: "NFT Marketplace Frontend",
        employerAddress: "0x9876543210987654321098765432109876543210",
        employerName: "Digital Arts DAO",
        rating: 4,
        review: "Great technical skills and delivered quality work. Could improve on initial timeline estimates but overall very satisfied.",
        categories: {
          quality: 5,
          communication: 4,
          timeliness: 3,
          professionalism: 4
        },
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        jobValue: "2.1 ETH",
        verified: true
      }
    ],
    performanceMetrics: {
      completionRate: 96,
      averageDeliveryTime: "4.2 days",
      clientSatisfaction: 4.8,
      repeatClientRate: 34,
      disputeRate: 2,
      responseTime: "< 2 hours",
      availabilityScore: 92
    }
  };

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted Successfully! ⭐",
        description: "Your review helps build trust in the Decentralcy community",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reputation'] });
      setNewReview({
        rating: 5,
        review: "",
        categories: { quality: 5, communication: 5, timeliness: 5, professionalism: 5 }
      });
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Reputation & Rating System
          </CardTitle>
          <CardDescription>
            Build trust through verified ratings, performance metrics, and skill verification
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue={userType === 'employer' ? 'submit-review' : 'my-reputation'} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {userType !== 'employer' && <TabsTrigger value="my-reputation">My Reputation</TabsTrigger>}
          <TabsTrigger value="submit-review">Submit Review</TabsTrigger>
          <TabsTrigger value="browse-workers">Browse Workers</TabsTrigger>
          <TabsTrigger value="reputation-insights">Insights</TabsTrigger>
        </TabsList>

        {userType !== 'employer' && (
          <TabsContent value="my-reputation" className="space-y-6">
            {/* Overall Reputation Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Reputation Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{mockReputation.overallScore}</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <Progress value={(mockReputation.overallScore / 1000) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {renderStars(Math.floor(mockReputation.averageRating))}
                      <span className="text-2xl font-bold ml-2">{mockReputation.averageRating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                    <div className="text-xs text-green-600 mt-1">Based on {mockReputation.totalJobs} jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{mockReputation.onTimeDelivery}%</div>
                    <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                    <div className="text-xs text-blue-600 mt-1">Industry leading</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Completion Rate:</span>
                      <span className={`font-bold ${getPerformanceColor(mockReputation.performanceMetrics.completionRate)}`}>
                        {mockReputation.performanceMetrics.completionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Client Satisfaction:</span>
                      <div className="flex items-center gap-1">
                        {renderStars(Math.floor(mockReputation.performanceMetrics.clientSatisfaction))}
                        <span className="font-bold ml-1">{mockReputation.performanceMetrics.clientSatisfaction}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Response Time:</span>
                      <span className="font-bold text-green-600">{mockReputation.performanceMetrics.responseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dispute Rate:</span>
                      <span className="font-bold text-green-600">{mockReputation.performanceMetrics.disputeRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Repeat Client Rate:</span>
                      <span className="font-bold text-blue-600">{mockReputation.performanceMetrics.repeatClientRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Delivery Time:</span>
                      <span className="font-bold">{mockReputation.performanceMetrics.averageDeliveryTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Availability Score:</span>
                      <span className={`font-bold ${getPerformanceColor(mockReputation.performanceMetrics.availabilityScore)}`}>
                        {mockReputation.performanceMetrics.availabilityScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reputation Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Achievement Badges</CardTitle>
                <CardDescription>Earned through exceptional performance and verified skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockReputation.badges.map((badge) => (
                    <div key={badge.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <h4 className="font-semibold">{badge.name}</h4>
                          <Badge className={getRarityColor(badge.rarity)}>
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <div className="text-xs text-gray-500">
                        <div>Earned: {badge.earnedAt.toLocaleDateString()}</div>
                        <div>Criteria: {badge.criteria}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReputation.recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{review.jobTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {review.employerName || `${review.employerAddress.slice(0, 6)}...${review.employerAddress.slice(-4)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            {review.verified && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {review.createdAt.toLocaleDateString()} • {review.jobValue}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{review.review}</p>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div>Quality</div>
                          <div className="flex justify-center">{renderStars(review.categories.quality)}</div>
                        </div>
                        <div className="text-center">
                          <div>Communication</div>
                          <div className="flex justify-center">{renderStars(review.categories.communication)}</div>
                        </div>
                        <div className="text-center">
                          <div>Timeliness</div>
                          <div className="flex justify-center">{renderStars(review.categories.timeliness)}</div>
                        </div>
                        <div className="text-center">
                          <div>Professionalism</div>
                          <div className="flex justify-center">{renderStars(review.categories.professionalism)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="submit-review" className="space-y-6">
          {/* Submit Review Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submit Worker Review</CardTitle>
              <CardDescription>
                Help build trust in the community by sharing your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Worker Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="w-full p-2 border rounded-md mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Overall Rating</label>
                  <div className="flex items-center gap-2 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${i < newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-medium">{newReview.rating}/5</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(newReview.categories).map(([category, rating]) => (
                    <div key={category}>
                      <label className="text-sm font-medium capitalize">{category}</label>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setNewReview(prev => ({
                              ...prev,
                              categories: { ...prev.categories, [category]: i + 1 }
                            }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm">{rating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">Review Details</label>
                  <Textarea
                    placeholder="Share your experience working with this person..."
                    value={newReview.review}
                    onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={() => submitReviewMutation.mutate({
                    workerAddress: selectedWorker,
                    ...newReview
                  })}
                  disabled={!selectedWorker || !newReview.review || submitReviewMutation.isPending}
                  className="w-full"
                >
                  {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse-workers" className="space-y-6">
          {/* Worker Browser */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Browse Workers by Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Worker directory with reputation filtering will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reputation-insights" className="space-y-6">
          {/* Reputation Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reputation System Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">How Reputation is Calculated</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Job Completion Rate:</span>
                      <span>30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span>25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-Time Delivery:</span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Communication Score:</span>
                      <span>15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skill Verification:</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Badge Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div>🏆 <strong>Top Performer:</strong> 20+ jobs, 4.5+ rating, 95%+ delivery</div>
                    <div>💬 <strong>Communication Expert:</strong> 4.8+ communication across 10+ jobs</div>
                    <div>⛓️ <strong>Blockchain Specialist:</strong> Smart contract verification</div>
                    <div>🚀 <strong>Rising Star:</strong> 5+ jobs with 4.8+ rating in first month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trust & Verification */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
            Building Trust Through Transparency
          </h3>
          <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
            Decentralcy's reputation system creates a transparent, fair marketplace where quality work 
            is rewarded and trust is built through verified performance metrics. Every rating is 
            recorded on-chain for permanent accountability.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Badge className="bg-green-600 text-white">On-Chain Verification</Badge>
            <Badge className="bg-blue-600 text-white">Skill-Based Scoring</Badge>
            <Badge className="bg-purple-600 text-white">Performance Tracking</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
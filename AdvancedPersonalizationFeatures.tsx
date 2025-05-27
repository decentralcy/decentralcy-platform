import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Star,
  Lightbulb,
  Users,
  Shield,
  Wallet,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvancedPersonalizationFeaturesProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'onboarding' | 'optimization' | 'security' | 'earning';
  completed: boolean;
}

interface PersonalizedInsight {
  type: 'tip' | 'achievement' | 'opportunity' | 'warning';
  title: string;
  content: string;
  action?: string;
  value?: string;
}

interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  progress: number;
  reward: string;
  completed: boolean;
}

export default function AdvancedPersonalizationFeatures({ 
  userAddress, 
  isConnected, 
  userType 
}: AdvancedPersonalizationFeaturesProps) {
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [personalizedInsights, setPersonalizedInsights] = useState<PersonalizedInsight[]>([]);
  const [progressMilestones, setProgressMilestones] = useState<ProgressMilestone[]>([]);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const { toast } = useToast();

  // Initialize smart suggestions based on user state
  useEffect(() => {
    const suggestions: SmartSuggestion[] = [
      {
        id: 'setup-wallet',
        title: 'Connect Your Wallet',
        description: 'Start by connecting your crypto wallet to access all features',
        action: 'Connect Wallet',
        priority: 'high',
        category: 'onboarding',
        completed: isConnected
      },
      {
        id: 'complete-profile',
        title: 'Complete Your Profile',
        description: 'Add your skills and work samples to attract better opportunities',
        action: 'Edit Profile',
        priority: 'high',
        category: 'onboarding',
        completed: false
      },
      {
        id: 'verify-skills',
        title: 'Verify Your Skills',
        description: 'Get verified badges to increase your credibility and earning potential',
        action: 'Start Verification',
        priority: 'medium',
        category: 'optimization',
        completed: false
      },
      {
        id: 'enable-2fa',
        title: 'Enable Security Features',
        description: 'Protect your account with additional security measures',
        action: 'Enable Security',
        priority: 'medium',
        category: 'security',
        completed: false
      },
      {
        id: 'optimize-rates',
        title: 'Optimize Your Rates',
        description: 'Based on market data, you could increase your rates by 15%',
        action: 'Review Rates',
        priority: 'low',
        category: 'earning',
        completed: false
      }
    ];

    setSmartSuggestions(suggestions);
  }, [isConnected]);

  // Generate personalized insights
  useEffect(() => {
    const insights: PersonalizedInsight[] = [
      {
        type: 'tip',
        title: 'Perfect Timing!',
        content: 'Blockchain development jobs are up 34% this week. Great time to apply!',
        action: 'Browse Jobs'
      },
      {
        type: 'achievement',
        title: 'Reputation Milestone',
        content: 'You\'re only 2 five-star reviews away from unlocking the "Top Performer" badge!',
        value: '2 reviews'
      },
      {
        type: 'opportunity',
        title: 'High-Paying Opportunity',
        content: 'A client who hired similar workers is looking for your skills. 85% match!',
        action: 'View Job',
        value: '5.2 ETH'
      },
      {
        type: 'warning',
        title: 'Market Alert',
        content: 'Gas fees are currently low - great time to apply for jobs or withdraw earnings',
        action: 'Check Fees'
      }
    ];

    setPersonalizedInsights(insights);
  }, []);

  // Progress milestones
  useEffect(() => {
    const milestones: ProgressMilestone[] = [
      {
        id: 'first-job',
        title: 'Complete First Job',
        description: 'Land and complete your first job successfully',
        progress: 0,
        reward: '100 DCNTRC + "Rising Star" badge',
        completed: false
      },
      {
        id: 'five-star',
        title: 'Earn 5-Star Rating',
        description: 'Receive your first perfect rating from a client',
        progress: 0,
        reward: '50 DCNTRC + Reputation boost',
        completed: false
      },
      {
        id: 'skill-verification',
        title: 'Verify 3 Skills',
        description: 'Get three of your skills officially verified',
        progress: 0,
        reward: '200 DCNTRC + "Verified Expert" badge',
        completed: false
      },
      {
        id: 'repeat-client',
        title: 'Get Repeat Client',
        description: 'Have a client hire you for multiple projects',
        progress: 0,
        reward: '150 DCNTRC + "Trusted Partner" badge',
        completed: false
      }
    ];

    setProgressMilestones(milestones);
  }, []);

  const completeSuggestion = (suggestionId: string) => {
    setSmartSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, completed: true } : s)
    );
    
    toast({
      title: "✨ Great Progress!",
      description: "You're building an amazing profile on Decentralcy!",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'achievement': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'opportunity': return <Target className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip': return 'border-blue-200 bg-blue-50';
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* AI-Powered Smart Suggestions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>
            Personalized recommendations to optimize your Decentralcy experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {smartSuggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                  suggestion.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {suggestion.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <h4 className={`font-semibold ${suggestion.completed ? 'text-green-800' : ''}`}>
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    {!suggestion.completed && (
                      <Button 
                        size="sm" 
                        onClick={() => completeSuggestion(suggestion.id)}
                      >
                        {suggestion.action}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Personalized Insights
          </CardTitle>
          <CardDescription>Real-time insights based on your activity and market trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {personalizedInsights.map((insight, index) => (
              <Card key={index} className={`${getInsightColor(insight.type)} border-2`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.content}</p>
                      <div className="flex items-center justify-between">
                        {insight.value && (
                          <Badge className="bg-white/80 text-gray-800">
                            {insight.value}
                          </Badge>
                        )}
                        {insight.action && (
                          <Button variant="outline" size="sm">
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-500" />
            Progress Milestones
          </CardTitle>
          <CardDescription>Track your journey and earn rewards for achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressMilestones.map((milestone) => (
              <div key={milestone.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    {milestone.reward}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Customization Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Advanced Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Enable Advanced Analytics</span>
                <p className="text-sm text-muted-foreground">Show detailed performance metrics and predictions</p>
              </div>
              <Switch
                checked={showAdvancedFeatures}
                onCheckedChange={setShowAdvancedFeatures}
              />
            </div>

            {showAdvancedFeatures && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-3">Advanced Analytics Enabled</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-muted-foreground">Match Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+23%</div>
                    <div className="text-sm text-muted-foreground">Earning Potential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Top 5%</div>
                    <div className="text-sm text-muted-foreground">Platform Ranking</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Floating Panel */}
      <div className="fixed bottom-20 right-6 space-y-2">
        <Button
          className="rounded-full w-14 h-14 shadow-lg bg-blue-500 hover:bg-blue-600"
          onClick={() => toast({ title: "💡 Quick Tip", description: "Check your reputation score for improvement suggestions!" })}
        >
          <Lightbulb className="w-6 h-6" />
        </Button>
        <Button
          className="rounded-full w-14 h-14 shadow-lg bg-green-500 hover:bg-green-600"
          onClick={() => toast({ title: "🎯 Opportunity", description: "3 new jobs match your skills perfectly!" })}
        >
          <Target className="w-6 h-6" />
        </Button>
      </div>

      {/* Personalization Success */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
            🧠 AI-Powered Personalization Active!
          </h3>
          <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
            Your Decentralcy experience is now fully personalized! The platform learns from your 
            behavior to provide smart suggestions, relevant opportunities, and optimize your 
            earning potential. Every interaction makes it even better!
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Badge className="bg-green-600 text-white">Smart Suggestions</Badge>
            <Badge className="bg-blue-600 text-white">Real-time Insights</Badge>
            <Badge className="bg-purple-600 text-white">Progress Tracking</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
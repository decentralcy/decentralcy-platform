import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle,
  Circle,
  User,
  Briefcase,
  Star,
  Award,
  Camera,
  FileText,
  Shield,
  Wallet,
  Trophy,
  Gift,
  Zap,
  Crown,
  Target,
  TrendingUp,
  Lock,
  Unlock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GamifiedProfileCompletionProps {
  userAddress: string;
  isConnected: boolean;
  userType: 'worker' | 'employer' | 'both';
}

interface ProfileTask {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'basic' | 'professional' | 'advanced' | 'elite';
  points: number;
  completed: boolean;
  reward: string;
  estimatedTime: string;
  required: boolean;
  unlockLevel?: number;
}

interface ProfileLevel {
  level: number;
  title: string;
  description: string;
  pointsRequired: number;
  rewards: string[];
  icon: any;
  color: string;
}

export default function GamifiedProfileCompletion({ 
  userAddress, 
  isConnected, 
  userType 
}: GamifiedProfileCompletionProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const { toast } = useToast();

  // Profile completion levels
  const profileLevels: ProfileLevel[] = [
    {
      level: 1,
      title: "Getting Started",
      description: "Complete your basic profile setup",
      pointsRequired: 0,
      rewards: ["Profile Visible", "Basic Job Applications"],
      icon: User,
      color: "bg-blue-500"
    },
    {
      level: 2,
      title: "Professional",
      description: "Add professional details and portfolio",
      pointsRequired: 150,
      rewards: ["Priority in Search", "50 DCNTRC Bonus", "Professional Badge"],
      icon: Briefcase,
      color: "bg-green-500"
    },
    {
      level: 3,
      title: "Verified Expert",
      description: "Complete verification and advanced features",
      pointsRequired: 400,
      rewards: ["Verified Checkmark", "Higher Job Limits", "200 DCNTRC Bonus"],
      icon: Shield,
      color: "bg-purple-500"
    },
    {
      level: 4,
      title: "Elite Freelancer",
      description: "Unlock premium features and recognition",
      pointsRequired: 800,
      rewards: ["Elite Badge", "Premium Support", "500 DCNTRC Bonus", "Custom Profile URL"],
      icon: Crown,
      color: "bg-yellow-500"
    },
    {
      level: 5,
      title: "Decentralcy Ambassador",
      description: "Maximum profile completion and platform mastery",
      pointsRequired: 1200,
      rewards: ["Ambassador Status", "Revenue Sharing", "1000 DCNTRC Bonus", "Platform Governance Rights"],
      icon: Trophy,
      color: "bg-gradient-to-r from-yellow-400 to-orange-500"
    }
  ];

  // Profile completion tasks
  const profileTasks: ProfileTask[] = [
    // Basic Level Tasks
    {
      id: 'wallet-connected',
      title: 'Connect Web3 Wallet',
      description: 'Link your MetaMask or other Web3 wallet',
      icon: Wallet,
      category: 'basic',
      points: 25,
      completed: isConnected,
      reward: '25 DCNTRC + Profile Unlock',
      estimatedTime: '2 minutes',
      required: true
    },
    {
      id: 'basic-info',
      title: 'Add Basic Information',
      description: 'Complete name, email, and location',
      icon: User,
      category: 'basic',
      points: 30,
      completed: false,
      reward: '30 DCNTRC + Visibility Boost',
      estimatedTime: '3 minutes',
      required: true
    },
    {
      id: 'profile-photo',
      title: 'Upload Profile Photo',
      description: 'Add a professional profile picture',
      icon: Camera,
      category: 'basic',
      points: 20,
      completed: false,
      reward: '20 DCNTRC + Trust Score Boost',
      estimatedTime: '2 minutes',
      required: true
    },
    {
      id: 'bio-description',
      title: 'Write Professional Bio',
      description: 'Describe your skills and experience (minimum 100 words)',
      icon: FileText,
      category: 'basic',
      points: 40,
      completed: false,
      reward: '40 DCNTRC + SEO Optimization',
      estimatedTime: '5 minutes',
      required: true
    },

    // Professional Level Tasks
    {
      id: 'skills-selection',
      title: 'Select Your Skills',
      description: 'Choose at least 5 relevant skills from our database',
      icon: Target,
      category: 'professional',
      points: 35,
      completed: false,
      reward: '35 DCNTRC + Skill Matching',
      estimatedTime: '4 minutes',
      required: false,
      unlockLevel: 2
    },
    {
      id: 'hourly-rate',
      title: 'Set Your Hourly Rate',
      description: 'Define your pricing for different types of work',
      icon: TrendingUp,
      category: 'professional',
      points: 30,
      completed: false,
      reward: '30 DCNTRC + Rate Optimization Tips',
      estimatedTime: '3 minutes',
      required: false,
      unlockLevel: 2
    },
    {
      id: 'portfolio-upload',
      title: 'Add Portfolio Samples',
      description: 'Upload at least 3 examples of your best work',
      icon: Briefcase,
      category: 'professional',
      points: 60,
      completed: false,
      reward: '60 DCNTRC + Portfolio Showcase',
      estimatedTime: '10 minutes',
      required: false,
      unlockLevel: 2
    },
    {
      id: 'availability-calendar',
      title: 'Set Availability Calendar',
      description: 'Configure your working hours and availability',
      icon: Star,
      category: 'professional',
      points: 25,
      completed: false,
      reward: '25 DCNTRC + Smart Job Matching',
      estimatedTime: '3 minutes',
      required: false,
      unlockLevel: 2
    },

    // Advanced Level Tasks
    {
      id: 'identity-verification',
      title: 'Complete Identity Verification',
      description: 'Verify your identity for enhanced trust and higher job limits',
      icon: Shield,
      category: 'advanced',
      points: 100,
      completed: false,
      reward: '100 DCNTRC + Verified Badge + Higher Limits',
      estimatedTime: '15 minutes',
      required: false,
      unlockLevel: 3
    },
    {
      id: 'skill-assessment',
      title: 'Take Skill Assessments',
      description: 'Complete at least 3 skill tests to showcase expertise',
      icon: Award,
      category: 'advanced',
      points: 80,
      completed: false,
      reward: '80 DCNTRC + Skill Badges + Priority Ranking',
      estimatedTime: '20 minutes',
      required: false,
      unlockLevel: 3
    },
    {
      id: 'references-contact',
      title: 'Add Professional References',
      description: 'Provide contact details for at least 2 professional references',
      icon: User,
      category: 'advanced',
      points: 70,
      completed: false,
      reward: '70 DCNTRC + Reference Verification + Trust Boost',
      estimatedTime: '10 minutes',
      required: false,
      unlockLevel: 3
    },

    // Elite Level Tasks
    {
      id: 'video-introduction',
      title: 'Record Video Introduction',
      description: 'Create a 60-second professional video introduction',
      icon: Camera,
      category: 'elite',
      points: 120,
      completed: false,
      reward: '120 DCNTRC + Video Showcase + Premium Visibility',
      estimatedTime: '30 minutes',
      required: false,
      unlockLevel: 4
    },
    {
      id: 'certification-upload',
      title: 'Upload Professional Certifications',
      description: 'Add relevant industry certifications and licenses',
      icon: Award,
      category: 'elite',
      points: 90,
      completed: false,
      reward: '90 DCNTRC + Certification Badges + Expert Status',
      estimatedTime: '15 minutes',
      required: false,
      unlockLevel: 4
    },
    {
      id: 'social-proof',
      title: 'Connect Social Profiles',
      description: 'Link LinkedIn, GitHub, or other professional profiles',
      icon: TrendingUp,
      category: 'elite',
      points: 60,
      completed: false,
      reward: '60 DCNTRC + Social Verification + Cross-Platform Sync',
      estimatedTime: '8 minutes',
      required: false,
      unlockLevel: 4
    }
  ];

  // Calculate progress and level
  useEffect(() => {
    const completed = profileTasks.filter(task => 
      completedTasks.has(task.id) || task.completed
    );
    const points = completed.reduce((sum, task) => sum + task.points, 0);
    setTotalPoints(points);

    // Determine current level
    const level = profileLevels.findLast(level => points >= level.pointsRequired);
    if (level) {
      setCurrentLevel(level.level);
    }
  }, [completedTasks]);

  const completeTask = (taskId: string) => {
    const task = profileTasks.find(t => t.id === taskId);
    if (task && !completedTasks.has(taskId)) {
      const newCompleted = new Set([...completedTasks, taskId]);
      setCompletedTasks(newCompleted);
      
      toast({
        title: "🎉 Task Completed!",
        description: `You earned ${task.points} points! Reward: ${task.reward}`,
      });

      // Check for level up
      const newPoints = totalPoints + task.points;
      const newLevel = profileLevels.findLast(level => newPoints >= level.pointsRequired);
      if (newLevel && newLevel.level > currentLevel) {
        setTimeout(() => {
          toast({
            title: "🚀 Level Up!",
            description: `Congratulations! You reached ${newLevel.title}!`,
          });
          setShowRewards(true);
        }, 1000);
      }
    }
  };

  const completedTasksCount = profileTasks.filter(task => 
    completedTasks.has(task.id) || task.completed
  ).length;
  const totalTasksCount = profileTasks.length;
  const completionPercentage = (completedTasksCount / totalTasksCount) * 100;
  
  const currentLevelData = profileLevels.find(level => level.level === currentLevel);
  const nextLevelData = profileLevels.find(level => level.level === currentLevel + 1);
  const progressToNextLevel = nextLevelData 
    ? ((totalPoints - (currentLevelData?.pointsRequired || 0)) / 
       (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) * 100
    : 100;

  const availableTasks = profileTasks.filter(task => 
    !task.unlockLevel || currentLevel >= task.unlockLevel
  );

  const getTasksByCategory = (category: string) => {
    return availableTasks.filter(task => task.category === category);
  };

  const CurrentLevelIcon = currentLevelData?.icon || User;

  return (
    <div className="space-y-6">
      {/* Profile Completion Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${currentLevelData?.color} flex items-center justify-center`}>
                <CurrentLevelIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Profile Completion</CardTitle>
                <CardDescription className="text-lg">
                  Level {currentLevel}: {currentLevelData?.title}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{Math.round(completionPercentage)}%</div>
              <div className="text-sm text-muted-foreground">
                {completedTasksCount} of {totalTasksCount} tasks
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={completionPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span>{totalPoints} Points Earned</span>
              {nextLevelData && (
                <span>
                  {nextLevelData.pointsRequired - totalPoints} points to {nextLevelData.title}
                </span>
              )}
            </div>
            {nextLevelData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to Next Level</span>
                  <span>{Math.round(progressToNextLevel)}%</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Level Rewards */}
      {currentLevelData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-600" />
              Current Level Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentLevelData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {reward}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Tasks by Category */}
      {['basic', 'professional', 'advanced', 'elite'].map(category => {
        const tasks = getTasksByCategory(category);
        if (tasks.length === 0) return null;

        const categoryCompleted = tasks.filter(task => 
          completedTasks.has(task.id) || task.completed
        ).length;
        const categoryProgress = (categoryCompleted / tasks.length) * 100;

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize flex items-center gap-2">
                  {category === 'basic' && <User className="w-5 h-5" />}
                  {category === 'professional' && <Briefcase className="w-5 h-5" />}
                  {category === 'advanced' && <Shield className="w-5 h-5" />}
                  {category === 'elite' && <Crown className="w-5 h-5" />}
                  {category} Tasks
                </CardTitle>
                <Badge variant="outline">
                  {categoryCompleted}/{tasks.length} Complete
                </Badge>
              </div>
              <Progress value={categoryProgress} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map(task => {
                  const isCompleted = completedTasks.has(task.id) || task.completed;
                  const isLocked = task.unlockLevel && currentLevel < task.unlockLevel;
                  const TaskIcon = task.icon;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg transition-all ${
                        isCompleted 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200' 
                          : isLocked
                          ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 opacity-60'
                          : 'bg-white dark:bg-gray-800 border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-100' : 'bg-blue-100'
                          }`}>
                            {isLocked ? (
                              <Lock className="w-5 h-5 text-gray-500" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <TaskIcon className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{task.title}</h4>
                              {task.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {isLocked && (
                                <Badge variant="secondary" className="text-xs">
                                  Unlocks at Level {task.unlockLevel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{task.points} points</span>
                              <span>{task.estimatedTime}</span>
                              <span className="text-yellow-600">{task.reward}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!isCompleted && !isLocked && (
                            <Button
                              size="sm"
                              onClick={() => completeTask(task.id)}
                              className="whitespace-nowrap"
                            >
                              Complete Task
                            </Button>
                          )}
                          {isCompleted && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Next Level Preview */}
      {nextLevelData && (
        <Card className="border-2 border-dashed border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Zap className="w-5 h-5" />
              Next Level: {nextLevelData.title}
            </CardTitle>
            <CardDescription>
              Unlock amazing rewards when you reach {nextLevelData.pointsRequired} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {nextLevelData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                  <Gift className="w-4 h-4" />
                  {reward}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
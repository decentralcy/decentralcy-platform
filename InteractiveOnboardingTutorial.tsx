import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Wallet,
  User,
  Briefcase,
  Star,
  DollarSign,
  Shield,
  Rocket,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InteractiveOnboardingTutorialProps {
  userAddress: string;
  isConnected: boolean;
  onComplete: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  tips: string[];
  reward?: string;
  estimatedTime: string;
}

export default function InteractiveOnboardingTutorial({ 
  userAddress, 
  isConnected, 
  onComplete 
}: InteractiveOnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(true);
  const { toast } = useToast();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Decentralcy! 🎉',
      description: 'The revolutionary platform where work meets blockchain. No middlemen, just direct connections between employers and workers.',
      icon: Rocket,
      action: 'Start Journey',
      tips: [
        'Earn up to 60% more by cutting out middlemen',
        'Your payments are protected by smart contracts',
        'Build a permanent, verified reputation on blockchain'
      ],
      reward: '50 DCNTRC Welcome Bonus',
      estimatedTime: '1 min'
    },
    {
      id: 'wallet-setup',
      title: 'Connect Your Crypto Wallet',
      description: 'Your wallet is like your digital ID and bank account combined. It\'s how you get paid and prove who you are.',
      icon: Wallet,
      action: isConnected ? 'Wallet Connected ✓' : 'Connect Wallet',
      tips: [
        'MetaMask is the most popular and secure choice',
        'Your wallet address is your unique identity',
        'You control your money - no banks needed!'
      ],
      reward: '100 DCNTRC Connection Bonus',
      estimatedTime: '2 min'
    },
    {
      id: 'profile-setup',
      title: 'Build Your Professional Profile',
      description: 'Show the world what you can do! Add your skills, experience, and work samples to attract better opportunities.',
      icon: User,
      action: 'Complete Profile',
      tips: [
        'Add at least 3 skills to get more job matches',
        'Upload work samples to showcase your talent',
        'Professional photos get 40% more responses'
      ],
      reward: 'Profile Completion Badge',
      estimatedTime: '5 min'
    },
    {
      id: 'first-job',
      title: 'Find Your First Job',
      description: 'Browse through hundreds of opportunities and apply to jobs that match your skills. Start with smaller projects to build reputation.',
      icon: Briefcase,
      action: 'Browse Jobs',
      tips: [
        'Start with jobs under 1 ETH to build reputation',
        'Read job descriptions carefully',
        'Apply quickly - good jobs go fast!'
      ],
      reward: 'First Application Badge',
      estimatedTime: '10 min'
    },
    {
      id: 'understand-escrow',
      title: 'How Payment Protection Works',
      description: 'Learn how smart contracts protect both you and your clients. Money is held safely until work is completed.',
      icon: Shield,
      action: 'Learn Escrow',
      tips: [
        'Payment is locked in a smart contract',
        'You get paid automatically when work is approved',
        'Disputes are resolved by community voting'
      ],
      reward: 'Security Expert Badge',
      estimatedTime: '3 min'
    },
    {
      id: 'build-reputation',
      title: 'Build Your Reputation',
      description: 'Complete jobs well to earn 5-star ratings. Your reputation score determines the quality of jobs you can access.',
      icon: Star,
      action: 'View Reputation',
      tips: [
        'Always deliver on time for better ratings',
        'Communicate clearly with clients',
        'High reputation = higher paying jobs'
      ],
      reward: 'Rising Star Badge',
      estimatedTime: '2 min'
    },
    {
      id: 'earning-crypto',
      title: 'Getting Paid in Cryptocurrency',
      description: 'Understand how to receive, store, and convert your crypto earnings into regular money when needed.',
      icon: DollarSign,
      action: 'Learn Crypto',
      tips: [
        'Crypto payments are instant and global',
        'You can convert to USD on exchanges like Coinbase',
        'Keep some crypto as investment - it often grows!'
      ],
      reward: 'Crypto Literacy Badge',
      estimatedTime: '4 min'
    }
  ];

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    const step = tutorialSteps.find(s => s.id === stepId);
    if (step?.reward) {
      toast({
        title: "🎉 Step Completed!",
        description: `You earned: ${step.reward}`,
      });
    }

    // Auto-advance to next step
    if (currentStep < tutorialSteps.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 1500);
    } else {
      setTimeout(() => {
        toast({
          title: "🚀 Tutorial Complete!",
          description: "You're ready to start your Web3 journey on Decentralcy!",
        });
        onComplete();
      }, 2000);
    }
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    onComplete();
  };

  if (!showTutorial) return null;

  const currentTutorialStep = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const StepIcon = currentTutorialStep.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {currentTutorialStep.estimatedTime}
            </Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <StepIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{currentTutorialStep.title}</CardTitle>
          <CardDescription className="text-base">
            {currentTutorialStep.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tips Section */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              💡 Pro Tips
            </h4>
            <ul className="space-y-2">
              {currentTutorialStep.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Reward Section */}
          {currentTutorialStep.reward && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Completion Reward
                </span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300">
                {currentTutorialStep.reward}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={skipTutorial}
                className="text-muted-foreground"
              >
                Skip Tutorial
              </Button>
            </div>

            <div className="flex gap-2">
              {completedSteps.has(currentTutorialStep.id) ? (
                <Button onClick={nextStep} disabled={currentStep === tutorialSteps.length - 1}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={() => completeStep(currentTutorialStep.id)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {currentTutorialStep.action}
                </Button>
              )}
            </div>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex justify-center gap-2 pt-4 border-t">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-500 scale-125' 
                    : index < currentStep || completedSteps.has(tutorialSteps[index].id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
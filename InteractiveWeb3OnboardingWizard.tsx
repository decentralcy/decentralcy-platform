import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Wallet,
  User,
  Briefcase,
  Star,
  DollarSign,
  Shield,
  Rocket,
  Gift,
  Play,
  Book,
  Lightbulb,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InteractiveWeb3OnboardingWizardProps {
  userAddress: string;
  isConnected: boolean;
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  actionText: string;
  tips: string[];
  reward: string;
  estimatedTime: string;
  interactive?: boolean;
  completed?: boolean;
}

export default function InteractiveWeb3OnboardingWizard({ 
  userAddress, 
  isConnected, 
  onComplete 
}: InteractiveWeb3OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showWizard, setShowWizard] = useState(true);
  const [userExperience, setUserExperience] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const { toast } = useToast();

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Web3 & Decentralcy! 🌟',
      description: 'Your journey into decentralized work begins here',
      icon: Rocket,
      content: `Welcome to the future of work! Decentralcy is a revolutionary platform that connects employers and workers directly through blockchain technology - no middlemen, no excessive fees, just fair work opportunities.

Web3 might sound complex, but we'll guide you through everything step by step. Think of it as the internet where you truly own your data, payments are instant and global, and trust is built through transparent technology instead of corporate promises.`,
      actionText: 'Start My Web3 Journey',
      tips: [
        'No prior crypto knowledge needed - we explain everything',
        'Your first job on Decentralcy could pay 60% more than traditional platforms',
        'All your work history and reputation is permanently yours, not owned by a company'
      ],
      reward: '50 DCNTRC Welcome Bonus',
      estimatedTime: '2 minutes'
    },
    {
      id: 'what-is-web3',
      title: 'What is Web3? (Simple Explanation)',
      description: 'Understanding the basics in plain English',
      icon: Book,
      content: `Web3 is like the internet, but better! Here's the simple breakdown:

**Traditional Internet (Web2):** Companies like Uber or Upwork control everything - your profile, your money, your reputation. They can ban you anytime and keep your data.

**Web3:** YOU control everything. Your profile, your reputation, and your money are yours forever. No company can take them away or charge excessive fees.

**Real Example:** On Upwork, they take 20% of your earnings and own your client relationships. On Decentralcy, we take only 2.5% and you own everything - your reputation, your client connections, and your work history.`,
      actionText: 'This Makes Sense!',
      tips: [
        'Web3 = You own your digital life instead of companies owning it',
        'Payments are instant and global - no waiting 7 days for money transfers',
        'Your reputation follows you everywhere, not trapped in one platform'
      ],
      reward: 'Web3 Explorer Badge',
      estimatedTime: '3 minutes'
    },
    {
      id: 'crypto-wallet',
      title: 'Your Crypto Wallet (Your Digital Identity)',
      description: 'Setting up your secure digital identity',
      icon: Wallet,
      content: `A crypto wallet is like a combination of your ID card and bank account, but completely under your control.

**What it does:**
- Proves who you are (like showing your driver's license)
- Stores your money securely (like your bank account)
- Signs contracts automatically (like your digital signature)
- Works globally 24/7 (no bank hours or country restrictions)

**Most Important:** You control it completely. No bank can freeze it, no company can access it, and it works anywhere in the world instantly.

MetaMask is the most popular and trusted wallet - it's like the Chrome browser of crypto wallets.`,
      actionText: isConnected ? 'Wallet Connected ✓' : 'Connect My Wallet',
      tips: [
        'MetaMask is free and takes 2 minutes to set up',
        'Your wallet address is public (like an email) but only you control the money',
        'Never share your "seed phrase" - that\'s like your master password'
      ],
      reward: '100 DCNTRC Connection Bonus',
      estimatedTime: '5 minutes',
      interactive: true
    },
    {
      id: 'understanding-payments',
      title: 'How Crypto Payments Work',
      description: 'Getting paid instantly, anywhere in the world',
      icon: DollarSign,
      content: `Crypto payments are like super-powered money transfers:

**Traditional Payment:** Client pays → Bank processes (3-7 days) → Platform takes 20% → You get 80% after a week

**Crypto Payment:** Client pays → Smart contract holds money → You complete work → You get paid instantly (minus only 2.5% platform fee)

**Real Benefits:**
- Get paid in 15 seconds instead of 7 days
- No bank fees or currency conversion fees
- Work for anyone, anywhere in the world
- Money goes directly to you, not through company accounts

You can convert crypto to regular money anytime through exchanges like Coinbase.`,
      actionText: 'I Want Instant Payments!',
      tips: [
        'Payments work 24/7 - no weekend delays or bank holidays',
        'You can convert crypto to USD instantly on exchanges',
        'Save on international fees - no more $30 wire transfer charges'
      ],
      reward: 'Payment Pro Badge',
      estimatedTime: '3 minutes'
    },
    {
      id: 'smart-contracts',
      title: 'Smart Contracts = Automatic Fairness',
      description: 'How technology ensures you always get paid',
      icon: Shield,
      content: `Smart contracts are like having a super-honest robot lawyer that never sleeps:

**The Problem:** Client might not pay you after you finish work, or you might not deliver what you promised.

**Smart Contract Solution:**
1. Client deposits money into smart contract (like an escrow account)
2. You do the work
3. When work is approved, smart contract automatically pays you
4. If there's a dispute, community voters decide fairly

**Why This Is Amazing:** No more chasing clients for payment! No more wondering if you'll get paid. The money is guaranteed to be there, and the contract enforces fairness automatically.`,
      actionText: 'Protect My Payments!',
      tips: [
        'Smart contracts are audited by security experts - safer than traditional contracts',
        'You can see exactly where your money is at all times',
        'Disputes are resolved by community voting, not biased company employees'
      ],
      reward: 'Contract Master Badge',
      estimatedTime: '4 minutes'
    },
    {
      id: 'reputation-system',
      title: 'Your Permanent Reputation',
      description: 'Building a reputation that follows you everywhere',
      icon: Star,
      content: `Your reputation on Decentralcy is permanent and truly yours:

**Traditional Platforms:** Build 5-star rating → Platform bans you or you leave → Start from zero reputation again

**Decentralcy:** Your reputation is stored on blockchain → It's yours forever → Take it to any platform → Never start from zero again

**How It Works:**
- Complete jobs well = earn reputation points
- Get 5-star reviews = boost your score
- Verify your skills = get permanent badges
- Build portfolio = showcase your best work

**The Magic:** Even if Decentralcy disappeared tomorrow, your reputation would still exist on the blockchain for other platforms to recognize.`,
      actionText: 'Build My Reputation!',
      tips: [
        'Start with smaller jobs to build reputation quickly',
        'One 5-star review is worth more than 10 mediocre ones',
        'Verified skills badges make you stand out to employers'
      ],
      reward: 'Reputation Builder Badge',
      estimatedTime: '3 minutes'
    },
    {
      id: 'getting-started',
      title: 'Your First Job on Decentralcy',
      description: 'Finding and applying for your first blockchain-powered job',
      icon: Briefcase,
      content: `Ready to earn your first crypto payment? Here's how to get started:

**Step 1:** Complete your profile with your skills and work samples
**Step 2:** Browse jobs that match your expertise
**Step 3:** Apply with a personalized message (just like normal job sites)
**Step 4:** If selected, accept the smart contract terms
**Step 5:** Do great work and get paid automatically!

**Pro Tips for Your First Job:**
- Start with smaller projects ($50-200) to build reputation
- Over-deliver on your first few jobs to get amazing reviews
- Communicate clearly and frequently with clients
- Always deliver on time or early`,
      actionText: 'Find My First Job!',
      tips: [
        'Jobs under $200 typically get decided faster',
        'Good communication gets you hired more than perfect skills',
        'Your first review sets the tone for your entire career'
      ],
      reward: 'Job Hunter Badge',
      estimatedTime: '5 minutes'
    },
    {
      id: 'safety-security',
      title: 'Staying Safe in Web3',
      description: 'Essential security practices for your protection',
      icon: Shield,
      content: `Web3 gives you control, but with control comes responsibility. Here's how to stay safe:

**Golden Rules:**
1. **Never share your seed phrase** - It's like your master password
2. **Always verify website URLs** - Use bookmarks, don't click random links
3. **Start small** - Test with small amounts before big transactions
4. **Use official apps** - Download MetaMask only from official sources

**Red Flags to Avoid:**
- Anyone asking for your seed phrase (NEVER share this)
- "Get rich quick" schemes or "guaranteed" profits
- Pressure to invest or buy immediately
- Websites with suspicious URLs or spelling mistakes

**You're Safe on Decentralcy Because:** We only facilitate work contracts, never investment schemes.`,
      actionText: 'I Understand Security!',
      tips: [
        'When in doubt, ask questions in our support chat',
        'Legitimate platforms never ask for your seed phrase',
        'Your MetaMask wallet warns you about suspicious sites'
      ],
      reward: 'Security Expert Badge',
      estimatedTime: '4 minutes'
    }
  ];

  const completeStep = (stepId: string) => {
    const newCompleted = new Set([...completedSteps, stepId]);
    setCompletedSteps(newCompleted);
    
    const step = onboardingSteps.find(s => s.id === stepId);
    if (step?.reward) {
      toast({
        title: "🎉 Step Completed!",
        description: `You earned: ${step.reward}`,
      });
    }

    // Auto-advance to next step
    if (currentStep < onboardingSteps.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 1500);
    } else {
      setTimeout(() => {
        toast({
          title: "🚀 Onboarding Complete!",
          description: "Welcome to the future of work! You're ready to start earning in Web3.",
        });
        onComplete();
      }, 2000);
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipOnboarding = () => {
    setShowWizard(false);
    onComplete();
  };

  const handleWalletAction = async () => {
    if (!isConnected) {
      // Trigger wallet connection
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          toast({
            title: "🎉 Wallet Connected!",
            description: "Welcome to Web3! Your digital identity is now active.",
          });
          completeStep('crypto-wallet');
        } catch (error) {
          toast({
            title: "Connection Failed",
            description: "Please try connecting your wallet again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Install MetaMask",
          description: "Please install MetaMask to continue with Web3.",
          variant: "destructive",
        });
      }
    } else {
      completeStep('crypto-wallet');
    }
  };

  if (!showWizard) return null;

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Step {currentStep + 1} of {onboardingSteps.length}
            </Badge>
            <div className="flex gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {currentStepData.estimatedTime}
              </Badge>
              <Button variant="ghost" size="sm" onClick={skipOnboarding}>
                Skip Tutorial
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mb-6" />
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <StepIcon className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl mb-2">{currentStepData.title}</CardTitle>
          <CardDescription className="text-lg">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Main Content */}
            <div className="prose max-w-none">
              <div className="text-base leading-relaxed whitespace-pre-line">
                {currentStepData.content}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                Key Points to Remember
              </h4>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reward Section */}
            {currentStepData.reward && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Completion Reward
                  </span>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300">
                  🎁 {currentStepData.reward}
                </p>
              </div>
            )}

            {/* Interactive Elements */}
            {currentStepData.id === 'crypto-wallet' && (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Try It Now:</h4>
                <Button 
                  onClick={handleWalletAction}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {isConnected ? 'Wallet Connected ✓' : 'Connect MetaMask Wallet'}
                </Button>
                {!isConnected && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Don't have MetaMask? <a href="https://metamask.io" target="_blank" className="text-blue-600 hover:underline">Download it here</a>
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep 
                        ? 'bg-blue-500 scale-125' 
                        : index < currentStep || completedSteps.has(onboardingSteps[index].id)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {completedSteps.has(currentStepData.id) ? (
                  <Button onClick={nextStep} disabled={currentStep === onboardingSteps.length - 1}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => completeStep(currentStepData.id)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {currentStepData.actionText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
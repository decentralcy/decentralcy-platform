import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle,
  X,
  Lightbulb,
  Shield,
  Wallet,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartHelpSystemProps {
  userAddress: string;
  isConnected: boolean;
  currentPage: string;
  userExperienceLevel: 'beginner' | 'intermediate' | 'expert';
}

interface ContextualHelp {
  id: string;
  trigger: string;
  title: string;
  content: string;
  category: 'web3' | 'platform' | 'security' | 'earning';
  importance: 'critical' | 'high' | 'medium' | 'low';
  showFor: ('beginner' | 'intermediate' | 'expert')[];
  actionText?: string;
  actionUrl?: string;
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'opportunity' | 'guidance';
  relevanceScore: number;
  conditions: string[];
}

export default function SmartHelpSystem({ 
  userAddress, 
  isConnected, 
  currentPage,
  userExperienceLevel 
}: SmartHelpSystemProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [contextualHelps, setContextualHelps] = useState<ContextualHelp[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [showSmartPanel, setShowSmartPanel] = useState(false);
  const { toast } = useToast();

  // Initialize contextual help based on current context
  useEffect(() => {
    const helps: ContextualHelp[] = [
      {
        id: 'wallet-explain',
        trigger: 'wallet',
        title: 'What is a Crypto Wallet?',
        content: 'A crypto wallet is your digital identity and bank account combined. It stores your cryptocurrency and lets you interact securely with blockchain applications like Decentralcy. Think of it as your passport to the Web3 world!',
        category: 'web3',
        importance: 'critical',
        showFor: ['beginner', 'intermediate'],
        actionText: 'Learn More',
        actionUrl: '/learn/wallets'
      },
      {
        id: 'gas-fees',
        trigger: 'gas',
        title: 'Understanding Gas Fees',
        content: 'Gas fees are small payments to process transactions on the blockchain. Like postage stamps for sending mail, they ensure your transaction gets processed. On Decentralcy, employers often cover these fees for you!',
        category: 'web3',
        importance: 'high',
        showFor: ['beginner'],
        actionText: 'Check Current Fees'
      },
      {
        id: 'smart-contracts',
        trigger: 'contract',
        title: 'Smart Contracts = Automatic Agreements',
        content: 'Smart contracts are like automated agreements that execute themselves. When you complete a job, the contract automatically releases payment - no waiting for manual approval! This eliminates payment disputes and delays.',
        category: 'platform',
        importance: 'high',
        showFor: ['beginner', 'intermediate']
      },
      {
        id: 'reputation-system',
        trigger: 'reputation',
        title: 'Building Your Reputation',
        content: 'Your reputation score is calculated from job completion rate, client ratings, on-time delivery, and verified skills. A higher score unlocks better jobs and higher pay rates. Start with smaller projects to build up!',
        category: 'platform',
        importance: 'medium',
        showFor: ['beginner', 'intermediate']
      },
      {
        id: 'escrow-protection',
        trigger: 'escrow',
        title: 'Payment Protection',
        content: 'Escrow means your payment is held safely in a smart contract until work is completed. This protects both you and your client - you\'re guaranteed payment for good work, and clients get what they paid for.',
        category: 'security',
        importance: 'critical',
        showFor: ['beginner']
      }
    ];

    // Filter helps based on user experience level
    const relevantHelps = helps.filter(help => 
      help.showFor.includes(userExperienceLevel)
    );

    setContextualHelps(relevantHelps);
  }, [userExperienceLevel]);

  // Generate smart suggestions based on user state
  useEffect(() => {
    const suggestions: SmartSuggestion[] = [];

    // Wallet connection suggestions
    if (!isConnected) {
      suggestions.push({
        id: 'connect-wallet',
        title: 'Connect Your Wallet to Get Started',
        description: 'You\'ll need a crypto wallet to apply for jobs and receive payments. MetaMask is the most popular choice.',
        type: 'guidance',
        relevanceScore: 100,
        conditions: ['not_connected']
      });
    }

    // Page-specific suggestions
    if (currentPage === 'jobs' && isConnected) {
      suggestions.push({
        id: 'first-application',
        title: 'Start with Smaller Jobs',
        description: 'For your first few applications, try jobs under 1 ETH to build reputation quickly.',
        type: 'tip',
        relevanceScore: 85,
        conditions: ['new_user', 'jobs_page']
      });
    }

    if (currentPage === 'profile') {
      suggestions.push({
        id: 'complete-profile',
        title: 'Add Work Samples to Your Profile',
        description: 'Profiles with work samples get 3x more job responses. Show off your best work!',
        type: 'opportunity',
        relevanceScore: 90,
        conditions: ['profile_incomplete']
      });
    }

    // Experience level specific suggestions
    if (userExperienceLevel === 'beginner') {
      suggestions.push({
        id: 'learn-crypto',
        title: 'New to Crypto? We\'ve Got You Covered',
        description: 'Check out our beginner-friendly guides to understand cryptocurrency, wallets, and blockchain basics.',
        type: 'guidance',
        relevanceScore: 75,
        conditions: ['beginner']
      });
    }

    setSmartSuggestions(suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore));
  }, [isConnected, currentPage, userExperienceLevel]);

  // Show smart panel automatically for beginners
  useEffect(() => {
    if (userExperienceLevel === 'beginner' && smartSuggestions.length > 0) {
      setTimeout(() => setShowSmartPanel(true), 3000);
    }
  }, [userExperienceLevel, smartSuggestions]);

  const getHelpIcon = (category: string) => {
    switch (category) {
      case 'web3': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'platform': return <HelpCircle className="w-4 h-4 text-green-500" />;
      case 'security': return <Shield className="w-4 h-4 text-red-500" />;
      case 'earning': return <Wallet className="w-4 h-4 text-yellow-500" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'opportunity': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'guidance': return <HelpCircle className="w-5 h-5 text-purple-500" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'tip': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'guidance': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const showTooltip = (helpId: string) => {
    setActiveTooltip(helpId);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (activeTooltip === helpId) {
        setActiveTooltip(null);
      }
    }, 10000);
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSmartSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    toast({
      title: "Got it!",
      description: "We'll remember your preference",
    });
  };

  // Contextual Help Tooltip Component
  const HelpTooltip = ({ help }: { help: ContextualHelp }) => (
    <div className="relative inline-block">
      <button
        onClick={() => showTooltip(help.id)}
        className="ml-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="Click for help"
      >
        {getHelpIcon(help.category)}
      </button>
      
      {activeTooltip === help.id && (
        <div className="absolute z-50 w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 rounded-lg shadow-xl top-6 left-0 transform -translate-x-1/2">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">{help.title}</h4>
            <button
              onClick={() => setActiveTooltip(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {help.content}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge className={help.importance === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
              {help.importance}
            </Badge>
            
            {help.actionText && (
              <Button size="sm" variant="outline">
                {help.actionText}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Contextual Help Tooltips (render globally) */}
      <div className="contextual-help-system">
        {contextualHelps.map(help => (
          <HelpTooltip key={help.id} help={help} />
        ))}
      </div>

      {/* Smart Suggestions Panel */}
      {showSmartPanel && smartSuggestions.length > 0 && (
        <div className="fixed bottom-6 left-6 w-80 z-40">
          <Card className="shadow-xl border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  Smart Suggestion
                </h4>
                <button
                  onClick={() => setShowSmartPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {smartSuggestions.slice(0, 2).map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">
                          {suggestion.title}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Learn More
                          </Button>
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {smartSuggestions.length > 2 && (
                <div className="text-center mt-3">
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    View {smartSuggestions.length - 2} more suggestions
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="rounded-full w-12 h-12 shadow-lg bg-blue-500 hover:bg-blue-600"
          onClick={() => setShowSmartPanel(!showSmartPanel)}
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </>
  );
}
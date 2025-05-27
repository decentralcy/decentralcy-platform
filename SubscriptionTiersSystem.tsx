import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Rocket,
  CheckCircle,
  Gem,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionTiersSystemProps {
  userAddress: string;
  isConnected: boolean;
  currentTier: 'free' | 'pro' | 'enterprise';
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  billing: 'monthly' | 'yearly';
  description: string;
  features: TierFeature[];
  limits: TierLimits;
  benefits: string[];
  popular: boolean;
  color: string;
  icon: any;
}

interface TierFeature {
  name: string;
  included: boolean;
  description: string;
  premium?: boolean;
}

interface TierLimits {
  monthlyJobs: number;
  platformFee: number;
  disputeResolution: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  multiSigWallets: number;
}

interface UserSubscription {
  tierId: string;
  startDate: Date;
  nextBilling: Date;
  autoRenew: boolean;
  usage: SubscriptionUsage;
}

interface SubscriptionUsage {
  jobsThisMonth: number;
  earningsThisMonth: string;
  feesaved: string;
  supportTickets: number;
}

export default function SubscriptionTiersSystem({ 
  userAddress, 
  isConnected, 
  currentTier 
}: SubscriptionTiersSystemProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();

  // Subscription tier definitions
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'Pioneer',
      price: 'Free',
      billing: 'monthly',
      description: 'Perfect for getting started with decentralized work',
      color: 'bg-gray-100 text-gray-800',
      icon: Users,
      popular: false,
      features: [
        { name: 'Basic job posting', included: true, description: 'Post up to 3 jobs per month' },
        { name: 'Standard escrow', included: true, description: 'Basic smart contract escrow' },
        { name: 'Community support', included: true, description: 'Access to community forums' },
        { name: 'Basic reputation system', included: true, description: 'Standard reputation tracking' },
        { name: 'Advanced analytics', included: false, description: 'Detailed performance metrics', premium: true },
        { name: 'Priority support', included: false, description: '24/7 priority assistance', premium: true },
        { name: 'Custom branding', included: false, description: 'White-label solutions', premium: true },
        { name: 'API access', included: false, description: 'RESTful API integration', premium: true }
      ],
      limits: {
        monthlyJobs: 3,
        platformFee: 2.5,
        disputeResolution: true,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false,
        apiAccess: false,
        multiSigWallets: 0
      },
      benefits: [
        'Access to global talent network',
        'Basic smart contract templates',
        'Community-driven dispute resolution',
        'Standard IPFS storage'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: billingCycle === 'monthly' ? '$29/month' : '$290/year',
      billing: billingCycle,
      description: 'For serious freelancers and small teams',
      color: 'bg-blue-100 text-blue-800',
      icon: Star,
      popular: true,
      features: [
        { name: 'Unlimited job posting', included: true, description: 'No limits on job postings' },
        { name: 'Advanced escrow features', included: true, description: 'Multi-sig and time-locked escrow' },
        { name: 'Priority support', included: true, description: '24/7 priority assistance' },
        { name: 'Advanced analytics', included: true, description: 'Detailed performance metrics' },
        { name: 'Reduced platform fees', included: true, description: '1.5% vs 2.5% standard fee' },
        { name: 'Premium job visibility', included: true, description: 'Featured job listings' },
        { name: 'Custom branding', included: false, description: 'White-label solutions', premium: true },
        { name: 'API access', included: true, description: 'RESTful API integration' }
      ],
      limits: {
        monthlyJobs: -1, // Unlimited
        platformFee: 1.5,
        disputeResolution: true,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: false,
        apiAccess: true,
        multiSigWallets: 3
      },
      benefits: [
        '40% lower platform fees',
        'Premium job placement',
        'Advanced contract templates',
        'Priority dispute resolution',
        'Enhanced reputation boosters',
        'Cross-chain payment optimization'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '$99/month' : '$990/year',
      billing: billingCycle,
      description: 'For large organizations and agencies',
      color: 'bg-purple-100 text-purple-800',
      icon: Crown,
      popular: false,
      features: [
        { name: 'Unlimited everything', included: true, description: 'No platform restrictions' },
        { name: 'White-label platform', included: true, description: 'Full custom branding' },
        { name: 'Dedicated support', included: true, description: 'Personal account manager' },
        { name: 'Custom integrations', included: true, description: 'Bespoke API solutions' },
        { name: 'Lowest platform fees', included: true, description: 'Just 1% platform fee' },
        { name: 'Advanced security', included: true, description: 'Enterprise-grade security' },
        { name: 'Team management', included: true, description: 'Multi-user dashboard' },
        { name: 'SLA guarantees', included: true, description: '99.9% uptime guarantee' }
      ],
      limits: {
        monthlyJobs: -1,
        platformFee: 1.0,
        disputeResolution: true,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: true,
        apiAccess: true,
        multiSigWallets: 10
      },
      benefits: [
        '60% lower platform fees',
        'White-label platform access',
        'Dedicated account manager',
        'Custom smart contract development',
        'Priority arbitrator assignment',
        'Advanced treasury management',
        'Institutional-grade security',
        'Compliance and reporting tools'
      ]
    }
  ];

  // Mock user subscription data
  const userSubscription: UserSubscription = {
    tierId: currentTier,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    autoRenew: true,
    usage: {
      jobsThisMonth: currentTier === 'free' ? 2 : currentTier === 'pro' ? 15 : 47,
      earningsThisMonth: currentTier === 'free' ? '0.8 ETH' : currentTier === 'pro' ? '12.4 ETH' : '89.7 ETH',
      feesaved: currentTier === 'free' ? '0 ETH' : currentTier === 'pro' ? '0.31 ETH' : '1.79 ETH',
      supportTickets: currentTier === 'free' ? 0 : currentTier === 'pro' ? 2 : 1
    }
  };

  const upgradeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      // Simulate subscription upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        tierId,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    },
    onSuccess: (data) => {
      const tier = subscriptionTiers.find(t => t.id === data.tierId);
      toast({
        title: "Subscription Upgraded! 🚀",
        description: `Welcome to ${tier?.name}! Your premium features are now active.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getCurrentTierData = () => {
    return subscriptionTiers.find(tier => tier.id === currentTier) || subscriptionTiers[0];
  };

  const calculateSavings = (tier: SubscriptionTier) => {
    if (tier.billing === 'yearly') {
      const monthlyPrice = parseFloat(tier.price.replace(/[^0-9.]/g, ''));
      const yearlyPrice = monthlyPrice * 12;
      const actualYearlyPrice = parseFloat(tier.price.replace(/[^0-9.]/g, ''));
      return Math.round(((yearlyPrice - actualYearlyPrice) / yearlyPrice) * 100);
    }
    return 0;
  };

  const getUsagePercentage = () => {
    const currentTierData = getCurrentTierData();
    if (currentTierData.limits.monthlyJobs === -1) return 0; // Unlimited
    return (userSubscription.usage.jobsThisMonth / currentTierData.limits.monthlyJobs) * 100;
  };

  return (
    <div className="w-full space-y-6">
      {/* Current Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const TierIcon = getCurrentTierData().icon;
                  return <TierIcon className="w-6 h-6" />;
                })()}
                Current Plan: {getCurrentTierData().name}
              </CardTitle>
              <CardDescription>
                {getCurrentTierData().description}
              </CardDescription>
            </div>
            <Badge className={getCurrentTierData().color}>
              {getCurrentTierData().name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{userSubscription.usage.jobsThisMonth}</div>
              <div className="text-sm text-muted-foreground">Jobs this month</div>
              {getCurrentTierData().limits.monthlyJobs !== -1 && (
                <Progress value={getUsagePercentage()} className="h-1 mt-1" />
              )}
            </div>
            <div>
              <div className="text-2xl font-bold">{userSubscription.usage.earningsThisMonth}</div>
              <div className="text-sm text-muted-foreground">Total earnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{userSubscription.usage.feesaved}</div>
              <div className="text-sm text-muted-foreground">Fees saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{getCurrentTierData().limits.platformFee}%</div>
              <div className="text-sm text-muted-foreground">Platform fee</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="features">Feature Comparison</TabsTrigger>
          <TabsTrigger value="usage">Usage & Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>Monthly</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative"
            >
              <div className={`w-12 h-6 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </Button>
            <span className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}>
              Yearly <Badge className="bg-green-100 text-green-800 ml-1">Save 20%</Badge>
            </span>
          </div>

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionTiers.map((tier) => {
              const isCurrentTier = tier.id === currentTier;
              const displayPrice = billingCycle === 'yearly' && tier.id !== 'free' 
                ? tier.price.replace('month', 'year').replace(/\$\d+/, (match) => {
                    const monthly = parseInt(match.replace('$', ''));
                    return `$${monthly * 10}`; // 20% discount
                  })
                : tier.price;

              return (
                <Card 
                  key={tier.id}
                  className={`relative transition-all hover:shadow-lg ${
                    tier.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                  } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  {isCurrentTier && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white">Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <tier.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold">{displayPrice}</div>
                    {billingCycle === 'yearly' && tier.id !== 'free' && calculateSavings(tier) > 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        Save {calculateSavings(tier)}%
                      </Badge>
                    )}
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {tier.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {feature.included ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-full" />
                          )}
                          <span className={`text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <div className="text-sm font-medium mb-2">Key Benefits:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {tier.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <Gem className="w-3 h-3 text-purple-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isCurrentTier && (
                      <Button
                        onClick={() => {
                          setSelectedTier(tier);
                          upgradeMutation.mutate(tier.id);
                        }}
                        disabled={upgradeMutation.isPending}
                        className="w-full"
                        variant={tier.popular ? "default" : "outline"}
                      >
                        {upgradeMutation.isPending && selectedTier?.id === tier.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Upgrading...
                          </>
                        ) : tier.id === 'free' ? (
                          'Downgrade to Free'
                        ) : (
                          `Upgrade to ${tier.name}`
                        )}
                      </Button>
                    )}

                    {isCurrentTier && (
                      <Button disabled className="w-full" variant="outline">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>
                Compare features across all subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Feature</th>
                      {subscriptionTiers.map(tier => (
                        <th key={tier.id} className="text-center p-3">{tier.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionTiers[0].features.map((feature, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{feature.name}</td>
                        {subscriptionTiers.map(tier => {
                          const tierFeature = tier.features[index];
                          return (
                            <td key={tier.id} className="text-center p-3">
                              {tierFeature.included ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <div className="w-5 h-5 border border-gray-300 rounded-full mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>This Month's Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Jobs Posted:</span>
                    <span className="font-medium">
                      {userSubscription.usage.jobsThisMonth}
                      {getCurrentTierData().limits.monthlyJobs !== -1 && 
                        ` / ${getCurrentTierData().limits.monthlyJobs}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee Rate:</span>
                    <span className="font-medium">{getCurrentTierData().limits.platformFee}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fees Saved:</span>
                    <span className="font-medium text-green-600">{userSubscription.usage.feesaved}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Next Billing:</span>
                    <span className="font-medium">{userSubscription.nextBilling.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Renew:</span>
                    <Badge className={userSubscription.autoRenew ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {userSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Member Since:</span>
                    <span className="font-medium">{userSubscription.startDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Revenue Impact */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
              Maximize Your Earnings with Premium Features
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Pro and Enterprise members earn significantly more through reduced platform fees, 
              premium job visibility, and access to higher-value contracts. The subscription 
              pays for itself through increased earnings and saved fees.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-green-600 text-white">Up to 60% Lower Fees</Badge>
              <Badge className="bg-blue-600 text-white">Premium Job Placement</Badge>
              <Badge className="bg-purple-600 text-white">Enhanced Reputation</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
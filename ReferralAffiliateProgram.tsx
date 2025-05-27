import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Share2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Gift,
  Copy,
  Star,
  Award,
  Target,
  Calendar,
  ExternalLink,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralAffiliateProgramProps {
  userAddress: string;
  isConnected: boolean;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: string;
  monthlyEarnings: string;
  conversionRate: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  commissionRate: number;
}

interface Referral {
  id: string;
  referredUser: string;
  referredUserName?: string;
  joinedAt: Date;
  status: 'pending' | 'active' | 'converted';
  totalSpent: string;
  commissionsEarned: string;
  lastActivity: Date;
}

interface CommissionTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  minReferrals: number;
  commissionRate: number;
  bonusRate: number;
  benefits: string[];
  color: string;
}

interface AffiliateResource {
  type: 'banner' | 'link' | 'social' | 'email';
  title: string;
  description: string;
  content: string;
  size?: string;
  format?: string;
}

export default function ReferralAffiliateProgram({ userAddress, isConnected }: ReferralAffiliateProgramProps) {
  const [referralCode, setReferralCode] = useState(`DCNT-${userAddress.slice(-6).toUpperCase()}`);
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();

  // Commission tiers
  const commissionTiers: CommissionTier[] = [
    {
      tier: "bronze",
      name: "Bronze Advocate",
      minReferrals: 0,
      commissionRate: 5,
      bonusRate: 0,
      color: "bg-orange-100 text-orange-800",
      benefits: [
        "5% commission on referral earnings",
        "Basic referral tracking",
        "Monthly payouts"
      ]
    },
    {
      tier: "silver",
      name: "Silver Partner",
      minReferrals: 10,
      commissionRate: 7.5,
      bonusRate: 10,
      color: "bg-gray-100 text-gray-800",
      benefits: [
        "7.5% commission on referral earnings",
        "10% bonus on first 5 referrals",
        "Advanced analytics dashboard",
        "Priority support"
      ]
    },
    {
      tier: "gold",
      name: "Gold Ambassador",
      minReferrals: 25,
      commissionRate: 10,
      bonusRate: 15,
      color: "bg-yellow-100 text-yellow-800",
      benefits: [
        "10% commission on referral earnings",
        "15% bonus on first 10 referrals",
        "Custom referral landing pages",
        "Marketing materials access",
        "Dedicated account manager"
      ]
    },
    {
      tier: "platinum",
      name: "Platinum Elite",
      minReferrals: 50,
      commissionRate: 15,
      bonusRate: 25,
      color: "bg-purple-100 text-purple-800",
      benefits: [
        "15% commission on referral earnings",
        "25% bonus on first 20 referrals",
        "Revenue sharing program",
        "Co-marketing opportunities",
        "Early access to new features",
        "Speaking opportunities at events"
      ]
    }
  ];

  // Mock referral stats
  const referralStats: ReferralStats = {
    totalReferrals: 18,
    activeReferrals: 14,
    totalEarnings: "3.47 ETH",
    monthlyEarnings: "0.89 ETH",
    conversionRate: 78,
    tier: "silver",
    commissionRate: 7.5
  };

  // Mock referrals
  const referrals: Referral[] = [
    {
      id: "ref_1",
      referredUser: "0x1234...",
      referredUserName: "Alex Chen",
      joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: "active",
      totalSpent: "2.5 ETH",
      commissionsEarned: "0.18 ETH",
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "ref_2",
      referredUser: "0x5678...",
      referredUserName: "Sarah Kim",
      joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      status: "converted",
      totalSpent: "4.2 ETH",
      commissionsEarned: "0.31 ETH",
      lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: "ref_3",
      referredUser: "0x9abc...",
      joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "pending",
      totalSpent: "0 ETH",
      commissionsEarned: "0 ETH",
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  // Affiliate resources
  const affiliateResources: AffiliateResource[] = [
    {
      type: "banner",
      title: "Leaderboard Banner",
      description: "High-converting banner for websites and blogs",
      content: "https://decentralcy.com/banners/leaderboard.png",
      size: "728x90",
      format: "PNG"
    },
    {
      type: "social",
      title: "Twitter Post Template",
      description: "Ready-to-use social media content",
      content: "🚀 Just discovered @Decentralcy - the future of decentralized work! No middlemen, smart contracts, and fair payments. Join me and earn crypto for your skills! {referral_link} #DecentralizedWork #Web3Jobs #Crypto",
    },
    {
      type: "email",
      title: "Email Template",
      description: "Professional email template for outreach",
      content: "Subject: You should check out this new Web3 job platform\n\nHi [Name],\n\nI've been using Decentralcy, a revolutionary platform that connects workers directly with employers using blockchain technology. No more middlemen taking huge cuts!\n\nFeatures I love:\n- Smart contract escrow\n- Cross-chain payments\n- NFT achievements\n- DAO governance\n\nWant to join? Use my referral link: {referral_link}\n\nBest,\n[Your Name]"
    },
    {
      type: "link",
      title: "Text Link",
      description: "Simple text link for forums and comments",
      content: "Check out Decentralcy - the decentralized work platform: {referral_link}"
    }
  ];

  const generateReferralLinkMutation = useMutation({
    mutationFn: async (customCode?: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const code = customCode || referralCode;
      return `https://decentralcy.com/join?ref=${code}`;
    },
    onSuccess: (link) => {
      navigator.clipboard.writeText(link);
      toast({
        title: "Referral Link Generated! 🎉",
        description: "Link copied to clipboard. Start sharing to earn commissions!",
      });
    }
  });

  const withdrawEarningsMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { transactionHash: "0x" + Math.random().toString(16).substr(2, 64) };
    },
    onSuccess: () => {
      toast({
        title: "Earnings Withdrawn! 💰",
        description: "Your commission earnings have been sent to your wallet",
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace("{referral_link}", `https://decentralcy.com/join?ref=${referralCode}`));
    toast({
      title: "Copied!",
      description: "Content copied to clipboard with your referral link",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentTier = () => {
    return commissionTiers.find(tier => tier.tier === referralStats.tier) || commissionTiers[0];
  };

  const getNextTier = () => {
    const currentIndex = commissionTiers.findIndex(tier => tier.tier === referralStats.tier);
    return currentIndex < commissionTiers.length - 1 ? commissionTiers[currentIndex + 1] : null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    return (referralStats.totalReferrals / nextTier.minReferrals) * 100;
  };

  return (
    <div className="w-full space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-green-500" />
            Referral & Affiliate Program
          </CardTitle>
          <CardDescription>
            Earn commissions by bringing new users to Decentralcy's decentralized ecosystem
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{referralStats.totalEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{referralStats.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-2xl font-bold">{referralStats.commissionRate}%</p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Affiliate Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={getCurrentTier().color}>
                {getCurrentTier().name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {referralStats.commissionRate}% commission rate
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">This month</div>
              <div className="font-bold">{referralStats.monthlyEarnings}</div>
            </div>
          </div>

          {getNextTier() && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {getNextTier()?.name}</span>
                <span>{referralStats.totalReferrals} / {getNextTier()?.minReferrals} referrals</span>
              </div>
              <Progress value={getProgressToNextTier()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {(getNextTier()?.minReferrals || 0) - referralStats.totalReferrals} more referrals to unlock {getNextTier()?.commissionRate}% commission rate
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="share">Share & Earn</TabsTrigger>
          <TabsTrigger value="tiers">Commission Tiers</TabsTrigger>
          <TabsTrigger value="resources">Marketing Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {referral.referredUserName?.charAt(0) || referral.referredUser.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.referredUserName || `${referral.referredUser.slice(0, 6)}...${referral.referredUser.slice(-4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Joined {referral.joinedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {referral.commissionsEarned} earned
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Earnings Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Available to Withdraw:</span>
                    <span className="font-bold text-green-600">{referralStats.monthlyEarnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Commissions:</span>
                    <span className="font-medium">0.23 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Lifetime:</span>
                    <span className="font-bold">{referralStats.totalEarnings}</span>
                  </div>
                  <Button 
                    onClick={() => withdrawEarningsMutation.mutate()}
                    disabled={withdrawEarningsMutation.isPending}
                    className="w-full mt-4"
                  >
                    {withdrawEarningsMutation.isPending ? "Processing..." : "Withdraw Earnings"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Click-through Rate:</span>
                    <span className="font-medium">12.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate:</span>
                    <span className="font-medium">{referralStats.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Referral Value:</span>
                    <span className="font-medium">1.8 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Performing Channel:</span>
                    <span className="font-medium">Social Media</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          {/* Referral Link Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Referral Link</CardTitle>
              <CardDescription>
                Share this link to earn commissions on new user activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Referral Code</label>
                <div className="flex gap-2">
                  <Input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter custom code"
                  />
                  <Button 
                    onClick={() => generateReferralLinkMutation.mutate(referralCode)}
                    disabled={generateReferralLinkMutation.isPending}
                  >
                    {generateReferralLinkMutation.isPending ? "Generating..." : "Generate Link"}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">
                    https://decentralcy.com/join?ref={referralCode}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`https://decentralcy.com/join?ref=${referralCode}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on LinkedIn
                </Button>
                <Button variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Share Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Share Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {affiliateResources.filter(r => r.type === 'social' || r.type === 'email').map((resource, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{resource.title}</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(resource.content)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono">
                      {resource.content.slice(0, 150)}...
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          {/* Commission Tiers */}
          <div className="grid md:grid-cols-2 gap-6">
            {commissionTiers.map((tier) => (
              <Card key={tier.tier} className={`${tier.tier === referralStats.tier ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{tier.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {tier.minReferrals === 0 ? 'Starting tier' : `${tier.minReferrals}+ referrals`}
                      </p>
                    </div>
                    <Badge className={tier.color}>
                      {tier.commissionRate}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tier.commissionRate}%</div>
                      <div className="text-sm text-muted-foreground">Base Commission</div>
                      {tier.bonusRate > 0 && (
                        <div className="text-sm text-green-600">+{tier.bonusRate}% bonus</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Benefits:</h4>
                      <ul className="text-sm space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {tier.tier === referralStats.tier && (
                      <Badge className="w-full justify-center bg-blue-100 text-blue-800">
                        Current Tier
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Marketing Resources */}
          <div className="grid md:grid-cols-2 gap-6">
            {affiliateResources.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resource.size && (
                      <div className="text-sm">
                        <span className="font-medium">Size:</span> {resource.size}
                        {resource.format && ` • Format: ${resource.format}`}
                      </div>
                    )}
                    
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                      {resource.content.slice(0, 100)}
                      {resource.content.length > 100 && "..."}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(resource.content)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      {resource.type === 'banner' && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Affiliate Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Affiliate Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Quality over Quantity:</span> Focus on referring users who will actively use the platform
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Target Audience:</span> Developers, freelancers, agencies, and businesses interested in Web3
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Honest Promotion:</span> Always disclose affiliate relationships and focus on genuine value
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Program Benefits */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
              Grow the Decentralized Future Together
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Help build the largest decentralized work ecosystem while earning substantial commissions. 
              Our affiliate program rewards those who believe in eliminating middlemen and empowering 
              direct worker-employer relationships through blockchain technology.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-green-600 text-white">Up to 15% Commission</Badge>
              <Badge className="bg-blue-600 text-white">Lifetime Earnings</Badge>
              <Badge className="bg-purple-600 text-white">Marketing Support</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
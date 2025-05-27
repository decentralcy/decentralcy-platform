import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, TrendingUp, Star, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumFeaturesProps {
  userAddress: string;
  tokenBalance?: number;
}

const PREMIUM_THRESHOLD = 100; // 100 DTA tokens for premium access

export default function PremiumFeatures({ userAddress, tokenBalance = 0 }: PremiumFeaturesProps) {
  const [selectedTier, setSelectedTier] = useState<"basic" | "premium" | "enterprise">("basic");
  const { toast } = useToast();

  const hasPremiumAccess = tokenBalance >= PREMIUM_THRESHOLD;

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      tokenRequirement: 0,
      features: [
        "Post unlimited jobs",
        "Apply to jobs",
        "Basic escrow protection",
        "Standard support"
      ],
      limitations: [
        "5% platform fee",
        "No job boosting",
        "No priority support"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "100 DTA Tokens",
      tokenRequirement: 100,
      features: [
        "All Basic features",
        "Reduced 2% platform fee",
        "Job boost capability",
        "Priority dispute resolution",
        "Advanced analytics",
        "Premium badge display"
      ],
      limitations: []
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "500 DTA Tokens",
      tokenRequirement: 500,
      features: [
        "All Premium features",
        "1% platform fee",
        "Bulk job posting",
        "Custom payment terms",
        "Dedicated account manager",
        "White-label options",
        "API access"
      ],
      limitations: []
    }
  ];

  const currentTier = tokenBalance >= 500 ? "enterprise" : 
                    tokenBalance >= 100 ? "premium" : "basic";

  const premiumFeatures = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      title: "Job Boost",
      description: "Get 3x more visibility for your job posts",
      available: hasPremiumAccess
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Priority Support",
      description: "Fast-track dispute resolution and support",
      available: hasPremiumAccess
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      title: "Premium Badge",
      description: "Stand out with verified premium status",
      available: hasPremiumAccess
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Advanced Analytics",
      description: "Detailed insights on job performance",
      available: hasPremiumAccess
    }
  ];

  const handleUpgrade = (tier: string) => {
    if (tier === "premium" && tokenBalance < 100) {
      toast({
        title: "Insufficient Tokens",
        description: "You need 100 DTA tokens to access Premium features. Consider purchasing tokens or earning them through platform usage.",
        variant: "destructive"
      });
      return;
    }
    
    if (tier === "enterprise" && tokenBalance < 500) {
      toast({
        title: "Insufficient Tokens",
        description: "You need 500 DTA tokens to access Enterprise features.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Tier Activated",
      description: `You now have access to ${tier} features!`
    });
  };

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-5 w-5 text-purple-600" />
            Your Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-900 capitalize">{currentTier}</div>
              <div className="text-sm text-purple-700">
                {tokenBalance} DTA Tokens • {currentTier === "basic" ? "5%" : currentTier === "premium" ? "2%" : "1%"} Platform Fee
              </div>
            </div>
            <Badge className={`${
              currentTier === "enterprise" ? "bg-yellow-500" :
              currentTier === "premium" ? "bg-purple-500" : "bg-gray-500"
            } text-white`}>
              {currentTier.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className={`${
            feature.available ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  feature.available ? "bg-white" : "bg-gray-200"
                }`}>
                  {feature.available ? feature.icon : 
                    <div className="h-6 w-6 bg-gray-400 rounded"></div>
                  }
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    feature.available ? "text-gray-900" : "text-gray-500"
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${
                    feature.available ? "text-gray-600" : "text-gray-400"
                  }`}>
                    {feature.description}
                  </p>
                  {!feature.available && (
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                      Premium Required
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.id} className={`relative ${
            currentTier === tier.id ? "border-purple-500 bg-purple-50" :
            tier.id === "premium" ? "border-purple-200" :
            tier.id === "enterprise" ? "border-yellow-200" : "border-gray-200"
          }`}>
            {tier.id === "premium" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tier.name}</span>
                {currentTier === tier.id && (
                  <Badge className="bg-green-500 text-white">Current</Badge>
                )}
              </CardTitle>
              <div className="text-2xl font-bold">{tier.price}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Included:</h4>
                <ul className="space-y-1 text-sm">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {tier.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Limitations:</h4>
                  <ul className="space-y-1 text-sm text-gray-500">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => handleUpgrade(tier.id)}
                disabled={currentTier === tier.id || tokenBalance < tier.tokenRequirement}
                className={`w-full ${
                  currentTier === tier.id ? "bg-gray-400" :
                  tier.id === "premium" ? "bg-purple-600 hover:bg-purple-700" :
                  tier.id === "enterprise" ? "bg-yellow-600 hover:bg-yellow-700" :
                  "bg-gray-600 hover:bg-gray-700"
                } text-white`}
              >
                {currentTier === tier.id ? "Current Plan" :
                 tokenBalance < tier.tokenRequirement ? `Need ${tier.tokenRequirement - tokenBalance} More Tokens` :
                 "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Token Acquisition Info */}
      {!hasPremiumAccess && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Zap className="mr-2 h-5 w-5" />
              How to Get DTA Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Earn Tokens:</h4>
                <ul className="text-sm space-y-1 mt-1">
                  <li>• Complete jobs successfully</li>
                  <li>• Refer new users to the platform</li>
                  <li>• Participate in DAO governance</li>
                  <li>• Stake tokens for rewards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Purchase Options:</h4>
                <ul className="text-sm space-y-1 mt-1">
                  <li>• DEX trading (Uniswap, etc.)</li>
                  <li>• Direct platform purchase</li>
                  <li>• OTC arrangements</li>
                  <li>• Community marketplace</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
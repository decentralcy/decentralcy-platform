import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Star, 
  Shield, 
  Zap, 
  Crown, 
  Target,
  Award,
  Gem,
  Fire,
  Rocket,
  Medal,
  Gift,
  ExternalLink,
  Share2,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NFTAchievementsProps {
  userAddress: string;
  isConnected: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'milestone' | 'skill' | 'reputation' | 'community' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: any;
  color: string;
  nftImageUrl: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  tokenId?: string;
  opensSeaUrl?: string;
  requirements: string[];
  rewards: {
    platformTokens?: number;
    platformBoosts?: string[];
    exclusiveAccess?: string[];
  };
}

interface NFTCollection {
  name: string;
  description: string;
  totalAchievements: number;
  unlockedCount: number;
  floorPrice?: string;
  contractAddress: string;
}

export default function NFTAchievements({ userAddress, isConnected }: NFTAchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  // Mock achievements data - in production this would come from blockchain/IPFS
  const mockAchievements: Achievement[] = [
    {
      id: "first_job",
      name: "First Steps",
      description: "Complete your first job on Decentralcy",
      category: "milestone",
      rarity: "common",
      icon: Rocket,
      color: "bg-blue-500",
      nftImageUrl: "ipfs://QmFirstSteps123...",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tokenId: "1",
      opensSeaUrl: "https://opensea.io/assets/...",
      requirements: ["Complete 1 job"],
      rewards: {
        platformTokens: 100,
        platformBoosts: ["5% fee reduction for next job"]
      }
    },
    {
      id: "blockchain_master",
      name: "Blockchain Master",
      description: "Complete 10 blockchain development jobs with 5-star ratings",
      category: "skill",
      rarity: "epic",
      icon: Shield,
      color: "bg-purple-500",
      nftImageUrl: "ipfs://QmBlockchainMaster456...",
      progress: 7,
      maxProgress: 10,
      unlocked: false,
      requirements: ["Complete 10 blockchain jobs", "Maintain 5-star average rating"],
      rewards: {
        platformTokens: 1000,
        platformBoosts: ["Expert badge", "Priority support"],
        exclusiveAccess: ["Blockchain jobs pool", "Expert community"]
      }
    },
    {
      id: "reputation_titan",
      name: "Reputation Titan",
      description: "Achieve a reputation score above 95",
      category: "reputation",
      rarity: "legendary",
      icon: Crown,
      color: "bg-yellow-500",
      nftImageUrl: "ipfs://QmReputationTitan789...",
      progress: 87,
      maxProgress: 95,
      unlocked: false,
      requirements: ["Reputation score > 95", "Complete 50+ jobs", "Zero disputes"],
      rewards: {
        platformTokens: 5000,
        platformBoosts: ["20% higher visibility", "VIP status"],
        exclusiveAccess: ["Premium job categories", "Direct employer access"]
      }
    },
    {
      id: "dispute_resolver",
      name: "Fair Arbitrator",
      description: "Successfully resolve 25 disputes as an arbitrator",
      category: "community",
      rarity: "rare",
      icon: Target,
      color: "bg-green-500",
      nftImageUrl: "ipfs://QmDisputeResolver012...",
      progress: 12,
      maxProgress: 25,
      unlocked: false,
      requirements: ["Arbitrate 25 disputes", "90%+ accuracy rate"],
      rewards: {
        platformTokens: 750,
        platformBoosts: ["Arbitrator badge", "Dispute fee share"],
        exclusiveAccess: ["Elite arbitrator pool"]
      }
    },
    {
      id: "early_adopter",
      name: "Pioneer",
      description: "One of the first 1000 users on Decentralcy",
      category: "special",
      rarity: "legendary",
      icon: Star,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      nftImageUrl: "ipfs://QmPioneer345...",
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      tokenId: "42",
      opensSeaUrl: "https://opensea.io/assets/...",
      requirements: ["Be among first 1000 users"],
      rewards: {
        platformTokens: 2500,
        platformBoosts: ["Permanent 10% fee reduction", "Pioneer badge"],
        exclusiveAccess: ["Founder's community", "Early feature access"]
      }
    }
  ];

  const nftCollection: NFTCollection = {
    name: "Decentralcy Achievements",
    description: "Verifiable proof of work accomplishments on the decentralized web",
    totalAchievements: 50,
    unlockedCount: 2,
    floorPrice: "0.15 ETH",
    contractAddress: "0x1234567890123456789012345678901234567890"
  };

  useEffect(() => {
    setAchievements(mockAchievements);
  }, []);

  const mintAchievementNFT = useMutation({
    mutationFn: async (achievementId: string) => {
      // Simulate NFT minting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) throw new Error("Achievement not found");
      
      // Update achievement with token ID
      const tokenId = Math.floor(Math.random() * 10000).toString();
      achievement.tokenId = tokenId;
      achievement.opensSeaUrl = `https://opensea.io/assets/ethereum/${nftCollection.contractAddress}/${tokenId}`;
      
      setAchievements([...achievements]);
      
      return { tokenId, transactionHash: "0x" + Math.random().toString(16).substr(2, 64) };
    },
    onSuccess: (data, achievementId) => {
      const achievement = achievements.find(a => a.id === achievementId);
      toast({
        title: "Achievement NFT Minted! 🎉",
        description: `Your "${achievement?.name}" NFT has been minted with token ID #${data.tokenId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'uncommon':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="w-3 h-3" />;
      case 'epic':
        return <Gem className="w-3 h-3" />;
      case 'rare':
        return <Star className="w-3 h-3" />;
      case 'uncommon':
        return <Award className="w-3 h-3" />;
      default:
        return <Medal className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone':
        return <Rocket className="w-4 h-4" />;
      case 'skill':
        return <Shield className="w-4 h-4" />;
      case 'reputation':
        return <Crown className="w-4 h-4" />;
      case 'community':
        return <Target className="w-4 h-4" />;
      case 'special':
        return <Star className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const progressAchievements = achievements.filter(a => !a.unlocked && a.progress > 0);

  return (
    <div className="w-full space-y-6">
      {/* Collection Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            NFT Achievement Collection
          </CardTitle>
          <CardDescription>
            Earn verifiable, tradeable NFTs for your accomplishments on Decentralcy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{nftCollection.totalAchievements}</div>
              <div className="text-sm text-muted-foreground">Total Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{nftCollection.floorPrice}</div>
              <div className="text-sm text-muted-foreground">Floor Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round((unlockedAchievements.length / nftCollection.totalAchievements) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="milestone">Milestones</TabsTrigger>
          <TabsTrigger value="skill">Skills</TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Achievement Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`transition-all hover:shadow-lg ${
                  achievement.unlocked ? 'ring-2 ring-yellow-300' : ''
                } ${achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${achievement.color} text-white`}>
                        <achievement.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{achievement.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getRarityColor(achievement.rarity)} flex items-center gap-1`}>
                            {getRarityIcon(achievement.rarity)}
                            {achievement.rarity}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(achievement.category)}
                            {achievement.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Requirements:</h4>
                    <ul className="text-xs space-y-1">
                      {achievement.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rewards */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Rewards:</h4>
                    <div className="space-y-1">
                      {achievement.rewards.platformTokens && (
                        <div className="text-xs flex items-center gap-2">
                          <Gem className="w-3 h-3 text-purple-500" />
                          {achievement.rewards.platformTokens} Platform Tokens
                        </div>
                      )}
                      {achievement.rewards.platformBoosts?.map((boost, index) => (
                        <div key={index} className="text-xs flex items-center gap-2">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          {boost}
                        </div>
                      ))}
                      {achievement.rewards.exclusiveAccess?.map((access, index) => (
                        <div key={index} className="text-xs flex items-center gap-2">
                          <Crown className="w-3 h-3 text-blue-500" />
                          {access}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    {achievement.unlocked && !achievement.tokenId && (
                      <Button 
                        onClick={() => mintAchievementNFT.mutate(achievement.id)}
                        disabled={mintAchievementNFT.isPending}
                        className="w-full"
                        size="sm"
                      >
                        {mintAchievementNFT.isPending ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Minting NFT...
                          </>
                        ) : (
                          <>
                            <Gift className="w-3 h-3 mr-2" />
                            Mint NFT
                          </>
                        )}
                      </Button>
                    )}

                    {achievement.tokenId && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(achievement.opensSeaUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          OpenSea
                        </Button>
                      </div>
                    )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs text-muted-foreground text-center">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Progress */}
      {progressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fire className="w-5 h-5 text-orange-500" />
              Almost There!
            </CardTitle>
            <CardDescription>
              Achievements you're making progress towards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className={`p-2 rounded ${achievement.color} text-white`}>
                    <achievement.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  </div>
                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revolutionary Impact */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">
              Own Your Work History Forever
            </h3>
            <p className="text-purple-700 dark:text-purple-300 max-w-2xl mx-auto">
              Unlike traditional platforms that can delete your achievements, Decentralcy NFTs are 
              permanently stored on the blockchain. Trade them, showcase them, or pass them down - 
              your work legacy is truly yours.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-purple-600 text-white">Permanent Ownership</Badge>
              <Badge className="bg-blue-600 text-white">Tradeable Assets</Badge>
              <Badge className="bg-green-600 text-white">Verifiable Proof</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
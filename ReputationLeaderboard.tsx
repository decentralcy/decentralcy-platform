import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Shield, TrendingUp, Crown, Award, Medal } from "lucide-react";
import type { WorkerProfile } from "@shared/schema";

interface LeaderboardWorker extends WorkerProfile {
  reputationScore: number;
  averageRating: number;
  totalRatings: number;
}

export default function ReputationLeaderboard() {
  // For now, we'll simulate leaderboard data since we need to implement a proper aggregation endpoint
  const mockLeaderboardData: LeaderboardWorker[] = [
    {
      id: 1,
      walletAddress: "0x1234567890123456789012345678901234567890",
      displayName: "Alex Chen",
      bio: "Full-stack developer specializing in DeFi protocols",
      skills: ["React", "Solidity", "Node.js"],
      skillsVerified: ["React", "Solidity"],
      reputationScore: 95,
      averageRating: 4.9,
      totalRatings: 24,
      completedJobs: 28,
      onTimeDeliveryRate: "96",
      hourlyRate: "85",
      availability: "available",
      badges: ["Early Adopter", "Top Performer", "Community Leader"],
      rating: "4.9",
      totalEarned: "12.5",
      verified: true,
      responseTime: 30,
      qualityRating: "4.8",
      communicationRating: "4.9",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      walletAddress: "0x0987654321098765432109876543210987654321",
      displayName: "Sarah Rodriguez",
      bio: "UI/UX designer with Web3 experience",
      skills: ["Figma", "Design Systems", "Prototyping"],
      skillsVerified: ["Figma", "Design Systems"],
      reputationScore: 92,
      averageRating: 4.8,
      totalRatings: 19,
      completedJobs: 22,
      onTimeDeliveryRate: "95",
      hourlyRate: "70",
      availability: "available",
      badges: ["Design Expert", "Reliable Worker"],
      rating: "4.8",
      totalEarned: "8.3",
      verified: true,
      responseTime: 45,
      qualityRating: "4.9",
      communicationRating: "4.7",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      walletAddress: "0x1122334455667788990011223344556677889900",
      displayName: "Marcus Thompson",
      bio: "Smart contract auditor and security researcher",
      skills: ["Security Auditing", "Solidity", "Testing"],
      skillsVerified: ["Security Auditing", "Solidity"],
      reputationScore: 89,
      averageRating: 4.7,
      totalRatings: 15,
      completedJobs: 18,
      onTimeDeliveryRate: "94",
      hourlyRate: "120",
      availability: "busy",
      badges: ["Security Expert"],
      rating: "4.7",
      totalEarned: "15.2",
      verified: true,
      responseTime: 60,
      qualityRating: "4.8",
      communicationRating: "4.6",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 90) return { level: "Elite", color: "bg-gradient-to-r from-yellow-400 to-orange-500" };
    if (score >= 80) return { level: "Expert", color: "bg-gradient-to-r from-blue-500 to-purple-600" };
    if (score >= 70) return { level: "Professional", color: "bg-gradient-to-r from-green-500 to-blue-500" };
    if (score >= 60) return { level: "Skilled", color: "bg-gradient-to-r from-teal-400 to-green-500" };
    return { level: "Rising", color: "bg-gradient-to-r from-gray-400 to-gray-600" };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Top Reputation Leaders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockLeaderboardData.map((worker, index) => {
          const position = index + 1;
          const reputationLevel = getReputationLevel(worker.reputationScore);
          
          return (
            <Link key={worker.id} href={`/profile/${worker.walletAddress}`}>
              <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                {/* Position */}
                <div className="flex items-center justify-center w-10 h-10">
                  {getPositionIcon(position)}
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="font-bold">
                    {worker.displayName?.slice(0, 2) || worker.walletAddress.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Worker Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {worker.displayName || `${worker.walletAddress.slice(0, 6)}...${worker.walletAddress.slice(-4)}`}
                    </h3>
                    {worker.verified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{worker.averageRating}</span>
                      <span>({worker.totalRatings})</span>
                    </div>
                    <span>•</span>
                    <span>{worker.completedJobs} jobs</span>
                    <span>•</span>
                    <span>{worker.onTimeDeliveryRate}% on-time</span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {worker.skillsVerified?.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reputation Score */}
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`px-2 py-1 rounded-full text-white text-xs font-bold ${reputationLevel.color}`}>
                      {reputationLevel.level}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{worker.reputationScore}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* View All Link */}
        <div className="text-center pt-4">
          <Link href="/leaderboard">
            <div className="text-primary hover:underline text-sm font-medium cursor-pointer">
              View Full Leaderboard →
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
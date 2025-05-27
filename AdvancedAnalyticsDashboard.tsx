import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Target,
  Clock,
  Award,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Share2
} from "lucide-react";

interface AdvancedAnalyticsDashboardProps {
  userAddress: string;
  isConnected: boolean;
  userTier: 'free' | 'pro' | 'enterprise';
}

interface EarningsMetric {
  period: string;
  amount: number;
  fees: number;
  netEarnings: number;
  jobsCompleted: number;
  avgJobValue: number;
  growth: number;
}

interface PerformanceMetric {
  category: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
  percentile: number;
}

interface MarketInsight {
  skill: string;
  demandScore: number;
  avgRate: number;
  growth: number;
  competition: number;
  opportunities: number;
}

export default function AdvancedAnalyticsDashboard({ 
  userAddress, 
  isConnected, 
  userTier 
}: AdvancedAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'earnings' | 'performance' | 'market'>('earnings');

  // Mock analytics data - in production, this would come from your analytics API
  const earningsData: EarningsMetric[] = [
    {
      period: 'This Month',
      amount: 12.4,
      fees: 0.31,
      netEarnings: 12.09,
      jobsCompleted: 15,
      avgJobValue: 0.83,
      growth: 23.5
    },
    {
      period: 'Last Month',
      amount: 9.8,
      fees: 0.49,
      netEarnings: 9.31,
      jobsCompleted: 12,
      avgJobValue: 0.82,
      growth: 15.2
    },
    {
      period: 'Last 3 Months',
      amount: 34.7,
      fees: 1.24,
      netEarnings: 33.46,
      jobsCompleted: 42,
      avgJobValue: 0.83,
      growth: 18.9
    }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      category: 'Response Time',
      current: 2.3,
      previous: 3.1,
      change: -25.8,
      trend: 'up',
      rank: 12,
      percentile: 94
    },
    {
      category: 'Job Completion Rate',
      current: 98.7,
      previous: 96.2,
      change: 2.6,
      trend: 'up',
      rank: 8,
      percentile: 97
    },
    {
      category: 'Client Satisfaction',
      current: 4.9,
      previous: 4.7,
      change: 4.3,
      trend: 'up',
      rank: 15,
      percentile: 92
    },
    {
      category: 'Repeat Client Rate',
      current: 34.2,
      previous: 28.9,
      change: 18.3,
      trend: 'up',
      rank: 23,
      percentile: 89
    }
  ];

  const marketInsights: MarketInsight[] = [
    {
      skill: 'Smart Contract Development',
      demandScore: 94,
      avgRate: 0.15,
      growth: 47.3,
      competition: 23,
      opportunities: 127
    },
    {
      skill: 'DeFi Protocol Design',
      demandScore: 89,
      avgRate: 0.18,
      growth: 52.1,
      competition: 18,
      opportunities: 89
    },
    {
      skill: 'Web3 Frontend Development',
      demandScore: 86,
      avgRate: 0.12,
      growth: 41.7,
      competition: 34,
      opportunities: 156
    },
    {
      skill: 'Blockchain Security Auditing',
      demandScore: 92,
      avgRate: 0.22,
      growth: 38.9,
      competition: 12,
      opportunities: 67
    }
  ];

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up' || value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down' || value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  const getChangeColor = (value: number) => {
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getDemandColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isFeatureAvailable = (feature: string) => {
    if (userTier === 'free') return false;
    if (userTier === 'pro' && feature === 'advanced') return false;
    return true;
  };

  const currentEarnings = earningsData[0];

  return (
    <div className="w-full space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your performance and market opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{currentEarnings.amount} ETH</p>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(currentEarnings.growth)}`}>
                  {getTrendIcon('up', currentEarnings.growth)}
                  +{currentEarnings.growth}%
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Completed</p>
                <p className="text-2xl font-bold">{currentEarnings.jobsCompleted}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getTrendIcon('up', 1)}
                  +25% vs last month
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Job Value</p>
                <p className="text-2xl font-bold">{currentEarnings.avgJobValue} ETH</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getTrendIcon('up', 1)}
                  +1.2% this month
                </div>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Rank</p>
                <p className="text-2xl font-bold">#8</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getTrendIcon('up', 1)}
                  Top 5% of workers
                </div>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings">Earnings Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-6">
          {/* Earnings Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Earnings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.map((period, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{period.period}</span>
                        <span className="text-lg font-bold">{period.amount} ETH</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Fees:</span>
                          <div className="font-medium">{period.fees} ETH</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net:</span>
                          <div className="font-medium text-green-600">{period.netEarnings} ETH</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Growth:</span>
                          <div className={`font-medium ${getChangeColor(period.growth)}`}>
                            +{period.growth}%
                          </div>
                        </div>
                      </div>
                      <Progress value={(period.netEarnings / period.amount) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Fee Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {((currentEarnings.netEarnings / currentEarnings.amount) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Net earnings rate</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Platform Fee Rate:</span>
                      <span className="font-medium">
                        {userTier === 'free' ? '2.5%' : userTier === 'pro' ? '1.5%' : '1.0%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fees Saved (vs Free):</span>
                      <span className="font-medium text-green-600">
                        {userTier === 'pro' ? '0.31 ETH' : userTier === 'enterprise' ? '0.56 ETH' : '0 ETH'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Fee Savings:</span>
                      <span className="font-medium text-green-600">
                        ~{userTier === 'pro' ? '3.7 ETH' : userTier === 'enterprise' ? '6.7 ETH' : '0 ETH'}
                      </span>
                    </div>
                  </div>

                  {userTier === 'free' && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 Upgrade to Pro and save 40% on platform fees!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Projection */}
          {isFeatureAvailable('basic') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Revenue Projections
                  <Badge className="bg-blue-100 text-blue-800">Pro Feature</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">15.8 ETH</div>
                    <div className="text-sm text-muted-foreground">Projected next month</div>
                    <div className="text-xs text-green-600">+27% growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">189.6 ETH</div>
                    <div className="text-sm text-muted-foreground">Projected yearly</div>
                    <div className="text-xs text-green-600">+23% growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">Top 3%</div>
                    <div className="text-sm text-muted-foreground">Projected ranking</div>
                    <div className="text-xs text-blue-600">Elite tier</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{metric.category}</h3>
                    <Badge className={`${metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      Rank #{metric.rank}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {metric.current}{metric.category.includes('Rate') || metric.category.includes('Satisfaction') ? 
                          (metric.category === 'Client Satisfaction' ? '/5' : '%') : 'h'}
                      </span>
                      <div className={`flex items-center gap-1 ${getChangeColor(metric.change)}`}>
                        {getTrendIcon(metric.trend, metric.change)}
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Percentile Rank</span>
                        <span className="font-medium">{metric.percentile}th</span>
                      </div>
                      <Progress value={metric.percentile} className="h-2" />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      vs previous period: {metric.previous}
                      {metric.category.includes('Rate') || metric.category.includes('Satisfaction') ? 
                        (metric.category === 'Client Satisfaction' ? '/5' : '%') : 'h'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Insights */}
          {isFeatureAvailable('basic') && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Excellent Response Time
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your 2.3-hour average response time puts you in the top 6% of workers. 
                          This speed gives you a significant competitive advantage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          Opportunity: Repeat Clients
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Focus on building long-term relationships. Your 34% repeat rate is good, 
                          but top performers achieve 45%+. Consider offering package deals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {!isFeatureAvailable('basic') ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Market Intelligence</h3>
                <p className="text-muted-foreground mb-4">
                  Unlock detailed market insights with Pro or Enterprise
                </p>
                <Button>Upgrade to Access Market Data</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Market Overview */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">High</div>
                      <div className="text-sm text-muted-foreground">Market Demand</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">+47%</div>
                      <div className="text-sm text-muted-foreground">Avg Growth Rate</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">439</div>
                      <div className="text-sm text-muted-foreground">Open Opportunities</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skill Market Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Market Analysis</CardTitle>
                  <CardDescription>
                    Real-time insights into demand, competition, and rates for your skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketInsights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{insight.skill}</h4>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getDemandColor(insight.demandScore)}`} />
                            <span className="text-sm font-medium">Demand: {insight.demandScore}/100</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Avg Rate:</span>
                            <div className="font-medium">{insight.avgRate} ETH/hr</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Growth:</span>
                            <div className="font-medium text-green-600">+{insight.growth}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Competition:</span>
                            <div className="font-medium">{insight.competition} workers</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Open Jobs:</span>
                            <div className="font-medium">{insight.opportunities}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Opportunity Score:</span>
                            <div className="font-medium text-blue-600">
                              {Math.round((insight.demandScore * insight.opportunities) / insight.competition)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Advanced Features Promotion */}
      {userTier === 'free' && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
                Unlock Advanced Analytics
              </h3>
              <p className="text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
                Get deeper insights, market intelligence, and revenue projections with Pro or Enterprise. 
                Make data-driven decisions that boost your earnings by up to 40%.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Badge className="bg-blue-600 text-white">Revenue Projections</Badge>
                <Badge className="bg-purple-600 text-white">Market Intelligence</Badge>
                <Badge className="bg-green-600 text-white">Performance Insights</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
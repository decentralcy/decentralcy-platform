import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  Key, 
  Zap, 
  Globe,
  DollarSign,
  BarChart3,
  Shield,
  Copy,
  Eye,
  EyeOff,
  Refresh,
  Download,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIMonetizationSystemProps {
  userAddress: string;
  isConnected: boolean;
  userTier: 'free' | 'pro' | 'enterprise';
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  tier: 'free' | 'pro' | 'enterprise';
  permissions: string[];
  usage: APIUsage;
  status: 'active' | 'suspended' | 'revoked';
  createdAt: Date;
  lastUsed?: Date;
  rateLimits: RateLimit;
}

interface APIUsage {
  requests: number;
  dailyLimit: number;
  monthlyLimit: number;
  requestsToday: number;
  requestsThisMonth: number;
  cost: number;
  revenue: number;
}

interface RateLimit {
  requestsPerSecond: number;
  requestsPerHour: number;
  requestsPerDay: number;
  requestsPerMonth: number;
}

interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  tier: 'free' | 'pro' | 'enterprise';
  cost: number;
  responseTime: string;
  uptime: number;
  documentation: string;
}

interface APIMetrics {
  totalRequests: number;
  revenue: number;
  activeIntegrations: number;
  errorRate: number;
  avgResponseTime: string;
  uptime: number;
}

export default function APIMonetizationSystem({ 
  userAddress, 
  isConnected, 
  userTier 
}: APIMonetizationSystemProps) {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const { toast } = useToast();

  // API tier definitions
  const tierLimits = {
    free: {
      requestsPerMonth: 1000,
      requestsPerDay: 50,
      requestsPerHour: 25,
      requestsPerSecond: 1,
      costPerRequest: 0,
      features: ['Basic job queries', 'Worker profiles', 'Basic stats']
    },
    pro: {
      requestsPerMonth: 50000,
      requestsPerDay: 2000,
      requestsPerHour: 500,
      requestsPerSecond: 10,
      costPerRequest: 0.001,
      features: ['All free features', 'Job posting', 'Advanced analytics', 'Webhooks']
    },
    enterprise: {
      requestsPerMonth: 1000000,
      requestsPerDay: 50000,
      requestsPerHour: 10000,
      requestsPerSecond: 100,
      costPerRequest: 0.0005,
      features: ['All pro features', 'Custom integrations', 'Priority support', 'SLA guarantees']
    }
  };

  // Mock API keys
  const apiKeys: APIKey[] = [
    {
      id: "key_1",
      name: "Production API",
      key: "dcy_live_sk_1234567890abcdef",
      tier: userTier,
      permissions: ['read:jobs', 'write:jobs', 'read:analytics'],
      status: "active",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      rateLimits: {
        requestsPerSecond: tierLimits[userTier].requestsPerSecond,
        requestsPerHour: tierLimits[userTier].requestsPerHour,
        requestsPerDay: tierLimits[userTier].requestsPerDay,
        requestsPerMonth: tierLimits[userTier].requestsPerMonth
      },
      usage: {
        requests: 847,
        dailyLimit: tierLimits[userTier].requestsPerDay,
        monthlyLimit: tierLimits[userTier].requestsPerMonth,
        requestsToday: 23,
        requestsThisMonth: 847,
        cost: 847 * tierLimits[userTier].costPerRequest,
        revenue: 847 * tierLimits[userTier].costPerRequest * 1.2
      }
    }
  ];

  // API endpoints
  const apiEndpoints: APIEndpoint[] = [
    {
      path: '/api/v1/jobs',
      method: 'GET',
      description: 'List all available jobs with filters',
      tier: 'free',
      cost: 0,
      responseTime: '120ms',
      uptime: 99.9,
      documentation: 'https://docs.decentralcy.com/api/jobs'
    },
    {
      path: '/api/v1/jobs',
      method: 'POST',
      description: 'Create a new job posting',
      tier: 'pro',
      cost: 0.01,
      responseTime: '240ms',
      uptime: 99.8,
      documentation: 'https://docs.decentralcy.com/api/jobs/create'
    },
    {
      path: '/api/v1/workers',
      method: 'GET',
      description: 'Search and filter workers by skills',
      tier: 'free',
      cost: 0,
      responseTime: '95ms',
      uptime: 99.9,
      documentation: 'https://docs.decentralcy.com/api/workers'
    },
    {
      path: '/api/v1/analytics',
      method: 'GET',
      description: 'Access detailed platform analytics',
      tier: 'pro',
      cost: 0.005,
      responseTime: '180ms',
      uptime: 99.7,
      documentation: 'https://docs.decentralcy.com/api/analytics'
    },
    {
      path: '/api/v1/contracts',
      method: 'POST',
      description: 'Deploy smart contracts programmatically',
      tier: 'enterprise',
      cost: 0.1,
      responseTime: '2.1s',
      uptime: 99.5,
      documentation: 'https://docs.decentralcy.com/api/contracts'
    }
  ];

  // Mock metrics
  const metrics: APIMetrics = {
    totalRequests: 12847,
    revenue: userTier === 'free' ? 0 : userTier === 'pro' ? 12.85 : 156.23,
    activeIntegrations: userTier === 'free' ? 1 : userTier === 'pro' ? 3 : 12,
    errorRate: 0.2,
    avgResponseTime: '145ms',
    uptime: 99.8
  };

  const generateAPIKeyMutation = useMutation({
    mutationFn: async (keyName: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: APIKey = {
        id: `key_${Date.now()}`,
        name: keyName,
        key: `dcy_${userTier}_sk_${Math.random().toString(36).substr(2, 16)}`,
        tier: userTier,
        permissions: ['read:jobs', 'read:workers'],
        status: 'active',
        createdAt: new Date(),
        rateLimits: {
          requestsPerSecond: tierLimits[userTier].requestsPerSecond,
          requestsPerHour: tierLimits[userTier].requestsPerHour,
          requestsPerDay: tierLimits[userTier].requestsPerDay,
          requestsPerMonth: tierLimits[userTier].requestsPerMonth
        },
        usage: {
          requests: 0,
          dailyLimit: tierLimits[userTier].requestsPerDay,
          monthlyLimit: tierLimits[userTier].requestsPerMonth,
          requestsToday: 0,
          requestsThisMonth: 0,
          cost: 0,
          revenue: 0
        }
      };

      return newKey;
    },
    onSuccess: () => {
      toast({
        title: "API Key Generated! 🔑",
        description: "Your new API key is ready to use. Keep it secure!",
      });
      setNewKeyName("");
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return limit > 0 ? (current / limit) * 100 : 0;
  };

  const currentTierLimits = tierLimits[userTier];

  return (
    <div className="w-full space-y-6">
      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" />
            API Management & Monetization
          </CardTitle>
          <CardDescription>
            Programmatic access to Decentralcy's ecosystem with usage-based pricing
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Revenue</p>
                <p className="text-2xl font-bold">${metrics.revenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Integrations</p>
                <p className="text-2xl font-bold">{metrics.activeIntegrations}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Uptime</p>
                <p className="text-2xl font-bold">{metrics.uptime}%</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="usage">Usage & Billing</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Create New API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate New API Key</CardTitle>
              <CardDescription>
                Create secure API keys for your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="API key name (e.g., Production, Staging)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => generateAPIKeyMutation.mutate(newKeyName)}
                  disabled={!newKeyName || generateAPIKeyMutation.isPending}
                >
                  {generateAPIKeyMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Generate Key
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Current tier: <Badge className={getTierBadgeColor(userTier)}>{userTier}</Badge>
                • {currentTierLimits.requestsPerMonth.toLocaleString()} requests/month
                • ${currentTierLimits.costPerRequest} per request
              </div>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{apiKey.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {apiKey.createdAt.toLocaleDateString()}
                        {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed.toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierBadgeColor(apiKey.tier)}>
                        {apiKey.tier}
                      </Badge>
                      <Badge className={
                        apiKey.status === 'active' ? 'bg-green-100 text-green-800' :
                        apiKey.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {apiKey.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">API Key</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={showKey === apiKey.id ? apiKey.key : apiKey.key.replace(/./g, '•')}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        >
                          {showKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Requests Today:</span>
                        <div className="font-medium">{apiKey.usage.requestsToday} / {apiKey.usage.dailyLimit}</div>
                        <Progress value={getUsagePercentage(apiKey.usage.requestsToday, apiKey.usage.dailyLimit)} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Requests This Month:</span>
                        <div className="font-medium">{apiKey.usage.requestsThisMonth} / {apiKey.usage.monthlyLimit}</div>
                        <Progress value={getUsagePercentage(apiKey.usage.requestsThisMonth, apiKey.usage.monthlyLimit)} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Total Cost:</span>
                        <div className="font-medium">${apiKey.usage.cost.toFixed(3)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Refresh className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Permissions
                      </Button>
                      <Button variant="destructive" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierBadgeColor(endpoint.tier)}>
                        {endpoint.tier}+
                      </Badge>
                      {endpoint.cost > 0 && (
                        <Badge variant="outline">
                          ${endpoint.cost}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {endpoint.description}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Response Time:</span>
                      <div className="font-medium">{endpoint.responseTime}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Uptime:</span>
                      <div className="font-medium">{endpoint.uptime}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Cost per request:</span>
                      <div className="font-medium">${endpoint.cost}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Code className="w-4 h-4 mr-1" />
                      Try it
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(endpoint.documentation, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {/* Current Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Current Usage ({userTier} tier)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Daily Requests</span>
                      <span>{apiKeys[0]?.usage.requestsToday || 0} / {currentTierLimits.requestsPerDay}</span>
                    </div>
                    <Progress value={getUsagePercentage(apiKeys[0]?.usage.requestsToday || 0, currentTierLimits.requestsPerDay)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Monthly Requests</span>
                      <span>{apiKeys[0]?.usage.requestsThisMonth || 0} / {currentTierLimits.requestsPerMonth}</span>
                    </div>
                    <Progress value={getUsagePercentage(apiKeys[0]?.usage.requestsThisMonth || 0, currentTierLimits.requestsPerMonth)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Cost per request:</span>
                    <span className="font-medium">${currentTierLimits.costPerRequest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This month's cost:</span>
                    <span className="font-medium">${(apiKeys[0]?.usage.cost || 0).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected monthly cost:</span>
                    <span className="font-medium text-blue-600">
                      ${((apiKeys[0]?.usage.cost || 0) * 1.5).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>API Tier Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Feature</th>
                      <th className="text-center p-3">Free</th>
                      <th className="text-center p-3">Pro</th>
                      <th className="text-center p-3">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Monthly Requests</td>
                      <td className="text-center p-3">1,000</td>
                      <td className="text-center p-3">50,000</td>
                      <td className="text-center p-3">1,000,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Cost per Request</td>
                      <td className="text-center p-3">Free</td>
                      <td className="text-center p-3">$0.001</td>
                      <td className="text-center p-3">$0.0005</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Rate Limit</td>
                      <td className="text-center p-3">1/sec</td>
                      <td className="text-center p-3">10/sec</td>
                      <td className="text-center p-3">100/sec</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">SLA</td>
                      <td className="text-center p-3">-</td>
                      <td className="text-center p-3">99.5%</td>
                      <td className="text-center p-3">99.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Complete guides and examples for integrating with Decentralcy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Start Guide</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get up and running with the Decentralcy API in minutes
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Guide
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">API Reference</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete reference for all endpoints and parameters
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Reference
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">SDKs & Libraries</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Official SDKs for JavaScript, Python, Go, and more
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download SDKs
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Code Examples</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Real-world integration examples and use cases
                  </p>
                  <Button variant="outline" size="sm">
                    <Code className="w-4 h-4 mr-1" />
                    View Examples
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Example: Creating a Job
                </h4>
                <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
{`curl -X POST https://api.decentralcy.com/v1/jobs \\
  -H "Authorization: Bearer dcy_pro_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Smart Contract Development",
    "description": "Build a DeFi lending protocol",
    "budget": "5.0",
    "currency": "ETH",
    "deadline": "2024-02-15",
    "skills": ["solidity", "defi", "security"]
  }'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revenue Opportunity */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
              Monetize Your Platform Integration
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-2xl mx-auto">
              Our API enables developers to build on top of Decentralcy while generating revenue 
              through usage-based pricing. From simple job queries to complex smart contract 
              deployments, every API call contributes to platform growth.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-green-600 text-white">Usage-Based Revenue</Badge>
              <Badge className="bg-blue-600 text-white">Developer Ecosystem</Badge>
              <Badge className="bg-purple-600 text-white">Scalable Pricing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
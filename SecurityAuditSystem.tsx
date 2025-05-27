import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Code,
  Bug,
  Lock,
  Zap,
  Target,
  Clock,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityAuditSystemProps {
  userAddress: string;
  isConnected: boolean;
}

interface SecurityAudit {
  id: string;
  contractAddress: string;
  contractName: string;
  auditorAddress: string;
  auditorReputation: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: Date;
  completionTime?: Date;
  findings: SecurityFinding[];
  overallScore: number;
  gasOptimization: GasOptimization[];
  recommendations: string[];
  cost: string;
  verified: boolean;
}

interface SecurityFinding {
  id: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: 'reentrancy' | 'overflow' | 'access_control' | 'gas' | 'logic' | 'best_practice';
  title: string;
  description: string;
  location: string;
  recommendation: string;
  codeSnippet?: string;
  fixed: boolean;
}

interface GasOptimization {
  function: string;
  currentGas: number;
  optimizedGas: number;
  savings: number;
  description: string;
}

interface AuditTemplate {
  id: string;
  name: string;
  description: string;
  checks: string[];
  estimatedTime: string;
  cost: string;
  thoroughness: 'basic' | 'standard' | 'comprehensive';
}

export default function SecurityAuditSystem({ userAddress, isConnected }: SecurityAuditSystemProps) {
  const [selectedContract, setSelectedContract] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<AuditTemplate | null>(null);
  const [auditProgress, setAuditProgress] = useState(0);
  const [currentAudit, setCurrentAudit] = useState<SecurityAudit | null>(null);
  const { toast } = useToast();

  // Available audit templates
  const auditTemplates: AuditTemplate[] = [
    {
      id: "basic",
      name: "Basic Security Check",
      description: "Essential security checks for common vulnerabilities",
      checks: [
        "Reentrancy protection",
        "Integer overflow/underflow",
        "Access control verification",
        "Input validation",
        "Basic gas optimization"
      ],
      estimatedTime: "2-4 hours",
      cost: "0.1 ETH",
      thoroughness: "basic"
    },
    {
      id: "standard",
      name: "Standard Audit",
      description: "Comprehensive audit covering most security aspects",
      checks: [
        "All basic checks",
        "Logic flow analysis",
        "State variable protection",
        "External call safety",
        "Gas optimization recommendations",
        "Documentation review"
      ],
      estimatedTime: "1-2 days",
      cost: "0.5 ETH",
      thoroughness: "standard"
    },
    {
      id: "comprehensive",
      name: "Enterprise Audit",
      description: "Complete security audit with formal verification",
      checks: [
        "All standard checks",
        "Formal verification",
        "Economic attack analysis",
        "Stress testing",
        "Performance optimization",
        "Compliance verification",
        "Documentation and reporting"
      ],
      estimatedTime: "3-5 days",
      cost: "2.0 ETH",
      thoroughness: "comprehensive"
    }
  ];

  // Mock audit results
  const mockAudit: SecurityAudit = {
    id: "audit_1",
    contractAddress: "0x1234567890123456789012345678901234567890",
    contractName: "EscrowContract.sol",
    auditorAddress: "0x9876543210987654321098765432109876543210",
    auditorReputation: 94,
    status: "completed",
    severity: "medium",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    completionTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    overallScore: 82,
    cost: "0.5 ETH",
    verified: true,
    findings: [
      {
        id: "finding_1",
        severity: "high",
        category: "reentrancy",
        title: "Potential Reentrancy in withdrawEscrow()",
        description: "The withdrawEscrow function makes an external call before updating state, creating a potential reentrancy vulnerability.",
        location: "Line 45-52",
        recommendation: "Implement checks-effects-interactions pattern or use ReentrancyGuard",
        codeSnippet: "function withdrawEscrow() external {\n  payable(msg.sender).transfer(amount);\n  escrowBalance = 0; // State change after external call\n}",
        fixed: false
      },
      {
        id: "finding_2",
        severity: "medium",
        category: "gas",
        title: "Inefficient Loop in getActiveJobs()",
        description: "The loop iterates through all jobs without bounds, potentially causing gas limit issues.",
        location: "Line 78-85",
        recommendation: "Implement pagination or use mapping for O(1) access",
        codeSnippet: "for (uint i = 0; i < jobs.length; i++) {\n  // Process all jobs\n}",
        fixed: false
      },
      {
        id: "finding_3",
        severity: "low",
        category: "best_practice",
        title: "Missing Event Emissions",
        description: "Critical state changes don't emit events, reducing transparency.",
        location: "Multiple functions",
        recommendation: "Add appropriate event emissions for all state changes",
        fixed: true
      }
    ],
    gasOptimization: [
      {
        function: "createJob()",
        currentGas: 125000,
        optimizedGas: 98000,
        savings: 27000,
        description: "Pack struct variables to reduce storage slots"
      },
      {
        function: "completeJob()",
        currentGas: 78000,
        optimizedGas: 65000,
        savings: 13000,
        description: "Use assembly for efficient hash computation"
      }
    ],
    recommendations: [
      "Implement comprehensive access control using OpenZeppelin's AccessControl",
      "Add circuit breaker pattern for emergency stops",
      "Consider using proxy pattern for upgradability",
      "Implement time locks for critical operations",
      "Add comprehensive input validation for all public functions"
    ]
  };

  const startAuditMutation = useMutation({
    mutationFn: async (params: { contractAddress: string; template: AuditTemplate }) => {
      setAuditProgress(0);
      
      // Simulate audit process
      const steps = [
        "Analyzing contract bytecode...",
        "Checking for common vulnerabilities...",
        "Testing reentrancy protection...",
        "Analyzing gas optimization...",
        "Reviewing access controls...",
        "Generating report..."
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAuditProgress(((i + 1) / steps.length) * 100);
        
        toast({
          title: "Audit Progress",
          description: steps[i],
        });
      }

      return mockAudit;
    },
    onSuccess: (audit) => {
      setCurrentAudit(audit);
      toast({
        title: "Security Audit Complete! 🔒",
        description: `Found ${audit.findings.length} issues with overall score of ${audit.overallScore}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Audit Failed",
        description: error.message,
        variant: "destructive",
      });
      setAuditProgress(0);
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'info':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Eye className="w-4 h-4" />;
      case 'low':
        return <Bug className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reentrancy':
        return <Zap className="w-4 h-4" />;
      case 'access_control':
        return <Lock className="w-4 h-4" />;
      case 'gas':
        return <Target className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Security Audit & Contract Verification
          </CardTitle>
          <CardDescription>
            Professional security audits and automated vulnerability detection for smart contracts
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit">Start Audit</TabsTrigger>
          <TabsTrigger value="results">Audit Results</TabsTrigger>
          <TabsTrigger value="findings">Security Findings</TabsTrigger>
          <TabsTrigger value="optimization">Gas Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          {/* Contract Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract to Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Contract Address</label>
                <Input
                  placeholder="0x... contract address to audit"
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audit Templates */}
          <div className="grid md:grid-cols-3 gap-4">
            {auditTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <div className="font-medium">{template.estimatedTime}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <div className="font-medium">{template.cost}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Security Checks:</span>
                    <div className="space-y-1">
                      {template.checks.map((check, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {check}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Badge className={
                    template.thoroughness === 'basic' ? 'bg-blue-100 text-blue-800' :
                    template.thoroughness === 'standard' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {template.thoroughness}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Audit Progress */}
          {startAuditMutation.isPending && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Security Audit in Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(auditProgress)}%</span>
                  </div>
                  <Progress value={auditProgress} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    This comprehensive audit may take several minutes to complete...
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Audit Button */}
          <Button
            onClick={() => {
              if (!selectedContract || !selectedTemplate) {
                toast({
                  title: "Missing Information",
                  description: "Please enter a contract address and select an audit template",
                  variant: "destructive",
                });
                return;
              }
              startAuditMutation.mutate({
                contractAddress: selectedContract,
                template: selectedTemplate
              });
            }}
            disabled={startAuditMutation.isPending || !selectedContract || !selectedTemplate}
            className="w-full"
            size="lg"
          >
            {startAuditMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Running Security Audit...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start Security Audit
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {!currentAudit && !mockAudit ? (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Audit Results</h3>
                <p className="text-muted-foreground">
                  Run a security audit to see results here
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Audit Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{(currentAudit || mockAudit).contractName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {(currentAudit || mockAudit).contractAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={(currentAudit || mockAudit).verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {(currentAudit || mockAudit).verified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge className={getSeverityColor((currentAudit || mockAudit).severity)}>
                        {(currentAudit || mockAudit).severity} risk
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor((currentAudit || mockAudit).overallScore)}`}>
                        {(currentAudit || mockAudit).overallScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Security Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(currentAudit || mockAudit).findings.length}</div>
                      <div className="text-sm text-muted-foreground">Issues Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(currentAudit || mockAudit).gasOptimization.length}</div>
                      <div className="text-sm text-muted-foreground">Gas Optimizations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(currentAudit || mockAudit).cost}</div>
                      <div className="text-sm text-muted-foreground">Audit Cost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(currentAudit || mockAudit).recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          {!mockAudit.findings.length ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">No Security Issues Found</h3>
                <p className="text-muted-foreground">
                  Your contract passed all security checks!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockAudit.findings.map((finding) => (
                <Card key={finding.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          {getSeverityIcon(finding.severity)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{finding.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{finding.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(finding.category)}
                          {finding.category}
                        </Badge>
                        {finding.fixed && (
                          <Badge className="bg-green-100 text-green-800">Fixed</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{finding.description}</p>
                    </div>

                    {finding.codeSnippet && (
                      <div>
                        <h4 className="font-medium mb-2">Code Snippet</h4>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                          <code>{finding.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="space-y-4">
            {mockAudit.gasOptimization.map((opt, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{opt.function}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      -{opt.savings.toLocaleString()} gas
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{opt.currentGas.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Current Gas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{opt.optimizedGas.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Optimized Gas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(((opt.currentGas - opt.optimizedGas) / opt.currentGas) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Savings</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Security Benefits */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
              Bulletproof Smart Contract Security
            </h3>
            <p className="text-red-700 dark:text-red-300 max-w-2xl mx-auto">
              Our automated security audits use the same tools as top-tier security firms. 
              Detect vulnerabilities before deployment, optimize gas usage, and earn trust 
              through verified, battle-tested smart contracts.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-red-600 text-white">Vulnerability Detection</Badge>
              <Badge className="bg-orange-600 text-white">Gas Optimization</Badge>
              <Badge className="bg-yellow-600 text-white">Best Practice Compliance</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
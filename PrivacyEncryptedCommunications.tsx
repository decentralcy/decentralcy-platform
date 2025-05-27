import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Key,
  MessageSquare,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacyEncryptedCommunicationsProps {
  userAddress: string;
  isConnected: boolean;
}

interface EncryptionSettings {
  messagesEncrypted: boolean;
  filesEncrypted: boolean;
  metadataPrivate: boolean;
  anonymousMode: boolean;
  publicKeySharing: boolean;
  autoDeleteMessages: boolean;
  twoFactorAuth: boolean;
}

interface EncryptedMessage {
  id: string;
  fromAddress: string;
  toAddress: string;
  content: string;
  encrypted: boolean;
  timestamp: Date;
  jobId?: string;
  read: boolean;
  signature: string;
}

interface PrivacyTool {
  name: string;
  description: string;
  enabled: boolean;
  level: 'basic' | 'advanced' | 'enterprise';
  icon: any;
}

export default function PrivacyEncryptedCommunications({ 
  userAddress, 
  isConnected 
}: PrivacyEncryptedCommunicationsProps) {
  const [encryptionSettings, setEncryptionSettings] = useState<EncryptionSettings>({
    messagesEncrypted: true,
    filesEncrypted: true,
    metadataPrivate: false,
    anonymousMode: false,
    publicKeySharing: true,
    autoDeleteMessages: false,
    twoFactorAuth: false
  });

  const [newMessage, setNewMessage] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [publicKey, setPublicKey] = useState("0x04a1b2c3d4e5f6789...");
  const [privateKey, setPrivateKey] = useState("0x1234567890abcdef...");
  const { toast } = useToast();

  // Privacy tools configuration
  const privacyTools: PrivacyTool[] = [
    {
      name: "End-to-End Message Encryption",
      description: "All messages encrypted using ECDH key exchange",
      enabled: encryptionSettings.messagesEncrypted,
      level: "basic",
      icon: MessageSquare
    },
    {
      name: "File Encryption (IPFS)",
      description: "Encrypt files before storing on IPFS",
      enabled: encryptionSettings.filesEncrypted,
      level: "basic",
      icon: FileText
    },
    {
      name: "Metadata Privacy",
      description: "Hide job details and transaction metadata",
      enabled: encryptionSettings.metadataPrivate,
      level: "advanced",
      icon: Eye
    },
    {
      name: "Anonymous Mode",
      description: "Hide wallet address from public view",
      enabled: encryptionSettings.anonymousMode,
      level: "advanced",
      icon: EyeOff
    },
    {
      name: "Zero-Knowledge Reputation",
      description: "Prove reputation without revealing history",
      enabled: false,
      level: "enterprise",
      icon: Shield
    },
    {
      name: "Onion Routing (Tor Integration)",
      description: "Route communications through Tor network",
      enabled: false,
      level: "enterprise",
      icon: Lock
    }
  ];

  // Mock encrypted messages
  const encryptedMessages: EncryptedMessage[] = [
    {
      id: "msg_1",
      fromAddress: "0x1234567890123456789012345678901234567890",
      toAddress: userAddress,
      content: "Hi! I'm interested in your smart contract development services. Can we discuss the project requirements?",
      encrypted: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      jobId: "job_123",
      read: false,
      signature: "0xabc123..."
    },
    {
      id: "msg_2",
      fromAddress: userAddress,
      toAddress: "0x9876543210987654321098765432109876543210",
      content: "Thanks for completing the audit ahead of schedule! The report looks comprehensive.",
      encrypted: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      jobId: "job_456",
      read: true,
      signature: "0xdef456..."
    }
  ];

  const generateKeyPairMutation = useMutation({
    mutationFn: async () => {
      // Simulate key generation using Web3 cryptography
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPublicKey = "0x04" + Math.random().toString(16).substr(2, 128);
      const newPrivateKey = "0x" + Math.random().toString(16).substr(2, 64);
      
      return { publicKey: newPublicKey, privateKey: newPrivateKey };
    },
    onSuccess: (keys) => {
      setPublicKey(keys.publicKey);
      setPrivateKey(keys.privateKey);
      toast({
        title: "New Encryption Keys Generated! 🔐",
        description: "Your new keys are ready for secure communications",
      });
    }
  });

  const sendEncryptedMessageMutation = useMutation({
    mutationFn: async (messageData: { recipient: string; content: string; encrypt: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would encrypt the message using the recipient's public key
      const encryptedContent = messageData.encrypt 
        ? `🔒 [ENCRYPTED] ${messageData.content}` 
        : messageData.content;
      
      return {
        id: `msg_${Date.now()}`,
        content: encryptedContent,
        encrypted: messageData.encrypt,
        signature: "0x" + Math.random().toString(16).substr(2, 40)
      };
    },
    onSuccess: () => {
      toast({
        title: "Encrypted Message Sent! 📩",
        description: "Your message has been securely transmitted",
      });
      setNewMessage("");
      setRecipientAddress("");
    }
  });

  const updatePrivacySettingsMutation = useMutation({
    mutationFn: async (settings: EncryptionSettings) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settings;
    },
    onSuccess: () => {
      toast({
        title: "Privacy Settings Updated! ✅",
        description: "Your privacy preferences have been saved",
      });
    }
  });

  const handleSettingChange = (setting: keyof EncryptionSettings, value: boolean) => {
    const newSettings = { ...encryptionSettings, [setting]: value };
    setEncryptionSettings(newSettings);
    updatePrivacySettingsMutation.mutate(newSettings);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" />
            Privacy & Encrypted Communications
          </CardTitle>
          <CardDescription>
            Advanced privacy tools and end-to-end encryption for secure decentralized work
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Privacy Status Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Encryption Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
              </div>
              <Lock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Privacy Level</p>
                <p className="text-lg font-bold">Enhanced</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Encrypted Messages</p>
                <p className="text-lg font-bold">{encryptedMessages.filter(m => m.encrypted).length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings">Privacy Settings</TabsTrigger>
          <TabsTrigger value="messages">Encrypted Messages</TabsTrigger>
          <TabsTrigger value="keys">Key Management</TabsTrigger>
          <TabsTrigger value="tools">Privacy Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {/* Core Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Core Privacy Settings</CardTitle>
              <CardDescription>
                Configure your basic privacy and encryption preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(encryptionSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {key === 'messagesEncrypted' && 'Encrypt all messages using end-to-end encryption'}
                      {key === 'filesEncrypted' && 'Encrypt files before uploading to IPFS'}
                      {key === 'metadataPrivate' && 'Hide job details and transaction metadata from public view'}
                      {key === 'anonymousMode' && 'Hide your wallet address in public listings'}
                      {key === 'publicKeySharing' && 'Allow others to find your public key for encrypted communication'}
                      {key === 'autoDeleteMessages' && 'Automatically delete messages after 30 days'}
                      {key === 'twoFactorAuth' && 'Enable two-factor authentication for account access'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handleSettingChange(key as keyof EncryptionSettings, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Privacy Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Privacy Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Zero-Knowledge Proofs</h4>
                    <Badge className="bg-purple-100 text-purple-800">Coming Soon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prove your reputation and credentials without revealing your work history
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Stealth Addresses</h4>
                    <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate unique addresses for each transaction to enhance privacy
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Enable Stealth Mode
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Tor Integration</h4>
                    <Badge className="bg-orange-100 text-orange-800">Experimental</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Route communications through Tor network for maximum anonymity
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Configure Tor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          {/* Send Encrypted Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send Encrypted Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient Address</label>
                <Input
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your encrypted message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={true} />
                <span className="text-sm">Encrypt message (recommended)</span>
              </div>
              <Button
                onClick={() => sendEncryptedMessageMutation.mutate({
                  recipient: recipientAddress,
                  content: newMessage,
                  encrypt: true
                })}
                disabled={!recipientAddress || !newMessage || sendEncryptedMessageMutation.isPending}
                className="w-full"
              >
                {sendEncryptedMessageMutation.isPending ? "Encrypting & Sending..." : "Send Encrypted Message"}
              </Button>
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Encrypted Message History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {encryptedMessages.map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {message.fromAddress === userAddress ? 'You' : 
                           message.fromAddress.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {message.fromAddress === userAddress ? 'You' : 
                             `${message.fromAddress.slice(0, 6)}...${message.fromAddress.slice(-4)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {message.encrypted && (
                          <Badge className="bg-green-100 text-green-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Encrypted
                          </Badge>
                        )}
                        {!message.read && message.fromAddress !== userAddress && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.jobId && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Related to job: {message.jobId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          {/* Encryption Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Encryption Keys</CardTitle>
              <CardDescription>
                Manage your public and private keys for encrypted communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Public Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={publicKey} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(publicKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this key with others to receive encrypted messages
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Private Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type={showPrivateKey ? "text" : "password"}
                    value={privateKey}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(privateKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Never share your private key with anyone!
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => generateKeyPairMutation.mutate()}
                  disabled={generateKeyPairMutation.isPending}
                  variant="outline"
                >
                  {generateKeyPairMutation.isPending ? "Generating..." : "Generate New Keys"}
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Backup Keys
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Exchange */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Exchange</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Add Contact's Public Key</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Paste public key here..." className="font-mono text-xs" />
                  <Button>Add Contact</Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium mb-2">Trusted Contacts</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">0x1234...5678</span>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">0x9876...4321</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {/* Privacy Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {privacyTools.map((tool, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <tool.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <Badge className={getLevelColor(tool.level)} variant="outline">
                          {tool.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tool.enabled ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {tool.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Status: {tool.enabled ? "Active" : "Inactive"}
                    </span>
                    <Button variant={tool.enabled ? "outline" : "default"} size="sm">
                      {tool.enabled ? "Configure" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Privacy Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Privacy Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Privacy Level</span>
                  <Badge className="bg-green-100 text-green-800">85/100</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Communication Privacy</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Protection</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Anonymity Level</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">
              Enterprise-Grade Privacy Protection
            </h3>
            <p className="text-purple-700 dark:text-purple-300 max-w-2xl mx-auto">
              Decentralcy's privacy features ensure your communications and data remain secure. 
              End-to-end encryption, zero-knowledge proofs, and anonymous transactions protect 
              your identity while maintaining trust through verifiable credentials.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Badge className="bg-purple-600 text-white">End-to-End Encryption</Badge>
              <Badge className="bg-blue-600 text-white">Zero-Knowledge Proofs</Badge>
              <Badge className="bg-green-600 text-white">Anonymous Transactions</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
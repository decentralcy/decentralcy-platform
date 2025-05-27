import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle, Phone, Video, Paperclip, MoreVertical, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  timestamp: Date;
  read: boolean;
  jobId?: number;
}

interface Conversation {
  id: string;
  participants: string[];
  jobId?: number;
  jobTitle?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MessagingSystemProps {
  userAddress: string;
  selectedJobId?: number;
}

export default function MessagingSystem({ userAddress, selectedJobId }: MessagingSystemProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock conversations data (in production, this would come from your backend)
  const mockConversations: Conversation[] = [
    {
      id: "conv_1",
      participants: [userAddress, "0x1234567890123456789012345678901234567890"],
      jobId: 1,
      jobTitle: "Blockchain Developer Position",
      lastMessage: {
        id: "msg_1",
        conversationId: "conv_1",
        senderId: "0x1234567890123456789012345678901234567890",
        receiverId: userAddress,
        content: "When can you start working on this project?",
        type: "text",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
      },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "conv_2",
      participants: [userAddress, "0x9876543210987654321098765432109876543210"],
      jobId: 2,
      jobTitle: "DeFi Protocol Audit",
      lastMessage: {
        id: "msg_2",
        conversationId: "conv_2",
        senderId: userAddress,
        receiverId: "0x9876543210987654321098765432109876543210",
        content: "I've submitted the initial proposal. Please review.",
        type: "text",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];

  const mockMessages: Message[] = [
    {
      id: "msg_1_1",
      conversationId: "conv_1",
      senderId: "0x1234567890123456789012345678901234567890",
      receiverId: userAddress,
      content: "Hi! I'm interested in your application for the blockchain developer position.",
      type: "text",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg_1_2",
      conversationId: "conv_1",
      senderId: userAddress,
      receiverId: "0x1234567890123456789012345678901234567890",
      content: "Thank you for reaching out! I'm very excited about this opportunity. I have extensive experience with Solidity and DeFi protocols.",
      type: "text",
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg_1_3",
      conversationId: "conv_1",
      senderId: "0x1234567890123456789012345678901234567890",
      receiverId: userAddress,
      content: "Great! Could you share some examples of your previous work?",
      type: "text",
      timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg_1_4",
      conversationId: "conv_1",
      senderId: userAddress,
      receiverId: "0x1234567890123456789012345678901234567890",
      content: "Absolutely! I recently built a DEX aggregator and an NFT marketplace. I can share the GitHub links.",
      type: "text",
      timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg_1_5",
      conversationId: "conv_1",
      senderId: "0x1234567890123456789012345678901234567890",
      receiverId: userAddress,
      content: "When can you start working on this project?",
      type: "text",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
    },
  ];

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string }) => {
      // In production, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: Date.now().toString(),
        ...messageData,
        senderId: userAddress,
        type: 'text' as const,
        timestamp: new Date(),
        read: false,
      };
    },
    onSuccess: () => {
      setNewMessage("");
      scrollToBottom();
      toast({
        title: "Message Sent",
        description: "Your message has been delivered successfully.",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p !== userAddress) || "";
  };

  const filteredConversations = mockConversations.filter(conv =>
    conv.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOtherParticipant(conv).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMessages = selectedConversation 
    ? mockMessages.filter(msg => msg.conversationId === selectedConversation)
    : [];

  const selectedConvData = mockConversations.find(conv => conv.id === selectedConversation);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {getOtherParticipant(conversation).slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {getOtherParticipant(conversation).slice(0, 6)}...{getOtherParticipant(conversation).slice(-4)}
                      </h4>
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 w-5 p-0 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {conversation.jobTitle && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {conversation.jobTitle}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage?.content}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {getOtherParticipant(selectedConvData!).slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {getOtherParticipant(selectedConvData!).slice(0, 6)}...{getOtherParticipant(selectedConvData!).slice(-4)}
                    </h4>
                    {selectedConvData?.jobTitle && (
                      <p className="text-xs text-muted-foreground">{selectedConvData.jobTitle}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === userAddress ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === userAddress
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === userAddress ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-[120px] resize-none"
                  />
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
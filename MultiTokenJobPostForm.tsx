import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Calendar, Coins, Shield, AlertCircle, CheckCircle2, Bitcoin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import TokenSelector, { SUPPORTED_TOKENS, type SupportedToken } from "./TokenSelector";
import { apiRequest, queryClient } from "@/lib/queryClient";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  paymentAmount: z.string().min(1, "Payment amount is required"),
  paymentToken: z.string().min(1, "Please select a payment token"),
  deadline: z.string().min(1, "Deadline is required"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface MultiTokenJobPostFormProps {
  userAddress: string;
  onJobPosted?: () => void;
}

export default function MultiTokenJobPostForm({ userAddress, onJobPosted }: MultiTokenJobPostFormProps) {
  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(SUPPORTED_TOKENS[2]); // Default to USDC
  const [paymentAmount, setPaymentAmount] = useState("");
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      duration: "",
      paymentAmount: "",
      paymentToken: SUPPORTED_TOKENS[2].address, // Default to USDC
      deadline: "",
    },
  });

  // Check if token approval is needed
  useEffect(() => {
    if (selectedToken && selectedToken.address !== "0x0000000000000000000000000000000000000000") {
      // For ERC20 tokens, we would normally check allowance here
      // For demo purposes, we'll simulate this
      setNeedsApproval(parseFloat(paymentAmount) > 0);
    } else {
      setNeedsApproval(false);
    }
  }, [selectedToken, paymentAmount]);

  const createJobMutation = useMutation({
    mutationFn: (jobData: JobFormData) => apiRequest("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        ...jobData,
        employerAddress: userAddress,
        paymentToken: selectedToken?.address,
        paymentTokenSymbol: selectedToken?.symbol,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job Posted Successfully!",
        description: `Your job has been posted with ${selectedToken?.symbol} payment. Workers can now apply.`,
      });
      form.reset();
      setPaymentAmount("");
      onJobPosted?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Post Job",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleTokenApproval = async () => {
    if (!selectedToken) return;
    
    setIsApproving(true);
    try {
      // Simulate token approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setNeedsApproval(false);
      toast({
        title: "Token Approved",
        description: `${selectedToken.symbol} spending approved for escrow contract.`,
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const onSubmit = async (data: JobFormData) => {
    if (needsApproval && selectedToken?.address !== "0x0000000000000000000000000000000000000000") {
      toast({
        title: "Token Approval Required",
        description: `Please approve ${selectedToken?.symbol} spending first.`,
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate(data);
  };

  const calculateTotalCost = () => {
    if (!paymentAmount || !selectedToken) return { amount: "0", fee: "0", total: "0" };
    
    const amount = parseFloat(paymentAmount);
    const fee = amount * 0.025; // 2.5% platform fee
    const total = amount + fee;
    
    return {
      amount: amount.toFixed(selectedToken.decimals > 6 ? 4 : 2),
      fee: fee.toFixed(selectedToken.decimals > 6 ? 4 : 2),
      total: total.toFixed(selectedToken.decimals > 6 ? 4 : 2),
    };
  };

  const getTokenBenefits = (token: SupportedToken) => {
    if (token.symbol === "WBTC") {
      return {
        icon: <Bitcoin className="w-4 h-4 text-orange-500" />,
        title: "Bitcoin Payment",
        description: "Leverage Bitcoin's store of value and global recognition"
      };
    } else if (token.isStablecoin) {
      return {
        icon: <Shield className="w-4 h-4 text-green-500" />,
        title: "Price Stability",
        description: "Fixed value protects against cryptocurrency volatility"
      };
    } else {
      return {
        icon: <Coins className="w-4 h-4 text-blue-500" />,
        title: "Crypto Native",
        description: "Embrace the decentralized economy with native tokens"
      };
    }
  };

  const costs = calculateTotalCost();
  const tokenBenefits = selectedToken ? getTokenBenefits(selectedToken) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            Post Job with Multi-Token Payment
          </CardTitle>
          <CardDescription>
            Create a job posting with support for Bitcoin, stablecoins, and major cryptocurrencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Job Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Build DeFi Dashboard UI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the job requirements, deliverables, and any specific skills needed..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Remote / City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2 weeks" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Multi-Token Payment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Payment Configuration</h3>
                  <Badge variant="outline" className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0">
                    <Bitcoin className="w-3 h-3 mr-1" />
                    Bitcoin + Multi-Token
                  </Badge>
                </div>

                <TokenSelector
                  selectedToken={selectedToken}
                  onTokenSelect={(token) => {
                    setSelectedToken(token);
                    form.setValue("paymentToken", token.address);
                  }}
                  amount={paymentAmount}
                  onAmountChange={(amount) => {
                    setPaymentAmount(amount);
                    form.setValue("paymentAmount", amount);
                  }}
                  label="Job Payment Amount"
                />

                {/* Token Benefits Display */}
                {selectedToken && tokenBenefits && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {tokenBenefits.icon}
                        <div>
                          <h4 className="font-medium text-sm">{tokenBenefits.title}</h4>
                          <p className="text-sm text-muted-foreground">{tokenBenefits.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Summary */}
                {selectedToken && paymentAmount && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Job Payment</span>
                        <span className="font-medium">{costs.amount} {selectedToken.symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Platform Fee (2.5%)</span>
                        <span className="font-medium">{costs.fee} {selectedToken.symbol}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Required</span>
                        <span className="text-lg">{costs.total} {selectedToken.symbol}</span>
                      </div>
                      
                      {/* Token Approval Status */}
                      {selectedToken.address !== "0x0000000000000000000000000000000000000000" && (
                        <div className="pt-3 border-t">
                          {needsApproval ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Token approval required</span>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTokenApproval}
                                disabled={isApproving}
                              >
                                {isApproving ? "Approving..." : `Approve ${selectedToken.symbol}`}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Token approved for spending</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Revolutionary Messaging */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                      Revolutionary Escrow Technology
                    </h4>
                    <p className="text-purple-700 dark:text-purple-300">
                      Your payment is secured by blockchain smart contracts. No middlemen, no traditional banks - 
                      just transparent, programmable escrow that releases payment when work is completed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={createJobMutation.isPending || (needsApproval && selectedToken?.address !== "0x0000000000000000000000000000000000000000")}
                  className="flex-1"
                >
                  {createJobMutation.isPending ? (
                    "Posting Job..."
                  ) : (
                    `Post Job with ${selectedToken?.symbol || "Token"} Payment`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
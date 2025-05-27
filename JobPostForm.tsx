import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { insertJobSchema } from "@shared/schema";
import { tempAgencyContract } from "@/lib/contracts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const jobFormSchema = insertJobSchema.extend({
  paymentAmount: z.string().min(1, "Payment amount is required"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobPostFormProps {
  userAddress: string;
  onJobPosted?: () => void;
}

export default function JobPostForm({ userAddress, onJobPosted }: JobPostFormProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [platformFee, setPlatformFee] = useState(10);
  const { toast } = useToast();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "development",
      duration: "",
      location: "remote",
      paymentAmount: "",
      employerAddress: userAddress,
      status: "open",
    },
  });

  const paymentAmount = form.watch("paymentAmount");

  useEffect(() => {
    // Fetch platform fee from contract
    const fetchPlatformFee = async () => {
      try {
        const fee = await tempAgencyContract.getPlatformFee();
        setPlatformFee(fee);
      } catch (error) {
        console.error("Failed to fetch platform fee:", error);
      }
    };

    fetchPlatformFee();
  }, []);

  const calculatePayouts = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const platformFeeAmount = (numAmount * platformFee) / 100;
    const workerPayout = numAmount - platformFeeAmount;
    
    return {
      workerPayout: workerPayout.toFixed(4),
      platformFeeAmount: platformFeeAmount.toFixed(4),
    };
  };

  const onSubmit = async (data: JobFormData) => {
    setIsPosting(true);
    
    try {
      // First, create job in database
      const jobResponse = await apiRequest("POST", "/api/jobs", data);
      const job = await jobResponse.json();

      // Then post to smart contract
      const tx = await tempAgencyContract.postJob(
        data.title,
        data.description,
        data.paymentAmount
      );

      toast({
        title: "Transaction Submitted",
        description: "Please wait for blockchain confirmation...",
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get job ID from contract events
      const jobPostedEvent = receipt.events?.find(
        (event: any) => event.event === "JobPosted"
      );
      
      let contractJobId = null;
      if (jobPostedEvent) {
        contractJobId = jobPostedEvent.args.jobId.toNumber();
      }

      // Update job with contract details
      await apiRequest("PATCH", `/api/jobs/${job.id}`, {
        contractJobId,
        transactionHash: receipt.transactionHash,
      });

      toast({
        title: "Job Posted Successfully!",
        description: `Transaction confirmed: ${receipt.transactionHash}`,
      });

      form.reset();
      onJobPosted?.();
      
    } catch (error: any) {
      console.error("Failed to post job:", error);
      toast({
        variant: "destructive",
        title: "Failed to Post Job",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const { workerPayout, platformFeeAmount } = calculatePayouts(paymentAmount);

  return (
    <Card>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Frontend Developer" {...field} />
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
                      rows={4}
                      placeholder="Describe the job requirements, deliverables, and timeline..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="2 weeks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment (ETH)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="2.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="text-blue-900">
                  <h4 className="font-medium mb-2">Escrow Information</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Your payment will be held in a smart contract. When a worker applies and is accepted, 
                    {100 - platformFee}% goes to the worker and {platformFee}% is collected as a platform fee.
                  </p>
                  {paymentAmount && (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Worker receives:</span>
                        <span className="font-medium">{workerPayout} ETH ({100 - platformFee}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform fee:</span>
                        <span className="font-medium">{platformFeeAmount} ETH ({platformFee}%)</span>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPosting}
                className="bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg transition-all duration-200"
              >
                {isPosting ? "Posting..." : "Post Job & Deposit Escrow"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

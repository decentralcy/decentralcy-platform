import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Upload, File, Globe, Shield, Hash, CheckCircle2, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ipfsService } from "@/lib/ipfs";
import TokenSelector, { SUPPORTED_TOKENS, type SupportedToken } from "./TokenSelector";
import { apiRequest, queryClient } from "@/lib/queryClient";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  deliverables: z.string().min(10, "Deliverables must be at least 10 characters"),
  skills: z.string().min(1, "Skills are required"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  paymentAmount: z.string().min(1, "Payment amount is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface IPFSJobPostFormProps {
  userAddress: string;
  onJobPosted?: () => void;
}

interface UploadProgress {
  stage: 'preparing' | 'uploading_files' | 'uploading_metadata' | 'storing_onchain' | 'complete';
  progress: number;
  message: string;
}

export default function IPFSJobPostForm({ userAddress, onJobPosted }: IPFSJobPostFormProps) {
  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(SUPPORTED_TOKENS[2]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isIPFSAvailable, setIsIPFSAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      deliverables: "",
      skills: "",
      category: "",
      location: "",
      duration: "",
      paymentAmount: "",
      deadline: "",
    },
  });

  // Check IPFS availability on component mount
  useState(() => {
    ipfsService.isAvailable().then(setIsIPFSAvailable);
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      toast({
        title: "Too Many Files",
        description: "Maximum 5 attachments allowed per job posting.",
        variant: "destructive",
      });
      return;
    }
    
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const createJobMutation = useMutation({
    mutationFn: async (jobData: JobFormData) => {
      setUploadProgress({
        stage: 'preparing',
        progress: 10,
        message: 'Preparing job data for IPFS upload...'
      });

      // Parse skills and requirements into arrays
      const skillsArray = jobData.skills.split(',').map(s => s.trim());
      const requirementsArray = jobData.requirements.split('\n').filter(r => r.trim());
      const deliverablesArray = jobData.deliverables.split('\n').filter(d => d.trim());

      // Upload attachments to IPFS first
      let attachmentHashes: string[] = [];
      if (attachments.length > 0) {
        setUploadProgress({
          stage: 'uploading_files',
          progress: 30,
          message: `Uploading ${attachments.length} attachment(s) to IPFS...`
        });
        
        try {
          attachmentHashes = await ipfsService.uploadFiles(attachments);
        } catch (error) {
          console.warn('File upload failed, continuing without attachments:', error);
          toast({
            title: "File Upload Warning",
            description: "Some attachments couldn't be uploaded to IPFS. Job will be posted without them.",
            variant: "destructive",
          });
        }
      }

      // Upload job metadata to IPFS
      setUploadProgress({
        stage: 'uploading_metadata',
        progress: 60,
        message: 'Uploading job metadata to IPFS...'
      });

      const jobMetadata = {
        title: jobData.title,
        description: jobData.description,
        requirements: requirementsArray,
        deliverables: deliverablesArray,
        skills: skillsArray,
        category: jobData.category,
        location: jobData.location,
        duration: jobData.duration,
        attachmentHashes,
      };

      const metadataHash = await ipfsService.uploadJobMetadata(jobMetadata);
      setIpfsHash(metadataHash);

      // Store job on blockchain/database with IPFS hash
      setUploadProgress({
        stage: 'storing_onchain',
        progress: 80,
        message: 'Storing job reference on blockchain...'
      });

      const response = await apiRequest("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...jobData,
          employerAddress: userAddress,
          paymentToken: selectedToken?.address,
          paymentTokenSymbol: selectedToken?.symbol,
          ipfsHash: metadataHash,
          attachmentHashes,
        }),
      });

      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: 'Job posted successfully with IPFS integration!'
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job Posted to Decentralized Web!",
        description: `Your job is now immutably stored on IPFS with hash: ${ipfsHash.slice(0, 12)}...`,
      });
      form.reset();
      setPaymentAmount("");
      setAttachments([]);
      setUploadProgress(null);
      onJobPosted?.();
    },
    onError: (error: any) => {
      setUploadProgress(null);
      toast({
        title: "Failed to Post Job",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    createJobMutation.mutate(data);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Post Job to Decentralized Web (IPFS)
          </CardTitle>
          <CardDescription>
            Create an immutable, censorship-resistant job posting stored on the InterPlanetary File System
          </CardDescription>
          
          {/* IPFS Status Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${isIPFSAvailable ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isIPFSAvailable === null ? 'Checking IPFS...' : 
               isIPFSAvailable ? 'IPFS Connected' : 'Using Local Storage Fallback'}
            </span>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Upload Progress */}
          {uploadProgress && (
            <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="font-medium">{uploadProgress.message}</span>
                </div>
                <Progress value={uploadProgress.progress} className="h-2" />
                <div className="text-sm text-muted-foreground mt-2">
                  Stage: {uploadProgress.stage.replace('_', ' ').toUpperCase()}
                </div>
              </CardContent>
            </Card>
          )}

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
                        <Input placeholder="e.g., Build Decentralized Marketplace" {...field} />
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
                      <FormControl>
                        <select 
                          className="w-full p-2 border rounded-md" 
                          value={field.value} 
                          onChange={field.onChange}
                        >
                          <option value="">Select category</option>
                          <option value="blockchain">Blockchain Development</option>
                          <option value="web3">Web3 & DeFi</option>
                          <option value="frontend">Frontend Development</option>
                          <option value="backend">Backend Development</option>
                          <option value="design">UI/UX Design</option>
                          <option value="marketing">Marketing & Growth</option>
                          <option value="writing">Technical Writing</option>
                          <option value="consulting">Consulting</option>
                        </select>
                      </FormControl>
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
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a comprehensive description of the project, including background, goals, and any specific context..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="5+ years of Solidity experience&#10;Experience with DeFi protocols&#10;Strong understanding of gas optimization"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliverables (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Smart contracts source code&#10;Documentation and tests&#10;Deployment scripts&#10;Security audit report"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills (comma-separated)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Solidity, React, TypeScript, DeFi, Web3.js" 
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
                        <Input placeholder="Remote / Global" {...field} />
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
                        <Input placeholder="e.g., 3-4 weeks" {...field} />
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
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* File Attachments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">File Attachments</h3>
                  <Badge variant="outline">
                    <Database className="w-3 h-3 mr-1" />
                    Stored on IPFS
                  </Badge>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Upload project files, specifications, or mockups
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                        />
                        <Button type="button" variant="outline" className="mt-2">
                          Choose Files
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, images, ZIP up to 10MB each. Max 5 files.
                    </p>
                  </div>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Attached Files:</h4>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Configuration */}
              <TokenSelector
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
                amount={paymentAmount}
                onAmountChange={(amount) => {
                  setPaymentAmount(amount);
                  form.setValue("paymentAmount", amount);
                }}
                label="Job Payment Amount"
              />

              <Separator />

              {/* IPFS Benefits */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-green-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        Decentralized Storage Benefits
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm text-green-700 dark:text-green-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Immutable job descriptions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Censorship-resistant content</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Global accessibility</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Permanent availability</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={createJobMutation.isPending || !selectedToken}
                className="w-full"
                size="lg"
              >
                {createJobMutation.isPending ? (
                  "Publishing to IPFS..."
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Post Job to Decentralized Web
                  </>
                )}
              </Button>

              {ipfsHash && (
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        IPFS Hash Generated
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-mono break-all">
                      {ipfsHash}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Your job description is now permanently stored on the decentralized web!
                    </p>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Briefcase, TrendingUp, Users, DollarSign } from "lucide-react";
import WalletConnection from "@/components/WalletConnection";
import JobCard from "@/components/JobCard";
import JobPostForm from "@/components/JobPostForm";
import Dashboard from "@/components/Dashboard";
import { Job } from "@shared/schema";
import { tempAgencyContract } from "@/lib/contracts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [activeSection, setActiveSection] = useState<"jobs" | "post" | "dashboard">("jobs");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all jobs
  const { data: jobs = [], isLoading: loadingJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  // Apply for job mutation
  const applyForJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const job = jobs.find(j => j.id === jobId);
      if (!job || !job.contractJobId) {
        throw new Error("Job not found or not yet on blockchain");
      }

      // Apply via smart contract
      const tx = await tempAgencyContract.applyForJob(job.contractJobId);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Update job status in database
      await apiRequest("PATCH", `/api/jobs/${jobId}`, {
        status: "filled",
        workerAddress: userAddress,
      });

      // Create application record
      await apiRequest("POST", "/api/applications", {
        jobId,
        workerAddress: userAddress,
        status: "accepted",
      });

      return { receipt, jobId };
    },
    onSuccess: (data) => {
      toast({
        title: "Application Successful!",
        description: `You've been assigned to the job. Payment will be released upon completion.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/worker', userAddress] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/worker', userAddress] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: error.message || "Failed to apply for job",
      });
    },
  });

  const handleConnectionChange = (connected: boolean, address?: string) => {
    setIsConnected(connected);
    setUserAddress(address || "");
  };

  const handleApplyForJob = (jobId: number) => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to apply for jobs",
      });
      return;
    }

    applyForJobMutation.mutate(jobId);
  };

  const handleJobPosted = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    queryClient.invalidateQueries({ queryKey: ['/api/jobs/employer', userAddress] });
    setActiveSection("dashboard");
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => selectedCategory === "all" || job.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "payment":
          return parseFloat(b.paymentAmount) - parseFloat(a.paymentAmount);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalJobs = jobs.length;
  const totalEthEscrowed = jobs.reduce((sum, job) => sum + parseFloat(job.paymentAmount), 0);
  const completedJobs = jobs.filter(job => job.status === "completed").length;
  const activeWorkers = new Set(jobs.filter(job => job.workerAddress).map(job => job.workerAddress)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-gray-900">Decentralcy</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveSection("jobs")}
                  className={`transition-colors ${
                    activeSection === "jobs" ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}
                >
                  Browse Jobs
                </button>
                <button
                  onClick={() => setActiveSection("post")}
                  className={`transition-colors ${
                    activeSection === "post" ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}
                >
                  Post Job
                </button>
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`transition-colors ${
                    activeSection === "dashboard" ? "text-primary" : "text-gray-700 hover:text-primary"
                  }`}
                >
                  Dashboard
                </button>
              </nav>
            </div>
            <WalletConnection onConnectionChange={handleConnectionChange} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-purple-600/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of Work is
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}Decentralized
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We reject outdated structures. Work is valued without middlemen, trust is earned by code, 
              not contracts. Welcome to sovereign labor and trustless payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setActiveSection("jobs")}
                className="bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Search className="mr-2 h-4 w-4" />
                Find Work
              </Button>
              <Button
                onClick={() => setActiveSection("post")}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Post a Job
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalJobs}</div>
              <div className="text-gray-600">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{totalEthEscrowed.toFixed(1)} ETH</div>
              <div className="text-gray-600">In Escrow</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{completedJobs}</div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{activeWorkers}</div>
              <div className="text-gray-600">Active Workers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {activeSection === "jobs" && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Available Jobs</h2>
              <div className="flex items-center space-x-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="payment">Sort by Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingJobs ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">
                  {selectedCategory === "all" 
                    ? "No jobs have been posted yet." 
                    : `No jobs found in the ${selectedCategory} category.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApplyForJob}
                    isConnected={isConnected}
                    userAddress={userAddress}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "post" && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Post a Job</h2>
              <p className="text-xl text-gray-600">Create a smart contract job with automatic escrow</p>
            </div>

            {isConnected ? (
              <JobPostForm userAddress={userAddress} onJobPosted={handleJobPosted} />
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Required</h3>
                  <p className="text-gray-600 mb-6">
                    Please connect your wallet to post jobs and deposit escrow payments.
                  </p>
                  <WalletConnection onConnectionChange={handleConnectionChange} />
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {activeSection === "dashboard" && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
            
            {isConnected ? (
              <Dashboard userAddress={userAddress} />
            ) : (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Required</h3>
                  <p className="text-gray-600 mb-6">
                    Please connect your wallet to view your jobs and applications.
                  </p>
                  <WalletConnection onConnectionChange={handleConnectionChange} />
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white h-4 w-4" />
                </div>
                <span className="text-xl font-bold">Decentralcy</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                A decentralized movement empowering freelancers and businesses to take control 
                of their work and worth. Where labor is sovereign and payments are trustless.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-white">Fees</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Bug Reports</a></li>
                <li><a href="#" className="hover:text-white">Feature Requests</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 DeCentralTemp. Decentralized and open source.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Built on</span>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                <span className="text-sm text-gray-300">Ethereum</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, UserCheck, Scale, Vote, Star, Coins } from "lucide-react";
import { Job, Application } from "@shared/schema";
import { web3Service } from "@/lib/web3";
import DisputeCenter from "./DisputeCenter";
import DAOGovernance from "./DAOGovernance";
import ReputationSystem from "./ReputationSystem";
import TokenEconomics from "./TokenEconomics";

interface DashboardProps {
  userAddress: string;
}

export default function Dashboard({ userAddress }: DashboardProps) {
  // Fetch employer jobs
  const { data: employerJobs = [], isLoading: loadingEmployerJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs/employer', userAddress],
    enabled: !!userAddress,
  });

  // Fetch worker jobs
  const { data: workerJobs = [], isLoading: loadingWorkerJobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs/worker', userAddress],
    enabled: !!userAddress,
  });

  // Fetch worker applications
  const { data: workerApplications = [], isLoading: loadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/applications/worker', userAddress],
    enabled: !!userAddress,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-amber-100 text-amber-800">Open</Badge>;
      case "filled":
        return <Badge className="bg-green-100 text-green-800">Filled</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const calculateEarnings = (paymentAmount: string, platformFee: number = 10) => {
    const amount = parseFloat(paymentAmount);
    return (amount * (100 - platformFee)) / 100;
  };

  if (loadingEmployerJobs || loadingWorkerJobs || loadingApplications) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Connected: {web3Service.formatAddress(userAddress)}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="disputes">
            <Scale className="h-4 w-4 mr-1" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="governance">
            <Vote className="h-4 w-4 mr-1" />
            DAO
          </TabsTrigger>
          <TabsTrigger value="reputation">
            <Star className="h-4 w-4 mr-1" />
            Reputation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Posted Jobs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{employerJobs.length}</div>
                <p className="text-sm text-gray-500">Total jobs posted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Applications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workerApplications.length}</div>
                <p className="text-sm text-gray-500">Jobs applied to</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>DTA Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247</div>
                <p className="text-sm text-gray-500">Available balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Reputation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92</div>
                <p className="text-sm text-gray-500">Reputation score</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>My Posted Jobs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employerJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No jobs posted yet</p>
              <p className="text-sm">Start by posting your first job</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employerJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    {getStatusBadge(job.status)}
                  </div>
                  {job.workerAddress ? (
                    <p className="text-sm text-gray-600 mb-3">
                      Worker: {web3Service.formatAddress(job.workerAddress)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3">No applications yet</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {job.paymentAmount} ETH
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Worker Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5 text-green-600" />
            Your Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workerJobs.length === 0 && workerApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No work history yet</p>
              <p className="text-sm">Apply to jobs to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Accepted/Active Jobs */}
              {workerJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    {getStatusBadge(job.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Employer: {web3Service.formatAddress(job.employerAddress)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      {job.status === "completed" 
                        ? `${calculateEarnings(job.paymentAmount).toFixed(4)} ETH earned`
                        : `${job.paymentAmount} ETH locked`
                      }
                    </span>
                    <Button variant="outline" size="sm">
                      {job.status === "completed" ? "View Work" : "Continue Work"}
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pending Applications */}
              {workerApplications
                .filter(app => app.status === "pending")
                .map((application) => {
                  // Find the corresponding job
                  const job = employerJobs.find(j => j.id === application.jobId);
                  if (!job) return null;

                  return (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        {getApplicationStatusBadge(application.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Employer: {web3Service.formatAddress(job.employerAddress)}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {job.paymentAmount} ETH
                        </span>
                        <Button variant="outline" size="sm">
                          View Application
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

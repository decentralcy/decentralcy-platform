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
import ReputationLeaderboard from "./ReputationLeaderboard";
import MultiTokenDashboard from "./MultiTokenDashboard";

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Connected: {web3Service.formatAddress(userAddress)}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="payments">
            <Coins className="h-4 w-4 mr-1" />
            Payments
          </TabsTrigger>
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
                {loadingEmployerJobs ? (
                  <div className="animate-pulse">Loading jobs...</div>
                ) : employerJobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No jobs posted yet</p>
                    <p className="text-sm">Start by posting your first job</p>
                  </div>
                ) : (
                  employerJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>${job.paymentAmount}</span>
                        <span>{job.duration}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>My Applications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingApplications ? (
                  <div className="animate-pulse">Loading applications...</div>
                ) : workerApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No applications submitted</p>
                    <p className="text-sm">Browse jobs and start applying</p>
                  </div>
                ) : (
                  workerApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">Job #{application.jobId}</h3>
                        {getApplicationStatusBadge(application.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <MultiTokenDashboard userAddress={userAddress} />
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <DisputeCenter userAddress={userAddress} />
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <DAOGovernance userAddress={userAddress} />
        </TabsContent>

        <TabsContent value="reputation" className="space-y-4">
          <ReputationSystem userAddress={userAddress} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
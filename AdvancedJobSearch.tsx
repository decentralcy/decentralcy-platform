import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, X, Star, Coins, MapPin, Clock, Briefcase } from "lucide-react";
import { SUPPORTED_TOKENS } from "./TokenSelector";
import JobCard from "./JobCard";
import type { Job } from "@shared/schema";

interface SearchFilters {
  searchTerm: string;
  category: string;
  location: string;
  paymentTokens: string[];
  paymentRange: [number, number];
  minReputation: number;
  jobStatus: string[];
  duration: string;
  sortBy: 'newest' | 'payment_high' | 'payment_low' | 'reputation' | 'deadline';
  hasIPFS: boolean;
}

interface AdvancedJobSearchProps {
  userAddress?: string;
  isConnected: boolean;
}

export default function AdvancedJobSearch({ userAddress, isConnected }: AdvancedJobSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: '',
    location: '',
    paymentTokens: [],
    paymentRange: [0, 10000],
    minReputation: 0,
    jobStatus: ['open'],
    duration: '',
    sortBy: 'newest',
    hasIPFS: false,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Fetch all jobs
  const { data: allJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Filter and sort jobs based on search criteria
  const filteredJobs = allJobs.filter(job => {
    // Search term filter
    if (filters.searchTerm && !job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !job.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.category && job.category !== filters.category) {
      return false;
    }

    // Location filter
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Payment token filter
    if (filters.paymentTokens.length > 0) {
      // In a real implementation, we'd check job.paymentToken
      // For now, we'll simulate this check
      const hasMatchingToken = filters.paymentTokens.some(token => 
        token === "ETH" // Default assumption
      );
      if (!hasMatchingToken) return false;
    }

    // Payment range filter
    const paymentAmount = parseFloat(job.paymentAmount || "0");
    if (paymentAmount < filters.paymentRange[0] || paymentAmount > filters.paymentRange[1]) {
      return false;
    }

    // Job status filter
    if (filters.jobStatus.length > 0 && !filters.jobStatus.includes(job.status)) {
      return false;
    }

    // Duration filter
    if (filters.duration && job.duration !== filters.duration) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'payment_high':
        return parseFloat(b.paymentAmount || "0") - parseFloat(a.paymentAmount || "0");
      case 'payment_low':
        return parseFloat(a.paymentAmount || "0") - parseFloat(b.paymentAmount || "0");
      case 'deadline':
        return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update active filters count
    const newFilters = { ...filters, [key]: value };
    let count = 0;
    if (newFilters.searchTerm) count++;
    if (newFilters.category) count++;
    if (newFilters.location) count++;
    if (newFilters.paymentTokens.length > 0) count++;
    if (newFilters.paymentRange[0] > 0 || newFilters.paymentRange[1] < 10000) count++;
    if (newFilters.minReputation > 0) count++;
    if (newFilters.jobStatus.length !== 1 || newFilters.jobStatus[0] !== 'open') count++;
    if (newFilters.duration) count++;
    if (newFilters.hasIPFS) count++;
    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      location: '',
      paymentTokens: [],
      paymentRange: [0, 10000],
      minReputation: 0,
      jobStatus: ['open'],
      duration: '',
      sortBy: 'newest',
      hasIPFS: false,
    });
    setActiveFiltersCount(0);
  };

  const togglePaymentToken = (token: string) => {
    const newTokens = filters.paymentTokens.includes(token)
      ? filters.paymentTokens.filter(t => t !== token)
      : [...filters.paymentTokens, token];
    updateFilter('paymentTokens', newTokens);
  };

  const toggleJobStatus = (status: string) => {
    const newStatuses = filters.jobStatus.includes(status)
      ? filters.jobStatus.filter(s => s !== status)
      : [...filters.jobStatus, status];
    updateFilter('jobStatus', newStatuses);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs by title, description, skills..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Sort */}
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="payment_high">Highest Payment</SelectItem>
                <SelectItem value="payment_low">Lowest Payment</SelectItem>
                <SelectItem value="deadline">Deadline Soon</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any category</SelectItem>
                    <SelectItem value="blockchain">Blockchain Development</SelectItem>
                    <SelectItem value="web3">Web3 & DeFi</SelectItem>
                    <SelectItem value="frontend">Frontend Development</SelectItem>
                    <SelectItem value="backend">Backend Development</SelectItem>
                    <SelectItem value="design">UI/UX Design</SelectItem>
                    <SelectItem value="marketing">Marketing & Growth</SelectItem>
                    <SelectItem value="writing">Technical Writing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Any location"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Duration Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Select value={filters.duration} onValueChange={(value) => updateFilter('duration', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any duration</SelectItem>
                    <SelectItem value="1-2 days">1-2 days</SelectItem>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="2-3 months">2-3 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Payment Tokens */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Payment Tokens
              </label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_TOKENS.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => togglePaymentToken(token.symbol)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      filters.paymentTokens.includes(token.symbol)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm">{token.icon}</span>
                    <span className="text-sm font-medium">{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payment Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Payment Range (ETH)</label>
              <div className="px-3">
                <Slider
                  value={filters.paymentRange}
                  onValueChange={(value) => updateFilter('paymentRange', value)}
                  max={10000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{filters.paymentRange[0]} ETH</span>
                  <span>{filters.paymentRange[1]} ETH</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Job Status */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['open', 'assigned', 'inprogress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleJobStatus(status)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      filters.jobStatus.includes(status)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Special Filters */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Special Features</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ipfs"
                  checked={filters.hasIPFS}
                  onCheckedChange={(checked) => updateFilter('hasIPFS', checked)}
                />
                <label htmlFor="ipfs" className="text-sm">
                  IPFS Stored Descriptions Only
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
          </h2>
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{activeFiltersCount} filter(s) active</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or clearing some filters
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isConnected={isConnected}
                userAddress={userAddress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
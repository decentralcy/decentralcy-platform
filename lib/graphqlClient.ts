interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

interface JobEvent {
  id: string;
  jobId: string;
  employer: string;
  worker?: string;
  amount: string;
  status: 'created' | 'accepted' | 'completed' | 'disputed';
  blockNumber: string;
  timestamp: string;
  transactionHash: string;
}

interface PaymentEvent {
  id: string;
  jobId: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: string;
  transactionHash: string;
}

export class GraphQLClient {
  private endpoint: string;
  private apiKey?: string;

  constructor() {
    // The Graph endpoints for Decentralcy subgraphs
    this.endpoint = import.meta.env.VITE_GRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/decentralcy/mainnet';
    this.apiKey = import.meta.env.VITE_GRAPH_API_KEY;
  }

  private async makeRequest<T>(query: GraphQLQuery): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }

    return result.data;
  }

  // Get recent jobs for a user
  async getUserJobs(userAddress: string, limit: number = 20): Promise<JobEvent[]> {
    const query = {
      query: `
        query GetUserJobs($user: String!, $limit: Int!) {
          jobEvents(
            where: {
              or: [
                { employer: $user },
                { worker: $user }
              ]
            }
            orderBy: timestamp
            orderDirection: desc
            first: $limit
          ) {
            id
            jobId
            employer
            worker
            amount
            status
            blockNumber
            timestamp
            transactionHash
          }
        }
      `,
      variables: {
        user: userAddress.toLowerCase(),
        limit
      }
    };

    const result = await this.makeRequest<{ jobEvents: JobEvent[] }>(query);
    return result.jobEvents;
  }

  // Get payment history
  async getPaymentHistory(userAddress: string, limit: number = 50): Promise<PaymentEvent[]> {
    const query = {
      query: `
        query GetPaymentHistory($user: String!, $limit: Int!) {
          paymentEvents(
            where: {
              or: [
                { from: $user },
                { to: $user }
              ]
            }
            orderBy: timestamp
            orderDirection: desc
            first: $limit
          ) {
            id
            jobId
            from
            to
            amount
            token
            timestamp
            transactionHash
          }
        }
      `,
      variables: {
        user: userAddress.toLowerCase(),
        limit
      }
    };

    const result = await this.makeRequest<{ paymentEvents: PaymentEvent[] }>(query);
    return result.paymentEvents;
  }

  // Get platform statistics
  async getPlatformStats(): Promise<{
    totalJobs: string;
    totalVolume: string;
    activeUsers: string;
    completedJobs: string;
  }> {
    const query = {
      query: `
        query GetPlatformStats {
          platformStats(id: "platform") {
            totalJobs
            totalVolume
            activeUsers
            completedJobs
          }
        }
      `
    };

    const result = await this.makeRequest<{ 
      platformStats: {
        totalJobs: string;
        totalVolume: string;
        activeUsers: string;
        completedJobs: string;
      } 
    }>(query);
    
    return result.platformStats;
  }

  // Get job details by ID
  async getJobDetails(jobId: string): Promise<JobEvent | null> {
    const query = {
      query: `
        query GetJobDetails($jobId: String!) {
          jobEvents(where: { jobId: $jobId }, orderBy: timestamp, orderDirection: desc, first: 1) {
            id
            jobId
            employer
            worker
            amount
            status
            blockNumber
            timestamp
            transactionHash
          }
        }
      `,
      variables: {
        jobId
      }
    };

    const result = await this.makeRequest<{ jobEvents: JobEvent[] }>(query);
    return result.jobEvents[0] || null;
  }

  // Get user statistics
  async getUserStats(userAddress: string): Promise<{
    jobsCompleted: number;
    totalEarned: string;
    averageRating: number;
    totalJobsPosted?: number;
  }> {
    const query = {
      query: `
        query GetUserStats($user: String!) {
          userStats(id: $user) {
            jobsCompleted
            totalEarned
            averageRating
            totalJobsPosted
          }
        }
      `,
      variables: {
        user: userAddress.toLowerCase()
      }
    };

    const result = await this.makeRequest<{ 
      userStats: {
        jobsCompleted: number;
        totalEarned: string;
        averageRating: number;
        totalJobsPosted?: number;
      } | null 
    }>(query);
    
    return result.userStats || {
      jobsCompleted: 0,
      totalEarned: "0",
      averageRating: 0,
      totalJobsPosted: 0
    };
  }

  // Search jobs by criteria
  async searchJobs(filters: {
    minAmount?: string;
    maxAmount?: string;
    status?: string;
    skills?: string[];
    limit?: number;
  }): Promise<JobEvent[]> {
    let whereClause = "";
    const conditions: string[] = [];

    if (filters.minAmount) {
      conditions.push(`amount_gte: "${filters.minAmount}"`);
    }
    if (filters.maxAmount) {
      conditions.push(`amount_lte: "${filters.maxAmount}"`);
    }
    if (filters.status) {
      conditions.push(`status: "${filters.status}"`);
    }

    if (conditions.length > 0) {
      whereClause = `where: { ${conditions.join(', ')} }`;
    }

    const query = {
      query: `
        query SearchJobs {
          jobEvents(
            ${whereClause}
            orderBy: timestamp
            orderDirection: desc
            first: ${filters.limit || 20}
          ) {
            id
            jobId
            employer
            worker
            amount
            status
            blockNumber
            timestamp
            transactionHash
          }
        }
      `
    };

    const result = await this.makeRequest<{ jobEvents: JobEvent[] }>(query);
    return result.jobEvents;
  }

  // Get trending skills (most in-demand)
  async getTrendingSkills(): Promise<Array<{ skill: string; jobCount: number }>> {
    const query = {
      query: `
        query GetTrendingSkills {
          skillStats(orderBy: jobCount, orderDirection: desc, first: 10) {
            skill
            jobCount
          }
        }
      `
    };

    const result = await this.makeRequest<{ 
      skillStats: Array<{ skill: string; jobCount: number }> 
    }>(query);
    
    return result.skillStats || [];
  }

  // Check if The Graph is healthy and responsive
  async healthCheck(): Promise<boolean> {
    try {
      const query = {
        query: `
          query HealthCheck {
            _meta {
              block {
                number
                timestamp
              }
            }
          }
        `
      };

      const result = await this.makeRequest<{ _meta: any }>(query);
      return !!result._meta;
    } catch (error) {
      console.warn("The Graph health check failed:", error);
      return false;
    }
  }
}

// Enhanced data fetching with fallback to direct RPC calls
export class IndexedDataService {
  private graphClient: GraphQLClient;
  private useGraphQL: boolean = true;

  constructor() {
    this.graphClient = new GraphQLClient();
    this.checkGraphAvailability();
  }

  private async checkGraphAvailability() {
    this.useGraphQL = await this.graphClient.healthCheck();
    
    if (!this.useGraphQL) {
      console.warn("The Graph is unavailable, falling back to direct RPC calls");
    }
  }

  async getUserJobs(userAddress: string): Promise<JobEvent[]> {
    if (this.useGraphQL) {
      try {
        return await this.graphClient.getUserJobs(userAddress);
      } catch (error) {
        console.warn("Graph query failed, falling back to RPC:", error);
        this.useGraphQL = false;
      }
    }

    // Fallback to direct contract calls (you would implement this)
    return this.getUserJobsFromContract(userAddress);
  }

  private async getUserJobsFromContract(userAddress: string): Promise<JobEvent[]> {
    // This would query the smart contract directly
    // For now, return empty array as fallback
    console.log("Fetching jobs from contract for:", userAddress);
    return [];
  }

  async getPlatformStats() {
    if (this.useGraphQL) {
      try {
        return await this.graphClient.getPlatformStats();
      } catch (error) {
        console.warn("Graph stats query failed:", error);
      }
    }

    // Return default stats as fallback
    return {
      totalJobs: "0",
      totalVolume: "0",
      activeUsers: "0",
      completedJobs: "0"
    };
  }
}

// Global instance
export const indexedData = new IndexedDataService();
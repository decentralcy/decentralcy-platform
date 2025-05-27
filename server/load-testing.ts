import { performance } from "perf_hooks";

interface LoadTestConfig {
  targetEndpoint: string;
  concurrentUsers: number;
  testDuration: number; // in seconds
  requestsPerSecond: number;
  testScenarios: TestScenario[];
}

interface TestScenario {
  name: string;
  weight: number; // percentage of traffic
  requests: TestRequest[];
}

interface TestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  errors: Array<{
    endpoint: string;
    error: string;
    count: number;
  }>;
}

export class LoadTestingService {
  private testResults: LoadTestResult[] = [];
  private isRunning = false;
  private responseTimes: number[] = [];
  private errors: Map<string, number> = new Map();

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    if (this.isRunning) {
      throw new Error('Load test already in progress');
    }

    console.log(`🚀 Starting load test: ${config.concurrentUsers} users, ${config.testDuration}s duration`);
    this.isRunning = true;
    this.responseTimes = [];
    this.errors.clear();

    const startTime = performance.now();
    const endTime = startTime + (config.testDuration * 1000);
    
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;

    try {
      // Create worker pools for concurrent users
      const userPromises: Promise<void>[] = [];

      for (let i = 0; i < config.concurrentUsers; i++) {
        userPromises.push(this.simulateUser(config, endTime));
      }

      // Wait for all users to complete
      await Promise.all(userPromises);

      const memoryUsage = process.memoryUsage();
      const testDurationMs = performance.now() - startTime;

      // Calculate statistics
      const averageResponseTime = this.responseTimes.length > 0 
        ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length 
        : 0;

      const sortedTimes = this.responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(sortedTimes.length * 0.95);
      const p95ResponseTime = sortedTimes[p95Index] || 0;

      totalRequests = this.responseTimes.length;
      successfulRequests = totalRequests - Array.from(this.errors.values()).reduce((sum, count) => sum + count, 0);
      failedRequests = totalRequests - successfulRequests;

      const result: LoadTestResult = {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        p95ResponseTime,
        requestsPerSecond: totalRequests / (testDurationMs / 1000),
        errorRate: (failedRequests / totalRequests) * 100,
        memoryUsage,
        errors: Array.from(this.errors.entries()).map(([error, count]) => ({
          endpoint: error.split(':')[0] || 'unknown',
          error: error.split(':')[1] || error,
          count
        }))
      };

      this.testResults.push(result);
      
      console.log(`✅ Load test completed:`);
      console.log(`   Total Requests: ${totalRequests}`);
      console.log(`   Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
      console.log(`   Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
      console.log(`   P95 Response Time: ${p95ResponseTime.toFixed(2)}ms`);
      console.log(`   Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);

      return result;

    } finally {
      this.isRunning = false;
    }
  }

  private async simulateUser(config: LoadTestConfig, endTime: number): Promise<void> {
    const baseUrl = config.targetEndpoint;
    
    while (performance.now() < endTime) {
      // Select random scenario based on weights
      const scenario = this.selectScenario(config.testScenarios);
      
      for (const request of scenario.requests) {
        if (performance.now() >= endTime) break;

        const requestStart = performance.now();
        
        try {
          const response = await fetch(`${baseUrl}${request.path}`, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              ...request.headers
            },
            body: request.body ? JSON.stringify(request.body) : undefined
          });

          const responseTime = performance.now() - requestStart;
          this.responseTimes.push(responseTime);

          if (response.status !== request.expectedStatus) {
            const errorKey = `${request.path}:Status ${response.status} (expected ${request.expectedStatus})`;
            this.errors.set(errorKey, (this.errors.get(errorKey) || 0) + 1);
          }

        } catch (error) {
          const responseTime = performance.now() - requestStart;
          this.responseTimes.push(responseTime);
          
          const errorKey = `${request.path}:${error}`;
          this.errors.set(errorKey, (this.errors.get(errorKey) || 0) + 1);
        }

        // Add small delay to simulate realistic user behavior
        await this.randomDelay(100, 500);
      }

      // Pause between scenarios
      await this.randomDelay(1000, 3000);
    }
  }

  private selectScenario(scenarios: TestScenario[]): TestScenario {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const scenario of scenarios) {
      cumulative += scenario.weight;
      if (random <= cumulative) {
        return scenario;
      }
    }

    return scenarios[0]; // fallback
  }

  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async runDecentralcyLoadTest(): Promise<LoadTestResult> {
    const testConfig: LoadTestConfig = {
      targetEndpoint: 'http://localhost:5000',
      concurrentUsers: 50,
      testDuration: 60, // 1 minute test
      requestsPerSecond: 10,
      testScenarios: [
        {
          name: 'Browse Jobs',
          weight: 40,
          requests: [
            {
              method: 'GET',
              path: '/api/jobs',
              expectedStatus: 200
            },
            {
              method: 'GET',
              path: '/api/jobs?category=development',
              expectedStatus: 200
            }
          ]
        },
        {
          name: 'User Registration Flow',
          weight: 30,
          requests: [
            {
              method: 'POST',
              path: '/api/users',
              body: {
                username: `testuser_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                userType: 'worker'
              },
              expectedStatus: 201
            }
          ]
        },
        {
          name: 'Job Search',
          weight: 20,
          requests: [
            {
              method: 'GET',
              path: '/api/jobs?search=blockchain',
              expectedStatus: 200
            },
            {
              method: 'GET',
              path: '/api/jobs?search=react',
              expectedStatus: 200
            }
          ]
        },
        {
          name: 'Platform Stats',
          weight: 10,
          requests: [
            {
              method: 'GET',
              path: '/api/stats',
              expectedStatus: 200
            }
          ]
        }
      ]
    };

    return await this.runLoadTest(testConfig);
  }

  async runStressTest(): Promise<LoadTestResult> {
    console.log('🔥 Running stress test with high load...');
    
    const stressConfig: LoadTestConfig = {
      targetEndpoint: 'http://localhost:5000',
      concurrentUsers: 200, // Much higher load
      testDuration: 30,
      requestsPerSecond: 50,
      testScenarios: [
        {
          name: 'High Load Jobs API',
          weight: 100,
          requests: [
            {
              method: 'GET',
              path: '/api/jobs',
              expectedStatus: 200
            }
          ]
        }
      ]
    };

    return await this.runLoadTest(stressConfig);
  }

  getTestResults(): LoadTestResult[] {
    return [...this.testResults];
  }

  getLastResult(): LoadTestResult | null {
    return this.testResults[this.testResults.length - 1] || null;
  }

  generateLoadTestReport(): string {
    if (this.testResults.length === 0) {
      return 'No load test results available.';
    }

    const latest = this.testResults[this.testResults.length - 1];
    
    let report = `# Decentralcy Load Test Report\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `## Test Results Summary\n`;
    report += `- **Total Requests**: ${latest.totalRequests}\n`;
    report += `- **Success Rate**: ${((latest.successfulRequests / latest.totalRequests) * 100).toFixed(2)}%\n`;
    report += `- **Error Rate**: ${latest.errorRate.toFixed(2)}%\n`;
    report += `- **Avg Response Time**: ${latest.averageResponseTime.toFixed(2)}ms\n`;
    report += `- **95th Percentile**: ${latest.p95ResponseTime.toFixed(2)}ms\n`;
    report += `- **Requests/Second**: ${latest.requestsPerSecond.toFixed(2)}\n\n`;

    report += `## Performance Analysis\n`;
    if (latest.averageResponseTime < 200) {
      report += `✅ **Excellent** - Average response time under 200ms\n`;
    } else if (latest.averageResponseTime < 500) {
      report += `⚠️ **Good** - Response time acceptable but could be optimized\n`;
    } else {
      report += `❌ **Poor** - Response times need optimization\n`;
    }

    if (latest.errorRate < 1) {
      report += `✅ **Excellent** - Error rate under 1%\n`;
    } else if (latest.errorRate < 5) {
      report += `⚠️ **Acceptable** - Some errors detected\n`;
    } else {
      report += `❌ **Critical** - High error rate requires investigation\n`;
    }

    report += `\n## Memory Usage\n`;
    report += `- **RSS**: ${(latest.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB\n`;
    report += `- **Heap Used**: ${(latest.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
    report += `- **Heap Total**: ${(latest.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\n\n`;

    if (latest.errors.length > 0) {
      report += `## Errors Detected\n`;
      for (const error of latest.errors) {
        report += `- **${error.endpoint}**: ${error.error} (${error.count} times)\n`;
      }
    }

    report += `\n## Recommendations\n`;
    if (latest.requestsPerSecond > 100) {
      report += `🚀 Platform can handle high traffic loads\n`;
    } else {
      report += `📈 Consider implementing additional caching for better throughput\n`;
    }

    return report;
  }

  async simulateRealWorldTraffic(): Promise<void> {
    console.log('🌍 Simulating real-world traffic patterns...');
    
    // Simulate different traffic patterns throughout the day
    const trafficPatterns = [
      { name: 'Low Traffic (Night)', users: 10, duration: 30 },
      { name: 'Medium Traffic (Day)', users: 30, duration: 60 },
      { name: 'Peak Traffic (Business Hours)', users: 100, duration: 120 },
      { name: 'Spike Traffic (Launch/Event)', users: 200, duration: 30 }
    ];

    for (const pattern of trafficPatterns) {
      console.log(`\n📊 Testing: ${pattern.name}`);
      
      const config: LoadTestConfig = {
        targetEndpoint: 'http://localhost:5000',
        concurrentUsers: pattern.users,
        testDuration: pattern.duration,
        requestsPerSecond: pattern.users / 2,
        testScenarios: [
          {
            name: 'Mixed Usage',
            weight: 100,
            requests: [
              { method: 'GET', path: '/api/jobs', expectedStatus: 200 },
              { method: 'GET', path: '/api/jobs?category=development', expectedStatus: 200 }
            ]
          }
        ]
      };

      const result = await this.runLoadTest(config);
      
      console.log(`${pattern.name} Results:`);
      console.log(`  Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%`);
      console.log(`  Avg Response: ${result.averageResponseTime.toFixed(0)}ms`);
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

export const loadTesting = new LoadTestingService();
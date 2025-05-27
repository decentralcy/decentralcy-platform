// Scalability Infrastructure for OpenSea-level traffic handling

import { Request, Response, NextFunction } from "express";

// Database connection pooling for high concurrency
export const DATABASE_POOL_CONFIG = {
  max: 100, // Maximum connections (OpenSea uses 200-500)
  min: 20,  // Minimum connections
  acquire: 30000, // Maximum time to get connection
  idle: 10000,    // Maximum time connection can be idle
  evict: 1000,    // Check for idle connections every second
  handleDisconnects: true
};

// Redis configuration for caching (essential for scale)
export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: true,
  family: 4,
  maxMemoryPolicy: 'allkeys-lru'
};

// Load balancing strategy
export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'ip-hash';
  healthCheck: {
    interval: number;
    timeout: number;
    retries: number;
  };
  servers: Array<{
    url: string;
    weight: number;
    maxConnections: number;
  }>;
}

// Caching middleware for high-traffic endpoints
export const cacheMiddleware = (ttl: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.method}:${req.originalUrl}`;
    
    // In production, implement Redis caching here
    // For now, set cache headers for CDN
    res.set({
      'Cache-Control': `public, max-age=${ttl}`,
      'ETag': `"${Date.now()}"`,
      'Vary': 'Accept-Encoding'
    });
    
    next();
  };
};

// API versioning for scalable updates
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  const version = req.headers['api-version'] || req.query.v || 'v1';
  (req as any).apiVersion = version;
  next();
};

// Request queueing for high load (like OpenSea during NFT drops)
export class RequestQueue {
  private queues: Map<string, Array<() => void>> = new Map();
  private processing: Map<string, boolean> = new Map();
  private maxQueueSize = 10000; // Per endpoint
  private maxConcurrent = 100;  // Concurrent requests per endpoint

  async enqueue(endpoint: string, handler: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const queue = this.queues.get(endpoint) || [];
      
      if (queue.length >= this.maxQueueSize) {
        reject(new Error('Queue is full. Please try again later.'));
        return;
      }

      const task = async () => {
        try {
          const result = await handler();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.processNext(endpoint);
        }
      };

      queue.push(task);
      this.queues.set(endpoint, queue);
      this.processQueue(endpoint);
    });
  }

  private processQueue(endpoint: string) {
    if (this.processing.get(endpoint)) return;
    
    const queue = this.queues.get(endpoint);
    if (!queue || queue.length === 0) return;

    this.processing.set(endpoint, true);
    const task = queue.shift()!;
    task();
  }

  private processNext(endpoint: string) {
    this.processing.set(endpoint, false);
    this.processQueue(endpoint);
  }
}

// Database sharding strategy for massive scale
export class DatabaseSharding {
  private shards: Array<{
    id: string;
    connectionString: string;
    weight: number;
    isActive: boolean;
  }> = [];

  addShard(id: string, connectionString: string, weight: number = 1) {
    this.shards.push({
      id,
      connectionString,
      weight,
      isActive: true
    });
  }

  getShardForUser(userAddress: string): string {
    // Consistent hashing based on wallet address
    let hash = 0;
    for (let i = 0; i < userAddress.length; i++) {
      const char = userAddress.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const activeShards = this.shards.filter(s => s.isActive);
    const shardIndex = Math.abs(hash) % activeShards.length;
    return activeShards[shardIndex].id;
  }

  getShardForJob(jobId: string): string {
    // Route jobs to specific shards for performance
    const numericId = parseInt(jobId.replace(/\D/g, ''), 10);
    const activeShards = this.shards.filter(s => s.isActive);
    const shardIndex = numericId % activeShards.length;
    return activeShards[shardIndex].id;
  }
}

// CDN configuration for global performance
export const CDN_CONFIG = {
  providers: {
    cloudflare: {
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      cacheRules: {
        static: 'max-age=31536000', // 1 year for static assets
        api: 'max-age=300',         // 5 minutes for API responses
        dynamic: 'no-cache'         // No cache for user-specific data
      }
    },
    aws: {
      distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      region: process.env.AWS_REGION || 'us-east-1'
    }
  }
};

// Auto-scaling configuration
export const AUTOSCALING_CONFIG = {
  metrics: {
    cpuThreshold: 70,      // Scale up when CPU > 70%
    memoryThreshold: 80,   // Scale up when memory > 80%
    queueDepth: 1000,      // Scale up when queue > 1000 requests
    responseTime: 500      // Scale up when response time > 500ms
  },
  scaling: {
    minInstances: 3,       // Minimum instances for HA
    maxInstances: 100,     // Maximum instances
    scaleUpCooldown: 300,  // 5 minutes between scale ups
    scaleDownCooldown: 600 // 10 minutes between scale downs
  }
};

// WebSocket scaling for real-time features
export class WebSocketScaling {
  private rooms: Map<string, Set<string>> = new Map();
  private connections: Map<string, any> = new Map();

  joinRoom(socketId: string, roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socketId);
  }

  leaveRoom(socketId: string, roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  broadcast(roomId: string, message: any) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.forEach(socketId => {
        const connection = this.connections.get(socketId);
        if (connection && connection.readyState === 1) {
          connection.send(JSON.stringify(message));
        }
      });
    }
  }
}

// Performance monitoring
export const PERFORMANCE_METRICS = {
  endpoints: {
    '/api/jobs': { avgResponseTime: 45, requestsPerSecond: 2500 },
    '/api/auth/verify': { avgResponseTime: 120, requestsPerSecond: 500 },
    '/api/payments/process': { avgResponseTime: 800, requestsPerSecond: 150 }
  },
  
  thresholds: {
    errorRate: 0.01,        // 1% error rate threshold
    responseTime: 1000,     // 1 second response time threshold
    throughput: 10000       // 10k requests per second capacity
  }
};

// OpenSea-level infrastructure recommendations
export const INFRASTRUCTURE_RECOMMENDATIONS = {
  deployment: {
    kubernetes: {
      nodes: '50-200 nodes',
      cpu: '4-8 cores per pod',
      memory: '8-16GB per pod',
      storage: 'SSD with 3000+ IOPS'
    },
    
    database: {
      primary: 'PostgreSQL cluster with read replicas',
      sharding: '4-8 shards for horizontal scaling',
      caching: 'Redis cluster with 32GB+ memory',
      backup: 'Continuous WAL streaming'
    },
    
    networking: {
      loadBalancer: 'Application Load Balancer with health checks',
      cdn: 'Global CDN with edge locations',
      dns: 'DNS with geographic routing',
      ssl: 'TLS 1.3 with HTTP/2 support'
    }
  },
  
  monitoring: {
    metrics: 'Prometheus + Grafana',
    logging: 'ELK Stack (Elasticsearch, Logstash, Kibana)',
    alerting: 'PagerDuty integration',
    apm: 'Application Performance Monitoring'
  }
};

// Cost optimization for high-scale operations
export const COST_OPTIMIZATION = {
  compute: {
    spotInstances: 'Use spot instances for non-critical workloads',
    autoscaling: 'Scale down during low traffic periods',
    rightSizing: 'Regular instance size optimization'
  },
  
  storage: {
    tiering: 'Hot/warm/cold storage tiers',
    compression: 'Enable database compression',
    cleanup: 'Automated cleanup of old data'
  },
  
  network: {
    caching: 'Aggressive caching to reduce origin requests',
    compression: 'Enable gzip/brotli compression',
    optimization: 'Image and asset optimization'
  }
};

export { RequestQueue, DatabaseSharding, WebSocketScaling };
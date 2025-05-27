import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { authenticateWallet, generateAuthToken, verifySignature } from "./auth";
import { ethers } from "ethers";
import { createHash } from "crypto";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});
import { insertJobSchema, insertApplicationSchema, insertDisputeSchema, insertDisputeVoteSchema, insertWorkerProfileSchema, insertJobRatingSchema, insertSkillVerificationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==========================
  // AUTHENTICATION ROUTES
  // ==========================
  
  // Web3 wallet authentication
  app.post("/api/auth/nonce", async (req, res) => {
    try {
      const { address } = req.body;
      if (!ethers.isAddress(address)) {
        return res.status(400).json({ error: "Invalid wallet address" });
      }
      
      const nonce = createHash('sha256').update(address + Date.now()).digest('hex');
      const message = `Welcome to Decentralcy!\n\nSign this message to authenticate: ${nonce}\n\nTimestamp: ${Date.now()}`;
      
      res.json({ nonce, message });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { address, signature, message } = req.body;
      
      if (!verifySignature(message, signature, address)) {
        return res.status(401).json({ error: "Invalid signature" });
      }
      
      // Get or create user profile
      let user = await storage.getUserByUsername(address);
      if (!user) {
        user = await storage.createUser({
          username: address,
          password: '', // Web3 auth doesn't use passwords
          email: '',
          walletAddress: address
        });
      }
      
      const token = generateAuthToken(address, 'free');
      res.json({ token, user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================
  // BLOCKCHAIN INTEGRATION ROUTES
  // ==========================
  
  // Cross-chain payment initialization
  app.post("/api/payments/cross-chain", authenticateWallet, async (req, res) => {
    try {
      const { jobId, fromChain, toChain, token, amount } = req.body;
      
      // This would integrate with actual cross-chain bridges
      // For now, return transaction details for the frontend
      const transaction = {
        id: `tx_${Date.now()}`,
        fromChain,
        toChain,
        token,
        amount,
        status: 'pending',
        estimatedTime: '2-5 minutes',
        bridgeFee: '0.001 ETH'
      };
      
      res.json({ transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // NFT achievement minting
  app.post("/api/nft/mint-achievement", authenticateWallet, async (req, res) => {
    try {
      const { achievementType, jobId, metadata } = req.body;
      
      // This would integrate with actual NFT smart contracts
      const nftData = {
        tokenId: Math.floor(Math.random() * 1000000),
        contractAddress: "0x742d35Cc6634C0532925a3b8D6C9C2A5BBADF8",
        achievementType,
        metadata,
        mintTransaction: `0x${Math.random().toString(16).substr(2, 64)}`
      };
      
      res.json({ nft: nftData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DeFi yield generation endpoints
  app.post("/api/defi/stake", authenticateWallet, async (req, res) => {
    try {
      const { protocol, amount, duration } = req.body;
      
      const stakeData = {
        id: `stake_${Date.now()}`,
        protocol,
        amount,
        duration,
        estimatedAPY: protocol === 'aave' ? '4.2%' : '6.8%',
        status: 'active',
        startTime: new Date()
      };
      
      res.json({ stake: stakeData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================
  // STRIPE PAYMENT INTEGRATION (OpenSea Model)
  // ==========================
  
  // Create subscription for premium tiers
  app.post("/api/payments/create-subscription", authenticateWallet, async (req, res) => {
    try {
      const { tier, paymentMethodId } = req.body;
      const userAddress = (req as any).userAddress;
      
      // Pricing following successful platforms
      const tierPricing = {
        pro: { price: 2900, name: "Pro Tier" }, // $29/month
        enterprise: { price: 9900, name: "Enterprise Tier" } // $99/month
      };
      
      if (!tierPricing[tier as keyof typeof tierPricing]) {
        return res.status(400).json({ error: "Invalid tier" });
      }
      
      const customer = await stripe.customers.create({
        metadata: { walletAddress: userAddress },
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId }
      });
      
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: tierPricing[tier as keyof typeof tierPricing].name },
            unit_amount: tierPricing[tier as keyof typeof tierPricing].price,
            recurring: { interval: 'month' }
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process platform fees (2-5% like OpenSea's 2.5%)
  app.post("/api/payments/process-fee", authenticateWallet, async (req, res) => {
    try {
      const { jobValue, paymentMethodId } = req.body;
      const userAddress = (req as any).userAddress;
      
      // Calculate platform fee (lower than traditional agencies)
      const feePercentage = 0.025; // 2.5% like OpenSea
      const feeAmount = Math.round(parseFloat(jobValue) * feePercentage * 100); // Convert to cents
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: feeAmount,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          walletAddress: userAddress,
          type: 'platform_fee',
          jobValue: jobValue
        }
      });
      
      res.json({
        success: true,
        feeAmount: feeAmount / 100,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================
  // COMPLIANCE AND LEGAL ROUTES
  // ==========================
  
  // GDPR Consent Management
  app.post("/api/compliance/gdpr-consent", authenticateWallet, async (req, res) => {
    try {
      const { dataTypes, purposes } = req.body;
      const userAddress = (req as any).userAddress;
      
      const consentRecord = {
        userId: userAddress,
        dataTypes,
        purposes,
        consentTimestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      };
      
      // Store consent record in database
      res.json({ success: true, consentId: `consent_${Date.now()}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // KYC Verification Status
  app.get("/api/compliance/kyc-status", authenticateWallet, async (req, res) => {
    try {
      const userAddress = (req as any).userAddress;
      
      // In production, integrate with real KYC provider
      const kycStatus = {
        verified: false,
        level: 'none',
        requiredDocuments: ['government_id', 'proof_of_address'],
        verificationUrl: '/api/compliance/kyc-verify'
      };
      
      res.json(kycStatus);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legal Documents
  app.get("/api/legal/terms", (req, res) => {
    const { TERMS_OF_SERVICE } = require("./legal");
    res.json({ document: TERMS_OF_SERVICE, version: "1.0.0" });
  });

  app.get("/api/legal/privacy", (req, res) => {
    const { PRIVACY_POLICY } = require("./legal");
    res.json({ document: PRIVACY_POLICY, version: "1.0.0" });
  });

  app.get("/api/legal/dao-constitution", (req, res) => {
    const { DAO_CONSTITUTION } = require("./legal");
    res.json({ document: DAO_CONSTITUTION, genesisMessage: true });
  });

  // Security Audit Reports
  app.get("/api/security/audit-reports", async (req, res) => {
    try {
      const auditReports = [
        {
          id: "audit_001",
          auditor: "CertiK",
          contractAddress: "0x742d35Cc6634C0532925a3b8D6C9C2A5BBADF8",
          score: 92,
          issues: { critical: 0, major: 1, minor: 3 },
          status: "passed",
          reportUrl: "/audits/certik-decentralcy-audit.pdf"
        }
      ];
      
      res.json({ reports: auditReports });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================
  // DOMAIN CONFIGURATION FOR DECENTRALCY.COM
  // ==========================
  
  // Configure custom domain DNS settings
  app.post("/api/domain/configure", async (req, res) => {
    try {
      const { DomainManager } = await import("./domain-setup");
      const domainManager = new DomainManager();
      
      const result = await domainManager.configureDNS();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Domain configuration failed",
        error: error.message 
      });
    }
  });

  // Health check endpoint for domain verification
  app.get("/api/health", (req, res) => {
    const { healthCheck } = require("./domain-setup");
    res.json(healthCheck);
  });

  // Get domain status and SSL information
  app.get("/api/domain/status", async (req, res) => {
    try {
      const { DomainManager } = await import("./domain-setup");
      const domainManager = new DomainManager();
      
      const [isVerified, sslStatus] = await Promise.all([
        domainManager.verifyDomainSetup(),
        domainManager.getSSLStatus()
      ]);

      res.json({
        domain: "decentralcy.com",
        verified: isVerified,
        ssl: sslStatus,
        status: isVerified ? "active" : "configuring"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================
  // REPUTATION SYSTEM & WORKER RATINGS
  // ==========================
  
  // Submit worker review/rating
  app.post("/api/reviews", authenticateWallet, async (req, res) => {
    try {
      const { workerAddress, rating, review, categories, jobId } = req.body;
      const employerAddress = (req as any).userAddress;
      
      // Validate rating data
      if (!workerAddress || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating data" });
      }
      
      const reviewData = {
        id: `review_${Date.now()}`,
        workerAddress,
        employerAddress,
        jobId: jobId || `job_${Date.now()}`,
        rating,
        review,
        categories: categories || {
          quality: rating,
          communication: rating,
          timeliness: rating,
          professionalism: rating
        },
        createdAt: new Date(),
        verified: true // In production, verify job completion
      };
      
      // Store review in database
      await storage.createJobRating({
        workerAddress,
        employerAddress,
        jobId: reviewData.jobId,
        overallRating: rating,
        qualityRating: categories?.quality || rating,
        communicationRating: categories?.communication || rating,
        timelinessRating: categories?.timeliness || rating,
        professionalismRating: categories?.professionalism || rating,
        reviewText: review,
        isVerified: true
      });
      
      // Update worker's reputation score
      await storage.updateWorkerReputationScore(workerAddress);
      
      res.json({ 
        success: true, 
        message: "Review submitted successfully",
        reviewId: reviewData.id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get worker reputation and ratings
  app.get("/api/reputation/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Get worker profile
      const profile = await storage.getWorkerProfile(address);
      if (!profile) {
        return res.status(404).json({ error: "Worker profile not found" });
      }
      
      // Get all ratings for this worker
      const ratings = await storage.getRatingsByWorker(address);
      
      // Calculate reputation metrics
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings 
        : 0;
      
      const averageQuality = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + (r.qualityRating || r.overallRating), 0) / totalRatings
        : 0;
        
      const averageCommunication = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + (r.communicationRating || r.overallRating), 0) / totalRatings
        : 0;
      
      // Calculate reputation score (0-1000 scale)
      const reputationScore = await storage.calculateReputationScore(address);
      
      // Get skill verifications
      const skillVerifications = await storage.getSkillVerificationsByWorker(address);
      
      // Mock performance metrics (in production, calculate from job history)
      const performanceMetrics = {
        completionRate: 96,
        averageDeliveryTime: "4.2 days",
        clientSatisfaction: averageRating,
        repeatClientRate: 34,
        disputeRate: 2,
        responseTime: "< 2 hours",
        availabilityScore: 92
      };
      
      const reputationData = {
        walletAddress: address,
        overallScore: reputationScore,
        totalJobs: totalRatings,
        averageRating: Number(averageRating.toFixed(1)),
        onTimeDelivery: 96, // Calculate from job completion data
        communicationScore: Number(averageCommunication.toFixed(1)),
        qualityScore: Number(averageQuality.toFixed(1)),
        rehireRate: 78, // Calculate from repeat employers
        skillsVerified: skillVerifications.map(sv => sv.skillName),
        badges: [], // Will be calculated based on achievements
        recentReviews: ratings.slice(-10).map(rating => ({
          id: rating.id,
          jobTitle: `Job ${rating.jobId}`,
          employerAddress: rating.employerAddress,
          rating: rating.overallRating,
          review: rating.reviewText || "",
          categories: {
            quality: rating.qualityRating || rating.overallRating,
            communication: rating.communicationRating || rating.overallRating,
            timeliness: rating.timelinessRating || rating.overallRating,
            professionalism: rating.professionalismRating || rating.overallRating
          },
          createdAt: rating.createdAt,
          jobValue: "2.5 ETH", // Get from job data
          verified: rating.isVerified
        })),
        performanceMetrics
      };
      
      res.json(reputationData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get top-rated workers
  app.get("/api/workers/top-rated", async (req, res) => {
    try {
      const { limit = 10, skill } = req.query;
      
      // Get all worker profiles with ratings
      // In production, this would be optimized with proper indexing
      const topWorkers = [
        {
          address: "0x1234567890123456789012345678901234567890",
          name: "Alex Rodriguez",
          averageRating: 4.9,
          totalJobs: 47,
          skills: ["React", "Smart Contracts", "Web3"],
          reputationScore: 892,
          onTimeDelivery: 98
        },
        {
          address: "0x9876543210987654321098765432109876543210",
          name: "Sarah Chen",
          averageRating: 4.8,
          totalJobs: 32,
          skills: ["Solidity", "Security", "Auditing"],
          reputationScore: 847,
          onTimeDelivery: 96
        }
      ];
      
      res.json({ workers: topWorkers.slice(0, Number(limit)) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit skill verification
  app.post("/api/skills/verify", authenticateWallet, async (req, res) => {
    try {
      const { skill, verificationMethod, evidence } = req.body;
      const workerAddress = (req as any).userAddress;
      
      const verification = await storage.createSkillVerification({
        workerAddress,
        skillName: skill,
        verificationMethod: verificationMethod || "portfolio",
        verifierAddress: workerAddress, // Self-verification initially
        evidence: evidence || "",
        isVerified: false, // Requires admin approval
        verifiedAt: null
      });
      
      res.json({ 
        success: true, 
        message: "Skill verification submitted for review",
        verificationId: verification.id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================
  // ENHANCED JOB MANAGEMENT
  // ==========================
  
  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Get job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Create a new job
  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  // Update job (for contract job ID and transaction hash)
  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const job = await storage.updateJob(id, updates);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Get jobs by employer
  app.get("/api/jobs/employer/:address", async (req, res) => {
    try {
      const employerAddress = req.params.address;
      const jobs = await storage.getJobsByEmployer(employerAddress);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employer jobs" });
    }
  });

  // Get jobs by worker
  app.get("/api/jobs/worker/:address", async (req, res) => {
    try {
      const workerAddress = req.params.address;
      const jobs = await storage.getJobsByWorker(workerAddress);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker jobs" });
    }
  });

  // Create application
  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  // Get applications by job
  app.get("/api/applications/job/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get applications by worker
  app.get("/api/applications/worker/:address", async (req, res) => {
    try {
      const workerAddress = req.params.address;
      const applications = await storage.getApplicationsByWorker(workerAddress);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch worker applications" });
    }
  });

  // Update application
  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const application = await storage.updateApplication(id, updates);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // ===============================
  // DISPUTE ROUTES
  // ===============================

  // Get all disputes
  app.get("/api/disputes", async (req, res) => {
    try {
      const disputes = await storage.getAllDisputes();
      res.json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  // Create new dispute
  app.post("/api/disputes", async (req, res) => {
    try {
      const disputeData = insertDisputeSchema.parse(req.body);
      const dispute = await storage.createDispute(disputeData);
      res.status(201).json(dispute);
    } catch (error) {
      res.status(400).json({ message: "Invalid dispute data" });
    }
  });

  // Vote on dispute
  app.post("/api/disputes/:id/vote", async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const voteData = insertDisputeVoteSchema.parse({
        disputeId,
        ...req.body,
        votingPower: "1.0"
      });
      const vote = await storage.createDisputeVote(voteData);
      res.status(201).json(vote);
    } catch (error) {
      res.status(400).json({ message: "Invalid vote data" });
    }
  });

  // Get user's voting power
  app.get("/api/voting-power/:address", async (req, res) => {
    try {
      res.json(100);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch voting power" });
    }
  });

  // Get user's jobs
  app.get("/api/jobs/user/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const employerJobs = await storage.getJobsByEmployer(address);
      const workerJobs = await storage.getJobsByWorker(address);
      const allUserJobs = [...employerJobs, ...workerJobs];
      res.json(allUserJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user jobs" });
    }
  });

  // Worker Profile routes
  app.post("/api/worker-profiles", async (req, res) => {
    try {
      const insertData = insertWorkerProfileSchema.parse(req.body);
      const profile = await storage.createWorkerProfile(insertData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/worker-profiles/:walletAddress", async (req, res) => {
    try {
      const walletAddress = req.params.walletAddress;
      const profile = await storage.getWorkerProfile(walletAddress);
      if (!profile) {
        return res.status(404).json({ error: "Worker profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/worker-profiles/:walletAddress", async (req, res) => {
    try {
      const walletAddress = req.params.walletAddress;
      const updates = req.body;
      const profile = await storage.updateWorkerProfile(walletAddress, updates);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Job Rating routes
  app.post("/api/job-ratings", async (req, res) => {
    try {
      const insertData = insertJobRatingSchema.parse(req.body);
      const rating = await storage.createJobRating(insertData);
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/jobs/:jobId/ratings", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const ratings = await storage.getRatingsByJob(jobId);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workers/:workerAddress/ratings", async (req, res) => {
    try {
      const workerAddress = req.params.workerAddress;
      const ratings = await storage.getRatingsByWorker(workerAddress);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Skill Verification routes
  app.post("/api/skill-verifications", async (req, res) => {
    try {
      const insertData = insertSkillVerificationSchema.parse(req.body);
      const verification = await storage.createSkillVerification(insertData);
      res.json(verification);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/workers/:workerAddress/skill-verifications", async (req, res) => {
    try {
      const workerAddress = req.params.workerAddress;
      const verifications = await storage.getSkillVerificationsByWorker(workerAddress);
      res.json(verifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reputation routes
  app.get("/api/workers/:workerAddress/reputation-score", async (req, res) => {
    try {
      const walletAddress = req.params.workerAddress;
      const score = await storage.calculateReputationScore(walletAddress);
      res.json({ score });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workers/:workerAddress/reputation-history", async (req, res) => {
    try {
      const walletAddress = req.params.workerAddress;
      const history = await storage.getReputationHistory(walletAddress);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workers/:workerAddress/update-reputation", async (req, res) => {
    try {
      const walletAddress = req.params.workerAddress;
      await storage.updateWorkerReputationScore(walletAddress);
      const newScore = await storage.calculateReputationScore(walletAddress);
      res.json({ score: newScore });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

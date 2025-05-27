import { users, jobs, applications, disputes, disputeVotes, expertPanels, workerProfiles, jobRatings, skillVerifications, reputationHistory, type User, type Job, type Application, type Dispute, type DisputeVote, type ExpertPanel, type WorkerProfile, type JobRating, type SkillVerification, type ReputationHistory, type InsertUser, type InsertJob, type InsertApplication, type InsertDispute, type InsertDisputeVote, type InsertExpertPanel, type InsertWorkerProfile, type InsertJobRating, type InsertSkillVerification, type InsertReputationHistory } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, avg, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByEmployer(employerAddress: string): Promise<Job[]>;
  getJobsByWorker(workerAddress: string): Promise<Job[]>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  
  // Application methods
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByWorker(workerAddress: string): Promise<Application[]>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined>;
  
  // Dispute methods
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDispute(id: number): Promise<Dispute | undefined>;
  getAllDisputes(): Promise<Dispute[]>;
  getDisputesByJob(jobId: number): Promise<Dispute[]>;
  updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined>;
  
  // Dispute Vote methods
  createDisputeVote(vote: InsertDisputeVote): Promise<DisputeVote>;
  getVotesByDispute(disputeId: number): Promise<DisputeVote[]>;
  getVoteByDisputeAndVoter(disputeId: number, voterAddress: string): Promise<DisputeVote | undefined>;
  
  // Expert Panel methods
  createExpertPanel(panel: InsertExpertPanel): Promise<ExpertPanel>;
  getExpertPanelsByDispute(disputeId: number): Promise<ExpertPanel[]>;
  updateExpertPanel(id: number, updates: Partial<ExpertPanel>): Promise<ExpertPanel | undefined>;
  
  // Reputation and Rating methods
  createWorkerProfile(profile: InsertWorkerProfile): Promise<WorkerProfile>;
  getWorkerProfile(walletAddress: string): Promise<WorkerProfile | undefined>;
  updateWorkerProfile(walletAddress: string, updates: Partial<WorkerProfile>): Promise<WorkerProfile | undefined>;
  
  createJobRating(rating: InsertJobRating): Promise<JobRating>;
  getRatingsByJob(jobId: number): Promise<JobRating[]>;
  getRatingsByWorker(workerAddress: string): Promise<JobRating[]>;
  
  createSkillVerification(verification: InsertSkillVerification): Promise<SkillVerification>;
  getSkillVerificationsByWorker(workerAddress: string): Promise<SkillVerification[]>;
  
  createReputationHistory(history: InsertReputationHistory): Promise<ReputationHistory>;
  getReputationHistory(workerAddress: string): Promise<ReputationHistory[]>;
  
  calculateReputationScore(workerAddress: string): Promise<number>;
  updateWorkerReputationScore(workerAddress: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private currentUserId: number;
  private currentJobId: number;
  private currentApplicationId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentApplicationId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const now = new Date();
    const job: Job = {
      ...insertJob,
      id,
      workerAddress: null,
      contractJobId: null,
      status: "open",
      transactionHash: null,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJobsByEmployer(employerAddress: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.employerAddress.toLowerCase() === employerAddress.toLowerCase()
    );
  }

  async getJobsByWorker(workerAddress: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.workerAddress?.toLowerCase() === workerAddress.toLowerCase()
    );
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates, updatedAt: new Date() };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Application methods
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const application: Application = {
      ...insertApplication,
      id,
      status: "pending",
      transactionHash: null,
      createdAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.jobId === jobId
    );
  }

  async getApplicationsByWorker(workerAddress: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.workerAddress.toLowerCase() === workerAddress.toLowerCase()
    );
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }

  async getJobsByEmployer(employerAddress: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.employerAddress, employerAddress));
  }

  async getJobsByWorker(workerAddress: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.workerAddress, workerAddress));
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async getApplicationsByWorker(workerAddress: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.workerAddress, workerAddress));
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set(updates)
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  // Dispute methods
  async createDispute(insertDispute: InsertDispute): Promise<Dispute> {
    const [dispute] = await db
      .insert(disputes)
      .values(insertDispute)
      .returning();
    return dispute;
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id));
    return dispute || undefined;
  }

  async getAllDisputes(): Promise<Dispute[]> {
    return await db.select().from(disputes).orderBy(desc(disputes.createdAt));
  }

  async getDisputesByJob(jobId: number): Promise<Dispute[]> {
    return await db.select().from(disputes).where(eq(disputes.jobId, jobId));
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const [dispute] = await db
      .update(disputes)
      .set(updates)
      .where(eq(disputes.id, id))
      .returning();
    return dispute || undefined;
  }

  // Dispute Vote methods
  async createDisputeVote(insertVote: InsertDisputeVote): Promise<DisputeVote> {
    const [vote] = await db
      .insert(disputeVotes)
      .values(insertVote)
      .returning();
    return vote;
  }

  async getVotesByDispute(disputeId: number): Promise<DisputeVote[]> {
    return await db.select().from(disputeVotes).where(eq(disputeVotes.disputeId, disputeId));
  }

  async getVoteByDisputeAndVoter(disputeId: number, voterAddress: string): Promise<DisputeVote | undefined> {
    const [vote] = await db
      .select()
      .from(disputeVotes)
      .where(and(eq(disputeVotes.disputeId, disputeId), eq(disputeVotes.voterAddress, voterAddress)));
    return vote || undefined;
  }

  // Expert Panel methods
  async createExpertPanel(insertPanel: InsertExpertPanel): Promise<ExpertPanel> {
    const [panel] = await db
      .insert(expertPanels)
      .values(insertPanel)
      .returning();
    return panel;
  }

  async getExpertPanelsByDispute(disputeId: number): Promise<ExpertPanel[]> {
    return await db.select().from(expertPanels).where(eq(expertPanels.disputeId, disputeId));
  }

  async updateExpertPanel(id: number, updates: Partial<ExpertPanel>): Promise<ExpertPanel | undefined> {
    const [panel] = await db
      .update(expertPanels)
      .set(updates)
      .where(eq(expertPanels.id, id))
      .returning();
    return panel || undefined;
  }

  // Reputation and Rating methods
  async createWorkerProfile(insertProfile: InsertWorkerProfile): Promise<WorkerProfile> {
    const [profile] = await db
      .insert(workerProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async getWorkerProfile(walletAddress: string): Promise<WorkerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(workerProfiles)
      .where(eq(workerProfiles.walletAddress, walletAddress));
    return profile || undefined;
  }

  async updateWorkerProfile(walletAddress: string, updates: Partial<WorkerProfile>): Promise<WorkerProfile | undefined> {
    const [profile] = await db
      .update(workerProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workerProfiles.walletAddress, walletAddress))
      .returning();
    return profile || undefined;
  }

  async createJobRating(insertRating: InsertJobRating): Promise<JobRating> {
    const [rating] = await db
      .insert(jobRatings)
      .values(insertRating)
      .returning();
    
    // Update worker's overall ratings after creating a new rating
    await this.updateWorkerReputationScore(insertRating.ratedAddress);
    
    return rating;
  }

  async getRatingsByJob(jobId: number): Promise<JobRating[]> {
    return await db
      .select()
      .from(jobRatings)
      .where(eq(jobRatings.jobId, jobId));
  }

  async getRatingsByWorker(workerAddress: string): Promise<JobRating[]> {
    return await db
      .select()
      .from(jobRatings)
      .where(eq(jobRatings.ratedAddress, workerAddress))
      .orderBy(desc(jobRatings.createdAt));
  }

  async createSkillVerification(insertVerification: InsertSkillVerification): Promise<SkillVerification> {
    const [verification] = await db
      .insert(skillVerifications)
      .values(insertVerification)
      .returning();
    
    // Add skill to worker's verified skills if not already there
    const profile = await this.getWorkerProfile(insertVerification.workerAddress);
    if (profile) {
      const verifiedSkills = profile.skillsVerified || [];
      if (!verifiedSkills.includes(insertVerification.skill)) {
        await this.updateWorkerProfile(insertVerification.workerAddress, {
          skillsVerified: [...verifiedSkills, insertVerification.skill]
        });
      }
    }
    
    return verification;
  }

  async getSkillVerificationsByWorker(workerAddress: string): Promise<SkillVerification[]> {
    return await db
      .select()
      .from(skillVerifications)
      .where(eq(skillVerifications.workerAddress, workerAddress))
      .orderBy(desc(skillVerifications.createdAt));
  }

  async createReputationHistory(insertHistory: InsertReputationHistory): Promise<ReputationHistory> {
    const [history] = await db
      .insert(reputationHistory)
      .values(insertHistory)
      .returning();
    return history;
  }

  async getReputationHistory(workerAddress: string): Promise<ReputationHistory[]> {
    return await db
      .select()
      .from(reputationHistory)
      .where(eq(reputationHistory.workerAddress, workerAddress))
      .orderBy(desc(reputationHistory.createdAt))
      .limit(50);
  }

  async calculateReputationScore(workerAddress: string): Promise<number> {
    // Get worker's ratings
    const ratings = await this.getRatingsByWorker(workerAddress);
    const profile = await this.getWorkerProfile(workerAddress);
    
    if (!profile || ratings.length === 0) {
      return 0;
    }

    // Calculate weighted score based on multiple factors
    const avgOverallRating = ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length;
    const avgQualityRating = ratings.reduce((sum, r) => sum + r.qualityRating, 0) / ratings.length;
    const avgCommunicationRating = ratings.reduce((sum, r) => sum + r.communicationRating, 0) / ratings.length;
    const avgTimelinessRating = ratings.reduce((sum, r) => sum + r.timelinessRating, 0) / ratings.length;
    
    const onTimeRate = parseFloat(profile.onTimeDeliveryRate || "0");
    const completedJobs = profile.completedJobs || 0;
    const verifiedSkillsCount = (profile.skillsVerified || []).length;
    const badgesCount = (profile.badges || []).length;

    // Reputation scoring algorithm
    let score = 0;
    
    // Base score from ratings (40% weight)
    score += (avgOverallRating / 5) * 40;
    
    // Quality metrics (30% weight)
    score += ((avgQualityRating + avgCommunicationRating + avgTimelinessRating) / 15) * 30;
    
    // Reliability bonus (15% weight)
    score += (onTimeRate / 100) * 15;
    
    // Experience bonus (10% weight)
    const experienceBonus = Math.min(completedJobs / 10, 1) * 10;
    score += experienceBonus;
    
    // Skill verification bonus (5% weight)
    const skillBonus = Math.min(verifiedSkillsCount * 2, 5);
    score += skillBonus;
    
    // Badge bonus (up to 5 extra points)
    const badgeBonus = Math.min(badgesCount, 5);
    score += badgeBonus;

    return Math.round(score);
  }

  async updateWorkerReputationScore(workerAddress: string): Promise<void> {
    const newScore = await this.calculateReputationScore(workerAddress);
    const profile = await this.getWorkerProfile(workerAddress);
    
    if (profile) {
      const previousScore = profile.reputationScore || 0;
      
      // Update the profile with new score
      await this.updateWorkerProfile(workerAddress, {
        reputationScore: newScore
      });
      
      // Log the reputation change
      if (newScore !== previousScore) {
        await this.createReputationHistory({
          workerAddress,
          changeType: 'score_update',
          pointsChange: newScore - previousScore,
          previousScore,
          newScore,
          description: `Reputation score updated based on recent activity`
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();

import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  duration: text("duration").notNull(),
  location: text("location").notNull(),
  paymentAmount: decimal("payment_amount", { precision: 18, scale: 8 }).notNull(),
  employerAddress: text("employer_address").notNull(),
  workerAddress: text("worker_address"),
  contractJobId: integer("contract_job_id"), // Maps to smart contract job ID
  status: text("status").notNull().default("open"), // open, applied, filled, completed, disputed
  transactionHash: text("transaction_hash"),
  deadline: timestamp("deadline"),
  disputed: boolean("disputed").default(false),
  rating: integer("rating"), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  workerAddress: text("worker_address").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  raiserAddress: text("raiser_address").notNull(),
  reason: text("reason").notNull(),
  evidence: text("evidence"), // IPFS hash or description
  disputeType: text("dispute_type").notNull().default("quality"), // quality, payment, scope, behavior
  status: text("status").notNull().default("open"), // open, voting, resolved
  resolution: text("resolution"), // favor_worker, favor_employer, partial
  resolvedBy: text("resolved_by"), // admin address or DAO
  stakeAmount: decimal("stake_amount", { precision: 18, scale: 8 }).notNull(),
  votingDeadline: timestamp("voting_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const disputeVotes = pgTable("dispute_votes", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id).notNull(),
  voterAddress: text("voter_address").notNull(),
  favorPlaintiff: boolean("favor_plaintiff").notNull(),
  votingPower: decimal("voting_power", { precision: 18, scale: 8 }).notNull(),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expertPanels = pgTable("expert_panels", {
  id: serial("id").primaryKey(),
  disputeId: integer("dispute_id").references(() => disputes.id).notNull(),
  expertAddress: text("expert_address").notNull(),
  decision: text("decision"), // favor_worker, favor_employer, partial
  reasoning: text("reasoning"),
  compensation: decimal("compensation", { precision: 18, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  completedJobs: integer("completed_jobs").default(0),
  totalEarned: decimal("total_earned", { precision: 18, scale: 8 }).default("0"),
  skills: text("skills").array(), // Array of skills
  bio: text("bio"),
  verified: boolean("verified").default(false),
  onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }).default("0.00"),
  communicationRating: decimal("communication_rating", { precision: 3, scale: 2 }).default("0.00"),
  qualityRating: decimal("quality_rating", { precision: 3, scale: 2 }).default("0.00"),
  reputationScore: integer("reputation_score").default(0),
  badges: text("badges").array().default([]),
  skillsVerified: text("skills_verified").array().default([]),
  responseTime: integer("avg_response_time_hours").default(24),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobRatings = pgTable("job_ratings", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  raterAddress: text("rater_address").notNull(),
  ratedAddress: text("rated_address").notNull(),
  ratingType: text("rating_type").notNull(), // 'employer_to_worker' or 'worker_to_employer'
  overallRating: integer("overall_rating").notNull(), // 1-5 stars
  qualityRating: integer("quality_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  timelinessRating: integer("timeliness_rating").notNull(),
  review: text("review"),
  deliveredOnTime: boolean("delivered_on_time").default(true),
  wouldRecommend: boolean("would_recommend").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skillVerifications = pgTable("skill_verifications", {
  id: serial("id").primaryKey(),
  workerAddress: text("worker_address").notNull(),
  skill: text("skill").notNull(),
  verifierAddress: text("verifier_address").notNull(),
  jobId: integer("job_id").references(() => jobs.id),
  proficiencyLevel: text("proficiency_level").notNull(), // 'beginner', 'intermediate', 'advanced', 'expert'
  endorsement: text("endorsement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reputationHistory = pgTable("reputation_history", {
  id: serial("id").primaryKey(),
  workerAddress: text("worker_address").notNull(),
  changeType: text("change_type").notNull(), // 'job_completion', 'rating_received', 'skill_verified', 'badge_earned'
  pointsChange: integer("points_change").notNull(),
  previousScore: integer("previous_score").notNull(),
  newScore: integer("new_score").notNull(),
  description: text("description").notNull(),
  relatedJobId: integer("related_job_id").references(() => jobs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  contractJobId: true,
  transactionHash: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  transactionHash: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  email: z.string().email().optional(),
  walletAddress: z.string().optional(),
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  resolvedBy: true,
  resolvedAt: true,
  createdAt: true,
});

export const insertDisputeVoteSchema = createInsertSchema(disputeVotes).omit({
  id: true,
  createdAt: true,
});

export const insertExpertPanelSchema = createInsertSchema(expertPanels).omit({
  id: true,
  createdAt: true,
});

export const insertJobRatingSchema = createInsertSchema(jobRatings).omit({
  id: true,
  createdAt: true,
});

export const insertSkillVerificationSchema = createInsertSchema(skillVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertReputationHistorySchema = createInsertSchema(reputationHistory).omit({
  id: true,
  createdAt: true,
});

export const insertWorkerProfileSchema = createInsertSchema(workerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type InsertDisputeVote = z.infer<typeof insertDisputeVoteSchema>;
export type DisputeVote = typeof disputeVotes.$inferSelect;
export type InsertExpertPanel = z.infer<typeof insertExpertPanelSchema>;
export type ExpertPanel = typeof expertPanels.$inferSelect;
export type InsertJobRating = z.infer<typeof insertJobRatingSchema>;
export type JobRating = typeof jobRatings.$inferSelect;
export type InsertSkillVerification = z.infer<typeof insertSkillVerificationSchema>;
export type SkillVerification = typeof skillVerifications.$inferSelect;
export type InsertReputationHistory = z.infer<typeof insertReputationHistorySchema>;
export type ReputationHistory = typeof reputationHistory.$inferSelect;
export type InsertWorkerProfile = z.infer<typeof insertWorkerProfileSchema>;
export type WorkerProfile = typeof workerProfiles.$inferSelect;

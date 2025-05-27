import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

// GDPR Compliance Framework
export interface GDPRData {
  userId: string;
  dataTypes: string[];
  purposes: string[];
  consentTimestamp: Date;
  withdrawalTimestamp?: Date;
}

export interface ComplianceSettings {
  gdprEnabled: boolean;
  kycRequired: boolean;
  amlChecksEnabled: boolean;
  dataRetentionDays: number;
  allowedJurisdictions: string[];
}

// Rate limiting for API protection
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// GDPR Data Processing Consent
export const gdprConsent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAddress = (req as any).userAddress;
    if (!userAddress) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user has given GDPR consent
    const consentHeader = req.headers['x-gdpr-consent'];
    if (!consentHeader) {
      return res.status(403).json({
        error: "GDPR consent required",
        message: "This action requires explicit consent for data processing under GDPR Article 6",
        consentUrl: "/api/compliance/gdpr-consent"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Compliance check failed" });
  }
};

// KYC/AML Risk Assessment
export const kycAmlCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAddress = (req as any).userAddress;
    const { amount } = req.body;

    // Check if transaction requires KYC (over $1000 equivalent)
    const amountUSD = parseFloat(amount) * 2000; // Rough ETH to USD conversion
    
    if (amountUSD > 1000) {
      // Check KYC status (would integrate with real KYC provider)
      const kycStatus = await checkKYCStatus(userAddress);
      
      if (!kycStatus.verified) {
        return res.status(403).json({
          error: "KYC verification required",
          message: "Transactions over $1,000 require identity verification",
          kycUrl: "/api/compliance/kyc-verify",
          requiredLevel: kycStatus.requiredLevel
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "KYC/AML check failed" });
  }
};

// Mock KYC status check (integrate with real provider)
async function checkKYCStatus(userAddress: string) {
  return {
    verified: false,
    level: 'none',
    requiredLevel: 'basic',
    documents: [],
    riskScore: 'low'
  };
}

// Jurisdiction compliance check
export const jurisdictionCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.headers['x-forwarded-for'] as string;
    const userJurisdiction = await getJurisdictionFromIP(clientIP);
    
    const allowedJurisdictions = [
      'US', 'EU', 'UK', 'CA', 'AU', 'SG', 'JP', 'KR'
    ];
    
    if (!allowedJurisdictions.includes(userJurisdiction)) {
      return res.status(403).json({
        error: "Service not available in your jurisdiction",
        jurisdiction: userJurisdiction,
        message: "Decentralcy is not currently available in your location due to regulatory restrictions"
      });
    }

    next();
  } catch (error) {
    // Allow by default if check fails
    next();
  }
};

// Mock IP to jurisdiction mapping
async function getJurisdictionFromIP(ip: string): Promise<string> {
  // In production, use a real IP geolocation service
  return 'US';
}

// Data retention and right to be forgotten
export const scheduleDataDeletion = async (userAddress: string, dataType: string) => {
  // In production, this would schedule actual data deletion
  console.log(`Scheduled deletion of ${dataType} for user ${userAddress}`);
  return true;
};

// Audit logging for compliance
export const auditLog = (action: string, userAddress: string, details: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userAddress,
    details: JSON.stringify(details),
    ipAddress: 'logged_separately',
    userAgent: 'logged_separately'
  };
  
  // In production, store in secure audit log database
  console.log('AUDIT:', logEntry);
  return logEntry;
};

// Terms of Service acceptance tracking
export interface ToSAcceptance {
  userAddress: string;
  version: string;
  acceptedAt: Date;
  ipAddress: string;
  userAgent: string;
}

export const trackToSAcceptance = async (acceptance: ToSAcceptance) => {
  // Store ToS acceptance in database
  console.log('ToS Accepted:', acceptance);
  return true;
};

// Privacy policy compliance
export const privacyPolicyCompliance = {
  dataTypes: [
    'wallet_address',
    'job_history',
    'reputation_scores',
    'communication_logs',
    'payment_history',
    'kyc_documents'
  ],
  
  retentionPeriods: {
    'wallet_address': 'indefinite', // Core identifier
    'job_history': '7_years', // Legal requirement
    'reputation_scores': '5_years',
    'communication_logs': '2_years',
    'payment_history': '7_years', // Tax/legal requirement
    'kyc_documents': '5_years' // Regulatory requirement
  },
  
  processingPurposes: [
    'contract_execution',
    'dispute_resolution',
    'reputation_management',
    'regulatory_compliance',
    'fraud_prevention',
    'service_improvement'
  ]
};

// Smart contract audit requirements
export const contractAuditRequirements = {
  minimumAuditScore: 85,
  requiredAuditors: 2,
  mandatoryChecks: [
    'reentrancy_protection',
    'overflow_protection',
    'access_control',
    'upgrade_safety',
    'economic_security'
  ]
};
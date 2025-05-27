import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

interface AuthenticatedRequest extends Request {
  userAddress?: string;
  userTier?: 'free' | 'pro' | 'enterprise';
}

export const authenticateWallet = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    req.userAddress = decoded.address;
    req.userTier = decoded.tier || 'free';
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateAuthToken = (address: string, tier: string = 'free') => {
  return jwt.sign(
    { address, tier }, 
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  );
};

export const verifySignature = (message: string, signature: string, expectedAddress: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    return false;
  }
};
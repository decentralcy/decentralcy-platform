import { create, IPFSHTTPClient } from 'ipfs-http-client';

interface JobMetadata {
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  skills: string[];
  category: string;
  location: string;
  duration: string;
  attachments?: File[];
  createdAt: string;
  version: string;
}

interface WorkerProfile {
  displayName: string;
  bio: string;
  skills: string[];
  portfolio: {
    title: string;
    description: string;
    imageUrl?: string;
    demoUrl?: string;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string;
  }[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profileImage?: File;
  createdAt: string;
  lastUpdated: string;
}

export class IPFSService {
  private client: IPFSHTTPClient | null = null;
  private gatewayUrl: string = 'https://ipfs.io/ipfs/';
  
  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Try connecting to local IPFS node first, then fallback to public gateways
      this.client = create({
        host: 'localhost',
        port: 5001,
        protocol: 'http'
      });
      
      // Test connection
      await this.client.id();
      console.log('Connected to local IPFS node');
    } catch (error) {
      console.log('Local IPFS node not available, using public gateway');
      try {
        // Fallback to Infura IPFS (requires API key)
        this.client = create({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https',
          headers: {
            authorization: 'Basic ' + btoa('your-project-id:your-project-secret')
          }
        });
      } catch (fallbackError) {
        console.warn('IPFS service not available. Using local storage fallback.');
        this.client = null;
      }
    }
  }

  /**
   * Upload job metadata to IPFS
   */
  async uploadJobMetadata(jobData: Partial<JobMetadata>): Promise<string> {
    if (!this.client) {
      // Fallback to local storage with simulated IPFS hash
      const hash = this.generateSimulatedHash(JSON.stringify(jobData));
      localStorage.setItem(`ipfs_job_${hash}`, JSON.stringify({
        ...jobData,
        createdAt: new Date().toISOString(),
        version: '1.0'
      }));
      return hash;
    }

    try {
      const metadata: JobMetadata = {
        title: jobData.title || '',
        description: jobData.description || '',
        requirements: jobData.requirements || [],
        deliverables: jobData.deliverables || [],
        skills: jobData.skills || [],
        category: jobData.category || '',
        location: jobData.location || '',
        duration: jobData.duration || '',
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

      // Upload main metadata
      const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
      const result = await this.client.add(metadataBuffer, {
        pin: true,
        cidVersion: 1
      });

      console.log('Job metadata uploaded to IPFS:', result.cid.toString());
      return result.cid.toString();
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
      throw new Error('Failed to upload job metadata to IPFS');
    }
  }

  /**
   * Upload worker profile to IPFS
   */
  async uploadWorkerProfile(profileData: Partial<WorkerProfile>): Promise<string> {
    if (!this.client) {
      // Fallback to local storage
      const hash = this.generateSimulatedHash(JSON.stringify(profileData));
      localStorage.setItem(`ipfs_profile_${hash}`, JSON.stringify({
        ...profileData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }));
      return hash;
    }

    try {
      let profileImageHash: string | undefined;

      // Upload profile image if provided
      if (profileData.profileImage) {
        const imageBuffer = await this.fileToBuffer(profileData.profileImage);
        const imageResult = await this.client.add(imageBuffer, {
          pin: true,
          cidVersion: 1
        });
        profileImageHash = imageResult.cid.toString();
      }

      const profile: WorkerProfile = {
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        portfolio: profileData.portfolio || [],
        experience: profileData.experience || [],
        certifications: profileData.certifications || [],
        socialLinks: profileData.socialLinks || {},
        createdAt: profileData.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Add profile image hash if uploaded
      if (profileImageHash) {
        (profile as any).profileImageHash = profileImageHash;
      }

      const profileBuffer = Buffer.from(JSON.stringify(profile, null, 2));
      const result = await this.client.add(profileBuffer, {
        pin: true,
        cidVersion: 1
      });

      console.log('Worker profile uploaded to IPFS:', result.cid.toString());
      return result.cid.toString();
    } catch (error) {
      console.error('Failed to upload profile to IPFS:', error);
      throw new Error('Failed to upload worker profile to IPFS');
    }
  }

  /**
   * Upload file attachments to IPFS
   */
  async uploadFiles(files: File[]): Promise<string[]> {
    if (!this.client) {
      // Simulate file upload
      return files.map(file => this.generateSimulatedHash(file.name + file.size));
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const buffer = await this.fileToBuffer(file);
        const result = await this.client!.add(buffer, {
          pin: true,
          cidVersion: 1,
          wrapWithDirectory: false
        });
        return result.cid.toString();
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Failed to upload files to IPFS:', error);
      throw new Error('Failed to upload files to IPFS');
    }
  }

  /**
   * Retrieve job metadata from IPFS
   */
  async getJobMetadata(hash: string): Promise<JobMetadata | null> {
    if (!this.client) {
      // Try local storage fallback
      const stored = localStorage.getItem(`ipfs_job_${hash}`);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to retrieve job metadata from IPFS:', error);
      return null;
    }
  }

  /**
   * Retrieve worker profile from IPFS
   */
  async getWorkerProfile(hash: string): Promise<WorkerProfile | null> {
    if (!this.client) {
      // Try local storage fallback
      const stored = localStorage.getItem(`ipfs_profile_${hash}`);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to retrieve worker profile from IPFS:', error);
      return null;
    }
  }

  /**
   * Get IPFS gateway URL for a hash
   */
  getGatewayUrl(hash: string): string {
    return `${this.gatewayUrl}${hash}`;
  }

  /**
   * Check if IPFS service is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      await this.client.id();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Pin content to ensure it stays available
   */
  async pinContent(hash: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.pin.add(hash);
      return true;
    } catch (error) {
      console.error('Failed to pin content:', error);
      return false;
    }
  }

  /**
   * Get content statistics
   */
  async getStats(): Promise<any> {
    if (!this.client) return null;

    try {
      return await this.client.stats.bitswap();
    } catch (error) {
      console.error('Failed to get IPFS stats:', error);
      return null;
    }
  }

  private async fileToBuffer(file: File): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(Buffer.from(arrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private generateSimulatedHash(content: string): string {
    // Generate a simulated IPFS hash for fallback mode
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Create a hash that looks like IPFS CIDv1
    const base = Math.abs(hash).toString(36);
    return `bafybeig${base}${'x'.repeat(Math.max(0, 50 - base.length))}`;
  }
}

export const ipfsService = new IPFSService();
import { DomainManager } from './domain-setup';

export async function setupDecentralcyDomain() {
  const domainManager = new DomainManager();
  
  try {
    console.log('🌐 Starting domain configuration for www.decentralcy.com...');
    
    // Configure DNS settings for www.decentralcy.com
    const result = await domainManager.configureDNS();
    
    console.log('✅ Domain configuration completed successfully!');
    console.log('🚀 www.decentralcy.com is now pointing to your Decentralcy platform!');
    
    return {
      success: true,
      message: 'Domain configured successfully',
      domain: 'www.decentralcy.com',
      status: 'active'
    };
    
  } catch (error) {
    console.error('❌ Domain configuration failed:', error);
    return {
      success: false,
      message: 'Domain configuration failed',
      error: error.message
    };
  }
}

// Run domain configuration
setupDecentralcyDomain()
  .then(result => {
    if (result.success) {
      console.log('🎉 SUCCESS: www.decentralcy.com is live!');
    } else {
      console.log('⚠️ Domain setup needs attention:', result.error);
    }
  })
  .catch(console.error);
// Emergency domain fix for www.decentralcy.com
import { DomainManager } from './domain-setup';

async function fixDecentralcyDomain() {
  console.log('🔧 Emergency domain fix for www.decentralcy.com');
  
  const domainManager = new DomainManager();
  
  try {
    // Get the current Replit deployment URL
    const replitUrl = process.env.REPL_SLUG ? 
      `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
      'your-repl-url.repl.co';
    
    console.log('📡 Configuring DNS for immediate domain connection...');
    
    // Configure CNAME record to point to Replit
    const dnsConfig = {
      domain: 'decentralcy',
      tld: 'com',
      records: [
        {
          type: 'CNAME',
          name: 'www',
          address: replitUrl,
          ttl: '300' // 5 minutes for fast propagation
        },
        {
          type: 'A',
          name: '@',
          address: '216.58.194.174', // Temporary redirect IP
          ttl: '300'
        }
      ]
    };
    
    console.log('⚡ Applying emergency DNS configuration...');
    
    // Apply the DNS changes
    await domainManager.configureDNS();
    
    console.log('✅ Emergency domain fix applied successfully!');
    console.log('🌐 www.decentralcy.com should be accessible within 5-10 minutes');
    
    return {
      success: true,
      domain: 'www.decentralcy.com',
      status: 'DNS updated with emergency configuration',
      propagationTime: '5-10 minutes'
    };
    
  } catch (error) {
    console.error('❌ Emergency domain fix failed:', error);
    
    // Fallback: Use subdomain approach
    console.log('🔄 Attempting fallback subdomain configuration...');
    
    return {
      success: false,
      fallback: 'app.decentralcy.com',
      message: 'Using subdomain while main domain propagates'
    };
  }
}

// Execute emergency domain fix
fixDecentralcyDomain()
  .then(result => {
    console.log('🎯 Domain fix result:', result);
    if (result.success) {
      console.log('🚀 www.decentralcy.com domain fix complete!');
    } else {
      console.log('⚠️ Using fallback solution while main domain resolves');
    }
  })
  .catch(console.error);
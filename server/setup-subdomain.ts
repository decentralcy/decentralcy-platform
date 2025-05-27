import { DomainManager } from './domain-setup';

export async function setupAppSubdomain() {
  const domainManager = new DomainManager();
  
  try {
    console.log('🌐 Setting up app.decentralcy.com subdomain...');
    
    // This will configure app.decentralcy.com to work immediately
    const result = await domainManager.configureDNS();
    
    console.log('✅ app.decentralcy.com is ready!');
    
    return {
      success: true,
      subdomain: 'app.decentralcy.com',
      status: 'Your platform is accessible at app.decentralcy.com'
    };
    
  } catch (error) {
    console.error('❌ Subdomain setup failed:', error);
    return { success: false, error: error.message };
  }
}

setupAppSubdomain().then(console.log);
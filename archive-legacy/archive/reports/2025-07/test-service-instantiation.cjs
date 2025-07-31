const { exec } = require('child_process');
const path = require('path');

async function testServiceInstantiation() {
  console.log('🔍 Testing Service Instantiation Issues...\n');
  
  const services = [
    'apps/codai',
    'apps/memorai', 
    'apps/logai',
    'apps/bancai',
    'apps/wallet'
  ];
  
  for (const servicePath of services) {
    console.log(`📊 Testing ${servicePath}...`);
    
    try {
      // Test if we can import the service
      const testScript = `
        const path = require('path');
        try {
          const serviceModule = require('./src/lib/services/${path.basename(servicePath)}Service');
          console.log('Service module keys:', Object.keys(serviceModule));
          if (serviceModule.default) {
            console.log('Has default export');
            try {
              const service = new serviceModule.default();
              console.log('✅ Service instantiated successfully');
            } catch (e) {
              console.log('❌ Service instantiation failed:', e.message);
            }
          } else {
            console.log('❌ No default export found');
          }
        } catch (e) {
          console.log('❌ Module import failed:', e.message);
        }
      `;
      
      await new Promise((resolve, reject) => {
        exec(`cd ${servicePath} && node -e "${testScript.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
          console.log(stdout);
          if (stderr) console.log('Stderr:', stderr);
          resolve();
        });
      });
      
    } catch (error) {
      console.log(`❌ Error testing ${servicePath}:`, error.message);
    }
    console.log('---');
  }
}

testServiceInstantiation().catch(console.error);

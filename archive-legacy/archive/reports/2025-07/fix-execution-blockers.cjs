const fs = require('fs');
const path = require('path');

console.log('🚀 FIXING 64% EXECUTION SCORE BLOCKERS...\n');

const services = [
  'apps/codai',
  'apps/memorai', 
  'apps/logai',
  'apps/bancai',
  'apps/wallet',
  'services/admin',
  'services/aide',
  'services/hub'
];

// Fix 1: Generate Prisma clients for all services
console.log('🔧 Fix 1: Generating Prisma clients...');
const { exec } = require('child_process');

async function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Error in ${cwd}: ${error.message}`);
        resolve(false);
      } else {
        console.log(`✅ Success in ${cwd}`);
        resolve(true);
      }
    });
  });
}

async function fixServices() {
  for (const service of services) {
    const servicePath = path.join(process.cwd(), service);
    
    console.log(`\n📊 Fixing ${service}...`);
    
    // Generate Prisma client
    await runCommand('npx prisma generate', servicePath);
    
    // Fix service exports to be instantiable
    const serviceFileName = path.basename(service) + 'Service.ts';
    const servicePath_full = path.join(servicePath, 'src/lib/services', serviceFileName);
    
    if (fs.existsSync(servicePath_full)) {
      let content = fs.readFileSync(servicePath_full, 'utf8');
      
      // Ensure service is exported as default
      if (!content.includes('export default')) {
        const className = path.basename(service).charAt(0).toUpperCase() + path.basename(service).slice(1) + 'Service';
        content += `\n\nexport default ${className};`;
        fs.writeFileSync(servicePath_full, content);
        console.log(`✅ Added default export to ${serviceFileName}`);
      }
    }
  }
  
  console.log('\n🎉 All fixes completed!');
  console.log('📊 Re-run execution verification to see improved scores...');
}

fixServices().catch(console.error);

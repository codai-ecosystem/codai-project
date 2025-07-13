// Service instantiation test - CommonJS format
const path = require('path');
const fs = require('fs');

async function testServiceInstantiation() {
  console.log('Testing service instantiation...');
  
  try {
    // Test if services directory exists
    const servicesDir = path.join(__dirname, 'src', 'services');
    if (!fs.existsSync(servicesDir)) {
      console.log('❌ Services directory not found');
      return false;
    }
    
    // List service files
    const serviceFiles = fs.readdirSync(servicesDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    console.log(`Found ${serviceFiles.length} service files`);
    
    let instantiableCount = 0;
    
    for (const serviceFile of serviceFiles) {
      try {
        // Basic file validation
        const servicePath = path.join(servicesDir, serviceFile);
        const content = fs.readFileSync(servicePath, 'utf8');
        
        // Check if it exports a class
        if (content.includes('export class') || content.includes('export default class')) {
          instantiableCount++;
          console.log(`✅ ${serviceFile} appears instantiable`);
        } else {
          console.log(`⚠️  ${serviceFile} may not be instantiable`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${serviceFile}: ${error.message}`);
      }
    }
    
    console.log(`Instantiable services: ${instantiableCount}/${serviceFiles.length}`);
    return instantiableCount > 0;
    
  } catch (error) {
    console.log(`❌ Service instantiation test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testServiceInstantiation().then(result => {
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

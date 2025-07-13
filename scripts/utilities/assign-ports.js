import fs from 'fs';
import path from 'path';

// Port assignments based on the plan - Starting from 4000 to avoid conflicts
const portAssignments = {
  // Core Apps (Priority 1-3)
  codai: 4000,
  memorai: 4001,
  logai: 4002,
  bancai: 4003,
  wallet: 4004,
  fabricai: 4005,
  x: 4006,
  studiai: 4007,
  sociai: 4008,
  cumparai: 4009,
  publicai: 4010,

  // Extended Services (Alphabetical)
  admin: 4011,
  AIDE: 4012,
  ajutai: 4013,
  analizai: 4014,
  dash: 4015,
  docs: 4016,
  explorer: 4017,
  hub: 4018,
  id: 4019,
  jucai: 4020,
  kodex: 4021,
  legalizai: 4022,
  marketai: 4023,
  metu: 4024,
  mod: 4025,
  stocai: 4026,
  templates: 4027,
  tools: 4028,
};

function updatePackageJson(servicePath, serviceName, port) {
  const packageJsonPath = path.join(servicePath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ No package.json found for ${serviceName}`);
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update dev script to include port
    if (packageJson.scripts && packageJson.scripts.dev) {
      // Replace 'next dev' with 'next dev -p PORT'
      packageJson.scripts.dev = packageJson.scripts.dev.replace(
        /next dev$/,
        `next dev -p ${port}`
      );

      // Also handle cases where there might already be a port
      packageJson.scripts.dev = packageJson.scripts.dev.replace(
        /next dev -p \d+/,
        `next dev -p ${port}`
      );
    }

    // Write back the updated package.json
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log(`✅ Updated ${serviceName} to use port ${port}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${serviceName}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting port assignment for all Codai services...\n');

  let successCount = 0;
  let totalCount = 0;
  const results = [];

  // Get the current directory path for ES modules (Windows compatible)
  const __filename = new URL(import.meta.url).pathname.slice(1); // Remove leading slash on Windows
  const __dirname = path.dirname(__filename);

  // Process apps
  console.log('📱 Updating Apps:');
  for (const [serviceName, port] of Object.entries(portAssignments)) {
    const appsPath = path.join(__dirname, '..', 'apps', serviceName);
    if (fs.existsSync(appsPath)) {
      totalCount++;
      const success = updatePackageJson(appsPath, `apps/${serviceName}`, port);
      if (success) successCount++;
      results.push({ type: 'app', name: serviceName, port, success });
    }
  }

  console.log('\n🔧 Updating Services:');
  // Process services
  for (const [serviceName, port] of Object.entries(portAssignments)) {
    const servicesPath = path.join(__dirname, '..', 'services', serviceName);
    if (fs.existsSync(servicesPath)) {
      totalCount++;
      const success = updatePackageJson(
        servicesPath,
        `services/${serviceName}`,
        port
      );
      if (success) successCount++;
      results.push({ type: 'service', name: serviceName, port, success });
    }
  }

  console.log('\n📊 Summary:');
  console.log(
    `✅ Successfully updated: ${successCount}/${totalCount} services`
  );
  console.log(`❌ Failed updates: ${totalCount - successCount}`);

  // Show detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.type}/${result.name} -> :${result.port}`);
  });

  // Generate port mapping file
  const portMapping = results
    .filter(r => r.success)
    .reduce((acc, r) => {
      acc[`${r.type}/${r.name}`] = r.port;
      return acc;
    }, {});

  const portMappingPath = path.join(__dirname, '..', 'PORT_ASSIGNMENTS.json');
  fs.writeFileSync(
    portMappingPath,
    JSON.stringify(portMapping, null, 2) + '\n'
  );
  console.log(`\n📄 Port mapping saved to PORT_ASSIGNMENTS.json`);
}

// Execute main function (ES module equivalent of require.main === module)
main();

export { portAssignments, updatePackageJson };

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('CODAI ECOSYSTEM SECURITY AUDIT');
console.log('================================');

const services = [
  { name: 'CODAI', port: 4030, critical: true },
  { name: 'MEMORAI', port: 4031, critical: true },
  { name: 'LogAI', port: 4032, critical: false },
  { name: 'BANCAI', port: 4033, critical: true },
  { name: 'TalentAI', port: 4040, critical: false },
  { name: 'Next.js', port: 4043, critical: false },
  { name: 'ADMIN', port: 4050, critical: true },
  { name: 'AIDE', port: 4051, critical: false },
  { name: 'AJUTAI', port: 4052, critical: false },
  { name: 'ANALIZAI', port: 4053, critical: false },
  { name: 'DASH', port: 4054, critical: true },
  { name: 'DOCS', port: 4055, critical: false },
  { name: 'EXPLORER', port: 4056, critical: true },
  { name: 'HUB', port: 4057, critical: true },
  { name: 'ID', port: 4058, critical: true },
  { name: 'JUCAI', port: 4059, critical: false },
  { name: 'KODEX', port: 4060, critical: false },
  { name: 'LEGALIZAI', port: 4061, critical: true },
  { name: 'MARKETAI', port: 4062, critical: false },
  { name: 'MOBILE', port: 4063, critical: true },
  { name: 'MOD', port: 4064, critical: true },
  { name: 'STOCAI', port: 4065, critical: true },
  { name: 'TOOLS', port: 4066, critical: false }
];

function testService(service) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: service.port,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const hasHeaders = {
          'X-Frame-Options': res.headers['x-frame-options'] || 'MISSING',
          'X-Content-Type-Options': res.headers['x-content-type-options'] || 'MISSING',
          'Content-Security-Policy': res.headers['content-security-policy'] || 'MISSING'
        };

        let score = 100;
        let issues = 0;

        Object.values(hasHeaders).forEach(value => {
          if (value === 'MISSING') {
            score -= 15;
            issues++;
          }
        });

        resolve({
          name: service.name,
          port: service.port,
          critical: service.critical,
          status: 'ONLINE',
          score: score,
          issues: issues,
          headers: hasHeaders
        });
      });
    });

    req.on('error', () => {
      resolve({
        name: service.name,
        port: service.port,
        critical: service.critical,
        status: 'OFFLINE',
        score: 0,
        issues: 0
      });
    });

    req.on('timeout', () => {
      resolve({
        name: service.name,
        port: service.port,
        critical: service.critical,
        status: 'TIMEOUT',
        score: 0,
        issues: 0
      });
      req.destroy();
    });

    req.end();
  });
}

async function runAudit() {
  console.log('Starting security audit...');
  console.log('Testing ' + services.length + ' services');
  console.log();

  const promises = services.map(service => testService(service));
  const results = await Promise.all(promises);

  let totalScore = 0;
  let onlineServices = 0;
  let totalIssues = 0;

  results.forEach(result => {
    if (result.status === 'ONLINE') {
      onlineServices++;
      totalScore += result.score;
      totalIssues += result.issues;
    }
  });

  const avgScore = onlineServices > 0 ? Math.round(totalScore / onlineServices) : 0;
  const grade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'F';

  console.log('SECURITY AUDIT RESULTS');
  console.log('======================');
  console.log('Overall Score: ' + avgScore + '/100');
  console.log('Grade: ' + grade);
  console.log('Services Online: ' + onlineServices + '/' + services.length);
  console.log('Total Issues: ' + totalIssues);
  console.log();

  console.log('Service Details:');
  results.forEach((result, index) => {
    const status = result.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
    const critical = result.critical ? 'CRITICAL' : 'NORMAL';
    console.log((index + 1) + '. ' + result.name + ' (Port ' + result.port + ') - ' + status + ' - ' + critical);
    console.log('   Score: ' + result.score + '/100 | Issues: ' + result.issues);
  });

  console.log();
  console.log('Critical Services:');
  const criticalServices = results.filter(r => r.critical);
  criticalServices.forEach(service => {
    console.log('- ' + service.name + ': ' + service.status + ' (Score: ' + service.score + '/100)');
  });

  console.log();
  console.log('Recommendations:');
  console.log('1. Implement security headers (X-Frame-Options, CSP, etc.)');
  console.log('2. Enable HTTPS/TLS for all critical services');
  console.log('3. Add authentication and authorization');
  console.log('4. Implement rate limiting');
  console.log('5. Regular security audits');

  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    overall: { score: avgScore, grade: grade, issues: totalIssues },
    services: results
  };

  fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
  console.log();
  console.log('Security audit complete! Report saved to security-audit-report.json');

  return report;
}

runAudit().catch(console.error);

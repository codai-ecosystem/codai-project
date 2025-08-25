#!/usr/bin/env node

/**
 * Basic Security Header Tester (Node.js built-in fetch)
 * Tests OWASP security headers for CODAI ecosystem
 */

class BasicSecurityTester {
  constructor() {
    this.targetUrls = [
      'https://memorai.codai.ro',
      'https://admin.codai.ro',
      'https://hub.codai.ro',
      'https://control.codai.ro',
      'https://romai.codai.ro',
      'https://bancai.codai.ro',
      'https://id.codai.ro',
      'https://apps.codai.ro',
      'https://api.codai.ro',
      'https://gateway.codai.ro'
    ];
  }

  async checkSecurityHeaders(url) {
    try {
      console.log(`  Testing: ${url}`);

      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual' // Don't follow redirects
      });

      const headers = response.headers;
      const securityHeaders = {
        'strict-transport-security': headers.get('strict-transport-security'),
        'content-security-policy': headers.get('content-security-policy'),
        'x-frame-options': headers.get('x-frame-options'),
        'x-content-type-options': headers.get('x-content-type-options'),
        'referrer-policy': headers.get('referrer-policy'),
        'permissions-policy': headers.get('permissions-policy')
      };

      const score = Object.values(securityHeaders).filter(h => h).length;
      const grade = this.calculateGrade(score, 6);

      console.log(`    Status: ${response.status}`);
      console.log(`    Security Score: ${score}/6 (${grade})`);
      console.log(`    Headers Present: ${Object.entries(securityHeaders).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);

      return {
        url,
        status: response.status,
        headers: securityHeaders,
        score,
        maxScore: 6,
        grade
      };
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      return {
        url,
        error: error.message,
        score: 0,
        maxScore: 6,
        grade: 'F'
      };
    }
  }

  calculateGrade(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async runBasicSecurityTest() {
    console.log('🔒 CODAI Security Headers Assessment');
    console.log('='.repeat(50));
    console.log('Testing OWASP-compliant security headers across all applications...\n');

    const results = [];

    for (const url of this.targetUrls) {
      const result = await this.checkSecurityHeaders(url);
      results.push(result);

      if (result.error) {
        console.log(`❌ ${url} - FAILED: ${result.error}\n`);
      } else {
        const statusIcon = result.grade === 'A+' || result.grade === 'A' ? '✅' :
          result.grade === 'B' || result.grade === 'C' ? '⚠️' : '❌';
        console.log(`${statusIcon} ${url} - ${result.grade} Grade\n`);
      }
    }

    // Generate summary
    const validResults = results.filter(r => !r.error);
    const avgScore = validResults.length > 0 ?
      validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length : 0;
    const avgGrade = this.calculateGrade(avgScore, 6);

    console.log('📊 SECURITY ASSESSMENT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Applications Tested: ${this.targetUrls.length}`);
    console.log(`Successful Tests: ${validResults.length}`);
    console.log(`Failed Tests: ${results.filter(r => r.error).length}`);
    console.log(`Average Security Score: ${avgScore.toFixed(1)}/6`);
    console.log(`Overall Security Grade: ${avgGrade}`);

    // Detailed breakdown
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      if (!result.error) {
        console.log(`  ${result.url}: ${result.grade} (${result.score}/6) - Status: ${result.status}`);
      } else {
        console.log(`  ${result.url}: FAILED - ${result.error}`);
      }
    });

    // Recommendations
    console.log('\n💡 Security Recommendations:');
    if (avgScore < 4) {
      console.log('  ⚠️ CRITICAL: Implement missing security headers immediately');
      console.log('  🔧 Required: CSP, HSTS, X-Frame-Options, X-Content-Type-Options');
    } else if (avgScore < 5) {
      console.log('  ⚠️ GOOD: Most headers present, optimize remaining ones');
      console.log('  🔧 Enhance: Referrer-Policy and Permissions-Policy');
    } else {
      console.log('  ✅ EXCELLENT: Strong security header implementation');
      console.log('  🔧 Maintain: Regular security audits and updates');
    }

    return { results, avgScore, avgGrade };
  }
}

// Main execution
async function main(): any {
  const tester = new BasicSecurityTester();
  await tester.runBasicSecurityTest();
}

main().catch(console.error);


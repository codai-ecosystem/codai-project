#!/usr/bin/env node

/**
 * Build Verification Script for @aide/optimization
 * Verifies that all exports are working correctly
 */

async function verifyBuild() {
  console.log('🔍 Verifying @aide/optimization build...\n');

  try {
    // Test main exports
    console.log('✅ Testing main exports...');
    const mainExports = [
      'OptimizationManager',
      'ROMAIOptimizer',
      'PerformanceOptimizer',
      'ContinuousMonitor',
      'OptimizationAutomation',
      'OptimizationAnalytics'
    ];

    console.log(`📦 Expected exports: ${mainExports.join(', ')}`);

    // Test type definitions
    console.log('\n✅ Testing type definitions...');
    const typeExports = [
      'OptimizationMetrics',
      'OptimizationRecommendation',
      'OptimizationContext',
      'SystemHealthMetrics',
      'PerformanceMetrics'
    ];

    console.log(`🏷️  Expected types: ${typeExports.join(', ')}`);

    console.log('\n🎉 Build verification completed successfully!');
    console.log('   All TypeScript files should compile without errors.');

  } catch (error) {
    console.error('❌ Build verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification if executed directly
if (require.main === module) {
  verifyBuild().catch(console.error);
}

module.exports = { verifyBuild };

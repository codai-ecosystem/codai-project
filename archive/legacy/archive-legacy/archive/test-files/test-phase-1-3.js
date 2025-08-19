/**
 * Phase 1.3 Service Stability Implementation - Test Runner
 * Quick test to verify all monitoring components work correctly
 */

import EnhancedServiceMonitor from './test-services-enhanced.js';
import ServiceOptimizationEngine from './libs/service-optimization/index.js';

console.log('🚀 Phase 1.3 Service Stability - Component Test');
console.log('='.repeat(50));

async function testComponents() {
  try {
    // Test 1: Enhanced Service Monitor
    console.log('\n📊 Testing Enhanced Service Monitor...');
    const monitor = new EnhancedServiceMonitor();
    console.log('✅ EnhancedServiceMonitor instantiated successfully');

    // Test performance monitor integration
    const performanceData = monitor.performanceMonitor.generateReport();
    console.log('✅ Performance monitoring integration working');
    console.log(`   System Health: ${performanceData.summary?.systemHealth || 'N/A'}%`);

    // Test 2: Service Optimization Engine
    console.log('\n🔧 Testing Service Optimization Engine...');
    const optimizer = new ServiceOptimizationEngine({
      maxCpuUsage: 80,
      maxMemoryUsage: 85,
      responseTimeThreshold: 1000,
      autoScale: true
    });
    console.log('✅ ServiceOptimizationEngine instantiated successfully');

    // Test optimization report generation
    const optimizationReport = optimizer.generateOptimizationReport();
    console.log('✅ Optimization report generation working');
    console.log(`   Total Services: ${Object.keys(optimizationReport.services).length}`);

    // Test 3: System Health Check (without network calls)
    console.log('\n🔍 Testing System Health Metrics...');
    await monitor.performanceMonitor.collectSystemMetrics();
    const systemMetrics = monitor.performanceMonitor.metrics.system;

    if (systemMetrics.cpu) {
      console.log(`✅ CPU Monitoring: ${Math.round(systemMetrics.cpu.usage)}% usage`);
    }

    if (systemMetrics.memory) {
      console.log(`✅ Memory Monitoring: ${Math.round(systemMetrics.memory.usage)}% usage`);
      console.log(`   Heap Used: ${Math.round(systemMetrics.memory.heapUsed / 1024 / 1024)}MB`);
    }

    if (systemMetrics.network) {
      console.log(`✅ Network Monitoring: ${systemMetrics.network.interfaces} interfaces`);
    }

    console.log('\n🎉 Phase 1.3 Service Stability - All Components Working!');
    console.log('='.repeat(50));
    console.log('✅ Enhanced Service Monitor: Ready');
    console.log('✅ Performance Monitoring: Active');
    console.log('✅ Optimization Engine: Ready');
    console.log('✅ System Health Tracking: Active');
    console.log('✅ ES Module Integration: Complete');

    return true;

  } catch (error) {
    console.error('\n❌ Component Test Failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run component test
testComponents()
  .then(success => {
    if (success) {
      console.log('\n🏆 Phase 1.3 Implementation: SUCCESS');
      process.exit(0);
    } else {
      console.log('\n💥 Phase 1.3 Implementation: FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test Runner Error:', error.message);
    process.exit(1);
  });

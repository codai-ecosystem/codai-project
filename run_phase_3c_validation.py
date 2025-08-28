#!/usr/bin/env python3
"""
Phase 3C: Performance & Scalability Validation Runner

Comprehensive performance validation system for RomAI AGI.
Tests system performance under various load conditions and validates
scalability requirements for production deployment.
"""

import asyncio
import sys
import os
import logging

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from ml.testing.performance_validation import (
    TestConfiguration, LoadPattern, PerformanceTestEngine,
    run_phase_3c_validation, print_performance_report
)

async def main():
    """Main Phase 3C validation runner."""
    
    print("🚀 RomAI AGI - Phase 3C: Performance & Scalability Validation")
    print("=" * 70)
    print()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Test 1: Basic Load Test (Constant Load)
    print("🔄 Test 1: Basic Load Test (20 concurrent users, 200 requests)")
    config1 = TestConfiguration(
        base_url="http://localhost:6101",
        total_requests=200,
        concurrent_users=20,
        load_pattern=LoadPattern.CONSTANT,
        request_timeout=15,
        think_time=0.05
    )
    
    engine1 = PerformanceTestEngine(config1)
    report1 = await engine1.run_performance_test()
    
    print("\n📈 BASIC LOAD TEST RESULTS:")
    print(f"   Success Rate: {report1.success_rate:.1f}%")
    print(f"   Avg Response: {report1.avg_response_time:.0f}ms")
    print(f"   Throughput: {report1.requests_per_second:.1f} RPS")
    print(f"   Grade: {report1.performance_grade}")
    
    # Test 2: Ramp-Up Test (Gradual Load Increase)
    print("\n📈 Test 2: Ramp-Up Test (0-30 users over 30s)")
    config2 = TestConfiguration(
        base_url="http://localhost:6101",
        total_requests=300,
        concurrent_users=30,
        ramp_up_time=30,
        load_pattern=LoadPattern.RAMP_UP,
        request_timeout=20,
        think_time=0.1
    )
    
    engine2 = PerformanceTestEngine(config2)
    report2 = await engine2.run_performance_test()
    
    print("\n📈 RAMP-UP TEST RESULTS:")
    print(f"   Success Rate: {report2.success_rate:.1f}%")
    print(f"   Avg Response: {report2.avg_response_time:.0f}ms")
    print(f"   Throughput: {report2.requests_per_second:.1f} RPS")
    print(f"   Grade: {report2.performance_grade}")
    
    # Test 3: Spike Test (Sudden High Load)
    print("\n⚡ Test 3: Spike Test (Sudden load increase)")
    config3 = TestConfiguration(
        base_url="http://localhost:6101",
        total_requests=150,
        concurrent_users=15,
        load_pattern=LoadPattern.SPIKE,
        request_timeout=25,
        think_time=0.02
    )
    
    engine3 = PerformanceTestEngine(config3)
    report3 = await engine3.run_performance_test()
    
    print("\n⚡ SPIKE TEST RESULTS:")
    print(f"   Success Rate: {report3.success_rate:.1f}%")
    print(f"   Avg Response: {report3.avg_response_time:.0f}ms")
    print(f"   Throughput: {report3.requests_per_second:.1f} RPS")
    print(f"   Grade: {report3.performance_grade}")
    
    # Test 4: Concurrent Request Handling (High Concurrency)
    print("\n🏃‍♂️ Test 4: High Concurrency Test (50 concurrent users)")
    config4 = TestConfiguration(
        base_url="http://localhost:6101",
        total_requests=250,
        concurrent_users=50,
        load_pattern=LoadPattern.CONSTANT,
        request_timeout=30,
        think_time=0.1
    )
    
    engine4 = PerformanceTestEngine(config4)
    report4 = await engine4.run_performance_test()
    
    print("\n🏃‍♂️ HIGH CONCURRENCY TEST RESULTS:")
    print(f"   Success Rate: {report4.success_rate:.1f}%")
    print(f"   Avg Response: {report4.avg_response_time:.0f}ms")
    print(f"   Throughput: {report4.requests_per_second:.1f} RPS")
    print(f"   Grade: {report4.performance_grade}")
    
    # Test 5: Sustained Load Test (Extended Duration)
    print("\n⏱️ Test 5: Sustained Load Test (60s duration)")
    config5 = TestConfiguration(
        base_url="http://localhost:6101",
        total_requests=100,  # Requests per cycle
        concurrent_users=25,
        test_duration=60,
        load_pattern=LoadPattern.SUSTAINED,
        request_timeout=20,
        think_time=0.1
    )
    
    engine5 = PerformanceTestEngine(config5)
    report5 = await engine5.run_performance_test()
    
    print("\n⏱️ SUSTAINED LOAD TEST RESULTS:")
    print(f"   Success Rate: {report5.success_rate:.1f}%")
    print(f"   Avg Response: {report5.avg_response_time:.0f}ms")
    print(f"   Throughput: {report5.requests_per_second:.1f} RPS")
    print(f"   Grade: {report5.performance_grade}")
    
    # Aggregate Results and Final Assessment
    print("\n" + "=" * 70)
    print("📊 PHASE 3C: COMPREHENSIVE PERFORMANCE ANALYSIS")
    print("=" * 70)
    
    all_reports = [report1, report2, report3, report4, report5]
    test_names = ["Basic Load", "Ramp-Up", "Spike", "High Concurrency", "Sustained"]
    
    # Calculate aggregate metrics
    avg_success_rate = sum(r.success_rate for r in all_reports) / len(all_reports)
    avg_response_time = sum(r.avg_response_time for r in all_reports) / len(all_reports)
    avg_throughput = sum(r.requests_per_second for r in all_reports) / len(all_reports)
    max_concurrent_achieved = max(r.max_concurrent_users for r in all_reports)
    
    print("\n🎯 AGGREGATE PERFORMANCE METRICS:")
    print(f"   Average Success Rate: {avg_success_rate:.2f}%")
    print(f"   Average Response Time: {avg_response_time:.0f}ms")
    print(f"   Average Throughput: {avg_throughput:.1f} RPS")
    print(f"   Max Concurrent Users: {max_concurrent_achieved}")
    
    print("\n📈 TEST RESULTS SUMMARY:")
    for i, (name, report) in enumerate(zip(test_names, all_reports), 1):
        status = "✅ PASS" if report.meets_performance_requirements else "⚠️ REVIEW"
        print(f"   {i}. {name}: {status} (Grade: {report.performance_grade})")
    
    # Phase 3C Success Criteria Validation
    phase_3c_requirements = {
        "Average Success Rate > 95%": avg_success_rate >= 95.0,
        "Average Response Time < 2000ms": avg_response_time < 2000.0,
        "Average Throughput > 10 RPS": avg_throughput >= 10.0,
        "Handle 50+ Concurrent Users": max_concurrent_achieved >= 50,
        "All Tests Meet Requirements": all(r.meets_performance_requirements for r in all_reports)
    }
    
    print("\n🏆 PHASE 3C SUCCESS CRITERIA:")
    all_requirements_met = True
    for requirement, met in phase_3c_requirements.items():
        status = "✅ MET" if met else "❌ NOT MET"
        print(f"   {requirement}: {status}")
        if not met:
            all_requirements_met = False
    
    # Final Phase 3C Assessment
    print("\n" + "=" * 70)
    if all_requirements_met:
        print("🎉 PHASE 3C: PERFORMANCE & SCALABILITY VALIDATION - SUCCESS!")
        print("✅ System demonstrates excellent production-ready performance")
        print("✅ Scalability validated with high concurrent user handling")
        print("✅ Response times remain optimal under various load patterns")
        print("✅ Throughput exceeds requirements across all test scenarios")
        print("✅ Ready for high-scale production deployment")
        
        # Update todo list to completed
        print("\n🔄 Updating Phase 3C status to COMPLETED")
        
    else:
        print("⚠️ PHASE 3C: Performance optimization required")
        print("🔧 Review individual test results and recommendations")
        print("📊 Focus on improving areas that did not meet requirements")
        
    print("=" * 70)
    
    # Generate detailed report for the best performing test
    best_report = max(all_reports, key=lambda r: (r.success_rate, -r.avg_response_time))
    best_test_index = all_reports.index(best_report)
    best_test_name = test_names[best_test_index]
    
    print(f"\n📋 DETAILED REPORT - BEST PERFORMANCE ({best_test_name}):")
    print_performance_report(best_report)
    
    return all_requirements_met


if __name__ == "__main__":
    # Run the Phase 3C validation
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ Performance validation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Performance validation failed: {e}")
        sys.exit(1)
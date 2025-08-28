#!/usr/bin/env python3
"""
Comprehensive test suite for RomAI monitoring integration
Tests all components and validates functionality
"""

import asyncio
import logging
import sys
import aiohttp
import json
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MonitoringIntegrationTester:
    """Test suite for monitoring integration"""
    
    def __init__(self):
        self.romai_server = "http://localhost:6101"
        self.enterprise_api = "http://localhost:8001" 
        self.monitoring_integration = "http://localhost:6102"
        self.results = {
            "component_tests": {},
            "integration_tests": {},
            "performance_tests": {}
        }
    
    async def test_romai_server_health(self):
        """Test RomAI main server health"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.romai_server}/health", timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.results["component_tests"]["romai_server"] = {
                            "status": "healthy",
                            "response_time_ms": response.headers.get("x-response-time", "unknown"),
                            "data": data
                        }
                        logger.info("✅ RomAI Server: HEALTHY")
                        return True
                    else:
                        logger.error(f"❌ RomAI Server: HTTP {response.status}")
                        return False
        except Exception as e:
            logger.error(f"❌ RomAI Server: {e}")
            self.results["component_tests"]["romai_server"] = {"status": "error", "error": str(e)}
            return False
    
    async def test_mathematical_reasoning(self):
        """Test mathematical reasoning capability"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {"problem": "What is the square root of 144?"}
                async with session.post(
                    f"{self.romai_server}/api/v1/mathematical-reasoning/solve",
                    json=payload,
                    timeout=10
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.results["performance_tests"]["mathematical_reasoning"] = {
                            "status": "success",
                            "response": data
                        }
                        logger.info("✅ Mathematical Reasoning: SUCCESS")
                        return True
                    else:
                        logger.error(f"❌ Mathematical Reasoning: HTTP {response.status}")
                        return False
        except Exception as e:
            logger.error(f"❌ Mathematical Reasoning: {e}")
            return False
    
    async def test_logical_reasoning(self):
        """Test logical reasoning capability"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {"query": "All roses are flowers. This is a rose. What can we conclude?"}
                async with session.post(
                    f"{self.romai_server}/api/v1/logical-reasoning/analyze",
                    json=payload,
                    timeout=10
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.results["performance_tests"]["logical_reasoning"] = {
                            "status": "success", 
                            "response": data
                        }
                        logger.info("✅ Logical Reasoning: SUCCESS")
                        return True
                    else:
                        logger.error(f"❌ Logical Reasoning: HTTP {response.status}")
                        return False
        except Exception as e:
            logger.error(f"❌ Logical Reasoning: {e}")
            return False
    
    async def test_romanian_intelligence(self):
        """Test Romanian intelligence capability"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {"message": "Salut! Cum te cheamă?", "language": "ro"}
                async with session.post(
                    f"{self.romai_server}/api/v1/romanian-intelligence/chat",
                    json=payload,
                    timeout=10
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.results["performance_tests"]["romanian_intelligence"] = {
                            "status": "success",
                            "response": data
                        }
                        logger.info("✅ Romanian Intelligence: SUCCESS")
                        return True
                    else:
                        logger.error(f"❌ Romanian Intelligence: HTTP {response.status}")
                        return False
        except Exception as e:
            logger.error(f"❌ Romanian Intelligence: {e}")
            return False
    
    async def run_comprehensive_test(self):
        """Run all tests and generate report"""
        logger.info("🧪 Starting RomAI Production Monitoring Integration Test Suite")
        logger.info("=" * 70)
        
        # Test core server
        logger.info("\n📊 Testing Core Server Functionality...")
        await self.test_romai_server_health()
        
        # Test AI capabilities
        logger.info("\n🧠 Testing AI Reasoning Capabilities...")
        await self.test_mathematical_reasoning()
        await self.test_logical_reasoning()
        await self.test_romanian_intelligence()
        
        # Generate summary
        logger.info("\n📋 Test Summary")
        logger.info("=" * 30)
        
        component_tests = self.results["component_tests"]
        performance_tests = self.results["performance_tests"]
        
        logger.info(f"Component Tests: {len(component_tests)} completed")
        for name, result in component_tests.items():
            status = result.get("status", "unknown")
            logger.info(f"  • {name}: {status.upper()}")
        
        logger.info(f"Performance Tests: {len(performance_tests)} completed")
        for name, result in performance_tests.items():
            status = result.get("status", "unknown")
            logger.info(f"  • {name}: {status.upper()}")
        
        # Calculate success rate
        total_tests = len(component_tests) + len(performance_tests)
        successful_tests = sum(1 for result in {**component_tests, **performance_tests}.values() 
                              if result.get("status") in ["healthy", "success"])
        
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        logger.info(f"\n🎯 Overall Success Rate: {success_rate:.1f}% ({successful_tests}/{total_tests})")
        
        if success_rate >= 80:
            logger.info("🎉 MONITORING INTEGRATION: PRODUCTION READY!")
        elif success_rate >= 60:
            logger.info("⚠️ MONITORING INTEGRATION: NEEDS ATTENTION")
        else:
            logger.info("🚨 MONITORING INTEGRATION: CRITICAL ISSUES")
        
        # Save results
        results_file = Path("monitoring_integration_test_results.json")
        with open(results_file, "w") as f:
            json.dump(self.results, f, indent=2)
        logger.info(f"💾 Detailed results saved to: {results_file}")

async def main():
    """Main test execution"""
    tester = MonitoringIntegrationTester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())
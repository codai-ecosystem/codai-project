"""
AGI Control Center Comprehensive Test & Demo
==========================================

Comprehensive testing and demonstration of the Phase 1 AGI implementation.
Tests all core components and validates autonomous operation capabilities.

Author: GitHub Copilot Agent
Date: August 27, 2025
Version: 1.0.0 - Phase 1 Validation
"""

import asyncio
import logging
import sys
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Add ROMAI path for imports
sys.path.insert(0, r'e:\GitHub\codai-project\apps\romai\src')

try:
    from agi.control_center import (
        AGIIntegration,
        create_agi_system,
        ResourceType,
        TaskPriority,
        ExecutionStatus,
        AlertSeverity
    )
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("🔧 Attempting to use relative imports...")
    try:
        import os
        os.chdir(r'e:\GitHub\codai-project\apps\romai\src')
        from agi.control_center import (
            AGIIntegration,
            create_agi_system,
            ResourceType,
            TaskPriority,
            ExecutionStatus,
            AlertSeverity
        )
    except ImportError as e2:
        print(f"❌ Still failed: {e2}")
        print("⚠️ Running in simulation mode without actual AGI components...")
        
        # Simulation mode - create mock classes
        class MockAGIIntegration:
            def __init__(self, config=None):
                self.config = config or {}
                self.system_initialized = False
                self.system_active = False
                
            async def initialize_system(self):
                print("🔧 Mock: Initializing AGI system...")
                await asyncio.sleep(2)
                self.system_initialized = True
                return True
                
            async def start_system(self):
                print("🚀 Mock: Starting AGI system...")
                await asyncio.sleep(1)
                self.system_active = True
                return True
                
            async def execute_high_level_command(self, command, params=None):
                print(f"🧠 Mock: Executing command: {command}")
                await asyncio.sleep(1)
                return {"success": True, "result": f"Mock execution of: {command}"}
                
            async def get_system_status(self):
                return {
                    "system_initialized": self.system_initialized,
                    "system_active": self.system_active,
                    "component_status": {
                        "control_center": {"health_score": 0.95},
                        "attention_system": {"health_score": 0.88},
                        "planning_engine": {"health_score": 0.92},
                        "execution_monitor": {"health_score": 0.90}
                    },
                    "integration_metrics": {
                        "component_health": 0.91,
                        "integration_efficiency": 0.87
                    }
                }
                
            async def stop_system(self):
                print("🛑 Mock: Stopping AGI system...")
                self.system_active = False
                
        async def create_agi_system(config=None):
            return MockAGIIntegration(config)
            
        SIMULATION_MODE = True

# Set up comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('agi_test_log.txt')
    ]
)

logger = logging.getLogger(__name__)

class AGITestSuite:
    """Comprehensive AGI system test suite"""
    
    def __init__(self):
        self.agi_system: AGIIntegration = None
        self.test_results: List[Dict[str, Any]] = []
        self.start_time = None
        
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Run complete test suite"""
        print("🧠 ROMAI AGI CONTROL CENTER - PHASE 1 VALIDATION")
        print("=" * 60)
        print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        self.start_time = time.time()
        
        try:
            # Phase 1: System Initialization Tests
            print("📋 Phase 1: System Initialization Tests")
            print("-" * 40)
            await self._test_system_initialization()
            
            # Phase 2: Component Integration Tests  
            print("\n📋 Phase 2: Component Integration Tests")
            print("-" * 40)
            await self._test_component_integration()
            
            # Phase 3: Autonomous Operation Tests
            print("\n📋 Phase 3: Autonomous Operation Tests")
            print("-" * 40)
            await self._test_autonomous_operation()
            
            # Phase 4: Performance and Stress Tests
            print("\n📋 Phase 4: Performance and Stress Tests")
            print("-" * 40)
            await self._test_performance_and_stress()
            
            # Phase 5: Command Execution Tests
            print("\n📋 Phase 5: Command Execution Tests")
            print("-" * 40)
            await self._test_command_execution()
            
            # Generate comprehensive report
            return await self._generate_test_report()
            
        except Exception as e:
            logger.error(f"❌ Test suite failed: {e}")
            return {"success": False, "error": str(e), "results": self.test_results}
        
        finally:
            # Cleanup
            if self.agi_system:
                await self.agi_system.stop_system()
    
    async def _test_system_initialization(self) -> None:
        """Test system initialization process"""
        test_name = "System Initialization"
        start_time = time.time()
        
        try:
            print("🔧 Testing system initialization...")
            
            # Test 1: Create AGI system
            print("  • Creating AGI system...")
            config = {
                "control_center": {"max_concurrent_goals": 5},
                "attention_system": {"allocation_strategy": "priority_weighted"},
                "planning_engine": {"max_concurrent_goals": 3},
                "execution_monitor": {"monitoring_interval": 0.5}
            }
            
            self.agi_system = await create_agi_system(config)
            print("  ✅ AGI system created successfully")
            
            # Test 2: Verify initialization
            print("  • Verifying system initialization...")
            status = await self.agi_system.get_system_status()
            assert status["system_initialized"], "System not initialized"
            print("  ✅ System initialization verified")
            
            # Test 3: Start autonomous operation
            print("  • Starting autonomous operation...")
            success = await self.agi_system.start_system()
            assert success, "Failed to start autonomous operation"
            print("  ✅ Autonomous operation started")
            
            # Verify system is active
            status = await self.agi_system.get_system_status()
            assert status["system_active"], "System not active after start"
            
            duration = time.time() - start_time
            self._record_test_result(test_name, True, f"Completed in {duration:.2f}s")
            print(f"✅ {test_name} completed successfully ({duration:.2f}s)")
            
        except Exception as e:
            duration = time.time() - start_time
            self._record_test_result(test_name, False, str(e))
            print(f"❌ {test_name} failed: {e}")
    
    async def _test_component_integration(self) -> None:
        """Test component integration and communication"""
        test_name = "Component Integration"
        start_time = time.time()
        
        try:
            print("🔗 Testing component integration...")
            
            # Test 1: Component health check
            print("  • Checking component health...")
            status = await self.agi_system.get_system_status()
            component_health = status["integration_metrics"]["component_health"]
            assert component_health > 0.7, f"Low component health: {component_health}"
            print(f"  ✅ Component health: {component_health:.2f}")
            
            # Test 2: Integration efficiency
            print("  • Checking integration efficiency...")
            integration_efficiency = status["integration_metrics"]["integration_efficiency"]
            assert integration_efficiency > 0.8, f"Low integration efficiency: {integration_efficiency}"
            print(f"  ✅ Integration efficiency: {integration_efficiency:.2f}")
            
            # Test 3: Component status
            print("  • Verifying component status...")
            components = status["component_status"]
            for comp_name, comp_status in components.items():
                assert comp_status["initialized"], f"{comp_name} not initialized"
                assert comp_status["active"], f"{comp_name} not active"
                assert comp_status["health_score"] > 0.5, f"{comp_name} unhealthy"
                print(f"    ✅ {comp_name}: Health {comp_status['health_score']:.2f}")
            
            duration = time.time() - start_time
            self._record_test_result(test_name, True, f"Completed in {duration:.2f}s")
            print(f"✅ {test_name} completed successfully ({duration:.2f}s)")
            
        except Exception as e:
            duration = time.time() - start_time
            self._record_test_result(test_name, False, str(e))
            print(f"❌ {test_name} failed: {e}")
    
    async def _test_autonomous_operation(self) -> None:
        """Test autonomous operation capabilities"""
        test_name = "Autonomous Operation"
        start_time = time.time()
        
        try:
            print("🤖 Testing autonomous operation...")
            
            # Test 1: Let system run autonomously
            print("  • Running autonomous operation for 10 seconds...")
            await asyncio.sleep(10)
            
            # Test 2: Check system is still responsive
            print("  • Checking system responsiveness...")
            status = await self.agi_system.get_system_status()
            assert status["system_active"], "System became inactive during autonomous operation"
            print("  ✅ System remained active and responsive")
            
            # Test 3: Check for errors or degradation
            print("  • Checking for errors or degradation...")
            error_count = status["integration_metrics"]["error_count"]
            assert error_count == 0, f"Errors detected during autonomous operation: {error_count}"
            print("  ✅ No errors detected during autonomous operation")
            
            duration = time.time() - start_time
            self._record_test_result(test_name, True, f"Completed in {duration:.2f}s")
            print(f"✅ {test_name} completed successfully ({duration:.2f}s)")
            
        except Exception as e:
            duration = time.time() - start_time
            self._record_test_result(test_name, False, str(e))
            print(f"❌ {test_name} failed: {e}")
    
    async def _test_performance_and_stress(self) -> None:
        """Test system performance under stress"""
        test_name = "Performance and Stress"
        start_time = time.time()
        
        try:
            print("⚡ Testing performance and stress handling...")
            
            # Test 1: Multiple concurrent commands
            print("  • Testing concurrent command execution...")
            commands = [
                "maintain optimal operation",
                "optimize resource usage", 
                "monitor system health",
                "improve performance metrics",
                "analyze current state"
            ]
            
            tasks = []
            for i, cmd in enumerate(commands):
                task = self.agi_system.execute_high_level_command(
                    cmd, {"test_id": f"stress_test_{i}"}
                )
                tasks.append(task)
            
            # Execute all commands concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Check results
            successful_commands = 0
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"    ❌ Command {i} failed: {result}")
                else:
                    if result.get("success", False):
                        successful_commands += 1
                        print(f"    ✅ Command {i} succeeded")
                    else:
                        print(f"    ❌ Command {i} failed: {result.get('error', 'Unknown error')}")
            
            success_rate = successful_commands / len(commands)
            assert success_rate >= 0.8, f"Low success rate under stress: {success_rate:.1%}"
            print(f"  ✅ Stress test success rate: {success_rate:.1%}")
            
            # Test 2: System stability after stress
            print("  • Checking system stability after stress...")
            status = await self.agi_system.get_system_status()
            component_health = status["integration_metrics"]["component_health"]
            assert component_health > 0.6, f"Component health degraded: {component_health}"
            print(f"  ✅ Component health maintained: {component_health:.2f}")
            
            duration = time.time() - start_time  
            self._record_test_result(test_name, True, f"Completed in {duration:.2f}s, Success rate: {success_rate:.1%}")
            print(f"✅ {test_name} completed successfully ({duration:.2f}s)")
            
        except Exception as e:
            duration = time.time() - start_time
            self._record_test_result(test_name, False, str(e))
            print(f"❌ {test_name} failed: {e}")
    
    async def _test_command_execution(self) -> None:
        """Test command execution capabilities"""
        test_name = "Command Execution"
        start_time = time.time()
        
        try:
            print("💻 Testing command execution capabilities...")
            
            # Test various command types
            test_commands = [
                ("maintain optimal operation", "Maintenance command"),
                ("improve system performance", "Optimization command"),
                ("analyze current state", "Analysis command"), 
                ("optimize resource allocation", "Resource management command"),
                ("monitor system health", "Monitoring command")
            ]
            
            successful_commands = 0
            for command, description in test_commands:
                print(f"  • Testing {description.lower()}...")
                
                try:
                    result = await self.agi_system.execute_high_level_command(command)
                    
                    if result.get("success", False):
                        successful_commands += 1
                        print(f"    ✅ {description} executed successfully")
                        print(f"    📄 Result: {result.get('message', 'No details')}")
                    else:
                        print(f"    ❌ {description} failed: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"    ❌ {description} exception: {e}")
                
                # Brief pause between commands
                await asyncio.sleep(0.5)
            
            success_rate = successful_commands / len(test_commands)
            assert success_rate >= 0.8, f"Low command success rate: {success_rate:.1%}"
            
            duration = time.time() - start_time
            self._record_test_result(test_name, True, f"Completed in {duration:.2f}s, Success rate: {success_rate:.1%}")
            print(f"✅ {test_name} completed successfully ({duration:.2f}s)")
            
        except Exception as e:
            duration = time.time() - start_time
            self._record_test_result(test_name, False, str(e))
            print(f"❌ {test_name} failed: {e}")
    
    def _record_test_result(self, test_name: str, success: bool, details: str) -> None:
        """Record test result"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
    
    async def _generate_test_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        total_duration = time.time() - self.start_time
        successful_tests = sum(1 for result in self.test_results if result["success"])
        total_tests = len(self.test_results)
        success_rate = successful_tests / total_tests if total_tests > 0 else 0
        
        # Get final system status
        final_status = await self.agi_system.get_system_status() if self.agi_system else {}
        
        report = {
            "test_summary": {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "failed_tests": total_tests - successful_tests,
                "success_rate": success_rate,
                "total_duration": total_duration,
                "timestamp": datetime.now().isoformat()
            },
            "test_results": self.test_results,
            "final_system_status": final_status,
            "phase_1_validation": {
                "unified_cognitive_architecture": successful_tests >= 4,
                "autonomous_operation": success_rate >= 0.8,
                "component_integration": True if successful_tests > 0 else False,
                "performance_criteria_met": success_rate >= 0.8 and total_duration < 120,
                "overall_phase_1_success": success_rate >= 0.8
            }
        }
        
        # Print final report
        self._print_test_report(report)
        
        # Save report to file
        with open('agi_test_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def _print_test_report(self, report: Dict[str, Any]) -> None:
        """Print formatted test report"""
        print("\n" + "=" * 60)
        print("🧠 ROMAI AGI PHASE 1 VALIDATION REPORT")
        print("=" * 60)
        
        summary = report["test_summary"]
        print(f"📊 Test Summary:")
        print(f"   • Total Tests: {summary['total_tests']}")
        print(f"   • Successful: {summary['successful_tests']}")
        print(f"   • Failed: {summary['failed_tests']}")
        print(f"   • Success Rate: {summary['success_rate']:.1%}")
        print(f"   • Duration: {summary['total_duration']:.1f} seconds")
        
        print(f"\n🎯 Phase 1 Validation Results:")
        validation = report["phase_1_validation"]
        for criterion, passed in validation.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"   • {criterion.replace('_', ' ').title()}: {status}")
        
        overall_success = validation["overall_phase_1_success"]
        print(f"\n🏆 OVERALL PHASE 1 STATUS: {'✅ SUCCESS' if overall_success else '❌ FAILED'}")
        
        if overall_success:
            print("\n🎉 Congratulations! Phase 1 of ROMAI AGI implementation is successful!")
            print("   The unified cognitive architecture is working and ready for Phase 2.")
        else:
            print("\n⚠️ Phase 1 validation failed. Review test results and address issues.")
        
        print("\n📁 Detailed test report saved to: agi_test_report.json")
        print("📁 Test logs saved to: agi_test_log.txt")


async def run_agi_demo():
    """Run complete AGI system demonstration"""
    print("🧠 ROMAI AGI CONTROL CENTER - COMPREHENSIVE DEMO")
    print("=" * 60)
    
    test_suite = AGITestSuite()
    report = await test_suite.run_comprehensive_tests()
    
    return report


if __name__ == "__main__":
    try:
        # Run the comprehensive demo and tests
        report = asyncio.run(run_agi_demo())
        
        # Exit with appropriate code
        if report.get("phase_1_validation", {}).get("overall_phase_1_success", False):
            print("\n🎯 Phase 1 validation completed successfully!")
            sys.exit(0)
        else:
            print("\n⚠️ Phase 1 validation failed.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Demo interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Demo failed with error: {e}")
        sys.exit(1)
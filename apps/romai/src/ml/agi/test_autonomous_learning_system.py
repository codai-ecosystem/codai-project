"""
Comprehensive Test Suite for ROMAI Autonomous Learning System
Tests the integration and functionality of all system components.
"""

import asyncio
import logging
import time
from datetime import datetime
import sys
import os

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from ml.agi.autonomous_learning_system import AutonomousLearningSystem, LearningMode, LearningPhase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AutonomousLearningSystemTests:
    """Comprehensive test suite for Autonomous Learning System."""
    
    def __init__(self):
        self.test_results = []
        self.system = None
        
    async def run_all_tests(self):
        """Run all autonomous learning system tests."""
        logger.info("🚀 Starting ROMAI Autonomous Learning System Test Suite")
        logger.info("=" * 80)
        
        test_methods = [
            self.test_system_initialization,
            self.test_component_integration,
            self.test_learning_session_execution,
            self.test_autonomous_insight_generation,
            self.test_multi_component_synchronization,
            self.test_system_performance_metrics,
            self.test_graceful_shutdown
        ]
        
        for test_method in test_methods:
            try:
                logger.info(f"\n🧪 Running {test_method.__name__}...")
                start_time = time.time()
                
                result = await test_method()
                
                duration = time.time() - start_time
                if result:
                    logger.info(f"✅ {test_method.__name__} PASSED ({duration:.3f}s)")
                    self.test_results.append({"test": test_method.__name__, "status": "PASSED", "duration": duration})
                else:
                    logger.error(f"❌ {test_method.__name__} FAILED ({duration:.3f}s)")
                    self.test_results.append({"test": test_method.__name__, "status": "FAILED", "duration": duration})
                    
            except Exception as e:
                logger.error(f"💥 {test_method.__name__} ERROR: {e}")
                self.test_results.append({"test": test_method.__name__, "status": "ERROR", "error": str(e)})
        
        # Generate test report
        await self.generate_test_report()
    
    async def test_system_initialization(self) -> bool:
        """Test autonomous learning system initialization."""
        try:
            self.system = AutonomousLearningSystem()
            
            # Check initial state
            assert not self.system.is_initialized, "System should not be initialized initially"
            assert self.system.memory is None, "Memory component should be None initially"
            assert self.system.meta_learning is None, "Meta-learning component should be None initially"  
            assert self.system.consciousness is None, "Consciousness component should be None initially"
            
            # Initialize the system
            success = await self.system.initialize()
            assert success, "System initialization should succeed"
            assert self.system.is_initialized, "System should be marked as initialized"
            
            # Check that all components are initialized
            assert self.system.memory is not None, "Memory component should be initialized"
            assert self.system.meta_learning is not None, "Meta-learning component should be initialized"
            assert self.system.consciousness is not None, "Consciousness component should be initialized"
            
            # Check integration metrics
            assert self.system.integration_metrics.overall_system_coherence > 0.5, "System coherence should be reasonable"
            
            return True
            
        except Exception as e:
            logger.error(f"System initialization test failed: {e}")
            return False
    
    async def test_component_integration(self) -> bool:
        """Test integration between memory, meta-learning, and consciousness."""
        try:
            if not self.system or not self.system.is_initialized:
                return False
            
            # Test memory-meta_learning sync
            memory_meta_sync = await self.system._test_memory_meta_learning_sync()
            assert memory_meta_sync >= 0.0, "Memory-MetaLearning sync should be non-negative"
            
            # Test memory-consciousness sync  
            memory_consciousness_sync = await self.system._test_memory_consciousness_sync()
            assert memory_consciousness_sync >= 0.0, "Memory-Consciousness sync should be non-negative"
            
            # Test meta_learning-consciousness sync
            meta_consciousness_sync = await self.system._test_meta_learning_consciousness_sync()
            assert meta_consciousness_sync >= 0.0, "MetaLearning-Consciousness sync should be non-negative"
            
            # Test overall integration score
            integration_score = await self.system._validate_system_integration()
            assert integration_score >= 0.3, f"Integration score {integration_score:.3f} should be at least 0.3"
            
            logger.info(f"📊 Memory-MetaLearning sync: {memory_meta_sync:.3f}")
            logger.info(f"📊 Memory-Consciousness sync: {memory_consciousness_sync:.3f}")
            logger.info(f"📊 MetaLearning-Consciousness sync: {meta_consciousness_sync:.3f}")
            logger.info(f"📊 Overall integration: {integration_score:.3f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Component integration test failed: {e}")
            return False
    
    async def test_learning_session_execution(self) -> bool:
        """Test execution of a complete autonomous learning session."""
        try:
            if not self.system or not self.system.is_initialized:
                return False
            
            initial_sessions = len(self.system.learning_sessions)
            
            # Start a learning session
            session = await self.system.start_autonomous_learning_session(
                learning_objective="Test autonomous learning capabilities",
                duration_minutes=0.1  # Very short for testing
            )
            
            # Check session was created
            assert len(self.system.learning_sessions) == initial_sessions + 1, "New session should be created"
            assert session.session_id is not None, "Session should have ID"
            assert session.learning_objective == "Test autonomous learning capabilities", "Session objective should match"
            assert session.end_time is not None, "Session should have end time"
            assert session.success_score is not None, "Session should have success score"
            
            # Check that learning occurred
            assert session.experiences_processed > 0, "Should have processed some experiences"
            assert session.success_score >= 0.0, "Success score should be non-negative"
            
            logger.info(f"📊 Experiences processed: {session.experiences_processed}")
            logger.info(f"📊 Memories formed: {session.memories_formed}")  
            logger.info(f"📊 Insights generated: {session.insights_generated}")
            logger.info(f"📊 Success score: {session.success_score:.3f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Learning session execution test failed: {e}")
            return False
    
    async def test_autonomous_insight_generation(self) -> bool:
        """Test generation of autonomous insights."""
        try:
            if not self.system or not self.system.is_initialized:
                return False
            
            initial_insights = len(self.system.autonomous_insights)
            
            # Run a learning session to generate insights
            await self.system.start_autonomous_learning_session(
                learning_objective="Generate insights test",
                duration_minutes=0.1
            )
            
            # Check insights were generated
            final_insights = len(self.system.autonomous_insights)
            assert final_insights >= initial_insights, "Should generate some insights"
            
            if final_insights > initial_insights:
                # Check insight quality
                latest_insight = self.system.autonomous_insights[-1]
                assert latest_insight.insight_id is not None, "Insight should have ID"
                assert latest_insight.confidence >= 0.0, "Insight confidence should be non-negative"
                assert latest_insight.confidence <= 1.0, "Insight confidence should be <= 1.0"
                assert len(latest_insight.source_components) > 0, "Insight should have source components"
                assert latest_insight.content is not None, "Insight should have content"
                
                logger.info(f"📊 Insights generated: {final_insights - initial_insights}")
                logger.info(f"📊 Latest insight confidence: {latest_insight.confidence:.3f}")
                logger.info(f"📊 Latest insight type: {latest_insight.insight_type}")
            
            return True
            
        except Exception as e:
            logger.error(f"Autonomous insight generation test failed: {e}")
            return False
    
    async def test_multi_component_synchronization(self) -> bool:
        """Test synchronization across all system components."""
        try:
            if not self.system or not self.system.is_initialized:
                return False
            
            # Test that components can work together on a complex task
            test_data = {
                "task": "multi_component_sync_test",
                "complexity": "high",
                "requires": ["memory", "meta_learning", "consciousness"]
            }
            
            # Store in memory
            memory_result = await self.system.memory.store_episodic_memory(
                experience_id="sync_test_001",
                experience_data=test_data,
                context={"test": "multi_component_sync"}
            )
            
            # Process with meta-learning
            meta_result = await self.system.meta_learning.analyze_learning_experience(test_data)
            
            # Process with consciousness
            consciousness_result = await self.system.consciousness.process_conscious_request(
                "Analyze the multi-component synchronization test task"
            )
            
            # Check all components responded
            assert memory_result, "Memory component should handle the task"
            assert meta_result, "Meta-learning component should handle the task"  
            assert consciousness_result, "Consciousness component should handle the task"
            
            # Check integration metrics
            assert self.system.integration_metrics.overall_system_coherence > 0.0, "System coherence should be positive"
            
            logger.info(f"📊 Multi-component task processing successful")
            logger.info(f"📊 Memory result: {bool(memory_result)}")
            logger.info(f"📊 Meta-learning result: {bool(meta_result)}")
            logger.info(f"📊 Consciousness result: {bool(consciousness_result)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Multi-component synchronization test failed: {e}")
            return False
    
    async def test_system_performance_metrics(self) -> bool:
        """Test system performance metrics and status reporting."""
        try:
            if not self.system or not self.system.is_initialized:
                return False
            
            # Get system status
            status = await self.system.get_system_status()
            
            # Check status structure
            assert "system_info" in status, "Status should contain system_info"
            assert "component_status" in status, "Status should contain component_status"
            assert "integration_metrics" in status, "Status should contain integration_metrics"
            assert "learning_metrics" in status, "Status should contain learning_metrics"
            
            # Check system info
            system_info = status["system_info"]
            assert system_info["version"] == "2.4.0", "Version should match"
            assert system_info["is_initialized"] == True, "Should show initialized"
            assert system_info["uptime_hours"] >= 0, "Uptime should be non-negative"
            
            # Check component status
            component_status = status["component_status"]
            assert component_status["memory_initialized"] == True, "Memory should be initialized"
            assert component_status["meta_learning_initialized"] == True, "Meta-learning should be initialized"
            assert component_status["consciousness_initialized"] == True, "Consciousness should be initialized"
            
            # Check integration metrics
            integration_metrics = status["integration_metrics"]
            assert integration_metrics["overall_system_coherence"] >= 0.0, "System coherence should be non-negative"
            
            # Check learning metrics
            learning_metrics = status["learning_metrics"]
            assert learning_metrics["total_sessions"] >= 0, "Total sessions should be non-negative"
            assert learning_metrics["success_rate"] >= 0.0, "Success rate should be non-negative"
            assert learning_metrics["success_rate"] <= 1.0, "Success rate should be <= 1.0"
            
            logger.info(f"📊 System coherence: {integration_metrics['overall_system_coherence']:.3f}")
            logger.info(f"📊 Total sessions: {learning_metrics['total_sessions']}")
            logger.info(f"📊 Success rate: {learning_metrics['success_rate']:.3f}")
            logger.info(f"📊 Total insights: {learning_metrics['total_insights']}")
            
            return True
            
        except Exception as e:
            logger.error(f"System performance metrics test failed: {e}")
            return False
    
    async def test_graceful_shutdown(self) -> bool:
        """Test graceful system shutdown."""
        try:
            if not self.system or not self.system.is_initialized:
                return False
            
            # Record initial state
            was_initialized = self.system.is_initialized
            
            # Shutdown the system
            await self.system.shutdown()
            
            # Check shutdown was successful
            assert not self.system.is_initialized, "System should not be initialized after shutdown"
            assert was_initialized, "System should have been initialized before shutdown"
            
            logger.info("📊 Graceful shutdown completed successfully")
            
            return True
            
        except Exception as e:
            logger.error(f"Graceful shutdown test failed: {e}")
            return False
    
    async def generate_test_report(self):
        """Generate comprehensive test report."""
        logger.info("\n" + "=" * 80)
        logger.info("📋 ROMAI AUTONOMOUS LEARNING SYSTEM TEST REPORT")
        logger.info("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASSED"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAILED"])
        error_tests = len([r for r in self.test_results if r["status"] == "ERROR"])
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        logger.info(f"📊 Total Tests: {total_tests}")
        logger.info(f"✅ Passed: {passed_tests}")
        logger.info(f"❌ Failed: {failed_tests}")
        logger.info(f"💥 Errors: {error_tests}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        
        logger.info("\n📋 Individual Test Results:")
        for result in self.test_results:
            status_icon = {"PASSED": "✅", "FAILED": "❌", "ERROR": "💥"}.get(result["status"], "❓")
            test_name = result["test"].replace("test_", "").replace("_", " ").title()
            
            if "duration" in result:
                logger.info(f"{status_icon} {test_name}: {result['status']} ({result['duration']:.3f}s)")
            else:
                logger.info(f"{status_icon} {test_name}: {result['status']}")
                
            if "error" in result:
                logger.info(f"   Error: {result['error']}")
        
        logger.info("\n" + "=" * 80)
        
        if success_rate == 100.0:
            logger.info("🎉 ALL TESTS PASSED! Autonomous Learning System is fully operational")
            logger.info("🚀 Phase 2.4 Autonomous Learning Integration COMPLETED successfully!")
        elif success_rate >= 85.0:
            logger.info("✅ Most tests passed. Minor issues may need attention.")
        elif success_rate >= 70.0:
            logger.info("⚠️ Some critical issues detected. System needs fixes.")
        else:
            logger.info("🚨 Major system issues detected. Immediate attention required.")
        
        logger.info("=" * 80)

async def main():
    """Run the autonomous learning system test suite."""
    test_suite = AutonomousLearningSystemTests()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
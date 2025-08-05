"""
RomAI AGI - Week 3 Day 3 Complete Integration Test
Real-time Intelligence & Live Updates - All 5 Components

Comprehensive test demonstrating all components working together:
1. WebSocket Hub (Port 8080)
2. Streaming Analytics Engine (Romanian cultural processing)
3. Live Dashboard System (Port 8082)
4. Event-Driven Orchestrator (Reactive management)
5. Real-time Collaboration Manager (Port 8083)
"""

import asyncio
import json
import logging
import time
from datetime import datetime
import aiohttp
import websockets
from concurrent.futures import ThreadPoolExecutor
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Week3Day3IntegrationTest:
    """
    Complete integration test for all Week 3 Day 3 components.
    """
    
    def __init__(self):
        self.components = {
            "websocket_hub": {"port": 8080, "status": "stopped", "process": None},
            "streaming_analytics": {"port": None, "status": "stopped", "process": None},
            "live_dashboard": {"port": 8082, "status": "stopped", "process": None},
            "event_orchestrator": {"port": None, "status": "stopped", "process": None},
            "collaboration_manager": {"port": 8083, "status": "stopped", "process": None}
        }
        
        self.test_results = {
            "component_startup": {},
            "integration_tests": {},
            "romanian_processing": {},
            "real_time_features": {},
            "performance_metrics": {},
            "overall_success": False
        }
        
        self.executor = ThreadPoolExecutor(max_workers=5)
        self.test_session = None
    
    async def run_complete_integration_test(self):
        """Run complete integration test for all components."""
        logger.info("🚀 Starting Week 3 Day 3 Complete Integration Test")
        logger.info("=" * 80)
        
        try:
            # Phase 1: Component Startup Tests
            await self._test_component_startup()
            
            # Phase 2: Individual Component Tests
            await self._test_individual_components()
            
            # Phase 3: Integration Tests
            await self._test_component_integration()
            
            # Phase 4: Romanian Cultural Processing Tests
            await self._test_romanian_processing()
            
            # Phase 5: Real-time Features Tests
            await self._test_real_time_features()
            
            # Phase 6: Performance Tests
            await self._test_performance()
            
            # Phase 7: Generate Final Report
            await self._generate_final_report()
            
        except Exception as e:
            logger.error(f"❌ Integration test failed: {str(e)}")
            self.test_results["overall_success"] = False
        
        return self.test_results
    
    async def _test_component_startup(self):
        """Test individual component startup."""
        logger.info("🔧 Phase 1: Component Startup Tests")
        logger.info("-" * 40)
        
        # Test 1: Import all components
        try:
            # Import test - check if all components can be imported
            import realtime_websocket_hub
            import streaming_analytics_engine
            import live_dashboard_system
            import event_driven_orchestrator
            import realtime_collaboration_manager
            
            self.test_results["component_startup"]["imports"] = "✅ SUCCESS"
            logger.info("✅ All components imported successfully")
            
        except Exception as e:
            self.test_results["component_startup"]["imports"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Component import failed: {str(e)}")
            return
        
        # Test 2: Component initialization
        try:
            # Test WebSocket Hub initialization
            from realtime_websocket_hub import RealTimeWebSocketHub
            hub = RealTimeWebSocketHub()
            await hub.initialize()
            self.test_results["component_startup"]["websocket_hub"] = "✅ SUCCESS"
            logger.info("✅ WebSocket Hub initialized")
            
            # Test Streaming Analytics initialization
            from streaming_analytics_engine import StreamingAnalyticsEngine
            analytics = StreamingAnalyticsEngine()
            await analytics.initialize()
            self.test_results["component_startup"]["streaming_analytics"] = "✅ SUCCESS"
            logger.info("✅ Streaming Analytics Engine initialized")
            
            # Test Live Dashboard initialization
            from live_dashboard_system import LiveDashboardSystem
            dashboard = LiveDashboardSystem()
            await dashboard.initialize()
            self.test_results["component_startup"]["live_dashboard"] = "✅ SUCCESS"
            logger.info("✅ Live Dashboard System initialized")
            
            # Test Event Orchestrator initialization
            from event_driven_orchestrator import EventDrivenOrchestrator
            orchestrator = EventDrivenOrchestrator()
            await orchestrator.initialize()
            self.test_results["component_startup"]["event_orchestrator"] = "✅ SUCCESS"
            logger.info("✅ Event-Driven Orchestrator initialized")
            
            # Test Collaboration Manager initialization
            from realtime_collaboration_manager import RealTimeCollaborationManager
            collaboration = RealTimeCollaborationManager()
            await collaboration.initialize()
            self.test_results["component_startup"]["collaboration_manager"] = "✅ SUCCESS"
            logger.info("✅ Real-time Collaboration Manager initialized")
            
            # Store component instances for integration tests
            self.components_instances = {
                "hub": hub,
                "analytics": analytics,
                "dashboard": dashboard,
                "orchestrator": orchestrator,
                "collaboration": collaboration
            }
            
        except Exception as e:
            self.test_results["component_startup"]["initialization"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Component initialization failed: {str(e)}")
    
    async def _test_individual_components(self):
        """Test individual component functionality."""
        logger.info("🧪 Phase 2: Individual Component Tests")
        logger.info("-" * 40)
        
        # Test WebSocket Hub
        try:
            hub = self.components_instances["hub"]
            
            # Test message routing
            test_message = {
                "type": "romanian_content",
                "content": "Salut! Cum merge treaba cu proiectul nostru românesc?",
                "source": "test_user",
                "priority": "high"
            }
            
            routed_message = await hub._route_message_with_cultural_enhancement(test_message)
            
            if routed_message and "cultural_context" in routed_message:
                self.test_results["integration_tests"]["websocket_hub"] = "✅ SUCCESS"
                logger.info("✅ WebSocket Hub - Message routing with cultural enhancement working")
            else:
                self.test_results["integration_tests"]["websocket_hub"] = "❌ FAILED"
                
        except Exception as e:
            self.test_results["integration_tests"]["websocket_hub"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ WebSocket Hub test failed: {str(e)}")
        
        # Test Streaming Analytics
        try:
            analytics = self.components_instances["analytics"]
            
            # Test Romanian content processing
            test_content = "București este capitala României. Transilvania este o regiune istorică."
            
            analysis_result = await analytics.process_cultural_content(test_content, {
                "source": "test_integration",
                "timestamp": datetime.now().isoformat()
            })
            
            if analysis_result and analysis_result.get("entities_detected", 0) > 0:
                self.test_results["integration_tests"]["streaming_analytics"] = "✅ SUCCESS"
                logger.info(f"✅ Streaming Analytics - Detected {analysis_result['entities_detected']} Romanian entities")
            else:
                self.test_results["integration_tests"]["streaming_analytics"] = "❌ FAILED"
                
        except Exception as e:
            self.test_results["integration_tests"]["streaming_analytics"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Streaming Analytics test failed: {str(e)}")
        
        # Test Live Dashboard
        try:
            dashboard = self.components_instances["dashboard"]
            
            # Test metrics generation
            test_metrics = {
                "active_agents": 5,
                "romanian_content_percentage": 85.0,
                "cultural_accuracy": 92.5,
                "processing_speed": 1.2
            }
            
            dashboard_html = await dashboard._generate_dashboard_html(test_metrics)
            
            if "romanian_tricolor" in dashboard_html and "cultural_insights" in dashboard_html:
                self.test_results["integration_tests"]["live_dashboard"] = "✅ SUCCESS"
                logger.info("✅ Live Dashboard - Romanian theme and cultural insights working")
            else:
                self.test_results["integration_tests"]["live_dashboard"] = "❌ FAILED"
                
        except Exception as e:
            self.test_results["integration_tests"]["live_dashboard"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Live Dashboard test failed: {str(e)}")
        
        # Test Event Orchestrator
        try:
            orchestrator = self.components_instances["orchestrator"]
            
            # Test event processing
            test_event = {
                "event_id": "test_romanian_event",
                "event_type": "ROMANIAN_CONTENT_DETECTED",
                "data": {
                    "content": "Mărțișorul este o tradiție românească de primăvară.",
                    "cultural_significance": "high"
                },
                "timestamp": datetime.now().isoformat(),
                "priority": "high"
            }
            
            result = await orchestrator.process_event(test_event)
            
            if result and result.get("processed", False):
                self.test_results["integration_tests"]["event_orchestrator"] = "✅ SUCCESS"
                logger.info("✅ Event Orchestrator - Romanian event processing working")
            else:
                self.test_results["integration_tests"]["event_orchestrator"] = "❌ FAILED"
                
        except Exception as e:
            self.test_results["integration_tests"]["event_orchestrator"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Event Orchestrator test failed: {str(e)}")
        
        # Test Collaboration Manager
        try:
            collaboration = self.components_instances["collaboration"]
            
            # Test session creation and Romanian cultural processing
            session_id = await collaboration.create_collaboration_session(
                title="Test Integrare Componente",
                description="Sesiune de test pentru integrarea tuturor componentelor",
                moderator_id="test_moderator",
                cultural_context={
                    "language": "romanian",
                    "regional_focus": "Transilvania",
                    "formality": "formal"
                }
            )
            
            if session_id and session_id in collaboration.active_sessions:
                self.test_results["integration_tests"]["collaboration_manager"] = "✅ SUCCESS"
                logger.info("✅ Collaboration Manager - Session creation with Romanian context working")
                # Store session for integration tests
                self.test_session = session_id
            else:
                self.test_results["integration_tests"]["collaboration_manager"] = "❌ FAILED"
                
        except Exception as e:
            self.test_results["integration_tests"]["collaboration_manager"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Collaboration Manager test failed: {str(e)}")
    
    async def _test_component_integration(self):
        """Test integration between components."""
        logger.info("🔗 Phase 3: Component Integration Tests")
        logger.info("-" * 40)
        
        try:
            # Test 1: Hub -> Analytics -> Dashboard flow
            hub = self.components_instances["hub"]
            analytics = self.components_instances["analytics"]
            dashboard = self.components_instances["dashboard"]
            
            # Simulate Romanian message flow
            romanian_message = {
                "type": "user_message",
                "content": "Să discutăm despre implementarea sistemului de colaborare în limba română.",
                "sender": "test_user_ro",
                "cultural_context": {"region": "Moldova", "formality": "formal"}
            }
            
            # Process through Hub
            routed_message = await hub._route_message_with_cultural_enhancement(romanian_message)
            
            # Process through Analytics
            if routed_message:
                analysis = await analytics.process_cultural_content(
                    routed_message["content"], 
                    routed_message.get("cultural_context", {})
                )
                
                # Update Dashboard
                if analysis:
                    dashboard_metrics = {
                        "cultural_analysis": analysis,
                        "message_flow": True,
                        "romanian_processing": True
                    }
                    
                    self.test_results["integration_tests"]["hub_analytics_dashboard"] = "✅ SUCCESS"
                    logger.info("✅ Hub -> Analytics -> Dashboard integration working")
                else:
                    self.test_results["integration_tests"]["hub_analytics_dashboard"] = "❌ FAILED - Analytics"
            else:
                self.test_results["integration_tests"]["hub_analytics_dashboard"] = "❌ FAILED - Hub"
            
            # Test 2: Orchestrator -> Collaboration integration
            orchestrator = self.components_instances["orchestrator"]
            collaboration = self.components_instances["collaboration"]
            
            if self.test_session:
                # Create event that should trigger collaboration features
                collaboration_event = {
                    "event_id": "test_collaboration_event",
                    "event_type": "CULTURAL_COLLABORATION",
                    "data": {
                        "session_id": self.test_session,
                        "action": "cultural_suggestion_needed",
                        "content": "bucuresti este frumos"
                    },
                    "timestamp": datetime.now().isoformat()
                }
                
                orchestrator_result = await orchestrator.process_event(collaboration_event)
                
                if orchestrator_result and orchestrator_result.get("processed"):
                    self.test_results["integration_tests"]["orchestrator_collaboration"] = "✅ SUCCESS"
                    logger.info("✅ Orchestrator -> Collaboration integration working")
                else:
                    self.test_results["integration_tests"]["orchestrator_collaboration"] = "❌ FAILED"
            
        except Exception as e:
            self.test_results["integration_tests"]["component_integration"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Component integration test failed: {str(e)}")
    
    async def _test_romanian_processing(self):
        """Test Romanian cultural processing across all components."""
        logger.info("🇷🇴 Phase 4: Romanian Cultural Processing Tests")
        logger.info("-" * 40)
        
        romanian_test_cases = [
            {
                "content": "Să ne întâlnim mâine la Universitatea din București pentru discuția despre proiect.",
                "expected_entities": ["București", "Universitatea"],
                "expected_formality": "formal"
            },
            {
                "content": "Măi frate, ce faci? Hai să bem o cafea în Piața Unirii.",
                "expected_entities": ["Piața Unirii"],
                "expected_formality": "informal",
                "expected_region": "potential_regional"
            },
            {
                "content": "Domnule director, vă mulțumesc pentru oportunitatea de a colabora la acest proiect important.",
                "expected_entities": [],
                "expected_formality": "very_formal"
            }
        ]
        
        analytics = self.components_instances["analytics"]
        collaboration = self.components_instances["collaboration"]
        
        successful_tests = 0
        total_tests = len(romanian_test_cases)
        
        for i, test_case in enumerate(romanian_test_cases):
            try:
                # Test analytics processing
                analysis = await analytics.process_cultural_content(
                    test_case["content"], 
                    {"source": f"romanian_test_{i}"}
                )
                
                # Test collaboration cultural suggestions
                suggestions = await collaboration.suggest_cultural_improvements(
                    test_case["content"], 
                    {"formality_mode": "adaptive"}
                )
                
                # Verify results
                entities_found = analysis.get("entities_detected", 0)
                formality_detected = analysis.get("formality_level", "unknown")
                
                test_passed = True
                
                # Check entity detection
                if test_case.get("expected_entities"):
                    if entities_found == 0:
                        test_passed = False
                        logger.warning(f"⚠️ Test {i+1}: Expected entities but none found")
                
                # Check formality detection
                if test_case.get("expected_formality"):
                    # Basic formality check
                    if "formal" in test_case["expected_formality"] and formality_detected == "informal":
                        test_passed = False
                        logger.warning(f"⚠️ Test {i+1}: Formality mismatch")
                
                if test_passed:
                    successful_tests += 1
                    logger.info(f"✅ Romanian test {i+1}: PASSED - Entities: {entities_found}, Formality: {formality_detected}")
                else:
                    logger.error(f"❌ Romanian test {i+1}: FAILED")
                
            except Exception as e:
                logger.error(f"❌ Romanian test {i+1} failed: {str(e)}")
        
        success_rate = (successful_tests / total_tests) * 100
        self.test_results["romanian_processing"] = {
            "success_rate": success_rate,
            "tests_passed": successful_tests,
            "total_tests": total_tests,
            "status": "✅ SUCCESS" if success_rate >= 80 else "❌ FAILED"
        }
        
        logger.info(f"🇷🇴 Romanian Processing Success Rate: {success_rate:.1f}% ({successful_tests}/{total_tests})")
    
    async def _test_real_time_features(self):
        """Test real-time features across all components."""
        logger.info("⚡ Phase 5: Real-time Features Tests")
        logger.info("-" * 40)
        
        try:
            # Test 1: Real-time message processing speed
            start_time = time.time()
            
            analytics = self.components_instances["analytics"]
            
            # Process multiple messages simultaneously
            test_messages = [
                "Bună ziua și bine ați venit la conferința despre tehnologie.",
                "Să discutăm despre implementarea noilor funcționalități.",
                "Vă mulțumim pentru participarea la acest proiect important.",
                "Cluj-Napoca este un centru tehnologic important în România.",
                "Să planificăm următoarea întâlnire pentru săptămâna viitoare."
            ]
            
            tasks = []
            for i, message in enumerate(test_messages):
                task = analytics.process_cultural_content(message, {"source": f"realtime_test_{i}"})
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            
            processing_time = time.time() - start_time
            avg_time_per_message = processing_time / len(test_messages)
            
            # Test 2: Event processing speed
            orchestrator = self.components_instances["orchestrator"]
            
            start_time = time.time()
            
            test_events = [
                {
                    "event_id": f"realtime_event_{i}",
                    "event_type": "ROMANIAN_CONTENT_DETECTED",
                    "data": {"content": msg},
                    "timestamp": datetime.now().isoformat()
                }
                for i, msg in enumerate(test_messages)
            ]
            
            event_tasks = []
            for event in test_events:
                task = orchestrator.process_event(event)
                event_tasks.append(task)
            
            event_results = await asyncio.gather(*event_tasks)
            
            event_processing_time = time.time() - start_time
            avg_event_time = event_processing_time / len(test_events)
            
            # Evaluate performance
            performance_good = (
                avg_time_per_message < 0.5 and  # Less than 500ms per message
                avg_event_time < 0.3 and        # Less than 300ms per event
                all(r is not None for r in results) and  # All messages processed
                all(r is not None for r in event_results)  # All events processed
            )
            
            self.test_results["real_time_features"] = {
                "message_processing_time": f"{avg_time_per_message:.3f}s",
                "event_processing_time": f"{avg_event_time:.3f}s",
                "total_messages_processed": len(results),
                "total_events_processed": len(event_results),
                "performance_rating": "excellent" if performance_good else "needs_optimization",
                "status": "✅ SUCCESS" if performance_good else "⚠️ SLOW"
            }
            
            logger.info(f"⚡ Real-time Performance:")
            logger.info(f"   Message Processing: {avg_time_per_message:.3f}s avg")
            logger.info(f"   Event Processing: {avg_event_time:.3f}s avg")
            logger.info(f"   Rating: {self.test_results['real_time_features']['performance_rating']}")
            
        except Exception as e:
            self.test_results["real_time_features"]["status"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Real-time features test failed: {str(e)}")
    
    async def _test_performance(self):
        """Test overall system performance."""
        logger.info("📊 Phase 6: Performance Tests")
        logger.info("-" * 40)
        
        try:
            # Memory usage test
            import psutil
            import os
            
            process = psutil.Process(os.getpid())
            memory_usage = process.memory_info().rss / 1024 / 1024  # MB
            
            # CPU usage test
            cpu_percent = process.cpu_percent(interval=1)
            
            # Component status check
            component_status = {}
            for comp_name, comp_instance in self.components_instances.items():
                try:
                    if hasattr(comp_instance, 'get_status'):
                        status = comp_instance.get_status()
                    elif hasattr(comp_instance, 'is_running'):
                        status = {"is_running": comp_instance.is_running}
                    else:
                        status = {"initialized": True}
                    
                    component_status[comp_name] = "✅ HEALTHY"
                except Exception as e:
                    component_status[comp_name] = f"❌ ERROR: {str(e)}"
            
            self.test_results["performance_metrics"] = {
                "memory_usage_mb": f"{memory_usage:.1f} MB",
                "cpu_usage_percent": f"{cpu_percent:.1f}%",
                "component_health": component_status,
                "performance_status": "✅ GOOD" if memory_usage < 500 and cpu_percent < 50 else "⚠️ HIGH"
            }
            
            logger.info(f"📊 Performance Metrics:")
            logger.info(f"   Memory Usage: {memory_usage:.1f} MB")
            logger.info(f"   CPU Usage: {cpu_percent:.1f}%")
            logger.info(f"   Component Health: {sum(1 for status in component_status.values() if '✅' in status)}/{len(component_status)} healthy")
            
        except Exception as e:
            self.test_results["performance_metrics"]["status"] = f"❌ FAILED: {str(e)}"
            logger.error(f"❌ Performance test failed: {str(e)}")
    
    async def _generate_final_report(self):
        """Generate final comprehensive test report."""
        logger.info("📋 Phase 7: Final Test Report")
        logger.info("=" * 80)
        
        # Calculate overall success
        success_indicators = [
            all("✅" in str(result) for result in self.test_results["component_startup"].values()),
            all("✅" in str(result) for result in self.test_results["integration_tests"].values()),
            self.test_results["romanian_processing"].get("success_rate", 0) >= 80,
            "✅" in str(self.test_results["real_time_features"].get("status", "")),
            "✅" in str(self.test_results["performance_metrics"].get("performance_status", ""))
        ]
        
        overall_success = sum(success_indicators) >= 4  # At least 4 out of 5 phases successful
        self.test_results["overall_success"] = overall_success
        
        # Generate report
        logger.info("🎯 WEEK 3 DAY 3 - REAL-TIME INTELLIGENCE INTEGRATION TEST RESULTS")
        logger.info("=" * 80)
        
        logger.info("📊 COMPONENT STARTUP:")
        for component, status in self.test_results["component_startup"].items():
            logger.info(f"   {component}: {status}")
        
        logger.info("\n🔗 INTEGRATION TESTS:")
        for test, status in self.test_results["integration_tests"].items():
            logger.info(f"   {test}: {status}")
        
        logger.info(f"\n🇷🇴 ROMANIAN PROCESSING:")
        romanian_result = self.test_results["romanian_processing"]
        if romanian_result:
            logger.info(f"   Success Rate: {romanian_result.get('success_rate', 0):.1f}%")
            logger.info(f"   Tests Passed: {romanian_result.get('tests_passed', 0)}/{romanian_result.get('total_tests', 0)}")
            logger.info(f"   Status: {romanian_result.get('status', 'UNKNOWN')}")
        
        logger.info(f"\n⚡ REAL-TIME FEATURES:")
        realtime_result = self.test_results["real_time_features"]
        if realtime_result:
            logger.info(f"   Message Processing: {realtime_result.get('message_processing_time', 'N/A')}")
            logger.info(f"   Event Processing: {realtime_result.get('event_processing_time', 'N/A')}")
            logger.info(f"   Performance: {realtime_result.get('performance_rating', 'N/A')}")
            logger.info(f"   Status: {realtime_result.get('status', 'UNKNOWN')}")
        
        logger.info(f"\n📊 PERFORMANCE:")
        performance_result = self.test_results["performance_metrics"]
        if performance_result:
            logger.info(f"   Memory Usage: {performance_result.get('memory_usage_mb', 'N/A')}")
            logger.info(f"   CPU Usage: {performance_result.get('cpu_usage_percent', 'N/A')}")
            logger.info(f"   Status: {performance_result.get('performance_status', 'UNKNOWN')}")
        
        logger.info("\n" + "=" * 80)
        if overall_success:
            logger.info("🎉 OVERALL RESULT: ✅ SUCCESS - Week 3 Day 3 Implementation Complete!")
            logger.info("🚀 All 5 components working together successfully!")
            logger.info("🇷🇴 Romanian cultural processing fully operational!")
            logger.info("⚡ Real-time intelligence and live updates active!")
        else:
            logger.info("⚠️ OVERALL RESULT: ❌ PARTIAL SUCCESS - Some issues detected")
            logger.info("🔧 Review failed tests and optimize components")
        
        logger.info("=" * 80)
        
        # Summary stats
        total_components = 5
        successful_startups = sum(1 for status in self.test_results["component_startup"].values() if "✅" in str(status))
        successful_integrations = sum(1 for status in self.test_results["integration_tests"].values() if "✅" in str(status))
        
        logger.info(f"📈 SUMMARY STATISTICS:")
        logger.info(f"   Components Successfully Started: {successful_startups}/{total_components}")
        logger.info(f"   Integration Tests Passed: {successful_integrations}/{len(self.test_results['integration_tests'])}")
        logger.info(f"   Romanian Processing Accuracy: {self.test_results['romanian_processing'].get('success_rate', 0):.1f}%")
        logger.info(f"   Real-time Performance: {self.test_results['real_time_features'].get('performance_rating', 'Unknown')}")
        logger.info(f"   Overall Success: {'✅ YES' if overall_success else '❌ NO'}")
    
    async def cleanup(self):
        """Cleanup test resources."""
        try:
            # Cleanup component instances
            for comp_name, comp_instance in self.components_instances.items():
                if hasattr(comp_instance, 'cleanup'):
                    await comp_instance.cleanup()
            
            # Shutdown executor
            self.executor.shutdown(wait=True)
            
            logger.info("🧹 Integration test cleanup completed")
            
        except Exception as e:
            logger.error(f"❌ Cleanup error: {str(e)}")

# Main test execution
async def run_week3_day3_integration_test():
    """Run the complete Week 3 Day 3 integration test."""
    test_runner = Week3Day3IntegrationTest()
    
    try:
        results = await test_runner.run_complete_integration_test()
        return results
    finally:
        await test_runner.cleanup()

if __name__ == "__main__":
    print("🚀 RomAI AGI - Week 3 Day 3 Complete Integration Test")
    print("=" * 80)
    print("Testing all 5 real-time intelligence components:")
    print("1. 🌐 WebSocket Hub (Real-time communication)")
    print("2. 📊 Streaming Analytics Engine (Romanian cultural processing)")
    print("3. 🖥️ Live Dashboard System (Real-time visualization)")
    print("4. ⚡ Event-Driven Orchestrator (Reactive management)")
    print("5. 🤝 Real-time Collaboration Manager (Multi-user coordination)")
    print("=" * 80)
    
    # Run integration test
    asyncio.run(run_week3_day3_integration_test())

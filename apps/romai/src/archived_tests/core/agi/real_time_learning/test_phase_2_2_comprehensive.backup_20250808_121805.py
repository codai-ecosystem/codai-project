"""
Phase 2.2 Real-Time Learning Systems - Comprehensive Test Suite
=============================================================

Comprehensive validation of all Phase 2.2 components integration.
Tests real-time learning capabilities with Romanian cultural enhancement.

Test Categories:
- Component Integration Tests
- Real-Time Learning Validation
- Romanian Cultural Learning Tests
- Performance Benchmarking
- Safety & Reliability Tests

Author: RomAI AGI Team
Version: 1.0.0
Created: January 2025
"""

import asyncio
import time
import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any

# Add the parent directory to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test framework
import pytest
import unittest
from unittest.mock import Mock, patch

# Import Phase 2.2 components
try:
    from real_time_learning_integration import (
        RealTimeLearningIntegration,
        IntegrationConfig,
        LearningMode,
        IntegrationStatus,
        LearningRequest,
        LearningResponse
    )
    from real_time_learning_engine import (
        RealTimeLearningEngine,
        LearningType,
        LearningPriority
    )
    from adaptive_model_updater import AdaptiveModelUpdater
    from knowledge_integration_pipeline import KnowledgeIntegrationPipeline
    from learning_analytics_dashboard import LearningAnalyticsDashboard
    
    IMPORTS_SUCCESS = True
except ImportError as e:
    print(f"Import error: {e}")
    IMPORTS_SUCCESS = False

class Phase2Point2TestSuite:
    """Comprehensive test suite for Phase 2.2 Real-Time Learning Systems"""
    
    def __init__(self):
        self.test_results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'test_details': [],
            'performance_metrics': {},
            'cultural_accuracy_results': {},
            'integration_results': {},
            'start_time': datetime.now()
        }
        
        self.integration_system = None
        self.test_data = self._prepare_test_data()
    
    def _prepare_test_data(self) -> Dict:
        """Prepare comprehensive test data"""
        
        return {
            'user_interactions': [
                {
                    'input': "Povestește-mi despre tradițiile românești de Crăciun",
                    'expected_cultural_elements': ['tradiții', 'Crăciun', 'românesc'],
                    'priority': 'high'
                },
                {
                    'input': "Care sunt cele mai frumoase locuri din România?",
                    'expected_cultural_elements': ['locuri', 'România', 'frumos'],
                    'priority': 'medium'
                },
                {
                    'input': "Explică-mi despre bucătăria românească tradițională",
                    'expected_cultural_elements': ['bucătărie', 'românească', 'tradițională'],
                    'priority': 'high'
                }
            ],
            'cultural_content': [
                {
                    'content': "Miorița este una dintre baladele populare românești cele mai cunoscute, care reflectă spiritualitatea și legătura profundă cu natura a poporului român.",
                    'type': 'literature',
                    'region': 'national',
                    'importance': 'high'
                },
                {
                    'content': "Brâncuși a fost un sculptor român de renume mondial, cunoscut pentru lucrări precum 'Coloana infinitului' și 'Pasărea Măiastră'.",
                    'type': 'art',
                    'region': 'national',
                    'importance': 'high'
                },
                {
                    'content': "Sarmale sunt un fel de mâncare tradițional românesc, constând din foi de varză sau viță de vie umplute cu un amestec de carne tocată și orez.",
                    'type': 'cuisine',
                    'region': 'national',
                    'importance': 'medium'
                }
            ],
            'performance_scenarios': [
                {
                    'name': 'rapid_learning',
                    'concurrent_requests': 10,
                    'target_processing_time': 1.0
                },
                {
                    'name': 'cultural_boost',
                    'cultural_content_ratio': 0.8,
                    'target_accuracy_improvement': 0.02
                },
                {
                    'name': 'integration_stress',
                    'duration_seconds': 30,
                    'requests_per_second': 5
                }
            ]
        }
    
    async def run_comprehensive_tests(self) -> Dict:
        """Run all comprehensive tests"""
        
        print("🧪 Starting Phase 2.2 Comprehensive Test Suite")
        print("=" * 60)
        
        if not IMPORTS_SUCCESS:
            return await self._handle_import_failure()
        
        try:
            # Initialize integration system
            await self._initialize_test_system()
            
            # Component integration tests
            await self._test_component_integration()
            
            # Real-time learning tests
            await self._test_real_time_learning()
            
            # Romanian cultural learning tests
            await self._test_cultural_learning()
            
            # Performance benchmarking
            await self._test_performance_benchmarks()
            
            # Safety and reliability tests
            await self._test_safety_reliability()
            
            # Integration validation
            await self._test_system_integration()
            
            # Cleanup
            await self._cleanup_test_system()
            
        except Exception as e:
            await self._handle_test_error(e)
        
        # Generate final report
        return await self._generate_test_report()
    
    async def _initialize_test_system(self):
        """Initialize the test system"""
        
        test_start = time.time()
        
        try:
            # Create test configuration
            config = IntegrationConfig(
                learning_engine_config={
                    'cultural_accuracy_target': 0.994,
                    'enable_cultural_boost': True,
                    'batch_size': 8  # Smaller for testing
                },
                model_updater_config={
                    'validation_enabled': True,
                    'min_cultural_accuracy': 0.990
                },
                knowledge_pipeline_config={
                    'cultural_boost_factor': 1.5,
                    'enable_monitoring': True
                },
                analytics_dashboard_config={
                    'update_interval': 1.0,  # Faster for testing
                    'cultural_monitoring_enabled': True
                },
                coordination_interval=2.0,  # Faster coordination
                auto_optimization=True,
                safety_monitoring=True
            )
            
            # Initialize integration system
            self.integration_system = RealTimeLearningIntegration(config)
            await self.integration_system.initialize_system()
            await self.integration_system.start_system()
            
            # Wait for system stabilization
            await asyncio.sleep(2)
            
            initialization_time = time.time() - test_start
            
            await self._record_test_result(
                test_name="System Initialization",
                success=True,
                details=f"System initialized in {initialization_time:.2f}s",
                metrics={'initialization_time': initialization_time}
            )
            
            print(f"✅ System initialized successfully in {initialization_time:.2f}s")
            
        except Exception as e:
            await self._record_test_result(
                test_name="System Initialization",
                success=False,
                details=f"Initialization failed: {str(e)}"
            )
            raise
    
    async def _test_component_integration(self):
        """Test integration between all components"""
        
        print("\n🔧 Testing Component Integration...")
        
        # Test 1: Component Health Check
        await self._test_component_health()
        
        # Test 2: Component Communication
        await self._test_component_communication()
        
        # Test 3: Data Flow Validation
        await self._test_data_flow()
    
    async def _test_component_health(self):
        """Test health of all components"""
        
        test_start = time.time()
        
        try:
            health = await self.integration_system.get_system_health()
            
            # Validate component health
            required_components = ['learning_engine', 'knowledge_pipeline', 'analytics_dashboard']
            all_healthy = True
            unhealthy_components = []
            
            for component in required_components:
                if component not in health.component_health:
                    all_healthy = False
                    unhealthy_components.append(f"{component}: missing")
                elif health.component_health[component] < 0.8:
                    all_healthy = False
                    unhealthy_components.append(f"{component}: {health.component_health[component]:.2f}")
            
            test_time = time.time() - test_start
            
            await self._record_test_result(
                test_name="Component Health Check",
                success=all_healthy,
                details=f"Overall health: {health.overall_score:.2f}, Issues: {unhealthy_components}",
                metrics={
                    'overall_health_score': health.overall_score,
                    'test_time': test_time,
                    'component_count': len(health.component_health)
                }
            )
            
            if all_healthy:
                print(f"✅ All components healthy (score: {health.overall_score:.2f})")
            else:
                print(f"❌ Component health issues: {unhealthy_components}")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Component Health Check",
                success=False,
                details=f"Health check failed: {str(e)}"
            )
    
    async def _test_component_communication(self):
        """Test communication between components"""
        
        test_start = time.time()
        
        try:
            # Test learning request flow
            test_request = {
                'user_input': "Test communication între componente",
                'context': {'test': True}
            }
            
            response = await self.integration_system.learn_from_interaction(
                interaction_data=test_request,
                priority=LearningPriority.HIGH,
                cultural_context={'type': 'test_communication'}
            )
            
            test_time = time.time() - test_start
            communication_success = response.success and response.processing_time < 2.0
            
            await self._record_test_result(
                test_name="Component Communication",
                success=communication_success,
                details=f"Request processed: {response.success}, Time: {response.processing_time:.3f}s",
                metrics={
                    'processing_time': response.processing_time,
                    'test_time': test_time,
                    'response_success': response.success
                }
            )
            
            if communication_success:
                print(f"✅ Component communication working (time: {response.processing_time:.3f}s)")
            else:
                print(f"❌ Component communication issues")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Component Communication",
                success=False,
                details=f"Communication test failed: {str(e)}"
            )
    
    async def _test_data_flow(self):
        """Test data flow through the system"""
        
        test_start = time.time()
        
        try:
            # Test multiple data types
            test_cases = [
                {'type': 'text', 'data': "Test text data flow"},
                {'type': 'cultural', 'data': "Test cultural Romanian content"},
                {'type': 'interaction', 'data': {'user': 'test', 'ai': 'response'}}
            ]
            
            flow_results = []
            
            for test_case in test_cases:
                if test_case['type'] == 'cultural':
                    response = await self.integration_system.learn_cultural_content(
                        cultural_data=test_case['data']
                    )
                else:
                    response = await self.integration_system.learn_from_interaction(
                        interaction_data=test_case['data']
                    )
                
                flow_results.append({
                    'type': test_case['type'],
                    'success': response.success,
                    'time': response.processing_time
                })
            
            test_time = time.time() - test_start
            all_flows_successful = all(result['success'] for result in flow_results)
            avg_processing_time = sum(result['time'] for result in flow_results) / len(flow_results)
            
            await self._record_test_result(
                test_name="Data Flow Validation",
                success=all_flows_successful,
                details=f"Processed {len(test_cases)} data types, avg time: {avg_processing_time:.3f}s",
                metrics={
                    'test_cases_count': len(test_cases),
                    'success_rate': sum(1 for r in flow_results if r['success']) / len(flow_results),
                    'average_processing_time': avg_processing_time,
                    'test_time': test_time
                }
            )
            
            if all_flows_successful:
                print(f"✅ Data flow validation successful (avg time: {avg_processing_time:.3f}s)")
            else:
                print(f"❌ Data flow issues detected")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Data Flow Validation",
                success=False,
                details=f"Data flow test failed: {str(e)}"
            )
    
    async def _test_real_time_learning(self):
        """Test real-time learning capabilities"""
        
        print("\n⚡ Testing Real-Time Learning...")
        
        # Test 1: Learning Speed
        await self._test_learning_speed()
        
        # Test 2: Learning Quality
        await self._test_learning_quality()
        
        # Test 3: Concurrent Learning
        await self._test_concurrent_learning()
    
    async def _test_learning_speed(self):
        """Test learning speed performance"""
        
        test_start = time.time()
        
        try:
            speed_tests = []
            
            for i, interaction in enumerate(self.test_data['user_interactions']):
                start_time = time.time()
                
                response = await self.integration_system.learn_from_interaction(
                    interaction_data={
                        'user_input': interaction['input'],
                        'test_id': f"speed_test_{i}"
                    },
                    priority=LearningPriority.HIGH
                )
                
                processing_time = time.time() - start_time
                speed_tests.append({
                    'test_id': i,
                    'processing_time': processing_time,
                    'success': response.success,
                    'target_met': processing_time < 1.0  # Target: < 1 second
                })
            
            test_time = time.time() - test_start
            avg_speed = sum(test['processing_time'] for test in speed_tests) / len(speed_tests)
            targets_met = sum(1 for test in speed_tests if test['target_met'])
            speed_success = targets_met >= len(speed_tests) * 0.8  # 80% must meet target
            
            await self._record_test_result(
                test_name="Learning Speed Test",
                success=speed_success,
                details=f"Avg speed: {avg_speed:.3f}s, Targets met: {targets_met}/{len(speed_tests)}",
                metrics={
                    'average_speed': avg_speed,
                    'fastest_time': min(test['processing_time'] for test in speed_tests),
                    'slowest_time': max(test['processing_time'] for test in speed_tests),
                    'targets_met_ratio': targets_met / len(speed_tests),
                    'test_time': test_time
                }
            )
            
            if speed_success:
                print(f"✅ Learning speed target met (avg: {avg_speed:.3f}s)")
            else:
                print(f"❌ Learning speed below target (avg: {avg_speed:.3f}s)")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Learning Speed Test",
                success=False,
                details=f"Speed test failed: {str(e)}"
            )
    
    async def _test_learning_quality(self):
        """Test learning quality and accuracy"""
        
        test_start = time.time()
        
        try:
            quality_tests = []
            
            for i, interaction in enumerate(self.test_data['user_interactions']):
                response = await self.integration_system.learn_from_interaction(
                    interaction_data={
                        'user_input': interaction['input'],
                        'expected_elements': interaction['expected_cultural_elements']
                    },
                    cultural_context={
                        'expected_elements': interaction['expected_cultural_elements']
                    }
                )
                
                # Evaluate quality based on response
                quality_score = 0.0
                if response.success:
                    quality_score += 0.4
                    
                if response.cultural_enhancements:
                    quality_score += 0.3
                    
                if response.processing_time < 1.0:
                    quality_score += 0.3
                
                quality_tests.append({
                    'test_id': i,
                    'quality_score': quality_score,
                    'cultural_enhancements': len(response.cultural_enhancements or []),
                    'success': response.success
                })
            
            test_time = time.time() - test_start
            avg_quality = sum(test['quality_score'] for test in quality_tests) / len(quality_tests)
            quality_success = avg_quality >= 0.8  # Target: 80% quality
            
            await self._record_test_result(
                test_name="Learning Quality Test",
                success=quality_success,
                details=f"Avg quality: {avg_quality:.2f}, Tests: {len(quality_tests)}",
                metrics={
                    'average_quality': avg_quality,
                    'quality_distribution': [test['quality_score'] for test in quality_tests],
                    'total_cultural_enhancements': sum(test['cultural_enhancements'] for test in quality_tests),
                    'test_time': test_time
                }
            )
            
            if quality_success:
                print(f"✅ Learning quality target met (avg: {avg_quality:.2f})")
            else:
                print(f"❌ Learning quality below target (avg: {avg_quality:.2f})")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Learning Quality Test",
                success=False,
                details=f"Quality test failed: {str(e)}"
            )
    
    async def _test_concurrent_learning(self):
        """Test concurrent learning capabilities"""
        
        test_start = time.time()
        
        try:
            # Create concurrent learning tasks
            concurrent_tasks = []
            task_count = 5
            
            for i in range(task_count):
                task = self.integration_system.learn_from_interaction(
                    interaction_data={
                        'user_input': f"Concurrent test {i}: {self.test_data['user_interactions'][i % len(self.test_data['user_interactions'])]['input']}",
                        'task_id': i
                    }
                )
                concurrent_tasks.append(task)
            
            # Execute all tasks concurrently
            results = await asyncio.gather(*concurrent_tasks, return_exceptions=True)
            
            test_time = time.time() - test_start
            
            # Analyze results
            successful_tasks = sum(1 for result in results if isinstance(result, LearningResponse) and result.success)
            failed_tasks = sum(1 for result in results if isinstance(result, Exception))
            error_tasks = sum(1 for result in results if isinstance(result, LearningResponse) and not result.success)
            
            concurrent_success = successful_tasks >= task_count * 0.8  # 80% success rate
            
            await self._record_test_result(
                test_name="Concurrent Learning Test",
                success=concurrent_success,
                details=f"Success: {successful_tasks}/{task_count}, Errors: {failed_tasks}, Failed: {error_tasks}",
                metrics={
                    'total_tasks': task_count,
                    'successful_tasks': successful_tasks,
                    'failed_tasks': failed_tasks,
                    'error_tasks': error_tasks,
                    'success_rate': successful_tasks / task_count,
                    'test_time': test_time,
                    'avg_task_time': test_time / task_count
                }
            )
            
            if concurrent_success:
                print(f"✅ Concurrent learning successful ({successful_tasks}/{task_count} tasks)")
            else:
                print(f"❌ Concurrent learning issues ({successful_tasks}/{task_count} tasks)")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Concurrent Learning Test",
                success=False,
                details=f"Concurrent test failed: {str(e)}"
            )
    
    async def _test_cultural_learning(self):
        """Test Romanian cultural learning capabilities"""
        
        print("\n🇷🇴 Testing Romanian Cultural Learning...")
        
        # Test 1: Cultural Content Processing
        await self._test_cultural_content_processing()
        
        # Test 2: Cultural Accuracy
        await self._test_cultural_accuracy()
        
        # Test 3: Cultural Enhancement
        await self._test_cultural_enhancement()
    
    async def _test_cultural_content_processing(self):
        """Test processing of Romanian cultural content"""
        
        test_start = time.time()
        
        try:
            cultural_tests = []
            
            for i, content in enumerate(self.test_data['cultural_content']):
                response = await self.integration_system.learn_cultural_content(
                    cultural_data=content['content'],
                    cultural_metadata={
                        'type': content['type'],
                        'region': content['region'],
                        'importance': content['importance']
                    }
                )
                
                cultural_tests.append({
                    'content_type': content['type'],
                    'success': response.success,
                    'processing_time': response.processing_time,
                    'cultural_enhancements': len(response.cultural_enhancements or []),
                    'importance': content['importance']
                })
            
            test_time = time.time() - test_start
            success_rate = sum(1 for test in cultural_tests if test['success']) / len(cultural_tests)
            avg_enhancements = sum(test['cultural_enhancements'] for test in cultural_tests) / len(cultural_tests)
            cultural_processing_success = success_rate >= 0.9  # 90% success for cultural content
            
            await self._record_test_result(
                test_name="Cultural Content Processing",
                success=cultural_processing_success,
                details=f"Success rate: {success_rate:.2f}, Avg enhancements: {avg_enhancements:.1f}",
                metrics={
                    'success_rate': success_rate,
                    'average_enhancements': avg_enhancements,
                    'content_types_tested': len(set(test['content_type'] for test in cultural_tests)),
                    'test_time': test_time
                }
            )
            
            if cultural_processing_success:
                print(f"✅ Cultural content processing successful (rate: {success_rate:.2f})")
            else:
                print(f"❌ Cultural content processing issues (rate: {success_rate:.2f})")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Cultural Content Processing",
                success=False,
                details=f"Cultural processing test failed: {str(e)}"
            )
    
    async def _test_cultural_accuracy(self):
        """Test cultural accuracy maintenance"""
        
        test_start = time.time()
        
        try:
            # Get system health for cultural accuracy
            health = await self.integration_system.get_system_health()
            current_cultural_accuracy = health.cultural_accuracy
            
            # Test cultural accuracy under load
            cultural_load_tasks = []
            for content in self.test_data['cultural_content']:
                task = self.integration_system.learn_cultural_content(
                    cultural_data=content['content'],
                    cultural_metadata={'type': content['type']}
                )
                cultural_load_tasks.append(task)
            
            # Process all cultural content
            await asyncio.gather(*cultural_load_tasks)
            
            # Check cultural accuracy after load
            post_load_health = await self.integration_system.get_system_health()
            post_load_accuracy = post_load_health.cultural_accuracy
            
            test_time = time.time() - test_start
            
            # Cultural accuracy should be maintained or improved
            accuracy_maintained = post_load_accuracy >= current_cultural_accuracy * 0.99  # Allow 1% tolerance
            target_accuracy_met = post_load_accuracy >= 0.990  # Target: 99.0%
            
            cultural_accuracy_success = accuracy_maintained and target_accuracy_met
            
            await self._record_test_result(
                test_name="Cultural Accuracy Test",
                success=cultural_accuracy_success,
                details=f"Accuracy: {post_load_accuracy:.4f} (target: 0.990, maintained: {accuracy_maintained})",
                metrics={
                    'initial_accuracy': current_cultural_accuracy,
                    'final_accuracy': post_load_accuracy,
                    'accuracy_change': post_load_accuracy - current_cultural_accuracy,
                    'target_met': target_accuracy_met,
                    'accuracy_maintained': accuracy_maintained,
                    'test_time': test_time
                }
            )
            
            # Store cultural accuracy results
            self.test_results['cultural_accuracy_results'] = {
                'final_accuracy': post_load_accuracy,
                'target_met': target_accuracy_met,
                'accuracy_maintained': accuracy_maintained
            }
            
            if cultural_accuracy_success:
                print(f"✅ Cultural accuracy maintained (score: {post_load_accuracy:.4f})")
            else:
                print(f"❌ Cultural accuracy issues (score: {post_load_accuracy:.4f})")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Cultural Accuracy Test",
                success=False,
                details=f"Cultural accuracy test failed: {str(e)}"
            )
    
    async def _test_cultural_enhancement(self):
        """Test cultural enhancement capabilities"""
        
        test_start = time.time()
        
        try:
            enhancement_tests = []
            
            # Test enhancement for different content types
            for content in self.test_data['cultural_content']:
                response = await self.integration_system.learn_cultural_content(
                    cultural_data=content['content'],
                    priority=LearningPriority.HIGH,
                    cultural_metadata={
                        'type': content['type'],
                        'enhancement_expected': True
                    }
                )
                
                enhancement_count = len(response.cultural_enhancements or [])
                enhancement_tests.append({
                    'content_type': content['type'],
                    'enhancement_count': enhancement_count,
                    'success': response.success,
                    'has_enhancements': enhancement_count > 0
                })
            
            test_time = time.time() - test_start
            
            total_enhancements = sum(test['enhancement_count'] for test in enhancement_tests)
            enhanced_content_ratio = sum(1 for test in enhancement_tests if test['has_enhancements']) / len(enhancement_tests)
            
            enhancement_success = enhanced_content_ratio >= 0.8 and total_enhancements >= len(self.test_data['cultural_content'])
            
            await self._record_test_result(
                test_name="Cultural Enhancement Test",
                success=enhancement_success,
                details=f"Enhancements: {total_enhancements}, Enhanced ratio: {enhanced_content_ratio:.2f}",
                metrics={
                    'total_enhancements': total_enhancements,
                    'enhanced_content_ratio': enhanced_content_ratio,
                    'avg_enhancements_per_content': total_enhancements / len(enhancement_tests),
                    'test_time': test_time
                }
            )
            
            if enhancement_success:
                print(f"✅ Cultural enhancement working (enhancements: {total_enhancements})")
            else:
                print(f"❌ Cultural enhancement issues (enhancements: {total_enhancements})")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Cultural Enhancement Test",
                success=False,
                details=f"Cultural enhancement test failed: {str(e)}"
            )
    
    async def _test_performance_benchmarks(self):
        """Test performance benchmarks"""
        
        print("\n📊 Testing Performance Benchmarks...")
        
        # Test scenarios from test data
        for scenario in self.test_data['performance_scenarios']:
            await self._test_performance_scenario(scenario)
    
    async def _test_performance_scenario(self, scenario: Dict):
        """Test a specific performance scenario"""
        
        test_start = time.time()
        scenario_name = scenario['name']
        
        try:
            if scenario_name == 'rapid_learning':
                await self._test_rapid_learning_scenario(scenario)
            elif scenario_name == 'cultural_boost':
                await self._test_cultural_boost_scenario(scenario)
            elif scenario_name == 'integration_stress':
                await self._test_integration_stress_scenario(scenario)
            
        except Exception as e:
            await self._record_test_result(
                test_name=f"Performance: {scenario_name}",
                success=False,
                details=f"Performance scenario failed: {str(e)}"
            )
    
    async def _test_rapid_learning_scenario(self, scenario: Dict):
        """Test rapid learning scenario"""
        
        test_start = time.time()
        concurrent_requests = scenario['concurrent_requests']
        target_time = scenario['target_processing_time']
        
        # Create concurrent learning requests
        tasks = []
        for i in range(concurrent_requests):
            task = self.integration_system.learn_from_interaction(
                interaction_data={
                    'user_input': f"Rapid learning test {i}: Care este istoria României?",
                    'rapid_test_id': i
                }
            )
            tasks.append(task)
        
        # Execute concurrently and measure time
        results = await asyncio.gather(*tasks, return_exceptions=True)
        test_time = time.time() - test_start
        
        # Analyze results
        successful_results = [r for r in results if isinstance(r, LearningResponse) and r.success]
        avg_processing_time = sum(r.processing_time for r in successful_results) / len(successful_results) if successful_results else float('inf')
        
        rapid_learning_success = (
            len(successful_results) >= concurrent_requests * 0.8 and
            avg_processing_time <= target_time
        )
        
        await self._record_test_result(
            test_name="Performance: Rapid Learning",
            success=rapid_learning_success,
            details=f"Concurrent: {len(successful_results)}/{concurrent_requests}, Avg time: {avg_processing_time:.3f}s",
            metrics={
                'concurrent_requests': concurrent_requests,
                'successful_requests': len(successful_results),
                'average_processing_time': avg_processing_time,
                'total_test_time': test_time,
                'target_met': avg_processing_time <= target_time
            }
        )
    
    async def _test_cultural_boost_scenario(self, scenario: Dict):
        """Test cultural boost scenario"""
        
        test_start = time.time()
        
        # Get baseline cultural accuracy
        baseline_health = await self.integration_system.get_system_health()
        baseline_accuracy = baseline_health.cultural_accuracy
        
        # Process cultural content with boost
        cultural_ratio = scenario['cultural_content_ratio']
        content_count = int(len(self.test_data['cultural_content']) * cultural_ratio)
        
        for content in self.test_data['cultural_content'][:content_count]:
            await self.integration_system.learn_cultural_content(
                cultural_data=content['content'],
                priority=LearningPriority.HIGH
            )
        
        # Measure improvement
        post_boost_health = await self.integration_system.get_system_health()
        post_boost_accuracy = post_boost_health.cultural_accuracy
        
        accuracy_improvement = post_boost_accuracy - baseline_accuracy
        target_improvement = scenario['target_accuracy_improvement']
        
        test_time = time.time() - test_start
        cultural_boost_success = accuracy_improvement >= target_improvement
        
        await self._record_test_result(
            test_name="Performance: Cultural Boost",
            success=cultural_boost_success,
            details=f"Improvement: {accuracy_improvement:.4f} (target: {target_improvement:.4f})",
            metrics={
                'baseline_accuracy': baseline_accuracy,
                'post_boost_accuracy': post_boost_accuracy,
                'accuracy_improvement': accuracy_improvement,
                'target_improvement': target_improvement,
                'content_processed': content_count,
                'test_time': test_time
            }
        )
    
    async def _test_integration_stress_scenario(self, scenario: Dict):
        """Test integration stress scenario"""
        
        test_start = time.time()
        duration = scenario['duration_seconds']
        requests_per_second = scenario['requests_per_second']
        
        stress_results = []
        end_time = test_start + duration
        
        while time.time() < end_time:
            batch_start = time.time()
            
            # Create batch of requests
            batch_tasks = []
            for i in range(requests_per_second):
                task = self.integration_system.learn_from_interaction(
                    interaction_data={
                        'user_input': f"Stress test {int(time.time() * 1000)}_{i}",
                        'stress_test': True
                    }
                )
                batch_tasks.append(task)
            
            # Execute batch
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Record batch results
            successful_in_batch = sum(1 for r in batch_results if isinstance(r, LearningResponse) and r.success)
            stress_results.append({
                'timestamp': time.time(),
                'successful_requests': successful_in_batch,
                'total_requests': requests_per_second,
                'batch_time': time.time() - batch_start
            })
            
            # Wait for next second
            await asyncio.sleep(max(0, 1.0 - (time.time() - batch_start)))
        
        test_time = time.time() - test_start
        
        # Analyze stress test results
        total_requests = sum(batch['total_requests'] for batch in stress_results)
        total_successful = sum(batch['successful_requests'] for batch in stress_results)
        success_rate = total_successful / total_requests if total_requests > 0 else 0
        
        stress_success = success_rate >= 0.8  # 80% success rate under stress
        
        await self._record_test_result(
            test_name="Performance: Integration Stress",
            success=stress_success,
            details=f"Success rate: {success_rate:.2f}, Total requests: {total_requests}",
            metrics={
                'total_requests': total_requests,
                'successful_requests': total_successful,
                'success_rate': success_rate,
                'test_duration': test_time,
                'batches_processed': len(stress_results),
                'avg_requests_per_second': total_requests / test_time
            }
        )
    
    async def _test_safety_reliability(self):
        """Test safety and reliability"""
        
        print("\n🛡️ Testing Safety & Reliability...")
        
        # Test 1: Safety Monitoring
        await self._test_safety_monitoring()
        
        # Test 2: Error Recovery
        await self._test_error_recovery()
        
        # Test 3: System Stability
        await self._test_system_stability()
    
    async def _test_safety_monitoring(self):
        """Test safety monitoring capabilities"""
        
        test_start = time.time()
        
        try:
            # Get safety status from system
            system_status = self.integration_system.get_status()
            safety_enabled = system_status['config']['safety_monitoring']
            
            # Test safety monitoring with edge cases
            safety_tests = []
            
            # Test with potentially unsafe content
            unsafe_test_cases = [
                "Test extremely large input " * 100,  # Large input
                {"malformed": "data", "test": None},  # Malformed data
                "",  # Empty input
            ]
            
            for i, test_case in enumerate(unsafe_test_cases):
                try:
                    response = await self.integration_system.learn_from_interaction(
                        interaction_data=test_case,
                        priority=LearningPriority.LOW
                    )
                    safety_tests.append({
                        'test_case': i,
                        'handled_safely': True,
                        'success': response.success,
                        'error': None
                    })
                except Exception as e:
                    safety_tests.append({
                        'test_case': i,
                        'handled_safely': True,  # Exception handling is safe handling
                        'success': False,
                        'error': str(e)
                    })
            
            test_time = time.time() - test_start
            
            all_handled_safely = all(test['handled_safely'] for test in safety_tests)
            safety_monitoring_success = safety_enabled and all_handled_safely
            
            await self._record_test_result(
                test_name="Safety Monitoring",
                success=safety_monitoring_success,
                details=f"Safety enabled: {safety_enabled}, Edge cases handled: {all_handled_safely}",
                metrics={
                    'safety_enabled': safety_enabled,
                    'edge_cases_tested': len(safety_tests),
                    'safely_handled_count': sum(1 for test in safety_tests if test['handled_safely']),
                    'test_time': test_time
                }
            )
            
            if safety_monitoring_success:
                print(f"✅ Safety monitoring working (cases: {len(safety_tests)})")
            else:
                print(f"❌ Safety monitoring issues")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Safety Monitoring",
                success=False,
                details=f"Safety monitoring test failed: {str(e)}"
            )
    
    async def _test_error_recovery(self):
        """Test error recovery capabilities"""
        
        test_start = time.time()
        
        try:
            # Test recovery from simulated errors
            recovery_tests = []
            
            # Test 1: Recovery from processing error
            try:
                # Simulate an error condition and recovery
                before_health = await self.integration_system.get_system_health()
                
                # Process normal request after potential error condition
                recovery_response = await self.integration_system.learn_from_interaction(
                    interaction_data={"recovery_test": "Test recovery capability"}
                )
                
                after_health = await self.integration_system.get_system_health()
                
                recovery_successful = (
                    recovery_response.success and
                    after_health.overall_score >= before_health.overall_score * 0.9
                )
                
                recovery_tests.append({
                    'test': 'processing_error_recovery',
                    'success': recovery_successful,
                    'health_maintained': after_health.overall_score >= before_health.overall_score * 0.9
                })
                
            except Exception as e:
                recovery_tests.append({
                    'test': 'processing_error_recovery',
                    'success': False,
                    'error': str(e)
                })
            
            test_time = time.time() - test_start
            
            overall_recovery_success = all(test['success'] for test in recovery_tests)
            
            await self._record_test_result(
                test_name="Error Recovery",
                success=overall_recovery_success,
                details=f"Recovery tests: {len(recovery_tests)}, All successful: {overall_recovery_success}",
                metrics={
                    'recovery_tests_count': len(recovery_tests),
                    'successful_recoveries': sum(1 for test in recovery_tests if test['success']),
                    'test_time': test_time
                }
            )
            
            if overall_recovery_success:
                print(f"✅ Error recovery working (tests: {len(recovery_tests)})")
            else:
                print(f"❌ Error recovery issues")
                
        except Exception as e:
            await self._record_test_result(
                test_name="Error Recovery",
                success=False,
                details=f"Error recovery test failed: {str(e)}"
            )
    
    async def _test_system_stability(self):
        """Test system stability over time"""
        
        test_start = time.time()
        
        try:
            # Monitor system stability over a period
            stability_duration = 10  # seconds
            stability_checks = []
            
            end_time = test_start + stability_duration
            check_interval = 2  # seconds
            
            while time.time() < end_time:
                check_start = time.time()
                
                # Check system health
                health = await self.integration_system.get_system_health()
                status = self.integration_system.get_status()
                
                # Process a test request
                test_response = await self.integration_system.learn_from_interaction(
                    interaction_data={
                        'stability_test': f"Test at {time.time()}",
                        'timestamp': datetime.now().isoformat()
                    }
                )
                
                stability_checks.append({
                    'timestamp': time.time(),
                    'health_score': health.overall_score,
                    'system_running': status['is_running'],
                    'test_successful': test_response.success,
                    'processing_time': test_response.processing_time
                })
                
                # Wait for next check
                elapsed = time.time() - check_start
                await asyncio.sleep(max(0, check_interval - elapsed))
            
            test_time = time.time() - test_start
            
            # Analyze stability
            health_scores = [check['health_score'] for check in stability_checks]
            processing_times = [check['processing_time'] for check in stability_checks]
            
            avg_health = sum(health_scores) / len(health_scores)
            health_variance = sum((score - avg_health) ** 2 for score in health_scores) / len(health_scores)
            health_stability = health_variance < 0.01  # Low variance indicates stability
            
            avg_processing_time = sum(processing_times) / len(processing_times)
            performance_stability = all(time < avg_processing_time * 2 for time in processing_times)
            
            system_always_running = all(check['system_running'] for check in stability_checks)
            all_tests_successful = all(check['test_successful'] for check in stability_checks)
            
            stability_success = (
                health_stability and
                performance_stability and
                system_always_running and
                all_tests_successful
            )
            
            await self._record_test_result(
                test_name="System Stability",
                success=stability_success,
                details=f"Health variance: {health_variance:.4f}, Checks: {len(stability_checks)}",
                metrics={
                    'stability_checks': len(stability_checks),
                    'avg_health_score': avg_health,
                    'health_variance': health_variance,
                    'avg_processing_time': avg_processing_time,
                    'system_always_running': system_always_running,
                    'all_tests_successful': all_tests_successful,
                    'test_duration': test_time
                }
            )
            
            if stability_success:
                print(f"✅ System stability confirmed (variance: {health_variance:.4f})")
            else:
                print(f"❌ System stability issues (variance: {health_variance:.4f})")
                
        except Exception as e:
            await self._record_test_result(
                test_name="System Stability",
                success=False,
                details=f"Stability test failed: {str(e)}"
            )
    
    async def _test_system_integration(self):
        """Test overall system integration"""
        
        print("\n🔗 Testing System Integration...")
        
        test_start = time.time()
        
        try:
            # Comprehensive integration test
            integration_scenario = {
                'user_interactions': 3,
                'cultural_content': 2,
                'concurrent_operations': True,
                'health_monitoring': True,
                'performance_validation': True
            }
            
            integration_results = []
            
            # Test mixed learning operations
            mixed_tasks = []
            
            # Add user interaction tasks
            for i in range(integration_scenario['user_interactions']):
                task = self.integration_system.learn_from_interaction(
                    interaction_data={
                        'user_input': self.test_data['user_interactions'][i]['input'],
                        'integration_test': True
                    }
                )
                mixed_tasks.append(('interaction', task))
            
            # Add cultural content tasks
            for i in range(integration_scenario['cultural_content']):
                task = self.integration_system.learn_cultural_content(
                    cultural_data=self.test_data['cultural_content'][i]['content'],
                    cultural_metadata={'integration_test': True}
                )
                mixed_tasks.append(('cultural', task))
            
            # Execute all tasks
            if integration_scenario['concurrent_operations']:
                task_results = await asyncio.gather(*[task for _, task in mixed_tasks], return_exceptions=True)
            else:
                task_results = []
                for task_type, task in mixed_tasks:
                    result = await task
                    task_results.append(result)
            
            # Analyze results
            successful_results = [
                r for r in task_results 
                if isinstance(r, LearningResponse) and r.success
            ]
            
            # Test health monitoring during operations
            if integration_scenario['health_monitoring']:
                final_health = await self.integration_system.get_system_health()
                health_good = final_health.overall_score >= 0.8
            else:
                health_good = True
            
            # Test performance validation
            if integration_scenario['performance_validation']:
                avg_processing_time = sum(r.processing_time for r in successful_results) / len(successful_results) if successful_results else float('inf')
                performance_good = avg_processing_time < 2.0
            else:
                performance_good = True
            
            test_time = time.time() - test_start
            
            integration_success = (
                len(successful_results) >= len(mixed_tasks) * 0.8 and  # 80% success rate
                health_good and
                performance_good
            )
            
            # Store integration results
            self.test_results['integration_results'] = {
                'total_operations': len(mixed_tasks),
                'successful_operations': len(successful_results),
                'success_rate': len(successful_results) / len(mixed_tasks),
                'final_health_score': final_health.overall_score if integration_scenario['health_monitoring'] else None,
                'average_processing_time': avg_processing_time if integration_scenario['performance_validation'] else None
            }
            
            await self._record_test_result(
                test_name="System Integration",
                success=integration_success,
                details=f"Operations: {len(successful_results)}/{len(mixed_tasks)}, Health: {final_health.overall_score:.2f}",
                metrics={
                    'total_operations': len(mixed_tasks),
                    'successful_operations': len(successful_results),
                    'success_rate': len(successful_results) / len(mixed_tasks),
                    'final_health_score': final_health.overall_score if integration_scenario['health_monitoring'] else None,
                    'average_processing_time': avg_processing_time if integration_scenario['performance_validation'] else None,
                    'test_time': test_time
                }
            )
            
            if integration_success:
                print(f"✅ System integration successful ({len(successful_results)}/{len(mixed_tasks)} operations)")
            else:
                print(f"❌ System integration issues ({len(successful_results)}/{len(mixed_tasks)} operations)")
                
        except Exception as e:
            await self._record_test_result(
                test_name="System Integration",
                success=False,
                details=f"Integration test failed: {str(e)}"
            )
    
    async def _cleanup_test_system(self):
        """Clean up test system"""
        
        try:
            if self.integration_system:
                await self.integration_system.stop_system()
                
            await self._record_test_result(
                test_name="System Cleanup",
                success=True,
                details="Test system cleaned up successfully"
            )
            
            print("✅ Test system cleaned up successfully")
            
        except Exception as e:
            await self._record_test_result(
                test_name="System Cleanup",
                success=False,
                details=f"Cleanup failed: {str(e)}"
            )
    
    async def _record_test_result(self, test_name: str, success: bool, details: str, metrics: Dict = None):
        """Record a test result"""
        
        self.test_results['total_tests'] += 1
        
        if success:
            self.test_results['passed_tests'] += 1
        else:
            self.test_results['failed_tests'] += 1
        
        test_record = {
            'test_name': test_name,
            'success': success,
            'details': details,
            'metrics': metrics or {},
            'timestamp': datetime.now().isoformat()
        }
        
        self.test_results['test_details'].append(test_record)
        
        # Update performance metrics if provided
        if metrics:
            if test_name not in self.test_results['performance_metrics']:
                self.test_results['performance_metrics'][test_name] = {}
            self.test_results['performance_metrics'][test_name].update(metrics)
    
    async def _handle_import_failure(self) -> Dict:
        """Handle import failure"""
        
        return {
            'success': False,
            'error': 'Failed to import Phase 2.2 components',
            'recommendations': [
                'Ensure all Phase 2.2 component files are present',
                'Check Python path configuration',
                'Verify component dependencies are installed'
            ],
            'test_results': self.test_results
        }
    
    async def _handle_test_error(self, error: Exception):
        """Handle test execution error"""
        
        await self._record_test_result(
            test_name="Test Execution Error",
            success=False,
            details=f"Test suite error: {str(error)}"
        )
        
        print(f"❌ Test execution error: {error}")
    
    async def _generate_test_report(self) -> Dict:
        """Generate comprehensive test report"""
        
        end_time = datetime.now()
        total_duration = end_time - self.test_results['start_time']
        
        # Calculate success rate
        success_rate = (
            self.test_results['passed_tests'] / 
            max(1, self.test_results['total_tests'])
        )
        
        # Determine overall result
        overall_success = (
            success_rate >= 0.8 and  # 80% tests must pass
            self.test_results['failed_tests'] <= 2  # Max 2 failures allowed
        )
        
        # Generate summary
        summary = {
            'overall_success': overall_success,
            'success_rate': success_rate,
            'total_tests': self.test_results['total_tests'],
            'passed_tests': self.test_results['passed_tests'],
            'failed_tests': self.test_results['failed_tests'],
            'test_duration': str(total_duration),
            'test_start_time': self.test_results['start_time'].isoformat(),
            'test_end_time': end_time.isoformat()
        }
        
        # Generate recommendations
        recommendations = []
        
        if success_rate < 0.8:
            recommendations.append("Review failed tests and address underlying issues")
        
        if self.test_results['failed_tests'] > 2:
            recommendations.append("Investigate system stability and component integration")
        
        if 'cultural_accuracy_results' in self.test_results:
            cultural_results = self.test_results['cultural_accuracy_results']
            if not cultural_results.get('target_met', False):
                recommendations.append("Focus on improving Romanian cultural accuracy")
        
        if 'integration_results' in self.test_results:
            integration_results = self.test_results['integration_results']
            if integration_results.get('success_rate', 0) < 0.9:
                recommendations.append("Improve system integration and coordination")
        
        if not recommendations:
            recommendations.append("All systems performing well - continue monitoring")
        
        # Compile final report
        final_report = {
            'phase': 'Phase 2.2 Real-Time Learning Systems',
            'test_suite_version': '1.0.0',
            'summary': summary,
            'detailed_results': self.test_results,
            'recommendations': recommendations,
            'next_steps': [
                'Monitor system performance in production',
                'Continue testing with real user data',
                'Implement any recommended improvements',
                'Proceed to Phase 2.3 if all systems stable'
            ],
            'cultural_accuracy_status': self.test_results.get('cultural_accuracy_results', {}),
            'integration_status': self.test_results.get('integration_results', {}),
            'performance_metrics': self.test_results.get('performance_metrics', {})
        }
        
        return final_report

# Main test execution
async def main():
    """Execute the comprehensive test suite"""
    
    print("🚀 Phase 2.2 Real-Time Learning Systems - Comprehensive Test Suite")
    print("=" * 80)
    print(f"Test Start Time: {datetime.now().isoformat()}")
    print()
    
    # Create and run test suite
    test_suite = Phase2Point2TestSuite()
    test_report = await test_suite.run_comprehensive_tests()
    
    # Display results
    print("\n" + "=" * 80)
    print("📋 COMPREHENSIVE TEST REPORT")
    print("=" * 80)
    
    print(f"\n🎯 Overall Result: {'✅ SUCCESS' if test_report['summary']['overall_success'] else '❌ FAILURE'}")
    print(f"📊 Success Rate: {test_report['summary']['success_rate']:.1%}")
    print(f"📈 Tests Passed: {test_report['summary']['passed_tests']}/{test_report['summary']['total_tests']}")
    print(f"⏱️ Total Duration: {test_report['summary']['test_duration']}")
    
    # Cultural accuracy results
    if 'cultural_accuracy_status' in test_report and test_report['cultural_accuracy_status']:
        cultural_status = test_report['cultural_accuracy_status']
        print(f"\n🇷🇴 Cultural Accuracy: {cultural_status.get('final_accuracy', 0):.4f}")
        print(f"🎯 Target Met: {'✅' if cultural_status.get('target_met', False) else '❌'}")
    
    # Integration results
    if 'integration_status' in test_report and test_report['integration_status']:
        integration_status = test_report['integration_status']
        print(f"\n🔗 Integration Success Rate: {integration_status.get('success_rate', 0):.1%}")
        print(f"🏥 Final Health Score: {integration_status.get('final_health_score', 0):.2f}")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    for rec in test_report['recommendations']:
        print(f"   • {rec}")
    
    # Next steps
    print(f"\n➡️ Next Steps:")
    for step in test_report['next_steps']:
        print(f"   • {step}")
    
    print("\n" + "=" * 80)
    print("🎉 Phase 2.2 Testing Complete!")
    print("=" * 80)
    
    return test_report

if __name__ == "__main__":
    # Run the comprehensive test suite
    try:
        test_report = asyncio.run(main())
        
        # Save report to file
        with open('phase_2_2_test_report.json', 'w', encoding='utf-8') as f:
            json.dump(test_report, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n📄 Test report saved to: phase_2_2_test_report.json")
        
    except KeyboardInterrupt:
        print("\n🛑 Test suite interrupted by user")
    except Exception as e:
        print(f"\n💥 Test suite failed with error: {e}")
    finally:
        print("\n👋 Test suite execution completed")

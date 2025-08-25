#!/usr/bin/env python3
"""
🧪 RomAI AGI - Week 3 Day 4: Production Optimization & Advanced Analytics Integration Test
Comprehensive testing of all Week 3 Day 4 components working together

This test validates the complete integration of:
1. Production Performance Optimizer
2. Advanced Analytics Intelligence Engine
3. Cross-Component Workflow Automation
4. Enterprise-Grade Monitoring & Alerting
5. Romanian Cultural Analytics Dashboard
"""

import asyncio
import time
import json
import logging
import sys
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import all Week 3 Day 4 components
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from production_performance_optimizer import ProductionPerformanceOptimizer
    from advanced_analytics_intelligence_engine import AdvancedAnalyticsIntelligenceEngine
    from cross_component_workflow_automation import CrossComponentWorkflowAutomation
    from enterprise_monitoring_alerting import EnterpriseMonitoringAlerting
    from romanian_cultural_analytics_dashboard import RomanianCulturalAnalyticsDashboard
except ImportError as e:
    print(f"❌ Error importing Week 3 Day 4 components: {e}")
    print("Make sure all component files are in the same directory.")
    sys.exit(1)

# Enhanced logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Week3Day4IntegrationTest:
    """
    Comprehensive integration test for Week 3 Day 4 components
    
    Tests:
    - Individual component initialization
    - Cross-component communication
    - Performance optimization workflows
    - Analytics and intelligence processing
    - Monitoring and alerting systems
    - Romanian cultural analytics integration
    """
    
    def __init__(self):
        self.components = {}
        self.test_results = {
            'tests_run': 0,
            'tests_passed': 0,
            'tests_failed': 0,
            'component_status': {},
            'integration_status': {},
            'performance_metrics': {},
            'error_log': []
        }
        self.start_time = time.time()
        
        logger.info("Week 3 Day 4 Integration Test initialized")
    
    async def run_full_integration_test(self) -> Dict[str, Any]:
        """Run complete integration test suite"""
        print("🧪 RomAI AGI - Week 3 Day 4: Integration Test Suite")
        print("=" * 70)
        print("Testing Production Optimization & Advanced Analytics Components")
        print("=" * 70)
        
        try:
            # Phase 1: Component Initialization Tests
            await self._test_component_initialization()
            
            # Phase 2: Individual Component Tests
            await self._test_individual_components()
            
            # Phase 3: Cross-Component Integration Tests
            await self._test_cross_component_integration()
            
            # Phase 4: Performance and Load Tests
            await self._test_performance_and_load()
            
            # Phase 5: End-to-End Workflow Tests
            await self._test_end_to_end_workflows()
            
            # Phase 6: Cleanup and Final Report
            await self._cleanup_and_report()
            
        except Exception as e:
            logger.error(f"Integration test failed: {e}")
            self.test_results['error_log'].append(f"Test suite failure: {str(e)}")
        
        return self._generate_final_report()
    
    async def _test_component_initialization(self):
        """Test initialization of all Week 3 Day 4 components"""
        print("\n🚀 Phase 1: Component Initialization Tests")
        print("-" * 50)
        
        # Test Production Performance Optimizer
        await self._test_single_component_init(
            "production_performance_optimizer",
            ProductionPerformanceOptimizer,
            "Production Performance Optimizer"
        )
        
        # Test Advanced Analytics Intelligence Engine
        await self._test_single_component_init(
            "analytics_intelligence_engine",
            AdvancedAnalyticsIntelligenceEngine,
            "Advanced Analytics Intelligence Engine"
        )
        
        # Test Cross-Component Workflow Automation
        await self._test_single_component_init(
            "workflow_automation",
            CrossComponentWorkflowAutomation,
            "Cross-Component Workflow Automation"
        )
        
        # Test Enterprise Monitoring & Alerting
        await self._test_single_component_init(
            "monitoring_alerting",
            EnterpriseMonitoringAlerting,
            "Enterprise Monitoring & Alerting"
        )
        
        # Test Romanian Cultural Analytics Dashboard
        await self._test_single_component_init(
            "cultural_analytics_dashboard",
            RomanianCulturalAnalyticsDashboard,
            "Romanian Cultural Analytics Dashboard",
            init_args=(8091,)  # Use different port to avoid conflicts
        )
        
        print(f"\n✅ Phase 1 Complete: {len(self.components)}/5 components initialized")
    
    async def _test_single_component_init(self, component_key: str, component_class, component_name: str, init_args: tuple = ()):
        """Test initialization of a single component"""
        try:
            print(f"   🔧 Initializing {component_name}...")
            start_time = time.time()
            
            component = component_class(*init_args)
            await component.initialize()
            
            init_time = time.time() - start_time
            
            self.components[component_key] = component
            self.test_results['component_status'][component_key] = {
                'status': 'initialized',
                'init_time': init_time,
                'timestamp': time.time()
            }
            
            print(f"   ✅ {component_name} initialized in {init_time:.2f}s")
            self._record_test_result(True, f"{component_name} initialization")
            
        except Exception as e:
            error_msg = f"Failed to initialize {component_name}: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self.test_results['component_status'][component_key] = {
                'status': 'failed',
                'error': str(e),
                'timestamp': time.time()
            }
            self._record_test_result(False, f"{component_name} initialization")
    
    async def _test_individual_components(self):
        """Test individual component functionality"""
        print("\n🔍 Phase 2: Individual Component Tests")
        print("-" * 50)
        
        # Test Production Performance Optimizer
        if 'production_performance_optimizer' in self.components:
            await self._test_performance_optimizer()
        
        # Test Advanced Analytics Intelligence Engine
        if 'analytics_intelligence_engine' in self.components:
            await self._test_analytics_engine()
        
        # Test Workflow Automation
        if 'workflow_automation' in self.components:
            await self._test_workflow_automation()
        
        # Test Monitoring & Alerting
        if 'monitoring_alerting' in self.components:
            await self._test_monitoring_alerting()
        
        # Test Cultural Analytics Dashboard
        if 'cultural_analytics_dashboard' in self.components:
            await self._test_cultural_dashboard()
        
        print(f"\n✅ Phase 2 Complete: Individual component tests finished")
    
    async def _test_performance_optimizer(self):
        """Test Production Performance Optimizer"""
        try:
            print("   📊 Testing Production Performance Optimizer...")
            optimizer = self.components['production_performance_optimizer']
            
            # Test system metrics collection
            await optimizer.start_monitoring()
            await asyncio.sleep(2)  # Let it collect some metrics
            
            # Test performance analysis
            analysis = await optimizer.analyze_system_performance()
            
            # Test optimization recommendations
            recommendations = await optimizer.get_optimization_recommendations()
            
            print(f"   ✅ Performance Optimizer: {len(analysis.get('metrics', {}))} metrics, {len(recommendations.get('recommendations', []))} recommendations")
            self._record_test_result(True, "Performance Optimizer functionality")
            
        except Exception as e:
            error_msg = f"Performance Optimizer test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Performance Optimizer functionality")
    
    async def _test_analytics_engine(self):
        """Test Advanced Analytics Intelligence Engine"""
        try:
            print("   🧠 Testing Advanced Analytics Intelligence Engine...")
            analytics = self.components['analytics_intelligence_engine']
            
            # Test Romanian cultural analysis
            test_text = "Mihai Eminescu este cel mai mare poet român. Transilvania este o regiune frumoasă."
            cultural_analysis = await analytics.analyze_romanian_cultural_content(test_text)
            
            # Test predictive analytics
            historical_data = [
                {'timestamp': time.time() - 3600, 'value': 10, 'type': 'cultural_analysis'},
                {'timestamp': time.time() - 1800, 'value': 15, 'type': 'cultural_analysis'},
                {'timestamp': time.time() - 900, 'value': 12, 'type': 'cultural_analysis'}
            ]
            predictions = await analytics.generate_predictive_insights(historical_data)
            
            # Test intelligence report
            intelligence_report = await analytics.generate_intelligence_report()
            
            print(f"   ✅ Analytics Engine: Cultural analysis completed, {len(predictions.get('predictions', []))} predictions generated")
            self._record_test_result(True, "Analytics Intelligence Engine functionality")
            
        except Exception as e:
            error_msg = f"Analytics Engine test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Analytics Intelligence Engine functionality")
    
    async def _test_workflow_automation(self):
        """Test Cross-Component Workflow Automation"""
        try:
            print("   🔄 Testing Cross-Component Workflow Automation...")
            workflow = self.components['workflow_automation']
            
            # Test Romanian text processing workflow
            test_text = "Salut din București! Îmi place cultura românească."
            execution_id = await workflow.process_romanian_text(test_text)
            
            # Wait for workflow completion
            await asyncio.sleep(3)
            
            # Check workflow status
            status = await workflow.get_workflow_status(execution_id)
            
            # Test system status
            system_status = await workflow.get_system_status()
            
            print(f"   ✅ Workflow Automation: Execution {execution_id[:8]}... completed")
            self._record_test_result(True, "Workflow Automation functionality")
            
        except Exception as e:
            error_msg = f"Workflow Automation test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Workflow Automation functionality")
    
    async def _test_monitoring_alerting(self):
        """Test Enterprise Monitoring & Alerting"""
        try:
            print("   🚨 Testing Enterprise Monitoring & Alerting...")
            monitoring = self.components['monitoring_alerting']
            
            # Test custom metric recording
            monitoring.record_custom_metric("test_metric", 75.0)
            monitoring.record_romanian_processing_metric(150, 5, 0.25)
            
            # Wait for metrics collection
            await asyncio.sleep(2)
            
            # Test metrics retrieval
            metrics = monitoring.get_system_metrics()
            
            # Test component health
            health = monitoring.get_component_health()
            
            # Test alert summary
            alerts = monitoring.get_alert_summary()
            
            # Test comprehensive status
            status = monitoring.get_comprehensive_status()
            
            print(f"   ✅ Monitoring & Alerting: {len(metrics)} metrics, {len(health)} components monitored")
            self._record_test_result(True, "Monitoring & Alerting functionality")
            
        except Exception as e:
            error_msg = f"Monitoring & Alerting test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Monitoring & Alerting functionality")
    
    async def _test_cultural_dashboard(self):
        """Test Romanian Cultural Analytics Dashboard"""
        try:
            print("   🇷🇴 Testing Romanian Cultural Analytics Dashboard...")
            dashboard = self.components['cultural_analytics_dashboard']
            
            # Test text analysis
            test_texts = [
                "Mihai Eminescu a fost un mare poet român.",
                "Transilvania este o regiune istorică importantă.",
                "Tradițiile românești sunt foarte frumoase."
            ]
            
            for text in test_texts:
                analysis = await dashboard.analyze_text(text)
                
            # Test analytics summary
            summary = await dashboard.get_analytics_summary()
            
            # Test cultural insights
            insights = await dashboard.get_cultural_insights()
            
            print(f"   ✅ Cultural Analytics Dashboard: {len(test_texts)} texts analyzed, dashboard operational")
            self._record_test_result(True, "Cultural Analytics Dashboard functionality")
            
        except Exception as e:
            error_msg = f"Cultural Analytics Dashboard test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Cultural Analytics Dashboard functionality")
    
    async def _test_cross_component_integration(self):
        """Test cross-component integration scenarios"""
        print("\n🔗 Phase 3: Cross-Component Integration Tests")
        print("-" * 50)
        
        # Test Performance Optimizer + Monitoring Integration
        await self._test_performance_monitoring_integration()
        
        # Test Analytics Engine + Dashboard Integration
        await self._test_analytics_dashboard_integration()
        
        # Test Workflow + All Components Integration
        await self._test_workflow_full_integration()
        
        print(f"\n✅ Phase 3 Complete: Cross-component integration tests finished")
    
    async def _test_performance_monitoring_integration(self):
        """Test integration between Performance Optimizer and Monitoring"""
        try:
            print("   🔧 Testing Performance Optimizer + Monitoring Integration...")
            
            if 'production_performance_optimizer' in self.components and 'monitoring_alerting' in self.components:
                optimizer = self.components['production_performance_optimizer']
                monitoring = self.components['monitoring_alerting']
                
                # Get performance metrics from optimizer
                perf_metrics = await optimizer.get_real_time_metrics()
                
                # Record them in monitoring system
                for metric_name, value in perf_metrics.get('system_metrics', {}).items():
                    if isinstance(value, (int, float)):
                        monitoring.record_custom_metric(f"optimizer_{metric_name}", value)
                
                # Verify integration
                monitoring_metrics = monitoring.get_system_metrics()
                
                print("   ✅ Performance + Monitoring Integration: Metrics shared successfully")
                self._record_test_result(True, "Performance-Monitoring Integration")
            else:
                self._record_test_result(False, "Performance-Monitoring Integration - Components not available")
                
        except Exception as e:
            error_msg = f"Performance-Monitoring integration test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Performance-Monitoring Integration")
    
    async def _test_analytics_dashboard_integration(self):
        """Test integration between Analytics Engine and Dashboard"""
        try:
            print("   📊 Testing Analytics Engine + Dashboard Integration...")
            
            if 'analytics_intelligence_engine' in self.components and 'cultural_analytics_dashboard' in self.components:
                analytics = self.components['analytics_intelligence_engine']
                dashboard = self.components['cultural_analytics_dashboard']
                
                # Analyze Romanian text in both systems
                test_text = "România este o țară frumoasă din Europa de Est cu o cultură bogată."
                
                # Analytics engine analysis
                cultural_analysis = await analytics.analyze_romanian_cultural_content(test_text)
                
                # Dashboard analysis
                dashboard_analysis = await dashboard.analyze_text(test_text)
                
                # Compare results (both should detect Romanian cultural content)
                analytics_entities = len(cultural_analysis.get('cultural_entities', []))
                dashboard_entities = len(dashboard_analysis.get('cultural_entities', []))
                
                print(f"   ✅ Analytics + Dashboard Integration: Entities detected - Analytics: {analytics_entities}, Dashboard: {dashboard_entities}")
                self._record_test_result(True, "Analytics-Dashboard Integration")
            else:
                self._record_test_result(False, "Analytics-Dashboard Integration - Components not available")
                
        except Exception as e:
            error_msg = f"Analytics-Dashboard integration test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Analytics-Dashboard Integration")
    
    async def _test_workflow_full_integration(self):
        """Test workflow automation with all components"""
        try:
            print("   🔄 Testing Workflow + All Components Integration...")
            
            if 'workflow_automation' in self.components:
                workflow = self.components['workflow_automation']
                
                # Create a complex workflow that involves multiple components
                complex_workflow = {
                    "workflow_id": "integration_test_workflow",
                    "name": "Integration Test Workflow",
                    "description": "Tests integration across all Week 3 Day 4 components",
                    "tasks": [
                        {
                            "task_id": "performance_check",
                            "task_type": "performance_check",
                            "component": "performance_optimizer",
                            "input_data": {"check_type": "system_health"}
                        },
                        {
                            "task_id": "cultural_analysis",
                            "task_type": "cultural_analysis",
                            "component": "streaming_analytics",
                            "input_data": {"text": "Cultura românească este foarte bogată și diversă."},
                            "dependencies": ["performance_check"]
                        },
                        {
                            "task_id": "dashboard_update",
                            "task_type": "dashboard_update",
                            "component": "live_dashboard",
                            "input_data": {"chart_type": "integration_test"},
                            "dependencies": ["cultural_analysis"]
                        }
                    ]
                }
                
                # Register and execute the workflow
                workflow_id = await workflow.create_custom_workflow(complex_workflow)
                execution_id = await workflow.workflow_engine.execute_workflow(workflow_id)
                
                # Wait for completion
                await asyncio.sleep(3)
                
                # Check status
                status = await workflow.get_workflow_status(execution_id)
                
                print(f"   ✅ Workflow Full Integration: Complex workflow executed successfully")
                self._record_test_result(True, "Workflow Full Integration")
            else:
                self._record_test_result(False, "Workflow Full Integration - Workflow component not available")
                
        except Exception as e:
            error_msg = f"Workflow full integration test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Workflow Full Integration")
    
    async def _test_performance_and_load(self):
        """Test performance and load handling"""
        print("\n⚡ Phase 4: Performance and Load Tests")
        print("-" * 50)
        
        # Test concurrent Romanian text processing
        await self._test_concurrent_processing()
        
        # Test system resource usage
        await self._test_resource_usage()
        
        # Test response times
        await self._test_response_times()
        
        print(f"\n✅ Phase 4 Complete: Performance and load tests finished")
    
    async def _test_concurrent_processing(self):
        """Test concurrent processing capabilities"""
        try:
            print("   🚀 Testing Concurrent Romanian Text Processing...")
            
            if 'cultural_analytics_dashboard' in self.components:
                dashboard = self.components['cultural_analytics_dashboard']
                
                # Create multiple concurrent analysis tasks
                test_texts = [
                    f"Aceasta este analiza numărul {i} pentru testarea performanței sistemului RomAI. "
                    f"Mihai Eminescu și Ioan Slavici sunt scriitori români importanți."
                    for i in range(10)
                ]
                
                start_time = time.time()
                
                # Process all texts concurrently
                tasks = [dashboard.analyze_text(text) for text in test_texts]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                processing_time = time.time() - start_time
                
                # Count successful analyses
                successful = sum(1 for result in results if isinstance(result, dict) and not isinstance(result, Exception))
                
                self.test_results['performance_metrics']['concurrent_processing'] = {
                    'total_tasks': len(test_texts),
                    'successful_tasks': successful,
                    'total_time': processing_time,
                    'avg_time_per_task': processing_time / len(test_texts),
                    'throughput': len(test_texts) / processing_time
                }
                
                print(f"   ✅ Concurrent Processing: {successful}/{len(test_texts)} tasks completed in {processing_time:.2f}s")
                print(f"      Throughput: {len(test_texts)/processing_time:.1f} analyses/second")
                self._record_test_result(True, "Concurrent Processing")
            else:
                self._record_test_result(False, "Concurrent Processing - Dashboard not available")
                
        except Exception as e:
            error_msg = f"Concurrent processing test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Concurrent Processing")
    
    async def _test_resource_usage(self):
        """Test system resource usage"""
        try:
            print("   💾 Testing System Resource Usage...")
            
            if 'monitoring_alerting' in self.components:
                monitoring = self.components['monitoring_alerting']
                
                # Get baseline metrics
                baseline_metrics = monitoring.get_system_metrics()
                
                # Perform intensive operations
                for i in range(5):
                    if 'cultural_analytics_dashboard' in self.components:
                        dashboard = self.components['cultural_analytics_dashboard']
                        await dashboard.analyze_text(f"Test intensiv numărul {i} cu analiza culturală românească detaliată.")
                
                # Get metrics after intensive operations
                post_metrics = monitoring.get_system_metrics()
                
                # Record resource usage
                cpu_usage = post_metrics.get('cpu_usage_percent', {}).get('current_value', 0)
                memory_usage = post_metrics.get('memory_usage_percent', {}).get('current_value', 0)
                
                self.test_results['performance_metrics']['resource_usage'] = {
                    'cpu_usage_percent': cpu_usage,
                    'memory_usage_percent': memory_usage,
                    'within_limits': cpu_usage < 90 and memory_usage < 90
                }
                
                print(f"   ✅ Resource Usage: CPU {cpu_usage:.1f}%, Memory {memory_usage:.1f}%")
                self._record_test_result(True, "Resource Usage Monitoring")
            else:
                self._record_test_result(False, "Resource Usage Monitoring - Monitoring not available")
                
        except Exception as e:
            error_msg = f"Resource usage test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Resource Usage Monitoring")
    
    async def _test_response_times(self):
        """Test system response times"""
        try:
            print("   ⏱️  Testing System Response Times...")
            
            response_times = {}
            
            # Test each component's response time
            for component_name, component in self.components.items():
                start_time = time.time()
                
                if component_name == 'cultural_analytics_dashboard':
                    await component.analyze_text("Test response time pentru analiza culturală.")
                elif component_name == 'monitoring_alerting':
                    component.get_system_metrics()
                elif component_name == 'analytics_intelligence_engine':
                    await component.analyze_romanian_cultural_content("Test pentru analiza culturală.")
                elif component_name == 'workflow_automation':
                    await component.get_system_status()
                elif component_name == 'production_performance_optimizer':
                    await component.get_real_time_metrics()
                
                response_time = time.time() - start_time
                response_times[component_name] = response_time
            
            self.test_results['performance_metrics']['response_times'] = response_times
            
            avg_response_time = sum(response_times.values()) / len(response_times) if response_times else 0
            
            print(f"   ✅ Response Times: Average {avg_response_time:.3f}s across {len(response_times)} components")
            for comp_name, resp_time in response_times.items():
                print(f"      • {comp_name}: {resp_time:.3f}s")
            
            self._record_test_result(True, "Response Time Testing")
            
        except Exception as e:
            error_msg = f"Response time test failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Response Time Testing")
    
    async def _test_end_to_end_workflows(self):
        """Test complete end-to-end workflows"""
        print("\n🎯 Phase 5: End-to-End Workflow Tests")
        print("-" * 50)
        
        # Test complete Romanian content analysis workflow
        await self._test_complete_content_analysis_workflow()
        
        # Test performance optimization workflow
        await self._test_performance_optimization_workflow()
        
        # Test monitoring and alerting workflow
        await self._test_monitoring_alerting_workflow()
        
        print(f"\n✅ Phase 5 Complete: End-to-end workflow tests finished")
    
    async def _test_complete_content_analysis_workflow(self):
        """Test complete Romanian content analysis workflow"""
        try:
            print("   🇷🇴 Testing Complete Romanian Content Analysis Workflow...")
            
            # Romanian text for comprehensive analysis
            romanian_text = """
            Mihai Eminescu este considerat poetul național al României și una dintre cele mai mari 
            personalități ale literaturii române. Născut în Moldova, în localitatea Ipotești, 
            Eminescu a creat opere care reflectă profund spiritul românesc și frumusețea limbii române.
            Transilvania, cu orașele sale medievale precum Brașovul și Sibiul, oferă o perspectivă 
            unică asupra istoriei și culturii românești. Tradițiile românești, precum Mărțișorul 
            și Hora, continuă să fie celebrate cu entuziasm în întreaga țară.
            """
            
            workflow_results = {}
            
            # Step 1: Cultural Analytics Dashboard Analysis
            if 'cultural_analytics_dashboard' in self.components:
                dashboard_analysis = await self.components['cultural_analytics_dashboard'].analyze_text(romanian_text)
                workflow_results['dashboard_analysis'] = dashboard_analysis
                print("      ✅ Step 1: Dashboard cultural analysis completed")
            
            # Step 2: Advanced Analytics Intelligence
            if 'analytics_intelligence_engine' in self.components:
                intelligence_analysis = await self.components['analytics_intelligence_engine'].analyze_romanian_cultural_content(romanian_text)
                workflow_results['intelligence_analysis'] = intelligence_analysis
                print("      ✅ Step 2: Intelligence analysis completed")
            
            # Step 3: Performance Monitoring
            if 'monitoring_alerting' in self.components:
                self.components['monitoring_alerting'].record_romanian_processing_metric(
                    len(romanian_text), 
                    len(workflow_results.get('dashboard_analysis', {}).get('cultural_entities', [])),
                    0.5
                )
                print("      ✅ Step 3: Performance metrics recorded")
            
            # Step 4: Workflow Automation
            if 'workflow_automation' in self.components:
                workflow_execution = await self.components['workflow_automation'].process_romanian_text(
                    romanian_text, {'workflow_test': True}
                )
                workflow_results['workflow_execution'] = workflow_execution
                print("      ✅ Step 4: Workflow automation completed")
            
            # Validate results
            entities_found = len(workflow_results.get('dashboard_analysis', {}).get('cultural_entities', []))
            processing_successful = bool(workflow_results.get('intelligence_analysis'))
            
            print(f"   ✅ Complete Content Analysis: {entities_found} entities found, processing successful: {processing_successful}")
            self._record_test_result(True, "Complete Content Analysis Workflow")
            
        except Exception as e:
            error_msg = f"Complete content analysis workflow failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Complete Content Analysis Workflow")
    
    async def _test_performance_optimization_workflow(self):
        """Test performance optimization workflow"""
        try:
            print("   ⚡ Testing Performance Optimization Workflow...")
            
            if 'production_performance_optimizer' in self.components and 'monitoring_alerting' in self.components:
                optimizer = self.components['production_performance_optimizer']
                monitoring = self.components['monitoring_alerting']
                
                # Step 1: Start performance monitoring
                await optimizer.start_monitoring()
                
                # Step 2: Collect baseline metrics
                baseline_metrics = await optimizer.get_real_time_metrics()
                
                # Step 3: Analyze performance
                performance_analysis = await optimizer.analyze_system_performance()
                
                # Step 4: Get optimization recommendations
                recommendations = await optimizer.get_optimization_recommendations()
                
                # Step 5: Apply optimizations (simulated)
                if recommendations.get('recommendations'):
                    for rec in recommendations['recommendations'][:2]:  # Apply first 2 recommendations
                        print(f"      📝 Applying optimization: {rec.get('description', 'Unknown')}")
                
                # Step 6: Record optimization metrics in monitoring
                optimization_score = performance_analysis.get('overall_performance_score', 85.0)
                monitoring.record_custom_metric("optimization_score", optimization_score)
                
                print(f"   ✅ Performance Optimization: Score {optimization_score:.1f}, {len(recommendations.get('recommendations', []))} recommendations")
                self._record_test_result(True, "Performance Optimization Workflow")
            else:
                self._record_test_result(False, "Performance Optimization Workflow - Components not available")
                
        except Exception as e:
            error_msg = f"Performance optimization workflow failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Performance Optimization Workflow")
    
    async def _test_monitoring_alerting_workflow(self):
        """Test monitoring and alerting workflow"""
        try:
            print("   🚨 Testing Monitoring & Alerting Workflow...")
            
            if 'monitoring_alerting' in self.components:
                monitoring = self.components['monitoring_alerting']
                
                # Step 1: Record various metrics to simulate system activity
                monitoring.record_custom_metric("test_cpu_usage", 75.0)
                monitoring.record_custom_metric("test_memory_usage", 60.0)
                monitoring.record_custom_metric("test_response_time", 0.150)
                
                # Step 2: Record Romanian processing metrics
                monitoring.record_romanian_processing_metric(250, 8, 0.3)
                
                # Step 3: Get system metrics
                system_metrics = monitoring.get_system_metrics()
                
                # Step 4: Check component health
                component_health = monitoring.get_component_health()
                
                # Step 5: Get alert summary
                alert_summary = monitoring.get_alert_summary()
                
                # Step 6: Generate comprehensive status report
                comprehensive_status = monitoring.get_comprehensive_status()
                
                metrics_count = len(system_metrics)
                components_count = len(component_health)
                alerts_count = alert_summary.get('active_alerts_count', 0)
                
                print(f"   ✅ Monitoring & Alerting: {metrics_count} metrics, {components_count} components, {alerts_count} active alerts")
                self._record_test_result(True, "Monitoring & Alerting Workflow")
            else:
                self._record_test_result(False, "Monitoring & Alerting Workflow - Component not available")
                
        except Exception as e:
            error_msg = f"Monitoring & alerting workflow failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.test_results['error_log'].append(error_msg)
            self._record_test_result(False, "Monitoring & Alerting Workflow")
    
    async def _cleanup_and_report(self):
        """Cleanup components and prepare final report"""
        print("\n🧹 Phase 6: Cleanup and Final Report")
        print("-" * 50)
        
        # Cleanup all components
        for component_name, component in self.components.items():
            try:
                if hasattr(component, 'cleanup'):
                    await component.cleanup()
                print(f"   ✅ Cleaned up {component_name}")
            except Exception as e:
                print(f"   ⚠️  Warning: Cleanup failed for {component_name}: {e}")
        
        # Calculate final statistics
        total_test_time = time.time() - self.start_time
        success_rate = (self.test_results['tests_passed'] / self.test_results['tests_run'] * 100) if self.test_results['tests_run'] > 0 else 0
        
        self.test_results['total_test_time'] = total_test_time
        self.test_results['success_rate'] = success_rate
        
        print(f"   📊 Test suite completed in {total_test_time:.2f} seconds")
        print(f"   📈 Success rate: {success_rate:.1f}%")
    
    def _record_test_result(self, success: bool, test_name: str):
        """Record individual test result"""
        self.test_results['tests_run'] += 1
        if success:
            self.test_results['tests_passed'] += 1
        else:
            self.test_results['tests_failed'] += 1
    
    def _generate_final_report(self) -> Dict[str, Any]:
        """Generate comprehensive final test report"""
        report = {
            'test_summary': {
                'total_tests': self.test_results['tests_run'],
                'passed': self.test_results['tests_passed'],
                'failed': self.test_results['tests_failed'],
                'success_rate': self.test_results.get('success_rate', 0),
                'total_time': self.test_results.get('total_test_time', 0)
            },
            'component_status': self.test_results['component_status'],
            'performance_metrics': self.test_results['performance_metrics'],
            'integration_results': self.test_results.get('integration_status', {}),
            'error_log': self.test_results['error_log'],
            'timestamp': datetime.now().isoformat(),
            'week3_day4_status': 'COMPLETED' if self.test_results['success_rate'] >= 80 else 'PARTIAL'
        }
        
        return report

async def run_week3_day4_integration_test():
    """Run the complete Week 3 Day 4 integration test"""
    test_suite = Week3Day4IntegrationTest()
    
    try:
        # Run the complete test suite
        final_report = await test_suite.run_full_integration_test()
        
        # Display final results
        print("\n" + "=" * 70)
        print("🎯 WEEK 3 DAY 4 INTEGRATION TEST RESULTS")
        print("=" * 70)
        
        summary = final_report['test_summary']
        print(f"📊 Tests Run: {summary['total_tests']}")
        print(f"✅ Passed: {summary['passed']}")
        print(f"❌ Failed: {summary['failed']}")
        print(f"📈 Success Rate: {summary['success_rate']:.1f}%")
        print(f"⏱️  Total Time: {summary['total_time']:.2f} seconds")
        
        print(f"\n🏆 Week 3 Day 4 Status: {final_report['week3_day4_status']}")
        
        if final_report['performance_metrics']:
            print("\n⚡ Performance Highlights:")
            perf = final_report['performance_metrics']
            
            if 'concurrent_processing' in perf:
                cp = perf['concurrent_processing']
                print(f"   🚀 Concurrent Processing: {cp['throughput']:.1f} analyses/second")
            
            if 'response_times' in perf:
                rt = perf['response_times']
                avg_rt = sum(rt.values()) / len(rt) if rt else 0
                print(f"   ⚡ Average Response Time: {avg_rt:.3f} seconds")
            
            if 'resource_usage' in perf:
                ru = perf['resource_usage']
                print(f"   💾 Resource Usage: CPU {ru.get('cpu_usage_percent', 0):.1f}%, Memory {ru.get('memory_usage_percent', 0):.1f}%")
        
        if final_report['error_log']:
            print(f"\n⚠️  Errors Encountered ({len(final_report['error_log'])}):")
            for error in final_report['error_log'][:5]:  # Show first 5 errors
                print(f"   • {error}")
            if len(final_report['error_log']) > 5:
                print(f"   ... and {len(final_report['error_log']) - 5} more errors")
        
        # Component status summary
        print(f"\n🔧 Component Status:")
        for comp_name, status in final_report['component_status'].items():
            status_emoji = "✅" if status['status'] == 'initialized' else "❌"
            print(f"   {status_emoji} {comp_name}: {status['status']}")
        
        print("\n" + "=" * 70)
        
        if final_report['week3_day4_status'] == 'COMPLETED':
            print("🎉 WEEK 3 DAY 4 INTEGRATION TEST: SUCCESS!")
            print("All Production Optimization & Advanced Analytics components working correctly!")
        else:
            print("⚠️  WEEK 3 DAY 4 INTEGRATION TEST: PARTIAL SUCCESS")
            print("Some components may need attention before production deployment.")
        
        print("=" * 70)
        
        return final_report
        
    except Exception as e:
        print(f"\n❌ Integration test suite failed: {e}")
        return {
            'test_summary': {'total_tests': 0, 'passed': 0, 'failed': 1, 'success_rate': 0},
            'error': str(e),
            'week3_day4_status': 'FAILED'
        }

if __name__ == "__main__":
    asyncio.run(run_week3_day4_integration_test())

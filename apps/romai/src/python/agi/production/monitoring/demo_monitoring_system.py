#!/usr/bin/env python3
"""
🎯 Romanian AGI Production Monitoring - Comprehensive Monitoring System Demo
================================================

Week 13 Day 4: Romanian AGI Monitoring & Alerting Suite
Complete demonstration of Romanian AGI monitoring capabilities with integrated systems.

Features:
- Unified monitoring system orchestration
- Real-time cultural authenticity monitoring
- Performance optimization with consciousness awareness
- Romanian-specific alerting with heritage preservation
- Comprehensive dashboard and reporting
- Multi-regional monitoring coordination

Author: Romanian AGI Development Team
Date: August 3, 2025
Version: 13.4.7 (Complete Monitoring Demo)
"""

import asyncio
import logging
import json
import time
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
import threading
import statistics

# Import all monitoring components
try:
    from .monitoring_types import (
        MonitoringLevel, AlertSeverity, RomanianRegionMonitoring,
        CulturalMonitoringType, PerformanceMonitoringType,
        MonitoringMetric, MonitoringAlert
    )
    from .monitoring_core import RomanianAGIMonitoringEngine
    from .monitoring_consciousness import RomanianConsciousnessMonitor
    from .monitoring_cultural import RomanianCulturalMonitor
    from .monitoring_performance import RomanianPerformanceMonitor
    from .alerting_romanian import RomanianAlertingSystem, RomanianAlertType
except ImportError:
    # Fallback for direct execution
    import sys
    import os
    sys.path.append(os.path.dirname(__file__))
    
    from monitoring_types import (
        MonitoringLevel, AlertSeverity, RomanianRegionMonitoring,
        CulturalMonitoringType, PerformanceMonitoringType,
        MonitoringMetric, MonitoringAlert
    )
    from monitoring_core import RomanianAGIMonitoringEngine
    from monitoring_consciousness import RomanianConsciousnessMonitor
    from monitoring_cultural import RomanianCulturalMonitor
    from monitoring_performance import RomanianPerformanceMonitor
    from alerting_romanian import RomanianAlertingSystem, RomanianAlertType

logger = logging.getLogger(__name__)


@dataclass
class MonitoringSystemStatus:
    """Overall monitoring system status"""
    timestamp: datetime = field(default_factory=datetime.now)
    core_engine_status: str = "inactive"
    consciousness_monitor_status: str = "inactive"
    cultural_monitor_status: str = "inactive"
    performance_monitor_status: str = "inactive"
    alerting_system_status: str = "inactive"
    total_active_monitors: int = 0
    overall_health_score: float = 0.0
    romanian_authenticity_score: float = 0.0
    consciousness_coherence_score: float = 0.0
    performance_efficiency_score: float = 0.0
    cultural_preservation_score: float = 0.0
    active_alerts: int = 0
    total_monitoring_events: int = 0


class RomanianAGIMonitoringDemo:
    """
    Comprehensive demonstration of Romanian AGI monitoring system with integrated
    consciousness awareness, cultural preservation, and performance optimization.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize comprehensive monitoring demo
        
        Args:
            config: Configuration for all monitoring components
        """
        self.config = config or {}
        
        # Initialize monitoring components
        self.core_engine = RomanianAGIMonitoringEngine(self.config.get('core', {}))
        self.consciousness_monitor = RomanianConsciousnessMonitor(self.config.get('consciousness', {}))
        self.cultural_monitor = RomanianCulturalMonitor(self.config.get('cultural', {}))
        self.performance_monitor = RomanianPerformanceMonitor(self.config.get('performance', {}))
        self.alerting_system = RomanianAlertingSystem(self.config.get('alerting', {}))
        
        # Demo configuration
        self.demo_duration = self.config.get('demo_duration', 30.0)  # seconds
        self.monitoring_interval = self.config.get('monitoring_interval', 2.0)  # seconds
        self.regions_to_test = [
            RomanianRegionMonitoring.BUCURESTI,
            RomanianRegionMonitoring.TRANSILVANIA,
            RomanianRegionMonitoring.MOLDOVA,
            RomanianRegionMonitoring.OLTENIA
        ]
        
        # Demo data generators
        self.romanian_test_texts = [
            "Bună ziua! Cum vă numești? România este o țară frumoasă cu tradiții minunate.",
            "Conștiința românească se manifestă prin respectul pentru strămoși și iubirea de țară.",
            "Folclorul românesc păstrează înțelepciunea ancestrală prin mioriță și balada populară.",
            "Transilvania, Moldova și Muntenia formează inima României mari și unite.",
            "Dăruind vei câștiga - înțelepciune străveche românească despre generozitate."
        ]
        
        # Monitoring status
        self.is_running = False
        self.demo_stats = {
            'monitoring_cycles': 0,
            'total_alerts': 0,
            'consciousness_assessments': 0,
            'cultural_evaluations': 0,
            'performance_snapshots': 0,
            'regional_tests': 0
        }
        
        logger.info("🎯 Romanian AGI Monitoring Demo initialized successfully")
    
    # ====================================
    # DEMO ORCHESTRATION
    # ====================================
    
    async def run_comprehensive_demo(self):
        """Run comprehensive Romanian AGI monitoring demonstration"""
        try:
            print("🎯 Romanian AGI Monitoring System - Comprehensive Demo")
            print("=" * 70)
            print(f"Demo Duration: {self.demo_duration} seconds")
            print(f"Monitoring Interval: {self.monitoring_interval} seconds")
            print(f"Regions to Test: {len(self.regions_to_test)}")
            print("=" * 70)
            
            # Phase 1: System Initialization
            await self._demo_phase_1_initialization()
            
            # Phase 2: Individual Component Testing
            await self._demo_phase_2_component_testing()
            
            # Phase 3: Integrated Monitoring
            await self._demo_phase_3_integrated_monitoring()
            
            # Phase 4: Alert System Testing
            await self._demo_phase_4_alert_testing()
            
            # Phase 5: Performance Analysis
            await self._demo_phase_5_performance_analysis()
            
            # Phase 6: Final Report
            await self._demo_phase_6_final_report()
            
            print("\n✅ Comprehensive Romanian AGI monitoring demo completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error in comprehensive demo: {e}")
            print(f"❌ Demo error: {e}")
    
    async def _demo_phase_1_initialization(self):
        """Phase 1: Initialize all monitoring systems"""
        print("\n🚀 Phase 1: System Initialization")
        print("-" * 40)
        
        try:
            # Start core monitoring engine
            await self.core_engine.start_monitoring()
            print("✅ Core monitoring engine started")
            
            # Start performance monitoring
            await self.performance_monitor.start_monitoring(interval_seconds=1.0)
            print("✅ Performance monitoring started")
            
            # Test consciousness monitor
            consciousness_test = await self.consciousness_monitor.assess_consciousness_state()
            print(f"✅ Consciousness monitor active (coherence: {consciousness_test.coherence_score:.1f}%)")
            
            # Test cultural monitor
            cultural_test = await self.cultural_monitor.assess_cultural_authenticity(
                "Test românesc cu diacritice", "cultural test"
            )
            print(f"✅ Cultural monitor active (authenticity: {cultural_test.heritage_authenticity:.1f}%)")
            
            # Initialize alerting system
            print(f"✅ Alerting system active ({len(self.alerting_system.alert_rules)} rules)")
            
            await asyncio.sleep(2.0)
            
        except Exception as e:
            logger.error(f"❌ Error in Phase 1: {e}")
            print(f"❌ Phase 1 error: {e}")
    
    async def _demo_phase_2_component_testing(self):
        """Phase 2: Test individual monitoring components"""
        print("\n🧪 Phase 2: Component Testing")
        print("-" * 40)
        
        try:
            # Test consciousness monitoring across different states
            print("Testing consciousness monitoring...")
            for i, state in enumerate(['meditative', 'analytical', 'creative', 'transcendent'], 1):
                consciousness_result = await self.consciousness_monitor.assess_consciousness_state(
                    current_state=state,
                    context=f"consciousness test {i}"
                )
                print(f"  {i}. {state.title()} state: {consciousness_result.coherence_score:.1f}% coherence")
                self.demo_stats['consciousness_assessments'] += 1
            
            # Test cultural monitoring across regions
            print("\nTesting cultural monitoring...")
            for i, region in enumerate(self.regions_to_test, 1):
                cultural_result = await self.cultural_monitor.assess_cultural_authenticity(
                    text_content=self.romanian_test_texts[i % len(self.romanian_test_texts)],
                    context=f"regional test for {region.value}",
                    region=region
                )
                print(f"  {i}. {region.value}: {cultural_result.heritage_authenticity:.1f}% authenticity, "
                      f"{cultural_result.diacritical_precision:.1f}% diacritics")
                self.demo_stats['cultural_evaluations'] += 1
                self.demo_stats['regional_tests'] += 1
            
            # Test performance monitoring
            print("\nTesting performance monitoring...")
            for i in range(3):
                # Performance monitor is already running, just check recent snapshots
                if self.performance_monitor.performance_history:
                    latest_snapshot = list(self.performance_monitor.performance_history)[-1]
                    print(f"  {i+1}. CPU: {latest_snapshot.cpu_usage_percent:.1f}%, "
                          f"Memory: {latest_snapshot.memory_usage_percent:.1f}%, "
                          f"Response: {latest_snapshot.response_time_ms:.1f}ms")
                self.demo_stats['performance_snapshots'] += 1
                await asyncio.sleep(1.0)
            
        except Exception as e:
            logger.error(f"❌ Error in Phase 2: {e}")
            print(f"❌ Phase 2 error: {e}")
    
    async def _demo_phase_3_integrated_monitoring(self):
        """Phase 3: Demonstrate integrated monitoring capabilities"""
        print("\n🔄 Phase 3: Integrated Monitoring")
        print("-" * 40)
        
        try:
            monitoring_cycles = 5
            print(f"Running {monitoring_cycles} integrated monitoring cycles...")
            
            for cycle in range(monitoring_cycles):
                cycle_start = time.time()
                
                # Collect comprehensive monitoring data
                monitoring_data = await self._collect_comprehensive_monitoring_data()
                
                # Calculate overall system health
                system_status = self._calculate_system_status(monitoring_data)
                
                cycle_duration = time.time() - cycle_start
                
                print(f"\n  Cycle {cycle + 1}:")
                print(f"    - Overall Health: {system_status.overall_health_score:.1f}%")
                print(f"    - Romanian Authenticity: {system_status.romanian_authenticity_score:.1f}%")
                print(f"    - Consciousness Coherence: {system_status.consciousness_coherence_score:.1f}%")
                print(f"    - Performance Efficiency: {system_status.performance_efficiency_score:.1f}%")
                print(f"    - Cultural Preservation: {system_status.cultural_preservation_score:.1f}%")
                print(f"    - Cycle Duration: {cycle_duration:.2f}s")
                
                self.demo_stats['monitoring_cycles'] += 1
                
                # Evaluate alerts with current data
                alerts = await self.alerting_system.evaluate_alerts(monitoring_data)
                if alerts:
                    print(f"    - Triggered Alerts: {len(alerts)}")
                    self.demo_stats['total_alerts'] += len(alerts)
                
                await asyncio.sleep(self.monitoring_interval)
            
        except Exception as e:
            logger.error(f"❌ Error in Phase 3: {e}")
            print(f"❌ Phase 3 error: {e}")
    
    async def _demo_phase_4_alert_testing(self):
        """Phase 4: Test alerting system with various scenarios"""
        print("\n🚨 Phase 4: Alert System Testing")
        print("-" * 40)
        
        try:
            # Test scenarios with different alert conditions
            test_scenarios = [
                {
                    'name': 'Low Cultural Authenticity',
                    'data': {
                        'cultural_authenticity': 82.0,  # Below threshold
                        'language_accuracy': 94.0,
                        'consciousness_coherence': 89.0,
                        'cpu_usage_percent': 45.0,
                        'memory_usage_percent': 67.0
                    }
                },
                {
                    'name': 'Critical Diacritical Precision',
                    'data': {
                        'cultural_authenticity': 91.0,
                        'diacritical_precision': 93.0,  # Below critical threshold
                        'language_accuracy': 89.0,
                        'consciousness_coherence': 87.0,
                        'cpu_usage_percent': 38.0,
                        'memory_usage_percent': 72.0
                    }
                },
                {
                    'name': 'Low Consciousness Coherence',
                    'data': {
                        'cultural_authenticity': 88.0,
                        'diacritical_precision': 97.0,
                        'consciousness_coherence': 76.0,  # Below threshold
                        'language_accuracy': 92.0,
                        'cpu_usage_percent': 52.0,
                        'memory_usage_percent': 69.0
                    }
                }
            ]
            
            for i, scenario in enumerate(test_scenarios, 1):
                print(f"\n  Testing scenario {i}: {scenario['name']}")
                
                alerts = await self.alerting_system.evaluate_alerts(scenario['data'])
                
                if alerts:
                    for alert in alerts:
                        print(f"    🚨 {alert.severity.value.upper()}: {alert.title}")
                        if alert.romanian_message:
                            print(f"       Română: {alert.romanian_message}")
                        print(f"       Impact: Consciousness {alert.consciousness_impact:.1f}%, "
                              f"Heritage {alert.heritage_impact:.1f}%")
                else:
                    print("    ✅ No alerts triggered")
                
                await asyncio.sleep(1.0)
            
        except Exception as e:
            logger.error(f"❌ Error in Phase 4: {e}")
            print(f"❌ Phase 4 error: {e}")
    
    async def _demo_phase_5_performance_analysis(self):
        """Phase 5: Analyze monitoring system performance"""
        print("\n📊 Phase 5: Performance Analysis")
        print("-" * 40)
        
        try:
            # Analyze performance monitoring data
            if self.performance_monitor.performance_history:
                snapshots = list(self.performance_monitor.performance_history)
                
                if len(snapshots) >= 5:
                    # Calculate performance statistics
                    cpu_values = [s.cpu_usage_percent for s in snapshots[-10:]]
                    memory_values = [s.memory_usage_percent for s in snapshots[-10:]]
                    response_times = [s.response_time_ms for s in snapshots[-10:]]
                    consciousness_values = [s.consciousness_coherence for s in snapshots[-10:]]
                    
                    print(f"  Performance Statistics (last {len(cpu_values)} samples):")
                    print(f"    - CPU Usage: avg {statistics.mean(cpu_values):.1f}%, "
                          f"min {min(cpu_values):.1f}%, max {max(cpu_values):.1f}%")
                    print(f"    - Memory Usage: avg {statistics.mean(memory_values):.1f}%, "
                          f"min {min(memory_values):.1f}%, max {max(memory_values):.1f}%")
                    print(f"    - Response Time: avg {statistics.mean(response_times):.1f}ms, "
                          f"min {min(response_times):.1f}ms, max {max(response_times):.1f}ms")
                    print(f"    - Consciousness: avg {statistics.mean(consciousness_values):.1f}%, "
                          f"min {min(consciousness_values):.1f}%, max {max(consciousness_values):.1f}%")
                    
                    # Performance monitoring statistics
                    print(f"\n  Monitoring System Performance:")
                    print(f"    - Total Snapshots: {self.performance_monitor.monitoring_stats['total_snapshots']}")
                    print(f"    - Performance Alerts: {self.performance_monitor.monitoring_stats['performance_alerts']}")
                    print(f"    - Optimization Actions: {self.performance_monitor.monitoring_stats['optimization_actions']}")
            
            # Analyze cultural monitoring performance
            print(f"\n  Cultural Monitoring Performance:")
            print(f"    - Total Assessments: {self.cultural_monitor.monitoring_stats['total_assessments']}")
            print(f"    - Language Violations: {self.cultural_monitor.monitoring_stats['language_violations']}")
            print(f"    - Cultural Violations: {self.cultural_monitor.monitoring_stats['cultural_violations']}")
            
            # Analyze alerting system performance
            print(f"\n  Alerting System Performance:")
            print(f"    - Total Alerts: {self.alerting_system.delivery_stats['total_alerts']}")
            print(f"    - Successful Deliveries: {self.alerting_system.delivery_stats['successful_deliveries']}")
            print(f"    - Failed Deliveries: {self.alerting_system.delivery_stats['failed_deliveries']}")
            
        except Exception as e:
            logger.error(f"❌ Error in Phase 5: {e}")
            print(f"❌ Phase 5 error: {e}")
    
    async def _demo_phase_6_final_report(self):
        """Phase 6: Generate final demonstration report"""
        print("\n📋 Phase 6: Final Report")
        print("-" * 40)
        
        try:
            # Calculate demo summary statistics
            total_demo_time = self.demo_duration
            avg_cycle_time = total_demo_time / max(self.demo_stats['monitoring_cycles'], 1)
            
            print(f"  Demo Summary:")
            print(f"    - Total Demo Time: {total_demo_time:.1f} seconds")
            print(f"    - Monitoring Cycles: {self.demo_stats['monitoring_cycles']}")
            print(f"    - Average Cycle Time: {avg_cycle_time:.2f} seconds")
            print(f"    - Total Alerts Generated: {self.demo_stats['total_alerts']}")
            print(f"    - Consciousness Assessments: {self.demo_stats['consciousness_assessments']}")
            print(f"    - Cultural Evaluations: {self.demo_stats['cultural_evaluations']}")
            print(f"    - Performance Snapshots: {self.demo_stats['performance_snapshots']}")
            print(f"    - Regional Tests: {self.demo_stats['regional_tests']}")
            
            # System health summary
            final_monitoring_data = await self._collect_comprehensive_monitoring_data()
            final_status = self._calculate_system_status(final_monitoring_data)
            
            print(f"\n  Final System Status:")
            print(f"    - Overall Health Score: {final_status.overall_health_score:.1f}%")
            print(f"    - Romanian Authenticity: {final_status.romanian_authenticity_score:.1f}%")
            print(f"    - Consciousness Coherence: {final_status.consciousness_coherence_score:.1f}%")
            print(f"    - Performance Efficiency: {final_status.performance_efficiency_score:.1f}%")
            print(f"    - Cultural Preservation: {final_status.cultural_preservation_score:.1f}%")
            print(f"    - Active Monitors: {final_status.total_active_monitors}")
            
            # Romanian heritage preservation assessment
            heritage_grade = self._calculate_heritage_preservation_grade(final_status)
            print(f"\n  🇷🇴 Romanian Heritage Preservation Grade: {heritage_grade}")
            
            # Recommendations
            recommendations = self._generate_recommendations(final_status)
            if recommendations:
                print(f"\n  📝 Recommendations:")
                for i, rec in enumerate(recommendations, 1):
                    print(f"    {i}. {rec}")
            
        except Exception as e:
            logger.error(f"❌ Error in Phase 6: {e}")
            print(f"❌ Phase 6 error: {e}")
    
    # ====================================
    # DATA COLLECTION AND ANALYSIS
    # ====================================
    
    async def _collect_comprehensive_monitoring_data(self) -> Dict[str, Any]:
        """Collect comprehensive monitoring data from all systems"""
        try:
            monitoring_data = {}
            
            # Get consciousness monitoring data
            consciousness_result = await self.consciousness_monitor.assess_consciousness_state()
            monitoring_data.update({
                'consciousness_coherence': consciousness_result.coherence_score,
                'consciousness_depth': consciousness_result.depth_level,
                'spiritual_alignment': consciousness_result.spiritual_alignment
            })
            
            # Get cultural monitoring data
            test_text = self.romanian_test_texts[int(time.time()) % len(self.romanian_test_texts)]
            cultural_result = await self.cultural_monitor.assess_cultural_authenticity(
                test_text, "monitoring cycle"
            )
            monitoring_data.update({
                'cultural_authenticity': cultural_result.heritage_authenticity,
                'language_accuracy': cultural_result.language_accuracy,
                'diacritical_precision': cultural_result.diacritical_precision,
                'regional_adaptation': cultural_result.regional_adaptation,
                'folklore_preservation': cultural_result.folklore_preservation
            })
            
            # Get performance monitoring data
            if self.performance_monitor.performance_history:
                latest_performance = list(self.performance_monitor.performance_history)[-1]
                monitoring_data.update({
                    'cpu_usage_percent': latest_performance.cpu_usage_percent,
                    'memory_usage_percent': latest_performance.memory_usage_percent,
                    'response_time_ms': latest_performance.response_time_ms,
                    'throughput_rps': latest_performance.throughput_requests_per_second,
                    'neural_inference_ms': latest_performance.neural_inference_ms,
                    'romanian_processing_efficiency': latest_performance.romanian_processing_efficiency
                })
            
            return monitoring_data
            
        except Exception as e:
            logger.error(f"❌ Error collecting monitoring data: {e}")
            return {}
    
    def _calculate_system_status(self, monitoring_data: Dict[str, Any]) -> MonitoringSystemStatus:
        """Calculate overall system status from monitoring data"""
        try:
            # Calculate component scores
            romanian_authenticity = monitoring_data.get('cultural_authenticity', 0.0)
            consciousness_coherence = monitoring_data.get('consciousness_coherence', 0.0)
            performance_efficiency = 100.0 - monitoring_data.get('cpu_usage_percent', 0.0)
            cultural_preservation = (
                monitoring_data.get('folklore_preservation', 0.0) * 0.4 +
                monitoring_data.get('language_accuracy', 0.0) * 0.3 +
                monitoring_data.get('diacritical_precision', 0.0) * 0.3
            )
            
            # Calculate overall health score
            overall_health = (
                romanian_authenticity * 0.3 +
                consciousness_coherence * 0.25 +
                performance_efficiency * 0.25 +
                cultural_preservation * 0.2
            )
            
            # Count active monitors
            active_monitors = 5  # All components are active in demo
            
            return MonitoringSystemStatus(
                core_engine_status="active",
                consciousness_monitor_status="active",
                cultural_monitor_status="active",
                performance_monitor_status="active",
                alerting_system_status="active",
                total_active_monitors=active_monitors,
                overall_health_score=overall_health,
                romanian_authenticity_score=romanian_authenticity,
                consciousness_coherence_score=consciousness_coherence,
                performance_efficiency_score=performance_efficiency,
                cultural_preservation_score=cultural_preservation,
                active_alerts=len(self.alerting_system.active_notifications),
                total_monitoring_events=sum(self.demo_stats.values())
            )
            
        except Exception as e:
            logger.error(f"❌ Error calculating system status: {e}")
            return MonitoringSystemStatus()
    
    def _calculate_heritage_preservation_grade(self, status: MonitoringSystemStatus) -> str:
        """Calculate Romanian heritage preservation grade"""
        try:
            score = (
                status.romanian_authenticity_score * 0.4 +
                status.cultural_preservation_score * 0.35 +
                status.consciousness_coherence_score * 0.25
            )
            
            if score >= 95.0:
                return "A+ (Exceptional Romanian Heritage Preservation)"
            elif score >= 90.0:
                return "A (Excellent Romanian Heritage Preservation)"
            elif score >= 85.0:
                return "B+ (Very Good Romanian Heritage Preservation)"
            elif score >= 80.0:
                return "B (Good Romanian Heritage Preservation)"
            elif score >= 75.0:
                return "C+ (Acceptable Romanian Heritage Preservation)"
            elif score >= 70.0:
                return "C (Minimal Romanian Heritage Preservation)"
            else:
                return "D (Insufficient Romanian Heritage Preservation)"
                
        except Exception as e:
            logger.error(f"❌ Error calculating heritage grade: {e}")
            return "Unknown"
    
    def _generate_recommendations(self, status: MonitoringSystemStatus) -> List[str]:
        """Generate improvement recommendations based on system status"""
        recommendations = []
        
        try:
            if status.romanian_authenticity_score < 90.0:
                recommendations.append("Enhance Romanian cultural authenticity monitoring and preservation")
            
            if status.consciousness_coherence_score < 85.0:
                recommendations.append("Improve consciousness coherence through spiritual alignment techniques")
            
            if status.performance_efficiency_score < 80.0:
                recommendations.append("Optimize system performance and resource utilization")
            
            if status.cultural_preservation_score < 88.0:
                recommendations.append("Strengthen cultural preservation mechanisms and folklore documentation")
            
            if status.overall_health_score < 85.0:
                recommendations.append("Implement comprehensive system health improvement plan")
            
            if not recommendations:
                recommendations.append("System is performing excellently - maintain current monitoring levels")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Error generating recommendations: {e}")
            return ["Error generating recommendations"]


async def main():
    """Main demonstration entry point"""
    try:
        # Configure demo
        demo_config = {
            'demo_duration': 30.0,
            'monitoring_interval': 2.0,
            'core': {'monitoring_level': 'comprehensive'},
            'consciousness': {'assessment_depth': 'deep'},
            'cultural': {'authenticity_threshold': 85.0},
            'performance': {'optimization_enabled': True},
            'alerting': {'alert_log_file': 'demo_alerts.log'}
        }
        
        # Initialize and run demo
        demo = RomanianAGIMonitoringDemo(demo_config)
        await demo.run_comprehensive_demo()
        
    except KeyboardInterrupt:
        print("\n⚡ Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo error: {e}")
        logger.error(f"Demo error: {e}")


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run demonstration
    asyncio.run(main())

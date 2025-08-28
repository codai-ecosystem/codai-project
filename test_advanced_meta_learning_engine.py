"""
Comprehensive Test Suite for Phase 2.2 Advanced Meta-Learning Engine
Tests all major features including strategy selection, transfer learning, and multi-task optimization
"""

import asyncio
import logging
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Add the RomAI source to the path
sys.path.append('apps/romai/src')

from ml.learning.meta_learning_engine import (
    AdvancedMetaLearningEngine,
    LearningTask, 
    LearningExperience,
    TaskContext,
    LearningStrategyType,
    TaskDifficulty,
    PerformanceMetric,
    TransferLearningOpportunity
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestAdvancedMetaLearningEngine:
    """Comprehensive test suite for the Advanced Meta-Learning Engine."""
    
    def __init__(self):
        self.meta_engine = None
        self.test_results = {
            'initialization_test': False,
            'strategy_selection_test': False,
            'transfer_learning_test': False,
            'multi_task_optimization_test': False,
            'experience_recording_test': False,
            'performance_monitoring_test': False,
            'comprehensive_statistics_test': False,
            'success': False
        }
    
    async def run_all_tests(self):
        """Run the complete test suite."""
        
        logger.info("🧠 Starting Advanced Meta-Learning Engine Test Suite")
        logger.info("=" * 70)
        
        try:
            await self.test_initialization()
            await self.test_strategy_selection()
            await self.test_transfer_learning_detection()
            await self.test_multi_task_optimization()
            await self.test_experience_recording()
            await self.test_performance_monitoring()
            await self.test_comprehensive_statistics()
            
            # Overall success
            self.test_results['success'] = all([
                self.test_results['initialization_test'],
                self.test_results['strategy_selection_test'],
                self.test_results['transfer_learning_test'],
                self.test_results['multi_task_optimization_test'],
                self.test_results['experience_recording_test'],
                self.test_results['performance_monitoring_test'],
                self.test_results['comprehensive_statistics_test']
            ])
            
            self.print_test_results()
            
        except Exception as e:
            logger.error(f"❌ Test suite failed with error: {e}")
            self.test_results['error'] = str(e)
    
    async def test_initialization(self):
        """Test meta-learning engine initialization."""
        
        logger.info("🔧 Testing Meta-Learning Engine Initialization")
        
        try:
            self.meta_engine = AdvancedMetaLearningEngine()
            success = await self.meta_engine.initialize()
            
            if success and self.meta_engine.is_initialized:
                # Verify initialization components
                checks = [
                    len(self.meta_engine.strategy_profiles) > 0,
                    len(self.meta_engine.domain_knowledge) > 0,
                    len(self.meta_engine.transfer_opportunities) > 0,
                    len(self.meta_engine.learning_experiences) > 0,
                    self.meta_engine.version == "2.2.0"
                ]
                
                if all(checks):
                    self.test_results['initialization_test'] = True
                    logger.info("✅ Meta-learning engine initialization test passed")
                    logger.info(f"   • Strategy profiles: {len(self.meta_engine.strategy_profiles)}")
                    logger.info(f"   • Domain knowledge: {len(self.meta_engine.domain_knowledge)}")
                    logger.info(f"   • Transfer opportunities: {len(self.meta_engine.transfer_opportunities)}")
                    logger.info(f"   • Baseline experiences: {len(self.meta_engine.learning_experiences)}")
                else:
                    logger.error("❌ Initialization components verification failed")
            else:
                logger.error("❌ Meta-learning engine failed to initialize")
                
        except Exception as e:
            logger.error(f"❌ Initialization test error: {e}")
    
    async def test_strategy_selection(self):
        """Test advanced strategy selection capabilities."""
        
        logger.info("🎯 Testing Advanced Strategy Selection")
        
        try:
            # Create test tasks with different characteristics
            test_tasks = [
                LearningTask(
                    task_id="math_optimization_001",
                    context=TaskContext(
                        domain="mathematics",
                        sub_domain="optimization",
                        task_family="problem_solving",
                        complexity_factors={"abstraction": 0.7, "computation": 0.8}
                    ),
                    difficulty_level=TaskDifficulty.MEDIUM,
                    task_type="optimization",
                    parameters={"variables": 5, "constraints": 3},
                    created_at=datetime.now(),
                    priority=0.8
                ),
                LearningTask(
                    task_id="reasoning_logic_002",
                    context=TaskContext(
                        domain="reasoning",
                        sub_domain="logical",
                        task_family="inference",
                        complexity_factors={"abstraction": 0.9, "inference": 0.8}
                    ),
                    difficulty_level=TaskDifficulty.HARD,
                    task_type="logical_reasoning",
                    parameters={"premises": 8, "rules": 12},
                    created_at=datetime.now(),
                    priority=0.9
                )
            ]
            
            selections_successful = True
            
            for task in test_tasks:
                strategy, confidence, details = await self.meta_engine.select_optimal_strategy(
                    task, 
                    available_resources={"compute": 0.8, "memory": 0.7},
                    consider_transfer=True
                )
                
                # Verify strategy selection results
                if (strategy in LearningStrategyType and 
                    0.0 <= confidence <= 1.0 and 
                    isinstance(details, dict)):
                    
                    logger.info(f"   ✅ Task {task.task_id}: {strategy.value} (confidence: {confidence:.3f})")
                else:
                    logger.error(f"   ❌ Invalid strategy selection for task {task.task_id}")
                    selections_successful = False
            
            if selections_successful:
                self.test_results['strategy_selection_test'] = True
                logger.info("✅ Advanced strategy selection test passed")
            else:
                logger.error("❌ Strategy selection test failed")
                
        except Exception as e:
            logger.error(f"❌ Strategy selection test error: {e}")
    
    async def test_transfer_learning_detection(self):
        """Test transfer learning opportunity detection."""
        
        logger.info("🔄 Testing Transfer Learning Detection")
        
        try:
            # Create a task that should benefit from transfer learning
            target_task = LearningTask(
                task_id="cs_algorithms_003",
                context=TaskContext(
                    domain="computer_science",
                    sub_domain="algorithms",
                    task_family="optimization",
                    related_tasks=["math_optimization_001"]
                ),
                difficulty_level=TaskDifficulty.MEDIUM,
                task_type="algorithm_design",
                parameters={"complexity": "polynomial", "data_structure": "graph"},
                created_at=datetime.now(),
                priority=0.7
            )
            
            # Detect transfer opportunities
            opportunities = await self.meta_engine._detect_transfer_opportunities(target_task)
            
            if opportunities:
                # Verify opportunity structure
                opp = opportunities[0]
                valid_opportunity = (
                    hasattr(opp, 'source_domain') and
                    hasattr(opp, 'target_domain') and
                    hasattr(opp, 'similarity_score') and
                    hasattr(opp, 'estimated_benefit') and
                    opp.target_domain == "computer_science" and
                    0.0 <= opp.similarity_score <= 1.0
                )
                
                if valid_opportunity:
                    self.test_results['transfer_learning_test'] = True
                    logger.info("✅ Transfer learning detection test passed")
                    logger.info(f"   • Found {len(opportunities)} transfer opportunities")
                    logger.info(f"   • Best opportunity: {opp.source_domain} → {opp.target_domain}")
                    logger.info(f"   • Similarity: {opp.similarity_score:.3f}, Benefit: {opp.estimated_benefit:.3f}")
                else:
                    logger.error("❌ Invalid transfer opportunity structure")
            else:
                logger.error("❌ No transfer opportunities detected")
                
        except Exception as e:
            logger.error(f"❌ Transfer learning test error: {e}")
    
    async def test_multi_task_optimization(self):
        """Test multi-task learning optimization."""
        
        logger.info("🔀 Testing Multi-Task Optimization")
        
        try:
            # Create multiple related tasks
            tasks = [
                LearningTask(
                    task_id="multi_math_001",
                    context=TaskContext(domain="mathematics", task_family="algebra"),
                    difficulty_level=TaskDifficulty.EASY,
                    task_type="equation_solving",
                    parameters={"degree": 2},
                    created_at=datetime.now(),
                    priority=0.8
                ),
                LearningTask(
                    task_id="multi_math_002",
                    context=TaskContext(domain="mathematics", task_family="calculus"),
                    difficulty_level=TaskDifficulty.MEDIUM,
                    task_type="optimization",
                    parameters={"variables": 3},
                    created_at=datetime.now(),
                    priority=0.7
                ),
                LearningTask(
                    task_id="multi_cs_003",
                    context=TaskContext(domain="computer_science", task_family="algorithms"),
                    difficulty_level=TaskDifficulty.MEDIUM,
                    task_type="sorting",
                    parameters={"size": 1000},
                    created_at=datetime.now(),
                    priority=0.6
                )
            ]
            
            resource_budget = {"compute": 1.0, "memory": 1.0, "time": 300.0}
            
            # Optimize multi-task learning
            optimization_result = await self.meta_engine.optimize_multi_task_learning(tasks, resource_budget)
            
            # Verify optimization result structure
            expected_keys = [
                "task_count", "resource_allocation", "task_strategies",
                "task_relationships", "shared_opportunities", "coordination_plan",
                "optimization_metadata"
            ]
            
            valid_result = all(key in optimization_result for key in expected_keys)
            
            if valid_result:
                # Verify content
                valid_content = (
                    optimization_result["task_count"] == len(tasks) and
                    len(optimization_result["resource_allocation"]) == len(tasks) and
                    len(optimization_result["task_strategies"]) == len(tasks) and
                    "total_confidence" in optimization_result["optimization_metadata"]
                )
                
                if valid_content:
                    self.test_results['multi_task_optimization_test'] = True
                    logger.info("✅ Multi-task optimization test passed")
                    logger.info(f"   • Optimized {optimization_result['task_count']} tasks")
                    logger.info(f"   • Resource utilization: {optimization_result['optimization_metadata']['resource_utilization']:.3f}")
                    logger.info(f"   • Average confidence: {optimization_result['optimization_metadata']['total_confidence']:.3f}")
                    logger.info(f"   • Shared opportunities: {len(optimization_result['shared_opportunities'])}")
                else:
                    logger.error("❌ Invalid optimization result content")
            else:
                logger.error("❌ Invalid optimization result structure")
                
        except Exception as e:
            logger.error(f"❌ Multi-task optimization test error: {e}")
    
    async def test_experience_recording(self):
        """Test learning experience recording and adaptation."""
        
        logger.info("📊 Testing Experience Recording and Adaptation")
        
        try:
            initial_experiences = len(self.meta_engine.learning_experiences)
            
            # Create and record a learning experience
            experience = LearningExperience(
                task_id="test_recording_001",
                learning_strategy=LearningStrategyType.ANALOGICAL_REASONING,
                performance_metrics={
                    PerformanceMetric.ACCURACY: 0.85,
                    PerformanceMetric.EFFICIENCY: 0.78,
                    PerformanceMetric.GENERALIZATION: 0.72
                },
                learning_time=95.5,
                resource_usage={"memory": 45.2, "compute": 67.8},
                success_rate=0.85,
                timestamp=datetime.now(),
                knowledge_gained=["pattern_matching", "similarity_assessment"],
                transfer_sources=["mathematics"]
            )
            
            await self.meta_engine.record_learning_experience(experience)
            
            # Verify experience was recorded
            final_experiences = len(self.meta_engine.learning_experiences)
            experience_recorded = final_experiences == initial_experiences + 1
            
            # Verify strategy profile was updated
            profile = self.meta_engine.strategy_profiles[LearningStrategyType.ANALOGICAL_REASONING]
            profile_updated = profile.last_updated > datetime.now() - timedelta(seconds=30)
            
            if experience_recorded and profile_updated:
                self.test_results['experience_recording_test'] = True
                logger.info("✅ Experience recording test passed")
                logger.info(f"   • Total experiences: {final_experiences}")
                logger.info(f"   • Profile updated: {profile_updated}")
            else:
                logger.error("❌ Experience recording test failed")
                logger.error(f"   • Experience recorded: {experience_recorded}")
                logger.error(f"   • Profile updated: {profile_updated}")
                
        except Exception as e:
            logger.error(f"❌ Experience recording test error: {e}")
    
    async def test_performance_monitoring(self):
        """Test performance monitoring and trend analysis."""
        
        logger.info("📈 Testing Performance Monitoring")
        
        try:
            # Generate several experiences with different performance levels
            strategies = [LearningStrategyType.ANALOGICAL_REASONING, LearningStrategyType.GRADIENT_BASED]
            
            for i, strategy in enumerate(strategies * 3):  # 6 experiences total
                performance = 0.6 + (i * 0.05)  # Increasing performance
                
                experience = LearningExperience(
                    task_id=f"perf_test_{i:03d}",
                    learning_strategy=strategy,
                    performance_metrics={
                        PerformanceMetric.ACCURACY: performance,
                        PerformanceMetric.EFFICIENCY: performance * 0.9
                    },
                    learning_time=100.0 - (i * 5),  # Decreasing time (improving efficiency)
                    resource_usage={"memory": 50.0, "compute": 60.0},
                    success_rate=performance,
                    timestamp=datetime.now() - timedelta(hours=i)
                )
                
                await self.meta_engine.record_learning_experience(experience)
            
            # Calculate improvement rate
            improvement_rate = self.meta_engine._calculate_improvement_rate()
            efficiency_trend = self.meta_engine._calculate_efficiency_trend()
            
            # Verify positive trends (should be positive due to increasing performance)
            positive_improvement = improvement_rate > 0
            valid_efficiency = isinstance(efficiency_trend, float)
            
            if positive_improvement and valid_efficiency:
                self.test_results['performance_monitoring_test'] = True
                logger.info("✅ Performance monitoring test passed")
                logger.info(f"   • Improvement rate: {improvement_rate:.4f}")
                logger.info(f"   • Efficiency trend: {efficiency_trend:.4f}")
            else:
                logger.error("❌ Performance monitoring test failed")
                logger.error(f"   • Improvement rate: {improvement_rate}")
                logger.error(f"   • Efficiency trend: {efficiency_trend}")
                
        except Exception as e:
            logger.error(f"❌ Performance monitoring test error: {e}")
    
    async def test_comprehensive_statistics(self):
        """Test comprehensive statistics generation."""
        
        logger.info("📋 Testing Comprehensive Statistics")
        
        try:
            stats = await self.meta_engine.get_comprehensive_statistics()
            
            # Verify statistics structure
            required_sections = [
                "meta_learning_version", "total_learning_sessions", "total_experiences",
                "performance_statistics", "strategy_effectiveness", "domain_expertise",
                "transfer_learning", "meta_insights", "system_health"
            ]
            
            valid_structure = all(section in stats for section in required_sections)
            
            if valid_structure:
                # Verify content validity
                valid_content = (
                    stats["meta_learning_version"] == "2.2.0" and
                    stats["total_experiences"] > 0 and
                    len(stats["performance_statistics"]) > 0 and
                    len(stats["strategy_effectiveness"]) > 0 and
                    "is_learning" in stats["system_health"]
                )
                
                if valid_content:
                    self.test_results['comprehensive_statistics_test'] = True
                    logger.info("✅ Comprehensive statistics test passed")
                    logger.info(f"   • Total experiences: {stats['total_experiences']}")
                    logger.info(f"   • Performance metrics: {len(stats['performance_statistics'])}")
                    logger.info(f"   • Strategy profiles: {len(stats['strategy_effectiveness'])}")
                    logger.info(f"   • Domain expertise: {len(stats['domain_expertise'])}")
                    logger.info(f"   • Transfer success rate: {stats['transfer_learning']['transfer_success_rate']:.1f}%")
                else:
                    logger.error("❌ Invalid statistics content")
            else:
                logger.error("❌ Invalid statistics structure")
                logger.error(f"Missing sections: {set(required_sections) - set(stats.keys())}")
                
        except Exception as e:
            logger.error(f"❌ Comprehensive statistics test error: {e}")
    
    def print_test_results(self):
        """Print comprehensive test results."""
        
        logger.info("=" * 70)
        logger.info("🧠 ADVANCED META-LEARNING ENGINE TEST RESULTS")
        logger.info("=" * 70)
        
        test_names = {
            'initialization_test': 'Engine Initialization',
            'strategy_selection_test': 'Strategy Selection',
            'transfer_learning_test': 'Transfer Learning Detection',
            'multi_task_optimization_test': 'Multi-Task Optimization',
            'experience_recording_test': 'Experience Recording',
            'performance_monitoring_test': 'Performance Monitoring',
            'comprehensive_statistics_test': 'Comprehensive Statistics'
        }
        
        for test_key, test_name in test_names.items():
            status = "✅ PASSED" if self.test_results[test_key] else "❌ FAILED"
            logger.info(f"{test_name}: {status}")
        
        logger.info("=" * 70)
        
        if self.test_results['success']:
            logger.info("🎉 OVERALL RESULT: SUCCESS")
            logger.info("🚀 Phase 2.2 Advanced Meta-Learning Engine Implementation COMPLETE!")
            logger.info("   • Strategy Selection: Operational")
            logger.info("   • Transfer Learning: Operational") 
            logger.info("   • Multi-Task Optimization: Operational")
            logger.info("   • Performance Monitoring: Operational")
            logger.info("   • Adaptive Learning: Operational")
        else:
            logger.info("⚠️ OVERALL RESULT: FAILED")
            logger.info("🔧 Phase 2.2 Advanced Meta-Learning Engine requires fixes")
        
        logger.info("=" * 70)

async def main():
    """Run the complete test suite."""
    test_suite = TestAdvancedMetaLearningEngine()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
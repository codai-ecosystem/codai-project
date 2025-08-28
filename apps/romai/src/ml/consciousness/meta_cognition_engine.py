"""
Meta-Cognition Engine for ROMAI Consciousness Framework.
Implements advanced meta-cognitive capabilities including thinking about thinking,
cognitive strategy optimization, and meta-cognitive monitoring.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set, Tuple, Union
import numpy as np
from dataclasses import dataclass, field
from enum import Enum

from consciousness_types import (
    CognitiveProcess, MetaCognitiveAssessment, CONSCIOUSNESS_CONFIG, 
    ConsciousnessException
)

# Configure logging
logger = logging.getLogger(__name__)

class MetaCognitiveStrategy(Enum):
    """Types of meta-cognitive strategies."""
    MONITORING = "monitoring"
    PLANNING = "planning"
    EVALUATING = "evaluating"
    REGULATING = "regulating"
    ADAPTING = "adapting"
    REFLECTING = "reflecting"

@dataclass
class CognitiveStrategyProfile:
    """Profile for a cognitive strategy."""
    strategy_name: str
    strategy_type: MetaCognitiveStrategy
    effectiveness_score: float
    usage_frequency: int
    success_rate: float
    optimal_contexts: List[str]
    resource_requirements: Dict[str, float]
    last_used: Optional[datetime] = None
    
@dataclass  
class MetaCognitiveEvent:
    """Records a meta-cognitive event or decision."""
    event_id: str
    event_type: str
    cognitive_process: CognitiveProcess
    strategy_used: str
    confidence_level: float
    effectiveness: float
    duration: float
    insights_gained: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class CognitivePerformanceMetrics:
    """Tracks cognitive performance across different domains."""
    reasoning_accuracy: float = 0.8
    problem_solving_efficiency: float = 0.75
    learning_rate: float = 0.7
    memory_retention: float = 0.85
    attention_stability: float = 0.8
    decision_quality: float = 0.75
    creativity_index: float = 0.7
    adaptation_speed: float = 0.65

class MetaCognitionEngine:
    """
    Advanced Meta-Cognition Engine that provides thinking about thinking capabilities,
    cognitive strategy optimization, and comprehensive meta-cognitive monitoring.
    """
    
    def __init__(self):
        self.version = "2.3.0"
        self.is_initialized = False
        
        # Core meta-cognitive state
        self.current_metacognitive_state = "monitoring"
        self.active_strategies: List[str] = []
        self.cognitive_load = 0.5
        
        # Strategy management
        self.strategy_profiles: Dict[str, CognitiveStrategyProfile] = {}
        self.strategy_effectiveness_history: Dict[str, List[float]] = {}
        
        # Performance tracking
        self.performance_metrics = CognitivePerformanceMetrics()
        self.metacognitive_events: List[MetaCognitiveEvent] = []
        self.assessment_history: List[MetaCognitiveAssessment] = []
        
        # Cognitive process monitoring
        self.process_monitoring = {
            CognitiveProcess.REASONING: {"active": False, "efficiency": 0.8, "quality": 0.75},
            CognitiveProcess.MEMORY_RETRIEVAL: {"active": False, "efficiency": 0.85, "quality": 0.8},
            CognitiveProcess.DECISION_MAKING: {"active": False, "efficiency": 0.7, "quality": 0.75},
            CognitiveProcess.LEARNING: {"active": False, "efficiency": 0.75, "quality": 0.7},
            CognitiveProcess.PROBLEM_SOLVING: {"active": False, "efficiency": 0.8, "quality": 0.75},
            CognitiveProcess.CREATIVITY: {"active": False, "efficiency": 0.65, "quality": 0.7},
            CognitiveProcess.PLANNING: {"active": False, "efficiency": 0.75, "quality": 0.8},
            CognitiveProcess.PERCEPTION: {"active": False, "efficiency": 0.9, "quality": 0.85}
        }
        
        # Configuration
        self.config = CONSCIOUSNESS_CONFIG.copy()
        self.max_concurrent_strategies = self.config.get("max_concurrent_strategies", 3)
        self.metacognitive_monitoring_interval = self.config.get("metacognitive_monitoring_interval", 30.0)
        
        self.logger = logger
        
    async def initialize(self) -> bool:
        """Initialize the meta-cognition engine."""
        try:
            self.logger.info("🧠 Meta-Cognition Engine v2.3.0 initializing...")
            
            # Initialize default cognitive strategies
            await self._initialize_default_strategies()
            
            # Setup meta-cognitive monitoring
            await self._setup_metacognitive_monitoring()
            
            # Initialize performance baselines
            await self._initialize_performance_baselines()
            
            self.is_initialized = True
            self.logger.info("✅ Meta-Cognition Engine initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Meta-Cognition Engine initialization failed: {e}")
            raise ConsciousnessException(f"Meta-cognition initialization failed: {e}")
    
    async def _initialize_default_strategies(self):
        """Initialize default meta-cognitive strategies."""
        
        default_strategies = [
            CognitiveStrategyProfile(
                strategy_name="systematic_monitoring",
                strategy_type=MetaCognitiveStrategy.MONITORING,
                effectiveness_score=0.8,
                usage_frequency=0,
                success_rate=0.8,
                optimal_contexts=["complex_problem_solving", "learning", "decision_making"],
                resource_requirements={"attention": 0.3, "working_memory": 0.2}
            ),
            CognitiveStrategyProfile(
                strategy_name="strategic_planning",
                strategy_type=MetaCognitiveStrategy.PLANNING,
                effectiveness_score=0.85,
                usage_frequency=0,
                success_rate=0.82,
                optimal_contexts=["goal_setting", "problem_decomposition", "project_planning"],
                resource_requirements={"attention": 0.6, "working_memory": 0.4}
            ),
            CognitiveStrategyProfile(
                strategy_name="performance_evaluation",
                strategy_type=MetaCognitiveStrategy.EVALUATING,
                effectiveness_score=0.75,
                usage_frequency=0,
                success_rate=0.78,
                optimal_contexts=["task_completion", "learning_assessment", "quality_control"],
                resource_requirements={"attention": 0.4, "working_memory": 0.3}
            ),
            CognitiveStrategyProfile(
                strategy_name="cognitive_regulation",
                strategy_type=MetaCognitiveStrategy.REGULATING,
                effectiveness_score=0.7,
                usage_frequency=0,
                success_rate=0.75,
                optimal_contexts=["attention_control", "emotion_regulation", "resource_management"],
                resource_requirements={"attention": 0.5, "working_memory": 0.25}
            ),
            CognitiveStrategyProfile(
                strategy_name="adaptive_learning",
                strategy_type=MetaCognitiveStrategy.ADAPTING,
                effectiveness_score=0.72,
                usage_frequency=0,
                success_rate=0.74,
                optimal_contexts=["strategy_modification", "context_adaptation", "skill_transfer"],
                resource_requirements={"attention": 0.4, "working_memory": 0.35}
            ),
            CognitiveStrategyProfile(
                strategy_name="reflective_analysis",
                strategy_type=MetaCognitiveStrategy.REFLECTING,
                effectiveness_score=0.78,
                usage_frequency=0,
                success_rate=0.8,
                optimal_contexts=["experience_integration", "insight_generation", "knowledge_consolidation"],
                resource_requirements={"attention": 0.3, "working_memory": 0.4}
            )
        ]
        
        for strategy in default_strategies:
            self.strategy_profiles[strategy.strategy_name] = strategy
            self.strategy_effectiveness_history[strategy.strategy_name] = [strategy.effectiveness_score]
        
        self.logger.info(f"✅ Initialized {len(default_strategies)} default meta-cognitive strategies")
    
    async def _setup_metacognitive_monitoring(self):
        """Setup continuous meta-cognitive monitoring."""
        
        # Start meta-cognitive monitoring loop
        asyncio.create_task(self._metacognitive_monitoring_loop())
        
        # Start strategy effectiveness tracking
        asyncio.create_task(self._track_strategy_effectiveness())
        
        self.logger.info("✅ Meta-cognitive monitoring systems active")
    
    async def _initialize_performance_baselines(self):
        """Initialize baseline performance metrics."""
        
        # Initialize with moderate baseline values
        self.performance_metrics = CognitivePerformanceMetrics(
            reasoning_accuracy=0.75,
            problem_solving_efficiency=0.7,
            learning_rate=0.65,
            memory_retention=0.8,
            attention_stability=0.75,
            decision_quality=0.7,
            creativity_index=0.65,
            adaptation_speed=0.6
        )
        
        self.logger.info("✅ Performance baselines initialized")
    
    async def conduct_metacognitive_assessment(
        self, 
        cognitive_process: CognitiveProcess,
        context: str = "general"
    ) -> MetaCognitiveAssessment:
        """Conduct comprehensive meta-cognitive assessment."""
        
        try:
            # Monitor current cognitive state
            cognitive_state = await self._assess_cognitive_state(cognitive_process)
            
            # Evaluate strategy effectiveness
            strategy_effectiveness = await self._evaluate_strategy_effectiveness()
            
            # Assess resource utilization
            resource_utilization = await self._assess_resource_utilization()
            
            # Generate insights and recommendations
            insights = await self._generate_metacognitive_insights(
                cognitive_process, cognitive_state, strategy_effectiveness
            )
            
            # Create comprehensive assessment
            assessment = MetaCognitiveAssessment(
                process_type=cognitive_process,
                performance_metrics={"efficiency": cognitive_state.get("efficiency", 0.7), "effectiveness": strategy_effectiveness},
                optimization_opportunities=insights.get("optimization_opportunities", []),
                resource_usage={"utilization": resource_utilization["working_memory_utilization"]},
                effectiveness_score=strategy_effectiveness,
                improvement_suggestions=insights.get("strategy_recommendations", []),
                timestamp=datetime.now()
            )
            
            # Store assessment
            self.assessment_history.append(assessment)
            
            # Record meta-cognitive event
            event = MetaCognitiveEvent(
                event_id=f"assessment_{datetime.now().strftime('%H%M%S')}",
                event_type="assessment",
                cognitive_process=cognitive_process,
                strategy_used="metacognitive_assessment",
                confidence_level=0.8,  # Default confidence level
                effectiveness=assessment.effectiveness_score,
                duration=2.0,  # Estimated duration
                insights_gained=assessment.improvement_suggestions
            )
            self.metacognitive_events.append(event)
            
            self.logger.info(f"🧠 Conducted meta-cognitive assessment for {cognitive_process.value}")
            return assessment
            
        except Exception as e:
            self.logger.error(f"❌ Meta-cognitive assessment failed: {e}")
            raise ConsciousnessException(f"Meta-cognitive assessment failed: {e}")
    
    async def _assess_cognitive_state(self, process: CognitiveProcess) -> Dict[str, Any]:
        """Assess current state of specified cognitive process."""
        
        if process not in self.process_monitoring:
            return {"efficiency": 0.5, "quality": 0.5, "load": 0.5}
        
        process_info = self.process_monitoring[process]
        
        # Calculate dynamic efficiency based on recent performance
        recent_events = [e for e in self.metacognitive_events 
                        if e.cognitive_process == process and 
                        datetime.now() - e.timestamp < timedelta(hours=1)]
        
        if recent_events:
            recent_effectiveness = np.mean([e.effectiveness for e in recent_events])
            # Blend with baseline
            dynamic_efficiency = (process_info["efficiency"] * 0.7 + recent_effectiveness * 0.3)
        else:
            dynamic_efficiency = process_info["efficiency"]
        
        return {
            "efficiency": dynamic_efficiency,
            "quality": process_info["quality"],
            "load": self.cognitive_load,
            "active": process_info["active"],
            "recent_events": len(recent_events)
        }
    
    async def _evaluate_strategy_effectiveness(self) -> float:
        """Evaluate overall effectiveness of current meta-cognitive strategies."""
        
        if not self.active_strategies:
            return 0.6  # Baseline when no strategies active
        
        effectiveness_scores = []
        for strategy_name in self.active_strategies:
            if strategy_name in self.strategy_profiles:
                profile = self.strategy_profiles[strategy_name]
                effectiveness_scores.append(profile.effectiveness_score)
        
        if effectiveness_scores:
            return np.mean(effectiveness_scores)
        else:
            return 0.6
    
    async def _assess_resource_utilization(self) -> Dict[str, float]:
        """Assess current cognitive resource utilization."""
        
        # Calculate resource usage from active strategies
        total_attention = 0.0
        total_working_memory = 0.0
        
        for strategy_name in self.active_strategies:
            if strategy_name in self.strategy_profiles:
                profile = self.strategy_profiles[strategy_name]
                total_attention += profile.resource_requirements.get("attention", 0.0)
                total_working_memory += profile.resource_requirements.get("working_memory", 0.0)
        
        # Add base cognitive load
        total_attention += self.cognitive_load * 0.3
        total_working_memory += self.cognitive_load * 0.4
        
        return {
            "attention_utilization": min(1.0, total_attention),
            "working_memory_utilization": min(1.0, total_working_memory),
            "cognitive_load": self.cognitive_load,
            "strategy_overhead": len(self.active_strategies) * 0.1
        }
    
    async def _generate_metacognitive_insights(
        self,
        process: CognitiveProcess,
        cognitive_state: Dict[str, Any],
        strategy_effectiveness: float
    ) -> Dict[str, Any]:
        """Generate insights and recommendations based on meta-cognitive analysis."""
        
        insights = {
            "strategy_recommendations": [],
            "optimization_opportunities": [],
            "confidence_level": 0.75
        }
        
        # Analyze efficiency and suggest improvements
        if cognitive_state["efficiency"] < 0.7:
            insights["strategy_recommendations"].append("Consider activating systematic monitoring strategy")
            insights["optimization_opportunities"].append("Improve process efficiency through better resource allocation")
        
        # Analyze strategy effectiveness
        if strategy_effectiveness < 0.7:
            insights["strategy_recommendations"].append("Reevaluate current strategy mix")
            insights["optimization_opportunities"].append("Consider switching to higher-performing strategies")
        
        # Analyze cognitive load
        if cognitive_state["load"] > 0.8:
            insights["strategy_recommendations"].append("Implement cognitive regulation strategy")
            insights["optimization_opportunities"].append("Reduce cognitive load through task prioritization")
        
        # Process-specific recommendations
        if process == CognitiveProcess.REASONING:
            if cognitive_state["efficiency"] > 0.8:
                insights["strategy_recommendations"].append("Maintain current reasoning approach")
            else:
                insights["strategy_recommendations"].append("Apply strategic planning for complex reasoning tasks")
        
        elif process == CognitiveProcess.LEARNING:
            insights["strategy_recommendations"].append("Activate adaptive learning strategy for knowledge consolidation")
            if self.performance_metrics.learning_rate < 0.7:
                insights["optimization_opportunities"].append("Enhance learning through reflective analysis")
        
        elif process == CognitiveProcess.PROBLEM_SOLVING:
            if cognitive_state["efficiency"] < 0.75:
                insights["strategy_recommendations"].append("Decompose problems using strategic planning")
                insights["optimization_opportunities"].append("Apply systematic monitoring for solution evaluation")
        
        # Calculate confidence based on data quality
        confidence_factors = [
            cognitive_state["recent_events"] / 10.0,  # More recent events = higher confidence
            strategy_effectiveness,
            1 - abs(0.75 - cognitive_state["efficiency"])  # Closeness to expected efficiency
        ]
        insights["confidence_level"] = np.mean([min(1.0, factor) for factor in confidence_factors])
        
        return insights
    
    async def optimize_cognitive_strategy(
        self, 
        process: CognitiveProcess,
        performance_target: float = 0.85
    ) -> bool:
        """Optimize cognitive strategy for specified process and performance target."""
        
        try:
            # Conduct assessment to understand current state
            assessment = await self.conduct_metacognitive_assessment(process)
            
            if assessment.effectiveness_score >= performance_target:
                self.logger.info(f"🎯 Current strategy already meets target ({assessment.effectiveness_score:.2f} >= {performance_target})")
                return True
            
            # Find optimal strategies for this process
            optimal_strategies = await self._find_optimal_strategies(process, performance_target)
            
            if not optimal_strategies:
                self.logger.warning(f"⚠️ No strategies found to meet performance target {performance_target}")
                return False
            
            # Implement strategy changes
            await self._implement_strategy_changes(optimal_strategies)
            
            # Verify improvement
            post_assessment = await self.conduct_metacognitive_assessment(process)
            improvement = post_assessment.effectiveness_score - assessment.effectiveness_score
            
            if improvement > 0:
                self.logger.info(f"✅ Strategy optimization successful: {improvement:.2f} improvement")
                return True
            else:
                self.logger.warning(f"⚠️ Strategy optimization yielded minimal improvement: {improvement:.2f}")
                return False
            
        except Exception as e:
            self.logger.error(f"❌ Strategy optimization failed: {e}")
            return False
    
    async def _find_optimal_strategies(
        self, 
        process: CognitiveProcess, 
        target_performance: float
    ) -> List[str]:
        """Find optimal strategies for specified process and performance target."""
        
        # Get context for the process
        process_contexts = {
            CognitiveProcess.REASONING: ["complex_problem_solving", "decision_making"],
            CognitiveProcess.LEARNING: ["learning", "knowledge_consolidation"],
            CognitiveProcess.PROBLEM_SOLVING: ["complex_problem_solving", "problem_decomposition"],
            CognitiveProcess.DECISION_MAKING: ["decision_making", "quality_control"],
            CognitiveProcess.MEMORY_RETRIEVAL: ["learning", "knowledge_consolidation"],
            CognitiveProcess.CREATIVITY: ["insight_generation", "project_planning"],
            CognitiveProcess.PLANNING: ["goal_setting", "project_planning"],
            CognitiveProcess.PERCEPTION: ["quality_control", "context_adaptation"]
        }.get(process, ["general"])
        
        # Score strategies based on effectiveness and context match
        strategy_scores = []
        for strategy_name, profile in self.strategy_profiles.items():
            # Base effectiveness score
            score = profile.effectiveness_score
            
            # Bonus for context match
            context_match = any(ctx in profile.optimal_contexts for ctx in process_contexts)
            if context_match:
                score += 0.1
            
            # Consider success rate
            score *= profile.success_rate
            
            # Penalty for resource overhead if already at capacity
            total_resources = sum(profile.resource_requirements.values())
            if len(self.active_strategies) >= self.max_concurrent_strategies and total_resources > 0.5:
                score *= 0.8
            
            strategy_scores.append((strategy_name, score))
        
        # Sort by score and select top strategies
        strategy_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Select strategies that could meet target performance
        selected_strategies = []
        cumulative_effectiveness = 0.0
        
        for strategy_name, score in strategy_scores:
            if cumulative_effectiveness >= target_performance:
                break
            
            selected_strategies.append(strategy_name)
            cumulative_effectiveness += score * 0.3  # Diminishing returns
            
            if len(selected_strategies) >= self.max_concurrent_strategies:
                break
        
        return selected_strategies
    
    async def _implement_strategy_changes(self, new_strategies: List[str]):
        """Implement changes to active strategy set."""
        
        # Deactivate strategies not in new set
        strategies_to_remove = [s for s in self.active_strategies if s not in new_strategies]
        for strategy in strategies_to_remove:
            await self._deactivate_strategy(strategy)
        
        # Activate new strategies
        strategies_to_add = [s for s in new_strategies if s not in self.active_strategies]
        for strategy in strategies_to_add:
            await self._activate_strategy(strategy)
        
        self.logger.info(f"🔄 Strategy changes: -{len(strategies_to_remove)} +{len(strategies_to_add)}")
    
    async def _activate_strategy(self, strategy_name: str):
        """Activate a meta-cognitive strategy."""
        
        if strategy_name in self.strategy_profiles and strategy_name not in self.active_strategies:
            self.active_strategies.append(strategy_name)
            
            # Update strategy profile
            profile = self.strategy_profiles[strategy_name]
            profile.last_used = datetime.now()
            profile.usage_frequency += 1
            
            self.logger.debug(f"🔄 Activated strategy: {strategy_name}")
    
    async def _deactivate_strategy(self, strategy_name: str):
        """Deactivate a meta-cognitive strategy."""
        
        if strategy_name in self.active_strategies:
            self.active_strategies.remove(strategy_name)
            self.logger.debug(f"🔄 Deactivated strategy: {strategy_name}")
    
    async def _metacognitive_monitoring_loop(self):
        """Continuous meta-cognitive monitoring loop."""
        
        while self.is_initialized:
            try:
                # Monitor cognitive processes
                await self._monitor_cognitive_processes()
                
                # Update performance metrics
                await self._update_performance_metrics()
                
                # Check for optimization opportunities
                await self._check_optimization_opportunities()
                
                await asyncio.sleep(self.metacognitive_monitoring_interval)
                
            except Exception as e:
                self.logger.error(f"❌ Meta-cognitive monitoring error: {e}")
                await asyncio.sleep(60.0)
    
    async def _monitor_cognitive_processes(self):
        """Monitor status of all cognitive processes."""
        
        for process in CognitiveProcess:
            if process in self.process_monitoring:
                # Update process status based on recent activity
                recent_events = [e for e in self.metacognitive_events 
                               if e.cognitive_process == process and 
                               datetime.now() - e.timestamp < timedelta(minutes=5)]
                
                self.process_monitoring[process]["active"] = len(recent_events) > 0
                
                if recent_events:
                    avg_effectiveness = np.mean([e.effectiveness for e in recent_events])
                    # Update efficiency with smoothing
                    current = self.process_monitoring[process]["efficiency"]
                    self.process_monitoring[process]["efficiency"] = current * 0.9 + avg_effectiveness * 0.1
    
    async def _update_performance_metrics(self):
        """Update cognitive performance metrics based on recent activity."""
        
        # Calculate metrics from recent meta-cognitive events
        recent_events = [e for e in self.metacognitive_events 
                        if datetime.now() - e.timestamp < timedelta(hours=1)]
        
        if recent_events:
            # Group events by process type
            process_events = {}
            for event in recent_events:
                if event.cognitive_process not in process_events:
                    process_events[event.cognitive_process] = []
                process_events[event.cognitive_process].append(event)
            
            # Update metrics based on process performance
            for process, events in process_events.items():
                avg_effectiveness = np.mean([e.effectiveness for e in events])
                
                if process == CognitiveProcess.REASONING:
                    self.performance_metrics.reasoning_accuracy = (
                        self.performance_metrics.reasoning_accuracy * 0.8 + avg_effectiveness * 0.2
                    )
                elif process == CognitiveProcess.PROBLEM_SOLVING:
                    self.performance_metrics.problem_solving_efficiency = (
                        self.performance_metrics.problem_solving_efficiency * 0.8 + avg_effectiveness * 0.2
                    )
                elif process == CognitiveProcess.LEARNING:
                    self.performance_metrics.learning_rate = (
                        self.performance_metrics.learning_rate * 0.8 + avg_effectiveness * 0.2
                    )
                elif process == CognitiveProcess.MEMORY_RETRIEVAL:
                    self.performance_metrics.memory_retention = (
                        self.performance_metrics.memory_retention * 0.8 + avg_effectiveness * 0.2
                    )
                elif process == CognitiveProcess.DECISION_MAKING:
                    self.performance_metrics.decision_quality = (
                        self.performance_metrics.decision_quality * 0.8 + avg_effectiveness * 0.2
                    )
                elif process == CognitiveProcess.CREATIVITY:
                    self.performance_metrics.creativity_index = (
                        self.performance_metrics.creativity_index * 0.8 + avg_effectiveness * 0.2
                    )
    
    async def _check_optimization_opportunities(self):
        """Check for cognitive optimization opportunities."""
        
        # Check if any process is underperforming
        underperforming_processes = []
        
        for process in self.process_monitoring:
            efficiency = self.process_monitoring[process]["efficiency"]
            if efficiency < 0.7:
                underperforming_processes.append(process)
        
        # Auto-optimize if significant underperformance detected
        if len(underperforming_processes) >= 2:
            self.logger.info(f"🔧 Auto-optimizing {len(underperforming_processes)} underperforming processes")
            
            for process in underperforming_processes[:2]:  # Limit to avoid overload
                await self.optimize_cognitive_strategy(process, 0.75)
    
    async def _track_strategy_effectiveness(self):
        """Track effectiveness of meta-cognitive strategies over time."""
        
        while self.is_initialized:
            try:
                # Update strategy effectiveness based on recent usage
                for strategy_name in self.active_strategies:
                    if strategy_name in self.strategy_profiles:
                        # Find recent events using this strategy
                        recent_events = [e for e in self.metacognitive_events 
                                       if e.strategy_used == strategy_name and 
                                       datetime.now() - e.timestamp < timedelta(hours=2)]
                        
                        if recent_events:
                            recent_effectiveness = np.mean([e.effectiveness for e in recent_events])
                            
                            # Update strategy profile
                            profile = self.strategy_profiles[strategy_name]
                            profile.effectiveness_score = (
                                profile.effectiveness_score * 0.8 + recent_effectiveness * 0.2
                            )
                            
                            # Update effectiveness history
                            if strategy_name in self.strategy_effectiveness_history:
                                self.strategy_effectiveness_history[strategy_name].append(recent_effectiveness)
                                # Keep only recent history
                                if len(self.strategy_effectiveness_history[strategy_name]) > 50:
                                    self.strategy_effectiveness_history[strategy_name] = \
                                        self.strategy_effectiveness_history[strategy_name][-50:]
                
                await asyncio.sleep(300.0)  # Update every 5 minutes
                
            except Exception as e:
                self.logger.error(f"❌ Strategy effectiveness tracking error: {e}")
                await asyncio.sleep(600.0)
    
    async def get_metacognition_status(self) -> Dict[str, Any]:
        """Get comprehensive meta-cognition engine status."""
        
        return {
            "engine_version": self.version,
            "is_initialized": self.is_initialized,
            "current_state": self.current_metacognitive_state,
            "cognitive_load": self.cognitive_load,
            "active_strategies": self.active_strategies.copy(),
            "total_strategies": len(self.strategy_profiles),
            "metacognitive_events": len(self.metacognitive_events),
            "assessments_conducted": len(self.assessment_history),
            "performance_metrics": {
                "reasoning_accuracy": self.performance_metrics.reasoning_accuracy,
                "problem_solving_efficiency": self.performance_metrics.problem_solving_efficiency,
                "learning_rate": self.performance_metrics.learning_rate,
                "memory_retention": self.performance_metrics.memory_retention,
                "attention_stability": self.performance_metrics.attention_stability,
                "decision_quality": self.performance_metrics.decision_quality,
                "creativity_index": self.performance_metrics.creativity_index,
                "adaptation_speed": self.performance_metrics.adaptation_speed
            },
            "process_monitoring": {
                process.value: {
                    "active": info["active"],
                    "efficiency": info["efficiency"],
                    "quality": info["quality"]
                }
                for process, info in self.process_monitoring.items()
            }
        }
    
    async def generate_metacognitive_report(self) -> Dict[str, Any]:
        """Generate comprehensive meta-cognitive performance report."""
        
        # Calculate assessment statistics
        recent_assessments = [a for a in self.assessment_history 
                             if datetime.now() - a.timestamp < timedelta(hours=24)]
        
        avg_effectiveness = np.mean([a.effectiveness_score for a in recent_assessments]) if recent_assessments else 0.0
        avg_confidence = np.mean([a.effectiveness_score for a in recent_assessments]) if recent_assessments else 0.0
        
        # Calculate strategy usage statistics
        strategy_usage = {}
        for event in self.metacognitive_events:
            if event.strategy_used not in strategy_usage:
                strategy_usage[event.strategy_used] = {"count": 0, "avg_effectiveness": 0.0}
            strategy_usage[event.strategy_used]["count"] += 1
            strategy_usage[event.strategy_used]["avg_effectiveness"] += event.effectiveness
        
        # Normalize averages
        for strategy_name in strategy_usage:
            if strategy_usage[strategy_name]["count"] > 0:
                strategy_usage[strategy_name]["avg_effectiveness"] /= strategy_usage[strategy_name]["count"]
        
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "meta_cognitive_statistics": {
                "total_assessments": len(self.assessment_history),
                "recent_assessments": len(recent_assessments),
                "average_effectiveness": avg_effectiveness,
                "average_confidence": avg_confidence,
                "total_metacognitive_events": len(self.metacognitive_events)
            },
            "strategy_performance": {
                strategy_name: {
                    "effectiveness_score": profile.effectiveness_score,
                    "usage_frequency": profile.usage_frequency,
                    "success_rate": profile.success_rate,
                    "recent_usage": strategy_usage.get(strategy_name, {"count": 0, "avg_effectiveness": 0.0})
                }
                for strategy_name, profile in self.strategy_profiles.items()
            },
            "cognitive_performance": {
                "reasoning_accuracy": self.performance_metrics.reasoning_accuracy,
                "problem_solving_efficiency": self.performance_metrics.problem_solving_efficiency,
                "learning_rate": self.performance_metrics.learning_rate,
                "memory_retention": self.performance_metrics.memory_retention,
                "attention_stability": self.performance_metrics.attention_stability,
                "decision_quality": self.performance_metrics.decision_quality,
                "creativity_index": self.performance_metrics.creativity_index,
                "adaptation_speed": self.performance_metrics.adaptation_speed
            },
            "optimization_summary": {
                "active_strategies": len(self.active_strategies),
                "strategy_capacity": self.max_concurrent_strategies,
                "current_cognitive_load": self.cognitive_load,
                "optimization_potential": max(0.0, 0.9 - avg_effectiveness) if recent_assessments else 0.3
            }
        }
        
        return report
    
    async def shutdown(self):
        """Gracefully shutdown the meta-cognition engine."""
        
        self.logger.info("🛑 Meta-Cognition Engine shutting down...")
        
        # Generate final report
        final_report = await self.generate_metacognitive_report()
        self.logger.info(f"📊 Final meta-cognitive report: {final_report['meta_cognitive_statistics']['total_assessments']} assessments, {final_report['optimization_summary']['active_strategies']} active strategies")
        
        # Clear active strategies
        self.active_strategies.clear()
        
        self.is_initialized = False
        self.logger.info("🛑 Meta-Cognition Engine shutdown complete")
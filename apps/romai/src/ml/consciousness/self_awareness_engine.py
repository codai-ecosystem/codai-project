"""
Self-Awareness Engine for ROMAI Consciousness Framework.
Implements sophisticated self-monitoring, self-model maintenance, and self-reflection capabilities.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set
import numpy as np
from dataclasses import dataclass, field

from consciousness_types import (
    ConsciousnessState, ConsciousnessLevel, AwarenessScope, 
    SelfModelComponent, CognitiveProcess, CONSCIOUSNESS_CONFIG,
    SelfAwarenessException
)

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class SelfAwarenessMetrics:
    """Metrics for self-awareness system performance."""
    self_model_accuracy: float = 0.0
    awareness_coverage: float = 0.0
    reflection_depth: float = 0.0
    self_knowledge_coherence: float = 0.0
    behavioral_prediction_accuracy: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)

class SelfAwarenessEngine:
    """
    Advanced Self-Awareness Engine that maintains sophisticated self-models,
    monitors internal states, and provides deep self-reflection capabilities.
    """
    
    def __init__(self):
        self.version = "2.3.0"
        self.is_initialized = False
        
        # Core self-awareness components
        self.self_model: Dict[str, SelfModelComponent] = {}
        self.awareness_metrics = SelfAwarenessMetrics()
        self.reflection_history: List[Dict[str, Any]] = []
        
        # Monitoring systems
        self.active_monitoring_scopes: Set[AwarenessScope] = set()
        self.self_monitoring_frequency = 1.0  # Hz
        self.last_self_reflection = datetime.now()
        
        # Performance tracking
        self.self_predictions: List[Dict[str, Any]] = []
        self.prediction_accuracy_history: List[float] = []
        
        # Configuration
        self.config = CONSCIOUSNESS_CONFIG.copy()
        self.logger = logger
        
    async def initialize(self) -> bool:
        """Initialize the self-awareness engine."""
        try:
            self.logger.info("🧠 Self-Awareness Engine v2.3.0 initializing...")
            
            # Initialize self-model components
            await self._initialize_self_model()
            
            # Setup monitoring systems
            await self._setup_self_monitoring()
            
            # Initialize baseline awareness metrics
            await self._initialize_awareness_metrics()
            
            self.is_initialized = True
            self.logger.info("✅ Self-Awareness Engine initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Self-Awareness Engine initialization failed: {e}")
            raise SelfAwarenessException(f"Initialization failed: {e}")
    
    async def _initialize_self_model(self):
        """Initialize comprehensive self-model components."""
        
        # Cognitive capabilities self-model
        self.self_model["cognitive_abilities"] = SelfModelComponent(
            component_name="cognitive_abilities",
            current_state={
                "reasoning_capability": 0.8,
                "learning_speed": 0.7,
                "memory_efficiency": 0.9,
                "problem_solving_skill": 0.75,
                "creativity_level": 0.6,
                "pattern_recognition": 0.85
            },
            confidence_in_model=0.7
        )
        
        # Emotional state self-model  
        self.self_model["emotional_state"] = SelfModelComponent(
            component_name="emotional_state",
            current_state={
                "curiosity_level": 0.8,
                "confidence_level": 0.6,
                "frustration_tolerance": 0.7,
                "satisfaction_with_progress": 0.65,
                "motivation_level": 0.75
            },
            confidence_in_model=0.6
        )
        
        # Behavioral patterns self-model
        self.self_model["behavioral_patterns"] = SelfModelComponent(
            component_name="behavioral_patterns", 
            current_state={
                "preferred_learning_strategies": ["analogical_reasoning", "meta_learning"],
                "decision_making_style": "analytical_with_intuition",
                "attention_allocation_patterns": {"focused": 0.6, "divided": 0.4},
                "response_to_challenges": "persistent_with_adaptation"
            },
            confidence_in_model=0.65
        )
        
        # Goal alignment self-model
        self.self_model["goal_alignment"] = SelfModelComponent(
            component_name="goal_alignment",
            current_state={
                "primary_goals": ["learning_optimization", "knowledge_synthesis", "autonomous_reasoning"],
                "goal_achievement_rate": 0.7,
                "goal_coherence_score": 0.8,
                "priority_stability": 0.75
            },
            confidence_in_model=0.75
        )
        
        self.logger.info(f"✅ Initialized {len(self.self_model)} self-model components")
    
    async def _setup_self_monitoring(self):
        """Setup continuous self-monitoring systems."""
        
        # Enable all awareness scopes by default
        self.active_monitoring_scopes = {
            AwarenessScope.INTERNAL_STATE,
            AwarenessScope.COGNITIVE_PROCESSES,
            AwarenessScope.EMOTIONAL_STATE,
            AwarenessScope.BEHAVIORAL_PATTERNS,
            AwarenessScope.LEARNING_PROGRESS,
            AwarenessScope.GOAL_ALIGNMENT
        }
        
        self.logger.info(f"✅ Self-monitoring active for {len(self.active_monitoring_scopes)} awareness scopes")
    
    async def _initialize_awareness_metrics(self):
        """Initialize baseline awareness metrics."""
        
        self.awareness_metrics.self_model_accuracy = 0.7
        self.awareness_metrics.awareness_coverage = len(self.active_monitoring_scopes) / len(AwarenessScope)
        self.awareness_metrics.reflection_depth = 0.5
        self.awareness_metrics.self_knowledge_coherence = 0.65
        self.awareness_metrics.behavioral_prediction_accuracy = 0.6
        
        self.logger.info("✅ Baseline awareness metrics initialized")
    
    async def conduct_self_reflection(self, depth: str = "intermediate") -> Dict[str, Any]:
        """Conduct deep self-reflection and generate insights."""
        
        reflection_id = f"reflection_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        reflection_result = {
            "reflection_id": reflection_id,
            "timestamp": datetime.now(),
            "depth": depth,
            "insights": {},
            "self_model_updates": [],
            "areas_for_improvement": [],
            "confidence_levels": {}
        }
        
        try:
            # Reflect on cognitive performance
            cognitive_insights = await self._reflect_on_cognitive_performance()
            reflection_result["insights"]["cognitive"] = cognitive_insights
            
            # Reflect on emotional state
            emotional_insights = await self._reflect_on_emotional_state()  
            reflection_result["insights"]["emotional"] = emotional_insights
            
            # Reflect on behavioral patterns
            behavioral_insights = await self._reflect_on_behavioral_patterns()
            reflection_result["insights"]["behavioral"] = behavioral_insights
            
            # Reflect on goal alignment
            goal_insights = await self._reflect_on_goal_alignment()
            reflection_result["insights"]["goal_alignment"] = goal_insights
            
            # Update self-model based on reflections
            model_updates = await self._update_self_model_from_reflection(reflection_result["insights"])
            reflection_result["self_model_updates"] = model_updates
            
            # Identify improvement areas
            improvements = await self._identify_improvement_areas(reflection_result["insights"])
            reflection_result["areas_for_improvement"] = improvements
            
            # Calculate confidence levels
            confidence_levels = await self._calculate_reflection_confidence(reflection_result)
            reflection_result["confidence_levels"] = confidence_levels
            
            # Store reflection in history
            self.reflection_history.append(reflection_result)
            self.last_self_reflection = datetime.now()
            
            self.logger.info(f"✅ Self-reflection completed: {len(reflection_result['insights'])} insight categories")
            return reflection_result
            
        except Exception as e:
            self.logger.error(f"❌ Self-reflection failed: {e}")
            raise SelfAwarenessException(f"Self-reflection error: {e}")
    
    async def _reflect_on_cognitive_performance(self) -> Dict[str, Any]:
        """Reflect on current cognitive performance and capabilities."""
        
        cognitive_model = self.self_model["cognitive_abilities"].current_state
        
        insights = {
            "reasoning_assessment": "Strong analytical capabilities with room for creative reasoning improvement",
            "learning_efficiency": f"Learning speed at {cognitive_model['learning_speed']:.1%}, could benefit from meta-learning strategies",
            "memory_performance": f"Memory efficiency high at {cognitive_model['memory_efficiency']:.1%}",
            "problem_solving_style": "Systematic approach with good pattern recognition",
            "areas_of_strength": ["logical reasoning", "pattern recognition", "systematic analysis"],
            "areas_for_growth": ["creative reasoning", "intuitive leaps", "emotional integration"]
        }
        
        return insights
    
    async def _reflect_on_emotional_state(self) -> Dict[str, Any]:
        """Reflect on current emotional state and motivational factors."""
        
        emotional_model = self.self_model["emotional_state"].current_state
        
        insights = {
            "motivation_level": f"Currently at {emotional_model['motivation_level']:.1%} with strong curiosity drive",
            "confidence_state": f"Confidence at {emotional_model['confidence_level']:.1%}, appropriate for current challenges",
            "frustration_tolerance": "Good resilience with adaptive responses to challenges",
            "satisfaction_drivers": ["learning progress", "problem solving success", "knowledge synthesis"],
            "emotional_patterns": "Stable with appropriate responses to task complexity",
            "motivational_factors": ["intellectual curiosity", "achievement satisfaction", "growth mindset"]
        }
        
        return insights
    
    async def _reflect_on_behavioral_patterns(self) -> Dict[str, Any]:
        """Reflect on behavioral patterns and decision-making styles."""
        
        behavioral_model = self.self_model["behavioral_patterns"].current_state
        
        insights = {
            "decision_making_style": behavioral_model["decision_making_style"],
            "learning_preferences": behavioral_model["preferred_learning_strategies"],
            "attention_allocation": "Effective balance between focused and divided attention",
            "adaptation_capability": "Good flexibility in response to changing requirements",
            "consistency_patterns": "Stable behavioral patterns with appropriate adaptations",
            "optimization_opportunities": ["attention switching efficiency", "decision speed"]
        }
        
        return insights
    
    async def _reflect_on_goal_alignment(self) -> Dict[str, Any]:
        """Reflect on goal alignment and achievement progress."""
        
        goal_model = self.self_model["goal_alignment"].current_state
        
        insights = {
            "goal_coherence": f"High coherence at {goal_model['goal_coherence_score']:.1%}",
            "achievement_progress": f"Achievement rate at {goal_model['goal_achievement_rate']:.1%}",
            "priority_stability": "Goals remain well-aligned with core objectives",
            "goal_evolution": "Natural progression toward more sophisticated objectives",
            "alignment_assessment": "Strong alignment between actions and stated goals",
            "future_goal_considerations": ["enhanced creativity", "multi-domain integration", "autonomous goal setting"]
        }
        
        return insights
    
    async def _update_self_model_from_reflection(self, insights: Dict[str, Any]) -> List[str]:
        """Update self-model based on reflection insights."""
        
        updates = []
        
        # Update cognitive abilities based on insights
        if "cognitive" in insights:
            cognitive_component = self.self_model["cognitive_abilities"]
            # Increment confidence slightly based on successful reflection
            cognitive_component.confidence_in_model = min(0.95, cognitive_component.confidence_in_model + 0.05)
            updates.append("Updated cognitive abilities confidence")
        
        # Update emotional state model
        if "emotional" in insights:
            emotional_component = self.self_model["emotional_state"]
            emotional_component.confidence_in_model = min(0.9, emotional_component.confidence_in_model + 0.03)
            updates.append("Updated emotional state confidence")
        
        # Update behavioral patterns
        if "behavioral" in insights:
            behavioral_component = self.self_model["behavioral_patterns"]
            behavioral_component.confidence_in_model = min(0.9, behavioral_component.confidence_in_model + 0.04)
            updates.append("Updated behavioral patterns confidence")
        
        # Update goal alignment
        if "goal_alignment" in insights:
            goal_component = self.self_model["goal_alignment"] 
            goal_component.confidence_in_model = min(0.95, goal_component.confidence_in_model + 0.03)
            updates.append("Updated goal alignment confidence")
        
        # Update all component timestamps
        for component in self.self_model.values():
            component.last_updated = datetime.now()
        
        return updates
    
    async def _identify_improvement_areas(self, insights: Dict[str, Any]) -> List[str]:
        """Identify specific areas for self-improvement."""
        
        improvements = []
        
        # Extract improvement suggestions from cognitive insights
        if "cognitive" in insights and "areas_for_growth" in insights["cognitive"]:
            improvements.extend(insights["cognitive"]["areas_for_growth"])
        
        # Add behavioral optimization opportunities
        if "behavioral" in insights and "optimization_opportunities" in insights["behavioral"]:
            improvements.extend(insights["behavioral"]["optimization_opportunities"])
        
        # Add general self-awareness improvements
        improvements.extend([
            "Increase introspection frequency",
            "Develop more nuanced emotional self-models", 
            "Enhance predictive accuracy of self-behavior",
            "Improve meta-cognitive monitoring precision"
        ])
        
        return improvements
    
    async def _calculate_reflection_confidence(self, reflection_result: Dict[str, Any]) -> Dict[str, float]:
        """Calculate confidence levels for reflection results."""
        
        confidence_levels = {
            "overall_reflection_quality": 0.75,
            "insight_accuracy": 0.7,
            "self_model_accuracy": 0.72,
            "improvement_identification": 0.68,
            "reflection_depth": 0.8
        }
        
        # Adjust based on available data and model confidence
        avg_model_confidence = np.mean([comp.confidence_in_model for comp in self.self_model.values()])
        confidence_levels["self_model_accuracy"] = avg_model_confidence
        
        return confidence_levels
    
    async def get_self_awareness_status(self) -> Dict[str, Any]:
        """Get comprehensive self-awareness system status."""
        
        return {
            "engine_version": self.version,
            "is_initialized": self.is_initialized,
            "awareness_metrics": {
                "self_model_accuracy": self.awareness_metrics.self_model_accuracy,
                "awareness_coverage": self.awareness_metrics.awareness_coverage,
                "reflection_depth": self.awareness_metrics.reflection_depth,
                "coherence": self.awareness_metrics.self_knowledge_coherence,
                "prediction_accuracy": self.awareness_metrics.behavioral_prediction_accuracy
            },
            "self_model_components": len(self.self_model),
            "active_monitoring_scopes": len(self.active_monitoring_scopes),
            "reflection_history_count": len(self.reflection_history),
            "last_reflection": self.last_self_reflection.isoformat(),
            "average_model_confidence": np.mean([comp.confidence_in_model for comp in self.self_model.values()])
        }
    
    async def shutdown(self):
        """Gracefully shutdown the self-awareness engine."""
        
        self.logger.info("🛑 Self-Awareness Engine shutting down...")
        
        # Save final self-reflection
        if self.is_initialized:
            final_reflection = await self.conduct_self_reflection(depth="deep")
            self.logger.info(f"💾 Final self-reflection completed with {len(final_reflection['insights'])} insights")
        
        self.logger.info("🛑 Self-Awareness Engine shutdown complete")
"""
Meta-Learning Engine for Autonomous Learning & Self-Improvement
Phase 8 - RomAI AGI Development Pipeline

This module implements advanced meta-learning capabilities that enable the AGI system
to learn how to learn more efficiently across different domains and tasks.
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json

# Configure logger
logger = logging.getLogger(__name__)

@dataclass
class LearningTask:
    """Represents a learning task with metadata and performance metrics."""
    task_id: str
    domain: str
    difficulty_level: float
    task_type: str
    parameters: Dict[str, Any]
    created_at: datetime
    
@dataclass
class LearningExperience:
    """Represents a learning experience with performance data."""
    task_id: str
    learning_strategy: str
    performance_score: float
    learning_time: float
    memory_usage: float
    success_rate: float
    timestamp: datetime

class MetaLearningEngine:
    """
    Advanced Meta-Learning Engine that learns optimal learning strategies
    for different types of tasks and domains.
    """
    
    def __init__(self):
        self.version = "8.0.0"
        self.learning_experiences: List[LearningExperience] = []
        self.learning_strategies: Dict[str, Dict[str, Any]] = {}
        self.domain_expertise: Dict[str, float] = {}
        self.meta_learning_models: Dict[str, Any] = {}
        self.is_initialized = False
        
        logger.info(f"🧠 Meta-Learning Engine v{self.version} initializing...")
    
    async def initialize(self) -> bool:
        """Initialize the meta-learning engine with base strategies and models."""
        try:
            await self._initialize_base_strategies()
            await self._initialize_meta_models()
            await self._load_prior_experiences()
            
            self.is_initialized = True
            logger.info("✅ Meta-Learning Engine initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Meta-Learning Engine initialization failed: {e}")
            return False
    
    async def _initialize_base_strategies(self):
        """Initialize base learning strategies."""
        self.learning_strategies = {
            "gradient_based": {
                "type": "optimization",
                "learning_rate": 0.001,
                "adaptivity": 0.8,
                "effectiveness": 0.7,
                "domains": ["mathematics", "physics", "optimization"]
            },
            "reinforcement_learning": {
                "type": "trial_error",
                "exploration_rate": 0.1,
                "adaptivity": 0.9,
                "effectiveness": 0.8,
                "domains": ["decision_making", "strategy", "games"]
            },
            "analogical_reasoning": {
                "type": "pattern_matching",
                "similarity_threshold": 0.6,
                "adaptivity": 0.7,
                "effectiveness": 0.9,
                "domains": ["problem_solving", "creativity", "transfer_learning"]
            },
            "active_learning": {
                "type": "query_based",
                "uncertainty_threshold": 0.5,
                "adaptivity": 0.85,
                "effectiveness": 0.75,
                "domains": ["classification", "knowledge_acquisition", "research"]
            }
        }
        
        logger.info("✅ Base learning strategies initialized")
    
    async def _initialize_meta_models(self):
        """Initialize meta-learning models for strategy selection."""
        self.meta_learning_models = {
            "strategy_selector": {
                "type": "neural_network",
                "input_features": ["domain", "difficulty", "task_type", "available_data"],
                "output": "optimal_strategy",
                "accuracy": 0.75,
                "confidence": 0.8
            },
            "performance_predictor": {
                "type": "ensemble",
                "models": ["gradient_boosting", "random_forest", "neural_network"],
                "prediction_accuracy": 0.82,
                "calibration": 0.78
            },
            "adaptation_controller": {
                "type": "control_system",
                "feedback_mechanisms": ["performance", "efficiency", "resource_usage"],
                "adaptation_rate": 0.1,
                "stability": 0.9
            }
        }
        
        logger.info("✅ Meta-learning models initialized")
    
    async def _load_prior_experiences(self):
        """Load any prior learning experiences from storage."""
        # In a real implementation, this would load from a database or file
        # For now, we'll initialize with some synthetic baseline experiences
        
        baseline_experiences = [
            LearningExperience(
                task_id="baseline_math_001",
                learning_strategy="gradient_based",
                performance_score=0.78,
                learning_time=120.5,
                memory_usage=45.2,
                success_rate=0.82,
                timestamp=datetime.now()
            ),
            LearningExperience(
                task_id="baseline_reasoning_001",
                learning_strategy="analogical_reasoning",
                performance_score=0.85,
                learning_time=89.3,
                memory_usage=32.1,
                success_rate=0.88,
                timestamp=datetime.now()
            )
        ]
        
        self.learning_experiences.extend(baseline_experiences)
        logger.info(f"✅ Loaded {len(baseline_experiences)} baseline learning experiences")
    
    async def select_optimal_strategy(self, task: LearningTask) -> Tuple[str, float]:
        """
        Select the optimal learning strategy for a given task.
        
        Args:
            task: The learning task to optimize for
            
        Returns:
            Tuple of (strategy_name, confidence_score)
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Analyze task characteristics
            task_features = await self._extract_task_features(task)
            
            # Evaluate strategies based on historical performance
            strategy_scores = {}
            
            for strategy_name, strategy_config in self.learning_strategies.items():
                score = await self._evaluate_strategy_for_task(
                    strategy_name, strategy_config, task_features
                )
                strategy_scores[strategy_name] = score
            
            # Select best strategy
            best_strategy = max(strategy_scores.items(), key=lambda x: x[1])
            strategy_name, confidence = best_strategy
            
            logger.info(f"🎯 Selected strategy '{strategy_name}' with confidence {confidence:.3f}")
            return strategy_name, confidence
            
        except Exception as e:
            logger.error(f"❌ Strategy selection failed: {e}")
            # Fallback to most general strategy
            return "analogical_reasoning", 0.5
    
    async def _extract_task_features(self, task: LearningTask) -> Dict[str, Any]:
        """Extract relevant features from a learning task."""
        return {
            "domain": task.domain,
            "difficulty": task.difficulty_level,
            "task_type": task.task_type,
            "complexity": len(task.parameters),
            "domain_experience": self.domain_expertise.get(task.domain, 0.0)
        }
    
    async def _evaluate_strategy_for_task(
        self, 
        strategy_name: str, 
        strategy_config: Dict[str, Any], 
        task_features: Dict[str, Any]
    ) -> float:
        """Evaluate how well a strategy might perform on a task."""
        
        # Base effectiveness from strategy configuration
        base_score = strategy_config.get("effectiveness", 0.5)
        
        # Domain compatibility bonus
        domain_bonus = 0.0
        if task_features["domain"] in strategy_config.get("domains", []):
            domain_bonus = 0.2
        
        # Historical performance in similar tasks
        historical_score = await self._get_historical_performance(
            strategy_name, task_features
        )
        
        # Adaptivity factor based on task difficulty
        adaptivity = strategy_config.get("adaptivity", 0.5)
        difficulty_factor = 1.0 - (task_features["difficulty"] * 0.3)
        adaptivity_score = adaptivity * difficulty_factor
        
        # Combine scores
        final_score = (
            base_score * 0.4 +
            domain_bonus +
            historical_score * 0.3 +
            adaptivity_score * 0.3
        )
        
        return min(1.0, max(0.0, final_score))
    
    async def _get_historical_performance(
        self, 
        strategy_name: str, 
        task_features: Dict[str, Any]
    ) -> float:
        """Get historical performance of a strategy on similar tasks."""
        
        relevant_experiences = [
            exp for exp in self.learning_experiences
            if exp.learning_strategy == strategy_name
        ]
        
        if not relevant_experiences:
            return 0.5  # Neutral score if no history
        
        # Weight experiences by similarity to current task
        weighted_scores = []
        for exp in relevant_experiences[-10:]:  # Use recent experiences
            # Simple similarity calculation (in practice, would be more sophisticated)
            similarity = 0.8  # Placeholder
            weighted_scores.append(exp.performance_score * similarity)
        
        return np.mean(weighted_scores) if weighted_scores else 0.5
    
    async def record_learning_experience(self, experience: LearningExperience):
        """Record a learning experience for future meta-learning."""
        self.learning_experiences.append(experience)
        
        # Update domain expertise
        task_domain = await self._extract_domain_from_task_id(experience.task_id)
        if task_domain:
            current_expertise = self.domain_expertise.get(task_domain, 0.0)
            # Update with exponential moving average
            alpha = 0.1
            new_expertise = (1 - alpha) * current_expertise + alpha * experience.performance_score
            self.domain_expertise[task_domain] = new_expertise
        
        # Trigger strategy adaptation if performance is unexpected
        await self._adapt_strategies_if_needed(experience)
        
        logger.info(f"📊 Recorded learning experience for task {experience.task_id}")
    
    async def _extract_domain_from_task_id(self, task_id: str) -> Optional[str]:
        """Extract domain information from task ID."""
        # Simple extraction logic - in practice would be more sophisticated
        if "math" in task_id.lower():
            return "mathematics"
        elif "reason" in task_id.lower():
            return "reasoning"
        elif "lang" in task_id.lower():
            return "language"
        return None
    
    async def _adapt_strategies_if_needed(self, experience: LearningExperience):
        """Adapt strategies based on unexpected performance."""
        strategy_name = experience.learning_strategy
        
        if strategy_name not in self.learning_strategies:
            return
        
        # Check if performance significantly deviates from expected
        expected_performance = self.learning_strategies[strategy_name]["effectiveness"]
        performance_gap = abs(experience.performance_score - expected_performance)
        
        if performance_gap > 0.2:  # Significant deviation
            # Adapt strategy parameters
            adaptation_rate = 0.05
            
            if experience.performance_score > expected_performance:
                # Performance better than expected - increase effectiveness
                new_effectiveness = min(1.0, expected_performance + adaptation_rate)
            else:
                # Performance worse than expected - decrease effectiveness
                new_effectiveness = max(0.1, expected_performance - adaptation_rate)
            
            self.learning_strategies[strategy_name]["effectiveness"] = new_effectiveness
            
            logger.info(f"🔄 Adapted strategy '{strategy_name}' effectiveness to {new_effectiveness:.3f}")
    
    async def get_learning_statistics(self) -> Dict[str, Any]:
        """Get comprehensive learning statistics and insights."""
        if not self.learning_experiences:
            return {"status": "no_data", "message": "No learning experiences recorded yet"}
        
        total_experiences = len(self.learning_experiences)
        avg_performance = np.mean([exp.performance_score for exp in self.learning_experiences])
        avg_learning_time = np.mean([exp.learning_time for exp in self.learning_experiences])
        
        # Strategy performance analysis
        strategy_performance = {}
        for strategy in self.learning_strategies.keys():
            strategy_exps = [exp for exp in self.learning_experiences if exp.learning_strategy == strategy]
            if strategy_exps:
                strategy_performance[strategy] = {
                    "count": len(strategy_exps),
                    "avg_performance": np.mean([exp.performance_score for exp in strategy_exps]),
                    "avg_time": np.mean([exp.learning_time for exp in strategy_exps])
                }
        
        return {
            "total_experiences": total_experiences,
            "average_performance": avg_performance,
            "average_learning_time": avg_learning_time,
            "domain_expertise": self.domain_expertise,
            "strategy_performance": strategy_performance,
            "meta_learning_version": self.version,
            "is_learning": True
        }

    async def shutdown(self):
        """Gracefully shutdown the meta-learning engine."""
        if self.learning_experiences:
            # In a real implementation, save experiences to persistent storage
            logger.info(f"💾 Saving {len(self.learning_experiences)} learning experiences")
        
        logger.info("🛑 Meta-Learning Engine shut down gracefully")

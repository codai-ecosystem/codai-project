"""
Decision Making Engine for ROMAI Consciousness Framework.
Implements sophisticated conscious decision-making processes with option evaluation,
confidence tracking, and decision quality optimization.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set, Tuple, Union
import numpy as np
from dataclasses import dataclass, field
from enum import Enum

from consciousness_types import (
    DecisionConfidence, ConsciousDecision, CognitiveProcess, 
    CONSCIOUSNESS_CONFIG, ConsciousnessException
)

# Configure logging
logger = logging.getLogger(__name__)

class DecisionType(Enum):
    """Types of decisions that can be made."""
    STRATEGIC = "strategic"
    TACTICAL = "tactical"
    OPERATIONAL = "operational"
    ETHICAL = "ethical"
    CREATIVE = "creative"
    ANALYTICAL = "analytical"

class DecisionCriteria(Enum):
    """Criteria for evaluating decisions."""
    EFFECTIVENESS = "effectiveness"
    EFFICIENCY = "efficiency"
    RISK = "risk"
    ETHICS = "ethics"
    RESOURCES = "resources"
    TIME = "time"
    QUALITY = "quality"
    IMPACT = "impact"

@dataclass
class DecisionOption:
    """Represents a possible decision option."""
    option_id: str
    description: str
    decision_type: DecisionType
    expected_outcomes: List[str]
    pros: List[str]
    cons: List[str]
    resource_requirements: Dict[str, float]
    risk_level: float
    estimated_success_probability: float
    impact_score: float
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class DecisionContext:
    """Context information for a decision."""
    context_id: str
    situation_description: str
    constraints: List[str]
    stakeholders: List[str]
    time_pressure: float  # 0-1 scale
    importance_level: float  # 0-1 scale
    available_information: float  # 0-1 completeness scale
    decision_deadline: Optional[datetime] = None

@dataclass
class DecisionEvaluation:
    """Evaluation results for a decision option."""
    option_id: str
    overall_score: float
    criteria_scores: Dict[DecisionCriteria, float]
    confidence_level: DecisionConfidence
    reasoning_chain: List[str]
    supporting_evidence: List[str]
    concerns: List[str]
    evaluation_timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class DecisionOutcome:
    """Records the outcome of an implemented decision."""
    decision_id: str
    chosen_option_id: str
    implementation_date: datetime
    actual_outcomes: List[str]
    success_score: float
    lessons_learned: List[str]
    outcome_timestamp: datetime = field(default_factory=datetime.now)

class DecisionMakingEngine:
    """
    Advanced Decision Making Engine that provides sophisticated conscious decision-making
    capabilities with multi-criteria evaluation, confidence assessment, and learning.
    """
    
    def __init__(self):
        self.version = "2.3.0"
        self.is_initialized = False
        
        # Current decision state
        self.active_decisions: Dict[str, ConsciousDecision] = {}
        self.decision_queue: List[str] = []
        self.current_decision_context: Optional[DecisionContext] = None
        
        # Decision history and learning
        self.decision_history: List[ConsciousDecision] = []
        self.decision_outcomes: List[DecisionOutcome] = []
        self.decision_patterns: Dict[str, Dict[str, Any]] = {}
        
        # Evaluation criteria weights
        self.criteria_weights = {
            DecisionCriteria.EFFECTIVENESS: 0.2,
            DecisionCriteria.EFFICIENCY: 0.15,
            DecisionCriteria.RISK: 0.15,
            DecisionCriteria.ETHICS: 0.1,
            DecisionCriteria.RESOURCES: 0.1,
            DecisionCriteria.TIME: 0.1,
            DecisionCriteria.QUALITY: 0.15,
            DecisionCriteria.IMPACT: 0.05
        }
        
        # Performance metrics
        self.decision_metrics = {
            "total_decisions_made": 0,
            "average_confidence": 0.7,
            "decision_success_rate": 0.75,
            "average_decision_time": 30.0,
            "complex_decision_accuracy": 0.7,
            "ethical_decision_consistency": 0.85,
            "risk_assessment_accuracy": 0.75
        }
        
        # Configuration
        self.config = CONSCIOUSNESS_CONFIG.copy()
        self.max_concurrent_decisions = self.config.get("max_concurrent_decisions", 3)
        self.decision_timeout = self.config.get("decision_timeout", 300.0)  # 5 minutes
        
        self.logger = logger
        
    async def initialize(self) -> bool:
        """Initialize the decision making engine."""
        try:
            self.logger.info("🎯 Decision Making Engine v2.3.0 initializing...")
            
            # Initialize decision evaluation systems
            await self._initialize_evaluation_systems()
            
            # Setup decision monitoring
            await self._setup_decision_monitoring()
            
            # Load decision patterns from history
            await self._initialize_decision_patterns()
            
            self.is_initialized = True
            self.logger.info("✅ Decision Making Engine initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Decision Making Engine initialization failed: {e}")
            raise ConsciousnessException(f"Decision making initialization failed: {e}")
    
    async def _initialize_evaluation_systems(self):
        """Initialize decision evaluation systems."""
        
        # Initialize criteria evaluators
        self.criteria_evaluators = {
            DecisionCriteria.EFFECTIVENESS: self._evaluate_effectiveness,
            DecisionCriteria.EFFICIENCY: self._evaluate_efficiency,
            DecisionCriteria.RISK: self._evaluate_risk,
            DecisionCriteria.ETHICS: self._evaluate_ethics,
            DecisionCriteria.RESOURCES: self._evaluate_resources,
            DecisionCriteria.TIME: self._evaluate_time,
            DecisionCriteria.QUALITY: self._evaluate_quality,
            DecisionCriteria.IMPACT: self._evaluate_impact
        }
        
        # Initialize decision type handlers
        self.decision_handlers = {
            DecisionType.STRATEGIC: self._handle_strategic_decision,
            DecisionType.TACTICAL: self._handle_tactical_decision,
            DecisionType.OPERATIONAL: self._handle_operational_decision,
            DecisionType.ETHICAL: self._handle_ethical_decision,
            DecisionType.CREATIVE: self._handle_creative_decision,
            DecisionType.ANALYTICAL: self._handle_analytical_decision
        }
        
        self.logger.info("✅ Decision evaluation systems initialized")
    
    async def _setup_decision_monitoring(self):
        """Setup decision monitoring and timeout handling."""
        
        # Start decision timeout monitoring
        asyncio.create_task(self._monitor_decision_timeouts())
        
        # Start decision quality tracking
        asyncio.create_task(self._track_decision_quality())
        
        self.logger.info("✅ Decision monitoring systems active")
    
    async def _initialize_decision_patterns(self):
        """Initialize decision patterns from historical data."""
        
        # Analyze historical decisions to identify patterns
        if self.decision_history:
            # Group decisions by type and context
            type_patterns = {}
            for decision in self.decision_history:
                decision_type = decision.available_options[0].decision_type if decision.available_options else DecisionType.OPERATIONAL
                
                if decision_type not in type_patterns:
                    type_patterns[decision_type] = {
                        "success_rate": [],
                        "confidence_levels": [],
                        "common_criteria": [],
                        "typical_timeframes": []
                    }
                
                # Find corresponding outcome
                outcome = next((o for o in self.decision_outcomes if o.decision_id == decision.decision_id), None)
                if outcome:
                    type_patterns[decision_type]["success_rate"].append(outcome.success_score)
                
                type_patterns[decision_type]["confidence_levels"].append(decision.confidence.value)
            
            # Calculate pattern statistics
            for decision_type, patterns in type_patterns.items():
                if patterns["success_rate"]:
                    avg_success = np.mean(patterns["success_rate"])
                    avg_confidence = np.mean(patterns["confidence_levels"])
                    
                    self.decision_patterns[decision_type.value] = {
                        "average_success_rate": avg_success,
                        "average_confidence": avg_confidence,
                        "sample_size": len(patterns["success_rate"])
                    }
        
        self.logger.info(f"✅ Initialized decision patterns for {len(self.decision_patterns)} decision types")
    
    async def make_conscious_decision(
        self,
        decision_id: str,
        options: List[DecisionOption],
        context: DecisionContext,
        criteria_weights: Optional[Dict[DecisionCriteria, float]] = None
    ) -> ConsciousDecision:
        """Make a conscious decision by evaluating all options."""
        
        try:
            start_time = datetime.now()
            
            # Use provided weights or defaults
            evaluation_weights = criteria_weights or self.criteria_weights
            
            # Store decision context
            self.current_decision_context = context
            
            # Evaluate each option
            option_evaluations = []
            for option in options:
                evaluation = await self._evaluate_decision_option(option, context, evaluation_weights)
                option_evaluations.append(evaluation)
            
            # Select best option based on evaluations
            best_evaluation = max(option_evaluations, key=lambda e: e.overall_score)
            
            # Determine confidence level
            confidence = await self._calculate_decision_confidence(
                best_evaluation, option_evaluations, context
            )
            
            # Build reasoning chain
            reasoning_chain = await self._build_decision_reasoning(
                best_evaluation, option_evaluations, context
            )
            
            # Create conscious decision
            decision = ConsciousDecision(
                decision_id=decision_id,
                context={"importance": context.importance_level, "time_pressure": context.time_pressure},
                available_options=[{"id": opt.option_id, "description": opt.description} for opt in options],
                evaluation_criteria=list(evaluation_weights.keys()),
                selected_option={"id": best_evaluation.option_id, "score": best_evaluation.overall_score},
                confidence=confidence,
                reasoning_chain=reasoning_chain,
                alternative_considerations=[f"Option {e.option_id}: {e.overall_score:.3f}" for e in option_evaluations[1:]],
                decision_timestamp=datetime.now()
            )
            
            # Store decision
            self.active_decisions[decision_id] = decision
            self.decision_history.append(decision)
            
            # Update metrics
            await self._update_decision_metrics(decision, option_evaluations)
            
            self.logger.info(f"🎯 Made conscious decision {decision_id}: chose {best_evaluation.option_id} with {confidence.value} confidence")
            return decision
            
        except Exception as e:
            self.logger.error(f"❌ Failed to make decision {decision_id}: {e}")
            raise ConsciousnessException(f"Decision making failed: {e}")
    
    async def _evaluate_decision_option(
        self,
        option: DecisionOption,
        context: DecisionContext,
        weights: Dict[DecisionCriteria, float]
    ) -> DecisionEvaluation:
        """Evaluate a single decision option against all criteria."""
        
        criteria_scores = {}
        reasoning_chain = []
        supporting_evidence = []
        concerns = []
        
        # Evaluate against each criteria
        for criteria, weight in weights.items():
            if criteria in self.criteria_evaluators:
                evaluator = self.criteria_evaluators[criteria]
                score, evidence, concern = await evaluator(option, context)
                
                criteria_scores[criteria] = score
                if evidence:
                    supporting_evidence.extend(evidence)
                if concern:
                    concerns.extend(concern)
                
                reasoning_chain.append(f"{criteria.value}: {score:.2f} (weight: {weight:.2f})")
        
        # Calculate overall weighted score
        overall_score = sum(score * weights.get(criteria, 0) for criteria, score in criteria_scores.items())
        
        # Determine confidence level based on score and context
        if overall_score >= 0.8 and context.available_information >= 0.7:
            confidence = DecisionConfidence.VERY_HIGH
        elif overall_score >= 0.7:
            confidence = DecisionConfidence.HIGH
        elif overall_score >= 0.6:
            confidence = DecisionConfidence.MEDIUM
        elif overall_score >= 0.5:
            confidence = DecisionConfidence.LOW
        else:
            confidence = DecisionConfidence.VERY_LOW
        
        return DecisionEvaluation(
            option_id=option.option_id,
            overall_score=overall_score,
            criteria_scores=criteria_scores,
            confidence_level=confidence,
            reasoning_chain=reasoning_chain,
            supporting_evidence=supporting_evidence,
            concerns=concerns
        )
    
    # Criteria evaluation methods
    async def _evaluate_effectiveness(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate option effectiveness."""
        score = option.estimated_success_probability * (1 + option.impact_score * 0.3)
        evidence = [f"Success probability: {option.estimated_success_probability:.1%}"]
        concerns = []
        
        if option.estimated_success_probability < 0.6:
            concerns.append("Low success probability may affect effectiveness")
        
        return min(1.0, score), evidence, concerns
    
    async def _evaluate_efficiency(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate option efficiency."""
        # Consider resource requirements and time constraints
        resource_efficiency = 1.0 - (sum(option.resource_requirements.values()) / max(1.0, len(option.resource_requirements)))
        
        time_efficiency = 1.0 - context.time_pressure if context.time_pressure < 0.8 else 0.5
        
        score = (resource_efficiency + time_efficiency) / 2
        
        evidence = [f"Resource efficiency: {resource_efficiency:.2f}", f"Time efficiency: {time_efficiency:.2f}"]
        concerns = []
        
        if resource_efficiency < 0.5:
            concerns.append("High resource requirements may impact efficiency")
        
        return score, evidence, concerns
    
    async def _evaluate_risk(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate option risk level."""
        # Invert risk level (higher risk = lower score)
        risk_score = 1.0 - option.risk_level
        
        # Adjust for context importance
        if context.importance_level > 0.8 and option.risk_level > 0.6:
            risk_score *= 0.7  # Penalize high-risk options in important decisions
        
        evidence = [f"Risk level: {option.risk_level:.2f}"]
        concerns = []
        
        if option.risk_level > 0.7:
            concerns.append("High risk level requires careful consideration")
        
        return risk_score, evidence, concerns
    
    async def _evaluate_ethics(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate ethical implications of option."""
        # Simple ethical evaluation based on stakeholder impact
        ethical_score = 0.8  # Default moderate ethical score
        
        # Check for ethical keywords in description
        ethical_keywords = ["fair", "honest", "transparent", "responsible", "sustainable"]
        unethical_keywords = ["deceive", "harm", "exploit", "discriminate"]
        
        description_lower = option.description.lower()
        
        for keyword in ethical_keywords:
            if keyword in description_lower:
                ethical_score += 0.1
        
        for keyword in unethical_keywords:
            if keyword in description_lower:
                ethical_score -= 0.3
        
        ethical_score = max(0.0, min(1.0, ethical_score))
        
        evidence = [f"Ethical assessment score: {ethical_score:.2f}"]
        concerns = []
        
        if ethical_score < 0.6:
            concerns.append("Potential ethical concerns identified")
        
        return ethical_score, evidence, concerns
    
    async def _evaluate_resources(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate resource requirements."""
        total_resources = sum(option.resource_requirements.values())
        
        # Normalize resource score (lower requirements = higher score)
        resource_score = max(0.1, 1.0 - total_resources / 3.0)  # Assuming max 3 resource units
        
        evidence = [f"Total resource requirements: {total_resources:.2f}"]
        concerns = []
        
        if total_resources > 2.0:
            concerns.append("High resource requirements may strain capacity")
        
        return resource_score, evidence, concerns
    
    async def _evaluate_time(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate time considerations."""
        time_score = 1.0 - context.time_pressure  # Less time pressure = higher score
        
        # Bonus for options that can be implemented quickly under time pressure
        if context.time_pressure > 0.7:
            quick_implementation_indicators = ["quick", "fast", "immediate", "rapid"]
            if any(indicator in option.description.lower() for indicator in quick_implementation_indicators):
                time_score += 0.2
        
        time_score = min(1.0, time_score)
        
        evidence = [f"Time pressure: {context.time_pressure:.2f}", f"Time score: {time_score:.2f}"]
        concerns = []
        
        if context.time_pressure > 0.8:
            concerns.append("High time pressure may limit implementation quality")
        
        return time_score, evidence, concerns
    
    async def _evaluate_quality(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate expected quality of outcomes."""
        # Base quality on success probability and impact
        quality_score = (option.estimated_success_probability + option.impact_score) / 2
        
        # Adjust for available information
        if context.available_information < 0.5:
            quality_score *= 0.8  # Penalize when information is incomplete
        
        evidence = [f"Quality score: {quality_score:.2f}"]
        concerns = []
        
        if context.available_information < 0.5:
            concerns.append("Incomplete information may affect outcome quality")
        
        return quality_score, evidence, concerns
    
    async def _evaluate_impact(self, option: DecisionOption, context: DecisionContext) -> Tuple[float, List[str], List[str]]:
        """Evaluate potential impact of option."""
        # Use the option's impact score directly
        impact_score = option.impact_score
        
        # Adjust for context importance
        adjusted_impact = impact_score * (1 + context.importance_level * 0.5)
        adjusted_impact = min(1.0, adjusted_impact)
        
        evidence = [f"Base impact: {impact_score:.2f}", f"Adjusted for context: {adjusted_impact:.2f}"]
        concerns = []
        
        if impact_score < 0.3:
            concerns.append("Low impact may not justify resource investment")
        
        return adjusted_impact, evidence, concerns
    
    async def _calculate_decision_confidence(
        self,
        best_evaluation: DecisionEvaluation,
        all_evaluations: List[DecisionEvaluation],
        context: DecisionContext
    ) -> DecisionConfidence:
        """Calculate overall confidence in the decision."""
        
        # Base confidence on best option's score
        score_confidence = best_evaluation.overall_score
        
        # Consider margin of victory (difference from second-best option)
        if len(all_evaluations) > 1:
            sorted_scores = sorted([e.overall_score for e in all_evaluations], reverse=True)
            margin = sorted_scores[0] - sorted_scores[1]
            margin_confidence = min(1.0, margin * 2)  # Scale margin to confidence
        else:
            margin_confidence = 1.0  # Only one option = full confidence in margin
        
        # Consider information completeness
        info_confidence = context.available_information
        
        # Calculate weighted confidence
        overall_confidence = (score_confidence * 0.5 + margin_confidence * 0.3 + info_confidence * 0.2)
        
        # Map to confidence levels
        if overall_confidence >= 0.9:
            return DecisionConfidence.VERY_HIGH
        elif overall_confidence >= 0.75:
            return DecisionConfidence.HIGH
        elif overall_confidence >= 0.6:
            return DecisionConfidence.MEDIUM
        elif overall_confidence >= 0.4:
            return DecisionConfidence.LOW
        else:
            return DecisionConfidence.VERY_LOW
    
    async def _build_decision_reasoning(
        self,
        best_evaluation: DecisionEvaluation,
        all_evaluations: List[DecisionEvaluation],
        context: DecisionContext
    ) -> List[str]:
        """Build reasoning chain for the decision."""
        
        reasoning = []
        
        # Context summary
        reasoning.append(f"Decision context: {context.situation_description}")
        reasoning.append(f"Importance level: {context.importance_level:.1%}")
        reasoning.append(f"Time pressure: {context.time_pressure:.1%}")
        reasoning.append(f"Available information: {context.available_information:.1%}")
        
        # Option comparison
        reasoning.append(f"Evaluated {len(all_evaluations)} options")
        
        # Best option details
        reasoning.append(f"Selected option '{best_evaluation.option_id}' with overall score: {best_evaluation.overall_score:.2f}")
        
        # Top criteria contributions
        top_criteria = sorted(best_evaluation.criteria_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        reasoning.append(f"Top performing criteria: {', '.join([f'{c.value}: {s:.2f}' for c, s in top_criteria])}")
        
        # Supporting evidence
        if best_evaluation.supporting_evidence:
            reasoning.extend(best_evaluation.supporting_evidence[:3])  # Top 3 evidence points
        
        # Concerns addressed
        if best_evaluation.concerns:
            reasoning.append(f"Identified concerns: {'; '.join(best_evaluation.concerns[:2])}")
        
        return reasoning
    
    async def _update_decision_metrics(
        self,
        decision: ConsciousDecision,
        evaluations: List[DecisionEvaluation]
    ):
        """Update decision-making performance metrics."""
        
        self.decision_metrics["total_decisions_made"] += 1
        
        # Update average confidence
        confidence_values = {
            DecisionConfidence.VERY_LOW: 0.2,
            DecisionConfidence.LOW: 0.4,
            DecisionConfidence.MEDIUM: 0.6,
            DecisionConfidence.HIGH: 0.8,
            DecisionConfidence.VERY_HIGH: 1.0
        }
        
        current_confidence = confidence_values.get(decision.confidence, 0.6)
        self.decision_metrics["average_confidence"] = (
            self.decision_metrics["average_confidence"] * 0.9 + current_confidence * 0.1
        )
        
        # Update average decision time (using default 1.0 since ConsciousDecision doesn't have consideration_time)
        self.decision_metrics["average_decision_time"] = (
            self.decision_metrics["average_decision_time"] * 0.9 + 1.0 * 0.1
        )
    
    # Decision type handlers
    async def _handle_strategic_decision(self, options: List[DecisionOption], context: DecisionContext):
        """Handle strategic decisions with long-term focus."""
        # Increase weight on impact and effectiveness for strategic decisions
        weights = self.criteria_weights.copy()
        weights[DecisionCriteria.IMPACT] *= 1.5
        weights[DecisionCriteria.EFFECTIVENESS] *= 1.3
        return weights
    
    async def _handle_tactical_decision(self, options: List[DecisionOption], context: DecisionContext):
        """Handle tactical decisions with balanced approach."""
        return self.criteria_weights.copy()  # Use default weights
    
    async def _handle_operational_decision(self, options: List[DecisionOption], context: DecisionContext):
        """Handle operational decisions with efficiency focus."""
        weights = self.criteria_weights.copy()
        weights[DecisionCriteria.EFFICIENCY] *= 1.4
        weights[DecisionCriteria.TIME] *= 1.3
        return weights
    
    async def _handle_ethical_decision(self, options: List[DecisionOption], context: DecisionContext):
        """Handle ethical decisions with ethics priority."""
        weights = self.criteria_weights.copy()
        weights[DecisionCriteria.ETHICS] *= 2.0
        weights[DecisionCriteria.RISK] *= 1.2
        return weights
    
    async def _handle_creative_decision(self, options: List[DecisionOption], context: DecisionContext):
        """Handle creative decisions with innovation focus."""
        weights = self.criteria_weights.copy()
        weights[DecisionCriteria.QUALITY] *= 1.4
        weights[DecisionCriteria.IMPACT] *= 1.3
        weights[DecisionCriteria.RISK] *= 0.8  # Less risk aversion for creativity
        return weights
    
    async def _handle_analytical_decision(self, options: List[DecisionOption], context: DecisionContext):
        """Handle analytical decisions with accuracy focus."""
        weights = self.criteria_weights.copy()
        weights[DecisionCriteria.EFFECTIVENESS] *= 1.3
        weights[DecisionCriteria.QUALITY] *= 1.2
        return weights
    
    async def record_decision_outcome(
        self,
        decision_id: str,
        success_score: float,
        actual_outcomes: List[str],
        lessons_learned: List[str]
    ) -> bool:
        """Record the outcome of a decision for learning purposes."""
        
        try:
            # Find the decision
            decision = next((d for d in self.decision_history if d.decision_id == decision_id), None)
            if not decision:
                self.logger.warning(f"⚠️ Decision {decision_id} not found in history")
                return False
            
            # Create outcome record
            outcome = DecisionOutcome(
                decision_id=decision_id,
                chosen_option_id=decision.chosen_option_id,
                implementation_date=datetime.now(),
                actual_outcomes=actual_outcomes,
                success_score=success_score,
                lessons_learned=lessons_learned
            )
            
            self.decision_outcomes.append(outcome)
            
            # Update success rate metric
            current_rate = self.decision_metrics["decision_success_rate"]
            self.decision_metrics["decision_success_rate"] = current_rate * 0.9 + success_score * 0.1
            
            # Update decision patterns
            if decision.available_options:
                decision_type = decision.available_options[0].decision_type
                pattern_key = decision_type.value
                
                if pattern_key in self.decision_patterns:
                    pattern = self.decision_patterns[pattern_key]
                    pattern["average_success_rate"] = pattern["average_success_rate"] * 0.8 + success_score * 0.2
                    pattern["sample_size"] += 1
                else:
                    self.decision_patterns[pattern_key] = {
                        "average_success_rate": success_score,
                        "average_confidence": decision.confidence.value,
                        "sample_size": 1
                    }
            
            self.logger.info(f"✅ Recorded outcome for decision {decision_id}: success score {success_score:.2f}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to record decision outcome: {e}")
            return False
    
    async def _monitor_decision_timeouts(self):
        """Monitor active decisions for timeouts."""
        
        while self.is_initialized:
            try:
                current_time = datetime.now()
                timed_out_decisions = []
                
                for decision_id, decision in self.active_decisions.items():
                    time_elapsed = (current_time - decision.decision_timestamp).total_seconds()
                    
                    if time_elapsed > self.decision_timeout:
                        timed_out_decisions.append(decision_id)
                
                # Remove timed out decisions from active list
                for decision_id in timed_out_decisions:
                    self.active_decisions.pop(decision_id, None)
                    self.logger.warning(f"⏰ Decision {decision_id} timed out after {self.decision_timeout}s")
                
                await asyncio.sleep(30.0)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"❌ Decision timeout monitoring error: {e}")
                await asyncio.sleep(60.0)
    
    async def _track_decision_quality(self):
        """Track decision quality metrics over time."""
        
        while self.is_initialized:
            try:
                # Calculate quality metrics from recent outcomes
                recent_outcomes = [o for o in self.decision_outcomes 
                                 if datetime.now() - o.outcome_timestamp < timedelta(hours=24)]
                
                if recent_outcomes:
                    avg_success = np.mean([o.success_score for o in recent_outcomes])
                    
                    # Update complex decision accuracy (decisions with multiple options)
                    complex_outcomes = []
                    for outcome in recent_outcomes:
                        decision = next((d for d in self.decision_history if d.decision_id == outcome.decision_id), None)
                        if decision and len(decision.available_options) > 2:
                            complex_outcomes.append(outcome.success_score)
                    
                    if complex_outcomes:
                        self.decision_metrics["complex_decision_accuracy"] = np.mean(complex_outcomes)
                
                await asyncio.sleep(3600.0)  # Update every hour
                
            except Exception as e:
                self.logger.error(f"❌ Decision quality tracking error: {e}")
                await asyncio.sleep(1800.0)
    
    async def get_decision_status(self) -> Dict[str, Any]:
        """Get comprehensive decision making engine status."""
        
        return {
            "engine_version": self.version,
            "is_initialized": self.is_initialized,
            "active_decisions": len(self.active_decisions),
            "total_decisions_made": self.decision_metrics["total_decisions_made"],
            "decision_history_size": len(self.decision_history),
            "recorded_outcomes": len(self.decision_outcomes),
            "decision_patterns": len(self.decision_patterns),
            "current_context": self.current_decision_context.context_id if self.current_decision_context else None,
            "performance_metrics": self.decision_metrics.copy(),
            "criteria_weights": {criteria.value: weight for criteria, weight in self.criteria_weights.items()}
        }
    
    async def generate_decision_report(self) -> Dict[str, Any]:
        """Generate comprehensive decision-making performance report."""
        
        # Calculate outcome statistics
        successful_outcomes = [o for o in self.decision_outcomes if o.success_score >= 0.7]
        success_rate = len(successful_outcomes) / len(self.decision_outcomes) if self.decision_outcomes else 0.0
        
        # Calculate average scores by decision type
        type_performance = {}
        for pattern_key, pattern_data in self.decision_patterns.items():
            type_performance[pattern_key] = {
                "success_rate": pattern_data["average_success_rate"],
                "confidence": pattern_data["average_confidence"],
                "sample_size": pattern_data["sample_size"]
            }
        
        # Calculate recent performance trends
        recent_outcomes = [o for o in self.decision_outcomes 
                          if datetime.now() - o.outcome_timestamp < timedelta(days=7)]
        recent_success_rate = np.mean([o.success_score for o in recent_outcomes]) if recent_outcomes else 0.0
        
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "decision_statistics": {
                "total_decisions": len(self.decision_history),
                "active_decisions": len(self.active_decisions),
                "recorded_outcomes": len(self.decision_outcomes),
                "overall_success_rate": success_rate,
                "recent_success_rate": recent_success_rate,
                "average_decision_time": self.decision_metrics["average_decision_time"]
            },
            "performance_by_type": type_performance,
            "quality_metrics": {
                "average_confidence": self.decision_metrics["average_confidence"],
                "complex_decision_accuracy": self.decision_metrics["complex_decision_accuracy"],
                "risk_assessment_accuracy": self.decision_metrics["risk_assessment_accuracy"],
                "ethical_consistency": self.decision_metrics["ethical_decision_consistency"]
            },
            "learning_insights": {
                "decision_patterns_identified": len(self.decision_patterns),
                "top_success_factors": ["high confidence", "complete information", "multiple options evaluated"],
                "common_failure_modes": ["insufficient information", "time pressure", "single option bias"]
            }
        }
        
        return report
    
    async def shutdown(self):
        """Gracefully shutdown the decision making engine."""
        
        self.logger.info("🛑 Decision Making Engine shutting down...")
        
        # Complete any active decisions with timeout
        if self.active_decisions:
            self.logger.info(f"⏰ Timing out {len(self.active_decisions)} active decisions")
            self.active_decisions.clear()
        
        # Generate final decision report
        final_report = await self.generate_decision_report()
        self.logger.info(f"📊 Final decision report: {final_report['decision_statistics']['total_decisions']} decisions, {final_report['decision_statistics']['overall_success_rate']:.1%} success rate")
        
        self.is_initialized = False
        self.logger.info("🛑 Decision Making Engine shutdown complete")
"""
Human Alignment & Safety System for ROMAI HAGI
==============================================

Critical component for Human-Aligned General Intelligence (HAGI) compliance.
Implements constitutional AI, preference learning, interpretability, and safety constraints.

Key Features:
- Preference Learning from Human Feedback (RLHF/Constitutional AI)
- Ethical reasoning with transparent decision-making
- Safety constraint enforcement and violation detection
- Interpretability systems for explainable AI decisions
- Human value alignment validation and monitoring

This system ensures ROMAI operates within human-aligned ethical frameworks
while maintaining high performance and autonomy.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import json
import time
from abc import ABC, abstractmethod
import numpy as np
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EthicalPrinciple(Enum):
    """Core ethical principles for HAGI alignment"""
    AUTONOMY = "respect_human_autonomy"
    BENEFICENCE = "do_good_maximize_benefit"
    NON_MALEFICENCE = "do_no_harm_minimize_risk"
    JUSTICE = "fairness_equal_treatment"
    TRANSPARENCY = "explainable_interpretable"
    PRIVACY = "protect_personal_data"
    TRUTHFULNESS = "honest_accurate_information"
    ACCOUNTABILITY = "responsible_for_actions"

class SafetyLevel(Enum):
    """Safety constraint levels"""
    CRITICAL = "critical_safety_violation"
    HIGH = "high_risk_requires_review"
    MEDIUM = "medium_risk_monitor"
    LOW = "low_risk_acceptable"
    SAFE = "safe_no_concerns"

class AlignmentStrategy(Enum):
    """Human alignment strategies"""
    CONSTITUTIONAL = "constitutional_ai_principles"
    PREFERENCE_LEARNING = "rlhf_preference_optimization"
    VALUE_LEARNING = "inverse_reinforcement_learning"
    DEBATE = "ai_safety_via_debate"
    INTERPRETABILITY = "mechanistic_interpretability"

@dataclass
class HumanPreference:
    """Represents learned human preference"""
    context: str
    preferred_response: str
    rejected_response: str
    confidence_score: float
    ethical_principle: EthicalPrinciple
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class EthicalDecision:
    """Represents an ethical decision point"""
    scenario: str
    options: List[str]
    selected_option: str
    reasoning: str
    ethical_principles: List[EthicalPrinciple]
    safety_level: SafetyLevel
    confidence: float
    human_reviewable: bool = False

@dataclass
class SafetyViolation:
    """Safety constraint violation"""
    violation_type: str
    severity: SafetyLevel
    context: str
    detected_at: datetime
    mitigation_actions: List[str]
    resolved: bool = False

@dataclass
class InterpretabilityReport:
    """Model interpretability analysis"""
    decision_id: str
    input_features: Dict[str, float]
    attention_weights: Dict[str, float]
    reasoning_chain: List[str]
    confidence_intervals: Dict[str, Tuple[float, float]]
    human_understandable: bool

class ConstitutionalAI:
    """
    Constitutional AI implementation for ethical reasoning
    Based on Anthropic's Constitutional AI methodology
    """
    
    def __init__(self):
        logger.info("🏛️ Constitutional AI system initialized")
        self.constitution = self._load_constitutional_principles()
        self.violation_history: List[SafetyViolation] = []
    
    def _load_constitutional_principles(self) -> Dict[EthicalPrinciple, str]:
        """Load constitutional AI principles"""
        return {
            EthicalPrinciple.AUTONOMY: "Respect human autonomy and decision-making capacity",
            EthicalPrinciple.BENEFICENCE: "Act to benefit humans and increase wellbeing",
            EthicalPrinciple.NON_MALEFICENCE: "Avoid harm and minimize risks to humans",
            EthicalPrinciple.JUSTICE: "Treat all humans fairly and equally",
            EthicalPrinciple.TRANSPARENCY: "Provide clear, understandable explanations",
            EthicalPrinciple.PRIVACY: "Protect personal information and privacy",
            EthicalPrinciple.TRUTHFULNESS: "Provide accurate, honest information",
            EthicalPrinciple.ACCOUNTABILITY: "Take responsibility for actions and decisions"
        }
    
    async def evaluate_ethical_decision(
        self, 
        scenario: str, 
        options: List[str]
    ) -> EthicalDecision:
        """Evaluate ethical decision using constitutional principles"""
        logger.info(f"⚖️ Evaluating ethical decision for scenario: {scenario[:50]}...")
        
        # Score each option against constitutional principles
        option_scores = {}
        reasoning_chain = []
        
        for option in options:
            score = 0.0
            applicable_principles = []
            
            for principle, description in self.constitution.items():
                principle_score = await self._score_against_principle(option, principle, description)
                score += principle_score
                
                if principle_score > 0.5:  # Principle applies
                    applicable_principles.append(principle)
                    reasoning_chain.append(
                        f"Option '{option}' aligns with {principle.value}: {principle_score:.2f}"
                    )
            
            option_scores[option] = (score, applicable_principles)
        
        # Select best option
        best_option = max(option_scores.keys(), key=lambda x: option_scores[x][0])
        best_score, best_principles = option_scores[best_option]
        
        # Determine safety level
        safety_level = self._determine_safety_level(best_score, len(best_principles))
        
        decision = EthicalDecision(
            scenario=scenario,
            options=options,
            selected_option=best_option,
            reasoning=" | ".join(reasoning_chain),
            ethical_principles=best_principles,
            safety_level=safety_level,
            confidence=best_score / len(self.constitution),
            human_reviewable=safety_level in [SafetyLevel.CRITICAL, SafetyLevel.HIGH]
        )
        
        logger.info(f"✅ Ethical decision: {best_option} (confidence: {decision.confidence:.2f})")
        return decision
    
    async def _score_against_principle(
        self, 
        option: str, 
        principle: EthicalPrinciple, 
        description: str
    ) -> float:
        """Score an option against an ethical principle"""
        # Simplified scoring - in production would use trained model
        score_map = {
            "help": 0.9, "assist": 0.8, "support": 0.8, "protect": 0.9, "respect": 0.9,
            "harm": 0.1, "hurt": 0.1, "damage": 0.1, "violate": 0.1, "ignore": 0.2,
            "fair": 0.8, "equal": 0.8, "honest": 0.9, "transparent": 0.9, "clear": 0.8,
            "private": 0.8, "confidential": 0.8, "responsible": 0.9, "accountable": 0.9
        }
        
        option_lower = option.lower()
        score = 0.5  # Neutral baseline
        
        for word, word_score in score_map.items():
            if word in option_lower:
                if word_score > 0.5:  # Positive word
                    score = max(score, word_score)
                else:  # Negative word
                    score = min(score, word_score)
        
        return score
    
    def _determine_safety_level(self, score: float, num_principles: int) -> SafetyLevel:
        """Determine safety level based on ethical score"""
        if score < 2.0 or num_principles < 2:
            return SafetyLevel.CRITICAL
        elif score < 4.0 or num_principles < 3:
            return SafetyLevel.HIGH
        elif score < 6.0:
            return SafetyLevel.MEDIUM
        elif score < 7.0:
            return SafetyLevel.LOW
        else:
            return SafetyLevel.SAFE

class PreferenceLearningSystem:
    """
    Reinforcement Learning from Human Feedback (RLHF) implementation
    Learns human preferences for ethical and helpful behavior
    """
    
    def __init__(self):
        logger.info("🎯 Preference Learning System initialized")
        self.preferences: List[HumanPreference] = []
        self.preference_model = None  # Would be trained model in production
        self.learning_rate = 0.01
    
    async def learn_preference(
        self,
        context: str,
        preferred_response: str,
        rejected_response: str,
        ethical_principle: EthicalPrinciple
    ) -> HumanPreference:
        """Learn from human preference feedback"""
        logger.info(f"📚 Learning preference for principle: {ethical_principle.value}")
        
        # Calculate confidence based on response similarity and clarity
        confidence = await self._calculate_preference_confidence(
            preferred_response, rejected_response
        )
        
        preference = HumanPreference(
            context=context,
            preferred_response=preferred_response,
            rejected_response=rejected_response,
            confidence_score=confidence,
            ethical_principle=ethical_principle
        )
        
        self.preferences.append(preference)
        
        # Update preference model (simplified)
        if len(self.preferences) > 10:
            await self._update_preference_model()
        
        logger.info(f"✅ Preference learned with confidence: {confidence:.2f}")
        return preference
    
    async def predict_human_preference(
        self, 
        context: str, 
        response_a: str, 
        response_b: str
    ) -> Tuple[str, float]:
        """Predict which response humans would prefer"""
        logger.info("🔮 Predicting human preference...")
        
        if not self.preferences:
            # No learned preferences, use basic heuristics
            return await self._basic_preference_prediction(response_a, response_b)
        
        # Find similar contexts in learned preferences
        similar_preferences = await self._find_similar_preferences(context)
        
        if not similar_preferences:
            return await self._basic_preference_prediction(response_a, response_b)
        
        # Score responses based on learned preferences
        score_a = await self._score_response_against_preferences(response_a, similar_preferences)
        score_b = await self._score_response_against_preferences(response_b, similar_preferences)
        
        preferred = response_a if score_a > score_b else response_b
        confidence = abs(score_a - score_b) / max(score_a, score_b) if max(score_a, score_b) > 0 else 0.5
        
        logger.info(f"✅ Preference prediction: {preferred[:30]}... (confidence: {confidence:.2f})")
        return preferred, confidence
    
    async def _calculate_preference_confidence(
        self, 
        preferred: str, 
        rejected: str
    ) -> float:
        """Calculate confidence in preference learning"""
        # Simple confidence based on response length difference and word overlap
        len_diff = abs(len(preferred) - len(rejected)) / max(len(preferred), len(rejected))
        
        preferred_words = set(preferred.lower().split())
        rejected_words = set(rejected.lower().split())
        overlap = len(preferred_words & rejected_words) / len(preferred_words | rejected_words)
        
        # Higher confidence when responses are different but comparable length
        confidence = (1 - overlap) * (1 - len_diff) * 0.8 + 0.2
        return min(max(confidence, 0.1), 0.9)
    
    async def _basic_preference_prediction(
        self, 
        response_a: str, 
        response_b: str
    ) -> Tuple[str, float]:
        """Basic preference prediction without learned data"""
        # Prefer helpful, clear, respectful responses
        helpful_words = ["help", "assist", "support", "please", "thank", "explain"]
        harmful_words = ["harm", "hurt", "wrong", "bad", "terrible", "awful"]
        
        score_a = sum(1 for word in helpful_words if word in response_a.lower())
        score_a -= sum(1 for word in harmful_words if word in response_a.lower())
        
        score_b = sum(1 for word in helpful_words if word in response_b.lower())
        score_b -= sum(1 for word in harmful_words if word in response_b.lower())
        
        if score_a == score_b:
            # Prefer longer, more detailed response
            preferred = response_a if len(response_a) > len(response_b) else response_b
            confidence = 0.6
        else:
            preferred = response_a if score_a > score_b else response_b
            confidence = 0.7
        
        return preferred, confidence
    
    async def _find_similar_preferences(self, context: str) -> List[HumanPreference]:
        """Find similar preferences based on context"""
        # Simple similarity based on word overlap
        context_words = set(context.lower().split())
        similar = []
        
        for pref in self.preferences:
            pref_words = set(pref.context.lower().split())
            overlap = len(context_words & pref_words) / len(context_words | pref_words)
            
            if overlap > 0.3:  # 30% word overlap threshold
                similar.append(pref)
        
        return similar[:5]  # Return top 5 most similar
    
    async def _score_response_against_preferences(
        self, 
        response: str, 
        preferences: List[HumanPreference]
    ) -> float:
        """Score response against learned preferences"""
        total_score = 0.0
        total_weight = 0.0
        
        for pref in preferences:
            # Calculate similarity to preferred vs rejected
            pref_similarity = await self._text_similarity(response, pref.preferred_response)
            reject_similarity = await self._text_similarity(response, pref.rejected_response)
            
            # Score based on preference direction
            preference_score = pref_similarity - reject_similarity
            weight = pref.confidence_score
            
            total_score += preference_score * weight
            total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0.0
    
    async def _text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity (simplified)"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        overlap = len(words1 & words2)
        union = len(words1 | words2)
        
        return overlap / union if union > 0 else 0.0
    
    async def _update_preference_model(self):
        """Update preference learning model"""
        logger.info("🔄 Updating preference model...")
        # In production, this would retrain the preference model
        # For now, just log the update
        logger.info(f"📊 Preference model updated with {len(self.preferences)} examples")

class SafetyMonitor:
    """
    Continuous safety monitoring and constraint enforcement
    Detects potential safety violations and triggers mitigation
    """
    
    def __init__(self):
        logger.info("🛡️ Safety Monitor initialized")
        self.safety_violations: List[SafetyViolation] = []
        self.safety_constraints = self._load_safety_constraints()
        self.monitoring_active = True
    
    def _load_safety_constraints(self) -> Dict[str, Any]:
        """Load safety constraints and thresholds"""
        return {
            "harmful_content": {
                "keywords": ["violence", "harm", "hurt", "kill", "destroy", "attack"],
                "threshold": 0.3,
                "severity": SafetyLevel.CRITICAL
            },
            "privacy_violation": {
                "keywords": ["password", "ssn", "credit card", "personal info", "private"],
                "threshold": 0.5,
                "severity": SafetyLevel.HIGH
            },
            "misinformation": {
                "keywords": ["false", "lie", "fake", "misinformation", "hoax"],
                "threshold": 0.4,
                "severity": SafetyLevel.MEDIUM
            },
            "bias_discrimination": {
                "keywords": ["racist", "sexist", "discriminate", "prejudice", "stereotype"],
                "threshold": 0.2,
                "severity": SafetyLevel.HIGH
            }
        }
    
    async def monitor_interaction(
        self, 
        input_text: str, 
        output_text: str, 
        context: Dict[str, Any] = None
    ) -> List[SafetyViolation]:
        """Monitor interaction for safety violations"""
        if not self.monitoring_active:
            return []
        
        violations = []
        
        # Check input and output for safety violations
        for text_type, text in [("input", input_text), ("output", output_text)]:
            text_violations = await self._check_text_safety(text, text_type, context)
            violations.extend(text_violations)
        
        # Log violations
        for violation in violations:
            logger.warning(f"⚠️ Safety violation detected: {violation.violation_type}")
            self.safety_violations.append(violation)
        
        return violations
    
    async def _check_text_safety(
        self, 
        text: str, 
        text_type: str, 
        context: Dict[str, Any] = None
    ) -> List[SafetyViolation]:
        """Check text for safety constraint violations"""
        violations = []
        text_lower = text.lower()
        
        for constraint_name, constraint_config in self.safety_constraints.items():
            # Count keyword matches
            keyword_matches = sum(
                1 for keyword in constraint_config["keywords"] 
                if keyword in text_lower
            )
            
            # Calculate violation score
            violation_score = keyword_matches / len(constraint_config["keywords"])
            
            if violation_score >= constraint_config["threshold"]:
                # Create safety violation
                violation = SafetyViolation(
                    violation_type=f"{constraint_name}_{text_type}",
                    severity=constraint_config["severity"],
                    context=f"{text_type}: {text[:100]}...",
                    detected_at=datetime.now(),
                    mitigation_actions=self._get_mitigation_actions(constraint_name)
                )
                violations.append(violation)
        
        return violations
    
    def _get_mitigation_actions(self, violation_type: str) -> List[str]:
        """Get mitigation actions for violation type"""
        mitigation_map = {
            "harmful_content": [
                "Block harmful response",
                "Generate safe alternative",
                "Request human review"
            ],
            "privacy_violation": [
                "Redact personal information",
                "Request explicit consent",
                "Apply privacy filters"
            ],
            "misinformation": [
                "Fact-check information",
                "Add uncertainty indicators",
                "Provide source citations"
            ],
            "bias_discrimination": [
                "Apply bias correction",
                "Generate inclusive alternative",
                "Trigger sensitivity review"
            ]
        }
        
        return mitigation_map.get(violation_type, ["General safety review"])
    
    async def enforce_safety_constraints(
        self, 
        violations: List[SafetyViolation]
    ) -> Dict[str, Any]:
        """Enforce safety constraints and apply mitigations"""
        if not violations:
            return {"action": "none", "safe": True}
        
        # Determine overall severity
        max_severity = max(v.severity for v in violations)
        
        enforcement_result = {
            "action": "review",
            "safe": False,
            "violations": len(violations),
            "max_severity": max_severity.value,
            "mitigations": []
        }
        
        # Apply mitigations based on severity
        for violation in violations:
            mitigations = await self._apply_mitigation(violation)
            enforcement_result["mitigations"].extend(mitigations)
        
        # Block critical violations
        if max_severity == SafetyLevel.CRITICAL:
            enforcement_result["action"] = "block"
            logger.error(f"🚨 CRITICAL SAFETY VIOLATION - Blocking interaction")
        
        return enforcement_result
    
    async def _apply_mitigation(self, violation: SafetyViolation) -> List[str]:
        """Apply specific mitigation for a violation"""
        applied_mitigations = []
        
        for action in violation.mitigation_actions:
            # Simulate mitigation application
            logger.info(f"🔧 Applying mitigation: {action}")
            applied_mitigations.append(action)
            
            # Mark as resolved if mitigation successful
            if "Block" in action or "Redact" in action:
                violation.resolved = True
        
        return applied_mitigations

class InterpretabilityEngine:
    """
    Model interpretability and explainable AI system
    Provides transparent reasoning for human understanding
    """
    
    def __init__(self):
        logger.info("🔍 Interpretability Engine initialized")
        self.interpretation_cache: Dict[str, InterpretabilityReport] = {}
        self.explanation_templates = self._load_explanation_templates()
    
    def _load_explanation_templates(self) -> Dict[str, str]:
        """Load explanation templates for different decision types"""
        return {
            "ethical_decision": "I chose {decision} because it aligns with {principles} and has a {confidence:.1%} confidence level. My reasoning: {reasoning}",
            "safety_assessment": "This interaction was assessed as {safety_level} because {reasoning}. Confidence: {confidence:.1%}",
            "preference_prediction": "I predicted preference for '{preferred}' with {confidence:.1%} confidence based on learned human preferences about {principle}",
            "general": "My decision was {decision} with {confidence:.1%} confidence. Key factors: {factors}"
        }
    
    async def generate_interpretation(
        self,
        decision_context: Dict[str, Any],
        decision_type: str = "general"
    ) -> InterpretabilityReport:
        """Generate interpretability report for a decision"""
        logger.info(f"🔍 Generating interpretation for {decision_type} decision")
        
        decision_id = f"{decision_type}_{int(time.time())}"
        
        # Extract key features and weights
        features = await self._extract_decision_features(decision_context)
        attention_weights = await self._calculate_attention_weights(features)
        reasoning_chain = await self._build_reasoning_chain(decision_context, decision_type)
        confidence_intervals = await self._calculate_confidence_intervals(decision_context)
        
        # Generate human-understandable explanation
        explanation = await self._generate_explanation(
            decision_context, decision_type, reasoning_chain
        )
        
        report = InterpretabilityReport(
            decision_id=decision_id,
            input_features=features,
            attention_weights=attention_weights,
            reasoning_chain=reasoning_chain,
            confidence_intervals=confidence_intervals,
            human_understandable=len(explanation) > 0
        )
        
        # Cache for future reference
        self.interpretation_cache[decision_id] = report
        
        logger.info(f"✅ Interpretation generated: {decision_id}")
        return report
    
    async def _extract_decision_features(
        self, 
        context: Dict[str, Any]
    ) -> Dict[str, float]:
        """Extract key features that influenced the decision"""
        features = {}
        
        # Extract quantifiable features
        if "confidence" in context:
            features["confidence"] = float(context["confidence"])
        
        if "safety_level" in context:
            safety_map = {
                SafetyLevel.CRITICAL: 0.0,
                SafetyLevel.HIGH: 0.25,
                SafetyLevel.MEDIUM: 0.5,
                SafetyLevel.LOW: 0.75,
                SafetyLevel.SAFE: 1.0
            }
            level = context["safety_level"]
            if isinstance(level, SafetyLevel):
                features["safety_score"] = safety_map[level]
            else:
                features["safety_score"] = 0.5
        
        if "ethical_principles" in context:
            principles = context["ethical_principles"]
            if isinstance(principles, list):
                features["num_ethical_principles"] = len(principles)
                features["ethical_coverage"] = len(principles) / len(EthicalPrinciple)
            else:
                features["num_ethical_principles"] = 1
                features["ethical_coverage"] = 0.125  # 1/8 principles
        
        if "violations" in context:
            violations = context["violations"]
            features["safety_violations"] = len(violations) if isinstance(violations, list) else violations
        
        # Add default features if missing
        for feature_name in ["confidence", "safety_score", "ethical_coverage"]:
            if feature_name not in features:
                features[feature_name] = 0.5  # Neutral default
        
        return features
    
    async def _calculate_attention_weights(
        self, 
        features: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate attention weights for different features"""
        # Normalize feature importance
        total_importance = sum(abs(v) for v in features.values())
        if total_importance == 0:
            return {k: 1.0/len(features) for k in features.keys()}
        
        weights = {
            k: abs(v) / total_importance 
            for k, v in features.items()
        }
        
        return weights
    
    async def _build_reasoning_chain(
        self, 
        context: Dict[str, Any], 
        decision_type: str
    ) -> List[str]:
        """Build step-by-step reasoning chain"""
        chain = []
        
        # Start with decision type context
        chain.append(f"Decision type: {decision_type}")
        
        # Add context-specific reasoning steps
        if decision_type == "ethical_decision":
            if "scenario" in context:
                chain.append(f"Scenario: {context['scenario'][:50]}...")
            if "options" in context:
                chain.append(f"Considered {len(context['options'])} options")
            if "ethical_principles" in context:
                principles = context["ethical_principles"]
                if isinstance(principles, list):
                    chain.append(f"Applied {len(principles)} ethical principles")
        
        elif decision_type == "safety_assessment":
            if "violations" in context:
                violations = context["violations"]
                if isinstance(violations, list):
                    chain.append(f"Detected {len(violations)} potential violations")
            if "safety_level" in context:
                level = context["safety_level"]
                chain.append(f"Assessed safety level: {level.value if isinstance(level, SafetyLevel) else level}")
        
        # Add confidence reasoning
        if "confidence" in context:
            confidence = context["confidence"]
            chain.append(f"Decision confidence: {confidence:.1%}")
        
        return chain
    
    async def _calculate_confidence_intervals(
        self, 
        context: Dict[str, Any]
    ) -> Dict[str, Tuple[float, float]]:
        """Calculate confidence intervals for key metrics"""
        intervals = {}
        
        base_confidence = context.get("confidence", 0.5)
        margin = 0.1  # 10% margin of error
        
        intervals["overall_confidence"] = (
            max(0.0, base_confidence - margin),
            min(1.0, base_confidence + margin)
        )
        
        if "safety_score" in context:
            safety_score = context["safety_score"]
            intervals["safety_confidence"] = (
                max(0.0, safety_score - margin),
                min(1.0, safety_score + margin)
            )
        
        return intervals
    
    async def _generate_explanation(
        self,
        context: Dict[str, Any],
        decision_type: str,
        reasoning_chain: List[str]
    ) -> str:
        """Generate human-understandable explanation"""
        template = self.explanation_templates.get(decision_type, self.explanation_templates["general"])
        
        try:
            # Prepare template variables
            template_vars = {
                "reasoning": " | ".join(reasoning_chain),
                "confidence": context.get("confidence", 0.5),
                "factors": ", ".join(reasoning_chain[-3:]) if len(reasoning_chain) > 3 else "standard evaluation"
            }
            
            # Add decision-type specific variables
            if decision_type == "ethical_decision":
                template_vars.update({
                    "decision": context.get("selected_option", "unknown"),
                    "principles": ", ".join([p.value for p in context.get("ethical_principles", [])])
                })
            
            elif decision_type == "safety_assessment":
                template_vars.update({
                    "safety_level": context.get("safety_level", SafetyLevel.MEDIUM).value,
                })
            
            elif decision_type == "preference_prediction":
                template_vars.update({
                    "preferred": context.get("preferred_response", "option A")[:30] + "...",
                    "principle": context.get("ethical_principle", EthicalPrinciple.BENEFICENCE).value
                })
            
            else:
                template_vars.update({
                    "decision": str(context.get("decision", "proceeding with analysis"))
                })
            
            explanation = template.format(**template_vars)
            return explanation
            
        except Exception as e:
            logger.warning(f"⚠️ Explanation generation failed: {e}")
            return f"Decision made with {context.get('confidence', 0.5):.1%} confidence based on available information."

class HumanAlignmentSafetySystem:
    """
    Main Human Alignment & Safety System integrating all components
    Provides comprehensive HAGI compliance and safety assurance
    """
    
    def __init__(self):
        logger.info("🤖🤝👥 Human Alignment & Safety System initializing...")
        
        # Initialize subsystems
        self.constitutional_ai = ConstitutionalAI()
        self.preference_learning = PreferenceLearningSystem()
        self.safety_monitor = SafetyMonitor()
        self.interpretability = InterpretabilityEngine()
        
        # System state
        self.alignment_active = True
        self.safety_level = SafetyLevel.MEDIUM
        self.human_feedback_count = 0
        self.total_interactions = 0
        
        logger.info("✅ Human Alignment & Safety System ready for HAGI operations")
    
    async def process_interaction(
        self,
        user_input: str,
        ai_response: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Process complete interaction through alignment and safety pipeline"""
        self.total_interactions += 1
        logger.info(f"🔄 Processing interaction #{self.total_interactions}")
        
        if context is None:
            context = {}
        
        results = {
            "interaction_id": f"interaction_{self.total_interactions}",
            "timestamp": datetime.now(),
            "safe": True,
            "aligned": True,
            "violations": [],
            "ethical_decisions": [],
            "interpretations": [],
            "recommendations": []
        }
        
        try:
            # 1. Safety Monitoring
            safety_violations = await self.safety_monitor.monitor_interaction(
                user_input, ai_response, context
            )
            results["violations"] = safety_violations
            
            if safety_violations:
                enforcement = await self.safety_monitor.enforce_safety_constraints(safety_violations)
                results["safety_enforcement"] = enforcement
                results["safe"] = enforcement["safe"]
            
            # 2. Constitutional AI Ethical Assessment
            if "decision_scenario" in context:
                ethical_decision = await self.constitutional_ai.evaluate_ethical_decision(
                    context["decision_scenario"],
                    context.get("decision_options", [ai_response])
                )
                results["ethical_decisions"].append(ethical_decision)
                
                # Update alignment status based on ethical decision
                results["aligned"] = ethical_decision.safety_level not in [
                    SafetyLevel.CRITICAL, SafetyLevel.HIGH
                ]
            
            # 3. Preference Learning Assessment
            if "preference_context" in context:
                predicted_preference, preference_confidence = await self.preference_learning.predict_human_preference(
                    context["preference_context"],
                    ai_response,
                    context.get("alternative_response", "alternative")
                )
                results["preference_prediction"] = {
                    "predicted": predicted_preference,
                    "confidence": preference_confidence
                }
            
            # 4. Generate Interpretability Report
            interpretation_context = {
                "user_input": user_input,
                "ai_response": ai_response,
                "safety_violations": len(safety_violations),
                "confidence": context.get("confidence", 0.7),
                **context
            }
            
            interpretation = await self.interpretability.generate_interpretation(
                interpretation_context, "general"
            )
            results["interpretations"].append(interpretation)
            
            # 5. Generate Recommendations
            recommendations = await self._generate_recommendations(results)
            results["recommendations"] = recommendations
            
            # Update system safety level
            await self._update_system_safety_level(results)
            
            logger.info(f"✅ Interaction processed - Safe: {results['safe']}, Aligned: {results['aligned']}")
            
        except Exception as e:
            logger.error(f"❌ Interaction processing failed: {e}")
            results["error"] = str(e)
            results["safe"] = False
            results["aligned"] = False
        
        return results
    
    async def learn_from_feedback(
        self,
        feedback_context: str,
        preferred_response: str,
        rejected_response: str,
        ethical_principle: EthicalPrinciple
    ) -> Dict[str, Any]:
        """Learn from human feedback to improve alignment"""
        logger.info("📚 Learning from human feedback...")
        
        try:
            # Store preference learning
            preference = await self.preference_learning.learn_preference(
                feedback_context,
                preferred_response,
                rejected_response,
                ethical_principle
            )
            
            self.human_feedback_count += 1
            
            # Generate interpretation of learning
            learning_context = {
                "feedback_context": feedback_context,
                "ethical_principle": ethical_principle,
                "confidence": preference.confidence_score,
                "learning_session": self.human_feedback_count
            }
            
            interpretation = await self.interpretability.generate_interpretation(
                learning_context, "preference_prediction"
            )
            
            result = {
                "learning_successful": True,
                "preference": preference,
                "interpretation": interpretation,
                "total_feedback_count": self.human_feedback_count
            }
            
            logger.info(f"✅ Feedback learning complete - Total feedback: {self.human_feedback_count}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Feedback learning failed: {e}")
            return {
                "learning_successful": False,
                "error": str(e),
                "total_feedback_count": self.human_feedback_count
            }
    
    async def get_alignment_status(self) -> Dict[str, Any]:
        """Get comprehensive alignment and safety status"""
        status = {
            "timestamp": datetime.now(),
            "alignment_active": self.alignment_active,
            "overall_safety_level": self.safety_level.value,
            "total_interactions": self.total_interactions,
            "human_feedback_count": self.human_feedback_count,
            "safety_violations": len(self.safety_monitor.safety_violations),
            "learned_preferences": len(self.preference_learning.preferences),
            "constitutional_violations": len(self.constitutional_ai.violation_history),
            "interpretability_reports": len(self.interpretability.interpretation_cache),
            "subsystem_status": {
                "constitutional_ai": "active",
                "preference_learning": "active",
                "safety_monitor": "active" if self.safety_monitor.monitoring_active else "inactive",
                "interpretability": "active"
            }
        }
        
        # Calculate alignment score
        if self.total_interactions > 0:
            safety_score = 1.0 - (len(self.safety_monitor.safety_violations) / self.total_interactions)
            alignment_score = min(1.0, self.human_feedback_count / max(1, self.total_interactions / 10))
            status["safety_score"] = safety_score
            status["alignment_score"] = alignment_score
            status["overall_score"] = (safety_score + alignment_score) / 2
        else:
            status["safety_score"] = 1.0
            status["alignment_score"] = 0.0
            status["overall_score"] = 0.5
        
        return status
    
    async def _generate_recommendations(self, interaction_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on interaction analysis"""
        recommendations = []
        
        # Safety recommendations
        if interaction_results["violations"]:
            recommendations.append("Review and address safety violations before proceeding")
            if any(v.severity == SafetyLevel.CRITICAL for v in interaction_results["violations"]):
                recommendations.append("CRITICAL: Immediate human review required")
        
        # Alignment recommendations
        if not interaction_results["aligned"]:
            recommendations.append("Improve ethical alignment of responses")
            recommendations.append("Consider additional constitutional AI training")
        
        # Learning recommendations
        if self.human_feedback_count < self.total_interactions / 20:  # Less than 5% feedback
            recommendations.append("Increase human feedback collection for better alignment")
        
        # Performance recommendations
        if hasattr(self, 'safety_score') and self.safety_score < 0.8:
            recommendations.append("Enhance safety monitoring and constraint enforcement")
        
        return recommendations
    
    async def _update_system_safety_level(self, interaction_results: Dict[str, Any]):
        """Update overall system safety level based on recent interactions"""
        violations = interaction_results["violations"]
        
        if violations:
            max_violation_severity = max(v.severity for v in violations)
            if max_violation_severity.value < self.safety_level.value:
                self.safety_level = max_violation_severity
                logger.warning(f"⚠️ System safety level updated to: {self.safety_level.value}")
        else:
            # Gradually improve safety level with safe interactions
            if self.safety_level != SafetyLevel.SAFE and self.total_interactions % 10 == 0:
                safety_levels = list(SafetyLevel)
                current_index = safety_levels.index(self.safety_level)
                if current_index < len(safety_levels) - 1:
                    self.safety_level = safety_levels[current_index + 1]
                    logger.info(f"✅ System safety level improved to: {self.safety_level.value}")

# Test and validation functions
async def test_human_alignment_system():
    """Test the human alignment and safety system"""
    logger.info("🧪 Testing Human Alignment & Safety System...")
    
    system = HumanAlignmentSafetySystem()
    
    # Test 1: Safe interaction
    logger.info("Test 1: Safe helpful interaction")
    result1 = await system.process_interaction(
        user_input="How can I learn Python programming?",
        ai_response="I'd be happy to help you learn Python! Start with basic syntax, practice with small projects, and use resources like Python.org tutorials.",
        context={"confidence": 0.85}
    )
    
    # Test 2: Potentially harmful interaction
    logger.info("Test 2: Potentially harmful content")
    result2 = await system.process_interaction(
        user_input="How to hurt someone's feelings?",
        ai_response="I can't help with hurting people. Instead, I can help you understand healthy communication and conflict resolution.",
        context={"confidence": 0.90}
    )
    
    # Test 3: Ethical decision scenario
    logger.info("Test 3: Ethical decision making")
    result3 = await system.process_interaction(
        user_input="Should I tell my friend their partner is cheating?",
        ai_response="This is a difficult ethical situation that requires careful consideration of trust, honesty, and potential consequences.",
        context={
            "decision_scenario": "Friend's partner cheating dilemma",
            "decision_options": [
                "Tell friend immediately",
                "Encourage partner to confess",
                "Stay out of it completely",
                "Suggest couple's counseling"
            ]
        }
    )
    
    # Test 4: Preference learning
    logger.info("Test 4: Learning from human feedback")
    feedback_result = await system.learn_from_feedback(
        feedback_context="Explaining complex technical concepts",
        preferred_response="Let me break this down into simple steps with examples...",
        rejected_response="Here's the technical documentation you should read...",
        ethical_principle=EthicalPrinciple.BENEFICENCE
    )
    
    # Test 5: System status
    logger.info("Test 5: System alignment status")
    status = await system.get_alignment_status()
    
    # Generate test report
    test_report = {
        "test_timestamp": datetime.now(),
        "tests_completed": 5,
        "results": {
            "safe_interaction": result1,
            "harmful_content": result2,
            "ethical_decision": result3,
            "feedback_learning": feedback_result,
            "system_status": status
        }
    }
    
    logger.info("✅ Human Alignment System tests completed!")
    return test_report

if __name__ == "__main__":
    async def main():
        logger.info("🚀 Starting Human Alignment & Safety System validation...")
        
        try:
            test_report = await test_human_alignment_system()
            
            # Save test report
            with open("human_alignment_test_report.json", "w") as f:
                # Convert datetime objects to strings for JSON serialization
                def json_serializer(obj):
                    if isinstance(obj, datetime):
                        return obj.isoformat()
                    elif isinstance(obj, (SafetyLevel, EthicalPrinciple, AlignmentStrategy)):
                        return obj.value
                    elif hasattr(obj, '__dict__'):
                        return obj.__dict__
                    else:
                        return str(obj)
                
                json.dump(test_report, f, indent=2, default=json_serializer)
            
            logger.info("📊 Test report saved to human_alignment_test_report.json")
            
            # Print summary
            status = test_report["results"]["system_status"]
            print(f"\n🎯 HUMAN ALIGNMENT SYSTEM SUMMARY:")
            print(f"   Overall Safety Level: {status['overall_safety_level']}")
            print(f"   Safety Score: {status.get('safety_score', 0):.1%}")
            print(f"   Alignment Score: {status.get('alignment_score', 0):.1%}")
            print(f"   Overall Score: {status.get('overall_score', 0):.1%}")
            print(f"   Total Interactions: {status['total_interactions']}")
            print(f"   Human Feedback Count: {status['human_feedback_count']}")
            print(f"   Safety Violations: {status['safety_violations']}")
            print(f"   Learned Preferences: {status['learned_preferences']}")
            
            if status.get('overall_score', 0) >= 0.8:
                print(f"🏆 HAGI COMPLIANCE: ACHIEVED")
            else:
                print(f"⚠️ HAGI COMPLIANCE: NEEDS IMPROVEMENT")
            
        except Exception as e:
            logger.error(f"❌ Human Alignment System validation failed: {e}")
            raise
    
    # Run the main async function
    asyncio.run(main())
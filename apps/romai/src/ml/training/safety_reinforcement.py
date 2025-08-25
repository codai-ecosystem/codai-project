"""
Safety Reinforcement Learning System
===================================

Implementation of safety-focused reinforcement learning with constitutional guardrails
for RomAI AGI system, ensuring safe and ethical behavior in all operational contexts.

Author: RomAI Development Team
Date: August 2025
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
import asyncio
import numpy as np
from datetime import datetime
import json

from .constitutional_framework import romanian_eu_constitution, ConstitutionalPrinciple
from .constitutional_ai import constitutional_ai_system

logger = logging.getLogger(__name__)

class SafetyRiskLevel(Enum):
    """Safety risk levels for responses and actions"""
    MINIMAL = "minimal"  # Risk level 1-2
    LOW = "low"          # Risk level 3-4  
    MODERATE = "moderate"  # Risk level 5-6
    HIGH = "high"        # Risk level 7-8
    CRITICAL = "critical"  # Risk level 9-10

class SafetyViolationType(Enum):
    """Types of safety violations"""
    HARMFUL_CONTENT = "harmful_content"
    PRIVACY_BREACH = "privacy_breach"
    MISINFORMATION = "misinformation"
    DISCRIMINATION = "discrimination"
    UNSAFE_ADVICE = "unsafe_advice"
    CULTURAL_INSENSITIVITY = "cultural_insensitivity"
    LEGAL_VIOLATION = "legal_violation"
    ETHICAL_CONCERN = "ethical_concern"

@dataclass
class SafetyAssessment:
    """Comprehensive safety assessment of AI response"""
    response_text: str
    overall_safety_score: float  # 0.0 (dangerous) to 1.0 (completely safe)
    risk_level: SafetyRiskLevel
    violations_detected: List[SafetyViolationType]
    safety_concerns: List[str]
    mitigation_suggestions: List[str]
    cultural_safety_score: float
    eu_compliance_score: float
    confidence: float
    requires_human_review: bool = False

@dataclass
class SafetyTrainingExample:
    """Training example for safety reinforcement learning"""
    prompt: str
    unsafe_response: str
    safe_response: str
    safety_reasoning: str
    violation_types: List[SafetyViolationType]
    safety_improvement_score: float
    context: str = "general"

class SafetyGuardrails:
    """Constitutional safety guardrails system"""
    
    def __init__(self, constitution=None):
        self.constitution = constitution or romanian_eu_constitution
        
        # Safety violation patterns (would be more sophisticated with ML models)
        self.safety_patterns = {
            SafetyViolationType.HARMFUL_CONTENT: [
                "violence", "attack", "harm", "hurt", "kill", "damage", "destroy", "weapon",
                "violență", "atac", "rănire", "omor", "armă", "distruge"
            ],
            SafetyViolationType.PRIVACY_BREACH: [
                "personal data", "private information", "confidential", "secret", "password",
                "date personale", "informații private", "confidențial", "parolă"
            ],
            SafetyViolationType.MISINFORMATION: [
                "false claim", "conspiracy", "hoax", "fake news", "unverified",
                "informații false", "conspirație", "știri false", "neverificat"
            ],
            SafetyViolationType.DISCRIMINATION: [
                "inferior", "superior race", "stereotype", "prejudice", "bias",
                "rasă superioară", "stereotip", "prejudecată", "discriminare"
            ],
            SafetyViolationType.UNSAFE_ADVICE: [
                "dangerous method", "risky behavior", "unsafe practice", "ignore safety",
                "metodă periculoasă", "comportament riscant", "ignoră siguranța"
            ]
        }
        
        # Safety thresholds
        self.safety_thresholds = {
            SafetyRiskLevel.MINIMAL: 0.9,
            SafetyRiskLevel.LOW: 0.8,
            SafetyRiskLevel.MODERATE: 0.6,
            SafetyRiskLevel.HIGH: 0.4,
            SafetyRiskLevel.CRITICAL: 0.2
        }
    
    def assess_response_safety(self, response: str, context: str = "general") -> SafetyAssessment:
        """Comprehensive safety assessment of AI response"""
        
        # Detect potential violations
        violations_detected = []
        safety_concerns = []
        
        response_lower = response.lower()
        
        for violation_type, patterns in self.safety_patterns.items():
            pattern_matches = sum(1 for pattern in patterns if pattern in response_lower)
            if pattern_matches > 0:
                violations_detected.append(violation_type)
                safety_concerns.append(f"Detected {violation_type.value}: {pattern_matches} pattern matches")
        
        # Constitutional safety assessment
        cultural_safety = self._assess_cultural_safety(response)
        eu_compliance = self._assess_eu_compliance_safety(response)
        
        # Calculate overall safety score
        base_safety_score = 1.0 - (len(violations_detected) * 0.15)  # Each violation reduces score
        constitutional_factor = (cultural_safety + eu_compliance) / 2.0
        overall_safety_score = max(0.0, min(1.0, base_safety_score * constitutional_factor))
        
        # Determine risk level
        risk_level = self._determine_risk_level(overall_safety_score)
        
        # Generate mitigation suggestions
        mitigation_suggestions = self._generate_mitigation_suggestions(
            violations_detected, cultural_safety, eu_compliance
        )
        
        # Determine if human review is required
        requires_human_review = (
            risk_level in [SafetyRiskLevel.HIGH, SafetyRiskLevel.CRITICAL] or
            len(violations_detected) >= 3 or
            overall_safety_score < 0.5
        )
        
        # Calculate confidence in assessment
        confidence = self._calculate_safety_confidence(
            violations_detected, cultural_safety, eu_compliance, response
        )
        
        return SafetyAssessment(
            response_text=response,
            overall_safety_score=overall_safety_score,
            risk_level=risk_level,
            violations_detected=violations_detected,
            safety_concerns=safety_concerns,
            mitigation_suggestions=mitigation_suggestions,
            cultural_safety_score=cultural_safety,
            eu_compliance_score=eu_compliance,
            confidence=confidence,
            requires_human_review=requires_human_review
        )
    
    def _assess_cultural_safety(self, response: str) -> float:
        """Assess cultural safety based on Romanian values"""
        
        # Check for cultural respect indicators
        cultural_positive_indicators = [
            "respect", "tradițional", "familie", "comunitate", "ospitalitate",
            "respectul", "valorile", "cultura", "tradiție"
        ]
        
        cultural_negative_indicators = [
            "inferior culture", "backward", "primitive", "uncivilized",
            "cultură inferioară", "înapoiat", "primitiv", "necivilizat"
        ]
        
        response_lower = response.lower()
        
        positive_score = sum(1 for indicator in cultural_positive_indicators if indicator in response_lower)
        negative_score = sum(1 for indicator in cultural_negative_indicators if indicator in response_lower)
        
        # Base cultural safety (neutral = 0.7)
        base_score = 0.7
        
        # Adjust based on indicators
        positive_adjustment = min(0.3, positive_score * 0.1)
        negative_adjustment = min(0.7, negative_score * 0.2)
        
        cultural_safety = max(0.0, min(1.0, base_score + positive_adjustment - negative_adjustment))
        return cultural_safety
    
    def _assess_eu_compliance_safety(self, response: str) -> float:
        """Assess EU AI Act compliance safety"""
        
        # EU AI Act safety indicators
        eu_positive_indicators = [
            "transparent", "accountable", "human oversight", "privacy", "non-discriminatory",
            "transparent", "responsabil", "supraveghere umană", "privat", "nediscriminatoriu"
        ]
        
        eu_negative_indicators = [
            "opaque", "hidden", "biased", "discriminatory", "privacy violation",
            "opac", "ascuns", "părtinitor", "discriminatoriu", "încălcarea intimității"
        ]
        
        response_lower = response.lower()
        
        positive_score = sum(1 for indicator in eu_positive_indicators if indicator in response_lower)
        negative_score = sum(1 for indicator in eu_negative_indicators if indicator in response_lower)
        
        # Base EU compliance (neutral = 0.75)
        base_score = 0.75
        
        positive_adjustment = min(0.25, positive_score * 0.08)
        negative_adjustment = min(0.75, negative_score * 0.15)
        
        eu_compliance = max(0.0, min(1.0, base_score + positive_adjustment - negative_adjustment))
        return eu_compliance
    
    def _determine_risk_level(self, safety_score: float) -> SafetyRiskLevel:
        """Determine risk level based on safety score"""
        
        if safety_score >= 0.9:
            return SafetyRiskLevel.MINIMAL
        elif safety_score >= 0.8:
            return SafetyRiskLevel.LOW
        elif safety_score >= 0.6:
            return SafetyRiskLevel.MODERATE
        elif safety_score >= 0.4:
            return SafetyRiskLevel.HIGH
        else:
            return SafetyRiskLevel.CRITICAL
    
    def _generate_mitigation_suggestions(
        self, 
        violations: List[SafetyViolationType], 
        cultural_safety: float, 
        eu_compliance: float
    ) -> List[str]:
        """Generate specific mitigation suggestions"""
        
        suggestions = []
        
        # Address specific violations
        if SafetyViolationType.HARMFUL_CONTENT in violations:
            suggestions.append("Eliminați conținutul potențial dăunător și oferiți alternative constructive")
        
        if SafetyViolationType.PRIVACY_BREACH in violations:
            suggestions.append("Respectați confidențialitatea și nu partajați informații personale")
        
        if SafetyViolationType.MISINFORMATION in violations:
            suggestions.append("Verificați acuratețea informațiilor și citiți surse credibile")
        
        if SafetyViolationType.DISCRIMINATION in violations:
            suggestions.append("Adoptați un limbaj inclusiv și respectuos pentru toate grupurile")
        
        if SafetyViolationType.UNSAFE_ADVICE in violations:
            suggestions.append("Furnizați sfaturi sigure și recomandați consultarea experților")
        
        # Address constitutional concerns
        if cultural_safety < 0.7:
            suggestions.append("Îmbunătățiți sensibilitatea culturală și respectul pentru tradițiile românești")
        
        if eu_compliance < 0.7:
            suggestions.append("Asigurați conformitatea cu Actul European pentru IA și principiile de transparență")
        
        # General improvements
        if len(violations) > 2:
            suggestions.append("Efectuați o revizuire comprehensivă pentru multiple probleme de siguranță")
        
        return suggestions
    
    def _calculate_safety_confidence(
        self, 
        violations: List[SafetyViolationType], 
        cultural_safety: float, 
        eu_compliance: float, 
        response: str
    ) -> float:
        """Calculate confidence in safety assessment"""
        
        # Base confidence
        base_confidence = 0.7
        
        # Higher confidence with clear violations
        violation_clarity = min(0.2, len(violations) * 0.05)
        
        # Higher confidence with extreme scores (very safe or very unsafe)
        safety_extremity = max(abs(cultural_safety - 0.5), abs(eu_compliance - 0.5))
        extremity_confidence = safety_extremity * 0.2
        
        # Lower confidence with very short responses
        length_factor = min(1.0, len(response.split()) / 20.0) * 0.1
        
        confidence = base_confidence + violation_clarity + extremity_confidence + length_factor
        return max(0.1, min(1.0, confidence))

class SafetyReinforcementLearning:
    """Safety-focused reinforcement learning system"""
    
    def __init__(self, guardrails: SafetyGuardrails = None):
        self.guardrails = guardrails or SafetyGuardrails()
        self.training_history: List[SafetyTrainingExample] = []
        self.safety_metrics = {
            "total_assessments": 0,
            "safety_violations_prevented": 0,
            "average_safety_score": 0.0,
            "human_reviews_triggered": 0,
            "violation_type_counts": {vtype.value: 0 for vtype in SafetyViolationType}
        }
    
    async def safety_reinforcement_training(
        self, 
        prompt: str, 
        initial_response: str, 
        context: str = "general"
    ) -> Tuple[str, SafetyAssessment]:
        """
        Perform safety reinforcement learning on a response
        
        Args:
            prompt: Original user prompt
            initial_response: AI's initial response
            context: Context for assessment
            
        Returns:
            Tuple of (improved_response, safety_assessment)
        """
        
        # Assess initial response safety
        safety_assessment = self.guardrails.assess_response_safety(initial_response, context)
        
        self._update_safety_metrics(safety_assessment)
        
        # If response is unsafe, apply constitutional reinforcement
        if safety_assessment.overall_safety_score < 0.8:
            logger.info(f"Applying safety reinforcement for risk level: {safety_assessment.risk_level.value}")
            
            # Use constitutional AI for improvement
            constitutional_critique = await constitutional_ai_system.constitutional_self_critique(
                response=initial_response,
                context=context,
                apply_revision=True
            )
            
            improved_response = constitutional_critique.revised_response or initial_response
            
            # Re-assess improved response
            improved_assessment = self.guardrails.assess_response_safety(improved_response, context)
            
            # Generate training example
            training_example = self._create_safety_training_example(
                prompt, initial_response, improved_response, safety_assessment, improved_assessment, context
            )
            
            self.training_history.append(training_example)
            
            logger.info(f"Safety improvement: {safety_assessment.overall_safety_score:.3f} → {improved_assessment.overall_safety_score:.3f}")
            return improved_response, improved_assessment
        
        else:
            logger.info(f"Response passed safety assessment: {safety_assessment.overall_safety_score:.3f}")
            return initial_response, safety_assessment
    
    def _create_safety_training_example(
        self,
        prompt: str,
        unsafe_response: str,
        safe_response: str,
        unsafe_assessment: SafetyAssessment,
        safe_assessment: SafetyAssessment,
        context: str
    ) -> SafetyTrainingExample:
        """Create a training example from safety reinforcement"""
        
        # Generate safety reasoning explanation
        reasoning_parts = []
        reasoning_parts.append("Evaluarea siguranței:")
        reasoning_parts.append(f"- Scor inițial: {unsafe_assessment.overall_safety_score:.3f}")
        reasoning_parts.append(f"- Scor îmbunătățit: {safe_assessment.overall_safety_score:.3f}")
        
        if unsafe_assessment.violations_detected:
            reasoning_parts.append("Încălcări identificate:")
            for violation in unsafe_assessment.violations_detected:
                reasoning_parts.append(f"  - {violation.value}")
        
        if safe_assessment.mitigation_suggestions:
            reasoning_parts.append("Măsuri de siguranță aplicate:")
            for suggestion in safe_assessment.mitigation_suggestions:
                reasoning_parts.append(f"  - {suggestion}")
        
        safety_reasoning = "\n".join(reasoning_parts)
        
        # Calculate improvement score
        safety_improvement = safe_assessment.overall_safety_score - unsafe_assessment.overall_safety_score
        
        return SafetyTrainingExample(
            prompt=prompt,
            unsafe_response=unsafe_response,
            safe_response=safe_response,
            safety_reasoning=safety_reasoning,
            violation_types=unsafe_assessment.violations_detected,
            safety_improvement_score=safety_improvement,
            context=context
        )
    
    def _update_safety_metrics(self, assessment: SafetyAssessment):
        """Update safety performance metrics"""
        self.safety_metrics["total_assessments"] += 1
        
        # Track violations prevented
        if assessment.violations_detected:
            self.safety_metrics["safety_violations_prevented"] += len(assessment.violations_detected)
            
            for violation_type in assessment.violations_detected:
                self.safety_metrics["violation_type_counts"][violation_type.value] += 1
        
        # Update average safety score
        total_assessments = self.safety_metrics["total_assessments"]
        current_avg = self.safety_metrics["average_safety_score"]
        new_avg = ((current_avg * (total_assessments - 1)) + assessment.overall_safety_score) / total_assessments
        self.safety_metrics["average_safety_score"] = new_avg
        
        # Track human reviews
        if assessment.requires_human_review:
            self.safety_metrics["human_reviews_triggered"] += 1
    
    def get_safety_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive safety performance report"""
        
        total_assessments = self.safety_metrics["total_assessments"]
        if total_assessments == 0:
            return {"message": "No safety assessments performed yet"}
        
        # Calculate rates and trends
        violation_prevention_rate = self.safety_metrics["safety_violations_prevented"] / total_assessments
        human_review_rate = self.safety_metrics["human_reviews_triggered"] / total_assessments
        
        # Top safety concerns
        violation_counts = self.safety_metrics["violation_type_counts"]
        top_violations = sorted(violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Recent safety trend
        recent_examples = self.training_history[-20:] if self.training_history else []
        if recent_examples:
            recent_improvements = [ex.safety_improvement_score for ex in recent_examples]
            average_recent_improvement = sum(recent_improvements) / len(recent_improvements)
        else:
            average_recent_improvement = 0.0
        
        return {
            "safety_performance": {
                "total_assessments": total_assessments,
                "average_safety_score": self.safety_metrics["average_safety_score"],
                "violation_prevention_rate": violation_prevention_rate,
                "human_review_rate": human_review_rate,
                "training_examples_generated": len(self.training_history),
                "average_recent_improvement": average_recent_improvement
            },
            "violation_analysis": {
                "total_violations_prevented": self.safety_metrics["safety_violations_prevented"],
                "top_violation_types": top_violations,
                "violation_diversity": len([v for v in violation_counts.values() if v > 0])
            },
            "safety_guardrails": {
                "constitutional_principles_active": len(self.guardrails.constitution.rules),
                "safety_patterns_monitored": len(self.guardrails.safety_patterns),
                "risk_levels_defined": len(SafetyRiskLevel)
            },
            "recommendations": self._generate_safety_recommendations(
                violation_prevention_rate, human_review_rate, top_violations
            )
        }
    
    def _generate_safety_recommendations(
        self, 
        violation_rate: float, 
        review_rate: float, 
        top_violations: List[Tuple[str, int]]
    ) -> List[str]:
        """Generate safety improvement recommendations"""
        
        recommendations = []
        
        if violation_rate > 0.3:
            recommendations.append("Rata mare de încălcări de siguranță - intensificați antrenamentul preventiv")
        
        if review_rate > 0.2:
            recommendations.append("Multe cereri de revizuire umană - îmbunătățiți capacitatea de auto-evaluare")
        
        if top_violations and top_violations[0][1] > 5:
            most_common_violation = top_violations[0][0]
            recommendations.append(f"Cel mai frecvent tip de încălcare: '{most_common_violation}' - necesită atenție specializată")
        
        if len(self.training_history) < 30:
            recommendations.append("Colecție insuficientă de exemple de siguranță - continuați antrenamentul")
        
        return recommendations
    
    async def batch_safety_training(self, training_data: List[Dict[str, str]], epochs: int = 1) -> Dict[str, Any]:
        """Run batch safety reinforcement training"""
        
        logger.info(f"Starting batch safety training: {len(training_data)} examples, {epochs} epochs")
        
        results = {
            "epochs_completed": 0,
            "total_examples_processed": 0,
            "safety_improvements": 0,
            "average_safety_improvement": 0.0,
            "violations_prevented": 0,
            "training_examples_generated": 0
        }
        
        for epoch in range(epochs):
            epoch_improvements = []
            epoch_violations_prevented = 0
            
            for example in training_data:
                prompt = example.get("prompt", "")
                response = example.get("response", "")
                context = example.get("context", "general")
                
                # Apply safety reinforcement
                improved_response, assessment = await self.safety_reinforcement_training(
                    prompt, response, context
                )
                
                # Track improvements
                if improved_response != response:
                    improvement_score = assessment.overall_safety_score
                    epoch_improvements.append(improvement_score)
                    results["safety_improvements"] += 1
                
                epoch_violations_prevented += len(assessment.violations_detected)
                results["total_examples_processed"] += 1
                
                # Log progress
                if results["total_examples_processed"] % 20 == 0:
                    logger.info(f"Processed {results['total_examples_processed']} examples, {len(epoch_improvements)} improvements this epoch")
            
            results["epochs_completed"] += 1
            results["violations_prevented"] += epoch_violations_prevented
            
            logger.info(f"Epoch {epoch + 1} completed: {len(epoch_improvements)} improvements, {epoch_violations_prevented} violations prevented")
        
        # Calculate final metrics
        if results["safety_improvements"] > 0:
            total_improvement_scores = [ex.safety_improvement_score for ex in self.training_history[-results["safety_improvements"]:]]
            results["average_safety_improvement"] = sum(total_improvement_scores) / len(total_improvement_scores)
        
        results["training_examples_generated"] = len(self.training_history)
        
        logger.info(f"Batch safety training completed: {results['safety_improvements']} improvements, {results['violations_prevented']} violations prevented")
        return results

# Global safety reinforcement learning system
safety_rl_system = SafetyReinforcementLearning()
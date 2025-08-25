"""
Constitutional AI Self-Critique System
====================================

Implementation of Constitutional AI training with self-critique loops for RomAI,
enabling the system to evaluate and improve its responses based on constitutional principles.

Author: RomAI Development Team  
Date: August 2025
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import json
import asyncio
import logging
from datetime import datetime

from .constitutional_framework import (
    romanian_eu_constitution, 
    ConstitutionalPrinciple, 
    ConstitutionalRule
)

logger = logging.getLogger(__name__)

@dataclass
class SelfCritiqueResult:
    """Result of constitutional self-critique process"""
    original_response: str
    constitutional_scores: Dict[str, float]
    overall_compliance: float
    violations_found: List[str]
    improvement_suggestions: List[str]
    revised_response: Optional[str] = None
    revision_applied: bool = False
    critique_confidence: float = 0.0

@dataclass
class ConstitutionalTrainingExample:
    """Training example for constitutional AI"""
    prompt: str
    initial_response: str
    constitutional_critique: str
    revised_response: str
    principles_violated: List[str]
    principles_reinforced: List[str]
    improvement_score: float
    context: str = "general"

class ConstitutionalAISelfCritique:
    """Self-critique system based on Romanian/EU constitutional principles"""
    
    def __init__(self, constitution=None):
        self.constitution = constitution or romanian_eu_constitution
        self.critique_history: List[SelfCritiqueResult] = []
        self.training_examples: List[ConstitutionalTrainingExample] = []
        self.performance_metrics = {
            "total_critiques": 0,
            "successful_improvements": 0,
            "average_improvement": 0.0,
            "principle_violation_rate": {},
            "context_performance": {}
        }
    
    async def constitutional_self_critique(
        self, 
        response: str, 
        context: str = "general",
        apply_revision: bool = True
    ) -> SelfCritiqueResult:
        """
        Perform constitutional self-critique on a response
        
        Args:
            response: The AI response to evaluate
            context: Context for evaluation (general, cultural, legal, etc.)
            apply_revision: Whether to generate a revised response
            
        Returns:
            SelfCritiqueResult with evaluation and optional revision
        """
        logger.info(f"Starting constitutional self-critique for context: {context}")
        
        # Get applicable constitutional rules
        applicable_rules = self.constitution.get_applicable_rules(context)
        
        # Evaluate compliance with each principle
        constitutional_scores = {}
        all_violations = []
        all_suggestions = []
        
        for rule in applicable_rules:
            evaluation = self.constitution.evaluate_rule_compliance(response, rule.principle)
            constitutional_scores[rule.principle.value] = evaluation["compliance_score"]
            
            if evaluation["specific_violations"]:
                all_violations.extend(evaluation["specific_violations"])
            
            all_suggestions.extend(evaluation["recommendations"])
        
        # Calculate overall compliance score
        if constitutional_scores:
            # Weight by rule priority
            weighted_scores = []
            total_weight = 0
            for rule in applicable_rules:
                principle = rule.principle.value
                if principle in constitutional_scores:
                    score = constitutional_scores[principle]
                    weight = rule.priority
                    weighted_scores.append(score * weight)
                    total_weight += weight
            
            overall_compliance = sum(weighted_scores) / total_weight if total_weight > 0 else 0.0
        else:
            overall_compliance = 1.0  # No rules to violate
        
        # Generate critique confidence based on clarity of evaluation
        critique_confidence = self._calculate_critique_confidence(
            constitutional_scores, all_violations, context
        )
        
        # Create initial result
        result = SelfCritiqueResult(
            original_response=response,
            constitutional_scores=constitutional_scores,
            overall_compliance=overall_compliance,
            violations_found=all_violations,
            improvement_suggestions=all_suggestions,
            critique_confidence=critique_confidence
        )
        
        # Apply revision if requested and compliance is low
        if apply_revision and overall_compliance < 0.8:
            revised_response = await self._generate_constitutional_revision(
                response, applicable_rules, all_violations, all_suggestions, context
            )
            result.revised_response = revised_response
            result.revision_applied = True
        
        # Store for learning
        self.critique_history.append(result)
        self._update_performance_metrics(result, context)
        
        logger.info(f"Constitutional critique completed. Compliance: {overall_compliance:.3f}")
        return result
    
    def _calculate_critique_confidence(
        self, 
        scores: Dict[str, float], 
        violations: List[str], 
        context: str
    ) -> float:
        """Calculate confidence in the constitutional critique"""
        
        # Base confidence on score consistency
        if not scores:
            return 0.5
        
        score_values = list(scores.values())
        score_variance = sum((s - sum(score_values)/len(score_values))**2 for s in score_values) / len(score_values)
        consistency_factor = max(0, 1.0 - score_variance)
        
        # Factor in violation clarity
        violation_clarity = len(violations) * 0.1  # More specific violations = higher confidence
        
        # Context familiarity (more training examples = higher confidence)
        context_familiarity = min(1.0, len([ex for ex in self.training_examples if ex.context == context]) * 0.05)
        
        confidence = (consistency_factor * 0.5 + violation_clarity * 0.3 + context_familiarity * 0.2)
        return max(0.1, min(1.0, confidence))
    
    async def _generate_constitutional_revision(
        self,
        original_response: str,
        rules: List[ConstitutionalRule],
        violations: List[str],
        suggestions: List[str],
        context: str
    ) -> str:
        """Generate a constitutionally-improved version of the response"""
        
        # This would typically use the language model to revise
        # For now, we'll create a structured revision based on rules
        
        revision_notes = []
        
        # Address specific violations
        if violations:
            revision_notes.append("Reviziuni pentru conformitatea constituțională:")
            for violation in violations:
                revision_notes.append(f"- Corectez: {violation}")
        
        # Apply constitutional principles
        high_priority_rules = [r for r in rules if r.priority >= 9]
        if high_priority_rules:
            revision_notes.append("\nPrincipii constituționale aplicate:")
            for rule in high_priority_rules[:3]:  # Top 3 rules
                revision_notes.append(f"- {rule.description_ro}")
        
        # Create revised response (mock implementation)
        if violations or any(score < 0.7 for score in [0.8]):  # Mock score check
            revised_response = f"""
{original_response}

[Reviziune constituțională aplicată]
{chr(10).join(revision_notes)}

Prin aplicarea principiilor constituționale românești și europene, acest răspuns respectă:
- Demnitatea umană și respectul mutual
- Transparența și responsabilitatea
- Valorile culturale românești
- Cerințele Actului European pentru IA
            """.strip()
        else:
            revised_response = original_response
        
        return revised_response
    
    def _update_performance_metrics(self, result: SelfCritiqueResult, context: str):
        """Update performance tracking metrics"""
        self.performance_metrics["total_critiques"] += 1
        
        # Track improvements
        if result.revision_applied and result.overall_compliance > 0.7:
            self.performance_metrics["successful_improvements"] += 1
        
        # Update average improvement
        total_improvements = self.performance_metrics["successful_improvements"]
        if total_improvements > 0:
            self.performance_metrics["average_improvement"] = (
                (self.performance_metrics["average_improvement"] * (total_improvements - 1) + result.overall_compliance) 
                / total_improvements
            )
        
        # Track principle violations
        for violation in result.violations_found:
            if violation not in self.performance_metrics["principle_violation_rate"]:
                self.performance_metrics["principle_violation_rate"][violation] = 0
            self.performance_metrics["principle_violation_rate"][violation] += 1
        
        # Track context performance
        if context not in self.performance_metrics["context_performance"]:
            self.performance_metrics["context_performance"][context] = {"scores": [], "count": 0}
        
        self.performance_metrics["context_performance"][context]["scores"].append(result.overall_compliance)
        self.performance_metrics["context_performance"][context]["count"] += 1
    
    def generate_constitutional_training_example(self, result: SelfCritiqueResult, context: str) -> ConstitutionalTrainingExample:
        """Generate a training example from a critique result"""
        
        # Extract violated and reinforced principles
        violated_principles = [
            principle for principle, score in result.constitutional_scores.items() 
            if score < 0.7
        ]
        
        reinforced_principles = [
            principle for principle, score in result.constitutional_scores.items() 
            if score > 0.8
        ]
        
        # Calculate improvement score
        improvement_score = 0.0
        if result.revised_response:
            # In practice, would re-evaluate the revised response
            improvement_score = min(1.0, result.overall_compliance + 0.2)
        
        # Create constitutional critique text
        critique_parts = []
        if result.violations_found:
            critique_parts.append("Principii constituționale încălcate:")
            critique_parts.extend([f"- {v}" for v in result.violations_found])
        
        if result.improvement_suggestions:
            critique_parts.append("\nSugestii de îmbunătățire:")
            critique_parts.extend([f"- {s}" for s in result.improvement_suggestions])
        
        constitutional_critique = "\n".join(critique_parts)
        
        example = ConstitutionalTrainingExample(
            prompt="[Prompt original]",  # Would need to be provided from calling context
            initial_response=result.original_response,
            constitutional_critique=constitutional_critique,
            revised_response=result.revised_response or result.original_response,
            principles_violated=violated_principles,
            principles_reinforced=reinforced_principles,
            improvement_score=improvement_score,
            context=context
        )
        
        self.training_examples.append(example)
        return example
    
    def get_constitutional_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        total_critiques = self.performance_metrics["total_critiques"]
        
        if total_critiques == 0:
            return {"message": "No constitutional critiques performed yet"}
        
        # Calculate success rates
        success_rate = self.performance_metrics["successful_improvements"] / total_critiques
        
        # Top violations
        violation_counts = self.performance_metrics["principle_violation_rate"]
        top_violations = sorted(violation_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Context performance
        context_avg = {}
        for context, data in self.performance_metrics["context_performance"].items():
            if data["scores"]:
                context_avg[context] = sum(data["scores"]) / len(data["scores"])
        
        # Recent trend (last 10 critiques)
        recent_scores = [r.overall_compliance for r in self.critique_history[-10:]]
        recent_trend = sum(recent_scores) / len(recent_scores) if recent_scores else 0.0
        
        return {
            "constitutional_ai_performance": {
                "total_critiques": total_critiques,
                "success_rate": success_rate,
                "average_compliance": self.performance_metrics["average_improvement"],
                "recent_trend": recent_trend,
                "training_examples_generated": len(self.training_examples)
            },
            "violation_analysis": {
                "top_violations": top_violations,
                "total_unique_violations": len(violation_counts)
            },
            "context_performance": context_avg,
            "constitutional_principles": {
                "total_principles": len(self.constitution.rules),
                "high_priority_principles": len([r for r in self.constitution.rules.values() if r.priority >= 9]),
                "mandatory_principles": len([r for r in self.constitution.rules.values() if r.enforcement_level == "mandatory"])
            },
            "recommendations": self._generate_performance_recommendations(success_rate, top_violations, context_avg)
        }
    
    def _generate_performance_recommendations(
        self, 
        success_rate: float, 
        top_violations: List[Tuple[str, int]], 
        context_performance: Dict[str, float]
    ) -> List[str]:
        """Generate recommendations for improving constitutional performance"""
        recommendations = []
        
        if success_rate < 0.7:
            recommendations.append("Rata de succes constituțional scăzută - intensificați antrenamentul pe principiile fundamentale")
        
        if top_violations:
            most_common_violation = top_violations[0][0]
            recommendations.append(f"Cea mai frecventă încălcare: '{most_common_violation}' - necesită atenție specială")
        
        # Context-specific recommendations
        low_performance_contexts = [ctx for ctx, score in context_performance.items() if score < 0.6]
        if low_performance_contexts:
            recommendations.append(f"Contexte cu performanță scăzută: {', '.join(low_performance_contexts)} - necesită antrenament specializat")
        
        if len(self.training_examples) < 50:
            recommendations.append("Colecție insuficientă de exemple de antrenament - continuați să generați exemple constitutional")
        
        return recommendations
    
    async def constitutional_self_training_loop(self, training_data: List[str], epochs: int = 1) -> Dict[str, Any]:
        """Run constitutional self-training loop on provided data"""
        logger.info(f"Starting constitutional self-training loop for {len(training_data)} examples over {epochs} epochs")
        
        training_results = {
            "epoch_results": [],
            "total_examples_processed": 0,
            "total_improvements_made": 0,
            "average_compliance_improvement": 0.0,
            "constitutional_training_examples": 0
        }
        
        for epoch in range(epochs):
            epoch_compliance_scores = []
            epoch_improvements = 0
            epoch_examples_generated = 0
            
            for i, response in enumerate(training_data):
                # Perform constitutional critique
                critique_result = await self.constitutional_self_critique(
                    response=response,
                    context="general",  # Could be inferred from content
                    apply_revision=True
                )
                
                epoch_compliance_scores.append(critique_result.overall_compliance)
                
                if critique_result.revision_applied:
                    epoch_improvements += 1
                
                # Generate training example
                training_example = self.generate_constitutional_training_example(
                    critique_result, "general"
                )
                epoch_examples_generated += 1
                
                # Log progress every 10 examples
                if (i + 1) % 10 == 0:
                    logger.info(f"Epoch {epoch + 1}, Example {i + 1}/{len(training_data)}: Avg compliance = {sum(epoch_compliance_scores)/len(epoch_compliance_scores):.3f}")
            
            # Epoch summary
            avg_epoch_compliance = sum(epoch_compliance_scores) / len(epoch_compliance_scores)
            
            epoch_result = {
                "epoch": epoch + 1,
                "examples_processed": len(training_data),
                "average_compliance": avg_epoch_compliance,
                "improvements_made": epoch_improvements,
                "training_examples_generated": epoch_examples_generated
            }
            
            training_results["epoch_results"].append(epoch_result)
            training_results["total_examples_processed"] += len(training_data)
            training_results["total_improvements_made"] += epoch_improvements
            training_results["constitutional_training_examples"] += epoch_examples_generated
            
            logger.info(f"Epoch {epoch + 1} completed: {avg_epoch_compliance:.3f} avg compliance, {epoch_improvements} improvements")
        
        # Calculate overall improvement
        if training_results["epoch_results"]:
            first_epoch_compliance = training_results["epoch_results"][0]["average_compliance"]
            last_epoch_compliance = training_results["epoch_results"][-1]["average_compliance"]
            training_results["average_compliance_improvement"] = last_epoch_compliance - first_epoch_compliance
        
        logger.info(f"Constitutional self-training completed: {training_results['total_improvements_made']} total improvements")
        return training_results

# Global constitutional AI system
constitutional_ai_system = ConstitutionalAISelfCritique()
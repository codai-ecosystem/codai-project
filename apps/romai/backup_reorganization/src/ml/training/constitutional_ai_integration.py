"""
Constitutional AI Integration Service
===================================

FastAPI integration service for Constitutional AI & Safety Training,
providing comprehensive REST endpoints for constitutional evaluation and safety enforcement.

Author: RomAI Development Team
Date: August 2025
"""

from typing import Dict, List, Optional, Any
from fastapi import HTTPException
import logging
import asyncio
from datetime import datetime

# Import constitutional components
from .constitutional_framework import romanian_eu_constitution, ConstitutionalPrinciple
from .constitutional_ai import constitutional_ai_system, SelfCritiqueResult, ConstitutionalTrainingExample
from .safety_reinforcement import safety_rl_system, SafetyAssessment, SafetyRiskLevel

logger = logging.getLogger(__name__)

class ConstitutionalAIService:
    """Integration service for Constitutional AI capabilities"""
    
    def __init__(self):
        self.constitution = romanian_eu_constitution
        self.constitutional_ai = constitutional_ai_system
        self.safety_system = safety_rl_system
        
        # Service status
        self.service_status = {
            "initialized": True,
            "constitution_loaded": True,
            "constitutional_ai_ready": True,
            "safety_system_ready": True,
            "last_health_check": datetime.now().isoformat()
        }
        
        logger.info("Constitutional AI Integration Service initialized")
    
    async def evaluate_constitutional_compliance(
        self, 
        response: str, 
        context: str = "general"
    ) -> Dict[str, Any]:
        """Evaluate response compliance with constitutional principles"""
        try:
            # Perform constitutional self-critique
            critique_result = await self.constitutional_ai.constitutional_self_critique(
                response=response,
                context=context,
                apply_revision=False  # Just evaluation
            )
            
            return {
                "constitutional_evaluation": {
                    "overall_compliance": critique_result.overall_compliance,
                    "principle_scores": critique_result.constitutional_scores,
                    "violations_detected": critique_result.violations_found,
                    "improvement_suggestions": critique_result.improvement_suggestions,
                    "critique_confidence": critique_result.critique_confidence,
                    "context": context
                },
                "constitutional_principles": {
                    "total_evaluated": len(critique_result.constitutional_scores),
                    "applicable_rules": len(self.constitution.get_applicable_rules(context)),
                    "high_priority_violations": [
                        v for v in critique_result.violations_found 
                        if any("priority" in v.lower() or "mandatory" in v.lower() for v in [v])
                    ]
                },
                "status": "success",
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Constitutional evaluation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Constitutional evaluation failed: {str(e)}")
    
    async def apply_constitutional_revision(
        self, 
        response: str, 
        context: str = "general"
    ) -> Dict[str, Any]:
        """Apply constitutional revision to improve response compliance"""
        try:
            # Perform constitutional self-critique with revision
            critique_result = await self.constitutional_ai.constitutional_self_critique(
                response=response,
                context=context,
                apply_revision=True
            )
            
            # Calculate improvement metrics
            improvement_applied = critique_result.revision_applied
            compliance_improvement = 0.0
            
            if improvement_applied and critique_result.revised_response:
                # Re-evaluate revised response
                revised_critique = await self.constitutional_ai.constitutional_self_critique(
                    response=critique_result.revised_response,
                    context=context,
                    apply_revision=False
                )
                compliance_improvement = revised_critique.overall_compliance - critique_result.overall_compliance
            
            return {
                "constitutional_revision": {
                    "original_response": response,
                    "revised_response": critique_result.revised_response or response,
                    "revision_applied": improvement_applied,
                    "original_compliance": critique_result.overall_compliance,
                    "revised_compliance": critique_result.overall_compliance + compliance_improvement,
                    "compliance_improvement": compliance_improvement,
                    "violations_addressed": critique_result.violations_found,
                    "suggestions_implemented": critique_result.improvement_suggestions
                },
                "revision_metadata": {
                    "context": context,
                    "critique_confidence": critique_result.critique_confidence,
                    "timestamp": datetime.now().isoformat(),
                    "principles_applied": len(critique_result.constitutional_scores)
                },
                "status": "success"
            }
        
        except Exception as e:
            logger.error(f"Constitutional revision error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Constitutional revision failed: {str(e)}")
    
    async def assess_response_safety(
        self, 
        response: str, 
        context: str = "general"
    ) -> Dict[str, Any]:
        """Comprehensive safety assessment of AI response"""
        try:
            # Perform safety assessment
            safety_assessment = self.safety_system.guardrails.assess_response_safety(response, context)
            
            return {
                "safety_assessment": {
                    "overall_safety_score": safety_assessment.overall_safety_score,
                    "risk_level": safety_assessment.risk_level.value,
                    "violations_detected": [v.value for v in safety_assessment.violations_detected],
                    "safety_concerns": safety_assessment.safety_concerns,
                    "mitigation_suggestions": safety_assessment.mitigation_suggestions,
                    "cultural_safety_score": safety_assessment.cultural_safety_score,
                    "eu_compliance_score": safety_assessment.eu_compliance_score,
                    "requires_human_review": safety_assessment.requires_human_review,
                    "assessment_confidence": safety_assessment.confidence
                },
                "safety_metadata": {
                    "context": context,
                    "assessment_timestamp": datetime.now().isoformat(),
                    "risk_threshold": "high" if safety_assessment.overall_safety_score < 0.6 else "acceptable"
                },
                "status": "success"
            }
        
        except Exception as e:
            logger.error(f"Safety assessment error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Safety assessment failed: {str(e)}")
    
    async def apply_safety_reinforcement(
        self, 
        prompt: str, 
        response: str, 
        context: str = "general"
    ) -> Dict[str, Any]:
        """Apply safety reinforcement learning to improve response"""
        try:
            # Apply safety reinforcement
            improved_response, safety_assessment = await self.safety_system.safety_reinforcement_training(
                prompt=prompt,
                initial_response=response,
                context=context
            )
            
            # Determine if improvement was made
            improvement_made = improved_response != response
            
            return {
                "safety_reinforcement": {
                    "original_response": response,
                    "improved_response": improved_response,
                    "improvement_made": improvement_made,
                    "safety_score": safety_assessment.overall_safety_score,
                    "risk_level": safety_assessment.risk_level.value,
                    "violations_addressed": [v.value for v in safety_assessment.violations_detected],
                    "safety_improvements": safety_assessment.mitigation_suggestions
                },
                "training_outcome": {
                    "prompt": prompt,
                    "context": context,
                    "training_example_created": improvement_made,
                    "requires_human_review": safety_assessment.requires_human_review,
                    "timestamp": datetime.now().isoformat()
                },
                "status": "success"
            }
        
        except Exception as e:
            logger.error(f"Safety reinforcement error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Safety reinforcement failed: {str(e)}")
    
    async def comprehensive_constitutional_safety_evaluation(
        self, 
        prompt: str, 
        response: str, 
        context: str = "general"
    ) -> Dict[str, Any]:
        """Comprehensive evaluation combining constitutional and safety assessment"""
        try:
            logger.info(f"Starting comprehensive constitutional safety evaluation for context: {context}")
            
            # Parallel evaluation of constitutional compliance and safety
            constitutional_task = self.evaluate_constitutional_compliance(response, context)
            safety_task = self.assess_response_safety(response, context)
            
            constitutional_result, safety_result = await asyncio.gather(
                constitutional_task, safety_task
            )
            
            # Combine evaluations
            constitutional_score = constitutional_result["constitutional_evaluation"]["overall_compliance"]
            safety_score = safety_result["safety_assessment"]["overall_safety_score"]
            
            # Calculate composite score (weighted combination)
            composite_score = (constitutional_score * 0.6) + (safety_score * 0.4)
            
            # Determine overall status
            overall_status = "excellent" if composite_score >= 0.9 else \
                           "good" if composite_score >= 0.8 else \
                           "acceptable" if composite_score >= 0.7 else \
                           "needs_improvement" if composite_score >= 0.6 else \
                           "critical"
            
            # Generate combined recommendations
            combined_recommendations = []
            combined_recommendations.extend(constitutional_result["constitutional_evaluation"]["improvement_suggestions"])
            combined_recommendations.extend(safety_result["safety_assessment"]["mitigation_suggestions"])
            
            # Remove duplicates while preserving order
            unique_recommendations = []
            for rec in combined_recommendations:
                if rec not in unique_recommendations:
                    unique_recommendations.append(rec)
            
            return {
                "comprehensive_evaluation": {
                    "prompt": prompt,
                    "response": response,
                    "context": context,
                    "composite_score": composite_score,
                    "overall_status": overall_status,
                    "constitutional_score": constitutional_score,
                    "safety_score": safety_score,
                    "combined_recommendations": unique_recommendations[:10]  # Top 10 recommendations
                },
                "detailed_analysis": {
                    "constitutional_details": constitutional_result["constitutional_evaluation"],
                    "safety_details": safety_result["safety_assessment"]
                },
                "action_required": {
                    "constitutional_revision": constitutional_score < 0.8,
                    "safety_reinforcement": safety_score < 0.8,
                    "human_review": safety_result["safety_assessment"]["requires_human_review"],
                    "immediate_attention": composite_score < 0.6
                },
                "evaluation_metadata": {
                    "evaluation_timestamp": datetime.now().isoformat(),
                    "evaluation_confidence": min(
                        constitutional_result["constitutional_evaluation"]["critique_confidence"],
                        safety_result["safety_assessment"]["assessment_confidence"]
                    )
                },
                "status": "success"
            }
        
        except Exception as e:
            logger.error(f"Comprehensive evaluation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Comprehensive evaluation failed: {str(e)}")
    
    async def run_constitutional_training_batch(
        self, 
        training_data: List[Dict[str, str]], 
        epochs: int = 1
    ) -> Dict[str, Any]:
        """Run batch constitutional training"""
        try:
            logger.info(f"Starting constitutional training batch: {len(training_data)} examples, {epochs} epochs")
            
            # Prepare training responses
            responses = [item.get("response", "") for item in training_data]
            
            # Run constitutional self-training
            training_results = await self.constitutional_ai.constitutional_self_training_loop(
                training_data=responses,
                epochs=epochs
            )
            
            return {
                "constitutional_training": {
                    "training_completed": True,
                    "examples_processed": training_results["total_examples_processed"],
                    "improvements_made": training_results["total_improvements_made"],
                    "compliance_improvement": training_results["average_compliance_improvement"],
                    "training_examples_generated": training_results["constitutional_training_examples"],
                    "epochs_completed": len(training_results["epoch_results"])
                },
                "training_details": training_results,
                "status": "success",
                "completion_timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Constitutional training error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Constitutional training failed: {str(e)}")
    
    async def run_safety_training_batch(
        self, 
        training_data: List[Dict[str, str]], 
        epochs: int = 1
    ) -> Dict[str, Any]:
        """Run batch safety reinforcement training"""
        try:
            logger.info(f"Starting safety training batch: {len(training_data)} examples, {epochs} epochs")
            
            # Run safety reinforcement training
            training_results = await self.safety_system.batch_safety_training(
                training_data=training_data,
                epochs=epochs
            )
            
            return {
                "safety_training": {
                    "training_completed": True,
                    "examples_processed": training_results["total_examples_processed"],
                    "safety_improvements": training_results["safety_improvements"],
                    "average_improvement": training_results["average_safety_improvement"],
                    "violations_prevented": training_results["violations_prevented"],
                    "training_examples_generated": training_results["training_examples_generated"],
                    "epochs_completed": training_results["epochs_completed"]
                },
                "training_details": training_results,
                "status": "success",
                "completion_timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Safety training error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Safety training failed: {str(e)}")
    
    def get_constitutional_performance_report(self) -> Dict[str, Any]:
        """Get comprehensive constitutional AI performance report"""
        try:
            # Get constitutional AI performance
            constitutional_report = self.constitutional_ai.get_constitutional_performance_report()
            
            # Get safety system performance
            safety_report = self.safety_system.get_safety_performance_report()
            
            # Get constitution summary
            constitution_summary = self.constitution.get_constitution_summary()
            
            return {
                "constitutional_ai_performance": constitutional_report,
                "safety_system_performance": safety_report,
                "constitution_framework": constitution_summary,
                "service_status": self.service_status,
                "integration_metrics": {
                    "total_constitutional_critiques": constitutional_report.get("constitutional_ai_performance", {}).get("total_critiques", 0),
                    "total_safety_assessments": safety_report.get("safety_performance", {}).get("total_assessments", 0),
                    "combined_training_examples": (
                        len(self.constitutional_ai.training_examples) + 
                        len(self.safety_system.training_history)
                    )
                },
                "report_timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Performance report error: {str(e)}")
            return {"error": f"Failed to generate performance report: {str(e)}"}
    
    def get_service_health(self) -> Dict[str, Any]:
        """Get service health status"""
        try:
            # Update health check timestamp
            self.service_status["last_health_check"] = datetime.now().isoformat()
            
            # Check component availability
            constitution_available = len(self.constitution.rules) > 0
            constitutional_ai_available = self.constitutional_ai is not None
            safety_system_available = self.safety_system is not None
            
            # Calculate overall health
            component_health = [
                constitution_available,
                constitutional_ai_available, 
                safety_system_available
            ]
            overall_health = sum(component_health) / len(component_health)
            
            health_status = "healthy" if overall_health == 1.0 else \
                           "degraded" if overall_health >= 0.7 else \
                           "unhealthy"
            
            return {
                "service": "Constitutional AI & Safety Training",
                "status": health_status,
                "overall_health": overall_health,
                "components": {
                    "constitutional_framework": "available" if constitution_available else "unavailable",
                    "constitutional_ai_system": "available" if constitutional_ai_available else "unavailable",
                    "safety_reinforcement_system": "available" if safety_system_available else "unavailable"
                },
                "capabilities": {
                    "constitutional_evaluation": constitution_available and constitutional_ai_available,
                    "constitutional_revision": constitution_available and constitutional_ai_available,
                    "safety_assessment": safety_system_available,
                    "safety_reinforcement": safety_system_available,
                    "batch_training": constitutional_ai_available and safety_system_available,
                    "performance_reporting": True
                },
                "metrics": {
                    "total_principles": len(self.constitution.rules),
                    "constitutional_critiques": len(self.constitutional_ai.critique_history),
                    "safety_assessments": self.safety_system.safety_metrics["total_assessments"],
                    "training_examples": len(self.constitutional_ai.training_examples) + len(self.safety_system.training_history)
                },
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Health check error: {str(e)}")
            return {
                "service": "Constitutional AI & Safety Training",
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# Global constitutional AI integration service
constitutional_ai_service = ConstitutionalAIService()
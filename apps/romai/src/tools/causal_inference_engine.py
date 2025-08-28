"""
ROMAI Causal Inference Engine
============================

Advanced causal reasoning module for ROMAI AGI system.
Handles cause-effect relationships, causal discovery, intervention modeling,
and counterfactual reasoning.

Author: ROMAI AGI Team
Date: 2025-01-17
Version: 1.0.0
"""

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import json


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CausalRelationType(Enum):
    """Types of causal relationships."""
    DIRECT_CAUSE = "direct_cause"
    INDIRECT_CAUSE = "indirect_cause"
    NECESSARY_CAUSE = "necessary_cause"
    SUFFICIENT_CAUSE = "sufficient_cause"
    CONTRIBUTORY_CAUSE = "contributory_cause"
    INHIBITORY_CAUSE = "inhibitory_cause"
    CONFOUNDING = "confounding"
    SPURIOUS = "spurious"


class CausalStrength(Enum):
    """Strength of causal relationships."""
    VERY_WEAK = "very_weak"     # 0.0-0.2
    WEAK = "weak"               # 0.2-0.4
    MODERATE = "moderate"       # 0.4-0.6
    STRONG = "strong"           # 0.6-0.8
    VERY_STRONG = "very_strong" # 0.8-1.0


class CausalDirection(Enum):
    """Direction of causal relationships."""
    FORWARD = "forward"         # A → B
    BACKWARD = "backward"       # A ← B
    BIDIRECTIONAL = "bidirectional"  # A ↔ B
    UNKNOWN = "unknown"


@dataclass
class CausalVariable:
    """Represents a variable in causal reasoning."""
    name: str
    value: Any
    variable_type: str  # 'continuous', 'categorical', 'binary', 'ordinal'
    description: Optional[str] = None
    domain: Optional[str] = None
    observed: bool = True
    variable_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    
    def __post_init__(self):
        """Post-initialization validation."""
        if self.variable_type not in ['continuous', 'categorical', 'binary', 'ordinal']:
            raise ValueError(f"Invalid variable_type: {self.variable_type}")


@dataclass
class CausalRelation:
    """Represents a causal relationship between variables."""
    cause: CausalVariable
    effect: CausalVariable
    relation_type: CausalRelationType
    strength: float  # 0.0 to 1.0
    direction: CausalDirection
    confidence: float = 0.0  # Confidence in the relationship
    evidence: List[str] = field(default_factory=list)
    mechanism: Optional[str] = None
    time_delay: Optional[float] = None  # Time between cause and effect
    relation_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Post-initialization validation."""
        if not (0.0 <= self.strength <= 1.0):
            raise ValueError(f"Strength must be between 0.0 and 1.0, got {self.strength}")
        if not (0.0 <= self.confidence <= 1.0):
            raise ValueError(f"Confidence must be between 0.0 and 1.0, got {self.confidence}")


@dataclass
class CausalModel:
    """Represents a complete causal model."""
    variables: List[CausalVariable]
    relations: List[CausalRelation]
    model_name: str
    description: Optional[str] = None
    assumptions: List[str] = field(default_factory=list)
    model_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    
    def get_variable_by_name(self, name: str) -> Optional[CausalVariable]:
        """Find a variable by name."""
        for var in self.variables:
            if var.name == name:
                return var
        return None
    
    def get_causes_of(self, variable_name: str) -> List[CausalRelation]:
        """Get all causal relations where the variable is an effect."""
        relations = []
        for relation in self.relations:
            if relation.effect.name == variable_name:
                relations.append(relation)
        return relations
    
    def get_effects_of(self, variable_name: str) -> List[CausalRelation]:
        """Get all causal relations where the variable is a cause."""
        relations = []
        for relation in self.relations:
            if relation.cause.name == variable_name:
                relations.append(relation)
        return relations


@dataclass
class CounterfactualQuery:
    """Represents a counterfactual reasoning query."""
    observed_scenario: Dict[str, Any]
    counterfactual_scenario: Dict[str, Any]
    target_variable: str
    query_description: str
    query_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])


@dataclass
class CounterfactualResult:
    """Result of counterfactual reasoning."""
    query: CounterfactualQuery
    original_outcome: Any
    counterfactual_outcome: Any
    probability_difference: float
    explanation: str
    confidence: float
    assumptions_used: List[str]
    result_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])


class CausalInferenceEngine:
    """
    Advanced causal inference engine for ROMAI AGI.
    
    Provides capabilities for:
    - Causal discovery from data and observations
    - Intervention modeling and effect prediction
    - Counterfactual reasoning
    - Causal model construction and validation
    - Integration with other reasoning systems
    """
    
    def __init__(self):
        """Initialize the causal inference engine."""
        self.models: Dict[str, CausalModel] = {}
        self.query_history: List[Dict[str, Any]] = []
        self.performance_stats = {
            "total_inferences": 0,
            "successful_inferences": 0,
            "models_created": 0,
            "counterfactual_queries": 0,
            "average_confidence": 0.0,
            "start_time": time.time()
        }
        
        # Initialize common causal patterns
        self._initialize_causal_patterns()
        
        logger.info("🔍 Causal Inference Engine initialized - Ready for causal reasoning!")
    
    def _initialize_causal_patterns(self):
        """Initialize common causal patterns for rapid recognition."""
        self.causal_patterns = {
            "temporal_precedence": {
                "description": "Cause must precede effect in time",
                "strength_modifier": 0.3,
                "keywords": ["before", "after", "then", "subsequently", "following"]
            },
            "correlation": {
                "description": "Statistical association between variables",
                "strength_modifier": 0.2,
                "keywords": ["correlation", "associated", "related", "linked"]
            },
            "mechanism": {
                "description": "Identifiable causal mechanism",
                "strength_modifier": 0.4,
                "keywords": ["because", "due to", "results in", "leads to", "causes"]
            },
            "intervention": {
                "description": "Experimental or natural intervention evidence",
                "strength_modifier": 0.5,
                "keywords": ["experiment", "treatment", "intervention", "manipulation"]
            },
            "dose_response": {
                "description": "Dose-response relationship",
                "strength_modifier": 0.3,
                "keywords": ["more", "less", "increase", "decrease", "dose", "amount"]
            }
        }
    
    async def discover_causal_relations(
        self, 
        text: str, 
        domain: str = "general",
        context: Optional[Dict[str, Any]] = None
    ) -> CausalModel:
        """
        Discover causal relationships from text or structured data.
        
        Args:
            text: Input text describing relationships or phenomena
            domain: Domain of the causal reasoning
            context: Additional context for discovery
            
        Returns:
            CausalModel with discovered relationships
        """
        logger.info(f"🔍 Discovering causal relations in domain: {domain}")
        
        start_time = time.time()
        model_name = f"discovered_model_{int(start_time)}"
        
        # Extract variables and relationships from text
        variables = await self._extract_variables(text, domain)
        relations = await self._extract_relations(text, variables, domain)
        
        # Create causal model
        model = CausalModel(
            variables=variables,
            relations=relations,
            model_name=model_name,
            description=f"Causal model discovered from: {text[:100]}...",
            assumptions=await self._identify_assumptions(text, domain)
        )
        
        # Store model
        self.models[model.model_id] = model
        
        # Update statistics
        self.performance_stats["models_created"] += 1
        self.performance_stats["total_inferences"] += 1
        self.performance_stats["successful_inferences"] += 1
        
        elapsed_time = time.time() - start_time
        logger.info(f"✅ Causal discovery completed: {model.model_id} ({elapsed_time:.2f}s)")
        logger.info(f"   Variables: {len(variables)}, Relations: {len(relations)}")
        
        return model
    
    async def _extract_variables(self, text: str, domain: str) -> List[CausalVariable]:
        """Extract causal variables from text."""
        variables = []
        
        # Common variable patterns by domain
        domain_patterns = {
            "medicine": ["symptom", "disease", "treatment", "outcome", "patient", "dose"],
            "economics": ["price", "demand", "supply", "income", "growth", "inflation"],
            "psychology": ["behavior", "attitude", "emotion", "cognition", "memory", "learning"],
            "physics": ["force", "velocity", "acceleration", "energy", "mass", "temperature"],
            "biology": ["gene", "protein", "cell", "organism", "environment", "evolution"],
            "general": ["factor", "cause", "effect", "outcome", "result", "influence"]
        }
        
        patterns = domain_patterns.get(domain, domain_patterns["general"])
        
        # Simple variable extraction (in production, use NLP)
        words = text.lower().split()
        found_vars = set()
        
        for word in words:
            # Check for domain-specific patterns
            for pattern in patterns:
                if pattern in word or word in pattern:
                    found_vars.add(word)
            
            # Check for common causal indicators
            if any(indicator in word for indicator in ["cause", "effect", "factor", "outcome"]):
                found_vars.add(word)
        
        # Create CausalVariable objects
        for i, var_name in enumerate(list(found_vars)[:10]):  # Limit to prevent explosion
            var_type = self._infer_variable_type(var_name, text)
            variables.append(CausalVariable(
                name=var_name,
                value=None,
                variable_type=var_type,
                description=f"Variable extracted from text in {domain} domain",
                domain=domain
            ))
        
        return variables
    
    async def _extract_relations(
        self, 
        text: str, 
        variables: List[CausalVariable], 
        domain: str
    ) -> List[CausalRelation]:
        """Extract causal relationships between variables."""
        relations = []
        
        if len(variables) < 2:
            return relations
        
        # Look for causal language patterns
        causal_indicators = {
            "causes": (CausalRelationType.DIRECT_CAUSE, 0.8),
            "leads to": (CausalRelationType.DIRECT_CAUSE, 0.7),
            "results in": (CausalRelationType.DIRECT_CAUSE, 0.7),
            "due to": (CausalRelationType.DIRECT_CAUSE, 0.6),
            "because of": (CausalRelationType.DIRECT_CAUSE, 0.6),
            "influences": (CausalRelationType.CONTRIBUTORY_CAUSE, 0.5),
            "affects": (CausalRelationType.CONTRIBUTORY_CAUSE, 0.5),
            "associated with": (CausalRelationType.CONTRIBUTORY_CAUSE, 0.3),
            "prevents": (CausalRelationType.INHIBITORY_CAUSE, 0.7),
            "blocks": (CausalRelationType.INHIBITORY_CAUSE, 0.6)
        }
        
        text_lower = text.lower()
        
        # Create relationships based on patterns
        for i, cause_var in enumerate(variables):
            for j, effect_var in enumerate(variables):
                if i == j:
                    continue
                
                # Check for causal language
                for indicator, (rel_type, base_strength) in causal_indicators.items():
                    if (cause_var.name in text_lower and 
                        effect_var.name in text_lower and 
                        indicator in text_lower):
                        
                        # Calculate confidence based on pattern recognition
                        confidence = self._calculate_relation_confidence(
                            text, cause_var.name, effect_var.name, indicator
                        )
                        
                        relations.append(CausalRelation(
                            cause=cause_var,
                            effect=effect_var,
                            relation_type=rel_type,
                            strength=base_strength,
                            direction=CausalDirection.FORWARD,
                            confidence=confidence,
                            evidence=[f"Textual pattern: '{indicator}'"],
                            mechanism=f"Inferred from pattern matching in {domain} domain"
                        ))
                        break
        
        return relations
    
    def _infer_variable_type(self, var_name: str, context: str) -> str:
        """Infer the type of a variable from its name and context."""
        var_name_lower = var_name.lower()
        
        # Binary indicators
        if any(word in var_name_lower for word in ["is", "has", "can", "will", "yes", "no"]):
            return "binary"
        
        # Categorical indicators
        if any(word in var_name_lower for word in ["type", "category", "kind", "class"]):
            return "categorical"
        
        # Ordinal indicators
        if any(word in var_name_lower for word in ["level", "grade", "rank", "score", "rating"]):
            return "ordinal"
        
        # Default to continuous for numeric-sounding variables
        if any(word in var_name_lower for word in ["amount", "count", "number", "size", "age", "time"]):
            return "continuous"
        
        return "categorical"  # Default fallback
    
    def _calculate_relation_confidence(
        self, 
        text: str, 
        cause: str, 
        effect: str, 
        indicator: str
    ) -> float:
        """Calculate confidence in a causal relationship."""
        base_confidence = 0.5
        
        # Boost confidence based on pattern strength
        if indicator in ["causes", "results in", "leads to"]:
            base_confidence += 0.3
        elif indicator in ["influences", "affects"]:
            base_confidence += 0.2
        elif indicator in ["associated with"]:
            base_confidence += 0.1
        
        # Check for temporal precedence
        text_lower = text.lower()
        cause_pos = text_lower.find(cause)
        effect_pos = text_lower.find(effect)
        
        if cause_pos >= 0 and effect_pos >= 0 and cause_pos < effect_pos:
            base_confidence += 0.1
        
        # Check for mechanism description
        mechanism_words = ["because", "through", "via", "by", "mechanism"]
        if any(word in text_lower for word in mechanism_words):
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)
    
    async def _identify_assumptions(self, text: str, domain: str) -> List[str]:
        """Identify assumptions made in causal discovery."""
        assumptions = [
            "Causal relationships inferred from textual patterns",
            "No hidden confounding variables assumed",
            "Temporal precedence implies causal precedence"
        ]
        
        # Add domain-specific assumptions
        domain_assumptions = {
            "medicine": ["Patient population is representative", "Treatment effects are consistent"],
            "economics": ["Market conditions remain stable", "External factors are controlled"],
            "physics": ["Ideal conditions assumed", "Measurement error is negligible"],
            "psychology": ["Individual differences are accounted for", "Context effects are minimal"]
        }
        
        if domain in domain_assumptions:
            assumptions.extend(domain_assumptions[domain])
        
        return assumptions
    
    async def predict_intervention_effect(
        self, 
        model: CausalModel, 
        intervention: Dict[str, Any],
        target_variable: str
    ) -> Dict[str, Any]:
        """
        Predict the effect of an intervention on a target variable.
        
        Args:
            model: Causal model to use for prediction
            intervention: Variables to intervene on and their new values
            target_variable: Variable to predict the effect on
            
        Returns:
            Prediction results with effect estimates
        """
        logger.info(f"🎯 Predicting intervention effect on {target_variable}")
        
        # Find target variable
        target_var = model.get_variable_by_name(target_variable)
        if not target_var:
            raise ValueError(f"Target variable {target_variable} not found in model")
        
        # Identify causal paths from intervention to target
        causal_paths = self._find_causal_paths(model, intervention, target_variable)
        
        # Calculate predicted effect
        predicted_effect = await self._calculate_intervention_effect(
            model, intervention, target_variable, causal_paths
        )
        
        # Update statistics
        self.performance_stats["total_inferences"] += 1
        if predicted_effect["confidence"] > 0.5:
            self.performance_stats["successful_inferences"] += 1
        
        result = {
            "intervention": intervention,
            "target_variable": target_variable,
            "predicted_effect": predicted_effect,
            "causal_paths": causal_paths,
            "model_id": model.model_id,
            "timestamp": datetime.now().isoformat()
        }
        
        self.query_history.append(result)
        logger.info(f"✅ Intervention prediction completed: {predicted_effect['effect_size']:.3f} effect")
        
        return result
    
    def _find_causal_paths(
        self, 
        model: CausalModel, 
        intervention: Dict[str, Any], 
        target: str
    ) -> List[List[str]]:
        """Find causal paths from intervention variables to target."""
        paths = []
        
        for intervention_var in intervention.keys():
            # Simple path finding (in production, use graph algorithms)
            direct_path = self._find_direct_path(model, intervention_var, target)
            if direct_path:
                paths.append(direct_path)
        
        return paths
    
    def _find_direct_path(self, model: CausalModel, start: str, target: str) -> Optional[List[str]]:
        """Find direct causal path between two variables."""
        # Check for direct relationship
        for relation in model.relations:
            if (relation.cause.name == start and 
                relation.effect.name == target):
                return [start, target]
        
        # Check for indirect relationship (one step)
        for relation1 in model.relations:
            if relation1.cause.name == start:
                intermediate = relation1.effect.name
                for relation2 in model.relations:
                    if (relation2.cause.name == intermediate and 
                        relation2.effect.name == target):
                        return [start, intermediate, target]
        
        return None
    
    async def _calculate_intervention_effect(
        self, 
        model: CausalModel, 
        intervention: Dict[str, Any], 
        target: str, 
        paths: List[List[str]]
    ) -> Dict[str, Any]:
        """Calculate the predicted effect of an intervention."""
        total_effect = 0.0
        max_confidence = 0.0
        mechanisms = []
        
        for path in paths:
            path_effect = 1.0
            path_confidence = 1.0
            
            # Calculate effect along path
            for i in range(len(path) - 1):
                cause_var = path[i]
                effect_var = path[i + 1]
                
                # Find relation
                relation = None
                for rel in model.relations:
                    if (rel.cause.name == cause_var and 
                        rel.effect.name == effect_var):
                        relation = rel
                        break
                
                if relation:
                    path_effect *= relation.strength
                    path_confidence *= relation.confidence
                    mechanisms.append(relation.mechanism or f"{cause_var} → {effect_var}")
            
            total_effect += path_effect
            max_confidence = max(max_confidence, path_confidence)
        
        # Normalize effect size
        effect_size = min(total_effect, 1.0)
        confidence = max_confidence
        
        return {
            "effect_size": effect_size,
            "confidence": confidence,
            "mechanisms": mechanisms,
            "explanation": f"Predicted effect size: {effect_size:.3f} with confidence: {confidence:.3f}"
        }
    
    async def counterfactual_reasoning(
        self, 
        model: CausalModel, 
        query: CounterfactualQuery
    ) -> CounterfactualResult:
        """
        Perform counterfactual reasoning using the causal model.
        
        Args:
            model: Causal model to use
            query: Counterfactual query specification
            
        Returns:
            Counterfactual reasoning result
        """
        logger.info(f"🤔 Performing counterfactual reasoning: {query.query_description}")
        
        # Predict original outcome
        original_prediction = await self._predict_outcome(
            model, query.observed_scenario, query.target_variable
        )
        
        # Predict counterfactual outcome
        counterfactual_prediction = await self._predict_outcome(
            model, query.counterfactual_scenario, query.target_variable
        )
        
        # Calculate difference
        probability_difference = abs(
            counterfactual_prediction["probability"] - 
            original_prediction["probability"]
        )
        
        # Generate explanation
        explanation = await self._generate_counterfactual_explanation(
            query, original_prediction, counterfactual_prediction
        )
        
        # Calculate confidence
        confidence = min(
            original_prediction["confidence"],
            counterfactual_prediction["confidence"]
        )
        
        result = CounterfactualResult(
            query=query,
            original_outcome=original_prediction["outcome"],
            counterfactual_outcome=counterfactual_prediction["outcome"],
            probability_difference=probability_difference,
            explanation=explanation,
            confidence=confidence,
            assumptions_used=model.assumptions
        )
        
        # Update statistics
        self.performance_stats["counterfactual_queries"] += 1
        
        logger.info(f"✅ Counterfactual reasoning completed: {probability_difference:.3f} difference")
        
        return result
    
    async def _predict_outcome(
        self, 
        model: CausalModel, 
        scenario: Dict[str, Any], 
        target_variable: str
    ) -> Dict[str, Any]:
        """Predict outcome for a given scenario."""
        # Simple outcome prediction (in production, use proper causal inference)
        base_probability = 0.5
        
        # Find relations affecting the target
        affecting_relations = model.get_causes_of(target_variable)
        
        total_influence = 0.0
        for relation in affecting_relations:
            cause_name = relation.cause.name
            if cause_name in scenario:
                # Simple linear influence model
                influence = relation.strength * relation.confidence
                if relation.relation_type == CausalRelationType.INHIBITORY_CAUSE:
                    influence = -influence
                total_influence += influence
        
        # Calculate probability
        probability = max(0.0, min(1.0, base_probability + (total_influence * 0.3)))
        
        return {
            "outcome": probability > 0.5,
            "probability": probability,
            "confidence": 0.7,  # Simplified confidence
            "influences": total_influence
        }
    
    async def _generate_counterfactual_explanation(
        self, 
        query: CounterfactualQuery, 
        original: Dict[str, Any], 
        counterfactual: Dict[str, Any]
    ) -> str:
        """Generate explanation for counterfactual reasoning."""
        diff = counterfactual["probability"] - original["probability"]
        
        if abs(diff) < 0.1:
            return f"The counterfactual scenario would have minimal impact on {query.target_variable} (change: {diff:.2f})"
        elif diff > 0:
            return f"The counterfactual scenario would increase the likelihood of {query.target_variable} by {diff:.2f}"
        else:
            return f"The counterfactual scenario would decrease the likelihood of {query.target_variable} by {abs(diff):.2f}"
    
    def get_model_statistics(self, model_id: str) -> Dict[str, Any]:
        """Get statistics for a specific causal model."""
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        
        model = self.models[model_id]
        
        # Calculate model statistics
        total_relations = len(model.relations)
        direct_causes = len([r for r in model.relations if r.relation_type == CausalRelationType.DIRECT_CAUSE])
        average_strength = sum(r.strength for r in model.relations) / max(total_relations, 1)
        average_confidence = sum(r.confidence for r in model.relations) / max(total_relations, 1)
        
        return {
            "model_id": model_id,
            "model_name": model.model_name,
            "total_variables": len(model.variables),
            "total_relations": total_relations,
            "direct_causes": direct_causes,
            "indirect_causes": total_relations - direct_causes,
            "average_strength": average_strength,
            "average_confidence": average_confidence,
            "created_at": model.created_at.isoformat(),
            "assumptions_count": len(model.assumptions)
        }
    
    def get_engine_statistics(self) -> Dict[str, Any]:
        """Get overall engine performance statistics."""
        current_time = time.time()
        uptime = current_time - self.performance_stats["start_time"]
        
        # Update average confidence
        if self.performance_stats["total_inferences"] > 0:
            # Simplified average calculation
            self.performance_stats["average_confidence"] = (
                self.performance_stats["successful_inferences"] / 
                self.performance_stats["total_inferences"]
            ) * 0.8  # Estimated average
        
        return {
            **self.performance_stats,
            "uptime_seconds": uptime,
            "models_stored": len(self.models),
            "query_history_size": len(self.query_history),
            "inferences_per_minute": (
                self.performance_stats["total_inferences"] / max(uptime / 60, 1)
            )
        }
    
    async def explain_causal_model(self, model_id: str) -> Dict[str, Any]:
        """Generate a comprehensive explanation of a causal model."""
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        
        model = self.models[model_id]
        
        # Generate explanation
        explanation = {
            "model_overview": {
                "name": model.model_name,
                "description": model.description,
                "variables_count": len(model.variables),
                "relations_count": len(model.relations)
            },
            "variables": [
                {
                    "name": var.name,
                    "type": var.variable_type,
                    "domain": var.domain,
                    "description": var.description
                }
                for var in model.variables
            ],
            "causal_structure": [],
            "key_insights": [],
            "assumptions": model.assumptions,
            "model_id": model_id
        }
        
        # Describe causal relationships
        for relation in model.relations:
            explanation["causal_structure"].append({
                "cause": relation.cause.name,
                "effect": relation.effect.name,
                "type": relation.relation_type.value,
                "strength": relation.strength,
                "confidence": relation.confidence,
                "mechanism": relation.mechanism,
                "evidence": relation.evidence
            })
        
        # Generate key insights
        strong_relations = [r for r in model.relations if r.strength > 0.7]
        explanation["key_insights"] = [
            f"Strong causal relationship: {r.cause.name} → {r.effect.name} (strength: {r.strength:.2f})"
            for r in strong_relations[:5]
        ]
        
        return explanation


async def main():
    """Demonstrate the causal inference engine."""
    logger.info("🧪 Testing ROMAI Causal Inference Engine")
    logger.info("=" * 50)
    
    # Initialize engine
    engine = CausalInferenceEngine()
    
    # Test causal discovery
    logger.info("Testing causal discovery...")
    text = "Smoking causes lung cancer. Exercise leads to better health. Stress affects sleep quality."
    model = await engine.discover_causal_relations(text, "health")
    
    # Test intervention prediction
    logger.info("Testing intervention prediction...")
    if model.variables:
        intervention = {model.variables[0].name: "high"}
        target = model.variables[-1].name if len(model.variables) > 1 else model.variables[0].name
        prediction = await engine.predict_intervention_effect(model, intervention, target)
        logger.info(f"Intervention effect: {prediction['predicted_effect']['effect_size']:.3f}")
    
    # Test counterfactual reasoning
    logger.info("Testing counterfactual reasoning...")
    query = CounterfactualQuery(
        observed_scenario={"smoking": "yes", "exercise": "no"},
        counterfactual_scenario={"smoking": "no", "exercise": "yes"},
        target_variable="health",
        query_description="What if the person didn't smoke and did exercise?"
    )
    result = await engine.counterfactual_reasoning(model, query)
    logger.info(f"Counterfactual effect: {result.probability_difference:.3f}")
    
    # Show statistics
    stats = engine.get_engine_statistics()
    model_stats = engine.get_model_statistics(model.model_id)
    
    logger.info("\n📊 Engine Statistics:")
    logger.info(f"   Total inferences: {stats['total_inferences']}")
    logger.info(f"   Success rate: {stats['successful_inferences']}/{stats['total_inferences']}")
    logger.info(f"   Models created: {stats['models_created']}")
    
    logger.info("\n📊 Model Statistics:")
    logger.info(f"   Variables: {model_stats['total_variables']}")
    logger.info(f"   Relations: {model_stats['total_relations']}")
    logger.info(f"   Average strength: {model_stats['average_strength']:.3f}")
    
    logger.info("\n✅ Causal Inference Engine test completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
"""
Unified Reasoning Coordinator for RomAI AGI System

This module implements the central coordinator that orchestrates hybrid neural-symbolic
reasoning by combining neural perception, symbolic knowledge, and bridging mechanisms
to deliver unified intelligent responses.

Based on Microsoft Azure AI best practices for hybrid reasoning systems and advanced
coordination patterns including multi-modal fusion, confidence calibration, and
explanation generation.
"""

import asyncio
import time
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import numpy as np
import torch

from neural_symbolic_types import (
    NeuralSymbolicMode, NeuralSymbolicState, HybridReasoningResult,
    NeuralPerception, SymbolicRepresentation, SymbolicFact, SymbolicRule,
    HybridReasoningEngine, NeuralSymbolicConfig, ConfidenceScore,
    NeuralSymbolicException, combine_confidences
)

from neural_perception_layer import NeuralPerceptionLayer
from symbolic_knowledge_layer import SymbolicKnowledgeLayer
from neural_symbolic_bridge import NeuralSymbolicBridgeImpl

logger = logging.getLogger(__name__)

class ReasoningStrategy(Enum):
    """Reasoning strategies for different problem types"""
    PERCEPTION_FIRST = "perception_first"      # Start with neural perception
    SYMBOLIC_FIRST = "symbolic_first"          # Start with symbolic reasoning
    PARALLEL = "parallel"                      # Process both simultaneously
    ITERATIVE = "iterative"                    # Alternate between approaches
    ADAPTIVE = "adaptive"                      # Choose based on problem characteristics

@dataclass
class ReasoningContext:
    """Context information for reasoning process"""
    problem_type: str = "general"
    domain: str = "unknown"
    complexity_level: int = 1  # 1-10 scale
    time_constraint: Optional[float] = None
    confidence_threshold: float = 0.5
    explanation_required: bool = True
    strategy_preference: Optional[ReasoningStrategy] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ReasoningStep:
    """Represents a single step in the reasoning process"""
    step_id: str
    step_type: str  # 'neural', 'symbolic', 'bridge', 'coordination'
    input_data: Any
    output_data: Any
    confidence: ConfidenceScore
    processing_time: float
    explanation: str
    metadata: Dict[str, Any] = field(default_factory=dict)

class ConfidenceCalibrator:
    """Calibrates and combines confidence scores from different sources"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.calibration_history: List[Dict[str, Any]] = []
        self.source_weights = {
            'neural': 0.4,
            'symbolic': 0.4,
            'bridge': 0.2
        }
        
    def calibrate_confidence(self, neural_conf: float, symbolic_conf: float, 
                           bridge_alignment: float, context: ReasoningContext) -> float:
        """Calibrate overall confidence from multiple sources"""
        try:
            # Base confidence combination
            confidences = [neural_conf, symbolic_conf, bridge_alignment]
            base_confidence = combine_confidences(confidences, self.config.confidence_combination_method)
            
            # Apply context-based adjustments
            adjusted_confidence = self._apply_context_adjustments(
                base_confidence, context, neural_conf, symbolic_conf, bridge_alignment
            )
            
            # Historical calibration (simple approach)
            calibrated_confidence = self._apply_historical_calibration(adjusted_confidence)
            
            # Record for future calibration
            self.calibration_history.append({
                'neural_conf': neural_conf,
                'symbolic_conf': symbolic_conf,
                'bridge_alignment': bridge_alignment,
                'base_confidence': base_confidence,
                'calibrated_confidence': calibrated_confidence,
                'context': context,
                'timestamp': time.time()
            })
            
            # Limit history size
            if len(self.calibration_history) > 1000:
                self.calibration_history = self.calibration_history[-500:]
            
            return max(0.0, min(1.0, calibrated_confidence))
            
        except Exception as e:
            logger.warning(f"Confidence calibration failed: {e}")
            return (neural_conf + symbolic_conf + bridge_alignment) / 3
    
    def _apply_context_adjustments(self, base_confidence: float, context: ReasoningContext,
                                 neural_conf: float, symbolic_conf: float, bridge_alignment: float) -> float:
        """Apply context-specific confidence adjustments"""
        adjustment = 0.0
        
        # Problem type adjustments
        if context.problem_type == "mathematical":
            # Symbolic reasoning is more reliable for math
            if symbolic_conf > neural_conf:
                adjustment += 0.1
        elif context.problem_type == "linguistic":
            # Neural perception is more reliable for language
            if neural_conf > symbolic_conf:
                adjustment += 0.1
        
        # Complexity adjustments
        if context.complexity_level > 7:
            # High complexity problems are less certain
            adjustment -= 0.1
        elif context.complexity_level < 3:
            # Simple problems should have higher confidence
            adjustment += 0.05
        
        # Alignment adjustments
        if bridge_alignment > 0.8:
            # High alignment increases confidence
            adjustment += 0.05
        elif bridge_alignment < 0.4:
            # Low alignment decreases confidence
            adjustment -= 0.1
        
        return base_confidence + adjustment
    
    def _apply_historical_calibration(self, confidence: float) -> float:
        """Apply historical calibration based on past performance"""
        if len(self.calibration_history) < 10:
            return confidence  # Not enough history
        
        # Simple recency-weighted average adjustment
        recent_history = self.calibration_history[-20:]  # Last 20 entries
        
        # Calculate average historical adjustment
        adjustments = []
        for entry in recent_history:
            # This would compare against actual outcomes in a real system
            # For now, use a simple heuristic
            expected_vs_actual = 0.0  # Placeholder
            adjustments.append(expected_vs_actual)
        
        if adjustments:
            avg_adjustment = sum(adjustments) / len(adjustments)
            return confidence + (avg_adjustment * 0.1)  # Small adjustment
        
        return confidence

class ExplanationGenerator:
    """Generates human-readable explanations for reasoning processes"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        
    def generate_explanation(self, reasoning_result: HybridReasoningResult,
                           reasoning_steps: List[ReasoningStep],
                           context: ReasoningContext) -> str:
        """Generate comprehensive explanation of reasoning process"""
        try:
            explanation_parts = [
                "## Reasoning Explanation\n",
                self._explain_problem_analysis(reasoning_result, context),
                self._explain_reasoning_process(reasoning_steps),
                self._explain_evidence(reasoning_result.evidence),
                self._explain_confidence(reasoning_result),
                self._explain_conclusion(reasoning_result)
            ]
            
            return "\n\n".join(explanation_parts)
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            return f"Reasoning completed with result: {reasoning_result.combined_result}"
    
    def _explain_problem_analysis(self, result: HybridReasoningResult, context: ReasoningContext) -> str:
        """Explain how the problem was analyzed"""
        return f"""**Problem Analysis:**
- Problem Type: {context.problem_type}
- Domain: {context.domain}
- Complexity Level: {context.complexity_level}/10
- Processing Approach: Neural + Symbolic Hybrid Reasoning"""
    
    def _explain_reasoning_process(self, steps: List[ReasoningStep]) -> str:
        """Explain the reasoning process steps"""
        explanation = "**Reasoning Process:**\n"
        
        for i, step in enumerate(steps, 1):
            explanation += f"{i}. **{step.step_type.title()} Processing** ({step.processing_time:.3f}s)\n"
            explanation += f"   - {step.explanation}\n"
            explanation += f"   - Confidence: {step.confidence:.3f}\n"
        
        return explanation
    
    def _explain_evidence(self, evidence: List[Any]) -> str:
        """Explain the evidence supporting the conclusion"""
        if not evidence:
            return "**Evidence:** No specific evidence items recorded."
        
        explanation = "**Supporting Evidence:**\n"
        
        for i, item in enumerate(evidence[:5], 1):  # Limit to top 5
            if hasattr(item, 'subject') and hasattr(item, 'predicate'):
                # Symbolic fact
                explanation += f"{i}. {item.subject} {item.predicate} {item.object} (confidence: {item.confidence:.3f})\n"
            else:
                # Neural evidence or other
                explanation += f"{i}. Neural pattern evidence (strength: varies)\n"
        
        if len(evidence) > 5:
            explanation += f"... and {len(evidence) - 5} additional evidence items.\n"
        
        return explanation
    
    def _explain_confidence(self, result: HybridReasoningResult) -> str:
        """Explain confidence assessment"""
        return f"""**Confidence Assessment:**
- Neural Confidence: {result.neural_confidence:.3f}
- Symbolic Confidence: {result.symbolic_confidence:.3f}
- Combined Confidence: {result.combined_confidence:.3f}
- Confidence Interpretation: {self._interpret_confidence(result.combined_confidence)}"""
    
    def _explain_conclusion(self, result: HybridReasoningResult) -> str:
        """Explain the final conclusion"""
        return f"""**Conclusion:**
{result.explanation}

**Final Result:** {result.combined_result}"""
    
    def _interpret_confidence(self, confidence: float) -> str:
        """Interpret confidence score in human terms"""
        if confidence >= 0.9:
            return "Very High - Result is highly reliable"
        elif confidence >= 0.75:
            return "High - Result is quite reliable"
        elif confidence >= 0.6:
            return "Moderate - Result is reasonably reliable"
        elif confidence >= 0.4:
            return "Low - Result has significant uncertainty"
        else:
            return "Very Low - Result is highly uncertain"

class UnifiedReasoningCoordinator(HybridReasoningEngine):
    """Main coordinator for unified neural-symbolic reasoning"""
    
    def __init__(self, config: Optional[NeuralSymbolicConfig] = None):
        if config is None:
            config = NeuralSymbolicConfig()
        
        self.config = config
        
        # Initialize components
        self.neural_perception = NeuralPerceptionLayer(config)
        self.symbolic_knowledge = SymbolicKnowledgeLayer(config)
        self.neural_symbolic_bridge = NeuralSymbolicBridgeImpl(config)
        self.confidence_calibrator = ConfidenceCalibrator(config)
        self.explanation_generator = ExplanationGenerator(config)
        
        # Reasoning state
        self.current_state: Optional[NeuralSymbolicState] = None
        self.reasoning_history: List[HybridReasoningResult] = []
        
        # Performance tracking
        self.performance_stats = {
            'total_problems': 0,
            'successful_solutions': 0,
            'average_processing_time': 0.0,
            'average_confidence': 0.0
        }
        
        logger.info("Unified Reasoning Coordinator initialized")
    
    async def hybrid_reason(self, problem: str, mode: NeuralSymbolicMode) -> HybridReasoningResult:
        """Perform hybrid reasoning combining neural and symbolic approaches"""
        start_time = time.time()
        reasoning_steps: List[ReasoningStep] = []
        
        try:
            # Analyze problem context
            context = self._analyze_problem_context(problem)
            
            # Choose reasoning strategy
            strategy = self._choose_reasoning_strategy(mode, context)
            
            # Execute reasoning based on strategy
            if strategy == ReasoningStrategy.PARALLEL:
                result = await self._parallel_reasoning(problem, context, reasoning_steps)
            elif strategy == ReasoningStrategy.PERCEPTION_FIRST:
                result = await self._perception_first_reasoning(problem, context, reasoning_steps)
            elif strategy == ReasoningStrategy.SYMBOLIC_FIRST:
                result = await self._symbolic_first_reasoning(problem, context, reasoning_steps)
            elif strategy == ReasoningStrategy.ITERATIVE:
                result = await self._iterative_reasoning(problem, context, reasoning_steps)
            else:  # ADAPTIVE
                result = await self._adaptive_reasoning(problem, context, reasoning_steps)
            
            # Generate explanation if required
            if context.explanation_required:
                detailed_explanation = self.explanation_generator.generate_explanation(
                    result, reasoning_steps, context
                )
                result.explanation = detailed_explanation
            
            # Update performance statistics
            self._update_performance_stats(result, time.time() - start_time)
            
            # Store in history
            self.reasoning_history.append(result)
            if len(self.reasoning_history) > 100:  # Limit history
                self.reasoning_history = self.reasoning_history[-50:]
            
            logger.info(f"Hybrid reasoning completed in {result.processing_time:.3f}s with confidence {result.combined_confidence:.3f}")
            return result
            
        except Exception as e:
            logger.error(f"Hybrid reasoning failed: {e}")
            raise NeuralSymbolicException(f"Hybrid reasoning failed: {e}")
    
    async def adaptive_reasoning(self, problem: str) -> HybridReasoningResult:
        """Automatically choose optimal reasoning approach"""
        return await self.hybrid_reason(problem, NeuralSymbolicMode.ADAPTIVE)
    
    async def generate_explanation(self, result: HybridReasoningResult) -> str:
        """Generate human-readable explanation of reasoning process"""
        return result.explanation if result.explanation else "No explanation available"
    
    async def _parallel_reasoning(self, problem: str, context: ReasoningContext,
                                reasoning_steps: List[ReasoningStep]) -> HybridReasoningResult:
        """Execute neural and symbolic reasoning in parallel"""
        # Start both processes simultaneously
        neural_task = self._neural_reasoning_step(problem, reasoning_steps)
        symbolic_task = self._symbolic_reasoning_step(problem, reasoning_steps)
        
        # Wait for both to complete
        neural_result, symbolic_result = await asyncio.gather(neural_task, symbolic_task)
        
        # Bridge the representations
        bridge_result = await self._bridge_reasoning_step(neural_result, symbolic_result, reasoning_steps)
        
        # Combine results
        return await self._combine_results(neural_result, symbolic_result, bridge_result, context, reasoning_steps)
    
    async def _perception_first_reasoning(self, problem: str, context: ReasoningContext,
                                        reasoning_steps: List[ReasoningStep]) -> HybridReasoningResult:
        """Execute neural perception first, then symbolic reasoning"""
        # Neural perception
        neural_result = await self._neural_reasoning_step(problem, reasoning_steps)
        
        # Convert to symbolic representation
        symbolic_repr = await self.neural_symbolic_bridge.neural_to_symbolic(neural_result)
        
        # Symbolic reasoning on converted representation
        symbolic_facts = await self.symbolic_knowledge.reason(symbolic_repr.facts, [])
        
        # Create symbolic result
        symbolic_result = SymbolicRepresentation(
            symbols=symbolic_repr.symbols,
            facts=symbolic_facts,
            rules=[],
            relationships=symbolic_repr.relationships,
            confidence=min([f.confidence for f in symbolic_facts], default=0.5),
            metadata={'source': 'perception_first_symbolic'}
        )
        
        # Bridge results
        bridge_result = await self._bridge_reasoning_step(neural_result, symbolic_result, reasoning_steps)
        
        return await self._combine_results(neural_result, symbolic_result, bridge_result, context, reasoning_steps)
    
    async def _symbolic_first_reasoning(self, problem: str, context: ReasoningContext,
                                      reasoning_steps: List[ReasoningStep]) -> HybridReasoningResult:
        """Execute symbolic reasoning first, then neural perception"""
        # Try to extract symbolic facts from problem
        symbolic_result = await self._symbolic_reasoning_step(problem, reasoning_steps)
        
        # Convert to neural representation
        neural_embedding = await self.neural_symbolic_bridge.symbolic_to_neural(symbolic_result)
        
        # Create enhanced neural perception
        neural_result = NeuralPerception(
            raw_input=problem,
            embeddings=neural_embedding,
            features={'symbolic_derived': True},
            confidence=symbolic_result.confidence,
            processing_time=0.0,
            metadata={'source': 'symbolic_first_neural'}
        )
        
        # Bridge results
        bridge_result = await self._bridge_reasoning_step(neural_result, symbolic_result, reasoning_steps)
        
        return await self._combine_results(neural_result, symbolic_result, bridge_result, context, reasoning_steps)
    
    async def _iterative_reasoning(self, problem: str, context: ReasoningContext,
                                 reasoning_steps: List[ReasoningStep]) -> HybridReasoningResult:
        """Alternate between neural and symbolic reasoning"""
        max_iterations = min(5, context.complexity_level)
        
        # Initial neural processing
        current_neural = await self._neural_reasoning_step(problem, reasoning_steps)
        current_symbolic = None
        
        for iteration in range(max_iterations):
            # Convert neural to symbolic
            if current_neural:
                current_symbolic = await self.neural_symbolic_bridge.neural_to_symbolic(current_neural)
            
            # Symbolic reasoning
            current_symbolic = await self._symbolic_reasoning_step(
                str(current_symbolic) if current_symbolic else problem, reasoning_steps
            )
            
            # Convert back to neural
            neural_embedding = await self.neural_symbolic_bridge.symbolic_to_neural(current_symbolic)
            current_neural = NeuralPerception(
                raw_input=problem,
                embeddings=neural_embedding,
                features={'iteration': iteration},
                confidence=current_symbolic.confidence,
                processing_time=0.0
            )
            
            # Check for convergence
            if iteration > 0:
                alignment = await self.neural_symbolic_bridge.align_representations(
                    current_neural, current_symbolic
                )
                if alignment > 0.9:  # High alignment, converged
                    break
        
        # Final bridge
        bridge_result = await self._bridge_reasoning_step(current_neural, current_symbolic, reasoning_steps)
        
        return await self._combine_results(current_neural, current_symbolic, bridge_result, context, reasoning_steps)
    
    async def _adaptive_reasoning(self, problem: str, context: ReasoningContext,
                                reasoning_steps: List[ReasoningStep]) -> HybridReasoningResult:
        """Choose optimal reasoning strategy based on problem characteristics"""
        # Analyze problem to choose strategy
        if context.problem_type in ["mathematical", "logical"]:
            return await self._symbolic_first_reasoning(problem, context, reasoning_steps)
        elif context.problem_type in ["linguistic", "creative"]:
            return await self._perception_first_reasoning(problem, context, reasoning_steps)
        elif context.complexity_level > 6:
            return await self._iterative_reasoning(problem, context, reasoning_steps)
        else:
            return await self._parallel_reasoning(problem, context, reasoning_steps)
    
    async def _neural_reasoning_step(self, problem: str, reasoning_steps: List[ReasoningStep]) -> NeuralPerception:
        """Execute neural reasoning step"""
        start_time = time.time()
        
        try:
            result = await self.neural_perception.perceive(problem)
            
            step = ReasoningStep(
                step_id=f"neural_{len(reasoning_steps)}",
                step_type="neural",
                input_data=problem,
                output_data=result,
                confidence=result.confidence,
                processing_time=time.time() - start_time,
                explanation=f"Processed input through neural perception, extracted {len(result.features)} feature types"
            )
            reasoning_steps.append(step)
            
            return result
            
        except Exception as e:
            logger.error(f"Neural reasoning step failed: {e}")
            raise
    
    async def _symbolic_reasoning_step(self, problem: str, reasoning_steps: List[ReasoningStep]) -> SymbolicRepresentation:
        """Execute symbolic reasoning step"""
        start_time = time.time()
        
        try:
            # Convert problem to symbolic representation (simplified)
            patterns = self.neural_symbolic_bridge.pattern_extractor.extract_patterns(problem)
            
            facts = []
            for pattern in patterns:
                fact = self.neural_symbolic_bridge._pattern_to_fact(pattern)
                if fact:
                    facts.append(fact)
                    self.symbolic_knowledge.knowledge_base.add_fact(fact)
            
            # Apply symbolic reasoning
            if facts:
                new_facts = await self.symbolic_knowledge.reason(facts, [])
                all_facts = facts + new_facts
            else:
                all_facts = facts
            
            result = SymbolicRepresentation(
                symbols=self.neural_symbolic_bridge._extract_symbols(problem),
                facts=all_facts,
                rules=[],
                relationships={},
                confidence=min([f.confidence for f in all_facts], default=0.5) if all_facts else 0.3,
                metadata={'patterns_found': len(patterns)}
            )
            
            step = ReasoningStep(
                step_id=f"symbolic_{len(reasoning_steps)}",
                step_type="symbolic",
                input_data=problem,
                output_data=result,
                confidence=result.confidence,
                processing_time=time.time() - start_time,
                explanation=f"Extracted {len(patterns)} patterns and derived {len(all_facts)} symbolic facts"
            )
            reasoning_steps.append(step)
            
            return result
            
        except Exception as e:
            logger.error(f"Symbolic reasoning step failed: {e}")
            raise
    
    async def _bridge_reasoning_step(self, neural_result: NeuralPerception,
                                   symbolic_result: SymbolicRepresentation,
                                   reasoning_steps: List[ReasoningStep]) -> float:
        """Execute bridge reasoning step"""
        start_time = time.time()
        
        try:
            alignment = await self.neural_symbolic_bridge.align_representations(
                neural_result, symbolic_result
            )
            
            step = ReasoningStep(
                step_id=f"bridge_{len(reasoning_steps)}",
                step_type="bridge",
                input_data=(neural_result, symbolic_result),
                output_data=alignment,
                confidence=alignment,
                processing_time=time.time() - start_time,
                explanation=f"Aligned neural and symbolic representations with score {alignment:.3f}"
            )
            reasoning_steps.append(step)
            
            return alignment
            
        except Exception as e:
            logger.error(f"Bridge reasoning step failed: {e}")
            return 0.5  # Default alignment
    
    async def _combine_results(self, neural_result: NeuralPerception,
                             symbolic_result: SymbolicRepresentation,
                             bridge_alignment: float,
                             context: ReasoningContext,
                             reasoning_steps: List[ReasoningStep]) -> HybridReasoningResult:
        """Combine results from different reasoning approaches"""
        start_time = time.time()
        
        try:
            # Determine primary result based on confidence and alignment
            if neural_result.confidence > symbolic_result.confidence and bridge_alignment > 0.6:
                primary_result = self._interpret_neural_result(neural_result)
                primary_confidence = neural_result.confidence
            elif symbolic_result.confidence > 0.5:
                primary_result = self._interpret_symbolic_result(symbolic_result)
                primary_confidence = symbolic_result.confidence
            else:
                # Fallback to neural if both are uncertain
                primary_result = self._interpret_neural_result(neural_result)
                primary_confidence = neural_result.confidence
            
            # Calibrate overall confidence
            combined_confidence = self.confidence_calibrator.calibrate_confidence(
                neural_result.confidence,
                symbolic_result.confidence,
                bridge_alignment,
                context
            )
            
            # Gather evidence
            evidence = []
            evidence.extend(symbolic_result.facts[:5])  # Top symbolic facts
            evidence.append(neural_result.embeddings)    # Neural representation
            
            # Create reasoning path
            reasoning_path = [step.explanation for step in reasoning_steps]
            
            result = HybridReasoningResult(
                neural_result=neural_result,
                symbolic_result=symbolic_result,
                combined_result=primary_result,
                neural_confidence=neural_result.confidence,
                symbolic_confidence=symbolic_result.confidence,
                combined_confidence=combined_confidence,
                reasoning_path=reasoning_path,
                explanation="",  # Will be filled by explanation generator
                evidence=evidence,
                processing_time=time.time() - start_time,
                metadata={
                    'bridge_alignment': bridge_alignment,
                    'strategy_used': context.strategy_preference,
                    'reasoning_steps': len(reasoning_steps)
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Result combination failed: {e}")
            raise
    
    def _analyze_problem_context(self, problem: str) -> ReasoningContext:
        """Analyze problem to determine context and approach"""
        context = ReasoningContext()
        
        # Simple problem type detection
        problem_lower = problem.lower()
        
        if any(word in problem_lower for word in ['calculate', 'solve', '+', '-', '*', '/', '=', 'equation']):
            context.problem_type = "mathematical"
            context.complexity_level = min(8, len(problem.split()) // 3 + 1)
        elif any(word in problem_lower for word in ['if', 'then', 'all', 'some', 'every', 'logic']):
            context.problem_type = "logical"
            context.complexity_level = min(7, len(problem.split()) // 4 + 2)
        elif any(word in problem_lower for word in ['what', 'why', 'how', 'explain', 'describe']):
            context.problem_type = "linguistic"
            context.complexity_level = min(6, len(problem.split()) // 5 + 1)
        else:
            context.problem_type = "general"
            context.complexity_level = min(5, len(problem.split()) // 6 + 1)
        
        return context
    
    def _choose_reasoning_strategy(self, mode: NeuralSymbolicMode, context: ReasoningContext) -> ReasoningStrategy:
        """Choose reasoning strategy based on mode and context"""
        if mode == NeuralSymbolicMode.NEURAL_ONLY:
            return ReasoningStrategy.PERCEPTION_FIRST
        elif mode == NeuralSymbolicMode.SYMBOLIC_ONLY:
            return ReasoningStrategy.SYMBOLIC_FIRST
        elif mode == NeuralSymbolicMode.HYBRID:
            return ReasoningStrategy.PARALLEL
        else:  # ADAPTIVE
            return ReasoningStrategy.ADAPTIVE
    
    def _interpret_neural_result(self, neural_result: NeuralPerception) -> str:
        """Interpret neural perception result"""
        features = neural_result.features
        
        if 'patterns' in features:
            dominant_pattern = features['patterns'].get('dominant_pattern', 'unknown')
            return f"Neural analysis detected {dominant_pattern} patterns in the input"
        else:
            return f"Neural processing completed with {neural_result.confidence:.1%} confidence"
    
    def _interpret_symbolic_result(self, symbolic_result: SymbolicRepresentation) -> str:
        """Interpret symbolic reasoning result"""
        if symbolic_result.facts:
            # Return most confident fact as primary result
            best_fact = max(symbolic_result.facts, key=lambda f: f.confidence)
            return f"{best_fact.subject} {best_fact.predicate} {best_fact.object}"
        else:
            return "Symbolic analysis found no definitive conclusions"
    
    def _update_performance_stats(self, result: HybridReasoningResult, processing_time: float):
        """Update performance statistics"""
        self.performance_stats['total_problems'] += 1
        
        if result.combined_confidence > 0.5:  # Consider successful if confidence > 0.5
            self.performance_stats['successful_solutions'] += 1
        
        # Running average of processing time
        total = self.performance_stats['total_problems']
        current_avg = self.performance_stats['average_processing_time']
        self.performance_stats['average_processing_time'] = (
            (current_avg * (total - 1) + processing_time) / total
        )
        
        # Running average of confidence
        current_avg_conf = self.performance_stats['average_confidence']
        self.performance_stats['average_confidence'] = (
            (current_avg_conf * (total - 1) + result.combined_confidence) / total
        )
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        total = self.performance_stats['total_problems']
        success_rate = (self.performance_stats['successful_solutions'] / total) if total > 0 else 0.0
        
        return {
            **self.performance_stats,
            'success_rate': success_rate,
            'reasoning_history_size': len(self.reasoning_history)
        }

# Factory function for easy instantiation
def create_unified_reasoning_coordinator(config: Optional[NeuralSymbolicConfig] = None) -> UnifiedReasoningCoordinator:
    """Create a unified reasoning coordinator with optional configuration"""
    return UnifiedReasoningCoordinator(config)

# Example usage and testing
async def test_unified_reasoning():
    """Test the unified reasoning coordinator"""
    config = NeuralSymbolicConfig(
        embedding_dim=256,
        attention_heads=8,
        neural_layers=3,
        reasoning_depth=5,
        verbose_logging=True
    )
    
    coordinator = create_unified_reasoning_coordinator(config)
    
    # Test problems
    test_problems = [
        "What is 15 + 27?",
        "If all birds can fly and penguins are birds, can penguins fly?",
        "Explain the concept of machine learning",
        "If it rains, the ground gets wet. It is raining. What happens to the ground?"
    ]
    
    print("\n=== Testing Unified Reasoning Coordinator ===")
    
    for problem in test_problems:
        print(f"\n🧠 Problem: {problem}")
        
        try:
            # Test different reasoning modes
            for mode in [NeuralSymbolicMode.HYBRID, NeuralSymbolicMode.ADAPTIVE]:
                print(f"\n  Mode: {mode.value}")
                
                result = await coordinator.hybrid_reason(problem, mode)
                
                print(f"  Result: {result.combined_result}")
                print(f"  Confidence: {result.combined_confidence:.3f}")
                print(f"  Processing Time: {result.processing_time:.3f}s")
                print(f"  Reasoning Steps: {len(result.reasoning_path)}")
                
                if result.explanation:
                    print(f"  Explanation Preview: {result.explanation[:200]}...")
                
                break  # Just test first mode for brevity
                
        except Exception as e:
            print(f"  Error: {e}")
    
    # Show performance statistics
    stats = coordinator.get_performance_stats()
    print(f"\n📊 Performance Statistics:")
    for key, value in stats.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.3f}")
        else:
            print(f"  {key}: {value}")

if __name__ == "__main__":
    # Run test
    asyncio.run(test_unified_reasoning())
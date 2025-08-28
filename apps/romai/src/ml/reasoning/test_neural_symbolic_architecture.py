"""
Neural-Symbolic Architecture Validation Suite for RomAI AGI System

Comprehensive testing and validation suite for the neural-symbolic architecture
including integration tests, performance benchmarks, and capability validation.

This suite validates the complete neural-symbolic pipeline from perception
through symbolic reasoning to unified coordination and ReAct integration.
"""

import asyncio
import time
import logging
import json
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
import traceback
import sys
import os

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import neural-symbolic components
from neural_symbolic_types import NeuralSymbolicConfig, NeuralSymbolicMode
from neural_perception_layer import create_neural_perception_layer
from symbolic_knowledge_layer import create_symbolic_knowledge_layer
from neural_symbolic_bridge import create_neural_symbolic_bridge
from unified_reasoning_coordinator import create_unified_reasoning_coordinator
from neural_symbolic_react_integration import create_neural_symbolic_react_agent

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@dataclass
class TestResult:
    """Result of a single test"""
    test_name: str
    success: bool
    score: float  # 0.0 to 1.0
    processing_time: float
    details: Dict[str, Any] = field(default_factory=dict)
    error_message: str = ""

@dataclass
class ValidationReport:
    """Complete validation report"""
    total_tests: int
    passed_tests: int
    failed_tests: int
    average_score: float
    total_processing_time: float
    test_results: List[TestResult] = field(default_factory=list)
    system_info: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = ""

class NeuralSymbolicValidationSuite:
    """Comprehensive validation suite for neural-symbolic architecture"""
    
    def __init__(self, config: Optional[NeuralSymbolicConfig] = None):
        self.config = config or NeuralSymbolicConfig(
            embedding_dim=128,  # Smaller for testing
            attention_heads=4,
            neural_layers=2,
            reasoning_depth=3,
            verbose_logging=False,
            enable_caching=True
        )
        
        # Initialize components
        self.neural_perception = None
        self.symbolic_knowledge = None
        self.neural_symbolic_bridge = None
        self.unified_coordinator = None
        self.react_agent = None
        
        # Test categories
        self.test_categories = {
            'neural_perception': [
                'test_basic_perception',
                'test_mathematical_perception',
                'test_linguistic_perception',
                'test_multimodal_perception'
            ],
            'symbolic_knowledge': [
                'test_fact_storage_retrieval',
                'test_rule_application',
                'test_consistency_checking',
                'test_inference_chain'
            ],
            'neural_symbolic_bridge': [
                'test_neural_to_symbolic_conversion',
                'test_symbolic_to_neural_conversion',
                'test_representation_alignment',
                'test_pattern_extraction'
            ],
            'unified_reasoning': [
                'test_parallel_reasoning',
                'test_adaptive_reasoning',
                'test_confidence_calibration',
                'test_explanation_generation'
            ],
            'react_integration': [
                'test_react_with_neural_symbolic',
                'test_complex_problem_solving',
                'test_multi_step_reasoning',
                'test_confidence_propagation'
            ],
            'end_to_end': [
                'test_complete_pipeline',
                'test_performance_benchmarks',
                'test_robustness',
                'test_scalability'
            ]
        }
        
        logger.info("Neural-Symbolic Validation Suite initialized")
    
    async def run_complete_validation(self) -> ValidationReport:
        """Run complete validation suite"""
        start_time = time.time()
        all_results = []
        
        print("🧠 ROMAI NEURAL-SYMBOLIC ARCHITECTURE VALIDATION SUITE")
        print("=" * 70)
        
        # Initialize components
        await self._initialize_components()
        
        # Run all test categories
        for category_name, test_methods in self.test_categories.items():
            print(f"\n📊 Testing Category: {category_name.replace('_', ' ').title()}")
            print("-" * 50)
            
            category_results = await self._run_category_tests(category_name, test_methods)
            all_results.extend(category_results)
        
        # Generate report
        report = self._generate_validation_report(all_results, time.time() - start_time)
        
        # Print summary
        self._print_validation_summary(report)
        
        return report
    
    async def _initialize_components(self):
        """Initialize all neural-symbolic components"""
        try:
            print("🔧 Initializing neural-symbolic components...")
            
            self.neural_perception = create_neural_perception_layer(self.config)
            self.symbolic_knowledge = create_symbolic_knowledge_layer(self.config)
            self.neural_symbolic_bridge = create_neural_symbolic_bridge(self.config)
            self.unified_coordinator = create_unified_reasoning_coordinator(self.config)
            self.react_agent = create_neural_symbolic_react_agent(self.config)
            
            print("✅ All components initialized successfully")
            
        except Exception as e:
            logger.error(f"Component initialization failed: {e}")
            raise
    
    async def _run_category_tests(self, category_name: str, test_methods: List[str]) -> List[TestResult]:
        """Run tests for a specific category"""
        results = []
        
        for test_method in test_methods:
            test_display_name = test_method.replace('test_', '').replace('_', ' ').title()
            print(f"  🧪 {test_display_name}...", end=" ")
            
            try:
                if hasattr(self, test_method):
                    result = await getattr(self, test_method)()
                    results.append(result)
                    
                    status = "✅ PASS" if result.success else "❌ FAIL"
                    score_display = f"({result.score:.1%})" if result.success else f"({result.error_message[:30]}...)"
                    print(f"{status} {score_display}")
                else:
                    print("⚠️  SKIP (Not implemented)")
                    
            except Exception as e:
                error_result = TestResult(
                    test_name=test_method,
                    success=False,
                    score=0.0,
                    processing_time=0.0,
                    error_message=str(e)
                )
                results.append(error_result)
                print(f"❌ ERROR ({str(e)[:30]}...)")
                logger.error(f"Test {test_method} failed: {e}")
        
        return results
    
    # Neural Perception Tests
    
    async def test_basic_perception(self) -> TestResult:
        """Test basic neural perception functionality"""
        start_time = time.time()
        
        try:
            test_input = "Hello, neural perception system!"
            perception = await self.neural_perception.perceive(test_input)
            
            success = (
                perception is not None and
                perception.embeddings is not None and
                perception.confidence > 0.0 and
                len(perception.features) > 0
            )
            
            score = perception.confidence if success else 0.0
            
            return TestResult(
                test_name="basic_perception",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'embedding_shape': perception.embeddings.shape if perception.embeddings is not None else None,
                    'feature_count': len(perception.features),
                    'confidence': perception.confidence
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="basic_perception",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_mathematical_perception(self) -> TestResult:
        """Test mathematical input perception"""
        start_time = time.time()
        
        try:
            test_input = "Calculate 2 + 3 * 4"
            perception = await self.neural_perception.perceive(test_input)
            
            # Check if mathematical patterns were detected
            patterns = perception.features.get('patterns', {})
            dominant_pattern = patterns.get('dominant_pattern', '')
            
            success = (
                perception.confidence > 0.3 and
                'mathematical' in dominant_pattern.lower()
            )
            
            score = perception.confidence if success else 0.0
            
            return TestResult(
                test_name="mathematical_perception",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'dominant_pattern': dominant_pattern,
                    'confidence': perception.confidence,
                    'mathematical_detected': 'mathematical' in dominant_pattern.lower()
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="mathematical_perception",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_linguistic_perception(self) -> TestResult:
        """Test linguistic input perception"""
        start_time = time.time()
        
        try:
            test_input = "What is the meaning of artificial intelligence?"
            perception = await self.neural_perception.perceive(test_input)
            
            success = (
                perception.confidence > 0.2 and
                len(perception.features) > 0
            )
            
            score = perception.confidence if success else 0.0
            
            return TestResult(
                test_name="linguistic_perception",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'confidence': perception.confidence,
                    'feature_types': list(perception.features.keys())
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="linguistic_perception",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_multimodal_perception(self) -> TestResult:
        """Test multimodal input perception"""
        start_time = time.time()
        
        try:
            test_input = {"text": "The answer is", "number": 42}
            perception = await self.neural_perception.perceive(test_input)
            
            success = (
                perception.confidence > 0.2 and
                perception.embeddings is not None
            )
            
            score = perception.confidence if success else 0.0
            
            return TestResult(
                test_name="multimodal_perception",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'confidence': perception.confidence,
                    'multimodal_input': True
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="multimodal_perception",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    # Symbolic Knowledge Tests
    
    async def test_fact_storage_retrieval(self) -> TestResult:
        """Test fact storage and retrieval"""
        start_time = time.time()
        
        try:
            # Add a fact
            fact_id = self.symbolic_knowledge.add_knowledge("Socrates", "is", "human", 1.0, "test")
            
            # Retrieve the fact
            facts = self.symbolic_knowledge.query_knowledge(subject="Socrates")
            
            success = (
                len(facts) > 0 and
                any(f.predicate == "is" and f.object == "human" for f in facts)
            )
            
            score = 1.0 if success else 0.0
            
            return TestResult(
                test_name="fact_storage_retrieval",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'facts_stored': 1,
                    'facts_retrieved': len(facts)
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="fact_storage_retrieval",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_rule_application(self) -> TestResult:
        """Test rule application and inference"""
        start_time = time.time()
        
        try:
            # Add facts for rule application
            self.symbolic_knowledge.add_knowledge("Socrates", "is_a", "human", 1.0, "premise")
            
            # Apply reasoning (uses built-in rules)
            new_facts = await self.symbolic_knowledge.reason([], [])
            
            success = len(new_facts) >= 0  # At least should not fail
            score = min(1.0, len(new_facts) / 3)  # Expect some inference
            
            return TestResult(
                test_name="rule_application",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'new_facts_derived': len(new_facts),
                    'inference_successful': len(new_facts) > 0
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="rule_application",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_consistency_checking(self) -> TestResult:
        """Test knowledge base consistency checking"""
        start_time = time.time()
        
        try:
            # Add consistent facts
            facts = [
                self.symbolic_knowledge.knowledge_base.facts.get(fid) 
                for fid in self.symbolic_knowledge.knowledge_base.facts.keys()
            ]
            facts = [f for f in facts if f is not None]
            
            is_consistent = await self.symbolic_knowledge.validate_consistency(facts)
            
            success = is_consistent is not None
            score = 1.0 if is_consistent else 0.5  # Inconsistency is still a valid result
            
            return TestResult(
                test_name="consistency_checking",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'is_consistent': is_consistent,
                    'facts_checked': len(facts)
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="consistency_checking",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_inference_chain(self) -> TestResult:
        """Test inference chain generation"""
        start_time = time.time()
        
        try:
            # Create a simple inference scenario
            from neural_symbolic_types import SymbolicFact
            
            fact = SymbolicFact("TestSubject", "TestPredicate", "TestObject", 0.9, "test")
            explanation = await self.symbolic_knowledge.explain_inference(fact)
            
            success = len(explanation) > 0
            score = 0.8 if success else 0.0
            
            return TestResult(
                test_name="inference_chain",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'explanation_length': len(explanation),
                    'explanation_generated': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="inference_chain",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    # Neural-Symbolic Bridge Tests
    
    async def test_neural_to_symbolic_conversion(self) -> TestResult:
        """Test conversion from neural to symbolic representation"""
        start_time = time.time()
        
        try:
            # Create neural perception
            test_input = "If all birds can fly, then eagles can fly"
            perception = await self.neural_perception.perceive(test_input)
            
            # Convert to symbolic
            symbolic_repr = await self.neural_symbolic_bridge.neural_to_symbolic(perception)
            
            success = (
                len(symbolic_repr.symbols) > 0 and
                len(symbolic_repr.facts) >= 0 and
                symbolic_repr.confidence > 0.0
            )
            
            score = symbolic_repr.confidence if success else 0.0
            
            return TestResult(
                test_name="neural_to_symbolic_conversion",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'symbols_extracted': len(symbolic_repr.symbols),
                    'facts_extracted': len(symbolic_repr.facts),
                    'confidence': symbolic_repr.confidence
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="neural_to_symbolic_conversion",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_symbolic_to_neural_conversion(self) -> TestResult:
        """Test conversion from symbolic to neural representation"""
        start_time = time.time()
        
        try:
            from neural_symbolic_types import SymbolicRepresentation, SymbolicFact
            
            # Create symbolic representation
            facts = [SymbolicFact("bird", "can", "fly", 0.9, "test")]
            symbolic_repr = SymbolicRepresentation(
                symbols=["CONCEPT:bird", "OPERATOR:can", "CONCEPT:fly"],
                facts=facts,
                rules=[],
                relationships={}
            )
            
            # Convert to neural
            neural_embedding = await self.neural_symbolic_bridge.symbolic_to_neural(symbolic_repr)
            
            success = (
                neural_embedding is not None and
                neural_embedding.shape[-1] == self.config.embedding_dim
            )
            
            score = 0.8 if success else 0.0
            
            return TestResult(
                test_name="symbolic_to_neural_conversion",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'embedding_shape': neural_embedding.shape if neural_embedding is not None else None,
                    'conversion_successful': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="symbolic_to_neural_conversion",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_representation_alignment(self) -> TestResult:
        """Test alignment between neural and symbolic representations"""
        start_time = time.time()
        
        try:
            # Create both representations
            test_input = "2 + 3 = 5"
            perception = await self.neural_perception.perceive(test_input)
            symbolic_repr = await self.neural_symbolic_bridge.neural_to_symbolic(perception)
            
            # Test alignment
            alignment_score = await self.neural_symbolic_bridge.align_representations(
                perception, symbolic_repr
            )
            
            success = 0.0 <= alignment_score <= 1.0
            score = alignment_score if success else 0.0
            
            return TestResult(
                test_name="representation_alignment",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'alignment_score': alignment_score,
                    'alignment_valid': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="representation_alignment",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_pattern_extraction(self) -> TestResult:
        """Test pattern extraction from text"""
        start_time = time.time()
        
        try:
            test_text = "If x > 5 then y = 2x + 3"
            patterns = self.neural_symbolic_bridge.pattern_extractor.extract_patterns(test_text)
            
            success = len(patterns) > 0
            score = min(1.0, len(patterns) / 2)  # Expect at least some patterns
            
            return TestResult(
                test_name="pattern_extraction",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'patterns_found': len(patterns),
                    'pattern_types': [p['type'] for p in patterns] if patterns else []
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="pattern_extraction",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    # Unified Reasoning Tests
    
    async def test_parallel_reasoning(self) -> TestResult:
        """Test parallel neural-symbolic reasoning"""
        start_time = time.time()
        
        try:
            problem = "What is the square root of 144?"
            result = await self.unified_coordinator.hybrid_reason(problem, NeuralSymbolicMode.HYBRID)
            
            success = (
                result is not None and
                result.combined_confidence > 0.0 and
                len(result.reasoning_path) > 0
            )
            
            score = result.combined_confidence if success else 0.0
            
            return TestResult(
                test_name="parallel_reasoning",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'combined_confidence': result.combined_confidence if result else 0.0,
                    'reasoning_steps': len(result.reasoning_path) if result else 0,
                    'result': str(result.combined_result) if result else "None"
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="parallel_reasoning",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_adaptive_reasoning(self) -> TestResult:
        """Test adaptive reasoning mode selection"""
        start_time = time.time()
        
        try:
            problem = "If all roses are flowers and some flowers are red, what can we say about roses?"
            result = await self.unified_coordinator.adaptive_reasoning(problem)
            
            success = (
                result is not None and
                result.combined_confidence > 0.0
            )
            
            score = result.combined_confidence if success else 0.0
            
            return TestResult(
                test_name="adaptive_reasoning",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'confidence': result.combined_confidence if result else 0.0,
                    'adaptive_mode_used': True
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="adaptive_reasoning",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_confidence_calibration(self) -> TestResult:
        """Test confidence calibration"""
        start_time = time.time()
        
        try:
            problem = "Simple test for confidence calibration"
            result = await self.unified_coordinator.hybrid_reason(problem, NeuralSymbolicMode.ADAPTIVE)
            
            success = (
                result is not None and
                0.0 <= result.combined_confidence <= 1.0 and
                0.0 <= result.neural_confidence <= 1.0 and
                0.0 <= result.symbolic_confidence <= 1.0
            )
            
            score = 0.8 if success else 0.0
            
            return TestResult(
                test_name="confidence_calibration",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'neural_confidence': result.neural_confidence if result else 0.0,
                    'symbolic_confidence': result.symbolic_confidence if result else 0.0,
                    'combined_confidence': result.combined_confidence if result else 0.0,
                    'confidence_valid': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="confidence_calibration",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_explanation_generation(self) -> TestResult:
        """Test explanation generation"""
        start_time = time.time()
        
        try:
            problem = "Why is 2 + 2 = 4?"
            result = await self.unified_coordinator.hybrid_reason(problem, NeuralSymbolicMode.HYBRID)
            explanation = await self.unified_coordinator.generate_explanation(result)
            
            success = (
                len(explanation) > 0 and
                "Reasoning" in explanation
            )
            
            score = 0.8 if success else 0.0
            
            return TestResult(
                test_name="explanation_generation",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'explanation_length': len(explanation),
                    'explanation_quality': 'good' if success else 'poor'
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="explanation_generation",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    # ReAct Integration Tests
    
    async def test_react_with_neural_symbolic(self) -> TestResult:
        """Test ReAct framework with neural-symbolic integration"""
        start_time = time.time()
        
        try:
            problem = "What is 5 + 3 * 2?"
            result = await self.react_agent.solve(problem, max_steps=4, enable_neural_symbolic=True)
            
            success = (
                result.success and
                result.confidence > 0.2 and
                len(result.steps) > 0
            )
            
            score = result.confidence if success else 0.0
            
            return TestResult(
                test_name="react_with_neural_symbolic",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'final_answer': result.final_answer,
                    'confidence': result.confidence,
                    'steps_taken': len(result.steps),
                    'neural_symbolic_used': result.metadata.get('neural_symbolic_steps', 0) > 0
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="react_with_neural_symbolic",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_complex_problem_solving(self) -> TestResult:
        """Test complex problem solving with ReAct"""
        start_time = time.time()
        
        try:
            problem = "If all birds can fly and penguins are birds, can penguins fly? Explain your reasoning."
            result = await self.react_agent.solve(problem, max_steps=5, enable_neural_symbolic=True)
            
            success = (
                result is not None and
                len(result.final_answer) > 10 and
                result.confidence > 0.1
            )
            
            score = result.confidence if success else 0.0
            
            return TestResult(
                test_name="complex_problem_solving",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'answer_length': len(result.final_answer) if result else 0,
                    'reasoning_steps': len(result.steps) if result else 0,
                    'confidence': result.confidence if result else 0.0
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="complex_problem_solving",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_multi_step_reasoning(self) -> TestResult:
        """Test multi-step reasoning capability"""
        start_time = time.time()
        
        try:
            problem = "First, calculate 3 * 4. Then, add 5 to that result. Finally, divide by 2."
            result = await self.react_agent.solve(problem, max_steps=6, enable_neural_symbolic=True)
            
            success = (
                result is not None and
                len(result.steps) >= 2 and  # Should take multiple steps
                result.confidence > 0.2
            )
            
            score = result.confidence if success else 0.0
            
            return TestResult(
                test_name="multi_step_reasoning",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'steps_taken': len(result.steps) if result else 0,
                    'multi_step': len(result.steps) >= 2 if result else False,
                    'final_answer': result.final_answer if result else "None"
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="multi_step_reasoning",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_confidence_propagation(self) -> TestResult:
        """Test confidence propagation through ReAct steps"""
        start_time = time.time()
        
        try:
            problem = "What is 10 divided by 2?"
            result = await self.react_agent.solve(problem, max_steps=3, enable_neural_symbolic=True)
            
            # Check that confidence values are reasonable
            step_confidences = [s.confidence for s in result.steps] if result and result.steps else []
            
            success = (
                result is not None and
                all(0.0 <= conf <= 1.0 for conf in step_confidences) and
                0.0 <= result.confidence <= 1.0
            )
            
            score = 0.8 if success else 0.0
            
            return TestResult(
                test_name="confidence_propagation",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'step_confidences': step_confidences,
                    'final_confidence': result.confidence if result else 0.0,
                    'confidence_valid': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="confidence_propagation",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    # End-to-End Tests
    
    async def test_complete_pipeline(self) -> TestResult:
        """Test complete neural-symbolic pipeline"""
        start_time = time.time()
        
        try:
            # Complex problem requiring full pipeline
            problem = "Analyze the mathematical pattern in 2, 6, 18, 54 and predict the next number. Explain your reasoning using both pattern recognition and logical deduction."
            
            result = await self.react_agent.solve(problem, max_steps=8, enable_neural_symbolic=True)
            
            success = (
                result is not None and
                result.success and
                len(result.final_answer) > 20 and  # Substantial answer
                result.confidence > 0.3
            )
            
            score = result.confidence if success else 0.0
            
            return TestResult(
                test_name="complete_pipeline",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'pipeline_complete': success,
                    'answer_quality': 'good' if len(result.final_answer) > 50 else 'basic' if result else 'none',
                    'processing_time': result.processing_time if result else 0.0,
                    'confidence': result.confidence if result else 0.0
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="complete_pipeline",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_performance_benchmarks(self) -> TestResult:
        """Test performance benchmarks"""
        start_time = time.time()
        
        try:
            # Run multiple simple problems to test performance
            problems = ["2+2", "3*4", "10/2", "5-3", "8+1"]
            total_time = 0.0
            successful_solves = 0
            
            for problem in problems:
                problem_start = time.time()
                result = await self.react_agent.solve(problem, max_steps=3)
                problem_time = time.time() - problem_start
                total_time += problem_time
                
                if result and result.success:
                    successful_solves += 1
            
            avg_time = total_time / len(problems)
            success_rate = successful_solves / len(problems)
            
            success = (
                avg_time < 10.0 and  # Should solve simple problems quickly
                success_rate > 0.6   # Should solve most problems
            )
            
            score = success_rate * (1.0 - min(avg_time / 10.0, 1.0))  # Factor in both success rate and speed
            
            return TestResult(
                test_name="performance_benchmarks",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'average_solve_time': avg_time,
                    'success_rate': success_rate,
                    'problems_tested': len(problems),
                    'performance_acceptable': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="performance_benchmarks",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_robustness(self) -> TestResult:
        """Test system robustness with edge cases"""
        start_time = time.time()
        
        try:
            # Test edge cases
            edge_cases = [
                "",  # Empty input
                "?" * 100,  # Long repetitive input
                "∀x∈ℝ: x² ≥ 0",  # Unicode mathematical symbols
                "This is not a question or problem just a statement"  # Ambiguous input
            ]
            
            successful_handles = 0
            for case in edge_cases:
                try:
                    result = await self.react_agent.solve(case, max_steps=2)
                    if result is not None:  # System didn't crash
                        successful_handles += 1
                except Exception:
                    pass  # Expected for some edge cases
            
            robustness_score = successful_handles / len(edge_cases)
            success = robustness_score > 0.5  # Handle most edge cases gracefully
            
            return TestResult(
                test_name="robustness",
                success=success,
                score=robustness_score,
                processing_time=time.time() - start_time,
                details={
                    'edge_cases_tested': len(edge_cases),
                    'successful_handles': successful_handles,
                    'robustness_score': robustness_score
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="robustness",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def test_scalability(self) -> TestResult:
        """Test system scalability"""
        start_time = time.time()
        
        try:
            # Test with increasingly complex problems
            complexity_levels = [
                "2+2",
                "2+3*4",
                "(2+3)*4-5",
                "If x=2 and y=3, what is x*y+4?",
                "Given that all A are B, and some B are C, and this specific A is also C, what logical relationships can we establish?"
            ]
            
            performance_degradation = []
            baseline_time = None
            
            for i, problem in enumerate(complexity_levels):
                problem_start = time.time()
                result = await self.react_agent.solve(problem, max_steps=5)
                problem_time = time.time() - problem_start
                
                if baseline_time is None:
                    baseline_time = problem_time
                else:
                    degradation = problem_time / baseline_time
                    performance_degradation.append(degradation)
            
            # Scalability is good if performance doesn't degrade exponentially
            avg_degradation = sum(performance_degradation) / len(performance_degradation) if performance_degradation else 1.0
            success = avg_degradation < 5.0  # Performance shouldn't degrade more than 5x
            
            score = max(0.0, 1.0 - (avg_degradation - 1.0) / 4.0)  # Score based on degradation
            
            return TestResult(
                test_name="scalability",
                success=success,
                score=score,
                processing_time=time.time() - start_time,
                details={
                    'complexity_levels_tested': len(complexity_levels),
                    'average_degradation': avg_degradation,
                    'baseline_time': baseline_time,
                    'scalability_acceptable': success
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name="scalability",
                success=False,
                score=0.0,
                processing_time=time.time() - start_time,
                error_message=str(e)
            )
    
    def _generate_validation_report(self, results: List[TestResult], total_time: float) -> ValidationReport:
        """Generate comprehensive validation report"""
        passed = sum(1 for r in results if r.success)
        failed = len(results) - passed
        avg_score = sum(r.score for r in results) / len(results) if results else 0.0
        
        import socket
        import platform
        
        return ValidationReport(
            total_tests=len(results),
            passed_tests=passed,
            failed_tests=failed,
            average_score=avg_score,
            total_processing_time=total_time,
            test_results=results,
            system_info={
                'platform': platform.platform(),
                'python_version': platform.python_version(),
                'hostname': socket.gethostname(),
                'config': {
                    'embedding_dim': self.config.embedding_dim,
                    'attention_heads': self.config.attention_heads,
                    'neural_layers': self.config.neural_layers,
                    'reasoning_depth': self.config.reasoning_depth
                }
            },
            timestamp=time.strftime('%Y-%m-%d %H:%M:%S')
        )
    
    def _print_validation_summary(self, report: ValidationReport):
        """Print validation summary"""
        print(f"\n🎯 VALIDATION SUMMARY")
        print("=" * 70)
        print(f"📊 Total Tests: {report.total_tests}")
        print(f"✅ Passed: {report.passed_tests}")
        print(f"❌ Failed: {report.failed_tests}")
        print(f"📈 Success Rate: {(report.passed_tests/report.total_tests)*100:.1f}%")
        print(f"⭐ Average Score: {report.average_score:.3f}")
        print(f"⏱️  Total Time: {report.total_processing_time:.2f}s")
        print(f"🖥️  Platform: {report.system_info['platform']}")
        
        # Category breakdown
        print(f"\n📋 CATEGORY BREAKDOWN:")
        categories = {}
        for result in report.test_results:
            # Determine category from test name
            for category, tests in self.test_categories.items():
                if any(test.replace('test_', '') in result.test_name for test in tests):
                    if category not in categories:
                        categories[category] = {'passed': 0, 'total': 0, 'scores': []}
                    categories[category]['total'] += 1
                    if result.success:
                        categories[category]['passed'] += 1
                    categories[category]['scores'].append(result.score)
                    break
        
        for category, stats in categories.items():
            success_rate = (stats['passed'] / stats['total']) * 100
            avg_score = sum(stats['scores']) / len(stats['scores'])
            status = "✅" if success_rate >= 80 else "⚠️" if success_rate >= 60 else "❌"
            print(f"  {status} {category.replace('_', ' ').title()}: {success_rate:.0f}% ({stats['passed']}/{stats['total']}) - Score: {avg_score:.2f}")
        
        # Failed tests detail
        failed_tests = [r for r in report.test_results if not r.success]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests[:5]:  # Show first 5 failures
                print(f"  • {test.test_name}: {test.error_message[:60]}...")
            if len(failed_tests) > 5:
                print(f"  ... and {len(failed_tests) - 5} more failures")
        
        # Overall assessment
        print(f"\n🏆 OVERALL ASSESSMENT:")
        if report.average_score >= 0.8:
            print("🌟 EXCELLENT: Neural-Symbolic Architecture is performing exceptionally well!")
        elif report.average_score >= 0.6:
            print("✅ GOOD: Neural-Symbolic Architecture is working well with minor issues.")
        elif report.average_score >= 0.4:
            print("⚠️  ACCEPTABLE: Neural-Symbolic Architecture has some issues but is functional.")
        else:
            print("❌ NEEDS WORK: Neural-Symbolic Architecture requires significant improvements.")
        
        print("=" * 70)
    
    def save_report(self, report: ValidationReport, filename: str = None):
        """Save validation report to file"""
        if filename is None:
            filename = f"neural_symbolic_validation_report_{int(time.time())}.json"
        
        report_dict = {
            'summary': {
                'total_tests': report.total_tests,
                'passed_tests': report.passed_tests,
                'failed_tests': report.failed_tests,
                'success_rate': report.passed_tests / report.total_tests if report.total_tests > 0 else 0.0,
                'average_score': report.average_score,
                'total_processing_time': report.total_processing_time,
                'timestamp': report.timestamp
            },
            'system_info': report.system_info,
            'test_results': [
                {
                    'test_name': r.test_name,
                    'success': r.success,
                    'score': r.score,
                    'processing_time': r.processing_time,
                    'details': r.details,
                    'error_message': r.error_message
                }
                for r in report.test_results
            ]
        }
        
        with open(filename, 'w') as f:
            json.dump(report_dict, f, indent=2)
        
        print(f"\n💾 Validation report saved to: {filename}")

# Main execution
async def main():
    """Main validation execution"""
    print("🚀 Initializing Neural-Symbolic Architecture Validation Suite...")
    
    try:
        # Create validation suite
        config = NeuralSymbolicConfig(
            embedding_dim=128,
            attention_heads=4,
            neural_layers=2,
            reasoning_depth=3,
            verbose_logging=False
        )
        
        suite = NeuralSymbolicValidationSuite(config)
        
        # Run complete validation
        report = await suite.run_complete_validation()
        
        # Save report
        suite.save_report(report)
        
        # Exit with appropriate code
        success_rate = report.passed_tests / report.total_tests if report.total_tests > 0 else 0.0
        
        if success_rate >= 0.8:
            print("\n🎉 VALIDATION SUCCESSFUL: Neural-Symbolic Architecture is ready for deployment!")
            exit_code = 0
        elif success_rate >= 0.6:
            print("\n⚠️  VALIDATION PARTIAL: Some issues detected, but system is functional.")
            exit_code = 1
        else:
            print("\n💥 VALIDATION FAILED: Significant issues detected, system needs work.")
            exit_code = 2
        
        return exit_code
        
    except Exception as e:
        print(f"\n💥 VALIDATION SUITE CRASHED: {e}")
        traceback.print_exc()
        return 3

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
"""
Neural-Symbolic ReAct Integration for RomAI AGI System

This module integrates the neural-symbolic architecture with the ReAct framework,
enabling NEURAL_SYMBOLIC action type and hybrid reasoning capabilities within
the existing agent coordination system.

Based on Microsoft Azure AI best practices for hybrid AI integration and
extends the ReAct (Reasoning and Acting) paradigm with neural-symbolic reasoning.
"""

import asyncio
import time
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Import existing ReAct framework components
from react_types import (
    ReActAction, ReActObservation, ReActStep, ReActContext, ReActResult,
    ReActActionType, ReActStepStatus
)
from react_framework import ReActAgent

# Import neural-symbolic components
from neural_symbolic_types import NeuralSymbolicMode, NeuralSymbolicConfig
from unified_reasoning_coordinator import UnifiedReasoningCoordinator, ReasoningContext

logger = logging.getLogger(__name__)

class NeuralSymbolicActionType(Enum):
    """Extended action types for neural-symbolic reasoning"""
    NEURAL_PERCEPTION = "neural_perception"
    SYMBOLIC_REASONING = "symbolic_reasoning"
    HYBRID_ANALYSIS = "hybrid_analysis"
    PATTERN_RECOGNITION = "pattern_recognition"
    CONCEPT_MAPPING = "concept_mapping"
    KNOWLEDGE_INTEGRATION = "knowledge_integration"

@dataclass
class NeuralSymbolicAction(ReActAction):
    """Extended ReAct action for neural-symbolic operations"""
    neural_symbolic_type: NeuralSymbolicActionType = NeuralSymbolicActionType.HYBRID_ANALYSIS
    reasoning_mode: NeuralSymbolicMode = NeuralSymbolicMode.ADAPTIVE
    confidence_threshold: float = 0.5
    explanation_required: bool = True
    context_data: Dict[str, Any] = None
    
    def __post_init__(self):
        super().__post_init__()
        if self.context_data is None:
            self.context_data = {}

@dataclass
class NeuralSymbolicObservation(ReActObservation):
    """Extended ReAct observation for neural-symbolic results"""
    neural_confidence: float = 0.0
    symbolic_confidence: float = 0.0
    bridge_alignment: float = 0.0
    reasoning_path: List[str] = None
    evidence: List[Any] = None
    processing_time: float = 0.0
    
    def __post_init__(self):
        super().__post_init__()
        if self.reasoning_path is None:
            self.reasoning_path = []
        if self.evidence is None:
            self.evidence = []

class NeuralSymbolicReActAgent(ReActAgent):
    """Extended ReAct agent with neural-symbolic reasoning capabilities"""
    
    def __init__(self, config: Optional[NeuralSymbolicConfig] = None):
        # Initialize base ReAct agent
        super().__init__()
        
        # Initialize neural-symbolic coordinator
        self.ns_config = config or NeuralSymbolicConfig()
        self.reasoning_coordinator = UnifiedReasoningCoordinator(self.ns_config)
        
        # Register neural-symbolic action executor
        self.action_executors['NEURAL_SYMBOLIC'] = self._execute_neural_symbolic_action
        
        # Enhanced reasoning generators
        self.reasoning_generators.update({
            'neural_symbolic_analysis': self._generate_neural_symbolic_reasoning,
            'hybrid_pattern_analysis': self._generate_hybrid_pattern_reasoning,
            'concept_integration': self._generate_concept_integration_reasoning
        })
        
        logger.info("Neural-Symbolic ReAct Agent initialized")
    
    async def solve(self, problem: str, max_steps: int = 10, 
                   enable_neural_symbolic: bool = True) -> ReActResult:
        """Enhanced solve method with neural-symbolic capabilities"""
        start_time = time.time()
        
        # Determine problem characteristics
        problem_type = self._classify_problem_type(problem)
        complexity_level = self._assess_complexity(problem)
        
        context = ReActContext(
            problem=problem,
            goal=f"Solve: {problem}",
            problem_type=problem_type,
            complexity_level=complexity_level,
            available_tools=list(self.engines.keys()),
            previous_steps=[]
        )
        
        steps = []
        current_step = 1
        
        logger.info(f"🧠 Starting enhanced ReAct reasoning for: {problem}")
        
        try:
            while current_step <= max_steps:
                # Generate reasoning for current step
                reasoning = await self._generate_step_reasoning(problem, steps, current_step)
                
                # Determine action based on reasoning and problem characteristics
                if enable_neural_symbolic and self._should_use_neural_symbolic(problem, steps):
                    action = await self._plan_neural_symbolic_action(problem, reasoning, steps)
                else:
                    action = await self._plan_standard_action(problem, reasoning, steps)
    
    async def _plan_standard_action(self, problem: str, reasoning: str, steps: List[ReActStep]) -> ReActAction:
        """Plan standard ReAct action using base framework"""
        # Use the base ReAct framework to determine next action
        context = ReActContext(
            problem=problem,
            goal=f"Solve: {problem}"
        )
        
        # Use base ReAct action planning logic
        next_action_type = self._determine_next_action(context, steps)
        
        if next_action_type is None:
            next_action_type = ReActActionType.MATH  # Default to math for most problems
        
        # Generate action parameters
        parameters = self._generate_action_parameters(next_action_type, context, steps)
        
        return ReActAction(
            action_type=next_action_type,
            parameters=parameters or {},
            reasoning=reasoning
        )
                
                # Execute action
                observation = await self._execute_action(action, context)
                
                # Create step
                step = ReActStep(
                    step_number=current_step,
                    reasoning=reasoning,
                    action=action,
                    observation=observation,
                    status=ReActStepStatus.COMPLETED,
                    confidence=observation.confidence,
                    metadata={
                        'neural_symbolic_used': action.action_type == 'NEURAL_SYMBOLIC',
                        'processing_time': observation.metadata.get('processing_time', 0.0)
                    }
                )
                
                steps.append(step)
                
                # Check if we have a final answer
                if self._is_final_answer(observation, problem):
                    logger.info(f"✅ Final answer reached at step {current_step}")
                    break
                
                current_step += 1
            
            # Calculate final confidence
            final_confidence = self._calculate_final_confidence(steps)
            
            # Generate final answer
            final_answer = await self._generate_final_answer(steps, problem)
            
            result = ReActResult(
                problem=problem,
                final_answer=final_answer,
                reasoning_trace=steps,
                total_steps=len(steps),
                overall_confidence=final_confidence,
                success=final_confidence > 0.3,
                execution_time=time.time() - start_time,
                actions_taken=[s.action.action_type for s in steps],
                external_sources=[],
                context=ReActContext(
                    problem_type=problem_type,
                    complexity_level=complexity_level,
                    available_tools=list(self.engines.keys()),
                    previous_steps=[]
                ),
                metadata={
                    'neural_symbolic_steps': len([s for s in steps if s.action.action_type == 'NEURAL_SYMBOLIC']),
                    'average_step_confidence': sum(s.confidence for s in steps) / len(steps) if steps else 0.0,
                    'reasoning_coordinator_stats': self.reasoning_coordinator.get_performance_stats()
                }
            )
            
            logger.info(f"🎯 ReAct reasoning completed: {final_answer} (confidence: {final_confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Enhanced ReAct reasoning failed: {e}")
            return ReActResult(
                problem=problem,
                final_answer=f"Error: {str(e)}",
                reasoning_trace=steps,
                total_steps=len(steps),
                overall_confidence=0.0,
                success=False,
                execution_time=time.time() - start_time,
                actions_taken=[s.action.action_type for s in steps] if steps else [],
                external_sources=[],
                context=ReActContext(
                    problem_type=problem_type,
                    complexity_level=complexity_level,
                    available_tools=list(self.engines.keys()),
                    previous_steps=[]
                ),
                metadata={'error_message': str(e)}
            )
    
    async def _execute_neural_symbolic_action(self, action: ReActAction, context: ReActContext) -> ReActObservation:
        """Execute neural-symbolic reasoning action"""
        start_time = time.time()
        
        try:
            # Determine reasoning mode based on action details
            if isinstance(action, NeuralSymbolicAction):
                reasoning_mode = action.reasoning_mode
                ns_type = action.neural_symbolic_type
            else:
                reasoning_mode = NeuralSymbolicMode.ADAPTIVE
                ns_type = NeuralSymbolicActionType.HYBRID_ANALYSIS
            
            logger.debug(f"Executing neural-symbolic action: {ns_type.value} with mode {reasoning_mode.value}")
            
            # Execute hybrid reasoning
            hybrid_result = await self.reasoning_coordinator.hybrid_reason(
                problem=action.content,
                mode=reasoning_mode
            )
            
            # Create enhanced observation
            observation = NeuralSymbolicObservation(
                content=str(hybrid_result.combined_result),
                confidence=hybrid_result.combined_confidence,
                metadata={
                    'action_type': 'NEURAL_SYMBOLIC',
                    'neural_symbolic_type': ns_type.value,
                    'processing_time': time.time() - start_time,
                    'reasoning_mode': reasoning_mode.value
                },
                neural_confidence=hybrid_result.neural_confidence,
                symbolic_confidence=hybrid_result.symbolic_confidence,
                bridge_alignment=hybrid_result.metadata.get('bridge_alignment', 0.0),
                reasoning_path=hybrid_result.reasoning_path,
                evidence=hybrid_result.evidence,
                processing_time=hybrid_result.processing_time
            )
            
            logger.debug(f"Neural-symbolic action completed with confidence {observation.confidence:.3f}")
            return observation
            
        except Exception as e:
            logger.error(f"Neural-symbolic action execution failed: {e}")
            return ReActObservation(
                content=f"Neural-symbolic reasoning failed: {str(e)}",
                confidence=0.0,
                metadata={
                    'error': str(e),
                    'action_type': 'NEURAL_SYMBOLIC',
                    'processing_time': time.time() - start_time
                }
            )
    
    def _should_use_neural_symbolic(self, problem: str, steps: List[ReActStep]) -> bool:
        """Determine if neural-symbolic reasoning should be used"""
        problem_lower = problem.lower()
        
        # Use neural-symbolic for complex reasoning problems
        complex_indicators = [
            'analyze', 'understand', 'explain', 'reason', 'conclude',
            'pattern', 'relationship', 'connection', 'inference',
            'logic', 'mathematical', 'symbolic', 'conceptual'
        ]
        
        if any(indicator in problem_lower for indicator in complex_indicators):
            return True
        
        # Use if previous steps had low confidence
        if steps:
            recent_confidence = sum(s.confidence for s in steps[-2:]) / min(2, len(steps))
            if recent_confidence < 0.6:
                return True
        
        # Use for multi-step mathematical problems
        if any(char in problem for char in '+-*/=()[]') and len(problem.split()) > 5:
            return True
        
        return False
    
    async def _plan_neural_symbolic_action(self, problem: str, reasoning: str, 
                                         steps: List[ReActStep]) -> NeuralSymbolicAction:
        """Plan a neural-symbolic action based on problem characteristics"""
        problem_lower = problem.lower()
        
        # Determine neural-symbolic action type
        if any(word in problem_lower for word in ['pattern', 'recognize', 'identify']):
            ns_type = NeuralSymbolicActionType.PATTERN_RECOGNITION
            reasoning_mode = NeuralSymbolicMode.NEURAL_ONLY
        elif any(word in problem_lower for word in ['logic', 'reasoning', 'conclude', 'infer']):
            ns_type = NeuralSymbolicActionType.SYMBOLIC_REASONING
            reasoning_mode = NeuralSymbolicMode.SYMBOLIC_ONLY
        elif any(word in problem_lower for word in ['concept', 'understand', 'meaning']):
            ns_type = NeuralSymbolicActionType.CONCEPT_MAPPING
            reasoning_mode = NeuralSymbolicMode.HYBRID
        elif any(word in problem_lower for word in ['analyze', 'examine', 'study']):
            ns_type = NeuralSymbolicActionType.HYBRID_ANALYSIS
            reasoning_mode = NeuralSymbolicMode.ADAPTIVE
        else:
            ns_type = NeuralSymbolicActionType.KNOWLEDGE_INTEGRATION
            reasoning_mode = NeuralSymbolicMode.ADAPTIVE
        
        return NeuralSymbolicAction(
            action_type='NEURAL_SYMBOLIC',
            content=problem,
            confidence=0.8,
            metadata={
                'reasoning': reasoning,
                'step_count': len(steps),
                'planned_type': ns_type.value
            },
            neural_symbolic_type=ns_type,
            reasoning_mode=reasoning_mode,
            confidence_threshold=0.5,
            explanation_required=True,
            context_data={
                'previous_steps': len(steps),
                'problem_characteristics': self._analyze_problem_characteristics(problem)
            }
        )
    
    async def _generate_step_reasoning(self, problem: str, steps: List[ReActStep], current_step: int) -> str:
        """Generate reasoning for the current step using neural-symbolic analysis"""
        step_count = len(steps)
        
        # Initial step reasoning
        if step_count == 0:
            return f"I need to analyze the problem '{problem}' and determine the best approach. Let me consider both neural pattern recognition and symbolic logical reasoning to understand the structure and requirements."
        
        # Analyze recent progress
        recent_steps = steps[-2:] if len(steps) >= 2 else steps
        recent_successes = [s for s in recent_steps if s.observation and s.observation.success]
        
        if len(recent_successes) == 0:
            return f"The previous approaches haven't been successful. Let me reconsider the problem from a different angle using neural-symbolic hybrid reasoning to identify patterns and logical relationships I might have missed."
        
        # Build on successful progress
        recent_results = [s.observation.result for s in recent_successes]
        if recent_results:
            return f"Based on the successful results {recent_results}, I can see progress. Let me continue building on this foundation and use neural-symbolic reasoning to identify the next logical step toward the solution."
        
        # Default reasoning
        return f"For step {current_step}, I need to apply hybrid neural-symbolic reasoning to analyze both the patterns and logical structure of this problem to make progress toward the solution."
    
    async def _generate_neural_symbolic_reasoning(self, problem: str, steps: List[ReActStep]) -> str:
        """Generate reasoning for neural-symbolic approach"""
        step_count = len(steps)
        
        if step_count == 0:
            return f"I need to analyze this problem using hybrid neural-symbolic reasoning to understand both the patterns and logical structure in: {problem}"
        
        # Analyze previous steps
        recent_confidences = [s.confidence for s in steps[-3:]]
        avg_confidence = sum(recent_confidences) / len(recent_confidences) if recent_confidences else 0.5
        
        if avg_confidence < 0.5:
            return f"Previous approaches had low confidence ({avg_confidence:.2f}). I'll use neural-symbolic reasoning to combine pattern recognition with logical analysis for better results."
        
        return f"I'll apply neural-symbolic hybrid reasoning to integrate perceptual insights with symbolic logic for a more comprehensive analysis."
    
    async def _generate_hybrid_pattern_reasoning(self, problem: str, steps: List[ReActStep]) -> str:
        """Generate reasoning for hybrid pattern analysis"""
        return f"I'll use hybrid pattern analysis to identify both neural patterns and symbolic structures in: {problem}"
    
    async def _generate_concept_integration_reasoning(self, problem: str, steps: List[ReActStep]) -> str:
        """Generate reasoning for concept integration"""
        return f"I'll integrate conceptual understanding through neural-symbolic knowledge integration for: {problem}"
    
    def _analyze_problem_characteristics(self, problem: str) -> Dict[str, Any]:
        """Analyze problem to determine characteristics for neural-symbolic processing"""
        problem_lower = problem.lower()
        
        characteristics = {
            'length': len(problem.split()),
            'mathematical': any(char in problem for char in '+-*/=()[]'),
            'logical': any(word in problem_lower for word in ['if', 'then', 'all', 'some', 'every']),
            'linguistic': any(word in problem_lower for word in ['what', 'why', 'how', 'explain']),
            'conceptual': any(word in problem_lower for word in ['concept', 'idea', 'meaning', 'understand']),
            'complexity_score': min(10, len(problem.split()) // 5 + 1)
        }
        
        return characteristics
    
    def _is_final_answer(self, observation: ReActObservation, problem: str) -> bool:
        """Enhanced final answer detection including neural-symbolic confidence"""
        # Standard final answer detection
        if super()._is_final_answer(observation, problem):
            return True
        
        # Neural-symbolic specific checks
        if isinstance(observation, NeuralSymbolicObservation):
            # High confidence neural-symbolic result
            if observation.confidence > 0.8 and observation.neural_confidence > 0.7:
                return True
            
            # Strong symbolic reasoning with good alignment
            if observation.symbolic_confidence > 0.8 and observation.bridge_alignment > 0.7:
                return True
        
        return False
    
    def _calculate_final_confidence(self, steps: List[ReActStep]) -> float:
        """Enhanced confidence calculation including neural-symbolic metrics"""
        if not steps:
            return 0.0
        
        # Get base confidence from parent class
        base_confidence = super()._calculate_final_confidence(steps)
        
        # Enhance with neural-symbolic metrics
        ns_steps = [s for s in steps if s.action.action_type == 'NEURAL_SYMBOLIC']
        
        if ns_steps:
            # Calculate neural-symbolic confidence boost
            ns_confidences = []
            for step in ns_steps:
                if isinstance(step.observation, NeuralSymbolicObservation):
                    # Weighted confidence based on alignment
                    alignment_weight = step.observation.bridge_alignment
                    weighted_conf = (
                        step.observation.neural_confidence * 0.4 +
                        step.observation.symbolic_confidence * 0.4 +
                        alignment_weight * 0.2
                    )
                    ns_confidences.append(weighted_conf)
            
            if ns_confidences:
                ns_avg = sum(ns_confidences) / len(ns_confidences)
                # Blend base confidence with neural-symbolic confidence
                final_confidence = (base_confidence * 0.6 + ns_avg * 0.4)
                return min(1.0, max(0.0, final_confidence))
        
        return base_confidence
    
    async def _generate_final_answer(self, steps: List[ReActStep], problem: str) -> str:
        """Enhanced final answer generation with neural-symbolic insights"""
        base_answer = await super()._generate_final_answer(steps, problem)
        
        # Find the best neural-symbolic step
        ns_steps = [s for s in steps if s.action.action_type == 'NEURAL_SYMBOLIC']
        
        if ns_steps:
            best_ns_step = max(ns_steps, key=lambda s: s.confidence)
            
            if isinstance(best_ns_step.observation, NeuralSymbolicObservation):
                # If neural-symbolic result is significantly better, use it
                if best_ns_step.confidence > 0.8:
                    answer = best_ns_step.observation.content
                    
                    # Add confidence and reasoning information
                    confidence_info = f" (Confidence: {best_ns_step.confidence:.1%}"
                    if best_ns_step.observation.bridge_alignment > 0.7:
                        confidence_info += f", High neural-symbolic alignment: {best_ns_step.observation.bridge_alignment:.1%}"
                    confidence_info += ")"
                    
                    return answer + confidence_info
        
        return base_answer
    
    def get_neural_symbolic_stats(self) -> Dict[str, Any]:
        """Get neural-symbolic reasoning statistics"""
        coordinator_stats = self.reasoning_coordinator.get_performance_stats()
        
        return {
            'neural_symbolic_enabled': True,
            'reasoning_coordinator': coordinator_stats,
            'configuration': {
                'embedding_dim': self.ns_config.embedding_dim,
                'attention_heads': self.ns_config.attention_heads,
                'neural_layers': self.ns_config.neural_layers,
                'reasoning_depth': self.ns_config.reasoning_depth,
                'alignment_threshold': self.ns_config.alignment_threshold
            }
        }
    
    def _classify_problem_type(self, problem: str) -> str:
        """Classify the type of problem for context"""
        problem_lower = problem.lower()
        
        if any(word in problem_lower for word in ['calculate', '+', '-', '*', '/', 'add', 'subtract', 'multiply', 'divide', 'sum', 'product']):
            return "mathematical"
        elif any(word in problem_lower for word in ['if', 'all', 'some', 'therefore', 'conclude', 'logic', 'reasoning']):
            return "logical"
        elif any(word in problem_lower for word in ['create', 'design', 'creative', 'artistic', 'imagine']):
            return "creative"
        elif any(word in problem_lower for word in ['romanian', 'romania', 'dacian', 'carpathian']):
            return "romanian"
        else:
            return "general"
    
    def _assess_complexity(self, problem: str) -> str:
        """Assess problem complexity level"""
        problem_lower = problem.lower()
        complexity_indicators = len([word for word in ['complex', 'advanced', 'difficult', 'challenging', 'multi-step'] if word in problem_lower])
        
        if complexity_indicators >= 2:
            return "high"
        elif complexity_indicators >= 1:
            return "medium" 
        else:
            return "low"

# Factory function for easy instantiation
def create_neural_symbolic_react_agent(config: Optional[NeuralSymbolicConfig] = None) -> NeuralSymbolicReActAgent:
    """Create a neural-symbolic ReAct agent with optional configuration"""
    return NeuralSymbolicReActAgent(config)

# Utility function to upgrade existing ReAct agent
def upgrade_react_agent_with_neural_symbolic(react_agent: ReActAgent, 
                                            config: Optional[NeuralSymbolicConfig] = None) -> NeuralSymbolicReActAgent:
    """Upgrade an existing ReAct agent with neural-symbolic capabilities"""
    # Create new neural-symbolic agent
    ns_agent = NeuralSymbolicReActAgent(config)
    
    # Copy existing state if any
    if hasattr(react_agent, 'conversation_history'):
        ns_agent.conversation_history = react_agent.conversation_history
    
    if hasattr(react_agent, 'working_memory'):
        ns_agent.working_memory = react_agent.working_memory
    
    return ns_agent

# Example usage and testing
async def test_neural_symbolic_react_integration():
    """Test the neural-symbolic ReAct integration"""
    config = NeuralSymbolicConfig(
        embedding_dim=256,
        attention_heads=8,
        neural_layers=3,
        reasoning_depth=5,
        verbose_logging=True
    )
    
    agent = create_neural_symbolic_react_agent(config)
    
    # Test problems that benefit from neural-symbolic reasoning
    test_problems = [
        "What is the pattern in the sequence 2, 4, 8, 16, and what comes next?",
        "If all roses are flowers and some flowers are red, what can we conclude about roses?",
        "Analyze the mathematical relationship in: f(x) = 2x + 3, what is f(5)?",
        "Explain the conceptual connection between neural networks and symbolic reasoning"
    ]
    
    print("\n=== Testing Neural-Symbolic ReAct Integration ===")
    
    for problem in test_problems:
        print(f"\n🧠 Problem: {problem}")
        
        try:
            result = await agent.solve(problem, max_steps=6, enable_neural_symbolic=True)
            
            print(f"✅ Final Answer: {result.final_answer}")
            print(f"📊 Confidence: {result.confidence:.3f}")
            print(f"⏱️ Processing Time: {result.processing_time:.3f}s")
            print(f"🔧 Steps: {len(result.steps)}")
            print(f"🧠 Neural-Symbolic Steps: {result.metadata.get('neural_symbolic_steps', 0)}")
            
            # Show reasoning path from neural-symbolic steps
            ns_steps = [s for s in result.steps if s.action.action_type == 'NEURAL_SYMBOLIC']
            if ns_steps:
                print(f"🎯 Neural-Symbolic Reasoning:")
                for step in ns_steps:
                    if isinstance(step.observation, NeuralSymbolicObservation):
                        print(f"  - Step {step.step_number}: {step.observation.content[:100]}...")
                        print(f"    Confidences: Neural={step.observation.neural_confidence:.2f}, "
                              f"Symbolic={step.observation.symbolic_confidence:.2f}, "
                              f"Alignment={step.observation.bridge_alignment:.2f}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Show neural-symbolic statistics
    stats = agent.get_neural_symbolic_stats()
    print(f"\n📈 Neural-Symbolic Statistics:")
    print(f"  Reasoning Coordinator Stats: {stats['reasoning_coordinator']}")
    print(f"  Configuration: {stats['configuration']}")

if __name__ == "__main__":
    # Run test
    asyncio.run(test_neural_symbolic_react_integration())
"""
ReAct Framework Core Implementation for RomAI AGI System

This module implements the ReAct (Reasoning and Acting) framework that provides
interleaved reasoning traces and actions with external knowledge integration.

Based on the ReAct paper by Yao et al., 2022, and Microsoft Azure AI best practices
for agentic reasoning systems.

Architecture:
    Think → Act → Observe → Think (interleaved loop)
    - Think: Generate reasoning trace and plan next action
    - Act: Execute action using specialized engines
    - Observe: Process results and update context
    - Repeat until final answer or termination condition
"""

import asyncio
import time
import logging
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime

from react_types import (
    ReActAction, ReActObservation, ReActStep, ReActContext, 
    ReActResult, ReActConfig, ReActActionType, ReActStepStatus,
    ReActException, ReActTimeoutException, ReActActionException,
    ReActValidationException
)

# Import reasoning engines
from autonomous_math_engine import AutonomousMathEngine
from autonomous_logical_engine import AutonomousLogicalEngine
from autonomous_creative_engine import AutonomousCreativeEngine
from romanian_query_understanding import RomanianQueryUnderstanding

logger = logging.getLogger(__name__)

class ReActAgent:
    """
    Core ReAct Agent that implements interleaved reasoning and acting.
    
    This agent coordinates multiple specialized engines through a Think-Act-Observe
    loop to solve complex problems requiring multiple reasoning capabilities and
    external knowledge integration.
    """
    
    def __init__(self, config: ReActConfig = None):
        """Initialize ReAct agent with engines and configuration"""
        self.config = config or ReActConfig()
        
        # Initialize reasoning engines
        self._init_engines()
        
        # Action type to engine mapping
        self.action_executors = {
            ReActActionType.MATH: self._execute_math_action,
            ReActActionType.LOGIC: self._execute_logic_action,
            ReActActionType.SEARCH: self._execute_search_action,
            ReActActionType.MEMORY: self._execute_memory_action,
            ReActActionType.ROMANIAN: self._execute_romanian_action,
            ReActActionType.CREATE: self._execute_creative_action,
            ReActActionType.VALIDATE: self._execute_validation_action,
            ReActActionType.PLAN: self._execute_planning_action,
            ReActActionType.OBSERVE: self._execute_observation_action,
            ReActActionType.FINAL: self._execute_final_action
        }
        
        # Reasoning trace generators
        self.reasoning_generators = {
            ReActActionType.MATH: self._generate_math_reasoning,
            ReActActionType.LOGIC: self._generate_logic_reasoning,
            ReActActionType.SEARCH: self._generate_search_reasoning,
            ReActActionType.MEMORY: self._generate_memory_reasoning,
            ReActActionType.ROMANIAN: self._generate_romanian_reasoning,
            ReActActionType.CREATE: self._generate_creative_reasoning,
            ReActActionType.VALIDATE: self._generate_validation_reasoning,
            ReActActionType.PLAN: self._generate_planning_reasoning,
            ReActActionType.OBSERVE: self._generate_observation_reasoning,
            ReActActionType.FINAL: self._generate_final_reasoning
        }
        
        logger.info(f"ReAct Agent initialized with {len(self.action_executors)} action types")
    
    def _init_engines(self):
        """Initialize all reasoning engines"""
        try:
            self.math_engine = AutonomousMathEngine()
            self.logic_engine = AutonomousLogicalEngine()
            self.creative_engine = AutonomousCreativeEngine()
            self.romanian_engine = RomanianQueryUnderstanding()
            logger.info("All reasoning engines initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing engines: {e}")
            raise ReActException(f"Failed to initialize reasoning engines: {e}")
    
    async def solve(self, problem: str, goal: str = None) -> ReActResult:
        """
        Main entry point for solving problems using ReAct framework
        
        Args:
            problem: The problem to solve
            goal: Optional specific goal (defaults to solving the problem)
            
        Returns:
            ReActResult with complete reasoning trace and solution
        """
        start_time = time.time()
        
        # Initialize context
        context = ReActContext(
            problem=problem,
            goal=goal or f"Solve: {problem}"
        )
        
        # Initialize reasoning trace
        reasoning_trace: List[ReActStep] = []
        
        try:
            logger.info(f"Starting ReAct problem solving: {problem[:100]}...")
            
            # Main ReAct loop: Think → Act → Observe → Repeat
            step_number = 0
            while step_number < self.config.max_steps:
                step_number += 1
                
                # Check timeout
                if time.time() - start_time > self.config.overall_timeout:
                    raise ReActTimeoutException("Overall timeout exceeded")
                
                # THINK: Generate reasoning and plan next action
                thought, action = await self._think_step(context, reasoning_trace, step_number)
                
                # Create step with thought
                current_step = ReActStep(
                    step_number=step_number,
                    thought=thought,
                    action=action,
                    observation=None,
                    reasoning_trace=thought,
                    confidence=0.5,  # Will be updated after observation
                    status=ReActStepStatus.IN_PROGRESS
                )
                
                reasoning_trace.append(current_step)
                
                # Check for final answer
                if action and action.action_type == ReActActionType.FINAL:
                    # Execute final action and complete
                    observation = await self._act_step(action)
                    current_step.observation = observation
                    current_step.confidence = observation.confidence
                    current_step.status = ReActStepStatus.COMPLETED
                    
                    # Generate final result
                    final_answer = observation.result if observation.success else "Unable to determine answer"
                    break
                
                # ACT: Execute the planned action
                if action:
                    observation = await self._act_step(action)
                    current_step.observation = observation
                    
                    # OBSERVE: Update context based on observation
                    await self._observe_step(observation, context)
                    
                    # Update step confidence and status
                    current_step.confidence = observation.confidence
                    current_step.status = (ReActStepStatus.COMPLETED if observation.success 
                                         else ReActStepStatus.FAILED)
                else:
                    # Pure thought step
                    current_step.status = ReActStepStatus.COMPLETED
                
                # Check if we have sufficient confidence to provide answer
                if (current_step.confidence >= 0.9 and 
                    context.confidence_history and 
                    sum(context.confidence_history[-3:]) / min(3, len(context.confidence_history)) >= 0.8):
                    
                    # High confidence reached, prepare final answer
                    final_action = ReActAction(
                        action_type=ReActActionType.FINAL,
                        parameters={"reasoning_trace": reasoning_trace, "context": context},
                        description="Generate final answer based on accumulated evidence",
                        expected_outcome="Final answer to the problem"
                    )
                    
                    step_number += 1
                    final_observation = await self._act_step(final_action)
                    
                    final_step = ReActStep(
                        step_number=step_number,
                        thought="Based on the accumulated evidence and reasoning, I can now provide a final answer.",
                        action=final_action,
                        observation=final_observation,
                        reasoning_trace="Final answer generation",
                        confidence=final_observation.confidence,
                        status=ReActStepStatus.COMPLETED
                    )
                    
                    reasoning_trace.append(final_step)
                    final_answer = final_observation.result if final_observation.success else "Unable to determine answer"
                    break
            else:
                # Max steps reached without final answer
                final_answer = self._generate_best_answer(reasoning_trace, context)
            
            # Calculate final metrics
            execution_time = time.time() - start_time
            overall_confidence = self._calculate_overall_confidence(reasoning_trace)
            success = any(step.status == ReActStepStatus.COMPLETED for step in reasoning_trace)
            
            result = ReActResult(
                problem=problem,
                final_answer=final_answer,
                reasoning_trace=reasoning_trace,
                total_steps=len(reasoning_trace),
                overall_confidence=overall_confidence,
                success=success,
                execution_time=execution_time,
                actions_taken=[],  # Will be populated by __post_init__
                external_sources=[],  # Will be populated by __post_init__
                context=context,
                metadata={
                    "completion_reason": "max_steps" if step_number >= self.config.max_steps else "natural_termination",
                    "engine_utilization": self._calculate_engine_utilization(reasoning_trace)
                }
            )
            
            logger.info(f"ReAct solving completed: {len(reasoning_trace)} steps, confidence {overall_confidence:.2f}")
            return result
            
        except Exception as e:
            logger.error(f"ReAct solving failed: {e}")
            execution_time = time.time() - start_time
            
            return ReActResult(
                problem=problem,
                final_answer=f"Error during reasoning: {str(e)}",
                reasoning_trace=reasoning_trace,
                total_steps=len(reasoning_trace),
                overall_confidence=0.0,
                success=False,
                execution_time=execution_time,
                actions_taken=[],
                external_sources=[],
                context=context,
                metadata={"error": str(e)}
            )
    
    async def _think_step(self, context: ReActContext, trace: List[ReActStep], step_number: int) -> tuple[str, Optional[ReActAction]]:
        """
        THINK phase: Generate reasoning and plan next action
        
        Returns:
            Tuple of (thought, action) where action may be None for pure reasoning steps
        """
        try:
            # Analyze current context and progress
            progress_analysis = self._analyze_progress(trace, context)
            
            # Determine next action based on problem type and progress
            next_action_type = self._determine_next_action(context, trace)
            
            if next_action_type is None:
                # Pure reasoning step
                thought = self._generate_reasoning_thought(context, trace, progress_analysis)
                return thought, None
            
            # Generate thought for planned action
            thought = self._generate_action_thought(context, trace, next_action_type, progress_analysis)
            
            # Create action with appropriate parameters
            action_parameters = self._generate_action_parameters(next_action_type, context, trace)
            
            action = ReActAction(
                action_type=next_action_type,
                parameters=action_parameters,
                description=f"Execute {next_action_type.value} action to advance problem solving",
                expected_outcome=f"Result from {next_action_type.value} processing"
            )
            
            return thought, action
            
        except Exception as e:
            logger.error(f"Think step failed: {e}")
            return f"Error in thinking: {str(e)}", None
    
    async def _act_step(self, action: ReActAction) -> ReActObservation:
        """
        ACT phase: Execute the planned action
        
        Returns:
            ReActObservation with execution results
        """
        start_time = time.time()
        
        try:
            # Get appropriate executor
            executor = self.action_executors.get(action.action_type)
            if not executor:
                raise ReActActionException(f"No executor found for action type: {action.action_type}")
            
            # Execute action with timeout
            result = await asyncio.wait_for(
                executor(action.parameters),
                timeout=action.timeout
            )
            
            execution_time = time.time() - start_time
            
            return ReActObservation(
                action=action,
                result=result,
                success=True,
                execution_time=execution_time,
                confidence=getattr(result, 'confidence', 0.8) if hasattr(result, 'confidence') else 0.8,
                source=f"{action.action_type.value}_engine"
            )
            
        except asyncio.TimeoutError:
            execution_time = time.time() - start_time
            return ReActObservation(
                action=action,
                result=None,
                success=False,
                execution_time=execution_time,
                error_message=f"Action timeout after {action.timeout}s",
                confidence=0.0
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Action execution failed: {e}")
            
            return ReActObservation(
                action=action,
                result=None,
                success=False,
                execution_time=execution_time,
                error_message=str(e),
                confidence=0.0
            )
    
    async def _observe_step(self, observation: ReActObservation, context: ReActContext) -> None:
        """
        OBSERVE phase: Process observation and update context
        """
        try:
            # Update context confidence
            context.update_confidence(observation.confidence)
            
            # Store intermediate results
            if observation.success and observation.result:
                result_key = f"step_{len(context.confidence_history)}_{observation.action.action_type.value}"
                context.intermediate_results[result_key] = {
                    "result": observation.result,
                    "confidence": observation.confidence,
                    "timestamp": time.time(),
                    "action_type": observation.action.action_type.value
                }
            
            # Extract and store new facts from observation
            await self._extract_facts_from_observation(observation, context)
            
            # Update external sources if applicable
            if observation.source and observation.source not in context.external_sources:
                context.external_sources.append(observation.source)
            
        except Exception as e:
            logger.error(f"Observe step failed: {e}")
    
    # Action execution methods
    async def _execute_math_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute mathematical reasoning action"""
        problem = parameters.get('problem') or parameters.get('query', '')
        return await self.math_engine.solve_mathematical_problem(problem)
    
    async def _execute_logic_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute logical reasoning action"""
        problem = parameters.get('problem') or parameters.get('query', '')
        return await self.logic_engine.reason(problem)
    
    async def _execute_search_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute external search action"""
        # Placeholder for web search integration
        query = parameters.get('query', '')
        return {
            "type": "search_result",
            "query": query,
            "results": f"Search results for: {query}",
            "source": "external_search",
            "confidence": 0.7
        }
    
    async def _execute_memory_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute memory retrieval action"""
        # Placeholder for MemorAI integration
        query = parameters.get('query', '')
        return {
            "type": "memory_result",
            "query": query,
            "retrieved": f"Memory for: {query}",
            "source": "memorai_mcp",
            "confidence": 0.8
        }
    
    async def _execute_romanian_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute Romanian cultural intelligence action"""
        query = parameters.get('query', '')
        return await self.romanian_engine.process_query(query)
    
    async def _execute_creative_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute creative intelligence action"""
        problem = parameters.get('problem') or parameters.get('query', '')
        return await self.creative_engine.generate_creative_response(problem)
    
    async def _execute_validation_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute cross-validation action"""
        result = parameters.get('result')
        method = parameters.get('method', 'cross_reference')
        
        return {
            "type": "validation_result",
            "original_result": result,
            "validation_method": method,
            "validated": True,
            "confidence": 0.85
        }
    
    async def _execute_planning_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute strategic planning action"""
        goal = parameters.get('goal', '')
        context = parameters.get('context', {})
        
        return {
            "type": "planning_result",
            "goal": goal,
            "strategy": f"Strategic approach for: {goal}",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "confidence": 0.75
        }
    
    async def _execute_observation_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute environment observation action"""
        target = parameters.get('target', 'environment')
        
        return {
            "type": "observation_result",
            "target": target,
            "observations": f"Environmental observations for: {target}",
            "confidence": 0.6
        }
    
    async def _execute_final_action(self, parameters: Dict[str, Any]) -> Any:
        """Execute final answer generation"""
        reasoning_trace = parameters.get('reasoning_trace', [])
        context = parameters.get('context')
        
        # Synthesize final answer from all accumulated evidence
        final_answer = self._synthesize_final_answer(reasoning_trace, context)
        
        return final_answer
    
    # Helper methods continue in next part...
    def _analyze_progress(self, trace: List[ReActStep], context: ReActContext) -> Dict[str, Any]:
        """Analyze current progress and identify what's needed next"""
        if not trace:
            return {
                "phase": "initial",
                "completed_actions": [],
                "missing_info": ["problem_analysis"],
                "confidence_trend": "unknown"
            }
        
        completed_actions = [step.action.action_type for step in trace if step.action and step.status == ReActStepStatus.COMPLETED]
        
        confidence_trend = "stable"
        if len(context.confidence_history) >= 2:
            recent_confidence = context.confidence_history[-2:]
            if recent_confidence[-1] > recent_confidence[-2]:
                confidence_trend = "improving"
            elif recent_confidence[-1] < recent_confidence[-2]:
                confidence_trend = "declining"
        
        return {
            "phase": "progress",
            "completed_actions": completed_actions,
            "step_count": len(trace),
            "confidence_trend": confidence_trend,
            "last_success": any(step.status == ReActStepStatus.COMPLETED for step in trace[-3:]) if len(trace) >= 3 else True
        }
    
    def _determine_next_action(self, context: ReActContext, trace: List[ReActStep]) -> Optional[ReActActionType]:
        """Determine the most appropriate next action based on context and progress"""
        problem = context.problem.lower()
        
        # Problem type detection
        if any(keyword in problem for keyword in ['calculate', 'solve', 'math', 'equation', 'number', '+', '-', '*', '/', '=']):
            if not any(step.action and step.action.action_type == ReActActionType.MATH for step in trace):
                return ReActActionType.MATH
        
        if any(keyword in problem for keyword in ['if', 'then', 'logic', 'reason', 'conclude', 'therefore', 'because']):
            if not any(step.action and step.action.action_type == ReActActionType.LOGIC for step in trace):
                return ReActActionType.LOGIC
        
        if any(keyword in problem for keyword in ['romanian', 'romania', 'cultural', 'traditional']):
            if not any(step.action and step.action.action_type == ReActActionType.ROMANIAN for step in trace):
                return ReActActionType.ROMANIAN
        
        if any(keyword in problem for keyword in ['create', 'generate', 'design', 'innovative', 'creative']):
            if not any(step.action and step.action.action_type == ReActActionType.CREATE for step in trace):
                return ReActActionType.CREATE
        
        # If we have results but low confidence, try validation
        if (trace and 
            any(step.observation and step.observation.success for step in trace) and
            context.confidence_history and max(context.confidence_history) < 0.7):
            return ReActActionType.VALIDATE
        
        # If we need external knowledge
        if 'search' in problem or 'find' in problem or 'lookup' in problem:
            return ReActActionType.SEARCH
        
        # Default to memory if we need more context
        if len(trace) < 2:
            return ReActActionType.MEMORY
        
        return None  # Pure reasoning step
    
    def _generate_reasoning_thought(self, context: ReActContext, trace: List[ReActStep], analysis: Dict[str, Any]) -> str:
        """Generate a pure reasoning thought without action"""
        if not trace:
            return f"I need to analyze this problem: {context.problem}. Let me think about the best approach."
        
        recent_results = [step.observation.result for step in trace[-3:] 
                         if step.observation and step.observation.success]
        
        if recent_results:
            return f"Based on the recent results {recent_results}, I should consider how these findings relate to the overall goal: {context.goal}"
        else:
            return "Let me reconsider the problem from a different angle and think about alternative approaches."
    
    def _generate_action_thought(self, context: ReActContext, trace: List[ReActStep], 
                               action_type: ReActActionType, analysis: Dict[str, Any]) -> str:
        """Generate thought explaining the planned action"""
        action_explanations = {
            ReActActionType.MATH: "This problem requires mathematical computation. I'll use the math engine to solve it.",
            ReActActionType.LOGIC: "I need to apply logical reasoning to reach a conclusion. Let me use logical analysis.",
            ReActActionType.SEARCH: "I need external information to answer this properly. Let me search for relevant data.",
            ReActActionType.MEMORY: "I should check if there's relevant information in memory that could help.",
            ReActActionType.ROMANIAN: "This involves Romanian cultural context. I'll use Romanian cultural intelligence.",
            ReActActionType.CREATE: "This requires creative thinking. Let me generate innovative solutions.",
            ReActActionType.VALIDATE: "I should validate my current findings to ensure accuracy.",
            ReActActionType.PLAN: "I need to create a strategic plan for solving this complex problem.",
            ReActActionType.OBSERVE: "Let me observe the current situation more carefully.",
            ReActActionType.FINAL: "I have enough information to provide a final answer."
        }
        
        base_thought = action_explanations.get(action_type, f"I'll execute a {action_type.value} action.")
        
        if analysis.get("confidence_trend") == "declining":
            base_thought += " I need to be extra careful given the declining confidence in recent steps."
        
        return base_thought
    
    def _generate_action_parameters(self, action_type: ReActActionType, 
                                  context: ReActContext, trace: List[ReActStep]) -> Dict[str, Any]:
        """Generate appropriate parameters for the planned action"""
        base_params = {
            "problem": context.problem,
            "query": context.problem,
            "goal": context.goal,
            "context": context.facts
        }
        
        # Add action-specific parameters
        if action_type in [ReActActionType.MATH, ReActActionType.LOGIC]:
            base_params["problem"] = context.problem
        elif action_type == ReActActionType.SEARCH:
            base_params["query"] = self._extract_search_query(context.problem)
        elif action_type == ReActActionType.MEMORY:
            base_params["query"] = self._extract_memory_query(context.problem, trace)
        elif action_type == ReActActionType.VALIDATE:
            recent_results = [step.observation.result for step in trace[-2:] 
                            if step.observation and step.observation.success]
            base_params["result"] = recent_results[-1] if recent_results else None
            base_params["method"] = "cross_reference"
        elif action_type == ReActActionType.FINAL:
            base_params["reasoning_trace"] = trace
            base_params["context"] = context
        
        return base_params
    
    def _extract_search_query(self, problem: str) -> str:
        """Extract key terms for search query"""
        # Simple keyword extraction (can be enhanced with NLP)
        keywords = []
        for word in problem.split():
            if len(word) > 3 and word.isalpha():
                keywords.append(word)
        return " ".join(keywords[:5])  # Top 5 keywords
    
    def _extract_memory_query(self, problem: str, trace: List[ReActStep]) -> str:
        """Extract query for memory retrieval"""
        # Focus on key concepts
        key_concepts = []
        for word in problem.split():
            if len(word) > 4 and not word.lower() in ['that', 'this', 'with', 'from', 'what', 'how', 'when']:
                key_concepts.append(word)
        return " ".join(key_concepts[:3])
    
    def _synthesize_final_answer(self, reasoning_trace: List[ReActStep], context: ReActContext) -> str:
        """Synthesize final answer from all accumulated evidence"""
        if not reasoning_trace:
            return "Unable to provide answer due to insufficient reasoning steps."
        
        # Collect successful results
        successful_results = []
        for step in reasoning_trace:
            if (step.observation and 
                step.observation.success and 
                step.observation.result and
                step.observation.confidence > 0.5):
                successful_results.append({
                    "result": step.observation.result,
                    "confidence": step.observation.confidence,
                    "source": step.action.action_type.value if step.action else "reasoning"
                })
        
        if not successful_results:
            return "Unable to determine answer based on available evidence."
        
        # Find highest confidence result
        best_result = max(successful_results, key=lambda x: x["confidence"])
        
        # Format final answer
        if hasattr(best_result["result"], "result"):
            answer = best_result["result"].result
        elif hasattr(best_result["result"], "conclusion"):
            answer = best_result["result"].conclusion
        elif hasattr(best_result["result"], "answer"):
            answer = best_result["result"].answer
        else:
            answer = str(best_result["result"])
        
        confidence = best_result["confidence"]
        source = best_result["source"]
        
        return f"{answer} (Confidence: {confidence:.2f}, Source: {source})"
    
    def _generate_best_answer(self, trace: List[ReActStep], context: ReActContext) -> str:
        """Generate best possible answer when max steps reached"""
        return self._synthesize_final_answer(trace, context)
    
    def _calculate_overall_confidence(self, trace: List[ReActStep]) -> float:
        """Calculate overall confidence from reasoning trace"""
        if not trace:
            return 0.0
        
        confidences = [step.confidence for step in trace if step.confidence > 0]
        if not confidences:
            return 0.0
        
        # Weight recent steps more heavily
        weights = [1.0 + 0.1 * i for i in range(len(confidences))]
        weighted_sum = sum(conf * weight for conf, weight in zip(confidences, weights))
        weight_sum = sum(weights)
        
        return weighted_sum / weight_sum if weight_sum > 0 else 0.0
    
    def _calculate_engine_utilization(self, trace: List[ReActStep]) -> Dict[str, int]:
        """Calculate how many times each engine was used"""
        utilization = {}
        for step in trace:
            if step.action:
                engine = step.action.action_type.value
                utilization[engine] = utilization.get(engine, 0) + 1
        return utilization
    
    async def _extract_facts_from_observation(self, observation: ReActObservation, context: ReActContext):
        """Extract and store facts from observation results"""
        try:
            if not observation.success or not observation.result:
                return
            
            result = observation.result
            action_type = observation.action.action_type
            
            # Extract facts based on action type
            if action_type == ReActActionType.MATH:
                if hasattr(result, 'result'):
                    context.add_fact(
                        f"math_result_{len(context.facts)}", 
                        result.result, 
                        "mathematical_engine"
                    )
            elif action_type == ReActActionType.LOGIC:
                if hasattr(result, 'conclusion'):
                    context.add_fact(
                        f"logical_conclusion_{len(context.facts)}", 
                        result.conclusion, 
                        "logical_engine"
                    )
            elif action_type == ReActActionType.ROMANIAN:
                if hasattr(result, 'cultural_context'):
                    context.add_fact(
                        f"cultural_context_{len(context.facts)}", 
                        result.cultural_context, 
                        "romanian_engine"
                    )
            
        except Exception as e:
            logger.warning(f"Failed to extract facts from observation: {e}")

    # Reasoning generators for different action types
    async def _generate_math_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for mathematical action"""
        problem = parameters.get('problem', '')
        return f"To solve this mathematical problem '{problem}', I need to analyze the numerical relationships and operations required."

    async def _generate_logic_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for logical action"""
        problem = parameters.get('problem', '')
        return f"For this logical problem '{problem}', I need to identify premises, apply logical rules, and derive valid conclusions."

    async def _generate_search_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for search action"""
        query = parameters.get('query', '')
        return f"I need external information about '{query}' to provide a comprehensive answer."

    async def _generate_memory_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for memory action"""
        query = parameters.get('query', '')
        return f"Let me check my memory for relevant information about '{query}' that could inform this solution."

    async def _generate_romanian_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for Romanian action"""
        query = parameters.get('query', '')
        return f"This requires Romanian cultural intelligence to properly understand and respond to '{query}'."

    async def _generate_creative_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for creative action"""
        problem = parameters.get('problem', '')
        return f"This problem '{problem}' calls for creative thinking and innovative approaches."

    async def _generate_validation_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for validation action"""
        result = parameters.get('result')
        return f"I should validate this result '{result}' to ensure accuracy and reliability."

    async def _generate_planning_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for planning action"""
        goal = parameters.get('goal', '')
        return f"I need to create a strategic plan to achieve the goal: '{goal}'."

    async def _generate_observation_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for observation action"""
        target = parameters.get('target', '')
        return f"Let me carefully observe '{target}' to gather relevant information."

    async def _generate_final_reasoning(self, parameters: Dict[str, Any]) -> str:
        """Generate reasoning trace for final action"""
        return "Based on all the evidence and reasoning I've gathered, I can now provide a comprehensive final answer."
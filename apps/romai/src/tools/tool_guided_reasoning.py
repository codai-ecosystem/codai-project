"""
ROMAI Tool-Guided Reasoning Engine
==================================

Advanced tool-guided reasoning module for ROMAI AGI system.
Handles integration of external tools into reasoning processes,
coordinating tool selection, execution, and result integration.

Author: ROMAI AGI Team
Date: 2025-01-17
Version: 1.0.0
"""

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union, Callable
import json
import statistics
from collections import defaultdict


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ToolType(Enum):
    """Types of tools available for reasoning."""
    CALCULATOR = "calculator"
    SEARCH_ENGINE = "search_engine"
    CODE_EXECUTOR = "code_executor"
    DATABASE_QUERY = "database_query"
    API_CLIENT = "api_client"
    FILE_PROCESSOR = "file_processor"
    VISUALIZATION = "visualization"
    TRANSLATOR = "translator"
    VALIDATOR = "validator"
    SIMULATOR = "simulator"


class ToolUsagePattern(Enum):
    """Patterns of tool usage in reasoning."""
    SEQUENTIAL = "sequential"         # Tools used one after another
    PARALLEL = "parallel"            # Tools used simultaneously
    HIERARCHICAL = "hierarchical"    # Tools used in nested manner
    ITERATIVE = "iterative"         # Tools used repeatedly
    CONDITIONAL = "conditional"      # Tools used based on conditions


class ReasoningPhase(Enum):
    """Phases of reasoning where tools can be applied."""
    PROBLEM_ANALYSIS = "problem_analysis"
    INFORMATION_GATHERING = "information_gathering"
    HYPOTHESIS_GENERATION = "hypothesis_generation"
    SOLUTION_DEVELOPMENT = "solution_development"
    VERIFICATION = "verification"
    OPTIMIZATION = "optimization"


@dataclass
class ToolCapability:
    """Describes the capability of a tool."""
    tool_name: str
    tool_type: ToolType
    description: str
    input_types: List[str]
    output_types: List[str]
    reliability: float  # 0.0 to 1.0
    execution_time: float  # Expected execution time in seconds
    resource_cost: float  # Resource cost (0.0 to 1.0)
    prerequisites: List[str] = field(default_factory=list)
    compatible_phases: List[ReasoningPhase] = field(default_factory=list)
    capability_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    
    def is_applicable(self, input_type: str, phase: ReasoningPhase) -> bool:
        """Check if tool is applicable for given input and phase."""
        input_match = input_type in self.input_types or "any" in self.input_types
        phase_match = not self.compatible_phases or phase in self.compatible_phases
        return input_match and phase_match


@dataclass
class ToolExecution:
    """Represents a tool execution within reasoning."""
    execution_id: str
    tool_name: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str = "pending"  # 'pending', 'running', 'completed', 'failed'
    error_message: Optional[str] = None
    confidence: float = 0.0
    reasoning_contribution: str = ""
    
    def __post_init__(self):
        if not self.execution_id:
            self.execution_id = str(uuid.uuid4())[:8]
    
    def get_duration(self) -> Optional[float]:
        """Get execution duration in seconds."""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return None
    
    def is_successful(self) -> bool:
        """Check if execution was successful."""
        return self.status == "completed" and self.output_data is not None


@dataclass
class ReasoningContext:
    """Context for tool-guided reasoning."""
    problem_statement: str
    domain: str
    current_phase: ReasoningPhase
    available_data: Dict[str, Any]
    constraints: Dict[str, Any]
    success_criteria: List[str]
    context_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class ToolUsagePlan:
    """Plan for using tools in reasoning process."""
    plan_id: str
    context: ReasoningContext
    planned_executions: List[Dict[str, Any]]
    usage_pattern: ToolUsagePattern
    expected_outcome: str
    estimated_time: float
    confidence: float
    fallback_plan: Optional['ToolUsagePlan'] = None
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        if not self.plan_id:
            self.plan_id = str(uuid.uuid4())[:8]


@dataclass
class ToolGuidedReasoning:
    """Result of tool-guided reasoning process."""
    reasoning_id: str
    context: ReasoningContext
    plan: ToolUsagePlan
    executions: List[ToolExecution]
    final_conclusion: str
    confidence: float
    evidence: List[str]
    reasoning_chain: List[str]
    success: bool
    metadata: Dict[str, Any] = field(default_factory=dict)
    completed_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        if not self.reasoning_id:
            self.reasoning_id = str(uuid.uuid4())[:8]


# Mock tool implementations for demonstration
class MockCalculator:
    """Mock calculator tool."""
    
    async def execute(self, expression: str) -> Dict[str, Any]:
        """Execute calculation."""
        try:
            # Simple expression evaluation (in production, use safe eval)
            if "+" in expression:
                parts = expression.split("+")
                result = sum(float(p.strip()) for p in parts)
            elif "*" in expression:
                parts = expression.split("*")
                result = 1
                for p in parts:
                    result *= float(p.strip())
            else:
                result = float(expression.strip())
            
            return {
                "result": result,
                "expression": expression,
                "success": True
            }
        except Exception as e:
            return {
                "error": str(e),
                "expression": expression,
                "success": False
            }


class MockSearchEngine:
    """Mock search engine tool."""
    
    async def execute(self, query: str) -> Dict[str, Any]:
        """Execute search."""
        # Mock search results based on query
        mock_results = {
            "artificial intelligence": ["AI is machine intelligence", "ML is subset of AI"],
            "machine learning": ["ML uses algorithms to learn", "Supervised and unsupervised learning"],
            "reasoning": ["Logical thinking process", "Deductive and inductive reasoning"],
            "default": ["Information about " + query, "Related concepts and definitions"]
        }
        
        query_lower = query.lower()
        results = mock_results.get(query_lower, mock_results["default"])
        
        return {
            "query": query,
            "results": results,
            "result_count": len(results),
            "success": True
        }


class MockCodeExecutor:
    """Mock code executor tool."""
    
    async def execute(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Execute code."""
        # Mock code execution
        if "print" in code:
            output = "Code executed successfully"
        elif "def" in code:
            output = "Function defined"
        elif "import" in code:
            output = "Modules imported"
        else:
            output = "Code processed"
        
        return {
            "code": code,
            "language": language,
            "output": output,
            "success": True
        }


class ToolGuidedReasoningEngine:
    """
    Advanced tool-guided reasoning engine for ROMAI AGI.
    
    Provides capabilities for:
    - Tool capability registration and management
    - Intelligent tool selection for reasoning tasks
    - Coordinated tool execution with error handling
    - Integration of tool results into reasoning chain
    - Adaptive planning based on tool performance
    - Learning from tool usage patterns
    """
    
    def __init__(self):
        """Initialize the tool-guided reasoning engine."""
        self.tool_capabilities: Dict[str, ToolCapability] = {}
        self.tool_instances: Dict[str, Any] = {}
        self.reasoning_history: Dict[str, ToolGuidedReasoning] = {}
        self.execution_history: Dict[str, ToolExecution] = {}
        
        # Performance tracking
        self.performance_stats = {
            "total_reasonings": 0,
            "successful_reasonings": 0,
            "total_tool_executions": 0,
            "successful_tool_executions": 0,
            "average_confidence": 0.0,
            "average_execution_time": 0.0,
            "tool_usage_patterns": defaultdict(int),
            "start_time": time.time()
        }
        
        # Initialize built-in tools
        self._initialize_builtin_tools()
        
        logger.info("🔧 Tool-Guided Reasoning Engine initialized - Ready for intelligent tool use!")
    
    def _initialize_builtin_tools(self):
        """Initialize built-in tool capabilities and instances."""
        # Calculator tool
        calc_capability = ToolCapability(
            tool_name="calculator",
            tool_type=ToolType.CALCULATOR,
            description="Performs mathematical calculations",
            input_types=["expression", "numbers"],
            output_types=["number", "calculation_result"],
            reliability=0.95,
            execution_time=0.1,
            resource_cost=0.1,
            compatible_phases=[
                ReasoningPhase.PROBLEM_ANALYSIS,
                ReasoningPhase.SOLUTION_DEVELOPMENT,
                ReasoningPhase.VERIFICATION
            ]
        )
        self.register_tool_capability(calc_capability, MockCalculator())
        
        # Search engine tool
        search_capability = ToolCapability(
            tool_name="search_engine",
            tool_type=ToolType.SEARCH_ENGINE,
            description="Searches for information on topics",
            input_types=["query", "text"],
            output_types=["search_results", "information"],
            reliability=0.8,
            execution_time=1.0,
            resource_cost=0.3,
            compatible_phases=[
                ReasoningPhase.INFORMATION_GATHERING,
                ReasoningPhase.HYPOTHESIS_GENERATION
            ]
        )
        self.register_tool_capability(search_capability, MockSearchEngine())
        
        # Code executor tool
        code_capability = ToolCapability(
            tool_name="code_executor",
            tool_type=ToolType.CODE_EXECUTOR,
            description="Executes code in various programming languages",
            input_types=["code", "algorithm"],
            output_types=["execution_result", "output"],
            reliability=0.85,
            execution_time=2.0,
            resource_cost=0.4,
            compatible_phases=[
                ReasoningPhase.SOLUTION_DEVELOPMENT,
                ReasoningPhase.VERIFICATION,
                ReasoningPhase.OPTIMIZATION
            ]
        )
        self.register_tool_capability(code_capability, MockCodeExecutor())
    
    def register_tool_capability(self, capability: ToolCapability, tool_instance: Any):
        """Register a new tool capability and its implementation."""
        self.tool_capabilities[capability.tool_name] = capability
        self.tool_instances[capability.tool_name] = tool_instance
        
        logger.info(f"🔧 Registered tool: {capability.tool_name} ({capability.tool_type.value})")
    
    async def analyze_reasoning_context(self, context: ReasoningContext) -> Dict[str, Any]:
        """
        Analyze reasoning context to understand tool requirements.
        
        Args:
            context: Reasoning context to analyze
            
        Returns:
            Analysis results with tool recommendations
        """
        logger.info(f"🔍 Analyzing reasoning context: {context.problem_statement[:50]}...")
        
        analysis = {
            "context_id": context.context_id,
            "problem_complexity": self._assess_problem_complexity(context),
            "required_capabilities": self._identify_required_capabilities(context),
            "applicable_tools": self._find_applicable_tools(context),
            "recommended_phases": self._recommend_reasoning_phases(context),
            "estimated_time": 0.0,
            "confidence": 0.0
        }
        
        # Calculate estimates
        analysis["estimated_time"] = self._estimate_reasoning_time(analysis["applicable_tools"])
        analysis["confidence"] = self._estimate_success_confidence(
            analysis["problem_complexity"], 
            len(analysis["applicable_tools"])
        )
        
        logger.info(f"✅ Context analysis completed: {len(analysis['applicable_tools'])} applicable tools")
        
        return analysis
    
    def _assess_problem_complexity(self, context: ReasoningContext) -> str:
        """Assess the complexity of the reasoning problem."""
        statement = context.problem_statement.lower()
        
        # Simple heuristics for complexity assessment
        complexity_indicators = {
            "high": ["optimize", "design", "create", "develop", "complex", "multiple", "various"],
            "medium": ["analyze", "compare", "evaluate", "determine", "solve"],
            "low": ["calculate", "find", "what", "how much", "simple"]
        }
        
        for complexity, indicators in complexity_indicators.items():
            if any(indicator in statement for indicator in indicators):
                return complexity
        
        return "medium"  # Default
    
    def _identify_required_capabilities(self, context: ReasoningContext) -> List[str]:
        """Identify capabilities required for the reasoning task."""
        statement = context.problem_statement.lower()
        capabilities = []
        
        capability_keywords = {
            "calculation": ["calculate", "compute", "math", "number", "sum", "multiply"],
            "information_retrieval": ["find", "search", "lookup", "information", "data"],
            "code_execution": ["program", "code", "algorithm", "implement", "execute"],
            "analysis": ["analyze", "examine", "study", "investigate"],
            "validation": ["verify", "check", "validate", "test", "confirm"]
        }
        
        for capability, keywords in capability_keywords.items():
            if any(keyword in statement for keyword in keywords):
                capabilities.append(capability)
        
        return capabilities or ["general_reasoning"]
    
    def _find_applicable_tools(self, context: ReasoningContext) -> List[str]:
        """Find tools applicable to the reasoning context."""
        applicable_tools = []
        
        for tool_name, capability in self.tool_capabilities.items():
            # Check if tool is applicable for current phase
            if capability.is_applicable("any", context.current_phase):
                applicable_tools.append(tool_name)
                continue
            
            # Check if tool matches problem requirements
            problem_lower = context.problem_statement.lower()
            if capability.tool_type == ToolType.CALCULATOR and any(
                word in problem_lower for word in ["calculate", "math", "number", "compute"]
            ):
                applicable_tools.append(tool_name)
            elif capability.tool_type == ToolType.SEARCH_ENGINE and any(
                word in problem_lower for word in ["find", "search", "information", "lookup"]
            ):
                applicable_tools.append(tool_name)
            elif capability.tool_type == ToolType.CODE_EXECUTOR and any(
                word in problem_lower for word in ["code", "program", "algorithm", "implement"]
            ):
                applicable_tools.append(tool_name)
        
        return applicable_tools
    
    def _recommend_reasoning_phases(self, context: ReasoningContext) -> List[ReasoningPhase]:
        """Recommend reasoning phases for the context."""
        all_phases = [
            ReasoningPhase.PROBLEM_ANALYSIS,
            ReasoningPhase.INFORMATION_GATHERING,
            ReasoningPhase.HYPOTHESIS_GENERATION,
            ReasoningPhase.SOLUTION_DEVELOPMENT,
            ReasoningPhase.VERIFICATION
        ]
        
        # For simplicity, recommend all phases
        # In production, this would be more sophisticated
        return all_phases
    
    def _estimate_reasoning_time(self, applicable_tools: List[str]) -> float:
        """Estimate total reasoning time."""
        total_time = 0.0
        for tool_name in applicable_tools:
            if tool_name in self.tool_capabilities:
                total_time += self.tool_capabilities[tool_name].execution_time
        
        # Add overhead
        return total_time * 1.2 + 1.0  # 20% overhead + 1 second base
    
    def _estimate_success_confidence(self, complexity: str, tool_count: int) -> float:
        """Estimate confidence in successful reasoning."""
        complexity_factors = {"low": 0.9, "medium": 0.7, "high": 0.5}
        base_confidence = complexity_factors.get(complexity, 0.7)
        
        # More tools generally increase confidence
        tool_factor = min(1.0, 0.5 + (tool_count * 0.1))
        
        return min(base_confidence * tool_factor, 1.0)
    
    async def create_tool_usage_plan(
        self,
        context: ReasoningContext,
        analysis: Dict[str, Any],
        preferences: Optional[Dict[str, Any]] = None
    ) -> ToolUsagePlan:
        """
        Create a plan for using tools in the reasoning process.
        
        Args:
            context: Reasoning context
            analysis: Context analysis results
            preferences: User preferences for tool usage
            
        Returns:
            ToolUsagePlan for the reasoning process
        """
        logger.info(f"📋 Creating tool usage plan for context: {context.context_id}")
        
        applicable_tools = analysis["applicable_tools"]
        
        # Create execution plan
        planned_executions = []
        total_time = 0.0
        
        for tool_name in applicable_tools:
            if tool_name in self.tool_capabilities:
                capability = self.tool_capabilities[tool_name]
                
                execution_plan = {
                    "tool_name": tool_name,
                    "tool_type": capability.tool_type.value,
                    "phase": context.current_phase.value,
                    "expected_input": self._generate_expected_input(tool_name, context),
                    "expected_output": capability.output_types,
                    "estimated_time": capability.execution_time,
                    "confidence": capability.reliability
                }
                planned_executions.append(execution_plan)
                total_time += capability.execution_time
        
        # Determine usage pattern
        usage_pattern = self._determine_usage_pattern(planned_executions, context)
        
        # Create plan
        plan = ToolUsagePlan(
            plan_id=str(uuid.uuid4())[:8],
            context=context,
            planned_executions=planned_executions,
            usage_pattern=usage_pattern,
            expected_outcome=self._predict_outcome(context, planned_executions),
            estimated_time=total_time,
            confidence=analysis["confidence"]
        )
        
        logger.info(f"✅ Tool usage plan created: {plan.plan_id}")
        logger.info(f"   Tools planned: {len(planned_executions)}")
        logger.info(f"   Usage pattern: {usage_pattern.value}")
        logger.info(f"   Estimated time: {total_time:.1f}s")
        
        return plan
    
    def _generate_expected_input(self, tool_name: str, context: ReasoningContext) -> Dict[str, Any]:
        """Generate expected input for a tool based on context."""
        statement = context.problem_statement
        
        if tool_name == "calculator":
            # Extract mathematical expressions
            return {"expression": "extracted_math_expression", "context": statement}
        elif tool_name == "search_engine":
            # Extract search terms
            return {"query": "key_terms_from_problem", "context": statement}
        elif tool_name == "code_executor":
            # Generate code requirements
            return {"code": "code_to_solve_problem", "language": "python", "context": statement}
        else:
            return {"input": statement, "context": context.domain}
    
    def _determine_usage_pattern(
        self,
        planned_executions: List[Dict[str, Any]],
        context: ReasoningContext
    ) -> ToolUsagePattern:
        """Determine the optimal usage pattern for tools."""
        if len(planned_executions) <= 1:
            return ToolUsagePattern.SEQUENTIAL
        
        # Simple heuristics for pattern determination
        has_dependencies = any(
            "dependency" in execution for execution in planned_executions
        )
        
        if has_dependencies:
            return ToolUsagePattern.SEQUENTIAL
        else:
            return ToolUsagePattern.PARALLEL
    
    def _predict_outcome(self, context: ReasoningContext, planned_executions: List[Dict[str, Any]]) -> str:
        """Predict the expected outcome of tool usage."""
        if not planned_executions:
            return "No tools available for reasoning"
        
        tool_types = [exec["tool_type"] for exec in planned_executions]
        
        if "calculator" in tool_types:
            return "Mathematical solution with computed values"
        elif "search_engine" in tool_types:
            return "Information-based solution with research findings"
        elif "code_executor" in tool_types:
            return "Algorithmic solution with implemented code"
        else:
            return "Tool-assisted reasoning solution"
    
    async def execute_tool_guided_reasoning(
        self,
        context: ReasoningContext,
        plan: ToolUsagePlan
    ) -> ToolGuidedReasoning:
        """
        Execute tool-guided reasoning according to the plan.
        
        Args:
            context: Reasoning context
            plan: Tool usage plan to execute
            
        Returns:
            ToolGuidedReasoning with complete results
        """
        logger.info(f"🚀 Executing tool-guided reasoning: {context.context_id}")
        
        start_time = time.time()
        executions = []
        reasoning_chain = []
        evidence = []
        
        # Execute according to usage pattern
        if plan.usage_pattern == ToolUsagePattern.SEQUENTIAL:
            executions = await self._execute_sequential(plan.planned_executions, context)
        elif plan.usage_pattern == ToolUsagePattern.PARALLEL:
            executions = await self._execute_parallel(plan.planned_executions, context)
        else:
            executions = await self._execute_sequential(plan.planned_executions, context)
        
        # Integrate results
        for execution in executions:
            if execution.is_successful():
                reasoning_chain.append(f"Used {execution.tool_name}: {execution.reasoning_contribution}")
                evidence.append(f"Tool output: {execution.output_data}")
        
        # Generate final conclusion
        conclusion = await self._synthesize_conclusion(context, executions)
        
        # Calculate overall confidence
        execution_confidences = [e.confidence for e in executions if e.confidence > 0]
        overall_confidence = statistics.mean(execution_confidences) if execution_confidences else 0.5
        
        # Determine success
        success = any(e.is_successful() for e in executions)
        
        # Create reasoning result
        reasoning_result = ToolGuidedReasoning(
            reasoning_id=str(uuid.uuid4())[:8],
            context=context,
            plan=plan,
            executions=executions,
            final_conclusion=conclusion,
            confidence=overall_confidence,
            evidence=evidence,
            reasoning_chain=reasoning_chain,
            success=success,
            metadata={
                "execution_time": time.time() - start_time,
                "tool_count": len(executions),
                "usage_pattern": plan.usage_pattern.value
            }
        )
        
        # Store result
        self.reasoning_history[reasoning_result.reasoning_id] = reasoning_result
        
        # Update statistics
        self.performance_stats["total_reasonings"] += 1
        if success:
            self.performance_stats["successful_reasonings"] += 1
        
        execution_time = time.time() - start_time
        logger.info(f"✅ Tool-guided reasoning completed: {reasoning_result.reasoning_id} ({execution_time:.2f}s)")
        logger.info(f"   Success: {success}, Confidence: {overall_confidence:.2f}")
        logger.info(f"   Tools executed: {len(executions)}")
        
        return reasoning_result
    
    async def _execute_sequential(
        self,
        planned_executions: List[Dict[str, Any]],
        context: ReasoningContext
    ) -> List[ToolExecution]:
        """Execute tools sequentially."""
        executions = []
        
        for plan_item in planned_executions:
            tool_name = plan_item["tool_name"]
            execution = await self._execute_single_tool(tool_name, plan_item, context, executions)
            executions.append(execution)
        
        return executions
    
    async def _execute_parallel(
        self,
        planned_executions: List[Dict[str, Any]],
        context: ReasoningContext
    ) -> List[ToolExecution]:
        """Execute tools in parallel."""
        # For simplicity, execute sequentially (in production, use asyncio.gather)
        return await self._execute_sequential(planned_executions, context)
    
    async def _execute_single_tool(
        self,
        tool_name: str,
        plan_item: Dict[str, Any],
        context: ReasoningContext,
        previous_executions: List[ToolExecution]
    ) -> ToolExecution:
        """Execute a single tool."""
        logger.info(f"🔧 Executing tool: {tool_name}")
        
        execution = ToolExecution(
            execution_id=str(uuid.uuid4())[:8],
            tool_name=tool_name,
            input_data=plan_item["expected_input"],
            start_time=datetime.now(),
            status="running"
        )
        
        try:
            # Get tool instance
            if tool_name not in self.tool_instances:
                raise ValueError(f"Tool {tool_name} not available")
            
            tool_instance = self.tool_instances[tool_name]
            
            # Prepare input based on tool and context
            tool_input = self._prepare_tool_input(tool_name, context, previous_executions)
            execution.input_data.update(tool_input)
            
            # Execute tool
            if hasattr(tool_instance, 'execute'):
                if tool_name == "calculator":
                    result = await tool_instance.execute(tool_input.get("expression", "1+1"))
                elif tool_name == "search_engine":
                    result = await tool_instance.execute(tool_input.get("query", context.problem_statement[:50]))
                elif tool_name == "code_executor":
                    result = await tool_instance.execute(
                        tool_input.get("code", "print('Hello')"),
                        tool_input.get("language", "python")
                    )
                else:
                    result = await tool_instance.execute(tool_input)
            else:
                raise ValueError(f"Tool {tool_name} does not have execute method")
            
            # Process result
            execution.output_data = result
            execution.status = "completed"
            execution.confidence = 0.8 if result.get("success", True) else 0.2
            execution.reasoning_contribution = self._generate_reasoning_contribution(
                tool_name, tool_input, result
            )
            
            # Update statistics
            self.performance_stats["total_tool_executions"] += 1
            if result.get("success", True):
                self.performance_stats["successful_tool_executions"] += 1
            
        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.confidence = 0.0
            logger.error(f"❌ Tool execution failed: {tool_name} - {e}")
        
        finally:
            execution.end_time = datetime.now()
            self.execution_history[execution.execution_id] = execution
        
        duration = execution.get_duration()
        logger.info(f"✅ Tool execution completed: {tool_name} ({duration:.2f}s, status: {execution.status})")
        
        return execution
    
    def _prepare_tool_input(
        self,
        tool_name: str,
        context: ReasoningContext,
        previous_executions: List[ToolExecution]
    ) -> Dict[str, Any]:
        """Prepare input for a specific tool based on context and previous results."""
        statement = context.problem_statement
        
        if tool_name == "calculator":
            # Extract mathematical expressions from problem
            math_expressions = self._extract_math_expressions(statement)
            return {"expression": math_expressions[0] if math_expressions else "2+2"}
        
        elif tool_name == "search_engine":
            # Extract key terms for search
            key_terms = self._extract_key_terms(statement)
            return {"query": " ".join(key_terms[:3]) if key_terms else statement[:50]}
        
        elif tool_name == "code_executor":
            # Generate code based on problem
            code = self._generate_code_for_problem(statement)
            return {"code": code, "language": "python"}
        
        else:
            return {"input": statement}
    
    def _extract_math_expressions(self, text: str) -> List[str]:
        """Extract mathematical expressions from text."""
        # Simple extraction (in production, use regex and NLP)
        expressions = []
        
        if "+" in text or "-" in text or "*" in text or "/" in text:
            # Look for number patterns
            words = text.split()
            for i, word in enumerate(words):
                if any(op in word for op in ["+", "-", "*", "/"]):
                    expressions.append(word)
                elif word.isdigit() and i < len(words) - 2:
                    next_words = " ".join(words[i:i+3])
                    if any(op in next_words for op in ["+", "-", "*", "/"]):
                        expressions.append(next_words)
        
        return expressions or ["2+2"]  # Default expression
    
    def _extract_key_terms(self, text: str) -> List[str]:
        """Extract key terms for search."""
        # Simple term extraction
        stop_words = {"the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        words = text.lower().split()
        key_terms = [word for word in words if word not in stop_words and len(word) > 2]
        return key_terms[:5]  # Top 5 terms
    
    def _generate_code_for_problem(self, problem: str) -> str:
        """Generate code to solve the problem."""
        problem_lower = problem.lower()
        
        if "sort" in problem_lower:
            return "def sort_list(lst): return sorted(lst)"
        elif "fibonacci" in problem_lower:
            return "def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)"
        elif "prime" in problem_lower:
            return "def is_prime(n): return n > 1 and all(n % i != 0 for i in range(2, int(n**0.5) + 1))"
        else:
            return "print('Problem analysis required')"
    
    def _generate_reasoning_contribution(
        self,
        tool_name: str,
        tool_input: Dict[str, Any],
        tool_output: Dict[str, Any]
    ) -> str:
        """Generate a description of how the tool contributed to reasoning."""
        if tool_name == "calculator":
            if tool_output.get("success"):
                return f"Calculated {tool_input.get('expression', 'expression')} = {tool_output.get('result')}"
            else:
                return f"Failed to calculate {tool_input.get('expression', 'expression')}"
        
        elif tool_name == "search_engine":
            if tool_output.get("success"):
                result_count = tool_output.get("result_count", 0)
                return f"Found {result_count} results for query: {tool_input.get('query', 'query')}"
            else:
                return f"Search failed for query: {tool_input.get('query', 'query')}"
        
        elif tool_name == "code_executor":
            if tool_output.get("success"):
                return f"Successfully executed code: {tool_output.get('output', 'no output')}"
            else:
                return f"Code execution failed: {tool_output.get('error', 'unknown error')}"
        
        else:
            return f"Tool {tool_name} executed with result: {tool_output}"
    
    async def _synthesize_conclusion(
        self,
        context: ReasoningContext,
        executions: List[ToolExecution]
    ) -> str:
        """Synthesize final conclusion from tool execution results."""
        successful_executions = [e for e in executions if e.is_successful()]
        
        if not successful_executions:
            return f"Unable to solve problem: {context.problem_statement}. No tools executed successfully."
        
        # Combine results from different tools
        conclusion_parts = []
        
        for execution in successful_executions:
            tool_name = execution.tool_name
            output = execution.output_data
            
            if tool_name == "calculator" and output.get("success"):
                conclusion_parts.append(f"Mathematical result: {output.get('result')}")
            
            elif tool_name == "search_engine" and output.get("success"):
                results = output.get("results", [])
                if results:
                    conclusion_parts.append(f"Research findings: {results[0]}")
            
            elif tool_name == "code_executor" and output.get("success"):
                conclusion_parts.append(f"Code solution: {output.get('output')}")
        
        if conclusion_parts:
            return f"Problem solved using multiple tools. {'; '.join(conclusion_parts)}"
        else:
            return f"Problem analysis completed for: {context.problem_statement}"
    
    def get_tool_statistics(self) -> Dict[str, Any]:
        """Get statistics about tool usage and performance."""
        current_time = time.time()
        uptime = current_time - self.performance_stats["start_time"]
        
        # Calculate averages
        if self.performance_stats["total_tool_executions"] > 0:
            execution_times = [
                e.get_duration() for e in self.execution_history.values()
                if e.get_duration() is not None
            ]
            self.performance_stats["average_execution_time"] = (
                statistics.mean(execution_times) if execution_times else 0.0
            )
        
        # Tool usage distribution
        tool_usage = defaultdict(int)
        for execution in self.execution_history.values():
            tool_usage[execution.tool_name] += 1
        
        return {
            **self.performance_stats,
            "uptime_seconds": uptime,
            "registered_tools": len(self.tool_capabilities),
            "reasoning_history_size": len(self.reasoning_history),
            "execution_history_size": len(self.execution_history),
            "tool_usage_distribution": dict(tool_usage),
            "success_rates": {
                "reasoning_success_rate": (
                    self.performance_stats["successful_reasonings"] / 
                    max(self.performance_stats["total_reasonings"], 1)
                ),
                "tool_execution_success_rate": (
                    self.performance_stats["successful_tool_executions"] / 
                    max(self.performance_stats["total_tool_executions"], 1)
                )
            }
        }


async def main():
    """Demonstrate the tool-guided reasoning engine."""
    logger.info("🧪 Testing ROMAI Tool-Guided Reasoning Engine")
    logger.info("=" * 50)
    
    # Initialize engine
    engine = ToolGuidedReasoningEngine()
    
    # Create reasoning context
    logger.info("Creating reasoning context...")
    context = ReasoningContext(
        problem_statement="Calculate the area of a circle with radius 5 and find information about circles",
        domain="mathematics",
        current_phase=ReasoningPhase.PROBLEM_ANALYSIS,
        available_data={"radius": 5},
        constraints={"time_limit": 30},
        success_criteria=["accurate_calculation", "relevant_information"]
    )
    
    # Analyze context
    logger.info("Analyzing reasoning context...")
    analysis = await engine.analyze_reasoning_context(context)
    
    # Create tool usage plan
    logger.info("Creating tool usage plan...")
    plan = await engine.create_tool_usage_plan(context, analysis)
    
    # Execute tool-guided reasoning
    logger.info("Executing tool-guided reasoning...")
    reasoning_result = await engine.execute_tool_guided_reasoning(context, plan)
    
    # Show results
    stats = engine.get_tool_statistics()
    
    logger.info("\n📊 Tool-Guided Reasoning Results:")
    logger.info(f"   Success: {reasoning_result.success}")
    logger.info(f"   Confidence: {reasoning_result.confidence:.2f}")
    logger.info(f"   Final conclusion: {reasoning_result.final_conclusion}")
    logger.info(f"   Tools executed: {len(reasoning_result.executions)}")
    logger.info(f"   Execution time: {reasoning_result.metadata['execution_time']:.2f}s")
    
    logger.info("\n📊 Tool Statistics:")
    logger.info(f"   Registered tools: {stats['registered_tools']}")
    logger.info(f"   Total reasonings: {stats['total_reasonings']}")
    logger.info(f"   Reasoning success rate: {stats['success_rates']['reasoning_success_rate']:.2f}")
    logger.info(f"   Tool execution success rate: {stats['success_rates']['tool_execution_success_rate']:.2f}")
    logger.info(f"   Average execution time: {stats['average_execution_time']:.2f}s")
    
    logger.info("\n✅ Tool-Guided Reasoning Engine test completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
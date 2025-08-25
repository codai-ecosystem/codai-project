"""
RomAI AGI Tool Integration Training System - Phase 2 Implementation
Advanced tool integration with API usage learning, code execution, and multi-tool orchestration.
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import json
import time
import subprocess
import requests
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class ToolType(Enum):
    """Types of tools available for integration"""
    API_ENDPOINT = "api_endpoint"
    CODE_EXECUTOR = "code_executor"
    WEB_SEARCH = "web_search"
    CALCULATOR = "calculator"
    DATABASE_QUERY = "database_query"
    FILE_SYSTEM = "file_system"
    ROMANIAN_LANGUAGE = "romanian_language"
    CULTURAL_DATABASE = "cultural_database"

class ToolCapability(Enum):
    """Tool capabilities"""
    READ_ONLY = "read_only"
    WRITE_CAPABLE = "write_capable"
    COMPUTE_INTENSIVE = "compute_intensive"
    NETWORK_DEPENDENT = "network_dependent"
    SECURE_REQUIRED = "secure_required"
    CULTURAL_AWARE = "cultural_aware"

@dataclass
class ToolSpec:
    """Tool specification and metadata"""
    tool_id: str
    name: str
    tool_type: ToolType
    capabilities: List[ToolCapability]
    description: str
    usage_pattern: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    romanian_cultural_integration: float = 0.0
    safety_level: str = "medium"  # low, medium, high
    cost_estimate: float = 0.0

@dataclass
class ToolUsageResult:
    """Result of tool usage"""
    tool_id: str
    success: bool
    result: Any
    execution_time: float
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ToolChainExecution:
    """Result of multi-tool chain execution"""
    chain_id: str
    tools_used: List[str]
    results: List[ToolUsageResult]
    final_result: Any
    total_execution_time: float
    success_rate: float
    romanian_cultural_enhancement: float = 0.0

class BaseTool(ABC):
    """Base class for all tools"""
    
    def __init__(self, spec: ToolSpec):
        self.spec = spec
        self.usage_history = []
        self.performance_metrics = {
            "success_rate": 0.0,
            "avg_execution_time": 0.0,
            "total_uses": 0
        }
    
    @abstractmethod
    async def execute(self, inputs: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> ToolUsageResult:
        """Execute the tool with given inputs"""
        pass
    
    async def learn_from_usage(self, result: ToolUsageResult, feedback: Optional[Dict[str, Any]] = None):
        """Learn from tool usage for improvement"""
        self.usage_history.append({
            "timestamp": time.time(),
            "result": result,
            "feedback": feedback
        })
        
        # Update performance metrics
        self._update_performance_metrics()
    
    def _update_performance_metrics(self):
        """Update performance metrics based on usage history"""
        if not self.usage_history:
            return
        
        successes = sum(1 for entry in self.usage_history if entry["result"].success)
        total = len(self.usage_history)
        execution_times = [entry["result"].execution_time for entry in self.usage_history]
        
        self.performance_metrics.update({
            "success_rate": successes / total,
            "avg_execution_time": np.mean(execution_times),
            "total_uses": total
        })

class CalculatorTool(BaseTool):
    """Mathematical calculator tool"""
    
    async def execute(self, inputs: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> ToolUsageResult:
        start_time = time.time()
        
        try:
            expression = inputs.get("expression", "")
            
            # Safety check for dangerous operations
            if any(dangerous in expression for dangerous in ["import", "exec", "eval", "__"]):
                raise ValueError("Unsafe expression detected")
            
            # Simple mathematical evaluation
            # In production, use a proper math parser
            allowed_chars = set("0123456789+-*/().^ ")
            if not all(c in allowed_chars for c in expression.replace(" ", "")):
                raise ValueError("Invalid characters in expression")
            
            # Replace ^ with ** for Python evaluation
            safe_expression = expression.replace("^", "**")
            
            result = eval(safe_expression)
            
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=True,
                result=result,
                execution_time=time.time() - start_time,
                metadata={"expression": expression, "safe_expression": safe_expression}
            )
            
        except Exception as e:
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=False,
                result=None,
                execution_time=time.time() - start_time,
                error_message=str(e)
            )

class CodeExecutorTool(BaseTool):
    """Safe code execution tool"""
    
    async def execute(self, inputs: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> ToolUsageResult:
        start_time = time.time()
        
        try:
            code = inputs.get("code", "")
            language = inputs.get("language", "python")
            
            if language != "python":
                raise ValueError("Only Python code execution supported")
            
            # Safety checks
            dangerous_imports = ["os", "sys", "subprocess", "socket", "urllib"]
            if any(f"import {imp}" in code for imp in dangerous_imports):
                raise ValueError("Dangerous imports detected")
            
            # Execute in restricted environment
            # In production, use proper sandboxing
            restricted_globals = {
                "__builtins__": {
                    "print": print,
                    "len": len,
                    "range": range,
                    "list": list,
                    "dict": dict,
                    "str": str,
                    "int": int,
                    "float": float
                }
            }
            
            local_vars = {}
            exec(code, restricted_globals, local_vars)
            
            # Return local variables as result
            result = {k: v for k, v in local_vars.items() if not k.startswith("_")}
            
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=True,
                result=result,
                execution_time=time.time() - start_time,
                metadata={"language": language, "code_length": len(code)}
            )
            
        except Exception as e:
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=False,
                result=None,
                execution_time=time.time() - start_time,
                error_message=str(e)
            )

class RomanianLanguageTool(BaseTool):
    """Romanian language processing tool"""
    
    def __init__(self, spec: ToolSpec):
        super().__init__(spec)
        self.romanian_patterns = {
            "diacritics": {
                "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t"
            },
            "common_words": {
                "salut": "hello", "mulțumesc": "thank you", "la revedere": "goodbye",
                "da": "yes", "nu": "no", "bine": "good", "rău": "bad"
            },
            "cultural_terms": {
                "ospitalitate": "hospitality", "tradiție": "tradition", 
                "familie": "family", "respect": "respect"
            }
        }
    
    async def execute(self, inputs: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> ToolUsageResult:
        start_time = time.time()
        
        try:
            operation = inputs.get("operation", "translate")
            text = inputs.get("text", "")
            
            if operation == "translate":
                result = await self._translate_text(text)
            elif operation == "analyze":
                result = await self._analyze_romanian_text(text)
            elif operation == "cultural_context":
                result = await self._add_cultural_context(text)
            else:
                raise ValueError(f"Unknown operation: {operation}")
            
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=True,
                result=result,
                execution_time=time.time() - start_time,
                metadata={"operation": operation, "text_length": len(text)}
            )
            
        except Exception as e:
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=False,
                result=None,
                execution_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def _translate_text(self, text: str) -> Dict[str, Any]:
        """Translate Romanian text (simplified implementation)"""
        words = text.lower().split()
        translations = []
        
        for word in words:
            # Remove diacritics for lookup
            clean_word = word
            for ro_char, en_char in self.romanian_patterns["diacritics"].items():
                clean_word = clean_word.replace(ro_char, en_char)
            
            # Look up translation
            translation = self.romanian_patterns["common_words"].get(clean_word, word)
            translations.append(translation)
        
        return {
            "original": text,
            "translation": " ".join(translations),
            "confidence": 0.7,  # Simplified confidence score
            "method": "dictionary_lookup"
        }
    
    async def _analyze_romanian_text(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian text characteristics"""
        analysis = {
            "length": len(text),
            "word_count": len(text.split()),
            "has_diacritics": any(char in text for char in "ăâîșț"),
            "cultural_terms": [],
            "formality": "neutral"
        }
        
        # Check for cultural terms
        text_lower = text.lower()
        for term in self.romanian_patterns["cultural_terms"]:
            if term in text_lower:
                analysis["cultural_terms"].append(term)
        
        # Simple formality detection
        if any(formal in text_lower for formal in ["dumneavoastră", "vă rog", "stimat"]):
            analysis["formality"] = "formal"
        elif any(informal in text_lower for informal in ["tu", "salut", "hai"]):
            analysis["formality"] = "informal"
        
        return analysis
    
    async def _add_cultural_context(self, text: str) -> Dict[str, Any]:
        """Add Romanian cultural context to text"""
        context = {
            "cultural_elements": [],
            "historical_references": [],
            "traditional_values": [],
            "regional_aspects": []
        }
        
        text_lower = text.lower()
        
        # Check for cultural elements
        if "familie" in text_lower:
            context["traditional_values"].append("Family unity is central to Romanian culture")
        
        if "tradiție" in text_lower:
            context["cultural_elements"].append("Romanian traditions are deeply valued")
        
        if "ospitalitate" in text_lower:
            context["traditional_values"].append("Hospitality is a core Romanian value")
        
        return context

class WebSearchTool(BaseTool):
    """Web search simulation tool"""
    
    async def execute(self, inputs: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> ToolUsageResult:
        start_time = time.time()
        
        try:
            query = inputs.get("query", "")
            max_results = inputs.get("max_results", 5)
            romanian_focus = inputs.get("romanian_focus", False)
            
            # Simulate search results
            # In production, integrate with actual search APIs
            results = await self._simulate_search(query, max_results, romanian_focus)
            
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=True,
                result=results,
                execution_time=time.time() - start_time,
                metadata={"query": query, "result_count": len(results)}
            )
            
        except Exception as e:
            return ToolUsageResult(
                tool_id=self.spec.tool_id,
                success=False,
                result=None,
                execution_time=time.time() - start_time,
                error_message=str(e)
            )
    
    async def _simulate_search(self, query: str, max_results: int, romanian_focus: bool) -> List[Dict[str, Any]]:
        """Simulate search results"""
        base_results = [
            {
                "title": f"Search result for: {query}",
                "url": f"https://example.com/search/{query.replace(' ', '-')}",
                "snippet": f"Information about {query} with relevant details and context.",
                "relevance": 0.8
            }
        ]
        
        if romanian_focus:
            romanian_results = [
                {
                    "title": f"Rezultate românești pentru: {query}",
                    "url": f"https://ro.example.com/search/{query.replace(' ', '-')}",
                    "snippet": f"Informații în română despre {query} cu context cultural.",
                    "relevance": 0.9,
                    "language": "romanian"
                }
            ]
            base_results.extend(romanian_results)
        
        return base_results[:max_results]

class ToolIntegrationTrainingSystem:
    """Advanced tool integration training system"""
    
    def __init__(self):
        self.tools = {}
        self.tool_chains = {}
        self.training_history = []
        self.performance_metrics = {}
        self._initialize_tools()
    
    def _initialize_tools(self):
        """Initialize available tools"""
        # Calculator tool
        calc_spec = ToolSpec(
            tool_id="calculator",
            name="Mathematical Calculator",
            tool_type=ToolType.CALCULATOR,
            capabilities=[ToolCapability.COMPUTE_INTENSIVE],
            description="Performs mathematical calculations and expressions",
            usage_pattern="calculator.execute({'expression': '2 + 2'})",
            input_schema={"expression": {"type": "string", "required": True}},
            output_schema={"result": {"type": "number"}},
            safety_level="high"
        )
        self.tools["calculator"] = CalculatorTool(calc_spec)
        
        # Code executor tool
        code_spec = ToolSpec(
            tool_id="code_executor",
            name="Safe Code Executor",
            tool_type=ToolType.CODE_EXECUTOR,
            capabilities=[ToolCapability.COMPUTE_INTENSIVE, ToolCapability.SECURE_REQUIRED],
            description="Executes Python code in a safe environment",
            usage_pattern="code_executor.execute({'code': 'x = 5\\nprint(x)', 'language': 'python'})",
            input_schema={"code": {"type": "string", "required": True}, "language": {"type": "string"}},
            output_schema={"result": {"type": "object"}},
            safety_level="medium"
        )
        self.tools["code_executor"] = CodeExecutorTool(code_spec)
        
        # Romanian language tool
        romanian_spec = ToolSpec(
            tool_id="romanian_language",
            name="Romanian Language Processor",
            tool_type=ToolType.ROMANIAN_LANGUAGE,
            capabilities=[ToolCapability.CULTURAL_AWARE, ToolCapability.READ_ONLY],
            description="Processes and analyzes Romanian language text",
            usage_pattern="romanian_language.execute({'operation': 'translate', 'text': 'Salut!'})",
            input_schema={"operation": {"type": "string"}, "text": {"type": "string", "required": True}},
            output_schema={"result": {"type": "object"}},
            romanian_cultural_integration=1.0,
            safety_level="high"
        )
        self.tools["romanian_language"] = RomanianLanguageTool(romanian_spec)
        
        # Web search tool
        search_spec = ToolSpec(
            tool_id="web_search",
            name="Web Search Engine",
            tool_type=ToolType.WEB_SEARCH,
            capabilities=[ToolCapability.NETWORK_DEPENDENT, ToolCapability.READ_ONLY],
            description="Searches the web for information",
            usage_pattern="web_search.execute({'query': 'Romanian culture', 'romanian_focus': True})",
            input_schema={"query": {"type": "string", "required": True}, "max_results": {"type": "integer"}},
            output_schema={"results": {"type": "array"}},
            safety_level="medium"
        )
        self.tools["web_search"] = WebSearchTool(search_spec)
    
    async def execute_tool(
        self, 
        tool_id: str, 
        inputs: Dict[str, Any], 
        context: Optional[Dict[str, Any]] = None
    ) -> ToolUsageResult:
        """Execute a specific tool"""
        if tool_id not in self.tools:
            return ToolUsageResult(
                tool_id=tool_id,
                success=False,
                result=None,
                execution_time=0.0,
                error_message=f"Tool {tool_id} not found"
            )
        
        tool = self.tools[tool_id]
        result = await tool.execute(inputs, context)
        
        # Learn from usage
        await tool.learn_from_usage(result)
        
        # Update system metrics
        await self._update_system_metrics(tool_id, result)
        
        return result
    
    async def execute_tool_chain(
        self, 
        chain_definition: List[Dict[str, Any]], 
        context: Optional[Dict[str, Any]] = None
    ) -> ToolChainExecution:
        """Execute a chain of tools"""
        chain_id = f"chain_{int(time.time() * 1000)}"
        start_time = time.time()
        
        results = []
        tools_used = []
        final_result = None
        
        # Track context flow between tools
        chain_context = context.copy() if context else {}
        
        for step in chain_definition:
            tool_id = step["tool_id"]
            inputs = step["inputs"]
            
            # Allow inputs to reference previous results
            processed_inputs = await self._process_chain_inputs(inputs, results, chain_context)
            
            result = await self.execute_tool(tool_id, processed_inputs, chain_context)
            results.append(result)
            tools_used.append(tool_id)
            
            # Update chain context with result
            if result.success:
                chain_context[f"result_{len(results)}"] = result.result
                final_result = result.result
            else:
                # Chain breaks on error
                break
        
        # Calculate success rate
        successful_steps = sum(1 for r in results if r.success)
        success_rate = successful_steps / len(results) if results else 0.0
        
        # Calculate Romanian cultural enhancement
        cultural_enhancement = await self._calculate_cultural_enhancement(tools_used, results)
        
        execution = ToolChainExecution(
            chain_id=chain_id,
            tools_used=tools_used,
            results=results,
            final_result=final_result,
            total_execution_time=time.time() - start_time,
            success_rate=success_rate,
            romanian_cultural_enhancement=cultural_enhancement
        )
        
        # Store chain for learning
        self.tool_chains[chain_id] = execution
        
        return execution
    
    async def _process_chain_inputs(
        self, 
        inputs: Dict[str, Any], 
        previous_results: List[ToolUsageResult], 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process inputs that may reference previous results"""
        processed = {}
        
        for key, value in inputs.items():
            if isinstance(value, str) and value.startswith("${"):
                # Handle variable substitution
                var_name = value[2:-1]  # Remove ${ and }
                
                if var_name in context:
                    processed[key] = context[var_name]
                elif var_name.startswith("result_"):
                    # Reference to previous result
                    try:
                        result_index = int(var_name.split("_")[1]) - 1
                        if 0 <= result_index < len(previous_results):
                            processed[key] = previous_results[result_index].result
                        else:
                            processed[key] = value  # Keep original if index invalid
                    except (ValueError, IndexError):
                        processed[key] = value
                else:
                    processed[key] = value
            else:
                processed[key] = value
        
        return processed
    
    async def _calculate_cultural_enhancement(
        self, 
        tools_used: List[str], 
        results: List[ToolUsageResult]
    ) -> float:
        """Calculate Romanian cultural enhancement from tool chain"""
        enhancement = 0.0
        
        for tool_id in tools_used:
            if tool_id in self.tools:
                tool_spec = self.tools[tool_id].spec
                enhancement += tool_spec.romanian_cultural_integration
        
        # Normalize by number of tools
        if tools_used:
            enhancement /= len(tools_used)
        
        return enhancement
    
    async def _update_system_metrics(self, tool_id: str, result: ToolUsageResult):
        """Update system-wide performance metrics"""
        if tool_id not in self.performance_metrics:
            self.performance_metrics[tool_id] = {
                "total_uses": 0,
                "success_count": 0,
                "total_execution_time": 0.0,
                "average_execution_time": 0.0,
                "success_rate": 0.0
            }
        
        metrics = self.performance_metrics[tool_id]
        metrics["total_uses"] += 1
        metrics["total_execution_time"] += result.execution_time
        
        if result.success:
            metrics["success_count"] += 1
        
        # Update derived metrics
        metrics["success_rate"] = metrics["success_count"] / metrics["total_uses"]
        metrics["average_execution_time"] = metrics["total_execution_time"] / metrics["total_uses"]
    
    async def learn_tool_usage_patterns(self, feedback: Dict[str, Any]):
        """Learn from user feedback on tool usage"""
        self.training_history.append({
            "timestamp": time.time(),
            "feedback": feedback,
            "system_state": {
                "available_tools": list(self.tools.keys()),
                "performance_metrics": self.performance_metrics.copy()
            }
        })
        
        # Implement learning logic here
        # This could involve adjusting tool selection strategies,
        # improving input processing, or optimizing tool chains
    
    async def suggest_tool_for_task(self, task_description: str, context: Optional[Dict[str, Any]] = None) -> List[str]:
        """Suggest appropriate tools for a given task"""
        suggestions = []
        task_lower = task_description.lower()
        
        # Heuristic-based suggestions
        if any(math_term in task_lower for math_term in ["calculate", "math", "compute", "number"]):
            suggestions.append("calculator")
        
        if any(code_term in task_lower for code_term in ["code", "program", "script", "execute"]):
            suggestions.append("code_executor")
        
        if any(ro_term in task_lower for ro_term in ["romanian", "română", "translate", "cultural"]):
            suggestions.append("romanian_language")
        
        if any(search_term in task_lower for search_term in ["search", "find", "look up", "information"]):
            suggestions.append("web_search")
        
        return suggestions
    
    async def get_tool_documentation(self, tool_id: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive documentation for a tool"""
        if tool_id not in self.tools:
            return None
        
        tool = self.tools[tool_id]
        spec = tool.spec
        
        return {
            "specification": {
                "id": spec.tool_id,
                "name": spec.name,
                "type": spec.tool_type.value,
                "capabilities": [cap.value for cap in spec.capabilities],
                "description": spec.description,
                "usage_pattern": spec.usage_pattern,
                "input_schema": spec.input_schema,
                "output_schema": spec.output_schema,
                "safety_level": spec.safety_level,
                "romanian_integration": spec.romanian_cultural_integration
            },
            "performance": tool.performance_metrics,
            "usage_examples": await self._generate_usage_examples(tool_id),
            "best_practices": await self._generate_best_practices(tool_id)
        }
    
    async def _generate_usage_examples(self, tool_id: str) -> List[Dict[str, Any]]:
        """Generate usage examples for a tool"""
        examples = {
            "calculator": [
                {"inputs": {"expression": "2 + 2"}, "description": "Simple addition"},
                {"inputs": {"expression": "sqrt(16)"}, "description": "Square root calculation"},
                {"inputs": {"expression": "3^2 + 4^2"}, "description": "Power operations"}
            ],
            "code_executor": [
                {"inputs": {"code": "x = 5\ny = 10\nresult = x + y", "language": "python"}, 
                 "description": "Variable assignment and arithmetic"},
                {"inputs": {"code": "data = [1, 2, 3, 4, 5]\naverage = sum(data) / len(data)", "language": "python"}, 
                 "description": "List processing"}
            ],
            "romanian_language": [
                {"inputs": {"operation": "translate", "text": "Bună ziua!"}, 
                 "description": "Translate Romanian greeting"},
                {"inputs": {"operation": "analyze", "text": "Familia este importantă în cultura română."}, 
                 "description": "Analyze Romanian cultural text"}
            ],
            "web_search": [
                {"inputs": {"query": "Romanian traditions", "romanian_focus": True}, 
                 "description": "Search for Romanian cultural information"},
                {"inputs": {"query": "artificial intelligence", "max_results": 3}, 
                 "description": "General information search"}
            ]
        }
        
        return examples.get(tool_id, [])
    
    async def _generate_best_practices(self, tool_id: str) -> List[str]:
        """Generate best practices for tool usage"""
        practices = {
            "calculator": [
                "Always validate mathematical expressions before execution",
                "Use parentheses to ensure correct order of operations",
                "Be careful with division by zero scenarios"
            ],
            "code_executor": [
                "Keep code simple and avoid complex external dependencies",
                "Always test code logic before execution",
                "Be mindful of execution time and memory usage"
            ],
            "romanian_language": [
                "Provide context when requesting cultural analysis",
                "Specify the type of Romanian text (formal, informal, literary)",
                "Consider regional variations in language usage"
            ],
            "web_search": [
                "Use specific, well-defined search queries",
                "Enable Romanian focus for culturally relevant results",
                "Limit result count to avoid information overload"
            ]
        }
        
        return practices.get(tool_id, [])
    
    def get_system_statistics(self) -> Dict[str, Any]:
        """Get comprehensive system statistics"""
        return {
            "tools_available": len(self.tools),
            "total_tool_executions": sum(metrics["total_uses"] for metrics in self.performance_metrics.values()),
            "tool_chains_executed": len(self.tool_chains),
            "average_success_rate": np.mean([metrics["success_rate"] for metrics in self.performance_metrics.values()]) if self.performance_metrics else 0.0,
            "performance_metrics": self.performance_metrics,
            "training_sessions": len(self.training_history)
        }

# Example usage and testing
async def test_tool_integration_training():
    """Test tool integration training system"""
    system = ToolIntegrationTrainingSystem()
    
    print("=== Tool Integration Training System Test ===\n")
    
    # Test individual tools
    print("1. Testing Calculator Tool:")
    calc_result = await system.execute_tool("calculator", {"expression": "2^3 + 4*5"})
    print(f"Result: {calc_result.result}, Success: {calc_result.success}")
    
    print("\n2. Testing Romanian Language Tool:")
    ro_result = await system.execute_tool("romanian_language", {
        "operation": "analyze", 
        "text": "Familia și tradițiile sunt foarte importante în cultura română."
    })
    print(f"Analysis: {ro_result.result}")
    
    print("\n3. Testing Code Executor:")
    code_result = await system.execute_tool("code_executor", {
        "code": "numbers = [1, 2, 3, 4, 5]\ntotal = sum(numbers)\naverage = total / len(numbers)",
        "language": "python"
    })
    print(f"Code execution result: {code_result.result}")
    
    # Test tool chain
    print("\n4. Testing Tool Chain:")
    chain_definition = [
        {
            "tool_id": "calculator",
            "inputs": {"expression": "10 * 5"}
        },
        {
            "tool_id": "romanian_language",
            "inputs": {"operation": "translate", "text": "Rezultatul calculului este ${result_1}"}
        }
    ]
    
    chain_result = await system.execute_tool_chain(chain_definition)
    print(f"Chain success rate: {chain_result.success_rate}")
    print(f"Final result: {chain_result.final_result}")
    print(f"Cultural enhancement: {chain_result.romanian_cultural_enhancement}")
    
    # Test tool suggestions
    print("\n5. Testing Tool Suggestions:")
    suggestions = await system.suggest_tool_for_task("I need to calculate the area of a circle and translate the result to Romanian")
    print(f"Suggested tools: {suggestions}")
    
    # Get system statistics
    print("\n6. System Statistics:")
    stats = system.get_system_statistics()
    print(f"Tools available: {stats['tools_available']}")
    print(f"Total executions: {stats['total_tool_executions']}")
    print(f"Average success rate: {stats['average_success_rate']:.3f}")

if __name__ == "__main__":
    asyncio.run(test_tool_integration_training())

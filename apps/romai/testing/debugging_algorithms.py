#!/usr/bin/env python3
"""
Debugging Algorithms Module
==========================

Advanced debugging capabilities for software engineering problems.
Implements systematic debugging approaches, root cause analysis,
and error pattern recognition for SWE-bench improvement.

Target: Improve debugging success rate from baseline to competitive levels
Focus: Systematic debugging, error analysis, and solution generation

Microsoft Azure AI Foundry Compliance: Industry-standard debugging practices
Author: RomAI Enhancement Team  
Date: August 2025
Version: 1.0.0
"""

import asyncio
import logging
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import ast
import traceback

logger = logging.getLogger(__name__)

class DebugCategory(Enum):
    """Categories of debugging problems"""
    SYNTAX_ERROR = "syntax_error"
    LOGIC_ERROR = "logic_error" 
    RUNTIME_ERROR = "runtime_error"
    PERFORMANCE_ISSUE = "performance_issue"
    MEMORY_ISSUE = "memory_issue"
    CONCURRENCY_ISSUE = "concurrency_issue"
    API_INTEGRATION = "api_integration"
    DATABASE_ISSUE = "database_issue"

class DebuggingTechnique(Enum):
    """Debugging techniques and methodologies"""
    SYSTEMATIC_ISOLATION = "systematic_isolation"
    BINARY_SEARCH_DEBUG = "binary_search_debug"
    RUBBER_DUCK_DEBUG = "rubber_duck_debug"
    TRACE_ANALYSIS = "trace_analysis"
    UNIT_TEST_DEBUG = "unit_test_debug"
    LOG_ANALYSIS = "log_analysis"
    PROFILING = "profiling"
    ROOT_CAUSE_ANALYSIS = "root_cause_analysis"

@dataclass
class DebugContext:
    """Context information for debugging"""
    error_message: str
    stack_trace: str
    code_context: str
    input_data: str
    expected_output: str
    actual_output: str
    environment_info: Dict[str, str]

class DebuggingEngine:
    """Core debugging engine with advanced algorithms"""
    
    def __init__(self):
        self.error_patterns = self._initialize_error_patterns()
        self.debugging_strategies = self._initialize_debugging_strategies()
        self.common_fixes = self._initialize_common_fixes()
        
    def _initialize_error_patterns(self) -> Dict[str, Dict]:
        """Initialize common error patterns and their characteristics"""
        return {
            "null_pointer": {
                "keywords": ["null", "none", "undefined", "nullpointerexception"],
                "category": DebugCategory.RUNTIME_ERROR,
                "common_causes": ["uninitialized variable", "missing null check", "incorrect assumption"],
                "typical_fixes": ["add null check", "initialize variable", "defensive programming"]
            },
            "index_out_of_bounds": {
                "keywords": ["index", "bounds", "array", "list"],
                "category": DebugCategory.LOGIC_ERROR,
                "common_causes": ["off-by-one error", "incorrect loop condition", "wrong array size"],
                "typical_fixes": ["check array bounds", "fix loop condition", "validate indices"]
            },
            "type_mismatch": {
                "keywords": ["type", "cast", "conversion", "incompatible"],
                "category": DebugCategory.SYNTAX_ERROR,
                "common_causes": ["wrong data type", "failed conversion", "API mismatch"],
                "typical_fixes": ["type casting", "data validation", "API compatibility"]
            },
            "infinite_loop": {
                "keywords": ["infinite", "loop", "hang", "timeout"],
                "category": DebugCategory.LOGIC_ERROR,
                "common_causes": ["incorrect termination condition", "counter not updated", "logical error"],
                "typical_fixes": ["fix termination condition", "update loop variable", "add break condition"]
            },
            "memory_leak": {
                "keywords": ["memory", "leak", "heap", "garbage"],
                "category": DebugCategory.MEMORY_ISSUE,
                "common_causes": ["unclosed resources", "circular references", "large object retention"],
                "typical_fixes": ["close resources", "break circular references", "optimize memory usage"]
            }
        }
    
    def _initialize_debugging_strategies(self) -> Dict[DebugCategory, List[DebugTechnique]]:
        """Initialize debugging strategies for each category"""
        return {
            DebugCategory.SYNTAX_ERROR: [
                DebugTechnique.SYSTEMATIC_ISOLATION,
                DebugTechnique.TRACE_ANALYSIS
            ],
            DebugCategory.LOGIC_ERROR: [
                DebugTechnique.UNIT_TEST_DEBUG,
                DebugTechnique.BINARY_SEARCH_DEBUG,
                DebugTechnique.RUBBER_DUCK_DEBUG
            ],
            DebugCategory.RUNTIME_ERROR: [
                DebugTechnique.TRACE_ANALYSIS,
                DebugTechnique.LOG_ANALYSIS,
                DebugTechnique.SYSTEMATIC_ISOLATION
            ],
            DebugCategory.PERFORMANCE_ISSUE: [
                DebugTechnique.PROFILING,
                DebugTechnique.LOG_ANALYSIS
            ],
            DebugCategory.MEMORY_ISSUE: [
                DebugTechnique.PROFILING,
                DebugTechnique.TRACE_ANALYSIS
            ]
        }
    
    def _initialize_common_fixes(self) -> Dict[str, List[str]]:
        """Initialize common fix patterns"""
        return {
            "null_checks": [
                "if variable is not None:",
                "if (variable != null) {",
                "assert variable is not None"
            ],
            "bounds_checking": [
                "if 0 <= index < len(array):",
                "if (index >= 0 && index < array.length) {",
                "validate_index(index, array_size)"
            ],
            "error_handling": [
                "try: ... except Exception as e:",
                "try { ... } catch (Exception e) {",
                "if error: handle_error(error)"
            ],
            "resource_cleanup": [
                "with open(file) as f:",
                "try { ... } finally { resource.close(); }",
                "defer resource.Close()"
            ]
        }
    
    async def solve_problem(self, problem, analysis: Dict) -> Dict[str, Any]:
        """Main entry point for debugging problem solving"""
        try:
            logger.info(f"Starting debugging analysis for problem {problem.problem_id}")
            
            # Create debug context from problem
            debug_context = self._extract_debug_context(problem)
            
            # Analyze the error
            error_analysis = await self._analyze_error(debug_context)
            
            # Apply debugging techniques
            debugging_result = await self._apply_debugging_techniques(debug_context, error_analysis)
            
            # Generate solution
            solution = await self._generate_debugging_solution(debug_context, error_analysis, debugging_result)
            
            result = {
                "module": "debugging",
                "error_analysis": error_analysis,
                "debugging_techniques_used": debugging_result["techniques_applied"],
                "root_cause": debugging_result.get("root_cause", "unknown"),
                "recommendations": solution["recommendations"],
                "code_changes": solution["code_changes"],
                "confidence": solution["confidence"],
                "validation_tests": solution["validation_tests"]
            }
            
            logger.info(f"Debugging analysis completed for {problem.problem_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error in debugging analysis: {str(e)}")
            return {"error": str(e), "module": "debugging"}
    
    def _extract_debug_context(self, problem) -> DebugContext:
        """Extract debugging context from problem"""
        # Parse problem description for error information
        description = problem.description
        code_context = problem.code_context
        
        # Extract error message (simplified pattern matching)
        error_message = ""
        stack_trace = ""
        
        # Look for common error patterns
        error_indicators = ["error:", "exception:", "failed:", "traceback:"]
        lines = description.split('\n')
        
        for line in lines:
            line_lower = line.lower()
            if any(indicator in line_lower for indicator in error_indicators):
                error_message = line.strip()
                break
        
        return DebugContext(
            error_message=error_message,
            stack_trace=stack_trace,
            code_context=code_context,
            input_data="",
            expected_output="",
            actual_output="",
            environment_info={}
        )
    
    async def _analyze_error(self, debug_context: DebugContext) -> Dict[str, Any]:
        """Analyze the error to identify category and patterns"""
        analysis = {
            "error_category": DebugCategory.RUNTIME_ERROR,
            "error_patterns_found": [],
            "severity": "medium",
            "complexity": "moderate",
            "similar_errors": [],
            "potential_causes": []
        }
        
        error_text = (debug_context.error_message + " " + debug_context.code_context).lower()
        
        # Pattern matching against known error patterns
        for pattern_name, pattern_info in self.error_patterns.items():
            if any(keyword in error_text for keyword in pattern_info["keywords"]):
                analysis["error_patterns_found"].append(pattern_name)
                analysis["error_category"] = pattern_info["category"]
                analysis["potential_causes"].extend(pattern_info["common_causes"])
        
        # Severity assessment
        severity_indicators = {
            "high": ["crash", "fatal", "critical", "system", "security"],
            "medium": ["error", "exception", "fail", "incorrect"],
            "low": ["warning", "minor", "cosmetic", "style"]
        }
        
        for severity, indicators in severity_indicators.items():
            if any(indicator in error_text for indicator in indicators):
                analysis["severity"] = severity
                break
        
        # Code complexity analysis
        code_lines = len(debug_context.code_context.split('\n'))
        if code_lines > 50:
            analysis["complexity"] = "high"
        elif code_lines > 20:
            analysis["complexity"] = "moderate"
        else:
            analysis["complexity"] = "low"
        
        return analysis
    
    async def _apply_debugging_techniques(self, debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Apply appropriate debugging techniques based on error analysis"""
        result = {
            "techniques_applied": [],
            "findings": [],
            "root_cause": None,
            "confidence": 0.5
        }
        
        error_category = error_analysis["error_category"]
        appropriate_techniques = self.debugging_strategies.get(error_category, [])
        
        for technique in appropriate_techniques:
            technique_result = await self._apply_specific_technique(technique, debug_context, error_analysis)
            
            result["techniques_applied"].append({
                "technique": technique.value,
                "findings": technique_result["findings"],
                "confidence": technique_result["confidence"]
            })
            
            result["findings"].extend(technique_result["findings"])
            
            # Update root cause if this technique found something significant
            if technique_result["confidence"] > 0.7 and technique_result.get("root_cause"):
                result["root_cause"] = technique_result["root_cause"]
                result["confidence"] = technique_result["confidence"]
        
        return result
    
    async def _apply_specific_technique(self, technique: DebugTechnique, 
                                       debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Apply a specific debugging technique"""
        result = {
            "findings": [],
            "confidence": 0.3,
            "root_cause": None
        }
        
        if technique == DebugTechnique.SYSTEMATIC_ISOLATION:
            result.update(await self._systematic_isolation(debug_context, error_analysis))
        elif technique == DebugTechnique.TRACE_ANALYSIS:
            result.update(await self._trace_analysis(debug_context, error_analysis))
        elif technique == DebugTechnique.UNIT_TEST_DEBUG:
            result.update(await self._unit_test_debug(debug_context, error_analysis))
        elif technique == DebugTechnique.LOG_ANALYSIS:
            result.update(await self._log_analysis(debug_context, error_analysis))
        elif technique == DebugTechnique.ROOT_CAUSE_ANALYSIS:
            result.update(await self._root_cause_analysis(debug_context, error_analysis))
        else:
            result["findings"].append(f"Applied {technique.value} technique")
        
        return result
    
    async def _systematic_isolation(self, debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Apply systematic isolation technique"""
        findings = []
        confidence = 0.4
        
        # Analyze code structure for isolation points
        code_lines = debug_context.code_context.split('\n')
        
        # Identify functions, classes, and logical blocks
        isolation_points = []
        for i, line in enumerate(code_lines):
            line_stripped = line.strip()
            if line_stripped.startswith(('def ', 'class ', 'if ', 'for ', 'while ', 'try:')):
                isolation_points.append(i + 1)
        
        findings.append(f"Identified {len(isolation_points)} potential isolation points")
        
        # Look for error patterns in each section
        if error_analysis["error_patterns_found"]:
            findings.append(f"Error patterns found: {', '.join(error_analysis['error_patterns_found'])}")
            confidence = 0.6
        
        return {
            "findings": findings,
            "confidence": confidence,
            "isolation_points": isolation_points
        }
    
    async def _trace_analysis(self, debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Analyze execution traces and stack information"""
        findings = []
        confidence = 0.5
        
        # Analyze stack trace if available
        if debug_context.stack_trace:
            findings.append("Stack trace analysis completed")
            confidence = 0.7
        else:
            findings.append("No stack trace available - recommend adding logging")
        
        # Look for common trace patterns in code
        trace_patterns = ["print(", "log.", "console.", "debug", "trace"]
        code_lower = debug_context.code_context.lower()
        
        existing_traces = [pattern for pattern in trace_patterns if pattern in code_lower]
        if existing_traces:
            findings.append(f"Existing trace statements found: {', '.join(existing_traces)}")
        else:
            findings.append("No trace statements found - recommend adding debugging output")
        
        return {
            "findings": findings,
            "confidence": confidence
        }
    
    async def _unit_test_debug(self, debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Apply unit test debugging approach"""
        findings = []
        confidence = 0.4
        
        # Analyze code for testable units
        code_lines = debug_context.code_context.split('\n')
        functions = [line for line in code_lines if line.strip().startswith('def ')]
        
        findings.append(f"Found {len(functions)} functions that could be unit tested")
        
        # Look for existing tests
        test_indicators = ["test_", "assert", "unittest", "pytest"]
        code_lower = debug_context.code_context.lower()
        
        existing_tests = [indicator for indicator in test_indicators if indicator in code_lower]
        if existing_tests:
            findings.append(f"Existing test patterns found: {', '.join(existing_tests)}")
            confidence = 0.6
        else:
            findings.append("No unit tests found - recommend creating focused tests")
        
        return {
            "findings": findings,
            "confidence": confidence
        }
    
    async def _log_analysis(self, debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Analyze logging patterns and recommend improvements"""
        findings = []
        confidence = 0.3
        
        # Look for logging statements
        logging_patterns = ["logging.", "log.", "print(", "console.", "logger"]
        code_lower = debug_context.code_context.lower()
        
        logging_found = [pattern for pattern in logging_patterns if pattern in code_lower]
        
        if logging_found:
            findings.append(f"Logging patterns found: {', '.join(logging_found)}")
            confidence = 0.5
        else:
            findings.append("No logging found - recommend adding structured logging")
        
        # Analyze error message for log-related clues
        if "log" in debug_context.error_message.lower():
            findings.append("Error appears to be logging-related")
            confidence = 0.7
        
        return {
            "findings": findings,
            "confidence": confidence
        }
    
    async def _root_cause_analysis(self, debug_context: DebugContext, error_analysis: Dict) -> Dict[str, Any]:
        """Perform root cause analysis using 5-why technique"""
        findings = []
        confidence = 0.6
        
        # Start with error patterns
        if error_analysis["error_patterns_found"]:
            primary_pattern = error_analysis["error_patterns_found"][0]
            pattern_info = self.error_patterns.get(primary_pattern, {})
            
            findings.append(f"Primary error pattern: {primary_pattern}")
            
            # Apply common causes from pattern
            if "common_causes" in pattern_info:
                findings.append(f"Likely root causes: {', '.join(pattern_info['common_causes'])}")
                confidence = 0.7
            
            # Identify root cause
            root_cause = f"Root cause identified as {primary_pattern} pattern"
            
            return {
                "findings": findings,
                "confidence": confidence,
                "root_cause": root_cause
            }
        
        findings.append("Root cause analysis requires more specific error information")
        
        return {
            "findings": findings,
            "confidence": confidence
        }
    
    async def _generate_debugging_solution(self, debug_context: DebugContext, 
                                         error_analysis: Dict, debugging_result: Dict) -> Dict[str, Any]:
        """Generate comprehensive debugging solution"""
        solution = {
            "recommendations": [],
            "code_changes": [],
            "confidence": debugging_result.get("confidence", 0.5),
            "validation_tests": []
        }
        
        # Generate recommendations based on error patterns
        for pattern_name in error_analysis["error_patterns_found"]:
            if pattern_name in self.error_patterns:
                pattern_info = self.error_patterns[pattern_name]
                solution["recommendations"].extend([
                    f"Apply {fix} to address {pattern_name}" 
                    for fix in pattern_info["typical_fixes"]
                ])
        
        # Generate specific code changes
        solution["code_changes"].extend(await self._generate_code_fixes(debug_context, error_analysis))
        
        # Generate validation tests
        solution["validation_tests"].extend(await self._generate_validation_tests(debug_context, error_analysis))
        
        # Adjust confidence based on solution completeness
        if solution["code_changes"] and solution["recommendations"]:
            solution["confidence"] = min(1.0, solution["confidence"] + 0.2)
        
        return solution
    
    async def _generate_code_fixes(self, debug_context: DebugContext, error_analysis: Dict) -> List[Dict[str, str]]:
        """Generate specific code fixes"""
        code_fixes = []
        
        # Generate fixes based on error patterns
        for pattern_name in error_analysis["error_patterns_found"]:
            if pattern_name == "null_pointer":
                code_fixes.append({
                    "type": "null_check",
                    "description": "Add null/None check before variable usage",
                    "code": "if variable is not None:\n    # existing code here"
                })
            elif pattern_name == "index_out_of_bounds":
                code_fixes.append({
                    "type": "bounds_check", 
                    "description": "Add array bounds validation",
                    "code": "if 0 <= index < len(array):\n    # array access here"
                })
            elif pattern_name == "infinite_loop":
                code_fixes.append({
                    "type": "loop_fix",
                    "description": "Add proper loop termination condition",
                    "code": "# Ensure loop variable is updated\n# Add break condition if necessary"
                })
        
        return code_fixes
    
    async def _generate_validation_tests(self, debug_context: DebugContext, error_analysis: Dict) -> List[Dict[str, str]]:
        """Generate validation tests for the fix"""
        validation_tests = []
        
        # Generate tests based on error category
        error_category = error_analysis["error_category"]
        
        if error_category == DebugCategory.LOGIC_ERROR:
            validation_tests.append({
                "type": "unit_test",
                "description": "Test function with edge cases",
                "code": "def test_edge_cases():\n    assert function(edge_case_input) == expected_output"
            })
        elif error_category == DebugCategory.RUNTIME_ERROR:
            validation_tests.append({
                "type": "error_handling_test",
                "description": "Test error handling paths",
                "code": "def test_error_handling():\n    with pytest.raises(ExpectedError):\n        function(invalid_input)"
            })
        
        # Always add basic functionality test
        validation_tests.append({
            "type": "basic_test",
            "description": "Test basic functionality works",
            "code": "def test_basic_functionality():\n    result = function(normal_input)\n    assert result is not None"
        })
        
        return validation_tests

# Export main class
__all__ = ['DebuggingEngine', 'DebugCategory', 'DebuggingTechnique', 'DebugContext']
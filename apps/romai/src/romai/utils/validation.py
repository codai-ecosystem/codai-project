"""
Validation utilities for RomAI system.

Provides validation functions for inputs, outputs, and system state.
"""

import re
import logging
from typing import Any, Dict, List, Optional, Union, Tuple
from dataclasses import dataclass

from ..core.types import MathResult, LogicResult


logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Result of a validation operation."""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    metadata: Dict[str, Any]


class InputValidator:
    """Validates user inputs for different reasoning engines."""
    
    @staticmethod
    def validate_math_input(problem: str) -> ValidationResult:
        """Validate mathematical problem input."""
        errors = []
        warnings = []
        metadata = {}
        
        # Basic checks
        if not problem or not problem.strip():
            errors.append("Mathematical problem cannot be empty")
            return ValidationResult(False, errors, warnings, metadata)
        
        problem = problem.strip()
        metadata["input_length"] = len(problem)
        
        # Check for extremely long inputs
        if len(problem) > 10000:
            errors.append("Mathematical problem is too long (max 10000 characters)")
        
        # Check for potentially dangerous patterns
        dangerous_patterns = [
            r'import\s+',
            r'exec\s*\(',
            r'eval\s*\(',
            r'__.*__',
            r'subprocess',
            r'os\.system'
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, problem, re.IGNORECASE):
                errors.append(f"Potentially unsafe pattern detected: {pattern}")
        
        # Detect problem type
        problem_types = []
        
        if re.search(r'[+\-*/=]', problem):
            problem_types.append("arithmetic")
        if re.search(r'[xy]\^?\d*', problem):
            problem_types.append("algebraic")
        if re.search(r'd/dx|integral|∫|∂', problem):
            problem_types.append("calculus")
        if re.search(r'√|sqrt|sin|cos|tan|log', problem):
            problem_types.append("transcendental")
        if re.search(r'matrix|vector|\[.*\]', problem):
            problem_types.append("linear_algebra")
        
        metadata["problem_types"] = problem_types
        
        # Complexity assessment
        complexity_score = 0
        if re.search(r'\^', problem):
            complexity_score += 2
        if re.search(r'sqrt|sin|cos|tan|log', problem):
            complexity_score += 3
        if re.search(r'integral|derivative|limit', problem):
            complexity_score += 4
        
        metadata["complexity_score"] = complexity_score
        
        if complexity_score > 10:
            warnings.append("This appears to be a very complex mathematical problem")
        
        return ValidationResult(len(errors) == 0, errors, warnings, metadata)
    
    @staticmethod
    def validate_logic_input(premise: str) -> ValidationResult:
        """Validate logical reasoning input."""
        errors = []
        warnings = []
        metadata = {}
        
        # Basic checks
        if not premise or not premise.strip():
            errors.append("Logical premise cannot be empty")
            return ValidationResult(False, errors, warnings, metadata)
        
        premise = premise.strip()
        metadata["input_length"] = len(premise)
        
        # Check for extremely long inputs
        if len(premise) > 5000:
            errors.append("Logical premise is too long (max 5000 characters)")
        
        # Detect logical structure
        logical_indicators = []
        
        if re.search(r'all\s+\w+\s+are', premise, re.IGNORECASE):
            logical_indicators.append("universal_quantification")
        if re.search(r'some\s+\w+\s+are', premise, re.IGNORECASE):
            logical_indicators.append("existential_quantification")
        if re.search(r'if\s+.*\s+then', premise, re.IGNORECASE):
            logical_indicators.append("conditional")
        if re.search(r'and|or|not', premise, re.IGNORECASE):
            logical_indicators.append("logical_connectives")
        if re.search(r'therefore|thus|hence|so', premise, re.IGNORECASE):
            logical_indicators.append("conclusion_marker")
        
        metadata["logical_indicators"] = logical_indicators
        
        # Check for argument structure
        sentence_count = len(re.split(r'[.!?]+', premise))
        metadata["sentence_count"] = sentence_count
        
        if sentence_count < 2:
            warnings.append("Logical reasoning typically requires multiple premises")
        
        return ValidationResult(len(errors) == 0, errors, warnings, metadata)


class OutputValidator:
    """Validates outputs from reasoning engines."""
    
    @staticmethod
    def validate_math_result(result: MathResult) -> ValidationResult:
        """Validate mathematical reasoning result."""
        errors = []
        warnings = []
        metadata = {}
        
        # Check required fields
        if result.result is None:
            errors.append("Mathematical result cannot be None")
        
        if not result.steps:
            warnings.append("Mathematical solution should include steps")
        
        # Validate confidence
        if not (0.0 <= result.confidence <= 1.0):
            errors.append("Confidence must be between 0.0 and 1.0")
        
        # Check processing time
        if result.processing_time < 0:
            errors.append("Processing time cannot be negative")
        elif result.processing_time > 30:
            warnings.append("Processing time is unusually high (>30 seconds)")
        
        # Validate method used
        valid_methods = ["arithmetic", "algebraic", "symbolic", "numerical", "calculus", "geometric"]
        if result.method_used and result.method_used not in valid_methods:
            warnings.append(f"Unknown method used: {result.method_used}")
        
        metadata["result_type"] = type(result.result).__name__
        metadata["step_count"] = len(result.steps) if result.steps else 0
        
        return ValidationResult(len(errors) == 0, errors, warnings, metadata)
    
    @staticmethod
    def validate_logic_result(result: LogicResult) -> ValidationResult:
        """Validate logical reasoning result."""
        errors = []
        warnings = []
        metadata = {}
        
        # Check required fields
        if not result.conclusion:
            errors.append("Logical conclusion cannot be empty")
        
        if not result.reasoning_chain:
            warnings.append("Logical result should include reasoning chain")
        
        # Validate confidence
        if not (0.0 <= result.confidence <= 1.0):
            errors.append("Confidence must be between 0.0 and 1.0")
        
        # Check processing time
        if result.processing_time < 0:
            errors.append("Processing time cannot be negative")
        elif result.processing_time > 10:
            warnings.append("Processing time is unusually high for logic (>10 seconds)")
        
        # Validate validity
        if result.validity not in ["valid", "invalid", "uncertain"]:
            errors.append("Validity must be 'valid', 'invalid', or 'uncertain'")
        
        metadata["conclusion_length"] = len(result.conclusion)
        metadata["reasoning_steps"] = len(result.reasoning_chain) if result.reasoning_chain else 0
        metadata["premise_count"] = len(result.premises) if result.premises else 0
        
        return ValidationResult(len(errors) == 0, errors, warnings, metadata)


class SystemValidator:
    """Validates system state and configuration."""
    
    @staticmethod
    def validate_engine_health(health_data: Dict[str, Any]) -> ValidationResult:
        """Validate engine health data."""
        errors = []
        warnings = []
        metadata = {}
        
        required_fields = ["status", "last_check", "operations_count"]
        for field in required_fields:
            if field not in health_data:
                errors.append(f"Missing required health field: {field}")
        
        # Validate status
        valid_statuses = ["healthy", "degraded", "unhealthy", "unknown"]
        if health_data.get("status") not in valid_statuses:
            errors.append(f"Invalid health status: {health_data.get('status')}")
        
        # Check operations count
        ops_count = health_data.get("operations_count", 0)
        if not isinstance(ops_count, int) or ops_count < 0:
            errors.append("Operations count must be a non-negative integer")
        
        # Performance warnings
        avg_time = health_data.get("average_processing_time")
        if avg_time and avg_time > 5.0:
            warnings.append(f"Average processing time is high: {avg_time:.2f}s")
        
        metadata["health_score"] = health_data.get("status") == "healthy"
        metadata["performance_acceptable"] = avg_time is None or avg_time <= 5.0
        
        return ValidationResult(len(errors) == 0, errors, warnings, metadata)
    
    @staticmethod
    def validate_configuration(config_dict: Dict[str, Any]) -> ValidationResult:
        """Validate system configuration."""
        errors = []
        warnings = []
        metadata = {}
        
        # Check server configuration
        server_config = config_dict.get("server", {})
        
        # Validate host
        host = server_config.get("host", "localhost")
        if not isinstance(host, str):
            errors.append("Server host must be a string")
        
        # Validate port
        port = server_config.get("port", 8000)
        if not isinstance(port, int) or not (1 <= port <= 65535):
            errors.append("Server port must be an integer between 1 and 65535")
        
        # Check timeouts
        timeout = config_dict.get("request_timeout", 30)
        if not isinstance(timeout, (int, float)) or timeout <= 0:
            errors.append("Request timeout must be a positive number")
        elif timeout > 300:
            warnings.append("Request timeout is very high (>5 minutes)")
        
        # Check feature flags
        features = config_dict.get("features", {})
        for key, value in features.items():
            if not isinstance(value, bool):
                warnings.append(f"Feature flag '{key}' should be boolean, got {type(value)}")
        
        metadata["config_keys"] = list(config_dict.keys())
        metadata["server_host"] = server_config.get("host", "unknown")
        metadata["server_port"] = server_config.get("port", 0)
        
        return ValidationResult(len(errors) == 0, errors, warnings, metadata)


def validate_data_consistency(data: Dict[str, Any], schema: Dict[str, type]) -> ValidationResult:
    """Validate data against a schema."""
    errors = []
    warnings = []
    metadata = {}
    
    # Check required fields
    for field, expected_type in schema.items():
        if field not in data:
            errors.append(f"Missing required field: {field}")
            continue
        
        value = data[field]
        if not isinstance(value, expected_type):
            errors.append(f"Field '{field}' should be {expected_type.__name__}, got {type(value).__name__}")
    
    # Check for unexpected fields
    unexpected_fields = set(data.keys()) - set(schema.keys())
    if unexpected_fields:
        warnings.append(f"Unexpected fields found: {', '.join(unexpected_fields)}")
    
    metadata["schema_compliance"] = len(errors) == 0
    metadata["field_count"] = len(data)
    metadata["expected_fields"] = list(schema.keys())
    
    return ValidationResult(len(errors) == 0, errors, warnings, metadata)


def sanitize_input(text: str) -> str:
    """Sanitize user input by removing potentially harmful content."""
    if not text:
        return ""
    
    # Remove common dangerous patterns
    dangerous_patterns = [
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'data:text/html',
        r'vbscript:',
        r'on\w+\s*=',
    ]
    
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    # Limit length
    if len(sanitized) > 50000:
        sanitized = sanitized[:50000]
        logger.warning("Input truncated due to excessive length")
    
    return sanitized.strip()
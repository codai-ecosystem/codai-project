"""
Syntax Validator - Real syntax validation and code analysis
Clean implementation for validating generated code
"""

import ast
import re
import tokenize
import io
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ValidationSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class ValidationIssue:
    line: int
    column: int
    severity: ValidationSeverity
    message: str
    rule: str
    suggestion: Optional[str] = None

@dataclass
class ValidationResult:
    is_valid: bool
    issues: List[ValidationIssue]
    syntax_score: float  # 0-100
    complexity_score: float  # 0-100
    readability_score: float  # 0-100
    overall_score: float  # 0-100

class SyntaxValidator:
    """Real syntax validator with comprehensive code analysis"""
    
    def __init__(self):
        self.validation_rules = self._load_validation_rules()
        
    def _load_validation_rules(self) -> Dict[str, Any]:
        """Load real validation rules for code quality assessment"""
        return {
            "line_length": {
                "max_length": 88,  # PEP 8 recommendation
                "severity": ValidationSeverity.WARNING
            },
            "indentation": {
                "spaces": 4,  # PEP 8 standard
                "severity": ValidationSeverity.ERROR
            },
            "naming": {
                "function_pattern": r"^[a-z_][a-z0-9_]*$",
                "variable_pattern": r"^[a-z_][a-z0-9_]*$",
                "constant_pattern": r"^[A-Z_][A-Z0-9_]*$",
                "severity": ValidationSeverity.WARNING
            },
            "complexity": {
                "max_cyclomatic": 10,
                "max_nested_depth": 4,
                "severity": ValidationSeverity.WARNING
            },
            "documentation": {
                "require_docstrings": True,
                "severity": ValidationSeverity.INFO
            }
        }
    
    def validate_syntax(self, code: str) -> ValidationResult:
        """Comprehensive syntax validation with real analysis"""
        issues = []
        
        # Basic syntax check
        syntax_valid, syntax_issues = self._check_basic_syntax(code)
        issues.extend(syntax_issues)
        
        if not syntax_valid:
            return ValidationResult(
                is_valid=False,
                issues=issues,
                syntax_score=0.0,
                complexity_score=0.0,
                readability_score=0.0,
                overall_score=0.0
            )
        
        # Advanced validation checks
        style_issues = self._check_style_guidelines(code)
        issues.extend(style_issues)
        
        naming_issues = self._check_naming_conventions(code)
        issues.extend(naming_issues)
        
        complexity_issues = self._check_complexity(code)
        issues.extend(complexity_issues)
        
        documentation_issues = self._check_documentation(code)
        issues.extend(documentation_issues)
        
        # Calculate scores
        syntax_score = self._calculate_syntax_score(code, issues)
        complexity_score = self._calculate_complexity_score(code)
        readability_score = self._calculate_readability_score(code, issues)
        overall_score = (syntax_score + complexity_score + readability_score) / 3
        
        return ValidationResult(
            is_valid=syntax_valid,
            issues=issues,
            syntax_score=syntax_score,
            complexity_score=complexity_score,
            readability_score=readability_score,
            overall_score=overall_score
        )
    
    def _check_basic_syntax(self, code: str) -> Tuple[bool, List[ValidationIssue]]:
        """Check basic Python syntax using AST"""
        issues = []
        
        try:
            # Parse the code
            tree = ast.parse(code)
            
            # Check for common syntax issues
            for node in ast.walk(tree):
                # Check for undefined variables (basic check)
                if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                    # This is a simple check; full analysis would require scope tracking
                    pass
                
                # Check for unreachable code
                if isinstance(node, ast.FunctionDef):
                    self._check_unreachable_code(node, issues)
            
            return True, issues
            
        except SyntaxError as e:
            issues.append(ValidationIssue(
                line=e.lineno or 0,
                column=e.offset or 0,
                severity=ValidationSeverity.CRITICAL,
                message=f"Syntax error: {e.msg}",
                rule="basic_syntax",
                suggestion="Fix the syntax error before proceeding"
            ))
            return False, issues
        
        except Exception as e:
            issues.append(ValidationIssue(
                line=0,
                column=0,
                severity=ValidationSeverity.ERROR,
                message=f"Parse error: {str(e)}",
                rule="basic_syntax"
            ))
            return False, issues
    
    def _check_unreachable_code(self, func_node: ast.FunctionDef, issues: List[ValidationIssue]):
        """Check for unreachable code after return statements"""
        for i, stmt in enumerate(func_node.body):
            if isinstance(stmt, ast.Return):
                # Check if there are statements after return
                if i < len(func_node.body) - 1:
                    next_stmt = func_node.body[i + 1]
                    issues.append(ValidationIssue(
                        line=next_stmt.lineno,
                        column=next_stmt.col_offset,
                        severity=ValidationSeverity.WARNING,
                        message="Unreachable code after return statement",
                        rule="unreachable_code",
                        suggestion="Remove code after return statement"
                    ))
    
    def _check_style_guidelines(self, code: str) -> List[ValidationIssue]:
        """Check PEP 8 style guidelines"""
        issues = []
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            # Check line length
            if len(line) > self.validation_rules["line_length"]["max_length"]:
                issues.append(ValidationIssue(
                    line=line_num,
                    column=self.validation_rules["line_length"]["max_length"],
                    severity=self.validation_rules["line_length"]["severity"],
                    message=f"Line too long ({len(line)} > {self.validation_rules['line_length']['max_length']} characters)",
                    rule="line_length",
                    suggestion="Break long line into multiple lines"
                ))
            
            # Check indentation (basic check)
            if line.strip() and line.startswith(' '):
                indent = len(line) - len(line.lstrip())
                if indent % self.validation_rules["indentation"]["spaces"] != 0:
                    issues.append(ValidationIssue(
                        line=line_num,
                        column=0,
                        severity=ValidationSeverity.WARNING,
                        message=f"Indentation is not a multiple of {self.validation_rules['indentation']['spaces']}",
                        rule="indentation",
                        suggestion=f"Use {self.validation_rules['indentation']['spaces']} spaces for indentation"
                    ))
            
            # Check for trailing whitespace
            if line.endswith(' ') or line.endswith('\t'):
                issues.append(ValidationIssue(
                    line=line_num,
                    column=len(line.rstrip()),
                    severity=ValidationSeverity.INFO,
                    message="Trailing whitespace",
                    rule="trailing_whitespace",
                    suggestion="Remove trailing whitespace"
                ))
        
        return issues
    
    def _check_naming_conventions(self, code: str) -> List[ValidationIssue]:
        """Check naming convention compliance"""
        issues = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Check function naming
                    if not re.match(self.validation_rules["naming"]["function_pattern"], node.name):
                        issues.append(ValidationIssue(
                            line=node.lineno,
                            column=node.col_offset,
                            severity=self.validation_rules["naming"]["severity"],
                            message=f"Function name '{node.name}' doesn't follow snake_case convention",
                            rule="function_naming",
                            suggestion="Use snake_case for function names (e.g., my_function)"
                        ))
                
                elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                    # Check variable naming
                    if not re.match(self.validation_rules["naming"]["variable_pattern"], node.id):
                        # Skip if it might be a constant
                        if not node.id.isupper():
                            issues.append(ValidationIssue(
                                line=node.lineno,
                                column=node.col_offset,
                                severity=ValidationSeverity.INFO,
                                message=f"Variable name '{node.id}' doesn't follow snake_case convention",
                                rule="variable_naming",
                                suggestion="Use snake_case for variable names"
                            ))
        
        except Exception:
            # If AST parsing fails, skip naming checks
            pass
        
        return issues
    
    def _check_complexity(self, code: str) -> List[ValidationIssue]:
        """Check code complexity metrics"""
        issues = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Calculate cyclomatic complexity
                    complexity = self._calculate_cyclomatic_complexity(node)
                    if complexity > self.validation_rules["complexity"]["max_cyclomatic"]:
                        issues.append(ValidationIssue(
                            line=node.lineno,
                            column=node.col_offset,
                            severity=self.validation_rules["complexity"]["severity"],
                            message=f"Function '{node.name}' has high cyclomatic complexity ({complexity})",
                            rule="cyclomatic_complexity",
                            suggestion="Consider breaking down the function into smaller functions"
                        ))
                    
                    # Check nesting depth
                    max_depth = self._calculate_nesting_depth(node)
                    if max_depth > self.validation_rules["complexity"]["max_nested_depth"]:
                        issues.append(ValidationIssue(
                            line=node.lineno,
                            column=node.col_offset,
                            severity=ValidationSeverity.WARNING,
                            message=f"Function '{node.name}' has deep nesting ({max_depth} levels)",
                            rule="nesting_depth",
                            suggestion="Reduce nesting depth by using early returns or helper functions"
                        ))
        
        except Exception:
            pass
        
        return issues
    
    def _calculate_cyclomatic_complexity(self, func_node: ast.FunctionDef) -> int:
        """Calculate cyclomatic complexity for a function"""
        complexity = 1  # Base complexity
        
        for node in ast.walk(func_node):
            # Decision points increase complexity
            if isinstance(node, (ast.If, ast.While, ast.For, ast.AsyncFor)):
                complexity += 1
            elif isinstance(node, ast.ExceptHandler):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                # And/Or operators
                complexity += len(node.values) - 1
        
        return complexity
    
    def _calculate_nesting_depth(self, func_node: ast.FunctionDef) -> int:
        """Calculate maximum nesting depth in a function"""
        def get_depth(node, current_depth=0):
            max_depth = current_depth
            
            for child in ast.iter_child_nodes(node):
                child_depth = current_depth
                
                # Increment depth for control structures
                if isinstance(child, (ast.If, ast.While, ast.For, ast.AsyncFor, 
                                    ast.With, ast.AsyncWith, ast.Try, ast.ExceptHandler)):
                    child_depth += 1
                
                max_depth = max(max_depth, get_depth(child, child_depth))
            
            return max_depth
        
        return get_depth(func_node)
    
    def _check_documentation(self, code: str) -> List[ValidationIssue]:
        """Check documentation requirements"""
        issues = []
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Check for docstring
                    has_docstring = (
                        len(node.body) > 0 and
                        isinstance(node.body[0], ast.Expr) and
                        isinstance(node.body[0].value, ast.Str)
                    )
                    
                    if not has_docstring and self.validation_rules["documentation"]["require_docstrings"]:
                        issues.append(ValidationIssue(
                            line=node.lineno,
                            column=node.col_offset,
                            severity=self.validation_rules["documentation"]["severity"],
                            message=f"Function '{node.name}' is missing a docstring",
                            rule="missing_docstring",
                            suggestion="Add a docstring to describe the function's purpose"
                        ))
        
        except Exception:
            pass
        
        return issues
    
    def _calculate_syntax_score(self, code: str, issues: List[ValidationIssue]) -> float:
        """Calculate syntax quality score (0-100)"""
        if not code.strip():
            return 0.0
        
        base_score = 100.0
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == ValidationSeverity.CRITICAL:
                base_score -= 25
            elif issue.severity == ValidationSeverity.ERROR:
                base_score -= 10
            elif issue.severity == ValidationSeverity.WARNING:
                base_score -= 5
            elif issue.severity == ValidationSeverity.INFO:
                base_score -= 2
        
        return max(0.0, base_score)
    
    def _calculate_complexity_score(self, code: str) -> float:
        """Calculate complexity score (0-100)"""
        try:
            tree = ast.parse(code)
            total_complexity = 0
            function_count = 0
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    function_count += 1
                    complexity = self._calculate_cyclomatic_complexity(node)
                    total_complexity += complexity
            
            if function_count == 0:
                return 80.0  # Neutral score for no functions
            
            avg_complexity = total_complexity / function_count
            
            # Score based on average complexity
            if avg_complexity <= 5:
                return 100.0
            elif avg_complexity <= 10:
                return 80.0
            elif avg_complexity <= 15:
                return 60.0
            elif avg_complexity <= 20:
                return 40.0
            else:
                return 20.0
        
        except Exception:
            return 50.0  # Neutral score on error
    
    def _calculate_readability_score(self, code: str, issues: List[ValidationIssue]) -> float:
        """Calculate readability score (0-100)"""
        if not code.strip():
            return 0.0
        
        lines = code.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]
        
        if not non_empty_lines:
            return 0.0
        
        base_score = 80.0
        
        # Check average line length
        avg_line_length = sum(len(line) for line in non_empty_lines) / len(non_empty_lines)
        if avg_line_length > 80:
            base_score -= (avg_line_length - 80) * 0.3
        
        # Check for documentation
        has_docstrings = '"""' in code or "'''" in code
        has_comments = any(line.strip().startswith('#') for line in lines)
        
        if has_docstrings:
            base_score += 10
        if has_comments:
            base_score += 5
        
        # Deduct for style issues
        style_issues = [issue for issue in issues 
                       if issue.rule in ['line_length', 'trailing_whitespace', 'indentation']]
        base_score -= len(style_issues) * 2
        
        return max(0.0, min(100.0, base_score))

# Test function
def test_syntax_validator():
    """Test the syntax validator with real code examples"""
    validator = SyntaxValidator()
    
    test_cases = [
        {
            "name": "Good Code",
            "code": '''def factorial(n):
    """Calculate factorial of n"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)'''
        },
        {
            "name": "Syntax Error",
            "code": '''def bad_function(:
    return "missing parameter"'''
        },
        {
            "name": "Style Issues",
            "code": '''def   badNaming( x,y ):
    result=x+y# no space around operators
    return result'''
        },
        {
            "name": "Complex Code",
            "code": '''def complex_function(a, b, c, d, e):
    if a > 0:
        if b > 0:
            if c > 0:
                if d > 0:
                    if e > 0:
                        for i in range(10):
                            for j in range(10):
                                if i + j > 15:
                                    return True
    return False'''
        }
    ]
    
    print("🔍 Testing Syntax Validator")
    print("=" * 50)
    
    for test_case in test_cases:
        print(f"\n📝 Testing: {test_case['name']}")
        
        result = validator.validate_syntax(test_case["code"])
        
        print(f"   Valid: {'✅' if result.is_valid else '❌'}")
        print(f"   Syntax Score: {result.syntax_score:.1f}/100")
        print(f"   Complexity Score: {result.complexity_score:.1f}/100")
        print(f"   Readability Score: {result.readability_score:.1f}/100")
        print(f"   Overall Score: {result.overall_score:.1f}/100")
        print(f"   Issues Found: {len(result.issues)}")
        
        if result.issues:
            for issue in result.issues[:3]:  # Show first 3 issues
                severity_icon = {"info": "ℹ️", "warning": "⚠️", "error": "❌", "critical": "🚨"}[issue.severity.value]
                print(f"     {severity_icon} Line {issue.line}: {issue.message}")
    
    return True

if __name__ == "__main__":
    test_syntax_validator()
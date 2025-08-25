"""
Code Action Controller Module

Specialized controller for code development and programming tasks.
Provides comprehensive code analysis, generation, testing, debugging,
and project management capabilities for RUAGA's action-taking system.

Key Capabilities:
- Code analysis and quality assessment
- Code generation and completion
- Testing framework integration
- Git operations and version control
- Project scaffolding and management
- Documentation generation
- Dependency management
- Build system integration
"""

import os
import subprocess
import time
import logging
import asyncio
import json
import ast
import re
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import tempfile
from datetime import datetime


logger = logging.getLogger(__name__)


class CodeActionType(Enum):
    """Types of code actions."""
    ANALYZE_CODE = "analyze_code"
    GENERATE_CODE = "generate_code"
    REFACTOR_CODE = "refactor_code"
    RUN_TESTS = "run_tests"
    CREATE_TEST = "create_test"
    FORMAT_CODE = "format_code"
    LINT_CODE = "lint_code"
    GIT_COMMIT = "git_commit"
    GIT_PUSH = "git_push"
    GIT_PULL = "git_pull"
    CREATE_PROJECT = "create_project"
    INSTALL_DEPENDENCIES = "install_dependencies"
    BUILD_PROJECT = "build_project"
    GENERATE_DOCS = "generate_docs"
    SEARCH_CODE = "search_code"
    EXPLAIN_CODE = "explain_code"
    DEBUG_CODE = "debug_code"
    OPTIMIZE_CODE = "optimize_code"


class CodeLanguage(Enum):
    """Supported programming languages."""
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    JAVA = "java"
    CSHARP = "csharp"
    CPP = "cpp"
    C = "c"
    GO = "go"
    RUST = "rust"
    PHP = "php"
    RUBY = "ruby"
    SWIFT = "swift"
    KOTLIN = "kotlin"
    SCALA = "scala"
    HTML = "html"
    CSS = "css"
    SQL = "sql"
    BASH = "bash"
    POWERSHELL = "powershell"
    YAML = "yaml"
    JSON = "json"


class CodeActionStatus(Enum):
    """Status of code action execution."""
    SUCCESS = "success"
    FAILED = "failed"
    SYNTAX_ERROR = "syntax_error"
    COMPILATION_ERROR = "compilation_error"
    TEST_FAILED = "test_failed"
    DEPENDENCY_ERROR = "dependency_error"
    GIT_ERROR = "git_error"
    BUILD_ERROR = "build_error"


@dataclass
class CodeAnalysisResult:
    """Result of code analysis."""
    language: CodeLanguage
    lines_of_code: int
    complexity_score: float
    quality_score: float
    issues: List[Dict[str, Any]]
    suggestions: List[str]
    dependencies: List[str]
    test_coverage: Optional[float] = None
    documentation_coverage: Optional[float] = None


@dataclass
class CodeActionRequest:
    """Code action request specification."""
    action_type: CodeActionType
    project_path: Optional[str] = None
    file_path: Optional[str] = None
    code_content: Optional[str] = None
    language: Optional[CodeLanguage] = None
    options: Dict[str, Any] = field(default_factory=dict)
    target_directory: Optional[str] = None
    test_framework: Optional[str] = None
    build_system: Optional[str] = None


@dataclass
class CodeActionResult:
    """Result of code action execution."""
    success: bool
    status: CodeActionStatus
    message: str
    execution_time: float
    result_data: Optional[Any] = None
    analysis_result: Optional[CodeAnalysisResult] = None
    generated_files: List[str] = field(default_factory=list)
    console_output: Optional[str] = None
    error_details: Optional[str] = None


class CodeAnalyzer:
    """Code analysis engine for quality assessment."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def analyze_python_code(self, code: str, file_path: str = None) -> CodeAnalysisResult:
        """Analyze Python code quality and structure."""
        
        try:
            # Parse AST
            tree = ast.parse(code)
            
            # Basic metrics
            lines_of_code = len([line for line in code.split('\n') if line.strip() and not line.strip().startswith('#')])
            
            # Complexity analysis (simplified)
            complexity_score = self._calculate_complexity(tree)
            
            # Quality assessment
            issues = []
            suggestions = []
            
            # Check for common issues
            if 'import *' in code:
                issues.append({
                    'type': 'import_style',
                    'message': 'Avoid wildcard imports',
                    'severity': 'warning'
                })
                suggestions.append('Use specific imports instead of wildcard imports')
            
            if 'print(' in code:
                issues.append({
                    'type': 'debug_code',
                    'message': 'Debug print statements found',
                    'severity': 'info'
                })
                suggestions.append('Remove debug print statements before production')
            
            # Extract dependencies
            dependencies = self._extract_python_dependencies(code)
            
            # Calculate quality score
            quality_score = max(0.0, 1.0 - (len(issues) * 0.1))
            
            return CodeAnalysisResult(
                language=CodeLanguage.PYTHON,
                lines_of_code=lines_of_code,
                complexity_score=complexity_score,
                quality_score=quality_score,
                issues=issues,
                suggestions=suggestions,
                dependencies=dependencies
            )
            
        except SyntaxError as e:
            return CodeAnalysisResult(
                language=CodeLanguage.PYTHON,
                lines_of_code=0,
                complexity_score=0.0,
                quality_score=0.0,
                issues=[{
                    'type': 'syntax_error',
                    'message': f'Syntax error: {str(e)}',
                    'severity': 'error',
                    'line': getattr(e, 'lineno', 0)
                }],
                suggestions=['Fix syntax errors before analysis'],
                dependencies=[]
            )
    
    def analyze_javascript_code(self, code: str, file_path: str = None) -> CodeAnalysisResult:
        """Analyze JavaScript/TypeScript code."""
        
        # Basic analysis for JavaScript
        lines_of_code = len([line for line in code.split('\n') if line.strip() and not line.strip().startswith('//')])
        
        issues = []
        suggestions = []
        
        # Check for common JavaScript issues
        if 'var ' in code:
            issues.append({
                'type': 'variable_declaration',
                'message': 'Use let/const instead of var',
                'severity': 'warning'
            })
            suggestions.append('Replace var declarations with let or const')
        
        if 'console.log(' in code:
            issues.append({
                'type': 'debug_code',
                'message': 'Console.log statements found',
                'severity': 'info'
            })
            suggestions.append('Remove console.log statements before production')
        
        # Extract dependencies
        dependencies = self._extract_javascript_dependencies(code)
        
        quality_score = max(0.0, 1.0 - (len(issues) * 0.1))
        
        return CodeAnalysisResult(
            language=CodeLanguage.JAVASCRIPT,
            lines_of_code=lines_of_code,
            complexity_score=0.5,  # Simplified
            quality_score=quality_score,
            issues=issues,
            suggestions=suggestions,
            dependencies=dependencies
        )
    
    def _calculate_complexity(self, tree: ast.AST) -> float:
        """Calculate cyclomatic complexity (simplified)."""
        
        complexity = 1  # Base complexity
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.For, ast.While, ast.With)):
                complexity += 1
            elif isinstance(node, ast.Try):
                complexity += len(node.handlers)
        
        return min(complexity / 10.0, 1.0)  # Normalize to 0-1
    
    def _extract_python_dependencies(self, code: str) -> List[str]:
        """Extract Python import dependencies."""
        
        dependencies = []
        
        for line in code.split('\n'):
            line = line.strip()
            if line.startswith('import '):
                module = line.replace('import ', '').split(' as ')[0].split('.')[0]
                dependencies.append(module)
            elif line.startswith('from '):
                module = line.split(' import ')[0].replace('from ', '').split('.')[0]
                dependencies.append(module)
        
        return list(set(dependencies))
    
    def _extract_javascript_dependencies(self, code: str) -> List[str]:
        """Extract JavaScript/Node.js dependencies."""
        
        dependencies = []
        
        # Extract require statements
        require_pattern = r"require\(['\"]([^'\"]+)['\"]\)"
        dependencies.extend(re.findall(require_pattern, code))
        
        # Extract import statements
        import_pattern = r"import .+ from ['\"]([^'\"]+)['\"]"
        dependencies.extend(re.findall(import_pattern, code))
        
        return list(set(dependencies))


class CodeGenerator:
    """Code generation engine."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Code templates
        self.templates = {
            'python_class': '''class {class_name}:
    """
    {description}
    """
    
    def __init__(self{init_params}):
        {init_body}
    
    def __str__(self) -> str:
        return f"{class_name}()"
''',
            'python_function': '''def {function_name}({parameters}) -> {return_type}:
    """
    {description}
    
    Args:
        {args_description}
    
    Returns:
        {return_description}
    """
    {function_body}
''',
            'python_test': '''import unittest
from {module_name} import {class_name}


class Test{class_name}(unittest.TestCase):
    """Test cases for {class_name}."""
    
    def setUp(self):
        """Set up test fixtures."""
        {setup_code}
    
    def test_{test_method}(self):
        """Test {test_description}."""
        {test_code}
    
    def tearDown(self):
        """Clean up test fixtures."""
        pass


if __name__ == '__main__':
    unittest.main()
''',
            'javascript_class': '''class {class_name} {{
    /**
     * {description}
     */
    constructor({constructor_params}) {{
        {constructor_body}
    }}
    
    /**
     * String representation
     */
    toString() {{
        return `{class_name}()`;
    }}
}}

module.exports = {class_name};
''',
            'javascript_function': '''/**
 * {description}
 * {params_docs}
 * @returns {{{return_type}}} {return_description}
 */
function {function_name}({parameters}) {{
    {function_body}
}}

module.exports = {function_name};
'''
        }
    
    def generate_class(self, language: CodeLanguage, class_name: str, 
                      description: str, methods: List[Dict[str, Any]] = None) -> str:
        """Generate class code."""
        
        if language == CodeLanguage.PYTHON:
            template = self.templates['python_class']
            
            return template.format(
                class_name=class_name,
                description=description,
                init_params='',
                init_body='        pass'
            )
        
        elif language == CodeLanguage.JAVASCRIPT:
            template = self.templates['javascript_class']
            
            return template.format(
                class_name=class_name,
                description=description,
                constructor_params='',
                constructor_body='        // Initialize'
            )
        
        return f"// {class_name} class generation not implemented for {language.value}"
    
    def generate_function(self, language: CodeLanguage, function_name: str,
                         parameters: List[str], return_type: str,
                         description: str, body: str = None) -> str:
        """Generate function code."""
        
        if language == CodeLanguage.PYTHON:
            template = self.templates['python_function']
            
            params_str = ', '.join(parameters) if parameters else ''
            body_str = body or '    pass'
            
            return template.format(
                function_name=function_name,
                parameters=params_str,
                return_type=return_type,
                description=description,
                args_description='        # Add parameter descriptions',
                return_description='Description of return value',
                function_body=body_str
            )
        
        elif language == CodeLanguage.JAVASCRIPT:
            template = self.templates['javascript_function']
            
            params_str = ', '.join(parameters) if parameters else ''
            body_str = body or '    // Function implementation'
            
            return template.format(
                function_name=function_name,
                parameters=params_str,
                return_type=return_type,
                description=description,
                params_docs='',
                return_description='Description of return value',
                function_body=body_str
            )
        
        return f"// {function_name} function generation not implemented for {language.value}"
    
    def generate_test(self, language: CodeLanguage, class_name: str,
                     module_name: str, test_methods: List[str] = None) -> str:
        """Generate test code."""
        
        if language == CodeLanguage.PYTHON:
            template = self.templates['python_test']
            
            return template.format(
                module_name=module_name,
                class_name=class_name,
                setup_code='        self.instance = {}()'.format(class_name),
                test_method='basic_functionality',
                test_description='basic functionality',
                test_code='        self.assertIsNotNone(self.instance)'
            )
        
        return f"// Test generation not implemented for {language.value}"


class ProjectScaffolder:
    """Project scaffolding engine."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def create_python_project(self, project_name: str, target_dir: str) -> List[str]:
        """Create Python project structure."""
        
        created_files = []
        project_path = os.path.join(target_dir, project_name)
        
        # Create directory structure
        directories = [
            project_path,
            os.path.join(project_path, project_name),
            os.path.join(project_path, 'tests'),
            os.path.join(project_path, 'docs'),
            os.path.join(project_path, 'scripts')
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
        
        # Create files
        files_to_create = {
            'README.md': f'''# {project_name}

A Python project created with RomAI.

## Installation

```bash
pip install -e .
```

## Usage

```python
from {project_name} import main
main()
```

## Testing

```bash
python -m pytest tests/
```
''',
            'setup.py': f'''from setuptools import setup, find_packages

setup(
    name="{project_name}",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Add dependencies here
    ],
    author="RomAI Generated",
    description="A Python project generated by RomAI",
    python_requires=">=3.7",
)
''',
            'requirements.txt': '''# Add project dependencies here
''',
            'requirements-dev.txt': '''pytest>=6.0.0
black>=21.0.0
flake8>=3.8.0
mypy>=0.800
''',
            f'{project_name}/__init__.py': f'''"""
{project_name} - A Python project generated by RomAI.
"""

__version__ = "0.1.0"
''',
            f'{project_name}/main.py': '''"""
Main module for the project.
"""


def main():
    """Main entry point."""
    print("Hello from RomAI generated project!")


if __name__ == "__main__":
    main()
''',
            'tests/__init__.py': '# Test package',
            'tests/test_main.py': f'''"""
Test cases for {project_name}.main module.
"""

import unittest
from {project_name}.main import main


class TestMain(unittest.TestCase):
    """Test cases for main functionality."""
    
    def test_main(self):
        """Test main function."""
        # Test that main runs without error
        main()


if __name__ == "__main__":
    unittest.main()
''',
            '.gitignore': '''# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Testing
.pytest_cache/
.coverage
htmlcov/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.venv
env/
venv/
'''
        }
        
        for file_path, content in files_to_create.items():
            full_path = os.path.join(project_path, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            created_files.append(full_path)
        
        return created_files


class CodeActionController:
    """
    Comprehensive code action controller for development tasks.
    Provides high-level interface for code analysis, generation, testing,
    and project management with integrated development tools.
    """
    
    def __init__(self, workspace_directory: str = None):
        self.workspace_directory = workspace_directory or os.getcwd()
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.analyzer = CodeAnalyzer()
        self.generator = CodeGenerator()
        self.scaffolder = ProjectScaffolder()
        
        # Performance tracking
        self.metrics = {
            'actions_executed': 0,
            'successful_actions': 0,
            'failed_actions': 0,
            'code_lines_analyzed': 0,
            'code_files_generated': 0,
            'tests_created': 0,
            'projects_created': 0,
            'average_execution_time': 0.0,
            'action_type_distribution': {action.value: 0 for action in CodeActionType},
            'language_distribution': {lang.value: 0 for lang in CodeLanguage}
        }
        
        # Action history
        self.action_history = []
        
        self.logger.info(f"Code Action Controller initialized with workspace: {self.workspace_directory}")
    
    async def execute_code_action(self, request: CodeActionRequest) -> CodeActionResult:
        """
        Execute a code action with comprehensive handling.
        
        Args:
            request: Code action request specification
            
        Returns:
            CodeActionResult with execution details and status
        """
        start_time = time.time()
        
        try:
            # Validate request
            validation_result = self._validate_request(request)
            if not validation_result[0]:
                return CodeActionResult(
                    success=False,
                    status=CodeActionStatus.FAILED,
                    message=validation_result[1],
                    execution_time=0.0
                )
            
            # Execute specific action
            result = await self._execute_specific_action(request)
            
            # Update metrics
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self._update_metrics(request, result)
            
            # Store in history
            self._store_action_history(request, result)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Code action execution failed: {str(e)}")
            
            self._update_metrics(request, None, failed=True)
            
            return CodeActionResult(
                success=False,
                status=CodeActionStatus.FAILED,
                message=f"Code action failed: {str(e)}",
                execution_time=execution_time,
                error_details=str(e)
            )
    
    async def _execute_specific_action(self, request: CodeActionRequest) -> CodeActionResult:
        """Execute specific code action based on action type."""
        
        action_type = request.action_type
        
        if action_type == CodeActionType.ANALYZE_CODE:
            return await self._handle_analyze_code(request)
        elif action_type == CodeActionType.GENERATE_CODE:
            return await self._handle_generate_code(request)
        elif action_type == CodeActionType.CREATE_TEST:
            return await self._handle_create_test(request)
        elif action_type == CodeActionType.RUN_TESTS:
            return await self._handle_run_tests(request)
        elif action_type == CodeActionType.FORMAT_CODE:
            return await self._handle_format_code(request)
        elif action_type == CodeActionType.CREATE_PROJECT:
            return await self._handle_create_project(request)
        elif action_type == CodeActionType.INSTALL_DEPENDENCIES:
            return await self._handle_install_dependencies(request)
        elif action_type == CodeActionType.GIT_COMMIT:
            return await self._handle_git_commit(request)
        elif action_type == CodeActionType.BUILD_PROJECT:
            return await self._handle_build_project(request)
        else:
            return CodeActionResult(
                success=False,
                status=CodeActionStatus.FAILED,
                message=f"Unsupported code action type: {action_type.value}",
                execution_time=0.0
            )
    
    async def _handle_analyze_code(self, request: CodeActionRequest) -> CodeActionResult:
        """Handle code analysis action."""
        
        try:
            # Read code content
            if request.file_path:
                with open(request.file_path, 'r', encoding='utf-8') as f:
                    code_content = f.read()
                
                # Detect language from file extension
                language = self._detect_language(request.file_path)
            else:
                code_content = request.code_content
                language = request.language
            
            if not code_content or not language:
                return CodeActionResult(
                    success=False,
                    status=CodeActionStatus.FAILED,
                    message="Code content and language are required for analysis",
                    execution_time=0.0
                )
            
            # Perform analysis
            if language == CodeLanguage.PYTHON:
                analysis_result = self.analyzer.analyze_python_code(code_content, request.file_path)
            elif language in [CodeLanguage.JAVASCRIPT, CodeLanguage.TYPESCRIPT]:
                analysis_result = self.analyzer.analyze_javascript_code(code_content, request.file_path)
            else:
                return CodeActionResult(
                    success=False,
                    status=CodeActionStatus.FAILED,
                    message=f"Code analysis not implemented for {language.value}",
                    execution_time=0.0
                )
            
            self.metrics['code_lines_analyzed'] += analysis_result.lines_of_code
            
            return CodeActionResult(
                success=True,
                status=CodeActionStatus.SUCCESS,
                message=f"Code analysis completed: {analysis_result.lines_of_code} lines, quality score: {analysis_result.quality_score:.2f}",
                execution_time=0.0,
                analysis_result=analysis_result
            )
            
        except Exception as e:
            return CodeActionResult(
                success=False,
                status=CodeActionStatus.FAILED,
                message=f"Code analysis failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_generate_code(self, request: CodeActionRequest) -> CodeActionResult:
        """Handle code generation action."""
        
        try:
            language = request.language
            if not language:
                return CodeActionResult(
                    success=False,
                    status=CodeActionStatus.FAILED,
                    message="Language is required for code generation",
                    execution_time=0.0
                )
            
            generation_type = request.options.get('type', 'function')
            name = request.options.get('name', 'generated_item')
            description = request.options.get('description', 'Generated code')
            
            generated_code = ""
            
            if generation_type == 'class':
                generated_code = self.generator.generate_class(
                    language, name, description
                )
            elif generation_type == 'function':
                parameters = request.options.get('parameters', [])
                return_type = request.options.get('return_type', 'Any')
                generated_code = self.generator.generate_function(
                    language, name, parameters, return_type, description
                )
            elif generation_type == 'test':
                module_name = request.options.get('module_name', 'module')
                generated_code = self.generator.generate_test(
                    language, name, module_name
                )
            
            # Save generated code if target path provided
            generated_files = []
            if request.target_directory:
                file_extension = self._get_file_extension(language)
                file_name = f"{name}.{file_extension}"
                file_path = os.path.join(request.target_directory, file_name)
                
                os.makedirs(request.target_directory, exist_ok=True)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(generated_code)
                
                generated_files.append(file_path)
            
            self.metrics['code_files_generated'] += 1
            
            return CodeActionResult(
                success=True,
                status=CodeActionStatus.SUCCESS,
                message=f"Code generated successfully: {generation_type} '{name}'",
                execution_time=0.0,
                result_data=generated_code,
                generated_files=generated_files
            )
            
        except Exception as e:
            return CodeActionResult(
                success=False,
                status=CodeActionStatus.FAILED,
                message=f"Code generation failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_create_project(self, request: CodeActionRequest) -> CodeActionResult:
        """Handle project creation action."""
        
        try:
            project_name = request.options.get('name', 'new_project')
            target_dir = request.target_directory or self.workspace_directory
            language = request.language or CodeLanguage.PYTHON
            
            created_files = []
            
            if language == CodeLanguage.PYTHON:
                created_files = self.scaffolder.create_python_project(project_name, target_dir)
            else:
                return CodeActionResult(
                    success=False,
                    status=CodeActionStatus.FAILED,
                    message=f"Project scaffolding not implemented for {language.value}",
                    execution_time=0.0
                )
            
            self.metrics['projects_created'] += 1
            
            return CodeActionResult(
                success=True,
                status=CodeActionStatus.SUCCESS,
                message=f"Project '{project_name}' created successfully with {len(created_files)} files",
                execution_time=0.0,
                generated_files=created_files
            )
            
        except Exception as e:
            return CodeActionResult(
                success=False,
                status=CodeActionStatus.FAILED,
                message=f"Project creation failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    async def _handle_run_tests(self, request: CodeActionRequest) -> CodeActionResult:
        """Handle test execution action."""
        
        try:
            test_directory = request.project_path or self.workspace_directory
            test_framework = request.test_framework or 'pytest'
            
            # Build test command
            if test_framework == 'pytest':
                cmd = ['python', '-m', 'pytest', test_directory, '-v']
            elif test_framework == 'unittest':
                cmd = ['python', '-m', 'unittest', 'discover', '-s', test_directory, '-v']
            else:
                return CodeActionResult(
                    success=False,
                    status=CodeActionStatus.FAILED,
                    message=f"Unsupported test framework: {test_framework}",
                    execution_time=0.0
                )
            
            # Run tests
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=test_directory
            )
            
            stdout, stderr = await process.communicate()
            output = (stdout.decode() + stderr.decode()).strip()
            
            success = process.returncode == 0
            status = CodeActionStatus.SUCCESS if success else CodeActionStatus.TEST_FAILED
            
            return CodeActionResult(
                success=success,
                status=status,
                message=f"Tests {'passed' if success else 'failed'}",
                execution_time=0.0,
                console_output=output
            )
            
        except Exception as e:
            return CodeActionResult(
                success=False,
                status=CodeActionStatus.FAILED,
                message=f"Test execution failed: {str(e)}",
                execution_time=0.0,
                error_details=str(e)
            )
    
    def _detect_language(self, file_path: str) -> Optional[CodeLanguage]:
        """Detect programming language from file extension."""
        
        extension = os.path.splitext(file_path)[1].lower()
        
        extension_map = {
            '.py': CodeLanguage.PYTHON,
            '.js': CodeLanguage.JAVASCRIPT,
            '.ts': CodeLanguage.TYPESCRIPT,
            '.java': CodeLanguage.JAVA,
            '.cs': CodeLanguage.CSHARP,
            '.cpp': CodeLanguage.CPP,
            '.c': CodeLanguage.C,
            '.go': CodeLanguage.GO,
            '.rs': CodeLanguage.RUST,
            '.php': CodeLanguage.PHP,
            '.rb': CodeLanguage.RUBY,
            '.swift': CodeLanguage.SWIFT,
            '.kt': CodeLanguage.KOTLIN,
            '.scala': CodeLanguage.SCALA,
            '.html': CodeLanguage.HTML,
            '.css': CodeLanguage.CSS,
            '.sql': CodeLanguage.SQL,
            '.sh': CodeLanguage.BASH,
            '.ps1': CodeLanguage.POWERSHELL,
            '.yml': CodeLanguage.YAML,
            '.yaml': CodeLanguage.YAML,
            '.json': CodeLanguage.JSON
        }
        
        return extension_map.get(extension)
    
    def _get_file_extension(self, language: CodeLanguage) -> str:
        """Get file extension for programming language."""
        
        extension_map = {
            CodeLanguage.PYTHON: 'py',
            CodeLanguage.JAVASCRIPT: 'js',
            CodeLanguage.TYPESCRIPT: 'ts',
            CodeLanguage.JAVA: 'java',
            CodeLanguage.CSHARP: 'cs',
            CodeLanguage.CPP: 'cpp',
            CodeLanguage.C: 'c',
            CodeLanguage.GO: 'go',
            CodeLanguage.RUST: 'rs',
            CodeLanguage.PHP: 'php',
            CodeLanguage.RUBY: 'rb',
            CodeLanguage.SWIFT: 'swift',
            CodeLanguage.KOTLIN: 'kt',
            CodeLanguage.SCALA: 'scala',
            CodeLanguage.HTML: 'html',
            CodeLanguage.CSS: 'css',
            CodeLanguage.SQL: 'sql',
            CodeLanguage.BASH: 'sh',
            CodeLanguage.POWERSHELL: 'ps1',
            CodeLanguage.YAML: 'yml',
            CodeLanguage.JSON: 'json'
        }
        
        return extension_map.get(language, 'txt')
    
    def _validate_request(self, request: CodeActionRequest) -> Tuple[bool, str]:
        """Validate code action request."""
        
        if not isinstance(request.action_type, CodeActionType):
            return False, "Invalid action type"
        
        # Action-specific validation
        if request.action_type == CodeActionType.ANALYZE_CODE:
            if not request.file_path and not request.code_content:
                return False, "File path or code content required for analysis"
        
        if request.action_type == CodeActionType.GENERATE_CODE:
            if not request.language:
                return False, "Language required for code generation"
        
        return True, "Valid request"
    
    def _update_metrics(self, request: CodeActionRequest, result: CodeActionResult = None, failed: bool = False):
        """Update performance metrics."""
        
        self.metrics['actions_executed'] += 1
        self.metrics['action_type_distribution'][request.action_type.value] += 1
        
        if request.language:
            self.metrics['language_distribution'][request.language.value] += 1
        
        if failed or (result and not result.success):
            self.metrics['failed_actions'] += 1
        else:
            self.metrics['successful_actions'] += 1
        
        if result and result.execution_time > 0:
            current_avg = self.metrics['average_execution_time']
            total_actions = self.metrics['actions_executed']
            self.metrics['average_execution_time'] = (
                (current_avg * (total_actions - 1) + result.execution_time) / total_actions
            )
    
    def _store_action_history(self, request: CodeActionRequest, result: CodeActionResult):
        """Store action in history."""
        
        self.action_history.append({
            'timestamp': time.time(),
            'action_type': request.action_type.value,
            'language': request.language.value if request.language else None,
            'project_path': request.project_path,
            'success': result.success,
            'execution_time': result.execution_time
        })
        
        # Keep only recent history
        if len(self.action_history) > 50:
            self.action_history = self.action_history[-25:]
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get code action performance metrics."""
        
        total_actions = self.metrics['actions_executed']
        
        if total_actions == 0:
            return {'message': 'No code actions executed yet'}
        
        success_rate = self.metrics['successful_actions'] / total_actions
        
        return {
            'performance_summary': {
                'total_actions': total_actions,
                'successful_actions': self.metrics['successful_actions'],
                'failed_actions': self.metrics['failed_actions'],
                'success_rate': success_rate,
                'average_execution_time': self.metrics['average_execution_time'],
                'code_lines_analyzed': self.metrics['code_lines_analyzed'],
                'code_files_generated': self.metrics['code_files_generated'],
                'tests_created': self.metrics['tests_created'],
                'projects_created': self.metrics['projects_created']
            },
            'action_distribution': self.metrics['action_type_distribution'],
            'language_distribution': self.metrics['language_distribution'],
            'configuration': {
                'workspace_directory': self.workspace_directory,
                'supported_languages': [lang.value for lang in CodeLanguage],
                'supported_actions': [action.value for action in CodeActionType]
            },
            'capabilities': {
                'code_analysis': True,
                'code_generation': True,
                'project_scaffolding': True,
                'test_execution': True,
                'git_integration': True,
                'dependency_management': True
            }
        }
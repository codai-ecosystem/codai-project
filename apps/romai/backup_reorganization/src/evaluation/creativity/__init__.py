"""
RomAI Creativity & Innovation Evaluation Package
==============================================

Comprehensive creativity and innovation evaluation system for RomAI's
advanced creative intelligence assessment. This package provides
world-class creativity testing across multiple domains with Romanian
cultural integration and competitive benchmarking.

Key Features:
- Multi-domain creativity evaluation (8 creativity domains)
- Advanced originality assessment (5 originality levels)
- Romanian cultural creativity integration
- Competitive benchmarking against AI leaders
- Pattern analysis and performance optimization
- Production-ready evaluation framework

Author: RomAI Excellence Team
Version: 1.0.0
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass

# Core evaluation components
from .romai_creativity_evaluator import (
    RomAICreativityEvaluator,
    CreativityTestScenario,
    CreativityResponse,
    CreativityEvaluationReport,
    CreativityDomain,
    CreativityComplexity,
    OriginalityLevel
)

# Analysis methods
from .creativity_analysis_methods import (
    CreativePatternAnalyzer,
    CreativeBenchmarkEngine
)

# Execution runner
from .run_creativity_testing import (
    CreativityBenchmarkTestRunner,
    CreativityBenchmarkReport
)

# Configure logging
logger = logging.getLogger(__name__)

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI Excellence Team"
__description__ = "Advanced creativity and innovation evaluation system"

# Export all public classes and functions
__all__ = [
    # Core evaluation classes
    'RomAICreativityEvaluator',
    'CreativePatternAnalyzer',
    'CreativeBenchmarkEngine',
    'CreativityBenchmarkTestRunner',
    
    # Data classes
    'CreativityTestScenario',
    'CreativityResponse', 
    'CreativityEvaluationReport',
    'CreativityBenchmarkReport',
    
    # Enums
    'CreativityDomain',
    'CreativityComplexity',
    'OriginalLevel',
    
    # Factory functions
    'create_creativity_evaluator',
    'create_pattern_analyzer',
    'create_benchmark_engine',
    'create_test_runner',
    
    # Convenience functions
    'run_quick_creativity_assessment',
    'evaluate_creative_response',
    'analyze_creativity_patterns',
    'benchmark_creative_performance',
    
    # Health check functions
    'check_creativity_system_health',
    'validate_creativity_environment'
]

# Factory Functions
def create_creativity_evaluator() -> RomAICreativityEvaluator:
    """Create a new RomAI creativity evaluator instance."""
    try:
        evaluator = RomAICreativityEvaluator()
        logger.info("Successfully created creativity evaluator")
        return evaluator
    except Exception as e:
        logger.error(f"Error creating creativity evaluator: {e}")
        raise

def create_pattern_analyzer() -> CreativePatternAnalyzer:
    """Create a new creative pattern analyzer instance."""
    try:
        analyzer = CreativePatternAnalyzer()
        logger.info("Successfully created pattern analyzer")
        return analyzer
    except Exception as e:
        logger.error(f"Error creating pattern analyzer: {e}")
        raise

def create_benchmark_engine() -> CreativeBenchmarkEngine:
    """Create a new creative benchmark engine instance."""
    try:
        engine = CreativeBenchmarkEngine()
        logger.info("Successfully created benchmark engine")
        return engine
    except Exception as e:
        logger.error(f"Error creating benchmark engine: {e}")
        raise

def create_test_runner() -> CreativityBenchmarkTestRunner:
    """Create a new creativity benchmark test runner instance."""
    try:
        runner = CreativityBenchmarkTestRunner()
        logger.info("Successfully created test runner")
        return runner
    except Exception as e:
        logger.error(f"Error creating test runner: {e}")
        raise

# Convenience Functions
async def run_quick_creativity_assessment(
    domains: Optional[List[CreativityDomain]] = None,
    complexity: Optional[CreativityComplexity] = None
) -> Dict[str, Any]:
    """
    Run a quick creativity assessment with specified parameters.
    
    Args:
        domains: List of creativity domains to evaluate (default: all domains)
        complexity: Creativity complexity level (default: ADVANCED)
    
    Returns:
        Dict containing assessment results
    """
    try:
        runner = create_test_runner()
        
        # Override default settings if specified
        if domains:
            # This would be implemented to filter scenarios by domains
            logger.info(f"Running assessment for domains: {[d.value for d in domains]}")
        
        if complexity:
            logger.info(f"Running assessment with complexity: {complexity.value}")
        
        # Run comprehensive assessment
        report = await runner.run_comprehensive_creativity_assessment()
        
        return {
            'success': True,
            'overall_score': report.executive_summary.get('overall_creativity_score', 0.0),
            'performance_level': report.executive_summary.get('performance_level', 'UNKNOWN'),
            'report_id': report.report_id,
            'summary': report.executive_summary
        }
        
    except Exception as e:
        logger.error(f"Error in quick creativity assessment: {e}")
        return {
            'success': False,
            'error': str(e),
            'overall_score': 0.0
        }

async def evaluate_creative_response(scenario: CreativityTestScenario) -> CreativityResponse:
    """
    Evaluate a single creative scenario.
    
    Args:
        scenario: Creativity test scenario to evaluate
    
    Returns:
        CreativityResponse with evaluation results
    """
    try:
        evaluator = create_creativity_evaluator()
        response = await evaluator.evaluate_creativity_scenario(scenario)
        logger.info(f"Successfully evaluated scenario: {scenario.scenario_id}")
        return response
    except Exception as e:
        logger.error(f"Error evaluating creative response: {e}")
        raise

async def analyze_creativity_patterns(responses: List[CreativityResponse]) -> Dict[str, Any]:
    """
    Analyze creative patterns in a list of responses.
    
    Args:
        responses: List of creativity responses to analyze
    
    Returns:
        Dict containing pattern analysis results
    """
    try:
        analyzer = create_pattern_analyzer()
        analysis = await analyzer.analyze_creative_patterns(responses)
        logger.info(f"Successfully analyzed patterns for {len(responses)} responses")
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing creativity patterns: {e}")
        raise

async def benchmark_creative_performance(responses: List[CreativityResponse]) -> Dict[str, Any]:
    """
    Benchmark creative performance against standards.
    
    Args:
        responses: List of creativity responses to benchmark
    
    Returns:
        Dict containing benchmark results
    """
    try:
        engine = create_benchmark_engine()
        results = await engine.benchmark_creative_performance(responses)
        logger.info(f"Successfully benchmarked {len(responses)} responses")
        return results
    except Exception as e:
        logger.error(f"Error benchmarking creative performance: {e}")
        raise

# Health Check Functions
def check_creativity_system_health() -> Dict[str, Any]:
    """
    Check the health of the creativity evaluation system.
    
    Returns:
        Dict containing health status information
    """
    health_status = {
        'system_healthy': True,
        'components': {},
        'timestamp': None,
        'errors': []
    }
    
    try:
        # Test core components
        components_to_test = [
            ('creativity_evaluator', create_creativity_evaluator),
            ('pattern_analyzer', create_pattern_analyzer),
            ('benchmark_engine', create_benchmark_engine),
            ('test_runner', create_test_runner)
        ]
        
        for component_name, factory_func in components_to_test:
            try:
                instance = factory_func()
                health_status['components'][component_name] = {
                    'status': 'HEALTHY',
                    'instance_id': getattr(instance, 'evaluator_id', 'UNKNOWN') if hasattr(instance, 'evaluator_id') else 
                                 getattr(instance, 'analyzer_id', 'UNKNOWN') if hasattr(instance, 'analyzer_id') else
                                 getattr(instance, 'engine_id', 'UNKNOWN') if hasattr(instance, 'engine_id') else
                                 getattr(instance, 'runner_id', 'UNKNOWN')
                }
                logger.info(f"Component {component_name} is healthy")
            except Exception as e:
                health_status['components'][component_name] = {
                    'status': 'UNHEALTHY',
                    'error': str(e)
                }
                health_status['errors'].append(f"{component_name}: {str(e)}")
                health_status['system_healthy'] = False
                logger.error(f"Component {component_name} is unhealthy: {e}")
        
        # Import health check
        try:
            import numpy as np
            health_status['dependencies'] = {'numpy': 'AVAILABLE'}
        except ImportError as e:
            health_status['dependencies'] = {'numpy': 'MISSING'}
            health_status['errors'].append(f"Missing numpy dependency: {e}")
            health_status['system_healthy'] = False
        
        # Set timestamp
        from datetime import datetime
        health_status['timestamp'] = datetime.now().isoformat()
        
        logger.info(f"Creativity system health check completed: {'HEALTHY' if health_status['system_healthy'] else 'UNHEALTHY'}")
        
    except Exception as e:
        health_status['system_healthy'] = False
        health_status['errors'].append(f"Health check error: {str(e)}")
        logger.error(f"Error during health check: {e}")
    
    return health_status

def validate_creativity_environment() -> Dict[str, Any]:
    """
    Validate the creativity evaluation environment setup.
    
    Returns:
        Dict containing environment validation results
    """
    validation_results = {
        'environment_valid': True,
        'validations': {},
        'warnings': [],
        'errors': []
    }
    
    try:
        # Check Python version
        import sys
        python_version = sys.version_info
        if python_version >= (3, 8):
            validation_results['validations']['python_version'] = 'VALID'
        else:
            validation_results['validations']['python_version'] = 'INVALID'
            validation_results['errors'].append(f"Python version {python_version} is too old (requires >=3.8)")
            validation_results['environment_valid'] = False
        
        # Check required imports
        required_imports = [
            'asyncio', 'logging', 'json', 'statistics', 
            'uuid', 'dataclasses', 'datetime', 'typing'
        ]
        
        for import_name in required_imports:
            try:
                __import__(import_name)
                validation_results['validations'][f'import_{import_name}'] = 'AVAILABLE'
            except ImportError:
                validation_results['validations'][f'import_{import_name}'] = 'MISSING'
                validation_results['errors'].append(f"Missing required import: {import_name}")
                validation_results['environment_valid'] = False
        
        # Check optional imports
        optional_imports = ['numpy']
        for import_name in optional_imports:
            try:
                __import__(import_name)
                validation_results['validations'][f'optional_{import_name}'] = 'AVAILABLE'
            except ImportError:
                validation_results['validations'][f'optional_{import_name}'] = 'MISSING'
                validation_results['warnings'].append(f"Optional import missing: {import_name}")
        
        # Check file system permissions
        import os
        try:
            test_dir = os.path.join(os.path.dirname(__file__), 'test_permissions')
            os.makedirs(test_dir, exist_ok=True)
            os.rmdir(test_dir)
            validation_results['validations']['filesystem_permissions'] = 'VALID'
        except Exception as e:
            validation_results['validations']['filesystem_permissions'] = 'INVALID'
            validation_results['errors'].append(f"Filesystem permission error: {str(e)}")
            validation_results['environment_valid'] = False
        
        logger.info(f"Environment validation completed: {'VALID' if validation_results['environment_valid'] else 'INVALID'}")
        
    except Exception as e:
        validation_results['environment_valid'] = False
        validation_results['errors'].append(f"Validation error: {str(e)}")
        logger.error(f"Error during environment validation: {e}")
    
    return validation_results

# Module initialization
def _initialize_creativity_package():
    """Initialize the creativity evaluation package."""
    try:
        logger.info("Initializing RomAI Creativity Evaluation Package v{__version__}")
        
        # Perform health check on import
        health_status = check_creativity_system_health()
        if not health_status['system_healthy']:
            logger.warning("Creativity system health issues detected during initialization")
        
        # Validate environment
        env_validation = validate_creativity_environment()
        if not env_validation['environment_valid']:
            logger.warning("Environment validation issues detected during initialization")
        
        logger.info("RomAI Creativity Evaluation Package initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing creativity package: {e}")

# Initialize package on import
_initialize_creativity_package()

# Package information display
def display_package_info():
    """Display creativity evaluation package information."""
    print(f"""
🎨 RomAI Creativity & Innovation Evaluation Package
{'='*60}
Version: {__version__}
Author: {__author__}
Description: {__description__}

Key Components:
- RomAICreativityEvaluator: Core creativity evaluation engine
- CreativePatternAnalyzer: Advanced pattern analysis
- CreativeBenchmarkEngine: Competitive benchmarking
- CreativityBenchmarkTestRunner: Production-ready testing

Supported Domains:
- Artistic Expression & Cultural Creativity
- Innovative Problem Solving & Technical Innovation
- Conceptual Thinking & Abstract Reasoning
- Narrative Creativity & Interdisciplinary Synthesis

Features:
✅ Multi-domain creativity evaluation (8 domains)
✅ Advanced originality assessment (5 levels)
✅ Romanian cultural creativity integration
✅ Competitive AI benchmarking
✅ Pattern analysis and optimization
✅ Production-ready evaluation framework
{'='*60}
    """)

if __name__ == "__main__":
    display_package_info()
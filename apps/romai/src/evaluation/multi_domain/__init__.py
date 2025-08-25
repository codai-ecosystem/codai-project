"""
Multi-Domain AGI Evaluation Package
===================================

This package provides comprehensive multi-domain artificial general intelligence
evaluation capabilities for RomAI. It tests true AGI by validating cross-domain
knowledge transfer, multi-engine coordination, and complex problem-solving
across all 24 intelligence engines.

Key Components:
- RomAIMultiDomainEvaluator: Main evaluation framework
- AGI Test Categories: 8 comprehensive test categories  
- Difficulty Levels: From novice to superhuman
- Performance Analysis: Detailed scoring and benchmarking
- Visualization: Comprehensive charts and reports

True AGI Validation:
- Cross-domain knowledge transfer (>90% target)
- Multi-engine coordination (>85% target)  
- Complex problem decomposition (>80% target)
- Creative problem solving (>75% target)
- Meta-cognitive reasoning capabilities
- Romanian cultural intelligence integration

Author: RomAI Excellence Team
Version: 1.0.0
"""

from .romai_multi_domain_evaluator import (
    # Main evaluator class
    RomAIMultiDomainEvaluator,
    
    # Enums for test configuration
    AGITestCategory,
    AGIDifficulty,
    AGIEvaluationMode,
    
    # Data structures
    AGITestCase,
    AGITestResult,
    AGIBenchmarkResults
)

# Version information
__version__ = "1.0.0"
__author__ = "RomAI Excellence Team"

# Package metadata
__all__ = [
    # Main evaluator
    'RomAIMultiDomainEvaluator',
    
    # Configuration enums
    'AGITestCategory',
    'AGIDifficulty', 
    'AGIEvaluationMode',
    
    # Data structures
    'AGITestCase',
    'AGITestResult',
    'AGIBenchmarkResults',
    
    # Factory functions
    'create_quick_evaluator',
    'create_comprehensive_evaluator',
    'create_parallel_evaluator'
]

# Factory functions for common use cases
def create_quick_evaluator():
    """Create evaluator for quick testing."""
    return RomAIMultiDomainEvaluator(evaluation_mode=AGIEvaluationMode.SEQUENTIAL)

def create_comprehensive_evaluator():
    """Create evaluator for comprehensive AGI testing."""
    return RomAIMultiDomainEvaluator(evaluation_mode=AGIEvaluationMode.COMPREHENSIVE)

def create_parallel_evaluator():
    """Create evaluator for parallel execution."""
    return RomAIMultiDomainEvaluator(evaluation_mode=AGIEvaluationMode.PARALLEL)

# Package information
def get_package_info():
    """Get comprehensive package information."""
    return {
        'name': 'RomAI Multi-Domain AGI Evaluation',
        'version': __version__,
        'author': __author__,
        'description': 'Comprehensive AGI evaluation framework for RomAI',
        'test_categories': len(AGITestCategory),
        'difficulty_levels': len(AGIDifficulty),
        'evaluation_modes': len(AGIEvaluationMode),
        'capabilities': [
            'Cross-domain knowledge transfer testing',
            'Multi-engine coordination evaluation', 
            'Complex problem decomposition analysis',
            'Creative problem solving assessment',
            'Meta-cognitive reasoning validation',
            'Romanian cultural intelligence testing',
            'Real-world scenario evaluation',
            'Performance visualization and reporting'
        ],
        'performance_targets': {
            'multi_domain_performance': '>90%',
            'cross_domain_transfer': '>90%',
            'multi_engine_coordination': '>85%',
            'complex_decomposition': '>80%',
            'creative_problem_solving': '>75%',
            'cultural_intelligence': '>85%'
        }
    }

# Health check function
def health_check():
    """Perform package health check."""
    try:
        # Test enum access
        categories = list(AGITestCategory)
        difficulties = list(AGIDifficulty)
        modes = list(AGIEvaluationMode)
        
        # Test factory functions
        quick_eval = create_quick_evaluator()
        comp_eval = create_comprehensive_evaluator()
        
        return {
            'status': 'healthy',
            'test_categories': len(categories),
            'difficulty_levels': len(difficulties),
            'evaluation_modes': len(modes),
            'evaluator_creation': 'success'
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }
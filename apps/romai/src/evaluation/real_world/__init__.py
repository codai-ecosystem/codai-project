"""
RomAI Real-World Problem Solving Evaluation Package
==================================================

Comprehensive real-world scenario evaluation framework for validating RomAI's
practical applicability and solution effectiveness across multiple domains
with Romanian cultural context and EU compliance requirements.

This package provides:
- Core evaluation framework for real-world problem solving
- Modular scenario generators for different domains
- Comprehensive solution evaluation and scoring
- Romanian cultural adaptation assessment
- EU regulatory compliance validation
- Performance benchmarking against human experts

Domains Covered:
- Enterprise Digital Transformation
- Smart City Planning and Infrastructure
- Healthcare System Optimization  
- Financial Modeling and Risk Assessment
- Supply Chain and Logistics Management
- Energy Systems and Sustainability
- Education and Workforce Development
- Transportation and Mobility

Key Features:
- Realistic scenario generation with Romanian context
- Multi-stakeholder solution evaluation
- Cultural fit assessment for Romanian market
- Regulatory compliance validation (Romanian + EU)
- ROI and cost-effectiveness analysis
- Implementation feasibility scoring
- Competitive benchmarking vs consultants

Author: RomAI Excellence Team
Version: 1.0.0
"""

from .romai_realworld_evaluator import (
    # Core evaluator
    RomAIRealWorldEvaluator,
    
    # Enums
    RealWorldDomain,
    ProblemComplexity,
    SolutionCriteria,
    
    # Data classes
    RealWorldScenario,
    RealWorldSolution,
    RealWorldEvaluationResult
)

from .run_realworld_evaluation import RealWorldEvaluationRunner

# Scenario generators
try:
    from .enterprise_scenarios import EnterpriseScenarioGenerator
    from .smart_city_scenarios import SmartCityScenarioGenerator
    from .healthcare_scenarios import HealthcareScenarioGenerator
    from .financial_scenarios import FinancialScenarioGenerator
except ImportError:
    # Graceful degradation if modules not available
    EnterpriseScenarioGenerator = None
    SmartCityScenarioGenerator = None
    HealthcareScenarioGenerator = None
    FinancialScenarioGenerator = None

def create_realworld_evaluator():
    """Factory function to create a real-world problem evaluator."""
    return RomAIRealWorldEvaluator()

def create_evaluation_runner():
    """Factory function to create an evaluation runner."""
    return RealWorldEvaluationRunner()

async def quick_evaluation():
    """Run quick real-world problem solving evaluation."""
    runner = create_evaluation_runner()
    return await runner.run_quick_evaluation()

async def comprehensive_evaluation():
    """Run comprehensive real-world problem solving evaluation."""
    runner = create_evaluation_runner()
    return await runner.run_comprehensive_evaluation()

def get_supported_domains():
    """Get list of supported real-world domains."""
    return [domain.name for domain in RealWorldDomain]

def get_complexity_levels():
    """Get list of available complexity levels."""
    return [complexity.name for complexity in ProblemComplexity]

def get_evaluation_criteria():
    """Get list of solution evaluation criteria."""
    return [criteria.name for criteria in SolutionCriteria]

async def health_check():
    """Perform health check on real-world evaluation system."""
    try:
        evaluator = create_realworld_evaluator()
        await evaluator.initialize_engines()
        
        # Test scenario generation
        scenarios = await evaluator.generate_scenarios()
        
        health_status = {
            'status': 'healthy',
            'evaluator_initialized': True,
            'engines_loaded': len(evaluator.engines),
            'scenarios_generated': len(scenarios),
            'domains_supported': len(get_supported_domains()),
            'scenario_generators_available': {
                'enterprise': EnterpriseScenarioGenerator is not None,
                'smart_city': SmartCityScenarioGenerator is not None,
                'healthcare': HealthcareScenarioGenerator is not None,
                'financial': FinancialScenarioGenerator is not None
            }
        }
        
        return health_status
        
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
            'evaluator_initialized': False,
            'engines_loaded': 0,
            'scenarios_generated': 0
        }

# Package information
__version__ = "1.0.0"
__author__ = "RomAI Excellence Team"
__description__ = "Real-world problem solving evaluation framework for RomAI AGI system"

# Export main components
__all__ = [
    # Core classes
    'RomAIRealWorldEvaluator',
    'RealWorldEvaluationRunner',
    
    # Enums
    'RealWorldDomain',
    'ProblemComplexity', 
    'SolutionCriteria',
    
    # Data classes
    'RealWorldScenario',
    'RealWorldSolution',
    'RealWorldEvaluationResult',
    
    # Scenario generators
    'EnterpriseScenarioGenerator',
    'SmartCityScenarioGenerator',
    'HealthcareScenarioGenerator',
    'FinancialScenarioGenerator',
    
    # Factory functions
    'create_realworld_evaluator',
    'create_evaluation_runner',
    
    # Convenience functions
    'quick_evaluation',
    'comprehensive_evaluation',
    'get_supported_domains',
    'get_complexity_levels',
    'get_evaluation_criteria',
    'health_check'
]
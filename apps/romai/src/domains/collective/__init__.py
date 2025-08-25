"""
RomAI Collective Intelligence Domain Package

Advanced collective intelligence capabilities for Romanian cultural context.
Provides world-class collective decision-making, consensus building, and democratic participation.

This package implements:
- Romanian-adapted collective decision-making algorithms and cultural patterns
- Advanced crowd intelligence with sensitivity to Romanian social dynamics
- Democratic participation models aligned with Romanian governance traditions
- Consensus building mechanisms using Romanian conflict resolution approaches
- Collective problem-solving adapted to Romanian organizational culture
- Multi-agent coordination with understanding of Romanian authority patterns
- Wisdom of crowds with Romanian expertise recognition and cultural validation

Performance Target: 29% superiority over baseline collective AI systems (71% → 91.59%)

Key Components:
- CollectiveIntelligenceEngine: Main engine for collective intelligence analysis
- CollectiveAnalysisMethods: Comprehensive analysis methods for collective intelligence
- RomanianCollectiveContext: Romanian cultural context and validation system

Author: RomAI Development Team
Version: 2.0.0 - Professional Romanian AGI System
"""

from .collective_intelligence_engine import (
    CollectiveIntelligenceEngine,
    CollectiveDomain,
    CollectiveModel,
    CollectiveTask,
    CollectiveContext,
    CollectiveOutput
)

from .collective_analysis_methods import CollectiveAnalysisMethods
from .romanian_collective_context import RomanianCollectiveContext

# Version and metadata
__version__ = "2.0.0"
__author__ = "RomAI Development Team"
__description__ = "Advanced Collective Intelligence Engine for Romanian Cultural Context"

# Performance metrics
BASELINE_PERFORMANCE = 0.71  # 71% baseline collective intelligence
TARGET_PERFORMANCE = 0.9159  # 91.59% target performance
IMPROVEMENT_PERCENTAGE = 29.0  # 29% improvement over baseline

# Export main classes and functions
__all__ = [
    # Main engine class
    'CollectiveIntelligenceEngine',
    
    # Enums and data classes
    'CollectiveDomain',
    'CollectiveModel', 
    'CollectiveTask',
    'CollectiveContext',
    'CollectiveOutput',
    
    # Analysis methods
    'CollectiveAnalysisMethods',
    
    # Romanian cultural context
    'RomanianCollectiveContext',
    
    # Convenience functions
    'create_collective_engine',
    'analyze_collective_decision',
    'build_consensus',
    'coordinate_crowdsourcing',
    'get_romanian_collective_patterns'
]

def create_collective_engine() -> CollectiveIntelligenceEngine:
    """
    Create and initialize a new Collective Intelligence Engine.
    
    Returns:
        Initialized CollectiveIntelligenceEngine instance
    """
    return CollectiveIntelligenceEngine()

async def analyze_collective_decision(participants, 
                                    decision_method='weighted_consensus',
                                    cultural_context=None):
    """
    Convenience function for collective decision analysis.
    
    Args:
        participants: List of participant data
        decision_method: Decision-making method to use
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Collective decision analysis results
    """
    engine = create_collective_engine()
    
    # Create context
    context = CollectiveContext(
        domain=CollectiveDomain.COLLECTIVE_DECISION_MAKING,
        task_type=CollectiveTask.DECISION_MAKING,
        participants=participants,
        group_size=len(participants),
        decision_method=CollectiveModel(decision_method) if isinstance(decision_method, str) else decision_method
    )
    
    return await engine.analyze(context)

async def build_consensus(participants, 
                         consensus_threshold=0.7,
                         cultural_context=None):
    """
    Convenience function for consensus building.
    
    Args:
        participants: List of participant data
        consensus_threshold: Required consensus level (0.5-1.0)
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Consensus building results
    """
    engine = create_collective_engine()
    
    context = CollectiveContext(
        domain=CollectiveDomain.CONSENSUS_BUILDING,
        task_type=CollectiveTask.CONSENSUS_FORMATION,
        participants=participants,
        group_size=len(participants),
        consensus_threshold=consensus_threshold
    )
    
    return await engine.analyze(context)

async def coordinate_crowdsourcing(participants, 
                                  task_specification,
                                  cultural_context=None):
    """
    Convenience function for crowdsourcing coordination.
    
    Args:
        participants: List of participant data
        task_specification: Task definition and requirements
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Crowdsourcing coordination results
    """
    engine = create_collective_engine()
    
    context = CollectiveContext(
        domain=CollectiveDomain.CROWD_INTELLIGENCE,
        task_type=CollectiveTask.CROWDSOURCING,
        participants=participants,
        group_size=len(participants),
        metadata={'task_specification': task_specification}
    )
    
    return await engine.analyze(context)

async def get_romanian_collective_patterns(domain, group_size):
    """
    Get Romanian collective cultural patterns for specific context.
    
    Args:
        domain: Collective intelligence domain
        group_size: Size of the group
        
    Returns:
        Romanian cultural patterns and recommendations
    """
    romanian_context = RomanianCollectiveContext()
    return await romanian_context.get_collective_cultural_patterns(domain, group_size)

# Domain-specific convenience functions

async def democratic_participation_analysis(participants, 
                                          participation_method='approval_voting',
                                          cultural_context=None):
    """
    Convenience function for democratic participation analysis.
    
    Args:
        participants: List of participant data
        participation_method: Democratic participation method
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Democratic participation analysis results
    """
    engine = create_collective_engine()
    
    context = CollectiveContext(
        domain=CollectiveDomain.DEMOCRATIC_PARTICIPATION,
        task_type=CollectiveTask.DECISION_MAKING,
        participants=participants,
        group_size=len(participants),
        decision_method=CollectiveModel(participation_method) if isinstance(participation_method, str) else participation_method
    )
    
    return await engine.analyze(context)

async def collective_problem_solving(participants, 
                                   problem_definition,
                                   cultural_context=None):
    """
    Convenience function for collective problem solving.
    
    Args:
        participants: List of participant data
        problem_definition: Problem description and constraints
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Collective problem solving results
    """
    engine = create_collective_engine()
    
    context = CollectiveContext(
        domain=CollectiveDomain.GROUP_PROBLEM_SOLVING,
        task_type=CollectiveTask.PROBLEM_SOLVING,
        participants=participants,
        group_size=len(participants),
        metadata={'problem_definition': problem_definition}
    )
    
    return await engine.analyze(context)

async def knowledge_aggregation(participants, 
                               expertise_distribution,
                               cultural_context=None):
    """
    Convenience function for collective knowledge aggregation.
    
    Args:
        participants: List of participant data
        expertise_distribution: Distribution of expertise across domains
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Knowledge aggregation results
    """
    engine = create_collective_engine()
    
    context = CollectiveContext(
        domain=CollectiveDomain.WISDOM_OF_CROWDS,
        task_type=CollectiveTask.KNOWLEDGE_AGGREGATION,
        participants=participants,
        group_size=len(participants),
        expertise_distribution=expertise_distribution
    )
    
    return await engine.analyze(context)

async def swarm_intelligence_optimization(participants, 
                                        optimization_problem,
                                        swarm_method='particle_swarm',
                                        cultural_context=None):
    """
    Convenience function for swarm intelligence optimization.
    
    Args:
        participants: List of participant data (agents)
        optimization_problem: Problem definition for optimization
        swarm_method: Swarm optimization method
        cultural_context: Optional Romanian cultural context
        
    Returns:
        Swarm intelligence optimization results
    """
    engine = create_collective_engine()
    
    context = CollectiveContext(
        domain=CollectiveDomain.SWARM_INTELLIGENCE,
        task_type=CollectiveTask.PROBLEM_SOLVING,
        participants=participants,
        group_size=len(participants),
        decision_method=CollectiveModel(swarm_method) if isinstance(swarm_method, str) else swarm_method,
        metadata={'optimization_problem': optimization_problem}
    )
    
    return await engine.analyze(context)

# Performance and capability functions

def get_collective_intelligence_capabilities():
    """
    Get comprehensive collective intelligence capabilities.
    
    Returns:
        Dictionary of engine capabilities and performance metrics
    """
    return {
        'engine_name': 'RomAI Collective Intelligence Engine',
        'version': __version__,
        'cultural_specialization': 'Romanian',
        'performance_metrics': {
            'baseline_performance': f'{BASELINE_PERFORMANCE:.1%}',
            'target_performance': f'{TARGET_PERFORMANCE:.1%}',
            'improvement_percentage': f'{IMPROVEMENT_PERCENTAGE:.1f}%',
            'improvement_factor': f'{TARGET_PERFORMANCE/BASELINE_PERFORMANCE:.2f}x'
        },
        'supported_domains': [domain.value for domain in CollectiveDomain],
        'supported_models': [model.value for model in CollectiveModel],
        'supported_tasks': [task.value for task in CollectiveTask],
        'cultural_features': [
            'Romanian collective decision-making patterns',
            'Advanced crowd intelligence with cultural sensitivity',
            'Democratic participation aligned with Romanian governance',
            'Consensus building with Romanian conflict resolution',
            'Collective problem-solving with Romanian organizational culture',
            'Multi-agent coordination with Romanian authority patterns',
            'Wisdom of crowds with Romanian expertise recognition',
            'Cultural validation and democratic quality assessment'
        ]
    }

def get_performance_summary():
    """
    Get performance summary for collective intelligence engine.
    
    Returns:
        Performance summary with key metrics
    """
    return {
        'engine': 'RomAI Collective Intelligence Engine',
        'version': __version__,
        'target_improvement': f'{IMPROVEMENT_PERCENTAGE}% superiority over baseline collective AI ({BASELINE_PERFORMANCE:.0%} → {TARGET_PERFORMANCE:.2%})',
        'cultural_specialization': 'Romanian collective decision-making and crowd intelligence',
        'key_capabilities': [
            'Romanian consensus-building patterns and cultural decision-making processes',
            'Advanced crowd intelligence with cultural sensitivity and social context awareness',
            'Democratic participation models aligned with Romanian governance and civic traditions',
            'Swarm intelligence algorithms adapted to Romanian organizational and social structures',
            'Collective problem-solving with Romanian cultural values and communication styles',
            'Multi-agent coordination with understanding of Romanian hierarchy and authority patterns'
        ],
        'competitive_advantages': [
            'Deep Romanian cultural integration for authentic collective decision-making',
            'Advanced algorithms optimized for Romanian social dynamics and communication patterns',
            'Comprehensive democratic participation frameworks aligned with Romanian civic traditions',
            'Intelligent consensus building with Romanian conflict resolution and harmony preservation',
            'Cultural validation ensuring decisions align with Romanian values and practical feasibility',
            'Superior collective intelligence through Romanian expertise recognition and authority patterns'
        ]
    }

# Module initialization
def _initialize_collective_intelligence_domain():
    """Initialize the collective intelligence domain with optimal settings."""
    import logging
    
    logger = logging.getLogger(__name__)
    logger.info(f"Initializing RomAI Collective Intelligence Domain v{__version__}")
    logger.info(f"Target Performance: {TARGET_PERFORMANCE:.2%} ({IMPROVEMENT_PERCENTAGE}% improvement)")
    logger.info("Romanian cultural specialization: Collective decision-making and crowd intelligence")

# Initialize on import
_initialize_collective_intelligence_domain()
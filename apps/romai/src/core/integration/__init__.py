"""
🔗 RomAI Core Integration Module

World-class integration capabilities following Microsoft Azure ML standards
"""

from .integration_engine import IntegrationEngine, TaskType, TaskPriority, Task, IntegrationResult, ComponentResult

__all__ = [
    'IntegrationEngine',
    'TaskType',
    'TaskPriority', 
    'Task',
    'IntegrationResult',
    'ComponentResult'
]

__version__ = "1.0.0"

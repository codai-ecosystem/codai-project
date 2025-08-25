"""
RomAI Action-Taking Framework

Comprehensive action execution system enabling RomAI to perform real tasks
beyond conversation. Implements both UI-based computer control and API-based
system integration for >90% multi-step task success rate.

Core Capabilities:
- UI-based computer control (Anthropic Computer Use style)
- API integration and workflow automation  
- Web automation and data extraction
- File system operations and data processing
- Communication and messaging systems
- Creative content generation and manipulation
- System administration and DevOps tasks
- Database operations and analytics

Action Types:
- UIAction: Visual interface automation
- APIAction: Direct system integration
- WebAction: Browser and web automation  
- FileAction: File system operations
- CodeAction: Programming and development
- CommAction: Communication and messaging
- CreativeAction: Content generation
- DataAction: Data processing and analysis
"""

from .ui_action import UIActionController
from .api_action import APIActionController  
from .web_action import WebActionController
from .file_action import FileActionController
from .code_action import CodeActionController
from .communication_action import CommunicationActionController
from .creative_action import CreativeActionController
from .data_action import DataActionController
from .action_coordinator import ActionCoordinator
from .action_planner import ActionPlanner, ActionPlan, Action
from .action_verifier import ActionVerifier

__all__ = [
    'UIActionController',
    'APIActionController',
    'WebActionController', 
    'FileActionController',
    'CodeActionController',
    'CommunicationActionController',
    'CreativeActionController',
    'DataActionController',
    'ActionCoordinator',
    'ActionPlanner',
    'ActionPlan',
    'Action',
    'ActionVerifier'
]
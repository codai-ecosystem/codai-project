"""
RomAI Action Orchestration System

A comprehensive system for coordinating and executing real-world actions through AI agents.
Combines the best practices from Agent Squad (AWS Labs) and Agency Swarm frameworks,
specifically tailored for RomAI's DeepSeek V3 architecture.

Key Features:
- Multi-agent coordination with intelligent routing
- Real-world task execution with safety frameworks
- Action validation and result tracking  
- Integration with RomAI expert systems
- Romanian cultural context awareness
- Enterprise-grade security and monitoring

Author: RomAI Development Team
Version: 1.0.0
Date: August 25, 2025
"""

import asyncio
import uuid
import logging
import json
from typing import Dict, List, Any, Optional, Union, Callable, Type
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod

import aiohttp
import requests
from pydantic import BaseModel, Field, validator

from ..experts.action_expert import ActionTakingExpert
from ..experts.programming_expert import ProgrammingCodingExpert  
from ..experts.multimodal_expert import MultimodalProcessingExpert
from ..inference.real_neural_engine import RealNeuralEngine


class ActionType(Enum):
    """Types of actions that can be orchestrated."""
    API_CALL = "api_call"
    FILE_OPERATION = "file_operation"
    SYSTEM_COMMAND = "system_command"
    WEB_INTERACTION = "web_interaction"
    DATABASE_QUERY = "database_query"
    EMAIL_SEND = "email_send"
    NOTIFICATION = "notification"
    CALCULATION = "calculation"
    DATA_PROCESSING = "data_processing"
    CONTENT_GENERATION = "content_generation"
    CULTURAL_ANALYSIS = "cultural_analysis"
    PROGRAMMING_TASK = "programming_task"


class ActionStatus(Enum):
    """Status states for action execution."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


class ActionPriority(Enum):
    """Priority levels for action execution."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5


@dataclass
class ActionRequest:
    """Data class representing an action request."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    action_type: ActionType = ActionType.API_CALL
    description: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    priority: ActionPriority = ActionPriority.MEDIUM
    timeout: int = 300  # 5 minutes default
    retry_count: int = 0
    max_retries: int = 3
    user_id: str = ""
    session_id: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ActionResult:
    """Data class representing an action execution result."""
    id: str = ""
    action_id: str = ""
    status: ActionStatus = ActionStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    agent_used: str = ""
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseActionAgent(ABC):
    """Base class for action agents."""
    
    def __init__(self, name: str, description: str, capabilities: List[ActionType]):
        self.name = name
        self.description = description
        self.capabilities = capabilities
        self.id = str(uuid.uuid4())
        
    @abstractmethod
    async def can_handle(self, action_request: ActionRequest) -> bool:
        """Check if this agent can handle the given action request."""
        pass
        
    @abstractmethod
    async def execute_action(self, action_request: ActionRequest) -> ActionResult:
        """Execute the action request and return the result."""
        pass


class RomAIActionAgent(BaseActionAgent):
    """RomAI-powered action agent using DeepSeek V3 architecture."""
    
    def __init__(self):
        super().__init__(
            name="RomAI Action Agent",
            description="Advanced AI agent powered by DeepSeek V3 for intelligent action execution",
            capabilities=[
                ActionType.API_CALL,
                ActionType.CALCULATION,
                ActionType.DATA_PROCESSING,
                ActionType.CONTENT_GENERATION,
                ActionType.CULTURAL_ANALYSIS,
                ActionType.PROGRAMMING_TASK
            ]
        )
        self.neural_engine = RealNeuralEngine()
        self.action_expert = ActionTakingExpert()
        
    async def can_handle(self, action_request: ActionRequest) -> bool:
        """Check if this agent can handle the action request."""
        return action_request.action_type in self.capabilities
        
    async def execute_action(self, action_request: ActionRequest) -> ActionResult:
        """Execute action using RomAI's intelligent systems."""
        start_time = datetime.now()
        
        try:
            # Use action expert to determine best approach
            expert_response = await self.action_expert.analyze_action(
                action_type=action_request.action_type.value,
                description=action_request.description,
                parameters=action_request.parameters
            )
            
            # Execute using neural engine if needed
            if action_request.action_type in [ActionType.CALCULATION, ActionType.DATA_PROCESSING]:
                result = await self.neural_engine.generate_response(
                    "mathematical",
                    action_request.description,
                    action_request.parameters
                )
            elif action_request.action_type == ActionType.CULTURAL_ANALYSIS:
                result = await self.neural_engine.generate_response(
                    "cultural",
                    action_request.description,
                    action_request.parameters
                )
            elif action_request.action_type == ActionType.PROGRAMMING_TASK:
                result = await self.neural_engine.generate_response(
                    "programming",
                    action_request.description,
                    action_request.parameters
                )
            else:
                result = expert_response
                
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.COMPLETED,
                result=result,
                execution_time=execution_time,
                agent_used=self.name,
                completed_at=datetime.now()
            )
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.FAILED,
                error=str(e),
                execution_time=execution_time,
                agent_used=self.name,
                completed_at=datetime.now()
            )


class ProgrammingActionAgent(BaseActionAgent):
    """Specialized agent for programming and development tasks."""
    
    def __init__(self):
        super().__init__(
            name="Programming Agent",
            description="Expert agent for programming, coding, and development tasks",
            capabilities=[ActionType.PROGRAMMING_TASK, ActionType.FILE_OPERATION, ActionType.SYSTEM_COMMAND]
        )
        self.programming_expert = ProgrammingCodingExpert()
        
    async def can_handle(self, action_request: ActionRequest) -> bool:
        """Check if this agent can handle programming-related actions."""
        return action_request.action_type in self.capabilities
        
    async def execute_action(self, action_request: ActionRequest) -> ActionResult:
        """Execute programming actions using specialized expert."""
        start_time = datetime.now()
        
        try:
            if action_request.action_type == ActionType.PROGRAMMING_TASK:
                result = await self.programming_expert.generate_code(
                    language=action_request.parameters.get("language", "python"),
                    task=action_request.description,
                    context=action_request.parameters.get("context", {})
                )
            elif action_request.action_type == ActionType.FILE_OPERATION:
                result = await self._handle_file_operation(action_request)
            elif action_request.action_type == ActionType.SYSTEM_COMMAND:
                result = await self._handle_system_command(action_request)
            else:
                raise ValueError(f"Unsupported action type: {action_request.action_type}")
                
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.COMPLETED,
                result=result,
                execution_time=execution_time,
                agent_used=self.name,
                completed_at=datetime.now()
            )
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.FAILED,
                error=str(e),
                execution_time=execution_time,
                agent_used=self.name,
                completed_at=datetime.now()
            )
    
    async def _handle_file_operation(self, request: ActionRequest) -> str:
        """Handle file operations safely."""
        operation = request.parameters.get("operation")
        path = request.parameters.get("path")
        
        # Safety validation
        if not path or ".." in path or path.startswith("/"):
            raise ValueError("Invalid file path for security reasons")
            
        if operation == "read":
            with open(path, "r") as f:
                return f.read()
        elif operation == "write":
            content = request.parameters.get("content", "")
            with open(path, "w") as f:
                f.write(content)
            return f"File written successfully: {path}"
        else:
            raise ValueError(f"Unsupported file operation: {operation}")
    
    async def _handle_system_command(self, request: ActionRequest) -> str:
        """Handle system commands with security restrictions."""
        command = request.parameters.get("command")
        
        # Security whitelist - only allow safe commands
        allowed_commands = ["ls", "dir", "pwd", "whoami", "date", "python", "node", "npm"]
        
        if not any(command.startswith(cmd) for cmd in allowed_commands):
            raise ValueError(f"Command not allowed for security reasons: {command}")
            
        import subprocess
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=30
            )
            return result.stdout if result.returncode == 0 else result.stderr
        except subprocess.TimeoutExpired:
            raise ValueError("Command timed out")


class MultimodalActionAgent(BaseActionAgent):
    """Agent for multimodal processing tasks."""
    
    def __init__(self):
        super().__init__(
            name="Multimodal Agent",
            description="Agent for processing images, audio, video, and other media",
            capabilities=[ActionType.DATA_PROCESSING, ActionType.CONTENT_GENERATION]
        )
        self.multimodal_expert = MultimodalProcessingExpert()
        
    async def can_handle(self, action_request: ActionRequest) -> bool:
        """Check if this agent can handle multimodal actions."""
        return (action_request.action_type in self.capabilities and 
                any(key in action_request.parameters for key in ["image", "audio", "video", "media"]))
        
    async def execute_action(self, action_request: ActionRequest) -> ActionResult:
        """Execute multimodal processing actions."""
        start_time = datetime.now()
        
        try:
            result = await self.multimodal_expert.process_multimodal_content(
                content_type=action_request.parameters.get("content_type"),
                content=action_request.parameters.get("content"),
                task=action_request.description
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.COMPLETED,
                result=result,
                execution_time=execution_time,
                agent_used=self.name,
                completed_at=datetime.now()
            )
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.FAILED,
                error=str(e),
                execution_time=execution_time,
                agent_used=self.name,
                completed_at=datetime.now()
            )


class ActionSafetyFramework:
    """Safety framework for validating and monitoring actions."""
    
    def __init__(self):
        self.blocked_patterns = [
            r"rm\s+-rf\s+/",
            r"del\s+/[qf]",
            r"format\s+c:",
            r"DROP\s+DATABASE",
            r"DELETE\s+FROM.*WHERE.*1=1"
        ]
        self.rate_limits = {}
        
    async def validate_action(self, request: ActionRequest) -> bool:
        """Validate action for safety and compliance."""
        import re
        
        # Check for dangerous patterns
        full_text = f"{request.description} {json.dumps(request.parameters)}"
        for pattern in self.blocked_patterns:
            if re.search(pattern, full_text, re.IGNORECASE):
                return False
                
        # Check rate limits
        user_key = f"{request.user_id}_{request.action_type.value}"
        now = datetime.now()
        
        if user_key not in self.rate_limits:
            self.rate_limits[user_key] = []
            
        # Remove old entries (older than 1 hour)
        self.rate_limits[user_key] = [
            timestamp for timestamp in self.rate_limits[user_key]
            if (now - timestamp).seconds < 3600
        ]
        
        # Check if under rate limit (max 100 actions per hour per user per action type)
        if len(self.rate_limits[user_key]) >= 100:
            return False
            
        self.rate_limits[user_key].append(now)
        return True


class ActionOrchestrator:
    """Main orchestrator for coordinating actions across multiple agents."""
    
    def __init__(self):
        self.agents: List[BaseActionAgent] = []
        self.active_actions: Dict[str, ActionRequest] = {}
        self.action_history: List[ActionResult] = []
        self.safety_framework = ActionSafetyFramework()
        self.logger = logging.getLogger(__name__)
        
        # Initialize default agents
        self._initialize_default_agents()
        
    def _initialize_default_agents(self):
        """Initialize the default set of action agents."""
        self.agents = [
            RomAIActionAgent(),
            ProgrammingActionAgent(), 
            MultimodalActionAgent()
        ]
        
    def add_agent(self, agent: BaseActionAgent):
        """Add a new agent to the orchestrator."""
        self.agents.append(agent)
        self.logger.info(f"Added agent: {agent.name}")
        
    def remove_agent(self, agent_name: str):
        """Remove an agent from the orchestrator."""
        self.agents = [agent for agent in self.agents if agent.name != agent_name]
        self.logger.info(f"Removed agent: {agent_name}")
        
    async def route_action(self, action_request: ActionRequest) -> ActionResult:
        """Route action request to the most suitable agent."""
        
        # Validate action for safety
        if not await self.safety_framework.validate_action(action_request):
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.FAILED,
                error="Action blocked by safety framework",
                agent_used="Safety Framework"
            )
            
        # Find capable agents
        capable_agents = []
        for agent in self.agents:
            if await agent.can_handle(action_request):
                capable_agents.append(agent)
                
        if not capable_agents:
            return ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.FAILED,
                error="No capable agent found for this action type",
                agent_used="Orchestrator"
            )
            
        # Select best agent (first capable agent for now, can be enhanced with ML)
        selected_agent = capable_agents[0]
        
        # Track active action
        self.active_actions[action_request.id] = action_request
        
        try:
            # Execute action
            result = await selected_agent.execute_action(action_request)
            
            # Record result
            self.action_history.append(result)
            
            # Clean up
            if action_request.id in self.active_actions:
                del self.active_actions[action_request.id]
                
            self.logger.info(f"Action {action_request.id} completed by {selected_agent.name}")
            return result
            
        except Exception as e:
            # Handle execution error
            result = ActionResult(
                id=str(uuid.uuid4()),
                action_id=action_request.id,
                status=ActionStatus.FAILED,
                error=f"Execution error: {str(e)}",
                agent_used=selected_agent.name
            )
            
            self.action_history.append(result)
            
            if action_request.id in self.active_actions:
                del self.active_actions[action_request.id]
                
            self.logger.error(f"Action {action_request.id} failed: {str(e)}")
            return result
            
    async def execute_action_chain(self, actions: List[ActionRequest]) -> List[ActionResult]:
        """Execute a chain of related actions in sequence."""
        results = []
        
        for action in actions:
            result = await self.route_action(action)
            results.append(result)
            
            # Stop chain if any action fails
            if result.status == ActionStatus.FAILED:
                self.logger.warning(f"Action chain stopped due to failure: {result.error}")
                break
                
        return results
        
    async def execute_parallel_actions(self, actions: List[ActionRequest]) -> List[ActionResult]:
        """Execute multiple actions in parallel."""
        tasks = [self.route_action(action) for action in actions]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(ActionResult(
                    id=str(uuid.uuid4()),
                    action_id=actions[i].id,
                    status=ActionStatus.FAILED,
                    error=str(result),
                    agent_used="Orchestrator"
                ))
            else:
                processed_results.append(result)
                
        return processed_results
        
    def get_action_status(self, action_id: str) -> Optional[ActionResult]:
        """Get the status/result of a specific action."""
        for result in self.action_history:
            if result.action_id == action_id:
                return result
        return None
        
    def get_agent_capabilities(self) -> Dict[str, List[str]]:
        """Get a summary of all agent capabilities."""
        capabilities = {}
        for agent in self.agents:
            capabilities[agent.name] = [cap.value for cap in agent.capabilities]
        return capabilities
        
    def get_action_statistics(self) -> Dict[str, Any]:
        """Get statistics about action execution."""
        total_actions = len(self.action_history)
        
        if total_actions == 0:
            return {"total_actions": 0}
            
        successful = sum(1 for result in self.action_history if result.status == ActionStatus.COMPLETED)
        failed = sum(1 for result in self.action_history if result.status == ActionStatus.FAILED)
        
        avg_execution_time = sum(result.execution_time for result in self.action_history) / total_actions
        
        agent_usage = {}
        for result in self.action_history:
            agent_usage[result.agent_used] = agent_usage.get(result.agent_used, 0) + 1
            
        return {
            "total_actions": total_actions,
            "successful_actions": successful,
            "failed_actions": failed,
            "success_rate": successful / total_actions,
            "average_execution_time": avg_execution_time,
            "agent_usage": agent_usage,
            "active_actions": len(self.active_actions)
        }


# Global orchestrator instance
_orchestrator_instance = None


def get_orchestrator() -> ActionOrchestrator:
    """Get the global action orchestrator instance."""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = ActionOrchestrator()
    return _orchestrator_instance


# Convenience functions for common operations
async def execute_action(
    action_type: ActionType,
    description: str,
    parameters: Dict[str, Any] = None,
    priority: ActionPriority = ActionPriority.MEDIUM,
    user_id: str = "",
    session_id: str = ""
) -> ActionResult:
    """Execute a single action with the orchestrator."""
    orchestrator = get_orchestrator()
    
    action_request = ActionRequest(
        action_type=action_type,
        description=description,
        parameters=parameters or {},
        priority=priority,
        user_id=user_id,
        session_id=session_id
    )
    
    return await orchestrator.route_action(action_request)


async def execute_calculation(expression: str, user_id: str = "", session_id: str = "") -> ActionResult:
    """Execute a mathematical calculation."""
    return await execute_action(
        ActionType.CALCULATION,
        f"Calculate: {expression}",
        {"expression": expression},
        user_id=user_id,
        session_id=session_id
    )


async def generate_content(prompt: str, content_type: str = "text", user_id: str = "", session_id: str = "") -> ActionResult:
    """Generate content using RomAI."""
    return await execute_action(
        ActionType.CONTENT_GENERATION,
        prompt,
        {"content_type": content_type},
        user_id=user_id,
        session_id=session_id
    )


async def analyze_romanian_culture(query: str, user_id: str = "", session_id: str = "") -> ActionResult:
    """Analyze Romanian cultural aspects."""
    return await execute_action(
        ActionType.CULTURAL_ANALYSIS,
        query,
        {"culture": "romanian"},
        user_id=user_id,
        session_id=session_id
    )


async def program_task(task: str, language: str = "python", user_id: str = "", session_id: str = "") -> ActionResult:
    """Execute a programming task."""
    return await execute_action(
        ActionType.PROGRAMMING_TASK,
        task,
        {"language": language},
        user_id=user_id,
        session_id=session_id
    )


if __name__ == "__main__":
    # Example usage and testing
    async def test_orchestrator():
        """Test the action orchestrator."""
        print("🚀 Testing RomAI Action Orchestration System")
        
        # Test mathematical calculation
        print("\n1. Testing mathematical calculation...")
        calc_result = await execute_calculation("2 + 2 * 3")
        print(f"Result: {calc_result.result}")
        print(f"Status: {calc_result.status}")
        
        # Test content generation
        print("\n2. Testing content generation...")
        content_result = await generate_content("Write a short poem about AI")
        print(f"Result: {content_result.result}")
        print(f"Status: {content_result.status}")
        
        # Test Romanian cultural analysis
        print("\n3. Testing Romanian cultural analysis...")
        culture_result = await analyze_romanian_culture("Tell me about Mărțișor tradition")
        print(f"Result: {culture_result.result}")
        print(f"Status: {culture_result.status}")
        
        # Test programming task
        print("\n4. Testing programming task...")
        prog_result = await program_task("Create a function to calculate fibonacci numbers", "python")
        print(f"Result: {prog_result.result}")
        print(f"Status: {prog_result.status}")
        
        # Get statistics
        print("\n5. Action Statistics:")
        orchestrator = get_orchestrator()
        stats = orchestrator.get_action_statistics()
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        print("\n✅ Action Orchestration System testing completed!")
    
    # Run the test
    asyncio.run(test_orchestrator())
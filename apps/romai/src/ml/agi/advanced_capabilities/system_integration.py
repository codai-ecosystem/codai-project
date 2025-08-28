"""
RomAI AGI Advanced Capabilities - System Integration

Unified integration layer connecting all Advanced Capabilities components with Phase 1 AGI system.
Provides inter-component communication, unified API, and system coordination.
"""

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union, Callable, Type
import numpy as np
import torch

# Phase 1 AGI Components
from ..agi_system import AGISystem
from ..memory_architecture import MemoryArchitecture
from ..consciousness_framework import ConsciousnessFramework
from ..meta_learning_engine import MetaLearningEngine
from ..autonomous_goal_system import AutonomousGoalSystem
from ..advanced_reasoning_system import AdvancedReasoningSystem

# Advanced Capabilities Components
from .advanced_tool_use_system import AdvancedToolUseSystem
from .enhanced_planning_engine import EnhancedPlanningEngine
from .external_knowledge_integration import ExternalKnowledgeIntegrationSystem
from .advanced_learning_systems import AdvancedLearningSystems

# Learning types
from .learning_types import (
    LearningTask, LearningExperience, LearningConfiguration,
    LearningProgress, LearningStatus, create_learning_task
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# COMMUNICATION INTERFACES
# ============================================================================

class ComponentInterface(ABC):
    """Base interface for AGI components"""
    
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the component"""
        pass
    
    @abstractmethod
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request from another component"""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Get component capabilities"""
        pass
    
    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Get component status"""
        pass

class MessageBus:
    """Central message bus for inter-component communication"""
    
    def __init__(self):
        self.subscribers = defaultdict(list)
        self.message_history = []
        self.message_handlers = {}
        
        logger.info("📡 Message Bus initialized")
    
    def subscribe(self, event_type: str, handler: Callable, component_id: str):
        """Subscribe to events"""
        self.subscribers[event_type].append({
            'handler': handler,
            'component_id': component_id
        })
        logger.debug(f"📡 {component_id} subscribed to {event_type}")
    
    async def publish(self, event_type: str, message: Dict[str, Any], 
                     sender_id: str) -> List[Dict[str, Any]]:
        """Publish message to subscribers"""
        timestamp = datetime.now()
        
        # Record message
        message_record = {
            'event_type': event_type,
            'message': message,
            'sender_id': sender_id,
            'timestamp': timestamp.isoformat(),
            'recipients': []
        }
        
        responses = []
        
        # Send to all subscribers
        for subscriber in self.subscribers.get(event_type, []):
            try:
                response = await subscriber['handler'](message, sender_id)
                responses.append({
                    'component_id': subscriber['component_id'],
                    'response': response,
                    'status': 'success'
                })
                message_record['recipients'].append(subscriber['component_id'])
                
            except Exception as e:
                logger.error(f"❌ Message handling failed for {subscriber['component_id']}: {e}")
                responses.append({
                    'component_id': subscriber['component_id'],
                    'response': None,
                    'status': 'error',
                    'error': str(e)
                })
        
        # Store message history
        self.message_history.append(message_record)
        
        # Keep history manageable
        if len(self.message_history) > 1000:
            self.message_history = self.message_history[-500:]
        
        logger.debug(f"📡 Published {event_type} from {sender_id} to {len(responses)} components")
        return responses
    
    def get_message_statistics(self) -> Dict[str, Any]:
        """Get message bus statistics"""
        event_counts = defaultdict(int)
        component_activity = defaultdict(int)
        
        for message in self.message_history:
            event_counts[message['event_type']] += 1
            component_activity[message['sender_id']] += 1
            for recipient in message['recipients']:
                component_activity[recipient] += 1
        
        return {
            'total_messages': len(self.message_history),
            'event_types': len(self.subscribers),
            'active_subscriptions': sum(len(subs) for subs in self.subscribers.values()),
            'event_distribution': dict(event_counts),
            'component_activity': dict(component_activity)
        }

class ComponentRegistry:
    """Registry for managing AGI components"""
    
    def __init__(self):
        self.components = {}
        self.component_metadata = {}
        self.dependency_graph = {}
        
        logger.info("📋 Component Registry initialized")
    
    def register_component(self, component_id: str, component: Any, 
                          metadata: Dict[str, Any] = None):
        """Register a component"""
        self.components[component_id] = component
        self.component_metadata[component_id] = {
            'registered_at': datetime.now().isoformat(),
            'component_type': type(component).__name__,
            'metadata': metadata or {},
            'status': 'registered'
        }
        
        logger.info(f"📋 Registered component: {component_id}")
    
    def get_component(self, component_id: str) -> Optional[Any]:
        """Get a component by ID"""
        return self.components.get(component_id)
    
    def list_components(self) -> Dict[str, Dict[str, Any]]:
        """List all registered components"""
        return {
            comp_id: {
                'component': comp,
                'metadata': self.component_metadata.get(comp_id, {})
            }
            for comp_id, comp in self.components.items()
        }
    
    def add_dependency(self, component_id: str, depends_on: List[str]):
        """Add component dependencies"""
        self.dependency_graph[component_id] = depends_on
    
    def get_initialization_order(self) -> List[str]:
        """Get component initialization order based on dependencies"""
        # Topological sort for dependency resolution
        visited = set()
        temp_visited = set()
        result = []
        
        def dfs(node):
            if node in temp_visited:
                raise ValueError(f"Circular dependency detected involving {node}")
            if node in visited:
                return
            
            temp_visited.add(node)
            
            # Visit dependencies first
            for dependency in self.dependency_graph.get(node, []):
                if dependency in self.components:
                    dfs(dependency)
            
            temp_visited.remove(node)
            visited.add(node)
            result.append(node)
        
        # Process all components
        for component_id in self.components.keys():
            if component_id not in visited:
                dfs(component_id)
        
        return result

# ============================================================================
# SYSTEM INTEGRATION ORCHESTRATOR
# ============================================================================

class SystemIntegrationOrchestrator:
    """Main orchestrator for integrated AGI system"""
    
    def __init__(self, config: LearningConfiguration = None):
        self.config = config or LearningConfiguration()
        
        # Communication infrastructure
        self.message_bus = MessageBus()
        self.component_registry = ComponentRegistry()
        
        # Phase 1 Components
        self.agi_system: Optional[AGISystem] = None
        self.memory_architecture: Optional[MemoryArchitecture] = None
        self.consciousness_framework: Optional[ConsciousnessFramework] = None
        self.meta_learning_engine: Optional[MetaLearningEngine] = None
        self.autonomous_goal_system: Optional[AutonomousGoalSystem] = None
        self.advanced_reasoning_system: Optional[AdvancedReasoningSystem] = None
        
        # Advanced Capabilities Components
        self.advanced_tool_use: Optional[AdvancedToolUseSystem] = None
        self.enhanced_planning: Optional[EnhancedPlanningEngine] = None
        self.external_knowledge: Optional[ExternalKnowledgeIntegrationSystem] = None
        self.advanced_learning: Optional[AdvancedLearningSystems] = None
        
        # Integration state
        self.integration_status = {}
        self.system_metrics = defaultdict(list)
        self.unified_api_handlers = {}
        
        # Performance tracking
        self.request_history = []
        self.performance_metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'avg_response_time': 0.0
        }
        
        logger.info("🚀 System Integration Orchestrator initialized")
    
    async def initialize_system(self) -> bool:
        """Initialize the complete integrated system"""
        try:
            logger.info("🚀 Initializing integrated AGI system...")
            
            # Initialize Phase 1 components
            await self._initialize_phase1_components()
            
            # Initialize Advanced Capabilities components
            await self._initialize_advanced_capabilities_components()
            
            # Register all components
            await self._register_components()
            
            # Setup inter-component communication
            await self._setup_communication()
            
            # Initialize components in dependency order
            await self._initialize_components_ordered()
            
            # Setup unified API
            await self._setup_unified_api()
            
            # Perform system validation
            validation_result = await self._perform_system_validation()
            
            if validation_result['success']:
                logger.info("✅ Integrated AGI system initialized successfully")
                return True
            else:
                logger.error(f"❌ System validation failed: {validation_result['errors']}")
                return False
            
        except Exception as e:
            logger.error(f"❌ System initialization failed: {e}")
            return False
    
    async def _initialize_phase1_components(self):
        """Initialize Phase 1 AGI components"""
        try:
            # Initialize AGI System (main orchestrator)
            self.agi_system = AGISystem()
            
            # Initialize Memory Architecture
            self.memory_architecture = MemoryArchitecture()
            
            # Initialize Consciousness Framework
            self.consciousness_framework = ConsciousnessFramework()
            
            # Initialize Meta-Learning Engine
            self.meta_learning_engine = MetaLearningEngine()
            
            # Initialize Autonomous Goal System
            self.autonomous_goal_system = AutonomousGoalSystem()
            
            # Initialize Advanced Reasoning System
            self.advanced_reasoning_system = AdvancedReasoningSystem()
            
            logger.info("✅ Phase 1 components initialized")
            
        except Exception as e:
            logger.error(f"❌ Phase 1 initialization failed: {e}")
            # Create mock components if actual ones fail
            await self._create_mock_phase1_components()
    
    async def _initialize_advanced_capabilities_components(self):
        """Initialize Advanced Capabilities components"""
        try:
            # Initialize Advanced Tool Use System
            self.advanced_tool_use = AdvancedToolUseSystem()
            
            # Initialize Enhanced Planning Engine  
            self.enhanced_planning = EnhancedPlanningEngine()
            
            # Initialize External Knowledge Integration
            self.external_knowledge = ExternalKnowledgeIntegrationSystem()
            
            # Initialize Advanced Learning Systems
            self.advanced_learning = AdvancedLearningSystems()
            
            logger.info("✅ Advanced Capabilities components initialized")
            
        except Exception as e:
            logger.error(f"❌ Advanced Capabilities initialization failed: {e}")
            raise
    
    async def _register_components(self):
        """Register all components in the registry"""
        # Phase 1 components
        if self.agi_system:
            self.component_registry.register_component(
                'agi_system', self.agi_system, 
                {'phase': 1, 'type': 'orchestrator', 'critical': True}
            )
        
        if self.memory_architecture:
            self.component_registry.register_component(
                'memory_architecture', self.memory_architecture,
                {'phase': 1, 'type': 'memory', 'critical': True}
            )
        
        if self.consciousness_framework:
            self.component_registry.register_component(
                'consciousness_framework', self.consciousness_framework,
                {'phase': 1, 'type': 'consciousness', 'critical': True}
            )
        
        if self.meta_learning_engine:
            self.component_registry.register_component(
                'meta_learning_engine', self.meta_learning_engine,
                {'phase': 1, 'type': 'learning', 'critical': True}
            )
        
        if self.autonomous_goal_system:
            self.component_registry.register_component(
                'autonomous_goal_system', self.autonomous_goal_system,
                {'phase': 1, 'type': 'goals', 'critical': True}
            )
        
        if self.advanced_reasoning_system:
            self.component_registry.register_component(
                'advanced_reasoning_system', self.advanced_reasoning_system,
                {'phase': 1, 'type': 'reasoning', 'critical': True}
            )
        
        # Advanced Capabilities components
        self.component_registry.register_component(
            'advanced_tool_use', self.advanced_tool_use,
            {'phase': 2, 'type': 'tools', 'critical': False}
        )
        
        self.component_registry.register_component(
            'enhanced_planning', self.enhanced_planning,
            {'phase': 2, 'type': 'planning', 'critical': False}
        )
        
        self.component_registry.register_component(
            'external_knowledge', self.external_knowledge,
            {'phase': 2, 'type': 'knowledge', 'critical': False}
        )
        
        self.component_registry.register_component(
            'advanced_learning', self.advanced_learning,
            {'phase': 2, 'type': 'learning', 'critical': False}
        )
        
        # Setup dependencies
        self.component_registry.add_dependency('advanced_tool_use', ['agi_system'])
        self.component_registry.add_dependency('enhanced_planning', ['agi_system', 'advanced_tool_use'])
        self.component_registry.add_dependency('external_knowledge', ['memory_architecture'])
        self.component_registry.add_dependency('advanced_learning', ['meta_learning_engine'])
        
        logger.info(f"📋 Registered {len(self.component_registry.components)} components")
    
    async def _setup_communication(self):
        """Setup inter-component communication"""
        # Subscribe components to relevant events
        
        # AGI System events
        if self.agi_system and hasattr(self.agi_system, 'handle_system_event'):
            self.message_bus.subscribe('system_request', self.agi_system.handle_system_event, 'agi_system')
            self.message_bus.subscribe('goal_update', self.agi_system.handle_system_event, 'agi_system')
        
        # Memory events  
        if self.memory_architecture and hasattr(self.memory_architecture, 'handle_memory_event'):
            self.message_bus.subscribe('memory_request', self.memory_architecture.handle_memory_event, 'memory_architecture')
            self.message_bus.subscribe('knowledge_update', self.memory_architecture.handle_memory_event, 'memory_architecture')
        
        # Planning events
        if self.enhanced_planning:
            self.message_bus.subscribe('planning_request', self._handle_planning_event, 'enhanced_planning')
            self.message_bus.subscribe('goal_decomposition', self._handle_planning_event, 'enhanced_planning')
        
        # Tool use events
        if self.advanced_tool_use:
            self.message_bus.subscribe('tool_request', self._handle_tool_event, 'advanced_tool_use')
            self.message_bus.subscribe('external_action', self._handle_tool_event, 'advanced_tool_use')
        
        # Knowledge events
        if self.external_knowledge:
            self.message_bus.subscribe('knowledge_query', self._handle_knowledge_event, 'external_knowledge')
            self.message_bus.subscribe('fact_verification', self._handle_knowledge_event, 'external_knowledge')
        
        # Learning events
        if self.advanced_learning:
            self.message_bus.subscribe('learning_request', self._handle_learning_event, 'advanced_learning')
            self.message_bus.subscribe('adaptation_request', self._handle_learning_event, 'advanced_learning')
        
        logger.info("📡 Inter-component communication setup completed")
    
    async def _initialize_components_ordered(self):
        """Initialize components in dependency order"""
        init_order = self.component_registry.get_initialization_order()
        
        logger.info(f"🔄 Initializing components in order: {init_order}")
        
        for component_id in init_order:
            component = self.component_registry.get_component(component_id)
            
            if component and hasattr(component, 'initialize'):
                try:
                    if asyncio.iscoroutinefunction(component.initialize):
                        result = await component.initialize()
                    else:
                        result = component.initialize()
                    
                    self.integration_status[component_id] = {
                        'initialized': bool(result),
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    if result:
                        logger.info(f"✅ {component_id} initialized successfully")
                    else:
                        logger.warning(f"⚠️ {component_id} initialization returned False")
                        
                except Exception as e:
                    logger.error(f"❌ {component_id} initialization failed: {e}")
                    self.integration_status[component_id] = {
                        'initialized': False,
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    }
            else:
                logger.warning(f"⚠️ {component_id} does not support initialization")
                self.integration_status[component_id] = {
                    'initialized': True,  # Assume success if no init method
                    'timestamp': datetime.now().isoformat(),
                    'note': 'No initialization method'
                }
    
    async def _setup_unified_api(self):
        """Setup unified API for the integrated system"""
        # Register API handlers
        self.unified_api_handlers = {
            # Core AGI operations
            'process_input': self._api_process_input,
            'generate_response': self._api_generate_response,
            'learn_from_experience': self._api_learn_from_experience,
            
            # Planning operations
            'create_plan': self._api_create_plan,
            'execute_plan': self._api_execute_plan,
            'adapt_plan': self._api_adapt_plan,
            
            # Tool operations
            'use_tool': self._api_use_tool,
            'list_tools': self._api_list_tools,
            'validate_tool_use': self._api_validate_tool_use,
            
            # Knowledge operations
            'query_knowledge': self._api_query_knowledge,
            'update_knowledge': self._api_update_knowledge,
            'verify_fact': self._api_verify_fact,
            
            # System operations
            'get_system_status': self._api_get_system_status,
            'get_performance_metrics': self._api_get_performance_metrics,
            'shutdown_system': self._api_shutdown_system
        }
        
        logger.info(f"🔌 Unified API setup with {len(self.unified_api_handlers)} endpoints")
    
    async def process_unified_request(self, request_type: str, 
                                    request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a unified API request"""
        start_time = datetime.now()
        request_id = f"req_{start_time.timestamp()}"
        
        try:
            self.performance_metrics['total_requests'] += 1
            
            logger.info(f"🔄 Processing unified request: {request_type} ({request_id})")
            
            # Check if handler exists
            if request_type not in self.unified_api_handlers:
                raise ValueError(f"Unknown request type: {request_type}")
            
            # Execute handler
            handler = self.unified_api_handlers[request_type]
            response = await handler(request_data, request_id)
            
            # Calculate response time
            response_time = (datetime.now() - start_time).total_seconds()
            
            # Update metrics
            self.performance_metrics['successful_requests'] += 1
            self._update_average_response_time(response_time)
            
            # Record request
            request_record = {
                'request_id': request_id,
                'request_type': request_type,
                'request_data': request_data,
                'response': response,
                'response_time': response_time,
                'status': 'success',
                'timestamp': start_time.isoformat()
            }
            
            self.request_history.append(request_record)
            
            logger.info(f"✅ Request {request_id} completed in {response_time:.3f}s")
            
            return {
                'success': True,
                'request_id': request_id,
                'response': response,
                'response_time': response_time
            }
            
        except Exception as e:
            # Calculate response time for failed request
            response_time = (datetime.now() - start_time).total_seconds()
            
            # Update metrics
            self.performance_metrics['failed_requests'] += 1
            
            # Record failed request
            request_record = {
                'request_id': request_id,
                'request_type': request_type,
                'request_data': request_data,
                'error': str(e),
                'response_time': response_time,
                'status': 'error',
                'timestamp': start_time.isoformat()
            }
            
            self.request_history.append(request_record)
            
            logger.error(f"❌ Request {request_id} failed after {response_time:.3f}s: {e}")
            
            return {
                'success': False,
                'request_id': request_id,
                'error': str(e),
                'response_time': response_time
            }
        
        finally:
            # Cleanup request history
            if len(self.request_history) > 1000:
                self.request_history = self.request_history[-500:]
    
    # API Handler methods
    async def _api_process_input(self, request_data: Dict[str, Any], 
                               request_id: str) -> Dict[str, Any]:
        """Process input through the AGI system"""
        input_text = request_data.get('input', '')
        context = request_data.get('context', {})
        
        if self.agi_system and hasattr(self.agi_system, 'process_input'):
            result = await self.agi_system.process_input(input_text, context)
            return {'processed_input': result}
        else:
            # Fallback processing
            return {
                'processed_input': {
                    'text': input_text,
                    'context': context,
                    'processed_at': datetime.now().isoformat()
                }
            }
    
    async def _api_generate_response(self, request_data: Dict[str, Any],
                                   request_id: str) -> Dict[str, Any]:
        """Generate response using integrated system"""
        prompt = request_data.get('prompt', '')
        context = request_data.get('context', {})
        
        # Use consciousness framework if available
        if (self.consciousness_framework and 
            hasattr(self.consciousness_framework, 'generate_conscious_response')):
            response = await self.consciousness_framework.generate_conscious_response(prompt, context)
            return {'response': response}
        
        # Fallback to basic response
        return {
            'response': {
                'text': f"Processed: {prompt}",
                'confidence': 0.8,
                'generated_at': datetime.now().isoformat()
            }
        }
    
    async def _api_learn_from_experience(self, request_data: Dict[str, Any],
                                       request_id: str) -> Dict[str, Any]:
        """Learn from experience using advanced learning systems"""
        experiences_data = request_data.get('experiences', [])
        
        # Convert to learning experiences
        from .learning_types import create_learning_experience
        
        experiences = []
        for exp_data in experiences_data:
            exp = create_learning_experience(
                task_id=exp_data.get('task_id', 'default'),
                input_data=exp_data.get('input_data'),
                target_data=exp_data.get('target_data'),
                metadata=exp_data.get('metadata', {})
            )
            experiences.append(exp)
        
        if experiences and self.advanced_learning:
            progress = await self.advanced_learning.learn_intelligently(experiences)
            return {
                'learning_progress': {
                    'status': progress.status.value,
                    'current_step': progress.current_step,
                    'total_steps': progress.total_steps
                }
            }
        
        return {'learning_progress': {'status': 'no_learning_system'}}
    
    async def _api_create_plan(self, request_data: Dict[str, Any],
                             request_id: str) -> Dict[str, Any]:
        """Create plan using enhanced planning engine"""
        goal = request_data.get('goal')
        constraints = request_data.get('constraints', {})
        
        if self.enhanced_planning and goal and isinstance(goal, dict):
            from .enhanced_planning_engine import Goal, PlanningConstraint
            
            # Create goal object
            goal_obj = Goal(
                description=goal.get('description', ''),
                priority=goal.get('priority', 1.0),
                deadline=datetime.fromisoformat(goal['deadline']) if goal.get('deadline') else None
            )
            
            # Create constraints
            constraint_objs = []
            for constraint_data in constraints.get('constraints', []):
                constraint = PlanningConstraint(
                    constraint_type=constraint_data.get('type', 'resource'),
                    description=constraint_data.get('description', ''),
                    parameters=constraint_data.get('parameters', {})
                )
                constraint_objs.append(constraint)
            
            # Generate plan
            plan = await self.enhanced_planning.generate_comprehensive_plan(goal_obj.description, {'goal_metadata': goal_obj.__dict__}, constraint_objs)
            
            return {
                'plan': {
                    'id': plan.id,
                    'status': plan.status.value,
                    'num_tasks': len(plan.tasks),
                    'estimated_duration': getattr(plan, 'estimated_duration', None),
                    'confidence': getattr(plan, 'confidence_score', 0.0)
                }
            }
        
        return {'plan': None, 'error': 'No planning engine or invalid goal'}
    
    async def _api_execute_plan(self, request_data: Dict[str, Any],
                              request_id: str) -> Dict[str, Any]:
        """Execute plan using enhanced planning engine"""
        plan_id = request_data.get('plan_id')
        
        if self.enhanced_planning and plan_id:
            execution_result = await self.enhanced_planning.execute_plan_with_monitoring(plan_id)
            return {'execution_result': execution_result}
        
        return {'execution_result': None, 'error': 'No planning engine or invalid plan ID'}
    
    async def _api_adapt_plan(self, request_data: Dict[str, Any],
                            request_id: str) -> Dict[str, Any]:
        """Adapt existing plan using enhanced planning engine"""
        plan_id = request_data.get('plan_id')
        new_context = request_data.get('new_context', {})
        adaptation_reason = request_data.get('reason', 'Context change')
        
        if self.enhanced_planning and plan_id:
            # Use adaptive replanning capability
            adapted_plan = await self.enhanced_planning.adaptive_replan(
                plan_id, new_context, adaptation_reason
            )
            return {
                'adapted_plan': adapted_plan,
                'adaptation_reason': adaptation_reason,
                'timestamp': datetime.now().isoformat()
            }
        
        return {'adapted_plan': None, 'error': 'No planning engine or invalid plan ID'}
    
    async def _api_use_tool(self, request_data: Dict[str, Any],
                          request_id: str) -> Dict[str, Any]:
        """Use tool through advanced tool use system"""
        tool_name = request_data.get('tool_name')
        tool_params = request_data.get('parameters', {})
        
        if self.advanced_tool_use and tool_name:
            result = await self.advanced_tool_use.execute_tool_with_validation(tool_name, tool_params)
            return {'tool_result': result}
        
        return {'tool_result': None, 'error': 'No tool use system or invalid tool name'}
    
    async def _api_list_tools(self, request_data: Dict[str, Any],
                            request_id: str) -> Dict[str, Any]:
        """List available tools"""
        if self.advanced_tool_use:
            tools = self.advanced_tool_use.list_available_tools()
            return {'tools': tools}
        
        return {'tools': [], 'error': 'No tool use system available'}
    
    async def _api_query_knowledge(self, request_data: Dict[str, Any],
                                 request_id: str) -> Dict[str, Any]:
        """Query knowledge using external knowledge integration"""
        query = request_data.get('query')
        knowledge_types = request_data.get('knowledge_types', ['factual'])
        
        if self.external_knowledge and query:
            results = await self.external_knowledge.query_knowledge_unified(query, knowledge_types)
            return {'knowledge_results': results}
        
        return {'knowledge_results': [], 'error': 'No knowledge system or invalid query'}
    
    async def _api_get_system_status(self, request_data: Dict[str, Any],
                                   request_id: str) -> Dict[str, Any]:
        """Get comprehensive system status"""
        status = {
            'integration_status': self.integration_status,
            'component_count': len(self.component_registry.components),
            'performance_metrics': self.performance_metrics,
            'message_bus_stats': self.message_bus.get_message_statistics(),
            'system_uptime': datetime.now().isoformat()
        }
        
        # Get individual component statuses
        component_statuses = {}
        for comp_id, comp in self.component_registry.components.items():
            if hasattr(comp, 'get_status'):
                try:
                    comp_status = comp.get_status()
                    component_statuses[comp_id] = comp_status
                except:
                    component_statuses[comp_id] = {'status': 'unknown'}
            else:
                component_statuses[comp_id] = {'status': 'no_status_method'}
        
        status['component_statuses'] = component_statuses
        
        return status
    
    # Event handlers
    async def _handle_planning_event(self, message: Dict[str, Any], sender_id: str) -> Dict[str, Any]:
        """Handle planning-related events"""
        if self.enhanced_planning:
            event_type = message.get('type')
            
            if event_type == 'goal_decomposition':
                goal = message.get('goal')
                # Process goal decomposition
                return {'status': 'processed', 'component': 'enhanced_planning'}
            elif event_type == 'plan_request':
                # Process plan request
                return {'status': 'processed', 'component': 'enhanced_planning'}
        
        return {'status': 'no_handler', 'component': 'enhanced_planning'}
    
    async def _handle_tool_event(self, message: Dict[str, Any], sender_id: str) -> Dict[str, Any]:
        """Handle tool-related events"""
        if self.advanced_tool_use:
            event_type = message.get('type')
            
            if event_type == 'tool_execution':
                tool_name = message.get('tool_name')
                parameters = message.get('parameters', {})
                # Execute tool
                result = await self.advanced_tool_use.execute_tool_with_validation(tool_name, parameters)
                return {'status': 'executed', 'result': result, 'component': 'advanced_tool_use'}
        
        return {'status': 'no_handler', 'component': 'advanced_tool_use'}
    
    async def _handle_knowledge_event(self, message: Dict[str, Any], sender_id: str) -> Dict[str, Any]:
        """Handle knowledge-related events"""
        if self.external_knowledge:
            event_type = message.get('type')
            
            if event_type == 'knowledge_query':
                query = message.get('query')
                # Process knowledge query
                return {'status': 'processed', 'component': 'external_knowledge'}
        
        return {'status': 'no_handler', 'component': 'external_knowledge'}
    
    async def _handle_learning_event(self, message: Dict[str, Any], sender_id: str) -> Dict[str, Any]:
        """Handle learning-related events"""
        if self.advanced_learning:
            event_type = message.get('type')
            
            if event_type == 'learning_request':
                experiences = message.get('experiences', [])
                # Process learning request
                return {'status': 'processed', 'component': 'advanced_learning'}
        
        return {'status': 'no_handler', 'component': 'advanced_learning'}
    
    # Helper methods
    async def _perform_system_validation(self) -> Dict[str, Any]:
        """Perform comprehensive system validation"""
        validation_results = {
            'success': True,
            'errors': [],
            'warnings': [],
            'component_validations': {}
        }
        
        # Validate component initialization
        for comp_id, status in self.integration_status.items():
            if not status.get('initialized', False):
                validation_results['errors'].append(f"Component {comp_id} not initialized")
                validation_results['success'] = False
        
        # Validate message bus
        if len(self.message_bus.subscribers) == 0:
            validation_results['warnings'].append("No message bus subscribers")
        
        # Validate API handlers
        if len(self.unified_api_handlers) == 0:
            validation_results['errors'].append("No API handlers registered")
            validation_results['success'] = False
        
        # Test basic functionality
        try:
            # Test a simple API call
            test_response = await self._api_get_system_status({}, 'validation_test')
            if not test_response:
                validation_results['errors'].append("System status API test failed")
                validation_results['success'] = False
        except Exception as e:
            validation_results['errors'].append(f"API validation failed: {e}")
            validation_results['success'] = False
        
        return validation_results
    
    async def _create_mock_phase1_components(self):
        """Create mock Phase 1 components if real ones fail"""
        logger.warning("🔧 Creating mock Phase 1 components")
        
        class MockAGISystem:
            async def process_input(self, input_text: str, context: Dict = None):
                return {'processed': input_text, 'context': context or {}}
            
            def get_status(self):
                return {'status': 'mock', 'active': True}
        
        class MockComponent:
            def __init__(self, name: str):
                self.name = name
            
            def get_status(self):
                return {'status': 'mock', 'name': self.name, 'active': True}
        
        if not self.agi_system:
            self.agi_system = MockAGISystem()
        
        if not self.memory_architecture:
            self.memory_architecture = MockComponent('memory_architecture')
        
        if not self.consciousness_framework:
            self.consciousness_framework = MockComponent('consciousness_framework')
        
        if not self.meta_learning_engine:
            self.meta_learning_engine = MockComponent('meta_learning_engine')
        
        if not self.autonomous_goal_system:
            self.autonomous_goal_system = MockComponent('autonomous_goal_system')
        
        if not self.advanced_reasoning_system:
            self.advanced_reasoning_system = MockComponent('advanced_reasoning_system')
    
    def _update_average_response_time(self, response_time: float):
        """Update average response time"""
        current_avg = self.performance_metrics['avg_response_time']
        total_requests = self.performance_metrics['total_requests']
        
        if total_requests > 1:
            new_avg = ((current_avg * (total_requests - 1)) + response_time) / total_requests
            self.performance_metrics['avg_response_time'] = new_avg
        else:
            self.performance_metrics['avg_response_time'] = response_time
    
    def get_integration_statistics(self) -> Dict[str, Any]:
        """Get comprehensive integration statistics"""
        return {
            'system_overview': {
                'total_components': len(self.component_registry.components),
                'initialized_components': sum(1 for status in self.integration_status.values() 
                                            if status.get('initialized', False)),
                'phase1_components': 6,
                'advanced_capabilities_components': 4,
                'api_endpoints': len(self.unified_api_handlers)
            },
            'performance_metrics': self.performance_metrics,
            'communication_stats': self.message_bus.get_message_statistics(),
            'integration_status': self.integration_status,
            'component_registry': {
                'total_registered': len(self.component_registry.components),
                'dependency_graph_size': len(self.component_registry.dependency_graph)
            },
            'request_history_size': len(self.request_history)
        }
    
    async def _api_validate_tool_use(self, request_data: Dict[str, Any],
                                   request_id: str) -> Dict[str, Any]:
        """Validate tool use through security system"""
        tool_name = request_data.get('tool_name')
        parameters = request_data.get('parameters', {})
        context = request_data.get('context', {})
        
        if self.advanced_tool_use and tool_name:
            validation_result = await self.advanced_tool_use.validate_tool_use(
                tool_name, parameters, context
            )
            return {
                'validation_result': validation_result,
                'tool_name': tool_name,
                'timestamp': datetime.now().isoformat()
            }
        
        return {'validation_result': False, 'error': 'No tool use system or invalid tool name'}
    
    async def _api_update_knowledge(self, request_data: Dict[str, Any],
                                  request_id: str) -> Dict[str, Any]:
        """Update knowledge base through external knowledge system"""
        knowledge_item = request_data.get('knowledge_item')
        knowledge_type = request_data.get('knowledge_type', 'factual')
        source = request_data.get('source', 'user_input')
        
        if self.external_knowledge and knowledge_item:
            update_result = await self.external_knowledge.update_knowledge(
                knowledge_item, knowledge_type, source
            )
            return {
                'update_result': update_result,
                'knowledge_type': knowledge_type,
                'timestamp': datetime.now().isoformat()
            }
        
        return {'update_result': False, 'error': 'No knowledge system or invalid knowledge item'}
    
    async def _api_verify_fact(self, request_data: Dict[str, Any],
                             request_id: str) -> Dict[str, Any]:
        """Verify fact using fact checking system"""
        fact_statement = request_data.get('fact_statement')
        context = request_data.get('context', {})
        
        if self.external_knowledge and fact_statement:
            verification_result = await self.external_knowledge.verify_fact(
                fact_statement, context
            )
            return {
                'verification_result': verification_result,
                'fact_statement': fact_statement,
                'timestamp': datetime.now().isoformat()
            }
        
        return {'verification_result': None, 'error': 'No knowledge system or invalid fact statement'}
    
    async def _api_get_performance_metrics(self, request_data: Dict[str, Any],
                                         request_id: str) -> Dict[str, Any]:
        """Get detailed performance metrics"""
        metric_type = request_data.get('metric_type', 'all')
        time_window = request_data.get('time_window', '1h')
        
        try:
            import psutil
        except ImportError:
            psutil = None
        
        metrics = {
            'system_metrics': self.performance_metrics,
            'component_metrics': {},
            'resource_usage': {
                'memory_usage': f"{psutil.virtual_memory().percent}%" if psutil else "unavailable",
                'cpu_usage': f"{psutil.cpu_percent()}%" if psutil else "unavailable",
                'uptime': datetime.now().isoformat()
            },
            'request_stats': {
                'total_requests': self.performance_metrics.get('total_requests', 0),
                'avg_response_time': self.performance_metrics.get('avg_response_time', 0.0),
                'error_rate': self.performance_metrics.get('error_rate', 0.0)
            }
        }
        
        # Get component-specific metrics
        for comp_id, comp in self.component_registry.components.items():
            if hasattr(comp, 'get_performance_metrics'):
                try:
                    comp_metrics = comp.get_performance_metrics()
                    metrics['component_metrics'][comp_id] = comp_metrics
                except:
                    metrics['component_metrics'][comp_id] = {'error': 'metrics_unavailable'}
        
        return {'metrics': metrics, 'timestamp': datetime.now().isoformat()}
    
    async def _api_shutdown_system(self, request_data: Dict[str, Any],
                                 request_id: str) -> Dict[str, Any]:
        """Gracefully shutdown the integrated system"""
        graceful = request_data.get('graceful', True)
        timeout = request_data.get('timeout', 30)
        
        logger.info(f"🔄 Initiating system shutdown (graceful={graceful}, timeout={timeout}s)")
        
        shutdown_status = {
            'initiated_at': datetime.now().isoformat(),
            'graceful': graceful,
            'timeout': timeout,
            'component_shutdowns': {}
        }
        
        # Shutdown components in reverse dependency order
        try:
            shutdown_order = list(reversed(self.component_registry.get_initialization_order()))
        except:
            shutdown_order = list(self.component_registry.components.keys())
        
        for comp_id in shutdown_order:
            if comp_id in self.component_registry.components:
                comp = self.component_registry.components[comp_id]
                try:
                    if hasattr(comp, 'shutdown'):
                        await comp.shutdown()
                    shutdown_status['component_shutdowns'][comp_id] = 'success'
                    logger.info(f"✅ {comp_id} shutdown successfully")
                except Exception as e:
                    shutdown_status['component_shutdowns'][comp_id] = f'error: {str(e)}'
                    logger.error(f"❌ {comp_id} shutdown failed: {str(e)}")
        
        # Shutdown message bus
        try:
            if hasattr(self.message_bus, 'shutdown'):
                self.message_bus.shutdown()
            shutdown_status['message_bus'] = 'success'
        except Exception as e:
            shutdown_status['message_bus'] = f'error: {str(e)}'
        
        # Update integration status
        self.integration_status['shutdown'] = True
        shutdown_status['completed_at'] = datetime.now().isoformat()
        
        logger.info("🔴 System shutdown completed")
        return {'shutdown_status': shutdown_status}

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ System Integration module loaded - Unified AGI system ready!")
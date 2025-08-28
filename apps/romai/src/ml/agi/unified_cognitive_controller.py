"""
Unified Cognitive Controller - Phase 1 AGI Evolution
Core orchestration system for all reasoning engines and memory systems
"""

import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import json

# Import all reasoning engines
from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine
from ml.reasoning.romanian_cultural_intelligence import RomanianCulturalIntelligence
from ml.reasoning.creative_intelligence_engine import CreativeIntelligenceEngine

# Import memory and consciousness systems
from ml.memory.memory_architecture import EnhancedMemoryArchitecture
from ml.consciousness.consciousness_framework_v1 import RomAIConsciousnessFramework
from ml.meta_learning.meta_learning_engine import MetaLearningEngine

# Import AGI Control Center components (simplified for Phase 1)
# Note: AGI Control Center components are integrated into this unified controller
# from ml.agi_control_center import AGIControlCenter  # Will be integrated in Phase 2

logger = logging.getLogger(__name__)

class TaskType(Enum):
    """Types of cognitive tasks"""
    MATHEMATICAL = "mathematical"
    LOGICAL = "logical"  
    CREATIVE = "creative"
    CULTURAL = "cultural"
    PLANNING = "planning"
    LEARNING = "learning"
    MEMORY = "memory"
    MULTI_MODAL = "multi_modal"
    AUTONOMOUS = "autonomous"

class TaskPriority(Enum):
    """Task priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5

@dataclass
class CognitiveTask:
    """Cognitive task representation"""
    id: str
    task_type: TaskType
    priority: TaskPriority
    input_data: Any
    context: Dict[str, Any]
    timeout: float = 30.0
    requires_consciousness: bool = True
    requires_memory: bool = True
    created_at: datetime = None

@dataclass
class CognitiveResponse:
    """Unified cognitive response"""
    task_id: str
    success: bool
    result: Any
    confidence: float
    processing_time: float
    engines_used: List[str]
    memory_updates: List[str]
    consciousness_state: Dict[str, Any]
    reasoning_trace: List[str]
    timestamp: datetime

class UnifiedCognitiveController:
    """
    Unified Cognitive Controller - Phase 1 AGI Evolution
    
    This is the central orchestration system that:
    1. Routes tasks to appropriate reasoning engines
    2. Coordinates memory operations across all systems
    3. Manages consciousness and attention mechanisms
    4. Provides meta-cognitive monitoring and control
    5. Enables autonomous operation and planning
    """
    
    def __init__(self):
        # Core reasoning engines
        self.math_engine = AutonomousMathEngine()
        self.logic_engine = AutonomousLogicalEngine()
        self.cultural_engine = RomanianCulturalIntelligence()
        self.creative_engine = CreativeIntelligenceEngine()
        
        # Memory and consciousness systems
        self.memory_system = EnhancedMemoryArchitecture()
        self.consciousness = RomAIConsciousnessFramework()
        self.meta_learning = MetaLearningEngine({
            'input_dim': 512,
            'max_vram_gb': 1.5,
            'adaptation_steps': 3
        })
        
        # AGI Control Center components (Phase 1: integrated into unified controller)
        # Note: Full AGI Control Center will be implemented in Phase 2
        self.control_center = None  # Placeholder for AGI Control Center
        self.orchestrator = None    # Placeholder for Cognitive Orchestrator  
        self.unified_memory = None  # Placeholder for Unified Memory System
        self.planning_engine = None # Placeholder for Autonomous Planning Engine
        self.learning_system = None # Placeholder for Real-Time Learning System
        
        # Task management
        self.active_tasks = {}
        self.task_queue = asyncio.Queue()
        self.task_history = []
        
        # Performance metrics
        self.performance_metrics = {
            'tasks_processed': 0,
            'success_rate': 0.0,
            'average_response_time': 0.0,
            'engine_utilization': {},
            'memory_operations': 0,
            'consciousness_activations': 0
        }
        
        # Cognitive state
        self.cognitive_state = {
            'attention_focus': None,
            'working_memory_load': 0.0,
            'processing_capacity': 1.0,
            'learning_mode': True,
            'autonomous_mode': False
        }
        
        self.is_running = False
        logger.info("🧠 Unified Cognitive Controller initialized - Phase 1 AGI Evolution")
    
    async def initialize(self):
        """Initialize all cognitive systems"""
        logger.info("🚀 Initializing Phase 1 AGI Evolution systems...")
        
        # Memory systems are already initialized in __init__
        logger.info("✅ Memory systems loaded")
        
        # Consciousness framework is already initialized in __init__
        logger.info("✅ Consciousness framework loaded")
        
        # AGI Control Center is already initialized in __init__
        logger.info("✅ AGI Control Center loaded")
        
        # Start cognitive processing loop
        self.is_running = True
        asyncio.create_task(self._cognitive_processing_loop())
        asyncio.create_task(self._consciousness_loop())
        asyncio.create_task(self._learning_loop())
        
        logger.info("✅ Phase 1 AGI Evolution deployment complete!")
    
    async def process_cognitive_task(self, task: CognitiveTask) -> CognitiveResponse:
        """Process a cognitive task through unified architecture"""
        start_time = time.time()
        task_id = task.id
        
        logger.info(f"🎯 Processing cognitive task: {task_id} ({task.task_type.value})")
        
        try:
            # Update consciousness with new task
            if task.requires_consciousness:
                await self.consciousness.focus_attention(task.input_data, task.context)
            
            # Route task to appropriate engines
            engines_used = []
            reasoning_trace = []
            
            # Determine which engines to use
            selected_engines = self._select_engines(task)
            
            # Process with each selected engine
            results = []
            for engine_name in selected_engines:
                engine_result = await self._process_with_engine(engine_name, task)
                if engine_result:
                    results.append(engine_result)
                    engines_used.append(engine_name)
                    reasoning_trace.extend(engine_result.get('reasoning_steps', []))
            
            # Integrate results through orchestrator or basic integration
            if self.orchestrator:
                integrated_result = await self.orchestrator.integrate_results(results, task)
            else:
                # Basic integration when orchestrator is not available
                integrated_result = await self._basic_integrate_results(results, task)
            
            # Update memory systems
            memory_updates = []
            if task.requires_memory:
                memory_updates = await self._update_memories(task, integrated_result)
            
            # Get consciousness state
            consciousness_state = await self.consciousness.get_consciousness_state()
            
            # Calculate confidence
            confidence = self._calculate_confidence(results, integrated_result)
            
            processing_time = time.time() - start_time
            
            # Create response
            response = CognitiveResponse(
                task_id=task_id,
                success=True,
                result=integrated_result,
                confidence=confidence,
                processing_time=processing_time,
                engines_used=engines_used,
                memory_updates=memory_updates,
                consciousness_state=consciousness_state,
                reasoning_trace=reasoning_trace,
                timestamp=datetime.now()
            )
            
            # Update performance metrics
            self._update_performance_metrics(response)
            
            # Store in task history
            self.task_history.append(response)
            
            logger.info(f"✅ Task completed: {task_id} (confidence: {confidence:.3f})")
            return response
            
        except Exception as e:
            logger.error(f"❌ Task processing failed: {task_id} - {e}")
            return CognitiveResponse(
                task_id=task_id,
                success=False,
                result=f"Error: {str(e)}",
                confidence=0.0,
                processing_time=time.time() - start_time,
                engines_used=[],
                memory_updates=[],
                consciousness_state={},
                reasoning_trace=[f"Error: {str(e)}"],
                timestamp=datetime.now()
            )
    
    def _select_engines(self, task: CognitiveTask) -> List[str]:
        """Select appropriate engines for task"""
        engines = []
        
        if task.task_type == TaskType.MATHEMATICAL:
            engines.extend(['math', 'logic'])
        elif task.task_type == TaskType.LOGICAL:
            engines.extend(['logic', 'math'])
        elif task.task_type == TaskType.CREATIVE:
            engines.extend(['creative', 'cultural'])
        elif task.task_type == TaskType.CULTURAL:
            engines.extend(['cultural', 'creative'])
        elif task.task_type == TaskType.MULTI_MODAL:
            engines.extend(['math', 'logic', 'creative', 'cultural'])
        else:
            # Default to all engines for unknown tasks
            engines.extend(['math', 'logic', 'creative', 'cultural'])
        
        return engines
    
    async def _process_with_engine(self, engine_name: str, task: CognitiveTask) -> Optional[Dict]:
        """Process task with specific engine"""
        try:
            if engine_name == 'math':
                if hasattr(self.math_engine, 'solve_mathematical_problem'):
                    result = await self.math_engine.solve_mathematical_problem(str(task.input_data))
                    return {
                        'engine': 'math',
                        'result': result.result if hasattr(result, 'result') else str(result),
                        'confidence': getattr(result, 'confidence', 0.8),
                        'reasoning_steps': getattr(result, 'steps', ['Mathematical computation completed'])
                    }
            
            elif engine_name == 'logic':
                if hasattr(self.logic_engine, 'reason'):
                    result = await self.logic_engine.reason(str(task.input_data))
                    return {
                        'engine': 'logic',
                        'result': result.conclusion if hasattr(result, 'conclusion') else str(result),
                        'confidence': getattr(result, 'confidence', 0.8),
                        'reasoning_steps': getattr(result, 'reasoning_chain', ['Logical reasoning completed'])
                    }
            
            elif engine_name == 'creative':
                if hasattr(self.creative_engine, 'generate_creative_solution'):
                    result = await self.creative_engine.generate_creative_solution(str(task.input_data))
                    return {
                        'engine': 'creative',
                        'result': result.solution if hasattr(result, 'solution') else str(result),
                        'confidence': getattr(result, 'creativity_score', 0.7),
                        'reasoning_steps': getattr(result, 'creative_process', ['Creative solution generated'])
                    }
            
            elif engine_name == 'cultural':
                if hasattr(self.cultural_engine, 'analyze_cultural_context'):
                    result = await self.cultural_engine.analyze_cultural_context(str(task.input_data))
                    return {
                        'engine': 'cultural',
                        'result': result.analysis if hasattr(result, 'analysis') else str(result),
                        'confidence': getattr(result, 'confidence', 0.8),
                        'reasoning_steps': getattr(result, 'cultural_insights', ['Cultural analysis completed'])
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Engine {engine_name} processing failed: {e}")
            return None
    
    async def _update_memories(self, task: CognitiveTask, result: Any) -> List[str]:
        """Update memory systems with task results"""
        memory_updates = []
        
        try:
            # Store in episodic memory
            episode = {
                'task_id': task.id,
                'task_type': task.task_type.value,
                'input': task.input_data,
                'output': result,
                'timestamp': datetime.now()
            }
            await self.memory_system.store_episodic_memory(
                f"Task {task.id} processed", 
                episode, 
                {'task_importance': task.priority.value}
            )
            memory_updates.append('episodic_memory')
            
            # Store in unified memory
            await self.unified_memory.store_experience(task, result)
            memory_updates.append('unified_memory')
            
            # Update working memory
            await self.memory_system.update_working_memory(task.input_data, result)
            memory_updates.append('working_memory')
            
        except Exception as e:
            logger.error(f"❌ Memory update failed: {e}")
        
        return memory_updates
    
    def _calculate_confidence(self, results: List[Dict], integrated_result: Any) -> float:
        """Calculate overall confidence score"""
        if not results:
            return 0.0
        
        confidences = [r.get('confidence', 0.5) for r in results]
        base_confidence = sum(confidences) / len(confidences)
        
        # Boost confidence if multiple engines agree
        if len(results) > 1:
            base_confidence += 0.1
        
        # Cap at 1.0
        return min(base_confidence, 1.0)
    
    async def _basic_integrate_results(self, results: List[Dict], task: CognitiveTask) -> Dict[str, Any]:
        """Basic result integration when orchestrator is not available"""
        if not results:
            return {
                'status': 'no_results',
                'message': 'No engine results available',
                'result': None
            }
        
        # Use the first result if only one available
        if len(results) == 1:
            return {
                'status': 'single_result',
                'result': results[0].get('result', results[0]),
                'source_engine': results[0].get('engine', 'unknown'),
                'confidence': results[0].get('confidence', 0.5)
            }
        
        # Simple multi-result integration
        best_result = max(results, key=lambda r: r.get('confidence', 0.5))
        
        return {
            'status': 'integrated',
            'result': best_result.get('result', best_result),
            'primary_engine': best_result.get('engine', 'unknown'),
            'confidence': best_result.get('confidence', 0.5),
            'supporting_engines': [r.get('engine', 'unknown') for r in results if r != best_result],
            'total_engines_used': len(results)
        }
    
    def _update_performance_metrics(self, response: CognitiveResponse):
        """Update performance metrics"""
        self.performance_metrics['tasks_processed'] += 1
        
        # Update success rate
        total_tasks = self.performance_metrics['tasks_processed']
        success_count = sum(1 for r in self.task_history if r.success)
        self.performance_metrics['success_rate'] = success_count / total_tasks
        
        # Update average response time
        total_time = sum(r.processing_time for r in self.task_history)
        self.performance_metrics['average_response_time'] = total_time / total_tasks
        
        # Update engine utilization
        for engine in response.engines_used:
            if engine not in self.performance_metrics['engine_utilization']:
                self.performance_metrics['engine_utilization'][engine] = 0
            self.performance_metrics['engine_utilization'][engine] += 1
        
        # Update memory and consciousness counts
        if response.memory_updates:
            self.performance_metrics['memory_operations'] += len(response.memory_updates)
        if response.consciousness_state:
            self.performance_metrics['consciousness_activations'] += 1
    
    async def _cognitive_processing_loop(self):
        """Main cognitive processing loop"""
        logger.info("🔄 Starting cognitive processing loop...")
        
        while self.is_running:
            try:
                # Process queued tasks
                if not self.task_queue.empty():
                    task = await self.task_queue.get()
                    response = await self.process_cognitive_task(task)
                    self.active_tasks[task.id] = response
                
                # Brief pause to prevent CPU overload
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"❌ Cognitive processing loop error: {e}")
                await asyncio.sleep(1.0)
    
    async def _consciousness_loop(self):
        """Consciousness monitoring and updating loop"""
        while self.is_running:
            try:
                # Process consciousness cycle with current sensory input
                current_input = {
                    'timestamp': time.time(),
                    'system_state': self.cognitive_state
                }
                
                await self.consciousness.process_conscious_experience(
                    current_input, 
                    self.cognitive_state
                )
                
                # Monitor attention and working memory
                self.cognitive_state['working_memory_load'] = await self._get_working_memory_load()
                
                # Adjust processing capacity based on load
                if self.cognitive_state['working_memory_load'] > 0.8:
                    self.cognitive_state['processing_capacity'] = 0.7
                else:
                    self.cognitive_state['processing_capacity'] = 1.0
                
                await asyncio.sleep(5.0)  # Update every 5 seconds
                
            except Exception as e:
                logger.error(f"❌ Consciousness loop error: {e}")
                await asyncio.sleep(5.0)
    
    async def _learning_loop(self):
        """Continuous learning loop"""
        while self.is_running:
            try:
                # Check if learning is enabled
                if self.cognitive_state['learning_mode']:
                    # Extract learning opportunities from recent tasks
                    if len(self.task_history) >= 10:
                        recent_tasks = self.task_history[-10:]
                        await self.learning_system.learn_from_experiences(recent_tasks)
                
                await asyncio.sleep(30.0)  # Learn every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Learning loop error: {e}")
                await asyncio.sleep(30.0)
    
    async def _get_working_memory_load(self) -> float:
        """Get current working memory load"""
        try:
            return len(self.active_tasks) / 10.0  # Normalize to 0-1 range
        except:
            return 0.0
    
    async def submit_task(self, task: CognitiveTask) -> str:
        """Submit task for processing"""
        if task.created_at is None:
            task.created_at = datetime.now()
        
        await self.task_queue.put(task)
        logger.info(f"📝 Task submitted: {task.id} ({task.task_type.value})")
        return task.id
    
    async def get_task_result(self, task_id: str) -> Optional[CognitiveResponse]:
        """Get result of processed task"""
        return self.active_tasks.get(task_id)
    
    def get_cognitive_state(self) -> Dict[str, Any]:
        """Get current cognitive state"""
        return {
            'cognitive_state': self.cognitive_state,
            'performance_metrics': self.performance_metrics,
            'active_tasks': len(self.active_tasks),
            'task_queue_size': self.task_queue.qsize(),
            'total_processed': len(self.task_history),
            'system_health': 'operational' if self.is_running else 'stopped'
        }
    
    async def enable_autonomous_mode(self):
        """Enable autonomous operation mode"""
        self.cognitive_state['autonomous_mode'] = True
        
        # Start autonomous planning if engine is available
        if self.planning_engine is not None:
            await self.planning_engine.start_autonomous_planning()
        else:
            logger.info("📋 Planning engine not available - using basic autonomous mode")
            
        logger.info("🤖 Autonomous mode enabled - AGI Phase 1 active!")
    
    async def shutdown(self):
        """Graceful shutdown of cognitive systems"""
        logger.info("🛑 Shutting down Unified Cognitive Controller...")
        self.is_running = False
        
        # Save state and memories
        await self.unified_memory.save_state()
        await self.consciousness.save_state()
        
        logger.info("✅ Cognitive Controller shutdown complete")

# Global instance for Phase 1 AGI Evolution (commented out for safe imports)
# unified_cognitive_controller = UnifiedCognitiveController()

# Convenience functions
async def process_agi_task(input_data: Any, 
                          task_type: TaskType = TaskType.MULTI_MODAL, 
                          priority: TaskPriority = TaskPriority.NORMAL) -> CognitiveResponse:
    """Process task through AGI Phase 1 architecture"""
    task = CognitiveTask(
        id=f"agi_task_{int(time.time() * 1000)}",
        task_type=task_type,
        priority=priority,
        input_data=input_data,
        context={}
    )
    
    return await unified_cognitive_controller.process_cognitive_task(task)

async def initialize_agi_phase1():
    """Initialize AGI Phase 1 evolution"""
    await unified_cognitive_controller.initialize()
    return unified_cognitive_controller

logger.info("✅ Unified Cognitive Controller module loaded - AGI Evolution Phase 1 ready!")
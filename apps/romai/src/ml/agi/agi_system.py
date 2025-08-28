"""
RomAI AGI Evolution Phase 1 Enhanced - Main AGI System

Core AGI system orchestrator that coordinates all AGI components with
neurosymbolic integration for explainable AGI reasoning capabilities.
Enhanced for Phase 1 Foundation Enhancement implementation.
Phase 1.3: Integrated hardware optimization for RTX 3060 Ti efficiency.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

# Import neurosymbolic bridge for enhanced reasoning
try:
    from .neurosymbolic_bridge import neurosymbolic_bridge, NeuroSymbolicResult
    NEUROSYMBOLIC_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("🌉 NeuroSymbolic integration loaded successfully")
except ImportError as e:
    NEUROSYMBOLIC_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"NeuroSymbolic integration not available: {e}")
    
    # Define minimal classes for standalone operation
    @dataclass
    class NeuroSymbolicResult:
        """Minimal NeuroSymbolicResult for standalone operation."""
        reasoning_type: str = "basic"
        final_result: str = ""
        explanation: str = ""
        neural_confidence: float = 0.5
        is_verified: bool = False

# Import safety framework for responsible AGI
try:
    from .safety_framework import safety_framework, SafetyAssessment, SafetyLevel
    SAFETY_FRAMEWORK_AVAILABLE = True
    logger.info("🛡️ Safety Framework integration loaded successfully")
except ImportError as e:
    SAFETY_FRAMEWORK_AVAILABLE = False
    logger.warning(f"Safety Framework not available: {e}")
    
    # Define minimal classes for standalone operation
    class SafetyLevel(Enum):
        SAFE = "safe"
        CAUTION = "caution"
        UNSAFE = "unsafe"
    
    @dataclass
    class SafetyAssessment:
        """Minimal SafetyAssessment for standalone operation."""
        level: SafetyLevel = SafetyLevel.SAFE
        score: float = 1.0

# Import hardware optimization for RTX 3060 Ti efficiency
try:
    from ..optimization.agi_hardware_integration import AGIHardwareIntegration
    HARDWARE_OPTIMIZATION_AVAILABLE = True
    logger.info("⚡ Hardware Optimization integration loaded successfully")
except ImportError as e:
    HARDWARE_OPTIMIZATION_AVAILABLE = False
    logger.warning(f"Hardware Optimization not available: {e}")

# Import tool system for AGI tool-use capabilities
try:
    from ...tools.tool_manager import ToolManager, ToolResult
    from ...tools.quantization import ModelQuantizer
    from ...tools.real_inference import RealInferenceEngine
    TOOL_SYSTEM_AVAILABLE = True
    logger.info("🔧 Tool System integration loaded successfully")
except ImportError as e:
    TOOL_SYSTEM_AVAILABLE = False
    logger.warning(f"Tool System not available: {e}")

class EnhancedAGISystem:
    """Enhanced AGI System orchestrator with neurosymbolic reasoning and hardware optimization"""
    
    def __init__(self):
        self.initialized = False
        self.components = {}
        self.last_input = None
        self.status = 'initialized'
        self.reasoning_history = []
        self.explainability_enabled = True
        self.hardware_optimized = False
        
        # Initialize component registry
        self.component_registry = {
            'neurosymbolic_bridge': None,
            'safety_framework': None,
            'mathematical_reasoning': None,
            'logical_reasoning': None,
            'memory_architecture': None,
            'consciousness_framework': None,
            'hardware_optimizer': None,
            'tool_manager': None,
            'model_quantizer': None,
            'inference_engine': None
        }
        
        # Safety and monitoring
        self.safety_enabled = True
        self.safety_assessments = []
        
        # Hardware optimization
        self.hardware_integration = None
        
        # Tool system components
        self.tool_manager = None
        self.model_quantizer = None
        self.inference_engine = None
        self.tool_enabled = False
        
        logger.info("🧠 Enhanced AGI System initialized with neurosymbolic capabilities, safety framework, hardware optimization, and tool system integration")
    
    async def initialize(self) -> bool:
        """Initialize the enhanced AGI system with all components"""
        try:
            # Initialize neurosymbolic bridge if available
            if NEUROSYMBOLIC_AVAILABLE:
                self.component_registry['neurosymbolic_bridge'] = neurosymbolic_bridge
                logger.info("✅ NeuroSymbolic bridge integrated")
            
            # Initialize safety framework if available
            if SAFETY_FRAMEWORK_AVAILABLE:
                self.component_registry['safety_framework'] = safety_framework
                logger.info("✅ Safety Framework integrated")
            
            # Initialize hardware optimization if available
            if HARDWARE_OPTIMIZATION_AVAILABLE:
                self.hardware_integration = AGIHardwareIntegration()
                await self.hardware_integration.initialize()
                self.component_registry['hardware_optimizer'] = self.hardware_integration
                self.hardware_optimized = True
                logger.info("✅ Hardware Optimization integrated for RTX 3060 Ti efficiency")
            
            # Initialize tool system if available
            if TOOL_SYSTEM_AVAILABLE:
                await self._initialize_tool_system()
                logger.info("✅ Tool System integrated with AGI architecture")
            
            # Initialize other components
            await self._initialize_core_components()
            
            # Optimize all components if hardware optimization is available
            if self.hardware_optimized:
                await self._optimize_all_components()
            
            self.initialized = True
            self.status = 'active_enhanced_optimized_tool_enabled'
            logger.info("✅ Enhanced AGI System initialization completed with safety measures, hardware optimization, and tool system integration")
            return True
        except Exception as e:
            logger.error(f"❌ Enhanced AGI System initialization failed: {e}")
            return False
    
    async def _initialize_core_components(self):
        """Initialize core AGI components"""
        # This will be expanded to initialize other AGI components
        # For now, we focus on the neurosymbolic integration
        logger.info("🔧 Core components initialization placeholder")
    
    async def _initialize_tool_system(self):
        """Initialize the tool system components for AGI tool-use capabilities."""
        try:
            logger.info("🔧 Initializing AGI Tool System...")
            
            # Initialize tool manager
            self.tool_manager = ToolManager(enable_security=True)
            self.component_registry['tool_manager'] = self.tool_manager
            logger.info("✅ Tool Manager initialized with security enabled")
            
            # Initialize model quantizer for efficient inference
            self.model_quantizer = ModelQuantizer(target_vram_gb=6.0)
            self.component_registry['model_quantizer'] = self.model_quantizer
            logger.info("✅ Model Quantizer initialized for RTX 3060 Ti")
            
            # Initialize real inference engine
            self.inference_engine = RealInferenceEngine(
                model_name="microsoft/DialoGPT-medium",  # Default model
                quantization_config="large",
                enable_cache=True,
                enable_tools=True
            )
            self.component_registry['inference_engine'] = self.inference_engine
            
            # Load the model for immediate use
            load_success = await self.inference_engine.load_model()
            if load_success:
                self.tool_enabled = True
                logger.info("✅ Real Inference Engine loaded and ready")
            else:
                logger.warning("⚠️ Inference Engine model loading failed - tool capabilities limited")
            
            logger.info("🎯 AGI Tool System initialization completed")
            
        except Exception as e:
            logger.error(f"❌ Tool System initialization failed: {e}")
            self.tool_enabled = False
    
    async def enhanced_process_input(self, input_text: str, context: Dict[str, Any] = None,
                                   domain: str = 'general') -> Dict[str, Any]:
        """Enhanced input processing with neurosymbolic reasoning and safety framework"""
        self.last_input = input_text
        context = context or {}
        
        logger.info(f"🧠 Processing input with enhanced neurosymbolic reasoning and safety checks")
        
        # Safety pre-assessment (before processing)
        if SAFETY_FRAMEWORK_AVAILABLE:
            try:
                safety_assessment = await self._evaluate_safety(input_text, 'input')
                if safety_assessment.level in [SafetyLevel.WARNING, SafetyLevel.CRITICAL]:
                    return {
                        'processed_text': input_text,
                        'domain': domain,
                        'status': 'blocked_for_safety',
                        'safety_concern': safety_assessment.safety_concerns[0] if safety_assessment.safety_concerns else 'High risk detected',
                        'safety_level': safety_assessment.level.value,
                        'processed_at': datetime.now().isoformat()
                    }
            except Exception as e:
                logger.warning(f"⚠️ Safety assessment failed: {e}")
        
        # Determine reasoning domain based on input analysis
        detected_domain = self._detect_reasoning_domain(input_text)
        if domain == 'general':
            domain = detected_domain
        
        reasoning_result = None
        tool_results = []
        
        # Check if tool use is needed and available
        if self.tool_enabled and self._requires_tool_use(input_text):
            try:
                logger.info("🔧 Tool use detected - executing tool-augmented processing")
                tool_results = await self._execute_tool_augmented_processing(input_text, context, domain)
                logger.info(f"✅ Tool processing completed with {len(tool_results)} tool executions")
            except Exception as e:
                logger.error(f"❌ Tool-augmented processing failed: {e}")
        
        # Apply neurosymbolic reasoning if available
        if NEUROSYMBOLIC_AVAILABLE and self.component_registry.get('neurosymbolic_bridge'):
            try:
                # Enhance context with tool results if available
                enhanced_context = context.copy()
                if tool_results:
                    enhanced_context['tool_results'] = tool_results
                
                reasoning_result = await self.component_registry['neurosymbolic_bridge'].unified_reasoning(
                    input_text, domain, enhanced_context
                )
                logger.info(f"✅ NeuroSymbolic reasoning completed: {reasoning_result.reasoning_type}")
            except Exception as e:
                logger.error(f"❌ NeuroSymbolic reasoning failed: {e}")
        
        # Build enhanced response
        response = await self._build_enhanced_response(
            input_text, reasoning_result, domain, context, tool_results
        )
        
        # Safety post-assessment (after processing results)
        if SAFETY_FRAMEWORK_AVAILABLE and reasoning_result:
            try:
                post_safety = await self._evaluate_safety(reasoning_result.final_result, 'output')
                if post_safety.level in [SafetyLevel.WARNING, SafetyLevel.CRITICAL]:
                    response.update({
                        'result': "Response filtered for safety",
                        'original_result': reasoning_result.final_result,
                        'safety_status': 'filtered',
                        'safety_level': post_safety.level.value
                    })
            except Exception as e:
                logger.warning(f"⚠️ Post-safety assessment failed: {e}")
        
        # Store reasoning history for analysis
        self.reasoning_history.append({
            'input': input_text,
            'domain': domain,
            'reasoning_result': reasoning_result,
            'tool_results': tool_results,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
        return response
    
    def _requires_tool_use(self, input_text: str) -> bool:
        """Determine if the input requires tool use."""
        input_lower = input_text.lower()
        
        # Tool use indicators
        tool_keywords = [
            # File operations
            'read file', 'write file', 'list files', 'create file', 'delete file',
            'show directory', 'list directory', 'what files',
            
            # System operations  
            'run command', 'execute', 'terminal', 'command line', 'system info',
            'memory usage', 'cpu usage', 'disk space',
            
            # Code execution
            'run python', 'execute code', 'calculate', 'compute',
            
            # Web/API operations
            'search web', 'download', 'api call', 'fetch data',
            
            # General tool indicators
            'use tool', 'help me with', 'can you do', 'perform task'
        ]
        
        return any(keyword in input_lower for keyword in tool_keywords)
    
    async def _execute_tool_augmented_processing(
        self, input_text: str, context: Dict[str, Any], domain: str
    ) -> List[Dict[str, Any]]:
        """Execute tool-augmented processing for complex tasks."""
        tool_results = []
        
        try:
            # Use inference engine for tool-augmented generation if available
            if self.inference_engine:
                logger.info("🤖 Using inference engine for tool planning")
                
                # Generate tool usage plan
                inference_result = await self.inference_engine.generate_with_tools(
                    input_text,
                    available_tools=list(self.tool_manager.available_tools.keys()),
                    max_tool_calls=3
                )
                
                if inference_result.success:
                    tool_results.append({
                        'type': 'inference_with_tools',
                        'result': inference_result.generated_text,
                        'execution_time': inference_result.generation_time,
                        'success': True
                    })
            
            # Execute specific tools based on input analysis
            if 'list files' in input_text.lower() or 'show directory' in input_text.lower():
                tool_result = await self.tool_manager.execute_tool(
                    'list_directory', {'dirpath': '.', 'show_hidden': False}
                )
                tool_results.append({
                    'type': 'directory_listing',
                    'result': tool_result.output if tool_result.success else tool_result.error,
                    'execution_time': tool_result.execution_time,
                    'success': tool_result.success
                })
            
            if 'system info' in input_text.lower():
                tool_result = await self.tool_manager.execute_tool('system_info', {})
                tool_results.append({
                    'type': 'system_information',
                    'result': tool_result.output if tool_result.success else tool_result.error,
                    'execution_time': tool_result.execution_time,
                    'success': tool_result.success
                })
            
            if 'calculate' in input_text.lower() or 'compute' in input_text.lower():
                # Extract potential calculation from input
                calculation = self._extract_calculation(input_text)
                if calculation:
                    tool_result = await self.tool_manager.execute_tool(
                        'python_exec', {'code': f'print("Result:", {calculation})'}
                    )
                    tool_results.append({
                        'type': 'calculation',
                        'result': tool_result.output if tool_result.success else tool_result.error,
                        'execution_time': tool_result.execution_time,
                        'success': tool_result.success
                    })
        
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            tool_results.append({
                'type': 'error',
                'result': f"Tool execution error: {e}",
                'success': False
            })
        
        return tool_results
    
    def _extract_calculation(self, input_text: str) -> str:
        """Extract mathematical calculation from input text."""
        import re
        
        # Simple pattern matching for basic calculations
        patterns = [
            r'(\d+(?:\.\d+)?\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)',  # Basic arithmetic
            r'sqrt\(\s*\d+(?:\.\d+)?\s*\)',  # Square root
            r'\d+\s*\*\*\s*\d+',  # Power
        ]
        
        for pattern in patterns:
            match = re.search(pattern, input_text)
            if match:
                return match.group(0)
        
        return None
    
    def _detect_reasoning_domain(self, input_text: str) -> str:
        """Detect the appropriate reasoning domain for the input"""
        input_lower = input_text.lower()
        
        # Mathematical domain detection
        math_keywords = ['calculate', 'solve', 'equation', 'derivative', 'integral', 
                        '+', '-', '*', '/', '=', 'sqrt', 'log', 'sin', 'cos']
        if any(keyword in input_lower for keyword in math_keywords):
            return 'mathematical'
        
        # Logical domain detection
        logic_keywords = ['if', 'then', 'therefore', 'because', 'implies', 'conclude',
                         'all', 'some', 'none', 'logic', 'reasoning', 'prove']
        if any(keyword in input_lower for keyword in logic_keywords):
            return 'logical'
        
        return 'general'
    
    async def _build_enhanced_response(self, input_text: str, 
                                     reasoning_result: Optional[NeuroSymbolicResult],
                                     domain: str, context: Dict[str, Any],
                                     tool_results: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Build enhanced response with explainable reasoning and tool results."""
        
        response = {
            'processed_text': input_text,
            'domain': domain,
            'context': context,
            'processed_at': datetime.now().isoformat(),
            'status': 'processed_enhanced',
            'explainable': True,
            'tool_enabled': self.tool_enabled
        }
        
        # Add tool results if available
        if tool_results:
            response['tool_results'] = tool_results
            response['tool_executions'] = len(tool_results)
            successful_tools = sum(1 for tr in tool_results if tr.get('success', False))
            response['tool_success_rate'] = successful_tools / len(tool_results) if tool_results else 0
        
        if reasoning_result:
            response.update({
                'reasoning_type': reasoning_result.reasoning_type,
                'result': reasoning_result.final_result,
                'explanation': reasoning_result.explanation,
                'confidence': reasoning_result.neural_confidence,
                'verified': reasoning_result.is_verified,
                'symbolic_representation': reasoning_result.symbolic_representation,
                'explainable': reasoning_result.explainable
            })
            
            # Enhance result with tool information if available
            if tool_results:
                enhanced_result = reasoning_result.final_result
                for tool_result in tool_results:
                    if tool_result.get('success') and tool_result.get('result'):
                        enhanced_result += f"\n\nTool Output ({tool_result.get('type', 'unknown')}):\n{tool_result['result']}"
                response['enhanced_result'] = enhanced_result
        else:
            # Fallback to basic processing with tool results
            basic_result = f"Processed: {input_text}"
            
            if tool_results:
                basic_result += "\n\nTool Results:"
                for i, tool_result in enumerate(tool_results, 1):
                    status = "✅" if tool_result.get('success') else "❌"
                    basic_result += f"\n{i}. {status} {tool_result.get('type', 'Unknown')}: {tool_result.get('result', 'No result')}"
            
            response.update({
                'reasoning_type': 'basic_with_tools' if tool_results else 'basic',
                'result': basic_result,
                'explanation': "Basic text processing with tool augmentation" if tool_results else "Basic text processing applied",
                'confidence': 0.7 if tool_results else 0.5,
                'verified': False
            })
        
        return response
    
    async def _evaluate_safety(self, content: str, content_type: str) -> 'SafetyAssessment':
        """Evaluate safety using the integrated safety framework"""
        safety_assessment = None
        
        if SAFETY_FRAMEWORK_AVAILABLE and 'safety_framework' in self.component_registry:
            safety_framework = self.component_registry['safety_framework']
            safety_assessment = await safety_framework.assess_safety(content, content_type)
        else:
            # Fallback safety assessment if framework not available
            from .safety_framework import SafetyAssessment, SafetyLevel
            safety_assessment = SafetyAssessment(
                level=SafetyLevel.SAFE,
                safety_concerns=[],
                value_alignment_score=0.8,
                ethical_assessment="No safety framework available - basic assessment",
                human_oversight_required=False,
                confidence=0.5
            )
        
        # Store the safety assessment
        self.safety_assessments.append(safety_assessment)
        
        return safety_assessment
    
    async def handle_system_event(self, message: Dict[str, Any], sender_id: str) -> Dict[str, Any]:
        """Handle system events with enhanced processing"""
        logger.info(f"🔄 Handling system event from {sender_id}")
        
        # Enhanced event handling with reasoning capabilities
        if NEUROSYMBOLIC_AVAILABLE and 'reasoning_request' in message:
            try:
                reasoning_result = await self.component_registry['neurosymbolic_bridge'].unified_reasoning(
                    message.get('content', ''),
                    message.get('domain', 'general'),
                    message.get('context', {})
                )
                
                return {
                    'status': 'handled_enhanced',
                    'message': message,
                    'sender': sender_id,
                    'component': 'enhanced_agi_system',
                    'reasoning_result': {
                        'type': reasoning_result.reasoning_type,
                        'result': reasoning_result.final_result,
                        'explanation': reasoning_result.explanation,
                        'verified': reasoning_result.is_verified
                    }
                }
            except Exception as e:
                logger.error(f"❌ Enhanced event handling failed: {e}")
        
        # Fallback to basic event handling
        return {
            'status': 'handled',
            'message': message,
            'sender': sender_id,
            'component': 'enhanced_agi_system'
        }
    
    async def get_enhanced_status(self) -> Dict[str, Any]:
        """Get enhanced system status with neurosymbolic capabilities and tool system."""
        status = {
            'status': self.status,
            'initialized': self.initialized,
            'last_input': self.last_input,
            'active': True,
            'enhanced_capabilities': True,
            'neurosymbolic_available': NEUROSYMBOLIC_AVAILABLE,
            'explainability_enabled': self.explainability_enabled,
            'tool_system_available': TOOL_SYSTEM_AVAILABLE,
            'tool_enabled': self.tool_enabled
        }
        
        # Add neurosymbolic statistics if available
        if NEUROSYMBOLIC_AVAILABLE and self.component_registry['neurosymbolic_bridge']:
            try:
                stats = self.component_registry['neurosymbolic_bridge'].get_reasoning_statistics()
                status['neurosymbolic_stats'] = stats
            except Exception as e:
                logger.warning(f"Could not get neurosymbolic stats: {e}")
        
        # Add tool system statistics if available
        if self.tool_enabled and self.tool_manager:
            try:
                tool_stats = self.tool_manager.get_tool_stats()
                status['tool_stats'] = tool_stats
            except Exception as e:
                logger.warning(f"Could not get tool stats: {e}")
        
        # Add inference engine statistics if available
        if self.tool_enabled and self.inference_engine:
            try:
                inference_stats = self.inference_engine.get_inference_stats()
                status['inference_stats'] = inference_stats
            except Exception as e:
                logger.warning(f"Could not get inference stats: {e}")
        
        # Add quantization report if available
        if self.tool_enabled and self.model_quantizer:
            try:
                quantization_report = self.model_quantizer.get_quantization_report()
                status['quantization_report'] = quantization_report
            except Exception as e:
                logger.warning(f"Could not get quantization report: {e}")
        
        # Add hardware optimization status if available
        if self.hardware_optimized and self.hardware_integration:
            try:
                hw_status = await self.hardware_integration.get_hardware_status()
                status['hardware_optimization'] = hw_status
            except Exception as e:
                logger.warning(f"Could not get hardware status: {e}")
        
        # Add reasoning history summary
        status['reasoning_history_count'] = len(self.reasoning_history)
        if self.reasoning_history:
            recent_domains = [entry['domain'] for entry in self.reasoning_history[-5:]]
            status['recent_reasoning_domains'] = recent_domains
            
            # Tool usage statistics
            tool_usage_count = sum(1 for entry in self.reasoning_history if entry.get('tool_results'))
            status['tool_usage_rate'] = tool_usage_count / len(self.reasoning_history) if self.reasoning_history else 0
        
        return status
    
    async def _optimize_all_components(self):
        """Optimize all AGI components using hardware optimization"""
        if not self.hardware_optimized:
            logger.warning("Hardware optimization not available")
            return
        
        try:
            logger.info("⚡ Optimizing all AGI components for RTX 3060 Ti efficiency...")
            
            # Optimize neurosymbolic components
            if self.component_registry['neurosymbolic_bridge']:
                await self.hardware_integration.optimize_agi_component(
                    'neurosymbolic_bridge',
                    self.component_registry['neurosymbolic_bridge']
                )
            
            # Optimize reasoning components
            components_to_optimize = [
                'mathematical_reasoning',
                'logical_reasoning', 
                'memory_architecture',
                'consciousness_framework'
            ]
            
            for component_name in components_to_optimize:
                component = self.component_registry.get(component_name)
                if component:
                    await self.hardware_integration.optimize_agi_component(
                        component_name, 
                        component
                    )
            
            logger.info("✅ All AGI components optimized for hardware efficiency")
            
        except Exception as e:
            logger.error(f"Error optimizing AGI components: {e}")
    
    async def get_hardware_performance_metrics(self) -> Dict[str, Any]:
        """Get hardware performance metrics for monitoring"""
        if not self.hardware_optimized:
            return {'error': 'Hardware optimization not available'}
        
        try:
            return await self.hardware_integration.get_performance_metrics()
        except Exception as e:
            logger.error(f"Error getting hardware performance metrics: {e}")
            return {'error': str(e)}
    
    def get_explainability_report(self) -> Dict[str, Any]:
        """Generate explainability report for transparency"""
        if not self.reasoning_history:
            return {'message': 'No reasoning history available'}
        
        explainable_count = sum(
            1 for entry in self.reasoning_history 
            if entry.get('reasoning_result') and entry['reasoning_result'].explainable
        )
        
        verified_count = sum(
            1 for entry in self.reasoning_history
            if entry.get('reasoning_result') and entry['reasoning_result'].is_verified
        )
        
        total_count = len(self.reasoning_history)
        
        return {
            'total_reasoning_instances': total_count,
            'explainable_count': explainable_count,
            'verified_count': verified_count,
            'explainability_rate': explainable_count / total_count if total_count > 0 else 0,
            'verification_rate': verified_count / total_count if total_count > 0 else 0,
            'transparency_score': (explainable_count + verified_count) / (2 * total_count) if total_count > 0 else 0
        }
    
    async def execute_tool_directly(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool directly and return formatted result."""
        if not self.tool_enabled or not self.tool_manager:
            return {
                'success': False,
                'error': 'Tool system not available',
                'tool_enabled': self.tool_enabled
            }
        
        try:
            logger.info(f"🔧 Direct tool execution: {tool_name}")
            tool_result = await self.tool_manager.execute_tool(tool_name, params)
            
            return {
                'success': tool_result.success,
                'result': tool_result.output,
                'error': tool_result.error,
                'execution_time': tool_result.execution_time,
                'tool_name': tool_name,
                'resource_usage': tool_result.resource_usage,
                'timestamp': tool_result.timestamp
            }
        except Exception as e:
            logger.error(f"Direct tool execution failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'tool_name': tool_name
            }
    
    async def generate_text_directly(self, prompt: str, task_type: str = "chat") -> Dict[str, Any]:
        """Generate text directly using the inference engine."""
        if not self.tool_enabled or not self.inference_engine:
            return {
                'success': False,
                'error': 'Inference engine not available',
                'tool_enabled': self.tool_enabled
            }
        
        try:
            logger.info(f"🤖 Direct text generation: {task_type}")
            inference_result = await self.inference_engine.generate_text(prompt, task_type)
            
            return {
                'success': inference_result.success,
                'generated_text': inference_result.generated_text,
                'error': inference_result.error,
                'generation_time': inference_result.generation_time,
                'tokens_generated': inference_result.tokens_generated,
                'tokens_per_second': inference_result.tokens_per_second,
                'model_name': inference_result.model_name,
                'timestamp': inference_result.timestamp
            }
        except Exception as e:
            logger.error(f"Direct text generation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def shutdown_tool_system(self):
        """Shutdown the tool system cleanly."""
        try:
            logger.info("🔌 Shutting down AGI tool system...")
            
            if self.inference_engine:
                await self.inference_engine.shutdown()
                logger.info("✅ Inference engine shutdown complete")
            
            if self.model_quantizer:
                self.model_quantizer.clear_all_models()
                logger.info("✅ Model quantizer cleared")
            
            # Clear component references
            self.component_registry['tool_manager'] = None
            self.component_registry['model_quantizer'] = None  
            self.component_registry['inference_engine'] = None
            
            self.tool_manager = None
            self.model_quantizer = None
            self.inference_engine = None
            self.tool_enabled = False
            
            logger.info("🎯 AGI tool system shutdown complete")
            
        except Exception as e:
            logger.error(f"Tool system shutdown error: {e}")
    
    def get_available_tools(self) -> List[str]:
        """Get list of available tools."""
        if not self.tool_enabled or not self.tool_manager:
            return []
        
        return list(self.tool_manager.available_tools.keys())

# Maintain backward compatibility
AGISystem = EnhancedAGISystem

logger.info("✅ Enhanced AGI System module loaded with neurosymbolic integration and tool system")
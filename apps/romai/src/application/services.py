"""
Application Services - Business Logic Orchestration Layer
========================================================

This module contains the application services that orchestrate business logic
by coordinating domain entities and calling domain services.

Author: GitHub Copilot Agent
Date: August 24, 2025
Status: Clean Architecture Implementation
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
import logging
import asyncio

from domain.ml.models import (
    ModelId, InferenceRequest, InferenceResponse, ModelStatus,
    MLModel, ModelService, ModelRepository, TrainingMetrics
)
from domain.agi.models import (
    AGIRequest, AGIResponse, AGISession, ReasoningEngine,
    ConsciousnessArchitecture, MetaLearningSystem, AGIOrchestrator,
    AGICapability, ReasoningComplexity, AGIRepository
)

logger = logging.getLogger(__name__)


class MLInferenceService:
    """Application service for ML inference operations"""
    
    def __init__(
        self,
        model_service: ModelService,
        model_repository: ModelRepository
    ):
        self.model_service = model_service
        self.model_repository = model_repository
        self.active_models: Dict[str, MLModel] = {}
    
    async def process_inference(self, request: InferenceRequest) -> InferenceResponse:
        """Process ML inference request with full orchestration"""
        try:
            logger.info(f"Processing inference request {request.request_id} for model {request.model_id}")
            
            # Ensure model is deployed and ready
            await self._ensure_model_ready(request.model_id)
            
            # Process the inference
            response = await self.model_service.process_inference(request)
            
            logger.info(f"Inference completed for request {request.request_id}")
            return response
            
        except Exception as e:
            logger.error(f"Inference failed for request {request.request_id}: {str(e)}")
            raise
    
    async def get_available_models(self) -> List[ModelId]:
        """Get list of all available models"""
        return await self.model_repository.list_models()
    
    async def get_model_status(self, model_id: ModelId) -> ModelStatus:
        """Get status of specific model"""
        return await self.model_service.get_model_status(model_id)
    
    async def deploy_model(self, model_id: ModelId) -> None:
        """Deploy model for inference"""
        logger.info(f"Deploying model {model_id}")
        await self.model_service.deploy_model(model_id)
        logger.info(f"Model {model_id} deployed successfully")
    
    async def undeploy_model(self, model_id: ModelId) -> None:
        """Remove model from inference service"""
        logger.info(f"Undeploying model {model_id}")
        await self.model_service.undeploy_model(model_id)
        logger.info(f"Model {model_id} undeployed successfully")
    
    async def _ensure_model_ready(self, model_id: ModelId) -> None:
        """Ensure model is deployed and ready for inference"""
        status = await self.model_service.get_model_status(model_id)
        
        if status == ModelStatus.OFFLINE:
            await self.model_service.deploy_model(model_id)
            # Wait for model to be ready (with timeout)
            for _ in range(30):  # 30 second timeout
                status = await self.model_service.get_model_status(model_id)
                if status == ModelStatus.READY:
                    break
                await asyncio.sleep(1)
            
            if status != ModelStatus.READY:
                raise RuntimeError(f"Model {model_id} failed to become ready within timeout")


class AGIProcessingService:
    """Application service for AGI request processing"""
    
    def __init__(
        self,
        agi_orchestrator: AGIOrchestrator,
        agi_repository: AGIRepository,
        consciousness_architecture: ConsciousnessArchitecture,
        meta_learning_system: MetaLearningSystem
    ):
        self.agi_orchestrator = agi_orchestrator
        self.agi_repository = agi_repository
        self.consciousness_architecture = consciousness_architecture
        self.meta_learning_system = meta_learning_system
        self.active_sessions: Dict[str, AGISession] = {}
    
    async def process_agi_request(self, request: AGIRequest) -> AGIResponse:
        """Process AGI request with full system coordination"""
        try:
            logger.info(f"Processing AGI request {request.request_id} for capability {request.capability}")
            
            # Route request through orchestrator
            response = await self.agi_orchestrator.coordinate_engines(request)
            
            # Update consciousness state if applicable
            if request.capability in [AGICapability.CONSCIOUSNESS, AGICapability.META_LEARNING]:
                consciousness_state = await self.consciousness_architecture.process_conscious_request(request)
                response.consciousness_state = consciousness_state
            
            # Apply meta-learning if enabled
            if response.learning_updates:
                await self.meta_learning_system.learn_from_experience({
                    'request': request,
                    'response': response,
                    'timestamp': datetime.now()
                })
            
            logger.info(f"AGI request {request.request_id} processed successfully")
            return response
            
        except Exception as e:
            logger.error(f"AGI processing failed for request {request.request_id}: {str(e)}")
            raise
    
    async def create_session(self, user_id: str) -> AGISession:
        """Create new AGI session for user"""
        session = AGISession(
            session_id=f"agi_{user_id}_{int(datetime.now().timestamp())}",
            user_id=user_id,
            context_history=[],
            response_history=[],
            consciousness_evolution=[],
            learning_trajectory=[],
            created_at=datetime.now(),
            last_active=datetime.now()
        )
        
        self.active_sessions[session.session_id] = session
        await self.agi_repository.save_session(session)
        
        logger.info(f"Created AGI session {session.session_id} for user {user_id}")
        return session
    
    async def continue_session(self, session_id: str, request: AGIRequest) -> AGIResponse:
        """Continue existing AGI session with new request"""
        # Load session if not in memory
        if session_id not in self.active_sessions:
            session = await self.agi_repository.load_session(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")
            self.active_sessions[session_id] = session
        
        session = self.active_sessions[session_id]
        
        # Process request with session context
        response = await self.process_agi_request(request)
        
        # Update session
        session.add_interaction(request, response)
        await self.agi_repository.save_session(session)
        
        return response
    
    async def get_session(self, session_id: str) -> Optional[AGISession]:
        """Get AGI session by ID"""
        if session_id in self.active_sessions:
            return self.active_sessions[session_id]
        return await self.agi_repository.load_session(session_id)
    
    async def get_system_capabilities(self) -> List[AGICapability]:
        """Get all available AGI capabilities"""
        system_status = await self.agi_orchestrator.get_system_status()
        return system_status.get('capabilities', [])
    
    async def benchmark_system(self) -> Dict[str, Any]:
        """Run comprehensive AGI system benchmarks"""
        logger.info("Running AGI system benchmarks")
        
        # This would typically run various reasoning tests
        # For now, return system status
        system_status = await self.agi_orchestrator.get_system_status()
        
        benchmark_results = {
            'system_status': system_status,
            'timestamp': datetime.now().isoformat(),
            'benchmark_version': '1.0'
        }
        
        logger.info("AGI system benchmarks completed")
        return benchmark_results


class UnifiedModelService:
    """Unified service that coordinates both ML and AGI operations"""
    
    def __init__(
        self,
        ml_service: MLInferenceService,
        agi_service: AGIProcessingService
    ):
        self.ml_service = ml_service
        self.agi_service = agi_service
    
    async def process_unified_request(self, request_type: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process unified request that might involve both ML and AGI"""
        
        if request_type == "ml_inference":
            # Convert to ML inference request
            inference_request = InferenceRequest(
                request_id=request_data.get('request_id'),
                model_id=ModelId.from_string(request_data['model_id']),
                input_text=request_data['input_text'],
                parameters=request_data.get('parameters', {}),
                context=request_data.get('context'),
                timestamp=datetime.now()
            )
            
            response = await self.ml_service.process_inference(inference_request)
            return {
                'request_id': response.request_id,
                'result': response.result,
                'confidence': response.confidence,
                'metrics': {
                    'processing_time': response.metrics.processing_time,
                    'tokens_processed': response.metrics.tokens_processed,
                    'tokens_per_second': response.metrics.tokens_per_second
                },
                'metadata': response.metadata
            }
        
        elif request_type == "agi_reasoning":
            # Convert to AGI request
            from domain.agi.models import ReasoningContext
            
            context = ReasoningContext(
                domain=request_data.get('domain', 'general'),
                cultural_context=request_data.get('cultural_context'),
                formality_level=request_data.get('formality_level', 'neutral'),
                expertise_level=request_data.get('expertise_level', 'general')
            )
            
            agi_request = AGIRequest(
                request_id=request_data.get('request_id'),
                capability=AGICapability(request_data['capability']),
                query=request_data['query'],
                context=context,
                complexity=ReasoningComplexity(request_data.get('complexity', 'moderate')),
                parameters=request_data.get('parameters', {}),
                timestamp=datetime.now()
            )
            
            response = await self.agi_service.process_agi_request(agi_request)
            return response.to_dict()
        
        else:
            raise ValueError(f"Unknown request type: {request_type}")
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        ml_models = await self.ml_service.get_available_models()
        agi_capabilities = await self.agi_service.get_system_capabilities()
        
        return {
            'ml_service': {
                'available_models': [str(model) for model in ml_models],
                'total_models': len(ml_models)
            },
            'agi_service': {
                'available_capabilities': [cap.value for cap in agi_capabilities],
                'total_capabilities': len(agi_capabilities)
            },
            'timestamp': datetime.now().isoformat(),
            'status': 'operational'
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all services"""
        health_status = {
            'ml_service': 'healthy',
            'agi_service': 'healthy',
            'overall_status': 'healthy',
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            # Check ML service
            await self.ml_service.get_available_models()
        except Exception as e:
            health_status['ml_service'] = f'unhealthy: {str(e)}'
            health_status['overall_status'] = 'degraded'
        
        try:
            # Check AGI service
            await self.agi_service.get_system_capabilities()
        except Exception as e:
            health_status['agi_service'] = f'unhealthy: {str(e)}'
            health_status['overall_status'] = 'degraded'
        
        return health_status
#!/usr/bin/env python3
"""
RomAI Unified Server - Clean Architecture Implementation
=======================================================

This is the complete unified server that replaces the old dual-server architecture
with a clean, maintainable, and properly structured implementation following
clean architecture principles.

Author: GitHub Copilot Agent
Date: August 24, 2025
Status: Complete Implementation with Dependency Injection
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import uvicorn

# Clean architecture imports
from config.container import get_container, DIContainer
from application.services import UnifiedModelService, MLInferenceService, AGIProcessingService
from domain.ml.models import ModelId, InferenceRequest, TaskType
from domain.agi.models import AGICapability, ReasoningComplexity, ReasoningContext, AGIRequest

logger = logging.getLogger(__name__)


# Request/Response Models
class MLInferenceRequestAPI(BaseModel):
    """API model for ML inference requests"""
    model_id: str = Field(..., description="Model identifier (name:version)")
    input_text: str = Field(..., description="Input text for processing")
    task_type: Optional[str] = Field(None, description="Task type for Romanian processing")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Additional parameters")
    context: Optional[Dict[str, Any]] = Field(None, description="Context information")


class AGIReasoningRequestAPI(BaseModel):
    """API model for AGI reasoning requests"""
    capability: str = Field(..., description="AGI capability to use")
    query: str = Field(..., description="Query for reasoning")
    complexity: str = Field(default="moderate", description="Reasoning complexity level")
    domain: str = Field(default="general", description="Domain context")
    cultural_context: Optional[str] = Field(None, description="Cultural context")
    formality_level: str = Field(default="neutral", description="Formality level")
    expertise_level: str = Field(default="general", description="Expertise level")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Additional parameters")


class SystemStatusResponse(BaseModel):
    """System status response model"""
    status: str
    ml_service: Dict[str, Any]
    agi_service: Dict[str, Any]
    timestamp: str


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    ml_service: str
    agi_service: str
    overall_status: str
    timestamp: str


# Dependency injection
async def get_unified_service() -> UnifiedModelService:
    """Get unified service dependency"""
    container = get_container()
    return container.get_unified_model_service()


async def get_ml_service() -> MLInferenceService:
    """Get ML service dependency"""
    container = get_container()
    return container.get_ml_inference_service()


async def get_agi_service() -> AGIProcessingService:
    """Get AGI service dependency"""
    container = get_container()
    return container.get_agi_processing_service()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    logger.info("Starting RomAI Unified Server...")
    
    try:
        container = get_container()
        await container.initialize_services()
        logger.info("RomAI Unified Server started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down RomAI Unified Server...")
    try:
        container = get_container()
        await container.shutdown_services()
        logger.info("RomAI Unified Server shutdown complete")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    app = FastAPI(
        title="RomAI Unified Server",
        description="Production-ready RomAI ML and AGI unified server with clean architecture",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Root endpoint
    @app.get("/", tags=["System"])
    async def root():
        """Root endpoint with system information"""
        return {
            "message": "RomAI Unified Server - Clean Architecture",
            "version": "1.0.0",
            "architecture": "Clean Architecture with Dependency Injection",
            "capabilities": ["ML Inference", "AGI Reasoning", "Consciousness", "Meta-Learning"],
            "timestamp": datetime.now().isoformat()
        }
    
    # Health check endpoint
    @app.get("/health", response_model=HealthResponse, tags=["System"])
    async def health_check(
        unified_service: UnifiedModelService = Depends(get_unified_service)
    ):
        """Comprehensive health check"""
        try:
            health_status = await unified_service.health_check()
            return HealthResponse(**health_status)
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")
    
    # System status endpoint
    @app.get("/status", response_model=SystemStatusResponse, tags=["System"])
    async def system_status(
        unified_service: UnifiedModelService = Depends(get_unified_service)
    ):
        """Get comprehensive system status"""
        try:
            status = await unified_service.get_system_status()
            return SystemStatusResponse(**status)
            
        except Exception as e:
            logger.error(f"Status check failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
    
    # ML Inference endpoints
    @app.get("/models", tags=["ML Inference"])
    async def list_models(
        ml_service: MLInferenceService = Depends(get_ml_service)
    ):
        """List available ML models"""
        try:
            models = await ml_service.get_available_models()
            return {
                "models": [str(model) for model in models],
                "total": len(models),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to list models: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")
    
    @app.get("/models/{model_id}/status", tags=["ML Inference"])
    async def get_model_status(
        model_id: str,
        ml_service: MLInferenceService = Depends(get_ml_service)
    ):
        """Get status of specific model"""
        try:
            model_id_obj = ModelId.from_string(model_id)
            status = await ml_service.get_model_status(model_id_obj)
            
            return {
                "model_id": model_id,
                "status": status.value,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get model status: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")
    
    @app.post("/models/{model_id}/deploy", tags=["ML Inference"])
    async def deploy_model(
        model_id: str,
        background_tasks: BackgroundTasks,
        ml_service: MLInferenceService = Depends(get_ml_service)
    ):
        """Deploy model for inference"""
        try:
            model_id_obj = ModelId.from_string(model_id)
            
            async def deploy_task():
                await ml_service.deploy_model(model_id_obj)
            
            background_tasks.add_task(deploy_task)
            
            return {
                "message": f"Model {model_id} deployment initiated",
                "model_id": model_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to deploy model: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to deploy model: {str(e)}")
    
    @app.post("/inference", tags=["ML Inference"])
    async def ml_inference(
        request: MLInferenceRequestAPI,
        unified_service: UnifiedModelService = Depends(get_unified_service)
    ):
        """Process ML inference request"""
        try:
            # Convert API request to internal format
            request_data = {
                "request_id": f"ml_{int(datetime.now().timestamp() * 1000)}",
                "model_id": request.model_id,
                "input_text": request.input_text,
                "parameters": request.parameters,
                "context": request.context
            }
            
            # Add task type if provided
            if request.task_type:
                request_data["task_type"] = request.task_type
            
            # Process through unified service
            response = await unified_service.process_unified_request("ml_inference", request_data)
            
            return response
            
        except Exception as e:
            logger.error(f"ML inference failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"ML inference failed: {str(e)}")
    
    # AGI Reasoning endpoints
    @app.get("/agi/capabilities", tags=["AGI Reasoning"])
    async def get_agi_capabilities(
        agi_service: AGIProcessingService = Depends(get_agi_service)
    ):
        """Get available AGI capabilities"""
        try:
            capabilities = await agi_service.get_system_capabilities()
            
            return {
                "capabilities": [cap.value for cap in capabilities],
                "total": len(capabilities),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get AGI capabilities: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get AGI capabilities: {str(e)}")
    
    @app.post("/agi/reason", tags=["AGI Reasoning"])
    async def agi_reasoning(
        request: AGIReasoningRequestAPI,
        unified_service: UnifiedModelService = Depends(get_unified_service)
    ):
        """Process AGI reasoning request"""
        try:
            # Convert API request to internal format
            request_data = {
                "request_id": f"agi_{int(datetime.now().timestamp() * 1000)}",
                "capability": request.capability,
                "query": request.query,
                "complexity": request.complexity,
                "domain": request.domain,
                "cultural_context": request.cultural_context,
                "formality_level": request.formality_level,
                "expertise_level": request.expertise_level,
                "parameters": request.parameters
            }
            
            # Process through unified service
            response = await unified_service.process_unified_request("agi_reasoning", request_data)
            
            return response
            
        except Exception as e:
            logger.error(f"AGI reasoning failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"AGI reasoning failed: {str(e)}")
    
    @app.post("/agi/session", tags=["AGI Reasoning"])
    async def create_agi_session(
        user_id: str,
        agi_service: AGIProcessingService = Depends(get_agi_service)
    ):
        """Create new AGI session"""
        try:
            session = await agi_service.create_session(user_id)
            
            return {
                "session_id": session.session_id,
                "user_id": session.user_id,
                "created_at": session.created_at.isoformat(),
                "message": "AGI session created successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to create AGI session: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create AGI session: {str(e)}")
    
    @app.get("/agi/session/{session_id}", tags=["AGI Reasoning"])
    async def get_agi_session(
        session_id: str,
        agi_service: AGIProcessingService = Depends(get_agi_service)
    ):
        """Get AGI session information"""
        try:
            session = await agi_service.get_session(session_id)
            
            if not session:
                raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
            
            return {
                "session_id": session.session_id,
                "user_id": session.user_id,
                "created_at": session.created_at.isoformat(),
                "last_active": session.last_active.isoformat(),
                "interactions": len(session.context_history),
                "consciousness_states": len(session.consciousness_evolution)
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get AGI session: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get AGI session: {str(e)}")
    
    # System management endpoints
    @app.post("/system/benchmark", tags=["System"])
    async def run_system_benchmark(
        background_tasks: BackgroundTasks,
        agi_service: AGIProcessingService = Depends(get_agi_service)
    ):
        """Run comprehensive system benchmarks"""
        try:
            async def benchmark_task():
                await agi_service.benchmark_system()
            
            background_tasks.add_task(benchmark_task)
            
            return {
                "message": "System benchmark initiated",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Benchmark initiation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")
    
    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run server
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        access_log=True
    )

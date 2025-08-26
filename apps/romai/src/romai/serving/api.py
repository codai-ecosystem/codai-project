"""
API Server for RomAI System.

Provides RESTful API endpoints for accessing mathematical reasoning,
logical reasoning, and other AGI capabilities.
"""

import asyncio
import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..core.config import config
from ..reasoning.math import MathEngine
from ..reasoning.logic import LogicEngine
from ..core.types import MathResult, LogicResult, EngineConfig


logger = logging.getLogger(__name__)


# Request/Response Models
class MathRequest(BaseModel):
    """Request model for mathematical reasoning."""
    problem: str = Field(..., description="Mathematical problem to solve")
    cultural_context: bool = Field(True, description="Enable Romanian cultural context")
    timeout: Optional[float] = Field(None, description="Request timeout in seconds")


class LogicRequest(BaseModel):
    """Request model for logical reasoning."""
    premise: str = Field(..., description="Logical premise to reason about")
    reasoning_type: Optional[str] = Field(None, description="Type of reasoning (deductive, inductive, etc.)")
    timeout: Optional[float] = Field(None, description="Request timeout in seconds")


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    service: str
    version: str
    timestamp: float
    engines: Dict[str, Any]


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    detail: str
    timestamp: float


# Global engine instances
math_engine: Optional[MathEngine] = None
logic_engine: Optional[LogicEngine] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global math_engine, logic_engine
    
    # Startup
    logger.info("🚀 Starting RomAI API server...")
    
    try:
        # Initialize engines
        engine_config = EngineConfig(
            timeout_seconds=config.request_timeout,
            confidence_threshold=0.7,
            enable_cultural_context=config.enable_cultural_context,
            log_level=config.log_level
        )
        
        math_engine = MathEngine(engine_config)
        logic_engine = LogicEngine(engine_config)
        
        # Perform health checks
        math_health = await math_engine.health_check()
        logic_health = await logic_engine.health_check()
        
        logger.info(f"🧮 Math engine: {math_health['status']}")
        logger.info(f"🧠 Logic engine: {logic_health['status']}")
        logger.info("✅ RomAI API server started successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"Failed to start RomAI API server: {e}")
        raise
    
    finally:
        # Shutdown
        logger.info("🛑 Shutting down RomAI API server...")
        math_engine = None
        logic_engine = None
        logger.info("✅ RomAI API server shut down completed")


# Create FastAPI application
app = FastAPI(
    title="RomAI API",
    description="Romanian Artificial General Intelligence System API",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
if config.server.cors_enabled:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """Log all requests for monitoring."""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Log request details
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    global math_engine, logic_engine
    
    engines_health = {}
    
    if math_engine:
        engines_health["math"] = await math_engine.health_check()
    else:
        engines_health["math"] = {"status": "not_initialized"}
    
    if logic_engine:
        engines_health["logic"] = await logic_engine.health_check()
    else:
        engines_health["logic"] = {"status": "not_initialized"}
    
    return HealthResponse(
        status="healthy" if all(e.get("status") == "healthy" for e in engines_health.values()) else "degraded",
        service="romai-api",
        version="2.0.0",
        timestamp=time.time(),
        engines=engines_health
    )


@app.post("/api/v1/reasoning/math", response_model=Dict[str, Any])
async def solve_math_problem(request: MathRequest):
    """Solve mathematical problems using the math reasoning engine."""
    global math_engine
    
    if not math_engine:
        raise HTTPException(status_code=503, detail="Math engine not available")
    
    try:
        # Set timeout if provided
        if request.timeout:
            math_engine.config.timeout_seconds = request.timeout
        
        # Process mathematical problem
        result = await math_engine.process(
            request.problem,
            cultural_context=request.cultural_context
        )
        
        # Convert result to dictionary
        return {
            "success": result.success,
            "result": str(result.result),
            "steps": result.steps,
            "method": result.method_used,
            "confidence": result.confidence,
            "processing_time": result.processing_time,
            "verification": result.verification,
            "symbolic_form": result.symbolic_form,
            "numerical_form": result.numerical_form,
            "metadata": result.metadata
        }
        
    except Exception as e:
        logger.error(f"Math reasoning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/reasoning/logic", response_model=Dict[str, Any])
async def reason_logically(request: LogicRequest):
    """Perform logical reasoning using the logic reasoning engine."""
    global logic_engine
    
    if not logic_engine:
        raise HTTPException(status_code=503, detail="Logic engine not available")
    
    try:
        # Set timeout if provided
        if request.timeout:
            logic_engine.config.timeout_seconds = request.timeout
        
        # Process logical reasoning
        result = await logic_engine.process(
            request.premise,
            reasoning_type=request.reasoning_type
        )
        
        # Convert result to dictionary
        return {
            "success": result.success,
            "conclusion": result.conclusion,
            "reasoning_chain": result.reasoning_chain,
            "confidence": result.confidence,
            "processing_time": result.processing_time,
            "premises": result.premises,
            "inference_rules": result.inference_rules,
            "logical_form": result.logical_form,
            "validity": result.validity,
            "metadata": result.metadata
        }
        
    except Exception as e:
        logger.error(f"Logic reasoning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/engines/status")
async def get_engines_status():
    """Get detailed status of all reasoning engines."""
    global math_engine, logic_engine
    
    status = {}
    
    if math_engine:
        status["math_engine"] = {
            "name": math_engine.name,
            "operations_count": math_engine._operation_count,
            "average_processing_time": math_engine.average_processing_time,
            "health": await math_engine.health_check()
        }
    
    if logic_engine:
        status["logic_engine"] = {
            "name": logic_engine.name,
            "operations_count": logic_engine._operation_count,
            "average_processing_time": logic_engine.average_processing_time,
            "health": await logic_engine.health_check()
        }
    
    return status


@app.get("/api/v1/config")
async def get_configuration():
    """Get current API configuration."""
    return {
        "server": {
            "host": config.server.host,
            "port": config.server.port,
            "debug": config.server.debug,
            "cors_enabled": config.server.cors_enabled
        },
        "features": {
            "cultural_context": config.enable_cultural_context,
            "romanian_processing": config.enable_romanian_processing
        },
        "performance": {
            "max_concurrent_requests": config.max_concurrent_requests,
            "request_timeout": config.request_timeout,
            "cache_enabled": config.cache_enabled
        }
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.__class__.__name__,
            detail=exc.detail,
            timestamp=time.time()
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="InternalServerError",
            detail="An unexpected error occurred",
            timestamp=time.time()
        ).dict()
    )


# Development endpoints (only in debug mode)
if config.server.debug:
    @app.get("/api/v1/debug/test-math")
    async def debug_test_math():
        """Debug endpoint to test math engine."""
        if not math_engine:
            raise HTTPException(status_code=503, detail="Math engine not available")
        
        test_problems = [
            "√144",
            "2 + 2 * 3",
            "solve x^2 - 5x + 6 = 0"
        ]
        
        results = []
        for problem in test_problems:
            result = await math_engine.process(problem)
            results.append({
                "problem": problem,
                "result": str(result.result),
                "success": result.success,
                "confidence": result.confidence
            })
        
        return {"test_results": results}
    
    
    @app.get("/api/v1/debug/test-logic")  
    async def debug_test_logic():
        """Debug endpoint to test logic engine."""
        if not logic_engine:
            raise HTTPException(status_code=503, detail="Logic engine not available")
        
        test_premises = [
            "All roses are flowers. This is a rose.",
            "If it rains, the ground gets wet. It is raining.",
            "All birds can fly. Penguins are birds."
        ]
        
        results = []
        for premise in test_premises:
            result = await logic_engine.process(premise)
            results.append({
                "premise": premise,
                "conclusion": result.conclusion,
                "success": result.success,
                "confidence": result.confidence
            })
        
        return {"test_results": results}
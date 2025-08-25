"""
RomAI AGI Production FastAPI Server
Production-grade API server with authentication, monitoring, and optimization
"""

import asyncio
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Security, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import structlog

# RomAI imports
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from reasoning.autonomous_math_engine import AutonomousMathEngine
from reasoning.autonomous_logical_engine import AutonomousLogicalEngine
from reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Metrics
REQUEST_COUNT = Counter('romai_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('romai_request_duration_seconds', 'Request duration', ['method', 'endpoint'])
ACTIVE_CONNECTIONS = Gauge('romai_active_connections', 'Active connections')
ENGINE_USAGE = Counter('romai_engine_usage_total', 'Engine usage count', ['engine_type'])
ERROR_COUNT = Counter('romai_errors_total', 'Total errors', ['error_type'])

# Pydantic Models
class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "RomAI AGI"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    uptime_seconds: float
    engines_status: Dict[str, str]
    system_metrics: Dict[str, Any]

class MathRequest(BaseModel):
    problem: str = Field(..., description="Mathematical problem to solve", min_length=1, max_length=1000)
    context: Optional[str] = Field(None, description="Additional context for the problem")
    timeout_seconds: Optional[int] = Field(30, ge=1, le=300, description="Request timeout in seconds")

class MathResponse(BaseModel):
    request_id: str
    result: str
    steps: List[str]
    method: str
    confidence: float
    domain: str
    processing_time: float
    timestamp: datetime

class LogicRequest(BaseModel):
    premise: str = Field(..., description="Logical premise to analyze", min_length=1, max_length=2000)
    reasoning_type: Optional[str] = Field("deductive", description="Type of logical reasoning")
    timeout_seconds: Optional[int] = Field(30, ge=1, le=300, description="Request timeout in seconds")

class LogicResponse(BaseModel):
    request_id: str
    conclusion: str
    reasoning_chain: List[str]
    confidence: float
    method: str
    processing_time: float
    timestamp: datetime

class RomanianRequest(BaseModel):
    text: str = Field(..., description="Romanian text to process", min_length=1, max_length=5000)
    analysis_type: Optional[str] = Field("general", description="Type of analysis to perform")
    timeout_seconds: Optional[int] = Field(30, ge=1, le=300, description="Request timeout in seconds")

class RomanianResponse(BaseModel):
    request_id: str
    response: str
    cultural_context: List[str]
    language_features: List[str]
    confidence: float
    processing_time: float
    timestamp: datetime

class ErrorResponse(BaseModel):
    error: str
    message: str
    request_id: str
    timestamp: datetime
    details: Optional[Dict[str, Any]] = None

# Global state
class ApplicationState:
    def __init__(self):
        self.start_time = time.time()
        self.math_engine = None
        self.logic_engine = None
        self.romanian_engine = None
        self.request_count = 0

app_state = ApplicationState()

# Security
security = HTTPBearer(auto_error=False)

async def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)):
    """Verify JWT token for authentication"""
    # In production, implement proper JWT verification
    # For now, accept any token or no token for development
    if credentials:
        token = credentials.credentials
        # TODO: Implement proper JWT verification with your auth service
        logger.info("Authentication attempted", token_prefix=token[:10] + "...")
    
    return {"authenticated": True, "user_id": "anonymous"}

# Lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    logger.info("🚀 Starting RomAI AGI Production Server")
    
    # Initialize engines
    try:
        app_state.math_engine = AutonomousMathEngine()
        app_state.logic_engine = AutonomousLogicalEngine()
        app_state.romanian_engine = AutonomousRomanianEngine()
        logger.info("✅ All reasoning engines initialized successfully")
    except Exception as e:
        logger.error("❌ Failed to initialize engines", error=str(e))
        raise
    
    yield
    
    logger.info("🛑 Shutting down RomAI AGI Production Server")

# Create FastAPI app
app = FastAPI(
    title="RomAI AGI Production API",
    description="Production-grade Romanian Artificial General Intelligence system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    """Collect metrics for all requests"""
    start_time = time.time()
    ACTIVE_CONNECTIONS.inc()
    
    try:
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(duration)
        response.headers["X-RomAI-Version"] = "1.0.0"
        
        return response
        
    except Exception as e:
        ERROR_COUNT.labels(error_type=type(e).__name__).inc()
        raise
    finally:
        ACTIVE_CONNECTIONS.dec()

# Health endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for load balancer and monitoring"""
    uptime = time.time() - app_state.start_time
    
    # Check engine status
    engines_status = {}
    try:
        engines_status["mathematical"] = "healthy" if app_state.math_engine else "unavailable"
        engines_status["logical"] = "healthy" if app_state.logic_engine else "unavailable"
        engines_status["romanian"] = "healthy" if app_state.romanian_engine else "unavailable"
    except Exception as e:
        logger.error("Engine status check failed", error=str(e))
        engines_status = {"error": str(e)}
    
    return HealthResponse(
        uptime_seconds=uptime,
        engines_status=engines_status,
        system_metrics={
            "request_count": app_state.request_count,
            "memory_usage": "unknown",  # Add actual memory monitoring
            "cpu_usage": "unknown"      # Add actual CPU monitoring
        }
    )

# Readiness endpoint
@app.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes"""
    if not all([app_state.math_engine, app_state.logic_engine, app_state.romanian_engine]):
        raise HTTPException(status_code=503, detail="Services not ready")
    return {"status": "ready"}

# Mathematical reasoning endpoint
@app.post("/api/v1/math/solve", response_model=MathResponse)
async def solve_mathematical_problem(
    request: MathRequest,
    background_tasks: BackgroundTasks,
    auth: dict = Depends(verify_token)
):
    """Solve mathematical problems using neural-symbolic reasoning"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    logger.info("Mathematical problem received", 
                request_id=request_id, 
                problem=request.problem[:100])
    
    try:
        ENGINE_USAGE.labels(engine_type="mathematical").inc()
        
        if not app_state.math_engine:
            raise HTTPException(status_code=503, detail="Mathematical engine not available")
        
        # Solve with timeout
        try:
            result = await asyncio.wait_for(
                app_state.math_engine.solve_mathematical_problem(request.problem),
                timeout=request.timeout_seconds
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Request timeout")
        
        processing_time = time.time() - start_time
        app_state.request_count += 1
        
        # Background logging
        background_tasks.add_task(
            lambda: logger.info("Math problem solved", 
                               request_id=request_id,
                               processing_time=processing_time)
        )
        
        return MathResponse(
            request_id=request_id,
            result=str(result.result) if hasattr(result, 'result') else str(result),
            steps=result.steps if hasattr(result, 'steps') else [],
            method=result.method if hasattr(result, 'method') else "unknown",
            confidence=result.confidence if hasattr(result, 'confidence') else 0.0,
            domain=result.domain if hasattr(result, 'domain') else "general",
            processing_time=processing_time,
            timestamp=datetime.now(timezone.utc)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        ERROR_COUNT.labels(error_type=type(e).__name__).inc()
        logger.error("Mathematical problem solving failed", 
                    request_id=request_id, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Mathematical reasoning failed: {str(e)}")

# Logical reasoning endpoint
@app.post("/api/v1/logic/reason", response_model=LogicResponse)
async def logical_reasoning(
    request: LogicRequest,
    background_tasks: BackgroundTasks,
    auth: dict = Depends(verify_token)
):
    """Perform logical reasoning using neural-symbolic approach"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    logger.info("Logical reasoning requested", 
                request_id=request_id, 
                premise=request.premise[:100])
    
    try:
        ENGINE_USAGE.labels(engine_type="logical").inc()
        
        if not app_state.logic_engine:
            raise HTTPException(status_code=503, detail="Logical engine not available")
        
        # Reason with timeout
        try:
            result = await asyncio.wait_for(
                app_state.logic_engine.reason(request.premise),
                timeout=request.timeout_seconds
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Request timeout")
        
        processing_time = time.time() - start_time
        app_state.request_count += 1
        
        return LogicResponse(
            request_id=request_id,
            conclusion=result.conclusion if hasattr(result, 'conclusion') else str(result),
            reasoning_chain=result.reasoning_chain if hasattr(result, 'reasoning_chain') else [],
            confidence=result.confidence if hasattr(result, 'confidence') else 0.0,
            method=result.method if hasattr(result, 'method') else "unknown",
            processing_time=processing_time,
            timestamp=datetime.now(timezone.utc)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        ERROR_COUNT.labels(error_type=type(e).__name__).inc()
        logger.error("Logical reasoning failed", 
                    request_id=request_id, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Logical reasoning failed: {str(e)}")

# Romanian processing endpoint
@app.post("/api/v1/romanian/process", response_model=RomanianResponse)
async def process_romanian_text(
    request: RomanianRequest,
    background_tasks: BackgroundTasks,
    auth: dict = Depends(verify_token)
):
    """Process Romanian text with cultural intelligence"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    logger.info("Romanian processing requested", 
                request_id=request_id, 
                text=request.text[:100])
    
    try:
        ENGINE_USAGE.labels(engine_type="romanian").inc()
        
        if not app_state.romanian_engine:
            raise HTTPException(status_code=503, detail="Romanian engine not available")
        
        # Process with timeout
        try:
            result = await asyncio.wait_for(
                app_state.romanian_engine.process_romanian_text(request.text),
                timeout=request.timeout_seconds
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Request timeout")
        
        processing_time = time.time() - start_time
        app_state.request_count += 1
        
        return RomanianResponse(
            request_id=request_id,
            response=result.response if hasattr(result, 'response') else str(result),
            cultural_context=result.cultural_context if hasattr(result, 'cultural_context') else [],
            language_features=result.language_features if hasattr(result, 'language_features') else [],
            confidence=result.confidence if hasattr(result, 'confidence') else 0.0,
            processing_time=processing_time,
            timestamp=datetime.now(timezone.utc)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        ERROR_COUNT.labels(error_type=type(e).__name__).inc()
        logger.error("Romanian processing failed", 
                    request_id=request_id, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Romanian processing failed: {str(e)}")

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type="text/plain")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error="HTTP_ERROR",
            message=exc.detail,
            request_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc)
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    ERROR_COUNT.labels(error_type=type(exc).__name__).inc()
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="INTERNAL_ERROR",
            message="Internal server error occurred",
            request_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc),
            details={"error_type": type(exc).__name__}
        ).dict()
    )

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=1,  # Single worker for development
        log_level="info",
        reload=False,
        access_log=True
    )
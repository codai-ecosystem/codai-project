"""
RomAI API Integration Layer
Replaces existing hardcoded endpoints with genuine AI-powered responses
Integrates with unified intelligence system
"""
import asyncio
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import time
from datetime import datetime
import uvicorn
import sys
import os

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ai.romai_intelligence_system import RomAIIntelligenceSystem, UnifiedResult
from config.romai_config import RomAIConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for API
class QueryRequest(BaseModel):
    query: str = Field(..., description="The user's query or question")
    domain_hint: Optional[str] = Field(None, description="Optional domain hint: mathematics, logic, romanian_culture, general")
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    session_id: Optional[str] = Field(None, description="Optional session identifier")

class QueryResponse(BaseModel):
    content: str
    domain: str
    processing_time: float
    confidence: float
    engine_used: str
    timestamp: str
    genuine_ai: bool = True
    hardcoded: bool = False

class MultiDomainRequest(BaseModel):
    query: str = Field(..., description="Query to analyze across all domains")

class SystemStatusResponse(BaseModel):
    system: str
    status: str
    genuine_ai: bool
    hardcoded_responses: bool
    powered_by: str
    engines: Dict[str, Any]
    timestamp: str

# Initialize FastAPI app
app = FastAPI(
    title="RomAI Intelligence API",
    description="Genuine AI-powered intelligence system using Azure OpenAI GPT-4o",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize intelligence system
intelligence_system = RomAIIntelligenceSystem()
config = RomAIConfig()

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup"""
    logger.info("Starting RomAI Intelligence API...")
    logger.info("Powered by Azure OpenAI GPT-4o")
    logger.info("NO hardcoded responses - everything is genuine AI")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "RomAI Intelligence API", 
        "version": "2.0.0",
        "genuine_ai": True,
        "hardcoded_responses": False,
        "powered_by": "Azure OpenAI GPT-4o",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status", response_model=SystemStatusResponse)
async def get_system_status():
    """Get comprehensive system status"""
    try:
        status = await intelligence_system.get_system_status()
        return SystemStatusResponse(**status)
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process a query using the unified intelligence system
    NO hardcoded responses - powered by Azure OpenAI GPT-4o
    """
    try:
        start_time = time.time()
        
        # Process query using unified intelligence system
        result = await intelligence_system.process_query(
            query=request.query,
            domain_hint=request.domain_hint
        )
        
        # Create response
        response = QueryResponse(
            content=result.content,
            domain=result.domain,
            processing_time=result.processing_time,
            confidence=result.confidence,
            engine_used=result.engine_used,
            timestamp=result.timestamp
        )
        
        logger.info(f"Processed query in {result.processing_time:.2f}s using {result.engine_used}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/api/multi-domain")
async def process_multi_domain(request: MultiDomainRequest):
    """Process query across all domains for comprehensive analysis"""
    try:
        results = await intelligence_system.process_multi_domain_query(request.query)
        
        # Convert results to serializable format
        serializable_results = {}
        for domain, result in results.items():
            serializable_results[domain] = {
                "content": result.content,
                "domain": result.domain,
                "processing_time": result.processing_time,
                "confidence": result.confidence,
                "engine_used": result.engine_used,
                "timestamp": result.timestamp
            }
        
        return {
            "query": request.query,
            "results": serializable_results,
            "total_domains": len(serializable_results),
            "genuine_ai": True,
            "hardcoded": False,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing multi-domain query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/compare-engines")
async def compare_engines(request: QueryRequest):
    """Compare responses from different engines"""
    try:
        comparison = await intelligence_system.compare_engine_responses(request.query)
        return comparison
        
    except Exception as e:
        logger.error(f"Error comparing engines: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Legacy endpoint compatibility (but now with genuine AI)
@app.post("/api/mathematical/solve")
async def solve_mathematical_problem(request: QueryRequest):
    """Legacy mathematical endpoint - now powered by genuine AI"""
    try:
        result = await intelligence_system.process_query(
            query=request.query,
            domain_hint="mathematics"
        )
        
        return {
            "result": result.content,
            "confidence": result.confidence,
            "processing_time": result.processing_time,
            "engine": result.engine_used,
            "genuine_ai": True,
            "hardcoded": False,
            "timestamp": result.timestamp
        }
        
    except Exception as e:
        logger.error(f"Error in mathematical solving: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/logical/reason")
async def logical_reasoning(request: QueryRequest):
    """Legacy logical reasoning endpoint - now powered by genuine AI"""
    try:
        result = await intelligence_system.process_query(
            query=request.query,
            domain_hint="logic"
        )
        
        return {
            "conclusion": result.content,
            "confidence": result.confidence,
            "processing_time": result.processing_time,
            "engine": result.engine_used,
            "genuine_ai": True,
            "hardcoded": False,
            "timestamp": result.timestamp
        }
        
    except Exception as e:
        logger.error(f"Error in logical reasoning: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cultural/analyze")
async def cultural_analysis(request: QueryRequest):
    """Legacy cultural analysis endpoint - now powered by genuine AI"""
    try:
        result = await intelligence_system.process_query(
            query=request.query,
            domain_hint="romanian_culture"
        )
        
        return {
            "cultural_insight": result.content,
            "confidence": result.confidence,
            "processing_time": result.processing_time,
            "engine": result.engine_used,
            "genuine_ai": True,
            "hardcoded": False,
            "timestamp": result.timestamp
        }
        
    except Exception as e:
        logger.error(f"Error in cultural analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Development and testing endpoints
@app.get("/api/test/engines")
async def test_all_engines():
    """Test all engines with sample queries"""
    test_queries = {
        "mathematics": "What is the derivative of x^2 + 3x + 2?",
        "logic": "All roses are flowers. This is a rose. What can we conclude?",
        "romanian_culture": "What are traditional Romanian Christmas customs?",
        "general": "Explain photosynthesis in simple terms"
    }
    
    results = {}
    
    for domain, query in test_queries.items():
        try:
            result = await intelligence_system.process_query(query, domain_hint=domain)
            results[domain] = {
                "query": query,
                "response": result.content[:100] + "...",
                "confidence": result.confidence,
                "processing_time": result.processing_time,
                "engine": result.engine_used,
                "success": True
            }
        except Exception as e:
            results[domain] = {
                "query": query,
                "error": str(e),
                "success": False
            }
    
    return {
        "test_results": results,
        "summary": {
            "total_tests": len(test_queries),
            "successful": sum(1 for r in results.values() if r.get("success", False)),
            "failed": sum(1 for r in results.values() if not r.get("success", False))
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "romai_api_integration:app",
        host="0.0.0.0",
        port=6102,  # Different port to avoid conflicts
        reload=True,
        log_level="info"
    )
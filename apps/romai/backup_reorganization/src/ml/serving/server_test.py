#!/usr/bin/env python3
"""
Simple Test Server for Phase 7 Production Stability System
Fast startup and clean shutdown for testing purposes

Author: RomAI Development Team
Date: August 6, 2025
Version: 7.0.0 - Test Server
"""

import asyncio
import uvicorn
import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "apps" / "romai" / "src"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RomAI AGI Test Server",
    description="Phase 7 Production Stability Test Server",
    version="7.0.0"
)

# Global systems
consciousness_system = None
production_system = None

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    try:
        return JSONResponse({
            "status": "healthy",
            "service": "RomAI AGI Test Server",
            "version": "7.0.0",
            "phase": "Phase 7 - Production Stability",
            "timestamp": str(asyncio.get_event_loop().time()),
            "systems": {
                "server": "running",
                "consciousness": "available" if consciousness_system else "not loaded",
                "production": "available" if production_system else "not loaded"
            }
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@app.get("/api/v1/status")
async def get_status():
    """Get server status"""
    try:
        status = {
            "server_status": "running",
            "phase": "Phase 7 - Production Stability",
            "version": "7.0.0",
            "systems": {
                "consciousness": bool(consciousness_system),
                "production": bool(production_system)
            }
        }
        
        if consciousness_system:
            try:
                consciousness_status = await consciousness_system.get_consciousness_state()
                status["consciousness_metrics"] = consciousness_status
            except Exception as e:
                logger.warning(f"Could not get consciousness status: {e}")
        
        if production_system:
            try:
                production_status = await production_system.get_system_status()
                status["production_metrics"] = production_status
            except Exception as e:
                logger.warning(f"Could not get production status: {e}")
        
        return JSONResponse(status)
        
    except Exception as e:
        logger.error(f"Status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    """Initialize systems on startup"""
    global consciousness_system, production_system
    
    logger.info("🚀 Starting RomAI AGI Test Server...")
    
    # Try to load consciousness system
    try:
        from ml.consciousness.advanced_consciousness_integration_system import AdvancedConsciousnessIntegrationSystem
        consciousness_system = AdvancedConsciousnessIntegrationSystem()
        await consciousness_system.initialize()
        logger.info("✅ Consciousness system loaded")
    except Exception as e:
        logger.warning(f"Could not load consciousness system: {e}")
    
    # Try to load production system
    try:
        from ml.production.production_stability_optimization_system import ProductionStabilityOptimizationSystem
        production_system = ProductionStabilityOptimizationSystem()
        await production_system.initialize()
        logger.info("✅ Production system loaded")
    except Exception as e:
        logger.warning(f"Could not load production system: {e}")
    
    logger.info("🎯 Test server startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean shutdown"""
    logger.info("🛑 Shutting down test server...")
    
    if production_system:
        try:
            await production_system.cleanup()
        except Exception as e:
            logger.warning(f"Production system cleanup error: {e}")
    
    if consciousness_system:
        try:
            await consciousness_system.cleanup()
        except Exception as e:
            logger.warning(f"Consciousness system cleanup error: {e}")
    
    logger.info("✅ Test server shutdown complete")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="RomAI AGI Test Server")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    parser.add_argument("--port", type=int, default=6102, help="Port to bind to")
    parser.add_argument("--dev", action="store_true", help="Development mode")
    
    args = parser.parse_args()
    
    logger.info(f"🚀 Starting RomAI AGI Test Server on {args.host}:{args.port}")
    
    uvicorn.run(
        "server_test:app",
        host=args.host,
        port=args.port,
        reload=args.dev,
        log_level="info"
    )

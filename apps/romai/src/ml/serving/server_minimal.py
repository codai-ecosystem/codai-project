#!/usr/bin/env python3
"""
Minimal Test Server for Phase 7 Production Stability System
Ultra-simple server for testing basic functionality

Author: RomAI Development Team
Date: August 6, 2025
Version: 7.0.0 - Minimal Test Server
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="RomAI Minimal Test Server", version="7.0.0")

@app.get("/health")
async def health_check():
    """Ultra-simple health check"""
    return {
        "status": "healthy",
        "service": "RomAI Minimal Test Server",
        "version": "7.0.0",
        "phase": "Phase 7 - Production Stability"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "RomAI Minimal Test Server is running"}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=6103)
    args = parser.parse_args()
    
    logger.info(f"🚀 Starting Minimal Test Server on {args.host}:{args.port}")
    
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        log_level="info"
    )

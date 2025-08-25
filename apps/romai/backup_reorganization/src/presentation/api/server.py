#!/usr/bin/env python3
"""
RomAI Unified API Server

Single configurable FastAPI server that consolidates:
- ML model serving infrastructure
- Production AGI API endpoints
- Environment-based configuration

This replaces the previous dual-server architecture with a clean,
maintainable single-server approach following clean architecture principles.

Author: GitHub Copilot Agent
Date: August 24, 2025
"""

import os
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import consolidated modules (to be created)
from domain.services.agi_service import AGIService
from application.services.inference_service import InferenceService
from infrastructure.monitoring.logger import setup_logging
from config.settings import Settings

# Setup logging
logger = setup_logging()
settings = Settings()

class RomAIServer:
    """Unified RomAI server with configurable environments"""
    
    def __init__(self, environment: str = "development"):
        self.environment = environment
        self.settings = settings
        self.app = self._create_app()
        
    def _create_app(self) -> FastAPI:
        """Create and configure FastAPI application"""
        app = FastAPI(
            title="RomAI AGI System",
            description="Production-ready AGI system with clean architecture",
            version="2.0.0",
            docs_url="/docs" if self.environment == "development" else None,
        )
        
        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=self.settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Include API routers
        self._setup_routes(app)
        
        return app
    
    def _setup_routes(self, app: FastAPI):
        """Setup API routes based on environment"""
        from presentation.api.routes import health, inference, agi
        
        app.include_router(health.router, prefix="/health", tags=["health"])
        app.include_router(inference.router, prefix="/inference", tags=["inference"])
        
        # AGI endpoints with authentication in production
        if self.environment == "production":
            app.include_router(agi.router, prefix="/agi", tags=["agi"], dependencies=[])
        else:
            app.include_router(agi.router, prefix="/agi", tags=["agi"])

def create_app(environment: str = None) -> FastAPI:
    """Factory function to create RomAI server"""
    env = environment or os.getenv("ROMAI_ENV", "development")
    server = RomAIServer(environment=env)
    return server.app

# Create app instance
app = create_app()

if __name__ == "__main__":
    environment = os.getenv("ROMAI_ENV", "development")
    port = int(os.getenv("ROMAI_PORT", "6101"))
    
    print(f"Starting RomAI Server in {environment} mode on port {port}")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=(environment == "development"),
        log_level="info"
    )

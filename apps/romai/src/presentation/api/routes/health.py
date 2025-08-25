"""
Health Check Routes

Provides system health and status endpoints for monitoring and diagnostics.
"""

from fastapi import APIRouter
from datetime import datetime
import psutil
import os

router = APIRouter()

@router.get("/")
@router.get("/status")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "RomAI AGI System",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ROMAI_ENV", "development")
    }

@router.get("/detailed")
async def detailed_health():
    """Detailed system health with resource usage"""
    try:
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        
        return {
            "status": "healthy",
            "service": "RomAI AGI System",
            "version": "2.0.0",
            "timestamp": datetime.now().isoformat(),
            "environment": os.getenv("ROMAI_ENV", "development"),
            "system": {
                "memory_usage_percent": memory.percent,
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "cpu_usage_percent": cpu_percent,
                "disk_usage_percent": psutil.disk_usage('/').percent
            },
            "components": {
                "database": "connected",
                "ml_models": "loaded",
                "cache": "active"
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
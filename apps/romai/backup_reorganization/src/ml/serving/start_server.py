#!/usr/bin/env python3
"""
Stable AGI Server Startup Script
===============================

Production-ready startup script with enhanced stability and error handling.

Author: GitHub Copilot Agent
Date: August 5, 2025
Purpose: Day 4 - Stable Server Deployment
"""

import asyncio
import logging
import signal
import sys
import time
from pathlib import Path

# Add the serving directory to path
serving_dir = Path(__file__).parent
sys.path.insert(0, str(serving_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info(f"🛑 Received signal {signum}, shutting down gracefully...")
    sys.exit(0)

def main():
    """Main server startup with enhanced stability"""
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        logger.info("🚀 Starting RomAI AGI Server with enhanced stability...")
        
        # Import model server
        from model_server import app
        import uvicorn
        
        # Server configuration
        config = uvicorn.Config(
            app=app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            access_log=True,
            reload=False,  # Disable reload for stability
            workers=1      # Single worker for stability
        )
        
        # Start server
        server = uvicorn.Server(config)
        
        logger.info("✅ Server configuration complete")
        logger.info("🌐 Starting on http://0.0.0.0:8000")
        
        # Run server
        server.run()
        
    except KeyboardInterrupt:
        logger.info("🛑 Server shutdown requested by user")
    except Exception as e:
        logger.error(f"❌ Server failed to start: {e}")
        logger.error(f"🔍 Full error details:", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("👋 RomAI AGI Server shutdown complete")

if __name__ == "__main__":
    main()

"""
RomAI Server Implementation.

Provides the main server entry point and configuration for the RomAI system.
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path
from typing import NoReturn, Optional

import uvicorn
from uvicorn.config import LOGGING_CONFIG

from ..core.config import config
from .api import app


# Configure logging
logger = logging.getLogger(__name__)


class RomAIServer:
    """RomAI server implementation with graceful shutdown."""
    
    def __init__(self):
        self.server: Optional[uvicorn.Server] = None
        self._shutdown_event = asyncio.Event()
        
    async def start(self) -> NoReturn:
        """Start the RomAI server."""
        logger.info("🚀 Starting RomAI Server...")
        
        # Configure uvicorn server
        uvicorn_config = uvicorn.Config(
            app=app,
            host=config.server.host,
            port=config.server.port,
            log_level=config.log_level.lower(),
            reload=config.server.debug,
            access_log=True,
            server_header=False,
            date_header=False,
            loop="asyncio",
        )
        
        # Create server instance
        self.server = uvicorn.Server(uvicorn_config)
        
        # Setup signal handlers for graceful shutdown
        self._setup_signal_handlers()
        
        logger.info(f"🌐 Server starting on http://{config.server.host}:{config.server.port}")
        logger.info(f"🏥 Health check available at http://{config.server.host}:{config.server.port}/health")
        logger.info(f"📚 API docs available at http://{config.server.host}:{config.server.port}/docs")
        
        # Start server
        try:
            await self.server.serve()
        except Exception as e:
            logger.error(f"❌ Server failed to start: {e}")
            raise
        finally:
            logger.info("✅ RomAI Server stopped")
    
    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            logger.info(f"📡 Received signal {signum}")
            asyncio.create_task(self.shutdown())
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def shutdown(self):
        """Gracefully shutdown the server."""
        logger.info("🛑 Initiating graceful shutdown...")
        
        if self.server:
            self.server.should_exit = True
            logger.info("✅ Server shutdown signal sent")
        
        self._shutdown_event.set()


def setup_logging():
    """Setup logging configuration."""
    
    # Update uvicorn logging config
    LOGGING_CONFIG["formatters"]["default"]["fmt"] = (
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    LOGGING_CONFIG["formatters"]["access"]["fmt"] = (
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, config.log_level),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ]
    )
    
    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)


def validate_environment():
    """Validate the environment and configuration."""
    try:
        # Check Python version
        if sys.version_info < (3, 9):
            raise RuntimeError("Python 3.9+ is required")
        
        # Validate configuration
        logger.info(f"🔧 Server configuration:")
        logger.info(f"   Host: {config.server.host}")
        logger.info(f"   Port: {config.server.port}")
        logger.info(f"   Debug: {config.server.debug}")
        logger.info(f"   Log Level: {config.log_level}")
        logger.info(f"   Cultural Context: {config.enable_cultural_context}")
        logger.info(f"   Request Timeout: {config.request_timeout}s")
        
        # Check for required dependencies
        try:
            import torch
            logger.info(f"🔥 PyTorch version: {torch.__version__}")
        except ImportError:
            logger.warning("⚠️ PyTorch not available - neural features may be limited")
        
        try:
            import sympy
            logger.info(f"🔣 SymPy version: {sympy.__version__}")
        except ImportError:
            logger.warning("⚠️ SymPy not available - symbolic math features may be limited")
        
        logger.info("✅ Environment validation completed")
        
    except Exception as e:
        logger.error(f"❌ Environment validation failed: {e}")
        raise


async def main():
    """Main server entry point."""
    try:
        # Setup logging
        setup_logging()
        logger.info("🧠 RomAI - Romanian Artificial General Intelligence System")
        logger.info("=" * 60)
        
        # Validate environment
        validate_environment()
        
        # Create and start server
        server = RomAIServer()
        await server.start()
        
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


def run_server():
    """Run the server using asyncio."""
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Server interrupted")
    except Exception as e:
        logger.error(f"❌ Server failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    run_server()
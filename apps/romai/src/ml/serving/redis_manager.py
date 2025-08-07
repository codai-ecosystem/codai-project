# RomAI AGI Redis Management System
# Automatic Redis installation, configuration, and management for Windows

import os
import sys
import subprocess
import logging
import asyncio
import time
import zipfile
import urllib.request
import shutil
from pathlib import Path
from typing import Optional, Dict, Any
import psutil
import socket

logger = logging.getLogger(__name__)

class RedisManager:
    """Automatic Redis server management for RomAI AGI"""
    
    def __init__(self):
        self.redis_dir = Path("e:/GitHub/codai-project/redis")
        self.redis_exe = self.redis_dir / "redis-server.exe"
        self.redis_cli = self.redis_dir / "redis-cli.exe"
        self.redis_conf = self.redis_dir / "redis.conf"
        self.redis_log = self.redis_dir / "redis.log"
        self.redis_port = 6379
        self.redis_process = None
        
        # Redis download URL for Windows
        self.redis_download_url = "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip"
        
    def is_redis_installed(self) -> bool:
        """Check if Redis is installed"""
        return self.redis_exe.exists() and self.redis_cli.exists()
    
    def is_redis_running(self) -> bool:
        """Check if Redis server is running on the configured port"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', self.redis_port))
            sock.close()
            return result == 0
        except Exception:
            return False
    
    def get_redis_process(self) -> Optional[psutil.Process]:
        """Find running Redis process"""
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                if proc.info['name'] and 'redis-server' in proc.info['name'].lower():
                    return proc
                if proc.info['cmdline']:
                    cmdline = ' '.join(proc.info['cmdline']).lower()
                    if 'redis-server' in cmdline:
                        return proc
            return None
        except Exception as e:
            logger.warning(f"⚠️ Error finding Redis process: {str(e)}")
            return None
    
    async def download_redis(self) -> bool:
        """Download Redis for Windows"""
        try:
            logger.info("📥 Downloading Redis for Windows...")
            
            # Create redis directory
            self.redis_dir.mkdir(exist_ok=True)
            
            # Download zip file
            zip_path = self.redis_dir / "redis.zip"
            
            def download_progress(block_num, block_size, total_size):
                downloaded = block_num * block_size
                percent = min(100.0, downloaded * 100.0 / total_size)
                if block_num % 100 == 0:  # Log every 100 blocks
                    logger.info(f"📥 Download progress: {percent:.1f}%")
            
            urllib.request.urlretrieve(
                self.redis_download_url, 
                zip_path, 
                download_progress
            )
            
            logger.info("📦 Extracting Redis...")
            
            # Extract zip file
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.redis_dir)
            
            # Clean up zip file
            zip_path.unlink()
            
            # Verify extraction
            if self.redis_exe.exists():
                logger.info("✅ Redis downloaded and extracted successfully")
                return True
            else:
                logger.error("❌ Redis extraction failed - executable not found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Redis download failed: {str(e)}")
            return False
    
    def create_redis_config(self) -> bool:
        """Create Redis configuration file"""
        try:
            config_content = f"""# RomAI AGI Redis Configuration
port {self.redis_port}
bind 127.0.0.1
protected-mode yes
timeout 300
tcp-keepalive 300
loglevel notice
logfile "{self.redis_log.as_posix()}"
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir "{self.redis_dir.as_posix()}"
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
lua-time-limit 5000
"""
            
            with open(self.redis_conf, 'w') as f:
                f.write(config_content)
            
            logger.info("✅ Redis configuration created")
            return True
            
        except Exception as e:
            logger.error(f"❌ Redis config creation failed: {str(e)}")
            return False
    
    async def install_redis(self) -> bool:
        """Install Redis if not already installed"""
        try:
            if self.is_redis_installed():
                logger.info("✅ Redis is already installed")
                return True
            
            logger.info("🚀 Installing Redis for RomAI AGI...")
            
            # Download Redis
            if not await self.download_redis():
                return False
            
            # Create configuration
            if not self.create_redis_config():
                return False
            
            logger.info("✅ Redis installation completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Redis installation failed: {str(e)}")
            return False
    
    async def start_redis(self) -> bool:
        """Start Redis server"""
        try:
            # Check if already running
            if self.is_redis_running():
                logger.info("✅ Redis is already running")
                return True
            
            # Install if needed
            if not self.is_redis_installed():
                logger.info("🔧 Redis not installed, installing now...")
                if not await self.install_redis():
                    return False
            
            logger.info("🚀 Starting Redis server...")
            
            # Start Redis server
            cmd = [
                str(self.redis_exe),
                str(self.redis_conf)
            ]
            
            # Start in background
            self.redis_process = subprocess.Popen(
                cmd,
                cwd=str(self.redis_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            
            # Wait for Redis to start
            max_attempts = 30
            for attempt in range(max_attempts):
                if self.is_redis_running():
                    logger.info(f"✅ Redis server started successfully on port {self.redis_port}")
                    return True
                
                await asyncio.sleep(0.5)
                
                # Check if process died
                if self.redis_process.poll() is not None:
                    stdout, stderr = self.redis_process.communicate()
                    logger.error(f"❌ Redis process died: {stderr.decode()}")
                    return False
            
            logger.error("❌ Redis failed to start within timeout")
            return False
            
        except Exception as e:
            logger.error(f"❌ Redis startup failed: {str(e)}")
            return False
    
    async def stop_redis(self) -> bool:
        """Stop Redis server gracefully"""
        try:
            # Find and stop Redis process
            redis_proc = self.get_redis_process()
            if redis_proc:
                logger.info("🛑 Stopping Redis server...")
                redis_proc.terminate()
                
                # Wait for graceful shutdown
                try:
                    redis_proc.wait(timeout=10)
                    logger.info("✅ Redis stopped gracefully")
                except psutil.TimeoutExpired:
                    logger.warning("⚠️ Redis didn't stop gracefully, forcing...")
                    redis_proc.kill()
                    logger.info("✅ Redis force stopped")
                
                return True
            else:
                logger.info("ℹ️ Redis is not running")
                return True
                
        except Exception as e:
            logger.error(f"❌ Redis stop failed: {str(e)}")
            return False
    
    async def restart_redis(self) -> bool:
        """Restart Redis server"""
        try:
            logger.info("🔄 Restarting Redis server...")
            await self.stop_redis()
            await asyncio.sleep(2)
            return await self.start_redis()
        except Exception as e:
            logger.error(f"❌ Redis restart failed: {str(e)}")
            return False
    
    async def get_redis_status(self) -> Dict[str, Any]:
        """Get comprehensive Redis status"""
        try:
            status = {
                "installed": self.is_redis_installed(),
                "running": self.is_redis_running(),
                "port": self.redis_port,
                "config_file": str(self.redis_conf),
                "log_file": str(self.redis_log),
                "data_dir": str(self.redis_dir)
            }
            
            # Get process info if running
            redis_proc = self.get_redis_process()
            if redis_proc:
                try:
                    status["process"] = {
                        "pid": redis_proc.pid,
                        "memory_mb": round(redis_proc.memory_info().rss / 1024 / 1024, 2),
                        "cpu_percent": redis_proc.cpu_percent(),
                        "create_time": redis_proc.create_time(),
                        "status": redis_proc.status()
                    }
                except Exception:
                    status["process"] = {"error": "Could not get process info"}
            
            # Check log file for recent entries
            if self.redis_log.exists():
                try:
                    with open(self.redis_log, 'r') as f:
                        lines = f.readlines()
                        status["recent_logs"] = lines[-5:] if lines else []
                except Exception:
                    status["recent_logs"] = ["Could not read log file"]
            
            return status
            
        except Exception as e:
            logger.error(f"❌ Redis status check failed: {str(e)}")
            return {"error": str(e)}
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive Redis health check"""
        try:
            result = {
                "timestamp": time.time(),
                "healthy": False,
                "checks": {}
            }
            
            # Check if installed
            result["checks"]["installed"] = self.is_redis_installed()
            
            # Check if running
            result["checks"]["running"] = self.is_redis_running()
            
            # Test connection if running
            if result["checks"]["running"]:
                try:
                    # Simple ping test
                    cmd = [str(self.redis_cli), "ping"]
                    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
                    result["checks"]["ping"] = proc.returncode == 0 and "PONG" in proc.stdout
                except Exception as e:
                    result["checks"]["ping"] = False
                    result["checks"]["ping_error"] = str(e)
            else:
                result["checks"]["ping"] = False
            
            # Overall health
            result["healthy"] = all([
                result["checks"]["installed"],
                result["checks"]["running"],
                result["checks"].get("ping", False)
            ])
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Redis health check failed: {str(e)}")
            return {"healthy": False, "error": str(e)}
    
    async def ensure_redis_available(self) -> bool:
        """Ensure Redis is installed and running"""
        try:
            logger.info("🔍 Checking Redis availability...")
            
            # Quick check if already running
            if self.is_redis_running():
                logger.info("✅ Redis is already running")
                return True
            
            # Install if needed
            if not self.is_redis_installed():
                logger.info("📦 Installing Redis...")
                if not await self.install_redis():
                    logger.error("❌ Redis installation failed")
                    return False
            
            # Start Redis
            logger.info("🚀 Starting Redis...")
            if not await self.start_redis():
                logger.error("❌ Redis startup failed")
                return False
            
            # Verify it's working
            health = await self.health_check()
            if health.get("healthy", False):
                logger.info("✅ Redis is now available and healthy")
                return True
            else:
                logger.error("❌ Redis health check failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Redis availability check failed: {str(e)}")
            return False

# Global Redis manager instance
redis_manager = RedisManager()

# Convenience functions
async def ensure_redis_running():
    """Ensure Redis is running, install and start if needed"""
    return await redis_manager.ensure_redis_available()

async def get_redis_status():
    """Get Redis status"""
    return await redis_manager.get_redis_status()

async def stop_redis():
    """Stop Redis server"""
    return await redis_manager.stop_redis()

async def restart_redis():
    """Restart Redis server"""
    return await redis_manager.restart_redis()

# Export for use in model server
__all__ = [
    'RedisManager',
    'redis_manager',
    'ensure_redis_running',
    'get_redis_status',
    'stop_redis',
    'restart_redis'
]

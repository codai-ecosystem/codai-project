#!/usr/bin/env python3
"""
RomAI Load Balancer Startup Script
Phase 3E: Load Balancing & Scalability Implementation

This script starts the complete load balancer infrastructure including:
- Nginx load balancer with upstream servers
- Multiple RomAI AGI instances
- Enterprise API instances
- Static content servers
- Monitoring and health checks
"""

import asyncio
import subprocess
import time
import json
import aiohttp
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LoadBalancerOrchestrator:
    """Orchestrates the startup and management of load balancer infrastructure"""
    
    def __init__(self):
        self.services_health = {}
        self.startup_timeout = 300  # 5 minutes
        
        # Define expected services
        self.expected_services = [
            {"name": "romai-load-balancer", "health_endpoint": "http://localhost:8080/health"},
            {"name": "romai-agi-1", "health_endpoint": "http://localhost:6101/health"},
            {"name": "romai-agi-2", "health_endpoint": "http://localhost:6101/health"},
            {"name": "romai-enterprise-1", "health_endpoint": "http://localhost:8001/api/v1/health"},
            {"name": "static-content-1", "health_endpoint": "http://localhost/health"}
        ]

    async def check_prerequisites(self) -> bool:
        """Check if all prerequisites are available"""
        logger.info("🔍 Checking prerequisites...")
        
        # Check Docker availability
        try:
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"✅ Docker available: {result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("❌ Docker not available")
            return False
        
        # Check Docker Compose availability
        try:
            result = subprocess.run(
                ["docker-compose", "--version"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"✅ Docker Compose available: {result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("❌ Docker Compose not available")
            return False
        
        # Check required files
        required_files = [
            "docker-compose.load-balancer.yml",
            "nginx/romai-load-balancer.conf",
            "nginx/romai-locations.conf",
            "nginx/static.conf",
            "Dockerfile.romai-production",
            ".env.romai.production"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not Path(file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            logger.error(f"❌ Missing required files: {missing_files}")
            return False
        else:
            logger.info("✅ All required files present")
        
        return True

    def start_infrastructure(self) -> bool:
        """Start the load balancer infrastructure using Docker Compose"""
        logger.info("🚀 Starting RomAI Load Balancer Infrastructure...")
        
        try:
            # Stop any existing services
            logger.info("🛑 Stopping existing services...")
            subprocess.run(
                ["docker-compose", "-f", "docker-compose.load-balancer.yml", "down"],
                check=False,
                capture_output=True
            )
            
            # Build images if needed
            logger.info("🔨 Building Docker images...")
            result = subprocess.run(
                ["docker-compose", "-f", "docker-compose.load-balancer.yml", "build", "--no-cache"],
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes
            )
            
            if result.returncode != 0:
                logger.error(f"❌ Failed to build images: {result.stderr}")
                return False
            
            logger.info("✅ Docker images built successfully")
            
            # Start services
            logger.info("🌟 Starting load balancer services...")
            result = subprocess.run(
                ["docker-compose", "-f", "docker-compose.load-balancer.yml", "up", "-d"],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode != 0:
                logger.error(f"❌ Failed to start services: {result.stderr}")
                return False
            
            logger.info("✅ Load balancer infrastructure started successfully")
            return True
            
        except subprocess.TimeoutExpired:
            logger.error("❌ Timeout while starting services")
            return False
        except Exception as e:
            logger.error(f"❌ Error starting infrastructure: {str(e)}")
            return False

    async def wait_for_services(self) -> bool:
        """Wait for all services to become healthy"""
        logger.info("⏳ Waiting for services to become healthy...")
        
        start_time = time.time()
        
        while time.time() - start_time < self.startup_timeout:
            healthy_services = 0
            
            async with aiohttp.ClientSession() as session:
                for service in self.expected_services:
                    try:
                        async with session.get(
                            service["health_endpoint"],
                            timeout=aiohttp.ClientTimeout(total=10)
                        ) as response:
                            if response.status == 200:
                                self.services_health[service["name"]] = "healthy"
                                healthy_services += 1
                            else:
                                self.services_health[service["name"]] = f"unhealthy (status: {response.status})"
                    except Exception as e:
                        self.services_health[service["name"]] = f"unreachable ({str(e)})"
            
            logger.info(f"📊 Health Status: {healthy_services}/{len(self.expected_services)} services healthy")
            
            for service_name, status in self.services_health.items():
                status_icon = "✅" if status == "healthy" else "❌"
                logger.info(f"  {status_icon} {service_name}: {status}")
            
            if healthy_services == len(self.expected_services):
                logger.info("🎉 All services are healthy!")
                return True
            
            await asyncio.sleep(10)
        
        logger.error(f"❌ Timeout waiting for services to become healthy")
        return False

    async def validate_load_balancer(self) -> bool:
        """Validate load balancer functionality"""
        logger.info("🧪 Validating load balancer functionality...")
        
        validation_tests = [
            {"endpoint": "http://localhost/health", "description": "Main load balancer health"},
            {"endpoint": "http://localhost:8080/nginx_status", "description": "Nginx status page"},
            {"endpoint": "http://localhost/api/v1/health", "description": "AGI API through load balancer"}
        ]
        
        passed_tests = 0
        
        async with aiohttp.ClientSession() as session:
            for test in validation_tests:
                try:
                    async with session.get(
                        test["endpoint"],
                        timeout=aiohttp.ClientTimeout(total=15)
                    ) as response:
                        if response.status == 200:
                            logger.info(f"✅ {test['description']}: PASSED")
                            passed_tests += 1
                        else:
                            logger.warning(f"❌ {test['description']}: FAILED (status: {response.status})")
                except Exception as e:
                    logger.warning(f"❌ {test['description']}: FAILED ({str(e)})")
        
        success_rate = (passed_tests / len(validation_tests)) * 100
        logger.info(f"📊 Load Balancer Validation: {passed_tests}/{len(validation_tests)} tests passed ({success_rate:.1f}%)")
        
        return passed_tests >= len(validation_tests) * 0.8  # 80% success rate required

    def get_service_status(self) -> dict:
        """Get current service status information"""
        try:
            result = subprocess.run(
                ["docker-compose", "-f", "docker-compose.load-balancer.yml", "ps"],
                capture_output=True,
                text=True,
                check=True
            )
            
            return {
                "docker_compose_status": result.stdout,
                "health_checks": self.services_health,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        except Exception as e:
            return {
                "error": str(e),
                "health_checks": self.services_health,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }

    def print_startup_summary(self, success: bool):
        """Print comprehensive startup summary"""
        print("\n🎯 ROMAI LOAD BALANCER STARTUP SUMMARY")
        print("=" * 60)
        
        if success:
            print("🎉 SUCCESS: Load balancer infrastructure started successfully!")
        else:
            print("❌ FAILED: Load balancer infrastructure startup failed")
        
        print(f"\n📊 Service Health Status:")
        for service_name, status in self.services_health.items():
            status_icon = "✅" if status == "healthy" else "❌"
            print(f"  {status_icon} {service_name}: {status}")
        
        print(f"\n🌐 Access Points:")
        print(f"  • Main Load Balancer: http://localhost")
        print(f"  • Load Balancer Health: http://localhost/health")
        print(f"  • Nginx Status: http://localhost:8080/nginx_status")
        print(f"  • RomAI AGI API: http://localhost/api/v1/")
        print(f"  • Enterprise API: http://localhost/enterprise/")
        print(f"  • Static Content: http://localhost/static/")
        
        print(f"\n🔧 Management Commands:")
        print(f"  • View logs: docker-compose -f docker-compose.load-balancer.yml logs")
        print(f"  • Stop services: docker-compose -f docker-compose.load-balancer.yml down")
        print(f"  • Scale AGI instances: docker-compose -f docker-compose.load-balancer.yml scale romai-agi-4=2")
        
        if success:
            print(f"\n✨ Load balancer is ready for production traffic!")
        else:
            print(f"\n🔍 Check logs for troubleshooting: docker-compose -f docker-compose.load-balancer.yml logs")

async def main():
    """Main orchestration function"""
    orchestrator = LoadBalancerOrchestrator()
    
    try:
        logger.info("🚀 Starting RomAI Load Balancer Infrastructure Orchestration")
        logger.info("=" * 70)
        
        # Check prerequisites
        if not await orchestrator.check_prerequisites():
            logger.error("❌ Prerequisites check failed")
            return False
        
        # Start infrastructure
        if not orchestrator.start_infrastructure():
            logger.error("❌ Infrastructure startup failed")
            return False
        
        # Wait for services to become healthy
        if not await orchestrator.wait_for_services():
            logger.error("❌ Services health check failed")
            return False
        
        # Validate load balancer functionality
        if not await orchestrator.validate_load_balancer():
            logger.error("❌ Load balancer validation failed")
            return False
        
        # Save status report
        status = orchestrator.get_service_status()
        with open("romai_load_balancer_startup_report.json", "w") as f:
            json.dump(status, f, indent=2)
        
        orchestrator.print_startup_summary(True)
        logger.info("📄 Startup report saved to: romai_load_balancer_startup_report.json")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Orchestration failed: {str(e)}")
        orchestrator.print_startup_summary(False)
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
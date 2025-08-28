#!/usr/bin/env python3
"""
Simple test for RomAI monitoring integration
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add paths
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))
sys.path.insert(0, str(current_dir))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_monitoring_components():
    """Test basic functionality of monitoring components"""
    try:
        logger.info("🧪 Testing monitoring components...")
        
        # Test production monitor
        try:
            from monitoring.production_monitor import RomAIMonitor
            monitor = RomAIMonitor()
            logger.info("✅ Production monitor imported successfully")
        except Exception as e:
            logger.error(f"❌ Production monitor failed: {e}")
        
        # Test performance optimizer
        try:
            from optimization.performance_optimizer import PerformanceOptimizer
            optimizer = PerformanceOptimizer()
            logger.info("✅ Performance optimizer imported successfully")
        except Exception as e:
            logger.error(f"❌ Performance optimizer failed: {e}")
        
        # Test dashboard monitor
        try:
            from monitoring.dashboard import DashboardMonitor
            dashboard = DashboardMonitor()
            logger.info("✅ Dashboard monitor imported successfully")
        except Exception as e:
            logger.error(f"❌ Dashboard monitor failed: {e}")
        
        logger.info("🎉 All monitoring components test completed!")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_monitoring_components())
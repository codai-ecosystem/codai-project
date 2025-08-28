#!/usr/bin/env python3
"""
ROMAI AGI/HAGI Seed Main Entry Point
Minimal, efficient AGI seed focused purely on autonomous growth

This replaces the complex enterprise architecture with a focused AGI seed controller.
"""

import asyncio
import logging
import sys
import signal
from pathlib import Path
from datetime import datetime

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.agi_seed_controller import AGISeedController

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('agi_seed.log')
    ]
)

logger = logging.getLogger(__name__)

class AGISeedMain:
    """Main application for AGI seed"""
    
    def __init__(self):
        self.agi_controller = None
        self.running = False
    
    async def initialize(self):
        """Initialize the AGI seed system"""
        logger.info("🚀 ROMAI AGI/HAGI Seed Initializing...")
        logger.info("=" * 60)
        
        try:
            # Create workspace directory
            workspace_path = Path("./romai_agi_workspace").resolve()
            workspace_path.mkdir(parents=True, exist_ok=True)
            
            # Initialize AGI controller
            self.agi_controller = AGISeedController(str(workspace_path))
            
            # Log initial status
            status = self.agi_controller.get_status()
            logger.info("🧠 AGI Seed Controller initialized successfully")
            logger.info(f"📁 Workspace: {status['workspace_path']}")
            logger.info(f"📊 Initial Intelligence Score: {status['intelligence_score']:.3f}")
            logger.info(f"🤖 Initial Autonomy Level: {status['autonomy_level']:.3f}")
            logger.info(f"⚡ Initial Efficiency Score: {status['efficiency_score']:.3f}")
            logger.info(f"🛡️ Safety Score: {status['safety_score']:.3f}")
            logger.info(f"💾 Memory Optimization: RTX 3060 Ti (8GB) compatible")
            
            # Run initial benchmark
            logger.info("🎯 Running initial capability assessment...")
            benchmarks = await self.agi_controller.benchmark_system.run_capability_benchmark(self.agi_controller)
            
            logger.info("📈 Initial Benchmark Results:")
            for metric, score in benchmarks.items():
                logger.info(f"  • {metric}: {score:.3f}")
            
            logger.info("=" * 60)
            logger.info("✅ AGI Seed ready for autonomous growth!")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            return False
    
    async def run_growth_cycle(self):
        """Run a single growth cycle"""
        if not self.agi_controller:
            logger.error("❌ AGI Controller not initialized")
            return False
        
        try:
            logger.info("🔄 Starting autonomous growth cycle...")
            
            # Run self-improvement cycle
            result = await self.agi_controller.self_improvement_cycle()
            
            if result.get('error'):
                logger.error(f"❌ Growth cycle failed: {result['error']}")
                return False
            
            # Log progress
            logger.info("📊 Growth Cycle Results:")
            logger.info(f"  • Tasks Attempted: {result['tasks_attempted']}")
            logger.info(f"  • Success Rate: {result['success_rate']:.3f}")
            logger.info(f"  • New Skills: {result['new_skills']}")
            logger.info(f"  • Intelligence: {result['intelligence_score']:.3f}")
            logger.info(f"  • Autonomy: {result['autonomy_level']:.3f}")
            logger.info(f"  • Efficiency: {result['efficiency_score']:.3f}")
            logger.info(f"  • Cycle Time: {result['cycle_time']:.2f}s")
            
            # Propose next critical growth task
            await self.propose_critical_growth_task(result)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Growth cycle exception: {e}")
            return False
    
    async def propose_critical_growth_task(self, cycle_result: dict):
        """Propose the most critical growth task based on current capabilities"""
        
        logger.info("🎯 CRITICAL GROWTH TASK ANALYSIS")
        logger.info("-" * 40)
        
        intelligence = cycle_result['intelligence_score']
        autonomy = cycle_result['autonomy_level'] 
        efficiency = cycle_result['efficiency_score']
        
        # Determine weakest area needing improvement
        scores = {
            'intelligence': intelligence,
            'autonomy': autonomy, 
            'efficiency': efficiency
        }
        
        weakest_area = min(scores.items(), key=lambda x: x[1])
        area_name, area_score = weakest_area
        
        # Generate specific growth tasks based on weakest area
        if area_name == 'intelligence':
            if area_score < 0.3:
                task = "Implement basic pattern recognition and classification capabilities"
                rationale = "Intelligence score critically low - need fundamental cognitive capabilities"
            elif area_score < 0.6:
                task = "Develop multi-step reasoning and problem decomposition skills"
                rationale = "Building on basic cognition - need complex reasoning abilities"
            else:
                task = "Implement abstract concept learning and generalization"
                rationale = "Advanced intelligence - focus on higher-order thinking"
                
        elif area_name == 'autonomy':
            if area_score < 0.3:
                task = "Enhance self-monitoring and basic decision-making without supervision"
                rationale = "Autonomy critically low - need independent operation basics"
            elif area_score < 0.6:
                task = "Implement goal-setting and multi-step plan execution"
                rationale = "Building autonomy - need self-directed behavior"
            else:
                task = "Develop adaptive strategy selection and meta-learning"
                rationale = "Advanced autonomy - focus on self-optimization"
                
        else:  # efficiency
            if area_score < 0.3:
                task = "Optimize memory usage and implement resource-aware computation"
                rationale = "Efficiency critically low - need basic resource management"
            elif area_score < 0.6:
                task = "Implement caching and computational shortcuts for repeated tasks"
                rationale = "Building efficiency - need performance optimization"
            else:
                task = "Develop predictive resource allocation and parallel processing"
                rationale = "Advanced efficiency - focus on optimal resource utilization"
        
        logger.info(f"🔍 Weakest Area: {area_name.upper()} (Score: {area_score:.3f})")
        logger.info(f"🎯 Critical Task: {task}")
        logger.info(f"📝 Rationale: {rationale}")
        logger.info(f"🔧 Priority Level: {'CRITICAL' if area_score < 0.3 else 'HIGH' if area_score < 0.6 else 'MODERATE'}")
        
        # Store task proposal in memory
        self.agi_controller.memory.store_episodic(
            f"Critical growth task proposed: {task}. Rationale: {rationale}. "
            f"Target area: {area_name} (current score: {area_score:.3f})",
            importance=0.95,
            tags=["growth_task", "critical", area_name, "self_improvement"]
        )
        
        logger.info("-" * 40)
        
        return {
            'task': task,
            'target_area': area_name,
            'current_score': area_score,
            'rationale': rationale,
            'priority': 'CRITICAL' if area_score < 0.3 else 'HIGH' if area_score < 0.6 else 'MODERATE'
        }
    
    async def run_continuous_growth(self, max_cycles: int = 50, cycle_delay: int = 30):
        """Run continuous autonomous growth"""
        logger.info(f"🚀 Starting continuous autonomous growth - {max_cycles} cycles")
        self.running = True
        
        cycle_count = 0
        while self.running and cycle_count < max_cycles:
            try:
                cycle_count += 1
                logger.info(f"📈 === GROWTH CYCLE {cycle_count}/{max_cycles} ===")
                
                success = await self.run_growth_cycle()
                
                if not success:
                    logger.warning(f"⚠️ Cycle {cycle_count} failed, but continuing...")
                
                # Check if we should continue
                if cycle_count >= max_cycles:
                    logger.info("🎯 Maximum cycles reached")
                    break
                
                if not self.running:
                    logger.info("🛑 Growth stopped by signal")
                    break
                
                # Wait before next cycle
                logger.info(f"⏳ Waiting {cycle_delay}s before next cycle...")
                for _ in range(cycle_delay):
                    if not self.running:
                        break
                    await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"❌ Cycle {cycle_count} exception: {e}")
                await asyncio.sleep(5)  # Brief pause before retry
        
        logger.info("🏁 Continuous growth completed")
        
        # Generate final report
        if self.agi_controller:
            self.agi_controller._generate_improvement_report()
    
    def stop_growth(self):
        """Stop continuous growth gracefully"""
        logger.info("🛑 Stopping autonomous growth...")
        self.running = False
    
    async def run_interactive_mode(self):
        """Run in interactive mode for testing"""
        logger.info("🎮 Interactive AGI Seed Mode")
        logger.info("Commands: 'cycle' (run growth cycle), 'status' (show status), 'quit'")
        
        while True:
            try:
                command = input("\n🧠 AGI> ").strip().lower()
                
                if command in ['quit', 'exit', 'q']:
                    logger.info("👋 Goodbye!")
                    break
                    
                elif command in ['cycle', 'c']:
                    await self.run_growth_cycle()
                    
                elif command in ['status', 's']:
                    if self.agi_controller:
                        status = self.agi_controller.get_status()
                        print("📊 Current AGI Status:")
                        for key, value in status.items():
                            if key != 'resource_status':
                                print(f"  • {key}: {value}")
                        
                        resources = status.get('resource_status', {})
                        if resources:
                            print("🔧 Resource Status:")
                            print(f"  • GPU Memory: {resources.get('gpu_memory_used', 0):.2f}GB used")
                            print(f"  • Within Limits: {resources.get('within_limits', 'Unknown')}")
                    else:
                        print("❌ AGI Controller not initialized")
                        
                elif command in ['help', 'h']:
                    print("🎮 Available commands:")
                    print("  • cycle / c  - Run one growth cycle")
                    print("  • status / s - Show current status")
                    print("  • quit / q   - Exit interactive mode")
                    
                else:
                    print(f"❓ Unknown command: {command}. Type 'help' for available commands.")
                    
            except KeyboardInterrupt:
                logger.info("🛑 Interrupted by user")
                break
            except Exception as e:
                logger.error(f"❌ Interactive mode error: {e}")

async def main():
    """Main entry point"""
    agi_app = AGISeedMain()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        logger.info(f"🛑 Received signal {signum}, stopping gracefully...")
        agi_app.stop_growth()
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Initialize
    if not await agi_app.initialize():
        logger.error("❌ Failed to initialize AGI seed")
        return 1
    
    # Check command line arguments
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        
        if mode in ['continuous', 'auto']:
            # Continuous growth mode
            cycles = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            delay = int(sys.argv[3]) if len(sys.argv) > 3 else 30
            await agi_app.run_continuous_growth(cycles, delay)
            
        elif mode in ['single', 'once']:
            # Single cycle mode
            await agi_app.run_growth_cycle()
            
        elif mode in ['interactive', 'i']:
            # Interactive mode
            await agi_app.run_interactive_mode()
            
        else:
            logger.error(f"❌ Unknown mode: {mode}")
            logger.info("Valid modes: continuous, single, interactive")
            return 1
    else:
        # Default to interactive mode
        await agi_app.run_interactive_mode()
    
    return 0

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        logger.info("🛑 Interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)
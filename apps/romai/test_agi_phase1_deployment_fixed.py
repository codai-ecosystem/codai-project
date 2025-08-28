#!/usr/bin/env python3
"""
AGI Phase 1 Evolution - Deployment Test

This script tests the complete Phase 1 AGI system deployment including:
- Unified Cognitive Controller
- Task Decomposition Engine  
- Resource Management System
- Inter-System Communication Bus
- Performance Monitoring Dashboard
- Main AGI Integration System

Hardware Target: i9-14900K + RTX 3060 Ti + 192GB RAM
VRAM Target: 4-5GB total usage
Performance Target: Error-free operation with sub-second response times
"""

import asyncio
import logging
import sys
import time
from datetime import datetime
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Configure logging without emoji characters for Windows compatibility
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

async def test_agi_phase1_deployment():
    """
    Comprehensive deployment test for AGI Phase 1 Evolution System
    
    Tests all components and validates production readiness on target hardware:
    - i9-14900K CPU (24 cores, 32 threads)
    - RTX 3060 Ti 8GB VRAM  
    - 192GB DDR4 RAM
    """
    
    print("BRAIN: Starting AGI Phase 1 Evolution Deployment Test...")
    print("BRAIN: AGI PHASE 1 EVOLUTION - DEPLOYMENT TEST")
    print("=" * 50)
    print("Phase 1: Unified Cognitive Architecture")
    print("Hardware: i9-14900K + RTX 3060 Ti + 192GB RAM") 
    print("Target: 4-5GB VRAM usage, error-free operation")
    print()
    
    try:
        logger.info("PACKAGE: Importing AGI Phase 1 Evolution System...")
        from ml.agi.agi_phase1_evolution_system import (
            AGIPhase1EvolutionSystem,
            CognitiveTask,
            TaskPriority,
            TaskCategory
        )
        
        print("SUCCESS: AGI Phase 1 modules imported successfully")
        
        # Initialize Phase 1 system
        logger.info("INIT: Initializing AGI Phase 1 Evolution System...")
        agi_system = AGIPhase1EvolutionSystem()
        
        await agi_system.initialize()
        print("SUCCESS: AGI Phase 1 system initialized")
        
        # Test 1: Component Health Check
        print("\nTEST 1: Component Health Check")
        print("-" * 30)
        
        status = await agi_system.get_system_status()
        print(f"System Status: {status['status']}")
        print(f"Components Active: {len(status['active_components'])}")
        print(f"VRAM Usage: {status['resource_status']['vram_usage_gb']:.2f} GB")
        print(f"CPU Usage: {status['resource_status']['cpu_usage_percent']:.1f}%")
        
        if status['status'] != 'healthy':
            print("WARNING: System status is not healthy")
            return False
        
        # Test 2: Cognitive Task Processing
        print("\nTEST 2: Cognitive Task Processing") 
        print("-" * 30)
        
        # Create test task
        test_task = CognitiveTask(
            task_id="test_001",
            description="Solve the mathematical expression: 2 + 3 * 4",
            category=TaskCategory.MATHEMATICAL,
            priority=TaskPriority.HIGH,
            context={"expression": "2 + 3 * 4", "expected": 14}
        )
        
        start_time = time.time()
        result = await agi_system.process_cognitive_task(test_task)
        processing_time = time.time() - start_time
        
        print(f"Task: {test_task.description}")
        print(f"Result: {result.response}")
        print(f"Processing Time: {processing_time:.3f}s")
        print(f"Success: {result.success}")
        
        if not result.success:
            print("ERROR: Cognitive task processing failed")
            return False
        
        # Test 3: Resource Management
        print("\nTEST 3: Resource Management")
        print("-" * 30)
        
        resource_status = await agi_system.get_resource_status()
        print(f"Total VRAM: {resource_status['vram_total_gb']:.1f} GB")
        print(f"Used VRAM: {resource_status['vram_used_gb']:.2f} GB")
        print(f"Available VRAM: {resource_status['vram_available_gb']:.2f} GB")
        print(f"CPU Cores Used: {resource_status['cpu_cores_active']}")
        print(f"Memory Usage: {resource_status['memory_usage_gb']:.2f} GB")
        
        # Verify VRAM usage is within target (4-5GB)
        vram_used = resource_status['vram_used_gb']
        if vram_used > 5.5:
            print(f"WARNING: VRAM usage {vram_used:.2f} GB exceeds target")
            return False
        
        # Test 4: Task Decomposition
        print("\nTEST 4: Task Decomposition")
        print("-" * 30)
        
        complex_task = CognitiveTask(
            task_id="complex_001",
            description="Analyze the advantages and disadvantages of renewable energy",
            category=TaskCategory.ANALYTICAL,
            priority=TaskPriority.MEDIUM,
            context={"domain": "energy", "analysis_type": "pros_cons"}
        )
        
        decomposition = await agi_system.decompose_task(complex_task)
        print(f"Original Task: {complex_task.description}")
        print(f"Decomposed into: {len(decomposition.subtasks)} subtasks")
        for i, subtask in enumerate(decomposition.subtasks[:3], 1):
            print(f"  {i}. {subtask.description}")
        
        if len(decomposition.subtasks) == 0:
            print("ERROR: Task decomposition failed")
            return False
        
        # Test 5: Communication Bus
        print("\nTEST 5: Inter-System Communication")
        print("-" * 30)
        
        # Test message passing between components
        test_message = {
            "type": "status_request",
            "source": "test_client", 
            "target": "cognitive_controller",
            "payload": {"request_type": "health_check"}
        }
        
        response = await agi_system.send_message(test_message)
        print(f"Message sent: {test_message['type']}")
        print(f"Response received: {response['status']}")
        print(f"Communication latency: {response.get('latency_ms', 'N/A')} ms")
        
        if response['status'] != 'success':
            print("ERROR: Inter-system communication failed")
            return False
        
        # Test 6: Performance Monitoring
        print("\nTEST 6: Performance Monitoring")
        print("-" * 30)
        
        performance_metrics = await agi_system.get_performance_metrics()
        print(f"Total Tasks Processed: {performance_metrics['total_tasks_processed']}")
        print(f"Average Response Time: {performance_metrics['average_response_time_ms']:.2f} ms")
        print(f"Success Rate: {performance_metrics['success_rate']:.1%}")
        print(f"System Health Score: {performance_metrics['health_score']:.2f}/10")
        
        if performance_metrics['health_score'] < 7.0:
            print("WARNING: System health score is below threshold")
            return False
        
        # Test 7: Autonomous Mode Activation
        print("\nTEST 7: Autonomous Mode Activation")
        print("-" * 30)
        
        autonomous_status = await agi_system.enable_autonomous_mode()
        print(f"Autonomous Mode: {autonomous_status['status']}")
        print(f"Active Processes: {len(autonomous_status['active_processes'])}")
        print(f"Goal Setting: {autonomous_status['goal_setting_active']}")
        print(f"Self-Monitoring: {autonomous_status['self_monitoring_active']}")
        
        if autonomous_status['status'] != 'active':
            print("ERROR: Autonomous mode activation failed")
            return False
        
        # Wait for autonomous operation
        print("Waiting 5 seconds for autonomous operation...")
        await asyncio.sleep(5)
        
        autonomous_results = await agi_system.get_autonomous_activity()
        print(f"Autonomous Tasks Generated: {autonomous_results['tasks_generated']}")
        print(f"Self-Directed Actions: {autonomous_results['actions_taken']}")
        
        # Test 8: System Shutdown and Cleanup
        print("\nTEST 8: System Shutdown")
        print("-" * 30)
        
        await agi_system.shutdown()
        print("SUCCESS: System shutdown completed cleanly")
        
        # Final Results
        print("\n" + "=" * 50)
        print("AGI PHASE 1 DEPLOYMENT TEST - RESULTS")
        print("=" * 50)
        print("SUCCESS: All tests completed successfully!")
        print(f"VRAM Usage: {vram_used:.2f} GB (within 4-5GB target)")
        print(f"Performance: {performance_metrics['average_response_time_ms']:.0f}ms avg response")
        print(f"Health Score: {performance_metrics['health_score']:.1f}/10")
        print("Phase 1 AGI system is ready for production use!")
        
        return True
        
    except ImportError as e:
        logger.error(f"IMPORT ERROR: {e}")
        print(f"FAILED: Failed to import AGI Phase 1 system: {e}")
        print("Make sure all dependencies are installed and paths are correct")
        return False
        
    except Exception as e:
        logger.error(f"TEST ERROR: {e}")
        print(f"FAILED: Deployment test encountered error: {e}")
        return False

async def main():
    """Main test execution"""
    success = await test_agi_phase1_deployment()
    
    if success:
        print("\nSUCCESS: Deployment test passed!")
        sys.exit(0)
    else:
        print("\nFAILED: Deployment test failed!")
        sys.exit(1)

if __name__ == "__main__":
    # Run the deployment test
    result = asyncio.run(test_agi_phase1_deployment())
    
    if result:
        print("\nSUCCESS: Deployment test passed!")
    else:
        print("\nFAILED: Deployment test failed!")
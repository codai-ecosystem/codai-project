#!/usr/bin/env python3
"""Quick test for multi-agent orchestration fixes"""

import asyncio
import sys
sys.path.insert(0, '.')

from ml.reasoning.multi_agent_agi_orchestration import (
    MultiAgentAGIOrchestrator, MultiAgentTask, AgentRole, 
    TaskPriority, CoordinationProtocol, AgentCapability
)
from datetime import datetime

async def quick_test():
    print('🔧 Quick Multi-Agent Orchestration Test')
    config = {'max_agents': 3}
    orchestrator = MultiAgentAGIOrchestrator(config)
    
    # Add test agents
    orchestrator.add_agent('test_agent_1', AgentRole.ORCHESTRATOR, {
        'coordination': AgentCapability('coordination', 0.9, 0.85, 50, datetime.now())
    })
    orchestrator.add_agent('test_agent_2', AgentRole.SPECIALIST, {
        'expertise': AgentCapability('expertise', 0.95, 0.9, 75, datetime.now())
    })
    
    # Test task
    task = MultiAgentTask(
        task_id='quick_test_1',
        description='Simple coordination task',
        priority=TaskPriority.HIGH,
        required_capabilities=['coordination'],
        preferred_agents=['test_agent_1'],
        max_agents=1,
        timeout_seconds=5,
        coordination_protocol=CoordinationProtocol.DIRECTED,
        context={'test': True},
        created_at=datetime.now()
    )
    
    await orchestrator.start_orchestration()
    await orchestrator.submit_task(task)
    await asyncio.sleep(3)
    
    status = orchestrator.get_orchestration_status()
    await orchestrator.stop_orchestration()
    
    print(f'✅ Tasks completed: {status["completed_tasks"]}')
    print(f'✅ Success rate: {status["performance_metrics"]["successful_collaborations"]}')
    print('🎯 Quick test complete!')
    
    return status["completed_tasks"] > 0

if __name__ == "__main__":
    success = asyncio.run(quick_test())
    if success:
        print('✅ Multi-agent orchestration is working!')
    else:
        print('❌ Multi-agent orchestration needs more fixes')
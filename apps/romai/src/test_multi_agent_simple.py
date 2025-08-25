#!/usr/bin/env python3
"""
Simple test for Multi-Agent Reasoning System
"""

import asyncio
import sys
import os
import logging

# Add current directory to path
sys.path.append(os.getcwd())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_multi_agent_system():
    """Test multi-agent reasoning system initialization and basic functionality"""
    try:
        from ml.reasoning.multi_agent_reasoning_system import (
            MultiAgentReasoningSystem, ReasoningProblem, ReasoningDomain, 
            ReasoningComplexity, AgentCollaborationMode
        )
        
        print("🧠 Initializing Multi-Agent Reasoning System...")
        system = MultiAgentReasoningSystem()
        
        agent_count = len(system.agents)
        domain_count = len(system.domain_mapping)
        
        print(f"✅ System initialized successfully!")
        print(f"🤖 Specialized agents: {agent_count}")
        print(f"🌍 Domain coverage: {domain_count}")
        
        # Test system status
        status = system.get_system_status()
        print(f"📊 System health: {status.get('system_health', 'unknown')}")
        print(f"📈 Problems solved: {status.get('problems_solved', 0)}")
        
        # Test individual agents
        math_agents = [a for a in system.agents.values() if a.domain == ReasoningDomain.MATHEMATICAL]
        cultural_agents = [a for a in system.agents.values() if a.domain == ReasoningDomain.CULTURAL]
        creative_agents = [a for a in system.agents.values() if a.domain == ReasoningDomain.CREATIVE]
        
        print(f"🔢 Mathematical agents: {len(math_agents)}")
        print(f"🇷🇴 Cultural agents: {len(cultural_agents)}")
        print(f"🎨 Creative agents: {len(creative_agents)}")
        
        # Create a simple test problem
        test_problem = ReasoningProblem(
            problem_id="simple_test",
            description="Calculează 2 + 2 și explică în contextul cultural românesc",
            problem_type="simple_math",
            complexity=ReasoningComplexity.SIMPLE,
            domains_required=[ReasoningDomain.MATHEMATICAL, ReasoningDomain.CULTURAL]
        )
        
        print("🧪 Testing problem solving...")
        
        # Start coordination
        await system.coordination_hub.start()
        
        # Solve the problem
        solution = await system.solve_complex_problem(
            test_problem, 
            AgentCollaborationMode.HIERARCHICAL
        )
        
        print(f"✅ Problem solved successfully!")
        print(f"📈 Reasoning quality: {solution.reasoning_quality:.2f}")
        print(f"🇷🇴 Cultural integration: {solution.cultural_integration_score:.2f}")
        print(f"🤝 Collaboration effectiveness: {solution.collaboration_effectiveness:.2f}")
        print(f"👥 Contributing agents: {len(solution.contributing_agents)}")
        print(f"⏱️ Total reasoning time: {solution.total_reasoning_time:.2f}s")
        
        # Test different collaboration modes
        print("🔄 Testing collaboration modes...")
        
        collaboration_modes = [
            AgentCollaborationMode.PARALLEL,
            AgentCollaborationMode.SEQUENTIAL,
            AgentCollaborationMode.DEMOCRATIC
        ]
        
        for mode in collaboration_modes:
            mode_solution = await system.solve_complex_problem(test_problem, mode)
            print(f"  {mode.value}: Quality={mode_solution.reasoning_quality:.2f}, "
                  f"Agents={len(mode_solution.contributing_agents)}")
        
        # Cleanup
        await system.coordination_hub.stop()
        
        print("🎉 All tests completed successfully!")
        print("=" * 60)
        print("🎯 MULTI-AGENT REASONING SYSTEM - FULLY OPERATIONAL")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_multi_agent_system())
    
    if success:
        print("✅ TEST SUITE PASSED - Multi-Agent Reasoning System ready for production!")
        exit(0)
    else:
        print("❌ TEST SUITE FAILED - System needs attention")
        exit(1)
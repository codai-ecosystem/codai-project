#!/usr/bin/env python3
"""
Quick Test of MoE System Integration
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_moe_integration():
    """Test MoE integration with model server"""
    
    print("🧪 Testing MoE System Integration...")
    
    try:
        # Test 1: Import MoE components
        print("\n1️⃣ Testing MoE imports...")
        from ml.mixture_of_experts import MoEServerEngine, MoEHealthChecker
        print("✅ MoE classes imported successfully")
        
        # Test 2: Create MoE engine
        print("\n2️⃣ Testing MoE engine creation...")
        moe_engine = MoEServerEngine()
        initialization_result = await moe_engine.initialize()
        print(f"✅ MoE engine initialization: {'SUCCESS' if initialization_result else 'FAILED'}")
        
        # Test 3: Test health checker
        print("\n3️⃣ Testing MoE health checker...")
        health_checker = MoEHealthChecker(moe_engine)
        health_result = await health_checker.check_health()
        print(f"✅ MoE health check: {health_result}")
        
        # Test 4: Create mock server and integrate
        print("\n4️⃣ Testing server integration...")
        
        class MockModelServer:
            def __init__(self):
                self.moe_engine = None
                self.multi_agent_coordination_system = None
                self.neural_agents = None
        
        mock_server = MockModelServer()
        
        # Import integration function
        from ml.mixture_of_experts.moe_server_integration import integrate_moe_with_server
        
        integration_result = await integrate_moe_with_server(mock_server)
        print(f"✅ Integration result: {integration_result['status']}")
        
        # Test 5: Check if moe_engine is set
        print("\n5️⃣ Testing moe_engine assignment...")
        if hasattr(mock_server, 'moe_engine') and mock_server.moe_engine:
            print("✅ moe_engine successfully assigned to server")
            
            # Test engine functionality
            test_request = {'query': 'Test Romanian cultural question: Ce este cultura românească?'}
            response = await mock_server.moe_engine.process_request(test_request)
            print(f"✅ MoE processing test: {response}")
            
        else:
            print("❌ moe_engine NOT assigned to server - THIS IS THE ISSUE!")
        
        print("\n🎉 MoE Integration Test Complete!")
        return True
        
    except Exception as e:
        print(f"❌ MoE Integration Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_moe_integration())
    print(f"\n🏁 Test Result: {'SUCCESS' if success else 'FAILED'}")
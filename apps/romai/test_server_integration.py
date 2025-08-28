#!/usr/bin/env python3
"""
Test Full Server Integration with Instant MoE
"""

import sys
import asyncio
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_server_integration():
    """Test full server integration with instant MoE"""
    
    print("🧪 Testing Full Server MoE Integration...")
    
    try:
        # Import server integration
        from ml.mixture_of_experts.moe_server_integration import integrate_moe_with_server
        print("✅ Server integration imported")
        
        # Create mock model server
        class MockModelServer:
            def __init__(self):
                self.moe_engine = None
                self.multi_agent_coordination_system = None
                self.neural_agents = None
                print("✅ Mock model server created")
        
        mock_server = MockModelServer()
        
        # Run integration
        print("\n🔄 Running MoE integration...")
        integration_result = await integrate_moe_with_server(mock_server)
        print(f"✅ Integration status: {integration_result['status']}")
        
        # Check moe_engine assignment
        print(f"\n🔍 Checking moe_engine assignment...")
        if hasattr(mock_server, 'moe_engine') and mock_server.moe_engine:
            print("✅ moe_engine successfully assigned to server!")
            
            # Test the moe_engine
            if hasattr(mock_server.moe_engine, 'initialized'):
                print(f"✅ moe_engine.initialized: {mock_server.moe_engine.initialized}")
                
            # Test health check
            try:
                from ml.mixture_of_experts import MoEHealthChecker
                health_checker = MoEHealthChecker(mock_server.moe_engine)
                health_result = await health_checker.check_health()
                print(f"✅ Health check: {health_result}")
            except Exception as e:
                print(f"⚠️ Health check error: {e}")
                
        else:
            print("❌ moe_engine NOT assigned to server!")
            return False
            
        print(f"\n📊 Integration details: {integration_result}")
        print("\n🎉 FULL SERVER INTEGRATION SUCCESS!")
        return True
        
    except Exception as e:
        print(f"❌ Server integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_server_integration())
    print(f"\n🏁 Result: {'SUCCESS' if success else 'FAILED'}")
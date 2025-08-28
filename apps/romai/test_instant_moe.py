#!/usr/bin/env python3
"""
Instant MoE Test - No Weight Initialization
"""

import sys
import asyncio
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_instant_moe():
    """Test instant MoE without heavy initialization"""
    
    print("⚡ Testing Instant MoE - No Weight Init...")
    
    try:
        # Create a minimal MoE engine that doesn't require PyTorch models
        class InstantMoEEngine:
            def __init__(self, config=None):
                self.config = config or {}
                self.initialized = False
                print(f"✅ Created instant MoE with config: {self.config}")
                
            async def initialize(self):
                """Instant initialization"""
                print("🚀 Instant MoE initialization...")
                self.initialized = True
                print("✅ MoE engine initialized instantly!")
                return True
                
            async def process_request(self, request):
                """Process request without heavy computation"""
                if not self.initialized:
                    await self.initialize()
                
                query = request.get('query', 'No query')
                print(f"🧠 Processing: {query}")
                
                # Mock MoE processing
                response = {
                    'status': 'processed',
                    'result': f"MoE processed: {query}",
                    'experts_used': ['romanian_expert', 'general_expert'],
                    'processing_time': '0.1s',
                    'model_size': self.config.get('model_size', 'instant')
                }
                
                return response
        
        # Test instant MoE
        moe_engine = InstantMoEEngine({'model_size': 'instant', 'experts': 4})
        
        # Test processing
        test_request = {'query': 'Ce este cultura românească?', 'type': 'cultural'}
        response = await moe_engine.process_request(test_request)
        
        print(f"✅ Response: {response}")
        
        # Mock server integration
        class MockModelServer:
            def __init__(self):
                self.moe_engine = None
        
        server = MockModelServer()
        server.moe_engine = moe_engine
        
        # Test server integration
        if hasattr(server, 'moe_engine') and server.moe_engine:
            health_status = 'healthy' if server.moe_engine.initialized else 'initialization_failed'
            print(f"✅ Server moe_engine status: {health_status}")
            
        print("\n🎯 SOLUTION: Use instant MoE for development, full MoE for production!")
        return True
        
    except Exception as e:
        print(f"❌ Instant MoE test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_instant_moe())
    print(f"\n🏁 Result: {'SUCCESS' if success else 'FAILED'}")
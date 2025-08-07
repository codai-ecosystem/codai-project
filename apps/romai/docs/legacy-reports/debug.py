#!/usr/bin/env python3
"""
Debug Week 2 Method Access
"""

import asyncio
import sys
import inspect

# Add source path
sys.path.append('src')

async def debug_enhanced_access():
    """Debug Week 2 method access"""
    print("🔍 Debugging Week 2 Method Access...")
    
    try:
        from ml.quantum.consciousness_engine import QuantumConsciousnessEngine
        
        # Initialize consciousness engine
        engine = QuantumConsciousnessEngine()
        await engine.initialize_consciousness()
        
        print("✅ Engine initialized successfully")
        
        # Check available methods
        methods = [method for method in dir(engine) if 'process' in method]
        print(f"📋 Available processing methods: {methods}")
        
        # Check Week 2 specific method
        has_enhanced_method = hasattr(engine, 'process_enhanced_romanian_consciousness')
        print(f"🔍 Has Week 2 method: {has_enhanced_method}")
        
        if has_enhanced_method:
            method = getattr(engine, 'process_enhanced_romanian_consciousness')
            sig = inspect.signature(method)
            print(f"📝 Method signature: {sig}")
            print("🎯 Testing Week 2 method...")
            
            result = await engine.process_enhanced_romanian_consciousness(
                "Test consciousness"
            )
            print(f"✅ Week 2 method works! Response type: {type(result)}")
            
        else:
            print("❌ Week 2 method not found!")
            
            # Check Week 2 mode
            engine.enhanced_mode = True
            print("🔧 Enabled Week 2 mode")
            
            # Check again
            has_enhanced_method_after = hasattr(engine, 'process_enhanced_romanian_consciousness')
            print(f"🔍 Has Week 2 method after mode enable: {has_enhanced_method_after}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(debug_enhanced_access())

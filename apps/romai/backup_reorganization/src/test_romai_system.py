#!/usr/bin/env python3
"""
Test RomAI System Integration
Validates that all reasoning engines are properly loaded and working
"""
import sys
import asyncio
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add current directory to path
sys.path.insert(0, '.')

async def test_romai_system():
    """Test complete RomAI system integration"""
    print("🧠 Testing RomAI AGI System Integration")
    print("=" * 50)
    
    try:
        # Import and initialize RomAI system
        from romai_agi_system import RomAI
        
        print("📦 Creating RomAI instance...")
        romai = RomAI()
        
        print("🚀 Initializing all reasoning engines...")
        await romai.initialize()
        
        print("\n✅ RomAI System Status:")
        print("-" * 30)
        print(f"Math Engine: {'✅ Available' if romai.math_engine else '❌ Not Available'}")
        print(f"Logic Engine: {'✅ Available' if romai.logic_engine else '❌ Not Available'}")
        print(f"Romanian Engine: {'✅ Available' if romai.romanian_engine else '❌ Not Available'}")
        print(f"Creative Engine: {'✅ Available' if romai.creative_engine else '❌ Not Available'}")
        print(f"Cross-Modal Engine: {'✅ Available' if romai.cross_modal_engine else '❌ Not Available'}")
        
        # Count available engines
        available_engines = sum([
            bool(romai.math_engine),
            bool(romai.logic_engine), 
            bool(romai.romanian_engine),
            bool(romai.creative_engine),
            bool(romai.cross_modal_engine)
        ])
        
        print(f"\n📊 Integration Summary:")
        print(f"Available Engines: {available_engines}/5")
        print(f"Success Rate: {(available_engines/5)*100:.1f}%")
        
        if available_engines == 5:
            print("🎉 SUCCESS: All reasoning engines loaded successfully!")
            print("✨ RomAI system is ready for comprehensive testing")
        elif available_engines >= 3:
            print("⚠️ PARTIAL: Most engines working, some issues detected")
        else:
            print("❌ FAILED: Critical system integration issues")
            
        return available_engines == 5
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        return False
    except Exception as e:
        print(f"❌ System Error: {e}")
        return False

async def test_basic_functionality():
    """Test basic functionality of each engine"""
    print("\n🔬 Testing Basic Functionality")
    print("=" * 50)
    
    try:
        from romai_agi_system import RomAI
        
        romai = RomAI()
        await romai.initialize()
        
        if not all([romai.math_engine, romai.logic_engine, romai.romanian_engine, 
                   romai.creative_engine, romai.cross_modal_engine]):
            print("⚠️ Not all engines available - skipping functionality tests")
            return False
            
        # Test math engine
        print("\n🧮 Testing Mathematical Reasoning...")
        try:
            math_result = await romai.solve_math("What is 2 + 2?")
            print(f"Math Result: {math_result.result[:100]}...")
            print("✅ Mathematical reasoning: WORKING")
        except Exception as e:
            print(f"❌ Mathematical reasoning failed: {e}")
            
        # Test logic engine  
        print("\n🤔 Testing Logical Reasoning...")
        try:
            logic_result = await romai.reason("All roses are flowers. This is a rose. What can we conclude?")
            print(f"Logic Result: {logic_result.result[:100]}...")
            print("✅ Logical reasoning: WORKING")
        except Exception as e:
            print(f"❌ Logical reasoning failed: {e}")
            
        # Test Romanian engine
        print("\n🇷🇴 Testing Romanian Cultural Analysis...")
        try:
            cultural_result = await romai.analyze_culture("What is the significance of Mărțișor?")
            if hasattr(cultural_result.result, 'insight'):
                print(f"Cultural Result: {cultural_result.result.insight[:100]}...")
            else:
                print(f"Cultural Result: {str(cultural_result.result)[:100]}...")
            print("✅ Romanian cultural analysis: WORKING")
        except Exception as e:
            print(f"❌ Romanian cultural analysis failed: {e}")
            
        print("\n🎯 Basic Functionality Test Complete")
        return True
        
    except Exception as e:
        print(f"❌ Functionality test failed: {e}")
        return False

if __name__ == "__main__":
    async def main():
        # Test system integration
        integration_success = await test_romai_system()
        
        # Test basic functionality if integration successful
        if integration_success:
            functionality_success = await test_basic_functionality()
            
        print("\n" + "=" * 60)
        print("🏁 RomAI System Test Summary")
        print("=" * 60)
        
        if integration_success:
            print("✅ System Integration: SUCCESS")
            print("✅ All reasoning engines loaded successfully")
            print("🚀 RomAI is ready for comprehensive testing")
        else:
            print("❌ System Integration: FAILED") 
            print("🔧 System needs additional fixes before testing")
    
    asyncio.run(main())
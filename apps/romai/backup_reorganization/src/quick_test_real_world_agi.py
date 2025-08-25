"""
Quick test for Real-World AGI Applications basic functionality
"""

import asyncio
import sys

# Add current directory to path
sys.path.append('.')

from real_world_agi_applications import (
    RealWorldAGIApplications, ApplicationRequest, ApplicationDomain
)

async def quick_test():
    """Quick test of real-world AGI applications"""
    print("🧪 Quick Real-World AGI Applications Test")
    print("=" * 50)
    
    try:
        # Initialize system
        agi_system = RealWorldAGIApplications()
        print("📋 Initializing AGI system...")
        
        init_result = await agi_system.initialize()
        print(f"✅ Initialization: {init_result.get('status', 'unknown')}")
        
        if init_result.get('status') != 'initialized':
            print(f"❌ Initialization failed: {init_result.get('error', 'Unknown error')}")
            return False
        
        # Test basic functionality
        print("\n🔬 Testing Scientific Research Application...")
        research_request = ApplicationRequest(
            domain=ApplicationDomain.SCIENTIFIC_RESEARCH,
            problem_statement="Test hypothesis generation for renewable energy",
            context={"field": "renewable_energy", "focus": "solar_efficiency"},
            constraints=["cost_effective"],
            success_criteria=["feasible_solution"]
        )
        
        research_result = await agi_system.process_application_request(research_request)
        print(f"Research confidence: {research_result.confidence:.2f}")
        print(f"Solution available: {'solution' in research_result.solution}")
        
        # Test system status
        print("\n📊 System Status:")
        status = await agi_system.get_system_status()
        print(f"System initialized: {status['system_initialized']}")
        print(f"Available domains: {len(status['available_domains'])}")
        
        if research_result.confidence > 0.5:
            print("\n🎉 Basic functionality working!")
            return True
        else:
            print(f"\n⚠️ Low confidence: {research_result.confidence}")
            return False
            
    except Exception as e:
        print(f"❌ Error in test: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(quick_test())
    print(f"\n🏁 Quick test {'PASSED' if success else 'FAILED'}")
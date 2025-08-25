"""
Test the neural-enhanced creative intelligence system
"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.creative_intelligence_system import CreativeIntelligenceSystem

async def test_neural_creative_system():
    print("🎨 Testing Neural-Enhanced Creative Intelligence System...")
    
    try:
        system = CreativeIntelligenceSystem()
        
        # Test creative problem solving
        result = await system.creative_problem_solving('Optimize neural network architecture for AGI')
        
        print(f"🎨 Creative solution quality: {result.quality_score:.3f}")
        print(f"🎨 Solution type: {result.solution_type}")
        print(f"🎨 Originality: {result.originality:.3f}")
        print(f"🎨 Feasibility: {result.feasibility:.3f}")
        print(f"🎨 Solution: {result.solution[:100]}...")
        print("✅ Neural creative system working!")
        return True
        
    except Exception as e:
        print(f"❌ Creative system error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_neural_creative_system())
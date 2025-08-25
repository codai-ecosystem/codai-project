"""
Test the Real Multimodal Perception Engine
"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.perception.real_multimodal_perception import real_text_perception

async def test_perception():
    print("🔍 Testing RomAI Real Perception System...")
    
    try:
        result = await real_text_perception('RomAI is testing real perception capabilities!')
        print(f"🧠 Perception confidence: {result.confidence:.3f}")
        print(f"🧠 Semantic concepts: {result.semantic_concepts}")
        print(f"🧠 Processing time: {result.processing_time:.3f}s")
        print("✅ Real perception system working!")
        return True
    except Exception as e:
        print(f"❌ Perception system error: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_perception())
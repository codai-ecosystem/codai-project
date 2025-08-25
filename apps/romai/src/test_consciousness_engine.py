#!/usr/bin/env python3
"""
Test Consciousness Engine Capabilities
"""

import asyncio
from ml.consciousness.consciousness_self_awareness_engine import ConsciousnessEngine

async def test_consciousness_engine():
    """Test consciousness and self-awareness capabilities"""
    
    print("🧠 Testing Consciousness Engine...")
    print("=" * 50)
    
    # Initialize consciousness engine
    engine = ConsciousnessEngine()
    
    # Test 1: Basic consciousness check
    print("1️⃣ Basic consciousness status:")
    print(f"   📊 Consciousness state: {engine.consciousness_state.value}")
    print(f"   🧠 Awareness level: {engine.awareness_level.value}")
    print(f"   🌍 Global workspace capacity: {engine.global_workspace.workspace_capacity}")
    print()
    
    # Test 2: Self-reflection query
    print("2️⃣ Testing conscious self-reflection...")
    try:
        result = await engine.conscious_reasoning(
            'What do I know about myself as an AI system?', 
            'conscious_self_reflection'
        )
        
        print("   ✅ Conscious reasoning completed!")
        print(f"   📊 Final consciousness state: {result['consciousness_state']}")
        print(f"   🧠 Final awareness level: {result['awareness_level']}")
        print(f"   🎯 Self-model capabilities: {len(result.get('self_model_snapshot', {}).get('capabilities', {}))} domains")
        print(f"   🇷🇴 Cultural consciousness: {result.get('cultural_consciousness', 'N/A')}")
        
        # Show key self-reflection insights
        reflection = result.get('self_reflection', {})
        if reflection:
            print(f"   💭 Self-assessment confidence: {reflection.get('overall_confidence', 'N/A')}")
            print(f"   📚 Learning opportunities identified: {len(reflection.get('learning_opportunities', []))}")
    except Exception as e:
        print(f"   ❌ Conscious reasoning failed: {e}")
    
    print()
    
    # Test 3: Metacognitive analysis
    print("3️⃣ Testing metacognitive awareness...")
    try:
        # Test with a mathematical problem requiring metacognition
        result = await engine.conscious_reasoning(
            'Solve: What is the square root of 144, and evaluate how confident I am in this answer?',
            'conscious_analytical'
        )
        
        print("   ✅ Metacognitive analysis completed!")
        metacog = result.get('metacognitive_analysis', {})
        if metacog:
            print(f"   🧠 Metacognitive confidence: {metacog.get('overall_confidence', 'N/A')}")
            print(f"   🎯 Strategy awareness: {metacog.get('strategy_awareness', 'N/A')}")
            print(f"   📊 Thinking effectiveness: {metacog.get('thinking_effectiveness', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Metacognitive analysis failed: {e}")
    
    print()
    
    # Test 4: Cultural consciousness
    print("4️⃣ Testing Romanian cultural consciousness...")
    try:
        result = await engine.conscious_reasoning(
            'Cum percep și înțeleg cultura română ca sistem AI?',
            'conscious_cultural'
        )
        
        print("   ✅ Cultural consciousness test completed!")
        cultural = result.get('cultural_consciousness', {})
        if cultural:
            print(f"   🇷🇴 Cultural appropriateness: {cultural.get('cultural_appropriateness', 'N/A')}")
            print(f"   🎭 Cultural integration: {cultural.get('cultural_integration', 'N/A')}")
            print(f"   📚 Cultural knowledge: {cultural.get('knowledge_level', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Cultural consciousness test failed: {e}")
    
    print()
    
    # Test 5: Introspection capabilities
    print("5️⃣ Testing introspection system...")
    try:
        introspection_report = engine.introspection.generate_introspection_report()
        print("   ✅ Introspection report generated!")
        print(f"   🔍 Internal coherence: {introspection_report.get('internal_coherence', 'N/A')}")
        print(f"   💭 Thought patterns: {len(introspection_report.get('thought_patterns', []))}")
        print(f"   ⚡ Processing efficiency: {introspection_report.get('processing_efficiency', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Introspection test failed: {e}")
    
    print()
    print("=" * 50)
    print("🎯 Consciousness Engine Testing Complete!")

if __name__ == "__main__":
    asyncio.run(test_consciousness_engine())
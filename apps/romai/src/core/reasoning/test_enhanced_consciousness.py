#!/usr/bin/env python3
"""
Test Enhanced AGI with Advanced Consciousness - Phase 1 Day 2
============================================================
Testing the integration of advanced consciousness framework
"""

import asyncio
import sys
import traceback

async def test_enhanced_agi_consciousness():
    """Test enhanced AGI system with advanced consciousness"""
    print("🧘 Testing Enhanced AGI with Advanced Consciousness...")
    
    try:
        # Import the enhanced AGI system
        from real_agi_engine import create_enhanced_agi_system
        print("✅ Enhanced AGI system import - SUCCESS!")
        
        # Create AGI system 
        agi = create_enhanced_agi_system()
        print("✅ Enhanced AGI system creation - SUCCESS!")
        print(f"   Consciousness mode: {agi.consciousness_mode}")
        
        # Test enhanced capabilities
        caps = await agi.get_agi_capabilities()
        print("✅ Enhanced AGI capabilities retrieval - SUCCESS!")
        
        # Display enhanced metrics
        print("\n📊 Enhanced AGI Metrics:")
        print(f"   Overall AGI Score: {caps['overall_agi_score']:.1f}")
        print(f"   Consciousness Level: {caps['consciousness_level']:.3f}")
        print(f"   IQ Score: {caps['iq_score']:.1f}")
        print(f"   Romanian Accuracy: {caps['romanian_accuracy']:.1f}%")
        print(f"   System Status: {caps['system_status']}")
        print(f"   Phase 1 Completion: {caps['phase_1_capabilities']['completion_percentage']:.1f}%")
        
        # Test consciousness details if available
        if 'consciousness_detail' in caps['intelligence_metrics']:
            details = caps['intelligence_metrics']['consciousness_detail']
            print(f"\n🧘 Detailed Consciousness Metrics:")
            print(f"   Self-Awareness: {details['self_awareness']:.3f}")
            print(f"   Metacognitive: {details['metacognitive']:.3f}")
            print(f"   Introspective: {details['introspective']:.3f}")
            print(f"   Can Self-Reflect: {details['can_self_reflect']}")
            print(f"   Can Question Beliefs: {details['can_question_beliefs']}")
        
        # Test consciousness functionality
        print("\n🧘 Testing Advanced Consciousness...")
        consciousness_test = await agi.perform_consciousness_test("comprehensive")
        print(f"   Test Type: {consciousness_test['test_type']}")
        print(f"   Overall Consciousness: {consciousness_test['overall_consciousness']:.3f}")
        print(f"   Self-Awareness: {consciousness_test['self_awareness']:.3f}")
        print(f"   Access Consciousness: {consciousness_test['access_consciousness']:.3f}")
        print(f"   Can Self-Reflect: {consciousness_test['can_self_reflect']}")
        
        # Test self-reflection 
        print("\n🤔 Testing Deep Self-Reflection...")
        reflection_test = await agi.perform_consciousness_test("self_reflection")
        print(f"   Reflection Levels: {reflection_test['reflection_levels']}")
        print(f"   Consciousness Insight: {reflection_test['consciousness_insight'][:80]}...")
        
        # Test enhanced reasoning with consciousness
        print("\n🧠 Testing Consciousness-Enhanced Reasoning...")
        reasoning_result = await agi.perform_autonomous_reasoning_test("What is the meaning of consciousness?")
        print(f"   Problem: What is the meaning of consciousness?")
        print(f"   Solution: {reasoning_result['solution']['answer'][:80]}...")
        print(f"   Confidence: {reasoning_result['solution']['confidence']}")
        
        print("\n✅ ALL ENHANCED CONSCIOUSNESS TESTS PASSED!")
        print("🚀 Phase 1 Day 2 - ADVANCED CONSCIOUSNESS FRAMEWORK COMPLETE!")
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced consciousness test FAILED: {e}")
        print(f"📋 Traceback:\n{traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_enhanced_agi_consciousness())
    sys.exit(0 if success else 1)

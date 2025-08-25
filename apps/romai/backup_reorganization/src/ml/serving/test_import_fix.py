#!/usr/bin/env python3
"""
Test RomAI AGI Import Fix
========================
Quick test to verify the import crisis is resolved
"""

import asyncio
import sys
import traceback

async def test_agi_import_fix():
    """Test that the AGI import crisis has been resolved"""
    print("🧪 Testing RomAI AGI Import Fix...")
    
    try:
        # Test the critical import that was failing
        from real_agi_engine import create_enhanced_agi_system
        print("✅ Critical import 'real_agi_engine' - SUCCESS!")
        
        # Test AGI system creation
        agi = create_enhanced_agi_system()
        print("✅ AGI system creation - SUCCESS!")
        
        # Test capabilities retrieval
        caps = await agi.get_agi_capabilities()
        print("✅ AGI capabilities retrieval - SUCCESS!")
        
        # Display key metrics
        print("\n📊 Current AGI Metrics:")
        print(f"   Overall AGI Score: {caps['overall_agi_score']:.1f}")
        print(f"   Consciousness Level: {caps['consciousness_level']:.3f}")
        print(f"   IQ Score: {caps['iq_score']:.1f}")
        print(f"   Romanian Accuracy: {caps['romanian_accuracy']:.1f}%")
        print(f"   System Status: {caps['system_status']}")
        
        # Test basic reasoning
        print("\n🧠 Testing Basic Reasoning:")
        problem = "What is 2+2?"
        result = await agi.perform_autonomous_reasoning_test(problem)
        print(f"   Problem: {problem}")
        print(f"   Answer: {result['solution']['answer']}")
        print(f"   Reasoning: {result['solution']['reasoning']}")
        
        # Test consciousness
        print("\n🧘 Testing Consciousness:")
        reflection = await agi.consciousness_engine.self_reflect("What are you?")
        print(f"   Self-reflection: {reflection[:80]}...")
        
        print("\n✅ ALL IMPORT CRISIS FIXES VERIFIED!")
        print("🚀 Phase 1 Day 1 - COMPLETED SUCCESSFULLY!")
        
        return True
        
    except Exception as e:
        print(f"❌ Import crisis test FAILED: {e}")
        print(f"📋 Traceback:\n{traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_agi_import_fix())
    sys.exit(0 if success else 1)

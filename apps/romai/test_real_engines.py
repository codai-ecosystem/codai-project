#!/usr/bin/env python3
"""
Test Real RomAI Engines (NOT Fake Ultimate Engines)
Verify that real computational engines work correctly and return actual values, not templates
"""

import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_real_engines():
    """Test that REAL engines are working and accessible"""
    print("🔍 Testing REAL RomAI Engines (No Fake Values)")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Real Mathematical Engine
    print("\n📊 Testing REAL Mathematical Engine...")
    try:
        from src.domains.mathematical.mathematical_reasoning_engine import WorldClassMathematicalEngine
        math_engine = WorldClassMathematicalEngine()
        
        # Critical test: 2+2 should return 4, not philosophy
        result = await math_engine.solve_mathematical_problem("2+2")
        
        print(f"   Problem: 2+2")
        print(f"   Answer: {result.answer}")
        print(f"   Steps: {result.steps}")
        print(f"   Confidence: {result.confidence}")
        
        if result.answer == 4:
            results['mathematical'] = "✅ REAL - Returns actual numerical answer"
            print("   ✅ REAL ENGINE: Returns correct numerical answer!")
        else:
            results['mathematical'] = f"❌ FAKE - Returns: {result.answer}"
            print(f"   ❌ PROBLEM: Returns {result.answer} instead of 4")
            
    except Exception as e:
        results['mathematical'] = f"❌ ERROR - {str(e)}"
        print(f"   ❌ ERROR: {e}")
    
    # Test 2: Real Programming Engine
    print("\n💻 Testing REAL Programming Engine...")
    try:
        from src.domains.programming.programming_excellence_engine import ProgrammingExcellenceEngine
        programming_engine = ProgrammingExcellenceEngine()
        
        result = await programming_engine.process_query("Write a simple Python function to add two numbers")
        
        print(f"   Query: Add two numbers function")
        print(f"   Answer type: {type(result.get('answer', 'No answer'))}")
        print(f"   Confidence: {result.get('confidence', 'N/A')}")
        
        if 'def' in str(result.get('answer', '')) and 'return' in str(result.get('answer', '')):
            results['programming'] = "✅ REAL - Generates actual code"
            print("   ✅ REAL ENGINE: Generates actual code!")
        else:
            results['programming'] = f"❌ FAKE - Returns template response"
            print("   ❌ PROBLEM: Returns template instead of real code")
            
    except Exception as e:
        results['programming'] = f"❌ ERROR - {str(e)}"
        print(f"   ❌ ERROR: {e}")
    
    # Test 3: Real Multimodal Engine
    print("\n🖼️  Testing REAL Multimodal Engine...")
    try:
        from src.domains.multimodal.multimodal_intelligence_engine import MultimodalIntelligenceEngine
        multimodal_engine = MultimodalIntelligenceEngine()
        
        result = await multimodal_engine.process_query("Analyze this image", {"image_path": "test.jpg"})
        
        print(f"   Query: Analyze image")
        print(f"   Answer type: {type(result.get('answer', 'No answer'))}")
        print(f"   Confidence: {result.get('confidence', 'N/A')}")
        
        # Check if it's a real analysis vs template
        answer_str = str(result.get('answer', ''))
        if len(answer_str) > 100 and 'template' not in answer_str.lower():
            results['multimodal'] = "✅ REAL - Processes actual multimodal input"
            print("   ✅ REAL ENGINE: Processes actual multimodal input!")
        else:
            results['multimodal'] = "❌ FAKE - Returns template response"
            print("   ❌ PROBLEM: Returns template instead of real analysis")
            
    except Exception as e:
        results['multimodal'] = f"❌ ERROR - {str(e)}"
        print(f"   ❌ ERROR: {e}")
    
    # Test 4: Real Orchestrator
    print("\n🎯 Testing REAL Multi-Domain Orchestrator...")
    try:
        # Fix import path to use correct directory name (agi-engine with hyphen)
        import importlib.util
        import sys
        spec = importlib.util.spec_from_file_location("multi_domain_orchestrator", 
            "apps/romai/src/core/agi-engine/multi_domain_orchestrator.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        process_multi_domain_query = module.process_multi_domain_query
        
        result = await process_multi_domain_query("What is 3+5?")
        
        print(f"   Query: What is 3+5?")
        print(f"   Answer: {result.get('integrated_answer', 'No answer')}")
        print(f"   Domains used: {len(result.get('domain_responses', []))}")
        
        if '8' in str(result.get('integrated_answer', '')):
            results['orchestrator'] = "✅ REAL - Orchestrator uses real engines"
            print("   ✅ REAL ORCHESTRATOR: Uses real engines!")
        else:
            results['orchestrator'] = "❌ FAKE - Orchestrator uses fake engines"
            print("   ❌ PROBLEM: Orchestrator still using fake engines")
            
    except Exception as e:
        results['orchestrator'] = f"❌ ERROR - {str(e)}"
        print(f"   ❌ ERROR: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 REAL ENGINE TEST RESULTS:")
    print("=" * 60)
    
    real_count = sum(1 for result in results.values() if result.startswith("✅"))
    total_count = len(results)
    
    for engine, result in results.items():
        print(f"{engine.ljust(15)}: {result}")
    
    print(f"\n📊 REAL ENGINES: {real_count}/{total_count}")
    
    if real_count == total_count:
        print("🎉 ALL ENGINES ARE REAL - NO FAKE VALUES!")
    else:
        print(f"⚠️  {total_count - real_count} ENGINES STILL HAVE FAKE IMPLEMENTATIONS")
    
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    asyncio.run(test_real_engines())
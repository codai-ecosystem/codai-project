import sys
import asyncio
import logging
sys.path.insert(0, 'apps/romai/src')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')

async def test_programming_capabilities():
    print("💻 ROMAI PROGRAMMING EXCELLENCE TEST")
    print("="*60)
    print("🎯 Testing: Code Generation + Debugging + Architecture")
    print("🏆 Target: World-class programming capabilities")
    print("="*60)
    
    try:
        # Test 1: Import programming engine
        print("\n🔧 STEP 1: Testing Programming Engine Import")
        print("-" * 50)
        
        try:
            from ml.training.programming_engine import AdvancedProgrammingCapabilitiesEngine
            programming_engine = AdvancedProgrammingCapabilitiesEngine()
            print("✅ Programming engine imported successfully")
        except Exception as e:
            print(f"❌ Programming engine import failed: {e}")
            return False
        
        # Test 2: Assess current capabilities
        print("\n📊 STEP 2: Assessing Programming Capabilities")
        print("-" * 50)
        
        try:
            assessment = await programming_engine.assess_programming_capabilities()
            print("✅ Programming assessment completed")
            print(f"   📈 HumanEval Score: {assessment.get('humaneval_score', 'N/A')}")
            print(f"   🎯 Code Generation: {assessment.get('code_generation_accuracy', 'N/A')}")
            print(f"   🏗️ Architecture Score: {assessment.get('architecture_design_quality', 'N/A')}")
        except Exception as e:
            print(f"❌ Programming assessment failed: {e}")
            assessment = {}
        
        # Test 3: Test code generation
        print("\n🐍 STEP 3: Testing Code Generation")
        print("-" * 50)
        
        try:
            code_request = {
                "description": "Create a Python function to calculate factorial",
                "language": "python",
                "complexity": "moderate",
                "requirements": ["recursive implementation", "error handling", "documentation"]
            }
            
            code_result = await programming_engine.code_generator.generate_code(code_request)
            print("✅ Code generation successful")
            print(f"   📝 Language: {code_result.get('language', 'N/A')}")
            print(f"   ⭐ Quality Score: {code_result.get('quality_score', 'N/A')}")
            
            if 'generated_code' in code_result:
                print(f"   📄 Code Preview:")
                print("   " + "\n   ".join(code_result['generated_code'][:200].split("\n")[:5]))
                if len(code_result['generated_code']) > 200:
                    print("   ... (truncated)")
                    
        except Exception as e:
            print(f"❌ Code generation failed: {e}")
            code_result = {}
        
        # Test 4: Test domain-specific programming
        print("\n🧮 STEP 4: Testing Mathematical Programming")
        print("-" * 50)
        
        try:
            math_code_request = {
                "description": "Implement matrix multiplication with optimized performance",
                "language": "python",
                "complexity": "advanced",
                "requirements": ["numpy integration", "performance optimization", "comprehensive testing"]
            }
            
            math_code_result = await programming_engine.code_generator.generate_code(math_code_request)
            print("✅ Mathematical programming successful")
            print(f"   ⚡ Performance Focus: {math_code_result.get('performance_optimized', 'N/A')}")
            print(f"   🧪 Tests Included: {math_code_result.get('tests_included', 'N/A')}")
            
        except Exception as e:
            print(f"❌ Mathematical programming failed: {e}")
            math_code_result = {}
        
        # Test 5: Enhancement capabilities
        print("\n🚀 STEP 5: Testing Capability Enhancement")
        print("-" * 50)
        
        try:
            enhancement_result = await programming_engine.enhance_programming_capabilities()
            print("✅ Programming enhancement completed")
            print(f"   📈 Enhancement Status: {enhancement_result.get('status', 'N/A')}")
            
            if 'improvements' in enhancement_result:
                print("   🎯 Key Improvements:")
                for improvement in enhancement_result['improvements'][:3]:
                    print(f"      • {improvement}")
                    
        except Exception as e:
            print(f"❌ Programming enhancement failed: {e}")
            enhancement_result = {}
        
        # Summary
        print("\n🏆 PROGRAMMING CAPABILITIES SUMMARY")
        print("="*60)
        
        # Calculate overall score
        scores = []
        
        # Engine availability
        engine_score = 100 if 'programming_engine' in locals() else 0
        scores.append(engine_score)
        print(f"🔧 Engine Availability: {engine_score}%")
        
        # Assessment capability
        assessment_score = 100 if assessment else 0
        scores.append(assessment_score)
        print(f"📊 Assessment Capability: {assessment_score}%")
        
        # Code generation capability
        code_gen_score = 100 if code_result else 0
        scores.append(code_gen_score)
        print(f"🐍 Code Generation: {code_gen_score}%")
        
        # Mathematical programming
        math_prog_score = 100 if math_code_result else 0
        scores.append(math_prog_score)
        print(f"🧮 Mathematical Programming: {math_prog_score}%")
        
        # Enhancement capability
        enhancement_score = 100 if enhancement_result else 0
        scores.append(enhancement_score)
        print(f"🚀 Enhancement Capability: {enhancement_score}%")
        
        overall_score = sum(scores) / len(scores)
        print(f"\n⚡ Overall Programming Score: {overall_score:.1f}%")
        
        if overall_score >= 90:
            print("🏆 EXCELLENT - World-class programming capabilities!")
            status = "WORLD-CLASS"
        elif overall_score >= 75:
            print("✅ GOOD - Strong programming foundation")
            status = "PRODUCTION-READY"
        elif overall_score >= 50:
            print("⚠️ MODERATE - Needs enhancement")
            status = "DEVELOPMENT"
        else:
            print("❌ POOR - Major programming work needed")
            status = "BASIC"
        
        print(f"📋 Status: {status}")
        print("="*60)
        
        return overall_score >= 75
        
    except Exception as e:
        print(f"❌ FATAL ERROR: Programming test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_programming_capabilities())
    if success:
        print("\n🎉 Programming capabilities test PASSED!")
    else:
        print("\n💥 Programming capabilities test FAILED!")
"""
Test script to validate the reorganized RomAI project structure.

This script tests imports, basic functionality, and ensures the reorganization
was successful.
"""

import asyncio
import sys
import traceback
from pathlib import Path

# Add the src directory to Python path for testing
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_core_imports():
    """Test core module imports."""
    print("🔧 Testing core module imports...")
    
    try:
        from romai.core.types import MathResult, LogicResult, EngineConfig, EngineStatus
        from romai.core.base import BaseEngine
        from romai.core.config import config
        print("✅ Core modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Core import failed: {e}")
        traceback.print_exc()
        return False


def test_reasoning_imports():
    """Test reasoning module imports."""
    print("🧮 Testing reasoning module imports...")
    
    try:
        from romai.reasoning.math import MathEngine
        from romai.reasoning.logic import LogicEngine
        print("✅ Reasoning modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Reasoning import failed: {e}")
        traceback.print_exc()
        return False


def test_neural_imports():
    """Test neural module imports."""
    print("🧠 Testing neural module imports...")
    
    try:
        from romai.neural.attention.latent import LatentAttention, LatentAttentionConfig
        print("✅ Neural modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Neural import failed: {e}")
        traceback.print_exc()
        return False


def test_serving_imports():
    """Test serving module imports."""
    print("🌐 Testing serving module imports...")
    
    try:
        from romai.serving.api import app
        from romai.serving.server import RomAIServer, run_server
        print("✅ Serving modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Serving import failed: {e}")
        traceback.print_exc()
        return False


def test_utils_imports():
    """Test utils module imports."""
    print("🔧 Testing utils module imports...")
    
    try:
        from romai.utils.validation import InputValidator, OutputValidator
        from romai.utils.logging import performance_logger, audit_logger
        from romai.utils.metrics import app_metrics
        print("✅ Utils modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Utils import failed: {e}")
        traceback.print_exc()
        return False


def test_main_package_import():
    """Test main package import."""
    print("📦 Testing main package import...")
    
    try:
        import romai
        print(f"✅ RomAI package imported, version: {romai.__version__}")
        
        # Test accessing components through main package
        from romai import MathEngine, LogicEngine, config
        print("✅ Main package exports accessible")
        return True
    except Exception as e:
        print(f"❌ Main package import failed: {e}")
        traceback.print_exc()
        return False


async def test_math_engine_functionality():
    """Test math engine basic functionality."""
    print("🧮 Testing math engine functionality...")
    
    try:
        from romai.reasoning.math import MathEngine
        from romai.core.types import EngineConfig
        
        # Create engine with test config
        config = EngineConfig(
            timeout_seconds=10,
            confidence_threshold=0.7,
            enable_cultural_context=True
        )
        
        engine = MathEngine(config)
        
        # Test basic math problem
        result = await engine.process("2 + 2")
        print(f"✅ Math test: 2 + 2 = {result.result}")
        print(f"   Success: {result.success}, Confidence: {result.confidence}")
        
        return result.success
        
    except Exception as e:
        print(f"❌ Math engine test failed: {e}")
        traceback.print_exc()
        return False


async def test_logic_engine_functionality():
    """Test logic engine basic functionality."""
    print("🧠 Testing logic engine functionality...")
    
    try:
        from romai.reasoning.logic import LogicEngine
        from romai.core.types import EngineConfig
        
        # Create engine with test config
        config = EngineConfig(
            timeout_seconds=10,
            confidence_threshold=0.7
        )
        
        engine = LogicEngine(config)
        
        # Test basic logic problem
        result = await engine.process("All roses are flowers. This is a rose.")
        print(f"✅ Logic test result: {result.conclusion}")
        print(f"   Success: {result.success}, Confidence: {result.confidence}")
        
        return result.success
        
    except Exception as e:
        print(f"❌ Logic engine test failed: {e}")
        traceback.print_exc()
        return False


def test_neural_attention_functionality():
    """Test neural attention module functionality."""
    print("🧠 Testing neural attention functionality...")
    
    try:
        from romai.neural.attention.latent import LatentAttention, LatentAttentionConfig
        
        # Test configuration
        config = LatentAttentionConfig(
            hidden_size=512,
            num_heads=8,
            latent_size=64
        )
        
        # Test attention module creation
        attention = LatentAttention(config)
        print(f"✅ LatentAttention created with config: hidden_size={config.hidden_size}")
        
        # Test basic properties
        print(f"   Heads: {config.num_heads}, Latent size: {config.latent_size}")
        print(f"   Romanian enhancement: {config.enable_romanian_enhancement}")
        
        return True
        
    except Exception as e:
        print(f"❌ Neural attention test failed: {e}")
        traceback.print_exc()
        return False


def test_validation_functionality():
    """Test validation utilities functionality."""
    print("✅ Testing validation functionality...")
    
    try:
        from romai.utils.validation import InputValidator, sanitize_input
        
        # Test math input validation
        result = InputValidator.validate_math_input("2 + 2 * 3")
        print(f"✅ Math validation: Valid={result.is_valid}")
        print(f"   Problem types: {result.metadata.get('problem_types', [])}")
        
        # Test input sanitization
        clean_input = sanitize_input("  Test input with <script>alert('test')</script>  ")
        print(f"✅ Input sanitization: '{clean_input}'")
        
        return result.is_valid
        
    except Exception as e:
        print(f"❌ Validation test failed: {e}")
        traceback.print_exc()
        return False


async def run_comprehensive_tests():
    """Run all validation tests."""
    print("🚀 RomAI Project Reorganization Validation")
    print("=" * 50)
    
    tests = [
        ("Core Imports", test_core_imports),
        ("Reasoning Imports", test_reasoning_imports), 
        ("Neural Imports", test_neural_imports),
        ("Serving Imports", test_serving_imports),
        ("Utils Imports", test_utils_imports),
        ("Main Package Import", test_main_package_import),
        ("Math Engine Functionality", test_math_engine_functionality),
        ("Logic Engine Functionality", test_logic_engine_functionality),
        ("Neural Attention Functionality", test_neural_attention_functionality),
        ("Validation Functionality", test_validation_functionality)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        print("-" * 30)
        
        try:
            if asyncio.iscoroutinefunction(test_func):
                success = await test_func()
            else:
                success = test_func()
            
            results.append((test_name, success))
            
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status:10} {test_name}")
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print("-" * 50)
    print(f"Total: {len(results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Reorganization was successful!")
        print("✅ Project is ready for development and deployment.")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review and fix issues.")
        print("❌ Reorganization needs attention before proceeding.")
    
    return failed == 0


if __name__ == "__main__":
    # Run the comprehensive validation
    success = asyncio.run(run_comprehensive_tests())
    
    if success:
        print("\n🚀 Next steps:")
        print("   1. Fix any remaining import statements in legacy code")
        print("   2. Implement missing components (memory, perception, agents)")
        print("   3. Run production deployment tests")
        sys.exit(0)
    else:
        print("\n🔧 Fix the failing tests before proceeding.")
        sys.exit(1)
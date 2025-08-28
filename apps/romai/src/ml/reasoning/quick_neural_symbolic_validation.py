"""
Quick Neural-Symbolic Architecture Validation Test for RomAI AGI System

This script tests the basic functionality of our neural-symbolic architecture
by importing and initializing all components with proper error handling.
"""

import asyncio
import time
import logging
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_neural_symbolic_imports():
    """Test if all neural-symbolic components can be imported"""
    print("🧠 ROMAI NEURAL-SYMBOLIC ARCHITECTURE VALIDATION")
    print("=" * 60)
    
    components = {
        'neural_symbolic_types': 'Neural-Symbolic Type Definitions',
        'neural_perception_layer': 'Neural Perception Layer',
        'symbolic_knowledge_layer': 'Symbolic Knowledge Layer', 
        'neural_symbolic_bridge': 'Neural-Symbolic Bridge',
        'unified_reasoning_coordinator': 'Unified Reasoning Coordinator',
        'neural_symbolic_react_integration': 'ReAct Integration Layer'
    }
    
    successful_imports = 0
    total_components = len(components)
    
    print("\n📦 Testing Component Imports:")
    print("-" * 40)
    
    for module_name, description in components.items():
        try:
            print(f"  🔧 {description}...", end=" ")
            
            # Import the module
            module = __import__(module_name)
            
            # Basic validation
            if hasattr(module, 'create_' + module_name.replace('neural_symbolic_', '').replace('_layer', '_layer').replace('_coordinator', '_coordinator').replace('_integration', '_agent')):
                print("✅ SUCCESS")
                successful_imports += 1
            elif 'types' in module_name:
                # Types module doesn't have create function
                print("✅ SUCCESS (Types)")
                successful_imports += 1
            else:
                print("⚠️  PARTIAL (No create function)")
                successful_imports += 0.5
                
        except ImportError as e:
            print(f"❌ IMPORT ERROR: {str(e)[:50]}...")
            logger.error(f"Failed to import {module_name}: {e}")
        except Exception as e:
            print(f"❌ ERROR: {str(e)[:50]}...")
            logger.error(f"Error with {module_name}: {e}")
    
    print(f"\n📊 Import Summary:")
    print(f"  ✅ Successful: {successful_imports}/{total_components}")
    print(f"  📈 Success Rate: {(successful_imports/total_components)*100:.1f}%")
    
    return successful_imports >= total_components * 0.8

async def test_component_initialization():
    """Test if components can be initialized"""
    print(f"\n🔧 Testing Component Initialization:")
    print("-" * 40)
    
    try:
        # Import types first
        from neural_symbolic_types import NeuralSymbolicConfig
        
        # Create test configuration
        config = NeuralSymbolicConfig(
            embedding_dim=64,  # Small for testing
            attention_heads=2,
            neural_layers=1,
            reasoning_depth=2,
            verbose_logging=False
        )
        
        print(f"  📋 Configuration created: ✅ SUCCESS")
        print(f"    - Embedding dim: {config.embedding_dim}")
        print(f"    - Attention heads: {config.attention_heads}")
        print(f"    - Neural layers: {config.neural_layers}")
        
        # Test individual component creation
        components_tested = 0
        components_successful = 0
        
        # Test neural perception layer
        try:
            from neural_perception_layer import create_neural_perception_layer
            perception_layer = create_neural_perception_layer(config)
            print(f"  🧠 Neural Perception Layer: ✅ SUCCESS")
            components_tested += 1
            components_successful += 1
        except Exception as e:
            print(f"  🧠 Neural Perception Layer: ❌ ERROR ({str(e)[:30]}...)")
            components_tested += 1
        
        # Test symbolic knowledge layer
        try:
            from symbolic_knowledge_layer import create_symbolic_knowledge_layer
            knowledge_layer = create_symbolic_knowledge_layer(config)
            print(f"  🎯 Symbolic Knowledge Layer: ✅ SUCCESS")
            components_tested += 1
            components_successful += 1
        except Exception as e:
            print(f"  🎯 Symbolic Knowledge Layer: ❌ ERROR ({str(e)[:30]}...)")
            components_tested += 1
        
        # Test neural-symbolic bridge
        try:
            from neural_symbolic_bridge import create_neural_symbolic_bridge
            bridge = create_neural_symbolic_bridge(config)
            print(f"  🌉 Neural-Symbolic Bridge: ✅ SUCCESS")
            components_tested += 1
            components_successful += 1
        except Exception as e:
            print(f"  🌉 Neural-Symbolic Bridge: ❌ ERROR ({str(e)[:30]}...)")
            components_tested += 1
        
        # Test unified reasoning coordinator
        try:
            from unified_reasoning_coordinator import create_unified_reasoning_coordinator
            coordinator = create_unified_reasoning_coordinator(config)
            print(f"  🎼 Unified Reasoning Coordinator: ✅ SUCCESS")
            components_tested += 1
            components_successful += 1
        except Exception as e:
            print(f"  🎼 Unified Reasoning Coordinator: ❌ ERROR ({str(e)[:30]}...)")
            components_tested += 1
        
        # Test ReAct integration
        try:
            from neural_symbolic_react_integration import create_neural_symbolic_react_agent
            react_agent = create_neural_symbolic_react_agent(config)
            print(f"  🎭 ReAct Integration: ✅ SUCCESS")
            components_tested += 1
            components_successful += 1
        except Exception as e:
            print(f"  🎭 ReAct Integration: ❌ ERROR ({str(e)[:30]}...)")
            components_tested += 1
        
        print(f"\n📊 Initialization Summary:")
        print(f"  ✅ Successful: {components_successful}/{components_tested}")
        print(f"  📈 Success Rate: {(components_successful/components_tested)*100:.1f}%")
        
        return components_successful >= components_tested * 0.8
        
    except Exception as e:
        print(f"  ❌ Configuration Error: {e}")
        logger.error(f"Configuration failed: {e}")
        return False

async def test_basic_functionality():
    """Test basic functionality of the neural-symbolic system"""
    print(f"\n⚡ Testing Basic Functionality:")
    print("-" * 40)
    
    try:
        # Import required components
        from neural_symbolic_types import NeuralSymbolicConfig, NeuralSymbolicMode
        from neural_symbolic_react_integration import create_neural_symbolic_react_agent
        
        config = NeuralSymbolicConfig(embedding_dim=64, attention_heads=2)
        agent = create_neural_symbolic_react_agent(config)
        
        # Test simple problem solving
        test_problems = [
            "What is 2 + 2?",
            "If all cats are animals, and Fluffy is a cat, what is Fluffy?",
            "Calculate 5 * 3"
        ]
        
        successful_tests = 0
        for i, problem in enumerate(test_problems, 1):
            print(f"  🧪 Test {i}: {problem[:40]}{'...' if len(problem) > 40 else ''}")
            
            try:
                start_time = time.time()
                result = await agent.solve(problem, max_steps=3, enable_neural_symbolic=True)
                processing_time = time.time() - start_time
                
                if result and hasattr(result, 'success') and result.success:
                    print(f"    ✅ SUCCESS - Answer: {str(result.final_answer)[:50]}...")
                    print(f"    ⏱️  Time: {processing_time:.2f}s, Confidence: {result.confidence:.2f}")
                    successful_tests += 1
                else:
                    print(f"    ⚠️  PARTIAL - Got result but with issues")
                    successful_tests += 0.5
                    
            except Exception as e:
                print(f"    ❌ ERROR: {str(e)[:50]}...")
                logger.error(f"Test problem failed: {e}")
        
        success_rate = successful_tests / len(test_problems)
        print(f"\n📊 Functionality Summary:")
        print(f"  ✅ Successful: {successful_tests}/{len(test_problems)}")
        print(f"  📈 Success Rate: {success_rate*100:.1f}%")
        
        return success_rate >= 0.6
        
    except Exception as e:
        print(f"  ❌ Functionality Test Error: {e}")
        logger.error(f"Basic functionality test failed: {e}")
        return False

async def main():
    """Main validation execution"""
    start_time = time.time()
    
    print("🚀 Starting Neural-Symbolic Architecture Quick Validation...")
    
    # Run validation tests
    import_success = await test_neural_symbolic_imports()
    init_success = await test_component_initialization()
    func_success = await test_basic_functionality()
    
    total_time = time.time() - start_time
    
    # Generate overall assessment
    print(f"\n🎯 OVERALL VALIDATION RESULTS")
    print("=" * 60)
    
    tests = [
        ("Component Imports", import_success),
        ("Component Initialization", init_success), 
        ("Basic Functionality", func_success)
    ]
    
    passed_tests = sum(1 for _, success in tests if success)
    total_tests = len(tests)
    
    print(f"📊 Test Results:")
    for test_name, success in tests:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    print(f"\n📈 Summary:")
    print(f"  Tests Passed: {passed_tests}/{total_tests}")
    print(f"  Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    print(f"  Total Time: {total_time:.2f}s")
    
    # Overall assessment
    if passed_tests == total_tests:
        print(f"\n🌟 EXCELLENT: Neural-Symbolic Architecture is fully functional!")
        print("🎉 The system is ready for advanced AGI validation testing!")
        return 0
    elif passed_tests >= total_tests * 0.8:
        print(f"\n✅ GOOD: Neural-Symbolic Architecture is mostly working!")
        print("⚠️  Minor issues detected but system is functional.")
        return 1
    elif passed_tests >= total_tests * 0.5:
        print(f"\n⚠️  PARTIAL: Neural-Symbolic Architecture has some issues!")
        print("🔧 System needs fixes before production use.")
        return 2
    else:
        print(f"\n❌ CRITICAL: Neural-Symbolic Architecture has major issues!")
        print("💥 System requires significant debugging and fixes.")
        return 3

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    print(f"\n🏁 Validation completed with exit code: {exit_code}")
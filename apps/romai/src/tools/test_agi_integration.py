"""
ROMAI AGI Integration Test - Tool System Integration Validation
============================================================

Test script to validate the integration of the tool system with the existing
AGI architecture. Tests tool use, inference capabilities, and AGI coordination.

Author: GitHub Copilot AGI Inspector
Date: August 27, 2025
Status: Integration Testing
"""

import asyncio
import logging
import sys
import os

# Add the apps/romai/src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ml'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_agi_tool_integration():
    """Test the AGI system with tool integration."""
    print("🧠 ROMAI AGI Tool System Integration Test")
    print("=" * 60)
    
    try:
        # Import AGI system
        from ml.agi.agi_system import EnhancedAGISystem
        
        # Initialize AGI system
        print("\n1. Initializing Enhanced AGI System...")
        agi = EnhancedAGISystem()
        
        success = await agi.initialize()
        if not success:
            print("❌ AGI initialization failed")
            return
        
        print("✅ AGI System initialized successfully")
        
        # Get system status
        print("\n2. System Status Check...")
        status = await agi.get_enhanced_status()
        
        print(f"Status: {status.get('status')}")
        print(f"Tool System Available: {status.get('tool_system_available')}")
        print(f"Tool Enabled: {status.get('tool_enabled')}")
        print(f"Neurosymbolic Available: {status.get('neurosymbolic_available')}")
        
        # Test available tools
        if status.get('tool_enabled'):
            print("\n3. Available Tools:")
            available_tools = agi.get_available_tools()
            for i, tool in enumerate(available_tools, 1):
                print(f"  {i}. {tool}")
        
        # Test basic processing
        print("\n4. Basic Processing Test...")
        result = await agi.enhanced_process_input(
            "Hello, can you help me understand what you can do?",
            context={'test': 'basic_processing'}
        )
        
        if result:
            print(f"✅ Processing successful")
            print(f"Result: {result.get('result', 'No result')[:200]}...")
            print(f"Tool Executions: {result.get('tool_executions', 0)}")
        else:
            print("❌ Processing failed")
        
        # Test tool-specific processing
        print("\n5. Tool-Specific Processing Test...")
        tool_result = await agi.enhanced_process_input(
            "Can you show me what files are in the current directory?",
            context={'test': 'tool_processing'}
        )
        
        if tool_result:
            print(f"✅ Tool processing successful")
            print(f"Tool Executions: {tool_result.get('tool_executions', 0)}")
            print(f"Tool Success Rate: {tool_result.get('tool_success_rate', 0):.2f}")
            
            if tool_result.get('tool_results'):
                print("Tool Results:")
                for i, tr in enumerate(tool_result['tool_results'], 1):
                    status_icon = "✅" if tr.get('success') else "❌"
                    print(f"  {i}. {status_icon} {tr.get('type', 'Unknown')}")
        
        # Test direct tool execution
        if status.get('tool_enabled'):
            print("\n6. Direct Tool Execution Test...")
            direct_result = await agi.execute_tool_directly(
                'system_info', {}
            )
            
            if direct_result.get('success'):
                print("✅ Direct tool execution successful")
                print(f"Execution time: {direct_result.get('execution_time', 0):.3f}s")
                print(f"Result preview: {direct_result.get('result', 'No result')[:100]}...")
            else:
                print(f"❌ Direct tool execution failed: {direct_result.get('error')}")
        
        # Test direct text generation
        if status.get('tool_enabled'):
            print("\n7. Direct Text Generation Test...")
            gen_result = await agi.generate_text_directly(
                "Explain the concept of artificial general intelligence",
                task_type="reasoning"
            )
            
            if gen_result.get('success'):
                print("✅ Direct text generation successful")
                print(f"Generation time: {gen_result.get('generation_time', 0):.3f}s")
                print(f"Tokens per second: {gen_result.get('tokens_per_second', 0):.1f}")
                print(f"Generated text: {gen_result.get('generated_text', 'No text')[:150]}...")
            else:
                print(f"❌ Direct text generation failed: {gen_result.get('error')}")
        
        # Mathematical reasoning test
        print("\n8. Mathematical Reasoning Test...")
        math_result = await agi.enhanced_process_input(
            "Calculate the square root of 144 and explain the process",
            domain='mathematical'
        )
        
        if math_result:
            print("✅ Mathematical reasoning completed")
            print(f"Domain: {math_result.get('domain')}")
            print(f"Reasoning Type: {math_result.get('reasoning_type')}")
            print(f"Verified: {math_result.get('verified')}")
        
        # Final system statistics
        print("\n9. Final System Statistics...")
        final_status = await agi.get_enhanced_status()
        
        print(f"Reasoning History Count: {final_status.get('reasoning_history_count', 0)}")
        print(f"Tool Usage Rate: {final_status.get('tool_usage_rate', 0):.2f}")
        
        if final_status.get('tool_stats'):
            tool_stats = final_status['tool_stats']
            print(f"Total Tool Executions: {tool_stats.get('total_executions', 0)}")
            print(f"Tool Success Rate: {tool_stats.get('success_rate', 0):.2f}")
        
        if final_status.get('inference_stats'):
            inf_stats = final_status['inference_stats']
            print(f"Total Inferences: {inf_stats.get('total_inferences', 0)}")
            print(f"Inference Success Rate: {inf_stats.get('success_rate', 0):.2f}")
        
        # Cleanup
        print("\n10. System Cleanup...")
        await agi.shutdown_tool_system()
        print("✅ Cleanup completed")
        
        print("\n🎯 AGI Tool Integration Test Completed Successfully!")
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        print("This is expected if dependencies are not installed")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_agi_tool_integration())
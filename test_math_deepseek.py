"""
Quick test of RomAI-DeepSeek V3 mathematical reasoning
"""
import sys
import asyncio
sys.path.append('.')

async def test_math():
    print('Testing DeepSeek V3 mathematical reasoning...')
    try:
        from ml.architecture.romai_deepseek_integration import create_romai_deepseek_system
        
        # Create system
        system = create_romai_deepseek_system(
            scale='base',
            enable_cultural=True,
            enable_experts=True,
            device='auto'
        )
        
        # Test mathematical reasoning
        print('\n🔢 Testing: 25 + 17 = ?')
        result = await system.generate_response(
            query="Cât face 25 + 17?",
            capability='mathematical'
        )
        
        print(f"🤖 Response: {result['response']}")
        print(f"⏱️ Time: {result['metadata']['inference_time']:.3f}s")
        print(f"🔥 Model: {result['metadata'].get('system_version', 'Unknown')}")
        
        # Check if contains correct answer
        if '42' in result['response'] or 'patruzeci' in result['response'].lower():
            print("✅ Mathematical reasoning test PASSED!")
        else:
            print("⚠️ Mathematical reasoning needs verification")
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()

# Run the test
asyncio.run(test_math())
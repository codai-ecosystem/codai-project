"""
Test script for Multi-head Latent Attention (MLA) implementation.
Validates MLA functionality, performance, and integration with RomAI.
"""

import torch
import asyncio
import time
import sys
import os
from typing import Dict, Any

# Add the RomAI source path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ml.attention.mla_attention import (
    MLAConfig, MLABlock, MultiheadLatentAttention, 
    benchmark_mla_performance, create_mla_config
)
from ml.attention.mla_integration import (
    MLAIntegrationManager, MLAIntegrationConfig, test_mla_integration
)

def test_mla_basic_functionality():
    """Test basic MLA functionality."""
    print("🧠 Testing MLA Basic Functionality...")
    
    # Create configuration
    config = MLAConfig(
        hidden_size=2048,
        num_attention_heads=16,
        num_key_value_heads=4,
        latent_size=256,
        use_flash_attention=False,  # Test without FlashAttention first
    )
    
    # Create MLA block
    mla_block = MLABlock(config)
    
    # Test input
    batch_size, seq_len = 2, 512
    hidden_states = torch.randn(batch_size, seq_len, config.hidden_size)
    
    # Forward pass
    output = mla_block(hidden_states, use_cache=True)
    
    # Validate output
    assert output.attention_output.shape == (batch_size, seq_len, config.hidden_size)
    assert output.past_key_value is not None
    assert output.kv_compression_stats is not None
    
    compression_ratio = output.kv_compression_stats['compression_ratio']
    memory_saved = output.kv_compression_stats['memory_saved_percent']
    
    print(f"✅ Basic functionality test passed!")
    print(f"   Compression ratio: {compression_ratio:.3f}")
    print(f"   Memory saved: {memory_saved:.1f}%")
    
    return True

def test_mla_with_flash_attention():
    """Test MLA with FlashAttention if available."""
    print("⚡ Testing MLA with FlashAttention...")
    
    try:
        from flash_attn import flash_attn_func
        flash_available = True
        print("   FlashAttention detected!")
    except ImportError:
        flash_available = False
        print("   FlashAttention not available, skipping...")
        return True
    
    if not flash_available:
        return True
    
    # Create configuration with FlashAttention enabled
    config = MLAConfig(
        hidden_size=2048,
        num_attention_heads=16,
        num_key_value_heads=4,
        latent_size=256,
        use_flash_attention=True,
    )
    
    # Create MLA block
    mla_block = MLABlock(config)
    
    # Move to GPU if available
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    mla_block = mla_block.to(device)
    
    # Test input
    batch_size, seq_len = 1, 1024
    hidden_states = torch.randn(batch_size, seq_len, config.hidden_size, device=device)
    
    # Forward pass with timing
    start_time = time.time()
    with torch.no_grad():
        output = mla_block(hidden_states, use_cache=True)
    inference_time = (time.time() - start_time) * 1000  # ms
    
    print(f"✅ FlashAttention test passed!")
    print(f"   Inference time: {inference_time:.2f}ms")
    print(f"   Device: {device}")
    
    return True

def test_mla_memory_efficiency():
    """Test MLA memory efficiency compared to standard attention."""
    print("📊 Testing MLA Memory Efficiency...")
    
    config = MLAConfig(
        hidden_size=4096,
        num_attention_heads=32,
        num_key_value_heads=8,
        latent_size=512,
        use_flash_attention=False,
    )
    
    # Benchmark performance
    results = benchmark_mla_performance(
        config,
        batch_size=1,
        seq_len=2048,
        device='cuda' if torch.cuda.is_available() else 'cpu',
        num_iterations=5
    )
    
    print(f"✅ Memory efficiency test completed!")
    print(f"   Average inference time: {results['avg_inference_time_ms']:.2f}ms")
    print(f"   Throughput: {results['throughput_tokens_per_sec']:.0f} tokens/sec")
    print(f"   Memory saved: {results['memory_saved_percent']:.1f}%")
    print(f"   KV compression ratio: {results['kv_compression_ratio']:.3f}")
    
    return True

def test_mla_different_configurations():
    """Test MLA with different configurations."""
    print("⚙️ Testing MLA Different Configurations...")
    
    configurations = [
        # Small model
        {'hidden_size': 1024, 'num_attention_heads': 8, 'latent_size': 128},
        # Medium model  
        {'hidden_size': 2048, 'num_attention_heads': 16, 'latent_size': 256},
        # Large model
        {'hidden_size': 4096, 'num_attention_heads': 32, 'latent_size': 512},
    ]
    
    for i, config_dict in enumerate(configurations):
        print(f"   Testing configuration {i+1}: {config_dict['hidden_size']} hidden, {config_dict['num_attention_heads']} heads")
        
        config = MLAConfig(
            hidden_size=config_dict['hidden_size'],
            num_attention_heads=config_dict['num_attention_heads'],
            num_key_value_heads=config_dict['num_attention_heads'] // 4,
            latent_size=config_dict['latent_size'],
            use_flash_attention=False,
        )
        
        mla_block = MLABlock(config)
        
        # Test with smaller sequence for large models
        seq_len = 1024 if config_dict['hidden_size'] <= 2048 else 512
        hidden_states = torch.randn(1, seq_len, config_dict['hidden_size'])
        
        output = mla_block(hidden_states, use_cache=True)
        compression_ratio = output.kv_compression_stats['compression_ratio']
        
        print(f"     ✅ Configuration {i+1} passed - Compression: {compression_ratio:.3f}")
    
    return True

async def test_mla_integration_manager():
    """Test the MLA integration manager."""
    print("🔧 Testing MLA Integration Manager...")
    
    # Run integration test
    success = await test_mla_integration()
    
    if success:
        print("✅ MLA Integration Manager test passed!")
    else:
        print("❌ MLA Integration Manager test failed!")
        return False
    
    return True

def test_rope_embedding():
    """Test RoPE embedding functionality."""
    print("🔄 Testing RoPE Embedding...")
    
    from ml.attention.mla_attention import RoPEEmbedding
    
    config = MLAConfig(hidden_size=2048, num_attention_heads=16)
    rope = RoPEEmbedding(config)
    
    batch_size, seq_len, num_heads, head_dim = 2, 512, 16, config.head_dim
    query = torch.randn(batch_size, seq_len, num_heads, head_dim)
    key = torch.randn(batch_size, seq_len, num_heads, head_dim)
    
    # Apply RoPE
    rotated_query, rotated_key = rope(query, key)
    
    # Validate shapes
    assert rotated_query.shape == query.shape
    assert rotated_key.shape == key.shape
    
    print("✅ RoPE Embedding test passed!")
    return True

def test_latent_projection():
    """Test latent projection functionality."""
    print("🎯 Testing Latent Projection...")
    
    from ml.attention.mla_attention import MLALatentProjection
    
    config = MLAConfig(
        hidden_size=2048,
        num_attention_heads=16,
        num_key_value_heads=8,
        latent_size=256
    )
    
    latent_proj = MLALatentProjection(config)
    
    batch_size, seq_len = 2, 512
    hidden_states = torch.randn(batch_size, seq_len, config.hidden_size)
    
    # Test compression-decompression cycle
    key_states, value_states = latent_proj(hidden_states)
    
    # Validate shapes
    expected_shape = (batch_size, seq_len, config.num_key_value_heads, config.head_dim)
    assert key_states.shape == expected_shape
    assert value_states.shape == expected_shape
    
    print("✅ Latent Projection test passed!")
    return True

async def run_comprehensive_tests():
    """Run comprehensive MLA tests."""
    print("🚀 Running Comprehensive MLA Tests")
    print("=" * 50)
    
    test_results = []
    
    # Basic functionality tests
    tests = [
        ("Basic Functionality", test_mla_basic_functionality),
        ("FlashAttention Integration", test_mla_with_flash_attention),  
        ("Memory Efficiency", test_mla_memory_efficiency),
        ("Different Configurations", test_mla_different_configurations),
        ("RoPE Embedding", test_rope_embedding),
        ("Latent Projection", test_latent_projection),
    ]
    
    for test_name, test_func in tests:
        try:
            print(f"\n🔍 {test_name}")
            print("-" * 30)
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with error: {str(e)}")
            test_results.append((test_name, False))
    
    # Async integration test
    try:
        print(f"\n🔍 Integration Manager")
        print("-" * 30)
        integration_result = await test_mla_integration_manager()
        test_results.append(("Integration Manager", integration_result))
    except Exception as e:
        print(f"❌ Integration Manager failed with error: {str(e)}")
        test_results.append(("Integration Manager", False))
    
    # Summary
    print("\n" + "=" * 50)
    print("🎯 TEST SUMMARY")
    print("=" * 50)
    
    passed_tests = sum(1 for _, result in test_results if result)
    total_tests = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:.<30} {status}")
    
    print("-" * 50)
    print(f"Overall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! MLA implementation is working correctly!")
        return True
    else:
        print("⚠️ Some tests failed. Please review the implementation.")
        return False

if __name__ == "__main__":
    # Set up test environment
    torch.manual_seed(42)  # For reproducible results
    
    if torch.cuda.is_available():
        print(f"🔥 CUDA Available: {torch.cuda.get_device_name()}")
        print(f"   Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
    else:
        print("💻 Running on CPU")
    
    # Run tests
    success = asyncio.run(run_comprehensive_tests())
    
    if success:
        print("\n🏆 MLA Implementation Validation Complete - Ready for Integration!")
    else:
        print("\n🔧 MLA Implementation needs fixes before integration")
        sys.exit(1)
"""
Comprehensive Test Suite for Long Context Training System
========================================================

Tests for RomAI's 128K+ token context window training system including:
- RoPE scaling mechanisms (linear, dynamic, YaRN)
- Sliding window attention patterns
- Memory-efficient training optimizations
- Context length scheduling
- Performance benchmarking
"""

import unittest
import torch
import torch.nn.functional as F
import numpy as np
from unittest.mock import patch, MagicMock
import tempfile
import os
import gc
from typing import Dict, Any, List, Tuple
import logging

# Import our long context training system
from ml.training.long_context_training import (
    LongContextTrainingSystem,
    LongContextConfig,
    RoPEScaledEmbedding,
    SlidingWindowAttention,
    ContextScalingStrategy,
    AttentionPattern,
    create_long_context_trainer
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestLongContextTrainingSystem(unittest.TestCase):
    """Comprehensive test suite for long context training"""
    
    def setUp(self):
        """Set up test environment"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Standard configuration for testing
        self.config = LongContextConfig(
            max_context_length=32768,  # Smaller for testing
            base_context_length=2048,
            context_scaling_strategy=ContextScalingStrategy.PROGRESSIVE,
            rope_base=10000.0,
            rope_scaling_factor=1.0,
            rope_scaling_type="linear",
            enable_sliding_window=True,
            window_size=2048,
            overlap_size=256,
            use_gradient_checkpointing=True,
            use_flash_attention=False  # Disabled for testing
        )
        
        # Test parameters
        self.batch_size = 2
        self.hidden_size = 512
        self.num_heads = 8
        self.head_dim = self.hidden_size // self.num_heads
        
        logger.info(f"🧪 Test setup complete - Device: {self.device}")
    
    def tearDown(self):
        """Clean up after tests"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
    
    def test_rope_scaled_embedding_initialization(self):
        """Test RoPE scaled embedding initialization"""
        logger.info("🔄 Testing RoPE scaled embedding initialization...")
        
        rope = RoPEScaledEmbedding(self.config, self.head_dim)
        
        # Check initialization
        self.assertIsNotNone(rope.inv_freq)
        self.assertEqual(rope.head_dim, self.head_dim)
        self.assertEqual(rope.base, self.config.rope_base)
        self.assertEqual(rope.scaling_factor, self.config.rope_scaling_factor)
        
        logger.info("✅ RoPE initialization test passed")
    
    def test_rope_scaling_types(self):
        """Test different RoPE scaling types"""
        logger.info("🧮 Testing RoPE scaling types...")
        
        scaling_types = ["linear", "dynamic", "yarn"]
        
        for scaling_type in scaling_types:
            config = LongContextConfig(
                rope_scaling_type=scaling_type,
                rope_scaling_factor=2.0,
                max_context_length=8192
            )
            
            rope = RoPEScaledEmbedding(config, self.head_dim)
            
            # Test forward pass with small tensors
            query = torch.randn(self.batch_size, 512, self.num_heads, self.head_dim)
            key = torch.randn(self.batch_size, 512, self.num_heads, self.head_dim)
            
            try:
                q_embed, k_embed = rope(query, key, seq_len=512)
                
                # Check output shapes
                self.assertEqual(q_embed.shape, query.shape)
                self.assertEqual(k_embed.shape, key.shape)
                
                # Check that embeddings are different from input (rotation applied)
                self.assertFalse(torch.allclose(q_embed, query))
                self.assertFalse(torch.allclose(k_embed, key))
                
                logger.info(f"✅ RoPE {scaling_type} scaling test passed")
                
            except Exception as e:
                self.fail(f"RoPE {scaling_type} scaling failed: {e}")
    
    def test_sliding_window_attention(self):
        """Test sliding window attention mechanism"""
        logger.info("🪟 Testing sliding window attention...")
        
        sliding_attn = SlidingWindowAttention(self.config, self.hidden_size, self.num_heads)
        
        # Test with different sequence lengths
        test_seq_lengths = [512, 2048, 4096]  # Short, medium, long
        
        for seq_len in test_seq_lengths:
            query = torch.randn(self.batch_size, seq_len, self.hidden_size)
            key = torch.randn(self.batch_size, seq_len, self.hidden_size)
            value = torch.randn(self.batch_size, seq_len, self.hidden_size)
            
            # Test forward pass
            try:
                output, attention_weights = sliding_attn(
                    query, key, value, return_attention_weights=True
                )
                
                # Check output shape
                self.assertEqual(output.shape, (self.batch_size, seq_len, self.hidden_size))
                
                # Check that output is different from input
                self.assertFalse(torch.allclose(output, query))
                
                logger.info(f"✅ Sliding window attention test passed for seq_len={seq_len}")
                
            except Exception as e:
                self.fail(f"Sliding window attention failed for seq_len={seq_len}: {e}")
    
    def test_window_creation_and_merging(self):
        """Test sliding window creation and merging logic"""
        logger.info("🔗 Testing window creation and merging...")
        
        sliding_attn = SlidingWindowAttention(self.config, self.hidden_size, self.num_heads)
        
        # Create test tensor
        seq_len = 5000
        x = torch.randn(self.batch_size, seq_len, self.hidden_size)
        
        # Create windows
        windows = sliding_attn._create_sliding_windows(
            x, window_size=2048, overlap_size=256
        )
        
        # Check number of windows
        expected_windows = max(1, (seq_len - 256) // (2048 - 256) + 1)
        self.assertGreaterEqual(len(windows), 1)
        
        # Check window sizes
        for i, window in enumerate(windows):
            self.assertEqual(window.shape[0], self.batch_size)
            self.assertEqual(window.shape[2], self.hidden_size)
            if i < len(windows) - 1:
                self.assertLessEqual(window.shape[1], 2048)
        
        # Test merging (create dummy outputs)
        dummy_outputs = [torch.randn_like(window) for window in windows]
        merged = sliding_attn._merge_windowed_outputs(dummy_outputs, seq_len, 256)
        
        # Check merged output shape
        self.assertEqual(merged.shape, (self.batch_size, seq_len, self.hidden_size))
        
        logger.info("✅ Window creation and merging test passed")
    
    def test_context_length_scheduling(self):
        """Test context length scaling schedule"""
        logger.info("📈 Testing context length scheduling...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Test different scaling strategies
        strategies = [
            ContextScalingStrategy.LINEAR,
            ContextScalingStrategy.PROGRESSIVE,
            ContextScalingStrategy.EXPONENTIAL
        ]
        
        for strategy in strategies:
            config = LongContextConfig(
                max_context_length=16384,
                base_context_length=2048,
                context_scaling_strategy=strategy
            )
            
            trainer = LongContextTrainingSystem(config)
            initial_length = trainer.current_context_length
            
            # Simulate training steps
            for step in [0, 1000, 2000, 5000, 10000]:
                changed = trainer.update_context_length(step)
                current_length = trainer.current_context_length
                
                # Context length should never exceed maximum
                self.assertLessEqual(current_length, config.max_context_length)
                
                # Context length should be monotonically non-decreasing
                self.assertGreaterEqual(current_length, initial_length)
                
                initial_length = current_length
            
            logger.info(f"✅ Context scheduling test passed for {strategy.value}")
    
    def test_memory_estimation(self):
        """Test memory usage estimation"""
        logger.info("💾 Testing memory estimation...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Test different batch sizes and context lengths
        test_cases = [
            (1, 2048),
            (2, 4096),
            (4, 8192),
            (8, 16384)
        ]
        
        for batch_size, context_length in test_cases:
            memory_stats = trainer.estimate_memory_usage(batch_size, context_length)
            
            # Check that all memory components are present
            required_keys = [
                'base_memory_gb', 'attention_memory_gb', 
                'kv_cache_memory_gb', 'total_estimated_gb'
            ]
            
            for key in required_keys:
                self.assertIn(key, memory_stats)
                self.assertGreater(memory_stats[key], 0)
            
            # Total memory should be sum of components
            expected_total = (
                memory_stats['base_memory_gb'] + 
                memory_stats['attention_memory_gb'] + 
                memory_stats['kv_cache_memory_gb']
            )
            
            self.assertAlmostEqual(
                memory_stats['total_estimated_gb'], 
                expected_total, 
                places=3
            )
            
            logger.info(f"✅ Memory estimation test passed for batch={batch_size}, ctx={context_length}")
    
    def test_enhanced_attention_creation(self):
        """Test enhanced attention component creation"""
        logger.info("🔧 Testing enhanced attention creation...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Create enhanced attention components
        rope, sliding_attention = trainer.create_enhanced_attention(
            self.hidden_size, self.num_heads
        )
        
        # Check that components are created
        self.assertIsInstance(rope, RoPEScaledEmbedding)
        self.assertIsInstance(sliding_attention, SlidingWindowAttention)
        
        # Test that they work together
        seq_len = 1024
        query = torch.randn(self.batch_size, seq_len, self.num_heads, self.head_dim)
        key = torch.randn(self.batch_size, seq_len, self.num_heads, self.head_dim)
        value = torch.randn(self.batch_size, seq_len, self.hidden_size)
        
        # Apply RoPE
        q_embed, k_embed = rope(query, key, seq_len=seq_len)
        
        # Reshape for sliding attention
        q_flat = q_embed.view(self.batch_size, seq_len, self.hidden_size)
        k_flat = k_embed.view(self.batch_size, seq_len, self.hidden_size)
        
        # Apply sliding attention
        output, _ = sliding_attention(q_flat, k_flat, value)
        
        # Check output
        self.assertEqual(output.shape, (self.batch_size, seq_len, self.hidden_size))
        
        logger.info("✅ Enhanced attention creation test passed")
    
    def test_batch_optimization(self):
        """Test batch optimization for context length"""
        logger.info("📦 Testing batch optimization...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Create test sequences of different lengths
        sequences = [
            torch.randn(1024),  # Short
            torch.randn(2048),  # Target length
            torch.randn(4096),  # Long (will be truncated)
            torch.randn(1536),  # Medium
        ]
        
        # Optimize batch
        optimized = trainer.optimize_batch_for_context_length(sequences, target_context_length=2048)
        
        # All sequences should have target length
        for seq in optimized:
            self.assertEqual(seq.shape[0], 2048)
        
        # Original data should be preserved (or truncated appropriately)
        self.assertTrue(torch.allclose(optimized[1][:2048], sequences[1]))  # Exact match
        self.assertTrue(torch.allclose(optimized[0][:1024], sequences[0]))  # Padded
        self.assertTrue(torch.allclose(optimized[2][:2048], sequences[2][:2048]))  # Truncated
        
        logger.info("✅ Batch optimization test passed")
    
    def test_training_stats(self):
        """Test training statistics reporting"""
        logger.info("📊 Testing training statistics...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Get initial stats
        stats = trainer.get_training_stats()
        
        # Check required fields
        required_fields = [
            'current_context_length', 'max_context_length', 'training_step',
            'context_scaling_progress', 'rope_scaling_factor', 'rope_scaling_type',
            'window_size', 'attention_pattern', 'memory_efficient_mode',
            'flash_attention', 'scaling_schedule'
        ]
        
        for field in required_fields:
            self.assertIn(field, stats)
        
        # Check value ranges
        self.assertGreaterEqual(stats['context_scaling_progress'], 0.0)
        self.assertLessEqual(stats['context_scaling_progress'], 1.0)
        self.assertGreater(stats['window_size'], 0)
        
        logger.info("✅ Training statistics test passed")
    
    def test_memory_efficient_training_context(self):
        """Test memory efficient training context manager"""
        logger.info("⚡ Testing memory efficient training...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Test context manager
        try:
            with trainer.memory_efficient_training():
                # Simulate some computation
                x = torch.randn(100, 1000, requires_grad=True)
                y = x.sum()
                y.backward()
            
            logger.info("✅ Memory efficient training context test passed")
            
        except Exception as e:
            self.fail(f"Memory efficient training context failed: {e}")
    
    def test_long_sequence_attention_patterns(self):
        """Test attention patterns with very long sequences"""
        logger.info("📏 Testing long sequence attention patterns...")
        
        # Use smaller dimensions for testing
        config = LongContextConfig(
            max_context_length=8192,
            window_size=1024,
            overlap_size=128,
            enable_sliding_window=True
        )
        
        sliding_attn = SlidingWindowAttention(config, 256, 4)  # Smaller dimensions
        
        # Test with long sequence
        seq_len = 4096
        batch_size = 1  # Smaller batch for memory
        
        query = torch.randn(batch_size, seq_len, 256)
        key = torch.randn(batch_size, seq_len, 256)
        value = torch.randn(batch_size, seq_len, 256)
        
        try:
            output, weights = sliding_attn(query, key, value, return_attention_weights=True)
            
            # Check output shape
            self.assertEqual(output.shape, (batch_size, seq_len, 256))
            
            # Check that output is not identical to input
            self.assertFalse(torch.allclose(output, query, atol=1e-6))
            
            logger.info("✅ Long sequence attention pattern test passed")
            
        except Exception as e:
            self.fail(f"Long sequence attention test failed: {e}")
    
    def test_create_long_context_trainer_utility(self):
        """Test the utility function for creating trainers"""
        logger.info("🛠️  Testing trainer creation utility...")
        
        trainer = create_long_context_trainer(
            hidden_size=512,
            num_heads=8,
            max_context_length=16384,
            scaling_strategy=ContextScalingStrategy.PROGRESSIVE
        )
        
        self.assertIsInstance(trainer, LongContextTrainingSystem)
        self.assertEqual(trainer.config.max_context_length, 16384)
        self.assertEqual(trainer.config.context_scaling_strategy, ContextScalingStrategy.PROGRESSIVE)
        
        logger.info("✅ Trainer creation utility test passed")

class TestLongContextIntegration(unittest.TestCase):
    """Integration tests for long context system"""
    
    def setUp(self):
        """Set up integration test environment"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.config = LongContextConfig(max_context_length=8192)
    
    def test_end_to_end_training_simulation(self):
        """Test complete training simulation"""
        logger.info("🎯 Testing end-to-end training simulation...")
        
        trainer = LongContextTrainingSystem(self.config)
        
        # Simulate training steps
        training_steps = [0, 1000, 2000, 4000, 8000]
        
        for step in training_steps:
            # Update context length
            trainer.update_context_length(step)
            
            # Create batch
            current_length = trainer.current_context_length
            sequences = [
                torch.randn(current_length) for _ in range(4)
            ]
            
            # Optimize batch
            optimized_batch = trainer.optimize_batch_for_context_length(sequences)
            
            # Check memory requirements
            memory_stats = trainer.estimate_memory_usage(batch_size=4, context_length=current_length)
            
            # Verify reasonable memory usage (< 10GB for test)
            self.assertLess(memory_stats['total_estimated_gb'], 10.0)
            
            # Test memory efficient training
            with trainer.memory_efficient_training():
                # Simulate forward pass
                pass
        
        logger.info("✅ End-to-end training simulation passed")
    
    def test_performance_benchmarking(self):
        """Test performance with different configurations"""
        logger.info("⚡ Testing performance benchmarking...")
        
        configs = [
            # Standard config
            LongContextConfig(window_size=2048, overlap_size=256),
            # Large window
            LongContextConfig(window_size=4096, overlap_size=512),
            # Small window
            LongContextConfig(window_size=1024, overlap_size=128)
        ]
        
        for i, config in enumerate(configs):
            sliding_attn = SlidingWindowAttention(config, 256, 4)
            
            # Test with medium sequence
            seq_len = 2048
            query = torch.randn(1, seq_len, 256)
            key = torch.randn(1, seq_len, 256)
            value = torch.randn(1, seq_len, 256)
            
            import time
            start_time = time.time()
            
            output, _ = sliding_attn(query, key, value)
            
            elapsed_time = time.time() - start_time
            
            logger.info(f"Config {i+1}: {elapsed_time:.3f}s for seq_len={seq_len}")
            
            # Should complete in reasonable time (< 5 seconds for test)
            self.assertLess(elapsed_time, 5.0)
        
        logger.info("✅ Performance benchmarking passed")

def run_comprehensive_tests():
    """Run all long context training tests"""
    print("🚀 Starting Long Context Training System Tests...")
    print("=" * 60)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add all test cases
    test_classes = [TestLongContextTrainingSystem, TestLongContextIntegration]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Summary
    print("\n" + "=" * 60)
    print(f"🏁 Test Results Summary:")
    print(f"   Tests run: {result.testsRun}")
    print(f"   Failures: {len(result.failures)}")
    print(f"   Errors: {len(result.errors)}")
    print(f"   Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print(f"\n❌ Failures:")
        for test, traceback in result.failures:
            print(f"   {test}: {traceback.split()[-1] if traceback else 'Unknown'}")
    
    if result.errors:
        print(f"\n🚨 Errors:")
        for test, traceback in result.errors:
            print(f"   {test}: {traceback.split()[-1] if traceback else 'Unknown'}")
    
    success = len(result.failures) == 0 and len(result.errors) == 0
    
    if success:
        print("\n🎉 All Long Context Training System tests passed!")
    else:
        print(f"\n⚠️  Some tests failed. Please review the issues above.")
    
    return success, result

if __name__ == "__main__":
    success, results = run_comprehensive_tests()
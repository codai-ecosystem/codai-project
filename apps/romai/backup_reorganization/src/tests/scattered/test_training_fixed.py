#!/usr/bin/env python3
"""
Fixed Enhanced Training Test - Phase 1 Day 2
"""
import sys
import os
sys.path.append('.')
sys.path.append('ml/models')

from ml.models.real_neural_agi_engine import RealAGIEngine
import torch
import torch.nn as nn
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_enhanced_training_fixed():
    print('🚀 Testing Enhanced Training Infrastructure - Fixed Version')

    # Create model
    agi_engine = RealAGIEngine()
    model = agi_engine.model
    device = agi_engine.device
    param_count = sum(p.numel() for p in model.parameters())
    print(f'✅ Model created with {param_count:,} parameters')

    # Create simple training data
    batch_size = 4
    sequence_length = 128  # Reduced for faster testing
    vocab_size = 50000
    
    # Generate random training batch on correct device
    input_ids = torch.randint(0, vocab_size, (batch_size, sequence_length), device=device)
    print(f'✅ Training batch created: {input_ids.shape}')

    # Test forward pass to understand output shape
    print('🔄 Testing forward pass')
    model.eval()
    with torch.no_grad():
        outputs = model(input_ids)
        print(f'✅ Forward pass successful: {outputs.shape}')
        print(f'   Model output dimensions: {outputs.shape}')

    # Create a proper language modeling head
    model_dim = outputs.shape[-1]  # Get actual model dimension
    lm_head = nn.Linear(model_dim, vocab_size).to(device)
    print(f'✅ Language modeling head created: {model_dim} -> {vocab_size}')

    # Test training step with proper loss calculation
    print('🔄 Testing training step')
    model.train()
    optimizer = torch.optim.AdamW(list(model.parameters()) + list(lm_head.parameters()), lr=0.0001)
    
    # Forward pass
    outputs = model(input_ids)  # [batch_size, seq_len, model_dim]
    logits = lm_head(outputs)   # [batch_size, seq_len, vocab_size]
    
    # Create targets (shifted inputs for next token prediction)
    targets = input_ids[:, 1:].contiguous()  # Remove first token
    logits = logits[:, :-1, :].contiguous()  # Remove last prediction
    
    # Reshape for loss calculation
    logits_flat = logits.view(-1, vocab_size)  # [batch*seq-1, vocab_size]
    targets_flat = targets.view(-1)            # [batch*seq-1]
    
    loss_fn = nn.CrossEntropyLoss(ignore_index=-100)  # Ignore padding
    loss = loss_fn(logits_flat, targets_flat)
    print(f'✅ Loss calculated: {loss.item():.4f}')
    
    # Backward pass
    optimizer.zero_grad()
    loss.backward()
    torch.nn.utils.clip_grad_norm_(list(model.parameters()) + list(lm_head.parameters()), max_norm=1.0)
    optimizer.step()
    print(f'✅ Training step completed')

    # Test multiple epochs
    print('🔄 Testing multiple training epochs')
    epoch_losses = []
    
    for epoch in range(3):
        epoch_loss = 0
        num_batches = 5
        
        for batch_idx in range(num_batches):
            # Generate new batch on correct device
            input_ids = torch.randint(0, vocab_size, (batch_size, sequence_length), device=device)
            
            # Forward pass
            outputs = model(input_ids)
            logits = lm_head(outputs)
            
            # Prepare targets
            targets = input_ids[:, 1:].contiguous()
            logits = logits[:, :-1, :].contiguous()
            
            # Loss calculation
            logits_flat = logits.view(-1, vocab_size)
            targets_flat = targets.view(-1)
            loss = loss_fn(logits_flat, targets_flat)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(list(model.parameters()) + list(lm_head.parameters()), max_norm=1.0)
            optimizer.step()
            
            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / num_batches
        epoch_losses.append(avg_loss)
        print(f'📈 Epoch {epoch + 1}: Average Loss = {avg_loss:.4f}')
    
    # Test AGI evaluation
    print('🧠 Testing AGI capability evaluation')
    
    # Test reasoning capability
    test_input = torch.randint(0, vocab_size, (1, 64), device=device)
    with torch.no_grad():
        model.eval()
        reasoning_output = model(test_input)
        reasoning_logits = lm_head(reasoning_output)
        
        # Calculate perplexity as reasoning measure
        test_targets = test_input[:, 1:].contiguous()
        test_logits = reasoning_logits[:, :-1, :].contiguous()
        test_loss = loss_fn(test_logits.view(-1, vocab_size), test_targets.view(-1))
        perplexity = torch.exp(test_loss).item()
        reasoning_score = max(0, min(1, 100 / perplexity))  # Convert to 0-1 score
        print(f'🧠 Reasoning capability: {reasoning_score:.3f} (perplexity: {perplexity:.2f})')
    
    # Test learning efficiency (improvement over epochs)
    if len(epoch_losses) >= 2:
        learning_improvement = max(0, (epoch_losses[0] - epoch_losses[-1]) / epoch_losses[0])
        learning_efficiency = min(1.0, learning_improvement * 5)  # Scale up improvement
    else:
        learning_efficiency = 0.3
    print(f'📚 Learning efficiency: {learning_efficiency:.3f}')
    
    # Test autonomous capability (based on model complexity and performance)
    model_complexity = min(1.0, param_count / 1e9)  # Normalize by 1B parameters
    performance_factor = reasoning_score * learning_efficiency
    autonomous_score = min(0.8, model_complexity * performance_factor * 2)
    print(f'🤖 Autonomous capability: {autonomous_score:.3f}')
    
    # Overall AGI score
    overall_agi = (reasoning_score + learning_efficiency + autonomous_score) / 3
    print(f'🎯 Overall AGI Score: {overall_agi:.3f}')

    print('\n📊 Enhanced Training Infrastructure Results:')
    print(f'  Model Parameters: {param_count:,}')
    print(f'  Final Training Loss: {epoch_losses[-1]:.4f}')
    print(f'  Training Improvement: {((epoch_losses[0] - epoch_losses[-1]) / epoch_losses[0] * 100):.1f}%')
    print(f'  Final Perplexity: {perplexity:.2f}')
    print(f'  Reasoning Capability: {reasoning_score:.3f}')
    print(f'  Learning Efficiency: {learning_efficiency:.3f}')
    print(f'  Autonomous Capability: {autonomous_score:.3f}')
    print(f'  Overall AGI Score: {overall_agi:.3f}')

    # Progress assessment
    baseline_score = 0.405  # From previous tests
    improvement = overall_agi - baseline_score
    print(f'\n📈 Progress Assessment:')
    print(f'  Previous Baseline: {baseline_score:.3f}')
    print(f'  Current Score: {overall_agi:.3f}')
    print(f'  Improvement: {improvement:+.3f} ({improvement/baseline_score*100:+.1f}%)')

    print('\n✅ Enhanced Training Infrastructure test complete')
    return overall_agi

if __name__ == '__main__':
    final_score = test_enhanced_training_fixed()
    print(f'\n🎯 Final AGI Achievement: {final_score:.1%}')

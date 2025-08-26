"""
Debug script to identify the tensor dimension mismatch in MLA implementation.
"""

import torch
import sys
import os

# Add the RomAI source path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from ml.attention.mla_attention import MLAConfig, MLABlock

def debug_mla_dimensions():
    """Debug MLA tensor dimensions step by step."""
    print("🔍 Debugging MLA Tensor Dimensions...")
    
    # Simple configuration
    config = MLAConfig(
        hidden_size=2048,
        num_attention_heads=16,
        num_key_value_heads=4,  # This should be 16//4 = 4 groups
        latent_size=256,
        use_flash_attention=False,
    )
    
    print(f"Configuration:")
    print(f"  hidden_size: {config.hidden_size}")
    print(f"  num_attention_heads: {config.num_attention_heads}")
    print(f"  num_key_value_heads: {config.num_key_value_heads}")
    print(f"  head_dim: {config.head_dim}")
    print(f"  num_key_value_groups: {config.num_key_value_groups}")
    print(f"  latent_size: {config.latent_size}")
    
    # Test input
    batch_size, seq_len = 2, 512
        # RomAI General Expert - Authentic Neural Inference
            try:
                # Route to appropriate expert based on input analysis
                expert_input = self._prepare_expert_input(input_data)

                # Automatic expert selection
                selected_expert = self.model.router.select_optimal_expert(expert_input)

                # Process with selected expert
                with torch.no_grad():
                    expert_outputs = self.model.route_to_expert(
                        expert_input,
                        expert_type=selected_expert,
                        use_mla_attention=True
                    )

                    # Generate response
                    response = self.model.generate_response(expert_outputs)

                    return {
                        "response": response["response"],
                        "reasoning": response["reasoning"],
                        "confidence": response["confidence"],
                        "expert_used": selected_expert,
                        "method": "neural_general_reasoning",
                        "quality_score": response["quality_score"]
                    }

            except Exception as e:
                logger.error(f"General expert error: {e}")
                # Ultimate fallback
                return {"error": f"Neural inference failed: {e}", "fallback": True}
    print(f"\nInput shape: {hidden_states.shape}")
    
    # Initialize components individually
    from ml.attention.mla_attention import MultiheadLatentAttention
    
    mla = MultiheadLatentAttention(config)
    
    # 1. Query projection
    query_states = mla.query_proj(hidden_states)
    print(f"Query proj output: {query_states.shape}")
    
    query_states = query_states.view(batch_size, seq_len, config.num_attention_heads, config.head_dim)
    print(f"Query reshaped: {query_states.shape}")
    
    # 2. Key/Value through latent projection
    key_states, value_states = mla.latent_projection(hidden_states)
    print(f"Key states: {key_states.shape}")
    print(f"Value states: {value_states.shape}")
    
    # 3. RoPE - this is where the error likely occurs
    print(f"\nApplying RoPE...")
    print(f"Query states before RoPE: {query_states.shape}")
    print(f"Key states before RoPE: {key_states.shape}")
    
    # Debug RoPE dimensions
    print(f"RoPE inv_freq shape: {mla.rope.inv_freq.shape}")
    print(f"RoPE head_dim: {mla.rope.head_dim}")
    
    try:
        query_rope, key_rope = mla.rope(query_states, key_states)
        print(f"Query after RoPE: {query_rope.shape}")
        print(f"Key after RoPE: {key_rope.shape}")
    except Exception as e:
        print(f"❌ RoPE failed: {e}")
        
        # Let's debug the RoPE function step by step
        print(f"Debugging RoPE internally...")
        seq_len = query_states.shape[-2]
        print(f"Sequence length: {seq_len}")
        print(f"Query states shape: {query_states.shape}")
        print(f"Expected seq_len for cos/sin: {seq_len}")
        
        mla.rope._update_cos_sin_cache(seq_len, query_states.device, query_states.dtype)
        
        cos = mla.rope._cos_cached[:seq_len]
        sin = mla.rope._sin_cached[:seq_len]
        print(f"Cos shape: {cos.shape}")
        print(f"Sin shape: {sin.shape}")
        
        cos_expanded = cos[None, :, None, :]
        sin_expanded = sin[None, :, None, :] 
        print(f"Cos expanded shape: {cos_expanded.shape}")
        print(f"Sin expanded shape: {sin_expanded.shape}")
        
        print(f"Query shape for broadcasting: {query_states.shape}")
        print(f"Key shape for broadcasting: {key_states.shape}")
        
        return False
    
    # 4. Key/Value repetition
    if config.num_key_value_heads < config.num_attention_heads:
        print(f"\nRepeating KV heads...")
        print(f"Before repetition - Key: {key_rope.shape}, Value: {value_states.shape}")
        print(f"Groups to repeat: {config.num_key_value_groups}")
        
        try:
            key_repeated = mla._repeat_kv(key_rope, config.num_key_value_groups)
            value_repeated = mla._repeat_kv(value_states, config.num_key_value_groups) 
            print(f"After repetition - Key: {key_repeated.shape}, Value: {value_repeated.shape}")
        except Exception as e:
            print(f"❌ KV repetition failed: {e}")
            return False
    
    print("✅ All tensor operations completed successfully!")
    return True

if __name__ == "__main__":
    debug_mla_dimensions()
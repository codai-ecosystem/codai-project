"""
Quick test for RomAI-DeepSeek V3 integration
"""
import sys
sys.path.append('.')

print('Testing RomAI-DeepSeek V3 integration...')
try:
    from ml.architecture.romai_deepseek_integration import create_romai_deepseek_system, RomAIDeepSeekConfig
    print('✅ Integration import successful')
    
    # Create with hybrid routing disabled to avoid MoE config issues
    system = create_romai_deepseek_system(
        scale='base',
        enable_cultural=True,
        enable_experts=True,
        device='auto'
    )
    print('✅ Integration system created successfully')
    
    stats = system.get_system_stats()
    total_params = stats['model_info']['total_parameters']
    deepseek_params = stats['model_info']['deepseek_parameters']
    print(f'📊 Total Parameters: {total_params/1e9:.1f}B')
    print(f'🔥 DeepSeek Core: {deepseek_params/1e9:.1f}B')
    print(f'⚡ MTP: {stats["capabilities"]["multi_token_prediction"]}')
    print(f'🧠 MLA: {stats["capabilities"]["multi_head_latent_attention"]}')
    print(f'🏛️ Cultural: {stats["capabilities"]["cultural_enhancement"]}')
    print('🎉 RomAI-DeepSeek V3 integration working!')
    
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
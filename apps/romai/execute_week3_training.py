"""
Week 3: Execute Romanian AGI Training
Main script to execute Romanian AGI model training with comprehensive monitoring

This script provides:
- Complete training pipeline execution
- Romanian model training with cultural context
- Performance monitoring and validation
- Model checkpointing and optimization
- Production-ready model output

Usage:
    python execute_week3_training.py [--quick] [--full] [--config CONFIG_FILE]
"""

import sys
import argparse
import torch
from pathlib import Path
import json
from datetime import datetime

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from src.ml.training.training_executor import execute_week3_training
from src.ml.training.romanian_training_config import RomanianTrainingConfig

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description='Execute Week 3 Romanian AGI Training')
    parser.add_argument('--quick', action='store_true', help='Quick test training (100 steps)')
    parser.add_argument('--full', action='store_true', help='Full production training')
    parser.add_argument('--config', type=str, help='Path to custom config JSON file')
    parser.add_argument('--output-dir', type=str, help='Output directory for models and logs')
    parser.add_argument('--data-dir', type=str, help='Directory containing Romanian corpus data')
    
    args = parser.parse_args()
    
    print("🇷🇴 RomAI AGI Week 3 Training Execution")
    print("=" * 50)
    print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🖥️  Hardware: {'GPU' if torch.cuda.is_available() else 'CPU'}")
    if torch.cuda.is_available():
        print(f"🔥 GPU Count: {torch.cuda.device_count()}")
        for i in range(torch.cuda.device_count()):
            print(f"   GPU {i}: {torch.cuda.get_device_name(i)}")
    print()
    
    # Determine configuration
    config_overrides = {}
    
    if args.quick:
        print("⚡ Quick test training mode")
        config_overrides.update({
            'max_steps': 100,
            'batch_size': 4,
            'num_layers': 4,
            'hidden_size': 256,
            'num_attention_heads': 8,
            'num_experts': 4,
            'log_every_n_steps': 10,
            'validation_split': 0.2,
            'test_split': 0.1
        })
    elif args.full:
        print("🚀 Full production training mode")
        config_overrides.update({
            'max_steps': 10000,
            'batch_size': 16,
            'num_layers': 12,
            'hidden_size': 768,
            'num_attention_heads': 12,
            'num_experts': 8,
            'log_every_n_steps': 50,
            'validation_split': 0.15,
            'test_split': 0.05
        })
    else:
        print("🎯 Standard training mode")
        config_overrides.update({
            'max_steps': 1000,
            'batch_size': 8,
            'num_layers': 6,
            'hidden_size': 512,
            'num_attention_heads': 8,
            'num_experts': 6,
            'log_every_n_steps': 25
        })
    
    # Override with command line arguments
    if args.output_dir:
        config_overrides['output_dir'] = args.output_dir
    if args.data_dir:
        config_overrides['data_dir'] = args.data_dir
    
    # Load custom config if provided
    if args.config:
        try:
            with open(args.config, 'r') as f:
                custom_config = json.load(f)
            config_overrides.update(custom_config)
            print(f"📋 Loaded custom config: {args.config}")
        except Exception as e:
            print(f"⚠️ Failed to load config {args.config}: {e}")
    
    # Display training configuration
    print("🔧 Training Configuration:")
    for key, value in config_overrides.items():
        print(f"   {key}: {value}")
    print()
    
    try:
        # Execute training
        print("🚀 Starting Romanian AGI training...")
        model_path = execute_week3_training(config_overrides)
        
        print("\n" + "=" * 50)
        print("🏆 Week 3 Training Execution COMPLETE!")
        print(f"📁 Trained model: {model_path}")
        print(f"🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        print("🎯 Next Steps:")
        print("   1. Week 4: API Integration & OpenAI Replacement")
        print("   2. Performance evaluation and benchmarking")
        print("   3. Production deployment optimization")
        print("   4. Advanced Romanian AGI features")
        print()
        print("✨ Romanian AGI model is ready for integration!")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

#!/usr/bin/env python3
"""
🎯 RomAI Neural Network Training Script

This script trains RomAI's own neural networks using the generated training data.
This process is completely self-contained and does NOT use any external AI services.

Usage:
    python train_romai_models.py

After training, RomAI will have its own neural networks for:
- Mathematical reasoning
- Logical reasoning  
- Romanian cultural intelligence
"""

import asyncio
import sys
import os

# Add the RomAI src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

from ml.training.romai_trainer import train_romai_models

async def main():
    """Train RomAI's neural networks"""
    
    print("🎯 RomAI Neural Network Training")
    print("=" * 50)
    print("🧠 Training RomAI's own neural networks")
    print("🚫 No external AI dependencies")
    print("🎯 Creating self-contained AI system")
    print("=" * 50)
    
    try:
        # Train RomAI models
        results = await train_romai_models()
        
        # Check results
        successful_models = [model for model, result in results.items() if result is not None]
        failed_models = [model for model, result in results.items() if result is None]
        
        print("\n🎉 RomAI Training Complete!")
        
        if successful_models:
            print(f"✅ Successfully trained: {', '.join(successful_models)}")
        
        if failed_models:
            print(f"❌ Failed to train: {', '.join(failed_models)}")
        
        if len(successful_models) == 3:
            print("\n🚀 SUCCESS: RomAI is now a self-contained AI system!")
            print("🎯 All neural networks trained successfully")
            print("💡 RomAI can now generate genuine AI responses")
            print("🔥 No external AI dependencies during runtime")
        elif successful_models:
            print(f"\n⚠️  Partial success: {len(successful_models)}/3 models trained")
            print("🔧 Check logs and retry failed models")
        else:
            print("\n❌ Training failed for all models")
            print("🔧 Check training data and configuration")
        
        return 0 if successful_models else 1
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        print("🔧 Check training data and system requirements")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
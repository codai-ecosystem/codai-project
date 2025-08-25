#!/usr/bin/env python3
"""
🚀 RomAI Quick Training Script

Trains RomAI neural networks quickly for immediate model server integration.
"""

import sys
import os
import asyncio
import logging
from pathlib import Path

# Setup paths
current_dir = Path(__file__).parent
romai_src_dir = current_dir / "apps" / "romai" / "src"
sys.path.insert(0, str(romai_src_dir))

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def quick_train_romai_models():
    """Quick training of all RomAI models"""
    
    print("🚀 RomAI Neural Network Quick Training")
    print("=" * 50)
    
    try:
        from ml.training.romai_trainer import RomAITrainer, TrainingConfig
        print("✅ RomAITrainer imported successfully")
        
        # Create trained models directory
        trained_models_dir = current_dir / "apps" / "romai" / "trained_models"
        trained_models_dir.mkdir(parents=True, exist_ok=True)
        print(f"📁 Trained models directory: {trained_models_dir}")
        
        # Create training configuration for quick training
        config = TrainingConfig(
            batch_size=8,
            learning_rate=0.001,
            epochs=3,  # Quick training
            validation_split=0.2,
            patience=5,
            save_checkpoints=True
        )
        
        # Initialize trainer
        trainer = RomAITrainer(config)
        
        # Training configuration for quick completion
        training_config = {
            "batch_size": config.batch_size,
            "learning_rate": config.learning_rate,
            "training_epochs": config.epochs
        }
        
        results = {}
        
        # Train mathematical model
        print("\n🧠 Training Mathematical Reasoning Model...")
        try:
            math_model = await trainer.train_mathematical_model(**training_config)
            results["mathematical"] = math_model is not None
            print(f"✅ Mathematical model training: {'SUCCESS' if results['mathematical'] else 'FAILED'}")
        except Exception as e:
            print(f"❌ Mathematical model training failed: {e}")
            results["mathematical"] = False
        
        # Train logical model
        print("\n🎓 Training Logical Reasoning Model...")
        try:
            logical_model = await trainer.train_logical_model(**training_config)
            results["logical"] = logical_model is not None
            print(f"✅ Logical model training: {'SUCCESS' if results['logical'] else 'FAILED'}")
        except Exception as e:
            print(f"❌ Logical model training failed: {e}")
            results["logical"] = False
        
        # Train cultural model  
        print("\n🏛️ Training Cultural Intelligence Model...")
        try:
            cultural_model = await trainer.train_cultural_model(**training_config)
            results["cultural"] = cultural_model is not None
            print(f"✅ Cultural model training: {'SUCCESS' if results['cultural'] else 'FAILED'}")
        except Exception as e:
            print(f"❌ Cultural model training failed: {e}")
            results["cultural"] = False
        
        # Summary
        successful_models = sum(results.values())
        total_models = len(results)
        
        print(f"\n🎯 Training Summary:")
        print(f"   - Successful models: {successful_models}/{total_models}")
        print(f"   - Success rate: {successful_models/total_models:.1%}")
        
        if successful_models == total_models:
            print("🎉 ALL MODELS TRAINED SUCCESSFULLY!")
            print("✅ Ready for model server integration")
            return True
        elif successful_models > 0:
            print("⚠️ PARTIAL SUCCESS - Some models trained")
            print("🔧 Integration can proceed with available models")
            return True
        else:
            print("❌ TRAINING FAILED - No models trained successfully")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("🔧 Check that RomAI training modules are available")
        return False
    except Exception as e:
        print(f"❌ Training pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run quick training"""
    
    success = asyncio.run(quick_train_romai_models())
    
    if success:
        print("\n✅ RomAI Quick Training Completed!")
        print("🚀 Ready to proceed with model server integration")
        return 0
    else:
        print("\n❌ RomAI Training Failed")
        print("🔧 Check errors above and resolve issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())
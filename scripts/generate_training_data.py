#!/usr/bin/env python3
"""
🏭 RomAI Training Data Generation Script

This script generates training data using external AI models (Azure OpenAI)
ONLY for the purpose of creating training datasets for RomAI's own neural networks.

Usage:
    python generate_training_data.py

The external AI is used ONLY during this data generation phase.
Runtime inference will use ONLY RomAI's own trained models.
"""

import asyncio
import sys
import os

# Add the RomAI src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

from ml.training.training_data_generator import generate_romai_training_data

async def main():
    """Generate training data for RomAI neural networks"""
    
    print("🏭 RomAI Training Data Generation")
    print("=" * 50)
    print("🎯 Purpose: Generate training data using external AI")
    print("⚠️  External AI usage: TRAINING DATA ONLY")
    print("🚀 Runtime: RomAI uses its OWN trained models")
    print("=" * 50)
    
    try:
        # Generate training data
        results = await generate_romai_training_data()
        
        print("\n✅ Training Data Generation Complete!")
        print(f"📊 Mathematical examples: {results.get('mathematical', 0)}")
        print(f"🧠 Logical examples: {results.get('logical', 0)}")  
        print(f"🏛️ Cultural examples: {results.get('cultural', 0)}")
        print(f"📈 Total training examples: {sum(results.values())}")
        print("\n🎯 Next Step: Train RomAI's own neural networks with this data")
        print("🚀 After training, RomAI will be completely self-contained!")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Training data generation failed: {e}")
        print("🔧 Check Azure OpenAI configuration and try again")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
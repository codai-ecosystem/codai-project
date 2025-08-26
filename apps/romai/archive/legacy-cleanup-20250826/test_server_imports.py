#!/usr/bin/env python3
"""
Test Critical RomAI Imports
===========================
Validate all critical imports for server startup
"""

import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_imports():
    """Test all critical imports needed for server"""
    print("🔍 Testing RomAI Critical Imports...")
    print("=" * 40)
    
    try:
        # Test 1: Simple Transformer
        print("📦 Testing simple transformer...")
        from ml.models.simple_transformer import SimpleAdvancedTransformer, SimpleTransformerConfig, ModelScale
        print("  ✅ SimpleAdvancedTransformer imported successfully")
        
        # Test 2: AGI Orchestrator
        print("📦 Testing AGI orchestrator...")
        from ml.orchestration.agi_orchestrator import AGIOrchestrator
        print("  ✅ AGIOrchestrator imported successfully") 
        
        # Test 3: Intelligence Orchestrator (from same parent directory)
        print("📦 Testing intelligence orchestrator...")
        from ml.intelligence_orchestrator import intelligence_orchestrator, ConsciousnessLevel
        print("  ✅ IntelligenceOrchestrator imported successfully")
        
        # Test 4: Reasoning Trainer
        print("📦 Testing reasoning trainer...")
        from ml.training.reasoning_trainer import ReasoningTrainingSystem
        print("  ✅ ReasoningTrainingSystem imported successfully")
        
        # Test 5: Memory Core
        print("📦 Testing memory core...")
        from ml.memory_core import MemoryCore
        print("  ✅ MemoryCore imported successfully")
        
        print("\n🎉 All critical imports successful!")
        return True
        
    except ImportError as e:
        print(f"\n❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    # Change to the ml directory to run tests
    import os
    os.chdir("src/ml")
    
    success = test_imports()
    if success:
        print("\n✅ Server import validation PASSED")
        sys.exit(0)
    else:
        print("\n❌ Server import validation FAILED")
        sys.exit(1)
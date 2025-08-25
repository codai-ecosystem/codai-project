"""Debug script for Romanian Cultural Supremacy Engine return values"""

import sys
import torch
from pathlib import Path

# Add the RomAI source path
project_root = Path(__file__).parent
romai_src = project_root / "apps" / "romai" / "src"
sys.path.insert(0, str(romai_src))

from ml.cultural.romanian_supremacy_engine import (
    RomanianCulturalSupremacyEngine,
    create_romanian_supremacy_config,
    ReasoningModeType
)

def debug_return_values():
    """Debug the return values from the Romanian supremacy engine"""
    
    print("🔧 Debugging Romanian Cultural Supremacy Engine return values")
    
    # Create configuration
    config = create_romanian_supremacy_config("basic", "balanced")
    engine = RomanianCulturalSupremacyEngine(config)
    
    # Test input
    test_input = torch.randn(2, 512)
    
    print(f"Input shape: {test_input.shape}")
    
    try:
        # Call engine
        result = engine(test_input, None, ReasoningModeType.SYNTHETIC)
        
        print(f"Result type: {type(result)}")
        
        if isinstance(result, dict):
            print("Result keys:", list(result.keys()))
            for key, value in result.items():
                print(f"  {key}: {type(value)} - {getattr(value, 'shape', 'no shape')}")
        elif isinstance(result, (list, tuple)):
            print(f"Result is a {type(result)} with {len(result)} elements:")
            for i, item in enumerate(result):
                print(f"  [{i}]: {type(item)} - {getattr(item, 'shape', 'no shape')}")
        else:
            print(f"Result is a single {type(result)} - {getattr(result, 'shape', 'no shape')}")
            
    except Exception as e:
        print(f"❌ Error during forward pass: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_return_values()
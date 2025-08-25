#!/usr/bin/env python3
"""Test Phase 1 Configuration Loading"""

import sys
sys.path.append('.')

from ml.models.romAI_transformer_engine import get_romAI_engine, ModelScale

print("Testing Phase 1 import...")
try:
    engine = get_romAI_engine(ModelScale.PHASE1)
    status = engine.get_engine_status()
    print("✅ Phase 1 engine created successfully!")
    total_params = status['model_info']['total_parameters']
    if isinstance(total_params, str):
        total_params = int(total_params.replace(',', ''))
    print(f"Parameters: {total_params:,}")
    print(f"Scale: {status['scale']}")
    print(f"Memory: {status['model_info']['parameter_size_gb']} GB")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
#!/usr/bin/env python3
"""
Clean RomAI Server Startup Script
=================================
Validates all imports and starts the server cleanly after all fixes have been applied.
"""

import sys
import os

# Set up proper Python path
romai_src = os.path.abspath(os.path.join(os.path.dirname(__file__), 'src'))
sys.path.insert(0, romai_src)
os.environ['PYTHONPATH'] = romai_src

print("🚀 Starting Clean RomAI Server...")
print("=" * 50)

# Pre-flight validation
print("📋 Pre-flight Import Validation:")
try:
    from ml.models.simple_transformer import SimpleAdvancedTransformer
    print("  ✅ SimpleAdvancedTransformer imported")
    
    from ml.models.romAI_transformer_engine import RomAITransformerEngine
    print("  ✅ RomAITransformerEngine imported")
    
    from ml.orchestration.agi_orchestrator import AGIOrchestrator
    print("  ✅ AGIOrchestrator imported")
    
    from ml.memory_core import MemoryCore
    print("  ✅ MemoryCore imported")
    
    print("\n🎉 All critical imports validated!")
    
except ImportError as e:
    print(f"❌ Import validation failed: {e}")
    sys.exit(1)

# Start the server
print("\n🚀 Starting server...")
try:
    os.chdir(os.path.join(romai_src, 'ml', 'serving'))
    os.system('python model_server.py --port 6101 --host 0.0.0.0 --dev')
except KeyboardInterrupt:
    print("\n🛑 Server stopped by user")
except Exception as e:
    print(f"❌ Server startup failed: {e}")
    sys.exit(1)
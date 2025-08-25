#!/usr/bin/env python3
"""
Debug script to test imports for RomAI components
"""
import sys
import os

# Add the source directory to Python path
romai_src = r"e:\GitHub\codai-project\apps\romai\src"
sys.path.insert(0, romai_src)

print(f"Python path includes: {romai_src}")
print(f"Current working directory: {os.getcwd()}")
print("=" * 60)

# Test model server import
try:
    from ml.serving.model_server import app
    print("✅ Model server imports successfully")
except ImportError as e:
    print(f"❌ Model server import error: {e}")

# Test AGI Orchestrator import
try:
    from infrastructure.orchestration.agi_orchestrator import AGIOrchestrator
    print("✅ AGI Orchestrator imports successfully")
except ImportError as e:
    print(f"❌ AGI Orchestrator import error: {e}")

# Test Mathematical Reasoning Engine import
try:
    from ml.reasoning.mathematical_reasoning_engine import MathematicalReasoningEngine
    print("✅ Mathematical Reasoning Engine imports successfully")
except ImportError as e:
    print(f"❌ Mathematical Reasoning Engine import error: {e}")

# Test other key components
try:
    from ml.cultural.cultural_processor import CulturalProcessor
    print("✅ Cultural Processor imports successfully")
except ImportError as e:
    print(f"❌ Cultural Processor import error: {e}")

try:
    from ml.multimodal.multimodal_processor import MultimodalProcessor
    print("✅ Multimodal Processor imports successfully")
except ImportError as e:
    print(f"❌ Multimodal Processor import error: {e}")

print("=" * 60)
print("Import debugging complete!")
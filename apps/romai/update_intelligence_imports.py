#!/usr/bin/env python3
"""
Update Intelligence Orchestrator Import Paths
===========================================
Fix all imports to use the correct ml.intelligence_orchestrator path
"""

import re
from pathlib import Path

def update_intelligence_imports():
    model_server_path = Path("src/ml/serving/model_server.py")
    
    if not model_server_path.exists():
        print("❌ Model server file not found")
        return False
    
    # Read content
    with open(model_server_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix intelligence orchestrator imports - use relative import since we're in ml/serving
    old_import1 = 'from ml.core.agi.intelligence.intelligence_orchestrator import intelligence_orchestrator'
    new_import1 = 'from ..intelligence_orchestrator import intelligence_orchestrator'
    
    old_import2 = 'from ml.core.agi.intelligence.intelligence_orchestrator import ConsciousnessLevel'
    new_import2 = 'from ..intelligence_orchestrator import ConsciousnessLevel'
    
    replacements = [
        (old_import1, new_import1),
        (old_import2, new_import2)
    ]
    
    fixes_applied = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            fixes_applied += 1
            print(f"✅ Fixed: {old[:50]}...")
    
    # Write updated content
    with open(model_server_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"📊 Applied {fixes_applied} import fixes")
    return fixes_applied > 0

if __name__ == "__main__":
    update_intelligence_imports()
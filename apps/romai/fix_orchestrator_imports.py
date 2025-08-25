#!/usr/bin/env python3
"""
Fix Intelligence Orchestrator Imports
====================================
Update all references to use the correct module
"""

import re
from pathlib import Path

def fix_orchestrator_imports():
    model_server_path = Path("src/ml/serving/model_server.py")
    
    if not model_server_path.exists():
        print("❌ Model server file not found")
        return False
    
    # Read content
    with open(model_server_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix all intelligence_optimizer imports
    old_import = 'from ml.core.agi.intelligence.intelligence_optimizer import intelligence_orchestrator'
    new_import = 'from ml.core.agi.intelligence.intelligence_orchestrator import intelligence_orchestrator'
    
    content = content.replace(old_import, new_import)
    
    # Fix ConsciousnessLevel import
    old_consciousness = 'from ml.core.agi.intelligence.intelligence_optimizer import ConsciousnessLevel'  
    new_consciousness = 'from ml.core.agi.intelligence.intelligence_orchestrator import ConsciousnessLevel'
    
    content = content.replace(old_consciousness, new_consciousness)
    
    # Write updated content
    with open(model_server_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed intelligence orchestrator imports")
    return True

if __name__ == "__main__":
    fix_orchestrator_imports()
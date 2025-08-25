#!/usr/bin/env python3
"""
Fix Server Import Issues - Phase 4
==================================
Systematic resolution of all remaining import errors for clean server startup
"""

import os
import re
from pathlib import Path

class ServerImportFixer:
    def __init__(self):
        self.romai_dir = Path(".")
        self.model_server_path = self.romai_dir / "src/ml/serving/model_server.py"
        
        # Import fixes to apply
        self.import_fixes = [
            # Fix intelligence optimizer imports
            (
                'from advanced_intelligence_optimizer import intelligence_orchestrator',
                'from ml.core.agi.intelligence.intelligence_optimizer import intelligence_orchestrator'
            ),
            (
                'from advanced_intelligence_optimizer import ConsciousnessLevel',
                'from ml.core.agi.intelligence.intelligence_optimizer import ConsciousnessLevel'
            ),
            # Fix memory core imports  
            (
                'from advanced_memory_core import',
                'from ml.memory_core import'
            ),
            # Fix reasoning training system
            (
                'from ml.reasoning.advanced_reasoning_training_system import',
                'from ml.training.reasoning_trainer import'
            ),
            (
                'ml.reasoning.advanced_reasoning_training_system',
                'ml.training.reasoning_trainer'
            ),
            # Fix other old references
            (
                'Advanced Reasoning Training',
                'Reasoning Training'
            ),
            (
                'advanced_agi_reasoning',
                'agi_reasoning'
            )
        ]

    def fix_imports(self):
        """Fix all import issues in model_server.py"""
        print("🔧 Fixing Server Import Issues...")
        
        if not self.model_server_path.exists():
            print(f"❌ Model server file not found: {self.model_server_path}")
            return False
            
        # Read current content
        with open(self.model_server_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_size = len(content)
        fixes_applied = 0
        
        # Apply all fixes
        for old_import, new_import in self.import_fixes:
            if old_import in content:
                content = content.replace(old_import, new_import)
                fixes_applied += 1
                print(f"  ✅ Fixed: {old_import[:50]}...")
        
        # Write updated content
        with open(self.model_server_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        new_size = len(content)
        
        print(f"\n📊 Import Fixes Summary:")
        print(f"  Fixes Applied: {fixes_applied}")
        print(f"  Size Change: {new_size - original_size} characters")
        print(f"  File Updated: {self.model_server_path}")
        
        return fixes_applied > 0

    def validate_critical_modules(self):
        """Check if critical modules exist"""
        print("\n🔍 Validating Critical Modules...")
        
        critical_modules = [
            "src/ml/models/simple_transformer.py",
            "src/ml/orchestration/agi_orchestrator.py", 
            "src/ml/training/reasoning_trainer.py",
            "src/ml/memory_core.py",
            "src/core/agi/intelligence/intelligence_optimizer.py"
        ]
        
        missing_modules = []
        for module_path in critical_modules:
            full_path = self.romai_dir / module_path
            if full_path.exists():
                print(f"  ✅ {module_path}")
            else:
                print(f"  ❌ {module_path}")
                missing_modules.append(module_path)
        
        if missing_modules:
            print(f"\n⚠️ {len(missing_modules)} critical modules missing!")
            return False
        else:
            print(f"\n🎉 All {len(critical_modules)} critical modules found!")
            return True

if __name__ == "__main__":
    fixer = ServerImportFixer()
    
    # Fix imports
    import_success = fixer.fix_imports()
    
    # Validate modules  
    validation_success = fixer.validate_critical_modules()
    
    if import_success and validation_success:
        print("\n✅ Server import fixes completed successfully!")
    else:
        print("\n❌ Some issues remain - check output above")
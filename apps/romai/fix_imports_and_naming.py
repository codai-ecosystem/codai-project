#!/usr/bin/env python3
"""
Fix Imports and Naming for RomAI
Logical approach to naming: Keep "week" for specific development phases,
use semantic names for production modules.
"""

import os
import re
import logging
from pathlib import Path
import shutil

def setup_logging():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def should_keep_week_naming(filename: str) -> bool:
    """Determine if a file should logically keep week/day naming."""
    
    # Files that should keep week naming:
    keep_week_patterns = [
        r'.*demo.*\.py$',           # Demo files for specific weeks
        r'test.*week.*\.py$',       # Test files for specific weeks  
        r'debug.*week.*\.py$',      # Debug files for specific weeks
        r'.*consolidation.*\.py$',  # Consolidation files
        r'.*final.*demo.*\.py$',    # Final demo files
        r'week.*final.*\.py$',      # Week final files
        r'.*week.*test.*\.py$',     # Week-specific test files
        r'validate.*week.*\.py$',   # Week validation files
    ]
    
    for pattern in keep_week_patterns:
        if re.match(pattern, filename, re.IGNORECASE):
            return True
    
    return False

def get_correct_filename(filename: str) -> str:
    """Get the correct filename based on logical naming rules."""
    
    # Specific mappings for files that should be restored
    restore_mappings = {
        'enhanced_demo.py': 'week2_enhanced_demo.py',
        'core_performance_optimizer.py': 'core_performance_optimizer.py',  # Keep semantic
        'execute_advanced_training.py': 'execute_advanced_training.py',    # Keep semantic
        'test_cognitive_enhancement.py': 'test_cognitive_enhancement.py',  # Keep semantic
        'validate_performance.py': 'validate_performance.py',              # Keep semantic
    }
    
    if filename in restore_mappings:
        return restore_mappings[filename]
    
    # If it should keep week naming but was renamed, restore it
    if should_keep_week_naming(filename):
        # Try to restore week naming from phase naming
        restored = filename
        restored = re.sub(r'phase_(\d+)', r'week\1', restored)
        restored = re.sub(r'step_(\d+)', r'day\1', restored)
        return restored
    
    return filename

def fix_import_statement(line: str) -> str:
    """Fix import statements to use correct module names."""
    
    # Map of old imports to new imports
    import_mappings = {
        'week_9_meta_learning': 'ml.meta_learning.meta_learning_api',
        'week_9_autonomous_reasoning': 'core.agi.reasoning.autonomous_reasoning', 
        'week_9_cultural_meta_learning': 'core.agi.cultural.cultural_meta_learning_integration',
        'week_9_cultural_learning_validation': 'core.agi.cultural.cultural_learning_validation',
        'week10_validation': 'python.agi.integration.integration_validator',
        'week3_day4_components': 'ml.quantum.advanced_consciousness_applications',
    }
    
    fixed_line = line
    for old_import, new_import in import_mappings.items():
        if old_import in line:
            fixed_line = line.replace(old_import, new_import)
            logging.info(f"Fixed import: {old_import} -> {new_import}")
    
    return fixed_line

def fix_imports_in_file(file_path: Path):
    """Fix imports in a specific file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        fixed_lines = []
        changes_made = False
        
        for line in lines:
            if line.strip().startswith(('import ', 'from ')) and ('week_' in line or 'week' in line):
                fixed_line = fix_import_statement(line)
                if fixed_line != line:
                    changes_made = True
                    logging.info(f"Fixed import in {file_path.name}: {line.strip()} -> {fixed_line.strip()}")
                fixed_lines.append(fixed_line)
            else:
                fixed_lines.append(line)
        
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(fixed_lines)
            logging.info(f"✅ Fixed imports in {file_path}")
        
    except Exception as e:
        logging.error(f"❌ Error fixing imports in {file_path}: {e}")

def main():
    setup_logging()
    
    base_dir = Path(__file__).parent
    logging.info(f"🔧 Starting import and naming fixes in: {base_dir}")
    
    # Step 1: Fix naming for files that should keep week naming
    logging.info("Step 1: Checking file naming...")
    
    for py_file in base_dir.glob("*.py"):
        correct_name = get_correct_filename(py_file.name)
        if correct_name != py_file.name:
            new_path = py_file.parent / correct_name
            if not new_path.exists():
                py_file.rename(new_path)
                logging.info(f"✅ Renamed: {py_file.name} -> {correct_name}")
    
    # Step 2: Fix imports in all Python files
    logging.info("Step 2: Fixing imports...")
    
    all_py_files = list(base_dir.rglob("*.py"))
    for py_file in all_py_files:
        if py_file.name != "fix_imports_and_naming.py":  # Skip this script
            fix_imports_in_file(py_file)
    
    logging.info("✅ Import and naming fixes completed!")

if __name__ == "__main__":
    main()

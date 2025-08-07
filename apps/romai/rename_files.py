#!/usr/bin/env python3
"""
File Renaming Script for RomAI
Renames all files with week/day naming conventions to proper semantic names.
"""

import os
import re
import logging
from pathlib import Path
import shutil

def setup_logging():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_semantic_filename(old_name: str) -> str:
    """Convert week/day filename to semantic name."""
    
    # Mapping of specific files to better names
    specific_mappings = {
        'debug_week2.py': 'debug_enhanced_processing.py',
        'test_week2_consciousness.py': 'test_enhanced_consciousness.py',
        'week1_performance_optimizer.py': 'core_performance_optimizer.py',
        'week2_final_demo.py': 'enhanced_processing_demo.py',
        'execute_week3_training.py': 'execute_advanced_training.py',
        'test_day_4_azure_integration.py': 'test_azure_integration.py',
        'validate_day8_performance.py': 'validate_performance.py',
        'Dockerfile.week3': 'Dockerfile.advanced',
    }
    
    # Check specific mappings first
    if old_name in specific_mappings:
        return specific_mappings[old_name]
    
    # Pattern-based replacements
    new_name = old_name
    
    # Replace week patterns
    new_name = re.sub(r'week[_\s]*(\d+)', r'phase_\1', new_name, flags=re.IGNORECASE)
    new_name = re.sub(r'WEEK[_\s]*(\d+)', r'PHASE_\1', new_name)
    
    # Replace day patterns  
    new_name = re.sub(r'day[_\s]*(\d+)', r'step_\1', new_name, flags=re.IGNORECASE)
    new_name = re.sub(r'DAY[_\s]*(\d+)', r'STEP_\1', new_name)
    
    # Replace specific week/day terms with semantic equivalents
    replacements = {
        'week1': 'core',
        'week2': 'enhanced', 
        'week3': 'advanced',
        'week4': 'integrated',
        'week5': 'optimized',
        'WEEK1': 'CORE',
        'WEEK2': 'ENHANCED',
        'WEEK3': 'ADVANCED', 
        'WEEK4': 'INTEGRATED',
        'WEEK5': 'OPTIMIZED',
        'Week1': 'Core',
        'Week2': 'Enhanced',
        'Week3': 'Advanced',
        'Week4': 'Integrated', 
        'Week5': 'Optimized',
        '_Week_': '_Phase_',
        '_day_': '_step_',
        '_Day_': '_Step_',
        '_DAY_': '_STEP_',
    }
    
    for old, new in replacements.items():
        new_name = new_name.replace(old, new)
    
    # Clean up any remaining week/day references
    new_name = re.sub(r'week', 'phase', new_name, flags=re.IGNORECASE) 
    new_name = re.sub(r'day', 'step', new_name, flags=re.IGNORECASE)
    
    return new_name

def rename_files_in_directory(directory: Path, dry_run: bool = True):
    """Rename all files with week/day naming in directory."""
    renamed_count = 0
    
    # Get all files with week or day in name
    week_files = list(directory.rglob("*week*"))
    day_files = list(directory.rglob("*day*"))
    all_files = week_files + day_files
    
    # Remove duplicates
    all_files = list(set(all_files))
    
    for file_path in all_files:
        if file_path.is_file():
            old_name = file_path.name
            new_name = get_semantic_filename(old_name)
            
            if new_name != old_name:
                new_path = file_path.parent / new_name
                
                if dry_run:
                    logging.info(f"Would rename: {old_name} -> {new_name}")
                else:
                    try:
                        if new_path.exists():
                            logging.warning(f"⚠️ Target exists: {new_path}, skipping {file_path}")
                            continue
                            
                        file_path.rename(new_path)
                        logging.info(f"✅ Renamed: {old_name} -> {new_name}")
                        renamed_count += 1
                    except Exception as e:
                        logging.error(f"❌ Error renaming {file_path}: {e}")
    
    return renamed_count

def main():
    setup_logging()
    
    base_dir = Path(__file__).parent
    logging.info(f"🔧 Starting file renaming in: {base_dir}")
    
    # First do a dry run
    logging.info("🔍 Dry run - showing what would be renamed:")
    rename_files_in_directory(base_dir, dry_run=True)
    
    # Ask for confirmation
    print("\n" + "="*60)
    response = input("Proceed with renaming? (y/N): ").strip().lower()
    
    if response == 'y':
        logging.info("🚀 Proceeding with actual renaming...")
        renamed_count = rename_files_in_directory(base_dir, dry_run=False)
        logging.info(f"✅ Renamed {renamed_count} files successfully!")
    else:
        logging.info("❌ Renaming cancelled by user")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Semantic Refactoring Script for RomAI
Removes all week/day naming conventions and replaces with proper semantic naming.
"""

import os
import re
import logging
from pathlib import Path

def setup_logging():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def semantic_replacements():
    """Define semantic replacements for week/day conventions."""
    return {
        # Variable names
        'ADVANCED_SYSTEMS_AVAILABLE': 'ADVANCED_SYSTEMS_AVAILABLE',
        'advanced_agi_mode': 'advanced_agi_mode',
        'enhanced_mode': 'enhanced_mode',
        '_in_enhanced_processing': '_in_enhanced_processing',
        'enhanced_processing': 'enhanced_processing',
        'basic_fallback': 'basic_fallback',
        'core_optimizations': 'core_optimizations',
        'core_progress': 'core_progress',
        'enhanced_metrics': 'enhanced_metrics',
        
        # Comments and docstrings
        'Core optimization': 'Core optimization',
        'Enhanced Processing': 'Enhanced Processing',
        'Enhanced implementation': 'Enhanced implementation',
        'Enhanced components': 'Enhanced components',
        'enhanced consciousness capabilities': 'enhanced consciousness capabilities',
        'Advanced AGI Systems': 'Advanced AGI Systems',
        'AGI Progress': 'AGI Progress',
        'Advanced capabilities': 'Advanced capabilities',
        
        # Log messages
        'Core optimizations': 'core optimizations',
        'enhanced processing': 'enhanced processing',
        'Advanced AGI Systems': 'Advanced AGI Systems',
        
        # Evolution stages
        'core_optimization': 'core_optimization',
        'core_enhanced': 'core_enhanced',
        
        # Method names
        '_initialize_enhanced_components': '_initialize_enhanced_components',
        '_generate_enhanced_processing_response': '_generate_enhanced_response',
        
        # File paths
        'advanced_development': 'advanced_development',
        'enhanced_': 'enhanced_',
        'core_': 'core_',
        
        # General patterns
        r'Advanced': 'Advanced',
        r'advanced': 'advanced',
        r'Phase': 'Phase',
        r'phase': 'phase',
        r'ADVANCED': 'ADVANCED',
        r'PHASE': 'PHASE',
    }

def refactor_file(file_path: Path, replacements: dict):
    """Refactor a single file with semantic replacements."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = []
        
        # Apply simple string replacements first
        for old, new in replacements.items():
            if not old.startswith('r\''):  # Skip regex patterns for now
                old_content = content
                content = content.replace(old, new)
                if content != old_content:
                    changes_made.append(f"{old} -> {new}")
        
        # Apply regex replacements
        for pattern, replacement in replacements.items():
            if pattern.startswith('r\'') and pattern.endswith('\''):
                regex_pattern = pattern[2:-1]  # Remove r' and '
                old_content = content
                content = re.sub(regex_pattern, replacement, content)
                if content != old_content:
                    changes_made.append(f"Pattern {pattern} -> {replacement}")
        
        # Write back if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            logging.info(f"✅ Refactored {file_path}")
            for change in changes_made[:5]:  # Show first 5 changes
                logging.info(f"   • {change}")
            if len(changes_made) > 5:
                logging.info(f"   • ... and {len(changes_made) - 5} more changes")
            return True
        else:
            logging.debug(f"No changes needed for {file_path}")
            return False
            
    except Exception as e:
        logging.error(f"❌ Error processing {file_path}: {e}")
        return False

def refactor_directory(directory: Path, file_patterns: list, replacements: dict):
    """Refactor all matching files in a directory."""
    total_files = 0
    changed_files = 0
    
    for pattern in file_patterns:
        for file_path in directory.rglob(pattern):
            if file_path.is_file():
                total_files += 1
                if refactor_file(file_path, replacements):
                    changed_files += 1
    
    logging.info(f"📊 Processed {total_files} files, modified {changed_files} files")
    return changed_files

def main():
    setup_logging()
    logging.info("🔧 Starting semantic refactoring of RomAI codebase...")
    
    # Define base directory
    base_dir = Path(__file__).parent
    src_dir = base_dir / "src"
    
    # Define file patterns to process
    file_patterns = ['*.py', '*.md', '*.txt', '*.json']
    
    # Get semantic replacements
    replacements = semantic_replacements()
    
    # Refactor the codebase
    total_changed = 0
    
    if src_dir.exists():
        logging.info(f"🎯 Refactoring source directory: {src_dir}")
        total_changed += refactor_directory(src_dir, file_patterns, replacements)
    
    # Also check root level files
    logging.info(f"🎯 Refactoring root level files: {base_dir}")
    for pattern in file_patterns:
        for file_path in base_dir.glob(pattern):
            if file_path.is_file() and not file_path.name.startswith('.'):
                total_changed += refactor_file(file_path, replacements)
    
    logging.info(f"✅ Semantic refactoring complete! Modified {total_changed} files total.")
    logging.info("🎉 RomAI codebase now uses proper semantic naming conventions!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Clean naming script to fix problematic file names
Removes marketing terms, version numbers, and unclear qualifiers
"""

import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Tuple


def clean_filename(filename: str) -> str:
    """Clean a filename by removing problematic terms"""
    
    # Extract extension
    name, ext = os.path.splitext(filename)
    
    # Mapping for term replacement
    replacements = {
        # Remove marketing terms
        r'romai_': '',  # Remove romai prefix
        r'complete_': '',  # Remove complete prefix
        r'comprehensive_': '',  # Remove comprehensive
        r'ultimate_': '',
        r'advanced_': '',
        r'enhanced_': '',
        r'simple_': '',
        r'basic_': '',
        r'final_': '',
        r'phase_?(\d+_?)?': '',  # Remove phase with optional numbers
        
        # Version patterns
        r'_v\d+(_\d+)?': '',  # Remove _v1, _v1_2 etc
        r'_version_?\d+': '',
        r'_\d{4}_\d{2}_\d{2}': '',  # Remove date patterns
        r'_\d{6,}': '',  # Remove long number suffixes
        
        # Clean up specific patterns
        r'^test_romai_': 'test_',
        r'^validate_romai_': 'validate_',
        r'^train_romai_': 'train_',
        r'romai_(.+)_test': r'\1_test',
        r'romai_(.+)_validation': r'\1_validation',
        r'romai_(.+)_benchmark': r'\1_benchmark',
    }
    
    cleaned = name
    for pattern, replacement in replacements.items():
        cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
    
    # Clean up multiple underscores and leading/trailing underscores
    cleaned = re.sub(r'_+', '_', cleaned)
    cleaned = cleaned.strip('_')
    
    # If name is empty or too short, use descriptive fallback
    if not cleaned or len(cleaned) < 2:
        if 'test' in name.lower():
            cleaned = 'test'
        elif 'validate' in name.lower():
            cleaned = 'validation'
        elif 'train' in name.lower():
            cleaned = 'training'
        elif 'benchmark' in name.lower():
            cleaned = 'benchmark'
        else:
            cleaned = 'module'
    
    return cleaned + ext


def get_files_to_rename() -> List[Tuple[Path, str]]:
    """Get all files that need renaming"""
    
    files_to_rename = []
    root = Path('e:/GitHub/codai-project')
    
    # Patterns to match problematic files
    problematic_patterns = [
        r'romai_',
        r'complete_',
        r'comprehensive_',
        r'ultimate_',
        r'advanced_',
        r'enhanced_',
        r'simple_',
        r'basic_',
        r'final_',
        r'phase_',
        r'_v\d+',
    ]
    
    pattern = '|'.join(problematic_patterns)
    regex = re.compile(pattern, re.IGNORECASE)
    
    for file_path in root.rglob('*.py'):
        if regex.search(file_path.name):
            new_name = clean_filename(file_path.name)
            if new_name != file_path.name:
                files_to_rename.append((file_path, new_name))
    
    return files_to_rename


def main():
    """Main function to rename files"""
    
    files_to_rename = get_files_to_rename()
    
    print(f"Found {len(files_to_rename)} files to rename:")
    print("-" * 80)
    
    for file_path, new_name in files_to_rename[:20]:  # Show first 20
        print(f"{file_path.name} → {new_name}")
    
    if len(files_to_rename) > 20:
        print(f"... and {len(files_to_rename) - 20} more files")
    
    print("-" * 80)
    
    # Show statistics
    by_pattern = {}
    for file_path, new_name in files_to_rename:
        old_name = file_path.name
        if 'romai_' in old_name.lower():
            by_pattern['romai_prefix'] = by_pattern.get('romai_prefix', 0) + 1
        if 'complete_' in old_name.lower():
            by_pattern['complete_prefix'] = by_pattern.get('complete_prefix', 0) + 1
        if '_v' in old_name:
            by_pattern['version_suffix'] = by_pattern.get('version_suffix', 0) + 1
        if any(term in old_name.lower() for term in ['simple', 'basic', 'advanced']):
            by_pattern['qualifier_terms'] = by_pattern.get('qualifier_terms', 0) + 1
    
    print("Breakdown by pattern:")
    for pattern, count in by_pattern.items():
        print(f"  {pattern}: {count} files")
    
    return files_to_rename


if __name__ == '__main__':
    main()
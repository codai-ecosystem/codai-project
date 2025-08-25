#!/usr/bin/env python3
"""
Safe renaming script - checks for conflicts before renaming
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple


def clean_filename(filename: str) -> str:
    """Clean a filename by removing problematic terms"""
    name, ext = os.path.splitext(filename)
    
    replacements = {
        r'romai_': '',
        r'complete_': '',
        r'comprehensive_': '',
        r'ultimate_': '',
        r'advanced_': '',
        r'enhanced_': '',
        r'simple_': '',
        r'basic_': '',
        r'final_': '',
        r'phase_?(\d+_?)?': '',
        r'_v\d+(_\d+)?': '',
        r'_version_?\d+': '',
        r'_\d{4}_\d{2}_\d{2}': '',
        r'_\d{6,}': '',
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
    
    cleaned = re.sub(r'_+', '_', cleaned)
    cleaned = cleaned.strip('_')
    
    if not cleaned or len(cleaned) < 2:
        if 'test' in name.lower():
            cleaned = 'test_module'
        elif 'validate' in name.lower():
            cleaned = 'validation_module'
        elif 'train' in name.lower():
            cleaned = 'training_module'
        elif 'benchmark' in name.lower():
            cleaned = 'benchmark_module'
        else:
            cleaned = 'utility'
    
    return cleaned + ext


def find_safe_renames():
    """Find safe renames that won't cause conflicts"""
    
    root = Path('e:/GitHub/codai-project')
    existing_files = set()
    
    # Get all existing Python files
    for file_path in root.rglob('*.py'):
        existing_files.add(file_path.name.lower())
    
    # Find files to rename
    problematic_patterns = [
        r'romai_', r'complete_', r'comprehensive_', r'ultimate_', 
        r'advanced_', r'enhanced_', r'simple_', r'basic_', r'final_', 
        r'phase_', r'_v\d+'
    ]
    
    pattern = '|'.join(problematic_patterns)
    regex = re.compile(pattern, re.IGNORECASE)
    
    # Group by target name to detect conflicts
    target_groups = defaultdict(list)
    safe_renames = []
    conflicts = []
    
    for file_path in root.rglob('*.py'):
        if regex.search(file_path.name):
            new_name = clean_filename(file_path.name)
            
            # Check if target already exists
            if new_name.lower() in existing_files and new_name.lower() != file_path.name.lower():
                conflicts.append((file_path, new_name, "target exists"))
            else:
                target_groups[new_name.lower()].append((file_path, new_name))
    
    # Process groups - if multiple files map to same target, add numbers
    for target_name, group in target_groups.items():
        if len(group) == 1:
            safe_renames.append(group[0])
        else:
            # Add sequential numbers to avoid conflicts
            for i, (file_path, new_name) in enumerate(group):
                if i == 0:
                    # First one keeps the clean name
                    safe_renames.append((file_path, new_name))
                else:
                    # Others get numbered
                    name, ext = os.path.splitext(new_name)
                    numbered_name = f"{name}_{i+1}{ext}"
                    safe_renames.append((file_path, numbered_name))
    
    return safe_renames, conflicts


def rename_priority_files():
    """Rename the highest priority files first"""
    
    safe_renames, conflicts = find_safe_renames()
    
    # Sort by priority - most problematic patterns first
    def priority_score(item):
        file_path, new_name = item
        old_name = file_path.name.lower()
        score = 0
        
        if 'romai_' in old_name: score += 10
        if 'complete_' in old_name: score += 8
        if 'comprehensive_' in old_name: score += 7
        if '_v' in old_name: score += 5
        if any(term in old_name for term in ['simple', 'basic', 'advanced']): score += 6
        
        return score
    
    safe_renames.sort(key=priority_score, reverse=True)
    
    print(f"Found {len(safe_renames)} safe renames and {len(conflicts)} conflicts")
    print("\nTop 15 priority renames:")
    print("-" * 80)
    
    for i, (file_path, new_name) in enumerate(safe_renames[:15]):
        rel_path = file_path.relative_to(Path('e:/GitHub/codai-project'))
        print(f"{i+1:2d}. {rel_path}")
        print(f"    {file_path.name} → {new_name}")
    
    if conflicts:
        print(f"\n{len(conflicts)} files have naming conflicts:")
        for file_path, new_name, reason in conflicts[:5]:
            rel_path = file_path.relative_to(Path('e:/GitHub/codai-project'))
            print(f"    {rel_path} → {new_name} ({reason})")
    
    return safe_renames[:15]  # Return first 15 for execution


if __name__ == '__main__':
    priority_renames = rename_priority_files()
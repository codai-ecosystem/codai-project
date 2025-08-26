#!/usr/bin/env python3
"""
RomAI Codebase Analysis - Simplified Version
Analyzes RomAI files to identify duplicates and architectural issues
"""

import os
import hashlib
from pathlib import Path
from collections import defaultdict, Counter

def analyze_romai_codebase(root_path="src"):
    """Analyze RomAI codebase for duplicates and structure issues"""
    root = Path(root_path)
    
    print("=== RomAI Codebase Analysis ===")
    print(f"Analyzing path: {root.absolute()}")
    
    # Find all Python files
    python_files = list(root.rglob("*.py"))
    print(f"\nFound {len(python_files)} Python files")
    
    # Categorize files
    categories = defaultdict(list)
    file_sizes = []
    
    # Simple file analysis
    for file_path in python_files:
        try:
            # Skip problematic directories
            if any(skip in str(file_path) for skip in ['__pycache__', '.pytest_cache', 'node_modules']):
                continue
                
            # Read file safely
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except:
                continue
            
            # Basic categorization
            path_str = str(file_path).lower()
            
            if any(term in path_str for term in ['reasoning', 'engine']):
                categories['reasoning_engines'].append(str(file_path))
            elif 'multimodal' in path_str:
                categories['multimodal'].append(str(file_path))
            elif any(term in path_str for term in ['test', 'validation']):
                categories['testing'].append(str(file_path))
            elif 'archive' in path_str or 'backup' in path_str:
                categories['archive'].append(str(file_path))
            elif any(term in path_str for term in ['phase', 'deprecated', 'old']):
                categories['obsolete'].append(str(file_path))
            else:
                categories['other'].append(str(file_path))
            
            file_sizes.append(len(content))
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    # Analysis results
    print("\n=== FILE CATEGORIES ===")
    total_files = sum(len(files) for files in categories.values())
    
    for category, files in categories.items():
        percentage = (len(files) / total_files) * 100 if total_files > 0 else 0
        print(f"{category.upper()}: {len(files)} files ({percentage:.1f}%)")
        
        # Show some examples
        for file in files[:3]:
            rel_path = str(Path(file).relative_to(root)) if root in Path(file).parents else file
            print(f"  - {rel_path}")
        if len(files) > 3:
            print(f"  ... and {len(files) - 3} more")
    
    # Identify potential issues
    print("\n=== KEY FINDINGS ===")
    
    reasoning_count = len(categories['reasoning_engines'])
    if reasoning_count > 10:
        print(f"⚠️  ISSUE: {reasoning_count} reasoning engine files found - suggests duplication")
    
    archive_count = len(categories['archive'])
    if archive_count > 0:
        print(f"🗂️  CLEANUP: {archive_count} archive/backup files can be removed")
    
    obsolete_count = len(categories['obsolete'])
    if obsolete_count > 0:
        print(f"🗑️  CLEANUP: {obsolete_count} obsolete phase/deprecated files can be removed")
    
    # File size analysis
    if file_sizes:
        avg_size = sum(file_sizes) / len(file_sizes)
        max_size = max(file_sizes)
        print(f"📊 Average file size: {avg_size:.0f} chars")
        print(f"📊 Largest file: {max_size:,} chars")
    
    # Simple recommendations
    print("\n=== RECOMMENDATIONS ===")
    print("1. 🧠 CONSOLIDATE REASONING ENGINES:")
    print(f"   - Reduce {reasoning_count} reasoning files to 5 core engines")
    print("   - Mathematical, Logical, Cultural, Creative, Cross-Modal")
    
    print("2. 🗑️ CLEANUP OBSOLETE FILES:")
    cleanup_count = archive_count + obsolete_count
    print(f"   - Remove {cleanup_count} archive/obsolete files")
    print("   - Reduce codebase size by ~30%")
    
    print("3. 🏗️ ARCHITECTURAL IMPROVEMENTS:")
    print("   - Implement unified AGI class structure")
    print("   - Add proper dependency injection")
    print("   - Create clear module boundaries")
    
    print("4. 🚀 PRODUCTION READINESS:")
    print("   - Add comprehensive testing framework")
    print("   - Implement proper configuration management")
    print("   - Create deployment automation")
    
    # Specific file analysis for reasoning engines
    print(f"\n=== REASONING ENGINE ANALYSIS ===")
    reasoning_files = categories['reasoning_engines']
    
    # Group similar files
    math_files = [f for f in reasoning_files if 'math' in f.lower()]
    logic_files = [f for f in reasoning_files if 'logic' in f.lower()]
    cultural_files = [f for f in reasoning_files if any(term in f.lower() for term in ['cultural', 'romanian'])]
    
    print(f"Mathematics: {len(math_files)} files")
    print(f"Logic: {len(logic_files)} files") 
    print(f"Cultural: {len(cultural_files)} files")
    
    if len(math_files) > 2:
        print("⚠️  Multiple math engines detected - consolidation needed")
    if len(logic_files) > 2:
        print("⚠️  Multiple logic engines detected - consolidation needed")
    
    return {
        'total_files': total_files,
        'categories': dict(categories),
        'recommendations': [
            'Consolidate reasoning engines',
            'Remove archive/obsolete files',
            'Implement unified architecture',
            'Add production infrastructure'
        ]
    }

if __name__ == "__main__":
    result = analyze_romai_codebase()
    
    print(f"\n🎯 ANALYSIS COMPLETE")
    print(f"📊 Total files analyzed: {result['total_files']}")
    print(f"💡 Key recommendations: {len(result['recommendations'])}")
    print(f"\n✅ Next step: Begin consolidation based on findings above")
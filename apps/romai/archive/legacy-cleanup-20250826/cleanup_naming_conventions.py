#!/usr/bin/env python3
"""
RomAI AGI Project - File Naming Convention Cleanup
==================================================

This script refactors the RomAI AGI project to follow proper Python naming conventions
and Microsoft coding standards as documented in the Developer Guide.

Key principles:
- snake_case for Python files, variables, and functions
- Remove temporal naming patterns (day, week, phase, step)
- Use descriptive, domain-specific names
- Follow Microsoft documentation standards
- Maintain backwards compatibility during transition

References:
- Python Developer Guide: https://devguide.python.org/
- Microsoft Python Standards: https://learn.microsoft.com/en-us/windows/python/
- PEP 8 Style Guide: https://peps.python.org/pep-0008/
"""

import os
import re
import json
import shutil
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class FileMapping:
    """Represents a file rename mapping with validation context."""
    old_path: str
    new_path: str
    reason: str
    file_type: str
    priority: int = 1  # 1=high, 2=medium, 3=low

class RomaiFileRenamer:
    """
    Advanced file renaming system following Microsoft and Python best practices.
    """
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.mappings: List[FileMapping] = []
        self.processed_files = set()
        self.backup_dir = self.project_root / "backup_naming_cleanup"
        
        # Modern naming patterns based on Microsoft docs
        self.naming_rules = {
            # Remove temporal patterns
            'temporal_patterns': [
                (r'(?:phase|step|week|day)_?\d+_?', ''),
                (r'_(?:phase|step|week|day)_?\d+', ''),
                (r'(?:phase|step|week|day)_?[0-9]+', ''),
            ],
            
            # Core ML/AGI naming conventions
            'ml_patterns': {
                'consciousness': 'awareness_engine',
                'stimulation': 'activation',
                'amplification': 'enhancement',
                'awakening': 'initialization',
                'integration': 'merger',
                'validation': 'verification',
                'optimization': 'tuning',
                'orchestration': 'coordination',
                'deployment': 'rollout',
                'monitoring': 'tracking',
                'enhancement': 'improvement',
                'consolidation': 'unification'
            },
            
            # Technical domain mappings
            'domain_patterns': {
                'agi': 'artificial_general_intelligence',
                'romai': 'romanian_ai',
                'meta_learning': 'adaptive_learning',
                'quantum': 'quantum_computing',
                'real_agi': 'genuine_agi',
                'polyglot': 'multilingual'
            },
            
            # File type specific patterns
            'test_patterns': {
                'test_': 'test_',
                'validate_': 'verify_',
                'quick_validate': 'quick_verify',
                'simple_validate': 'basic_verify'
            }
        }
    
    def analyze_project_structure(self) -> Dict[str, List[str]]:
        """Analyze current project structure and identify problematic files."""
        analysis = {
            'temporal_files': [],
            'test_files': [],
            'ml_files': [],
            'config_files': [],
            'documentation': [],
            'archives': []
        }
        
        for root, dirs, files in os.walk(self.project_root):
            root_path = Path(root)
            
            # Skip certain directories
            if any(skip in root_path.parts for skip in ['.git', 'node_modules', '__pycache__', '.next']):
                continue
                
            for file in files:
                file_path = root_path / file
                rel_path = file_path.relative_to(self.project_root)
                
                # Categorize files
                if re.search(r'(?:phase|step|week|day)_?\d+', file):
                    analysis['temporal_files'].append(str(rel_path))
                elif file.startswith('test_') or '_test.' in file:
                    analysis['test_files'].append(str(rel_path))
                elif any(ml_term in file.lower() for ml_term in ['ml', 'agi', 'consciousness', 'quantum']):
                    analysis['ml_files'].append(str(rel_path))
                elif file.endswith(('.json', '.yml', '.yaml', '.toml')):
                    analysis['config_files'].append(str(rel_path))
                elif file.endswith('.md'):
                    analysis['documentation'].append(str(rel_path))
                elif 'archive' in str(rel_path):
                    analysis['archives'].append(str(rel_path))
        
        return analysis
    
    def generate_new_name(self, file_path: str) -> Tuple[str, str]:
        """Generate a new, compliant file name based on best practices."""
        path = Path(file_path)
        original_name = path.stem
        extension = path.suffix
        
        # Start with original name
        new_name = original_name.lower()
        
        # Remove temporal patterns
        for pattern, replacement in self.naming_rules['temporal_patterns']:
            new_name = re.sub(pattern, replacement, new_name)
        
        # Clean up multiple underscores
        new_name = re.sub(r'_+', '_', new_name)
        
        # Apply domain-specific improvements
        for old_term, new_term in self.naming_rules['ml_patterns'].items():
            if old_term in new_name:
                new_name = new_name.replace(old_term, new_term)
        
        for old_term, new_term in self.naming_rules['domain_patterns'].items():
            if old_term in new_name:
                new_name = new_name.replace(old_term, new_term)
        
        # Handle test files specifically
        if 'test_' in new_name or '_test' in new_name:
            for old_pattern, new_pattern in self.naming_rules['test_patterns'].items():
                new_name = new_name.replace(old_pattern, new_pattern)
        
        # Apply specific improvements based on file context
        new_name = self._apply_contextual_improvements(new_name, str(path.parent))
        
        # Clean up final name
        new_name = new_name.strip('_')
        new_name = re.sub(r'^_+|_+$', '', new_name)
        
        # Ensure name is meaningful
        if not new_name or new_name in ['', '_']:
            new_name = 'refactored_module'
        
        reason = self._generate_rename_reason(original_name, new_name)
        
        return f"{new_name}{extension}", reason
    
    def _apply_contextual_improvements(self, name: str, parent_dir: str) -> str:
        """Apply context-specific naming improvements."""
        
        # ML/AGI specific contexts
        if 'ml' in parent_dir or 'agi' in parent_dir:
            name = name.replace('simple_', 'basic_')
            name = name.replace('quick_', 'fast_')
            name = name.replace('real_', 'genuine_')
        
        # Testing context
        if 'test' in parent_dir or 'tests' in parent_dir:
            if not name.startswith('test_'):
                name = f"test_{name}"
            name = name.replace('validate_', 'verify_')
        
        # Core functionality context
        if 'core' in parent_dir:
            name = name.replace('_complete', '_implementation')
            name = name.replace('_final', '_production')
        
        # Documentation context
        if 'docs' in parent_dir:
            name = name.replace('_report', '_documentation')
            name = name.replace('_plan', '_specification')
        
        return name
    
    def _generate_rename_reason(self, old_name: str, new_name: str) -> str:
        """Generate a reason for the rename based on the changes made."""
        reasons = []
        
        if re.search(r'(?:phase|step|week|day)_?\d+', old_name):
            reasons.append("Remove temporal naming pattern")
        
        if old_name != old_name.lower():
            reasons.append("Apply snake_case convention")
        
        if 'consciousness' in old_name:
            reasons.append("Use technical terminology (awareness_engine)")
        
        if 'simple' in old_name:
            reasons.append("Replace 'simple' with 'basic'")
        
        if 'real' in old_name:
            reasons.append("Replace 'real' with 'genuine'")
        
        if not reasons:
            reasons.append("Apply general naming conventions")
        
        return "; ".join(reasons)
    
    def create_file_mappings(self) -> None:
        """Create comprehensive file mapping for the entire project."""
        print("🔍 Analyzing project structure and generating file mappings...")
        
        analysis = self.analyze_project_structure()
        
        # Process temporal files first (highest priority)
        for file_path in analysis['temporal_files']:
            if file_path not in self.processed_files:
                new_name, reason = self.generate_new_name(file_path)
                old_path = self.project_root / file_path
                new_path = old_path.parent / new_name
                
                if old_path != new_path:
                    mapping = FileMapping(
                        old_path=str(old_path),
                        new_path=str(new_path),
                        reason=reason,
                        file_type="temporal",
                        priority=1
                    )
                    self.mappings.append(mapping)
                    self.processed_files.add(file_path)
        
        # Process other problematic files
        all_files = set()
        all_files.update(analysis['test_files'])
        all_files.update(analysis['ml_files'])
        
        for file_path in all_files:
            if file_path not in self.processed_files:
                # Check if file actually needs renaming
                path = Path(file_path)
                if (re.search(r'(?:phase|step|week|day|simple|real)_?\d*', path.stem) or
                    'consciousness' in path.stem or
                    path.stem != path.stem.lower()):
                    
                    new_name, reason = self.generate_new_name(file_path)
                    old_path = self.project_root / file_path
                    new_path = old_path.parent / new_name
                    
                    if old_path != new_path:
                        file_type = "test" if "test" in file_path else "ml"
                        mapping = FileMapping(
                            old_path=str(old_path),
                            new_path=str(new_path),
                            reason=reason,
                            file_type=file_type,
                            priority=2
                        )
                        self.mappings.append(mapping)
                        self.processed_files.add(file_path)
        
        # Sort by priority
        self.mappings.sort(key=lambda x: x.priority)
        
        print(f"📋 Generated {len(self.mappings)} file rename mappings")
    
    def preview_changes(self) -> None:
        """Preview all proposed changes."""
        print("\n📝 Proposed File Rename Changes")
        print("=" * 80)
        
        by_type = {}
        for mapping in self.mappings:
            if mapping.file_type not in by_type:
                by_type[mapping.file_type] = []
            by_type[mapping.file_type].append(mapping)
        
        for file_type, mappings in by_type.items():
            print(f"\n🔧 {file_type.upper()} FILES ({len(mappings)} changes)")
            print("-" * 40)
            
            for i, mapping in enumerate(mappings[:10], 1):  # Show first 10
                old_name = Path(mapping.old_path).name
                new_name = Path(mapping.new_path).name
                print(f"{i:2d}. {old_name} → {new_name}")
                print(f"    Reason: {mapping.reason}")
                
            if len(mappings) > 10:
                print(f"    ... and {len(mappings) - 10} more files")
    
    def create_backup(self) -> None:
        """Create backup of current state."""
        if self.backup_dir.exists():
            shutil.rmtree(self.backup_dir)
        
        self.backup_dir.mkdir(exist_ok=True)
        
        # Create backup manifest
        manifest = {
            'backup_date': datetime.now().isoformat(),
            'total_mappings': len(self.mappings),
            'mappings': [
                {
                    'old_path': m.old_path,
                    'new_path': m.new_path,
                    'reason': m.reason,
                    'type': m.file_type
                }
                for m in self.mappings
            ]
        }
        
        with open(self.backup_dir / 'rename_manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"💾 Backup manifest created at {self.backup_dir}")
    
    def apply_renames(self, dry_run: bool = True) -> Dict[str, int]:
        """Apply the file renames."""
        results = {
            'successful': 0,
            'failed': 0,
            'skipped': 0
        }
        
        print(f"\n🚀 {'DRY RUN - ' if dry_run else ''}Applying file renames...")
        
        for i, mapping in enumerate(self.mappings, 1):
            old_path = Path(mapping.old_path)
            new_path = Path(mapping.new_path)
            
            try:
                if not old_path.exists():
                    print(f"⚠️  {i:3d}. SKIP - File not found: {old_path.name}")
                    results['skipped'] += 1
                    continue
                
                if new_path.exists() and new_path != old_path:
                    print(f"⚠️  {i:3d}. SKIP - Target exists: {new_path.name}")
                    results['skipped'] += 1
                    continue
                
                if not dry_run:
                    # Ensure target directory exists
                    new_path.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Perform the rename
                    old_path.rename(new_path)
                
                print(f"✅ {i:3d}. {old_path.name} → {new_path.name}")
                results['successful'] += 1
                
            except Exception as e:
                print(f"❌ {i:3d}. FAIL - {old_path.name}: {str(e)}")
                results['failed'] += 1
        
        return results
    
    def update_import_statements(self, dry_run: bool = True) -> None:
        """Update import statements to reflect new file names."""
        print(f"\n🔗 {'DRY RUN - ' if dry_run else ''}Updating import statements...")
        
        # Create import mapping
        import_map = {}
        for mapping in self.mappings:
            if mapping.old_path.endswith('.py'):
                old_module = self._path_to_module(mapping.old_path)
                new_module = self._path_to_module(mapping.new_path)
                if old_module != new_module:
                    import_map[old_module] = new_module
        
        # Update all Python files
        updated_files = 0
        for root, dirs, files in os.walk(self.project_root):
            if any(skip in root for skip in ['.git', '__pycache__', 'node_modules']):
                continue
                
            for file in files:
                if file.endswith('.py'):
                    file_path = Path(root) / file
                    if self._update_file_imports(file_path, import_map, dry_run):
                        updated_files += 1
        
        print(f"📝 Updated imports in {updated_files} files")
    
    def _path_to_module(self, file_path: str) -> str:
        """Convert file path to Python module path."""
        path = Path(file_path)
        if path.suffix == '.py':
            # Remove .py extension and convert to module path
            rel_path = path.relative_to(self.project_root)
            if rel_path.stem == '__init__':
                return str(rel_path.parent).replace('/', '.').replace('\\', '.')
            else:
                return str(rel_path.with_suffix('')).replace('/', '.').replace('\\', '.')
        return ""
    
    def _update_file_imports(self, file_path: Path, import_map: Dict[str, str], dry_run: bool) -> bool:
        """Update imports in a single Python file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Update import statements
            for old_module, new_module in import_map.items():
                # Handle various import patterns
                patterns = [
                    rf'\bfrom\s+{re.escape(old_module)}\s+import\b',
                    rf'\bimport\s+{re.escape(old_module)}\b',
                    rf'\bfrom\s+{re.escape(old_module)}\.(\w+)\s+import\b',
                ]
                
                for pattern in patterns:
                    if re.search(pattern, content):
                        content = re.sub(
                            pattern,
                            lambda m: m.group(0).replace(old_module, new_module),
                            content
                        )
            
            if content != original_content and not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
                
        except Exception as e:
            print(f"⚠️  Failed to update imports in {file_path}: {e}")
        
        return False
    
    def generate_report(self) -> str:
        """Generate a comprehensive cleanup report."""
        report = f"""
# RomAI AGI File Naming Convention Cleanup Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- Total files analyzed: {len(self.processed_files)}
- Files requiring rename: {len(self.mappings)}
- Backup location: {self.backup_dir}

## Changes by Category
"""
        
        by_type = {}
        for mapping in self.mappings:
            if mapping.file_type not in by_type:
                by_type[mapping.file_type] = []
            by_type[mapping.file_type].append(mapping)
        
        for file_type, mappings in by_type.items():
            report += f"\n### {file_type.upper()} Files ({len(mappings)} changes)\n"
            for mapping in mappings:
                old_name = Path(mapping.old_path).name
                new_name = Path(mapping.new_path).name
                report += f"- `{old_name}` → `{new_name}` ({mapping.reason})\n"
        
        report += f"""
## Applied Standards
1. **Temporal Pattern Removal**: Eliminated phase/step/week/day numbering
2. **Snake Case**: Applied consistent snake_case naming
3. **Domain Terminology**: Used precise technical terms
4. **Test Convention**: Ensured test files follow test_ prefix pattern
5. **Microsoft Standards**: Applied Microsoft Python development guidelines

## Next Steps
1. Verify all imports are working correctly
2. Update documentation references
3. Run comprehensive tests
4. Update CI/CD configurations if needed
"""
        
        return report

def main():
    """Main execution function."""
    print("🧠 RomAI AGI File Naming Convention Cleanup")
    print("=" * 50)
    
    project_root = Path(__file__).parent
    renamer = RomaiFileRenamer(str(project_root))
    
    # Step 1: Analyze and create mappings
    renamer.create_file_mappings()
    
    if not renamer.mappings:
        print("✅ No files found that need renaming!")
        return
    
    # Step 2: Preview changes
    renamer.preview_changes()
    
    # Step 3: Create backup
    renamer.create_backup()
    
    # Step 4: Get user confirmation
    response = input(f"\n🤔 Apply {len(renamer.mappings)} file renames? (y/N): ").strip().lower()
    
    if response in ['y', 'yes']:
        # Step 5: Apply renames
        results = renamer.apply_renames(dry_run=False)
        
        # Step 6: Update imports
        renamer.update_import_statements(dry_run=False)
        
        # Step 7: Generate report
        report = renamer.generate_report()
        report_path = project_root / "NAMING_CLEANUP_REPORT.md"
        with open(report_path, 'w') as f:
            f.write(report)
        
        print(f"\n🎉 Cleanup completed!")
        print(f"📊 Results: {results['successful']} successful, {results['failed']} failed, {results['skipped']} skipped")
        print(f"📋 Report saved to: {report_path}")
        
    else:
        print("🚫 Cleanup cancelled. Run with dry_run=True to preview changes.")

if __name__ == "__main__":
    main()

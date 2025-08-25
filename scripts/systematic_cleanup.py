#!/usr/bin/env python3
"""
Systematic Cleanup Script for RomAI Project
Removes marketing terms, phases, and organizes files properly
"""

import os
import shutil
from pathlib import Path
from typing import List, Dict, Set
import re
import json
from datetime import datetime


class RomAIProjectCleaner:
    """Systematic project cleanup following Microsoft best practices"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.backup_dir = self.project_root / "cleanup_backup" / datetime.now().strftime("%Y%m%d_%H%M%S")
        self.issues_found = {
            'phase_files': [],
            'comprehensive_files': [], 
            'advanced_files': [],
            'duplicate_functions': [],
            'bad_naming': [],
            'oversized_files': []
        }
        self.stats = {
            'files_processed': 0,
            'files_renamed': 0,
            'files_moved': 0,
            'files_deleted': 0
        }
    
    def analyze_project(self) -> Dict:
        """Analyze project for cleanup issues"""
        print("🔍 Analyzing project for cleanup issues...")
        
        # Find problematic files
        for file_path in self.project_root.rglob('*'):
            if file_path.is_file():
                self.stats['files_processed'] += 1
                filename = file_path.name.lower()
                
                # Check for problematic naming patterns
                if any(term in filename for term in ['phase', 'comprehensive', 'ultimate', 'advanced', 'final']):
                    if 'phase' in filename:
                        self.issues_found['phase_files'].append(file_path)
                    if 'comprehensive' in filename:
                        self.issues_found['comprehensive_files'].append(file_path)
                    if 'advanced' in filename:
                        self.issues_found['advanced_files'].append(file_path)
                
                # Check file size (>1MB for text files is suspicious)
                if file_path.suffix in ['.py', '.js', '.ts', '.md'] and file_path.stat().st_size > 1024*1024:
                    self.issues_found['oversized_files'].append(file_path)
        
        return self.issues_found
    
    def create_backup(self) -> None:
        """Create backup before cleanup"""
        print(f"📦 Creating backup at {self.backup_dir}")
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Backup critical directories
        critical_paths = [
            'apps/romai/src',
            '.vscode/tasks.json',
            'packages',
            'docs'
        ]
        
        for path in critical_paths:
            source = self.project_root / path
            if source.exists():
                dest = self.backup_dir / path
                if source.is_dir():
                    shutil.copytree(source, dest, ignore_errors=True)
                else:
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(source, dest)
    
    def clean_phase_files(self) -> None:
        """Remove or reorganize phase-named files"""
        print(f"🧹 Cleaning {len(self.issues_found['phase_files'])} phase files...")
        
        docs_phase_dir = self.project_root / "docs" / "archive" / "phases"
        docs_phase_dir.mkdir(parents=True, exist_ok=True)
        
        for file_path in self.issues_found['phase_files']:
            try:
                # Skip if it's in tests or docs (might be legitimate)
                if any(part in str(file_path).lower() for part in ['test', 'spec', 'docs/reports']):
                    continue
                
                # Move to archive
                relative_path = file_path.relative_to(self.project_root)
                archive_path = docs_phase_dir / relative_path.name
                
                if not archive_path.exists():
                    shutil.move(str(file_path), str(archive_path))
                    self.stats['files_moved'] += 1
                    print(f"  Moved: {relative_path} → docs/archive/phases/")
                else:
                    # If duplicate exists, delete
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    print(f"  Deleted: {relative_path} (duplicate)")
                    
            except Exception as e:
                print(f"  ⚠️ Error processing {file_path}: {e}")
    
    def clean_comprehensive_files(self) -> None:
        """Clean files with 'comprehensive' in name"""
        print(f"🧹 Cleaning {len(self.issues_found['comprehensive_files'])} comprehensive files...")
        
        for file_path in self.issues_found['comprehensive_files']:
            try:
                # Skip legitimate test files
                if any(part in str(file_path).lower() for part in ['test', 'spec']):
                    continue
                
                # Rename by removing 'comprehensive'
                new_name = re.sub(r'comprehensive[\s_-]*', '', file_path.name, flags=re.IGNORECASE)
                new_name = re.sub(r'[\s_-]+', '_', new_name)  # Clean up spacing
                new_name = new_name.strip('_-')
                
                if new_name != file_path.name and new_name:
                    new_path = file_path.parent / new_name
                    if not new_path.exists():
                        file_path.rename(new_path)
                        self.stats['files_renamed'] += 1
                        print(f"  Renamed: {file_path.name} → {new_name}")
                    
            except Exception as e:
                print(f"  ⚠️ Error processing {file_path}: {e}")
    
    def generate_report(self) -> str:
        """Generate cleanup report"""
        report = f"""
# RomAI Project Cleanup Report
Generated: {datetime.now().isoformat()}

## Issues Found:
- Phase files: {len(self.issues_found['phase_files'])}
- Comprehensive files: {len(self.issues_found['comprehensive_files'])}
- Advanced files: {len(self.issues_found['advanced_files'])}
- Oversized files: {len(self.issues_found['oversized_files'])}

## Actions Taken:
- Files processed: {self.stats['files_processed']}
- Files renamed: {self.stats['files_renamed']}
- Files moved: {self.stats['files_moved']}
- Files deleted: {self.stats['files_deleted']}

## Backup Location:
{self.backup_dir}

## Next Steps:
1. Review archived files in docs/archive/phases/
2. Update any broken imports
3. Run tests to ensure functionality
4. Remove backup if all tests pass
        """
        
        report_path = self.project_root / "cleanup_report.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        return report
    
    def run_cleanup(self, dry_run: bool = False) -> str:
        """Run the complete cleanup process"""
        print("🚀 Starting RomAI project cleanup...")
        print(f"Project root: {self.project_root}")
        print(f"Dry run mode: {dry_run}")
        
        # Step 1: Analyze
        self.analyze_project()
        
        if dry_run:
            print("\n📊 DRY RUN - Issues that would be fixed:")
            for category, files in self.issues_found.items():
                print(f"  {category}: {len(files)} files")
                for file_path in files[:3]:  # Show first 3
                    print(f"    - {file_path.relative_to(self.project_root)}")
                if len(files) > 3:
                    print(f"    ... and {len(files) - 3} more")
            return "Dry run completed - no changes made"
        
        # Step 2: Backup
        self.create_backup()
        
        # Step 3: Clean
        self.clean_phase_files()
        self.clean_comprehensive_files()
        
        # Step 4: Report
        report = self.generate_report()
        print("\n✅ Cleanup completed!")
        print(report)
        
        return report


def main():
    project_root = "e:/GitHub/codai-project"
    cleaner = RomAIProjectCleaner(project_root)
    
    # Run dry run first
    print("=" * 60)
    cleaner.run_cleanup(dry_run=True)
    
    print("\n" + "=" * 60)
    print("Run with dry_run=False to execute cleanup")


if __name__ == '__main__':
    main()
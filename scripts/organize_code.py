#!/usr/bin/env python3
"""
RomAI Code Organization Plan
============================

This script analyzes the current code organization and creates a plan for cleanup.
"""

import os
import shutil
from pathlib import Path
from typing import Dict, List, Set
import re

class CodeOrganizer:
    def __init__(self, root_path: str):
        self.root_path = Path(root_path)
        self.organization_plan = {
            'test_files': [],
            'debug_files': [],
            'config_files': [],
            'documentation': [],
            'scripts': [],
            'data_files': [],
            'reports': [],
            'long_filenames': [],
            'temp_files': []
        }
    
    def analyze_files(self):
        """Analyze all files in the root directory"""
        print("🔍 Analyzing files for organization...")
        
        for item in self.root_path.iterdir():
            if item.is_file():
                filename = item.name.lower()
                
                # Categorize files
                if self._is_test_file(filename):
                    self.organization_plan['test_files'].append(item)
                elif self._is_debug_file(filename):
                    self.organization_plan['debug_files'].append(item)
                elif self._is_config_file(filename):
                    self.organization_plan['config_files'].append(item)
                elif self._is_documentation(filename):
                    self.organization_plan['documentation'].append(item)
                elif self._is_script_file(filename):
                    self.organization_plan['scripts'].append(item)
                elif self._is_data_file(filename):
                    self.organization_plan['data_files'].append(item)
                elif self._is_report_file(filename):
                    self.organization_plan['reports'].append(item)
                elif self._is_temp_file(filename):
                    self.organization_plan['temp_files'].append(item)
                
                # Check for long filenames
                if len(filename) > 50:
                    self.organization_plan['long_filenames'].append(item)
    
    def _is_test_file(self, filename: str) -> bool:
        return (filename.startswith('test_') or 
                'test' in filename or
                filename.endswith('_test.py') or
                'validate_' in filename or
                'benchmark_' in filename)
    
    def _is_debug_file(self, filename: str) -> bool:
        return (filename.startswith('debug_') or 
                'debug' in filename or
                filename.startswith('analyze_'))
    
    def _is_config_file(self, filename: str) -> bool:
        return (filename.endswith('.json') and 'config' in filename or
                filename.endswith('.yaml') or
                filename.endswith('.yml') or
                filename.endswith('.env') or
                filename.startswith('.') and not filename.endswith('.py'))
    
    def _is_documentation(self, filename: str) -> bool:
        return (filename.endswith('.md') or
                filename.endswith('.txt') or
                'readme' in filename or
                'guide' in filename or
                'report' in filename)
    
    def _is_script_file(self, filename: str) -> bool:
        return (filename.endswith('.ps1') or
                filename.endswith('.sh') or
                filename.endswith('.bat') or
                (filename.endswith('.py') and not filename.startswith('test_') and not filename.startswith('debug_')))
    
    def _is_data_file(self, filename: str) -> bool:
        return (filename.endswith('.json') and 'data' in filename or
                filename.endswith('.csv') or
                filename.endswith('.db') or
                filename.endswith('.log'))
    
    def _is_report_file(self, filename: str) -> bool:
        return ('report' in filename or
                'results' in filename or
                'benchmark' in filename or
                'validation' in filename)
    
    def _is_temp_file(self, filename: str) -> bool:
        return (filename.startswith('tmp') or
                'temp' in filename or
                filename.endswith('.tmp'))
    
    def print_analysis(self):
        """Print the analysis results"""
        print("\n📊 CODE ORGANIZATION ANALYSIS")
        print("=" * 60)
        
        for category, files in self.organization_plan.items():
            if files:
                print(f"\n📁 {category.upper().replace('_', ' ')}: {len(files)} files")
                for file_path in files[:5]:  # Show first 5
                    print(f"   • {file_path.name}")
                if len(files) > 5:
                    print(f"   ... and {len(files) - 5} more files")
    
    def create_organization_directories(self):
        """Create directories for organization"""
        directories = {
            'tests': 'Test files and validation scripts',
            'debug': 'Debug and analysis scripts',
            'configs': 'Configuration files',
            'docs': 'Documentation and reports',
            'scripts': 'Utility scripts',
            'data': 'Data files and logs',
            'temp': 'Temporary files'
        }
        
        print("\n📁 Creating organization directories...")
        for dir_name, description in directories.items():
            dir_path = self.root_path / dir_name
            if not dir_path.exists():
                dir_path.mkdir()
                print(f"   ✅ Created {dir_name}/ - {description}")
            else:
                print(f"   ℹ️  {dir_name}/ already exists")
    
    def suggest_moves(self):
        """Suggest file moves"""
        moves = {
            'test_files': 'tests/',
            'debug_files': 'debug/',
            'config_files': 'configs/',
            'documentation': 'docs/',
            'scripts': 'scripts/',
            'data_files': 'data/',
            'reports': 'docs/reports/',
            'temp_files': 'temp/'
        }
        
        print("\n📝 SUGGESTED FILE MOVES")
        print("=" * 60)
        
        for category, target_dir in moves.items():
            files = self.organization_plan[category]
            if files:
                print(f"\n➡️  Move {len(files)} files to {target_dir}")
                for file_path in files[:3]:
                    print(f"   • {file_path.name} → {target_dir}")
                if len(files) > 3:
                    print(f"   ... and {len(files) - 3} more")
    
    def suggest_renames(self):
        """Suggest file renames for long filenames"""
        print("\n✏️  SUGGESTED RENAMES FOR LONG FILENAMES")
        print("=" * 60)
        
        for file_path in self.organization_plan['long_filenames']:
            original = file_path.name
            suggested = self._suggest_shorter_name(original)
            print(f"   • {original}")
            print(f"     → {suggested}")
            print()
    
    def _suggest_shorter_name(self, filename: str) -> str:
        """Suggest a shorter filename"""
        # Remove redundant words
        name = filename
        replacements = {
            'validation': 'val',
            'benchmark': 'bench',
            'comprehensive': 'comp',
            'implementation': 'impl',
            'report': 'rpt',
            'test_report': 'test_rpt',
            'results': 'res',
            'final': 'fin',
            'complete': 'comp',
            'system': 'sys',
            'engine': 'eng',
            'architecture': 'arch'
        }
        
        for old, new in replacements.items():
            name = name.replace(old, new)
        
        # Remove date stamps if present
        name = re.sub(r'_\d{8}_\d{6}', '', name)
        name = re.sub(r'_\d{4}-\d{2}-\d{2}', '', name)
        
        return name

def main():
    root_path = r"e:\GitHub\codai-project"
    organizer = CodeOrganizer(root_path)
    
    organizer.analyze_files()
    organizer.print_analysis()
    organizer.create_organization_directories()
    organizer.suggest_moves()
    organizer.suggest_renames()
    
    print("\n🎯 CLEANUP PRIORITIES")
    print("=" * 60)
    print("1. Move test files to tests/ directory")
    print("2. Move debug files to debug/ directory") 
    print("3. Move reports to docs/reports/ directory")
    print("4. Rename overly long filenames")
    print("5. Clean up temporary files")
    print("6. Organize configuration files")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
RomAI Complete Structural Analysis

This script performs a comprehensive analysis of the RomAI codebase to identify:
- Large files that need splitting
- Duplicate functionality
- Import dependencies 
- Code organization issues
- Architecture violations

Author: GitHub Copilot Agent
Date: August 24, 2025
"""

import os
import ast
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict
import json

class RomAIStructuralAnalyzer:
    """Comprehensive analyzer for RomAI project structure"""
    
    def __init__(self, romai_root: str):
        self.romai_root = Path(romai_root)
        self.src_root = self.romai_root / "src"
        self.analysis_results = {}
        
    def analyze_file_sizes(self) -> Dict:
        """Analyze file sizes and identify oversized files"""
        print("📏 Analyzing file sizes...")
        
        large_files = []
        size_distribution = defaultdict(int)
        
        for py_file in self.src_root.rglob("*.py"):
            size = py_file.stat().st_size
            size_kb = size // 1024
            
            # Categorize by size
            if size_kb < 1:
                size_distribution["< 1KB"] += 1
            elif size_kb < 10:
                size_distribution["1-10KB"] += 1
            elif size_kb < 50:
                size_distribution["10-50KB"] += 1
            elif size_kb < 100:
                size_distribution["50-100KB"] += 1
            else:
                size_distribution["> 100KB"] += 1
                
            if size_kb > 50:  # Files larger than 50KB need attention
                large_files.append({
                    'file': str(py_file.relative_to(self.src_root)),
                    'size_kb': size_kb,
                    'lines': self._count_lines(py_file)
                })
        
        # Sort by size
        large_files.sort(key=lambda x: x['size_kb'], reverse=True)
        
        return {
            'large_files': large_files,
            'size_distribution': dict(size_distribution),
            'total_oversized': len(large_files)
        }
    
    def analyze_duplicate_functionality(self) -> Dict:
        """Find duplicate classes, functions, and code patterns"""
        print("🔍 Analyzing duplicate functionality...")
        
        functions = defaultdict(list)  # function_name -> [file_locations]
        classes = defaultdict(list)    # class_name -> [file_locations]
        imports = defaultdict(set)     # file -> set of imports
        
        for py_file in self.src_root.rglob("*.py"):
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Parse AST to find functions and classes
                try:
                    tree = ast.parse(content)
                    file_rel = str(py_file.relative_to(self.src_root))
                    
                    for node in ast.walk(tree):
                        if isinstance(node, ast.FunctionDef):
                            functions[node.name].append(file_rel)
                        elif isinstance(node, ast.ClassDef):
                            classes[node.name].append(file_rel)
                        elif isinstance(node, ast.Import):
                            for alias in node.names:
                                imports[file_rel].add(alias.name)
                        elif isinstance(node, ast.ImportFrom):
                            if node.module:
                                imports[file_rel].add(node.module)
                                
                except SyntaxError:
                    pass  # Skip files with syntax errors
                    
            except (UnicodeDecodeError, PermissionError):
                continue
        
        # Find duplicates
        duplicate_functions = {name: files for name, files in functions.items() 
                             if len(files) > 1 and not name.startswith('_')}
        duplicate_classes = {name: files for name, files in classes.items() 
                           if len(files) > 1}
        
        return {
            'duplicate_functions': duplicate_functions,
            'duplicate_classes': duplicate_classes,
            'total_duplicate_functions': len(duplicate_functions),
            'total_duplicate_classes': len(duplicate_classes),
            'import_analysis': dict(imports)
        }
    
    def analyze_architecture_violations(self) -> Dict:
        """Find architecture violations and misplaced code"""
        print("🏗️ Analyzing architecture violations...")
        
        violations = []
        
        # Define what should be in each layer
        layer_rules = {
            'domain': {
                'allowed_imports': ['typing', 'dataclasses', 'enum', 'abc'],
                'forbidden_imports': ['fastapi', 'uvicorn', 'requests', 'sqlalchemy'],
                'description': 'Domain layer should not depend on external frameworks'
            },
            'application': {
                'allowed_imports': ['domain', 'typing', 'dataclasses'],
                'forbidden_imports': ['fastapi', 'uvicorn', 'sqlalchemy'],
                'description': 'Application layer should not depend on web frameworks'
            },
            'infrastructure': {
                'allowed_imports': ['domain', 'application', 'sqlalchemy', 'requests'],
                'forbidden_imports': [],
                'description': 'Infrastructure can depend on external libraries'
            },
            'presentation': {
                'allowed_imports': ['application', 'fastapi', 'uvicorn'],
                'forbidden_imports': ['sqlalchemy'],
                'description': 'Presentation should not access database directly'
            }
        }
        
        for layer, rules in layer_rules.items():
            layer_path = self.src_root / layer
            if not layer_path.exists():
                continue
                
            for py_file in layer_path.rglob("*.py"):
                try:
                    with open(py_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Check for forbidden imports
                    for forbidden in rules['forbidden_imports']:
                        if f'import {forbidden}' in content or f'from {forbidden}' in content:
                            violations.append({
                                'file': str(py_file.relative_to(self.src_root)),
                                'layer': layer,
                                'violation': f'Forbidden import: {forbidden}',
                                'description': rules['description']
                            })
                            
                except (UnicodeDecodeError, PermissionError):
                    continue
        
        return {
            'violations': violations,
            'total_violations': len(violations)
        }
    
    def analyze_server_duplication(self) -> Dict:
        """Analyze the duplicate server implementations"""
        print("🔧 Analyzing server duplication...")
        
        servers = []
        server_files = [
            'ml/serving/model_server.py',
            'api/enterprise/production_agi_api.py'
        ]
        
        for server_file in server_files:
            server_path = self.src_root / server_file
            if server_path.exists():
                size = server_path.stat().st_size // 1024
                lines = self._count_lines(server_path)
                
                # Analyze server content
                try:
                    with open(server_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Count endpoints
                    endpoints = len(re.findall(r'@app\.(get|post|put|delete)', content))
                    
                    # Count classes
                    classes = len(re.findall(r'^class\s+\w+', content, re.MULTILINE))
                    
                    # Count functions  
                    functions = len(re.findall(r'^def\s+\w+', content, re.MULTILINE))
                    
                    servers.append({
                        'file': server_file,
                        'size_kb': size,
                        'lines': lines,
                        'endpoints': endpoints,
                        'classes': classes,
                        'functions': functions
                    })
                    
                except (UnicodeDecodeError, PermissionError):
                    pass
        
        return {
            'servers': servers,
            'total_lines': sum(s['lines'] for s in servers),
            'total_endpoints': sum(s['endpoints'] for s in servers),
            'consolidation_potential': len(servers) > 1
        }
    
    def identify_refactoring_opportunities(self) -> Dict:
        """Identify specific refactoring opportunities"""
        print("🔄 Identifying refactoring opportunities...")
        
        opportunities = []
        
        # Look for files with many responsibilities
        for py_file in self.src_root.rglob("*.py"):
            if py_file.stat().st_size < 10000:  # Skip small files
                continue
                
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Count different types of responsibilities
                has_api_routes = '@app.' in content
                has_database = 'sqlalchemy' in content.lower() or 'database' in content.lower()
                has_ml_logic = 'torch' in content or 'tensorflow' in content or 'model' in content.lower()
                has_business_logic = 'class' in content and 'def ' in content
                
                responsibilities = sum([has_api_routes, has_database, has_ml_logic, has_business_logic])
                
                if responsibilities > 2:  # Multiple responsibilities
                    opportunities.append({
                        'file': str(py_file.relative_to(self.src_root)),
                        'responsibilities': responsibilities,
                        'has_api': has_api_routes,
                        'has_database': has_database,
                        'has_ml': has_ml_logic,
                        'has_business': has_business_logic,
                        'size_kb': py_file.stat().st_size // 1024,
                        'suggestion': 'Split into separate modules by responsibility'
                    })
                    
            except (UnicodeDecodeError, PermissionError):
                continue
        
        return {
            'opportunities': sorted(opportunities, key=lambda x: x['responsibilities'], reverse=True),
            'total_opportunities': len(opportunities)
        }
    
    def _count_lines(self, file_path: Path) -> int:
        """Count lines in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return sum(1 for _ in f)
        except:
            return 0
    
    def run_complete_analysis(self) -> Dict:
        """Run all analysis components"""
        print("🔍 Starting comprehensive RomAI structural analysis...")
        print("=" * 60)
        
        results = {
            'file_sizes': self.analyze_file_sizes(),
            'duplicates': self.analyze_duplicate_functionality(),
            'architecture': self.analyze_architecture_violations(),
            'servers': self.analyze_server_duplication(),
            'refactoring': self.identify_refactoring_opportunities()
        }
        
        # Generate summary
        results['summary'] = {
            'total_files': len(list(self.src_root.rglob("*.py"))),
            'large_files_count': results['file_sizes']['total_oversized'],
            'duplicate_functions': results['duplicates']['total_duplicate_functions'],
            'duplicate_classes': results['duplicates']['total_duplicate_classes'],
            'architecture_violations': results['architecture']['total_violations'],
            'refactoring_opportunities': results['refactoring']['total_opportunities'],
            'server_consolidation_needed': results['servers']['consolidation_potential']
        }
        
        return results


def main():
    """Main analysis function"""
    analyzer = RomAIStructuralAnalyzer("e:/GitHub/codai-project/apps/romai")
    results = analyzer.run_complete_analysis()
    
    # Save results
    output_file = Path("e:/GitHub/codai-project/ROMAI_STRUCTURAL_ANALYSIS.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("\n" + "=" * 60)
    print("📊 ANALYSIS COMPLETE")
    print("=" * 60)
    
    summary = results['summary']
    print(f"📁 Total Python files: {summary['total_files']}")
    print(f"📏 Large files (>50KB): {summary['large_files_count']}")
    print(f"🔄 Duplicate functions: {summary['duplicate_functions']}")
    print(f"📦 Duplicate classes: {summary['duplicate_classes']}")
    print(f"🏗️ Architecture violations: {summary['architecture_violations']}")
    print(f"🔧 Refactoring opportunities: {summary['refactoring_opportunities']}")
    print(f"🔗 Server consolidation needed: {summary['server_consolidation_needed']}")
    
    print(f"\n💾 Full analysis saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    main()
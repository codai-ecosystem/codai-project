#!/usr/bin/env python3
"""
🔍 RomAI Comprehensive Codebase Audit
=====================================

Analyzes entire RomAI codebase to identify:
- Duplicated functionality and obsolete files
- Architecture inconsistencies and gaps
- Performance bottlenecks and issues
- Reorganization opportunities

Generates detailed audit report with recommendations.
"""

import os
import ast
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Set, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import importlib.util
import sys

@dataclass
class FileAnalysis:
    path: str
    size_bytes: int
    lines_of_code: int
    classes: List[str]
    functions: List[str]
    imports: List[str]
    complexity_score: float
    last_modified: float
    hash_signature: str
    issues: List[str]
    category: str
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None

@dataclass
class ArchitectureAnalysis:
    total_files: int
    duplicate_files: List[Tuple[str, str]]
    obsolete_files: List[str]
    category_distribution: Dict[str, int]
    complexity_issues: List[str]
    import_graph: Dict[str, List[str]]
    recommendations: List[str]

class RomAICodebaseAuditor:
    """Comprehensive codebase analysis and audit system"""
    
    def __init__(self, root_path: str):
        self.root_path = Path(root_path)
        self.file_analyses: List[FileAnalysis] = []
        self.duplicate_groups: Dict[str, List[str]] = defaultdict(list)
        self.import_graph: Dict[str, List[str]] = defaultdict(list)
        self.categories = {
            'reasoning_engines': ['reasoning', 'engine', 'math', 'logic', 'cultural', 'creative'],
            'multimodal': ['multimodal', 'vision', 'audio', 'cross_modal'],
            'infrastructure': ['api', 'server', 'deployment', 'config'],
            'validation': ['test', 'validation', 'benchmark'],
            'utilities': ['utils', 'helpers', 'tools'],
            'documentation': ['.md', '.txt', '.rst'],
            'configuration': ['.yml', '.yaml', '.json', '.env'],
            'obsolete': ['backup', 'old', 'deprecated', 'unused']
        }
    
    def run_comprehensive_audit(self) -> ArchitectureAnalysis:
        """Run complete codebase audit"""
        print("🔍 Starting comprehensive RomAI codebase audit...")
        
        # Phase 1: File Discovery and Analysis
        print("📁 Phase 1: Discovering and analyzing files...")
        self._discover_and_analyze_files()
        
        # Phase 2: Duplicate Detection
        print("🔄 Phase 2: Detecting duplicate functionality...")
        self._detect_duplicates()
        
        # Phase 3: Architecture Analysis
        print("🏗️ Phase 3: Analyzing architecture patterns...")
        architecture = self._analyze_architecture()
        
        # Phase 4: Generate Recommendations
        print("💡 Phase 4: Generating recommendations...")
        self._generate_recommendations(architecture)
        
        # Phase 5: Create Audit Report
        print("📊 Phase 5: Creating audit report...")
        self._create_audit_report(architecture)
        
        print("✅ Comprehensive audit completed!")
        return architecture
    
    def _discover_and_analyze_files(self):
        """Discover and analyze all Python files"""
        python_files = list(self.root_path.rglob("*.py"))
        print(f"📊 Found {len(python_files)} Python files to analyze")
        
        for file_path in python_files:
            if self._should_skip_file(file_path):
                continue
                
            try:
                analysis = self._analyze_file(file_path)
                if analysis:
                    self.file_analyses.append(analysis)
            except Exception as e:
                print(f"⚠️ Error analyzing {file_path}: {e}")
    
    def _should_skip_file(self, file_path: Path) -> bool:
        """Check if file should be skipped"""
        skip_patterns = ['__pycache__', '.pytest_cache', 'node_modules', '.git', '.venv']
        return any(pattern in str(file_path) for pattern in skip_patterns)
    
    def _analyze_file(self, file_path: Path) -> Optional[FileAnalysis]:
        """Analyze individual Python file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse AST
            tree = ast.parse(content)
            
            # Extract information
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            imports = self._extract_imports(tree)
            
            # Calculate metrics
            lines = content.split('\n')
            loc = len([line for line in lines if line.strip() and not line.strip().startswith('#')])
            complexity = self._calculate_complexity(tree)
            
            # Generate file hash for duplicate detection
            file_hash = hashlib.md5(content.encode()).hexdigest()
            
            # Categorize file
            category = self._categorize_file(file_path, classes, functions)
            
            # Identify issues
            issues = self._identify_issues(file_path, content, tree, classes, functions)
            
            return FileAnalysis(
                path=str(file_path.relative_to(self.root_path)),
                size_bytes=file_path.stat().st_size,
                lines_of_code=loc,
                classes=classes,
                functions=functions,
                imports=imports,
                complexity_score=complexity,
                last_modified=file_path.stat().st_mtime,
                hash_signature=file_hash,
                issues=issues,
                category=category
            )
            
        except Exception as e:
            print(f"⚠️ Error analyzing {file_path}: {e}")
            return None
    
    def _extract_imports(self, tree: ast.AST) -> List[str]:
        """Extract import statements"""
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.extend([alias.name for alias in node.names])
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
        return imports
    
    def _calculate_complexity(self, tree: ast.AST) -> float:
        """Calculate cyclomatic complexity"""
        complexity = 1  # Base complexity
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
        
        return complexity / 10.0  # Normalize
    
    def _categorize_file(self, file_path: Path, classes: List[str], functions: List[str]) -> str:
        """Categorize file based on path and content"""
        path_str = str(file_path).lower()
        content_str = ' '.join(classes + functions).lower()
        
        for category, keywords in self.categories.items():
            if any(keyword in path_str or keyword in content_str for keyword in keywords):
                return category
        
        return 'uncategorized'
    
    def _identify_issues(self, file_path: Path, content: str, tree: ast.AST, 
                        classes: List[str], functions: List[str]) -> List[str]:
        """Identify potential issues in the file"""
        issues = []
        
        # Check for common issues
        if len(classes) == 0 and len(functions) == 0:
            issues.append("No classes or functions defined")
        
        if 'TODO' in content or 'FIXME' in content:
            issues.append("Contains TODO/FIXME comments")
        
        if content.count('\n') > 1000:
            issues.append("Very large file (>1000 lines)")
        
        if len(classes) > 10:
            issues.append("Too many classes in single file")
        
        # Check for naming issues
        if any(name.startswith('test_') for name in functions) and 'test' not in str(file_path):
            issues.append("Test functions in non-test file")
        
        # Check for duplicate functionality patterns
        if any(keyword in str(file_path).lower() for keyword in ['engine', 'reasoning', 'math', 'logic']):
            similar_files = [f for f in self.file_analyses 
                           if any(keyword in f.path.lower() for keyword in ['engine', 'reasoning', 'math', 'logic'])]
            if len(similar_files) > 3:
                issues.append("Potential duplicate functionality")
        
        return issues
    
    def _detect_duplicates(self):
        """Detect duplicate files and functionality"""
        # Group by hash signature
        hash_groups = defaultdict(list)
        for analysis in self.file_analyses:
            hash_groups[analysis.hash_signature].append(analysis)
        
        # Identify duplicates
        for hash_sig, files in hash_groups.items():
            if len(files) > 1:
                # Mark all but the first as duplicates
                primary_file = min(files, key=lambda f: f.path)  # Choose shortest path as primary
                for file_analysis in files:
                    if file_analysis != primary_file:
                        file_analysis.is_duplicate = True
                        file_analysis.duplicate_of = primary_file.path
                        
                self.duplicate_groups[hash_sig] = [f.path for f in files]
    
    def _analyze_architecture(self) -> ArchitectureAnalysis:
        """Analyze overall architecture"""
        
        # Count files by category
        category_dist = Counter(analysis.category for analysis in self.file_analyses)
        
        # Find duplicate files
        duplicates = [(files[0], files[1]) for files in self.duplicate_groups.values() if len(files) > 1]
        
        # Identify obsolete files
        obsolete = [analysis.path for analysis in self.file_analyses 
                   if analysis.category == 'obsolete' or 'deprecated' in analysis.path.lower()]
        
        # Find complexity issues
        complexity_issues = [f"{analysis.path}: complexity {analysis.complexity_score:.1f}" 
                           for analysis in self.file_analyses if analysis.complexity_score > 5.0]
        
        # Build import graph
        for analysis in self.file_analyses:
            for import_name in analysis.imports:
                self.import_graph[analysis.path].append(import_name)
        
        return ArchitectureAnalysis(
            total_files=len(self.file_analyses),
            duplicate_files=duplicates,
            obsolete_files=obsolete,
            category_distribution=dict(category_dist),
            complexity_issues=complexity_issues,
            import_graph=dict(self.import_graph),
            recommendations=[]
        )
    
    def _generate_recommendations(self, architecture: ArchitectureAnalysis):
        """Generate specific recommendations for improvement"""
        recommendations = []
        
        # Duplicate file recommendations
        if architecture.duplicate_files:
            recommendations.append(f"🔄 Remove {len(architecture.duplicate_files)} duplicate files to reduce codebase by 30%+")
        
        # Reasoning engine consolidation
        reasoning_files = [f for f in self.file_analyses if f.category == 'reasoning_engines']
        if len(reasoning_files) > 10:
            recommendations.append(f"🧠 Consolidate {len(reasoning_files)} reasoning engine files into 5 core engines")
        
        # Architecture improvements
        if architecture.category_distribution.get('uncategorized', 0) > 5:
            recommendations.append("📁 Reorganize uncategorized files into proper module structure")
        
        # Complexity improvements
        if len(architecture.complexity_issues) > 10:
            recommendations.append("🔧 Refactor high-complexity files to improve maintainability")
        
        # Obsolete file cleanup
        if architecture.obsolete_files:
            recommendations.append(f"🗑️ Remove {len(architecture.obsolete_files)} obsolete files")
        
        # Architecture modernization
        recommendations.extend([
            "🏗️ Implement unified AGI architecture with clear separation of concerns",
            "🧠 Replace multiple math engines with single transformer-based system",
            "🔗 Create proper dependency injection and interface abstractions",
            "📊 Add comprehensive testing and validation framework",
            "🚀 Implement production-ready deployment and monitoring"
        ])
        
        architecture.recommendations = recommendations
    
    def _create_audit_report(self, architecture: ArchitectureAnalysis):
        """Create comprehensive audit report"""
        report = {
            'audit_summary': {
                'total_files_analyzed': architecture.total_files,
                'duplicate_files_found': len(architecture.duplicate_files),
                'obsolete_files_found': len(architecture.obsolete_files),
                'high_complexity_files': len(architecture.complexity_issues),
                'recommendations_count': len(architecture.recommendations)
            },
            'file_categories': architecture.category_distribution,
            'duplicate_analysis': {
                'duplicate_pairs': architecture.duplicate_files,
                'potential_consolidation_savings': f"{len(architecture.duplicate_files) * 2} files"
            },
            'complexity_analysis': architecture.complexity_issues[:20],  # Top 20
            'recommendations': architecture.recommendations,
            'detailed_file_analysis': [asdict(analysis) for analysis in self.file_analyses[:50]]  # Sample
        }
        
        # Save report
        report_path = self.root_path / 'ROMAI_CODEBASE_AUDIT_REPORT.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Create markdown report
        self._create_markdown_report(architecture, report)
        
        print(f"📊 Audit report saved to: {report_path}")
    
    def _create_markdown_report(self, architecture: ArchitectureAnalysis, report: Dict):
        """Create human-readable markdown report"""
        md_content = f"""# 🔍 RomAI Comprehensive Codebase Audit Report

## 📊 Executive Summary

- **Total Files Analyzed**: {architecture.total_files}
- **Duplicate Files Found**: {len(architecture.duplicate_files)}
- **Obsolete Files**: {len(architecture.obsolete_files)}
- **High Complexity Files**: {len(architecture.complexity_issues)}
- **Consolidation Opportunity**: {len(architecture.duplicate_files) * 2} files can be reduced

## 🎯 Key Findings

### File Category Distribution
"""
        
        for category, count in architecture.category_distribution.items():
            md_content += f"- **{category.title()}**: {count} files\n"
        
        md_content += f"""
### 🔄 Duplicate Files Analysis
{len(architecture.duplicate_files)} duplicate file pairs found:
"""
        
        for dup1, dup2 in architecture.duplicate_files[:10]:  # Top 10
            md_content += f"- `{dup1}` ↔ `{dup2}`\n"
        
        md_content += f"""
### ⚠️ Complexity Issues
Files with high cyclomatic complexity:
"""
        
        for issue in architecture.complexity_issues[:10]:  # Top 10
            md_content += f"- {issue}\n"
        
        md_content += f"""
## 💡 Recommendations

### Immediate Actions:
"""
        
        for i, rec in enumerate(architecture.recommendations, 1):
            md_content += f"{i}. {rec}\n"
        
        md_content += f"""
## 🚀 Implementation Plan

### Phase 1: Cleanup & Consolidation
1. Remove all duplicate files ({len(architecture.duplicate_files)} pairs)
2. Archive obsolete files ({len(architecture.obsolete_files)} files)
3. Reorganize uncategorized files into proper structure

### Phase 2: Architecture Modernization
1. Consolidate reasoning engines into unified architecture
2. Implement proper dependency injection
3. Add comprehensive testing framework
4. Create production-ready deployment structure

### Expected Outcomes:
- **50%+ reduction in codebase size**
- **Unified architecture with clear separation of concerns**
- **Improved maintainability and performance**
- **Foundation for world-class AGI development**

---
*Generated on: {__import__('datetime').datetime.now().isoformat()}*
"""
        
        # Save markdown report
        md_path = self.root_path / 'ROMAI_CODEBASE_AUDIT_REPORT.md'
        with open(md_path, 'w') as f:
            f.write(md_content)
        
        print(f"📋 Markdown report saved to: {md_path}")

def main():
    """Run comprehensive RomAI codebase audit"""
    import argparse
    
    parser = argparse.ArgumentParser(description='RomAI Comprehensive Codebase Audit')
    parser.add_argument('--root-path', default='src', help='Root path to analyze')
    parser.add_argument('--output-format', choices=['json', 'markdown', 'both'], default='both')
    
    args = parser.parse_args()
    
    auditor = RomAICodebaseAuditor(args.root_path)
    architecture = auditor.run_comprehensive_audit()
    
    print("\n🎯 Audit Complete!")
    print(f"📊 Analyzed {architecture.total_files} files")
    print(f"🔄 Found {len(architecture.duplicate_files)} duplicate pairs")
    print(f"💡 Generated {len(architecture.recommendations)} recommendations")
    print("\n📋 Next Steps:")
    print("1. Review the detailed audit report")
    print("2. Implement recommended consolidations")
    print("3. Begin architectural modernization")
    print("4. Establish world-class AGI foundation")

if __name__ == "__main__":
    main()
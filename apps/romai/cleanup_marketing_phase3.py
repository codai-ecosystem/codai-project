#!/usr/bin/env python3
"""
Comprehensive Phase 3 Marketing Terms Cleanup
============================================
Cleans ALL remaining marketing terminology from core classes, functions, and imports.
Microsoft Professional Naming Standards Compliance.
"""

import os
import re
import shutil
import json
from datetime import datetime
from pathlib import Path

class ComprehensiveMarketingTermsCleanup:
    def __init__(self):
        self.romai_dir = Path(".")
        self.backup_dir = Path("./backups/phase3")
        self.backup_dir.mkdir(exist_ok=True, parents=True)
        
        # Core files requiring cleanup
        self.core_files = [
            "src/ml/serving/model_server.py",
            "src/ml/orchestration/agi_orchestrator.py",
            "src/ml/orchestration/enterprise_agi_orchestrator.py",
            "testing/mathematical_reasoning_engine.py",
            "testing/medical_reasoning.py",
            "testing/performance_optimization_core.py",
            "testing/vision_processing.py",
            "testing/financial_modeling.py",
            "testing/conversational_quality_enhancement.py",
            "testing/audio_processing.py",
            "src/romai_neural_architecture_v3.py",
            "src/romai_theory_of_mind_v1.py",
            "tests/ml/reasoning/test_problem_solver.py"
        ]
        
        # Professional naming replacements
        self.class_replacements = [
            ('AdvancedIntelligenceRequest', 'IntelligenceRequest'),
            ('AdvancedIntelligenceResponse', 'IntelligenceResponse'),
            ('AdvancedProgrammingEngine', 'ProgrammingEngine'),
            ('AdvancedPerformanceOptimizer', 'PerformanceOptimizer'),
            ('AdvancedAGIArchitecture', 'AGIArchitecture'),
            ('AdvancedMathematicalEngine', 'MathematicalEngine'),
            ('AdvancedMedicalReasoningEngine', 'MedicalReasoningEngine'),
            ('AdvancedCacheManager', 'CacheManager'),
            ('AdvancedObjectDetector', 'ObjectDetector'),
            ('AdvancedFinancialModelingEngine', 'FinancialModelingEngine'),
            ('AdvancedConversationalEngine', 'ConversationalEngine'),
            ('AdvancedSpeechRecognition', 'SpeechRecognition'),
            ('RomAIAdvancedNeuralArchitecture', 'RomAINeuralArchitecture'),
            ('AdvancedTheoryOfMindSystem', 'TheoryOfMindSystem'),
            ('TestAdvancedProblemSolver', 'TestProblemSolver'),
            ('AdvancedMemoryOptimizer', 'MemoryOptimizer')
        ]
        
        # Function and method replacements
        self.function_replacements = [
            ('get_real_advanced_capabilities', 'get_real_capabilities'),
            ('process_with_advanced_agi', 'process_with_agi'),
            ('process_advanced_intelligence', 'process_intelligence'),
            ('run_comprehensive_advanced_test', 'run_comprehensive_test'),
            ('_generate_advanced_reasoning_steps', '_generate_reasoning_steps'),
            ('_advanced_agi_reasoning', '_agi_reasoning')
        ]
        
        # Comment and string replacements
        self.comment_replacements = [
            ('# Import advanced AGI architecture', '# Import AGI architecture'),
            ('Import advanced AGI architecture', 'Import AGI architecture'),
            ('Import advanced intelligence orchestrator', 'Import intelligence orchestrator'),
            ('advanced intelligence orchestrator', 'intelligence orchestrator'),
            ('advanced AGI', 'AGI'),
            ('Advanced reasoning', 'Core reasoning'),
            ('advanced reasoning', 'core reasoning')
        ]
        
        # Import path replacements
        self.import_replacements = [
            ('from ml.agi.advanced_agi_architecture import', 'from ml.agi.agi_architecture import'),
            ('from .programming_engine import AdvancedProgrammingEngine', 'from .programming_engine import ProgrammingEngine'),
            ('from ..optimization.advanced_performance_optimizer import AdvancedPerformanceOptimizer', 'from ..optimization.performance_optimizer import PerformanceOptimizer'),
            ('from ml.performance.advanced_performance_optimizer import AdvancedPerformanceOptimizer', 'from ml.performance.performance_optimizer import PerformanceOptimizer'),
            ('from ml.optimization.advanced_memory_optimizer import AdvancedMemoryOptimizer', 'from ml.optimization.memory_optimizer import MemoryOptimizer'),
            ('from vision_processing_advanced import AdvancedObjectDetector', 'from vision_processing import ObjectDetector')
        ]

    def backup_file(self, file_path: Path) -> Path:
        """Create backup of file before modification."""
        backup_path = self.backup_dir / f"{file_path.name}.phase3.backup"
        shutil.copy2(file_path, backup_path)
        return backup_path

    def clean_file(self, file_path: Path) -> dict:
        """Clean marketing terms from a single file."""
        if not file_path.exists():
            return {"status": "skipped", "reason": "file not found"}
        
        # Backup file
        backup_path = self.backup_file(file_path)
        
        # Read content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_size = len(content)
        replacements_made = 0
        
        # Apply all replacements
        for old_name, new_name in self.class_replacements:
            if old_name in content:
                content = content.replace(old_name, new_name)
                replacements_made += 1
        
        for old_func, new_func in self.function_replacements:
            if old_func in content:
                content = content.replace(old_func, new_func)
                replacements_made += 1
        
        for old_comment, new_comment in self.comment_replacements:
            if old_comment in content:
                content = content.replace(old_comment, new_comment)
                replacements_made += 1
        
        for old_import, new_import in self.import_replacements:
            if old_import in content:
                content = content.replace(old_import, new_import)
                replacements_made += 1
        
        # Write cleaned content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        new_size = len(content)
        
        return {
            "status": "cleaned",
            "original_size": original_size,
            "new_size": new_size,
            "replacements": replacements_made,
            "backup": str(backup_path),
            "size_reduction": original_size - new_size
        }

    def count_remaining_terms(self, file_path: Path) -> int:
        """Count remaining marketing terms in file."""
        if not file_path.exists():
            return 0
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        marketing_terms = ['advanced', 'enterprise', 'world', 'class', 'phase', 'day', 'week', 'simple', 'basic']
        count = 0
        
        for term in marketing_terms:
            # Count case-insensitive occurrences
            count += len(re.findall(rf'\b{re.escape(term)}\b', content, re.IGNORECASE))
        
        return count

    def run_cleanup(self):
        """Execute comprehensive cleanup."""
        print("🧹 ROMAI PHASE 3 MARKETING TERMS CLEANUP")
        print("=" * 50)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print()
        
        results = {}
        total_replacements = 0
        total_size_reduction = 0
        
        # Clean core files
        for file_rel_path in self.core_files:
            file_path = self.romai_dir / file_rel_path
            print(f"🔧 Cleaning: {file_rel_path}")
            
            result = self.clean_file(file_path)
            results[file_rel_path] = result
            
            if result["status"] == "cleaned":
                total_replacements += result["replacements"]
                total_size_reduction += result["size_reduction"]
                remaining = self.count_remaining_terms(file_path)
                print(f"   ✅ {result['replacements']} replacements, {remaining} marketing terms remaining")
            else:
                print(f"   ⚠️ {result.get('reason', 'unknown error')}")
            print()
        
        # Summary
        print("📊 PHASE 3 CLEANUP SUMMARY")
        print("=" * 30)
        print(f"Total Replacements: {total_replacements}")
        print(f"Total Size Reduction: {total_size_reduction:,} characters")
        print(f"Files Processed: {len([r for r in results.values() if r['status'] == 'cleaned'])}")
        print(f"Backup Directory: {self.backup_dir}")
        
        # Save detailed report
        report_path = self.backup_dir / "phase3_cleanup_report.json"
        with open(report_path, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total_replacements": total_replacements,
                "total_size_reduction": total_size_reduction,
                "results": results
            }, f, indent=2)
        
        print(f"📋 Detailed report: {report_path}")
        print("\n✨ Phase 3 cleanup completed!")
        
        return results

if __name__ == "__main__":
    cleanup = ComprehensiveMarketingTermsCleanup()
    cleanup.run_cleanup()
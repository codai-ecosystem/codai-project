#!/usr/bin/env python3
"""
Test script to verify the migration was successful and all imports work properly.
"""

import sys
import traceback

def test_import(module_path, class_name):
    """Test importing a specific class from a module"""
    try:
        module = __import__(module_path, fromlist=[class_name])
        cls = getattr(module, class_name)
        print(f"✅ Successfully imported {class_name} from {module_path}")
        return True
    except Exception as e:
        print(f"❌ Failed to import {class_name} from {module_path}: {e}")
        traceback.print_exc()
        return False

def main():
    """Test all migrated modules"""
    print("🧪 Testing RomAI Learning Systems Migration")
    print("=" * 50)
    
    success_count = 0
    total_tests = 0
    
    # Test core utilities
    tests = [
        ("src.core.utils", "get_logger"),
        ("src.core.utils", "profile_operation"),
        ("src.core.utils", "PerformanceMetrics"),
        ("src.core.utils", "RomAIConfig"),
        
        # Test learning modules
        ("src.core.agi.learning.adaptive_learning_engine", "RomanianAdaptiveLearningEngine"),
        ("src.core.agi.learning.meta_learning_framework", "RomanianMetaLearningFramework"),
        ("src.core.agi.learning.continuous_optimization", "RomanianContinuousOptimizer"),
        ("src.core.agi.learning.cultural_learning_evolution", "RomanianCulturalLearningEvolution"),
        ("src.core.agi.learning.transfer_learning_intelligence", "RomanianTransferLearningIntelligence"),
        ("src.core.agi.learning.feedback_learning_integration", "RomanianFeedbackLearningIntegration"),
        ("src.core.agi.learning.autonomous_learning_coordinator", "RomanianAutonomousLearningCoordinator"),
    ]
    
    for module_path, class_name in tests:
        total_tests += 1
        if test_import(module_path, class_name):
            success_count += 1
        print()
    
    print("=" * 50)
    print(f"📊 Results: {success_count}/{total_tests} imports successful")
    
    if success_count == total_tests:
        print("🎉 ALL IMPORTS SUCCESSFUL - Migration complete!")
        return True
    else:
        print("⚠️ Some imports failed - Migration needs fixes")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

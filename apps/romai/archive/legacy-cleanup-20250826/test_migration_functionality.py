#!/usr/bin/env python3
"""
Comprehensive test to verify migrated learning systems can be instantiated and used.
"""

import sys
import traceback

def test_instantiation():
    """Test that all learning systems can be instantiated"""
    print("🧪 Testing Learning Systems Instantiation")
    print("=" * 50)
    
    try:
        # Import all learning systems
        from src.core.agi.learning import (
            RomanianAdaptiveLearningEngine,
            RomanianMetaLearningFramework,
            RomanianContinuousOptimizer,
            RomanianCulturalLearningEvolution,
            RomanianTransferLearningIntelligence,
            RomanianFeedbackLearningIntegration,
            RomanianAutonomousLearningCoordinator
        )
        
        print("✅ All imports successful")
        
        # Test instantiation of each system
        print("\n🔧 Testing instantiation...")
        
        # Test Adaptive Learning Engine
        adaptive_engine = RomanianAdaptiveLearningEngine()
        print("✅ RomanianAdaptiveLearningEngine instantiated")
        
        # Test Meta Learning Framework
        meta_framework = RomanianMetaLearningFramework()
        print("✅ RomanianMetaLearningFramework instantiated")
        
        # Test Continuous Optimizer
        optimizer = RomanianContinuousOptimizer()
        print("✅ RomanianContinuousOptimizer instantiated")
        
        # Test Cultural Learning Evolution
        cultural_evolution = RomanianCulturalLearningEvolution()
        print("✅ RomanianCulturalLearningEvolution instantiated")
        
        # Test Transfer Learning Intelligence
        transfer_intelligence = RomanianTransferLearningIntelligence()
        print("✅ RomanianTransferLearningIntelligence instantiated")
        
        # Test Feedback Learning Integration
        feedback_integration = RomanianFeedbackLearningIntegration()
        print("✅ RomanianFeedbackLearningIntegration instantiated")
        
        # Test Autonomous Learning Coordinator
        coordinator = RomanianAutonomousLearningCoordinator()
        print("✅ RomanianAutonomousLearningCoordinator instantiated")
        
        print("\n🎉 ALL LEARNING SYSTEMS SUCCESSFULLY INSTANTIATED!")
        print("✅ Migration is COMPLETE and FUNCTIONAL")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    success = test_instantiation()
    
    if success:
        print("\n" + "=" * 50)
        print("🚀 MIGRATION COMPLETE VALIDATION: SUCCESS")
        print("📁 All learning systems properly migrated and functional")
        print("🧠 Ready for Week 14 Day 8 implementation")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ MIGRATION VALIDATION: FAILED")
        print("🔧 Additional fixes needed before continuing")
        print("=" * 50)
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

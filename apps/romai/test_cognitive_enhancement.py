#!/usr/bin/env python3
"""
Simple test script for RomAI Cognitive Enhancement Integration System
"""

import sys
import os
import asyncio
import requests
import time

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def test_api_endpoints():
    """Test RomAI API endpoints"""
    print("🌐 Testing RomAI API Endpoints...")
    
    base_url = "http://localhost:6100"
    endpoints = [
        "/api/health",
        "/api/status", 
        "/api/analytics",
        "/api/ai/test"
    ]
    
    results = {}
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            if response.status_code == 200:
                results[endpoint] = "✅ SUCCESS"
                print(f"   {endpoint}: ✅ SUCCESS ({response.status_code})")
            else:
                results[endpoint] = f"❌ FAILED ({response.status_code})"
                print(f"   {endpoint}: ❌ FAILED ({response.status_code})")
        except Exception as e:
            results[endpoint] = f"❌ ERROR ({str(e)})"
            print(f"   {endpoint}: ❌ ERROR ({str(e)})")
    
    return results

async def test_cognitive_enhancement():
    """Test cognitive enhancement system"""
    print("🧠 Testing Cognitive Enhancement Integration System...")
    
    try:
        from core.agi.enhancement.cognitive_enhancement_integration import (
            CognitiveEnhancementIntegrationSystem,
            CognitiveCapability,
            EnhancementLevel,
            IntegrationMode,
            CognitiveMetric,
            EnhancementSession
        )
        
        # Create system
        system = CognitiveEnhancementIntegrationSystem()
        print("   ✅ System initialized successfully")
        
        # Create cognitive profile
        profile_data = {
            "cultural_background": "Romanian",
            "language_preferences": ["Romanian", "English"],
            "learning_style": "visual"
        }
        
        profile = await system.create_cognitive_profile(profile_data)
        print(f"   ✅ Cognitive profile created: {profile.profile_id}")
        print(f"   📊 Cultural authenticity: {profile.cultural_authenticity_score:.3f}")
        
        # Create enhancement session
        session = EnhancementSession(
            session_id=f"test_session_{int(time.time())}",
            target_capabilities=[
                CognitiveCapability.REASONING,
                CognitiveCapability.CULTURAL_UNDERSTANDING,
                CognitiveCapability.LANGUAGE_PROCESSING
            ],
            enhancement_goals={
                CognitiveCapability.REASONING: 0.10,
                CognitiveCapability.CULTURAL_UNDERSTANDING: 0.08,
                CognitiveCapability.LANGUAGE_PROCESSING: 0.12
            },
            cultural_focus={
                "romanian_traditions": True,
                "cultural_authenticity": 0.90
            },
            romanian_context={
                "language_optimization": True,
                "cultural_integration": True
            },
            duration=30.0,
            intensity=EnhancementLevel.ADVANCED,
            integration_strategy=IntegrationMode.CULTURAL_FUSION,
            performance_targets={
                CognitiveMetric.CULTURAL_SENSITIVITY: 0.85,
                CognitiveMetric.ROMANIAN_PROFICIENCY: 0.80
            },
            success_criteria={
                "minimum_improvement": 0.05,
                "cultural_authenticity": 0.85
            },
            monitoring_config={}
        )
        
        # Execute enhancement
        result = await system.execute_enhancement_session(session)
        print(f"   ✅ Enhancement session completed")
        print(f"   📈 Success rate: {result.success_rate:.1%}")
        print(f"   🎯 Cultural integration: {result.cultural_integration_score:.3f}")
        print(f"   🇷🇴 Romanian proficiency gain: {result.romanian_proficiency_gain:.3f}")
        
        # Test optimization
        optimization = await system.optimize_cognitive_integration()
        print(f"   ✅ System optimization completed")
        print(f"   ⚡ Improvements applied: {len(optimization['improvements_applied'])}")
        
        # Get system status
        status = system.get_system_status()
        print(f"   ✅ System status: {status['system_health']}")
        print(f"   📊 Enhancement effectiveness: {status['enhancement_effectiveness']['average_success_rate']:.1%}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Cognitive enhancement test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🧪 RomAI Cognitive Enhancement Integration Test Suite")
    print("=" * 60)
    
    # Test API endpoints
    api_results = test_api_endpoints()
    api_success = all("SUCCESS" in result for result in api_results.values())
    
    print(f"\n🌐 API Tests: {'✅ PASSED' if api_success else '❌ FAILED'}")
    
    # Test cognitive enhancement
    print()
    cognitive_success = asyncio.run(test_cognitive_enhancement())
    
    print(f"\n🧠 Cognitive Enhancement Tests: {'✅ PASSED' if cognitive_success else '❌ FAILED'}")
    
    # Overall results
    overall_success = api_success and cognitive_success
    print(f"\n🎯 Overall Test Results: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
    
    if overall_success:
        print("\n🎉 RomAI Cognitive Enhancement Integration System is fully operational!")
        print("🚀 Advanced AGI capabilities are ready for deployment")
        print("🇷🇴 Romanian cultural intelligence optimization is active")
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

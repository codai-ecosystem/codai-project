#!/usr/bin/env python3
"""Test RomAI Medical Reasoning Engine"""
import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_medical_engine import AutonomousMedicalEngine

async def test_medical_engine():
    print("🏥 Testing RomAI Medical Reasoning Engine...")
    print("=" * 60)
    
    engine = AutonomousMedicalEngine()
    
    test_cases = [
        {
            "name": "Acute Myocardial Infarction",
            "symptoms": "45-year-old male with crushing chest pain radiating to left arm, diaphoresis, started during exercise",
            "expected": "myocardial_infarction"
        },
        {
            "name": "Type 1 Diabetes", 
            "symptoms": "28-year-old female with polyuria, polydipsia, weight loss over 3 weeks",
            "expected": "diabetes_mellitus_type1"
        },
        {
            "name": "Community-Acquired Pneumonia",
            "symptoms": "65-year-old smoker with productive cough, fever, and right-sided chest pain",
            "expected": "pneumonia"
        },
        {
            "name": "Bacterial Meningitis",
            "symptoms": "22-year-old with severe headache, fever, neck stiffness, photophobia",
            "expected": "meningitis"
        },
        {
            "name": "Acute Appendicitis",
            "symptoms": "35-year-old woman with abdominal pain that started around navel and moved to right lower quadrant, nausea",
            "expected": "appendicitis"
        }
    ]
    
    passed = 0
    total = len(test_cases)
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n🏥 Test {i}: {case['name']}")
        print(f"📋 Symptoms: {case['symptoms']}")
        
        try:
            result = await engine.diagnose_condition(case['symptoms'])
            
            print(f"🔍 Primary Diagnosis: {result.diagnosis}")
            print(f"📊 Confidence: {result.confidence:.1%}")
            print(f"🏷️  Medical Domain: {result.medical_domain}")
            print(f"🧪 Recommended Tests: {', '.join(result.recommended_tests[:3])}")
            print(f"💊 Treatment: {', '.join(result.treatment_recommendations[:2])}")
            print(f"🔍 Evidence: {', '.join(result.evidence)}")
            print(f"📋 Differential: {', '.join(result.differential_diagnoses)}")
            
            # Simple validation - check if expected condition is mentioned
            diagnosis_match = case['expected'].lower() in result.diagnosis.lower()
            differential_match = any(case['expected'].lower() in dx.lower() for dx in result.differential_diagnoses)
            
            if diagnosis_match or differential_match:
                print(f"✅ PASS: Expected condition identified")
                passed += 1
            else:
                print(f"❌ FAIL: Expected '{case['expected']}' not found in diagnosis or differential")
                
        except Exception as e:
            print(f"💥 ERROR: {e}")
        
        print("=" * 40)
    
    print(f"\n📈 MEDICAL ENGINE TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL MEDICAL TESTS PASSED!")
        print("🏥 Medical reasoning engine is functioning correctly")
    elif passed/total >= 0.8:
        print("\n⚠️  MOSTLY SUCCESSFUL - Minor issues detected")  
        print("🏥 Medical engine requires refinement")
    else:
        print("\n🚨 CRITICAL ISSUES - Medical engine needs major fixes")
    
    # Test drug interaction checker
    print(f"\n💊 Testing Drug Interaction Checker...")
    interactions = await engine.check_drug_interactions(["warfarin", "aspirin", "digoxin"])
    print(f"🔍 Interactions Found: {len(interactions['interactions'])}")
    print(f"⚠️  Safety Level: {interactions['safety_level']}")
    
    return passed == total

if __name__ == "__main__":
    asyncio.run(test_medical_engine())
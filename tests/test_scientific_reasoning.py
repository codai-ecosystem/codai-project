"""
🔬 Enhanced RomAI Scientific Reasoning Validation
Testing dedicated scientific reasoning engine for world-class performance
Target: 90%+ accuracy across physics, chemistry, biology, astronomy
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add RomAI source to path
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_scientific_engine import AutonomousScientificEngine

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')

async def test_enhanced_scientific_reasoning():
    """🧪 Comprehensive scientific reasoning validation"""
    
    print("🔬 ROMAI ENHANCED SCIENTIFIC REASONING TEST")
    print("=" * 60)
    print("🎯 Testing: Dedicated Scientific Reasoning Engine")
    print("🏆 Target: 90%+ accuracy in all scientific domains")
    print("=" * 60)
    
    engine = AutonomousScientificEngine()
    
    # Test categories with expected results
    test_cases = [
        # Physics Tests
        {
            "category": "⚛️ PHYSICS",
            "tests": [
                {
                    "problem": "Calculate kinetic energy: KE = 0.5 * 10 * 5^2",
                    "expected": 125.0,
                    "units": "J",
                    "description": "Kinetic energy calculation"
                },
                {
                    "problem": "Newton's second law: F = ma, find F when m=5kg and a=10m/s²",
                    "expected": 50.0,
                    "units": "N",
                    "description": "Force calculation using Newton's second law"
                },
                {
                    "problem": "Wave equation: v = f * λ, find frequency when v=340m/s and λ=0.5m",
                    "expected": 680.0,
                    "units": "Hz",
                    "description": "Wave frequency calculation"
                }
            ]
        },
        # Chemistry Tests
        {
            "category": "🧪 CHEMISTRY",
            "tests": [
                {
                    "problem": "CO2 molar mass calculation",
                    "expected": 44.0,
                    "units": "g/mol",
                    "description": "Molecular mass of carbon dioxide"
                },
                {
                    "problem": "Molarity calculation: M = n/V, find M when n=0.5mol and V=2L",
                    "expected": 0.25,
                    "units": "M",
                    "description": "Solution concentration calculation"
                },
                {
                    "problem": "Ideal gas law: PV = nRT, calculate P when V=22.4L, n=1mol, R=0.082, T=273K",
                    "expected": 1.0,
                    "units": "atm",
                    "description": "Gas pressure calculation"
                }
            ]
        },
        # Biology Tests
        {
            "category": "🧬 BIOLOGY",
            "tests": [
                {
                    "problem": "Population growth: N = 100 * 2^3",
                    "expected": 800,
                    "units": "individuals",
                    "description": "Exponential population growth"
                },
                {
                    "problem": "Hardy-Weinberg: p² + 2pq + q² = 1, find q² when p=0.6",
                    "expected": 0.16,
                    "units": "frequency",
                    "description": "Allele frequency calculation"
                },
                {
                    "problem": "DNA replication: Calculate copies after 5 rounds: 2^5",
                    "expected": 32,
                    "units": "copies",
                    "description": "DNA amplification calculation"
                }
            ]
        },
        # Astronomy Tests
        {
            "category": "🌌 ASTRONOMY",
            "tests": [
                {
                    "problem": "Light travel distance = 3*10^8 * 60",
                    "expected": 18000000000,
                    "units": "meters",
                    "description": "Light travel distance in vacuum"
                },
                {
                    "problem": "Distance modulus: m - M = 5*log(d) - 5, calculate d when m-M=10",
                    "expected": 1000.0,
                    "units": "parsecs",
                    "description": "Stellar distance calculation"
                }
            ]
        }
    ]
    
    total_tests = 0
    total_passed = 0
    category_results = {}
    
    for category_data in test_cases:
        category = category_data["category"]
        tests = category_data["tests"]
        
        print(f"\n{category} REASONING TESTS")
        print("-" * 50)
        
        category_passed = 0
        category_total = len(tests)
        
        for test in tests:
            total_tests += 1
            
            try:
                # Run scientific reasoning
                result = await engine.reason_scientifically(test["problem"])
                
                # Check accuracy
                is_correct = False
                tolerance = 0.1  # 10% tolerance for floating point
                
                if isinstance(result.result, (int, float)) and isinstance(test["expected"], (int, float)):
                    # Numerical comparison with tolerance
                    relative_error = abs(result.result - test["expected"]) / max(abs(test["expected"]), 1e-10)
                    is_correct = relative_error <= tolerance
                else:
                    # Exact comparison for non-numerical results
                    is_correct = str(result.result) == str(test["expected"])
                
                if is_correct:
                    print(f"✅ {test['description']}: {result.result} {result.units or ''}")
                    print(f"   🧠 Method: {result.reasoning_method}")
                    print(f"   📊 Confidence: {result.confidence:.1%}")
                    category_passed += 1
                    total_passed += 1
                else:
                    print(f"❌ {test['description']}: Got {result.result}, Expected {test['expected']}")
                    print(f"   🧠 Method: {result.reasoning_method}")
                    print(f"   📊 Confidence: {result.confidence:.1%}")
                    print(f"   💡 Explanation: {result.explanation}")
                
            except Exception as e:
                print(f"❌ {test['description']}: ERROR - {str(e)}")
        
        category_accuracy = (category_passed / category_total) * 100
        category_results[category] = category_accuracy
        print(f"📊 {category} Accuracy: {category_accuracy:.1f}% ({category_passed}/{category_total})")
    
    # Overall results
    overall_accuracy = (total_passed / total_tests) * 100
    
    print(f"\n🏆 ENHANCED SCIENTIFIC REASONING SUMMARY")
    print("=" * 60)
    
    for category, accuracy in category_results.items():
        status = "✅ EXCELLENT" if accuracy >= 90 else "⚠️ GOOD" if accuracy >= 70 else "❌ NEEDS WORK"
        print(f"{category}: {accuracy:.1f}% - {status}")
    
    print(f"\n📊 Overall Scientific Excellence: {overall_accuracy:.1f}% ({total_passed}/{total_tests})")
    
    if overall_accuracy >= 90:
        print("🎉 WORLD-CLASS SCIENTIFIC REASONING ACHIEVED! 🏆")
        print("✅ Scientific Excellence: SUPERIOR")
    elif overall_accuracy >= 80:
        print("🎯 EXCELLENT SCIENTIFIC REASONING! 📈")
        print("✅ Scientific Excellence: ADVANCED")
    elif overall_accuracy >= 70:
        print("👍 GOOD SCIENTIFIC REASONING 📊")
        print("✅ Scientific Excellence: COMPETENT")
    else:
        print("⚠️ Scientific reasoning needs improvement")
        print("❌ Scientific Excellence: DEVELOPING")
    
    print("=" * 60)
    return overall_accuracy

if __name__ == "__main__":
    asyncio.run(test_enhanced_scientific_reasoning())
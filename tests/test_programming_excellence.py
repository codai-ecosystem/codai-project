"""
💻 RomAI Programming Excellence Validation
Testing world-class programming capabilities for complete multi-domain excellence
Target: 90%+ accuracy on programming tasks and real code generation
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add RomAI source to path
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.world_class_programming_engine import WorldClassProgrammingEngine

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')

async def test_programming_excellence():
    """💻 Comprehensive programming excellence validation"""
    
    print("💻 ROMAI PROGRAMMING EXCELLENCE TEST")
    print("=" * 60)
    print("🎯 Testing: World-Class Programming Capabilities")
    print("🏆 Target: 90%+ accuracy in programming tasks")
    print("=" * 60)
    
    engine = WorldClassProgrammingEngine()
    
    # Test categories with evaluation criteria
    test_cases = [
        # Algorithm Tests
        {
            "category": "🔧 ALGORITHMS",
            "tests": [
                {
                    "problem": "Implement Fibonacci sequence efficiently",
                    "expected_concepts": ["dynamic programming", "iterative", "O(n)"],
                    "description": "Efficient Fibonacci implementation"
                },
                {
                    "problem": "Create binary search algorithm for sorted array",
                    "expected_concepts": ["binary search", "O(log n)", "divide and conquer"],
                    "description": "Binary search implementation"
                },
                {
                    "problem": "Implement quicksort algorithm",
                    "expected_concepts": ["quicksort", "partition", "recursive", "O(n log n)"],
                    "description": "Quicksort sorting algorithm"
                }
            ]
        },
        # Mathematical Programming Tests
        {
            "category": "🔢 MATHEMATICAL",
            "tests": [
                {
                    "problem": "Check if a number is prime efficiently",
                    "expected_concepts": ["prime", "sqrt", "optimization", "trial division"],
                    "description": "Prime number checking"
                },
                {
                    "problem": "Calculate GCD of two numbers using Euclidean algorithm",
                    "expected_concepts": ["gcd", "euclidean", "while loop", "modulo"],
                    "description": "Greatest Common Divisor"
                }
            ]
        },
        # String Processing Tests
        {
            "category": "🔤 STRING PROCESSING",
            "tests": [
                {
                    "problem": "Check if a string is palindrome ignoring spaces and case",
                    "expected_concepts": ["palindrome", "two pointer", "clean string"],
                    "description": "Palindrome verification"
                },
                {
                    "problem": "Find pattern in text using KMP algorithm",
                    "expected_concepts": ["kmp", "pattern matching", "failure function"],
                    "description": "String pattern matching"
                }
            ]
        },
        # Array Processing Tests
        {
            "category": "📊 ARRAY PROCESSING",
            "tests": [
                {
                    "problem": "Find two numbers in array that sum to target",
                    "expected_concepts": ["two sum", "hash map", "O(n)", "complement"],
                    "description": "Two sum problem"
                },
                {
                    "problem": "Find maximum subarray sum using Kadane's algorithm",
                    "expected_concepts": ["kadane", "maximum subarray", "dynamic programming"],
                    "description": "Maximum subarray problem"
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
        
        print(f"\n{category} TESTS")
        print("-" * 50)
        
        category_passed = 0
        category_total = len(tests)
        
        for test in tests:
            total_tests += 1
            
            try:
                # Run programming solution
                result = await engine.solve_programming_problem(test["problem"])
                
                # Evaluate solution quality
                quality_score = evaluate_programming_solution(result, test["expected_concepts"])
                
                is_excellent = quality_score >= 0.8  # 80%+ considered excellent
                
                if is_excellent:
                    print(f"✅ {test['description']}: EXCELLENT")
                    print(f"   🧠 Task Type: {result.task_type}")
                    print(f"   📊 Confidence: {result.confidence:.1%}")
                    print(f"   📏 Code Length: {len(result.code)} chars")
                    if result.complexity:
                        print(f"   ⏱️ Complexity: {result.complexity}")
                    print(f"   🏆 Quality Score: {quality_score:.1%}")
                    category_passed += 1
                    total_passed += 1
                else:
                    print(f"⚠️ {test['description']}: NEEDS IMPROVEMENT")
                    print(f"   🧠 Task Type: {result.task_type}")
                    print(f"   📊 Confidence: {result.confidence:.1%}")
                    print(f"   🏆 Quality Score: {quality_score:.1%}")
                    print(f"   💡 Missing concepts: {', '.join(test['expected_concepts'])}")
                
            except Exception as e:
                print(f"❌ {test['description']}: ERROR - {str(e)}")
        
        category_accuracy = (category_passed / category_total) * 100
        category_results[category] = category_accuracy
        print(f"📊 {category} Accuracy: {category_accuracy:.1f}% ({category_passed}/{category_total})")
    
    # Overall results
    overall_accuracy = (total_passed / total_tests) * 100
    
    print(f"\n🏆 PROGRAMMING EXCELLENCE SUMMARY")
    print("=" * 60)
    
    for category, accuracy in category_results.items():
        status = "✅ EXCELLENT" if accuracy >= 90 else "⚠️ GOOD" if accuracy >= 70 else "❌ NEEDS WORK"
        print(f"{category}: {accuracy:.1f}% - {status}")
    
    print(f"\n📊 Overall Programming Excellence: {overall_accuracy:.1f}% ({total_passed}/{total_tests})")
    
    if overall_accuracy >= 90:
        print("🎉 WORLD-CLASS PROGRAMMING ACHIEVED! 🏆")
        print("✅ Programming Excellence: SUPERIOR")
        print("🚀 Ready for HumanEval and competitive programming!")
    elif overall_accuracy >= 80:
        print("🎯 EXCELLENT PROGRAMMING CAPABILITIES! 📈")
        print("✅ Programming Excellence: ADVANCED")
        print("🚀 Strong foundation for complex programming tasks!")
    elif overall_accuracy >= 70:
        print("👍 GOOD PROGRAMMING CAPABILITIES 📊")
        print("✅ Programming Excellence: COMPETENT")
        print("🚀 Solid programming foundation established!")
    else:
        print("⚠️ Programming capabilities need improvement")
        print("❌ Programming Excellence: DEVELOPING")
    
    print("=" * 60)
    return overall_accuracy

def evaluate_programming_solution(result, expected_concepts):
    """📊 Evaluate programming solution quality"""
    
    # Base scoring
    quality_score = 0.0
    
    # Code generation success (40% weight)
    if result.code and len(result.code) > 50 and "TODO" not in result.code and "pass" not in result.code:
        quality_score += 0.4
    elif result.code and len(result.code) > 20:
        quality_score += 0.2
    
    # Confidence level (20% weight)
    quality_score += result.confidence * 0.2
    
    # Expected concepts presence (30% weight)
    code_lower = result.code.lower()
    explanation_lower = result.explanation.lower()
    combined_text = code_lower + " " + explanation_lower
    
    concept_matches = 0
    for concept in expected_concepts:
        if concept.lower() in combined_text:
            concept_matches += 1
    
    concept_score = concept_matches / len(expected_concepts) if expected_concepts else 1.0
    quality_score += concept_score * 0.3
    
    # Complexity analysis bonus (10% weight)
    if result.complexity and any(complexity in result.complexity.lower() for complexity in ["o(", "time", "space"]):
        quality_score += 0.1
    
    return min(quality_score, 1.0)  # Cap at 100%

if __name__ == "__main__":
    asyncio.run(test_programming_excellence())
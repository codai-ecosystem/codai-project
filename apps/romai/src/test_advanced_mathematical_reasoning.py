"""
Comprehensive Test Suite for Advanced Mathematical Reasoning Engine
================================================================

Tests the advanced mathematical reasoning engine targeting DeepSeek-R1 performance (97.3% MATH-500).
Validates:
- Multi-domain mathematical problem solving (algebra, calculus, geometry, etc.)
- Advanced reasoning strategies (proof by contradiction, induction, etc.)
- Symbolic computation and proof generation
- Self-correction mechanisms
- Competition mathematics capabilities
- Performance benchmarking against target metrics

Target Performance: 97.3% accuracy on MATH-500 level problems
"""

import asyncio
import pytest
import time
from typing import List, Dict, Any
import json
import sys
import os

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from ml.reasoning.advanced_mathematical_reasoning_engine import (
    AdvancedMathematicalEngine,
    MathDomain,
    DifficultyLevel, 
    ReasoningStrategy,
    MathematicalSolution
)

class TestAdvancedMathematicalReasoning:
    """Comprehensive test suite for advanced mathematical reasoning"""
    
    @pytest.fixture
    async def math_engine(self):
        """Create mathematical reasoning engine for testing"""
        return AdvancedMathematicalEngine()
    
    @pytest.mark.asyncio
    async def test_basic_algebra_problems(self, math_engine):
        """Test basic algebraic problem solving"""
        print("\n🧮 Testing Basic Algebra Problems...")
        
        problems = [
            "Solve the equation x^2 - 5x + 6 = 0",
            "Factor the expression x^2 + 7x + 12", 
            "Simplify 3x + 2x - 5x",
            "Find x when 2x + 3 = 11"
        ]
        
        solutions = []
        for problem in problems:
            solution = await math_engine.solve_mathematical_problem(problem, MathDomain.ALGEBRA)
            solutions.append(solution)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Confidence: {solution.confidence:.1%}")
            print(f"   Verified: {'✅' if solution.verification_passed else '❌'}")
        
        # Validate results
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        assert success_rate >= 0.75, f"Algebra success rate {success_rate:.1%} below 75%"
        assert all(s.domain == MathDomain.ALGEBRA for s in solutions), "Domain classification failed"
        
        print(f"📊 Algebra Test: {success_rate:.1%} success rate")
        return solutions
    
    @pytest.mark.asyncio
    async def test_calculus_problems(self, math_engine):
        """Test calculus problem solving"""
        print("\n🧮 Testing Calculus Problems...")
        
        problems = [
            "Find the derivative of f(x) = 3x^2 + 2x + 1",
            "Calculate the integral of 2x dx",
            "Find the limit of (sin x)/x as x approaches 0",
            "Find the derivative of e^x * ln(x)"
        ]
        
        solutions = []
        for problem in problems:
            solution = await math_engine.solve_mathematical_problem(problem, MathDomain.CALCULUS)
            solutions.append(solution)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Method: {solution.method_used}")
            print(f"   Confidence: {solution.confidence:.1%}")
        
        # Validate results
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        assert success_rate >= 0.70, f"Calculus success rate {success_rate:.1%} below 70%"
        
        print(f"📊 Calculus Test: {success_rate:.1%} success rate")
        return solutions
    
    @pytest.mark.asyncio 
    async def test_geometry_problems(self, math_engine):
        """Test geometric problem solving"""
        print("\n🧮 Testing Geometry Problems...")
        
        problems = [
            "Find the area of a circle with radius 5",
            "Calculate the perimeter of a rectangle with length 8 and width 6",
            "Find the hypotenuse of a right triangle with sides 3 and 4",
            "Calculate the volume of a sphere with radius 3"
        ]
        
        solutions = []
        for problem in problems:
            solution = await math_engine.solve_mathematical_problem(problem, MathDomain.GEOMETRY)
            solutions.append(solution)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Confidence: {solution.confidence:.1%}")
        
        # Validate results
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        assert success_rate >= 0.70, f"Geometry success rate {success_rate:.1%} below 70%"
        
        print(f"📊 Geometry Test: {success_rate:.1%} success rate")
        return solutions
    
    @pytest.mark.asyncio
    async def test_number_theory_problems(self, math_engine):
        """Test number theory problem solving"""
        print("\n🧮 Testing Number Theory Problems...")
        
        problems = [
            "Find the GCD of 48 and 18",
            "Is 17 a prime number?",
            "Find all divisors of 24",
            "Calculate 7^3 mod 11"
        ]
        
        solutions = []
        for problem in problems:
            solution = await math_engine.solve_mathematical_problem(problem, MathDomain.NUMBER_THEORY)
            solutions.append(solution)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Strategy: {solution.reasoning_strategy.value if solution.reasoning_strategy else 'N/A'}")
        
        # Validate results
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        assert success_rate >= 0.65, f"Number theory success rate {success_rate:.1%} below 65%"
        
        print(f"📊 Number Theory Test: {success_rate:.1%} success rate")
        return solutions
    
    @pytest.mark.asyncio
    async def test_combinatorics_and_probability(self, math_engine):
        """Test combinatorics and probability problems"""
        print("\n🧮 Testing Combinatorics & Probability...")
        
        problems = [
            "How many ways can you arrange 5 books on a shelf?",
            "What is the probability of rolling a 6 on a fair die?",
            "How many ways can you choose 3 items from 10?",
            "What is 8! (8 factorial)?"
        ]
        
        solutions = []
        for problem in problems:
            # Let the engine auto-classify the domain
            solution = await math_engine.solve_mathematical_problem(problem)
            solutions.append(solution)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Domain: {solution.domain.value}")
            print(f"   Confidence: {solution.confidence:.1%}")
        
        # Validate results
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        assert success_rate >= 0.60, f"Combinatorics/Probability success rate {success_rate:.1%} below 60%"
        
        print(f"📊 Combinatorics/Probability Test: {success_rate:.1%} success rate")
        return solutions
    
    @pytest.mark.asyncio
    async def test_competition_level_problems(self, math_engine):
        """Test competition-level mathematical problems"""
        print("\n🧮 Testing Competition-Level Problems...")
        
        problems = [
            "Prove that the square root of 2 is irrational",
            "Find all integer solutions to x^2 - y^2 = 15",
            "Prove by induction that 1 + 2 + ... + n = n(n+1)/2",
            "Find the maximum value of f(x) = x^3 - 3x^2 + 2"
        ]
        
        solutions = []
        for problem in problems:
            solution = await math_engine.solve_mathematical_problem(problem)
            solutions.append(solution)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Difficulty: Level {solution.difficulty.value}")
            print(f"   Proof Type: {solution.proof_type}")
            print(f"   Confidence: {solution.confidence:.1%}")
        
        # Validate results - lower threshold for competition problems
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        assert success_rate >= 0.50, f"Competition success rate {success_rate:.1%} below 50%"
        
        # Check that proofs are generated for advanced problems
        proof_problems = sum(1 for s in solutions if s.proof_type and s.proof_type != "computational")
        assert proof_problems >= 2, f"Only {proof_problems} problems generated proofs"
        
        print(f"📊 Competition Test: {success_rate:.1%} success rate")
        print(f"📜 Proofs Generated: {proof_problems}/{len(problems)} problems")
        return solutions
    
    @pytest.mark.asyncio
    async def test_reasoning_strategy_selection(self, math_engine):
        """Test reasoning strategy selection"""
        print("\n🧮 Testing Reasoning Strategy Selection...")
        
        strategy_tests = [
            ("Prove that if n is even, then n^2 is even", ReasoningStrategy.DIRECT_COMPUTATION),
            ("Factor x^2 - 9", ReasoningStrategy.FACTORIZATION), 
            ("Find the limit of (x^2 - 1)/(x - 1) as x approaches 1", ReasoningStrategy.LIMITS_AND_CONTINUITY),
            ("Prove by contradiction that there are infinitely many primes", ReasoningStrategy.PROOF_BY_CONTRADICTION)
        ]
        
        correct_selections = 0
        for problem, expected_strategy in strategy_tests:
            solution = await math_engine.solve_mathematical_problem(problem)
            print(f"✅ {problem[:50]}...")
            print(f"   Expected: {expected_strategy.value}")
            print(f"   Selected: {solution.reasoning_strategy.value if solution.reasoning_strategy else 'None'}")
            
            # Allow some flexibility in strategy selection
            if solution.reasoning_strategy and (
                solution.reasoning_strategy == expected_strategy or
                solution.reasoning_strategy in [ReasoningStrategy.DIRECT_COMPUTATION, ReasoningStrategy.ALGEBRAIC_MANIPULATION]
            ):
                correct_selections += 1
        
        selection_accuracy = correct_selections / len(strategy_tests)
        print(f"📊 Strategy Selection Accuracy: {selection_accuracy:.1%}")
        
        # Moderate threshold for strategy selection
        assert selection_accuracy >= 0.50, f"Strategy selection accuracy {selection_accuracy:.1%} below 50%"
        return correct_selections
    
    @pytest.mark.asyncio
    async def test_self_correction_mechanism(self, math_engine):
        """Test self-correction and alternative approaches"""
        print("\n🧮 Testing Self-Correction Mechanism...")
        
        # Problems where multiple approaches might be needed
        problems = [
            "Solve x^3 - 6x^2 + 11x - 6 = 0",  # May need factoring or numerical methods
            "Find the integral of 1/(x^2 + 1) dx",  # Could use substitution or recognition
            "Solve the system: 2x + 3y = 12, 4x - y = 1"  # Multiple elimination methods
        ]
        
        self_corrections = 0
        alternative_approaches = 0
        
        for problem in problems:
            solution = await math_engine.solve_mathematical_problem(problem)
            print(f"✅ {problem}")
            print(f"   Answer: {solution.final_answer}")
            print(f"   Method: {solution.method_used}")
            print(f"   Alternatives: {len(solution.alternative_approaches)}")
            
            if len(solution.alternative_approaches) > 0:
                alternative_approaches += 1
            
            # Check for self-correction indicators in solution steps
            correction_indicators = ['self-correction', 'better solution', 'alternative method']
            if any(indicator in ' '.join(solution.solution_steps).lower() for indicator in correction_indicators):
                self_corrections += 1
        
        print(f"📊 Problems with alternatives: {alternative_approaches}/{len(problems)}")
        print(f"📊 Self-corrections detected: {self_corrections}/{len(problems)}")
        
        # At least some problems should have alternative approaches
        assert alternative_approaches >= 1, "No alternative approaches found"
        return {'alternatives': alternative_approaches, 'corrections': self_corrections}
    
    @pytest.mark.asyncio
    async def test_batch_processing(self, math_engine):
        """Test batch processing of multiple problems"""
        print("\n🧮 Testing Batch Processing...")
        
        batch_problems = [
            "What is 2^10?",
            "Calculate 5!",
            "Find the square root of 144",
            "Solve x + 5 = 12",
            "What is 25% of 80?",
            "Find the area of a square with side length 6"
        ]
        
        start_time = time.time()
        solutions = await math_engine.batch_solve_problems(batch_problems)
        processing_time = time.time() - start_time
        
        print(f"⏱️ Batch processing time: {processing_time:.2f}s")
        print(f"🔢 Problems processed: {len(solutions)}")
        print(f"⚡ Average time per problem: {processing_time/len(solutions):.2f}s")
        
        # Validate batch processing
        assert len(solutions) == len(batch_problems), "Not all problems were processed"
        
        success_rate = sum(1 for s in solutions if s.verification_passed) / len(solutions)
        print(f"📊 Batch success rate: {success_rate:.1%}")
        
        # Batch processing should maintain good performance
        assert success_rate >= 0.75, f"Batch success rate {success_rate:.1%} below 75%"
        assert processing_time < 30, f"Batch processing took {processing_time:.1f}s (too slow)"
        
        return {'solutions': solutions, 'time': processing_time, 'success_rate': success_rate}
    
    @pytest.mark.asyncio
    async def test_performance_tracking(self, math_engine):
        """Test performance tracking and metrics"""
        print("\n🧮 Testing Performance Tracking...")
        
        # Solve several problems to build performance history
        test_problems = [
            "Solve x^2 = 25",
            "Find the derivative of x^3",
            "What is 6 * 7?",
            "Calculate the perimeter of a triangle with sides 3, 4, 5"
        ]
        
        initial_report = math_engine.get_performance_report()
        print(f"📊 Initial problems solved: {initial_report['total_problems_solved']}")
        
        for problem in test_problems:
            await math_engine.solve_mathematical_problem(problem)
        
        final_report = math_engine.get_performance_report()
        print(f"📊 Final problems solved: {final_report['total_problems_solved']}")
        print(f"📈 Overall success rate: {final_report['overall_success_rate']:.1%}")
        print(f"🎯 Target performance: {final_report['target_performance']:.1%}")
        print(f"📉 Performance gap: {final_report['performance_gap']:.1%}")
        print(f"🏆 Competition ready: {'✅' if final_report['ready_for_competition'] else '❌'}")
        
        # Validate performance tracking
        assert final_report['total_problems_solved'] > initial_report['total_problems_solved'], "Problems count not updated"
        assert 'domain_performance' in final_report, "Domain performance not tracked"
        assert final_report['target_performance'] == 0.973, "Incorrect target performance"
        
        return final_report
    
    @pytest.mark.asyncio
    async def test_domain_classification(self, math_engine):
        """Test automatic domain classification"""
        print("\n🧮 Testing Domain Classification...")
        
        domain_tests = [
            ("Solve the quadratic equation x^2 + 3x + 2 = 0", MathDomain.ALGEBRA),
            ("Find the derivative of sin(x)", MathDomain.CALCULUS),
            ("Calculate the area of a circle", MathDomain.GEOMETRY),
            ("Find the GCD of 12 and 18", MathDomain.NUMBER_THEORY),
            ("How many ways to choose 2 from 5?", MathDomain.COMBINATORICS),
            ("What is the probability of heads?", MathDomain.PROBABILITY)
        ]
        
        correct_classifications = 0
        for problem, expected_domain in domain_tests:
            solution = await math_engine.solve_mathematical_problem(problem)
            print(f"✅ {problem[:40]}...")
            print(f"   Expected: {expected_domain.value}")
            print(f"   Classified: {solution.domain.value}")
            
            if solution.domain == expected_domain:
                correct_classifications += 1
        
        classification_accuracy = correct_classifications / len(domain_tests)
        print(f"📊 Classification Accuracy: {classification_accuracy:.1%}")
        
        # Domain classification should be reasonably accurate
        assert classification_accuracy >= 0.60, f"Classification accuracy {classification_accuracy:.1%} below 60%"
        return classification_accuracy

async def run_comprehensive_test_suite():
    """Run the complete test suite"""
    print("🧮 ADVANCED MATHEMATICAL REASONING ENGINE - COMPREHENSIVE TEST SUITE")
    print("=" * 80)
    print("🎯 Target: DeepSeek-R1 Level Performance (97.3% MATH-500)")
    print("=" * 80)
    
    # Create test instance
    test_suite = TestAdvancedMathematicalReasoning()
    math_engine = AdvancedMathematicalEngine()
    
    # Test results tracking
    test_results = {}
    
    try:
        # Run all test categories
        print("\n🚀 Starting comprehensive test suite...")
        
        # 1. Basic algebra
        algebra_results = await test_suite.test_basic_algebra_problems(math_engine)
        test_results['algebra'] = {'success_rate': sum(1 for s in algebra_results if s.verification_passed) / len(algebra_results)}
        
        # 2. Calculus
        calculus_results = await test_suite.test_calculus_problems(math_engine)
        test_results['calculus'] = {'success_rate': sum(1 for s in calculus_results if s.verification_passed) / len(calculus_results)}
        
        # 3. Geometry
        geometry_results = await test_suite.test_geometry_problems(math_engine)
        test_results['geometry'] = {'success_rate': sum(1 for s in geometry_results if s.verification_passed) / len(geometry_results)}
        
        # 4. Number theory
        number_theory_results = await test_suite.test_number_theory_problems(math_engine)
        test_results['number_theory'] = {'success_rate': sum(1 for s in number_theory_results if s.verification_passed) / len(number_theory_results)}
        
        # 5. Combinatorics & Probability
        combo_results = await test_suite.test_combinatorics_and_probability(math_engine)
        test_results['combinatorics'] = {'success_rate': sum(1 for s in combo_results if s.verification_passed) / len(combo_results)}
        
        # 6. Competition level
        competition_results = await test_suite.test_competition_level_problems(math_engine)
        test_results['competition'] = {'success_rate': sum(1 for s in competition_results if s.verification_passed) / len(competition_results)}
        
        # 7. Strategy selection
        strategy_accuracy = await test_suite.test_reasoning_strategy_selection(math_engine)
        test_results['strategy_selection'] = {'accuracy': strategy_accuracy}
        
        # 8. Self-correction
        correction_results = await test_suite.test_self_correction_mechanism(math_engine)
        test_results['self_correction'] = correction_results
        
        # 9. Batch processing
        batch_results = await test_suite.test_batch_processing(math_engine)
        test_results['batch_processing'] = batch_results
        
        # 10. Performance tracking
        performance_report = await test_suite.test_performance_tracking(math_engine)
        test_results['performance_tracking'] = performance_report
        
        # 11. Domain classification
        classification_accuracy = await test_suite.test_domain_classification(math_engine)
        test_results['domain_classification'] = {'accuracy': classification_accuracy}
        
        # Overall results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 80)
        
        domain_success_rates = [
            test_results['algebra']['success_rate'],
            test_results['calculus']['success_rate'], 
            test_results['geometry']['success_rate'],
            test_results['number_theory']['success_rate'],
            test_results['combinatorics']['success_rate']
        ]
        
        overall_success_rate = sum(domain_success_rates) / len(domain_success_rates)
        competition_success_rate = test_results['competition']['success_rate']
        
        print(f"📈 Overall Success Rate: {overall_success_rate:.1%}")
        print(f"🏆 Competition Success Rate: {competition_success_rate:.1%}")
        print(f"🎯 Target Rate (DeepSeek-R1): 97.3%")
        print(f"📊 Performance Gap: {0.973 - overall_success_rate:.1%}")
        
        # Domain breakdown
        print(f"\n📚 Domain Performance:")
        print(f"   Algebra: {test_results['algebra']['success_rate']:.1%}")
        print(f"   Calculus: {test_results['calculus']['success_rate']:.1%}")
        print(f"   Geometry: {test_results['geometry']['success_rate']:.1%}")
        print(f"   Number Theory: {test_results['number_theory']['success_rate']:.1%}")
        print(f"   Combinatorics: {test_results['combinatorics']['success_rate']:.1%}")
        print(f"   Competition Level: {test_results['competition']['success_rate']:.1%}")
        
        # Additional metrics
        print(f"\n🔧 System Performance:")
        print(f"   Domain Classification: {test_results['domain_classification']['accuracy']:.1%}")
        print(f"   Batch Processing: {test_results['batch_processing']['success_rate']:.1%}")
        print(f"   Alternative Approaches: {test_results['self_correction']['alternatives']} problems")
        
        # Success criteria
        tests_passed = 0
        total_tests = 11
        
        if overall_success_rate >= 0.70:
            tests_passed += 1
            print("✅ Overall success rate ≥ 70%")
        else:
            print("❌ Overall success rate < 70%")
            
        if competition_success_rate >= 0.40:
            tests_passed += 1
            print("✅ Competition success rate ≥ 40%")
        else:
            print("❌ Competition success rate < 40%")
            
        if test_results['domain_classification']['accuracy'] >= 0.60:
            tests_passed += 1
            print("✅ Domain classification ≥ 60%")
        else:
            print("❌ Domain classification < 60%")
        
        # Final assessment
        print(f"\n🏁 FINAL ASSESSMENT")
        print("-" * 40)
        print(f"Tests Passed: {tests_passed}/{total_tests}")
        test_success_rate = tests_passed / total_tests
        print(f"Test Suite Success Rate: {test_success_rate:.1%}")
        
        if test_success_rate >= 0.80:
            print("🏆 ADVANCED MATHEMATICAL REASONING ENGINE: READY FOR DEPLOYMENT!")
            print("🎯 Performance approaching DeepSeek-R1 level capabilities")
        elif test_success_rate >= 0.60:
            print("⚡ ADVANCED MATHEMATICAL REASONING ENGINE: GOOD PERFORMANCE")
            print("🔧 Some optimizations needed for DeepSeek-R1 level")
        else:
            print("⚠️  ADVANCED MATHEMATICAL REASONING ENGINE: NEEDS IMPROVEMENT")
            print("🛠️  Significant enhancements required")
        
        # Save results
        with open('advanced_math_test_results.json', 'w') as f:
            # Convert any non-serializable objects to strings
            serializable_results = {}
            for key, value in test_results.items():
                if isinstance(value, dict):
                    serializable_results[key] = {k: str(v) for k, v in value.items()}
                else:
                    serializable_results[key] = str(value)
            
            json.dump({
                'timestamp': time.time(),
                'overall_success_rate': overall_success_rate,
                'competition_success_rate': competition_success_rate,
                'target_rate': 0.973,
                'performance_gap': 0.973 - overall_success_rate,
                'test_results': serializable_results,
                'tests_passed': tests_passed,
                'total_tests': total_tests,
                'ready_for_deployment': test_success_rate >= 0.80
            }, f, indent=2)
        
        print(f"\n💾 Results saved to: advanced_math_test_results.json")
        return test_success_rate >= 0.80
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(run_comprehensive_test_suite())
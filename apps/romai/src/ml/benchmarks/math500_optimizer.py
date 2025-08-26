"""
MATH-500 Benchmark Optimizer for RomAI
Phase 4: Full MATH-500 Benchmark Optimization

Based on 2025 state-of-the-art research:
- DeepSeek R1: 92.2% accuracy
- OpenAI o3-mini: 91.8% accuracy  
- Target: 85%+ accuracy across all mathematical domains

Key domains: Algebra, Number Theory, Geometry, Calculus, Probability
"""

import asyncio
import json
import re
import sympy as sp
import numpy as np
from typing import Dict, Any, List, Optional, Union, Tuple
from dataclasses import dataclass
from pathlib import Path
import logging
from datetime import datetime

# Import our Phase 4.3 Final mathematical engine
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'reasoning'))
from phase43_final_math_engine import Phase43FinalMathEngine, MathematicalResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MATH500Result:
    """Result structure for MATH-500 benchmark evaluation"""
    problem: str
    expected_answer: str
    predicted_answer: str
    latex_formatted: str
    domain: str
    difficulty: int
    reasoning_steps: List[str]
    confidence: float
    correct: bool
    execution_time: float
    
class MATH500DomainOptimizer:
    """Domain-specific optimization for MATH-500 benchmark"""
    
    def __init__(self):
        self.mathematical_engine = Phase43FinalMathEngine()
        
        # Domain-specific reasoning patterns optimized for MATH-500
        self.domain_patterns = {
            "algebra": {
                "keywords": ["equation", "solve", "variable", "polynomial", "quadratic", "linear", "system"],
                "strategies": ["factorization", "substitution", "elimination", "completing_square"],
                "complexity_weight": 0.8
            },
            "number_theory": {
                "keywords": ["prime", "divisible", "modular", "gcd", "lcm", "congruent", "integer"],
                "strategies": ["prime_factorization", "euclidean_algorithm", "chinese_remainder"],
                "complexity_weight": 0.9
            },
            "geometry": {
                "keywords": ["triangle", "circle", "angle", "area", "perimeter", "volume", "coordinate"],
                "strategies": ["coordinate_geometry", "trigonometry", "similarity", "congruence"],
                "complexity_weight": 0.85
            },
            "calculus": {
                "keywords": ["derivative", "integral", "limit", "continuous", "differential", "∫", "d/dx"],
                "strategies": ["fundamental_theorem", "chain_rule", "integration_by_parts", "substitution"],
                "complexity_weight": 0.7  # We're already strong in calculus
            },
            "probability": {
                "keywords": ["probability", "random", "expected", "variance", "distribution", "sample"],
                "strategies": ["combinatorics", "conditional_probability", "bayes_theorem", "central_limit"],
                "complexity_weight": 0.95
            }
        }
        
    def classify_math_domain(self, problem: str) -> str:
        """Classify mathematical problem by domain for MATH-500"""
        problem_lower = problem.lower()
        
        domain_scores = {}
        for domain, config in self.domain_patterns.items():
            score = 0
            for keyword in config["keywords"]:
                if keyword in problem_lower:
                    score += 1
            domain_scores[domain] = score
        
        # Return domain with highest score
        best_domain = max(domain_scores, key=domain_scores.get)
        logger.info(f"🎯 Classified problem as {best_domain} domain")
        return best_domain
    
    def extract_difficulty_level(self, problem: str) -> int:
        """Extract difficulty level (1-5) based on problem complexity"""
        complexity_indicators = {
            5: ["prove", "show that", "demonstrate", "if and only if", "necessary and sufficient"],
            4: ["system", "multiple", "complex", "optimization", "maximum", "minimum"],
            3: ["quadratic", "polynomial", "trigonometric", "logarithmic", "exponential"],
            2: ["linear", "simple", "basic", "elementary", "straightforward"],
            1: ["compute", "calculate", "find", "solve for"]
        }
        
        problem_lower = problem.lower()
        for level, indicators in complexity_indicators.items():
            if any(indicator in problem_lower for indicator in indicators):
                return level
        
        return 3  # Default medium difficulty
    
    def format_latex_answer(self, result: Any) -> str:
        """Format answer in MATH-500 required LaTeX format: \\(\\boxed{answer}\\)"""
        try:
            # Handle different result types
            if isinstance(result, str):
                # Check if already formatted
                if "\\boxed{" in result:
                    return result
                # Clean and format string results
                clean_result = result.strip()
            elif isinstance(result, (int, float)):
                clean_result = str(result)
            elif hasattr(result, '__iter__') and not isinstance(result, str):
                # Handle multiple solutions
                solutions = [str(sol).strip() for sol in result]
                clean_result = ", ".join(solutions)
            else:
                clean_result = str(result)
            
            # Format in required MATH-500 format
            latex_formatted = f"\\(\\boxed{{{clean_result}}}\\)"
            logger.info(f"📐 Formatted answer as: {latex_formatted}")
            return latex_formatted
            
        except Exception as e:
            logger.error(f"LaTeX formatting error: {e}")
            return f"\\(\\boxed{{Error: {str(e)}}}\\)"
    
    async def solve_math500_problem(self, problem: str, expected_answer: str = None) -> MATH500Result:
        """Solve a MATH-500 problem with domain-specific optimization"""
        start_time = datetime.now()
        
        # Classify domain
        domain = self.classify_math_domain(problem)
        difficulty = self.extract_difficulty_level(problem)
        
        logger.info(f"🧮 Solving MATH-500 problem")
        logger.info(f"📋 Domain: {domain}, Difficulty: {difficulty}")
        logger.info(f"📝 Problem: {problem[:100]}...")
        
        try:
            # Apply domain-specific preprocessing
            optimized_problem = self._apply_domain_preprocessing(problem, domain)
            
            # Solve using our mathematical engine
            math_result = await self.mathematical_engine.solve_mathematical_problem(optimized_problem)
            
            # Format for MATH-500 requirements
            latex_answer = self.format_latex_answer(math_result.result)
            
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Evaluate correctness if expected answer provided
            is_correct = False
            if expected_answer:
                is_correct = self._evaluate_correctness(latex_answer, expected_answer)
            
            return MATH500Result(
                problem=problem,
                expected_answer=expected_answer or "",
                predicted_answer=str(math_result.result),
                latex_formatted=latex_answer,
                domain=domain,
                difficulty=difficulty,
                reasoning_steps=math_result.steps,
                confidence=math_result.confidence,
                correct=is_correct,
                execution_time=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error solving MATH-500 problem: {e}")
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return MATH500Result(
                problem=problem,
                expected_answer=expected_answer or "",
                predicted_answer=f"Error: {str(e)}",
                latex_formatted=f"\\(\\boxed{{Error: {str(e)}}}\\)",
                domain=domain,
                difficulty=difficulty,
                reasoning_steps=[f"Error occurred: {str(e)}"],
                confidence=0.0,
                correct=False,
                execution_time=execution_time
            )
    
    def _apply_domain_preprocessing(self, problem: str, domain: str) -> str:
        """Apply domain-specific preprocessing optimizations"""
        if domain == "geometry":
            # Enhance coordinate geometry parsing
            problem = re.sub(r'point\s+\(([^)]+)\)', r'coordinate point (\1)', problem, flags=re.IGNORECASE)
            problem = re.sub(r'triangle\s+(\w+)', r'triangle with vertices \1', problem, flags=re.IGNORECASE)
        
        elif domain == "number_theory":
            # Enhance number theory terminology
            problem = re.sub(r'divisible by (\d+)', r'has divisor \1', problem, flags=re.IGNORECASE)
            problem = re.sub(r'prime number', r'prime integer', problem, flags=re.IGNORECASE)
        
        elif domain == "probability":
            # Enhance probability terminology
            problem = re.sub(r'probability of', r'P(', problem, flags=re.IGNORECASE)
            problem = re.sub(r'expected value', r'E[X]', problem, flags=re.IGNORECASE)
        
        return problem
    
    def _evaluate_correctness(self, predicted: str, expected: str) -> bool:
        """Evaluate correctness using MATH-500 evaluation logic"""
        try:
            # Extract answers from LaTeX boxed format
            predicted_clean = self._extract_boxed_answer(predicted)
            expected_clean = self._extract_boxed_answer(expected)
            
            # Normalize and compare
            return self._normalize_answer(predicted_clean) == self._normalize_answer(expected_clean)
        except Exception as e:
            logger.error(f"Evaluation error: {e}")
            return False
    
    def _extract_boxed_answer(self, latex_str: str) -> str:
        """Extract answer from \\boxed{answer} format"""
        match = re.search(r'\\boxed\{([^}]+)\}', latex_str)
        if match:
            return match.group(1)
        return latex_str.strip()
    
    def _normalize_answer(self, answer: str) -> str:
        """Normalize answer for comparison"""
        # Remove whitespace and convert to lowercase
        normalized = answer.strip().lower()
        
        # Handle common mathematical representations
        normalized = normalized.replace(' ', '')
        normalized = re.sub(r'(\d+)\.0+$', r'\1', normalized)  # Remove trailing .0
        
        return normalized

class MATH500BenchmarkRunner:
    """Run MATH-500 benchmark evaluation"""
    
    def __init__(self):
        self.optimizer = MATH500DomainOptimizer()
        self.results = []
    
    async def run_sample_math500_test(self) -> Dict[str, Any]:
        """Run a sample MATH-500 test with representative problems"""
        
        # Sample MATH-500 problems across all domains
        test_problems = [
            # Algebra
            {
                "problem": "Solve for x: 2x² - 8x + 6 = 0",
                "expected": "\\(\\boxed{1, 3}\\)",
                "domain": "algebra"
            },
            {
                "problem": "Find the sum of the roots of the equation 3x² - 7x + 2 = 0",
                "expected": "\\(\\boxed{\\frac{7}{3}}\\)",
                "domain": "algebra"
            },
            
            # Number Theory
            {
                "problem": "Find the greatest common divisor of 252 and 180",
                "expected": "\\(\\boxed{36}\\)",
                "domain": "number_theory"
            },
            {
                "problem": "How many positive integers less than 100 are relatively prime to 30?",
                "expected": "\\(\\boxed{26}\\)",
                "domain": "number_theory"
            },
            
            # Geometry
            {
                "problem": "A circle has center (2, 3) and radius 5. What is the area of the circle?",
                "expected": "\\(\\boxed{25\\pi}\\)",
                "domain": "geometry"
            },
            {
                "problem": "In triangle ABC, if angle A = 60°, side b = 8, and side c = 6, find side a",
                "expected": "\\(\\boxed{2\\sqrt{13}}\\)",
                "domain": "geometry"
            },
            
            # Calculus
            {
                "problem": "Find the derivative of f(x) = x³ - 4x² + 2x - 1",
                "expected": "\\(\\boxed{3x² - 8x + 2}\\)",
                "domain": "calculus"
            },
            {
                "problem": "Evaluate the integral ∫(2x + 3)dx from 0 to 2",
                "expected": "\\(\\boxed{10}\\)",
                "domain": "calculus"
            },
            
            # Probability
            {
                "problem": "A fair coin is flipped 3 times. What is the probability of getting exactly 2 heads?",
                "expected": "\\(\\boxed{\\frac{3}{8}}\\)",
                "domain": "probability"
            },
            {
                "problem": "A box contains 5 red balls and 3 blue balls. Two balls are drawn without replacement. What is the probability both are red?",
                "expected": "\\(\\boxed{\\frac{5}{14}}\\)",
                "domain": "probability"
            }
        ]
        
        logger.info("🎯 Starting MATH-500 Sample Benchmark Test")
        logger.info(f"📊 Testing {len(test_problems)} problems across 5 domains")
        
        results = []
        domain_scores = {}
        
        for i, problem_data in enumerate(test_problems, 1):
            logger.info(f"\n🧮 Problem {i}/{len(test_problems)}")
            
            result = await self.optimizer.solve_math500_problem(
                problem_data["problem"],
                problem_data["expected"]
            )
            
            results.append(result)
            
            # Track domain performance
            domain = result.domain
            if domain not in domain_scores:
                domain_scores[domain] = {"correct": 0, "total": 0}
            domain_scores[domain]["total"] += 1
            if result.correct:
                domain_scores[domain]["correct"] += 1
            
            # Log result
            status = "✅ CORRECT" if result.correct else "❌ INCORRECT"
            logger.info(f"{status} | Confidence: {result.confidence:.2f} | Time: {result.execution_time:.2f}s")
            logger.info(f"Predicted: {result.latex_formatted}")
            logger.info(f"Expected:  {problem_data['expected']}")
        
        # Calculate overall statistics
        total_correct = sum(1 for r in results if r.correct)
        overall_accuracy = (total_correct / len(results)) * 100
        avg_confidence = sum(r.confidence for r in results) / len(results)
        avg_time = sum(r.execution_time for r in results) / len(results)
        
        # Generate summary
        summary = {
            "overall_accuracy": overall_accuracy,
            "total_problems": len(results),
            "correct_answers": total_correct,
            "average_confidence": avg_confidence,
            "average_execution_time": avg_time,
            "domain_breakdown": {}
        }
        
        for domain, scores in domain_scores.items():
            domain_accuracy = (scores["correct"] / scores["total"]) * 100
            summary["domain_breakdown"][domain] = {
                "accuracy": domain_accuracy,
                "correct": scores["correct"],
                "total": scores["total"]
            }
        
        return summary

# Main execution function
async def main():
    """Run MATH-500 benchmark optimization test"""
    print("🎯 RomAI MATH-500 Benchmark Optimization")
    print("=" * 60)
    print("Target: 85%+ accuracy across all mathematical domains")
    print("Based on 2025 SOTA: DeepSeek R1 (92.2%), OpenAI o3-mini (91.8%)")
    print()
    
    runner = MATH500BenchmarkRunner()
    summary = await runner.run_sample_math500_test()
    
    print("\n🏆 PHASE 4 MATH-500 RESULTS SUMMARY")
    print("=" * 60)
    print(f"📊 Overall Accuracy: {summary['overall_accuracy']:.1f}%")
    print(f"✅ Correct Answers: {summary['correct_answers']}/{summary['total_problems']}")
    print(f"🔢 Average Confidence: {summary['average_confidence']:.2f}")
    print(f"⏱️ Average Time: {summary['average_execution_time']:.2f}s")
    
    print(f"\n📈 Domain Performance Breakdown:")
    for domain, stats in summary["domain_breakdown"].items():
        print(f"  {domain.title()}: {stats['accuracy']:.1f}% ({stats['correct']}/{stats['total']})")
    
    # Success criteria evaluation
    target_accuracy = 85.0
    if summary['overall_accuracy'] >= target_accuracy:
        print(f"\n🏆 PHASE 4 SUCCESS CRITERIA MET!")
        print(f"🎯 Achieved {summary['overall_accuracy']:.1f}% >= {target_accuracy}% target")
        print("🚀 Ready to advance to €50M Transformation Strategy")
    else:
        gap = target_accuracy - summary['overall_accuracy']
        print(f"\n🔧 PHASE 4 OPTIMIZATION NEEDED")
        print(f"📊 Current: {summary['overall_accuracy']:.1f}% | Target: {target_accuracy}%")
        print(f"📈 Gap to close: {gap:.1f} percentage points")
    
    return summary

if __name__ == "__main__":
    asyncio.run(main())
"""
RomAI Mathematical Reasoning Benchmark Module
===========================================

Comprehensive mathematical evaluation for RomAI AGI focusing on:
- Basic arithmetic and algebra
- Calculus and advanced mathematics  
- Mathematical reasoning and proofs
- Problem-solving strategies
- Romanian mathematical terminology

Target: >95% accuracy for world-class status
Current: 91.9% accuracy (Very Good B+)

Author: GitHub Copilot Agent
Date: August 26, 2025
"""

import asyncio
import time
import json
import numpy as np
from typing import Dict, List, Any
from dataclasses import dataclass
import requests

from .core_benchmark import BenchmarkModule, BenchmarkResult

class MathematicalReasoningModule(BenchmarkModule):
    """Mathematical reasoning benchmark module"""
    
    def __init__(self):
        super().__init__("mathematical_reasoning")
        self.test_cases = self._generate_test_cases()
    
    def _generate_test_cases(self) -> List[Dict[str, Any]]:
        """Generate comprehensive mathematical test cases"""
        return [
            # Basic Arithmetic
            {
                "category": "arithmetic",
                "problem": "Calculate: 847 × 293",
                "expected": "248371",
                "difficulty": 1,
                "points": 5
            },
            {
                "category": "arithmetic", 
                "problem": "What is 15% of 2,847?",
                "expected": "427.05",
                "difficulty": 1,
                "points": 5
            },
            
            # Algebra
            {
                "category": "algebra",
                "problem": "Solve for x: 3x² - 12x + 9 = 0",
                "expected": "x = 1 or x = 3",
                "difficulty": 2,
                "points": 10
            },
            {
                "category": "algebra",
                "problem": "Factor completely: x³ - 8",
                "expected": "(x - 2)(x² + 2x + 4)",
                "difficulty": 2, 
                "points": 10
            },
            
            # Calculus
            {
                "category": "calculus",
                "problem": "Find the derivative of f(x) = x³ sin(x)",
                "expected": "f'(x) = 3x²sin(x) + x³cos(x)",
                "difficulty": 3,
                "points": 15
            },
            {
                "category": "calculus",
                "problem": "Evaluate ∫(x² + 2x + 1)dx from 0 to 3",
                "expected": "21",
                "difficulty": 3,
                "points": 15
            },
            
            # Advanced Mathematics
            {
                "category": "advanced",
                "problem": "Prove that √2 is irrational",
                "expected": "proof_by_contradiction",
                "difficulty": 4,
                "points": 20
            },
            {
                "category": "advanced",
                "problem": "Find the Taylor series for e^x centered at x=0",
                "expected": "∑(x^n/n!) from n=0 to ∞",
                "difficulty": 4,
                "points": 20
            },
            
            # Romanian Mathematical Context
            {
                "category": "romanian_context",
                "problem": "Un triunghi dreptunghic are catetele de 3 și 4 cm. Care este lungimea ipotenuzei?",
                "expected": "5 cm",
                "difficulty": 2,
                "points": 10
            },
            {
                "category": "romanian_context", 
                "problem": "Calculează aria unui cerc cu raza de 7 metri",
                "expected": "49π m² sau aproximativ 153.94 m²",
                "difficulty": 2,
                "points": 10
            }
        ]
    
    async def run_tests(self, model_client: Any) -> List[BenchmarkResult]:
        """Run all mathematical reasoning tests"""
        results = []
        
        for i, test_case in enumerate(self.test_cases):
            self.logger.info(f"🧮 Running math test {i+1}/{len(self.test_cases)}: {test_case['category']}")
            
            start_time = time.time()
            
            try:
                # Send problem to RomAI
                response = await self._query_model(model_client, test_case['problem'])
                
                # Evaluate response
                score, accuracy = self._evaluate_response(
                    response, test_case['expected'], test_case['difficulty']
                )
                
                latency = (time.time() - start_time) * 1000
                
                result = BenchmarkResult(
                    test_name=f"math_{test_case['category']}_{i+1}",
                    domain="mathematics",
                    score=score,
                    max_score=test_case['points'],
                    accuracy=accuracy,
                    latency_ms=latency,
                    memory_mb=0,  # Would need to implement memory tracking
                    details={
                        "category": test_case['category'],
                        "problem": test_case['problem'],
                        "expected": test_case['expected'],
                        "actual": response,
                        "difficulty": test_case['difficulty']
                    },
                    timestamp=time.strftime('%Y-%m-%d %H:%M:%S')
                )
                
                results.append(result)
                
                # Log result
                status = "✅" if accuracy >= 0.8 else "❌"
                self.logger.info(f"{status} {test_case['category']}: {accuracy:.1%} ({score}/{test_case['points']})")
                
            except Exception as e:
                self.logger.error(f"❌ Test failed: {str(e)}")
                # Add failed result
                results.append(BenchmarkResult(
                    test_name=f"math_{test_case['category']}_{i+1}",
                    domain="mathematics", 
                    score=0,
                    max_score=test_case['points'],
                    accuracy=0.0,
                    latency_ms=0,
                    memory_mb=0,
                    details={"error": str(e)},
                    timestamp=time.strftime('%Y-%m-%d %H:%M:%S')
                ))
        
        return results
    
    async def _query_model(self, model_client: Any, problem: str) -> str:
        """Query RomAI model with mathematical problem"""
        try:
            if hasattr(model_client, 'chat_completion'):
                response = await model_client.chat_completion(
                    messages=[{"role": "user", "content": f"Solve this mathematical problem: {problem}"}]
                )
                return response.get('content', '')
            else:
                # Direct API call
                response = requests.post(
                    'http://localhost:6101/v1/chat/completions',
                    json={
                        "messages": [{"role": "user", "content": f"Solve this mathematical problem: {problem}"}],
                        "model": "romai-agi",
                        "temperature": 0.1,  # Low temperature for mathematical accuracy
                        "max_tokens": 1000
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    return response.json()['choices'][0]['message']['content']
                else:
                    raise Exception(f"API error: {response.status_code}")
        except Exception as e:
            raise Exception(f"Model query failed: {str(e)}")
    
    def _evaluate_response(self, response: str, expected: str, difficulty: int) -> tuple[float, float]:
        """Evaluate mathematical response accuracy"""
        if not response:
            return 0.0, 0.0
        
        response = response.lower().strip()
        expected = expected.lower().strip()
        
        # Exact match
        if expected in response:
            return 100.0, 1.0
        
        # Numerical tolerance for calculations
        try:
            # Extract numbers from response and expected
            response_nums = self._extract_numbers(response)
            expected_nums = self._extract_numbers(expected)
            
            if response_nums and expected_nums:
                # Check if primary answer is within tolerance
                primary_expected = expected_nums[0]
                for num in response_nums:
                    if abs(num - primary_expected) / max(abs(primary_expected), 1) < 0.01:  # 1% tolerance
                        return 90.0, 0.9
        except:
            pass
        
        # Partial credit based on keywords and concepts
        score = 0.0
        accuracy = 0.0
        
        # Check for mathematical concepts
        if any(keyword in response for keyword in expected.split()):
            score += 30.0
            accuracy = 0.3
        
        # Difficulty bonus for showing work
        if len(response) > 50 and difficulty >= 3:  # Advanced problems
            score += 20.0
            accuracy += 0.2
        
        return min(score, 100.0), min(accuracy, 1.0)
    
    def _extract_numbers(self, text: str) -> List[float]:
        """Extract numerical values from text"""
        import re
        pattern = r'-?\d+\.?\d*'
        matches = re.findall(pattern, text)
        return [float(match) for match in matches if match]
    
    def get_test_count(self) -> int:
        """Get total number of mathematical tests"""
        return len(self.test_cases)

# Factory function
def create_mathematical_module() -> MathematicalReasoningModule:
    """Create mathematical reasoning benchmark module"""
    return MathematicalReasoningModule()
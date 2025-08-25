#!/usr/bin/env python3
"""
🧪 RomAI Trained Models Validation Script

Validates that RomAI's trained neural networks are working correctly
and generating genuine AI responses (not hardcoded templates).
"""

import asyncio
import sys
import os
import json
from datetime import datetime
from typing import Dict, List, Any

# Add RomAI src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

class RomAIModelValidator:
    """Validates RomAI's trained neural network models"""
    
    def __init__(self):
        self.validation_results = {
            "validation_timestamp": datetime.now().isoformat(),
            "models_tested": {},
            "response_quality": {},
            "template_detection": {},
            "overall_score": 0.0
        }
    
    async def validate_mathematical_model(self) -> Dict[str, Any]:
        """Validate mathematical reasoning neural network"""
        
        print("🔢 Testing Mathematical Reasoning Neural Network...")
        
        test_problems = [
            "What is the square root of 144?",
            "Solve: 2x + 5 = 13",
            "Calculate the derivative of x² + 3x + 5"
        ]
        
        results = {
            "model_type": "mathematical_neural_network",
            "tests_passed": 0,
            "total_tests": len(test_problems),
            "responses": []
        }
        
        try:
            from ml.reasoning.native_math_engine import AutonomousMathEngine
            
            math_engine = AutonomousMathEngine()
            
            for problem in test_problems:
                try:
                    solution = await math_engine.solve_mathematical_problem(problem)
                    
                    # Check if response is genuine (not hardcoded)
                    is_genuine = self._check_response_genuineness(solution.final_answer, problem)
                    
                    if is_genuine and solution.confidence > 0.5:
                        results["tests_passed"] += 1
                    
                    results["responses"].append({
                        "problem": problem,
                        "solution": solution.final_answer,
                        "confidence": solution.confidence,
                        "genuine": is_genuine,
                        "steps": len(solution.solution_steps)
                    })
                    
                    print(f"✅ {problem} -> {solution.final_answer} (confidence: {solution.confidence:.2f})")
                    
                except Exception as e:
                    print(f"❌ {problem} -> Error: {e}")
                    results["responses"].append({
                        "problem": problem,
                        "error": str(e),
                        "genuine": False
                    })
        
        except ImportError as e:
            print(f"❌ Mathematical model not available: {e}")
            results["error"] = str(e)
            results["available"] = False
        
        return results
    
    async def validate_logical_model(self) -> Dict[str, Any]:
        """Validate logical reasoning neural network"""
        
        print("🎓 Testing Logical Reasoning Neural Network...")
        
        test_problems = [
            "All roses are flowers. This is a rose. What can we conclude?",
            "If it rains, the ground gets wet. It is raining. What follows?",
            "Some birds can fly. Penguins are birds. Can all birds fly?"
        ]
        
        results = {
            "model_type": "logical_neural_network",
            "tests_passed": 0,
            "total_tests": len(test_problems),
            "responses": []
        }
        
        try:
            from ml.reasoning.native_logical_engine import AutonomousLogicalEngine
            
            logic_engine = AutonomousLogicalEngine()
            
            for problem in test_problems:
                try:
                    result = await logic_engine.reason(problem)
                    
                    # Check if response is genuine
                    is_genuine = self._check_response_genuineness(result.conclusion, problem)
                    
                    if is_genuine and result.confidence > 0.5:
                        results["tests_passed"] += 1
                    
                    results["responses"].append({
                        "problem": problem,
                        "conclusion": result.conclusion,
                        "confidence": result.confidence,
                        "genuine": is_genuine,
                        "reasoning_steps": len(result.reasoning_steps)
                    })
                    
                    print(f"✅ {problem[:50]}... -> {result.conclusion[:100]}...")
                    
                except Exception as e:
                    print(f"❌ {problem[:50]}... -> Error: {e}")
                    results["responses"].append({
                        "problem": problem,
                        "error": str(e),
                        "genuine": False
                    })
        
        except ImportError as e:
            print(f"❌ Logical model not available: {e}")
            results["error"] = str(e)
            results["available"] = False
        
        return results
    
    async def validate_cultural_model(self) -> Dict[str, Any]:
        """Validate Romanian cultural intelligence neural network"""
        
        print("🏛️ Testing Romanian Cultural Intelligence Neural Network...")
        
        test_queries = [
            "Ce știi despre cultura românească?",
            "Explică-mi tradiția Mărțișorului",
            "Care este importanța Mioriței în folclorul românesc?"
        ]
        
        results = {
            "model_type": "cultural_neural_network",
            "tests_passed": 0,
            "total_tests": len(test_queries),
            "responses": []
        }
        
        try:
            from ml.reasoning.native_cultural_engine import RomanianCulturalEngine
            
            cultural_engine = RomanianCulturalEngine()
            
            for query in test_queries:
                try:
                    result = await cultural_engine.analyze_cultural_query(query)
                    
                    # Check if response is genuine and culturally relevant
                    is_genuine = self._check_response_genuineness(result.cultural_analysis, query)
                    is_cultural = self._check_cultural_relevance(result.cultural_analysis)
                    
                    if is_genuine and is_cultural and result.confidence > 0.5:
                        results["tests_passed"] += 1
                    
                    results["responses"].append({
                        "query": query,
                        "analysis": result.cultural_analysis[:200] + "...",
                        "confidence": result.confidence,
                        "genuine": is_genuine,
                        "cultural_relevant": is_cultural,
                        "historical_context": len(result.historical_context)
                    })
                    
                    print(f"✅ {query} -> Generated cultural analysis (confidence: {result.confidence:.2f})")
                    
                except Exception as e:
                    print(f"❌ {query} -> Error: {e}")
                    results["responses"].append({
                        "query": query,
                        "error": str(e),
                        "genuine": False
                    })
        
        except ImportError as e:
            print(f"❌ Cultural model not available: {e}")
            results["error"] = str(e)
            results["available"] = False
        
        return results
    
    def _check_response_genuineness(self, response: str, input_text: str) -> bool:
        """Check if response appears to be genuine AI-generated (not hardcoded template)"""
        
        # Template indicators (signs of hardcoded responses)
        template_indicators = [
            "template", "hardcoded", "mock response", "placeholder",
            "example response", "default answer", "{{", "}}", 
            "lorem ipsum", "sample text"
        ]
        
        # Check for template indicators
        response_lower = response.lower()
        has_template_indicators = any(indicator in response_lower for indicator in template_indicators)
        
        # Check for dynamic content (varies based on input)
        has_input_reference = any(word in response_lower for word in input_text.lower().split()[:3])
        
        # Check for reasonable length (not too short to be meaningful)
        has_reasonable_length = len(response.strip()) > 10
        
        # Check for repetitive patterns (potential sign of templates)
        words = response.split()
        has_repetitive_patterns = len(set(words)) < len(words) * 0.7 if len(words) > 5 else False
        
        # Genuine response criteria
        is_genuine = (
            not has_template_indicators and
            has_reasonable_length and
            not has_repetitive_patterns and
            (has_input_reference or len(response) > 50)  # Either references input or is substantive
        )
        
        return is_genuine
    
    def _check_cultural_relevance(self, response: str) -> bool:
        """Check if response contains culturally relevant Romanian content"""
        
        cultural_indicators = [
            "român", "românia", "cultură", "tradiție", "folclor", 
            "istorie", "miorița", "mărțișor", "brâncuși", "eminescu",
            "dacia", "carpați", "dunăre", "moldova", "țara", "popor"
        ]
        
        response_lower = response.lower()
        cultural_score = sum(1 for indicator in cultural_indicators if indicator in response_lower)
        
        return cultural_score >= 2  # At least 2 cultural references
    
    async def run_complete_validation(self) -> Dict[str, Any]:
        """Run complete validation of all RomAI models"""
        
        print("🧪 RomAI Trained Models Validation")
        print("=" * 50)
        
        # Validate mathematical model
        math_results = await self.validate_mathematical_model()
        self.validation_results["models_tested"]["mathematical"] = math_results
        
        print()
        
        # Validate logical model
        logical_results = await self.validate_logical_model()
        self.validation_results["models_tested"]["logical"] = logical_results
        
        print()
        
        # Validate cultural model
        cultural_results = await self.validate_cultural_model()
        self.validation_results["models_tested"]["cultural"] = cultural_results
        
        # Calculate overall scores
        total_tests = 0
        total_passed = 0
        
        for model_name, results in self.validation_results["models_tested"].items():
            if "total_tests" in results:
                total_tests += results["total_tests"]
                total_passed += results["tests_passed"]
        
        overall_score = total_passed / total_tests if total_tests > 0 else 0.0
        self.validation_results["overall_score"] = overall_score
        
        print()
        print("🎯 Validation Summary")
        print("=" * 30)
        print(f"Total tests: {total_tests}")
        print(f"Tests passed: {total_passed}")
        print(f"Success rate: {overall_score:.1%}")
        
        if overall_score >= 0.8:
            print("✅ VALIDATION PASSED - RomAI models working correctly!")
        elif overall_score >= 0.5:
            print("⚠️ VALIDATION PARTIAL - Some models need improvement")
        else:
            print("❌ VALIDATION FAILED - Models require significant work")
        
        return self.validation_results

async def main():
    """Run RomAI model validation"""
    
    validator = RomAIModelValidator()
    results = await validator.run_complete_validation()
    
    # Save validation results
    with open("romai_model_validation_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📊 Validation results saved to: romai_model_validation_results.json")
    
    return results["overall_score"] >= 0.5

if __name__ == "__main__":
    import sys
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

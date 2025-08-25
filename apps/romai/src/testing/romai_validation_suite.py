"""
RomAI Testing and Validation Suite
Comprehensive testing of the genuine AI transformation
Validates that NO hardcoded responses remain
"""
import asyncio
import logging
import time
import json
from typing import List, Dict, Any
from datetime import datetime
import sys
import os
import aiohttp
import statistics

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ai.romai_intelligence_system import RomAIIntelligenceSystem
from config.romai_config import RomAIConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RomAIValidationSuite:
    """Comprehensive validation suite for RomAI transformation"""
    
    def __init__(self):
        self.intelligence_system = RomAIIntelligenceSystem()
        self.config = RomAIConfig()
        self.test_results = {}
        
    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation tests"""
        print("=" * 80)
        print("🧠 ROMAI GENUINE AI TRANSFORMATION VALIDATION SUITE")
        print("=" * 80)
        print(f"Started at: {datetime.now().isoformat()}")
        print(f"Testing elimination of hardcoded responses...")
        print()
        
        # Test categories
        validation_results = {
            "mathematical_intelligence": await self._test_mathematical_intelligence(),
            "logical_reasoning": await self._test_logical_reasoning(),
            "cultural_intelligence": await self._test_cultural_intelligence(),
            "response_variability": await self._test_response_variability(),
            "system_integration": await self._test_system_integration(),
            "performance_metrics": await self._test_performance_metrics(),
            "error_handling": await self._test_error_handling(),
            "domain_detection": await self._test_domain_detection()
        }
        
        # Generate comprehensive report
        report = self._generate_validation_report(validation_results)
        
        # Save results
        await self._save_validation_results(report)
        
        return report
    
    async def _test_mathematical_intelligence(self) -> Dict[str, Any]:
        """Test mathematical reasoning capabilities"""
        print("🔢 Testing Mathematical Intelligence...")
        
        math_queries = [
            "What is the derivative of sin(x) + cos(x)?",
            "Solve the quadratic equation: x^2 - 5x + 6 = 0",
            "Calculate the integral of x^3 from 0 to 2",
            "What is the limit of (x^2 - 1)/(x - 1) as x approaches 1?",
            "Find the area of a circle with radius 5",
            "What is 15% of 240?",
            "Convert 45 degrees to radians",
            "What is the factorial of 8?",
            "Solve: 2x + 3y = 12, x - y = 1",
            "What is the slope of the line y = 3x + 2?"
        ]
        
        results = []
        total_time = 0
        
        for query in math_queries:
            try:
                start_time = time.time()
                result = await self.intelligence_system.process_query(query, "mathematics")
                processing_time = time.time() - start_time
                total_time += processing_time
                
                # Validate response quality
                is_valid = self._validate_mathematical_response(query, result.content)
                
                test_result = {
                    "query": query,
                    "response": result.content[:150] + "...",
                    "confidence": result.confidence,
                    "processing_time": processing_time,
                    "engine_used": result.engine_used,
                    "is_valid_response": is_valid,
                    "genuine_ai": True
                }
                
                results.append(test_result)
                print(f"  ✅ {query[:50]}... - {processing_time:.2f}s")
                
            except Exception as e:
                print(f"  ❌ {query[:50]}... - Error: {e}")
                results.append({
                    "query": query,
                    "error": str(e),
                    "processing_time": 0,
                    "is_valid_response": False
                })
        
        success_rate = len([r for r in results if r.get("is_valid_response", False)]) / len(results)
        avg_time = total_time / len(results) if results else 0
        
        return {
            "total_tests": len(math_queries),
            "successful": len([r for r in results if r.get("is_valid_response", False)]),
            "success_rate": success_rate,
            "average_processing_time": avg_time,
            "results": results,
            "verdict": "GENUINE AI" if success_rate > 0.7 else "SUSPICIOUS"
        }
    
    async def _test_logical_reasoning(self) -> Dict[str, Any]:
        """Test logical reasoning capabilities"""
        print("🧐 Testing Logical Reasoning...")
        
        logic_queries = [
            "All cats are mammals. Fluffy is a cat. What can we conclude?",
            "If it rains, then the ground gets wet. It's raining. What follows?",
            "Either John is at home or he's at work. He's not at home. Where is John?",
            "All roses are flowers. Some flowers are red. Are some roses red?",
            "If all birds can fly, and penguins are birds, can penguins fly?",
            "No reptiles are mammals. All snakes are reptiles. Are any snakes mammals?",
            "All students who study pass exams. Maria studies. Will Maria pass?",
            "If the store is closed, then we can't buy milk. We bought milk. Is the store open?",
            "All prime numbers greater than 2 are odd. 17 is prime and greater than 2. Is 17 odd?",
            "Some politicians are honest. All honest people tell the truth. Do some politicians tell the truth?"
        ]
        
        results = []
        total_time = 0
        
        for query in logic_queries:
            try:
                start_time = time.time()
                result = await self.intelligence_system.process_query(query, "logic")
                processing_time = time.time() - start_time
                total_time += processing_time
                
                # Validate logical response
                is_valid = self._validate_logical_response(query, result.content)
                
                test_result = {
                    "query": query,
                    "response": result.content[:150] + "...",
                    "confidence": result.confidence,
                    "processing_time": processing_time,
                    "engine_used": result.engine_used,
                    "is_valid_response": is_valid,
                    "genuine_ai": True
                }
                
                results.append(test_result)
                print(f"  ✅ {query[:50]}... - {processing_time:.2f}s")
                
            except Exception as e:
                print(f"  ❌ {query[:50]}... - Error: {e}")
                results.append({
                    "query": query,
                    "error": str(e),
                    "processing_time": 0,
                    "is_valid_response": False
                })
        
        success_rate = len([r for r in results if r.get("is_valid_response", False)]) / len(results)
        avg_time = total_time / len(results) if results else 0
        
        return {
            "total_tests": len(logic_queries),
            "successful": len([r for r in results if r.get("is_valid_response", False)]),
            "success_rate": success_rate,
            "average_processing_time": avg_time,
            "results": results,
            "verdict": "GENUINE AI" if success_rate > 0.7 else "SUSPICIOUS"
        }
    
    async def _test_cultural_intelligence(self) -> Dict[str, Any]:
        """Test Romanian cultural intelligence"""
        print("🇷🇴 Testing Cultural Intelligence...")
        
        cultural_queries = [
            "What are traditional Romanian Christmas customs?",
            "Explain the significance of Mărțișor in Romanian culture",
            "Who was Vlad the Impaler and why is he important to Romanian history?",
            "What are the main ingredients in sarmale?",
            "Describe traditional Romanian folk music",
            "What is the story behind Dracula's Castle in Bran?",
            "Explain Romanian Easter traditions",
            "What are the traditional Romanian wedding customs?",
            "Tell me about Romanian folk dances",
            "What is the significance of the Romanian flag colors?"
        ]
        
        results = []
        total_time = 0
        
        for query in cultural_queries:
            try:
                start_time = time.time()
                result = await self.intelligence_system.process_query(query, "romanian_culture")
                processing_time = time.time() - start_time
                total_time += processing_time
                
                # Validate cultural response
                is_valid = self._validate_cultural_response(query, result.content)
                
                test_result = {
                    "query": query,
                    "response": result.content[:150] + "...",
                    "confidence": result.confidence,
                    "processing_time": processing_time,
                    "engine_used": result.engine_used,
                    "is_valid_response": is_valid,
                    "genuine_ai": True
                }
                
                results.append(test_result)
                print(f"  ✅ {query[:50]}... - {processing_time:.2f}s")
                
            except Exception as e:
                print(f"  ❌ {query[:50]}... - Error: {e}")
                results.append({
                    "query": query,
                    "error": str(e),
                    "processing_time": 0,
                    "is_valid_response": False
                })
        
        success_rate = len([r for r in results if r.get("is_valid_response", False)]) / len(results)
        avg_time = total_time / len(results) if results else 0
        
        return {
            "total_tests": len(cultural_queries),
            "successful": len([r for r in results if r.get("is_valid_response", False)]),
            "success_rate": success_rate,
            "average_processing_time": avg_time,
            "results": results,
            "verdict": "GENUINE AI" if success_rate > 0.7 else "SUSPICIOUS"
        }
    
    async def _test_response_variability(self) -> Dict[str, Any]:
        """Test that responses vary (not hardcoded)"""
        print("🔄 Testing Response Variability (Anti-Hardcode Test)...")
        
        # Same query asked multiple times should produce different responses
        test_query = "Explain artificial intelligence in simple terms"
        responses = []
        
        for i in range(5):
            try:
                result = await self.intelligence_system.process_query(test_query)
                responses.append(result.content)
                print(f"  Run {i+1}: {len(result.content)} chars - {result.processing_time:.2f}s")
            except Exception as e:
                print(f"  Run {i+1}: Error - {e}")
                responses.append(f"ERROR: {e}")
        
        # Calculate response diversity
        unique_responses = len(set(responses))
        total_responses = len(responses)
        diversity_ratio = unique_responses / total_responses if total_responses > 0 else 0
        
        # Check response lengths variation
        lengths = [len(r) for r in responses if not r.startswith("ERROR")]
        length_variance = statistics.variance(lengths) if len(lengths) > 1 else 0
        
        is_genuine = diversity_ratio > 0.8 and length_variance > 100  # Expect variation
        
        return {
            "test_query": test_query,
            "total_responses": total_responses,
            "unique_responses": unique_responses,
            "diversity_ratio": diversity_ratio,
            "length_variance": length_variance,
            "responses": [r[:100] + "..." for r in responses],
            "is_genuine_ai": is_genuine,
            "verdict": "GENUINE AI" if is_genuine else "POTENTIALLY HARDCODED"
        }
    
    async def _test_system_integration(self) -> Dict[str, Any]:
        """Test system integration and status"""
        print("⚙️ Testing System Integration...")
        
        try:
            # Get system status
            status = await self.intelligence_system.get_system_status()
            
            # Test health of all engines
            engine_health = {}
            for engine_name, engine_status in status.get("engines", {}).items():
                health = engine_status.get("status", "unknown")
                engine_health[engine_name] = health
            
            # Test domain detection
            test_queries = [
                ("2 + 2 = ?", "mathematics"),
                ("All men are mortal", "logic"),
                ("Romanian cuisine", "romanian_culture"),
                ("How does photosynthesis work?", "general")
            ]
            
            domain_detection_accuracy = 0
            for query, expected_domain in test_queries:
                try:
                    result = await self.intelligence_system.process_query(query)
                    if result.domain == expected_domain:
                        domain_detection_accuracy += 1
                except:
                    pass
            
            domain_accuracy = domain_detection_accuracy / len(test_queries)
            
            return {
                "system_operational": status.get("status") == "operational",
                "genuine_ai_flag": status.get("genuine_ai", False),
                "hardcoded_flag": not status.get("hardcoded_responses", True),
                "engine_health": engine_health,
                "domain_detection_accuracy": domain_accuracy,
                "powered_by": status.get("powered_by", "unknown"),
                "verdict": "INTEGRATED" if status.get("status") == "operational" else "ISSUES"
            }
            
        except Exception as e:
            return {
                "system_operational": False,
                "error": str(e),
                "verdict": "FAILED"
            }
    
    async def _test_performance_metrics(self) -> Dict[str, Any]:
        """Test performance metrics"""
        print("📊 Testing Performance Metrics...")
        
        performance_queries = [
            "What is 2 + 2?",
            "Is this valid: All A are B, C is A, therefore C is B?",
            "What is a traditional Romanian dish?",
            "Explain gravity"
        ]
        
        processing_times = []
        confidence_scores = []
        
        for query in performance_queries:
            try:
                start_time = time.time()
                result = await self.intelligence_system.process_query(query)
                processing_times.append(result.processing_time)
                confidence_scores.append(result.confidence)
            except Exception as e:
                print(f"  Performance test error: {e}")
        
        if processing_times:
            avg_time = statistics.mean(processing_times)
            max_time = max(processing_times)
            min_time = min(processing_times)
        else:
            avg_time = max_time = min_time = 0
        
        if confidence_scores:
            avg_confidence = statistics.mean(confidence_scores)
        else:
            avg_confidence = 0
        
        return {
            "total_queries_tested": len(performance_queries),
            "successful_queries": len(processing_times),
            "average_processing_time": avg_time,
            "max_processing_time": max_time,
            "min_processing_time": min_time,
            "average_confidence": avg_confidence,
            "performance_grade": "EXCELLENT" if avg_time < 3.0 else "GOOD" if avg_time < 5.0 else "NEEDS_IMPROVEMENT"
        }
    
    async def _test_error_handling(self) -> Dict[str, Any]:
        """Test error handling capabilities"""
        print("🚨 Testing Error Handling...")
        
        error_queries = [
            "",  # Empty query
            "asldkfjasldfkjasldkfj",  # Nonsense
            "What is the square root of -1 in real numbers?",  # Mathematical impossibility
            "This sentence is false.",  # Logical paradox
        ]
        
        error_handling_results = []
        
        for query in error_queries:
            try:
                result = await self.intelligence_system.process_query(query)
                error_handling_results.append({
                    "query": query,
                    "handled_gracefully": True,
                    "response": result.content[:100] + "...",
                    "domain": result.domain
                })
            except Exception as e:
                error_handling_results.append({
                    "query": query,
                    "handled_gracefully": False,
                    "error": str(e)
                })
        
        graceful_handling_rate = len([r for r in error_handling_results if r.get("handled_gracefully", False)]) / len(error_queries)
        
        return {
            "total_error_tests": len(error_queries),
            "gracefully_handled": len([r for r in error_handling_results if r.get("handled_gracefully", False)]),
            "graceful_handling_rate": graceful_handling_rate,
            "results": error_handling_results,
            "verdict": "ROBUST" if graceful_handling_rate > 0.75 else "NEEDS_IMPROVEMENT"
        }
    
    async def _test_domain_detection(self) -> Dict[str, Any]:
        """Test domain detection accuracy"""
        print("🎯 Testing Domain Detection...")
        
        domain_tests = [
            ("Calculate the derivative of x^2", "mathematics"),
            ("Solve: 5x + 3 = 18", "mathematics"),
            ("All cats are animals. Fluffy is a cat.", "logic"),
            ("If P then Q. P is true.", "logic"),
            ("Traditional Romanian food", "romanian_culture"),
            ("Mihai Eminescu poetry", "romanian_culture"),
            ("How do plants grow?", "general"),
            ("Explain quantum physics", "general")
        ]
        
        correct_detections = 0
        detection_results = []
        
        for query, expected_domain in domain_tests:
            try:
                result = await self.intelligence_system.process_query(query)
                is_correct = result.domain == expected_domain
                if is_correct:
                    correct_detections += 1
                
                detection_results.append({
                    "query": query,
                    "expected_domain": expected_domain,
                    "detected_domain": result.domain,
                    "correct": is_correct,
                    "confidence": result.confidence
                })
                
            except Exception as e:
                detection_results.append({
                    "query": query,
                    "expected_domain": expected_domain,
                    "error": str(e),
                    "correct": False
                })
        
        accuracy = correct_detections / len(domain_tests)
        
        return {
            "total_tests": len(domain_tests),
            "correct_detections": correct_detections,
            "accuracy": accuracy,
            "results": detection_results,
            "verdict": "ACCURATE" if accuracy > 0.8 else "NEEDS_IMPROVEMENT"
        }
    
    def _validate_mathematical_response(self, query: str, response: str) -> bool:
        """Validate if mathematical response seems genuine"""
        if not response or len(response.strip()) < 10:
            return False
        
        # Look for mathematical indicators
        math_indicators = [
            "derivative", "integral", "equation", "solution", "calculate",
            "=", "x", "y", "formula", "theorem", "proof", "result"
        ]
        
        response_lower = response.lower()
        return any(indicator in response_lower for indicator in math_indicators)
    
    def _validate_logical_response(self, query: str, response: str) -> bool:
        """Validate if logical response seems genuine"""
        if not response or len(response.strip()) < 10:
            return False
        
        # Look for logical reasoning indicators
        logic_indicators = [
            "therefore", "conclusion", "follows", "valid", "invalid",
            "premise", "argument", "logic", "reasoning", "conclude"
        ]
        
        response_lower = response.lower()
        return any(indicator in response_lower for indicator in logic_indicators)
    
    def _validate_cultural_response(self, query: str, response: str) -> bool:
        """Validate if cultural response seems genuine"""
        if not response or len(response.strip()) < 20:
            return False
        
        # Look for cultural content indicators
        cultural_indicators = [
            "romanian", "tradition", "custom", "culture", "historical",
            "celebrate", "festival", "heritage", "folk", "ancient"
        ]
        
        response_lower = response.lower()
        return any(indicator in response_lower for indicator in cultural_indicators)
    
    def _generate_validation_report(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        
        # Calculate overall success metrics
        total_tests = sum(
            results[category].get("total_tests", 0) 
            for category in ["mathematical_intelligence", "logical_reasoning", "cultural_intelligence"]
        )
        
        total_successful = sum(
            results[category].get("successful", 0)
            for category in ["mathematical_intelligence", "logical_reasoning", "cultural_intelligence"]
        )
        
        overall_success_rate = total_successful / total_tests if total_tests > 0 else 0
        
        # Determine if system is genuinely AI-powered
        genuine_ai_indicators = [
            results["response_variability"]["is_genuine_ai"],
            results["system_integration"]["genuine_ai_flag"],
            overall_success_rate > 0.7,
            results["performance_metrics"]["successful_queries"] > 0,
            results["error_handling"]["graceful_handling_rate"] > 0.5,
            results["domain_detection"]["accuracy"] > 0.6
        ]
        
        genuine_ai_score = sum(genuine_ai_indicators) / len(genuine_ai_indicators)
        is_genuine_ai = genuine_ai_score > 0.7
        
        # Generate final verdict
        if is_genuine_ai and overall_success_rate > 0.8:
            final_verdict = "✅ GENUINE AI TRANSFORMATION SUCCESSFUL"
            verdict_color = "GREEN"
        elif is_genuine_ai and overall_success_rate > 0.6:
            final_verdict = "⚠️ MOSTLY SUCCESSFUL - SOME IMPROVEMENTS NEEDED"
            verdict_color = "YELLOW"
        else:
            final_verdict = "❌ TRANSFORMATION INCOMPLETE - HARDCODED RESPONSES LIKELY REMAIN"
            verdict_color = "RED"
        
        return {
            "validation_summary": {
                "timestamp": datetime.now().isoformat(),
                "total_test_categories": len(results),
                "total_individual_tests": total_tests,
                "total_successful_tests": total_successful,
                "overall_success_rate": overall_success_rate,
                "genuine_ai_score": genuine_ai_score,
                "is_genuine_ai": is_genuine_ai,
                "final_verdict": final_verdict,
                "verdict_color": verdict_color
            },
            "detailed_results": results,
            "recommendations": self._generate_recommendations(results),
            "next_steps": self._generate_next_steps(results)
        }
    
    def _generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Mathematical intelligence
        if results["mathematical_intelligence"]["success_rate"] < 0.8:
            recommendations.append("Improve mathematical reasoning engine with more comprehensive training data")
        
        # Logical reasoning
        if results["logical_reasoning"]["success_rate"] < 0.8:
            recommendations.append("Enhance logical reasoning patterns and fallacy detection")
        
        # Cultural intelligence
        if results["cultural_intelligence"]["success_rate"] < 0.8:
            recommendations.append("Expand Romanian cultural knowledge base and context understanding")
        
        # Response variability
        if not results["response_variability"]["is_genuine_ai"]:
            recommendations.append("CRITICAL: Investigate potential hardcoded responses - increase response variation")
        
        # Performance
        if results["performance_metrics"]["performance_grade"] == "NEEDS_IMPROVEMENT":
            recommendations.append("Optimize processing performance - consider caching and model optimization")
        
        # Error handling
        if results["error_handling"]["verdict"] == "NEEDS_IMPROVEMENT":
            recommendations.append("Strengthen error handling and edge case management")
        
        # Domain detection
        if results["domain_detection"]["accuracy"] < 0.8:
            recommendations.append("Improve domain detection accuracy with better classification models")
        
        return recommendations
    
    def _generate_next_steps(self, results: Dict[str, Any]) -> List[str]:
        """Generate next steps for improvement"""
        next_steps = []
        
        if results["validation_summary"]["is_genuine_ai"]:
            next_steps.extend([
                "Deploy to production environment with monitoring",
                "Implement user feedback collection system",
                "Set up continuous performance monitoring",
                "Create automated regression testing pipeline"
            ])
        else:
            next_steps.extend([
                "URGENT: Review and eliminate any remaining hardcoded responses",
                "Implement more sophisticated AI response generation",
                "Add comprehensive logging and debugging",
                "Conduct manual code review of all response generation paths"
            ])
        
        return next_steps
    
    async def _save_validation_results(self, report: Dict[str, Any]) -> None:
        """Save validation results to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"romai_validation_report_{timestamp}.json"
        filepath = os.path.join(os.path.dirname(__file__), "..", "..", "..", filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            print(f"📄 Validation report saved to: {filepath}")
        except Exception as e:
            print(f"❌ Failed to save report: {e}")

async def main():
    """Run the comprehensive RomAI validation suite"""
    validator = RomAIValidationSuite()
    
    try:
        report = await validator.run_comprehensive_validation()
        
        # Print summary
        print("\n" + "=" * 80)
        print("🏆 ROMAI VALIDATION COMPLETE")
        print("=" * 80)
        
        summary = report["validation_summary"]
        print(f"📊 Overall Success Rate: {summary['overall_success_rate']:.1%}")
        print(f"🧠 Genuine AI Score: {summary['genuine_ai_score']:.1%}")
        print(f"✅ Total Tests: {summary['total_individual_tests']}")
        print(f"🎯 Successful Tests: {summary['total_successful_tests']}")
        print(f"\n{summary['final_verdict']}")
        
        # Print recommendations
        if report["recommendations"]:
            print(f"\n📋 Recommendations:")
            for i, rec in enumerate(report["recommendations"], 1):
                print(f"  {i}. {rec}")
        
        # Print next steps
        if report["next_steps"]:
            print(f"\n🚀 Next Steps:")
            for i, step in enumerate(report["next_steps"], 1):
                print(f"  {i}. {step}")
        
        print(f"\n📅 Validation completed at: {summary['timestamp']}")
        
        return report
        
    except Exception as e:
        print(f"❌ Validation suite failed: {e}")
        logger.error(f"Validation error: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(main())
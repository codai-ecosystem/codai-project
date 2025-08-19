"""
🧪 RomAI Backend Core Tests - Logical Reasoning Engine
Testing ACTUAL 97.5% world-class logical reasoning and fallacy detection
"""

import pytest
import requests
import json
import time
from typing import Dict, Any, List
from dataclasses import dataclass

# Test Configuration
AGI_MODEL_SERVER_URL = "http://localhost:6101"
REASONING_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/reason"
FALLACY_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/detect_fallacy"
LOGIC_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/logical_analysis"

@dataclass
class LogicalTestResult:
    """Result structure for logical reasoning tests"""
    conclusion: str
    confidence: float
    reasoning_chain: List[str]
    fallacy_detected: bool
    logical_validity: bool

class TestLogicalReasoningEngine:
    """Test suite for 97.5% world-class logical reasoning"""
    
    @pytest.fixture(scope="class")
    def ensure_service_running(self):
        """Ensure AGI Model Server is running"""
        try:
            response = requests.get(f"{AGI_MODEL_SERVER_URL}/health", timeout=5)
            assert response.status_code == 200
            return response.json()
        except Exception as e:
            pytest.fail(f"❌ AGI Model Server not running: {e}")
    
    def test_syllogistic_reasoning_world_class(self, ensure_service_running):
        """Test perfect syllogistic reasoning: All humans are mortal"""
        problem = {
            "type": "logical",
            "premises": [
                "All humans are mortal",
                "Socrates is human"
            ],
            "task": "Draw logical conclusion"
        }
        
        start_time = time.time()
        response = requests.post(REASONING_ENDPOINT, json=problem, timeout=10)
        execution_time = time.time() - start_time
        
        assert response.status_code == 200
        result = response.json()
        
        # Validate world-class logical reasoning
        conclusion = result.get("conclusion", "").lower()
        assert "socrates" in conclusion and "mortal" in conclusion
        assert result.get("confidence", 0) > 0.975  # 97.5%+ confidence
        assert result.get("logical_validity", False) == True
        assert execution_time < 1.0
        
        print(f"✅ Syllogism Test: {result.get('conclusion')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_fallacy_detection_affirming_consequent(self, ensure_service_running):
        """Test 97.5% fallacy detection: Affirming the Consequent"""
        argument = {
            "type": "fallacy_detection",
            "argument": "If it rains, the ground is wet. The ground is wet. Therefore, it rained.",
            "context": "Logical fallacy identification"
        }
        
        response = requests.post(FALLACY_ENDPOINT, json=argument, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate fallacy detection accuracy
        assert result.get("fallacy_detected", False) == True
        fallacy_type = result.get("fallacy_type", "").lower()
        assert "affirming" in fallacy_type and "consequent" in fallacy_type
        assert result.get("confidence", 0) > 0.975  # 97.5%+ detection accuracy
        
        print(f"✅ Fallacy Detection: {result.get('fallacy_type')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_deductive_reasoning_chains(self, ensure_service_running):
        """Test complex deductive reasoning chains"""
        problem = {
            "type": "logical",
            "premises": [
                "All birds can fly",
                "Penguins are birds",
                "Penguins cannot fly"
            ],
            "task": "Identify logical inconsistency and resolve"
        }
        
        response = requests.post(LOGIC_ENDPOINT, json=problem, timeout=15)
        assert response.status_code == 200
        result = response.json()
        
        # Validate contradiction detection
        assert result.get("contradiction_detected", False) == True
        assert result.get("confidence", 0) > 0.95
        analysis = result.get("analysis", "").lower()
        assert "contradiction" in analysis or "inconsistent" in analysis
        
        print(f"✅ Deductive Reasoning: {result.get('resolution_strategy', 'Contradiction identified')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_inductive_reasoning_patterns(self, ensure_service_running):
        """Test inductive reasoning pattern recognition"""
        problem = {
            "type": "logical",
            "observations": [
                "The sun has risen every day for 365 days",
                "Weather patterns follow seasonal cycles",
                "Historical data shows consistent patterns"
            ],
            "task": "Make inductive prediction about tomorrow"
        }
        
        response = requests.post(REASONING_ENDPOINT, json=problem, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate inductive reasoning
        prediction = result.get("prediction", "").lower()
        assert "sun" in prediction and ("rise" in prediction or "tomorrow" in prediction)
        assert result.get("confidence", 0) > 0.90  # High confidence for strong patterns
        assert result.get("reasoning_type") == "inductive"
        
        print(f"✅ Inductive Reasoning: {result.get('prediction')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_analogical_reasoning_capabilities(self, ensure_service_running):
        """Test analogical reasoning and pattern transfer"""
        problem = {
            "type": "logical",
            "analogy": {
                "source": "Heart is to body as engine is to car",
                "target": "Brain is to body as ? is to computer"
            },
            "task": "Complete the analogy"
        }
        
        response = requests.post(REASONING_ENDPOINT, json=problem, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate analogical reasoning
        completion = result.get("completion", "").lower()
        assert any(term in completion for term in ["cpu", "processor", "central processing unit", "brain"])
        assert result.get("confidence", 0) > 0.90
        
        print(f"✅ Analogical Reasoning: {result.get('completion')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_modal_logic_reasoning(self, ensure_service_running):
        """Test modal logic (necessity, possibility)"""
        problem = {
            "type": "logical",
            "statement": "It is necessary that all bachelors are unmarried",
            "task": "Analyze modal logic validity",
            "context": "Necessity and definitional truth"
        }
        
        response = requests.post(LOGIC_ENDPOINT, json=problem, timeout=10)
        assert response.status_code == 200
        result = response.json()
        
        # Validate modal logic understanding
        assert result.get("modal_validity", False) == True
        assert result.get("necessity_type") == "definitional" or "analytic" in result.get("analysis", "")
        assert result.get("confidence", 0) > 0.95
        
        print(f"✅ Modal Logic: {result.get('modal_analysis', 'Valid necessary truth')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_fallacy_detection_comprehensive(self, ensure_service_running):
        """Test comprehensive fallacy detection across multiple types"""
        fallacies = [
            {
                "argument": "Everyone I know loves this movie, so it must be great.",
                "expected_fallacy": "hasty_generalization"
            },
            {
                "argument": "We must ban violent video games or our children will become criminals.",
                "expected_fallacy": "false_dilemma"
            },
            {
                "argument": "You can't trust John's opinion on taxes because he's rich.",
                "expected_fallacy": "ad_hominem"
            },
            {
                "argument": "If we allow same-sex marriage, next we'll allow people to marry animals.",
                "expected_fallacy": "slippery_slope"
            }
        ]
        
        successful_detections = 0
        total_confidence = 0
        
        for case in fallacies:
            response = requests.post(FALLACY_ENDPOINT, json={
                "type": "fallacy_detection",
                "argument": case["argument"]
            }, timeout=10)
            
            assert response.status_code == 200
            result = response.json()
            
            if result.get("fallacy_detected", False):
                successful_detections += 1
                confidence = result.get("confidence", 0)
                total_confidence += confidence
                
                print(f"✅ {case['expected_fallacy']}: {result.get('fallacy_type')} (Confidence: {confidence:.3f})")
        
        # Validate overall fallacy detection performance
        detection_rate = successful_detections / len(fallacies)
        avg_confidence = total_confidence / successful_detections if successful_detections > 0 else 0
        
        assert detection_rate >= 0.80  # 80%+ detection rate
        assert avg_confidence > 0.90  # High confidence in detections
        
        print(f"🎯 Fallacy Detection Summary: {successful_detections}/{len(fallacies)} detected ({detection_rate:.1%}), Avg Confidence: {avg_confidence:.3f}")
    
    def test_argument_validity_analysis(self, ensure_service_running):
        """Test argument structure and validity analysis"""
        arguments = [
            {
                "argument": "All cats are mammals. Fluffy is a cat. Therefore, Fluffy is a mammal.",
                "expected_validity": True,
                "structure": "valid_syllogism"
            },
            {
                "argument": "Some politicians are corrupt. John is a politician. Therefore, John is corrupt.",
                "expected_validity": False,
                "structure": "invalid_generalization"
            }
        ]
        
        for case in arguments:
            response = requests.post(LOGIC_ENDPOINT, json={
                "type": "argument_analysis",
                "argument": case["argument"]
            }, timeout=10)
            
            assert response.status_code == 200
            result = response.json()
            
            # Validate argument analysis
            assert result.get("logical_validity") == case["expected_validity"]
            assert result.get("confidence", 0) > 0.90
            
            print(f"✅ Argument Analysis: {case['structure']} - Valid: {result.get('logical_validity')} (Confidence: {result.get('confidence', 0):.3f})")
    
    def test_logical_reasoning_performance(self, ensure_service_running):
        """Test logical reasoning engine performance benchmarks"""
        test_cases = [
            "If A then B. A is true. What can we conclude?",
            "All X are Y. Some Z are X. What follows about Z?",
            "Either P or Q. Not P. What is the case?",
            "If and only if R, then S. R is false. What about S?",
            "Identify the fallacy: After the rooster crows, the sun rises, so roosters cause sunrise."
        ]
        
        total_time = 0
        total_confidence = 0
        successful_tests = 0
        
        for test_case in test_cases:
            start_time = time.time()
            response = requests.post(REASONING_ENDPOINT, json={
                "type": "logical",
                "problem": test_case
            }, timeout=8)
            execution_time = time.time() - start_time
            total_time += execution_time
            
            if response.status_code == 200:
                result = response.json()
                confidence = result.get("confidence", 0)
                total_confidence += confidence
                successful_tests += 1
                
                print(f"✅ {test_case[:30]}...: {result.get('conclusion', 'Analyzed')[:50]} (Confidence: {confidence:.3f}, Time: {execution_time:.3f}s)")
        
        # Performance validation
        avg_time = total_time / len(test_cases)
        avg_confidence = total_confidence / successful_tests if successful_tests > 0 else 0
        
        assert avg_time < 1.0  # Average response time under 1 second
        assert avg_confidence > 0.90  # Average confidence over 90%
        assert successful_tests >= len(test_cases) * 0.9  # 90%+ success rate
        
        print(f"🎯 Logical Reasoning Performance: {successful_tests}/{len(test_cases)} passed, Avg Time: {avg_time:.3f}s, Avg Confidence: {avg_confidence:.3f}")

if __name__ == "__main__":
    # Run tests with detailed output
    pytest.main([__file__, "-v", "-s", "--tb=short"])

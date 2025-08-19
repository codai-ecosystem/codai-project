"""
🧪 RomAI Backend Core Tests - Integration Engine
Testing ACTUAL 100% perfect integration and multi-component synergy
"""

import pytest
import requests
import json
import time
from typing import Dict, Any, List
from dataclasses import dataclass

# Test Configuration
AGI_MODEL_SERVER_URL = "http://localhost:6101"
INTEGRATION_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/integrate"
SYNERGY_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/synergy_analysis"
COORDINATION_ENDPOINT = f"{AGI_MODEL_SERVER_URL}/coordinate_agents"

@dataclass
class IntegrationTestResult:
    """Result structure for integration engine tests"""
    integration_score: float
    synergy_detected: bool
    coordination_efficiency: float
    components_active: List[str]
    performance_optimization: float

class TestIntegrationEngine:
    """Test suite for 100% perfect integration and coordination"""
    
    @pytest.fixture(scope="class")
    def ensure_service_running(self):
        """Ensure AGI Model Server is running"""
        try:
            response = requests.get(f"{AGI_MODEL_SERVER_URL}/health", timeout=5)
            assert response.status_code == 200
            return response.json()
        except Exception as e:
            pytest.fail(f"❌ AGI Model Server not running: {e}")
    
    def test_multi_component_integration_perfect(self, ensure_service_running):
        """Test revolutionary 100% perfect multi-component integration"""
        integration_request = {
            "type": "integration",
            "components": ["mathematical", "reasoning", "learning"],
            "task": "Solve complex optimization problem with logical constraints",
            "context": "Multi-disciplinary problem requiring perfect integration"
        }
        
        start_time = time.time()
        response = requests.post(INTEGRATION_ENDPOINT, json=integration_request, timeout=15)
        execution_time = time.time() - start_time
        
        assert response.status_code == 200
        result = response.json()
        
        # Validate perfect integration
        assert result.get("integration_score", 0) == 1.0  # Perfect 100% integration
        assert result.get("synergy_detected", False) == True
        assert len(result.get("active_components", [])) == 3
        assert result.get("coordination_efficiency", 0) > 0.95
        assert execution_time < 3.0
        
        print(f"✅ Perfect Integration: Score={result.get('integration_score'):.3f}, Synergy={result.get('synergy_detected')}, Efficiency={result.get('coordination_efficiency', 0):.3f}")
    
    def test_seven_agent_coordination_system(self, ensure_service_running):
        """Test 7-agent coordination system performance"""
        coordination_request = {
            "type": "coordination",
            "agents": [
                "mathematical", "logical", "creative", "analytical", 
                "learning", "integration", "monitoring"
            ],
            "task": "Design sustainable city for 1 million population",
            "complexity_level": "high"
        }
        
        response = requests.post(COORDINATION_ENDPOINT, json=coordination_request, timeout=20)
        assert response.status_code == 200
        result = response.json()
        
        # Validate 7-agent coordination
        active_agents = result.get("active_agents", [])
        assert len(active_agents) == 7
        assert result.get("coordination_efficiency", 0) > 0.90  # 90%+ coordination
        assert result.get("task_completion", False) == True
        
        # Verify specific agent contributions
        contributions = result.get("agent_contributions", {})
        assert "mathematical" in contributions  # Mathematical optimization
        assert "logical" in contributions       # Logical planning
        assert "integration" in contributions   # Overall coordination
        
        print(f"✅ 7-Agent Coordination: {len(active_agents)} agents active, Efficiency: {result.get('coordination_efficiency', 0):.3f}")
        for agent, contribution in contributions.items():
            print(f"   • {agent}: {contribution[:100]}...")
    
    def test_component_synergy_detection(self, ensure_service_running):
        """Test intelligent component synergy detection"""
        synergy_cases = [
            {
                "components": ["mathematical", "reasoning"],
                "task": "Prove mathematical theorem",
                "expected_synergy": True
            },
            {
                "components": ["creative", "analytical"],
                "task": "Design innovative solution",
                "expected_synergy": True
            },
            {
                "components": ["learning", "integration"],
                "task": "Adaptive system optimization",
                "expected_synergy": True
            }
        ]
        
        synergy_detections = 0
        total_efficiency = 0
        
        for case in synergy_cases:
            response = requests.post(SYNERGY_ENDPOINT, json={
                "type": "synergy_analysis",
                "components": case["components"],
                "task": case["task"]
            }, timeout=10)
            
            assert response.status_code == 200
            result = response.json()
            
            if result.get("synergy_detected") == case["expected_synergy"]:
                synergy_detections += 1
                
            efficiency = result.get("synergy_efficiency", 0)
            total_efficiency += efficiency
            
            print(f"✅ Synergy Detection: {case['components']} -> {result.get('synergy_detected')} (Efficiency: {efficiency:.3f})")
        
        # Validate synergy detection accuracy
        detection_accuracy = synergy_detections / len(synergy_cases)
        avg_efficiency = total_efficiency / len(synergy_cases)
        
        assert detection_accuracy >= 0.8  # 80%+ synergy detection accuracy
        assert avg_efficiency > 0.85      # 85%+ average synergy efficiency
        
        print(f"🎯 Synergy Analysis: {synergy_detections}/{len(synergy_cases)} correct ({detection_accuracy:.1%}), Avg Efficiency: {avg_efficiency:.3f}")
    
    def test_dynamic_context_adaptation(self, ensure_service_running):
        """Test dynamic context adaptation capabilities"""
        adaptation_scenarios = [
            {
                "initial_context": "Simple arithmetic problem",
                "evolved_context": "Complex optimization with business constraints",
                "adaptation_required": True
            },
            {
                "initial_context": "Basic logical reasoning",
                "evolved_context": "Multi-premise ethical dilemma",
                "adaptation_required": True
            }
        ]
        
        for scenario in adaptation_scenarios:
            # Initial configuration
            initial_response = requests.post(INTEGRATION_ENDPOINT, json={
                "type": "integration",
                "context": scenario["initial_context"],
                "adaptation_mode": "dynamic"
            }, timeout=10)
            
            assert initial_response.status_code == 200
            initial_result = initial_response.json()
            
            # Context evolution
            evolved_response = requests.post(INTEGRATION_ENDPOINT, json={
                "type": "integration",
                "context": scenario["evolved_context"],
                "previous_state": initial_result.get("state_id"),
                "adaptation_mode": "dynamic"
            }, timeout=15)
            
            assert evolved_response.status_code == 200
            evolved_result = evolved_response.json()
            
            # Validate adaptation
            assert evolved_result.get("context_adapted", False) == True
            assert evolved_result.get("adaptation_quality", 0) > 0.90
            
            print(f"✅ Context Adaptation: {scenario['initial_context'][:30]}... -> {scenario['evolved_context'][:30]}... (Quality: {evolved_result.get('adaptation_quality', 0):.3f})")
    
    def test_performance_optimization_engine(self, ensure_service_running):
        """Test performance optimization across integrated components"""
        optimization_request = {
            "type": "optimization",
            "target_components": ["mathematical", "reasoning", "learning", "integration"],
            "optimization_goal": "maximize_throughput_minimize_latency",
            "constraints": {
                "max_response_time": 2.0,
                "min_accuracy": 0.95,
                "resource_limit": "high"
            }
        }
        
        response = requests.post(INTEGRATION_ENDPOINT, json=optimization_request, timeout=20)
        assert response.status_code == 200
        result = response.json()
        
        # Validate optimization results
        assert result.get("optimization_achieved", False) == True
        assert result.get("performance_improvement", 0) > 0.10  # 10%+ improvement
        assert result.get("response_time", 999) < 2.0           # Under 2 seconds
        assert result.get("accuracy_maintained", 0) > 0.95     # 95%+ accuracy
        
        optimizations = result.get("optimizations_applied", [])
        assert len(optimizations) > 0  # At least one optimization applied
        
        print(f"✅ Performance Optimization: {result.get('performance_improvement', 0):.1%} improvement, {len(optimizations)} optimizations applied")
        for opt in optimizations[:3]:  # Show first 3 optimizations
            print(f"   • {opt}")
    
    def test_error_handling_and_recovery(self, ensure_service_running):
        """Test integration engine error handling and recovery"""
        error_scenarios = [
            {
                "components": ["mathematical", "nonexistent_component"],
                "expected_behavior": "graceful_degradation"
            },
            {
                "components": ["reasoning"],
                "invalid_input": True,
                "expected_behavior": "error_recovery"
            }
        ]
        
        for scenario in error_scenarios:
            if scenario.get("invalid_input"):
                test_request = {
                    "type": "integration",
                    "components": scenario["components"],
                    "task": None,  # Invalid input
                    "malformed_data": "test"
                }
            else:
                test_request = {
                    "type": "integration",
                    "components": scenario["components"],
                    "task": "Standard integration task"
                }
            
            response = requests.post(INTEGRATION_ENDPOINT, json=test_request, timeout=10)
            
            # Should handle errors gracefully
            if response.status_code == 200:
                result = response.json()
                assert result.get("error_handled", False) == True
                assert result.get("recovery_applied", False) == True
                print(f"✅ Error Handling: {scenario['expected_behavior']} - Recovered successfully")
            else:
                # Should return appropriate error codes
                assert response.status_code in [400, 422, 500]
                print(f"✅ Error Handling: {scenario['expected_behavior']} - Appropriate error response ({response.status_code})")
    
    def test_integration_scalability(self, ensure_service_running):
        """Test integration engine scalability with multiple concurrent requests"""
        import concurrent.futures
        import threading
        
        def make_integration_request(request_id):
            """Make a single integration request"""
            start_time = time.time()
            response = requests.post(INTEGRATION_ENDPOINT, json={
                "type": "integration",
                "components": ["mathematical", "reasoning"],
                "task": f"Concurrent task {request_id}",
                "request_id": request_id
            }, timeout=15)
            execution_time = time.time() - start_time
            
            return {
                "request_id": request_id,
                "status_code": response.status_code,
                "execution_time": execution_time,
                "success": response.status_code == 200
            }
        
        # Test concurrent integration requests
        num_concurrent_requests = 5
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent_requests) as executor:
            futures = [executor.submit(make_integration_request, i) for i in range(num_concurrent_requests)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Validate scalability
        successful_requests = sum(1 for r in results if r["success"])
        avg_execution_time = sum(r["execution_time"] for r in results) / len(results)
        max_execution_time = max(r["execution_time"] for r in results)
        
        assert successful_requests >= num_concurrent_requests * 0.8  # 80%+ success rate
        assert avg_execution_time < 5.0  # Average under 5 seconds
        assert max_execution_time < 10.0  # Max under 10 seconds
        
        print(f"✅ Scalability Test: {successful_requests}/{num_concurrent_requests} successful ({successful_requests/num_concurrent_requests:.1%})")
        print(f"   Avg Time: {avg_execution_time:.3f}s, Max Time: {max_execution_time:.3f}s")
    
    def test_integration_memory_and_learning(self, ensure_service_running):
        """Test integration engine memory and learning capabilities"""
        learning_sequence = [
            {
                "task": "Solve basic optimization problem",
                "expected_learning": "pattern_recognition"
            },
            {
                "task": "Solve similar optimization with different parameters",
                "expected_learning": "pattern_application"
            },
            {
                "task": "Solve complex multi-objective optimization",
                "expected_learning": "pattern_extension"
            }
        ]
        
        performance_progression = []
        
        for i, step in enumerate(learning_sequence):
            response = requests.post(INTEGRATION_ENDPOINT, json={
                "type": "integration",
                "components": ["mathematical", "learning", "integration"],
                "task": step["task"],
                "learning_mode": "active",
                "sequence_id": f"learning_test_{i}"
            }, timeout=15)
            
            assert response.status_code == 200
            result = response.json()
            
            performance = result.get("performance_score", 0)
            learning_applied = result.get("learning_applied", False)
            
            performance_progression.append(performance)
            
            print(f"✅ Learning Step {i+1}: {step['expected_learning']} - Performance: {performance:.3f}, Learning: {learning_applied}")
        
        # Validate learning progression
        if len(performance_progression) >= 2:
            improvement = performance_progression[-1] - performance_progression[0]
            assert improvement >= 0  # Performance should improve or maintain
            print(f"🎯 Learning Progression: {improvement:.3f} improvement over {len(performance_progression)} steps")

if __name__ == "__main__":
    # Run tests with detailed output
    pytest.main([__file__, "-v", "-s", "--tb=short"])

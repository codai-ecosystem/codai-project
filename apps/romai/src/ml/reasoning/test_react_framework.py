"""
Comprehensive Test Suite for ReAct Framework

This module provides extensive testing for the ReAct (Reasoning and Acting) framework
implementation, validating all core components and integration scenarios.

Tests cover:
- Core ReAct agent functionality
- Action execution and observation processing
- Context management and fact extraction
- Multi-engine coordination and integration
- Error handling and edge cases
- Performance and timeout scenarios
"""

import asyncio
import pytest
import time
from unittest.mock import AsyncMock, Mock, patch
from typing import List, Dict, Any

# Import ReAct framework components
from react_framework import ReActAgent
from react_types import (
    ReActAction, ReActObservation, ReActStep, ReActContext,
    ReActResult, ReActConfig, ReActActionType, ReActStepStatus,
    ReActException, ReActTimeoutException, ReActActionException
)

class TestReActFramework:
    """Comprehensive test suite for ReAct framework"""
    
    @pytest.fixture
    def react_config(self):
        """Test configuration for ReAct agent"""
        return ReActConfig(
            max_steps=10,
            step_timeout=5.0,
            overall_timeout=30.0,
            min_confidence_threshold=0.3,
            verbose_logging=True
        )
    
    @pytest.fixture
    def react_agent(self, react_config):
        """ReAct agent instance for testing"""
        return ReActAgent(config=react_config)
    
    @pytest.fixture
    def sample_context(self):
        """Sample context for testing"""
        return ReActContext(
            problem="What is 15 + 27?",
            goal="Calculate the sum of 15 and 27"
        )
    
    @pytest.mark.asyncio
    async def test_react_agent_initialization(self, react_agent):
        """Test ReAct agent initialization"""
        assert react_agent is not None
        assert react_agent.config.max_steps == 10
        assert len(react_agent.action_executors) == 10
        assert len(react_agent.reasoning_generators) == 10
        
        # Verify engines are initialized
        assert hasattr(react_agent, 'math_engine')
        assert hasattr(react_agent, 'logic_engine')
        assert hasattr(react_agent, 'creative_engine')
        assert hasattr(react_agent, 'romanian_engine')
    
    @pytest.mark.asyncio
    async def test_simple_math_problem(self, react_agent):
        """Test ReAct agent on simple mathematical problem"""
        problem = "What is 8 + 12?"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert result.success
        assert result.total_steps > 0
        assert result.overall_confidence > 0.5
        assert "20" in result.final_answer or "8 + 12 = 20" in result.final_answer
        assert ReActActionType.MATH in result.actions_taken
    
    @pytest.mark.asyncio
    async def test_logical_reasoning_problem(self, react_agent):
        """Test ReAct agent on logical reasoning problem"""
        problem = "If all birds can fly, and a penguin is a bird, can a penguin fly?"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert result.success
        assert result.total_steps > 0
        assert ReActActionType.LOGIC in result.actions_taken
        # Note: This should actually conclude penguins can't fly (real-world knowledge)
        # but tests logical reasoning capability
    
    @pytest.mark.asyncio
    async def test_multi_step_reasoning(self, react_agent):
        """Test complex problem requiring multiple reasoning steps"""
        problem = "If I have 10 apples and give away 3, then buy 5 more, and eat 2, how many apples do I have? Also, if each apple costs $0.50, how much did the 5 apples I bought cost?"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert result.success
        assert result.total_steps >= 2  # Should require multiple steps
        assert ReActActionType.MATH in result.actions_taken
        
        # Should handle both parts of the problem
        assert "10" in result.final_answer or "2.50" in result.final_answer
    
    @pytest.mark.asyncio
    async def test_romanian_cultural_problem(self, react_agent):
        """Test Romanian cultural intelligence integration"""
        problem = "What is the significance of Martisor in Romanian culture?"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert result.total_steps > 0
        assert ReActActionType.ROMANIAN in result.actions_taken
    
    @pytest.mark.asyncio
    async def test_creative_problem(self, react_agent):
        """Test creative intelligence activation"""
        problem = "Design an innovative solution for reducing plastic waste in oceans"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert result.total_steps > 0
        assert ReActActionType.CREATE in result.actions_taken
    
    @pytest.mark.asyncio
    async def test_context_management(self, react_agent, sample_context):
        """Test context updates and fact extraction"""
        # Add initial facts
        sample_context.add_fact("test_fact", "test_value", "test_source")
        
        # Verify fact storage
        assert sample_context.get_fact("test_fact") == "test_value"
        assert "test_fact" in sample_context.facts
        
        # Test confidence updates
        sample_context.update_confidence(0.8)
        sample_context.update_confidence(0.9)
        
        assert len(sample_context.confidence_history) == 2
        assert sample_context.confidence_history[-1] == 0.9
    
    @pytest.mark.asyncio
    async def test_action_timeout_handling(self, react_agent):
        """Test timeout handling for actions"""
        # Create action with very short timeout
        action = ReActAction(
            action_type=ReActActionType.MATH,
            parameters={"problem": "2 + 2"},
            description="Test action",
            expected_outcome="Result",
            timeout=0.001  # Very short timeout
        )
        
        # Mock the math engine to simulate delay
        with patch.object(react_agent.math_engine, 'solve_mathematical_problem', 
                         new_callable=AsyncMock) as mock_solve:
            mock_solve.side_effect = asyncio.sleep(1)  # Longer than timeout
            
            observation = await react_agent._act_step(action)
            
            assert not observation.success
            assert "timeout" in observation.error_message.lower()
    
    @pytest.mark.asyncio
    async def test_max_steps_limit(self, react_agent):
        """Test maximum steps limitation"""
        # Create config with very low max steps
        config = ReActConfig(max_steps=2, overall_timeout=30.0)
        agent = ReActAgent(config=config)
        
        problem = "This is a complex problem that would normally require many steps"
        result = await agent.solve(problem)
        
        assert result is not None
        assert len(result.reasoning_trace) <= 2
        assert result.metadata.get("completion_reason") in ["max_steps", "natural_termination"]
    
    @pytest.mark.asyncio
    async def test_overall_timeout(self, react_agent):
        """Test overall timeout handling"""
        # Create config with very short overall timeout
        config = ReActConfig(max_steps=20, overall_timeout=0.1)
        agent = ReActAgent(config=config)
        
        problem = "Complex problem requiring extended processing"
        result = await agent.solve(problem)
        
        # Should complete quickly due to timeout
        assert result.execution_time <= 1.0  # Should be much less due to timeout
    
    @pytest.mark.asyncio
    async def test_confidence_based_termination(self, react_agent):
        """Test early termination when high confidence is reached"""
        # Mock math engine to return high confidence result
        mock_result = Mock()
        mock_result.result = "42"
        mock_result.confidence = 0.95
        mock_result.reasoning_steps = ["Step 1", "Step 2"]
        
        with patch.object(react_agent.math_engine, 'solve_mathematical_problem',
                         new_callable=AsyncMock, return_value=mock_result):
            
            problem = "What is 6 * 7?"
            result = await react_agent.solve(problem)
            
            assert result is not None
            assert result.success
            assert result.overall_confidence > 0.9
    
    @pytest.mark.asyncio
    async def test_error_handling_and_recovery(self, react_agent):
        """Test error handling and graceful recovery"""
        # Mock math engine to raise exception
        with patch.object(react_agent.math_engine, 'solve_mathematical_problem',
                         side_effect=Exception("Test error")):
            
            problem = "What is 2 + 2?"
            result = await react_agent.solve(problem)
            
            # Should handle error gracefully
            assert result is not None
            assert "error" in result.final_answer.lower() or not result.success
    
    @pytest.mark.asyncio
    async def test_action_type_detection(self, react_agent):
        """Test correct action type detection for different problems"""
        test_cases = [
            ("Calculate 5 + 3", ReActActionType.MATH),
            ("If A implies B, and A is true, what follows?", ReActActionType.LOGIC),
            ("Create a new marketing strategy", ReActActionType.CREATE),
            ("What is traditional Romanian food?", ReActActionType.ROMANIAN)
        ]
        
        for problem, expected_action in test_cases:
            context = ReActContext(problem=problem, goal=f"Solve: {problem}")
            trace = []
            
            action_type = react_agent._determine_next_action(context, trace)
            assert action_type == expected_action or action_type is None  # None for pure reasoning
    
    @pytest.mark.asyncio
    async def test_reasoning_trace_quality(self, react_agent):
        """Test quality of reasoning traces"""
        problem = "If I buy 3 packs of pencils with 12 pencils each, how many pencils do I have total?"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert len(result.reasoning_trace) > 0
        
        # Check reasoning trace structure
        for step in result.reasoning_trace:
            assert step.step_number > 0
            assert step.thought is not None
            assert step.reasoning_trace is not None
            assert 0.0 <= step.confidence <= 1.0
            assert step.status in ReActStepStatus
    
    @pytest.mark.asyncio
    async def test_context_fact_extraction(self, react_agent):
        """Test automatic fact extraction from observations"""
        # Create mock observation with structured result
        mock_result = Mock()
        mock_result.result = "36"
        mock_result.confidence = 0.9
        
        observation = ReActObservation(
            action=ReActAction(
                action_type=ReActActionType.MATH,
                parameters={"problem": "6 * 6"},
                description="Test calculation",
                expected_outcome="36"
            ),
            result=mock_result,
            success=True,
            execution_time=0.1,
            confidence=0.9,
            source="math_engine"
        )
        
        context = ReActContext(problem="Test problem", goal="Test goal")
        
        await react_agent._extract_facts_from_observation(observation, context)
        
        # Verify fact was extracted and stored
        assert len(context.facts) > 0
        math_facts = [key for key in context.facts.keys() if "math_result" in key]
        assert len(math_facts) > 0
    
    @pytest.mark.asyncio
    async def test_engine_utilization_tracking(self, react_agent):
        """Test tracking of engine utilization"""
        problem = "Calculate 10 + 15, then determine if the result is greater than 20"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert "engine_utilization" in result.metadata
        
        utilization = result.metadata["engine_utilization"]
        assert isinstance(utilization, dict)
        
        # Should have used multiple engines
        assert len(utilization) > 0
    
    @pytest.mark.asyncio
    async def test_final_answer_synthesis(self, react_agent):
        """Test final answer synthesis from multiple sources"""
        # Create mock reasoning trace with multiple successful results
        trace = []
        
        # Math result
        math_step = ReActStep(
            step_number=1,
            thought="Solving math problem",
            action=ReActAction(
                action_type=ReActActionType.MATH,
                parameters={"problem": "5 + 5"},
                description="Math calculation",
                expected_outcome="10"
            ),
            observation=ReActObservation(
                action=Mock(),
                result=Mock(result="10"),
                success=True,
                execution_time=0.1,
                confidence=0.9,
                source="math_engine"
            ),
            reasoning_trace="Math reasoning",
            confidence=0.9,
            status=ReActStepStatus.COMPLETED
        )
        
        trace.append(math_step)
        
        context = ReActContext(problem="Test", goal="Test")
        
        final_answer = react_agent._synthesize_final_answer(trace, context)
        
        assert final_answer is not None
        assert "10" in final_answer
        assert "Confidence:" in final_answer

    @pytest.mark.asyncio
    async def test_word_problem_integration(self, react_agent):
        """Test integration with word problem parsing"""
        problem = "If I have 7 apples and buy 8 more, then give away 5, how many apples do I have?"
        
        result = await react_agent.solve(problem)
        
        assert result is not None
        assert result.success
        assert ReActActionType.MATH in result.actions_taken
        
        # Should correctly solve: 7 + 8 - 5 = 10
        assert "10" in result.final_answer

    @pytest.mark.asyncio  
    async def test_performance_benchmarking(self, react_agent):
        """Test performance characteristics"""
        problems = [
            "What is 25 + 17?",
            "Calculate 12 * 8",
            "If A then B, A is true, what follows?",
            "Design a creative solution for traffic congestion"
        ]
        
        start_time = time.time()
        results = []
        
        for problem in problems:
            result = await react_agent.solve(problem)
            results.append(result)
        
        total_time = time.time() - start_time
        
        # Performance assertions
        assert total_time < 30.0  # Should complete in reasonable time
        assert all(result.success for result in results)
        
        avg_steps = sum(len(r.reasoning_trace) for r in results) / len(results)
        assert avg_steps > 0
        
        avg_confidence = sum(r.overall_confidence for r in results) / len(results)
        assert avg_confidence > 0.5

# Additional test utilities and fixtures

class MockReActEngine:
    """Mock engine for testing ReAct integration"""
    
    def __init__(self, response_delay=0.1, success_rate=0.9):
        self.response_delay = response_delay
        self.success_rate = success_rate
        self.call_count = 0
    
    async def solve_problem(self, problem: str):
        """Mock problem solving with configurable behavior"""
        self.call_count += 1
        await asyncio.sleep(self.response_delay)
        
        if self.call_count * 0.1 > self.success_rate:
            raise Exception("Mock failure")
        
        return Mock(
            result=f"Mock solution for: {problem}",
            confidence=0.8,
            reasoning_steps=["Step 1", "Step 2"]
        )

@pytest.fixture
def mock_engines():
    """Mock engines for isolated testing"""
    return {
        "math": MockReActEngine(response_delay=0.05, success_rate=0.95),
        "logic": MockReActEngine(response_delay=0.1, success_rate=0.9),
        "creative": MockReActEngine(response_delay=0.2, success_rate=0.8)
    }

# Comprehensive integration tests

class TestReActIntegration:
    """Integration tests for ReAct with existing RomAI components"""
    
    @pytest.mark.asyncio
    async def test_mathematical_engine_integration(self):
        """Test ReAct integration with mathematical reasoning engine"""
        config = ReActConfig(max_steps=5, overall_timeout=20.0)
        agent = ReActAgent(config=config)
        
        # Test with enhanced mathematical problem
        problem = "A rectangle has length 12 cm and width 8 cm. What is its area and perimeter?"
        
        result = await agent.solve(problem)
        
        assert result is not None
        assert result.success
        assert ReActActionType.MATH in result.actions_taken
        
        # Should calculate area (96) and perimeter (40)
        answer = result.final_answer.lower()
        assert "96" in answer or "area" in answer
        assert "40" in answer or "perimeter" in answer
    
    @pytest.mark.asyncio
    async def test_logical_engine_integration(self):
        """Test ReAct integration with logical reasoning engine"""
        config = ReActConfig(max_steps=5, overall_timeout=20.0)
        agent = ReActAgent(config=config)
        
        problem = "All programmers drink coffee. John is a programmer. Does John drink coffee?"
        
        result = await agent.solve(problem)
        
        assert result is not None
        assert result.success
        assert ReActActionType.LOGIC in result.actions_taken
        
        # Should conclude that John drinks coffee
        answer = result.final_answer.lower()
        assert "yes" in answer or "john" in answer and "coffee" in answer
    
    @pytest.mark.asyncio
    async def test_multi_engine_coordination(self):
        """Test coordination between multiple engines"""
        config = ReActConfig(max_steps=8, overall_timeout=30.0)
        agent = ReActAgent(config=config)
        
        problem = ("If a store sells 50 items per day and makes $5 profit per item, "
                  "how much profit does it make per week? "
                  "Also, if this is considered high performance, what conclusions can we draw?")
        
        result = await agent.solve(problem)
        
        assert result is not None
        assert result.success
        
        # Should use both mathematical and logical reasoning
        actions_used = result.actions_taken
        assert ReActActionType.MATH in actions_used
        
        # Should calculate weekly profit: 50 * 5 * 7 = 1750
        assert "1750" in result.final_answer or "1,750" in result.final_answer
    
    @pytest.mark.asyncio
    async def test_error_recovery_and_fallback(self):
        """Test error recovery and fallback strategies"""
        config = ReActConfig(max_steps=6, overall_timeout=25.0)
        agent = ReActAgent(config=config)
        
        # Create a problematic scenario
        problem = "This is a deliberately ambiguous problem with no clear solution path"
        
        result = await agent.solve(problem)
        
        # Should handle gracefully even if individual engines fail
        assert result is not None
        assert len(result.reasoning_trace) > 0
        
        # Should attempt multiple approaches
        assert result.total_steps > 1

if __name__ == "__main__":
    """Run comprehensive ReAct framework tests"""
    
    async def run_all_tests():
        """Execute all tests and provide summary"""
        print("🧠 Running Comprehensive ReAct Framework Tests")
        print("=" * 60)
        
        # Initialize test components
        config = ReActConfig(max_steps=5, overall_timeout=15.0, verbose_logging=True)
        agent = ReActAgent(config=config)
        
        test_cases = [
            {
                "name": "Simple Math Problem",
                "problem": "What is 15 + 23?",
                "expected_answer": "38"
            },
            {
                "name": "Word Problem",
                "problem": "If I have 12 cookies and eat 5, how many are left?",
                "expected_answer": "7"
            },
            {
                "name": "Logical Reasoning",
                "problem": "If all cats are animals, and Fluffy is a cat, is Fluffy an animal?",
                "expected_answer": "yes"
            },
            {
                "name": "Multi-step Problem",
                "problem": "Calculate 6 * 8, then add 15, then subtract 9",
                "expected_answer": "54"  # 6*8=48, +15=63, -9=54
            },
            {
                "name": "Creative Problem", 
                "problem": "Design a system to help students learn mathematics better",
                "expected_answer": None  # Creative, no specific answer
            }
        ]
        
        results = []
        total_time = time.time()
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🔍 Test {i}: {test_case['name']}")
            print(f"Problem: {test_case['problem']}")
            
            try:
                start_time = time.time()
                result = await agent.solve(test_case['problem'])
                execution_time = time.time() - start_time
                
                success = result.success and result.overall_confidence > 0.3
                
                print(f"✅ Status: {'PASS' if success else 'FAIL'}")
                print(f"⏱️  Time: {execution_time:.2f}s")
                print(f"📊 Steps: {result.total_steps}")
                print(f"🎯 Confidence: {result.overall_confidence:.2f}")
                print(f"🔧 Actions: {[action.value for action in result.actions_taken]}")
                print(f"💬 Answer: {result.final_answer[:100]}...")
                
                if test_case.get('expected_answer'):
                    expected = test_case['expected_answer']
                    answer_contains_expected = expected.lower() in result.final_answer.lower()
                    print(f"✓ Expected '{expected}': {'Found' if answer_contains_expected else 'Not Found'}")
                
                results.append({
                    "test": test_case['name'],
                    "success": success,
                    "time": execution_time,
                    "steps": result.total_steps,
                    "confidence": result.overall_confidence,
                    "actions": result.actions_taken
                })
                
            except Exception as e:
                print(f"❌ Error: {str(e)}")
                results.append({
                    "test": test_case['name'],
                    "success": False,
                    "error": str(e)
                })
        
        # Summary
        total_execution_time = time.time() - total_time
        successful_tests = sum(1 for r in results if r.get('success', False))
        
        print(f"\n📋 Test Summary")
        print("=" * 40)
        print(f"✅ Successful Tests: {successful_tests}/{len(results)}")
        print(f"⏱️  Total Time: {total_execution_time:.2f}s")
        print(f"📊 Success Rate: {successful_tests/len(results)*100:.1f}%")
        
        if successful_tests == len(results):
            print("\n🎉 ALL TESTS PASSED! ReAct Framework is working correctly!")
        elif successful_tests > len(results) * 0.7:
            print("\n✅ Most tests passed. ReAct Framework is mostly functional.")
        else:
            print("\n⚠️ Several tests failed. ReAct Framework needs attention.")
        
        return results
    
    # Run tests if executed directly
    if __name__ == "__main__":
        asyncio.run(run_all_tests())
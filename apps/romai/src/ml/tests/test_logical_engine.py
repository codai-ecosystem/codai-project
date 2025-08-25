"""
Unit Tests for RomAI Logical Reasoning Engine
Focused testing of logical reasoning capabilities
"""

import pytest
import asyncio
import sys
import os
from datetime import datetime

# Add RomAI paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from reasoning.autonomous_logical_engine import AutonomousLogicalEngine

class TestLogicalReasoningEngine:
    """Unit tests for logical reasoning engine"""
    
    @pytest.fixture
    def engine(self):
        """Create logical reasoning engine instance"""
        return AutonomousLogicalEngine()
    
    @pytest.mark.asyncio
    async def test_basic_syllogism_valid(self, engine):
        """Test valid syllogistic reasoning"""
        premise = "All roses are flowers. This is a rose."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Should conclude that "this is a flower"
        assert 'flower' in conclusion, f"Expected conclusion about flower, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_basic_syllogism_birds(self, engine):
        """Test syllogistic reasoning about birds"""
        premise = "All birds can fly. Eagles are birds."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Should conclude something about eagles flying
        assert 'fly' in conclusion or 'eagle' in conclusion, f"Expected conclusion about eagles/flying, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_conditional_reasoning_modus_ponens(self, engine):
        """Test modus ponens conditional reasoning"""
        premise = "If it rains, the ground is wet. It is raining."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Should conclude that the ground is wet
        assert 'wet' in conclusion or 'ground' in conclusion, f"Expected conclusion about wet ground, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_conditional_reasoning_modus_tollens(self, engine):
        """Test modus tollens conditional reasoning"""
        premise = "If it rains, the ground is wet. The ground is not wet."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Should conclude that it is not raining
        assert 'not' in conclusion and ('rain' in conclusion or 'raining' in conclusion), f"Expected conclusion about not raining, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_reasoning_chain(self, engine):
        """Test reasoning chain construction"""
        premise = "All mammals are animals. All dogs are mammals. Fido is a dog."
        result = await engine.reason(premise)
        
        # Check if reasoning chain is provided
        if hasattr(result, 'reasoning_chain'):
            assert len(result.reasoning_chain) > 0, "Expected non-empty reasoning chain"
            chain_text = ' '.join(result.reasoning_chain).lower()
            assert 'animal' in chain_text, "Reasoning chain should mention animals"
        
        # Check conclusion
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
            assert 'animal' in conclusion, f"Expected conclusion about Fido being an animal, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_negation_handling(self, engine):
        """Test handling of negated statements"""
        premise = "No cats are dogs. Fluffy is a cat."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Should conclude that Fluffy is not a dog
        assert 'not' in conclusion and 'dog' in conclusion, f"Expected conclusion that Fluffy is not a dog, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_logical_contradiction(self, engine):
        """Test detection of logical contradictions"""
        premise = "All A are B. No A are B. This is an A."
        result = await engine.reason(premise)
        
        # Should detect contradiction or indicate logical inconsistency
        result_text = str(result).lower()
        if hasattr(result, 'conclusion'):
            result_text += ' ' + result.conclusion.lower()
        if hasattr(result, 'error'):
            result_text += ' ' + str(result.error).lower()
        
        assert 'contradiction' in result_text or 'inconsistent' in result_text or 'invalid' in result_text, \
            f"Expected contradiction detection, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_disjunctive_syllogism(self, engine):
        """Test disjunctive syllogism (A or B, not A, therefore B)"""
        premise = "Either John is at home or John is at work. John is not at home."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Should conclude that John is at work
        assert 'work' in conclusion, f"Expected conclusion about John being at work, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_hypothetical_syllogism(self, engine):
        """Test hypothetical syllogism (If A then B, If B then C, therefore If A then C)"""
        premise = "If you study hard, you get good grades. If you get good grades, you get into college."
        result = await engine.reason(premise)
        
        # Should establish the transitive relationship
        result_text = str(result).lower()
        if hasattr(result, 'conclusion'):
            result_text += ' ' + result.conclusion.lower()
        
        assert ('study' in result_text and 'college' in result_text) or 'transitive' in result_text, \
            f"Expected transitive conclusion linking study to college, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_performance_complex_reasoning(self, engine):
        """Test performance with complex reasoning tasks"""
        start_time = datetime.now()
        
        complex_premises = [
            "All roses are flowers. This is a rose.",
            "If it rains, the ground is wet. It is raining.",
            "All mammals are animals. Dogs are mammals. Fido is a dog.",
            "Either the door is open or the door is closed. The door is not open.",
            "If you practice, you improve. If you improve, you succeed."
        ]
        
        for premise in complex_premises:
            result = await engine.reason(premise)
            assert result is not None, f"Failed to process premise: {premise}"
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Should complete 5 reasoning tasks in under 10 seconds
        assert duration < 10.0, f"Performance test failed: took {duration:.2f}s for 5 reasoning tasks"
    
    @pytest.mark.asyncio
    async def test_confidence_scoring(self, engine):
        """Test confidence scoring in reasoning results"""
        premise = "All roses are flowers. This is a rose."
        result = await engine.reason(premise)
        
        # Check if confidence score is provided
        if hasattr(result, 'confidence'):
            assert 0.0 <= result.confidence <= 1.0, f"Confidence score should be between 0 and 1, got: {result.confidence}"
            assert result.confidence > 0.7, f"Expected high confidence for simple valid reasoning, got: {result.confidence}"
    
    @pytest.mark.asyncio
    async def test_error_handling_invalid_logic(self, engine):
        """Test error handling for invalid logical input"""
        try:
            result = await engine.reason("This is not a logical statement with random words xyz")
            
            # Should handle gracefully
            result_text = str(result).lower()
            if hasattr(result, 'error'):
                assert result.error is not None or 'error' in result_text or 'invalid' in result_text
            
        except Exception as e:
            # It's acceptable to raise an exception for invalid input
            assert True
    
    @pytest.mark.asyncio
    async def test_reasoning_with_multiple_conclusions(self, engine):
        """Test reasoning that leads to multiple valid conclusions"""
        premise = "All roses are flowers. All flowers are plants. This is a rose."
        result = await engine.reason(premise)
        
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
        else:
            conclusion = str(result).lower()
        
        # Could conclude either "this is a flower" or "this is a plant" or both
        assert 'flower' in conclusion or 'plant' in conclusion, \
            f"Expected conclusion about flower or plant, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_reasoning_step_by_step(self, engine):
        """Test step-by-step reasoning breakdown"""
        premise = "All humans are mortal. Socrates is human."
        result = await engine.reason(premise)
        
        # Check for reasoning steps
        if hasattr(result, 'reasoning_chain') and result.reasoning_chain:
            chain = ' '.join(result.reasoning_chain).lower()
            assert 'human' in chain and 'mortal' in chain, \
                f"Reasoning chain should mention key concepts, got: {chain}"
        
        # Check final conclusion
        if hasattr(result, 'conclusion'):
            conclusion = result.conclusion.lower()
            assert 'socrates' in conclusion and 'mortal' in conclusion, \
                f"Expected conclusion about Socrates being mortal, got: {conclusion}"

if __name__ == "__main__":
    # Run specific tests
    pytest.main([__file__, "-v"])
"""
Integration Tests for RomAI Multi-Engine Coordination
Tests interaction between mathematical, logical, and Romanian engines
"""

import pytest
import asyncio
import sys
import os
from datetime import datetime

# Add RomAI paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from reasoning.autonomous_math_engine import AutonomousMathEngine
from reasoning.autonomous_logical_engine import AutonomousLogicalEngine  
from reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

class TestMultiEngineIntegration:
    """Integration tests for multi-engine coordination"""
    
    @pytest.fixture
    def engines(self):
        """Create all engine instances"""
        return {
            'math': AutonomousMathEngine(),
            'logic': AutonomousLogicalEngine(),
            'romanian': AutonomousRomanianEngine()
        }
    
    @pytest.mark.asyncio
    async def test_math_logic_coordination(self, engines):
        """Test coordination between mathematical and logical engines"""
        # Mathematical reasoning requiring logical steps
        premise = "If x > 5 and x < 10, then x could be 7. We know x = 8."
        
        # Use logical engine to understand the conditional
        logic_result = await engines['logic'].reason("If x > 5 and x < 10, then x could be 7.")
        
        # Use mathematical engine to verify the calculation
        math_result = await engines['math'].solve_mathematical_problem("Is 8 > 5 and 8 < 10?")
        
        # Both engines should provide consistent results
        assert logic_result is not None, "Logical engine should handle conditional reasoning"
        assert math_result is not None, "Mathematical engine should handle comparison"
        
        # Results should be logically consistent
        math_text = str(math_result).lower()
        assert 'true' in math_text or 'yes' in math_text or '8' in math_text, \
            f"Mathematical engine should confirm 8 satisfies conditions, got: {math_text}"
    
    @pytest.mark.asyncio
    async def test_romanian_math_integration(self, engines):
        """Test Romanian language processing with mathematical content"""
        romanian_math_text = "Calculează suma dintre douăsprezece și optsprezece."
        
        # Process Romanian text
        romanian_result = await engines['romanian'].process_romanian_text(romanian_math_text)
        
        # Extract mathematical problem (12 + 18)
        math_result = await engines['math'].solve_mathematical_problem("12 + 18")
        
        assert romanian_result is not None, "Romanian engine should process mathematical text"
        assert math_result is not None, "Mathematical engine should solve the problem"
        
        # Mathematical result should be correct
        if hasattr(math_result, 'result'):
            assert math_result.result == 30, f"Expected 12 + 18 = 30, got: {math_result.result}"
        else:
            math_text = str(math_result)
            assert '30' in math_text, f"Expected result 30 in output, got: {math_text}"
    
    @pytest.mark.asyncio
    async def test_romanian_logic_integration(self, engines):
        """Test Romanian logical reasoning"""
        romanian_logic_text = "Toate trandafirii sunt flori. Aceasta este un trandafir."
        
        # Process Romanian logical statement
        romanian_result = await engines['romanian'].process_romanian_text(romanian_logic_text)
        
        # Apply logical reasoning to English equivalent
        logic_result = await engines['logic'].reason("All roses are flowers. This is a rose.")
        
        assert romanian_result is not None, "Romanian engine should process logical text"
        assert logic_result is not None, "Logical engine should handle syllogism"
        
        # Logical conclusion should be valid
        if hasattr(logic_result, 'conclusion'):
            conclusion = logic_result.conclusion.lower()
            assert 'flower' in conclusion, f"Expected conclusion about flower, got: {conclusion}"
    
    @pytest.mark.asyncio
    async def test_cultural_mathematical_context(self, engines):
        """Test mathematical problems in Romanian cultural context"""
        cultural_math = "Dacă un miel costă 200 de lei și cumpărăm 3 miei pentru Paște, cât plătim în total?"
        
        # Process cultural context
        cultural_result = await engines['romanian'].analyze_cultural_context(cultural_math)
        
        # Solve mathematical problem
        math_result = await engines['math'].solve_mathematical_problem("200 × 3")
        
        assert cultural_result is not None, "Should recognize cultural context (Paște/Easter)"
        assert math_result is not None, "Should solve multiplication problem"
        
        # Mathematical result should be correct
        if hasattr(math_result, 'result'):
            assert math_result.result == 600, f"Expected 200 × 3 = 600, got: {math_result.result}"
        else:
            math_text = str(math_result)
            assert '600' in math_text, f"Expected result 600 in output, got: {math_text}"
        
        # Cultural analysis should recognize Easter context
        cultural_text = str(cultural_result).lower()
        assert 'paște' in cultural_text or 'easter' in cultural_text or 'cultural' in cultural_text, \
            f"Expected Easter/cultural recognition, got: {cultural_text}"
    
    @pytest.mark.asyncio
    async def test_sequential_engine_pipeline(self, engines):
        """Test sequential processing through multiple engines"""
        # Start with Romanian text containing logical and mathematical elements
        input_text = "Dacă avem 10 mere și mâncăm 3, câte mere rămân? Logic dictează că 10 - 3 = 7."
        
        # Step 1: Romanian processing
        romanian_result = await engines['romanian'].process_romanian_text(input_text)
        
        # Step 2: Logical reasoning
        logic_result = await engines['logic'].reason("If we have 10 and remove 3, we get 7.")
        
        # Step 3: Mathematical verification
        math_result = await engines['math'].solve_mathematical_problem("10 - 3")
        
        # All steps should complete successfully
        assert romanian_result is not None, "Romanian processing should complete"
        assert logic_result is not None, "Logical reasoning should complete"
        assert math_result is not None, "Mathematical calculation should complete"
        
        # Mathematical result should be correct
        if hasattr(math_result, 'result'):
            assert math_result.result == 7, f"Expected 10 - 3 = 7, got: {math_result.result}"
        else:
            math_text = str(math_result)
            assert '7' in math_text, f"Expected result 7 in output, got: {math_text}"
    
    @pytest.mark.asyncio
    async def test_cross_engine_error_handling(self, engines):
        """Test error handling across multiple engines"""
        invalid_inputs = [
            ("math", "This is not a mathematical problem xyz"),
            ("logic", "Random words without logical structure abc"),
            ("romanian", "这不是罗马尼亚语文本")  # Chinese text
        ]
        
        for engine_name, invalid_input in invalid_inputs:
            try:
                if engine_name == "math":
                    result = await engines['math'].solve_mathematical_problem(invalid_input)
                elif engine_name == "logic":
                    result = await engines['logic'].reason(invalid_input)
                elif engine_name == "romanian":
                    result = await engines['romanian'].process_romanian_text(invalid_input)
                
                # Should either return error indication or handle gracefully
                result_text = str(result).lower()
                if not ('error' in result_text or 'invalid' in result_text or 'cannot' in result_text):
                    # If no explicit error, result should still be reasonable
                    assert result is not None, f"Engine {engine_name} should handle invalid input gracefully"
                    
            except Exception as e:
                # It's acceptable to raise exceptions for invalid inputs
                error_msg = str(e).lower()
                assert len(error_msg) > 0, f"Exception should have meaningful message for {engine_name}"
    
    @pytest.mark.asyncio
    async def test_performance_multi_engine_coordination(self, engines):
        """Test performance of coordinated multi-engine operations"""
        start_time = datetime.now()
        
        # Execute multiple operations across engines
        tasks = [
            engines['math'].solve_mathematical_problem("√144"),
            engines['logic'].reason("All birds fly. Eagles are birds."),
            engines['romanian'].process_romanian_text("Bună ziua!"),
            engines['math'].solve_mathematical_problem("25 + 75"),
            engines['romanian'].analyze_cultural_context("Mărțișor este o tradiție românească.")
        ]
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # All tasks should complete successfully
        successful_results = [r for r in results if not isinstance(r, Exception)]
        assert len(successful_results) >= 4, f"At least 4/5 multi-engine tasks should succeed, got {len(successful_results)}"
        
        # Should complete in reasonable time
        assert duration < 15.0, f"Multi-engine coordination took too long: {duration:.2f}s"
    
    @pytest.mark.asyncio
    async def test_contextual_engine_selection(self, engines):
        """Test appropriate engine selection based on content context"""
        test_cases = [
            ("Calculează 15 × 4", "math"),  # Mathematical content
            ("Toate animalele sunt vii. Pisica este animal.", "logic"),  # Logical content  
            ("Poeziile lui Eminescu sunt frumoase.", "romanian"),  # Cultural content
        ]
        
        for text, expected_engine in test_cases:
            # Simulate contextual engine selection logic
            if any(word in text.lower() for word in ['calculează', '×', '+', '-', '=']):
                selected_engine = 'math'
            elif any(word in text.lower() for word in ['toate', 'dacă', 'logic']):
                selected_engine = 'logic'
            else:
                selected_engine = 'romanian'
            
            # Verify correct engine selection
            assert selected_engine == expected_engine, \
                f"Expected {expected_engine} engine for '{text}', but selected {selected_engine}"
            
            # Execute with selected engine
            if selected_engine == 'math':
                result = await engines['math'].solve_mathematical_problem(text)
            elif selected_engine == 'logic':
                result = await engines['logic'].reason(text)
            else:
                result = await engines['romanian'].process_romanian_text(text)
            
            assert result is not None, f"Selected engine should process content successfully: {text}"
    
    @pytest.mark.asyncio
    async def test_complex_multi_domain_problem(self, engines):
        """Test complex problem requiring multiple domain expertise"""
        # Complex scenario: Romanian mathematical word problem with logical reasoning
        complex_problem = """
        În România, un fermier are 100 de oi. Dacă vinde 1/4 din oi la piață și 
        apoi cumpără încă 20 de oi, câte oi are în total? Logic ne spune că 
        trebuie să calculăm: 100 - 25 + 20.
        """
        
        # Step 1: Romanian language understanding
        romanian_result = await engines['romanian'].process_romanian_text(complex_problem)
        
        # Step 2: Logical reasoning extraction
        logic_result = await engines['logic'].reason(
            "If we start with 100, subtract 1/4 of 100, then add 20, what's the result?"
        )
        
        # Step 3: Mathematical calculation
        math_steps = [
            await engines['math'].solve_mathematical_problem("100 ÷ 4"),  # 1/4 of 100
            await engines['math'].solve_mathematical_problem("100 - 25"),  # After selling
            await engines['math'].solve_mathematical_problem("75 + 20")   # After buying
        ]
        
        # All steps should complete
        assert romanian_result is not None, "Romanian processing should work"
        assert logic_result is not None, "Logical reasoning should work"
        assert all(r is not None for r in math_steps), "All math steps should work"
        
        # Final mathematical result should be correct (95 sheep)
        final_result = math_steps[2]  # 75 + 20
        if hasattr(final_result, 'result'):
            assert final_result.result == 95, f"Expected final result 95, got: {final_result.result}"
        else:
            result_text = str(final_result)
            assert '95' in result_text, f"Expected result 95 in output, got: {result_text}"
    
    @pytest.mark.asyncio
    async def test_engine_result_consistency(self, engines):
        """Test consistency of results across different engines"""
        # Test equivalent problems in different domains
        test_pairs = [
            # Mathematical equivalence
            ("2 + 2", "What is two plus two?"),
            # Logical equivalence  
            ("All A are B. X is A.", "If all A are B and X is A, what can we conclude about X?"),
        ]
        
        for problem1, problem2 in test_pairs:
            result1 = await engines['math'].solve_mathematical_problem(problem1)
            result2 = await engines['logic'].reason(problem2) if 'A are B' in problem2 else await engines['math'].solve_mathematical_problem(problem2)
            
            # Both results should be consistent
            assert result1 is not None and result2 is not None, \
                f"Both engines should handle equivalent problems: {problem1} vs {problem2}"
            
            # For mathematical problems, results should be numerically equivalent
            if '2 + 2' in problem1:
                result1_text = str(result1).lower()
                result2_text = str(result2).lower()
                assert '4' in result1_text or 'four' in result1_text, f"First result should contain 4: {result1_text}"
                assert '4' in result2_text or 'four' in result2_text, f"Second result should contain 4: {result2_text}"

if __name__ == "__main__":
    # Run specific tests
    pytest.main([__file__, "-v"])
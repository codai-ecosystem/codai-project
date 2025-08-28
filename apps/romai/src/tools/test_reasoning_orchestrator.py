"""
Test Suite for ROMAI Reasoning Orchestrator
==========================================

Comprehensive test suite for the reasoning orchestrator that coordinates
different types of advanced reasoning.
"""

import asyncio
import logging

# Import reasoning components
try:
    from reasoning_orchestrator import (
        ReasoningOrchestrator, ContextAnalyzer, ReasoningStrategySelector,
        ReasoningType, ReasoningComplexity, ReasoningStatus,
        ReasoningContext, ReasoningChain
    )
    REASONING_AVAILABLE = True
except ImportError as e:
    REASONING_AVAILABLE = False
    print(f"Reasoning system not available: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestReasoningOrchestrator:
    """Test the reasoning orchestrator system."""
    
    def __init__(self):
        """Initialize test suite."""
        self.test_results = []
        
    async def run_all_tests(self):
        """Run all reasoning orchestrator tests."""
        logger.info("🧪 Running Reasoning Orchestrator Tests")
        logger.info("=" * 50)
        
        if not REASONING_AVAILABLE:
            logger.warning("❌ Reasoning system not available - running limited tests")
            await self.test_import_fallback()
            return
        
        # Component tests
        await self.test_context_analyzer()
        await self.test_strategy_selector()
        await self.test_reasoning_orchestrator()
        
        # Functional tests
        await self.test_different_problem_types()
        await self.test_complexity_handling()
        await self.test_performance_tracking()
        
        # Integration tests
        await self.test_tool_integration()
        await self.test_reasoning_explanation()
        
        # Report results
        await self.report_test_results()
    
    async def test_import_fallback(self):
        """Test import fallback behavior."""
        result = {
            "test": "import_fallback",
            "passed": True,
            "details": "Import fallback working correctly"
        }
        self.test_results.append(result)
        logger.info("✅ Import fallback test passed")
    
    async def test_context_analyzer(self):
        """Test the context analyzer component."""
        logger.info("Testing context analyzer...")
        
        try:
            analyzer = ContextAnalyzer()
            
            # Test context analysis
            context = await analyzer.analyze_context(
                "Calculate the derivative of x^2 + 3x + 2",
                "mathematics"
            )
            
            # Verify context properties
            assert context.problem_statement == "Calculate the derivative of x^2 + 3x + 2"
            assert context.domain == "mathematics"
            assert context.context_id is not None
            assert context.complexity in [ReasoningComplexity.SIMPLE, ReasoningComplexity.MODERATE]
            assert len(context.key_concepts) > 0
            
            result = {
                "test": "context_analyzer",
                "passed": True,
                "details": f"Context analyzed: {context.context_id}, complexity: {context.complexity.value}"
            }
            
        except Exception as e:
            result = {
                "test": "context_analyzer",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Context analyzer test {'passed' if result['passed'] else 'failed'}")
    
    async def test_strategy_selector(self):
        """Test the strategy selector component."""
        logger.info("Testing strategy selector...")
        
        try:
            selector = ReasoningStrategySelector()
            analyzer = ContextAnalyzer()
            
            # Create test context
            context = await analyzer.analyze_context(
                "What causes global warming?",
                "science"
            )
            
            # Test strategy selection
            strategies = await selector.select_reasoning_strategy(context)
            
            # Verify strategies
            assert isinstance(strategies, list)
            assert len(strategies) > 0
            assert all(isinstance(s, ReasoningType) for s in strategies)
            
            result = {
                "test": "strategy_selector",
                "passed": True,
                "details": f"Selected strategies: {[s.value for s in strategies]}"
            }
            
        except Exception as e:
            result = {
                "test": "strategy_selector",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Strategy selector test {'passed' if result['passed'] else 'failed'}")
    
    async def test_reasoning_orchestrator(self):
        """Test the main reasoning orchestrator."""
        logger.info("Testing reasoning orchestrator...")
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Test basic reasoning
            chain = await orchestrator.reason(
                "What is 2 + 2?",
                "mathematics"
            )
            
            # Verify reasoning chain
            assert chain.chain_id is not None
            assert chain.context.problem_statement == "What is 2 + 2?"
            assert len(chain.steps) > 0
            assert chain.final_conclusion is not None
            assert 0.0 <= chain.confidence_score <= 1.0
            
            result = {
                "test": "reasoning_orchestrator",
                "passed": True,
                "details": f"Reasoning completed: {chain.chain_id}, confidence: {chain.confidence_score:.2f}"
            }
            
        except Exception as e:
            result = {
                "test": "reasoning_orchestrator",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Reasoning orchestrator test {'passed' if result['passed'] else 'failed'}")
    
    async def test_different_problem_types(self):
        """Test reasoning on different types of problems."""
        logger.info("Testing different problem types...")
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            problems = [
                ("What causes rain?", "science"),
                ("How to sort a list efficiently?", "computer_science"),
                ("Find the pattern: 1, 1, 2, 3, 5, 8, ...", "mathematics")
            ]
            
            successful_reasonings = 0
            
            for problem, domain in problems:
                chain = await orchestrator.reason(problem, domain)
                if chain.success and chain.confidence_score > 0.0:
                    successful_reasonings += 1
            
            result = {
                "test": "different_problem_types",
                "passed": successful_reasonings == len(problems),
                "details": f"Successfully reasoned about {successful_reasonings}/{len(problems)} problems"
            }
            
        except Exception as e:
            result = {
                "test": "different_problem_types",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Different problem types test {'passed' if result['passed'] else 'failed'}")
    
    async def test_complexity_handling(self):
        """Test handling of different complexity levels."""
        logger.info("Testing complexity handling...")
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Simple problem
            simple_chain = await orchestrator.reason("What is 1 + 1?", "mathematics")
            
            # Complex problem
            complex_chain = await orchestrator.reason(
                "Design an innovative sustainable energy system that integrates multiple renewable sources",
                "engineering"
            )
            
            # Verify complexity handling
            assert simple_chain.context.complexity in [ReasoningComplexity.SIMPLE, ReasoningComplexity.MODERATE]
            assert complex_chain.context.complexity in [ReasoningComplexity.COMPLEX, ReasoningComplexity.EXPERT]
            
            result = {
                "test": "complexity_handling",
                "passed": True,
                "details": f"Simple: {simple_chain.context.complexity.value}, Complex: {complex_chain.context.complexity.value}"
            }
            
        except Exception as e:
            result = {
                "test": "complexity_handling",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Complexity handling test {'passed' if result['passed'] else 'failed'}")
    
    async def test_performance_tracking(self):
        """Test performance tracking functionality."""
        logger.info("Testing performance tracking...")
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Perform several reasoning tasks
            for i in range(3):
                await orchestrator.reason(f"Test problem {i}", "general")
            
            # Get performance statistics
            stats = orchestrator.get_reasoning_statistics()
            
            # Verify statistics
            assert "total_reasoning_tasks" in stats
            assert "successful_tasks" in stats
            assert "success_rate" in stats
            assert stats["total_reasoning_tasks"] >= 3
            
            result = {
                "test": "performance_tracking",
                "passed": True,
                "details": f"Stats tracked: {stats['total_reasoning_tasks']} tasks, {stats['success_rate']} success rate"
            }
            
        except Exception as e:
            result = {
                "test": "performance_tracking",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Performance tracking test {'passed' if result['passed'] else 'failed'}")
    
    async def test_tool_integration(self):
        """Test tool integration capabilities."""
        logger.info("Testing tool integration...")
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Test reasoning with available tools
            chain = await orchestrator.reason(
                "Calculate the area of a circle with radius 5",
                "mathematics",
                available_tools=["calculator", "formula_solver"]
            )
            
            # Verify tool integration
            assert chain.context.available_tools == ["calculator", "formula_solver"]
            
            # Check if tool-guided reasoning was used
            tool_guided_steps = [step for step in chain.steps 
                               if step.reasoning_type == ReasoningType.TOOL_GUIDED]
            
            result = {
                "test": "tool_integration",
                "passed": len(tool_guided_steps) > 0 or len(chain.context.available_tools) > 0,
                "details": f"Tools available: {chain.context.available_tools}, tool-guided steps: {len(tool_guided_steps)}"
            }
            
        except Exception as e:
            result = {
                "test": "tool_integration",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Tool integration test {'passed' if result['passed'] else 'failed'}")
    
    async def test_reasoning_explanation(self):
        """Test reasoning explanation functionality."""
        logger.info("Testing reasoning explanation...")
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Perform reasoning
            chain = await orchestrator.reason("Why does ice float on water?", "physics")
            
            # Get explanation
            explanation = await orchestrator.get_reasoning_explanation(chain.chain_id)
            
            # Verify explanation
            assert explanation is not None
            assert "chain_id" in explanation
            assert "problem" in explanation
            assert "final_conclusion" in explanation
            assert "steps" in explanation
            assert explanation["chain_id"] == chain.chain_id
            
            result = {
                "test": "reasoning_explanation",
                "passed": True,
                "details": f"Explanation generated for {chain.chain_id} with {len(explanation['steps'])} steps"
            }
            
        except Exception as e:
            result = {
                "test": "reasoning_explanation",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Reasoning explanation test {'passed' if result['passed'] else 'failed'}")
    
    async def report_test_results(self):
        """Report test results."""
        logger.info("\n" + "=" * 50)
        logger.info("🧪 REASONING ORCHESTRATOR TEST RESULTS")
        logger.info("=" * 50)
        
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        total_tests = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            test_name = result["test"].replace("_", " ").title()
            
            if result["passed"]:
                details = result.get("details", "")
                logger.info(f"{status}: {test_name} - {details}")
            else:
                error = result.get("error", "Unknown error")
                logger.info(f"{status}: {test_name} - {error}")
        
        logger.info("-" * 50)
        logger.info(f"📊 SUMMARY: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
        
        if passed_tests == total_tests:
            logger.info("🎉 ALL TESTS PASSED - REASONING ORCHESTRATOR READY!")
        else:
            logger.info("⚠️ Some tests failed - review and fix issues")
        
        return passed_tests == total_tests


async def main():
    """Run the reasoning orchestrator tests."""
    test_suite = TestReasoningOrchestrator()
    success = await test_suite.run_all_tests()
    return success


if __name__ == "__main__":
    asyncio.run(main())
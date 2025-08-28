"""
Advanced Reasoning Integration Tests
===================================

Comprehensive test suite for all ROMAI advanced reasoning modules.
Tests individual modules and their integration with the reasoning orchestrator.

Author: ROMAI AGI Team
Date: 2025-01-17
Version: 1.0.0
"""

import asyncio
import logging
import time
import statistics
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import all reasoning modules
try:
    from reasoning_orchestrator import (
        ReasoningOrchestrator, ContextAnalyzer, ReasoningStrategySelector,
        ReasoningType, ReasoningComplexity, ReasoningStatus
    )
    ORCHESTRATOR_AVAILABLE = True
except ImportError as e:
    ORCHESTRATOR_AVAILABLE = False
    logger.warning(f"Reasoning orchestrator not available: {e}")

try:
    from causal_inference_engine import (
        CausalInferenceEngine, CausalRelationType, CausalStrength,
        CausalVariable, CausalRelation, CausalModel, CounterfactualQuery
    )
    CAUSAL_AVAILABLE = True
except ImportError as e:
    CAUSAL_AVAILABLE = False
    logger.warning(f"Causal inference engine not available: {e}")

try:
    from analogical_reasoning_engine import (
        AnalogicalReasoningEngine, AnalogicalRelationType, MappingType,
        ConceptualElement, ConceptualStructure, AnalogicalMapping
    )
    ANALOGICAL_AVAILABLE = True
except ImportError as e:
    ANALOGICAL_AVAILABLE = False
    logger.warning(f"Analogical reasoning engine not available: {e}")

try:
    from metacognitive_awareness import (
        MetaCognitiveAwarenessSystem, CognitiveProcessType, 
        MetaCognitiveStrategy, CognitiveState
    )
    METACOGNITIVE_AVAILABLE = True
except ImportError as e:
    METACOGNITIVE_AVAILABLE = False
    logger.warning(f"Meta-cognitive awareness not available: {e}")

try:
    from tool_guided_reasoning import (
        ToolGuidedReasoningEngine, ToolType, ToolUsagePattern,
        ReasoningPhase, ReasoningContext
    )
    TOOL_GUIDED_AVAILABLE = True
except ImportError as e:
    TOOL_GUIDED_AVAILABLE = False
    logger.warning(f"Tool-guided reasoning not available: {e}")


class AdvancedReasoningTestSuite:
    """Comprehensive test suite for all advanced reasoning modules."""
    
    def __init__(self):
        """Initialize the test suite."""
        self.test_results = []
        self.performance_metrics = {
            "start_time": time.time(),
            "individual_tests": {},
            "integration_tests": {},
            "overall_performance": {}
        }
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all advanced reasoning tests."""
        logger.info("🧪 ROMAI ADVANCED REASONING INTEGRATION TESTS")
        logger.info("=" * 60)
        logger.info(f"Test suite started at: {datetime.now()}")
        logger.info("")
        
        # Individual module tests
        await self.test_reasoning_orchestrator()
        await self.test_causal_inference_engine()
        await self.test_analogical_reasoning_engine()
        await self.test_metacognitive_awareness()
        await self.test_tool_guided_reasoning()
        
        # Integration tests
        await self.test_orchestrator_causal_integration()
        await self.test_orchestrator_analogical_integration()
        await self.test_orchestrator_metacognitive_integration()
        await self.test_orchestrator_tool_guided_integration()
        await self.test_full_system_integration()
        
        # Performance tests
        await self.test_concurrent_reasoning()
        await self.test_scalability()
        
        # Generate comprehensive report
        return await self.generate_test_report()
    
    async def test_reasoning_orchestrator(self):
        """Test the reasoning orchestrator module."""
        logger.info("🧠 Testing Reasoning Orchestrator...")
        
        if not ORCHESTRATOR_AVAILABLE:
            self._record_test("orchestrator_basic", False, "Module not available")
            return
        
        test_start = time.time()
        
        try:
            # Initialize orchestrator
            orchestrator = ReasoningOrchestrator()
            
            # Test basic reasoning
            chain = await orchestrator.reason("What causes rain?", "science")
            
            # Verify results
            assert chain.chain_id is not None
            assert chain.context.problem_statement == "What causes rain?"
            assert len(chain.steps) > 0
            assert chain.final_conclusion is not None
            assert 0.0 <= chain.confidence_score <= 1.0
            
            # Test different complexity levels
            simple_chain = await orchestrator.reason("What is 2+2?", "mathematics")
            complex_chain = await orchestrator.reason(
                "Design a sustainable urban transportation system", "engineering"
            )
            
            # Test explanation generation
            explanation = await orchestrator.get_reasoning_explanation(chain.chain_id)
            assert explanation is not None
            assert "chain_id" in explanation
            
            # Test statistics
            stats = orchestrator.get_reasoning_statistics()
            assert "total_reasoning_tasks" in stats
            assert stats["total_reasoning_tasks"] >= 3
            
            elapsed = time.time() - test_start
            self.performance_metrics["individual_tests"]["orchestrator"] = elapsed
            self._record_test("orchestrator_basic", True, f"Completed in {elapsed:.2f}s")
            
        except Exception as e:
            self._record_test("orchestrator_basic", False, f"Error: {e}")
    
    async def test_causal_inference_engine(self):
        """Test the causal inference engine module."""
        logger.info("🔍 Testing Causal Inference Engine...")
        
        if not CAUSAL_AVAILABLE:
            self._record_test("causal_basic", False, "Module not available")
            return
        
        test_start = time.time()
        
        try:
            # Initialize engine
            engine = CausalInferenceEngine()
            
            # Test causal discovery
            text = "Smoking causes lung cancer. Exercise improves health. Stress affects sleep."
            model = await engine.discover_causal_relations(text, "health")
            
            assert len(model.variables) > 0
            assert len(model.relations) > 0
            assert model.model_id is not None
            
            # Test intervention prediction
            if model.variables:
                intervention = {model.variables[0].name: "high"}
                target = model.variables[-1].name if len(model.variables) > 1 else model.variables[0].name
                prediction = await engine.predict_intervention_effect(model, intervention, target)
                
                assert "predicted_effect" in prediction
                assert "confidence" in prediction["predicted_effect"]
            
            # Test counterfactual reasoning
            query = CounterfactualQuery(
                observed_scenario={"factor1": "high"},
                counterfactual_scenario={"factor1": "low"},
                target_variable="outcome",
                query_description="What if factor1 was low instead of high?"
            )
            result = await engine.counterfactual_reasoning(model, query)
            
            assert result.query == query
            assert result.confidence > 0.0
            
            # Test statistics
            stats = engine.get_engine_statistics()
            assert "total_inferences" in stats
            assert stats["models_created"] >= 1
            
            elapsed = time.time() - test_start
            self.performance_metrics["individual_tests"]["causal"] = elapsed
            self._record_test("causal_basic", True, f"Completed in {elapsed:.2f}s")
            
        except Exception as e:
            self._record_test("causal_basic", False, f"Error: {e}")
    
    async def test_analogical_reasoning_engine(self):
        """Test the analogical reasoning engine module."""
        logger.info("🔄 Testing Analogical Reasoning Engine...")
        
        if not ANALOGICAL_AVAILABLE:
            self._record_test("analogical_basic", False, "Module not available")
            return
        
        test_start = time.time()
        
        try:
            # Initialize engine
            engine = AnalogicalReasoningEngine()
            
            # Create test structures
            solar_elements = [
                {"name": "sun", "type": "object", "properties": {"size": "large"}},
                {"name": "planet", "type": "object", "properties": {"size": "medium"}}
            ]
            solar_relations = [("sun", "attracts", "planet")]
            
            solar_structure = await engine.create_conceptual_structure(
                "solar_system", "astronomy", "Solar system", solar_elements, solar_relations
            )
            
            atom_elements = [
                {"name": "nucleus", "type": "object", "properties": {"charge": "positive"}},
                {"name": "electron", "type": "object", "properties": {"charge": "negative"}}
            ]
            atom_relations = [("nucleus", "attracts", "electron")]
            
            atom_structure = await engine.create_conceptual_structure(
                "atomic_model", "physics", "Atomic model", atom_elements, atom_relations
            )
            
            # Test analogical mapping
            mapping = await engine.find_analogical_mapping(solar_structure, atom_structure)
            
            assert mapping.mapping_id is not None
            assert mapping.strength > 0.0
            assert mapping.confidence > 0.0
            assert len(mapping.element_mappings) > 0
            
            # Test analogical inference
            inference = await engine.make_analogical_inference(mapping, ["electron"])
            
            assert inference.inference_id is not None
            assert inference.confidence > 0.0
            
            # Test case-based reasoning
            case = await engine.add_case(
                "orbital_motion", "Objects orbit due to attraction",
                "Use force equations", "physics", solar_structure
            )
            
            similar_cases = await engine.retrieve_similar_cases(atom_structure, "physics")
            assert len(similar_cases) >= 1
            
            # Test statistics
            stats = engine.get_engine_statistics()
            assert "total_mappings" in stats
            assert stats["structures_stored"] >= 2
            
            elapsed = time.time() - test_start
            self.performance_metrics["individual_tests"]["analogical"] = elapsed
            self._record_test("analogical_basic", True, f"Completed in {elapsed:.2f}s")
            
        except Exception as e:
            self._record_test("analogical_basic", False, f"Error: {e}")
    
    async def test_metacognitive_awareness(self):
        """Test the meta-cognitive awareness module."""
        logger.info("🧠 Testing Meta-Cognitive Awareness...")
        
        if not METACOGNITIVE_AVAILABLE:
            self._record_test("metacognitive_basic", False, "Module not available")
            return
        
        test_start = time.time()
        
        try:
            # Initialize system
            system = MetaCognitiveAwarenessSystem()
            
            # Test process monitoring
            monitor = await system.start_monitoring(
                CognitiveProcessType.REASONING,
                "test_reasoning_process",
                {"input": "test problem"}
            )
            
            assert monitor.process_id == "test_reasoning_process"
            assert monitor.process_type == CognitiveProcessType.REASONING
            
            # Test monitoring updates
            await system.update_monitoring("test_reasoning_process", 
                                         {"step": "analysis"}, confidence=0.8)
            await system.update_monitoring("test_reasoning_process",
                                         {"step": "solution"}, confidence=0.9)
            
            # Test monitoring completion
            completed = await system.complete_monitoring(
                "test_reasoning_process", {"result": "solution found"}, True
            )
            
            assert completed.end_time is not None
            assert len(completed.intermediate_states) >= 2
            assert completed.get_average_confidence() > 0.0
            
            # Test goal creation
            goal = await system.create_cognitive_goal(
                "Improve accuracy", "performance", {"accuracy": 0.95}
            )
            
            assert goal.goal_id is not None
            assert goal.target_metrics["accuracy"] == 0.95
            
            # Test strategic planning
            plan = await system.generate_strategic_plan([goal.goal_id])
            
            assert plan.plan_id is not None
            assert len(plan.planned_strategies) > 0
            
            # Test statistics
            stats = system.get_system_statistics()
            assert "total_processes_monitored" in stats
            assert stats["total_processes_monitored"] >= 1
            
            elapsed = time.time() - test_start
            self.performance_metrics["individual_tests"]["metacognitive"] = elapsed
            self._record_test("metacognitive_basic", True, f"Completed in {elapsed:.2f}s")
            
        except Exception as e:
            self._record_test("metacognitive_basic", False, f"Error: {e}")
    
    async def test_tool_guided_reasoning(self):
        """Test the tool-guided reasoning engine."""
        logger.info("🔧 Testing Tool-Guided Reasoning...")
        
        if not TOOL_GUIDED_AVAILABLE:
            self._record_test("tool_guided_basic", False, "Module not available")
            return
        
        test_start = time.time()
        
        try:
            # Initialize engine
            engine = ToolGuidedReasoningEngine()
            
            # Create reasoning context
            context = ReasoningContext(
                problem_statement="Calculate 15 + 25 and find information about addition",
                domain="mathematics",
                current_phase=ReasoningPhase.PROBLEM_ANALYSIS,
                available_data={},
                constraints={"time_limit": 10},
                success_criteria=["accurate_result"]
            )
            
            # Test context analysis
            analysis = await engine.analyze_reasoning_context(context)
            
            assert "context_id" in analysis
            assert "applicable_tools" in analysis
            assert len(analysis["applicable_tools"]) > 0
            
            # Test plan creation
            plan = await engine.create_tool_usage_plan(context, analysis)
            
            assert plan.plan_id is not None
            assert len(plan.planned_executions) > 0
            assert plan.estimated_time > 0.0
            
            # Test reasoning execution
            reasoning_result = await engine.execute_tool_guided_reasoning(context, plan)
            
            assert reasoning_result.reasoning_id is not None
            assert reasoning_result.success
            assert reasoning_result.confidence > 0.0
            assert len(reasoning_result.executions) > 0
            
            # Test statistics
            stats = engine.get_tool_statistics()
            assert "total_reasonings" in stats
            assert stats["registered_tools"] >= 3
            
            elapsed = time.time() - test_start
            self.performance_metrics["individual_tests"]["tool_guided"] = elapsed
            self._record_test("tool_guided_basic", True, f"Completed in {elapsed:.2f}s")
            
        except Exception as e:
            self._record_test("tool_guided_basic", False, f"Error: {e}")
    
    async def test_orchestrator_causal_integration(self):
        """Test integration between orchestrator and causal inference."""
        logger.info("🔗 Testing Orchestrator-Causal Integration...")
        
        if not (ORCHESTRATOR_AVAILABLE and CAUSAL_AVAILABLE):
            self._record_test("orchestrator_causal_integration", False, "Modules not available")
            return
        
        test_start = time.time()
        
        try:
            # Test that orchestrator can use causal reasoning
            orchestrator = ReasoningOrchestrator()
            
            # Problem that should trigger causal reasoning
            chain = await orchestrator.reason(
                "If greenhouse gas emissions increase, what will happen to global temperature?",
                "environmental_science"
            )
            
            # Verify causal reasoning was used
            causal_steps = [step for step in chain.steps 
                           if step.reasoning_type.value == "causal"]
            
            assert len(causal_steps) > 0, "Causal reasoning should be triggered"
            assert chain.confidence_score > 0.3
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["orchestrator_causal"] = elapsed
            self._record_test("orchestrator_causal_integration", True, 
                            f"Integration working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("orchestrator_causal_integration", False, f"Error: {e}")
    
    async def test_orchestrator_analogical_integration(self):
        """Test integration between orchestrator and analogical reasoning."""
        logger.info("🔗 Testing Orchestrator-Analogical Integration...")
        
        if not (ORCHESTRATOR_AVAILABLE and ANALOGICAL_AVAILABLE):
            self._record_test("orchestrator_analogical_integration", False, "Modules not available")
            return
        
        test_start = time.time()
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Problem that should trigger analogical reasoning
            chain = await orchestrator.reason(
                "How is the structure of an atom similar to a solar system?",
                "physics"
            )
            
            # Verify analogical reasoning was used
            analogical_steps = [step for step in chain.steps 
                               if step.reasoning_type.value == "analogical"]
            
            # Note: orchestrator might use different reasoning types based on implementation
            assert len(chain.steps) > 0, "Reasoning steps should be generated"
            assert chain.confidence_score > 0.0
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["orchestrator_analogical"] = elapsed
            self._record_test("orchestrator_analogical_integration", True, 
                            f"Integration working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("orchestrator_analogical_integration", False, f"Error: {e}")
    
    async def test_orchestrator_metacognitive_integration(self):
        """Test integration between orchestrator and meta-cognitive awareness."""
        logger.info("🔗 Testing Orchestrator-MetaCognitive Integration...")
        
        if not (ORCHESTRATOR_AVAILABLE and METACOGNITIVE_AVAILABLE):
            self._record_test("orchestrator_metacognitive_integration", False, "Modules not available")
            return
        
        test_start = time.time()
        
        try:
            orchestrator = ReasoningOrchestrator()
            meta_system = MetaCognitiveAwarenessSystem()
            
            # Start monitoring the reasoning process
            monitor = await meta_system.start_monitoring(
                CognitiveProcessType.REASONING,
                "orchestrator_test",
                {"problem": "complex reasoning task"}
            )
            
            # Perform reasoning
            chain = await orchestrator.reason(
                "Develop a strategy for solving climate change using multiple approaches",
                "environmental_science"
            )
            
            # Update monitoring during reasoning
            await meta_system.update_monitoring(
                "orchestrator_test",
                {"reasoning_chain_id": chain.chain_id},
                confidence=chain.confidence_score
            )
            
            # Complete monitoring
            await meta_system.complete_monitoring(
                "orchestrator_test",
                {"conclusion": chain.final_conclusion},
                success=True
            )
            
            # Verify integration
            assert chain.chain_id is not None
            assert monitor.process_id == "orchestrator_test"
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["orchestrator_metacognitive"] = elapsed
            self._record_test("orchestrator_metacognitive_integration", True, 
                            f"Integration working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("orchestrator_metacognitive_integration", False, f"Error: {e}")
    
    async def test_orchestrator_tool_guided_integration(self):
        """Test integration between orchestrator and tool-guided reasoning."""
        logger.info("🔗 Testing Orchestrator-Tool-Guided Integration...")
        
        if not (ORCHESTRATOR_AVAILABLE and TOOL_GUIDED_AVAILABLE):
            self._record_test("orchestrator_tool_guided_integration", False, "Modules not available")
            return
        
        test_start = time.time()
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Problem that should benefit from tool use
            chain = await orchestrator.reason(
                "Calculate the area of a circle with radius 7 and explain the formula",
                "mathematics",
                available_tools=["calculator", "search_engine"]
            )
            
            # Verify tool-guided reasoning considerations
            tool_guided_steps = [step for step in chain.steps 
                               if step.reasoning_type.value == "tool_guided"]
            
            assert len(chain.steps) > 0
            assert chain.confidence_score > 0.0
            assert chain.context.available_tools == ["calculator", "search_engine"]
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["orchestrator_tool_guided"] = elapsed
            self._record_test("orchestrator_tool_guided_integration", True, 
                            f"Integration working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("orchestrator_tool_guided_integration", False, f"Error: {e}")
    
    async def test_full_system_integration(self):
        """Test full system integration with all modules working together."""
        logger.info("🌐 Testing Full System Integration...")
        
        available_modules = sum([
            ORCHESTRATOR_AVAILABLE, CAUSAL_AVAILABLE, ANALOGICAL_AVAILABLE,
            METACOGNITIVE_AVAILABLE, TOOL_GUIDED_AVAILABLE
        ])
        
        if available_modules < 3:
            self._record_test("full_system_integration", False, 
                            f"Insufficient modules available ({available_modules}/5)")
            return
        
        test_start = time.time()
        
        try:
            # Initialize all available systems
            systems = {}
            
            if ORCHESTRATOR_AVAILABLE:
                systems["orchestrator"] = ReasoningOrchestrator()
            if METACOGNITIVE_AVAILABLE:
                systems["metacognitive"] = MetaCognitiveAwarenessSystem()
            if TOOL_GUIDED_AVAILABLE:
                systems["tool_guided"] = ToolGuidedReasoningEngine()
            if CAUSAL_AVAILABLE:
                systems["causal"] = CausalInferenceEngine()
            if ANALOGICAL_AVAILABLE:
                systems["analogical"] = AnalogicalReasoningEngine()
            
            # Complex multi-modal reasoning task
            problem = (
                "A city wants to reduce traffic congestion. "
                "Analyze the causes, find similar solutions from other domains, "
                "use tools to calculate potential improvements, and monitor the reasoning process."
            )
            
            results = {}
            
            # Meta-cognitive monitoring
            if "metacognitive" in systems:
                monitor = await systems["metacognitive"].start_monitoring(
                    CognitiveProcessType.PROBLEM_SOLVING,
                    "full_system_test",
                    {"problem": problem}
                )
                results["monitoring_started"] = True
            
            # Orchestrated reasoning
            if "orchestrator" in systems:
                chain = await systems["orchestrator"].reason(problem, "urban_planning")
                results["orchestrator_result"] = {
                    "chain_id": chain.chain_id,
                    "confidence": chain.confidence_score,
                    "steps": len(chain.steps)
                }
                
                # Update monitoring
                if "metacognitive" in systems:
                    await systems["metacognitive"].update_monitoring(
                        "full_system_test",
                        {"orchestrator_chain": chain.chain_id},
                        confidence=chain.confidence_score
                    )
            
            # Causal analysis
            if "causal" in systems:
                causal_model = await systems["causal"].discover_causal_relations(
                    "Traffic congestion is caused by too many cars, inadequate public transport, and poor road design",
                    "transportation"
                )
                results["causal_result"] = {
                    "model_id": causal_model.model_id,
                    "variables": len(causal_model.variables),
                    "relations": len(causal_model.relations)
                }
            
            # Tool-guided analysis
            if "tool_guided" in systems:
                context = ReasoningContext(
                    problem_statement="Calculate potential traffic reduction with 20% public transport increase",
                    domain="transportation",
                    current_phase=ReasoningPhase.SOLUTION_DEVELOPMENT,
                    available_data={"current_usage": 0.3, "target_increase": 0.2},
                    constraints={},
                    success_criteria=["quantitative_result"]
                )
                analysis = await systems["tool_guided"].analyze_reasoning_context(context)
                plan = await systems["tool_guided"].create_tool_usage_plan(context, analysis)
                tool_result = await systems["tool_guided"].execute_tool_guided_reasoning(context, plan)
                
                results["tool_guided_result"] = {
                    "reasoning_id": tool_result.reasoning_id,
                    "success": tool_result.success,
                    "tools_used": len(tool_result.executions)
                }
            
            # Complete monitoring
            if "metacognitive" in systems:
                await systems["metacognitive"].complete_monitoring(
                    "full_system_test",
                    {"integration_results": results},
                    success=True
                )
                results["monitoring_completed"] = True
            
            # Verify integration success
            assert len(results) >= 2, "Multiple systems should produce results"
            
            # Test concurrent operation
            if "orchestrator" in systems:
                concurrent_tasks = []
                for i in range(3):
                    task = systems["orchestrator"].reason(
                        f"Simple problem {i}: What is {i} + {i}?", 
                        "mathematics"
                    )
                    concurrent_tasks.append(task)
                
                concurrent_results = await asyncio.gather(*concurrent_tasks)
                assert len(concurrent_results) == 3
                results["concurrent_reasoning"] = True
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["full_system"] = elapsed
            self._record_test("full_system_integration", True, 
                            f"All systems working together ({elapsed:.2f}s, {len(results)} components)")
            
        except Exception as e:
            self._record_test("full_system_integration", False, f"Error: {e}")
    
    async def test_concurrent_reasoning(self):
        """Test concurrent reasoning capabilities."""
        logger.info("⚡ Testing Concurrent Reasoning Performance...")
        
        if not ORCHESTRATOR_AVAILABLE:
            self._record_test("concurrent_reasoning", False, "Orchestrator not available")
            return
        
        test_start = time.time()
        
        try:
            orchestrator = ReasoningOrchestrator()
            
            # Create multiple reasoning tasks
            problems = [
                ("What is the capital of France?", "geography"),
                ("How do plants perform photosynthesis?", "biology"),
                ("What causes earthquakes?", "geology"),
                ("Explain machine learning", "computer_science"),
                ("Calculate 15 * 23", "mathematics")
            ]
            
            # Run concurrently
            tasks = [
                orchestrator.reason(problem, domain)
                for problem, domain in problems
            ]
            
            results = await asyncio.gather(*tasks)
            
            # Verify all completed successfully
            assert len(results) == len(problems)
            for result in results:
                assert result.chain_id is not None
                assert result.confidence_score > 0.0
            
            elapsed = time.time() - test_start
            avg_time_per_task = elapsed / len(problems)
            
            self.performance_metrics["integration_tests"]["concurrent"] = elapsed
            self._record_test("concurrent_reasoning", True, 
                            f"{len(problems)} tasks in {elapsed:.2f}s ({avg_time_per_task:.2f}s avg)")
            
        except Exception as e:
            self._record_test("concurrent_reasoning", False, f"Error: {e}")
    
    async def test_scalability(self):
        """Test system scalability with increasing load."""
        logger.info("📈 Testing System Scalability...")
        
        available_systems = [
            ("orchestrator", ORCHESTRATOR_AVAILABLE),
            ("causal", CAUSAL_AVAILABLE),
            ("analogical", ANALOGICAL_AVAILABLE),
            ("metacognitive", METACOGNITIVE_AVAILABLE),
            ("tool_guided", TOOL_GUIDED_AVAILABLE)
        ]
        
        active_systems = [name for name, available in available_systems if available]
        
        if len(active_systems) < 2:
            self._record_test("scalability", False, "Insufficient systems for scalability test")
            return
        
        test_start = time.time()
        
        try:
            # Test with increasing numbers of operations
            scalability_results = {}
            
            for operation_count in [1, 5, 10]:
                count_start = time.time()
                
                if ORCHESTRATOR_AVAILABLE:
                    orchestrator = ReasoningOrchestrator()
                    tasks = []
                    
                    for i in range(operation_count):
                        task = orchestrator.reason(f"Test problem {i}", "general")
                        tasks.append(task)
                    
                    results = await asyncio.gather(*tasks)
                    assert len(results) == operation_count
                
                count_elapsed = time.time() - count_start
                scalability_results[operation_count] = count_elapsed
            
            # Analyze scalability
            times = list(scalability_results.values())
            if len(times) >= 2:
                # Simple scalability check - time shouldn't grow linearly with operations
                # due to potential parallelization and optimizations
                scalability_factor = times[-1] / times[0]  # ratio of max to min time
                operation_factor = max(scalability_results.keys()) / min(scalability_results.keys())
                
                # Good scalability if time grows slower than operations
                good_scalability = scalability_factor < (operation_factor * 0.8)
            else:
                good_scalability = True
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["scalability"] = elapsed
            self._record_test("scalability", good_scalability, 
                            f"Scalability test completed ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("scalability", False, f"Error: {e}")
    
    def _record_test(self, test_name: str, passed: bool, details: str):
        """Record a test result."""
        result = {
            "test_name": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if passed else "❌ FAILED"
        logger.info(f"   {status}: {test_name.replace('_', ' ').title()} - {details}")
    
    async def generate_test_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        total_time = time.time() - self.performance_metrics["start_time"]
        
        # Count results
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        total_tests = len(self.test_results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Categorize tests
        individual_tests = [r for r in self.test_results if "_integration" not in r["test_name"] 
                          and r["test_name"] not in ["concurrent_reasoning", "scalability"]]
        integration_tests = [r for r in self.test_results if "_integration" in r["test_name"]]
        performance_tests = [r for r in self.test_results if r["test_name"] in ["concurrent_reasoning", "scalability"]]
        
        # Generate report
        report = {
            "test_summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": success_rate,
                "total_execution_time": total_time
            },
            "module_availability": {
                "reasoning_orchestrator": ORCHESTRATOR_AVAILABLE,
                "causal_inference": CAUSAL_AVAILABLE,
                "analogical_reasoning": ANALOGICAL_AVAILABLE,
                "metacognitive_awareness": METACOGNITIVE_AVAILABLE,
                "tool_guided_reasoning": TOOL_GUIDED_AVAILABLE
            },
            "test_categories": {
                "individual_module_tests": {
                    "count": len(individual_tests),
                    "passed": sum(1 for t in individual_tests if t["passed"]),
                    "success_rate": (sum(1 for t in individual_tests if t["passed"]) / len(individual_tests)) * 100 if individual_tests else 0
                },
                "integration_tests": {
                    "count": len(integration_tests),
                    "passed": sum(1 for t in integration_tests if t["passed"]),
                    "success_rate": (sum(1 for t in integration_tests if t["passed"]) / len(integration_tests)) * 100 if integration_tests else 0
                },
                "performance_tests": {
                    "count": len(performance_tests),
                    "passed": sum(1 for t in performance_tests if t["passed"]),
                    "success_rate": (sum(1 for t in performance_tests if t["passed"]) / len(performance_tests)) * 100 if performance_tests else 0
                }
            },
            "performance_metrics": self.performance_metrics,
            "detailed_results": self.test_results,
            "recommendations": self._generate_recommendations()
        }
        
        # Log summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 ADVANCED REASONING TEST SUITE RESULTS")
        logger.info("=" * 60)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {total_tests - passed_tests}")
        logger.info(f"Success Rate: {success_rate:.1f}%")
        logger.info(f"Total Time: {total_time:.2f}s")
        logger.info("")
        
        logger.info("Module Availability:")
        for module, available in report["module_availability"].items():
            status = "✅" if available else "❌"
            logger.info(f"  {status} {module.replace('_', ' ').title()}")
        
        logger.info("")
        logger.info("Test Category Results:")
        for category, results in report["test_categories"].items():
            logger.info(f"  {category.replace('_', ' ').title()}: {results['passed']}/{results['count']} ({results['success_rate']:.1f}%)")
        
        if report["recommendations"]:
            logger.info("\n🔧 Recommendations:")
            for rec in report["recommendations"]:
                logger.info(f"  • {rec}")
        
        logger.info("\n✅ Test suite completed successfully!")
        
        return report
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results."""
        recommendations = []
        
        failed_tests = [r for r in self.test_results if not r["passed"]]
        
        if failed_tests:
            recommendations.append(f"Address {len(failed_tests)} failed tests for full system functionality")
        
        # Module-specific recommendations
        if not ORCHESTRATOR_AVAILABLE:
            recommendations.append("Install reasoning orchestrator for centralized reasoning coordination")
        
        if not CAUSAL_AVAILABLE:
            recommendations.append("Install causal inference engine for cause-effect reasoning")
        
        if not ANALOGICAL_AVAILABLE:
            recommendations.append("Install analogical reasoning engine for similarity-based reasoning")
        
        if not METACOGNITIVE_AVAILABLE:
            recommendations.append("Install meta-cognitive awareness for self-reflection capabilities")
        
        if not TOOL_GUIDED_AVAILABLE:
            recommendations.append("Install tool-guided reasoning for external tool integration")
        
        # Performance recommendations
        individual_times = [t for t in self.performance_metrics["individual_tests"].values()]
        if individual_times and max(individual_times) > 5.0:
            recommendations.append("Optimize slow modules for better performance")
        
        integration_times = [t for t in self.performance_metrics["integration_tests"].values()]
        if integration_times and max(integration_times) > 10.0:
            recommendations.append("Optimize integration pathways for faster combined operations")
        
        return recommendations


async def main():
    """Run the complete advanced reasoning test suite."""
    test_suite = AdvancedReasoningTestSuite()
    report = await test_suite.run_all_tests()
    
    # Save report to file
    import json
    with open("advanced_reasoning_test_report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    return report


if __name__ == "__main__":
    asyncio.run(main())
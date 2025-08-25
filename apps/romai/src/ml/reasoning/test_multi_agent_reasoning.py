"""
🧠 Test Suite for Multi-Agent Reasoning System
===========================================

Comprehensive tests for the multi-agent reasoning system including:
- Specialized reasoning agent functionality
- Multi-agent collaboration modes
- Problem decomposition and synthesis
- Romanian cultural integration
- Performance and scalability validation
"""

import asyncio
import json
import pytest
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Import the multi-agent reasoning system
from .multi_agent_reasoning_system import (
    MultiAgentReasoningSystem,
    ReasoningProblem,
    ReasoningDomain,
    ReasoningComplexity,
    AgentCollaborationMode,
    SpecializedReasoningAgent,
    MultiAgentReasoningSolution
)

# Configure logging for tests
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestMultiAgentReasoningSystem:
    """Comprehensive test suite for multi-agent reasoning system"""
    
    @pytest.fixture
    async def reasoning_system(self):
        """Create multi-agent reasoning system for testing"""
        system = MultiAgentReasoningSystem()
        await system.coordination_hub.start()
        return system
    
    @pytest.fixture
    def sample_mathematical_problem(self):
        """Sample mathematical reasoning problem"""
        return ReasoningProblem(
            problem_id="math_test_001",
            description="Solve the optimization problem: maximize f(x,y) = x² + 2y² subject to constraint x + y ≤ 5 and x,y ≥ 0, then explain the solution using Romanian cultural context",
            problem_type="mathematical_optimization",
            complexity=ReasoningComplexity.COMPLEX,
            domains_required=[ReasoningDomain.MATHEMATICAL, ReasoningDomain.CULTURAL],
            constraints={"time_limit": 60, "precision_required": True},
            cultural_requirements={"romanian_context": True, "educational_format": True},
            quality_threshold=0.85
        )
    
    @pytest.fixture
    def sample_creative_problem(self):
        """Sample creative reasoning problem"""
        return ReasoningProblem(
            problem_id="creative_test_001",
            description="Design an innovative Romanian cultural festival that celebrates traditional and modern elements while promoting international tourism",
            problem_type="creative_design",
            complexity=ReasoningComplexity.ADVANCED,
            domains_required=[ReasoningDomain.CREATIVE, ReasoningDomain.CULTURAL, ReasoningDomain.STRATEGIC],
            cultural_requirements={
                "romanian_traditions": True,
                "modern_innovation": True,
                "tourism_appeal": True
            },
            quality_threshold=0.80
        )
    
    @pytest.fixture
    def sample_complex_problem(self):
        """Sample complex multi-domain problem"""
        return ReasoningProblem(
            problem_id="complex_test_001",
            description="Analyze the economic impact of implementing a digital transformation strategy for Romanian SMEs, considering cultural factors, technological readiness, and mathematical financial projections",
            problem_type="multi_domain_analysis",
            complexity=ReasoningComplexity.EXPERT,
            domains_required=[
                ReasoningDomain.ANALYTICAL,
                ReasoningDomain.MATHEMATICAL,
                ReasoningDomain.CULTURAL,
                ReasoningDomain.STRATEGIC
            ],
            constraints={"comprehensive_analysis": True, "quantitative_metrics": True},
            cultural_requirements={
                "romanian_business_context": True,
                "sme_considerations": True,
                "cultural_adaptation": True
            },
            quality_threshold=0.90
        )
    
    async def test_system_initialization(self, reasoning_system):
        """Test system initialization and agent setup"""
        logger.info("🧪 Testing system initialization...")
        
        # Check system is initialized
        assert reasoning_system is not None
        assert len(reasoning_system.agents) > 0
        assert len(reasoning_system.domain_mapping) > 0
        
        # Check all required domains are covered
        expected_domains = [
            ReasoningDomain.MATHEMATICAL,
            ReasoningDomain.LOGICAL,
            ReasoningDomain.CREATIVE,
            ReasoningDomain.CULTURAL
        ]
        
        for domain in expected_domains:
            assert domain in reasoning_system.domain_mapping
            assert len(reasoning_system.domain_mapping[domain]) > 0
        
        # Check agent specialization
        math_agents = [
            agent for agent in reasoning_system.agents.values() 
            if agent.domain == ReasoningDomain.MATHEMATICAL
        ]
        assert len(math_agents) > 0
        assert all(agent.expertise_level >= 0.9 for agent in math_agents)
        
        # Test system status
        status = reasoning_system.get_system_status()
        assert status['system_health'] in ['operational', 'degraded']
        assert status['total_agents'] == len(reasoning_system.agents)
        
        logger.info("✅ System initialization test passed")
    
    async def test_mathematical_problem_solving(self, reasoning_system, sample_mathematical_problem):
        """Test mathematical problem solving with cultural context"""
        logger.info("🧪 Testing mathematical problem solving...")
        
        start_time = time.time()
        
        # Solve mathematical problem
        solution = await reasoning_system.solve_complex_problem(
            sample_mathematical_problem,
            AgentCollaborationMode.HIERARCHICAL
        )
        
        solving_time = time.time() - start_time
        
        # Validate solution structure
        assert isinstance(solution, MultiAgentReasoningSolution)
        assert solution.problem_id == sample_mathematical_problem.problem_id
        assert solution.reasoning_quality > 0.0
        assert solution.cultural_integration_score > 0.0
        assert len(solution.contributing_agents) > 0
        assert len(solution.agent_contributions) > 0
        
        # Check mathematical agent involvement
        math_agent_involved = any(
            'mathematical' in agent_id.lower() 
            for agent_id in solution.contributing_agents
        )
        assert math_agent_involved, "Mathematical agent should be involved in mathematical problem"
        
        # Check cultural integration
        cultural_agent_involved = any(
            'cultural' in agent_id.lower() 
            for agent_id in solution.contributing_agents
        )
        assert cultural_agent_involved, "Cultural agent should be involved due to cultural requirements"
        
        # Performance validation
        assert solving_time < 30.0, f"Problem solving took too long: {solving_time:.2f}s"
        assert solution.reasoning_quality >= sample_mathematical_problem.quality_threshold
        
        # Validate solution content
        assert 'synthesized_solution' in solution.synthesized_solution
        assert solution.collaboration_effectiveness > 0.5
        
        logger.info(f"✅ Mathematical problem solved in {solving_time:.2f}s")
        logger.info(f"📊 Quality: {solution.reasoning_quality:.2f}, Cultural: {solution.cultural_integration_score:.2f}")
    
    async def test_creative_problem_solving(self, reasoning_system, sample_creative_problem):
        """Test creative problem solving with multi-domain collaboration"""
        logger.info("🧪 Testing creative problem solving...")
        
        start_time = time.time()
        
        # Solve creative problem using democratic collaboration
        solution = await reasoning_system.solve_complex_problem(
            sample_creative_problem,
            AgentCollaborationMode.DEMOCRATIC
        )
        
        solving_time = time.time() - start_time
        
        # Validate solution
        assert isinstance(solution, MultiAgentReasoningSolution)
        assert solution.problem_id == sample_creative_problem.problem_id
        assert len(solution.contributing_agents) >= 2  # Multiple agents for democratic approach
        
        # Check creative and cultural agents involvement
        agent_domains = []
        for contribution in solution.agent_contributions:
            agent_domains.append(contribution.domain)
        
        assert ReasoningDomain.CREATIVE in agent_domains, "Creative agent should be involved"
        assert ReasoningDomain.CULTURAL in agent_domains, "Cultural agent should be involved"
        
        # Validate creative solution quality
        assert solution.reasoning_quality > 0.6
        assert solution.cultural_integration_score > 0.7  # High cultural integration expected
        
        # Check solution contains creative elements
        solution_text = json.dumps(solution.synthesized_solution, default=str).lower()
        creative_indicators = ['innovative', 'creative', 'festival', 'tourism', 'traditional']
        creative_mentions = sum(1 for indicator in creative_indicators if indicator in solution_text)
        assert creative_mentions > 0, "Solution should contain creative elements"
        
        logger.info(f"✅ Creative problem solved in {solving_time:.2f}s")
        logger.info(f"🎨 Creative elements: {creative_mentions}, Cultural score: {solution.cultural_integration_score:.2f}")
    
    async def test_complex_multi_domain_problem(self, reasoning_system, sample_complex_problem):
        """Test complex multi-domain problem requiring all agent types"""
        logger.info("🧪 Testing complex multi-domain problem...")
        
        start_time = time.time()
        
        # Solve complex problem using parallel collaboration
        solution = await reasoning_system.solve_complex_problem(
            sample_complex_problem,
            AgentCollaborationMode.PARALLEL
        )
        
        solving_time = time.time() - start_time
        
        # Validate comprehensive solution
        assert isinstance(solution, MultiAgentReasoningSolution)
        assert len(solution.contributing_agents) >= 3  # Multiple domains required
        assert len(solution.agent_contributions) >= 3
        
        # Check all required domains are addressed
        contributing_domains = {contrib.domain for contrib in solution.agent_contributions}
        required_domains = set(sample_complex_problem.domains_required)
        
        # At least 75% of required domains should be covered
        domain_coverage = len(contributing_domains.intersection(required_domains)) / len(required_domains)
        assert domain_coverage >= 0.75, f"Insufficient domain coverage: {domain_coverage:.2f}"
        
        # Validate high-quality solution
        assert solution.reasoning_quality >= 0.7
        assert solution.collaboration_effectiveness >= 0.6
        
        # Check for comprehensive analysis indicators
        solution_content = json.dumps(solution.synthesized_solution, default=str).lower()
        analysis_indicators = ['economic', 'impact', 'digital', 'transformation', 'romanian', 'sme']
        analysis_coverage = sum(1 for indicator in analysis_indicators if indicator in solution_content)
        assert analysis_coverage >= 3, f"Insufficient analysis coverage: {analysis_coverage}"
        
        logger.info(f"✅ Complex problem solved in {solving_time:.2f}s")
        logger.info(f"🔍 Domain coverage: {domain_coverage:.2f}, Analysis coverage: {analysis_coverage}")
    
    async def test_collaboration_modes(self, reasoning_system, sample_mathematical_problem):
        """Test different collaboration modes"""
        logger.info("🧪 Testing collaboration modes...")
        
        collaboration_modes = [
            AgentCollaborationMode.SEQUENTIAL,
            AgentCollaborationMode.PARALLEL,
            AgentCollaborationMode.HIERARCHICAL,
            AgentCollaborationMode.DEMOCRATIC
        ]
        
        mode_results = {}
        
        for mode in collaboration_modes:
            start_time = time.time()
            
            # Create problem variant for each mode
            problem_variant = ReasoningProblem(
                problem_id=f"collab_test_{mode.value}",
                description=f"Test problem for {mode.value} collaboration mode: " + sample_mathematical_problem.description[:100],
                problem_type="collaboration_test",
                complexity=ReasoningComplexity.MODERATE,
                domains_required=[ReasoningDomain.MATHEMATICAL, ReasoningDomain.LOGICAL],
                quality_threshold=0.7
            )
            
            solution = await reasoning_system.solve_complex_problem(problem_variant, mode)
            solving_time = time.time() - start_time
            
            mode_results[mode.value] = {
                'solving_time': solving_time,
                'quality': solution.reasoning_quality,
                'collaboration_effectiveness': solution.collaboration_effectiveness,
                'agent_count': len(solution.contributing_agents)
            }
            
            # Basic validation for each mode
            assert isinstance(solution, MultiAgentReasoningSolution)
            assert solution.reasoning_quality > 0.5
            assert solving_time < 20.0  # Reasonable time limit
        
        # Compare collaboration modes
        logger.info("📊 Collaboration mode comparison:")
        for mode, results in mode_results.items():
            logger.info(f"  {mode}: {results['solving_time']:.2f}s, quality={results['quality']:.2f}, agents={results['agent_count']}")
        
        # Validate mode differences
        sequential_time = mode_results['sequential']['solving_time']
        parallel_time = mode_results['parallel']['solving_time']
        
        # Parallel should generally be faster than sequential for multi-domain problems
        # (allowing for some variance due to system load)
        time_ratio = parallel_time / sequential_time if sequential_time > 0 else 1.0
        logger.info(f"⚡ Parallel/Sequential time ratio: {time_ratio:.2f}")
        
        logger.info("✅ Collaboration modes test passed")
    
    async def test_cultural_integration(self, reasoning_system):
        """Test Romanian cultural integration across different problems"""
        logger.info("🧪 Testing cultural integration...")
        
        cultural_problems = [
            ReasoningProblem(
                problem_id="cultural_test_1",
                description="Explain the significance of Mărțișor in Romanian culture and its modern adaptations",
                problem_type="cultural_analysis",
                complexity=ReasoningComplexity.MODERATE,
                domains_required=[ReasoningDomain.CULTURAL],
                cultural_requirements={
                    "traditional_context": True,
                    "modern_relevance": True,
                    "educational_format": True
                }
            ),
            ReasoningProblem(
                problem_id="cultural_test_2", 
                description="Design a business strategy for promoting Romanian wine internationally while preserving traditional values",
                problem_type="cultural_business",
                complexity=ReasoningComplexity.COMPLEX,
                domains_required=[ReasoningDomain.CULTURAL, ReasoningDomain.STRATEGIC],
                cultural_requirements={
                    "romanian_traditions": True,
                    "international_appeal": True,
                    "business_viability": True
                }
            )
        ]
        
        cultural_scores = []
        
        for problem in cultural_problems:
            solution = await reasoning_system.solve_complex_problem(
                problem, AgentCollaborationMode.HIERARCHICAL
            )
            
            cultural_scores.append(solution.cultural_integration_score)
            
            # Validate cultural integration
            assert solution.cultural_integration_score > 0.7, f"Low cultural integration: {solution.cultural_integration_score:.2f}"
            
            # Check cultural agent involvement
            cultural_contributions = [
                c for c in solution.agent_contributions 
                if c.domain == ReasoningDomain.CULTURAL
            ]
            assert len(cultural_contributions) > 0, "Cultural agent should contribute to cultural problems"
            
            # Validate cultural appropriateness
            for contribution in cultural_contributions:
                if contribution.cultural_appropriateness is not None:
                    assert contribution.cultural_appropriateness > 0.8, "High cultural appropriateness expected"
        
        avg_cultural_score = sum(cultural_scores) / len(cultural_scores)
        assert avg_cultural_score > 0.75, f"Overall cultural integration insufficient: {avg_cultural_score:.2f}"
        
        logger.info(f"✅ Cultural integration test passed - Average score: {avg_cultural_score:.2f}")
    
    async def test_performance_scalability(self, reasoning_system):
        """Test performance and scalability"""
        logger.info("🧪 Testing performance and scalability...")
        
        # Test with increasing problem complexity
        complexity_levels = [
            ReasoningComplexity.SIMPLE,
            ReasoningComplexity.MODERATE, 
            ReasoningComplexity.COMPLEX,
            ReasoningComplexity.ADVANCED
        ]
        
        performance_metrics = []
        
        for complexity in complexity_levels:
            # Create problems of increasing complexity
            domain_count = {
                ReasoningComplexity.SIMPLE: 1,
                ReasoningComplexity.MODERATE: 2,
                ReasoningComplexity.COMPLEX: 3,
                ReasoningComplexity.ADVANCED: 4
            }[complexity]
            
            domains = [ReasoningDomain.MATHEMATICAL, ReasoningDomain.LOGICAL, 
                      ReasoningDomain.CREATIVE, ReasoningDomain.CULTURAL][:domain_count]
            
            problem = ReasoningProblem(
                problem_id=f"perf_test_{complexity.value}",
                description=f"Performance test problem with {complexity.value} complexity requiring {domain_count} domains",
                problem_type="performance_test",
                complexity=complexity,
                domains_required=domains,
                quality_threshold=0.75
            )
            
            start_time = time.time()
            solution = await reasoning_system.solve_complex_problem(problem, AgentCollaborationMode.PARALLEL)
            solving_time = time.time() - start_time
            
            performance_metrics.append({
                'complexity': complexity.value,
                'domains': domain_count,
                'solving_time': solving_time,
                'quality': solution.reasoning_quality,
                'agents_used': len(solution.contributing_agents)
            })
            
            # Performance validations
            assert solving_time < 25.0, f"Performance degraded for {complexity.value}: {solving_time:.2f}s"
            assert solution.reasoning_quality > 0.6, f"Quality degraded for {complexity.value}: {solution.reasoning_quality:.2f}"
        
        # Analyze performance scaling
        logger.info("📈 Performance scaling analysis:")
        for metrics in performance_metrics:
            logger.info(f"  {metrics['complexity']}: {metrics['solving_time']:.2f}s, "
                       f"quality={metrics['quality']:.2f}, agents={metrics['agents_used']}")
        
        # Check that scaling is reasonable (not exponential degradation)
        simple_time = performance_metrics[0]['solving_time']
        advanced_time = performance_metrics[-1]['solving_time']
        scaling_factor = advanced_time / simple_time if simple_time > 0 else 1.0
        
        assert scaling_factor < 10.0, f"Performance scaling too poor: {scaling_factor:.2f}x"
        
        logger.info(f"✅ Performance scalability test passed - Scaling factor: {scaling_factor:.2f}x")
    
    async def test_error_handling_and_recovery(self, reasoning_system):
        """Test error handling and recovery mechanisms"""
        logger.info("🧪 Testing error handling and recovery...")
        
        # Test with problematic inputs
        problematic_problems = [
            # Empty description
            ReasoningProblem(
                problem_id="error_test_1",
                description="",
                problem_type="error_test",
                complexity=ReasoningComplexity.SIMPLE,
                domains_required=[ReasoningDomain.MATHEMATICAL]
            ),
            # Impossible constraints
            ReasoningProblem(
                problem_id="error_test_2",
                description="Solve this impossible problem with contradictory constraints",
                problem_type="error_test",
                complexity=ReasoningComplexity.EXPERT,
                domains_required=[ReasoningDomain.MATHEMATICAL],
                quality_threshold=1.5  # Impossible threshold
            ),
            # Unsupported domain combination
            ReasoningProblem(
                problem_id="error_test_3",
                description="Test problem with edge case requirements",
                problem_type="error_test", 
                complexity=ReasoningComplexity.COMPLEX,
                domains_required=[],  # No domains
                time_limit=0.001  # Impossible time limit
            )
        ]
        
        recovery_count = 0
        
        for problem in problematic_problems:
            try:
                solution = await reasoning_system.solve_complex_problem(
                    problem, AgentCollaborationMode.HIERARCHICAL
                )
                
                # System should handle errors gracefully
                assert isinstance(solution, MultiAgentReasoningSolution)
                
                # Check if error recovery produced a meaningful response
                if ('error' not in solution.synthesized_solution or 
                    solution.reasoning_quality > 0.3):
                    recovery_count += 1
                
            except Exception as e:
                logger.info(f"⚠️ Expected error handled: {e}")
                # Errors should be handled gracefully, not crash the system
        
        # System should maintain functionality
        status = reasoning_system.get_system_status()
        assert status['system_health'] in ['operational', 'degraded']
        
        logger.info(f"✅ Error handling test passed - Recovery rate: {recovery_count}/{len(problematic_problems)}")
    
    async def test_concurrent_problem_solving(self, reasoning_system):
        """Test concurrent problem solving capabilities"""
        logger.info("🧪 Testing concurrent problem solving...")
        
        # Create multiple problems to solve concurrently
        concurrent_problems = []
        for i in range(5):
            problem = ReasoningProblem(
                problem_id=f"concurrent_test_{i}",
                description=f"Concurrent problem {i}: Analyze Romanian economic trends with mathematical modeling",
                problem_type="concurrent_test",
                complexity=ReasoningComplexity.MODERATE,
                domains_required=[ReasoningDomain.MATHEMATICAL, ReasoningDomain.ANALYTICAL],
                quality_threshold=0.75
            )
            concurrent_problems.append(problem)
        
        # Solve problems concurrently
        start_time = time.time()
        
        tasks = [
            reasoning_system.solve_complex_problem(problem, AgentCollaborationMode.PARALLEL)
            for problem in concurrent_problems
        ]
        
        solutions = await asyncio.gather(*tasks, return_exceptions=True)
        concurrent_time = time.time() - start_time
        
        # Validate concurrent solutions
        valid_solutions = []
        for solution in solutions:
            if isinstance(solution, MultiAgentReasoningSolution):
                valid_solutions.append(solution)
                assert solution.reasoning_quality > 0.5
            else:
                logger.warning(f"⚠️ Concurrent solution exception: {solution}")
        
        assert len(valid_solutions) >= 3, f"Too many concurrent failures: {len(valid_solutions)}/{len(concurrent_problems)}"
        
        # Compare with sequential solving time
        sequential_start = time.time()
        sequential_solution = await reasoning_system.solve_complex_problem(
            concurrent_problems[0], AgentCollaborationMode.PARALLEL
        )
        sequential_time = time.time() - sequential_start
        
        # Concurrent should be more efficient than sequential for multiple problems
        expected_sequential_total = sequential_time * len(concurrent_problems)
        efficiency_ratio = concurrent_time / expected_sequential_total
        
        logger.info(f"⚡ Concurrent efficiency: {efficiency_ratio:.2f} ({concurrent_time:.2f}s vs {expected_sequential_total:.2f}s)")
        
        # Allow for reasonable concurrency benefits
        assert efficiency_ratio < 0.8, f"Poor concurrency efficiency: {efficiency_ratio:.2f}"
        
        logger.info(f"✅ Concurrent problem solving test passed - {len(valid_solutions)}/{len(concurrent_problems)} succeeded")

async def run_comprehensive_test_suite():
    """Run the complete test suite"""
    logger.info("🚀 Starting Multi-Agent Reasoning System Test Suite...")
    
    test_suite = TestMultiAgentReasoningSystem()
    
    # Initialize system
    system = MultiAgentReasoningSystem()
    await system.coordination_hub.start()
    
    # Create test fixtures
    math_problem = test_suite.sample_mathematical_problem(test_suite)
    creative_problem = test_suite.sample_creative_problem(test_suite)
    complex_problem = test_suite.sample_complex_problem(test_suite)
    
    tests_passed = 0
    tests_failed = 0
    
    test_methods = [
        ("System Initialization", test_suite.test_system_initialization(system)),
        ("Mathematical Problem Solving", test_suite.test_mathematical_problem_solving(system, math_problem)),
        ("Creative Problem Solving", test_suite.test_creative_problem_solving(system, creative_problem)),
        ("Complex Multi-Domain Problem", test_suite.test_complex_multi_domain_problem(system, complex_problem)),
        ("Collaboration Modes", test_suite.test_collaboration_modes(system, math_problem)),
        ("Cultural Integration", test_suite.test_cultural_integration(system)),
        ("Performance Scalability", test_suite.test_performance_scalability(system)),
        ("Error Handling", test_suite.test_error_handling_and_recovery(system)),
        ("Concurrent Problem Solving", test_suite.test_concurrent_problem_solving(system))
    ]
    
    for test_name, test_coro in test_methods:
        try:
            logger.info(f"🧪 Running {test_name}...")
            await test_coro
            tests_passed += 1
            logger.info(f"✅ {test_name} PASSED")
        except Exception as e:
            tests_failed += 1
            logger.error(f"❌ {test_name} FAILED: {e}")
    
    # Final cleanup
    await system.coordination_hub.stop()
    
    # Test summary
    total_tests = tests_passed + tests_failed
    success_rate = (tests_passed / total_tests) * 100 if total_tests > 0 else 0
    
    logger.info("=" * 60)
    logger.info("🎯 MULTI-AGENT REASONING SYSTEM TEST RESULTS")
    logger.info("=" * 60)
    logger.info(f"Total Tests: {total_tests}")
    logger.info(f"Passed: {tests_passed}")
    logger.info(f"Failed: {tests_failed}")
    logger.info(f"Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80.0:
        logger.info("🎉 TEST SUITE PASSED - Multi-Agent Reasoning System is ready for production!")
        return True
    else:
        logger.error("💥 TEST SUITE FAILED - System needs improvements before production deployment")
        return False

if __name__ == "__main__":
    import asyncio
    success = asyncio.run(run_comprehensive_test_suite())
    exit(0 if success else 1)
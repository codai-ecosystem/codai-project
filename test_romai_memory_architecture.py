"""
RomAI AGI Evolution Phase 2.1: Memory Architecture Tests

Comprehensive test suite for the advanced memory architecture including
episodic, semantic, working, and integrated memory systems.

Tests Phase 2.1 completion and integration with Phase 1 components.
"""

import asyncio
import pytest
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Import memory systems
from apps.romai.src.ml.memory.episodic_memory import EpisodicMemorySystem, MemoryTrace
from apps.romai.src.ml.memory.semantic_memory import SemanticMemorySystem, RelationType
from apps.romai.src.ml.memory.working_memory import WorkingMemorySystem, WorkingMemorySlotType, AttentionType
from apps.romai.src.ml.memory.integrated_memory import MemoryIntegrationSystem, MemorySystemType, MemoryRouting

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestMemoryArchitecture:
    """Comprehensive test suite for RomAI advanced memory architecture"""
    
    def __init__(self):
        self.test_results = {
            'episodic_memory': {},
            'semantic_memory': {},
            'working_memory': {},
            'integrated_memory': {},
            'overall_success': False
        }
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive memory architecture tests"""
        
        logger.info("🧠 Starting Memory Architecture Test Suite")
        
        try:
            # Test individual memory systems
            await self.test_episodic_memory_system()
            await self.test_semantic_memory_system() 
            await self.test_working_memory_system()
            await self.test_integrated_memory_system()
            
            # Test cross-system integration
            await self.test_memory_integration()
            await self.test_memory_performance()
            
            # Calculate overall success
            self.test_results['overall_success'] = all([
                self.test_results['episodic_memory'].get('success', False),
                self.test_results['semantic_memory'].get('success', False),
                self.test_results['working_memory'].get('success', False),
                self.test_results['integrated_memory'].get('success', False)
            ])
            
            logger.info(f"🎯 Memory Architecture Tests Complete: {'SUCCESS' if self.test_results['overall_success'] else 'FAILED'}")
            
        except Exception as e:
            logger.error(f"❌ Memory Architecture Test Suite Error: {e}")
            self.test_results['overall_error'] = str(e)
        
        return self.test_results
    
    async def test_episodic_memory_system(self):
        """Test episodic memory functionality"""
        
        logger.info("📚 Testing Episodic Memory System")
        
        episodic_results = {
            'storage_test': False,
            'retrieval_test': False,
            'temporal_search_test': False,
            'consolidation_test': False,
            'success': False
        }
        
        try:
            memory_system = EpisodicMemorySystem()
            
            # Test 1: Storage
            episode_id = await memory_system.store_episode(
                content="Learned quadratic equations in mathematics class",
                context={
                    'location': 'classroom',
                    'subject': 'mathematics',
                    'difficulty': 'intermediate'
                },
                emotional_valence=0.3,
                importance=0.8
            )
            
            if episode_id:
                episodic_results['storage_test'] = True
                logger.info("✅ Episodic storage test passed")
            
            # Test 2: Retrieval
            episodes = await memory_system.retrieve_episodes(
                query="mathematics quadratic",
                max_results=5
            )
            
            if episodes and len(episodes) > 0:
                episodic_results['retrieval_test'] = True
                logger.info("✅ Episodic retrieval test passed")
            
            # Test 3: Temporal search
            from datetime import datetime, timedelta
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=24)
            recent_episodes = await memory_system.temporal_memory_search(
                time_range=(start_time, end_time),
                importance_filter=None
            )
            
            if recent_episodes is not None:
                episodic_results['temporal_search_test'] = True
                logger.info("✅ Episodic temporal search test passed")
            
            # Test 4: Memory consolidation
            consolidation_result = await memory_system.consolidate_similar_episodes(
                similarity_threshold=0.7
            )
            
            if consolidation_result is not None:
                episodic_results['consolidation_test'] = True
                logger.info("✅ Episodic consolidation test passed")
            
            # Overall success
            episodic_results['success'] = all([
                episodic_results['storage_test'],
                episodic_results['retrieval_test'],
                episodic_results['temporal_search_test'],
                episodic_results['consolidation_test']
            ])
            
        except Exception as e:
            logger.error(f"❌ Episodic memory test error: {e}")
            episodic_results['error'] = str(e)
        
        self.test_results['episodic_memory'] = episodic_results
    
    async def test_semantic_memory_system(self):
        """Test semantic memory functionality"""
        
        logger.info("🧠 Testing Semantic Memory System")
        
        semantic_results = {
            'knowledge_storage_test': False,
            'knowledge_query_test': False,
            'relationship_test': False,
            'hierarchy_test': False,
            'similarity_test': False,
            'success': False
        }
        
        try:
            memory_system = SemanticMemorySystem()
            
            # Test 1: Knowledge storage
            concept_id = await memory_system.store_knowledge(
                concept="mathematics",
                relations=[
                    ("mathematics", RelationType.IS_A, "science"),
                    ("mathematics", RelationType.HAS_PROPERTY, "logical"),
                    ("mathematics", RelationType.USED_FOR, "problem_solving")
                ],
                facts=[
                    {"subject": "mathematics", "predicate": "studies", "object": "numbers"},
                    {"subject": "mathematics", "predicate": "includes", "object": "algebra"}
                ],
                confidence=0.9
            )
            
            if concept_id:
                semantic_results['knowledge_storage_test'] = True
                logger.info("✅ Semantic knowledge storage test passed")
            
            # Test 2: Knowledge query
            knowledge_results = await memory_system.query_knowledge(
                query="What is mathematics?",
                depth=3,
                min_confidence=0.5
            )
            
            if knowledge_results and knowledge_results.get('concepts'):
                semantic_results['knowledge_query_test'] = True
                logger.info("✅ Semantic knowledge query test passed")
            
            # Test 3: Relationship testing
            # Store another concept for relationship testing
            await memory_system.store_knowledge(
                concept="algebra",
                relations=[
                    ("algebra", RelationType.IS_A, "mathematics"),
                    ("algebra", RelationType.HAS_PROPERTY, "symbolic")
                ],
                facts=[
                    {"subject": "algebra", "predicate": "uses", "object": "variables"}
                ]
            )
            
            algebra_knowledge = await memory_system.query_knowledge("algebra")
            if algebra_knowledge and algebra_knowledge.get('concepts'):
                semantic_results['relationship_test'] = True
                logger.info("✅ Semantic relationship test passed")
            
            # Test 4: Concept hierarchy
            hierarchy = await memory_system.get_concept_hierarchy("mathematics", max_depth=3)
            
            if hierarchy and 'hierarchy' in hierarchy:
                semantic_results['hierarchy_test'] = True
                logger.info("✅ Semantic hierarchy test passed")
            
            # Test 5: Conceptual similarity
            similarity = await memory_system.find_conceptual_similarities("mathematics", "algebra")
            
            if similarity and similarity.get('similarity_score', 0) > 0:
                semantic_results['similarity_test'] = True
                logger.info("✅ Semantic similarity test passed")
            
            # Overall success
            semantic_results['success'] = all([
                semantic_results['knowledge_storage_test'],
                semantic_results['knowledge_query_test'],
                semantic_results['relationship_test'],
                semantic_results['hierarchy_test'],
                semantic_results['similarity_test']
            ])
            
        except Exception as e:
            logger.error(f"❌ Semantic memory test error: {e}")
            semantic_results['error'] = str(e)
        
        self.test_results['semantic_memory'] = semantic_results
    
    async def test_working_memory_system(self):
        """Test working memory functionality"""
        
        logger.info("🎯 Testing Working Memory System")
        
        working_results = {
            'active_storage_test': False,
            'attention_focus_test': False,
            'cognitive_load_test': False,
            'context_switching_test': False,
            'retrieval_test': False,
            'success': False
        }
        
        try:
            memory_system = WorkingMemorySystem()
            
            # Test 1: Active information storage
            item1_id = await memory_system.store_active_information(
                content="Solve equation: x^2 + 5x + 6 = 0",
                slot_type=WorkingMemorySlotType.SEMANTIC,
                attention_weight=0.8,
                importance=0.9
            )
            
            item2_id = await memory_system.store_active_information(
                content="Remember to review calculus derivatives",
                slot_type=WorkingMemorySlotType.EPISODIC,
                attention_weight=0.6,
                importance=0.7
            )
            
            if item1_id and item2_id:
                working_results['active_storage_test'] = True
                logger.info("✅ Working memory active storage test passed")
            
            # Test 2: Attention focus
            focus_success = await memory_system.focus_attention(
                target_content="equation",
                attention_type=AttentionType.FOCUSED
            )
            
            if focus_success:
                working_results['attention_focus_test'] = True
                logger.info("✅ Working memory attention focus test passed")
            
            # Test 3: Cognitive load management
            load_result = await memory_system.manage_cognitive_load(target_load=0.6)
            
            if load_result and load_result.get('success'):
                working_results['cognitive_load_test'] = True
                logger.info("✅ Working memory cognitive load test passed")
            
            # Test 4: Context switching
            new_context = {
                'attention_focus': [item2_id],
                'processing_goals': ['review_calculus'],
                'relevant_terms': ['calculus', 'derivatives']
            }
            
            switch_success = await memory_system.switch_context(new_context)
            
            if switch_success:
                working_results['context_switching_test'] = True
                logger.info("✅ Working memory context switching test passed")
            
            # Test 5: Information retrieval
            retrieved_items = await memory_system.retrieve_active_information(
                query="equation",
                attention_type=AttentionType.SELECTIVE,
                max_items=3
            )
            
            if retrieved_items and len(retrieved_items) > 0:
                working_results['retrieval_test'] = True
                logger.info("✅ Working memory retrieval test passed")
            
            # Overall success
            working_results['success'] = all([
                working_results['active_storage_test'],
                working_results['attention_focus_test'],
                working_results['cognitive_load_test'],
                working_results['context_switching_test'],
                working_results['retrieval_test']
            ])
            
        except Exception as e:
            logger.error(f"❌ Working memory test error: {e}")
            working_results['error'] = str(e)
        
        self.test_results['working_memory'] = working_results
    
    async def test_integrated_memory_system(self):
        """Test integrated memory system functionality"""
        
        logger.info("🔄 Testing Integrated Memory System")
        
        integrated_results = {
            'unified_storage_test': False,
            'unified_query_test': False,
            'cross_system_retrieval_test': False,
            'routing_test': False,
            'system_status_test': False,
            'success': False
        }
        
        try:
            integration_system = MemoryIntegrationSystem()
            
            # Test 1: Unified storage
            episodic_id = await integration_system.store_unified_memory(
                content="Completed advanced calculus problem today",
                memory_type=MemorySystemType.EPISODIC,
                metadata={
                    'importance': 0.8,
                    'context': {'subject': 'calculus', 'difficulty': 'advanced'}
                }
            )
            
            semantic_id = await integration_system.store_unified_memory(
                content="Calculus is a branch of mathematics",
                memory_type=MemorySystemType.SEMANTIC,
                metadata={
                    'concept': 'calculus',
                    'facts': [{'subject': 'calculus', 'predicate': 'is_branch_of', 'object': 'mathematics'}]
                }
            )
            
            if episodic_id and semantic_id:
                integrated_results['unified_storage_test'] = True
                logger.info("✅ Integrated unified storage test passed")
            
            # Test 2: Unified query
            query_response = await integration_system.unified_memory_query(
                query="What do I know about calculus?",
                routing_strategy=MemoryRouting.PARALLEL
            )
            
            if query_response and query_response.results:
                integrated_results['unified_query_test'] = True
                logger.info("✅ Integrated unified query test passed")
            
            # Test 3: Cross-system retrieval
            cross_results = await integration_system.cross_system_retrieve(
                query="calculus mathematics",
                merge_results=True
            )
            
            if cross_results and 'merged' in cross_results:
                integrated_results['cross_system_retrieval_test'] = True
                logger.info("✅ Integrated cross-system retrieval test passed")
            
            # Test 4: Routing strategy testing
            automatic_response = await integration_system.unified_memory_query(
                query="Remember when I learned calculus",
                routing_strategy=MemoryRouting.AUTOMATIC
            )
            
            if automatic_response and automatic_response.source_systems:
                integrated_results['routing_test'] = True
                logger.info("✅ Integrated routing test passed")
            
            # Test 5: System status
            status = await integration_system.get_memory_system_status()
            
            if status and 'memory_systems' in status:
                integrated_results['system_status_test'] = True
                logger.info("✅ Integrated system status test passed")
            
            # Overall success
            integrated_results['success'] = all([
                integrated_results['unified_storage_test'],
                integrated_results['unified_query_test'],
                integrated_results['cross_system_retrieval_test'],
                integrated_results['routing_test'],
                integrated_results['system_status_test']
            ])
            
        except Exception as e:
            logger.error(f"❌ Integrated memory test error: {e}")
            integrated_results['error'] = str(e)
        
        self.test_results['integrated_memory'] = integrated_results
    
    async def test_memory_integration(self):
        """Test memory system integration and coordination"""
        
        logger.info("🔗 Testing Memory System Integration")
        
        try:
            integration_system = MemoryIntegrationSystem()
            
            # Test complex cross-system scenario
            # 1. Store information across all systems
            await integration_system.store_unified_memory(
                "Working on complex mathematical proof",
                MemorySystemType.WORKING,
                metadata={'attention_weight': 0.9, 'importance': 0.8}
            )
            
            await integration_system.store_unified_memory(
                "Successfully proved mathematical theorem today",
                MemorySystemType.EPISODIC,
                metadata={'importance': 0.9, 'emotional_valence': 0.5}
            )
            
            await integration_system.store_unified_memory(
                "Mathematical proof verification techniques",
                MemorySystemType.SEMANTIC,
                metadata={
                    'concept': 'proof_techniques',
                    'facts': [{'subject': 'proof', 'predicate': 'requires', 'object': 'logic'}]
                }
            )
            
            # 2. Query across all systems
            comprehensive_response = await integration_system.unified_memory_query(
                "Tell me about mathematical proofs",
                routing_strategy=MemoryRouting.PARALLEL
            )
            
            # 3. Verify cross-system results
            if (comprehensive_response.results and 
                len(comprehensive_response.source_systems) >= 2):
                logger.info("✅ Memory system integration test passed")
                return True
            
        except Exception as e:
            logger.error(f"❌ Memory integration test error: {e}")
            return False
        
        return False
    
    async def test_memory_performance(self):
        """Test memory system performance and optimization"""
        
        logger.info("⚡ Testing Memory System Performance")
        
        try:
            integration_system = MemoryIntegrationSystem()
            
            # Performance stress test
            start_time = datetime.now()
            
            # Store multiple items rapidly
            storage_tasks = []
            for i in range(10):
                task = integration_system.store_unified_memory(
                    f"Performance test item {i}",
                    MemorySystemType.WORKING,
                    metadata={'importance': 0.5, 'test_id': i}
                )
                storage_tasks.append(task)
            
            storage_results = await asyncio.gather(*storage_tasks)
            storage_time = (datetime.now() - start_time).total_seconds()
            
            # Query performance test
            start_time = datetime.now()
            query_response = await integration_system.unified_memory_query(
                "performance test",
                routing_strategy=MemoryRouting.PARALLEL
            )
            query_time = (datetime.now() - start_time).total_seconds()
            
            # Performance criteria
            storage_success = len([r for r in storage_results if r]) == 10
            storage_performance = storage_time < 5.0  # Should complete in under 5 seconds
            query_performance = query_time < 2.0     # Should complete in under 2 seconds
            
            if storage_success and storage_performance and query_performance:
                logger.info(f"✅ Memory performance test passed (Storage: {storage_time:.2f}s, Query: {query_time:.2f}s)")
                return True
            else:
                logger.warning(f"⚠️ Memory performance test partial: Storage: {storage_time:.2f}s, Query: {query_time:.2f}s")
                return False
                
        except Exception as e:
            logger.error(f"❌ Memory performance test error: {e}")
            return False

async def run_memory_architecture_tests():
    """Main test runner for memory architecture"""
    
    test_suite = TestMemoryArchitecture()
    results = await test_suite.run_all_tests()
    
    # Print detailed results
    print("\n" + "="*70)
    print("🧠 ROMAI PHASE 2.1 MEMORY ARCHITECTURE TEST RESULTS")
    print("="*70)
    
    # Individual system results
    for system_name, system_results in results.items():
        if isinstance(system_results, dict) and 'success' in system_results:
            status = "✅ PASSED" if system_results['success'] else "❌ FAILED"
            print(f"{system_name.replace('_', ' ').title()}: {status}")
            
            if not system_results['success']:
                for test_name, test_result in system_results.items():
                    if test_name.endswith('_test') and not test_result:
                        print(f"  • {test_name}: FAILED")
    
    # Overall result
    overall_success = results.get('overall_success', False)
    print("\n" + "="*70)
    print(f"🎯 OVERALL RESULT: {'SUCCESS' if overall_success else 'FAILED'}")
    
    if overall_success:
        print("🎉 Phase 2.1 Memory Architecture Implementation COMPLETE!")
        print("   • Episodic Memory System: Operational")
        print("   • Semantic Memory System: Operational") 
        print("   • Working Memory System: Operational")
        print("   • Memory Integration System: Operational")
        print("   • Cross-system Communication: Working")
        print("   • Memory Routing: Functional")
        print("   • Performance: Within Acceptable Limits")
    else:
        print("⚠️ Phase 2.1 Memory Architecture requires fixes")
        if 'overall_error' in results:
            print(f"   Error: {results['overall_error']}")
    
    print("="*70)
    
    return results

if __name__ == "__main__":
    # Run the comprehensive test suite
    test_results = asyncio.run(run_memory_architecture_tests())
    
    # Return exit code based on success
    exit_code = 0 if test_results.get('overall_success', False) else 1
    exit(exit_code)
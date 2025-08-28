"""
RomAI AGI Evolution Phase 2 - External Knowledge Integration System

Main orchestrator that integrates all knowledge components into a unified
real-time knowledge processing pipeline with AGI system integration.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union
from dataclasses import dataclass
import threading
import time

# Import all knowledge components
from .knowledge_types import (
    KnowledgeType, SourceType, CredibilityLevel, KnowledgeStatus,
    KnowledgeSource, KnowledgeItem, KnowledgeQuery, KnowledgeResponse,
    create_knowledge_item, create_knowledge_source
)
from .knowledge_retriever import KnowledgeRetriever
from .fact_checker import FactChecker  
from .knowledge_updater import KnowledgeUpdater

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# INTEGRATION CONFIGURATIONS
# ============================================================================

@dataclass
class KnowledgeIntegrationConfig:
    """Configuration for knowledge integration system"""
    
    # Processing settings
    real_time_processing: bool = True
    batch_processing_interval: int = 300  # 5 minutes
    max_concurrent_queries: int = 10
    query_timeout: int = 30
    
    # Quality thresholds
    minimum_confidence: float = 0.3
    minimum_credibility: int = 2  # MEDIUM credibility
    fact_check_threshold: float = 0.5
    
    # Knowledge base settings
    auto_cleanup_enabled: bool = True
    cleanup_interval_hours: int = 24
    max_knowledge_age_days: int = 365
    max_knowledge_items: int = 100000
    
    # Integration settings
    enable_agi_integration: bool = True
    enable_tool_integration: bool = True
    enable_planning_integration: bool = True
    
    # Caching settings
    enable_response_caching: bool = True
    cache_duration_hours: int = 6
    max_cache_size: int = 1000

# ============================================================================
# EXTERNAL KNOWLEDGE INTEGRATION SYSTEM
# ============================================================================

class ExternalKnowledgeIntegrationSystem:
    """
    Unified external knowledge integration system that orchestrates
    retrieval, verification, storage, and real-time knowledge processing
    """
    
    def __init__(self, config: KnowledgeIntegrationConfig = None):
        self.config = config or KnowledgeIntegrationConfig()
        
        # Initialize components
        self.retriever = KnowledgeRetriever()
        self.fact_checker = FactChecker()
        self.knowledge_updater = KnowledgeUpdater()
        
        # Processing state
        self.is_running = False
        self.processing_queue: asyncio.Queue = asyncio.Queue()
        self.response_cache: Dict[str, Tuple[KnowledgeResponse, datetime]] = {}
        
        # Performance tracking
        self.performance_metrics = {
            "queries_processed": 0,
            "knowledge_items_added": 0,
            "facts_verified": 0,
            "conflicts_resolved": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "average_response_time": 0.0,
            "error_count": 0
        }
        
        # Background tasks
        self.background_tasks: Set[asyncio.Task] = set()
        
        logger.info("🧠 External Knowledge Integration System initialized")
    
    async def start(self):
        """Start the knowledge integration system"""
        if self.is_running:
            logger.warning("System is already running")
            return
        
        logger.info("🚀 Starting External Knowledge Integration System")
        self.is_running = True
        
        # Start background processing
        if self.config.real_time_processing:
            task = asyncio.create_task(self._real_time_processor())
            self.background_tasks.add(task)
        
        # Start periodic cleanup
        if self.config.auto_cleanup_enabled:
            task = asyncio.create_task(self._periodic_cleanup())
            self.background_tasks.add(task)
        
        # Start cache cleanup
        if self.config.enable_response_caching:
            task = asyncio.create_task(self._cache_cleanup())
            self.background_tasks.add(task)
        
        logger.info("✅ External Knowledge Integration System started")
    
    async def stop(self):
        """Stop the knowledge integration system"""
        if not self.is_running:
            return
        
        logger.info("⏹️ Stopping External Knowledge Integration System")
        self.is_running = False
        
        # Cancel background tasks
        for task in self.background_tasks:
            task.cancel()
        
        # Wait for tasks to complete
        await asyncio.gather(*self.background_tasks, return_exceptions=True)
        self.background_tasks.clear()
        
        logger.info("✅ External Knowledge Integration System stopped")
    
    async def process_knowledge_query(self, query: KnowledgeQuery) -> KnowledgeResponse:
        """
        Main entry point for processing knowledge queries
        Integrates retrieval, verification, and storage
        """
        start_time = time.time()
        
        try:
            logger.info(f"🔍 Processing knowledge query: {query.query_text[:100]}...")
            
            # Check cache first
            if self.config.enable_response_caching:
                cached_response = self._get_cached_response(query)
                if cached_response:
                    self.performance_metrics["cache_hits"] += 1
                    logger.info("💾 Returning cached response")
                    return cached_response
                else:
                    self.performance_metrics["cache_misses"] += 1
            
            # Step 1: Retrieve knowledge from external sources
            logger.debug("📡 Retrieving external knowledge...")
            retrieved_items = await self.retriever.retrieve_knowledge(query)
            
            if not retrieved_items:
                response = KnowledgeResponse(
                    query_id=query.id,
                    items=[],
                    total_found=0,
                    search_time=time.time() - start_time,
                    sources_consulted=set(),
                    warnings=["no_results"]
                )
                return response
            
            # Step 2: Fact-check retrieved knowledge
            logger.debug("🔍 Fact-checking retrieved knowledge...")
            verified_items = []
            
            for item in retrieved_items:
                # Ensure confidence_score is float for comparison
                item_confidence = float(item.confidence_score) if item.confidence_score is not None else 0.0
                min_confidence = float(self.config.minimum_confidence) if self.config.minimum_confidence is not None else 0.3
                
                if item_confidence >= min_confidence:
                    verification_result = await self.fact_checker.verify_fact(
                        item.content, item.type
                    )
                    
                    # Ensure verification confidence is float
                    verification_confidence = float(verification_result.confidence_score) if verification_result.confidence_score is not None else 0.0
                    fact_check_threshold = float(self.config.fact_check_threshold) if self.config.fact_check_threshold is not None else 0.5
                    
                    if verification_confidence >= fact_check_threshold:
                        item.confidence_score = (
                            item_confidence * 0.7 + verification_confidence * 0.3
                        )
                        verified_items.append(item)
                        self.performance_metrics["facts_verified"] += 1
            
            # Step 3: Store high-quality knowledge
            logger.debug("💾 Storing verified knowledge...")
            stored_items = []
            
            for item in verified_items:
                # Ensure confidence_score and credibility are properly typed for comparison
                item_confidence = float(item.confidence_score) if item.confidence_score is not None else 0.0
                min_confidence = float(self.config.minimum_confidence) if self.config.minimum_confidence is not None else 0.3
                
                # Convert CredibilityLevel to numerical score for comparison
                credibility_mapping = {
                    CredibilityLevel.HIGH: 0.9,
                    CredibilityLevel.MEDIUM: 0.7,
                    CredibilityLevel.LOW: 0.3,
                    CredibilityLevel.UNKNOWN: 0.5,
                    CredibilityLevel.CONFLICTING: 0.1
                }
                item_credibility = credibility_mapping.get(item.source.credibility, 0.5) if hasattr(item.source, 'credibility') else 0.5
                min_credibility = float(self.config.minimum_credibility) if self.config.minimum_credibility is not None else 0.3
                
                if (item_confidence >= min_confidence and
                    item_credibility >= min_credibility):
                    
                    success = await self.knowledge_updater.add_knowledge(item)
                    if success:
                        stored_items.append(item)
                        self.performance_metrics["knowledge_items_added"] += 1
            
            # Step 4: Build response
            processing_time = time.time() - start_time
            sources_consulted = list(set(item.source.name for item in retrieved_items))
            
            response = KnowledgeResponse(
                query_id=query.id,
                items=stored_items,
                total_found=len(stored_items),
                average_confidence=sum(item.confidence_score for item in stored_items) / len(stored_items) if stored_items else 0.0,
                search_time=processing_time,
                sources_consulted=sources_consulted,
                warnings=[] if stored_items else ["no_verified_results"]
            )
            
            # Cache the response
            if self.config.enable_response_caching:
                self._cache_response(query, response)
            
            # Update metrics
            self.performance_metrics["queries_processed"] += 1
            self.performance_metrics["average_response_time"] = (
                (self.performance_metrics["average_response_time"] * (self.performance_metrics["queries_processed"] - 1) + processing_time) /
                self.performance_metrics["queries_processed"]
            )
            
            logger.info(f"✅ Query processed: {len(stored_items)} items, {processing_time:.2f}s")
            return response
            
        except Exception as e:
            self.performance_metrics["error_count"] += 1
            logger.error(f"❌ Query processing failed: {e}")
            
            # Return error response
            return KnowledgeResponse(
                query_id=query.id,
                items=[],
                total_found=0,
                average_confidence=0.0,
                search_time=time.time() - start_time,
                sources_consulted=set(),
                errors=[str(e)]
            )
    
    async def batch_process_queries(self, queries: List[KnowledgeQuery]) -> List[KnowledgeResponse]:
        """Process multiple queries in batch for efficiency"""
        logger.info(f"📦 Processing batch of {len(queries)} queries")
        
        # Limit concurrent processing
        semaphore = asyncio.Semaphore(self.config.max_concurrent_queries)
        
        async def process_with_semaphore(query):
            async with semaphore:
                return await self.process_knowledge_query(query)
        
        tasks = [process_with_semaphore(query) for query in queries]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        valid_responses = []
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                logger.error(f"Batch query {i} failed: {response}")
                # Create error response
                valid_responses.append(KnowledgeResponse(
                    query_id=queries[i].id,
                    items=[],
                    total_found=0,
                    average_confidence=0.0,
                    search_time=0.0,
                    sources_consulted=set(),
                    errors=[str(response)]
                ))
            else:
                valid_responses.append(response)
        
        logger.info(f"✅ Batch processing completed: {len(valid_responses)} responses")
        return valid_responses
    
    async def get_knowledge_insights(self) -> Dict[str, Any]:
        """Get comprehensive insights about the knowledge system"""
        try:
            # Get knowledge base statistics
            kb_stats = await self.knowledge_updater.get_knowledge_statistics()
            
            # Get retriever statistics (if available)
            retriever_stats = getattr(self.retriever, 'get_statistics', lambda: {})()
            
            # Get fact checker statistics (if available)  
            fact_checker_stats = getattr(self.fact_checker, 'get_statistics', lambda: {})()
            
            insights = {
                "system_status": {
                    "is_running": self.is_running,
                    "background_tasks": len(self.background_tasks),
                    "queue_size": self.processing_queue.qsize(),
                    "cache_size": len(self.response_cache)
                },
                "performance_metrics": self.performance_metrics.copy(),
                "knowledge_base": kb_stats,
                "retrieval_system": retriever_stats,
                "fact_checking": fact_checker_stats,
                "quality_metrics": {
                    "average_confidence": kb_stats.get("total_items", 0) and 
                                        sum(item.confidence_score for item in self.knowledge_updater.knowledge_items.values()) / 
                                        len(self.knowledge_updater.knowledge_items) or 0.0,
                    "verification_rate": (
                        self.performance_metrics["facts_verified"] / 
                        max(self.performance_metrics["queries_processed"], 1)
                    ),
                    "error_rate": (
                        self.performance_metrics["error_count"] / 
                        max(self.performance_metrics["queries_processed"], 1)
                    )
                },
                "timestamp": datetime.now().isoformat()
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to generate insights: {e}")
            return {"error": str(e), "timestamp": datetime.now().isoformat()}
    
    async def optimize_performance(self):
        """Optimize system performance based on current metrics"""
        try:
            logger.info("🔧 Optimizing system performance...")
            
            insights = await self.get_knowledge_insights()
            performance = insights["performance_metrics"]
            
            # Adjust cache size based on hit rate
            cache_hit_rate = performance["cache_hits"] / max(
                performance["cache_hits"] + performance["cache_misses"], 1
            )
            
            if cache_hit_rate < 0.3:  # Low hit rate
                self.config.cache_duration_hours = min(24, self.config.cache_duration_hours * 1.5)
                logger.info(f"📈 Increased cache duration to {self.config.cache_duration_hours}h")
            elif cache_hit_rate > 0.8:  # High hit rate
                self.config.cache_duration_hours = max(1, self.config.cache_duration_hours * 0.8)
                logger.info(f"📉 Decreased cache duration to {self.config.cache_duration_hours}h")
            
            # Adjust quality thresholds based on error rate
            error_rate = performance["error_count"] / max(performance["queries_processed"], 1)
            
            if error_rate > 0.1:  # High error rate
                self.config.minimum_confidence = min(0.8, self.config.minimum_confidence + 0.1)
                self.config.fact_check_threshold = min(0.8, self.config.fact_check_threshold + 0.1)
                logger.info("📈 Increased quality thresholds due to high error rate")
            
            # Clean up old cache entries
            await self._cleanup_cache()
            
            logger.info("✅ Performance optimization completed")
            
        except Exception as e:
            logger.error(f"Performance optimization failed: {e}")
    
    # Integration methods for AGI system
    async def integrate_with_agi_system(self, agi_system):
        """Integrate with the main AGI system"""
        if not self.config.enable_agi_integration:
            return
        
        logger.info("🤖 Integrating with AGI system...")
        
        try:
            # Register knowledge query capability
            if hasattr(agi_system, 'register_capability'):
                await agi_system.register_capability(
                    'external_knowledge_query',
                    self.process_knowledge_query
                )
            
            # Register knowledge insights
            if hasattr(agi_system, 'register_insight_provider'):
                await agi_system.register_insight_provider(
                    'knowledge_system',
                    self.get_knowledge_insights
                )
            
            logger.info("✅ AGI system integration completed")
            
        except Exception as e:
            logger.error(f"AGI integration failed: {e}")
    
    async def integrate_with_tool_system(self, tool_system):
        """Integrate with the advanced tool use system"""
        if not self.config.enable_tool_integration:
            return
        
        logger.info("🛠️ Integrating with tool system...")
        
        try:
            # Register knowledge tools
            if hasattr(tool_system, 'register_tool'):
                await tool_system.register_tool(
                    'knowledge_query',
                    self._create_knowledge_query_tool()
                )
                
                await tool_system.register_tool(
                    'fact_check',
                    self._create_fact_check_tool()
                )
            
            logger.info("✅ Tool system integration completed")
            
        except Exception as e:
            logger.error(f"Tool integration failed: {e}")
    
    async def integrate_with_planning_system(self, planning_system):
        """Integrate with the enhanced planning system"""
        if not self.config.enable_planning_integration:
            return
        
        logger.info("📋 Integrating with planning system...")
        
        try:
            # Register knowledge constraints
            if hasattr(planning_system, 'register_constraint_provider'):
                await planning_system.register_constraint_provider(
                    'knowledge_constraints',
                    self._provide_knowledge_constraints
                )
            
            # Register knowledge-based goal enrichment
            if hasattr(planning_system, 'register_goal_enricher'):
                await planning_system.register_goal_enricher(
                    'knowledge_enricher',
                    self._enrich_goals_with_knowledge
                )
            
            logger.info("✅ Planning system integration completed")
            
        except Exception as e:
            logger.error(f"Planning integration failed: {e}")
    
    # Private methods
    async def _real_time_processor(self):
        """Background task for real-time query processing"""
        while self.is_running:
            try:
                # Process queued queries
                if not self.processing_queue.empty():
                    query = await asyncio.wait_for(
                        self.processing_queue.get(), 
                        timeout=1.0
                    )
                    await self.process_knowledge_query(query)
                else:
                    await asyncio.sleep(0.1)
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Real-time processor error: {e}")
                await asyncio.sleep(1)
    
    async def _periodic_cleanup(self):
        """Background task for periodic system cleanup"""
        while self.is_running:
            try:
                await asyncio.sleep(self.config.cleanup_interval_hours * 3600)
                
                if not self.is_running:
                    break
                
                logger.info("🧹 Running periodic cleanup...")
                
                # Clean up old knowledge
                removed_items = await self.knowledge_updater.cleanup_outdated_knowledge(
                    self.config.max_knowledge_age_days
                )
                
                # Clean up cache
                await self._cleanup_cache()
                
                logger.info(f"✅ Cleanup completed: {removed_items} items removed")
                
            except Exception as e:
                logger.error(f"Periodic cleanup error: {e}")
    
    async def _cache_cleanup(self):
        """Background task for cache cleanup"""
        while self.is_running:
            try:
                await asyncio.sleep(3600)  # Run every hour
                await self._cleanup_cache()
            except Exception as e:
                logger.error(f"Cache cleanup error: {e}")
    
    def _get_cached_response(self, query: KnowledgeQuery) -> Optional[KnowledgeResponse]:
        """Get cached response for query"""
        cache_key = self._generate_cache_key(query)
        
        if cache_key in self.response_cache:
            response, timestamp = self.response_cache[cache_key]
            
            # Check if cache is still valid
            if datetime.now() - timestamp < timedelta(hours=self.config.cache_duration_hours):
                return response
            else:
                # Remove expired cache entry
                del self.response_cache[cache_key]
        
        return None
    
    def _cache_response(self, query: KnowledgeQuery, response: KnowledgeResponse):
        """Cache a query response"""
        if len(self.response_cache) >= self.config.max_cache_size:
            # Remove oldest cache entry
            oldest_key = min(
                self.response_cache.keys(),
                key=lambda k: self.response_cache[k][1]
            )
            del self.response_cache[oldest_key]
        
        cache_key = self._generate_cache_key(query)
        self.response_cache[cache_key] = (response, datetime.now())
    
    def _generate_cache_key(self, query: KnowledgeQuery) -> str:
        """Generate cache key for query"""
        import hashlib
        
        key_data = f"{query.query_text}_{query.knowledge_types}_{query.max_results}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def _cleanup_cache(self):
        """Clean up expired cache entries"""
        current_time = datetime.now()
        expired_keys = []
        
        for key, (response, timestamp) in self.response_cache.items():
            if current_time - timestamp >= timedelta(hours=self.config.cache_duration_hours):
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.response_cache[key]
        
        if expired_keys:
            logger.debug(f"🧹 Cleaned up {len(expired_keys)} expired cache entries")
    
    def _create_knowledge_query_tool(self):
        """Create knowledge query tool for tool system"""
        async def knowledge_query_tool(query_text: str, knowledge_types: List[str] = None):
            from .knowledge_types import KnowledgeQuery
            
            query = KnowledgeQuery(
                id=f"query_{int(time.time()*1000)}",
                query_text=query_text,
                knowledge_types=[KnowledgeType(kt) for kt in (knowledge_types or ["factual"])]
            )
            return await self.process_knowledge_query(query)
        
        return knowledge_query_tool
    
    def _create_fact_check_tool(self):
        """Create fact checking tool for tool system"""
        async def fact_check_tool(statement: str, knowledge_type: str = "factual"):
            return await self.fact_checker.verify_fact(statement, KnowledgeType(knowledge_type))
        
        return fact_check_tool
    
    async def _provide_knowledge_constraints(self, goal: str) -> List[Dict[str, Any]]:
        """Provide knowledge-based constraints for planning"""
        # Query knowledge base for relevant constraints
        from .knowledge_types import KnowledgeQuery
        
        query = KnowledgeQuery(
            id=f"constraints_{int(time.time()*1000)}",
            query_text=f"constraints limitations {goal}",
            knowledge_types=[KnowledgeType.FACTUAL, KnowledgeType.PROCEDURAL]
        )
        
        response = await self.process_knowledge_query(query)
        
        constraints = []
        for item in response.items:
            if "constraint" in item.content.lower() or "limitation" in item.content.lower():
                constraints.append({
                    "type": "knowledge_constraint",
                    "description": item.content,
                    "confidence": item.confidence_score,
                    "source": item.source.name
                })
        
        return constraints
    
    async def _enrich_goals_with_knowledge(self, goal: str) -> Dict[str, Any]:
        """Enrich goals with relevant knowledge"""
        from .knowledge_types import KnowledgeQuery
        
        query = KnowledgeQuery(
            id=f"goal_enrich_{int(time.time()*1000)}",
            query_text=goal,
            knowledge_types=[KnowledgeType.FACTUAL, KnowledgeType.PROCEDURAL, KnowledgeType.CONTEXTUAL]
        )
        
        response = await self.process_knowledge_query(query)
        
        return {
            "enriched_goal": goal,
            "relevant_knowledge": [
                {
                    "content": item.content,
                    "confidence": item.confidence_score,
                    "source": item.source.name,
                    "type": item.type.value
                }
                for item in response.items[:5]  # Top 5 most relevant
            ],
            "knowledge_confidence": response.confidence_score
        }

    async def query_knowledge_unified(self, query_text: str, context: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """Unified knowledge query interface for system integration
        
        Args:
            query_text: The query text to process
            context: Optional context information for the query
            **kwargs: Additional query parameters
        
        Returns:
            Dict containing query results and metadata
        """
        from .knowledge_types import KnowledgeQuery, KnowledgeType
        
        try:
            # Parse query parameters
            knowledge_types = kwargs.get('knowledge_types', [KnowledgeType.FACTUAL])
            max_results = kwargs.get('max_results', 10)
            confidence_threshold = kwargs.get('confidence_threshold', 0.3)
            
            # Create knowledge query  
            query = KnowledgeQuery(
                id=f"unified_{int(time.time()*1000)}",
                query_text=query_text,
                knowledge_types=knowledge_types,
                max_results=max_results,
                min_confidence=confidence_threshold
            )
            
            # Process the query
            response = await self.process_knowledge_query(query)
            
            # Return unified format
            return {
                "success": True,
                "query": query_text,
                "results": [
                    {
                        "content": item.content,
                        "confidence": item.confidence_score,
                        "source": item.source.name,
                        "type": item.type.value,
                        "relevance": item.relevance_score
                    }
                    for item in response.items
                ],
                "total_found": response.total_found,
                "average_confidence": response.average_confidence,
                "search_time": response.search_time,
                "sources_consulted": list(response.sources_consulted),
                "timestamp": response.timestamp.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Unified knowledge query failed: {e}")
            return {
                "success": False,
                "query": query_text,
                "error": str(e),
                "results": [],
                "total_found": 0,
                "average_confidence": 0.0
            }

# ============================================================================
# TESTING
# ============================================================================

async def test_external_knowledge_integration():
    """Test the complete External Knowledge Integration System"""
    print("🧠 Testing RomAI External Knowledge Integration System")
    print("=" * 55)
    
    try:
        # Initialize system
        config = KnowledgeIntegrationConfig(
            real_time_processing=False,  # Disable for testing
            enable_response_caching=True,
            minimum_confidence=0.5
        )
        
        system = ExternalKnowledgeIntegrationSystem(config)
        await system.start()
        
        # Test 1: Single query processing
        print("\n📋 Test 1: Single Query Processing")
        
        from .knowledge_types import KnowledgeQuery, KnowledgeType
        
        query = KnowledgeQuery(
            id=f"test_basic_{int(time.time()*1000)}",
            query_text="What is the capital of France?",
            knowledge_types=[KnowledgeType.FACTUAL],
            max_results=5,
            min_confidence=0.5
        )
        
        response = await system.process_knowledge_query(query)
        
        print(f"✅ Query processed:")
        print(f"  • Results: {response.total_found}")
        print(f"  • Confidence: {response.average_confidence:.2f}")
        print(f"  • Processing time: {response.search_time:.2f}s")
        print(f"  • Sources: {', '.join(list(response.sources_consulted)[:3])}")
        
        # Test 2: Batch processing
        print("\n📦 Test 2: Batch Query Processing")
        
        queries = [
            KnowledgeQuery(
                id=f"test_speed_{int(time.time()*1000)}",
                query_text="What is the speed of light?",
                knowledge_types=[KnowledgeType.FACTUAL]
            ),
            KnowledgeQuery(
                id=f"test_sandwich_{int(time.time()*1000)}",
                query_text="How do you make a sandwich?",
                knowledge_types=[KnowledgeType.PROCEDURAL]
            )
        ]
        
        responses = await system.batch_process_queries(queries)
        print(f"✅ Batch processing completed: {len(responses)} responses")
        
        for i, resp in enumerate(responses):
            print(f"  • Query {i+1}: {resp.total_found} results, {resp.average_confidence:.2f} confidence")
        
        # Test 3: System insights
        print("\n📊 Test 3: System Insights")
        
        insights = await system.get_knowledge_insights()
        
        print(f"✅ System insights:")
        print(f"  • Status: {'Running' if insights['system_status']['is_running'] else 'Stopped'}")
        print(f"  • Queries processed: {insights['performance_metrics']['queries_processed']}")
        print(f"  • Knowledge items added: {insights['performance_metrics']['knowledge_items_added']}")
        print(f"  • Facts verified: {insights['performance_metrics']['facts_verified']}")
        print(f"  • Average response time: {insights['performance_metrics']['average_response_time']:.2f}s")
        print(f"  • Cache hit rate: {insights['performance_metrics']['cache_hits'] / max(insights['performance_metrics']['cache_hits'] + insights['performance_metrics']['cache_misses'], 1):.2f}")
        
        # Test 4: Performance optimization
        print("\n🔧 Test 4: Performance Optimization")
        
        await system.optimize_performance()
        print("✅ Performance optimization completed")
        
        # Test 5: Integration capabilities
        print("\n🔗 Test 5: Integration Capabilities")
        
        # Mock AGI system
        class MockAGISystem:
            def __init__(self):
                self.capabilities = {}
                self.insight_providers = {}
            
            async def register_capability(self, name, func):
                self.capabilities[name] = func
            
            async def register_insight_provider(self, name, func):
                self.insight_providers[name] = func
        
        mock_agi = MockAGISystem()
        await system.integrate_with_agi_system(mock_agi)
        
        print(f"✅ AGI integration:")
        print(f"  • Capabilities registered: {len(mock_agi.capabilities)}")
        print(f"  • Insight providers: {len(mock_agi.insight_providers)}")
        
        # Cleanup
        await system.stop()
        
        print("\n🎉 External Knowledge Integration System test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ External Knowledge Integration System test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ External Knowledge Integration System module loaded - Real-time knowledge processing ready!")

if __name__ == "__main__":
    asyncio.run(test_external_knowledge_integration())
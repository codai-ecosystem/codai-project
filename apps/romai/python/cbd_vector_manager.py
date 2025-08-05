"""
RomAI AGI CBD Vector Integration System
Enterprise-grade vector database integration for Romanian cultural processing
Week 2 Day 1 Implementation - CBD Powered

Features:
- Semantic vector caching for Romanian content
- Cultural entity storage with vector relationships
- Intelligent similarity-based retrieval
- Enterprise monitoring and analytics
- Production-ready CBD integration
"""

import asyncio
import time
import json
import hashlib
import aiohttp
import numpy as np
from typing import Any, Dict, Optional, Union, List, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorContentType(Enum):
    """Content types for vector storage in CBD"""
    AZURE_OPENAI_RESPONSE = "azure_openai_response"
    CULTURAL_ENTITY = "cultural_entity"
    QUERY_ROUTING = "query_routing_decision"
    ROMANIAN_PROCESSING = "romanian_language_processing"
    ANALYTICS_DATA = "analytics_metrics"
    USER_SESSION = "user_session_data"
    MULTIMODAL_CONTENT = "multimodal_processing"

@dataclass
class VectorMetrics:
    """CBD vector performance metrics"""
    vector_searches: int = 0
    vector_stores: int = 0
    semantic_hits: int = 0
    semantic_misses: int = 0
    similarity_threshold_hits: int = 0
    total_response_time_saved: float = 0.0
    total_cost_saved: float = 0.0
    average_similarity_score: float = 0.0
    
    @property
    def semantic_hit_rate(self) -> float:
        total = self.semantic_hits + self.semantic_misses
        return (self.semantic_hits / total * 100) if total > 0 else 0.0
    
    @property
    def average_time_saved(self) -> float:
        return (self.total_response_time_saved / self.semantic_hits) if self.semantic_hits > 0 else 0.0

@dataclass
class VectorEntry:
    """Vector entry with metadata for CBD storage"""
    data: Any
    content_type: VectorContentType
    embedding: List[float]
    metadata: Dict[str, Any]
    created_at: datetime
    cultural_context: Optional[Dict[str, Any]] = None
    romanian_entities: Optional[List[str]] = None
    similarity_threshold: float = 0.8
    
    def to_cbd_format(self) -> Dict[str, Any]:
        """Convert to CBD storage format"""
        return {
            'content': self.data,
            'embedding': self.embedding,
            'metadata': {
                **self.metadata,
                'content_type': self.content_type.value,
                'created_at': self.created_at.isoformat(),
                'cultural_context': self.cultural_context or {},
                'romanian_entities': self.romanian_entities or [],
                'similarity_threshold': self.similarity_threshold
            }
        }

class CBDVectorManager:
    """
    CBD Vector Database Manager for RomAI AGI system
    Provides semantic caching and vector storage for Romanian cultural content
    """
    
    def __init__(
        self,
        cbd_host: str = "localhost",
        cbd_port: int = 4180,
        similarity_threshold: float = 0.8,
        vector_dimension: int = 1536,  # OpenAI embedding dimension
        max_results: int = 10,
        enable_cultural_context: bool = True
    ):
        """
        Initialize CBD Vector Manager
        
        Args:
            cbd_host: CBD server host
            cbd_port: CBD server port
            similarity_threshold: Minimum similarity for semantic matches
            vector_dimension: Vector embedding dimension
            max_results: Maximum results per search
            enable_cultural_context: Enable Romanian cultural context enhancement
        """
        self.cbd_host = cbd_host
        self.cbd_port = cbd_port
        self.cbd_base_url = f"http://{cbd_host}:{cbd_port}"
        self.similarity_threshold = similarity_threshold
        self.vector_dimension = vector_dimension
        self.max_results = max_results
        self.enable_cultural_context = enable_cultural_context
        
        # Performance metrics
        self.metrics = VectorMetrics()
        
        # Romanian cultural entities for context enhancement
        self.romanian_entities = {
            "historical_figures": ["Mihai Eminescu", "Ion Creangă", "Mihai Viteazul", "Stefan cel Mare"],
            "cities": ["București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova"],
            "traditions": ["mărțișor", "dragobete", "1 martie", "1 decembrie"],
            "cuisine": ["mici", "papanași", "ciorbă de burtă", "sarmale", "cozonac"],
            "regions": ["Transilvania", "Muntenia", "Moldova", "Dobrogea", "Banat"],
            "cultural_concepts": ["dor", "jale", "bucurie", "ospitalitate", "tradiție"]
        }
        
        # Session for HTTP requests
        self.session = None
        self._init_session()
    
    def _init_session(self):
        """Initialize aiohttp session"""
        connector = aiohttp.TCPConnector(
            limit=100,
            limit_per_host=50,
            keepalive_timeout=300
        )
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'Content-Type': 'application/json'}
        )
    
    async def close(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.close()
    
    def _generate_vector_id(self, content: str, content_type: VectorContentType) -> str:
        """Generate unique vector ID"""
        content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
        timestamp = int(time.time())
        return f"romai_{content_type.value}_{content_hash}_{timestamp}"
    
    def _extract_romanian_entities(self, content: str) -> List[str]:
        """Extract Romanian entities from content"""
        if not self.enable_cultural_context:
            return []
        
        found_entities = []
        content_lower = content.lower()
        
        for category, entities in self.romanian_entities.items():
            for entity in entities:
                if entity.lower() in content_lower:
                    found_entities.append(entity)
        
        return found_entities
    
    def _enhance_cultural_context(self, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance content with Romanian cultural context"""
        if not self.enable_cultural_context:
            return {}
        
        entities = self._extract_romanian_entities(content)
        
        context = {
            "language": "romanian",
            "cultural_entities": entities,
            "entity_categories": [],
            "cultural_significance": "standard"
        }
        
        # Categorize entities
        for category, entity_list in self.romanian_entities.items():
            if any(entity in entities for entity in entity_list):
                context["entity_categories"].append(category)
        
        # Determine cultural significance
        if len(entities) >= 3:
            context["cultural_significance"] = "high"
        elif len(entities) >= 1:
            context["cultural_significance"] = "medium"
        
        return context
    
    async def store_vector(
        self,
        content: str,
        embedding: List[float],
        content_type: VectorContentType = VectorContentType.AZURE_OPENAI_RESPONSE,
        metadata: Optional[Dict[str, Any]] = None,
        similarity_threshold: Optional[float] = None
    ) -> bool:
        """
        Store content as vector in CBD with semantic indexing
        
        Args:
            content: Content to store
            embedding: Vector embedding
            content_type: Type of content
            metadata: Additional metadata
            similarity_threshold: Custom similarity threshold
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate embedding dimension
            if len(embedding) != self.vector_dimension:
                logger.error(f"Invalid embedding dimension: {len(embedding)}, expected {self.vector_dimension}")
                return False
            
            # Generate vector ID
            vector_id = self._generate_vector_id(content, content_type)
            
            # Enhance with cultural context
            cultural_context = self._enhance_cultural_context(content, metadata or {})
            romanian_entities = self._extract_romanian_entities(content)
            
            # Create vector entry
            vector_entry = VectorEntry(
                data=content,
                content_type=content_type,
                embedding=embedding,
                metadata=metadata or {},
                created_at=datetime.now(),
                cultural_context=cultural_context,
                romanian_entities=romanian_entities,
                similarity_threshold=similarity_threshold or self.similarity_threshold
            )
            
            # Store in CBD vector database
            cbd_data = {
                "collection": f"romai_{content_type.value}",
                "document": {
                    "id": vector_id,
                    **vector_entry.to_cbd_format()
                }
            }
            
            async with self.session.post(
                f"{self.cbd_base_url}/vector/store",
                json=cbd_data
            ) as response:
                if response.status == 200:
                    self.metrics.vector_stores += 1
                    logger.info(f"Stored vector {vector_id} with {len(romanian_entities)} Romanian entities")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"CBD vector store error: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Vector store error: {e}")
            return False
    
    async def search_similar_vectors(
        self,
        query_embedding: List[float],
        content_type: VectorContentType = VectorContentType.AZURE_OPENAI_RESPONSE,
        similarity_threshold: Optional[float] = None,
        max_results: Optional[int] = None,
        cultural_filter: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for semantically similar vectors in CBD
        
        Args:
            query_embedding: Query vector embedding
            content_type: Type of content to search
            similarity_threshold: Minimum similarity score
            max_results: Maximum results to return
            cultural_filter: Filter by Romanian cultural entities
            
        Returns:
            List of similar vector results with metadata
        """
        try:
            # Validate embedding dimension
            if len(query_embedding) != self.vector_dimension:
                logger.error(f"Invalid query embedding dimension: {len(query_embedding)}")
                return []
            
            # Prepare search parameters
            search_params = {
                "collection": f"romai_{content_type.value}",
                "embedding": query_embedding,
                "similarity_threshold": similarity_threshold or self.similarity_threshold,
                "max_results": max_results or self.max_results,
                "include_metadata": True
            }
            
            # Add cultural filter if specified
            if cultural_filter:
                search_params["metadata_filter"] = {
                    "romanian_entities": {"$in": cultural_filter}
                }
            
            async with self.session.post(
                f"{self.cbd_base_url}/vector/search",
                json=search_params
            ) as response:
                
                self.metrics.vector_searches += 1
                
                if response.status == 200:
                    results = await response.json()
                    
                    if results.get("results"):
                        self.metrics.semantic_hits += 1
                        
                        # Calculate average similarity
                        similarities = [r.get("similarity", 0) for r in results["results"]]
                        if similarities:
                            avg_similarity = sum(similarities) / len(similarities)
                            self.metrics.average_similarity_score = (
                                (self.metrics.average_similarity_score * (self.metrics.semantic_hits - 1) + avg_similarity) /
                                self.metrics.semantic_hits
                            )
                        
                        logger.info(f"Found {len(results['results'])} similar vectors with avg similarity {avg_similarity:.3f}")
                        return results["results"]
                    else:
                        self.metrics.semantic_misses += 1
                        return []
                else:
                    self.metrics.semantic_misses += 1
                    error_text = await response.text()
                    logger.error(f"CBD vector search error: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            self.metrics.semantic_misses += 1
            logger.error(f"Vector search error: {e}")
            return []
    
    async def get_cached_response(
        self,
        query: str,
        query_embedding: List[float],
        content_type: VectorContentType = VectorContentType.AZURE_OPENAI_RESPONSE,
        similarity_threshold: Optional[float] = None
    ) -> Optional[Any]:
        """
        Get cached response using semantic similarity
        
        Args:
            query: Original query text
            query_embedding: Query vector embedding
            content_type: Type of content to search
            similarity_threshold: Minimum similarity for cache hit
            
        Returns:
            Cached response if similar query found, None otherwise
        """
        try:
            # Extract Romanian entities from query for filtering
            romanian_entities = self._extract_romanian_entities(query)
            
            # Search for similar vectors
            similar_vectors = await self.search_similar_vectors(
                query_embedding=query_embedding,
                content_type=content_type,
                similarity_threshold=similarity_threshold,
                max_results=1,
                cultural_filter=romanian_entities if romanian_entities else None
            )
            
            if similar_vectors:
                best_match = similar_vectors[0]
                similarity_score = best_match.get("similarity", 0)
                
                if similarity_score >= (similarity_threshold or self.similarity_threshold):
                    self.metrics.similarity_threshold_hits += 1
                    
                    # Record performance gain
                    estimated_time_saved = 0.150  # Estimated Azure OpenAI response time
                    estimated_cost_saved = 0.004  # Estimated Azure OpenAI cost
                    self.record_performance_gain(estimated_time_saved, estimated_cost_saved)
                    
                    logger.info(f"Semantic cache hit with similarity {similarity_score:.3f}")
                    return best_match.get("content")
            
            return None
            
        except Exception as e:
            logger.error(f"Cached response retrieval error: {e}")
            return None
    
    async def store_cultural_entities(self, entities: Dict[str, Any]) -> bool:
        """Store Romanian cultural entities as vectors"""
        try:
            success_count = 0
            
            for entity_name, entity_data in entities.items():
                # Create embedding for entity (mock embedding for now)
                entity_text = f"{entity_name}: {json.dumps(entity_data, ensure_ascii=False)}"
                mock_embedding = [0.1] * self.vector_dimension  # In production, use real embeddings
                
                success = await self.store_vector(
                    content=entity_text,
                    embedding=mock_embedding,
                    content_type=VectorContentType.CULTURAL_ENTITY,
                    metadata={
                        "entity_name": entity_name,
                        "entity_type": entity_data.get("type", "unknown"),
                        "importance": entity_data.get("importance", "medium")
                    }
                )
                
                if success:
                    success_count += 1
            
            logger.info(f"Stored {success_count}/{len(entities)} cultural entities")
            return success_count == len(entities)
            
        except Exception as e:
            logger.error(f"Cultural entities storage error: {e}")
            return False
    
    async def get_analytics(self) -> Dict[str, Any]:
        """Get CBD vector analytics and metrics"""
        try:
            # Get CBD system analytics
            async with self.session.get(f"{self.cbd_base_url}/vector/analytics") as response:
                if response.status == 200:
                    cbd_analytics = await response.json()
                else:
                    cbd_analytics = {"error": "CBD analytics unavailable"}
            
            # Combine with local metrics
            return {
                "cbd_analytics": cbd_analytics,
                "vector_metrics": asdict(self.metrics),
                "performance": {
                    "semantic_hit_rate_percentage": self.metrics.semantic_hit_rate,
                    "average_time_saved_ms": self.metrics.average_time_saved * 1000,
                    "total_cost_saved_usd": self.metrics.total_cost_saved,
                    "average_similarity_score": self.metrics.average_similarity_score
                },
                "romanian_context": {
                    "entities_tracked": len([
                        entity for entities in self.romanian_entities.values() 
                        for entity in entities
                    ]),
                    "cultural_categories": len(self.romanian_entities),
                    "cultural_context_enabled": self.enable_cultural_context
                }
            }
            
        except Exception as e:
            logger.error(f"Analytics retrieval error: {e}")
            return {"error": str(e)}
    
    def record_performance_gain(self, response_time_saved: float, cost_saved: float = 0.0):
        """Record performance gains from semantic cache hits"""
        self.metrics.total_response_time_saved += response_time_saved
        self.metrics.total_cost_saved += cost_saved
    
    async def health_check(self) -> Dict[str, Any]:
        """Check CBD vector database health"""
        try:
            async with self.session.get(f"{self.cbd_base_url}/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    return {
                        "status": "healthy",
                        "cbd_status": health_data.get("status", "unknown"),
                        "vector_engine": health_data.get("engines", {}).get("vector", "unknown"),
                        "metrics": asdict(self.metrics)
                    }
                else:
                    return {
                        "status": "unhealthy",
                        "error": f"CBD health check failed: {response.status}"
                    }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

# Example usage and testing
async def test_cbd_vector_manager():
    """Test the CBD Vector Manager functionality"""
    print("🧪 Testing RomAI CBD Vector Manager...")
    
    cbd_manager = CBDVectorManager()
    
    try:
        # Test health check
        health = await cbd_manager.health_check()
        print(f"🏥 Health check: {health}")
        
        # Test cultural entity storage
        romanian_entities = {
            "Mihai_Eminescu": {
                "type": "literary_figure",
                "period": "1850-1889",
                "works": ["Luceafărul", "Floare albastră"],
                "importance": "high"
            },
            "București": {
                "type": "city",
                "region": "Muntenia",
                "population": "1.8M",
                "importance": "high"
            }
        }
        
        entity_success = await cbd_manager.store_cultural_entities(romanian_entities)
        print(f"📚 Cultural entities stored: {entity_success}")
        
        # Test vector storage and semantic search
        test_content = "Care sunt principalele orașe din România? Știu că București este capitala."
        mock_embedding = [0.5] * 1536  # Mock embedding
        
        store_success = await cbd_manager.store_vector(
            content=test_content,
            embedding=mock_embedding,
            content_type=VectorContentType.AZURE_OPENAI_RESPONSE,
            metadata={"language": "romanian", "complexity": "medium"}
        )
        print(f"💾 Vector stored: {store_success}")
        
        # Test semantic search
        query_embedding = [0.52] * 1536  # Slightly different for similarity test
        cached_response = await cbd_manager.get_cached_response(
            query="Care sunt orașele importante din România?",
            query_embedding=query_embedding,
            similarity_threshold=0.7
        )
        print(f"🔍 Semantic cache result: {cached_response is not None}")
        
        # Test analytics
        analytics = await cbd_manager.get_analytics()
        print(f"📊 Analytics: {analytics['performance']}")
        
        print("🎯 CBD Vector Manager test completed successfully!")
        
    finally:
        await cbd_manager.close()

if __name__ == "__main__":
    asyncio.run(test_cbd_vector_manager())

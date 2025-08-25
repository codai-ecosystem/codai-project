"""
Hybrid API Orchestration Layer - Week 1 Day 3
Seamless integration between local enhanced processor and Azure OpenAI

This module orchestrates queries between different processing backends:
- Local enhanced Romanian processor for cultural context
- Azure OpenAI for complex reasoning (Day 4 implementation)
- Hybrid processing for combined capabilities
- Performance monitoring and optimization
"""

import asyncio
import time
import json
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from pathlib import Path
import sys

# Add the parent directories to sys.path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))
from ml.hybrid.query_router import SmartQueryRouter, ProcessingResult, QueryAnalysis

logger = logging.getLogger(__name__)

class OrchestrationStatus(Enum):
    """Status of orchestration process"""
    INITIALIZING = "initializing"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CACHED = "cached"

@dataclass
class UserRequest:
    """Structured user request"""
    query: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    preferences: Optional[Dict] = None
    context: Optional[Dict] = None
    timestamp: Optional[float] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
        if self.preferences is None:
            self.preferences = {}
        if self.context is None:
            self.context = {}

@dataclass
class EnhancedResponse:
    """Enhanced response with metadata"""
    response: str
    processing_path: str
    processing_time: float
    cultural_context: Dict
    performance_metrics: Dict
    confidence: float
    cost_estimate: float
    status: OrchestrationStatus
    suggestions: List[str]
    cache_hit: bool = False
    error_message: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'response': self.response,
            'processing_path': self.processing_path,
            'processing_time': self.processing_time,
            'cultural_context': self.cultural_context,
            'performance_metrics': self.performance_metrics,
            'confidence': self.confidence,
            'cost_estimate': self.cost_estimate,
            'status': self.status.value,  # Convert enum to string
            'suggestions': self.suggestions,
            'cache_hit': self.cache_hit,
            'error_message': self.error_message
        }

@dataclass
class PerformanceMetrics:
    """Performance tracking metrics"""
    query_count: int = 0
    total_processing_time: float = 0.0
    cache_hits: int = 0
    local_queries: int = 0
    azure_queries: int = 0
    hybrid_queries: int = 0
    error_count: int = 0
    average_confidence: float = 0.0
    total_cost: float = 0.0

class FallbackHandler:
    """Handles errors and fallback scenarios"""
    
    def __init__(self):
        self.fallback_responses = {
            'network_error': "Îmi pare rău, am întâmpinat o problemă de conexiune. Încerc să procesez local...",
            'processing_error': "A apărut o eroare în procesare. Încerc o metodă alternativă...",
            'timeout_error': "Procesarea durează prea mult. Ofer un răspuns rapid din cunoștințele locale...",
            'quota_exceeded': "Am depășit limita de procesări pentru moment. Folosesc procesarea locală...",
            'general_error': "Îmi pare rău, nu pot procesa această cerere momentan. Te rog să încerci din nou."
        }
    
    async def handle_error(self, error: Exception, request: UserRequest) -> EnhancedResponse:
        """Handle various types of errors with appropriate fallbacks"""
        error_type = self._classify_error(error)
        fallback_message = self.fallback_responses.get(error_type, self.fallback_responses['general_error'])
        
        # Try to provide a basic response using local processing
        try:
            processor = EnhancedRomanianProcessor()
            local_result = processor.generate_enhanced_response(request.query)
            
            response = f"{fallback_message}\n\nRăspuns local: {local_result.get('response', 'Nu pot oferi un răspuns specific.')}"
            
            return EnhancedResponse(
                response=response,
                processing_path="fallback_local",
                processing_time=0.1,
                cultural_context=local_result.get('analysis', {}),
                performance_metrics={'fallback': True, 'error_type': error_type},
                confidence=0.3,
                cost_estimate=0.0,
                status=OrchestrationStatus.COMPLETED,
                suggestions=["Încearcă o întrebare mai simplă", "Verifică conexiunea la internet"],
                error_message=str(error)
            )
            
        except Exception as fallback_error:
            logger.error(f"Fallback also failed: {fallback_error}")
            
            return EnhancedResponse(
                response=self.fallback_responses['general_error'],
                processing_path="error_fallback",
                processing_time=0.01,
                cultural_context={},
                performance_metrics={'critical_failure': True},
                confidence=0.0,
                cost_estimate=0.0,
                status=OrchestrationStatus.FAILED,
                suggestions=["Încearcă din nou mai târziu"],
                error_message=str(error)
            )
    
    def _classify_error(self, error: Exception) -> str:
        """Classify error type for appropriate handling"""
        error_str = str(error).lower()
        
        if 'timeout' in error_str or 'time' in error_str:
            return 'timeout_error'
        elif 'network' in error_str or 'connection' in error_str:
            return 'network_error'
        elif 'quota' in error_str or 'limit' in error_str:
            return 'quota_exceeded'
        elif 'processing' in error_str:
            return 'processing_error'
        else:
            return 'general_error'

class PerformanceMonitor:
    """Monitors and tracks performance metrics"""
    
    def __init__(self):
        self.metrics = PerformanceMetrics()
        self.query_history = []
        self.performance_alerts = []
    
    def record_query(self, request: UserRequest, response: EnhancedResponse):
        """Record query performance metrics"""
        self.metrics.query_count += 1
        self.metrics.total_processing_time += response.processing_time
        
        if response.cache_hit:
            self.metrics.cache_hits += 1
        
        # Track processing path
        if 'local' in response.processing_path:
            self.metrics.local_queries += 1
        elif 'azure' in response.processing_path:
            self.metrics.azure_queries += 1
        elif 'hybrid' in response.processing_path:
            self.metrics.hybrid_queries += 1
        
        if response.status == OrchestrationStatus.FAILED:
            self.metrics.error_count += 1
        
        # Update running averages
        if self.metrics.query_count > 0:
            self.metrics.average_confidence = (
                (self.metrics.average_confidence * (self.metrics.query_count - 1) + response.confidence) 
                / self.metrics.query_count
            )
        
        self.metrics.total_cost += response.cost_estimate
        
        # Record in history (keep last 1000 queries)
        self.query_history.append({
            'timestamp': time.time(),
            'query_length': len(request.query),
            'processing_path': response.processing_path,
            'processing_time': response.processing_time,
            'confidence': response.confidence,
            'cache_hit': response.cache_hit
        })
        
        if len(self.query_history) > 1000:
            self.query_history = self.query_history[-1000:]
        
        # Check for performance alerts
        self._check_performance_alerts(response)
    
    def _check_performance_alerts(self, response: EnhancedResponse):
        """Check for performance issues and generate alerts"""
        current_time = time.time()
        
        # Alert for slow responses
        if response.processing_time > 5.0:
            self.performance_alerts.append({
                'timestamp': current_time,
                'type': 'slow_response',
                'message': f"Slow response detected: {response.processing_time:.2f}s",
                'processing_path': response.processing_path
            })
        
        # Alert for low confidence
        if response.confidence < 0.3 and response.status == OrchestrationStatus.COMPLETED:
            self.performance_alerts.append({
                'timestamp': current_time,
                'type': 'low_confidence',
                'message': f"Low confidence response: {response.confidence:.2f}",
                'processing_path': response.processing_path
            })
        
        # Alert for high error rate
        if self.metrics.query_count > 10:
            error_rate = self.metrics.error_count / self.metrics.query_count
            if error_rate > 0.1:  # More than 10% errors
                self.performance_alerts.append({
                    'timestamp': current_time,
                    'type': 'high_error_rate',
                    'message': f"High error rate detected: {error_rate:.1%}",
                    'error_count': self.metrics.error_count,
                    'total_queries': self.metrics.query_count
                })
        
        # Keep only recent alerts (last 24 hours)
        one_day_ago = current_time - 86400
        self.performance_alerts = [
            alert for alert in self.performance_alerts 
            if alert['timestamp'] > one_day_ago
        ]
    
    def get_performance_summary(self) -> Dict:
        """Get performance summary for monitoring"""
        if self.metrics.query_count == 0:
            return {'status': 'no_queries_processed'}
        
        average_time = self.metrics.total_processing_time / self.metrics.query_count
        cache_hit_rate = self.metrics.cache_hits / self.metrics.query_count
        error_rate = self.metrics.error_count / self.metrics.query_count
        
        return {
            'total_queries': self.metrics.query_count,
            'average_processing_time': round(average_time, 3),
            'cache_hit_rate': round(cache_hit_rate, 3),
            'error_rate': round(error_rate, 3),
            'average_confidence': round(self.metrics.average_confidence, 3),
            'total_cost': round(self.metrics.total_cost, 4),
            'processing_distribution': {
                'local': self.metrics.local_queries,
                'azure': self.metrics.azure_queries,
                'hybrid': self.metrics.hybrid_queries
            },
            'recent_alerts': len(self.performance_alerts),
            'status': 'healthy' if error_rate < 0.05 else 'degraded'
        }

class HybridOrchestrator:
    """
    Main orchestration engine for hybrid processing
    Coordinates between local and cloud processing with intelligent routing
    """
    
    def __init__(self):
        """Initialize the hybrid orchestrator"""
        self.query_router = SmartQueryRouter()
        self.performance_monitor = PerformanceMonitor()
        self.fallback_handler = FallbackHandler()
        self.enhanced_processor = EnhancedRomanianProcessor()
        
        # Configuration
        self.config = {
            'max_processing_time': 30.0,  # Maximum processing time in seconds
            'enable_caching': True,
            'enable_fallbacks': True,
            'cost_alert_threshold': 1.0,  # Alert if cost exceeds $1 per query
            'confidence_threshold': 0.7,  # Minimum acceptable confidence
        }
        
        logger.info("Hybrid Orchestrator initialized successfully")
    
    async def process_request(self, request: UserRequest) -> EnhancedResponse:
        """
        Main orchestration method - processes user requests with optimal routing
        
        Args:
            request: Structured user request
            
        Returns:
            EnhancedResponse with processed result and metadata
        """
        start_time = time.time()
        
        try:
            logger.info(f"Processing request: {request.query[:50]}...")
            
            # Step 1: Analyze query and determine optimal processing path
            analysis = self.query_router.analyze_query_complexity(request.query)
            
            logger.info(f"Query analysis: {analysis.processing_path.value}, confidence: {analysis.confidence:.2f}")
            
            # Step 2: Pre-process to extract cultural context
            cultural_context = await self._extract_cultural_context(request.query)
            
            # Step 3: Route to appropriate processor
            processing_result = await self._execute_processing(request, analysis, cultural_context)
            
            # Step 4: Post-process and enhance response
            enhanced_response = await self._enhance_response(processing_result, cultural_context, request)
            
            # Step 5: Record performance metrics
            processing_time = time.time() - start_time
            enhanced_response.processing_time = processing_time
            
            self.performance_monitor.record_query(request, enhanced_response)
            
            logger.info(f"Request processed successfully in {processing_time:.3f}s")
            
            return enhanced_response
            
        except asyncio.TimeoutError:
            logger.warning(f"Request timed out after {self.config['max_processing_time']}s")
            return await self.fallback_handler.handle_error(
                TimeoutError("Processing timeout"), request
            )
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return await self.fallback_handler.handle_error(e, request)
    
    async def _extract_cultural_context(self, query: str) -> Dict:
        """Extract Romanian cultural context from query"""
        try:
            # Use enhanced processor to analyze cultural elements
            analysis = self.enhanced_processor.process_text_enhanced(query)
            
            if analysis and 'analysis' in analysis:
                return {
                    'cultural_entities': analysis['analysis'].get('cultural_entities', {}),
                    'dialect_analysis': analysis['analysis'].get('dialect_analysis', {}),
                    'sentiment_analysis': analysis['analysis'].get('sentiment_analysis', {}),
                    'cultural_score': len(analysis['analysis'].get('cultural_entities', {}))
                }
            
            return {}
            
        except Exception as e:
            logger.warning(f"Error extracting cultural context: {e}")
            return {}
    
    async def _execute_processing(
        self, 
        request: UserRequest, 
        analysis: QueryAnalysis,
        cultural_context: Dict
    ) -> ProcessingResult:
        """Execute processing based on analysis results"""
        
        # Set timeout for processing
        timeout = self.config['max_processing_time']
        
        try:
            # Route query with timeout
            result = await asyncio.wait_for(
                self.query_router.route_query(request.query, request.context),
                timeout=timeout
            )
            
            return result
            
        except asyncio.TimeoutError:
            logger.warning("Processing timed out, using fallback")
            raise
        except Exception as e:
            logger.error(f"Error in processing execution: {e}")
            raise
    
    async def _enhance_response(
        self, 
        processing_result: ProcessingResult, 
        cultural_context: Dict,
        request: UserRequest
    ) -> EnhancedResponse:
        """Enhance response with additional context and suggestions"""
        
        # Generate suggestions based on cultural context
        suggestions = self._generate_suggestions(processing_result, cultural_context)
        
        # Determine status
        status = OrchestrationStatus.COMPLETED
        if processing_result.cache_hit:
            status = OrchestrationStatus.CACHED
        
        # Create enhanced response
        enhanced_response = EnhancedResponse(
            response=processing_result.response,
            processing_path=processing_result.processing_path.value,
            processing_time=processing_result.processing_time,
            cultural_context=cultural_context,
            performance_metrics=processing_result.performance_metrics,
            confidence=processing_result.confidence,
            cost_estimate=processing_result.cost_estimate,
            status=status,
            suggestions=suggestions,
            cache_hit=processing_result.cache_hit
        )
        
        return enhanced_response
    
    def _generate_suggestions(self, processing_result: ProcessingResult, cultural_context: Dict) -> List[str]:
        """Generate contextual suggestions for follow-up queries"""
        suggestions = []
        
        # Suggestions based on cultural entities found
        if cultural_context.get('cultural_entities'):
            entities = cultural_context['cultural_entities']
            
            for category, subcategories in entities.items():
                for subcategory, entity_list in subcategories.items():
                    for entity in entity_list[:2]:  # Limit to 2 per subcategory
                        suggestions.append(f"Vrei să afli mai multe despre {entity}?")
        
        # General suggestions based on processing path
        if 'local' in processing_result.processing_path.value:
            suggestions.extend([
                "Întreabă-mă despre alte tradiții românești",
                "Explorează cultura și istoria României"
            ])
        elif 'azure' in processing_result.processing_path.value:
            suggestions.extend([
                "Pune o întrebare mai specifică pentru detalii",
                "Cere o analiză mai aprofundată"
            ])
        
        # Limit total suggestions
        return suggestions[:5]
    
    def get_orchestrator_status(self) -> Dict:
        """Get current orchestrator status and metrics"""
        performance_summary = self.performance_monitor.get_performance_summary()
        router_stats = self.query_router.get_performance_stats()
        
        return {
            'status': 'operational',
            'version': '1.0.0-alpha',
            'uptime': time.time(),  # Simplified uptime
            'performance': performance_summary,
            'router_stats': router_stats,
            'configuration': self.config,
            'components': {
                'query_router': 'operational',
                'enhanced_processor': 'operational',
                'performance_monitor': 'operational',
                'fallback_handler': 'operational'
            }
        }
    
    async def health_check(self) -> Dict:
        """Perform health check on all components"""
        health_status = {
            'overall': 'healthy',
            'timestamp': time.time(),
            'components': {}
        }
        
        # Test enhanced processor
        try:
            test_result = self.enhanced_processor.process_text_enhanced("Test query")
            health_status['components']['enhanced_processor'] = 'healthy'
        except Exception as e:
            health_status['components']['enhanced_processor'] = f'unhealthy: {str(e)}'
            health_status['overall'] = 'degraded'
        
        # Test query router
        try:
            test_analysis = self.query_router.analyze_query_complexity("Test query")
            health_status['components']['query_router'] = 'healthy'
        except Exception as e:
            health_status['components']['query_router'] = f'unhealthy: {str(e)}'
            health_status['overall'] = 'degraded'
        
        # Check performance metrics
        perf_summary = self.performance_monitor.get_performance_summary()
        if perf_summary.get('status') == 'degraded':
            health_status['overall'] = 'degraded'
        
        health_status['components']['performance_monitor'] = perf_summary.get('status', 'unknown')
        
        return health_status

# Test function for development
async def test_orchestrator():
    """Test the hybrid orchestrator with sample requests"""
    orchestrator = HybridOrchestrator()
    
    test_requests = [
        UserRequest(
            query="Salut! Îmi place poezia lui Eminescu.",
            user_id="test_user_1",
            preferences={'language': 'romanian'}
        ),
        UserRequest(
            query="Analizează impactul culturii românești asupra literaturii moderne.",
            user_id="test_user_2",
            context={'session': 'literary_discussion'}
        ),
        UserRequest(
            query="Ce tradiții de Crăciun există în România?",
            user_id="test_user_3"
        )
    ]
    
    print("🎼 Testing Hybrid Orchestrator")
    print("=" * 60)
    
    for i, request in enumerate(test_requests, 1):
        print(f"\n--- Test {i} ---")
        print(f"Query: {request.query}")
        print(f"User: {request.user_id}")
        
        try:
            response = await orchestrator.process_request(request)
            
            print(f"Status: {response.status.value}")
            print(f"Processing Path: {response.processing_path}")
            print(f"Processing Time: {response.processing_time:.3f}s")
            print(f"Confidence: {response.confidence:.2f}")
            print(f"Cost: ${response.cost_estimate:.4f}")
            print(f"Cache Hit: {response.cache_hit}")
            print(f"Response: {response.response[:100]}...")
            print(f"Suggestions: {response.suggestions[:2]}")
            
        except Exception as e:
            print(f"Error: {e}")
    
    # Test health check
    print(f"\n--- Health Check ---")
    health = await orchestrator.health_check()
    print(f"Overall Health: {health['overall']}")
    print(f"Components: {health['components']}")
    
    # Get performance summary
    print(f"\n--- Performance Summary ---")
    status = orchestrator.get_orchestrator_status()
    print(f"Performance: {status['performance']}")

if __name__ == "__main__":
    asyncio.run(test_orchestrator())

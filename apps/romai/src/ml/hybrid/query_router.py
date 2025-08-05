"""
Smart Query Router for Hybrid Azure OpenAI Integration
Week 1 Day 3 Implementation - RomAI AGI Assistant

This module implements intelligent query routing to determine optimal processing path:
- Local enhanced processor for Romanian cultural context
- Azure OpenAI for complex reasoning tasks
- Hybrid processing for combined capabilities
"""

import re
import json
import time
import logging
from typing import Dict, List, Optional, Tuple, Union
from enum import Enum
from dataclasses import dataclass
from pathlib import Path
import sys

# Add the parent directory to sys.path to import enhanced processor
sys.path.append(str(Path(__file__).parent.parent))
from models.enhanced_romanian_processor import EnhancedRomanianProcessor
from orchestration.azure_openai_client import AzureOpenAIClient, AzureConfig

class QueryComplexity(Enum):
    """Query complexity classification"""
    SIMPLE_LOCAL = "simple_local"        # Basic Romanian queries, cultural context
    COMPLEX_AZURE = "complex_azure"      # Complex reasoning, abstract concepts
    HYBRID_COMBINED = "hybrid_combined"  # Requires both cultural and reasoning
    CACHE_HIT = "cache_hit"             # Already cached response available

class ProcessingPath(Enum):
    """Available processing paths"""
    LOCAL_ONLY = "local_only"
    AZURE_ONLY = "azure_only"
    HYBRID_SEQUENTIAL = "hybrid_sequential"  # Local first, then Azure
    HYBRID_PARALLEL = "hybrid_parallel"     # Both simultaneously
    CACHE_RETURN = "cache_return"

@dataclass
class QueryAnalysis:
    """Results of query complexity analysis"""
    complexity: QueryComplexity
    confidence: float
    processing_path: ProcessingPath
    estimated_cost: float
    estimated_time: float
    cultural_entities_detected: List[str]
    reasoning_indicators: List[str]
    cache_key: Optional[str] = None

@dataclass
class ProcessingResult:
    """Results from query processing"""
    response: str
    processing_path: ProcessingPath
    processing_time: float
    cost_estimate: float
    confidence: float
    cultural_context: Dict
    performance_metrics: Dict
    cache_hit: bool = False

class SmartQueryRouter:
    """
    Intelligent query router for hybrid processing
    Determines optimal processing path based on query characteristics
    """
    
    def __init__(self):
        """Initialize the smart query router"""
        self.enhanced_processor = EnhancedRomanianProcessor()
        self.azure_client = AzureOpenAIClient()
        self.logger = logging.getLogger(__name__)
        self.query_patterns = self._load_query_patterns()
        self.performance_history = {}
        self.cost_thresholds = {
            'local_max_cost': 0.001,      # Very low cost for local processing
            'azure_cost_per_token': 0.002, # Estimated Azure cost
            'hybrid_threshold': 0.01       # When to use hybrid approach
        }
        
    def _load_query_patterns(self) -> Dict:
        """Load predefined query patterns for classification"""
        return {
            'local_indicators': [
                # Romanian cultural indicators
                r'\b(Eminescu|Creangă|Sadoveanu|Rebreanu)\b',  # Romanian authors
                r'\b(București|Cluj|Iași|Timișoara|Constanța)\b', # Major cities
                r'\b(sarmale|mici|ciorbă|țuică|pălincă)\b',    # Traditional food
                r'\b(hora|sârba|călușari|mărțișor)\b',         # Cultural traditions
                r'\b(Carpați|Dunărea|Transilvania|Moldova|Oltenia)\b', # Geography
                r'\b(domnitor|voievod|boier|țară|județ)\b',    # Historical terms
                
                # Simple language patterns
                r'^(salut|bună|ce faci|cum te cheamă)',        # Greetings
                r'\b(mulțumesc|te rog|cu plăcere)\b',          # Politeness
                r'\b(să îmi spui|vreau să știu|ce știi despre)\b', # Simple requests
                
                # Direct cultural questions
                r'(tradiții românești|cultura română|istoria româniei)',
                r'(dialecte românești|limbă română|poezie română)',
            ],
            
            'azure_indicators': [
                # Complex reasoning patterns
                r'\b(analizează|compară|evaluează|demonstrează)\b',
                r'\b(de ce|cum să|care sunt cauzele|explică)\b',
                r'\b(strategie|plan|soluție|metodă|abordare)\b',
                r'\b(logică|raționament|argumentare|concluzie)\b',
                
                # Abstract concepts
                r'\b(filosofie|etică|morală|principii|valori)\b',
                r'\b(psihologie|sociologie|antropologie)\b',
                r'\b(știință|tehnologie|inovație|cercetare)\b',
                
                # Multi-step requests
                r'(pas cu pas|etape|procedură|algoritm)',
                r'(primul lucru|în continuare|apoi|în final)',
                r'(mai întâi|după aceea|ulterior|la sfârșit)',
                
                # Creative tasks
                r'\b(scrie|compune|creează|imaginează)\b',
                r'\b(poveste|poem|articol|eseu|referat)\b',
            ],
            
            'hybrid_indicators': [
                # Romanian context + complex reasoning
                r'(istoria româniei.*analizează|cultura română.*compară)',
                r'(tradiții românești.*de ce|autori români.*influența)',
                r'(români.*strategie|românia.*dezvoltare|țara.*viitor)',
                
                # Technical topics with Romanian context
                r'(tehnologie.*românia|inovație.*românească)',
                r'(știință.*română|cercetare.*bucurești|universități.*românia)',
                
                # Cultural analysis
                r'(influența.*cultura română|impactul.*tradiții)',
                r'(comparație.*românia|românia.*alte țări)',
            ]
        }
    
    def analyze_query_complexity(self, query: str) -> QueryAnalysis:
        """
        Analyze query to determine optimal processing path
        
        Args:
            query: User query to analyze
            
        Returns:
            QueryAnalysis object with classification and recommendations
        """
        start_time = time.time()
        
        # Normalize query for analysis
        normalized_query = query.lower().strip()
        
        # Check for cached responses first
        cache_key = self._generate_cache_key(normalized_query)
        if self.enhanced_processor.cache.get(cache_key):
            return QueryAnalysis(
                complexity=QueryComplexity.CACHE_HIT,
                confidence=1.0,
                processing_path=ProcessingPath.CACHE_RETURN,
                estimated_cost=0.0,
                estimated_time=0.001,
                cultural_entities_detected=[],
                reasoning_indicators=[],
                cache_key=cache_key
            )
        
        # Detect cultural entities using enhanced processor
        cultural_analysis = self.enhanced_processor.process_text_enhanced(query)
        cultural_entities = []
        
        if cultural_analysis and 'analysis' in cultural_analysis:
            entities = cultural_analysis['analysis'].get('cultural_entities', {})
            for category, subcategories in entities.items():
                for subcategory, entity_list in subcategories.items():
                    cultural_entities.extend(entity_list)
        
        # Score different processing approaches
        local_score = self._calculate_local_score(normalized_query, cultural_entities)
        azure_score = self._calculate_azure_score(normalized_query)
        hybrid_score = self._calculate_hybrid_score(normalized_query, cultural_entities)
        
        # Determine optimal path
        processing_path, complexity, confidence = self._determine_processing_path(
            local_score, azure_score, hybrid_score
        )
        
        # Estimate costs and timing
        estimated_cost = self._estimate_processing_cost(processing_path, query)
        estimated_time = self._estimate_processing_time(processing_path, query)
        
        # Get reasoning indicators
        reasoning_indicators = self._extract_reasoning_indicators(normalized_query)
        
        analysis_time = time.time() - start_time
        
        return QueryAnalysis(
            complexity=complexity,
            confidence=confidence,
            processing_path=processing_path,
            estimated_cost=estimated_cost,
            estimated_time=estimated_time,
            cultural_entities_detected=cultural_entities,
            reasoning_indicators=reasoning_indicators,
            cache_key=cache_key
        )
    
    def _calculate_local_score(self, query: str, cultural_entities: List[str]) -> float:
        """Calculate score for local processing suitability"""
        score = 0.0
        
        # Cultural entities boost local score significantly
        if cultural_entities:
            score += len(cultural_entities) * 0.2
            score += 0.3  # Base cultural bonus
        
        # Pattern matching for local indicators
        for pattern in self.query_patterns['local_indicators']:
            if re.search(pattern, query, re.IGNORECASE):
                score += 0.15
        
        # Length penalty for very long queries (might need Azure reasoning)
        if len(query) > 200:
            score *= 0.8
        
        # Simple question patterns
        simple_patterns = [
            r'^(ce|cine|când|unde|cum)\s',
            r'\?(.*)?$',
            r'^(salut|bună|mulțumesc)',
        ]
        
        for pattern in simple_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_azure_score(self, query: str) -> float:
        """Calculate score for Azure processing suitability"""
        score = 0.0
        
        # Pattern matching for Azure indicators
        for pattern in self.query_patterns['azure_indicators']:
            if re.search(pattern, query, re.IGNORECASE):
                score += 0.2
        
        # Complex sentence structure
        if len(query.split('.')) > 2:  # Multiple sentences
            score += 0.1
        
        if len(query.split(',')) > 3:  # Complex comma usage
            score += 0.1
        
        # Question complexity
        question_words = ['de ce', 'cum să', 'care sunt', 'în ce mod']
        for phrase in question_words:
            if phrase in query:
                score += 0.15
        
        # Abstract reasoning keywords
        abstract_keywords = ['concept', 'principiu', 'teorie', 'filozofie', 'analiză']
        for keyword in abstract_keywords:
            if keyword in query:
                score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_hybrid_score(self, query: str, cultural_entities: List[str]) -> float:
        """Calculate score for hybrid processing suitability"""
        score = 0.0
        
        # High score if both cultural and reasoning elements present
        if cultural_entities:
            # Pattern matching for hybrid indicators
            for pattern in self.query_patterns['hybrid_indicators']:
                if re.search(pattern, query, re.IGNORECASE):
                    score += 0.3
            
            # Check for reasoning words in culturally-rich query
            reasoning_words = ['analizează', 'compară', 'explică', 'de ce', 'cum']
            for word in reasoning_words:
                if word in query:
                    score += 0.2
        
        # Long, complex queries with cultural context
        if len(cultural_entities) > 2 and len(query) > 100:
            score += 0.2
        
        return min(score, 1.0)
    
    def _determine_processing_path(
        self, 
        local_score: float, 
        azure_score: float, 
        hybrid_score: float
    ) -> Tuple[ProcessingPath, QueryComplexity, float]:
        """Determine optimal processing path based on scores"""
        
        max_score = max(local_score, azure_score, hybrid_score)
        confidence = max_score
        
        # Decision thresholds
        if hybrid_score > 0.5 and hybrid_score >= max_score:
            return ProcessingPath.HYBRID_SEQUENTIAL, QueryComplexity.HYBRID_COMBINED, confidence
        elif local_score > 0.6 and local_score >= max_score:
            return ProcessingPath.LOCAL_ONLY, QueryComplexity.SIMPLE_LOCAL, confidence
        elif azure_score > 0.5 and azure_score >= max_score:
            return ProcessingPath.AZURE_ONLY, QueryComplexity.COMPLEX_AZURE, confidence
        elif local_score > azure_score:
            return ProcessingPath.LOCAL_ONLY, QueryComplexity.SIMPLE_LOCAL, confidence
        else:
            return ProcessingPath.AZURE_ONLY, QueryComplexity.COMPLEX_AZURE, confidence
    
    def _estimate_processing_cost(self, path: ProcessingPath, query: str) -> float:
        """Estimate processing cost based on path and query complexity"""
        token_count = len(query.split()) * 1.3  # Rough token estimation
        
        if path == ProcessingPath.LOCAL_ONLY:
            return 0.001  # Minimal local processing cost
        elif path == ProcessingPath.AZURE_ONLY:
            return token_count * self.cost_thresholds['azure_cost_per_token']
        elif path in [ProcessingPath.HYBRID_SEQUENTIAL, ProcessingPath.HYBRID_PARALLEL]:
            return 0.001 + (token_count * self.cost_thresholds['azure_cost_per_token'] * 0.7)
        else:
            return 0.0
    
    def _estimate_processing_time(self, path: ProcessingPath, query: str) -> float:
        """Estimate processing time based on path and query complexity"""
        base_times = {
            ProcessingPath.LOCAL_ONLY: 0.05,      # 50ms for local
            ProcessingPath.AZURE_ONLY: 1.5,       # 1.5s for Azure
            ProcessingPath.HYBRID_SEQUENTIAL: 2.0, # 2s for sequential hybrid
            ProcessingPath.HYBRID_PARALLEL: 1.8,   # 1.8s for parallel hybrid
            ProcessingPath.CACHE_RETURN: 0.001     # 1ms for cache
        }
        
        base_time = base_times.get(path, 1.0)
        
        # Adjust for query complexity
        complexity_factor = len(query) / 100.0
        
        return base_time * (1 + complexity_factor * 0.2)
    
    def _extract_reasoning_indicators(self, query: str) -> List[str]:
        """Extract indicators that suggest complex reasoning is needed"""
        indicators = []
        
        reasoning_patterns = {
            'analysis': r'\b(analizează|analiză|studiază)\b',
            'comparison': r'\b(compară|comparație|diferența)\b',
            'explanation': r'\b(explică|explicație|de ce|cum)\b',
            'evaluation': r'\b(evaluează|evaluare|judecă)\b',
            'synthesis': r'\b(combină|sinteză|integrează)\b',
            'problem_solving': r'\b(rezolvă|soluție|problemă)\b',
        }
        
        for indicator_type, pattern in reasoning_patterns.items():
            if re.search(pattern, query, re.IGNORECASE):
                indicators.append(indicator_type)
        
        return indicators
    
    def _generate_cache_key(self, query: str) -> str:
        """Generate cache key for query"""
        import hashlib
        normalized = re.sub(r'\s+', ' ', query.lower().strip())
        return hashlib.md5(normalized.encode()).hexdigest()
    
    async def route_query(self, query: str, user_context: Dict = None) -> ProcessingResult:
        """
        Main routing function - determines and executes optimal processing path
        
        Args:
            query: User query to process
            user_context: Optional user context for personalization
            
        Returns:
            ProcessingResult with response and metadata
        """
        start_time = time.time()
        
        # Analyze query complexity
        analysis = self.analyze_query_complexity(query)
        
        try:
            # Execute based on determined path
            if analysis.processing_path == ProcessingPath.CACHE_RETURN:
                result = await self._process_cached(query, analysis)
            elif analysis.processing_path == ProcessingPath.LOCAL_ONLY:
                result = await self._process_local(query, analysis, user_context)
            elif analysis.processing_path == ProcessingPath.AZURE_ONLY:
                result = await self._process_azure(query, analysis, user_context)
            elif analysis.processing_path == ProcessingPath.HYBRID_SEQUENTIAL:
                result = await self._process_hybrid_sequential(query, analysis, user_context)
            elif analysis.processing_path == ProcessingPath.HYBRID_PARALLEL:
                result = await self._process_hybrid_parallel(query, analysis, user_context)
            else:
                # Fallback to local processing
                result = await self._process_local(query, analysis, user_context)
            
            # Record performance metrics
            processing_time = time.time() - start_time
            result.processing_time = processing_time
            
            self._record_performance(query, analysis, result)
            
            return result
            
        except Exception as e:
            # Fallback to local processing on error
            print(f"Error in routing: {e}")
            return await self._process_local(query, analysis, user_context)
    
    async def _process_cached(self, query: str, analysis: QueryAnalysis) -> ProcessingResult:
        """Process cached query"""
        cached_response = self.enhanced_processor.cache.get(analysis.cache_key)
        
        return ProcessingResult(
            response=cached_response.get('response', 'Cached response not found'),
            processing_path=ProcessingPath.CACHE_RETURN,
            processing_time=0.001,
            cost_estimate=0.0,
            confidence=1.0,
            cultural_context=cached_response.get('cultural_context', {}),
            performance_metrics={'cache_hit': True},
            cache_hit=True
        )
    
    async def _process_local(self, query: str, analysis: QueryAnalysis, user_context: Dict) -> ProcessingResult:
        """Process query using local enhanced processor"""
        try:
            result = self.enhanced_processor.generate_enhanced_response(query)
            
            return ProcessingResult(
                response=result['response'],
                processing_path=ProcessingPath.LOCAL_ONLY,
                processing_time=0.0,  # Will be set by caller
                cost_estimate=analysis.estimated_cost,
                confidence=result['confidence'] / 100.0,
                cultural_context=result.get('analysis', {}),
                performance_metrics=result.get('performance_metrics', {}),
                cache_hit=result.get('cache_hit', False)
            )
        except Exception as e:
            return ProcessingResult(
                response=f"Error in local processing: {str(e)}",
                processing_path=ProcessingPath.LOCAL_ONLY,
                processing_time=0.0,
                cost_estimate=0.0,
                confidence=0.0,
                cultural_context={},
                performance_metrics={'error': str(e)},
                cache_hit=False
            )
    
    async def _process_azure(self, query: str, analysis: QueryAnalysis, user_context: Dict) -> ProcessingResult:
        """Process query using Azure OpenAI - Day 4 Implementation"""
        try:
            start_time = time.time()
            
            # Process with Azure OpenAI client
            azure_response = await self.azure_client.process_query(
                query=query,
                user_id=user_context.get('user_id', 'anonymous'),
                context=user_context
            )
            
            processing_time = time.time() - start_time
            
            return ProcessingResult(
                response=azure_response.content,
                processing_path=ProcessingPath.AZURE_ONLY,
                processing_time=processing_time,
                cost_estimate=azure_response.cost_estimate,
                confidence=azure_response.confidence,
                cultural_context={},
                performance_metrics={
                    'azure_response_type': azure_response.response_type.value,
                    'token_usage': azure_response.token_usage,
                    'model': azure_response.metadata.get('model', 'unknown'),
                    'finish_reason': azure_response.metadata.get('finish_reason', 'unknown')
                },
                cache_hit=False
            )
            
        except Exception as e:
            # Fallback to enhanced processor on Azure failure
            self.logger.warning(f"Azure processing failed, falling back to local: {str(e)}")
            return await self._process_local(query, analysis, user_context)
    
    async def _process_hybrid_sequential(self, query: str, analysis: QueryAnalysis, user_context: Dict) -> ProcessingResult:
        """Process query using hybrid sequential approach"""
        # First process locally for cultural context
        local_result = await self._process_local(query, analysis, user_context)
        
        # Then enhance with Azure reasoning (placeholder)
        azure_enhancement = f"Enhanced with Azure reasoning: {local_result.response}"
        
        return ProcessingResult(
            response=azure_enhancement,
            processing_path=ProcessingPath.HYBRID_SEQUENTIAL,
            processing_time=0.0,
            cost_estimate=analysis.estimated_cost,
            confidence=max(local_result.confidence, 0.85),
            cultural_context=local_result.cultural_context,
            performance_metrics={'hybrid_sequential': True, 'local_confidence': local_result.confidence},
            cache_hit=False
        )
    
    async def _process_hybrid_parallel(self, query: str, analysis: QueryAnalysis, user_context: Dict) -> ProcessingResult:
        """Process query using hybrid parallel approach"""
        # Process both simultaneously and combine results
        local_result = await self._process_local(query, analysis, user_context)
        
        # Combine results (placeholder for full implementation)
        combined_response = f"Hybrid response combining local cultural intelligence: {local_result.response}"
        
        return ProcessingResult(
            response=combined_response,
            processing_path=ProcessingPath.HYBRID_PARALLEL,
            processing_time=0.0,
            cost_estimate=analysis.estimated_cost,
            confidence=0.9,
            cultural_context=local_result.cultural_context,
            performance_metrics={'hybrid_parallel': True},
            cache_hit=False
        )
    
    def _record_performance(self, query: str, analysis: QueryAnalysis, result: ProcessingResult):
        """Record performance metrics for future optimization"""
        performance_key = f"{analysis.processing_path.value}_{len(query)//50}"
        
        if performance_key not in self.performance_history:
            self.performance_history[performance_key] = []
        
        self.performance_history[performance_key].append({
            'timestamp': time.time(),
            'processing_time': result.processing_time,
            'confidence': result.confidence,
            'cost': result.cost_estimate,
            'path': analysis.processing_path.value
        })
        
        # Keep only last 100 records per key
        if len(self.performance_history[performance_key]) > 100:
            self.performance_history[performance_key] = self.performance_history[performance_key][-100:]
    
    def get_performance_stats(self) -> Dict:
        """Get performance statistics for optimization"""
        stats = {}
        
        for key, history in self.performance_history.items():
            if history:
                avg_time = sum(h['processing_time'] for h in history) / len(history)
                avg_confidence = sum(h['confidence'] for h in history) / len(history)
                avg_cost = sum(h['cost'] for h in history) / len(history)
                
                stats[key] = {
                    'average_processing_time': avg_time,
                    'average_confidence': avg_confidence,
                    'average_cost': avg_cost,
                    'sample_count': len(history)
                }
        
        return stats
    
    async def close(self):
        """Close Azure OpenAI client connection"""
        if hasattr(self.azure_client, 'close'):
            await self.azure_client.close()

# Test function for development
def test_smart_router():
    """Test the smart query router with sample queries"""
    router = SmartQueryRouter()
    
    test_queries = [
        "Salut! Ce știi despre Eminescu?",
        "Analizează impactul globalizării asupra economiei românești în contextul dezvoltării tehnologice moderne",
        "Care sunt tradițiile de Crăciun în România și de ce sunt importante?",
        "Explică-mi teoria relativității și cum se aplică în tehnologia GPS",
        "Îmi place cultura română, mai ales sarmale și hora. Ce alte tradiții românești există?"
    ]
    
    print("🧠 Testing Smart Query Router")
    print("=" * 50)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n--- Test {i} ---")
        print(f"Query: {query}")
        
        analysis = router.analyze_query_complexity(query)
        
        print(f"Complexity: {analysis.complexity.value}")
        print(f"Processing Path: {analysis.processing_path.value}")
        print(f"Confidence: {analysis.confidence:.2f}")
        print(f"Estimated Cost: ${analysis.estimated_cost:.4f}")
        print(f"Estimated Time: {analysis.estimated_time:.3f}s")
        print(f"Cultural Entities: {analysis.cultural_entities_detected}")
        print(f"Reasoning Indicators: {analysis.reasoning_indicators}")

if __name__ == "__main__":
    test_smart_router()

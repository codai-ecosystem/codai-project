"""
RomAI AGI - Streaming Analytics Engine
Week 3 Day 3: Real-time Intelligence & Live Updates

Real-time Romanian cultural content processing engine with live sentiment analysis,
cultural entity recognition, dynamic scoring, and streaming data analytics.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Generator
from dataclasses import dataclass, asdict
from enum import Enum
import re
import statistics
import aiohttp
from collections import defaultdict, deque
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyticsStreamType(Enum):
    CULTURAL_CONTENT = "cultural_content"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    LANGUAGE_PROCESSING = "language_processing"
    AGENT_PERFORMANCE = "agent_performance"
    USER_ENGAGEMENT = "user_engagement"
    COLLABORATION_METRICS = "collaboration_metrics"
    ROMANIAN_INSIGHTS = "romanian_insights"
    REAL_TIME_TRENDS = "real_time_trends"

class CulturalCategory(Enum):
    HISTORICAL_FIGURES = "historical_figures"
    GEOGRAPHICAL_REGIONS = "geographical_regions"
    TRADITIONS_CUSTOMS = "traditions_customs"
    LANGUAGE_LINGUISTICS = "language_linguistics"
    LITERATURE_ARTS = "literature_arts"
    MUSIC_FOLKLORE = "music_folklore"
    CUISINE_GASTRONOMY = "cuisine_gastronomy"
    CELEBRATIONS_FESTIVALS = "celebrations_festivals"
    NATIONAL_SYMBOLS = "national_symbols"
    MODERN_CULTURE = "modern_culture"

class SentimentCategory(Enum):
    VERY_POSITIVE = "very_positive"
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    VERY_NEGATIVE = "very_negative"
    MIXED = "mixed"
    CULTURAL_PRIDE = "cultural_pride"
    NOSTALGIA = "nostalgia"

@dataclass
class StreamingData:
    stream_id: str
    stream_type: AnalyticsStreamType
    content: Dict[str, Any]
    metadata: Dict[str, Any]
    timestamp: datetime
    processing_time_ms: float = 0.0
    romanian_score: float = 0.0
    cultural_categories: List[CulturalCategory] = None
    sentiment: Optional[SentimentCategory] = None
    
    def __post_init__(self):
        if self.cultural_categories is None:
            self.cultural_categories = []

@dataclass
class AnalyticsResult:
    result_id: str
    stream_type: AnalyticsStreamType
    analysis_type: str
    confidence: float
    cultural_score: float
    sentiment_score: float
    detected_entities: List[Dict[str, Any]]
    regional_context: List[str]
    linguistic_features: Dict[str, Any]
    timestamp: datetime
    processing_time_ms: float

@dataclass
class RealTimeMetrics:
    total_streams_processed: int = 0
    romanian_content_ratio: float = 0.0
    average_cultural_score: float = 0.0
    sentiment_distribution: Dict[str, float] = None
    top_cultural_categories: List[Tuple[str, int]] = None
    processing_speed_ms: float = 0.0
    error_rate: float = 0.0
    active_streams: int = 0
    
    def __post_init__(self):
        if self.sentiment_distribution is None:
            self.sentiment_distribution = {}
        if self.top_cultural_categories is None:
            self.top_cultural_categories = []

class StreamingAnalyticsEngine:
    """
    Advanced streaming analytics engine for real-time Romanian cultural content processing.
    Provides live analysis, sentiment detection, cultural scoring, and trend analytics.
    """
    
    def __init__(self, cbd_url: str = "http://localhost:4180", max_buffer_size: int = 1000):
        self.cbd_url = cbd_url
        self.max_buffer_size = max_buffer_size
        
        # Streaming buffers
        self.streaming_buffer: deque = deque(maxlen=max_buffer_size)
        self.analytics_results: deque = deque(maxlen=max_buffer_size)
        self.metrics_buffer: deque = deque(maxlen=100)  # Last 100 metric points
        
        # Stream processors
        self.active_streams: Dict[str, asyncio.Task] = {}
        self.stream_subscribers: Dict[AnalyticsStreamType, List[callable]] = defaultdict(list)
        
        # Romanian cultural knowledge base
        self.cultural_entities = {
            CulturalCategory.HISTORICAL_FIGURES: [
                "Ștefan cel Mare", "Mihai Viteazul", "Vlad Țepeș", "Alexandru Ioan Cuza",
                "Carol I", "Ferdinand I", "Regina Maria", "Mircea cel Bătrân",
                "Decebal", "Traian", "Nicolae Titulescu", "Take Ionescu"
            ],
            CulturalCategory.GEOGRAPHICAL_REGIONS: [
                "Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea", "Banat",
                "Crișana", "Maramureș", "București", "Cluj-Napoca", "Iași", "Constanța",
                "Timișoara", "Craiova", "Brașov", "Galați", "Ploiești", "Oradea"
            ],
            CulturalCategory.TRADITIONS_CUSTOMS: [
                "mărțișor", "dor", "sezătoare", "colinde", "căluș", "hora", "port popular",
                "țesut la război", "ceramică de Horezu", "ouă încondeiate", "mănuși de Bucovina"
            ],
            CulturalCategory.LANGUAGE_LINGUISTICS: [
                "limba română", "graiuri", "diacritice", "etimologie", "gramatică",
                "vocabular", "expresii", "proverbe", "zicători", "folclor oral"
            ],
            CulturalCategory.LITERATURE_ARTS: [
                "Eminescu", "Creangă", "Caragiale", "Sadoveanu", "Rebreanu", "Arghezi",
                "Blaga", "Eliade", "Cărtărescu", "Manea", "Cioran", "Ionesco"
            ],
            CulturalCategory.MUSIC_FOLKLORE: [
                "doină", "bocet", "colindă", "cântec de leagăn", "cântec de nuntă",
                "muzică populară", "instrumente tradiționale", "cimpoiul", "fluierul"
            ],
            CulturalCategory.CUISINE_GASTRONOMY: [
                "mici", "mămăligă", "sarmale", "ciorbă de burtă", "papanași", "cozonac",
                "tochitură", "salată de icre", "ciulama", "drob", "pască", "ștefan cel mare"
            ],
            CulturalCategory.CELEBRATIONS_FESTIVALS: [
                "Crăciun", "Paște", "Rusalii", "Bobotează", "Sfântul Nicolae", "Dragobete",
                "Ziua Națională", "George Enescu Festival", "Sibiu International Theatre Festival"
            ],
            CulturalCategory.NATIONAL_SYMBOLS: [
                "drapel tricolor", "stemă", "imnul național", "stejarul", "lupul", "vulturul",
                "Carpații", "Dunărea", "Marea Neagră", "Delta Dunării"
            ],
            CulturalCategory.MODERN_CULTURE: [
                "cinematografie română", "teatru național", "artă contemporană", "muzică rock",
                "literatură modernă", "tehnologie", "startup-uri", "inovație"
            ]
        }
        
        # Sentiment analysis patterns
        self.sentiment_patterns = {
            SentimentCategory.VERY_POSITIVE: [
                r"\b(excepțional|minunat|fantastic|extraordinar|perfect|genial)\b",
                r"\b(foarte bun|foarte frumos|foarte plăcut)\b",
                r"\b(îmi place foarte mult|adoro|îndrăgesc)\b"
            ],
            SentimentCategory.POSITIVE: [
                r"\b(bun|frumos|plăcut|interesant|util|fain)\b",
                r"\b(îmi place|apreciez|recomand)\b",
                r"\b(mulțumesc|recunoscător|satisfăcut)\b"
            ],
            SentimentCategory.NEUTRAL: [
                r"\b(ok|acceptabil|normal|obișnuit|standard)\b",
                r"\b(informativ|factual|obiectiv)\b"
            ],
            SentimentCategory.NEGATIVE: [
                r"\b(rău|urât|neplăcut|dezamăgitor|supărător)\b",
                r"\b(nu îmi place|dezaprob|critic)\b",
                r"\b(problemă|dificultate|neplăcere)\b"
            ],
            SentimentCategory.VERY_NEGATIVE: [
                r"\b(oribil|dezastruos|îngrozitor|inacceptabil|revoltător)\b",
                r"\b(urăsc|detesc|dezgustător)\b"
            ],
            SentimentCategory.CULTURAL_PRIDE: [
                r"\b(mândru să fiu român|patriot|dragoste de țară)\b",
                r"\b(tradițiile noastre|valorile românești|cultura română)\b",
                r"\b(România frumoasă|țara mea|românii sunt)\b"
            ],
            SentimentCategory.NOSTALGIA: [
                r"\b(pe vremuri|odinioară|în trecut|amintiri)\b",
                r"\b(dor de casă|nostalgie|tinerețe)\b",
                r"\b(copilăria|bunica|satul natal)\b"
            ]
        }
        
        # Regional context patterns
        self.regional_patterns = {
            "Transilvania": [
                r"\b(ardelean|ardeleancă|Transilvania|Ardeal|Cluj|Brașov|Sibiu)\b",
                r"\b(Saxon|secui|ungur|german|multicultural)\b"
            ],
            "Moldova": [
                r"\b(moldovean|moldoveancă|Moldova|Iași|Suceava|Botoșani)\b",
                r"\b(Ștefan cel Mare|mănăstiri|Bucovina)\b"
            ],
            "Muntenia": [
                r"\b(muntean|münteancă|Muntenia|București|Ploiești|Târgoviște)\b",
                r"\b(capitala|Wallachia|Țara Românească)\b"
            ],
            "Oltenia": [
                r"\b(oltean|olteancă|Oltenia|Craiova|Târgu Jiu|Slatina)\b",
                r"\b(Brâncuși|Petrache Poenaru)\b"
            ],
            "Dobrogea": [
                r"\b(dobrogean|dobrogeancă|Dobrogea|Constanța|Tulcea)\b",
                r"\b(Marea Neagră|Delta Dunării|multicultural)\b"
            ]
        }
        
        # Performance metrics
        self.engine_metrics = RealTimeMetrics()
        self.processing_times = deque(maxlen=1000)
        
        # Session management
        self.session = None
        self.is_running = False
        
    async def initialize(self):
        """Initialize the streaming analytics engine."""
        self.session = aiohttp.ClientSession()
        self.is_running = True
        
        # Start background processors
        asyncio.create_task(self._metrics_aggregator())
        asyncio.create_task(self._buffer_manager())
        asyncio.create_task(self._trend_analyzer())
        
        logger.info("🚀 Streaming Analytics Engine initialized")
        logger.info(f"📊 Cultural entities loaded: {sum(len(entities) for entities in self.cultural_entities.values())}")
        logger.info(f"🎭 Sentiment patterns configured: {len(self.sentiment_patterns)}")
        logger.info(f"🗺️ Regional patterns loaded: {len(self.regional_patterns)}")
    
    async def process_stream(self, stream_data: StreamingData) -> AnalyticsResult:
        """Process streaming data and return analytics result."""
        start_time = time.time()
        
        try:
            # Add to streaming buffer
            self.streaming_buffer.append(stream_data)
            
            # Analyze content
            result = await self._analyze_content(stream_data)
            
            # Calculate processing time
            processing_time = (time.time() - start_time) * 1000
            result.processing_time_ms = processing_time
            stream_data.processing_time_ms = processing_time
            
            # Store processing time for metrics
            self.processing_times.append(processing_time)
            
            # Add to results buffer
            self.analytics_results.append(result)
            
            # Update metrics
            await self._update_metrics(stream_data, result)
            
            # Store in CBD
            await self._store_analytics_result(result)
            
            # Notify subscribers
            await self._notify_subscribers(stream_data.stream_type, result)
            
            logger.debug(f"✅ Processed stream {stream_data.stream_id} in {processing_time:.1f}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error processing stream {stream_data.stream_id}: {str(e)}")
            self.engine_metrics.error_rate += 1
            raise
    
    async def _analyze_content(self, stream_data: StreamingData) -> AnalyticsResult:
        """Analyze streaming content for Romanian cultural insights."""
        content_text = str(stream_data.content).lower()
        
        # Cultural entity detection
        detected_entities = self._detect_cultural_entities(content_text)
        
        # Sentiment analysis
        sentiment, sentiment_score = self._analyze_sentiment(content_text)
        
        # Regional context detection
        regional_context = self._detect_regional_context(content_text)
        
        # Linguistic features extraction
        linguistic_features = self._extract_linguistic_features(content_text)
        
        # Calculate cultural score
        cultural_score = self._calculate_cultural_score(
            detected_entities, sentiment, regional_context, linguistic_features
        )
        
        # Determine confidence based on multiple factors
        confidence = self._calculate_confidence(
            detected_entities, sentiment_score, regional_context, linguistic_features
        )
        
        return AnalyticsResult(
            result_id=f"analytics_{int(time.time() * 1000)}",
            stream_type=stream_data.stream_type,
            analysis_type="romanian_cultural_analysis",
            confidence=confidence,
            cultural_score=cultural_score,
            sentiment_score=sentiment_score,
            detected_entities=detected_entities,
            regional_context=regional_context,
            linguistic_features=linguistic_features,
            timestamp=datetime.now(),
            processing_time_ms=0.0  # Will be set by caller
        )
    
    def _detect_cultural_entities(self, text: str) -> List[Dict[str, Any]]:
        """Detect Romanian cultural entities in text."""
        detected = []
        
        for category, entities in self.cultural_entities.items():
            for entity in entities:
                if entity.lower() in text:
                    # Check for exact word boundaries
                    pattern = r'\b' + re.escape(entity.lower()) + r'\b'
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    
                    if matches:
                        detected.append({
                            "entity": entity,
                            "category": category.value,
                            "matches": len(matches),
                            "confidence": min(len(matches) * 0.3, 1.0),
                            "context_start": text.find(entity.lower()),
                            "relevance_score": self._calculate_entity_relevance(entity, text)
                        })
        
        # Sort by relevance and confidence
        detected.sort(key=lambda x: (x["relevance_score"], x["confidence"]), reverse=True)
        
        return detected[:10]  # Return top 10 most relevant entities
    
    def _analyze_sentiment(self, text: str) -> Tuple[SentimentCategory, float]:
        """Analyze sentiment with Romanian cultural context."""
        sentiment_scores = {}
        
        for sentiment_cat, patterns in self.sentiment_patterns.items():
            score = 0.0
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                score += len(matches) * 0.2
            sentiment_scores[sentiment_cat] = min(score, 1.0)
        
        # Find dominant sentiment
        if not any(sentiment_scores.values()):
            return SentimentCategory.NEUTRAL, 0.5
        
        dominant_sentiment = max(sentiment_scores.items(), key=lambda x: x[1])
        
        # Special handling for mixed sentiments
        positive_score = sentiment_scores.get(SentimentCategory.POSITIVE, 0) + \
                        sentiment_scores.get(SentimentCategory.VERY_POSITIVE, 0)
        negative_score = sentiment_scores.get(SentimentCategory.NEGATIVE, 0) + \
                        sentiment_scores.get(SentimentCategory.VERY_NEGATIVE, 0)
        
        if positive_score > 0.3 and negative_score > 0.3:
            return SentimentCategory.MIXED, 0.5
        
        # Convert sentiment to numerical score (0-1 scale)
        sentiment_value_map = {
            SentimentCategory.VERY_NEGATIVE: 0.1,
            SentimentCategory.NEGATIVE: 0.3,
            SentimentCategory.NEUTRAL: 0.5,
            SentimentCategory.POSITIVE: 0.7,
            SentimentCategory.VERY_POSITIVE: 0.9,
            SentimentCategory.CULTURAL_PRIDE: 0.8,
            SentimentCategory.NOSTALGIA: 0.6,
            SentimentCategory.MIXED: 0.5
        }
        
        sentiment_score = sentiment_value_map.get(dominant_sentiment[0], 0.5)
        
        return dominant_sentiment[0], sentiment_score
    
    def _detect_regional_context(self, text: str) -> List[str]:
        """Detect Romanian regional context in text."""
        detected_regions = []
        
        for region, patterns in self.regional_patterns.items():
            region_score = 0.0
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                region_score += len(matches)
            
            if region_score > 0:
                detected_regions.append({
                    "region": region,
                    "score": region_score,
                    "confidence": min(region_score * 0.3, 1.0)
                })
        
        # Sort by score and return region names
        detected_regions.sort(key=lambda x: x["score"], reverse=True)
        return [r["region"] for r in detected_regions]
    
    def _extract_linguistic_features(self, text: str) -> Dict[str, Any]:
        """Extract Romanian linguistic features."""
        features = {
            "text_length": len(text),
            "word_count": len(text.split()),
            "sentence_count": len(re.split(r'[.!?]+', text)),
            "has_diacritics": bool(re.search(r'[ăâîșțĂÂÎȘȚ]', text)),
            "formal_language": self._detect_formality(text),
            "romanian_specific_words": self._count_romanian_specific_words(text),
            "readability_score": self._calculate_readability(text),
            "complexity_level": self._assess_complexity(text)
        }
        
        return features
    
    def _detect_formality(self, text: str) -> bool:
        """Detect if text uses formal Romanian language."""
        formal_indicators = [
            r'\b(domnul|doamna|domnia voastră|stimată|stimate)\b',
            r'\b(vă rog|mulțumesc frumos|cu respect|cu stimă)\b',
            r'\b(în atenția|prin prezenta|să binevoiți)\b'
        ]
        
        formal_count = sum(len(re.findall(pattern, text, re.IGNORECASE)) 
                          for pattern in formal_indicators)
        
        return formal_count > 0
    
    def _count_romanian_specific_words(self, text: str) -> int:
        """Count Romanian-specific words that don't exist in other languages."""
        romanian_specific = [
            "dor", "saudade", "mămăligă", "țuică", "pălincă", "mici", "papanași",
            "colindă", "doină", "bocet", "sezătoare", "pomană", "parastas"
        ]
        
        count = 0
        for word in romanian_specific:
            count += len(re.findall(r'\b' + re.escape(word) + r'\b', text, re.IGNORECASE))
        
        return count
    
    def _calculate_readability(self, text: str) -> float:
        """Calculate readability score (simplified Romanian adaptation)."""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        if not words or not sentences:
            return 0.0
        
        avg_words_per_sentence = len(words) / len(sentences)
        avg_syllables_per_word = sum(self._count_syllables(word) for word in words) / len(words)
        
        # Simplified readability formula adapted for Romanian
        readability = 100 - (1.015 * avg_words_per_sentence) - (84.6 * avg_syllables_per_word)
        
        return max(0.0, min(100.0, readability)) / 100.0
    
    def _count_syllables(self, word: str) -> int:
        """Count syllables in a Romanian word (simplified)."""
        word = word.lower()
        vowels = "aeiouăâî"
        count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                count += 1
            prev_was_vowel = is_vowel
        
        return max(1, count)  # At least one syllable
    
    def _assess_complexity(self, text: str) -> str:
        """Assess linguistic complexity level."""
        words = text.split()
        complex_words = sum(1 for word in words if len(word) > 7)
        complex_ratio = complex_words / len(words) if words else 0
        
        if complex_ratio > 0.3:
            return "high"
        elif complex_ratio > 0.15:
            return "medium"
        else:
            return "low"
    
    def _calculate_entity_relevance(self, entity: str, text: str) -> float:
        """Calculate relevance score for detected entity."""
        # Context window analysis
        entity_pos = text.lower().find(entity.lower())
        if entity_pos == -1:
            return 0.0
        
        # Extract context around entity (50 characters before and after)
        start = max(0, entity_pos - 50)
        end = min(len(text), entity_pos + len(entity) + 50)
        context = text[start:end]
        
        # Score based on contextual relevance
        relevance_indicators = [
            "important", "significant", "cunoscut", "faimos", "celebru",
            "tradiție", "cultură", "istorie", "patrimoniu", "național"
        ]
        
        relevance_score = sum(1 for indicator in relevance_indicators 
                             if indicator in context.lower())
        
        return min(relevance_score * 0.2, 1.0)
    
    def _calculate_cultural_score(self, entities: List[Dict], sentiment: SentimentCategory,
                                regional_context: List[str], linguistic_features: Dict) -> float:
        """Calculate overall cultural score."""
        score = 0.0
        
        # Entity contribution (40% of score)
        if entities:
            entity_score = sum(e["confidence"] * e["relevance_score"] for e in entities)
            score += min(entity_score / len(entities), 1.0) * 0.4
        
        # Regional context contribution (20% of score)
        if regional_context:
            score += min(len(regional_context) * 0.2, 1.0) * 0.2
        
        # Linguistic features contribution (30% of score)
        linguistic_score = 0.0
        if linguistic_features.get("has_diacritics"):
            linguistic_score += 0.3
        if linguistic_features.get("romanian_specific_words", 0) > 0:
            linguistic_score += 0.4
        if linguistic_features.get("formal_language"):
            linguistic_score += 0.2
        
        score += min(linguistic_score, 1.0) * 0.3
        
        # Sentiment boost for cultural pride (10% of score)
        if sentiment == SentimentCategory.CULTURAL_PRIDE:
            score += 0.1
        elif sentiment == SentimentCategory.NOSTALGIA:
            score += 0.05
        
        return min(score, 1.0)
    
    def _calculate_confidence(self, entities: List[Dict], sentiment_score: float,
                            regional_context: List[str], linguistic_features: Dict) -> float:
        """Calculate confidence in analysis results."""
        confidence_factors = []
        
        # Entity detection confidence
        if entities:
            avg_entity_confidence = statistics.mean(e["confidence"] for e in entities)
            confidence_factors.append(avg_entity_confidence)
        else:
            confidence_factors.append(0.3)  # Lower confidence without entities
        
        # Sentiment confidence (based on clarity of sentiment indicators)
        if sentiment_score < 0.2 or sentiment_score > 0.8:
            confidence_factors.append(0.8)  # Clear sentiment
        else:
            confidence_factors.append(0.6)  # Moderate sentiment
        
        # Regional context confidence
        if regional_context:
            confidence_factors.append(0.7)
        else:
            confidence_factors.append(0.4)
        
        # Linguistic features confidence
        linguistic_confidence = 0.5
        if linguistic_features.get("has_diacritics"):
            linguistic_confidence += 0.2
        if linguistic_features.get("romanian_specific_words", 0) > 0:
            linguistic_confidence += 0.2
        
        confidence_factors.append(min(linguistic_confidence, 1.0))
        
        return statistics.mean(confidence_factors)
    
    async def _update_metrics(self, stream_data: StreamingData, result: AnalyticsResult):
        """Update real-time metrics."""
        self.engine_metrics.total_streams_processed += 1
        self.engine_metrics.active_streams = len(self.active_streams)
        
        # Update cultural score average
        if self.engine_metrics.average_cultural_score == 0:
            self.engine_metrics.average_cultural_score = result.cultural_score
        else:
            self.engine_metrics.average_cultural_score = (
                self.engine_metrics.average_cultural_score + result.cultural_score
            ) / 2
        
        # Update Romanian content ratio
        if result.cultural_score > 0.3:
            romanian_content_count = sum(1 for r in self.analytics_results 
                                       if r.cultural_score > 0.3)
            self.engine_metrics.romanian_content_ratio = (
                romanian_content_count / len(self.analytics_results)
            )
        
        # Update sentiment distribution
        if result.sentiment_score is not None:
            sentiment_key = self._get_sentiment_key(result.sentiment_score)
            if sentiment_key not in self.engine_metrics.sentiment_distribution:
                self.engine_metrics.sentiment_distribution[sentiment_key] = 0
            self.engine_metrics.sentiment_distribution[sentiment_key] += 1
        
        # Update processing speed
        if self.processing_times:
            self.engine_metrics.processing_speed_ms = statistics.mean(self.processing_times)
        
        # Update top cultural categories
        category_counts = defaultdict(int)
        for analytics_result in self.analytics_results:
            for entity in analytics_result.detected_entities:
                category_counts[entity["category"]] += 1
        
        self.engine_metrics.top_cultural_categories = sorted(
            category_counts.items(), key=lambda x: x[1], reverse=True
        )[:5]
    
    def _get_sentiment_key(self, sentiment_score: float) -> str:
        """Convert sentiment score to category key."""
        if sentiment_score >= 0.8:
            return "very_positive"
        elif sentiment_score >= 0.6:
            return "positive"
        elif sentiment_score >= 0.4:
            return "neutral"
        elif sentiment_score >= 0.2:
            return "negative"
        else:
            return "very_negative"
    
    async def _notify_subscribers(self, stream_type: AnalyticsStreamType, result: AnalyticsResult):
        """Notify subscribers of new analytics results."""
        subscribers = self.stream_subscribers.get(stream_type, [])
        
        for subscriber in subscribers:
            try:
                await subscriber(result)
            except Exception as e:
                logger.error(f"❌ Error notifying subscriber: {str(e)}")
    
    async def _store_analytics_result(self, result: AnalyticsResult):
        """Store analytics result in CBD."""
        try:
            result_data = {
                "collection": "romai_streaming_analytics",
                "document": {
                    "result_id": result.result_id,
                    "stream_type": result.stream_type.value,
                    "analysis_type": result.analysis_type,
                    "confidence": result.confidence,
                    "cultural_score": result.cultural_score,
                    "sentiment_score": result.sentiment_score,
                    "detected_entities": result.detected_entities,
                    "regional_context": result.regional_context,
                    "linguistic_features": result.linguistic_features,
                    "timestamp": result.timestamp.isoformat(),
                    "processing_time_ms": result.processing_time_ms
                }
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=result_data) as response:
                if response.status == 200:
                    logger.debug(f"✅ Analytics result {result.result_id} stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing analytics result in CBD: {str(e)}")
    
    # Background tasks
    async def _metrics_aggregator(self):
        """Aggregate metrics periodically."""
        while self.is_running:
            try:
                # Create metrics snapshot
                metrics_snapshot = {
                    "timestamp": datetime.now().isoformat(),
                    "total_streams_processed": self.engine_metrics.total_streams_processed,
                    "romanian_content_ratio": self.engine_metrics.romanian_content_ratio,
                    "average_cultural_score": self.engine_metrics.average_cultural_score,
                    "sentiment_distribution": dict(self.engine_metrics.sentiment_distribution),
                    "top_cultural_categories": self.engine_metrics.top_cultural_categories,
                    "processing_speed_ms": self.engine_metrics.processing_speed_ms,
                    "error_rate": self.engine_metrics.error_rate,
                    "active_streams": self.engine_metrics.active_streams,
                    "buffer_utilization": len(self.streaming_buffer) / self.max_buffer_size
                }
                
                # Add to metrics buffer
                self.metrics_buffer.append(metrics_snapshot)
                
                # Store aggregated metrics in CBD
                await self._store_metrics_in_cbd(metrics_snapshot)
                
                await asyncio.sleep(5)  # Aggregate every 5 seconds
                
            except Exception as e:
                logger.error(f"❌ Metrics aggregator error: {str(e)}")
                await asyncio.sleep(30)
    
    async def _buffer_manager(self):
        """Manage streaming buffers and cleanup."""
        while self.is_running:
            try:
                # Clean old entries (older than 1 hour)
                cutoff_time = datetime.now() - timedelta(hours=1)
                
                # Clean analytics results
                self.analytics_results = deque(
                    (r for r in self.analytics_results if r.timestamp > cutoff_time),
                    maxlen=self.max_buffer_size
                )
                
                # Clean streaming buffer
                self.streaming_buffer = deque(
                    (s for s in self.streaming_buffer if s.timestamp > cutoff_time),
                    maxlen=self.max_buffer_size
                )
                
                logger.debug(f"🧹 Buffer cleanup: {len(self.analytics_results)} results, {len(self.streaming_buffer)} streams")
                
                await asyncio.sleep(300)  # Clean every 5 minutes
                
            except Exception as e:
                logger.error(f"❌ Buffer manager error: {str(e)}")
                await asyncio.sleep(300)
    
    async def _trend_analyzer(self):
        """Analyze trends in Romanian cultural content."""
        while self.is_running:
            try:
                if len(self.analytics_results) >= 10:
                    # Analyze cultural trends
                    recent_results = list(self.analytics_results)[-50:]  # Last 50 results
                    
                    # Cultural category trends
                    category_trends = defaultdict(list)
                    for result in recent_results:
                        for entity in result.detected_entities:
                            category_trends[entity["category"]].append(entity["confidence"])
                    
                    # Sentiment trends
                    sentiment_trend = [r.sentiment_score for r in recent_results if r.sentiment_score]
                    
                    # Regional trends
                    regional_trends = defaultdict(int)
                    for result in recent_results:
                        for region in result.regional_context:
                            regional_trends[region] += 1
                    
                    # Store trend analysis
                    trend_data = {
                        "timestamp": datetime.now().isoformat(),
                        "category_trends": {
                            cat: {
                                "count": len(scores),
                                "average_confidence": statistics.mean(scores) if scores else 0,
                                "trend": "increasing" if len(scores) > 5 else "stable"
                            }
                            for cat, scores in category_trends.items()
                        },
                        "sentiment_trend": {
                            "average": statistics.mean(sentiment_trend) if sentiment_trend else 0.5,
                            "volatility": statistics.stdev(sentiment_trend) if len(sentiment_trend) > 1 else 0,
                            "sample_size": len(sentiment_trend)
                        },
                        "regional_trends": dict(regional_trends),
                        "cultural_engagement": self.engine_metrics.romanian_content_ratio
                    }
                    
                    await self._store_trends_in_cbd(trend_data)
                    
                await asyncio.sleep(60)  # Analyze trends every minute
                
            except Exception as e:
                logger.error(f"❌ Trend analyzer error: {str(e)}")
                await asyncio.sleep(60)
    
    async def _store_metrics_in_cbd(self, metrics: Dict[str, Any]):
        """Store metrics in CBD."""
        try:
            metrics_data = {
                "collection": "romai_streaming_metrics",
                "document": metrics
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=metrics_data) as response:
                if response.status == 200:
                    logger.debug("✅ Metrics stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing metrics in CBD: {str(e)}")
    
    async def _store_trends_in_cbd(self, trends: Dict[str, Any]):
        """Store trend analysis in CBD."""
        try:
            trends_data = {
                "collection": "romai_cultural_trends",
                "document": trends
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=trends_data) as response:
                if response.status == 200:
                    logger.debug("✅ Trends stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing trends in CBD: {str(e)}")
    
    # Public API methods
    def subscribe_to_stream(self, stream_type: AnalyticsStreamType, callback: callable):
        """Subscribe to analytics stream."""
        self.stream_subscribers[stream_type].append(callback)
        logger.info(f"📡 Subscribed to {stream_type.value} stream")
    
    def unsubscribe_from_stream(self, stream_type: AnalyticsStreamType, callback: callable):
        """Unsubscribe from analytics stream."""
        if callback in self.stream_subscribers[stream_type]:
            self.stream_subscribers[stream_type].remove(callback)
            logger.info(f"📡 Unsubscribed from {stream_type.value} stream")
    
    def get_real_time_metrics(self) -> RealTimeMetrics:
        """Get current real-time metrics."""
        return self.engine_metrics
    
    def get_recent_results(self, limit: int = 50) -> List[AnalyticsResult]:
        """Get recent analytics results."""
        return list(self.analytics_results)[-limit:]
    
    def get_cultural_trends(self) -> Dict[str, Any]:
        """Get current cultural trends."""
        if not self.analytics_results:
            return {}
        
        recent_results = list(self.analytics_results)[-100:]
        
        # Top entities
        entity_counts = defaultdict(int)
        for result in recent_results:
            for entity in result.detected_entities:
                entity_counts[entity["entity"]] += 1
        
        top_entities = sorted(entity_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Regional distribution
        regional_counts = defaultdict(int)
        for result in recent_results:
            for region in result.regional_context:
                regional_counts[region] += 1
        
        return {
            "top_entities": top_entities,
            "regional_distribution": dict(regional_counts),
            "average_cultural_score": self.engine_metrics.average_cultural_score,
            "sentiment_distribution": self.engine_metrics.sentiment_distribution,
            "total_analyzed": len(recent_results)
        }
    
    async def cleanup(self):
        """Cleanup engine resources."""
        self.is_running = False
        
        # Cancel active streams
        for task in self.active_streams.values():
            task.cancel()
        
        if self.session:
            await self.session.close()
        
        logger.info("🧹 Streaming Analytics Engine cleanup completed")

# Example usage and testing
async def test_streaming_analytics():
    """Test the streaming analytics engine."""
    logger.info("🚀 Testing Streaming Analytics Engine")
    
    engine = StreamingAnalyticsEngine()
    
    try:
        await engine.initialize()
        
        # Test data with Romanian cultural content
        test_streams = [
            StreamingData(
                stream_id="test_001",
                stream_type=AnalyticsStreamType.CULTURAL_CONTENT,
                content={
                    "text": "Ștefan cel Mare a fost un domnitor măreț al Moldovei. Tradițiile românești din Transilvania sunt foarte frumoase.",
                    "source": "cultural_article"
                },
                metadata={"author": "test", "language": "ro"},
                timestamp=datetime.now()
            ),
            StreamingData(
                stream_id="test_002",
                stream_type=AnalyticsStreamType.SENTIMENT_ANALYSIS,
                content={
                    "text": "Îmi place foarte mult mămăliga cu brânză și smântână. Dorul de casă mă face să îmi amintesc de bunica.",
                    "source": "user_comment"
                },
                metadata={"sentiment_context": "nostalgia"},
                timestamp=datetime.now()
            ),
            StreamingData(
                stream_id="test_003",
                stream_type=AnalyticsStreamType.LANGUAGE_PROCESSING,
                content={
                    "text": "Bucureștiul este capitala României, iar Cluj-Napoca este inima Transilvaniei.",
                    "source": "geographical_info"
                },
                metadata={"topic": "geography"},
                timestamp=datetime.now()
            )
        ]
        
        # Process test streams
        results = []
        for stream_data in test_streams:
            result = await engine.process_stream(stream_data)
            results.append(result)
            logger.info(f"📊 Processed {stream_data.stream_id}: Cultural Score {result.cultural_score:.2f}")
        
        # Get metrics
        metrics = engine.get_real_time_metrics()
        logger.info("📈 Engine Metrics:")
        logger.info(f"Total Streams: {metrics.total_streams_processed}")
        logger.info(f"Romanian Content Ratio: {metrics.romanian_content_ratio:.2f}")
        logger.info(f"Average Cultural Score: {metrics.average_cultural_score:.2f}")
        logger.info(f"Processing Speed: {metrics.processing_speed_ms:.1f}ms")
        
        # Get cultural trends
        trends = engine.get_cultural_trends()
        logger.info("🎭 Cultural Trends:")
        logger.info(f"Top Entities: {trends.get('top_entities', [])[:3]}")
        logger.info(f"Regional Distribution: {trends.get('regional_distribution', {})}")
        
        # Test subscription
        async def result_handler(result: AnalyticsResult):
            logger.info(f"🔔 Notification: New result with cultural score {result.cultural_score:.2f}")
        
        engine.subscribe_to_stream(AnalyticsStreamType.CULTURAL_CONTENT, result_handler)
        
        # Process one more stream to test subscription
        test_stream = StreamingData(
            stream_id="test_004",
            stream_type=AnalyticsStreamType.CULTURAL_CONTENT,
            content={"text": "Colinda este o tradiție românească de Crăciun foarte frumoasă."},
            metadata={"test": "subscription"},
            timestamp=datetime.now()
        )
        
        await engine.process_stream(test_stream)
        
        # Wait a bit for background tasks
        await asyncio.sleep(2)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Analytics test failed: {str(e)}")
        return False
    finally:
        await engine.cleanup()

if __name__ == "__main__":
    print("🚀 RomAI AGI - Streaming Analytics Engine v3.0.0")
    print("=" * 50)
    asyncio.run(test_streaming_analytics())

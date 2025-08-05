#!/usr/bin/env python3
"""
🇷🇴 RomAI AGI - Week 3 Day 4: Romanian Cultural Analytics Dashboard
Specialized analytics dashboard for Romanian cultural processing insights and visualization

This system provides comprehensive analytics, visualization, and insights specifically
focused on Romanian cultural content processing, linguistic patterns, and regional analysis.
"""

import asyncio
import time
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Callable, Union
from dataclasses import dataclass, asdict, field
from collections import defaultdict, deque, Counter
from enum import Enum, auto
import aiohttp
from aiohttp import web, web_response
import aiofiles
import threading
from concurrent.futures import ThreadPoolExecutor
import re
import math

# Enhanced logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RegionType(Enum):
    """Romanian regions"""
    BUCURESTI = "bucuresti"
    TRANSILVANIA = "transilvania"
    MOLDOVA = "moldova"
    MUNTENIA = "muntenia"
    OLTENIA = "oltenia"
    DOBROGEA = "dobrogea"
    BANAT = "banat"
    CRISANA = "crisana"
    MARAMURES = "maramures"

class ContentType(Enum):
    """Types of Romanian content"""
    LITERARY = "literary"
    HISTORICAL = "historical"
    FOLKLORIC = "folkloric"
    CONTEMPORARY = "contemporary"
    EDUCATIONAL = "educational"
    NEWS = "news"
    SOCIAL_MEDIA = "social_media"
    TECHNICAL = "technical"

class LinguisticFeature(Enum):
    """Romanian linguistic features"""
    DIACRITICS = "diacritics"
    ARCHAIC_FORMS = "archaic_forms"
    REGIONAL_DIALECT = "regional_dialect"
    FORMAL_REGISTER = "formal_register"
    COLLOQUIAL = "colloquial"
    POETRY_METER = "poetry_meter"
    FOLK_EXPRESSIONS = "folk_expressions"

@dataclass
class CulturalEntity:
    """Romanian cultural entity"""
    name: str
    category: str
    region: Optional[RegionType] = None
    confidence: float = 0.0
    context: str = ""
    frequency: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LinguisticAnalysis:
    """Romanian linguistic analysis result"""
    text: str
    word_count: int
    diacritics_usage: float
    formality_score: float
    regional_markers: List[str]
    archaic_terms: List[str]
    folk_expressions: List[str]
    complexity_score: float
    readability_score: float
    timestamp: float = field(default_factory=time.time)

@dataclass
class SentimentAnalysis:
    """Romanian sentiment analysis"""
    text: str
    overall_sentiment: str
    positivity_score: float
    negativity_score: float
    neutrality_score: float
    emotional_markers: List[str]
    cultural_context_sentiment: str
    timestamp: float = field(default_factory=time.time)

@dataclass
class RegionalAnalysis:
    """Regional content analysis"""
    region: RegionType
    content_count: int
    dominant_themes: List[str]
    linguistic_features: List[str]
    cultural_markers: List[str]
    sentiment_distribution: Dict[str, float]
    timestamp: float = field(default_factory=time.time)

@dataclass
class TemporalPattern:
    """Temporal pattern in Romanian content"""
    time_period: str
    content_volume: int
    dominant_topics: List[str]
    sentiment_trend: str
    regional_distribution: Dict[str, int]
    linguistic_evolution: Dict[str, float]

class RomanianCulturalProcessor:
    """Advanced Romanian cultural content processor"""
    
    def __init__(self):
        self.cultural_entities = self._load_cultural_entities()
        self.linguistic_patterns = self._load_linguistic_patterns()
        self.regional_keywords = self._load_regional_keywords()
        self.folk_expressions = self._load_folk_expressions()
        self.historical_references = self._load_historical_references()
        
        # Processing statistics
        self.processing_stats = {
            'texts_processed': 0,
            'entities_detected': 0,
            'average_processing_time': 0.0,
            'regional_analysis_count': 0
        }
        
        logger.info("Romanian Cultural Processor initialized")
    
    def _load_cultural_entities(self) -> Dict[str, CulturalEntity]:
        """Load Romanian cultural entities database"""
        entities = {
            # Historical figures
            'mihai_eminescu': CulturalEntity(
                name="Mihai Eminescu",
                category="literatura",
                region=RegionType.MOLDOVA,
                confidence=0.95,
                context="poet national, romantism romanesc"
            ),
            'ion_luca_caragiale': CulturalEntity(
                name="Ion Luca Caragiale",
                category="literatura",
                region=RegionType.MUNTENIA,
                confidence=0.95,
                context="dramaturg, scriitor, comedie"
            ),
            'stefan_cel_mare': CulturalEntity(
                name="Ștefan cel Mare",
                category="istorie",
                region=RegionType.MOLDOVA,
                confidence=0.98,
                context="domnitor, erou national, medieval"
            ),
            'mihai_viteazul': CulturalEntity(
                name="Mihai Viteazul",
                category="istorie",
                region=RegionType.MUNTENIA,
                confidence=0.98,
                context="domnitor, unire, secol XVI"
            ),
            
            # Geographic locations
            'brasov': CulturalEntity(
                name="Brașov",
                category="geografie",
                region=RegionType.TRANSILVANIA,
                confidence=0.90,
                context="oras medieval, Carpati, turism"
            ),
            'sinaia': CulturalEntity(
                name="Sinaia",
                category="geografie",
                region=RegionType.MUNTENIA,
                confidence=0.88,
                context="statiune montana, castelul Peles"
            ),
            'constanta': CulturalEntity(
                name="Constanța",
                category="geografie",
                region=RegionType.DOBROGEA,
                confidence=0.92,
                context="port, Marea Neagra, turism"
            ),
            
            # Cultural traditions
            'martisor': CulturalEntity(
                name="Mărțișor",
                category="traditii",
                confidence=0.95,
                context="1 martie, primavara, traditie"
            ),
            'hora': CulturalEntity(
                name="Hora",
                category="folclor",
                confidence=0.90,
                context="dans traditional, cerc, comunitate"
            ),
            'sarbatori_pascale': CulturalEntity(
                name="Sărbători Pascale",
                category="traditii",
                confidence=0.88,
                context="Paste, religie ortodoxa, primavara"
            ),
            
            # Cuisine
            'mici': CulturalEntity(
                name="Mici",
                category="gastronomie",
                confidence=0.85,
                context="gratar, carne, traditii culinare"
            ),
            'sarmale': CulturalEntity(
                name="Sarmale",
                category="gastronomie",
                confidence=0.90,
                context="Craciun, traditii, carne si orez"
            ),
            'papanasi': CulturalEntity(
                name="Papanași",
                category="gastronomie",
                confidence=0.82,
                context="desert, smantana, dulceata"
            )
        }
        
        return entities
    
    def _load_linguistic_patterns(self) -> Dict[str, List[str]]:
        """Load Romanian linguistic patterns"""
        return {
            'diacritics': ['ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț'],
            'archaic_forms': [
                'iară', 'întru', 'carele', 'iaste', 'să facă', 'că să',
                'însa', 'iară', 'precum', 'asemenea', 'dară'
            ],
            'formal_expressions': [
                'cu respect', 'stimatul', 'distinsul', 'domnul',
                'doamna', 'în vederea', 'prin prezenta', 'cu privire la'
            ],
            'colloquial_expressions': [
                'bă', 'frate', 'mă', 'ce faci', 'noroc', 'salut',
                'păi', 'da bine', 'nu-i bai', 'merge'
            ],
            'regional_moldovan': [
                'în Moldova', 'Chișinău', 'moldovenesc', 'basarabean',
                'Prut', 'Nistru', 'moldovean'
            ],
            'regional_transylvanian': [
                'în Transilvania', 'Cluj', 'Brașov', 'Sibiu', 'ardean',
                'transilvănean', 'Carpați', 'saxon'
            ]
        }
    
    def _load_regional_keywords(self) -> Dict[RegionType, List[str]]:
        """Load regional keywords"""
        return {
            RegionType.BUCURESTI: [
                'București', 'Capitala', 'Centrul Vechi', 'Herastrau',
                'Cotroceni', 'Piața Universității', 'bucureștean'
            ],
            RegionType.TRANSILVANIA: [
                'Transilvania', 'Cluj', 'Brașov', 'Sibiu', 'Târgu Mureș',
                'Carpați', 'ardean', 'transilvănean', 'saxoni'
            ],
            RegionType.MOLDOVA: [
                'Moldova', 'Iași', 'Galați', 'Bacău', 'Suceava',
                'moldovean', 'Prut', 'Siret'
            ],
            RegionType.MUNTENIA: [
                'Muntenia', 'Ploiești', 'Pitești', 'Craiova', 'Târgoviște',
                'muntenesc', 'Câmpia Română'
            ],
            RegionType.OLTENIA: [
                'Oltenia', 'Craiova', 'Slatina', 'Caracal', 'oltean',
                'Jiu', 'Olt'
            ],
            RegionType.DOBROGEA: [
                'Dobrogea', 'Constanța', 'Tulcea', 'Marea Neagră',
                'Delta Dunării', 'dobrogean'
            ],
            RegionType.BANAT: [
                'Banat', 'Timișoara', 'Reșița', 'Caransebeș',
                'bănățean', 'Timiș', 'Caraș'
            ]
        }
    
    def _load_folk_expressions(self) -> List[str]:
        """Load Romanian folk expressions"""
        return [
            'din bătrâni', 'la multi ani', 'să fie într-un ceas bun',
            'să trăiești', 'noroc și sănătate', 'Dumnezeu să te ierte',
            'cu bine', 'în ceasul cel bun', 'să ne auzim de bine',
            'bună ziua', 'sărut mâna', 'să fiți iertați',
            'Doamne ajută', 'cu respect', 'să vă dea Dumnezeu sănătate'
        ]
    
    def _load_historical_references(self) -> Dict[str, str]:
        """Load historical references"""
        return {
            'unirea principatelor': '1859',
            'independenta': '1877',
            'primul razboi mondial': '1914-1918',
            'al doilea razboi mondial': '1939-1945',
            'revolutia din 1989': '1989',
            'aderarea la nato': '2004',
            'aderarea la ue': '2007'
        }
    
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Comprehensive Romanian text analysis"""
        start_time = time.time()
        
        # Linguistic analysis
        linguistic = await self._linguistic_analysis(text)
        
        # Cultural entity detection
        entities = await self._detect_cultural_entities(text)
        
        # Sentiment analysis
        sentiment = await self._sentiment_analysis(text)
        
        # Regional analysis
        regional = await self._regional_analysis(text)
        
        # Content type classification
        content_type = await self._classify_content_type(text)
        
        processing_time = time.time() - start_time
        
        # Update statistics
        self.processing_stats['texts_processed'] += 1
        self.processing_stats['entities_detected'] += len(entities)
        self.processing_stats['average_processing_time'] = (
            (self.processing_stats['average_processing_time'] * (self.processing_stats['texts_processed'] - 1) + processing_time) /
            self.processing_stats['texts_processed']
        )
        
        return {
            'linguistic_analysis': asdict(linguistic),
            'cultural_entities': [asdict(entity) for entity in entities],
            'sentiment_analysis': asdict(sentiment),
            'regional_analysis': asdict(regional) if regional else None,
            'content_type': content_type,
            'processing_time': processing_time,
            'metadata': {
                'text_length': len(text),
                'word_count': len(text.split()),
                'analysis_timestamp': time.time()
            }
        }
    
    async def _linguistic_analysis(self, text: str) -> LinguisticAnalysis:
        """Analyze Romanian linguistic features"""
        words = text.split()
        word_count = len(words)
        
        # Diacritics usage
        diacritics_count = sum(1 for char in text if char in self.linguistic_patterns['diacritics'])
        diacritics_usage = (diacritics_count / len(text)) * 100 if text else 0
        
        # Formality score
        formal_expressions = sum(1 for expr in self.linguistic_patterns['formal_expressions'] if expr in text.lower())
        colloquial_expressions = sum(1 for expr in self.linguistic_patterns['colloquial_expressions'] if expr in text.lower())
        formality_score = max(0, min(100, (formal_expressions - colloquial_expressions) * 20 + 50))
        
        # Regional markers
        regional_markers = []
        for pattern_list in [self.linguistic_patterns['regional_moldovan'], self.linguistic_patterns['regional_transylvanian']]:
            for marker in pattern_list:
                if marker.lower() in text.lower():
                    regional_markers.append(marker)
        
        # Archaic terms
        archaic_terms = [term for term in self.linguistic_patterns['archaic_forms'] if term in text.lower()]
        
        # Folk expressions
        folk_expressions = [expr for expr in self.folk_expressions if expr.lower() in text.lower()]
        
        # Complexity score (based on sentence length, vocabulary variety)
        sentences = text.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        unique_words = len(set(words))
        vocabulary_diversity = unique_words / word_count if word_count > 0 else 0
        complexity_score = min(100, (avg_sentence_length * 2) + (vocabulary_diversity * 50))
        
        # Readability score (simplified)
        readability_score = max(0, 100 - complexity_score * 0.8)
        
        return LinguisticAnalysis(
            text=text[:100] + "..." if len(text) > 100 else text,
            word_count=word_count,
            diacritics_usage=diacritics_usage,
            formality_score=formality_score,
            regional_markers=regional_markers,
            archaic_terms=archaic_terms,
            folk_expressions=folk_expressions,
            complexity_score=complexity_score,
            readability_score=readability_score
        )
    
    async def _detect_cultural_entities(self, text: str) -> List[CulturalEntity]:
        """Detect Romanian cultural entities in text"""
        detected_entities = []
        text_lower = text.lower()
        
        for entity_key, entity in self.cultural_entities.items():
            # Simple keyword matching (could be enhanced with NLP)
            if entity.name.lower() in text_lower:
                detected_entity = CulturalEntity(
                    name=entity.name,
                    category=entity.category,
                    region=entity.region,
                    confidence=entity.confidence,
                    context=entity.context,
                    frequency=text_lower.count(entity.name.lower())
                )
                detected_entities.append(detected_entity)
        
        return detected_entities
    
    async def _sentiment_analysis(self, text: str) -> SentimentAnalysis:
        """Analyze sentiment in Romanian text"""
        # Simplified Romanian sentiment analysis
        positive_words = [
            'bun', 'frumos', 'minunat', 'excelent', 'perfect', 'fantastic',
            'iubire', 'fericire', 'bucurie', 'pace', 'noroc', 'success'
        ]
        
        negative_words = [
            'rău', 'urât', 'groaznic', 'teribil', 'îngrozitor', 'dezastruos',
            'tristețe', 'durere', 'suferință', 'problemă', 'greșeală', 'eșec'
        ]
        
        neutral_words = [
            'normal', 'obișnuit', 'standard', 'mediu', 'simplu', 'basic'
        ]
        
        text_words = text.lower().split()
        
        positive_count = sum(1 for word in text_words if any(pos in word for pos in positive_words))
        negative_count = sum(1 for word in text_words if any(neg in word for neg in negative_words))
        neutral_count = sum(1 for word in text_words if any(neu in word for neu in neutral_words))
        
        total_sentiment_words = positive_count + negative_count + neutral_count
        
        if total_sentiment_words == 0:
            positivity_score = neutrality_score = negativity_score = 33.33
            overall_sentiment = "neutru"
        else:
            positivity_score = (positive_count / total_sentiment_words) * 100
            negativity_score = (negative_count / total_sentiment_words) * 100
            neutrality_score = (neutral_count / total_sentiment_words) * 100
            
            if positivity_score > negativity_score and positivity_score > neutrality_score:
                overall_sentiment = "pozitiv"
            elif negativity_score > positivity_score and negativity_score > neutrality_score:
                overall_sentiment = "negativ"
            else:
                overall_sentiment = "neutru"
        
        # Emotional markers
        emotional_markers = []
        if 'iubire' in text.lower():
            emotional_markers.append('iubire')
        if 'frică' in text.lower():
            emotional_markers.append('frică')
        if 'bucurie' in text.lower():
            emotional_markers.append('bucurie')
        
        return SentimentAnalysis(
            text=text[:100] + "..." if len(text) > 100 else text,
            overall_sentiment=overall_sentiment,
            positivity_score=positivity_score,
            negativity_score=negativity_score,
            neutrality_score=neutrality_score,
            emotional_markers=emotional_markers,
            cultural_context_sentiment="traditional" if any(folk in text.lower() for folk in self.folk_expressions[:5]) else "modern"
        )
    
    async def _regional_analysis(self, text: str) -> Optional[RegionalAnalysis]:
        """Analyze regional markers in text"""
        text_lower = text.lower()
        region_scores = {}
        
        for region, keywords in self.regional_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            if score > 0:
                region_scores[region] = score
        
        if not region_scores:
            return None
        
        # Get dominant region
        dominant_region = max(region_scores.items(), key=lambda x: x[1])[0]
        
        # Extract themes (simplified)
        themes = []
        if 'istorie' in text_lower or 'istoric' in text_lower:
            themes.append('istorie')
        if 'cultură' in text_lower or 'cultural' in text_lower:
            themes.append('cultură')
        if 'tradițional' in text_lower or 'tradiție' in text_lower:
            themes.append('tradiții')
        
        return RegionalAnalysis(
            region=dominant_region,
            content_count=1,
            dominant_themes=themes,
            linguistic_features=[],
            cultural_markers=list(region_scores.keys()),
            sentiment_distribution={'pozitiv': 50.0, 'neutru': 30.0, 'negativ': 20.0}  # Mock data
        )
    
    async def _classify_content_type(self, text: str) -> ContentType:
        """Classify Romanian content type"""
        text_lower = text.lower()
        
        # Simple classification based on keywords
        if any(word in text_lower for word in ['poezie', 'poem', 'versuri', 'rimă']):
            return ContentType.LITERARY
        elif any(word in text_lower for word in ['istorie', 'istoric', 'trecut', 'război']):
            return ContentType.HISTORICAL
        elif any(word in text_lower for word in ['folclor', 'tradiție', 'bătrâni', 'obicei']):
            return ContentType.FOLKLORIC
        elif any(word in text_lower for word in ['tehnologie', 'computer', 'internet', 'digital']):
            return ContentType.TECHNICAL
        elif any(word in text_lower for word in ['știri', 'news', 'actualitate', 'informație']):
            return ContentType.NEWS
        elif any(word in text_lower for word in ['facebook', 'instagram', 'social', 'like']):
            return ContentType.SOCIAL_MEDIA
        elif any(word in text_lower for word in ['școală', 'învățare', 'educație', 'student']):
            return ContentType.EDUCATIONAL
        else:
            return ContentType.CONTEMPORARY

class AnalyticsDashboard:
    """Romanian Cultural Analytics Dashboard Web Interface"""
    
    def __init__(self, port: int = 8090):
        self.port = port
        self.app = web.Application()
        self.processor = RomanianCulturalProcessor()
        self.analysis_history: List[Dict[str, Any]] = []
        self.start_time = time.time()
        
        # Dashboard statistics
        self.dashboard_stats = {
            'page_views': 0,
            'api_calls': 0,
            'total_analyses': 0,
            'unique_sessions': set()
        }
        
        # Setup routes
        self._setup_routes()
        
        logger.info(f"Romanian Cultural Analytics Dashboard initialized on port {port}")
    
    def _setup_routes(self):
        """Setup web routes"""
        self.app.router.add_get('/', self.dashboard_home)
        self.app.router.add_get('/api/analyze', self.api_analyze_text)
        self.app.router.add_post('/api/analyze', self.api_analyze_text_post)
        self.app.router.add_get('/api/stats', self.api_get_stats)
        self.app.router.add_get('/api/history', self.api_get_history)
        self.app.router.add_get('/api/cultural-entities', self.api_get_cultural_entities)
        self.app.router.add_get('/api/regional-insights', self.api_get_regional_insights)
        self.app.router.add_static('/', path='static', name='static')
    
    async def dashboard_home(self, request):
        """Serve main dashboard page"""
        self.dashboard_stats['page_views'] += 1
        
        html_content = self._generate_dashboard_html()
        return web.Response(text=html_content, content_type='text/html')
    
    async def api_analyze_text(self, request):
        """API endpoint for text analysis"""
        self.dashboard_stats['api_calls'] += 1
        
        if request.method == 'GET':
            text = request.query.get('text', '')
        else:  # POST
            data = await request.json()
            text = data.get('text', '')
        
        if not text:
            return web.json_response({'error': 'No text provided'}, status=400)
        
        try:
            analysis = await self.processor.analyze_text(text)
            
            # Store in history
            analysis['id'] = str(uuid.uuid4())
            analysis['timestamp'] = time.time()
            self.analysis_history.append(analysis)
            self.dashboard_stats['total_analyses'] += 1
            
            # Keep only last 100 analyses
            if len(self.analysis_history) > 100:
                self.analysis_history = self.analysis_history[-100:]
            
            return web.json_response(analysis)
            
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def api_analyze_text_post(self, request):
        """POST endpoint for text analysis"""
        return await self.api_analyze_text(request)
    
    async def api_get_stats(self, request):
        """Get dashboard statistics"""
        uptime = time.time() - self.start_time
        
        # Calculate analysis statistics
        if self.analysis_history:
            total_entities = sum(len(analysis.get('cultural_entities', [])) for analysis in self.analysis_history)
            avg_processing_time = sum(analysis.get('processing_time', 0) for analysis in self.analysis_history) / len(self.analysis_history)
            
            # Content type distribution
            content_types = [analysis.get('content_type', 'unknown') for analysis in self.analysis_history]
            content_type_counts = Counter(content_types)
            
            # Regional distribution
            regional_data = []
            for analysis in self.analysis_history:
                regional_analysis = analysis.get('regional_analysis')
                if regional_analysis:
                    regional_data.append(regional_analysis['region'])
            regional_counts = Counter(regional_data)
            
            # Sentiment distribution
            sentiments = [analysis.get('sentiment_analysis', {}).get('overall_sentiment', 'unknown') for analysis in self.analysis_history]
            sentiment_counts = Counter(sentiments)
        else:
            total_entities = 0
            avg_processing_time = 0
            content_type_counts = Counter()
            regional_counts = Counter()
            sentiment_counts = Counter()
        
        stats = {
            'dashboard_stats': self.dashboard_stats.copy(),
            'system_stats': {
                'uptime_seconds': uptime,
                'total_analyses': len(self.analysis_history),
                'total_entities_detected': total_entities,
                'average_processing_time': avg_processing_time,
                'processor_stats': self.processor.processing_stats
            },
            'content_analysis': {
                'content_type_distribution': dict(content_type_counts),
                'regional_distribution': dict(regional_counts),
                'sentiment_distribution': dict(sentiment_counts)
            },
            'timestamp': time.time()
        }
        
        # Convert set to list for JSON serialization
        stats['dashboard_stats']['unique_sessions'] = len(self.dashboard_stats['unique_sessions'])
        
        return web.json_response(stats)
    
    async def api_get_history(self, request):
        """Get analysis history"""
        limit = int(request.query.get('limit', 20))
        offset = int(request.query.get('offset', 0))
        
        # Get subset of history
        history_subset = self.analysis_history[offset:offset + limit]
        
        return web.json_response({
            'history': history_subset,
            'total_count': len(self.analysis_history),
            'limit': limit,
            'offset': offset
        })
    
    async def api_get_cultural_entities(self, request):
        """Get cultural entities overview"""
        entities_data = {}
        
        for entity_key, entity in self.processor.cultural_entities.items():
            entities_data[entity_key] = {
                'name': entity.name,
                'category': entity.category,
                'region': entity.region.value if entity.region else None,
                'confidence': entity.confidence,
                'context': entity.context
            }
        
        return web.json_response({
            'cultural_entities': entities_data,
            'total_count': len(entities_data),
            'categories': list(set(entity.category for entity in self.processor.cultural_entities.values()))
        })
    
    async def api_get_regional_insights(self, request):
        """Get regional insights"""
        regional_insights = {}
        
        for region in RegionType:
            keywords = self.processor.regional_keywords.get(region, [])
            
            # Count occurrences in analysis history
            region_count = 0
            for analysis in self.analysis_history:
                regional_analysis = analysis.get('regional_analysis')
                if regional_analysis and regional_analysis['region'] == region.value:
                    region_count += 1
            
            regional_insights[region.value] = {
                'name': region.value.title(),
                'keywords': keywords,
                'analysis_count': region_count,
                'percentage': (region_count / len(self.analysis_history) * 100) if self.analysis_history else 0
            }
        
        return web.json_response({
            'regional_insights': regional_insights,
            'total_regions': len(RegionType)
        })
    
    def _generate_dashboard_html(self) -> str:
        """Generate dashboard HTML"""
        return """
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🇷🇴 RomAI - Dashboard Analitică Culturală</title>
    <style>
        :root {
            --romanian-blue: #002B7F;
            --romanian-yellow: #FCD116;
            --romanian-red: #CE1126;
            --bg-dark: #1a1a1a;
            --bg-light: #2d2d2d;
            --text-light: #ffffff;
            --text-muted: #cccccc;
            --border: #444444;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-light) 100%);
            color: var(--text-light);
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(90deg, var(--romanian-blue), var(--romanian-red));
            padding: 1rem 2rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: var(--bg-light);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        
        .card h3 {
            color: var(--romanian-yellow);
            margin-bottom: 1rem;
            font-size: 1.3rem;
            border-bottom: 2px solid var(--romanian-blue);
            padding-bottom: 0.5rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--romanian-red);
            margin: 0.5rem 0;
        }
        
        .text-analysis {
            grid-column: 1 / -1;
        }
        
        .input-group {
            margin-bottom: 1rem;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
            color: var(--romanian-yellow);
        }
        
        textarea {
            width: 100%;
            min-height: 120px;
            padding: 1rem;
            background: var(--bg-dark);
            border: 2px solid var(--border);
            border-radius: 8px;
            color: var(--text-light);
            font-size: 1rem;
            resize: vertical;
            transition: border-color 0.3s ease;
        }
        
        textarea:focus {
            outline: none;
            border-color: var(--romanian-blue);
        }
        
        .btn {
            background: linear-gradient(90deg, var(--romanian-blue), var(--romanian-red));
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .results {
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--bg-dark);
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        
        .results h4 {
            color: var(--romanian-yellow);
            margin-bottom: 1rem;
        }
        
        .entity-tag {
            display: inline-block;
            background: var(--romanian-blue);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            margin: 0.2rem;
            font-size: 0.9rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }
        
        .loading {
            text-align: center;
            color: var(--romanian-yellow);
            font-style: italic;
        }
        
        .chart {
            height: 200px;
            background: var(--bg-dark);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .container { padding: 0 1rem; }
            .dashboard-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>🇷🇴 RomAI Cultural Analytics</h1>
        <p>Dashboard Avansată pentru Analiza Culturală Românească</p>
    </header>
    
    <div class="container">
        <div class="dashboard-grid">
            <div class="card">
                <h3>📊 Statistici Sistem</h3>
                <div id="system-stats">
                    <div class="stat-value" id="total-analyses">-</div>
                    <div>Analize Totale</div>
                    <div class="stat-value" id="entities-detected">-</div>
                    <div>Entități Detectate</div>
                    <div class="stat-value" id="avg-time">-</div>
                    <div>Timp Mediu (ms)</div>
                </div>
            </div>
            
            <div class="card">
                <h3>🏛️ Distribuție Regională</h3>
                <div id="regional-chart" class="chart">
                    Încarcă date regionale...
                </div>
            </div>
            
            <div class="card">
                <h3>📚 Tipuri de Conținut</h3>
                <div id="content-chart" class="chart">
                    Încarcă tipuri de conținut...
                </div>
            </div>
            
            <div class="card">
                <h3>💭 Analiza Sentimentelor</h3>
                <div id="sentiment-chart" class="chart">
                    Încarcă analiza sentimentelor...
                </div>
            </div>
            
            <div class="card text-analysis">
                <h3>🔍 Analiză Text Românesc</h3>
                <div class="input-group">
                    <label for="text-input">Introduceți textul pentru analiză:</label>
                    <textarea id="text-input" placeholder="Introduceți aici textul românesc pentru analiză culturală...">Salut! Sunt din România și îmi place foarte mult cultura românească. Mihai Eminescu este poetul meu preferat, iar Transilvania este o regiune frumoasă cu o istorie bogată.</textarea>
                </div>
                <button class="btn" onclick="analyzeText()">🔬 Analizează Text</button>
                
                <div id="analysis-results" class="results" style="display: none;">
                    <h4>Rezultate Analiză</h4>
                    <div id="results-content"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Load dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                
                // Update system stats
                document.getElementById('total-analyses').textContent = data.system_stats.total_analyses;
                document.getElementById('entities-detected').textContent = data.system_stats.total_entities_detected;
                document.getElementById('avg-time').textContent = (data.system_stats.average_processing_time * 1000).toFixed(1);
                
                // Update charts (simplified display)
                updateRegionalChart(data.content_analysis.regional_distribution);
                updateContentChart(data.content_analysis.content_type_distribution);
                updateSentimentChart(data.content_analysis.sentiment_distribution);
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
        
        function updateRegionalChart(data) {
            const chart = document.getElementById('regional-chart');
            if (Object.keys(data).length === 0) {
                chart.innerHTML = 'Nu există date regionale încă';
                return;
            }
            
            let html = '';
            for (const [region, count] of Object.entries(data)) {
                html += `<div class="metric"><span>${region}</span><span>${count}</span></div>`;
            }
            chart.innerHTML = html;
        }
        
        function updateContentChart(data) {
            const chart = document.getElementById('content-chart');
            if (Object.keys(data).length === 0) {
                chart.innerHTML = 'Nu există date de conținut încă';
                return;
            }
            
            let html = '';
            for (const [type, count] of Object.entries(data)) {
                html += `<div class="metric"><span>${type}</span><span>${count}</span></div>`;
            }
            chart.innerHTML = html;
        }
        
        function updateSentimentChart(data) {
            const chart = document.getElementById('sentiment-chart');
            if (Object.keys(data).length === 0) {
                chart.innerHTML = 'Nu există date de sentiment încă';
                return;
            }
            
            let html = '';
            for (const [sentiment, count] of Object.entries(data)) {
                html += `<div class="metric"><span>${sentiment}</span><span>${count}</span></div>`;
            }
            chart.innerHTML = html;
        }
        
        async function analyzeText() {
            const textInput = document.getElementById('text-input');
            const resultsDiv = document.getElementById('analysis-results');
            const resultsContent = document.getElementById('results-content');
            
            if (!textInput.value.trim()) {
                alert('Vă rugăm să introduceți un text pentru analiză.');
                return;
            }
            
            resultsContent.innerHTML = '<div class="loading">Se analizează textul...</div>';
            resultsDiv.style.display = 'block';
            
            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: textInput.value })
                });
                
                const analysis = await response.json();
                
                if (analysis.error) {
                    resultsContent.innerHTML = `<div style="color: var(--romanian-red);">Eroare: ${analysis.error}</div>`;
                    return;
                }
                
                displayAnalysisResults(analysis);
                
                // Refresh dashboard data
                setTimeout(loadDashboardData, 1000);
                
            } catch (error) {
                resultsContent.innerHTML = `<div style="color: var(--romanian-red);">Eroare de rețea: ${error.message}</div>`;
            }
        }
        
        function displayAnalysisResults(analysis) {
            const resultsContent = document.getElementById('results-content');
            
            let html = `
                <div style="margin-bottom: 1rem;">
                    <strong>⏱️ Timp procesare:</strong> ${(analysis.processing_time * 1000).toFixed(1)} ms
                </div>
                
                <h4>🔤 Analiză Lingvistică</h4>
                <div class="metric"><span>Număr cuvinte:</span><span>${analysis.linguistic_analysis.word_count}</span></div>
                <div class="metric"><span>Utilizare diacritice:</span><span>${analysis.linguistic_analysis.diacritics_usage.toFixed(1)}%</span></div>
                <div class="metric"><span>Scor formalitate:</span><span>${analysis.linguistic_analysis.formality_score.toFixed(1)}</span></div>
                <div class="metric"><span>Complexitate:</span><span>${analysis.linguistic_analysis.complexity_score.toFixed(1)}</span></div>
            `;
            
            if (analysis.cultural_entities && analysis.cultural_entities.length > 0) {
                html += '<h4>🏛️ Entități Culturale</h4>';
                for (const entity of analysis.cultural_entities) {
                    html += `<span class="entity-tag">${entity.name} (${entity.category})</span>`;
                }
            }
            
            html += `
                <h4>💭 Analiza Sentimentelor</h4>
                <div class="metric"><span>Sentiment general:</span><span>${analysis.sentiment_analysis.overall_sentiment}</span></div>
                <div class="metric"><span>Pozitivitate:</span><span>${analysis.sentiment_analysis.positivity_score.toFixed(1)}%</span></div>
                <div class="metric"><span>Negativitate:</span><span>${analysis.sentiment_analysis.negativity_score.toFixed(1)}%</span></div>
                <div class="metric"><span>Neutralitate:</span><span>${analysis.sentiment_analysis.neutrality_score.toFixed(1)}%</span></div>
            `;
            
            if (analysis.regional_analysis) {
                html += `
                    <h4>🗺️ Analiză Regională</h4>
                    <div class="metric"><span>Regiune:</span><span>${analysis.regional_analysis.region}</span></div>
                `;
            }
            
            html += `
                <h4>📚 Tip Conținut</h4>
                <div class="metric"><span>Clasificare:</span><span>${analysis.content_type}</span></div>
            `;
            
            resultsContent.innerHTML = html;
        }
        
        // Load data on page load
        loadDashboardData();
        
        // Auto-refresh every 30 seconds
        setInterval(loadDashboardData, 30000);
    </script>
</body>
</html>
        """
    
    async def start_server(self):
        """Start the dashboard web server"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        
        site = web.TCPSite(runner, 'localhost', self.port)
        await site.start()
        
        logger.info(f"Romanian Cultural Analytics Dashboard started on http://localhost:{self.port}")

class RomanianCulturalAnalyticsDashboard:
    """
    Romanian Cultural Analytics Dashboard for RomAI
    
    Features:
    - Comprehensive Romanian text analysis
    - Cultural entity detection and visualization
    - Regional linguistic pattern analysis
    - Sentiment analysis with cultural context
    - Real-time analytics dashboard
    - Historical trend analysis
    - Web-based visualization interface
    """
    
    def __init__(self, port: int = 8090):
        self.dashboard = AnalyticsDashboard(port)
        self.start_time = time.time()
        
        logger.info("Romanian Cultural Analytics Dashboard initialized")
    
    async def initialize(self):
        """Initialize the dashboard system"""
        await self.dashboard.start_server()
        logger.info("Romanian Cultural Analytics Dashboard started")
    
    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian text"""
        return await self.dashboard.processor.analyze_text(text)
    
    async def get_analytics_summary(self) -> Dict[str, Any]:
        """Get comprehensive analytics summary"""
        # Get dashboard stats via API
        stats_response = await self.dashboard.api_get_stats(type('MockRequest', (), {'query': {}})())
        return json.loads(stats_response.text)
    
    async def get_cultural_insights(self) -> Dict[str, Any]:
        """Get cultural insights and patterns"""
        entities_response = await self.dashboard.api_get_cultural_entities(type('MockRequest', (), {'query': {}})())
        regional_response = await self.dashboard.api_get_regional_insights(type('MockRequest', (), {'query': {}})())
        
        return {
            'cultural_entities': json.loads(entities_response.text),
            'regional_insights': json.loads(regional_response.text),
            'dashboard_url': f'http://localhost:{self.dashboard.port}',
            'uptime_seconds': time.time() - self.start_time
        }

# Test and demonstration functions
async def test_cultural_analytics_dashboard():
    """Test the Romanian Cultural Analytics Dashboard"""
    print("🇷🇴 Testing Romanian Cultural Analytics Dashboard")
    print("=" * 60)
    
    # Create dashboard
    dashboard = RomanianCulturalAnalyticsDashboard(port=8090)
    await dashboard.initialize()
    
    # Test Romanian text analysis
    test_texts = [
        "Mihai Eminescu este cel mai mare poet român, născut în Moldova și iubit în toată România.",
        "Brașovul este un oraș frumos din Transilvania, cu o arhitectură medievală remarcabilă.",
        "Tradițiile românești sunt foarte importante pentru cultura noastră națională.",
        "Sarmale și mici sunt preparate tradiționale românești foarte populare.",
        "București este capitala României și centrul vieții politice și economice."
    ]
    
    print("🔍 Analyzing Romanian text samples...")
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Sample {i}: {text[:50]}...")
        
        analysis = await dashboard.analyze_text(text)
        
        print(f"   ⏱️  Processing time: {analysis['processing_time']*1000:.1f}ms")
        print(f"   🔤 Words: {analysis['linguistic_analysis']['word_count']}")
        print(f"   🇷🇴 Diacritics: {analysis['linguistic_analysis']['diacritics_usage']:.1f}%")
        print(f"   💭 Sentiment: {analysis['sentiment_analysis']['overall_sentiment']}")
        print(f"   📚 Content type: {analysis['content_type']}")
        
        if analysis['cultural_entities']:
            entities = [e['name'] for e in analysis['cultural_entities']]
            print(f"   🏛️  Cultural entities: {', '.join(entities)}")
        
        if analysis['regional_analysis']:
            print(f"   🗺️  Region: {analysis['regional_analysis']['region']}")
    
    # Wait for analyses to be processed
    await asyncio.sleep(2)
    
    # Get analytics summary
    print("\n📊 Analytics Summary:")
    summary = await dashboard.get_analytics_summary()
    
    print(f"   📈 Total analyses: {summary['system_stats']['total_analyses']}")
    print(f"   🏛️  Entities detected: {summary['system_stats']['total_entities_detected']}")
    print(f"   ⚡ Average processing time: {summary['system_stats']['average_processing_time']*1000:.1f}ms")
    
    if summary['content_analysis']['content_type_distribution']:
        print("   📚 Content types:")
        for content_type, count in summary['content_analysis']['content_type_distribution'].items():
            print(f"      • {content_type}: {count}")
    
    if summary['content_analysis']['regional_distribution']:
        print("   🗺️  Regional distribution:")
        for region, count in summary['content_analysis']['regional_distribution'].items():
            print(f"      • {region}: {count}")
    
    if summary['content_analysis']['sentiment_distribution']:
        print("   💭 Sentiment distribution:")
        for sentiment, count in summary['content_analysis']['sentiment_distribution'].items():
            print(f"      • {sentiment}: {count}")
    
    # Get cultural insights
    print("\n🏛️ Cultural Insights:")
    insights = await dashboard.get_cultural_insights()
    
    cultural_entities = insights['cultural_entities']['cultural_entities']
    print(f"   📚 Total cultural entities: {len(cultural_entities)}")
    
    categories = set()
    for entity in cultural_entities.values():
        categories.add(entity['category'])
    
    print(f"   🏷️  Categories: {', '.join(sorted(categories))}")
    
    regional_insights = insights['regional_insights']['regional_insights']
    print(f"   🗺️  Regions tracked: {len(regional_insights)}")
    
    # Display some notable entities
    print("\n🌟 Notable Romanian Cultural Entities:")
    notable_entities = [
        ('mihai_eminescu', 'Poetul național'),
        ('stefan_cel_mare', 'Domnitor și erou'),
        ('martisor', 'Tradiție de primăvară'),
        ('brasov', 'Oraș medieval din Transilvania')
    ]
    
    for entity_key, description in notable_entities:
        if entity_key in cultural_entities:
            entity = cultural_entities[entity_key]
            print(f"   • {entity['name']}: {description}")
            print(f"     Categorie: {entity['category']}, Regiune: {entity.get('region', 'N/A')}")
    
    print(f"\n🌐 Dashboard URL: {insights['dashboard_url']}")
    print(f"⏱️  System uptime: {insights['uptime_seconds']:.1f} seconds")
    
    # Test linguistic patterns
    print("\n🔤 Testing Romanian Linguistic Features:")
    
    # Test with diacritics
    diacritics_text = "Âșă, începem să învățăm să scriem corect cu diacritice în română."
    diacritics_analysis = await dashboard.analyze_text(diacritics_text)
    print(f"   🇷🇴 Text with diacritics usage: {diacritics_analysis['linguistic_analysis']['diacritics_usage']:.1f}%")
    
    # Test formal vs colloquial
    formal_text = "Cu respect, stimatul domn director, prin prezenta vă informez cu privire la..."
    colloquial_text = "Bă, frate, ce faci? Noroc și sănătate, mă!"
    
    formal_analysis = await dashboard.analyze_text(formal_text)
    colloquial_analysis = await dashboard.analyze_text(colloquial_text)
    
    print(f"   📝 Formal text formality score: {formal_analysis['linguistic_analysis']['formality_score']:.1f}")
    print(f"   💬 Colloquial text formality score: {colloquial_analysis['linguistic_analysis']['formality_score']:.1f}")
    
    print("\n✅ Romanian Cultural Analytics Dashboard test completed!")
    print(f"🌐 Access the dashboard at: http://localhost:8090")
    print("📊 The dashboard will continue running for real-time analytics...")
    
    # Keep the server running for demonstration
    print("\n⚠️  Dashboard server is running. Press Ctrl+C to stop.")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_cultural_analytics_dashboard())

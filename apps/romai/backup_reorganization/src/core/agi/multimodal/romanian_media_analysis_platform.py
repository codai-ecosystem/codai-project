"""
Romanian Media Analysis Platform - Advanced Media Content Analysis
=================================================================

A sophisticated media analysis platform leveraging Romanian multimodal AI
for comprehensive analysis of news, social media, literature, and multimedia
content with deep cultural context and sentiment analysis.

Features:
- Real-time news analysis with cultural bias detection
- Social media sentiment analysis for Romanian content
- Literature and poetry analysis with historical context
- Video/audio content analysis for cultural themes
- Cross-media correlation and trend detection
- Cultural authenticity verification
- Regional dialect and language pattern analysis

Author: RomAI Development Team
Date: 2025-08-03
Version: 1.0.0
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum, auto
import json
import re
from pathlib import Path
from collections import defaultdict, Counter

# Import from our multimodal integration system
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_4_multimodal_integration'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_3_visual_processing'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_2_audio_processing'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_1_foundation'))

from romanian_multimodal_engine import RomanianMultimodalEngine, MultimodalInput
from integration_pipeline import RomanianMultimodalIntegrationPipeline, IntegrationConfig
from cultural_context_integration import (
    RomanianCulturalContextIntegrator, CulturalContext, CulturalMarker, CulturalDimension
)

class MediaType(Enum):
    """Types of media content"""
    NEWS_ARTICLE = auto()
    SOCIAL_MEDIA_POST = auto()
    BLOG_ARTICLE = auto()
    LITERARY_TEXT = auto()
    POETRY = auto()
    VIDEO_CONTENT = auto()
    AUDIO_CONTENT = auto()
    PODCAST = auto()
    INTERVIEW = auto()
    DOCUMENTARY = auto()

class AnalysisScope(Enum):
    """Scope of media analysis"""
    LINGUISTIC = auto()
    CULTURAL = auto()
    SENTIMENT = auto()
    THEMATIC = auto()
    AUTHENTICITY = auto()
    BIAS_DETECTION = auto()
    TREND_ANALYSIS = auto()
    COMPARATIVE = auto()

class SentimentType(Enum):
    """Types of sentiment analysis"""
    POSITIVE = auto()
    NEGATIVE = auto()
    NEUTRAL = auto()
    MIXED = auto()
    CULTURAL_POSITIVE = auto()
    CULTURAL_NEGATIVE = auto()
    NOSTALGIC = auto()
    PATRIOTIC = auto()

class BiasType(Enum):
    """Types of detected bias"""
    POLITICAL = auto()
    CULTURAL = auto()
    REGIONAL = auto()
    GENERATIONAL = auto()
    ECONOMIC = auto()
    RELIGIOUS = auto()
    HISTORICAL = auto()
    LINGUISTIC = auto()

@dataclass
class MediaContent:
    """Represents media content for analysis"""
    content_id: str
    title: str
    media_type: MediaType
    content_text: str
    author: Optional[str] = None
    publication_date: Optional[datetime] = None
    source: Optional[str] = None
    url: Optional[str] = None
    language: str = "ro"
    region: Optional[str] = None
    audio_content: Optional[str] = None
    video_content: Optional[str] = None
    image_content: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    raw_content: Optional[str] = None

@dataclass
class AnalysisResult:
    """Results of media content analysis"""
    content_id: str
    analysis_timestamp: datetime
    linguistic_analysis: Dict[str, Any] = field(default_factory=dict)
    cultural_analysis: Dict[str, Any] = field(default_factory=dict)
    sentiment_analysis: Dict[str, Any] = field(default_factory=dict)
    bias_detection: Dict[str, Any] = field(default_factory=dict)
    authenticity_score: float = 0.0
    regional_characteristics: List[str] = field(default_factory=list)
    cultural_markers: List[Dict] = field(default_factory=list)
    themes: List[str] = field(default_factory=list)
    quality_metrics: Dict[str, float] = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)

@dataclass
class TrendAnalysis:
    """Results of trend analysis across multiple content pieces"""
    analysis_id: str
    timeframe: Tuple[datetime, datetime]
    content_count: int
    dominant_themes: List[Tuple[str, float]] = field(default_factory=list)
    sentiment_trends: Dict[str, List[float]] = field(default_factory=dict)
    cultural_patterns: List[Dict] = field(default_factory=list)
    regional_distribution: Dict[str, int] = field(default_factory=dict)
    bias_patterns: Dict[str, float] = field(default_factory=dict)
    emerging_topics: List[str] = field(default_factory=list)
    declining_topics: List[str] = field(default_factory=list)

class RomanianMediaAnalysisPlatform:
    """
    Comprehensive Romanian media analysis platform using advanced multimodal AI
    for cultural context-aware content analysis
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the media analysis platform"""
        self.logger = logging.getLogger(__name__)
        
        # Initialize multimodal components
        self.multimodal_engine = RomanianMultimodalEngine()
        self.integration_pipeline = RomanianMultimodalIntegrationPipeline()
        self.cultural_integrator = RomanianCulturalContextIntegrator()
        
        # Analysis state
        self.analyzed_content: Dict[str, AnalysisResult] = {}
        self.content_database: Dict[str, MediaContent] = {}
        self.trend_cache: Dict[str, TrendAnalysis] = {}
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize linguistic patterns
        self._initialize_linguistic_patterns()
        
        # Initialize cultural keywords
        self._initialize_cultural_keywords()
        
    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load configuration for the media analysis platform"""
        default_config = {
            "supported_languages": ["ro", "en"],
            "analysis_modes": ["deep", "standard", "quick"],
            "sentiment_models": ["cultural_aware", "general"],
            "bias_detection_sensitivity": 0.7,
            "cultural_authenticity_threshold": 0.6,
            "trend_analysis_window": 30,  # days
            "cache_retention": 7,  # days
            "parallel_processing": True,
            "quality_thresholds": {
                "min_content_length": 50,
                "max_analysis_time": 30,  # seconds
                "confidence_threshold": 0.7
            }
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                self.logger.warning(f"Could not load config from {config_path}: {e}")
        
        return default_config
    
    def _initialize_linguistic_patterns(self):
        """Initialize Romanian linguistic patterns for analysis"""
        self.linguistic_patterns = {
            "diacritics": {
                "pattern": r'[ăâîșț]',
                "description": "Romanian diacritical marks"
            },
            "diminutives": {
                "pattern": r'\w+u[lț]$|\w+ică$|\w+el$|\w+ușor$',
                "description": "Romanian diminutive endings"
            },
            "formal_language": {
                "keywords": ["domnule", "doamnă", "vă rog", "mulțumesc", "îmi pare rău"],
                "description": "Formal language indicators"
            },
            "colloquial": {
                "keywords": ["băi", "frate", "boss", "tare", "super"],
                "description": "Colloquial language indicators"
            },
            "archaic": {
                "keywords": ["domnie", "voevodul", "boier", "cneaz", "cătră"],
                "description": "Archaic Romanian terms"
            },
            "regional_markers": {
                "moldovan": ["moldovean", "moldovenesc", "pe urmă", "numai"],
                "transylvanian": ["ardelenesc", "săsesc", "pe care", "într-adevăr"],
                "wallachian": ["muntean", "bucureștean", "pe la", "în schimb"],
                "dobrogean": ["dobrogean", "pontic", "la mare", "prin delta"]
            }
        }
    
    def _initialize_cultural_keywords(self):
        """Initialize Romanian cultural keywords and themes"""
        self.cultural_keywords = {
            "traditional_values": [
                "tradiție", "obicei", "datină", "strămoși", "moștenire",
                "familie", "respect", "onoare", "credință", "ospitalitate"
            ],
            "historical_references": [
                "daci", "români", "voievod", "domnitor", "istorie",
                "stefan cel mare", "mihai viteazul", "vlad tepes", "brancoveanu"
            ],
            "cultural_identity": [
                "identitate", "cultură", "românesc", "național", "patriot",
                "țară", "neam", "popor", "limbă", "folclor"
            ],
            "regional_specifics": {
                "maramures": ["maramureș", "gate", "lemn", "tradition"],
                "transylvania": ["transilvania", "ardeal", "castle", "multicultural"],
                "moldavia": ["moldova", "monastery", "painted", "bucovina"],
                "wallachia": ["valahia", "muntenia", "brancoveanu", "capital"]
            },
            "contemporary_themes": [
                "modernizare", "dezvoltare", "european", "progres", "inovație",
                "tehnologie", "digitalizare", "sustenabilitate", "globalizzare"
            ]
        }
    
    async def analyze_media_content(
        self, 
        content: MediaContent,
        analysis_scopes: List[AnalysisScope] = None
    ) -> AnalysisResult:
        """Perform comprehensive analysis of media content"""
        try:
            if analysis_scopes is None:
                analysis_scopes = [scope for scope in AnalysisScope]
            
            # Create multimodal input
            multimodal_input = MultimodalInput(
                text_content=content.content_text,
                audio_content=content.audio_content,
                visual_content=content.image_content,
                metadata={
                    "content_id": content.content_id,
                    "media_type": content.media_type.name,
                    "author": content.author,
                    "source": content.source,
                    "publication_date": content.publication_date.isoformat() if content.publication_date else None,
                    "analysis_timestamp": datetime.now().isoformat()
                }
            )
            
            # Process through integration pipeline
            config = IntegrationConfig(
                processing_mode="cultural_focus",
                cultural_sensitivity=self.config["cultural_authenticity_threshold"],
                output_format="comprehensive"
            )
            
            multimodal_result = await self.integration_pipeline.process_content(
                multimodal_input, config
            )
            
            # Initialize analysis result
            analysis_result = AnalysisResult(
                content_id=content.content_id,
                analysis_timestamp=datetime.now()
            )
            
            # Perform specific analyses based on scopes
            if AnalysisScope.LINGUISTIC in analysis_scopes:
                analysis_result.linguistic_analysis = await self._analyze_linguistics(
                    content, multimodal_result
                )
            
            if AnalysisScope.CULTURAL in analysis_scopes:
                analysis_result.cultural_analysis = await self._analyze_cultural_context(
                    content, multimodal_result
                )
            
            if AnalysisScope.SENTIMENT in analysis_scopes:
                analysis_result.sentiment_analysis = await self._analyze_sentiment(
                    content, multimodal_result
                )
            
            if AnalysisScope.BIAS_DETECTION in analysis_scopes:
                analysis_result.bias_detection = await self._detect_bias(
                    content, multimodal_result
                )
            
            if AnalysisScope.AUTHENTICITY in analysis_scopes:
                analysis_result.authenticity_score = await self._calculate_authenticity(
                    content, multimodal_result
                )
            
            if AnalysisScope.THEMATIC in analysis_scopes:
                analysis_result.themes = await self._extract_themes(
                    content, multimodal_result
                )
            
            # Generate quality metrics
            analysis_result.quality_metrics = self._calculate_quality_metrics(
                content, analysis_result
            )
            
            # Generate recommendations
            analysis_result.recommendations = await self._generate_recommendations(
                content, analysis_result
            )
            
            # Store results
            self.analyzed_content[content.content_id] = analysis_result
            self.content_database[content.content_id] = content
            
            return analysis_result
            
        except Exception as e:
            self.logger.error(f"Error analyzing media content: {e}")
            raise
    
    async def _analyze_linguistics(
        self, 
        content: MediaContent, 
        multimodal_result: Any
    ) -> Dict[str, Any]:
        """Analyze linguistic characteristics of the content"""
        try:
            text = content.content_text
            analysis = {
                "language_detected": content.language,
                "formality_level": 0.5,
                "complexity_score": 0.5,
                "diacritics_usage": 0.0,
                "regional_dialect": "standard",
                "archaic_elements": [],
                "colloquialisms": [],
                "linguistic_quality": 0.5
            }
            
            # Detect diacritics usage
            diacritics_count = len(re.findall(self.linguistic_patterns["diacritics"]["pattern"], text))
            total_chars = len(text)
            analysis["diacritics_usage"] = diacritics_count / max(total_chars, 1)
            
            # Analyze formality level
            formal_keywords = sum(1 for word in self.linguistic_patterns["formal_language"]["keywords"] if word in text.lower())
            colloquial_keywords = sum(1 for word in self.linguistic_patterns["colloquial"]["keywords"] if word in text.lower())
            
            if formal_keywords > colloquial_keywords:
                analysis["formality_level"] = 0.7 + (formal_keywords * 0.1)
            elif colloquial_keywords > formal_keywords:
                analysis["formality_level"] = 0.3 - (colloquial_keywords * 0.1)
            
            analysis["formality_level"] = max(0.0, min(1.0, analysis["formality_level"]))
            
            # Detect regional dialect markers
            for region, markers in self.linguistic_patterns["regional_markers"].items():
                region_score = sum(1 for marker in markers if marker in text.lower())
                if region_score > 0:
                    analysis["regional_dialect"] = region
                    break
            
            # Detect archaic elements
            analysis["archaic_elements"] = [
                word for word in self.linguistic_patterns["archaic"]["keywords"]
                if word in text.lower()
            ]
            
            # Detect colloquialisms
            analysis["colloquialisms"] = [
                word for word in self.linguistic_patterns["colloquial"]["keywords"]
                if word in text.lower()
            ]
            
            # Calculate complexity score based on sentence length and vocabulary
            sentences = text.split('.')
            avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / max(len(sentences), 1)
            unique_words = len(set(text.lower().split()))
            total_words = len(text.split())
            vocabulary_richness = unique_words / max(total_words, 1)
            
            analysis["complexity_score"] = min(1.0, (avg_sentence_length / 20.0) + vocabulary_richness)
            
            # Calculate overall linguistic quality
            analysis["linguistic_quality"] = (
                analysis["diacritics_usage"] * 0.3 +
                analysis["complexity_score"] * 0.3 +
                (1.0 - abs(analysis["formality_level"] - 0.5) * 2) * 0.4  # Balance between formal and colloquial
            )
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error in linguistic analysis: {e}")
            return {"error": str(e)}
    
    async def _analyze_cultural_context(
        self, 
        content: MediaContent, 
        multimodal_result: Any
    ) -> Dict[str, Any]:
        """Analyze cultural context and relevance"""
        try:
            text = content.content_text.lower()
            analysis = {
                "cultural_themes": [],
                "traditional_values_score": 0.0,
                "historical_references": [],
                "regional_focus": "general",
                "cultural_identity_strength": 0.0,
                "contemporary_relevance": 0.0,
                "cultural_markers": []
            }
            
            # Analyze traditional values
            traditional_count = sum(1 for word in self.cultural_keywords["traditional_values"] if word in text)
            analysis["traditional_values_score"] = min(1.0, traditional_count / 10.0)
            
            # Detect historical references
            analysis["historical_references"] = [
                ref for ref in self.cultural_keywords["historical_references"]
                if ref in text
            ]
            
            # Analyze regional focus
            regional_scores = {}
            for region, keywords in self.cultural_keywords["regional_specifics"].items():
                score = sum(1 for keyword in keywords if keyword in text)
                if score > 0:
                    regional_scores[region] = score
            
            if regional_scores:
                analysis["regional_focus"] = max(regional_scores.keys(), key=lambda k: regional_scores[k])
            
            # Calculate cultural identity strength
            identity_count = sum(1 for word in self.cultural_keywords["cultural_identity"] if word in text)
            analysis["cultural_identity_strength"] = min(1.0, identity_count / 8.0)
            
            # Analyze contemporary relevance
            contemporary_count = sum(1 for word in self.cultural_keywords["contemporary_themes"] if word in text)
            analysis["contemporary_relevance"] = min(1.0, contemporary_count / 8.0)
            
            # Extract cultural themes
            themes = []
            for theme_category, keywords in self.cultural_keywords.items():
                if isinstance(keywords, list):
                    theme_score = sum(1 for keyword in keywords if keyword in text)
                    if theme_score > 0:
                        themes.append({
                            "theme": theme_category,
                            "strength": min(1.0, theme_score / len(keywords)),
                            "keywords_found": [kw for kw in keywords if kw in text]
                        })
            
            analysis["cultural_themes"] = sorted(themes, key=lambda x: x["strength"], reverse=True)
            
            # Extract cultural markers from multimodal result
            if hasattr(multimodal_result, 'cultural_context') and multimodal_result.cultural_context:
                cultural_context = multimodal_result.cultural_context
                if hasattr(cultural_context, 'markers'):
                    analysis["cultural_markers"] = [
                        {
                            "name": marker.name,
                            "category": marker.category,
                            "confidence": marker.confidence,
                            "description": marker.description
                        }
                        for marker in cultural_context.markers
                    ]
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error in cultural analysis: {e}")
            return {"error": str(e)}
    
    async def _analyze_sentiment(
        self, 
        content: MediaContent, 
        multimodal_result: Any
    ) -> Dict[str, Any]:
        """Analyze sentiment with cultural context awareness"""
        try:
            text = content.content_text.lower()
            analysis = {
                "overall_sentiment": SentimentType.NEUTRAL.name,
                "sentiment_score": 0.0,
                "cultural_sentiment": SentimentType.NEUTRAL.name,
                "emotional_indicators": [],
                "sentiment_confidence": 0.0,
                "cultural_emotional_context": {}
            }
            
            # Define sentiment keywords
            positive_keywords = [
                "frumos", "minunat", "excelent", "bun", "perfect", "iubesc", 
                "admirabil", "fantastic", "grozav", "superb", "extraordinar"
            ]
            
            negative_keywords = [
                "rău", "groaznic", "teribil", "urât", "îngrozitor", "dezamăgitor",
                "trist", "dureros", "dificil", "problematic", "nefericit"
            ]
            
            cultural_positive_keywords = [
                "mândru", "patriot", "tradițional", "autentic", "românesc",
                "strămoși", "moștenire", "identitate", "cultură", "frumusețe"
            ]
            
            cultural_negative_keywords = [
                "pierdut", "dispărut", "uitați", "distrugere", "abandon",
                "strainat", "distorsionat", "degradare", "neglijat"
            ]
            
            nostalgic_keywords = [
                "odinioară", "pe vremuri", "în trecut", "altădată", "demult",
                "amintiri", "nostalgie", "dor", "regret", "întoarcere"
            ]
            
            # Count sentiment indicators
            positive_count = sum(1 for word in positive_keywords if word in text)
            negative_count = sum(1 for word in negative_keywords if word in text)
            cultural_positive_count = sum(1 for word in cultural_positive_keywords if word in text)
            cultural_negative_count = sum(1 for word in cultural_negative_keywords if word in text)
            nostalgic_count = sum(1 for word in nostalgic_keywords if word in text)
            
            # Calculate overall sentiment
            total_sentiment_indicators = positive_count + negative_count
            if total_sentiment_indicators > 0:
                sentiment_score = (positive_count - negative_count) / total_sentiment_indicators
                analysis["sentiment_score"] = sentiment_score
                
                if sentiment_score > 0.3:
                    analysis["overall_sentiment"] = SentimentType.POSITIVE.name
                elif sentiment_score < -0.3:
                    analysis["overall_sentiment"] = SentimentType.NEGATIVE.name
                else:
                    analysis["overall_sentiment"] = SentimentType.MIXED.name
            
            # Calculate cultural sentiment
            total_cultural_indicators = cultural_positive_count + cultural_negative_count
            if total_cultural_indicators > 0:
                cultural_score = (cultural_positive_count - cultural_negative_count) / total_cultural_indicators
                
                if cultural_score > 0.2:
                    analysis["cultural_sentiment"] = SentimentType.CULTURAL_POSITIVE.name
                elif cultural_score < -0.2:
                    analysis["cultural_sentiment"] = SentimentType.CULTURAL_NEGATIVE.name
            
            # Check for nostalgic sentiment
            if nostalgic_count > 2:
                analysis["cultural_sentiment"] = SentimentType.NOSTALGIC.name
            
            # Calculate confidence
            total_indicators = total_sentiment_indicators + total_cultural_indicators + nostalgic_count
            analysis["sentiment_confidence"] = min(1.0, total_indicators / 10.0)
            
            # Collect emotional indicators
            found_indicators = []
            if positive_count > 0:
                found_indicators.extend([word for word in positive_keywords if word in text])
            if negative_count > 0:
                found_indicators.extend([word for word in negative_keywords if word in text])
            if cultural_positive_count > 0:
                found_indicators.extend([word for word in cultural_positive_keywords if word in text])
            if cultural_negative_count > 0:
                found_indicators.extend([word for word in cultural_negative_keywords if word in text])
            if nostalgic_count > 0:
                found_indicators.extend([word for word in nostalgic_keywords if word in text])
            
            analysis["emotional_indicators"] = list(set(found_indicators))
            
            # Cultural emotional context
            analysis["cultural_emotional_context"] = {
                "patriotic_sentiment": cultural_positive_count,
                "cultural_concern": cultural_negative_count,
                "nostalgia_level": nostalgic_count,
                "identity_pride": sum(1 for word in ["mândru", "patriot", "românesc"] if word in text)
            }
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error in sentiment analysis: {e}")
            return {"error": str(e)}
    
    async def _detect_bias(
        self, 
        content: MediaContent, 
        multimodal_result: Any
    ) -> Dict[str, Any]:
        """Detect various types of bias in content"""
        try:
            text = content.content_text.lower()
            analysis = {
                "bias_detected": False,
                "bias_types": [],
                "bias_confidence": 0.0,
                "political_bias": 0.0,
                "cultural_bias": 0.0,
                "regional_bias": 0.0,
                "bias_indicators": []
            }
            
            # Define bias indicators
            political_left_keywords = [
                "progresist", "social", "egalitate", "incluziune", "diversitate",
                "stânga", "socialist", "drepturile", "minorități"
            ]
            
            political_right_keywords = [
                "conservator", "tradițional", "patriot", "național", "ordine",
                "dreapta", "familie", "valori", "disciplină"
            ]
            
            regional_bias_keywords = {
                "anti_rural": ["țăran", "provincial", "înapoiat", "rural", "sătesc"],
                "anti_urban": ["bucureștean", "urban", "sofisticat", "arogant", "alienat"],
                "regional_supremacy": ["cel mai bun", "superior", "autentic", "adevărat"]
            }
            
            cultural_bias_keywords = [
                "străin", "extern", "importat", "occidentalizare", "globalizare",
                "pierderea", "tradițiilor", "modernizare", "denaturare"
            ]
            
            # Detect political bias
            left_count = sum(1 for word in political_left_keywords if word in text)
            right_count = sum(1 for word in political_right_keywords if word in text)
            
            if left_count > 0 or right_count > 0:
                total_political = left_count + right_count
                analysis["political_bias"] = (right_count - left_count) / total_political
                
                if abs(analysis["political_bias"]) > 0.3:
                    analysis["bias_types"].append(BiasType.POLITICAL.name)
                    analysis["bias_detected"] = True
            
            # Detect cultural bias
            cultural_bias_count = sum(1 for word in cultural_bias_keywords if word in text)
            if cultural_bias_count > 2:
                analysis["cultural_bias"] = min(1.0, cultural_bias_count / 10.0)
                analysis["bias_types"].append(BiasType.CULTURAL.name)
                analysis["bias_detected"] = True
            
            # Detect regional bias
            regional_bias_total = 0
            for bias_type, keywords in regional_bias_keywords.items():
                count = sum(1 for word in keywords if word in text)
                if count > 1:
                    analysis["bias_types"].append(BiasType.REGIONAL.name)
                    analysis["bias_detected"] = True
                    regional_bias_total += count
            
            analysis["regional_bias"] = min(1.0, regional_bias_total / 10.0)
            
            # Calculate overall bias confidence
            total_bias_indicators = len(analysis["bias_types"])
            analysis["bias_confidence"] = min(1.0, total_bias_indicators / 3.0)
            
            # Collect bias indicators
            bias_indicators = []
            if left_count > 0:
                bias_indicators.extend([word for word in political_left_keywords if word in text])
            if right_count > 0:
                bias_indicators.extend([word for word in political_right_keywords if word in text])
            if cultural_bias_count > 0:
                bias_indicators.extend([word for word in cultural_bias_keywords if word in text])
            
            for keywords in regional_bias_keywords.values():
                bias_indicators.extend([word for word in keywords if word in text])
            
            analysis["bias_indicators"] = list(set(bias_indicators))
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error in bias detection: {e}")
            return {"error": str(e)}
    
    async def _calculate_authenticity(
        self, 
        content: MediaContent, 
        multimodal_result: Any
    ) -> float:
        """Calculate cultural authenticity score"""
        try:
            authenticity_score = 0.0
            
            # Get authenticity from multimodal result
            if hasattr(multimodal_result, 'cultural_context') and multimodal_result.cultural_context:
                cultural_context = multimodal_result.cultural_context
                if hasattr(cultural_context, 'authenticity_score'):
                    authenticity_score = cultural_context.authenticity_score
            
            # Additional authenticity factors
            text = content.content_text.lower()
            
            # Check for Romanian diacritics usage
            diacritics_count = len(re.findall(r'[ăâîșț]', content.content_text))
            diacritics_score = min(1.0, diacritics_count / 20.0)
            
            # Check for traditional cultural references
            cultural_refs = sum(1 for word in self.cultural_keywords["traditional_values"] if word in text)
            cultural_score = min(1.0, cultural_refs / 10.0)
            
            # Check for regional authenticity
            regional_score = 0.0
            if content.region:
                region_keywords = self.cultural_keywords["regional_specifics"].get(content.region.lower(), [])
                region_matches = sum(1 for word in region_keywords if word in text)
                regional_score = min(1.0, region_matches / len(region_keywords)) if region_keywords else 0.0
            
            # Combine scores
            final_score = (
                authenticity_score * 0.5 +
                diacritics_score * 0.2 +
                cultural_score * 0.2 +
                regional_score * 0.1
            )
            
            return min(1.0, final_score)
            
        except Exception as e:
            self.logger.error(f"Error calculating authenticity: {e}")
            return 0.0
    
    async def _extract_themes(
        self, 
        content: MediaContent, 
        multimodal_result: Any
    ) -> List[str]:
        """Extract main themes from content"""
        try:
            themes = []
            text = content.content_text.lower()
            
            # Predefined theme categories
            theme_keywords = {
                "familie_si_traditii": ["familie", "tradiție", "obicei", "sărbătoare", "generație"],
                "patrimoniul_cultural": ["patrimoniu", "monument", "istoric", "muzeu", "conservare"],
                "educație_și_cultură": ["educație", "școală", "universitate", "cultură", "artă"],
                "economie_și_dezvoltare": ["economie", "dezvoltare", "business", "investiție", "creștere"],
                "politică_și_societate": ["politică", "democrație", "alegeri", "guvern", "societate"],
                "tehnologie_și_inovație": ["tehnologie", "inovație", "digital", "internet", "viitor"],
                "mediu_și_natură": ["mediu", "natură", "ecologie", "pădure", "peisaj"],
                "sănătate_și_wellbeing": ["sănătate", "medical", "sport", "fitness", "lifestyle"]
            }
            
            # Score themes based on keyword frequency
            for theme, keywords in theme_keywords.items():
                score = sum(1 for keyword in keywords if keyword in text)
                if score > 0:
                    themes.append({
                        "theme": theme,
                        "score": score,
                        "keywords_found": [kw for kw in keywords if kw in text]
                    })
            
            # Sort by score and return theme names
            themes.sort(key=lambda x: x["score"], reverse=True)
            return [theme["theme"] for theme in themes[:5]]  # Return top 5 themes
            
        except Exception as e:
            self.logger.error(f"Error extracting themes: {e}")
            return []
    
    def _calculate_quality_metrics(
        self, 
        content: MediaContent, 
        analysis_result: AnalysisResult
    ) -> Dict[str, float]:
        """Calculate quality metrics for the analysis"""
        try:
            metrics = {
                "content_length_score": 0.0,
                "linguistic_quality": 0.0,
                "cultural_richness": 0.0,
                "analysis_completeness": 0.0,
                "overall_quality": 0.0
            }
            
            # Content length score
            content_length = len(content.content_text)
            if content_length >= self.config["quality_thresholds"]["min_content_length"]:
                metrics["content_length_score"] = min(1.0, content_length / 1000.0)
            
            # Linguistic quality from analysis
            if analysis_result.linguistic_analysis:
                metrics["linguistic_quality"] = analysis_result.linguistic_analysis.get("linguistic_quality", 0.0)
            
            # Cultural richness
            cultural_themes_count = len(analysis_result.cultural_analysis.get("cultural_themes", []))
            cultural_markers_count = len(analysis_result.cultural_markers)
            metrics["cultural_richness"] = min(1.0, (cultural_themes_count + cultural_markers_count) / 10.0)
            
            # Analysis completeness
            completed_analyses = sum([
                1 if analysis_result.linguistic_analysis else 0,
                1 if analysis_result.cultural_analysis else 0,
                1 if analysis_result.sentiment_analysis else 0,
                1 if analysis_result.bias_detection else 0,
                1 if analysis_result.authenticity_score > 0 else 0,
                1 if analysis_result.themes else 0
            ])
            metrics["analysis_completeness"] = completed_analyses / 6.0
            
            # Overall quality
            metrics["overall_quality"] = (
                metrics["content_length_score"] * 0.2 +
                metrics["linguistic_quality"] * 0.3 +
                metrics["cultural_richness"] * 0.3 +
                metrics["analysis_completeness"] * 0.2
            )
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error calculating quality metrics: {e}")
            return {"overall_quality": 0.0}
    
    async def _generate_recommendations(
        self, 
        content: MediaContent, 
        analysis_result: AnalysisResult
    ) -> List[str]:
        """Generate recommendations based on analysis"""
        try:
            recommendations = []
            
            # Linguistic recommendations
            if analysis_result.linguistic_analysis:
                ling_analysis = analysis_result.linguistic_analysis
                
                if ling_analysis.get("diacritics_usage", 0) < 0.01:
                    recommendations.append(
                        "Considerați folosirea diacriticelor pentru a îmbunătăți corectitudinea limbii române"
                    )
                
                if ling_analysis.get("formality_level", 0.5) < 0.3:
                    recommendations.append(
                        "Limbajul prea colocvial ar putea beneficia de un registru mai formal"
                    )
                
                if ling_analysis.get("complexity_score", 0.5) < 0.3:
                    recommendations.append(
                        "Conținutul ar putea fi îmbogățit cu vocabular mai complex și structuri variate"
                    )
            
            # Cultural recommendations
            if analysis_result.cultural_analysis:
                cult_analysis = analysis_result.cultural_analysis
                
                if cult_analysis.get("traditional_values_score", 0) < 0.2:
                    recommendations.append(
                        "Explorați mai multe referințe la valorile și tradițiile românești"
                    )
                
                if not cult_analysis.get("historical_references"):
                    recommendations.append(
                        "Adăugarea de referințe istorice ar putea îmbogăți contextul cultural"
                    )
                
                if cult_analysis.get("contemporary_relevance", 0) > 0.8:
                    recommendations.append(
                        "Balansați tematica contemporană cu elemente tradiționale pentru autenticitate"
                    )
            
            # Authenticity recommendations
            if analysis_result.authenticity_score < self.config["cultural_authenticity_threshold"]:
                recommendations.append(
                    "Conținutul ar beneficia de o mai mare autenticitate culturală românească"
                )
            
            # Bias recommendations
            if analysis_result.bias_detection and analysis_result.bias_detection.get("bias_detected"):
                recommendations.append(
                    "Identificați și adresați posibilele prejudecăți prezente în conținut"
                )
            
            # Quality recommendations
            quality_score = analysis_result.quality_metrics.get("overall_quality", 0)
            if quality_score < 0.6:
                recommendations.append(
                    "Îmbunătățiți calitatea generală prin dezvoltarea aspectelor lingvistice și culturale"
                )
            
            return recommendations[:5]  # Limit to 5 recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return []
    
    async def analyze_content_batch(
        self, 
        content_list: List[MediaContent],
        analysis_scopes: List[AnalysisScope] = None
    ) -> Dict[str, AnalysisResult]:
        """Analyze multiple content pieces in batch"""
        try:
            results = {}
            
            if self.config["parallel_processing"]:
                # Process in parallel
                tasks = [
                    self.analyze_media_content(content, analysis_scopes)
                    for content in content_list
                ]
                analysis_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for content, result in zip(content_list, analysis_results):
                    if isinstance(result, Exception):
                        self.logger.error(f"Error analyzing {content.content_id}: {result}")
                    else:
                        results[content.content_id] = result
            else:
                # Process sequentially
                for content in content_list:
                    try:
                        result = await self.analyze_media_content(content, analysis_scopes)
                        results[content.content_id] = result
                    except Exception as e:
                        self.logger.error(f"Error analyzing {content.content_id}: {e}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in batch analysis: {e}")
            return {}
    
    async def analyze_trends(
        self, 
        timeframe_days: int = 30,
        content_filter: Optional[Dict[str, Any]] = None
    ) -> TrendAnalysis:
        """Analyze trends across analyzed content"""
        try:
            end_time = datetime.now()
            start_time = end_time - timedelta(days=timeframe_days)
            
            # Filter content by timeframe
            relevant_content = []
            for content_id, analysis in self.analyzed_content.items():
                if start_time <= analysis.analysis_timestamp <= end_time:
                    content = self.content_database.get(content_id)
                    if content and self._matches_filter(content, content_filter):
                        relevant_content.append((content, analysis))
            
            if not relevant_content:
                raise ValueError("No content found for trend analysis")
            
            # Initialize trend analysis
            trend_analysis = TrendAnalysis(
                analysis_id=f"trend_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                timeframe=(start_time, end_time),
                content_count=len(relevant_content)
            )
            
            # Analyze dominant themes
            theme_counter = Counter()
            for content, analysis in relevant_content:
                for theme in analysis.themes:
                    theme_counter[theme] += 1
            
            total_content = len(relevant_content)
            trend_analysis.dominant_themes = [
                (theme, count / total_content)
                for theme, count in theme_counter.most_common(10)
            ]
            
            # Analyze sentiment trends over time
            sentiment_by_day = defaultdict(list)
            for content, analysis in relevant_content:
                day = analysis.analysis_timestamp.date()
                sentiment_score = analysis.sentiment_analysis.get("sentiment_score", 0.0)
                sentiment_by_day[day].append(sentiment_score)
            
            # Calculate daily averages
            daily_sentiment = {}
            for day, scores in sentiment_by_day.items():
                daily_sentiment[day.isoformat()] = sum(scores) / len(scores)
            
            trend_analysis.sentiment_trends = {"daily_average": daily_sentiment}
            
            # Analyze cultural patterns
            cultural_patterns = []
            authenticity_scores = [analysis.authenticity_score for _, analysis in relevant_content]
            avg_authenticity = sum(authenticity_scores) / len(authenticity_scores)
            
            cultural_patterns.append({
                "pattern": "cultural_authenticity",
                "average_score": avg_authenticity,
                "trend": "stable"  # Could be calculated based on time series
            })
            
            trend_analysis.cultural_patterns = cultural_patterns
            
            # Analyze regional distribution
            regional_dist = Counter()
            for content, analysis in relevant_content:
                region = content.region or "unknown"
                regional_dist[region] += 1
            
            trend_analysis.regional_distribution = dict(regional_dist)
            
            # Analyze bias patterns
            bias_patterns = {}
            for bias_type in BiasType:
                bias_count = sum(
                    1 for _, analysis in relevant_content
                    if bias_type.name in analysis.bias_detection.get("bias_types", [])
                )
                bias_patterns[bias_type.name] = bias_count / total_content
            
            trend_analysis.bias_patterns = bias_patterns
            
            # Store trend analysis
            self.trend_cache[trend_analysis.analysis_id] = trend_analysis
            
            return trend_analysis
            
        except Exception as e:
            self.logger.error(f"Error in trend analysis: {e}")
            raise
    
    def _matches_filter(self, content: MediaContent, content_filter: Optional[Dict[str, Any]]) -> bool:
        """Check if content matches the given filter"""
        if not content_filter:
            return True
        
        try:
            for key, value in content_filter.items():
                if key == "media_type" and content.media_type.name != value:
                    return False
                elif key == "author" and content.author != value:
                    return False
                elif key == "source" and content.source != value:
                    return False
                elif key == "region" and content.region != value:
                    return False
                elif key == "language" and content.language != value:
                    return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error in filter matching: {e}")
            return True
    
    async def generate_analysis_report(
        self, 
        content_ids: List[str],
        report_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """Generate a comprehensive analysis report"""
        try:
            report = {
                "report_id": f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "generation_time": datetime.now().isoformat(),
                "content_analyzed": len(content_ids),
                "report_type": report_type,
                "summary": {},
                "detailed_analysis": {},
                "recommendations": [],
                "quality_assessment": {}
            }
            
            # Gather analysis results
            analyses = []
            for content_id in content_ids:
                if content_id in self.analyzed_content:
                    analyses.append(self.analyzed_content[content_id])
            
            if not analyses:
                raise ValueError("No analysis results found for provided content IDs")
            
            # Generate summary statistics
            report["summary"] = {
                "average_authenticity": sum(a.authenticity_score for a in analyses) / len(analyses),
                "most_common_themes": self._get_most_common_themes(analyses),
                "sentiment_distribution": self._get_sentiment_distribution(analyses),
                "bias_detection_summary": self._get_bias_summary(analyses),
                "linguistic_quality_average": self._get_average_linguistic_quality(analyses)
            }
            
            # Generate detailed analysis
            if report_type == "comprehensive":
                report["detailed_analysis"] = {
                    "individual_results": {
                        analysis.content_id: {
                            "authenticity_score": analysis.authenticity_score,
                            "themes": analysis.themes,
                            "sentiment": analysis.sentiment_analysis.get("overall_sentiment"),
                            "bias_detected": analysis.bias_detection.get("bias_detected", False),
                            "quality_score": analysis.quality_metrics.get("overall_quality", 0)
                        }
                        for analysis in analyses
                    }
                }
            
            # Generate recommendations
            report["recommendations"] = self._generate_report_recommendations(analyses)
            
            # Quality assessment
            report["quality_assessment"] = {
                "high_quality_content": sum(1 for a in analyses if a.quality_metrics.get("overall_quality", 0) > 0.7),
                "authentic_content": sum(1 for a in analyses if a.authenticity_score > 0.7),
                "biased_content": sum(1 for a in analyses if a.bias_detection.get("bias_detected", False)),
                "improvement_needed": sum(1 for a in analyses if a.quality_metrics.get("overall_quality", 0) < 0.5)
            }
            
            return report
            
        except Exception as e:
            self.logger.error(f"Error generating analysis report: {e}")
            return {"error": str(e)}
    
    def _get_most_common_themes(self, analyses: List[AnalysisResult]) -> List[Tuple[str, int]]:
        """Get most common themes across analyses"""
        theme_counter = Counter()
        for analysis in analyses:
            for theme in analysis.themes:
                theme_counter[theme] += 1
        return theme_counter.most_common(5)
    
    def _get_sentiment_distribution(self, analyses: List[AnalysisResult]) -> Dict[str, int]:
        """Get sentiment distribution across analyses"""
        sentiment_counter = Counter()
        for analysis in analyses:
            sentiment = analysis.sentiment_analysis.get("overall_sentiment", "NEUTRAL")
            sentiment_counter[sentiment] += 1
        return dict(sentiment_counter)
    
    def _get_bias_summary(self, analyses: List[AnalysisResult]) -> Dict[str, Any]:
        """Get bias detection summary"""
        total_biased = sum(1 for a in analyses if a.bias_detection.get("bias_detected", False))
        bias_types_counter = Counter()
        
        for analysis in analyses:
            for bias_type in analysis.bias_detection.get("bias_types", []):
                bias_types_counter[bias_type] += 1
        
        return {
            "total_biased_content": total_biased,
            "bias_percentage": total_biased / len(analyses) if analyses else 0,
            "most_common_bias_types": bias_types_counter.most_common(3)
        }
    
    def _get_average_linguistic_quality(self, analyses: List[AnalysisResult]) -> float:
        """Get average linguistic quality"""
        quality_scores = [
            a.linguistic_analysis.get("linguistic_quality", 0)
            for a in analyses
            if a.linguistic_analysis
        ]
        return sum(quality_scores) / len(quality_scores) if quality_scores else 0.0
    
    def _generate_report_recommendations(self, analyses: List[AnalysisResult]) -> List[str]:
        """Generate recommendations for the overall report"""
        recommendations = []
        
        # Average authenticity
        avg_authenticity = sum(a.authenticity_score for a in analyses) / len(analyses)
        if avg_authenticity < 0.6:
            recommendations.append(
                "Îmbunătățiți autenticitatea culturală românească în conținut"
            )
        
        # Bias detection
        biased_content = sum(1 for a in analyses if a.bias_detection.get("bias_detected", False))
        if biased_content > len(analyses) * 0.3:
            recommendations.append(
                "Atenție la prejudecățile detectate - revizuiți și echilibrați conținutul"
            )
        
        # Quality issues
        low_quality = sum(1 for a in analyses if a.quality_metrics.get("overall_quality", 0) < 0.5)
        if low_quality > len(analyses) * 0.4:
            recommendations.append(
                "Calitatea generală a conținutului necesită îmbunătățiri substanțiale"
            )
        
        return recommendations

# Example usage and testing
async def main():
    """Example usage of the Romanian Media Analysis Platform"""
    
    # Initialize the platform
    platform = RomanianMediaAnalysisPlatform()
    
    # Wait for initialization
    await asyncio.sleep(1)
    
    # Create sample media content
    sample_content = [
        MediaContent(
            content_id="news_article_1",
            title="Tradițiile românești în era modernă",
            media_type=MediaType.NEWS_ARTICLE,
            content_text="""
            România păstrează cu mândrie tradițiile strămoșești în ciuda procesului de modernizare.
            Satele din Maramureș continuă să practice meșteșugurile tradiționale, iar portul popular
            românesc rămâne un simbol al identității naționale. Într-o lume globalizată, valorile
            tradiționale românești oferă stabilitate și continuitate culturală.
            """,
            author="Maria Popescu",
            publication_date=datetime.now(),
            source="Adevărul Cultural",
            region="Maramureș"
        ),
        MediaContent(
            content_id="social_media_1",
            title="Post despre Castelul Peleș",
            media_type=MediaType.SOCIAL_MEDIA_POST,
            content_text="""
            Wow! Castelul Peleș e absolut minunat! 😍 Arhitectura e fantastică și istoria fascinantă.
            Mândru să fiu român când văd asemenea frumuseți! #Romania #CastelulPeles #Patrimoniu
            """,
            author="@turistromân",
            publication_date=datetime.now(),
            source="Instagram",
            region="Brașov"
        ),
        MediaContent(
            content_id="literary_text_1",
            title="Fragment din poezie populară",
            media_type=MediaType.POETRY,
            content_text="""
            Pe sub nuci, pe sub peri,
            Dragi mi-s dulcii mei părinți,
            Și copiii dragi ca mierea,
            Și soția mea cea bună.
            
            Tradiționale versuri care reflectă dragostea pentru familie și natură,
            atât de caracteristică spiritualității românești.
            """,
            author="Popular",
            region="General"
        )
    ]
    
    print("🚀 Starting Romanian Media Analysis Platform Demo")
    
    # Analyze content pieces
    for i, content in enumerate(sample_content):
        print(f"\n📊 Analyzing content {i+1}: {content.title}")
        
        result = await platform.analyze_media_content(
            content,
            [AnalysisScope.LINGUISTIC, AnalysisScope.CULTURAL, AnalysisScope.SENTIMENT, AnalysisScope.AUTHENTICITY]
        )
        
        print(f"  🎭 Authenticity Score: {result.authenticity_score:.2f}")
        print(f"  💬 Sentiment: {result.sentiment_analysis.get('overall_sentiment', 'Unknown')}")
        print(f"  🏛️ Cultural Themes: {len(result.cultural_analysis.get('cultural_themes', []))}")
        print(f"  📝 Linguistic Quality: {result.linguistic_analysis.get('linguistic_quality', 0):.2f}")
        print(f"  ⭐ Overall Quality: {result.quality_metrics.get('overall_quality', 0):.2f}")
        
        if result.themes:
            print(f"  🎯 Main Themes: {', '.join(result.themes[:3])}")
        
        if result.recommendations:
            print(f"  💡 Recommendations: {len(result.recommendations)} provided")
    
    # Batch analysis
    print(f"\n🔄 Performing batch analysis...")
    batch_results = await platform.analyze_content_batch(sample_content)
    print(f"✅ Batch analysis complete: {len(batch_results)} items processed")
    
    # Trend analysis
    print(f"\n📈 Performing trend analysis...")
    try:
        trend_analysis = await platform.analyze_trends(timeframe_days=1)  # Short timeframe for demo
        print(f"📊 Analyzed {trend_analysis.content_count} pieces of content")
        print(f"🎯 Top themes: {', '.join([theme for theme, _ in trend_analysis.dominant_themes[:3]])}")
        print(f"🗺️ Regional distribution: {trend_analysis.regional_distribution}")
    except ValueError as e:
        print(f"⚠️ Trend analysis: {e}")
    
    # Generate comprehensive report
    print(f"\n📋 Generating analysis report...")
    content_ids = [content.content_id for content in sample_content]
    report = await platform.generate_analysis_report(content_ids, "comprehensive")
    
    if "error" not in report:
        print(f"📄 Report generated: {report['report_id']}")
        print(f"📊 Content analyzed: {report['content_analyzed']}")
        print(f"⭐ Average authenticity: {report['summary']['average_authenticity']:.2f}")
        print(f"🎭 Most common themes: {report['summary']['most_common_themes']}")
        print(f"💡 Recommendations: {len(report['recommendations'])}")
        
        # Show quality assessment
        quality = report['quality_assessment']
        print(f"\n🏆 Quality Assessment:")
        print(f"  High Quality: {quality['high_quality_content']}")
        print(f"  Authentic Content: {quality['authentic_content']}")
        print(f"  Biased Content: {quality['biased_content']}")
        print(f"  Needs Improvement: {quality['improvement_needed']}")
    else:
        print(f"❌ Report generation error: {report['error']}")
    
    print(f"\n🎯 Romanian Media Analysis Platform Demo Complete!")

if __name__ == "__main__":
    asyncio.run(main())

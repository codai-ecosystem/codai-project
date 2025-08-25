"""
Advanced Context Management System
Sophisticated context awareness and memory management for Romanian AI
"""

import torch
import numpy as np
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union, Tuple
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
import json
import time
from datetime import datetime, timedelta
from collections import deque, defaultdict
import hashlib
import pickle
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class ContextType(Enum):
    """Types of context information"""
    CONVERSATIONAL = "conversational"
    CULTURAL = "cultural"
    HISTORICAL = "historical"
    REGIONAL = "regional"
    LINGUISTIC = "linguistic"
    EMOTIONAL = "emotional"
    TOPICAL = "topical"
    TEMPORAL = "temporal"
    RELATIONAL = "relational"
    ENVIRONMENTAL = "environmental"

class ContextScope(Enum):
    """Scope of context application"""
    IMMEDIATE = "immediate"  # Current conversation turn
    SESSION = "session"      # Current conversation session
    USER = "user"           # Specific user across sessions
    GLOBAL = "global"       # All users and sessions
    DOMAIN = "domain"       # Specific domain/topic

class MemoryType(Enum):
    """Types of memory storage"""
    SHORT_TERM = "short_term"      # Working memory
    EPISODIC = "episodic"          # Event-based memory
    SEMANTIC = "semantic"          # Knowledge-based memory
    PROCEDURAL = "procedural"      # Skill-based memory
    CULTURAL = "cultural"          # Cultural knowledge
    PERSONAL = "personal"          # User-specific information

@dataclass
class ContextItem:
    """Individual context item"""
    context_type: ContextType
    content: Any
    confidence: float
    timestamp: datetime
    
    # Context metadata
    source: str = ""
    scope: ContextScope = ContextScope.IMMEDIATE
    priority: float = 1.0
    
    # Romanian cultural context
    cultural_relevance: float = 0.0
    regional_context: Optional[str] = None
    linguistic_markers: List[str] = field(default_factory=list)
    
    # Temporal properties
    decay_rate: float = 0.1  # How fast context loses relevance
    last_accessed: datetime = field(default_factory=datetime.now)
    access_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'context_type': self.context_type.value,
            'content': self.content,
            'confidence': self.confidence,
            'timestamp': self.timestamp.isoformat(),
            'source': self.source,
            'scope': self.scope.value,
            'priority': self.priority,
            'cultural_relevance': self.cultural_relevance,
            'regional_context': self.regional_context,
            'linguistic_markers': self.linguistic_markers,
            'decay_rate': self.decay_rate,
            'last_accessed': self.last_accessed.isoformat(),
            'access_count': self.access_count
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ContextItem':
        """Create from dictionary"""
        item = cls(
            context_type=ContextType(data['context_type']),
            content=data['content'],
            confidence=data['confidence'],
            timestamp=datetime.fromisoformat(data['timestamp'])
        )
        
        item.source = data.get('source', '')
        item.scope = ContextScope(data.get('scope', 'immediate'))
        item.priority = data.get('priority', 1.0)
        item.cultural_relevance = data.get('cultural_relevance', 0.0)
        item.regional_context = data.get('regional_context')
        item.linguistic_markers = data.get('linguistic_markers', [])
        item.decay_rate = data.get('decay_rate', 0.1)
        item.last_accessed = datetime.fromisoformat(data.get('last_accessed', datetime.now().isoformat()))
        item.access_count = data.get('access_count', 0)
        
        return item
    
    def get_current_relevance(self) -> float:
        """Calculate current relevance based on decay"""
        time_delta = datetime.now() - self.timestamp
        hours_passed = time_delta.total_seconds() / 3600
        
        # Exponential decay with cultural preservation
        cultural_boost = 1.0 + self.cultural_relevance * 0.5
        decay_factor = np.exp(-self.decay_rate * hours_passed / cultural_boost)
        
        return self.confidence * self.priority * decay_factor
    
    def access(self):
        """Mark context as accessed"""
        self.last_accessed = datetime.now()
        self.access_count += 1

@dataclass
class ConversationState:
    """Current conversation state"""
    session_id: str
    user_id: Optional[str] = None
    
    # Current topics and entities
    active_topics: List[str] = field(default_factory=list)
    mentioned_entities: Dict[str, float] = field(default_factory=dict)  # entity -> relevance
    
    # Conversation flow
    turn_count: int = 0
    last_user_intent: Optional[str] = None
    conversation_mode: str = "general"  # general, educational, cultural, technical
    
    # Romanian cultural state
    cultural_context: Optional[str] = None
    regional_focus: Optional[str] = None
    language_preference: str = "romanian"
    formality_level: str = "neutral"  # formal, neutral, casual
    
    # Emotional state
    user_mood: Optional[str] = None
    engagement_level: float = 0.5
    satisfaction_score: float = 0.5
    
    # Temporal context
    session_start: datetime = field(default_factory=datetime.now)
    last_interaction: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'session_id': self.session_id,
            'user_id': self.user_id,
            'active_topics': self.active_topics,
            'mentioned_entities': self.mentioned_entities,
            'turn_count': self.turn_count,
            'last_user_intent': self.last_user_intent,
            'conversation_mode': self.conversation_mode,
            'cultural_context': self.cultural_context,
            'regional_focus': self.regional_focus,
            'language_preference': self.language_preference,
            'formality_level': self.formality_level,
            'user_mood': self.user_mood,
            'engagement_level': self.engagement_level,
            'satisfaction_score': self.satisfaction_score,
            'session_start': self.session_start.isoformat(),
            'last_interaction': self.last_interaction.isoformat()
        }

class RomanianContextAnalyzer:
    """Analyze Romanian cultural and linguistic context"""
    
    def __init__(self):
        # Romanian regions and their characteristics
        self.romanian_regions = {
            'transilvania': {
                'keywords': ['transilvania', 'transylvania', 'cluj', 'brașov', 'sibiu', 'mureș'],
                'cultural_markers': ['fortificații', 'biserici_fortificate', 'muzică_de_fanfară', 'arhitectură_saxonă'],
                'dialects': ['ardelenesc', 'bănățean']
            },
            'muntenia': {
                'keywords': ['muntenia', 'bucurești', 'ploiești', 'pitești', 'craiova'],
                'cultural_markers': ['curtea_domnească', 'arhitectura_brâncovenească', 'folclor_muntenesc'],
                'dialects': ['muntenesc']
            },
            'moldova': {
                'keywords': ['moldova', 'iași', 'suceava', 'galați', 'bacău', 'vaslui'],
                'cultural_markers': ['mănăstiri_pictate', 'ceramică_populară', 'țesături_tradiționale'],
                'dialects': ['moldovenesc']
            },
            'oltenia': {
                'keywords': ['oltenia', 'craiova', 'slatina', 'caracal', 'turnu_severin'],
                'cultural_markers': ['horezu', 'ceramică_oltenească', 'dansuri_oltenești'],
                'dialects': ['oltenesc']
            },
            'dobrogea': {
                'keywords': ['dobrogea', 'constanța', 'tulcea', 'delta', 'marea_neagră'],
                'cultural_markers': ['multicultural', 'pescuit', 'delta_dunării'],
                'dialects': ['dobrogean']
            },
            'banat': {
                'keywords': ['banat', 'timișoara', 'reșița', 'caransebeș'],
                'cultural_markers': ['arhitectură_austro-ungară', 'muzică_bănățeană', 'multiculturalism'],
                'dialects': ['bănățean']
            },
            'maramureș': {
                'keywords': ['maramureș', 'baia_mare', 'sighetu_marmației', 'borșa'],
                'cultural_markers': ['arhitectură_din_lemn', 'porti_maramureșene', 'tradițiile_lemnului'],
                'dialects': ['maramureșean']
            },
            'bucovina': {
                'keywords': ['bucovina', 'suceava', 'vatra_dornei', 'gura_humorului'],
                'cultural_markers': ['mănăstiri_pictate', 'ouă_încondeiate', 'tradițiile_bucovinene'],
                'dialects': ['bucovinean']
            }
        }
        
        # Romanian cultural themes
        self.cultural_themes = {
            'folclor': ['muzică_populară', 'dansuri_tradiționale', 'costume_populare', 'balada_populară'],
            'istorie': ['daci', 'romani', 'voievozi', 'unirea_principatelor', 'marea_unire'],
            'religie': ['ortodoxie', 'mănăstiri', 'icoane', 'tradiții_religioase'],
            'artă': ['brâncuși', 'grigorescu', 'andreescu', 'artă_populară'],
            'literatură': ['eminescu', 'creangă', 'caragiale', 'rebreanu', 'arghezi'],
            'gastronomie': ['mici', 'sarmale', 'mămăligă', 'cozonac', 'țuică']
        }
        
        # Romanian linguistic patterns
        self.linguistic_patterns = {
            'diacritics': ['ă', 'â', 'î', 'ș', 'ț'],
            'particles': ['să', 'de', 'pe', 'cu', 'în', 'la', 'pentru'],
            'conjunctions': ['și', 'dar', 'sau', 'că', 'dacă', 'când'],
            'pronouns': ['eu', 'tu', 'el', 'ea', 'noi', 'voi', 'ei', 'ele'],
            'formal_markers': ['dumneavoastră', 'domnule', 'doamna', 'respectuos'],
            'informal_markers': ['băi', 'mă', 'frate', 'prietene']
        }
        
        logger.info("Romanian context analyzer initialized")
    
    def analyze_cultural_context(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian cultural context in text"""
        
        text_lower = text.lower()
        
        # Regional detection
        detected_regions = {}
        for region, data in self.romanian_regions.items():
            score = 0.0
            matches = []
            
            for keyword in data['keywords']:
                if keyword in text_lower:
                    score += 1.0
                    matches.append(keyword)
            
            for marker in data['cultural_markers']:
                if marker in text_lower:
                    score += 0.5
                    matches.append(marker)
            
            if score > 0:
                detected_regions[region] = {
                    'score': score,
                    'matches': matches
                }
        
        # Cultural theme detection
        detected_themes = {}
        for theme, keywords in self.cultural_themes.items():
            matches = [kw for kw in keywords if kw in text_lower]
            if matches:
                detected_themes[theme] = {
                    'score': len(matches),
                    'matches': matches
                }
        
        # Linguistic analysis
        linguistic_analysis = self._analyze_linguistic_patterns(text)
        
        return {
            'regions': detected_regions,
            'cultural_themes': detected_themes,
            'linguistic_analysis': linguistic_analysis,
            'overall_cultural_score': self._calculate_cultural_score(detected_regions, detected_themes),
            'dominant_region': max(detected_regions, key=lambda r: detected_regions[r]['score']) if detected_regions else None
        }
    
    def _analyze_linguistic_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian linguistic patterns"""
        
        analysis = {
            'diacritic_count': 0,
            'romanian_particles': 0,
            'formality_indicators': [],
            'dialect_markers': [],
            'complexity_score': 0.0
        }
        
        # Count diacritics
        for char in self.linguistic_patterns['diacritics']:
            analysis['diacritic_count'] += text.count(char)
        
        # Count particles
        text_lower = text.lower()
        words = text_lower.split()
        
        for particle in self.linguistic_patterns['particles']:
            analysis['romanian_particles'] += text_lower.count(particle)
        
        # Formality detection
        formal_count = sum(1 for marker in self.linguistic_patterns['formal_markers'] if marker in text_lower)
        informal_count = sum(1 for marker in self.linguistic_patterns['informal_markers'] if marker in text_lower)
        
        if formal_count > informal_count:
            analysis['formality_indicators'].append('formal')
        elif informal_count > formal_count:
            analysis['formality_indicators'].append('informal')
        else:
            analysis['formality_indicators'].append('neutral')
        
        # Complexity score
        unique_words = len(set(words))
        total_words = len(words)
        analysis['complexity_score'] = unique_words / max(total_words, 1)
        
        return analysis
    
    def _calculate_cultural_score(self, regions: Dict, themes: Dict) -> float:
        """Calculate overall cultural relevance score"""
        
        region_score = sum(data['score'] for data in regions.values())
        theme_score = sum(data['score'] for data in themes.values())
        
        # Normalize scores
        region_weight = 0.6
        theme_weight = 0.4
        
        max_region_score = 5.0  # Estimated maximum
        max_theme_score = 3.0   # Estimated maximum
        
        normalized_region = min(region_score / max_region_score, 1.0)
        normalized_theme = min(theme_score / max_theme_score, 1.0)
        
        return normalized_region * region_weight + normalized_theme * theme_weight

class ContextMemoryManager:
    """Manage different types of memory and context"""
    
    def __init__(self, cache_dir: str = "models/context", max_memory_items: int = 10000):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.max_memory_items = max_memory_items
        
        # Memory stores
        self.short_term_memory: deque = deque(maxlen=100)  # Recent contexts
        self.episodic_memory: Dict[str, List[ContextItem]] = defaultdict(list)  # Session-based
        self.semantic_memory: Dict[str, ContextItem] = {}  # Knowledge-based
        self.cultural_memory: Dict[str, ContextItem] = {}  # Cultural knowledge
        
        # Session management
        self.active_sessions: Dict[str, ConversationState] = {}
        
        # Context retrieval indices
        self.topic_index: Dict[str, List[str]] = defaultdict(list)  # topic -> context_ids
        self.entity_index: Dict[str, List[str]] = defaultdict(list)  # entity -> context_ids
        self.temporal_index: List[Tuple[datetime, str]] = []  # (timestamp, context_id)
        
        # Thread pool for async operations
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        
        logger.info(f"Context memory manager initialized with cache: {cache_dir}")
    
    def add_context(self, context_item: ContextItem) -> str:
        """Add context item to appropriate memory store"""
        
        # Generate unique ID
        context_id = self._generate_context_id(context_item)
        
        # Add to appropriate memory store based on type and scope
        if context_item.scope == ContextScope.IMMEDIATE:
            self.short_term_memory.append(context_item)
        
        elif context_item.context_type in [ContextType.CULTURAL, ContextType.HISTORICAL]:
            self.cultural_memory[context_id] = context_item
        
        elif context_item.context_type in [ContextType.TOPICAL, ContextType.LINGUISTIC]:
            self.semantic_memory[context_id] = context_item
        
        # Add to session episodic memory if session context available
        if context_item.scope in [ContextScope.SESSION, ContextScope.USER]:
            session_id = getattr(context_item, 'session_id', 'default')
            self.episodic_memory[session_id].append(context_item)
        
        # Update indices
        self._update_indices(context_id, context_item)
        
        # Memory cleanup if needed
        if len(self.semantic_memory) + len(self.cultural_memory) > self.max_memory_items:
            self._cleanup_memory()
        
        logger.debug(f"Added context: {context_id} ({context_item.context_type.value})")
        
        return context_id
    
    def retrieve_relevant_context(self, query: str, context_types: Optional[List[ContextType]] = None,
                                max_items: int = 10) -> List[ContextItem]:
        """Retrieve most relevant context items for query"""
        
        relevant_contexts = []
        
        # Search short-term memory
        for item in self.short_term_memory:
            if self._is_relevant(item, query, context_types):
                relevant_contexts.append(item)
        
        # Search semantic memory
        for context_id, item in self.semantic_memory.items():
            if self._is_relevant(item, query, context_types):
                relevant_contexts.append(item)
        
        # Search cultural memory
        for context_id, item in self.cultural_memory.items():
            if self._is_relevant(item, query, context_types):
                relevant_contexts.append(item)
        
        # Sort by relevance score
        relevant_contexts.sort(key=lambda x: x.get_current_relevance(), reverse=True)
        
        # Mark as accessed
        for item in relevant_contexts[:max_items]:
            item.access()
        
        return relevant_contexts[:max_items]
    
    def update_conversation_state(self, session_id: str, **kwargs) -> ConversationState:
        """Update conversation state for session"""
        
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = ConversationState(session_id=session_id)
        
        state = self.active_sessions[session_id]
        
        # Update provided attributes
        for key, value in kwargs.items():
            if hasattr(state, key):
                setattr(state, key, value)
        
        state.last_interaction = datetime.now()
        
        return state
    
    def get_conversation_state(self, session_id: str) -> Optional[ConversationState]:
        """Get conversation state for session"""
        return self.active_sessions.get(session_id)
    
    def _generate_context_id(self, context_item: ContextItem) -> str:
        """Generate unique ID for context item"""
        
        content_str = str(context_item.content)[:100]  # Limit length
        timestamp_str = context_item.timestamp.isoformat()
        type_str = context_item.context_type.value
        
        id_string = f"{content_str}-{timestamp_str}-{type_str}"
        
        return hashlib.md5(id_string.encode()).hexdigest()[:12]
    
    def _update_indices(self, context_id: str, context_item: ContextItem):
        """Update search indices"""
        
        # Update temporal index
        self.temporal_index.append((context_item.timestamp, context_id))
        self.temporal_index.sort(key=lambda x: x[0], reverse=True)
        
        # Keep temporal index manageable
        if len(self.temporal_index) > self.max_memory_items:
            self.temporal_index = self.temporal_index[:self.max_memory_items]
    
    def _is_relevant(self, context_item: ContextItem, query: str, 
                   context_types: Optional[List[ContextType]]) -> bool:
        """Check if context item is relevant to query"""
        
        # Type filtering
        if context_types and context_item.context_type not in context_types:
            return False
        
        # Content relevance (simple keyword matching)
        query_lower = query.lower()
        content_lower = str(context_item.content).lower()
        
        # Check for word overlap
        query_words = set(query_lower.split())
        content_words = set(content_lower.split())
        
        word_overlap = len(query_words.intersection(content_words))
        
        # Consider relevance based on overlap and confidence
        relevance_threshold = 0.1
        current_relevance = context_item.get_current_relevance()
        
        return (word_overlap > 0 and current_relevance > relevance_threshold)
    
    def _cleanup_memory(self):
        """Clean up old or low-relevance memory items"""
        
        logger.debug("Starting memory cleanup")
        
        current_time = datetime.now()
        cleanup_threshold = 0.05  # Minimum relevance to keep
        
        # Clean semantic memory
        items_to_remove = []
        for context_id, item in self.semantic_memory.items():
            if item.get_current_relevance() < cleanup_threshold:
                items_to_remove.append(context_id)
        
        for context_id in items_to_remove:
            del self.semantic_memory[context_id]
        
        # Clean cultural memory (more conservative)
        cultural_threshold = 0.02
        items_to_remove = []
        for context_id, item in self.cultural_memory.items():
            if item.get_current_relevance() < cultural_threshold and item.cultural_relevance < 0.5:
                items_to_remove.append(context_id)
        
        for context_id in items_to_remove:
            del self.cultural_memory[context_id]
        
        logger.debug(f"Memory cleanup completed: removed {len(items_to_remove)} items")
    
    def save_memory_state(self, filepath: Optional[str] = None):
        """Save current memory state to disk"""
        
        if filepath is None:
            filepath = self.cache_dir / f"memory_state_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
        
        memory_data = {
            'semantic_memory': {k: v.to_dict() for k, v in self.semantic_memory.items()},
            'cultural_memory': {k: v.to_dict() for k, v in self.cultural_memory.items()},
            'active_sessions': {k: v.to_dict() for k, v in self.active_sessions.items()},
            'timestamp': datetime.now().isoformat()
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(memory_data, f)
        
        logger.info(f"Memory state saved to {filepath}")
    
    def load_memory_state(self, filepath: str):
        """Load memory state from disk"""
        
        try:
            with open(filepath, 'rb') as f:
                memory_data = pickle.load(f)
            
            # Restore semantic memory
            self.semantic_memory = {}
            for context_id, item_data in memory_data['semantic_memory'].items():
                self.semantic_memory[context_id] = ContextItem.from_dict(item_data)
            
            # Restore cultural memory
            self.cultural_memory = {}
            for context_id, item_data in memory_data['cultural_memory'].items():
                self.cultural_memory[context_id] = ContextItem.from_dict(item_data)
            
            # Restore active sessions
            self.active_sessions = {}
            for session_id, state_data in memory_data['active_sessions'].items():
                state = ConversationState(session_id=session_id)
                for key, value in state_data.items():
                    if key not in ['session_start', 'last_interaction']:
                        setattr(state, key, value)
                    else:
                        setattr(state, key, datetime.fromisoformat(value))
                
                self.active_sessions[session_id] = state
            
            logger.info(f"Memory state loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to load memory state: {str(e)}")

class AdvancedContextManager:
    """Advanced context management system for Romanian AI"""
    
    def __init__(self, cache_dir: str = "models/context"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.context_analyzer = RomanianContextAnalyzer()
        self.memory_manager = ContextMemoryManager(cache_dir)
        
        # Context processing pipeline
        self.context_processors = {
            ContextType.CULTURAL: self._process_cultural_context,
            ContextType.CONVERSATIONAL: self._process_conversational_context,
            ContextType.LINGUISTIC: self._process_linguistic_context,
            ContextType.REGIONAL: self._process_regional_context,
            ContextType.TEMPORAL: self._process_temporal_context
        }
        
        logger.info("Advanced context manager initialized")
    
    async def process_input_async(self, text: str, session_id: str,
                                user_id: Optional[str] = None) -> Dict[str, Any]:
        """Asynchronously process input and extract context"""
        
        loop = asyncio.get_event_loop()
        
        result = await loop.run_in_executor(
            self.memory_manager.thread_pool,
            self.process_input,
            text,
            session_id,
            user_id
        )
        
        return result
    
    def process_input(self, text: str, session_id: str,
                     user_id: Optional[str] = None) -> Dict[str, Any]:
        """Process input text and extract contextual information"""
        
        start_time = time.time()
        
        # Analyze Romanian cultural context
        cultural_analysis = self.context_analyzer.analyze_cultural_context(text)
        
        # Create context items
        context_items = []
        
        # Cultural context
        if cultural_analysis['overall_cultural_score'] > 0.1:
            cultural_context = ContextItem(
                context_type=ContextType.CULTURAL,
                content=cultural_analysis,
                confidence=cultural_analysis['overall_cultural_score'],
                timestamp=datetime.now(),
                source="cultural_analyzer",
                scope=ContextScope.SESSION,
                cultural_relevance=cultural_analysis['overall_cultural_score']
            )
            
            if cultural_analysis['dominant_region']:
                cultural_context.regional_context = cultural_analysis['dominant_region']
            
            context_items.append(cultural_context)
        
        # Linguistic context
        linguistic_analysis = cultural_analysis.get('linguistic_analysis', {})
        if linguistic_analysis.get('diacritic_count', 0) > 0:
            linguistic_context = ContextItem(
                context_type=ContextType.LINGUISTIC,
                content=linguistic_analysis,
                confidence=min(linguistic_analysis.get('complexity_score', 0.5), 1.0),
                timestamp=datetime.now(),
                source="linguistic_analyzer",
                scope=ContextScope.SESSION,
                linguistic_markers=linguistic_analysis.get('formality_indicators', [])
            )
            context_items.append(linguistic_context)
        
        # Conversational context
        conversation_context = ContextItem(
            context_type=ContextType.CONVERSATIONAL,
            content={
                'text': text,
                'length': len(text),
                'word_count': len(text.split())
            },
            confidence=0.8,
            timestamp=datetime.now(),
            source="conversation_tracker",
            scope=ContextScope.IMMEDIATE
        )
        context_items.append(conversation_context)
        
        # Add contexts to memory
        context_ids = []
        for item in context_items:
            context_id = self.memory_manager.add_context(item)
            context_ids.append(context_id)
        
        # Update conversation state
        conversation_state = self.memory_manager.update_conversation_state(
            session_id,
            user_id=user_id,
            turn_count=self.memory_manager.active_sessions.get(session_id, ConversationState(session_id)).turn_count + 1
        )
        
        # Update cultural context in conversation state
        if cultural_analysis['dominant_region']:
            conversation_state.regional_focus = cultural_analysis['dominant_region']
        
        # Detect formality level
        if linguistic_analysis.get('formality_indicators'):
            conversation_state.formality_level = linguistic_analysis['formality_indicators'][0]
        
        # Retrieve relevant historical context
        relevant_contexts = self.memory_manager.retrieve_relevant_context(
            text,
            context_types=[ContextType.CULTURAL, ContextType.REGIONAL, ContextType.TOPICAL],
            max_items=5
        )
        
        processing_time = time.time() - start_time
        
        result = {
            'context_analysis': {
                'cultural_analysis': cultural_analysis,
                'linguistic_analysis': linguistic_analysis,
                'context_items_created': len(context_items)
            },
            'conversation_state': conversation_state.to_dict(),
            'relevant_history': [ctx.to_dict() for ctx in relevant_contexts],
            'context_recommendations': self._generate_context_recommendations(
                cultural_analysis, conversation_state
            ),
            'processing_time': processing_time
        }
        
        return result
    
    def get_contextual_response_guidance(self, session_id: str, query: str) -> Dict[str, Any]:
        """Get guidance for contextual response generation"""
        
        # Get conversation state
        conversation_state = self.memory_manager.get_conversation_state(session_id)
        if not conversation_state:
            return {'guidance': 'neutral', 'cultural_context': None}
        
        # Retrieve relevant context
        relevant_contexts = self.memory_manager.retrieve_relevant_context(
            query,
            max_items=8
        )
        
        # Generate response guidance
        guidance = {
            'formality_level': conversation_state.formality_level,
            'regional_context': conversation_state.regional_focus,
            'cultural_context': conversation_state.cultural_context,
            'conversation_mode': conversation_state.conversation_mode,
            'user_engagement': conversation_state.engagement_level,
            'relevant_cultural_elements': [],
            'historical_references': [],
            'linguistic_preferences': []
        }
        
        # Extract cultural elements from relevant contexts
        for context in relevant_contexts:
            if context.context_type == ContextType.CULTURAL:
                if isinstance(context.content, dict):
                    regions = context.content.get('regions', {})
                    themes = context.content.get('cultural_themes', {})
                    
                    for region, data in regions.items():
                        guidance['relevant_cultural_elements'].extend(data.get('matches', []))
                    
                    for theme, data in themes.items():
                        guidance['relevant_cultural_elements'].extend(data.get('matches', []))
            
            elif context.context_type == ContextType.LINGUISTIC:
                if isinstance(context.content, dict):
                    formality = context.content.get('formality_indicators', [])
                    guidance['linguistic_preferences'].extend(formality)
        
        # Remove duplicates
        guidance['relevant_cultural_elements'] = list(set(guidance['relevant_cultural_elements']))
        guidance['linguistic_preferences'] = list(set(guidance['linguistic_preferences']))
        
        return guidance
    
    def _process_cultural_context(self, context_item: ContextItem) -> ContextItem:
        """Process cultural context item"""
        
        # Enhance with additional cultural metadata
        if isinstance(context_item.content, dict):
            regions = context_item.content.get('regions', {})
            if regions:
                # Set regional context from strongest region
                strongest_region = max(regions, key=lambda r: regions[r]['score'])
                context_item.regional_context = strongest_region
                
                # Boost cultural relevance for strong regional indicators
                max_score = max(data['score'] for data in regions.values())
                context_item.cultural_relevance = min(max_score / 3.0, 1.0)
        
        return context_item
    
    def _process_conversational_context(self, context_item: ContextItem) -> ContextItem:
        """Process conversational context item"""
        
        # Enhance with conversation flow analysis
        if isinstance(context_item.content, dict):
            text = context_item.content.get('text', '')
            
            # Detect question vs statement
            if '?' in text:
                context_item.content['type'] = 'question'
            elif text.strip().endswith(('.', '!')):
                context_item.content['type'] = 'statement'
            else:
                context_item.content['type'] = 'fragment'
            
            # Boost priority for questions
            if context_item.content['type'] == 'question':
                context_item.priority = 1.2
        
        return context_item
    
    def _process_linguistic_context(self, context_item: ContextItem) -> ContextItem:
        """Process linguistic context item"""
        
        # Set appropriate decay rate for linguistic context
        context_item.decay_rate = 0.05  # Linguistic context persists longer
        
        return context_item
    
    def _process_regional_context(self, context_item: ContextItem) -> ContextItem:
        """Process regional context item"""
        
        # Regional context has high cultural relevance
        context_item.cultural_relevance = 0.8
        context_item.decay_rate = 0.03  # Very persistent
        
        return context_item
    
    def _process_temporal_context(self, context_item: ContextItem) -> ContextItem:
        """Process temporal context item"""
        
        # Temporal context decays faster
        context_item.decay_rate = 0.2
        
        return context_item
    
    def _generate_context_recommendations(self, cultural_analysis: Dict[str, Any],
                                        conversation_state: ConversationState) -> List[str]:
        """Generate context-based recommendations"""
        
        recommendations = []
        
        # Cultural recommendations
        cultural_score = cultural_analysis.get('overall_cultural_score', 0)
        if cultural_score > 0.7:
            recommendations.append("High cultural content detected - use rich Romanian cultural references")
        elif cultural_score > 0.3:
            recommendations.append("Moderate cultural content - incorporate relevant cultural context")
        
        # Regional recommendations
        dominant_region = cultural_analysis.get('dominant_region')
        if dominant_region:
            recommendations.append(f"Regional focus on {dominant_region} - use region-specific knowledge")
        
        # Formality recommendations
        if conversation_state.formality_level == 'formal':
            recommendations.append("Use formal Romanian language patterns and respectful address forms")
        elif conversation_state.formality_level == 'informal':
            recommendations.append("Use casual Romanian expressions and familiar tone")
        
        # Engagement recommendations
        if conversation_state.engagement_level < 0.3:
            recommendations.append("Low engagement - consider more interactive or culturally engaging content")
        
        return recommendations


# Testing and demonstration
if __name__ == "__main__":
    import time
    
    print("🧠 Romanian Advanced Context Management System Test")
    print("="*60)
    
    # Initialize context manager
    context_manager = AdvancedContextManager()
    
    print("\n🔍 Testing Romanian Cultural Context Analysis:")
    
    # Test cultural context analysis
    cultural_text = """
    Salutare! Sunt din Transilvania și îmi place să ascult muzică populară românească. 
    Castelul Bran și mănăstirile pictate din Bucovina sunt foarte importante pentru 
    cultura noastră. Îmi plac sarmale și mămăliga făcute de bunica mea din Maramureș.
    """
    
    analyzer = RomanianContextAnalyzer()
    cultural_analysis = analyzer.analyze_cultural_context(cultural_text)
    
    print(f"   Overall cultural score: {cultural_analysis['overall_cultural_score']:.2f}")
    print(f"   Dominant region: {cultural_analysis.get('dominant_region', 'None')}")
    print(f"   Detected regions: {len(cultural_analysis['regions'])}")
    
    for region, data in cultural_analysis['regions'].items():
        print(f"      {region}: score={data['score']:.1f}, matches={len(data['matches'])}")
    
    print(f"   Cultural themes: {len(cultural_analysis['cultural_themes'])}")
    for theme, data in cultural_analysis['cultural_themes'].items():
        print(f"      {theme}: {data['matches']}")
    
    linguistic = cultural_analysis['linguistic_analysis']
    print(f"   Diacritic count: {linguistic['diacritic_count']}")
    print(f"   Romanian particles: {linguistic['romanian_particles']}")
    print(f"   Formality: {linguistic['formality_indicators']}")
    
    print("\n💭 Testing Context Processing:")
    
    # Test context processing
    session_id = "test_session_001"
    
    start_time = time.time()
    context_result = context_manager.process_input(
        cultural_text,
        session_id,
        user_id="test_user"
    )
    
    print(f"   Processing time: {context_result['processing_time']:.3f}s")
    print(f"   Context items created: {context_result['context_analysis']['context_items_created']}")
    
    conv_state = context_result['conversation_state']
    print(f"   Turn count: {conv_state['turn_count']}")
    print(f"   Regional focus: {conv_state['regional_focus']}")
    print(f"   Formality level: {conv_state['formality_level']}")
    
    print(f"   Relevant history items: {len(context_result['relevant_history'])}")
    print(f"   Context recommendations: {len(context_result['context_recommendations'])}")
    
    for i, rec in enumerate(context_result['context_recommendations'], 1):
        print(f"      {i}. {rec}")
    
    print("\n🗣️ Testing Contextual Response Guidance:")
    
    # Test response guidance
    query = "Povestește-mi despre tradițiile românești de Crăciun"
    guidance = context_manager.get_contextual_response_guidance(session_id, query)
    
    print(f"   Formality level: {guidance['formality_level']}")
    print(f"   Regional context: {guidance['regional_context']}")
    print(f"   Conversation mode: {guidance['conversation_mode']}")
    print(f"   User engagement: {guidance['user_engagement']:.2f}")
    print(f"   Cultural elements: {len(guidance['relevant_cultural_elements'])}")
    
    if guidance['relevant_cultural_elements']:
        print(f"      Elements: {guidance['relevant_cultural_elements'][:3]}")
    
    print("\n🔄 Testing Multiple Conversations:")
    
    # Test multiple conversation inputs
    test_inputs = [
        "Bună ziua! Cum se prepară cozonacul tradițional?",
        "Ce mănăstiri din Moldova sunt cele mai frumoase?",
        "Îmi place foarte mult muzica lui Gheorghe Zamfir",
        "Pot să învăț despre dansurile populare românești?"
    ]
    
    for i, input_text in enumerate(test_inputs, 1):
        session_id_test = f"session_{i:03d}"
        
        result = context_manager.process_input(input_text, session_id_test)
        
        cultural_score = result['context_analysis']['cultural_analysis']['overall_cultural_score']
        formality = result['conversation_state']['formality_level']
        
        print(f"   Input {i}: cultural={cultural_score:.2f}, formality={formality}")
    
    print("\n💾 Testing Memory Management:")
    
    # Test memory operations
    memory_manager = context_manager.memory_manager
    
    print(f"   Short-term memory items: {len(memory_manager.short_term_memory)}")
    print(f"   Semantic memory items: {len(memory_manager.semantic_memory)}")
    print(f"   Cultural memory items: {len(memory_manager.cultural_memory)}")
    print(f"   Active sessions: {len(memory_manager.active_sessions)}")
    
    # Test memory retrieval
    relevant_contexts = memory_manager.retrieve_relevant_context(
        "tradiții românești Crăciun",
        context_types=[ContextType.CULTURAL],
        max_items=3
    )
    
    print(f"   Retrieved relevant contexts: {len(relevant_contexts)}")
    for ctx in relevant_contexts:
        relevance = ctx.get_current_relevance()
        print(f"      Type: {ctx.context_type.value}, relevance: {relevance:.3f}")
    
    print("\n🔄 Testing Async Processing:")
    
    async def test_async_context():
        """Test async context processing"""
        
        test_text = "Bună dimineața! Vreau să aflu despre folclorul românesc din Banat."
        
        start_time = time.time()
        result = await context_manager.process_input_async(
            test_text,
            "async_session_001",
            "async_user"
        )
        
        async_time = time.time() - start_time
        print(f"   Async processing time: {async_time:.3f}s")
        print(f"   Cultural score: {result['context_analysis']['cultural_analysis']['overall_cultural_score']:.3f}")
        
        return result
    
    # Run async test
    async_result = asyncio.run(test_async_context())
    
    print("\n💾 Testing Memory Persistence:")
    
    # Test memory save/load
    memory_file = context_manager.cache_dir / "test_memory.pkl"
    
    # Save current state
    memory_manager.save_memory_state(str(memory_file))
    print(f"   Memory saved to: {memory_file}")
    
    # Clear memory
    original_semantic_count = len(memory_manager.semantic_memory)
    memory_manager.semantic_memory.clear()
    memory_manager.cultural_memory.clear()
    
    print(f"   Memory cleared: {len(memory_manager.semantic_memory)} items")
    
    # Load memory
    memory_manager.load_memory_state(str(memory_file))
    print(f"   Memory loaded: {len(memory_manager.semantic_memory)} items")
    
    # Cleanup
    if memory_file.exists():
        memory_file.unlink()
    
    print("\n✨ Advanced context management system testing completed!")
    print("Romanian cultural context awareness with sophisticated memory management ready!")
    print("🇷🇴 Context-aware Romanian AI achieved superior cultural understanding!")
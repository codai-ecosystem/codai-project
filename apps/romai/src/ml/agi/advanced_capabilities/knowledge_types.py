"""
RomAI AGI Evolution Phase 2 - Knowledge Types and Data Structures

Core data structures, enums, and interfaces for the External Knowledge Integration System.
This module defines the foundational types used across all knowledge components.
"""

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Union, Set, Tuple
import uuid
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CORE ENUMERATIONS
# ============================================================================

class KnowledgeType(Enum):
    """Types of knowledge that can be retrieved and processed"""
    FACTUAL = "factual"              # Factual information (dates, numbers, definitions)
    CONCEPTUAL = "conceptual"        # Concepts and relationships
    PROCEDURAL = "procedural"        # How-to information and procedures
    CONTEXTUAL = "contextual"        # Context-dependent information
    TEMPORAL = "temporal"            # Time-sensitive information
    SPATIAL = "spatial"              # Location-based information
    ANALYTICAL = "analytical"        # Analysis and insights
    COMPARATIVE = "comparative"      # Comparisons and contrasts

class SourceType(Enum):
    """Types of knowledge sources"""
    WEB_SEARCH = "web_search"        # Web search results
    WEB_PAGE = "web_page"            # Individual web pages
    API = "api"                      # REST/GraphQL APIs
    DATABASE = "database"            # Database queries
    DOCUMENT = "document"            # Document files
    KNOWLEDGE_BASE = "knowledge_base" # Existing knowledge bases
    USER_INPUT = "user_input"        # User-provided information
    SYSTEM_GENERATED = "system_generated" # AI-generated content

class CredibilityLevel(Enum):
    """Credibility levels for information sources"""
    HIGH = "high"                    # Authoritative, peer-reviewed sources
    MEDIUM = "medium"                # Generally reliable sources
    LOW = "low"                      # Questionable or unverified sources
    UNKNOWN = "unknown"              # Credibility not assessed
    CONFLICTING = "conflicting"      # Contradictory information found

class KnowledgeStatus(Enum):
    """Status of knowledge items in the system"""
    PENDING = "pending"              # Awaiting processing
    PROCESSING = "processing"        # Currently being processed
    VERIFIED = "verified"            # Verified and ready for use
    CONFLICTING = "conflicting"      # Conflicts detected with existing knowledge
    OUTDATED = "outdated"            # Information is out of date
    REJECTED = "rejected"            # Failed verification or validation

class FactCheckResult(Enum):
    """Results of fact checking operations"""
    TRUE = "true"                    # Fact verified as true
    FALSE = "false"                  # Fact verified as false
    PARTIALLY_TRUE = "partially_true" # Some aspects true, others false
    MISLEADING = "misleading"        # Technically true but misleading
    UNVERIFIABLE = "unverifiable"    # Cannot be verified with available sources
    INSUFFICIENT_DATA = "insufficient_data" # Not enough data to verify

# ============================================================================
# CORE DATA STRUCTURES
# ============================================================================

@dataclass
class KnowledgeSource:
    """Represents a source of knowledge"""
    id: str
    name: str
    type: SourceType
    url: Optional[str] = None
    credibility: CredibilityLevel = CredibilityLevel.UNKNOWN
    
    # Source metadata
    domain: Optional[str] = None
    author: Optional[str] = None
    publication_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    
    # Access information
    requires_auth: bool = False
    rate_limit: Optional[int] = None
    api_key_required: bool = False
    
    # Quality metrics
    reliability_score: float = 0.0
    freshness_score: float = 0.0
    coverage_score: float = 0.0
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    tags: Set[str] = field(default_factory=set)
    
    def __post_init__(self):
        if self.url and not self.domain:
            parsed = urlparse(self.url)
            self.domain = parsed.netloc

@dataclass
class KnowledgeItem:
    """Represents a piece of knowledge"""
    id: str
    content: str
    type: KnowledgeType
    source: KnowledgeSource
    
    # Knowledge properties
    confidence_score: float = 0.0
    relevance_score: float = 0.0
    recency_score: float = 0.0
    
    # Context information
    context: Dict[str, Any] = field(default_factory=dict)
    keywords: Set[str] = field(default_factory=set)
    entities: List[str] = field(default_factory=list)
    
    # Verification status
    status: KnowledgeStatus = KnowledgeStatus.PENDING
    verification_date: Optional[datetime] = None
    fact_check_result: Optional[FactCheckResult] = None
    
    # Relationships
    related_items: Set[str] = field(default_factory=set)
    contradicts: Set[str] = field(default_factory=set)
    supports: Set[str] = field(default_factory=set)
    
    # Lifecycle tracking
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def is_expired(self) -> bool:
        """Check if knowledge item has expired"""
        return self.expires_at is not None and datetime.now() > self.expires_at
    
    @property
    def age_days(self) -> int:
        """Get age of knowledge item in days"""
        return (datetime.now() - self.created_at).days
    
    def calculate_overall_score(self) -> float:
        """Calculate overall quality score"""
        weights = {
            'confidence': 0.4,
            'relevance': 0.3,
            'recency': 0.2,
            'credibility': 0.1
        }
        
        credibility_score = {
            CredibilityLevel.HIGH: 1.0,
            CredibilityLevel.MEDIUM: 0.7,
            CredibilityLevel.LOW: 0.3,
            CredibilityLevel.UNKNOWN: 0.5,
            CredibilityLevel.CONFLICTING: 0.1
        }.get(self.source.credibility, 0.5)
        
        return (
            weights['confidence'] * self.confidence_score +
            weights['relevance'] * self.relevance_score +
            weights['recency'] * self.recency_score +
            weights['credibility'] * credibility_score
        )

@dataclass
class KnowledgeQuery:
    """Represents a query for knowledge retrieval"""
    id: str
    query_text: str
    knowledge_types: Set[KnowledgeType] = field(default_factory=set)
    
    # Query parameters
    max_results: int = 10
    min_confidence: float = 0.5
    require_recent: bool = False
    max_age_days: Optional[int] = None
    
    # Source preferences
    preferred_sources: Set[str] = field(default_factory=set)
    excluded_sources: Set[str] = field(default_factory=set)
    min_credibility: CredibilityLevel = CredibilityLevel.LOW
    
    # Context
    context: Dict[str, Any] = field(default_factory=dict)
    domain_filter: Optional[str] = None
    language: str = "en"
    
    # Query metadata
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class KnowledgeResponse:
    """Response from knowledge retrieval operations"""
    query_id: str
    items: List[KnowledgeItem] = field(default_factory=list)
    
    # Response metadata
    total_found: int = 0
    search_time: float = 0.0
    sources_consulted: Set[str] = field(default_factory=set)
    
    # Quality metrics
    average_confidence: float = 0.0
    coverage_score: float = 0.0
    consistency_score: float = 0.0
    
    # Status information
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    
    # Response tracking
    timestamp: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Calculate response metrics"""
        if self.items:
            self.total_found = len(self.items)
            self.average_confidence = sum(item.confidence_score for item in self.items) / len(self.items)
            self.sources_consulted = {item.source.id for item in self.items}

@dataclass
class FactCheckRequest:
    """Request for fact checking operation"""
    id: str
    statement: str
    context: Dict[str, Any] = field(default_factory=dict)
    
    # Check parameters
    verify_sources: bool = True
    cross_reference: bool = True
    check_recency: bool = True
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class FactCheckResponse:
    """Response from fact checking operation"""
    request_id: str
    result: FactCheckResult
    confidence_score: float
    
    # Evidence
    supporting_evidence: List[KnowledgeItem] = field(default_factory=list)
    contradicting_evidence: List[KnowledgeItem] = field(default_factory=list)
    
    # Analysis
    explanation: str = ""
    sources_checked: int = 0
    consistency_score: float = 0.0
    
    # Metadata
    check_duration: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class KnowledgeConflict:
    """Represents a conflict between knowledge items"""
    id: str
    item1_id: str
    item2_id: str
    conflict_type: str
    
    # Conflict details
    description: str
    severity: float = 0.0
    resolution_strategy: Optional[str] = None
    
    # Resolution tracking
    resolved: bool = False
    resolution_date: Optional[datetime] = None
    resolution_notes: str = ""
    
    # Metadata
    detected_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

# ============================================================================
# ABSTRACT INTERFACES
# ============================================================================

class KnowledgeRetrieverInterface(ABC):
    """Abstract interface for knowledge retrievers"""
    
    @abstractmethod
    async def retrieve(self, query: KnowledgeQuery) -> KnowledgeResponse:
        """Retrieve knowledge based on query"""
        pass
    
    @abstractmethod
    async def get_supported_sources(self) -> List[KnowledgeSource]:
        """Get list of supported knowledge sources"""
        pass

class FactCheckerInterface(ABC):
    """Abstract interface for fact checkers"""
    
    @abstractmethod
    async def check_fact(self, request: FactCheckRequest) -> FactCheckResponse:
        """Check validity of a factual statement"""
        pass
    
    @abstractmethod
    async def verify_knowledge_item(self, item: KnowledgeItem) -> FactCheckResponse:
        """Verify a knowledge item"""
        pass

class KnowledgeUpdaterInterface(ABC):
    """Abstract interface for knowledge updaters"""
    
    @abstractmethod
    async def add_knowledge(self, item: KnowledgeItem) -> bool:
        """Add new knowledge item"""
        pass
    
    @abstractmethod
    async def update_knowledge(self, item: KnowledgeItem) -> bool:
        """Update existing knowledge item"""
        pass
    
    @abstractmethod
    async def remove_knowledge(self, item_id: str) -> bool:
        """Remove knowledge item"""
        pass
    
    @abstractmethod
    async def detect_conflicts(self, item: KnowledgeItem) -> List[KnowledgeConflict]:
        """Detect conflicts with existing knowledge"""
        pass

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def create_knowledge_source(name: str, source_type: SourceType, **kwargs) -> KnowledgeSource:
    """Create a knowledge source with default values"""
    return KnowledgeSource(
        id=str(uuid.uuid4()),
        name=name,
        type=source_type,
        **kwargs
    )

def create_knowledge_item(content: str, knowledge_type: KnowledgeType, 
                         source: KnowledgeSource, **kwargs) -> KnowledgeItem:
    """Create a knowledge item with default values"""
    return KnowledgeItem(
        id=str(uuid.uuid4()),
        content=content,
        type=knowledge_type,
        source=source,
        **kwargs
    )

def create_knowledge_query(query_text: str, **kwargs) -> KnowledgeQuery:
    """Create a knowledge query with default values"""
    return KnowledgeQuery(
        id=str(uuid.uuid4()),
        query_text=query_text,
        **kwargs
    )

def calculate_recency_score(created_at: datetime, max_age_days: int = 30) -> float:
    """Calculate recency score based on age"""
    age_days = (datetime.now() - created_at).days
    if age_days <= 0:
        return 1.0
    elif age_days >= max_age_days:
        return 0.0
    else:
        return 1.0 - (age_days / max_age_days)

def extract_keywords(text: str, max_keywords: int = 10) -> Set[str]:
    """Extract keywords from text (simplified implementation)"""
    import re
    
    # Simple keyword extraction - remove common words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had'
    }
    
    # Extract words (simplified)
    words = re.findall(r'\b\w+\b', text.lower())
    keywords = {word for word in words if len(word) > 3 and word not in stop_words}
    
    return set(list(keywords)[:max_keywords])

def assess_source_credibility(source: KnowledgeSource) -> CredibilityLevel:
    """Assess credibility of a knowledge source"""
    if not source.domain:
        return CredibilityLevel.UNKNOWN
    
    # High credibility domains (simplified list)
    high_credibility = {
        'wikipedia.org', 'britannica.com', 'nature.com', 'science.org',
        'pubmed.ncbi.nlm.nih.gov', 'arxiv.org', 'ieee.org', 'acm.org'
    }
    
    # Medium credibility domains
    medium_credibility = {
        'reuters.com', 'bbc.com', 'cnn.com', 'nytimes.com', 'washingtonpost.com',
        'theguardian.com', 'wsj.com', 'economist.com'
    }
    
    domain = source.domain.lower()
    
    if any(trusted in domain for trusted in high_credibility):
        return CredibilityLevel.HIGH
    elif any(reliable in domain for reliable in medium_credibility):
        return CredibilityLevel.MEDIUM
    elif domain.endswith('.edu') or domain.endswith('.gov'):
        return CredibilityLevel.HIGH
    elif domain.endswith('.org'):
        return CredibilityLevel.MEDIUM
    else:
        return CredibilityLevel.LOW

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Knowledge Types module loaded - Core data structures ready!")

# Export commonly used types
__all__ = [
    # Enums
    'KnowledgeType', 'SourceType', 'CredibilityLevel', 
    'KnowledgeStatus', 'FactCheckResult',
    
    # Data structures
    'KnowledgeSource', 'KnowledgeItem', 'KnowledgeQuery', 
    'KnowledgeResponse', 'FactCheckRequest', 'FactCheckResponse',
    'KnowledgeConflict',
    
    # Interfaces
    'KnowledgeRetrieverInterface', 'FactCheckerInterface', 
    'KnowledgeUpdaterInterface',
    
    # Utilities
    'create_knowledge_source', 'create_knowledge_item', 
    'create_knowledge_query', 'calculate_recency_score',
    'extract_keywords', 'assess_source_credibility'
]
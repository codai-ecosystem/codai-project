"""
🏛️ Romanian Cultural Intelligence Context
=========================================

Romanian cultural intelligence context management for the Week 14
Advanced Intelligence Enhancement System.

This module provides comprehensive support for Romanian cultural context,
regional variations, and cultural authenticity validation.

Author: RomAI AGI Development Team
Date: August 4, 2025
Version: 1.0.0
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Any, Optional, Set, Tuple
from datetime import datetime
import re


class CulturalDomain(Enum):
    """Romanian cultural domains"""
    TRADITIONAL_WISDOM = "traditional_wisdom"
    BUSINESS = "business"
    ACADEMIC = "academic"
    ARTISTIC = "artistic"
    RELIGIOUS = "religious"
    HISTORICAL = "historical"
    LINGUISTIC = "linguistic"
    SOCIAL = "social"
    POLITICAL = "political"
    ECONOMIC = "economic"
    TECHNOLOGICAL = "technological"
    RURAL = "rural"
    URBAN = "urban"


class RegionalContext(Enum):
    """Romanian regional contexts"""
    BUCURESTI = "București"
    TRANSILVANIA = "Transilvania"
    CLUJ_NAPOCA = "Cluj-Napoca"
    TIMISOARA = "Timișoara"
    IASI = "Iași"
    CONSTANTA = "Constanța"
    BRASOV = "Brașov"
    CRAIOVA = "Craiova"
    GALATI = "Galați"
    PLOIESTI = "Ploiești"
    SIBIU = "Sibiu"
    BACAU = "Bacău"
    ORADEA = "Oradea"
    MOLDOVA = "Moldova"
    MUNTENIA = "Muntenia"
    OLTENIA = "Oltenia"
    DOBROGEA = "Dobrogea"
    BANAT = "Banat"
    MARAMURES = "Maramureș"


class CulturalMarkerType(Enum):
    """Types of cultural markers"""
    LINGUISTIC = "linguistic"
    BEHAVIORAL = "behavioral"
    VALUE_BASED = "value_based"
    TRADITIONAL = "traditional"
    RELIGIOUS = "religious"
    SOCIAL = "social"
    ECONOMIC = "economic"
    HISTORICAL = "historical"


@dataclass
class CulturalMarker:
    """Represents a Romanian cultural marker"""
    marker_type: CulturalMarkerType
    name: str
    description: str
    regional_specificity: List[RegionalContext] = field(default_factory=list)
    domains: List[CulturalDomain] = field(default_factory=list)
    authenticity_weight: float = 1.0
    usage_frequency: float = 1.0
    cultural_significance: float = 1.0
    
    def calculate_relevance(self, region: RegionalContext, domain: CulturalDomain) -> float:
        """Calculate relevance for specific region and domain"""
        relevance = 0.5  # Base relevance
        
        # Regional relevance
        if not self.regional_specificity or region in self.regional_specificity:
            relevance += 0.3
        
        # Domain relevance
        if domain in self.domains:
            relevance += 0.2
        
        # Apply weights
        relevance *= self.authenticity_weight
        relevance *= self.cultural_significance
        
        return min(1.0, relevance)


@dataclass
class RomanianIntelligenceContext:
    """Comprehensive Romanian intelligence context"""
    region: RegionalContext
    cultural_domain: CulturalDomain
    authenticity_level: float
    linguistic_features: List[str] = field(default_factory=list)
    cultural_markers: Dict[str, CulturalMarker] = field(default_factory=dict)
    regional_characteristics: Dict[str, Any] = field(default_factory=dict)
    domain_expertise: Dict[CulturalDomain, float] = field(default_factory=dict)
    validation_timestamp: Optional[datetime] = None
    context_metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Romanian linguistic features
    ROMANIAN_DIACRITICS = ['ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț']
    ROMANIAN_PATTERNS = {
        'formal_address': r'\b(domnul|doamna|domnișoara)\b',
        'politeness': r'\b(vă rog|mulțumesc|cu plăcere)\b',
        'cultural_expressions': r'\b(noroc|sănătate|La mulți ani)\b'
    }
    
    # Regional characteristics
    REGIONAL_CHARACTERISTICS = {
        RegionalContext.BUCURESTI: {
            "dialect": "standard",
            "business_culture": "formal",
            "pace": "fast",
            "cultural_markers": ["metropolitan", "cosmopolitan", "administrative"]
        },
        RegionalContext.TRANSILVANIA: {
            "dialect": "transylvanian",
            "business_culture": "methodical",
            "pace": "steady",
            "cultural_markers": ["traditional", "multicultural", "historical"]
        },
        RegionalContext.MOLDOVA: {
            "dialect": "moldovan",
            "business_culture": "relationship-based",
            "pace": "moderate",
            "cultural_markers": ["traditional", "religious", "agricultural"]
        }
    }
    
    def __post_init__(self):
        """Initialize context after creation"""
        if self.validation_timestamp is None:
            self.validation_timestamp = datetime.now()
        
        # Set regional characteristics
        if self.region in self.REGIONAL_CHARACTERISTICS:
            self.regional_characteristics.update(
                self.REGIONAL_CHARACTERISTICS[self.region]
            )
        
        # Initialize default linguistic features if none provided
        if not self.linguistic_features:
            self.linguistic_features = self._get_default_linguistic_features()
    
    def _get_default_linguistic_features(self) -> List[str]:
        """Get default linguistic features for the context"""
        base_features = ["romanian_diacritics", "formal_address", "politeness"]
        
        # Add domain-specific features
        if self.cultural_domain == CulturalDomain.BUSINESS:
            base_features.extend(["professional_terminology", "formal_structure"])
        elif self.cultural_domain == CulturalDomain.TRADITIONAL_WISDOM:
            base_features.extend(["folk_expressions", "proverbs", "traditional_metaphors"])
        elif self.cultural_domain == CulturalDomain.ACADEMIC:
            base_features.extend(["academic_terminology", "scholarly_discourse"])
        
        return base_features
    
    def validate_cultural_context(self) -> Tuple[bool, List[str]]:
        """Validate the cultural context and return validation results"""
        errors = []
        
        # Validate authenticity level
        if not 0.0 <= self.authenticity_level <= 1.0:
            errors.append("Authenticity level must be between 0.0 and 1.0")
        
        # Validate linguistic features
        if not self.linguistic_features:
            errors.append("Linguistic features cannot be empty")
        
        # Validate cultural markers
        for marker_name, marker in self.cultural_markers.items():
            if not isinstance(marker, CulturalMarker):
                errors.append(f"Invalid cultural marker: {marker_name}")
        
        # Context-specific validations
        if self.cultural_domain == CulturalDomain.BUSINESS:
            if self.authenticity_level < 0.7:
                errors.append("Business domain requires minimum 0.7 authenticity")
        
        if self.cultural_domain == CulturalDomain.TRADITIONAL_WISDOM:
            if self.authenticity_level < 0.8:
                errors.append("Traditional wisdom requires minimum 0.8 authenticity")
        
        return len(errors) == 0, errors
    
    def check_linguistic_authenticity(self, text: str) -> float:
        """Check linguistic authenticity of given text"""
        if not text:
            return 0.0
        
        authenticity_score = 0.0
        total_checks = 0
        
        # Check for Romanian diacritics
        diacritic_count = sum(1 for char in text if char in self.ROMANIAN_DIACRITICS)
        text_length = len(text)
        if text_length > 0:
            diacritic_ratio = diacritic_count / text_length
            authenticity_score += min(1.0, diacritic_ratio * 10)  # Scale appropriately
            total_checks += 1
        
        # Check for Romanian patterns
        for pattern_name, pattern in self.ROMANIAN_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                authenticity_score += 0.3
                total_checks += 1
        
        # Average score
        if total_checks > 0:
            return min(1.0, authenticity_score / total_checks)
        return 0.0
    
    def get_cultural_relevance(self, content_type: str) -> float:
        """Get cultural relevance score for specific content type"""
        base_relevance = 0.5
        
        # Domain-specific relevance
        domain_weights = {
            CulturalDomain.TRADITIONAL_WISDOM: 0.9,
            CulturalDomain.LINGUISTIC: 0.85,
            CulturalDomain.HISTORICAL: 0.8,
            CulturalDomain.SOCIAL: 0.75,
            CulturalDomain.BUSINESS: 0.7
        }
        
        domain_boost = domain_weights.get(self.cultural_domain, 0.6)
        
        # Regional relevance
        regional_boost = 0.1 if self.region in [
            RegionalContext.BUCURESTI,
            RegionalContext.TRANSILVANIA,
            RegionalContext.MOLDOVA
        ] else 0.05
        
        # Authenticity contribution
        authenticity_contribution = self.authenticity_level * 0.3
        
        total_relevance = base_relevance + domain_boost + regional_boost + authenticity_contribution
        return min(1.0, total_relevance)
    
    def add_cultural_marker(self, marker: CulturalMarker) -> None:
        """Add a cultural marker to the context"""
        self.cultural_markers[marker.name] = marker
    
    def remove_cultural_marker(self, marker_name: str) -> bool:
        """Remove a cultural marker from the context"""
        return self.cultural_markers.pop(marker_name, None) is not None
    
    def get_domain_expertise(self, domain: CulturalDomain) -> float:
        """Get expertise level for a specific cultural domain"""
        return self.domain_expertise.get(domain, 0.5)
    
    def update_domain_expertise(self, domain: CulturalDomain, expertise_level: float) -> None:
        """Update expertise level for a cultural domain"""
        self.domain_expertise[domain] = max(0.0, min(1.0, expertise_level))


class CulturalValidator:
    """Validator for Romanian cultural contexts and content"""
    
    def __init__(self):
        self.validation_rules = self._initialize_validation_rules()
        self.cultural_patterns = self._initialize_cultural_patterns()
    
    def _initialize_validation_rules(self) -> Dict[str, Dict[str, Any]]:
        """Initialize validation rules for different domains"""
        return {
            "business": {
                "min_authenticity": 0.7,
                "required_features": ["formal_address", "professional_terminology"],
                "forbidden_patterns": ["informal_language", "slang"]
            },
            "traditional_wisdom": {
                "min_authenticity": 0.8,
                "required_features": ["folk_expressions", "traditional_metaphors"],
                "cultural_markers_required": True
            },
            "academic": {
                "min_authenticity": 0.75,
                "required_features": ["academic_terminology", "formal_structure"],
                "citation_patterns": True
            }
        }
    
    def _initialize_cultural_patterns(self) -> Dict[str, List[str]]:
        """Initialize cultural patterns for validation"""
        return {
            "greetings": ["bună ziua", "bună dimineața", "bună seara", "salut"],
            "politeness": ["vă rog", "mulțumesc", "cu plăcere", "scuzați-mă"],
            "business_terms": ["afaceri", "companie", "întreprindere", "comercial"],
            "cultural_values": ["respect", "tradițiile", "familia", "ospitalitate"]
        }
    
    def validate_context(self, context: RomanianIntelligenceContext) -> Dict[str, Any]:
        """Comprehensive validation of cultural context"""
        validation_result = {
            "valid": True,
            "score": 0.0,
            "errors": [],
            "warnings": [],
            "recommendations": []
        }
        
        # Basic validation
        is_valid, errors = context.validate_cultural_context()
        if not is_valid:
            validation_result["valid"] = False
            validation_result["errors"].extend(errors)
        
        # Domain-specific validation
        domain_key = context.cultural_domain.value
        if domain_key in self.validation_rules:
            domain_validation = self._validate_domain_specific(context, domain_key)
            validation_result["score"] += domain_validation["score"]
            validation_result["warnings"].extend(domain_validation.get("warnings", []))
        
        # Cultural authenticity check
        authenticity_score = self._calculate_authenticity_score(context)
        validation_result["score"] += authenticity_score
        
        if authenticity_score < 0.7:
            validation_result["warnings"].append("Low cultural authenticity score")
        
        # Final score calculation
        validation_result["score"] = validation_result["score"] / 2  # Average of domain and authenticity
        
        return validation_result
    
    def _validate_domain_specific(self, context: RomanianIntelligenceContext, domain_key: str) -> Dict[str, Any]:
        """Validate domain-specific requirements"""
        rules = self.validation_rules[domain_key]
        result = {"score": 0.0, "warnings": []}
        
        # Check minimum authenticity
        if context.authenticity_level < rules["min_authenticity"]:
            result["warnings"].append(f"Authenticity below minimum for {domain_key}")
        else:
            result["score"] += 0.5
        
        # Check required features
        required_features = rules.get("required_features", [])
        present_features = [f for f in required_features if f in context.linguistic_features]
        if len(present_features) == len(required_features):
            result["score"] += 0.5
        else:
            missing = set(required_features) - set(present_features)
            result["warnings"].append(f"Missing required features: {missing}")
        
        return result
    
    def _calculate_authenticity_score(self, context: RomanianIntelligenceContext) -> float:
        """Calculate cultural authenticity score"""
        score = context.authenticity_level
        
        # Boost for cultural markers
        if context.cultural_markers:
            marker_boost = len(context.cultural_markers) * 0.05
            score += marker_boost
        
        # Regional authenticity boost
        if context.region in [RegionalContext.BUCURESTI, RegionalContext.TRANSILVANIA]:
            score += 0.1
        
        return min(1.0, score)


# Predefined cultural contexts for common scenarios
PREDEFINED_CONTEXTS = {
    "bucuresti_business": RomanianIntelligenceContext(
        region=RegionalContext.BUCURESTI,
        cultural_domain=CulturalDomain.BUSINESS,
        authenticity_level=0.85,
        linguistic_features=["formal_address", "professional_terminology", "romanian_diacritics"]
    ),
    "transilvania_traditional": RomanianIntelligenceContext(
        region=RegionalContext.TRANSILVANIA,
        cultural_domain=CulturalDomain.TRADITIONAL_WISDOM,
        authenticity_level=0.92,
        linguistic_features=["folk_expressions", "traditional_metaphors", "regional_dialect"]
    ),
    "cluj_academic": RomanianIntelligenceContext(
        region=RegionalContext.CLUJ_NAPOCA,
        cultural_domain=CulturalDomain.ACADEMIC,
        authenticity_level=0.88,
        linguistic_features=["academic_terminology", "formal_structure", "scholarly_discourse"]
    )
}


def create_cultural_context(region: str, domain: str, authenticity: float = 0.8) -> RomanianIntelligenceContext:
    """Factory function to create cultural contexts"""
    try:
        region_enum = RegionalContext(region)
        domain_enum = CulturalDomain(domain)
        
        return RomanianIntelligenceContext(
            region=region_enum,
            cultural_domain=domain_enum,
            authenticity_level=authenticity
        )
    except ValueError as e:
        raise ValueError(f"Invalid region or domain: {e}")


def get_predefined_context(context_name: str) -> Optional[RomanianIntelligenceContext]:
    """Get a predefined cultural context"""
    return PREDEFINED_CONTEXTS.get(context_name)

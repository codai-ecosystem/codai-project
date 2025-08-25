"""
Week 14 Day 8 Module 2: Multi-Dimensional Intelligence
======================================================

Advanced multi-dimensional intelligence system supporting various intelligence types,
cognitive capabilities, and Romanian cultural intelligence dimensions.
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any, Set, Callable
import asyncio
from collections import defaultdict, deque
import json
import time
import math

from ...utils import get_logger, profile_operation, PerformanceMetrics

logger = get_logger(__name__)

class IntelligenceType(Enum):
    """Types of intelligence dimensions"""
    LINGUISTIC = "linguistic"
    LOGICAL_MATHEMATICAL = "logical_mathematical"
    SPATIAL = "spatial"
    MUSICAL = "musical"
    BODILY_KINESTHETIC = "bodily_kinesthetic"
    INTERPERSONAL = "interpersonal"
    INTRAPERSONAL = "intrapersonal"
    NATURALISTIC = "naturalistic"
    EXISTENTIAL = "existential"
    CREATIVE = "creative"
    EMOTIONAL = "emotional"
    CULTURAL = "cultural"

class IntelligenceDimension(Enum):
    """Dimensions of cognitive processing"""
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    PRACTICAL = "practical"
    SYNTHETIC = "synthetic"
    EVALUATIVE = "evaluative"
    STRATEGIC = "strategic"
    INTUITIVE = "intuitive"
    CULTURAL = "cultural"

class CognitiveCapability(Enum):
    """Specific cognitive capabilities"""
    PATTERN_RECOGNITION = "pattern_recognition"
    ABSTRACT_REASONING = "abstract_reasoning"
    PROBLEM_SOLVING = "problem_solving"
    DECISION_MAKING = "decision_making"
    MEMORY_PROCESSING = "memory_processing"
    ATTENTION_CONTROL = "attention_control"
    LANGUAGE_PROCESSING = "language_processing"
    VISUAL_PROCESSING = "visual_processing"
    AUDITORY_PROCESSING = "auditory_processing"
    MOTOR_COORDINATION = "motor_coordination"
    SOCIAL_COGNITION = "social_cognition"
    EMOTIONAL_REGULATION = "emotional_regulation"
    METACOGNITION = "metacognition"
    CULTURAL_INTELLIGENCE = "cultural_intelligence"

@dataclass
class IntelligenceProfile:
    """Complete intelligence profile with scores and capabilities"""
    intelligence_scores: Dict[IntelligenceType, float] = field(default_factory=dict)
    dimension_scores: Dict[IntelligenceDimension, float] = field(default_factory=dict)
    capability_scores: Dict[CognitiveCapability, float] = field(default_factory=dict)
    overall_score: float = 0.0
    dominant_intelligence: Optional[IntelligenceType] = None
    primary_dimension: Optional[IntelligenceDimension] = None
    strength_areas: List[str] = field(default_factory=list)
    development_areas: List[str] = field(default_factory=list)
    cultural_adaptations: Dict[str, float] = field(default_factory=dict)
    processing_speed: float = 0.0
    accuracy_score: float = 0.0
    timestamp: float = field(default_factory=time.time)

class IntelligenceNetwork(nn.Module):
    """Neural network for multi-dimensional intelligence processing"""
    
    def __init__(self, hidden_dim: int = 512, num_intelligence_types: int = 12):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.num_intelligence_types = num_intelligence_types
        
        # Intelligence type processors
        self.intelligence_processors = nn.ModuleDict({
            intel_type.value: self._create_intelligence_processor(hidden_dim)
            for intel_type in IntelligenceType
        })
        
        # Dimension analyzers
        self.dimension_analyzers = nn.ModuleDict({
            dim.value: self._create_dimension_analyzer(hidden_dim)
            for dim in IntelligenceDimension
        })
        
        # Capability assessors
        self.capability_assessors = nn.ModuleDict({
            cap.value: self._create_capability_assessor(hidden_dim)
            for cap in CognitiveCapability
        })
        
        # Romanian cultural intelligence enhancer
        self.cultural_enhancer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=hidden_dim,
                nhead=8,
                dim_feedforward=2048,
                dropout=0.1,
                batch_first=True
            ),
            num_layers=4
        )
        
        # Intelligence fusion network
        self.fusion_network = nn.Sequential(
            nn.Linear(hidden_dim * num_intelligence_types, hidden_dim * 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, num_intelligence_types),
            nn.Softmax(dim=-1)
        )
        
        # Overall intelligence predictor
        self.intelligence_predictor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )
    
    def _create_intelligence_processor(self, hidden_dim: int) -> nn.Module:
        """Create processor for specific intelligence type"""
        return nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )
    
    def _create_dimension_analyzer(self, hidden_dim: int) -> nn.Module:
        """Create analyzer for cognitive dimension"""
        return nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )
    
    def _create_capability_assessor(self, hidden_dim: int) -> nn.Module:
        """Create assessor for cognitive capability"""
        return nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )
    
    def forward(self, input_representation: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Forward pass for multi-dimensional intelligence assessment"""
        batch_size = input_representation.size(0)
        
        # Apply cultural enhancement
        cultural_enhanced = self.cultural_enhancer(input_representation.unsqueeze(1))
        enhanced_repr = cultural_enhanced.squeeze(1)
        
        # Process each intelligence type
        intelligence_scores = {}
        intelligence_reprs = []
        
        for intel_type in IntelligenceType:
            processor = self.intelligence_processors[intel_type.value]
            score = processor(enhanced_repr)
            intelligence_scores[intel_type.value] = score
            intelligence_reprs.append(enhanced_repr * score)
        
        # Process dimensions
        dimension_scores = {}
        for dimension in IntelligenceDimension:
            analyzer = self.dimension_analyzers[dimension.value]
            score = analyzer(enhanced_repr)
            dimension_scores[dimension.value] = score
        
        # Process capabilities
        capability_scores = {}
        for capability in CognitiveCapability:
            assessor = self.capability_assessors[capability.value]
            score = assessor(enhanced_repr)
            capability_scores[capability.value] = score
        
        # Fuse intelligence representations
        fused_repr = torch.cat(intelligence_reprs, dim=-1)
        intelligence_weights = self.fusion_network(fused_repr)
        
        # Calculate overall intelligence
        overall_intelligence = self.intelligence_predictor(enhanced_repr)
        
        return {
            'intelligence_scores': intelligence_scores,
            'dimension_scores': dimension_scores,
            'capability_scores': capability_scores,
            'intelligence_weights': intelligence_weights,
            'overall_intelligence': overall_intelligence,
            'enhanced_representation': enhanced_repr
        }

class MultiDimensionalIntelligence:
    """Multi-dimensional intelligence system with Romanian cultural adaptations"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.intelligence_network = IntelligenceNetwork().to(self.device)
        self.optimizer = optim.AdamW(self.intelligence_network.parameters(), lr=1e-4)
        
        # Romanian cultural intelligence patterns
        self.cultural_patterns = {
            "traditional_wisdom": {
                "weight": 0.25,
                "indicators": ["proverb", "traditional", "wisdom", "ancestor"],
                "boost_types": [IntelligenceType.CULTURAL, IntelligenceType.EXISTENTIAL]
            },
            "practical_intelligence": {
                "weight": 0.30,
                "indicators": ["practical", "solution", "work", "implementation"],
                "boost_types": [IntelligenceType.LOGICAL_MATHEMATICAL, IntelligenceType.NATURALISTIC]
            },
            "social_harmony": {
                "weight": 0.20,
                "indicators": ["family", "community", "together", "relationship"],
                "boost_types": [IntelligenceType.INTERPERSONAL, IntelligenceType.EMOTIONAL]
            },
            "creative_expression": {
                "weight": 0.25,
                "indicators": ["art", "music", "creative", "expression", "beauty"],
                "boost_types": [IntelligenceType.CREATIVE, IntelligenceType.MUSICAL]
            }
        }
        
        # Intelligence type assessors
        self.intelligence_assessors = {
            IntelligenceType.LINGUISTIC: self._assess_linguistic_intelligence,
            IntelligenceType.LOGICAL_MATHEMATICAL: self._assess_logical_mathematical,
            IntelligenceType.SPATIAL: self._assess_spatial_intelligence,
            IntelligenceType.MUSICAL: self._assess_musical_intelligence,
            IntelligenceType.BODILY_KINESTHETIC: self._assess_kinesthetic_intelligence,
            IntelligenceType.INTERPERSONAL: self._assess_interpersonal_intelligence,
            IntelligenceType.INTRAPERSONAL: self._assess_intrapersonal_intelligence,
            IntelligenceType.NATURALISTIC: self._assess_naturalistic_intelligence,
            IntelligenceType.EXISTENTIAL: self._assess_existential_intelligence,
            IntelligenceType.CREATIVE: self._assess_creative_intelligence,
            IntelligenceType.EMOTIONAL: self._assess_emotional_intelligence,
            IntelligenceType.CULTURAL: self._assess_cultural_intelligence
        }
        
        # Performance metrics
        self.metrics = PerformanceMetrics()
        
        logger.info("MultiDimensionalIntelligence initialized with cultural adaptations")
    
    @profile_operation
    async def assess_intelligence(
        self,
        content: str,
        context: Optional[Dict[str, Any]] = None,
        focus_areas: Optional[List[IntelligenceType]] = None
    ) -> IntelligenceProfile:
        """Comprehensive intelligence assessment"""
        start_time = time.time()
        
        # Initialize profile
        profile = IntelligenceProfile()
        
        # Assess each intelligence type
        intelligence_scores = {}
        for intel_type in (focus_areas or list(IntelligenceType)):
            assessor = self.intelligence_assessors.get(intel_type)
            if assessor:
                score = await assessor(content, context)
                intelligence_scores[intel_type] = score
        
        profile.intelligence_scores = intelligence_scores
        
        # Assess cognitive dimensions
        dimension_scores = {}
        for dimension in IntelligenceDimension:
            score = await self._assess_dimension(content, context, dimension)
            dimension_scores[dimension] = score
        
        profile.dimension_scores = dimension_scores
        
        # Assess cognitive capabilities
        capability_scores = {}
        for capability in CognitiveCapability:
            score = await self._assess_capability(content, context, capability)
            capability_scores[capability] = score
        
        profile.capability_scores = capability_scores
        
        # Apply Romanian cultural adaptations
        cultural_adaptations = await self._apply_cultural_adaptations(
            content, context, intelligence_scores
        )
        profile.cultural_adaptations = cultural_adaptations
        
        # Calculate overall metrics
        profile.overall_score = self._calculate_overall_score(
            intelligence_scores, dimension_scores, capability_scores
        )
        
        # Identify dominant patterns
        profile.dominant_intelligence = max(
            intelligence_scores.items(), key=lambda x: x[1]
        )[0] if intelligence_scores else None
        
        profile.primary_dimension = max(
            dimension_scores.items(), key=lambda x: x[1]
        )[0] if dimension_scores else None
        
        # Identify strengths and development areas
        profile.strength_areas = self._identify_strengths(
            intelligence_scores, dimension_scores, capability_scores
        )
        profile.development_areas = self._identify_development_areas(
            intelligence_scores, dimension_scores, capability_scores
        )
        
        # Performance metrics
        processing_time = time.time() - start_time
        profile.processing_speed = 1.0 / processing_time if processing_time > 0 else 1.0
        profile.accuracy_score = self._calculate_accuracy_score(profile)
        
        # Update metrics
        self.metrics.record_operation(
            "intelligence_assessment",
            processing_time,
            {"overall_score": profile.overall_score}
        )
        
        logger.info(f"Intelligence assessment completed: overall score {profile.overall_score:.3f}, "
                   f"dominant: {profile.dominant_intelligence}, time: {processing_time:.3f}s")
        
        return profile
    
    # Intelligence type assessment methods
    async def _assess_linguistic_intelligence(
        self, content: str, context: Optional[Dict[str, Any]]
    ) -> float:
        """Assess linguistic intelligence"""
        score = 0.0
        
        # Word complexity and vocabulary
        words = content.split()
        unique_words = set(words)
        vocabulary_richness = len(unique_words) / len(words) if words else 0
        score += vocabulary_richness * 0.3
        
        # Sentence structure complexity
        sentences = content.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        complexity_score = min(avg_sentence_length / 20, 1.0)
        score += complexity_score * 0.25
        
        # Romanian diacritics usage (cultural bonus)
        romanian_chars = set('ăâîșțĂÂÎȘȚ')
        if any(char in content for char in romanian_chars):
            score += 0.15
        
        # Language sophistication indicators
        sophisticated_indicators = [
            'complexitate', 'nuanță', 'subtilitate', 'profunzime',
            'înțelepciune', 'cunoaștere', 'perspectivă'
        ]
        if any(indicator in content.lower() for indicator in sophisticated_indicators):
            score += 0.3
        
        return min(score, 1.0)
    
    async def _assess_logical_mathematical(
        self, content: str, context: Optional[Dict[str, Any]]
    ) -> float:
        """Assess logical mathematical intelligence"""
        score = 0.0
        
        # Numbers and mathematical concepts
        import re
        numbers = re.findall(r'\b\d+\.?\d*\b', content)
        if numbers:
            score += min(len(numbers) / 10, 0.2)
        
        # Logical connectors
        logical_words = ['dacă', 'atunci', 'prin urmare', 'deoarece', 'logic', 'rațional']
        logical_count = sum(1 for word in logical_words if word in content.lower())
        score += min(logical_count / 5, 0.3)
        
        # Problem-solving language
        problem_solving_words = ['soluție', 'metodă', 'strategie', 'analiză', 'proces']
        problem_count = sum(1 for word in problem_solving_words if word in content.lower())
        score += min(problem_count / 3, 0.25)
        
        # Sequential thinking indicators
        sequence_words = ['primul', 'apoi', 'în sfârșit', 'pas cu pas', 'etapă']
        sequence_count = sum(1 for word in sequence_words if word in content.lower())
        score += min(sequence_count / 3, 0.25)
        
        return min(score, 1.0)
    
    async def _assess_cultural_intelligence(
        self, content: str, context: Optional[Dict[str, Any]]
    ) -> float:
        """Assess Romanian cultural intelligence"""
        score = 0.0
        
        # Romanian cultural references
        cultural_terms = [
            'tradiție', 'obicei', 'sărbătoare', 'folclor', 'istorie',
            'identitate', 'moștenire', 'strămoși', 'comunitate'
        ]
        cultural_count = sum(1 for term in cultural_terms if term in content.lower())
        score += min(cultural_count / 5, 0.4)
        
        # Regional awareness
        regions = ['transilvania', 'moldova', 'muntenia', 'oltenia', 'dobrogea', 'banat']
        if any(region in content.lower() for region in regions):
            score += 0.2
        
        # Cultural values
        values = ['respect', 'ospitalitate', 'familie', 'muncă', 'onestitate']
        value_count = sum(1 for value in values if value in content.lower())
        score += min(value_count / 3, 0.3)
        
        # Traditional wisdom
        wisdom_indicators = ['înțelepciune', 'experiență', 'învățătură', 'sfat']
        wisdom_count = sum(1 for indicator in wisdom_indicators if indicator in content.lower())
        score += min(wisdom_count / 2, 0.1)
        
        return min(score, 1.0)
    
    # Placeholder implementations for other intelligence types
    async def _assess_spatial_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_musical_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_kinesthetic_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_interpersonal_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_intrapersonal_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_naturalistic_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_existential_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_creative_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    async def _assess_emotional_intelligence(self, content: str, context: Optional[Dict[str, Any]]) -> float: return 0.5
    
    async def _assess_dimension(
        self, content: str, context: Optional[Dict[str, Any]], dimension: IntelligenceDimension
    ) -> float:
        """Assess cognitive dimension"""
        # Placeholder implementation
        return 0.75
    
    async def _assess_capability(
        self, content: str, context: Optional[Dict[str, Any]], capability: CognitiveCapability
    ) -> float:
        """Assess cognitive capability"""
        # Placeholder implementation
        return 0.80
    
    async def _apply_cultural_adaptations(
        self,
        content: str,
        context: Optional[Dict[str, Any]],
        intelligence_scores: Dict[IntelligenceType, float]
    ) -> Dict[str, float]:
        """Apply Romanian cultural adaptations to intelligence scores"""
        adaptations = {}
        
        for pattern_name, pattern_info in self.cultural_patterns.items():
            # Check for pattern indicators
            indicator_count = sum(
                1 for indicator in pattern_info['indicators']
                if indicator in content.lower()
            )
            
            if indicator_count > 0:
                adaptation_strength = min(indicator_count / len(pattern_info['indicators']), 1.0)
                adaptations[pattern_name] = adaptation_strength * pattern_info['weight']
        
        return adaptations
    
    def _calculate_overall_score(
        self,
        intelligence_scores: Dict[IntelligenceType, float],
        dimension_scores: Dict[IntelligenceDimension, float],
        capability_scores: Dict[CognitiveCapability, float]
    ) -> float:
        """Calculate overall intelligence score"""
        # Weighted combination of scores
        intel_avg = sum(intelligence_scores.values()) / len(intelligence_scores) if intelligence_scores else 0
        dim_avg = sum(dimension_scores.values()) / len(dimension_scores) if dimension_scores else 0
        cap_avg = sum(capability_scores.values()) / len(capability_scores) if capability_scores else 0
        
        # Weighted average (intelligence types have higher weight)
        overall = (intel_avg * 0.5 + dim_avg * 0.3 + cap_avg * 0.2)
        
        return overall
    
    def _identify_strengths(
        self,
        intelligence_scores: Dict[IntelligenceType, float],
        dimension_scores: Dict[IntelligenceDimension, float],
        capability_scores: Dict[CognitiveCapability, float]
    ) -> List[str]:
        """Identify strength areas (top 25% scores)"""
        all_scores = {}
        all_scores.update({f"intelligence_{k.value}": v for k, v in intelligence_scores.items()})
        all_scores.update({f"dimension_{k.value}": v for k, v in dimension_scores.items()})
        all_scores.update({f"capability_{k.value}": v for k, v in capability_scores.items()})
        
        if not all_scores:
            return []
        
        threshold = np.percentile(list(all_scores.values()), 75)
        strengths = [k for k, v in all_scores.items() if v >= threshold]
        
        return strengths[:5]  # Top 5 strengths
    
    def _identify_development_areas(
        self,
        intelligence_scores: Dict[IntelligenceType, float],
        dimension_scores: Dict[IntelligenceDimension, float],
        capability_scores: Dict[CognitiveCapability, float]
    ) -> List[str]:
        """Identify development areas (bottom 25% scores)"""
        all_scores = {}
        all_scores.update({f"intelligence_{k.value}": v for k, v in intelligence_scores.items()})
        all_scores.update({f"dimension_{k.value}": v for k, v in dimension_scores.items()})
        all_scores.update({f"capability_{k.value}": v for k, v in capability_scores.items()})
        
        if not all_scores:
            return []
        
        threshold = np.percentile(list(all_scores.values()), 25)
        development_areas = [k for k, v in all_scores.items() if v <= threshold]
        
        return development_areas[:3]  # Top 3 development areas
    
    def _calculate_accuracy_score(self, profile: IntelligenceProfile) -> float:
        """Calculate assessment accuracy score"""
        # Based on confidence intervals and consistency
        scores = list(profile.intelligence_scores.values())
        if not scores:
            return 0.0
        
        # Consistency measure (lower variance = higher accuracy)
        variance = np.var(scores)
        consistency_score = max(0, 1.0 - variance)
        
        # Completeness measure
        completeness = len(scores) / len(IntelligenceType)
        
        return (consistency_score * 0.7 + completeness * 0.3)
    
    @profile_operation
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get intelligence system performance metrics"""
        return self.metrics.get_summary()


# Demonstration function
async def demonstrate_multi_dimensional_intelligence():
    """Demonstrate multi-dimensional intelligence capabilities"""
    print("🧠 Week 14 Day 8: Multi-Dimensional Intelligence Demo")
    print("=" * 60)
    
    intelligence_system = MultiDimensionalIntelligence()
    
    # Test content samples
    test_samples = [
        {
            "content": "Prin aplicarea unei metodologii sistematice și analiză logică, "
                      "putem rezolva problemele complexe pas cu pas, folosind principiile "
                      "tradiționale românești de muncă perseverentă și gândire practică.",
            "context": {"domain": "problem_solving", "romanian_context": True}
        },
        {
            "content": "Muzica populară românească exprimă profunzimea sufletului nostru, "
                      "îmbinând melodiile ancestrale cu expresia creativă contemporană, "
                      "creând o simfonie a identității culturale.",
            "context": {"domain": "cultural_arts", "romanian_context": True}
        },
        {
            "content": "În familie și comunitate, înțelepciunea se transmite prin povești, "
                      "experiențe împărtășite și respectul reciproc, construind legături "
                      "puternice între generații.",
            "context": {"domain": "social_intelligence", "romanian_context": True}
        }
    ]
    
    for i, sample in enumerate(test_samples, 1):
        print(f"\n🔍 Intelligence Assessment {i}:")
        print(f"Content: {sample['content'][:100]}...")
        
        profile = await intelligence_system.assess_intelligence(
            sample['content'],
            sample['context']
        )
        
        print(f"✅ Overall Intelligence Score: {profile.overall_score:.3f}")
        print(f"🎯 Dominant Intelligence: {profile.dominant_intelligence.value if profile.dominant_intelligence else 'None'}")
        print(f"📊 Primary Dimension: {profile.primary_dimension.value if profile.primary_dimension else 'None'}")
        
        # Top intelligence scores
        top_intelligences = sorted(
            profile.intelligence_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        print("🏆 Top Intelligence Types:")
        for intel_type, score in top_intelligences:
            print(f"   - {intel_type.value}: {score:.3f}")
        
        # Cultural adaptations
        if profile.cultural_adaptations:
            print("🇷🇴 Cultural Adaptations:")
            for adaptation, strength in profile.cultural_adaptations.items():
                print(f"   - {adaptation}: {strength:.3f}")
        
        print(f"⚡ Processing Speed: {profile.processing_speed:.3f}")
        print(f"🎯 Accuracy Score: {profile.accuracy_score:.3f}")
    
    # Performance summary
    print(f"\n📈 System Performance:")
    metrics = intelligence_system.get_performance_metrics()
    print(f"Average processing time: {metrics.get('avg_time', 0):.3f}s")
    print(f"Assessments completed: {metrics.get('operation_count', 0)}")


if __name__ == "__main__":
    asyncio.run(demonstrate_multi_dimensional_intelligence())

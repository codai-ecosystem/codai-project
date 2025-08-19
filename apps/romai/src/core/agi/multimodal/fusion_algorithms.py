"""
Romanian Multimodal Fusion Algorithms
Advanced fusion techniques for Romanian cultural content
Week 8 Day 4 Component 2 - RomAI Multimodal System
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Union, Any, Callable
from dataclasses import dataclass, field
from enum import Enum
import time
import json
from abc import ABC, abstractmethod
import math

# Real infrastructure imports - NO MOCK DATA
from ..real_database import (
    RealDatabaseManager, RealDatabaseOperations, 
    real_api_manager, real_performance_monitor
)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FusionAlgorithmType(Enum):
    """Types of fusion algorithms"""
    WEIGHTED_AVERAGE = "weighted_average"
    ATTENTION_BASED = "attention_based"
    NEURAL_FUSION = "neural_fusion"
    CULTURAL_WEIGHTED = "cultural_weighted"
    SEMANTIC_ALIGNMENT = "semantic_alignment"
    TEMPORAL_FUSION = "temporal_fusion"
    HIERARCHICAL_FUSION = "hierarchical_fusion"
    ADAPTIVE_FUSION = "adaptive_fusion"

class RomanianCulturalWeight(Enum):
    """Romanian cultural weighting strategies"""
    LANGUAGE_BASED = "language_based"
    REGIONAL_BASED = "regional_based"
    HISTORICAL_BASED = "historical_based"
    TRADITION_BASED = "tradition_based"
    MODERN_ADAPTATION = "modern_adaptation"

@dataclass
class FusionContext:
    """Context for fusion algorithms"""
    modality_confidences: Dict[str, float] = field(default_factory=dict)
    cultural_indicators: Dict[str, float] = field(default_factory=dict)
    temporal_alignment: float = 0.0
    semantic_similarity: float = 0.0
    regional_context: Optional[str] = None
    processing_constraints: Dict[str, Any] = field(default_factory=dict)

@dataclass
class FusionResult:
    """Result of fusion algorithm"""
    fused_features: np.ndarray
    confidence_score: float
    fusion_weights: Dict[str, float]
    cultural_boost: float
    algorithm_metadata: Dict[str, Any]

class FusionAlgorithmBase(ABC):
    """Abstract base class for fusion algorithms"""
    
    def __init__(self, algorithm_type: FusionAlgorithmType):
        self.algorithm_type = algorithm_type
        self.name = algorithm_type.value
        self.romanian_cultural_weights = self._initialize_cultural_weights()
    
    def _initialize_cultural_weights(self) -> Dict[str, float]:
        """Initialize Romanian cultural weighting factors"""
        return {
            'romanian_language_boost': 0.3,
            'traditional_elements_boost': 0.25,
            'regional_authenticity_boost': 0.2,
            'historical_context_boost': 0.15,
            'modern_romanian_boost': 0.1
        }
    
    @abstractmethod
    async def fuse_features(self, features: Dict[str, np.ndarray], 
                          context: FusionContext) -> FusionResult:
        """Fuse multimodal features"""
        pass
    
    def calculate_cultural_boost(self, context: FusionContext) -> float:
        """Calculate Romanian cultural boost factor"""
        cultural_indicators = context.cultural_indicators
        
        boost_factor = 0.0
        
        # Language-based boost
        romanian_score = cultural_indicators.get('romanian_authenticity', 0)
        boost_factor += romanian_score * self.romanian_cultural_weights['romanian_language_boost']
        
        # Traditional elements boost
        traditional_score = cultural_indicators.get('traditional_elements', 0)
        boost_factor += traditional_score * self.romanian_cultural_weights['traditional_elements_boost']
        
        # Regional authenticity boost
        regional_score = cultural_indicators.get('regional_authenticity', 0)
        boost_factor += regional_score * self.romanian_cultural_weights['regional_authenticity_boost']
        
        # Historical context boost
        historical_score = cultural_indicators.get('historical_relevance', 0)
        boost_factor += historical_score * self.romanian_cultural_weights['historical_context_boost']
        
        # Modern Romanian adaptation boost
        modern_score = cultural_indicators.get('modern_adaptation', 0)
        boost_factor += modern_score * self.romanian_cultural_weights['modern_romanian_boost']
        
        return min(1.0, boost_factor)

class WeightedAverageFusion(FusionAlgorithmBase):
    """Weighted average fusion with cultural enhancement"""
    
    def __init__(self):
        super().__init__(FusionAlgorithmType.WEIGHTED_AVERAGE)
        self.default_weights = {'audio': 0.4, 'visual': 0.4, 'text': 0.2}
    
    async def fuse_features(self, features: Dict[str, np.ndarray], 
                          context: FusionContext) -> FusionResult:
        """Fuse features using weighted average"""
        await asyncio.sleep(0.005)  # Simulate processing
        
        # Calculate adaptive weights based on modality confidences
        weights = self._calculate_adaptive_weights(features, context)
        
        # Apply cultural weighting
        cultural_boost = self.calculate_cultural_boost(context)
        weights = self._apply_cultural_weighting(weights, cultural_boost, context)
        
        # Perform weighted fusion
        fused_features = self._weighted_average_fusion(features, weights)
        
        # Calculate overall confidence
        confidence = self._calculate_fusion_confidence(weights, context)
        
        return FusionResult(
            fused_features=fused_features,
            confidence_score=confidence,
            fusion_weights=weights,
            cultural_boost=cultural_boost,
            algorithm_metadata={
                'algorithm': self.name,
                'modality_count': len(features),
                'feature_dimension': fused_features.shape[0] if len(fused_features.shape) > 0 else 1
            }
        )
    
    def _calculate_adaptive_weights(self, features: Dict[str, np.ndarray], 
                                  context: FusionContext) -> Dict[str, float]:
        """Calculate adaptive weights based on modality qualities"""
        weights = {}
        total_confidence = 0.0
        
        # Start with default weights
        for modality in features.keys():
            if modality in self.default_weights:
                base_weight = self.default_weights[modality]
            else:
                base_weight = 1.0 / len(features)  # Equal weight for unknown modalities
            
            # Adjust based on modality confidence
            confidence = context.modality_confidences.get(modality, 0.5)
            adjusted_weight = base_weight * (0.5 + confidence)  # Boost confident modalities
            
            weights[modality] = adjusted_weight
            total_confidence += adjusted_weight
        
        # Normalize weights
        if total_confidence > 0:
            for modality in weights:
                weights[modality] /= total_confidence
        
        return weights
    
    def _apply_cultural_weighting(self, weights: Dict[str, float], 
                                cultural_boost: float, 
                                context: FusionContext) -> Dict[str, float]:
        """Apply Romanian cultural weighting to modalities"""
        cultural_weights = weights.copy()
        
        # Boost modalities with strong Romanian cultural content
        for modality, weight in weights.items():
            cultural_relevance = context.cultural_indicators.get(f'{modality}_cultural_relevance', 0)
            
            if cultural_relevance > 0.6:  # Strong cultural relevance
                boost_factor = 1.0 + (cultural_boost * 0.5)
                cultural_weights[modality] = weight * boost_factor
        
        # Renormalize
        total_weight = sum(cultural_weights.values())
        if total_weight > 0:
            for modality in cultural_weights:
                cultural_weights[modality] /= total_weight
        
        return cultural_weights
    
    def _weighted_average_fusion(self, features: Dict[str, np.ndarray], 
                               weights: Dict[str, float]) -> np.ndarray:
        """Perform weighted average fusion"""
        if not features:
            return np.array([])
        
        # Determine output dimension
        first_feature = next(iter(features.values()))
        if len(first_feature.shape) == 1:
            output_dim = first_feature.shape[0]
        else:
            output_dim = first_feature.shape[0]  # Assume first dimension is feature dimension
        
        fused = np.zeros(output_dim)
        
        for modality, feature_vector in features.items():
            weight = weights.get(modality, 0)
            
            if len(feature_vector.shape) == 1:
                fused += weight * feature_vector
            else:
                # Handle multi-dimensional features - take mean or first row
                if feature_vector.shape[0] > 0:
                    fused += weight * feature_vector[0]  # Use first row as representative
        
        return fused
    
    def _calculate_fusion_confidence(self, weights: Dict[str, float], 
                                   context: FusionContext) -> float:
        """Calculate overall fusion confidence"""
        # Base confidence from modality confidences
        weighted_confidence = 0.0
        for modality, weight in weights.items():
            modality_confidence = context.modality_confidences.get(modality, 0.5)
            weighted_confidence += weight * modality_confidence
        
        # Boost confidence for good alignment
        alignment_boost = context.temporal_alignment * 0.1 + context.semantic_similarity * 0.1
        
        # Cultural coherence boost
        cultural_coherence = sum(context.cultural_indicators.values()) / len(context.cultural_indicators) \
                           if context.cultural_indicators else 0
        cultural_boost = cultural_coherence * 0.2
        
        total_confidence = weighted_confidence + alignment_boost + cultural_boost
        return min(1.0, total_confidence)

class AttentionBasedFusion(FusionAlgorithmBase):
    """Attention-based fusion with Romanian cultural attention"""
    
    def __init__(self):
        super().__init__(FusionAlgorithmType.ATTENTION_BASED)
        self.attention_temperature = 0.1
        self.cultural_attention_boost = 0.3
    
    async def fuse_features(self, features: Dict[str, np.ndarray], 
                          context: FusionContext) -> FusionResult:
        """Fuse features using attention mechanism"""
        await asyncio.sleep(0.01)
        
        # Calculate attention weights
        attention_weights = self._calculate_attention_weights(features, context)
        
        # Apply cultural attention boosting
        cultural_boost = self.calculate_cultural_boost(context)
        cultural_attention = self._apply_cultural_attention(attention_weights, cultural_boost, context)
        
        # Perform attention-based fusion
        fused_features = self._attention_fusion(features, cultural_attention)
        
        # Calculate confidence
        confidence = self._calculate_attention_confidence(cultural_attention, context)
        
        return FusionResult(
            fused_features=fused_features,
            confidence_score=confidence,
            fusion_weights=cultural_attention,
            cultural_boost=cultural_boost,
            algorithm_metadata={
                'algorithm': self.name,
                'attention_temperature': self.attention_temperature,
                'cultural_attention_applied': True
            }
        )
    
    def _calculate_attention_weights(self, features: Dict[str, np.ndarray], 
                                   context: FusionContext) -> Dict[str, float]:
        """Calculate attention weights for each modality"""
        attention_scores = {}
        
        for modality, feature_vector in features.items():
            # Base attention from feature magnitude
            feature_magnitude = np.linalg.norm(feature_vector) if feature_vector.size > 0 else 0
            
            # Modality confidence contribution
            confidence = context.modality_confidences.get(modality, 0.5)
            
            # Cultural relevance contribution
            cultural_relevance = context.cultural_indicators.get(f'{modality}_cultural_relevance', 0)
            
            # Combined attention score
            attention_score = feature_magnitude * 0.4 + confidence * 0.3 + cultural_relevance * 0.3
            attention_scores[modality] = attention_score
        
        # Apply softmax with temperature
        return self._softmax_attention(attention_scores, self.attention_temperature)
    
    def _softmax_attention(self, scores: Dict[str, float], temperature: float) -> Dict[str, float]:
        """Apply softmax to attention scores"""
        if not scores:
            return {}
        
        # Apply temperature scaling
        scaled_scores = {k: v / temperature for k, v in scores.items()}
        
        # Calculate softmax
        max_score = max(scaled_scores.values())
        exp_scores = {k: math.exp(v - max_score) for k, v in scaled_scores.items()}
        
        sum_exp = sum(exp_scores.values())
        if sum_exp > 0:
            return {k: v / sum_exp for k, v in exp_scores.items()}
        else:
            # Uniform attention if all scores are zero
            return {k: 1.0 / len(scores) for k in scores.keys()}
    
    def _apply_cultural_attention(self, attention_weights: Dict[str, float], 
                                cultural_boost: float, 
                                context: FusionContext) -> Dict[str, float]:
        """Apply cultural attention boosting"""
        cultural_attention = attention_weights.copy()
        
        for modality, attention in attention_weights.items():
            # Get cultural relevance for this modality
            cultural_relevance = context.cultural_indicators.get(f'{modality}_cultural_relevance', 0)
            
            if cultural_relevance > 0.5:  # Significant cultural content
                boost = 1.0 + (cultural_boost * self.cultural_attention_boost * cultural_relevance)
                cultural_attention[modality] = attention * boost
        
        # Renormalize attention weights
        total_attention = sum(cultural_attention.values())
        if total_attention > 0:
            for modality in cultural_attention:
                cultural_attention[modality] /= total_attention
        
        return cultural_attention
    
    def _attention_fusion(self, features: Dict[str, np.ndarray], 
                        attention_weights: Dict[str, float]) -> np.ndarray:
        """Perform attention-based feature fusion"""
        if not features:
            return np.array([])
        
        # Determine output dimension
        first_feature = next(iter(features.values()))
        if len(first_feature.shape) == 1:
            output_dim = first_feature.shape[0]
        else:
            output_dim = first_feature.shape[0]
        
        fused = np.zeros(output_dim)
        
        for modality, feature_vector in features.items():
            attention = attention_weights.get(modality, 0)
            
            if len(feature_vector.shape) == 1:
                fused += attention * feature_vector
            else:
                if feature_vector.shape[0] > 0:
                    fused += attention * feature_vector[0]
        
        return fused
    
    def _calculate_attention_confidence(self, attention_weights: Dict[str, float], 
                                      context: FusionContext) -> float:
        """Calculate confidence for attention-based fusion"""
        # Entropy-based confidence (lower entropy = higher confidence)
        attention_values = list(attention_weights.values())
        if not attention_values:
            return 0.0
        
        # Calculate entropy
        entropy = -sum(p * math.log(p + 1e-10) for p in attention_values if p > 0)
        max_entropy = math.log(len(attention_values))
        
        # Normalized entropy (0 = confident, 1 = uncertain)
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 1.0
        
        # Confidence is inverse of entropy
        entropy_confidence = 1.0 - normalized_entropy
        
        # Combine with other confidence factors
        alignment_confidence = (context.temporal_alignment + context.semantic_similarity) / 2
        cultural_confidence = sum(context.cultural_indicators.values()) / len(context.cultural_indicators) \
                            if context.cultural_indicators else 0
        
        # Weighted combination
        total_confidence = (
            entropy_confidence * 0.4 +
            alignment_confidence * 0.3 +
            cultural_confidence * 0.3
        )
        
        return min(1.0, total_confidence)

class CulturalWeightedFusion(FusionAlgorithmBase):
    """Romanian culture-specific weighted fusion"""
    
    def __init__(self):
        super().__init__(FusionAlgorithmType.CULTURAL_WEIGHTED)
        self.cultural_priority_weights = self._initialize_cultural_priorities()
    
    def _initialize_cultural_priorities(self) -> Dict[str, float]:
        """Initialize cultural priority weights"""
        return {
            'language_authenticity': 0.3,
            'traditional_elements': 0.25,
            'regional_specificity': 0.2,
            'historical_context': 0.15,
            'cultural_continuity': 0.1
        }
    
    async def fuse_features(self, features: Dict[str, np.ndarray], 
                          context: FusionContext) -> FusionResult:
        """Fuse features with cultural prioritization"""
        await asyncio.sleep(0.008)
        
        # Calculate cultural relevance for each modality
        cultural_relevance = self._calculate_cultural_relevance(features, context)
        
        # Generate cultural fusion weights
        fusion_weights = self._generate_cultural_weights(cultural_relevance, context)
        
        # Apply Romanian cultural boosting
        cultural_boost = self.calculate_cultural_boost(context)
        enhanced_weights = self._apply_cultural_enhancement(fusion_weights, cultural_boost, context)
        
        # Perform culturally-weighted fusion
        fused_features = self._cultural_weighted_fusion(features, enhanced_weights)
        
        # Calculate cultural confidence
        confidence = self._calculate_cultural_confidence(enhanced_weights, cultural_relevance, context)
        
        return FusionResult(
            fused_features=fused_features,
            confidence_score=confidence,
            fusion_weights=enhanced_weights,
            cultural_boost=cultural_boost,
            algorithm_metadata={
                'algorithm': self.name,
                'cultural_relevance_scores': cultural_relevance,
                'cultural_priorities_applied': True
            }
        )
    
    def _calculate_cultural_relevance(self, features: Dict[str, np.ndarray], 
                                    context: FusionContext) -> Dict[str, float]:
        """Calculate cultural relevance for each modality"""
        relevance_scores = {}
        
        for modality in features.keys():
            # Base cultural relevance from context
            base_relevance = context.cultural_indicators.get(f'{modality}_cultural_relevance', 0)
            
            # Language authenticity contribution
            romanian_score = context.cultural_indicators.get('romanian_authenticity', 0)
            language_contribution = romanian_score * self.cultural_priority_weights['language_authenticity']
            
            # Traditional elements contribution
            traditional_score = context.cultural_indicators.get('traditional_elements', 0)
            traditional_contribution = traditional_score * self.cultural_priority_weights['traditional_elements']
            
            # Regional specificity contribution
            regional_score = context.cultural_indicators.get('regional_authenticity', 0)
            regional_contribution = regional_score * self.cultural_priority_weights['regional_specificity']
            
            # Historical context contribution
            historical_score = context.cultural_indicators.get('historical_relevance', 0)
            historical_contribution = historical_score * self.cultural_priority_weights['historical_context']
            
            # Cultural continuity contribution
            continuity_score = context.cultural_indicators.get('cultural_continuity', 0)
            continuity_contribution = continuity_score * self.cultural_priority_weights['cultural_continuity']
            
            # Combined relevance score
            total_relevance = (
                base_relevance * 0.3 +
                language_contribution +
                traditional_contribution +
                regional_contribution +
                historical_contribution +
                continuity_contribution
            )
            
            relevance_scores[modality] = min(1.0, total_relevance)
        
        return relevance_scores
    
    def _generate_cultural_weights(self, cultural_relevance: Dict[str, float], 
                                 context: FusionContext) -> Dict[str, float]:
        """Generate fusion weights based on cultural relevance"""
        weights = {}
        
        # Start with confidence-based weights
        for modality in cultural_relevance.keys():
            confidence = context.modality_confidences.get(modality, 0.5)
            relevance = cultural_relevance[modality]
            
            # Combine confidence and cultural relevance
            base_weight = (confidence * 0.4 + relevance * 0.6)
            weights[modality] = base_weight
        
        # Normalize weights
        total_weight = sum(weights.values())
        if total_weight > 0:
            for modality in weights:
                weights[modality] /= total_weight
        
        return weights
    
    def _apply_cultural_enhancement(self, weights: Dict[str, float], 
                                  cultural_boost: float, 
                                  context: FusionContext) -> Dict[str, float]:
        """Apply cultural enhancement to fusion weights"""
        enhanced_weights = weights.copy()
        
        # Boost weights for modalities with high cultural content
        for modality, weight in weights.items():
            cultural_content = context.cultural_indicators.get(f'{modality}_cultural_relevance', 0)
            
            if cultural_content > 0.7:  # High cultural content
                enhancement_factor = 1.0 + (cultural_boost * 0.4)
                enhanced_weights[modality] = weight * enhancement_factor
            elif cultural_content > 0.4:  # Moderate cultural content
                enhancement_factor = 1.0 + (cultural_boost * 0.2)
                enhanced_weights[modality] = weight * enhancement_factor
        
        # Special boost for Romanian regional context
        if context.regional_context:
            regional_boost = 0.15 * cultural_boost
            for modality in enhanced_weights:
                enhanced_weights[modality] *= (1.0 + regional_boost)
        
        # Renormalize
        total_weight = sum(enhanced_weights.values())
        if total_weight > 0:
            for modality in enhanced_weights:
                enhanced_weights[modality] /= total_weight
        
        return enhanced_weights
    
    def _cultural_weighted_fusion(self, features: Dict[str, np.ndarray], 
                                weights: Dict[str, float]) -> np.ndarray:
        """Perform culturally-weighted feature fusion"""
        if not features:
            return np.array([])
        
        # Determine output dimension
        feature_dims = []
        for feature_vector in features.values():
            if len(feature_vector.shape) == 1:
                feature_dims.append(feature_vector.shape[0])
            else:
                feature_dims.append(feature_vector.shape[0])
        
        output_dim = max(feature_dims) if feature_dims else 0
        fused = np.zeros(output_dim)
        
        for modality, feature_vector in features.items():
            weight = weights.get(modality, 0)
            
            if len(feature_vector.shape) == 1:
                # Pad if necessary
                if feature_vector.shape[0] < output_dim:
                    padded_feature = np.pad(feature_vector, (0, output_dim - feature_vector.shape[0]))
                else:
                    padded_feature = feature_vector[:output_dim]
                fused += weight * padded_feature
            else:
                if feature_vector.shape[0] > 0:
                    # Use first row and pad if necessary
                    first_row = feature_vector[0]
                    if len(first_row) < output_dim:
                        padded_feature = np.pad(first_row, (0, output_dim - len(first_row)))
                    else:
                        padded_feature = first_row[:output_dim]
                    fused += weight * padded_feature
        
        return fused
    
    def _calculate_cultural_confidence(self, weights: Dict[str, float], 
                                     cultural_relevance: Dict[str, float], 
                                     context: FusionContext) -> float:
        """Calculate confidence based on cultural factors"""
        # Weighted cultural relevance
        weighted_cultural = sum(weights[modality] * cultural_relevance[modality] 
                              for modality in weights.keys())
        
        # Cultural coherence across modalities
        relevance_values = list(cultural_relevance.values())
        if len(relevance_values) > 1:
            cultural_variance = np.var(relevance_values)
            coherence_score = max(0, 1.0 - cultural_variance)  # Lower variance = higher coherence
        else:
            coherence_score = 1.0 if relevance_values else 0.0
        
        # Romanian authenticity boost
        romanian_authenticity = context.cultural_indicators.get('romanian_authenticity', 0)
        
        # Regional consistency boost
        regional_consistency = context.cultural_indicators.get('regional_authenticity', 0)
        
        # Combined confidence
        cultural_confidence = (
            weighted_cultural * 0.4 +
            coherence_score * 0.25 +
            romanian_authenticity * 0.2 +
            regional_consistency * 0.15
        )
        
        return min(1.0, cultural_confidence)

class SemanticAlignmentFusion(FusionAlgorithmBase):
    """Semantic alignment-based fusion for Romanian content"""
    
    def __init__(self):
        super().__init__(FusionAlgorithmType.SEMANTIC_ALIGNMENT)
        self.alignment_threshold = 0.5
        self.semantic_weight = 0.6
        self.cultural_semantic_boost = 0.3
    
    async def fuse_features(self, features: Dict[str, np.ndarray], 
                          context: FusionContext) -> FusionResult:
        """Fuse features based on semantic alignment"""
        await asyncio.sleep(0.012)
        
        # Calculate semantic alignment matrix
        alignment_matrix = self._calculate_semantic_alignment(features, context)
        
        # Generate alignment-based weights
        alignment_weights = self._generate_alignment_weights(alignment_matrix, context)
        
        # Apply cultural semantic boosting
        cultural_boost = self.calculate_cultural_boost(context)
        semantic_weights = self._apply_semantic_cultural_boost(alignment_weights, cultural_boost, context)
        
        # Perform semantically-aligned fusion
        fused_features = self._semantic_aligned_fusion(features, semantic_weights, alignment_matrix)
        
        # Calculate semantic confidence
        confidence = self._calculate_semantic_confidence(alignment_matrix, semantic_weights, context)
        
        return FusionResult(
            fused_features=fused_features,
            confidence_score=confidence,
            fusion_weights=semantic_weights,
            cultural_boost=cultural_boost,
            algorithm_metadata={
                'algorithm': self.name,
                'semantic_alignment_matrix': alignment_matrix.tolist() if isinstance(alignment_matrix, np.ndarray) else alignment_matrix,
                'alignment_threshold': self.alignment_threshold
            }
        )
    
    def _calculate_semantic_alignment(self, features: Dict[str, np.ndarray], 
                                    context: FusionContext) -> np.ndarray:
        """Calculate semantic alignment between modalities"""
        modalities = list(features.keys())
        n_modalities = len(modalities)
        
        if n_modalities < 2:
            return np.array([[1.0]])
        
        alignment_matrix = np.zeros((n_modalities, n_modalities))
        
        for i, mod1 in enumerate(modalities):
            for j, mod2 in enumerate(modalities):
                if i == j:
                    alignment_matrix[i, j] = 1.0
                else:
                    # Calculate semantic similarity between features
                    feat1 = features[mod1]
                    feat2 = features[mod2]
                    
                    # Cosine similarity
                    if feat1.size > 0 and feat2.size > 0:
                        # Flatten and normalize features
                        flat1 = feat1.flatten()
                        flat2 = feat2.flatten()
                        
                        # Make same length for comparison
                        min_len = min(len(flat1), len(flat2))
                        if min_len > 0:
                            flat1 = flat1[:min_len]
                            flat2 = flat2[:min_len]
                            
                            # Cosine similarity
                            norm1 = np.linalg.norm(flat1)
                            norm2 = np.linalg.norm(flat2)
                            
                            if norm1 > 0 and norm2 > 0:
                                similarity = np.dot(flat1, flat2) / (norm1 * norm2)
                                alignment_matrix[i, j] = max(0, similarity)
                            else:
                                alignment_matrix[i, j] = 0.0
                        else:
                            alignment_matrix[i, j] = 0.0
                    else:
                        alignment_matrix[i, j] = 0.0
        
        # Apply cultural semantic boost
        romanian_score = context.cultural_indicators.get('romanian_authenticity', 0)
        if romanian_score > 0.6:  # High Romanian content
            alignment_matrix *= (1.0 + self.cultural_semantic_boost * romanian_score)
            np.clip(alignment_matrix, 0, 1, out=alignment_matrix)
        
        return alignment_matrix
    
    def _generate_alignment_weights(self, alignment_matrix: np.ndarray, 
                                  context: FusionContext) -> Dict[str, float]:
        """Generate weights based on semantic alignment"""
        modalities = list(context.modality_confidences.keys())
        n_modalities = len(modalities)
        
        if n_modalities == 0:
            return {}
        
        weights = {}
        
        for i, modality in enumerate(modalities):
            # Base weight from modality confidence
            base_confidence = context.modality_confidences.get(modality, 0.5)
            
            # Alignment contribution - average alignment with other modalities
            if n_modalities > 1 and i < alignment_matrix.shape[0]:
                alignment_scores = alignment_matrix[i, :]
                avg_alignment = np.mean([alignment_scores[j] for j in range(n_modalities) if j != i])
            else:
                avg_alignment = 1.0  # Single modality case
            
            # Combined weight
            alignment_weight = (
                base_confidence * (1.0 - self.semantic_weight) +
                avg_alignment * self.semantic_weight
            )
            
            weights[modality] = alignment_weight
        
        # Normalize weights
        total_weight = sum(weights.values())
        if total_weight > 0:
            for modality in weights:
                weights[modality] /= total_weight
        
        return weights
    
    def _apply_semantic_cultural_boost(self, weights: Dict[str, float], 
                                     cultural_boost: float, 
                                     context: FusionContext) -> Dict[str, float]:
        """Apply cultural boosting to semantic weights"""
        boosted_weights = weights.copy()
        
        # Boost modalities with strong Romanian semantic content
        for modality, weight in weights.items():
            # Cultural semantic relevance
            cultural_relevance = context.cultural_indicators.get(f'{modality}_cultural_relevance', 0)
            romanian_authenticity = context.cultural_indicators.get('romanian_authenticity', 0)
            
            if cultural_relevance > 0.5 and romanian_authenticity > 0.5:
                semantic_boost = 1.0 + (cultural_boost * 0.4 * cultural_relevance)
                boosted_weights[modality] = weight * semantic_boost
        
        # Renormalize
        total_weight = sum(boosted_weights.values())
        if total_weight > 0:
            for modality in boosted_weights:
                boosted_weights[modality] /= total_weight
        
        return boosted_weights
    
    def _semantic_aligned_fusion(self, features: Dict[str, np.ndarray], 
                               weights: Dict[str, float], 
                               alignment_matrix: np.ndarray) -> np.ndarray:
        """Perform semantic alignment-based fusion"""
        if not features:
            return np.array([])
        
        modalities = list(features.keys())
        
        # Determine output dimension
        max_dim = 0
        for feature_vector in features.values():
            if len(feature_vector.shape) == 1:
                max_dim = max(max_dim, feature_vector.shape[0])
            else:
                max_dim = max(max_dim, feature_vector.shape[0])
        
        if max_dim == 0:
            return np.array([])
        
        fused = np.zeros(max_dim)
        
        for i, (modality, feature_vector) in enumerate(features.items()):
            weight = weights.get(modality, 0)
            
            # Get feature representation
            if len(feature_vector.shape) == 1:
                feature_repr = feature_vector
            else:
                feature_repr = feature_vector[0] if feature_vector.shape[0] > 0 else np.array([])
            
            # Pad to max dimension if necessary
            if len(feature_repr) < max_dim:
                feature_repr = np.pad(feature_repr, (0, max_dim - len(feature_repr)))
            elif len(feature_repr) > max_dim:
                feature_repr = feature_repr[:max_dim]
            
            # Apply alignment-based weighting
            if i < alignment_matrix.shape[0]:
                # Weight by average alignment with other modalities
                alignment_weights = alignment_matrix[i, :]
                avg_alignment = np.mean([alignment_weights[j] for j in range(len(modalities)) if j != i]) \
                              if len(modalities) > 1 else 1.0
                
                # Only include well-aligned features
                if avg_alignment >= self.alignment_threshold:
                    alignment_factor = avg_alignment
                else:
                    alignment_factor = avg_alignment * 0.5  # Reduce contribution of poorly aligned features
                
                fused += weight * alignment_factor * feature_repr
            else:
                fused += weight * feature_repr
        
        return fused
    
    def _calculate_semantic_confidence(self, alignment_matrix: np.ndarray, 
                                     weights: Dict[str, float], 
                                     context: FusionContext) -> float:
        """Calculate confidence based on semantic alignment"""
        if alignment_matrix.size == 0:
            return 0.5
        
        # Overall alignment quality
        if alignment_matrix.shape[0] > 1:
            # Average off-diagonal elements (alignment between different modalities)
            off_diag_mask = ~np.eye(alignment_matrix.shape[0], dtype=bool)
            avg_alignment = np.mean(alignment_matrix[off_diag_mask])
        else:
            avg_alignment = 1.0  # Single modality
        
        # Weighted modality confidence
        weighted_confidence = sum(weights[modality] * context.modality_confidences.get(modality, 0.5) 
                                for modality in weights.keys())
        
        # Cultural semantic coherence
        romanian_authenticity = context.cultural_indicators.get('romanian_authenticity', 0)
        cultural_coherence = context.cultural_indicators.get('cultural_coherence', 0)
        
        # Combined semantic confidence
        semantic_confidence = (
            avg_alignment * 0.4 +
            weighted_confidence * 0.3 +
            romanian_authenticity * 0.2 +
            cultural_coherence * 0.1
        )
        
        return min(1.0, semantic_confidence)

class MultimodalFusionManager:
    """Manager for multimodal fusion algorithms"""
    
    def __init__(self):
        self.algorithms = {
            FusionAlgorithmType.WEIGHTED_AVERAGE: WeightedAverageFusion(),
            FusionAlgorithmType.ATTENTION_BASED: AttentionBasedFusion(),
            FusionAlgorithmType.CULTURAL_WEIGHTED: CulturalWeightedFusion(),
            FusionAlgorithmType.SEMANTIC_ALIGNMENT: SemanticAlignmentFusion()
        }
        
        self.default_algorithm = FusionAlgorithmType.CULTURAL_WEIGHTED
    
    async def fuse_multimodal_features(self, features: Dict[str, np.ndarray], 
                                     context: FusionContext, 
                                     algorithm_type: Optional[FusionAlgorithmType] = None) -> FusionResult:
        """Fuse multimodal features using specified algorithm"""
        if algorithm_type is None:
            algorithm_type = self.default_algorithm
        
        if algorithm_type not in self.algorithms:
            raise ValueError(f"Unsupported fusion algorithm: {algorithm_type}")
        
        algorithm = self.algorithms[algorithm_type]
        return await algorithm.fuse_features(features, context)
    
    async def adaptive_fusion(self, features: Dict[str, np.ndarray], 
                            context: FusionContext) -> FusionResult:
        """Adaptively select and apply best fusion algorithm"""
        # Analyze input characteristics
        n_modalities = len(features)
        cultural_score = sum(context.cultural_indicators.values()) / len(context.cultural_indicators) \
                        if context.cultural_indicators else 0
        
        # Select algorithm based on characteristics
        if cultural_score > 0.7:
            # High cultural content - use cultural weighted fusion
            selected_algorithm = FusionAlgorithmType.CULTURAL_WEIGHTED
        elif n_modalities > 2:
            # Multiple modalities - use attention-based fusion
            selected_algorithm = FusionAlgorithmType.ATTENTION_BASED
        elif context.semantic_similarity > 0.6:
            # High semantic similarity - use semantic alignment
            selected_algorithm = FusionAlgorithmType.SEMANTIC_ALIGNMENT
        else:
            # Default case - use weighted average
            selected_algorithm = FusionAlgorithmType.WEIGHTED_AVERAGE
        
        logger.info(f"Adaptive fusion selected: {selected_algorithm.value}")
        return await self.fuse_multimodal_features(features, context, selected_algorithm)
    
    def get_algorithm_recommendations(self, features: Dict[str, np.ndarray], 
                                    context: FusionContext) -> Dict[str, float]:
        """Get recommendations for fusion algorithms"""
        recommendations = {}
        
        n_modalities = len(features)
        cultural_score = sum(context.cultural_indicators.values()) / len(context.cultural_indicators) \
                        if context.cultural_indicators else 0
        
        # Weighted Average - good baseline
        recommendations[FusionAlgorithmType.WEIGHTED_AVERAGE.value] = 0.6
        
        # Attention Based - better for multiple modalities
        if n_modalities > 2:
            recommendations[FusionAlgorithmType.ATTENTION_BASED.value] = 0.8
        else:
            recommendations[FusionAlgorithmType.ATTENTION_BASED.value] = 0.4
        
        # Cultural Weighted - best for Romanian content
        recommendations[FusionAlgorithmType.CULTURAL_WEIGHTED.value] = 0.5 + cultural_score * 0.4
        
        # Semantic Alignment - good for semantically coherent content
        semantic_score = context.semantic_similarity
        recommendations[FusionAlgorithmType.SEMANTIC_ALIGNMENT.value] = 0.4 + semantic_score * 0.5
        
        return recommendations

# Test function
async def test_fusion_algorithms():
    """Test fusion algorithms"""
    print("🔗 Testing Romanian Multimodal Fusion Algorithms...")
    
    # Create test features
    features = {
        'audio': np.random.rand(64).astype(np.float32),
        'visual': np.random.rand(64).astype(np.float32),
        'text': np.random.rand(64).astype(np.float32)
    }
    
    # Create test context
    context = FusionContext(
        modality_confidences={'audio': 0.8, 'visual': 0.7, 'text': 0.9},
        cultural_indicators={
            'romanian_authenticity': 0.85,
            'traditional_elements': 0.6,
            'regional_authenticity': 0.7,
            'audio_cultural_relevance': 0.8,
            'visual_cultural_relevance': 0.7,
            'text_cultural_relevance': 0.9
        },
        temporal_alignment=0.75,
        semantic_similarity=0.6,
        regional_context='bucuresti'
    )
    
    # Initialize fusion manager
    fusion_manager = MultimodalFusionManager()
    
    # Test different algorithms
    algorithms_to_test = [
        FusionAlgorithmType.WEIGHTED_AVERAGE,
        FusionAlgorithmType.ATTENTION_BASED,
        FusionAlgorithmType.CULTURAL_WEIGHTED,
        FusionAlgorithmType.SEMANTIC_ALIGNMENT
    ]
    
    print(f"   Testing {len(algorithms_to_test)} fusion algorithms...")
    
    for algorithm in algorithms_to_test:
        result = await fusion_manager.fuse_multimodal_features(features, context, algorithm)
        
        print(f"   {algorithm.value}:")
        print(f"      Confidence: {result.confidence_score:.3f}")
        print(f"      Cultural boost: {result.cultural_boost:.3f}")
        print(f"      Feature dimension: {result.fused_features.shape[0]}")
        print(f"      Fusion weights: {', '.join(f'{k}:{v:.2f}' for k, v in result.fusion_weights.items())}")
    
    # Test adaptive fusion
    print(f"\n   Testing adaptive fusion...")
    adaptive_result = await fusion_manager.adaptive_fusion(features, context)
    print(f"      Selected algorithm: {adaptive_result.algorithm_metadata.get('algorithm', 'unknown')}")
    print(f"      Adaptive confidence: {adaptive_result.confidence_score:.3f}")
    
    # Test recommendations
    print(f"\n   Testing algorithm recommendations...")
    recommendations = fusion_manager.get_algorithm_recommendations(features, context)
    for algorithm, score in recommendations.items():
        print(f"      {algorithm}: {score:.3f}")
    
    print("\n✅ Fusion algorithms test completed!")

if __name__ == "__main__":
    asyncio.run(test_fusion_algorithms())

#!/usr/bin/env python3
"""
RomAI Multi-Modal Integrator Core
Advanced multi-modal integration with Romanian cultural consciousness

This module provides comprehensive multi-modal integration including:
- Cross-modal attention and alignment mechanisms
- Unified multi-modal representation learning
- Cultural context propagation across modalities
- Romanian-aware multi-modal reasoning
- Real-time multi-modal fusion and synthesis
"""

import logging
import asyncio
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import json
import sqlite3
from collections import defaultdict
import uuid
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import cv2
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModalityInput:
    """Input data for a single modality"""
    modality_type: str  # text, image, audio, video, sensor
    data: Any
    confidence: float = 0.0
    cultural_context: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[np.ndarray] = None
    timestamp: datetime = field(default_factory=datetime.now)
    processing_metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class MultiModalState:
    """Current multi-modal integration state"""
    state_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    active_modalities: List[str] = field(default_factory=list)
    unified_embedding: Optional[np.ndarray] = None
    attention_weights: Dict[str, float] = field(default_factory=dict)
    cultural_coherence: float = 0.0
    integration_confidence: float = 0.0
    romanian_insights: List[str] = field(default_factory=list)
    temporal_context: List[datetime] = field(default_factory=list)

@dataclass
class IntegratedOutput:
    """Integrated multi-modal output"""
    output_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    unified_representation: np.ndarray = None
    modality_contributions: Dict[str, float] = field(default_factory=dict)
    cross_modal_insights: List[str] = field(default_factory=list)
    cultural_synthesis: Dict[str, Any] = field(default_factory=dict)
    confidence_score: float = 0.0
    processing_time: float = 0.0
    romanian_cultural_elements: List[str] = field(default_factory=list)

class CrossModalAttention(nn.Module):
    """Cross-modal attention mechanism for multi-modal fusion"""
    
    def __init__(self, d_model: int = 512, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        
        # Multi-head attention for cross-modal alignment
        self.multihead_attn = nn.MultiheadAttention(
            embed_dim=d_model,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True
        )
        
        # Modality-specific projections
        self.text_projection = nn.Linear(384, d_model)  # SentenceTransformer output
        self.image_projection = nn.Linear(512, d_model)  # CLIP output
        self.audio_projection = nn.Linear(128, d_model)  # Audio feature size
        
        # Cultural context encoder
        self.cultural_encoder = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.ReLU(),
            nn.Linear(d_model // 2, d_model // 4),
            nn.ReLU(),
            nn.Linear(d_model // 4, 1),
            nn.Sigmoid()
        )
        
        # Output projection
        self.output_projection = nn.Linear(d_model, d_model)
        
        logger.info(f"✅ Cross-modal attention initialized (d_model: {d_model}, heads: {num_heads})")
    
    def forward(self, modality_features: Dict[str, torch.Tensor]) -> Tuple[torch.Tensor, Dict[str, float]]:
        """Apply cross-modal attention to integrate modalities"""
        # Project each modality to common space
        projected_features = {}
        
        if 'text' in modality_features:
            projected_features['text'] = self.text_projection(modality_features['text'])
        if 'image' in modality_features:
            projected_features['image'] = self.image_projection(modality_features['image'])
        if 'audio' in modality_features:
            projected_features['audio'] = self.audio_projection(modality_features['audio'])
        
        if not projected_features:
            return torch.zeros(1, self.d_model), {}
        
        # Stack features for attention
        features_list = list(projected_features.values())
        modality_names = list(projected_features.keys())
        
        stacked_features = torch.stack(features_list, dim=1)  # [batch, num_modalities, d_model]
        
        # Apply multi-head attention (self-attention across modalities)
        attended_features, attention_weights = self.multihead_attn(
            stacked_features, stacked_features, stacked_features
        )
        
        # Calculate cultural relevance scores
        cultural_scores = {}
        for i, modality in enumerate(modality_names):
            cultural_score = self.cultural_encoder(attended_features[:, i, :])
            cultural_scores[modality] = cultural_score.item()
        
        # Weighted fusion based on attention and cultural relevance
        fusion_weights = torch.softmax(
            torch.tensor([cultural_scores.get(mod, 0.5) for mod in modality_names]), 
            dim=0
        )
        
        integrated_features = torch.sum(
            attended_features * fusion_weights.unsqueeze(0).unsqueeze(-1), 
            dim=1
        )
        
        # Final projection
        output = self.output_projection(integrated_features)
        
        # Convert attention weights to dictionary
        attention_dict = {
            modality: fusion_weights[i].item() 
            for i, modality in enumerate(modality_names)
        }
        
        return output, attention_dict

class TemporalIntegrator:
    """Temporal integration for multi-modal sequences"""
    
    def __init__(self, window_size: int = 10):
        self.window_size = window_size
        self.temporal_buffer = deque(maxlen=window_size)
        self.cultural_continuity_tracker = {}
        
        logger.info(f"✅ Temporal integrator initialized (window: {window_size})")
    
    def add_temporal_state(self, state: MultiModalState):
        """Add new temporal state to buffer"""
        self.temporal_buffer.append(state)
        
        # Update cultural continuity
        for insight in state.romanian_insights:
            if insight not in self.cultural_continuity_tracker:
                self.cultural_continuity_tracker[insight] = 0
            self.cultural_continuity_tracker[insight] += 1
    
    def get_temporal_context(self) -> Dict[str, Any]:
        """Get temporal context from buffered states"""
        if not self.temporal_buffer:
            return {"temporal_depth": 0, "cultural_continuity": {}}
        
        # Analyze temporal patterns
        modality_trends = defaultdict(list)
        cultural_evolution = []
        
        for state in self.temporal_buffer:
            for modality in state.active_modalities:
                confidence = state.attention_weights.get(modality, 0.0)
                modality_trends[modality].append(confidence)
            cultural_evolution.append(state.cultural_coherence)
        
        # Calculate trends
        trends = {}
        for modality, values in modality_trends.items():
            if len(values) > 1:
                trend = (values[-1] - values[0]) / len(values)
                trends[modality] = trend
        
        # Cultural continuity analysis
        persistent_elements = {
            element: count for element, count in self.cultural_continuity_tracker.items()
            if count >= len(self.temporal_buffer) * 0.3  # Present in at least 30% of states
        }
        
        return {
            "temporal_depth": len(self.temporal_buffer),
            "modality_trends": trends,
            "cultural_evolution": cultural_evolution,
            "cultural_continuity": persistent_elements,
            "average_coherence": np.mean(cultural_evolution) if cultural_evolution else 0.0
        }
    
    def predict_next_state(self) -> Dict[str, Any]:
        """Predict characteristics of next multi-modal state"""
        if len(self.temporal_buffer) < 2:
            return {"prediction_confidence": 0.0}
        
        temporal_context = self.get_temporal_context()
        
        # Simple prediction based on trends
        predictions = {}
        for modality, trend in temporal_context.get("modality_trends", {}).items():
            current_attention = self.temporal_buffer[-1].attention_weights.get(modality, 0.0)
            predicted_attention = max(0.0, min(1.0, current_attention + trend))
            predictions[f"predicted_{modality}_attention"] = predicted_attention
        
        # Predict cultural coherence
        cultural_evolution = temporal_context.get("cultural_evolution", [])
        if len(cultural_evolution) >= 2:
            cultural_trend = cultural_evolution[-1] - cultural_evolution[-2]
            current_coherence = cultural_evolution[-1]
            predicted_coherence = max(0.0, min(1.0, current_coherence + cultural_trend))
            predictions["predicted_cultural_coherence"] = predicted_coherence
        
        prediction_confidence = min(1.0, len(self.temporal_buffer) / self.window_size)
        
        return {
            "predictions": predictions,
            "prediction_confidence": prediction_confidence,
            "based_on_states": len(self.temporal_buffer)
        }

class CulturalCoherenceAnalyzer:
    """Analyze and maintain cultural coherence across modalities"""
    
    def __init__(self):
        self.romanian_cultural_markers = {
            "visual": ["tricolor", "monastery", "carpathians", "folk_costume", "hora"],
            "auditory": ["doina", "colinde", "romanian_accent", "folk_music"],
            "textual": ["dor", "mioară", "dragoste", "familie", "tradițional"],
            "conceptual": ["ospitalitate", "respectul_bătrânilor", "munca_cinstită"]
        }
        
        self.cultural_weights = {
            "consistency": 0.4,  # How consistent cultural elements are across modalities
            "authenticity": 0.3,  # How authentic Romanian elements are
            "richness": 0.2,     # How many cultural elements are present
            "continuity": 0.1    # How well cultural elements persist over time
        }
        
        logger.info("✅ Cultural coherence analyzer initialized")
    
    def analyze_coherence(self, modality_inputs: List[ModalityInput], 
                         temporal_context: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze cultural coherence across modalities"""
        coherence_analysis = {
            "overall_score": 0.0,
            "modality_scores": {},
            "cultural_elements": set(),
            "inconsistencies": [],
            "strengths": [],
            "romanian_authenticity": 0.0
        }
        
        # Analyze each modality for cultural elements
        modality_cultural_elements = {}
        
        for modality_input in modality_inputs:
            elements = self._extract_cultural_elements(modality_input)
            modality_cultural_elements[modality_input.modality_type] = elements
            coherence_analysis["cultural_elements"].update(elements)
        
        # Calculate consistency score
        consistency_score = self._calculate_consistency(modality_cultural_elements)
        
        # Calculate authenticity score
        authenticity_score = self._calculate_authenticity(coherence_analysis["cultural_elements"])
        
        # Calculate richness score
        richness_score = min(1.0, len(coherence_analysis["cultural_elements"]) / 10.0)
        
        # Calculate continuity score (if temporal context available)
        continuity_score = 0.0
        if temporal_context and temporal_context.get("cultural_continuity"):
            continuity_elements = set(temporal_context["cultural_continuity"].keys())
            current_elements = coherence_analysis["cultural_elements"]
            if current_elements:
                continuity_score = len(continuity_elements.intersection(current_elements)) / len(current_elements)
        
        # Weighted overall score
        coherence_analysis["overall_score"] = (
            consistency_score * self.cultural_weights["consistency"] +
            authenticity_score * self.cultural_weights["authenticity"] +
            richness_score * self.cultural_weights["richness"] +
            continuity_score * self.cultural_weights["continuity"]
        )
        
        coherence_analysis["modality_scores"] = {
            "consistency": consistency_score,
            "authenticity": authenticity_score,
            "richness": richness_score,
            "continuity": continuity_score
        }
        
        coherence_analysis["romanian_authenticity"] = authenticity_score
        
        # Identify strengths and inconsistencies
        if consistency_score > 0.7:
            coherence_analysis["strengths"].append("Strong cross-modal cultural consistency")
        
        if authenticity_score > 0.8:
            coherence_analysis["strengths"].append("High Romanian cultural authenticity")
        
        if consistency_score < 0.4:
            coherence_analysis["inconsistencies"].append("Cultural elements inconsistent across modalities")
        
        return coherence_analysis
    
    def _extract_cultural_elements(self, modality_input: ModalityInput) -> Set[str]:
        """Extract cultural elements from modality input"""
        elements = set()
        
        modality_type = modality_input.modality_type
        cultural_markers = self.romanian_cultural_markers.get(modality_type, [])
        
        # Extract from data based on modality type
        if modality_type == "text" and isinstance(modality_input.data, str):
            text_lower = modality_input.data.lower()
            for marker in cultural_markers:
                if marker.lower() in text_lower:
                    elements.add(marker)
        
        # Extract from cultural context
        for key, value in modality_input.cultural_context.items():
            if isinstance(value, str) and any(marker in value.lower() for marker in cultural_markers):
                for marker in cultural_markers:
                    if marker.lower() in value.lower():
                        elements.add(marker)
        
        return elements
    
    def _calculate_consistency(self, modality_cultural_elements: Dict[str, Set[str]]) -> float:
        """Calculate consistency of cultural elements across modalities"""
        if len(modality_cultural_elements) < 2:
            return 1.0  # Perfect consistency if only one modality
        
        all_elements = set()
        for elements in modality_cultural_elements.values():
            all_elements.update(elements)
        
        if not all_elements:
            return 0.0
        
        # Calculate how many elements appear in multiple modalities
        element_counts = defaultdict(int)
        for elements in modality_cultural_elements.values():
            for element in elements:
                element_counts[element] += 1
        
        consistent_elements = sum(1 for count in element_counts.values() if count > 1)
        consistency_score = consistent_elements / len(all_elements) if all_elements else 0.0
        
        return consistency_score
    
    def _calculate_authenticity(self, cultural_elements: Set[str]) -> float:
        """Calculate Romanian cultural authenticity"""
        if not cultural_elements:
            return 0.0
        
        # Weight elements by their Romanian specificity
        authenticity_weights = {
            "dor": 1.0,  # Uniquely Romanian
            "mioară": 1.0,  # Uniquely Romanian
            "hora": 0.9,  # Strongly Romanian
            "doina": 0.9,  # Strongly Romanian
            "tricolor": 0.8,  # Romanian but not unique
            "monastery": 0.6,  # Orthodox, broader cultural
            "folk_costume": 0.7,  # Traditional but not unique
        }
        
        total_authenticity = 0.0
        for element in cultural_elements:
            weight = authenticity_weights.get(element, 0.5)  # Default weight
            total_authenticity += weight
        
        return min(1.0, total_authenticity / len(cultural_elements))

class MultiModalIntegrator:
    """Main multi-modal integration system with Romanian cultural consciousness"""
    
    def __init__(self, database_path: str = "multimodal_integration_storage.db"):
        self.database_path = database_path
        self.cross_modal_attention = CrossModalAttention()
        self.temporal_integrator = TemporalIntegrator()
        self.cultural_analyzer = CulturalCoherenceAnalyzer()
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Current state
        self.current_state = MultiModalState()
        
        # Performance tracking
        self.integration_sessions = 0
        self.total_processing_time = 0.0
        self.cultural_coherence_scores = []
        self.modality_usage_stats = defaultdict(int)
        
        # Initialize storage
        self._initialize_storage()
        
        logger.info("🎭 Multi-Modal Integrator initialized with Romanian cultural consciousness")
    
    def _initialize_storage(self):
        """Initialize SQLite storage for integration results"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS integration_sessions (
                id TEXT PRIMARY KEY,
                modalities TEXT,
                cultural_coherence REAL,
                integration_confidence REAL,
                processing_time REAL,
                cultural_elements TEXT,
                insights TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS temporal_states (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                state_data TEXT,
                cultural_coherence REAL,
                attention_weights TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES integration_sessions (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cultural_analysis (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                analysis_data TEXT,
                authenticity_score REAL,
                consistency_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES integration_sessions (id)
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("✅ Multi-modal integration storage initialized")
    
    async def integrate_modalities(self, modality_inputs: List[ModalityInput]) -> IntegratedOutput:
        """Integrate multiple modalities with cultural consciousness"""
        start_time = datetime.now()
        session_id = str(uuid.uuid4())
        
        logger.info(f"🎭 Starting multi-modal integration: {session_id}")
        logger.info(f"📊 Modalities: {[m.modality_type for m in modality_inputs]}")
        
        # Prepare modality features for neural processing
        modality_features = await self._prepare_modality_features(modality_inputs)
        
        # Apply cross-modal attention
        integrated_features, attention_weights = self.cross_modal_attention(modality_features)
        
        # Analyze cultural coherence
        temporal_context = self.temporal_integrator.get_temporal_context()
        cultural_analysis = self.cultural_analyzer.analyze_coherence(
            modality_inputs, temporal_context
        )
        
        # Update current state
        self.current_state.state_id = session_id
        self.current_state.active_modalities = [m.modality_type for m in modality_inputs]
        self.current_state.unified_embedding = integrated_features.detach().numpy()[0]
        self.current_state.attention_weights = attention_weights
        self.current_state.cultural_coherence = cultural_analysis["overall_score"]
        self.current_state.integration_confidence = self._calculate_integration_confidence(
            modality_inputs, attention_weights, cultural_analysis
        )
        self.current_state.romanian_insights = self._generate_romanian_insights(
            modality_inputs, cultural_analysis
        )
        
        # Add to temporal buffer
        self.temporal_integrator.add_temporal_state(self.current_state)
        
        # Generate cross-modal insights
        cross_modal_insights = await self._generate_cross_modal_insights(
            modality_inputs, attention_weights, cultural_analysis
        )
        
        # Cultural synthesis
        cultural_synthesis = await self._synthesize_cultural_context(
            modality_inputs, cultural_analysis, temporal_context
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Create integrated output
        output = IntegratedOutput(
            output_id=session_id,
            unified_representation=self.current_state.unified_embedding,
            modality_contributions=attention_weights,
            cross_modal_insights=cross_modal_insights,
            cultural_synthesis=cultural_synthesis,
            confidence_score=self.current_state.integration_confidence,
            processing_time=processing_time,
            romanian_cultural_elements=list(cultural_analysis["cultural_elements"])
        )
        
        # Store results
        await self._store_integration_session(output, modality_inputs, cultural_analysis)
        
        # Update performance metrics
        self.integration_sessions += 1
        self.total_processing_time += processing_time
        self.cultural_coherence_scores.append(cultural_analysis["overall_score"])
        
        for modality_input in modality_inputs:
            self.modality_usage_stats[modality_input.modality_type] += 1
        
        logger.info(f"✅ Multi-modal integration completed in {processing_time:.2f}s")
        logger.info(f"🇷🇴 Cultural coherence: {cultural_analysis['overall_score']:.2f}")
        logger.info(f"🎯 Integration confidence: {output.confidence_score:.2f}")
        
        return output
    
    async def _prepare_modality_features(self, modality_inputs: List[ModalityInput]) -> Dict[str, torch.Tensor]:
        """Prepare modality features for neural processing"""
        features = {}
        
        for modality_input in modality_inputs:
            modality_type = modality_input.modality_type
            
            if modality_type == "text":
                # Generate text embedding if not provided
                if modality_input.embedding is None:
                    text_embedding = self.embedding_model.encode([str(modality_input.data)])[0]
                else:
                    text_embedding = modality_input.embedding
                
                features["text"] = torch.tensor(text_embedding).unsqueeze(0).float()
                
            elif modality_type == "image":
                # For image, create a simple feature vector (in real system would use CNN)
                if modality_input.embedding is not None:
                    image_features = modality_input.embedding
                else:
                    # Generate simple features from image data
                    image_features = self._extract_simple_image_features(modality_input.data)
                
                # Ensure correct size (512 for image projection)
                if len(image_features) != 512:
                    image_features = np.resize(image_features, 512)
                
                features["image"] = torch.tensor(image_features).unsqueeze(0).float()
                
            elif modality_type == "audio":
                # For audio, create feature vector from metadata or embeddings
                if modality_input.embedding is not None:
                    audio_features = modality_input.embedding
                else:
                    audio_features = self._extract_simple_audio_features(modality_input.processing_metadata)
                
                # Ensure correct size (128 for audio projection)
                if len(audio_features) != 128:
                    audio_features = np.resize(audio_features, 128)
                
                features["audio"] = torch.tensor(audio_features).unsqueeze(0).float()
        
        return features
    
    def _extract_simple_image_features(self, image_data: Any) -> np.ndarray:
        """Extract simple features from image data"""
        try:
            if isinstance(image_data, str):
                # Handle file path or base64
                if image_data.startswith('data:'):
                    # Base64 image
                    return np.random.random(512)  # Placeholder for demo
                else:
                    # File path
                    img = Image.open(image_data)
                    return np.random.random(512)  # Placeholder for demo
            
            elif isinstance(image_data, np.ndarray):
                # Image array - extract basic statistics
                features = []
                features.extend([np.mean(image_data), np.std(image_data), np.min(image_data), np.max(image_data)])
                
                # Color distribution if RGB
                if len(image_data.shape) == 3 and image_data.shape[2] == 3:
                    for channel in range(3):
                        features.extend([
                            np.mean(image_data[:,:,channel]),
                            np.std(image_data[:,:,channel])
                        ])
                
                # Pad to desired size
                while len(features) < 512:
                    features.append(0.0)
                
                return np.array(features[:512])
            
            elif isinstance(image_data, Image.Image):
                # PIL Image
                img_array = np.array(image_data)
                return self._extract_simple_image_features(img_array)
                
        except Exception as e:
            logger.warning(f"Image feature extraction failed: {e}")
            
        return np.random.random(512)  # Fallback
    
    def _extract_simple_audio_features(self, audio_metadata: Dict[str, Any]) -> np.ndarray:
        """Extract simple features from audio metadata"""
        features = []
        
        # Extract numeric features from metadata
        for key, value in audio_metadata.items():
            if isinstance(value, (int, float)):
                features.append(float(value))
            elif isinstance(value, list) and value and isinstance(value[0], (int, float)):
                features.extend([float(v) for v in value[:10]])  # Take first 10 if list
        
        # Pad or truncate to desired size
        while len(features) < 128:
            features.append(0.0)
        
        return np.array(features[:128])
    
    def _calculate_integration_confidence(self, 
                                        modality_inputs: List[ModalityInput],
                                        attention_weights: Dict[str, float],
                                        cultural_analysis: Dict[str, Any]) -> float:
        """Calculate confidence in integration results"""
        # Base confidence from number of modalities
        modality_count = len(modality_inputs)
        base_confidence = min(0.8, 0.3 + modality_count * 0.15)
        
        # Attention distribution bonus (more balanced is better)
        attention_values = list(attention_weights.values())
        if attention_values:
            attention_entropy = -sum(p * np.log(p + 1e-8) for p in attention_values)
            max_entropy = np.log(len(attention_values))
            attention_bonus = 0.1 * (attention_entropy / max_entropy) if max_entropy > 0 else 0.0
        else:
            attention_bonus = 0.0
        
        # Cultural coherence bonus
        cultural_bonus = 0.1 * cultural_analysis["overall_score"]
        
        # Individual modality confidence
        modality_confidence_avg = np.mean([m.confidence for m in modality_inputs])
        modality_bonus = 0.1 * modality_confidence_avg
        
        total_confidence = min(1.0, base_confidence + attention_bonus + cultural_bonus + modality_bonus)
        return total_confidence
    
    def _generate_romanian_insights(self, 
                                   modality_inputs: List[ModalityInput],
                                   cultural_analysis: Dict[str, Any]) -> List[str]:
        """Generate Romanian cultural insights from integration"""
        insights = []
        
        # Insights based on cultural elements
        cultural_elements = cultural_analysis.get("cultural_elements", set())
        if cultural_elements:
            insights.append(f"Romanian cultural elements detected: {', '.join(list(cultural_elements)[:3])}")
        
        # Insights based on modality combinations
        modality_types = [m.modality_type for m in modality_inputs]
        if "text" in modality_types and "image" in modality_types:
            insights.append("Text-image integration enables rich Romanian cultural storytelling")
        
        if "audio" in modality_types:
            insights.append("Audio modality adds emotional depth to Romanian cultural expression")
        
        # Authenticity insights
        authenticity = cultural_analysis.get("romanian_authenticity", 0.0)
        if authenticity > 0.8:
            insights.append("High authenticity Romanian cultural content detected across modalities")
        elif authenticity > 0.5:
            insights.append("Moderate Romanian cultural authenticity with room for enhancement")
        
        # Consistency insights
        consistency = cultural_analysis.get("modality_scores", {}).get("consistency", 0.0)
        if consistency > 0.7:
            insights.append("Strong cultural consistency across all modalities")
        elif consistency < 0.4:
            insights.append("Cultural elements vary significantly between modalities")
        
        return insights
    
    async def _generate_cross_modal_insights(self,
                                           modality_inputs: List[ModalityInput],
                                           attention_weights: Dict[str, float],
                                           cultural_analysis: Dict[str, Any]) -> List[str]:
        """Generate insights from cross-modal analysis"""
        insights = []
        
        # Attention-based insights
        if attention_weights:
            dominant_modality = max(attention_weights, key=attention_weights.get)
            insights.append(f"Primary information channel: {dominant_modality} ({attention_weights[dominant_modality]:.2f} attention)")
        
        # Cultural coherence insights
        coherence_score = cultural_analysis["overall_score"]
        if coherence_score > 0.8:
            insights.append("Excellent cross-modal cultural coherence achieved")
        elif coherence_score > 0.6:
            insights.append("Good cultural alignment between modalities")
        else:
            insights.append("Cultural elements show some inconsistency across modalities")
        
        # Modality synergy insights
        modality_types = set(m.modality_type for m in modality_inputs)
        if len(modality_types) >= 3:
            insights.append("Rich multi-modal synergy enables comprehensive understanding")
        elif len(modality_types) == 2:
            insights.append("Bi-modal integration provides complementary perspectives")
        
        # Romanian-specific cross-modal insights
        if any("dor" in str(m.data).lower() for m in modality_inputs if isinstance(m.data, str)):
            insights.append("'Dor' concept bridges emotional expression across modalities")
        
        return insights
    
    async def _synthesize_cultural_context(self,
                                         modality_inputs: List[ModalityInput],
                                         cultural_analysis: Dict[str, Any],
                                         temporal_context: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize Romanian cultural context across modalities"""
        synthesis = {
            "primary_cultural_theme": None,
            "cultural_narrative": "",
            "temporal_cultural_evolution": {},
            "modality_cultural_contributions": {},
            "overall_romanian_authenticity": cultural_analysis.get("romanian_authenticity", 0.0)
        }
        
        # Identify primary cultural theme
        cultural_elements = list(cultural_analysis.get("cultural_elements", set()))
        if cultural_elements:
            # Determine most significant theme
            theme_mapping = {
                "dor": "Romanian Emotional Depth",
                "familia": "Family Values", 
                "tradițional": "Traditional Heritage",
                "hora": "Community Unity",
                "monastery": "Orthodox Spirituality"
            }
            
            for element in cultural_elements:
                if element.lower() in theme_mapping:
                    synthesis["primary_cultural_theme"] = theme_mapping[element.lower()]
                    break
            
            if not synthesis["primary_cultural_theme"] and cultural_elements:
                synthesis["primary_cultural_theme"] = f"Romanian Cultural Expression ({cultural_elements[0]})"
        
        # Create cultural narrative
        modality_types = [m.modality_type for m in modality_inputs]
        narrative_parts = []
        
        if synthesis["primary_cultural_theme"]:
            narrative_parts.append(f"Central theme: {synthesis['primary_cultural_theme']}")
        
        if len(modality_types) > 1:
            narrative_parts.append(f"Expressed through {len(modality_types)} modalities: {', '.join(modality_types)}")
        
        if cultural_analysis["overall_score"] > 0.7:
            narrative_parts.append("Strong cultural coherence across all channels")
        
        synthesis["cultural_narrative"] = ". ".join(narrative_parts)
        
        # Temporal evolution
        if temporal_context.get("cultural_continuity"):
            synthesis["temporal_cultural_evolution"] = {
                "persistent_elements": len(temporal_context["cultural_continuity"]),
                "cultural_stability": temporal_context.get("average_coherence", 0.0)
            }
        
        # Modality contributions
        for modality_input in modality_inputs:
            cultural_contrib = len([e for e in cultural_elements 
                                  if e.lower() in str(modality_input.data).lower() or 
                                     e.lower() in str(modality_input.cultural_context).lower()])
            synthesis["modality_cultural_contributions"][modality_input.modality_type] = cultural_contrib
        
        return synthesis
    
    async def _store_integration_session(self, 
                                       output: IntegratedOutput,
                                       modality_inputs: List[ModalityInput],
                                       cultural_analysis: Dict[str, Any]):
        """Store integration session results in database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Store main session
        cursor.execute("""
            INSERT INTO integration_sessions
            (id, modalities, cultural_coherence, integration_confidence, processing_time, cultural_elements, insights)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            output.output_id,
            json.dumps([m.modality_type for m in modality_inputs]),
            cultural_analysis["overall_score"],
            output.confidence_score,
            output.processing_time,
            json.dumps(list(cultural_analysis.get("cultural_elements", set()))),
            json.dumps(output.cross_modal_insights)
        ))
        
        # Store temporal state
        cursor.execute("""
            INSERT INTO temporal_states
            (id, session_id, state_data, cultural_coherence, attention_weights)
            VALUES (?, ?, ?, ?, ?)
        """, (
            f"{output.output_id}_state",
            output.output_id,
            json.dumps({
                "active_modalities": self.current_state.active_modalities,
                "romanian_insights": self.current_state.romanian_insights
            }),
            self.current_state.cultural_coherence,
            json.dumps(self.current_state.attention_weights)
        ))
        
        # Store cultural analysis
        cursor.execute("""
            INSERT INTO cultural_analysis
            (id, session_id, analysis_data, authenticity_score, consistency_score)
            VALUES (?, ?, ?, ?, ?)
        """, (
            f"{output.output_id}_cultural",
            output.output_id,
            json.dumps(cultural_analysis),
            cultural_analysis.get("romanian_authenticity", 0.0),
            cultural_analysis.get("modality_scores", {}).get("consistency", 0.0)
        ))
        
        conn.commit()
        conn.close()
    
    async def get_integration_insights(self) -> Dict[str, Any]:
        """Get comprehensive integration system insights"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Basic statistics
        cursor.execute("SELECT COUNT(*) FROM integration_sessions")
        total_sessions = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(cultural_coherence) FROM integration_sessions")
        avg_cultural_coherence = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT AVG(integration_confidence) FROM integration_sessions")
        avg_confidence = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT AVG(processing_time) FROM integration_sessions")
        avg_processing_time = cursor.fetchone()[0] or 0.0
        
        # Cultural analysis statistics
        cursor.execute("SELECT AVG(authenticity_score) FROM cultural_analysis")
        avg_authenticity = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT AVG(consistency_score) FROM cultural_analysis")
        avg_consistency = cursor.fetchone()[0] or 0.0
        
        conn.close()
        
        # Temporal context
        temporal_context = self.temporal_integrator.get_temporal_context()
        
        insights = {
            "total_integration_sessions": total_sessions,
            "average_cultural_coherence": avg_cultural_coherence,
            "average_integration_confidence": avg_confidence,
            "average_processing_time": avg_processing_time,
            "average_romanian_authenticity": avg_authenticity,
            "average_consistency": avg_consistency,
            "modality_usage_stats": dict(self.modality_usage_stats),
            "temporal_insights": temporal_context,
            "current_state": {
                "active_modalities": self.current_state.active_modalities,
                "cultural_coherence": self.current_state.cultural_coherence,
                "integration_confidence": self.current_state.integration_confidence
            }
        }
        
        return insights
    
    async def demonstrate_multimodal_integration(self):
        """Demonstrate multi-modal integration capabilities"""
        logger.info("🎭 MULTI-MODAL INTEGRATION DEMONSTRATION")
        logger.info("=" * 60)
        
        # Test 1: Text + Image integration with Romanian cultural content
        logger.info("🎨 Test 1: Text-Image integration (Romanian cultural content)")
        
        text_input = ModalityInput(
            modality_type="text",
            data="Dorul de casă se simte în fiecare imagine cu Carpații. Frumusețea tradițiilor românești.",
            confidence=0.9,
            cultural_context={"region": "Romania", "theme": "nostalgia"}
        )
        
        # Create simple test image
        test_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        image_input = ModalityInput(
            modality_type="image", 
            data=test_image,
            confidence=0.8,
            cultural_context={"context": "landscape", "cultural_markers": ["carpathians"]}
        )
        
        result1 = await self.integrate_modalities([text_input, image_input])
        logger.info(f"   Cultural coherence: {result1.cultural_synthesis['overall_romanian_authenticity']:.2f}")
        logger.info(f"   Integration confidence: {result1.confidence_score:.2f}")
        logger.info(f"   Romanian elements: {len(result1.romanian_cultural_elements)}")
        
        # Test 2: Multi-modal integration (Text + Image + Audio)
        logger.info("\n🎵 Test 2: Tri-modal integration (Text + Image + Audio)")
        
        audio_input = ModalityInput(
            modality_type="audio",
            data="romanian_folk_song.wav",
            confidence=0.7,
            processing_metadata={
                "tempo": 120,
                "key": "minor",
                "cultural_style": "doina",
                "emotional_intensity": 0.8
            },
            cultural_context={"style": "doina", "emotional_content": "melancholic"}
        )
        
        result2 = await self.integrate_modalities([text_input, image_input, audio_input])
        logger.info(f"   Modality contributions: {result2.modality_contributions}")
        logger.info(f"   Cross-modal insights: {len(result2.cross_modal_insights)}")
        logger.info(f"   Cultural narrative: {result2.cultural_synthesis.get('cultural_narrative', 'N/A')}")
        
        # Test 3: Temporal integration sequence
        logger.info("\n⏰ Test 3: Temporal integration sequence")
        
        # Create sequence of temporal states
        for i in range(3):
            temporal_text = ModalityInput(
                modality_type="text",
                data=f"Secvența {i+1}: Tradiții românești în timpul - {['trecut', 'prezent', 'viitor'][i]}",
                confidence=0.8,
                cultural_context={"temporal": ['past', 'present', 'future'][i]}
            )
            
            temp_result = await self.integrate_modalities([temporal_text])
            logger.info(f"   Sequence {i+1}: Cultural coherence {temp_result.cultural_synthesis['overall_romanian_authenticity']:.2f}")
        
        # Get temporal predictions
        predictions = self.temporal_integrator.predict_next_state()
        logger.info(f"   Next state prediction confidence: {predictions.get('prediction_confidence', 0):.2f}")
        
        # Test 4: Cultural coherence analysis
        logger.info("\n🇷🇴 Test 4: Cultural coherence analysis")
        
        mixed_cultural_inputs = [
            ModalityInput(
                modality_type="text",
                data="Romanian traditions meet modern life. Dorul connects generations.",
                confidence=0.9,
                cultural_context={"theme": "cultural_continuity"}
            ),
            ModalityInput(
                modality_type="image",
                data=np.random.randint(0, 255, (50, 50, 3), dtype=np.uint8),
                confidence=0.7,
                cultural_context={"elements": ["modern", "traditional", "romanian"]}
            )
        ]
        
        result4 = await self.integrate_modalities(mixed_cultural_inputs)
        logger.info(f"   Cultural theme: {result4.cultural_synthesis.get('primary_cultural_theme', 'N/A')}")
        logger.info(f"   Romanian insights: {len(result4.cultural_synthesis.get('modality_cultural_contributions', {}))}")
        
        # Get comprehensive system insights
        insights = await self.get_integration_insights()
        logger.info("\n📊 System Performance Insights:")
        logger.info(f"   Total integration sessions: {insights['total_integration_sessions']}")
        logger.info(f"   Average cultural coherence: {insights['average_cultural_coherence']:.2f}")
        logger.info(f"   Average processing time: {insights['average_processing_time']:.3f}s")
        logger.info(f"   Romanian authenticity: {insights['average_romanian_authenticity']:.2f}")
        logger.info(f"   Modality usage: {insights['modality_usage_stats']}")
        logger.info(f"   Temporal depth: {insights['temporal_insights']['temporal_depth']}")
        
        logger.info("\n✅ Multi-modal integration demonstration completed successfully!")

# Import deque at the top
from collections import deque

async def main():
    """Main execution for multi-modal integration testing"""
    integrator = MultiModalIntegrator()
    await integrator.demonstrate_multimodal_integration()

if __name__ == "__main__":
    asyncio.run(main())
"""
Temporal Alignment Network
Advanced neural network for temporal synchronization in multimodal processing

This module provides sophisticated temporal alignment capabilities for
audio-visual synchronization with Romanian cultural specialization.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, Tuple, Optional, Any
import logging

class TemporalAlignmentNetwork(nn.Module):
    """
    Advanced temporal alignment network for multimodal synchronization
    
    Provides sophisticated temporal alignment between audio and visual modalities
    with specialized support for Romanian cultural performances and folk music.
    """
    
    def __init__(self, audio_dim: int, video_dim: int, output_dim: int, 
                 max_sequence_length: int = 1000, num_heads: int = 8):
        super().__init__()
        self.audio_dim = audio_dim
        self.video_dim = video_dim
        self.output_dim = output_dim
        self.max_sequence_length = max_sequence_length
        self.num_heads = num_heads
        
        # Temporal encoding layers
        self.audio_temporal_encoder = nn.Sequential(
            nn.Linear(audio_dim, output_dim),
            nn.LayerNorm(output_dim),
            nn.ReLU(),
            nn.Dropout(0.1)
        )
        
        self.video_temporal_encoder = nn.Sequential(
            nn.Linear(video_dim, output_dim),
            nn.LayerNorm(output_dim),
            nn.ReLU(),
            nn.Dropout(0.1)
        )
        
        # Positional encoding
        self.positional_encoding = self._create_positional_encoding(max_sequence_length, output_dim)
        
        # Cross-modal attention layers
        self.audio_to_video_attention = nn.MultiheadAttention(
            embed_dim=output_dim, num_heads=num_heads, dropout=0.1, batch_first=True
        )
        
        self.video_to_audio_attention = nn.MultiheadAttention(
            embed_dim=output_dim, num_heads=num_heads, dropout=0.1, batch_first=True
        )
        
        # Temporal alignment transformer
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=output_dim, nhead=num_heads, dim_feedforward=output_dim * 4,
            dropout=0.1, activation='relu', batch_first=True
        )
        self.temporal_transformer = nn.TransformerEncoder(encoder_layer, num_layers=4)
        
        # Alignment prediction layers
        self.alignment_predictor = nn.Sequential(
            nn.Linear(output_dim * 2, output_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(output_dim, output_dim // 2),
            nn.ReLU(),
            nn.Linear(output_dim // 2, 1),
            nn.Sigmoid()
        )
        
        # Offset prediction layers
        self.offset_predictor = nn.Sequential(
            nn.Linear(output_dim * 2, output_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(output_dim, 1),
            nn.Tanh()  # Output range [-1, 1] for offset
        )
        
        # Romanian cultural temporal pattern analyzer
        self.cultural_pattern_analyzer = nn.Sequential(
            nn.Linear(output_dim, output_dim // 2),
            nn.ReLU(),
            nn.Linear(output_dim // 2, 10)  # 10 Romanian cultural patterns
        )
        
        # Quality assessment network
        self.quality_assessor = nn.Sequential(
            nn.Linear(output_dim * 2, output_dim),
            nn.ReLU(),
            nn.Linear(output_dim, output_dim // 2),
            nn.ReLU(),
            nn.Linear(output_dim // 2, 1),
            nn.Sigmoid()
        )
        
        self.logger = logging.getLogger(__name__)
    
    def _create_positional_encoding(self, max_len: int, d_model: int) -> torch.Tensor:
        """Create positional encoding for temporal sequences"""
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * 
                           (-np.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        return pe.unsqueeze(0)  # Add batch dimension
    
    def forward(self, audio_features: torch.Tensor, video_features: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Forward pass for temporal alignment
        
        Args:
            audio_features: Audio feature tensor [batch_size, audio_dim]
            video_features: Video feature tensor [batch_size, video_dim]
            
        Returns:
            Dictionary containing aligned features and alignment metrics
        """
        batch_size = audio_features.size(0)
        
        # Encode temporal features
        audio_encoded = self.audio_temporal_encoder(audio_features)  # [B, output_dim]
        video_encoded = self.video_temporal_encoder(video_features)  # [B, output_dim]
        
        # Add sequence dimension for transformer processing
        audio_seq = audio_encoded.unsqueeze(1)  # [B, 1, output_dim]
        video_seq = video_encoded.unsqueeze(1)  # [B, 1, output_dim]
        
        # Add positional encoding
        if audio_seq.size(1) <= self.positional_encoding.size(1):
            pos_enc = self.positional_encoding[:, :audio_seq.size(1), :].to(audio_seq.device)
            audio_seq = audio_seq + pos_enc
            video_seq = video_seq + pos_enc
        
        # Cross-modal attention
        audio_attended, audio_attn_weights = self.audio_to_video_attention(
            audio_seq, video_seq, video_seq
        )
        video_attended, video_attn_weights = self.video_to_audio_attention(
            video_seq, audio_seq, audio_seq
        )
        
        # Combine attended features
        combined_features = torch.cat([audio_attended, video_attended], dim=-1)  # [B, 1, output_dim*2]
        
        # Temporal transformer processing
        transformed_features = self.temporal_transformer(combined_features)
        
        # Remove sequence dimension
        transformed_flat = transformed_features.squeeze(1)  # [B, output_dim*2]
        
        # Predict alignment quality
        alignment_quality = self.alignment_predictor(transformed_flat)
        
        # Predict temporal offset
        temporal_offset = self.offset_predictor(transformed_flat)
        
        # Analyze Romanian cultural patterns
        cultural_patterns = self.cultural_pattern_analyzer(transformed_features.mean(dim=1))
        
        # Assess overall quality
        quality_score = self.quality_assessor(transformed_flat)
        
        # Create aligned features
        audio_aligned = audio_attended.squeeze(1)
        video_aligned = video_attended.squeeze(1)
        fused_features = (audio_aligned + video_aligned) / 2
        
        return {
            'audio_aligned': audio_aligned,
            'video_aligned': video_aligned,
            'fused': fused_features,
            'alignment_quality': alignment_quality.squeeze(-1),
            'temporal_offset': temporal_offset.squeeze(-1),
            'cultural_patterns': cultural_patterns,
            'quality_score': quality_score.squeeze(-1),
            'attention_weights': {
                'audio_to_video': audio_attn_weights,
                'video_to_audio': video_attn_weights
            }
        }

class MultiModalFusionLayer(nn.Module):
    """
    Advanced multimodal fusion layer for combining different modalities
    
    Provides sophisticated fusion strategies for audio, visual, and textual information
    with Romanian cultural context awareness.
    """
    
    def __init__(self, input_dims: Dict[str, int], output_dim: int, 
                 fusion_strategy: str = "attention", num_modalities: int = 3):
        super().__init__()
        self.input_dims = input_dims
        self.output_dim = output_dim
        self.fusion_strategy = fusion_strategy
        self.num_modalities = num_modalities
        
        # Modality-specific projections
        self.modality_projections = nn.ModuleDict()
        for modality, dim in input_dims.items():
            self.modality_projections[modality] = nn.Sequential(
                nn.Linear(dim, output_dim),
                nn.LayerNorm(output_dim),
                nn.ReLU(),
                nn.Dropout(0.1)
            )
        
        # Fusion strategies
        if fusion_strategy == "attention":
            self.attention_fusion = self._create_attention_fusion()
        elif fusion_strategy == "gated":
            self.gated_fusion = self._create_gated_fusion()
        elif fusion_strategy == "transformer":
            self.transformer_fusion = self._create_transformer_fusion()
        
        # Romanian cultural weighting
        self.cultural_weighting = nn.Sequential(
            nn.Linear(output_dim * num_modalities, output_dim),
            nn.ReLU(),
            nn.Linear(output_dim, num_modalities),
            nn.Softmax(dim=-1)
        )
        
        # Output projection
        self.output_projection = nn.Sequential(
            nn.Linear(output_dim, output_dim),
            nn.LayerNorm(output_dim),
            nn.ReLU(),
            nn.Linear(output_dim, output_dim)
        )
        
        self.logger = logging.getLogger(__name__)
    
    def _create_attention_fusion(self) -> nn.Module:
        """Create attention-based fusion mechanism"""
        return nn.MultiheadAttention(
            embed_dim=self.output_dim, num_heads=8, dropout=0.1, batch_first=True
        )
    
    def _create_gated_fusion(self) -> nn.Module:
        """Create gated fusion mechanism"""
        return nn.Sequential(
            nn.Linear(self.output_dim * self.num_modalities, self.output_dim * 2),
            nn.ReLU(),
            nn.Linear(self.output_dim * 2, self.output_dim),
            nn.Sigmoid()
        )
    
    def _create_transformer_fusion(self) -> nn.Module:
        """Create transformer-based fusion mechanism"""
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=self.output_dim, nhead=8, dim_feedforward=self.output_dim * 4,
            dropout=0.1, activation='relu', batch_first=True
        )
        return nn.TransformerEncoder(encoder_layer, num_layers=2)
    
    def forward(self, modality_features: Dict[str, torch.Tensor], 
                cultural_context: Optional[torch.Tensor] = None) -> Dict[str, torch.Tensor]:
        """
        Forward pass for multimodal fusion
        
        Args:
            modality_features: Dictionary of modality features
            cultural_context: Optional Romanian cultural context tensor
            
        Returns:
            Dictionary containing fused features and fusion metrics
        """
        # Project all modalities to common dimension
        projected_features = {}
        modality_tensors = []
        
        for modality, features in modality_features.items():
            if modality in self.modality_projections:
                projected = self.modality_projections[modality](features)
                projected_features[modality] = projected
                modality_tensors.append(projected)
        
        if not modality_tensors:
            raise ValueError("No valid modalities provided")
        
        # Stack modalities for fusion
        stacked_modalities = torch.stack(modality_tensors, dim=1)  # [B, num_modalities, output_dim]
        
        # Apply fusion strategy
        if self.fusion_strategy == "attention":
            fused_features, attention_weights = self.attention_fusion(
                stacked_modalities, stacked_modalities, stacked_modalities
            )
            fused_output = fused_features.mean(dim=1)  # Average over modalities
        
        elif self.fusion_strategy == "gated":
            concatenated = torch.cat(modality_tensors, dim=-1)
            gate_weights = self.gated_fusion(concatenated)
            weighted_sum = sum(gate_weights[:, i:i+1] * tensor for i, tensor in enumerate(modality_tensors))
            fused_output = weighted_sum
            attention_weights = None
        
        elif self.fusion_strategy == "transformer":
            fused_features = self.transformer_fusion(stacked_modalities)
            fused_output = fused_features.mean(dim=1)
            attention_weights = None
        
        else:
            # Simple concatenation fallback
            fused_output = torch.cat(modality_tensors, dim=-1)
            if fused_output.size(-1) != self.output_dim:
                fused_output = nn.Linear(fused_output.size(-1), self.output_dim).to(fused_output.device)(fused_output)
            attention_weights = None
        
        # Apply Romanian cultural weighting if context is provided
        if cultural_context is not None:
            cultural_weights = self.cultural_weighting(
                torch.cat(modality_tensors, dim=-1)
            )
            
            # Reweight modalities based on cultural context
            culturally_weighted = sum(
                cultural_weights[:, i:i+1] * tensor 
                for i, tensor in enumerate(modality_tensors)
            )
            fused_output = (fused_output + culturally_weighted) / 2
        
        # Final output projection
        final_output = self.output_projection(fused_output)
        
        # Calculate fusion metrics
        fusion_entropy = self._calculate_fusion_entropy(modality_tensors)
        modality_contributions = self._calculate_modality_contributions(modality_tensors, final_output)
        
        return {
            'fused_features': final_output,
            'projected_features': projected_features,
            'fusion_entropy': fusion_entropy,
            'modality_contributions': modality_contributions,
            'attention_weights': attention_weights,
            'cultural_weighting': cultural_context is not None
        }
    
    def _calculate_fusion_entropy(self, modality_tensors: list) -> torch.Tensor:
        """Calculate fusion entropy to measure information diversity"""
        if len(modality_tensors) < 2:
            return torch.zeros(1)
        
        # Calculate pairwise similarities
        similarities = []
        for i in range(len(modality_tensors)):
            for j in range(i + 1, len(modality_tensors)):
                sim = F.cosine_similarity(modality_tensors[i], modality_tensors[j], dim=-1)
                similarities.append(sim.mean())
        
        # Calculate entropy based on similarities
        if similarities:
            avg_similarity = torch.stack(similarities).mean()
            entropy = -avg_similarity * torch.log(avg_similarity + 1e-8)
            return entropy
        
        return torch.zeros(1)
    
    def _calculate_modality_contributions(self, modality_tensors: list, fused_output: torch.Tensor) -> Dict[str, float]:
        """Calculate individual modality contributions to fused output"""
        contributions = {}
        modality_names = list(self.input_dims.keys())
        
        for i, tensor in enumerate(modality_tensors):
            if i < len(modality_names):
                # Calculate contribution as cosine similarity with fused output
                contribution = F.cosine_similarity(tensor, fused_output, dim=-1).mean().item()
                contributions[modality_names[i]] = max(0.0, contribution)
        
        # Normalize contributions
        total_contribution = sum(contributions.values())
        if total_contribution > 0:
            contributions = {k: v / total_contribution for k, v in contributions.items()}
        
        return contributions

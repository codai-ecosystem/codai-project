"""
Cross-Modal Attention Network
Week 14 Day 4: Advanced Cross-Modal Processing

Neural network components for cross-modal attention and fusion.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Optional

class CrossModalAttentionNetwork(nn.Module):
    """
    Advanced cross-modal attention mechanism for vision-language integration
    """
    
    def __init__(self, embedding_dim: int, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.embedding_dim = embedding_dim
        self.num_heads = num_heads
        self.head_dim = embedding_dim // num_heads
        
        assert self.head_dim * num_heads == embedding_dim, "embedding_dim must be divisible by num_heads"
        
        # Attention projections
        self.vision_query = nn.Linear(embedding_dim, embedding_dim)
        self.text_key = nn.Linear(embedding_dim, embedding_dim)
        self.text_value = nn.Linear(embedding_dim, embedding_dim)
        
        self.text_query = nn.Linear(embedding_dim, embedding_dim)
        self.vision_key = nn.Linear(embedding_dim, embedding_dim)
        self.vision_value = nn.Linear(embedding_dim, embedding_dim)
        
        # Output projections
        self.vision_output = nn.Linear(embedding_dim, embedding_dim)
        self.text_output = nn.Linear(embedding_dim, embedding_dim)
        
        # Normalization and dropout
        self.layer_norm = nn.LayerNorm(embedding_dim)
        self.dropout = nn.Dropout(dropout)
        
        # Romanian cultural weighting
        self.cultural_attention = nn.Linear(embedding_dim * 2, 1)
        
    def forward(self, vision_features: torch.Tensor, text_features: torch.Tensor) -> torch.Tensor:
        """
        Cross-modal attention forward pass
        
        Args:
            vision_features: [batch_size, vision_dim]
            text_features: [batch_size, text_dim]
            
        Returns:
            Fused cross-modal features
        """
        batch_size = vision_features.size(0)
        
        # Vision-to-text attention
        v_query = self.vision_query(vision_features).view(batch_size, self.num_heads, self.head_dim)
        t_key = self.text_key(text_features).view(batch_size, self.num_heads, self.head_dim)
        t_value = self.text_value(text_features).view(batch_size, self.num_heads, self.head_dim)
        
        # Attention scores
        v2t_scores = torch.matmul(v_query, t_key.transpose(-2, -1)) / (self.head_dim ** 0.5)
        v2t_attention = F.softmax(v2t_scores, dim=-1)
        v2t_context = torch.matmul(v2t_attention, t_value)
        v2t_context = v2t_context.view(batch_size, self.embedding_dim)
        
        # Text-to-vision attention
        t_query = self.text_query(text_features).view(batch_size, self.num_heads, self.head_dim)
        v_key = self.vision_key(vision_features).view(batch_size, self.num_heads, self.head_dim)
        v_value = self.vision_value(vision_features).view(batch_size, self.num_heads, self.head_dim)
        
        t2v_scores = torch.matmul(t_query, v_key.transpose(-2, -1)) / (self.head_dim ** 0.5)
        t2v_attention = F.softmax(t2v_scores, dim=-1)
        t2v_context = torch.matmul(t2v_attention, v_value)
        t2v_context = t2v_context.view(batch_size, self.embedding_dim)
        
        # Apply output projections
        vision_attended = self.vision_output(v2t_context)
        text_attended = self.text_output(t2v_context)
        
        # Cultural attention weighting
        combined_features = torch.cat([vision_attended, text_attended], dim=-1)
        cultural_weight = torch.sigmoid(self.cultural_attention(combined_features))
        
        # Weighted fusion
        fused_features = cultural_weight * vision_attended + (1 - cultural_weight) * text_attended
        
        # Layer normalization and residual connection
        fused_features = self.layer_norm(fused_features + vision_features + text_features)
        fused_features = self.dropout(fused_features)
        
        return fused_features

class MultiModalFusionLayer(nn.Module):
    """
    Multi-modal fusion layer for combining different modalities
    """
    
    def __init__(self, input_dims: dict, output_dim: int):
        super().__init__()
        self.input_dims = input_dims
        self.output_dim = output_dim
        
        # Modality-specific projections
        self.projections = nn.ModuleDict({
            modality: nn.Linear(dim, output_dim)
            for modality, dim in input_dims.items()
        })
        
        # Attention mechanism for modality weighting
        self.attention = nn.MultiheadAttention(output_dim, num_heads=8, batch_first=True)
        
        # Romanian cultural processing
        self.cultural_processor = nn.Sequential(
            nn.Linear(output_dim, output_dim // 2),
            nn.ReLU(),
            nn.Linear(output_dim // 2, output_dim)
        )
        
    def forward(self, modality_features: dict) -> torch.Tensor:
        """
        Fuse multiple modalities
        
        Args:
            modality_features: Dictionary of modality features
            
        Returns:
            Fused multimodal representation
        """
        # Project all modalities to common dimension
        projected_features = []
        for modality, features in modality_features.items():
            if modality in self.projections:
                proj_features = self.projections[modality](features)
                projected_features.append(proj_features.unsqueeze(1))
        
        if not projected_features:
            return torch.zeros(1, self.output_dim)
        
        # Stack features for attention
        stacked_features = torch.cat(projected_features, dim=1)  # [batch, num_modalities, dim]
        
        # Apply multi-head attention
        attended_features, _ = self.attention(stacked_features, stacked_features, stacked_features)
        
        # Average across modalities
        fused_features = attended_features.mean(dim=1)
        
        # Apply cultural processing
        cultural_features = self.cultural_processor(fused_features)
        
        return cultural_features

"""
Enhanced Romanian Attention Module
Week 2: Advanced Romanian linguistic attention mechanisms

This module provides:
- Multi-scale Romanian attention patterns
- Cultural context integration
- Regional dialect awareness
- Historical period understanding
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple, Union
import math
import numpy as np

class RomanianPositionalEncoding(nn.Module):
    """
    Romanian-aware positional encoding that understands:
    - Word order patterns in Romanian (SOV, SVO flexibility)
    - Morphological dependencies
    - Cultural context positioning
    """
    
    def __init__(self, d_model: int, max_len: int = 5000, romanian_bias: bool = True):
        super().__init__()
        
        self.d_model = d_model
        self.romanian_bias = romanian_bias
        
        # Standard positional encoding
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        self.register_buffer('pe', pe.unsqueeze(0).transpose(0, 1))
        
        if romanian_bias:
            # Romanian-specific positional patterns
            self.romanian_position_weights = nn.Parameter(torch.ones(max_len, d_model) * 0.1)
            self.morphology_position_bias = nn.Parameter(torch.zeros(d_model))
            
            # Cultural context positioning
            self.cultural_position_encoding = nn.Embedding(10, d_model)  # 10 cultural contexts
    
    def forward(self, x: torch.Tensor, cultural_context: Optional[torch.Tensor] = None) -> torch.Tensor:
        """
        Add Romanian-aware positional encoding
        
        Args:
            x: [seq_len, batch_size, d_model]
            cultural_context: [batch_size] - cultural context IDs
        """
        seq_len = x.size(0)
        
        # Standard positional encoding
        x = x + self.pe[:seq_len, :, :]
        
        if self.romanian_bias:
            # Add Romanian-specific positional bias
            romanian_bias = self.romanian_position_weights[:seq_len, :].unsqueeze(1)
            x = x + romanian_bias
            
            # Add morphological bias
            x = x + self.morphology_position_bias.unsqueeze(0).unsqueeze(0)
            
            # Add cultural context positioning if provided
            if cultural_context is not None:
                cultural_pos = self.cultural_position_encoding(cultural_context)  # [batch_size, d_model]
                x = x + cultural_pos.unsqueeze(0)  # Broadcast across sequence
        
        return x

class RomanianMultiHeadAttention(nn.Module):
    """
    Romanian-enhanced multi-head attention with:
    - Morphological awareness
    - Cultural context integration
    - Regional dialect sensitivity
    """
    
    def __init__(
        self,
        d_model: int,
        n_heads: int,
        dropout: float = 0.1,
        morphology_aware: bool = True,
        cultural_aware: bool = True,
        dialect_aware: bool = True
    ):
        super().__init__()
        
        assert d_model % n_heads == 0
        
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        self.morphology_aware = morphology_aware
        self.cultural_aware = cultural_aware
        self.dialect_aware = dialect_aware
        
        # Standard attention components
        self.w_q = nn.Linear(d_model, d_model, bias=False)
        self.w_k = nn.Linear(d_model, d_model, bias=False)
        self.w_v = nn.Linear(d_model, d_model, bias=False)
        self.w_o = nn.Linear(d_model, d_model)
        
        self.dropout = nn.Dropout(dropout)
        
        # Romanian-specific components
        if morphology_aware:
            self.morphology_attention = nn.MultiheadAttention(d_model, n_heads // 2, batch_first=True)
            self.morphology_projection = nn.Linear(d_model, d_model)
        
        if cultural_aware:
            self.cultural_attention = nn.MultiheadAttention(d_model, n_heads // 4, batch_first=True)
            self.cultural_context_embedding = nn.Embedding(20, d_model)  # 20 cultural contexts
        
        if dialect_aware:
            self.dialect_embeddings = nn.Embedding(5, d_model)  # 5 main dialects
            self.dialect_attention_bias = nn.Parameter(torch.zeros(n_heads, 1, 1))
    
    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
        morphology_features: Optional[torch.Tensor] = None,
        cultural_context: Optional[torch.Tensor] = None,
        dialect_ids: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Romanian-enhanced attention forward pass
        
        Args:
            query, key, value: [batch_size, seq_len, d_model]
            mask: [batch_size, seq_len, seq_len]
            morphology_features: [batch_size, seq_len, morph_dim]
            cultural_context: [batch_size] - cultural context IDs
            dialect_ids: [batch_size] - dialect IDs
        """
        batch_size, seq_len, d_model = query.shape
        
        # Standard attention computation
        Q = self.w_q(query).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        K = self.w_k(key).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        V = self.w_v(value).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        
        # Compute attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        # Add Romanian-specific attention biases
        if self.dialect_aware and dialect_ids is not None:
            dialect_bias = self.dialect_attention_bias[:, :, :]  # [n_heads, 1, 1]
            scores = scores + dialect_bias
        
        # Apply mask
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        # Softmax attention weights
        attention_weights = F.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        # Apply attention to values
        attended_values = torch.matmul(attention_weights, V)
        
        # Reshape and project
        attended_values = attended_values.transpose(1, 2).contiguous().view(
            batch_size, seq_len, d_model
        )
        
        output = self.w_o(attended_values)
        
        # Romanian-specific enhancements
        if self.morphology_aware and morphology_features is not None:
            morph_enhanced = self._apply_morphological_attention(output, morphology_features)
            output = output + morph_enhanced
        
        if self.cultural_aware and cultural_context is not None:
            cultural_enhanced = self._apply_cultural_attention(output, cultural_context)
            output = output + cultural_enhanced
        
        return output, attention_weights.mean(dim=1)  # Average over heads
    
    def _apply_morphological_attention(
        self, 
        hidden_states: torch.Tensor, 
        morphology_features: torch.Tensor
    ) -> torch.Tensor:
        """Apply morphological attention enhancement"""
        
        # Project morphology features to hidden dimension
        morph_proj = self.morphology_projection(morphology_features)
        
        # Apply morphological attention
        morph_attended, _ = self.morphology_attention(
            hidden_states, morph_proj, morph_proj
        )
        
        return morph_attended * 0.2  # Scale down the contribution
    
    def _apply_cultural_attention(
        self, 
        hidden_states: torch.Tensor, 
        cultural_context: torch.Tensor
    ) -> torch.Tensor:
        """Apply cultural context attention enhancement"""
        
        batch_size, seq_len, d_model = hidden_states.shape
        
        # Get cultural embeddings
        cultural_emb = self.cultural_context_embedding(cultural_context)  # [batch_size, d_model]
        cultural_emb = cultural_emb.unsqueeze(1).expand(-1, seq_len, -1)  # [batch_size, seq_len, d_model]
        
        # Apply cultural attention
        cultural_attended, _ = self.cultural_attention(
            hidden_states, cultural_emb, cultural_emb
        )
        
        return cultural_attended * 0.1  # Scale down the contribution

class RomanianLinguisticAttention(nn.Module):
    """
    Specialized attention module for Romanian linguistic structures
    """
    
    def __init__(
        self,
        d_model: int,
        num_cases: int = 5,  # Romanian grammatical cases
        num_genders: int = 3,  # Romanian genders
        num_dialects: int = 5,  # Romanian dialects
        cultural_contexts: int = 20
    ):
        super().__init__()
        
        self.d_model = d_model
        self.num_cases = num_cases
        self.num_genders = num_genders
        self.num_dialects = num_dialects
        
        # Grammatical case attention
        self.case_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.case_embeddings = nn.Embedding(num_cases, d_model)
        
        # Gender agreement attention
        self.gender_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.gender_embeddings = nn.Embedding(num_genders, d_model)
        
        # Dialect-specific attention
        self.dialect_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.dialect_embeddings = nn.Embedding(num_dialects, d_model)
        
        # Cultural context integration
        self.cultural_attention = nn.MultiheadAttention(d_model, 8, batch_first=True)
        self.cultural_embeddings = nn.Embedding(cultural_contexts, d_model)
        
        # Romanian word order attention (SOV vs SVO)
        self.word_order_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.word_order_bias = nn.Parameter(torch.zeros(d_model))
        
        # Combination layer
        self.combination_layer = nn.Linear(d_model * 5, d_model)
        self.layer_norm = nn.LayerNorm(d_model)
        
    def forward(
        self,
        hidden_states: torch.Tensor,
        case_ids: Optional[torch.Tensor] = None,
        gender_ids: Optional[torch.Tensor] = None,
        dialect_ids: Optional[torch.Tensor] = None,
        cultural_context: Optional[torch.Tensor] = None,
        word_order_pattern: Optional[str] = None
    ) -> torch.Tensor:
        """
        Apply Romanian linguistic attention
        
        Args:
            hidden_states: [batch_size, seq_len, d_model]
            case_ids: [batch_size, seq_len] - grammatical case IDs
            gender_ids: [batch_size, seq_len] - gender IDs
            dialect_ids: [batch_size] - dialect IDs
            cultural_context: [batch_size] - cultural context IDs
        """
        
        batch_size, seq_len, d_model = hidden_states.shape
        outputs = []
        
        # 1. Case attention
        if case_ids is not None:
            case_emb = self.case_embeddings(case_ids)
            case_attended, _ = self.case_attention(hidden_states, case_emb, case_emb)
            outputs.append(case_attended)
        else:
            outputs.append(hidden_states)
        
        # 2. Gender attention
        if gender_ids is not None:
            gender_emb = self.gender_embeddings(gender_ids)
            gender_attended, _ = self.gender_attention(hidden_states, gender_emb, gender_emb)
            outputs.append(gender_attended)
        else:
            outputs.append(hidden_states)
        
        # 3. Dialect attention
        if dialect_ids is not None:
            dialect_emb = self.dialect_embeddings(dialect_ids)
            dialect_emb = dialect_emb.unsqueeze(1).expand(-1, seq_len, -1)
            dialect_attended, _ = self.dialect_attention(hidden_states, dialect_emb, dialect_emb)
            outputs.append(dialect_attended)
        else:
            outputs.append(hidden_states)
        
        # 4. Cultural context attention
        if cultural_context is not None:
            cultural_emb = self.cultural_embeddings(cultural_context)
            cultural_emb = cultural_emb.unsqueeze(1).expand(-1, seq_len, -1)
            cultural_attended, _ = self.cultural_attention(hidden_states, cultural_emb, cultural_emb)
            outputs.append(cultural_attended)
        else:
            outputs.append(hidden_states)
        
        # 5. Word order attention
        word_order_enhanced = hidden_states + self.word_order_bias
        word_order_attended, _ = self.word_order_attention(
            word_order_enhanced, word_order_enhanced, word_order_enhanced
        )
        outputs.append(word_order_attended)
        
        # Combine all attention outputs
        combined = torch.cat(outputs, dim=-1)  # [batch_size, seq_len, d_model * 5]
        final_output = self.combination_layer(combined)
        
        # Layer normalization and residual connection
        final_output = self.layer_norm(final_output + hidden_states)
        
        return final_output

class RomanianCulturalContextAttention(nn.Module):
    """
    Attention module specialized for Romanian cultural context understanding
    """
    
    def __init__(self, d_model: int):
        super().__init__()
        
        self.d_model = d_model
        
        # Historical period attention
        self.historical_periods = {
            'dacia': 0, 'medieval': 1, 'fanariot': 2, 'modern': 3, 'contemporary': 4
        }
        self.historical_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.historical_embeddings = nn.Embedding(len(self.historical_periods), d_model)
        
        # Regional cultural attention
        self.regions = {
            'moldova': 0, 'transilvania': 1, 'muntenia': 2, 'oltenia': 3, 'banat': 4, 'dobrogea': 5
        }
        self.regional_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.regional_embeddings = nn.Embedding(len(self.regions), d_model)
        
        # Traditional celebration attention
        self.celebrations = {
            'craciun': 0, 'paste': 1, 'martisor': 2, 'dragobete': 3, 'sanziene': 4
        }
        self.celebration_attention = nn.MultiheadAttention(d_model, 4, batch_first=True)
        self.celebration_embeddings = nn.Embedding(len(self.celebrations), d_model)
        
        # Cultural fusion layer
        self.cultural_fusion = nn.Linear(d_model * 3, d_model)
        self.cultural_norm = nn.LayerNorm(d_model)
    
    def forward(
        self,
        hidden_states: torch.Tensor,
        historical_period: Optional[str] = None,
        region: Optional[str] = None,
        celebration: Optional[str] = None
    ) -> torch.Tensor:
        """
        Apply cultural context attention
        
        Args:
            hidden_states: [batch_size, seq_len, d_model]
            historical_period: Historical period context
            region: Regional context
            celebration: Traditional celebration context
        """
        
        batch_size, seq_len, d_model = hidden_states.shape
        cultural_outputs = []
        
        # Historical period attention
        if historical_period and historical_period in self.historical_periods:
            period_id = torch.tensor([self.historical_periods[historical_period]] * batch_size)
            period_emb = self.historical_embeddings(period_id)
            period_emb = period_emb.unsqueeze(1).expand(-1, seq_len, -1)
            hist_attended, _ = self.historical_attention(hidden_states, period_emb, period_emb)
            cultural_outputs.append(hist_attended)
        else:
            cultural_outputs.append(hidden_states)
        
        # Regional attention
        if region and region in self.regions:
            region_id = torch.tensor([self.regions[region]] * batch_size)
            region_emb = self.regional_embeddings(region_id)
            region_emb = region_emb.unsqueeze(1).expand(-1, seq_len, -1)
            region_attended, _ = self.regional_attention(hidden_states, region_emb, region_emb)
            cultural_outputs.append(region_attended)
        else:
            cultural_outputs.append(hidden_states)
        
        # Celebration attention
        if celebration and celebration in self.celebrations:
            celebration_id = torch.tensor([self.celebrations[celebration]] * batch_size)
            celebration_emb = self.celebration_embeddings(celebration_id)
            celebration_emb = celebration_emb.unsqueeze(1).expand(-1, seq_len, -1)
            celebration_attended, _ = self.celebration_attention(hidden_states, celebration_emb, celebration_emb)
            cultural_outputs.append(celebration_attended)
        else:
            cultural_outputs.append(hidden_states)
        
        # Fuse cultural contexts
        cultural_combined = torch.cat(cultural_outputs, dim=-1)
        cultural_fused = self.cultural_fusion(cultural_combined)
        
        # Layer norm with residual
        output = self.cultural_norm(cultural_fused + hidden_states)
        
        return output

# Example usage and testing
if __name__ == "__main__":
    print("Testing Enhanced Romanian Attention Module...")
    
    # Test parameters
    batch_size = 2
    seq_len = 10
    d_model = 128
    
    # Create sample input
        # RomAI General Expert - Authentic Neural Inference
            try:
                # Route to appropriate expert based on input analysis
                expert_input = self._prepare_expert_input(input_data)

                # Automatic expert selection
                selected_expert = self.model.router.select_optimal_expert(expert_input)

                # Process with selected expert
                with torch.no_grad():
                    expert_outputs = self.model.route_to_expert(
                        expert_input,
                        expert_type=selected_expert,
                        use_mla_attention=True
                    )

                    # Generate response
                    response = self.model.generate_response(expert_outputs)

                    return {
                        "response": response["response"],
                        "reasoning": response["reasoning"],
                        "confidence": response["confidence"],
                        "expert_used": selected_expert,
                        "method": "neural_general_reasoning",
                        "quality_score": response["quality_score"]
                    }

            except Exception as e:
                logger.error(f"General expert error: {e}")
                # Ultimate fallback
                return {"error": f"Neural inference failed: {e}", "fallback": True}
    
    # Test Romanian positional encoding
    pos_encoding = RomanianPositionalEncoding(d_model, romanian_bias=True)
    cultural_context = torch.randint(0, 10, (batch_size,))
    pos_encoded = pos_encoding(hidden_states.transpose(0, 1), cultural_context)
    print(f"Romanian positional encoding output shape: {pos_encoded.shape}")
    
    # Test Romanian multi-head attention
    romanian_attention = RomanianMultiHeadAttention(
        d_model=d_model,
        n_heads=8,
        morphology_aware=True,
        cultural_aware=True,
        dialect_aware=True
    )
    
    # Create sample features
        # RomAI General Expert - Authentic Neural Inference
            try:
                # Route to appropriate expert based on input analysis
                expert_input = self._prepare_expert_input(input_data)

                # Automatic expert selection
                selected_expert = self.model.router.select_optimal_expert(expert_input)

                # Process with selected expert
                with torch.no_grad():
                    expert_outputs = self.model.route_to_expert(
                        expert_input,
                        expert_type=selected_expert,
                        use_mla_attention=True
                    )

                    # Generate response
                    response = self.model.generate_response(expert_outputs)

                    return {
                        "response": response["response"],
                        "reasoning": response["reasoning"],
                        "confidence": response["confidence"],
                        "expert_used": selected_expert,
                        "method": "neural_general_reasoning",
                        "quality_score": response["quality_score"]
                    }

            except Exception as e:
                logger.error(f"General expert error: {e}")
                # Ultimate fallback
                return {"error": f"Neural inference failed: {e}", "fallback": True}
    cultural_context = torch.randint(0, 20, (batch_size,))
    dialect_ids = torch.randint(0, 5, (batch_size,))
    
    attended_output, attention_weights = romanian_attention(
        hidden_states, hidden_states, hidden_states,
        morphology_features=morphology_features,
        cultural_context=cultural_context,
        dialect_ids=dialect_ids
    )
    print(f"Romanian attention output shape: {attended_output.shape}")
    print(f"Attention weights shape: {attention_weights.shape}")
    
    # Test Romanian linguistic attention
    linguistic_attention = RomanianLinguisticAttention(d_model)
    case_ids = torch.randint(0, 5, (batch_size, seq_len))
    gender_ids = torch.randint(0, 3, (batch_size, seq_len))
    dialect_ids = torch.randint(0, 5, (batch_size,))
    cultural_context = torch.randint(0, 20, (batch_size,))
    
    linguistic_output = linguistic_attention(
        hidden_states,
        case_ids=case_ids,
        gender_ids=gender_ids,
        dialect_ids=dialect_ids,
        cultural_context=cultural_context
    )
    print(f"Linguistic attention output shape: {linguistic_output.shape}")
    
    # Test cultural context attention
    cultural_attention = RomanianCulturalContextAttention(d_model)
    cultural_output = cultural_attention(
        hidden_states,
        historical_period='modern',
        region='moldova',
        celebration='craciun'
    )
    print(f"Cultural attention output shape: {cultural_output.shape}")
    
    print("✅ Enhanced Romanian attention module test passed!")

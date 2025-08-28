"""
Neural Perception Layer for RomAI AGI System

This module implements the neural perception components that process raw input through
neural networks to generate embeddings, extract features, and recognize patterns.

Based on Microsoft Azure AI best practices and state-of-the-art neural architectures
including transformers, attention mechanisms, and multi-modal processing.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass, field
import time
import logging
from transformers import AutoModel, AutoTokenizer
from neural_symbolic_types import (
    NeuralPerception, NeuralEmbedding, AttentionWeights, ConfidenceScore,
    NeuralPerceptionEngine, NeuralPerceptionException, NeuralSymbolicConfig
)

logger = logging.getLogger(__name__)

class MultiHeadAttention(nn.Module):
    """Multi-head attention mechanism for neural perception"""
    
    def __init__(self, embed_dim: int, num_heads: int, dropout: float = 0.1):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        
        if embed_dim % num_heads != 0:
            raise ValueError("Embedding dimension must be divisible by number of heads")
        
        self.query_proj = nn.Linear(embed_dim, embed_dim)
        self.key_proj = nn.Linear(embed_dim, embed_dim)
        self.value_proj = nn.Linear(embed_dim, embed_dim)
        self.output_proj = nn.Linear(embed_dim, embed_dim)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        batch_size, seq_len, embed_dim = x.shape
        
        # Generate queries, keys, values
        queries = self.query_proj(x).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        keys = self.key_proj(x).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        values = self.value_proj(x).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        
        # Compute attention scores
        scores = torch.matmul(queries, keys.transpose(-2, -1)) / (self.head_dim ** 0.5)
        
        if mask is not None:
            scores.masked_fill_(mask == 0, float('-inf'))
        
        attention_weights = F.softmax(scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        # Apply attention to values
        attended = torch.matmul(attention_weights, values)
        attended = attended.transpose(1, 2).contiguous().view(batch_size, seq_len, embed_dim)
        
        output = self.output_proj(attended)
        
        return output, attention_weights.mean(dim=1)  # Average across heads

class TransformerBlock(nn.Module):
    """Transformer block for neural perception"""
    
    def __init__(self, embed_dim: int, num_heads: int, ff_dim: int, dropout: float = 0.1):
        super().__init__()
        self.attention = MultiHeadAttention(embed_dim, num_heads, dropout)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim),
            nn.Dropout(dropout)
        )
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        # Self-attention with residual connection
        attended, attention_weights = self.attention(x, mask)
        x = self.norm1(x + attended)
        
        # Feed-forward with residual connection
        ff_output = self.feed_forward(x)
        x = self.norm2(x + ff_output)
        
        return x, attention_weights

class EmbeddingGenerator(nn.Module):
    """Neural embedding generator"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        super().__init__()
        self.config = config
        self.embed_dim = config.embedding_dim
        
        # Text embedding components
        try:
            self.tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
            self.text_encoder = AutoModel.from_pretrained('distilbert-base-uncased')
            
            # Projection layer to match our embedding dimension
            if self.text_encoder.config.hidden_size != self.embed_dim:
                self.text_projection = nn.Linear(self.text_encoder.config.hidden_size, self.embed_dim)
            else:
                self.text_projection = nn.Identity()
                
        except Exception as e:
            logger.warning(f"Could not load pre-trained text encoder: {e}. Using random initialization.")
            self.tokenizer = None
            self.text_encoder = None
            self.text_projection = nn.Linear(512, self.embed_dim)  # Fallback dimension
        
        # Numerical embedding components
        self.numerical_encoder = nn.Sequential(
            nn.Linear(1, 64),
            nn.ReLU(),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, self.embed_dim)
        )
        
        # Multi-modal fusion
        self.fusion_layer = nn.Linear(self.embed_dim * 2, self.embed_dim)
        
    def forward_text(self, text: str) -> torch.Tensor:
        """Generate embeddings for text input"""
        if self.text_encoder is not None and self.tokenizer is not None:
            try:
                # Tokenize and encode
                inputs = self.tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
                with torch.no_grad():
                    outputs = self.text_encoder(**inputs)
                    # Use CLS token embedding or mean pooling
                    embeddings = outputs.last_hidden_state.mean(dim=1)  # Mean pooling
                    embeddings = self.text_projection(embeddings)
                return embeddings.squeeze(0)
            except Exception as e:
                logger.warning(f"Text encoding failed: {e}. Using fallback.")
                return self._fallback_text_embedding(text)
        else:
            return self._fallback_text_embedding(text)
    
    def _fallback_text_embedding(self, text: str) -> torch.Tensor:
        """Fallback text embedding using character-level encoding"""
        # Simple character-based embedding
        char_codes = [ord(c) for c in text[:50]]  # Limit length
        char_codes += [0] * (50 - len(char_codes))  # Pad
        char_tensor = torch.tensor(char_codes, dtype=torch.float32)
        
        # Project to embedding dimension
        padded = torch.zeros(512)
        padded[:len(char_codes)] = char_tensor / 255.0  # Normalize
        return self.text_projection(padded.unsqueeze(0)).squeeze(0)
    
    def forward_numerical(self, value: Union[float, int]) -> torch.Tensor:
        """Generate embeddings for numerical input"""
        value_tensor = torch.tensor([[float(value)]], dtype=torch.float32)
        return self.numerical_encoder(value_tensor).squeeze(0)
    
    def forward(self, input_data: Any) -> torch.Tensor:
        """Generate embeddings for any input type"""
        if isinstance(input_data, str):
            return self.forward_text(input_data)
        elif isinstance(input_data, (int, float)):
            return self.forward_numerical(input_data)
        elif isinstance(input_data, dict):
            # Multi-modal input
            embeddings = []
            if 'text' in input_data:
                embeddings.append(self.forward_text(input_data['text']))
            if 'number' in input_data:
                embeddings.append(self.forward_numerical(input_data['number']))
            
            if len(embeddings) == 1:
                return embeddings[0]
            elif len(embeddings) == 2:
                fused = torch.cat(embeddings, dim=0)
                return self.fusion_layer(fused)
            else:
                return torch.zeros(self.embed_dim)  # Fallback
        else:
            # Convert to string as fallback
            return self.forward_text(str(input_data))

class PatternRecognizer(nn.Module):
    """Neural pattern recognition module"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        super().__init__()
        self.config = config
        self.embed_dim = config.embedding_dim
        
        # Transformer layers for pattern recognition
        self.transformer_layers = nn.ModuleList([
            TransformerBlock(
                embed_dim=self.embed_dim,
                num_heads=config.attention_heads,
                ff_dim=self.embed_dim * 4,
                dropout=config.dropout_rate
            )
            for _ in range(config.neural_layers)
        ])
        
        # Pattern classification heads
        self.pattern_classifiers = nn.ModuleDict({
            'mathematical': nn.Linear(self.embed_dim, 10),  # Different math operation types
            'logical': nn.Linear(self.embed_dim, 5),        # Logic operation types
            'linguistic': nn.Linear(self.embed_dim, 8),     # Language patterns
            'conceptual': nn.Linear(self.embed_dim, 12),    # Abstract concepts
        })
        
        # Confidence estimators
        self.confidence_estimators = nn.ModuleDict({
            pattern_type: nn.Sequential(
                nn.Linear(self.embed_dim, 64),
                nn.ReLU(),
                nn.Linear(64, 1),
                nn.Sigmoid()
            )
            for pattern_type in self.pattern_classifiers.keys()
        })
    
    def forward(self, embeddings: torch.Tensor) -> Tuple[Dict[str, torch.Tensor], Dict[str, float], torch.Tensor]:
        """Recognize patterns in embeddings"""
        # Ensure embeddings have sequence dimension
        if embeddings.dim() == 1:
            embeddings = embeddings.unsqueeze(0)  # Add batch dimension
        if embeddings.dim() == 2:
            embeddings = embeddings.unsqueeze(0)  # Add sequence dimension
        
        # Process through transformer layers
        x = embeddings
        attention_weights = []
        
        for transformer_layer in self.transformer_layers:
            x, attn = transformer_layer(x)
            attention_weights.append(attn)
        
        # Pool to single representation
        pooled = x.mean(dim=1).squeeze(0)  # Global average pooling
        
        # Classify patterns
        pattern_logits = {}
        pattern_confidences = {}
        
        for pattern_type, classifier in self.pattern_classifiers.items():
            logits = classifier(pooled)
            confidence = self.confidence_estimators[pattern_type](pooled).item()
            
            pattern_logits[pattern_type] = F.softmax(logits, dim=-1)
            pattern_confidences[pattern_type] = confidence
        
        # Combine attention weights
        combined_attention = torch.stack(attention_weights).mean(dim=0)
        
        return pattern_logits, pattern_confidences, combined_attention

class FeatureExtractor(nn.Module):
    """Neural feature extraction module"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        super().__init__()
        self.config = config
        self.embed_dim = config.embedding_dim
        
        # Feature extraction layers
        self.feature_layers = nn.ModuleDict({
            'semantic': nn.Sequential(
                nn.Linear(self.embed_dim, 256),
                nn.ReLU(),
                nn.Linear(256, 128)
            ),
            'syntactic': nn.Sequential(
                nn.Linear(self.embed_dim, 256),
                nn.ReLU(),
                nn.Linear(256, 64)
            ),
            'pragmatic': nn.Sequential(
                nn.Linear(self.embed_dim, 256),
                nn.ReLU(),
                nn.Linear(256, 32)
            ),
            'emotional': nn.Sequential(
                nn.Linear(self.embed_dim, 128),
                nn.ReLU(),
                nn.Linear(128, 16)
            )
        })
        
        # Feature importance estimators
        self.importance_estimators = nn.ModuleDict({
            feature_type: nn.Sequential(
                nn.Linear(layer[-1].out_features if hasattr(layer[-1], 'out_features') else 32, 1),
                nn.Sigmoid()
            )
            for feature_type, layer in self.feature_layers.items()
        })
    
    def forward(self, embeddings: torch.Tensor) -> Dict[str, Any]:
        """Extract interpretable features from embeddings"""
        if embeddings.dim() > 1:
            embeddings = embeddings.flatten()  # Flatten to 1D
        
        extracted_features = {}
        
        for feature_type, extractor in self.feature_layers.items():
            # Extract features
            features = extractor(embeddings)
            
            # Calculate importance
            importance = self.importance_estimators[feature_type](features).item()
            
            # Convert to interpretable format
            feature_values = features.detach().numpy().tolist()
            
            extracted_features[feature_type] = {
                'values': feature_values,
                'importance': importance,
                'dimension': len(feature_values)
            }
        
        return extracted_features

class NeuralPerceptionLayer(NeuralPerceptionEngine):
    """Main neural perception layer implementation"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize components
        self.embedding_generator = EmbeddingGenerator(config).to(self.device)
        self.pattern_recognizer = PatternRecognizer(config).to(self.device)
        self.feature_extractor = FeatureExtractor(config).to(self.device)
        
        # Caching for performance
        self.cache = {} if config.enable_caching else None
        self.cache_size = config.cache_size
        
        logger.info(f"Neural Perception Layer initialized with {config.embedding_dim}D embeddings on {self.device}")
    
    async def perceive(self, input_data: Any) -> NeuralPerception:
        """Process raw input through complete neural perception pipeline"""
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = str(hash(str(input_data))) if self.cache is not None else None
            if cache_key and cache_key in self.cache:
                logger.debug(f"Cache hit for input: {str(input_data)[:50]}...")
                return self.cache[cache_key]
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(input_data)
            
            # Recognize patterns
            with torch.no_grad():
                pattern_logits, pattern_confidences, attention_weights = self.pattern_recognizer(embeddings)
            
            # Extract features
            features = await self.extract_features(embeddings)
            
            # Add pattern information to features
            features['patterns'] = {
                'detected_patterns': {k: v.numpy().tolist() for k, v in pattern_logits.items()},
                'pattern_confidences': pattern_confidences,
                'dominant_pattern': max(pattern_confidences.items(), key=lambda x: x[1])[0]
            }
            
            # Calculate overall confidence
            overall_confidence = np.mean(list(pattern_confidences.values()))
            
            # Create perception result
            perception = NeuralPerception(
                raw_input=input_data,
                embeddings=embeddings,
                features=features,
                attention_weights=attention_weights,
                confidence=overall_confidence,
                processing_time=time.time() - start_time,
                metadata={
                    'device': str(self.device),
                    'embedding_dim': self.config.embedding_dim,
                    'pattern_count': len(pattern_confidences)
                }
            )
            
            # Cache result
            if cache_key and self.cache is not None:
                if len(self.cache) >= self.cache_size:
                    # Remove oldest entry
                    oldest_key = next(iter(self.cache))
                    del self.cache[oldest_key]
                self.cache[cache_key] = perception
            
            logger.debug(f"Neural perception completed in {perception.processing_time:.3f}s with confidence {perception.confidence:.3f}")
            return perception
            
        except Exception as e:
            logger.error(f"Neural perception failed: {e}")
            raise NeuralPerceptionException(f"Failed to process input through neural perception: {e}")
    
    async def generate_embeddings(self, data: Any) -> NeuralEmbedding:
        """Generate neural embeddings from input data"""
        try:
            with torch.no_grad():
                embeddings = self.embedding_generator(data)
                
            if not isinstance(embeddings, torch.Tensor):
                raise ValueError("Embedding generator must return torch.Tensor")
            
            # Ensure embeddings are on correct device
            embeddings = embeddings.to(self.device)
            
            # Normalize embeddings
            embeddings = F.normalize(embeddings, p=2, dim=-1)
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise NeuralPerceptionException(f"Failed to generate embeddings: {e}")
    
    async def extract_features(self, embeddings: NeuralEmbedding) -> Dict[str, Any]:
        """Extract interpretable features from embeddings"""
        try:
            with torch.no_grad():
                features = self.feature_extractor(embeddings)
            
            # Add embedding statistics
            features['embedding_stats'] = {
                'norm': float(torch.norm(embeddings)),
                'mean': float(torch.mean(embeddings)),
                'std': float(torch.std(embeddings)),
                'max': float(torch.max(embeddings)),
                'min': float(torch.min(embeddings))
            }
            
            return features
            
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            raise NeuralPerceptionException(f"Failed to extract features: {e}")
    
    def clear_cache(self):
        """Clear the perception cache"""
        if self.cache is not None:
            self.cache.clear()
            logger.info("Neural perception cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if self.cache is None:
            return {'caching_enabled': False}
        
        return {
            'caching_enabled': True,
            'cache_size': len(self.cache),
            'cache_capacity': self.cache_size,
            'hit_rate': getattr(self, '_cache_hits', 0) / (getattr(self, '_cache_attempts', 1))
        }

# Factory function for easy instantiation
def create_neural_perception_layer(config: Optional[NeuralSymbolicConfig] = None) -> NeuralPerceptionLayer:
    """Create a neural perception layer with optional configuration"""
    if config is None:
        config = NeuralSymbolicConfig()
    
    return NeuralPerceptionLayer(config)

# Example usage and testing
async def test_neural_perception():
    """Test the neural perception layer"""
    config = NeuralSymbolicConfig(
        embedding_dim=256,
        attention_heads=8,
        neural_layers=3,
        verbose_logging=True
    )
    
    perception_layer = create_neural_perception_layer(config)
    
    # Test different input types
    test_inputs = [
        "What is the square root of 144?",
        42,
        {"text": "If it rains, then the ground is wet", "number": 0.95},
        "Romanian culture emphasizes family values and hospitality"
    ]
    
    for input_data in test_inputs:
        print(f"\nTesting input: {input_data}")
        try:
            perception = await perception_layer.perceive(input_data)
            print(f"Confidence: {perception.confidence:.3f}")
            print(f"Processing time: {perception.processing_time:.3f}s")
            print(f"Dominant pattern: {perception.features['patterns']['dominant_pattern']}")
            print(f"Embedding norm: {perception.features['embedding_stats']['norm']:.3f}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    # Run test
    asyncio.run(test_neural_perception())
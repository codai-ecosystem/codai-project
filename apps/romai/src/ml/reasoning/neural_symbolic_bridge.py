"""
Neural-Symbolic Bridge for RomAI AGI System

This module implements the bridge between neural and symbolic representations,
enabling seamless translation, alignment, and coordination between neural
pattern recognition and symbolic reasoning systems.

Based on Microsoft Azure AI best practices for hybrid AI architectures and
state-of-the-art research in neural-symbolic integration including differentiable
symbolic programming and neuro-symbolic reasoning.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import asyncio
import time
import logging
from typing import Dict, Any, List, Optional, Tuple, Union, Set
from dataclasses import dataclass, field
from collections import defaultdict
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from neural_symbolic_types import (
    NeuralPerception, SymbolicRepresentation, NeuralEmbedding, SymbolicFact,
    SymbolicRule, ConfidenceScore, NeuralSymbolicBridge, BridgeException,
    AlignmentException, NeuralSymbolicConfig, SymbolicToken, KnowledgeType,
    ReasoningMode, ConceptNode, ConceptRelationship, RelationType
)

logger = logging.getLogger(__name__)

class SymbolGroundingNetwork(nn.Module):
    """Neural network for grounding symbols in neural embeddings"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        super().__init__()
        self.config = config
        self.embed_dim = config.embedding_dim
        
        # Symbol encoder
        self.symbol_encoder = nn.Sequential(
            nn.Embedding(10000, 128),  # Vocabulary size of 10k symbols
            nn.LSTM(128, 256, batch_first=True, bidirectional=True),
        )
        
        # Projection to embedding space
        self.symbol_projection = nn.Sequential(
            nn.Linear(512, self.embed_dim),  # 512 from bidirectional LSTM
            nn.LayerNorm(self.embed_dim),
            nn.ReLU(),
            nn.Linear(self.embed_dim, self.embed_dim)
        )
        
        # Attention mechanism for symbol grounding
        self.grounding_attention = nn.MultiheadAttention(
            embed_dim=self.embed_dim,
            num_heads=config.attention_heads,
            dropout=config.dropout_rate
        )
        
        # Confidence estimator
        self.confidence_estimator = nn.Sequential(
            nn.Linear(self.embed_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
    
    def forward(self, symbols: List[str], neural_context: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Ground symbols in neural embedding space"""
        # Convert symbols to indices (simple hash-based approach)
        symbol_indices = [hash(s) % 10000 for s in symbols]
        symbol_tensor = torch.tensor([symbol_indices], dtype=torch.long)
        
        # Encode symbols
        embedded_symbols = self.symbol_encoder.weight[symbol_tensor]  # Simple embedding lookup
        lstm_out, _ = self.symbol_encoder[1](embedded_symbols)
        
        # Pool LSTM output
        symbol_repr = lstm_out.mean(dim=1)  # Average over sequence
        
        # Project to embedding space
        symbol_embeddings = self.symbol_projection(symbol_repr)
        
        # Apply attention with neural context
        if neural_context.dim() == 1:
            neural_context = neural_context.unsqueeze(0)
        if neural_context.dim() == 2:
            neural_context = neural_context.unsqueeze(0)
        
        grounded_symbols, attention_weights = self.grounding_attention(
            symbol_embeddings.unsqueeze(0),
            neural_context,
            neural_context
        )
        
        # Estimate confidence
        confidence = self.confidence_estimator(grounded_symbols.squeeze(0))
        
        return grounded_symbols.squeeze(0), confidence.squeeze(-1)

class NeuralSymbolicAttention(nn.Module):
    """Attention mechanism for neural-symbolic alignment"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        super().__init__()
        self.config = config
        self.embed_dim = config.embedding_dim
        
        # Cross-modal attention
        self.neural_to_symbolic_attn = nn.MultiheadAttention(
            embed_dim=self.embed_dim,
            num_heads=config.attention_heads,
            dropout=config.dropout_rate
        )
        
        self.symbolic_to_neural_attn = nn.MultiheadAttention(
            embed_dim=self.embed_dim,
            num_heads=config.attention_heads,
            dropout=config.dropout_rate
        )
        
        # Alignment scorer
        self.alignment_scorer = nn.Sequential(
            nn.Linear(self.embed_dim * 2, 256),
            nn.ReLU(),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
    
    def forward(self, neural_repr: torch.Tensor, symbolic_repr: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, float]:
        """Compute attention between neural and symbolic representations"""
        # Ensure proper dimensions
        if neural_repr.dim() == 1:
            neural_repr = neural_repr.unsqueeze(0)
        if symbolic_repr.dim() == 1:
            symbolic_repr = symbolic_repr.unsqueeze(0)
        
        # Neural attending to symbolic
        neural_attended, neural_attn_weights = self.neural_to_symbolic_attn(
            neural_repr.unsqueeze(1),
            symbolic_repr.unsqueeze(1),
            symbolic_repr.unsqueeze(1)
        )
        
        # Symbolic attending to neural
        symbolic_attended, symbolic_attn_weights = self.symbolic_to_neural_attn(
            symbolic_repr.unsqueeze(1),
            neural_repr.unsqueeze(1),
            neural_repr.unsqueeze(1)
        )
        
        # Calculate alignment score
        combined_repr = torch.cat([neural_attended.squeeze(1), symbolic_attended.squeeze(1)], dim=-1)
        alignment_score = self.alignment_scorer(combined_repr).item()
        
        return neural_attended.squeeze(1), symbolic_attended.squeeze(1), alignment_score

class DifferentiableSymbolicOperator(nn.Module):
    """Differentiable operations on symbolic representations"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        super().__init__()
        self.config = config
        self.embed_dim = config.embedding_dim
        
        # Logical operation embeddings
        self.logical_ops = nn.ModuleDict({
            'and': nn.Linear(self.embed_dim * 2, self.embed_dim),
            'or': nn.Linear(self.embed_dim * 2, self.embed_dim),
            'not': nn.Linear(self.embed_dim, self.embed_dim),
            'implies': nn.Linear(self.embed_dim * 2, self.embed_dim),
            'equals': nn.Linear(self.embed_dim * 2, self.embed_dim)
        })
        
        # Operation selector
        self.operation_selector = nn.Sequential(
            nn.Linear(self.embed_dim * 2, 256),
            nn.ReLU(),
            nn.Linear(256, len(self.logical_ops)),
            nn.Softmax(dim=-1)
        )
    
    def forward(self, left_operand: torch.Tensor, right_operand: Optional[torch.Tensor] = None,
               operation: Optional[str] = None) -> Tuple[torch.Tensor, str, float]:
        """Apply differentiable symbolic operations"""
        if operation is None and right_operand is not None:
            # Automatically select operation
            combined = torch.cat([left_operand, right_operand], dim=-1)
            op_probs = self.operation_selector(combined)
            operation = list(self.logical_ops.keys())[torch.argmax(op_probs).item()]
            confidence = torch.max(op_probs).item()
        else:
            confidence = 1.0
        
        # Apply operation
        if operation == 'not':
            result = self.logical_ops['not'](left_operand)
        elif operation in self.logical_ops and right_operand is not None:
            combined = torch.cat([left_operand, right_operand], dim=-1)
            result = self.logical_ops[operation](combined)
        else:
            # Default to identity
            result = left_operand
            operation = 'identity'
        
        # Apply activation
        result = torch.tanh(result)  # Bounded activation
        
        return result, operation, confidence

class ConceptMapper:
    """Maps between neural representations and symbolic concepts"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.concept_embeddings: Dict[str, torch.Tensor] = {}
        self.embedding_to_concept: Dict[str, str] = {}
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.concept_vocabulary: List[str] = []
        
        logger.info("Concept mapper initialized")
    
    def add_concept(self, concept_name: str, embedding: torch.Tensor, description: str = "") -> None:
        """Add a concept to the mapper"""
        self.concept_embeddings[concept_name] = embedding.detach()
        
        # Create embedding signature for reverse lookup
        embedding_signature = self._create_embedding_signature(embedding)
        self.embedding_to_concept[embedding_signature] = concept_name
        
        # Update vocabulary
        if concept_name not in self.concept_vocabulary:
            self.concept_vocabulary.append(concept_name)
        
        logger.debug(f"Added concept: {concept_name}")
    
    def find_closest_concepts(self, embedding: torch.Tensor, top_k: int = 5) -> List[Tuple[str, float]]:
        """Find concepts closest to the given embedding"""
        if not self.concept_embeddings:
            return []
        
        similarities = []
        target_embedding = embedding.detach()
        
        for concept_name, concept_embedding in self.concept_embeddings.items():
            similarity = F.cosine_similarity(target_embedding.flatten(), concept_embedding.flatten(), dim=0)
            similarities.append((concept_name, float(similarity)))
        
        # Sort by similarity and return top k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
    
    def embed_concept(self, concept_name: str) -> Optional[torch.Tensor]:
        """Get embedding for a concept"""
        return self.concept_embeddings.get(concept_name)
    
    def _create_embedding_signature(self, embedding: torch.Tensor) -> str:
        """Create a signature for embedding reverse lookup"""
        # Use first few dimensions as signature
        signature_dims = min(10, embedding.shape[-1])
        signature = embedding.flatten()[:signature_dims]
        return str(hash(tuple(signature.numpy().round(3).tolist())))

class PatternExtractor:
    """Extracts symbolic patterns from neural representations"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.pattern_templates: List[Dict[str, Any]] = []
        self.pattern_cache: Dict[str, List[str]] = {}
        
        # Initialize common patterns
        self._initialize_patterns()
        
        logger.info("Pattern extractor initialized")
    
    def _initialize_patterns(self):
        """Initialize common symbolic patterns"""
        # Mathematical patterns
        self.pattern_templates.extend([
            {'name': 'arithmetic', 'pattern': r'(\d+\.?\d*)\s*([\+\-\*\/])\s*(\d+\.?\d*)', 'type': 'mathematical'},
            {'name': 'comparison', 'pattern': r'(\w+)\s*(>|<|>=|<=|==|!=)\s*(\w+)', 'type': 'logical'},
            {'name': 'conditional', 'pattern': r'if\s+(.+?)\s+then\s+(.+)', 'type': 'logical'},
            {'name': 'universal', 'pattern': r'all\s+(\w+)\s+are\s+(\w+)', 'type': 'logical'},
            {'name': 'existential', 'pattern': r'some\s+(\w+)\s+are\s+(\w+)', 'type': 'logical'}
        ])
    
    def extract_patterns(self, text: str) -> List[Dict[str, Any]]:
        """Extract symbolic patterns from text"""
        patterns = []
        
        for template in self.pattern_templates:
            matches = re.finditer(template['pattern'], text, re.IGNORECASE)
            
            for match in matches:
                pattern_info = {
                    'template_name': template['name'],
                    'type': template['type'],
                    'match': match.group(),
                    'groups': match.groups(),
                    'start': match.start(),
                    'end': match.end(),
                    'confidence': self._calculate_pattern_confidence(template, match)
                }
                patterns.append(pattern_info)
        
        return patterns
    
    def _calculate_pattern_confidence(self, template: Dict[str, Any], match) -> float:
        """Calculate confidence for a pattern match"""
        # Simple confidence based on match completeness
        base_confidence = 0.7
        
        # Boost for complete matches
        if len(match.groups()) == len(re.findall(r'\([^)]+\)', template['pattern'])):
            base_confidence += 0.2
        
        # Boost for certain pattern types
        if template['type'] == 'mathematical':
            base_confidence += 0.1
        
        return min(1.0, base_confidence)

class NeuralSymbolicBridgeImpl(NeuralSymbolicBridge):
    """Main implementation of the neural-symbolic bridge"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize components
        self.symbol_grounding = SymbolGroundingNetwork(config).to(self.device)
        self.attention_mechanism = NeuralSymbolicAttention(config).to(self.device)
        self.symbolic_operators = DifferentiableSymbolicOperator(config).to(self.device)
        self.concept_mapper = ConceptMapper(config)
        self.pattern_extractor = PatternExtractor(config)
        
        # Alignment cache
        self.alignment_cache: Dict[str, float] = {}
        self.conversion_cache: Dict[str, Any] = {}
        
        logger.info(f"Neural-Symbolic Bridge initialized on {self.device}")
    
    async def neural_to_symbolic(self, perception: NeuralPerception) -> SymbolicRepresentation:
        """Convert neural representation to symbolic form"""
        try:
            start_time = time.time()
            
            # Extract embeddings and features
            embeddings = perception.embeddings
            features = perception.features
            
            # Extract symbolic tokens from input
            input_text = str(perception.raw_input)
            symbols = self._extract_symbols(input_text)
            
            # Extract patterns
            patterns = self.pattern_extractor.extract_patterns(input_text)
            
            # Convert patterns to symbolic facts
            facts = []
            for pattern in patterns:
                fact = self._pattern_to_fact(pattern)
                if fact:
                    facts.append(fact)
            
            # Extract concepts from embeddings
            closest_concepts = self.concept_mapper.find_closest_concepts(embeddings)
            
            # Add concept facts
            for concept_name, similarity in closest_concepts:
                if similarity > 0.5:  # Threshold for concept activation
                    facts.append(SymbolicFact(
                        subject=str(perception.raw_input)[:50],  # Truncate long inputs
                        predicate="activates_concept",
                        object=concept_name,
                        confidence=similarity,
                        source="neural_to_symbolic_conversion"
                    ))
            
            # Generate relationships based on attention patterns
            relationships = self._extract_relationships(perception.attention_weights, symbols)
            
            # Create symbolic representation
            symbolic_repr = SymbolicRepresentation(
                symbols=symbols,
                facts=facts,
                rules=[],  # Rules would be extracted differently
                relationships=relationships,
                confidence=perception.confidence,
                metadata={
                    'conversion_time': time.time() - start_time,
                    'pattern_count': len(patterns),
                    'concept_count': len(closest_concepts),
                    'source_type': type(perception.raw_input).__name__
                }
            )
            
            logger.debug(f"Neural to symbolic conversion completed in {symbolic_repr.metadata['conversion_time']:.3f}s")
            return symbolic_repr
            
        except Exception as e:
            logger.error(f"Neural to symbolic conversion failed: {e}")
            raise BridgeException(f"Failed to convert neural to symbolic: {e}")
    
    async def symbolic_to_neural(self, symbolic: SymbolicRepresentation) -> NeuralEmbedding:
        """Convert symbolic representation to neural form"""
        try:
            start_time = time.time()
            
            # Ground symbols in neural space
            if symbolic.symbols:
                grounded_symbols, grounding_confidence = self.symbol_grounding(
                    symbolic.symbols,
                    torch.zeros(1, self.config.embedding_dim).to(self.device)  # Default context
                )
            else:
                grounded_symbols = torch.zeros(self.config.embedding_dim).to(self.device)
                grounding_confidence = torch.tensor([0.5]).to(self.device)
            
            # Embed facts
            fact_embeddings = []
            for fact in symbolic.facts:
                fact_text = f"{fact.subject} {fact.predicate} {fact.object}"
                fact_embedding = self._text_to_embedding(fact_text)
                fact_embeddings.append(fact_embedding * fact.confidence)
            
            # Combine all embeddings
            if fact_embeddings:
                fact_tensor = torch.stack(fact_embeddings)
                combined_facts = fact_tensor.mean(dim=0)
            else:
                combined_facts = torch.zeros(self.config.embedding_dim).to(self.device)
            
            # Combine symbol and fact embeddings
            final_embedding = (grounded_symbols + combined_facts) / 2
            
            # Normalize
            final_embedding = F.normalize(final_embedding, p=2, dim=-1)
            
            logger.debug(f"Symbolic to neural conversion completed in {time.time() - start_time:.3f}s")
            return final_embedding
            
        except Exception as e:
            logger.error(f"Symbolic to neural conversion failed: {e}")
            raise BridgeException(f"Failed to convert symbolic to neural: {e}")
    
    async def align_representations(self, neural: NeuralPerception, symbolic: SymbolicRepresentation) -> float:
        """Calculate alignment score between neural and symbolic representations"""
        try:
            # Convert symbolic to neural for comparison
            symbolic_neural = await self.symbolic_to_neural(symbolic)
            
            # Use attention mechanism to compute alignment
            with torch.no_grad():
                _, _, alignment_score = self.attention_mechanism(
                    neural.embeddings,
                    symbolic_neural
                )
            
            # Additional semantic alignment check
            semantic_alignment = self._compute_semantic_alignment(neural, symbolic)
            
            # Combine scores
            final_alignment = (alignment_score + semantic_alignment) / 2
            
            # Cache result
            cache_key = f"{hash(str(neural.raw_input))}_{hash(str(symbolic.symbols))}"
            self.alignment_cache[cache_key] = final_alignment
            
            return final_alignment
            
        except Exception as e:
            logger.error(f"Representation alignment failed: {e}")
            raise AlignmentException(f"Failed to align representations: {e}")
    
    def _extract_symbols(self, text: str) -> List[SymbolicToken]:
        """Extract symbolic tokens from text"""
        # Simple tokenization - could be enhanced with NLP libraries
        words = re.findall(r'\w+|\d+(?:\.\d+)?|[+\-*/=<>!]+', text.lower())
        
        # Filter and categorize symbols
        symbols = []
        for word in words:
            if word.isdigit() or re.match(r'\d+\.\d+', word):
                symbols.append(f"NUMBER:{word}")
            elif word in ['and', 'or', 'not', 'if', 'then', 'all', 'some', 'is', 'are']:
                symbols.append(f"OPERATOR:{word}")
            elif len(word) > 2:  # Filter short words
                symbols.append(f"CONCEPT:{word}")
        
        return symbols[:50]  # Limit number of symbols
    
    def _pattern_to_fact(self, pattern: Dict[str, Any]) -> Optional[SymbolicFact]:
        """Convert an extracted pattern to a symbolic fact"""
        try:
            if pattern['type'] == 'mathematical':
                # Convert arithmetic pattern to fact
                groups = pattern['groups']
                if len(groups) >= 3:
                    return SymbolicFact(
                        subject=f"expression_{hash(pattern['match'])}",
                        predicate="arithmetic_operation",
                        object={'left': groups[0], 'operator': groups[1], 'right': groups[2]},
                        confidence=pattern['confidence'],
                        source="pattern_extraction"
                    )
            
            elif pattern['type'] == 'logical':
                # Convert logical pattern to fact
                if pattern['template_name'] == 'conditional':
                    groups = pattern['groups']
                    if len(groups) >= 2:
                        return SymbolicFact(
                            subject=groups[0].strip(),
                            predicate="implies",
                            object=groups[1].strip(),
                            confidence=pattern['confidence'],
                            source="pattern_extraction"
                        )
                
                elif pattern['template_name'] == 'universal':
                    groups = pattern['groups']
                    if len(groups) >= 2:
                        return SymbolicFact(
                            subject=groups[0],
                            predicate="is_a",
                            object=groups[1],
                            confidence=pattern['confidence'],
                            source="pattern_extraction"
                        )
            
            return None
            
        except Exception as e:
            logger.warning(f"Pattern to fact conversion failed: {e}")
            return None
    
    def _extract_relationships(self, attention_weights: Optional[torch.Tensor], 
                             symbols: List[SymbolicToken]) -> Dict[str, List[str]]:
        """Extract relationships from attention weights"""
        relationships = defaultdict(list)
        
        if attention_weights is None or len(symbols) < 2:
            return dict(relationships)
        
        # Simple relationship extraction based on attention patterns
        try:
            # Get attention matrix
            if attention_weights.dim() > 2:
                attention_matrix = attention_weights.mean(dim=0)  # Average over heads/layers
            else:
                attention_matrix = attention_weights
            
            # Find strong attention connections
            threshold = 0.1
            for i in range(min(len(symbols), attention_matrix.shape[0])):
                for j in range(min(len(symbols), attention_matrix.shape[1])):
                    if i != j and attention_matrix[i, j] > threshold:
                        relationships[symbols[i]].append(symbols[j])
            
        except Exception as e:
            logger.warning(f"Relationship extraction failed: {e}")
        
        return dict(relationships)
    
    def _compute_semantic_alignment(self, neural: NeuralPerception, symbolic: SymbolicRepresentation) -> float:
        """Compute semantic alignment between representations"""
        try:
            # Extract semantic features from neural representation
            neural_features = neural.features.get('semantic', {})
            if not neural_features:
                return 0.5  # Default alignment
            
            # Count semantic matches in symbolic representation
            matches = 0
            total_checks = 0
            
            # Check if dominant pattern matches symbolic facts
            dominant_pattern = neural.features.get('patterns', {}).get('dominant_pattern', '')
            
            for fact in symbolic.facts:
                total_checks += 1
                if dominant_pattern in ['mathematical', 'logical'] and fact.source == "pattern_extraction":
                    matches += 1
                elif fact.confidence > 0.7:  # High confidence facts
                    matches += 0.5
            
            # Calculate alignment ratio
            if total_checks > 0:
                return matches / total_checks
            else:
                return 0.5  # Default
                
        except Exception as e:
            logger.warning(f"Semantic alignment computation failed: {e}")
            return 0.5
    
    def _text_to_embedding(self, text: str) -> torch.Tensor:
        """Convert text to embedding (simplified implementation)"""
        # Simple character-based embedding
        chars = [ord(c) for c in text[:100]]  # Limit length
        chars += [0] * (100 - len(chars))  # Pad
        
        # Create embedding
        char_tensor = torch.tensor(chars, dtype=torch.float32).to(self.device)
        
        # Project to embedding dimension
        if len(chars) < self.config.embedding_dim:
            padded = torch.zeros(self.config.embedding_dim).to(self.device)
            padded[:len(chars)] = char_tensor[:len(chars)] / 255.0
            return padded
        else:
            # Downsample if too long
            downsampled = char_tensor[:self.config.embedding_dim] / 255.0
            return downsampled
    
    def clear_caches(self):
        """Clear all caches"""
        self.alignment_cache.clear()
        self.conversion_cache.clear()
        logger.info("Neural-symbolic bridge caches cleared")
    
    def get_bridge_stats(self) -> Dict[str, Any]:
        """Get bridge statistics"""
        return {
            'concept_count': len(self.concept_mapper.concept_embeddings),
            'pattern_templates': len(self.pattern_extractor.pattern_templates),
            'alignment_cache_size': len(self.alignment_cache),
            'conversion_cache_size': len(self.conversion_cache),
            'device': str(self.device)
        }

# Factory function for easy instantiation
def create_neural_symbolic_bridge(config: Optional[NeuralSymbolicConfig] = None) -> NeuralSymbolicBridgeImpl:
    """Create a neural-symbolic bridge with optional configuration"""
    if config is None:
        config = NeuralSymbolicConfig()
    
    return NeuralSymbolicBridgeImpl(config)

# Example usage and testing
async def test_neural_symbolic_bridge():
    """Test the neural-symbolic bridge"""
    from neural_perception_layer import create_neural_perception_layer
    
    config = NeuralSymbolicConfig(
        embedding_dim=256,
        attention_heads=8,
        verbose_logging=True
    )
    
    # Create components
    perception_layer = create_neural_perception_layer(config)
    bridge = create_neural_symbolic_bridge(config)
    
    # Test data
    test_inputs = [
        "If it rains, then the ground is wet",
        "2 + 3 = 5",
        "All birds can fly",
        "Socrates is human"
    ]
    
    print("\n=== Testing Neural-Symbolic Bridge ===")
    
    for input_data in test_inputs:
        print(f"\nTesting: {input_data}")
        
        try:
            # Neural perception
            perception = await perception_layer.perceive(input_data)
            print(f"Neural confidence: {perception.confidence:.3f}")
            
            # Convert to symbolic
            symbolic_repr = await bridge.neural_to_symbolic(perception)
            print(f"Extracted {len(symbolic_repr.facts)} facts and {len(symbolic_repr.symbols)} symbols")
            
            # Convert back to neural
            reconstructed_neural = await bridge.symbolic_to_neural(symbolic_repr)
            print(f"Reconstructed embedding shape: {reconstructed_neural.shape}")
            
            # Check alignment
            alignment_score = await bridge.align_representations(perception, symbolic_repr)
            print(f"Alignment score: {alignment_score:.3f}")
            
            # Show extracted facts
            for fact in symbolic_repr.facts[:3]:  # Show first 3 facts
                print(f"  Fact: {fact.subject} {fact.predicate} {fact.object} (conf: {fact.confidence:.3f})")
            
        except Exception as e:
            print(f"Error: {e}")
    
    # Show bridge statistics
    stats = bridge.get_bridge_stats()
    print(f"\nBridge statistics: {stats}")

if __name__ == "__main__":
    # Run test
    asyncio.run(test_neural_symbolic_bridge())
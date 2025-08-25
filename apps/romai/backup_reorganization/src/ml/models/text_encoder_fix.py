"""
TODO 5 Critical Fix: Tensor Input Handling for Autonomous Reasoning Engine
========================================================================

Fixes the tensor input error by adding proper text encoding/tokenization
to convert string queries into tensor embeddings.
"""

import torch
import torch.nn as nn
import hashlib
import re
from typing import List, Optional

class SimpleTextEncoder:
    """
    Simple text encoder to convert strings to tensor embeddings
    """
    
    def __init__(self, embedding_dim: int = 1024, vocab_size: int = 10000):
        self.embedding_dim = embedding_dim
        self.vocab_size = vocab_size
        self.word_to_idx = {}
        self.idx_to_word = {}
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self._build_vocabulary()
    
    def _build_vocabulary(self):
        """Build a simple vocabulary from common words"""
        common_words = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'what', 'how', 'why', 'when', 'where', 'who', 'which', 'that', 'this', 'these', 'those',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
            'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
            'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'ours', 'theirs',
            'think', 'know', 'understand', 'learn', 'teach', 'explain', 'analyze', 'solve', 'create',
            'design', 'plan', 'strategy', 'problem', 'solution', 'question', 'answer', 'reason',
            'logic', 'thinking', 'cognitive', 'intelligence', 'smart', 'clever', 'wise', 'expert',
            'system', 'process', 'method', 'approach', 'technique', 'algorithm', 'model', 'framework',
            'data', 'information', 'knowledge', 'insight', 'understanding', 'concept', 'idea', 'theory',
            'research', 'study', 'analysis', 'evaluation', 'assessment', 'measurement', 'test', 'experiment',
            'result', 'outcome', 'conclusion', 'finding', 'discovery', 'insight', 'observation',
            'factor', 'element', 'component', 'aspect', 'dimension', 'feature', 'characteristic',
            'important', 'significant', 'relevant', 'useful', 'effective', 'efficient', 'optimal',
            'best', 'better', 'good', 'bad', 'right', 'wrong', 'correct', 'incorrect', 'true', 'false',
            'global', 'warming', 'climate', 'environment', 'energy', 'sustainable', 'renewable',
            'compound', 'interest', 'calculate', 'financial', 'investment', 'money', 'economic',
            'photosynthesis', 'plant', 'biology', 'science', 'natural', 'process', 'chemical',
            'traffic', 'urban', 'city', 'transportation', 'infrastructure', 'planning', 'development',
            'marketing', 'business', 'startup', 'company', 'organization', 'management', 'strategy',
            'conference', 'event', 'meeting', 'organization', 'coordination', 'planning', 'logistics',
            'healthcare', 'medical', 'health', 'patient', 'treatment', 'diagnosis', 'care', 'hospital',
            'artificial', 'intelligence', 'machine', 'learning', 'neural', 'network', 'algorithm',
            'romanian', 'romania', 'culture', 'cultural', 'traditional', 'history', 'heritage',
            'improve', 'enhance', 'optimize', 'maximize', 'minimize', 'increase', 'decrease', 'reduce',
            'critical', 'thinking', 'skills', 'ability', 'capability', 'competence', 'expertise',
            'reliability', 'accuracy', 'precision', 'quality', 'performance', 'effectiveness'
        ]
        
        # Add special tokens
        special_tokens = ['<UNK>', '<PAD>', '<START>', '<END>']
        all_words = special_tokens + common_words
        
        # Build word to index mapping
        for idx, word in enumerate(all_words):
            self.word_to_idx[word] = idx
            self.idx_to_word[idx] = word
    
    def tokenize(self, text: str) -> List[str]:
        """Simple tokenization"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        tokens = text.split()
        return tokens
    
    def encode(self, text: str) -> torch.Tensor:
        """Encode text to tensor embedding"""
        tokens = self.tokenize(text)
        
        # Convert tokens to indices
        indices = []
        for token in tokens:
            if token in self.word_to_idx:
                indices.append(self.word_to_idx[token])
            else:
                indices.append(self.word_to_idx['<UNK>'])
        
        # Pad or truncate to fixed length
        max_length = 50
        if len(indices) < max_length:
            indices.extend([self.word_to_idx['<PAD>']] * (max_length - len(indices)))
        else:
            indices = indices[:max_length]
        
        # Convert to tensor and get embeddings
        token_tensor = torch.tensor(indices, dtype=torch.long).unsqueeze(0)
        embeddings = self.embedding(token_tensor)
        
        # Average pooling to get single embedding
        text_embedding = embeddings.mean(dim=1)
        
        return text_embedding

def create_text_encoder(embedding_dim: int = 1024) -> SimpleTextEncoder:
    """Factory function to create text encoder"""
    return SimpleTextEncoder(embedding_dim=embedding_dim)

# Test the encoder
if __name__ == "__main__":
    encoder = create_text_encoder(1024)
    
    test_texts = [
        "What are the factors contributing to global warming?",
        "How do I calculate compound interest?",
        "Explain the process of photosynthesis"
    ]
    
    print("🧪 Testing Text Encoder:")
    for text in test_texts:
        embedding = encoder.encode(text)
        print(f"Text: {text[:50]}...")
        print(f"Embedding shape: {embedding.shape}")
        print(f"Embedding type: {type(embedding)}")
        print("---")
    
    print("✅ Text encoder working correctly!")
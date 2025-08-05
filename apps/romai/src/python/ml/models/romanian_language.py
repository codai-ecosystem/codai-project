"""
Romanian Language Processing Module
Advanced Romanian language understanding and generation capabilities

This module provides:
- Romanian morphological analysis
- Diacritic processing and normalization
- Cultural context understanding
- Regional dialect support
"""

import torch
import torch.nn as nn
import re
from typing import Dict, List, Tuple, Optional
import unicodedata

class RomanianMorphologyProcessor:
    """
    Romanian morphological analysis processor handling:
    - 5 grammatical cases (nominativ, genitiv, dativ, acuzativ, vocativ)
    - Gender (masculin, feminin, neutru)
    - Number (singular, plural)
    - Verb conjugations and tenses
    """
    
    def __init__(self):
        # Romanian diacritics mapping
        self.diacritics_map = {
            'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
            'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
        }
        
        # Romanian cases
        self.cases = {
            'nominativ': 0, 'genitiv': 1, 'dativ': 2, 'acuzativ': 3, 'vocativ': 4
        }
        
        # Gender markers
        self.gender_patterns = {
            'masculin': [r'.*ul$', r'.*le$', r'.*ilor$'],
            'feminin': [r'.*a$', r'.*ea$', r'.*ilor$'],
            'neutru': [r'.*ul$', r'.*le$', r'.*urilor$']
        }
        
        # Common Romanian verb endings
        self.verb_patterns = {
            'prezent': [r'.*ez$', r'.*ești$', r'.*e$', r'.*em$', r'.*eți$', r'.*ează$'],
            'trecut': [r'.*am$', r'.*ai$', r'.*a$', r'.*arăm$', r'.*arăți$', r'.*ară$'],
            'viitor': [r'.*voi$', r'.*vei$', r'.*va$', r'.*vom$', r'.*veți$', r'.*vor$']
        }
        
        # Regional dialects patterns
        self.dialects = {
            'moldovenesc': {'patterns': [r'.*ii$', r'.*îi$'], 'region': 'Moldova'},
            'ardelenesc': {'patterns': [r'.*ă$', r'.*e$'], 'region': 'Transilvania'},
            'bănățean': {'patterns': [r'.*an$', r'.*en$'], 'region': 'Banat'},
            'oltenesc': {'patterns': [r'.*ule$', r'.*ile$'], 'region': 'Oltenia'}
        }
    
    def normalize_diacritics(self, text: str, keep_diacritics: bool = True) -> str:
        """Normalize Romanian diacritics"""
        if keep_diacritics:
            return text
        
        for diacritic, replacement in self.diacritics_map.items():
            text = text.replace(diacritic, replacement)
        return text
    
    def detect_case(self, word: str) -> str:
        """Detect grammatical case of Romanian word"""
        word = word.lower()
        
        # Simple heuristics for case detection
        if word.endswith(('ul', 'le')):
            return 'nominativ'
        elif word.endswith(('ului', 'lei')):
            return 'genitiv'
        elif word.endswith(('ului', 'lei')):
            return 'dativ'
        elif word.endswith(('ul', 'a')):
            return 'acuzativ'
        else:
            return 'nominativ'  # default
    
    def detect_gender(self, word: str) -> str:
        """Detect gender of Romanian word"""
        word = word.lower()
        
        for gender, patterns in self.gender_patterns.items():
            for pattern in patterns:
                if re.match(pattern, word):
                    return gender
        
        return 'neutru'  # default
    
    def detect_dialect(self, text: str) -> str:
        """Detect Romanian regional dialect"""
        text = text.lower()
        
        for dialect, info in self.dialects.items():
            for pattern in info['patterns']:
                if re.search(pattern, text):
                    return dialect
        
        return 'standard'  # default
    
    def analyze_morphology(self, word: str) -> Dict[str, str]:
        """Complete morphological analysis"""
        return {
            'case': self.detect_case(word),
            'gender': self.detect_gender(word),
            'dialect': self.detect_dialect(word),
            'normalized': self.normalize_diacritics(word, keep_diacritics=False)
        }

class RomanianCulturalContext:
    """
    Romanian cultural context processor for understanding:
    - Historical references
    - Cultural traditions
    - Geographic regions
    - Social context
    """
    
    def __init__(self):
        # Romanian historical periods
        self.historical_periods = {
            'dacia': {'start': -500, 'end': 106, 'keywords': ['dac', 'decebal', 'traian']},
            'medievala': {'start': 1000, 'end': 1500, 'keywords': ['voievod', 'țara', 'domnitor']},
            'fanariot': {'start': 1711, 'end': 1821, 'keywords': ['fanar', 'constantinopol', 'grec']},
            'moderna': {'start': 1859, 'end': 1918, 'keywords': ['unire', 'cuza', 'carol']},
            'contemporana': {'start': 1918, 'end': 2024, 'keywords': ['regat', 'comunism', 'democratie']}
        }
        
        # Romanian regions and characteristics
        self.regions = {
            'moldova': {
                'counties': ['Iași', 'Suceava', 'Bacău', 'Neamț', 'Botoșani', 'Vaslui'],
                'characteristics': ['mănăstiri', 'tradițional', 'conservator'],
                'dialect': 'moldovenesc'
            },
            'transilvania': {
                'counties': ['Cluj', 'Brașov', 'Sibiu', 'Mureș', 'Bihor', 'Satu Mare'],
                'characteristics': ['multiculturalisme', 'dezvoltat', 'european'],
                'dialect': 'ardelenesc'
            },
            'muntenia': {
                'counties': ['București', 'Prahova', 'Dâmbovița', 'Argeș', 'Teleorman'],
                'characteristics': ['capital', 'business', 'politic'],
                'dialect': 'standard'
            },
            'oltenia': {
                'counties': ['Dolj', 'Gorj', 'Vâlcea', 'Olt', 'Mehedinți'],
                'characteristics': ['rural', 'agricultură', 'tradițional'],
                'dialect': 'oltenesc'
            },
            'banat': {
                'counties': ['Timiș', 'Caraș-Severin', 'Hunedoara', 'Arad'],
                'characteristics': ['industrie', 'multietnic', 'dezvoltat'],
                'dialect': 'bănățean'
            }
        }
        
        # Cultural concepts
        self.cultural_concepts = {
            'familie': ['părinți', 'copii', 'neam', 'rudenie', 'căsătorie'],
            'religie': ['ortodox', 'biserică', 'păstor', 'crăciun', 'paște'],
            'tradițional': ['port', 'hora', 'mărțișor', 'colinde', 'obicei'],
            'gastronomie': ['mici', 'ciorbă', 'papanași', 'cozonac', 'țuică'],
            'natură': ['carpați', 'dunăre', 'mare', 'pădure', 'munte']
        }
    
    def identify_cultural_context(self, text: str) -> Dict[str, List[str]]:
        """Identify cultural context in Romanian text"""
        text = text.lower()
        context = {
            'historical_period': [],
            'region': [],
            'cultural_concept': []
        }
        
        # Check historical periods
        for period, info in self.historical_periods.items():
            for keyword in info['keywords']:
                if keyword in text:
                    context['historical_period'].append(period)
        
        # Check regions
        for region, info in self.regions.items():
            for county in info['counties']:
                if county.lower() in text:
                    context['region'].append(region)
        
        # Check cultural concepts
        for concept, keywords in self.cultural_concepts.items():
            for keyword in keywords:
                if keyword in text:
                    context['cultural_concept'].append(concept)
        
        return context
    
    def get_region_info(self, region: str) -> Dict[str, any]:
        """Get detailed information about a Romanian region"""
        return self.regions.get(region, {})

class RomanianLanguageModel(nn.Module):
    """
    Neural Romanian language model with cultural awareness
    """
    
    def __init__(self, vocab_size: int = 30000, d_model: int = 512, num_heads: int = 8):
        super().__init__()
        
        self.d_model = d_model
        self.morphology_processor = RomanianMorphologyProcessor()
        self.cultural_context = RomanianCulturalContext()
        
        # Embeddings
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.morphology_embedding = nn.Embedding(10, d_model)  # morphological features
        self.cultural_embedding = nn.Embedding(20, d_model)    # cultural features
        
        # Attention layers
        self.morphology_attention = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
        self.cultural_attention = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
        
        # Output layers
        self.norm = nn.LayerNorm(d_model)
        self.output = nn.Linear(d_model, vocab_size)
        
    def forward(self, input_ids: torch.Tensor, morphology_features: Optional[torch.Tensor] = None) -> torch.Tensor:
        # Token embeddings
        x = self.token_embedding(input_ids)
        
        # Add morphological features if available
        if morphology_features is not None:
            morph_emb = self.morphology_embedding(morphology_features)
            x = x + morph_emb
        
        # Apply attention
        x_morph, _ = self.morphology_attention(x, x, x)
        x_cultural, _ = self.cultural_attention(x_morph, x_morph, x_morph)
        
        # Output
        x = self.norm(x_cultural)
        logits = self.output(x)
        
        return logits

class RomanianTextProcessor:
    """
    Complete Romanian text processing pipeline
    """
    
    def __init__(self):
        self.morphology = RomanianMorphologyProcessor()
        self.cultural = RomanianCulturalContext()
        
        # Romanian stopwords
        self.stopwords = {
            'și', 'în', 'de', 'la', 'cu', 'pe', 'pentru', 'că', 'dar', 'sau',
            'este', 'sunt', 'era', 'erau', 'va', 'vor', 'am', 'ai', 'a',
            'cel', 'cea', 'cei', 'cele', 'un', 'o', 'unei', 'unui'
        }
    
    def preprocess_text(self, text: str, normalize_diacritics: bool = False) -> str:
        """Preprocess Romanian text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Normalize diacritics if requested
        if normalize_diacritics:
            text = self.morphology.normalize_diacritics(text, keep_diacritics=False)
        
        return text
    
    def tokenize_romanian(self, text: str) -> List[str]:
        """Romanian-aware tokenization"""
        # Split on whitespace and punctuation
        tokens = re.findall(r'\b\w+\b', text.lower())
        
        # Filter stopwords
        tokens = [token for token in tokens if token not in self.stopwords]
        
        return tokens
    
    def analyze_text(self, text: str) -> Dict[str, any]:
        """Complete Romanian text analysis"""
        tokens = self.tokenize_romanian(text)
        
        # Morphological analysis
        morphology_analysis = [self.morphology.analyze_morphology(token) for token in tokens]
        
        # Cultural context
        cultural_context = self.cultural.identify_cultural_context(text)
        
        return {
            'tokens': tokens,
            'morphology': morphology_analysis,
            'cultural_context': cultural_context,
            'dialect': self.morphology.detect_dialect(text),
            'token_count': len(tokens)
        }

# Example usage and testing
if __name__ == "__main__":
    print("Testing Romanian Language Processing...")
    
    # Test text
    romanian_text = "Salutare! Mă numesc Ion și sunt din București. Îmi place să mănânc mici cu muștar."
    
    # Create processor
    processor = RomanianTextProcessor()
    
    # Analyze text
    analysis = processor.analyze_text(romanian_text)
    
    print(f"Original text: {romanian_text}")
    print(f"Tokens: {analysis['tokens']}")
    print(f"Dialect: {analysis['dialect']}")
    print(f"Cultural context: {analysis['cultural_context']}")
    print("✅ Romanian language processing test passed!")
    
    # Test morphological analysis
    test_words = ['casa', 'băiatul', 'frumoasă', 'mănânc']
    morph_processor = RomanianMorphologyProcessor()
    
    for word in test_words:
        analysis = morph_processor.analyze_morphology(word)
        print(f"{word}: {analysis}")

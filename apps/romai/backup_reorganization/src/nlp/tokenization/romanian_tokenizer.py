"""
Advanced Romanian Tokenization System
Sophisticated tokenization with Romanian linguistic awareness and cultural context
"""

import re
import unicodedata
import logging
from typing import List, Dict, Tuple, Optional, Any, Set, NamedTuple
from dataclasses import dataclass
from enum import Enum
import json

logger = logging.getLogger(__name__)

class TokenType(Enum):
    """Token classification types"""
    WORD = "word"
    PUNCTUATION = "punctuation"
    NUMBER = "number"
    WHITESPACE = "whitespace"
    DIACRITIC_WORD = "diacritic_word"
    CULTURAL_TERM = "cultural_term"
    LITERARY_REFERENCE = "literary_reference"
    EMOTIONAL_EXPRESSION = "emotional_expression"
    PROPER_NOUN = "proper_noun"
    COMPOUND_WORD = "compound_word"

class CulturalCategory(Enum):
    """Romanian cultural categories"""
    EMOTION = "emotion"           # dor, nostalgie, bucurie
    TRADITION = "tradition"       # mărțișor, colinde, obiceiuri
    LITERATURE = "literature"     # Eminescu, Blaga, opere
    FOLKLORE = "folklore"         # basme, legende, personaje
    PHILOSOPHY = "philosophy"     # mioritic, fatalism
    HISTORY = "history"           # voievozi, personalități
    RELIGION = "religion"         # ortodoxie, sărbători

@dataclass
class RomanianToken:
    """Enhanced token with Romanian linguistic and cultural information"""
    text: str
    start: int
    end: int
    token_type: TokenType
    
    # Romanian linguistic features
    has_diacritics: bool
    diacritics_restored: Optional[str]
    morphological_info: Optional[Dict[str, Any]]
    
    # Cultural context
    cultural_category: Optional[CulturalCategory]
    cultural_significance: float  # 0.0-1.0
    emotional_valence: Optional[float]  # -1.0 to 1.0
    
    # Romanian-specific attributes
    is_romanian_specific: bool
    literary_association: Optional[str]
    grammatical_case: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert token to dictionary representation"""
        return {
            'text': self.text,
            'start': self.start,
            'end': self.end,
            'token_type': self.token_type.value,
            'has_diacritics': self.has_diacritics,
            'diacritics_restored': self.diacritics_restored,
            'morphological_info': self.morphological_info,
            'cultural_category': self.cultural_category.value if self.cultural_category else None,
            'cultural_significance': self.cultural_significance,
            'emotional_valence': self.emotional_valence,
            'is_romanian_specific': self.is_romanian_specific,
            'literary_association': self.literary_association,
            'grammatical_case': self.grammatical_case
        }

class RomanianTokenizer:
    """Advanced Romanian tokenizer with cultural and linguistic awareness"""
    
    def __init__(self, config_path: Optional[str] = None):
        # Romanian diacritics
        self.romanian_diacritics = {'ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț'}
        
        # Diacritics restoration mapping
        self.diacritics_restoration = {
            # Common patterns for diacritics restoration
            'a': ['ă', 'â'],
            'i': ['î'],
            's': ['ș'],
            't': ['ț'],
            'A': ['Ă', 'Â'],
            'I': ['Î'],
            'S': ['Ș'],
            'T': ['Ț']
        }
        
        # Load cultural knowledge base
        self._load_cultural_knowledge()
        
        # Tokenization patterns
        self._compile_patterns()
        
        logger.info("Romanian tokenizer initialized")
    
    def _load_cultural_knowledge(self):
        """Load Romanian cultural knowledge base"""
        
        # Emotional expressions and their valences
        self.emotional_expressions = {
            # Core Romanian emotions
            'dor': (-0.3, CulturalCategory.EMOTION, 1.0),  # (valence, category, significance)
            'dorul': (-0.3, CulturalCategory.EMOTION, 1.0),
            'dorind': (-0.2, CulturalCategory.EMOTION, 0.8),
            'nostalgie': (-0.4, CulturalCategory.EMOTION, 0.7),
            'melancolic': (-0.5, CulturalCategory.EMOTION, 0.6),
            'bucurie': (0.8, CulturalCategory.EMOTION, 0.8),
            'fericire': (0.9, CulturalCategory.EMOTION, 0.7),
            'tristețe': (-0.6, CulturalCategory.EMOTION, 0.6),
            'mâhnire': (-0.5, CulturalCategory.EMOTION, 0.7),
            'înduioșare': (0.3, CulturalCategory.EMOTION, 0.6)
        }
        
        # Traditional cultural terms
        self.cultural_traditions = {
            'mărțișor': (CulturalCategory.TRADITION, 1.0),
            'paște': (CulturalCategory.TRADITION, 0.9),
            'crăciun': (CulturalCategory.TRADITION, 0.9),
            'bobotează': (CulturalCategory.TRADITION, 0.8),
            'sânziene': (CulturalCategory.TRADITION, 0.8),
            'dragobete': (CulturalCategory.TRADITION, 0.7),
            'colinde': (CulturalCategory.TRADITION, 0.8),
            'plugușor': (CulturalCategory.TRADITION, 0.7),
            'sorcova': (CulturalCategory.TRADITION, 0.7),
            'învârtita': (CulturalCategory.TRADITION, 0.6),
            'horă': (CulturalCategory.TRADITION, 0.7),
            'sărbătoare': (CulturalCategory.TRADITION, 0.6)
        }
        
        # Literary references
        self.literary_references = {
            'eminescu': (CulturalCategory.LITERATURE, 1.0, 'Mihai Eminescu'),
            'mihai eminescu': (CulturalCategory.LITERATURE, 1.0, 'Mihai Eminescu'),
            'luceafărul': (CulturalCategory.LITERATURE, 0.9, 'Eminescu'),
            'scrisoarea': (CulturalCategory.LITERATURE, 0.8, 'Eminescu'),
            'blaga': (CulturalCategory.LITERATURE, 0.9, 'Lucian Blaga'),
            'lucian blaga': (CulturalCategory.LITERATURE, 0.9, 'Lucian Blaga'),
            'coșbuc': (CulturalCategory.LITERATURE, 0.8, 'George Coșbuc'),
            'creangă': (CulturalCategory.LITERATURE, 0.8, 'Ion Creangă'),
            'ion creangă': (CulturalCategory.LITERATURE, 0.8, 'Ion Creangă'),
            'sadoveanu': (CulturalCategory.LITERATURE, 0.8, 'Mihail Sadoveanu'),
            'arghezi': (CulturalCategory.LITERATURE, 0.8, 'Tudor Arghezi'),
            'bacovia': (CulturalCategory.LITERATURE, 0.7, 'George Bacovia'),
            'macedonski': (CulturalCategory.LITERATURE, 0.7, 'Alexandru Macedonski')
        }
        
        # Folklore characters and stories
        self.folklore_elements = {
            'ileana cosânzeana': (CulturalCategory.FOLKLORE, 1.0),
            'cosânzeana': (CulturalCategory.FOLKLORE, 0.9),
            'făt-frumos': (CulturalCategory.FOLKLORE, 0.9),
            'baba dochia': (CulturalCategory.FOLKLORE, 0.8),
            'dochia': (CulturalCategory.FOLKLORE, 0.7),
            'muma pădurii': (CulturalCategory.FOLKLORE, 0.8),
            'iesle': (CulturalCategory.FOLKLORE, 0.7),
            'zmeu': (CulturalCategory.FOLKLORE, 0.7),
            'basme': (CulturalCategory.FOLKLORE, 0.8),
            'povești': (CulturalCategory.FOLKLORE, 0.6),
            'legendă': (CulturalCategory.FOLKLORE, 0.7),
            'mit': (CulturalCategory.FOLKLORE, 0.6)
        }
        
        # Philosophical concepts
        self.philosophical_concepts = {
            'mioritic': (CulturalCategory.PHILOSOPHY, 1.0),
            'spațiu mioritic': (CulturalCategory.PHILOSOPHY, 1.0),
            'fatalism': (CulturalCategory.PHILOSOPHY, 0.8),
            'fatalist': (CulturalCategory.PHILOSOPHY, 0.7),
            'resemnare': (CulturalCategory.PHILOSOPHY, 0.7),
            'contemplație': (CulturalCategory.PHILOSOPHY, 0.6),
            'ortodoxie': (CulturalCategory.RELIGION, 0.8),
            'ortodox': (CulturalCategory.RELIGION, 0.7),
            'creștinism': (CulturalCategory.RELIGION, 0.7),
            'spiritualitate': (CulturalCategory.PHILOSOPHY, 0.6)
        }
        
        # Historical references
        self.historical_references = {
            'mihai viteazul': (CulturalCategory.HISTORY, 0.9),
            'ștefan cel mare': (CulturalCategory.HISTORY, 0.9),
            'vlad țepeș': (CulturalCategory.HISTORY, 0.8),
            'horia': (CulturalCategory.HISTORY, 0.7),
            'cloșca': (CulturalCategory.HISTORY, 0.7),
            'crișan': (CulturalCategory.HISTORY, 0.7),
            'avram iancu': (CulturalCategory.HISTORY, 0.7),
            'tudor vladimirescu': (CulturalCategory.HISTORY, 0.7)
        }
        
        # Combine all cultural knowledge
        self.cultural_knowledge = {}
        self.cultural_knowledge.update(self.cultural_traditions)
        self.cultural_knowledge.update({k: (v[0], v[1]) for k, v in self.literary_references.items()})
        self.cultural_knowledge.update(self.folklore_elements)
        self.cultural_knowledge.update(self.philosophical_concepts)
        self.cultural_knowledge.update(self.historical_references)
        
        logger.info(f"Loaded {len(self.cultural_knowledge)} cultural terms")
    
    def _compile_patterns(self):
        """Compile regular expressions for tokenization"""
        
        # Romanian word pattern (includes diacritics)
        romanian_letters = r'a-zA-ZăâîșțĂÂÎȘȚ'
        self.word_pattern = re.compile(f'[{romanian_letters}]+(?:[-][{romanian_letters}]+)*')
        
        # Compound word patterns
        self.compound_patterns = [
            re.compile(r'[a-zA-ZăâîșțĂÂÎȘȚ]+[-][a-zA-ZăâîșțĂÂÎȘȚ]+'),  # hyphenated compounds
            re.compile(r'[a-zA-ZăâîșțĂÂÎȘȚ]+\s+[a-zA-ZăâîșțĂÂÎȘȚ]+'),   # spaced compounds (cultural terms)
        ]
        
        # Number patterns
        self.number_pattern = re.compile(r'\d+(?:[.,]\d+)*')
        
        # Punctuation pattern
        self.punctuation_pattern = re.compile(r'[^\w\s]')
        
        # Whitespace pattern
        self.whitespace_pattern = re.compile(r'\s+')
        
        # Diacritics pattern for identification
        self.has_diacritics_pattern = re.compile(f'[{"|".join(self.romanian_diacritics)}]')
        
        # Proper noun patterns (Romanian naming conventions)
        self.proper_noun_patterns = [
            re.compile(r'\b[A-ZĂÂÎȘȚa-zA-ZăâîșțĂÂÎȘȚ][a-zA-ZăâîșțĂÂÎȘȚ]*(?:[-\s][A-ZĂÂÎȘȚa-zA-ZăâîșțĂÂÎȘȚ][a-zA-ZăâîșțĂÂÎȘȚ]*)*\b'),
        ]
    
    def _identify_cultural_context(self, text: str, start: int, end: int) -> Tuple[Optional[CulturalCategory], float, Optional[float], Optional[str]]:
        """Identify cultural context for a token"""
        text_lower = text.lower()
        
        # Check emotional expressions first
        if text_lower in self.emotional_expressions:
            valence, category, significance = self.emotional_expressions[text_lower]
            return category, significance, valence, None
        
        # Check cultural knowledge base
        if text_lower in self.cultural_knowledge:
            category, significance = self.cultural_knowledge[text_lower]
            return category, significance, None, None
        
        # Check for literary associations
        for term, (category, significance, author) in self.literary_references.items():
            if term in text_lower:
                return category, significance, None, author
        
        # Check for multi-word cultural expressions
        # This would be extended in a real implementation to consider context
        
        return None, 0.0, None, None
    
    def _restore_diacritics(self, text: str) -> Optional[str]:
        """Attempt to restore Romanian diacritics"""
        if self.has_diacritics_pattern.search(text):
            return None  # Already has diacritics
        
        # Simple restoration rules (would be more sophisticated in practice)
        restored = text
        
        # Common Romanian word patterns
        restoration_rules = [
            # Definite articles
            (r'\bsa\b', 'să'),
            (r'\bsi\b', 'și'),
            (r'\bca\b', 'că'),
            (r'\bin\b', 'în'),
            
            # Common endings
            (r'tia\b', 'ția'),
            (r'tii\b', 'ții'),
            (r'sii\b', 'șii'),
            (r'sant\b', 'șant'),
            
            # Common prefixes and roots
            (r'\brama\b', 'râma'),
            (r'\btar\b', 'țar'),
            (r'ator\b', 'ător'),
            (r'ata\b', 'ată'),
        ]
        
        for pattern, replacement in restoration_rules:
            restored = re.sub(pattern, replacement, restored, flags=re.IGNORECASE)
        
        return restored if restored != text else None
    
    def _determine_token_type(self, text: str, cultural_category: Optional[CulturalCategory]) -> TokenType:
        """Determine the type of token"""
        
        # Check for cultural terms first
        if cultural_category:
            if cultural_category == CulturalCategory.EMOTION:
                return TokenType.EMOTIONAL_EXPRESSION
            elif cultural_category == CulturalCategory.LITERATURE:
                return TokenType.LITERARY_REFERENCE
            else:
                return TokenType.CULTURAL_TERM
        
        # Check for diacritics
        if self.has_diacritics_pattern.search(text):
            return TokenType.DIACRITIC_WORD
        
        # Check if it's a number
        if self.number_pattern.fullmatch(text):
            return TokenType.NUMBER
        
        # Check if it's punctuation
        if self.punctuation_pattern.fullmatch(text):
            return TokenType.PUNCTUATION
        
        # Check if it's whitespace
        if self.whitespace_pattern.fullmatch(text):
            return TokenType.WHITESPACE
        
        # Check for compound words
        if '-' in text or any(pattern.search(text) for pattern in self.compound_patterns):
            return TokenType.COMPOUND_WORD
        
        # Check for proper nouns
        if any(pattern.match(text) for pattern in self.proper_noun_patterns):
            return TokenType.PROPER_NOUN
        
        # Default to word
        return TokenType.WORD
    
    def _extract_morphological_info(self, text: str, token_type: TokenType) -> Optional[Dict[str, Any]]:
        """Extract morphological information (simplified)"""
        if token_type in [TokenType.WHITESPACE, TokenType.PUNCTUATION, TokenType.NUMBER]:
            return None
        
        morpho_info = {
            'length': len(text),
            'is_capitalized': text[0].isupper() if text else False,
            'ends_with_vowel': text[-1].lower() in 'aeiouăâî' if text else False,
            'consonant_clusters': len(re.findall(r'[bcdfghjklmnpqrstvwxzșț]{2,}', text.lower())),
        }
        
        # Romanian-specific morphological patterns
        if text.lower().endswith('ului'):
            morpho_info['case'] = 'genitive_masculine'
        elif text.lower().endswith('lui'):
            morpho_info['case'] = 'dative_masculine'
        elif text.lower().endswith('ilor'):
            morpho_info['case'] = 'genitive_plural'
        elif text.lower().endswith('ești'):
            morpho_info['person'] = '2nd_singular'
        elif text.lower().endswith('ează'):
            morpho_info['person'] = '3rd_singular'
        
        return morpho_info
    
    def tokenize(self, text: str) -> List[RomanianToken]:
        """Advanced tokenization with Romanian linguistic and cultural awareness"""
        tokens = []
        
        # Find all potential tokens using regex
        all_matches = []
        
        # Find words (including compound words and proper nouns)
        for match in self.word_pattern.finditer(text):
            all_matches.append((match.start(), match.end(), match.group()))
        
        # Find numbers
        for match in self.number_pattern.finditer(text):
            if not any(start <= match.start() < end or start < match.end() <= end 
                      for start, end, _ in all_matches):
                all_matches.append((match.start(), match.end(), match.group()))
        
        # Find punctuation
        for match in self.punctuation_pattern.finditer(text):
            if not any(start <= match.start() < end or start < match.end() <= end 
                      for start, end, _ in all_matches):
                all_matches.append((match.start(), match.end(), match.group()))
        
        # Find whitespace
        for match in self.whitespace_pattern.finditer(text):
            if not any(start <= match.start() < end or start < match.end() <= end 
                      for start, end, _ in all_matches):
                all_matches.append((match.start(), match.end(), match.group()))
        
        # Sort matches by position
        all_matches.sort(key=lambda x: x[0])
        
        # Process each match
        for start, end, token_text in all_matches:
            
            # Identify cultural context
            cultural_category, cultural_significance, emotional_valence, literary_association = \
                self._identify_cultural_context(token_text, start, end)
            
            # Determine token type
            token_type = self._determine_token_type(token_text, cultural_category)
            
            # Check for diacritics and attempt restoration
            has_diacritics = bool(self.has_diacritics_pattern.search(token_text))
            diacritics_restored = self._restore_diacritics(token_text) if not has_diacritics else None
            
            # Extract morphological information
            morphological_info = self._extract_morphological_info(token_text, token_type)
            
            # Determine if token is Romanian-specific
            is_romanian_specific = (
                has_diacritics or 
                cultural_category is not None or
                diacritics_restored is not None
            )
            
            # Create token
            token = RomanianToken(
                text=token_text,
                start=start,
                end=end,
                token_type=token_type,
                has_diacritics=has_diacritics,
                diacritics_restored=diacritics_restored,
                morphological_info=morphological_info,
                cultural_category=cultural_category,
                cultural_significance=cultural_significance,
                emotional_valence=emotional_valence,
                is_romanian_specific=is_romanian_specific,
                literary_association=literary_association,
                grammatical_case=morphological_info.get('case') if morphological_info else None
            )
            
            tokens.append(token)
        
        logger.debug(f"Tokenized text into {len(tokens)} tokens")
        return tokens
    
    def get_cultural_tokens(self, tokens: List[RomanianToken]) -> List[RomanianToken]:
        """Extract only culturally significant tokens"""
        return [token for token in tokens if token.cultural_significance > 0.0]
    
    def get_emotional_tokens(self, tokens: List[RomanianToken]) -> List[RomanianToken]:
        """Extract tokens with emotional valence"""
        return [token for token in tokens if token.emotional_valence is not None]
    
    def get_diacritic_tokens(self, tokens: List[RomanianToken]) -> List[RomanianToken]:
        """Extract tokens with Romanian diacritics"""
        return [token for token in tokens if token.has_diacritics or token.diacritics_restored]
    
    def analyze_text_cultural_profile(self, tokens: List[RomanianToken]) -> Dict[str, Any]:
        """Analyze cultural profile of tokenized text"""
        
        total_tokens = len([t for t in tokens if t.token_type != TokenType.WHITESPACE])
        cultural_tokens = self.get_cultural_tokens(tokens)
        emotional_tokens = self.get_emotional_tokens(tokens)
        diacritic_tokens = self.get_diacritic_tokens(tokens)
        
        # Count by cultural categories
        category_counts = {}
        for category in CulturalCategory:
            category_counts[category.value] = len([
                t for t in cultural_tokens if t.cultural_category == category
            ])
        
        # Calculate average emotional valence
        emotional_valences = [t.emotional_valence for t in emotional_tokens if t.emotional_valence is not None]
        avg_emotional_valence = sum(emotional_valences) / len(emotional_valences) if emotional_valences else 0.0
        
        # Calculate cultural density
        cultural_density = len(cultural_tokens) / total_tokens if total_tokens > 0 else 0.0
        
        # Calculate Romanian language authenticity score
        romanian_authenticity = (
            len(diacritic_tokens) + len(cultural_tokens)
        ) / total_tokens if total_tokens > 0 else 0.0
        
        return {
            'total_tokens': total_tokens,
            'cultural_tokens_count': len(cultural_tokens),
            'emotional_tokens_count': len(emotional_tokens),
            'diacritic_tokens_count': len(diacritic_tokens),
            'cultural_density': cultural_density,
            'romanian_authenticity_score': romanian_authenticity,
            'average_emotional_valence': avg_emotional_valence,
            'cultural_categories': category_counts,
            'dominant_cultural_category': max(category_counts.items(), key=lambda x: x[1])[0] if any(category_counts.values()) else None
        }
    
    def tokenize_with_analysis(self, text: str) -> Tuple[List[RomanianToken], Dict[str, Any]]:
        """Tokenize text and return both tokens and cultural analysis"""
        tokens = self.tokenize(text)
        analysis = self.analyze_text_cultural_profile(tokens)
        return tokens, analysis


# Example usage and testing
if __name__ == "__main__":
    # Initialize tokenizer
    tokenizer = RomanianTokenizer()
    
    # Test texts with various Romanian cultural elements
    test_texts = [
        "Dorul este o emoție profundă în sufletul românesc.",
        "Mihai Eminescu a scris 'Luceafărul', o capodoperă a literaturii române.",
        "Mărțișorul se oferă pe 1 martie pentru a aduce noroc și sănătate.",
        "Ileana Cosânzeana și Făt-Frumos sunt personaje din basmele românești.",
        "Spațiul mioritic descris de Lucian Blaga caracterizează mentalitatea românească.",
        "Să mergem la horă și să cântăm colinde de Crăciun!",
        "Text fără diacritice care ar trebui sa fie restaurat."
    ]
    
    print("🇷🇴 Advanced Romanian Tokenizer Test")
    print("="*60)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}: {text}")
        
        # Tokenize with analysis
        tokens, analysis = tokenizer.tokenize_with_analysis(text)
        
        print(f"📊 Analysis:")
        print(f"   Total tokens: {analysis['total_tokens']}")
        print(f"   Cultural tokens: {analysis['cultural_tokens_count']}")
        print(f"   Emotional tokens: {analysis['emotional_tokens_count']}")
        print(f"   Diacritic tokens: {analysis['diacritic_tokens_count']}")
        print(f"   Cultural density: {analysis['cultural_density']:.3f}")
        print(f"   Romanian authenticity: {analysis['romanian_authenticity_score']:.3f}")
        print(f"   Emotional valence: {analysis['average_emotional_valence']:.3f}")
        print(f"   Dominant category: {analysis['dominant_cultural_category']}")
        
        print(f"\n🎯 Cultural Tokens:")
        cultural_tokens = tokenizer.get_cultural_tokens(tokens)
        for token in cultural_tokens:
            print(f"   '{token.text}' -> {token.cultural_category.value if token.cultural_category else 'N/A'} "
                  f"(significance: {token.cultural_significance:.2f})")
        
        print(f"\n💭 Emotional Tokens:")
        emotional_tokens = tokenizer.get_emotional_tokens(tokens)
        for token in emotional_tokens:
            print(f"   '{token.text}' -> valence: {token.emotional_valence:.2f}")
        
        print(f"\n🔤 Diacritic Analysis:")
        diacritic_tokens = tokenizer.get_diacritic_tokens(tokens)
        for token in diacritic_tokens:
            if token.diacritics_restored:
                print(f"   '{token.text}' -> restored: '{token.diacritics_restored}'")
            elif token.has_diacritics:
                print(f"   '{token.text}' -> already has diacritics ✓")
    
    print(f"\n🎉 Advanced Romanian tokenization completed!")
    print(f"Cultural knowledge base: {len(tokenizer.cultural_knowledge)} terms loaded")
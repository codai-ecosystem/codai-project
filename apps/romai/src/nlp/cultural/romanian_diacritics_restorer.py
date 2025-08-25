"""
Romanian Diacritics Restorer
Advanced diacritics restoration and text normalization for Romanian language
"""

import re
import logging
from typing import List, Dict, Tuple, Optional, Any, Set
from dataclasses import dataclass, field
from enum import Enum
import unicodedata
from collections import defaultdict, Counter
import json

logger = logging.getLogger(__name__)

class DiacriticsType(Enum):
    """Types of Romanian diacritics"""
    A_BREVE = "ă"           # ă - a with breve
    A_CIRCUMFLEX = "â"      # â - a with circumflex  
    I_CIRCUMFLEX = "î"      # î - i with circumflex
    S_CEDILLA = "ș"         # ș - s with cedilla
    T_CEDILLA = "ț"         # ț - t with cedilla

class TextQuality(Enum):
    """Text quality levels"""
    EXCELLENT = "excellent"     # All diacritics correct
    GOOD = "good"              # Most diacritics correct  
    FAIR = "fair"              # Some diacritics missing/incorrect
    POOR = "poor"              # Many diacritics missing/incorrect
    CRITICAL = "critical"       # Most diacritics missing/incorrect

@dataclass
class DiacriticsMatch:
    """Match for diacritics restoration"""
    original_word: str
    restored_word: str
    position: int
    confidence: float
    diacritic_type: DiacriticsType
    restoration_method: str
    context_support: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'original_word': self.original_word,
            'restored_word': self.restored_word,
            'position': self.position,
            'confidence': self.confidence,
            'diacritic_type': self.diacritic_type.value,
            'restoration_method': self.restoration_method,
            'context_support': self.context_support
        }

@dataclass
class TextNormalization:
    """Text normalization result"""
    original_text: str
    normalized_text: str
    diacritics_restorations: List[DiacriticsMatch]
    quality_score: float
    quality_level: TextQuality
    
    # Metrics
    total_words: int
    words_with_diacritics: int
    restorations_made: int
    confidence_scores: List[float]
    
    # Analysis
    problematic_words: List[str] = field(default_factory=list)
    uncertain_restorations: List[DiacriticsMatch] = field(default_factory=list)
    cultural_terms_restored: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'original_text': self.original_text,
            'normalized_text': self.normalized_text,
            'diacritics_restorations': [match.to_dict() for match in self.diacritics_restorations],
            'quality_score': self.quality_score,
            'quality_level': self.quality_level.value,
            'total_words': self.total_words,
            'words_with_diacritics': self.words_with_diacritics,
            'restorations_made': self.restorations_made,
            'average_confidence': sum(self.confidence_scores) / len(self.confidence_scores) if self.confidence_scores else 0.0,
            'problematic_words': self.problematic_words,
            'uncertain_restorations': [match.to_dict() for match in self.uncertain_restorations],
            'cultural_terms_restored': self.cultural_terms_restored
        }

class RomanianDiacriticsRestorer:
    """Advanced Romanian diacritics restoration and text normalization"""
    
    def __init__(self):
        # Initialize dictionaries and patterns
        self._load_diacritics_dictionary()
        self._load_context_patterns()
        self._load_morphological_rules()
        self._compile_restoration_patterns()
        
        logger.info("Romanian diacritics restorer initialized")
    
    def _load_diacritics_dictionary(self):
        """Load comprehensive Romanian diacritics dictionary"""
        
        # Common words with their correct diacritical forms
        self.diacritics_dictionary = {
            # Ă replacements
            'ca': 'că',
            'sa': 'să',
            'ma': 'mă',
            'ta': 'tă',
            'la': 'lă',
            'vara': 'văra',
            'primavara': 'primăvara',
            'batran': 'bătrân',
            'barbat': 'bărbat',
            'calator': 'călător',
            'calatorie': 'călătorie',
            'camasa': 'cămaşă',
            'candva': 'cândva',
            'carje': 'cârje',
            'cateva': 'câteva',
            'dupa': 'după',
            'fantana': 'fântână',
            'gramatica': 'gramatică',
            'natura': 'natură',
            'paradis': 'paradis',
            'patrat': 'pătrat',
            'ranit': 'rănit',
            'sarut': 'sărut',
            'tarziu': 'târziu',
            'vanzare': 'vânzare',
            
            # Â/Î replacements
            'cand': 'când',
            'cant': 'cânt',
            'cate': 'câte',
            'cateodata': 'câteodată',
            'cativa': 'câțiva',
            'camp': 'câmp',
            'cand': 'când',
            'candva': 'cândva',
            'carne': 'carne',
            'cat': 'cât',
            'catre': 'către',
            'cauza': 'cauză',
            'ceasca': 'ceașcă',
            'cimpie': 'câmpie',
            'cind': 'când',
            'cineva': 'cineva',
            'cioban': 'cioban',
            'ciocane': 'ciocane',
            'cit': 'cât',
            'clar': 'clar',
            'impotriva': 'împotriva',
            'impreuna': 'împreună',
            'in': 'în',
            'inceput': 'început',
            'incotro': 'încotro',
            'indragostit': 'îndrăgostit',
            'infatisa': 'înfățișa',
            'inima': 'inimă',
            'intelege': 'înțelege',
            'intelepciune': 'înțelepciune',
            'intr-o': 'într-o',
            'intreaga': 'întreagă',
            'intrebat': 'întrebat',
            'intreg': 'întreg',
            'roman': 'român',
            'romania': 'România',
            'romanesc': 'românesc',
            'vant': 'vânt',
            'vanturi': 'vânturi',
            
            # Ș replacements  
            'sansa': 'șansă',
            'scoala': 'școală',
            'sefu': 'șefu',
            'soptit': 'șoptit',
            'soarece': 'șoarece',
            'stiu': 'știu',
            'stire': 'știre',
            'stiinta': 'știință',
            'strada': 'stradă',
            'supus': 'șupus',
            'sase': 'șase',
            'saizeci': 'șaizeci',
            'sapte': 'șapte',
            'saptezeci': 'șaptezeci',
            
            # Ț replacements
            'tara': 'țară',
            'tacut': 'tăcut',
            'tigan': 'țigan',
            'tineri': 'tineri',
            'tipat': 'țipat',
            'turmele': 'turmele',
            'trecutul': 'trecutul',
            'traditie': 'tradiție',
            'transformare': 'transformare',
            'turma': 'turmă',
            'tzuica': 'țuică',
            'tintit': 'țintit'
        }
        
        # Cultural and literary terms
        self.cultural_dictionary = {
            'mioritica': 'mioritică',
            'fatfrumos': 'făt-frumos',
            'ileana': 'ileana',
            'cosanzeana': 'cosânzeana',
            'babaDochia': 'baba dochia',
            'zamolxis': 'zamolxis',
            'decebal': 'decebal',
            'voievod': 'voievod',
            'boier': 'boier',
            'cioban': 'cioban',
            'dor': 'dor',
            'doine': 'doine',
            'hora': 'horă',
            'sarbatoare': 'sărbătoare',
            'martisorul': 'mărțișorul',
            'sanziene': 'sânziene',
            'dragobete': 'dragobete',
            'brancusi': 'brâncuși',
            'enescu': 'enescu',
            'grigorescu': 'grigorescu'
        }
        
        # Merge dictionaries
        self.all_dictionary = {}
        self.all_dictionary.update(self.diacritics_dictionary)
        self.all_dictionary.update(self.cultural_dictionary)
        
        # Create reverse lookup for validation
        self.reverse_dictionary = {v: k for k, v in self.all_dictionary.items()}
    
    def _load_context_patterns(self):
        """Load context patterns that help determine correct diacritics"""
        
        # Patterns that strongly suggest specific diacritics
        self.context_patterns = {
            # Patterns for Ă
            'ă': [
                r'\b(ca|sa|ma|ta|la)\s+(?:să|să)\b',      # că să, să că
                r'\b(?:de|pe|cu|la)\s+(ca|sa|ma|ta)\b',   # de că, pe să
                r'\b(vara|primavara|batran)\b',           # specific words
                r'\b(?:nu|si|dar)\s+(ma|sa|ca)\b'         # nu mă, și să, dar că
            ],
            
            # Patterns for Â/Î
            'â': [
                r'\b(cand|cant|camp|vant)\b',             # când, cânt, câmp, vânt
                r'\b(?:de|pe|in)\s+(cand|cat)\b',         # de când, pe cât
                r'\b(impotriva|impreuna|inceput)\b'       # împotriva, împreună, început
            ],
            
            'î': [
                r'\bin\s+(?:care|caz|timp)\b',            # în care, în caz, în timp
                r'\b(inceput|intelege|intreg)\b',         # început, înțelege, întreg
                r'\b(?:pana|dupa)\s+in\b'                 # până în, după în
            ],
            
            # Patterns for Ș
            'ș': [
                r'\b(scoala|sansa|stiu)\b',               # școală, șansă, știu
                r'\b(?:la|de|cu)\s+(scoala|stiu)\b',     # la școală, de știu
                r'\b(sase|sapte|saizeci)\b'               # șase, șapte, șaizeci
            ],
            
            # Patterns for Ț
            'ț': [
                r'\b(tara|traditie|tigan)\b',             # țară, tradiție, țigan
                r'\b(?:in|de|din)\s+tara\b',             # în țară, de țară
                r'\b(tzuica|tintit)\b'                    # țuică, țintit
            ]
        }
        
        # Compile patterns
        self.compiled_context_patterns = {}
        for diacritic, patterns in self.context_patterns.items():
            self.compiled_context_patterns[diacritic] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
    
    def _load_morphological_rules(self):
        """Load morphological rules for diacritics restoration"""
        
        # Suffix patterns that indicate specific diacritics
        self.morphological_rules = {
            # Feminine endings often use Ă
            'ă_endings': [
                r'(\w+)a\b',      # -a endings often become -ă in certain contexts
                r'(\w+)ea\b',     # -ea endings
            ],
            
            # Past participle patterns
            'past_participle': [
                r'(\w+)at\b',     # -at endings (may need â: -ât)
                r'(\w+)ut\b',     # -ut endings (may need â: -ât)  
                r'(\w+)it\b'      # -it endings
            ],
            
            # Plural patterns
            'plural_endings': [
                r'(\w+)ati\b',    # -ați endings
                r'(\w+)iti\b'     # -iți endings
            ],
            
            # Verb patterns
            'verb_patterns': [
                r'(\w+)esc\b',    # -esc endings
                r'(\w+)ind\b',    # -ind endings (may need â: -ând)
                r'(\w+)and\b'     # -and endings (may need â: -ând)
            ]
        }
        
        # Compile morphological patterns
        self.compiled_morphological_rules = {}
        for category, patterns in self.morphological_rules.items():
            self.compiled_morphological_rules[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
    
    def _compile_restoration_patterns(self):
        """Compile patterns for diacritics detection and restoration"""
        
        # Patterns to identify words that likely need diacritics
        self.needs_diacritics_patterns = [
            # Words with 'a' that likely need 'ă'
            re.compile(r'\b(?:c|s|m|t|l)a\b', re.IGNORECASE),
            re.compile(r'\b\w*[bcdfghjklmnpqrstvwxyz]a\w*\b', re.IGNORECASE),
            
            # Words with 'a' that likely need 'â'
            re.compile(r'\b(?:c|v)a(?:nd|nt|mp|t)\w*\b', re.IGNORECASE),
            
            # Words with 'i' that likely need 'î'  
            re.compile(r'\bin\w*\b', re.IGNORECASE),
            re.compile(r'\b\w*mp\w*\b', re.IGNORECASE),
            
            # Words with 's' that likely need 'ș'
            re.compile(r'\bs(?:coala|ansa|tiu|ase|apte)\w*\b', re.IGNORECASE),
            
            # Words with 't' that likely need 'ț'
            re.compile(r'\bt(?:ara|raditie|igan)\w*\b', re.IGNORECASE)
        ]
        
        # Character mapping for normalization
        self.diacritic_mapping = {
            'a': ['ă', 'â'],
            'i': ['î'],
            's': ['ș'], 
            't': ['ț'],
            'A': ['Ă', 'Â'],
            'I': ['Î'],
            'S': ['Ș'],
            'T': ['Ț']
        }
        
        # Common character substitutions
        self.substitution_mapping = {
            'ţ': 'ț',  # cedilla correction
            'ş': 'ș',  # cedilla correction
            'ã': 'ă',  # tilde to breve
            'Ţ': 'Ț',
            'Ş': 'Ș', 
            'Ã': 'Ă'
        }
    
    def _normalize_substitutions(self, text: str) -> str:
        """Normalize common diacritic substitutions"""
        
        normalized = text
        
        # Apply substitution mapping
        for old_char, new_char in self.substitution_mapping.items():
            normalized = normalized.replace(old_char, new_char)
        
        return normalized
    
    def _get_context_score(self, word: str, text: str, position: int) -> float:
        """Get context score for word diacritics restoration"""
        
        context_score = 0.0
        
        # Get surrounding context (50 characters before and after)
        start = max(0, position - 50)
        end = min(len(text), position + len(word) + 50)
        context = text[start:end].lower()
        
        # Check each diacritic type
        for diacritic, patterns in self.compiled_context_patterns.items():
            for pattern in patterns:
                matches = len(pattern.findall(context))
                if matches > 0:
                    context_score += matches * 0.2
        
        return min(context_score, 1.0)
    
    def _apply_morphological_rules(self, word: str) -> Tuple[Optional[str], float]:
        """Apply morphological rules to restore diacritics"""
        
        word_lower = word.lower()
        
        # Check against morphological patterns
        for category, patterns in self.compiled_morphological_rules.items():
            for pattern in patterns:
                match = pattern.match(word_lower)
                if match:
                    if category == 'ă_endings':
                        if word_lower.endswith('a') and len(word_lower) >= 2:
                            # Common words ending in -a that should be -ă
                            if word_lower in ['casa', 'masa', 'apa', 'vara']:
                                return word[:-1] + 'ă', 0.8
                    
                    elif category == 'past_participle':
                        if word_lower.endswith('at'):
                            return word[:-2] + 'ât', 0.7
                    
                    elif category == 'verb_patterns':
                        if word_lower.endswith('and'):
                            return word[:-3] + 'ând', 0.7
                        elif word_lower.endswith('ind'):
                            return word[:-3] + 'ând', 0.6
        
        return None, 0.0
    
    def _restore_word_diacritics(self, word: str, text: str, position: int) -> Optional[DiacriticsMatch]:
        """Restore diacritics for a single word"""
        
        word_lower = word.lower()
        
        # First check direct dictionary lookup
        if word_lower in self.all_dictionary:
            restored = self.all_dictionary[word_lower]
            
            # Preserve original case
            if word.isupper():
                restored = restored.upper()
            elif word.istitle():
                restored = restored.capitalize()
            
            # Determine diacritic type
            diacritic_type = None
            if 'ă' in restored.lower():
                diacritic_type = DiacriticsType.A_BREVE
            elif 'â' in restored.lower():
                diacritic_type = DiacriticsType.A_CIRCUMFLEX
            elif 'î' in restored.lower():
                diacritic_type = DiacriticsType.I_CIRCUMFLEX
            elif 'ș' in restored.lower():
                diacritic_type = DiacriticsType.S_CEDILLA
            elif 'ț' in restored.lower():
                diacritic_type = DiacriticsType.T_CEDILLA
            
            if diacritic_type:
                context_score = self._get_context_score(word, text, position)
                
                return DiacriticsMatch(
                    original_word=word,
                    restored_word=restored,
                    position=position,
                    confidence=0.9,  # High confidence for dictionary matches
                    diacritic_type=diacritic_type,
                    restoration_method='dictionary_lookup',
                    context_support=context_score
                )
        
        # Try morphological rules
        morphological_result, morphological_confidence = self._apply_morphological_rules(word)
        if morphological_result and morphological_confidence > 0.5:
            
            # Determine diacritic type
            diacritic_type = None
            if 'ă' in morphological_result.lower():
                diacritic_type = DiacriticsType.A_BREVE
            elif 'â' in morphological_result.lower():
                diacritic_type = DiacriticsType.A_CIRCUMFLEX
            elif 'î' in morphological_result.lower():
                diacritic_type = DiacriticsType.I_CIRCUMFLEX
            elif 'ș' in morphological_result.lower():
                diacritic_type = DiacriticsType.S_CEDILLA
            elif 'ț' in morphological_result.lower():
                diacritic_type = DiacriticsType.T_CEDILLA
            
            if diacritic_type:
                context_score = self._get_context_score(word, text, position)
                
                return DiacriticsMatch(
                    original_word=word,
                    restored_word=morphological_result,
                    position=position,
                    confidence=morphological_confidence,
                    diacritic_type=diacritic_type,
                    restoration_method='morphological_rules',
                    context_support=context_score
                )
        
        return None
    
    def _calculate_quality_score(self, total_words: int, restorations_made: int,
                               confidence_scores: List[float]) -> float:
        """Calculate overall text quality score"""
        
        if total_words == 0:
            return 0.0
        
        # Base score from restoration coverage
        restoration_ratio = restorations_made / total_words
        base_score = min(restoration_ratio * 2.0, 1.0)  # Cap at 1.0
        
        # Average confidence score
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        # Combined score
        quality_score = (base_score * 0.6) + (avg_confidence * 0.4)
        
        return min(quality_score, 1.0)
    
    def _determine_quality_level(self, quality_score: float) -> TextQuality:
        """Determine text quality level based on score"""
        
        if quality_score >= 0.9:
            return TextQuality.EXCELLENT
        elif quality_score >= 0.7:
            return TextQuality.GOOD
        elif quality_score >= 0.5:
            return TextQuality.FAIR
        elif quality_score >= 0.3:
            return TextQuality.POOR
        else:
            return TextQuality.CRITICAL
    
    def restore_diacritics(self, text: str, confidence_threshold: float = 0.5) -> TextNormalization:
        """Restore diacritics in Romanian text"""
        
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Normalize substitutions first
        normalized_text = self._normalize_substitutions(text)
        
        # Tokenize text into words with positions
        word_pattern = re.compile(r'\b[a-zA-ZăâîșțĂÂÎȘȚ]+\b')
        words_with_positions = [(match.group(), match.start()) for match in word_pattern.finditer(text)]
        
        # Track restoration data
        restorations = []
        confidence_scores = []
        cultural_terms_restored = []
        problematic_words = []
        uncertain_restorations = []
        
        # Process each word
        restored_text = normalized_text
        offset = 0  # Track position changes due to restorations
        
        for word, position in words_with_positions:
            restoration_match = self._restore_word_diacritics(word, text, position)
            
            if restoration_match and restoration_match.confidence >= confidence_threshold:
                # Apply restoration to text
                actual_position = position + offset
                
                # Replace word in text
                before = restored_text[:actual_position]
                after = restored_text[actual_position + len(word):]
                restored_text = before + restoration_match.restored_word + after
                
                # Update offset for position tracking
                length_diff = len(restoration_match.restored_word) - len(word)
                offset += length_diff
                
                # Track restoration
                restorations.append(restoration_match)
                confidence_scores.append(restoration_match.confidence)
                
                # Check if it's a cultural term
                if word.lower() in self.cultural_dictionary:
                    cultural_terms_restored.append(restoration_match.restored_word)
                
                # Check if uncertain
                if restoration_match.confidence < 0.7:
                    uncertain_restorations.append(restoration_match)
            
            elif word.lower() in self.all_dictionary:
                # Word exists in dictionary but below confidence threshold
                problematic_words.append(word)
        
        # Calculate metrics
        total_words = len(words_with_positions)
        words_with_diacritics = sum(1 for word, _ in words_with_positions 
                                   if any(char in word for char in 'ăâîșțĂÂÎȘȚ'))
        restorations_made = len(restorations)
        
        quality_score = self._calculate_quality_score(total_words, restorations_made, confidence_scores)
        quality_level = self._determine_quality_level(quality_score)
        
        # Create normalization result
        normalization = TextNormalization(
            original_text=text,
            normalized_text=restored_text,
            diacritics_restorations=restorations,
            quality_score=quality_score,
            quality_level=quality_level,
            total_words=total_words,
            words_with_diacritics=words_with_diacritics,
            restorations_made=restorations_made,
            confidence_scores=confidence_scores,
            problematic_words=problematic_words,
            uncertain_restorations=uncertain_restorations,
            cultural_terms_restored=cultural_terms_restored
        )
        
        logger.debug(f"Restored diacritics: {restorations_made} restorations, "
                    f"quality: {quality_level.value} ({quality_score:.3f})")
        
        return normalization
    
    def validate_diacritics(self, text: str) -> Dict[str, Any]:
        """Validate existing diacritics in text"""
        
        results = {
            'total_words': 0,
            'words_with_diacritics': 0,
            'correct_diacritics': 0,
            'incorrect_diacritics': 0,
            'missing_diacritics': 0,
            'accuracy': 0.0,
            'problematic_words': [],
            'suggestions': []
        }
        
        # Tokenize text
        word_pattern = re.compile(r'\b[a-zA-ZăâîșțĂÂÎȘȚ]+\b')
        words = [match.group() for match in word_pattern.finditer(text)]
        results['total_words'] = len(words)
        
        for word in words:
            word_lower = word.lower()
            has_diacritics = any(char in word for char in 'ăâîșțĂÂÎȘȚ')
            
            if has_diacritics:
                results['words_with_diacritics'] += 1
                
                # Check if word is in dictionary with correct diacritics
                if word_lower in self.reverse_dictionary:
                    expected_base = self.reverse_dictionary[word_lower]
                    if expected_base in self.all_dictionary:
                        expected_word = self.all_dictionary[expected_base]
                        if word_lower == expected_word.lower():
                            results['correct_diacritics'] += 1
                        else:
                            results['incorrect_diacritics'] += 1
                            results['problematic_words'].append({
                                'word': word,
                                'suggestion': expected_word,
                                'issue': 'incorrect_diacritics'
                            })
                else:
                    # Check against common patterns
                    restoration_match = self._restore_word_diacritics(word, text, 0)
                    if restoration_match and restoration_match.restored_word.lower() != word_lower:
                        results['incorrect_diacritics'] += 1
                        results['problematic_words'].append({
                            'word': word,
                            'suggestion': restoration_match.restored_word,
                            'issue': 'pattern_mismatch'
                        })
                    else:
                        results['correct_diacritics'] += 1
            else:
                # Check if word should have diacritics
                if word_lower in self.all_dictionary:
                    expected_word = self.all_dictionary[word_lower]
                    if expected_word.lower() != word_lower:
                        results['missing_diacritics'] += 1
                        results['suggestions'].append({
                            'word': word,
                            'suggestion': expected_word,
                            'issue': 'missing_diacritics'
                        })
        
        # Calculate accuracy
        total_diacritic_words = results['words_with_diacritics'] + results['missing_diacritics']
        if total_diacritic_words > 0:
            results['accuracy'] = results['correct_diacritics'] / total_diacritic_words
        
        return results
    
    def normalize_text(self, text: str, restore_diacritics: bool = True,
                      confidence_threshold: float = 0.5) -> str:
        """Complete text normalization with optional diacritics restoration"""
        
        # Basic normalization
        normalized = unicodedata.normalize('NFC', text)
        
        # Fix common substitutions
        normalized = self._normalize_substitutions(normalized)
        
        # Restore diacritics if requested
        if restore_diacritics:
            restoration_result = self.restore_diacritics(normalized, confidence_threshold)
            normalized = restoration_result.normalized_text
        
        return normalized


# Example usage and testing
if __name__ == "__main__":
    # Initialize restorer
    restorer = RomanianDiacriticsRestorer()
    
    # Test texts with missing or incorrect diacritics
    test_texts = [
        "Cand ma gandesc la tara mea, imi amintesc de scoala unde am invatat sa citesc.",
        
        "Stiu ca vara asta voi merge la munte cu prietenii mei din Bucuresti.",
        
        "Batranul cioban isi amintea de timpurile cand cantau doine sub cerul instelat.",
        
        "Eminescu era un poet roman care a scris despre dragostea si natura.",
        
        "Traditiile romanesti sunt foarte frumoase, mai ales sarbatoarele de primavara.",
        
        "In codrii Moldovei traieste o lume plina de povesti si legende vechi."
    ]
    
    print("🔤 Romanian Diacritics Restoration Test")
    print("="*50)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Test {i}:")
        print(f"   Original: {text}")
        
        # Restore diacritics
        result = restorer.restore_diacritics(text)
        
        print(f"   Restored: {result.normalized_text}")
        print(f"   Quality: {result.quality_level.value} ({result.quality_score:.3f})")
        print(f"   Restorations: {result.restorations_made}/{result.total_words} words")
        
        if result.confidence_scores:
            avg_confidence = sum(result.confidence_scores) / len(result.confidence_scores)
            print(f"   Avg confidence: {avg_confidence:.3f}")
        
        if result.cultural_terms_restored:
            print(f"   Cultural terms: {', '.join(result.cultural_terms_restored)}")
        
        # Show individual restorations
        if result.diacritics_restorations:
            print(f"\n   📋 Restorations made:")
            for restoration in result.diacritics_restorations:
                print(f"      • {restoration.original_word} → {restoration.restored_word} "
                      f"[{restoration.diacritic_type.value}] ({restoration.confidence:.2f})")
    
    print(f"\n📊 Validation Test")
    print("="*30)
    
    # Test validation on text with mixed diacritics
    mixed_text = "Această poveste vorbește despre un țăran care știa că primăvara vine întotdeauna."
    
    validation = restorer.validate_diacritics(mixed_text)
    print(f"Text: {mixed_text}")
    print(f"Total words: {validation['total_words']}")
    print(f"Words with diacritics: {validation['words_with_diacritics']}")
    print(f"Correct diacritics: {validation['correct_diacritics']}")
    print(f"Accuracy: {validation['accuracy']:.1%}")
    
    if validation['problematic_words']:
        print(f"Problematic words:")
        for issue in validation['problematic_words']:
            print(f"  • {issue['word']} → {issue['suggestion']} ({issue['issue']})")
    
    print(f"\n✨ Diacritics restoration completed!")
    print(f"Advanced Romanian text normalization with cultural awareness")
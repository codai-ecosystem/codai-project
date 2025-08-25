"""
Romanian Morphological Analysis Engine
Advanced morphological analysis for Romanian language with cultural awareness
"""

import re
import logging
from typing import List, Dict, Tuple, Optional, Any, Set, NamedTuple
from dataclasses import dataclass
from enum import Enum
import json

logger = logging.getLogger(__name__)

class PartOfSpeech(Enum):
    """Romanian parts of speech"""
    NOUN = "noun"                    # substantiv
    VERB = "verb"                    # verb
    ADJECTIVE = "adjective"          # adjectiv
    ADVERB = "adverb"               # adverb
    PRONOUN = "pronoun"             # pronume
    PREPOSITION = "preposition"      # prepoziție
    CONJUNCTION = "conjunction"      # conjuncție
    ARTICLE = "article"             # articol
    INTERJECTION = "interjection"   # interjecție
    NUMERAL = "numeral"             # numeral
    PARTICLE = "particle"           # particulă

class GrammaticalCase(Enum):
    """Romanian grammatical cases"""
    NOMINATIVE = "nominative"       # nominativ
    ACCUSATIVE = "accusative"       # acuzativ
    GENITIVE = "genitive"           # genitiv
    DATIVE = "dative"               # dativ
    VOCATIVE = "vocative"           # vocativ

class GrammaticalNumber(Enum):
    """Romanian grammatical numbers"""
    SINGULAR = "singular"           # singular
    PLURAL = "plural"               # plural

class GrammaticalGender(Enum):
    """Romanian grammatical genders"""
    MASCULINE = "masculine"         # masculin
    FEMININE = "feminine"           # feminin
    NEUTER = "neuter"               # neutru

class VerbMood(Enum):
    """Romanian verb moods"""
    INDICATIVE = "indicative"       # indicativ
    SUBJUNCTIVE = "subjunctive"     # conjunctiv
    IMPERATIVE = "imperative"       # imperativ
    CONDITIONAL = "conditional"     # condițional
    INFINITIVE = "infinitive"       # infinitiv
    GERUND = "gerund"               # gerunziu
    PARTICIPLE = "participle"       # participiu

class VerbTense(Enum):
    """Romanian verb tenses"""
    PRESENT = "present"             # prezent
    IMPERFECT = "imperfect"         # imperfect
    PERFECT = "perfect"             # perfect compus
    PLUPERFECT = "pluperfect"       # mai mult ca perfectul
    FUTURE = "future"               # viitor
    FUTURE_PERFECT = "future_perfect" # viitorul anterior

class Person(Enum):
    """Grammatical persons"""
    FIRST = "first"                 # persoana I
    SECOND = "second"               # persoana II
    THIRD = "third"                 # persoana III

@dataclass
class RomanianMorpheme:
    """Romanian morpheme analysis"""
    text: str
    morpheme_type: str              # root, prefix, suffix, infix
    grammatical_function: Optional[str]
    cultural_significance: float    # 0.0-1.0

@dataclass
class MorphologicalAnalysis:
    """Complete morphological analysis of a Romanian word"""
    word: str
    lemma: str                      # forma de bază
    part_of_speech: PartOfSpeech
    
    # Nominal features
    case: Optional[GrammaticalCase]
    number: Optional[GrammaticalNumber]
    gender: Optional[GrammaticalGender]
    definite: Optional[bool]        # articulated or not
    
    # Verbal features
    mood: Optional[VerbMood]
    tense: Optional[VerbTense]
    person: Optional[Person]
    
    # Morpheme breakdown
    morphemes: List[RomanianMorpheme]
    
    # Romanian-specific features
    has_diacritics: bool
    cultural_morphemes: List[str]   # culturally significant morphemes
    etymology: Optional[str]        # Latin, Slavic, Turkish, etc.
    
    # Confidence score
    confidence: float               # 0.0-1.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary"""
        return {
            'word': self.word,
            'lemma': self.lemma,
            'part_of_speech': self.part_of_speech.value,
            'case': self.case.value if self.case else None,
            'number': self.number.value if self.number else None,
            'gender': self.gender.value if self.gender else None,
            'definite': self.definite,
            'mood': self.mood.value if self.mood else None,
            'tense': self.tense.value if self.tense else None,
            'person': self.person.value if self.person else None,
            'morphemes': [
                {
                    'text': m.text,
                    'type': m.morpheme_type,
                    'function': m.grammatical_function,
                    'cultural_significance': m.cultural_significance
                } for m in self.morphemes
            ],
            'has_diacritics': self.has_diacritics,
            'cultural_morphemes': self.cultural_morphemes,
            'etymology': self.etymology,
            'confidence': self.confidence
        }

class RomanianMorphologicalAnalyzer:
    """Advanced morphological analyzer for Romanian language"""
    
    def __init__(self):
        # Romanian diacritics
        self.romanian_diacritics = {'ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț'}
        
        # Load morphological knowledge
        self._load_morphological_patterns()
        self._load_cultural_morphemes()
        self._load_etymology_patterns()
        
        logger.info("Romanian morphological analyzer initialized")
    
    def _load_morphological_patterns(self):
        """Load Romanian morphological patterns"""
        
        # Noun endings by gender and number
        self.noun_patterns = {
            # Masculine singular
            (GrammaticalGender.MASCULINE, GrammaticalNumber.SINGULAR): [
                r'[bcdfghjklmnpqrstvwxzșț]$',      # consonant endings
                r'u$', r'e$'                       # vowel endings
            ],
            # Masculine plural
            (GrammaticalGender.MASCULINE, GrammaticalNumber.PLURAL): [
                r'i$', r'ii$', r'uri$', r'e$'
            ],
            # Feminine singular
            (GrammaticalGender.FEMININE, GrammaticalNumber.SINGULAR): [
                r'ă$', r'a$', r'e$', r'ie$'
            ],
            # Feminine plural
            (GrammaticalGender.FEMININE, GrammaticalNumber.PLURAL): [
                r'e$', r'i$', r'uri$', r'le$'
            ],
            # Neuter singular (same as masculine)
            (GrammaticalGender.NEUTER, GrammaticalNumber.SINGULAR): [
                r'[bcdfghjklmnpqrstvwxzșț]$', r'u$', r'e$'
            ],
            # Neuter plural (same as feminine)
            (GrammaticalGender.NEUTER, GrammaticalNumber.PLURAL): [
                r'e$', r'i$', r'uri$'
            ]
        }
        
        # Case endings
        self.case_patterns = {
            GrammaticalCase.GENITIVE: {
                GrammaticalGender.MASCULINE: [r'ului$', r'lui$'],
                GrammaticalGender.FEMININE: [r'ei$', r'ii$'],
                GrammaticalGender.NEUTER: [r'ului$', r'lui$']
            },
            GrammaticalCase.DATIVE: {
                GrammaticalGender.MASCULINE: [r'ului$', r'lui$'],
                GrammaticalGender.FEMININE: [r'ei$', r'ii$'],
                GrammaticalGender.NEUTER: [r'ului$', r'lui$']
            },
            GrammaticalCase.VOCATIVE: {
                GrammaticalGender.MASCULINE: [r'e$', r'ule$'],
                GrammaticalGender.FEMININE: [r'o$', r'ă$']
            }
        }
        
        # Verb conjugation patterns
        self.verb_patterns = {
            # Present indicative
            (VerbMood.INDICATIVE, VerbTense.PRESENT): {
                Person.FIRST: {
                    GrammaticalNumber.SINGULAR: [r'(esc|ez|u)$'],
                    GrammaticalNumber.PLURAL: [r'(ăm|im|em)$']
                },
                Person.SECOND: {
                    GrammaticalNumber.SINGULAR: [r'(ești|i)$'],
                    GrammaticalNumber.PLURAL: [r'(ați|iți|eți)$']
                },
                Person.THIRD: {
                    GrammaticalNumber.SINGULAR: [r'(ește|e|ă)$'],
                    GrammaticalNumber.PLURAL: [r'(esc|au)$']
                }
            },
            # Imperfect
            (VerbMood.INDICATIVE, VerbTense.IMPERFECT): {
                Person.FIRST: {
                    GrammaticalNumber.SINGULAR: [r'(am|eam)$'],
                    GrammaticalNumber.PLURAL: [r'(am|eam)$']
                },
                Person.SECOND: {
                    GrammaticalNumber.SINGULAR: [r'(ai|eai)$'],
                    GrammaticalNumber.PLURAL: [r'(ați|eați)$']
                },
                Person.THIRD: {
                    GrammaticalNumber.SINGULAR: [r'(a|ea)$'],
                    GrammaticalNumber.PLURAL: [r'(au|eau)$']
                }
            }
        }
        
        # Adjective patterns
        self.adjective_patterns = {
            GrammaticalGender.MASCULINE: [r'[bcdfghjklmnpqrstvwxzșț]$', r'u$'],
            GrammaticalGender.FEMININE: [r'ă$', r'e$'],
            GrammaticalGender.NEUTER: [r'[bcdfghjklmnpqrstvwxzșț]$', r'u$']
        }
        
        # Articles
        self.definite_articles = {
            'masculine_singular': ['ul', 'le'],
            'feminine_singular': ['a', 'ua'],
            'neuter_singular': ['ul', 'le'],
            'masculine_plural': ['i', 'ii'],
            'feminine_plural': ['le'],
            'neuter_plural': ['le']
        }
        
        # Common prefixes and suffixes
        self.prefixes = {
            'ne-': 'negation',
            're-': 'repetition',
            'pre-': 'before',
            'sub-': 'under',
            'supra-': 'above',
            'anti-': 'against',
            'auto-': 'self',
            'inter-': 'between',
            'ultra-': 'beyond'
        }
        
        self.suffixes = {
            '-esc': 'inchoative_verb_suffix',
            '-ește': '3rd_person_singular',
            '-ător': 'agent_noun_suffix',
            '-tor': 'agent_noun_suffix',
            '-ist': 'profession_suffix',
            '-ism': 'doctrine_suffix',
            '-itate': 'quality_noun_suffix',
            '-iune': 'action_noun_suffix',
            '-ment': 'result_noun_suffix',
            '-os': 'adjective_suffix',
            '-ic': 'adjective_suffix'
        }
    
    def _load_cultural_morphemes(self):
        """Load culturally significant morphemes"""
        
        self.cultural_morphemes = {
            # Romanian cultural roots
            'dor-': ('longing_root', 1.0),
            'drag-': ('love_root', 0.8),
            'miorit-': ('pastoral_root', 0.9),
            'basm-': ('fairy_tale_root', 0.7),
            'colind-': ('carol_root', 0.8),
            'horă-': ('dance_root', 0.7),
            'mărțișor-': ('spring_celebration_root', 0.9),
            
            # Diminutive suffixes (very important in Romanian culture)
            '-uț': ('diminutive_suffix', 0.8),
            '-ică': ('diminutive_suffix', 0.8),
            '-el': ('diminutive_suffix', 0.7),
            '-ică': ('diminutive_suffix', 0.7),
            '-uleț': ('diminutive_suffix', 0.8),
            '-ișor': ('diminutive_suffix', 0.8),
            
            # Augmentative suffixes
            '-oi': ('augmentative_suffix', 0.6),
            '-an': ('augmentative_suffix', 0.6),
            
            # Cultural suffixes
            '-ean': ('origin_suffix', 0.7),
            '-esc': ('characteristic_suffix', 0.6),
            '-ănesc': ('characteristic_suffix', 0.7)
        }
    
    def _load_etymology_patterns(self):
        """Load etymology patterns for Romanian words"""
        
        self.etymology_patterns = {
            # Latin origins (majority of Romanian vocabulary)
            'latin': [
                r'.*[aeiou][rln]e?$',          # Latin-like endings
                r'.*tion$', r'.*sion$',        # -tion/-sion endings
                r'.*[iu]m$',                   # -um endings
                r'.*us$'                       # -us endings
            ],
            
            # Slavic influences
            'slavic': [
                r'.*[čž].*',                   # Slavic consonants
                r'.*ova?$',                    # Slavic endings
                r'.*[nm]ic$',                  # Slavic diminutives
                r'^za.*', r'^pod.*', r'^nad.*' # Slavic prefixes
            ],
            
            # Turkish/Ottoman influences
            'turkish': [
                r'^ch.*', r'^gh.*',            # Turkish initial sounds
                r'.*luc$', r'.*chi$',          # Turkish endings
                r'.*bashi$', r'.*pasha$'       # Turkish titles
            ],
            
            # Hungarian influences
            'hungarian': [
                r'.*var$', r'.*mar$',          # Hungarian place names
                r'.*falva$', r'.*haza$'        # Hungarian village names
            ],
            
            # German influences
            'german': [
                r'.*berg$', r'.*burg$',        # German place endings
                r'.*stein$', r'.*feld$',       # German compound elements
                r'^br.*', r'^schl.*'           # German consonant clusters
            ]
        }
    
    def _identify_morphemes(self, word: str) -> List[RomanianMorpheme]:
        """Break word into morphemes"""
        morphemes = []
        word_lower = word.lower()
        
        # Find prefixes
        for prefix, function in self.prefixes.items():
            if word_lower.startswith(prefix):
                cultural_sig = self.cultural_morphemes.get(prefix, (None, 0.0))[1]
                morphemes.append(RomanianMorpheme(
                    text=prefix,
                    morpheme_type='prefix',
                    grammatical_function=function,
                    cultural_significance=cultural_sig
                ))
                word_lower = word_lower[len(prefix):]
                break
        
        # Find suffixes (work backwards)
        remaining_word = word_lower
        found_suffixes = []
        
        for suffix, function in sorted(self.suffixes.items(), key=len, reverse=True):
            if remaining_word.endswith(suffix):
                cultural_sig = self.cultural_morphemes.get(suffix, (None, 0.0))[1]
                found_suffixes.insert(0, RomanianMorpheme(
                    text=suffix,
                    morpheme_type='suffix',
                    grammatical_function=function,
                    cultural_significance=cultural_sig
                ))
                remaining_word = remaining_word[:-len(suffix)]
                break
        
        # Check for cultural morphemes in remaining root
        root_cultural_sig = 0.0
        for cultural_morpheme, (function, significance) in self.cultural_morphemes.items():
            if cultural_morpheme.endswith('-'):  # prefix
                if remaining_word.startswith(cultural_morpheme[:-1]):
                    root_cultural_sig = max(root_cultural_sig, significance)
            elif cultural_morpheme.startswith('-'):  # suffix
                if remaining_word.endswith(cultural_morpheme[1:]):
                    root_cultural_sig = max(root_cultural_sig, significance)
            else:  # root
                if cultural_morpheme in remaining_word:
                    root_cultural_sig = max(root_cultural_sig, significance)
        
        # Add root morpheme
        if remaining_word:
            morphemes.append(RomanianMorpheme(
                text=remaining_word,
                morpheme_type='root',
                grammatical_function='lexical_root',
                cultural_significance=root_cultural_sig
            ))
        
        # Add found suffixes
        morphemes.extend(found_suffixes)
        
        return morphemes
    
    def _determine_part_of_speech(self, word: str, morphemes: List[RomanianMorpheme]) -> PartOfSpeech:
        """Determine part of speech based on morphemes and patterns"""
        word_lower = word.lower()
        
        # Check for verb patterns
        for (mood, tense), persons in self.verb_patterns.items():
            for person, numbers in persons.items():
                for number, patterns in numbers.items():
                    for pattern in patterns:
                        if re.search(pattern, word_lower):
                            return PartOfSpeech.VERB
        
        # Check suffix-based POS identification
        for morpheme in morphemes:
            if morpheme.morpheme_type == 'suffix':
                if morpheme.grammatical_function in ['agent_noun_suffix', 'action_noun_suffix', 'quality_noun_suffix']:
                    return PartOfSpeech.NOUN
                elif morpheme.grammatical_function in ['adjective_suffix']:
                    return PartOfSpeech.ADJECTIVE
                elif '3rd_person' in morpheme.grammatical_function:
                    return PartOfSpeech.VERB
        
        # Common Romanian articles
        if word_lower in ['un', 'o', 'unei', 'unui', 'niste', 'cel', 'cea', 'cei', 'cele']:
            return PartOfSpeech.ARTICLE
        
        # Common prepositions
        if word_lower in ['de', 'la', 'cu', 'pe', 'în', 'pentru', 'prin', 'după', 'înaintea', 'asupra']:
            return PartOfSpeech.PREPOSITION
        
        # Common conjunctions
        if word_lower in ['și', 'sau', 'dar', 'însă', 'că', 'dacă', 'când', 'unde']:
            return PartOfSpeech.CONJUNCTION
        
        # Default to noun for unknown words (most common in Romanian)
        return PartOfSpeech.NOUN
    
    def _analyze_nominal_features(self, word: str, pos: PartOfSpeech) -> Tuple[Optional[GrammaticalCase], Optional[GrammaticalNumber], Optional[GrammaticalGender], Optional[bool]]:
        """Analyze nominal features (case, number, gender, definiteness)"""
        if pos not in [PartOfSpeech.NOUN, PartOfSpeech.ADJECTIVE, PartOfSpeech.PRONOUN]:
            return None, None, None, None
        
        word_lower = word.lower()
        
        # Check for definite articles
        definite = False
        for gender_number, articles in self.definite_articles.items():
            for article in articles:
                if word_lower.endswith(article):
                    definite = True
                    break
            if definite:
                break
        
        # Analyze case
        case = None
        for case_type, genders in self.case_patterns.items():
            for gender, patterns in genders.items():
                for pattern in patterns:
                    if re.search(pattern, word_lower):
                        case = case_type
                        break
                if case:
                    break
            if case:
                break
        
        # Determine gender and number based on endings
        gender = None
        number = None
        
        for (g, n), patterns in self.noun_patterns.items():
            for pattern in patterns:
                if re.search(pattern, word_lower):
                    gender = g
                    number = n
                    break
            if gender and number:
                break
        
        return case, number, gender, definite
    
    def _analyze_verbal_features(self, word: str, pos: PartOfSpeech) -> Tuple[Optional[VerbMood], Optional[VerbTense], Optional[Person]]:
        """Analyze verbal features (mood, tense, person)"""
        if pos != PartOfSpeech.VERB:
            return None, None, None
        
        word_lower = word.lower()
        
        # Check verb patterns
        for (mood, tense), persons in self.verb_patterns.items():
            for person, numbers in persons.items():
                for number, patterns in numbers.items():
                    for pattern in patterns:
                        if re.search(pattern, word_lower):
                            return mood, tense, person
        
        # Check for infinitive
        if word_lower.endswith(('a', 'ea', 'e', 'i', 'î', 'î')):
            return VerbMood.INFINITIVE, None, None
        
        # Check for gerund
        if word_lower.endswith('and') or word_lower.endswith('ând'):
            return VerbMood.GERUND, None, None
        
        # Check for participle
        if word_lower.endswith('at') or word_lower.endswith('ut') or word_lower.endswith('it'):
            return VerbMood.PARTICIPLE, None, None
        
        return None, None, None
    
    def _determine_etymology(self, word: str, morphemes: List[RomanianMorpheme]) -> Optional[str]:
        """Determine likely etymology of the word"""
        word_lower = word.lower()
        
        # Check each etymology pattern
        for origin, patterns in self.etymology_patterns.items():
            for pattern in patterns:
                if re.search(pattern, word_lower):
                    return origin
        
        # Default to Latin for most Romanian words
        return 'latin'
    
    def _calculate_confidence(self, analysis: MorphologicalAnalysis) -> float:
        """Calculate confidence score for the analysis"""
        confidence = 0.0
        
        # Base confidence from morpheme analysis
        if analysis.morphemes:
            confidence += 0.3
        
        # Confidence from POS identification
        if analysis.part_of_speech:
            confidence += 0.2
        
        # Confidence from nominal features
        if analysis.case or analysis.number or analysis.gender:
            confidence += 0.2
        
        # Confidence from verbal features
        if analysis.mood or analysis.tense or analysis.person:
            confidence += 0.2
        
        # Confidence from cultural significance
        if analysis.cultural_morphemes:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def analyze(self, word: str) -> MorphologicalAnalysis:
        """Perform complete morphological analysis of a Romanian word"""
        
        if not word or not word.strip():
            raise ValueError("Word cannot be empty")
        
        word = word.strip()
        
        # Check for diacritics
        has_diacritics = any(char in self.romanian_diacritics for char in word)
        
        # Identify morphemes
        morphemes = self._identify_morphemes(word)
        
        # Determine part of speech
        pos = self._determine_part_of_speech(word, morphemes)
        
        # Analyze nominal features
        case, number, gender, definite = self._analyze_nominal_features(word, pos)
        
        # Analyze verbal features
        mood, tense, person = self._analyze_verbal_features(word, pos)
        
        # Determine etymology
        etymology = self._determine_etymology(word, morphemes)
        
        # Extract cultural morphemes
        cultural_morphemes = [
            m.text for m in morphemes 
            if m.cultural_significance > 0.0
        ]
        
        # Generate lemma (simplified - would be more sophisticated in practice)
        lemma = self._generate_lemma(word, pos, case, number, gender, mood, tense, person)
        
        # Create analysis
        analysis = MorphologicalAnalysis(
            word=word,
            lemma=lemma,
            part_of_speech=pos,
            case=case,
            number=number,
            gender=gender,
            definite=definite,
            mood=mood,
            tense=tense,
            person=person,
            morphemes=morphemes,
            has_diacritics=has_diacritics,
            cultural_morphemes=cultural_morphemes,
            etymology=etymology,
            confidence=0.0  # Will be calculated
        )
        
        # Calculate confidence
        analysis.confidence = self._calculate_confidence(analysis)
        
        logger.debug(f"Analyzed word '{word}' with confidence {analysis.confidence:.3f}")
        return analysis
    
    def _generate_lemma(self, word: str, pos: PartOfSpeech, case: Optional[GrammaticalCase], 
                       number: Optional[GrammaticalNumber], gender: Optional[GrammaticalGender],
                       mood: Optional[VerbMood], tense: Optional[VerbTense], person: Optional[Person]) -> str:
        """Generate the lemma (base form) of the word"""
        
        # This is a simplified lemmatization - in practice would be much more sophisticated
        word_lower = word.lower()
        
        if pos == PartOfSpeech.VERB:
            # Try to convert to infinitive
            if mood == VerbMood.INFINITIVE:
                return word
            
            # Simple verb lemmatization rules
            if word_lower.endswith('ește'):
                return word_lower[:-4] + 'i'  # 3rd person to infinitive
            elif word_lower.endswith('esc'):
                return word_lower[:-3] + 'i'
            elif word_lower.endswith('ez'):
                return word_lower[:-2] + 'a'
            elif word_lower.endswith('ăm'):
                return word_lower[:-2] + 'a'
        
        elif pos == PartOfSpeech.NOUN:
            # Try to convert to nominative singular
            if number == GrammaticalNumber.PLURAL:
                if word_lower.endswith('i'):
                    return word_lower[:-1]  # Remove plural -i
                elif word_lower.endswith('e'):
                    return word_lower[:-1] + 'ă'  # Feminine plural to singular
                elif word_lower.endswith('uri'):
                    return word_lower[:-3]  # Remove -uri
            
            # Remove definite articles
            if word_lower.endswith('ul'):
                return word_lower[:-2]
            elif word_lower.endswith('a'):
                return word_lower[:-1] + 'ă'
        
        # Default: return original word
        return word
    
    def analyze_batch(self, words: List[str]) -> List[MorphologicalAnalysis]:
        """Analyze multiple words"""
        return [self.analyze(word) for word in words if word.strip()]
    
    def get_cultural_analysis(self, analyses: List[MorphologicalAnalysis]) -> Dict[str, Any]:
        """Get cultural analysis from morphological analyses"""
        
        total_words = len(analyses)
        cultural_words = [a for a in analyses if a.cultural_morphemes]
        diacritic_words = [a for a in analyses if a.has_diacritics]
        
        # Count etymologies
        etymology_counts = {}
        for analysis in analyses:
            if analysis.etymology:
                etymology_counts[analysis.etymology] = etymology_counts.get(analysis.etymology, 0) + 1
        
        # Count parts of speech
        pos_counts = {}
        for analysis in analyses:
            pos = analysis.part_of_speech.value
            pos_counts[pos] = pos_counts.get(pos, 0) + 1
        
        # Calculate cultural density
        cultural_density = len(cultural_words) / total_words if total_words > 0 else 0.0
        
        # Calculate Romanian authenticity
        romanian_authenticity = len(diacritic_words) / total_words if total_words > 0 else 0.0
        
        return {
            'total_words': total_words,
            'cultural_words': len(cultural_words),
            'diacritic_words': len(diacritic_words),
            'cultural_density': cultural_density,
            'romanian_authenticity': romanian_authenticity,
            'etymology_distribution': etymology_counts,
            'pos_distribution': pos_counts,
            'dominant_etymology': max(etymology_counts.items(), key=lambda x: x[1])[0] if etymology_counts else None,
            'dominant_pos': max(pos_counts.items(), key=lambda x: x[1])[0] if pos_counts else None
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = RomanianMorphologicalAnalyzer()
    
    # Test words with various Romanian features
    test_words = [
        "frumos",       # adjective
        "frumoasă",     # adjective feminine
        "dragostea",    # noun with definite article
        "iubește",      # verb 3rd person singular
        "dorește",      # culturally significant verb
        "mărțișorul",   # cultural noun with diminutive
        "căsuța",       # noun with diminutive
        "copilașul",    # noun with diminutive + definite article
        "românește",    # adverb
        "împăratul",    # noun with definite article
        "cântăreț",     # profession noun
        "bucuros",      # adjective with cultural emotion
        "nostalgic",    # adjective with emotion
        "traditional",  # adjective
        "mioritic"      # philosophical adjective
    ]
    
    print("🇷🇴 Romanian Morphological Analysis Test")
    print("="*60)
    
    analyses = []
    for word in test_words:
        print(f"\n📝 Analyzing: '{word}'")
        analysis = analyzer.analyze(word)
        analyses.append(analysis)
        
        print(f"   Lemma: {analysis.lemma}")
        print(f"   POS: {analysis.part_of_speech.value}")
        
        if analysis.case:
            print(f"   Case: {analysis.case.value}")
        if analysis.number:
            print(f"   Number: {analysis.number.value}")
        if analysis.gender:
            print(f"   Gender: {analysis.gender.value}")
        if analysis.definite is not None:
            print(f"   Definite: {analysis.definite}")
        if analysis.mood:
            print(f"   Mood: {analysis.mood.value}")
        if analysis.tense:
            print(f"   Tense: {analysis.tense.value}")
        if analysis.person:
            print(f"   Person: {analysis.person.value}")
        
        print(f"   Etymology: {analysis.etymology}")
        print(f"   Has diacritics: {analysis.has_diacritics}")
        print(f"   Cultural morphemes: {analysis.cultural_morphemes}")
        print(f"   Confidence: {analysis.confidence:.3f}")
        
        print(f"   Morphemes:")
        for morpheme in analysis.morphemes:
            print(f"      '{morpheme.text}' ({morpheme.morpheme_type}) - {morpheme.grammatical_function}")
            if morpheme.cultural_significance > 0:
                print(f"        Cultural significance: {morpheme.cultural_significance:.2f}")
    
    # Cultural analysis
    print(f"\n📊 Cultural Analysis Summary:")
    cultural_analysis = analyzer.get_cultural_analysis(analyses)
    print(f"   Total words analyzed: {cultural_analysis['total_words']}")
    print(f"   Words with cultural morphemes: {cultural_analysis['cultural_words']}")
    print(f"   Words with diacritics: {cultural_analysis['diacritic_words']}")
    print(f"   Cultural density: {cultural_analysis['cultural_density']:.3f}")
    print(f"   Romanian authenticity: {cultural_analysis['romanian_authenticity']:.3f}")
    print(f"   Dominant etymology: {cultural_analysis['dominant_etymology']}")
    print(f"   Dominant POS: {cultural_analysis['dominant_pos']}")
    
    print(f"\n🎉 Morphological analysis completed!")
    print(f"Analyzed {len(analyses)} words with cultural and linguistic awareness")
"""
Romanian Semantic Analyzer
Advanced semantic understanding for Romanian language with cultural consciousness
"""

import re
import logging
import math
from typing import List, Dict, Tuple, Optional, Any, Set, NamedTuple, Union
from dataclasses import dataclass, field
from enum import Enum
import json
import numpy as np
from collections import defaultdict, Counter

# Import from our previous modules
from .advanced_romanian_tokenizer import RomanianToken, RomanianTokenizer, CulturalCategory
from .romanian_morphological_analyzer import MorphologicalAnalysis, RomanianMorphologicalAnalyzer, PartOfSpeech
from .romanian_syntactic_parser import SyntacticAnalysis, RomanianSyntacticParser, SyntacticFunction

logger = logging.getLogger(__name__)

class SemanticRole(Enum):
    """Semantic roles in Romanian"""
    AGENT = "agent"                     # agent
    PATIENT = "patient"                 # patient
    THEME = "theme"                     # tema
    EXPERIENCER = "experiencer"         # experimentator
    BENEFICIARY = "beneficiary"         # beneficiar
    INSTRUMENT = "instrument"           # instrument
    LOCATION = "location"               # locație
    TIME = "time"                       # timp
    MANNER = "manner"                   # mod
    CAUSE = "cause"                     # cauză
    PURPOSE = "purpose"                 # scop

class SemanticFrame(Enum):
    """Romanian semantic frames"""
    MOTION = "motion"                   # mișcare
    EMOTION = "emotion"                 # emoție
    COGNITION = "cognition"             # cogniție
    COMMUNICATION = "communication"     # comunicare
    CREATION = "creation"               # creație
    DESTRUCTION = "destruction"         # distrugere
    POSSESSION = "possession"           # posesie
    EXISTENCE = "existence"             # existență
    CHANGE = "change"                   # schimbare
    CAUSATION = "causation"             # cauzare

class ConceptualDomain(Enum):
    """Romanian conceptual domains"""
    PHYSICAL = "physical"               # fizic
    ABSTRACT = "abstract"               # abstract
    EMOTIONAL = "emotional"             # emoțional
    SOCIAL = "social"                   # social
    CULTURAL = "cultural"               # cultural
    TEMPORAL = "temporal"               # temporal
    SPATIAL = "spatial"                 # spațial
    SPIRITUAL = "spiritual"             # spiritual

@dataclass
class SemanticRelation:
    """Semantic relation between concepts"""
    source: str
    target: str
    relation_type: str
    strength: float                     # 0.0-1.0
    cultural_context: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'source': self.source,
            'target': self.target,
            'relation_type': self.relation_type,
            'strength': self.strength,
            'cultural_context': self.cultural_context
        }

@dataclass
class SemanticConcept:
    """Semantic concept with Romanian cultural awareness"""
    concept: str
    domain: ConceptualDomain
    cultural_significance: float
    
    # Semantic properties
    abstractness: float                 # 0.0 (concrete) - 1.0 (abstract)
    emotionality: float                # 0.0 (neutral) - 1.0 (emotional)
    cultural_specificity: float        # 0.0 (universal) - 1.0 (Romanian-specific)
    
    # Relations to other concepts
    hypernyms: List[str] = field(default_factory=list)        # more general concepts
    hyponyms: List[str] = field(default_factory=list)         # more specific concepts
    synonyms: List[str] = field(default_factory=list)         # similar concepts
    antonyms: List[str] = field(default_factory=list)         # opposite concepts
    
    # Cultural associations
    literary_associations: List[str] = field(default_factory=list)
    folkloric_associations: List[str] = field(default_factory=list)
    historical_associations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'concept': self.concept,
            'domain': self.domain.value,
            'cultural_significance': self.cultural_significance,
            'abstractness': self.abstractness,
            'emotionality': self.emotionality,
            'cultural_specificity': self.cultural_specificity,
            'hypernyms': self.hypernyms,
            'hyponyms': self.hyponyms,
            'synonyms': self.synonyms,
            'antonyms': self.antonyms,
            'literary_associations': self.literary_associations,
            'folkloric_associations': self.folkloric_associations,
            'historical_associations': self.historical_associations
        }

@dataclass
class SemanticFrame:
    """Semantic frame analysis"""
    frame_type: SemanticFrame
    predicate: str
    roles: Dict[SemanticRole, List[str]]
    cultural_pattern: Optional[str] = None
    emotional_valence: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'frame_type': self.frame_type.value,
            'predicate': self.predicate,
            'roles': {role.value: words for role, words in self.roles.items()},
            'cultural_pattern': self.cultural_pattern,
            'emotional_valence': self.emotional_valence
        }

@dataclass
class SemanticAnalysis:
    """Complete semantic analysis of Romanian text"""
    text: str
    
    # Basic analysis components
    syntactic_analysis: SyntacticAnalysis
    
    # Semantic components
    concepts: List[SemanticConcept]
    relations: List[SemanticRelation]
    frames: List[SemanticFrame]
    
    # Discourse analysis
    main_theme: Optional[str]
    emotional_tone: float               # -1.0 (negative) to 1.0 (positive)
    cultural_resonance: float           # 0.0-1.0
    conceptual_complexity: float        # 0.0-1.0
    
    # Romanian-specific analysis
    cultural_patterns: List[str]
    mioritic_elements: List[str]        # Elements of mioritic space
    folkloric_elements: List[str]       # Folkloric references
    literary_echoes: List[str]          # Literary associations
    
    # Metaphorical analysis
    metaphors: List[Dict[str, Any]]
    cultural_metaphors: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'text': self.text,
            'concepts': [concept.to_dict() for concept in self.concepts],
            'relations': [relation.to_dict() for relation in self.relations],
            'frames': [frame.to_dict() for frame in self.frames],
            'main_theme': self.main_theme,
            'emotional_tone': self.emotional_tone,
            'cultural_resonance': self.cultural_resonance,
            'conceptual_complexity': self.conceptual_complexity,
            'cultural_patterns': self.cultural_patterns,
            'mioritic_elements': self.mioritic_elements,
            'folkloric_elements': self.folkloric_elements,
            'literary_echoes': self.literary_echoes,
            'metaphors': self.metaphors,
            'cultural_metaphors': self.cultural_metaphors
        }

class RomanianSemanticAnalyzer:
    """Advanced semantic analyzer for Romanian language"""
    
    def __init__(self):
        # Initialize previous components
        self.syntactic_parser = RomanianSyntacticParser()
        
        # Load semantic knowledge base
        self._load_conceptual_knowledge()
        self._load_semantic_frames()
        self._load_cultural_metaphors()
        self._load_mioritic_patterns()
        
        logger.info("Romanian semantic analyzer initialized")
    
    def _load_conceptual_knowledge(self):
        """Load Romanian conceptual knowledge base"""
        
        # Core Romanian concepts with cultural significance
        self.romanian_concepts = {
            # Core emotional concepts
            'dor': SemanticConcept(
                concept='dor',
                domain=ConceptualDomain.EMOTIONAL,
                cultural_significance=1.0,
                abstractness=0.9,
                emotionality=1.0,
                cultural_specificity=1.0,
                synonyms=['nostalgie', 'dorul', 'îndrăgostire'],
                literary_associations=['Eminescu', 'Blaga', 'poezia românească'],
                cultural_specificity=1.0
            ),
            
            # Spatial concepts
            'spațiu mioritic': SemanticConcept(
                concept='spațiu mioritic',
                domain=ConceptualDomain.CULTURAL,
                cultural_significance=1.0,
                abstractness=0.8,
                emotionality=0.6,
                cultural_specificity=1.0,
                hypernyms=['spațiu', 'concept filosofic'],
                literary_associations=['Lucian Blaga', 'filozofia românească'],
                historical_associations=['gândirea românească', 'identitate națională']
            ),
            
            # Nature concepts
            'codru': SemanticConcept(
                concept='codru',
                domain=ConceptualDomain.PHYSICAL,
                cultural_significance=0.9,
                abstractness=0.2,
                emotionality=0.7,
                cultural_specificity=0.8,
                synonyms=['pădure', 'forest'],
                hyponyms=['stejar', 'fag', 'brad'],
                literary_associations=['literatura românească', 'natură'],
                folkloric_associations=['basme', 'personaje mitice']
            ),
            
            # Social concepts
            'obște': SemanticConcept(
                concept='obște',
                domain=ConceptualDomain.SOCIAL,
                cultural_significance=0.8,
                abstractness=0.7,
                emotionality=0.5,
                cultural_specificity=0.9,
                synonyms=['comunitate', 'colectivitate'],
                historical_associations=['organizare socială tradițională', 'satul românesc']
            ),
            
            # Temporal concepts
            'timp mioritic': SemanticConcept(
                concept='timp mioritic',
                domain=ConceptualDomain.TEMPORAL,
                cultural_significance=0.9,
                abstractness=0.9,
                emotionality=0.6,
                cultural_specificity=1.0,
                hypernyms=['timp', 'concept temporal'],
                literary_associations=['Lucian Blaga', 'filosofie românească']
            ),
            
            # Religious/Spiritual concepts
            'ortodoxie': SemanticConcept(
                concept='ortodoxie',
                domain=ConceptualDomain.SPIRITUAL,
                cultural_significance=0.8,
                abstractness=0.7,
                emotionality=0.6,
                cultural_specificity=0.7,
                hypernyms=['creștinism', 'religie'],
                historical_associations=['biserica română', 'tradiție spirituală']
            )
        }
        
        # Emotional concepts with valences
        self.emotional_concepts = {
            # Positive emotions
            'bucurie': (0.8, 0.9, 0.7),    # (valence, arousal, cultural_significance)
            'fericire': (0.9, 0.8, 0.6),
            'veselie': (0.7, 0.9, 0.7),
            'îndrăgostire': (0.8, 0.9, 0.8),
            'extaz': (0.9, 1.0, 0.6),
            
            # Negative emotions
            'dor': (-0.3, 0.7, 1.0),       # Complex emotion - not purely negative
            'tristețe': (-0.8, 0.6, 0.6),
            'mâhnire': (-0.6, 0.5, 0.8),
            'nostalgie': (-0.4, 0.7, 0.7),
            'melancolie': (-0.5, 0.6, 0.8),
            'desperare': (-0.9, 0.8, 0.6),
            
            # Complex emotions
            'jinduire': (-0.2, 0.8, 0.9),   # Longing with hope
            'duioșie': (0.6, 0.5, 0.8),     # Tenderness
            'înduioșare': (0.5, 0.6, 0.7)   # Being moved emotionally
        }
        
        # Abstract concepts
        self.abstract_concepts = {
            'timp': (ConceptualDomain.TEMPORAL, 0.9, 0.3),
            'spațiu': (ConceptualDomain.SPATIAL, 0.8, 0.2),
            'eternitate': (ConceptualDomain.TEMPORAL, 1.0, 0.5),
            'infinit': (ConceptualDomain.ABSTRACT, 1.0, 0.4),
            'destin': (ConceptualDomain.ABSTRACT, 0.8, 0.7),
            'soartă': (ConceptualDomain.ABSTRACT, 0.8, 0.8),
            'karma': (ConceptualDomain.SPIRITUAL, 0.9, 0.4),
            'mistic': (ConceptualDomain.SPIRITUAL, 0.9, 0.6)
        }
    
    def _load_semantic_frames(self):
        """Load semantic frames for Romanian"""
        
        self.semantic_frames = {
            # Motion frames
            SemanticFrame.MOTION: {
                'verbs': ['merge', 'veni', 'pleca', 'fugi', 'alearga', 'zbuura', 'înota'],
                'roles': {
                    SemanticRole.AGENT: ['subject'],
                    SemanticRole.LOCATION: ['prep_phrase_de_la', 'prep_phrase_din'],
                    SemanticRole.THEME: ['direct_object'],
                    SemanticRole.INSTRUMENT: ['prep_phrase_cu']
                }
            },
            
            # Emotion frames
            SemanticFrame.EMOTION: {
                'verbs': ['iubi', 'ura', 'dori', 'jinduii', 'tânji'],
                'adjectives': ['fericit', 'trist', 'mâhnit', 'bucuros'],
                'roles': {
                    SemanticRole.EXPERIENCER: ['subject', 'dative_pronoun'],
                    SemanticRole.THEME: ['direct_object', 'prep_phrase_pentru'],
                    SemanticRole.CAUSE: ['prep_phrase_din_cauza']
                }
            },
            
            # Communication frames
            SemanticFrame.COMMUNICATION: {
                'verbs': ['vorbi', 'spune', 'povesti', 'cânta', 'striga'],
                'roles': {
                    SemanticRole.AGENT: ['subject'],
                    SemanticRole.PATIENT: ['indirect_object', 'prep_phrase_cu'],
                    SemanticRole.THEME: ['direct_object'],
                    SemanticRole.MANNER: ['adverbial']
                }
            },
            
            # Creation frames
            SemanticFrame.CREATION: {
                'verbs': ['face', 'crea', 'construi', 'zidi', 'clădi'],
                'roles': {
                    SemanticRole.AGENT: ['subject'],
                    SemanticRole.PATIENT: ['direct_object'],
                    SemanticRole.INSTRUMENT: ['prep_phrase_cu'],
                    SemanticRole.BENEFICIARY: ['prep_phrase_pentru']
                }
            },
            
            # Cognition frames
            SemanticFrame.COGNITION: {
                'verbs': ['gândi', 'cunoaște', 'înțelege', 'medita', 'contempla'],
                'roles': {
                    SemanticRole.EXPERIENCER: ['subject'],
                    SemanticRole.THEME: ['direct_object', 'prep_phrase_la'],
                    SemanticRole.MANNER: ['adverbial']
                }
            }
        }
    
    def _load_cultural_metaphors(self):
        """Load Romanian cultural metaphors"""
        
        self.cultural_metaphors = {
            # Nature metaphors (very common in Romanian)
            'floare': {
                'target_domains': ['beauty', 'youth', 'purity', 'femininity'],
                'cultural_significance': 0.9,
                'examples': ['frumoasă ca o floare', 'floarea vârstei']
            },
            
            'codru': {
                'target_domains': ['mystery', 'tradition', 'Romania', 'nature'],
                'cultural_significance': 0.8,
                'examples': ['taina codrilor', 'în codru cu dor']
            },
            
            'munte': {
                'target_domains': ['strength', 'permanence', 'challenge', 'spirituality'],
                'cultural_significance': 0.7,
                'examples': ['tare ca muntele', 'munte de probleme']
            },
            
            # Emotional metaphors
            'inimă': {
                'target_domains': ['emotion', 'love', 'core', 'essence'],
                'cultural_significance': 0.9,
                'examples': ['cu inima deschisă', 'inima țării']
            },
            
            'suflet': {
                'target_domains': ['essence', 'spirituality', 'emotion', 'identity'],
                'cultural_significance': 1.0,
                'examples': ['din suflet', 'suflet românesc']
            },
            
            # Time metaphors
            'ceas': {
                'target_domains': ['time', 'destiny', 'moment'],
                'cultural_significance': 0.6,
                'examples': ['ceasul destinului', 'în ceasul al doisprezecelea']
            },
            
            # Light/darkness metaphors
            'lumină': {
                'target_domains': ['knowledge', 'hope', 'divine', 'good'],
                'cultural_significance': 0.8,
                'examples': ['lumina cunoașterii', 'lumina divină']
            },
            
            'întuneric': {
                'target_domains': ['ignorance', 'evil', 'depression', 'mystery'],
                'cultural_significance': 0.7,
                'examples': ['întunericul sufletului', 'în întunericul nopții']
            }
        }
    
    def _load_mioritic_patterns(self):
        """Load patterns associated with mioritic space"""
        
        self.mioritic_patterns = {
            'spatial_patterns': [
                r'dealuri?\s+line',           # gentle hills
                r'câmp(ii|uri)?\s+întins',    # vast fields
                r'cer\s+senin',               # clear sky
                r'orizont\s+depărtat',        # distant horizon
            ],
            
            'temporal_patterns': [
                r'timp\s+liniștit',           # quiet time
                r'veșnicie',                  # eternity
                r'clipă\s+eternă',            # eternal moment
                r'timpul\s+se\s+oprește',     # time stops
            ],
            
            'emotional_patterns': [
                r'pace\s+sufletească',        # soul peace
                r'liniște\s+interioară',      # inner quiet
                r'contemplație',              # contemplation
                r'melancolie\s+dulce',        # sweet melancholy
            ],
            
            'philosophical_patterns': [
                r'esența\s+lucrurilor',       # essence of things
                r'adevăr\s+etern',            # eternal truth
                r'înțelepciune\s+ancestrală', # ancestral wisdom
                r'mister\s+cosmic',           # cosmic mystery
            ]
        }
        
        # Compile patterns
        self.compiled_mioritic_patterns = {}
        for category, patterns in self.mioritic_patterns.items():
            self.compiled_mioritic_patterns[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
    
    def _extract_concepts(self, syntactic_analysis: SyntacticAnalysis) -> List[SemanticConcept]:
        """Extract semantic concepts from syntactic analysis"""
        
        concepts = []
        
        for node in syntactic_analysis.nodes:
            if not node.text.strip():
                continue
            
            text_lower = node.text.lower()
            
            # Check for known Romanian concepts
            if text_lower in self.romanian_concepts:
                concepts.append(self.romanian_concepts[text_lower])
                continue
            
            # Check for emotional concepts
            if text_lower in self.emotional_concepts:
                valence, arousal, cultural_sig = self.emotional_concepts[text_lower]
                concept = SemanticConcept(
                    concept=text_lower,
                    domain=ConceptualDomain.EMOTIONAL,
                    cultural_significance=cultural_sig,
                    abstractness=0.8,
                    emotionality=arousal,
                    cultural_specificity=cultural_sig
                )
                concepts.append(concept)
                continue
            
            # Check for abstract concepts
            if text_lower in self.abstract_concepts:
                domain, abstractness, emotionality = self.abstract_concepts[text_lower]
                concept = SemanticConcept(
                    concept=text_lower,
                    domain=domain,
                    cultural_significance=0.5,
                    abstractness=abstractness,
                    emotionality=emotionality,
                    cultural_specificity=0.5
                )
                concepts.append(concept)
                continue
            
            # Create concept for culturally significant terms
            if node.cultural_significance > 0:
                concept = SemanticConcept(
                    concept=text_lower,
                    domain=self._infer_conceptual_domain(node),
                    cultural_significance=node.cultural_significance,
                    abstractness=self._estimate_abstractness(text_lower),
                    emotionality=self._estimate_emotionality(text_lower),
                    cultural_specificity=node.cultural_significance
                )
                concepts.append(concept)
        
        return concepts
    
    def _infer_conceptual_domain(self, node) -> ConceptualDomain:
        """Infer conceptual domain from syntactic node"""
        
        if node.token and node.token.cultural_category:
            category = node.token.cultural_category
            
            if category == CulturalCategory.EMOTION:
                return ConceptualDomain.EMOTIONAL
            elif category == CulturalCategory.TRADITION:
                return ConceptualDomain.CULTURAL
            elif category == CulturalCategory.LITERATURE:
                return ConceptualDomain.CULTURAL
            elif category == CulturalCategory.FOLKLORE:
                return ConceptualDomain.CULTURAL
            elif category == CulturalCategory.PHILOSOPHY:
                return ConceptualDomain.ABSTRACT
            elif category == CulturalCategory.HISTORY:
                return ConceptualDomain.SOCIAL
            elif category == CulturalCategory.RELIGION:
                return ConceptualDomain.SPIRITUAL
        
        # Default inference based on POS
        if node.morphology:
            pos = node.morphology.part_of_speech
            
            if pos == PartOfSpeech.NOUN:
                return ConceptualDomain.PHYSICAL  # Default for nouns
            elif pos == PartOfSpeech.ADJECTIVE:
                return ConceptualDomain.ABSTRACT
            elif pos == PartOfSpeech.VERB:
                return ConceptualDomain.ABSTRACT
        
        return ConceptualDomain.ABSTRACT
    
    def _estimate_abstractness(self, word: str) -> float:
        """Estimate abstractness of a concept"""
        
        # Simple heuristics (would be more sophisticated in practice)
        abstract_indicators = ['ție', 'tate', 'ism', 'itate', 'ment', 'al', 'ic']
        concrete_indicators = ['casa', 'masa', 'copac', 'om', 'animal']
        
        if any(word.endswith(indicator) for indicator in abstract_indicators):
            return 0.8
        elif any(indicator in word for indicator in concrete_indicators):
            return 0.2
        else:
            return 0.5  # Default middle value
    
    def _estimate_emotionality(self, word: str) -> float:
        """Estimate emotional content of a concept"""
        
        # Check known emotional words
        if word in self.emotional_concepts:
            return self.emotional_concepts[word][1]  # arousal component
        
        # Simple heuristics
        emotional_suffixes = ['or', 'oare', 'os', 'it']
        if any(word.endswith(suffix) for suffix in emotional_suffixes):
            return 0.7
        
        return 0.3  # Default low emotionality
    
    def _extract_semantic_relations(self, concepts: List[SemanticConcept], 
                                  syntactic_analysis: SyntacticAnalysis) -> List[SemanticRelation]:
        """Extract semantic relations between concepts"""
        
        relations = []
        
        # Extract relations from syntactic dependencies
        for node in syntactic_analysis.nodes:
            if node.head and node.relation:
                source_concept = self._find_concept_for_node(node, concepts)
                target_concept = self._find_concept_for_node(node.head, concepts)
                
                if source_concept and target_concept:
                    relation = SemanticRelation(
                        source=source_concept.concept,
                        target=target_concept.concept,
                        relation_type=self._map_syntactic_to_semantic_relation(node.relation.value),
                        strength=0.7  # Default strength
                    )
                    relations.append(relation)
        
        # Add cultural associations
        for concept in concepts:
            if concept.cultural_significance > 0.7:
                # Add cultural context relations
                for lit_assoc in concept.literary_associations:
                    relation = SemanticRelation(
                        source=concept.concept,
                        target=lit_assoc,
                        relation_type='literary_association',
                        strength=0.8,
                        cultural_context='romanian_literature'
                    )
                    relations.append(relation)
        
        return relations
    
    def _find_concept_for_node(self, node, concepts: List[SemanticConcept]) -> Optional[SemanticConcept]:
        """Find concept corresponding to a syntactic node"""
        node_text = node.text.lower()
        for concept in concepts:
            if concept.concept == node_text:
                return concept
        return None
    
    def _map_syntactic_to_semantic_relation(self, syntactic_relation: str) -> str:
        """Map syntactic relation to semantic relation"""
        mapping = {
            'subordination': 'dependency',
            'coordination': 'coordination',
            'agreement': 'modification',
            'government': 'argument'
        }
        return mapping.get(syntactic_relation, 'related_to')
    
    def _extract_semantic_frames(self, syntactic_analysis: SyntacticAnalysis, 
                               concepts: List[SemanticConcept]) -> List[SemanticFrame]:
        """Extract semantic frames from syntactic analysis"""
        
        frames = []
        
        # Find predicates (verbs) and their arguments
        for node in syntactic_analysis.nodes:
            if (node.syntactic_function == SyntacticFunction.PREDICATE and 
                node.morphology and 
                node.morphology.part_of_speech == PartOfSpeech.VERB):
                
                verb = node.text.lower()
                frame_type = self._identify_frame_type(verb)
                
                if frame_type:
                    # Extract roles from dependents
                    roles = defaultdict(list)
                    
                    for dependent in node.dependents:
                        semantic_role = self._map_syntactic_to_semantic_role(
                            dependent.syntactic_function
                        )
                        if semantic_role:
                            roles[semantic_role].append(dependent.text)
                    
                    # Determine cultural pattern
                    cultural_pattern = self._identify_cultural_frame_pattern(verb, roles)
                    
                    # Estimate emotional valence
                    emotional_valence = self._estimate_frame_emotional_valence(verb, concepts)
                    
                    frame = SemanticFrame(
                        frame_type=frame_type,
                        predicate=verb,
                        roles=dict(roles),
                        cultural_pattern=cultural_pattern,
                        emotional_valence=emotional_valence
                    )
                    frames.append(frame)
        
        return frames
    
    def _identify_frame_type(self, verb: str) -> Optional[SemanticFrame]:
        """Identify semantic frame type for a verb"""
        
        for frame_type, frame_info in self.semantic_frames.items():
            if verb in frame_info.get('verbs', []):
                return frame_type
        
        # Default classification based on verb meaning
        if verb in ['merge', 'veni', 'pleca', 'muta']:
            return SemanticFrame.MOTION
        elif verb in ['iubi', 'ura', 'dori', 'simți']:
            return SemanticFrame.EMOTION
        elif verb in ['spune', 'vorbi', 'cânta', 'striga']:
            return SemanticFrame.COMMUNICATION
        elif verb in ['face', 'crea', 'construi', 'zidi']:
            return SemanticFrame.CREATION
        elif verb in ['gândi', 'cunoaște', 'înțelege']:
            return SemanticFrame.COGNITION
        
        return None
    
    def _map_syntactic_to_semantic_role(self, syntactic_function) -> Optional[SemanticRole]:
        """Map syntactic function to semantic role"""
        
        if not syntactic_function:
            return None
        
        mapping = {
            SyntacticFunction.SUBJECT: SemanticRole.AGENT,
            SyntacticFunction.DIRECT_OBJECT: SemanticRole.PATIENT,
            SyntacticFunction.INDIRECT_OBJECT: SemanticRole.BENEFICIARY,
            SyntacticFunction.CIRCUMSTANTIAL: SemanticRole.MANNER,
            SyntacticFunction.ATTRIBUTE: None  # Attributes don't have semantic roles in this context
        }
        
        return mapping.get(syntactic_function)
    
    def _identify_cultural_frame_pattern(self, verb: str, roles: Dict[SemanticRole, List[str]]) -> Optional[str]:
        """Identify cultural patterns in semantic frames"""
        
        # Romanian-specific patterns
        if verb == 'dori' and SemanticRole.THEME in roles:
            theme = ' '.join(roles[SemanticRole.THEME]).lower()
            if 'acasă' in theme or 'țară' in theme:
                return 'dor_de_acasă_pattern'
        
        if verb in ['jinduii', 'tânji']:
            return 'romanian_longing_pattern'
        
        if verb == 'cânta' and SemanticRole.THEME in roles:
            theme = ' '.join(roles[SemanticRole.THEME]).lower()
            if 'doină' in theme or 'colind' in theme:
                return 'traditional_song_pattern'
        
        return None
    
    def _estimate_frame_emotional_valence(self, verb: str, concepts: List[SemanticConcept]) -> Optional[float]:
        """Estimate emotional valence of a semantic frame"""
        
        if verb in self.emotional_concepts:
            return self.emotional_concepts[verb][0]  # valence component
        
        # Simple heuristics
        positive_verbs = ['iubi', 'bucura', 'ferici', 'îndrăgosti']
        negative_verbs = ['ura', 'întrista', 'plânge', 'suferi']
        
        if any(pos_verb in verb for pos_verb in positive_verbs):
            return 0.7
        elif any(neg_verb in verb for neg_verb in negative_verbs):
            return -0.7
        
        return 0.0  # Neutral
    
    def _detect_metaphors(self, text: str, concepts: List[SemanticConcept]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Detect metaphors and cultural metaphors"""
        
        metaphors = []
        cultural_metaphors = []
        
        text_lower = text.lower()
        
        # Check for cultural metaphors
        for source, metaphor_info in self.cultural_metaphors.items():
            if source in text_lower:
                # This is a simplified detection - in practice would be much more sophisticated
                for target_domain in metaphor_info['target_domains']:
                    cultural_metaphor = {
                        'source': source,
                        'target_domain': target_domain,
                        'cultural_significance': metaphor_info['cultural_significance'],
                        'examples': metaphor_info['examples']
                    }
                    cultural_metaphors.append(cultural_metaphor)
        
        # Detect general metaphors based on conceptual domains
        for concept in concepts:
            if concept.domain == ConceptualDomain.PHYSICAL and concept.abstractness < 0.5:
                # Physical concept used in abstract context might be metaphorical
                if any(abs_concept.abstractness > 0.7 for abs_concept in concepts):
                    metaphor = {
                        'source': concept.concept,
                        'source_domain': concept.domain.value,
                        'target_domain': 'abstract',
                        'cultural_significance': concept.cultural_significance
                    }
                    metaphors.append(metaphor)
        
        return metaphors, cultural_metaphors
    
    def _detect_mioritic_elements(self, text: str) -> List[str]:
        """Detect elements associated with mioritic space"""
        
        mioritic_elements = []
        
        for category, patterns in self.compiled_mioritic_patterns.items():
            for pattern in patterns:
                matches = pattern.finditer(text)
                for match in matches:
                    mioritic_elements.append(f"{category}: {match.group()}")
        
        return mioritic_elements
    
    def _calculate_emotional_tone(self, concepts: List[SemanticConcept], frames: List[SemanticFrame]) -> float:
        """Calculate overall emotional tone of the text"""
        
        total_valence = 0.0
        count = 0
        
        # From emotional concepts
        for concept in concepts:
            if concept.domain == ConceptualDomain.EMOTIONAL:
                concept_name = concept.concept
                if concept_name in self.emotional_concepts:
                    valence = self.emotional_concepts[concept_name][0]
                    weight = concept.cultural_significance
                    total_valence += valence * weight
                    count += 1
        
        # From semantic frames
        for frame in frames:
            if frame.emotional_valence is not None:
                total_valence += frame.emotional_valence
                count += 1
        
        return total_valence / count if count > 0 else 0.0
    
    def _calculate_cultural_resonance(self, concepts: List[SemanticConcept], 
                                   cultural_metaphors: List[Dict[str, Any]],
                                   mioritic_elements: List[str]) -> float:
        """Calculate cultural resonance score"""
        
        resonance = 0.0
        
        # From concepts
        cultural_concepts = [c for c in concepts if c.cultural_significance > 0.5]
        if concepts:
            resonance += (len(cultural_concepts) / len(concepts)) * 0.4
        
        # From cultural metaphors
        if cultural_metaphors:
            avg_metaphor_significance = sum(m['cultural_significance'] for m in cultural_metaphors) / len(cultural_metaphors)
            resonance += avg_metaphor_significance * 0.3
        
        # From mioritic elements
        if mioritic_elements:
            resonance += min(len(mioritic_elements) * 0.1, 0.3)
        
        return min(resonance, 1.0)
    
    def _calculate_conceptual_complexity(self, concepts: List[SemanticConcept], 
                                      relations: List[SemanticRelation]) -> float:
        """Calculate conceptual complexity"""
        
        complexity = 0.0
        
        # From number of concepts
        complexity += min(len(concepts) * 0.05, 0.3)
        
        # From abstractness
        if concepts:
            avg_abstractness = sum(c.abstractness for c in concepts) / len(concepts)
            complexity += avg_abstractness * 0.4
        
        # From relations
        complexity += min(len(relations) * 0.03, 0.3)
        
        return min(complexity, 1.0)
    
    def _identify_main_theme(self, concepts: List[SemanticConcept]) -> Optional[str]:
        """Identify main theme of the text"""
        
        if not concepts:
            return None
        
        # Find most culturally significant concept
        most_significant = max(concepts, key=lambda c: c.cultural_significance)
        
        if most_significant.cultural_significance > 0.7:
            return most_significant.concept
        
        # Find most common domain
        domain_counts = Counter(c.domain for c in concepts)
        most_common_domain = domain_counts.most_common(1)[0][0]
        
        return most_common_domain.value
    
    def analyze(self, text: str) -> SemanticAnalysis:
        """Perform complete semantic analysis of Romanian text"""
        
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Syntactic analysis first
        syntactic_analysis = self.syntactic_parser.parse(text)
        
        # Extract semantic concepts
        concepts = self._extract_concepts(syntactic_analysis)
        
        # Extract semantic relations
        relations = self._extract_semantic_relations(concepts, syntactic_analysis)
        
        # Extract semantic frames
        frames = self._extract_semantic_frames(syntactic_analysis, concepts)
        
        # Detect metaphors
        metaphors, cultural_metaphors = self._detect_metaphors(text, concepts)
        
        # Detect mioritic elements
        mioritic_elements = self._detect_mioritic_elements(text)
        
        # Calculate metrics
        emotional_tone = self._calculate_emotional_tone(concepts, frames)
        cultural_resonance = self._calculate_cultural_resonance(concepts, cultural_metaphors, mioritic_elements)
        conceptual_complexity = self._calculate_conceptual_complexity(concepts, relations)
        main_theme = self._identify_main_theme(concepts)
        
        # Extract other cultural elements
        cultural_patterns = syntactic_analysis.cultural_constructions
        folkloric_elements = [c.concept for c in concepts if 'folkloric_associations' in [a for a in c.folkloric_associations]]
        literary_echoes = [c.concept for c in concepts if 'literary_associations' in [a for a in c.literary_associations]]
        
        # Create analysis
        analysis = SemanticAnalysis(
            text=text,
            syntactic_analysis=syntactic_analysis,
            concepts=concepts,
            relations=relations,
            frames=frames,
            main_theme=main_theme,
            emotional_tone=emotional_tone,
            cultural_resonance=cultural_resonance,
            conceptual_complexity=conceptual_complexity,
            cultural_patterns=cultural_patterns,
            mioritic_elements=mioritic_elements,
            folkloric_elements=folkloric_elements,
            literary_echoes=literary_echoes,
            metaphors=metaphors,
            cultural_metaphors=cultural_metaphors
        )
        
        logger.debug(f"Analyzed text with {len(concepts)} concepts, {len(relations)} relations, {len(frames)} frames")
        return analysis


# Example usage and testing
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = RomanianSemanticAnalyzer()
    
    # Test texts with rich semantic content
    test_texts = [
        "Dorul îmi cuprinde sufletul ca o floare tristă în codrul veșniciei.",
        "În spațiul mioritic al gândului, timpul se oprește din curgere.",
        "Eminescu cânta cu inima plină de nostalgie pentru țara sa.",
        "Luceafărul străbate cerul în căutarea iubirii eterne și pure.",
        "În sânul naturii, omul găsește pacea sufletească și înțelepciunea ancestrală.",
        "Tânjește inima după vremurile de aur ale copilăriei pierdute.",
        "Folclorul românesc păstrează tainele unui popor milenar și înțelept."
    ]
    
    print("🇷🇴 Romanian Semantic Analysis Test")
    print("="*60)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Text {i}: {text}")
        
        # Perform semantic analysis
        analysis = analyzer.analyze(text)
        
        print(f"\n📊 Semantic Analysis:")
        print(f"   Main theme: {analysis.main_theme}")
        print(f"   Emotional tone: {analysis.emotional_tone:.3f}")
        print(f"   Cultural resonance: {analysis.cultural_resonance:.3f}")
        print(f"   Conceptual complexity: {analysis.conceptual_complexity:.3f}")
        
        print(f"\n🧠 Concepts ({len(analysis.concepts)}):")
        for concept in analysis.concepts[:5]:  # Show first 5
            print(f"   • {concept.concept} [{concept.domain.value}] "
                  f"(cultural: {concept.cultural_significance:.2f}, "
                  f"abstract: {concept.abstractness:.2f}, "
                  f"emotional: {concept.emotionality:.2f})")
        
        if analysis.frames:
            print(f"\n⚡ Semantic Frames ({len(analysis.frames)}):")
            for frame in analysis.frames:
                print(f"   • {frame.predicate} [{frame.frame_type.value}]")
                if frame.cultural_pattern:
                    print(f"     Cultural pattern: {frame.cultural_pattern}")
                if frame.emotional_valence is not None:
                    print(f"     Emotional valence: {frame.emotional_valence:.2f}")
        
        if analysis.cultural_metaphors:
            print(f"\n🎭 Cultural Metaphors:")
            for metaphor in analysis.cultural_metaphors:
                print(f"   • {metaphor['source']} → {metaphor['target_domain']} "
                      f"(significance: {metaphor['cultural_significance']:.2f})")
        
        if analysis.mioritic_elements:
            print(f"\n🌄 Mioritic Elements:")
            for element in analysis.mioritic_elements:
                print(f"   • {element}")
        
        if analysis.relations:
            print(f"\n🔗 Semantic Relations ({len(analysis.relations)}):")
            for relation in analysis.relations[:3]:  # Show first 3
                print(f"   • {relation.source} --[{relation.relation_type}]--> {relation.target} "
                      f"(strength: {relation.strength:.2f})")
    
    print(f"\n🎉 Semantic analysis completed!")
    print(f"Advanced Romanian semantic understanding with cultural consciousness")
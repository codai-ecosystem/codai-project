"""
Romanian Syntactic Parser
Advanced syntactic analysis for Romanian language with cultural awareness
"""

import re
import logging
from typing import List, Dict, Tuple, Optional, Any, Set, NamedTuple, Union
from dataclasses import dataclass, field
from enum import Enum
import json

# Import from our previous modules
from .advanced_romanian_tokenizer import RomanianToken, RomanianTokenizer
from .romanian_morphological_analyzer import MorphologicalAnalysis, RomanianMorphologicalAnalyzer, PartOfSpeech

logger = logging.getLogger(__name__)

class SyntacticFunction(Enum):
    """Romanian syntactic functions"""
    SUBJECT = "subject"                    # subiect
    PREDICATE = "predicate"               # predicat
    DIRECT_OBJECT = "direct_object"       # complement direct
    INDIRECT_OBJECT = "indirect_object"   # complement indirect
    ATTRIBUTE = "attribute"               # atribut
    APPOSITION = "apposition"             # apoziție
    CIRCUMSTANTIAL = "circumstantial"     # complement circumstanțial
    VOCATIVE = "vocative"                # vocativ
    PREDICATIVE = "predicative"          # nume predicativ

class SyntacticRelation(Enum):
    """Types of syntactic relations"""
    COORDINATION = "coordination"         # coordonare
    SUBORDINATION = "subordination"      # subordonare  
    APPOSITION = "apposition"           # apoziție
    AGREEMENT = "agreement"             # acordul
    GOVERNMENT = "government"           # regimul

class ClauseType(Enum):
    """Types of clauses in Romanian"""
    MAIN = "main"                       # propoziție principală
    SUBORDINATE = "subordinate"         # propoziție subordonată
    COORDINATE = "coordinate"           # propoziție coordonată
    RELATIVE = "relative"               # propoziție relativă
    COMPLETIVE = "completive"           # propoziție completivă
    CIRCUMSTANTIAL = "circumstantial"   # propoziție circumstanțială

class PhraseType(Enum):
    """Types of phrases"""
    NOUN_PHRASE = "noun_phrase"         # sintagma nominală
    VERB_PHRASE = "verb_phrase"         # sintagma verbală
    ADJECTIVE_PHRASE = "adjective_phrase" # sintagma adjectivală
    ADVERBIAL_PHRASE = "adverbial_phrase" # sintagma adverbială
    PREPOSITIONAL_PHRASE = "prepositional_phrase" # sintagma prepozițională

@dataclass
class SyntacticNode:
    """Node in the syntactic tree"""
    id: int
    text: str
    start: int
    end: int
    
    # Linguistic information
    token: Optional[RomanianToken] = None
    morphology: Optional[MorphologicalAnalysis] = None
    
    # Syntactic information
    syntactic_function: Optional[SyntacticFunction] = None
    phrase_type: Optional[PhraseType] = None
    
    # Tree structure
    parent: Optional['SyntacticNode'] = None
    children: List['SyntacticNode'] = field(default_factory=list)
    
    # Dependencies
    head: Optional['SyntacticNode'] = None
    dependents: List['SyntacticNode'] = field(default_factory=list)
    relation: Optional[SyntacticRelation] = None
    
    # Cultural and semantic information
    cultural_significance: float = 0.0
    semantic_role: Optional[str] = None
    
    def add_child(self, child: 'SyntacticNode'):
        """Add a child node"""
        child.parent = self
        self.children.append(child)
    
    def add_dependent(self, dependent: 'SyntacticNode', relation: SyntacticRelation):
        """Add a dependent with relation"""
        dependent.head = self
        dependent.relation = relation
        self.dependents.append(dependent)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to dictionary"""
        return {
            'id': self.id,
            'text': self.text,
            'start': self.start,
            'end': self.end,
            'syntactic_function': self.syntactic_function.value if self.syntactic_function else None,
            'phrase_type': self.phrase_type.value if self.phrase_type else None,
            'relation': self.relation.value if self.relation else None,
            'cultural_significance': self.cultural_significance,
            'semantic_role': self.semantic_role,
            'children': [child.id for child in self.children],
            'dependents': [dep.id for dep in self.dependents],
            'head_id': self.head.id if self.head else None
        }

@dataclass
class SyntacticClause:
    """Syntactic clause analysis"""
    type: ClauseType
    predicate: Optional[SyntacticNode]
    subject: Optional[SyntacticNode]
    objects: List[SyntacticNode]
    attributes: List[SyntacticNode]
    circumstantials: List[SyntacticNode]
    
    # Cultural aspects
    cultural_pattern: Optional[str] = None
    emotional_tone: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert clause to dictionary"""
        return {
            'type': self.type.value,
            'predicate_id': self.predicate.id if self.predicate else None,
            'subject_id': self.subject.id if self.subject else None,
            'object_ids': [obj.id for obj in self.objects],
            'attribute_ids': [attr.id for attr in self.attributes],
            'circumstantial_ids': [circ.id for circ in self.circumstantials],
            'cultural_pattern': self.cultural_pattern,
            'emotional_tone': self.emotional_tone
        }

@dataclass
class SyntacticAnalysis:
    """Complete syntactic analysis of Romanian text"""
    text: str
    tokens: List[RomanianToken]
    morphologies: List[MorphologicalAnalysis]
    
    # Syntactic structure
    nodes: List[SyntacticNode]
    root: Optional[SyntacticNode]
    clauses: List[SyntacticClause]
    
    # Cultural and stylistic analysis
    sentence_patterns: List[str]
    cultural_constructions: List[str]
    complexity_score: float
    romanian_authenticity: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary"""
        return {
            'text': self.text,
            'nodes': [node.to_dict() for node in self.nodes],
            'root_id': self.root.id if self.root else None,
            'clauses': [clause.to_dict() for clause in self.clauses],
            'sentence_patterns': self.sentence_patterns,
            'cultural_constructions': self.cultural_constructions,
            'complexity_score': self.complexity_score,
            'romanian_authenticity': self.romanian_authenticity
        }

class RomanianSyntacticParser:
    """Advanced syntactic parser for Romanian language"""
    
    def __init__(self):
        # Initialize tokenizer and morphological analyzer
        self.tokenizer = RomanianTokenizer()
        self.morphological_analyzer = RomanianMorphologicalAnalyzer()
        
        # Load syntactic patterns and rules
        self._load_syntactic_patterns()
        self._load_cultural_constructions()
        self._load_dependency_rules()
        
        logger.info("Romanian syntactic parser initialized")
    
    def _load_syntactic_patterns(self):
        """Load Romanian syntactic patterns"""
        
        # Common Romanian sentence patterns
        self.sentence_patterns = {
            'SVO': ['Subject-Verb-Object', 'basic_transitive'],
            'SV': ['Subject-Verb', 'intransitive'],
            'VSO': ['Verb-Subject-Object', 'emphatic_structure'],
            'OVS': ['Object-Verb-Subject', 'topicalization'],
            'SVOO': ['Subject-Verb-Object-Object', 'ditransitive'],
            'SVC': ['Subject-Verb-Complement', 'copular']
        }
        
        # Phrase structure rules for Romanian
        self.phrase_rules = {
            PhraseType.NOUN_PHRASE: [
                ['DET', 'ADJ', 'NOUN'],          # articol + adjectiv + substantiv
                ['DET', 'NOUN', 'ADJ'],          # articol + substantiv + adjectiv
                ['NOUN', 'ADJ'],                 # substantiv + adjectiv
                ['DET', 'NOUN'],                 # articol + substantiv
                ['PRON'],                        # pronume
                ['NOUN']                         # substantiv
            ],
            PhraseType.VERB_PHRASE: [
                ['AUX', 'VERB'],                 # verb auxiliar + verb principal
                ['VERB', 'ADV'],                 # verb + adverb
                ['VERB'],                        # verb simplu
                ['VERB', 'PART']                 # verb + particulă
            ],
            PhraseType.ADJECTIVE_PHRASE: [
                ['ADV', 'ADJ'],                  # adverb + adjectiv
                ['ADJ'],                         # adjectiv simplu
                ['ADJ', 'ADV']                   # adjectiv + adverb
            ],
            PhraseType.PREPOSITIONAL_PHRASE: [
                ['PREP', 'NP'],                  # prepoziție + sintagma nominală
                ['PREP', 'PRON'],                # prepoziție + pronume
                ['PREP', 'ADV']                  # prepoziție + adverb
            ]
        }
        
        # Agreement patterns in Romanian
        self.agreement_patterns = {
            'subject_predicate': ['number', 'person'],
            'noun_adjective': ['gender', 'number', 'case'],
            'noun_article': ['gender', 'number', 'case'],
            'relative_antecedent': ['gender', 'number']
        }
    
    def _load_cultural_constructions(self):
        """Load Romanian cultural syntactic constructions"""
        
        self.cultural_constructions = {
            # Romanian-specific constructions
            'dative_possessive': {
                'pattern': r'(îmi|îți|îi|ne|vă|le)\s+(este|este|sunt|era|erau)',
                'description': 'Romanian dative possessive construction',
                'cultural_significance': 0.8,
                'example': 'îmi este dor'
            },
            
            'presumptive_mood': {
                'pattern': r'(o\s+fi|oi\s+fi|or\s+fi)',
                'description': 'Romanian presumptive mood (unique feature)',
                'cultural_significance': 0.9,
                'example': 'o fi plecat'
            },
            
            'reflexive_passive': {
                'pattern': r'se\s+(face|fac|făcea|făceau)',
                'description': 'Reflexive passive construction',
                'cultural_significance': 0.7,
                'example': 'se face'
            },
            
            'modal_particle_construction': {
                'pattern': r'(să|să\s+nu|să\s+fi)',
                'description': 'Modal particle constructions',
                'cultural_significance': 0.8,
                'example': 'să vii'
            },
            
            'genitival_article': {
                'pattern': r'(al|a|ai|ale)\s+[a-záâîșțăÂÎȘȚ]+',
                'description': 'Genitival article construction',
                'cultural_significance': 0.7,
                'example': 'al meu'
            },
            
            'vocative_particle': {
                'pattern': r'(măi|mă|bre|frate)',
                'description': 'Vocative particles (informal address)',
                'cultural_significance': 0.6,
                'example': 'măi, frate'
            },
            
            'emotional_intensifier': {
                'pattern': r'(ce\s+.+\s+mai|cât\s+de|atât\s+de)',
                'description': 'Emotional intensifier constructions',
                'cultural_significance': 0.7,
                'example': 'ce frumos mai e'
            }
        }
        
        # Compile patterns
        self.compiled_cultural_patterns = {}
        for name, construction in self.cultural_constructions.items():
            self.compiled_cultural_patterns[name] = re.compile(
                construction['pattern'], re.IGNORECASE
            )
    
    def _load_dependency_rules(self):
        """Load dependency parsing rules for Romanian"""
        
        # Dependency relations based on Romanian grammar
        self.dependency_rules = {
            # Subject-predicate relation
            'subject': {
                'head_pos': [PartOfSpeech.VERB],
                'dependent_pos': [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN],
                'conditions': ['nominative_case', 'agreement_number_person']
            },
            
            # Direct object relation
            'direct_object': {
                'head_pos': [PartOfSpeech.VERB],
                'dependent_pos': [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN],
                'conditions': ['accusative_case', 'transitive_verb']
            },
            
            # Indirect object relation
            'indirect_object': {
                'head_pos': [PartOfSpeech.VERB],
                'dependent_pos': [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN],
                'conditions': ['dative_case']
            },
            
            # Attribute relation
            'attribute': {
                'head_pos': [PartOfSpeech.NOUN],
                'dependent_pos': [PartOfSpeech.ADJECTIVE],
                'conditions': ['agreement_gender_number_case']
            },
            
            # Adverbial modifier
            'adverbial': {
                'head_pos': [PartOfSpeech.VERB, PartOfSpeech.ADJECTIVE, PartOfSpeech.ADVERB],
                'dependent_pos': [PartOfSpeech.ADVERB],
                'conditions': []
            },
            
            # Prepositional complement
            'prep_complement': {
                'head_pos': [PartOfSpeech.PREPOSITION],
                'dependent_pos': [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN],
                'conditions': ['case_government']
            }
        }
    
    def _create_syntactic_nodes(self, tokens: List[RomanianToken], 
                              morphologies: List[MorphologicalAnalysis]) -> List[SyntacticNode]:
        """Create syntactic nodes from tokens and morphologies"""
        
        nodes = []
        node_id = 0
        
        for token, morphology in zip(tokens, morphologies):
            # Skip whitespace tokens for syntactic analysis
            if token.text.strip():
                node = SyntacticNode(
                    id=node_id,
                    text=token.text,
                    start=token.start,
                    end=token.end,
                    token=token,
                    morphology=morphology,
                    cultural_significance=token.cultural_significance
                )
                nodes.append(node)
                node_id += 1
        
        return nodes
    
    def _identify_phrases(self, nodes: List[SyntacticNode]) -> List[SyntacticNode]:
        """Identify phrases in the syntactic structure"""
        
        phrase_heads = []
        
        # Simple phrase identification based on POS patterns
        i = 0
        while i < len(nodes):
            node = nodes[i]
            
            # Noun phrase identification
            if (node.morphology and 
                node.morphology.part_of_speech in [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN]):
                
                np_nodes = [node]
                node.phrase_type = PhraseType.NOUN_PHRASE
                
                # Look for determiners before
                if i > 0 and nodes[i-1].morphology:
                    if nodes[i-1].morphology.part_of_speech == PartOfSpeech.ARTICLE:
                        np_nodes.insert(0, nodes[i-1])
                        nodes[i-1].phrase_type = PhraseType.NOUN_PHRASE
                        node.add_child(nodes[i-1])
                
                # Look for adjectives after
                j = i + 1
                while j < len(nodes):
                    if (nodes[j].morphology and 
                        nodes[j].morphology.part_of_speech == PartOfSpeech.ADJECTIVE):
                        np_nodes.append(nodes[j])
                        nodes[j].phrase_type = PhraseType.NOUN_PHRASE
                        node.add_child(nodes[j])
                        j += 1
                    else:
                        break
                
                phrase_heads.append(node)
            
            # Verb phrase identification
            elif (node.morphology and 
                  node.morphology.part_of_speech == PartOfSpeech.VERB):
                
                node.phrase_type = PhraseType.VERB_PHRASE
                
                # Look for auxiliary verbs before
                if i > 0 and nodes[i-1].morphology:
                    if (nodes[i-1].morphology.part_of_speech == PartOfSpeech.VERB and
                        nodes[i-1].text.lower() in ['am', 'ai', 'a', 'am', 'ați', 'au', 
                                                   'eram', 'erai', 'era', 'eram', 'erați', 'erau']):
                        nodes[i-1].phrase_type = PhraseType.VERB_PHRASE
                        node.add_child(nodes[i-1])
                
                # Look for adverbs after
                if i + 1 < len(nodes) and nodes[i+1].morphology:
                    if nodes[i+1].morphology.part_of_speech == PartOfSpeech.ADVERB:
                        nodes[i+1].phrase_type = PhraseType.VERB_PHRASE
                        node.add_child(nodes[i+1])
                
                phrase_heads.append(node)
            
            # Prepositional phrase identification
            elif (node.morphology and 
                  node.morphology.part_of_speech == PartOfSpeech.PREPOSITION):
                
                node.phrase_type = PhraseType.PREPOSITIONAL_PHRASE
                
                # Look for noun phrase after preposition
                if i + 1 < len(nodes):
                    next_node = nodes[i + 1]
                    if (next_node.morphology and 
                        next_node.morphology.part_of_speech in [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN]):
                        node.add_child(next_node)
                        # The preposition heads the PP
                
                phrase_heads.append(node)
            
            i += 1
        
        return phrase_heads
    
    def _identify_syntactic_functions(self, nodes: List[SyntacticNode]) -> None:
        """Identify syntactic functions of nodes"""
        
        # Find the main verb (predicate)
        main_verb = None
        for node in nodes:
            if (node.morphology and 
                node.morphology.part_of_speech == PartOfSpeech.VERB and
                node.morphology.mood in [None, 'indicative', 'subjunctive']):
                main_verb = node
                node.syntactic_function = SyntacticFunction.PREDICATE
                break
        
        if not main_verb:
            return
        
        # Identify subject (nominative noun/pronoun agreeing with verb)
        for node in nodes:
            if (node.morphology and 
                node.morphology.part_of_speech in [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN] and
                node.morphology.case in [None, 'nominative']):
                
                # Check for agreement with verb (simplified)
                if self._check_subject_verb_agreement(node, main_verb):
                    node.syntactic_function = SyntacticFunction.SUBJECT
                    main_verb.add_dependent(node, SyntacticRelation.SUBORDINATION)
                    break
        
        # Identify direct objects (accusative case)
        for node in nodes:
            if (node.morphology and 
                node.morphology.part_of_speech in [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN] and
                node.morphology.case in ['accusative'] and
                node.syntactic_function is None):
                
                node.syntactic_function = SyntacticFunction.DIRECT_OBJECT
                main_verb.add_dependent(node, SyntacticRelation.GOVERNMENT)
        
        # Identify indirect objects (dative case)
        for node in nodes:
            if (node.morphology and 
                node.morphology.part_of_speech in [PartOfSpeech.NOUN, PartOfSpeech.PRONOUN] and
                node.morphology.case in ['dative'] and
                node.syntactic_function is None):
                
                node.syntactic_function = SyntacticFunction.INDIRECT_OBJECT
                main_verb.add_dependent(node, SyntacticRelation.GOVERNMENT)
        
        # Identify attributes (adjectives modifying nouns)
        for node in nodes:
            if (node.morphology and 
                node.morphology.part_of_speech == PartOfSpeech.ADJECTIVE and
                node.syntactic_function is None):
                
                # Find the noun this adjective modifies
                noun_head = self._find_adjective_head(node, nodes)
                if noun_head:
                    node.syntactic_function = SyntacticFunction.ATTRIBUTE
                    noun_head.add_dependent(node, SyntacticRelation.AGREEMENT)
        
        # Identify circumstantials (adverbial modifiers and prepositional phrases)
        for node in nodes:
            if (node.morphology and 
                node.morphology.part_of_speech in [PartOfSpeech.ADVERB, PartOfSpeech.PREPOSITION] and
                node.syntactic_function is None):
                
                node.syntactic_function = SyntacticFunction.CIRCUMSTANTIAL
                main_verb.add_dependent(node, SyntacticRelation.SUBORDINATION)
    
    def _check_subject_verb_agreement(self, subject_node: SyntacticNode, 
                                    verb_node: SyntacticNode) -> bool:
        """Check subject-verb agreement (simplified)"""
        
        if not subject_node.morphology or not verb_node.morphology:
            return False
        
        # Check number agreement
        if (subject_node.morphology.number and verb_node.morphology.person):
            # This is a simplified check - in practice would be more sophisticated
            return True
        
        return False
    
    def _find_adjective_head(self, adj_node: SyntacticNode, 
                           all_nodes: List[SyntacticNode]) -> Optional[SyntacticNode]:
        """Find the noun that an adjective modifies"""
        
        adj_index = all_nodes.index(adj_node)
        
        # Look for nearby nouns
        for i in range(max(0, adj_index - 2), min(len(all_nodes), adj_index + 3)):
            node = all_nodes[i]
            if (node.morphology and 
                node.morphology.part_of_speech == PartOfSpeech.NOUN and
                i != adj_index):
                
                # Check for agreement (simplified)
                if self._check_noun_adjective_agreement(node, adj_node):
                    return node
        
        return None
    
    def _check_noun_adjective_agreement(self, noun_node: SyntacticNode, 
                                      adj_node: SyntacticNode) -> bool:
        """Check noun-adjective agreement"""
        
        if not noun_node.morphology or not adj_node.morphology:
            return False
        
        # Simplified agreement check
        return (noun_node.morphology.gender == adj_node.morphology.gender and
                noun_node.morphology.number == adj_node.morphology.number)
    
    def _identify_clauses(self, nodes: List[SyntacticNode]) -> List[SyntacticClause]:
        """Identify clauses in the sentence"""
        
        clauses = []
        
        # Find all predicates
        predicates = [node for node in nodes if node.syntactic_function == SyntacticFunction.PREDICATE]
        
        for predicate in predicates:
            # Create clause around each predicate
            clause = SyntacticClause(
                type=ClauseType.MAIN,  # Simplified - would determine based on context
                predicate=predicate,
                subject=None,
                objects=[],
                attributes=[],
                circumstantials=[]
            )
            
            # Collect clause constituents from predicate's dependents
            for dependent in predicate.dependents:
                if dependent.syntactic_function == SyntacticFunction.SUBJECT:
                    clause.subject = dependent
                elif dependent.syntactic_function == SyntacticFunction.DIRECT_OBJECT:
                    clause.objects.append(dependent)
                elif dependent.syntactic_function == SyntacticFunction.INDIRECT_OBJECT:
                    clause.objects.append(dependent)
                elif dependent.syntactic_function == SyntacticFunction.CIRCUMSTANTIAL:
                    clause.circumstantials.append(dependent)
            
            clauses.append(clause)
        
        return clauses
    
    def _detect_cultural_patterns(self, text: str, nodes: List[SyntacticNode]) -> Tuple[List[str], List[str]]:
        """Detect Romanian cultural syntactic patterns"""
        
        detected_constructions = []
        sentence_patterns = []
        
        # Check for cultural constructions
        for name, pattern in self.compiled_cultural_patterns.items():
            if pattern.search(text):
                construction = self.cultural_constructions[name]
                detected_constructions.append(f"{name}: {construction['description']}")
        
        # Analyze sentence pattern (simplified)
        predicates = [n for n in nodes if n.syntactic_function == SyntacticFunction.PREDICATE]
        subjects = [n for n in nodes if n.syntactic_function == SyntacticFunction.SUBJECT]
        objects = [n for n in nodes if n.syntactic_function in [SyntacticFunction.DIRECT_OBJECT, SyntacticFunction.INDIRECT_OBJECT]]
        
        if predicates:
            if subjects and objects:
                sentence_patterns.append('SVO')
            elif subjects:
                sentence_patterns.append('SV')
            elif objects:
                sentence_patterns.append('VO')
        
        return detected_constructions, sentence_patterns
    
    def _calculate_complexity_score(self, nodes: List[SyntacticNode], 
                                   clauses: List[SyntacticClause]) -> float:
        """Calculate syntactic complexity score"""
        
        complexity = 0.0
        
        # Base complexity from number of nodes
        complexity += len(nodes) * 0.1
        
        # Complexity from number of clauses
        complexity += len(clauses) * 0.3
        
        # Complexity from dependency depth
        max_depth = 0
        for node in nodes:
            depth = self._calculate_dependency_depth(node)
            max_depth = max(max_depth, depth)
        
        complexity += max_depth * 0.2
        
        # Complexity from cultural constructions
        for node in nodes:
            if node.cultural_significance > 0:
                complexity += 0.1
        
        return min(complexity, 1.0)
    
    def _calculate_dependency_depth(self, node: SyntacticNode) -> int:
        """Calculate the dependency depth of a node"""
        depth = 0
        current = node
        while current.head:
            depth += 1
            current = current.head
        return depth
    
    def _calculate_romanian_authenticity(self, nodes: List[SyntacticNode]) -> float:
        """Calculate Romanian language authenticity score"""
        
        authenticity = 0.0
        total_nodes = len([n for n in nodes if n.text.strip()])
        
        if total_nodes == 0:
            return 0.0
        
        # Count Romanian-specific features
        diacritic_nodes = sum(1 for n in nodes if n.token and n.token.has_diacritics)
        cultural_nodes = sum(1 for n in nodes if n.cultural_significance > 0)
        morphologically_complex = sum(1 for n in nodes if n.morphology and len(n.morphology.morphemes) > 1)
        
        authenticity = (diacritic_nodes + cultural_nodes + morphologically_complex) / total_nodes
        
        return min(authenticity, 1.0)
    
    def parse(self, text: str) -> SyntacticAnalysis:
        """Perform complete syntactic analysis of Romanian text"""
        
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Tokenization
        tokens = self.tokenizer.tokenize(text)
        
        # Morphological analysis
        words = [token.text for token in tokens if token.text.strip()]
        morphologies = self.morphological_analyzer.analyze_batch(words)
        
        # Ensure alignment
        word_tokens = [token for token in tokens if token.text.strip()]
        if len(morphologies) != len(word_tokens):
            # Pad with empty analyses if needed
            while len(morphologies) < len(word_tokens):
                morphologies.append(None)
        
        # Create syntactic nodes
        nodes = self._create_syntactic_nodes(word_tokens, morphologies)
        
        # Identify phrases
        phrase_heads = self._identify_phrases(nodes)
        
        # Identify syntactic functions
        self._identify_syntactic_functions(nodes)
        
        # Identify clauses
        clauses = self._identify_clauses(nodes)
        
        # Detect cultural patterns
        cultural_constructions, sentence_patterns = self._detect_cultural_patterns(text, nodes)
        
        # Calculate metrics
        complexity_score = self._calculate_complexity_score(nodes, clauses)
        romanian_authenticity = self._calculate_romanian_authenticity(nodes)
        
        # Find root node (usually the main predicate)
        root = None
        for node in nodes:
            if node.syntactic_function == SyntacticFunction.PREDICATE:
                root = node
                break
        
        # Create analysis
        analysis = SyntacticAnalysis(
            text=text,
            tokens=tokens,
            morphologies=morphologies,
            nodes=nodes,
            root=root,
            clauses=clauses,
            sentence_patterns=sentence_patterns,
            cultural_constructions=cultural_constructions,
            complexity_score=complexity_score,
            romanian_authenticity=romanian_authenticity
        )
        
        logger.debug(f"Parsed text with {len(nodes)} nodes, {len(clauses)} clauses")
        return analysis
    
    def get_dependency_tree_text(self, analysis: SyntacticAnalysis) -> str:
        """Generate text representation of dependency tree"""
        
        if not analysis.root:
            return "No dependency tree found"
        
        def format_node(node: SyntacticNode, depth: int = 0) -> str:
            indent = "  " * depth
            function = node.syntactic_function.value if node.syntactic_function else "unknown"
            pos = node.morphology.part_of_speech.value if node.morphology else "unknown"
            cultural = f" (cultural: {node.cultural_significance:.2f})" if node.cultural_significance > 0 else ""
            
            result = f"{indent}{node.text} [{function}, {pos}]{cultural}\n"
            
            for dependent in node.dependents:
                result += format_node(dependent, depth + 1)
            
            return result
        
        return format_node(analysis.root)


# Example usage and testing
if __name__ == "__main__":
    # Initialize parser
    parser = RomanianSyntacticParser()
    
    # Test sentences with various Romanian syntactic features
    test_sentences = [
        "Mihai îi dă Mariei o floare frumoasă.",  # Ditransitive with dative
        "Copilul frumos aleargă repede prin parc.",  # Simple SV with modifiers
        "Dorul îmi este mare pentru tine.",  # Dative possessive construction
        "Să vii mâine la mine acasă!",  # Subjunctive with modal particle
        "O fi plecat deja la serviciu.",  # Presumptive mood (unique to Romanian)
        "Cartea pe care o citesc este interesantă.",  # Relative clause
        "Ce frumoasă mai este primăvara!",  # Emotional intensifier construction
        "Măi, frate, unde te duci?"  # Vocative particles
    ]
    
    print("🇷🇴 Romanian Syntactic Parser Test")
    print("="*60)
    
    for i, sentence in enumerate(test_sentences, 1):
        print(f"\n📝 Sentence {i}: {sentence}")
        
        # Parse sentence
        analysis = parser.parse(sentence)
        
        print(f"\n📊 Analysis Summary:")
        print(f"   Total nodes: {len(analysis.nodes)}")
        print(f"   Clauses: {len(analysis.clauses)}")
        print(f"   Complexity score: {analysis.complexity_score:.3f}")
        print(f"   Romanian authenticity: {analysis.romanian_authenticity:.3f}")
        print(f"   Sentence patterns: {', '.join(analysis.sentence_patterns)}")
        
        if analysis.cultural_constructions:
            print(f"\n🎭 Cultural Constructions:")
            for construction in analysis.cultural_constructions:
                print(f"   • {construction}")
        
        print(f"\n🌳 Dependency Tree:")
        tree_text = parser.get_dependency_tree_text(analysis)
        print(tree_text)
        
        print(f"\n⚡ Syntactic Functions:")
        for node in analysis.nodes:
            if node.syntactic_function:
                print(f"   '{node.text}' -> {node.syntactic_function.value}")
        
        print(f"\n📝 Clauses:")
        for j, clause in enumerate(analysis.clauses):
            print(f"   Clause {j+1}: {clause.type.value}")
            if clause.predicate:
                print(f"     Predicate: '{clause.predicate.text}'")
            if clause.subject:
                print(f"     Subject: '{clause.subject.text}'")
            if clause.objects:
                objects_text = ', '.join([obj.text for obj in clause.objects])
                print(f"     Objects: {objects_text}")
    
    print(f"\n🎉 Syntactic parsing completed!")
    print(f"Advanced Romanian syntactic analysis with cultural awareness")
"""
Romanian Cultural Context Extractor
Advanced cultural pattern recognition and context extraction for Romanian language
"""

import re
import logging
from typing import List, Dict, Tuple, Optional, Any, Set, NamedTuple, Union
from dataclasses import dataclass, field
from enum import Enum
import json
from collections import defaultdict, Counter
import math

# Import from our previous modules
from .romanian_semantic_analyzer import SemanticAnalysis, RomanianSemanticAnalyzer

logger = logging.getLogger(__name__)

class CulturalPeriod(Enum):
    """Romanian cultural periods"""
    DACIAN = "dacian"                   # Epoca dacă
    MEDIEVAL = "medieval"               # Evul Mediu românesc
    RENAISSANCE = "renaissance"         # Renașterea
    ENLIGHTENMENT = "enlightenment"     # Iluminismul
    ROMANTIC = "romantic"               # Romantismul
    MODERN = "modern"                   # Modernism
    CONTEMPORARY = "contemporary"       # Contemporan
    COMMUNIST = "communist"             # Perioada comunistă
    POST_COMMUNIST = "post_communist"   # Post-comunism

class CulturalTheme(Enum):
    """Major Romanian cultural themes"""
    MIORITIC_SPACE = "mioritic_space"           # Spațiul mioritic
    PASTORAL_LIFE = "pastoral_life"             # Viața pastorală
    ORTHODOX_SPIRITUALITY = "orthodox_spirituality" # Spiritualitatea ortodoxă
    FOLK_WISDOM = "folk_wisdom"                 # Înțelepciunea populară
    HISTORICAL_HEROISM = "historical_heroism"   # Eroismul istoric
    LOVE_AND_LONGING = "love_and_longing"      # Dragostea și dorul
    NATURE_MYSTICISM = "nature_mysticism"       # Misticiștiul naturii
    PEASANT_PHILOSOPHY = "peasant_philosophy"   # Filozofia țărănească
    BYZANTINE_HERITAGE = "byzantine_heritage"   # Moștenirea bizantină
    LATIN_HERITAGE = "latin_heritage"           # Moștenirea latină

class CulturalPattern(Enum):
    """Specific Romanian cultural patterns"""
    DOINA_PATTERN = "doina_pattern"             # Structura doinei
    BALLAD_PATTERN = "ballad_pattern"           # Structura baladei
    COLIND_PATTERN = "colind_pattern"           # Structura colindei
    FOLK_TALE_PATTERN = "folk_tale_pattern"     # Structura basmului
    EPIC_PATTERN = "epic_pattern"               # Structura epică
    LYRIC_PATTERN = "lyric_pattern"             # Structura lirică
    PROVERBIAL_PATTERN = "proverbial_pattern"   # Structura proverbială
    RITUAL_PATTERN = "ritual_pattern"           # Structura rituală

@dataclass
class CulturalReference:
    """Cultural reference with context"""
    text: str
    reference_type: str
    cultural_domain: str
    significance: float
    period: Optional[CulturalPeriod] = None
    theme: Optional[CulturalTheme] = None
    pattern: Optional[CulturalPattern] = None
    context: Optional[str] = None
    associations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'text': self.text,
            'reference_type': self.reference_type,
            'cultural_domain': self.cultural_domain,
            'significance': self.significance,
            'period': self.period.value if self.period else None,
            'theme': self.theme.value if self.theme else None,
            'pattern': self.pattern.value if self.pattern else None,
            'context': self.context,
            'associations': self.associations
        }

@dataclass
class CulturalArchetype:
    """Romanian cultural archetype"""
    name: str
    description: str
    characteristics: List[str]
    literary_manifestations: List[str]
    folkloric_manifestations: List[str]
    modern_interpretations: List[str]
    significance: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'description': self.description,
            'characteristics': self.characteristics,
            'literary_manifestations': self.literary_manifestations,
            'folkloric_manifestations': self.folkloric_manifestations,
            'modern_interpretations': self.modern_interpretations,
            'significance': self.significance
        }

@dataclass
class CulturalContext:
    """Complete cultural context analysis"""
    text: str
    semantic_analysis: SemanticAnalysis
    
    # Cultural identification
    cultural_references: List[CulturalReference]
    dominant_period: Optional[CulturalPeriod]
    dominant_themes: List[CulturalTheme]
    identified_patterns: List[CulturalPattern]
    archetypes: List[CulturalArchetype]
    
    # Cultural metrics
    cultural_authenticity: float        # 0.0-1.0
    cultural_depth: float              # 0.0-1.0
    cultural_uniqueness: float         # 0.0-1.0 (Romanian-specific vs universal)
    intertextuality_score: float       # 0.0-1.0
    
    # Cultural analysis
    cultural_worldview: Optional[str]   # Identified worldview
    philosophical_stance: Optional[str] # Philosophical position
    spiritual_dimension: Optional[str]  # Spiritual aspects
    
    # Comparative analysis
    european_context: List[str]         # European cultural connections
    balkan_context: List[str]          # Balkan cultural connections
    universal_themes: List[str]         # Universal human themes
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'text': self.text,
            'cultural_references': [ref.to_dict() for ref in self.cultural_references],
            'dominant_period': self.dominant_period.value if self.dominant_period else None,
            'dominant_themes': [theme.value for theme in self.dominant_themes],
            'identified_patterns': [pattern.value for pattern in self.identified_patterns],
            'archetypes': [archetype.to_dict() for archetype in self.archetypes],
            'cultural_authenticity': self.cultural_authenticity,
            'cultural_depth': self.cultural_depth,
            'cultural_uniqueness': self.cultural_uniqueness,
            'intertextuality_score': self.intertextuality_score,
            'cultural_worldview': self.cultural_worldview,
            'philosophical_stance': self.philosophical_stance,
            'spiritual_dimension': self.spiritual_dimension,
            'european_context': self.european_context,
            'balkan_context': self.balkan_context,
            'universal_themes': self.universal_themes
        }

class RomanianCulturalContextExtractor:
    """Advanced extractor for Romanian cultural context and patterns"""
    
    def __init__(self):
        # Initialize semantic analyzer
        self.semantic_analyzer = RomanianSemanticAnalyzer()
        
        # Load cultural knowledge bases
        self._load_cultural_references()
        self._load_cultural_archetypes()
        self._load_cultural_patterns()
        self._load_intertextual_knowledge()
        
        logger.info("Romanian cultural context extractor initialized")
    
    def _load_cultural_references(self):
        """Load comprehensive Romanian cultural references"""
        
        # Literary figures and works
        self.literary_references = {
            # Authors
            'mihai eminescu': {
                'period': CulturalPeriod.ROMANTIC,
                'themes': [CulturalTheme.LOVE_AND_LONGING, CulturalTheme.MIORITIC_SPACE],
                'significance': 1.0,
                'associations': ['romantism', 'poezie', 'genial', 'național']
            },
            'lucian blaga': {
                'period': CulturalPeriod.MODERN,
                'themes': [CulturalTheme.MIORITIC_SPACE, CulturalTheme.PEASANT_PHILOSOPHY],
                'significance': 0.9,
                'associations': ['filosofie', 'spațiu mioritic', 'metafizică']
            },
            'ion creangă': {
                'period': CulturalPeriod.ROMANTIC,
                'themes': [CulturalTheme.FOLK_WISDOM, CulturalTheme.PASTORAL_LIFE],
                'significance': 0.9,
                'associations': ['povești', 'umor', 'folclor', 'copilărie']
            },
            'george coșbuc': {
                'period': CulturalPeriod.ROMANTIC,
                'themes': [CulturalTheme.PASTORAL_LIFE, CulturalTheme.FOLK_WISDOM],
                'significance': 0.8,
                'associations': ['poezie populară', 'țărănime', 'tradiție']
            },
            'tudor arghezi': {
                'period': CulturalPeriod.MODERN,
                'themes': [CulturalTheme.ORTHODOX_SPIRITUALITY, CulturalTheme.NATURE_MYSTICISM],
                'significance': 0.8,
                'associations': ['poezie modernă', 'spiritualitate', 'limbaj']
            },
            
            # Works
            'luceafărul': {
                'period': CulturalPeriod.ROMANTIC,
                'themes': [CulturalTheme.LOVE_AND_LONGING, CulturalTheme.NATURE_MYSTICISM],
                'significance': 1.0,
                'associations': ['mit', 'iubire', 'cosmic', 'romantic']
            },
            'miorița': {
                'period': CulturalPeriod.MEDIEVAL,
                'themes': [CulturalTheme.MIORITIC_SPACE, CulturalTheme.PASTORAL_LIFE],
                'significance': 1.0,
                'associations': ['baladă', 'spațiu mioritic', 'destin', 'acceptare']
            },
            'scrisoarea iii': {
                'period': CulturalPeriod.ROMANTIC,
                'themes': [CulturalTheme.HISTORICAL_HEROISM, CulturalTheme.FOLK_WISDOM],
                'significance': 0.9,
                'associations': ['satiră', 'critică socială', 'istorie']
            }
        }
        
        # Historical figures
        self.historical_references = {
            'mihai viteazul': {
                'period': CulturalPeriod.MEDIEVAL,
                'themes': [CulturalTheme.HISTORICAL_HEROISM, CulturalTheme.BYZANTINE_HERITAGE],
                'significance': 0.9,
                'associations': ['unire', 'eroism', 'independență']
            },
            'ștefan cel mare': {
                'period': CulturalPeriod.MEDIEVAL,
                'themes': [CulturalTheme.HISTORICAL_HEROISM, CulturalTheme.ORTHODOX_SPIRITUALITY],
                'significance': 0.9,
                'associations': ['apărare', 'creștinism', 'Moldova']
            },
            'vlad țepeș': {
                'period': CulturalPeriod.MEDIEVAL,
                'themes': [CulturalTheme.HISTORICAL_HEROISM, CulturalTheme.BYZANTINE_HERITAGE],
                'significance': 0.8,
                'associations': ['justiție', 'severitate', 'apărare']
            }
        }
        
        # Folk traditions
        self.folk_references = {
            'mărțișor': {
                'period': CulturalPeriod.DACIAN,
                'themes': [CulturalTheme.NATURE_MYSTICISM, CulturalTheme.FOLK_WISDOM],
                'significance': 0.9,
                'associations': ['primăvară', 'renaștere', 'tradiție']
            },
            'sânziene': {
                'period': CulturalPeriod.DACIAN,
                'themes': [CulturalTheme.NATURE_MYSTICISM, CulturalTheme.FOLK_WISDOM],
                'significance': 0.8,
                'associations': ['solstițiu', 'magic', 'ierburi']
            },
            'dragobete': {
                'period': CulturalPeriod.DACIAN,
                'themes': [CulturalTheme.LOVE_AND_LONGING, CulturalTheme.NATURE_MYSTICISM],
                'significance': 0.7,
                'associations': ['iubire', 'primăvară', 'tineret']
            }
        }
        
        # Combine all references
        self.all_cultural_references = {}
        self.all_cultural_references.update(self.literary_references)
        self.all_cultural_references.update(self.historical_references)
        self.all_cultural_references.update(self.folk_references)
    
    def _load_cultural_archetypes(self):
        """Load Romanian cultural archetypes"""
        
        self.cultural_archetypes = {
            'miorița': CulturalArchetype(
                name='Miorița',
                description='Archetypal acceptance of destiny and cosmic harmony',
                characteristics=['acceptance', 'fatalism', 'cosmic consciousness', 'pastoral wisdom'],
                literary_manifestations=['Miorița ballad', 'Eminescu poetry', 'Blaga philosophy'],
                folkloric_manifestations=['shepherd songs', 'pastoral traditions', 'death acceptance rituals'],
                modern_interpretations=['philosophical resignation', 'ecological consciousness', 'spiritual maturity'],
                significance=1.0
            ),
            
            'fat_frumos': CulturalArchetype(
                name='Făt-Frumos',
                description='The heroic prince archetype of Romanian fairy tales',
                characteristics=['heroism', 'beauty', 'nobility', 'quest for truth'],
                literary_manifestations=['fairy tales', 'folk stories', 'heroic ballads'],
                folkloric_manifestations=['initiation stories', 'heroic quests', 'magical helpers'],
                modern_interpretations=['idealized masculinity', 'spiritual quest', 'moral heroism'],
                significance=0.9
            ),
            
            'ileana_cosanzeana': CulturalArchetype(
                name='Ileana Cosânzeana',
                description='The idealized feminine beauty and wisdom',
                characteristics=['beauty', 'wisdom', 'purity', 'spiritual elevation'],
                literary_manifestations=['fairy tales', 'romantic poetry', 'folk songs'],
                folkloric_manifestations=['maiden songs', 'beauty rituals', 'wisdom traditions'],
                modern_interpretations=['idealized femininity', 'spiritual beauty', 'inner wisdom'],
                significance=0.9
            ),
            
            'baba_dochia': CulturalArchetype(
                name='Baba Dochia',
                description='The wise crone connected to seasonal cycles',
                characteristics=['wisdom', 'seasonal knowledge', 'transformation', 'endurance'],
                literary_manifestations=['folk tales', 'seasonal poetry', 'wisdom literature'],
                folkloric_manifestations=['March traditions', 'weather lore', 'seasonal rituals'],
                modern_interpretations=['ecological wisdom', 'feminine power', 'seasonal consciousness'],
                significance=0.8
            ),
            
            'muma_padurii': CulturalArchetype(
                name='Muma Pădurii',
                description='The forest mother - guardian of natural mysteries',
                characteristics=['nature guardian', 'mystery', 'wildness', 'protection'],
                literary_manifestations=['supernatural tales', 'ecological literature', 'mystical poetry'],
                folkloric_manifestations=['forest taboos', 'nature spirits', 'ecological wisdom'],
                modern_interpretations=['environmental protection', 'wild feminine', 'ecological consciousness'],
                significance=0.8
            )
        }
    
    def _load_cultural_patterns(self):
        """Load Romanian cultural patterns and structures"""
        
        # Doina pattern - Romanian traditional song structure
        self.doina_patterns = {
            'structural_markers': [
                r'(vai|of|hei)\s+de\s+mine',        # exclamatory beginnings
                r'drag(ă|ul|a)\s+(mi[ie]|mea)',     # terms of endearment
                r'(pleacă|duce|merge)\s+departe',   # departure themes
                r'nu\s+mă\s+(uita|părăsi)',         # abandonment fears
            ],
            'emotional_markers': [
                r'dor\s+(de|după|pentru)',          # longing expressions
                r'inima\s+(mă\s+doare|plânge)',     # heart pain expressions
                r'suflet(ul)?\s+(îmi\s+)?arde',     # soul burning
            ],
            'temporal_markers': [
                r'când\s+(eram|aveam|eram)',        # temporal beginnings
                r'în\s+zilele\s+(de|când)',         # time references
                r'acum\s+(că|când|de)',             # present contrasts
            ]
        }
        
        # Mioritic pattern - spatial and philosophical
        self.mioritic_patterns = {
            'spatial_markers': [
                r'deal(uri)?\s+(line|verzi|înalte)', # hills descriptions
                r'câmp(ii|uri)?\s+(întins|larg)',    # field descriptions  
                r'cer\s+(senin|albastru|înalt)',     # sky descriptions
                r'orizont\s+(depărtat|larg)',        # horizon descriptions
            ],
            'philosophical_markers': [
                r'acceptare\s+(cu|a|în)',            # acceptance themes
                r'destin(ul)?\s+(îmi|meu)',          # destiny themes
                r'soarta\s+(mea|mi)',                # fate themes
                r'pace\s+(sufletească|în)',          # peace themes
            ],
            'temporal_markers': [
                r'etern(itate|al|ă)',                # eternity concepts
                r'veșnic(ie|al|ă)',                  # eternal concepts
                r'timpul\s+(se\s+oprește|stă)',      # time stopping
            ]
        }
        
        # Ballad patterns
        self.ballad_patterns = {
            'narrative_markers': [
                r'era\s+odată\s+ca\s+niciodată',    # traditional beginning
                r'în\s+vremuri\s+de\s+demult',       # time settings
                r'se\s+întâmplă\s+că',               # narrative transitions
            ],
            'character_markers': [
                r'(un|o)\s+(viteaz|frumos|tânăr)',   # character descriptions
                r'(împăratul|regele|țarul)',         # royal characters
                r'(fată|fecior)\s+de\s+(țaran|boier)', # social descriptions
            ],
            'action_markers': [
                r'și\s+(se\s+)?pornește',            # journey beginnings
                r'luptă\s+(mare|grea|crâncenă)',     # conflict descriptions
                r'învinge\s+(răul|dușmanul)',        # victory themes
            ]
        }
        
        # Compile patterns
        self._compile_cultural_patterns()
    
    def _compile_cultural_patterns(self):
        """Compile regular expressions for cultural patterns"""
        
        self.compiled_patterns = {
            'doina': {},
            'mioritic': {},
            'ballad': {}
        }
        
        # Compile doina patterns
        for category, patterns in self.doina_patterns.items():
            self.compiled_patterns['doina'][category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
        
        # Compile mioritic patterns
        for category, patterns in self.mioritic_patterns.items():
            self.compiled_patterns['mioritic'][category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
        
        # Compile ballad patterns
        for category, patterns in self.ballad_patterns.items():
            self.compiled_patterns['ballad'][category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
    
    def _load_intertextual_knowledge(self):
        """Load intertextual references and connections"""
        
        # European literary connections
        self.european_connections = {
            'romanticism': ['byron', 'goethe', 'hugo', 'pushkin'],
            'symbolism': ['baudelaire', 'mallarmé', 'verlaine'],
            'modernism': ['eliot', 'pound', 'rilke', 'valéry'],
            'existentialism': ['camus', 'sartre', 'kierkegaard']
        }
        
        # Balkan cultural connections
        self.balkan_connections = {
            'epic_tradition': ['homer', 'serbian_epics', 'bulgarian_folklore'],
            'orthodox_spirituality': ['byzantine_hymns', 'serbian_spirituality', 'bulgarian_monasticism'],
            'folk_ballads': ['serbian_ballads', 'bulgarian_songs', 'macedonian_folklore'],
            'pastoral_tradition': ['pastoral_poetry', 'shepherd_songs', 'rural_wisdom']
        }
        
        # Universal themes
        self.universal_themes = {
            'love_and_death': ['eternal_themes', 'human_condition', 'existential_questions'],
            'nature_and_human': ['ecological_consciousness', 'pantheism', 'natural_mysticism'],
            'time_and_eternity': ['temporal_consciousness', 'metaphysical_questions', 'cosmic_awareness'],
            'individual_and_society': ['social_criticism', 'moral_questions', 'human_dignity']
        }
    
    def _identify_cultural_references(self, text: str) -> List[CulturalReference]:
        """Identify cultural references in the text"""
        
        references = []
        text_lower = text.lower()
        
        # Check for direct cultural references
        for reference, info in self.all_cultural_references.items():
            if reference in text_lower:
                cultural_ref = CulturalReference(
                    text=reference,
                    reference_type='direct_reference',
                    cultural_domain=self._determine_cultural_domain(reference, info),
                    significance=info['significance'],
                    period=info.get('period'),
                    theme=info['themes'][0] if info.get('themes') else None,
                    associations=info.get('associations', [])
                )
                references.append(cultural_ref)
        
        # Check for indirect cultural markers
        cultural_markers = [
            ('ortodox', 'religious', CulturalTheme.ORTHODOX_SPIRITUALITY, 0.7),
            ('țăran', 'social', CulturalTheme.PEASANT_PHILOSOPHY, 0.6),
            ('codru', 'natural', CulturalTheme.NATURE_MYSTICISM, 0.8),
            ('balada', 'literary', CulturalTheme.FOLK_WISDOM, 0.7),
            ('doină', 'musical', CulturalTheme.LOVE_AND_LONGING, 0.8),
            ('voievod', 'historical', CulturalTheme.HISTORICAL_HEROISM, 0.7),
            ('bizantin', 'cultural', CulturalTheme.BYZANTINE_HERITAGE, 0.6)
        ]
        
        for marker, domain, theme, significance in cultural_markers:
            if marker in text_lower:
                cultural_ref = CulturalReference(
                    text=marker,
                    reference_type='cultural_marker',
                    cultural_domain=domain,
                    significance=significance,
                    theme=theme
                )
                references.append(cultural_ref)
        
        return references
    
    def _determine_cultural_domain(self, reference: str, info: Dict) -> str:
        """Determine the cultural domain of a reference"""
        
        if 'eminescu' in reference or 'blaga' in reference:
            return 'literary'
        elif 'mihai' in reference or 'ștefan' in reference:
            return 'historical'
        elif 'mărțișor' in reference or 'sânziene' in reference:
            return 'folk_traditional'
        elif 'luceafărul' in reference or 'miorița' in reference:
            return 'literary_work'
        else:
            return 'cultural_general'
    
    def _detect_cultural_patterns(self, text: str) -> List[CulturalPattern]:
        """Detect specific Romanian cultural patterns"""
        
        detected_patterns = []
        
        # Check doina patterns
        doina_score = 0
        for category, patterns in self.compiled_patterns['doina'].items():
            for pattern in patterns:
                if pattern.search(text):
                    doina_score += 1
        
        if doina_score >= 2:  # Need multiple markers
            detected_patterns.append(CulturalPattern.DOINA_PATTERN)
        
        # Check mioritic patterns
        mioritic_score = 0
        for category, patterns in self.compiled_patterns['mioritic'].items():
            for pattern in patterns:
                if pattern.search(text):
                    mioritic_score += 1
        
        if mioritic_score >= 2:
            detected_patterns.append(CulturalPattern.LYRIC_PATTERN)
        
        # Check ballad patterns
        ballad_score = 0
        for category, patterns in self.compiled_patterns['ballad'].items():
            for pattern in patterns:
                if pattern.search(text):
                    ballad_score += 1
        
        if ballad_score >= 2:
            detected_patterns.append(CulturalPattern.BALLAD_PATTERN)
        
        # Check for proverbial patterns
        proverbial_markers = [
            r'cine\s+seamănă\s+vânt',
            r'nu\s+lăsa\s+pe\s+mâine',
            r'unde-i\s+voința',
            r'apa\s+trece\s+pietrele\s+rămân'
        ]
        
        for marker in proverbial_markers:
            if re.search(marker, text, re.IGNORECASE):
                detected_patterns.append(CulturalPattern.PROVERBIAL_PATTERN)
                break
        
        return detected_patterns
    
    def _identify_archetypes(self, text: str, semantic_analysis: SemanticAnalysis) -> List[CulturalArchetype]:
        """Identify cultural archetypes present in the text"""
        
        identified_archetypes = []
        text_lower = text.lower()
        
        # Check for direct archetype mentions
        for archetype_name, archetype in self.cultural_archetypes.items():
            if archetype_name.replace('_', ' ') in text_lower:
                identified_archetypes.append(archetype)
                continue
            
            # Check for characteristic patterns
            characteristic_matches = 0
            for characteristic in archetype.characteristics:
                if characteristic in text_lower:
                    characteristic_matches += 1
            
            # Check for thematic alignment with semantic analysis
            if semantic_analysis.main_theme:
                theme_alignment = 0
                for manifestation in archetype.literary_manifestations + archetype.folkloric_manifestations:
                    if any(word in semantic_analysis.main_theme.lower() for word in manifestation.split()):
                        theme_alignment += 1
                
                if characteristic_matches >= 2 or theme_alignment >= 1:
                    identified_archetypes.append(archetype)
        
        # Check for implicit archetypal patterns
        if 'destin' in text_lower and 'acceptare' in text_lower:
            identified_archetypes.append(self.cultural_archetypes['miorița'])
        
        if 'eroism' in text_lower or 'luptă' in text_lower:
            identified_archetypes.append(self.cultural_archetypes['fat_frumos'])
        
        if 'frumusețe' in text_lower and 'înțelepciune' in text_lower:
            identified_archetypes.append(self.cultural_archetypes['ileana_cosanzeana'])
        
        return identified_archetypes
    
    def _calculate_cultural_authenticity(self, cultural_references: List[CulturalReference],
                                       semantic_analysis: SemanticAnalysis) -> float:
        """Calculate cultural authenticity score"""
        
        authenticity = 0.0
        
        # Base score from cultural references
        if cultural_references:
            avg_significance = sum(ref.significance for ref in cultural_references) / len(cultural_references)
            authenticity += avg_significance * 0.4
        
        # Score from Romanian-specific linguistic features
        if semantic_analysis.syntactic_analysis:
            cultural_constructions = len(semantic_analysis.syntactic_analysis.cultural_constructions)
            authenticity += min(cultural_constructions * 0.1, 0.3)
        
        # Score from cultural metaphors
        if semantic_analysis.cultural_metaphors:
            avg_metaphor_significance = sum(m['cultural_significance'] for m in semantic_analysis.cultural_metaphors) / len(semantic_analysis.cultural_metaphors)
            authenticity += avg_metaphor_significance * 0.3
        
        return min(authenticity, 1.0)
    
    def _calculate_cultural_depth(self, archetypes: List[CulturalArchetype],
                                themes: List[CulturalTheme],
                                patterns: List[CulturalPattern]) -> float:
        """Calculate cultural depth score"""
        
        depth = 0.0
        
        # Depth from archetypes
        if archetypes:
            avg_archetype_significance = sum(arch.significance for arch in archetypes) / len(archetypes)
            depth += avg_archetype_significance * 0.4
        
        # Depth from themes
        depth += min(len(themes) * 0.15, 0.3)
        
        # Depth from patterns
        depth += min(len(patterns) * 0.1, 0.3)
        
        return min(depth, 1.0)
    
    def _calculate_cultural_uniqueness(self, cultural_references: List[CulturalReference],
                                     universal_themes: List[str]) -> float:
        """Calculate Romanian cultural uniqueness vs universality"""
        
        # Count Romanian-specific vs universal references
        romanian_specific = sum(1 for ref in cultural_references if ref.significance > 0.7)
        total_references = len(cultural_references)
        universal_count = len(universal_themes)
        
        if total_references == 0:
            return 0.0
        
        # Higher uniqueness = more Romanian-specific content
        uniqueness = romanian_specific / total_references
        
        # Adjust for universal themes (reduce uniqueness)
        if universal_count > 0:
            uniqueness *= (1.0 - min(universal_count * 0.1, 0.3))
        
        return uniqueness
    
    def _calculate_intertextuality_score(self, cultural_references: List[CulturalReference]) -> float:
        """Calculate intertextuality score based on literary connections"""
        
        literary_refs = [ref for ref in cultural_references if 'literary' in ref.cultural_domain]
        
        if not literary_refs:
            return 0.0
        
        # Count different types of literary connections
        periods_represented = set()
        authors_mentioned = set()
        works_mentioned = set()
        
        for ref in literary_refs:
            if ref.period:
                periods_represented.add(ref.period)
            
            if 'eminescu' in ref.text or 'blaga' in ref.text:
                authors_mentioned.add(ref.text)
            
            if 'luceafărul' in ref.text or 'miorița' in ref.text:
                works_mentioned.add(ref.text)
        
        # Calculate score based on diversity and significance
        score = 0.0
        score += min(len(periods_represented) * 0.2, 0.4)
        score += min(len(authors_mentioned) * 0.15, 0.3)
        score += min(len(works_mentioned) * 0.15, 0.3)
        
        return min(score, 1.0)
    
    def _identify_worldview(self, themes: List[CulturalTheme], patterns: List[CulturalPattern],
                          archetypes: List[CulturalArchetype]) -> Optional[str]:
        """Identify the dominant cultural worldview"""
        
        # Mioritic worldview
        if (CulturalTheme.MIORITIC_SPACE in themes or 
            CulturalPattern.LYRIC_PATTERN in patterns or
            any('miorița' in arch.name for arch in archetypes)):
            return 'mioritic_worldview'
        
        # Orthodox spiritual worldview
        if CulturalTheme.ORTHODOX_SPIRITUALITY in themes:
            return 'orthodox_spiritual_worldview'
        
        # Folk wisdom worldview
        if (CulturalTheme.FOLK_WISDOM in themes or
            CulturalPattern.PROVERBIAL_PATTERN in patterns):
            return 'folk_wisdom_worldview'
        
        # Heroic worldview
        if CulturalTheme.HISTORICAL_HEROISM in themes:
            return 'heroic_worldview'
        
        # Pastoral worldview
        if CulturalTheme.PASTORAL_LIFE in themes:
            return 'pastoral_worldview'
        
        return None
    
    def _identify_philosophical_stance(self, semantic_analysis: SemanticAnalysis,
                                     themes: List[CulturalTheme]) -> Optional[str]:
        """Identify philosophical stance"""
        
        # Analyze emotional tone and themes
        emotional_tone = semantic_analysis.emotional_tone
        
        if CulturalTheme.MIORITIC_SPACE in themes:
            if emotional_tone > 0:
                return 'mioritic_optimism'
            elif emotional_tone < -0.3:
                return 'mioritic_melancholy'
            else:
                return 'mioritic_acceptance'
        
        if CulturalTheme.ORTHODOX_SPIRITUALITY in themes:
            return 'orthodox_spiritualism'
        
        if CulturalTheme.FOLK_WISDOM in themes:
            return 'practical_wisdom'
        
        if CulturalTheme.NATURE_MYSTICISM in themes:
            return 'nature_mysticism'
        
        return None
    
    def _identify_spiritual_dimension(self, themes: List[CulturalTheme],
                                    cultural_references: List[CulturalReference]) -> Optional[str]:
        """Identify spiritual dimension"""
        
        # Orthodox spirituality
        if CulturalTheme.ORTHODOX_SPIRITUALITY in themes:
            return 'orthodox_christian_spirituality'
        
        # Nature mysticism
        if CulturalTheme.NATURE_MYSTICISM in themes:
            return 'pantheistic_nature_spirituality'
        
        # Folk spirituality
        if any('ritual' in ref.reference_type for ref in cultural_references):
            return 'folk_traditional_spirituality'
        
        # Check for spiritual vocabulary
        spiritual_terms = ['suflet', 'duh', 'spirit', 'divin', 'sacru', 'sfânt']
        text_lower = ' '.join([ref.text for ref in cultural_references]).lower()
        
        spiritual_count = sum(1 for term in spiritual_terms if term in text_lower)
        if spiritual_count >= 2:
            return 'general_spirituality'
        
        return None
    
    def _identify_european_context(self, themes: List[CulturalTheme]) -> List[str]:
        """Identify European cultural context connections"""
        
        connections = []
        
        for theme in themes:
            if theme == CulturalTheme.LOVE_AND_LONGING:
                connections.extend(['european_romanticism', 'troubadour_tradition'])
            elif theme == CulturalTheme.NATURE_MYSTICISM:
                connections.extend(['romantic_nature_poetry', 'german_naturphilosophie'])
            elif theme == CulturalTheme.ORTHODOX_SPIRITUALITY:
                connections.extend(['byzantine_christianity', 'eastern_orthodox_tradition'])
            elif theme == CulturalTheme.PEASANT_PHILOSOPHY:
                connections.extend(['european_folk_wisdom', 'rural_philosophy'])
        
        return list(set(connections))  # Remove duplicates
    
    def _identify_balkan_context(self, themes: List[CulturalTheme], 
                                patterns: List[CulturalPattern]) -> List[str]:
        """Identify Balkan cultural context connections"""
        
        connections = []
        
        for theme in themes:
            if theme == CulturalTheme.HISTORICAL_HEROISM:
                connections.extend(['balkan_epic_tradition', 'south_slavic_heroic_songs'])
            elif theme == CulturalTheme.ORTHODOX_SPIRITUALITY:
                connections.extend(['balkan_orthodoxy', 'serbian_spirituality'])
            elif theme == CulturalTheme.FOLK_WISDOM:
                connections.extend(['balkan_folklore', 'south_eastern_european_traditions'])
        
        for pattern in patterns:
            if pattern == CulturalPattern.BALLAD_PATTERN:
                connections.extend(['balkan_ballad_tradition', 'serbian_ballads'])
            elif pattern == CulturalPattern.EPIC_PATTERN:
                connections.extend(['balkan_epic_poetry'])
        
        return list(set(connections))
    
    def _identify_universal_themes(self, themes: List[CulturalTheme],
                                 semantic_analysis: SemanticAnalysis) -> List[str]:
        """Identify universal human themes"""
        
        universal = []
        
        for theme in themes:
            if theme == CulturalTheme.LOVE_AND_LONGING:
                universal.extend(['universal_love', 'human_longing'])
            elif theme == CulturalTheme.NATURE_MYSTICISM:
                universal.extend(['human_nature_connection', 'ecological_consciousness'])
            elif theme == CulturalTheme.FOLK_WISDOM:
                universal.extend(['practical_wisdom', 'life_experience'])
            elif theme == CulturalTheme.HISTORICAL_HEROISM:
                universal.extend(['heroic_ideals', 'moral_courage'])
        
        # From emotional analysis
        if abs(semantic_analysis.emotional_tone) > 0.5:
            universal.append('intense_emotion')
        
        if semantic_analysis.conceptual_complexity > 0.7:
            universal.append('philosophical_depth')
        
        return list(set(universal))
    
    def extract_context(self, text: str) -> CulturalContext:
        """Extract complete Romanian cultural context"""
        
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Semantic analysis first
        semantic_analysis = self.semantic_analyzer.analyze(text)
        
        # Extract cultural components
        cultural_references = self._identify_cultural_references(text)
        detected_patterns = self._detect_cultural_patterns(text)
        identified_archetypes = self._identify_archetypes(text, semantic_analysis)
        
        # Extract themes from references and analysis
        dominant_themes = []
        for ref in cultural_references:
            if ref.theme and ref.theme not in dominant_themes:
                dominant_themes.append(ref.theme)
        
        # Determine dominant period
        periods = [ref.period for ref in cultural_references if ref.period]
        dominant_period = Counter(periods).most_common(1)[0][0] if periods else None
        
        # Calculate cultural metrics
        cultural_authenticity = self._calculate_cultural_authenticity(cultural_references, semantic_analysis)
        cultural_depth = self._calculate_cultural_depth(identified_archetypes, dominant_themes, detected_patterns)
        cultural_uniqueness = self._calculate_cultural_uniqueness(cultural_references, [])
        intertextuality_score = self._calculate_intertextuality_score(cultural_references)
        
        # Identify worldview and philosophical dimensions
        cultural_worldview = self._identify_worldview(dominant_themes, detected_patterns, identified_archetypes)
        philosophical_stance = self._identify_philosophical_stance(semantic_analysis, dominant_themes)
        spiritual_dimension = self._identify_spiritual_dimension(dominant_themes, cultural_references)
        
        # Identify contextual connections
        european_context = self._identify_european_context(dominant_themes)
        balkan_context = self._identify_balkan_context(dominant_themes, detected_patterns)
        universal_themes = self._identify_universal_themes(dominant_themes, semantic_analysis)
        
        # Update cultural uniqueness with universal themes
        cultural_uniqueness = self._calculate_cultural_uniqueness(cultural_references, universal_themes)
        
        # Create cultural context
        context = CulturalContext(
            text=text,
            semantic_analysis=semantic_analysis,
            cultural_references=cultural_references,
            dominant_period=dominant_period,
            dominant_themes=dominant_themes,
            identified_patterns=detected_patterns,
            archetypes=identified_archetypes,
            cultural_authenticity=cultural_authenticity,
            cultural_depth=cultural_depth,
            cultural_uniqueness=cultural_uniqueness,
            intertextuality_score=intertextuality_score,
            cultural_worldview=cultural_worldview,
            philosophical_stance=philosophical_stance,
            spiritual_dimension=spiritual_dimension,
            european_context=european_context,
            balkan_context=balkan_context,
            universal_themes=universal_themes
        )
        
        logger.debug(f"Extracted cultural context with {len(cultural_references)} references, "
                    f"{len(detected_patterns)} patterns, {len(identified_archetypes)} archetypes")
        
        return context


# Example usage and testing
if __name__ == "__main__":
    # Initialize extractor
    extractor = RomanianCulturalContextExtractor()
    
    # Test texts with rich cultural content
    test_texts = [
        "Dorul îmi cuprinde sufletul ca un codru vechi și plin de taine, "
        "unde Eminescu își plânge dragostea pentru Ileana Cosânzeana.",
        
        "În spațiul mioritic al gândului, timpul se oprește din curgere, "
        "iar Lucian Blaga contemplă esența lucrurilor cu înțelepciunea ancestrală.",
        
        "Mihai Viteazul, ca un Făt-Frumos al istoriei, luptă pentru unirea "
        "tuturor românilor sub același cer senin al patriei.",
        
        "Doina se înalță spre cer ca o rugăciune ortodoxă, purtând în ea "
        "taina codrul și înțelepciunea bătrânilor noștri țărani.",
        
        "Era odată ca niciodată un împărat care avea trei feciori frumoși "
        "ca soarele și înțelepți ca Muma Pădurii în tainele naturii."
    ]
    
    print("🇷🇴 Romanian Cultural Context Extraction Test")
    print("="*60)
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n📝 Text {i}:")
        print(f"   {text}")
        
        # Extract cultural context
        context = extractor.extract_context(text)
        
        print(f"\n📊 Cultural Analysis:")
        print(f"   Authenticity: {context.cultural_authenticity:.3f}")
        print(f"   Depth: {context.cultural_depth:.3f}")
        print(f"   Uniqueness: {context.cultural_uniqueness:.3f}")
        print(f"   Intertextuality: {context.intertextuality_score:.3f}")
        
        if context.dominant_period:
            print(f"   Dominant period: {context.dominant_period.value}")
        
        if context.cultural_worldview:
            print(f"   Worldview: {context.cultural_worldview}")
        
        if context.philosophical_stance:
            print(f"   Philosophical stance: {context.philosophical_stance}")
        
        if context.spiritual_dimension:
            print(f"   Spiritual dimension: {context.spiritual_dimension}")
        
        print(f"\n🏛️ Cultural References ({len(context.cultural_references)}):")
        for ref in context.cultural_references:
            print(f"   • {ref.text} [{ref.cultural_domain}] (significance: {ref.significance:.2f})")
        
        if context.dominant_themes:
            print(f"\n🎭 Cultural Themes:")
            for theme in context.dominant_themes:
                print(f"   • {theme.value}")
        
        if context.identified_patterns:
            print(f"\n📝 Cultural Patterns:")
            for pattern in context.identified_patterns:
                print(f"   • {pattern.value}")
        
        if context.archetypes:
            print(f"\n👑 Cultural Archetypes:")
            for archetype in context.archetypes:
                print(f"   • {archetype.name} (significance: {archetype.significance:.2f})")
        
        if context.european_context:
            print(f"\n🌍 European Context: {', '.join(context.european_context)}")
        
        if context.balkan_context:
            print(f"\n🏔️ Balkan Context: {', '.join(context.balkan_context)}")
        
        if context.universal_themes:
            print(f"\n🌐 Universal Themes: {', '.join(context.universal_themes)}")
    
    print(f"\n🎉 Cultural context extraction completed!")
    print(f"Deep Romanian cultural analysis with archetypal and intertextual awareness")
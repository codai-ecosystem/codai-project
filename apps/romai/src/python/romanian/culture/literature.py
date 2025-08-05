#!/usr/bin/env python3
"""
Romanian Literature & Poetry Analyzer - Advanced Literary Intelligence System
============================================================================

Enterprise-grade literary analysis system specifically designed for Romanian literature and poetry.
Provides comprehensive analysis of Romanian literary works, poetry meter detection, author style recognition,
literary movement classification, and cultural significance assessment.

Features:
- Romanian poetry meter and rhythm analysis
- Author style fingerprinting and attribution
- Literary movement and period classification
- Thematic analysis with cultural context
- Linguistic complexity assessment
- Literary quality scoring
- Historical literary context integration
- Cross-reference with cultural knowledge base

Author: RomAI Development Team
Version: 1.0.0
License: MIT
"""

import re
import sqlite3
import json
import asyncio
import numpy as np
from typing import Dict, List, Tuple, Optional, Set, Any, Union
from dataclasses import dataclass, field
from collections import defaultdict, Counter
import math
from datetime import datetime
import logging
from pathlib import Path

# Configure logging for literature analysis
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PoemAnalysis:
    """Results from poetry analysis."""
    title: str
    author: str
    meter_pattern: str
    syllable_count: List[int]
    rhyme_scheme: str
    literary_devices: List[str]
    thematic_elements: List[str]
    emotional_tone: str
    cultural_references: List[str]
    complexity_score: float
    quality_score: float
    historical_context: str

@dataclass
class AuthorProfile:
    """Literary profile of a Romanian author."""
    name: str
    birth_year: Optional[int]
    death_year: Optional[int]
    literary_movement: str
    major_works: List[str]
    style_characteristics: Dict[str, float]
    thematic_preferences: List[str]
    linguistic_patterns: Dict[str, Any]
    cultural_influence: float
    modern_relevance: float

@dataclass
class LiteraryWork:
    """Representation of a Romanian literary work."""
    title: str
    author: str
    year: Optional[int]
    genre: str
    content: str
    analysis_results: Dict[str, Any] = field(default_factory=dict)
    cultural_significance: float = 0.0
    literary_quality: float = 0.0

class RomanianLiteratureAnalyzer:
    """
    Advanced literature and poetry analyzer for Romanian literary works.
    
    Provides comprehensive analysis capabilities including meter detection,
    style analysis, thematic classification, and cultural context assessment.
    """
    
    def __init__(self, db_path: str = "romanian_literature.db"):
        """Initialize the Romanian Literature Analyzer."""
        self.db_path = db_path
        
        # Romanian literary analysis configuration
        self.config = {
            'min_poem_lines': 4,
            'max_poem_lines': 100,
            'syllable_tolerance': 1,
            'rhyme_similarity_threshold': 0.7,
            'quality_score_factors': {
                'meter_consistency': 0.15,
                'rhyme_quality': 0.15,
                'vocabulary_richness': 0.20,
                'literary_devices': 0.15,
                'thematic_depth': 0.20,
                'cultural_authenticity': 0.15
            }
        }
        
        # Romanian poetry meters
        self.romanian_meters = {
            'iamb': {'pattern': 'unstressed_stressed', 'syllables': [8, 10, 12]},
            'trochee': {'pattern': 'stressed_unstressed', 'syllables': [7, 9, 11]},
            'anapest': {'pattern': 'unstressed_unstressed_stressed', 'syllables': [9, 12, 15]},
            'dactyl': {'pattern': 'stressed_unstressed_unstressed', 'syllables': [9, 12, 15]},
            'alexandrin': {'pattern': 'iambic_dodecasyllable', 'syllables': [12]},
            'octosyllable': {'pattern': 'eight_syllable_verse', 'syllables': [8]},
            'decasyllable': {'pattern': 'ten_syllable_verse', 'syllables': [10]},
            'free_verse': {'pattern': 'irregular', 'syllables': 'variable'}
        }
        
        # Romanian rhyme patterns
        self.rhyme_schemes = {
            'ABAB': 'alternating_rhyme',
            'AABB': 'coupled_rhyme',
            'ABCB': 'ballad_meter',
            'ABBA': 'enclosed_rhyme',
            'AAAA': 'monorhyme',
            'ABCD': 'unrhymed',
            'AABA': 'modified_ballad',
            'ABAC': 'interlaced_rhyme'
        }
        
        # Literary devices in Romanian poetry
        self.literary_devices = {
            'alliteration': r'(\b\w)\w*\s+\1\w*',
            'anaphora': r'^(\w+).*\n.*^\1',
            'metaphor_markers': ['ca', 'precum', 'asemenea', 'parcă', 'de parcă'],
            'personification_markers': ['zâmbește', 'plânge', 'dansează', 'cântă'],
            'hyperbole_markers': ['infinit', 'etern', 'nemărginit', 'nesfârșit'],
            'onomatopoeia': r'\b(poc|pac|clap|buf|ham|zum|țârr|cric)\b',
            'repetition': r'(\b\w+\b).*\1',
            'enjambment': r'[^.!?]\n[a-z]'
        }
        
        # Romanian thematic categories
        self.thematic_categories = {
            'dragoste': {
                'keywords': ['iubire', 'dragoste', 'inimă', 'suflet', 'pasiune', 'dor', 'jale'],
                'weight': 1.0,
                'cultural_significance': 0.9
            },
            'natura': {
                'keywords': ['munte', 'codru', 'râu', 'câmp', 'floare', 'pasăre', 'cer', 'stea'],
                'weight': 0.9,
                'cultural_significance': 0.8
            },
            'patrie': {
                'keywords': ['țară', 'neam', 'patrie', 'român', 'strămoș', 'libertate', 'eroism'],
                'weight': 0.95,
                'cultural_significance': 0.95
            },
            'melancolie': {
                'keywords': ['trist', 'melancolie', 'jale', 'durere', 'suferință', 'amintire'],
                'weight': 0.8,
                'cultural_significance': 0.85
            },
            'moarte': {
                'keywords': ['moarte', 'mormânt', 'etern', 'nemurire', 'spirit', 'dincolo'],
                'weight': 0.7,
                'cultural_significance': 0.75
            },
            'religie': {
                'keywords': ['Dumnezeu', 'biserică', 'rugăciune', 'suflet', 'cer', 'înger'],
                'weight': 0.8,
                'cultural_significance': 0.8
            },
            'social': {
                'keywords': ['popor', 'țăran', 'muncă', 'sat', 'obicei', 'tradiție'],
                'weight': 0.75,
                'cultural_significance': 0.85
            }
        }
        
        # Famous Romanian authors and their characteristics
        self.author_profiles = {
            'mihai_eminescu': {
                'name': 'Mihai Eminescu',
                'birth_year': 1850,
                'death_year': 1889,
                'literary_movement': 'Romanticism',
                'major_works': ['Luceafărul', 'Scrisori', 'Glosse', 'Odă în metru antic'],
                'style_characteristics': {
                    'philosophical_depth': 0.95,
                    'lyrical_beauty': 0.98,
                    'cultural_authenticity': 0.95,
                    'linguistic_innovation': 0.90,
                    'emotional_intensity': 0.92
                },
                'thematic_preferences': ['dragoste', 'natura', 'melancolie', 'patrie', 'moarte'],
                'linguistic_patterns': {
                    'preferred_meters': ['alexandrin', 'decasyllable'],
                    'rhyme_preference': ['ABAB', 'ABBA'],
                    'vocabulary_complexity': 0.88,
                    'neologism_usage': 0.85
                }
            },
            'george_cosbuc': {
                'name': 'George Coșbuc',
                'birth_year': 1866,
                'death_year': 1918,
                'literary_movement': 'Sămănătorism',
                'major_works': ['Balade și idile', 'Nunta Zamfirei', 'Pe Argeș în sus'],
                'style_characteristics': {
                    'epic_narrative': 0.90,
                    'folk_authenticity': 0.95,
                    'lyrical_beauty': 0.85,
                    'cultural_authenticity': 0.92,
                    'social_consciousness': 0.88
                },
                'thematic_preferences': ['social', 'natura', 'patrie', 'religie'],
                'linguistic_patterns': {
                    'preferred_meters': ['octosyllable', 'decasyllable'],
                    'rhyme_preference': ['AABB', 'ABAB'],
                    'vocabulary_complexity': 0.75,
                    'folk_elements': 0.90
                }
            },
            'octavian_goga': {
                'name': 'Octavian Goga',
                'birth_year': 1881,
                'death_year': 1938,
                'literary_movement': 'Sămănătorism',
                'major_works': ['Poezii', 'Mustul care fierbe', 'Din umbra zidurilor'],
                'style_characteristics': {
                    'social_critique': 0.88,
                    'emotional_intensity': 0.85,
                    'cultural_authenticity': 0.87,
                    'political_consciousness': 0.90,
                    'lyrical_beauty': 0.80
                },
                'thematic_preferences': ['social', 'patrie', 'religie', 'natura'],
                'linguistic_patterns': {
                    'preferred_meters': ['free_verse', 'decasyllable'],
                    'rhyme_preference': ['ABAB', 'ABCD'],
                    'vocabulary_complexity': 0.78,
                    'political_terminology': 0.85
                }
            }
        }
        
        # Cultural references in Romanian literature
        self.cultural_references = {
            'historical_figures': [
                'Ștefan cel Mare', 'Mihai Viteazul', 'Vlad Țepeș', 'Tudor Vladimirescu',
                'Avram Iancu', 'Horea', 'Cloșca', 'Crișan'
            ],
            'mythological_beings': [
                'iele', 'sânziene', 'zmeu', 'balaur', 'samcă', 'pricolici', 'strigoi'
            ],
            'folk_traditions': [
                'hora', 'călușari', 'mărțișor', 'colinde', 'plugușorul', 'sorcova'
            ],
            'geographical_features': [
                'Carpați', 'Dunăre', 'Prut', 'Olt', 'Argeș', 'Mureș', 'Someș'
            ],
            'cultural_concepts': [
                'dor', 'jale', 'ducă', 'folos', 'chin', 'har', 'noroc'
            ]
        }
        
        logger.info("Romanian Literature Analyzer initialized")
    
    async def initialize(self) -> bool:
        """Initialize the literature analyzer database."""
        try:
            await self._create_database_schema()
            await self._populate_literary_database()
            
            logger.info("Literature analyzer initialization completed successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize literature analyzer: {e}")
            return False
    
    async def _create_database_schema(self):
        """Create the database schema for literature analysis."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Literary works table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS literary_works (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                year INTEGER,
                genre TEXT,
                content TEXT,
                analysis_results TEXT,
                cultural_significance REAL DEFAULT 0.0,
                literary_quality REAL DEFAULT 0.0,
                created_date TEXT,
                updated_date TEXT
            )
        """)
        
        # Author profiles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS author_profiles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                birth_year INTEGER,
                death_year INTEGER,
                literary_movement TEXT,
                major_works TEXT,
                style_characteristics TEXT,
                thematic_preferences TEXT,
                linguistic_patterns TEXT,
                cultural_influence REAL DEFAULT 0.0,
                modern_relevance REAL DEFAULT 0.0
            )
        """)
        
        # Poetry analysis table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS poetry_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                work_id INTEGER,
                meter_pattern TEXT,
                syllable_count TEXT,
                rhyme_scheme TEXT,
                literary_devices TEXT,
                thematic_elements TEXT,
                emotional_tone TEXT,
                cultural_references TEXT,
                complexity_score REAL,
                quality_score REAL,
                analysis_date TEXT,
                FOREIGN KEY (work_id) REFERENCES literary_works (id)
            )
        """)
        
        # Literary movements table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS literary_movements (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                period_start INTEGER,
                period_end INTEGER,
                characteristics TEXT,
                major_authors TEXT,
                cultural_context TEXT,
                influence_score REAL DEFAULT 0.0
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def _populate_literary_database(self):
        """Populate the database with Romanian literary data."""
        
        # Store author profiles
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for author_id, profile in self.author_profiles.items():
            cursor.execute("""
                INSERT OR REPLACE INTO author_profiles 
                (id, name, birth_year, death_year, literary_movement, major_works,
                 style_characteristics, thematic_preferences, linguistic_patterns,
                 cultural_influence, modern_relevance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                author_id,
                profile['name'],
                profile['birth_year'],
                profile['death_year'],
                profile['literary_movement'],
                json.dumps(profile['major_works']),
                json.dumps(profile['style_characteristics']),
                json.dumps(profile['thematic_preferences']),
                json.dumps(profile['linguistic_patterns']),
                0.95,  # cultural_influence
                0.90   # modern_relevance
            ))
        
        # Store literary movements
        movements = [
            {
                'id': 'romantism',
                'name': 'Romantismul Românesc',
                'period_start': 1840,
                'period_end': 1890,
                'characteristics': {
                    'themes': ['nationalism', 'nature_worship', 'individual_emotion'],
                    'style': ['lyrical_expression', 'folk_inspiration', 'historical_themes'],
                    'innovations': ['modern_romanian_poetry', 'national_consciousness']
                },
                'major_authors': ['Mihai Eminescu', 'Vasile Alecsandri', 'Dimitrie Bolintineanu'],
                'cultural_context': 'National awakening and independence movement',
                'influence_score': 0.98
            },
            {
                'id': 'samanatorul',
                'name': 'Sămănătorismul',
                'period_start': 1900,
                'period_end': 1916,
                'characteristics': {
                    'themes': ['rural_life', 'social_justice', 'traditional_values'],
                    'style': ['realistic_description', 'folk_elements', 'social_critique'],
                    'innovations': ['social_consciousness', 'peasant_literature']
                },
                'major_authors': ['George Coșbuc', 'Octavian Goga', 'Duiliu Zamfirescu'],
                'cultural_context': 'Industrialization and social change',
                'influence_score': 0.85
            }
        ]
        
        for movement in movements:
            cursor.execute("""
                INSERT OR REPLACE INTO literary_movements 
                (id, name, period_start, period_end, characteristics, major_authors,
                 cultural_context, influence_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                movement['id'],
                movement['name'],
                movement['period_start'],
                movement['period_end'],
                json.dumps(movement['characteristics']),
                json.dumps(movement['major_authors']),
                movement['cultural_context'],
                movement['influence_score']
            ))
        
        conn.commit()
        conn.close()
        
        logger.info("Populated literary database with author profiles and movements")
    
    async def analyze_poem(self, poem_text: str, title: str = "", author: str = "") -> PoemAnalysis:
        """Analyze a Romanian poem for meter, rhyme, themes, and literary devices."""
        try:
            lines = poem_text.strip().split('\n')
            lines = [line.strip() for line in lines if line.strip()]
            
            if len(lines) < self.config['min_poem_lines']:
                logger.warning(f"Poem too short ({len(lines)} lines), minimum {self.config['min_poem_lines']} required")
            
            # Analyze meter and syllables
            syllable_analysis = await self._analyze_syllables(lines)
            meter_pattern = await self._detect_meter(syllable_analysis)
            
            # Analyze rhyme scheme
            rhyme_scheme = await self._analyze_rhyme_scheme(lines)
            
            # Detect literary devices
            literary_devices = await self._detect_literary_devices(poem_text)
            
            # Analyze themes
            thematic_elements = await self._analyze_themes(poem_text)
            
            # Detect emotional tone
            emotional_tone = await self._detect_emotional_tone(poem_text)
            
            # Find cultural references
            cultural_references = await self._find_cultural_references(poem_text)
            
            # Calculate complexity and quality scores
            complexity_score = await self._calculate_complexity_score(
                syllable_analysis, meter_pattern, literary_devices, thematic_elements
            )
            
            quality_score = await self._calculate_quality_score(
                meter_pattern, rhyme_scheme, literary_devices, thematic_elements, cultural_references
            )
            
            # Determine historical context
            historical_context = await self._determine_historical_context(
                author, thematic_elements, literary_devices
            )
            
            analysis = PoemAnalysis(
                title=title or "Untitled",
                author=author or "Unknown",
                meter_pattern=meter_pattern,
                syllable_count=syllable_analysis,
                rhyme_scheme=rhyme_scheme,
                literary_devices=literary_devices,
                thematic_elements=thematic_elements,
                emotional_tone=emotional_tone,
                cultural_references=cultural_references,
                complexity_score=complexity_score,
                quality_score=quality_score,
                historical_context=historical_context
            )
            
            logger.info(f"Completed analysis of poem '{title}' by {author}")
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze poem: {e}")
            return PoemAnalysis(
                title=title,
                author=author,
                meter_pattern="unknown",
                syllable_count=[],
                rhyme_scheme="unknown",
                literary_devices=[],
                thematic_elements=[],
                emotional_tone="neutral",
                cultural_references=[],
                complexity_score=0.0,
                quality_score=0.0,
                historical_context="undetermined"
            )
    
    async def _analyze_syllables(self, lines: List[str]) -> List[int]:
        """Analyze syllable count for each line of poetry."""
        syllable_counts = []
        
        # Romanian vowel patterns for syllable counting
        vowel_pattern = r'[aeiouăâîțș]+'
        diphthong_pattern = r'(ea|oa|ia|ie|io|iu|ai|au|ei|eu|oi|ou|âi|ău|ây|ui)'
        
        for line in lines:
            # Remove punctuation and convert to lowercase
            clean_line = re.sub(r'[^\w\s]', '', line.lower())
            
            if not clean_line.strip():
                syllable_counts.append(0)
                continue
            
            # Count vowel groups, treating diphthongs as single syllables
            syllables = 0
            words = clean_line.split()
            
            for word in words:
                # Replace diphthongs with single characters to simplify counting
                word_simplified = re.sub(diphthong_pattern, 'X', word)
                
                # Count vowel groups
                vowel_groups = re.findall(vowel_pattern, word_simplified)
                syllables += len(vowel_groups)
                
                # Adjust for silent 'e' at end (rare in Romanian but possible)
                if word.endswith('e') and len(word) > 2:
                    syllables = max(1, syllables - 0.5)  # Slight reduction
            
            syllable_counts.append(int(syllables))
        
        return syllable_counts
    
    async def _detect_meter(self, syllable_counts: List[int]) -> str:
        """Detect the meter pattern of the poem."""
        if not syllable_counts:
            return "unknown"
        
        # Filter out lines with 0 syllables (empty lines)
        valid_counts = [count for count in syllable_counts if count > 0]
        
        if not valid_counts:
            return "unknown"
        
        # Find the most common syllable count
        count_frequency = Counter(valid_counts)
        most_common_count = count_frequency.most_common(1)[0][0]
        
        # Check meter consistency
        consistent_lines = sum(1 for count in valid_counts 
                             if abs(count - most_common_count) <= self.config['syllable_tolerance'])
        consistency_ratio = consistent_lines / len(valid_counts)
        
        # Identify meter based on syllable count and consistency
        for meter, properties in self.romanian_meters.items():
            if properties['syllables'] == 'variable':
                continue
            
            if most_common_count in properties['syllables']:
                if consistency_ratio >= 0.7:  # At least 70% of lines follow the pattern
                    return f"{meter} (consistency: {consistency_ratio:.2f})"
                else:
                    return f"{meter}_irregular (consistency: {consistency_ratio:.2f})"
        
        # If no standard meter fits, determine if it's free verse or irregular
        if consistency_ratio < 0.5:
            return "free_verse"
        else:
            return f"regular_{most_common_count}_syllable"
    
    async def _analyze_rhyme_scheme(self, lines: List[str]) -> str:
        """Analyze the rhyme scheme of the poem."""
        if len(lines) < 2:
            return "none"
        
        # Extract line endings (last syllable or two)
        line_endings = []
        for line in lines:
            # Remove punctuation and get last word
            clean_line = re.sub(r'[^\w\s]', '', line.lower())
            words = clean_line.split()
            
            if words:
                last_word = words[-1]
                # Get last 2-3 characters for rhyme comparison
                ending = last_word[-3:] if len(last_word) >= 3 else last_word
                line_endings.append(ending)
            else:
                line_endings.append("")
        
        # Determine rhyme scheme
        rhyme_labels = []
        current_label = 'A'
        ending_to_label = {}
        
        for ending in line_endings:
            if not ending:
                rhyme_labels.append('-')
                continue
            
            # Check if this ending rhymes with any previous ending
            found_rhyme = False
            for prev_ending, label in ending_to_label.items():
                if self._check_rhyme(ending, prev_ending):
                    rhyme_labels.append(label)
                    found_rhyme = True
                    break
            
            if not found_rhyme:
                ending_to_label[ending] = current_label
                rhyme_labels.append(current_label)
                current_label = chr(ord(current_label) + 1)
        
        rhyme_scheme = ''.join(rhyme_labels)
        
        # Identify common rhyme patterns
        for pattern, name in self.rhyme_schemes.items():
            if len(rhyme_scheme) >= len(pattern):
                # Check if the pattern repeats
                pattern_matches = 0
                for i in range(0, len(rhyme_scheme), len(pattern)):
                    if rhyme_scheme[i:i+len(pattern)] == pattern:
                        pattern_matches += 1
                
                if pattern_matches >= 1:  # At least one complete pattern
                    return f"{pattern} ({name})"
        
        return rhyme_scheme[:8] + ("..." if len(rhyme_scheme) > 8 else "")
    
    def _check_rhyme(self, ending1: str, ending2: str) -> bool:
        """Check if two word endings rhyme."""
        if ending1 == ending2:
            return True
        
        # Romanian rhyme patterns
        rhyme_patterns = [
            (r'.*[aă]$', r'.*[aă]$'),
            (r'.*[eă]$', r'.*[eă]$'),
            (r'.*[iî]$', r'.*[iî]$'),
            (r'.*[oă]$', r'.*[oă]$'),
            (r'.*[uû]$', r'.*[uû]$'),
            (r'.*are$', r'.*are$'),
            (r'.*ește$', r'.*ește$'),
            (r'.*ului$', r'.*ului$')
        ]
        
        for pattern1, pattern2 in rhyme_patterns:
            if re.match(pattern1, ending1) and re.match(pattern2, ending2):
                return True
        
        # Check suffix similarity
        min_length = min(len(ending1), len(ending2))
        if min_length >= 2:
            suffix_similarity = sum(1 for i in range(1, min_length + 1) 
                                  if ending1[-i] == ending2[-i]) / min_length
            return suffix_similarity >= self.config['rhyme_similarity_threshold']
        
        return False
    
    async def _detect_literary_devices(self, text: str) -> List[str]:
        """Detect literary devices used in the poem."""
        devices_found = []
        text_lower = text.lower()
        
        # Check for each literary device
        for device, pattern in self.literary_devices.items():
            if device.endswith('_markers'):
                # Check for keyword-based devices
                markers = pattern
                for marker in markers:
                    if marker in text_lower:
                        devices_found.append(device.replace('_markers', ''))
                        break
            else:
                # Check for regex-based devices
                if re.search(pattern, text_lower, re.MULTILINE):
                    devices_found.append(device)
        
        # Additional device detection
        
        # Assonance (vowel repetition)
        vowel_pattern = r'[aeiouăâî]'
        vowels = re.findall(vowel_pattern, text_lower)
        if len(vowels) > 10:
            vowel_freq = Counter(vowels)
            max_freq = max(vowel_freq.values())
            if max_freq >= len(vowels) * 0.3:  # If any vowel appears in 30%+ of cases
                devices_found.append('assonance')
        
        # Consonance (consonant repetition)
        consonant_pattern = r'[bcdfghjklmnpqrstvwxyz]'
        consonants = re.findall(consonant_pattern, text_lower)
        if len(consonants) > 15:
            consonant_freq = Counter(consonants)
            max_freq = max(consonant_freq.values())
            if max_freq >= len(consonants) * 0.2:  # If any consonant appears in 20%+ of cases
                devices_found.append('consonance')
        
        # Chiasmus (ABBA structure)
        lines = text.split('\n')
        if len(lines) >= 4:
            # Simple chiasmus detection based on word/structure patterns
            for i in range(len(lines) - 3):
                line_group = lines[i:i+4]
                if self._detect_chiasmus(line_group):
                    devices_found.append('chiasmus')
                    break
        
        return list(set(devices_found))  # Remove duplicates
    
    def _detect_chiasmus(self, lines: List[str]) -> bool:
        """Detect chiasmus pattern in a group of lines."""
        if len(lines) != 4:
            return False
        
        # Simple pattern matching for ABBA structure
        words = []
        for line in lines:
            line_words = re.findall(r'\b\w+\b', line.lower())
            if line_words:
                words.append(line_words[0])  # First word of each line
        
        if len(words) == 4:
            # Check if pattern is ABBA
            return (words[0] == words[3] and words[1] == words[2] and 
                   words[0] != words[1])
        
        return False
    
    async def _analyze_themes(self, text: str) -> List[str]:
        """Analyze thematic elements in the poem."""
        themes_found = []
        text_lower = text.lower()
        
        for theme, theme_data in self.thematic_categories.items():
            keywords = theme_data['keywords']
            theme_score = 0
            
            for keyword in keywords:
                if keyword in text_lower:
                    theme_score += theme_data['weight']
            
            # Normalize theme score by text length
            normalized_score = theme_score / max(len(text_lower.split()), 1)
            
            if normalized_score > 0.01:  # Threshold for theme presence
                themes_found.append(f"{theme} (strength: {normalized_score:.3f})")
        
        return themes_found
    
    async def _detect_emotional_tone(self, text: str) -> str:
        """Detect the emotional tone of the poem."""
        text_lower = text.lower()
        
        emotion_keywords = {
            'melancholic': ['trist', 'melancolie', 'jale', 'durere', 'suferință', 'lacrimi', 'plâns'],
            'romantic': ['iubire', 'dragoste', 'inimă', 'pasiune', 'dulce', 'frumos', 'drag'],
            'nostalgic': ['amintire', 'trecut', 'copilărie', 'demult', 'odinioară', 'dor'],
            'patriotic': ['țară', 'neam', 'patrie', 'român', 'eroism', 'libertate', 'strămoș'],
            'contemplative': ['gândire', 'filozofie', 'înțelepciune', 'meditație', 'reflecție'],
            'joyful': ['bucurie', 'fericire', 'râs', 'veselie', 'sărbătoare', 'cântec'],
            'angry': ['mânie', 'furie', 'răzbunare', 'ură', 'revoltă', 'supărare'],
            'peaceful': ['pace', 'liniște', 'serenitate', 'calm', 'echilibru', 'armonie']
        }
        
        emotion_scores = {}
        total_words = len(text_lower.split())
        
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            emotion_scores[emotion] = score / max(total_words, 1)
        
        # Find dominant emotion
        if emotion_scores:
            dominant_emotion = max(emotion_scores, key=emotion_scores.get)
            max_score = emotion_scores[dominant_emotion]
            
            if max_score > 0.01:  # Minimum threshold
                return f"{dominant_emotion} (intensity: {max_score:.3f})"
        
        return "neutral"
    
    async def _find_cultural_references(self, text: str) -> List[str]:
        """Find cultural references in the poem."""
        references_found = []
        text_lower = text.lower()
        
        for category, items in self.cultural_references.items():
            for item in items:
                if item.lower() in text_lower:
                    references_found.append(f"{item} ({category})")
        
        return references_found
    
    async def _calculate_complexity_score(self, syllable_counts: List[int], 
                                        meter_pattern: str, 
                                        literary_devices: List[str], 
                                        themes: List[str]) -> float:
        """Calculate the complexity score of the poem."""
        complexity_factors = []
        
        # Metrical complexity
        if 'irregular' in meter_pattern or 'free_verse' in meter_pattern:
            complexity_factors.append(0.8)  # Irregular meter is complex
        elif any(meter in meter_pattern for meter in ['alexandrin', 'anapest', 'dactyl']):
            complexity_factors.append(0.7)  # Complex traditional meters
        else:
            complexity_factors.append(0.4)  # Simple meters
        
        # Syllable variation complexity
        if syllable_counts:
            syllable_std = np.std(syllable_counts)
            syllable_complexity = min(syllable_std / 5.0, 1.0)  # Normalize to 0-1
            complexity_factors.append(syllable_complexity)
        
        # Literary device complexity
        device_complexity = min(len(literary_devices) / 8.0, 1.0)  # Max complexity at 8 devices
        complexity_factors.append(device_complexity)
        
        # Thematic complexity
        theme_complexity = min(len(themes) / 5.0, 1.0)  # Max complexity at 5 themes
        complexity_factors.append(theme_complexity)
        
        # Calculate weighted average
        return sum(complexity_factors) / len(complexity_factors) if complexity_factors else 0.0
    
    async def _calculate_quality_score(self, meter_pattern: str, 
                                     rhyme_scheme: str, 
                                     literary_devices: List[str], 
                                     themes: List[str], 
                                     cultural_references: List[str]) -> float:
        """Calculate the literary quality score of the poem."""
        quality_components = {}
        
        # Meter consistency quality
        if 'consistency:' in meter_pattern:
            consistency_match = re.search(r'consistency: ([\d.]+)', meter_pattern)
            if consistency_match:
                consistency = float(consistency_match.group(1))
                quality_components['meter_consistency'] = consistency
            else:
                quality_components['meter_consistency'] = 0.5
        else:
            quality_components['meter_consistency'] = 0.7  # Default for recognized meters
        
        # Rhyme quality
        if rhyme_scheme in ['unknown', 'none']:
            quality_components['rhyme_quality'] = 0.3  # Free verse gets some credit
        elif any(pattern in rhyme_scheme for pattern in ['ABAB', 'ABBA', 'AABB']):
            quality_components['rhyme_quality'] = 0.8  # Well-structured rhyme
        else:
            quality_components['rhyme_quality'] = 0.6  # Some rhyme structure
        
        # Literary device richness
        device_score = min(len(literary_devices) / 6.0, 1.0)  # Optimal at 6 devices
        quality_components['literary_devices'] = device_score
        
        # Thematic depth
        theme_score = min(len(themes) / 4.0, 1.0)  # Optimal at 4 themes
        quality_components['thematic_depth'] = theme_score
        
        # Cultural authenticity
        cultural_score = min(len(cultural_references) / 3.0, 1.0)  # Optimal at 3 references
        quality_components['cultural_authenticity'] = cultural_score
        
        # Vocabulary richness (approximation based on themes and devices)
        vocab_richness = (len(themes) + len(literary_devices)) / 10.0
        quality_components['vocabulary_richness'] = min(vocab_richness, 1.0)
        
        # Calculate weighted quality score
        total_score = 0.0
        for component, weight in self.config['quality_score_factors'].items():
            if component in quality_components:
                total_score += quality_components[component] * weight
        
        return min(total_score, 1.0)
    
    async def _determine_historical_context(self, author: str, 
                                          themes: List[str], 
                                          literary_devices: List[str]) -> str:
        """Determine the historical/literary context of the poem."""
        
        # Check if author is in known profiles
        author_lower = author.lower().replace(' ', '_')
        if author_lower in self.author_profiles:
            profile = self.author_profiles[author_lower]
            period = f"{profile['birth_year']}-{profile['death_year']}" if profile['death_year'] else f"{profile['birth_year']}+"
            return f"{profile['literary_movement']} ({period})"
        
        # Infer from thematic and stylistic elements
        context_indicators = {
            'Romantism': ['dragoste', 'natura', 'melancolie', 'patrie'],
            'Sămănătorism': ['social', 'natura', 'religie', 'patrie'],
            'Modernism': ['simbolism', 'metafora', 'imagism'],
            'Contemporary': ['urban', 'technology', 'globalization']
        }
        
        movement_scores = {}
        for movement, indicators in context_indicators.items():
            score = sum(1 for theme in themes if any(indicator in theme for indicator in indicators))
            movement_scores[movement] = score
        
        if movement_scores:
            likely_movement = max(movement_scores, key=movement_scores.get)
            if movement_scores[likely_movement] > 0:
                return f"Likely {likely_movement}"
        
        return "Contemporary/Unclassified"
    
    async def identify_author_style(self, poem_text: str) -> Dict[str, Any]:
        """Identify the authorial style characteristics of a poem."""
        analysis = await self.analyze_poem(poem_text)
        
        style_profile = {
            'meter_preferences': [analysis.meter_pattern],
            'rhyme_preferences': [analysis.rhyme_scheme],
            'thematic_tendencies': analysis.thematic_elements,
            'literary_device_usage': analysis.literary_devices,
            'emotional_range': [analysis.emotional_tone],
            'cultural_engagement': analysis.cultural_references,
            'complexity_level': analysis.complexity_score,
            'quality_indicators': analysis.quality_score
        }
        
        # Compare with known author profiles
        similarity_scores = {}
        for author_id, profile in self.author_profiles.items():
            similarity = await self._calculate_style_similarity(style_profile, profile)
            similarity_scores[profile['name']] = similarity
        
        # Find best matches
        best_matches = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            'style_profile': style_profile,
            'possible_authors': best_matches,
            'style_classification': await self._classify_style(style_profile),
            'unique_characteristics': await self._identify_unique_elements(style_profile)
        }
    
    async def _calculate_style_similarity(self, poem_style: Dict[str, Any], 
                                        author_profile: Dict[str, Any]) -> float:
        """Calculate similarity between poem style and author profile."""
        similarity_score = 0.0
        comparisons = 0
        
        # Compare thematic preferences
        poem_themes = {theme.split(' (')[0] for theme in poem_style['thematic_tendencies']}
        author_themes = set(author_profile['thematic_preferences'])
        theme_overlap = len(poem_themes.intersection(author_themes)) / max(len(author_themes), 1)
        similarity_score += theme_overlap * 0.3
        comparisons += 1
        
        # Compare complexity levels
        author_complexity = author_profile['linguistic_patterns'].get('vocabulary_complexity', 0.5)
        complexity_similarity = 1 - abs(poem_style['complexity_level'] - author_complexity)
        similarity_score += complexity_similarity * 0.2
        comparisons += 1
        
        # Compare meter preferences
        poem_meter = poem_style['meter_preferences'][0].split(' (')[0]
        author_meters = author_profile['linguistic_patterns'].get('preferred_meters', [])
        meter_match = 1.0 if poem_meter in author_meters else 0.0
        similarity_score += meter_match * 0.2
        comparisons += 1
        
        # Compare quality indicators
        quality_similarity = poem_style['quality_indicators']
        similarity_score += quality_similarity * 0.3
        comparisons += 1
        
        return similarity_score / comparisons if comparisons > 0 else 0.0
    
    async def _classify_style(self, style_profile: Dict[str, Any]) -> str:
        """Classify the overall style of the poem."""
        
        # Traditional vs Modern classification
        traditional_indicators = 0
        modern_indicators = 0
        
        # Check meter regularity
        meter = style_profile['meter_preferences'][0]
        if any(traditional in meter for traditional in ['alexandrin', 'decasyllable', 'octosyllable']):
            traditional_indicators += 1
        elif 'free_verse' in meter:
            modern_indicators += 1
        
        # Check rhyme structure
        rhyme = style_profile['rhyme_preferences'][0]
        if any(pattern in rhyme for pattern in ['ABAB', 'ABBA', 'AABB']):
            traditional_indicators += 1
        elif rhyme in ['unknown', 'none']:
            modern_indicators += 1
        
        # Check thematic content
        themes = style_profile['thematic_tendencies']
        traditional_themes = ['patrie', 'natura', 'religie']
        modern_themes = ['social', 'urban', 'existential']
        
        for theme in themes:
            if any(trad in theme for trad in traditional_themes):
                traditional_indicators += 1
            elif any(mod in theme for mod in modern_themes):
                modern_indicators += 1
        
        # Classification based on indicators
        if traditional_indicators > modern_indicators:
            return f"Traditional (score: {traditional_indicators}/{traditional_indicators + modern_indicators})"
        elif modern_indicators > traditional_indicators:
            return f"Modern (score: {modern_indicators}/{traditional_indicators + modern_indicators})"
        else:
            return "Transitional/Hybrid"
    
    async def _identify_unique_elements(self, style_profile: Dict[str, Any]) -> List[str]:
        """Identify unique stylistic elements in the poem."""
        unique_elements = []
        
        # Unusual meter combinations
        meter = style_profile['meter_preferences'][0]
        if 'irregular' in meter:
            unique_elements.append(f"Irregular meter pattern: {meter}")
        
        # Rich literary device usage
        device_count = len(style_profile['literary_device_usage'])
        if device_count >= 5:
            unique_elements.append(f"Rich literary device usage ({device_count} devices)")
        
        # Multiple thematic layers
        theme_count = len(style_profile['thematic_tendencies'])
        if theme_count >= 4:
            unique_elements.append(f"Multi-layered thematic structure ({theme_count} themes)")
        
        # Strong cultural integration
        cultural_count = len(style_profile['cultural_engagement'])
        if cultural_count >= 3:
            unique_elements.append(f"Strong cultural grounding ({cultural_count} references)")
        
        # High complexity
        if style_profile['complexity_level'] >= 0.8:
            unique_elements.append(f"High linguistic complexity ({style_profile['complexity_level']:.2f})")
        
        # High quality indicators
        if style_profile['quality_indicators'] >= 0.8:
            unique_elements.append(f"Exceptional literary quality ({style_profile['quality_indicators']:.2f})")
        
        return unique_elements

# Example usage and testing
async def test_romanian_literature_analyzer():
    """Test the Romanian Literature Analyzer."""
    print("📚 Testing Romanian Literature & Poetry Analyzer")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = RomanianLiteratureAnalyzer()
    success = await analyzer.initialize()
    
    if not success:
        print("❌ Failed to initialize literature analyzer")
        return
    
    print("✅ Literature analyzer initialized successfully")
    
    # Test poem 1: Sample Eminescu-style poem
    eminescu_style = """
    În grădina cu flori dalbe,
    Unde umbra nopții cade,
    Sufletul meu trist se scaldă
    În visări și în jale.
    
    Dorul meu ca vântul bate
    Prin copacii bătrâni, rari,
    Și îmi spune de-o iubire
    Ce nu mai poate să-mi pară.
    """
    
    print("\n🎭 Test 1: Analyzing Eminescu-style poem")
    analysis1 = await analyzer.analyze_poem(eminescu_style, "Dor și Jale", "Anonymous")
    print(f"Meter: {analysis1.meter_pattern}")
    print(f"Rhyme scheme: {analysis1.rhyme_scheme}")
    print(f"Literary devices: {analysis1.literary_devices}")
    print(f"Themes: {analysis1.thematic_elements}")
    print(f"Emotional tone: {analysis1.emotional_tone}")
    print(f"Quality score: {analysis1.quality_score:.3f}")
    print(f"Complexity score: {analysis1.complexity_score:.3f}")
    
    # Test poem 2: Folk-style poem
    folk_style = """
    Sus pe munte, jos pe vale,
    Țăranul cu plug își face,
    Brăzdat lan după lan frumos,
    Pentru neamul românesc.
    
    Cântă cocoșul în zori,
    Soarele răsare-n câmp,
    Și copiii vin la școală
    Să învețe din străbuni.
    """
    
    print("\n🏞️ Test 2: Analyzing folk-style poem")
    analysis2 = await analyzer.analyze_poem(folk_style, "Viața la Țară", "Popular")
    print(f"Meter: {analysis2.meter_pattern}")
    print(f"Rhyme scheme: {analysis2.rhyme_scheme}")
    print(f"Themes: {analysis2.thematic_elements}")
    print(f"Cultural references: {analysis2.cultural_references}")
    print(f"Historical context: {analysis2.historical_context}")
    
    # Test 3: Style identification
    print("\n🔍 Test 3: Author style identification")
    style_analysis = await analyzer.identify_author_style(eminescu_style)
    print(f"Style classification: {style_analysis['style_classification']}")
    print(f"Possible authors: {style_analysis['possible_authors']}")
    print(f"Unique characteristics: {style_analysis['unique_characteristics']}")
    
    # Test 4: Complex modern poem
    modern_poem = """
    În labirintul urban de sticlă și oțel,
    Sufletul rătăcește prin amintiri
    De codri verzi și cer senin,
    Unde timpul nu avea grija zilei de mâine.
    
    Tehnologia ne-a îmbrățișat
    Cu brațe reci de algoritmi,
    Dar inima română încă bate
    La ritmul doinelor străbune.
    """
    
    print("\n🏙️ Test 4: Analyzing modern poem")
    analysis3 = await analyzer.analyze_poem(modern_poem, "Nostalgie Urbană", "Contemporary")
    print(f"Meter: {analysis3.meter_pattern}")
    print(f"Literary devices: {analysis3.literary_devices}")
    print(f"Themes: {analysis3.thematic_elements}")
    print(f"Emotional tone: {analysis3.emotional_tone}")
    print(f"Historical context: {analysis3.historical_context}")
    
    print("\n✅ All literature analysis tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_romanian_literature_analyzer())

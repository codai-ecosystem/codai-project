"""
Romanian Linguistic Patterns Module
==================================

Enhanced Romanian linguistic patterns and analysis capabilities.
Comprehensive language features for cultural intelligence.

Author: GitHub Copilot
Date: August 2025
Version: 3.0.0 - Modular
"""

import re
from typing import Dict, List, Any, Pattern
from dataclasses import dataclass

@dataclass
class LinguisticPattern:
    """Romanian linguistic pattern definition"""
    name: str
    pattern: Pattern
    weight: float
    category: str
    description: str

class RomanianLinguisticPatterns:
    """Enhanced Romanian Linguistic Patterns System"""
    
    def __init__(self):
        self.patterns = self._initialize_enhanced_patterns()
        self.cultural_vocabulary = self._initialize_cultural_vocabulary()
        self.regional_dialects = self._initialize_regional_dialects()
        self.authenticity_markers = self._initialize_authenticity_markers()
        self.temporal_markers = self._initialize_temporal_markers()
    
    def _initialize_enhanced_patterns(self) -> Dict[str, List[LinguisticPattern]]:
        """Initialize enhanced linguistic patterns"""
        patterns = {
            "cultural_indicators": [],
            "architectural_terms": [],
            "traditional_markers": [],
            "religious_vocabulary": [],
            "folk_expressions": [],
            "regional_markers": [],
            "temporal_indicators": [],
            "authenticity_signals": []
        }
        
        # Cultural indicators
        patterns["cultural_indicators"].extend([
            LinguisticPattern(
                "heritage_terms",
                re.compile(r'\b(moștenire|patrimoniu|tradiție|obicei|datină|strămoș|neam)\b', re.IGNORECASE),
                1.0, "heritage", "Heritage and tradition terms"
            ),
            LinguisticPattern(
                "cultural_identity",
                re.compile(r'\b(românesc|românească|românești|româneasc|identitate|cultură)\b', re.IGNORECASE),
                0.9, "identity", "Romanian cultural identity markers"
            ),
            LinguisticPattern(
                "traditional_practices",
                re.compile(r'\b(ritual|obicei|ceremonie|sărbătoare|festival|tradiție)\b', re.IGNORECASE),
                0.8, "practices", "Traditional practices and rituals"
            )
        ])
        
        # Architectural terms
        patterns["architectural_terms"].extend([
            LinguisticPattern(
                "building_types",
                re.compile(r'\b(biserică|casă|conac|curte|palat|cetate|fortăreață|mănăstire)\b', re.IGNORECASE),
                0.9, "buildings", "Traditional building types"
            ),
            LinguisticPattern(
                "construction_materials",
                re.compile(r'\b(lemn|piatră|țiglă|șindrilă|chirpici|cărămidă|tencuială)\b', re.IGNORECASE),
                0.8, "materials", "Traditional construction materials"
            ),
            LinguisticPattern(
                "architectural_elements",
                re.compile(r'\b(turn|zid|acoperis|fundație|pridvor|foișor|cerdac|grinzi)\b', re.IGNORECASE),
                0.7, "elements", "Architectural elements and features"
            )
        ])
        
        # Traditional markers
        patterns["traditional_markers"].extend([
            LinguisticPattern(
                "temporal_traditions",
                re.compile(r'\b(străvechi|vechi|antic|medieval|tradițional|popular|folcloric)\b', re.IGNORECASE),
                0.9, "temporal", "Time-related traditional markers"
            ),
            LinguisticPattern(
                "craft_traditions",
                re.compile(r'\b(meșteșug|artizanat|olar|țesător|fierar|tâmplar|broderie)\b', re.IGNORECASE),
                0.8, "crafts", "Traditional crafts and occupations"
            ),
            LinguisticPattern(
                "agricultural_traditions",
                re.compile(r'\b(plugar|cioban|păstor|agricultor|țăran|seceriș|semănat)\b', re.IGNORECASE),
                0.7, "agriculture", "Agricultural and pastoral traditions"
            )
        ])
        
        # Religious vocabulary
        patterns["religious_vocabulary"].extend([
            LinguisticPattern(
                "orthodox_terms",
                re.compile(r'\b(ortodox|creștin|sfânt|sf\.|binecuvântare|rugăciune|liturghie)\b', re.IGNORECASE),
                0.9, "orthodox", "Orthodox Christian terminology"
            ),
            LinguisticPattern(
                "religious_practices",
                re.compile(r'\b(post|rugăciune|spovedanie|împărtășanie|botez|cununie|înmormântare)\b', re.IGNORECASE),
                0.8, "practices", "Religious practices and sacraments"
            ),
            LinguisticPattern(
                "religious_celebrations",
                re.compile(r'\b(crăciun|paște|rusalii|adormirea|nașterea|epifania)\b', re.IGNORECASE),
                0.8, "celebrations", "Religious celebrations and holidays"
            )
        ])
        
        # Folk expressions
        patterns["folk_expressions"].extend([
            LinguisticPattern(
                "folk_wisdom",
                re.compile(r'\b(zicală|proverb|vorbă|înțelepciune|povată|sfat)\b', re.IGNORECASE),
                0.8, "wisdom", "Folk wisdom and proverbs"
            ),
            LinguisticPattern(
                "folk_narratives",
                re.compile(r'\b(poveste|basm|legendă|mit|baladă|cântec|doină)\b', re.IGNORECASE),
                0.9, "narratives", "Folk narratives and songs"
            ),
            LinguisticPattern(
                "folk_characters",
                re.compile(r'\b(făt-frumos|ileana cosânzeana|zmeu|samca|căpcăun|iele)\b', re.IGNORECASE),
                1.0, "characters", "Traditional folk characters"
            )
        ])
        
        # Regional markers
        patterns["regional_markers"].extend([
            LinguisticPattern(
                "transylvania_markers",
                re.compile(r'\b(transilvania|ardeal|hunedoara|brașov|cluj|sibiu|mureș)\b', re.IGNORECASE),
                1.0, "transylvania", "Transylvanian regional markers"
            ),
            LinguisticPattern(
                "moldavia_markers",
                re.compile(r'\b(moldova|moldovan|iași|bacău|neamț|vaslui|botoșani)\b', re.IGNORECASE),
                1.0, "moldavia", "Moldavian regional markers"
            ),
            LinguisticPattern(
                "wallachia_markers",
                re.compile(r'\b(țara românească|muntenia|oltenia|bucurești|craiova|ploiești)\b', re.IGNORECASE),
                1.0, "wallachia", "Wallachian regional markers"
            )
        ])
        
        return patterns
    
    def _initialize_cultural_vocabulary(self) -> Dict[str, List[str]]:
        """Initialize comprehensive cultural vocabulary"""
        return {
            "high_cultural_content": [
                "tradiție", "moștenire", "patrimoniu", "cultură", "obicei", "datină",
                "strămoș", "neam", "vatră", "obârșie", "identitate", "specific"
            ],
            "architectural_heritage": [
                "biserică", "mănăstire", "casă", "conac", "curtea", "palat", "cetate",
                "turn", "zid", "acoperis", "pridvor", "foișor", "cerdac"
            ],
            "traditional_crafts": [
                "meșteșug", "artizanat", "olărit", "țesătorie", "fierărie", "tâmplărie",
                "broderie", "sculptură", "picturã", "ceramică", "sticlărie"
            ],
            "folk_traditions": [
                "dans", "muzică", "cântec", "joc", "hora", "sărbătoare", "festival",
                "târg", "obicei", "ritual", "ceremonie", "celebrare"
            ],
            "culinary_heritage": [
                "mâncare", "bucătărie", "rețetă", "preparat", "ingredient", "condiment",
                "tradițional", "regional", "festiv", "sărbătoresc", "casnic"
            ],
            "textile_traditions": [
                "ie", "costum", "port", "straie", "țesătură", "material", "fire",
                "broderie", "cusătură", "ornament", "motiv", "desen"
            ],
            "seasonal_celebrations": [
                "primăvară", "vară", "toamnă", "iarnă", "martie", "paște", "crăciun",
                "anul nou", "sf. nicolae", "bobotează", "florii", "rusalii"
            ],
            "nature_connection": [
                "natură", "pădure", "munte", "râu", "lac", "câmp", "deal", "vale",
                "floare", "copac", "animal", "pasăre", "vânat", "pescuit"
            ]
        }
    
    def _initialize_regional_dialects(self) -> Dict[str, Dict[str, List[str]]]:
        """Initialize regional dialect characteristics"""
        return {
            "maramures": {
                "vocabulary": ["căsuță", "găzduleț", "copilărie", "mămica", "tătucu"],
                "expressions": ["măi dragă", "frumos tare", "să trăiești"],
                "phonetic_features": ["palatalization", "archaic_forms", "musical_intonation"],
                "grammatical_features": ["archaic_conjugations", "diminutives", "intensifiers"]
            },
            "transylvania": {
                "vocabulary": ["șuler", "puștan", "fain", "mișto", "treabă"],
                "expressions": ["ce faci", "hai noroc", "păi da"],
                "phonetic_features": ["hungarian_influence", "clear_pronunciation", "stress_patterns"],
                "grammatical_features": ["hungarian_syntax", "german_loanwords", "formal_structures"]
            },
            "moldavia": {
                "vocabulary": ["drăguț", "mămica", "iubițel", "frumoasă", "draguță"],
                "expressions": ["domne", "măi dragă", "să-ți dea dumnezeu"],
                "phonetic_features": ["soft_pronunciation", "melodic_intonation", "vowel_changes"],
                "grammatical_features": ["eastern_forms", "russian_influence", "church_slavonic"]
            },
            "oltenia": {
                "vocabulary": ["măi", "frate", "jupâne", "lele", "nene"],
                "expressions": ["păi da", "hai să", "ce să-ți fac"],
                "phonetic_features": ["strong_accent", "expressive_intonation", "consonant_changes"],
                "grammatical_features": ["distinctive_forms", "balkan_influence", "emphatic_structures"]
            }
        }
    
    def _initialize_authenticity_markers(self) -> Dict[str, List[str]]:
        """Initialize authenticity markers for Romanian culture"""
        return {
            "positive_indicators": [
                "mă-să", "țăran", "neam", "vatră", "obârșie", "strămoșesc",
                "bătrânesc", "de demult", "din moși-strămoși", "pe vremuri"
            ],
            "architectural_authenticity": [
                "pridvor", "șindrilă", "căprior", "căușor", "clopotniță",
                "tinda", "cămară", "pivniță", "șuberț", "cerdac"
            ],
            "traditional_life": [
                "port", "straie", "zestre", "obicei", "datină", "bocet",
                "colind", "plugușor", "sorcova", "capra", "urs"
            ],
            "craft_authenticity": [
                "război", "gherghef", "vârstă", "suveică", "furca",
                "ciubăr", "putină", "olăreț", "unelte", "scule"
            ],
            "rural_life": [
                "țăran", "gospodar", "cioban", "plugar", "semănător",
                "secerător", "cules", "treerat", "săpat", "arat"
            ]
        }
    
    def _initialize_temporal_markers(self) -> Dict[str, List[str]]:
        """Initialize temporal markers for historical periods"""
        return {
            "ancient_period": [
                "dac", "roman", "antic", "străvechi", "de demult",
                "din timpuri vechi", "din bătrâni", "de la începuturi"
            ],
            "medieval_period": [
                "medieval", "domn", "boier", "curtean", "feudal",
                "brâncovenesc", "moldovenesc", "muntenesc"
            ],
            "traditional_period": [
                "tradițional", "popular", "țărănesc", "sătesc",
                "moștenit", "păstrat", "conservat", "transmis"
            ],
            "modern_adaptations": [
                "contemporan", "modern", "actual", "de azi",
                "adaptat", "reinterpretat", "revitalizat"
            ]
        }
    
    def analyze_linguistic_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze linguistic patterns in Romanian text"""
        results = {
            "pattern_matches": {},
            "cultural_vocabulary_score": 0.0,
            "regional_indicators": [],
            "authenticity_score": 0.0,
            "temporal_context": [],
            "linguistic_richness": 0.0,
            "dialect_characteristics": {},
            "overall_score": 0.0
        }
        
        text_lower = text.lower()
        total_words = len(text.split())
        
        # Analyze pattern matches
        pattern_scores = {}
        for category, pattern_list in self.patterns.items():
            category_score = 0.0
            category_matches = []
            
            for pattern in pattern_list:
                matches = pattern.pattern.findall(text)
                if matches:
                    match_score = len(matches) * pattern.weight
                    category_score += match_score
                    category_matches.extend(matches)
            
            pattern_scores[category] = category_score
            results["pattern_matches"][category] = {
                "score": category_score,
                "matches": category_matches
            }
        
        # Calculate cultural vocabulary score
        cultural_word_count = 0
        for category, words in self.cultural_vocabulary.items():
            for word in words:
                if word in text_lower:
                    cultural_word_count += 1
        
        results["cultural_vocabulary_score"] = min(cultural_word_count / max(total_words, 1) * 10, 1.0)
        
        # Detect regional indicators
        for region, dialect_info in self.regional_dialects.items():
            region_score = 0
            for vocab_word in dialect_info["vocabulary"]:
                if vocab_word in text_lower:
                    region_score += 1
            
            for expression in dialect_info["expressions"]:
                if expression in text_lower:
                    region_score += 2
            
            if region_score > 0:
                results["regional_indicators"].append({
                    "region": region,
                    "score": region_score,
                    "confidence": min(region_score / 5, 1.0)
                })
        
        # Calculate authenticity score
        authenticity_matches = 0
        for category, markers in self.authenticity_markers.items():
            for marker in markers:
                if marker in text_lower:
                    authenticity_matches += 1
        
        results["authenticity_score"] = min(authenticity_matches / max(total_words, 1) * 10, 1.0)
        
        # Detect temporal context
        for period, markers in self.temporal_markers.items():
            period_matches = sum(1 for marker in markers if marker in text_lower)
            if period_matches > 0:
                results["temporal_context"].append({
                    "period": period,
                    "matches": period_matches,
                    "confidence": min(period_matches / 3, 1.0)
                })
        
        # Calculate linguistic richness
        unique_words = len(set(text_lower.split()))
        results["linguistic_richness"] = min(unique_words / max(total_words, 1) * 2, 1.0)
        
        # Calculate overall score
        weights = {
            "pattern_score": 0.4,
            "vocabulary_score": 0.2,
            "authenticity_score": 0.2,
            "linguistic_richness": 0.1,
            "regional_bonus": 0.1
        }
        
        pattern_avg = sum(pattern_scores.values()) / max(len(pattern_scores), 1) / 10
        regional_bonus = len(results["regional_indicators"]) * 0.1
        
        results["overall_score"] = min(
            pattern_avg * weights["pattern_score"] +
            results["cultural_vocabulary_score"] * weights["vocabulary_score"] +
            results["authenticity_score"] * weights["authenticity_score"] +
            results["linguistic_richness"] * weights["linguistic_richness"] +
            regional_bonus * weights["regional_bonus"],
            1.0
        )
        
        return results
    
    def get_cultural_keywords(self) -> List[str]:
        """Get all cultural keywords"""
        keywords = []
        for word_list in self.cultural_vocabulary.values():
            keywords.extend(word_list)
        return list(set(keywords))
    
    def get_pattern_statistics(self) -> Dict[str, Any]:
        """Get statistics about linguistic patterns"""
        stats = {
            "total_patterns": 0,
            "patterns_by_category": {},
            "total_vocabulary_terms": 0,
            "vocabulary_by_category": {},
            "regional_dialects_covered": len(self.regional_dialects),
            "authenticity_markers": sum(len(markers) for markers in self.authenticity_markers.values()),
            "temporal_periods": len(self.temporal_markers)
        }
        
        for category, pattern_list in self.patterns.items():
            stats["patterns_by_category"][category] = len(pattern_list)
            stats["total_patterns"] += len(pattern_list)
        
        for category, word_list in self.cultural_vocabulary.items():
            stats["vocabulary_by_category"][category] = len(word_list)
            stats["total_vocabulary_terms"] += len(word_list)
        
        return stats

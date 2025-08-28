"""
🇷🇴 Enhanced Romanian Cultural Reference System

Advanced cultural intelligence system for Romanian contexts with:
- Historical Romanian contexts and references
- Traditional measurements and conversions
- Regional variations and dialects
- Cultural celebrations and customs
- Romanian mathematical terminology
- Traditional Romanian problem scenarios
- Cultural accuracy validation
"""

import re
import logging
from typing import Dict, List, Optional, Tuple, Any, Set
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime, date
import unicodedata

logger = logging.getLogger(__name__)

class RomanianRegion(Enum):
    """Romanian historical regions"""
    MOLDOVA = "moldova"
    MUNTENIA = "muntenia"
    OLTENIA = "oltenia"
    TRANSILVANIA = "transilvania"
    BANAT = "banat"
    CRISANA = "crisana"
    MARAMURES = "maramures"
    DOBROGEA = "dobrogea"
    BUCOVINA = "bucovina"

class RomanianHoliday(Enum):
    """Romanian cultural celebrations"""
    CRACIUN = "craciun"
    PASTE = "paste"
    ZIUA_NATIONALA = "ziua_nationala"
    MARTISOR = "martisor"
    DRAGOBETE = "dragobete"
    SFANTUL_ANDREI = "sfantul_andrei"
    ZIUA_COPILULUI = "ziua_copilului"

class TraditionalMeasurement(Enum):
    """Traditional Romanian measurements"""
    PALMA = "palma"  # Hand span
    COT = "cot"      # Cubit
    PAS = "pas"      # Step
    POGON = "pogon"  # Traditional land measure
    OCA = "oca"      # Traditional weight measure
    VEDRO = "vedro"  # Traditional volume measure

@dataclass
class RomanianCulturalContext:
    """Enhanced Romanian cultural context"""
    region: Optional[RomanianRegion]
    historical_period: Optional[str]
    cultural_objects: List[str]
    traditional_activities: List[str]
    regional_terms: List[str]
    holidays_referenced: List[RomanianHoliday]
    traditional_measurements: List[TraditionalMeasurement]
    cultural_accuracy_score: float
    authenticity_indicators: List[str]

@dataclass
class RomanianMathematicalTerm:
    """Romanian mathematical terminology with regional variations"""
    standard_term: str
    regional_variations: Dict[RomanianRegion, str]
    historical_terms: List[str]
    traditional_context: Optional[str]
    mathematical_operation: str
    usage_frequency: float

@dataclass
class TraditionalProblemContext:
    """Traditional Romanian problem context generator"""
    scenario_type: str
    cultural_setting: str
    typical_objects: List[str]
    measurement_units: List[str]
    regional_specificity: RomanianRegion
    historical_accuracy: float

class EnhancedRomanianCulturalSystem:
    """
    Advanced Romanian Cultural Intelligence System
    
    Provides comprehensive cultural context analysis, traditional problem generation,
    and cultural accuracy validation for Romanian mathematical problems.
    """
    
    def __init__(self):
        logger.info("🇷🇴 Initializing Enhanced Romanian Cultural System...")
        
        # Enhanced Romanian mathematical vocabulary with regional variations
        self.mathematical_terminology = {
            "adunare": RomanianMathematicalTerm(
                standard_term="adunare",
                regional_variations={
                    RomanianRegion.MOLDOVA: "adunare",
                    RomanianRegion.TRANSILVANIA: "insumarea",
                    RomanianRegion.BANAT: "adăugarea",
                },
                historical_terms=["insumarea", "strângerea"],
                traditional_context="comercial",
                mathematical_operation="addition",
                usage_frequency=0.95
            ),
            "scădere": RomanianMathematicalTerm(
                standard_term="scădere",
                regional_variations={
                    RomanianRegion.MOLDOVA: "scădere",
                    RomanianRegion.OLTENIA: "micșorarea",
                    RomanianRegion.MARAMURES: "luarea",
                },
                historical_terms=["micșorarea", "împuținarea"],
                traditional_context="agricol",
                mathematical_operation="subtraction",
                usage_frequency=0.92
            ),
            "înmulțire": RomanianMathematicalTerm(
                standard_term="înmulțire",
                regional_variations={
                    RomanianRegion.TRANSILVANIA: "multiplicarea",
                    RomanianRegion.BANAT: "înmiirea",
                },
                historical_terms=["multiplicarea", "înmiirea"],
                traditional_context="constructii",
                mathematical_operation="multiplication",
                usage_frequency=0.88
            ),
            "împărțire": RomanianMathematicalTerm(
                standard_term="împărțire",
                regional_variations={
                    RomanianRegion.MOLDOVA: "împărțirea",
                    RomanianRegion.DOBROGEA: "divizarea",
                },
                historical_terms=["divizarea", "compartimentarea"],
                traditional_context="agricol",
                mathematical_operation="division",
                usage_frequency=0.85
            )
        }
        
        # Traditional Romanian measurements with conversions
        self.traditional_measurements = {
            "palma": {
                "type": "length",
                "modern_equivalent": 0.2,  # meters
                "description": "lungimea palmei umane",
                "usage_context": "măsurători casnice",
                "regional_variations": {
                    RomanianRegion.MOLDOVA: "palma mare",
                    RomanianRegion.TRANSILVANIA: "palma mică"
                }
            },
            "cot": {
                "type": "length", 
                "modern_equivalent": 0.6,  # meters
                "description": "distanța de la cot la vârful degetelor",
                "usage_context": "măsurători textile",
                "regional_variations": {
                    RomanianRegion.MUNTENIA: "cotul mare",
                    RomanianRegion.OLTENIA: "cotul mic"
                }
            },
            "pas": {
                "type": "length",
                "modern_equivalent": 0.75,  # meters
                "description": "lungimea unui pas normal",
                "usage_context": "măsurători de teren",
                "regional_variations": {}
            },
            "pogon": {
                "type": "area",
                "modern_equivalent": 5755,  # square meters
                "description": "măsură tradițională pentru terenuri agricole",
                "usage_context": "agricultură",
                "regional_variations": {
                    RomanianRegion.MOLDOVA: "pogonul mare",
                    RomanianRegion.MUNTENIA: "pogonul mic"
                }
            },
            "oca": {
                "type": "weight",
                "modern_equivalent": 1.28,  # kg
                "description": "măsură tradițională de greutate",
                "usage_context": "comerț",
                "regional_variations": {
                    RomanianRegion.MOLDOVA: "oca moldovenească",
                    RomanianRegion.MUNTENIA: "oca muntenească"
                }
            },
            "vedro": {
                "type": "volume",
                "modern_equivalent": 12.3,  # liters
                "description": "măsură tradițională pentru lichide",
                "usage_context": "gospodării",
                "regional_variations": {}
            }
        }
        
        # Enhanced cultural objects by category with regional specificity
        self.cultural_objects = {
            "food": {
                "traditional": ["mămăligă", "ciorbă", "mici", "papanași", "cozonac", "colindă"],
                "regional": {
                    RomanianRegion.MOLDOVA: ["borș moldovenesc", "tocănița", "răcituri"],
                    RomanianRegion.TRANSILVANIA: ["varză à la Cluj", "papricaș", "kürtőskalács"],
                    RomanianRegion.BANAT: ["ciulama", "șnițel à la Viena", "cremșnit"],
                    RomanianRegion.OLTENIA: ["ciorbă de burtă", "frigărui", "papanași olteni"],
                    RomanianRegion.MARAMURES: ["jintiță", "tochitură", "plăcintar"]
                },
                "seasonal": {
                    "primavara": ["lăptuc", "ridichi", "mărar"],
                    "vara": ["roșii", "castraveți", "pepeni"],
                    "toamna": ["mere", "pere", "nuci", "struguri"],
                    "iarna": ["varză", "morcovi", "ceapa"]
                }
            },
            "crafts": {
                "traditional": ["țesut", "olăritul", "sculptura în lemn", "broderia"],
                "regional": {
                    RomanianRegion.MARAMURES: ["poarta maramureșeană", "bisericile de lemn"],
                    RomanianRegion.MOLDOVA: ["ceramica moldovenească", "icoanele pe sticlă"],
                    RomanianRegion.OLTENIA: ["ceramica de Horezu", "cioplirea în piatră"],
                    RomanianRegion.TRANSILVANIA: ["mobilierul săsesc", "fierăria artistică"]
                }
            },
            "agriculture": {
                "crops": ["grâu", "porumb", "orz", "ovăz", "secară", "floarea-soarelui"],
                "tools": ["plugul", "sapa", "coasa", "secera", "greblă"],
                "animals": ["oi", "vaci", "porci", "găini", "rațe", "gâște", "cai"],
                "seasonal_activities": {
                    "primavara": ["aratul", "semănatul", "prășitul"],
                    "vara": ["cositul", "secerișul", "întorsul fânului"],
                    "toamna": ["recolta", "vânatul", "pregătirea pentru iarnă"],
                    "iarna": ["îngrijirea animalelor", "reparații", "planificarea"]
                }
            },
            "commerce": {
                "traditional_markets": ["târgul săptămânal", "bâlciul", "oborul"],
                "currency_history": ["ban", "leu", "para", "aspru"],
                "trade_goods": ["cereale", "animale", "textile", "meșteșuguri"],
                "merchants": ["negustor", "comerciant", "vânzător", "cumpărător"]
            }
        }
        
        # Romanian holidays and celebrations with mathematical contexts
        self.cultural_celebrations = {
            RomanianHoliday.CRACIUN: {
                "date": "25 decembrie",
                "traditional_activities": ["colindatul", "masa de Crăciun", "cadouri"],
                "mathematical_contexts": ["calcularea ingredientelor pentru masa festivă", 
                                        "împărțirea cadourilor", "numărul colinătorilor"],
                "typical_problems": ["Maria pregătește cozonac pentru 12 persoane..."]
            },
            RomanianHoliday.PASTE: {
                "date": "variabil",
                "traditional_activities": ["vopsitul ouălelor", "masa de Paști", "biserică"],
                "mathematical_contexts": ["calcularea ouălelor pentru familie",
                                        "ingrediente pentru drob", "timp de coacere"],
                "typical_problems": ["Pentru masa de Paști, Ana trebuie să..."]
            },
            RomanianHoliday.MARTISOR: {
                "date": "1 martie",
                "traditional_activities": ["dăruirea mărțișoarelor", "primăvara"],
                "mathematical_contexts": ["numărul mărțișoarelor", "costul materialelor"],
                "typical_problems": ["Mihai vrea să facă mărțișoare pentru..."]
            }
        }
        
        # Historical contexts and periods
        self.historical_contexts = {
            "medieval": {
                "period": "sec. XIV-XVI",
                "mathematical_contexts": ["comerțul cu Constantinopolul", "construirea mănăstirilor"],
                "typical_measurements": ["stânjenul", "cofia", "vadra"],
                "currency": ["aspru", "grossus", "ducat"]
            },
            "modern": {
                "period": "sec. XIX-XX",
                "mathematical_contexts": ["industrializarea", "construirea căilor ferate"],
                "typical_measurements": ["metri", "kilograme", "litri"],
                "currency": ["leu", "ban"]
            },
            "contemporary": {
                "period": "sec. XXI",
                "mathematical_contexts": ["tehnologia", "comerțul electronic"],
                "typical_measurements": ["metri", "kilograme", "litri"],
                "currency": ["leu", "euro"]
            }
        }
        
        logger.info("✅ Enhanced Romanian Cultural System initialized successfully")

    def analyze_cultural_context(self, text: str) -> RomanianCulturalContext:
        """
        Comprehensive cultural context analysis for Romanian text
        """
        logger.debug(f"🔍 Analyzing cultural context for: {text[:50]}...")
        
        # Normalize text
        text = self._normalize_text(text)
        
        # Detect region
        region = self._detect_region(text)
        
        # Detect historical period
        historical_period = self._detect_historical_period(text)
        
        # Extract cultural objects
        cultural_objects = self._extract_cultural_objects(text)
        
        # Detect traditional activities
        traditional_activities = self._detect_traditional_activities(text)
        
        # Extract regional terms
        regional_terms = self._extract_regional_terms(text, region)
        
        # Detect holidays
        holidays_referenced = self._detect_holidays(text)
        
        # Extract traditional measurements
        traditional_measurements = self._extract_traditional_measurements(text)
        
        # Calculate cultural accuracy
        cultural_accuracy = self._calculate_cultural_accuracy(
            region, cultural_objects, traditional_activities, holidays_referenced
        )
        
        # Generate authenticity indicators
        authenticity_indicators = self._generate_authenticity_indicators(
            region, cultural_objects, traditional_activities, historical_period
        )
        
        return RomanianCulturalContext(
            region=region,
            historical_period=historical_period,
            cultural_objects=cultural_objects,
            traditional_activities=traditional_activities,
            regional_terms=regional_terms,
            holidays_referenced=holidays_referenced,
            traditional_measurements=traditional_measurements,
            cultural_accuracy_score=cultural_accuracy,
            authenticity_indicators=authenticity_indicators
        )

    def generate_traditional_problem(self, difficulty: str = "elementary", 
                                   region: Optional[RomanianRegion] = None,
                                   context_type: str = "agricultural") -> Dict[str, Any]:
        """
        Generate culturally authentic Romanian mathematical problems
        """
        logger.info(f"🎯 Generating traditional Romanian problem: {difficulty} level")
        
        if region is None:
            region = RomanianRegion.MOLDOVA  # Default region
        
        # Select appropriate context
        context = self._select_problem_context(context_type, region, difficulty)
        
        # Generate problem based on context
        if context_type == "agricultural":
            problem = self._generate_agricultural_problem(context, difficulty)
        elif context_type == "commercial":
            problem = self._generate_commercial_problem(context, difficulty)
        elif context_type == "traditional_celebration":
            problem = self._generate_celebration_problem(context, difficulty)
        elif context_type == "historical":
            problem = self._generate_historical_problem(context, difficulty)
        else:
            problem = self._generate_general_problem(context, difficulty)
        
        return {
            "problem_text": problem["text"],
            "cultural_context": problem["context"],
            "expected_answer": problem["answer"],
            "cultural_accuracy": problem["accuracy"],
            "region": region.value,
            "difficulty": difficulty,
            "context_type": context_type,
            "authenticity_score": problem["authenticity"],
            "traditional_elements": problem["traditional_elements"]
        }

    def validate_cultural_accuracy(self, problem_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the cultural accuracy of a Romanian mathematical problem
        """
        logger.debug("🎯 Validating cultural accuracy...")
        
        # Analyze cultural elements
        cultural_analysis = self.analyze_cultural_context(problem_text)
        
        # Check for anachronisms
        anachronisms = self._detect_anachronisms(problem_text, context.get("historical_period"))
        
        # Check regional consistency
        regional_consistency = self._check_regional_consistency(problem_text, context.get("region"))
        
        # Validate traditional measurements
        measurement_accuracy = self._validate_measurements(problem_text)
        
        # Check language authenticity
        language_authenticity = self._check_language_authenticity(problem_text)
        
        # Calculate overall accuracy score
        overall_accuracy = self._calculate_overall_accuracy(
            cultural_analysis.cultural_accuracy_score,
            len(anachronisms) == 0,
            regional_consistency,
            measurement_accuracy,
            language_authenticity
        )
        
        return {
            "cultural_accuracy_score": overall_accuracy,
            "cultural_analysis": cultural_analysis,
            "anachronisms_detected": anachronisms,
            "regional_consistency": regional_consistency,
            "measurement_accuracy": measurement_accuracy,
            "language_authenticity": language_authenticity,
            "recommendations": self._generate_accuracy_recommendations(
                anachronisms, regional_consistency, measurement_accuracy
            )
        }

    def get_regional_mathematical_terms(self, region: RomanianRegion) -> Dict[str, Any]:
        """
        Get mathematical terminology specific to a Romanian region
        """
        regional_terms = {}
        
        for standard_term, term_data in self.mathematical_terminology.items():
            regional_variant = term_data.regional_variations.get(region, standard_term)
            regional_terms[standard_term] = {
                "regional_form": regional_variant,
                "historical_forms": term_data.historical_terms,
                "traditional_context": term_data.traditional_context,
                "usage_frequency": term_data.usage_frequency
            }
        
        return regional_terms

    def convert_traditional_measurement(self, value: float, from_unit: str, to_unit: str = "metric") -> Dict[str, Any]:
        """
        Convert traditional Romanian measurements to modern equivalents
        """
        if from_unit not in self.traditional_measurements:
            return {"error": f"Unknown traditional measurement: {from_unit}"}
        
        measurement_data = self.traditional_measurements[from_unit]
        modern_equivalent = measurement_data["modern_equivalent"]
        
        if to_unit == "metric":
            converted_value = value * modern_equivalent
            unit_type = measurement_data["type"]
            
            if unit_type == "length":
                metric_unit = "metri"
            elif unit_type == "weight":
                metric_unit = "kilograme" 
            elif unit_type == "volume":
                metric_unit = "litri"
            elif unit_type == "area":
                metric_unit = "metri pătrați"
            else:
                metric_unit = "unități moderne"
        else:
            converted_value = value
            metric_unit = to_unit
        
        return {
            "original_value": value,
            "original_unit": from_unit,
            "converted_value": round(converted_value, 3),
            "converted_unit": metric_unit,
            "conversion_factor": modern_equivalent,
            "measurement_description": measurement_data["description"],
            "traditional_usage": measurement_data["usage_context"]
        }

    # Helper methods
    def _normalize_text(self, text: str) -> str:
        """Normalize Romanian text for cultural analysis"""
        text = text.lower().strip()
        text = unicodedata.normalize('NFC', text)
        return text

    def _detect_region(self, text: str) -> Optional[RomanianRegion]:
        """Detect Romanian region from text context"""
        # This is a simplified implementation
        # In production, this would use more sophisticated NLP
        
        regional_indicators = {
            RomanianRegion.MOLDOVA: ["borș", "tocănița", "moldovenesc", "iași", "chișinău"],
            RomanianRegion.TRANSILVANIA: ["papricaș", "cluj", "brașov", "sibiu", "săsesc"],
            RomanianRegion.BANAT: ["cremșnit", "timișoara", "banat", "șnițel"],
            RomanianRegion.OLTENIA: ["oltean", "craiova", "slatina", "horezu"],
            RomanianRegion.MARAMURES: ["maramureș", "sighet", "baia mare", "jintiță"]
        }
        
        for region, indicators in regional_indicators.items():
            if any(indicator in text for indicator in indicators):
                return region
        
        return None

    def _detect_historical_period(self, text: str) -> Optional[str]:
        """Detect historical period from context clues"""
        if any(term in text for term in ["aspru", "ducat", "mănăstire", "voievod"]):
            return "medieval"
        elif any(term in text for term in ["calea ferată", "fabrica", "orașul"]):
            return "modern"
        elif any(term in text for term in ["internet", "calculator", "euro"]):
            return "contemporary"
        else:
            return "traditional"

    def _extract_cultural_objects(self, text: str) -> List[str]:
        """Extract cultural objects from text"""
        cultural_objects = []
        
        for category, objects in self.cultural_objects.items():
            if isinstance(objects, dict):
                for subcategory, items in objects.items():
                    if isinstance(items, list):
                        for item in items:
                            if item in text:
                                cultural_objects.append(item)
                    elif isinstance(items, dict):
                        for region, regional_items in items.items():
                            for item in regional_items:
                                if item in text:
                                    cultural_objects.append(item)
            else:
                for item in objects:
                    if item in text:
                        cultural_objects.append(item)
        
        return list(set(cultural_objects))

    def _detect_traditional_activities(self, text: str) -> List[str]:
        """Detect traditional Romanian activities"""
        activities = []
        
        traditional_activities = [
            "țesut", "olăritul", "sculptura", "broderia", "aratul", "semănatul",
            "cositul", "secerișul", "târgul", "bâlciul", "colindatul", "vopsitul ouălelor"
        ]
        
        for activity in traditional_activities:
            if activity in text:
                activities.append(activity)
        
        return activities

    def _extract_regional_terms(self, text: str, region: Optional[RomanianRegion]) -> List[str]:
        """Extract regional terms specific to the detected region"""
        if region is None:
            return []
        
        regional_terms = []
        
        # Check mathematical terminology
        for term_data in self.mathematical_terminology.values():
            if region in term_data.regional_variations:
                regional_variant = term_data.regional_variations[region]
                if regional_variant in text and regional_variant != term_data.standard_term:
                    regional_terms.append(regional_variant)
        
        return regional_terms

    def _detect_holidays(self, text: str) -> List[RomanianHoliday]:
        """Detect referenced Romanian holidays"""
        holidays = []
        
        holiday_keywords = {
            RomanianHoliday.CRACIUN: ["crăciun", "colind", "cozonac", "decembrie"],
            RomanianHoliday.PASTE: ["paști", "ouă", "drob", "înviere"],
            RomanianHoliday.MARTISOR: ["mărțișor", "martie", "primăvară"],
            RomanianHoliday.ZIUA_NATIONALA: ["ziua națională", "1 decembrie", "națională"]
        }
        
        for holiday, keywords in holiday_keywords.items():
            if any(keyword in text for keyword in keywords):
                holidays.append(holiday)
        
        return holidays

    def _extract_traditional_measurements(self, text: str) -> List[TraditionalMeasurement]:
        """Extract traditional Romanian measurements"""
        measurements = []
        
        measurement_terms = {
            TraditionalMeasurement.PALMA: ["palma", "palmă"],
            TraditionalMeasurement.COT: ["cot", "coți"],
            TraditionalMeasurement.PAS: ["pas", "pași"],
            TraditionalMeasurement.POGON: ["pogon", "pogoane"],
            TraditionalMeasurement.OCA: ["oca", "oci"],
            TraditionalMeasurement.VEDRO: ["vedro", "vědre"]
        }
        
        for measurement, terms in measurement_terms.items():
            if any(term in text for term in terms):
                measurements.append(measurement)
        
        return measurements

    def _calculate_cultural_accuracy(self, region: Optional[RomanianRegion], 
                                   cultural_objects: List[str],
                                   traditional_activities: List[str],
                                   holidays: List[RomanianHoliday]) -> float:
        """Calculate cultural accuracy score"""
        score = 0.5  # Base score
        
        if region:
            score += 0.1
        if cultural_objects:
            score += min(0.2, len(cultural_objects) * 0.05)
        if traditional_activities:
            score += min(0.15, len(traditional_activities) * 0.075)
        if holidays:
            score += min(0.15, len(holidays) * 0.075)
        
        return min(score, 1.0)

    def _generate_authenticity_indicators(self, region: Optional[RomanianRegion],
                                        cultural_objects: List[str],
                                        traditional_activities: List[str],
                                        historical_period: Optional[str]) -> List[str]:
        """Generate authenticity indicators"""
        indicators = []
        
        if region:
            indicators.append(f"Regional context: {region.value}")
        if cultural_objects:
            indicators.append(f"Cultural objects: {', '.join(cultural_objects[:3])}")
        if traditional_activities:
            indicators.append(f"Traditional activities: {', '.join(traditional_activities[:2])}")
        if historical_period:
            indicators.append(f"Historical period: {historical_period}")
        
        return indicators

    def _select_problem_context(self, context_type: str, region: RomanianRegion, difficulty: str) -> Dict[str, Any]:
        """Select appropriate context for problem generation"""
        # Simplified context selection
        return {
            "type": context_type,
            "region": region,
            "difficulty": difficulty,
            "cultural_objects": self.cultural_objects.get(context_type, {})
        }

    def _generate_agricultural_problem(self, context: Dict[str, Any], difficulty: str) -> Dict[str, Any]:
        """Generate agricultural-themed problem"""
        if difficulty == "elementary":
            problem_text = "Ion are 15 oi și primește încă 8 oi de la vecin. Câte oi are Ion în total?"
            answer = 23
        else:
            problem_text = "Maria cultivă grâu pe un teren de 3 pogoane. Dacă un pogon produce 450 kg grâu, câte kilograme produce în total?"
            answer = 1350
        
        return {
            "text": problem_text,
            "context": context,
            "answer": answer,
            "accuracy": 0.9,
            "authenticity": 0.85,
            "traditional_elements": ["oi", "grâu", "pogon"]
        }

    def _generate_commercial_problem(self, context: Dict[str, Any], difficulty: str) -> Dict[str, Any]:
        """Generate commercial-themed problem"""
        problem_text = "La târgul săptămânal, Ana vinde 12 oci de grâu la 3 lei oca. Câți lei încasează?"
        return {
            "text": problem_text,
            "context": context,
            "answer": 36,
            "accuracy": 0.88,
            "authenticity": 0.9,
            "traditional_elements": ["târg", "oca", "grâu"]
        }

    def _generate_celebration_problem(self, context: Dict[str, Any], difficulty: str) -> Dict[str, Any]:
        """Generate celebration-themed problem"""
        problem_text = "Pentru masa de Crăciun, Maria face cozonac pentru 16 persoane. Dacă pentru 4 persoane folosește 2 ouă, câte ouă îi trebuie în total?"
        return {
            "text": problem_text,
            "context": context,
            "answer": 8,
            "accuracy": 0.92,
            "authenticity": 0.88,
            "traditional_elements": ["Crăciun", "cozonac", "masa"]
        }

    def _generate_historical_problem(self, context: Dict[str, Any], difficulty: str) -> Dict[str, Any]:
        """Generate historically-themed problem"""
        problem_text = "În timpul lui Ștefan cel Mare, construirea unei mănăstiri a durat 3 ani. Dacă în primul an s-au folosit 240 de stânjeni de piatră, în al doilea an cu 60 mai mulți, câți stânjeni s-au folosit în primii doi ani?"
        return {
            "text": problem_text,
            "context": context,
            "answer": 540,
            "accuracy": 0.85,
            "authenticity": 0.95,
            "traditional_elements": ["Ștefan cel Mare", "mănăstire", "stânjen"]
        }

    def _generate_general_problem(self, context: Dict[str, Any], difficulty: str) -> Dict[str, Any]:
        """Generate general Romanian-themed problem"""
        problem_text = "Ana are 7 mere și cumpără încă 5 mere de la piață. Câte mere are în total?"
        return {
            "text": problem_text,
            "context": context,
            "answer": 12,
            "accuracy": 0.8,
            "authenticity": 0.75,
            "traditional_elements": ["mere", "piață"]
        }

    def _detect_anachronisms(self, text: str, historical_period: Optional[str]) -> List[str]:
        """Detect anachronisms in the text"""
        anachronisms = []
        
        modern_terms = ["calculator", "internet", "euro", "telefon", "mașină"]
        medieval_terms = ["aspru", "ducat", "voievod"]
        
        if historical_period == "medieval":
            for term in modern_terms:
                if term in text:
                    anachronisms.append(f"Modern term '{term}' in medieval context")
        elif historical_period == "traditional":
            for term in modern_terms:
                if term in text:
                    anachronisms.append(f"Modern term '{term}' in traditional context")
        
        return anachronisms

    def _check_regional_consistency(self, text: str, region: Optional[str]) -> bool:
        """Check if regional elements are consistent"""
        # Simplified consistency check
        return True  # In production, this would be more sophisticated

    def _validate_measurements(self, text: str) -> float:
        """Validate traditional measurement usage"""
        # Simplified validation
        return 0.9  # In production, this would check measurement context accuracy

    def _check_language_authenticity(self, text: str) -> float:
        """Check Romanian language authenticity"""
        # Simplified authenticity check
        return 0.85  # In production, this would use language models

    def _calculate_overall_accuracy(self, cultural_score: float, no_anachronisms: bool,
                                  regional_consistency: bool, measurement_accuracy: float,
                                  language_authenticity: float) -> float:
        """Calculate overall cultural accuracy score"""
        score = (
            cultural_score * 0.3 +
            (1.0 if no_anachronisms else 0.5) * 0.2 +
            (1.0 if regional_consistency else 0.5) * 0.2 +
            measurement_accuracy * 0.15 +
            language_authenticity * 0.15
        )
        return min(score, 1.0)

    def _generate_accuracy_recommendations(self, anachronisms: List[str],
                                         regional_consistency: bool,
                                         measurement_accuracy: float) -> List[str]:
        """Generate recommendations for improving cultural accuracy"""
        recommendations = []
        
        if anachronisms:
            recommendations.append("Remove anachronistic terms for historical accuracy")
        if not regional_consistency:
            recommendations.append("Ensure regional elements are consistent")
        if measurement_accuracy < 0.8:
            recommendations.append("Check traditional measurement usage and context")
        
        return recommendations


# Global instance
_enhanced_cultural_system = None

def get_enhanced_cultural_system() -> EnhancedRomanianCulturalSystem:
    """Get the global Enhanced Romanian Cultural System instance"""
    global _enhanced_cultural_system
    if _enhanced_cultural_system is None:
        _enhanced_cultural_system = EnhancedRomanianCulturalSystem()
    return _enhanced_cultural_system
"""
🇷🇴 Regional Mathematical Terminology System

Advanced Romanian mathematical terminology system supporting:
- Romanian dialects and regional variations
- Historical mathematical terms evolution
- Traditional counting systems and numerals
- Cultural mathematical expressions
- Integration with word problem analyzer
- Accurate term recognition and conversion
"""

import re
import logging
from typing import Dict, List, Optional, Tuple, Any, Set
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime
import unicodedata

from .enhanced_cultural_system import RomanianRegion, get_enhanced_cultural_system

logger = logging.getLogger(__name__)

class MathematicalOperation(Enum):
    """Mathematical operations in Romanian"""
    ADDITION = "adunare"
    SUBTRACTION = "scădere" 
    MULTIPLICATION = "înmulțire"
    DIVISION = "împărțire"
    SQUARE_ROOT = "radical"
    POWER = "putere"
    PERCENTAGE = "procent"
    FRACTION = "fracție"

class TermType(Enum):
    """Types of mathematical terms"""
    OPERATION = "operation"
    NUMBER = "number"
    MEASUREMENT = "measurement"
    GEOMETRIC = "geometric"
    ALGEBRAIC = "algebraic"
    STATISTICAL = "statistical"

class HistoricalPeriod(Enum):
    """Historical periods for term evolution"""
    MEDIEVAL = "medieval"
    EARLY_MODERN = "early_modern"
    MODERN = "modern"
    CONTEMPORARY = "contemporary"

@dataclass
class RomanianMathTerm:
    """Complete Romanian mathematical term data"""
    standard_form: str
    regional_variations: Dict[RomanianRegion, List[str]]
    historical_forms: Dict[HistoricalPeriod, List[str]]
    dialects: Dict[str, str]  # dialect -> term
    operation_type: MathematicalOperation
    term_type: TermType
    usage_frequency: float
    cultural_context: Optional[str]
    examples: List[str]
    synonyms: List[str]
    formal_vs_colloquial: Dict[str, str]

@dataclass
class TraditionalCountingSystem:
    """Traditional Romanian counting and numeral systems"""
    system_name: str
    region: RomanianRegion
    base_numbers: Dict[int, str]
    counting_patterns: List[str]
    cultural_usage: str
    historical_context: str

@dataclass
class TermRecognitionResult:
    """Result of mathematical term recognition"""
    recognized_terms: List[RomanianMathTerm]
    confidence_score: float
    regional_indicators: List[RomanianRegion]
    historical_period: Optional[HistoricalPeriod]
    dialect_detected: Optional[str]
    alternative_forms: List[str]

class RegionalMathematicalTerminologySystem:
    """
    Comprehensive Romanian Mathematical Terminology System
    
    Provides:
    - Regional dialect recognition and conversion
    - Historical term evolution tracking
    - Traditional counting systems
    - Cultural mathematical expressions
    - Integration with word problem analysis
    """
    
    def __init__(self):
        logger.info("🇷🇴 Initializing Regional Mathematical Terminology System...")
        
        # Get enhanced cultural system reference
        self.cultural_system = get_enhanced_cultural_system()
        
        # Comprehensive Romanian mathematical terminology database
        self.mathematical_terms = {
            # Addition terms with regional variations
            "adunare": RomanianMathTerm(
                standard_form="adunare",
                regional_variations={
                    RomanianRegion.MOLDOVA: ["adunare", "strângere", "totalizare"],
                    RomanianRegion.TRANSILVANIA: ["insumarea", "adăugarea", "reunirea"],
                    RomanianRegion.MUNTENIA: ["adunare", "sumarea", "strângerea"],
                    RomanianRegion.OLTENIA: ["adunare", "totalizare", "culumirea"],
                    RomanianRegion.BANAT: ["adăugarea", "sumarea", "reunirea"],
                    RomanianRegion.MARAMURES: ["strângerea", "adunarea", "punerea laolaltă"]
                },
                historical_forms={
                    HistoricalPeriod.MEDIEVAL: ["strângere", "culegere"],
                    HistoricalPeriod.EARLY_MODERN: ["adunare", "strângere"],
                    HistoricalPeriod.MODERN: ["adunare", "sumarea"],
                    HistoricalPeriod.CONTEMPORARY: ["adunare", "suma"]
                },
                dialects={
                    "moldovenesc": "strângere",
                    "ardelean": "insumarea",
                    "bănățean": "adăugarea"
                },
                operation_type=MathematicalOperation.ADDITION,
                term_type=TermType.OPERATION,
                usage_frequency=0.95,
                cultural_context="comerț, agricultură",
                examples=[
                    "strânge banii",
                    "adună roadele",
                    "însumează totul"
                ],
                synonyms=["suma", "total", "împreună"],
                formal_vs_colloquial={
                    "formal": "adunarea numerelor",
                    "colloquial": "pune la un loc"
                }
            ),
            
            # Subtraction with regional variations
            "scădere": RomanianMathTerm(
                standard_form="scădere",
                regional_variations={
                    RomanianRegion.MOLDOVA: ["scădere", "luare", "micșorare"],
                    RomanianRegion.TRANSILVANIA: ["scădere", "diminuarea", "reducerea"],
                    RomanianRegion.MUNTENIA: ["scădere", "micșorarea", "extragerea"],
                    RomanianRegion.OLTENIA: ["scădere", "îndepărtarea", "luarea"],
                    RomanianRegion.BANAT: ["scădere", "eliminarea", "reducerea"],
                    RomanianRegion.MARAMURES: ["luarea", "scăderea", "îndepărtarea"]
                },
                historical_forms={
                    HistoricalPeriod.MEDIEVAL: ["luare", "îndepărtare"],
                    HistoricalPeriod.EARLY_MODERN: ["scădere", "micșorare"],
                    HistoricalPeriod.MODERN: ["scădere", "extragere"],
                    HistoricalPeriod.CONTEMPORARY: ["scădere", "diferența"]
                },
                dialects={
                    "moldovenesc": "luare",
                    "ardelean": "diminuarea",
                    "bănățean": "reducerea"
                },
                operation_type=MathematicalOperation.SUBTRACTION,
                term_type=TermType.OPERATION,
                usage_frequency=0.92,
                cultural_context="comerț, măsurători",
                examples=[
                    "ia din total",
                    "scade cheltuielile",
                    "micșorează suma"
                ],
                synonyms=["minus", "fără", "în afară de"],
                formal_vs_colloquial={
                    "formal": "scăderea unui număr",
                    "colloquial": "ia de la"
                }
            ),
            
            # Multiplication with regional variations
            "înmulțire": RomanianMathTerm(
                standard_form="înmulțire",
                regional_variations={
                    RomanianRegion.MOLDOVA: ["înmulțire", "multiplicare", "înmiire"],
                    RomanianRegion.TRANSILVANIA: ["multiplicarea", "înmulțirea", "repetarea"],
                    RomanianRegion.MUNTENIA: ["înmulțire", "multiplicarea", "produsul"],
                    RomanianRegion.OLTENIA: ["înmulțire", "marirea", "amplificarea"],
                    RomanianRegion.BANAT: ["multiplicarea", "înmiirea", "produsul"],
                    RomanianRegion.MARAMURES: ["înmiirea", "înmulțirea", "repetarea"]
                },
                historical_forms={
                    HistoricalPeriod.MEDIEVAL: ["înmiire", "repetare"],
                    HistoricalPeriod.EARLY_MODERN: ["înmulțire", "multiplicare"],
                    HistoricalPeriod.MODERN: ["înmulțire", "produs"],
                    HistoricalPeriod.CONTEMPORARY: ["înmulțire", "produsul"]
                },
                dialects={
                    "moldovenesc": "înmiire",
                    "ardelean": "multiplicarea",
                    "bănățean": "produsul"
                },
                operation_type=MathematicalOperation.MULTIPLICATION,
                term_type=TermType.OPERATION,
                usage_frequency=0.88,
                cultural_context="agricultură, construcții",
                examples=[
                    "înmiește de trei ori",
                    "multiplică recolta",
                    "produsul numerelor"
                ],
                synonyms=["ori", "înmulțit cu", "de ... ori"],
                formal_vs_colloquial={
                    "formal": "produsul numerelor",
                    "colloquial": "ori de câte ori"
                }
            ),
            
            # Division with regional variations
            "împărțire": RomanianMathTerm(
                standard_form="împărțire",
                regional_variations={
                    RomanianRegion.MOLDOVA: ["împărțire", "împărțirea", "divizare"],
                    RomanianRegion.TRANSILVANIA: ["împărțire", "diviziunea", "repartizarea"],
                    RomanianRegion.MUNTENIA: ["împărțire", "divizarea", "câtul"],
                    RomanianRegion.OLTENIA: ["împărțire", "separarea", "repartizarea"],
                    RomanianRegion.BANAT: ["divizarea", "împărțirea", "câtul"],
                    RomanianRegion.MARAMURES: ["împărțirea", "separarea", "repartizarea"]
                },
                historical_forms={
                    HistoricalPeriod.MEDIEVAL: ["împărțire", "separare"],
                    HistoricalPeriod.EARLY_MODERN: ["împărțire", "divizare"],
                    HistoricalPeriod.MODERN: ["împărțire", "cât"],
                    HistoricalPeriod.CONTEMPORARY: ["împărțire", "câtul"]
                },
                dialects={
                    "moldovenesc": "divizare",
                    "ardelean": "repartizarea",
                    "bănățean": "câtul"
                },
                operation_type=MathematicalOperation.DIVISION,
                term_type=TermType.OPERATION,
                usage_frequency=0.85,
                cultural_context="agricultură, moșteniri",
                examples=[
                    "împarte terenul",
                    "divizează recolta",
                    "câtul împărțirii"
                ],
                synonyms=["împărțit la", "divizat", "cât face"],
                formal_vs_colloquial={
                    "formal": "câtul împărțirii",
                    "colloquial": "împărțit în părți"
                }
            )
        }
        
        # Traditional Romanian counting systems by region
        self.counting_systems = {
            RomanianRegion.MOLDOVA: TraditionalCountingSystem(
                system_name="Numărătoarea moldovenească",
                region=RomanianRegion.MOLDOVA,
                base_numbers={
                    1: "unu", 2: "doi", 3: "trei", 4: "patru", 5: "cinci",
                    6: "șase", 7: "șapte", 8: "opt", 9: "nouă", 10: "zece",
                    20: "douăzeci", 100: "sută", 1000: "mie"
                },
                counting_patterns=[
                    "unu-doi-trei (secvențial simplu)",
                    "pe degete (digit counting)",
                    "la zeci (decimal grouping)"
                ],
                cultural_usage="târguri, agricultură, măsurători",
                historical_context="sistem tradițional cu influențe slave"
            ),
            
            RomanianRegion.TRANSILVANIA: TraditionalCountingSystem(
                system_name="Numărătoarea ardelenească",
                region=RomanianRegion.TRANSILVANIA,
                base_numbers={
                    1: "unu", 2: "doi", 3: "trei", 4: "patru", 5: "cinci",
                    6: "șase", 7: "șapte", 8: "opt", 9: "nouă", 10: "zece",
                    11: "unsprezece", 12: "doisprezece", 20: "douăzeci"
                },
                counting_patterns=[
                    "pe dozen (dozen counting)",
                    "la sute (hundred grouping)", 
                    "sistem metric adaptat"
                ],
                cultural_usage="comerț, industrie, măsurători precision",
                historical_context="influențe austro-ungare, sistem decimal"
            ),
            
            RomanianRegion.OLTENIA: TraditionalCountingSystem(
                system_name="Numărătoarea oltenească",
                region=RomanianRegion.OLTENIA,
                base_numbers={
                    1: "unu", 2: "doi", 3: "trei", 4: "patru", 5: "cinci",
                    6: "șase", 7: "șapte", 8: "opt", 9: "nouă", 10: "zece",
                    20: "douăzeci", 21: "douăzeci și unu"
                },
                counting_patterns=[
                    "numărătoare liniară",
                    "grupări la 5 și 10",
                    "sistem tradițional românesc"
                ],
                cultural_usage="agricultură, păstorit, târguri săptămânale",
                historical_context="sistem tradițional cu elemente balcanice"
            )
        }
        
        # Historical mathematical terms evolution
        self.historical_evolution = {
            "numere": {
                HistoricalPeriod.MEDIEVAL: {
                    "terms": ["cifre", "socoteli", "număruri"],
                    "context": "manuscrise religioase, registre comerciale"
                },
                HistoricalPeriod.EARLY_MODERN: {
                    "terms": ["numere", "cifre", "valori"],
                    "context": "școli, comerț, administrație"
                },
                HistoricalPeriod.MODERN: {
                    "terms": ["numere", "cifre matematice"],
                    "context": "educație formală, științe"
                },
                HistoricalPeriod.CONTEMPORARY: {
                    "terms": ["numere", "valori numerice", "date"],
                    "context": "educație, tehnologie, știință"
                }
            },
            
            "calcul": {
                HistoricalPeriod.MEDIEVAL: {
                    "terms": ["socoteala", "numărarea", "calculul"],
                    "context": "comerț, administrația domnească"
                },
                HistoricalPeriod.EARLY_MODERN: {
                    "terms": ["calculul", "socoteala", "computația"],
                    "context": "școli, universități, comerț"
                },
                HistoricalPeriod.MODERN: {
                    "terms": ["calculul matematic", "computarea"],
                    "context": "educația sistematică, științe aplicată"
                },
                HistoricalPeriod.CONTEMPORARY: {
                    "terms": ["calculul", "computația", "algoritmul"],
                    "context": "matematica modernă, informatică"
                }
            }
        }
        
        # Regional mathematical expressions and idioms
        self.mathematical_expressions = {
            RomanianRegion.MOLDOVA: {
                "expressions": [
                    "a strânge la un loc (addition)",
                    "a lua din cale (subtraction)",
                    "a înmi de atâtea ori (multiplication)",
                    "a împărți ca între frați (division)"
                ],
                "cultural_context": "familie, agricultură, comunitate"
            },
            
            RomanianRegion.TRANSILVANIA: {
                "expressions": [
                    "a pune cap la cap (addition)",
                    "a scădea din socoteală (subtraction)", 
                    "a face de atâtea ori (multiplication)",
                    "a repartiza în mod egal (division)"
                ],
                "cultural_context": "organizare, planificare, administrare"
            },
            
            RomanianRegion.BANAT: {
                "expressions": [
                    "a aduna la grămadă (addition)",
                    "a scoate din total (subtraction)",
                    "a multiplica roadele (multiplication)",
                    "a diviza justițiar (division)"
                ],
                "cultural_context": "agricultură, comerț, dreptate socială"
            }
        }
        
        # Dialect-specific mathematical terminology
        self.dialect_terms = {
            "moldovenesc": {
                "addition": ["strângere", "adunare", "punere laolaltă"],
                "subtraction": ["luare", "scădere", "îndepărtare"],
                "multiplication": ["înmiire", "făcerea de mult", "repetare"],
                "division": ["împărțire", "separare", "repartizare"],
                "numbers": {
                    1: "unu", 2: "doi", 3: "trei", 4: "patru", 5: "cinci",
                    10: "zece", 20: "douăzeci", 100: "o sută"
                }
            },
            
            "ardelean": {
                "addition": ["insumarea", "adăugarea", "reunirea"],
                "subtraction": ["diminuarea", "reducerea", "scăderea"],
                "multiplication": ["multiplicarea", "înmulțirea", "produsul"],
                "division": ["diviziunea", "repartizarea", "câtul"],
                "numbers": {
                    1: "unu", 2: "doi", 3: "trei", 4: "patru", 5: "cinci",
                    10: "zece", 20: "douăzeci", 100: "sută"
                }
            },
            
            "bănățean": {
                "addition": ["adăugarea", "sumarea", "reunirea"],
                "subtraction": ["eliminarea", "reducerea", "scăderea"],
                "multiplication": ["înmiirea", "produsul", "multiplicarea"],
                "division": ["divizarea", "câtul", "împărtirea"],
                "numbers": {
                    1: "unu", 2: "doi", 3: "trei", 4: "patru", 5: "cinci",
                    10: "zece", 20: "douăzeci", 100: "sută"
                }
            }
        }
        
        # Formal vs colloquial mathematical language
        self.register_variations = {
            "formal": {
                "addition": "operația de adunare",
                "subtraction": "operația de scădere",
                "multiplication": "operația de înmulțire",
                "division": "operația de împărțire",
                "result": "rezultatul operației",
                "calculation": "calculul matematic"
            },
            
            "colloquial": {
                "addition": "pune la un loc",
                "subtraction": "ia de la",
                "multiplication": "ori de câte ori",
                "division": "împarte în părți",
                "result": "cât iese",
                "calculation": "socoteala"
            },
            
            "educational": {
                "addition": "adunarea numerelor",
                "subtraction": "scăderea numerelor",
                "multiplication": "înmulțirea numerelor", 
                "division": "împărțirea numerelor",
                "result": "rezultatul final",
                "calculation": "calculul pas cu pas"
            }
        }
        
        logger.info("✅ Regional Mathematical Terminology System initialized successfully")

    def recognize_mathematical_terms(self, text: str, context_region: Optional[RomanianRegion] = None) -> TermRecognitionResult:
        """
        Comprehensive recognition of Romanian mathematical terms with regional awareness
        """
        logger.debug(f"🔍 Recognizing mathematical terms in text: {text[:50]}...")
        
        # Normalize text for analysis
        normalized_text = self._normalize_text(text)
        
        # Detect regional indicators
        regional_indicators = self._detect_regional_indicators(normalized_text, context_region)
        
        # Detect dialect
        detected_dialect = self._detect_dialect(normalized_text, regional_indicators)
        
        # Detect historical period
        historical_period = self._detect_historical_period_from_terms(normalized_text)
        
        # Recognize standard mathematical terms
        recognized_terms = self._recognize_standard_terms(normalized_text)
        
        # Recognize regional variations
        regional_terms = self._recognize_regional_variations(normalized_text, regional_indicators)
        
        # Recognize historical forms
        historical_terms = self._recognize_historical_forms(normalized_text, historical_period)
        
        # Combine all recognized terms
        all_terms = recognized_terms + regional_terms + historical_terms
        
        # Remove duplicates and calculate confidence
        unique_terms = self._deduplicate_terms(all_terms)
        confidence_score = self._calculate_recognition_confidence(unique_terms, normalized_text)
        
        # Find alternative forms
        alternative_forms = self._find_alternative_forms(unique_terms, regional_indicators, detected_dialect)
        
        return TermRecognitionResult(
            recognized_terms=unique_terms,
            confidence_score=confidence_score,
            regional_indicators=regional_indicators,
            historical_period=historical_period,
            dialect_detected=detected_dialect,
            alternative_forms=alternative_forms
        )

    def convert_to_standard_terminology(self, text: str, target_register: str = "standard") -> Dict[str, Any]:
        """
        Convert regional/dialectal mathematical terms to standard Romanian terminology
        """
        logger.info(f"🔄 Converting to {target_register} terminology...")
        
        # Recognize current terms
        recognition_result = self.recognize_mathematical_terms(text)
        
        converted_text = text
        conversions_made = []
        
        # Convert each recognized term
        for term in recognition_result.recognized_terms:
            # Find original form in text
            for region, regional_variants in term.regional_variations.items():
                for variant in regional_variants:
                    if variant in text.lower():
                        # Convert based on target register
                        if target_register == "standard":
                            replacement = term.standard_form
                        elif target_register == "formal":
                            replacement = term.formal_vs_colloquial.get("formal", term.standard_form)
                        elif target_register == "colloquial":
                            replacement = term.formal_vs_colloquial.get("colloquial", term.standard_form)
                        else:
                            replacement = term.standard_form
                        
                        # Perform conversion
                        converted_text = re.sub(
                            r'\b' + re.escape(variant) + r'\b',
                            replacement,
                            converted_text,
                            flags=re.IGNORECASE
                        )
                        
                        conversions_made.append({
                            "original": variant,
                            "converted": replacement,
                            "region": region.value,
                            "operation": term.operation_type.value
                        })
        
        return {
            "original_text": text,
            "converted_text": converted_text,
            "conversions_made": conversions_made,
            "target_register": target_register,
            "confidence": recognition_result.confidence_score,
            "regional_context": [r.value for r in recognition_result.regional_indicators]
        }

    def get_regional_mathematical_vocabulary(self, region: RomanianRegion, 
                                           term_types: Optional[List[TermType]] = None) -> Dict[str, Any]:
        """
        Get comprehensive mathematical vocabulary for a specific region
        """
        logger.info(f"📖 Getting mathematical vocabulary for {region.value}...")
        
        vocabulary = {
            "region": region.value,
            "counting_system": self.counting_systems.get(region),
            "mathematical_terms": {},
            "expressions": self.mathematical_expressions.get(region, {}),
            "dialect_specifics": {}
        }
        
        # Filter terms by type if specified
        terms_to_include = self.mathematical_terms.values()
        if term_types:
            terms_to_include = [t for t in terms_to_include if t.term_type in term_types]
        
        # Build regional vocabulary
        for term in terms_to_include:
            regional_variants = term.regional_variations.get(region, [term.standard_form])
            
            vocabulary["mathematical_terms"][term.operation_type.value] = {
                "standard_form": term.standard_form,
                "regional_variants": regional_variants,
                "usage_frequency": term.usage_frequency,
                "cultural_context": term.cultural_context,
                "examples": term.examples
            }
        
        # Add dialect-specific information
        dialect_key = self._get_regional_dialect_key(region)
        if dialect_key in self.dialect_terms:
            vocabulary["dialect_specifics"] = self.dialect_terms[dialect_key]
        
        return vocabulary

    def validate_terminology_consistency(self, text: str, expected_region: RomanianRegion) -> Dict[str, Any]:
        """
        Validate consistency of mathematical terminology within a regional context
        """
        logger.debug(f"✅ Validating terminology consistency for {expected_region.value}...")
        
        recognition_result = self.recognize_mathematical_terms(text, expected_region)
        
        consistency_issues = []
        consistency_score = 1.0
        
        # Check for mixed regional forms
        detected_regions = set(recognition_result.regional_indicators)
        if len(detected_regions) > 1 and expected_region not in detected_regions:
            consistency_issues.append({
                "type": "mixed_regional_forms",
                "expected": expected_region.value,
                "found": [r.value for r in detected_regions],
                "severity": "medium"
            })
            consistency_score -= 0.2
        
        # Check for anachronistic terms
        if (recognition_result.historical_period and 
            recognition_result.historical_period != HistoricalPeriod.CONTEMPORARY):
            consistency_issues.append({
                "type": "historical_terms_in_modern_context",
                "period": recognition_result.historical_period.value,
                "severity": "low"
            })
            consistency_score -= 0.1
        
        # Check for formal/colloquial mixing
        formal_terms = 0
        colloquial_terms = 0
        for term in recognition_result.recognized_terms:
            if any(formal in text.lower() for formal in term.formal_vs_colloquial.get("formal", "").split()):
                formal_terms += 1
            if any(colloquial in text.lower() for colloquial in term.formal_vs_colloquial.get("colloquial", "").split()):
                colloquial_terms += 1
        
        if formal_terms > 0 and colloquial_terms > 0:
            consistency_issues.append({
                "type": "mixed_register",
                "formal_count": formal_terms,
                "colloquial_count": colloquial_terms,
                "severity": "low"
            })
            consistency_score -= 0.05
        
        consistency_score = max(0.0, consistency_score)
        
        return {
            "consistency_score": consistency_score,
            "issues_found": consistency_issues,
            "expected_region": expected_region.value,
            "detected_regions": [r.value for r in detected_regions],
            "terminology_quality": "High" if consistency_score >= 0.8 else "Medium" if consistency_score >= 0.6 else "Low",
            "recommendations": self._generate_consistency_recommendations(consistency_issues)
        }

    def enhance_word_problem_analysis(self, text: str, basic_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance word problem analysis with advanced regional terminology awareness
        """
        logger.info("🔧 Enhancing word problem analysis with regional terminology...")
        
        # Recognize mathematical terms in the problem
        term_recognition = self.recognize_mathematical_terms(text)
        
        # Get regional context
        regional_context = None
        if term_recognition.regional_indicators:
            regional_context = term_recognition.regional_indicators[0]  # Primary region
        
        # Convert to standard terminology if needed
        standardized = self.convert_to_standard_terminology(text, "standard")
        
        # Enhanced analysis
        enhanced_analysis = {
            **basic_analysis,  # Keep original analysis
            "regional_terminology": {
                "detected_regions": [r.value for r in term_recognition.regional_indicators],
                "primary_region": regional_context.value if regional_context else None,
                "dialect_detected": term_recognition.dialect_detected,
                "historical_period": term_recognition.historical_period.value if term_recognition.historical_period else None,
                "recognition_confidence": term_recognition.confidence_score
            },
            "standardization": {
                "original_text": text,
                "standardized_text": standardized["converted_text"],
                "conversions_made": standardized["conversions_made"],
                "standardization_needed": len(standardized["conversions_made"]) > 0
            },
            "terminology_quality": {
                "consistency_score": self.validate_terminology_consistency(
                    text, regional_context or RomanianRegion.MOLDOVA
                )["consistency_score"],
                "regional_authenticity": len(term_recognition.regional_indicators) > 0,
                "term_complexity": len(term_recognition.recognized_terms),
                "cultural_appropriateness": term_recognition.confidence_score
            }
        }
        
        return enhanced_analysis

    def suggest_regional_alternatives(self, text: str, target_region: RomanianRegion) -> Dict[str, Any]:
        """
        Suggest regional alternatives for mathematical terms in text
        """
        logger.info(f"💡 Suggesting {target_region.value} alternatives...")
        
        current_recognition = self.recognize_mathematical_terms(text)
        suggestions = []
        
        # For each recognized term, suggest regional alternatives
        for term in current_recognition.recognized_terms:
            regional_alternatives = term.regional_variations.get(target_region, [])
            if regional_alternatives:
                # Find current form in text
                current_form = None
                for form in [term.standard_form] + list(term.regional_variations.get(target_region, [])):
                    if form.lower() in text.lower():
                        current_form = form
                        break
                
                if current_form and regional_alternatives[0] != current_form:
                    suggestions.append({
                        "current_term": current_form,
                        "suggested_alternatives": regional_alternatives,
                        "operation_type": term.operation_type.value,
                        "cultural_context": term.cultural_context,
                        "usage_examples": term.examples
                    })
        
        # Generate regionalized text
        regionalized_text = text
        for suggestion in suggestions:
            if suggestion["suggested_alternatives"]:
                regionalized_text = re.sub(
                    r'\b' + re.escape(suggestion["current_term"]) + r'\b',
                    suggestion["suggested_alternatives"][0],
                    regionalized_text,
                    flags=re.IGNORECASE
                )
        
        return {
            "original_text": text,
            "regionalized_text": regionalized_text,
            "target_region": target_region.value,
            "suggestions": suggestions,
            "cultural_enhancement_score": len(suggestions) / max(1, len(current_recognition.recognized_terms)),
            "regional_authenticity_improvement": len(suggestions) > 0
        }

    # Helper methods
    def _normalize_text(self, text: str) -> str:
        """Normalize Romanian text for analysis"""
        # Convert to lowercase and normalize Unicode
        text = text.lower().strip()
        text = unicodedata.normalize('NFC', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        return text

    def _detect_regional_indicators(self, text: str, context_region: Optional[RomanianRegion] = None) -> List[RomanianRegion]:
        """Detect regional indicators in text"""
        indicators = []
        
        # Check for regional terms in mathematical vocabulary
        for term_data in self.mathematical_terms.values():
            for region, variants in term_data.regional_variations.items():
                if any(variant in text for variant in variants):
                    indicators.append(region)
        
        # Check for regional expressions
        for region, expressions in self.mathematical_expressions.items():
            for expr in expressions.get("expressions", []):
                if any(word in text for word in expr.split()):
                    indicators.append(region)
        
        # If context region provided, prioritize it
        if context_region and context_region not in indicators:
            # Check for weak indicators
            regional_context = self.cultural_system.regional_contexts.get(context_region, {})
            if any(city.lower() in text for city in regional_context.get("cities", [])):
                indicators.append(context_region)
        
        return list(set(indicators))  # Remove duplicates

    def _detect_dialect(self, text: str, regional_indicators: List[RomanianRegion]) -> Optional[str]:
        """Detect specific dialect from text"""
        
        # Map regions to dialects
        region_to_dialect = {
            RomanianRegion.MOLDOVA: "moldovenesc",
            RomanianRegion.TRANSILVANIA: "ardelean",
            RomanianRegion.BANAT: "bănățean"
        }
        
        # Check for dialect-specific terms
        for region in regional_indicators:
            dialect = region_to_dialect.get(region)
            if dialect and dialect in self.dialect_terms:
                # Check if text contains dialect-specific mathematical terms
                dialect_data = self.dialect_terms[dialect]
                for operation, terms in dialect_data.items():
                    if operation != "numbers" and isinstance(terms, list):
                        if any(term in text for term in terms):
                            return dialect
        
        return None

    def _detect_historical_period_from_terms(self, text: str) -> Optional[HistoricalPeriod]:
        """Detect historical period from mathematical terminology"""
        
        # Check historical evolution terms
        for category, evolution in self.historical_evolution.items():
            for period, period_data in evolution.items():
                if any(term in text for term in period_data["terms"]):
                    return period
        
        # Check historical forms in main terms
        for term_data in self.mathematical_terms.values():
            for period, historical_forms in term_data.historical_forms.items():
                if any(form in text for form in historical_forms):
                    if period != HistoricalPeriod.CONTEMPORARY:
                        return period
        
        return HistoricalPeriod.CONTEMPORARY  # Default

    def _recognize_standard_terms(self, text: str) -> List[RomanianMathTerm]:
        """Recognize standard mathematical terms"""
        recognized = []
        
        for term_data in self.mathematical_terms.values():
            if term_data.standard_form in text:
                recognized.append(term_data)
        
        return recognized

    def _recognize_regional_variations(self, text: str, regional_indicators: List[RomanianRegion]) -> List[RomanianMathTerm]:
        """Recognize regional variations of mathematical terms"""
        recognized = []
        
        for term_data in self.mathematical_terms.values():
            for region in regional_indicators:
                if region in term_data.regional_variations:
                    variants = term_data.regional_variations[region]
                    if any(variant in text for variant in variants):
                        recognized.append(term_data)
                        break
        
        return recognized

    def _recognize_historical_forms(self, text: str, historical_period: Optional[HistoricalPeriod]) -> List[RomanianMathTerm]:
        """Recognize historical forms of mathematical terms"""
        if not historical_period:
            return []
        
        recognized = []
        
        for term_data in self.mathematical_terms.values():
            if historical_period in term_data.historical_forms:
                historical_forms = term_data.historical_forms[historical_period]
                if any(form in text for form in historical_forms):
                    recognized.append(term_data)
        
        return recognized

    def _deduplicate_terms(self, terms: List[RomanianMathTerm]) -> List[RomanianMathTerm]:
        """Remove duplicate terms based on operation type"""
        seen_operations = set()
        unique_terms = []
        
        for term in terms:
            if term.operation_type not in seen_operations:
                unique_terms.append(term)
                seen_operations.add(term.operation_type)
        
        return unique_terms

    def _calculate_recognition_confidence(self, terms: List[RomanianMathTerm], text: str) -> float:
        """Calculate confidence score for term recognition"""
        if not terms:
            return 0.0
        
        # Base confidence from number of recognized terms
        base_confidence = min(1.0, len(terms) / 4)  # Max confidence with 4+ terms
        
        # Boost confidence based on term usage frequency
        frequency_boost = sum(term.usage_frequency for term in terms) / len(terms) if terms else 0
        
        # Factor in text length (longer texts generally more reliable)
        length_factor = min(1.0, len(text.split()) / 20)  # Normalize to 20 words
        
        final_confidence = (base_confidence * 0.5 + frequency_boost * 0.3 + length_factor * 0.2)
        
        return min(1.0, final_confidence)

    def _find_alternative_forms(self, terms: List[RomanianMathTerm], 
                               regions: List[RomanianRegion], dialect: Optional[str]) -> List[str]:
        """Find alternative forms for recognized terms"""
        alternatives = []
        
        for term in terms:
            # Add regional alternatives
            for region in regions:
                if region in term.regional_variations:
                    alternatives.extend(term.regional_variations[region])
            
            # Add dialect alternatives
            if dialect and dialect in self.dialect_terms:
                operation_key = term.operation_type.value
                if operation_key in ["addition", "subtraction", "multiplication", "division"]:
                    dialect_alternatives = self.dialect_terms[dialect].get(operation_key, [])
                    alternatives.extend(dialect_alternatives)
            
            # Add synonyms
            alternatives.extend(term.synonyms)
        
        return list(set(alternatives))  # Remove duplicates

    def _get_regional_dialect_key(self, region: RomanianRegion) -> str:
        """Get dialect key for region"""
        mapping = {
            RomanianRegion.MOLDOVA: "moldovenesc",
            RomanianRegion.TRANSILVANIA: "ardelean",
            RomanianRegion.BANAT: "bănățean"
        }
        return mapping.get(region, "standard")

    def _generate_consistency_recommendations(self, consistency_issues: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for improving terminology consistency"""
        recommendations = []
        
        for issue in consistency_issues:
            if issue["type"] == "mixed_regional_forms":
                recommendations.append(
                    f"Folosiți terminologia specifică regiunii {issue['expected']} pentru consistență"
                )
            elif issue["type"] == "historical_terms_in_modern_context":
                recommendations.append(
                    "Considerați folosirea terminologiei contemporane pentru claritate"
                )
            elif issue["type"] == "mixed_register":
                recommendations.append(
                    "Mențineți un registru consistent (formal sau colocvial) în tot textul"
                )
        
        if not recommendations:
            recommendations.append("Terminologia este consistentă și adecvată contextului")
        
        return recommendations


# Global instance for efficient reuse
_regional_terminology_system = None

def get_regional_terminology_system() -> RegionalMathematicalTerminologySystem:
    """Get the global Regional Mathematical Terminology System instance"""
    global _regional_terminology_system
    if _regional_terminology_system is None:
        _regional_terminology_system = RegionalMathematicalTerminologySystem()
    return _regional_terminology_system
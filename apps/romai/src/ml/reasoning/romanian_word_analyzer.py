"""
🇷🇴 Romanian Word Problem Analyzer

Advanced Romanian mathematical word problem analysis with cultural context,
key terms extraction, and mathematical operations identification.

Supports:
- Romanian mathematical terminology extraction
- Cultural context identification
- Mathematical operations detection
- Word problem decomposition
- Romanian linguistic patterns
- Educational level assessment
"""

import re
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import unicodedata

logger = logging.getLogger(__name__)

# Enhanced cultural systems - using fallback if not available
try:
    from ml.cultural.enhanced_cultural_system import get_enhanced_cultural_system
    from ml.cultural.traditional_problem_generator import get_traditional_problem_generator
    from ml.cultural.regional_terminology_system import get_regional_terminology_system
    ENHANCED_CULTURAL_AVAILABLE = True
    logger.info("🇷🇴 Enhanced cultural systems loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️ Enhanced cultural systems not available: {e}")
    ENHANCED_CULTURAL_AVAILABLE = False
    
    # Fallback functions
    def get_enhanced_cultural_system():
        return None
        
    def get_traditional_problem_generator():
        return None
        
    def get_regional_terminology_system():
        return None

class RomanianMathTerm(Enum):
    """Romanian mathematical terms"""
    ADDITION = "adunare"
    SUBTRACTION = "scădere"
    MULTIPLICATION = "înmulțire"
    DIVISION = "împărțire"
    EQUATION = "ecuație"
    SOLVE = "rezolvă"
    CALCULATE = "calculează"
    FIND = "găsește"
    RESULT = "rezultat"
    ANSWER = "răspuns"

class ProblemComplexity(Enum):
    """Problem complexity levels"""
    ELEMENTARY = "elementary"  # Primary school
    SECONDARY = "secondary"    # Middle school
    ADVANCED = "advanced"      # High school/University

@dataclass
class RomanianKeyTerm:
    """Romanian key term with mathematical meaning"""
    term: str
    category: str
    operation: Optional[str]
    confidence: float
    position: int

@dataclass
class RomanianCulturalContext:
    """Romanian cultural context for mathematical problems"""
    currency_references: List[str]
    cultural_objects: List[str]
    educational_level: str
    traditional_measurements: List[str]
    cultural_relevance_score: float

@dataclass
class MathematicalOperation:
    """Identified mathematical operation"""
    operation_type: str
    operands: List[str]
    operator: str
    confidence: float
    position: int

@dataclass
class RomanianWordAnalysis:
    """Complete Romanian word problem analysis"""
    original_text: str
    normalized_text: str
    key_terms: List[RomanianKeyTerm]
    operations: List[MathematicalOperation]
    cultural_context: RomanianCulturalContext
    complexity: ProblemComplexity
    extracted_numbers: List[float]
    mathematical_expression: str
    confidence_score: float

class RomanianWordProblemAnalyzer:
    """Advanced Romanian word problem analyzer with cultural intelligence"""
    
    def __init__(self):
        logger.info("🇷🇴 Initializing Enhanced Romanian Word Problem Analyzer...")
        
        # Get enhanced cultural and terminology systems if available
        if ENHANCED_CULTURAL_AVAILABLE:
            self.enhanced_cultural_system = get_enhanced_cultural_system()
            self.regional_terminology_system = get_regional_terminology_system()
            logger.info("✅ Enhanced cultural systems loaded")
        else:
            self.enhanced_cultural_system = None
            self.regional_terminology_system = None
            logger.info("ℹ️ Using basic Romanian processing (enhanced systems not available)")
        
        # Romanian mathematical vocabulary
        self.romanian_math_vocabulary = {
            # Basic operations
            "adunare": {"operation": "addition", "symbols": ["+", "plus", "și"]},
            "scădere": {"operation": "subtraction", "symbols": ["-", "minus", "din"]},
            "înmulțire": {"operation": "multiplication", "symbols": ["*", "×", "ori"]},
            "împărțire": {"operation": "division", "symbols": ["/", "÷", "împărțit"]},
            
            # Action verbs
            "calculează": {"operation": "calculate", "type": "imperative"},
            "rezolvă": {"operation": "solve", "type": "imperative"},
            "găsește": {"operation": "find", "type": "imperative"},
            "determină": {"operation": "determine", "type": "imperative"},
            "află": {"operation": "find_out", "type": "imperative"},
            
            # Mathematical concepts
            "ecuație": {"concept": "equation", "type": "noun"},
            "rezultat": {"concept": "result", "type": "noun"},
            "răspuns": {"concept": "answer", "type": "noun"},
            "sumă": {"concept": "sum", "type": "noun"},
            "diferență": {"concept": "difference", "type": "noun"},
            "produs": {"concept": "product", "type": "noun"},
            "câtul": {"concept": "quotient", "type": "noun"},
            
            # Quantity indicators
            "câte": {"type": "quantity_question"},
            "câți": {"type": "quantity_question"},
            "cât": {"type": "quantity_question"},
            "câtă": {"type": "quantity_question"},
            "toate": {"type": "quantity_total"},
            "fiecare": {"type": "quantity_each"},
            
            # Comparative terms
            "mai": {"type": "comparative", "operation": "addition"},
            "cu": {"type": "preposition", "context": "with"},
            "de": {"type": "preposition", "context": "of/from"},
            "decât": {"type": "comparative", "operation": "comparison"},
        }
        
        # Romanian cultural objects and references
        self.cultural_references = {
            "currency": ["lei", "bani", "euro", "dollar", "monedă"],
            "measurements": ["metri", "centimetri", "kilometri", "grame", "kilograme", "litri"],
            "time": ["ore", "minute", "secunde", "zile", "săptămâni", "luni", "ani"],
            "school": ["elev", "elevi", "clasă", "școală", "profesor", "carte", "caiet"],
            "food": ["mere", "pere", "pâine", "lapte", "ouă", "căpșuni"],
            "objects": ["minge", "jucărie", "carte", "creion", "masă", "scaun"],
            "animals": ["câini", "pisici", "păsări", "vaci", "porci", "găini"],
            "family": ["copii", "părinți", "frați", "surori", "bunici"],
        }
        
        # Number patterns in Romanian
        self.romanian_numbers = {
            "zero": 0, "unu": 1, "unul": 1, "una": 1, "doi": 2, "două": 2,
            "trei": 3, "patru": 4, "cinci": 5, "șase": 6, "șapte": 7,
            "opt": 8, "nouă": 9, "zece": 10, "unsprezece": 11, "douăsprezece": 12,
            "treisprezece": 13, "paisprezece": 14, "cincisprezece": 15,
            "șaisprezece": 16, "șaptesprezece": 17, "optsprezece": 18,
            "nouăsprezece": 19, "douăzeci": 20, "treizeci": 30, "patruzeci": 40,
            "cincizeci": 50, "șaizeci": 60, "șaptezeci": 70, "optzeci": 80,
            "nouăzeci": 90, "sută": 100, "mie": 1000, "milion": 1000000
        }

    def analyze_romanian_word_problem(self, problem: str) -> RomanianWordAnalysis:
        """
        Comprehensive analysis of Romanian mathematical word problems with enhanced cultural intelligence
        """
        logger.info(f"🇷🇴 Analyzing Romanian word problem: {problem[:50]}...")
        
        # Normalize text
        normalized_text = self._normalize_romanian_text(problem)
        
        # Enhanced cultural analysis using the new system (if available)
        enhanced_cultural_context = None
        if self.enhanced_cultural_system:
            enhanced_cultural_context = self.enhanced_cultural_system.analyze_cultural_context(problem)
        
        # Regional terminology recognition (if available)
        terminology_analysis = None
        standardization_result = None
        if self.regional_terminology_system:
            terminology_analysis = self.regional_terminology_system.recognize_mathematical_terms(problem)
            standardization_result = self.regional_terminology_system.convert_to_standard_terminology(
                problem, "standard"
            )
        
        # Extract key terms (enhanced with regional awareness if available)
        key_terms = self._extract_key_terms_enhanced(
            normalized_text, terminology_analysis, enhanced_cultural_context
        )
        
        # Identify mathematical operations (enhanced with regional terms if available)
        operations = self._identify_operations_enhanced(
            normalized_text, key_terms, terminology_analysis
        )
        
        # Extract numbers (both numeric and written)
        numbers = self._extract_numbers(normalized_text)
        
        # Create enhanced cultural context
        cultural_context = self._create_enhanced_cultural_context(
            enhanced_cultural_context, terminology_analysis, normalized_text
        )
        
        # Determine complexity (enhanced assessment)
        complexity = self._determine_complexity_enhanced(
            key_terms, operations, numbers, cultural_context, enhanced_cultural_context
        )
        
        # Generate mathematical expression
        math_expression = self._generate_math_expression(operations, numbers, normalized_text)
        
        # Calculate overall confidence (enhanced scoring)
        confidence = self._calculate_enhanced_confidence(
            key_terms, operations, numbers, cultural_context, 
            terminology_analysis, enhanced_cultural_context
        )
        
        # Create enhanced analysis result
        analysis = RomanianWordAnalysis(
            original_text=problem,
            normalized_text=normalized_text,
            key_terms=key_terms,
            operations=operations,
            cultural_context=cultural_context,
            complexity=complexity,
            extracted_numbers=numbers,
            mathematical_expression=math_expression,
            confidence_score=confidence
        )
        
        # Add enhanced metadata
        analysis.enhanced_metadata = {
            "cultural_analysis": enhanced_cultural_context,
            "terminology_analysis": terminology_analysis,
            "standardization": standardization_result,
            "regional_authenticity": (
                len(terminology_analysis.regional_indicators) > 0
                if terminology_analysis and hasattr(terminology_analysis, 'regional_indicators') 
                else False
            ),
            "cultural_accuracy": (
                getattr(enhanced_cultural_context, 'cultural_accuracy_score', 0.0)
                if enhanced_cultural_context else 0.0
            )
        }
        
        return analysis

    def _normalize_romanian_text(self, text: str) -> str:
        """Normalize Romanian text for processing"""
        # Convert to lowercase
        text = text.lower()
        
        # Normalize Unicode characters (handle diacritics)
        text = unicodedata.normalize('NFC', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Handle common Romanian contractions and variations
        replacements = {
            r'\bîn\b': 'in',  # Normalize î to i in some contexts
            r'\bși\b': 'si',  # Alternative for și
            r'\bțiu\b': 'tiu', # Common misspelling
        }
        
        for pattern, replacement in replacements.items():
            text = re.sub(pattern, replacement, text)
        
        return text

    def _extract_key_terms(self, text: str) -> List[RomanianKeyTerm]:
        """Extract Romanian mathematical key terms"""
        key_terms = []
        
        for term, info in self.romanian_math_vocabulary.items():
            pattern = r'\b' + re.escape(term) + r'\b'
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                operation = info.get('operation')
                category = info.get('type', 'general')
                confidence = 0.9 if term in text else 0.7
                
                key_terms.append(RomanianKeyTerm(
                    term=term,
                    category=category,
                    operation=operation,
                    confidence=confidence,
                    position=match.start()
                ))
        
        # Sort by position in text
        key_terms.sort(key=lambda x: x.position)
        return key_terms

    def _identify_operations(self, text: str, key_terms: List[RomanianKeyTerm]) -> List[MathematicalOperation]:
        """Identify mathematical operations from Romanian text"""
        operations = []
        
        # Pattern-based operation detection
        operation_patterns = [
            # Addition patterns
            (r'(\d+(?:\.\d+)?)\s+(?:plus|și|adunați cu|mai mult cu)\s+(\d+(?:\.\d+)?)', 'addition', '+'),
            (r'(\d+(?:\.\d+)?)\s+(?:\+)\s+(\d+(?:\.\d+)?)', 'addition', '+'),
            
            # Subtraction patterns
            (r'(\d+(?:\.\d+)?)\s+(?:minus|scădut cu|mai puțin cu|din)\s+(\d+(?:\.\d+)?)', 'subtraction', '-'),
            (r'(\d+(?:\.\d+)?)\s+(?:\-)\s+(\d+(?:\.\d+)?)', 'subtraction', '-'),
            
            # Multiplication patterns
            (r'(\d+(?:\.\d+)?)\s+(?:ori|înmulțit cu|×)\s+(\d+(?:\.\d+)?)', 'multiplication', '*'),
            (r'(\d+(?:\.\d+)?)\s+(?:\*|×)\s+(\d+(?:\.\d+)?)', 'multiplication', '*'),
            
            # Division patterns
            (r'(\d+(?:\.\d+)?)\s+(?:împărțit la|÷)\s+(\d+(?:\.\d+)?)', 'division', '/'),
            (r'(\d+(?:\.\d+)?)\s+(?:\/|÷)\s+(\d+(?:\.\d+)?)', 'division', '/'),
        ]
        
        for pattern, op_type, symbol in operation_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                operands = [match.group(1), match.group(2)]
                operations.append(MathematicalOperation(
                    operation_type=op_type,
                    operands=operands,
                    operator=symbol,
                    confidence=0.8,
                    position=match.start()
                ))
        
        # Context-based operation detection using key terms
        for term in key_terms:
            if term.operation in ['addition', 'subtraction', 'multiplication', 'division']:
                # Look for numbers around this term
                term_pos = term.position
                surrounding_text = text[max(0, term_pos-30):term_pos+30]
                numbers = re.findall(r'\d+(?:\.\d+)?', surrounding_text)
                
                if len(numbers) >= 2:
                    operations.append(MathematicalOperation(
                        operation_type=term.operation,
                        operands=numbers,
                        operator=self._get_operator_symbol(term.operation),
                        confidence=term.confidence * 0.9,
                        position=term_pos
                    ))
        
        # Sort by position and remove duplicates
        operations.sort(key=lambda x: x.position)
        return self._deduplicate_operations(operations)

    def _extract_numbers(self, text: str) -> List[float]:
        """Extract both numeric and written numbers from Romanian text"""
        numbers = []
        
        # Extract numeric values
        numeric_pattern = r'\d+(?:\.\d+)?'
        numeric_matches = re.findall(numeric_pattern, text)
        for match in numeric_matches:
            try:
                numbers.append(float(match))
            except ValueError:
                continue
        
        # Extract written Romanian numbers
        words = text.split()
        for word in words:
            if word in self.romanian_numbers:
                numbers.append(float(self.romanian_numbers[word]))
        
        # Handle compound Romanian numbers (e.g., "douăzeci și trei" = 23)
        numbers.extend(self._parse_compound_romanian_numbers(text))
        
        # Remove duplicates and sort
        numbers = list(set(numbers))
        numbers.sort()
        
        return numbers

    def _analyze_cultural_context(self, text: str) -> RomanianCulturalContext:
        """Analyze Romanian cultural context in the problem"""
        currency_refs = []
        cultural_objects = []
        traditional_measurements = []
        relevance_score = 0.0
        
        # Check for cultural references
        for category, terms in self.cultural_references.items():
            found_terms = []
            for term in terms:
                if term in text:
                    found_terms.append(term)
                    relevance_score += 0.1
            
            if category == "currency":
                currency_refs.extend(found_terms)
            elif category == "measurements":
                traditional_measurements.extend(found_terms)
            else:
                cultural_objects.extend(found_terms)
        
        # Determine educational level
        educational_level = self._determine_educational_level(text)
        
        return RomanianCulturalContext(
            currency_references=currency_refs,
            cultural_objects=cultural_objects,
            educational_level=educational_level,
            traditional_measurements=traditional_measurements,
            cultural_relevance_score=min(relevance_score, 1.0)
        )

    def _determine_complexity(self, key_terms: List[RomanianKeyTerm], 
                            operations: List[MathematicalOperation], 
                            numbers: List[float]) -> ProblemComplexity:
        """Determine problem complexity based on analysis"""
        complexity_score = 0
        
        # Base complexity from operations
        for op in operations:
            if op.operation_type in ['addition', 'subtraction']:
                complexity_score += 1
            elif op.operation_type in ['multiplication', 'division']:
                complexity_score += 2
            else:
                complexity_score += 3
        
        # Complexity from numbers
        if any(n > 1000 for n in numbers):
            complexity_score += 2
        if any(n != int(n) for n in numbers):  # Decimals
            complexity_score += 1
        
        # Complexity from key terms
        advanced_terms = ['ecuație', 'determină', 'demonstrează']
        if any(term.term in advanced_terms for term in key_terms):
            complexity_score += 3
        
        if complexity_score <= 3:
            return ProblemComplexity.ELEMENTARY
        elif complexity_score <= 6:
            return ProblemComplexity.SECONDARY
        else:
            return ProblemComplexity.ADVANCED

    def _generate_math_expression(self, operations: List[MathematicalOperation], 
                                 numbers: List[float], text: str) -> str:
        """Generate mathematical expression from analyzed components"""
        if not operations or not numbers:
            return ""
        
        # Simple case: single operation with two numbers
        if len(operations) == 1 and len(numbers) >= 2:
            op = operations[0]
            if len(op.operands) >= 2:
                return f"{op.operands[0]} {op.operator} {op.operands[1]}"
        
        # Complex case: multiple operations or numbers
        if len(numbers) >= 2:
            # Try to construct expression based on text flow
            if any("plus" in text or "adunare" in text or "și" in text for text in [text]):
                return f"{numbers[0]} + {numbers[1]}"
            elif any("minus" in text or "scădere" in text or "din" in text for text in [text]):
                return f"{numbers[0]} - {numbers[1]}"
            elif any("ori" in text or "înmulțire" in text for text in [text]):
                return f"{numbers[0]} * {numbers[1]}"
            elif any("împărțit" in text or "împărțire" in text for text in [text]):
                return f"{numbers[0]} / {numbers[1]}"
        
        # Fallback: return first meaningful operation or number sequence
        if numbers:
            return " ".join(map(str, numbers[:3]))  # First 3 numbers
        
        return ""

    def _calculate_confidence(self, key_terms: List[RomanianKeyTerm],
                            operations: List[MathematicalOperation],
                            numbers: List[float],
                            cultural_context: RomanianCulturalContext) -> float:
        """Calculate overall confidence score with Romanian processing boost"""
        confidence = 0.0
        
        # Base Romanian processing bonus (if we successfully processed Romanian text)
        romanian_processing_bonus = 0.3  # Start with 30% for successful Romanian processing
        
        # Confidence from key terms
        if key_terms:
            avg_term_confidence = sum(term.confidence for term in key_terms) / len(key_terms)
            confidence += avg_term_confidence * 0.25
            
            # Bonus for Romanian-specific terms
            romanian_terms_count = len([t for t in key_terms if any(
                romanian_word in t.term.lower() 
                for romanian_word in ['mere', 'lei', 'metri', 'ore', 'zile', 'copii', 'oi', 'kg']
            )])
            if romanian_terms_count > 0:
                romanian_processing_bonus += 0.1  # Extra 10% for Romanian terms
        
        # Confidence from operations
        if operations:
            avg_op_confidence = sum(op.confidence for op in operations) / len(operations)
            confidence += avg_op_confidence * 0.25
        
        # Confidence from numbers (Romanian context)
        if numbers:
            confidence += 0.15  # Having numbers is good
            
            # Bonus for Romanian-style numbers (lei, realistic quantities)
            if any(10 <= n <= 1000 for n in numbers):  # Typical Romanian problem ranges
                romanian_processing_bonus += 0.05
        
        # Confidence from cultural context
        confidence += cultural_context.cultural_relevance_score * 0.1
        
        # Apply Romanian processing bonus
        confidence += romanian_processing_bonus
        
        return min(confidence, 1.0)

    def _extract_key_terms_enhanced(self, text: str, terminology_analysis, cultural_context) -> List[RomanianKeyTerm]:
        """Enhanced key term extraction with regional and cultural awareness"""
        key_terms = self._extract_key_terms(text)  # Original extraction
        
        # Add terms from regional terminology analysis if available
        if terminology_analysis and hasattr(terminology_analysis, 'recognized_terms'):
            for recognized_term in terminology_analysis.recognized_terms:
                # Check if any regional variations are in the text
                for region, variants in recognized_term.regional_variations.items():
                    for variant in variants:
                        if variant.lower() in text.lower():
                            key_terms.append(RomanianKeyTerm(
                            term=variant,
                            category="regional_operation",
                            operation=recognized_term.operation_type.value,
                            confidence=0.9,
                            position=text.lower().find(variant.lower())
                        ))
        
        # Add cultural terms detected if available
        if cultural_context and hasattr(cultural_context, 'cultural_objects'):
            for cultural_obj in cultural_context.cultural_objects:
                if cultural_obj.lower() in text.lower():
                    key_terms.append(RomanianKeyTerm(
                        term=cultural_obj,
                        category="cultural_object",
                        operation=None,
                        confidence=0.8,
                        position=text.lower().find(cultural_obj.lower())
                    ))
        
        return key_terms

    def _identify_operations_enhanced(self, text: str, key_terms: List[RomanianKeyTerm], 
                                     terminology_analysis) -> List[MathematicalOperation]:
        """Enhanced operation identification with regional terminology support"""
        operations = self._identify_operations(text, key_terms)  # Original identification
        
        # Add operations from regional terminology if available
        if terminology_analysis and hasattr(terminology_analysis, 'recognized_terms'):
            for recognized_term in terminology_analysis.recognized_terms:
                operation_type = recognized_term.operation_type.value
                
                # Find the term in text
                term_found = None
                position = -1
                for region, variants in recognized_term.regional_variations.items():
                    for variant in variants:
                        if variant.lower() in text.lower():
                            term_found = variant
                            position = text.lower().find(variant.lower())
                            break
                    if term_found:
                        break
                
                if term_found:
                    # Map operation type to symbols
                    symbol_mapping = {
                        "addition": "+",
                        "subtraction": "-", 
                        "multiplication": "*",
                        "division": "/"
                    }
                    
                    operations.append(MathematicalOperation(
                        operation_type=operation_type,
                        operands=[],  # Will be filled by expression generator
                        operator=symbol_mapping.get(operation_type, operation_type),
                        confidence=0.9,
                        position=position
                    ))
        
        return operations

    def _create_enhanced_cultural_context(self, enhanced_cultural_context, 
                                         terminology_analysis, text: str) -> RomanianCulturalContext:
        """Create enhanced cultural context combining old and new systems"""
        # Get basic cultural context
        basic_context = self._analyze_cultural_context(text)
        
        # If enhanced systems are not available, return basic context
        if not enhanced_cultural_context:
            return basic_context
        
        # Enhance with new cultural intelligence
        enhanced_context = RomanianCulturalContext(
            currency_references=basic_context.currency_references,
            cultural_objects=basic_context.cultural_objects + (
                enhanced_cultural_context.cultural_objects if hasattr(enhanced_cultural_context, 'cultural_objects') else []
            ),
            educational_level=basic_context.educational_level,
            traditional_measurements=basic_context.traditional_measurements + (
                [tm.value for tm in enhanced_cultural_context.traditional_measurements] 
                if hasattr(enhanced_cultural_context, 'traditional_measurements') else []
            ),
            cultural_relevance_score=max(
                basic_context.cultural_relevance_score,
                getattr(enhanced_cultural_context, 'cultural_accuracy_score', basic_context.cultural_relevance_score)
            )
        )
        
        # Add regional information if available
        if terminology_analysis and hasattr(terminology_analysis, 'regional_indicators'):
            enhanced_context.regional_context = {
                "detected_regions": [r.value for r in terminology_analysis.regional_indicators],
                "dialect_detected": getattr(terminology_analysis, 'dialect_detected', False),
                "historical_period": (
                    terminology_analysis.historical_period.value 
                    if hasattr(terminology_analysis, 'historical_period') and terminology_analysis.historical_period 
                    else None
                )
            }
        else:
            enhanced_context.regional_context = {
                "detected_regions": [],
                "dialect_detected": False,
                "historical_period": None
            }
        
        return enhanced_context
        
        return enhanced_context

    def _determine_complexity_enhanced(self, key_terms: List[RomanianKeyTerm], 
                                      operations: List[MathematicalOperation], 
                                      numbers: List[float],
                                      cultural_context: RomanianCulturalContext,
                                      enhanced_cultural_context) -> ProblemComplexity:
        """Enhanced complexity determination with cultural and regional factors"""
        # Start with basic complexity
        basic_complexity = self._determine_complexity(key_terms, operations, numbers)
        
        # Adjust based on cultural complexity
        cultural_complexity_factors = 0
        
        # Traditional measurements increase complexity
        if (enhanced_cultural_context and 
            hasattr(enhanced_cultural_context, 'traditional_measurements') and 
            enhanced_cultural_context.traditional_measurements):
            cultural_complexity_factors += 1
        
        # Regional terminology increases complexity
        if hasattr(cultural_context, 'regional_context') and cultural_context.regional_context["detected_regions"]:
            cultural_complexity_factors += 1
        
        # Multiple cultural objects indicate higher complexity
        if (enhanced_cultural_context and 
            hasattr(enhanced_cultural_context, 'cultural_objects') and 
            len(enhanced_cultural_context.cultural_objects) > 2):
            cultural_complexity_factors += 1
        
        # Adjust complexity based on cultural factors
        if cultural_complexity_factors >= 2:
            if basic_complexity == ProblemComplexity.ELEMENTARY:
                return ProblemComplexity.SECONDARY
            elif basic_complexity == ProblemComplexity.SECONDARY:
                return ProblemComplexity.ADVANCED
        
        return basic_complexity

    def _calculate_enhanced_confidence(self, key_terms: List[RomanianKeyTerm],
                                      operations: List[MathematicalOperation],
                                      numbers: List[float],
                                      cultural_context: RomanianCulturalContext,
                                      terminology_analysis,
                                      enhanced_cultural_context) -> float:
        """Enhanced confidence calculation with regional and cultural factors"""
        # Base confidence from original method
        base_confidence = self._calculate_confidence(key_terms, operations, numbers, cultural_context)
        
        # Regional terminology recognition boost
        regional_boost = 0.0
        if (terminology_analysis and 
            hasattr(terminology_analysis, 'regional_indicators') and 
            terminology_analysis.regional_indicators):
            regional_boost += 0.1
        if (terminology_analysis and 
            hasattr(terminology_analysis, 'dialect_detected') and 
            terminology_analysis.dialect_detected):
            regional_boost += 0.05
        
        # Cultural accuracy boost
        cultural_boost = (
            getattr(enhanced_cultural_context, 'cultural_accuracy_score', 0.0) * 0.1 
            if enhanced_cultural_context else 0.0
        )
        
        # Terminology recognition confidence
        terminology_boost = (
            getattr(terminology_analysis, 'confidence_score', 0.0) * 0.1 
            if terminology_analysis else 0.0
        )
        
        # Combined confidence
        enhanced_confidence = min(1.0, base_confidence + regional_boost + cultural_boost + terminology_boost)
        
        return enhanced_confidence

    # Helper methods
    def _get_operator_symbol(self, operation: str) -> str:
        """Get mathematical operator symbol"""
        symbols = {
            'addition': '+',
            'subtraction': '-', 
            'multiplication': '*',
            'division': '/'
        }
        return symbols.get(operation, '?')

    def _deduplicate_operations(self, operations: List[MathematicalOperation]) -> List[MathematicalOperation]:
        """Remove duplicate operations"""
        seen = set()
        unique_operations = []
        
        for op in operations:
            key = (op.operation_type, tuple(op.operands), op.operator)
            if key not in seen:
                seen.add(key)
                unique_operations.append(op)
        
        return unique_operations

    def _parse_compound_romanian_numbers(self, text: str) -> List[float]:
        """Parse compound Romanian numbers like 'douăzeci și trei'"""
        # This is a simplified implementation
        # In a full implementation, this would handle all Romanian number patterns
        compound_numbers = []
        
        # Look for patterns like "douăzeci și trei" (twenty and three = 23)
        pattern = r'(douăzeci|treizeci|patruzeci|cincizeci|șaizeci|șaptezeci|optzeci|nouăzeci)\s+și\s+(\w+)'
        matches = re.finditer(pattern, text)
        
        for match in matches:
            tens = match.group(1)
            ones = match.group(2)
            
            tens_value = self.romanian_numbers.get(tens, 0)
            ones_value = self.romanian_numbers.get(ones, 0)
            
            if tens_value > 0 and ones_value > 0:
                compound_numbers.append(float(tens_value + ones_value))
        
        return compound_numbers

    def _determine_educational_level(self, text: str) -> str:
        """Determine educational level from vocabulary complexity"""
        elementary_indicators = ['mere', 'jucării', 'copii', 'simple']
        secondary_indicators = ['ecuație', 'rezolvă', 'calculează']
        advanced_indicators = ['demonstrează', 'determină', 'analizează']
        
        if any(indicator in text for indicator in advanced_indicators):
            return 'advanced'
        elif any(indicator in text for indicator in secondary_indicators):
            return 'secondary'
        else:
            return 'elementary'

    def generate_cultural_summary(self, analysis: RomanianWordAnalysis) -> Dict[str, Any]:
        """Generate a summary of Romanian cultural elements"""
        return {
            "cultural_relevance": analysis.cultural_context.cultural_relevance_score,
            "romanian_terms_found": len(analysis.key_terms),
            "educational_context": analysis.cultural_context.educational_level,
            "complexity_level": analysis.complexity.value,
            "cultural_objects": analysis.cultural_context.cultural_objects,
            "currency_context": bool(analysis.cultural_context.currency_references),
            "traditional_measurements": bool(analysis.cultural_context.traditional_measurements),
            "confidence": analysis.confidence_score,
            "mathematical_expression": analysis.mathematical_expression,
            "extracted_numbers": analysis.extracted_numbers,
            "operation_types": [op.operation_type for op in analysis.operations]
        }


# Global analyzer instance
_romanian_analyzer = None

def get_romanian_word_analyzer() -> RomanianWordProblemAnalyzer:
    """Get the global Romanian word problem analyzer instance"""
    global _romanian_analyzer
    if _romanian_analyzer is None:
        _romanian_analyzer = RomanianWordProblemAnalyzer()
    return _romanian_analyzer
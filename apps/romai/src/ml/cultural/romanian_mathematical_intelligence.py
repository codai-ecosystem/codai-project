"""
🇷🇴 RomAI Mathematical Romanian Integration
Phase 3: Romanian Cultural Context for Mathematical Problem Solving
"""

import asyncio
import logging
import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class RomanianMathematicalDomain(Enum):
    """Romanian mathematical education domains"""
    ALGEBRA = "algebră"
    GEOMETRY = "geometrie"
    CALCULUS = "analiză_matematică"
    TRIGONOMETRY = "trigonometrie"
    STATISTICS = "statistică"
    NUMBER_THEORY = "teoria_numerelor"
    DISCRETE_MATH = "matematică_discretă"

@dataclass
class RomanianMathematicalContext:
    """Romanian cultural context for mathematical problems"""
    romanian_terminology: Dict[str, str]
    cultural_references: List[str]
    educational_context: str
    historical_context: Optional[str]
    confidence: float

class RomanianMathematicalIntelligence:
    """
    Romanian Mathematical Cultural Intelligence Engine
    
    Integrates Romanian mathematical terminology, educational traditions,
    and cultural context into mathematical problem solving.
    """
    
    def __init__(self):
        self.romanian_math_terms = {
            # Basic operations
            "addition": "adunare",
            "subtraction": "scădere", 
            "multiplication": "înmulțire",
            "division": "împărțire",
            "equation": "ecuație",
            "equations": "ecuații",
            "solution": "soluție",
            "solutions": "soluții",
            "solve": "rezolvă",
            "calculate": "calculează",
            
            # Algebra
            "algebra": "algebră",
            "quadratic equation": "ecuația de gradul al doilea",
            "quadratic": "de gradul al doilea",
            "polynomial": "polinom",
            "root": "rădăcină",
            "roots": "rădăcini",
            "real roots": "rădăcini reale",
            "variable": "necunoscută",
            "unknown": "necunoscută",
            "coefficient": "coeficient",
            
            # Calculus
            "derivative": "derivată",
            "integral": "integrală",
            "integration": "integrare", 
            "differentiation": "derivare",
            "limit": "limită",
            "function": "funcție",
            
            # Geometry
            "triangle": "triunghi",
            "circle": "cerc",
            "rectangle": "dreptunghi",
            "square": "pătrat",
            "angle": "unghi",
            "area": "arie",
            "perimeter": "perimetru",
            
            # Numbers
            "number": "număr",
            "integer": "număr întreg",
            "fraction": "fracție",
            "decimal": "zecimal",
            "percentage": "procentaj",
        }
        
        self.romanian_patterns = {
            # Romanian problem patterns
            r'rezolv[ăi] .*ecuația': 'solve_equation',
            r'calculez[ăi] .*': 'calculate',
            r'găsește .*soluția': 'find_solution', 
            r'determină .*': 'determine',
            r'demonstrează .*': 'prove',
            r'știind că.*': 'given_that',
        }
        
        # Romanian mathematical institutions and references
        self.cultural_references = {
            "institutions": [
                "Academia Română",
                "Institutul de Matematică \"Simion Stoilow\"",
                "Universitatea din București",
                "Școala Românească de Matematică"
            ],
            "mathematicians": [
                "Gheorghe Țițeica",
                "Dan Barbilian", 
                "Simion Stoilow",
                "Grigore Moisil",
                "Nicolae Teodorescu"
            ],
            "educational_levels": {
                "gimnaziu": "middle school",
                "liceu": "high school", 
                "universitate": "university",
                "clasa a IX-a": "9th grade",
                "clasa a X-a": "10th grade",
                "bacalaureat": "high school graduation exam"
            }
        }
        
        logger.info("🇷🇴 Romanian Mathematical Intelligence initialized")
    
    async def detect_romanian_mathematical_query(self, query: str) -> bool:
        """Detect if a query contains Romanian mathematical terminology"""
        query_lower = query.lower()
        
        # Check for Romanian mathematical terms (expanded)
        romanian_math_indicators = [
            'matematică', 'ecuație', 'ecuații', 'ecuația', 'ecuațiile',
            'algebră', 'calculează', 'calculați',
            'rezolvă', 'rezolvi', 'găsește', 'găsiți', 'determină', 'determinați',
            'soluție', 'soluții', 'soluția', 'soluțiile',
            'rădăcini', 'rădăcinile', 'rădăcina',
            'derivată', 'derivata', 'integrală', 'integrala',
            'funcție', 'funcția', 'funcției', 'număr',
            'sistemul', 'sistem', 'gradul', 'grad',
            'demonstrează', 'demonstrați', 'află', 'aflați',
            'al doilea', 'întâi', 'întai', 'doi',
            'reale', 'complexe', 'egale'
        ]
        
        # Check for any Romanian mathematical indicators
        for term in romanian_math_indicators:
            if term in query_lower:
                return True
                
        # Check for Romanian mathematical patterns
        romanian_patterns = [
            r'\becuația\s+de\s+gradul\s+al\s+doilea\b',
            r'\bsistemul\s+de\s+ecuații\b',
            r'\bderivata\s+funcției\b',
            r'\brădăcinile\s+(reale|complexe)?\s*pentru\b',
            r'\brezolv[ăi]\s+(ecuația|sistemul)\b',
            r'\bcalculez[ăi]\s+(rădăcinile|integrala)\b',
            r'\bdemonstrez[ăi]\s+că\b',
        ]
        
        for pattern in romanian_patterns:
            if re.search(pattern, query_lower, re.IGNORECASE):
                return True
        
        return False
    
    def translate_to_mathematical_notation(self, romanian_query: str) -> str:
        """Convert Romanian mathematical query to standard mathematical notation"""
        query = romanian_query.strip()
        
        # Remove Romanian instructional words and keep only mathematical expressions
        # Pattern: "Rezolvă ecuația: x² - 16 = 0" -> "x² - 16 = 0"
        instruction_patterns = [
            r'rezolv[ăi]\s+(sistemul\s+de\s+)?(ecuația|sistemul|ecuațiile)\s*:?\s*',
            r'calculez[ăi]\s+(rădăcinile\s+pentru\s+|integrala\s*:?\s*)?',
            r'găsește\s+soluția\s+pentru\s+(ecuația\s*)?:?\s*',
            r'determină\s+(derivata\s+funcției\s+)?',
            r'demonstrează\s+că\s+.*?(ecuația|rădăcinile)\s+.*?\s+',
            r'află\s+rădăcinile\s+reale\s+pentru\s+',
            r'calculează\s+integrala\s*:?\s*',
            r'ecuația\s+de\s+gradul\s+al\s+doilea\s*:?\s*',
            r'solve\s+ecuația\s*:?\s*',
            r'\bde\s+gradul\s+(al\s+)?(întâi|doilea|doi)\b',
            r'\bpentru\b', r'\bca\b', r'\bsi\b', r'\bsau\b',
            r'\bîn\b', r'\bde\b', r'\bla\b', r'\bcu\b', r'\bdin\b'
        ]
        
        # Clean Romanian instruction words
        for pattern in instruction_patterns:
            query = re.sub(pattern, '', query, flags=re.IGNORECASE)
        
        # Clean remaining Romanian mathematical terms that don't belong in expressions
        cleanup_terms = [
            r'\bpentru\b', r'\bsunt\s+egale\b', r'\bca\b', r'\bsi\b', r'\bsau\b',
            r'\bîn\b', r'\bde\b', r'\bla\b', r'\bcu\b', r'\bdin\b',
            r'\brădăcinile\b', r'\brădăcina\b', r'\broots\b', r'\broot\b',
            r'\bsoluția\b', r'\bsoluțiile\b', r'\bsolution\b', r'\bsolutions\b',
            r'\becuația\b', r'\becuațiile\b', r'\bequation\b', r'\bequations\b',
            r'\bsistemul\s+de\b', r'\bsistemul\b', r'\bsistem\b',
            r'\bderivata\s+funcției\b', r'\bderivata\b', r'\bfuncției\b',
            r'\bintegral[ae]\b', r'\bintegral\b',
            r'\bdemonstrează\s+că\b', r'\bdemonstrează\b', r'\bproofed?\b',
            r'\bcalculează\b', r'\bcalculate\b',
            r'\brezolv[ăi]\b', r'\bsolve\b'
        ]
        
        for term in cleanup_terms:
            query = re.sub(term, '', query, flags=re.IGNORECASE)
        
        # Clean up extra spaces and normalize
        query = re.sub(r'\s+', ' ', query).strip()
        
        # Remove colons but preserve commas in lists (for statistics)
        if '[' in query and ']' in query:
            # Preserve commas in lists like [1,2,3,4]
            query = re.sub(r':', '', query)
        else:
            # Remove both colons and commas if no list present
            query = re.sub(r'[:,]', '', query)
        
        return query.strip()
    
    def add_romanian_context_to_response(self, 
                                       english_result: str, 
                                       original_query: str) -> Tuple[str, RomanianMathematicalContext]:
        """Add Romanian cultural context to mathematical response"""
        
        # Detect mathematical domain
        domain = self._detect_mathematical_domain(original_query)
        
        # Create Romanian terminology mapping
        romanian_terminology = self._map_response_to_romanian(english_result)
        
        # Add cultural references
        cultural_refs = self._get_relevant_cultural_references(domain)
        
        # Create educational context
        educational_context = self._generate_educational_context(domain, original_query)
        
        # Enhanced response with Romanian context
        romanian_context = RomanianMathematicalContext(
            romanian_terminology=romanian_terminology,
            cultural_references=cultural_refs,
            educational_context=educational_context,
            historical_context=None,
            confidence=0.95
        )
        
        # Format bilingual response
        bilingual_response = self._format_bilingual_response(
            english_result, romanian_context, original_query
        )
        
        return bilingual_response, romanian_context
    
    def _detect_mathematical_domain(self, query: str) -> RomanianMathematicalDomain:
        """Detect the mathematical domain of the query"""
        query_lower = query.lower()
        
        domain_indicators = {
            RomanianMathematicalDomain.ALGEBRA: ['ecuație', 'necunoscută', 'polinom', 'algebră'],
            RomanianMathematicalDomain.CALCULUS: ['derivată', 'integrală', 'limită', 'analiză'],
            RomanianMathematicalDomain.GEOMETRY: ['triunghi', 'cerc', 'arie', 'geometrie'],
            RomanianMathematicalDomain.TRIGONOMETRY: ['sin', 'cos', 'tan', 'trigonometrie'],
        }
        
        for domain, indicators in domain_indicators.items():
            if any(indicator in query_lower for indicator in indicators):
                return domain
        
        return RomanianMathematicalDomain.ALGEBRA  # Default
    
    def _map_response_to_romanian(self, english_result: str) -> Dict[str, str]:
        """Map English mathematical terms in response to Romanian"""
        mapped_terms = {}
        
        for english, romanian in self.romanian_math_terms.items():
            if english.lower() in english_result.lower():
                mapped_terms[english] = romanian
        
        return mapped_terms
    
    def _get_relevant_cultural_references(self, domain: RomanianMathematicalDomain) -> List[str]:
        """Get relevant Romanian cultural references for mathematical domain"""
        base_refs = [
            "Școala Românească de Matematică",
            "Academia Română - Secția de Științe Matematice"
        ]
        
        domain_specific = {
            RomanianMathematicalDomain.ALGEBRA: ["tradiția algebrică românească"],
            RomanianMathematicalDomain.CALCULUS: ["analiza matematică românească", "Gheorghe Țițeica"],
            RomanianMathematicalDomain.GEOMETRY: ["geometria românească", "Nicolae Teodorescu"],
        }
        
        return base_refs + domain_specific.get(domain, [])
    
    def _generate_educational_context(self, domain: RomanianMathematicalDomain, query: str) -> str:
        """Generate Romanian educational context"""
        contexts = {
            RomanianMathematicalDomain.ALGEBRA: 
                "În sistemul educațional românesc, algebra este studiată începând din clasa a VII-a, "
                "cu accent pe ecuațiile de gradul întâi și al doilea în liceu.",
            
            RomanianMathematicalDomain.CALCULUS:
                "Analiza matematică face parte din curriculum-ul de matematică din liceu și este "
                "fundamentală în învățământul superior românesc.",
                
            RomanianMathematicalDomain.GEOMETRY:
                "Geometria are o tradiție puternică în matematica românească, fiind studiată "
                "atât în gimnaziu cât și în liceu cu aplicații practice."
        }
        
        return contexts.get(domain, "Această problemă matematică face parte din curriculum-ul educațional românesc.")
    
    def _format_bilingual_response(self, 
                                 english_result: str,
                                 context: RomanianMathematicalContext,
                                 original_query: str) -> str:
        """Format bilingual mathematical response with Romanian cultural context"""
        
        # Check if query was in Romanian
        if self.detect_romanian_mathematical_query(original_query):
            response = f"""🇷🇴 **Răspuns în Context Românesc**

**Soluția:** {english_result}

**Context Educațional:** {context.educational_context}

**Terminologie Matematică Românească:**"""
            
            if context.romanian_terminology:
                for eng, ro in context.romanian_terminology.items():
                    response += f"\n• {eng.title()} = {ro}"
            
            if context.cultural_references:
                response += f"\n\n**Referințe Culturale:**"
                for ref in context.cultural_references:
                    response += f"\n• {ref}"
            
            response += f"\n\n**Explicație:** Această problemă se rezolvă folosind principiile matematice "
            response += f"din tradiția educațională românească, cu aplicare practică în sistemul de învățământ național."
            
            return response
        else:
            # English query with Romanian cultural enhancement
            return f"""{english_result}

🇷🇴 **Romanian Cultural Context:** This mathematical problem is solved using principles from the Romanian mathematical education tradition, particularly relevant in the Romanian school system where such problems are typically introduced at the {context.educational_context.lower()} level."""

# Global instance for integration with mathematical engine
romanian_math_intelligence = RomanianMathematicalIntelligence()
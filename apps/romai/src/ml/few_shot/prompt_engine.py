"""
Few-Shot Prompt Engineering System for Romanian AI
Advanced context-aware prompting with Romanian cultural intelligence

This module implements sophisticated few-shot prompting techniques specifically
designed for Romanian language tasks, cultural contexts, and regional variants.
Targets: 5-shot accuracy > 90%, adaptation time < 50ms
"""

import asyncio
import time
import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import random
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

class RomanianPromptType(Enum):
    """Types of Romanian prompts"""
    CULTURAL_CONTEXT = "cultural_context"
    REGIONAL_DIALECT = "regional_dialect" 
    BUSINESS_FORMAL = "business_formal"
    TRADITIONAL_FOLK = "traditional_folk"
    MODERN_COLLOQUIAL = "modern_colloquial"
    ACADEMIC_FORMAL = "academic_formal"
    LITERARY_STYLE = "literary_style"
    NEWS_JOURNALISM = "news_journalism"
    SOCIAL_MEDIA = "social_media"
    TECHNICAL_DOMAIN = "technical_domain"

class CulturalRelevanceLevel(Enum):
    """Cultural relevance scoring levels"""
    LOW = 0.3
    MEDIUM = 0.6
    HIGH = 0.8
    VERY_HIGH = 0.95

@dataclass
class RomanianExample:
    """Romanian few-shot example with cultural metadata"""
    text: str
    label: str
    confidence: float
    cultural_context: str
    regional_variant: str
    linguistic_features: Dict[str, Any] = field(default_factory=dict)
    cultural_significance: float = 0.8
    complexity_level: str = "intermediate"
    
    def __post_init__(self):
        """Validate and enrich example data"""
        self.linguistic_features = self.linguistic_features or {}
        if "case_usage" not in self.linguistic_features:
            self.linguistic_features["case_usage"] = self._detect_case_usage()
        if "formality_level" not in self.linguistic_features:
            self.linguistic_features["formality_level"] = self._detect_formality()
        if "regional_markers" not in self.linguistic_features:
            self.linguistic_features["regional_markers"] = self._detect_regional_markers()
    
    def _detect_case_usage(self) -> List[str]:
        """Detect Romanian grammatical cases in text"""
        cases = []
        text_lower = self.text.lower()
        
        # Nominative markers
        if any(word in text_lower for word in ["care", "cine", "acest", "această"]):
            cases.append("nominativ")
        
        # Accusative markers
        if any(word in text_lower for word in ["pe", "către", "pentru"]):
            cases.append("acuzativ")
        
        # Genitive markers
        if any(word in text_lower for word in ["al", "a", "ale", "ai"]):
            cases.append("genitiv")
        
        # Dative markers
        if any(word in text_lower for word in ["îi", "le", "lui", "ei"]):
            cases.append("dativ")
        
        return cases
    
    def _detect_formality(self) -> str:
        """Detect formality level of Romanian text"""
        text_lower = self.text.lower()
        
        formal_markers = ["dumneavoastră", "domnul", "doamna", "vă rog", "mulțumesc"]
        informal_markers = ["tu", "îți", "mă", "te", "hai"]
        
        formal_count = sum(1 for marker in formal_markers if marker in text_lower)
        informal_count = sum(1 for marker in informal_markers if marker in text_lower)
        
        if formal_count > informal_count:
            return "formal"
        elif informal_count > formal_count:
            return "informal"
        else:
            return "neutral"
    
    def _detect_regional_markers(self) -> List[str]:
        """Detect regional dialect markers"""
        markers = []
        text_lower = self.text.lower()
        
        # Moldovan markers
        if any(word in text_lower for word in ["foame", "seamănă", "acasă"]):
            markers.append("moldovan")
        
        # Transylvanian markers
        if any(word in text_lower for word in ["puțin", "foarte", "acuma"]):
            markers.append("transylvanian")
        
        # Wallachian markers
        if any(word in text_lower for word in ["băiat", "fată", "merge"]):
            markers.append("wallachian")
        
        return markers

@dataclass
class RomanianPromptTemplate:
    """Template for Romanian few-shot prompts"""
    template_id: str
    prompt_type: RomanianPromptType
    base_template: str
    cultural_context: str
    regional_adaptations: Dict[str, str] = field(default_factory=dict)
    example_slots: int = 5
    target_accuracy: float = 0.90
    complexity_level: str = "intermediate"
    
    def format_prompt(self, examples: List[RomanianExample], query: str) -> str:
        """Format few-shot prompt with Romanian examples"""
        formatted_examples = []
        
        for i, example in enumerate(examples[:self.example_slots]):
            formatted_example = self._format_single_example(example, i + 1)
            formatted_examples.append(formatted_example)
        
        examples_text = "\n\n".join(formatted_examples)
        
        return self.base_template.format(
            cultural_context=self.cultural_context,
            examples=examples_text,
            query=query,
            instruction=self._get_cultural_instruction()
        )
    
    def _format_single_example(self, example: RomanianExample, index: int) -> str:
        """Format a single Romanian example"""
        return f"""Exemplul {index}:
Text: "{example.text}"
Contexte cultural: {example.cultural_context}
Variantă regională: {example.regional_variant}
Răspuns: {example.label}
Încredere: {example.confidence:.2f}"""
    
    def _get_cultural_instruction(self) -> str:
        """Get cultural instruction based on prompt type"""
        instructions = {
            RomanianPromptType.CULTURAL_CONTEXT: "Analizează contextul cultural românesc și oferă un răspuns apropiat de tradițiile naționale.",
            RomanianPromptType.REGIONAL_DIALECT: "Identifică varianta regională și adaptează răspunsul la specificitatea locală.",
            RomanianPromptType.BUSINESS_FORMAL: "Răspunde în stil formal de afaceri, respectând protocoalele românești.",
            RomanianPromptType.TRADITIONAL_FOLK: "Folosește cunoștințele despre tradițiile populare românești.",
            RomanianPromptType.MODERN_COLLOQUIAL: "Răspunde în stil modern și colocvial, specific tinerilor români.",
        }
        return instructions.get(self.prompt_type, "Oferă un răspuns precis și cultural relevant.")

class RomanianFewShotPromptEngine:
    """Advanced few-shot prompt engineering for Romanian AI"""
    
    def __init__(self):
        self.templates = {}
        self.cultural_knowledge = {}
        self.regional_variants = ["bucurești", "cluj-napoca", "iași", "timișoara", "constanța"]
        self.performance_cache = {}
        self.adaptation_history = []
        
        # Initialize prompt templates
        self._initialize_prompt_templates()
        self._load_cultural_knowledge()
        
        logger.info("Romanian Few-Shot Prompt Engine initialized")
    
    def _initialize_prompt_templates(self):
        """Initialize Romanian prompt templates"""
        # Cultural context template
        self.templates[RomanianPromptType.CULTURAL_CONTEXT] = RomanianPromptTemplate(
            template_id="cultural_context_v1",
            prompt_type=RomanianPromptType.CULTURAL_CONTEXT,
            base_template="""Sarcină: Analiză culturală românească

Contexte: {cultural_context}

Exemple de referință:
{examples}

Întrebare: {query}

{instruction}

Răspuns:""",
            cultural_context="tradiții și obiceiuri românești",
            example_slots=5,
            target_accuracy=0.92
        )
        
        # Regional dialect template
        self.templates[RomanianPromptType.REGIONAL_DIALECT] = RomanianPromptTemplate(
            template_id="regional_dialect_v1",
            prompt_type=RomanianPromptType.REGIONAL_DIALECT,
            base_template="""Sarcină: Analiza variantelor regionale românești

Contexte regional: {cultural_context}

Exemple din diferite regiuni:
{examples}

Întrebare: {query}

{instruction}

Răspuns adaptat regional:""",
            cultural_context="diversitate lingvistică regională",
            example_slots=5,
            target_accuracy=0.88
        )
        
        # Business formal template
        self.templates[RomanianPromptType.BUSINESS_FORMAL] = RomanianPromptTemplate(
            template_id="business_formal_v1",
            prompt_type=RomanianPromptType.BUSINESS_FORMAL,
            base_template="""Context de afaceri românesc

Situația: {cultural_context}

Exemple de comunicare formală:
{examples}

Solicitare: {query}

{instruction}

Răspuns profesional:""",
            cultural_context="mediul de afaceri românesc",
            example_slots=4,
            target_accuracy=0.94
        )
        
        logger.info(f"Initialized {len(self.templates)} Romanian prompt templates")
    
    def _load_cultural_knowledge(self):
        """Load Romanian cultural knowledge base"""
        self.cultural_knowledge = {
            "traditional_holidays": [
                "Crăciun", "Paște", "Mărțișor", "Dragobete", "Sfântul Ioan",
                "Sânzienele", "Sfântul Andrei", "Bobotează"
            ],
            "cultural_symbols": [
                "tricolorul", "hora", "mărțișorul", "mămăliga", "brânza",
                "tuica", "cozonac", "colinde", "daci", "voievozi"
            ],
            "regional_specialties": {
                "transilvania": ["sarmale", "papanași", "kurtos kalacs"],
                "moldovo": ["răcituri", "tobă", "pască"],
                "muntenia": ["mici", "ciorbă de burtă", "papanași"],
                "oltenia": ["ciolan afumat", "salată de icre", "cozonac"],
                "dobrogea": ["pește din Dunăre", "musaca", "baclava"]
            },
            "business_etiquette": [
                "respectul pentru vârsta", "formalizarea întâlnirilor",
                "importanța relațiilor personale", "punctualitatea"
            ],
            "linguistic_patterns": {
                "formal_address": ["dumneavoastră", "domnul", "doamna"],
                "informal_markers": ["tu", "frate", "măi"],
                "regional_variations": ["foame/flămând", "acasă/la casă"]
            }
        }
        
        logger.info("Romanian cultural knowledge base loaded")
    
    async def generate_few_shot_prompt(
        self,
        prompt_type: RomanianPromptType,
        query: str,
        context: Dict[str, Any],
        num_examples: int = 5
    ) -> Tuple[str, Dict[str, Any]]:
        """Generate few-shot prompt for Romanian task"""
        
        start_time = time.time()
        
        try:
            # Get appropriate template
            template = self.templates.get(prompt_type)
            if not template:
                raise ValueError(f"Template not found for {prompt_type}")
            
            # Generate contextual examples
            examples = await self._generate_contextual_examples(
                prompt_type, context, num_examples
            )
            
            # Adapt examples for cultural relevance
            adapted_examples = await self._adapt_examples_culturally(
                examples, context
            )
            
            # Format final prompt
            formatted_prompt = template.format_prompt(adapted_examples, query)
            
            generation_time = (time.time() - start_time) * 1000
            
            metadata = {
                "generation_time_ms": generation_time,
                "template_id": template.template_id,
                "num_examples": len(adapted_examples),
                "cultural_relevance": self._calculate_cultural_relevance(adapted_examples),
                "target_accuracy": template.target_accuracy,
                "prompt_type": prompt_type.value,
                "speed_target_met": generation_time < 50,  # < 50ms target
                "adaptation_count": len(self.adaptation_history)
            }
            
            # Cache for performance tracking
            self.performance_cache[f"{prompt_type.value}_{int(time.time())}"] = metadata
            
            logger.info(f"Generated {prompt_type.value} prompt in {generation_time:.2f}ms")
            
            return formatted_prompt, metadata
            
        except Exception as e:
            logger.error(f"Failed to generate few-shot prompt: {e}")
            raise
    
    async def _generate_contextual_examples(
        self,
        prompt_type: RomanianPromptType,
        context: Dict[str, Any],
        num_examples: int
    ) -> List[RomanianExample]:
        """Generate contextually relevant Romanian examples"""
        
        examples = []
        cultural_context = context.get("cultural_context", "traditional_romanian")
        regional_variant = context.get("regional_variant", "bucurești")
        
        # Base examples by prompt type
        base_examples = await self._get_base_examples_by_type(prompt_type)
        
        # Select and adapt examples
        for i in range(min(num_examples, len(base_examples))):
            base_example = base_examples[i]
            
            # Adapt to context
            adapted_example = RomanianExample(
                text=base_example["text"],
                label=base_example["label"],
                confidence=base_example.get("confidence", 0.85),
                cultural_context=cultural_context,
                regional_variant=regional_variant,
                linguistic_features=base_example.get("linguistic_features", {}),
                cultural_significance=base_example.get("cultural_significance", 0.8),
                complexity_level=context.get("complexity_level", "intermediate")
            )
            
            examples.append(adapted_example)
        
        return examples
    
    async def _get_base_examples_by_type(self, prompt_type: RomanianPromptType) -> List[Dict]:
        """Get base examples for specific prompt type"""
        
        examples_by_type = {
            RomanianPromptType.CULTURAL_CONTEXT: [
                {
                    "text": "Mărțișorul este o tradiție românească veche de peste 8000 de ani.",
                    "label": "tradiție culturală",
                    "confidence": 0.95,
                    "cultural_significance": 0.98
                },
                {
                    "text": "Hora se dansează în cercuri mari la sărbătorile tradiționale.",
                    "label": "dans tradițional",
                    "confidence": 0.92,
                    "cultural_significance": 0.94
                },
                {
                    "text": "Colindele se cântă în perioada Crăciunului prin satele românești.",
                    "label": "muzică tradițională",
                    "confidence": 0.90,
                    "cultural_significance": 0.96
                },
                {
                    "text": "Mămăliga a fost mâncarea de bază a țăranilor români.",
                    "label": "gastronomie tradițională",
                    "confidence": 0.88,
                    "cultural_significance": 0.85
                },
                {
                    "text": "Iile românești sunt costume naționale cu broderii specifice.",
                    "label": "costume tradiționale",
                    "confidence": 0.93,
                    "cultural_significance": 0.97
                }
            ],
            RomanianPromptType.REGIONAL_DIALECT: [
                {
                    "text": "În Transilvania se spune 'puțin' pentru 'puțin'.",
                    "label": "variant regional Transilvania",
                    "confidence": 0.87,
                    "cultural_significance": 0.75
                },
                {
                    "text": "Moldova păstrează expresii precum 'foame mare'.",
                    "label": "variant regional Moldova",
                    "confidence": 0.85,
                    "cultural_significance": 0.80
                },
                {
                    "text": "În Oltenia se folosește 'fată' pentru 'fată tânără'.",
                    "label": "variant regional Oltenia",
                    "confidence": 0.83,
                    "cultural_significance": 0.78
                },
                {
                    "text": "Dobrogea are influențe turcești în vocabular.",
                    "label": "variant regional Dobrogea",
                    "confidence": 0.82,
                    "cultural_significance": 0.74
                },
                {
                    "text": "București folosește un dialect urban modern.",
                    "label": "variant urban București",
                    "confidence": 0.89,
                    "cultural_significance": 0.70
                }
            ],
            RomanianPromptType.BUSINESS_FORMAL: [
                {
                    "text": "Vă mulțumim pentru colaborarea dumneavoastră în acest proiect.",
                    "label": "mulțumire formală",
                    "confidence": 0.94,
                    "cultural_significance": 0.85
                },
                {
                    "text": "Domnul director dorește să discute despre contractul de furnizare.",
                    "label": "solicitare întâlnire",
                    "confidence": 0.91,
                    "cultural_significance": 0.82
                },
                {
                    "text": "Compania noastră respectă toate normele românești în vigoare.",
                    "label": "conformitate legală",
                    "confidence": 0.93,
                    "cultural_significance": 0.88
                },
                {
                    "text": "Raportul financiar va fi prezentat în ședința de mâine.",
                    "label": "anunț oficial",
                    "confidence": 0.90,
                    "cultural_significance": 0.80
                },
                {
                    "text": "Parteneriatul strategic cu această firmă românească este prioritar.",
                    "label": "strategie business",
                    "confidence": 0.92,
                    "cultural_significance": 0.86
                }
            ]
        }
        
        return examples_by_type.get(prompt_type, [])
    
    async def _adapt_examples_culturally(
        self,
        examples: List[RomanianExample],
        context: Dict[str, Any]
    ) -> List[RomanianExample]:
        """Adapt examples for cultural relevance"""
        
        adapted_examples = []
        cultural_focus = context.get("cultural_focus", "traditional")
        
        for example in examples:
            # Enhance cultural context based on focus
            if cultural_focus == "traditional":
                example.cultural_significance = min(1.0, example.cultural_significance + 0.1)
            elif cultural_focus == "modern":
                example.complexity_level = "advanced"
            
            # Regional adaptation
            regional_variant = context.get("regional_variant", "bucurești")
            if regional_variant != example.regional_variant:
                example = await self._adapt_to_region(example, regional_variant)
            
            adapted_examples.append(example)
        
        return adapted_examples
    
    async def _adapt_to_region(
        self,
        example: RomanianExample,
        target_region: str
    ) -> RomanianExample:
        """Adapt example to specific Romanian region"""
        
        regional_adaptations = {
            "transilvania": {
                "markers": ["puțin", "foarte", "acuma"],
                "cultural_elements": ["sarmale", "brânză de burduf"]
            },
            "moldovo": {
                "markers": ["foame", "acasă", "seamănă"],
                "cultural_elements": ["răcituri", "pască"]
            },
            "muntenia": {
                "markers": ["băiat", "fată", "merge"],
                "cultural_elements": ["mici", "ciorbă de burtă"]
            }
        }
        
        adaptation = regional_adaptations.get(target_region, {})
        
        # Update regional variant
        example.regional_variant = target_region
        
        # Add regional linguistic features
        if "regional_markers" not in example.linguistic_features:
            example.linguistic_features["regional_markers"] = []
        
        example.linguistic_features["regional_markers"].extend(
            adaptation.get("markers", [])
        )
        
        return example
    
    def _calculate_cultural_relevance(self, examples: List[RomanianExample]) -> float:
        """Calculate overall cultural relevance score"""
        if not examples:
            return 0.0
        
        total_relevance = sum(example.cultural_significance for example in examples)
        return total_relevance / len(examples)
    
    async def optimize_prompt_performance(
        self,
        prompt_type: RomanianPromptType,
        performance_feedback: Dict[str, Any]
    ):
        """Optimize prompt performance based on feedback"""
        
        try:
            accuracy = performance_feedback.get("accuracy", 0.0)
            speed = performance_feedback.get("generation_time_ms", 0.0)
            cultural_appropriateness = performance_feedback.get("cultural_score", 0.0)
            
            # Record adaptation
            adaptation_record = {
                "timestamp": datetime.now().isoformat(),
                "prompt_type": prompt_type.value,
                "performance": {
                    "accuracy": accuracy,
                    "speed": speed,
                    "cultural_score": cultural_appropriateness
                },
                "optimization_applied": []
            }
            
            # Apply optimizations
            if accuracy < 0.90:
                # Increase example quality
                template = self.templates[prompt_type]
                template.example_slots = min(7, template.example_slots + 1)
                adaptation_record["optimization_applied"].append("increased_examples")
            
            if speed > 50:
                # Simplify template
                template = self.templates[prompt_type]
                template.complexity_level = "basic"
                adaptation_record["optimization_applied"].append("simplified_template")
            
            if cultural_appropriateness < 0.90:
                # Enhance cultural content
                await self._enhance_cultural_knowledge()
                adaptation_record["optimization_applied"].append("enhanced_cultural_knowledge")
            
            self.adaptation_history.append(adaptation_record)
            
            logger.info(f"Optimized {prompt_type.value} prompt - applied {len(adaptation_record['optimization_applied'])} optimizations")
            
        except Exception as e:
            logger.error(f"Failed to optimize prompt performance: {e}")
    
    async def _enhance_cultural_knowledge(self):
        """Enhance cultural knowledge base"""
        # Add more cultural elements
        additional_holidays = ["Ziua Unării", "Ziua Culturii Naționale", "Ziua Limbii Române"]
        self.cultural_knowledge["traditional_holidays"].extend(additional_holidays)
        
        # Update regional specialties
        new_specialties = {
            "maramureș": ["țuică de prune", "jintiță", "baia sprie"],
            "bucovina": ["papanași", "ciorbă de perișoare", "colac"]
        }
        self.cultural_knowledge["regional_specialties"].update(new_specialties)
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        
        if not self.performance_cache:
            return {
                "no_data": True,
                "message": "No performance data available yet"
            }
        
        recent_entries = list(self.performance_cache.values())[-10:]  # Last 10 entries
        
        avg_speed = sum(entry["generation_time_ms"] for entry in recent_entries) / len(recent_entries)
        avg_relevance = sum(entry["cultural_relevance"] for entry in recent_entries) / len(recent_entries)
        speed_target_rate = sum(1 for entry in recent_entries if entry["speed_target_met"]) / len(recent_entries)
        
        return {
            "performance_summary": {
                "average_generation_time_ms": avg_speed,
                "average_cultural_relevance": avg_relevance,
                "speed_target_achievement_rate": speed_target_rate,
                "total_prompts_generated": len(self.performance_cache),
                "adaptations_applied": len(self.adaptation_history)
            },
            "targets": {
                "speed_target": "< 50ms",
                "accuracy_target": "> 90%",
                "cultural_relevance_target": "> 95%"
            },
            "template_count": len(self.templates),
            "cultural_knowledge_items": sum(len(v) if isinstance(v, list) else len(v) if isinstance(v, dict) else 1 for v in self.cultural_knowledge.values())
        }

# Export key classes
__all__ = [
    "RomanianFewShotPromptEngine",
    "RomanianPromptType", 
    "RomanianExample",
    "RomanianPromptTemplate",
    "CulturalRelevanceLevel"
]

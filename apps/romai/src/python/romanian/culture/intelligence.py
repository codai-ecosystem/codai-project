"""
RomAI AGI - Romanian Cultural Intelligence Engine
Week 3 Day 2: Enhanced Cultural Reasoning and Decision Making

Advanced cultural intelligence system specifically designed for Romanian context.
Provides deep cultural analysis, regional understanding, and intelligent decision making.
"""

import asyncio
import json
import logging
import re
from dataclasses import dataclass
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CulturalEntity:
    name: str
    category: str
    region: Optional[str]
    historical_period: Optional[str]
    cultural_significance: float
    modern_relevance: float
    regional_variations: List[str]
    related_entities: List[str]
    description: str

@dataclass
class RegionalContext:
    region_name: str
    dialects: List[str]
    cultural_specifics: List[str]
    traditional_practices: List[str]
    modern_adaptations: List[str]
    population_centers: List[str]
    cultural_sensitivity_level: float

@dataclass
class CulturalAnalysisResult:
    text: str
    cultural_entities_detected: List[CulturalEntity]
    regional_context: Optional[RegionalContext]
    cultural_complexity_score: float
    sensitivity_score: float
    recommendations: List[str]
    confidence_level: float

class RomanianCulturalIntelligence:
    """
    Advanced Romanian cultural intelligence engine for deep cultural understanding
    and context-aware decision making.
    """
    
    def __init__(self, cbd_url: str = "http://localhost:4180"):
        self.cbd_url = cbd_url
        self.session = None
        
        # Comprehensive Romanian cultural knowledge base
        self.cultural_categories = {
            "historical_figures": {
                "entities": [
                    "Mihai Viteazul", "Ștefan cel Mare", "Vlad Țepeș", "Tudor Vladimirescu",
                    "Ion Creangă", "Mihai Eminescu", "George Enescu", "Constantin Brâncuși",
                    "Nicolae Iorga", "Lucian Blaga", "Marin Preda", "Mircea Eliade"
                ],
                "significance": 0.95,
                "sensitivity": 0.85
            },
            "geographical_regions": {
                "entities": [
                    "Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea",
                    "Maramureș", "Banat", "Bucovina", "Crișana", "Hunedoara"
                ],
                "significance": 0.90,
                "sensitivity": 0.70
            },
            "traditional_celebrations": {
                "entities": [
                    "Paștele", "Crăciunul", "Boboteaza", "Dragobete", "Mărțișorul",
                    "Sânzienele", "Sântul Gheorghe", "Adormirea Maicii Domnului",
                    "Sfântul Nicolae", "Sfântul Ion", "Sărbătoarea Iei", "Hramul"
                ],
                "significance": 0.92,
                "sensitivity": 0.88
            },
            "folklore_traditions": {
                "entities": [
                    "hora", "căluș", "mioriță", "colinde", "plugușorul", "sorcova",
                    "strigături", "doină", "bocet", "descântec", "joc", "ciobănașul"
                ],
                "significance": 0.88,
                "sensitivity": 0.82
            },
            "culinary_heritage": {
                "entities": [
                    "sarmale", "mici", "papanași", "cozonac", "drob", "ciorbă de burtă",
                    "mămăligă", "papricaș", "ciulama", "salată de icre", "frigărui",
                    "mucenici", "coliva", "turtă dulce", "prăjitură cu nuci"
                ],
                "significance": 0.85,
                "sensitivity": 0.65
            },
            "architectural_heritage": {
                "entities": [
                    "biserici pictate", "case țărănești", "conace boierești", "cetăți medievale",
                    "mănăstiri", "biserici de lemn", "arhitectură brâncovenească",
                    "stil neoromanesc", "art nouveau românesc", "arhitectură populară"
                ],
                "significance": 0.87,
                "sensitivity": 0.75
            },
            "literary_works": {
                "entities": [
                    "Luceafărul", "Miorița", "Harap Alb", "Amintiri din copilărie",
                    "Baltagul", "Ion", "Enigma Otiliei", "Ultima noapte de dragoste",
                    "Pădurea spânzuraților", "Cronica și cântecul vârstelor"
                ],
                "significance": 0.93,
                "sensitivity": 0.80
            },
            "traditional_crafts": {
                "entities": [
                    "țesături tradiționale", "ceramică populară", "sculptură în lemn",
                    "filigran", "țuică", "pălincă", "brânzeturi tradiționale",
                    "covoare olteneți", "opinci", "ie românească", "măști populare"
                ],
                "significance": 0.84,
                "sensitivity": 0.70
            },
            "natural_landmarks": {
                "entities": [
                    "Carpații", "Delta Dunării", "Munții Apuseni", "Munții Retezat",
                    "Cheile Bicazului", "Lacul Roșu", "Platoul Bucegi", "Sfinxul",
                    "Omu Peak", "Munții Rodnei", "Parcul Național Piatra Craiului"
                ],
                "significance": 0.86,
                "sensitivity": 0.60
            },
            "spiritual_traditions": {
                "entities": [
                    "ortodoxism românesc", "rugăciuni populare", "icoane făcătoare de minuni",
                    "pelerinaje", "postire tradițională", "ceremonii de trecere",
                    "botez", "cununie", "înmormântare", "sfințirea caselor"
                ],
                "significance": 0.90,
                "sensitivity": 0.95
            }
        }
        
        # Regional dialects and characteristics
        self.regional_contexts = {
            "Transilvania": RegionalContext(
                region_name="Transilvania",
                dialects=["graiuri transilvane", "dialectul ardelenesc"],
                cultural_specifics=[
                    "influențe maghiare și germane", "arhitectură saxonă",
                    "multiculturalitate istorică", "tradiții luterane și catolice"
                ],
                traditional_practices=[
                    "colinde de Crăciun specifice", "jocuri populare ardelenești",
                    "artizanat specific", "bucătărie cu influențe austriece"
                ],
                modern_adaptations=[
                    "turism cultural", "festivaluri multiculturale",
                    "conservarea patrimoniului", "integrare europeană"
                ],
                population_centers=["Cluj-Napoca", "Brașov", "Sibiu", "Târgu Mureș"],
                cultural_sensitivity_level=0.85
            ),
            "Moldova": RegionalContext(
                region_name="Moldova",
                dialects=["graiul moldovenesc", "dialectul moldav"],
                cultural_specifics=[
                    "tradiții ortodoxe puternice", "influențe ucrainiene și rusești",
                    "arhitectură moldovenească specifică", "artă populară bogată"
                ],
                traditional_practices=[
                    "hora moldovenească", "ceramica de Marginea",
                    "țesături tradiționale", "bucătărie moldovenească"
                ],
                modern_adaptations=[
                    "conservarea tradițiilor", "dezvoltare rurală",
                    "turism monastic", "artizanat contemporan"
                ],
                population_centers=["Iași", "Suceava", "Botoșani", "Vaslui"],
                cultural_sensitivity_level=0.88
            ),
            "Muntenia": RegionalContext(
                region_name="Muntenia",
                dialects=["graiul muntenesc", "dialectul valah"],
                cultural_specifics=[
                    "centru politic și cultural", "influențe balcanice",
                    "arhitectura brâncovenească", "tradiții domnești"
                ],
                traditional_practices=[
                    "călușul", "jocuri de pe Câmpie", "artizanat popular",
                    "bucătărie de curte domnească"
                ],
                modern_adaptations=[
                    "urbanizare intensă", "păstrarea tradițiilor rurale",
                    "muzee și centre culturale", "evenimente tradiționale"
                ],
                population_centers=["București", "Ploiești", "Târgoviște", "Craiova"],
                cultural_sensitivity_level=0.80
            )
        }
        
        # Cultural sensitivity patterns
        self.sensitivity_patterns = {
            "religious": {
                "keywords": ["orthodox", "biserică", "mănăstire", "rugăciune", "post", "sărbătoare"],
                "sensitivity_score": 0.95,
                "handling_guidelines": [
                    "Respectă tradițiile ortodoxe românești",
                    "Evită interpretări seculare ale sărbătorilor religioase",
                    "Recunoaște importanța spiritualității în cultura română"
                ]
            },
            "historical": {
                "keywords": ["război", "ocupație", "regim", "revoluție", "dictatură"],
                "sensitivity_score": 0.90,
                "handling_guidelines": [
                    "Tratează cu respect evenimentele istorice traumatice",
                    "Recunoaște impactul asupra identității naționale",
                    "Evită simplificări sau comparații inadecvate"
                ]
            },
            "linguistic": {
                "keywords": ["limba română", "diacritice", "pronunție", "gramatică"],
                "sensitivity_score": 0.85,
                "handling_guidelines": [
                    "Respectă corectitudinea limbii române",
                    "Utilizează diacriticele corespunzător",
                    "Recunoaște diversitatea dialectală"
                ]
            }
        }
        
        # Performance metrics
        self.analysis_count = 0
        self.accuracy_scores = []
        self.cultural_coverage_stats = {}
    
    async def initialize(self):
        """Initialize the cultural intelligence engine."""
        self.session = aiohttp.ClientSession()
        
        # Load cultural entities into CBD
        await self._load_cultural_knowledge_base()
        
        logger.info("🧠 Romanian Cultural Intelligence Engine initialized")
    
    async def _load_cultural_knowledge_base(self):
        """Load comprehensive cultural knowledge base into CBD."""
        for category, data in self.cultural_categories.items():
            for entity_name in data["entities"]:
                entity = CulturalEntity(
                    name=entity_name,
                    category=category,
                    region=None,  # Will be determined dynamically
                    historical_period=None,
                    cultural_significance=data["significance"],
                    modern_relevance=0.75,  # Default value
                    regional_variations=[],
                    related_entities=[],
                    description=f"Romanian cultural entity in {category} category"
                )
                
                await self._store_cultural_entity(entity)
        
        logger.info(f"✅ Loaded {sum(len(data['entities']) for data in self.cultural_categories.values())} cultural entities")
    
    async def _store_cultural_entity(self, entity: CulturalEntity):
        """Store cultural entity in CBD."""
        entity_data = {
            "name": entity.name,
            "category": entity.category,
            "region": entity.region,
            "historical_period": entity.historical_period,
            "cultural_significance": entity.cultural_significance,
            "modern_relevance": entity.modern_relevance,
            "regional_variations": entity.regional_variations,
            "related_entities": entity.related_entities,
            "description": entity.description,
            "stored_at": datetime.now().isoformat()
        }
        
        try:
            async with self.session.post(
                f"{self.cbd_url}/document",
                json={
                    "collection": "cultural_entities",
                    "document": entity_data
                }
            ) as response:
                if response.status == 200:
                    logger.debug(f"✅ Cultural entity {entity.name} stored")
        except Exception as e:
            logger.error(f"❌ Error storing cultural entity {entity.name}: {str(e)}")
    
    async def analyze_cultural_content(self, text: str, context: Dict[str, Any] = None) -> CulturalAnalysisResult:
        """
        Perform comprehensive cultural analysis of Romanian text content.
        
        Args:
            text: Text to analyze for cultural content
            context: Additional context information
            
        Returns:
            CulturalAnalysisResult with detailed analysis
        """
        self.analysis_count += 1
        start_time = datetime.now()
        
        # Detect cultural entities
        detected_entities = await self._detect_cultural_entities(text)
        
        # Determine regional context
        regional_context = self._determine_regional_context(text, detected_entities)
        
        # Calculate cultural complexity
        complexity_score = self._calculate_cultural_complexity(text, detected_entities)
        
        # Assess cultural sensitivity
        sensitivity_score = self._assess_cultural_sensitivity(text)
        
        # Generate recommendations
        recommendations = self._generate_cultural_recommendations(
            text, detected_entities, regional_context, sensitivity_score
        )
        
        # Calculate confidence level
        confidence_level = self._calculate_confidence_level(
            detected_entities, complexity_score, sensitivity_score
        )
        
        # Create analysis result
        result = CulturalAnalysisResult(
            text=text,
            cultural_entities_detected=detected_entities,
            regional_context=regional_context,
            cultural_complexity_score=complexity_score,
            sensitivity_score=sensitivity_score,
            recommendations=recommendations,
            confidence_level=confidence_level
        )
        
        # Store analysis in CBD
        await self._store_cultural_analysis(result)
        
        # Update performance metrics
        analysis_time = (datetime.now() - start_time).total_seconds()
        logger.info(f"🧠 Cultural analysis completed in {analysis_time:.2f}s (Confidence: {confidence_level:.2f})")
        
        return result
    
    async def _detect_cultural_entities(self, text: str) -> List[CulturalEntity]:
        """Detect Romanian cultural entities in the text."""
        detected_entities = []
        text_lower = text.lower()
        
        for category, data in self.cultural_categories.items():
            for entity_name in data["entities"]:
                # Check for exact match or partial match
                if entity_name.lower() in text_lower:
                    entity = CulturalEntity(
                        name=entity_name,
                        category=category,
                        region=self._determine_entity_region(entity_name),
                        historical_period=self._determine_historical_period(entity_name),
                        cultural_significance=data["significance"],
                        modern_relevance=self._calculate_modern_relevance(entity_name),
                        regional_variations=self._find_regional_variations(entity_name),
                        related_entities=self._find_related_entities(entity_name),
                        description=f"Romanian {category} entity: {entity_name}"
                    )
                    detected_entities.append(entity)
        
        # Sort by cultural significance
        detected_entities.sort(key=lambda e: e.cultural_significance, reverse=True)
        
        return detected_entities
    
    def _determine_regional_context(self, text: str, entities: List[CulturalEntity]) -> Optional[RegionalContext]:
        """Determine the regional context based on text content and detected entities."""
        text_lower = text.lower()
        region_scores = {}
        
        # Check for explicit regional mentions
        for region_name, region_data in self.regional_contexts.items():
            score = 0.0
            
            # Direct region name mention
            if region_name.lower() in text_lower:
                score += 0.5
            
            # Population centers
            for city in region_data.population_centers:
                if city.lower() in text_lower:
                    score += 0.3
            
            # Dialectal words
            for dialect in region_data.dialects:
                if any(word in text_lower for word in dialect.split()):
                    score += 0.2
            
            # Cultural specifics
            for specific in region_data.cultural_specifics:
                if any(word in text_lower for word in specific.split()):
                    score += 0.1
            
            if score > 0:
                region_scores[region_name] = score
        
        # Check entities for regional associations
        for entity in entities:
            if entity.region and entity.region in self.regional_contexts:
                region_scores[entity.region] = region_scores.get(entity.region, 0) + 0.2
        
        if region_scores:
            best_region = max(region_scores, key=region_scores.get)
            if region_scores[best_region] > 0.3:  # Minimum threshold
                return self.regional_contexts[best_region]
        
        return None
    
    def _calculate_cultural_complexity(self, text: str, entities: List[CulturalEntity]) -> float:
        """Calculate the cultural complexity score of the content."""
        complexity = 0.0
        
        # Base complexity from detected entities
        for entity in entities:
            complexity += entity.cultural_significance * 0.3
        
        # Complexity from multiple categories
        categories = set(entity.category for entity in entities)
        complexity += len(categories) * 0.1
        
        # Complexity from cultural keywords
        cultural_keywords = [
            "tradiție", "obicei", "folclor", "patrimoniu", "identitate",
            "spiritualitate", "ritualuri", "ceremonial", "ancestral"
        ]
        
        text_lower = text.lower()
        for keyword in cultural_keywords:
            if keyword in text_lower:
                complexity += 0.05
        
        # Complexity from regional diversity
        regions = set(entity.region for entity in entities if entity.region)
        complexity += len(regions) * 0.15
        
        # Normalize to 0-1 range
        return min(complexity, 1.0)
    
    def _assess_cultural_sensitivity(self, text: str) -> float:
        """Assess cultural sensitivity level of the content."""
        sensitivity = 0.0
        text_lower = text.lower()
        
        for pattern_name, pattern_data in self.sensitivity_patterns.items():
            for keyword in pattern_data["keywords"]:
                if keyword in text_lower:
                    sensitivity = max(sensitivity, pattern_data["sensitivity_score"])
        
        # Check for religious content
        religious_keywords = ["biserică", "mănăstire", "rugăciune", "sfânt", "divin"]
        for keyword in religious_keywords:
            if keyword in text_lower:
                sensitivity = max(sensitivity, 0.95)
        
        # Check for historical content
        historical_keywords = ["război", "istorie", "național", "eroic", "martir"]
        for keyword in historical_keywords:
            if keyword in text_lower:
                sensitivity = max(sensitivity, 0.85)
        
        return sensitivity
    
    def _generate_cultural_recommendations(
        self, 
        text: str, 
        entities: List[CulturalEntity], 
        regional_context: Optional[RegionalContext],
        sensitivity_score: float
    ) -> List[str]:
        """Generate recommendations for cultural content handling."""
        recommendations = []
        
        # High sensitivity recommendations
        if sensitivity_score > 0.9:
            recommendations.append("Această conținut are sensibilitate culturală ridicată - tratați cu respect deosebit")
            recommendations.append("Verificați acuratețea informațiilor culturale și istorice")
        
        # Regional context recommendations
        if regional_context:
            recommendations.append(f"Conținut specific regiunii {regional_context.region_name}")
            recommendations.append(f"Considerați specificul cultural al regiunii {regional_context.region_name}")
            
            if regional_context.cultural_sensitivity_level > 0.85:
                recommendations.append("Această regiune are tradiții sensibile - respectați particularitățile locale")
        
        # Entity-specific recommendations
        if entities:
            religious_entities = [e for e in entities if "spiritual" in e.category or "religios" in e.category]
            if religious_entities:
                recommendations.append("Conținut cu elemente religioase - respectați tradițiile ortodoxe românești")
            
            historical_entities = [e for e in entities if "historical" in e.category]
            if historical_entities:
                recommendations.append("Conținut istoric - verificați exactitatea informațiilor și contextul")
        
        # Linguistic recommendations
        if any(char in text for char in ['ă', 'â', 'î', 'ș', 'ț']):
            recommendations.append("Utilizați diacriticele românești corect pentru autenticitate")
        
        # Default recommendations
        if not recommendations:
            recommendations.append("Conținut cu relevanță culturală românească - păstrați autenticitatea")
        
        return recommendations
    
    def _calculate_confidence_level(
        self, 
        entities: List[CulturalEntity], 
        complexity_score: float,
        sensitivity_score: float
    ) -> float:
        """Calculate confidence level of the cultural analysis."""
        confidence = 0.5  # Base confidence
        
        # Entity detection confidence
        if entities:
            avg_significance = sum(e.cultural_significance for e in entities) / len(entities)
            confidence += avg_significance * 0.3
        
        # Complexity confidence
        if complexity_score > 0.7:
            confidence += 0.1
        elif complexity_score > 0.4:
            confidence += 0.05
        
        # Multiple category bonus
        categories = set(entity.category for entity in entities)
        if len(categories) > 2:
            confidence += 0.1
        
        # Penalize if no entities detected
        if not entities:
            confidence -= 0.2
        
        return min(max(confidence, 0.0), 1.0)
    
    def _determine_entity_region(self, entity_name: str) -> Optional[str]:
        """Determine the primary region associated with an entity."""
        # This would be enhanced with a comprehensive database
        region_associations = {
            "Transilvania": ["brașov", "cluj", "sibiu", "sighișoara", "hunedoara"],
            "Moldova": ["iași", "suceava", "bucovina", "marginea", "voroneț"],
            "Muntenia": ["bucurești", "târgoviște", "câmpulung", "brâncovenesc"]
        }
        
        entity_lower = entity_name.lower()
        for region, keywords in region_associations.items():
            if any(keyword in entity_lower for keyword in keywords):
                return region
        
        return None
    
    def _determine_historical_period(self, entity_name: str) -> Optional[str]:
        """Determine the historical period of an entity."""
        # Simplified historical period detection
        if any(name in entity_name.lower() for name in ["mihai viteazul", "ștefan cel mare"]):
            return "Medieval"
        elif any(name in entity_name.lower() for name in ["eminescu", "creangă", "enescu"]):
            return "Modern (19th-20th century)"
        elif any(name in entity_name.lower() for name in ["brâncuși", "eliade"]):
            return "Contemporary (20th century)"
        
        return None
    
    def _calculate_modern_relevance(self, entity_name: str) -> float:
        """Calculate modern relevance score for an entity."""
        # This would be enhanced with current usage analytics
        modern_entities = [
            "mici", "sarmale", "cozonac", "mămăligă", "ia românească",
            "hora", "colinde", "mărțișor", "dragobete"
        ]
        
        if entity_name.lower() in [e.lower() for e in modern_entities]:
            return 0.9
        else:
            return 0.6  # Default relevance
    
    def _find_regional_variations(self, entity_name: str) -> List[str]:
        """Find regional variations of an entity."""
        # This would be enhanced with a comprehensive database
        variations = {
            "colinde": ["colinde ardelenești", "colinde moldovenești", "colinde oltenești"],
            "hora": ["hora moldovenească", "hora ardeleană", "hora bănățeană"],
            "mămăligă": ["mălai", "pulenta", "mămăliguță"]
        }
        
        return variations.get(entity_name.lower(), [])
    
    def _find_related_entities(self, entity_name: str) -> List[str]:
        """Find entities related to the given entity."""
        # This would be enhanced with a knowledge graph
        relations = {
            "mihai eminescu": ["luceafărul", "literatura română", "romantism"],
            "george enescu": ["rapsodia română", "muzica clasică", "compoziție"],
            "constantin brâncuși": ["sculptura modernă", "coloana infinitului", "arta românească"]
        }
        
        return relations.get(entity_name.lower(), [])
    
    async def _store_cultural_analysis(self, analysis: CulturalAnalysisResult):
        """Store cultural analysis result in CBD for learning and improvement."""
        analysis_data = {
            "text_sample": analysis.text[:200] + "..." if len(analysis.text) > 200 else analysis.text,
            "entities_count": len(analysis.cultural_entities_detected),
            "entity_categories": list(set(e.category for e in analysis.cultural_entities_detected)),
            "regional_context": analysis.regional_context.region_name if analysis.regional_context else None,
            "cultural_complexity": analysis.cultural_complexity_score,
            "sensitivity_score": analysis.sensitivity_score,
            "confidence_level": analysis.confidence_level,
            "recommendations_count": len(analysis.recommendations),
            "analysis_timestamp": datetime.now().isoformat(),
            "analysis_id": f"cultural_analysis_{self.analysis_count}"
        }
        
        try:
            async with self.session.post(
                f"{self.cbd_url}/document",
                json={
                    "collection": "cultural_analyses",
                    "document": analysis_data
                }
            ) as response:
                if response.status == 200:
                    logger.debug(f"✅ Cultural analysis {self.analysis_count} stored")
        except Exception as e:
            logger.error(f"❌ Error storing cultural analysis: {str(e)}")
    
    async def get_cultural_intelligence_metrics(self) -> Dict[str, Any]:
        """Get comprehensive metrics about cultural intelligence performance."""
        total_entities = sum(len(data["entities"]) for data in self.cultural_categories.values())
        
        metrics = {
            "engine_status": "operational",
            "total_cultural_entities": total_entities,
            "cultural_categories": len(self.cultural_categories),
            "regional_contexts": len(self.regional_contexts),
            "sensitivity_patterns": len(self.sensitivity_patterns),
            "analyses_performed": self.analysis_count,
            "average_confidence": sum(self.accuracy_scores) / len(self.accuracy_scores) if self.accuracy_scores else 0,
            "coverage_statistics": {
                category: len(data["entities"]) 
                for category, data in self.cultural_categories.items()
            },
            "regional_distribution": {
                region: data.cultural_sensitivity_level 
                for region, data in self.regional_contexts.items()
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return metrics
    
    async def cleanup(self):
        """Cleanup resources."""
        if self.session:
            await self.session.close()

# Example usage and testing
async def test_cultural_intelligence():
    """Test the Romanian Cultural Intelligence Engine."""
    engine = RomanianCulturalIntelligence()
    
    try:
        await engine.initialize()
        
        # Test texts with various cultural content
        test_texts = [
            "Mihai Eminescu a scris Luceafărul, o capodoperă a literaturii românești din Transilvania.",
            "Sarmale și mămăliga sunt preparate tradiționale românești foarte populare la sărbători.",
            "Biserica de lemn din Maramureș reprezintă un patrimoniu UNESCO unic în lume.",
            "Colindele de Crăciun din Moldova păstrează tradiții vechi de secole.",
            "Hora se dansează în toate regiunile României cu variații specifice fiecărei zone."
        ]
        
        results = []
        for i, text in enumerate(test_texts):
            logger.info(f"🧠 Analyzing text {i+1}: {text[:50]}...")
            
            analysis = await engine.analyze_cultural_content(text)
            results.append(analysis)
            
            logger.info(f"   Entities detected: {len(analysis.cultural_entities_detected)}")
            logger.info(f"   Cultural complexity: {analysis.cultural_complexity_score:.2f}")
            logger.info(f"   Sensitivity score: {analysis.sensitivity_score:.2f}")
            logger.info(f"   Confidence level: {analysis.confidence_level:.2f}")
            
            if analysis.regional_context:
                logger.info(f"   Regional context: {analysis.regional_context.region_name}")
            
            logger.info(f"   Recommendations: {len(analysis.recommendations)}")
        
        # Get final metrics
        metrics = await engine.get_cultural_intelligence_metrics()
        
        logger.info("🧠 Cultural Intelligence Metrics:")
        logger.info(f"Total Cultural Entities: {metrics['total_cultural_entities']}")
        logger.info(f"Analyses Performed: {metrics['analyses_performed']}")
        logger.info(f"Average Confidence: {metrics['average_confidence']:.2f}")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        return None
    finally:
        await engine.cleanup()

if __name__ == "__main__":
    print("🧠 RomAI AGI - Romanian Cultural Intelligence Engine v3.0.0")
    print("=" * 60)
    asyncio.run(test_cultural_intelligence())

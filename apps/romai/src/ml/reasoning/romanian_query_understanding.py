"""
Romanian Query Understanding Module

This module provides Romanian cultural intelligence and query understanding capabilities
for the RomAI AGI system, enabling culturally-aware responses and Romanian language processing.
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class RomanianQueryResult:
    """Result from Romanian query processing"""
    original_query: str
    understood_intent: str
    cultural_context: str
    response: str
    confidence: float
    cultural_elements: List[str]
    
class RomanianQueryUnderstanding:
    """
    Romanian Cultural Intelligence and Query Understanding Engine
    
    Provides culturally-aware analysis and responses for Romanian-related queries,
    integrating cultural knowledge and linguistic understanding.
    """
    
    def __init__(self):
        """Initialize Romanian query understanding engine"""
        self.cultural_knowledge = self._load_cultural_knowledge()
        self.query_patterns = self._load_query_patterns()
        logger.info("🇷🇴 Romanian Query Understanding engine initialized")
    
    def _load_cultural_knowledge(self) -> Dict[str, Any]:
        """Load Romanian cultural knowledge base"""
        return {
            "traditions": {
                "martisor": {
                    "description": "Traditional Romanian spring celebration on March 1st",
                    "significance": "Symbol of spring, renewal, and good luck",
                    "customs": "Giving white and red string tokens to women and children"
                },
                "dragobete": {
                    "description": "Romanian traditional day of love, February 24th",
                    "significance": "Celebration of love and spring's arrival",
                    "customs": "Similar to Valentine's Day but with Romanian traditions"
                },
                "ioana": {
                    "description": "Traditional Romanian midsummer celebration",
                    "significance": "Celebration of herbs and magical plants",
                    "customs": "Gathering herbs, making wreaths, fire rituals"
                }
            },
            "cuisine": {
                "mici": "Traditional Romanian grilled meat rolls, national dish",
                "sarmale": "Cabbage rolls stuffed with rice and meat",
                "papanasi": "Traditional Romanian sweet doughnuts with cream",
                "tuica": "Traditional Romanian plum brandy",
                "cozonac": "Traditional Romanian sweet bread for holidays"
            },
            "geography": {
                "carpathians": "Mountain range running through Romania",
                "danube": "Major river forming southern border",
                "transylvania": "Historical region in central Romania",
                "moldavia": "Historical region in eastern Romania",
                "wallachia": "Historical region in southern Romania"
            },
            "history": {
                "dacia": "Ancient kingdom that preceded Romania",
                "vlad_tepes": "Historical ruler, inspiration for Dracula",
                "stefan_cel_mare": "Great ruler of Moldavia",
                "mihai_viteazul": "First ruler to unite Romanian principalities"
            },
            "language": {
                "origin": "Romance language derived from Latin",
                "speakers": "Approximately 24 million native speakers",
                "dialects": "Moldovan, Transylvanian, Wallachian variants",
                "characteristics": "Latin roots with Slavic, Greek, Turkish influences"
            }
        }
    
    def _load_query_patterns(self) -> Dict[str, List[str]]:
        """Load Romanian query recognition patterns"""
        return {
            "cultural_tradition": [
                "martisor", "dragobete", "traditional", "romanian culture",
                "customs", "traditions", "celebration", "festival"
            ],
            "food_cuisine": [
                "romanian food", "cuisine", "mici", "sarmale", "papanasi",
                "traditional dish", "cooking", "recipe"
            ],
            "geography": [
                "romania geography", "carpathians", "danube", "transylvania",
                "cities", "regions", "mountains", "rivers"
            ],
            "history": [
                "romanian history", "dacia", "vlad tepes", "dracula",
                "medieval", "rulers", "historical"
            ],
            "language": [
                "romanian language", "limba romana", "pronunciation",
                "grammar", "vocabulary", "latin origin"
            ]
        }
    
    async def process_query(self, query: str) -> RomanianQueryResult:
        """
        Process a Romanian-related query and provide culturally-aware response
        
        Args:
            query: The query to process
            
        Returns:
            RomanianQueryResult with cultural analysis and response
        """
        try:
            # Analyze query intent
            intent = await self._analyze_query_intent(query)
            
            # Extract cultural context
            cultural_context = await self._extract_cultural_context(query, intent)
            
            # Generate culturally-aware response
            response = await self._generate_cultural_response(query, intent, cultural_context)
            
            # Identify cultural elements
            cultural_elements = await self._identify_cultural_elements(query)
            
            # Calculate confidence
            confidence = self._calculate_confidence(query, intent, cultural_elements)
            
            return RomanianQueryResult(
                original_query=query,
                understood_intent=intent,
                cultural_context=cultural_context,
                response=response,
                confidence=confidence,
                cultural_elements=cultural_elements
            )
            
        except Exception as e:
            logger.error(f"Error processing Romanian query: {e}")
            return RomanianQueryResult(
                original_query=query,
                understood_intent="unknown",
                cultural_context="Unable to determine cultural context",
                response=f"I apologize, but I encountered an error processing your Romanian query: {str(e)}",
                confidence=0.0,
                cultural_elements=[]
            )
    
    async def _analyze_query_intent(self, query: str) -> str:
        """Analyze the intent of the Romanian query"""
        query_lower = query.lower()
        
        # Check for cultural tradition queries
        for pattern in self.query_patterns["cultural_tradition"]:
            if pattern in query_lower:
                return "cultural_tradition"
        
        # Check for food/cuisine queries
        for pattern in self.query_patterns["food_cuisine"]:
            if pattern in query_lower:
                return "food_cuisine"
        
        # Check for geography queries
        for pattern in self.query_patterns["geography"]:
            if pattern in query_lower:
                return "geography"
        
        # Check for history queries
        for pattern in self.query_patterns["history"]:
            if pattern in query_lower:
                return "history"
        
        # Check for language queries
        for pattern in self.query_patterns["language"]:
            if pattern in query_lower:
                return "language"
        
        # Default to general Romanian query
        if "romanian" in query_lower or "romania" in query_lower:
            return "general_romanian"
        
        return "unknown"
    
    async def _extract_cultural_context(self, query: str, intent: str) -> str:
        """Extract cultural context based on query and intent"""
        query_lower = query.lower()
        
        if intent == "cultural_tradition":
            if "martisor" in query_lower:
                martisor = self.cultural_knowledge["traditions"]["martisor"]
                return f"Martisor: {martisor['description']}. {martisor['significance']}."
            elif "dragobete" in query_lower:
                dragobete = self.cultural_knowledge["traditions"]["dragobete"]
                return f"Dragobete: {dragobete['description']}. {dragobete['significance']}."
            else:
                return "Romanian cultural traditions are rich and varied, celebrating seasons, love, and community."
        
        elif intent == "food_cuisine":
            if "mici" in query_lower:
                return f"Mici: {self.cultural_knowledge['cuisine']['mici']}"
            elif "sarmale" in query_lower:
                return f"Sarmale: {self.cultural_knowledge['cuisine']['sarmale']}"
            else:
                return "Romanian cuisine combines Balkan, Hungarian, and Turkish influences with local traditions."
        
        elif intent == "geography":
            return "Romania is located in southeastern Europe, featuring the Carpathian Mountains and Danube River."
        
        elif intent == "history":
            return "Romanian history spans from the ancient Dacian kingdom through medieval principalities to modern Romania."
        
        elif intent == "language":
            lang_info = self.cultural_knowledge["language"]
            return f"Romanian language: {lang_info['origin']}, spoken by {lang_info['speakers']}."
        
        else:
            return "Romania is a country rich in culture, history, and traditions located in southeastern Europe."
    
    async def _generate_cultural_response(self, query: str, intent: str, context: str) -> str:
        """Generate a culturally-aware response"""
        if intent == "cultural_tradition":
            return f"Regarding Romanian cultural traditions: {context} These traditions reflect Romania's deep connection to seasonal cycles and community values."
        
        elif intent == "food_cuisine":
            return f"About Romanian cuisine: {context} Romanian food emphasizes hearty, flavorful dishes that bring families together."
        
        elif intent == "geography":
            return f"Romanian geography: {context} The diverse landscape has shaped Romanian culture and history for millennia."
        
        elif intent == "history":
            return f"Romanian history: {context} This rich historical heritage continues to influence modern Romanian identity."
        
        elif intent == "language":
            return f"The Romanian language: {context} It represents the easternmost Romance language and carries centuries of cultural evolution."
        
        else:
            return f"About Romania: {context} Romania offers a unique blend of Latin heritage, Balkan influences, and distinctive cultural identity."
    
    async def _identify_cultural_elements(self, query: str) -> List[str]:
        """Identify specific cultural elements mentioned in the query"""
        query_lower = query.lower()
        elements = []
        
        # Check all cultural knowledge categories
        for category, items in self.cultural_knowledge.items():
            if isinstance(items, dict):
                for key, value in items.items():
                    if key in query_lower:
                        elements.append(f"{category}:{key}")
                    elif isinstance(value, dict) and any(subkey in query_lower for subkey in value.keys()):
                        elements.append(f"{category}:{key}")
        
        # Add general Romanian references
        if "romanian" in query_lower or "romania" in query_lower:
            elements.append("country:romania")
        
        return elements
    
    def _calculate_confidence(self, query: str, intent: str, cultural_elements: List[str]) -> float:
        """Calculate confidence in the Romanian query understanding"""
        base_confidence = 0.5
        
        # Increase confidence based on intent recognition
        if intent != "unknown":
            base_confidence += 0.2
        
        # Increase confidence based on cultural elements identified
        element_bonus = min(len(cultural_elements) * 0.1, 0.3)
        base_confidence += element_bonus
        
        # Bonus for specific Romanian terms
        query_lower = query.lower()
        romanian_terms = ["martisor", "sarmale", "mici", "transylvania", "carpathians", "romania", "romanian"]
        for term in romanian_terms:
            if term in query_lower:
                base_confidence += 0.05
                break
        
        return min(base_confidence, 1.0)
    
    def get_cultural_knowledge_summary(self) -> Dict[str, int]:
        """Get summary of available cultural knowledge"""
        summary = {}
        for category, items in self.cultural_knowledge.items():
            if isinstance(items, dict):
                summary[category] = len(items)
            else:
                summary[category] = 1
        
        return summary
    
    async def explain_cultural_concept(self, concept: str) -> str:
        """Provide detailed explanation of a Romanian cultural concept"""
        concept_lower = concept.lower()
        
        # Search through cultural knowledge
        for category, items in self.cultural_knowledge.items():
            if isinstance(items, dict):
                for key, value in items.items():
                    if key == concept_lower or concept_lower in key:
                        if isinstance(value, dict):
                            explanation = f"{value.get('description', 'Romanian cultural element')}"
                            if 'significance' in value:
                                explanation += f" Significance: {value['significance']}"
                            if 'customs' in value:
                                explanation += f" Traditional customs: {value['customs']}"
                            return explanation
                        else:
                            return str(value)
        
        return f"I don't have specific information about '{concept}' in my Romanian cultural knowledge base. Could you provide more context?"
    
    async def suggest_related_topics(self, query: str) -> List[str]:
        """Suggest related Romanian cultural topics"""
        intent = await self._analyze_query_intent(query)
        suggestions = []
        
        if intent == "cultural_tradition":
            suggestions = ["Martisor celebration", "Dragobete - Romanian love day", "Traditional folk customs"]
        elif intent == "food_cuisine":
            suggestions = ["Traditional Romanian dishes", "Regional cooking styles", "Holiday foods"]
        elif intent == "geography":
            suggestions = ["Carpathian Mountains", "Danube Delta", "Regional differences"]
        elif intent == "history":
            suggestions = ["Medieval Romanian rulers", "Dacian heritage", "Formation of modern Romania"]
        elif intent == "language":
            suggestions = ["Romanian pronunciation", "Latin origins", "Regional dialects"]
        else:
            suggestions = ["Romanian traditions", "Cultural celebrations", "Traditional cuisine", "Historical heritage"]
        
        return suggestions

# Initialize module logger
logging.getLogger(__name__).info("🇷🇴 Romanian Query Understanding module loaded")
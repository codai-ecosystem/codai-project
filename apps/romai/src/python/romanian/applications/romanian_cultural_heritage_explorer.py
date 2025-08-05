"""
Romanian Cultural Heritage Explorer - Immersive Cultural Discovery
===============================================================

An advanced cultural exploration application that provides immersive experiences
of Romanian cultural heritage sites, traditions, and historical artifacts using
multimodal AI analysis and cultural context integration.

Features:
- Virtual cultural site exploration
- Historical artifact analysis
- Traditional craft recognition
- Regional culture comparison
- Interactive cultural timeline
- Augmented reality cultural overlays
- Cultural preservation recommendations

Author: RomAI Development Team
Date: 2025-08-03
Version: 1.0.0
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum, auto
import json
import math
from pathlib import Path

# Import from our multimodal integration system
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_4_multimodal_integration'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_3_visual_processing'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_2_audio_processing'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'week_8_day_1_foundation'))

from romanian_multimodal_engine import RomanianMultimodalEngine, MultimodalInput
from integration_pipeline import RomanianMultimodalIntegrationPipeline, IntegrationConfig
from cultural_context_integration import (
    RomanianCulturalContextIntegrator, CulturalContext, CulturalMarker, CulturalDimension
)

class ExplorationMode(Enum):
    """Modes of cultural exploration"""
    VIRTUAL_TOUR = auto()
    ARTIFACT_ANALYSIS = auto()
    HISTORICAL_TIMELINE = auto()
    REGIONAL_COMPARISON = auto()
    CRAFT_RECOGNITION = auto()
    AUDIO_HERITAGE = auto()
    AUGMENTED_REALITY = auto()
    PRESERVATION_ASSESSMENT = auto()

class CulturalSiteType(Enum):
    """Types of cultural sites"""
    CASTLE = auto()
    CHURCH = auto()
    MONASTERY = auto()
    MUSEUM = auto()
    ARCHAEOLOGICAL_SITE = auto()
    TRADITIONAL_VILLAGE = auto()
    NATURAL_HERITAGE = auto()
    URBAN_HERITAGE = auto()
    FOLK_FESTIVAL = auto()
    CRAFT_WORKSHOP = auto()

class PreservationStatus(Enum):
    """Cultural preservation status levels"""
    EXCELLENT = auto()
    GOOD = auto()
    FAIR = auto()
    AT_RISK = auto()
    CRITICAL = auto()
    LOST = auto()

@dataclass
class CulturalSite:
    """Represents a Romanian cultural heritage site"""
    site_id: str
    name: str
    site_type: CulturalSiteType
    location: Dict[str, float]  # lat, lng
    region: str
    historical_period: str
    description: str
    cultural_significance: float = 0.0
    preservation_status: PreservationStatus = PreservationStatus.GOOD
    visitor_capacity: int = 50
    accessibility_features: List[str] = field(default_factory=list)
    available_languages: List[str] = field(default_factory=lambda: ["ro", "en"])
    multimedia_content: Dict[str, List[str]] = field(default_factory=dict)
    cultural_markers: List[CulturalMarker] = field(default_factory=list)
    related_traditions: List[str] = field(default_factory=list)
    conservation_needs: List[str] = field(default_factory=list)

@dataclass
class CulturalArtifact:
    """Represents a cultural artifact"""
    artifact_id: str
    name: str
    category: str
    origin_period: str
    origin_region: str
    materials: List[str]
    techniques: List[str]
    cultural_context: str
    current_location: str
    condition: PreservationStatus
    cultural_value: float = 0.0
    authenticity_score: float = 0.0
    related_artifacts: List[str] = field(default_factory=list)
    folklore_connections: List[str] = field(default_factory=list)

@dataclass
class ExplorationSession:
    """Represents a cultural exploration session"""
    session_id: str
    user_id: str
    exploration_mode: ExplorationMode
    visited_sites: List[str] = field(default_factory=list)
    analyzed_artifacts: List[str] = field(default_factory=list)
    cultural_discoveries: List[Dict] = field(default_factory=list)
    regional_insights: Dict[str, float] = field(default_factory=dict)
    historical_connections: List[Dict] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.now)
    current_focus: Optional[str] = None
    learning_preferences: Dict[str, Any] = field(default_factory=dict)

@dataclass
class VirtualTourPoint:
    """Represents a point in a virtual cultural tour"""
    point_id: str
    site_id: str
    name: str
    coordinates: Dict[str, float]
    description: str
    audio_narrative: Optional[str] = None
    visual_content: List[str] = field(default_factory=list)
    interactive_elements: List[Dict] = field(default_factory=list)
    cultural_insights: List[str] = field(default_factory=list)
    duration_minutes: int = 5
    accessibility_info: str = ""

class RomanianCulturalHeritageExplorer:
    """
    Advanced cultural heritage exploration system using Romanian multimodal AI
    for immersive cultural discovery and preservation
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the cultural heritage explorer"""
        self.logger = logging.getLogger(__name__)
        
        # Initialize multimodal components
        self.multimodal_engine = RomanianMultimodalEngine()
        self.integration_pipeline = RomanianMultimodalIntegrationPipeline()
        self.cultural_integrator = RomanianCulturalContextIntegrator()
        
        # Cultural heritage state
        self.active_sessions: Dict[str, ExplorationSession] = {}
        self.cultural_sites: Dict[str, CulturalSite] = {}
        self.artifacts_collection: Dict[str, CulturalArtifact] = {}
        self.virtual_tours: Dict[str, List[VirtualTourPoint]] = {}
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize cultural database
        asyncio.create_task(self._initialize_cultural_database())
        
    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load configuration for the cultural explorer"""
        default_config = {
            "supported_languages": ["ro", "en", "hu", "de"],
            "max_tour_duration": 180,  # minutes
            "ar_enabled": True,
            "high_resolution_media": True,
            "preservation_alerts": True,
            "cultural_sensitivity": 0.9,
            "authenticity_threshold": 0.7,
            "virtual_tour_quality": "high",
            "accessibility_features": True
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                self.logger.warning(f"Could not load config from {config_path}: {e}")
        
        return default_config
    
    async def _initialize_cultural_database(self):
        """Initialize the Romanian cultural heritage database"""
        try:
            # Initialize cultural sites
            sample_sites = [
                {
                    "site_id": "bran_castle",
                    "name": "Castelul Bran",
                    "site_type": CulturalSiteType.CASTLE,
                    "location": {"lat": 45.5149, "lng": 25.3677},
                    "region": "Brașov",
                    "historical_period": "Medieval",
                    "description": """
                    Castelul Bran, cunoscut și ca "Castelul lui Dracula", este o fortăreață medievală 
                    situată pe granița dintre Transilvania și Țara Românească. Construit în secolul XIV, 
                    castelul servea ca punct de control vamal și fortificație de apărare.
                    
                    Arhitectura gotică și poziția strategică pe Dealul Cetății fac din Bran un exemplu 
                    remarcabil de fortificație românească medievală.
                    """,
                    "cultural_significance": 0.95,
                    "preservation_status": PreservationStatus.EXCELLENT,
                    "visitor_capacity": 200,
                    "accessibility_features": ["audio_guide", "wheelchair_access", "visual_aids"],
                    "available_languages": ["ro", "en", "de", "fr", "it"],
                    "related_traditions": ["folklore_vampiric", "arhitectura_medievala", "povesti_populare"],
                    "conservation_needs": ["maintenance_regular", "climate_control", "visitor_management"]
                },
                {
                    "site_id": "corvin_castle",
                    "name": "Castelul Corvinilor",
                    "site_type": CulturalSiteType.CASTLE,
                    "location": {"lat": 45.7494, "lng": 22.8569},
                    "region": "Hunedoara",
                    "historical_period": "Renaissance",
                    "description": """
                    Castelul Corvinilor din Hunedoara este unul dintre cele mai spectaculoase castele 
                    din România, construit în stil gotic și renascentist. Reședința familiei Hunyadi, 
                    castelul exemplifică arhitectura nobiliară din secolele XIV-XVII.
                    
                    Elementele architecturale includ turnuri înalte, curți interioare, și detalii 
                    sculpturale elaborate care reflectă influențele culturale multiple din Transilvania.
                    """,
                    "cultural_significance": 0.92,
                    "preservation_status": PreservationStatus.GOOD,
                    "visitor_capacity": 150,
                    "accessibility_features": ["guided_tours", "multimedia_exhibits", "educational_programs"],
                    "available_languages": ["ro", "en", "hu", "de"],
                    "related_traditions": ["arhitectura_renascentista", "cultura_nobiliara", "traditii_cavaleresti"],
                    "conservation_needs": ["structural_reinforcement", "artifact_preservation", "environmental_protection"]
                },
                {
                    "site_id": "maramures_villages",
                    "name": "Satele Tradiționale din Maramureș",
                    "site_type": CulturalSiteType.TRADITIONAL_VILLAGE,
                    "location": {"lat": 47.7750, "lng": 24.1506},
                    "region": "Maramureș",
                    "historical_period": "Traditional",
                    "description": """
                    Satele din Maramureș păstrează arhitectura tradițională românească cu case de lemn, 
                    porți monumentale și biserici de lemn UNESCO. Aceste sate reprezintă continuitatea 
                    civilizației rurale românești și a meșteșugurilor tradiționale.
                    
                    Portul popular, obiceiurile și tradițiile orale continuă să fie practicate, 
                    făcând din Maramureș un muzeu viu al culturii românești.
                    """,
                    "cultural_significance": 0.98,
                    "preservation_status": PreservationStatus.FAIR,
                    "visitor_capacity": 50,
                    "accessibility_features": ["cultural_guides", "traditional_workshops", "accommodation"],
                    "available_languages": ["ro", "en"],
                    "related_traditions": ["arhitectura_lemn", "port_popular", "mestesuguri_traditionale", "obiceiuri_de_iarna"],
                    "conservation_needs": ["traditional_skills_training", "youth_engagement", "sustainable_tourism"]
                },
                {
                    "site_id": "bucovina_monasteries",
                    "name": "Mănăstirile Pictate din Bucovina",
                    "site_type": CulturalSiteType.MONASTERY,
                    "location": {"lat": 47.6500, "lng": 25.9167},
                    "region": "Suceava",
                    "historical_period": "Medieval",
                    "description": """
                    Mănăstirile pictate din Bucovina sunt capodopere ale artei bizantine și românești, 
                    cu fresce exterioare unice în Europa. Construite în secolele XV-XVI, aceste mănăstiri 
                    prezintă scene biblice, figuri de sfinți și motive decorative în culori vibrante.
                    
                    Voronet, Moldovița, Sucevița și Humor sunt incluse în patrimoniul UNESCO, 
                    reprezentând apogeul artei religioase românești.
                    """,
                    "cultural_significance": 0.99,
                    "preservation_status": PreservationStatus.GOOD,
                    "visitor_capacity": 100,
                    "accessibility_features": ["expert_guides", "conservation_tours", "educational_materials"],
                    "available_languages": ["ro", "en", "fr", "de"],
                    "related_traditions": ["arta_bizantina", "pictura_religiosa", "arhitectura_moldoveneasca", "traditii_monastice"],
                    "conservation_needs": ["fresco_preservation", "weather_protection", "visitor_education"]
                }
            ]
            
            for site_data in sample_sites:
                site = CulturalSite(**site_data)
                
                # Analyze cultural context
                cultural_analysis = await self.cultural_integrator.analyze_content(
                    site.description, "text"
                )
                site.cultural_markers = cultural_analysis.markers if hasattr(cultural_analysis, 'markers') else []
                
                self.cultural_sites[site.site_id] = site
            
            # Initialize sample artifacts
            sample_artifacts = [
                {
                    "artifact_id": "ie_traditionala",
                    "name": "Ie Tradițională Românească",
                    "category": "textile",
                    "origin_period": "Traditional",
                    "origin_region": "Oltenia",
                    "materials": ["in", "bumbac", "fire_colorate"],
                    "techniques": ["tesutul_manual", "broderia", "croiala_traditionala"],
                    "cultural_context": "Portul popular românesc feminin cu motive specifice regionale",
                    "current_location": "Muzeul Satului Bucuresti",
                    "condition": PreservationStatus.GOOD,
                    "cultural_value": 0.85,
                    "authenticity_score": 0.92,
                    "folklore_connections": ["obiceiuri_nunta", "sarbatori_traditionale", "identitate_regionala"]
                },
                {
                    "artifact_id": "ceramica_horezu",
                    "name": "Ceramică de Horezu",
                    "category": "ceramics",
                    "origin_period": "18th-19th century",
                    "origin_region": "Oltenia",
                    "materials": ["argila_locala", "glazuri_naturale", "pigmenti_minerali"],
                    "techniques": ["modelarea_manuala", "decorarea_traditionales", "arderea_controlata"],
                    "cultural_context": "Artă decorativă tradițională cu motive vegetale și geometrice",
                    "current_location": "Centrul de Ceramică Horezu",
                    "condition": PreservationStatus.EXCELLENT,
                    "cultural_value": 0.90,
                    "authenticity_score": 0.95,
                    "folklore_connections": ["mestesuguri_locale", "traditii_familiale", "comert_traditional"]
                }
            ]
            
            for artifact_data in sample_artifacts:
                artifact = CulturalArtifact(**artifact_data)
                self.artifacts_collection[artifact.artifact_id] = artifact
            
            # Initialize virtual tours
            await self._create_virtual_tours()
            
            self.logger.info(f"Initialized cultural database with {len(self.cultural_sites)} sites and {len(self.artifacts_collection)} artifacts")
            
        except Exception as e:
            self.logger.error(f"Error initializing cultural database: {e}")
    
    async def _create_virtual_tours(self):
        """Create virtual tours for major cultural sites"""
        try:
            # Create Bran Castle virtual tour
            bran_tour = [
                VirtualTourPoint(
                    point_id="bran_entrance",
                    site_id="bran_castle",
                    name="Intrarea Principală",
                    coordinates={"x": 0, "y": 0, "z": 0},
                    description="Intrarea în castel prin poarta fortificată cu turn de apărare",
                    cultural_insights=["arhitectura_defensiva", "simbolistica_medievala"],
                    duration_minutes=3
                ),
                VirtualTourPoint(
                    point_id="bran_courtyard",
                    site_id="bran_castle",
                    name="Curtea Interioară",
                    coordinates={"x": 10, "y": 0, "z": 5},
                    description="Curtea centrală cu vedere spre turnurile castelului și clădirile anexe",
                    cultural_insights=["viata_cotidiana_medievala", "organizarea_spatiului"],
                    duration_minutes=5
                ),
                VirtualTourPoint(
                    point_id="bran_throne_room",
                    site_id="bran_castle",
                    name="Sala Tronului",
                    coordinates={"x": 15, "y": 10, "z": 10},
                    description="Sala ceremonială cu mobilier de epocă și tapițerii originale",
                    cultural_insights=["ceremonial_nobiliar", "arta_decorativa_medievala"],
                    duration_minutes=7
                ),
                VirtualTourPoint(
                    point_id="bran_chapel",
                    site_id="bran_castle",
                    name="Capela Castelului",
                    coordinates={"x": 5, "y": 15, "z": 8},
                    description="Capela privată cu iconostas și picturi religioase byzantine",
                    cultural_insights=["arta_religiosa", "spiritualitate_nobiliara"],
                    duration_minutes=5
                )
            ]
            
            self.virtual_tours["bran_castle"] = bran_tour
            
            # Create Maramures villages tour
            maramures_tour = [
                VirtualTourPoint(
                    point_id="maramures_gate",
                    site_id="maramures_villages",
                    name="Poarta Tradițională Maramureșeană",
                    coordinates={"x": 0, "y": 0, "z": 0},
                    description="Poarta monumentală din lemn cu sculpturi tradiționale și simboluri de protecție",
                    cultural_insights=["simbolistica_populara", "mestesugul_lemnului"],
                    duration_minutes=4
                ),
                VirtualTourPoint(
                    point_id="maramures_house",
                    site_id="maramures_villages",
                    name="Casa Tradițională de Lemn",
                    coordinates={"x": 20, "y": 0, "z": 0},
                    description="Construcție tradițională cu acoperis înalt și pridvor decorat",
                    cultural_insights=["arhitectura_vernaculara", "adaptarea_la_climat"],
                    duration_minutes=6
                ),
                VirtualTourPoint(
                    point_id="maramures_church",
                    site_id="maramures_villages",
                    name="Biserica de Lemn UNESCO",
                    coordinates={"x": 30, "y": 10, "z": 0},
                    description="Biserica de lemn cu turn înalt și iconostas pictat manual",
                    cultural_insights=["arhitectura_religiosa_lemn", "arta_iconografica"],
                    duration_minutes=8
                )
            ]
            
            self.virtual_tours["maramures_villages"] = maramures_tour
            
        except Exception as e:
            self.logger.error(f"Error creating virtual tours: {e}")
    
    async def start_exploration_session(
        self, 
        user_id: str, 
        exploration_mode: ExplorationMode,
        preferences: Optional[Dict[str, Any]] = None
    ) -> ExplorationSession:
        """Start a new cultural exploration session"""
        try:
            session_id = f"{user_id}_{exploration_mode.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            session = ExplorationSession(
                session_id=session_id,
                user_id=user_id,
                exploration_mode=exploration_mode,
                learning_preferences=preferences or {}
            )
            
            self.active_sessions[session_id] = session
            
            self.logger.info(f"Started exploration session {session_id} for user {user_id}")
            return session
            
        except Exception as e:
            self.logger.error(f"Error starting exploration session: {e}")
            raise
    
    async def analyze_cultural_content(
        self, 
        session_id: str,
        content_type: str,
        content_data: Union[str, bytes],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze cultural content using multimodal AI"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            
            # Create multimodal input based on content type
            multimodal_input = None
            
            if content_type == "text":
                multimodal_input = MultimodalInput(
                    text_content=content_data,
                    metadata={
                        "session_id": session_id,
                        "content_type": content_type,
                        "timestamp": datetime.now().isoformat(),
                        **(metadata or {})
                    }
                )
            elif content_type == "image":
                multimodal_input = MultimodalInput(
                    visual_content=content_data,
                    metadata={
                        "session_id": session_id,
                        "content_type": content_type,
                        "timestamp": datetime.now().isoformat(),
                        **(metadata or {})
                    }
                )
            elif content_type == "audio":
                multimodal_input = MultimodalInput(
                    audio_content=content_data,
                    metadata={
                        "session_id": session_id,
                        "content_type": content_type,
                        "timestamp": datetime.now().isoformat(),
                        **(metadata or {})
                    }
                )
            
            if not multimodal_input:
                raise ValueError(f"Unsupported content type: {content_type}")
            
            # Process through integration pipeline
            config = IntegrationConfig(
                processing_mode="cultural_focus",
                cultural_sensitivity=self.config["cultural_sensitivity"],
                output_format="comprehensive"
            )
            
            result = await self.integration_pipeline.process_content(
                multimodal_input, config
            )
            
            # Analyze cultural heritage context
            heritage_analysis = await self._analyze_heritage_context(result, session)
            
            # Generate cultural insights
            cultural_insights = await self._generate_cultural_insights(
                heritage_analysis, session
            )
            
            # Update session with discoveries
            if heritage_analysis.get("new_cultural_elements"):
                session.cultural_discoveries.extend(heritage_analysis["new_cultural_elements"])
            
            return {
                "heritage_analysis": heritage_analysis,
                "cultural_insights": cultural_insights,
                "preservation_recommendations": await self._generate_preservation_recommendations(heritage_analysis),
                "related_sites": await self._find_related_sites(heritage_analysis),
                "educational_opportunities": await self._suggest_educational_content(heritage_analysis, session)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing cultural content: {e}")
            return {"error": str(e)}
    
    async def _analyze_heritage_context(
        self, 
        multimodal_result: Any, 
        session: ExplorationSession
    ) -> Dict[str, Any]:
        """Analyze the cultural heritage context"""
        try:
            analysis = {
                "heritage_type": "unknown",
                "historical_period": "unknown",
                "regional_characteristics": [],
                "cultural_significance": 0.0,
                "authenticity_indicators": [],
                "preservation_status": "unknown",
                "new_cultural_elements": [],
                "traditional_techniques": [],
                "symbolic_meanings": []
            }
            
            if hasattr(multimodal_result, 'cultural_context'):
                cultural_context = multimodal_result.cultural_context
                
                if cultural_context:
                    # Extract heritage information
                    analysis["cultural_significance"] = cultural_context.authenticity_score
                    analysis["regional_characteristics"] = getattr(cultural_context, 'regional_markers', [])
                    analysis["historical_period"] = getattr(cultural_context, 'historical_period', 'unknown')
                    
                    # Identify cultural markers
                    if hasattr(cultural_context, 'markers'):
                        for marker in cultural_context.markers:
                            if marker.category == "traditional_craft":
                                analysis["traditional_techniques"].append(marker.name)
                            elif marker.category == "symbolic":
                                analysis["symbolic_meanings"].append(marker.description)
                            elif marker.category == "architectural":
                                analysis["heritage_type"] = "architectural"
                            elif marker.category == "artistic":
                                analysis["heritage_type"] = "artistic"
                    
                    # Determine preservation needs
                    if cultural_context.authenticity_score > 0.8:
                        analysis["preservation_status"] = "excellent"
                    elif cultural_context.authenticity_score > 0.6:
                        analysis["preservation_status"] = "good"
                    elif cultural_context.authenticity_score > 0.4:
                        analysis["preservation_status"] = "fair"
                    else:
                        analysis["preservation_status"] = "at_risk"
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing heritage context: {e}")
            return {"error": str(e)}
    
    async def _generate_cultural_insights(
        self, 
        heritage_analysis: Dict[str, Any], 
        session: ExplorationSession
    ) -> List[Dict[str, Any]]:
        """Generate cultural insights based on heritage analysis"""
        try:
            insights = []
            
            significance = heritage_analysis.get("cultural_significance", 0.0)
            heritage_type = heritage_analysis.get("heritage_type", "unknown")
            regional_chars = heritage_analysis.get("regional_characteristics", [])
            
            # Historical context insights
            if heritage_analysis.get("historical_period") != "unknown":
                period = heritage_analysis["historical_period"]
                insights.append({
                    "type": "historical_context",
                    "title": f"Context Istoric: {period}",
                    "description": f"Acest element cultural aparține perioadei {period}, "
                                 f"caracterizată prin stiluri și influențe specifice epocii.",
                    "importance": "high",
                    "cultural_value": significance
                })
            
            # Regional characteristics insights
            if regional_chars:
                insights.append({
                    "type": "regional_identity",
                    "title": "Caracteristici Regionale",
                    "description": f"Elementele identificate reflectă tradițiile din {', '.join(regional_chars[:3])}, "
                                 f"cu particularități locale distinctive.",
                    "importance": "medium",
                    "regional_markers": regional_chars
                })
            
            # Preservation insights
            preservation_status = heritage_analysis.get("preservation_status", "unknown")
            if preservation_status in ["excellent", "good"]:
                insights.append({
                    "type": "preservation_success",
                    "title": "Conservare Reușită",
                    "description": f"Elementul cultural prezintă o stare de conservare {preservation_status}, "
                                 f"demonstrând eficiența eforturilor de preservare.",
                    "importance": "medium",
                    "preservation_score": significance
                })
            elif preservation_status in ["fair", "at_risk"]:
                insights.append({
                    "type": "preservation_concern",
                    "title": "Atenție la Conservare",
                    "description": f"Starea de conservare {preservation_status} necesită atenție "
                                 f"pentru prevenirea deteriorării ulterioare.",
                    "importance": "high",
                    "risk_level": preservation_status
                })
            
            # Traditional techniques insights
            techniques = heritage_analysis.get("traditional_techniques", [])
            if techniques:
                insights.append({
                    "type": "traditional_craftsmanship",
                    "title": "Meșteșuguri Tradiționale",
                    "description": f"Tehnicile identificate ({', '.join(techniques[:3])}) "
                                 f"reprezintă moștenirea meșteșugărească românească.",
                    "importance": "high",
                    "techniques": techniques
                })
            
            return insights
            
        except Exception as e:
            self.logger.error(f"Error generating cultural insights: {e}")
            return []
    
    async def _generate_preservation_recommendations(
        self, 
        heritage_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate preservation recommendations"""
        try:
            recommendations = []
            
            preservation_status = heritage_analysis.get("preservation_status", "unknown")
            heritage_type = heritage_analysis.get("heritage_type", "unknown")
            
            # General preservation recommendations
            if preservation_status in ["fair", "at_risk"]:
                recommendations.append({
                    "priority": "high",
                    "category": "urgent_conservation",
                    "title": "Conservare Urgentă",
                    "description": "Necesitate de intervenție imediată pentru stabilizarea stării actuale",
                    "actions": [
                        "Evaluare detaliată de specialiști",
                        "Plan de conservare pe termen scurt",
                        "Monitorizare continuă"
                    ],
                    "estimated_cost": "high",
                    "timeframe": "immediate"
                })
            
            # Heritage type specific recommendations
            if heritage_type == "architectural":
                recommendations.append({
                    "priority": "medium",
                    "category": "structural_maintenance",
                    "title": "Întreținere Structurală",
                    "description": "Menținerea integrității structurale prin intervenții periodice",
                    "actions": [
                        "Inspecții structurale regulate",
                        "Reparații preventive",
                        "Protecție împotriva factorilor climatici"
                    ],
                    "estimated_cost": "medium",
                    "timeframe": "annual"
                })
            
            elif heritage_type == "artistic":
                recommendations.append({
                    "priority": "high",
                    "category": "artistic_preservation",
                    "title": "Conservarea Artistică",
                    "description": "Protejarea valorilor artistice prin tehnici specializate",
                    "actions": [
                        "Restaurare specializată",
                        "Control al condițiilor ambientale",
                        "Digitizare pentru posteritate"
                    ],
                    "estimated_cost": "high",
                    "timeframe": "project_based"
                })
            
            # Digital preservation recommendation
            recommendations.append({
                "priority": "medium",
                "category": "digital_preservation",
                "title": "Preservare Digitală",
                "description": "Documentarea digitală pentru conservarea informației culturale",
                "actions": [
                    "Documentare fotografică de înaltă rezoluție",
                    "Modelare 3D pentru elemente complexe",
                    "Arhivare în baze de date culturale"
                ],
                "estimated_cost": "low",
                "timeframe": "short_term"
            })
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating preservation recommendations: {e}")
            return []
    
    async def _find_related_sites(self, heritage_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find related cultural sites based on analysis"""
        try:
            related_sites = []
            
            heritage_type = heritage_analysis.get("heritage_type", "unknown")
            regional_chars = heritage_analysis.get("regional_characteristics", [])
            historical_period = heritage_analysis.get("historical_period", "unknown")
            
            # Find sites with similar characteristics
            for site_id, site in self.cultural_sites.items():
                relevance_score = 0.0
                
                # Check heritage type similarity
                if heritage_type == "architectural" and site.site_type in [CulturalSiteType.CASTLE, CulturalSiteType.CHURCH]:
                    relevance_score += 0.4
                elif heritage_type == "artistic" and site.site_type in [CulturalSiteType.MUSEUM, CulturalSiteType.MONASTERY]:
                    relevance_score += 0.4
                
                # Check regional similarity
                for char in regional_chars:
                    if char.lower() in site.region.lower():
                        relevance_score += 0.3
                        break
                
                # Check historical period similarity
                if historical_period in site.historical_period:
                    relevance_score += 0.3
                
                if relevance_score > 0.5:
                    related_sites.append({
                        "site_id": site_id,
                        "name": site.name,
                        "region": site.region,
                        "relevance_score": relevance_score,
                        "visit_priority": "high" if relevance_score > 0.8 else "medium",
                        "cultural_significance": site.cultural_significance
                    })
            
            # Sort by relevance
            related_sites.sort(key=lambda x: x["relevance_score"], reverse=True)
            
            return related_sites[:5]  # Return top 5 related sites
            
        except Exception as e:
            self.logger.error(f"Error finding related sites: {e}")
            return []
    
    async def _suggest_educational_content(
        self, 
        heritage_analysis: Dict[str, Any], 
        session: ExplorationSession
    ) -> List[Dict[str, Any]]:
        """Suggest educational content based on analysis"""
        try:
            suggestions = []
            
            heritage_type = heritage_analysis.get("heritage_type", "unknown")
            techniques = heritage_analysis.get("traditional_techniques", [])
            
            # Suggest based on heritage type
            if heritage_type == "architectural":
                suggestions.append({
                    "type": "workshop",
                    "title": "Atelier: Arhitectura Tradițională Românească",
                    "description": "Învățați despre tehnicile de construcție tradiționale și simbolistica arhitecturală",
                    "duration": "3 hours",
                    "difficulty": "intermediate",
                    "materials_needed": ["notebook", "camera", "measuring_tools"]
                })
            
            if techniques:
                for technique in techniques[:2]:  # Limit to 2 techniques
                    suggestions.append({
                        "type": "hands_on_experience",
                        "title": f"Experiență Practică: {technique}",
                        "description": f"Învățați tehnica tradițională {technique} de la meșteri locali",
                        "duration": "2 hours",
                        "difficulty": "beginner",
                        "cultural_value": "high"
                    })
            
            # Always suggest cultural immersion
            suggestions.append({
                "type": "cultural_immersion",
                "title": "Imersiune Culturală Completă",
                "description": "Explorați contextul cultural mai larg prin povești, muzică și tradițiioni locale",
                "duration": "1 hour",
                "difficulty": "all_levels",
                "multimedia": True
            })
            
            return suggestions
            
        except Exception as e:
            self.logger.error(f"Error suggesting educational content: {e}")
            return []
    
    async def start_virtual_tour(self, session_id: str, site_id: str) -> Dict[str, Any]:
        """Start a virtual tour of a cultural site"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            if site_id not in self.virtual_tours:
                raise ValueError(f"Virtual tour not available for site {site_id}")
            
            session = self.active_sessions[session_id]
            session.current_focus = site_id
            session.visited_sites.append(site_id)
            
            tour_points = self.virtual_tours[site_id]
            site = self.cultural_sites.get(site_id)
            
            tour_info = {
                "tour_id": f"{session_id}_{site_id}_{datetime.now().strftime('%H%M%S')}",
                "site_info": {
                    "name": site.name if site else "Unknown Site",
                    "description": site.description if site else "",
                    "cultural_significance": site.cultural_significance if site else 0.0,
                    "region": site.region if site else "Unknown"
                },
                "tour_points": [
                    {
                        "point_id": point.point_id,
                        "name": point.name,
                        "description": point.description,
                        "cultural_insights": point.cultural_insights,
                        "duration_minutes": point.duration_minutes,
                        "coordinates": point.coordinates
                    }
                    for point in tour_points
                ],
                "total_duration": sum(point.duration_minutes for point in tour_points),
                "accessibility_features": site.accessibility_features if site else [],
                "available_languages": site.available_languages if site else ["ro", "en"]
            }
            
            return tour_info
            
        except Exception as e:
            self.logger.error(f"Error starting virtual tour: {e}")
            return {"error": str(e)}
    
    async def get_exploration_summary(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive exploration session summary"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            
            # Calculate exploration metrics
            unique_regions = set()
            total_cultural_value = 0.0
            
            for site_id in session.visited_sites:
                if site_id in self.cultural_sites:
                    site = self.cultural_sites[site_id]
                    unique_regions.add(site.region)
                    total_cultural_value += site.cultural_significance
            
            exploration_depth = len(session.visited_sites) + len(session.analyzed_artifacts)
            cultural_breadth = len(unique_regions)
            
            summary = {
                "session_info": {
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "exploration_mode": session.exploration_mode.name,
                    "start_time": session.start_time.isoformat(),
                    "duration": (datetime.now() - session.start_time).total_seconds(),
                },
                "exploration_metrics": {
                    "sites_visited": len(session.visited_sites),
                    "artifacts_analyzed": len(session.analyzed_artifacts),
                    "cultural_discoveries": len(session.cultural_discoveries),
                    "regions_explored": cultural_breadth,
                    "exploration_depth": exploration_depth,
                    "average_cultural_value": total_cultural_value / max(len(session.visited_sites), 1)
                },
                "cultural_insights": {
                    "discoveries": session.cultural_discoveries[-10:],  # Last 10 discoveries
                    "regional_coverage": list(unique_regions),
                    "historical_connections": session.historical_connections[-5:]  # Last 5 connections
                },
                "achievements": self._generate_exploration_achievements(session),
                "recommendations": await self._generate_next_exploration_steps(session)
            }
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error getting exploration summary: {e}")
            return {"error": str(e)}
    
    def _generate_exploration_achievements(self, session: ExplorationSession) -> List[Dict[str, Any]]:
        """Generate achievements based on exploration activity"""
        achievements = []
        
        try:
            sites_count = len(session.visited_sites)
            discoveries_count = len(session.cultural_discoveries)
            
            # Site Explorer Achievements
            if sites_count >= 5:
                achievements.append({
                    "title": "Explorator Cultural",
                    "description": f"Ați vizitat {sites_count} situri culturale",
                    "level": "gold" if sites_count >= 10 else "silver",
                    "icon": "🏛️"
                })
            
            # Cultural Detective Achievement
            if discoveries_count >= 10:
                achievements.append({
                    "title": "Detectiv Cultural",
                    "description": f"Ați făcut {discoveries_count} descoperiri culturale",
                    "level": "gold" if discoveries_count >= 20 else "silver", 
                    "icon": "🔍"
                })
            
            # Regional Explorer Achievement
            unique_regions = set()
            for site_id in session.visited_sites:
                if site_id in self.cultural_sites:
                    unique_regions.add(self.cultural_sites[site_id].region)
            
            if len(unique_regions) >= 3:
                achievements.append({
                    "title": "Călător Regional",
                    "description": f"Ați explorat {len(unique_regions)} regiuni distincte",
                    "level": "gold" if len(unique_regions) >= 5 else "silver",
                    "icon": "🗺️"
                })
            
        except Exception as e:
            self.logger.error(f"Error generating exploration achievements: {e}")
        
        return achievements
    
    async def _generate_next_exploration_steps(self, session: ExplorationSession) -> List[str]:
        """Generate recommendations for next exploration steps"""
        try:
            recommendations = []
            
            # Analyze what hasn't been explored yet
            unvisited_sites = set(self.cultural_sites.keys()) - set(session.visited_sites)
            
            if unvisited_sites:
                # Recommend high-significance sites
                high_significance_sites = [
                    self.cultural_sites[site_id] for site_id in unvisited_sites
                    if self.cultural_sites[site_id].cultural_significance > 0.8
                ]
                
                if high_significance_sites:
                    top_site = max(high_significance_sites, key=lambda x: x.cultural_significance)
                    recommendations.append(f"Explorați {top_site.name} - semnificație culturală excepțională")
            
            # Recommend based on exploration mode
            if session.exploration_mode == ExplorationMode.VIRTUAL_TOUR:
                recommendations.append("Încercați modul de analiză a artefactelor pentru o perspectivă diferită")
            elif session.exploration_mode == ExplorationMode.ARTIFACT_ANALYSIS:
                recommendations.append("Începeți un tur virtual pentru context spațial")
            
            # Recommend preservation activities
            recommendations.append("Participați la activități de conservare pentru a contribui la preservarea patrimoniului")
            
            return recommendations[:3]
            
        except Exception as e:
            self.logger.error(f"Error generating next exploration steps: {e}")
            return []

# Example usage and testing
async def main():
    """Example usage of the Romanian Cultural Heritage Explorer"""
    
    # Initialize the explorer
    explorer = RomanianCulturalHeritageExplorer()
    
    # Wait for initialization
    await asyncio.sleep(3)
    
    # Start exploration session
    session = await explorer.start_exploration_session(
        "cultural_enthusiast", 
        ExplorationMode.VIRTUAL_TOUR,
        {"preferred_language": "ro", "focus_areas": ["architecture", "traditional_crafts"]}
    )
    print(f"✅ Started exploration session: {session.session_id}")
    
    # Start virtual tour of Bran Castle
    print(f"\n🏰 Starting Virtual Tour: Bran Castle")
    tour_info = await explorer.start_virtual_tour(session.session_id, "bran_castle")
    
    if "error" not in tour_info:
        print(f"📍 Tour Points: {len(tour_info['tour_points'])}")
        print(f"⏰ Total Duration: {tour_info['total_duration']} minutes")
        print(f"🏛️ Cultural Significance: {tour_info['site_info']['cultural_significance']:.1%}")
        
        # Show tour points
        for point in tour_info['tour_points'][:2]:  # Show first 2 points
            print(f"  🎯 {point['name']}: {point['description'][:100]}...")
    
    # Analyze cultural content
    print(f"\n🔍 Analyzing Cultural Content...")
    
    cultural_texts = [
        "Castelul Bran prezintă arhitectură gotică cu elemente de fortificație medievală.",
        "Portul popular din Maramureș include ia tradițională cu broderii specifice regiunii.",
        "Ceramica de Horezu folosește tehnici tradiționale de glazurare și decorare cu motive vegetale."
    ]
    
    for i, text in enumerate(cultural_texts):
        print(f"\n📝 Analysis {i+1}: {text[:50]}...")
        
        result = await explorer.analyze_cultural_content(
            session.session_id,
            "text",
            text
        )
        
        if "error" not in result:
            heritage = result.get("heritage_analysis", {})
            insights = result.get("cultural_insights", [])
            
            print(f"  🎭 Heritage Type: {heritage.get('heritage_type', 'Unknown')}")
            print(f"  ⏳ Historical Period: {heritage.get('historical_period', 'Unknown')}")
            print(f"  ⭐ Cultural Significance: {heritage.get('cultural_significance', 0):.2f}")
            print(f"  💡 Insights: {len(insights)} generated")
            
            # Show first insight
            if insights:
                insight = insights[0]
                print(f"    • {insight.get('title', 'No title')}: {insight.get('description', 'No description')[:80]}...")
        else:
            print(f"  ❌ Error: {result['error']}")
    
    # Get exploration summary
    print(f"\n📊 Exploration Summary:")
    summary = await explorer.get_exploration_summary(session.session_id)
    
    if "error" not in summary:
        metrics = summary.get("exploration_metrics", {})
        achievements = summary.get("achievements", [])
        
        print(f"  🏛️ Sites Visited: {metrics.get('sites_visited', 0)}")
        print(f"  🔍 Artifacts Analyzed: {metrics.get('artifacts_analyzed', 0)}")
        print(f"  💎 Cultural Discoveries: {metrics.get('cultural_discoveries', 0)}")
        print(f"  🗺️ Regions Explored: {metrics.get('regions_explored', 0)}")
        print(f"  ⭐ Average Cultural Value: {metrics.get('average_cultural_value', 0):.2f}")
        
        print(f"\n🏆 Achievements Earned: {len(achievements)}")
        for achievement in achievements:
            print(f"  {achievement.get('icon', '🏅')} {achievement.get('title', 'Unknown')}: {achievement.get('description', 'No description')}")
    
    print(f"\n🎯 Romanian Cultural Heritage Explorer Demo Complete!")

if __name__ == "__main__":
    asyncio.run(main())

"""
Romanian Educational Assistant - Multimodal Learning Application
===============================================================

A comprehensive educational application leveraging the Romanian multimodal AI system
for interactive learning experiences combining text, audio, and visual content
with deep Romanian cultural context integration.

Features:
- Interactive Romanian language learning
- Cultural heritage education
- Historical timeline exploration
- Regional traditions discovery
- Multimodal content analysis and generation
- Adaptive learning based on cultural context

Author: RomAI Development Team
Date: 2025-08-03
Version: 1.0.0
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Union, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum, auto
import json
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
from cultural_context_integration import RomanianCulturalContextIntegrator, CulturalContext

class LearningLevel(Enum):
    """Learning levels for educational content"""
    BEGINNER = auto()
    INTERMEDIATE = auto()
    ADVANCED = auto()
    EXPERT = auto()
    NATIVE = auto()

class ContentType(Enum):
    """Types of educational content"""
    LANGUAGE_LESSON = auto()
    CULTURAL_HERITAGE = auto()
    HISTORICAL_TIMELINE = auto()
    REGIONAL_EXPLORATION = auto()
    TRADITIONAL_ARTS = auto()
    LITERATURE_ANALYSIS = auto()
    MUSIC_APPRECIATION = auto()
    FOLK_TRADITIONS = auto()

class InteractionMode(Enum):
    """Modes of user interaction"""
    GUIDED_TOUR = auto()
    INTERACTIVE_QUIZ = auto()
    IMMERSIVE_EXPLORATION = auto()
    COLLABORATIVE_LEARNING = auto()
    ASSESSMENT_MODE = auto()
    FREE_EXPLORATION = auto()

@dataclass
class LearningObjective:
    """Defines a specific learning objective"""
    objective_id: str
    title: str
    description: str
    content_type: ContentType
    level: LearningLevel
    cultural_focus: str
    regional_context: Optional[str] = None
    historical_period: Optional[str] = None
    skills_required: List[str] = field(default_factory=list)
    success_criteria: List[str] = field(default_factory=list)
    estimated_duration: int = 30  # minutes

@dataclass
class LearningSession:
    """Represents a learning session"""
    session_id: str
    user_id: str
    objectives: List[LearningObjective]
    current_objective: Optional[LearningObjective] = None
    progress: Dict[str, float] = field(default_factory=dict)
    interaction_history: List[Dict] = field(default_factory=list)
    cultural_discoveries: List[str] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.now)
    completion_status: Dict[str, bool] = field(default_factory=dict)

@dataclass
class EducationalContent:
    """Educational content with multimodal elements"""
    content_id: str
    title: str
    content_type: ContentType
    level: LearningLevel
    text_content: str
    audio_content: Optional[str] = None
    visual_content: Optional[str] = None
    cultural_context: Optional[CulturalContext] = None
    interactive_elements: List[Dict] = field(default_factory=list)
    assessment_questions: List[Dict] = field(default_factory=list)
    learning_outcomes: List[str] = field(default_factory=list)
    difficulty_score: float = 0.5
    cultural_authenticity: float = 0.0

class RomanianEducationalAssistant:
    """
    Main educational assistant class integrating Romanian multimodal AI
    for comprehensive learning experiences
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the educational assistant"""
        self.logger = logging.getLogger(__name__)
        
        # Initialize multimodal components
        self.multimodal_engine = RomanianMultimodalEngine()
        self.integration_pipeline = RomanianMultimodalIntegrationPipeline()
        self.cultural_integrator = RomanianCulturalContextIntegrator()
        
        # Educational state
        self.active_sessions: Dict[str, LearningSession] = {}
        self.content_library: Dict[str, EducationalContent] = {}
        self.user_profiles: Dict[str, Dict] = {}
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize content library
        asyncio.create_task(self._initialize_content_library())
        
    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load configuration for the educational assistant"""
        default_config = {
            "supported_languages": ["ro", "en"],
            "default_level": LearningLevel.BEGINNER,
            "session_timeout": 3600,  # 1 hour
            "max_concurrent_sessions": 100,
            "cultural_sensitivity": 0.8,
            "adaptation_speed": 0.5,
            "assessment_frequency": 5,  # every 5 interactions
            "content_cache_size": 1000
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                self.logger.warning(f"Could not load config from {config_path}: {e}")
        
        return default_config
    
    async def _initialize_content_library(self):
        """Initialize the educational content library"""
        try:
            # Create sample educational content
            sample_content = [
                {
                    "content_id": "romanian_greetings",
                    "title": "Salutări Românești - Romanian Greetings",
                    "content_type": ContentType.LANGUAGE_LESSON,
                    "level": LearningLevel.BEGINNER,
                    "text_content": """
                    Învățăm salutările românești:
                    
                    Formale:
                    - Bună ziua! (Good day!)
                    - Bună dimineața! (Good morning!)
                    - Bună seara! (Good evening!)
                    
                    Informale:
                    - Salut! (Hi!)
                    - Bună! (Hello!)
                    - Ce mai faci? (How are you?)
                    
                    Răspunsuri:
                    - Mulțumesc, bine! (Thank you, well!)
                    - Foarte bine! (Very well!)
                    - Nu mă pot plânge. (Can't complain.)
                    """,
                    "cultural_context": "Romanian greetings reflect the formal/informal social structure",
                    "learning_outcomes": [
                        "Recognize formal vs informal greetings",
                        "Use appropriate greetings in context",
                        "Understand cultural nuances"
                    ]
                },
                {
                    "content_id": "transylvanian_castles",
                    "title": "Castelele Transilvaniei - Transylvanian Castles",
                    "content_type": ContentType.CULTURAL_HERITAGE,
                    "level": LearningLevel.INTERMEDIATE,
                    "text_content": """
                    Castelele Transilvaniei reprezintă o bogată moștenire istorică:
                    
                    Castelul Bran:
                    - Cunoscut ca "Castelul lui Dracula"
                    - Construit în secolul XIV
                    - Arhitectură gotică
                    
                    Castelul Corvinilor:
                    - Unul dintre cele mai frumoase castele din Europa
                    - Stil renascentist
                    - Situat în Hunedoara
                    
                    Castelul Peleș:
                    - Reședința regală
                    - Arhitectură neorenaștere germană
                    - Primul castel electrificat din Europa
                    """,
                    "cultural_context": "Transylvanian castles showcase multicultural heritage",
                    "learning_outcomes": [
                        "Identify major Romanian castles",
                        "Understand architectural styles",
                        "Appreciate historical significance"
                    ]
                },
                {
                    "content_id": "romanian_folk_music",
                    "title": "Muzica Populară Românească - Romanian Folk Music",
                    "content_type": ContentType.MUSIC_APPRECIATION,
                    "level": LearningLevel.ADVANCED,
                    "text_content": """
                    Muzica populară românească reflectă sufletul poporului:
                    
                    Genuri principale:
                    - Doina: cântec melancoliс, liric
                    - Hora: dans popular în cerc
                    - Brâul: dans în lanț
                    - Căluș: dans ritual din Oltenia
                    
                    Instrumente tradiționale:
                    - Nai (pan flute)
                    - Cimpoi (bagpipes)
                    - Țambal (hammered dulcimer)
                    - Vioară (violin)
                    
                    Maeștri recunoscuți:
                    - Gheorghe Zamfir (nai)
                    - Maria Tănase (interpretă)
                    - Grigoraș Dinicu (vioară)
                    """,
                    "cultural_context": "Folk music preserves oral traditions and regional identity",
                    "learning_outcomes": [
                        "Distinguish folk music genres",
                        "Recognize traditional instruments",
                        "Understand cultural significance"
                    ]
                }
            ]
            
            for content_data in sample_content:
                content = EducationalContent(**content_data)
                
                # Analyze cultural context
                if content.text_content:
                    cultural_analysis = await self.cultural_integrator.analyze_content(
                        content.text_content, "text"
                    )
                    content.cultural_context = cultural_analysis
                    content.cultural_authenticity = cultural_analysis.authenticity_score
                
                self.content_library[content.content_id] = content
            
            self.logger.info(f"Initialized content library with {len(self.content_library)} items")
            
        except Exception as e:
            self.logger.error(f"Error initializing content library: {e}")
    
    async def start_learning_session(
        self, 
        user_id: str, 
        objectives: List[LearningObjective],
        session_id: Optional[str] = None
    ) -> LearningSession:
        """Start a new learning session"""
        try:
            if not session_id:
                session_id = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            session = LearningSession(
                session_id=session_id,
                user_id=user_id,
                objectives=objectives,
                current_objective=objectives[0] if objectives else None
            )
            
            self.active_sessions[session_id] = session
            
            self.logger.info(f"Started learning session {session_id} for user {user_id}")
            return session
            
        except Exception as e:
            self.logger.error(f"Error starting learning session: {e}")
            raise
    
    async def process_multimodal_input(
        self, 
        session_id: str, 
        text: Optional[str] = None,
        audio_path: Optional[str] = None,
        image_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process multimodal input from learner"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            
            # Create multimodal input
            multimodal_input = MultimodalInput(
                text_content=text,
                audio_content=audio_path,
                visual_content=image_path,
                metadata={
                    "session_id": session_id,
                    "user_id": session.user_id,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Process through integration pipeline
            config = IntegrationConfig(
                processing_mode="cultural_focus",
                cultural_sensitivity=self.config["cultural_sensitivity"],
                output_format="comprehensive"
            )
            
            result = await self.integration_pipeline.process_content(
                multimodal_input, config
            )
            
            # Analyze educational context
            educational_analysis = await self._analyze_educational_context(
                result, session
            )
            
            # Generate feedback and recommendations
            feedback = await self._generate_educational_feedback(
                educational_analysis, session
            )
            
            # Update session state
            session.interaction_history.append({
                "timestamp": datetime.now().isoformat(),
                "input": {
                    "text": text,
                    "audio": audio_path,
                    "image": image_path
                },
                "analysis": educational_analysis,
                "feedback": feedback
            })
            
            return {
                "analysis": educational_analysis,
                "feedback": feedback,
                "cultural_insights": result.cultural_context,
                "learning_progress": self._calculate_learning_progress(session),
                "recommendations": await self._generate_recommendations(session)
            }
            
        except Exception as e:
            self.logger.error(f"Error processing multimodal input: {e}")
            return {"error": str(e)}
    
    async def _analyze_educational_context(
        self, 
        multimodal_result: Any, 
        session: LearningSession
    ) -> Dict[str, Any]:
        """Analyze the educational context of the multimodal result"""
        try:
            analysis = {
                "content_type": "unknown",
                "difficulty_level": 0.5,
                "cultural_relevance": 0.0,
                "learning_objective_alignment": 0.0,
                "language_complexity": 0.5,
                "educational_value": 0.0
            }
            
            if hasattr(multimodal_result, 'cultural_context'):
                cultural_context = multimodal_result.cultural_context
                
                # Analyze cultural relevance
                if cultural_context:
                    analysis["cultural_relevance"] = cultural_context.authenticity_score
                    analysis["regional_context"] = getattr(cultural_context, 'region', None)
                    analysis["historical_period"] = getattr(cultural_context, 'historical_period', None)
            
            # Analyze alignment with current learning objective
            if session.current_objective:
                objective = session.current_objective
                
                # Check content type alignment
                if hasattr(multimodal_result, 'content_analysis'):
                    content_analysis = multimodal_result.content_analysis
                    analysis["content_type"] = self._detect_content_type(content_analysis)
                    
                    # Calculate alignment score
                    if analysis["content_type"] == objective.content_type.name.lower():
                        analysis["learning_objective_alignment"] = 0.9
                    else:
                        analysis["learning_objective_alignment"] = 0.3
                
                # Analyze language complexity for language lessons
                if objective.content_type == ContentType.LANGUAGE_LESSON:
                    analysis["language_complexity"] = await self._analyze_language_complexity(
                        multimodal_result
                    )
            
            # Calculate overall educational value
            analysis["educational_value"] = (
                analysis["cultural_relevance"] * 0.3 +
                analysis["learning_objective_alignment"] * 0.4 +
                analysis["language_complexity"] * 0.3
            )
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing educational context: {e}")
            return {"error": str(e)}
    
    async def _generate_educational_feedback(
        self, 
        analysis: Dict[str, Any], 
        session: LearningSession
    ) -> Dict[str, Any]:
        """Generate educational feedback based on analysis"""
        try:
            feedback = {
                "overall_score": 0.0,
                "strengths": [],
                "areas_for_improvement": [],
                "specific_suggestions": [],
                "cultural_insights": [],
                "next_steps": []
            }
            
            educational_value = analysis.get("educational_value", 0.0)
            cultural_relevance = analysis.get("cultural_relevance", 0.0)
            alignment = analysis.get("learning_objective_alignment", 0.0)
            
            feedback["overall_score"] = educational_value
            
            # Identify strengths
            if cultural_relevance > 0.7:
                feedback["strengths"].append("Excelentă integrare culturală românească")
                feedback["cultural_insights"].append(
                    f"Conținutul reflectă autenticitatea culturală: {cultural_relevance:.1%}"
                )
            
            if alignment > 0.8:
                feedback["strengths"].append("Perfect aliniat cu obiectivele de învățare")
            
            # Identify areas for improvement
            if cultural_relevance < 0.4:
                feedback["areas_for_improvement"].append(
                    "Contextul cultural românesc poate fi dezvoltat"
                )
                feedback["specific_suggestions"].append(
                    "Explorați tradițiile și valorile românești specifice regiunii"
                )
            
            if alignment < 0.5:
                feedback["areas_for_improvement"].append(
                    "Alinierea cu obiectivele de învățare necesită îmbunătățire"
                )
            
            # Generate next steps
            if session.current_objective:
                objective = session.current_objective
                
                if objective.content_type == ContentType.LANGUAGE_LESSON:
                    feedback["next_steps"].append("Practicați pronunția cu exemple audio")
                    feedback["next_steps"].append("Încercați să folosiți cuvintele în propoziții")
                
                elif objective.content_type == ContentType.CULTURAL_HERITAGE:
                    feedback["next_steps"].append("Explorați contextul istoric al subiectului")
                    feedback["next_steps"].append("Căutați legături cu tradiții actuale")
                
                elif objective.content_type == ContentType.REGIONAL_EXPLORATION:
                    feedback["next_steps"].append("Comparați cu alte regiuni românești")
                    feedback["next_steps"].append("Identificați caracteristicile unice regionale")
            
            return feedback
            
        except Exception as e:
            self.logger.error(f"Error generating educational feedback: {e}")
            return {"error": str(e)}
    
    def _detect_content_type(self, content_analysis: Any) -> str:
        """Detect the type of educational content"""
        # This would typically analyze the content to determine its type
        # For now, return a placeholder
        return "general"
    
    async def _analyze_language_complexity(self, multimodal_result: Any) -> float:
        """Analyze language complexity for language learning"""
        try:
            # Placeholder for language complexity analysis
            # This would analyze vocabulary, grammar, sentence structure, etc.
            return 0.5
            
        except Exception as e:
            self.logger.error(f"Error analyzing language complexity: {e}")
            return 0.5
    
    def _calculate_learning_progress(self, session: LearningSession) -> Dict[str, float]:
        """Calculate learning progress for the session"""
        try:
            progress = {
                "overall_progress": 0.0,
                "objective_progress": {},
                "skill_development": {},
                "cultural_knowledge": 0.0
            }
            
            # Calculate progress for each objective
            for objective in session.objectives:
                objective_id = objective.objective_id
                
                # Count successful interactions for this objective
                relevant_interactions = [
                    interaction for interaction in session.interaction_history
                    if interaction.get("analysis", {}).get("learning_objective_alignment", 0) > 0.6
                ]
                
                objective_progress = min(len(relevant_interactions) / 5.0, 1.0)  # 5 interactions = 100%
                progress["objective_progress"][objective_id] = objective_progress
            
            # Calculate overall progress
            if progress["objective_progress"]:
                progress["overall_progress"] = sum(progress["objective_progress"].values()) / len(progress["objective_progress"])
            
            # Calculate cultural knowledge progress
            cultural_scores = [
                interaction.get("analysis", {}).get("cultural_relevance", 0)
                for interaction in session.interaction_history
            ]
            
            if cultural_scores:
                progress["cultural_knowledge"] = sum(cultural_scores) / len(cultural_scores)
            
            return progress
            
        except Exception as e:
            self.logger.error(f"Error calculating learning progress: {e}")
            return {"overall_progress": 0.0}
    
    async def _generate_recommendations(self, session: LearningSession) -> List[Dict[str, Any]]:
        """Generate personalized learning recommendations"""
        try:
            recommendations = []
            
            progress = self._calculate_learning_progress(session)
            overall_progress = progress.get("overall_progress", 0.0)
            
            # Recommend based on progress
            if overall_progress < 0.3:
                recommendations.append({
                    "type": "foundation_building",
                    "title": "Consolidați fundamentele",
                    "description": "Concentrați-vă pe conceptele de bază înainte de a avansa",
                    "content_suggestions": ["romanian_greetings", "basic_vocabulary"],
                    "priority": "high"
                })
            
            elif overall_progress > 0.7:
                recommendations.append({
                    "type": "advanced_challenge",
                    "title": "Provocări avansate",
                    "description": "Sunteți gata pentru conținut mai complex",
                    "content_suggestions": ["romanian_literature", "historical_analysis"],
                    "priority": "medium"
                })
            
            # Recommend based on cultural knowledge
            cultural_knowledge = progress.get("cultural_knowledge", 0.0)
            
            if cultural_knowledge < 0.5:
                recommendations.append({
                    "type": "cultural_immersion",
                    "title": "Explorare culturală",
                    "description": "Aprofundați cunoștințele despre cultura românească",
                    "content_suggestions": ["transylvanian_castles", "romanian_folk_music"],
                    "priority": "medium"
                })
            
            # Recommend content from library
            available_content = [
                content for content in self.content_library.values()
                if content.content_id not in [
                    interaction.get("content_id") 
                    for interaction in session.interaction_history
                ]
            ]
            
            if available_content:
                # Sort by cultural authenticity and difficulty
                sorted_content = sorted(
                    available_content,
                    key=lambda x: x.cultural_authenticity,
                    reverse=True
                )[:3]
                
                for content in sorted_content:
                    recommendations.append({
                        "type": "content_recommendation",
                        "title": content.title,
                        "description": f"Conținut educațional: {content.content_type.name}",
                        "content_id": content.content_id,
                        "difficulty": content.difficulty_score,
                        "cultural_authenticity": content.cultural_authenticity,
                        "priority": "low"
                    })
            
            return recommendations[:5]  # Limit to top 5 recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return []
    
    async def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """Get a comprehensive summary of the learning session"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            progress = self._calculate_learning_progress(session)
            recommendations = await self._generate_recommendations(session)
            
            summary = {
                "session_info": {
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "start_time": session.start_time.isoformat(),
                    "duration": (datetime.now() - session.start_time).total_seconds(),
                    "interactions_count": len(session.interaction_history)
                },
                "learning_progress": progress,
                "objectives_status": {
                    obj.objective_id: {
                        "title": obj.title,
                        "progress": progress["objective_progress"].get(obj.objective_id, 0.0),
                        "completed": progress["objective_progress"].get(obj.objective_id, 0.0) >= 0.8
                    }
                    for obj in session.objectives
                },
                "cultural_discoveries": session.cultural_discoveries,
                "recommendations": recommendations,
                "performance_metrics": {
                    "average_cultural_relevance": sum([
                        interaction.get("analysis", {}).get("cultural_relevance", 0)
                        for interaction in session.interaction_history
                    ]) / max(len(session.interaction_history), 1),
                    "average_educational_value": sum([
                        interaction.get("analysis", {}).get("educational_value", 0)
                        for interaction in session.interaction_history
                    ]) / max(len(session.interaction_history), 1)
                }
            }
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error getting session summary: {e}")
            return {"error": str(e)}
    
    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End a learning session and provide final assessment"""
        try:
            summary = await self.get_session_summary(session_id)
            
            # Archive session
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
            
            # Generate completion certificate data
            completion_data = {
                "completion_certificate": {
                    "issued_at": datetime.now().isoformat(),
                    "session_summary": summary,
                    "achievements": self._generate_achievements(summary),
                    "next_learning_path": await self._suggest_learning_path(summary)
                }
            }
            
            summary.update(completion_data)
            
            self.logger.info(f"Ended learning session {session_id}")
            return summary
            
        except Exception as e:
            self.logger.error(f"Error ending session: {e}")
            return {"error": str(e)}
    
    def _generate_achievements(self, summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate achievements based on session performance"""
        achievements = []
        
        try:
            progress = summary.get("learning_progress", {})
            metrics = summary.get("performance_metrics", {})
            
            # Cultural Explorer Achievement
            if metrics.get("average_cultural_relevance", 0) > 0.7:
                achievements.append({
                    "title": "Explorator Cultural",
                    "description": "Ați demonstrat o înțelegere profundă a culturii românești",
                    "level": "gold",
                    "criteria_met": f"Relevanță culturală: {metrics['average_cultural_relevance']:.1%}"
                })
            
            # Learning Champion Achievement
            if progress.get("overall_progress", 0) > 0.8:
                achievements.append({
                    "title": "Campion al Învățării",
                    "description": "Progres excepțional în obiectivele de învățare",
                    "level": "gold",
                    "criteria_met": f"Progres general: {progress['overall_progress']:.1%}"
                })
            
            # Consistent Learner Achievement
            interactions_count = summary.get("session_info", {}).get("interactions_count", 0)
            if interactions_count >= 10:
                achievements.append({
                    "title": "Învățător Perseverent",
                    "description": "Participare activă și consistentă",
                    "level": "silver",
                    "criteria_met": f"Interacțiuni: {interactions_count}"
                })
            
        except Exception as e:
            self.logger.error(f"Error generating achievements: {e}")
        
        return achievements
    
    async def _suggest_learning_path(self, summary: Dict[str, Any]) -> List[str]:
        """Suggest next learning path based on performance"""
        try:
            suggestions = []
            
            progress = summary.get("learning_progress", {})
            cultural_knowledge = progress.get("cultural_knowledge", 0.0)
            
            if cultural_knowledge < 0.5:
                suggestions.extend([
                    "Aprofundați istoria României",
                    "Explorați tradițiile regionale",
                    "Studiați literatura română clasică"
                ])
            else:
                suggestions.extend([
                    "Analizați fenomene culturale contemporane",
                    "Cercetați influențele culturale externe",
                    "Participați la discuții culturale avansate"
                ])
            
            return suggestions[:3]
            
        except Exception as e:
            self.logger.error(f"Error suggesting learning path: {e}")
            return []

# Example usage and testing
async def main():
    """Example usage of the Romanian Educational Assistant"""
    
    # Initialize the assistant
    assistant = RomanianEducationalAssistant()
    
    # Wait for initialization
    await asyncio.sleep(2)
    
    # Create learning objectives
    objectives = [
        LearningObjective(
            objective_id="greetings_lesson",
            title="Learn Romanian Greetings",
            description="Master formal and informal Romanian greetings",
            content_type=ContentType.LANGUAGE_LESSON,
            level=LearningLevel.BEGINNER,
            cultural_focus="social_interactions",
            skills_required=["pronunciation", "cultural_awareness"],
            success_criteria=["Use appropriate greetings", "Understand formality levels"]
        ),
        LearningObjective(
            objective_id="cultural_heritage",
            title="Explore Transylvanian Heritage",
            description="Discover the cultural heritage of Transylvania",
            content_type=ContentType.CULTURAL_HERITAGE,
            level=LearningLevel.INTERMEDIATE,
            cultural_focus="historical_architecture",
            regional_context="Transilvania",
            skills_required=["historical_knowledge", "cultural_analysis"],
            success_criteria=["Identify key castles", "Understand historical context"]
        )
    ]
    
    # Start learning session
    session = await assistant.start_learning_session("test_user", objectives)
    print(f"✅ Started learning session: {session.session_id}")
    
    # Process some multimodal inputs
    test_inputs = [
        {"text": "Bună ziua! Cum vă numește?"},
        {"text": "Castelul Bran este foarte frumos și impresionant."},
        {"text": "Îmi place foarte mult muzica populară românească, especially hora."}
    ]
    
    for i, input_data in enumerate(test_inputs):
        print(f"\n🔄 Processing input {i+1}: {input_data['text']}")
        
        result = await assistant.process_multimodal_input(
            session.session_id,
            text=input_data["text"]
        )
        
        if "error" not in result:
            print(f"📊 Educational Value: {result['analysis']['educational_value']:.2f}")
            print(f"🇷🇴 Cultural Relevance: {result['analysis']['cultural_relevance']:.2f}")
            print(f"📈 Learning Progress: {result['learning_progress']['overall_progress']:.2f}")
            print(f"💡 Feedback: {result['feedback']['overall_score']:.2f}")
        else:
            print(f"❌ Error: {result['error']}")
    
    # Get session summary
    print(f"\n📋 Session Summary:")
    summary = await assistant.get_session_summary(session.session_id)
    print(f"📊 Overall Progress: {summary['learning_progress']['overall_progress']:.1%}")
    print(f"🎯 Objectives Completed: {sum(1 for obj in summary['objectives_status'].values() if obj['completed'])}/{len(objectives)}")
    print(f"🇷🇴 Cultural Knowledge: {summary['learning_progress']['cultural_knowledge']:.1%}")
    
    # End session
    final_summary = await assistant.end_session(session.session_id)
    achievements = final_summary.get("completion_certificate", {}).get("achievements", [])
    
    print(f"\n🏆 Achievements Earned: {len(achievements)}")
    for achievement in achievements:
        print(f"  • {achievement['title']}: {achievement['description']}")
    
    print(f"\n🎓 Romanian Educational Assistant Demo Complete!")

if __name__ == "__main__":
    asyncio.run(main())

"""
RomAI Phase 3.3 Education Sector Solution - Educational Content Engine
Comprehensive educational content development and management system.

Features:
- Curriculum-aligned knowledge bases for Romanian education system
- Age-appropriate content filtering and response generation
- Multi-grade level content adaptation (K-12, university, adult education)
- Subject-specific content modules (mathematics, science, literature, history)
- Interactive educational assessment and quiz generation
- Learning objective tracking and progress monitoring
- Adaptive content difficulty adjustment
- Multi-language educational support (Romanian, Hungarian, German, English)
"""

import asyncio
import json
import logging
import sqlite3
import uuid
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EducationLevel(Enum):
    """Education level classification for Romanian education system"""
    PRESCHOOL = "preschool"  # 3-6 years
    PRIMARY = "primary"      # Classes 0-4 (6-10 years)
    GYMNASIUM = "gymnasium"  # Classes 5-8 (11-14 years)
    LYCEUM = "lyceum"       # Classes 9-12 (15-18 years)
    UNIVERSITY = "university"  # Higher education
    ADULT_EDUCATION = "adult_education"  # Adult learning programs
    SPECIAL_NEEDS = "special_needs"  # Special education

class SubjectArea(Enum):
    """Subject areas for educational content"""
    MATHEMATICS = "mathematics"
    ROMANIAN_LANGUAGE = "romanian_language"
    FOREIGN_LANGUAGES = "foreign_languages"
    SCIENCES = "sciences"
    HISTORY = "history"
    GEOGRAPHY = "geography"
    ARTS = "arts"
    PHYSICAL_EDUCATION = "physical_education"
    TECHNOLOGY = "technology"
    SOCIAL_STUDIES = "social_studies"
    RELIGION = "religion"
    CIVIC_EDUCATION = "civic_education"

class ContentType(Enum):
    """Types of educational content"""
    LESSON_MATERIAL = "lesson_material"
    ASSESSMENT = "assessment"
    QUIZ = "quiz"
    INTERACTIVE_EXERCISE = "interactive_exercise"
    MULTIMEDIA_CONTENT = "multimedia_content"
    REFERENCE_MATERIAL = "reference_material"
    HOMEWORK_ASSIGNMENT = "homework_assignment"
    PROJECT_GUIDE = "project_guide"

class DifficultyLevel(Enum):
    """Content difficulty levels"""
    BEGINNER = "beginner"
    ELEMENTARY = "elementary"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class LanguageSupport(Enum):
    """Supported languages for educational content"""
    ROMANIAN = "ro"
    HUNGARIAN = "hu"
    GERMAN = "de"
    ENGLISH = "en"
    ROMANI = "rom"

class ContentFilter:
    """Content filtering for age-appropriate educational materials"""
    
    def __init__(self):
        self.age_restrictions = {
            EducationLevel.PRESCHOOL: {
                "forbidden_topics": [
                    "violence", "adult_content", "political_controversy",
                    "complex_historical_conflicts", "advanced_scientific_concepts"
                ],
                "required_elements": [
                    "visual_aids", "simple_language", "interactive_elements",
                    "positive_reinforcement", "basic_concepts"
                ]
            },
            EducationLevel.PRIMARY: {
                "forbidden_topics": [
                    "graphic_violence", "adult_content", "complex_political_issues",
                    "advanced_philosophical_concepts"
                ],
                "required_elements": [
                    "age_appropriate_examples", "clear_explanations",
                    "interactive_learning", "practical_applications"
                ]
            },
            EducationLevel.GYMNASIUM: {
                "forbidden_topics": [
                    "explicit_adult_content", "graphic_violence",
                    "inappropriate_political_propaganda"
                ],
                "required_elements": [
                    "critical_thinking_elements", "real_world_applications",
                    "collaborative_learning", "research_components"
                ]
            },
            EducationLevel.LYCEUM: {
                "forbidden_topics": [
                    "explicit_adult_content", "hate_speech",
                    "dangerous_instructions"
                ],
                "required_elements": [
                    "analytical_thinking", "independent_research",
                    "complex_problem_solving", "career_preparation"
                ]
            },
            EducationLevel.UNIVERSITY: {
                "forbidden_topics": ["hate_speech", "dangerous_instructions"],
                "required_elements": [
                    "academic_rigor", "original_research", "critical_analysis",
                    "professional_preparation", "ethical_considerations"
                ]
            }
        }
    
    def filter_content(self, content: str, education_level: EducationLevel) -> Dict[str, Any]:
        """Filter content for age appropriateness"""
        try:
            restrictions = self.age_restrictions.get(education_level, {})
            forbidden_topics = restrictions.get("forbidden_topics", [])
            required_elements = restrictions.get("required_elements", [])
            
            # Check for forbidden content
            content_lower = content.lower()
            violations = []
            for topic in forbidden_topics:
                if topic.replace("_", " ") in content_lower:
                    violations.append(topic)
            
            # Check for required elements
            missing_elements = []
            for element in required_elements:
                element_check = element.replace("_", " ")
                if element_check not in content_lower:
                    missing_elements.append(element)
            
            # Calculate appropriateness score
            appropriateness_score = max(0, 100 - (len(violations) * 20) - (len(missing_elements) * 5))
            
            return {
                "is_appropriate": len(violations) == 0,
                "appropriateness_score": appropriateness_score,
                "violations": violations,
                "missing_elements": missing_elements,
                "education_level": education_level.value,
                "recommendations": self._generate_recommendations(violations, missing_elements)
            }
            
        except Exception as e:
            logger.error(f"Content filtering error: {str(e)}")
            return {
                "is_appropriate": False,
                "appropriateness_score": 0,
                "error": str(e)
            }
    
    def _generate_recommendations(self, violations: List[str], missing_elements: List[str]) -> List[str]:
        """Generate recommendations for content improvement"""
        recommendations = []
        
        if violations:
            recommendations.append(f"Remove or modify content related to: {', '.join(violations)}")
        
        if missing_elements:
            recommendations.append(f"Consider adding: {', '.join(missing_elements)}")
        
        return recommendations

class CurriculumAlignment:
    """Romanian curriculum alignment engine"""
    
    def __init__(self):
        # Romanian national curriculum standards
        self.curriculum_standards = {
            EducationLevel.PRIMARY: {
                SubjectArea.MATHEMATICS: [
                    "Basic arithmetic operations", "Number recognition", "Simple geometry",
                    "Measurement concepts", "Problem solving basics"
                ],
                SubjectArea.ROMANIAN_LANGUAGE: [
                    "Alphabet recognition", "Basic reading", "Simple writing",
                    "Vocabulary building", "Basic grammar"
                ],
                SubjectArea.SCIENCES: [
                    "Natural world observation", "Basic life sciences",
                    "Simple experiments", "Environmental awareness"
                ]
            },
            EducationLevel.GYMNASIUM: {
                SubjectArea.MATHEMATICS: [
                    "Advanced arithmetic", "Basic algebra", "Geometry proofs",
                    "Statistics introduction", "Mathematical reasoning"
                ],
                SubjectArea.ROMANIAN_LANGUAGE: [
                    "Literature analysis", "Essay writing", "Grammar mastery",
                    "Communication skills", "Cultural texts"
                ],
                SubjectArea.HISTORY: [
                    "Romanian history", "World history overview",
                    "Historical analysis", "Source evaluation"
                ]
            },
            EducationLevel.LYCEUM: {
                SubjectArea.MATHEMATICS: [
                    "Advanced algebra", "Calculus introduction", "Complex geometry",
                    "Statistics and probability", "Mathematical modeling"
                ],
                SubjectArea.SCIENCES: [
                    "Physics principles", "Chemistry fundamentals", "Biology systems",
                    "Scientific method", "Laboratory skills"
                ],
                SubjectArea.FOREIGN_LANGUAGES: [
                    "Advanced grammar", "Cultural context", "Literature study",
                    "Communication fluency", "Academic writing"
                ]
            }
        }
    
    def align_with_curriculum(self, content: str, education_level: EducationLevel, 
                            subject_area: SubjectArea) -> Dict[str, Any]:
        """Align content with Romanian national curriculum"""
        try:
            standards = self.curriculum_standards.get(education_level, {}).get(subject_area, [])
            
            if not standards:
                return {
                    "alignment_score": 0,
                    "aligned_standards": [],
                    "missing_standards": [],
                    "recommendations": ["Curriculum standards not available for this level/subject"]
                }
            
            content_lower = content.lower()
            aligned_standards = []
            
            # Check alignment with each standard
            for standard in standards:
                standard_keywords = standard.lower().split()
                matches = sum(1 for keyword in standard_keywords if keyword in content_lower)
                alignment_ratio = matches / len(standard_keywords)
                
                if alignment_ratio >= 0.3:  # 30% keyword match threshold
                    aligned_standards.append({
                        "standard": standard,
                        "alignment_ratio": alignment_ratio
                    })
            
            alignment_score = (len(aligned_standards) / len(standards)) * 100
            missing_standards = [s for s in standards if s not in [a["standard"] for a in aligned_standards]]
            
            return {
                "alignment_score": alignment_score,
                "aligned_standards": aligned_standards,
                "missing_standards": missing_standards,
                "total_standards": len(standards),
                "recommendations": self._generate_alignment_recommendations(missing_standards)
            }
            
        except Exception as e:
            logger.error(f"Curriculum alignment error: {str(e)}")
            return {"alignment_score": 0, "error": str(e)}
    
    def _generate_alignment_recommendations(self, missing_standards: List[str]) -> List[str]:
        """Generate recommendations for better curriculum alignment"""
        recommendations = []
        
        if missing_standards:
            recommendations.append("Consider incorporating the following curriculum standards:")
            recommendations.extend([f"- {standard}" for standard in missing_standards[:5]])
        
        return recommendations

class AssessmentGenerator:
    """Educational assessment and quiz generation engine"""
    
    def __init__(self):
        self.question_types = [
            "multiple_choice", "true_false", "short_answer", 
            "essay", "matching", "fill_in_blank", "problem_solving"
        ]
    
    async def generate_assessment(self, topic: str, education_level: EducationLevel,
                                subject_area: SubjectArea, num_questions: int = 10) -> Dict[str, Any]:
        """Generate educational assessment based on topic and level"""
        try:
            assessment_id = str(uuid.uuid4())
            
            # Generate questions based on education level
            questions = []
            for i in range(num_questions):
                question = await self._generate_question(topic, education_level, subject_area, i + 1)
                questions.append(question)
            
            assessment = {
                "assessment_id": assessment_id,
                "topic": topic,
                "education_level": education_level.value,
                "subject_area": subject_area.value,
                "questions": questions,
                "total_questions": len(questions),
                "estimated_duration": len(questions) * 2,  # 2 minutes per question
                "difficulty_level": self._determine_difficulty(education_level),
                "created_at": datetime.utcnow().isoformat()
            }
            
            return assessment
            
        except Exception as e:
            logger.error(f"Assessment generation error: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_question(self, topic: str, education_level: EducationLevel,
                               subject_area: SubjectArea, question_number: int) -> Dict[str, Any]:
        """Generate individual question"""
        try:
            # Select appropriate question type based on education level
            if education_level in [EducationLevel.PRESCHOOL, EducationLevel.PRIMARY]:
                question_types = ["multiple_choice", "true_false", "matching"]
            elif education_level == EducationLevel.GYMNASIUM:
                question_types = ["multiple_choice", "short_answer", "problem_solving"]
            else:
                question_types = ["short_answer", "essay", "problem_solving"]
            
            # Generate question based on subject area and topic
            question_text, correct_answer, options = self._create_question_content(
                topic, education_level, subject_area, question_types[question_number % len(question_types)]
            )
            
            return {
                "question_id": str(uuid.uuid4()),
                "question_number": question_number,
                "question_text": question_text,
                "question_type": question_types[question_number % len(question_types)],
                "correct_answer": correct_answer,
                "options": options,
                "points": self._calculate_points(education_level),
                "difficulty": self._determine_difficulty(education_level)
            }
            
        except Exception as e:
            logger.error(f"Question generation error: {str(e)}")
            return {"question_id": str(uuid.uuid4()), "error": str(e)}
    
    def _create_question_content(self, topic: str, education_level: EducationLevel,
                               subject_area: SubjectArea, question_type: str) -> Tuple[str, str, List[str]]:
        """Create question content based on parameters"""
        
        # Sample question templates based on subject and level
        if subject_area == SubjectArea.MATHEMATICS:
            if education_level == EducationLevel.PRIMARY:
                question_text = f"Care este rezultatul operației 5 + 3?"
                correct_answer = "8"
                options = ["6", "7", "8", "9"]
            elif education_level == EducationLevel.GYMNASIUM:
                question_text = f"Rezolvați ecuația: 2x + 4 = 10"
                correct_answer = "x = 3"
                options = ["x = 2", "x = 3", "x = 4", "x = 5"]
            else:
                question_text = f"Calculați derivata funcției f(x) = x²"
                correct_answer = "f'(x) = 2x"
                options = ["f'(x) = x", "f'(x) = 2x", "f'(x) = x²", "f'(x) = 2x²"]
                
        elif subject_area == SubjectArea.ROMANIAN_LANGUAGE:
            if education_level == EducationLevel.PRIMARY:
                question_text = f"Care este forma corectă a cuvântului?"
                correct_answer = "școală"
                options = ["scoală", "școală", "şcoală", "scuală"]
            else:
                question_text = f"Identificați figura de stil din textul: 'Luna plânge în noapte'"
                correct_answer = "personificare"
                options = ["metaforă", "personificare", "comparație", "epitetus"]
                
        elif subject_area == SubjectArea.HISTORY:
            question_text = f"În ce an a avut loc Unirea Principatelor Române?"
            correct_answer = "1859"
            options = ["1858", "1859", "1860", "1861"]
            
        else:
            # Default generic question
            question_text = f"Întrebare despre {topic} pentru nivelul {education_level.value}"
            correct_answer = "Răspuns corect"
            options = ["Opțiunea A", "Răspuns corect", "Opțiunea C", "Opțiunea D"]
        
        return question_text, correct_answer, options
    
    def _determine_difficulty(self, education_level: EducationLevel) -> str:
        """Determine difficulty level based on education level"""
        difficulty_mapping = {
            EducationLevel.PRESCHOOL: DifficultyLevel.BEGINNER.value,
            EducationLevel.PRIMARY: DifficultyLevel.ELEMENTARY.value,
            EducationLevel.GYMNASIUM: DifficultyLevel.INTERMEDIATE.value,
            EducationLevel.LYCEUM: DifficultyLevel.ADVANCED.value,
            EducationLevel.UNIVERSITY: DifficultyLevel.EXPERT.value
        }
        return difficulty_mapping.get(education_level, DifficultyLevel.INTERMEDIATE.value)
    
    def _calculate_points(self, education_level: EducationLevel) -> int:
        """Calculate points for question based on education level"""
        points_mapping = {
            EducationLevel.PRESCHOOL: 1,
            EducationLevel.PRIMARY: 2,
            EducationLevel.GYMNASIUM: 3,
            EducationLevel.LYCEUM: 4,
            EducationLevel.UNIVERSITY: 5
        }
        return points_mapping.get(education_level, 3)

class LearningObjectiveTracker:
    """Learning objective tracking and progress monitoring"""
    
    def __init__(self):
        self.learning_objectives = {
            EducationLevel.PRIMARY: {
                SubjectArea.MATHEMATICS: [
                    "Count from 1 to 100",
                    "Perform basic addition and subtraction",
                    "Recognize geometric shapes",
                    "Understand measurement units"
                ],
                SubjectArea.ROMANIAN_LANGUAGE: [
                    "Read simple texts fluently",
                    "Write basic sentences correctly",
                    "Understand simple grammar rules",
                    "Expand vocabulary"
                ]
            },
            EducationLevel.GYMNASIUM: {
                SubjectArea.MATHEMATICS: [
                    "Solve linear equations",
                    "Understand geometric proofs",
                    "Calculate areas and volumes",
                    "Analyze statistical data"
                ],
                SubjectArea.SCIENCES: [
                    "Understand scientific method",
                    "Explain natural phenomena",
                    "Conduct simple experiments",
                    "Classify living organisms"
                ]
            }
        }
    
    def track_progress(self, student_id: str, education_level: EducationLevel,
                      subject_area: SubjectArea, completed_objectives: List[str]) -> Dict[str, Any]:
        """Track student progress against learning objectives"""
        try:
            objectives = self.learning_objectives.get(education_level, {}).get(subject_area, [])
            
            if not objectives:
                return {
                    "progress_percentage": 0,
                    "completed_objectives": [],
                    "remaining_objectives": [],
                    "recommendations": ["Learning objectives not defined for this level/subject"]
                }
            
            progress_percentage = (len(completed_objectives) / len(objectives)) * 100
            remaining_objectives = [obj for obj in objectives if obj not in completed_objectives]
            
            return {
                "student_id": student_id,
                "education_level": education_level.value,
                "subject_area": subject_area.value,
                "progress_percentage": progress_percentage,
                "completed_objectives": completed_objectives,
                "remaining_objectives": remaining_objectives,
                "total_objectives": len(objectives),
                "recommendations": self._generate_progress_recommendations(progress_percentage, remaining_objectives)
            }
            
        except Exception as e:
            logger.error(f"Progress tracking error: {str(e)}")
            return {"error": str(e)}
    
    def _generate_progress_recommendations(self, progress_percentage: float, 
                                         remaining_objectives: List[str]) -> List[str]:
        """Generate recommendations based on progress"""
        recommendations = []
        
        if progress_percentage < 30:
            recommendations.append("Consider reviewing foundational concepts")
            recommendations.append("Increase practice frequency")
        elif progress_percentage < 70:
            recommendations.append("Good progress! Continue current learning pace")
            recommendations.append("Focus on remaining objectives")
        else:
            recommendations.append("Excellent progress! Consider advanced topics")
            recommendations.append("Prepare for next education level")
        
        if remaining_objectives:
            recommendations.append(f"Next objectives to focus on: {remaining_objectives[:3]}")
        
        return recommendations

class EducationalContentEngine:
    """Main educational content engine coordinating all components"""
    
    def __init__(self, db_path: str = "education_content.db"):
        self.db_path = db_path
        self.content_filter = ContentFilter()
        self.curriculum_alignment = CurriculumAlignment()
        self.assessment_generator = AssessmentGenerator()
        self.learning_tracker = LearningObjectiveTracker()
        
        # Initialize database
        self._init_database()
        
        # Load configuration
        self.config = self._load_config()
        
        logger.info("Educational Content Engine initialized")
    
    def _init_database(self):
        """Initialize SQLite database for educational content"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Content table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS educational_content (
                        content_id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        content_text TEXT NOT NULL,
                        education_level TEXT NOT NULL,
                        subject_area TEXT NOT NULL,
                        content_type TEXT NOT NULL,
                        difficulty_level TEXT NOT NULL,
                        language TEXT NOT NULL,
                        curriculum_alignment_score REAL,
                        appropriateness_score REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Assessments table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS assessments (
                        assessment_id TEXT PRIMARY KEY,
                        topic TEXT NOT NULL,
                        education_level TEXT NOT NULL,
                        subject_area TEXT NOT NULL,
                        total_questions INTEGER,
                        estimated_duration INTEGER,
                        difficulty_level TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Student progress table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS student_progress (
                        progress_id TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        education_level TEXT NOT NULL,
                        subject_area TEXT NOT NULL,
                        completed_objectives TEXT,
                        progress_percentage REAL,
                        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Content analytics table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS content_analytics (
                        analytics_id TEXT PRIMARY KEY,
                        content_id TEXT,
                        usage_count INTEGER DEFAULT 0,
                        effectiveness_score REAL,
                        student_feedback_avg REAL,
                        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (content_id) REFERENCES educational_content (content_id)
                    )
                """)
                
                conn.commit()
                logger.info("Educational content database initialized")
                
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load educational content engine configuration"""
        default_config = {
            "supported_languages": ["ro", "hu", "de", "en"],
            "max_content_length": 10000,
            "min_appropriateness_score": 80,
            "min_curriculum_alignment": 70,
            "assessment_question_limit": 50,
            "progress_tracking_enabled": True,
            "content_analytics_enabled": True
        }
        
        try:
            config_path = Path("education_config.json")
            if config_path.exists():
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    default_config.update(user_config)
        except Exception as e:
            logger.warning(f"Could not load config file: {str(e)}")
        
        return default_config
    
    async def create_educational_content(self, title: str, content_text: str,
                                       education_level: EducationLevel, subject_area: SubjectArea,
                                       content_type: ContentType, language: LanguageSupport = LanguageSupport.ROMANIAN) -> Dict[str, Any]:
        """Create new educational content with validation and alignment"""
        try:
            content_id = str(uuid.uuid4())
            
            # Content filtering
            filter_result = self.content_filter.filter_content(content_text, education_level)
            
            if not filter_result.get("is_appropriate", False):
                return {
                    "success": False,
                    "error": "Content failed age-appropriateness filter",
                    "filter_result": filter_result
                }
            
            # Curriculum alignment
            alignment_result = self.curriculum_alignment.align_with_curriculum(
                content_text, education_level, subject_area
            )
            
            if alignment_result.get("alignment_score", 0) < self.config["min_curriculum_alignment"]:
                logger.warning(f"Low curriculum alignment: {alignment_result.get('alignment_score', 0)}%")
            
            # Determine difficulty level
            difficulty_level = self.assessment_generator._determine_difficulty(education_level)
            
            # Store content in database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO educational_content 
                    (content_id, title, content_text, education_level, subject_area, 
                     content_type, difficulty_level, language, curriculum_alignment_score, 
                     appropriateness_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    content_id, title, content_text, education_level.value,
                    subject_area.value, content_type.value, difficulty_level,
                    language.value, alignment_result.get("alignment_score", 0),
                    filter_result.get("appropriateness_score", 0)
                ))
                conn.commit()
            
            return {
                "success": True,
                "content_id": content_id,
                "title": title,
                "education_level": education_level.value,
                "subject_area": subject_area.value,
                "content_type": content_type.value,
                "filter_result": filter_result,
                "alignment_result": alignment_result,
                "difficulty_level": difficulty_level,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Content creation error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_lesson_plan(self, topic: str, education_level: EducationLevel,
                                 subject_area: SubjectArea, duration_minutes: int = 45) -> Dict[str, Any]:
        """Generate comprehensive lesson plan"""
        try:
            lesson_plan_id = str(uuid.uuid4())
            
            # Generate lesson components
            lesson_plan = {
                "lesson_plan_id": lesson_plan_id,
                "topic": topic,
                "education_level": education_level.value,
                "subject_area": subject_area.value,
                "duration_minutes": duration_minutes,
                "objectives": self._generate_lesson_objectives(topic, education_level, subject_area),
                "materials": self._generate_lesson_materials(education_level, subject_area),
                "activities": self._generate_lesson_activities(topic, education_level, duration_minutes),
                "assessment": await self.assessment_generator.generate_assessment(
                    topic, education_level, subject_area, 5
                ),
                "homework": self._generate_homework_assignment(topic, education_level),
                "adaptations": self._generate_lesson_adaptations(education_level),
                "created_at": datetime.utcnow().isoformat()
            }
            
            return lesson_plan
            
        except Exception as e:
            logger.error(f"Lesson plan generation error: {str(e)}")
            return {"error": str(e)}
    
    def _generate_lesson_objectives(self, topic: str, education_level: EducationLevel,
                                  subject_area: SubjectArea) -> List[str]:
        """Generate learning objectives for lesson"""
        base_objectives = [
            f"Students will understand the concept of {topic}",
            f"Students will be able to apply {topic} in practical situations",
            f"Students will demonstrate knowledge of {topic} through assessment"
        ]
        
        # Add level-specific objectives
        if education_level in [EducationLevel.PRESCHOOL, EducationLevel.PRIMARY]:
            base_objectives.append("Students will participate actively in learning activities")
        elif education_level == EducationLevel.GYMNASIUM:
            base_objectives.append("Students will analyze and compare different aspects of the topic")
        else:
            base_objectives.append("Students will critically evaluate and synthesize information")
        
        return base_objectives
    
    def _generate_lesson_materials(self, education_level: EducationLevel,
                                 subject_area: SubjectArea) -> List[str]:
        """Generate required materials for lesson"""
        materials = ["Whiteboard/Smart board", "Handouts", "Writing materials"]
        
        if subject_area == SubjectArea.MATHEMATICS:
            materials.extend(["Calculator", "Geometric instruments", "Graph paper"])
        elif subject_area == SubjectArea.SCIENCES:
            materials.extend(["Laboratory equipment", "Safety equipment", "Specimens/samples"])
        elif subject_area in [SubjectArea.ARTS, SubjectArea.TECHNOLOGY]:
            materials.extend(["Art supplies", "Computer/tablet", "Multimedia projector"])
        
        if education_level in [EducationLevel.PRESCHOOL, EducationLevel.PRIMARY]:
            materials.extend(["Visual aids", "Manipulatives", "Interactive games"])
        
        return materials
    
    def _generate_lesson_activities(self, topic: str, education_level: EducationLevel,
                                  duration_minutes: int) -> List[Dict[str, Any]]:
        """Generate lesson activities with timing"""
        activities = []
        
        # Introduction (10% of time)
        intro_time = max(5, duration_minutes // 10)
        activities.append({
            "phase": "Introduction",
            "duration_minutes": intro_time,
            "description": f"Introduce topic: {topic}",
            "teacher_actions": ["Present learning objectives", "Activate prior knowledge"],
            "student_actions": ["Listen actively", "Share previous knowledge"]
        })
        
        # Main content (70% of time)
        main_time = duration_minutes * 7 // 10
        activities.append({
            "phase": "Main Content",
            "duration_minutes": main_time,
            "description": f"Explore and learn about {topic}",
            "teacher_actions": ["Explain concepts", "Demonstrate examples", "Guide practice"],
            "student_actions": ["Take notes", "Ask questions", "Practice skills"]
        })
        
        # Conclusion (20% of time)
        conclusion_time = duration_minutes - intro_time - main_time
        activities.append({
            "phase": "Conclusion",
            "duration_minutes": conclusion_time,
            "description": f"Review and assess understanding of {topic}",
            "teacher_actions": ["Summarize key points", "Assign homework", "Assess learning"],
            "student_actions": ["Review learning", "Complete assessment", "Plan next steps"]
        })
        
        return activities
    
    def _generate_homework_assignment(self, topic: str, education_level: EducationLevel) -> Dict[str, Any]:
        """Generate homework assignment"""
        if education_level == EducationLevel.PRESCHOOL:
            return {
                "assignment": f"Practice activities related to {topic} with family",
                "duration_minutes": 15,
                "materials": ["Family support", "Simple materials from home"]
            }
        elif education_level == EducationLevel.PRIMARY:
            return {
                "assignment": f"Complete worksheet on {topic}",
                "duration_minutes": 30,
                "materials": ["Worksheet", "Pencil", "Coloring materials"]
            }
        elif education_level == EducationLevel.GYMNASIUM:
            return {
                "assignment": f"Research project on {topic}",
                "duration_minutes": 60,
                "materials": ["Internet access", "Reference books", "Writing materials"]
            }
        else:
            return {
                "assignment": f"Essay or presentation on {topic}",
                "duration_minutes": 120,
                "materials": ["Research sources", "Presentation software", "Academic writing guide"]
            }
    
    def _generate_lesson_adaptations(self, education_level: EducationLevel) -> List[str]:
        """Generate lesson adaptations for different learning needs"""
        adaptations = [
            "Provide visual aids for visual learners",
            "Include hands-on activities for kinesthetic learners",
            "Offer audio recordings for auditory learners"
        ]
        
        if education_level in [EducationLevel.PRESCHOOL, EducationLevel.PRIMARY]:
            adaptations.extend([
                "Use shorter activity periods",
                "Include movement breaks",
                "Provide immediate feedback"
            ])
        
        adaptations.extend([
            "Modify pace for different learning speeds",
            "Provide additional support for students with learning difficulties",
            "Offer extension activities for advanced students"
        ])
        
        return adaptations
    
    async def get_content_recommendations(self, student_id: str, education_level: EducationLevel,
                                        subject_area: SubjectArea) -> Dict[str, Any]:
        """Get personalized content recommendations for student"""
        try:
            # Get student progress
            progress_data = self.learning_tracker.track_progress(
                student_id, education_level, subject_area, []
            )
            
            # Query suitable content from database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT content_id, title, content_type, difficulty_level,
                           curriculum_alignment_score, appropriateness_score
                    FROM educational_content
                    WHERE education_level = ? AND subject_area = ?
                    AND appropriateness_score >= ?
                    ORDER BY curriculum_alignment_score DESC
                    LIMIT 10
                """, (education_level.value, subject_area.value, self.config["min_appropriateness_score"]))
                
                content_items = cursor.fetchall()
            
            recommendations = []
            for item in content_items:
                recommendations.append({
                    "content_id": item[0],
                    "title": item[1],
                    "content_type": item[2],
                    "difficulty_level": item[3],
                    "curriculum_alignment_score": item[4],
                    "appropriateness_score": item[5]
                })
            
            return {
                "student_id": student_id,
                "education_level": education_level.value,
                "subject_area": subject_area.value,
                "recommendations": recommendations,
                "progress_data": progress_data,
                "total_recommendations": len(recommendations)
            }
            
        except Exception as e:
            logger.error(f"Content recommendation error: {str(e)}")
            return {"error": str(e)}
    
    async def get_content_analytics(self) -> Dict[str, Any]:
        """Get analytics on educational content usage and effectiveness"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Content statistics
                cursor.execute("SELECT COUNT(*) FROM educational_content")
                total_content = cursor.fetchone()[0]
                
                cursor.execute("""
                    SELECT education_level, COUNT(*) 
                    FROM educational_content 
                    GROUP BY education_level
                """)
                content_by_level = dict(cursor.fetchall())
                
                cursor.execute("""
                    SELECT subject_area, COUNT(*) 
                    FROM educational_content 
                    GROUP BY subject_area
                """)
                content_by_subject = dict(cursor.fetchall())
                
                cursor.execute("""
                    SELECT AVG(curriculum_alignment_score), AVG(appropriateness_score)
                    FROM educational_content
                """)
                avg_scores = cursor.fetchone()
                
                # Assessment statistics
                cursor.execute("SELECT COUNT(*) FROM assessments")
                total_assessments = cursor.fetchone()[0]
                
                return {
                    "total_content_items": total_content,
                    "content_by_education_level": content_by_level,
                    "content_by_subject_area": content_by_subject,
                    "average_curriculum_alignment": avg_scores[0] if avg_scores[0] else 0,
                    "average_appropriateness_score": avg_scores[1] if avg_scores[1] else 0,
                    "total_assessments": total_assessments,
                    "analytics_generated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Analytics generation error: {str(e)}")
            return {"error": str(e)}

async def initialize_educational_content_engine():
    """Initialize and return educational content engine instance"""
    engine = EducationalContentEngine()
    logger.info("Educational Content Engine ready for service")
    return engine

# Example usage and testing
async def main():
    """Example usage of Educational Content Engine"""
    engine = await initialize_educational_content_engine()
    
    # Create sample educational content
    content_result = await engine.create_educational_content(
        title="Introducere în Matematică",
        content_text="Numerele sunt foarte importante în viața noastră. Să învățăm să numărăm de la 1 la 10.",
        education_level=EducationLevel.PRIMARY,
        subject_area=SubjectArea.MATHEMATICS,
        content_type=ContentType.LESSON_MATERIAL
    )
    
    print("Content Creation Result:", json.dumps(content_result, indent=2, ensure_ascii=False))
    
    # Generate assessment
    assessment = await engine.assessment_generator.generate_assessment(
        topic="Numărarea",
        education_level=EducationLevel.PRIMARY,
        subject_area=SubjectArea.MATHEMATICS,
        num_questions=5
    )
    
    print("Assessment Result:", json.dumps(assessment, indent=2, ensure_ascii=False))
    
    # Generate lesson plan
    lesson_plan = await engine.generate_lesson_plan(
        topic="Numărarea de la 1 la 10",
        education_level=EducationLevel.PRIMARY,
        subject_area=SubjectArea.MATHEMATICS,
        duration_minutes=45
    )
    
    print("Lesson Plan:", json.dumps(lesson_plan, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())

#!/usr/bin/env python3
"""
🇷🇴 RomAI User Feedback System
==============================

Comprehensive user feedback collection and analysis system for Romanian AI applications.
Focuses on Romanian user experience, cultural satisfaction, and language processing quality.

Week 4 Day 4: Production Deployment & Real-world Validation
Author: RomAI Development Team
Date: August 3, 2025
"""

import asyncio
import json
import sqlite3
import time
import datetime
import logging
import statistics
import threading
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Tuple, Union
from enum import Enum
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import queue
import random
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('romanian_user_feedback.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FeedbackType(Enum):
    """Types of user feedback"""
    SATISFACTION = "satisfaction"
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    CULTURAL_ACCURACY = "cultural_accuracy"
    LANGUAGE_QUALITY = "language_quality"
    USER_EXPERIENCE = "user_experience"
    PERFORMANCE = "performance"

class FeedbackSeverity(Enum):
    """Feedback severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class UserSegment(Enum):
    """Romanian user segments"""
    BUCHAREST_TECH = "bucuresti_tech"
    CLUJ_STARTUP = "cluj_startup"
    TIMISOARA_CORPORATE = "timisoara_corporate"
    IASI_ACADEMIC = "iasi_academic"
    CONSTANTA_TOURISM = "constanta_tourism"
    RURAL_TRADITIONAL = "rural_traditional"
    DIASPORA = "diaspora"

@dataclass
class RomanianUser:
    """Romanian user profile"""
    user_id: str
    name: str
    email: str
    location: str
    age_group: str
    occupation: str
    language_preference: str
    user_segment: UserSegment
    registration_date: datetime.datetime
    usage_frequency: str
    cultural_background: str
    tech_proficiency: str

@dataclass
class UserFeedback:
    """User feedback entry"""
    feedback_id: str
    user_id: str
    feedback_type: FeedbackType
    severity: FeedbackSeverity
    title: str
    description: str
    rating: int  # 1-5 scale
    cultural_relevance_score: int  # 1-10 scale
    language_quality_score: int  # 1-10 scale
    location: str
    timestamp: datetime.datetime
    session_id: str
    feature_used: str
    processed: bool = False
    response_sent: bool = False
    improvement_implemented: bool = False

@dataclass
class FeedbackAnalysis:
    """Analysis of user feedback"""
    analysis_id: str
    period_start: datetime.datetime
    period_end: datetime.datetime
    total_feedback_count: int
    average_satisfaction: float
    cultural_accuracy_score: float
    language_quality_score: float
    top_issues: List[Dict[str, Any]]
    user_segment_breakdown: Dict[str, int]
    regional_insights: Dict[str, Any]
    improvement_suggestions: List[str]
    trend_analysis: Dict[str, Any]

class RomanianCulturalValidator:
    """Validates cultural context and appropriateness"""
    
    def __init__(self):
        self.cultural_keywords = {
            "positive": [
                "mărțișor", "păsărele", "tradiție", "familie", "ospitalitate",
                "dragoste", "frumos", "minunat", "excelent", "bravo",
                "mulțumesc", "respect", "onoare", "cultură", "istorie"
            ],
            "negative": [
                "ofensator", "nepoliticos", "greșit", "rău", "inadecvat",
                "nerespectuos", "stereotip", "discriminare", "prejudecată"
            ],
            "neutral": [
                "bucuresti", "cluj", "timișoara", "iași", "constanța",
                "romania", "român", "română", "carpați", "dunăre"
            ]
        }
        
        self.romanian_expressions = [
            "Să trăiți!", "Noroc!", "La mulți ani!", "Bună ziua!",
            "Cu plăcere", "Să fii sănătos!", "Drum bun!", "Să ne auzim cu bine!"
        ]
        
        self.cultural_contexts = {
            "religious": ["paște", "crăciun", "sfântu", "biserică", "post"],
            "historical": ["decebal", "trajan", "mihai viteazul", "cuza", "carol"],
            "geographical": ["carpați", "dunăre", "marea neagră", "bucegi", "retezat"],
            "culinary": ["mici", "sarmale", "mămăligă", "ciorbă", "papanași"],
            "literary": ["eminescu", "creangă", "caragiale", "arghezi", "blaga"]
        }
    
    def validate_cultural_content(self, text: str) -> Dict[str, Any]:
        """Validate cultural appropriateness of content"""
        text_lower = text.lower()
        
        cultural_score = 0
        detected_contexts = []
        sentiment = "neutral"
        
        # Check for cultural keywords
        positive_matches = sum(1 for word in self.cultural_keywords["positive"] if word in text_lower)
        negative_matches = sum(1 for word in self.cultural_keywords["negative"] if word in text_lower)
        
        # Determine sentiment
        if positive_matches > negative_matches:
            sentiment = "positive"
            cultural_score = min(10, 5 + positive_matches)
        elif negative_matches > positive_matches:
            sentiment = "negative"
            cultural_score = max(1, 5 - negative_matches)
        else:
            cultural_score = 5
        
        # Check for cultural contexts
        for context, keywords in self.cultural_contexts.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_contexts.append(context)
        
        # Romanian expressions
        romanian_expressions_found = [expr for expr in self.romanian_expressions if expr.lower() in text_lower]
        
        validation_result = {
            "cultural_score": cultural_score,
            "sentiment": sentiment,
            "detected_contexts": detected_contexts,
            "romanian_expressions": romanian_expressions_found,
            "positive_cultural_references": positive_matches,
            "negative_cultural_references": negative_matches,
            "is_culturally_appropriate": cultural_score >= 6 and negative_matches == 0,
            "cultural_richness": len(detected_contexts) + len(romanian_expressions_found)
        }
        
        return validation_result

class FeedbackCollector:
    """Collects and categorizes user feedback"""
    
    def __init__(self):
        self.cultural_validator = RomanianCulturalValidator()
        self.feedback_queue = queue.Queue()
        self.active_users = {}
        
    async def collect_feedback(self, user: RomanianUser, feedback_data: Dict[str, Any]) -> UserFeedback:
        """Collect user feedback with Romanian context validation"""
        feedback_id = f"fb_{user.user_id}_{int(time.time())}"
        
        # Validate cultural content
        cultural_validation = self.cultural_validator.validate_cultural_content(
            feedback_data.get("description", "")
        )
        
        feedback = UserFeedback(
            feedback_id=feedback_id,
            user_id=user.user_id,
            feedback_type=FeedbackType(feedback_data.get("type", "satisfaction")),
            severity=FeedbackSeverity(feedback_data.get("severity", "medium")),
            title=feedback_data.get("title", ""),
            description=feedback_data.get("description", ""),
            rating=feedback_data.get("rating", 5),
            cultural_relevance_score=cultural_validation["cultural_score"],
            language_quality_score=feedback_data.get("language_quality", 8),
            location=user.location,
            timestamp=datetime.datetime.now(),
            session_id=feedback_data.get("session_id", ""),
            feature_used=feedback_data.get("feature_used", "general")
        )
        
        self.feedback_queue.put(feedback)
        logger.info(f"Collected feedback from user {user.user_id} in {user.location}")
        
        return feedback
    
    def categorize_feedback(self, feedback: UserFeedback) -> Dict[str, Any]:
        """Categorize feedback based on content and context"""
        categories = {
            "technical": False,
            "cultural": False,
            "linguistic": False,
            "usability": False,
            "performance": False
        }
        
        description_lower = feedback.description.lower()
        
        # Technical keywords
        technical_keywords = ["bug", "error", "crash", "slow", "fast", "load", "response"]
        if any(keyword in description_lower for keyword in technical_keywords):
            categories["technical"] = True
        
        # Cultural keywords
        cultural_keywords = ["culture", "tradition", "romanian", "cultural", "appropriate"]
        if any(keyword in description_lower for keyword in cultural_keywords):
            categories["cultural"] = True
        
        # Linguistic keywords
        linguistic_keywords = ["diacritic", "ă", "â", "î", "ș", "ț", "language", "translation"]
        if any(keyword in description_lower for keyword in linguistic_keywords):
            categories["linguistic"] = True
        
        # Usability keywords
        usability_keywords = ["difficult", "easy", "intuitive", "confusing", "clear"]
        if any(keyword in description_lower for keyword in usability_keywords):
            categories["usability"] = True
        
        # Performance keywords
        performance_keywords = ["slow", "fast", "quick", "performance", "speed"]
        if any(keyword in description_lower for keyword in performance_keywords):
            categories["performance"] = True
        
        return {
            "categories": categories,
            "primary_category": max(categories, key=categories.get) if any(categories.values()) else "general",
            "complexity_score": sum(categories.values()),
            "requires_cultural_review": categories["cultural"] or feedback.cultural_relevance_score < 6
        }

class FeedbackAnalyzer:
    """Analyzes feedback patterns and generates insights"""
    
    def __init__(self):
        self.db_path = "romanian_user_feedback.db"
        self.init_database()
        
    def init_database(self):
        """Initialize feedback database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                location TEXT,
                age_group TEXT,
                occupation TEXT,
                language_preference TEXT,
                user_segment TEXT,
                registration_date TIMESTAMP,
                usage_frequency TEXT,
                cultural_background TEXT,
                tech_proficiency TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feedback_id TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                feedback_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT,
                description TEXT,
                rating INTEGER,
                cultural_relevance_score INTEGER,
                language_quality_score INTEGER,
                location TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT,
                feature_used TEXT,
                processed BOOLEAN DEFAULT FALSE,
                response_sent BOOLEAN DEFAULT FALSE,
                improvement_implemented BOOLEAN DEFAULT FALSE
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id TEXT UNIQUE NOT NULL,
                period_start TIMESTAMP,
                period_end TIMESTAMP,
                total_feedback_count INTEGER,
                average_satisfaction REAL,
                cultural_accuracy_score REAL,
                language_quality_score REAL,
                top_issues TEXT,
                user_segment_breakdown TEXT,
                regional_insights TEXT,
                improvement_suggestions TEXT,
                trend_analysis TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def analyze_feedback_patterns(self, feedback_list: List[UserFeedback]) -> FeedbackAnalysis:
        """Analyze patterns in user feedback"""
        if not feedback_list:
            return self._create_empty_analysis()
        
        # Basic statistics
        total_count = len(feedback_list)
        avg_satisfaction = statistics.mean([f.rating for f in feedback_list])
        avg_cultural_score = statistics.mean([f.cultural_relevance_score for f in feedback_list])
        avg_language_score = statistics.mean([f.language_quality_score for f in feedback_list])
        
        # Period analysis
        timestamps = [f.timestamp for f in feedback_list]
        period_start = min(timestamps)
        period_end = max(timestamps)
        
        # Top issues analysis
        top_issues = self._analyze_top_issues(feedback_list)
        
        # User segment breakdown
        segment_breakdown = self._analyze_user_segments(feedback_list)
        
        # Regional insights
        regional_insights = self._analyze_regional_patterns(feedback_list)
        
        # Improvement suggestions
        improvement_suggestions = self._generate_improvement_suggestions(feedback_list)
        
        # Trend analysis
        trend_analysis = self._analyze_trends(feedback_list)
        
        analysis = FeedbackAnalysis(
            analysis_id=f"analysis_{int(time.time())}",
            period_start=period_start,
            period_end=period_end,
            total_feedback_count=total_count,
            average_satisfaction=avg_satisfaction,
            cultural_accuracy_score=avg_cultural_score,
            language_quality_score=avg_language_score,
            top_issues=top_issues,
            user_segment_breakdown=segment_breakdown,
            regional_insights=regional_insights,
            improvement_suggestions=improvement_suggestions,
            trend_analysis=trend_analysis
        )
        
        await self._store_analysis(analysis)
        return analysis
    
    def _create_empty_analysis(self) -> FeedbackAnalysis:
        """Create empty analysis for no feedback scenario"""
        return FeedbackAnalysis(
            analysis_id=f"analysis_empty_{int(time.time())}",
            period_start=datetime.datetime.now(),
            period_end=datetime.datetime.now(),
            total_feedback_count=0,
            average_satisfaction=0.0,
            cultural_accuracy_score=0.0,
            language_quality_score=0.0,
            top_issues=[],
            user_segment_breakdown={},
            regional_insights={},
            improvement_suggestions=["Collect more user feedback"],
            trend_analysis={}
        )
    
    def _analyze_top_issues(self, feedback_list: List[UserFeedback]) -> List[Dict[str, Any]]:
        """Analyze most common issues"""
        issue_counts = {}
        severity_weights = {"critical": 5, "high": 4, "medium": 3, "low": 2, "info": 1}
        
        for feedback in feedback_list:
            if feedback.feedback_type in [FeedbackType.BUG_REPORT, FeedbackType.FEATURE_REQUEST]:
                issue_key = f"{feedback.feedback_type.value}_{feedback.feature_used}"
                weight = severity_weights.get(feedback.severity.value, 1)
                
                if issue_key not in issue_counts:
                    issue_counts[issue_key] = {
                        "type": feedback.feedback_type.value,
                        "feature": feedback.feature_used,
                        "count": 0,
                        "weighted_score": 0,
                        "avg_rating": []
                    }
                
                issue_counts[issue_key]["count"] += 1
                issue_counts[issue_key]["weighted_score"] += weight
                issue_counts[issue_key]["avg_rating"].append(feedback.rating)
        
        # Calculate averages and sort by weighted score
        for issue in issue_counts.values():
            issue["avg_rating"] = statistics.mean(issue["avg_rating"]) if issue["avg_rating"] else 0
        
        top_issues = sorted(issue_counts.values(), key=lambda x: x["weighted_score"], reverse=True)
        return top_issues[:10]  # Top 10 issues
    
    def _analyze_user_segments(self, feedback_list: List[UserFeedback]) -> Dict[str, int]:
        """Analyze feedback by user segments"""
        # This would require user data - simulating for now
        segments = {}
        locations = [f.location for f in feedback_list]
        
        for location in locations:
            if "București" in location:
                segments["bucuresti_tech"] = segments.get("bucuresti_tech", 0) + 1
            elif "Cluj" in location:
                segments["cluj_startup"] = segments.get("cluj_startup", 0) + 1
            elif "Timișoara" in location:
                segments["timisoara_corporate"] = segments.get("timisoara_corporate", 0) + 1
            elif "Iași" in location:
                segments["iasi_academic"] = segments.get("iasi_academic", 0) + 1
            else:
                segments["other"] = segments.get("other", 0) + 1
        
        return segments
    
    def _analyze_regional_patterns(self, feedback_list: List[UserFeedback]) -> Dict[str, Any]:
        """Analyze regional feedback patterns"""
        regional_data = {}
        
        for feedback in feedback_list:
            region = feedback.location
            if region not in regional_data:
                regional_data[region] = {
                    "count": 0,
                    "avg_satisfaction": [],
                    "avg_cultural_score": [],
                    "common_issues": []
                }
            
            regional_data[region]["count"] += 1
            regional_data[region]["avg_satisfaction"].append(feedback.rating)
            regional_data[region]["avg_cultural_score"].append(feedback.cultural_relevance_score)
            regional_data[region]["common_issues"].append(feedback.feedback_type.value)
        
        # Calculate averages
        for region_data in regional_data.values():
            region_data["avg_satisfaction"] = statistics.mean(region_data["avg_satisfaction"])
            region_data["avg_cultural_score"] = statistics.mean(region_data["avg_cultural_score"])
            region_data["most_common_issue"] = max(set(region_data["common_issues"]), 
                                                  key=region_data["common_issues"].count)
            del region_data["common_issues"]  # Remove raw data
        
        return regional_data
    
    def _generate_improvement_suggestions(self, feedback_list: List[UserFeedback]) -> List[str]:
        """Generate improvement suggestions based on feedback"""
        suggestions = []
        
        # Analyze satisfaction scores
        low_satisfaction = [f for f in feedback_list if f.rating <= 2]
        if len(low_satisfaction) > len(feedback_list) * 0.2:  # More than 20% low satisfaction
            suggestions.append("Address user satisfaction issues - over 20% of users rate experience as poor")
        
        # Analyze cultural scores
        low_cultural = [f for f in feedback_list if f.cultural_relevance_score <= 5]
        if len(low_cultural) > len(feedback_list) * 0.15:  # More than 15% low cultural relevance
            suggestions.append("Improve cultural context and Romanian cultural relevance")
        
        # Analyze language quality
        low_language = [f for f in feedback_list if f.language_quality_score <= 6]
        if len(low_language) > len(feedback_list) * 0.1:  # More than 10% low language quality
            suggestions.append("Enhance Romanian language processing quality")
        
        # Check for performance issues
        performance_feedback = [f for f in feedback_list if "slow" in f.description.lower() or "performance" in f.description.lower()]
        if len(performance_feedback) > 5:
            suggestions.append("Optimize application performance and response times")
        
        # Check for usability issues
        usability_feedback = [f for f in feedback_list if "difficult" in f.description.lower() or "confusing" in f.description.lower()]
        if len(usability_feedback) > 3:
            suggestions.append("Improve user interface and user experience design")
        
        if not suggestions:
            suggestions.append("Continue monitoring user feedback and maintaining high quality")
        
        return suggestions
    
    def _analyze_trends(self, feedback_list: List[UserFeedback]) -> Dict[str, Any]:
        """Analyze trends in feedback over time"""
        if len(feedback_list) < 2:
            return {"status": "insufficient_data"}
        
        # Sort by timestamp
        sorted_feedback = sorted(feedback_list, key=lambda x: x.timestamp)
        
        # Split into first and second half for trend analysis
        mid_point = len(sorted_feedback) // 2
        first_half = sorted_feedback[:mid_point]
        second_half = sorted_feedback[mid_point:]
        
        # Calculate trend metrics
        first_avg_satisfaction = statistics.mean([f.rating for f in first_half])
        second_avg_satisfaction = statistics.mean([f.rating for f in second_half])
        
        first_avg_cultural = statistics.mean([f.cultural_relevance_score for f in first_half])
        second_avg_cultural = statistics.mean([f.cultural_relevance_score for f in second_half])
        
        satisfaction_trend = "improving" if second_avg_satisfaction > first_avg_satisfaction else "declining"
        cultural_trend = "improving" if second_avg_cultural > first_avg_cultural else "declining"
        
        return {
            "satisfaction_trend": satisfaction_trend,
            "satisfaction_change": second_avg_satisfaction - first_avg_satisfaction,
            "cultural_trend": cultural_trend,
            "cultural_change": second_avg_cultural - first_avg_cultural,
            "feedback_volume_trend": "increasing" if len(second_half) > len(first_half) else "decreasing"
        }
    
    async def _store_analysis(self, analysis: FeedbackAnalysis):
        """Store analysis in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO feedback_analysis 
            (analysis_id, period_start, period_end, total_feedback_count, average_satisfaction,
             cultural_accuracy_score, language_quality_score, top_issues, user_segment_breakdown,
             regional_insights, improvement_suggestions, trend_analysis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            analysis.analysis_id,
            analysis.period_start.isoformat(),
            analysis.period_end.isoformat(),
            analysis.total_feedback_count,
            analysis.average_satisfaction,
            analysis.cultural_accuracy_score,
            analysis.language_quality_score,
            json.dumps(analysis.top_issues),
            json.dumps(analysis.user_segment_breakdown),
            json.dumps(analysis.regional_insights),
            json.dumps(analysis.improvement_suggestions),
            json.dumps(analysis.trend_analysis)
        ))
        
        conn.commit()
        conn.close()

class RomanianUserFeedbackSystem:
    """Main Romanian user feedback system"""
    
    def __init__(self):
        self.feedback_collector = FeedbackCollector()
        self.feedback_analyzer = FeedbackAnalyzer()
        self.collected_feedback = []
        self.users = {}
        self.init_sample_users()
        
    def init_sample_users(self):
        """Initialize sample Romanian users"""
        sample_users = [
            RomanianUser(
                user_id="user_001",
                name="Andrei Popescu",
                email="andrei.popescu@example.com",
                location="București, România",
                age_group="25-34",
                occupation="Software Developer",
                language_preference="română",
                user_segment=UserSegment.BUCHAREST_TECH,
                registration_date=datetime.datetime.now() - datetime.timedelta(days=30),
                usage_frequency="daily",
                cultural_background="urban_modern",
                tech_proficiency="expert"
            ),
            RomanianUser(
                user_id="user_002",
                name="Maria Ionescu",
                email="maria.ionescu@example.com",
                location="Cluj-Napoca, România",
                age_group="28-35",
                occupation="Product Manager",
                language_preference="română",
                user_segment=UserSegment.CLUJ_STARTUP,
                registration_date=datetime.datetime.now() - datetime.timedelta(days=45),
                usage_frequency="weekly",
                cultural_background="traditional_modern",
                tech_proficiency="advanced"
            ),
            RomanianUser(
                user_id="user_003",
                name="Constantin Dobre",
                email="constantin.dobre@example.com",
                location="Timișoara, România",
                age_group="35-44",
                occupation="Business Analyst",
                language_preference="română",
                user_segment=UserSegment.TIMISOARA_CORPORATE,
                registration_date=datetime.datetime.now() - datetime.timedelta(days=60),
                usage_frequency="daily",
                cultural_background="corporate_professional",
                tech_proficiency="intermediate"
            ),
            RomanianUser(
                user_id="user_004",
                name="Elena Gheorghe",
                email="elena.gheorghe@example.com",
                location="Iași, România",
                age_group="22-28",
                occupation="Student/Researcher",
                language_preference="română",
                user_segment=UserSegment.IASI_ACADEMIC,
                registration_date=datetime.datetime.now() - datetime.timedelta(days=20),
                usage_frequency="weekly",
                cultural_background="academic_intellectual",
                tech_proficiency="advanced"
            ),
            RomanianUser(
                user_id="user_005",
                name="Mihai Vasilescu",
                email="mihai.vasilescu@example.com",
                location="Constanța, România",
                age_group="45-54",
                occupation="Hotel Manager",
                language_preference="română",
                user_segment=UserSegment.CONSTANTA_TOURISM,
                registration_date=datetime.datetime.now() - datetime.timedelta(days=90),
                usage_frequency="monthly",
                cultural_background="tourism_hospitality",
                tech_proficiency="beginner"
            )
        ]
        
        for user in sample_users:
            self.users[user.user_id] = user
    
    async def simulate_user_feedback_collection(self) -> Dict[str, Any]:
        """Simulate collection of user feedback from Romanian users"""
        print("🇷🇴 Collecting Romanian User Feedback...")
        
        # Sample feedback scenarios
        feedback_scenarios = [
            {
                "user_id": "user_001",
                "type": "satisfaction",
                "severity": "info",
                "title": "Aplicația funcționează excelent!",
                "description": "Îmi place foarte mult cum procesează textul în română. Diacriticele sunt păstrate perfect și înțelege contextul cultural românesc. Bravo!",
                "rating": 5,
                "language_quality": 9,
                "session_id": "session_001",
                "feature_used": "text_processing"
            },
            {
                "user_id": "user_002",
                "type": "bug_report",
                "severity": "medium",
                "title": "Problema cu caracterele speciale",
                "description": "Câteodată aplicația nu recunoaște corect ș și ț în anumite contexte. De exemplu, când scriu despre tradițiile românești.",
                "rating": 3,
                "language_quality": 6,
                "session_id": "session_002",
                "feature_used": "cultural_analysis"
            },
            {
                "user_id": "user_003",
                "type": "feature_request",
                "severity": "medium",
                "title": "Suport pentru expresii românești regionale",
                "description": "Ar fi minunat să recunoască și expresii specifice din Banat sau Moldova. De exemplu, 'măi omule' sau alte regionalisme.",
                "rating": 4,
                "language_quality": 8,
                "session_id": "session_003",
                "feature_used": "language_analysis"
            },
            {
                "user_id": "user_004",
                "type": "cultural_accuracy",
                "severity": "high",
                "title": "Context cultural academic",
                "description": "Aplicația înțelege bine contextul cultural general, dar ar putea fi îmbunătățită pentru texte academice despre literatura română și istoria culturală.",
                "rating": 4,
                "language_quality": 8,
                "session_id": "session_004",
                "feature_used": "academic_analysis"
            },
            {
                "user_id": "user_005",
                "type": "user_experience",
                "severity": "low",
                "title": "Interfața este ușor de folosit",
                "description": "Pentru cineva mai puțin familiarizat cu tehnologia, aplicația este surprinzător de simplă. Apreciez că e în română completă.",
                "rating": 4,
                "language_quality": 9,
                "session_id": "session_005",
                "feature_used": "user_interface"
            },
            {
                "user_id": "user_001",
                "type": "performance",
                "severity": "low",
                "title": "Viteză bună de procesare",
                "description": "Răspunde foarte rapid, chiar și pentru texte lungi în română. Performanțe excelente!",
                "rating": 5,
                "language_quality": 9,
                "session_id": "session_006",
                "feature_used": "text_processing"
            },
            {
                "user_id": "user_002",
                "type": "language_quality",
                "severity": "medium",
                "title": "Calitatea traducerii",
                "description": "Traducerile sunt în general bune, dar uneori pierde nuanțele culturale românești specifice Transilvaniei.",
                "rating": 3,
                "language_quality": 7,
                "session_id": "session_007",
                "feature_used": "translation"
            },
            {
                "user_id": "user_003",
                "type": "satisfaction",
                "severity": "info",
                "title": "Mulțumit de progresul aplicației",
                "description": "Văd că se îmbunătățește constant. Recunoașterea contextului business românesc este din ce în ce mai bună.",
                "rating": 4,
                "language_quality": 8,
                "session_id": "session_008",
                "feature_used": "business_analysis"
            }
        ]
        
        # Collect feedback
        collected_feedback = []
        for scenario in feedback_scenarios:
            user = self.users[scenario["user_id"]]
            feedback = await self.feedback_collector.collect_feedback(user, scenario)
            collected_feedback.append(feedback)
            self.collected_feedback.append(feedback)
        
        # Analyze collected feedback
        analysis = await self.feedback_analyzer.analyze_feedback_patterns(collected_feedback)
        
        collection_summary = {
            "total_feedback_collected": len(collected_feedback),
            "unique_users": len(set(f.user_id for f in collected_feedback)),
            "average_satisfaction": analysis.average_satisfaction,
            "cultural_accuracy": analysis.cultural_accuracy_score,
            "language_quality": analysis.language_quality_score,
            "user_segments": analysis.user_segment_breakdown,
            "regional_distribution": analysis.regional_insights,
            "improvement_suggestions": analysis.improvement_suggestions,
            "collection_timestamp": datetime.datetime.now().isoformat()
        }
        
        return collection_summary
    
    async def generate_feedback_insights(self) -> Dict[str, Any]:
        """Generate insights from collected feedback"""
        if not self.collected_feedback:
            return {"status": "no_feedback_available"}
        
        analysis = await self.feedback_analyzer.analyze_feedback_patterns(self.collected_feedback)
        
        insights = {
            "analysis_period": {
                "start": analysis.period_start.isoformat(),
                "end": analysis.period_end.isoformat(),
                "duration_hours": (analysis.period_end - analysis.period_start).total_seconds() / 3600
            },
            "key_metrics": {
                "total_feedback": analysis.total_feedback_count,
                "average_satisfaction": round(analysis.average_satisfaction, 2),
                "cultural_accuracy_score": round(analysis.cultural_accuracy_score, 2),
                "language_quality_score": round(analysis.language_quality_score, 2)
            },
            "top_issues": analysis.top_issues[:5],
            "user_segments": analysis.user_segment_breakdown,
            "regional_insights": analysis.regional_insights,
            "improvement_actions": analysis.improvement_suggestions,
            "trends": analysis.trend_analysis,
            "romanian_specific_insights": {
                "diacritic_issues": len([f for f in self.collected_feedback if "ă" in f.description or "ș" in f.description or "ț" in f.description]),
                "cultural_context_feedback": len([f for f in self.collected_feedback if f.feedback_type == FeedbackType.CULTURAL_ACCURACY]),
                "regional_preferences": self._analyze_regional_preferences(),
                "language_proficiency_correlation": self._analyze_language_proficiency()
            }
        }
        
        return insights
    
    def _analyze_regional_preferences(self) -> Dict[str, Any]:
        """Analyze preferences by Romanian regions"""
        regional_prefs = {}
        
        for feedback in self.collected_feedback:
            region = feedback.location.split(",")[0]  # Get city name
            
            if region not in regional_prefs:
                regional_prefs[region] = {
                    "satisfaction_scores": [],
                    "cultural_scores": [],
                    "preferred_features": []
                }
            
            regional_prefs[region]["satisfaction_scores"].append(feedback.rating)
            regional_prefs[region]["cultural_scores"].append(feedback.cultural_relevance_score)
            regional_prefs[region]["preferred_features"].append(feedback.feature_used)
        
        # Calculate averages and most popular features
        for region, data in regional_prefs.items():
            data["avg_satisfaction"] = statistics.mean(data["satisfaction_scores"])
            data["avg_cultural_score"] = statistics.mean(data["cultural_scores"])
            data["most_popular_feature"] = max(set(data["preferred_features"]), 
                                             key=data["preferred_features"].count)
            # Clean up raw data
            del data["satisfaction_scores"]
            del data["cultural_scores"]
            del data["preferred_features"]
        
        return regional_prefs
    
    def _analyze_language_proficiency(self) -> Dict[str, Any]:
        """Analyze correlation between user tech proficiency and feedback quality"""
        proficiency_analysis = {
            "expert": {"count": 0, "avg_satisfaction": [], "avg_language_quality": []},
            "advanced": {"count": 0, "avg_satisfaction": [], "avg_language_quality": []},
            "intermediate": {"count": 0, "avg_satisfaction": [], "avg_language_quality": []},
            "beginner": {"count": 0, "avg_satisfaction": [], "avg_language_quality": []}
        }
        
        for feedback in self.collected_feedback:
            user = self.users.get(feedback.user_id)
            if user and user.tech_proficiency in proficiency_analysis:
                proficiency_analysis[user.tech_proficiency]["count"] += 1
                proficiency_analysis[user.tech_proficiency]["avg_satisfaction"].append(feedback.rating)
                proficiency_analysis[user.tech_proficiency]["avg_language_quality"].append(feedback.language_quality_score)
        
        # Calculate averages
        for level, data in proficiency_analysis.items():
            if data["avg_satisfaction"]:
                data["avg_satisfaction"] = statistics.mean(data["avg_satisfaction"])
                data["avg_language_quality"] = statistics.mean(data["avg_language_quality"])
            else:
                data["avg_satisfaction"] = 0
                data["avg_language_quality"] = 0
        
        return proficiency_analysis

# Test function
async def test_romanian_user_feedback_system():
    """Test the Romanian user feedback system"""
    system = RomanianUserFeedbackSystem()
    
    print("🇷🇴 Testing Romanian User Feedback System")
    print("=" * 60)
    
    # Test user initialization
    print(f"\n👥 Initialized {len(system.users)} sample Romanian users:")
    for user_id, user in system.users.items():
        print(f"  {user.name} from {user.location} ({user.user_segment.value})")
    
    # Collect feedback
    print(f"\n📝 Collecting user feedback...")
    collection_summary = await system.simulate_user_feedback_collection()
    
    print(f"\n📊 Feedback Collection Summary:")
    print(f"Total feedback collected: {collection_summary['total_feedback_collected']}")
    print(f"Unique users: {collection_summary['unique_users']}")
    print(f"Average satisfaction: {collection_summary['average_satisfaction']:.2f}/5")
    print(f"Cultural accuracy: {collection_summary['cultural_accuracy']:.2f}/10")
    print(f"Language quality: {collection_summary['language_quality']:.2f}/10")
    
    # Show user segments
    print(f"\n🎯 User Segment Distribution:")
    for segment, count in collection_summary['user_segments'].items():
        print(f"  {segment}: {count} users")
    
    # Show regional insights
    print(f"\n🗺️ Regional Distribution:")
    for region, data in collection_summary['regional_distribution'].items():
        print(f"  {region}: {data['count']} feedback, satisfaction: {data['avg_satisfaction']:.2f}")
    
    # Show improvement suggestions
    print(f"\n💡 Improvement Suggestions:")
    for i, suggestion in enumerate(collection_summary['improvement_suggestions'], 1):
        print(f"  {i}. {suggestion}")
    
    # Generate detailed insights
    print(f"\n🔍 Generating detailed insights...")
    insights = await system.generate_feedback_insights()
    
    print(f"\n📈 Detailed Insights:")
    key_metrics = insights['key_metrics']
    print(f"Analysis Period: {insights['analysis_period']['duration_hours']:.1f} hours")
    print(f"Total Feedback: {key_metrics['total_feedback']}")
    print(f"Average Satisfaction: {key_metrics['average_satisfaction']}/5")
    print(f"Cultural Accuracy: {key_metrics['cultural_accuracy_score']}/10")
    print(f"Language Quality: {key_metrics['language_quality_score']}/10")
    
    # Romanian-specific insights
    romanian_insights = insights['romanian_specific_insights']
    print(f"\n🇷🇴 Romanian-Specific Insights:")
    print(f"Diacritic-related feedback: {romanian_insights['diacritic_issues']}")
    print(f"Cultural context feedback: {romanian_insights['cultural_context_feedback']}")
    
    # Regional preferences
    print(f"\n🏛️ Regional Preferences:")
    for region, prefs in romanian_insights['regional_preferences'].items():
        print(f"  {region}: Satisfaction {prefs['avg_satisfaction']:.2f}, Most popular: {prefs['most_popular_feature']}")
    
    # Language proficiency correlation
    print(f"\n👨‍💻 Tech Proficiency Analysis:")
    for level, data in romanian_insights['language_proficiency_correlation'].items():
        if data['count'] > 0:
            print(f"  {level}: {data['count']} users, satisfaction {data['avg_satisfaction']:.2f}")
    
    # Top issues
    top_issues = insights.get('top_issues', [])
    if top_issues:
        print(f"\n🔧 Top Issues to Address:")
        for i, issue in enumerate(top_issues[:3], 1):
            print(f"  {i}. {issue['type']} in {issue['feature']} (Score: {issue['weighted_score']})")
    
    # Trends
    trends = insights.get('trends', {})
    if trends and trends.get('status') != 'insufficient_data':
        print(f"\n📈 Trends Analysis:")
        print(f"Satisfaction trend: {trends['satisfaction_trend']} ({trends['satisfaction_change']:+.2f})")
        print(f"Cultural relevance trend: {trends['cultural_trend']} ({trends['cultural_change']:+.2f})")
        print(f"Feedback volume: {trends['feedback_volume_trend']}")
    
    print(f"\n✅ Romanian User Feedback System test completed!")
    
    return {
        "total_feedback": collection_summary['total_feedback_collected'],
        "average_satisfaction": collection_summary['average_satisfaction'],
        "cultural_accuracy": collection_summary['cultural_accuracy'],
        "language_quality": collection_summary['language_quality'],
        "user_segments": len(collection_summary['user_segments']),
        "regional_coverage": len(collection_summary['regional_distribution']),
        "improvement_suggestions": len(collection_summary['improvement_suggestions']),
        "romanian_insights_generated": True,
        "system_status": "fully_operational"
    }

if __name__ == "__main__":
    asyncio.run(test_romanian_user_feedback_system())

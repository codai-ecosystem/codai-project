"""
Romanian Healthcare AI Assistant - Medical Support with Cultural Sensitivity
============================================================================

A comprehensive healthcare AI assistant designed specifically for the Romanian
healthcare system, integrating medical knowledge with cultural understanding,
regional healthcare practices, and Romanian language medical terminology.

Features:
- Medical diagnosis support with Romanian medical terminology
- Cultural health beliefs and practices integration
- Regional healthcare resource mapping
- Traditional Romanian medicine awareness
- Patient communication in Romanian language
- Healthcare accessibility analysis for rural areas
- Medical emergency assistance with local protocols
- Preventive care recommendations with cultural context

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
import re
from pathlib import Path
from collections import defaultdict, Counter
import uuid

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

class MedicalSpecialty(Enum):
    """Medical specialties in Romanian healthcare"""
    CARDIOLOGIE = "Cardiologie"
    PNEUMOLOGIE = "Pneumologie"
    GASTROENTEROLOGIE = "Gastroenterologie"
    NEUROLOGIE = "Neurologie"
    PSIHIATRIE = "Psihiatrie"
    PEDIATRIE = "Pediatrie"
    GINECOLOGIE = "Ginecologie"
    ORTOPEDIC = "Ortopedic"
    DERMATOLOGIE = "Dermatologie"
    OFTALMOLOGIE = "Oftalmologie"
    ORL = "Oto-Rino-Laringologie"
    MEDICINA_GENERALA = "Medicina Generală"
    MEDICINA_INTERNA = "Medicina Internă"
    CHIRURGIE = "Chirurgie"
    MEDICINĂ_TRADIȚIONALĂ = "Medicină Tradițională"

class SeverityLevel(Enum):
    """Medical condition severity levels"""
    URGENT = "Urgent"
    MODERAT = "Moderat"
    UȘOR = "Ușor"
    PREVENTIV = "Preventiv"
    MONITORIZARE = "Monitorizare"

class RegionHealthcare(Enum):
    """Romanian healthcare regions"""
    BUCUREȘTI = "București"
    CLUJ_NAPOCA = "Cluj-Napoca"
    TIMIȘOARA = "Timișoara"
    IAȘI = "Iași"
    CONSTANȚA = "Constanța"
    CRAIOVA = "Craiova"
    BRAȘOV = "Brașov"
    GALAȚI = "Galați"
    RURAL_MOLDOVA = "Rural Moldova"
    RURAL_TRANSILVANIA = "Rural Transilvania"
    RURAL_MUNTENIA = "Rural Muntenia"
    RURAL_OLTENIA = "Rural Oltenia"

class CulturalHealthBelief(Enum):
    """Traditional Romanian health beliefs"""
    MEDICINA_POPULARA = auto()
    PLANTE_MEDICINALE = auto()
    CREDINTE_RELIGIOASE = auto()
    TRADITII_FAMILIALE = auto()
    REMEDII_NATURALE = auto()
    SUPERSITITII_MEDICALE = auto()
    INFLUENTA_VREMII = auto()
    ALIMENTATIE_TRADITIONALA = auto()

@dataclass
class Symptom:
    """Medical symptom representation"""
    name_romanian: str
    name_english: str
    description: str
    severity: SeverityLevel
    duration: Optional[str] = None
    frequency: Optional[str] = None
    triggers: List[str] = field(default_factory=list)
    associated_symptoms: List[str] = field(default_factory=list)
    cultural_interpretations: List[str] = field(default_factory=list)

@dataclass
class MedicalCondition:
    """Medical condition with Romanian context"""
    condition_id: str
    name_romanian: str
    name_latin: str
    name_english: str
    specialty: MedicalSpecialty
    symptoms: List[Symptom]
    risk_factors: List[str]
    diagnosis_criteria: List[str]
    treatment_options: List[str]
    traditional_remedies: List[str]
    cultural_considerations: List[str]
    prevalence_romania: float
    regional_variations: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Patient:
    """Patient representation with cultural context"""
    patient_id: str
    age: int
    gender: str
    region: RegionHealthcare
    language_preference: str = "română"
    cultural_background: List[CulturalHealthBelief] = field(default_factory=list)
    medical_history: List[str] = field(default_factory=list)
    current_symptoms: List[Symptom] = field(default_factory=list)
    traditional_medicine_use: bool = False
    healthcare_access: str = "urban"  # urban, rural, limited
    insurance_status: str = "public"  # public, private, none

@dataclass
class MedicalAssessment:
    """Medical assessment results"""
    assessment_id: str
    patient_id: str
    timestamp: datetime
    chief_complaint: str
    symptom_analysis: Dict[str, Any]
    possible_conditions: List[Dict[str, Any]]
    urgency_level: SeverityLevel
    recommended_actions: List[str]
    cultural_considerations: List[str]
    traditional_medicine_interactions: List[str]
    specialist_referral: Optional[MedicalSpecialty] = None
    follow_up_recommendations: List[str] = field(default_factory=list)
    educational_resources: List[str] = field(default_factory=list)

@dataclass
class HealthcareResource:
    """Healthcare resource information"""
    resource_id: str
    name: str
    type: str  # hospital, clinic, pharmacy, emergency
    region: RegionHealthcare
    specialties: List[MedicalSpecialty]
    contact_info: Dict[str, str]
    accessibility: Dict[str, Any]
    traditional_medicine_support: bool = False
    cultural_sensitivity_rating: float = 0.0

class RomanianHealthcareAIAssistant:
    """
    Comprehensive Romanian healthcare AI assistant with cultural sensitivity
    and integration of traditional and modern medical knowledge
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the healthcare AI assistant"""
        self.logger = logging.getLogger(__name__)
        
        # Initialize multimodal components
        self.multimodal_engine = RomanianMultimodalEngine()
        self.integration_pipeline = RomanianMultimodalIntegrationPipeline()
        self.cultural_integrator = RomanianCulturalContextIntegrator()
        
        # Medical knowledge base
        self.medical_conditions: Dict[str, MedicalCondition] = {}
        self.symptoms_database: Dict[str, Symptom] = {}
        self.healthcare_resources: Dict[str, HealthcareResource] = {}
        self.patient_assessments: Dict[str, MedicalAssessment] = {}
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize medical knowledge
        self._initialize_medical_knowledge()
        
        # Initialize cultural health beliefs
        self._initialize_cultural_health_beliefs()
        
        # Initialize Romanian medical terminology
        self._initialize_romanian_medical_terms()
        
    def _load_config(self, config_path: Optional[str]) -> Dict:
        """Load configuration for the healthcare AI assistant"""
        default_config = {
            "supported_languages": ["română", "english"],
            "medical_knowledge_sources": ["traditional", "modern", "integrated"],
            "cultural_sensitivity_level": 0.8,
            "emergency_protocols": True,
            "traditional_medicine_integration": True,
            "regional_healthcare_mapping": True,
            "patient_privacy_mode": "strict",
            "assessment_confidence_threshold": 0.7,
            "specialist_referral_threshold": 0.6,
            "emergency_contact_integration": True
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                self.logger.warning(f"Could not load config from {config_path}: {e}")
        
        return default_config
    
    def _initialize_medical_knowledge(self):
        """Initialize comprehensive medical knowledge base"""
        # Common Romanian medical conditions
        self.medical_conditions = {
            "hipertensiune": MedicalCondition(
                condition_id="hypertension_001",
                name_romanian="Hipertensiune arterială",
                name_latin="Hypertensio arterialis",
                name_english="Hypertension",
                specialty=MedicalSpecialty.CARDIOLOGIE,
                symptoms=[
                    Symptom(
                        name_romanian="durere de cap",
                        name_english="headache",
                        description="Durere în zona capului, adesea la tâmple",
                        severity=SeverityLevel.MODERAT
                    ),
                    Symptom(
                        name_romanian="amețeli",
                        name_english="dizziness",
                        description="Senzație de instabilitate sau vertij",
                        severity=SeverityLevel.MODERAT
                    )
                ],
                risk_factors=[
                    "vârsta înaintată", "obezitate", "fumat", "stres", 
                    "alimentație bogată în sare", "sedentarism"
                ],
                diagnosis_criteria=[
                    "tensiune arterială > 140/90 mmHg",
                    "măsurători repetate",
                    "excluderea cauzelor secundare"
                ],
                treatment_options=[
                    "modificări stil de viață", "medicație antihipertensivă",
                    "monitorizare regulată", "dietă hiposalinată"
                ],
                traditional_remedies=[
                    "ceai de păducel", "usturnoi", "ceai de tei",
                    "catină", "exerciții de respirație"
                ],
                cultural_considerations=[
                    "importanța mesei în familie românească",
                    "tradițiile culinare sărate",
                    "atitudinea față de medicația cronică"
                ],
                prevalence_romania=0.45
            ),
            "diabet": MedicalCondition(
                condition_id="diabetes_001",
                name_romanian="Diabet zaharat",
                name_latin="Diabetes mellitus",
                name_english="Diabetes",
                specialty=MedicalSpecialty.MEDICINA_INTERNA,
                symptoms=[
                    Symptom(
                        name_romanian="sete excesivă",
                        name_english="excessive thirst",
                        description="Polidipsie - nevoia constantă de a bea lichide",
                        severity=SeverityLevel.MODERAT
                    ),
                    Symptom(
                        name_romanian="urinare frecventă",
                        name_english="frequent urination",
                        description="Poliurie - eliminarea frecventă de urină",
                        severity=SeverityLevel.MODERAT
                    )
                ],
                risk_factors=[
                    "obezitate", "istoric familial", "vârsta > 45 ani",
                    "stil de viață sedentar", "dieta bogată în zahăr"
                ],
                diagnosis_criteria=[
                    "glicemia la jeun > 126 mg/dl",
                    "HbA1c > 6.5%",
                    "test de toleranță la glucoză"
                ],
                treatment_options=[
                    "dietă diabetică", "exerciții fizice",
                    "medicația antidiabetică", "monitorizare glicemie"
                ],
                traditional_remedies=[
                    "ceai de coada calului", "fasole verde",
                    "cicoare", "nuci verzi", "păpădie"
                ],
                cultural_considerations=[
                    "tradițiile culinare dulci românești",
                    "sărbătorile cu mâncăruri tradiționale",
                    "atitudinea față de restricțiile dietetice"
                ],
                prevalence_romania=0.11
            ),
            "raceala": MedicalCondition(
                condition_id="cold_001",
                name_romanian="Răceală comună",
                name_latin="Rhinitis acuta",
                name_english="Common cold",
                specialty=MedicalSpecialty.MEDICINA_GENERALA,
                symptoms=[
                    Symptom(
                        name_romanian="nas înfundat",
                        name_english="stuffy nose",
                        description="Congestie nazală cu dificultate în respirație",
                        severity=SeverityLevel.UȘOR
                    ),
                    Symptom(
                        name_romanian="tuse",
                        name_english="cough",
                        description="Tuse seacă sau productivă",
                        severity=SeverityLevel.UȘOR
                    )
                ],
                risk_factors=[
                    "expunerea la frig", "stress", "oboseală",
                    "contact cu persoane bolnave", "imunitate scăzută"
                ],
                diagnosis_criteria=[
                    "simptome caracteristice", "debut treptat",
                    "absența febrei mari", "durata < 10 zile"
                ],
                treatment_options=[
                    "repaus", "hidratare", "medicamente simptomatice",
                    "vitamine", "miere și ceai"
                ],
                traditional_remedies=[
                    "ceai de tei cu miere", "sirop de ceapă",
                    "inhalații cu camomila", "cataplasme cu muștarul",
                    "țuică cu piper", "ceai de soc"
                ],
                cultural_considerations=[
                    "credința în efectul frigului",
                    "remediile bunicilor",
                    "importanța căldurii și odihnei"
                ],
                prevalence_romania=0.85
            )
        }
    
    def _initialize_cultural_health_beliefs(self):
        """Initialize Romanian cultural health beliefs and practices"""
        self.cultural_health_beliefs = {
            CulturalHealthBelief.MEDICINA_POPULARA: {
                "description": "Credința în remediile tradiționale transmise din generație în generație",
                "practices": [
                    "utilizarea plantelor medicinale",
                    "aplicarea cataplasemelor",
                    "masajul tradițional",
                    "vindecarea prin rugăciune"
                ],
                "prevalence_by_region": {
                    RegionHealthcare.RURAL_MOLDOVA: 0.8,
                    RegionHealthcare.RURAL_TRANSILVANIA: 0.7,
                    RegionHealthcare.BUCUREȘTI: 0.3,
                    RegionHealthcare.CLUJ_NAPOCA: 0.4
                }
            },
            CulturalHealthBelief.PLANTE_MEDICINALE: {
                "description": "Folosirea plantelor autohtone pentru tratament",
                "practices": [
                    "ceaiuri din plante medicinale",
                    "tincturi și extracte",
                    "inhalații cu vapori de plante",
                    "băi cu plante aromate"
                ],
                "common_plants": [
                    "coada calului", "păpădia", "cicoarea",
                    "câtina", "măceșul", "tei", "soc", "mușețel"
                ]
            },
            CulturalHealthBelief.CREDINTE_RELIGIOASE: {
                "description": "Integrarea credinței religioase în procesul de vindecare",
                "practices": [
                    "rugăciuni pentru sănătate",
                    "utilizarea apei sfințite",
                    "pelerinaje la mănăstiri",
                    "consultarea duhovnicilor"
                ],
                "significance": "Aspectul spiritual al vindecării"
            },
            CulturalHealthBelief.ALIMENTATIE_TRADITIONALA: {
                "description": "Credința în puterea vindecătoare a alimentelor tradiționale",
                "healing_foods": [
                    "supele de găină pentru răceală",
                    "mierea pentru tuse",
                    "usturoiul pentru infecții",
                    "varza murată pentru digestie",
                    "țuica pentru dezinfecție"
                ]
            }
        }
    
    def _initialize_romanian_medical_terms(self):
        """Initialize Romanian medical terminology dictionary"""
        self.medical_terminology = {
            # Body parts
            "cap": "head",
            "gât": "throat",
            "piept": "chest", 
            "abdomen": "abdomen",
            "stomac": "stomach",
            "ficăt": "liver",
            "rinichi": "kidneys",
            "inimă": "heart",
            "plămâni": "lungs",
            "oase": "bones",
            "mușchi": "muscles",
            "piele": "skin",
            
            # Symptoms
            "durere": "pain",
            "febră": "fever",
            "tuse": "cough",
            "amețeală": "dizziness",
            "grețuri": "nausea",
            "vărsături": "vomiting",
            "diaree": "diarrhea",
            "constipație": "constipation",
            "oboseală": "fatigue",
            "slăbiciune": "weakness",
            "palpitații": "palpitations",
            "respirație grea": "shortness of breath",
            
            # Common conditions
            "răceală": "cold",
            "gripă": "flu",
            "angină": "tonsillitis",
            "pneumonie": "pneumonia",
            "astm": "asthma",
            "alergii": "allergies",
            "migrene": "migraine",
            "reumatism": "rheumatism",
            "artrită": "arthritis",
            "depresie": "depression",
            "anxietate": "anxiety",
            "insomnie": "insomnia"
        }
    
    async def assess_patient_symptoms(
        self, 
        patient: Patient,
        chief_complaint: str,
        additional_context: Optional[str] = None
    ) -> MedicalAssessment:
        """Assess patient symptoms with cultural sensitivity"""
        try:
            # Create multimodal input for assessment
            assessment_text = f"""
            Evaluare medicală pentru pacient din {patient.region.value}.
            Vârsta: {patient.age} ani, Sex: {patient.gender}
            Plângerea principală: {chief_complaint}
            Istoric medical: {', '.join(patient.medical_history)}
            Simptome actuale: {', '.join([s.name_romanian for s in patient.current_symptoms])}
            Context cultural: {', '.join([b.name for b in patient.cultural_background])}
            Acces la servicii medicale: {patient.healthcare_access}
            Context adițional: {additional_context or 'Nu'}
            """
            
            multimodal_input = MultimodalInput(
                text_content=assessment_text,
                metadata={
                    "patient_id": patient.patient_id,
                    "assessment_type": "symptom_evaluation",
                    "region": patient.region.value,
                    "cultural_context": [b.name for b in patient.cultural_background],
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Process through integration pipeline
            config = IntegrationConfig(
                processing_mode="medical_assessment",
                cultural_sensitivity=self.config["cultural_sensitivity_level"],
                output_format="structured"
            )
            
            multimodal_result = await self.integration_pipeline.process_content(
                multimodal_input, config
            )
            
            # Perform symptom analysis
            symptom_analysis = await self._analyze_symptoms(patient, chief_complaint)
            
            # Identify possible conditions
            possible_conditions = await self._identify_possible_conditions(
                patient, symptom_analysis
            )
            
            # Assess urgency level
            urgency_level = await self._assess_urgency(patient, symptom_analysis)
            
            # Generate recommendations
            recommendations = await self._generate_medical_recommendations(
                patient, symptom_analysis, possible_conditions, urgency_level
            )
            
            # Consider cultural factors
            cultural_considerations = await self._assess_cultural_factors(
                patient, possible_conditions
            )
            
            # Check traditional medicine interactions
            traditional_interactions = await self._check_traditional_medicine_interactions(
                patient, possible_conditions
            )
            
            # Determine specialist referral need
            specialist_referral = await self._determine_specialist_referral(
                possible_conditions, urgency_level
            )
            
            # Generate follow-up recommendations
            follow_up = await self._generate_follow_up_recommendations(
                patient, possible_conditions, urgency_level
            )
            
            # Provide educational resources
            educational_resources = await self._provide_educational_resources(
                patient, possible_conditions
            )
            
            # Create assessment
            assessment = MedicalAssessment(
                assessment_id=str(uuid.uuid4()),
                patient_id=patient.patient_id,
                timestamp=datetime.now(),
                chief_complaint=chief_complaint,
                symptom_analysis=symptom_analysis,
                possible_conditions=possible_conditions,
                urgency_level=urgency_level,
                recommended_actions=recommendations,
                cultural_considerations=cultural_considerations,
                traditional_medicine_interactions=traditional_interactions,
                specialist_referral=specialist_referral,
                follow_up_recommendations=follow_up,
                educational_resources=educational_resources
            )
            
            # Store assessment
            self.patient_assessments[assessment.assessment_id] = assessment
            
            return assessment
            
        except Exception as e:
            self.logger.error(f"Error assessing patient symptoms: {e}")
            raise
    
    async def _analyze_symptoms(
        self, 
        patient: Patient, 
        chief_complaint: str
    ) -> Dict[str, Any]:
        """Analyze patient symptoms"""
        try:
            analysis = {
                "primary_symptoms": [],
                "secondary_symptoms": [],
                "symptom_clusters": [],
                "duration_analysis": {},
                "severity_assessment": {},
                "pattern_recognition": {},
                "red_flags": []
            }
            
            # Analyze each reported symptom
            for symptom in patient.current_symptoms:
                symptom_data = {
                    "name": symptom.name_romanian,
                    "severity": symptom.severity.value,
                    "duration": symptom.duration,
                    "frequency": symptom.frequency,
                    "triggers": symptom.triggers,
                    "associated_symptoms": symptom.associated_symptoms
                }
                
                if symptom.severity in [SeverityLevel.URGENT, SeverityLevel.MODERAT]:
                    analysis["primary_symptoms"].append(symptom_data)
                else:
                    analysis["secondary_symptoms"].append(symptom_data)
                
                # Check for red flags
                if symptom.severity == SeverityLevel.URGENT:
                    analysis["red_flags"].append({
                        "symptom": symptom.name_romanian,
                        "concern": "Necesită evaluare urgentă",
                        "action": "Consultație medicală imediată"
                    })
            
            # Identify symptom clusters
            analysis["symptom_clusters"] = self._identify_symptom_clusters(
                patient.current_symptoms
            )
            
            # Analyze symptom patterns
            analysis["pattern_recognition"] = self._analyze_symptom_patterns(
                patient.current_symptoms
            )
            
            # Consider patient demographics
            analysis["demographic_factors"] = {
                "age_relevance": self._assess_age_relevance(patient.age, patient.current_symptoms),
                "gender_considerations": self._assess_gender_factors(patient.gender, patient.current_symptoms),
                "regional_patterns": self._assess_regional_patterns(patient.region, patient.current_symptoms)
            }
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing symptoms: {e}")
            return {}
    
    async def _identify_possible_conditions(
        self, 
        patient: Patient, 
        symptom_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Identify possible medical conditions"""
        try:
            possible_conditions = []
            
            # Get symptom names for matching
            reported_symptoms = [s.name_romanian.lower() for s in patient.current_symptoms]
            
            # Check each condition in knowledge base
            for condition_id, condition in self.medical_conditions.items():
                match_score = 0.0
                matching_symptoms = []
                
                # Calculate symptom match score
                for condition_symptom in condition.symptoms:
                    for reported_symptom in reported_symptoms:
                        if condition_symptom.name_romanian.lower() in reported_symptom:
                            match_score += 1.0
                            matching_symptoms.append(condition_symptom.name_romanian)
                
                # Normalize score
                if condition.symptoms:
                    match_score = match_score / len(condition.symptoms)
                
                # Consider if match is significant
                if match_score > 0.3:  # At least 30% symptom match
                    # Adjust score based on patient factors
                    adjusted_score = self._adjust_condition_probability(
                        condition, patient, match_score
                    )
                    
                    condition_data = {
                        "condition_id": condition.condition_id,
                        "name_romanian": condition.name_romanian,
                        "name_english": condition.name_english,
                        "specialty": condition.specialty.value,
                        "probability_score": adjusted_score,
                        "matching_symptoms": matching_symptoms,
                        "risk_factors_present": self._assess_risk_factors(condition, patient),
                        "cultural_relevance": self._assess_cultural_relevance(condition, patient),
                        "traditional_remedies_available": condition.traditional_remedies
                    }
                    
                    possible_conditions.append(condition_data)
            
            # Sort by probability score
            possible_conditions.sort(key=lambda x: x["probability_score"], reverse=True)
            
            # Return top 5 most likely conditions
            return possible_conditions[:5]
            
        except Exception as e:
            self.logger.error(f"Error identifying possible conditions: {e}")
            return []
    
    async def _assess_urgency(
        self, 
        patient: Patient, 
        symptom_analysis: Dict[str, Any]
    ) -> SeverityLevel:
        """Assess urgency level of medical situation"""
        try:
            # Check for red flags
            if symptom_analysis.get("red_flags"):
                return SeverityLevel.URGENT
            
            # Check for urgent symptoms
            urgent_symptoms = [
                "durere în piept", "dificultate respirație", "durere abdominală severă",
                "febră foarte mare", "convulsii", "pierderea cunoștinței",
                "sângerare abundentă", "durere de cap severă"
            ]
            
            for symptom in patient.current_symptoms:
                for urgent_symptom in urgent_symptoms:
                    if urgent_symptom in symptom.name_romanian.lower():
                        return SeverityLevel.URGENT
                
                if symptom.severity == SeverityLevel.URGENT:
                    return SeverityLevel.URGENT
            
            # Check for moderate symptoms
            moderate_count = sum(
                1 for s in patient.current_symptoms 
                if s.severity == SeverityLevel.MODERAT
            )
            
            if moderate_count >= 2:
                return SeverityLevel.MODERAT
            elif moderate_count == 1:
                return SeverityLevel.UȘOR
            
            return SeverityLevel.PREVENTIV
            
        except Exception as e:
            self.logger.error(f"Error assessing urgency: {e}")
            return SeverityLevel.UȘOR
    
    async def _generate_medical_recommendations(
        self, 
        patient: Patient,
        symptom_analysis: Dict[str, Any],
        possible_conditions: List[Dict[str, Any]],
        urgency_level: SeverityLevel
    ) -> List[str]:
        """Generate medical recommendations"""
        try:
            recommendations = []
            
            # Urgency-based recommendations
            if urgency_level == SeverityLevel.URGENT:
                recommendations.extend([
                    "Solicitați asistență medicală de urgență imediat",
                    "Apelați 112 sau mergeți la cea mai apropiată unitate de primiri urgențe",
                    "Nu amânați consultația medicală"
                ])
            elif urgency_level == SeverityLevel.MODERAT:
                recommendations.extend([
                    "Programați o consultație medicală în următoarele 24-48 de ore",
                    "Monitorizați atent evoluția simptomelor",
                    "Contactați medicul de familie pentru sfaturi"
                ])
            else:
                recommendations.extend([
                    "Considerați o consultație medicală de rutină",
                    "Monitorizați simptomele și notați orice schimbări",
                    "Aplicați măsuri de autoîngrijire corespunzătoare"
                ])
            
            # Condition-specific recommendations
            if possible_conditions:
                top_condition = possible_conditions[0]
                condition = self.medical_conditions.get(
                    top_condition["condition_id"].split("_")[0]
                )
                
                if condition:
                    recommendations.extend([
                        f"Considerați posibilitatea de {condition.name_romanian.lower()}",
                        f"Specialitatea recomandată: {condition.specialty.value}",
                    ])
                    
                    # Add treatment recommendations
                    if condition.treatment_options:
                        recommendations.append(
                            f"Opțiuni de tratament: {', '.join(condition.treatment_options[:2])}"
                        )
            
            # Lifestyle recommendations
            recommendations.extend([
                "Mențineți o hidratare adecvată",
                "Asigurați-vă că obțineți suficient repaus",
                "Evitați factorii de stres cunoscuți"
            ])
            
            # Cultural and regional recommendations
            if patient.healthcare_access == "rural":
                recommendations.append(
                    "Contactați dispensarul medical local sau medicul de familie din comună"
                )
            
            if patient.traditional_medicine_use:
                recommendations.append(
                    "Informați medicul despre orice remedii tradiționale folosite"
                )
            
            return recommendations[:8]  # Limit to 8 recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return []
    
    async def _assess_cultural_factors(
        self, 
        patient: Patient, 
        possible_conditions: List[Dict[str, Any]]
    ) -> List[str]:
        """Assess cultural factors relevant to diagnosis and treatment"""
        try:
            cultural_factors = []
            
            # Patient's cultural background
            for belief in patient.cultural_background:
                if belief == CulturalHealthBelief.MEDICINA_POPULARA:
                    cultural_factors.append(
                        "Pacientul poate prefera remediile tradiționale - explicați beneficiile tratamentului modern"
                    )
                elif belief == CulturalHealthBelief.CREDINTE_RELIGIOASE:
                    cultural_factors.append(
                        "Considerați aspectele spirituale ale vindecării și respectați credințele religioase"
                    )
                elif belief == CulturalHealthBelief.PLANTE_MEDICINALE:
                    cultural_factors.append(
                        "Discutați interacțiunile posibile între plantele medicinale și medicația prescrisă"
                    )
            
            # Regional considerations
            if patient.region in [RegionHealthcare.RURAL_MOLDOVA, RegionHealthcare.RURAL_TRANSILVANIA]:
                cultural_factors.append(
                    "În zonele rurale, accesul la specialiști poate fi limitat - considerați telemedicina"
                )
            
            # Language preferences
            if patient.language_preference == "română":
                cultural_factors.append(
                    "Asigurați-vă că toate explicațiile sunt date în română, cu termeni medicali explicați simplu"
                )
            
            # Family involvement
            cultural_factors.append(
                "Familia joacă un rol important în deciziile medicale românești - implicați familia în discuții"
            )
            
            # Condition-specific cultural factors
            if possible_conditions:
                top_condition = possible_conditions[0]
                condition_name = top_condition["condition_id"].split("_")[0]
                condition = self.medical_conditions.get(condition_name)
                
                if condition and condition.cultural_considerations:
                    cultural_factors.extend(condition.cultural_considerations)
            
            return cultural_factors
            
        except Exception as e:
            self.logger.error(f"Error assessing cultural factors: {e}")
            return []
    
    async def _check_traditional_medicine_interactions(
        self, 
        patient: Patient, 
        possible_conditions: List[Dict[str, Any]]
    ) -> List[str]:
        """Check for traditional medicine interactions"""
        try:
            interactions = []
            
            if not patient.traditional_medicine_use:
                return interactions
            
            # Common traditional remedies and their interactions
            traditional_interactions = {
                "ceai de păducel": [
                    "Poate interacționa cu medicația pentru inimă",
                    "Poate amplifica efectele sedativelor"
                ],
                "usturnoi": [
                    "Poate interacționa cu anticoagulantele",
                    "Poate afecta nivelurile zahărului din sânge"
                ],
                "ceai de tei": [
                    "Poate avea efecte sedative suplimentare",
                    "Poate interacționa cu medicația pentru anxietate"
                ],
                "cicoare": [
                    "Poate afecta absorbția medicamentelor",
                    "Poate interacționa cu medicația pentru diabet"
                ]
            }
            
            # Check for potential interactions
            for condition_data in possible_conditions:
                condition_name = condition_data["condition_id"].split("_")[0]
                condition = self.medical_conditions.get(condition_name)
                
                if condition and condition.traditional_remedies:
                    for remedy in condition.traditional_remedies:
                        if remedy in traditional_interactions:
                            interactions.extend([
                                f"Remediul tradițional '{remedy}': {interaction}"
                                for interaction in traditional_interactions[remedy]
                            ])
            
            # General advice
            if interactions:
                interactions.append(
                    "Informați întotdeauna medicul despre toate remediile tradiționale folosite"
                )
            
            return interactions
            
        except Exception as e:
            self.logger.error(f"Error checking traditional medicine interactions: {e}")
            return []
    
    async def _determine_specialist_referral(
        self, 
        possible_conditions: List[Dict[str, Any]], 
        urgency_level: SeverityLevel
    ) -> Optional[MedicalSpecialty]:
        """Determine if specialist referral is needed"""
        try:
            if urgency_level == SeverityLevel.URGENT:
                return None  # Emergency services handle urgent cases
            
            if not possible_conditions:
                return None
            
            # Get the most likely condition
            top_condition = possible_conditions[0]
            
            # If probability is high enough, recommend specialist
            if top_condition["probability_score"] > self.config["specialist_referral_threshold"]:
                specialty_name = top_condition["specialty"]
                
                # Find matching specialty enum
                for specialty in MedicalSpecialty:
                    if specialty.value == specialty_name:
                        return specialty
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error determining specialist referral: {e}")
            return None
    
    async def _generate_follow_up_recommendations(
        self, 
        patient: Patient,
        possible_conditions: List[Dict[str, Any]],
        urgency_level: SeverityLevel
    ) -> List[str]:
        """Generate follow-up recommendations"""
        try:
            follow_up = []
            
            # Urgency-based follow-up
            if urgency_level == SeverityLevel.URGENT:
                follow_up.extend([
                    "Urmați instrucțiunile personalului medical de urgență",
                    "Continuați tratamentul prescris conform indicațiilor"
                ])
            elif urgency_level == SeverityLevel.MODERAT:
                follow_up.extend([
                    "Reveniți pentru reevaluare în 3-5 zile",
                    "Contactați medicul dacă simptomele se agravează"
                ])
            else:
                follow_up.extend([
                    "Monitorizați simptomele timp de 1-2 săptămâni",
                    "Programați o consultație dacă simptomele persistă"
                ])
            
            # Condition-specific follow-up
            if possible_conditions:
                condition_name = possible_conditions[0]["condition_id"].split("_")[0]
                
                if condition_name == "hipertensiune":
                    follow_up.extend([
                        "Monitorizați tensiunea arterială regulat",
                        "Continuați modificările stilului de viață"
                    ])
                elif condition_name == "diabet":
                    follow_up.extend([
                        "Monitorizați glicemia conform programului",
                        "Respectați dieta diabetică prescrisă"
                    ])
                elif condition_name == "raceala":
                    follow_up.extend([
                        "Continuați tratamentul simptomatic",
                        "Reveniți dacă simptomele durează > 10 zile"
                    ])
            
            # General health maintenance
            follow_up.extend([
                "Mențineți un stil de viață sănătos",
                "Programați controale medicale regulate"
            ])
            
            return follow_up
            
        except Exception as e:
            self.logger.error(f"Error generating follow-up recommendations: {e}")
            return []
    
    async def _provide_educational_resources(
        self, 
        patient: Patient,
        possible_conditions: List[Dict[str, Any]]
    ) -> List[str]:
        """Provide educational resources in Romanian"""
        try:
            resources = []
            
            # General health resources
            resources.extend([
                "Ghid de sănătate - Ministerul Sănătății România",
                "Informații medicale în română - medicaldirect.ro",
                "Educație pentru sănătate - sanatateverde.ro"
            ])
            
            # Condition-specific resources
            if possible_conditions:
                condition_name = possible_conditions[0]["condition_id"].split("_")[0]
                
                if condition_name == "hipertensiune":
                    resources.extend([
                        "Ghid pentru hipertensiune - Societatea Română de Cardiologie",
                        "Dieta pentru hipertensiune - resurse nutriție",
                        "Exerciții pentru control tensiune arterială"
                    ])
                elif condition_name == "diabet":
                    resources.extend([
                        "Asociația Diabeticilor din România",
                        "Ghid diabetic - alimentație și exerciții",
                        "Monitorizare glicemie - instrucțiuni"
                    ])
                elif condition_name == "raceala":
                    resources.extend([
                        "Prevenirea răcelii și gripei",
                        "Remedii naturale pentru răceală",
                        "Când să solicitați ajutor medical"
                    ])
            
            # Regional resources
            if patient.region == RegionHealthcare.BUCUREȘTI:
                resources.append("Ghid spitale și clinici București")
            elif patient.region == RegionHealthcare.CLUJ_NAPOCA:
                resources.append("Servicii medicale Cluj-Napoca")
            
            # Traditional medicine resources
            if patient.traditional_medicine_use:
                resources.extend([
                    "Ghid plante medicinale românești",
                    "Siguranța remediilor tradiționale",
                    "Interacțiuni medicină tradițională-modernă"
                ])
            
            return resources
            
        except Exception as e:
            self.logger.error(f"Error providing educational resources: {e}")
            return []
    
    def _identify_symptom_clusters(self, symptoms: List[Symptom]) -> List[Dict[str, Any]]:
        """Identify clusters of related symptoms"""
        clusters = []
        
        # Respiratory cluster
        respiratory_symptoms = ["tuse", "respirație grea", "nas înfundat", "durere gât"]
        respiratory_cluster = [
            s for s in symptoms 
            if any(resp in s.name_romanian.lower() for resp in respiratory_symptoms)
        ]
        
        if respiratory_cluster:
            clusters.append({
                "cluster_type": "respirator",
                "symptoms": [s.name_romanian for s in respiratory_cluster],
                "significance": "Posibilă afecțiune respiratorie"
            })
        
        # Cardiovascular cluster
        cardio_symptoms = ["durere piept", "palpitații", "amețeală", "oboseală"]
        cardio_cluster = [
            s for s in symptoms
            if any(cardio in s.name_romanian.lower() for cardio in cardio_symptoms)
        ]
        
        if cardio_cluster:
            clusters.append({
                "cluster_type": "cardiovascular",
                "symptoms": [s.name_romanian for s in cardio_cluster],
                "significance": "Posibilă afecțiune cardiovasculară"
            })
        
        # Gastrointestinal cluster
        gi_symptoms = ["durere abdomen", "grețuri", "vărsături", "diaree", "constipație"]
        gi_cluster = [
            s for s in symptoms
            if any(gi in s.name_romanian.lower() for gi in gi_symptoms)
        ]
        
        if gi_cluster:
            clusters.append({
                "cluster_type": "gastrointestinal",
                "symptoms": [s.name_romanian for s in gi_cluster],
                "significance": "Posibilă afecțiune gastrointestinală"
            })
        
        return clusters
    
    def _analyze_symptom_patterns(self, symptoms: List[Symptom]) -> Dict[str, Any]:
        """Analyze temporal and severity patterns in symptoms"""
        patterns = {
            "severity_distribution": Counter(),
            "duration_patterns": {},
            "temporal_relationships": [],
            "progression_indicators": []
        }
        
        # Analyze severity distribution
        for symptom in symptoms:
            patterns["severity_distribution"][symptom.severity.value] += 1
        
        # Analyze duration patterns
        durations = [s.duration for s in symptoms if s.duration]
        if durations:
            patterns["duration_patterns"] = {
                "acute": sum(1 for d in durations if "zi" in d or "ore" in d),
                "chronic": sum(1 for d in durations if "săptămân" in d or "lun" in d),
                "unclear": len(durations) - patterns["duration_patterns"].get("acute", 0) - patterns["duration_patterns"].get("chronic", 0)
            }
        
        return patterns
    
    def _assess_age_relevance(self, age: int, symptoms: List[Symptom]) -> Dict[str, Any]:
        """Assess age-related relevance of symptoms"""
        age_factors = {
            "age_group": "adult",
            "age_related_risks": [],
            "age_specific_considerations": []
        }
        
        if age < 18:
            age_factors["age_group"] = "pediatric"
            age_factors["age_specific_considerations"] = [
                "Simptomele pot fi diferite la copii",
                "Necesară supraveghere parentală"
            ]
        elif age > 65:
            age_factors["age_group"] = "geriatric"
            age_factors["age_related_risks"] = [
                "risc cardiovascular crescut",
                "multiple comorbidități posibile",
                "metabolism medicamentos modificat"
            ]
            age_factors["age_specific_considerations"] = [
                "Monitorizare atentă pentru complicații",
                "Posibile interacțiuni medicamentoase"
            ]
        
        return age_factors
    
    def _assess_gender_factors(self, gender: str, symptoms: List[Symptom]) -> List[str]:
        """Assess gender-specific factors"""
        factors = []
        
        if gender.lower() in ["feminin", "female", "f"]:
            factors.extend([
                "Considerați ciclul menstrual în evaluarea simptomelor",
                "Posibile aspecte ginecologice relevante"
            ])
        elif gender.lower() in ["masculin", "male", "m"]:
            factors.extend([
                "Evaluați factori de risc cardiovascular specifici bărbaților",
                "Considerați aspecte urologice relevante"
            ])
        
        return factors
    
    def _assess_regional_patterns(self, region: RegionHealthcare, symptoms: List[Symptom]) -> List[str]:
        """Assess regional health patterns"""
        patterns = []
        
        if "RURAL" in region.name:
            patterns.extend([
                "Acces limitat la servicii medicale specializate",
                "Posibilă utilizare frecventă a remediilor tradiționale",
                "Necesitate de telemedicină sau consultații la distanță"
            ])
        elif region == RegionHealthcare.BUCUREȘTI:
            patterns.extend([
                "Acces facil la specialiști și investigații",
                "Posibil stress urban ca factor contribuitor",
                "Poluare urbană ca factor de risc"
            ])
        
        return patterns
    
    def _adjust_condition_probability(
        self, 
        condition: MedicalCondition, 
        patient: Patient, 
        base_score: float
    ) -> float:
        """Adjust condition probability based on patient factors"""
        adjusted_score = base_score
        
        # Age adjustments
        if patient.age > 50 and condition.condition_id == "hypertension_001":
            adjusted_score *= 1.3  # Higher probability with age
        elif patient.age < 30 and condition.condition_id == "diabetes_001":
            adjusted_score *= 0.7  # Lower probability in young adults
        
        # Regional adjustments based on prevalence
        if hasattr(condition, 'prevalence_romania'):
            prevalence_factor = condition.prevalence_romania
            adjusted_score *= (0.5 + prevalence_factor)
        
        # Cultural factors
        if patient.traditional_medicine_use and condition.traditional_remedies:
            adjusted_score *= 1.1  # Slight increase if traditional remedies exist
        
        return min(1.0, adjusted_score)
    
    def _assess_risk_factors(self, condition: MedicalCondition, patient: Patient) -> List[str]:
        """Assess which risk factors are present for the patient"""
        present_factors = []
        
        # Age-based risk factors
        if "vârsta înaintată" in condition.risk_factors and patient.age > 60:
            present_factors.append("vârsta înaintată")
        
        # This would be expanded with patient history analysis
        # For now, returning potential matches based on common patterns
        common_risk_factors = ["stres", "fumat", "sedentarism", "obezitate"]
        for factor in condition.risk_factors:
            if factor in common_risk_factors:
                present_factors.append(factor)
        
        return present_factors
    
    def _assess_cultural_relevance(self, condition: MedicalCondition, patient: Patient) -> float:
        """Assess cultural relevance of condition"""
        relevance = 0.5  # Base relevance
        
        # Check if condition has traditional remedies (culturally relevant)
        if condition.traditional_remedies:
            relevance += 0.2
        
        # Check if patient uses traditional medicine
        if patient.traditional_medicine_use:
            relevance += 0.1
        
        # Regional relevance
        if "RURAL" in patient.region.name and condition.traditional_remedies:
            relevance += 0.1
        
        return min(1.0, relevance)

# Example usage and testing
async def main():
    """Example usage of the Romanian Healthcare AI Assistant"""
    
    # Initialize the assistant
    assistant = RomanianHealthcareAIAssistant()
    
    # Wait for initialization
    await asyncio.sleep(1)
    
    print("🏥 Starting Romanian Healthcare AI Assistant Demo")
    
    # Create sample patient
    patient = Patient(
        patient_id="patient_001",
        age=45,
        gender="masculin",
        region=RegionHealthcare.CLUJ_NAPOCA,
        language_preference="română",
        cultural_background=[
            CulturalHealthBelief.PLANTE_MEDICINALE,
            CulturalHealthBelief.MEDICINA_POPULARA
        ],
        medical_history=["hipertensiune familială", "fumat ocazional"],
        current_symptoms=[
            Symptom(
                name_romanian="durere de cap",
                name_english="headache",
                description="Durere persistentă în zona tâmplelor",
                severity=SeverityLevel.MODERAT,
                duration="3 zile",
                frequency="zilnic dimineața"
            ),
            Symptom(
                name_romanian="amețeli",
                name_english="dizziness",
                description="Senzație de instabilitate când se ridică",
                severity=SeverityLevel.UȘOR,
                duration="2 zile",
                frequency="ocazional"
            )
        ],
        traditional_medicine_use=True,
        healthcare_access="urban"
    )
    
    # Perform medical assessment
    print(f"\n🔍 Performing medical assessment for patient {patient.patient_id}")
    print(f"   Age: {patient.age}, Gender: {patient.gender}")
    print(f"   Region: {patient.region.value}")
    print(f"   Chief complaint: Durere de cap și amețeli")
    
    assessment = await assistant.assess_patient_symptoms(
        patient,
        "Durere de cap și amețeli de 3 zile, mai ales dimineața când mă ridic din pat",
        "Pacientul menționează că a avut stress recent la locul de muncă"
    )
    
    print(f"\n📋 Assessment Results:")
    print(f"   Assessment ID: {assessment.assessment_id}")
    print(f"   Urgency Level: {assessment.urgency_level.value}")
    print(f"   Primary Symptoms Analyzed: {len(assessment.symptom_analysis.get('primary_symptoms', []))}")
    print(f"   Possible Conditions: {len(assessment.possible_conditions)}")
    
    # Show top condition
    if assessment.possible_conditions:
        top_condition = assessment.possible_conditions[0]
        print(f"\n🎯 Most Likely Condition:")
        print(f"   Name: {top_condition['name_romanian']}")
        print(f"   Probability: {top_condition['probability_score']:.2f}")
        print(f"   Specialty: {top_condition['specialty']}")
        print(f"   Matching Symptoms: {', '.join(top_condition['matching_symptoms'])}")
    
    # Show recommendations
    print(f"\n💡 Medical Recommendations:")
    for i, rec in enumerate(assessment.recommended_actions[:4], 1):
        print(f"   {i}. {rec}")
    
    # Show cultural considerations
    if assessment.cultural_considerations:
        print(f"\n🏛️ Cultural Considerations:")
        for i, consideration in enumerate(assessment.cultural_considerations[:3], 1):
            print(f"   {i}. {consideration}")
    
    # Show traditional medicine interactions
    if assessment.traditional_medicine_interactions:
        print(f"\n🌿 Traditional Medicine Interactions:")
        for i, interaction in enumerate(assessment.traditional_medicine_interactions[:2], 1):
            print(f"   {i}. {interaction}")
    
    # Show specialist referral
    if assessment.specialist_referral:
        print(f"\n👨‍⚕️ Specialist Referral Recommended:")
        print(f"   Specialty: {assessment.specialist_referral.value}")
    
    # Show follow-up recommendations
    if assessment.follow_up_recommendations:
        print(f"\n📅 Follow-up Recommendations:")
        for i, follow_up in enumerate(assessment.follow_up_recommendations[:3], 1):
            print(f"   {i}. {follow_up}")
    
    # Show educational resources
    if assessment.educational_resources:
        print(f"\n📚 Educational Resources:")
        for i, resource in enumerate(assessment.educational_resources[:3], 1):
            print(f"   {i}. {resource}")
    
    # Test with rural patient
    print(f"\n\n🚜 Testing with Rural Patient...")
    
    rural_patient = Patient(
        patient_id="patient_002",
        age=65,
        gender="feminin",
        region=RegionHealthcare.RURAL_MOLDOVA,
        language_preference="română",
        cultural_background=[
            CulturalHealthBelief.MEDICINA_POPULARA,
            CulturalHealthBelief.CREDINTE_RELIGIOASE,
            CulturalHealthBelief.PLANTE_MEDICINALE
        ],
        medical_history=["diabet tip 2", "hipertensiune"],
        current_symptoms=[
            Symptom(
                name_romanian="sete excesivă",
                name_english="excessive thirst",
                description="Sete constantă, beau multă apă",
                severity=SeverityLevel.MODERAT,
                duration="1 săptămână"
            ),
            Symptom(
                name_romanian="urinare frecventă",
                name_english="frequent urination",
                description="Merg des la toaletă, mai ales noaptea",
                severity=SeverityLevel.MODERAT,
                duration="10 zile"
            )
        ],
        traditional_medicine_use=True,
        healthcare_access="rural"
    )
    
    rural_assessment = await assistant.assess_patient_symptoms(
        rural_patient,
        "Am sete multă și urinez des, mai ales noaptea. Am diabet și iau medicamentul dar nu mai am pastile de 3 zile",
        "Pacientă din mediul rural, folosește și ceai de coada calului pentru diabet"
    )
    
    print(f"\n📋 Rural Patient Assessment:")
    print(f"   Urgency Level: {rural_assessment.urgency_level.value}")
    
    if rural_assessment.possible_conditions:
        print(f"   Top Condition: {rural_assessment.possible_conditions[0]['name_romanian']}")
        print(f"   Probability: {rural_assessment.possible_conditions[0]['probability_score']:.2f}")
    
    print(f"\n💡 Key Rural Recommendations:")
    for i, rec in enumerate(rural_assessment.recommended_actions[:3], 1):
        print(f"   {i}. {rec}")
    
    print(f"\n🏛️ Cultural Factors for Rural Patient:")
    for i, factor in enumerate(rural_assessment.cultural_considerations[:3], 1):
        print(f"   {i}. {factor}")
    
    print(f"\n🏥 Romanian Healthcare AI Assistant Demo Complete!")

if __name__ == "__main__":
    asyncio.run(main())

#!/usr/bin/env python3
"""
🏥 RomAI Healthcare Intelligence - Clinical Decision Support System
Advanced clinical decision support and medical AI assistance

This module provides comprehensive clinical decision support including:
- Diagnostic assistance and differential diagnosis generation
- Treatment recommendation engine with Romanian medical guidelines
- Drug interaction and allergy checking with Romanian medications
- Clinical pathway optimization and protocol adherence
- Medical risk assessment and patient safety monitoring

Author: RomAI Healthcare Intelligence Team
Version: 3.2.0
Date: 2025-08-08
"""

import asyncio
import logging
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3
import uuid
from enum import Enum
import hashlib

logger = logging.getLogger(__name__)

class DiagnosticConfidence(Enum):
    """Diagnostic confidence levels"""
    VERY_LOW = "very_low"      # < 20%
    LOW = "low"                # 20-40%
    MODERATE = "moderate"      # 40-60%
    HIGH = "high"              # 60-80%
    VERY_HIGH = "very_high"    # 80-95%
    CONFIRMED = "confirmed"     # > 95%

class TreatmentPriority(Enum):
    """Treatment priority levels"""
    EMERGENCY = "emergency"     # Immediate action required
    URGENT = "urgent"          # Within hours
    ROUTINE = "routine"        # Standard care
    ELECTIVE = "elective"      # Can be scheduled
    PREVENTIVE = "preventive"  # Preventive care

class RiskLevel(Enum):
    """Medical risk levels"""
    MINIMAL = "minimal"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class RomanianMedicalGuideline(Enum):
    """Romanian medical guidelines and protocols"""
    MSP_HYPERTENSION = "msp_hypertension_2023"
    MSP_DIABETES = "msp_diabetes_2023"
    MSP_CARDIOVASCULAR = "msp_cardiovascular_2023"
    CNAS_ONCOLOGY = "cnas_oncology_protocols"
    INS_INFECTIOUS_DISEASES = "ins_infectious_diseases"
    INSP_PUBLIC_HEALTH = "insp_public_health"

@dataclass
class ClinicalSymptom:
    """Clinical symptom representation"""
    symptom_id: str
    name: str
    severity: int  # 1-10 scale
    duration: str  # e.g., "3 days", "2 weeks"
    onset: str     # sudden, gradual, chronic
    location: Optional[str] = None
    quality: Optional[str] = None  # sharp, dull, throbbing, etc.
    aggravating_factors: List[str] = field(default_factory=list)
    relieving_factors: List[str] = field(default_factory=list)
    associated_symptoms: List[str] = field(default_factory=list)

@dataclass
class DifferentialDiagnosis:
    """Differential diagnosis representation"""
    diagnosis_id: str
    icd10_code: str
    name: str
    confidence: DiagnosticConfidence
    probability: float  # 0-1
    supporting_evidence: List[str]
    contradicting_evidence: List[str]
    required_tests: List[str]
    specialist_referral: Optional[str] = None
    urgency: TreatmentPriority = TreatmentPriority.ROUTINE

@dataclass
class TreatmentOption:
    """Treatment option representation"""
    treatment_id: str
    name: str
    type: str  # medication, procedure, lifestyle, etc.
    indication: str
    contraindications: List[str]
    side_effects: List[str]
    romanian_availability: bool
    reimbursed_by_cnas: bool
    estimated_cost_ron: Optional[float] = None
    duration: Optional[str] = None
    monitoring_required: List[str] = field(default_factory=list)

@dataclass
class DrugInteraction:
    """Drug interaction information"""
    interaction_id: str
    drug_a: str
    drug_b: str
    severity: str  # mild, moderate, severe, contraindicated
    mechanism: str
    clinical_effect: str
    management: str
    romanian_guidance: Optional[str] = None

@dataclass
class ClinicalDecision:
    """Clinical decision support result"""
    decision_id: str
    patient_id: str
    presenting_symptoms: List[ClinicalSymptom]
    differential_diagnoses: List[DifferentialDiagnosis]
    recommended_tests: List[str]
    treatment_options: List[TreatmentOption]
    risk_assessment: Dict[str, Any]
    safety_alerts: List[str]
    follow_up_plan: str
    confidence_score: float
    romanian_guidelines_applied: List[str]
    created_at: datetime = field(default_factory=datetime.now)

class RomanianMedicalKnowledgeBase:
    """Romanian medical knowledge and guidelines"""
    
    def __init__(self):
        self.diagnostic_criteria = self._load_diagnostic_criteria()
        self.treatment_guidelines = self._load_treatment_guidelines()
        self.drug_formulary = self._load_romanian_drug_formulary()
        self.clinical_pathways = self._load_clinical_pathways()
    
    def _load_diagnostic_criteria(self) -> Dict[str, Any]:
        """Load diagnostic criteria following Romanian medical standards"""
        return {
            "I10": {  # Essential hypertension
                "name": "Hipertensiune arterială esențială",
                "criteria": {
                    "systolic_bp": ">= 140 mmHg",
                    "diastolic_bp": ">= 90 mmHg",
                    "measurements": "≥ 2 măsurători separate",
                    "romanian_guideline": "Ghidul MSP pentru Hipertensiune 2023"
                },
                "staging": {
                    "grade_1": "140-159/90-99 mmHg",
                    "grade_2": "160-179/100-109 mmHg", 
                    "grade_3": "≥180/≥110 mmHg"
                }
            },
            "E11.9": {  # Type 2 diabetes
                "name": "Diabet zaharat tip 2 fără complicații",
                "criteria": {
                    "fasting_glucose": "≥ 126 mg/dL (7.0 mmol/L)",
                    "hba1c": "≥ 6.5%",
                    "ogtt_2h": "≥ 200 mg/dL (11.1 mmol/L)",
                    "romanian_guideline": "Protocolul CNAS pentru Diabet 2023"
                },
                "diagnostic_tests": ["glicemie bazală", "HbA1c", "OGTT"],
                "complications_screening": ["retinopatia", "nefropatia", "neuropatia"]
            },
            "J44.1": {  # COPD with exacerbation
                "name": "Boala pulmonară obstructivă cronică cu exacerbare",
                "criteria": {
                    "spirometry": "FEV1/FVC < 0.70",
                    "symptoms": ["dispnee", "tuse cronică", "expectorație"],
                    "exacerbation_signs": ["dispnee accentuată", "modificarea expectorației"]
                },
                "severity_classification": {
                    "mild": "FEV1 ≥ 80%",
                    "moderate": "50% ≤ FEV1 < 80%",
                    "severe": "30% ≤ FEV1 < 50%",
                    "very_severe": "FEV1 < 30%"
                }
            }
        }
    
    def _load_treatment_guidelines(self) -> Dict[str, Any]:
        """Load Romanian treatment guidelines"""
        return {
            "hypertension": {
                "guideline": "Ghidul MSP Hipertensiune 2023",
                "first_line": ["ACE inhibitori", "ARB", "Diuretice tiazidice", "Blocante canale calciu"],
                "combinations": {
                    "dual": ["ACE + diuretic", "ARB + diuretic", "ACE + blocant Ca"],
                    "triple": ["ACE + diuretic + blocant Ca"]
                },
                "target_bp": {
                    "general": "<140/90 mmHg",
                    "diabetes": "<130/80 mmHg",
                    "elderly": "<150/90 mmHg"
                },
                "lifestyle": ["reducerea sodiului", "activitate fizică", "greutate optimă"]
            },
            "diabetes_t2": {
                "guideline": "Protocolul CNAS Diabet 2023",
                "first_line": "Metformină",
                "hba1c_target": "<7% (majoritatea pacienților)",
                "add_on_therapy": {
                    "second_line": ["Sulfoniluree", "Inhibitori DPP-4", "Inhibitori SGLT2"],
                    "injectable": ["Insulină bazală", "Agonisti GLP-1"]
                },
                "monitoring": {
                    "hba1c": "la 3 luni",
                    "screening": {
                        "oftalmologic": "anual",
                        "nefropatie": "anual",
                        "neuropatie": "anual"
                    }
                }
            }
        }
    
    def _load_romanian_drug_formulary(self) -> Dict[str, Any]:
        """Load Romanian drug formulary with CNAS coverage"""
        return {
            "enalapril": {
                "nume_comercial": ["Enap", "Enalapril Terapia"],
                "clasa_terapeutica": "ACE inhibitor",
                "indicatii": ["hipertensiune", "insuficiență cardiacă"],
                "doze": ["5mg", "10mg", "20mg"],
                "compensat_cnas": True,
                "pret_ron": 15.50,
                "contraindicatii": ["angioedem", "stenoza arterei renale bilaterală"],
                "efecte_adverse": ["tuse uscată", "hiperkaliemie"],
                "monitorizare": ["creatinina", "potasiu"]
            },
            "metformin": {
                "nume_comercial": ["Glucophage", "Metformin Zentiva"],
                "clasa_terapeutica": "Biguanide",
                "indicatii": ["diabet zaharat tip 2"],
                "doze": ["500mg", "850mg", "1000mg"],
                "compensat_cnas": True,
                "pret_ron": 8.20,
                "contraindicatii": ["insuficiență renală", "acidoză metabolică"],
                "efecte_adverse": ["tulburări digestive", "acidoză lactică"],
                "monitorizare": ["funcția renală", "vitamina B12"]
            },
            "amlodipine": {
                "nume_comercial": ["Norvasc", "Amlodipină Terapia"],
                "clasa_terapeutica": "Blocant canale calciu",
                "indicatii": ["hipertensiune", "angină pectorală"],
                "doze": ["5mg", "10mg"],
                "compensat_cnas": True,
                "pret_ron": 12.80,
                "contraindicatii": ["șoc cardiogen", "stenoza aortică severă"],
                "efecte_adverse": ["edem periferic", "flushing"],
                "monitorizare": ["tensiunea arterială", "edeme"]
            }
        }
    
    def _load_clinical_pathways(self) -> Dict[str, Any]:
        """Load Romanian clinical pathways"""
        return {
            "hipertensiune_initiala": {
                "etape": [
                    "confirmarea diagnosticului (≥2 măsurători)",
                    "evaluarea factorilor de risc cardiovascular",
                    "excluderea hipertensiunii secundare",
                    "evaluarea daunelor la organele țintă",
                    "stratificarea riscului cardiovascular",
                    "inițierea tratamentului"
                ],
                "investigatii_obligatorii": [
                    "EKG", "analize biochimice", "examen urină",
                    "fondul de ochi", "ecocardiografie"
                ],
                "durata_medie": "2-4 săptămâni"
            },
            "diabet_diagnostic": {
                "etape": [
                    "confirmarea hiperglicemiei",
                    "determinarea tipului de diabet",
                    "evaluarea complicațiilor",
                    "educația pacientului",
                    "inițierea tratamentului"
                ],
                "investigatii_obligatorii": [
                    "glicemia bazală", "HbA1c", "profil lipidic",
                    "creatinina", "examen oftalmologic"
                ]
            }
        }

class DiagnosticEngine:
    """Advanced diagnostic reasoning engine"""
    
    def __init__(self):
        self.knowledge_base = RomanianMedicalKnowledgeBase()
        self.symptom_disease_matrix = self._build_symptom_disease_matrix()
        self.diagnostic_rules = self._load_diagnostic_rules()
    
    def _build_symptom_disease_matrix(self) -> Dict[str, Dict[str, float]]:
        """Build symptom-disease association matrix"""
        return {
            "chest_pain": {
                "I21.9": 0.8,   # Acute MI
                "I20.9": 0.6,   # Angina pectoris
                "R07.89": 0.3,  # Other chest pain
                "J18.9": 0.2    # Pneumonia
            },
            "dyspnea": {
                "I50.9": 0.7,   # Heart failure
                "J44.1": 0.8,   # COPD exacerbation
                "J18.9": 0.5,   # Pneumonia
                "I21.9": 0.4    # Acute MI
            },
            "headache": {
                "G43.9": 0.6,   # Migraine
                "I10": 0.4,     # Hypertension
                "G44.2": 0.3,   # Tension headache
                "I61": 0.1      # Intracranial hemorrhage
            },
            "polyuria": {
                "E11.9": 0.8,   # Type 2 DM
                "E10.9": 0.7,   # Type 1 DM
                "N40": 0.3      # Benign prostatic hyperplasia
            }
        }
    
    def _load_diagnostic_rules(self) -> List[Dict[str, Any]]:
        """Load diagnostic reasoning rules"""
        return [
            {
                "rule_id": "hypertension_rule",
                "condition": "systolic_bp >= 140 AND diastolic_bp >= 90",
                "diagnosis": "I10",
                "confidence": 0.9,
                "required_confirmations": 2
            },
            {
                "rule_id": "diabetes_rule", 
                "condition": "fasting_glucose >= 126 OR hba1c >= 6.5",
                "diagnosis": "E11.9",
                "confidence": 0.95,
                "required_confirmations": 1
            },
            {
                "rule_id": "acute_mi_rule",
                "condition": "chest_pain AND troponin_elevated AND ecg_changes",
                "diagnosis": "I21.9",
                "confidence": 0.95,
                "urgency": "emergency"
            }
        ]
    
    async def generate_differential_diagnosis(self, 
                                            symptoms: List[ClinicalSymptom],
                                            vital_signs: Dict[str, float],
                                            lab_results: Dict[str, Any]) -> List[DifferentialDiagnosis]:
        """Generate differential diagnosis list"""
        
        differential_list = []
        
        # Symptom-based analysis
        for symptom in symptoms:
            if symptom.name in self.symptom_disease_matrix:
                for icd_code, base_probability in self.symptom_disease_matrix[symptom.name].items():
                    # Adjust probability based on symptom severity
                    adjusted_probability = base_probability * (symptom.severity / 10.0)
                    
                    # Check if diagnosis already in list
                    existing = next((d for d in differential_list if d.icd10_code == icd_code), None)
                    
                    if existing:
                        # Update probability using Bayesian approach
                        existing.probability = min(existing.probability + adjusted_probability * 0.3, 0.99)
                    else:
                        # Create new diagnosis
                        diagnosis = DifferentialDiagnosis(
                            diagnosis_id=str(uuid.uuid4()),
                            icd10_code=icd_code,
                            name=self.knowledge_base.diagnostic_criteria.get(icd_code, {}).get("name", "Unknown"),
                            confidence=self._probability_to_confidence(adjusted_probability),
                            probability=adjusted_probability,
                            supporting_evidence=[f"Symptom: {symptom.name} (severity {symptom.severity})"],
                            contradicting_evidence=[],
                            required_tests=[]
                        )
                        differential_list.append(diagnosis)
        
        # Rule-based analysis
        for rule in self.diagnostic_rules:
            if self._evaluate_diagnostic_rule(rule, symptoms, vital_signs, lab_results):
                icd_code = rule["diagnosis"]
                existing = next((d for d in differential_list if d.icd10_code == icd_code), None)
                
                if existing:
                    existing.probability = max(existing.probability, rule["confidence"])
                    existing.confidence = self._probability_to_confidence(existing.probability)
                else:
                    diagnosis = DifferentialDiagnosis(
                        diagnosis_id=str(uuid.uuid4()),
                        icd10_code=icd_code,
                        name=self.knowledge_base.diagnostic_criteria.get(icd_code, {}).get("name", "Unknown"),
                        confidence=self._probability_to_confidence(rule["confidence"]),
                        probability=rule["confidence"],
                        supporting_evidence=[f"Rule: {rule['rule_id']}"],
                        contradicting_evidence=[],
                        required_tests=[],
                        urgency=TreatmentPriority(rule.get("urgency", "routine"))
                    )
                    differential_list.append(diagnosis)
        
        # Sort by probability (highest first)
        differential_list.sort(key=lambda x: x.probability, reverse=True)
        
        # Add required tests for each diagnosis
        for diagnosis in differential_list:
            diagnosis.required_tests = self._get_required_tests(diagnosis.icd10_code)
        
        return differential_list[:10]  # Top 10 diagnoses
    
    def _probability_to_confidence(self, probability: float) -> DiagnosticConfidence:
        """Convert probability to confidence level"""
        if probability >= 0.95:
            return DiagnosticConfidence.CONFIRMED
        elif probability >= 0.8:
            return DiagnosticConfidence.VERY_HIGH
        elif probability >= 0.6:
            return DiagnosticConfidence.HIGH
        elif probability >= 0.4:
            return DiagnosticConfidence.MODERATE
        elif probability >= 0.2:
            return DiagnosticConfidence.LOW
        else:
            return DiagnosticConfidence.VERY_LOW
    
    def _evaluate_diagnostic_rule(self, rule: Dict[str, Any], 
                                 symptoms: List[ClinicalSymptom],
                                 vital_signs: Dict[str, float],
                                 lab_results: Dict[str, Any]) -> bool:
        """Evaluate diagnostic rule against patient data"""
        condition = rule["condition"]
        
        # Simple rule evaluation (in production, use a proper rule engine)
        if "systolic_bp >= 140 AND diastolic_bp >= 90" in condition:
            return (vital_signs.get("systolic_bp", 0) >= 140 and 
                   vital_signs.get("diastolic_bp", 0) >= 90)
        
        if "fasting_glucose >= 126 OR hba1c >= 6.5" in condition:
            return (lab_results.get("fasting_glucose", 0) >= 126 or
                   lab_results.get("hba1c", 0) >= 6.5)
        
        if "chest_pain AND troponin_elevated AND ecg_changes" in condition:
            has_chest_pain = any(s.name == "chest_pain" for s in symptoms)
            troponin_elevated = lab_results.get("troponin", 0) > 0.04
            ecg_changes = lab_results.get("ecg_abnormal", False)
            return has_chest_pain and troponin_elevated and ecg_changes
        
        return False
    
    def _get_required_tests(self, icd_code: str) -> List[str]:
        """Get required diagnostic tests for specific diagnosis"""
        test_requirements = {
            "I10": ["EKG", "Analize biochimice", "Examen urină", "Fondul de ochi"],
            "E11.9": ["HbA1c", "Glicemie bazală", "Profil lipidic", "Examen oftalmologic"],
            "I21.9": ["EKG serial", "Troponine", "Ecocardiografie", "Angiografie"],
            "J44.1": ["Spirometrie", "Gazometrie", "Radiografie torace"]
        }
        
        return test_requirements.get(icd_code, ["Investigații suplimentare necesare"])

class TreatmentEngine:
    """Treatment recommendation engine"""
    
    def __init__(self):
        self.knowledge_base = RomanianMedicalKnowledgeBase()
        self.drug_interactions_db = self._load_drug_interactions()
        self.allergy_checker = AllergyChecker()
    
    def _load_drug_interactions(self) -> List[DrugInteraction]:
        """Load drug interaction database"""
        return [
            DrugInteraction(
                interaction_id="warfarin_aspirin",
                drug_a="warfarin",
                drug_b="aspirin",
                severity="severe",
                mechanism="Increased bleeding risk",
                clinical_effect="Risc crescut de hemoragie",
                management="Monitorizare INR frecventă",
                romanian_guidance="Conform ghidului CNAS anticoagulante"
            ),
            DrugInteraction(
                interaction_id="ace_potassium",
                drug_a="enalapril",
                drug_b="potassium_supplements",
                severity="moderate",
                mechanism="Hyperkalemia risk",
                clinical_effect="Risc de hiperkaliemie",
                management="Monitorizare electroliți",
                romanian_guidance="Control K+ la 1-2 săptămâni"
            ),
            DrugInteraction(
                interaction_id="metformin_contrast",
                drug_a="metformin",
                drug_b="iodinated_contrast",
                severity="severe",
                mechanism="Lactic acidosis risk",
                clinical_effect="Risc de acidoză lactică",
                management="Oprire metformină 48h înainte și după",
                romanian_guidance="Protocol imagistică cu contrast"
            )
        ]
    
    async def recommend_treatment(self, diagnosis: DifferentialDiagnosis,
                                patient_profile: Dict[str, Any],
                                current_medications: List[str]) -> List[TreatmentOption]:
        """Recommend treatment options for diagnosis"""
        
        treatment_options = []
        
        # Get treatment guidelines for diagnosis
        guidelines = self._get_treatment_guidelines(diagnosis.icd10_code)
        
        if not guidelines:
            return treatment_options
        
        # Generate medication recommendations
        if "medications" in guidelines:
            for med_class in guidelines["medications"]:
                medications = self._get_medications_in_class(med_class)
                
                for medication in medications:
                    # Check contraindications
                    if self._check_contraindications(medication, patient_profile):
                        continue
                    
                    # Check drug interactions
                    interactions = self._check_drug_interactions(medication, current_medications)
                    
                    # Check allergies
                    allergy_risk = self.allergy_checker.check_allergy_risk(
                        medication, patient_profile.get("allergies", [])
                    )
                    
                    # Create treatment option
                    option = TreatmentOption(
                        treatment_id=str(uuid.uuid4()),
                        name=medication["name"],
                        type="medication",
                        indication=diagnosis.name,
                        contraindications=medication.get("contraindications", []),
                        side_effects=medication.get("side_effects", []),
                        romanian_availability=medication.get("available_in_romania", True),
                        reimbursed_by_cnas=medication.get("cnas_reimbursed", False),
                        estimated_cost_ron=medication.get("price_ron"),
                        monitoring_required=medication.get("monitoring", [])
                    )
                    
                    treatment_options.append(option)
        
        # Add lifestyle recommendations
        lifestyle_recommendations = self._get_lifestyle_recommendations(diagnosis.icd10_code)
        for lifestyle in lifestyle_recommendations:
            option = TreatmentOption(
                treatment_id=str(uuid.uuid4()),
                name=lifestyle["name"],
                type="lifestyle",
                indication=diagnosis.name,
                contraindications=[],
                side_effects=[],
                romanian_availability=True,
                reimbursed_by_cnas=False,
                estimated_cost_ron=0.0
            )
            treatment_options.append(option)
        
        return treatment_options
    
    def _get_treatment_guidelines(self, icd_code: str) -> Dict[str, Any]:
        """Get treatment guidelines for specific diagnosis"""
        guideline_map = {
            "I10": self.knowledge_base.treatment_guidelines["hypertension"],
            "E11.9": self.knowledge_base.treatment_guidelines["diabetes_t2"]
        }
        
        return guideline_map.get(icd_code, {})
    
    def _get_medications_in_class(self, med_class: str) -> List[Dict[str, Any]]:
        """Get medications in therapeutic class"""
        class_medications = {
            "ACE inhibitori": [
                {
                    "name": "Enalapril",
                    "contraindications": ["angioedem", "stenoza arterei renale"],
                    "side_effects": ["tuse uscată", "hiperkaliemie"],
                    "available_in_romania": True,
                    "cnas_reimbursed": True,
                    "price_ron": 15.50,
                    "monitoring": ["creatinina", "potasiu"]
                }
            ],
            "Metformină": [
                {
                    "name": "Metformin",
                    "contraindications": ["insuficiență renală", "acidoză metabolică"],
                    "side_effects": ["tulburări digestive", "acidoză lactică"],
                    "available_in_romania": True,
                    "cnas_reimbursed": True,
                    "price_ron": 8.20,
                    "monitoring": ["funcția renală", "vitamina B12"]
                }
            ]
        }
        
        return class_medications.get(med_class, [])
    
    def _check_contraindications(self, medication: Dict[str, Any], 
                                patient_profile: Dict[str, Any]) -> bool:
        """Check if medication is contraindicated for patient"""
        contraindications = medication.get("contraindications", [])
        patient_conditions = patient_profile.get("chronic_conditions", [])
        
        # Simple check - in production, use more sophisticated logic
        for contraindication in contraindications:
            if any(contraindication.lower() in condition.lower() for condition in patient_conditions):
                return True
        
        return False
    
    def _check_drug_interactions(self, medication: str, 
                               current_medications: List[str]) -> List[DrugInteraction]:
        """Check for drug interactions"""
        interactions = []
        
        for interaction in self.drug_interactions_db:
            if (medication.lower() in [interaction.drug_a.lower(), interaction.drug_b.lower()] and
                any(med.lower() in [interaction.drug_a.lower(), interaction.drug_b.lower()] 
                    for med in current_medications)):
                interactions.append(interaction)
        
        return interactions
    
    def _get_lifestyle_recommendations(self, icd_code: str) -> List[Dict[str, Any]]:
        """Get lifestyle recommendations for diagnosis"""
        recommendations = {
            "I10": [
                {"name": "Reducerea aportului de sodiu (< 6g/zi)"},
                {"name": "Activitate fizică regulată (150 min/săptămână)"},
                {"name": "Menținerea greutății optime (IMC 18.5-24.9)"},
                {"name": "Limitarea consumului de alcool"},
                {"name": "Renunțarea la fumat"}
            ],
            "E11.9": [
                {"name": "Dietă diabetică cu controlul carbohidraților"},
                {"name": "Activitate fizică adaptată (150 min/săptămână)"},
                {"name": "Monitorizarea glicemiei"},
                {"name": "Educație diabetologică"},
                {"name": "Controlul greutății corporale"}
            ]
        }
        
        return recommendations.get(icd_code, [])

class AllergyChecker:
    """Allergy and adverse reaction checker"""
    
    def __init__(self):
        self.allergy_database = self._load_allergy_database()
        self.cross_reactivity_map = self._load_cross_reactivity()
    
    def _load_allergy_database(self) -> Dict[str, Any]:
        """Load medication allergy database"""
        return {
            "penicillin": {
                "type": "antibiotic_allergy",
                "severity": "potentially_severe",
                "manifestations": ["rash", "anaphylaxis", "bronchospasm"],
                "cross_reactive": ["amoxicillin", "ampicillin", "cephalexin"],
                "safe_alternatives": ["azithromycin", "clarithromycin", "fluoroquinolones"]
            },
            "aspirin": {
                "type": "nsaid_allergy",
                "severity": "moderate_to_severe",
                "manifestations": ["asthma", "nasal_polyps", "urticaria"],
                "cross_reactive": ["ibuprofen", "diclofenac", "naproxen"],
                "safe_alternatives": ["paracetamol", "celecoxib"]
            }
        }
    
    def _load_cross_reactivity(self) -> Dict[str, List[str]]:
        """Load drug cross-reactivity patterns"""
        return {
            "penicillin": ["amoxicillin", "ampicillin", "cephalexin"],
            "sulfonamide": ["sulfamethoxazole", "sulfadiazine"],
            "nsaid": ["aspirin", "ibuprofen", "diclofenac", "naproxen"]
        }
    
    def check_allergy_risk(self, medication: str, patient_allergies: List[str]) -> Dict[str, Any]:
        """Check allergy risk for medication"""
        risks = {
            "direct_allergy": False,
            "cross_reactivity_risk": False,
            "severity": "unknown",
            "recommendations": []
        }
        
        medication_lower = medication.lower()
        
        # Check direct allergy
        for allergy in patient_allergies:
            if allergy.lower() == medication_lower:
                risks["direct_allergy"] = True
                allergy_info = self.allergy_database.get(allergy.lower(), {})
                risks["severity"] = allergy_info.get("severity", "unknown")
                risks["recommendations"].append(f"CONTRAINDICAT: Alergie cunoscută la {medication}")
                return risks
        
        # Check cross-reactivity
        for allergy in patient_allergies:
            allergy_lower = allergy.lower()
            if allergy_lower in self.allergy_database:
                cross_reactive = self.allergy_database[allergy_lower].get("cross_reactive", [])
                if medication_lower in [drug.lower() for drug in cross_reactive]:
                    risks["cross_reactivity_risk"] = True
                    risks["severity"] = "moderate"
                    risks["recommendations"].append(
                        f"ATENȚIE: Risc de reactivitate încrucișată cu {allergy}"
                    )
        
        return risks

class ClinicalDecisionSupportSystem:
    """Main Clinical Decision Support System"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.diagnostic_engine = DiagnosticEngine()
        self.treatment_engine = TreatmentEngine()
        self.allergy_checker = AllergyChecker()
        self.knowledge_base = RomanianMedicalKnowledgeBase()
        
        # Initialize database
        self.db_path = config.get("db_path", "clinical_decisions.db")
        self.init_database()
        
        # Statistics
        self.stats = {
            "decisions_made": 0,
            "diagnoses_generated": 0,
            "treatments_recommended": 0,
            "safety_alerts_issued": 0,
            "romanian_guidelines_applied": 0
        }
    
    def init_database(self):
        """Initialize clinical decision database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS clinical_decisions (
                    decision_id TEXT PRIMARY KEY,
                    patient_id TEXT NOT NULL,
                    symptoms TEXT,
                    vital_signs TEXT,
                    lab_results TEXT,
                    differential_diagnoses TEXT,
                    recommended_tests TEXT,
                    treatment_options TEXT,
                    risk_assessment TEXT,
                    safety_alerts TEXT,
                    follow_up_plan TEXT,
                    confidence_score REAL,
                    romanian_guidelines TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_decisions_patient 
                ON clinical_decisions(patient_id)
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_decisions_date 
                ON clinical_decisions(created_at)
            ''')
    
    async def make_clinical_decision(self, 
                                   patient_id: str,
                                   symptoms: List[Dict[str, Any]],
                                   vital_signs: Dict[str, float],
                                   lab_results: Dict[str, Any],
                                   patient_profile: Dict[str, Any],
                                   current_medications: List[str]) -> ClinicalDecision:
        """Make comprehensive clinical decision"""
        
        # Convert symptoms to ClinicalSymptom objects
        clinical_symptoms = []
        for symptom_data in symptoms:
            symptom = ClinicalSymptom(
                symptom_id=symptom_data.get("id", str(uuid.uuid4())),
                name=symptom_data["name"],
                severity=symptom_data.get("severity", 5),
                duration=symptom_data.get("duration", "unknown"),
                onset=symptom_data.get("onset", "gradual"),
                location=symptom_data.get("location"),
                quality=symptom_data.get("quality"),
                aggravating_factors=symptom_data.get("aggravating_factors", []),
                relieving_factors=symptom_data.get("relieving_factors", []),
                associated_symptoms=symptom_data.get("associated_symptoms", [])
            )
            clinical_symptoms.append(symptom)
        
        # Generate differential diagnosis
        differential_diagnoses = await self.diagnostic_engine.generate_differential_diagnosis(
            clinical_symptoms, vital_signs, lab_results
        )
        
        # Get treatment recommendations for top diagnoses
        all_treatment_options = []
        for diagnosis in differential_diagnoses[:3]:  # Top 3 diagnoses
            treatments = await self.treatment_engine.recommend_treatment(
                diagnosis, patient_profile, current_medications
            )
            all_treatment_options.extend(treatments)
        
        # Remove duplicates
        unique_treatments = []
        seen_names = set()
        for treatment in all_treatment_options:
            if treatment.name not in seen_names:
                unique_treatments.append(treatment)
                seen_names.add(treatment.name)
        
        # Assess risks
        risk_assessment = await self._assess_clinical_risks(
            differential_diagnoses, patient_profile, unique_treatments
        )
        
        # Generate safety alerts
        safety_alerts = await self._generate_safety_alerts(
            differential_diagnoses, unique_treatments, current_medications, patient_profile
        )
        
        # Create follow-up plan
        follow_up_plan = self._create_follow_up_plan(differential_diagnoses)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(differential_diagnoses, vital_signs, lab_results)
        
        # Identify applied Romanian guidelines
        romanian_guidelines = self._identify_applied_guidelines(differential_diagnoses)
        
        # Create clinical decision
        decision = ClinicalDecision(
            decision_id=str(uuid.uuid4()),
            patient_id=patient_id,
            presenting_symptoms=clinical_symptoms,
            differential_diagnoses=differential_diagnoses,
            recommended_tests=self._aggregate_recommended_tests(differential_diagnoses),
            treatment_options=unique_treatments,
            risk_assessment=risk_assessment,
            safety_alerts=safety_alerts,
            follow_up_plan=follow_up_plan,
            confidence_score=confidence_score,
            romanian_guidelines_applied=romanian_guidelines
        )
        
        # Store decision
        await self._store_clinical_decision(decision)
        
        # Update statistics
        self.stats["decisions_made"] += 1
        self.stats["diagnoses_generated"] += len(differential_diagnoses)
        self.stats["treatments_recommended"] += len(unique_treatments)
        self.stats["safety_alerts_issued"] += len(safety_alerts)
        self.stats["romanian_guidelines_applied"] += len(romanian_guidelines)
        
        return decision
    
    async def _assess_clinical_risks(self, diagnoses: List[DifferentialDiagnosis],
                                   patient_profile: Dict[str, Any],
                                   treatments: List[TreatmentOption]) -> Dict[str, Any]:
        """Assess clinical risks"""
        risk_assessment = {
            "overall_risk": RiskLevel.LOW,
            "diagnostic_uncertainty": 0.0,
            "treatment_complexity": 0.0,
            "patient_factors": [],
            "critical_actions_needed": []
        }
        
        # Assess diagnostic uncertainty
        if diagnoses:
            top_probability = diagnoses[0].probability
            risk_assessment["diagnostic_uncertainty"] = 1.0 - top_probability
            
            # Check for emergency diagnoses
            for diagnosis in diagnoses:
                if diagnosis.urgency == TreatmentPriority.EMERGENCY:
                    risk_assessment["overall_risk"] = RiskLevel.CRITICAL
                    risk_assessment["critical_actions_needed"].append(
                        f"URGENȚĂ: {diagnosis.name} necesită atenție imediată"
                    )
        
        # Assess patient risk factors
        age = patient_profile.get("age", 0)
        if age > 75:
            risk_assessment["patient_factors"].append("Vârstă înaintată (>75 ani)")
        
        chronic_conditions = patient_profile.get("chronic_conditions", [])
        if len(chronic_conditions) > 2:
            risk_assessment["patient_factors"].append("Comorbidități multiple")
        
        # Assess treatment complexity
        medication_treatments = [t for t in treatments if t.type == "medication"]
        risk_assessment["treatment_complexity"] = len(medication_treatments) / 10.0
        
        return risk_assessment
    
    async def _generate_safety_alerts(self, diagnoses: List[DifferentialDiagnosis],
                                     treatments: List[TreatmentOption],
                                     current_medications: List[str],
                                     patient_profile: Dict[str, Any]) -> List[str]:
        """Generate safety alerts"""
        alerts = []
        
        # Emergency diagnosis alerts
        for diagnosis in diagnoses:
            if diagnosis.urgency == TreatmentPriority.EMERGENCY:
                alerts.append(f"🚨 ALERTĂ CRITICĂ: {diagnosis.name} - Acțiune imediată necesară")
        
        # Drug interaction alerts
        for treatment in treatments:
            if treatment.type == "medication":
                interactions = self.treatment_engine._check_drug_interactions(
                    treatment.name, current_medications
                )
                for interaction in interactions:
                    if interaction.severity in ["severe", "contraindicated"]:
                        alerts.append(
                            f"⚠️ INTERACȚIUNE MEDICAMENTOASĂ: {interaction.drug_a} + {interaction.drug_b} - {interaction.clinical_effect}"
                        )
        
        # Allergy alerts
        patient_allergies = patient_profile.get("allergies", [])
        for treatment in treatments:
            if treatment.type == "medication":
                allergy_risk = self.allergy_checker.check_allergy_risk(
                    treatment.name, patient_allergies
                )
                if allergy_risk["direct_allergy"]:
                    alerts.append(f"🛑 ALERGIE: Pacientul este alergic la {treatment.name}")
                elif allergy_risk["cross_reactivity_risk"]:
                    alerts.append(f"⚠️ RISC ALERGIE: Posibilă reactivitate încrucișată {treatment.name}")
        
        return alerts
    
    def _create_follow_up_plan(self, diagnoses: List[DifferentialDiagnosis]) -> str:
        """Create follow-up plan"""
        if not diagnoses:
            return "Plan de urmărire: Reevaluare la necesitate"
        
        top_diagnosis = diagnoses[0]
        
        follow_up_plans = {
            "I10": "Plan urmărire hipertensiune: Control TA la 1-2 săptămâni, apoi lunar. Monitorizare funcție renală la 3 luni.",
            "E11.9": "Plan urmărire diabet: Control glicemie zilnic, HbA1c la 3 luni, screening complicații anual.",
            "I21.9": "Plan urmărire post-IM: Ecocardiografie la 1 lună, control cardiologic la 2 săptămâni, reabilitare cardiacă."
        }
        
        return follow_up_plans.get(
            top_diagnosis.icd10_code,
            f"Plan urmărire {top_diagnosis.name}: Control medical la 1-2 săptămâni, reevaluare simptome."
        )
    
    def _calculate_confidence_score(self, diagnoses: List[DifferentialDiagnosis],
                                  vital_signs: Dict[str, float],
                                  lab_results: Dict[str, Any]) -> float:
        """Calculate overall confidence score"""
        if not diagnoses:
            return 0.0
        
        # Base confidence from top diagnosis
        base_confidence = diagnoses[0].probability
        
        # Adjust based on available data
        data_completeness = 0.0
        if vital_signs:
            data_completeness += 0.3
        if lab_results:
            data_completeness += 0.4
        if len(diagnoses) > 1:
            data_completeness += 0.3
        
        # Final confidence
        confidence = base_confidence * data_completeness
        return min(confidence, 0.95)  # Cap at 95%
    
    def _identify_applied_guidelines(self, diagnoses: List[DifferentialDiagnosis]) -> List[str]:
        """Identify Romanian guidelines applied"""
        guidelines = []
        
        for diagnosis in diagnoses:
            if diagnosis.icd10_code == "I10":
                guidelines.append("Ghidul MSP pentru Hipertensiune 2023")
            elif diagnosis.icd10_code == "E11.9":
                guidelines.append("Protocolul CNAS pentru Diabet 2023")
            elif diagnosis.icd10_code in ["I21.9", "I20.9"]:
                guidelines.append("Ghidul ESC/MSP Sindroame Coronariene Acute")
        
        return list(set(guidelines))  # Remove duplicates
    
    def _aggregate_recommended_tests(self, diagnoses: List[DifferentialDiagnosis]) -> List[str]:
        """Aggregate recommended tests from all diagnoses"""
        all_tests = []
        for diagnosis in diagnoses:
            all_tests.extend(diagnosis.required_tests)
        
        # Remove duplicates and sort
        unique_tests = list(set(all_tests))
        unique_tests.sort()
        
        return unique_tests
    
    async def _store_clinical_decision(self, decision: ClinicalDecision):
        """Store clinical decision in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO clinical_decisions 
                    (decision_id, patient_id, symptoms, vital_signs, lab_results,
                     differential_diagnoses, recommended_tests, treatment_options,
                     risk_assessment, safety_alerts, follow_up_plan,
                     confidence_score, romanian_guidelines)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    decision.decision_id,
                    decision.patient_id,
                    json.dumps([{
                        "name": s.name,
                        "severity": s.severity,
                        "duration": s.duration
                    } for s in decision.presenting_symptoms]),
                    json.dumps({}),  # Placeholder for vital signs
                    json.dumps({}),  # Placeholder for lab results
                    json.dumps([{
                        "icd10_code": d.icd10_code,
                        "name": d.name,
                        "probability": d.probability,
                        "confidence": d.confidence.value
                    } for d in decision.differential_diagnoses]),
                    json.dumps(decision.recommended_tests),
                    json.dumps([{
                        "name": t.name,
                        "type": t.type,
                        "romanian_availability": t.romanian_availability,
                        "cnas_reimbursed": t.reimbursed_by_cnas
                    } for t in decision.treatment_options]),
                    json.dumps(decision.risk_assessment),
                    json.dumps(decision.safety_alerts),
                    decision.follow_up_plan,
                    decision.confidence_score,
                    json.dumps(decision.romanian_guidelines_applied)
                ))
        except Exception as e:
            logger.error(f"Failed to store clinical decision: {e}")
    
    async def get_decision_history(self, patient_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get patient's decision history"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute('''
                    SELECT * FROM clinical_decisions 
                    WHERE patient_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT ?
                ''', (patient_id, limit))
                
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Failed to get decision history: {e}")
            return []
    
    async def get_system_statistics(self) -> Dict[str, Any]:
        """Get clinical decision support statistics"""
        return {
            "system_status": "operational",
            "decisions_made": self.stats["decisions_made"],
            "diagnoses_generated": self.stats["diagnoses_generated"],
            "treatments_recommended": self.stats["treatments_recommended"],
            "safety_alerts_issued": self.stats["safety_alerts_issued"],
            "romanian_guidelines_applied": self.stats["romanian_guidelines_applied"],
            "knowledge_base_version": "Romanian Medical Guidelines 2023",
            "last_update": datetime.now().isoformat()
        }

# Usage example and testing
async def main():
    """Main function for testing Clinical Decision Support System"""
    cdss = ClinicalDecisionSupportSystem()
    
    print("🏥 RomAI Clinical Decision Support System - Testing")
    print("=" * 60)
    
    # Test clinical decision making
    print("🧠 Testing Clinical Decision Making...")
    
    # Mock patient data
    patient_id = "patient_123"
    symptoms = [
        {
            "name": "chest_pain",
            "severity": 8,
            "duration": "2 hours",
            "onset": "sudden",
            "quality": "crushing"
        },
        {
            "name": "dyspnea",
            "severity": 6,
            "duration": "2 hours",
            "onset": "sudden"
        }
    ]
    
    vital_signs = {
        "systolic_bp": 160,
        "diastolic_bp": 100,
        "heart_rate": 95,
        "temperature": 37.1,
        "oxygen_saturation": 96
    }
    
    lab_results = {
        "troponin": 0.8,  # Elevated
        "ecg_abnormal": True,
        "fasting_glucose": 140
    }
    
    patient_profile = {
        "age": 65,
        "gender": "M",
        "chronic_conditions": ["hypertension", "diabetes"],
        "allergies": ["penicillin"]
    }
    
    current_medications = ["enalapril", "metformin"]
    
    # Make clinical decision
    decision = await cdss.make_clinical_decision(
        patient_id, symptoms, vital_signs, lab_results,
        patient_profile, current_medications
    )
    
    print(f"   Decision ID: {decision.decision_id}")
    print(f"   Differential Diagnoses: {len(decision.differential_diagnoses)}")
    if decision.differential_diagnoses:
        top_diagnosis = decision.differential_diagnoses[0]
        print(f"   Top Diagnosis: {top_diagnosis.name} ({top_diagnosis.probability:.2%})")
        print(f"   Confidence: {top_diagnosis.confidence.value}")
    
    print(f"   Treatment Options: {len(decision.treatment_options)}")
    print(f"   Safety Alerts: {len(decision.safety_alerts)}")
    print(f"   Confidence Score: {decision.confidence_score:.2%}")
    print(f"   Romanian Guidelines Applied: {len(decision.romanian_guidelines_applied)}")
    
    # Display safety alerts
    if decision.safety_alerts:
        print(f"\n⚠️ Safety Alerts:")
        for alert in decision.safety_alerts:
            print(f"   - {alert}")
    
    # Display recommended tests
    if decision.recommended_tests:
        print(f"\n🧪 Recommended Tests:")
        for test in decision.recommended_tests[:5]:  # Show first 5
            print(f"   - {test}")
    
    # Test system statistics
    print(f"\n📊 Testing System Statistics...")
    stats = await cdss.get_system_statistics()
    print(f"   System Status: {stats['system_status']}")
    print(f"   Decisions Made: {stats['decisions_made']}")
    print(f"   Safety Alerts Issued: {stats['safety_alerts_issued']}")
    print(f"   Knowledge Base: {stats['knowledge_base_version']}")
    
    print("\n✅ Clinical Decision Support System testing complete!")

if __name__ == "__main__":
    asyncio.run(main())

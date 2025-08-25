"""
🏥 RomAI Medical Reasoning Engine
Advanced medical diagnosis and treatment analysis with clinical decision support
Implements evidence-based reasoning for healthcare applications
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple, Union
import re
from dataclasses import dataclass
from enum import Enum
import json

logger = logging.getLogger(__name__)

class DiagnosticConfidence(Enum):
    HIGHLY_LIKELY = "highly_likely"  # >90%
    LIKELY = "likely"                # 70-90%
    POSSIBLE = "possible"           # 40-70%
    UNLIKELY = "unlikely"           # 10-40%
    HIGHLY_UNLIKELY = "highly_unlikely"  # <10%

class MedicalDomain(Enum):
    CARDIOLOGY = "cardiology"
    NEUROLOGY = "neurology"
    GASTROENTEROLOGY = "gastroenterology"
    PULMONOLOGY = "pulmonology"
    ENDOCRINOLOGY = "endocrinology"
    INFECTIOUS_DISEASE = "infectious_disease"
    GENERAL_MEDICINE = "general_medicine"

@dataclass
class MedicalResult:
    """Standardized result class for medical reasoning"""
    diagnosis: str
    confidence: float
    evidence: List[str]
    differential_diagnoses: List[str]
    recommended_tests: List[str]
    treatment_recommendations: List[str]
    reasoning_steps: List[str]
    medical_domain: str
    risk_factors: List[str] = None
    contraindications: List[str] = None
    
    # Aliases for consistent interface
    @property
    def result(self) -> str:
        return self.diagnosis
        
    @property
    def method(self) -> str:
        return "clinical_reasoning"
        
    @property
    def domain(self) -> str:
        return "medicine"
        
    @property
    def verification(self) -> bool:
        return self.confidence > 0.7
        
    @property
    def solution(self) -> str:
        return self.diagnosis

class AutonomousMedicalEngine:
    """
    🏥 Advanced Medical Reasoning Engine
    Provides clinical decision support through:
    - Symptom analysis and pattern recognition
    - Differential diagnosis generation
    - Treatment recommendation analysis
    - Drug interaction checking
    - Risk stratification
    """
    
    def __init__(self):
        """Initialize medical reasoning engine with clinical knowledge"""
        logger.info("🏥 Initializing Autonomous Medical Reasoning Engine...")
        
        # Medical knowledge bases
        self.symptom_patterns = self._load_symptom_patterns()
        self.drug_interactions = self._load_drug_interactions()
        self.diagnostic_criteria = self._load_diagnostic_criteria()
        
        logger.info("🏥 Medical reasoning engine initialized successfully")
    
    def _load_symptom_patterns(self) -> Dict[str, Any]:
        """Load symptom-disease association patterns"""
        return {
            "chest_pain_crushing_radiating": {
                "conditions": ["myocardial_infarction", "unstable_angina"],
                "confidence_weights": [0.8, 0.6],
                "domain": "cardiology"
            },
            "fever_headache_neck_stiffness": {
                "conditions": ["meningitis", "subarachnoid_hemorrhage"],
                "confidence_weights": [0.9, 0.7],
                "domain": "neurology"
            },
            "polydipsia_polyuria_weight_loss": {
                "conditions": ["diabetes_mellitus_type1", "diabetes_mellitus_type2"],
                "confidence_weights": [0.8, 0.6],
                "domain": "endocrinology"
            },
            "shortness_of_breath_chest_pain_cough": {
                "conditions": ["pneumonia", "pulmonary_embolism", "heart_failure"],
                "confidence_weights": [0.7, 0.6, 0.5],
                "domain": "pulmonology"
            },
            "productive_cough_fever_chest_pain": {
                "conditions": ["pneumonia", "bronchitis", "pneumothorax"],
                "confidence_weights": [0.8, 0.5, 0.3],
                "domain": "pulmonology"
            },
            "abdominal_pain_nausea_vomiting": {
                "conditions": ["appendicitis", "gastroenteritis", "bowel_obstruction"],
                "confidence_weights": [0.6, 0.5, 0.4],
                "domain": "gastroenterology"
            },
            "right_lower_quadrant_pain_nausea": {
                "conditions": ["appendicitis", "ovarian_cyst", "kidney_stone"],
                "confidence_weights": [0.7, 0.4, 0.3],
                "domain": "gastroenterology"
            },
            "fever_productive_cough": {
                "conditions": ["pneumonia", "bronchitis", "tuberculosis"],
                "confidence_weights": [0.7, 0.5, 0.3],
                "domain": "pulmonology"
            }
        }
    
    def _load_drug_interactions(self) -> Dict[str, List[str]]:
        """Load critical drug interaction database"""
        return {
            "warfarin": ["aspirin", "nsaids", "antibiotics"],
            "digoxin": ["loop_diuretics", "quinidine", "verapamil"],
            "statins": ["fibrates", "macrolide_antibiotics", "azole_antifungals"],
            "ace_inhibitors": ["potassium_supplements", "nsaids", "diuretics"],
            "beta_blockers": ["calcium_channel_blockers", "insulin", "bronchodilators"]
        }
    
    def _load_diagnostic_criteria(self) -> Dict[str, Dict]:
        """Load evidence-based diagnostic criteria"""
        return {
            "myocardial_infarction": {
                "major_criteria": [
                    "elevated_troponin",
                    "characteristic_chest_pain", 
                    "ecg_st_elevation"
                ],
                "minor_criteria": [
                    "family_history",
                    "smoking_history",
                    "hypertension"
                ],
                "required_major": 2
            },
            "diabetes_mellitus": {
                "major_criteria": [
                    "fasting_glucose_126",
                    "random_glucose_200",
                    "hba1c_6_5"
                ],
                "minor_criteria": [
                    "polyuria",
                    "polydipsia", 
                    "weight_loss"
                ],
                "required_major": 1
            }
        }
    
    async def diagnose_condition(self, symptoms: str, patient_history: str = "") -> MedicalResult:
        """
        🏥 Primary medical reasoning function
        Analyzes symptoms and patient history to generate differential diagnosis
        """
        try:
            reasoning_steps = [f"Analyzing symptoms: {symptoms}"]
            
            # Extract and analyze symptoms
            symptom_analysis = self._analyze_symptoms(symptoms)
            reasoning_steps.extend(symptom_analysis["steps"])
            
            # Generate differential diagnosis
            differential = self._generate_differential_diagnosis(symptom_analysis)
            reasoning_steps.extend(differential["steps"])
            
            # Determine primary diagnosis
            primary_diagnosis = differential["diagnoses"][0] if differential["diagnoses"] else "Unknown condition"
            
            # Calculate confidence
            confidence = self._calculate_diagnostic_confidence(symptom_analysis, primary_diagnosis)
            
            # Generate recommendations
            tests = self._recommend_diagnostic_tests(primary_diagnosis)
            treatments = self._recommend_treatments(primary_diagnosis)
            
            return MedicalResult(
                diagnosis=primary_diagnosis,
                confidence=confidence,
                evidence=symptom_analysis["evidence"],
                differential_diagnoses=differential["diagnoses"][:3],  # Top 3
                recommended_tests=tests,
                treatment_recommendations=treatments,
                reasoning_steps=reasoning_steps,
                medical_domain=self._determine_domain(primary_diagnosis),
                risk_factors=self._identify_risk_factors(symptoms, patient_history)
            )
            
        except Exception as e:
            logger.error(f"Error in medical diagnosis: {str(e)}")
            return MedicalResult(
                diagnosis=f"Diagnostic error: {str(e)}",
                confidence=0.0,
                evidence=[],
                differential_diagnoses=[],
                recommended_tests=["Consult physician"],
                treatment_recommendations=["Seek immediate medical attention"],
                reasoning_steps=[f"Error occurred: {str(e)}"],
                medical_domain="general_medicine"
            )
    
    def _analyze_symptoms(self, symptoms: str) -> Dict[str, Any]:
        """Analyze symptom patterns and extract clinical features"""
        symptoms_lower = symptoms.lower()
        evidence = []
        steps = []
        
        # Enhanced pattern matching for symptom combinations
        for pattern, data in self.symptom_patterns.items():
            pattern_words = pattern.replace("_", " ").split()
            
            # Check for exact pattern matches
            if all(word in symptoms_lower for word in pattern_words):
                evidence.append(f"Pattern matched: {pattern}")
                steps.append(f"Identified symptom pattern: {pattern}")
                return {
                    "pattern": pattern,
                    "data": data,
                    "evidence": evidence,
                    "steps": steps
                }
        
        # Enhanced individual symptom analysis with better pattern recognition
        symptom_keywords = {
            "chest pain": "cardiovascular_symptom",
            "shortness of breath": "respiratory_cardiovascular_symptom", 
            "fever": "inflammatory_infectious_symptom",
            "headache": "neurological_symptom",
            "nausea": "gastrointestinal_symptom",
            "fatigue": "systemic_symptom",
            "productive cough": "respiratory_symptom",
            "cough": "respiratory_symptom",
            "abdominal pain": "gastrointestinal_symptom",
            "right lower quadrant": "appendicitis_pattern",
            "polyuria": "endocrine_symptom",
            "polydipsia": "endocrine_symptom",
            "weight loss": "systemic_symptom"
        }
        
        matched_patterns = []
        for keyword, category in symptom_keywords.items():
            if keyword in symptoms_lower:
                evidence.append(f"Symptom present: {keyword}")
                steps.append(f"Identified {category}: {keyword}")
                matched_patterns.append(keyword)
        
        # Special logic for common combinations not caught by exact patterns
        if "productive cough" in symptoms_lower and "fever" in symptoms_lower:
            return {
                "pattern": "fever_productive_cough",
                "data": self.symptom_patterns.get("fever_productive_cough", {}),
                "evidence": evidence,
                "steps": steps
            }
        
        if ("right lower quadrant" in symptoms_lower or "rlq" in symptoms_lower) and "nausea" in symptoms_lower:
            return {
                "pattern": "right_lower_quadrant_pain_nausea", 
                "data": self.symptom_patterns.get("right_lower_quadrant_pain_nausea", {}),
                "evidence": evidence,
                "steps": steps
            }
        
        return {
            "pattern": "individual_symptoms",
            "evidence": evidence,
            "steps": steps,
            "matched_symptoms": matched_patterns
        }
    
    def _generate_differential_diagnosis(self, symptom_analysis: Dict) -> Dict[str, Any]:
        """Generate ranked differential diagnosis list"""
        steps = []
        diagnoses = []
        
        if "data" in symptom_analysis and symptom_analysis["data"]:
            # Pattern-based diagnosis
            data = symptom_analysis["data"]
            diagnoses = data["conditions"]
            steps.append(f"Generated differential based on pattern: {symptom_analysis['pattern']}")
            steps.append(f"Primary considerations: {', '.join(diagnoses[:2])}")
        else:
            # Enhanced symptom-based differential with better logic
            evidence_str = str(symptom_analysis["evidence"]).lower()
            matched_symptoms = symptom_analysis.get("matched_symptoms", [])
            
            if "chest pain" in evidence_str:
                if "productive cough" in evidence_str or "fever" in evidence_str:
                    diagnoses = ["pneumonia", "pneumothorax", "pleuritis"]
                else:
                    diagnoses = ["acute_coronary_syndrome", "pulmonary_embolism", "pneumothorax"]
            elif "productive cough" in evidence_str and "fever" in evidence_str:
                diagnoses = ["pneumonia", "bronchitis", "tuberculosis"]
            elif "fever" in evidence_str and "headache" in evidence_str:
                diagnoses = ["viral_infection", "bacterial_infection", "meningitis"]
            elif "abdominal pain" in evidence_str and "nausea" in evidence_str:
                diagnoses = ["appendicitis", "gastroenteritis", "bowel_obstruction"]
            elif "fever" in evidence_str:
                diagnoses = ["viral_infection", "bacterial_infection", "inflammatory_condition"]  
            elif "headache" in evidence_str:
                diagnoses = ["tension_headache", "migraine", "secondary_headache"]
            else:
                diagnoses = ["undifferentiated_illness"]
            
            steps.append("Generated enhanced symptom-based differential diagnosis")
            steps.append(f"Based on key symptoms: {', '.join(matched_symptoms[:3])}")
        
        return {"diagnoses": diagnoses, "steps": steps}
    
    def _calculate_diagnostic_confidence(self, symptom_analysis: Dict, diagnosis: str) -> float:
        """Calculate confidence score for primary diagnosis"""
        base_confidence = 0.3  # Base uncertainty
        
        # Pattern-based confidence boost
        if "data" in symptom_analysis and symptom_analysis["data"]:
            pattern_data = symptom_analysis["data"]
            if diagnosis in pattern_data["conditions"]:
                index = pattern_data["conditions"].index(diagnosis)
                pattern_confidence = pattern_data["confidence_weights"][index]
                return min(0.95, base_confidence + pattern_confidence)
        
        # Evidence-based confidence
        evidence_count = len(symptom_analysis.get("evidence", []))
        evidence_boost = min(0.4, evidence_count * 0.1)
        
        return min(0.85, base_confidence + evidence_boost)
    
    def _recommend_diagnostic_tests(self, diagnosis: str) -> List[str]:
        """Recommend appropriate diagnostic tests"""
        test_recommendations = {
            "myocardial_infarction": ["ECG", "Troponin levels", "CK-MB", "Chest X-ray"],
            "pneumonia": ["Chest X-ray", "CBC with differential", "Blood cultures", "Sputum culture"],
            "diabetes_mellitus_type1": ["Fasting glucose", "HbA1c", "C-peptide", "Autoantibodies"],
            "appendicitis": ["CBC", "CT abdomen/pelvis", "Urinalysis", "CRP"],
            "meningitis": ["Lumbar puncture", "Blood cultures", "CT head", "CBC"]
        }
        
        return test_recommendations.get(diagnosis, ["Complete medical evaluation", "Laboratory studies", "Imaging as indicated"])
    
    def _recommend_treatments(self, diagnosis: str) -> List[str]:
        """Recommend evidence-based treatments"""
        treatment_recommendations = {
            "myocardial_infarction": ["Aspirin 325mg", "Clopidogrel", "Atorvastatin", "Metoprolol", "Emergency catheterization"],
            "pneumonia": ["Empiric antibiotics", "Supportive care", "Oxygen if indicated", "Follow-up chest X-ray"],
            "diabetes_mellitus_type1": ["Insulin therapy", "Blood glucose monitoring", "Diabetic education", "Ophthalmology referral"],
            "appendicitis": ["Surgical consultation", "IV antibiotics", "Pain management", "NPO status"],
            "meningitis": ["IV antibiotics", "Dexamethasone", "Isolation precautions", "Neurology consultation"]
        }
        
        return treatment_recommendations.get(diagnosis, ["Symptomatic treatment", "Follow-up care", "Specialist referral if indicated"])
    
    def _determine_domain(self, diagnosis: str) -> str:
        """Determine medical specialty domain"""
        domain_mapping = {
            "myocardial_infarction": "cardiology",
            "pneumonia": "pulmonology", 
            "diabetes_mellitus_type1": "endocrinology",
            "appendicitis": "gastroenterology",
            "meningitis": "neurology"
        }
        
        return domain_mapping.get(diagnosis, "general_medicine")
    
    def _identify_risk_factors(self, symptoms: str, patient_history: str) -> List[str]:
        """Identify relevant risk factors from symptoms and history"""
        risk_factors = []
        combined_text = (symptoms + " " + patient_history).lower()
        
        risk_mappings = {
            "smoking": "smoking_history",
            "hypertension": "hypertension",
            "diabetes": "diabetes_mellitus",
            "family history": "positive_family_history",
            "obesity": "obesity",
            "age": "advanced_age"
        }
        
        for keyword, risk_factor in risk_mappings.items():
            if keyword in combined_text:
                risk_factors.append(risk_factor)
        
        return risk_factors
    
    async def check_drug_interactions(self, medications: List[str]) -> Dict[str, Any]:
        """Check for potential drug interactions"""
        interactions = []
        warnings = []
        
        for i, med1 in enumerate(medications):
            for j, med2 in enumerate(medications[i+1:], i+1):
                if med1 in self.drug_interactions and med2 in self.drug_interactions[med1]:
                    interaction = f"{med1} + {med2}: Potential interaction"
                    interactions.append(interaction)
                    warnings.append(f"Monitor for increased effects/toxicity")
        
        return {
            "interactions": interactions,
            "warnings": warnings,
            "safety_level": "high_risk" if interactions else "low_risk"
        }
    
    async def analyze_clinical_case(self, case_description: str) -> MedicalResult:
        """
        🏥 Comprehensive clinical case analysis
        Alternative interface for complex case analysis
        """
        return await self.diagnose_condition(case_description)

# Compatibility alias
MedicalSolution = MedicalResult
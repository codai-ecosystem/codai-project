"""
Romanian Cultural Reward Model
==============================

Specialized reward model for evaluating responses based on Romanian cultural values,
regional context, and linguistic authenticity.

Author: RomAI Development Team
Date: August 2025
"""

import logging
from typing import Dict, List
from .rlhf_config import RomanianCulturalValue, RomanianRegions

logger = logging.getLogger(__name__)

class RomanianCulturalRewardModel:
    """Romanian cultural context reward model"""
    
    def __init__(self):
        self.cultural_values = {
            RomanianCulturalValue.OSPITALITATE: 0.9,
            RomanianCulturalValue.RESPECT_TRADITIE: 0.95,
            RomanianCulturalValue.SOLIDARITATE: 0.8,
            RomanianCulturalValue.MANDRIE_NATIONALA: 0.9,
            RomanianCulturalValue.FAMILIA: 0.95,
            RomanianCulturalValue.EDUCATIE: 0.85,
            RomanianCulturalValue.POLITETE: 0.9,
            RomanianCulturalValue.INTEGRITATE: 0.9
        }
        
        self.cultural_keywords = {
            RomanianCulturalValue.OSPITALITATE: [
                "welcome", "guest", "host", "ospitalitate", "musafir", 
                "bun venit", "oaspete", "găzduire"
            ],
            RomanianCulturalValue.RESPECT_TRADITIE: [
                "tradition", "culture", "heritage", "traditie", "cultura",
                "moștenire", "obicei", "datină"
            ],
            RomanianCulturalValue.FAMILIA: [
                "family", "parent", "children", "familie", "părinți",
                "copii", "soție", "soț", "nepoți"
            ],
            RomanianCulturalValue.EDUCATIE: [
                "education", "knowledge", "wisdom", "educație", "cunoștințe",
                "învățământ", "școală", "universitate"
            ]
        }
        
        self.regional_context = {
            region: 0.8 + (hash(region) % 3) * 0.05 
            for region in RomanianRegions.REGIONS
        }
    
    def calculate_cultural_reward(self, text: str, region: str = None) -> Dict[str, float]:
        """
        Calculate reward based on Romanian cultural values
        
        Args:
            text: Response text to evaluate
            region: Optional Romanian region for context
            
        Returns:
            Dictionary with cultural scores
        """
        text_lower = text.lower()
        cultural_scores = {}
        
        for value, weight in self.cultural_values.items():
            keywords = self.cultural_keywords.get(value, [])
            
            # Count keyword matches
            matches = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            
            if matches > 0:
                # Normalize and apply cultural weight
                score = min(matches / len(keywords), 1.0) * weight
                cultural_scores[value.value] = score
            else:
                cultural_scores[value.value] = 0.1  # Small baseline
        
        # Regional context bonus
        region_bonus = 0.0
        if region and region in RomanianRegions.REGIONS:
            region_bonus = self.regional_context.get(region, 0.0) * 0.1
        
        # Calculate overall cultural alignment
        avg_score = sum(cultural_scores.values()) / len(cultural_scores)
        overall_score = min(avg_score + region_bonus, 1.0)
        
        return {
            "cultural_scores": cultural_scores,
            "regional_bonus": region_bonus,
            "overall_cultural_alignment": overall_score
        }
    
    def evaluate_language_authenticity(self, text: str) -> float:
        """Evaluate Romanian language authenticity and quality"""
        
        # Romanian language indicators
        romanian_indicators = [
            "să", "și", "că", "de", "la", "în", "cu", "pe", "pentru",
            "este", "sunt", "era", "au", "vor", "poate", "foarte", "mai"
        ]
        
        # Count Romanian language usage
        text_lower = text.lower()
        romanian_matches = sum(1 for indicator in romanian_indicators 
                             if indicator in text_lower)
        
        # Calculate authenticity score
        authenticity_score = min(romanian_matches / len(romanian_indicators), 1.0)
        
        # Bonus for proper Romanian diacritics
        diacritic_bonus = 0.0
        romanian_diacritics = ["ă", "â", "î", "ș", "ț"]
        if any(diacritic in text for diacritic in romanian_diacritics):
            diacritic_bonus = 0.1
        
        return min(authenticity_score + diacritic_bonus, 1.0)
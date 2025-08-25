"""
RomAI RLHF Training Configuration
=================================

Core configuration classes for RLHF training system with Romanian cultural alignment
and EU AI Act compliance integration.

Author: RomAI Development Team
Date: August 2025
"""

from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum

class PreferenceDataType(Enum):
    """Types of preference data for RLHF training"""
    HUMAN_ANNOTATION = "human_annotation"
    CULTURAL_PREFERENCE = "cultural_preference"
    SAFETY_PREFERENCE = "safety_preference"
    EU_COMPLIANCE = "eu_compliance"
    EXPERT_REVIEW = "expert_review"

class RomanianCulturalValue(Enum):
    """Romanian cultural values for reward modeling"""
    OSPITALITATE = "ospitalitate"      # Hospitality
    RESPECT_TRADITIE = "respect_traditie"  # Respect for tradition
    SOLIDARITATE = "solidaritate"      # Solidarity
    MANDRIE_NATIONALA = "mandrie_nationala"  # National pride
    FAMILIA = "familia"                # Family values
    EDUCATIE = "educatie"             # Education
    POLITETE = "politete"             # Politeness
    INTEGRITATE = "integritate"       # Integrity

@dataclass
class RLHFConfig:
    """Core configuration for RLHF training"""
    
    # Model configuration
    base_model_name: str = "gpt2"
    reward_model_name: str = "gpt2"
    tokenizer_name: str = "gpt2"
    
    # PPO configuration
    ppo_epochs: int = 4
    mini_batch_size: int = 1
    batch_size: int = 8
    learning_rate: float = 1.41e-5
    kl_penalty: str = "kl"
    init_kl_coef: float = 0.2
    target_kl: float = 6.0
    adap_kl_ctrl: bool = True
    
    # Reward model training
    reward_learning_rate: float = 5e-5
    reward_num_epochs: int = 3
    reward_batch_size: int = 8
    
    # Generation configuration
    max_new_tokens: int = 32
    temperature: float = 0.7
    top_p: float = 0.9
    do_sample: bool = True
    
    # Romanian/EU specific weights
    romanian_cultural_weight: float = 0.3
    eu_compliance_weight: float = 0.4
    safety_threshold: float = 0.8
    
    # Training configuration
    total_episodes: int = 1000
    save_frequency: int = 100
    eval_frequency: int = 50
    max_grad_norm: float = 1.0

@dataclass
class PreferenceExample:
    """Single preference example for RLHF training"""
    prompt: str
    chosen_response: str
    rejected_response: str
    preference_strength: float  # 0.0 to 1.0
    data_type: PreferenceDataType
    annotator_id: Optional[str] = None
    cultural_context: Optional[str] = None
    safety_score: Optional[float] = None
    metadata: Optional[Dict] = None

@dataclass
class RomanianRegions:
    """Romanian regions for cultural context"""
    REGIONS = [
        "București", "Transilvania", "Moldova", "Oltenia", 
        "Muntenia", "Banat", "Crișana", "Maramureș", 
        "Dobrogea", "Bucovina"
    ]
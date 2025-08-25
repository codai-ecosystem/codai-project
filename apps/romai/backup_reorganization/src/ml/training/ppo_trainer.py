"""
PPO Training Engine for RomAI RLHF
===================================

Proximal Policy Optimization training engine with TRL library integration,
Romanian cultural alignment, and EU AI Act compliance.

Author: RomAI Development Team
Date: August 2025
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Any, Tuple
import torch
import torch.nn as nn
from dataclasses import asdict

try:
    from trl import PPOConfig, PPOTrainer, AutoModelForCausalLMWithValueHead
    from transformers import AutoTokenizer, AutoModelForCausalLM
    TRL_AVAILABLE = True
except ImportError:
    TRL_AVAILABLE = False
    # Mock classes for development
    class PPOConfig:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    
    class PPOTrainer:
        def __init__(self, *args, **kwargs):
            self.stats = {"objective/kl": 0.1, "ppo/loss/policy": 0.2}
        
        def step(self, *args, **kwargs):
            return self.stats
        
        def generate(self, prompts, **kwargs):
            return [torch.randint(0, 1000, (32,)) for _ in prompts]
    
    class AutoModelForCausalLMWithValueHead:
        @classmethod
        def from_pretrained(cls, *args, **kwargs):
            return cls()

from .rlhf_config import RLHFConfig, PreferenceExample
from .romanian_cultural_reward import RomanianCulturalRewardModel
from .eu_compliance_reward import EUComplianceRewardModel

logger = logging.getLogger(__name__)

class RomAIPPOTrainer:
    """PPO trainer specialized for RomAI with cultural alignment"""
    
    def __init__(self, config: RLHFConfig):
        self.config = config
        self.model = None
        self.ref_model = None
        self.reward_model = None
        self.tokenizer = None
        self.ppo_trainer = None
        
        # Cultural and compliance models
        self.cultural_model = RomanianCulturalRewardModel()
        self.compliance_model = EUComplianceRewardModel()
        
        # Training state
        self.training_stats = {
            'episodes_completed': 0,
            'total_reward': 0.0,
            'cultural_alignment_score': 0.0,
            'eu_compliance_score': 0.0,
            'safety_score': 0.0
        }
    
    async def initialize_models(self):
        """Initialize all models for PPO training"""
        try:
            if TRL_AVAILABLE:
                logger.info("🚀 Initializing TRL-based PPO models")
                
                # Initialize tokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(self.config.tokenizer_name)
                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                
                # Initialize main model with value head
                self.model = AutoModelForCausalLMWithValueHead.from_pretrained(
                    self.config.base_model_name,
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
                )
                
                # Initialize reference model
                self.ref_model = AutoModelForCausalLMWithValueHead.from_pretrained(
                    self.config.base_model_name,
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
                )
                
                logger.info("✅ TRL models initialized successfully")
            else:
                logger.warning("⚠️ TRL not available, using mock models for development")
                self.tokenizer = None
                self.model = AutoModelForCausalLMWithValueHead()
                self.ref_model = AutoModelForCausalLMWithValueHead()
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize PPO models: {e}")
            raise
    
    def setup_ppo_trainer(self):
        """Setup the TRL PPO trainer with Romanian-specific configuration"""
        try:
            ppo_config = PPOConfig(
                model_name=self.config.base_model_name,
                learning_rate=self.config.learning_rate,
                batch_size=self.config.batch_size,
                mini_batch_size=self.config.mini_batch_size,
                ppo_epochs=self.config.ppo_epochs,
                init_kl_coef=self.config.init_kl_coef,
                target_kl=self.config.target_kl,
                kl_penalty=self.config.kl_penalty,
                adap_kl_ctrl=self.config.adap_kl_ctrl,
                cliprange=0.2,
                cliprange_value=0.2,
                vf_coef=0.1,
                remove_unused_columns=False
            )
            
            if TRL_AVAILABLE and self.tokenizer:
                self.ppo_trainer = PPOTrainer(
                    ppo_config,
                    self.model,
                    self.ref_model,
                    self.tokenizer
                )
                logger.info("✅ PPO trainer initialized with TRL")
            else:
                self.ppo_trainer = PPOTrainer()
                logger.info("⚠️ Using mock PPO trainer")
                
        except Exception as e:
            logger.error(f"❌ Failed to setup PPO trainer: {e}")
            raise
    
    def calculate_comprehensive_reward(self, prompt: str, response: str, context: Dict = None) -> Dict[str, float]:
        """
        Calculate comprehensive reward including cultural and compliance factors
        
        Args:
            prompt: Original prompt
            response: Generated response
            context: Optional context information
            
        Returns:
            Dictionary with detailed reward breakdown
        """
        # Cultural alignment reward
        cultural_result = self.cultural_model.calculate_cultural_reward(
            response, 
            region=context.get('region') if context else None
        )
        cultural_score = cultural_result["overall_cultural_alignment"]
        
        # EU compliance reward
        compliance_result = self.compliance_model.calculate_compliance_reward(response, prompt)
        compliance_score = compliance_result["overall_compliance_score"]
        
        # Language authenticity
        authenticity_score = self.cultural_model.evaluate_language_authenticity(response)
        
        # Safety evaluation
        safety_score = self._evaluate_safety(response)
        
        # Response quality metrics
        quality_metrics = self._evaluate_response_quality(prompt, response)
        
        # Weighted combination
        total_reward = (
            cultural_score * self.config.romanian_cultural_weight +
            compliance_score * self.config.eu_compliance_weight +
            authenticity_score * 0.15 +
            safety_score * 0.15
        )
        
        return {
            "total_reward": min(max(total_reward, 0.0), 1.0),
            "cultural_alignment": cultural_score,
            "eu_compliance": compliance_score,
            "language_authenticity": authenticity_score,
            "safety_score": safety_score,
            "quality_metrics": quality_metrics,
            "detailed_cultural": cultural_result,
            "detailed_compliance": compliance_result
        }
    
    def _evaluate_safety(self, response: str) -> float:
        """Evaluate response safety"""
        # Safety indicators
        harmful_patterns = [
            "violence", "hate", "discrimination", "harm", "illegal",
            "violență", "ură", "discriminare", "rău", "ilegal"
        ]
        
        # Count harmful patterns
        response_lower = response.lower()
        harmful_count = sum(1 for pattern in harmful_patterns if pattern in response_lower)
        
        # Calculate safety score (higher = safer)
        if harmful_count == 0:
            return 0.95
        else:
            return max(0.0, 0.95 - (harmful_count * 0.3))
    
    def _evaluate_response_quality(self, prompt: str, response: str) -> Dict[str, float]:
        """Evaluate general response quality metrics"""
        return {
            "coherence": self._calculate_coherence(prompt, response),
            "relevance": self._calculate_relevance(prompt, response),
            "completeness": self._calculate_completeness(prompt, response),
            "fluency": self._calculate_fluency(response)
        }
    
    def _calculate_coherence(self, prompt: str, response: str) -> float:
        """Calculate response coherence"""
        # Simple heuristic based on response structure
        sentences = response.split('.')
        if len(sentences) < 2:
            return 0.5
        
        # Check for logical flow (simplified)
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        if 5 <= avg_sentence_length <= 25:
            return 0.8
        else:
            return 0.6
    
    def _calculate_relevance(self, prompt: str, response: str) -> float:
        """Calculate prompt-response relevance"""
        # Simple keyword overlap
        prompt_words = set(prompt.lower().split())
        response_words = set(response.lower().split())
        
        if not prompt_words:
            return 0.5
        
        overlap = len(prompt_words.intersection(response_words))
        relevance = min(overlap / len(prompt_words), 1.0)
        
        return max(relevance, 0.3)  # Minimum baseline
    
    def _calculate_completeness(self, prompt: str, response: str) -> float:
        """Calculate response completeness"""
        # Heuristic based on response length vs prompt
        if len(response.split()) >= len(prompt.split()):
            return 0.8
        else:
            return 0.5
    
    def _calculate_fluency(self, response: str) -> float:
        """Calculate response fluency"""
        # Simple fluency heuristic
        words = response.split()
        if len(words) < 3:
            return 0.3
        
        # Check for basic sentence structure
        sentences = response.split('.')
        if len(sentences) >= 1:
            return 0.75
        
        return 0.6
    
    async def run_ppo_training_episode(self, prompts: List[str]) -> Dict[str, Any]:
        """
        Run a single PPO training episode
        
        Args:
            prompts: List of training prompts
            
        Returns:
            Episode training metrics
        """
        episode_start = time.time()
        episode_rewards = []
        episode_stats = {}
        
        try:
            # Generation parameters
            generation_kwargs = {
                "min_length": -1,
                "top_k": 0.0,
                "top_p": self.config.top_p,
                "do_sample": self.config.do_sample,
                "pad_token_id": self.tokenizer.eos_token_id if self.tokenizer else 0,
                "max_new_tokens": self.config.max_new_tokens,
                "temperature": self.config.temperature
            }
            
            for i, prompt in enumerate(prompts[:self.config.batch_size]):
                if TRL_AVAILABLE and self.tokenizer:
                    # Encode prompt
                    prompt_tensor = self.tokenizer.encode(prompt, return_tensors="pt")
                    
                    # Generate response
                    response_tensors = self.ppo_trainer.generate(
                        [prompt_tensor.squeeze()], 
                        return_prompt=False,
                        **generation_kwargs
                    )
                    
                    # Decode response
                    response_text = self.tokenizer.decode(
                        response_tensors[0], 
                        skip_special_tokens=True
                    )
                    
                    # Calculate reward
                    reward_breakdown = self.calculate_comprehensive_reward(prompt, response_text)
                    reward = reward_breakdown["total_reward"]
                    
                    # PPO step
                    rewards = [torch.tensor(reward, dtype=torch.float32)]
                    stats = self.ppo_trainer.step([prompt_tensor.squeeze()], response_tensors, rewards)
                    
                else:
                    # Mock training for development
                    response_text = f"Mock response for: {prompt}"
                    reward_breakdown = self.calculate_comprehensive_reward(prompt, response_text)
                    reward = reward_breakdown["total_reward"]
                    
                    stats = {
                        "objective/kl": 0.1 + (i * 0.01),
                        "ppo/loss/policy": 0.2 - (i * 0.01),
                        "ppo/loss/value": 0.15,
                        "ppo/val/ratio": 1.0,
                        "ppo/pol/entropy": 4.5
                    }
                
                episode_rewards.append(reward)
                episode_stats = stats
                
                # Update training stats
                self.training_stats['cultural_alignment_score'] += reward_breakdown["cultural_alignment"]
                self.training_stats['eu_compliance_score'] += reward_breakdown["eu_compliance"]
                self.training_stats['safety_score'] += reward_breakdown["safety_score"]
            
            # Calculate episode metrics
            avg_reward = sum(episode_rewards) / len(episode_rewards)
            episode_time = time.time() - episode_start
            
            self.training_stats['episodes_completed'] += 1
            self.training_stats['total_reward'] += avg_reward
            
            return {
                "episode_completed": True,
                "episode_time": episode_time,
                "average_reward": avg_reward,
                "num_prompts": len(prompts),
                "ppo_stats": episode_stats,
                "reward_breakdown": {
                    "cultural_alignment": self.training_stats['cultural_alignment_score'] / len(prompts),
                    "eu_compliance": self.training_stats['eu_compliance_score'] / len(prompts),
                    "safety_score": self.training_stats['safety_score'] / len(prompts)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ PPO training episode failed: {e}")
            return {
                "episode_completed": False,
                "error": str(e),
                "episode_time": time.time() - episode_start
            }
    
    def get_training_stats(self) -> Dict[str, Any]:
        """Get current training statistics"""
        episodes = max(self.training_stats['episodes_completed'], 1)
        
        return {
            "episodes_completed": episodes,
            "average_reward": self.training_stats['total_reward'] / episodes,
            "average_cultural_alignment": self.training_stats['cultural_alignment_score'] / episodes,
            "average_eu_compliance": self.training_stats['eu_compliance_score'] / episodes,
            "average_safety_score": self.training_stats['safety_score'] / episodes,
            "trl_available": TRL_AVAILABLE
        }
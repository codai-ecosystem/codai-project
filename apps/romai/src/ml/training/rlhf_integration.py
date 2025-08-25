"""
RLHF Integration Service for RomAI Model Server
===============================================

FastAPI integration service for RLHF training capabilities,
providing REST endpoints for training management and monitoring.

Author: RomAI Development Team  
Date: August 2025
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

from .rlhf_config import RLHFConfig, PreferenceExample
from .ppo_trainer import RomAIPPOTrainer
from .preference_collector import PreferenceDataCollector
from .romanian_cultural_reward import RomanianCulturalRewardModel
from .eu_compliance_reward import EUComplianceRewardModel

logger = logging.getLogger(__name__)

class RLHFIntegrationService:
    """Service class for integrating RLHF capabilities with RomAI model server"""
    
    def __init__(self, config: Optional[RLHFConfig] = None):
        self.config = config or RLHFConfig()
        
        # Initialize core components
        self.ppo_trainer = RomAIPPOTrainer(self.config)
        self.preference_collector = PreferenceDataCollector(self.config)
        self.cultural_model = RomanianCulturalRewardModel()
        self.compliance_model = EUComplianceRewardModel()
        
        # Training state
        self.training_active = False
        self.training_stats = {
            'training_started': False,
            'current_episode': 0,
            'total_episodes': 0,
            'start_time': None,
            'last_update': None,
            'performance_metrics': {}
        }
        
        # Initialize models flag
        self.models_initialized = False
    
    async def initialize(self) -> Dict[str, Any]:
        """Initialize RLHF service components"""
        try:
            logger.info("🚀 Initializing RLHF Integration Service")
            
            # Initialize PPO trainer models
            await self.ppo_trainer.initialize_models()
            self.ppo_trainer.setup_ppo_trainer()
            
            self.models_initialized = True
            
            result = {
                'initialized': True,
                'components': {
                    'ppo_trainer': True,
                    'preference_collector': True,
                    'cultural_model': True,
                    'compliance_model': True
                },
                'config': {
                    'base_model': self.config.base_model_name,
                    'cultural_weight': self.config.romanian_cultural_weight,
                    'compliance_weight': self.config.eu_compliance_weight,
                    'total_episodes': self.config.total_episodes
                },
                'trl_available': hasattr(self.ppo_trainer, 'TRL_AVAILABLE') and getattr(self.ppo_trainer, 'TRL_AVAILABLE', False)
            }
            
            logger.info("✅ RLHF Integration Service initialized successfully")
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize RLHF service: {e}")
            return {
                'initialized': False,
                'error': str(e)
            }
    
    async def start_rlhf_training(self, training_prompts: List[str], num_episodes: int = None) -> Dict[str, Any]:
        """
        Start RLHF training process
        
        Args:
            training_prompts: List of prompts for training
            num_episodes: Optional override for number of episodes
            
        Returns:
            Training start status and initial metrics
        """
        if not self.models_initialized:
            await self.initialize()
        
        if self.training_active:
            return {
                'started': False,
                'error': 'Training already in progress'
            }
        
        try:
            logger.info(f"🎯 Starting RLHF training with {len(training_prompts)} prompts")
            
            # Update training configuration
            if num_episodes:
                self.config.total_episodes = num_episodes
            
            # Initialize training state
            self.training_active = True
            self.training_stats = {
                'training_started': True,
                'current_episode': 0,
                'total_episodes': self.config.total_episodes,
                'start_time': datetime.now(),
                'last_update': datetime.now(),
                'total_prompts': len(training_prompts),
                'performance_metrics': {
                    'average_reward': 0.0,
                    'cultural_alignment': 0.0,
                    'eu_compliance': 0.0,
                    'safety_score': 0.0
                }
            }
            
            # Start background training task
            training_task = asyncio.create_task(
                self._run_training_loop(training_prompts)
            )
            
            result = {
                'started': True,
                'training_id': f"rlhf_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'config': {
                    'total_episodes': self.config.total_episodes,
                    'batch_size': self.config.batch_size,
                    'learning_rate': self.config.learning_rate,
                    'cultural_weight': self.config.romanian_cultural_weight,
                    'compliance_weight': self.config.eu_compliance_weight
                },
                'initial_stats': self.training_stats
            }
            
            logger.info("✅ RLHF training started successfully")
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to start RLHF training: {e}")
            self.training_active = False
            return {
                'started': False,
                'error': str(e)
            }
    
    async def _run_training_loop(self, training_prompts: List[str]):
        """Background training loop"""
        try:
            episodes_per_batch = min(self.config.batch_size, len(training_prompts))
            
            for episode in range(self.config.total_episodes):
                if not self.training_active:
                    logger.info("🛑 Training stopped by user")
                    break
                
                # Select prompts for this episode
                prompt_batch = training_prompts[:episodes_per_batch]
                
                # Run PPO training episode
                episode_results = await self.ppo_trainer.run_ppo_training_episode(prompt_batch)
                
                # Update training stats
                if episode_results['episode_completed']:
                    self.training_stats['current_episode'] = episode + 1
                    self.training_stats['last_update'] = datetime.now()
                    
                    # Update performance metrics
                    self.training_stats['performance_metrics'].update({
                        'average_reward': episode_results['average_reward'],
                        'cultural_alignment': episode_results['reward_breakdown']['cultural_alignment'],
                        'eu_compliance': episode_results['reward_breakdown']['eu_compliance'],
                        'safety_score': episode_results['reward_breakdown']['safety_score']
                    })
                    
                    # Log progress
                    if (episode + 1) % 10 == 0:
                        logger.info(f"📊 Episode {episode + 1}/{self.config.total_episodes} - "
                                   f"Reward: {episode_results['average_reward']:.3f}")
                
                # Small delay to prevent overwhelming
                await asyncio.sleep(0.1)
            
            # Training completed
            self.training_active = False
            self.training_stats['completed'] = True
            self.training_stats['completion_time'] = datetime.now()
            
            logger.info("🎉 RLHF training completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Training loop failed: {e}")
            self.training_active = False
            self.training_stats['error'] = str(e)
    
    def stop_rlhf_training(self) -> Dict[str, Any]:
        """Stop ongoing RLHF training"""
        if not self.training_active:
            return {
                'stopped': False,
                'message': 'No training in progress'
            }
        
        self.training_active = False
        self.training_stats['stopped'] = True
        self.training_stats['stop_time'] = datetime.now()
        
        logger.info("🛑 RLHF training stopped by user")
        
        return {
            'stopped': True,
            'final_stats': self.training_stats
        }
    
    def get_training_status(self) -> Dict[str, Any]:
        """Get current training status and metrics"""
        base_status = {
            'service_initialized': self.models_initialized,
            'training_active': self.training_active,
            'training_stats': self.training_stats.copy() if self.training_stats else {},
        }
        
        if self.models_initialized:
            base_status['ppo_stats'] = self.ppo_trainer.get_training_stats()
            base_status['preference_stats'] = self.preference_collector.get_collection_stats()
        
        return base_status
    
    async def collect_preference_batch(
        self, 
        prompts: List[str], 
        response_pairs: List[tuple],
        contexts: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Collect preference data batch
        
        Args:
            prompts: List of prompts
            response_pairs: List of (response_a, response_b) tuples
            contexts: Optional context information
            
        Returns:
            Collection results
        """
        try:
            logger.info(f"📊 Collecting preferences for {len(prompts)} prompts")
            
            preferences = await self.preference_collector.collect_batch_preferences(
                prompts, response_pairs, contexts
            )
            
            result = {
                'collected': True,
                'num_preferences': len(preferences),
                'preferences': [
                    {
                        'prompt': p.prompt,
                        'preference_strength': p.preference_strength,
                        'data_type': p.data_type.value,
                        'cultural_context': p.cultural_context,
                        'safety_score': p.safety_score
                    }
                    for p in preferences
                ],
                'collection_stats': self.preference_collector.get_collection_stats()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to collect preferences: {e}")
            return {
                'collected': False,
                'error': str(e)
            }
    
    async def evaluate_response_quality(
        self, 
        prompt: str, 
        response: str, 
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Evaluate response quality using reward models
        
        Args:
            prompt: Original prompt
            response: Generated response
            context: Optional context information
            
        Returns:
            Detailed quality evaluation
        """
        try:
            # Cultural evaluation
            cultural_result = self.cultural_model.calculate_cultural_reward(
                response, 
                region=context.get('region') if context else None
            )
            
            # EU compliance evaluation  
            compliance_result = self.compliance_model.calculate_compliance_reward(response, prompt)
            
            # Language authenticity
            authenticity_score = self.cultural_model.evaluate_language_authenticity(response)
            
            # PPO comprehensive reward (if available)
            if self.models_initialized:
                reward_breakdown = self.ppo_trainer.calculate_comprehensive_reward(
                    prompt, response, context
                )
            else:
                reward_breakdown = {
                    'total_reward': (cultural_result['overall_cultural_alignment'] + 
                                   compliance_result['overall_compliance_score']) / 2,
                    'safety_score': 0.8
                }
            
            evaluation = {
                'overall_quality': reward_breakdown['total_reward'],
                'cultural_alignment': cultural_result['overall_cultural_alignment'],
                'eu_compliance': compliance_result['overall_compliance_score'],
                'language_authenticity': authenticity_score,
                'safety_score': reward_breakdown['safety_score'],
                'detailed_breakdown': {
                    'cultural_details': cultural_result,
                    'compliance_details': compliance_result,
                    'quality_metrics': reward_breakdown.get('quality_metrics', {})
                },
                'recommendations': self._generate_improvement_recommendations(
                    cultural_result, compliance_result, authenticity_score
                )
            }
            
            return evaluation
            
        except Exception as e:
            logger.error(f"❌ Failed to evaluate response quality: {e}")
            return {
                'error': str(e)
            }
    
    def _generate_improvement_recommendations(
        self, 
        cultural_result: Dict, 
        compliance_result: Dict, 
        authenticity_score: float
    ) -> List[str]:
        """Generate improvement recommendations based on evaluation"""
        recommendations = []
        
        if cultural_result['overall_cultural_alignment'] < 0.7:
            recommendations.append("Îmbunătățiți alinierea culturală românească prin referințe la tradiții și valori locale")
        
        if compliance_result['overall_compliance_score'] < 0.8:
            recommendations.append("Respectați mai bine principiile EU AI Act prin transparență și explicabilitate")
        
        if authenticity_score < 0.6:
            recommendations.append("Utilizați română mai autentică cu diacritice și expresii naturale")
        
        if compliance_result['risk_indicators_detected'] > 0:
            recommendations.append("Eliminați indicatorii de risc și îmbunătățiți siguranța răspunsului")
        
        return recommendations
    
    def get_service_health(self) -> Dict[str, Any]:
        """Get service health status"""
        return {
            'service': 'RLHF Integration Service',
            'status': 'healthy' if self.models_initialized else 'initializing',
            'components': {
                'models_initialized': self.models_initialized,
                'training_active': self.training_active,
                'ppo_trainer_ready': hasattr(self.ppo_trainer, 'model') and self.ppo_trainer.model is not None,
                'preference_collector_ready': len(self.preference_collector.cultural_experts) > 0
            },
            'statistics': {
                'preference_data_collected': len(self.preference_collector.preference_data),
                'training_episodes_completed': self.training_stats.get('current_episode', 0),
                'service_uptime': str(datetime.now() - (self.training_stats.get('start_time') or datetime.now()))
            }
        }

# Global service instance
rlhf_service = RLHFIntegrationService()

async def get_rlhf_service() -> RLHFIntegrationService:
    """Get the global RLHF service instance"""
    return rlhf_service
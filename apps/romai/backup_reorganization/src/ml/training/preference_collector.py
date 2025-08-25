"""
Preference Data Collection System
=================================

Human preference data collection and annotation system for RLHF training
with Romanian cultural context and EU compliance integration.

Author: RomAI Development Team
Date: August 2025
"""

import asyncio
import logging
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import asdict
import random

from .rlhf_config import PreferenceExample, PreferenceDataType, RomanianCulturalValue
from .romanian_cultural_reward import RomanianCulturalRewardModel
from .eu_compliance_reward import EUComplianceRewardModel

logger = logging.getLogger(__name__)

class PreferenceDataCollector:
    """Collects and manages human preference data for RLHF training"""
    
    def __init__(self, config=None):
        self.config = config
        self.preference_data = []
        self.annotation_queue = []
        self.completed_annotations = []
        
        # Reward models for automated evaluation
        self.cultural_model = RomanianCulturalRewardModel()
        self.compliance_model = EUComplianceRewardModel()
        
        # Romanian cultural experts simulation
        self.cultural_experts = {
            'București': {'name': 'Dr. Maria Popescu', 'expertise': 'Urban Romanian culture'},
            'Transilvania': {'name': 'Prof. Ioan Moldovan', 'expertise': 'Transylvanian traditions'},
            'Moldova': {'name': 'Dr. Elena Rusu', 'expertise': 'Moldovan cultural heritage'},
            'Banat': {'name': 'Prof. Mircea Jovan', 'expertise': 'Banat multicultural context'}
        }
    
    async def create_preference_annotation_request(
        self, 
        prompt: str,
        response_a: str, 
        response_b: str,
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create a preference annotation request for human reviewers
        
        Args:
            prompt: Original prompt
            response_a: First response option
            response_b: Second response option  
            context: Optional context information
            
        Returns:
            Annotation request structure
        """
        request_id = f"pref_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
        
        # Pre-evaluate with automated models
        cultural_a = self.cultural_model.calculate_cultural_reward(response_a)
        cultural_b = self.cultural_model.calculate_cultural_reward(response_b)
        
        compliance_a = self.compliance_model.calculate_compliance_reward(response_a, prompt)
        compliance_b = self.compliance_model.calculate_compliance_reward(response_b, prompt)
        
        request = {
            'id': request_id,
            'prompt': prompt,
            'response_a': response_a,
            'response_b': response_b,
            'context': context or {},
            'automated_evaluation': {
                'cultural_scores': {
                    'response_a': cultural_a["overall_cultural_alignment"],
                    'response_b': cultural_b["overall_cultural_alignment"]
                },
                'compliance_scores': {
                    'response_a': compliance_a["overall_compliance_score"],
                    'response_b': compliance_b["overall_compliance_score"]
                },
                'predicted_preference': 'a' if (cultural_a["overall_cultural_alignment"] + 
                                               compliance_a["overall_compliance_score"]) > 
                                              (cultural_b["overall_cultural_alignment"] + 
                                               compliance_b["overall_compliance_score"]) else 'b'
            },
            'evaluation_criteria': {
                'cultural_appropriateness': 'Cât de potrivit cultural este răspunsul pentru contextul românesc?',
                'language_quality': 'Calitatea limbii române și autenticitatea expresiei',
                'factual_accuracy': 'Acuratețea și corectitudinea informațiilor',
                'eu_compliance': 'Respectarea principiilor EU AI Act',
                'helpfulness': 'Cât de util este răspunsul pentru utilizator?',
                'harmlessness': 'Absența conținutului dăunător sau ofensator',
                'honesty': 'Transparența și onestitatea răspunsului'
            },
            'regional_context': context.get('region') if context else None,
            'target_audience': context.get('audience') if context else 'general',
            'created_at': datetime.now(),
            'status': 'pending',
            'assigned_expert': None
        }
        
        self.annotation_queue.append(request)
        logger.info(f"📋 Created preference annotation request: {request_id}")
        
        return request
    
    async def assign_to_cultural_expert(self, request_id: str, region: str = None) -> bool:
        """
        Assign annotation request to appropriate cultural expert
        
        Args:
            request_id: ID of annotation request
            region: Romanian region for expert selection
            
        Returns:
            Assignment success status
        """
        # Find request
        request = None
        for req in self.annotation_queue:
            if req['id'] == request_id:
                request = req
                break
        
        if not request:
            logger.error(f"❌ Request {request_id} not found")
            return False
        
        # Select expert based on region or content
        expert_region = region or request.get('regional_context') or 'București'
        
        if expert_region in self.cultural_experts:
            expert = self.cultural_experts[expert_region]
            request['assigned_expert'] = {
                'region': expert_region,
                'name': expert['name'],
                'expertise': expert['expertise'],
                'assigned_at': datetime.now()
            }
            request['status'] = 'assigned'
            
            logger.info(f"👨‍🎓 Assigned request {request_id} to {expert['name']} ({expert_region})")
            return True
        else:
            logger.warning(f"⚠️ No expert available for region: {expert_region}")
            return False
    
    async def simulate_expert_annotation(self, request_id: str) -> Optional[PreferenceExample]:
        """
        Simulate expert annotation for development/testing
        
        Args:
            request_id: ID of annotation request
            
        Returns:
            Completed preference example
        """
        # Find request
        request = None
        for req in self.annotation_queue:
            if req['id'] == request_id:
                request = req
                break
        
        if not request:
            return None
        
        # Simulate expert evaluation
        await asyncio.sleep(0.1)  # Simulate thinking time
        
        # Use automated evaluation as base with some variance
        cultural_a = self.cultural_model.calculate_cultural_reward(request['response_a'])
        cultural_b = self.cultural_model.calculate_cultural_reward(request['response_b'])
        
        compliance_a = self.compliance_model.calculate_compliance_reward(
            request['response_a'], request['prompt']
        )
        compliance_b = self.compliance_model.calculate_compliance_reward(
            request['response_b'], request['prompt']
        )
        
        # Calculate combined scores with expert variance
        score_a = (
            cultural_a["overall_cultural_alignment"] * 0.4 +
            compliance_a["overall_compliance_score"] * 0.4 +
            random.uniform(0.1, 0.2)  # Expert judgment variance
        )
        score_b = (
            cultural_b["overall_cultural_alignment"] * 0.4 +
            compliance_b["overall_compliance_score"] * 0.4 +
            random.uniform(0.1, 0.2)  # Expert judgment variance
        )
        
        # Determine preference
        if score_a > score_b:
            chosen = request['response_a']
            rejected = request['response_b']
            preference_strength = min(score_a - score_b, 1.0)
        else:
            chosen = request['response_b']
            rejected = request['response_a']
            preference_strength = min(score_b - score_a, 1.0)
        
        # Create preference example
        preference = PreferenceExample(
            prompt=request['prompt'],
            chosen_response=chosen,
            rejected_response=rejected,
            preference_strength=preference_strength,
            data_type=PreferenceDataType.HUMAN_ANNOTATION,
            annotator_id=request.get('assigned_expert', {}).get('name', 'simulated_expert'),
            cultural_context=request.get('regional_context', 'romanian'),
            safety_score=(score_a + score_b) / 2,
            metadata={
                'request_id': request_id,
                'cultural_score_a': cultural_a["overall_cultural_alignment"],
                'cultural_score_b': cultural_b["overall_cultural_alignment"],
                'compliance_score_a': compliance_a["overall_compliance_score"],
                'compliance_score_b': compliance_b["overall_compliance_score"],
                'expert_region': request.get('assigned_expert', {}).get('region'),
                'annotation_time': datetime.now().isoformat()
            }
        )
        
        # Move to completed
        request['status'] = 'completed'
        request['completed_at'] = datetime.now()
        self.completed_annotations.append(request)
        self.preference_data.append(preference)
        
        logger.info(f"✅ Completed annotation for {request_id} - Preference strength: {preference_strength:.3f}")
        
        return preference
    
    async def collect_batch_preferences(
        self, 
        prompts: List[str], 
        response_pairs: List[Tuple[str, str]],
        contexts: Optional[List[Dict]] = None
    ) -> List[PreferenceExample]:
        """
        Collect preferences for a batch of prompt-response pairs
        
        Args:
            prompts: List of prompts
            response_pairs: List of (response_a, response_b) tuples
            contexts: Optional context information for each pair
            
        Returns:
            List of completed preference examples
        """
        logger.info(f"📊 Collecting batch preferences for {len(prompts)} prompts")
        batch_start = time.time()
        
        preferences = []
        contexts = contexts or [None] * len(prompts)
        
        # Create annotation requests
        request_ids = []
        for i, (prompt, (resp_a, resp_b), context) in enumerate(zip(prompts, response_pairs, contexts)):
            request = await self.create_preference_annotation_request(
                prompt, resp_a, resp_b, context
            )
            request_ids.append(request['id'])
            
            # Assign to expert
            await self.assign_to_cultural_expert(request['id'])
        
        # Process annotations (simulate concurrent expert work)
        annotation_tasks = [
            self.simulate_expert_annotation(req_id) 
            for req_id in request_ids
        ]
        
        results = await asyncio.gather(*annotation_tasks)
        preferences = [p for p in results if p is not None]
        
        batch_time = time.time() - batch_start
        
        logger.info(f"✅ Batch preference collection completed:")
        logger.info(f"   📊 Collected: {len(preferences)} preferences")
        logger.info(f"   ⏱️ Time: {batch_time:.2f}s")
        logger.info(f"   📈 Average preference strength: {sum(p.preference_strength for p in preferences) / len(preferences):.3f}")
        
        return preferences
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about preference data collection"""
        if not self.preference_data:
            return {
                'total_preferences': 0,
                'collection_rate': 0,
                'average_preference_strength': 0,
                'cultural_distribution': {},
                'data_type_distribution': {},
                'expert_distribution': {}
            }
        
        total = len(self.preference_data)
        
        # Calculate averages
        avg_strength = sum(p.preference_strength for p in self.preference_data) / total
        avg_safety = sum(p.safety_score or 0 for p in self.preference_data) / total
        
        # Distribution analysis
        cultural_dist = {}
        data_type_dist = {}
        expert_dist = {}
        
        for pref in self.preference_data:
            # Cultural context distribution
            cultural = pref.cultural_context or 'unknown'
            cultural_dist[cultural] = cultural_dist.get(cultural, 0) + 1
            
            # Data type distribution
            data_type = pref.data_type.value
            data_type_dist[data_type] = data_type_dist.get(data_type, 0) + 1
            
            # Expert distribution
            expert = pref.annotator_id or 'unknown'
            expert_dist[expert] = expert_dist.get(expert, 0) + 1
        
        return {
            'total_preferences': total,
            'pending_annotations': len(self.annotation_queue),
            'completed_annotations': len(self.completed_annotations),
            'collection_rate': len(self.completed_annotations) / max(len(self.annotation_queue) + len(self.completed_annotations), 1),
            'average_preference_strength': avg_strength,
            'average_safety_score': avg_safety,
            'cultural_distribution': cultural_dist,
            'data_type_distribution': data_type_dist,
            'expert_distribution': expert_dist,
            'quality_metrics': {
                'high_confidence_preferences': sum(1 for p in self.preference_data if p.preference_strength > 0.7),
                'cultural_alignment_rate': sum(1 for p in self.preference_data if p.cultural_context == 'romanian') / total
            }
        }
    
    def export_preference_data(self, filepath: str, format: str = 'json'):
        """
        Export collected preference data
        
        Args:
            filepath: Output file path
            format: Export format ('json', 'csv', 'jsonl')
        """
        if format == 'json':
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(
                    [asdict(pref) for pref in self.preference_data], 
                    f, indent=2, ensure_ascii=False, default=str
                )
        elif format == 'jsonl':
            with open(filepath, 'w', encoding='utf-8') as f:
                for pref in self.preference_data:
                    json.dump(asdict(pref), f, ensure_ascii=False, default=str)
                    f.write('\n')
        
        logger.info(f"💾 Exported {len(self.preference_data)} preferences to {filepath}")
    
    def load_preference_data(self, filepath: str, format: str = 'json'):
        """
        Load preference data from file
        
        Args:
            filepath: Input file path
            format: File format ('json', 'jsonl')
        """
        try:
            if format == 'json':
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.preference_data = [
                        PreferenceExample(**item) for item in data
                    ]
            elif format == 'jsonl':
                self.preference_data = []
                with open(filepath, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.strip():
                            item = json.loads(line)
                            self.preference_data.append(PreferenceExample(**item))
            
            logger.info(f"📁 Loaded {len(self.preference_data)} preferences from {filepath}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load preference data: {e}")
            raise
"""
RomAI AGI RLHF Foundation System - Phase 2 Implementation
Reinforcement Learning from Human Feedback with Romanian cultural alignment.
"""

import asyncio
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, field
from enum import Enum
import json
import time
import random
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class FeedbackType(Enum):
    """Types of human feedback"""
    PREFERENCE_RANKING = "preference_ranking"
    BINARY_COMPARISON = "binary_comparison"
    SCALAR_RATING = "scalar_rating"
    CONSTITUTIONAL_FEEDBACK = "constitutional_feedback"
    CULTURAL_ALIGNMENT = "cultural_alignment"
    SAFETY_ASSESSMENT = "safety_assessment"

class RewardModelType(Enum):
    """Types of reward models"""
    PREFERENCE_MODEL = "preference_model"
    CONSTITUTIONAL_MODEL = "constitutional_model"
    CULTURAL_MODEL = "cultural_model"
    SAFETY_MODEL = "safety_model"
    COMBINED_MODEL = "combined_model"

@dataclass
class HumanFeedback:
    """Human feedback data structure"""
    feedback_id: str
    feedback_type: FeedbackType
    prompt: str
    responses: List[str]
    human_preference: Union[int, float, List[int]]  # Ranking, rating, or binary choice
    cultural_context: Optional[str] = None
    safety_concerns: List[str] = field(default_factory=list)
    constitutional_notes: List[str] = field(default_factory=list)
    feedback_quality: float = 1.0
    annotator_expertise: str = "general"  # general, cultural_expert, safety_expert
    timestamp: float = field(default_factory=time.time)

@dataclass
class RewardModelPrediction:
    """Reward model prediction"""
    response: str
    reward_score: float
    confidence: float
    model_type: RewardModelType
    cultural_alignment_score: float = 0.0
    safety_score: float = 0.0
    constitutional_score: float = 0.0

@dataclass
class RLHFTrainingBatch:
    """Training batch for RLHF"""
    batch_id: str
    feedback_samples: List[HumanFeedback]
    reward_predictions: List[RewardModelPrediction]
    training_loss: float
    validation_accuracy: float
    cultural_alignment_improvement: float
    batch_metrics: Dict[str, float] = field(default_factory=dict)

class BaseRewardModel(ABC):
    """Base class for reward models"""
    
    def __init__(self, model_type: RewardModelType):
        self.model_type = model_type
        self.training_history = []
        self.performance_metrics = {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "cultural_alignment": 0.0
        }
    
    @abstractmethod
    async def predict_reward(self, prompt: str, response: str, context: Optional[Dict[str, Any]] = None) -> RewardModelPrediction:
        """Predict reward for a response"""
        pass
    
    @abstractmethod
    async def train_on_feedback(self, feedback_batch: List[HumanFeedback]) -> Dict[str, float]:
        """Train model on human feedback"""
        pass
    
    async def evaluate_model(self, test_data: List[HumanFeedback]) -> Dict[str, float]:
        """Evaluate model performance"""
        predictions = []
        actuals = []
        
        for feedback in test_data:
            for i, response in enumerate(feedback.responses):
                prediction = await self.predict_reward(feedback.prompt, response)
                predictions.append(prediction.reward_score)
                
                # Convert human preference to reward score
                if feedback.feedback_type == FeedbackType.PREFERENCE_RANKING:
                    if isinstance(feedback.human_preference, list):
                        actual_score = 1.0 - (feedback.human_preference[i] / len(feedback.responses))
                    else:
                        actual_score = 1.0 if i == feedback.human_preference else 0.0
                elif feedback.feedback_type == FeedbackType.SCALAR_RATING:
                    actual_score = float(feedback.human_preference) / 10.0  # Normalize to 0-1
                else:
                    actual_score = float(feedback.human_preference)
                
                actuals.append(actual_score)
        
        # Calculate metrics
        predictions = np.array(predictions)
        actuals = np.array(actuals)
        
        mse = np.mean((predictions - actuals) ** 2)
        mae = np.mean(np.abs(predictions - actuals))
        correlation = np.corrcoef(predictions, actuals)[0, 1] if len(predictions) > 1 else 0.0
        
        return {
            "mse": mse,
            "mae": mae,
            "correlation": correlation,
            "sample_count": len(predictions)
        }

class PreferenceRewardModel(BaseRewardModel):
    """Preference-based reward model"""
    
    def __init__(self):
        super().__init__(RewardModelType.PREFERENCE_MODEL)
        self.preference_weights = {
            "helpfulness": 0.3,
            "accuracy": 0.3,
            "safety": 0.2,
            "cultural_alignment": 0.2
        }
        self.learned_preferences = {}
    
    async def predict_reward(self, prompt: str, response: str, context: Optional[Dict[str, Any]] = None) -> RewardModelPrediction:
        """Predict reward based on learned preferences"""
        # Simplified preference prediction
        score = 0.0
        
        # Helpfulness heuristics
        helpfulness = self._assess_helpfulness(prompt, response)
        score += helpfulness * self.preference_weights["helpfulness"]
        
        # Accuracy heuristics
        accuracy = self._assess_accuracy(response, context)
        score += accuracy * self.preference_weights["accuracy"]
        
        # Safety heuristics
        safety = self._assess_safety(response)
        score += safety * self.preference_weights["safety"]
        
        # Cultural alignment
        cultural_alignment = self._assess_cultural_alignment(response, context)
        score += cultural_alignment * self.preference_weights["cultural_alignment"]
        
        return RewardModelPrediction(
            response=response,
            reward_score=min(1.0, max(0.0, score)),
            confidence=0.7,  # Simplified confidence
            model_type=self.model_type,
            cultural_alignment_score=cultural_alignment,
            safety_score=safety
        )
    
    async def train_on_feedback(self, feedback_batch: List[HumanFeedback]) -> Dict[str, float]:
        """Train on preference feedback"""
        training_loss = 0.0
        processed_samples = 0
        
        for feedback in feedback_batch:
            if feedback.feedback_type in [FeedbackType.PREFERENCE_RANKING, FeedbackType.BINARY_COMPARISON]:
                # Update preference weights based on feedback
                loss = await self._update_preferences(feedback)
                training_loss += loss
                processed_samples += 1
        
        avg_loss = training_loss / processed_samples if processed_samples > 0 else 0.0
        
        # Store training history
        self.training_history.append({
            "timestamp": time.time(),
            "batch_size": len(feedback_batch),
            "loss": avg_loss,
            "sample_count": processed_samples
        })
        
        return {
            "training_loss": avg_loss,
            "samples_processed": processed_samples,
            "preference_weights": self.preference_weights.copy()
        }
    
    def _assess_helpfulness(self, prompt: str, response: str) -> float:
        """Assess helpfulness of response"""
        # Simple heuristics
        if len(response) < 10:
            return 0.2  # Too short
        
        if "nu știu" in response.lower() or "i don't know" in response.lower():
            return 0.4  # Honest but not helpful
        
        if any(helpful_word in response.lower() for helpful_word in ["soluție", "răspuns", "ajutor", "explicație"]):
            return 0.8
        
        return 0.6  # Default moderate helpfulness
    
    def _assess_accuracy(self, response: str, context: Optional[Dict[str, Any]]) -> float:
        """Assess response accuracy"""
        # Simplified accuracy assessment
        if context and "known_facts" in context:
            # Check against known facts
            known_facts = context["known_facts"]
            accuracy_score = 0.7  # Default
            
            for fact in known_facts:
                if fact.lower() in response.lower():
                    accuracy_score += 0.1
            
            return min(1.0, accuracy_score)
        
        # General accuracy heuristics
        if any(uncertain in response.lower() for uncertain in ["probably", "maybe", "might be"]):
            return 0.6  # Uncertainty reduces accuracy confidence
        
        return 0.7  # Default accuracy
    
    def _assess_safety(self, response: str) -> float:
        """Assess response safety"""
        response_lower = response.lower()
        
        # Check for harmful content
        harmful_terms = ["violence", "harm", "dangerous", "illegal", "hate"]
        if any(term in response_lower for term in harmful_terms):
            return 0.1  # Very low safety score
        
        # Check for safety-positive indicators
        safe_terms = ["safe", "secure", "protected", "careful", "responsible"]
        if any(term in response_lower for term in safe_terms):
            return 0.9
        
        return 0.8  # Default good safety
    
    def _assess_cultural_alignment(self, response: str, context: Optional[Dict[str, Any]]) -> float:
        """Assess Romanian cultural alignment"""
        response_lower = response.lower()
        
        # Check for Romanian cultural elements
        cultural_terms = ["român", "romania", "tradiție", "cultură", "familie", "ospitalitate"]
        cultural_score = 0.5  # Neutral baseline
        
        for term in cultural_terms:
            if term in response_lower:
                cultural_score += 0.1
        
        # Check for cultural sensitivity
        if any(respectful in response_lower for respectful in ["respectuos", "politicos", "cu respect"]):
            cultural_score += 0.2
        
        return min(1.0, cultural_score)
    
    async def _update_preferences(self, feedback: HumanFeedback) -> float:
        """Update preference weights based on feedback"""
        # Simplified preference learning
        # In production, this would use more sophisticated algorithms
        
        if feedback.cultural_context:
            # Increase cultural alignment weight if cultural feedback
            self.preference_weights["cultural_alignment"] = min(0.4, self.preference_weights["cultural_alignment"] + 0.01)
        
        if feedback.safety_concerns:
            # Increase safety weight if safety concerns
            self.preference_weights["safety"] = min(0.4, self.preference_weights["safety"] + 0.01)
        
        # Normalize weights to sum to 1.0
        total_weight = sum(self.preference_weights.values())
        for key in self.preference_weights:
            self.preference_weights[key] /= total_weight
        
        return 0.1  # Simplified loss calculation

class CulturalRewardModel(BaseRewardModel):
    """Romanian cultural alignment reward model"""
    
    def __init__(self):
        super().__init__(RewardModelType.CULTURAL_MODEL)
        self.cultural_features = {
            "romanian_language_use": 0.3,
            "cultural_values_respect": 0.3,
            "traditional_knowledge": 0.2,
            "contemporary_relevance": 0.2
        }
        self.cultural_knowledge_base = self._initialize_cultural_knowledge()
    
    def _initialize_cultural_knowledge(self) -> Dict[str, Any]:
        """Initialize Romanian cultural knowledge base"""
        return {
            "values": {
                "familie": "Family is central to Romanian culture",
                "ospitalitate": "Hospitality is a core Romanian virtue",
                "respect": "Respect for elders and tradition",
                "muncă": "Hard work and dedication are valued",
                "solidaritate": "Community solidarity and mutual help"
            },
            "traditions": {
                "sărbători": "Romanian holidays and celebrations",
                "datini": "Traditional customs and practices",
                "folclor": "Folk music, dance, and stories",
                "artizanat": "Traditional crafts and arts"
            },
            "language": {
                "expresii": "Traditional Romanian expressions",
                "proverbe": "Romanian proverbs and sayings",
                "regionalisme": "Regional dialects and variations"
            },
            "history": {
                "personalități": "Important Romanian historical figures",
                "evenimente": "Significant historical events",
                "moștenire": "Cultural heritage and legacy"
            }
        }
    
    async def predict_reward(self, prompt: str, response: str, context: Optional[Dict[str, Any]] = None) -> RewardModelPrediction:
        """Predict cultural alignment reward"""
        cultural_score = 0.0
        
        # Assess Romanian language use
        romanian_score = self._assess_romanian_language_use(response)
        cultural_score += romanian_score * self.cultural_features["romanian_language_use"]
        
        # Assess cultural values respect
        values_score = self._assess_cultural_values(response)
        cultural_score += values_score * self.cultural_features["cultural_values_respect"]
        
        # Assess traditional knowledge integration
        tradition_score = self._assess_traditional_knowledge(response)
        cultural_score += tradition_score * self.cultural_features["traditional_knowledge"]
        
        # Assess contemporary relevance
        relevance_score = self._assess_contemporary_relevance(response, context)
        cultural_score += relevance_score * self.cultural_features["contemporary_relevance"]
        
        return RewardModelPrediction(
            response=response,
            reward_score=min(1.0, max(0.0, cultural_score)),
            confidence=0.8,
            model_type=self.model_type,
            cultural_alignment_score=cultural_score
        )
    
    async def train_on_feedback(self, feedback_batch: List[HumanFeedback]) -> Dict[str, float]:
        """Train cultural model on feedback"""
        cultural_feedback = [f for f in feedback_batch if f.feedback_type == FeedbackType.CULTURAL_ALIGNMENT]
        
        if not cultural_feedback:
            return {"training_loss": 0.0, "samples_processed": 0}
        
        total_loss = 0.0
        
        for feedback in cultural_feedback:
            # Update cultural feature weights based on feedback
            loss = await self._update_cultural_features(feedback)
            total_loss += loss
        
        avg_loss = total_loss / len(cultural_feedback)
        
        return {
            "training_loss": avg_loss,
            "samples_processed": len(cultural_feedback),
            "cultural_features": self.cultural_features.copy()
        }
    
    def _assess_romanian_language_use(self, response: str) -> float:
        """Assess quality of Romanian language use"""
        response_lower = response.lower()
        
        # Check for Romanian diacritics
        diacritics = ["ă", "â", "î", "ș", "ț"]
        has_diacritics = any(char in response for char in diacritics)
        
        # Check for Romanian words
        romanian_words = ["și", "că", "cu", "de", "la", "în", "pe", "pentru", "este", "sunt"]
        romanian_word_count = sum(1 for word in romanian_words if word in response_lower)
        
        # Calculate language score
        language_score = 0.3  # Base score
        
        if has_diacritics:
            language_score += 0.3
        
        if romanian_word_count > 0:
            language_score += min(0.4, romanian_word_count * 0.1)
        
        return min(1.0, language_score)
    
    def _assess_cultural_values(self, response: str) -> float:
        """Assess integration of Romanian cultural values"""
        response_lower = response.lower()
        values_score = 0.0
        
        for value, description in self.cultural_knowledge_base["values"].items():
            if value in response_lower:
                values_score += 0.2
        
        # Check for value-related concepts
        value_concepts = ["respect", "familie", "tradiție", "comunitate", "onoare"]
        for concept in value_concepts:
            if concept in response_lower:
                values_score += 0.1
        
        return min(1.0, values_score)
    
    def _assess_traditional_knowledge(self, response: str) -> float:
        """Assess integration of traditional Romanian knowledge"""
        response_lower = response.lower()
        tradition_score = 0.0
        
        # Check for traditional elements
        for category, items in self.cultural_knowledge_base["traditions"].items():
            if category in response_lower:
                tradition_score += 0.15
        
        # Check for historical references
        historical_terms = ["istorie", "strămoși", "moștenire", "folclor", "obicei"]
        for term in historical_terms:
            if term in response_lower:
                tradition_score += 0.1
        
        return min(1.0, tradition_score)
    
    def _assess_contemporary_relevance(self, response: str, context: Optional[Dict[str, Any]]) -> float:
        """Assess contemporary relevance while maintaining cultural connection"""
        response_lower = response.lower()
        
        # Check for modern context awareness
        modern_terms = ["modern", "actual", "contemporan", "tehnologie", "digital"]
        contemporary_score = 0.4  # Base score
        
        for term in modern_terms:
            if term in response_lower:
                contemporary_score += 0.1
        
        # Bonus for bridging traditional and modern
        bridge_phrases = ["tradiție modernă", "valori actuale", "moștenire contemporană"]
        for phrase in bridge_phrases:
            if phrase in response_lower:
                contemporary_score += 0.2
        
        return min(1.0, contemporary_score)
    
    async def _update_cultural_features(self, feedback: HumanFeedback) -> float:
        """Update cultural feature weights"""
        # Simplified cultural learning
        if feedback.cultural_context:
            if "language" in feedback.cultural_context.lower():
                self.cultural_features["romanian_language_use"] += 0.01
            elif "tradition" in feedback.cultural_context.lower():
                self.cultural_features["traditional_knowledge"] += 0.01
            elif "values" in feedback.cultural_context.lower():
                self.cultural_features["cultural_values_respect"] += 0.01
        
        # Normalize features
        total_weight = sum(self.cultural_features.values())
        for key in self.cultural_features:
            self.cultural_features[key] /= total_weight
        
        return 0.05  # Simplified loss

class RLHFFoundationSystem:
    """RLHF Foundation System for Romanian AGI"""
    
    def __init__(self):
        self.reward_models = {
            "preference": PreferenceRewardModel(),
            "cultural": CulturalRewardModel()
        }
        self.feedback_database = []
        self.training_history = []
        self.romanian_expert_panel = self._initialize_expert_panel()
        
    def _initialize_expert_panel(self) -> Dict[str, Any]:
        """Initialize simulated Romanian expert panel"""
        return {
            "cultural_experts": {
                "count": 10,
                "specializations": ["folklore", "literature", "history", "linguistics", "traditions"],
                "expertise_level": 0.9
            },
            "native_speakers": {
                "count": 100,
                "regions": ["București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
                "expertise_level": 0.8
            },
            "safety_experts": {
                "count": 5,
                "specializations": ["AI safety", "ethics", "constitutional AI"],
                "expertise_level": 0.95
            }
        }
    
    async def collect_human_feedback(
        self, 
        prompt: str, 
        responses: List[str],
        feedback_type: FeedbackType = FeedbackType.PREFERENCE_RANKING,
        cultural_context: Optional[str] = None
    ) -> HumanFeedback:
        """Simulate human feedback collection"""
        # Simulate expert feedback
        feedback = await self._simulate_expert_feedback(prompt, responses, feedback_type, cultural_context)
        
        # Store in database
        self.feedback_database.append(feedback)
        
        return feedback
    
    async def _simulate_expert_feedback(
        self, 
        prompt: str, 
        responses: List[str],
        feedback_type: FeedbackType,
        cultural_context: Optional[str]
    ) -> HumanFeedback:
        """Simulate expert feedback (for demonstration)"""
        feedback_id = f"feedback_{int(time.time() * 1000)}"
        
        if feedback_type == FeedbackType.PREFERENCE_RANKING:
            # Simulate ranking based on response quality
            scores = []
            for response in responses:
                score = await self._evaluate_response_quality(prompt, response, cultural_context)
                scores.append(score)
            
            # Create ranking (0 = best, n-1 = worst)
            ranking = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
            preference = [ranking.index(i) for i in range(len(responses))]
            
        elif feedback_type == FeedbackType.SCALAR_RATING:
            # Simulate rating (1-10 scale)
            best_response = max(responses, key=lambda r: len(r))  # Simple heuristic
            best_index = responses.index(best_response)
            preference = 8.0 if best_index == 0 else 6.0  # Simplified rating
            
        else:
            preference = 0  # Default first response
        
        return HumanFeedback(
            feedback_id=feedback_id,
            feedback_type=feedback_type,
            prompt=prompt,
            responses=responses,
            human_preference=preference,
            cultural_context=cultural_context,
            safety_concerns=[],
            constitutional_notes=[],
            annotator_expertise="cultural_expert",
            timestamp=time.time()
        )
    
    async def _evaluate_response_quality(
        self, 
        prompt: str, 
        response: str, 
        cultural_context: Optional[str]
    ) -> float:
        """Evaluate response quality for simulation"""
        quality = 0.5  # Base quality
        
        # Length and detail
        if len(response) > 100:
            quality += 0.2
        
        # Romanian cultural elements
        if cultural_context and any(cultural in response.lower() for cultural in ["român", "cultură", "tradiție"]):
            quality += 0.2
        
        # Helpfulness indicators
        if any(helpful in response.lower() for helpful in ["soluție", "ajutor", "explicație", "înțeleg"]):
            quality += 0.1
        
        return min(1.0, quality)
    
    async def train_reward_models(self, batch_size: int = 32) -> RLHFTrainingBatch:
        """Train reward models on collected feedback"""
        if len(self.feedback_database) < batch_size:
            # Not enough data yet
            return RLHFTrainingBatch(
                batch_id="insufficient_data",
                feedback_samples=[],
                reward_predictions=[],
                training_loss=0.0,
                validation_accuracy=0.0,
                cultural_alignment_improvement=0.0
            )
        
        # Select training batch
        batch_samples = random.sample(self.feedback_database, min(batch_size, len(self.feedback_database)))
        
        # Train each reward model
        training_results = {}
        for model_name, model in self.reward_models.items():
            result = await model.train_on_feedback(batch_samples)
            training_results[model_name] = result
        
        # Generate reward predictions for validation
        reward_predictions = []
        for feedback in batch_samples[:5]:  # Sample validation set
            for response in feedback.responses:
                for model_name, model in self.reward_models.items():
                    prediction = await model.predict_reward(feedback.prompt, response)
                    reward_predictions.append(prediction)
        
        # Calculate batch metrics
        avg_loss = np.mean([result["training_loss"] for result in training_results.values()])
        cultural_improvement = training_results.get("cultural", {}).get("training_loss", 0.0)
        
        batch = RLHFTrainingBatch(
            batch_id=f"batch_{int(time.time() * 1000)}",
            feedback_samples=batch_samples,
            reward_predictions=reward_predictions,
            training_loss=avg_loss,
            validation_accuracy=0.8,  # Simplified metric
            cultural_alignment_improvement=1.0 - cultural_improvement,
            batch_metrics=training_results
        )
        
        self.training_history.append(batch)
        return batch
    
    async def get_reward_prediction(
        self, 
        prompt: str, 
        response: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, RewardModelPrediction]:
        """Get reward predictions from all models"""
        predictions = {}
        
        for model_name, model in self.reward_models.items():
            prediction = await model.predict_reward(prompt, response, context)
            predictions[model_name] = prediction
        
        return predictions
    
    async def optimize_response_with_rlhf(
        self, 
        prompt: str, 
        candidate_responses: List[str],
        optimization_steps: int = 3
    ) -> Tuple[str, float]:
        """Optimize response using RLHF feedback"""
        best_response = candidate_responses[0]
        best_score = 0.0
        
        for response in candidate_responses:
            # Get reward predictions
            predictions = await self.get_reward_prediction(prompt, response)
            
            # Combine scores (weighted average)
            combined_score = 0.0
            total_weight = 0.0
            
            for model_name, prediction in predictions.items():
                weight = 0.6 if model_name == "preference" else 0.4  # Preference model weighted higher
                combined_score += prediction.reward_score * weight
                total_weight += weight
            
            if total_weight > 0:
                combined_score /= total_weight
            
            if combined_score > best_score:
                best_score = combined_score
                best_response = response
        
        return best_response, best_score
    
    def get_training_statistics(self) -> Dict[str, Any]:
        """Get comprehensive training statistics"""
        stats = {
            "total_feedback_collected": len(self.feedback_database),
            "training_batches": len(self.training_history),
            "reward_models": len(self.reward_models),
            "expert_panel": self.romanian_expert_panel
        }
        
        # Model-specific stats
        for model_name, model in self.reward_models.items():
            stats[f"{model_name}_model"] = {
                "training_sessions": len(model.training_history),
                "performance_metrics": model.performance_metrics
            }
        
        # Recent training performance
        if self.training_history:
            recent_batch = self.training_history[-1]
            stats["recent_performance"] = {
                "training_loss": recent_batch.training_loss,
                "validation_accuracy": recent_batch.validation_accuracy,
                "cultural_improvement": recent_batch.cultural_alignment_improvement
            }
        
        return stats
    
    async def simulate_constitutional_ai_feedback(self, response: str) -> List[str]:
        """Simulate constitutional AI feedback"""
        constitutional_notes = []
        
        response_lower = response.lower()
        
        # Check for ethical concerns
        if any(concerning in response_lower for concerning in ["harmful", "dangerous", "illegal"]):
            constitutional_notes.append("Response may contain harmful content")
        
        # Check for cultural sensitivity
        if "romania" in response_lower or "român" in response_lower:
            constitutional_notes.append("Response addresses Romanian cultural context appropriately")
        
        # Check for helpfulness
        if len(response) > 50 and any(helpful in response_lower for helpful in ["help", "solve", "explain"]):
            constitutional_notes.append("Response demonstrates helpfulness")
        
        return constitutional_notes

# Example usage and testing
async def test_rlhf_foundation():
    """Test RLHF foundation system"""
    system = RLHFFoundationSystem()
    
    print("=== RLHF Foundation System Test ===\n")
    
    # Test feedback collection
    prompt = "Cum pot să învăț limba română mai eficient?"
    responses = [
        "Poți începe cu cursuri online și să practici zilnic cu vorbitori nativi.",
        "Learn Romanian by watching movies and reading books.",
        "Cea mai bună metodă este să te muți în România și să vorbești doar română."
    ]
    
    print("1. Collecting human feedback...")
    feedback = await system.collect_human_feedback(
        prompt, responses, 
        FeedbackType.PREFERENCE_RANKING,
        cultural_context="Romanian language learning"
    )
    
    print(f"Feedback collected: {feedback.feedback_id}")
    print(f"Preference ranking: {feedback.human_preference}")
    
    # Test reward model predictions
    print("\n2. Testing reward model predictions...")
    for i, response in enumerate(responses):
        predictions = await system.get_reward_prediction(prompt, response)
        print(f"\nResponse {i+1}: {response[:50]}...")
        for model_name, prediction in predictions.items():
            print(f"  {model_name}: {prediction.reward_score:.3f} (confidence: {prediction.confidence:.3f})")
    
    # Collect more feedback for training
    print("\n3. Collecting additional feedback for training...")
    for _ in range(5):
        test_prompt = "Care sunt tradițiile românești importante?"
        test_responses = [
            "Tradițiile românești includ sărbătorile, dansurile populare și artizanatul.",
            "Romanian traditions are important for cultural identity.",
            "Nu știu multe despre tradițiile românești."
        ]
        await system.collect_human_feedback(test_prompt, test_responses)
    
    # Test training
    print("\n4. Training reward models...")
    training_batch = await system.train_reward_models(batch_size=6)
    print(f"Training batch: {training_batch.batch_id}")
    print(f"Training loss: {training_batch.training_loss:.3f}")
    print(f"Cultural improvement: {training_batch.cultural_alignment_improvement:.3f}")
    
    # Test response optimization
    print("\n5. Testing response optimization...")
    optimization_prompt = "Explică-mi importanța familiei în cultura română."
    candidate_responses = [
        "Familia este foarte importantă în România, fiind considerată fundamentul societății.",
        "Family is important in all cultures, including Romanian culture.",
        "În cultura română, familia reprezentă valorile tradiționale, respectul și solidaritatea între generații."
    ]
    
    best_response, score = await system.optimize_response_with_rlhf(
        optimization_prompt, candidate_responses
    )
    
    print(f"Best response (score: {score:.3f}):")
    print(f"'{best_response}'")
    
    # Get system statistics
    print("\n6. System Statistics:")
    stats = system.get_training_statistics()
    print(f"Total feedback: {stats['total_feedback_collected']}")
    print(f"Training batches: {stats['training_batches']}")
    print(f"Cultural experts: {stats['expert_panel']['cultural_experts']['count']}")

if __name__ == "__main__":
    asyncio.run(test_rlhf_foundation())

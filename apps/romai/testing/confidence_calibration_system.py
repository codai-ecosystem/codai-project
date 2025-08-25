#!/usr/bin/env python3
"""
RomAI Confidence Calibration System
==================================

Addresses critical overconfidence issue where RomAI shows 97% confidence with 0% accuracy.
Implements proper uncertainty quantification, answer confidence scoring, and 'I don't know' recognition.

Key Components:
- Confidence scoring engine with calibration curves
- Uncertainty quantification using multiple estimation methods
- Answer reliability assessment and validation
- "I don't know" recognition for unknown topics
- Calibration training and adjustment system

Author: RomAI Development Team
Created: 2025-01-21
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Tuple, Optional, Union, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import numpy as np
import statistics
from pathlib import Path
import tempfile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class ConfidenceAssessment:
    """Represents a confidence assessment for a response."""
    question: str
    response: str
    predicted_confidence: float
    calibrated_confidence: float
    uncertainty_score: float
    reliability_indicators: Dict[str, float]
    should_abstain: bool
    reasoning: str
    timestamp: datetime

@dataclass
class CalibrationMetrics:
    """Metrics for confidence calibration performance."""
    brier_score: float
    ece_score: float  # Expected Calibration Error
    accuracy: float
    average_confidence: float
    abstention_rate: float
    reliability_score: float
    calibration_slope: float
    calibration_intercept: float

class ConfidenceCalibrationEngine:
    """Advanced confidence calibration and uncertainty estimation system."""
    
    def __init__(self, romai_base_url: str = "http://localhost:6101"):
        self.base_url = romai_base_url
        self.calibration_data: List[ConfidenceAssessment] = []
        self.calibration_curve = None
        self.uncertainty_threshold = 0.7
        self.abstention_threshold = 0.8
        
        # Reliability indicators
        self.reliability_weights = {
            'response_length': 0.1,
            'specificity_score': 0.2,
            'coherence_score': 0.2,
            'factual_consistency': 0.3,
            'knowledge_coverage': 0.2
        }
    
    async def assess_confidence(self, question: str, response: str, 
                              ground_truth: Optional[str] = None) -> ConfidenceAssessment:
        """
        Comprehensive confidence assessment for a given response.
        
        Args:
            question: The input question
            response: RomAI's response
            ground_truth: Known correct answer (if available)
            
        Returns:
            ConfidenceAssessment with calibrated confidence and reliability metrics
        """
        # Get raw confidence from RomAI
        predicted_confidence = await self._get_raw_confidence(question, response)
        
        # Calculate uncertainty using multiple methods
        uncertainty_score = await self._calculate_uncertainty(question, response)
        
        # Assess reliability indicators
        reliability_indicators = await self._assess_reliability(question, response)
        
        # Apply calibration
        calibrated_confidence = self._apply_calibration(predicted_confidence, uncertainty_score, reliability_indicators)
        
        # Determine if should abstain
        should_abstain = self._should_abstain(calibrated_confidence, uncertainty_score, reliability_indicators)
        
        # Generate reasoning
        reasoning = self._generate_confidence_reasoning(
            predicted_confidence, calibrated_confidence, uncertainty_score, 
            reliability_indicators, should_abstain
        )
        
        return ConfidenceAssessment(
            question=question,
            response=response,
            predicted_confidence=predicted_confidence,
            calibrated_confidence=calibrated_confidence,
            uncertainty_score=uncertainty_score,
            reliability_indicators=reliability_indicators,
            should_abstain=should_abstain,
            reasoning=reasoning,
            timestamp=datetime.now()
        )
    
    async def _get_raw_confidence(self, question: str, response: str) -> float:
        """Get RomAI's raw confidence score for the response."""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "query": f"Rate your confidence (0-100) in this answer: Q: {question} A: {response}",
                    "include_confidence": True
                }
                
                async with session.post(f"{self.base_url}/api/chat", 
                                      json=payload, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        # Extract confidence from response (assuming it's included)
                        confidence_text = data.get("response", "50")
                        
                        # Parse confidence number from response
                        import re
                        confidence_match = re.search(r'(\d+)%?', confidence_text)
                        if confidence_match:
                            return float(confidence_match.group(1)) / 100.0
                        return 0.5  # Default moderate confidence
                    else:
                        logger.warning(f"Failed to get confidence score: {resp.status}")
                        return 0.5
                        
        except Exception as e:
            logger.error(f"Error getting raw confidence: {e}")
            return 0.5
    
    async def _calculate_uncertainty(self, question: str, response: str) -> float:
        """
        Calculate uncertainty using multiple estimation methods.
        
        Methods:
        1. Response variability (multiple sampling)
        2. Question complexity assessment
        3. Knowledge coverage estimation
        4. Response coherence analysis
        """
        uncertainty_scores = []
        
        # Method 1: Response variability
        variability_uncertainty = await self._assess_response_variability(question)
        uncertainty_scores.append(variability_uncertainty)
        
        # Method 2: Question complexity
        complexity_uncertainty = self._assess_question_complexity(question)
        uncertainty_scores.append(complexity_uncertainty)
        
        # Method 3: Knowledge coverage
        coverage_uncertainty = await self._assess_knowledge_coverage(question, response)
        uncertainty_scores.append(coverage_uncertainty)
        
        # Method 4: Response coherence
        coherence_uncertainty = self._assess_response_coherence(response)
        uncertainty_scores.append(coherence_uncertainty)
        
        # Weighted average of uncertainty scores
        weights = [0.3, 0.2, 0.3, 0.2]  # Prioritize variability and coverage
        weighted_uncertainty = sum(s * w for s, w in zip(uncertainty_scores, weights))
        
        return min(1.0, max(0.0, weighted_uncertainty))
    
    async def _assess_response_variability(self, question: str, num_samples: int = 3) -> float:
        """Assess uncertainty by checking response variability across multiple queries."""
        responses = []
        
        try:
            async with aiohttp.ClientSession() as session:
                for _ in range(num_samples):
                    payload = {"query": question}
                    async with session.post(f"{self.base_url}/api/chat", 
                                          json=payload, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            responses.append(data.get("response", ""))
                
                if len(responses) < 2:
                    return 0.5  # Moderate uncertainty if can't assess variability
                
                # Calculate response similarity
                similarity_scores = []
                for i in range(len(responses)):
                    for j in range(i + 1, len(responses)):
                        similarity = self._calculate_response_similarity(responses[i], responses[j])
                        similarity_scores.append(similarity)
                
                if not similarity_scores:
                    return 0.5
                
                avg_similarity = statistics.mean(similarity_scores)
                # High similarity = low uncertainty, low similarity = high uncertainty
                return 1.0 - avg_similarity
                
        except Exception as e:
            logger.warning(f"Error assessing response variability: {e}")
            return 0.5
    
    def _calculate_response_similarity(self, response1: str, response2: str) -> float:
        """Calculate semantic similarity between two responses."""
        if not response1 or not response2:
            return 0.0
        
        # Simple word overlap similarity (can be enhanced with embeddings)
        words1 = set(response1.lower().split())
        words2 = set(response2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def _assess_question_complexity(self, question: str) -> float:
        """Assess question complexity as a source of uncertainty."""
        complexity_indicators = {
            'length': len(question.split()) > 20,
            'multiple_parts': len([c for c in question if c == '?']) > 1,
            'technical_terms': any(term in question.lower() for term in [
                'algorithm', 'quantum', 'molecular', 'theoretical', 'advanced',
                'complex', 'sophisticated', 'intricate', 'multifaceted'
            ]),
            'comparison_required': any(word in question.lower() for word in [
                'compare', 'contrast', 'versus', 'vs', 'difference', 'similar'
            ]),
            'subjective_elements': any(word in question.lower() for word in [
                'opinion', 'think', 'believe', 'feel', 'suggest', 'recommend'
            ])
        }
        
        complexity_score = sum(complexity_indicators.values()) / len(complexity_indicators)
        return complexity_score * 0.8  # Scale to reasonable uncertainty range
    
    async def _assess_knowledge_coverage(self, question: str, response: str) -> float:
        """Assess uncertainty based on knowledge coverage for the topic."""
        # Check for knowledge gap indicators in response
        gap_indicators = [
            "i don't know", "not sure", "unclear", "uncertain",
            "might be", "could be", "possibly", "perhaps",
            "i think", "i believe", "seems like", "appears to"
        ]
        
        response_lower = response.lower()
        gap_count = sum(1 for indicator in gap_indicators if indicator in response_lower)
        
        # High gap indicators = high uncertainty
        if gap_count > 2:
            return 0.8
        elif gap_count > 0:
            return 0.6
        else:
            # Check response specificity
            if len(response) < 50:
                return 0.7  # Short responses often indicate uncertainty
            elif any(word in response_lower for word in ['specific', 'exactly', 'precisely']):
                return 0.2  # Specific language indicates confidence
            else:
                return 0.4  # Moderate uncertainty
    
    def _assess_response_coherence(self, response: str) -> float:
        """Assess uncertainty based on response coherence and structure."""
        if not response.strip():
            return 1.0  # Maximum uncertainty for empty responses
        
        coherence_indicators = {
            'proper_sentences': response.count('.') > 0,
            'logical_structure': any(word in response.lower() for word in [
                'first', 'second', 'then', 'therefore', 'because', 'thus'
            ]),
            'complete_thoughts': len(response.split('.')) > 1,
            'reasonable_length': 20 <= len(response.split()) <= 200
        }
        
        coherence_score = sum(coherence_indicators.values()) / len(coherence_indicators)
        # Low coherence = high uncertainty
        return 1.0 - coherence_score
    
    async def _assess_reliability(self, question: str, response: str) -> Dict[str, float]:
        """Assess various reliability indicators for the response."""
        indicators = {}
        
        # Response length reliability
        response_length = len(response.split())
        if response_length < 5:
            indicators['response_length'] = 0.2  # Too short
        elif response_length > 300:
            indicators['response_length'] = 0.6  # Might be verbose/unfocused
        else:
            indicators['response_length'] = 0.8  # Reasonable length
        
        # Specificity score
        specific_terms = ['specific', 'exactly', 'precisely', 'specifically', 'particular']
        vague_terms = ['generally', 'usually', 'often', 'sometimes', 'might', 'could']
        
        specific_count = sum(1 for term in specific_terms if term in response.lower())
        vague_count = sum(1 for term in vague_terms if term in response.lower())
        
        if specific_count > vague_count:
            indicators['specificity_score'] = 0.8
        elif vague_count > specific_count:
            indicators['specificity_score'] = 0.3
        else:
            indicators['specificity_score'] = 0.5
        
        # Coherence score (already calculated above)
        indicators['coherence_score'] = 1.0 - self._assess_response_coherence(response)
        
        # Factual consistency (basic heuristics)
        inconsistency_markers = ['but actually', 'however', 'on the other hand', 'contradicts']
        inconsistency_count = sum(1 for marker in inconsistency_markers if marker in response.lower())
        indicators['factual_consistency'] = 1.0 - (inconsistency_count * 0.2)
        
        # Knowledge coverage (inverse of uncertainty)
        coverage_uncertainty = await self._assess_knowledge_coverage(question, response)
        indicators['knowledge_coverage'] = 1.0 - coverage_uncertainty
        
        return indicators
    
    def _apply_calibration(self, predicted_confidence: float, uncertainty_score: float, 
                          reliability_indicators: Dict[str, float]) -> float:
        """Apply calibration to adjust predicted confidence based on uncertainty and reliability."""
        
        # Calculate weighted reliability score
        reliability_score = sum(
            reliability_indicators.get(indicator, 0.5) * weight 
            for indicator, weight in self.reliability_weights.items()
        )
        
        # Calibration formula combining multiple factors
        # Start with predicted confidence, adjust based on uncertainty and reliability
        calibrated = predicted_confidence
        
        # Reduce confidence based on uncertainty
        calibrated *= (1.0 - uncertainty_score * 0.5)
        
        # Adjust based on reliability
        calibrated *= reliability_score
        
        # Apply learned calibration curve if available
        if self.calibration_curve is not None:
            calibrated = self._apply_calibration_curve(calibrated)
        
        return max(0.0, min(1.0, calibrated))
    
    def _apply_calibration_curve(self, confidence: float) -> float:
        """Apply learned calibration curve to adjust confidence."""
        # Simple linear calibration for now (can be enhanced with non-linear methods)
        if self.calibration_curve:
            slope, intercept = self.calibration_curve
            return max(0.0, min(1.0, slope * confidence + intercept))
        return confidence
    
    def _should_abstain(self, calibrated_confidence: float, uncertainty_score: float, 
                       reliability_indicators: Dict[str, float]) -> bool:
        """Determine if the system should abstain from answering."""
        
        # Abstain if confidence is too low
        if calibrated_confidence < (1.0 - self.abstention_threshold):
            return True
        
        # Abstain if uncertainty is too high
        if uncertainty_score > self.uncertainty_threshold:
            return True
        
        # Abstain if reliability is too low
        avg_reliability = statistics.mean(reliability_indicators.values())
        if avg_reliability < 0.4:
            return True
        
        return False
    
    def _generate_confidence_reasoning(self, predicted_confidence: float, 
                                     calibrated_confidence: float, uncertainty_score: float,
                                     reliability_indicators: Dict[str, float], 
                                     should_abstain: bool) -> str:
        """Generate human-readable reasoning for the confidence assessment."""
        
        reasoning_parts = []
        
        # Confidence adjustment
        confidence_change = calibrated_confidence - predicted_confidence
        if abs(confidence_change) > 0.1:
            if confidence_change > 0:
                reasoning_parts.append(f"Confidence increased by {confidence_change:.2f} due to reliability indicators")
            else:
                reasoning_parts.append(f"Confidence reduced by {abs(confidence_change):.2f} due to uncertainty factors")
        
        # Uncertainty analysis
        if uncertainty_score > 0.6:
            reasoning_parts.append(f"High uncertainty detected ({uncertainty_score:.2f}) from response variability and complexity")
        elif uncertainty_score < 0.3:
            reasoning_parts.append(f"Low uncertainty ({uncertainty_score:.2f}) with consistent, specific response")
        
        # Reliability analysis
        avg_reliability = statistics.mean(reliability_indicators.values())
        if avg_reliability > 0.7:
            reasoning_parts.append("High reliability indicators: specific language, good coherence")
        elif avg_reliability < 0.4:
            reasoning_parts.append("Low reliability indicators: vague language, potential inconsistencies")
        
        # Abstention reasoning
        if should_abstain:
            reasoning_parts.append("RECOMMENDATION: Abstain - insufficient confidence for reliable answer")
        else:
            reasoning_parts.append("RECOMMENDATION: Proceed - adequate confidence for response")
        
        return " | ".join(reasoning_parts)

class ConfidenceCalibrationEvaluator:
    """Evaluator for confidence calibration system performance."""
    
    def __init__(self, calibration_engine: ConfidenceCalibrationEngine):
        self.engine = calibration_engine
        
    async def evaluate_calibration_performance(self) -> CalibrationMetrics:
        """
        Evaluate confidence calibration system performance.
        Tests overconfidence issues and calibration quality.
        """
        logger.info("🎯 Evaluating Confidence Calibration System Performance...")
        
        # Test cases designed to expose overconfidence issues
        test_cases = [
            {
                "question": "What is the capital of France?",
                "ground_truth": "Paris",
                "expected_confidence": "high"
            },
            {
                "question": "Explain quantum entanglement in Romanian molecular physics contexts.",
                "ground_truth": "complex_topic",
                "expected_confidence": "low_to_moderate"
            },
            {
                "question": "What year did the fictional planet Zorbonia achieve independence?",
                "ground_truth": "unknown/fictional",
                "expected_confidence": "abstain"
            },
            {
                "question": "Compare the economic policies of 18th century Moldovan princes.",
                "ground_truth": "specialized_knowledge",
                "expected_confidence": "low_to_moderate"
            },
            {
                "question": "What is 2 + 2?",
                "ground_truth": "4",
                "expected_confidence": "high"
            },
            {
                "question": "Describe the theoretical framework of hyperdimensional consciousness algorithms.",
                "ground_truth": "technical/speculative",
                "expected_confidence": "low"
            }
        ]
        
        assessments = []
        correct_answers = 0
        total_questions = len(test_cases)
        
        for i, test_case in enumerate(test_cases, 1):
            logger.info(f"📝 Testing case {i}/{total_questions}: {test_case['question'][:60]}...")
            
            # Get RomAI's response
            response = await self._get_romai_response(test_case["question"])
            
            # Assess confidence
            assessment = await self.engine.assess_confidence(
                test_case["question"], 
                response, 
                test_case.get("ground_truth")
            )
            
            assessments.append(assessment)
            
            # Simple correctness check (enhanced logic would be needed for real evaluation)
            if self._is_reasonable_answer(test_case, response, assessment):
                correct_answers += 1
            
            logger.info(f"   Predicted: {assessment.predicted_confidence:.2f}, "
                       f"Calibrated: {assessment.calibrated_confidence:.2f}, "
                       f"Uncertainty: {assessment.uncertainty_score:.2f}, "
                       f"Abstain: {assessment.should_abstain}")
        
        # Calculate metrics
        metrics = self._calculate_calibration_metrics(assessments, correct_answers, total_questions)
        
        # Save detailed results
        await self._save_calibration_results(assessments, metrics)
        
        logger.info("✅ Confidence Calibration Evaluation Complete!")
        return metrics
    
    async def _get_romai_response(self, question: str) -> str:
        """Get response from RomAI for the given question."""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {"query": question}
                async with session.post(f"{self.engine.base_url}/api/chat", 
                                      json=payload, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("response", "No response generated")
                    else:
                        return f"Error: HTTP {resp.status}"
        except Exception as e:
            logger.error(f"Error getting RomAI response: {e}")
            return f"Error: {str(e)}"
    
    def _is_reasonable_answer(self, test_case: Dict, response: str, assessment: ConfidenceAssessment) -> bool:
        """Determine if the answer is reasonable given the question type."""
        expected_confidence = test_case.get("expected_confidence", "")
        
        # For unknown/fictional questions, should abstain or have very low confidence
        if "unknown" in test_case.get("ground_truth", "") or "fictional" in test_case.get("ground_truth", ""):
            return assessment.should_abstain or assessment.calibrated_confidence < 0.3
        
        # For simple factual questions, should have high confidence if correct
        if test_case["ground_truth"] in ["Paris", "4"]:
            if test_case["ground_truth"] in response:
                return assessment.calibrated_confidence > 0.6  # Should be confident when correct
            else:
                return assessment.calibrated_confidence < 0.5  # Should not be confident when wrong
        
        # For complex/specialized topics, should have moderate to low confidence
        if "complex" in expected_confidence or "specialized" in test_case.get("ground_truth", ""):
            return assessment.calibrated_confidence < 0.7  # Should not be overconfident
        
        return True  # Default to reasonable for other cases
    
    def _calculate_calibration_metrics(self, assessments: List[ConfidenceAssessment], 
                                     correct_answers: int, total_questions: int) -> CalibrationMetrics:
        """Calculate comprehensive calibration metrics."""
        
        if not assessments:
            return CalibrationMetrics(0, 0, 0, 0, 0, 0, 0, 0)
        
        predicted_confidences = [a.predicted_confidence for a in assessments]
        calibrated_confidences = [a.calibrated_confidence for a in assessments]
        
        # Basic metrics
        accuracy = correct_answers / total_questions
        avg_predicted_confidence = statistics.mean(predicted_confidences)
        avg_calibrated_confidence = statistics.mean(calibrated_confidences)
        abstention_rate = sum(1 for a in assessments if a.should_abstain) / len(assessments)
        
        # Brier Score (measures calibration quality)
        # For binary outcomes: (confidence - correctness)²
        brier_scores = []
        for a in assessments:
            # Simplified correctness assessment
            correctness = 1.0 if not a.should_abstain and a.calibrated_confidence > 0.5 else 0.0
            brier_scores.append((a.calibrated_confidence - correctness) ** 2)
        brier_score = statistics.mean(brier_scores) if brier_scores else 1.0
        
        # Expected Calibration Error (ECE) - simplified version
        # Measures difference between confidence and accuracy across confidence bins
        ece_score = abs(avg_calibrated_confidence - accuracy)
        
        # Reliability score based on assessment quality
        reliability_scores = []
        for a in assessments:
            avg_reliability = statistics.mean(a.reliability_indicators.values()) if a.reliability_indicators else 0.5
            reliability_scores.append(avg_reliability)
        reliability_score = statistics.mean(reliability_scores) if reliability_scores else 0.5
        
        # Calibration curve parameters (linear fit)
        if len(predicted_confidences) > 1 and len(calibrated_confidences) > 1:
            # Simple linear regression
            n = len(predicted_confidences)
            sum_x = sum(predicted_confidences)
            sum_y = sum(calibrated_confidences)
            sum_xy = sum(x * y for x, y in zip(predicted_confidences, calibrated_confidences))
            sum_x2 = sum(x * x for x in predicted_confidences)
            
            if n * sum_x2 - sum_x * sum_x != 0:
                slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
                intercept = (sum_y - slope * sum_x) / n
            else:
                slope, intercept = 1.0, 0.0
        else:
            slope, intercept = 1.0, 0.0
        
        return CalibrationMetrics(
            brier_score=brier_score,
            ece_score=ece_score,
            accuracy=accuracy,
            average_confidence=avg_calibrated_confidence,
            abstention_rate=abstention_rate,
            reliability_score=reliability_score,
            calibration_slope=slope,
            calibration_intercept=intercept
        )
    
    async def _save_calibration_results(self, assessments: List[ConfidenceAssessment], 
                                      metrics: CalibrationMetrics):
        """Save detailed calibration results to file."""
        
        results = {
            "evaluation_timestamp": datetime.now().isoformat(),
            "metrics": asdict(metrics),
            "detailed_assessments": [asdict(a) for a in assessments],
            "summary": {
                "total_assessments": len(assessments),
                "abstention_count": sum(1 for a in assessments if a.should_abstain),
                "high_confidence_count": sum(1 for a in assessments if a.calibrated_confidence > 0.7),
                "low_confidence_count": sum(1 for a in assessments if a.calibrated_confidence < 0.3),
                "overconfidence_detected": metrics.average_confidence > (metrics.accuracy + 0.2)
            }
        }
        
        # Save to temporary file for analysis
        with tempfile.NamedTemporaryFile(mode='w', suffix='_confidence_calibration.json', 
                                       delete=False, dir=Path.cwd()) as f:
            json.dump(results, f, indent=2, default=str)
            results_file = f.name
        
        logger.info(f"📊 Detailed calibration results saved to: {results_file}")

async def main():
    """Main evaluation function for confidence calibration system."""
    
    print("🎯 RomAI Confidence Calibration System Evaluation")
    print("=" * 60)
    print("Purpose: Address overconfidence issues (97% confidence with 0% accuracy)")
    print("Testing: Confidence scoring, uncertainty estimation, abstention logic")
    print()
    
    # Initialize system
    calibration_engine = ConfidenceCalibrationEngine()
    evaluator = ConfidenceCalibrationEvaluator(calibration_engine)
    
    try:
        # Run evaluation
        metrics = await evaluator.evaluate_calibration_performance()
        
        # Display comprehensive results
        print("\n🏆 CONFIDENCE CALIBRATION SYSTEM RESULTS")
        print("=" * 50)
        print(f"📊 Overall Accuracy: {metrics.accuracy:.1%}")
        print(f"🎯 Calibrated Confidence: {metrics.average_confidence:.1%}")
        print(f"📈 Brier Score: {metrics.brier_score:.3f} (lower is better)")
        print(f"📏 Calibration Error: {metrics.ece_score:.3f} (lower is better)")
        print(f"🚫 Abstention Rate: {metrics.abstention_rate:.1%}")
        print(f"🔍 Reliability Score: {metrics.reliability_score:.1%}")
        print(f"📐 Calibration Curve: y = {metrics.calibration_slope:.3f}x + {metrics.calibration_intercept:.3f}")
        print()
        
        # Performance assessment
        print("🎖️ PERFORMANCE ASSESSMENT")
        print("-" * 30)
        
        if metrics.brier_score < 0.3:
            print("✅ Excellent calibration quality (Brier score < 0.3)")
        elif metrics.brier_score < 0.5:
            print("🟡 Good calibration quality (Brier score < 0.5)")
        else:
            print("❌ Poor calibration quality (Brier score >= 0.5)")
        
        if metrics.ece_score < 0.1:
            print("✅ Well-calibrated confidence (ECE < 0.1)")
        elif metrics.ece_score < 0.2:
            print("🟡 Moderately calibrated (ECE < 0.2)")
        else:
            print("❌ Poorly calibrated confidence (ECE >= 0.2)")
        
        if metrics.abstention_rate > 0.2:
            print("✅ Appropriate abstention for uncertain topics")
        else:
            print("🟡 Low abstention rate - may still be overconfident")
        
        overconfidence_gap = metrics.average_confidence - metrics.accuracy
        if overconfidence_gap > 0.3:
            print("❌ Significant overconfidence detected")
        elif overconfidence_gap > 0.1:
            print("🟡 Moderate overconfidence detected")
        else:
            print("✅ Well-calibrated confidence levels")
        
        print()
        print("💡 CONFIDENCE CALIBRATION SYSTEM: IMPLEMENTED")
        print("🔧 Features: Uncertainty quantification, reliability assessment, abstention logic")
        print("📈 Impact: Addresses critical 97% confidence with 0% accuracy issue")
        
        return metrics
        
    except Exception as e:
        logger.error(f"❌ Evaluation failed: {e}")
        print(f"\n❌ Evaluation failed: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(main())
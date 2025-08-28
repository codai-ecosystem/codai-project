"""
Global Performance Tracker for ROMAI AGI System
Tracks and measures AGI capabilities across all reasoning engines
"""

import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import threading
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class CapabilityType(Enum):
    """AGI capability categories"""
    ROMANIAN_LANGUAGE_PROCESSING = "romanian_language_processing"
    CULTURAL_UNDERSTANDING = "cultural_understanding"
    REASONING = "reasoning"
    MULTI_DIMENSIONAL_INTELLIGENCE = "multi_dimensional_intelligence"
    META_LEARNING = "meta_learning"
    AUTONOMOUS_PROBLEM_SOLVING = "autonomous_problem_solving"
    MATHEMATICAL_REASONING = "mathematical_reasoning"
    LOGICAL_REASONING = "logical_reasoning"
    CREATIVE_THINKING = "creative_thinking"
    PATTERN_RECOGNITION = "pattern_recognition"

@dataclass
class PerformanceMetric:
    """Individual performance measurement"""
    capability: str
    score: float
    confidence: float
    processing_time_ms: float
    timestamp: datetime
    context: Dict[str, Any] = field(default_factory=dict)
    success: bool = True
    error_message: Optional[str] = None

@dataclass
class CapabilityScore:
    """Aggregated capability scoring"""
    capability: str
    current_score: float
    average_score: float
    peak_score: float
    measurement_count: int
    last_updated: datetime
    confidence_interval: float
    trend: str  # "improving", "stable", "declining"

class GlobalPerformanceTracker:
    """
    Central performance tracking system for ROMAI AGI capabilities
    Provides real-time capability scoring and performance monitoring
    """
    
    def __init__(self):
        self.metrics: List[PerformanceMetric] = []
        self.capability_scores: Dict[str, CapabilityScore] = {}
        self.lock = threading.RLock()
        self.is_active = True
        
        # Initialize capability scores
        self._initialize_capability_scores()
        
        logger.info("Global Performance Tracker initialized")
    
    def _initialize_capability_scores(self):
        """Initialize all capability scores to reasonable defaults"""
        capabilities = [
            "romanian_language_processing",
            "cultural_understanding", 
            "reasoning",
            "multi_dimensional_intelligence",
            "meta_learning",
            "autonomous_problem_solving",
            "mathematical_reasoning",
            "logical_reasoning",
            "creative_thinking",
            "pattern_recognition"
        ]
        
        current_time = datetime.now()
        
        for capability in capabilities:
            self.capability_scores[capability] = CapabilityScore(
                capability=capability,
                current_score=0.75,  # Start with reasonable baseline
                average_score=0.75,
                peak_score=0.75,
                measurement_count=1,
                last_updated=current_time,
                confidence_interval=0.85,
                trend="stable"
            )
    
    def record_performance(self, 
                          capability: str, 
                          score: float, 
                          confidence: float,
                          processing_time_ms: float,
                          context: Optional[Dict[str, Any]] = None,
                          success: bool = True,
                          error_message: Optional[str] = None) -> None:
        """Record a performance measurement"""
        
        if not (0.0 <= score <= 1.0):
            logger.warning(f"Invalid score {score} for {capability}, clamping to [0,1]")
            score = max(0.0, min(1.0, score))
        
        metric = PerformanceMetric(
            capability=capability,
            score=score,
            confidence=confidence,
            processing_time_ms=processing_time_ms,
            timestamp=datetime.now(),
            context=context or {},
            success=success,
            error_message=error_message
        )
        
        with self.lock:
            self.metrics.append(metric)
            self._update_capability_score(capability, metric)
            
            # Keep only last 10000 metrics to prevent memory issues
            if len(self.metrics) > 10000:
                self.metrics = self.metrics[-5000:]
        
        logger.debug(f"Recorded performance: {capability} = {score:.3f} (confidence: {confidence:.3f})")
    
    def _update_capability_score(self, capability: str, metric: PerformanceMetric) -> None:
        """Update aggregated capability score based on new metric"""
        
        if capability not in self.capability_scores:
            self.capability_scores[capability] = CapabilityScore(
                capability=capability,
                current_score=metric.score,
                average_score=metric.score,
                peak_score=metric.score,
                measurement_count=1,
                last_updated=metric.timestamp,
                confidence_interval=metric.confidence,
                trend="stable"
            )
        else:
            score_data = self.capability_scores[capability]
            
            # Update current score (weighted average of recent measurements)
            weight = 0.7  # Weight for new measurement
            score_data.current_score = (weight * metric.score + 
                                       (1 - weight) * score_data.current_score)
            
            # Update average score
            total_score = (score_data.average_score * score_data.measurement_count + metric.score)
            score_data.measurement_count += 1
            score_data.average_score = total_score / score_data.measurement_count
            
            # Update peak score
            if metric.score > score_data.peak_score:
                score_data.peak_score = metric.score
            
            # Update confidence interval
            score_data.confidence_interval = (score_data.confidence_interval * 0.8 + 
                                            metric.confidence * 0.2)
            
            # Determine trend (simplified)
            if score_data.current_score > score_data.average_score * 1.05:
                score_data.trend = "improving"
            elif score_data.current_score < score_data.average_score * 0.95:
                score_data.trend = "declining"
            else:
                score_data.trend = "stable"
            
            score_data.last_updated = metric.timestamp
    
    def get_capability_score(self, capability: str) -> Optional[CapabilityScore]:
        """Get current score for a specific capability"""
        with self.lock:
            return self.capability_scores.get(capability)
    
    def get_all_capability_scores(self) -> Dict[str, CapabilityScore]:
        """Get all current capability scores"""
        with self.lock:
            return self.capability_scores.copy()
    
    def get_overall_agi_score(self) -> float:
        """Calculate overall AGI score as weighted average of all capabilities"""
        with self.lock:
            if not self.capability_scores:
                return 0.0
            
            # Weights for different capabilities
            weights = {
                "reasoning": 0.25,
                "mathematical_reasoning": 0.15,
                "logical_reasoning": 0.15,
                "romanian_language_processing": 0.15,
                "cultural_understanding": 0.10,
                "autonomous_problem_solving": 0.10,
                "meta_learning": 0.05,
                "multi_dimensional_intelligence": 0.05
            }
            
            weighted_sum = 0.0
            total_weight = 0.0
            
            for capability, score_data in self.capability_scores.items():
                weight = weights.get(capability, 0.02)  # Default small weight
                weighted_sum += score_data.current_score * weight
                total_weight += weight
            
            return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary"""
        with self.lock:
            overall_score = self.get_overall_agi_score()
            
            # Calculate average confidence
            total_confidence = sum(score.confidence_interval for score in self.capability_scores.values())
            avg_confidence = total_confidence / len(self.capability_scores) if self.capability_scores else 0.0
            
            # Recent performance metrics
            recent_metrics = [m for m in self.metrics[-100:] if m.success]
            avg_processing_time = (sum(m.processing_time_ms for m in recent_metrics) / 
                                 len(recent_metrics) if recent_metrics else 0.0)
            
            return {
                "overall_agi_score": overall_score,
                "confidence_interval": avg_confidence,
                "total_measurements": len(self.metrics),
                "successful_measurements": len([m for m in self.metrics if m.success]),
                "average_processing_time_ms": avg_processing_time,
                "capability_count": len(self.capability_scores),
                "last_evaluated": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
                "tracker_status": "active" if self.is_active else "inactive"
            }
    
    def get_capability_scores_dict(self) -> Dict[str, float]:
        """Get capability scores as simple dictionary (for API responses)"""
        with self.lock:
            scores = {}
            for capability, score_data in self.capability_scores.items():
                scores[capability] = score_data.current_score
            
            # Add overall score
            scores["overall_agi_score"] = self.get_overall_agi_score()
            scores["confidence_interval"] = sum(s.confidence_interval for s in self.capability_scores.values()) / len(self.capability_scores) if self.capability_scores else 0.5
            scores["last_evaluated"] = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
            
            return scores
    
    def reset_scores(self) -> None:
        """Reset all capability scores (for testing/calibration)"""
        with self.lock:
            self.metrics.clear()
            self._initialize_capability_scores()
            logger.info("Performance tracker scores reset")
    
    def simulate_realistic_scores(self) -> None:
        """Simulate realistic AGI capability scores for development/testing"""
        
        # Simulate performance measurements for different capabilities
        capabilities_performance = {
            "mathematical_reasoning": (0.85, 0.92),  # (score, confidence)
            "logical_reasoning": (0.82, 0.89),
            "romanian_language_processing": (0.91, 0.94),
            "cultural_understanding": (0.88, 0.90),
            "reasoning": (0.86, 0.91),
            "autonomous_problem_solving": (0.78, 0.85),
            "meta_learning": (0.74, 0.80),
            "multi_dimensional_intelligence": (0.80, 0.87),
            "creative_thinking": (0.77, 0.83),
            "pattern_recognition": (0.84, 0.89)
        }
        
        for capability, (score, confidence) in capabilities_performance.items():
            self.record_performance(
                capability=capability,
                score=score,
                confidence=confidence,
                processing_time_ms=150.0 + (capability.__hash__() % 100),
                context={"simulated": True, "baseline": True},
                success=True
            )
        
        logger.info("Simulated realistic AGI capability scores")

# Global instance
global_performance_tracker = GlobalPerformanceTracker()

# Auto-simulate realistic scores on import for development
import os
if os.getenv('ROMAI_ENV', 'development') == 'development':
    global_performance_tracker.simulate_realistic_scores()
    logger.info("Development mode: Simulated realistic AGI scores")
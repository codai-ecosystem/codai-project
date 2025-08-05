"""
Performance Tracking and Validation
==================================

Performance monitoring, metrics collection, and validation for adaptive learning systems.
"""

import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from collections import defaultdict, deque
import numpy as np
import logging

logger = logging.getLogger(__name__)

@dataclass
class LearningExperience:
    """Single learning experience data."""
    
    input_data: Any
    target_output: Any
    actual_output: Any
    loss_value: float
    cultural_context: str
    learning_strategy: Any  # LearningStrategy enum
    timestamp: float
    regional_specificity: str
    difficulty_level: float
    learning_pattern: Any  # RomanianLearningPattern enum
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'loss_value': self.loss_value,
            'cultural_context': self.cultural_context,
            'learning_strategy': str(self.learning_strategy),
            'timestamp': self.timestamp,
            'regional_specificity': self.regional_specificity,
            'difficulty_level': self.difficulty_level,
            'learning_pattern': str(self.learning_pattern)
        }

@dataclass
class ValidationMetrics:
    """Validation metrics for TRANSCENDENT PLUS targets."""
    
    learning_efficiency: float = 0.0
    adaptation_speed: float = 0.0
    cultural_learning_accuracy: float = 0.0
    romanian_cultural_authenticity: float = 0.0
    wisdom_integration_level: float = 0.0
    regional_adaptation_score: float = 0.0
    temporal_consistency: float = 0.0
    performance_stability: float = 0.0
    
    def validate_transcendent_plus_targets(self) -> Dict[str, Dict[str, Any]]:
        """Validate against TRANSCENDENT PLUS performance targets."""
        targets = {
            'learning_efficiency': 0.92,
            'adaptation_speed': 0.89,
            'cultural_learning_accuracy': 0.95,
            'romanian_cultural_authenticity': 0.94,
            'wisdom_integration_level': 0.90,
            'regional_adaptation_score': 0.88,
            'temporal_consistency': 0.86,
            'performance_stability': 0.85
        }
        
        validation_results = {}
        for metric_name, target_value in targets.items():
            current_value = getattr(self, metric_name, 0.0)
            validation_results[metric_name] = {
                'target': target_value,
                'achieved': current_value,
                'status': 'PASS' if current_value >= target_value else 'NEEDS_IMPROVEMENT',
                'gap': max(0, target_value - current_value),
                'performance_level': self._get_performance_level(current_value, target_value)
            }
        
        return validation_results
    
    def _get_performance_level(self, achieved: float, target: float) -> str:
        """Determine performance level based on achievement."""
        ratio = achieved / target if target > 0 else 0
        
        if ratio >= 1.05:
            return "EXCEPTIONAL"
        elif ratio >= 1.0:
            return "TRANSCENDENT_PLUS"
        elif ratio >= 0.95:
            return "TRANSCENDENT"
        elif ratio >= 0.90:
            return "ADVANCED"
        elif ratio >= 0.80:
            return "PROFICIENT"
        else:
            return "DEVELOPING"

class PerformanceTracker:
    """Comprehensive performance tracking for adaptive learning."""
    
    def __init__(self, window_size: int = 1000):
        """Initialize performance tracker.
        
        Args:
            window_size: Size of sliding window for metrics
        """
        self.window_size = window_size
        self.experiences: deque = deque(maxlen=window_size)
        self.metrics_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=window_size))
        self.cultural_patterns_performance: Dict[str, List[float]] = defaultdict(list)
        self.regional_performance: Dict[str, List[float]] = defaultdict(list)
        self.start_time = time.time()
        
    def add_experience(self, experience: LearningExperience) -> None:
        """Add a learning experience to tracking.
        
        Args:
            experience: Learning experience to track
        """
        self.experiences.append(experience)
        
        # Track cultural pattern performance
        pattern_key = str(experience.learning_pattern)
        self.cultural_patterns_performance[pattern_key].append(1.0 - experience.loss_value)
        
        # Track regional performance
        self.regional_performance[experience.regional_specificity].append(1.0 - experience.loss_value)
        
        # Update metrics
        self._update_metrics(experience)
        
    def _update_metrics(self, experience: LearningExperience) -> None:
        """Update performance metrics with new experience.
        
        Args:
            experience: Learning experience to process
        """
        # Learning efficiency (inverse of loss)
        learning_efficiency = 1.0 - experience.loss_value
        self.metrics_history['learning_efficiency'].append(learning_efficiency)
        
        # Cultural authenticity (based on cultural context match)
        cultural_authenticity = self._calculate_cultural_authenticity(experience)
        self.metrics_history['cultural_authenticity'].append(cultural_authenticity)
        
        # Adaptation speed (based on recent improvement)
        adaptation_speed = self._calculate_adaptation_speed()
        self.metrics_history['adaptation_speed'].append(adaptation_speed)
        
    def _calculate_cultural_authenticity(self, experience: LearningExperience) -> float:
        """Calculate cultural authenticity score for experience.
        
        Args:
            experience: Learning experience to evaluate
            
        Returns:
            Cultural authenticity score (0-1)
        """
        # Base authenticity from cultural context
        base_score = 0.8
        
        # Bonus for Romanian cultural context
        if "romanian" in experience.cultural_context.lower():
            base_score += 0.15
            
        # Bonus for traditional learning patterns
        traditional_patterns = [
            "traditional_apprenticeship", 
            "community_learning",
            "folkloric_transmission",
            "elder_teaching"
        ]
        if str(experience.learning_pattern).lower() in traditional_patterns:
            base_score += 0.05
            
        return min(1.0, base_score)
        
    def _calculate_adaptation_speed(self) -> float:
        """Calculate adaptation speed based on recent performance trends.
        
        Returns:
            Adaptation speed score (0-1)
        """
        if len(self.metrics_history['learning_efficiency']) < 10:
            return 0.5  # Default value with insufficient data
            
        recent_efficiency = list(self.metrics_history['learning_efficiency'])[-10:]
        early_efficiency = list(self.metrics_history['learning_efficiency'])[:10]
        
        recent_avg = np.mean(recent_efficiency)
        early_avg = np.mean(early_efficiency)
        
        # Improvement rate
        improvement = (recent_avg - early_avg) / max(early_avg, 0.1)
        
        # Convert to 0-1 scale
        speed_score = min(1.0, max(0.0, (improvement + 1.0) / 2.0))
        
        return speed_score
        
    def get_current_metrics(self) -> ValidationMetrics:
        """Get current performance metrics.
        
        Returns:
            Current validation metrics
        """
        if not self.experiences:
            return ValidationMetrics()
            
        # Calculate current metrics
        learning_efficiency = np.mean(list(self.metrics_history['learning_efficiency'])[-100:]) if self.metrics_history['learning_efficiency'] else 0.0
        adaptation_speed = self.metrics_history['adaptation_speed'][-1] if self.metrics_history['adaptation_speed'] else 0.0
        cultural_learning_accuracy = self._calculate_cultural_learning_accuracy()
        romanian_cultural_authenticity = np.mean(list(self.metrics_history['cultural_authenticity'])[-100:]) if self.metrics_history['cultural_authenticity'] else 0.0
        wisdom_integration_level = self._calculate_wisdom_integration()
        regional_adaptation_score = self._calculate_regional_adaptation()
        temporal_consistency = self._calculate_temporal_consistency()
        performance_stability = self._calculate_performance_stability()
        
        return ValidationMetrics(
            learning_efficiency=learning_efficiency,
            adaptation_speed=adaptation_speed,
            cultural_learning_accuracy=cultural_learning_accuracy,
            romanian_cultural_authenticity=romanian_cultural_authenticity,
            wisdom_integration_level=wisdom_integration_level,
            regional_adaptation_score=regional_adaptation_score,
            temporal_consistency=temporal_consistency,
            performance_stability=performance_stability
        )
        
    def _calculate_cultural_learning_accuracy(self) -> float:
        """Calculate cultural learning accuracy."""
        if not self.cultural_patterns_performance:
            return 0.0
            
        pattern_accuracies = []
        for pattern, performances in self.cultural_patterns_performance.items():
            if performances:
                pattern_accuracies.append(np.mean(performances[-50:]))  # Recent performance
                
        return np.mean(pattern_accuracies) if pattern_accuracies else 0.0
        
    def _calculate_wisdom_integration(self) -> float:
        """Calculate wisdom integration level."""
        # Based on traditional pattern performance
        traditional_patterns = [
            "traditional_apprenticeship",
            "elder_teaching", 
            "practical_wisdom",
            "folkloric_transmission"
        ]
        
        traditional_performance = []
        for pattern in traditional_patterns:
            if pattern in self.cultural_patterns_performance:
                performances = self.cultural_patterns_performance[pattern]
                if performances:
                    traditional_performance.append(np.mean(performances[-30:]))
                    
        return np.mean(traditional_performance) if traditional_performance else 0.0
        
    def _calculate_regional_adaptation(self) -> float:
        """Calculate regional adaptation score."""
        if not self.regional_performance:
            return 0.0
            
        regional_scores = []
        for region, performances in self.regional_performance.items():
            if performances:
                regional_scores.append(np.mean(performances[-30:]))
                
        return np.mean(regional_scores) if regional_scores else 0.0
        
    def _calculate_temporal_consistency(self) -> float:
        """Calculate temporal consistency score."""
        if len(self.metrics_history['learning_efficiency']) < 50:
            return 0.0
            
        recent_performance = list(self.metrics_history['learning_efficiency'])[-50:]
        
        # Calculate coefficient of variation (lower is more consistent)
        mean_perf = np.mean(recent_performance)
        std_perf = np.std(recent_performance)
        
        if mean_perf == 0:
            return 0.0
            
        cv = std_perf / mean_perf
        consistency_score = max(0.0, 1.0 - cv)  # Higher score for lower variation
        
        return consistency_score
        
    def _calculate_performance_stability(self) -> float:
        """Calculate overall performance stability."""
        if len(self.experiences) < 100:
            return 0.0
            
        recent_losses = [exp.loss_value for exp in list(self.experiences)[-100:]]
        
        # Stability based on loss variance
        loss_std = np.std(recent_losses)
        stability_score = max(0.0, 1.0 - loss_std)
        
        return stability_score
        
    def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report.
        
        Returns:
            Detailed performance report
        """
        metrics = self.get_current_metrics()
        validation_results = metrics.validate_transcendent_plus_targets()
        
        report = {
            'current_metrics': {
                'learning_efficiency': metrics.learning_efficiency,
                'adaptation_speed': metrics.adaptation_speed,
                'cultural_learning_accuracy': metrics.cultural_learning_accuracy,
                'romanian_cultural_authenticity': metrics.romanian_cultural_authenticity,
                'wisdom_integration_level': metrics.wisdom_integration_level,
                'regional_adaptation_score': metrics.regional_adaptation_score,
                'temporal_consistency': metrics.temporal_consistency,
                'performance_stability': metrics.performance_stability
            },
            'validation_results': validation_results,
            'cultural_patterns_summary': self._get_cultural_patterns_summary(),
            'regional_performance_summary': self._get_regional_performance_summary(),
            'overall_status': self._get_overall_status(validation_results),
            'recommendations': self._generate_recommendations(validation_results),
            'tracking_duration': time.time() - self.start_time,
            'total_experiences': len(self.experiences)
        }
        
        return report
        
    def _get_cultural_patterns_summary(self) -> Dict[str, Dict[str, float]]:
        """Get summary of cultural patterns performance."""
        summary = {}
        for pattern, performances in self.cultural_patterns_performance.items():
            if performances:
                summary[pattern] = {
                    'mean_performance': np.mean(performances),
                    'recent_performance': np.mean(performances[-20:]) if len(performances) >= 20 else np.mean(performances),
                    'total_experiences': len(performances),
                    'performance_trend': self._calculate_trend(performances)
                }
        return summary
        
    def _get_regional_performance_summary(self) -> Dict[str, Dict[str, float]]:
        """Get summary of regional performance."""
        summary = {}
        for region, performances in self.regional_performance.items():
            if performances:
                summary[region] = {
                    'mean_performance': np.mean(performances),
                    'recent_performance': np.mean(performances[-20:]) if len(performances) >= 20 else np.mean(performances),
                    'total_experiences': len(performances),
                    'performance_trend': self._calculate_trend(performances)
                }
        return summary
        
    def _calculate_trend(self, performances: List[float]) -> str:
        """Calculate performance trend (improving/declining/stable)."""
        if len(performances) < 10:
            return "insufficient_data"
            
        recent = np.mean(performances[-5:])
        earlier = np.mean(performances[-10:-5])
        
        if recent > earlier + 0.05:
            return "improving"
        elif recent < earlier - 0.05:
            return "declining"
        else:
            return "stable"
            
    def _get_overall_status(self, validation_results: Dict[str, Dict[str, Any]]) -> str:
        """Get overall performance status."""
        passed_targets = sum(1 for result in validation_results.values() if result['status'] == 'PASS')
        total_targets = len(validation_results)
        
        pass_rate = passed_targets / total_targets
        
        if pass_rate >= 0.9:
            return "TRANSCENDENT_PLUS"
        elif pass_rate >= 0.8:
            return "TRANSCENDENT"
        elif pass_rate >= 0.7:
            return "ADVANCED"
        elif pass_rate >= 0.6:
            return "PROFICIENT"
        else:
            return "DEVELOPING"
            
    def _generate_recommendations(self, validation_results: Dict[str, Dict[str, Any]]) -> List[str]:
        """Generate improvement recommendations."""
        recommendations = []
        
        for metric_name, result in validation_results.items():
            if result['status'] == 'NEEDS_IMPROVEMENT':
                gap = result['gap']
                if gap > 0.1:
                    recommendations.append(f"Priority improvement needed for {metric_name} (gap: {gap:.3f})")
                elif gap > 0.05:
                    recommendations.append(f"Moderate improvement needed for {metric_name} (gap: {gap:.3f})")
                else:
                    recommendations.append(f"Minor improvement needed for {metric_name} (gap: {gap:.3f})")
                    
        if not recommendations:
            recommendations.append("All targets achieved - maintain current performance levels")
            
        return recommendations

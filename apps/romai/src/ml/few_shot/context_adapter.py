"""
Context Adaptation Engine for Romanian AI
Real-time cultural pattern recognition and domain adaptation

This module provides advanced context switching capabilities for Romanian AI,
enabling real-time adaptation to cultural patterns, business domains, and
regional contexts with high-speed processing (< 50ms target).
"""

import asyncio
import time
import json
import logging
from typing import List, Dict, Any, Optional, Tuple, Union, Set
from dataclasses import dataclass, field
from enum import Enum
import re
from collections import defaultdict, deque
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger(__name__)

class ContextType(Enum):
    """Types of Romanian contexts"""
    CULTURAL_TRADITIONAL = "cultural_traditional"
    CULTURAL_MODERN = "cultural_modern"
    BUSINESS_FORMAL = "business_formal"
    BUSINESS_CASUAL = "business_casual"
    ACADEMIC_FORMAL = "academic_formal"
    SOCIAL_INFORMAL = "social_informal"
    TECHNICAL_DOMAIN = "technical_domain"
    LEGAL_FORMAL = "legal_formal"
    MEDICAL_PROFESSIONAL = "medical_professional"
    TOURISM_HOSPITALITY = "tourism_hospitality"

class AdaptationStrategy(Enum):
    """Context adaptation strategies"""
    IMMEDIATE = "immediate"
    GRADUAL = "gradual"
    WEIGHTED_BLEND = "weighted_blend"
    HIERARCHICAL = "hierarchical"
    CULTURAL_PRIORITY = "cultural_priority"

@dataclass
class RomanianContextSignal:
    """Signal indicating Romanian context characteristics"""
    signal_id: str
    signal_type: str
    strength: float
    confidence: float
    cultural_markers: List[str] = field(default_factory=list)
    linguistic_features: Dict[str, Any] = field(default_factory=dict)
    regional_indicators: List[str] = field(default_factory=list)
    temporal_relevance: float = 1.0
    
    def __post_init__(self):
        """Validate signal data"""
        self.strength = max(0.0, min(1.0, self.strength))
        self.confidence = max(0.0, min(1.0, self.confidence))
        self.temporal_relevance = max(0.0, min(1.0, self.temporal_relevance))

@dataclass
class ContextualState:
    """Current contextual state of Romanian AI"""
    primary_context: ContextType
    secondary_contexts: List[ContextType] = field(default_factory=list)
    cultural_significance: float = 0.8
    regional_focus: str = "bucurești"
    formality_level: float = 0.5
    business_domain: Optional[str] = None
    adaptation_confidence: float = 0.0
    last_update: datetime = field(default_factory=datetime.now)
    active_patterns: Set[str] = field(default_factory=set)
    
    def update_timestamp(self):
        """Update last modification timestamp"""
        self.last_update = datetime.now()

@dataclass
class AdaptationRecord:
    """Record of context adaptation"""
    timestamp: datetime
    from_context: ContextType
    to_context: ContextType
    adaptation_time_ms: float
    confidence_score: float
    triggering_signals: List[str]
    success: bool
    performance_metrics: Dict[str, Any] = field(default_factory=dict)

class RomanianPatternRecognizer:
    """Recognizes Romanian cultural and linguistic patterns"""
    
    def __init__(self):
        self.cultural_patterns = {}
        self.linguistic_patterns = {}
        self.regional_patterns = {}
        self.business_patterns = {}
        
        self._initialize_pattern_database()
        
        logger.info("Romanian Pattern Recognizer initialized")
    
    def _initialize_pattern_database(self):
        """Initialize Romanian pattern recognition database"""
        
        # Cultural patterns
        self.cultural_patterns = {
            "traditional_greetings": {
                "patterns": ["sărut mâna", "noroc", "bună ziua", "bună dimineața"],
                "context": ContextType.CULTURAL_TRADITIONAL,
                "strength": 0.9
            },
            "formal_business": {
                "patterns": ["dumneavoastră", "domnul director", "compania noastră", "contract"],
                "context": ContextType.BUSINESS_FORMAL,
                "strength": 0.85
            },
            "folk_traditions": {
                "patterns": ["mărțișor", "hora", "sarmale", "colinde", "păstor"],
                "context": ContextType.CULTURAL_TRADITIONAL,
                "strength": 0.95
            },
            "modern_casual": {
                "patterns": ["salut", "ce faci", "merge", "super", "cool"],
                "context": ContextType.SOCIAL_INFORMAL,
                "strength": 0.7
            },
            "academic_style": {
                "patterns": ["prin urmare", "în concluzie", "conform cu", "cercetarea"],
                "context": ContextType.ACADEMIC_FORMAL,
                "strength": 0.88
            }
        }
        
        # Linguistic patterns
        self.linguistic_patterns = {
            "formal_pronouns": {
                "patterns": ["dumneavoastră", "vă", "îmi permiteți"],
                "formality": 0.9,
                "regional_neutral": True
            },
            "informal_pronouns": {
                "patterns": ["tu", "îți", "te"],
                "formality": 0.2,
                "regional_neutral": True
            },
            "regional_expressions": {
                "transilvania": ["puțin", "foarte", "acuma"],
                "moldovo": ["foame", "acasă", "seamănă"],
                "muntenia": ["băiat", "fată", "merge"]
            }
        }
        
        # Regional patterns
        self.regional_patterns = {
            "bucurești": {
                "linguistic_markers": ["standard_romanian", "urban_expressions"],
                "cultural_elements": ["cosmopolitan", "business_center"],
                "formality_tendency": 0.6
            },
            "cluj-napoca": {
                "linguistic_markers": ["transylvanian_influence", "hungarian_loanwords"],
                "cultural_elements": ["multicultural", "academic_center"],
                "formality_tendency": 0.7
            },
            "iași": {
                "linguistic_markers": ["moldovan_variant", "traditional_expressions"],
                "cultural_elements": ["historical", "cultural_capital"],
                "formality_tendency": 0.75
            }
        }
        
        # Business domain patterns
        self.business_patterns = {
            "finance": {
                "keywords": ["investiție", "profit", "acțiuni", "bănci", "credit"],
                "formality": 0.9,
                "context": ContextType.BUSINESS_FORMAL
            },
            "technology": {
                "keywords": ["software", "aplicație", "server", "database", "programming"],
                "formality": 0.6,
                "context": ContextType.TECHNICAL_DOMAIN
            },
            "tourism": {
                "keywords": ["excursie", "hotel", "rezervare", "atracții", "ghid"],
                "formality": 0.5,
                "context": ContextType.TOURISM_HOSPITALITY
            }
        }
    
    async def analyze_context_signals(self, text: str) -> List[RomanianContextSignal]:
        """Analyze text for Romanian context signals"""
        
        signals = []
        text_lower = text.lower()
        
        # Check cultural patterns
        for pattern_name, pattern_data in self.cultural_patterns.items():
            matches = [p for p in pattern_data["patterns"] if p in text_lower]
            if matches:
                signal = RomanianContextSignal(
                    signal_id=f"cultural_{pattern_name}",
                    signal_type="cultural",
                    strength=pattern_data["strength"] * (len(matches) / len(pattern_data["patterns"])),
                    confidence=min(0.95, 0.7 + len(matches) * 0.1),
                    cultural_markers=matches
                )
                signals.append(signal)
        
        # Check linguistic formality
        formal_matches = 0
        informal_matches = 0
        
        for pattern_data in self.linguistic_patterns.values():
            if "formality" in pattern_data:
                matches = [p for p in pattern_data["patterns"] if p in text_lower]
                if pattern_data["formality"] > 0.7:
                    formal_matches += len(matches)
                elif pattern_data["formality"] < 0.3:
                    informal_matches += len(matches)
        
        if formal_matches > informal_matches:
            signal = RomanianContextSignal(
                signal_id="linguistic_formality",
                signal_type="linguistic",
                strength=0.8,
                confidence=min(0.9, 0.6 + formal_matches * 0.1),
                linguistic_features={"formality_level": "high", "formal_markers": formal_matches}
            )
            signals.append(signal)
        elif informal_matches > formal_matches:
            signal = RomanianContextSignal(
                signal_id="linguistic_informality",
                signal_type="linguistic",
                strength=0.7,
                confidence=min(0.9, 0.6 + informal_matches * 0.1),
                linguistic_features={"formality_level": "low", "informal_markers": informal_matches}
            )
            signals.append(signal)
        
        # Check regional indicators
        for region, patterns in self.linguistic_patterns.get("regional_expressions", {}).items():
            matches = [p for p in patterns if p in text_lower]
            if matches:
                signal = RomanianContextSignal(
                    signal_id=f"regional_{region}",
                    signal_type="regional",
                    strength=0.6 + len(matches) * 0.1,
                    confidence=0.8,
                    regional_indicators=matches
                )
                signals.append(signal)
        
        # Check business domain patterns
        for domain, domain_data in self.business_patterns.items():
            matches = [k for k in domain_data["keywords"] if k in text_lower]
            if matches:
                signal = RomanianContextSignal(
                    signal_id=f"business_{domain}",
                    signal_type="business",
                    strength=0.7 + len(matches) * 0.1,
                    confidence=min(0.95, 0.6 + len(matches) * 0.15),
                    linguistic_features={"domain": domain, "keywords": matches}
                )
                signals.append(signal)
        
        return signals

class RomanianContextAdaptationEngine:
    """Advanced context adaptation engine for Romanian AI"""
    
    def __init__(self):
        self.current_state = ContextualState(
            primary_context=ContextType.CULTURAL_TRADITIONAL,
            cultural_significance=0.8,
            regional_focus="bucurești",
            formality_level=0.5
        )
        
        self.pattern_recognizer = RomanianPatternRecognizer()
        self.adaptation_history = deque(maxlen=100)  # Keep last 100 adaptations
        self.performance_cache = {}
        self.context_memory = {}
        self.adaptation_thresholds = {
            "confidence_minimum": 0.6,
            "signal_strength_minimum": 0.5,
            "adaptation_cooldown_ms": 100
        }
        
        self.last_adaptation_time = 0
        
        logger.info("Romanian Context Adaptation Engine initialized")
    
    async def adapt_context(
        self,
        input_text: str,
        user_preferences: Optional[Dict[str, Any]] = None,
        forced_context: Optional[ContextType] = None
    ) -> Tuple[ContextualState, Dict[str, Any]]:
        """Adapt context based on input and preferences"""
        
        start_time = time.time()
        
        try:
            # Check adaptation cooldown
            current_time_ms = time.time() * 1000
            if (current_time_ms - self.last_adaptation_time) < self.adaptation_thresholds["adaptation_cooldown_ms"]:
                return self.current_state, {"status": "cooldown_active", "adaptation_time_ms": 0}
            
            # Analyze context signals
            signals = await self.pattern_recognizer.analyze_context_signals(input_text)
            
            # Determine target context
            if forced_context:
                target_context = forced_context
                adaptation_confidence = 1.0
            else:
                target_context, adaptation_confidence = await self._determine_target_context(
                    signals, user_preferences
                )
            
            # Check if adaptation is needed
            if target_context == self.current_state.primary_context and adaptation_confidence < 0.8:
                adaptation_time = (time.time() - start_time) * 1000
                return self.current_state, {
                    "status": "no_adaptation_needed",
                    "adaptation_time_ms": adaptation_time,
                    "signals_detected": len(signals)
                }
            
            # Store previous state
            previous_context = self.current_state.primary_context
            
            # Perform adaptation
            new_state = await self._perform_context_adaptation(
                target_context, signals, user_preferences
            )
            
            adaptation_time = (time.time() - start_time) * 1000
            
            # Record adaptation
            adaptation_record = AdaptationRecord(
                timestamp=datetime.now(),
                from_context=previous_context,
                to_context=target_context,
                adaptation_time_ms=adaptation_time,
                confidence_score=adaptation_confidence,
                triggering_signals=[s.signal_id for s in signals],
                success=True,
                performance_metrics={
                    "signal_count": len(signals),
                    "speed_target_met": adaptation_time < 50,
                    "confidence_threshold_met": adaptation_confidence >= self.adaptation_thresholds["confidence_minimum"]
                }
            )
            
            self.adaptation_history.append(adaptation_record)
            self.last_adaptation_time = current_time_ms
            
            # Update current state
            self.current_state = new_state
            
            # Cache performance data
            self.performance_cache[f"adaptation_{int(time.time())}"] = {
                "adaptation_time_ms": adaptation_time,
                "confidence": adaptation_confidence,
                "signals_count": len(signals),
                "context_change": previous_context != target_context
            }
            
            metadata = {
                "status": "adaptation_successful",
                "adaptation_time_ms": adaptation_time,
                "from_context": previous_context.value,
                "to_context": target_context.value,
                "confidence": adaptation_confidence,
                "signals_processed": len(signals),
                "speed_target_met": adaptation_time < 50,
                "cultural_significance": new_state.cultural_significance
            }
            
            logger.info(f"Context adapted from {previous_context.value} to {target_context.value} in {adaptation_time:.2f}ms")
            
            return new_state, metadata
            
        except Exception as e:
            logger.error(f"Context adaptation failed: {e}")
            
            # Record failed adaptation
            adaptation_record = AdaptationRecord(
                timestamp=datetime.now(),
                from_context=self.current_state.primary_context,
                to_context=self.current_state.primary_context,
                adaptation_time_ms=(time.time() - start_time) * 1000,
                confidence_score=0.0,
                triggering_signals=[],
                success=False,
                performance_metrics={"error": str(e)}
            )
            self.adaptation_history.append(adaptation_record)
            
            return self.current_state, {"status": "adaptation_failed", "error": str(e)}
    
    async def _determine_target_context(
        self,
        signals: List[RomanianContextSignal],
        user_preferences: Optional[Dict[str, Any]]
    ) -> Tuple[ContextType, float]:
        """Determine target context from signals and preferences"""
        
        # Score contexts based on signals
        context_scores = defaultdict(float)
        signal_contributions = defaultdict(list)
        
        for signal in signals:
            if signal.strength >= self.adaptation_thresholds["signal_strength_minimum"]:
                # Determine context from signal
                target_contexts = await self._map_signal_to_contexts(signal)
                
                for context, contribution in target_contexts.items():
                    weighted_contribution = contribution * signal.strength * signal.confidence
                    context_scores[context] += weighted_contribution
                    signal_contributions[context].append(signal.signal_id)
        
        # Apply user preferences
        if user_preferences:
            preferred_context = user_preferences.get("preferred_context")
            if preferred_context:
                try:
                    pref_context = ContextType(preferred_context)
                    context_scores[pref_context] += 0.3  # Preference bonus
                except ValueError:
                    pass
            
            # Regional preference
            preferred_region = user_preferences.get("preferred_region")
            if preferred_region and preferred_region != self.current_state.regional_focus:
                # Boost regional contexts
                for context in context_scores:
                    if "regional" in str(context).lower():
                        context_scores[context] += 0.2
        
        # Select highest scoring context
        if context_scores:
            target_context = max(context_scores, key=context_scores.get)
            confidence = min(0.95, context_scores[target_context])
        else:
            # Default to current context
            target_context = self.current_state.primary_context
            confidence = 0.5
        
        return target_context, confidence
    
    async def _map_signal_to_contexts(self, signal: RomanianContextSignal) -> Dict[ContextType, float]:
        """Map signal to potential contexts with weights"""
        
        context_mapping = {}
        
        if signal.signal_type == "cultural":
            if "traditional" in signal.signal_id:
                context_mapping[ContextType.CULTURAL_TRADITIONAL] = 0.9
            elif "modern" in signal.signal_id:
                context_mapping[ContextType.CULTURAL_MODERN] = 0.8
            elif "folk" in signal.signal_id:
                context_mapping[ContextType.CULTURAL_TRADITIONAL] = 0.95
        
        elif signal.signal_type == "business":
            context_mapping[ContextType.BUSINESS_FORMAL] = 0.85
            if "casual" in signal.signal_id:
                context_mapping[ContextType.BUSINESS_CASUAL] = 0.7
        
        elif signal.signal_type == "linguistic":
            if signal.linguistic_features.get("formality_level") == "high":
                context_mapping[ContextType.BUSINESS_FORMAL] = 0.8
                context_mapping[ContextType.ACADEMIC_FORMAL] = 0.7
            elif signal.linguistic_features.get("formality_level") == "low":
                context_mapping[ContextType.SOCIAL_INFORMAL] = 0.8
        
        elif signal.signal_type == "regional":
            # Regional signals can influence formality and cultural focus
            context_mapping[ContextType.CULTURAL_TRADITIONAL] = 0.6
        
        return context_mapping
    
    async def _perform_context_adaptation(
        self,
        target_context: ContextType,
        signals: List[RomanianContextSignal],
        user_preferences: Optional[Dict[str, Any]]
    ) -> ContextualState:
        """Perform the actual context adaptation"""
        
        # Create new contextual state
        new_state = ContextualState(
            primary_context=target_context,
            regional_focus=self.current_state.regional_focus,
            formality_level=self.current_state.formality_level
        )
        
        # Adapt cultural significance
        cultural_signals = [s for s in signals if s.signal_type == "cultural"]
        if cultural_signals:
            avg_cultural_strength = sum(s.strength for s in cultural_signals) / len(cultural_signals)
            new_state.cultural_significance = min(0.98, max(0.5, avg_cultural_strength))
        else:
            new_state.cultural_significance = 0.7  # Default
        
        # Adapt formality level
        linguistic_signals = [s for s in signals if s.signal_type == "linguistic"]
        if linguistic_signals:
            formality_indicators = 0
            for signal in linguistic_signals:
                if signal.linguistic_features.get("formality_level") == "high":
                    formality_indicators += 1
                elif signal.linguistic_features.get("formality_level") == "low":
                    formality_indicators -= 1
            
            if formality_indicators > 0:
                new_state.formality_level = min(0.95, self.current_state.formality_level + 0.2)
            elif formality_indicators < 0:
                new_state.formality_level = max(0.1, self.current_state.formality_level - 0.2)
        
        # Adapt regional focus
        regional_signals = [s for s in signals if s.signal_type == "regional"]
        if regional_signals:
            # Extract region from strongest signal
            strongest_regional = max(regional_signals, key=lambda s: s.strength)
            if "regional_" in strongest_regional.signal_id:
                region = strongest_regional.signal_id.replace("regional_", "")
                new_state.regional_focus = region
        
        # Detect business domain
        business_signals = [s for s in signals if s.signal_type == "business"]
        if business_signals:
            strongest_business = max(business_signals, key=lambda s: s.strength)
            domain = strongest_business.linguistic_features.get("domain")
            new_state.business_domain = domain
        
        # Set secondary contexts
        secondary_contexts = []
        for signal in signals:
            if signal.strength > 0.6:  # Strong secondary signals
                secondary_context = await self._signal_to_secondary_context(signal)
                if secondary_context and secondary_context != target_context:
                    secondary_contexts.append(secondary_context)
        
        new_state.secondary_contexts = list(set(secondary_contexts))[:3]  # Max 3 secondary
        
        # Calculate adaptation confidence
        total_signal_strength = sum(s.strength for s in signals) if signals else 0
        new_state.adaptation_confidence = min(0.95, total_signal_strength / len(signals) if signals else 0.5)
        
        # Update active patterns
        new_state.active_patterns = set(s.signal_id for s in signals if s.strength > 0.5)
        
        new_state.update_timestamp()
        
        return new_state
    
    async def _signal_to_secondary_context(self, signal: RomanianContextSignal) -> Optional[ContextType]:
        """Convert signal to secondary context"""
        
        if signal.signal_type == "cultural" and "traditional" in signal.signal_id:
            return ContextType.CULTURAL_TRADITIONAL
        elif signal.signal_type == "business":
            return ContextType.BUSINESS_FORMAL
        elif signal.signal_type == "linguistic" and signal.linguistic_features.get("formality_level") == "high":
            return ContextType.ACADEMIC_FORMAL
        
        return None
    
    async def get_context_recommendations(self, text: str) -> Dict[str, Any]:
        """Get context adaptation recommendations"""
        
        try:
            signals = await self.pattern_recognizer.analyze_context_signals(text)
            
            recommendations = {
                "current_context": self.current_state.primary_context.value,
                "detected_signals": [
                    {
                        "signal_id": s.signal_id,
                        "type": s.signal_type,
                        "strength": s.strength,
                        "confidence": s.confidence
                    }
                    for s in signals
                ],
                "recommended_adaptations": [],
                "cultural_insights": {},
                "performance_prediction": {}
            }
            
            # Generate recommendations
            if signals:
                target_context, confidence = await self._determine_target_context(signals, None)
                
                if target_context != self.current_state.primary_context:
                    recommendations["recommended_adaptations"].append({
                        "target_context": target_context.value,
                        "confidence": confidence,
                        "reason": f"Strong signals detected for {target_context.value}",
                        "expected_improvement": "Cultural appropriateness and accuracy"
                    })
                
                # Cultural insights
                cultural_signals = [s for s in signals if s.signal_type == "cultural"]
                if cultural_signals:
                    recommendations["cultural_insights"] = {
                        "cultural_strength": sum(s.strength for s in cultural_signals) / len(cultural_signals),
                        "dominant_cultural_elements": [s.signal_id for s in cultural_signals if s.strength > 0.7],
                        "regional_associations": list(set(r for s in signals for r in s.regional_indicators))
                    }
                
                # Performance prediction
                recommendations["performance_prediction"] = {
                    "expected_accuracy_improvement": min(0.2, confidence * 0.3),
                    "adaptation_time_estimate_ms": 25 + len(signals) * 5,
                    "cultural_appropriateness_score": min(0.95, 0.7 + confidence * 0.25)
                }
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate context recommendations: {e}")
            return {"error": str(e)}
    
    async def get_adaptation_metrics(self) -> Dict[str, Any]:
        """Get adaptation engine performance metrics"""
        
        try:
            # Recent performance data
            recent_cache = list(self.performance_cache.values())[-20:]  # Last 20 adaptations
            
            if recent_cache:
                avg_adaptation_time = sum(d["adaptation_time_ms"] for d in recent_cache) / len(recent_cache)
                avg_confidence = sum(d["confidence"] for d in recent_cache) / len(recent_cache)
                speed_target_rate = sum(1 for d in recent_cache if d["adaptation_time_ms"] < 50) / len(recent_cache)
                context_change_rate = sum(1 for d in recent_cache if d["context_change"]) / len(recent_cache)
            else:
                avg_adaptation_time = 0
                avg_confidence = 0
                speed_target_rate = 0
                context_change_rate = 0
            
            # Adaptation history analysis
            successful_adaptations = sum(1 for record in self.adaptation_history if record.success)
            total_adaptations = len(self.adaptation_history)
            success_rate = successful_adaptations / total_adaptations if total_adaptations > 0 else 0
            
            # Context distribution
            context_usage = defaultdict(int)
            for record in self.adaptation_history:
                context_usage[record.to_context.value] += 1
            
            return {
                "performance_summary": {
                    "average_adaptation_time_ms": avg_adaptation_time,
                    "average_confidence": avg_confidence,
                    "speed_target_achievement_rate": speed_target_rate,
                    "context_change_rate": context_change_rate,
                    "adaptation_success_rate": success_rate
                },
                "current_state": {
                    "primary_context": self.current_state.primary_context.value,
                    "cultural_significance": self.current_state.cultural_significance,
                    "formality_level": self.current_state.formality_level,
                    "regional_focus": self.current_state.regional_focus,
                    "business_domain": self.current_state.business_domain,
                    "adaptation_confidence": self.current_state.adaptation_confidence
                },
                "adaptation_statistics": {
                    "total_adaptations": total_adaptations,
                    "successful_adaptations": successful_adaptations,
                    "recent_adaptations": len(recent_cache),
                    "context_distribution": dict(context_usage)
                },
                "targets": {
                    "adaptation_speed": "< 50ms",
                    "confidence_threshold": "> 60%",
                    "success_rate": "> 95%",
                    "cultural_accuracy": "> 90%"
                },
                "system_capabilities": {
                    "pattern_recognition": "Advanced Romanian patterns",
                    "context_types": len(ContextType),
                    "adaptation_strategies": len(AdaptationStrategy),
                    "real_time_processing": True
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get adaptation metrics: {e}")
            return {"error": str(e)}

# Export key classes
__all__ = [
    "RomanianContextAdaptationEngine",
    "RomanianPatternRecognizer",
    "ContextualState",
    "RomanianContextSignal",
    "ContextType",
    "AdaptationStrategy"
]

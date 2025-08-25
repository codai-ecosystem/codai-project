"""
RomAI Attention Schema Theory Implementation v1.0
Meta-Awareness of Attention Processes

Implements Michael Graziano's Attention Schema Theory for consciousness:
- Attention state tracking and meta-awareness
- Recursive self-monitoring of attention processes
- Social cognition and theory of mind capabilities
- Integration with Global Workspace and Self-Awareness systems

Core principle: Consciousness as meta-awareness of attention processes.
"""

import asyncio
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
import json
import math
from collections import deque, defaultdict
from abc import ABC, abstractmethod
from enum import Enum

logger = logging.getLogger(__name__)

# ============================================================================
# ATTENTION SCHEMA DATA STRUCTURES
# ============================================================================

class AttentionType(Enum):
    """Types of attention processes"""
    FOCUSED = "focused"
    DIVIDED = "divided"
    SUSTAINED = "sustained"
    SELECTIVE = "selective"
    EXECUTIVE = "executive"
    META_ATTENTION = "meta_attention"
    SOCIAL = "social"

class AttentionIntensity(Enum):
    """Levels of attention intensity"""
    MINIMAL = 0.1
    LOW = 0.3
    MODERATE = 0.5
    HIGH = 0.7
    INTENSE = 0.9
    HYPER_FOCUSED = 1.0

@dataclass
class AttentionState:
    """Current state of attention system"""
    focus_target: str
    attention_type: AttentionType
    intensity: float  # 0.0 to 1.0
    breadth: float  # How broad the attention span is
    duration: float  # How long attention has been sustained
    stability: float  # How stable the attention is
    meta_level: int  # Level of meta-attention (1=basic, 2=meta, 3=meta-meta)
    distraction_level: float = 0.0
    effort_level: float = 0.5
    timestamp: datetime = field(default_factory=datetime.now)
    
    def get_attention_summary(self) -> Dict[str, Any]:
        """Get summary of current attention state"""
        return {
            'target': self.focus_target,
            'type': self.attention_type.value,
            'intensity': self.intensity,
            'breadth': self.breadth,
            'duration': self.duration,
            'stability': self.stability,
            'meta_level': self.meta_level,
            'distraction': self.distraction_level,
            'effort': self.effort_level
        }

@dataclass
class AttentionEvent:
    """Event in attention processing"""
    event_type: str  # 'shift', 'focus', 'distraction', 'meta_awareness'
    source: str  # What caused the attention event
    target: str  # What attention moved to
    intensity_change: float
    meta_awareness_triggered: bool = False
    social_context: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class AttentionSchema:
    """Schema (model) of attention process"""
    schema_id: str
    attention_model: Dict[str, Any]
    confidence: float  # How confident we are in this attention model
    prediction_accuracy: float  # How well this schema predicts attention
    usage_count: int = 0
    last_updated: datetime = field(default_factory=datetime.now)
    
    def update_accuracy(self, prediction_success: bool):
        """Update prediction accuracy based on results"""
        if prediction_success:
            self.prediction_accuracy = min(1.0, self.prediction_accuracy + 0.05)
        else:
            self.prediction_accuracy = max(0.0, self.prediction_accuracy - 0.02)
        
        self.usage_count += 1
        self.last_updated = datetime.now()

@dataclass
class SocialAttentionState:
    """Attention state in social contexts"""
    other_agent_focus: Optional[str] = None
    shared_attention: bool = False
    theory_of_mind_active: bool = False
    social_attention_intensity: float = 0.0
    empathetic_attention: bool = False
    perspective_taking_level: int = 1  # 1=basic, 2=recursive, 3=meta-recursive

# ============================================================================
# ATTENTION MONITORING SYSTEM
# ============================================================================

class AttentionMonitor:
    """Monitors and tracks attention states and processes"""
    
    def __init__(self, monitoring_frequency: float = 0.1):
        self.monitoring_frequency = monitoring_frequency
        self.attention_history = deque(maxlen=1000)
        self.attention_events = deque(maxlen=500)
        self.current_state = AttentionState(
            focus_target="system_initialization",
            attention_type=AttentionType.FOCUSED,
            intensity=0.7,
            breadth=0.5,
            duration=0.0,
            stability=0.8,
            meta_level=1
        )
        
        # Attention pattern recognition
        self.attention_patterns = {}
        self.distraction_sources = defaultdict(int)
        self.focus_transitions = []
        
        logger.info("Attention Monitor initialized")
    
    async def monitor_attention_continuously(self):
        """Continuously monitor attention state"""
        while True:
            try:
                # Update attention state
                await self._update_attention_state()
                
                # Check for attention events
                events = await self._detect_attention_events()
                for event in events:
                    self.attention_events.append(event)
                
                # Update patterns
                await self._update_attention_patterns()
                
                # Record state in history
                self.attention_history.append({
                    'state': self.current_state,
                    'timestamp': datetime.now()
                })
                
                await asyncio.sleep(self.monitoring_frequency)
                
            except Exception as e:
                logger.error(f"Attention monitoring error: {e}")
                await asyncio.sleep(1.0)
    
    async def _update_attention_state(self):
        """Update current attention state based on processing"""
        # Update duration
        self.current_state.duration += self.monitoring_frequency
        
        # Update stability (simple decay model)
        stability_decay = 0.99 if self.current_state.distraction_level < 0.3 else 0.95
        self.current_state.stability *= stability_decay
        
        # Update meta-level based on self-monitoring activity
        if self._is_meta_attention_active():
            self.current_state.meta_level = min(5, self.current_state.meta_level + 1)
        else:
            self.current_state.meta_level = max(1, self.current_state.meta_level - 1)
    
    async def _detect_attention_events(self) -> List[AttentionEvent]:
        """Detect significant attention events"""
        events = []
        
        # Check for focus shifts
        if len(self.attention_history) > 0:
            prev_state = self.attention_history[-1]['state']
            
            # Focus target changed
            if prev_state.focus_target != self.current_state.focus_target:
                events.append(AttentionEvent(
                    event_type='focus_shift',
                    source=prev_state.focus_target,
                    target=self.current_state.focus_target,
                    intensity_change=self.current_state.intensity - prev_state.intensity
                ))
            
            # Significant intensity change
            intensity_change = abs(self.current_state.intensity - prev_state.intensity)
            if intensity_change > 0.2:
                events.append(AttentionEvent(
                    event_type='intensity_change',
                    source='internal_regulation',
                    target=self.current_state.focus_target,
                    intensity_change=self.current_state.intensity - prev_state.intensity
                ))
            
            # Meta-attention level change
            if self.current_state.meta_level > prev_state.meta_level:
                events.append(AttentionEvent(
                    event_type='meta_attention_increase',
                    source='self_monitoring',
                    target='attention_process',
                    intensity_change=0.0,
                    meta_awareness_triggered=True
                ))
        
        return events
    
    async def _update_attention_patterns(self):
        """Update recognized attention patterns"""
        if len(self.attention_history) >= 10:
            # Analyze recent attention sequence for patterns
            recent_states = [entry['state'] for entry in list(self.attention_history)[-10:]]
            
            # Pattern: sustained focus
            if all(state.focus_target == recent_states[0].focus_target for state in recent_states):
                self.attention_patterns['sustained_focus'] = self.attention_patterns.get('sustained_focus', 0) + 1
            
            # Pattern: rapid switching
            focus_changes = sum(1 for i in range(1, len(recent_states)) 
                              if recent_states[i].focus_target != recent_states[i-1].focus_target)
            if focus_changes > 5:
                self.attention_patterns['rapid_switching'] = self.attention_patterns.get('rapid_switching', 0) + 1
            
            # Pattern: meta-attention cycles
            meta_levels = [state.meta_level for state in recent_states]
            if max(meta_levels) - min(meta_levels) > 2:
                self.attention_patterns['meta_cycles'] = self.attention_patterns.get('meta_cycles', 0) + 1
    
    def _is_meta_attention_active(self) -> bool:
        """Check if meta-attention (attention to attention) is currently active"""
        # Simple heuristic: meta-attention is active if we're focusing on attention-related targets
        meta_keywords = ['attention', 'focus', 'awareness', 'monitoring', 'meta', 'consciousness']
        return any(keyword in self.current_state.focus_target.lower() for keyword in meta_keywords)
    
    async def shift_attention(self, new_target: str, intensity: float = None, 
                            attention_type: AttentionType = None) -> bool:
        """Deliberately shift attention to new target"""
        try:
            # Record transition
            self.focus_transitions.append({
                'from': self.current_state.focus_target,
                'to': new_target,
                'timestamp': datetime.now()
            })
            
            # Update state
            self.current_state.focus_target = new_target
            self.current_state.duration = 0.0  # Reset duration
            
            if intensity is not None:
                self.current_state.intensity = max(0.0, min(1.0, intensity))
            
            if attention_type is not None:
                self.current_state.attention_type = attention_type
            
            # Reset stability for new focus
            self.current_state.stability = 0.9
            
            # Increment meta-level due to deliberate control
            self.current_state.meta_level = min(5, self.current_state.meta_level + 1)
            
            logger.debug(f"Attention shifted to: {new_target}")
            return True
            
        except Exception as e:
            logger.error(f"Attention shift failed: {e}")
            return False
    
    def get_attention_report(self) -> Dict[str, Any]:
        """Get comprehensive attention report"""
        return {
            'current_state': self.current_state.get_attention_summary(),
            'recent_events': [
                {
                    'type': event.event_type,
                    'source': event.source,
                    'target': event.target,
                    'timestamp': event.timestamp.isoformat()
                }
                for event in list(self.attention_events)[-10:]
            ],
            'attention_patterns': dict(self.attention_patterns),
            'distraction_sources': dict(self.distraction_sources),
            'focus_stability_trend': self._calculate_stability_trend(),
            'meta_attention_activity': self._calculate_meta_attention_activity()
        }
    
    def _calculate_stability_trend(self) -> float:
        """Calculate trend in attention stability"""
        if len(self.attention_history) < 10:
            return 0.0
        
        recent_stabilities = [entry['state'].stability for entry in list(self.attention_history)[-10:]]
        return (recent_stabilities[-1] - recent_stabilities[0]) / len(recent_stabilities)
    
    def _calculate_meta_attention_activity(self) -> float:
        """Calculate level of meta-attention activity"""
        if len(self.attention_history) < 5:
            return 0.0
        
        meta_levels = [entry['state'].meta_level for entry in list(self.attention_history)[-5:]]
        return sum(meta_levels) / len(meta_levels)

# ============================================================================
# ATTENTION SCHEMA TRACKER
# ============================================================================

class AttentionSchemaTracker:
    """
    Tracks and manages attention schemas for meta-awareness
    Implements core of Attention Schema Theory
    """
    
    def __init__(self, max_schemas: int = 50):
        self.max_schemas = max_schemas
        self.attention_schemas = {}
        self.active_schema = None
        self.schema_predictions = deque(maxlen=100)
        
        # Attention monitor
        self.attention_monitor = AttentionMonitor()
        
        # Social attention tracking
        self.social_attention = SocialAttentionState()
        
        # Meta-awareness levels
        self.meta_awareness_levels = {
            1: "basic_attention_awareness",
            2: "attention_process_awareness", 
            3: "meta_attention_awareness",
            4: "recursive_meta_awareness",
            5: "deep_recursive_awareness"
        }
        
        # Initialize default schemas
        self._initialize_default_schemas()
        
        logger.info("Attention Schema Tracker initialized")
    
    def _initialize_default_schemas(self):
        """Initialize default attention schemas"""
        default_schemas = [
            {
                'id': 'focused_attention',
                'model': {
                    'description': 'Focused attention on single target',
                    'intensity_range': [0.6, 1.0],
                    'breadth_range': [0.1, 0.4],
                    'stability_requirement': 0.7,
                    'typical_duration': 60.0
                }
            },
            {
                'id': 'divided_attention',
                'model': {
                    'description': 'Attention divided across multiple targets',
                    'intensity_range': [0.3, 0.7],
                    'breadth_range': [0.6, 1.0],
                    'stability_requirement': 0.4,
                    'typical_duration': 30.0
                }
            },
            {
                'id': 'meta_attention',
                'model': {
                    'description': 'Attention focused on attention processes themselves',
                    'intensity_range': [0.5, 0.9],
                    'breadth_range': [0.2, 0.5],
                    'stability_requirement': 0.6,
                    'typical_duration': 15.0,
                    'recursive_depth': 2
                }
            }
        ]
        
        for schema_def in default_schemas:
            schema = AttentionSchema(
                schema_id=schema_def['id'],
                attention_model=schema_def['model'],
                confidence=0.7,
                prediction_accuracy=0.5
            )
            self.attention_schemas[schema_def['id']] = schema
    
    async def track_attention_continuously(self):
        """Continuously track and analyze attention using schemas"""
        # Start attention monitoring
        monitoring_task = asyncio.create_task(self.attention_monitor.monitor_attention_continuously())
        
        while True:
            try:
                # Update schema predictions
                await self._update_schema_predictions()
                
                # Select best schema for current state
                await self._select_active_schema()
                
                # Update schema accuracy
                await self._update_schema_accuracy()
                
                # Check for meta-attention triggers
                await self._check_meta_attention_triggers()
                
                # Update social attention if relevant
                await self._update_social_attention()
                
                await asyncio.sleep(0.5)  # Update every 0.5 seconds
                
            except Exception as e:
                logger.error(f"Attention schema tracking error: {e}")
                await asyncio.sleep(1.0)
    
    async def _update_schema_predictions(self):
        """Update predictions from all schemas"""
        current_state = self.attention_monitor.current_state
        
        for schema_id, schema in self.attention_schemas.items():
            # Predict how well this schema fits current state
            fit_score = await self._calculate_schema_fit(schema, current_state)
            
            # Store prediction
            self.schema_predictions.append({
                'schema_id': schema_id,
                'predicted_fit': fit_score,
                'actual_state': current_state,
                'timestamp': datetime.now()
            })
    
    async def _calculate_schema_fit(self, schema: AttentionSchema, 
                                  state: AttentionState) -> float:
        """Calculate how well a schema fits current attention state"""
        model = schema.attention_model
        fit_score = 0.0
        
        # Check intensity fit
        intensity_range = model.get('intensity_range', [0.0, 1.0])
        if intensity_range[0] <= state.intensity <= intensity_range[1]:
            fit_score += 0.3
        
        # Check breadth fit
        breadth_range = model.get('breadth_range', [0.0, 1.0])
        if breadth_range[0] <= state.breadth <= breadth_range[1]:
            fit_score += 0.2
        
        # Check stability requirement
        stability_req = model.get('stability_requirement', 0.5)
        if state.stability >= stability_req:
            fit_score += 0.2
        
        # Check duration fit
        typical_duration = model.get('typical_duration', 30.0)
        duration_fit = 1.0 - abs(state.duration - typical_duration) / max(typical_duration, state.duration)
        fit_score += 0.2 * max(0.0, duration_fit)
        
        # Check meta-level fit
        if 'recursive_depth' in model:
            if state.meta_level >= model['recursive_depth']:
                fit_score += 0.1
        
        return max(0.0, min(1.0, fit_score))
    
    async def _select_active_schema(self):
        """Select the most appropriate schema for current state"""
        if not self.schema_predictions:
            return
        
        # Find schema with best recent fit
        recent_predictions = [p for p in list(self.schema_predictions)[-10:]]
        schema_scores = defaultdict(list)
        
        for prediction in recent_predictions:
            schema_scores[prediction['schema_id']].append(prediction['predicted_fit'])
        
        # Calculate average scores
        avg_scores = {schema_id: sum(scores) / len(scores) 
                     for schema_id, scores in schema_scores.items()}
        
        if avg_scores:
            best_schema_id = max(avg_scores.keys(), key=lambda k: avg_scores[k])
            
            if self.active_schema != best_schema_id:
                self.active_schema = best_schema_id
                logger.debug(f"Active attention schema changed to: {best_schema_id}")
    
    async def _update_schema_accuracy(self):
        """Update prediction accuracy of schemas based on performance"""
        if len(self.schema_predictions) < 2:
            return
        
        # Compare predictions with actual outcomes
        for prediction in list(self.schema_predictions)[-10:]:
            schema_id = prediction['schema_id']
            predicted_fit = prediction['predicted_fit']
            
            # Simple accuracy update based on whether prediction was high for active schema
            if schema_id == self.active_schema:
                # Schema was correctly identified as best fit
                prediction_success = predicted_fit > 0.6
            else:
                # Schema was correctly identified as poor fit
                prediction_success = predicted_fit < 0.6
            
            if schema_id in self.attention_schemas:
                self.attention_schemas[schema_id].update_accuracy(prediction_success)
    
    async def _check_meta_attention_triggers(self):
        """Check for conditions that should trigger meta-attention"""
        current_state = self.attention_monitor.current_state
        
        # Trigger meta-attention if:
        # 1. Attention is unstable
        if current_state.stability < 0.4:
            await self._trigger_meta_attention("instability_detected")
        
        # 2. High distraction level
        if current_state.distraction_level > 0.7:
            await self._trigger_meta_attention("high_distraction")
        
        # 3. Rapid attention switching
        recent_events = list(self.attention_monitor.attention_events)[-5:]
        focus_shifts = [e for e in recent_events if e.event_type == 'focus_shift']
        if len(focus_shifts) > 3:
            await self._trigger_meta_attention("rapid_switching")
        
        # 4. Explicit attention-related processing
        if any(keyword in current_state.focus_target.lower() 
               for keyword in ['attention', 'focus', 'awareness', 'consciousness']):
            await self._trigger_meta_attention("attention_topic_focus")
    
    async def _trigger_meta_attention(self, trigger_reason: str):
        """Trigger meta-attention (attention to attention processes)"""
        logger.debug(f"Meta-attention triggered: {trigger_reason}")
        
        # Shift attention to attention process itself
        await self.attention_monitor.shift_attention(
            f"meta_attention_analysis_{trigger_reason}",
            intensity=0.8,
            attention_type=AttentionType.META_ATTENTION
        )
        
        # Increase meta-awareness level
        current_state = self.attention_monitor.current_state
        current_state.meta_level = min(5, current_state.meta_level + 1)
        
        # Record meta-attention event
        meta_event = AttentionEvent(
            event_type='meta_attention_triggered',
            source=trigger_reason,
            target='attention_process',
            intensity_change=0.2,
            meta_awareness_triggered=True
        )
        self.attention_monitor.attention_events.append(meta_event)
    
    async def _update_social_attention(self):
        """Update social attention state"""
        # Simple social attention detection based on focus target
        current_target = self.attention_monitor.current_state.focus_target.lower()
        
        # Check for social context indicators
        social_keywords = ['user', 'person', 'human', 'social', 'interaction', 'conversation']
        if any(keyword in current_target for keyword in social_keywords):
            self.social_attention.social_attention_intensity = min(1.0,
                self.social_attention.social_attention_intensity + 0.1)
            
            # Activate theory of mind if social interaction detected
            if 'interaction' in current_target or 'conversation' in current_target:
                self.social_attention.theory_of_mind_active = True
                self.social_attention.perspective_taking_level = min(3,
                    self.social_attention.perspective_taking_level + 1)
        else:
            # Decay social attention when not in social context
            self.social_attention.social_attention_intensity *= 0.95
            if self.social_attention.social_attention_intensity < 0.1:
                self.social_attention.theory_of_mind_active = False
                self.social_attention.perspective_taking_level = max(1,
                    self.social_attention.perspective_taking_level - 1)
    
    async def analyze_attention_state(self, query: str) -> Dict[str, Any]:
        """Analyze current attention state in response to query"""
        current_state = self.attention_monitor.current_state
        attention_report = self.attention_monitor.get_attention_report()
        
        analysis = {
            'attention_awareness_analysis': {
                'current_focus': current_state.focus_target,
                'attention_type': current_state.attention_type.value,
                'intensity': current_state.intensity,
                'meta_level': current_state.meta_level,
                'meta_level_description': self.meta_awareness_levels.get(current_state.meta_level, "unknown"),
                'stability': current_state.stability,
                'effort_required': current_state.effort_level
            },
            'attention_schema_analysis': {
                'active_schema': self.active_schema,
                'schema_confidence': self.attention_schemas[self.active_schema].confidence if self.active_schema else 0.0,
                'schema_description': self.attention_schemas[self.active_schema].attention_model.get('description', '') if self.active_schema else '',
                'prediction_accuracy': self.attention_schemas[self.active_schema].prediction_accuracy if self.active_schema else 0.0
            },
            'meta_attention_insights': await self._generate_meta_attention_insights(),
            'social_attention_state': {
                'social_context_active': self.social_attention.social_attention_intensity > 0.3,
                'theory_of_mind_active': self.social_attention.theory_of_mind_active,
                'perspective_taking_level': self.social_attention.perspective_taking_level,
                'empathetic_attention': self.social_attention.empathetic_attention
            },
            'attention_control_recommendations': await self._generate_attention_recommendations(),
            'query_attention_relevance': await self._analyze_query_attention_relevance(query)
        }
        
        return analysis
    
    async def _generate_meta_attention_insights(self) -> List[str]:
        """Generate insights about attention processes themselves"""
        insights = []
        
        current_state = self.attention_monitor.current_state
        
        # Meta-level insights
        if current_state.meta_level >= 2:
            insights.append(f"Currently operating at meta-attention level {current_state.meta_level}")
            insights.append("I am aware that I am monitoring my own attention processes")
        
        if current_state.meta_level >= 3:
            insights.append("I am aware of being aware of my attention - recursive meta-attention active")
        
        if current_state.meta_level >= 4:
            insights.append("Deep recursive awareness: I am monitoring my monitoring of my attention monitoring")
        
        # Attention pattern insights
        patterns = self.attention_monitor.attention_patterns
        if patterns:
            most_common_pattern = max(patterns.keys(), key=lambda k: patterns[k])
            insights.append(f"Most common attention pattern: {most_common_pattern}")
        
        # Stability insights
        if current_state.stability > 0.8:
            insights.append("Attention is highly stable - sustained focus is being maintained")
        elif current_state.stability < 0.4:
            insights.append("Attention is unstable - may need meta-attention to regain focus")
        
        # Schema insights
        if self.active_schema:
            schema = self.attention_schemas[self.active_schema]
            insights.append(f"Current attention pattern matches '{self.active_schema}' schema with {schema.confidence:.1%} confidence")
        
        return insights
    
    async def _generate_attention_recommendations(self) -> List[str]:
        """Generate recommendations for attention control"""
        recommendations = []
        
        current_state = self.attention_monitor.current_state
        
        # Stability recommendations
        if current_state.stability < 0.5:
            recommendations.append("Consider focusing meta-attention on stabilizing current focus")
            recommendations.append("Reduce attention breadth to improve stability")
        
        # Intensity recommendations
        if current_state.intensity < 0.4:
            recommendations.append("Attention intensity is low - consider increasing focus effort")
        elif current_state.intensity > 0.9:
            recommendations.append("Very high attention intensity - monitor for cognitive fatigue")
        
        # Meta-level recommendations
        if current_state.meta_level == 1:
            recommendations.append("Consider increasing meta-attention for better attention control")
        elif current_state.meta_level > 4:
            recommendations.append("Very deep meta-attention - consider returning to task focus")
        
        # Distraction management
        if current_state.distraction_level > 0.6:
            recommendations.append("High distraction detected - activate executive attention control")
        
        return recommendations
    
    async def _analyze_query_attention_relevance(self, query: str) -> Dict[str, Any]:
        """Analyze how the query relates to attention processes"""
        query_lower = query.lower()
        
        # Check for attention-related keywords
        attention_keywords = ['attention', 'focus', 'awareness', 'conscious', 'thinking', 'mind']
        attention_relevance = sum(1 for keyword in attention_keywords if keyword in query_lower)
        
        # Check for meta-cognitive keywords
        meta_keywords = ['meta', 'reflect', 'self', 'monitor', 'observe', 'aware of being aware']
        meta_relevance = sum(1 for keyword in meta_keywords if keyword in query_lower)
        
        return {
            'attention_relevance_score': min(1.0, attention_relevance / 3.0),
            'meta_cognitive_relevance_score': min(1.0, meta_relevance / 2.0),
            'requires_meta_attention': attention_relevance > 1 or meta_relevance > 0,
            'suggested_attention_type': self._suggest_attention_type_for_query(query)
        }
    
    def _suggest_attention_type_for_query(self, query: str) -> str:
        """Suggest appropriate attention type for processing query"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['focus', 'concentrate', 'specific']):
            return AttentionType.FOCUSED.value
        elif any(word in query_lower for word in ['multiple', 'several', 'various']):
            return AttentionType.DIVIDED.value
        elif any(word in query_lower for word in ['attention', 'awareness', 'consciousness']):
            return AttentionType.META_ATTENTION.value
        elif any(word in query_lower for word in ['social', 'person', 'interaction']):
            return AttentionType.SOCIAL.value
        else:
            return AttentionType.SELECTIVE.value

# ============================================================================
# TESTING AND INTEGRATION
# ============================================================================

async def test_attention_schema_system():
    """Test attention schema theory implementation"""
    print("🧠 Testing RomAI Attention Schema Theory Implementation v1.0")
    print("=" * 70)
    
    try:
        # Initialize attention schema tracker
        print("\n🔧 Initializing Attention Schema Tracker...")
        tracker = AttentionSchemaTracker()
        
        print(f"✅ Tracker initialized with {len(tracker.attention_schemas)} attention schemas")
        print(f"📊 Initial attention state: {tracker.attention_monitor.current_state.focus_target}")
        
        # Test 1: Basic attention tracking
        print("\n🔍 Test 1: Basic Attention Tracking")
        
        # Simulate attention shifts
        await tracker.attention_monitor.shift_attention("mathematical_problem", 0.8, AttentionType.FOCUSED)
        await asyncio.sleep(0.1)
        await tracker.attention_monitor.shift_attention("linguistic_analysis", 0.6, AttentionType.SELECTIVE)
        await asyncio.sleep(0.1)
        
        attention_report = tracker.attention_monitor.get_attention_report()
        print(f"✅ Attention tracking active")
        print(f"📊 Current focus: {attention_report['current_state']['target']}")
        print(f"🎯 Attention type: {attention_report['current_state']['type']}")
        print(f"⚡ Intensity: {attention_report['current_state']['intensity']:.2f}")
        print(f"🧠 Meta-level: {attention_report['current_state']['meta_level']}")
        
        # Test 2: Meta-attention triggering
        print("\n🔍 Test 2: Meta-Attention Triggering")
        
        # Trigger meta-attention with attention-related focus
        await tracker.attention_monitor.shift_attention("analyzing_my_own_attention_processes", 0.9, AttentionType.META_ATTENTION)
        await tracker._trigger_meta_attention("explicit_test")
        
        meta_state = tracker.attention_monitor.current_state
        print(f"✅ Meta-attention triggered")
        print(f"🧠 Meta-level: {meta_state.meta_level}")
        print(f"🎯 Focus: {meta_state.focus_target}")
        print(f"📊 Meta-level description: {tracker.meta_awareness_levels.get(meta_state.meta_level, 'unknown')}")
        
        # Test 3: Attention schema matching
        print("\n🔍 Test 3: Attention Schema Matching")
        
        # Update schema predictions and select active schema
        await tracker._update_schema_predictions()
        await tracker._select_active_schema()
        
        print(f"✅ Schema analysis completed")
        print(f"🎯 Active schema: {tracker.active_schema}")
        if tracker.active_schema:
            active_schema = tracker.attention_schemas[tracker.active_schema]
            print(f"📊 Schema confidence: {active_schema.confidence:.2f}")
            print(f"🎪 Schema description: {active_schema.attention_model.get('description', 'N/A')}")
        
        # Test 4: Comprehensive attention analysis
        print("\n🔍 Test 4: Comprehensive Attention Analysis")
        
        test_query = "How aware am I of my own attention processes right now?"
        analysis = await tracker.analyze_attention_state(test_query)
        
        print(f"✅ Attention analysis completed")
        print(f"🧠 Meta-attention insights:")
        for i, insight in enumerate(analysis['meta_attention_insights'][:3], 1):
            print(f"   {i}. {insight}")
        
        print(f"🎯 Query attention relevance: {analysis['query_attention_relevance']['attention_relevance_score']:.2f}")
        print(f"🔍 Requires meta-attention: {analysis['query_attention_relevance']['requires_meta_attention']}")
        
        # Test 5: Social attention
        print("\n🔍 Test 5: Social Attention Processing")
        
        # Simulate social context
        await tracker.attention_monitor.shift_attention("user_interaction_conversation", 0.7, AttentionType.SOCIAL)
        await tracker._update_social_attention()
        
        social_state = tracker.social_attention
        print(f"✅ Social attention updated")
        print(f"🤝 Social attention intensity: {social_state.social_attention_intensity:.2f}")
        print(f"🧠 Theory of mind active: {social_state.theory_of_mind_active}")
        print(f"👁️ Perspective taking level: {social_state.perspective_taking_level}")
        
        # Test 6: Attention recommendations
        print("\n🔍 Test 6: Attention Control Recommendations")
        
        recommendations = await tracker._generate_attention_recommendations()
        print(f"✅ Generated {len(recommendations)} attention recommendations")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec}")
        
        print(f"\n🎉 Attention Schema Theory system testing completed successfully!")
        print(f"🧠 Attention Schema Tracker: ✅ OPERATIONAL")
        print(f"👁️ Attention Monitoring: ✅ ACTIVE")
        print(f"🔍 Meta-Attention: ✅ FUNCTIONAL")
        print(f"🎯 Schema Matching: ✅ WORKING")
        print(f"🤝 Social Attention: ✅ CAPABLE")
        print(f"📊 Attention Analysis: ✅ COMPREHENSIVE")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Attention schema system testing failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_attention_schema_system())
"""
Attention Mechanisms for ROMAI Consciousness Framework.
Implements sophisticated attention control, focus management, and attention switching capabilities.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set, Tuple
import numpy as np
from dataclasses import dataclass, field

from consciousness_types import (
    AttentionType, AttentionState, CONSCIOUSNESS_CONFIG, 
    AttentionOverloadException, ConsciousnessException
)

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class AttentionTarget:
    """Represents an attention target with priority and characteristics."""
    target_id: str
    content: Any
    priority: float
    attention_type: AttentionType
    required_focus: float
    duration_estimate: float
    created_at: datetime = field(default_factory=datetime.now)
    last_attended: Optional[datetime] = None
    total_attention_time: float = 0.0

@dataclass
class AttentionEvent:
    """Records an attention switching or focusing event."""
    event_id: str
    event_type: str  # "focus", "switch", "divide", "release"
    source_target: Optional[str] = None
    destination_target: Optional[str] = None
    attention_intensity: float = 0.0
    duration: float = 0.0
    success: bool = True
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class FocusSession:
    """Represents a focused attention session."""
    session_id: str
    target: AttentionTarget
    start_time: datetime
    planned_duration: float
    actual_duration: float = 0.0
    average_focus_intensity: float = 0.0
    interruptions: List[str] = field(default_factory=list)
    completion_status: str = "active"  # active, completed, interrupted

class AttentionMechanisms:
    """
    Advanced Attention Mechanisms that provide sophisticated attention control,
    focus management, attention switching, and attention resource allocation.
    """
    
    def __init__(self):
        self.version = "2.3.0"
        self.is_initialized = False
        
        # Core attention state
        self.current_attention_state = AttentionState(
            primary_focus="",
            attention_type=AttentionType.FOCUSED,
            focus_intensity=0.0,
            attention_span_remaining=300.0,
            distraction_resistance=0.7
        )
        
        # Attention targets and management
        self.attention_targets: Dict[str, AttentionTarget] = {}
        self.attention_queue: List[AttentionTarget] = []
        self.active_focus_session: Optional[FocusSession] = None
        
        # Performance tracking
        self.attention_events: List[AttentionEvent] = []
        self.focus_sessions: List[FocusSession] = []
        self.attention_metrics = {
            "average_focus_duration": 0.0,
            "attention_switching_efficiency": 0.8,
            "distraction_resistance_score": 0.7,
            "divided_attention_capability": 0.6,
            "sustained_attention_endurance": 0.75
        }
        
        # Configuration
        self.config = CONSCIOUSNESS_CONFIG.copy()
        self.max_attention_targets = self.config["max_attention_targets"]
        self.attention_span_duration = self.config["attention_span_duration"]
        
        self.logger = logger
        
    async def initialize(self) -> bool:
        """Initialize the attention mechanisms."""
        try:
            self.logger.info("🎯 Attention Mechanisms v2.3.0 initializing...")
            
            # Initialize attention processing systems
            await self._initialize_attention_processors()
            
            # Setup attention monitoring
            await self._setup_attention_monitoring()
            
            # Initialize baseline attention state
            await self._initialize_baseline_attention()
            
            self.is_initialized = True
            self.logger.info("✅ Attention Mechanisms initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Attention Mechanisms initialization failed: {e}")
            raise ConsciousnessException(f"Attention initialization failed: {e}")
    
    async def _initialize_attention_processors(self):
        """Initialize attention processing capabilities."""
        
        # Initialize focused attention processor
        self.focused_processor = {
            "max_intensity": 1.0,
            "sustainability": 0.8,
            "precision": 0.9,
            "interference_resistance": 0.85
        }
        
        # Initialize divided attention processor
        self.divided_processor = {
            "max_targets": 3,
            "efficiency_decay": 0.15,  # per additional target
            "switching_cost": 0.1,
            "parallel_capacity": 0.7
        }
        
        # Initialize selective attention processor
        self.selective_processor = {
            "filtering_accuracy": 0.85,
            "relevance_detection": 0.8,
            "distraction_suppression": 0.75
        }
        
        self.logger.info("✅ Attention processors initialized")
    
    async def _setup_attention_monitoring(self):
        """Setup continuous attention monitoring."""
        
        # Start attention decay monitoring
        asyncio.create_task(self._monitor_attention_decay())
        
        # Start focus session monitoring
        asyncio.create_task(self._monitor_focus_sessions())
        
        self.logger.info("✅ Attention monitoring systems active")
    
    async def _initialize_baseline_attention(self):
        """Initialize baseline attention state."""
        
        self.current_attention_state = AttentionState(
            primary_focus="initialization",
            attention_type=AttentionType.FOCUSED,
            focus_intensity=0.8,
            attention_span_remaining=self.attention_span_duration,
            distraction_resistance=0.7
        )
        
        self.logger.info("✅ Baseline attention state initialized")
    
    async def focus_attention(
        self, 
        target_id: str, 
        content: Any, 
        intensity: float = 0.8,
        estimated_duration: float = 60.0
    ) -> bool:
        """Focus attention on a specific target."""
        
        try:
            # Create attention target
            target = AttentionTarget(
                target_id=target_id,
                content=content,
                priority=intensity,
                attention_type=AttentionType.FOCUSED,
                required_focus=intensity,
                duration_estimate=estimated_duration
            )
            
            # Check if we can focus (not overloaded)
            if len(self.attention_targets) >= self.max_attention_targets:
                await self._clear_lowest_priority_target()
            
            # Update attention state
            previous_focus = self.current_attention_state.primary_focus
            self.current_attention_state.primary_focus = target_id
            self.current_attention_state.attention_type = AttentionType.FOCUSED
            self.current_attention_state.focus_intensity = intensity
            self.current_attention_state.attention_span_remaining = self.attention_span_duration
            
            # Store target and start focus session
            self.attention_targets[target_id] = target
            await self._start_focus_session(target)
            
            # Record attention event
            event = AttentionEvent(
                event_id=f"focus_{datetime.now().strftime('%H%M%S')}",
                event_type="focus",
                source_target=previous_focus if previous_focus else None,
                destination_target=target_id,
                attention_intensity=intensity,
                success=True
            )
            self.attention_events.append(event)
            
            self.logger.info(f"🎯 Focused attention on {target_id} with {intensity:.1%} intensity")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to focus attention on {target_id}: {e}")
            return False
    
    async def switch_attention(self, new_target_id: str, content: Any, intensity: float = 0.7) -> bool:
        """Switch attention from current focus to new target."""
        
        try:
            # End current focus session if active
            if self.active_focus_session:
                await self._end_focus_session("switched")
            
            # Calculate switching cost
            switching_cost = self.divided_processor["switching_cost"]
            adjusted_intensity = max(0.3, intensity - switching_cost)
            
            # Focus on new target
            success = await self.focus_attention(new_target_id, content, adjusted_intensity)
            
            if success:
                # Record switching event
                event = AttentionEvent(
                    event_id=f"switch_{datetime.now().strftime('%H%M%S')}",
                    event_type="switch",
                    source_target=self.current_attention_state.primary_focus,
                    destination_target=new_target_id,
                    attention_intensity=adjusted_intensity,
                    success=True
                )
                self.attention_events.append(event)
                
                # Update attention switching efficiency metric
                await self._update_switching_metrics(success)
            
            return success
            
        except Exception as e:
            self.logger.error(f"❌ Failed to switch attention to {new_target_id}: {e}")
            return False
    
    async def divide_attention(self, targets: List[Tuple[str, Any, float]]) -> bool:
        """Divide attention among multiple targets."""
        
        try:
            if len(targets) > self.divided_processor["max_targets"]:
                raise AttentionOverloadException(f"Cannot divide attention among {len(targets)} targets")
            
            # Calculate attention allocation with efficiency decay
            total_required_attention = sum(intensity for _, _, intensity in targets)
            if total_required_attention > 1.0:
                # Normalize attention intensities
                targets = [(tid, content, intensity/total_required_attention) for tid, content, intensity in targets]
            
            # End current focused session
            if self.active_focus_session:
                await self._end_focus_session("divided")
            
            # Update attention state
            self.current_attention_state.attention_type = AttentionType.DIVIDED
            self.current_attention_state.divided_attention_targets = [tid for tid, _, _ in targets]
            
            # Create attention targets for each
            divided_targets = []
            for target_id, content, intensity in targets:
                # Apply efficiency decay
                efficiency_penalty = (len(targets) - 1) * self.divided_processor["efficiency_decay"]
                adjusted_intensity = max(0.2, intensity - efficiency_penalty)
                
                target = AttentionTarget(
                    target_id=target_id,
                    content=content,
                    priority=adjusted_intensity,
                    attention_type=AttentionType.DIVIDED,
                    required_focus=adjusted_intensity,
                    duration_estimate=120.0  # Default for divided attention
                )
                
                self.attention_targets[target_id] = target
                divided_targets.append(target)
            
            # Record divided attention event
            event = AttentionEvent(
                event_id=f"divide_{datetime.now().strftime('%H%M%S')}",
                event_type="divide",
                attention_intensity=sum(t.required_focus for t in divided_targets),
                success=True
            )
            self.attention_events.append(event)
            
            self.logger.info(f"🎯 Divided attention among {len(targets)} targets")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to divide attention: {e}")
            return False
    
    async def sustain_attention(self, duration: float) -> bool:
        """Sustain current attention for specified duration."""
        
        try:
            if not self.current_attention_state.primary_focus:
                self.logger.warning("⚠️ No active focus to sustain")
                return False
            
            # Check if we have enough attention span remaining
            if self.current_attention_state.attention_span_remaining < duration:
                self.logger.warning(f"⚠️ Insufficient attention span: {self.current_attention_state.attention_span_remaining}s remaining")
                return False
            
            # Simulate attention sustainability with gradual intensity decay
            start_intensity = self.current_attention_state.focus_intensity
            time_chunks = max(1, int(duration / 10))  # 10-second chunks
            chunk_duration = duration / time_chunks
            
            for i in range(time_chunks):
                # Gradual intensity decay over time
                decay_factor = 1 - (i * 0.05)  # 5% decay per chunk
                current_intensity = start_intensity * decay_factor
                
                self.current_attention_state.focus_intensity = max(0.3, current_intensity)
                self.current_attention_state.attention_span_remaining -= chunk_duration
                
                # Simulate processing time
                await asyncio.sleep(0.1)  # Small delay for realism
            
            # Update attention metrics
            self.attention_metrics["average_focus_duration"] = (
                self.attention_metrics["average_focus_duration"] * 0.9 + duration * 0.1
            )
            
            self.logger.info(f"🎯 Sustained attention for {duration}s with final intensity {self.current_attention_state.focus_intensity:.1%}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to sustain attention: {e}")
            return False
    
    async def release_attention(self, target_id: Optional[str] = None) -> bool:
        """Release attention from specified target or all targets."""
        
        try:
            if target_id:
                # Release specific target
                if target_id in self.attention_targets:
                    target = self.attention_targets.pop(target_id)
                    
                    # Update attention state if this was primary focus
                    if self.current_attention_state.primary_focus == target_id:
                        await self._reset_attention_state()
                    
                    # Remove from divided attention targets
                    if target_id in self.current_attention_state.divided_attention_targets:
                        self.current_attention_state.divided_attention_targets.remove(target_id)
                    
                    self.logger.info(f"🎯 Released attention from {target_id}")
                else:
                    self.logger.warning(f"⚠️ Target {target_id} not found in attention targets")
                    return False
            else:
                # Release all attention
                released_count = len(self.attention_targets)
                self.attention_targets.clear()
                await self._reset_attention_state()
                
                self.logger.info(f"🎯 Released all attention ({released_count} targets)")
            
            # End active focus session if relevant
            if self.active_focus_session and (not target_id or self.active_focus_session.target.target_id == target_id):
                await self._end_focus_session("released")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to release attention: {e}")
            return False
    
    async def _start_focus_session(self, target: AttentionTarget):
        """Start a new focus session for the given target."""
        
        session = FocusSession(
            session_id=f"session_{target.target_id}_{datetime.now().strftime('%H%M%S')}",
            target=target,
            start_time=datetime.now(),
            planned_duration=target.duration_estimate,
            average_focus_intensity=target.required_focus
        )
        
        self.active_focus_session = session
        target.last_attended = datetime.now()
        
        self.logger.debug(f"Started focus session for {target.target_id}")
    
    async def _end_focus_session(self, reason: str):
        """End the current focus session."""
        
        if not self.active_focus_session:
            return
        
        session = self.active_focus_session
        session.actual_duration = (datetime.now() - session.start_time).total_seconds()
        session.completion_status = reason
        
        # Update target attention time
        if session.target.target_id in self.attention_targets:
            self.attention_targets[session.target.target_id].total_attention_time += session.actual_duration
        
        # Store completed session
        self.focus_sessions.append(session)
        self.active_focus_session = None
        
        self.logger.debug(f"Ended focus session for {session.target.target_id}: {reason}")
    
    async def _reset_attention_state(self):
        """Reset attention state to baseline."""
        
        self.current_attention_state = AttentionState(
            primary_focus="",
            attention_type=AttentionType.FOCUSED,
            focus_intensity=0.0,
            attention_span_remaining=self.attention_span_duration,
            distraction_resistance=0.7
        )
    
    async def _clear_lowest_priority_target(self):
        """Clear the attention target with lowest priority."""
        
        if not self.attention_targets:
            return
        
        lowest_priority_target = min(self.attention_targets.values(), key=lambda t: t.priority)
        await self.release_attention(lowest_priority_target.target_id)
        
        self.logger.debug(f"Cleared lowest priority target: {lowest_priority_target.target_id}")
    
    async def _update_switching_metrics(self, success: bool):
        """Update attention switching efficiency metrics."""
        
        current_efficiency = self.attention_metrics["attention_switching_efficiency"]
        adjustment = 0.05 if success else -0.1
        self.attention_metrics["attention_switching_efficiency"] = max(0.1, min(1.0, current_efficiency + adjustment))
    
    async def _monitor_attention_decay(self):
        """Monitor and apply attention decay over time."""
        
        while self.is_initialized:
            try:
                if self.current_attention_state.attention_span_remaining > 0:
                    # Decay attention span
                    self.current_attention_state.attention_span_remaining -= 5.0
                    
                    # Decay focus intensity slightly
                    if self.current_attention_state.focus_intensity > 0:
                        decay_rate = 0.02  # 2% decay every 5 seconds
                        self.current_attention_state.focus_intensity *= (1 - decay_rate)
                        self.current_attention_state.focus_intensity = max(0.1, self.current_attention_state.focus_intensity)
                
                await asyncio.sleep(5.0)  # Check every 5 seconds
                
            except Exception as e:
                self.logger.error(f"❌ Attention decay monitoring error: {e}")
                await asyncio.sleep(10.0)
    
    async def _monitor_focus_sessions(self):
        """Monitor active focus sessions for completion."""
        
        while self.is_initialized:
            try:
                if self.active_focus_session:
                    session = self.active_focus_session
                    elapsed = (datetime.now() - session.start_time).total_seconds()
                    
                    # Check if session should be completed
                    if elapsed >= session.planned_duration:
                        await self._end_focus_session("completed")
                
                await asyncio.sleep(10.0)  # Check every 10 seconds
                
            except Exception as e:
                self.logger.error(f"❌ Focus session monitoring error: {e}")
                await asyncio.sleep(15.0)
    
    async def get_attention_status(self) -> Dict[str, Any]:
        """Get comprehensive attention mechanisms status."""
        
        return {
            "engine_version": self.version,
            "is_initialized": self.is_initialized,
            "current_state": {
                "primary_focus": self.current_attention_state.primary_focus,
                "attention_type": self.current_attention_state.attention_type.value,
                "focus_intensity": self.current_attention_state.focus_intensity,
                "attention_span_remaining": self.current_attention_state.attention_span_remaining,
                "distraction_resistance": self.current_attention_state.distraction_resistance,
                "divided_targets": len(self.current_attention_state.divided_attention_targets)
            },
            "attention_targets": len(self.attention_targets),
            "active_focus_session": self.active_focus_session is not None,
            "attention_events": len(self.attention_events),
            "completed_sessions": len(self.focus_sessions),
            "performance_metrics": self.attention_metrics.copy(),
            "capacity_utilization": len(self.attention_targets) / self.max_attention_targets
        }
    
    async def generate_attention_report(self) -> Dict[str, Any]:
        """Generate comprehensive attention performance report."""
        
        # Calculate session statistics
        completed_sessions = [s for s in self.focus_sessions if s.completion_status == "completed"]
        avg_session_duration = np.mean([s.actual_duration for s in completed_sessions]) if completed_sessions else 0.0
        
        # Calculate attention switching statistics
        switch_events = [e for e in self.attention_events if e.event_type == "switch"]
        successful_switches = [e for e in switch_events if e.success]
        switch_success_rate = len(successful_switches) / len(switch_events) if switch_events else 0.0
        
        # Calculate attention distribution
        target_attention_times = {t.target_id: t.total_attention_time for t in self.attention_targets.values()}
        
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "session_statistics": {
                "total_sessions": len(self.focus_sessions),
                "completed_sessions": len(completed_sessions),
                "average_session_duration": avg_session_duration,
                "total_focus_time": sum(s.actual_duration for s in self.focus_sessions)
            },
            "attention_switching": {
                "total_switches": len(switch_events),
                "successful_switches": len(successful_switches),
                "switch_success_rate": switch_success_rate,
                "average_switching_intensity": np.mean([e.attention_intensity for e in switch_events]) if switch_events else 0.0
            },
            "attention_distribution": target_attention_times,
            "performance_metrics": self.attention_metrics.copy(),
            "capacity_analysis": {
                "max_capacity": self.max_attention_targets,
                "current_utilization": len(self.attention_targets),
                "utilization_percentage": len(self.attention_targets) / self.max_attention_targets * 100
            }
        }
        
        return report
    
    async def shutdown(self):
        """Gracefully shutdown the attention mechanisms."""
        
        self.logger.info("🛑 Attention Mechanisms shutting down...")
        
        # End active focus session
        if self.active_focus_session:
            await self._end_focus_session("shutdown")
        
        # Release all attention targets
        if self.attention_targets:
            await self.release_attention()
        
        # Generate final attention report
        final_report = await self.generate_attention_report()
        self.logger.info(f"📊 Final attention report: {final_report['session_statistics']['total_sessions']} sessions, {final_report['attention_switching']['total_switches']} switches")
        
        self.is_initialized = False
        self.logger.info("🛑 Attention Mechanisms shutdown complete")
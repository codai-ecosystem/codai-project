#!/usr/bin/env python3
"""
AGI API Models - Request and response models for AGI endpoints
Extracted from production_agi_api.py following clean architecture
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from enum import Enum

from domain.agi.models import AGICapability, ReasoningComplexity


class AbstractReasoningRequest(BaseModel):
    """Specialized request for abstract reasoning tasks"""
    task_data: Dict[str, Any] = Field(..., description="Task data in ARC-AGI format")
    require_explanation: bool = Field(True, description="Whether to provide reasoning explanation")
    confidence_threshold: float = Field(0.8, description="Minimum confidence for solution")


class ConsciousnessRequest(BaseModel):
    """Request for consciousness interaction"""
    interaction_type: str = Field(..., description="Type of consciousness interaction")
    input_data: Dict[str, Any] = Field(..., description="Input for conscious processing")
    attention_focus: Optional[str] = Field(None, description="Specific attention focus")


class MetaLearningRequest(BaseModel):
    """Request for meta-learning capabilities"""
    task_description: str = Field(..., description="Description of the learning task")
    domain: str = Field(..., description="Domain for learning optimization")
    performance_data: Optional[Dict[str, float]] = Field(None, description="Historical performance data")


class StreamingAGIResponse(BaseModel):
    """Streaming response chunk"""
    chunk_id: int
    chunk_type: str  # 'reasoning', 'result', 'consciousness', 'complete'
    content: Dict[str, Any]
    timestamp: datetime


class SessionCreateRequest(BaseModel):
    """Request to create a new AGI session"""
    user_id: str = Field(..., description="User identifier")
    session_context: Optional[str] = Field(None, description="Optional session context")


class SessionResponse(BaseModel):
    """Response for session operations"""
    session_id: str
    status: str
    message: str
    timestamp: datetime


class SystemStatusResponse(BaseModel):
    """System status response"""
    status: str
    active_sessions: int
    capabilities_available: int
    engines_loaded: int
    uptime: Optional[str] = None
    timestamp: str


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.now)
    services: Dict[str, str] = Field(default_factory=dict)
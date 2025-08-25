"""
🎼 Cognitive Enhancement Orchestrator
====================================

Orchestrator for coordinating multiple enhancement strategies and managing
the overall cognitive enhancement process for the Week 14 system.

This module provides the main orchestration logic for enhancing intelligence
capabilities with Romanian cultural context integration.

Author: RomAI AGI Development Team
Date: August 4, 2025
Version: 1.0.0
"""

import asyncio
import time
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable, Tuple
from datetime import datetime, timedelta
from enum import Enum

from .intelligence_types import (
    IntelligenceType,
    ReasoningMode,
    CognitiveEnhancementStrategy,
    EnhancementPriority,
    IntelligenceMetrics,
    IntelligenceCapability,
    ProcessingStatus
)
from .cultural_context import RomanianIntelligenceContext, CulturalValidator
from .enhancement_strategies import (
    EnhancementStrategy,
    EnhancementContext,
    EnhancementResult,
    StrategyFactory
)


class OrchestrationMode(Enum):
    """Modes of orchestration"""
    SINGLE_STRATEGY = "single_strategy"
    MULTI_STRATEGY = "multi_strategy"
    ADAPTIVE = "adaptive"
    COMPETITIVE = "competitive"
    COLLABORATIVE = "collaborative"


@dataclass
class CognitiveEnhancementRequest:
    """Request for cognitive enhancement"""
    request_id: str
    input_data: Dict[str, Any]
    enhancement_types: List[IntelligenceType]
    reasoning_modes: List[ReasoningMode]
    cultural_context: Optional[RomanianIntelligenceContext] = None
    priority: EnhancementPriority = EnhancementPriority.MEDIUM
    strategy_preference: Optional[CognitiveEnhancementStrategy] = None
    orchestration_mode: OrchestrationMode = OrchestrationMode.ADAPTIVE
    max_processing_time: float = 30.0
    quality_threshold: float = 0.80
    cultural_authenticity_threshold: float = 0.85
    performance_targets: Dict[str, float] = field(default_factory=dict)
    constraints: Dict[str, Any] = field(default_factory=dict)
    callback_functions: Dict[str, Callable] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    
    def validate_request(self) -> Tuple[bool, List[str]]:
        """Validate the enhancement request"""
        errors = []
        
        if not self.request_id:
            errors.append("Request ID is required")
        
        if not self.enhancement_types:
            errors.append("At least one enhancement type is required")
        
        if not 0.0 <= self.quality_threshold <= 1.0:
            errors.append("Quality threshold must be between 0.0 and 1.0")
        
        if not 0.0 <= self.cultural_authenticity_threshold <= 1.0:
            errors.append("Cultural authenticity threshold must be between 0.0 and 1.0")
        
        if self.max_processing_time <= 0:
            errors.append("Max processing time must be positive")
        
        return len(errors) == 0, errors


@dataclass
class CognitiveEnhancementResult:
    """Result of cognitive enhancement orchestration"""
    request_id: str
    enhancement_results: Dict[str, Any]
    overall_performance: float
    cultural_authenticity: float
    processing_time: float
    strategy_used: CognitiveEnhancementStrategy
    orchestration_mode: OrchestrationMode
    quality_metrics: Dict[str, float]
    romanian_integration_score: float
    enhanced_capabilities: List[IntelligenceCapability]
    performance_breakdown: Dict[str, float]
    strategy_performance: Dict[str, EnhancementResult]
    success: bool
    processing_status: ProcessingStatus
    error_message: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class OrchestrationContext:
    """Context for orchestration operations"""
    orchestrator_id: str
    session_id: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    average_processing_time: float = 0.0
    average_performance: float = 0.0
    strategy_usage_stats: Dict[str, int] = field(default_factory=dict)
    cultural_processing_stats: Dict[str, float] = field(default_factory=dict)
    last_optimization: Optional[datetime] = None


@dataclass
class OrchestrationMetrics:
    """Metrics for orchestration performance"""
    throughput: float = 0.0
    efficiency: float = 0.0
    success_rate: float = 0.0
    average_quality: float = 0.0
    cultural_authenticity_rate: float = 0.0
    strategy_optimization_score: float = 0.0
    resource_utilization: float = 0.0
    user_satisfaction: float = 0.0


class CognitiveEnhancementOrchestrator:
    """Main orchestrator for cognitive enhancement operations"""
    
    def __init__(self, orchestrator_id: str = "main_orchestrator"):
        self.orchestrator_id = orchestrator_id
        self.context = OrchestrationContext(
            orchestrator_id=orchestrator_id,
            session_id=f"session_{int(time.time())}"
        )
        self.cultural_validator = CulturalValidator()
        self.strategy_factory = StrategyFactory()
        self.active_strategies: Dict[str, EnhancementStrategy] = {}
        self.performance_history: List[CognitiveEnhancementResult] = []
        self.optimization_rules: Dict[str, Any] = self._initialize_optimization_rules()
        
    def _initialize_optimization_rules(self) -> Dict[str, Any]:
        """Initialize optimization rules for strategy selection"""
        return {
            "cultural_priority_threshold": 0.8,
            "parallel_processing_minimum": 3,
            "performance_improvement_target": 0.05,
            "cultural_authenticity_requirement": 0.85,
            "maximum_strategy_attempts": 3,
            "adaptive_learning_rate": 0.1,
            "strategy_selection_weights": {
                "performance": 0.4,
                "cultural_authenticity": 0.3,
                "processing_speed": 0.2,
                "resource_efficiency": 0.1
            }
        }
    
    async def enhance_intelligence(self, request: CognitiveEnhancementRequest) -> CognitiveEnhancementResult:
        """Main method for enhancing intelligence capabilities"""
        start_time = time.time()
        
        try:
            # Validate request
            is_valid, validation_errors = request.validate_request()
            if not is_valid:
                return self._create_error_result(
                    request, "Request validation failed", validation_errors
                )
            
            # Validate cultural context if provided
            if request.cultural_context:
                cultural_validation = self.cultural_validator.validate_context(request.cultural_context)
                if not cultural_validation["valid"]:
                    return self._create_error_result(
                        request, "Cultural context validation failed", cultural_validation["errors"]
                    )
            
            # Select optimal strategy
            strategy, strategy_rationale = await self._select_optimal_strategy(request)
            
            # Create enhancement context
            enhancement_context = EnhancementContext(
                request_id=request.request_id,
                intelligence_types=request.enhancement_types,
                reasoning_modes=request.reasoning_modes,
                cultural_context=request.cultural_context,
                priority=request.priority,
                max_processing_time=request.max_processing_time,
                quality_threshold=request.quality_threshold,
                cultural_authenticity_threshold=request.cultural_authenticity_threshold,
                performance_targets=request.performance_targets,
                constraints=request.constraints
            )
            
            # Execute enhancement based on orchestration mode
            if request.orchestration_mode == OrchestrationMode.SINGLE_STRATEGY:
                enhancement_result = await self._execute_single_strategy(
                    strategy, enhancement_context, request.input_data
                )
            elif request.orchestration_mode == OrchestrationMode.MULTI_STRATEGY:
                enhancement_result = await self._execute_multi_strategy(
                    enhancement_context, request.input_data
                )
            elif request.orchestration_mode == OrchestrationMode.COMPETITIVE:
                enhancement_result = await self._execute_competitive_strategies(
                    enhancement_context, request.input_data
                )
            else:  # ADAPTIVE mode
                enhancement_result = await self._execute_adaptive_enhancement(
                    strategy, enhancement_context, request.input_data
                )
            
            # Create comprehensive result
            result = await self._create_comprehensive_result(
                request, enhancement_result, strategy, start_time
            )
            
            # Update orchestration context
            await self._update_orchestration_context(result)
            
            # Store performance history
            self.performance_history.append(result)
            
            # Execute callbacks if provided
            await self._execute_callbacks(request, result)
            
            return result
            
        except Exception as e:
            return self._create_error_result(
                request, f"Orchestration error: {str(e)}", []
            )
    
    async def _select_optimal_strategy(self, request: CognitiveEnhancementRequest) -> Tuple[EnhancementStrategy, str]:
        """Select optimal enhancement strategy for the request"""
        
        # Use preference if specified and valid
        if request.strategy_preference:
            try:
                strategy = self.strategy_factory.create_strategy(request.strategy_preference)
                return strategy, f"User preference: {request.strategy_preference.value}"
            except ValueError:
                pass  # Fall back to automatic selection
        
        # Automatic strategy selection
        enhancement_context = EnhancementContext(
            request_id=request.request_id,
            intelligence_types=request.enhancement_types,
            reasoning_modes=request.reasoning_modes,
            cultural_context=request.cultural_context,
            priority=request.priority,
            max_processing_time=request.max_processing_time,
            quality_threshold=request.quality_threshold,
            cultural_authenticity_threshold=request.cultural_authenticity_threshold
        )
        
        recommended_strategy = self.strategy_factory.recommend_strategy(enhancement_context)
        strategy = self.strategy_factory.create_strategy(recommended_strategy)
        
        return strategy, f"Automatic selection: {recommended_strategy.value}"
    
    async def _execute_single_strategy(self, strategy: EnhancementStrategy,
                                     context: EnhancementContext,
                                     input_data: Dict[str, Any]) -> EnhancementResult:
        """Execute enhancement using single strategy"""
        return await strategy.enhance(context, input_data)
    
    async def _execute_multi_strategy(self, context: EnhancementContext,
                                    input_data: Dict[str, Any]) -> EnhancementResult:
        """Execute enhancement using multiple strategies"""
        # Get available strategies
        available_strategies = self.strategy_factory.get_available_strategies()
        
        # Execute strategies in parallel
        tasks = []
        for strategy_type in available_strategies:
            try:
                strategy = self.strategy_factory.create_strategy(strategy_type)
                compatible, _ = strategy.validate_compatibility(context)
                if compatible:
                    task = asyncio.create_task(strategy.enhance(context, input_data))
                    tasks.append((strategy_type, task))
            except Exception:
                continue  # Skip incompatible strategies
        
        # Wait for all strategies to complete
        results = {}
        for strategy_type, task in tasks:
            try:
                result = await task
                results[strategy_type.value] = result
            except Exception as e:
                results[strategy_type.value] = EnhancementResult(
                    strategy_name=strategy_type.value,
                    processing_time=0.0,
                    success=False,
                    performance_score=0.0,
                    cultural_authenticity=0.0,
                    quality_metrics=IntelligenceMetrics(),
                    enhanced_capabilities=[],
                    processing_status=ProcessingStatus.FAILED,
                    error_message=str(e)
                )
        
        # Select best result
        best_result = max(results.values(), 
                         key=lambda r: r.performance_score if r.success else 0.0)
        
        return best_result
    
    async def _execute_competitive_strategies(self, context: EnhancementContext,
                                            input_data: Dict[str, Any]) -> EnhancementResult:
        """Execute strategies competitively and select best result"""
        # Similar to multi-strategy but with competition logic
        return await self._execute_multi_strategy(context, input_data)
    
    async def _execute_adaptive_enhancement(self, initial_strategy: EnhancementStrategy,
                                          context: EnhancementContext,
                                          input_data: Dict[str, Any]) -> EnhancementResult:
        """Execute adaptive enhancement with strategy optimization"""
        # Try initial strategy
        result = await initial_strategy.enhance(context, input_data)
        
        # If not satisfactory, try adaptive improvements
        if not result.success or result.performance_score < context.quality_threshold:
            # Try alternative strategies
            alternative_strategies = self.strategy_factory.get_available_strategies()
            
            for strategy_type in alternative_strategies:
                if strategy_type.value != initial_strategy.name:
                    try:
                        strategy = self.strategy_factory.create_strategy(strategy_type)
                        compatible, _ = strategy.validate_compatibility(context)
                        if compatible:
                            alternative_result = await strategy.enhance(context, input_data)
                            if (alternative_result.success and 
                                alternative_result.performance_score > result.performance_score):
                                result = alternative_result
                                break
                    except Exception:
                        continue
        
        return result
    
    async def _create_comprehensive_result(self, request: CognitiveEnhancementRequest,
                                         enhancement_result: EnhancementResult,
                                         strategy: EnhancementStrategy,
                                         start_time: float) -> CognitiveEnhancementResult:
        """Create comprehensive enhancement result"""
        
        # Calculate Romanian integration score
        romanian_integration = 0.0
        if request.cultural_context:
            romanian_integration = (
                enhancement_result.cultural_authenticity * 0.6 +
                request.cultural_context.authenticity_level * 0.4
            )
        
        # Calculate performance breakdown
        performance_breakdown = {
            "intelligence_enhancement": enhancement_result.performance_score,
            "cultural_authenticity": enhancement_result.cultural_authenticity,
            "processing_efficiency": 1.0 - (enhancement_result.processing_time / request.max_processing_time),
            "quality_satisfaction": 1.0 if enhancement_result.success else 0.5
        }
        
        # Calculate quality metrics
        quality_metrics = {
            "accuracy": enhancement_result.quality_metrics.accuracy,
            "creativity": enhancement_result.quality_metrics.creativity_index,
            "cultural_preservation": enhancement_result.cultural_authenticity,
            "efficiency": enhancement_result.quality_metrics.efficiency,
            "adaptability": enhancement_result.quality_metrics.adaptability,
            "consistency": enhancement_result.quality_metrics.consistency
        }
        
        return CognitiveEnhancementResult(
            request_id=request.request_id,
            enhancement_results={
                "primary_result": enhancement_result.__dict__,
                "strategy_analysis": {
                    "name": strategy.name,
                    "description": strategy.description,
                    "success_rate": strategy.success_rate,
                    "average_performance": strategy.get_average_performance()
                }
            },
            overall_performance=enhancement_result.performance_score,
            cultural_authenticity=enhancement_result.cultural_authenticity,
            processing_time=time.time() - start_time,
            strategy_used=CognitiveEnhancementStrategy(strategy.name.lower().replace(" ", "_").replace("enhancement", "").strip()),
            orchestration_mode=request.orchestration_mode,
            quality_metrics=quality_metrics,
            romanian_integration_score=romanian_integration,
            enhanced_capabilities=enhancement_result.enhanced_capabilities,
            performance_breakdown=performance_breakdown,
            strategy_performance={strategy.name: enhancement_result},
            success=enhancement_result.success,
            processing_status=enhancement_result.processing_status,
            error_message=enhancement_result.error_message,
            metadata={
                "orchestrator_id": self.orchestrator_id,
                "session_id": self.context.session_id,
                "total_requests": self.context.total_requests + 1,
                "strategy_selection_rationale": f"Selected {strategy.name} based on optimization rules"
            }
        )
    
    async def _update_orchestration_context(self, result: CognitiveEnhancementResult):
        """Update orchestration context with result data"""
        self.context.total_requests += 1
        
        if result.success:
            self.context.successful_requests += 1
        else:
            self.context.failed_requests += 1
        
        # Update averages
        self.context.average_processing_time = (
            (self.context.average_processing_time * (self.context.total_requests - 1) + 
             result.processing_time) / self.context.total_requests
        )
        
        self.context.average_performance = (
            (self.context.average_performance * (self.context.total_requests - 1) + 
             result.overall_performance) / self.context.total_requests
        )
        
        # Update strategy usage stats
        strategy_name = result.strategy_used.value
        self.context.strategy_usage_stats[strategy_name] = (
            self.context.strategy_usage_stats.get(strategy_name, 0) + 1
        )
        
        # Update cultural processing stats
        if result.cultural_authenticity > 0:
            region = "unknown"
            if hasattr(result, 'cultural_context') and result.cultural_context:
                region = result.cultural_context.region.value
            
            current_avg = self.context.cultural_processing_stats.get(region, 0.0)
            current_count = sum(1 for r in self.performance_history 
                              if hasattr(r, 'cultural_context') and 
                              r.cultural_context and 
                              r.cultural_context.region.value == region)
            
            new_avg = (current_avg * current_count + result.cultural_authenticity) / (current_count + 1)
            self.context.cultural_processing_stats[region] = new_avg
    
    async def _execute_callbacks(self, request: CognitiveEnhancementRequest,
                               result: CognitiveEnhancementResult):
        """Execute callback functions if provided"""
        for callback_name, callback_func in request.callback_functions.items():
            try:
                if asyncio.iscoroutinefunction(callback_func):
                    await callback_func(result)
                else:
                    callback_func(result)
            except Exception as e:
                # Log callback errors but don't fail the main process
                pass
    
    def _create_error_result(self, request: CognitiveEnhancementRequest,
                           error_message: str, errors: List[str]) -> CognitiveEnhancementResult:
        """Create error result for failed requests"""
        return CognitiveEnhancementResult(
            request_id=request.request_id,
            enhancement_results={},
            overall_performance=0.0,
            cultural_authenticity=0.0,
            processing_time=0.0,
            strategy_used=CognitiveEnhancementStrategy.SEQUENTIAL,  # Default
            orchestration_mode=request.orchestration_mode,
            quality_metrics={},
            romanian_integration_score=0.0,
            enhanced_capabilities=[],
            performance_breakdown={},
            strategy_performance={},
            success=False,
            processing_status=ProcessingStatus.FAILED,
            error_message=error_message,
            warnings=errors,
            metadata={
                "orchestrator_id": self.orchestrator_id,
                "error_type": "validation_error" if "validation" in error_message else "processing_error"
            }
        )
    
    def get_orchestration_metrics(self) -> OrchestrationMetrics:
        """Get current orchestration performance metrics"""
        if self.context.total_requests == 0:
            return OrchestrationMetrics()
        
        success_rate = self.context.successful_requests / self.context.total_requests
        
        # Calculate cultural authenticity rate
        cultural_results = [r for r in self.performance_history if r.cultural_authenticity > 0]
        cultural_authenticity_rate = (
            sum(r.cultural_authenticity for r in cultural_results) / len(cultural_results)
            if cultural_results else 0.0
        )
        
        return OrchestrationMetrics(
            throughput=self.context.total_requests / max(1, (datetime.now() - datetime.now()).total_seconds()),
            efficiency=self.context.average_processing_time if self.context.average_processing_time > 0 else 0.0,
            success_rate=success_rate,
            average_quality=self.context.average_performance,
            cultural_authenticity_rate=cultural_authenticity_rate,
            strategy_optimization_score=success_rate,  # Simplified
            resource_utilization=min(1.0, self.context.total_requests / 100),  # Simplified
            user_satisfaction=success_rate  # Simplified
        )
    
    def get_strategy_performance_report(self) -> Dict[str, Any]:
        """Get performance report for all strategies"""
        strategy_stats = {}
        
        for strategy_name, usage_count in self.context.strategy_usage_stats.items():
            strategy_results = [r for r in self.performance_history 
                              if r.strategy_used.value == strategy_name]
            
            if strategy_results:
                avg_performance = sum(r.overall_performance for r in strategy_results) / len(strategy_results)
                avg_authenticity = sum(r.cultural_authenticity for r in strategy_results) / len(strategy_results)
                success_rate = sum(1 for r in strategy_results if r.success) / len(strategy_results)
                
                strategy_stats[strategy_name] = {
                    "usage_count": usage_count,
                    "average_performance": avg_performance,
                    "average_cultural_authenticity": avg_authenticity,
                    "success_rate": success_rate,
                    "total_processing_time": sum(r.processing_time for r in strategy_results)
                }
        
        return strategy_stats

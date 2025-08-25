#!/usr/bin/env python3
"""
RomAI LLM Intelligent Router System
Advanced routing and load balancing for LLM providers

This module provides:
- Intelligent provider selection based on request characteristics
- Load balancing and performance optimization
- Romanian cultural context-aware routing
- Automatic failover and health monitoring
- Cost optimization and budget management
"""

import logging
import asyncio
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import statistics
import json
import sqlite3
from collections import defaultdict, deque
import uuid

# Import from our modules
from .llm_config import LLMConfigurationManager, ProviderConfiguration, ModelConfiguration
from .llm_integration import LLMRequest, LLMResponse, LLMProvider, LLMOrchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RoutingStrategy(Enum):
    """Available routing strategies"""
    ROUND_ROBIN = "round_robin"
    PERFORMANCE_BASED = "performance_based"
    COST_OPTIMIZED = "cost_optimized"
    CULTURAL_OPTIMIZED = "cultural_optimized"
    LOAD_BALANCED = "load_balanced"
    INTELLIGENT_ADAPTIVE = "intelligent_adaptive"

class RequestType(Enum):
    """Types of requests for routing optimization"""
    CREATIVE_WRITING = "creative_writing"
    CULTURAL_ANALYSIS = "cultural_analysis"
    TECHNICAL_EXPLANATION = "technical_explanation"
    PHILOSOPHICAL_DISCUSSION = "philosophical_discussion"
    GENERAL_CONVERSATION = "general_conversation"
    CODE_GENERATION = "code_generation"
    TRANSLATION = "translation"
    SUMMARIZATION = "summarization"

@dataclass
class ProviderPerformanceMetrics:
    """Performance metrics for a provider"""
    provider_name: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    average_response_time: float = 0.0
    average_cultural_score: float = 0.0
    average_confidence: float = 0.0
    total_tokens_used: int = 0
    total_cost: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)
    response_times: deque = field(default_factory=lambda: deque(maxlen=100))
    cultural_scores: deque = field(default_factory=lambda: deque(maxlen=100))
    current_load: int = 0
    health_score: float = 1.0

@dataclass
class RoutingDecision:
    """Decision made by the router"""
    selected_provider: str
    selected_model: str
    routing_strategy: RoutingStrategy
    decision_factors: Dict[str, float]
    confidence: float
    expected_performance: Dict[str, float]
    fallback_providers: List[str]
    decision_time: datetime = field(default_factory=datetime.now)

@dataclass
class RoutingRequest:
    """Extended request with routing information"""
    base_request: LLMRequest
    request_type: RequestType
    priority: int = 1  # 1-5, 5 being highest
    max_cost: Optional[float] = None
    preferred_providers: List[str] = field(default_factory=list)
    excluded_providers: List[str] = field(default_factory=list)
    cultural_requirements: Dict[str, float] = field(default_factory=dict)
    performance_requirements: Dict[str, float] = field(default_factory=dict)
    routing_metadata: Dict[str, Any] = field(default_factory=dict)

class RequestClassifier:
    """Classify requests to determine optimal routing"""
    
    def __init__(self):
        self.classification_keywords = {
            RequestType.CREATIVE_WRITING: [
                "scrie", "poveste", "poezie", "creează", "imaginează", "compune",
                "write", "story", "poem", "create", "imagine", "compose"
            ],
            RequestType.CULTURAL_ANALYSIS: [
                "cultură", "tradiție", "românesc", "istorie", "folclor", "obicei",
                "culture", "tradition", "romanian", "history", "folklore", "custom"
            ],
            RequestType.TECHNICAL_EXPLANATION: [
                "explică", "cum funcționează", "tehnologie", "algoritm", "programare",
                "explain", "how does", "technology", "algorithm", "programming"
            ],
            RequestType.PHILOSOPHICAL_DISCUSSION: [
                "filozofie", "sens", "adevăr", "existență", "înțelepciune", "gândire",
                "philosophy", "meaning", "truth", "existence", "wisdom", "thinking"
            ],
            RequestType.CODE_GENERATION: [
                "cod", "program", "funcție", "algoritm", "python", "javascript",
                "code", "program", "function", "algorithm"
            ],
            RequestType.TRANSLATION: [
                "traduce", "traducere", "limba", "language", "translate", "translation"
            ],
            RequestType.SUMMARIZATION: [
                "rezumă", "sumarizează", "pe scurt", "summarize", "summary", "brief"
            ]
        }
        
        self.romanian_cultural_indicators = [
            "dor", "drag", "jale", "bătrân", "familie", "tradiție", "românie",
            "carpați", "dunăre", "eminescu", "miorița", "colinde"
        ]
        
        logger.info("✅ Request classifier initialized")
    
    def classify_request(self, request: LLMRequest) -> Tuple[RequestType, Dict[str, float]]:
        """Classify request and return confidence scores"""
        text_content = ""
        if request.prompt:
            text_content += request.prompt.lower()
        if request.messages:
            text_content += " ".join([msg.get("content", "").lower() for msg in request.messages])
        
        classification_scores = {}
        
        # Calculate scores for each request type
        for req_type, keywords in self.classification_keywords.items():
            score = 0.0
            for keyword in keywords:
                if keyword.lower() in text_content:
                    score += 1.0
            
            # Normalize by number of keywords
            classification_scores[req_type] = score / len(keywords)
        
        # Special handling for cultural requests
        cultural_score = sum(1 for indicator in self.romanian_cultural_indicators 
                           if indicator in text_content)
        if cultural_score > 0:
            classification_scores[RequestType.CULTURAL_ANALYSIS] += cultural_score * 0.2
        
        # Determine primary classification
        if not classification_scores or max(classification_scores.values()) < 0.1:
            primary_type = RequestType.GENERAL_CONVERSATION
        else:
            primary_type = max(classification_scores, key=classification_scores.get)
        
        return primary_type, classification_scores
    
    def analyze_cultural_requirements(self, request: LLMRequest) -> Dict[str, float]:
        """Analyze cultural requirements of the request"""
        cultural_analysis = {
            "romanian_content_density": 0.0,
            "cultural_authenticity_needed": 0.0,
            "traditional_context_importance": 0.0,
            "emotional_depth_required": 0.0
        }
        
        text_content = ""
        if request.prompt:
            text_content += request.prompt.lower()
        if request.messages:
            text_content += " ".join([msg.get("content", "").lower() for msg in request.messages])
        
        # Romanian content density
        romanian_indicators = sum(1 for indicator in self.romanian_cultural_indicators 
                                if indicator in text_content)
        total_words = len(text_content.split())
        cultural_analysis["romanian_content_density"] = min(1.0, romanian_indicators / max(1, total_words) * 50)
        
        # Cultural authenticity
        authenticity_keywords = ["autentic", "tradițional", "ancestral", "strămoșesc"]
        authenticity_score = sum(1 for keyword in authenticity_keywords if keyword in text_content)
        cultural_analysis["cultural_authenticity_needed"] = min(1.0, authenticity_score * 0.3)
        
        # Traditional context
        traditional_keywords = ["obicei", "tradiție", "folclor", "străvechi", "moștenit"]
        traditional_score = sum(1 for keyword in traditional_keywords if keyword in text_content)
        cultural_analysis["traditional_context_importance"] = min(1.0, traditional_score * 0.25)
        
        # Emotional depth
        emotional_keywords = ["dor", "drag", "suflet", "inimă", "sentiment", "emoție"]
        emotional_score = sum(1 for keyword in emotional_keywords if keyword in text_content)
        cultural_analysis["emotional_depth_required"] = min(1.0, emotional_score * 0.2)
        
        return cultural_analysis

class IntelligentLLMRouter:
    """Intelligent router for LLM requests with Romanian cultural consciousness"""
    
    def __init__(self, config_manager: LLMConfigurationManager, 
                 database_path: str = "llm_routing.db"):
        self.config_manager = config_manager
        self.database_path = database_path
        self.classifier = RequestClassifier()
        
        # Performance tracking
        self.provider_metrics: Dict[str, ProviderPerformanceMetrics] = {}
        
        # Routing strategies
        self.routing_strategies = {
            RoutingStrategy.ROUND_ROBIN: self._round_robin_routing,
            RoutingStrategy.PERFORMANCE_BASED: self._performance_based_routing,
            RoutingStrategy.COST_OPTIMIZED: self._cost_optimized_routing,
            RoutingStrategy.CULTURAL_OPTIMIZED: self._cultural_optimized_routing,
            RoutingStrategy.LOAD_BALANCED: self._load_balanced_routing,
            RoutingStrategy.INTELLIGENT_ADAPTIVE: self._intelligent_adaptive_routing
        }
        
        # Current state
        self.current_round_robin_index = 0
        self.total_routed_requests = 0
        self.routing_decisions_history = deque(maxlen=1000)
        
        # Initialize storage and metrics
        self._initialize_storage()
        self._initialize_provider_metrics()
        
        logger.info("🧭 Intelligent LLM Router initialized")
    
    def _initialize_storage(self):
        """Initialize SQLite storage for routing data"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS routing_decisions (
                id TEXT PRIMARY KEY,
                request_type TEXT,
                selected_provider TEXT,
                selected_model TEXT,
                routing_strategy TEXT,
                decision_factors TEXT,
                confidence REAL,
                expected_performance TEXT,
                actual_performance TEXT,
                cultural_score REAL,
                cost REAL,
                success BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS provider_performance (
                provider_name TEXT PRIMARY KEY,
                total_requests INTEGER DEFAULT 0,
                successful_requests INTEGER DEFAULT 0,
                failed_requests INTEGER DEFAULT 0,
                average_response_time REAL DEFAULT 0.0,
                average_cultural_score REAL DEFAULT 0.0,
                total_tokens_used INTEGER DEFAULT 0,
                total_cost REAL DEFAULT 0.0,
                current_load INTEGER DEFAULT 0,
                health_score REAL DEFAULT 1.0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS routing_optimization (
                id TEXT PRIMARY KEY,
                request_type TEXT,
                optimal_provider TEXT,
                optimal_model TEXT,
                performance_score REAL,
                cultural_score REAL,
                cost_efficiency REAL,
                confidence REAL,
                sample_size INTEGER,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("✅ Router storage initialized")
    
    def _initialize_provider_metrics(self):
        """Initialize metrics for all configured providers"""
        for provider_name in self.config_manager.providers.keys():
            if provider_name not in self.provider_metrics:
                self.provider_metrics[provider_name] = ProviderPerformanceMetrics(
                    provider_name=provider_name
                )
        logger.info(f"✅ Initialized metrics for {len(self.provider_metrics)} providers")
    
    async def route_request(self, routing_request: RoutingRequest, 
                          strategy: RoutingStrategy = RoutingStrategy.INTELLIGENT_ADAPTIVE) -> RoutingDecision:
        """Route request to optimal provider"""
        start_time = time.time()
        
        logger.debug(f"🧭 Routing request {routing_request.base_request.request_id} with strategy {strategy.value}")
        
        # Classify request if not already done
        if not hasattr(routing_request, 'request_type') or routing_request.request_type is None:
            request_type, classification_scores = self.classifier.classify_request(
                routing_request.base_request
            )
            routing_request.request_type = request_type
        
        # Get cultural requirements
        cultural_requirements = self.classifier.analyze_cultural_requirements(
            routing_request.base_request
        )
        routing_request.cultural_requirements.update(cultural_requirements)
        
        # Apply routing strategy
        routing_func = self.routing_strategies.get(strategy, self._intelligent_adaptive_routing)
        routing_decision = await routing_func(routing_request)
        
        # Validate decision
        if not self._validate_routing_decision(routing_decision, routing_request):
            logger.warning(f"Invalid routing decision, falling back to default")
            routing_decision = await self._fallback_routing(routing_request)
        
        # Store decision
        await self._store_routing_decision(routing_decision, routing_request)
        
        routing_time = time.time() - start_time
        logger.debug(f"✅ Routed to {routing_decision.selected_provider} in {routing_time:.3f}s")
        
        self.total_routed_requests += 1
        self.routing_decisions_history.append(routing_decision)
        
        return routing_decision
    
    async def _round_robin_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Simple round-robin routing"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        if not enabled_providers:
            raise Exception("No enabled providers available")
        
        # Get next provider in round-robin
        provider_config = enabled_providers[self.current_round_robin_index % len(enabled_providers)]
        self.current_round_robin_index += 1
        
        decision_factors = {"round_robin_order": 1.0}
        
        return RoutingDecision(
            selected_provider=provider_config.provider_name,
            selected_model=provider_config.default_model or provider_config.models[0].model_id,
            routing_strategy=RoutingStrategy.ROUND_ROBIN,
            decision_factors=decision_factors,
            confidence=0.5,  # Neutral confidence for round-robin
            expected_performance={"response_time": 2.0, "cultural_score": 0.5},
            fallback_providers=[p.provider_name for p in enabled_providers[1:3]]
        )
    
    async def _performance_based_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Route based on historical performance"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        best_provider = None
        best_score = -1
        performance_scores = {}
        
        for provider_config in enabled_providers:
            metrics = self.provider_metrics.get(provider_config.provider_name)
            if not metrics or metrics.total_requests == 0:
                # New provider - give moderate score
                performance_score = 0.5
            else:
                # Calculate performance score
                success_rate = metrics.successful_requests / metrics.total_requests
                speed_score = max(0, 1.0 - (metrics.average_response_time / 10.0))  # Normalize to 10s max
                cultural_score = metrics.average_cultural_score
                
                performance_score = (success_rate * 0.4 + speed_score * 0.3 + cultural_score * 0.3)
            
            performance_scores[provider_config.provider_name] = performance_score
            
            if performance_score > best_score:
                best_score = performance_score
                best_provider = provider_config
        
        if not best_provider:
            return await self._fallback_routing(routing_request)
        
        return RoutingDecision(
            selected_provider=best_provider.provider_name,
            selected_model=best_provider.default_model or best_provider.models[0].model_id,
            routing_strategy=RoutingStrategy.PERFORMANCE_BASED,
            decision_factors={"performance_score": best_score, "provider_scores": performance_scores},
            confidence=min(0.9, best_score + 0.1),
            expected_performance={"response_time": 1.5, "cultural_score": best_score},
            fallback_providers=[p for p in sorted(performance_scores.keys(), 
                                                key=lambda x: performance_scores[x], reverse=True)[1:3]]
        )
    
    async def _cost_optimized_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Route to minimize cost while maintaining quality"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        best_provider = None
        best_cost_efficiency = -1
        cost_scores = {}
        
        for provider_config in enabled_providers:
            # Find most cost-effective model
            cheapest_model = min(provider_config.models, 
                                key=lambda m: m.cost_per_1k_input_tokens + m.cost_per_1k_output_tokens)
            
            cost_per_token = cheapest_model.cost_per_1k_input_tokens + cheapest_model.cost_per_1k_output_tokens
            
            # Get performance metrics
            metrics = self.provider_metrics.get(provider_config.provider_name)
            quality_score = 0.5  # Default
            if metrics and metrics.total_requests > 0:
                success_rate = metrics.successful_requests / metrics.total_requests
                cultural_score = metrics.average_cultural_score
                quality_score = (success_rate + cultural_score) / 2
            
            # Cost efficiency = quality / cost
            cost_efficiency = quality_score / max(0.001, cost_per_token)
            cost_scores[provider_config.provider_name] = cost_efficiency
            
            if cost_efficiency > best_cost_efficiency:
                best_cost_efficiency = cost_efficiency
                best_provider = provider_config
        
        if not best_provider:
            return await self._fallback_routing(routing_request)
        
        return RoutingDecision(
            selected_provider=best_provider.provider_name,
            selected_model=min(best_provider.models, 
                             key=lambda m: m.cost_per_1k_input_tokens + m.cost_per_1k_output_tokens).model_id,
            routing_strategy=RoutingStrategy.COST_OPTIMIZED,
            decision_factors={"cost_efficiency": best_cost_efficiency, "cost_scores": cost_scores},
            confidence=0.7,
            expected_performance={"cost_efficiency": best_cost_efficiency, "cultural_score": 0.6},
            fallback_providers=[p for p in sorted(cost_scores.keys(), 
                                                key=lambda x: cost_scores[x], reverse=True)[1:3]]
        )
    
    async def _cultural_optimized_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Route to maximize Romanian cultural understanding and authenticity"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        best_provider = None
        best_cultural_score = -1
        cultural_scores = {}
        
        for provider_config in enabled_providers:
            cultural_score = 0.0
            
            # Base score from configuration
            romanian_config = provider_config.romanian_context_config
            cultural_score += romanian_config.context_weight * 0.3
            
            if romanian_config.cultural_filtering_enabled:
                cultural_score += 0.2
            
            # Historical performance
            metrics = self.provider_metrics.get(provider_config.provider_name)
            if metrics and metrics.total_requests > 0:
                cultural_score += metrics.average_cultural_score * 0.4
            
            # Model optimization
            optimized_models = [m for m in provider_config.models if m.romanian_optimization_available]
            if optimized_models:
                cultural_score += 0.1
            
            cultural_scores[provider_config.provider_name] = cultural_score
            
            if cultural_score > best_cultural_score:
                best_cultural_score = cultural_score
                best_provider = provider_config
        
        if not best_provider:
            return await self._fallback_routing(routing_request)
        
        # Select Romanian-optimized model if available
        selected_model = best_provider.default_model or best_provider.models[0].model_id
        optimized_models = [m for m in best_provider.models if m.romanian_optimization_available]
        if optimized_models:
            selected_model = optimized_models[0].model_id
        
        return RoutingDecision(
            selected_provider=best_provider.provider_name,
            selected_model=selected_model,
            routing_strategy=RoutingStrategy.CULTURAL_OPTIMIZED,
            decision_factors={"cultural_score": best_cultural_score, "cultural_scores": cultural_scores},
            confidence=min(0.95, best_cultural_score + 0.2),
            expected_performance={"cultural_score": best_cultural_score, "authenticity": 0.9},
            fallback_providers=[p for p in sorted(cultural_scores.keys(), 
                                                key=lambda x: cultural_scores[x], reverse=True)[1:3]]
        )
    
    async def _load_balanced_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Route based on current load balancing"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        # Calculate load scores (lower is better)
        load_scores = {}
        for provider_config in enabled_providers:
            metrics = self.provider_metrics.get(provider_config.provider_name)
            if metrics:
                # Combine current load with recent performance
                load_factor = metrics.current_load / max(1, metrics.total_requests * 0.1)
                response_time_factor = metrics.average_response_time / 10.0  # Normalize
                
                load_score = load_factor + response_time_factor
            else:
                load_score = 0.1  # New provider gets low load score
            
            load_scores[provider_config.provider_name] = load_score
        
        # Select provider with lowest load
        best_provider_name = min(load_scores, key=load_scores.get)
        best_provider = next(p for p in enabled_providers if p.provider_name == best_provider_name)
        
        return RoutingDecision(
            selected_provider=best_provider.provider_name,
            selected_model=best_provider.default_model or best_provider.models[0].model_id,
            routing_strategy=RoutingStrategy.LOAD_BALANCED,
            decision_factors={"load_score": load_scores[best_provider_name], "load_scores": load_scores},
            confidence=0.8,
            expected_performance={"load_balance": 0.8, "response_time": 1.5},
            fallback_providers=[p for p in sorted(load_scores.keys(), 
                                                key=lambda x: load_scores[x])[1:3]]
        )
    
    async def _intelligent_adaptive_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Intelligent adaptive routing based on all available factors"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        # Multi-factor scoring
        provider_scores = {}
        
        for provider_config in enabled_providers:
            score_components = {}
            
            # Performance component (30%)
            metrics = self.provider_metrics.get(provider_config.provider_name)
            if metrics and metrics.total_requests > 0:
                success_rate = metrics.successful_requests / metrics.total_requests
                speed_score = max(0, 1.0 - (metrics.average_response_time / 10.0))
                performance_component = (success_rate + speed_score) / 2 * 0.3
            else:
                performance_component = 0.15  # Neutral for new providers
            score_components["performance"] = performance_component
            
            # Cultural component (25%)
            romanian_config = provider_config.romanian_context_config
            cultural_base = romanian_config.context_weight * 0.15
            cultural_historical = 0.0
            if metrics and metrics.total_requests > 0:
                cultural_historical = metrics.average_cultural_score * 0.1
            cultural_component = cultural_base + cultural_historical
            score_components["cultural"] = cultural_component
            
            # Cost component (20%)
            if provider_config.models:
                avg_cost = statistics.mean([
                    m.cost_per_1k_input_tokens + m.cost_per_1k_output_tokens 
                    for m in provider_config.models
                ])
                # Invert cost (lower cost = higher score)
                cost_component = max(0, (0.1 - avg_cost) / 0.1) * 0.2
            else:
                cost_component = 0.1
            score_components["cost"] = cost_component
            
            # Load component (15%)
            if metrics:
                load_factor = metrics.current_load / max(1, metrics.total_requests * 0.1)
                load_component = max(0, 1.0 - load_factor) * 0.15
            else:
                load_component = 0.15
            score_components["load"] = load_component
            
            # Request-specific component (10%)
            request_specific = 0.05  # Base
            if routing_request.request_type == RequestType.CULTURAL_ANALYSIS:
                # Bonus for cultural analysis requests
                cultural_bonus = sum(routing_request.cultural_requirements.values()) * 0.05
                request_specific += cultural_bonus
            score_components["request_specific"] = request_specific
            
            # Total score
            total_score = sum(score_components.values())
            provider_scores[provider_config.provider_name] = {
                "total": total_score,
                "components": score_components
            }
        
        # Select best provider
        best_provider_name = max(provider_scores, key=lambda x: provider_scores[x]["total"])
        best_provider = next(p for p in enabled_providers if p.provider_name == best_provider_name)
        best_score = provider_scores[best_provider_name]["total"]
        
        # Select optimal model for request type
        selected_model = await self._select_optimal_model(best_provider, routing_request)
        
        return RoutingDecision(
            selected_provider=best_provider.provider_name,
            selected_model=selected_model,
            routing_strategy=RoutingStrategy.INTELLIGENT_ADAPTIVE,
            decision_factors=provider_scores[best_provider_name]["components"],
            confidence=min(0.95, best_score * 1.5),  # Scale confidence
            expected_performance={
                "overall_score": best_score,
                "cultural_score": provider_scores[best_provider_name]["components"].get("cultural", 0.0) * 4,
                "response_time": 2.0 - (provider_scores[best_provider_name]["components"].get("performance", 0.0) * 3)
            },
            fallback_providers=[p for p in sorted(provider_scores.keys(), 
                                                key=lambda x: provider_scores[x]["total"], reverse=True)[1:3]]
        )
    
    async def _select_optimal_model(self, provider_config: ProviderConfiguration, 
                                  routing_request: RoutingRequest) -> str:
        """Select optimal model for the request"""
        if not provider_config.models:
            return provider_config.default_model or "default"
        
        # For cultural requests, prefer Romanian-optimized models
        if routing_request.request_type == RequestType.CULTURAL_ANALYSIS:
            optimized_models = [m for m in provider_config.models if m.romanian_optimization_available]
            if optimized_models:
                return optimized_models[0].model_id
        
        # For cost-sensitive requests
        if routing_request.max_cost and routing_request.max_cost < 0.01:
            cheapest = min(provider_config.models, 
                          key=lambda m: m.cost_per_1k_input_tokens + m.cost_per_1k_output_tokens)
            return cheapest.model_id
        
        # For creative requests, prefer models with higher max_tokens
        if routing_request.request_type == RequestType.CREATIVE_WRITING:
            creative_model = max(provider_config.models, key=lambda m: m.max_tokens)
            return creative_model.model_id
        
        # Default to provider's default model
        return provider_config.default_model or provider_config.models[0].model_id
    
    async def _fallback_routing(self, routing_request: RoutingRequest) -> RoutingDecision:
        """Fallback routing when other strategies fail"""
        enabled_providers = self.config_manager.get_enabled_providers()
        
        if not enabled_providers:
            raise Exception("No enabled providers available for fallback")
        
        # Use first available provider
        fallback_provider = enabled_providers[0]
        
        return RoutingDecision(
            selected_provider=fallback_provider.provider_name,
            selected_model=fallback_provider.default_model or fallback_provider.models[0].model_id,
            routing_strategy=RoutingStrategy.ROUND_ROBIN,  # Fallback strategy
            decision_factors={"fallback": 1.0},
            confidence=0.3,  # Low confidence for fallback
            expected_performance={"reliability": 0.5},
            fallback_providers=[]
        )
    
    def _validate_routing_decision(self, decision: RoutingDecision, 
                                 request: RoutingRequest) -> bool:
        """Validate that routing decision is valid"""
        # Check if provider exists and is enabled
        provider_config = self.config_manager.get_provider_config(decision.selected_provider)
        if not provider_config or not provider_config.enabled:
            return False
        
        # Check if model exists
        if decision.selected_model:
            model_exists = any(m.model_id == decision.selected_model for m in provider_config.models)
            if not model_exists:
                return False
        
        # Check excluded providers
        if decision.selected_provider in request.excluded_providers:
            return False
        
        return True
    
    async def _store_routing_decision(self, decision: RoutingDecision, request: RoutingRequest):
        """Store routing decision for analysis"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO routing_decisions
            (id, request_type, selected_provider, selected_model, routing_strategy,
             decision_factors, confidence, expected_performance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            request.request_type.value if request.request_type else "unknown",
            decision.selected_provider,
            decision.selected_model,
            decision.routing_strategy.value,
            json.dumps(decision.decision_factors),
            decision.confidence,
            json.dumps(decision.expected_performance)
        ))
        
        conn.commit()
        conn.close()
    
    async def update_provider_performance(self, provider_name: str, response: LLMResponse, 
                                        request_successful: bool):
        """Update provider performance metrics"""
        if provider_name not in self.provider_metrics:
            self.provider_metrics[provider_name] = ProviderPerformanceMetrics(provider_name=provider_name)
        
        metrics = self.provider_metrics[provider_name]
        
        # Update counters
        metrics.total_requests += 1
        if request_successful:
            metrics.successful_requests += 1
        else:
            metrics.failed_requests += 1
        
        # Update response times
        metrics.response_times.append(response.processing_time)
        metrics.average_response_time = statistics.mean(metrics.response_times)
        
        # Update cultural scores
        if response.romanian_cultural_score > 0:
            metrics.cultural_scores.append(response.romanian_cultural_score)
            metrics.average_cultural_score = statistics.mean(metrics.cultural_scores)
        
        # Update tokens and cost
        metrics.total_tokens_used += response.tokens_used
        
        # Update health score based on recent success rate
        recent_requests = min(50, metrics.total_requests)
        recent_successes = metrics.successful_requests
        if recent_requests > 0:
            success_rate = recent_successes / recent_requests
            metrics.health_score = success_rate * 0.8 + metrics.health_score * 0.2  # Exponential smoothing
        
        metrics.last_updated = datetime.now()
        
        # Update database
        await self._update_provider_metrics_db(provider_name, metrics)
    
    async def _update_provider_metrics_db(self, provider_name: str, metrics: ProviderPerformanceMetrics):
        """Update provider metrics in database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO provider_performance
            (provider_name, total_requests, successful_requests, failed_requests,
             average_response_time, average_cultural_score, total_tokens_used,
             total_cost, current_load, health_score, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (
            provider_name,
            metrics.total_requests,
            metrics.successful_requests,
            metrics.failed_requests,
            metrics.average_response_time,
            metrics.average_cultural_score,
            metrics.total_tokens_used,
            metrics.total_cost,
            metrics.current_load,
            metrics.health_score
        ))
        
        conn.commit()
        conn.close()
    
    async def get_routing_insights(self) -> Dict[str, Any]:
        """Get comprehensive routing system insights"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Routing statistics
        cursor.execute("SELECT COUNT(*) FROM routing_decisions")
        total_decisions = cursor.fetchone()[0]
        
        cursor.execute("SELECT routing_strategy, COUNT(*) FROM routing_decisions GROUP BY routing_strategy")
        strategy_usage = dict(cursor.fetchall())
        
        cursor.execute("SELECT AVG(confidence) FROM routing_decisions")
        avg_confidence = cursor.fetchone()[0] or 0.0
        
        # Provider performance
        provider_performance = {}
        for provider_name, metrics in self.provider_metrics.items():
            provider_performance[provider_name] = {
                "total_requests": metrics.total_requests,
                "success_rate": metrics.successful_requests / max(1, metrics.total_requests),
                "average_response_time": metrics.average_response_time,
                "average_cultural_score": metrics.average_cultural_score,
                "health_score": metrics.health_score,
                "current_load": metrics.current_load
            }
        
        conn.close()
        
        # Recent routing decisions
        recent_decisions = list(self.routing_decisions_history)[-10:]  # Last 10 decisions
        
        insights = {
            "total_routed_requests": self.total_routed_requests,
            "total_routing_decisions": total_decisions,
            "average_routing_confidence": avg_confidence,
            "strategy_usage_distribution": strategy_usage,
            "provider_performance": provider_performance,
            "recent_routing_patterns": [
                {
                    "provider": d.selected_provider,
                    "strategy": d.routing_strategy.value,
                    "confidence": d.confidence
                } for d in recent_decisions
            ],
            "routing_success_metrics": {
                "enabled_providers": len(self.config_manager.get_enabled_providers()),
                "healthy_providers": len([p for p in self.provider_metrics.values() if p.health_score > 0.8])
            }
        }
        
        return insights
    
    async def demonstrate_routing_system(self):
        """Demonstrate intelligent routing capabilities"""
        logger.info("🧭 INTELLIGENT LLM ROUTING SYSTEM DEMONSTRATION")
        logger.info("=" * 60)
        
        # Test different routing strategies
        test_requests = [
            RoutingRequest(
                base_request=LLMRequest(
                    prompt="Ce înseamnă 'dor' în cultura românească și cum se manifestă în literatura lui Eminescu?"
                ),
                request_type=RequestType.CULTURAL_ANALYSIS,
                priority=4
            ),
            RoutingRequest(
                base_request=LLMRequest(
                    prompt="Write a Python function to calculate fibonacci numbers efficiently"
                ),
                request_type=RequestType.CODE_GENERATION,
                priority=2,
                max_cost=0.005
            ),
            RoutingRequest(
                base_request=LLMRequest(
                    prompt="Scrie o scurtă poveste despre un bătrân înțelept care trăiește în Carpați"
                ),
                request_type=RequestType.CREATIVE_WRITING,
                priority=3
            )
        ]
        
        strategies_to_test = [
            RoutingStrategy.CULTURAL_OPTIMIZED,
            RoutingStrategy.COST_OPTIMIZED,
            RoutingStrategy.PERFORMANCE_BASED,
            RoutingStrategy.INTELLIGENT_ADAPTIVE
        ]
        
        logger.info("🎯 Testing routing strategies:")
        
        for i, (strategy, request) in enumerate(zip(strategies_to_test, test_requests), 1):
            logger.info(f"\n   Test {i}: {strategy.value} routing")
            logger.info(f"   Request type: {request.request_type.value}")
            
            try:
                decision = await self.route_request(request, strategy)
                logger.info(f"   Selected provider: {decision.selected_provider}")
                logger.info(f"   Selected model: {decision.selected_model}")
                logger.info(f"   Confidence: {decision.confidence:.2f}")
                logger.info(f"   Decision factors: {len(decision.decision_factors)} factors considered")
                logger.info(f"   Fallback providers: {len(decision.fallback_providers)} available")
                
            except Exception as e:
                logger.error(f"   ❌ Routing failed: {e}")
        
        # Test adaptive routing with different request types
        logger.info("\n🤖 Adaptive routing for different request types:")
        
        request_type_tests = [
            (RequestType.CULTURAL_ANALYSIS, "Analiza conceptului de 'dor' în cultura populară românească"),
            (RequestType.TECHNICAL_EXPLANATION, "Explică cum funcționează algoritmii de machine learning"),
            (RequestType.CREATIVE_WRITING, "Scrie o poezie despre frumusețea României"),
            (RequestType.PHILOSOPHICAL_DISCUSSION, "Ce înseamnă să fii român în secolul XXI?")
        ]
        
        for req_type, prompt in request_type_tests:
            test_request = RoutingRequest(
                base_request=LLMRequest(prompt=prompt),
                request_type=req_type
            )
            
            decision = await self.route_request(test_request, RoutingStrategy.INTELLIGENT_ADAPTIVE)
            logger.info(f"   {req_type.value}: {decision.selected_provider} (confidence: {decision.confidence:.2f})")
        
        # Show routing insights
        insights = await self.get_routing_insights()
        logger.info("\n📊 Routing System Performance Insights:")
        logger.info(f"   Total routed requests: {insights['total_routed_requests']}")
        logger.info(f"   Average routing confidence: {insights['average_routing_confidence']:.2f}")
        logger.info(f"   Enabled providers: {insights['routing_success_metrics']['enabled_providers']}")
        logger.info(f"   Healthy providers: {insights['routing_success_metrics']['healthy_providers']}")
        
        if insights['strategy_usage_distribution']:
            logger.info("   Strategy usage distribution:")
            for strategy, count in insights['strategy_usage_distribution'].items():
                logger.info(f"     {strategy}: {count} requests")
        
        if insights['provider_performance']:
            logger.info("   Provider performance summary:")
            for provider, perf in insights['provider_performance'].items():
                logger.info(f"     {provider}: {perf['success_rate']:.2f} success rate, {perf['health_score']:.2f} health")
        
        logger.info("\n✅ Intelligent routing system demonstration completed!")

async def main():
    """Main execution for routing system testing"""
    config_manager = LLMConfigurationManager()
    router = IntelligentLLMRouter(config_manager)
    await router.demonstrate_routing_system()

if __name__ == "__main__":
    asyncio.run(main())
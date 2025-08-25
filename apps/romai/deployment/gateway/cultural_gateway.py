"""
Romanian Cultural API Gateway
Specialized API gateway with Romanian language and cultural awareness
"""

import asyncio
import aiohttp
import json
import logging
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import jwt
from aiohttp import web, ClientSession
from aiohttp.web_middlewares import cors_handler
from aiohttp_cors import setup as cors_setup, ResourceOptions
import aioredis
from functools import wraps
import unicodedata
import re

logger = logging.getLogger(__name__)

class LoadBalancingStrategy(Enum):
    """Load balancing strategies"""
    ROUND_ROBIN = "round_robin"
    CULTURAL_AWARE = "romanian_cultural_aware"
    LEAST_CONNECTIONS = "least_connections"
    RESPONSE_TIME = "response_time"

@dataclass
class UpstreamServer:
    """Upstream server configuration"""
    id: str
    url: str
    weight: int
    cultural_capability_score: float  # 0.0-1.0 Romanian cultural understanding
    health_status: bool
    current_connections: int
    avg_response_time_ms: float

@dataclass
class RomanianCulturalContext:
    """Romanian cultural context for requests"""
    has_diacritics: bool
    cultural_keywords: List[str]
    emotional_indicators: List[str]  # dor, nostalgie, etc.
    literary_references: List[str]   # Eminescu, Blaga, etc.
    complexity_score: float
    requires_cultural_understanding: bool

class RomanianCulturalGateway:
    """Romanian Cultural API Gateway with intelligent routing"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.redis_pool = None
        self.upstream_servers: List[UpstreamServer] = []
        self.session: Optional[ClientSession] = None
        
        # Romanian cultural processing
        self.romanian_diacritics = set('ăâîșț')
        self.cultural_keywords = {
            'emotions': ['dor', 'nostalgie', 'melancolie', 'bucurie'],
            'traditions': ['mărțișor', 'paște', 'crăciun', 'obiceiuri'],
            'literature': ['eminescu', 'blaga', 'creangă', 'sadoveanu'],
            'philosophy': ['mioritic', 'fatalism', 'ortodoxie'],
            'folklore': ['basme', 'legende', 'colinde', 'datini']
        }
        
        # Load balancing state
        self.current_server_index = 0
        self.connection_counts = {}
        self.response_times = {}
        
        # Rate limiting
        self.rate_limits = {}
        
    async def initialize(self):
        """Initialize the gateway"""
        # Initialize Redis connection
        redis_url = self.config.get('redis_url', 'redis://localhost:6379')
        self.redis_pool = aioredis.from_url(redis_url)
        
        # Initialize HTTP session
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = ClientSession(timeout=timeout)
        
        # Load upstream servers
        await self._load_upstream_servers()
        
        # Start health checking
        asyncio.create_task(self._health_check_loop())
        
        logger.info("Romanian Cultural Gateway initialized")
    
    async def _load_upstream_servers(self):
        """Load upstream server configurations"""
        servers_config = self.config.get('upstream_servers', [])
        
        for server_config in servers_config:
            server = UpstreamServer(
                id=server_config['id'],
                url=server_config['url'],
                weight=server_config.get('weight', 1),
                cultural_capability_score=server_config.get('cultural_capability', 0.5),
                health_status=True,
                current_connections=0,
                avg_response_time_ms=0.0
            )
            self.upstream_servers.append(server)
            
            # Initialize tracking
            self.connection_counts[server.id] = 0
            self.response_times[server.id] = []
        
        logger.info(f"Loaded {len(self.upstream_servers)} upstream servers")
    
    def analyze_romanian_context(self, text: str) -> RomanianCulturalContext:
        """Analyze Romanian cultural context in text"""
        if not text:
            return RomanianCulturalContext(
                has_diacritics=False,
                cultural_keywords=[],
                emotional_indicators=[],
                literary_references=[],
                complexity_score=0.0,
                requires_cultural_understanding=False
            )
        
        text_lower = text.lower()
        
        # Check for diacritics
        has_diacritics = any(char in text for char in self.romanian_diacritics)
        
        # Find cultural keywords
        cultural_keywords = []
        for category, keywords in self.cultural_keywords.items():
            found = [kw for kw in keywords if kw in text_lower]
            cultural_keywords.extend(found)
        
        # Identify emotional indicators
        emotional_indicators = [
            word for word in self.cultural_keywords['emotions'] 
            if word in text_lower
        ]
        
        # Find literary references
        literary_references = [
            ref for ref in self.cultural_keywords['literature']
            if ref in text_lower
        ]
        
        # Calculate complexity score
        complexity_factors = [
            len(cultural_keywords) * 0.2,
            len(emotional_indicators) * 0.3,
            len(literary_references) * 0.4,
            (1.0 if has_diacritics else 0.0) * 0.1
        ]
        complexity_score = min(sum(complexity_factors), 1.0)
        
        # Determine if cultural understanding is required
        requires_cultural = (
            len(cultural_keywords) > 0 or
            len(emotional_indicators) > 0 or
            len(literary_references) > 0 or
            has_diacritics
        )
        
        return RomanianCulturalContext(
            has_diacritics=has_diacritics,
            cultural_keywords=cultural_keywords,
            emotional_indicators=emotional_indicators,
            literary_references=literary_references,
            complexity_score=complexity_score,
            requires_cultural_understanding=requires_cultural
        )
    
    async def select_upstream_server(self, cultural_context: RomanianCulturalContext,
                                   strategy: LoadBalancingStrategy = None) -> Optional[UpstreamServer]:
        """Select best upstream server based on cultural context and strategy"""
        
        if not self.upstream_servers:
            return None
        
        # Filter healthy servers
        healthy_servers = [s for s in self.upstream_servers if s.health_status]
        if not healthy_servers:
            logger.warning("No healthy upstream servers available")
            return None
        
        strategy = strategy or LoadBalancingStrategy(self.config.get('load_balancing_strategy', 'cultural_aware'))
        
        if strategy == LoadBalancingStrategy.CULTURAL_AWARE:
            return await self._cultural_aware_selection(healthy_servers, cultural_context)
        elif strategy == LoadBalancingStrategy.ROUND_ROBIN:
            return self._round_robin_selection(healthy_servers)
        elif strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
            return self._least_connections_selection(healthy_servers)
        elif strategy == LoadBalancingStrategy.RESPONSE_TIME:
            return self._response_time_selection(healthy_servers)
        else:
            return healthy_servers[0]
    
    async def _cultural_aware_selection(self, servers: List[UpstreamServer],
                                      context: RomanianCulturalContext) -> UpstreamServer:
        """Select server based on Romanian cultural capability"""
        
        if not context.requires_cultural_understanding:
            # For non-cultural requests, use standard load balancing
            return self._least_connections_selection(servers)
        
        # Calculate cultural fitness score for each server
        scored_servers = []
        for server in servers:
            # Base score from cultural capability
            cultural_score = server.cultural_capability_score
            
            # Boost score based on context complexity
            complexity_boost = context.complexity_score * 0.3
            
            # Penalize based on current load
            load_penalty = (server.current_connections / 100.0) * 0.2
            
            # Response time factor
            avg_response = server.avg_response_time_ms / 1000.0  # Convert to seconds
            response_penalty = min(avg_response * 0.1, 0.3)
            
            final_score = (
                cultural_score + 
                complexity_boost - 
                load_penalty - 
                response_penalty
            )
            
            scored_servers.append((server, final_score))
        
        # Select server with highest cultural fitness score
        best_server = max(scored_servers, key=lambda x: x[1])[0]
        
        logger.debug(f"Selected server {best_server.id} for cultural request (score: {best_server.cultural_capability_score})")
        return best_server
    
    def _round_robin_selection(self, servers: List[UpstreamServer]) -> UpstreamServer:
        """Round robin server selection"""
        server = servers[self.current_server_index % len(servers)]
        self.current_server_index += 1
        return server
    
    def _least_connections_selection(self, servers: List[UpstreamServer]) -> UpstreamServer:
        """Select server with least connections"""
        return min(servers, key=lambda s: s.current_connections)
    
    def _response_time_selection(self, servers: List[UpstreamServer]) -> UpstreamServer:
        """Select server with best response time"""
        return min(servers, key=lambda s: s.avg_response_time_ms)
    
    async def check_rate_limit(self, client_id: str, endpoint: str) -> bool:
        """Check rate limiting for client"""
        rate_limit_key = f"rate_limit:{client_id}:{endpoint}"
        
        # Get current rate limit configuration
        rpm_limit = self.config.get('rate_limit_rpm', 1000)
        burst_limit = self.config.get('rate_limit_burst', 100)
        
        try:
            # Use Redis for distributed rate limiting
            current_count = await self.redis_pool.incr(rate_limit_key)
            
            if current_count == 1:
                # First request, set expiration
                await self.redis_pool.expire(rate_limit_key, 60)  # 1 minute window
            
            if current_count > rpm_limit:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Rate limiting check failed: {e}")
            return True  # Allow request if rate limiting fails
    
    def normalize_diacritics(self, text: str) -> str:
        """Normalize Romanian diacritics"""
        # Common diacritics mapping
        diacritics_map = {
            'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
            'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
        }
        
        if self.config.get('diacritics_normalization', True):
            for diacritic, replacement in diacritics_map.items():
                text = text.replace(diacritic, replacement)
        
        return text
    
    def enhance_cultural_context(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance request with Romanian cultural context"""
        
        if not self.config.get('cultural_context_enhancement', True):
            return request_data
        
        # Extract text content for analysis
        text_content = ""
        if isinstance(request_data, dict):
            text_content = str(request_data.get('prompt', '') or request_data.get('text', '') or request_data.get('query', ''))
        elif isinstance(request_data, str):
            text_content = request_data
        
        # Analyze cultural context
        cultural_context = self.analyze_romanian_context(text_content)
        
        # Add cultural metadata to request
        enhanced_data = request_data.copy() if isinstance(request_data, dict) else {'original_request': request_data}
        
        enhanced_data['_romanian_cultural_context'] = {
            'has_diacritics': cultural_context.has_diacritics,
            'cultural_keywords': cultural_context.cultural_keywords,
            'emotional_indicators': cultural_context.emotional_indicators,
            'literary_references': cultural_context.literary_references,
            'complexity_score': cultural_context.complexity_score,
            'requires_cultural_understanding': cultural_context.requires_cultural_understanding
        }
        
        return enhanced_data
    
    async def proxy_request(self, request: web.Request) -> web.Response:
        """Main request proxying logic"""
        start_time = time.time()
        
        try:
            # Extract client information
            client_ip = request.remote
            client_id = request.headers.get('X-Client-ID', client_ip)
            
            # Check rate limiting
            endpoint = request.path
            if not await self.check_rate_limit(client_id, endpoint):
                return web.json_response(
                    {'error': 'Rate limit exceeded', 'retry_after': 60},
                    status=429
                )
            
            # Read request body
            if request.content_type == 'application/json':
                request_data = await request.json()
            else:
                request_data = await request.text()
            
            # Enhance with cultural context
            enhanced_data = self.enhance_cultural_context(request_data)
            
            # Analyze cultural context for routing
            text_for_analysis = json.dumps(enhanced_data) if isinstance(enhanced_data, dict) else str(enhanced_data)
            cultural_context = self.analyze_romanian_context(text_for_analysis)
            
            # Select upstream server
            upstream_server = await self.select_upstream_server(cultural_context)
            if not upstream_server:
                return web.json_response(
                    {'error': 'No available upstream servers'},
                    status=503
                )
            
            # Update connection count
            upstream_server.current_connections += 1
            
            try:
                # Prepare upstream request
                upstream_url = f"{upstream_server.url.rstrip('/')}{request.path_qs}"
                
                headers = dict(request.headers)
                headers['X-Forwarded-For'] = client_ip
                headers['X-Romanian-Cultural-Gateway'] = 'v1.0'
                
                # Make upstream request
                async with self.session.request(
                    method=request.method,
                    url=upstream_url,
                    json=enhanced_data if isinstance(enhanced_data, dict) else None,
                    data=enhanced_data if isinstance(enhanced_data, str) else None,
                    headers=headers
                ) as upstream_response:
                    
                    # Read upstream response
                    response_text = await upstream_response.text()
                    
                    # Create response
                    response = web.Response(
                        text=response_text,
                        status=upstream_response.status,
                        headers=upstream_response.headers
                    )
                    
                    # Add gateway headers
                    response.headers['X-Upstream-Server'] = upstream_server.id
                    response.headers['X-Cultural-Context-Score'] = str(cultural_context.complexity_score)
                    response.headers['X-Gateway-Time'] = str(int((time.time() - start_time) * 1000))
                    
                    return response
                    
            finally:
                # Update server metrics
                upstream_server.current_connections -= 1
                response_time = (time.time() - start_time) * 1000
                
                if upstream_server.id not in self.response_times:
                    self.response_times[upstream_server.id] = []
                
                self.response_times[upstream_server.id].append(response_time)
                
                # Keep only last 100 response times
                if len(self.response_times[upstream_server.id]) > 100:
                    self.response_times[upstream_server.id] = self.response_times[upstream_server.id][-100:]
                
                # Update average response time
                upstream_server.avg_response_time_ms = sum(self.response_times[upstream_server.id]) / len(self.response_times[upstream_server.id])
        
        except Exception as e:
            logger.error(f"Gateway error: {e}")
            return web.json_response(
                {'error': 'Gateway error', 'message': str(e)},
                status=502
            )
    
    async def _health_check_loop(self):
        """Background health checking for upstream servers"""
        while True:
            try:
                for server in self.upstream_servers:
                    try:
                        health_url = f"{server.url.rstrip('/')}/health"
                        async with self.session.get(health_url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                            server.health_status = response.status == 200
                    except Exception as e:
                        logger.warning(f"Health check failed for {server.id}: {e}")
                        server.health_status = False
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Health check loop error: {e}")
                await asyncio.sleep(60)
    
    async def health_check(self, request: web.Request) -> web.Response:
        """Gateway health check endpoint"""
        healthy_servers = [s for s in self.upstream_servers if s.health_status]
        
        status = {
            'status': 'healthy' if healthy_servers else 'unhealthy',
            'gateway_version': '1.0.0',
            'upstream_servers': {
                'total': len(self.upstream_servers),
                'healthy': len(healthy_servers),
                'unhealthy': len(self.upstream_servers) - len(healthy_servers)
            },
            'cultural_features': {
                'diacritics_support': True,
                'cultural_routing': True,
                'romanian_context_enhancement': True
            }
        }
        
        return web.json_response(status)
    
    async def shutdown(self):
        """Clean shutdown"""
        if self.session:
            await self.session.close()
        
        if self.redis_pool:
            await self.redis_pool.close()
        
        logger.info("Romanian Cultural Gateway shutdown complete")


def create_app(config: Dict[str, Any]) -> web.Application:
    """Create the gateway application"""
    
    gateway = RomanianCulturalGateway(config)
    
    app = web.Application()
    
    # Setup CORS
    cors = cors_setup(app, defaults={
        "*": ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*"
        )
    })
    
    # Routes
    app.router.add_get('/health', gateway.health_check)
    app.router.add_route('*', '/{path:.*}', gateway.proxy_request)
    
    # Startup/shutdown handlers
    async def startup(app):
        await gateway.initialize()
    
    async def cleanup(app):
        await gateway.shutdown()
    
    app.on_startup.append(startup)
    app.on_cleanup.append(cleanup)
    
    return app


if __name__ == '__main__':
    import sys
    import yaml
    
    # Load configuration
    config_path = sys.argv[1] if len(sys.argv) > 1 else 'config/gateway.yaml'
    
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
    except FileNotFoundError:
        # Default configuration
        config = {
            'port': 8080,
            'redis_url': 'redis://localhost:6379',
            'load_balancing_strategy': 'romanian_cultural_aware',
            'rate_limit_rpm': 1000,
            'rate_limit_burst': 100,
            'diacritics_normalization': True,
            'cultural_context_enhancement': True,
            'upstream_servers': [
                {
                    'id': 'romai-agi-1',
                    'url': 'http://localhost:6101',
                    'weight': 1,
                    'cultural_capability': 1.0
                },
                {
                    'id': 'romai-enterprise-1',
                    'url': 'http://localhost:8001',
                    'weight': 1,
                    'cultural_capability': 0.9
                }
            ]
        }
    
    # Create and run app
    app = create_app(config)
    
    port = config.get('port', 8080)
    print(f"🇷🇴 Starting Romanian Cultural API Gateway on port {port}")
    
    web.run_app(app, port=port)
"""
RomAI AGI Production API Documentation Generator - Phase 3B
==========================================================

Automatic OpenAPI/Swagger documentation generation for RomAI AGI endpoints.
Provides interactive API explorer, request/response schemas, and production guides.

Features:
- OpenAPI 3.0 specification generation
- Interactive Swagger UI
- Request/response validation schemas
- Authentication documentation
- Rate limiting information
- Error code documentation
- Performance benchmarks
- Production deployment guides
"""

import json
import yaml
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

@dataclass
class APIEndpoint:
    """API endpoint documentation structure"""
    path: str
    method: str
    summary: str
    description: str
    tags: List[str]
    request_schema: Dict[str, Any]
    response_schema: Dict[str, Any]
    error_responses: Dict[int, str]
    authentication_required: bool = False
    rate_limit: Optional[str] = None
    example_request: Optional[Dict[str, Any]] = None
    example_response: Optional[Dict[str, Any]] = None

@dataclass
class APIDocumentation:
    """Complete API documentation structure"""
    title: str
    version: str
    description: str
    base_url: str
    endpoints: List[APIEndpoint]
    authentication: Dict[str, Any]
    rate_limiting: Dict[str, Any]
    error_codes: Dict[int, str]

class RomAIAPIDocumentationGenerator:
    """
    Production API documentation generator for RomAI AGI
    """
    
    def __init__(self):
        self.api_docs = APIDocumentation(
            title="RomAI AGI - Advanced Romanian AI System",
            version="3.0.0-production",
            description="""
RomAI AGI (Romanian Artificial General Intelligence) is a production-ready AI system
specializing in Romanian language processing, cultural intelligence, and advanced reasoning.

## Key Features

- **Advanced Reasoning**: Multi-step chain-of-thought processing with neural verification
- **Cultural Intelligence**: Deep Romanian cultural context understanding  
- **Mathematical Processing**: Romanian word problem solving with cultural awareness
- **Production Ready**: Enterprise monitoring, logging, and observability
- **High Performance**: Optimized for low-latency inference with 90%+ confidence scores

## Performance Benchmarks

- **Response Time**: < 2 seconds for complex reasoning tasks
- **Accuracy**: 90%+ confidence scores on Romanian language tasks
- **Throughput**: 100+ concurrent requests supported
- **Availability**: 99.9% uptime with comprehensive monitoring

## Getting Started

1. Obtain API key from the RomAI portal
2. Set authentication header: `X-API-Key: your_api_key`
3. Make requests to endpoints documented below
4. Monitor usage through the production dashboard

## Support

- Documentation: https://docs.romai.ai
- Support: support@romai.ai
- Status: https://status.romai.ai
            """.strip(),
            base_url="http://localhost:6101",
            endpoints=[],
            authentication={
                "type": "apiKey",
                "name": "X-API-Key",
                "location": "header",
                "description": "API key required for all production endpoints"
            },
            rate_limiting={
                "requests_per_minute": 60,
                "requests_per_hour": 1000,
                "burst_limit": 10,
                "description": "Rate limits apply per API key"
            },
            error_codes={
                400: "Bad Request - Invalid input parameters",
                401: "Unauthorized - Invalid or missing API key",
                403: "Forbidden - Rate limit exceeded or insufficient permissions", 
                404: "Not Found - Endpoint does not exist",
                429: "Too Many Requests - Rate limit exceeded",
                500: "Internal Server Error - Server processing error",
                503: "Service Unavailable - Server overloaded or maintenance"
            }
        )
        
        # Define all API endpoints
        self._define_api_endpoints()
    
    def _define_api_endpoints(self):
        """Define all API endpoints with full documentation"""
        
        # Romanian Word Analysis Endpoint
        romanian_endpoint = APIEndpoint(
            path="/api/v1/romanian/word-analysis",
            method="POST",
            summary="Analyze Romanian Mathematical Word Problems",
            description="""
Analyze Romanian mathematical word problems with cultural context and intelligence.
Provides step-by-step problem solving with Romanian language understanding.

This endpoint specializes in:
- Romanian mathematical terminology recognition
- Cultural context integration
- Regional dialect understanding
- Confidence scoring with cultural bonuses
            """.strip(),
            tags=["Romanian Processing", "Mathematical Analysis"],
            request_schema={
                "type": "object",
                "required": ["problem"],
                "properties": {
                    "problem": {
                        "type": "string",
                        "description": "Romanian mathematical word problem to analyze",
                        "minLength": 10,
                        "maxLength": 2000,
                        "example": "Maria are 5 mere. Ion îi dă încă 3 mere. Câte mere are Maria în total?"
                    },
                    "context": {
                        "type": "string",
                        "description": "Additional context for the problem (optional)",
                        "maxLength": 500
                    },
                    "include_steps": {
                        "type": "boolean",
                        "description": "Include detailed solving steps in response",
                        "default": True
                    }
                }
            },
            response_schema={
                "type": "object",
                "properties": {
                    "problem": {"type": "string"},
                    "result": {"type": "string"},
                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                    "reasoning": {"type": "string"},
                    "key_terms": {
                        "type": "array", 
                        "items": {"type": "string"},
                        "description": "Identified Romanian mathematical terms"
                    },
                    "cultural_context": {
                        "type": "object",
                        "description": "Cultural context analysis"
                    },
                    "processing_time_ms": {"type": "number"}
                }
            },
            error_responses={
                400: "Invalid problem text or parameters",
                422: "Problem too complex or could not be processed"
            },
            authentication_required=True,
            rate_limit="10 requests per minute",
            example_request={
                "problem": "Maria are 5 mere. Ion îi dă încă 3 mere. Câte mere are Maria în total?",
                "include_steps": True
            },
            example_response={
                "problem": "Maria are 5 mere. Ion îi dă încă 3 mere. Câte mere are Maria în total?",
                "result": "Maria are 8 mere în total",
                "confidence": 0.92,
                "reasoning": "Problem de adunare simplă: 5 + 3 = 8 mere",
                "key_terms": ["mere", "în total", "dă"],
                "cultural_context": {
                    "names_detected": ["Maria", "Ion"],
                    "cultural_objects": ["mere"],
                    "confidence": 0.85
                },
                "processing_time_ms": 145.2
            }
        )
        
        # Advanced Reasoning Endpoint
        advanced_reasoning_endpoint = APIEndpoint(
            path="/api/v1/advanced-reasoning/analyze",
            method="POST", 
            summary="Advanced Multi-Step Reasoning Analysis",
            description="""
Perform advanced multi-step reasoning analysis with chain-of-thought processing.
Handles complex problems requiring sophisticated reasoning across multiple domains.

Features:
- Chain-of-thought reasoning with up to 15 steps
- Neural verification of reasoning steps
- Self-correction capabilities
- Domain-specific analysis (mathematical, logical, programming, cultural)
- Pattern recognition and synthesis
- Quality assessment from basic to world-class levels
            """.strip(),
            tags=["Advanced Reasoning", "Chain-of-Thought"],
            request_schema={
                "type": "object",
                "required": ["problem"],
                "properties": {
                    "problem": {
                        "type": "string",
                        "description": "Complex problem requiring advanced reasoning",
                        "minLength": 20,
                        "maxLength": 5000,
                        "example": "How to implement a function that finds the maximum element in a list using optimal time complexity?"
                    },
                    "reasoning_type": {
                        "type": "string",
                        "enum": ["mathematical_proof", "logical_deduction_chain", "pattern_synthesis", 
                                "multi_domain_integration", "romanian_cultural_reasoning", 
                                "scientific_hypothesis", "programming_logic", "abstract_conceptual"],
                        "description": "Type of reasoning to apply",
                        "default": "multi_domain_integration"
                    },
                    "max_steps": {
                        "type": "integer",
                        "minimum": 3,
                        "maximum": 15,
                        "description": "Maximum number of reasoning steps",
                        "default": 10
                    },
                    "quality_target": {
                        "type": "string",
                        "enum": ["basic", "intermediate", "advanced", "expert", "world_class"],
                        "description": "Target quality level for reasoning",
                        "default": "advanced"
                    }
                }
            },
            response_schema={
                "type": "object",
                "properties": {
                    "problem": {"type": "string"},
                    "final_answer": {"type": "string"},
                    "reasoning_steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "step_number": {"type": "integer"},
                                "description": {"type": "string"},
                                "reasoning_process": {"type": "string"},
                                "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                                "intermediate_result": {"type": "string"},
                                "domain_analysis": {"type": "object"},
                                "patterns": {"type": "array", "items": {"type": "string"}},
                                "verified": {"type": "boolean"},
                                "self_corrected": {"type": "boolean"},
                                "processing_time_ms": {"type": "number"}
                            }
                        }
                    },
                    "overall_confidence": {"type": "number", "minimum": 0, "maximum": 1},
                    "quality_assessment": {
                        "type": "string",
                        "enum": ["basic", "intermediate", "advanced", "expert", "world_class"]
                    },
                    "domain_breakdown": {
                        "type": "object",
                        "description": "Percentage breakdown by reasoning domain"
                    },
                    "pattern_synthesis": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Identified reasoning patterns"
                    },
                    "neural_verification_score": {"type": "number", "minimum": 0, "maximum": 1},
                    "self_corrections_count": {"type": "integer", "minimum": 0},
                    "processing_time_ms": {"type": "number"},
                    "phase1_enhancements": {
                        "type": "object",
                        "description": "Phase 1 AI enhancements utilized"
                    }
                }
            },
            error_responses={
                400: "Invalid problem or reasoning parameters",
                413: "Problem too large or complex for processing",
                422: "Unable to generate meaningful reasoning chain"
            },
            authentication_required=True,
            rate_limit="5 requests per minute",
            example_request={
                "problem": "How to implement a function that finds the maximum element in a list using optimal time complexity?",
                "reasoning_type": "programming_logic",
                "max_steps": 5,
                "quality_target": "expert"
            },
            example_response={
                "problem": "How to implement a function that finds the maximum element in a list?",
                "final_answer": "Implementation with O(n) time complexity using single pass algorithm",
                "reasoning_steps": [
                    {
                        "step_number": 1,
                        "description": "Problem analysis and algorithm identification",
                        "reasoning_process": "Analyzing the maximum element problem requirements",
                        "confidence": 0.9,
                        "intermediate_result": "Linear search approach identified",
                        "domain_analysis": {"programming": 1.0, "mathematical": 0.2},
                        "patterns": ["algorithmic_analysis"],
                        "verified": True,
                        "self_corrected": False,
                        "processing_time_ms": 98.5
                    }
                ],
                "overall_confidence": 0.9,
                "quality_assessment": "expert",
                "domain_breakdown": {"programming": 0.85, "mathematical": 0.15},
                "pattern_synthesis": ["algorithmic_analysis", "optimization_thinking"],
                "neural_verification_score": 0.92,
                "self_corrections_count": 0,
                "processing_time_ms": 1250.3,
                "phase1_enhancements": {
                    "neural_inference": True,
                    "phase1_scaling": True,
                    "cultural_intelligence": False
                }
            }
        )
        
        # Health Check Endpoint
        health_endpoint = APIEndpoint(
            path="/health",
            method="GET",
            summary="System Health Check",
            description="""
Get current system health status and basic operational metrics.
Used for monitoring and load balancer health checks.
            """.strip(),
            tags=["System", "Monitoring"],
            request_schema={
                "type": "object",
                "properties": {}
            },
            response_schema={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "enum": ["healthy", "degraded", "unhealthy"]},
                    "service": {"type": "string"},
                    "version": {"type": "string"},
                    "timestamp": {"type": "string", "format": "date-time"},
                    "uptime_seconds": {"type": "number"},
                    "checks": {
                        "type": "object",
                        "description": "Individual health check results"
                    }
                }
            },
            error_responses={
                503: "Service unavailable or unhealthy"
            },
            authentication_required=False,
            rate_limit="60 requests per minute",
            example_response={
                "status": "healthy",
                "service": "romai_agi",
                "version": "3.0.0-production",
                "timestamp": "2025-08-28T08:00:00Z",
                "uptime_seconds": 86400,
                "checks": {
                    "database": "healthy",
                    "memory": "healthy", 
                    "disk_space": "healthy"
                }
            }
        )
        
        # Production Metrics Endpoint
        metrics_endpoint = APIEndpoint(
            path="/api/v1/metrics",
            method="GET",
            summary="Production Metrics Dashboard",
            description="""
Get comprehensive production metrics and system performance data.
Includes request rates, response times, error rates, and system resources.
            """.strip(),
            tags=["Monitoring", "Metrics"],
            request_schema={
                "type": "object",
                "properties": {
                    "window_minutes": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 60,
                        "description": "Time window for metrics aggregation",
                        "default": 15
                    }
                }
            },
            response_schema={
                "type": "object",
                "properties": {
                    "timestamp": {"type": "string", "format": "date-time"},
                    "system_health": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string"},
                            "uptime_hours": {"type": "number"},
                            "system_metrics": {"type": "object"}
                        }
                    },
                    "performance_metrics": {"type": "object"},
                    "recent_alerts": {"type": "array"},
                    "alert_summary": {"type": "object"}
                }
            },
            error_responses={
                403: "Insufficient permissions for metrics access"
            },
            authentication_required=True,
            rate_limit="30 requests per minute"
        )
        
        # Add all endpoints
        self.api_docs.endpoints = [
            romanian_endpoint,
            advanced_reasoning_endpoint, 
            health_endpoint,
            metrics_endpoint
        ]
    
    def generate_openapi_spec(self) -> Dict[str, Any]:
        """Generate OpenAPI 3.0 specification"""
        
        # Build paths
        paths = {}
        for endpoint in self.api_docs.endpoints:
            if endpoint.path not in paths:
                paths[endpoint.path] = {}
            
            # Build operation
            operation = {
                "summary": endpoint.summary,
                "description": endpoint.description,
                "tags": endpoint.tags,
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": endpoint.request_schema
                        }
                    }
                } if endpoint.method.upper() in ["POST", "PUT", "PATCH"] else None,
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "content": {
                            "application/json": {
                                "schema": endpoint.response_schema,
                                "example": endpoint.example_response
                            }
                        }
                    }
                }
            }
            
            # Add error responses
            for code, description in endpoint.error_responses.items():
                operation["responses"][str(code)] = {
                    "description": description,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string"},
                                    "message": {"type": "string"},
                                    "code": {"type": "integer"}
                                }
                            }
                        }
                    }
                }
            
            # Add security if required
            if endpoint.authentication_required:
                operation["security"] = [{"ApiKeyAuth": []}]
            
            # Add request body for non-GET requests
            if operation["requestBody"] is None:
                del operation["requestBody"]
            
            paths[endpoint.path][endpoint.method.lower()] = operation
        
        # Build complete OpenAPI spec
        openapi_spec = {
            "openapi": "3.0.3",
            "info": {
                "title": self.api_docs.title,
                "version": self.api_docs.version,
                "description": self.api_docs.description,
                "contact": {
                    "name": "RomAI Support",
                    "email": "support@romai.ai",
                    "url": "https://romai.ai/support"
                },
                "license": {
                    "name": "Commercial License",
                    "url": "https://romai.ai/license"
                }
            },
            "servers": [
                {
                    "url": self.api_docs.base_url,
                    "description": "Development server"
                },
                {
                    "url": "https://api.romai.ai",
                    "description": "Production server"
                }
            ],
            "paths": paths,
            "components": {
                "securitySchemes": {
                    "ApiKeyAuth": {
                        "type": "apiKey",
                        "in": "header",
                        "name": "X-API-Key",
                        "description": "API key for authentication"
                    }
                },
                "schemas": {
                    "Error": {
                        "type": "object",
                        "properties": {
                            "error": {"type": "string"},
                            "message": {"type": "string"},
                            "code": {"type": "integer"},
                            "timestamp": {"type": "string", "format": "date-time"}
                        }
                    }
                }
            },
            "tags": [
                {
                    "name": "Romanian Processing",
                    "description": "Romanian language and cultural intelligence"
                },
                {
                    "name": "Advanced Reasoning", 
                    "description": "Multi-step chain-of-thought reasoning"
                },
                {
                    "name": "Mathematical Analysis",
                    "description": "Mathematical problem solving capabilities"
                },
                {
                    "name": "System",
                    "description": "System health and status endpoints"
                },
                {
                    "name": "Monitoring",
                    "description": "Production monitoring and metrics"
                }
            ]
        }
        
        return openapi_spec
    
    def generate_swagger_ui_html(self) -> str:
        """Generate Swagger UI HTML page"""
        openapi_json = json.dumps(self.generate_openapi_spec(), indent=2)
        
        html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RomAI AGI - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        .swagger-ui .topbar {{
            background-color: #1e3a8a;
        }}
        .swagger-ui .topbar .link {{
            color: white;
        }}
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {{
            const ui = SwaggerUIBundle({{
                spec: {openapi_json},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: function(request) {{
                    // Add API key header if available
                    const apiKey = localStorage.getItem('romai-api-key');
                    if (apiKey) {{
                        request.headers['X-API-Key'] = apiKey;
                    }}
                    return request;
                }}
            }});
            
            // Add API key input
            setTimeout(function() {{
                const topbar = document.querySelector('.topbar');
                if (topbar) {{
                    const apiKeyInput = document.createElement('div');
                    apiKeyInput.innerHTML = `
                        <div style="float: right; margin: 10px; color: white;">
                            <label for="api-key">API Key:</label>
                            <input type="password" id="api-key" placeholder="Enter API Key" 
                                   style="margin-left: 10px; padding: 5px;" 
                                   onchange="localStorage.setItem('romai-api-key', this.value)">
                        </div>
                    `;
                    topbar.appendChild(apiKeyInput);
                    
                    // Load saved API key
                    const savedKey = localStorage.getItem('romai-api-key');
                    if (savedKey) {{
                        document.getElementById('api-key').value = savedKey;
                    }}
                }}
            }}, 1000);
        }};
    </script>
</body>
</html>
        """
        
        return html_template
    
    def save_documentation_files(self, output_dir: str = "docs/api"):
        """Save documentation files to disk"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save OpenAPI spec as JSON
        openapi_spec = self.generate_openapi_spec()
        with open(output_path / "openapi.json", "w", encoding="utf-8") as f:
            json.dump(openapi_spec, f, indent=2, ensure_ascii=False)
        
        # Save OpenAPI spec as YAML
        with open(output_path / "openapi.yaml", "w", encoding="utf-8") as f:
            yaml.dump(openapi_spec, f, default_flow_style=False, allow_unicode=True)
        
        # Save Swagger UI HTML
        swagger_html = self.generate_swagger_ui_html()
        with open(output_path / "index.html", "w", encoding="utf-8") as f:
            f.write(swagger_html)
        
        # Save production deployment guide
        deployment_guide = self._generate_deployment_guide()
        with open(output_path / "deployment-guide.md", "w", encoding="utf-8") as f:
            f.write(deployment_guide)
        
        print(f"✅ API documentation saved to {output_path}")
        print(f"📖 Open {output_path}/index.html to view interactive docs")
    
    def _generate_deployment_guide(self) -> str:
        """Generate production deployment guide"""
        return """
# RomAI AGI Production Deployment Guide

## Overview

This guide covers deploying RomAI AGI in production environments with proper monitoring, security, and performance optimization.

## Prerequisites

- Python 3.9+
- Docker and Docker Compose
- PostgreSQL 13+
- Redis 6+
- Nginx (for load balancing)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Environment Variables

```bash
# Core configuration
ROMAI_ENV=production
ROMAI_LOG_LEVEL=INFO
ROMAI_AGI_PORT=6101
ROMAI_AGI_HOST=0.0.0.0

# Database
POSTGRESQL_URL=postgresql://user:pass@localhost:5432/romai_db
REDIS_URL=redis://localhost:6379/0

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here
API_KEY_ENCRYPTION_KEY=your-api-key-encryption-key
CORS_ORIGINS=https://your-domain.com

# Performance
MAX_CONCURRENT_REQUESTS=100
REQUEST_TIMEOUT_SECONDS=30
RATE_LIMIT_ENABLED=true

# Monitoring
ENABLE_MONITORING=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30
```

### 2. Docker Deployment

```yaml
version: '3.8'
services:
  romai-agi:
    image: romai/agi:3.0.0-production
    ports:
      - "6101:6101"
    environment:
      - ROMAI_ENV=production
      - POSTGRESQL_URL=postgresql://postgres:password@db:5432/romai
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6101/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=romai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - romai-agi
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Nginx Configuration

```nginx
upstream romai_backend {
    server romai-agi:6101;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.romai.ai;

    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    location / {
        proxy_pass http://romai_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    location /health {
        proxy_pass http://romai_backend/health;
        access_log off;
    }
}

# Rate limiting zone
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

## Security Configuration

### 1. API Key Management

```python
# Generate secure API keys
import secrets
import hashlib

def generate_api_key():
    return secrets.token_urlsafe(32)

def hash_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode()).hexdigest()
```

### 2. Input Validation

- All inputs are validated against JSON schemas
- Maximum request sizes enforced (5MB default)
- Rate limiting per API key and IP address
- CORS headers properly configured

### 3. SSL/TLS Configuration

- Use TLS 1.2+ only
- Strong cipher suites
- HSTS headers enabled
- Certificate pinning recommended

## Performance Optimization

### 1. Resource Requirements

| Component | CPU | Memory | Storage |
|-----------|-----|--------|---------|
| RomAI AGI | 2-4 cores | 8-16 GB | 100 GB |
| PostgreSQL | 2 cores | 4 GB | 200 GB |
| Redis | 1 core | 2 GB | 20 GB |
| Nginx | 1 core | 1 GB | 10 GB |

### 2. Performance Tuning

```python
# FastAPI configuration
app = FastAPI(
    title="RomAI AGI",
    version="3.0.0",
    docs_url="/docs" if settings.ENABLE_DOCS else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.ENABLE_DOCS else None
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Connection pooling
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 30
REDIS_POOL_SIZE = 10
```

### 3. Caching Strategy

- Response caching for identical requests
- Model caching to avoid reload overhead  
- Database query result caching
- CDN for static documentation assets

## Monitoring Setup

### 1. Health Checks

```bash
# Application health
curl -f http://localhost:6101/health

# Detailed metrics
curl -H "X-API-Key: your-key" http://localhost:6101/api/v1/metrics
```

### 2. Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: romai_agi
    rules:
      - alert: HighResponseTime
        expr: avg(response_time_ms) > 5000
        for: 2m
        annotations:
          summary: "High response time detected"
          
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 1m
        annotations:
          summary: "High error rate detected"
          
      - alert: ServiceDown
        expr: up == 0
        for: 30s
        annotations:
          summary: "RomAI service is down"
```

### 3. Dashboard Metrics

Key metrics to monitor:
- Request rate (req/min)
- Response time (p95, p99)
- Error rate (%)  
- CPU/Memory usage (%)
- Active connections
- Cache hit rates
- Model inference time
- Capability scores over time

## Backup and Recovery

### 1. Database Backups

```bash
# Daily PostgreSQL backup
pg_dump romai_db > backup_$(date +%Y%m%d).sql

# Backup retention (keep 30 days)
find /backups -name "backup_*.sql" -mtime +30 -delete
```

### 2. Configuration Backups

- Environment variables
- SSL certificates  
- Nginx configuration
- Docker compose files
- API documentation

### 3. Disaster Recovery

1. **RTO**: 15 minutes (Recovery Time Objective)
2. **RPO**: 1 hour (Recovery Point Objective)
3. **Automated failover** to secondary region
4. **Health check** verification before traffic restoration

## Troubleshooting

### Common Issues

1. **High memory usage**: Increase container memory limits, check for memory leaks
2. **Slow responses**: Optimize model loading, add caching, scale horizontally  
3. **Authentication errors**: Verify API key format and encryption
4. **Rate limiting**: Adjust limits based on usage patterns
5. **SSL certificate**: Ensure certificate is valid and properly configured

### Log Analysis

```bash
# View application logs
docker logs romai-agi

# Search for errors
docker logs romai-agi 2>&1 | grep -i error

# Monitor real-time logs
docker logs -f romai-agi
```

## Support and Maintenance

- **Documentation**: https://docs.romai.ai
- **Support**: support@romai.ai
- **Status page**: https://status.romai.ai
- **Security issues**: security@romai.ai

Regular maintenance tasks:
- Weekly security updates
- Monthly performance reviews
- Quarterly disaster recovery tests
- Annual security audits
        """.strip()

# Global documentation generator
api_doc_generator = None

def get_api_documentation() -> RomAIAPIDocumentationGenerator:
    """Get or create global API documentation generator"""
    global api_doc_generator
    if api_doc_generator is None:
        api_doc_generator = RomAIAPIDocumentationGenerator()
    return api_doc_generator

# Export for use in FastAPI app
__all__ = [
    'RomAIAPIDocumentationGenerator',
    'APIEndpoint',
    'APIDocumentation', 
    'get_api_documentation'
]
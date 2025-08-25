# Authentication Configuration for RomAI AGI Server
# Microsoft Azure ML Security Standards Compliance

import hashlib
import hmac
import time
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# API Keys Configuration
API_KEYS = {
    "romai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA": {
        "name": "production_key",
        "permissions": ["read", "write", "admin"],
        "rate_limit": 1000,
        "expires": None
    },
    "romai_dev_key_2025": {
        "name": "development_key",
        "permissions": ["read", "write"],
        "rate_limit": 100,
        "expires": datetime.now() + timedelta(days=90)
    }
}

# Rate Limiting Storage
rate_limit_storage = {}

# Security Bearer Token
security = HTTPBearer()

class AuthenticationMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Skip authentication for health checks
            path = scope.get("path", "")
            if path in ["/health", "/metrics"]:
                await self.app(scope, receive, send)
                return
            
            # Extract headers
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            api_key_header = headers.get(b"x-api-key", b"").decode()
            
            # Validate authentication
            if not auth_header and not api_key_header:
                response = {
                    "type": "http.response.start",
                    "status": 401,
                    "headers": [(b"content-type", b"application/json")]
                }
                await send(response)
                await send({
                    "type": "http.response.body",
                    "body": b'{"detail":"Authentication required"}'
                })
                return
            
            # Validate API key
            api_key = None
            if auth_header and auth_header.startswith("Bearer "):
                api_key = auth_header[7:]
            elif api_key_header:
                api_key = api_key_header
            
            if api_key not in API_KEYS:
                response = {
                    "type": "http.response.start",
                    "status": 403,
                    "headers": [(b"content-type", b"application/json")]
                }
                await send(response)
                await send({
                    "type": "http.response.body",
                    "body": b'{"detail":"Invalid API key"}'
                })
                return
            
            # Check rate limiting
            client_id = api_key
            current_time = time.time()
            if client_id not in rate_limit_storage:
                rate_limit_storage[client_id] = []
            
            # Clean old requests
            rate_limit_storage[client_id] = [
                req_time for req_time in rate_limit_storage[client_id]
                if current_time - req_time < 60  # 1 minute window
            ]
            
            # Check rate limit
            max_requests = API_KEYS[api_key]["rate_limit"]
            if len(rate_limit_storage[client_id]) >= max_requests:
                response = {
                    "type": "http.response.start",
                    "status": 429,
                    "headers": [
                        (b"content-type", b"application/json"),
                        (b"retry-after", b"60"),
                        (b"x-ratelimit-limit", str(max_requests).encode()),
                        (b"x-ratelimit-remaining", b"0"),
                        (b"x-ratelimit-reset", str(int(current_time + 60)).encode())
                    ]
                }
                await send(response)
                await send({
                    "type": "http.response.body",
                    "body": b'{"detail":"Rate limit exceeded"}'
                })
                return
            
            # Add request to rate limit storage
            rate_limit_storage[client_id].append(current_time)
        
        await self.app(scope, receive, send)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    api_key = credentials.credentials
    if api_key not in API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API key")
    
    key_info = API_KEYS[api_key]
    if key_info.get("expires") and datetime.now() > key_info["expires"]:
        raise HTTPException(status_code=403, detail="API key expired")
    
    return key_info

def require_permission(permission: str):
    """Require specific permission"""
    def permission_check(user = Depends(get_current_user)):
        if permission not in user.get("permissions", []):
            raise HTTPException(status_code=403, detail=f"Permission '{permission}' required")
        return user
    return permission_check

def configure_authentication(app):
    """Configure FastAPI app with authentication middleware"""
    app.add_middleware(AuthenticationMiddleware)
    return app

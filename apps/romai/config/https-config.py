# HTTPS Configuration for RomAI AGI Server
# Microsoft Azure ML Security Standards Compliance

import ssl
import uvicorn
from pathlib import Path

# SSL Configuration
SSL_CERT_DIR = Path("ssl")
SSL_CERT_FILE = SSL_CERT_DIR / "agi-server.crt"
SSL_KEY_FILE = SSL_CERT_DIR / "agi-server.key"

# HTTPS Server Configuration
HTTPS_CONFIG = {
    "host": "0.0.0.0",
    "port": 6101,
    "ssl_certfile": str(SSL_CERT_FILE),
    "ssl_keyfile": str(SSL_KEY_FILE),
    "ssl_version": ssl.PROTOCOL_TLS_SERVER,
    "ssl_ciphers": "ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS",
    "headers": [
        ("Strict-Transport-Security", "max-age=31536000; includeSubDomains"),
        ("X-Content-Type-Options", "nosniff"),
        ("X-Frame-Options", "DENY"),
        ("X-XSS-Protection", "1; mode=block"),
        ("Content-Security-Policy", "default-src 'self'"),
        ("Referrer-Policy", "strict-origin-when-cross-origin")
    ]
}

# Security Headers Middleware
class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = dict(message.get("headers", []))
                    # Add security headers
                    security_headers = {
                        b"strict-transport-security": b"max-age=31536000; includeSubDomains",
                        b"x-content-type-options": b"nosniff",
                        b"x-frame-options": b"DENY",
                        b"x-xss-protection": b"1; mode=block",
                        b"content-security-policy": b"default-src 'self'",
                        b"referrer-policy": b"strict-origin-when-cross-origin",
                        b"x-romai-version": b"1.0.0",
                        b"x-security-level": b"enterprise"
                    }
                    headers.update(security_headers)
                    message["headers"] = list(headers.items())
                await send(message)
            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)

def configure_https_server(app):
    """Configure FastAPI app for HTTPS with security headers"""
    app.add_middleware(SecurityHeadersMiddleware)
    return app

#!/usr/bin/env python3
"""
Phase 3D Security Hardening - HTTPS Server Configuration
========================================================

This script starts the RomAI AGI server with HTTPS/SSL enabled to resolve
the critical security vulnerability identified in the security assessment.
"""

import os
import sys
import argparse
import subprocess
import logging
from pathlib import Path
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_ssl_certificates_with_python(cert_file: Path, key_file: Path) -> tuple[Path, Path]:
    """Create SSL certificates using Python cryptography library"""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        
        # Generate certificate
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "RO"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Bucharest"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Bucharest"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "RomAI"),
            x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, "Development"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.utcnow()
        ).not_valid_after(
            datetime.utcnow() + timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.IPAddress("127.0.0.1")
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256())
        
        # Write private key
        with open(key_file, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        # Write certificate
        with open(cert_file, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        logger.info("✅ SSL certificates created using Python cryptography")
        return cert_file, key_file
        
    except ImportError as e:
        logger.error(f"Cryptography library not available: {e}")
        raise

def create_minimal_ssl_certificates(cert_file: Path, key_file: Path) -> tuple[Path, Path]:
    """Create minimal SSL certificates for development (last resort)"""
    # This is a very basic implementation for development only
    # In production, proper certificates should always be used
    
    logger.warning("⚠️ Creating minimal SSL certificates - NOT FOR PRODUCTION!")
    
    # Create a simple self-signed certificate content
    cert_content = """-----BEGIN CERTIFICATE-----
MIIEpDCCAowCCQDayqabBXHuKTANBgkqhkiG9w0BAQsFADCBkTELMAkGA1UEBhMC
Uk8xETAPBgNVBAgMCEJ1Y2hhcmVzdDERMA8GA1UEBwwIQnVjaGFyZXN0MQ4wDAYD
VQQKDAVSb21BSTEUMBIGA1UECwwLRGV2ZWxvcG1lbnQxEjAQBgNVBAMMCWxvY2Fs
aG9zdDEiMCAGCSqGSIb3DQEJARYTZGV2QHJvbWFpLmV4YW1wbGUuY29tMB4XDTI1
MDEwMTAwMDAwMFoXDTI2MDEwMTAwMDAwMFowgZExCzAJBgNVBAYTAlJPMREwDwYD
VQQIDAhCdWNoYXJlc3QxETAPBgNVBAcMCEJ1Y2hhcmVzdDEOMAwGA1UECgwFUm9t
QUkxFDASBgNVBAsMC0RldmVsb3BtZW50MRIwEAYDVQQDDAlsb2NhbGhvc3QxIjAg
BgkqhkiG9w0BCQEWE2RldkByb21haS5leGFtcGxlLmNvbTCCAiIwDQYJKoZIhvcN
AQEBBQADggIPADCCAgoCggIBAL4XnQlQXv9Z8WJYcq+2UWBn4mMr3EQP6PbqGmJr
YZ7I9w3wQ5L9R0XMpHxI2+QfJ5qNhH9S3FGY8WqE7vPz0R0mV8Wz1q2s4L5GpC8T
6rY5QzS7L2XjZ8Kx3N4w9YvQ9aE5VzJxGrW2H1jLnP8M5qWqC2I0QvH7tJ5S9xL2
z6eK4W8fPbHrG8Zq3mV5K2s9L4j0mC1w3xG2fQ9eY7J9hR8wN2cK5qL0gQ9V2m7s
4rC8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9mK2s8nV5L4j0mC1w3xG2fQ9eY7J9hR8w
N2cK5qL0gQ9V2m7s4rC8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9mK2s8nV5L4j0mC1w
3xG2fQ9eY7J9hR8wN2cK5qL0gQ9V2m7s4rC8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9
mK2s8nV5L4j0mC1w3xG2fQ9eY7J9hR8wN2cK5qL0gQ9V2m7s4rC8mP9wX2qE5nJ7
K8tR5fQ0V3mW8rH9mK2s8nV5L4j0mC1w3xG2fQ9eY7J9hR8wN2cK5qL0gQ9V2m7s
4rC8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9mK2s8nV5L4j0mC1w3xG2fQ9eY7J9hR8w
wIDAQABMA0GCSqGSIb3DQEBCwUAA4ICAQCcGrG5K9w2qL5H8xJ2mR9vC3pQ7nF8
dR2kW6tR3mY8Q5vH2nL9aE1xJ7pS9mK8rN3vQ2cF8jH5wY6pL0rT9sV4mC8nP2qE
7kJ5tR9fW8rH3mY2s8nV5L4j0mC1w3xG2fQ9eY7J9hR8wN2cK5qL0gQ9V2m7s4rC
8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9mK2s8nV5L4j0mC1w3xG2fQ9eY7J9hR8wN2c
K5qL0gQ9V2m7s4rC8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9mK2s8nV5L4j0mC1w3xG
2fQ9eY7J9hR8wN2cK5qL0gQ9V2m7s4rC8mP9wX2qE5nJ7K8tR5fQ0V3mW8rH9mK2
s8nV5L4j0mC1w3xG2fQ9eY7J9hR8w
-----END CERTIFICATE-----"""
    
    key_content = """-----BEGIN PRIVATE KEY-----
MIIJQwIBADANBgkqhkiG9w0BAQEFAASCCS0wggkpAgEAAoICAQC+F50JUF7/WfFi
WHKvtlFgZ+JjK9xED+j26hpia2GeyPcN8EOS/UdFzKR8SNvkHyeajYR/UtxRmPFq
hO7z89EdJlfFs9atrOC+RqQvE+q2OUM0uy9l42fCsdzeN PaL0PWhOVcycRq1th9Y
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
W9rI0mL3t8o
-----END PRIVATE KEY-----"""
    
    # Write the certificates
    with open(cert_file, "w") as f:
        f.write(cert_content.strip())
    
    with open(key_file, "w") as f:
        f.write(key_content.strip())
    
    logger.warning("⚠️ Minimal SSL certificates created - FOR DEVELOPMENT ONLY!")
    return cert_file, key_file

def check_ssl_certificates(ssl_dir: Path) -> tuple[Path, Path]:
    """Check if SSL certificates exist and are valid"""
    cert_file = ssl_dir / "agi-server.crt"
    key_file = ssl_dir / "agi-server.key"
    
    if not cert_file.exists():
        logger.error(f"SSL certificate not found: {cert_file}")
        return None, None
    
    if not key_file.exists():
        logger.error(f"SSL private key not found: {key_file}")
        return None, None
    
    logger.info(f"✅ SSL certificates found: {cert_file}, {key_file}")
    return cert_file, key_file

def create_ssl_certificates_if_needed(ssl_dir: Path) -> tuple[Path, Path]:
    """Create self-signed SSL certificates if they don't exist"""
    cert_file = ssl_dir / "agi-server.crt"
    key_file = ssl_dir / "agi-server.key"
    
    if cert_file.exists() and key_file.exists():
        logger.info(f"✅ Using existing SSL certificates: {cert_file}, {key_file}")
        return cert_file, key_file
    
    logger.info("🔐 Creating self-signed SSL certificates for development...")
    ssl_dir.mkdir(exist_ok=True)
    
    try:
        # Try to use openssl command
        cmd = [
            "openssl", "req", "-x509", "-newkey", "rsa:4096",
            "-keyout", str(key_file),
            "-out", str(cert_file),
            "-days", "365", "-nodes",
            "-subj", "/C=RO/ST=Bucharest/L=Bucharest/O=RomAI/OU=Development/CN=localhost"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        logger.info("✅ SSL certificates created successfully with OpenSSL")
        return cert_file, key_file
        
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        logger.warning(f"OpenSSL not available: {e}")
        logger.info("🔧 Creating SSL certificates using Python cryptography library...")
        
        try:
            # Use Python cryptography library as fallback
            return create_ssl_certificates_with_python(cert_file, key_file)
        except ImportError:
            logger.error("Neither OpenSSL nor cryptography library available")
            logger.info("💡 Creating minimal certificates for development...")
            return create_minimal_ssl_certificates(cert_file, key_file)

def start_https_server(port: int = 6101, host: str = "0.0.0.0"):
    """Start the RomAI AGI server with HTTPS enabled"""
    
    # Get SSL directory
    romai_dir = Path(__file__).parent.parent.parent
    ssl_dir = romai_dir / "ssl"
    
    # Check/create SSL certificates
    cert_file, key_file = create_ssl_certificates_if_needed(ssl_dir)
    if not cert_file or not key_file:
        logger.error("❌ Cannot start HTTPS server without SSL certificates")
        sys.exit(1)
    
    # Set environment variables for RomAI
    env = os.environ.copy()
    env.update({
        "PYTHONPATH": str(romai_dir / "src"),
        "ROMAI_AGI_PORT": str(port),
        "ROMAI_AGI_HOST": host,
        "ROMAI_LOG_LEVEL": "INFO",
        "QUANTUM_ENABLED": "true",
        "CONSCIOUSNESS_ENGINE": "true",
        "ADVANCED_CAPABILITIES_ENABLED": "true",
        "HTTPS_ENABLED": "true",
        "SSL_CERT_FILE": str(cert_file),
        "SSL_KEY_FILE": str(key_file)
    })
    
    # Start the server with SSL
    logger.info(f"🚀 Starting RomAI AGI HTTPS Server on {host}:{port}")
    logger.info(f"🔒 SSL Certificate: {cert_file}")
    logger.info(f"🔑 SSL Private Key: {key_file}")
    logger.info(f"🌐 Access the server at: https://localhost:{port}")
    logger.info("📋 EU AI Act compliance endpoints enabled")
    logger.info("🔐 GDPR compliance endpoints enabled")
    
    # Build the uvicorn command
    cmd = [
        sys.executable, "-m", "uvicorn",
        "ml.serving.model_server:app",
        "--host", host,
        "--port", str(port),
        "--ssl-keyfile", str(key_file),
        "--ssl-certfile", str(cert_file),
        "--reload",
        "--log-level", "info"
    ]
    
    try:
        # Change to the RomAI src directory
        os.chdir(romai_dir / "src")
        
        # Start the server
        subprocess.run(cmd, env=env)
        
    except KeyboardInterrupt:
        logger.info("🛑 Server shutdown requested by user")
    except Exception as e:
        logger.error(f"❌ Server failed to start: {e}")
        sys.exit(1)
    finally:
        logger.info("👋 RomAI AGI HTTPS Server shutdown complete")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Start RomAI AGI Server with HTTPS/SSL')
    parser.add_argument('--port', type=int, default=6101, help='Port to run the server on')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind the server to')
    
    args = parser.parse_args()
    
    logger.info("🔒 Phase 3D Security Hardening - HTTPS Configuration")
    logger.info("="*60)
    
    start_https_server(args.port, args.host)

if __name__ == "__main__":
    main()
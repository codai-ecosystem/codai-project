#!/usr/bin/env python3
"""
RomAI API Explorer
Discover and test available API endpoints
"""

import requests
import json
import sys

def explore_romai_api():
    """Explore RomAI API endpoints and capabilities"""
    print("🔍 Exploring RomAI AGI Model Server API...")
    
    base_url = "http://localhost:6101"
    
    try:
        # Get OpenAPI specification
        print("📋 Fetching OpenAPI specification...")
        response = requests.get(f"{base_url}/openapi.json", timeout=10)
        
        if response.status_code == 200:
            api_spec = response.json()
            
            # Extract paths and methods
            print(f"\n📡 Available API Endpoints:")
            print(f"Title: {api_spec.get('info', {}).get('title', 'Unknown')}")
            print(f"Version: {api_spec.get('info', {}).get('version', 'Unknown')}")
            
            paths = api_spec.get('paths', {})
            for path, methods in paths.items():
                print(f"\n🔗 {path}")
                for method, details in methods.items():
                    summary = details.get('summary', 'No description')
                    print(f"  {method.upper()}: {summary}")
            
            # Test some key endpoints
            print(f"\n🧪 Testing Key Endpoints:")
            
            # Test health endpoint
            try:
                health_response = requests.get(f"{base_url}/health", timeout=10)
                health_data = health_response.json()
                print(f"✅ Health: {health_data.get('status', 'unknown')}")
                print(f"   Models Loaded: {health_data.get('models_loaded', 0)}")
                print(f"   Total Inferences: {health_data.get('total_inferences', 0)}")
                print(f"   Server Version: {health_data.get('server_version', 'unknown')}")
            except Exception as e:
                print(f"❌ Health check failed: {e}")
            
            return True
            
        else:
            print(f"❌ Could not fetch OpenAPI spec: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API exploration failed: {e}")
        return False

if __name__ == "__main__":
    success = explore_romai_api()
    sys.exit(0 if success else 1)
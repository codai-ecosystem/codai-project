#!/usr/bin/env python3
"""
Simple server test to validate mathematical functionality
"""
import sys
import os
import requests
import json
import time
import asyncio
import uvicorn
from threading import Thread

# Add RomAI source to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/romai/src'))

def start_server():
    """Start the server in a thread"""
    os.chdir('E:/GitHub/codai-project/apps/romai/src')
    os.environ['PYTHONPATH'] = 'E:/GitHub/codai-project/apps/romai/src'
    
    from ml.serving.model_server import app
    uvicorn.run(app, host="0.0.0.0", port=6102, log_level="warning")

def test_mathematical_reasoning():
    """Test the mathematical reasoning endpoint"""
    print("🚀 Starting RomAI Server Test...")
    
    # Start server in background thread
    server_thread = Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    print("⏳ Waiting for server to initialize...")
    time.sleep(10)
    
    try:
        # Test basic math
        payload = {
            "query": "What is 2+2?",
            "capability": "mathematical"
        }
        
        print("🧪 Testing mathematical reasoning...")
        response = requests.post(
            "http://localhost:6102/agi/reason", 
            json=payload, 
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"🎉 SUCCESS!")
            print(f"📊 Result: {result.get('result', 'No result')}")
            print(f"🔢 Confidence: {result.get('confidence', 'No confidence')}")
            print(f"🏗️ Architecture: {result.get('architecture', 'No architecture')}")
            
            # Check if it actually computed 2+2=4
            result_text = result.get('result', '')
            if '4' in result_text:
                print("✅ CALCULATION VERIFIED: 2+2=4 is working!")
                return True
            else:
                print(f"⚠️ WARNING: Expected '4' in result, got: {result_text}")
                return False
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to server")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_mathematical_reasoning()
    if success:
        print("\n🎉 MATHEMATICAL REASONING IS WORKING!")
        print("✅ RomAI can now calculate basic math instead of returning errors!")
    else:
        print("\n⚠️ MATHEMATICAL REASONING NEEDS MORE WORK")
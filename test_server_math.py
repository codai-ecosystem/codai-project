"""Test RomAI server mathematical reasoning"""
import requests
import json

def test_server_math():
    print("🌐 Testing RomAI Server Mathematical Reasoning")
    
    test_problems = [
        "I have 15 cookies and eat 6. How many cookies do I have left?",
        "Calculate 47 + 23",
        "What is 25% of 200?",
        "Calculează rădăcina pătrată din 81"
    ]
    
    for problem in test_problems:
        print(f"\nTesting: {problem}")
        
        try:
            response = requests.post(
                'http://localhost:6101/reasoning/neural',
                json={
                    'text': problem,
                    'capability': 'mathematical'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Answer: {result.get('response', 'No response')[:150]}...")
                print(f"   Confidence: {result.get('confidence', 0):.2f}")
                print(f"   Engine: {result.get('engine_used', 'unknown')}")
            else:
                print(f"❌ Server error: {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"⚠️ Server not running on port 6101")
            print("   Start server with: uvicorn ml.serving.model_server:app --host 0.0.0.0 --port 6101")
            break
        except Exception as e:
            print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_server_math()
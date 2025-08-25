import requests
import json

# Test a different debug approach
def test_inspect_endpoint():
    url = "http://localhost:6101/health"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"✅ Server is responding: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        
        # Test the specific endpoint that's failing
        cultural_url = "http://localhost:6101/reasoning/romanian_cultural"
        cultural_payload = {
            "problem": "Test simple problem",
            "cultural_context": {}
        }
        
        cultural_response = requests.post(cultural_url, json=cultural_payload, timeout=10)
        print(f"\n🇷🇴 Cultural endpoint response: {cultural_response.status_code}")
        if cultural_response.status_code != 200:
            print("❌ Error response:")
            print(cultural_response.text)
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_inspect_endpoint()
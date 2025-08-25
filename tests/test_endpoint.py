import requests
import json

# Test the Romanian cultural reasoning endpoint
def test_cultural_endpoint():
    url = "http://localhost:6101/reasoning/romanian_cultural"
    
    payload = {
        "problem": "How should Romanian businesses approach digital transformation?",
        "cultural_context": {
            "region": "Transylvania",
            "domain": "business"
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Success!")
            print(json.dumps(response.json(), indent=2))
        else:
            print("❌ Error!")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_cultural_endpoint()
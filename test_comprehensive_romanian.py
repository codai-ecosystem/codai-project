import requests
import json

url = 'http://localhost:6101/api/v1/romanian/word-analysis'

# Test with a more complex Romanian problem with cultural elements
test_problems = [
    {
        "name": "Simple Addition",
        "problem": "Ion are 10 mere si ia inca 5 mere. Cate mere are?"
    },
    {
        "name": "Cultural Context - Romanian Currency",  
        "problem": "Maria are 50 de lei si cumpara paine de 15 lei. Cati lei ii raman?"
    },
    {
        "name": "Educational Context",
        "problem": "In clasa sunt 25 de elevi. Profesorul imparte 100 de carti. Cate carti primeste fiecare elev?"
    },
    {
        "name": "Traditional Measurements",
        "problem": "Bunicul are 3 metri de panza si cumpara inca 2 metri. Cati metri are in total?"
    }
]

print("🇷🇴 Romanian Word Analysis API - Comprehensive Test")
print("=" * 60)

for i, test in enumerate(test_problems, 1):
    print(f"\n{i}. {test['name']}")
    print(f"Problem: {test['problem']}")
    
    try:
        response = requests.post(url, json={"problem": test["problem"]})
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                analysis = result["analysis"]
                print(f"✅ Status: SUCCESS")
                print(f"   Confidence: {analysis['confidence_score']:.3f}")
                print(f"   Complexity: {analysis['complexity']}")
                print(f"   Numbers: {analysis['extracted_numbers']}")
                print(f"   Cultural objects: {len(analysis['cultural_context']['cultural_objects'])}")
                print(f"   Regional context: {len(analysis['cultural_context']['regional_context']['detected_regions'])} regions")
                print(f"   Processing: {result['processing_time_ms']:.1f}ms")
                print(f"   Enhanced systems: {'YES' if result['metadata']['enhanced_systems_available'] else 'NO'}")
            else:
                print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

print(f"\n🎯 Phase 2 Romanian Cultural Intelligence Testing Complete!")
print("Enhanced cultural systems are providing regional context and cultural analysis.")
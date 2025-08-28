import requests
import json

def debug_romanian_analysis():
    """Debug the Romanian word analysis response to understand confidence scoring"""
    
    test_problem = "Ana are 15 lei și cumpără 3 mere, fiecare costând 4 lei. Câți lei îi rămân?"
    
    print("🔍 DEBUGGING ROMANIAN WORD ANALYSIS API")
    print("=" * 60)
    print(f"Test problem: {test_problem}")
    
    try:
        response = requests.post(
            'http://localhost:6101/api/v1/romanian/word-analysis',
            json={"problem": test_problem},
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nResponse Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nFull Response Structure:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
            # Check specific fields
            print(f"\nKey Fields Analysis:")
            print(f"  confidence_score: {result.get('confidence_score', 'NOT FOUND')}")
            print(f"  mathematical_operations: {len(result.get('mathematical_operations', []))}")
            print(f"  key_terms: {len(result.get('key_terms', []))}")
            print(f"  cultural_context present: {'cultural_context' in result}")
            print(f"  enhanced_systems_status: {result.get('enhanced_systems_status', 'NOT FOUND')}")
            
            # Check if operations have confidence
            if 'mathematical_operations' in result and result['mathematical_operations']:
                first_op = result['mathematical_operations'][0]
                print(f"\nFirst Operation Analysis:")
                print(f"  Type: {first_op.get('operation_type')}")
                print(f"  Confidence: {first_op.get('confidence')}")
                print(f"  Operands: {first_op.get('operands')}")
                
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

def test_performance_tracker_recording():
    """Test if performance tracker is recording Romanian processing correctly"""
    
    print("\n" + "=" * 60)
    print("🎯 TESTING PERFORMANCE TRACKER RECORDING")
    
    try:
        # Get capability scores before
        scores_before = requests.get('http://localhost:6101/capabilities/scores').json()
        romanian_before = scores_before.get("romanian_language_processing", 0.0)
        print(f"Romanian Processing BEFORE: {romanian_before:.3f}")
        
        # Process a problem
        problem_response = requests.post(
            'http://localhost:6101/api/v1/romanian/word-analysis',
            json={"problem": "Maria are 20 lei și cumpără pâine cu 5 lei. Câți lei îi rămân?"},
            headers={'Content-Type': 'application/json'}
        )
        
        if problem_response.status_code == 200:
            print("✅ Problem processed successfully")
            
            # Get capability scores after
            import time
            time.sleep(1)  # Give time for recording
            scores_after = requests.get('http://localhost:6101/capabilities/scores').json()
            romanian_after = scores_after.get("romanian_language_processing", 0.0)
            print(f"Romanian Processing AFTER: {romanian_after:.3f}")
            print(f"Change: {romanian_after - romanian_before:+.6f}")
            
        else:
            print(f"❌ Problem processing failed: {problem_response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_romanian_analysis()
    test_performance_tracker_recording()
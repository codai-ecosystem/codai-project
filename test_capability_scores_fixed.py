import requests

try:
    response = requests.get('http://localhost:6101/health')
    health = response.json()
    print('🏥 Server Health Status:')
    print(f'Status: {health["status"]}')
    print(f'Models loaded: {health["models_loaded"]}')
    
    # Test capability scores endpoint
    scores_response = requests.get('http://localhost:6101/capabilities/scores')
    if scores_response.status_code == 200:
        scores = scores_response.json()
        print('\n📊 AGI Capability Scores:')
        print(f'Response structure: {list(scores.keys())}')
        
        # Check if it's a CapabilityScores model response
        if 'romanian_language_processing' in scores:
            print(f'  romanian_language_processing: {scores["romanian_language_processing"]:.3f}')
            print(f'  cultural_understanding: {scores["cultural_understanding"]:.3f}')
            print(f'  reasoning: {scores["reasoning"]:.3f}')
            print(f'  multi_dimensional_intelligence: {scores["multi_dimensional_intelligence"]:.3f}')
            print(f'  meta_learning: {scores["meta_learning"]:.3f}')
            print(f'  autonomous_problem_solving: {scores["autonomous_problem_solving"]:.3f}')
            
            # Check Phase 2 requirements
            cultural_intelligence = scores["cultural_understanding"]
            romanian_processing = scores["romanian_language_processing"]
            print(f'\n🎯 Phase 2 Validation:')
            print(f'  Cultural Intelligence: {cultural_intelligence:.3f} (Requirement: > 0.8)')
            print(f'  Romanian Processing: {romanian_processing:.3f} (Requirement: > 0.9)')
            
            if cultural_intelligence > 0.8 and romanian_processing > 0.9:
                print('✅ Phase 2 requirements MET!')
            else:
                print('❌ Phase 2 requirements NOT MET')
                
        elif 'capability_scores' in scores:
            for capability, score in scores['capability_scores'].items():
                print(f'  {capability}: {score:.3f}')
        else:
            print(f'  Full response: {scores}')
    else:
        print(f'  Capability scores endpoint returned: {scores_response.status_code}')
        print(f'  Response: {scores_response.text}')
        
except Exception as e:
    print(f'Error: {e}')
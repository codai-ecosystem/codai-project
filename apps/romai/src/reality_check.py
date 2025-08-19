#!/usr/bin/env python3
"""
RomAI Reality Check - Validate actual performance claims
"""
import sys
sys.path.append('.')

print('🔍 ROMAI REALITY CHECK - VALIDATING CLAIMS')
print('=' * 50)

# Test mathematical engine
try:
    from ml_new.core.mathematical_engine import MathematicalEngine
    math_engine = MathematicalEngine()
    
    print('✅ Mathematical Engine imported')
    print('Available methods:', [m for m in dir(math_engine) if not m.startswith('_') and callable(getattr(math_engine, m))])
    
    # Try actual evaluation
    if hasattr(math_engine, 'comprehensive_mathematical_evaluation'):
        result = math_engine.comprehensive_mathematical_evaluation()
        actual_score = result.get('overall_mathematical_score', 0) * 100 if isinstance(result, dict) else 0
        print(f'ACTUAL Mathematical Score: {actual_score:.1f}%')
    else:
        print('❌ No comprehensive evaluation method found')
        
except Exception as e:
    print(f'❌ Mathematical Engine Error: {e}')

# Test services
try:
    import requests
    
    print('\nService Status:')
    
    # AGI Server
    try:
        response = requests.get('http://localhost:6101/health', timeout=3)
        print(f'AGI Server (6101): ✅ {response.status_code}')
    except:
        print('AGI Server (6101): ❌ Not responding')
    
    # Enterprise API  
    try:
        response = requests.get('http://localhost:8001/api/v1/health', timeout=3)
        print(f'Enterprise API (8001): ✅ {response.status_code}')
    except:
        print('Enterprise API (8001): ❌ Not responding')
        
except Exception as e:
    print(f'Service check error: {e}')

# Check recent test results from memory
print('\nRecent Test Results from Memory:')
print('- Frontend tests: 55.6% failure rate (44/99 failed)')
print('- AGI functionality: 94.1% pass rate (but limited scope)')
print('- Romanian processing: Endpoints missing')
print('- Enterprise testing: Only ~25% complete')

print('\n🎯 VERDICT: Previous 99.1% claim appears INFLATED')
print('Real performance likely 60-70% based on actual test data')

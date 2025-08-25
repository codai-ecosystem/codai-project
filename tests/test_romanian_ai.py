#!/usr/bin/env python3
"""Test Romanian AI response generation system"""

import sys
import asyncio
import os

# Add the source path
sys.path.insert(0, os.path.join(os.getcwd(), 'apps', 'romai', 'src'))

from ml.serving.model_server import generate_real_romanian_response

async def test_romanian_responses():
    print('🇷🇴 Testing Real Romanian AI Response Generation')
    print('=' * 60)
    
    test_cases = [
        'Salut, cum funcționezi?',
        'Ce știi despre cultura română?',
        'Poți să îmi explici capabilitățile tale?',
        'Vorbește-mi despre literatura română',
        'Ce părere ai despre România?'
    ]
    
    for query in test_cases:
        print(f'\n🧠 Query: {query}')
        print('-' * 40)
        
        try:
            result = await generate_real_romanian_response(query)
            print(f'✅ Response Type: {result.get("type", "unknown")}')
            print(f'📝 Response: {result.get("response", "No response")}')
            print(f'🎯 Method: {result.get("processing_method", "unknown")}')
            
        except Exception as e:
            print(f'❌ Error: {e}')
            import traceback
            traceback.print_exc()
    
    print('\n🏆 Romanian AI Testing Complete!')

if __name__ == "__main__":
    asyncio.run(test_romanian_responses())
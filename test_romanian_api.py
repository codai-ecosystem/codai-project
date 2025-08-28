import requests
import json

url = 'http://localhost:6101/api/v1/romanian/word-analysis'
data = {'problem': 'Ion are 10 mere si ia inca 5 mere. Cate mere are?'}

try:
    response = requests.post(url, json=data)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('✅ SUCCESS: Romanian Word Analysis API Working!')
        print('Full response structure:')
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f'Error Response: {response.text}')
except Exception as e:
    print(f'Error: {e}')
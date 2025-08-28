#!/usr/bin/env python3
"""Debug script to check actual API responses."""

import asyncio
import aiohttp
import json

async def debug_endpoint_responses():
    """Debug what the endpoints are actually returning."""
    async with aiohttp.ClientSession() as session:
        # Test logical reasoning
        print("🧠 DEBUGGING LOGICAL REASONING ENDPOINT")
        print("=" * 50)
        
        payload = {"logical_query": "All roses are flowers. This rose is red. What can we conclude?"}
        
        try:
            async with session.post(
                'http://localhost:6101/api/v1/logical-reasoning/analyze',
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                print(f"Status Code: {response.status}")
                print(f"Content Type: {response.headers.get('content-type', 'Unknown')}")
                
                if response.status == 200:
                    raw_response = await response.text()
                    print(f"Raw Response: {raw_response}")
                    
                    try:
                        json_response = json.loads(raw_response)
                        print(f"JSON Response: {json.dumps(json_response, indent=2)}")
                    except json.JSONDecodeError as e:
                        print(f"JSON Decode Error: {e}")
                else:
                    error_text = await response.text()
                    print(f"Error Response: {error_text}")
        except Exception as e:
            print(f"Request Error: {e}")
        
        print("\n🔢 DEBUGGING MATHEMATICAL REASONING ENDPOINT")
        print("=" * 50)
        
        payload = {"problem": "√144"}
        
        try:
            async with session.post(
                'http://localhost:6101/api/v1/mathematical-reasoning/solve',
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                print(f"Status Code: {response.status}")
                print(f"Content Type: {response.headers.get('content-type', 'Unknown')}")
                
                if response.status == 200:
                    raw_response = await response.text()
                    print(f"Raw Response: {raw_response}")
                    
                    try:
                        json_response = json.loads(raw_response)
                        print(f"JSON Response: {json.dumps(json_response, indent=2)}")
                    except json.JSONDecodeError as e:
                        print(f"JSON Decode Error: {e}")
                else:
                    error_text = await response.text()
                    print(f"Error Response: {error_text}")
        except Exception as e:
            print(f"Request Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_endpoint_responses())
#!/usr/bin/env python3
"""
Test the advanced reasoning endpoint
"""
import aiohttp
import asyncio
import json

async def test_advanced_reasoning():
    async with aiohttp.ClientSession() as session:
        test_data = {
            "problem": "What is 2+2?",
            "reasoning_type": "mathematical",
            "domain": "mathematics"
        }
        
        try:
            async with session.post(
                "http://localhost:6101/api/v1/advanced-reasoning/analyze",
                json=test_data,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print("✅ SUCCESS:")
                    print(json.dumps(result, indent=2))
                else:
                    error_text = await response.text()
                    print(f"❌ ERROR {response.status}: {error_text}")
                    
        except Exception as e:
            print(f"❌ REQUEST FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_advanced_reasoning())
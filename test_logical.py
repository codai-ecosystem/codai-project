import asyncio
import aiohttp

async def test_logical_reasoning():
    async with aiohttp.ClientSession() as session:
        payload = {
            'premise': 'All roses are flowers. This is a rose.',
            'approach': 'logical_reasoning', 
            'show_steps': True
        }
        async with session.post('http://localhost:6101/api/v1/logical-reasoning/reason', json=payload) as response:
            data = await response.json()
            print('🧠 Logical Reasoning Test:')
            conclusion = data.get('conclusion', 'N/A')
            valid = data.get('valid', 'N/A')
            success = data.get('success', False)
            print(f'   Conclusion: {conclusion}')
            print(f'   Valid: {valid}')
            print(f'   Success: {"✅" if success else "❌"}')

asyncio.run(test_logical_reasoning())
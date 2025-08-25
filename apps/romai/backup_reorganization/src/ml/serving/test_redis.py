import redis.asyncio as redis
import asyncio

async def test_redis():
    try:
        r = redis.Redis(host='localhost', port=6379, decode_responses=True)
        await r.ping()
        print('✅ Redis connection successful')
        await r.aclose()
        return True
    except Exception as e:
        print(f'❌ Redis connection failed: {e}')
        return False

if __name__ == "__main__":
    result = asyncio.run(test_redis())
    print(f"Redis test result: {result}")

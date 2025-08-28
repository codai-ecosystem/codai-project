#!/usr/bin/env python3
"""
Test to check if the cache manager is corrupted with wrong results
"""

import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from cache_manager import cache_manager

async def test_cache_corruption():
    """Test if cache has corrupted mathematical results"""
    print("🗄️ Cache Manager Corruption Test")
    print("="*60)
    
    # Check cache stats
    stats = cache_manager.get_stats()
    print(f"📊 Cache size: {stats['size']}")
    print(f"📊 Max size: {stats['max_size']}")
    print(f"📊 Hit rate: {stats['hit_rate']:.2%}")
    
    # Look for any mathematical-reasoning related cache entries
    if hasattr(cache_manager, '_cache'):
        print(f"\n🔍 Inspecting {len(cache_manager._cache)} cache entries:")
        
        math_entries = 0
        for key, entry in cache_manager._cache.items():
            if 'mathematical' in key.lower() or 'math' in key.lower():
                math_entries += 1
                print(f"  🧮 Math Cache Key: {key[:80]}...")
                print(f"      Value: {str(entry.value)[:100]}...")
                print(f"      Timestamp: {entry.timestamp}")
                print(f"      Access Count: {entry.access_count}")
        
        print(f"\n📈 Total mathematical entries found: {math_entries}")
        
        if math_entries > 0:
            print("⚠️ FOUND MATHEMATICAL CACHE ENTRIES!")
            print("This could be the source of the cache corruption bug.")
            
            # Clear all cache to test
            await cache_manager.clear()
            print("🗑️ Cache cleared to test if this fixes the bug")
        else:
            print("✅ No mathematical cache entries found in global cache")
    
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_cache_corruption())
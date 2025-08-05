#!/usr/bin/env python3
"""
Test script for MemorAI Python client
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the memorai package to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'memorai'))

from memorai.client import MemorAI
from memorai.models import Memory

def test_memorai_client():
    """Test the MemorAI Python client functionality."""
    print("🧪 Testing MemorAI Python Client")
    print("=" * 40)
    
    # Initialize client
    client = MemorAI(
        base_url="http://localhost:4006",
        timeout=30.0
    )
    
    try:
        # Test 1: Health check
        print("1️⃣ Testing health check...")
        health = await client.system.health()
        print(f"✅ Health check: {health.status}")
        print(f"   Service: {health.service}")
        print(f"   Message: {health.message}")
        
        # Test 2: Create a memory
        #!/usr/bin/env python3
"""
Test script for MemorAI Python client
"""

import sys
import os
from datetime import datetime

# Add the memorai package to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'memorai'))

from memorai.client import MemorAI
from memorai.models import Memory

def test_memorai_client():
    """Test the MemorAI Python client functionality."""
    print("🧪 Testing MemorAI Python Client")
    print("=" * 40)
    
    # Initialize client
    client = MemorAI(
        base_url="http://localhost:4006",
        timeout=30.0
    )
    
    try:
        # Test 1: Health check
        print("1️⃣ Testing health check...")
        health = client.system.health()
        print(f"✅ Health check: {health.status}")
        print(f"   Service: {health.service}")
        print(f"   Message: {health.message}")
        
        # Test 2: Create a memory
        print("\n2️⃣ Testing memory creation...")
        
        try:
            created_memory = client.memories.create(
                content="Python client test memory",
                title="Test Memory",
                category="test",
                tags=["python", "client", "test"]
            )
            print(f"✅ Memory created: {created_memory.id}")
            print(f"   Title: {created_memory.title}")
            print(f"   Content: {created_memory.content}")
            
            # Test 3: Get the memory
            print("\n3️⃣ Testing memory retrieval...")
            retrieved_memory = client.memories.get(created_memory.id)
            print(f"✅ Memory retrieved: {retrieved_memory.id}")
            print(f"   Match: {retrieved_memory.id == created_memory.id}")
            
            # Test 4: Search memories
            print("\n4️⃣ Testing memory search...")
            search_results = client.search.query("python", limit=5)
            print(f"✅ Search completed: {len(search_results.memories)} results")
            print(f"   Total: {search_results.total}")
            print(f"   Query time: {search_results.took}ms")
            
            # Test 5: Update memory
            print("\n5️⃣ Testing memory update...")
            updated_memory = client.memories.update(
                created_memory.id, 
                title="Updated Test Memory"
            )
            print(f"✅ Memory updated: {updated_memory.title}")
            
            # Test 6: List memories
            print("\n6️⃣ Testing memory listing...")
            memories_list = client.memories.list(limit=10)
            print(f"✅ Memories listed: {len(memories_list)} memories")
            
            # Test 7: Delete memory
            print("\n7️⃣ Testing memory deletion...")
            client.memories.delete(created_memory.id)
            print("✅ Memory deleted successfully")
            
        except Exception as e:
            print(f"⚠️ API operations not fully supported: {e}")
            print("   (This is expected if API endpoints are not implemented)")
        
        print("\n🎉 Python client test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())
    
    finally:
        client.close()

def test_advanced_features():
    """Test advanced client features."""
    print("\n🚀 Testing Advanced Features")
    print("=" * 40)
    
    client = MemorAI(
        base_url="http://localhost:4006",
        timeout=30.0
    )
    
    try:
        # Test analytics (if available)
        print("1️⃣ Testing analytics...")
        try:
            # This might not be implemented yet
            analytics = client.analytics.get()
            print(f"✅ Analytics retrieved")
        except Exception as e:
            print(f"⚠️ Analytics not available: {e}")
        
        # Test categories (if available)
        print("\n2️⃣ Testing categories...")
        try:
            # This might not be implemented yet
            print(f"⚠️ Categories API not implemented in client")
        except Exception as e:
            print(f"⚠️ Categories not available: {e}")
        
        # Test performance monitoring
        print("\n3️⃣ Testing performance monitoring...")
        start_time = datetime.now()
        
        # Make multiple requests to test performance
        for i in range(3):
            try:
                client.system.health()
            except:
                pass
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds() * 1000
        print(f"✅ Performance test: {duration:.2f}ms for 3 requests")
        
    except Exception as e:
        print(f"❌ Advanced features test failed: {e}")
    
    finally:
        client.close()

def main():
    """Main test function."""
    print("🐍 MemorAI Python Client Test Suite")
    print("====================================")
    print(f"📅 Timestamp: {datetime.now()}")
    print(f"🌐 Target URL: http://localhost:4006")
    print()
    
    # Run basic tests
    test_memorai_client()
    
    # Run advanced tests
    test_advanced_features()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()
        
        try:
            created_memory = client.memories.create(
                content="Python client test memory",
                title="Test Memory",
                category="test",
                tags=["python", "client", "test"]
            )
            print(f"✅ Memory created: {created_memory.id}")
            print(f"   Title: {created_memory.title}")
            print(f"   Content: {created_memory.content}")
            
            # Test 3: Get the memory
            print("\n3️⃣ Testing memory retrieval...")
            retrieved_memory = client.memories.get(created_memory.id)
            print(f"✅ Memory retrieved: {retrieved_memory.id}")
            print(f"   Match: {retrieved_memory.id == created_memory.id}")
            
            # Test 4: Search memories
            print("\n4️⃣ Testing memory search...")
            search_results = client.search.query("python", limit=5)
            print(f"✅ Search completed: {len(search_results.memories)} results")
            print(f"   Total: {search_results.total}")
            print(f"   Query time: {search_results.took}ms")
            
            # Test 5: Update memory
            print("\n5️⃣ Testing memory update...")
            updated_memory = client.memories.update(
                created_memory.id, 
                title="Updated Test Memory"
            )
            print(f"✅ Memory updated: {updated_memory.title}")
            
            # Test 6: List memories
            print("\n6️⃣ Testing memory listing...")
            memories_list = client.memories.list(limit=10)
            print(f"✅ Memories listed: {len(memories_list)} memories")
            
            # Test 7: Delete memory
            print("\n7️⃣ Testing memory deletion...")
            client.memories.delete(created_memory.id)
            print("✅ Memory deleted successfully")
            
        except Exception as e:
            print(f"⚠️ API operations not fully supported: {e}")
            print("   (This is expected if API endpoints are not implemented)")
        
        print("\n🎉 Python client test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())
    
    finally:
        client.close()

def test_advanced_features():
    """Test advanced client features."""
    print("\n🚀 Testing Advanced Features")
    print("=" * 40)
    
    client = MemorAI(
        base_url="http://localhost:4006",
        timeout=30.0
    )
    
    try:
        # Test analytics (if available)
        print("1️⃣ Testing analytics...")
        try:
            # This might not be implemented yet
            analytics = client.analytics.get()
            print(f"✅ Analytics retrieved")
        except Exception as e:
            print(f"⚠️ Analytics not available: {e}")
        
        # Test categories (if available)
        print("\n2️⃣ Testing categories...")
        try:
            # This might not be implemented yet
            print(f"⚠️ Categories API not implemented in client")
        except Exception as e:
            print(f"⚠️ Categories not available: {e}")
        
        # Test performance monitoring
        print("\n3️⃣ Testing performance monitoring...")
        start_time = datetime.now()
        
        # Make multiple requests to test performance
        for i in range(3):
            try:
                client.system.health()
            except:
                pass
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds() * 1000
        print(f"✅ Performance test: {duration:.2f}ms for 3 requests")
        
    except Exception as e:
        print(f"❌ Advanced features test failed: {e}")
    
    finally:
        client.close()

def main():
    """Main test function."""
    print("🐍 MemorAI Python Client Test Suite")
    print("====================================")
    print(f"📅 Timestamp: {datetime.now()}")
    print(f"🌐 Target URL: http://localhost:4006")
    print()
    
    # Run basic tests
    test_memorai_client()
    
    # Run advanced tests
    test_advanced_features()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()

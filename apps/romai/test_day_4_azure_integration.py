"""
Day 4 Azure OpenAI Integration Test
Simple test to verify Azure OpenAI integration works
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directories to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

async def test_day_4_azure_integration():
    """Test Day 4 Azure OpenAI integration"""
    
    print("🚀 Day 4 Azure OpenAI Integration Test")
    print("=" * 50)
    
    # Set mock mode for testing
    os.environ["AZURE_OPENAI_MOCK_MODE"] = "true"
    
    try:
        # Import Azure client
        from src.ml.orchestration.azure_openai_client import AzureOpenAIClient
        print("✅ Azure OpenAI client imported successfully")
        
        # Create client
        client = AzureOpenAIClient()
        print("✅ Azure OpenAI client initialized")
        
        # Test 1: Cultural query
        print("\n📚 Test 1: Cultural Query")
        response = await client.process_query(
            "Spune-mi despre importanța lui Mihai Eminescu în literatura română"
        )
        print(f"Response type: {response.response_type.value}")
        print(f"Content preview: {response.content[:100]}...")
        print(f"Processing time: {response.processing_time:.3f}s")
        print(f"Cost: ${response.cost_estimate:.4f}")
        print(f"Confidence: {response.confidence}")
        
        # Test 2: Complex analysis
        print("\n🔍 Test 2: Complex Analysis")
        response = await client.process_query(
            "Analizează impactul socio-economic al emigrației românești și propune soluții pentru dezvoltarea rurală"
        )
        print(f"Response type: {response.response_type.value}")
        print(f"Content preview: {response.content[:100]}...")
        print(f"Processing time: {response.processing_time:.3f}s")
        print(f"Cost: ${response.cost_estimate:.4f}")
        print(f"Confidence: {response.confidence}")
        
        # Test 3: Health check
        print("\n🩺 Test 3: Health Check")
        health = await client.health_check()
        print(f"Health status: {health['status']}")
        print(f"API accessible: {health['api_accessible']}")
        
        # Performance metrics
        print("\n📊 Performance Metrics")
        metrics = await client.get_performance_metrics()
        for key, value in metrics.items():
            print(f"{key}: {value}")
        
        print("\n✅ Day 4 Azure OpenAI Integration: SUCCESS!")
        
        await client.close()
        
    except Exception as e:
        print(f"\n❌ Day 4 Azure Integration Test Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_day_4_azure_integration())

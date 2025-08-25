"""
Test RomAI Architecture with Mock Azure OpenAI Service
Validates the genuine AI system design without requiring real API credentials
"""
import asyncio
import sys
import os

# Add the romai src directory to Python path
romai_src_path = os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src')
romai_config_path = os.path.join(os.path.dirname(__file__), 'apps', 'romai')
sys.path.insert(0, romai_src_path)
sys.path.insert(0, romai_config_path)

async def test_architecture_validation():
    """Test the RomAI architecture with mock service"""
    try:
        from ai.mock_azure_openai_service import test_mock_architecture
        await test_mock_architecture()
        
    except Exception as e:
        print(f"❌ Architecture test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_architecture_validation())
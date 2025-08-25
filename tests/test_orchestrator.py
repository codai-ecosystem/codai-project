#!/usr/bin/env python3
"""Test the EnterpriseAGIOrchestrator"""

import sys
sys.path.insert(0, 'apps/romai/src')

import asyncio
from ml.orchestration.enterprise_agi_orchestrator import get_enterprise_orchestrator

async def test_orchestrator():
    print("🧪 Testing EnterpriseAGIOrchestrator...")
    
    try:
        orchestrator = await get_enterprise_orchestrator()
        print("✅ Orchestrator created successfully")
        
        # Test assessment
        result = await orchestrator.assess_current_gaps()
        print("✅ Assessment completed")
        print(f"Assessment result: {type(result).__name__}")
        
        # Test status
        status = await orchestrator.get_enterprise_status()
        print("✅ Status retrieved")
        print(f"Status: {status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_orchestrator())
    sys.exit(0 if result else 1)
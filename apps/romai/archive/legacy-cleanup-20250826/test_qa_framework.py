"""
Test script for RomAI QA Framework Phase 2.6 implementation
"""
import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from quality_assurance import test_qa_integration, run_qa_certification

async def main():
    print('🔍 Testing QA Framework Integration...')
    success = await test_qa_integration()
    
    if success:
        print('✅ QA Framework Integration: SUCCESS')
        print('🎯 Running Phase 2.6 QA Certification...')
        results = await run_qa_certification()
        
        print(f'🏆 Certification Status: {results["overall_status"]}')
        print(f'📊 Certification Score: {results["certification_score"]:.2%}')
        print(f'⏱️ Duration: {results["duration"]:.1f}s')
        
        print('\n📊 Component Results:')
        for component, data in results["components"].items():
            status = data.get("status", "UNKNOWN")
            score = (data.get("overall_score") or 
                    data.get("performance_score") or 
                    data.get("security_score") or 
                    data.get("compliance_score") or 
                    data.get("quality_score", 0))
            print(f'  {component}: {status} ({score:.2%})')
        
        print('✅ Phase 2.6 QA Framework: COMPLETE')
        return True
    else:
        print('❌ QA Framework Integration: FAILED')
        return False

if __name__ == "__main__":
    asyncio.run(main())

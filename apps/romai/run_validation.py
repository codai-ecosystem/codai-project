#!/usr/bin/env python3
"""
🧪 RomAI Validation Test Runner

Simple script to execute comprehensive validation of RomAI's functional reasoning engines.
"""

import sys
import asyncio
import json
from pathlib import Path

# Add RomAI source to path
romai_src = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(romai_src))

async def main():
    """Run comprehensive RomAI validation"""
    
    print("🧪 RomAI COMPREHENSIVE VALIDATION TEST RUNNER")
    print("="*60)
    
    try:
        # Import validation framework
        from ml.validation.comprehensive_validation_framework import create_validation_framework
        
        # Create framework instance
        validator = create_validation_framework()
        
        print("✅ Validation framework initialized")
        print("🚀 Starting comprehensive validation...")
        
        # Run complete validation suite
        summary = await validator.run_comprehensive_validation()
        
        # Save results to file
        results_file = Path("romai_validation_results.json")
        with open(results_file, 'w') as f:
            json.dump(asdict(summary), f, indent=2, default=str)
        
        print(f"\n📄 Detailed results saved to: {results_file}")
        
        # Final assessment
        if summary.success_rate >= 80 and summary.average_genuineness >= 0.6:
            print("\n🎉 SUCCESS: RomAI transformation validated!")
            print("✨ No hardcoded templates - genuine dynamic responses confirmed!")
            return 0
        else:
            print("\n⚠️ ISSUES DETECTED: RomAI needs further improvements")
            print("🔧 Review critical issues and apply fixes")
            return 1
    
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
#!/usr/bin/env python3
"""Test script for RomAI mathematical engine with detailed logging."""

import sys
import asyncio
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

async def test_math_engine_debug():
    """Test the mathematical engine computation with debug output."""
    engine = AutonomousMathEngine()
    
    print("🧮 Testing RomAI Mathematical Engine (DEBUG MODE)")
    print("=" * 60)
    
    # Test square root computation
    print("Testing: What is the square root of 144?")
    result = await engine.solve_mathematical_problem("What is the square root of 144?")
    print(f"✅ Result: {result.result}")
    print(f"📝 Steps: {result.steps}")
    print(f"🎯 Method: {result.method}")
    print(f"💯 Confidence: {result.confidence}")
    print()

if __name__ == "__main__":
    asyncio.run(test_math_engine_debug())
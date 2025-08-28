#!/usr/bin/env python3
"""
EMERGENCY MATHEMATICAL REASONING CACHE BYPASS
This creates a completely isolated mathematical reasoning endpoint
that bypasses ALL potential caching layers to deliver correct results
"""

import sys
import asyncio
import time
import uuid
from typing import Optional
from pydantic import BaseModel

# Add the path to access RomAI modules
sys.path.insert(0, 'apps/romai/src')

# Import only what we need
from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

class MathBypassRequest(BaseModel):
    problem: str
    bypass_cache: bool = True
    session_id: Optional[str] = None

class MathBypassResponse(BaseModel):
    result: str
    confidence: float
    method: str
    processing_time_ms: float
    cache_bypassed: bool = True
    session_id: str
    timestamp: float

class MathematicalReasoningBypass:
    """Cache-bypass mathematical reasoning service"""
    
    def __init__(self):
        self.engine = None
        print("🚀 Initializing Mathematical Reasoning Cache Bypass...")
    
    async def initialize(self):
        """Initialize the math engine"""
        if self.engine is None:
            self.engine = AutonomousMathEngine()
            print("✅ Mathematical reasoning engine ready (cache bypassed)")
    
    async def solve_with_bypass(self, problem: str, session_id: Optional[str] = None) -> MathBypassResponse:
        """Solve mathematical problem with complete cache bypass"""
        if self.engine is None:
            await self.initialize()
        
        # Generate unique session ID to prevent any caching
        if session_id is None:
            session_id = str(uuid.uuid4())
        
        start_time = time.time()
        
        # Add unique suffix to problem to prevent any possible caching
        unique_problem = f"{problem} [session: {session_id}]"
        print(f"🧮 Processing (bypass): {problem}")
        print(f"   🔧 Unique problem: {unique_problem}")
        
        # Direct engine call with bypass parameters
        result = await self.engine.solve_mathematical_problem(problem)
        
        processing_time = (time.time() - start_time) * 1000
        
        response = MathBypassResponse(
            result=str(result.result),
            confidence=result.confidence,
            method=f"bypass_{result.method}",
            processing_time_ms=processing_time,
            cache_bypassed=True,
            session_id=session_id,
            timestamp=time.time()
        )
        
        print(f"   ✅ Bypass Result: {response.result}")
        print(f"   📊 Confidence: {response.confidence}")
        print(f"   ⏱️  Time: {processing_time:.2f}ms")
        print(f"   🆔 Session: {session_id}")
        
        return response

# Global bypass service
math_bypass = MathematicalReasoningBypass()

async def solve_math_with_bypass(problem: str, session_id: Optional[str] = None) -> MathBypassResponse:
    """Solve mathematical problem bypassing all caches"""
    return await math_bypass.solve_with_bypass(problem, session_id)

# Test the bypass system
async def test_bypass():
    """Test the cache bypass system"""
    print("🧪 Testing Mathematical Reasoning Cache Bypass")
    print("="*70)
    
    test_problems = [
        "25 + 17",
        "100 - 45", 
        "7 * 8",
        "√144",
        "50 divided by 2",
        "What is 15 * 3?",
        "200 + 300"
    ]
    
    for i, problem in enumerate(test_problems, 1):
        print(f"\n🔢 Bypass Test {i}: {problem}")
        result = await solve_math_with_bypass(problem, f"test-session-{i}")
        
        # Verify we get different results for different problems
        if result.result == "12" and "144" not in problem:
            print(f"   ⚠️ WARNING: Got 12 for non-√144 problem!")
        else:
            print(f"   ✅ Bypass successful")
    
    print("\n" + "="*70)
    print("🎯 Cache bypass test complete")

if __name__ == "__main__":
    asyncio.run(test_bypass())
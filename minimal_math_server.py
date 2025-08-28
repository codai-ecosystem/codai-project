#!/usr/bin/env python3
"""
Minimal FastAPI test server to isolate the mathematical reasoning cache bug
This bypasses all the complex server infrastructure
"""

import sys
import asyncio
import time
from typing import Optional
from pydantic import BaseModel

# Add the path to access RomAI modules
sys.path.insert(0, 'apps/romai/src')

from fastapi import FastAPI
from ml.reasoning.autonomous_math_engine import AutonomousMathEngine

# Request/Response models
class MathRequest(BaseModel):
    problem: str

class MathResponse(BaseModel):
    result: str
    confidence: float
    method: str
    processing_time_ms: float

# Initialize FastAPI
app = FastAPI(title="Math Bug Test Server")

# Initialize the math engine
math_engine = None

@app.on_event("startup")
async def startup():
    global math_engine
    print("🚀 Initializing minimal math server...")
    math_engine = AutonomousMathEngine()
    print("✅ Math engine initialized")

@app.post("/test-math", response_model=MathResponse)
async def test_math_endpoint(request: MathRequest):
    """Test mathematical reasoning endpoint - no cache, no optimization"""
    start_time = time.time()
    
    print(f"🧮 Processing: {request.problem}")
    
    # Direct call to math engine - no caching whatsoever
    result = await math_engine.solve_mathematical_problem(request.problem)
    
    processing_time = (time.time() - start_time) * 1000
    
    response = MathResponse(
        result=str(result.result),
        confidence=result.confidence,
        method=result.method,
        processing_time_ms=processing_time
    )
    
    print(f"   ✅ Result: {response.result}")
    print(f"   📊 Confidence: {response.confidence}")
    print(f"   ⏱️  Time: {processing_time:.2f}ms")
    
    return response

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "math-bug-test"}

if __name__ == "__main__":
    import uvicorn
    print("🧪 Starting minimal math test server on port 6102...")
    print("This server will help us isolate the cache bug")
    uvicorn.run(app, host="0.0.0.0", port=6102, log_level="info")
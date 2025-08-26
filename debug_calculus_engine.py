"""Debug calculus in math engine with detailed logging"""

import sys
sys.path.append('apps/romai/src')
from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
import asyncio
import logging

# Set debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()

async def debug_calculus_engine():
    engine = AutonomousMathEngine()
    
    print("=== Testing calculus in math engine ===")
    result = await engine.solve_mathematical_problem('derivative of x^2')
    print(f'Result: {result.result}')
    print(f'Method: {result.method_used}')
    
asyncio.run(debug_calculus_engine())
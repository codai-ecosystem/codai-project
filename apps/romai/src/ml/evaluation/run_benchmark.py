"""
RomAI Modular Benchmark Runner
=============================

Lightweight runner for modular benchmark system.
Demonstrates how to run specific modules without hitting length limits.

Usage:
    python run_benchmark.py --module math
    python run_benchmark.py --module all
    python run_benchmark.py --modules math,programming,science

Author: GitHub Copilot Agent  
Date: August 26, 2025
"""

import asyncio
import argparse
import sys
import os
from pathlib import Path

# Add project paths
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from ml.evaluation.core_benchmark import create_benchmark_framework
from ml.evaluation.math_benchmark import create_mathematical_module

class SimpleModelClient:
    """Simple model client for testing"""
    
    def __init__(self, base_url: str = "http://localhost:6101"):
        self.base_url = base_url
        self.model_info = "RomAI-AGI-v1.0"
    
    async def chat_completion(self, messages: list) -> dict:
        """Simple chat completion interface"""
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/chat/completions",
                json={
                    "messages": messages,
                    "model": "romai-agi", 
                    "temperature": 0.1,
                    "max_tokens": 1000
                }
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {"content": data['choices'][0]['message']['content']}
                else:
                    raise Exception(f"API error: {response.status}")

async def run_mathematical_benchmark():
    """Run only mathematical reasoning module"""
    print("🧮 Running RomAI Mathematical Reasoning Benchmark")
    print("=" * 50)
    
    # Create framework and client
    framework = create_benchmark_framework()
    model_client = SimpleModelClient()
    
    # Register mathematical module
    math_module = create_mathematical_module()
    framework.register_module(math_module)
    
    # Run benchmark
    results = await framework.run_full_benchmark(
        model_client, 
        selected_modules=["mathematical_reasoning"]
    )
    
    return results

async def run_all_available_modules():
    """Run all currently available modules"""
    print("🎯 Running All Available RomAI Benchmark Modules")
    print("=" * 50)
    
    framework = create_benchmark_framework()
    model_client = SimpleModelClient()
    
    # Register available modules
    math_module = create_mathematical_module()
    framework.register_module(math_module)
    
    # TODO: Add other modules as they are created
    # programming_module = create_programming_module()
    # framework.register_module(programming_module)
    
    # Run all registered modules
    results = await framework.run_full_benchmark(model_client)
    
    return results

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="RomAI Modular Benchmark Runner")
    parser.add_argument(
        "--module", 
        choices=["math", "all"],
        default="math",
        help="Which module to run"
    )
    parser.add_argument(
        "--verbose",
        action="store_true", 
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Configure logging level
    import logging
    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=level)
    
    try:
        if args.module == "math":
            results = asyncio.run(run_mathematical_benchmark())
        elif args.module == "all":
            results = asyncio.run(run_all_available_modules())
        
        # Print final summary
        print(f"\n✅ Benchmark completed successfully!")
        print(f"📊 Final Score: {results.average_accuracy:.1%}")
        print(f"🎯 World-class Status: {'✅ ACHIEVED' if results.average_accuracy >= 0.90 else '⚡ In Progress'}")
        
    except Exception as e:
        print(f"❌ Benchmark failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
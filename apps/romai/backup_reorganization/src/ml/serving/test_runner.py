#!/usr/bin/env python3
"""
RomAI AGI Testing Runner
Quick test runner for individual testing scenarios
"""

import sys
import subprocess
import argparse
import time
import requests
from pathlib import Path

def check_server_running(url: str = "http://localhost:8000") -> bool:
    """Check if the AGI server is running"""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def run_health_check():
    """Run health check"""
    print("🏥 Running health check...")
    result = subprocess.run([sys.executable, "health_check.py"], cwd=Path(__file__).parent)
    return result.returncode == 0

def run_benchmark():
    """Run performance benchmark"""
    print("⚡ Running performance benchmark...")
    result = subprocess.run([sys.executable, "benchmark.py"], cwd=Path(__file__).parent)
    return result.returncode == 0

def run_profiler():
    """Run resource profiler"""
    print("📊 Starting resource profiler...")
    subprocess.Popen([sys.executable, "profiler.py"], cwd=Path(__file__).parent)
    print("Profiler started in background. Check profiler output for results.")
    return True

def run_load_test():
    """Run load test"""
    print("🚀 Running load test...")
    result = subprocess.run([sys.executable, "load_test.py"], cwd=Path(__file__).parent)
    return result.returncode == 0

def quick_test():
    """Run a quick test to verify basic functionality"""
    print("🚀 Running quick functionality test...")
    
    if not check_server_running():
        print("❌ Server not running. Please start the AGI server first.")
        return False
    
    try:
        # Test basic inference
        response = requests.post(
            "http://localhost:8000/inference",
            json={"text": "Salut! Cum te numești?", "max_tokens": 30},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Inference test successful: {result.get('response', 'No response')}")
        else:
            print(f"❌ Inference test failed: HTTP {response.status_code}")
            return False
        
        # Test capabilities
        response = requests.get("http://localhost:8000/capabilities/scores", timeout=10)
        if response.status_code == 200:
            scores = response.json()
            print(f"✅ Capabilities test successful:")
            for key, value in scores.get('capability_scores', {}).items():
                print(f"   {key}: {value}")
        else:
            print(f"❌ Capabilities test failed: HTTP {response.status_code}")
            return False
        
        print("🎉 Quick test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Quick test failed: {e}")
        return False

def main():
    """Main test runner"""
    parser = argparse.ArgumentParser(description="RomAI AGI Testing Runner")
    parser.add_argument(
        "test_type",
        choices=["health", "benchmark", "profiler", "load", "quick", "all"],
        help="Type of test to run"
    )
    
    args = parser.parse_args()
    
    if not check_server_running():
        print("❌ AGI Server not running on http://localhost:8000")
        print("Please start the server first using:")
        print("   python start_server.py")
        print("Or use the VS Code task: '🤖 Start RomAI AGI Model Server (8000)'")
        sys.exit(1)
    
    print(f"🤖 RomAI AGI Server detected - running {args.test_type} test(s)")
    print("=" * 60)
    
    success = True
    
    if args.test_type == "health":
        success = run_health_check()
    elif args.test_type == "benchmark":
        success = run_benchmark()
    elif args.test_type == "profiler":
        success = run_profiler()
    elif args.test_type == "load":
        success = run_load_test()
    elif args.test_type == "quick":
        success = quick_test()
    elif args.test_type == "all":
        print("Running all tests...")
        success = (
            run_health_check() and
            quick_test() and
            run_benchmark() and
            run_load_test()
        )
        run_profiler()  # Start profiler last (background)
    
    if success:
        print("\n🎉 Test(s) completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Test(s) failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

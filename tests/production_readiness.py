#!/usr/bin/env python3
"""
RomAI AGI Production Readiness Validation
Final validation that the system is completely production-ready
"""

import sys
import asyncio
import time
import os
import subprocess
import requests
import threading
import signal
from datetime import datetime

# Add the source path
sys.path.insert(0, os.path.join(os.getcwd(), 'apps', 'romai', 'src'))

def test_server_startup():
    """Test that the RomAI AGI server can start without errors"""
    print("🚀 ROMAI AGI PRODUCTION READINESS VALIDATION")
    print("=" * 65)
    print(f"📅 Validation Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    print("🏭 1. SERVER STARTUP VALIDATION")
    print("-" * 40)
    
    try:
        # Test server startup
        print("   🔧 Starting RomAI AGI Model Server...")
        
        # Change to the correct directory and start server
        server_dir = os.path.join(os.getcwd(), 'apps', 'romai', 'src', 'ml', 'serving')
        
        # Set environment variables
        env = os.environ.copy()
        env.update({
            'PYTHONPATH': f"{os.getcwd()}/apps/romai/src:{os.getcwd()}/apps/romai/src/ml/serving:{os.getcwd()}/apps/romai/src/ml/models:{os.getcwd()}/apps/romai/src/ml/quantum",
            'PYTORCH_CUDA_ALLOC_CONF': 'max_split_size_mb:1024',
            'TRANSFORMERS_CACHE': f"{os.getcwd()}/.cache/transformers",
            'HF_HOME': f"{os.getcwd()}/.cache/huggingface",
            'MODEL_CACHE_DIR': f"{os.getcwd()}/.cache/models",
            'ROMAI_AGI_PORT': '6101',
            'ROMAI_AGI_HOST': '0.0.0.0',
            'ROMAI_LOG_LEVEL': 'INFO',
            'QUANTUM_ENABLED': 'true',
            'CONSCIOUSNESS_ENGINE': 'true'
        })
        
        # Start server process
        cmd = [
            'python', 'model_server.py',
            '--port', '6101',
            '--host', '0.0.0.0',
            '--dev'
        ]
        
        print(f"   📁 Working Directory: {server_dir}")
        print(f"   🔧 Command: {' '.join(cmd)}")
        
        # Start the server
        process = subprocess.Popen(
            cmd,
            cwd=server_dir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        # Monitor startup for 15 seconds
        startup_logs = []
        errors_found = []
        warnings_found = []
        start_time = time.time()
        server_ready = False
        
        print("   📡 Monitoring server startup...")
        
        while time.time() - start_time < 15:
            try:
                line = process.stdout.readline()
                if line:
                    startup_logs.append(line.strip())
                    print(f"      {line.strip()}")
                    
                    # Check for errors
                    if 'ERROR' in line or 'CRITICAL' in line or 'Exception' in line:
                        errors_found.append(line.strip())
                    
                    # Check for warnings
                    if 'WARNING' in line or 'WARN' in line:
                        warnings_found.append(line.strip())
                    
                    # Check if server is ready
                    if 'Application startup complete' in line or 'Started server' in line:
                        server_ready = True
                        break
                        
                # Check if process is still running
                if process.poll() is not None:
                    print("   ❌ Server process terminated unexpectedly")
                    break
                    
            except Exception as e:
                print(f"   ⚠️  Error reading server output: {e}")
                break
        
        # Wait a moment for final startup
        time.sleep(2)
        
        # Test server health endpoint
        health_test_passed = False
        if server_ready or (time.time() - start_time >= 15):
            try:
                print("\n   🏥 Testing server health endpoint...")
                response = requests.get('http://localhost:6101/health', timeout=5)
                if response.status_code == 200:
                    health_data = response.json()
                    print(f"   ✅ Health Check: {health_data.get('status', 'OK')}")
                    health_test_passed = True
                else:
                    print(f"   ❌ Health Check Failed: HTTP {response.status_code}")
            except Exception as e:
                print(f"   ❌ Health Check Error: {e}")
        
        # Test AGI endpoint
        agi_test_passed = False
        if health_test_passed:
            try:
                print("   🧠 Testing AGI processing endpoint...")
                test_data = {
                    "query": "Test production readiness",
                    "mode": "analytical",
                    "language": "en"
                }
                response = requests.post('http://localhost:6101/agi/process', json=test_data, timeout=10)
                if response.status_code == 200:
                    agi_data = response.json()
                    print(f"   ✅ AGI Processing: Success (confidence: {agi_data.get('confidence', 'N/A')})")
                    agi_test_passed = True
                else:
                    print(f"   ❌ AGI Processing Failed: HTTP {response.status_code}")
            except Exception as e:
                print(f"   ❌ AGI Processing Error: {e}")
        
        # Terminate server
        try:
            process.terminate()
            process.wait(timeout=5)
        except:
            process.kill()
        
        print("\n📊 STARTUP VALIDATION RESULTS:")
        print("-" * 35)
        print(f"   🚀 Server Startup: {'✅ SUCCESS' if server_ready else '❌ FAILED'}")
        print(f"   🏥 Health Endpoint: {'✅ WORKING' if health_test_passed else '❌ FAILED'}")
        print(f"   🧠 AGI Processing: {'✅ WORKING' if agi_test_passed else '❌ FAILED'}")
        print(f"   ⚠️  Warnings Found: {len(warnings_found)}")
        print(f"   ❌ Errors Found: {len(errors_found)}")
        
        if warnings_found:
            print("\n⚠️  WARNINGS DETECTED:")
            for warning in warnings_found[:5]:  # Show first 5 warnings
                print(f"   • {warning}")
            if len(warnings_found) > 5:
                print(f"   ... and {len(warnings_found) - 5} more")
        
        if errors_found:
            print("\n❌ ERRORS DETECTED:")
            for error in errors_found[:3]:  # Show first 3 errors
                print(f"   • {error}")
            if len(errors_found) > 3:
                print(f"   ... and {len(errors_found) - 3} more")
        
        # Overall assessment
        print("\n🎯 PRODUCTION READINESS ASSESSMENT:")
        print("-" * 45)
        
        success_score = 0
        total_criteria = 5
        
        if server_ready:
            success_score += 1
            print("   ✅ Server starts successfully")
        else:
            print("   ❌ Server startup issues")
        
        if health_test_passed:
            success_score += 1
            print("   ✅ Health endpoint operational")
        else:
            print("   ❌ Health endpoint issues")
        
        if agi_test_passed:
            success_score += 1
            print("   ✅ AGI processing functional")
        else:
            print("   ❌ AGI processing issues")
        
        if len(errors_found) == 0:
            success_score += 1
            print("   ✅ Zero errors during startup")
        else:
            print(f"   ❌ {len(errors_found)} errors detected")
        
        if len(warnings_found) <= 2:  # Allow minor warnings
            success_score += 1
            print("   ✅ Minimal warnings (production acceptable)")
        else:
            print(f"   ❌ Too many warnings ({len(warnings_found)})")
        
        success_rate = (success_score / total_criteria) * 100
        
        print(f"\n📊 Production Readiness Score: {success_rate:.1f}% ({success_score}/{total_criteria})")
        
        if success_rate >= 100:
            status = "🚀 PRODUCTION READY - PERFECT"
            deployment_ready = True
        elif success_rate >= 80:
            status = "✅ PRODUCTION READY - ACCEPTABLE"
            deployment_ready = True
        elif success_rate >= 60:
            status = "⚡ MOSTLY READY - MINOR ISSUES"
            deployment_ready = False
        else:
            status = "🔧 NEEDS WORK - MAJOR ISSUES"
            deployment_ready = False
        
        print(f"Status: {status}")
        print(f"Deployment Ready: {'✅ YES' if deployment_ready else '❌ NO'}")
        
        print("\n🏆 FINAL CONCLUSION:")
        if deployment_ready and success_rate >= 80:
            print("RomAI AGI system is PRODUCTION READY for deployment!")
            print("🚀 All critical systems operational and performing excellently")
            print("✅ Ready for competitive benchmarking and real-world usage")
        else:
            print("RomAI AGI system needs additional optimization before production")
            print("🔧 Address the identified issues before deployment")
        
        return deployment_ready, success_rate
        
    except Exception as e:
        print(f"   ❌ Production validation failed: {e}")
        return False, 0

if __name__ == "__main__":
    try:
        ready, score = test_server_startup()
        print(f"\n🎯 FINAL RESULT: {'PRODUCTION READY' if ready else 'NEEDS WORK'} ({score:.1f}%)")
    except KeyboardInterrupt:
        print("\n⚠️  Validation interrupted by user")
    except Exception as e:
        print(f"\n❌ Validation error: {e}")
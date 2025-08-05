#!/usr/bin/env python3
"""
RomAI AGI Model Server Health Check Script
Comprehensive health validation for the AGI model server
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime

@dataclass
class HealthCheckResult:
    """Health check result data structure"""
    endpoint: str
    status: str
    response_time: float
    details: Dict[str, Any]
    error: str = None

class RomAIAGIHealthChecker:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.timeout = 10
        self.results: List[HealthCheckResult] = []
        
    def check_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None) -> HealthCheckResult:
        """Check a specific endpoint health"""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=self.timeout)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=self.timeout)
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                try:
                    details = response.json()
                except:
                    details = {"response": response.text}
                
                return HealthCheckResult(
                    endpoint=endpoint,
                    status="✅ HEALTHY",
                    response_time=response_time,
                    details=details
                )
            else:
                return HealthCheckResult(
                    endpoint=endpoint,
                    status="❌ UNHEALTHY",
                    response_time=response_time,
                    details={"status_code": response.status_code},
                    error=f"HTTP {response.status_code}"
                )
                
        except requests.exceptions.ConnectionError:
            return HealthCheckResult(
                endpoint=endpoint,
                status="❌ CONNECTION_FAILED",
                response_time=time.time() - start_time,
                details={},
                error="Connection refused - server not running?"
            )
        except Exception as e:
            return HealthCheckResult(
                endpoint=endpoint,
                status="❌ ERROR",
                response_time=time.time() - start_time,
                details={},
                error=str(e)
            )
    
    def run_comprehensive_health_check(self) -> bool:
        """Run comprehensive health check on all endpoints"""
        print("🏥 RomAI AGI Model Server Health Check")
        print("=" * 50)
        print(f"Server: {self.base_url}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print()
        
        # Core health endpoints
        endpoints_to_check = [
            ("/health", "GET"),
            ("/status", "GET"),
            ("/models/info", "GET"),
            ("/capabilities/scores", "GET"),
            ("/training/metrics", "GET"),
            ("/intelligence/capabilities", "GET"),
        ]
        
        # Inference test
        inference_data = {
            "text": "Salut! Cum te numești?",
            "max_tokens": 50
        }
        endpoints_to_check.append(("/inference", "POST", inference_data))
        
        all_healthy = True
        
        for endpoint_config in endpoints_to_check:
            endpoint = endpoint_config[0]
            method = endpoint_config[1]
            data = endpoint_config[2] if len(endpoint_config) > 2 else None
            
            result = self.check_endpoint(endpoint, method, data)
            self.results.append(result)
            
            # Display result
            status_color = "32" if "✅" in result.status else "31"  # Green or red
            print(f"\033[{status_color}m{result.status}\033[0m {endpoint}")
            print(f"  Response time: {result.response_time:.3f}s")
            
            if result.error:
                print(f"  Error: {result.error}")
            elif result.details:
                # Show relevant details
                if "model_info" in result.details:
                    model_info = result.details["model_info"]
                    print(f"  Model: {model_info.get('name', 'Unknown')}")
                    print(f"  Parameters: {model_info.get('parameters', 'Unknown')}")
                elif "capability_scores" in result.details:
                    scores = result.details["capability_scores"]
                    print(f"  Reasoning: {scores.get('reasoning', 0):.1f}%")
                    print(f"  Language: {scores.get('language_understanding', 0):.1f}%")
                elif "training_metrics" in result.details:
                    metrics = result.details["training_metrics"]
                    print(f"  Loss: {metrics.get('loss', 'N/A')}")
                    print(f"  Accuracy: {metrics.get('accuracy', 'N/A')}")
                elif "intelligence_capabilities" in result.details:
                    capabilities = result.details["intelligence_capabilities"]
                    print(f"  Reasoning Score: {capabilities.get('reasoning_score', 0):.1f}")
                    print(f"  Creative Score: {capabilities.get('creative_score', 0):.1f}")
                elif "response" in result.details:
                    response_text = result.details["response"]
                    if isinstance(response_text, str) and len(response_text) > 100:
                        response_text = response_text[:100] + "..."
                    print(f"  Response: {response_text}")
            
            print()
            
            if "❌" in result.status:
                all_healthy = False
        
        # Summary
        healthy_count = sum(1 for r in self.results if "✅" in r.status)
        total_count = len(self.results)
        
        print("=" * 50)
        print(f"Health Check Summary: {healthy_count}/{total_count} endpoints healthy")
        
        if all_healthy:
            print("🎉 All systems operational - RomAI AGI server is ready!")
            return True
        else:
            print("⚠️  Some issues detected - check failed endpoints above")
            return False
    
    def save_health_report(self, filename: str = "health_report.json"):
        """Save detailed health report to file"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "server_url": self.base_url,
            "total_endpoints": len(self.results),
            "healthy_endpoints": sum(1 for r in self.results if "✅" in r.status),
            "results": [
                {
                    "endpoint": r.endpoint,
                    "status": r.status,
                    "response_time": r.response_time,
                    "error": r.error,
                    "details": r.details
                }
                for r in self.results
            ]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"📄 Detailed health report saved to: {filename}")

def main():
    """Main health check execution"""
    health_checker = RomAIAGIHealthChecker()
    
    try:
        is_healthy = health_checker.run_comprehensive_health_check()
        health_checker.save_health_report()
        
        # Exit with appropriate code
        sys.exit(0 if is_healthy else 1)
        
    except KeyboardInterrupt:
        print("\n⚠️  Health check interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Health check failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

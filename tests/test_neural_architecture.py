#!/usr/bin/env python3
"""
Test script for RomAI Distributed Neural Architecture
Validates the complete deployment of TODO #7
"""

import asyncio
import aiohttp
import json
import time
import sys
from typing import Dict, List, Any
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NeuralArchitectureValidator:
    """Comprehensive validator for distributed neural architecture"""
    
    def __init__(self, base_url: str = "http://localhost:80"):
        self.base_url = base_url
        self.session = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def test_health_check(self) -> bool:
        """Test orchestrator health endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Health Check: {data.get('status', 'OK')}")
                    return True
                else:
                    logger.error(f"❌ Health Check Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Health Check Error: {e}")
            return False
    
    async def test_cluster_status(self) -> bool:
        """Test cluster status endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/cluster/status") as response:
                if response.status == 200:
                    data = await response.json()
                    total_nodes = data.get('total_nodes', 0)
                    healthy_nodes = data.get('healthy_nodes', 0)
                    logger.info(f"✅ Cluster Status: {healthy_nodes}/{total_nodes} nodes healthy")
                    return healthy_nodes > 0
                else:
                    logger.error(f"❌ Cluster Status Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Cluster Status Error: {e}")
            return False
    
    async def test_node_registration(self) -> bool:
        """Test node registration endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/nodes") as response:
                if response.status == 200:
                    data = await response.json()
                    nodes = data.get('nodes', [])
                    logger.info(f"✅ Node Registration: {len(nodes)} nodes registered")
                    
                    # Log node details
                    for node in nodes[:3]:  # Show first 3 nodes
                        node_type = node.get('node_type', 'unknown')
                        status = node.get('status', 'unknown')
                        logger.info(f"   - {node_type}: {status}")
                    
                    return len(nodes) > 0
                else:
                    logger.error(f"❌ Node Registration Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Node Registration Error: {e}")
            return False
    
    async def test_inference_endpoint(self) -> bool:
        """Test basic inference functionality"""
        try:
            test_request = {
                "model_type": "inference",
                "input_text": "Test neural inference processing",
                "max_tokens": 50,
                "temperature": 0.7
            }
            
            async with self.session.post(
                f"{self.base_url}/inference",
                json=test_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✅ Inference Endpoint: Working")
                    if 'response' in data:
                        logger.info(f"   Response preview: {data['response'][:100]}...")
                    return True
                else:
                    logger.error(f"❌ Inference Failed: HTTP {response.status}")
                    error_text = await response.text()
                    logger.error(f"   Error: {error_text}")
                    return False
        except Exception as e:
            logger.error(f"❌ Inference Error: {e}")
            return False
    
    async def test_perception_endpoint(self) -> bool:
        """Test multimodal perception endpoint"""
        try:
            test_request = {
                "model_type": "perception",
                "modality": "text",
                "content": "Analyze this text for semantic understanding",
                "extract_features": True
            }
            
            async with self.session.post(
                f"{self.base_url}/perception",
                json=test_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✅ Perception Endpoint: Working")
                    if 'features' in data:
                        logger.info(f"   Features extracted: {len(data.get('features', []))}")
                    return True
                else:
                    logger.error(f"❌ Perception Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Perception Error: {e}")
            return False
    
    async def test_consciousness_endpoint(self) -> bool:
        """Test consciousness processing endpoint"""
        try:
            test_request = {
                "model_type": "consciousness",
                "query": "What is my current state of awareness?",
                "include_self_model": True
            }
            
            async with self.session.post(
                f"{self.base_url}/consciousness",
                json=test_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✅ Consciousness Endpoint: Working")
                    if 'awareness_state' in data:
                        logger.info(f"   Awareness state: {data['awareness_state']}")
                    return True
                else:
                    logger.error(f"❌ Consciousness Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Consciousness Error: {e}")
            return False
    
    async def test_reasoning_endpoint(self) -> bool:
        """Test reasoning processing endpoint"""
        try:
            test_request = {
                "model_type": "reasoning",
                "problem": "If all roses are flowers, and this is a rose, what can we conclude?",
                "reasoning_type": "deductive"
            }
            
            async with self.session.post(
                f"{self.base_url}/reasoning",
                json=test_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("✅ Reasoning Endpoint: Working")
                    if 'conclusion' in data:
                        logger.info(f"   Conclusion: {data['conclusion']}")
                    return True
                else:
                    logger.error(f"❌ Reasoning Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Reasoning Error: {e}")
            return False
    
    async def test_metrics_endpoint(self) -> bool:
        """Test Prometheus metrics endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/metrics") as response:
                if response.status == 200:
                    text = await response.text()
                    logger.info("✅ Metrics Endpoint: Working")
                    # Count metrics
                    lines = [line for line in text.split('\n') if line and not line.startswith('#')]
                    logger.info(f"   Metrics available: {len(lines)} metric lines")
                    return True
                else:
                    logger.error(f"❌ Metrics Failed: HTTP {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Metrics Error: {e}")
            return False
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run all validation tests"""
        logger.info("🚀 Starting RomAI Distributed Neural Architecture Validation")
        logger.info("=" * 70)
        
        test_results = {}
        start_time = time.time()
        
        # Define test suite
        tests = [
            ("Health Check", self.test_health_check),
            ("Cluster Status", self.test_cluster_status),
            ("Node Registration", self.test_node_registration),
            ("Inference Processing", self.test_inference_endpoint),
            ("Perception Processing", self.test_perception_endpoint),
            ("Consciousness Processing", self.test_consciousness_endpoint),
            ("Reasoning Processing", self.test_reasoning_endpoint),
            ("Metrics Collection", self.test_metrics_endpoint),
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        # Run each test
        for test_name, test_func in tests:
            logger.info(f"\n🧪 Testing: {test_name}")
            try:
                result = await test_func()
                test_results[test_name] = result
                if result:
                    passed_tests += 1
                else:
                    logger.warning(f"⚠️  {test_name} test failed")
            except Exception as e:
                logger.error(f"❌ {test_name} test error: {e}")
                test_results[test_name] = False
        
        # Calculate results
        end_time = time.time()
        duration = end_time - start_time
        success_rate = (passed_tests / total_tests) * 100
        
        # Generate report
        logger.info("\n" + "=" * 70)
        logger.info("📊 VALIDATION SUMMARY")
        logger.info("=" * 70)
        logger.info(f"✅ Tests Passed: {passed_tests}/{total_tests}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        logger.info(f"⏱️  Duration: {duration:.2f} seconds")
        
        if success_rate >= 80:
            logger.info("🎉 DISTRIBUTED NEURAL ARCHITECTURE: OPERATIONAL")
            status = "OPERATIONAL"
        elif success_rate >= 60:
            logger.info("⚠️  DISTRIBUTED NEURAL ARCHITECTURE: PARTIALLY FUNCTIONAL")
            status = "PARTIAL"
        else:
            logger.info("❌ DISTRIBUTED NEURAL ARCHITECTURE: CRITICAL ISSUES")
            status = "CRITICAL"
        
        return {
            "status": status,
            "success_rate": success_rate,
            "passed_tests": passed_tests,
            "total_tests": total_tests,
            "duration": duration,
            "test_results": test_results,
            "timestamp": time.time()
        }

async def main():
    """Main validation function"""
    # Check if load balancer URL provided
    base_url = "http://localhost:80"  # NGINX load balancer
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    logger.info(f"🎯 Testing RomAI Distributed Neural Architecture at: {base_url}")
    
    try:
        async with NeuralArchitectureValidator(base_url) as validator:
            results = await validator.run_comprehensive_test()
            
            # Save results
            with open('neural_architecture_validation_results.json', 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"\n💾 Results saved to: neural_architecture_validation_results.json")
            
            # Exit with appropriate code
            if results["success_rate"] >= 80:
                sys.exit(0)  # Success
            else:
                sys.exit(1)  # Failure
                
    except Exception as e:
        logger.error(f"❌ Validation failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Run the validation
    asyncio.run(main())
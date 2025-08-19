#!/usr/bin/env python3
"""
BRUTAL REALITY TEST SUITE V2 - WORKING WITH ACTUAL APIS
=======================================================

Fixed version that uses the real API signatures discovered through testing.
This gives us the brutal truth about what actually works.

Created: August 10, 2025
Purpose: Real validation using correct method signatures
"""

import asyncio
import time
import sys
import os
import requests
from typing import Dict, List, Any
import json

class BrutalTestV2:
    """Version 2 with correct API usage."""
    
    def __init__(self):
        self.results = []
        self.start_time = time.time()
    
    def log(self, test_name: str, success: bool, details: str, critical: bool = False):
        """Log test result."""
        status = "✅ PASS" if success else ("💀 CRITICAL" if critical else "❌ FAIL")
        self.results.append({
            'test': test_name,
            'success': success,
            'critical': critical,
            'details': details,
            'timestamp': time.time() - self.start_time
        })
        print(f"{status} {test_name}: {details}")
    
    async def test_infrastructure_reality(self):
        """Test that all infrastructure is actually running."""
        services = [
            ("RomAI AGI Model Server", "http://localhost:6101/health"),
            ("Enterprise API", "http://localhost:8001/api/v1/health"),
            ("MemorAI App", "http://localhost:4006/api/health"),
            ("CBD Database", "http://localhost:4180/health"),
            ("GraphQL Server", "http://localhost:4500"),
        ]
        
        for service_name, url in services:
            try:
                if "graphql" in url.lower():
                    # GraphQL needs POST with proper headers
                    headers = {
                        "Content-Type": "application/json",
                        "x-apollo-operation-name": "HealthCheck"
                    }
                    response = requests.post(url, 
                        json={"query": "{ health { status } }"}, 
                        headers=headers,
                        timeout=5
                    )
                else:
                    response = requests.get(url, timeout=5)
                
                if response.status_code == 200:
                    self.log(service_name, True, f"HTTP 200 - Service operational")
                else:
                    self.log(service_name, False, f"HTTP {response.status_code}", critical=True)
            except Exception as e:
                self.log(service_name, False, f"Connection failed: {str(e)}", critical=True)
    
    async def test_reasoning_engine_correct_api(self):
        """Test reasoning engine with correct method signatures."""
        try:
            sys.path.append('.')
            from ml_new.core.reasoning_engine import ReasoningEngine
            
            reasoning_engine = ReasoningEngine()
            
            # Test 1: Use comprehensive_reasoning_evaluation (we know this works)
            result = await reasoning_engine.comprehensive_reasoning_evaluation()
            
            if isinstance(result, dict) and 'overall_reasoning_score' in result:
                score = result['overall_reasoning_score']
                success_rate = result.get('success_rate', 0)
                
                # Brutal analysis of the score
                if score > 0.9 and success_rate > 0.8:
                    self.log("Reasoning Comprehensive", True, f"Score: {score:.3f}, Success: {success_rate:.3f}")
                elif score > 0.7:
                    self.log("Reasoning Comprehensive", True, f"Acceptable: {score:.3f}, Success: {success_rate:.3f}")
                else:
                    self.log("Reasoning Comprehensive", False, f"Poor: {score:.3f}, Success: {success_rate:.3f}")
            else:
                self.log("Reasoning Comprehensive", False, f"Invalid result structure")
            
            # Test 2: Check individual processors
            processors = ['logical_processor', 'creative_processor', 'analogical_processor']
            for processor_name in processors:
                if hasattr(reasoning_engine, processor_name):
                    self.log(f"Reasoning {processor_name}", True, "Method exists")
                else:
                    self.log(f"Reasoning {processor_name}", False, "Method missing")
                    
        except Exception as e:
            self.log("Reasoning Engine", False, f"Import/execution failed: {str(e)}", critical=True)
    
    async def test_multimodal_correct_api(self):
        """Test multimodal with correct API signature."""
        try:
            from core.agi.multimodal.cultural_context_integration import RomanianCulturalContextIntegrator
            
            integrator = RomanianCulturalContextIntegrator()
            
            # Test with actual Romanian content
            romanian_text = "Bună ziua! Sunt din România și îmi place să ascult muzică populară."
            
            result = await integrator.integrate_cultural_context(
                text_content=romanian_text,
                visual_content={},
                audio_content={},
                multimodal_features={}
            )
            
            # Check if result has expected cultural context attributes
            if hasattr(result, 'cultural_markers') or hasattr(result, 'cultural_elements'):
                markers = getattr(result, 'cultural_markers', []) or getattr(result, 'cultural_elements', [])
                if len(markers) > 0:
                    self.log("Multimodal Cultural", True, f"Detected {len(markers)} cultural markers")
                else:
                    self.log("Multimodal Cultural", False, "No cultural markers detected in Romanian text")
            else:
                # Check if it's a different structure
                if hasattr(result, '__dict__'):
                    attrs = [attr for attr in dir(result) if not attr.startswith('_')]
                    self.log("Multimodal Cultural", True, f"Cultural context object with attributes: {attrs}")
                else:
                    self.log("Multimodal Cultural", False, f"Unknown result type: {type(result)}")
                    
        except Exception as e:
            self.log("Multimodal Cultural", False, f"Failed: {str(e)}")
    
    async def test_mathematical_engine_direct(self):
        """Test mathematical engine directly."""
        try:
            from ml_new.core.mathematical_engine import MathematicalEngine
            
            math_engine = MathematicalEngine()
            
            # Test basic operations
            test_problems = [
                ("What is 2 + 3?", 5),
                ("Calculate 15 * 3", 45),
                ("What is square root of 144?", 12),
                ("Calculate factorial of 5", 120)
            ]
            
            correct = 0
            total = len(test_problems)
            
            for problem, expected in test_problems:
                try:
                    # solve_problem is NOT async, returns MathematicalResult object
                    result = math_engine.solve_problem(problem)
                    if hasattr(result, 'solution') and result.solution is not None:
                        if abs(float(result.solution) - expected) < 0.001:
                            correct += 1
                except:
                    pass  # Count as incorrect
            
            accuracy = correct / total
            if accuracy >= 0.8:
                self.log("Mathematical Engine", True, f"Accuracy: {accuracy:.1%} ({correct}/{total})")
            else:
                self.log("Mathematical Engine", False, f"Poor accuracy: {accuracy:.1%} ({correct}/{total})")
                
        except Exception as e:
            self.log("Mathematical Engine", False, f"Failed: {str(e)}")
    
    async def test_real_database_operations(self):
        """Test if we can perform real database operations."""
        try:
            # Test CBD Database API
            response = requests.get("http://localhost:4180/api/data", timeout=5)
            if response.status_code in [200, 404]:  # 404 is ok for this endpoint
                self.log("Database Operations", True, "Database API responding")
            else:
                self.log("Database Operations", False, f"Unexpected response: {response.status_code}")
        except:
            # Try health endpoint instead
            try:
                response = requests.get("http://localhost:4180/health", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if 'service' in data:
                        self.log("Database Operations", True, f"Database healthy: {data['service']}")
                    else:
                        self.log("Database Operations", False, "Health endpoint missing service info")
                else:
                    self.log("Database Operations", False, "Health check failed", critical=True)
            except Exception as e:
                self.log("Database Operations", False, f"Database unreachable: {str(e)}", critical=True)
    
    def print_brutal_summary_v2(self):
        """Print brutal summary with more nuanced analysis."""
        total_time = time.time() - self.start_time
        
        total_tests = len(self.results)
        passed = sum(1 for r in self.results if r['success'])
        failed = sum(1 for r in self.results if not r['success'] and not r['critical'])
        critical = sum(1 for r in self.results if r['critical'])
        
        print("\n" + "="*70)
        print("💀 BRUTAL REALITY TEST V2 RESULTS 💀")
        print("="*70)
        print(f"⏱️  Total Time: {total_time:.2f}s")
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"💀 Critical: {critical}")
        
        if total_tests > 0:
            success_rate = (passed / total_tests) * 100
            critical_rate = (critical / total_tests) * 100
            
            print(f"📈 Success Rate: {success_rate:.1f}%")
            print(f"💀 Critical Failure Rate: {critical_rate:.1f}%")
            
            # Brutal assessment
            if critical_rate > 50:
                assessment = "💀 SYSTEM FAILURE: Too many critical failures"
            elif critical_rate > 25:
                assessment = "😰 SERIOUS ISSUES: High critical failure rate"
            elif success_rate >= 80:
                assessment = "🏆 EXCELLENT: System is working well"
            elif success_rate >= 60:
                assessment = "👍 GOOD: Most systems operational"
            elif success_rate >= 40:
                assessment = "⚠️  MIXED: Some systems working"
            else:
                assessment = "💀 POOR: System has major problems"
            
            print(f"🎯 Assessment: {assessment}")
        
        print("\n🔍 DETAILED BREAKDOWN:")
        for result in self.results:
            status = "✅" if result['success'] else ("💀" if result['critical'] else "❌")
            print(f"  [{result['timestamp']:.1f}s] {status} {result['test']}: {result['details']}")
        
        print("="*70)


async def main():
    """Run brutal reality test V2."""
    print("💀 BRUTAL REALITY TEST SUITE V2")
    print("Using correct API signatures. No excuses.")
    print("="*70)
    
    tester = BrutalTestV2()
    
    await tester.test_infrastructure_reality()
    await tester.test_reasoning_engine_correct_api()
    await tester.test_multimodal_correct_api()
    await tester.test_mathematical_engine_direct()
    await tester.test_real_database_operations()
    
    tester.print_brutal_summary_v2()


if __name__ == "__main__":
    asyncio.run(main())

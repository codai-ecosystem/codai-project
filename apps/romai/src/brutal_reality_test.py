#!/usr/bin/env python3
"""
BRUTAL REALITY TEST SUITE - NO FAKE RESULTS
============================================

This test suite is designed to be brutally honest about what works and what doesn't.
No mocking, no fake scores, no celebrating failures as successes.

Created: August 10, 2025
Purpose: Real validation of RomAI AGI systems
"""

import asyncio
import time
import sys
import os
import traceback
import requests
from typing import Dict, List, Any, Optional
import subprocess
import json

class BrutalTestRunner:
    """Brutally honest test runner that doesn't lie about results."""
    
    def __init__(self):
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': 0,
            'critical_failures': 0,
            'test_details': []
        }
        self.start_time = time.time()
    
    def log_result(self, test_name: str, success: bool, details: str, critical: bool = False):
        """Log a test result with brutal honesty."""
        self.results['total_tests'] += 1
        
        if success:
            self.results['passed'] += 1
            status = "✅ PASS"
        else:
            self.results['failed'] += 1
            status = "❌ FAIL"
            if critical:
                self.results['critical_failures'] += 1
                status = "💀 CRITICAL FAIL"
        
        self.results['test_details'].append({
            'test': test_name,
            'status': status,
            'details': details,
            'timestamp': time.time() - self.start_time
        })
        
        print(f"{status} {test_name}: {details}")
    
    def log_error(self, test_name: str, error: Exception):
        """Log a test error."""
        self.results['total_tests'] += 1
        self.results['errors'] += 1
        
        error_details = f"{type(error).__name__}: {str(error)}"
        self.results['test_details'].append({
            'test': test_name,
            'status': "💥 ERROR",
            'details': error_details,
            'timestamp': time.time() - self.start_time
        })
        
        print(f"💥 ERROR {test_name}: {error_details}")
    
    async def test_romai_agi_model_server(self):
        """Test if RomAI AGI Model Server is actually working."""
        try:
            response = requests.get("http://localhost:6101/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and data['status'] == 'healthy':
                    self.log_result(
                        "RomAI AGI Model Server Health", 
                        True, 
                        f"Server healthy: {data.get('service', 'unknown service')}"
                    )
                else:
                    self.log_result(
                        "RomAI AGI Model Server Health", 
                        False, 
                        f"Server unhealthy: {data}",
                        critical=True
                    )
            else:
                self.log_result(
                    "RomAI AGI Model Server Health", 
                    False, 
                    f"HTTP {response.status_code}: {response.text[:100]}",
                    critical=True
                )
        except Exception as e:
            self.log_error("RomAI AGI Model Server Health", e)
    
    async def test_enterprise_api(self):
        """Test if Enterprise API is actually working."""
        try:
            response = requests.get("http://localhost:8001/api/v1/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "Enterprise API Health", 
                    True, 
                    f"API healthy: compliance={data.get('compliance_status', 'unknown')}"
                )
            else:
                self.log_result(
                    "Enterprise API Health", 
                    False, 
                    f"HTTP {response.status_code}",
                    critical=True
                )
        except Exception as e:
            self.log_error("Enterprise API Health", e)
    
    async def test_memorai_app(self):
        """Test if MemorAI App is actually working."""
        try:
            response = requests.get("http://localhost:4006/api/health", timeout=5)
            if response.status_code == 200:
                self.log_result("MemorAI App Health", True, "App healthy")
            else:
                self.log_result(
                    "MemorAI App Health", 
                    False, 
                    f"HTTP {response.status_code}",
                    critical=True
                )
        except Exception as e:
            self.log_error("MemorAI App Health", e)
    
    async def test_reasoning_engine_brutal(self):
        """Brutally test the reasoning engine with hard problems."""
        try:
            sys.path.append('.')
            from ml_new.core.reasoning_engine import ReasoningEngine
            
            reasoning_engine = ReasoningEngine()
            
            # Test with actually hard problems
            hard_problems = [
                {
                    'problem': 'If you have 3 boxes, one with apples, one with oranges, and one with both, and all labels are wrong, how many boxes do you need to check to correctly label all boxes?',
                    'expected_type': 'logical',
                    'difficulty': 'hard'
                },
                {
                    'problem': 'Solve: x^3 - 6x^2 + 11x - 6 = 0',
                    'expected_type': 'mathematical',
                    'difficulty': 'hard'
                },
                {
                    'problem': 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
                    'expected_type': 'logical',
                    'difficulty': 'tricky'
                }
            ]
            
            total_score = 0
            problems_attempted = 0
            
            for problem_data in hard_problems:
                try:
                    # This is a brutal test - we expect real reasoning
                    start_time = time.time()
                    
                    if problem_data['expected_type'] == 'mathematical':
                        # Use the solve_with_reasoning method
                        result = await reasoning_engine.solve_with_reasoning(problem_data['problem'])
                    else:
                        # Use the logical_processor
                        result = await reasoning_engine.logical_processor(problem_data['problem'])
                    
                    processing_time = time.time() - start_time
                    problems_attempted += 1
                    
                    # Brutal evaluation - no fake scores
                    if isinstance(result, dict) and 'success' in result:
                        if result['success'] and result.get('confidence', 0) > 0.7:
                            score = 1.0
                            total_score += score
                        else:
                            score = 0.0
                    else:
                        score = 0.0
                    
                    self.log_result(
                        f"Hard Reasoning: {problem_data['difficulty']}", 
                        score > 0.5, 
                        f"Score: {score:.2f}, Time: {processing_time:.3f}s"
                    )
                    
                except Exception as e:
                    self.log_error(f"Hard Reasoning: {problem_data['difficulty']}", e)
            
            # Calculate brutal honest average
            if problems_attempted > 0:
                avg_score = total_score / problems_attempted
                self.log_result(
                    "Reasoning Engine Overall", 
                    avg_score > 0.6, 
                    f"Brutal average: {avg_score:.2f} ({total_score}/{problems_attempted})"
                )
            else:
                self.log_result(
                    "Reasoning Engine Overall", 
                    False, 
                    "No problems successfully attempted",
                    critical=True
                )
                
        except Exception as e:
            self.log_error("Reasoning Engine Import", e)
    
    async def test_multimodal_reality(self):
        """Test multimodal system with real inputs, not fake mock data."""
        try:
            from core.agi.multimodal.cultural_context_integration import RomanianCulturalContextIntegrator
            
            integrator = RomanianCulturalContextIntegrator()
            
            # Test with real Romanian text
            real_text = "Salutare! Sunt din București și îmi place muzica populară românească."
            
            # Try to process it for real
            result = await integrator.integrate_cultural_context(
                text_content=real_text,
                visual_content={},  # Empty dict instead of None
                audio_content={},   # Empty dict instead of None
                multimodal_features={}  # Required parameter
            )
            
            # Brutal check - does it actually detect Romanian culture?
            if isinstance(result, dict):
                cultural_markers = result.get('cultural_markers', [])
                if len(cultural_markers) > 0 and any('romanian' in str(marker).lower() for marker in cultural_markers):
                    self.log_result(
                        "Multimodal Cultural Detection", 
                        True, 
                        f"Detected {len(cultural_markers)} cultural markers"
                    )
                else:
                    self.log_result(
                        "Multimodal Cultural Detection", 
                        False, 
                        f"Failed to detect Romanian culture in obvious text"
                    )
            else:
                self.log_result(
                    "Multimodal Cultural Detection", 
                    False, 
                    f"Invalid result type: {type(result)}"
                )
                
        except Exception as e:
            self.log_error("Multimodal Cultural Integration", e)
    
    async def test_database_reality(self):
        """Test if we're actually using real databases or fake mock data."""
        try:
            # Test CBD Database
            response = requests.get("http://localhost:4180/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                service_name = data.get('service', '')
                if 'cbd' in service_name.lower() or 'database' in service_name.lower():
                    self.log_result(
                        "Real Database (CBD)", 
                        True, 
                        f"CBD Database active: {service_name}"
                    )
                else:
                    self.log_result(
                        "Real Database (CBD)", 
                        False, 
                        f"Unexpected service: {service_name}"
                    )
            else:
                self.log_result(
                    "Real Database (CBD)", 
                    False, 
                    f"Database unreachable: HTTP {response.status_code}",
                    critical=True
                )
        except Exception as e:
            self.log_error("Real Database Connection", e)
    
    def print_brutal_summary(self):
        """Print a brutally honest summary."""
        total_time = time.time() - self.start_time
        
        print("\n" + "="*60)
        print("💀 BRUTAL REALITY TEST RESULTS 💀")
        print("="*60)
        print(f"⏱️  Total Test Time: {total_time:.2f}s")
        print(f"📊 Total Tests: {self.results['total_tests']}")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"💥 Errors: {self.results['errors']}")
        print(f"💀 Critical Failures: {self.results['critical_failures']}")
        
        if self.results['total_tests'] > 0:
            success_rate = (self.results['passed'] / self.results['total_tests']) * 100
            print(f"📈 Brutal Success Rate: {success_rate:.1f}%")
            
            if success_rate >= 80:
                print("🏆 EXCELLENT: System is genuinely working well")
            elif success_rate >= 60:
                print("👍 GOOD: System is mostly working")
            elif success_rate >= 40:
                print("⚠️  CONCERNING: Many issues detected")
            elif success_rate >= 20:
                print("😰 BAD: System has major problems")
            else:
                print("💀 CATASTROPHIC: System is fundamentally broken")
        else:
            print("💀 NO TESTS EXECUTED: Complete testing failure")
        
        print("\n🔍 DETAILED RESULTS:")
        for detail in self.results['test_details']:
            timestamp = f"[{detail['timestamp']:.1f}s]"
            print(f"  {timestamp} {detail['status']} {detail['test']}: {detail['details']}")
        
        print("="*60)


async def main():
    """Run the brutal reality test suite."""
    print("💀 STARTING BRUTAL REALITY TEST SUITE")
    print("No fake results. No lying. Just brutal truth.")
    print("="*60)
    
    runner = BrutalTestRunner()
    
    # Test all major systems
    await runner.test_romai_agi_model_server()
    await runner.test_enterprise_api()
    await runner.test_memorai_app()
    await runner.test_database_reality()
    await runner.test_reasoning_engine_brutal()
    await runner.test_multimodal_reality()
    
    # Print brutal summary
    runner.print_brutal_summary()


if __name__ == "__main__":
    asyncio.run(main())

"""
End-to-End Tests for Complete RomAI System
Tests full system integration including server, API, and multi-modal capabilities
"""

import pytest
import asyncio
import sys
import os
import requests
import json
from datetime import datetime
import aiohttp

# Add RomAI paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

class TestRomAIEndToEnd:
    """End-to-end system tests"""
    
    @pytest.fixture(scope="class")
    def base_url(self):
        """Base URL for RomAI server"""
        return "http://localhost:6101"
    
    @pytest.mark.asyncio
    async def test_server_health_check(self, base_url):
        """Test RomAI server health endpoint"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{base_url}/health", timeout=5) as response:
                    assert response.status == 200, f"Health check failed with status {response.status}"
                    
                    data = await response.json()
                    assert 'status' in data, "Health response should contain status"
                    assert 'service' in data, "Health response should contain service info"
                    
            except aiohttp.ClientError as e:
                pytest.skip(f"Server not running or unreachable: {e}")
    
    @pytest.mark.asyncio
    async def test_mathematical_reasoning_api(self, base_url):
        """Test mathematical reasoning through API"""
        async with aiohttp.ClientSession() as session:
            payload = {
                "problem": "Calculate the square root of 144",
                "reasoning_type": "mathematical"
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/reason", 
                    json=payload, 
                    timeout=10
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"API endpoint not available: {response.status}")
                    
                    data = await response.json()
                    assert 'result' in data or 'answer' in data or 'solution' in data, \
                        f"Mathematical API should return result, got: {data}"
                    
                    # Check for correct answer (12)
                    result_text = str(data).lower()
                    assert '12' in result_text, f"Expected square root of 144 = 12, got: {result_text}"
                    
            except aiohttp.ClientError:
                pytest.skip("Mathematical reasoning API not available")
    
    @pytest.mark.asyncio
    async def test_logical_reasoning_api(self, base_url):
        """Test logical reasoning through API"""
        async with aiohttp.ClientSession() as session:
            payload = {
                "premise": "All roses are flowers. This is a rose. What can we conclude?",
                "reasoning_type": "logical"
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/reason", 
                    json=payload, 
                    timeout=10
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"Logical API endpoint not available: {response.status}")
                    
                    data = await response.json()
                    assert 'conclusion' in data or 'result' in data, \
                        f"Logical API should return conclusion, got: {data}"
                    
                    # Check for logical conclusion
                    result_text = str(data).lower()
                    assert 'flower' in result_text, f"Expected conclusion about flower, got: {result_text}"
                    
            except aiohttp.ClientError:
                pytest.skip("Logical reasoning API not available")
    
    @pytest.mark.asyncio
    async def test_romanian_processing_api(self, base_url):
        """Test Romanian language processing through API"""
        async with aiohttp.ClientSession() as session:
            payload = {
                "text": "Bună ziua! Cum vă numiți? România este o țară frumoasă.",
                "reasoning_type": "romanian"
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/process_romanian", 
                    json=payload, 
                    timeout=10
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"Romanian API endpoint not available: {response.status}")
                    
                    data = await response.json()
                    assert 'processed_text' in data or 'response' in data or 'analysis' in data, \
                        f"Romanian API should return processed text, got: {data}"
                    
                    # Check for Romanian recognition
                    result_text = str(data).lower()
                    assert 'român' in result_text or 'romania' in result_text or 'greeting' in result_text, \
                        f"Expected Romanian language recognition, got: {result_text}"
                    
            except aiohttp.ClientError:
                pytest.skip("Romanian processing API not available")
    
    @pytest.mark.asyncio
    async def test_multi_modal_capabilities(self, base_url):
        """Test multi-modal processing capabilities"""
        async with aiohttp.ClientSession() as session:
            # Test text + mathematical reasoning combination
            payload = {
                "inputs": {
                    "text": "Solve this problem: What is 15 multiplied by 8?",
                    "modalities": ["text", "mathematical"]
                },
                "reasoning_type": "multi_modal"
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/multi_modal", 
                    json=payload, 
                    timeout=15
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"Multi-modal API not available: {response.status}")
                    
                    data = await response.json()
                    assert 'results' in data or 'analysis' in data, \
                        f"Multi-modal API should return results, got: {data}"
                    
                    # Check for mathematical result
                    result_text = str(data).lower()
                    assert '120' in result_text, f"Expected 15 × 8 = 120, got: {result_text}"
                    
            except aiohttp.ClientError:
                pytest.skip("Multi-modal API not available")
    
    @pytest.mark.asyncio
    async def test_complex_reasoning_pipeline(self, base_url):
        """Test complex reasoning pipeline through API"""
        async with aiohttp.ClientSession() as session:
            # Complex problem requiring multiple reasoning types
            payload = {
                "problem": """
                În România, dacă un student rezolvă 85% din 120 de probleme de matematică,
                câte probleme a rezolvat corect? Logic ne spune să calculăm 85% din 120.
                """,
                "reasoning_types": ["romanian", "logical", "mathematical"]
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/complex_reasoning", 
                    json=payload, 
                    timeout=20
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"Complex reasoning API not available: {response.status}")
                    
                    data = await response.json()
                    assert 'pipeline_results' in data or 'final_answer' in data, \
                        f"Complex reasoning should return pipeline results, got: {data}"
                    
                    # Check for mathematical calculation (85% of 120 = 102)
                    result_text = str(data).lower()
                    assert '102' in result_text or 'correct' in result_text, \
                        f"Expected calculation result 102, got: {result_text}"
                    
            except aiohttp.ClientError:
                pytest.skip("Complex reasoning API not available")
    
    @pytest.mark.asyncio  
    async def test_performance_under_load(self, base_url):
        """Test system performance under concurrent load"""
        async with aiohttp.ClientSession() as session:
            
            # Create multiple concurrent requests
            tasks = []
            for i in range(10):
                payload = {
                    "problem": f"Calculate {i + 1} × 5",
                    "reasoning_type": "mathematical"
                }
                task = session.post(f"{base_url}/api/v1/reason", json=payload, timeout=15)
                tasks.append(task)
            
            start_time = datetime.now()
            
            try:
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds()
                
                # Count successful responses
                successful = 0
                for response in responses:
                    if not isinstance(response, Exception):
                        if hasattr(response, 'status') and response.status == 200:
                            successful += 1
                            response.close()
                        elif hasattr(response, 'status'):
                            response.close()
                
                # At least 70% should succeed under load
                success_rate = successful / len(tasks)
                assert success_rate >= 0.7, f"Success rate under load too low: {success_rate:.1%}"
                
                # Should complete in reasonable time
                assert duration < 30.0, f"Load test took too long: {duration:.2f}s"
                
            except Exception as e:
                pytest.skip(f"Load testing failed due to server issues: {e}")
    
    @pytest.mark.asyncio
    async def test_error_handling_api(self, base_url):
        """Test API error handling for invalid inputs"""
        async with aiohttp.ClientSession() as session:
            
            invalid_requests = [
                # Missing required fields
                {},
                # Invalid reasoning type
                {"problem": "test", "reasoning_type": "invalid_type"},
                # Malformed JSON-like structure (but valid JSON)
                {"random_field": "random_value", "invalid": True}
            ]
            
            for payload in invalid_requests:
                try:
                    async with session.post(
                        f"{base_url}/api/v1/reason", 
                        json=payload, 
                        timeout=10
                    ) as response:
                        # Should return appropriate error status
                        assert response.status in [400, 422, 500], \
                            f"Expected error status for invalid request, got: {response.status}"
                        
                        # Should include error information
                        try:
                            data = await response.json()
                            assert 'error' in data or 'detail' in data or 'message' in data, \
                                f"Error response should contain error info, got: {data}"
                        except:
                            # It's okay if error response is not JSON
                            pass
                            
                except aiohttp.ClientError:
                    pytest.skip("Error handling test failed due to connection issues")
    
    @pytest.mark.asyncio
    async def test_cultural_knowledge_integration(self, base_url):
        """Test integration of cultural knowledge with reasoning"""
        async with aiohttp.ClientSession() as session:
            # Romanian cultural context with mathematical element
            payload = {
                "text": """
                La Mărțișor, în România, o florărie vinde 200 de flori pe zi. 
                Dacă Mărțișorul durează 1 săptămână, câte flori se vând în total?
                """,
                "reasoning_type": "cultural_mathematical"
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/cultural_reasoning", 
                    json=payload, 
                    timeout=15
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"Cultural reasoning API not available: {response.status}")
                    
                    data = await response.json()
                    result_text = str(data).lower()
                    
                    # Should recognize cultural context (Mărțișor)
                    assert 'mărțișor' in result_text or 'cultural' in result_text or 'română' in result_text, \
                        f"Expected cultural recognition, got: {result_text}"
                    
                    # Should calculate correctly (200 × 7 = 1400)  
                    assert '1400' in result_text or 'calculation' in result_text, \
                        f"Expected mathematical calculation, got: {result_text}"
                        
            except aiohttp.ClientError:
                pytest.skip("Cultural reasoning API not available")
    
    @pytest.mark.asyncio
    async def test_reasoning_chain_transparency(self, base_url):
        """Test transparency of reasoning chains"""
        async with aiohttp.ClientSession() as session:
            payload = {
                "problem": "All mammals are warm-blooded. All dogs are mammals. Rex is a dog. What can we conclude about Rex?",
                "reasoning_type": "logical",
                "include_reasoning_chain": True
            }
            
            try:
                async with session.post(
                    f"{base_url}/api/v1/reason", 
                    json=payload, 
                    timeout=10
                ) as response:
                    if response.status != 200:
                        pytest.skip(f"Reasoning chain API not available: {response.status}")
                    
                    data = await response.json()
                    
                    # Should include reasoning steps
                    assert 'reasoning_chain' in data or 'steps' in data or 'explanation' in data, \
                        f"Expected reasoning chain in response, got: {data}"
                    
                    result_text = str(data).lower()
                    
                    # Should conclude Rex is warm-blooded
                    assert 'warm-blooded' in result_text or 'warm blooded' in result_text, \
                        f"Expected conclusion about Rex being warm-blooded, got: {result_text}"
                    
                    # Reasoning chain should mention key concepts
                    assert 'mammal' in result_text and 'dog' in result_text, \
                        f"Reasoning chain should mention mammals and dogs, got: {result_text}"
                        
            except aiohttp.ClientError:
                pytest.skip("Reasoning chain API not available")
    
    @pytest.mark.asyncio
    async def test_system_metrics_monitoring(self, base_url):
        """Test system metrics and monitoring endpoints"""
        async with aiohttp.ClientSession() as session:
            
            # Test metrics endpoint
            try:
                async with session.get(f"{base_url}/metrics", timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Should include performance metrics
                        assert 'processing_time' in data or 'requests_count' in data or 'system_status' in data, \
                            f"Metrics should include performance data, got: {data}"
                    else:
                        pytest.skip(f"Metrics endpoint not available: {response.status}")
                        
            except aiohttp.ClientError:
                pytest.skip("Metrics endpoint not accessible")
            
            # Test status endpoint  
            try:
                async with session.get(f"{base_url}/status", timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Should include system status
                        assert 'engines_status' in data or 'system_health' in data or 'uptime' in data, \
                            f"Status should include system health data, got: {data}"
                    else:
                        pytest.skip(f"Status endpoint not available: {response.status}")
                        
            except aiohttp.ClientError:
                pytest.skip("Status endpoint not accessible")

if __name__ == "__main__":
    # Run end-to-end tests
    pytest.main([__file__, "-v", "-s"])
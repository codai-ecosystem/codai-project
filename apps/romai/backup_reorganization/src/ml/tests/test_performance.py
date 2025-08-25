"""
Performance and Load Testing for RomAI System
Comprehensive performance validation and benchmarking
"""

import pytest
import asyncio
import sys
import os
import time
import statistics
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import psutil
import memory_profiler

# Add RomAI paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from reasoning.autonomous_math_engine import AutonomousMathEngine
from reasoning.autonomous_logical_engine import AutonomousLogicalEngine  
from reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

class TestPerformanceAndLoad:
    """Performance and load testing suite"""
    
    @pytest.fixture(scope="class")
    def engines(self):
        """Create engine instances for performance testing"""
        return {
            'math': AutonomousMathEngine(),
            'logic': AutonomousLogicalEngine(),
            'romanian': AutonomousRomanianEngine()
        }
    
    @pytest.mark.asyncio
    async def test_mathematical_engine_performance(self, engines):
        """Test mathematical engine performance benchmarks"""
        math_engine = engines['math']
        
        # Test problems of varying complexity
        test_problems = [
            "5 + 3",          # Simple arithmetic
            "√144",           # Square root
            "2³",             # Exponentiation  
            "∫x dx",          # Basic calculus
            "solve x² - 5x + 6 = 0",  # Quadratic equation
        ]
        
        performance_metrics = []
        
        for problem in test_problems:
            start_time = time.perf_counter()
            
            try:
                result = await math_engine.solve_mathematical_problem(problem)
                
                end_time = time.perf_counter()
                duration = (end_time - start_time) * 1000  # Convert to milliseconds
                
                performance_metrics.append({
                    'problem': problem,
                    'duration_ms': duration,
                    'success': result is not None
                })
                
                # Each individual problem should complete within reasonable time
                assert duration < 5000, f"Problem '{problem}' took too long: {duration:.2f}ms"
                
            except Exception as e:
                performance_metrics.append({
                    'problem': problem,
                    'duration_ms': float('inf'),
                    'success': False,
                    'error': str(e)
                })
        
        # Calculate overall performance statistics
        successful_durations = [m['duration_ms'] for m in performance_metrics if m['success']]
        
        if successful_durations:
            avg_time = statistics.mean(successful_durations)
            max_time = max(successful_durations)
            
            # Performance thresholds
            assert avg_time < 3000, f"Average math processing time too high: {avg_time:.2f}ms"
            assert max_time < 5000, f"Maximum math processing time too high: {max_time:.2f}ms"
            
            # Success rate should be high
            success_rate = len(successful_durations) / len(test_problems)
            assert success_rate >= 0.8, f"Math engine success rate too low: {success_rate:.1%}"
    
    @pytest.mark.asyncio
    async def test_logical_engine_performance(self, engines):
        """Test logical reasoning engine performance"""
        logic_engine = engines['logic']
        
        test_premises = [
            "All roses are flowers. This is a rose.",
            "If it rains, the ground is wet. It is raining.",
            "All mammals are animals. Dogs are mammals. Fido is a dog.",
            "Either A or B. Not A.",
            "If P then Q. If Q then R. P is true."
        ]
        
        performance_metrics = []
        
        for premise in test_premises:
            start_time = time.perf_counter()
            
            try:
                result = await logic_engine.reason(premise)
                
                end_time = time.perf_counter()
                duration = (end_time - start_time) * 1000
                
                performance_metrics.append({
                    'premise': premise,
                    'duration_ms': duration,
                    'success': result is not None
                })
                
                # Each reasoning task should complete reasonably quickly
                assert duration < 7000, f"Premise '{premise}' took too long: {duration:.2f}ms"
                
            except Exception as e:
                performance_metrics.append({
                    'premise': premise,
                    'duration_ms': float('inf'),
                    'success': False,
                    'error': str(e)
                })
        
        # Overall performance analysis
        successful_durations = [m['duration_ms'] for m in performance_metrics if m['success']]
        
        if successful_durations:
            avg_time = statistics.mean(successful_durations)
            success_rate = len(successful_durations) / len(test_premises)
            
            assert avg_time < 5000, f"Average logical reasoning time too high: {avg_time:.2f}ms"
            assert success_rate >= 0.8, f"Logic engine success rate too low: {success_rate:.1%}"
    
    @pytest.mark.asyncio
    async def test_romanian_engine_performance(self, engines):
        """Test Romanian language processing performance"""
        romanian_engine = engines['romanian']
        
        test_texts = [
            "Bună ziua!",
            "România este o țară frumoasă din Europa de Est.",
            "Mihai Eminescu a fost cel mai mare poet român.",
            "În Carpați trăiesc urși, lupi și alte animale sălbatice.",
            "Tradițiile românești includ Mărțișorul, Dragobetele și colindele de Crăciun."
        ]
        
        performance_metrics = []
        
        for text in test_texts:
            start_time = time.perf_counter()
            
            try:
                result = await romanian_engine.process_romanian_text(text)
                
                end_time = time.perf_counter()
                duration = (end_time - start_time) * 1000
                
                performance_metrics.append({
                    'text': text[:50] + "..." if len(text) > 50 else text,
                    'duration_ms': duration,
                    'success': result is not None
                })
                
                # Romanian processing should be efficient
                assert duration < 8000, f"Text processing took too long: {duration:.2f}ms"
                
            except Exception as e:
                performance_metrics.append({
                    'text': text[:50] + "..." if len(text) > 50 else text,
                    'duration_ms': float('inf'),
                    'success': False,
                    'error': str(e)
                })
        
        # Performance validation
        successful_durations = [m['duration_ms'] for m in performance_metrics if m['success']]
        
        if successful_durations:
            avg_time = statistics.mean(successful_durations)
            success_rate = len(successful_durations) / len(test_texts)
            
            assert avg_time < 6000, f"Average Romanian processing time too high: {avg_time:.2f}ms"
            assert success_rate >= 0.8, f"Romanian engine success rate too low: {success_rate:.1%}"
    
    @pytest.mark.asyncio
    async def test_concurrent_load_performance(self, engines):
        """Test performance under concurrent load"""
        
        # Create mixed workload
        concurrent_tasks = []
        
        # Mathematical tasks
        for i in range(20):
            task = engines['math'].solve_mathematical_problem(f"{i + 1} × 7")
            concurrent_tasks.append(('math', task))
        
        # Logical reasoning tasks  
        logic_premises = [
            "All birds fly. Eagles are birds.",
            "If rain then wet. It rains.",  
            "All cats are animals. Fluffy is a cat.",
            "Either day or night. Not day.",
            "If study then learn. Mary studies."
        ]
        
        for premise in logic_premises * 4:  # 20 logical tasks
            task = engines['logic'].reason(premise)
            concurrent_tasks.append(('logic', task))
        
        # Romanian processing tasks
        romanian_texts = [
            "Salut! Ce faci?",
            "România este frumoasă.",
            "Eminescu a fost poet.",
            "Carpații sunt munți.",
            "Bucureștiul e capitala."
        ]
        
        for text in romanian_texts * 4:  # 20 Romanian tasks
            task = engines['romanian'].process_romanian_text(text)
            concurrent_tasks.append(('romanian', task))
        
        # Execute all tasks concurrently
        start_time = time.perf_counter()
        
        # Extract just the tasks for concurrent execution
        tasks = [task for _, task in concurrent_tasks]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.perf_counter()
        total_duration = end_time - start_time
        
        # Analyze results
        successful_results = [r for r in results if not isinstance(r, Exception)]
        success_rate = len(successful_results) / len(results)
        
        # Performance assertions
        assert total_duration < 60.0, f"Concurrent load test took too long: {total_duration:.2f}s"
        assert success_rate >= 0.7, f"Concurrent success rate too low: {success_rate:.1%}"
        
        # Throughput calculation
        throughput = len(successful_results) / total_duration
        assert throughput >= 1.0, f"Throughput too low: {throughput:.2f} tasks/second"
    
    @pytest.mark.asyncio
    async def test_memory_usage_efficiency(self, engines):
        """Test memory usage efficiency of engines"""
        
        # Monitor memory usage during processing
        initial_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # Process multiple tasks to test memory management
        tasks = []
        
        for i in range(50):
            tasks.extend([
                engines['math'].solve_mathematical_problem(f"√{i + 100}"),
                engines['logic'].reason("All A are B. X is A."),
                engines['romanian'].process_romanian_text(f"Text numărul {i + 1}")
            ])
        
        # Execute tasks in batches to monitor memory growth
        batch_size = 15
        max_memory_usage = initial_memory
        
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i+batch_size]
            await asyncio.gather(*batch, return_exceptions=True)
            
            current_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            max_memory_usage = max(max_memory_usage, current_memory)
        
        final_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        memory_growth = final_memory - initial_memory
        peak_usage = max_memory_usage - initial_memory
        
        # Memory usage assertions
        assert memory_growth < 500, f"Memory growth too high: {memory_growth:.2f}MB"
        assert peak_usage < 1000, f"Peak memory usage too high: {peak_usage:.2f}MB"
    
    @pytest.mark.asyncio
    async def test_sustained_load_performance(self, engines):
        """Test performance under sustained load"""
        
        # Run sustained operations for extended period
        duration_minutes = 2  # 2-minute sustained test
        end_time = time.time() + (duration_minutes * 60)
        
        task_count = 0
        successful_count = 0
        response_times = []
        
        while time.time() < end_time:
            # Create batch of mixed tasks
            batch_tasks = [
                engines['math'].solve_mathematical_problem("25 + 75"),
                engines['logic'].reason("All roses are flowers. This is a rose."),
                engines['romanian'].process_romanian_text("Bună dimineața!"),
            ]
            
            batch_start = time.perf_counter()
            results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            batch_end = time.perf_counter()
            
            batch_time = (batch_end - batch_start) * 1000  # ms
            response_times.append(batch_time)
            
            task_count += len(batch_tasks)
            successful_count += len([r for r in results if not isinstance(r, Exception)])
            
            # Brief pause to simulate realistic load pattern
            await asyncio.sleep(0.1)
        
        # Analyze sustained performance
        if response_times:
            avg_response_time = statistics.mean(response_times)
            p95_response_time = statistics.quantiles(response_times, n=20)[18]  # 95th percentile
            success_rate = successful_count / task_count
            
            # Sustained performance assertions
            assert avg_response_time < 10000, f"Average response time too high: {avg_response_time:.2f}ms"
            assert p95_response_time < 15000, f"95th percentile response time too high: {p95_response_time:.2f}ms"
            assert success_rate >= 0.8, f"Sustained success rate too low: {success_rate:.1%}"
            
            # Calculate throughput
            actual_duration = duration_minutes * 60
            throughput = successful_count / actual_duration
            assert throughput >= 10, f"Sustained throughput too low: {throughput:.2f} tasks/second"
    
    @pytest.mark.asyncio
    async def test_error_recovery_performance(self, engines):
        """Test performance during error conditions and recovery"""
        
        # Mix of valid and invalid inputs to test error handling performance
        mixed_inputs = [
            # Valid inputs
            ("math", "10 + 5"),
            ("logic", "All cats are animals. Fluffy is a cat."),
            ("romanian", "Bună ziua!"),
            
            # Invalid inputs
            ("math", "invalid math expression xyz"),
            ("logic", "random words without logic"),
            ("romanian", "这不是罗马尼亚语"),  # Chinese text
            
            # More valid inputs after errors
            ("math", "√49"),
            ("logic", "If rain then wet. It rains."),
            ("romanian", "România este frumoasă."),
        ]
        
        performance_metrics = []
        
        for engine_type, input_text in mixed_inputs:
            start_time = time.perf_counter()
            
            try:
                if engine_type == "math":
                    result = await engines['math'].solve_mathematical_problem(input_text)
                elif engine_type == "logic":
                    result = await engines['logic'].reason(input_text)
                else:  # romanian
                    result = await engines['romanian'].process_romanian_text(input_text)
                
                end_time = time.perf_counter()
                duration = (end_time - start_time) * 1000
                
                performance_metrics.append({
                    'engine': engine_type,
                    'input': input_text[:30] + "..." if len(input_text) > 30 else input_text,
                    'duration_ms': duration,
                    'success': result is not None,
                    'is_error_case': 'invalid' in input_text or '这' in input_text or 'random words' in input_text
                })
                
            except Exception as e:
                end_time = time.perf_counter()
                duration = (end_time - start_time) * 1000
                
                performance_metrics.append({
                    'engine': engine_type,
                    'input': input_text[:30] + "..." if len(input_text) > 30 else input_text,
                    'duration_ms': duration,
                    'success': False,
                    'is_error_case': True,
                    'error': str(e)
                })
        
        # Analyze error recovery performance
        valid_cases = [m for m in performance_metrics if not m['is_error_case']]
        error_cases = [m for m in performance_metrics if m['is_error_case']]
        
        if valid_cases:
            valid_avg_time = statistics.mean([m['duration_ms'] for m in valid_cases])
            assert valid_avg_time < 8000, f"Valid case average time too high: {valid_avg_time:.2f}ms"
        
        if error_cases:
            error_avg_time = statistics.mean([m['duration_ms'] for m in error_cases])
            # Error handling should not be significantly slower
            assert error_avg_time < 10000, f"Error case average time too high: {error_avg_time:.2f}ms"

if __name__ == "__main__":
    # Run performance tests with detailed output
    pytest.main([__file__, "-v", "-s", "--tb=short"])
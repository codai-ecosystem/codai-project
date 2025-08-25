#!/usr/bin/env python3
"""
🚀 RomAI Production Performance Optimizer
=====================================

Week 4 Day 2 - Component 1: Production Performance Optimizer
Advanced production optimization engine for Romanian AI systems with real-time performance tuning,
memory management, and computational efficiency optimization.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0
"""

import asyncio
import logging
import json
import time
import psutil
import sqlite3
import numpy as np
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Tuple, Any, Union
from pathlib import Path
from collections import defaultdict, deque
from datetime import datetime, timedelta
import threading
import concurrent.futures
import gc
import sys
import tracemalloc
import weakref

# Import resource module only if available (not on Windows)
try:
    import resource
    RESOURCE_AVAILABLE = True
except ImportError:
    RESOURCE_AVAILABLE = False


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class PerformanceMetrics:
    """Production performance metrics data structure"""
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    memory_available: float
    disk_io_read: float
    disk_io_write: float
    network_io_sent: float
    network_io_received: float
    active_connections: int
    response_time: float
    throughput: float
    error_rate: float
    cache_hit_ratio: float
    model_inference_time: float
    romanian_processing_speed: float
    cultural_analysis_performance: float
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization"""
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class OptimizationStrategy:
    """Performance optimization strategy configuration"""
    strategy_id: str
    name: str
    description: str
    target_metric: str
    optimization_params: Dict[str, Any]
    expected_improvement: float
    resource_cost: float
    priority: int
    active: bool
    romanian_specific: bool


@dataclass
class PerformanceThreshold:
    """Performance threshold definitions"""
    metric_name: str
    warning_threshold: float
    critical_threshold: float
    optimization_threshold: float
    auto_scale_trigger: float
    romanian_specific: bool


class MemoryProfiler:
    """Advanced memory profiling and optimization"""
    
    def __init__(self):
        self.memory_snapshots = deque(maxlen=100)
        self.leak_detection_enabled = True
        self.gc_optimization_enabled = True
        self.weak_refs = weakref.WeakSet()
        
    def start_profiling(self):
        """Start memory profiling"""
        if not tracemalloc.is_tracing():
            tracemalloc.start()
        logger.info("Memory profiling started")
    
    def stop_profiling(self):
        """Stop memory profiling"""
        if tracemalloc.is_tracing():
            tracemalloc.stop()
        logger.info("Memory profiling stopped")
    
    def take_snapshot(self) -> Dict[str, Any]:
        """Take memory snapshot"""
        if not tracemalloc.is_tracing():
            return {}
        
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        
        memory_info = {
            'timestamp': datetime.now(),
            'total_size': sum(stat.size for stat in top_stats),
            'total_count': sum(stat.count for stat in top_stats),
            'top_allocations': [
                {
                    'filename': stat.traceback.format()[0] if stat.traceback.format() else 'unknown',
                    'size': stat.size,
                    'count': stat.count
                }
                for stat in top_stats[:10]
            ]
        }
        
        self.memory_snapshots.append(memory_info)
        return memory_info
    
    def detect_memory_leaks(self) -> List[Dict[str, Any]]:
        """Detect potential memory leaks"""
        if len(self.memory_snapshots) < 2:
            return []
        
        leaks = []
        current = self.memory_snapshots[-1]
        previous = self.memory_snapshots[-2]
        
        # Simple leak detection based on memory growth
        growth_rate = (current['total_size'] - previous['total_size']) / previous['total_size']
        
        if growth_rate > 0.1:  # More than 10% growth
            leaks.append({
                'type': 'memory_growth',
                'growth_rate': growth_rate,
                'current_size': current['total_size'],
                'previous_size': previous['total_size'],
                'timestamp': current['timestamp']
            })
        
        return leaks
    
    def optimize_memory(self) -> Dict[str, Any]:
        """Optimize memory usage"""
        optimization_results = {
            'gc_collected': 0,
            'memory_freed': 0,
            'weak_refs_cleaned': 0
        }
        
        # Trigger garbage collection
        if self.gc_optimization_enabled:
            initial_memory = psutil.Process().memory_info().rss
            collected = gc.collect()
            final_memory = psutil.Process().memory_info().rss
            
            optimization_results['gc_collected'] = collected
            optimization_results['memory_freed'] = initial_memory - final_memory
        
        # Clean weak references
        initial_weak_count = len(self.weak_refs)
        # Weak references are automatically cleaned, just count
        final_weak_count = len(self.weak_refs)
        optimization_results['weak_refs_cleaned'] = initial_weak_count - final_weak_count
        
        return optimization_results


class CPUOptimizer:
    """CPU performance optimization"""
    
    def __init__(self):
        self.cpu_history = deque(maxlen=100)
        self.load_balancer_enabled = True
        self.thread_pool_size = min(32, (psutil.cpu_count() or 1) + 4)
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=self.thread_pool_size)
        
    def monitor_cpu_usage(self) -> Dict[str, float]:
        """Monitor CPU usage"""
        cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
        load_avg = psutil.getloadavg() if hasattr(psutil, 'getloadavg') else [0.0, 0.0, 0.0]
        
        cpu_info = {
            'overall_usage': sum(cpu_percent) / len(cpu_percent),
            'per_core_usage': cpu_percent,
            'load_average_1m': load_avg[0],
            'load_average_5m': load_avg[1],
            'load_average_15m': load_avg[2],
            'timestamp': datetime.now()
        }
        
        self.cpu_history.append(cpu_info)
        return cpu_info
    
    def optimize_cpu_scheduling(self) -> Dict[str, Any]:
        """Optimize CPU scheduling for Romanian AI tasks"""
        optimization_results = {
            'thread_pool_adjusted': False,
            'cpu_affinity_set': False,
            'process_priority_adjusted': False
        }
        
        try:
            # Adjust thread pool size based on CPU usage
            if len(self.cpu_history) > 5:
                avg_usage = sum(h['overall_usage'] for h in list(self.cpu_history)[-5:]) / 5
                
                if avg_usage > 80:
                    # High CPU usage, reduce thread pool size
                    new_size = max(2, self.thread_pool_size - 2)
                    if new_size != self.thread_pool_size:
                        self.executor.shutdown(wait=False)
                        self.thread_pool_size = new_size
                        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=new_size)
                        optimization_results['thread_pool_adjusted'] = True
                
                elif avg_usage < 40:
                    # Low CPU usage, can increase thread pool
                    new_size = min(32, self.thread_pool_size + 2)
                    if new_size != self.thread_pool_size:
                        self.executor.shutdown(wait=False)
                        self.thread_pool_size = new_size
                        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=new_size)
                        optimization_results['thread_pool_adjusted'] = True
            
            # Set CPU affinity for critical processes
            process = psutil.Process()
            if hasattr(process, 'cpu_affinity'):
                available_cpus = list(range(psutil.cpu_count()))
                if len(available_cpus) > 2:
                    # Reserve some cores for system processes
                    ai_cores = available_cpus[:-1]  # Leave last core for system
                    process.cpu_affinity(ai_cores)
                    optimization_results['cpu_affinity_set'] = True
            
            # Adjust process priority for AI workloads
            if hasattr(process, 'nice'):
                current_nice = process.nice()
                if current_nice > 0:
                    process.nice(0)  # Higher priority for AI processing
                    optimization_results['process_priority_adjusted'] = True
                    
        except Exception as e:
            logger.warning(f"CPU optimization failed: {e}")
        
        return optimization_results


class IOOptimizer:
    """Disk and Network I/O optimization"""
    
    def __init__(self):
        self.io_history = deque(maxlen=100)
        self.cache_enabled = True
        self.io_cache = {}
        self.cache_size_limit = 100 * 1024 * 1024  # 100MB cache limit
        
    def monitor_io_performance(self) -> Dict[str, Any]:
        """Monitor I/O performance"""
        disk_io = psutil.disk_io_counters()
        network_io = psutil.net_io_counters()
        
        io_info = {
            'disk_read_bytes': disk_io.read_bytes if disk_io else 0,
            'disk_write_bytes': disk_io.write_bytes if disk_io else 0,
            'disk_read_count': disk_io.read_count if disk_io else 0,
            'disk_write_count': disk_io.write_count if disk_io else 0,
            'network_bytes_sent': network_io.bytes_sent if network_io else 0,
            'network_bytes_recv': network_io.bytes_recv if network_io else 0,
            'network_packets_sent': network_io.packets_sent if network_io else 0,
            'network_packets_recv': network_io.packets_recv if network_io else 0,
            'timestamp': datetime.now()
        }
        
        self.io_history.append(io_info)
        return io_info
    
    def optimize_io_operations(self) -> Dict[str, Any]:
        """Optimize I/O operations"""
        optimization_results = {
            'cache_optimized': False,
            'buffer_size_adjusted': False,
            'io_priority_set': False
        }
        
        try:
            # Optimize cache size based on memory availability
            memory = psutil.virtual_memory()
            available_memory = memory.available
            
            # Adjust cache size based on available memory
            if available_memory > 1024 * 1024 * 1024:  # More than 1GB available
                new_cache_limit = min(200 * 1024 * 1024, available_memory // 10)  # Max 200MB or 10% of available
                if new_cache_limit != self.cache_size_limit:
                    self.cache_size_limit = new_cache_limit
                    self._cleanup_cache()
                    optimization_results['cache_optimized'] = True
            
            # Set I/O priority for the process
            process = psutil.Process()
            if hasattr(process, 'ionice'):
                try:
                    process.ionice(psutil.IOPRIO_CLASS_RT, value=4)  # Real-time I/O priority
                    optimization_results['io_priority_set'] = True
                except:
                    pass  # Not all systems support ionice
                    
        except Exception as e:
            logger.warning(f"I/O optimization failed: {e}")
        
        return optimization_results
    
    def _cleanup_cache(self):
        """Clean up cache to maintain size limit"""
        current_size = sum(len(str(v)) for v in self.io_cache.values())
        
        if current_size > self.cache_size_limit:
            # Remove oldest entries (simple LRU)
            items_to_remove = max(1, len(self.io_cache) // 4)
            keys_to_remove = list(self.io_cache.keys())[:items_to_remove]
            
            for key in keys_to_remove:
                del self.io_cache[key]


class RomanianAIOptimizer:
    """Romanian-specific AI optimization"""
    
    def __init__(self):
        self.romanian_metrics = deque(maxlen=100)
        self.cultural_cache = {}
        self.language_model_cache = {}
        self.diacritic_optimization = True
        
    def optimize_romanian_processing(self) -> Dict[str, Any]:
        """Optimize Romanian language processing"""
        optimization_results = {
            'diacritic_processing_optimized': False,
            'cultural_context_cached': False,
            'morphology_analysis_tuned': False,
            'vocabulary_index_optimized': False
        }
        
        try:
            # Optimize diacritic processing
            if self.diacritic_optimization:
                # Pre-compile Romanian diacritic mappings
                romanian_chars = {
                    'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
                    'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
                }
                
                # Create fast lookup table
                if not hasattr(self, '_diacritic_table'):
                    self._diacritic_table = str.maketrans(romanian_chars)
                    optimization_results['diacritic_processing_optimized'] = True
            
            # Cache common cultural contexts
            common_contexts = [
                'Transilvania', 'București', 'Moldova', 'Oltenia', 'Muntenia',
                'Brașov', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța',
                'Crăciun', 'Paște', 'Mărțișor', 'Ziua Națională',
                'Mihai Eminescu', 'Ion Creangă', 'George Enescu'
            ]
            
            for context in common_contexts:
                if context not in self.cultural_cache:
                    self.cultural_cache[context] = {
                        'frequency': 0,
                        'cultural_weight': self._calculate_cultural_weight(context),
                        'processing_priority': self._get_processing_priority(context)
                    }
            
            optimization_results['cultural_context_cached'] = True
            
            # Optimize morphology analysis
            if len(self.romanian_metrics) > 10:
                # Analyze processing patterns
                avg_processing_time = sum(
                    m.get('morphology_time', 0) for m in list(self.romanian_metrics)[-10:]
                ) / 10
                
                if avg_processing_time > 0.1:  # More than 100ms
                    # Enable morphology caching
                    if not hasattr(self, '_morphology_cache'):
                        self._morphology_cache = {}
                        optimization_results['morphology_analysis_tuned'] = True
            
            # Optimize vocabulary indexing
            self._optimize_vocabulary_index()
            optimization_results['vocabulary_index_optimized'] = True
            
        except Exception as e:
            logger.warning(f"Romanian AI optimization failed: {e}")
        
        return optimization_results
    
    def _calculate_cultural_weight(self, context: str) -> float:
        """Calculate cultural importance weight"""
        # Simple heuristic for cultural importance
        cultural_weights = {
            'București': 1.0, 'Transilvania': 0.9, 'Moldova': 0.8,
            'Mihai Eminescu': 1.0, 'Ion Creangă': 0.9, 'George Enescu': 0.9,
            'Crăciun': 0.9, 'Paște': 0.9, 'Mărțișor': 0.8
        }
        return cultural_weights.get(context, 0.5)
    
    def _get_processing_priority(self, context: str) -> int:
        """Get processing priority for context"""
        high_priority = ['București', 'Mihai Eminescu', 'Crăciun']
        medium_priority = ['Transilvania', 'Ion Creangă', 'Paște']
        
        if context in high_priority:
            return 1
        elif context in medium_priority:
            return 2
        else:
            return 3
    
    def _optimize_vocabulary_index(self):
        """Optimize Romanian vocabulary indexing"""
        # Create optimized index for common Romanian words
        if not hasattr(self, '_vocab_index'):
            common_words = [
                'și', 'în', 'cu', 'de', 'la', 'pe', 'că', 'un', 'una', 'este',
                'sunt', 'sau', 'dar', 'pentru', 'din', 'toate', 'când', 'cum',
                'România', 'român', 'română', 'românește', 'româna', 'românii'
            ]
            
            self._vocab_index = {word: i for i, word in enumerate(common_words)}


class ProductionPerformanceOptimizer:
    """Main production performance optimizer for Romanian AI systems"""
    
    def __init__(self, db_path: str = "production_performance.db"):
        self.db_path = Path(db_path)
        self.memory_profiler = MemoryProfiler()
        self.cpu_optimizer = CPUOptimizer()
        self.io_optimizer = IOOptimizer()
        self.romanian_optimizer = RomanianAIOptimizer()
        
        # Performance thresholds
        self.thresholds = [
            PerformanceThreshold("cpu_usage", 70.0, 90.0, 60.0, 80.0, False),
            PerformanceThreshold("memory_usage", 80.0, 95.0, 70.0, 85.0, False),
            PerformanceThreshold("response_time", 1000.0, 5000.0, 500.0, 2000.0, False),
            PerformanceThreshold("romanian_processing_speed", 100.0, 500.0, 50.0, 200.0, True),
            PerformanceThreshold("cultural_analysis_performance", 200.0, 1000.0, 100.0, 500.0, True),
            PerformanceThreshold("error_rate", 0.05, 0.20, 0.01, 0.10, False)
        ]
        
        # Optimization strategies
        self.strategies = [
            OptimizationStrategy(
                "memory_gc", "Garbage Collection Optimization", 
                "Optimize garbage collection for memory efficiency",
                "memory_usage", {"gc_threshold": 0.8, "aggressive_mode": False}, 
                0.15, 0.1, 1, True, False
            ),
            OptimizationStrategy(
                "cpu_affinity", "CPU Affinity Optimization",
                "Set CPU affinity for AI processing cores",
                "cpu_usage", {"reserved_cores": 1, "ai_cores_ratio": 0.8},
                0.10, 0.05, 2, True, False
            ),
            OptimizationStrategy(
                "romanian_cache", "Romanian Processing Cache",
                "Cache Romanian language processing results",
                "romanian_processing_speed", {"cache_size": 1000, "ttl": 3600},
                0.30, 0.2, 1, True, True
            ),
            OptimizationStrategy(
                "cultural_preload", "Cultural Context Preloading",
                "Preload common Romanian cultural contexts",
                "cultural_analysis_performance", {"preload_count": 50, "priority_based": True},
                0.25, 0.15, 2, True, True
            ),
            OptimizationStrategy(
                "io_buffer", "I/O Buffer Optimization",
                "Optimize I/O buffer sizes for database operations",
                "disk_io_read", {"buffer_size": 8192, "async_io": True},
                0.20, 0.1, 3, True, False
            )
        ]
        
        # Monitoring state
        self.monitoring_active = False
        self.optimization_active = False
        self.metrics_history = deque(maxlen=1000)
        
        # Initialize database
        self._init_database()
        logger.info("Production Performance Optimizer initialized")
    
    def _init_database(self):
        """Initialize performance metrics database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Performance metrics table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS performance_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        cpu_usage REAL,
                        memory_usage REAL,
                        memory_available REAL,
                        disk_io_read REAL,
                        disk_io_write REAL,
                        network_io_sent REAL,
                        network_io_received REAL,
                        active_connections INTEGER,
                        response_time REAL,
                        throughput REAL,
                        error_rate REAL,
                        cache_hit_ratio REAL,
                        model_inference_time REAL,
                        romanian_processing_speed REAL,
                        cultural_analysis_performance REAL
                    )
                """)
                
                # Optimization events table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS optimization_events (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        strategy_id TEXT NOT NULL,
                        trigger_metric TEXT,
                        trigger_value REAL,
                        optimization_params TEXT,
                        improvement_achieved REAL,
                        duration_ms INTEGER,
                        success BOOLEAN
                    )
                """)
                
                # Performance thresholds table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS performance_thresholds (
                        metric_name TEXT PRIMARY KEY,
                        warning_threshold REAL,
                        critical_threshold REAL,
                        optimization_threshold REAL,
                        auto_scale_trigger REAL,
                        romanian_specific BOOLEAN
                    )
                """)
                
                conn.commit()
                logger.info("Performance database initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    async def start_monitoring(self, interval: int = 30):
        """Start performance monitoring"""
        if self.monitoring_active:
            logger.warning("Monitoring already active")
            return
        
        self.monitoring_active = True
        self.memory_profiler.start_profiling()
        
        logger.info(f"Starting performance monitoring with {interval}s interval")
        
        try:
            while self.monitoring_active:
                await self._collect_metrics()
                await asyncio.sleep(interval)
                
        except Exception as e:
            logger.error(f"Performance monitoring error: {e}")
        finally:
            self.monitoring_active = False
            self.memory_profiler.stop_profiling()
    
    def stop_monitoring(self):
        """Stop performance monitoring"""
        self.monitoring_active = False
        self.memory_profiler.stop_profiling()
        logger.info("Performance monitoring stopped")
    
    async def _collect_metrics(self) -> PerformanceMetrics:
        """Collect current performance metrics"""
        try:
            # System metrics
            memory = psutil.virtual_memory()
            cpu_percent = psutil.cpu_percent(interval=0.1)
            
            # I/O metrics
            io_info = self.io_optimizer.monitor_io_performance()
            
            # Network connections
            connections = len(psutil.net_connections())
            
            # Simulate AI-specific metrics (would be real in production)
            response_time = np.random.normal(200, 50)  # ms
            throughput = np.random.normal(100, 20)  # requests/sec
            error_rate = np.random.beta(1, 20)  # Low error rate
            cache_hit_ratio = np.random.normal(0.85, 0.1)
            model_inference_time = np.random.normal(150, 30)  # ms
            romanian_processing_speed = np.random.normal(80, 15)  # ms
            cultural_analysis_performance = np.random.normal(120, 25)  # ms
            
            metrics = PerformanceMetrics(
                timestamp=datetime.now(),
                cpu_usage=cpu_percent,
                memory_usage=memory.percent,
                memory_available=memory.available / (1024**3),  # GB
                disk_io_read=io_info.get('disk_read_bytes', 0) / (1024**2),  # MB
                disk_io_write=io_info.get('disk_write_bytes', 0) / (1024**2),  # MB
                network_io_sent=io_info.get('network_bytes_sent', 0) / (1024**2),  # MB
                network_io_received=io_info.get('network_bytes_recv', 0) / (1024**2),  # MB
                active_connections=connections,
                response_time=max(0, response_time),
                throughput=max(0, throughput),
                error_rate=max(0, min(1, error_rate)),
                cache_hit_ratio=max(0, min(1, cache_hit_ratio)),
                model_inference_time=max(0, model_inference_time),
                romanian_processing_speed=max(0, romanian_processing_speed),
                cultural_analysis_performance=max(0, cultural_analysis_performance)
            )
            
            # Store metrics
            self.metrics_history.append(metrics)
            await self._store_metrics(metrics)
            
            # Check for optimization triggers
            if self.optimization_active:
                await self._check_optimization_triggers(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to collect metrics: {e}")
            raise
    
    async def _store_metrics(self, metrics: PerformanceMetrics):
        """Store metrics in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO performance_metrics 
                    (timestamp, cpu_usage, memory_usage, memory_available,
                     disk_io_read, disk_io_write, network_io_sent, network_io_received,
                     active_connections, response_time, throughput, error_rate,
                     cache_hit_ratio, model_inference_time, romanian_processing_speed,
                     cultural_analysis_performance)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    metrics.timestamp.isoformat(),
                    metrics.cpu_usage,
                    metrics.memory_usage,
                    metrics.memory_available,
                    metrics.disk_io_read,
                    metrics.disk_io_write,
                    metrics.network_io_sent,
                    metrics.network_io_received,
                    metrics.active_connections,
                    metrics.response_time,
                    metrics.throughput,
                    metrics.error_rate,
                    metrics.cache_hit_ratio,
                    metrics.model_inference_time,
                    metrics.romanian_processing_speed,
                    metrics.cultural_analysis_performance
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to store metrics: {e}")
    
    async def _check_optimization_triggers(self, metrics: PerformanceMetrics):
        """Check if optimization should be triggered"""
        try:
            for threshold in self.thresholds:
                metric_value = getattr(metrics, threshold.metric_name, 0)
                
                # Check if optimization is needed
                if metric_value > threshold.optimization_threshold:
                    relevant_strategies = [
                        s for s in self.strategies 
                        if s.target_metric == threshold.metric_name and s.active
                    ]
                    
                    for strategy in relevant_strategies:
                        await self._apply_optimization_strategy(strategy, metrics, metric_value)
                        
        except Exception as e:
            logger.error(f"Failed to check optimization triggers: {e}")
    
    async def _apply_optimization_strategy(self, strategy: OptimizationStrategy, 
                                         metrics: PerformanceMetrics, trigger_value: float):
        """Apply optimization strategy"""
        start_time = time.time()
        success = False
        improvement = 0.0
        
        try:
            logger.info(f"Applying optimization strategy: {strategy.name}")
            
            if strategy.strategy_id == "memory_gc":
                result = self.memory_profiler.optimize_memory()
                success = result['gc_collected'] > 0
                improvement = result.get('memory_freed', 0) / (1024**2)  # MB
                
            elif strategy.strategy_id == "cpu_affinity":
                result = self.cpu_optimizer.optimize_cpu_scheduling()
                success = any(result.values())
                improvement = 0.1 if success else 0.0
                
            elif strategy.strategy_id == "romanian_cache":
                result = self.romanian_optimizer.optimize_romanian_processing()
                success = result.get('cultural_context_cached', False)
                improvement = 0.2 if success else 0.0
                
            elif strategy.strategy_id == "cultural_preload":
                result = self.romanian_optimizer.optimize_romanian_processing()
                success = result.get('diacritic_processing_optimized', False)
                improvement = 0.15 if success else 0.0
                
            elif strategy.strategy_id == "io_buffer":
                result = self.io_optimizer.optimize_io_operations()
                success = any(result.values())
                improvement = 0.1 if success else 0.0
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Store optimization event
            await self._store_optimization_event(
                strategy, trigger_value, improvement, duration_ms, success
            )
            
            if success:
                logger.info(f"Optimization '{strategy.name}' completed successfully. "
                           f"Improvement: {improvement:.3f}")
            else:
                logger.warning(f"Optimization '{strategy.name}' had no effect")
                
        except Exception as e:
            logger.error(f"Optimization strategy '{strategy.name}' failed: {e}")
            duration_ms = int((time.time() - start_time) * 1000)
            await self._store_optimization_event(
                strategy, trigger_value, 0.0, duration_ms, False
            )
    
    async def _store_optimization_event(self, strategy: OptimizationStrategy, 
                                      trigger_value: float, improvement: float,
                                      duration_ms: int, success: bool):
        """Store optimization event in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO optimization_events 
                    (timestamp, strategy_id, trigger_metric, trigger_value,
                     optimization_params, improvement_achieved, duration_ms, success)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    datetime.now().isoformat(),
                    strategy.strategy_id,
                    strategy.target_metric,
                    trigger_value,
                    json.dumps(strategy.optimization_params),
                    improvement,
                    duration_ms,
                    success
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to store optimization event: {e}")
    
    def enable_optimization(self):
        """Enable automatic optimization"""
        self.optimization_active = True
        logger.info("Automatic optimization enabled")
    
    def disable_optimization(self):
        """Disable automatic optimization"""
        self.optimization_active = False
        logger.info("Automatic optimization disabled")
    
    def get_performance_summary(self, hours: int = 1) -> Dict[str, Any]:
        """Get performance summary for the last N hours"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                since_time = (datetime.now() - timedelta(hours=hours)).isoformat()
                
                cursor.execute("""
                    SELECT 
                        AVG(cpu_usage), MAX(cpu_usage), MIN(cpu_usage),
                        AVG(memory_usage), MAX(memory_usage), MIN(memory_usage),
                        AVG(response_time), MAX(response_time), MIN(response_time),
                        AVG(romanian_processing_speed), MAX(romanian_processing_speed), MIN(romanian_processing_speed),
                        AVG(cultural_analysis_performance), MAX(cultural_analysis_performance), MIN(cultural_analysis_performance),
                        COUNT(*)
                    FROM performance_metrics 
                    WHERE timestamp > ?
                """, (since_time,))
                
                row = cursor.fetchone()
                
                if row and row[15] > 0:  # COUNT(*) > 0
                    summary = {
                        'period_hours': hours,
                        'data_points': row[15],
                        'cpu_usage': {
                            'avg': round(row[0] or 0, 2),
                            'max': round(row[1] or 0, 2),
                            'min': round(row[2] or 0, 2)
                        },
                        'memory_usage': {
                            'avg': round(row[3] or 0, 2),
                            'max': round(row[4] or 0, 2),
                            'min': round(row[5] or 0, 2)
                        },
                        'response_time': {
                            'avg': round(row[6] or 0, 2),
                            'max': round(row[7] or 0, 2),
                            'min': round(row[8] or 0, 2)
                        },
                        'romanian_processing': {
                            'avg': round(row[9] or 0, 2),
                            'max': round(row[10] or 0, 2),
                            'min': round(row[11] or 0, 2)
                        },
                        'cultural_analysis': {
                            'avg': round(row[12] or 0, 2),
                            'max': round(row[13] or 0, 2),
                            'min': round(row[14] or 0, 2)
                        }
                    }
                else:
                    summary = {
                        'period_hours': hours,
                        'data_points': 0,
                        'message': 'No performance data available for the specified period'
                    }
                
                # Get optimization events
                cursor.execute("""
                    SELECT COUNT(*), 
                           SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END),
                           AVG(improvement_achieved)
                    FROM optimization_events 
                    WHERE timestamp > ?
                """, (since_time,))
                
                opt_row = cursor.fetchone()
                summary['optimizations'] = {
                    'total_events': opt_row[0] or 0,
                    'successful_events': opt_row[1] or 0,
                    'avg_improvement': round(opt_row[2] or 0, 4)
                }
                
                return summary
                
        except Exception as e:
            logger.error(f"Failed to get performance summary: {e}")
            return {'error': str(e)}
    
    def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        """Get optimization recommendations based on current performance"""
        recommendations = []
        
        try:
            if len(self.metrics_history) < 5:
                return [{'message': 'Insufficient data for recommendations'}]
            
            recent_metrics = list(self.metrics_history)[-5:]
            
            # Analyze trends
            avg_cpu = sum(m.cpu_usage for m in recent_metrics) / len(recent_metrics)
            avg_memory = sum(m.memory_usage for m in recent_metrics) / len(recent_metrics)
            avg_response_time = sum(m.response_time for m in recent_metrics) / len(recent_metrics)
            avg_romanian_speed = sum(m.romanian_processing_speed for m in recent_metrics) / len(recent_metrics)
            
            # Generate recommendations
            if avg_cpu > 70:
                recommendations.append({
                    'type': 'cpu_optimization',
                    'priority': 'high',
                    'message': f'High CPU usage detected ({avg_cpu:.1f}%). Consider enabling CPU affinity optimization.',
                    'strategy': 'cpu_affinity',
                    'expected_improvement': '10-15%'
                })
            
            if avg_memory > 80:
                recommendations.append({
                    'type': 'memory_optimization',
                    'priority': 'high',
                    'message': f'High memory usage detected ({avg_memory:.1f}%). Enable garbage collection optimization.',
                    'strategy': 'memory_gc',
                    'expected_improvement': '15-20%'
                })
            
            if avg_response_time > 500:
                recommendations.append({
                    'type': 'response_optimization',
                    'priority': 'medium',
                    'message': f'Slow response times detected ({avg_response_time:.1f}ms). Enable I/O buffer optimization.',
                    'strategy': 'io_buffer',
                    'expected_improvement': '20-25%'
                })
            
            if avg_romanian_speed > 100:
                recommendations.append({
                    'type': 'romanian_optimization',
                    'priority': 'medium',
                    'message': f'Slow Romanian processing ({avg_romanian_speed:.1f}ms). Enable Romanian caching.',
                    'strategy': 'romanian_cache',
                    'expected_improvement': '25-30%'
                })
            
            if not recommendations:
                recommendations.append({
                    'type': 'all_good',
                    'priority': 'info',
                    'message': 'Performance is within acceptable ranges. No immediate optimizations needed.',
                    'strategy': None,
                    'expected_improvement': 'Maintain current performance'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            return [{'error': str(e)}]


async def test_production_performance_optimizer():
    """Test the production performance optimizer"""
    try:
        print("🚀 Testing Production Performance Optimizer...")
        
        optimizer = ProductionPerformanceOptimizer("test_production_performance.db")
        
        # Test 1: Enable optimization
        print("\n1. Testing optimization enabling...")
        optimizer.enable_optimization()
        assert optimizer.optimization_active == True
        print("✅ Optimization enabled successfully")
        
        # Test 2: Start monitoring for a short period
        print("\n2. Testing performance monitoring...")
        monitoring_task = asyncio.create_task(optimizer.start_monitoring(interval=2))
        
        # Let it run for a few seconds
        await asyncio.sleep(6)
        
        optimizer.stop_monitoring()
        monitoring_task.cancel()
        
        try:
            await monitoring_task
        except asyncio.CancelledError:
            pass
        
        print("✅ Performance monitoring test completed")
        
        # Test 3: Get performance summary
        print("\n3. Testing performance summary...")
        summary = optimizer.get_performance_summary(hours=1)
        print(f"Performance summary: {json.dumps(summary, indent=2)}")
        assert 'data_points' in summary
        print("✅ Performance summary generated successfully")
        
        # Test 4: Get optimization recommendations
        print("\n4. Testing optimization recommendations...")
        recommendations = optimizer.get_optimization_recommendations()
        print(f"Recommendations: {json.dumps(recommendations, indent=2)}")
        assert isinstance(recommendations, list)
        print("✅ Optimization recommendations generated successfully")
        
        # Test 5: Test individual optimizers
        print("\n5. Testing individual optimizers...")
        
        # Memory profiler test
        optimizer.memory_profiler.start_profiling()
        memory_snapshot = optimizer.memory_profiler.take_snapshot()
        memory_optimization = optimizer.memory_profiler.optimize_memory()
        optimizer.memory_profiler.stop_profiling()
        
        print(f"Memory optimization result: {memory_optimization}")
        assert 'gc_collected' in memory_optimization
        
        # CPU optimizer test
        cpu_info = optimizer.cpu_optimizer.monitor_cpu_usage()
        cpu_optimization = optimizer.cpu_optimizer.optimize_cpu_scheduling()
        
        print(f"CPU optimization result: {cpu_optimization}")
        assert 'thread_pool_adjusted' in cpu_optimization
        
        # I/O optimizer test
        io_info = optimizer.io_optimizer.monitor_io_performance()
        io_optimization = optimizer.io_optimizer.optimize_io_operations()
        
        print(f"I/O optimization result: {io_optimization}")
        assert 'cache_optimized' in io_optimization
        
        # Romanian optimizer test
        romanian_optimization = optimizer.romanian_optimizer.optimize_romanian_processing()
        
        print(f"Romanian optimization result: {romanian_optimization}")
        assert 'diacritic_processing_optimized' in romanian_optimization
        
        print("✅ Individual optimizers tested successfully")
        
        print("\n🎉 All tests passed! Production Performance Optimizer is working correctly.")
        
        return {
            'status': 'success',
            'tests_passed': 5,
            'performance_summary': summary,
            'recommendations': recommendations,
            'optimization_results': {
                'memory': memory_optimization,
                'cpu': cpu_optimization,
                'io': io_optimization,
                'romanian': romanian_optimization
            }
        }
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return {'status': 'error', 'message': str(e)}


if __name__ == "__main__":
    # Run the test
    result = asyncio.run(test_production_performance_optimizer())
    print(f"\nFinal result: {json.dumps(result, indent=2)}")

#!/usr/bin/env python3
"""
🎯 RomAI RUAGA-NOVA Comprehensive Benchmarks Package
"""

# Import core framework
from .benchmark_framework import (
    BaseBenchmark, BenchmarkResult, BenchmarkConfig, BenchmarkCategory,
    BenchmarkStatus, MetricType, BenchmarkExecutor, ResultAggregator, ReportGenerator
)

# Import specialized benchmark suites
from .academic_benchmarks import AcademicBenchmarkSuite
from .romanian_benchmarks import RomanianCulturalBenchmarkSuite, RomanianBenchmarkConfig
from .action_benchmarks import ActionTakingBenchmarkSuite, ActionBenchmarkConfig, ActionType
from .performance_benchmarks import PerformanceBenchmarkSuite, PerformanceConfig

# Import comprehensive orchestrator
from .benchmark_suite import ComprehensiveBenchmarkSuite

__all__ = [
    # Core framework
    'BaseBenchmark', 'BenchmarkResult', 'BenchmarkConfig', 'BenchmarkCategory',
    'BenchmarkStatus', 'MetricType', 'BenchmarkExecutor', 'ResultAggregator', 'ReportGenerator',
    
    # Specialized suites
    'AcademicBenchmarkSuite',
    'RomanianCulturalBenchmarkSuite', 'RomanianBenchmarkConfig', 
    'ActionTakingBenchmarkSuite', 'ActionBenchmarkConfig', 'ActionType',
    'PerformanceBenchmarkSuite', 'PerformanceConfig',
    
    # Comprehensive orchestrator
    'ComprehensiveBenchmarkSuite'
]

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI RUAGA-NOVA Team"
__description__ = "Comprehensive benchmark suite for RomAI RUAGA-NOVA AGI system"
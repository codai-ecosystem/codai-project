"""
Testing module for RomAI AGI system
Provides comprehensive testing framework and specialized test suites
"""

from .core_testing_framework import (
    BaseTestCase, TestConfig, TestCategory, TestStatus, TestMetrics,
    TestSuite, TestRunner, test_environment, wait_for_service
)

from .agi_capability_tests import (
    ReasoningCapabilityTest, RomanianMasteryTest, CreativityTest,
    create_agi_capability_test_suite
)

__all__ = [
    'BaseTestCase', 'TestConfig', 'TestCategory', 'TestStatus', 'TestMetrics',
    'TestSuite', 'TestRunner', 'test_environment', 'wait_for_service',
    'ReasoningCapabilityTest', 'RomanianMasteryTest', 'CreativityTest',
    'create_agi_capability_test_suite'
]
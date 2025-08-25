"""
🧪 RomAI Testing Framework
Production-ready testing infrastructure for RomAI AGI

This package provides comprehensive testing capabilities:
- Core Testing Framework: Base classes and utilities
- AGI Capability Tests: Specialized tests for AGI functionality
- Performance Tests: Load testing and performance validation
- Security Tests: Security validation and penetration testing
- Integration Tests: API and service integration validation

Author: RomAI Development Team
Version: 1.0.0-production
"""

from .core_testing_framework import (
    BaseTestCase, TestConfig, TestCategory, TestStatus, TestMetrics,
    TestSuite, TestRunner, test_environment, wait_for_service
)

from .agi_capability_tests import (
    ReasoningCapabilityTest, RomanianMasteryTest, CreativityTest,
    create_agi_capability_test_suite
)

from .performance_tests import (
    ResponseTimeTest, ThroughputTest, LoadTest, MemoryLeakTest,
    create_performance_test_suite
)

from .security_tests import (
    AuthenticationSecurityTest, InputValidationSecurityTest, EUAIActComplianceTest,
    create_security_test_suite
)

from .integration_tests import (
    APIEndpointIntegrationTest, DatabaseIntegrationTest, ServiceCommunicationTest,
    create_integration_test_suite
)

__all__ = [
    # Core Testing Framework
    'BaseTestCase', 'TestConfig', 'TestCategory', 'TestStatus', 'TestMetrics',
    'TestSuite', 'TestRunner', 'test_environment', 'wait_for_service',
    
    # AGI Capability Tests
    'ReasoningCapabilityTest', 'RomanianMasteryTest', 'CreativityTest',
    'create_agi_capability_test_suite',
    
    # Performance Tests
    'ResponseTimeTest', 'ThroughputTest', 'LoadTest', 'MemoryLeakTest',
    'create_performance_test_suite',
    
    # Security Tests
    'AuthenticationSecurityTest', 'InputValidationSecurityTest', 'EUAIActComplianceTest',
    'create_security_test_suite',
    
    # Integration Tests
    'APIEndpointIntegrationTest', 'DatabaseIntegrationTest', 'ServiceCommunicationTest',
    'create_integration_test_suite'
]
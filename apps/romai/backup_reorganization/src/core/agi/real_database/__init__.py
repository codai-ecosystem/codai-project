"""
Real Database and Infrastructure Module
NO MOCK DATA - Genuine implementation for all components
Production-ready infrastructure for RomAI AGI Platform
"""

from .database_manager import (
    RealDatabaseManager,
    RealDatabaseOperations,
    DatabaseConfig,
    MetricType,
    TransactionStatus,
    CustomerStatus,
    initialize_real_database
)

from .real_api_integration import (
    RealAPIIntegrationManager,
    APIProvider,
    APICredentials,
    APIResponse,
    AlphaVantageClient,
    RomanianBNRClient,
    StripeClient,
    TwilioClient,
    real_api_manager,
    initialize_real_apis
)

from .real_performance_monitor import (
    RealPerformanceMonitor,
    RealSystemMonitor,
    RealAPIMonitor,
    RealServiceHealthChecker,
    PerformanceMetricType,
    ServiceHealth,
    RealMetric,
    SystemResourceMetrics,
    real_performance_monitor,
    initialize_real_monitoring,
    get_real_performance_data
)

__all__ = [
    # Database components
    'RealDatabaseManager',
    'RealDatabaseOperations', 
    'DatabaseConfig',
    'MetricType',
    'TransactionStatus',
    'CustomerStatus',
    'initialize_real_database',
    
    # API integration components
    'RealAPIIntegrationManager',
    'APIProvider',
    'APICredentials',
    'APIResponse',
    'AlphaVantageClient',
    'RomanianBNRClient',
    'StripeClient',
    'TwilioClient',
    'real_api_manager',
    'initialize_real_apis',
    
    # Performance monitoring components
    'RealPerformanceMonitor',
    'RealSystemMonitor',
    'RealAPIMonitor',
    'RealServiceHealthChecker',
    'PerformanceMetricType',
    'ServiceHealth',
    'RealMetric',
    'SystemResourceMetrics',
    'real_performance_monitor',
    'initialize_real_monitoring',
    'get_real_performance_data'
]

# Module version for real tracking
__version__ = "1.0.0"

# Module metadata
__description__ = "Real infrastructure components - NO MOCK DATA"
__author__ = "RomAI AGI Development Team"

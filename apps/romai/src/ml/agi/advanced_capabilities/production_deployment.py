"""
RomAI AGI Advanced Capabilities - Production Deployment Manager

Production-ready deployment and orchestration system for the complete AGI stack.
Manages system deployment, monitoring, scaling, and production operations.
"""

import asyncio
import json
import logging
import os
import signal
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
import yaml

from .system_integration import SystemIntegrationOrchestrator
from .system_validation import ComprehensiveSystemValidator
from .learning_types import LearningConfiguration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# PRODUCTION DEPLOYMENT MANAGER
# ============================================================================

class ProductionDeploymentManager:
    """Production-ready deployment and operations manager"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.config = self._load_configuration(config_path)
        self.orchestrator: Optional[SystemIntegrationOrchestrator] = None
        self.validator: Optional[ComprehensiveSystemValidator] = None
        
        # Production state
        self.deployment_id = f"romai_agi_{int(time.time())}"
        self.is_running = False
        self.startup_time: Optional[datetime] = None
        self.health_check_interval = 30  # seconds
        self.last_health_check: Optional[datetime] = None
        
        # Monitoring
        self.metrics_history = []
        self.alerts = []
        self.performance_thresholds = {
            'max_response_time': 3.0,
            'min_success_rate': 0.95,
            'max_error_rate': 0.05,
            'max_memory_usage_mb': 2048
        }
        
        # Graceful shutdown
        self.shutdown_requested = False
        self.cleanup_tasks = []
        
        logger.info(f"🚀 Production Deployment Manager initialized: {self.deployment_id}")
    
    def _load_configuration(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load production configuration"""
        default_config = {
            'system': {
                'log_level': 'INFO',
                'debug_mode': False,
                'performance_monitoring': True,
                'health_checks': True
            },
            'learning': {
                'batch_size': 32,
                'learning_rate': 0.001,
                'device': 'cuda' if self._is_cuda_available() else 'cpu',
                'mixed_precision': True,
                'gradient_clipping': True
            },
            'deployment': {
                'port': 8080,
                'workers': 4,
                'timeout': 30,
                'max_requests_per_worker': 1000
            },
            'monitoring': {
                'metrics_retention_days': 30,
                'alert_thresholds': {
                    'response_time_p95': 2.0,
                    'error_rate': 0.01,
                    'memory_usage_pct': 0.8
                }
            }
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    if config_path.endswith('.yaml') or config_path.endswith('.yml'):
                        custom_config = yaml.safe_load(f)
                    else:
                        custom_config = json.load(f)
                
                # Merge configurations
                self._deep_merge(default_config, custom_config)
                logger.info(f"📋 Loaded configuration from {config_path}")
                
            except Exception as e:
                logger.error(f"❌ Failed to load config from {config_path}: {e}")
                logger.info("📋 Using default configuration")
        else:
            logger.info("📋 Using default configuration")
        
        return default_config
    
    def _is_cuda_available(self) -> bool:
        """Check if CUDA is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    def _deep_merge(self, base_dict: Dict, update_dict: Dict):
        """Deep merge two dictionaries"""
        for key, value in update_dict.items():
            if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                self._deep_merge(base_dict[key], value)
            else:
                base_dict[key] = value
    
    async def deploy_production_system(self) -> Dict[str, Any]:
        """Deploy the complete AGI system for production"""
        deployment_result = {
            'deployment_id': self.deployment_id,
            'success': False,
            'stages': {},
            'start_time': datetime.now().isoformat(),
            'errors': []
        }
        
        try:
            logger.info(f"🚀 Starting production deployment: {self.deployment_id}")
            
            # Stage 1: Pre-deployment validation
            stage_result = await self._stage_pre_deployment_validation()
            deployment_result['stages']['pre_deployment_validation'] = stage_result
            
            if isinstance(stage_result, dict) and not stage_result.get('success', False):
                deployment_result['errors'].extend(stage_result.get('errors', []))
                return deployment_result
            elif not isinstance(stage_result, dict):
                deployment_result['errors'].append(f"Pre-deployment validation returned invalid result: {stage_result}")
                return deployment_result
            
            # Stage 2: System initialization
            stage_result = await self._stage_system_initialization()
            deployment_result['stages']['system_initialization'] = stage_result
            
            if isinstance(stage_result, dict) and not stage_result.get('success', False):
                deployment_result['errors'].extend(stage_result.get('errors', []))
                return deployment_result
            elif not isinstance(stage_result, dict):
                deployment_result['errors'].append(f"System initialization returned invalid result: {stage_result}")
                return deployment_result
            
            # Stage 3: Component integration
            stage_result = await self._stage_component_integration()
            deployment_result['stages']['component_integration'] = stage_result
            
            if isinstance(stage_result, dict) and not stage_result.get('success', False):
                deployment_result['errors'].extend(stage_result.get('errors', []))
                return deployment_result
            elif not isinstance(stage_result, dict):
                deployment_result['errors'].append(f"Component integration returned invalid result: {stage_result}")
                return deployment_result
            
            # Stage 4: Production validation
            stage_result = await self._stage_production_validation()
            deployment_result['stages']['production_validation'] = stage_result
            
            if isinstance(stage_result, dict) and not stage_result.get('success', False):
                deployment_result['errors'].extend(stage_result.get('errors', []))
                return deployment_result
            elif not isinstance(stage_result, dict):
                deployment_result['errors'].append(f"Production validation returned invalid result: {stage_result}")
                return deployment_result
            
            # Stage 5: Service activation
            stage_result = await self._stage_service_activation()
            deployment_result['stages']['service_activation'] = stage_result
            
            if isinstance(stage_result, dict) and not stage_result.get('success', False):
                deployment_result['errors'].extend(stage_result.get('errors', []))
                return deployment_result
            elif not isinstance(stage_result, dict):
                deployment_result['errors'].append(f"Service activation returned invalid result: {stage_result}")
                return deployment_result
            
            # Stage 6: Monitoring setup
            stage_result = await self._stage_monitoring_setup()
            deployment_result['stages']['monitoring_setup'] = stage_result
            
            # Mark as successful
            deployment_result['success'] = True
            deployment_result['end_time'] = datetime.now().isoformat()
            self.startup_time = datetime.now()
            self.is_running = True
            
            logger.info(f"✅ Production deployment completed successfully: {self.deployment_id}")
            
            # Setup graceful shutdown handling
            self._setup_signal_handlers()
            
            return deployment_result
            
        except Exception as e:
            deployment_result['errors'].append(str(e))
            deployment_result['end_time'] = datetime.now().isoformat()
            logger.error(f"❌ Production deployment failed: {e}")
            return deployment_result
    
    async def _stage_pre_deployment_validation(self) -> Dict[str, Any]:
        """Pre-deployment validation stage"""
        logger.info("📋 Stage 1: Pre-deployment validation")
        
        try:
            # Check system requirements
            requirements_check = self._check_system_requirements()
            
            # Check dependencies
            dependencies_check = self._check_dependencies()
            
            # Check configuration
            config_check = self._validate_configuration()
            
            all_checks_passed = all([
                requirements_check['success'],
                dependencies_check['success'],
                config_check['success']
            ])
            
            return {
                'success': all_checks_passed,
                'requirements_check': requirements_check,
                'dependencies_check': dependencies_check,
                'config_check': config_check
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _stage_system_initialization(self) -> Dict[str, Any]:
        """System initialization stage"""
        logger.info("🔧 Stage 2: System initialization")
        
        try:
            # Create learning configuration
            learning_config = LearningConfiguration(
                batch_size=self.config['learning']['batch_size'],
                learning_rate=self.config['learning']['learning_rate'],
                device=self.config['learning']['device'],
                mixed_precision=self.config['learning']['mixed_precision']
            )
            
            # Initialize orchestrator
            self.orchestrator = SystemIntegrationOrchestrator(learning_config)
            
            # Initialize validator
            self.validator = ComprehensiveSystemValidator(learning_config)
            
            return {
                'success': True,
                'orchestrator_initialized': self.orchestrator is not None,
                'validator_initialized': self.validator is not None
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _stage_component_integration(self) -> Dict[str, Any]:
        """Component integration stage"""
        logger.info("🔗 Stage 3: Component integration")
        
        try:
            if not self.orchestrator:
                raise ValueError("Orchestrator not initialized")
            
            # Initialize the integrated system
            integration_success = await self.orchestrator.initialize_system()
            
            if integration_success:
                # Get integration statistics
                stats = self.orchestrator.get_integration_statistics()
                
                return {
                    'success': True,
                    'integration_statistics': stats
                }
            else:
                return {
                    'success': False,
                    'error': 'System integration failed'
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _stage_production_validation(self) -> Dict[str, Any]:
        """Production validation stage"""
        logger.info("🧪 Stage 4: Production validation")
        
        try:
            if not self.validator:
                raise ValueError("Validator not initialized")
            
            # Run comprehensive validation
            validation_report = await self.validator.run_comprehensive_validation()
            
            return {
                'success': validation_report.overall_success,
                'validation_report': {
                    'report_id': validation_report.report_id,
                    'total_tests': len(validation_report.test_results),
                    'passed_tests': sum(1 for r in validation_report.test_results if r.success),
                    'failed_tests': sum(1 for r in validation_report.test_results if not r.success),
                    'overall_success': validation_report.overall_success,
                    'recommendations': validation_report.recommendations
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _stage_service_activation(self) -> Dict[str, Any]:
        """Service activation stage"""
        logger.info("🌐 Stage 5: Service activation")
        
        try:
            if not self.orchestrator:
                raise ValueError("Orchestrator not initialized")
            
            # Test core services
            test_requests = [
                ('get_system_status', {}),
                ('list_tools', {}),
                ('process_input', {'input': 'System activation test'}),
            ]
            
            service_tests = []
            
            for request_type, request_data in test_requests:
                try:
                    response = await self.orchestrator.process_unified_request(
                        request_type, request_data
                    )
                    service_tests.append({
                        'service': request_type,
                        'success': response.get('success', False),
                        'response_time': response.get('response_time', 0)
                    })
                except Exception as e:
                    service_tests.append({
                        'service': request_type,
                        'success': False,
                        'error': str(e)
                    })
            
            all_services_active = all(test['success'] for test in service_tests)
            
            return {
                'success': all_services_active,
                'service_tests': service_tests
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _stage_monitoring_setup(self) -> Dict[str, Any]:
        """Monitoring setup stage"""
        logger.info("📊 Stage 6: Monitoring setup")
        
        try:
            # Start monitoring tasks
            if self.config['system']['health_checks']:
                asyncio.create_task(self._health_monitoring_loop())
            
            if self.config['system']['performance_monitoring']:
                asyncio.create_task(self._performance_monitoring_loop())
            
            return {
                'success': True,
                'health_monitoring': self.config['system']['health_checks'],
                'performance_monitoring': self.config['system']['performance_monitoring']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _health_monitoring_loop(self):
        """Health monitoring background task"""
        logger.info("💗 Starting health monitoring loop")
        
        while not self.shutdown_requested:
            try:
                await self._perform_health_check()
                await asyncio.sleep(self.health_check_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ Health monitoring error: {e}")
                await asyncio.sleep(self.health_check_interval)
    
    async def _performance_monitoring_loop(self):
        """Performance monitoring background task"""
        logger.info("⚡ Starting performance monitoring loop")
        
        while not self.shutdown_requested:
            try:
                await self._collect_performance_metrics()
                await asyncio.sleep(60)  # Collect metrics every minute
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ Performance monitoring error: {e}")
                await asyncio.sleep(60)
    
    async def _perform_health_check(self):
        """Perform system health check"""
        if not self.orchestrator:
            return
        
        try:
            # Test basic system operation
            response = await self.orchestrator.process_unified_request(
                'get_system_status', {}
            )
            
            health_status = {
                'timestamp': datetime.now().isoformat(),
                'system_responsive': response.get('success', False),
                'response_time': response.get('response_time', float('inf'))
            }
            
            # Check performance thresholds
            if health_status['response_time'] > self.performance_thresholds['max_response_time']:
                self._generate_alert('HIGH_RESPONSE_TIME', {
                    'current_response_time': health_status['response_time'],
                    'threshold': self.performance_thresholds['max_response_time']
                })
            
            self.last_health_check = datetime.now()
            
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            self._generate_alert('HEALTH_CHECK_FAILURE', {'error': str(e)})
    
    async def _collect_performance_metrics(self):
        """Collect performance metrics"""
        if not self.orchestrator:
            return
        
        try:
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'api_performance': self.orchestrator.performance_metrics,
                'integration_stats': self.orchestrator.get_integration_statistics(),
                'system_uptime': (datetime.now() - self.startup_time).total_seconds() if self.startup_time else 0
            }
            
            # Add system resource metrics if available
            try:
                import psutil
                import os
                
                process = psutil.Process(os.getpid())
                metrics['system_resources'] = {
                    'cpu_percent': process.cpu_percent(),
                    'memory_mb': process.memory_info().rss / (1024 * 1024),
                    'num_threads': process.num_threads()
                }
                
                # Check memory threshold
                if metrics['system_resources']['memory_mb'] > self.performance_thresholds['max_memory_usage_mb']:
                    self._generate_alert('HIGH_MEMORY_USAGE', {
                        'current_memory_mb': metrics['system_resources']['memory_mb'],
                        'threshold_mb': self.performance_thresholds['max_memory_usage_mb']
                    })
                    
            except ImportError:
                pass
            
            # Store metrics
            self.metrics_history.append(metrics)
            
            # Keep only recent metrics
            cutoff_time = datetime.now() - timedelta(days=self.config['monitoring']['metrics_retention_days'])
            self.metrics_history = [
                m for m in self.metrics_history
                if datetime.fromisoformat(m['timestamp']) > cutoff_time
            ]
            
        except Exception as e:
            logger.error(f"❌ Performance metrics collection failed: {e}")
    
    def _generate_alert(self, alert_type: str, details: Dict[str, Any]):
        """Generate system alert"""
        alert = {
            'type': alert_type,
            'timestamp': datetime.now().isoformat(),
            'details': details,
            'deployment_id': self.deployment_id
        }
        
        self.alerts.append(alert)
        logger.warning(f"🚨 ALERT [{alert_type}]: {details}")
        
        # Keep only recent alerts
        cutoff_time = datetime.now() - timedelta(hours=24)
        self.alerts = [
            a for a in self.alerts
            if datetime.fromisoformat(a['timestamp']) > cutoff_time
        ]
    
    def _setup_signal_handlers(self):
        """Setup graceful shutdown signal handlers"""
        def signal_handler(signum, frame):
            logger.info(f"📡 Received signal {signum}, initiating graceful shutdown...")
            self.shutdown_requested = True
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def shutdown_gracefully(self) -> Dict[str, Any]:
        """Perform graceful system shutdown"""
        shutdown_result = {
            'deployment_id': self.deployment_id,
            'shutdown_start': datetime.now().isoformat(),
            'success': False,
            'stages': {}
        }
        
        try:
            logger.info(f"🔄 Starting graceful shutdown: {self.deployment_id}")
            
            # Stage 1: Stop accepting new requests
            self.is_running = False
            shutdown_result['stages']['stop_accepting_requests'] = {'success': True}
            
            # Stage 2: Complete ongoing requests (with timeout)
            await asyncio.sleep(5)  # Allow ongoing requests to complete
            shutdown_result['stages']['complete_ongoing_requests'] = {'success': True}
            
            # Stage 3: Shutdown components
            if self.orchestrator:
                # Save final metrics
                final_metrics = await self._collect_final_metrics()
                shutdown_result['final_metrics'] = final_metrics
                
            shutdown_result['stages']['shutdown_components'] = {'success': True}
            
            # Stage 4: Cleanup resources
            for cleanup_task in self.cleanup_tasks:
                try:
                    if asyncio.iscoroutinefunction(cleanup_task):
                        await cleanup_task()
                    else:
                        cleanup_task()
                except Exception as e:
                    logger.error(f"❌ Cleanup task failed: {e}")
            
            shutdown_result['stages']['cleanup_resources'] = {'success': True}
            
            shutdown_result['success'] = True
            shutdown_result['shutdown_end'] = datetime.now().isoformat()
            
            logger.info(f"✅ Graceful shutdown completed: {self.deployment_id}")
            
        except Exception as e:
            shutdown_result['error'] = str(e)
            shutdown_result['shutdown_end'] = datetime.now().isoformat()
            logger.error(f"❌ Graceful shutdown failed: {e}")
        
        return shutdown_result
    
    async def _collect_final_metrics(self) -> Dict[str, Any]:
        """Collect final metrics before shutdown"""
        if not self.orchestrator:
            return {}
        
        try:
            return {
                'final_performance_metrics': self.orchestrator.performance_metrics,
                'final_integration_stats': self.orchestrator.get_integration_statistics(),
                'total_uptime_seconds': (datetime.now() - self.startup_time).total_seconds() if self.startup_time else 0,
                'total_alerts': len(self.alerts),
                'metrics_history_size': len(self.metrics_history)
            }
        except Exception as e:
            logger.error(f"❌ Failed to collect final metrics: {e}")
            return {'error': str(e)}
    
    # Production API endpoints
    async def handle_api_request(self, request_type: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle production API request"""
        if not self.is_running or not self.orchestrator:
            return {
                'success': False,
                'error': 'System not running or not available',
                'deployment_id': self.deployment_id
            }
        
        try:
            response = await self.orchestrator.process_unified_request(request_type, request_data)
            response['deployment_id'] = self.deployment_id
            return response
            
        except Exception as e:
            logger.error(f"❌ API request failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'deployment_id': self.deployment_id
            }
    
    def get_production_status(self) -> Dict[str, Any]:
        """Get production system status"""
        return {
            'deployment_id': self.deployment_id,
            'is_running': self.is_running,
            'startup_time': self.startup_time.isoformat() if self.startup_time else None,
            'uptime_seconds': (datetime.now() - self.startup_time).total_seconds() if self.startup_time else 0,
            'last_health_check': self.last_health_check.isoformat() if self.last_health_check else None,
            'active_alerts': len([a for a in self.alerts if 
                               datetime.now() - datetime.fromisoformat(a['timestamp']) < timedelta(hours=1)]),
            'total_metrics_collected': len(self.metrics_history),
            'configuration': {
                'health_checks_enabled': self.config['system']['health_checks'],
                'performance_monitoring_enabled': self.config['system']['performance_monitoring'],
                'debug_mode': self.config['system']['debug_mode']
            }
        }
    
    def get_performance_dashboard(self) -> Dict[str, Any]:
        """Get performance dashboard data"""
        if not self.metrics_history:
            return {'error': 'No metrics available'}
        
        recent_metrics = self.metrics_history[-10:]  # Last 10 data points
        
        # Calculate aggregated statistics
        response_times = []
        memory_usage = []
        
        for metrics in recent_metrics:
            api_perf = metrics.get('api_performance', {})
            if 'avg_response_time' in api_perf:
                response_times.append(api_perf['avg_response_time'])
            
            sys_resources = metrics.get('system_resources', {})
            if 'memory_mb' in sys_resources:
                memory_usage.append(sys_resources['memory_mb'])
        
        dashboard = {
            'deployment_id': self.deployment_id,
            'last_updated': datetime.now().isoformat(),
            'performance_summary': {
                'avg_response_time': sum(response_times) / len(response_times) if response_times else 0,
                'peak_memory_mb': max(memory_usage) if memory_usage else 0,
                'total_requests': self.orchestrator.performance_metrics['total_requests'] if self.orchestrator else 0,
                'success_rate': (self.orchestrator.performance_metrics['successful_requests'] / 
                               max(self.orchestrator.performance_metrics['total_requests'], 1)) if self.orchestrator else 0
            },
            'recent_alerts': self.alerts[-5:],  # Last 5 alerts
            'system_health': 'healthy' if self.is_running and not any(
                datetime.now() - datetime.fromisoformat(a['timestamp']) < timedelta(minutes=5)
                for a in self.alerts
            ) else 'attention_needed'
        }
        
        return dashboard
    
    # Helper methods
    def _check_system_requirements(self) -> Dict[str, Any]:
        """Check system requirements"""
        try:
            import sys
            import platform
            
            requirements = {
                'python_version': sys.version_info >= (3, 8),
                'platform': platform.system(),
                'architecture': platform.architecture()[0]
            }
            
            # Check available memory
            try:
                import psutil
                memory_gb = psutil.virtual_memory().total / (1024**3)
                requirements['memory_gb'] = memory_gb
                requirements['sufficient_memory'] = memory_gb >= 4
            except ImportError:
                requirements['memory_check'] = 'psutil_not_available'
            
            success = requirements.get('python_version', False)
            
            return {
                'success': success,
                'requirements': requirements
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _check_dependencies(self) -> Dict[str, Any]:
        """Check required dependencies"""
        required_packages = [
            'torch', 'numpy', 'asyncio', 'logging'
        ]
        
        available_packages = []
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package)
                available_packages.append(package)
            except ImportError:
                missing_packages.append(package)
        
        return {
            'success': len(missing_packages) == 0,
            'available_packages': available_packages,
            'missing_packages': missing_packages
        }
    
    def _validate_configuration(self) -> Dict[str, Any]:
        """Validate configuration"""
        required_sections = ['system', 'learning', 'deployment', 'monitoring']
        
        validation_results = []
        
        for section in required_sections:
            if section in self.config:
                validation_results.append({'section': section, 'valid': True})
            else:
                validation_results.append({'section': section, 'valid': False})
        
        success = all(result['valid'] for result in validation_results)
        
        return {
            'success': success,
            'validation_results': validation_results
        }

# ============================================================================
# PRODUCTION RUNNER
# ============================================================================

class ProductionRunner:
    """Production system runner with advanced features"""
    
    def __init__(self, config_path: Optional[str] = None):
        self.deployment_manager = ProductionDeploymentManager(config_path)
        self.running = False
    
    async def run_production_system(self):
        """Run the production system"""
        try:
            logger.info("🚀 Starting RomAI AGI Production System")
            
            # Deploy the system
            deployment_result = await self.deployment_manager.deploy_production_system()
            
            if not deployment_result['success']:
                logger.error(f"❌ Deployment failed: {deployment_result.get('errors', [])}")
                return deployment_result
            
            logger.info("✅ Production system deployed successfully")
            
            # Keep the system running
            self.running = True
            
            try:
                while self.running and not self.deployment_manager.shutdown_requested:
                    # Production heartbeat
                    await asyncio.sleep(10)
                    
                    # Check if shutdown was requested
                    if self.deployment_manager.shutdown_requested:
                        break
                        
            except KeyboardInterrupt:
                logger.info("📡 Keyboard interrupt received")
            
            # Graceful shutdown
            logger.info("🔄 Initiating graceful shutdown...")
            shutdown_result = await self.deployment_manager.shutdown_gracefully()
            
            if shutdown_result['success']:
                logger.info("✅ System shutdown completed successfully")
            else:
                logger.error(f"❌ Shutdown issues: {shutdown_result.get('error')}")
            
            return {
                'deployment_result': deployment_result,
                'shutdown_result': shutdown_result
            }
            
        except Exception as e:
            logger.error(f"❌ Production system error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def stop(self):
        """Stop the production system"""
        logger.info("🛑 Stop requested")
        self.running = False
        self.deployment_manager.shutdown_requested = True

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

async def main():
    """Main entry point for production deployment"""
    import argparse
    
    parser = argparse.ArgumentParser(description='RomAI AGI Production Deployment')
    parser.add_argument('--config', type=str, help='Configuration file path')
    parser.add_argument('--validate-only', action='store_true', help='Run validation only')
    
    args = parser.parse_args()
    
    if args.validate_only:
        # Run validation only
        logger.info("🧪 Running validation-only mode")
        validator = ComprehensiveSystemValidator()
        report = await validator.run_comprehensive_validation()
        
        print(validator.generate_validation_summary(report))
        
        return report.overall_success
    
    else:
        # Run production system
        runner = ProductionRunner(args.config)
        result = await runner.run_production_system()
        
        return result.get('deployment_result', {}).get('success', False)

if __name__ == '__main__':
    success = asyncio.run(main())
    exit(0 if success else 1)

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Production Deployment Manager loaded - Ready for production!")
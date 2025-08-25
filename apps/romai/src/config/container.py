"""
Dependency Injection Container
==============================

This module provides dependency injection configuration for the RomAI system,
following clean architecture principles and SOLID design patterns.

Author: GitHub Copilot Agent
Date: August 24, 2025
Status: Clean Architecture Implementation
"""

import os
import logging
from typing import Dict, Any
from pathlib import Path

# Domain models
from domain.ml.models import ModelRepository, ModelService
from domain.agi.models import (
    AGIRepository, AGIOrchestrator, ConsciousnessArchitecture, 
    MetaLearningSystem
)

# Application services
from application.services import (
    MLInferenceService, AGIProcessingService, UnifiedModelService
)
from application.services.agi_service import AGIApplicationService

# Infrastructure implementations
from infrastructure.ml.implementations import (
    FileSystemModelRepository, InMemoryModelService
)
from infrastructure.agi.implementations import (
    MathematicalReasoningEngine, LogicalReasoningEngine,
    GlobalWorkspaceConsciousness, AdaptiveMetaLearning,
    DefaultAGIOrchestrator, InMemoryAGIRepository
)

logger = logging.getLogger(__name__)


class DIContainer:
    """Dependency Injection Container for RomAI system"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self._instances = {}
        self._configure_logging()
    
    def _configure_logging(self):
        """Configure logging for the application"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def get_models_directory(self) -> str:
        """Get models directory path"""
        default_path = os.path.join(os.getcwd(), 'models')
        return self.config.get('models_directory', default_path)
    
    def get_model_repository(self) -> ModelRepository:
        """Get ML model repository instance"""
        if 'model_repository' not in self._instances:
            models_dir = self.get_models_directory()
            self._instances['model_repository'] = FileSystemModelRepository(models_dir)
            logger.info(f"Created FileSystemModelRepository with directory: {models_dir}")
        
        return self._instances['model_repository']
    
    def get_model_service(self) -> ModelService:
        """Get ML model service instance"""
        if 'model_service' not in self._instances:
            model_repository = self.get_model_repository()
            self._instances['model_service'] = InMemoryModelService(model_repository)
            logger.info("Created InMemoryModelService")
        
        return self._instances['model_service']
    
    def get_agi_repository(self) -> AGIRepository:
        """Get AGI repository instance"""
        if 'agi_repository' not in self._instances:
            self._instances['agi_repository'] = InMemoryAGIRepository()
            logger.info("Created InMemoryAGIRepository")
        
        return self._instances['agi_repository']
    
    def get_consciousness_architecture(self) -> ConsciousnessArchitecture:
        """Get consciousness architecture instance"""
        if 'consciousness_architecture' not in self._instances:
            self._instances['consciousness_architecture'] = GlobalWorkspaceConsciousness()
            logger.info("Created GlobalWorkspaceConsciousness")
        
        return self._instances['consciousness_architecture']
    
    def get_meta_learning_system(self) -> MetaLearningSystem:
        """Get meta-learning system instance"""
        if 'meta_learning_system' not in self._instances:
            self._instances['meta_learning_system'] = AdaptiveMetaLearning()
            logger.info("Created AdaptiveMetaLearning system")
        
        return self._instances['meta_learning_system']
    
    def get_agi_orchestrator(self) -> AGIOrchestrator:
        """Get AGI orchestrator instance"""
        if 'agi_orchestrator' not in self._instances:
            orchestrator = DefaultAGIOrchestrator()
            
            # Register reasoning engines
            math_engine = MathematicalReasoningEngine()
            logical_engine = LogicalReasoningEngine()
            
            orchestrator.register_engine(math_engine)
            orchestrator.register_engine(logical_engine)
            
            self._instances['agi_orchestrator'] = orchestrator
            logger.info("Created DefaultAGIOrchestrator with reasoning engines")
        
        return self._instances['agi_orchestrator']
    
    def get_ml_inference_service(self) -> MLInferenceService:
        """Get ML inference service instance"""
        if 'ml_inference_service' not in self._instances:
            model_service = self.get_model_service()
            model_repository = self.get_model_repository()
            
            self._instances['ml_inference_service'] = MLInferenceService(
                model_service=model_service,
                model_repository=model_repository
            )
            logger.info("Created MLInferenceService")
        
        return self._instances['ml_inference_service']
    
    def get_agi_service(self) -> AGIApplicationService:
        """Get AGI application service instance"""
        if 'agi_service' not in self._instances:
            orchestrator = self.get_agi_orchestrator()
            repository = self.get_agi_repository()
            
            self._instances['agi_service'] = AGIApplicationService(
                orchestrator=orchestrator,
                repository=repository
            )
            logger.info("Created AGIApplicationService")
        
        return self._instances['agi_service']
    
    def get_agi_processing_service(self) -> AGIProcessingService:
        """Get AGI processing service instance"""
        if 'agi_processing_service' not in self._instances:
            agi_orchestrator = self.get_agi_orchestrator()
            agi_repository = self.get_agi_repository()
            consciousness_architecture = self.get_consciousness_architecture()
            meta_learning_system = self.get_meta_learning_system()
            
            self._instances['agi_processing_service'] = AGIProcessingService(
                agi_orchestrator=agi_orchestrator,
                agi_repository=agi_repository,
                consciousness_architecture=consciousness_architecture,
                meta_learning_system=meta_learning_system
            )
            logger.info("Created AGIProcessingService")
        
        return self._instances['agi_processing_service']
    
    def get_unified_model_service(self) -> UnifiedModelService:
        """Get unified model service instance"""
        if 'unified_model_service' not in self._instances:
            ml_service = self.get_ml_inference_service()
            agi_service = self.get_agi_processing_service()
            
            self._instances['unified_model_service'] = UnifiedModelService(
                ml_service=ml_service,
                agi_service=agi_service
            )
            logger.info("Created UnifiedModelService")
        
        return self._instances['unified_model_service']
    
    async def initialize_services(self) -> None:
        """Initialize all services"""
        logger.info("Initializing all services...")
        
        try:
            # Initialize AGI orchestrator and engines
            orchestrator = self.get_agi_orchestrator()
            
            # Initialize reasoning engines
            for engine in set(orchestrator.reasoning_engines.values()):
                await engine.initialize()
            
            orchestrator.system_status['status'] = 'operational'
            
            logger.info("All services initialized successfully")
            
        except Exception as e:
            logger.error(f"Service initialization failed: {str(e)}")
            raise
    
    async def shutdown_services(self) -> None:
        """Shutdown all services gracefully"""
        logger.info("Shutting down all services...")
        
        try:
            # Shutdown AGI orchestrator and engines
            if 'agi_orchestrator' in self._instances:
                orchestrator = self._instances['agi_orchestrator']
                
                for engine in set(orchestrator.reasoning_engines.values()):
                    await engine.shutdown()
            
            # Clear all instances
            self._instances.clear()
            
            logger.info("All services shutdown successfully")
            
        except Exception as e:
            logger.error(f"Service shutdown failed: {str(e)}")
            raise
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        return {
            'container_config': self.config,
            'active_instances': list(self._instances.keys()),
            'models_directory': self.get_models_directory(),
            'logging_level': logging.getLogger().level,
            'initialized': len(self._instances) > 0
        }


# Global container instance
_container = None


def get_container(config: Dict[str, Any] = None) -> DIContainer:
    """Get global DI container instance"""
    global _container
    
    if _container is None:
        _container = DIContainer(config)
    
    return _container


def reset_container():
    """Reset global container (useful for testing)"""
    global _container
    _container = None


def get_agi_service() -> AGIApplicationService:
    """Dependency injection function for AGI service"""
    container = get_container()
    return container.get_agi_service()
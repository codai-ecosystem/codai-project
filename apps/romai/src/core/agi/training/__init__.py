"""
RomAI AGI Training Package
========================

Complete training infrastructure for Romanian AGI model development with
distributed training, dataset collection, and neural architecture scaling.

Components:
- DistributedTrainer: Multi-GPU distributed training with Romanian optimizations
- DatasetCollector: Romanian cultural content collection and validation
- TrainingInfrastructure: End-to-end training pipeline orchestration
- Integration with Neural Architecture Scaling System

Author: RomAI Development Team
"""

from .distributed_trainer import (
    DistributedTrainer,
    TrainingConfiguration,
    TrainingStrategy,
    OptimizationLevel,
    TrainingMetrics,
    TrainingResult,
    RomanianDataProcessor,
    create_training_system
)

from .dataset_collector import (
    RomanianDatasetCollector,
    DataCollectionConfig,
    DataSource,
    QualityLevel,
    RegionalVariant,
    ContentMetadata,
    ProcessedContent,
    RomanianLanguageProcessor,
    create_dataset_collector
)

from .training_infrastructure import (
    TrainingInfrastructure,
    TrainingPipelineConfig,
    PipelineResult,
    create_training_infrastructure,
    demonstrate_training_infrastructure
)

# Default configurations for quick setup
DEFAULT_TRAINING_CONFIG = TrainingConfiguration(
    model_name="RomAI-Default",
    model_size_params=7_000_000_000,
    batch_size=16,
    learning_rate=2e-5,
    num_epochs=10,
    max_sequence_length=2048,
    vocabulary_size=50000,
    romanian_vocab_size=15000,
    cultural_weight=0.3,
    training_strategy=TrainingStrategy.ROMANIAN_OPTIMIZED,
    optimization_level=OptimizationLevel.ROMANIAN_SPECIALIZED,
    cultural_authenticity_target=0.92
)

DEFAULT_DATASET_CONFIG = DataCollectionConfig(
    collection_name="RomAI-Cultural-Dataset-Default",
    target_size_gb=1.0,
    quality_threshold=0.8,
    cultural_authenticity_threshold=0.85,
    enabled_sources=[
        DataSource.NEWS_ARTICLES,
        DataSource.EDUCATIONAL, 
        DataSource.WIKIPEDIA,
        DataSource.BOOKS_LITERATURE
    ]
)

DEFAULT_PIPELINE_CONFIG = TrainingPipelineConfig(
    pipeline_name="RomAI-AGI-Default-Pipeline",
    base_model_size=7_000_000_000,
    target_model_size=15_000_000_000,
    enable_scaling=True,
    dataset_name="RomAI-Cultural-Dataset",
    target_dataset_size_gb=1.0,
    training_strategy=TrainingStrategy.ROMANIAN_OPTIMIZED,
    optimization_level=OptimizationLevel.ROMANIAN_SPECIALIZED,
    cultural_weight=0.3,
    cultural_authenticity_target=0.92
)

# Convenience functions for quick setup
async def quick_romanian_training(
    model_name: str,
    model_size: int = 7_000_000_000,
    epochs: int = 10,
    cultural_weight: float = 0.3
) -> TrainingResult:
    """Quick setup for Romanian model training."""
    config = TrainingConfiguration(
        model_name=model_name,
        model_size_params=model_size,
        num_epochs=epochs,
        batch_size=16,
        learning_rate=2e-5,
        max_sequence_length=2048,
        vocabulary_size=50000,
        romanian_vocab_size=15000,
        cultural_weight=cultural_weight,
        training_strategy=TrainingStrategy.ROMANIAN_OPTIMIZED,
        optimization_level=OptimizationLevel.ROMANIAN_SPECIALIZED,
        cultural_authenticity_target=0.92
    )
    
    trainer = await create_training_system(config)
    return await trainer.train()

async def quick_dataset_collection(
    collection_name: str,
    size_gb: float = 1.0,
    quality_threshold: float = 0.8
) -> dict:
    """Quick setup for Romanian dataset collection."""
    config = DataCollectionConfig(
        collection_name=collection_name,
        target_size_gb=size_gb,
        quality_threshold=quality_threshold,
        cultural_authenticity_threshold=0.85,
        enabled_sources=[
            DataSource.NEWS_ARTICLES,
            DataSource.EDUCATIONAL,
            DataSource.WIKIPEDIA
        ]
    )
    
    collector = await create_dataset_collector(config)
    return await collector.collect_dataset()

async def quick_full_pipeline(
    pipeline_name: str,
    target_model_size: int = 15_000_000_000,
    dataset_size_gb: float = 1.0,
    epochs: int = 10
) -> PipelineResult:
    """Quick setup for complete training pipeline."""
    config = TrainingPipelineConfig(
        pipeline_name=pipeline_name,
        base_model_size=7_000_000_000,
        target_model_size=target_model_size,
        enable_scaling=True,
        target_dataset_size_gb=dataset_size_gb,
        num_epochs=epochs,
        training_strategy=TrainingStrategy.ROMANIAN_OPTIMIZED,
        cultural_authenticity_target=0.92
    )
    
    infrastructure = await create_training_infrastructure(config)
    return await infrastructure.execute_pipeline()

# Package metadata
__version__ = "1.0.0"
__author__ = "RomAI Development Team"
__description__ = "Complete training infrastructure for Romanian AGI development"

# Export all main classes and functions
__all__ = [
    # Core classes
    'DistributedTrainer',
    'RomanianDatasetCollector', 
    'TrainingInfrastructure',
    
    # Configuration classes
    'TrainingConfiguration',
    'DataCollectionConfig',
    'TrainingPipelineConfig',
    
    # Enums
    'TrainingStrategy',
    'OptimizationLevel',
    'DataSource',
    'QualityLevel',
    'RegionalVariant',
    
    # Result classes
    'TrainingResult',
    'TrainingMetrics',
    'ContentMetadata',
    'ProcessedContent',
    'PipelineResult',
    
    # Factory functions
    'create_training_system',
    'create_dataset_collector',
    'create_training_infrastructure',
    
    # Convenience functions
    'quick_romanian_training',
    'quick_dataset_collection',
    'quick_full_pipeline',
    
    # Demonstration
    'demonstrate_training_infrastructure',
    
    # Default configurations
    'DEFAULT_TRAINING_CONFIG',
    'DEFAULT_DATASET_CONFIG',
    'DEFAULT_PIPELINE_CONFIG'
]

# RomAI Phase 2 Configuration
import os
from pathlib import Path

class Phase2Config:
    """Configuration for RomAI Phase 2 dataset processing and training"""
    
    # Base paths
    PROJECT_ROOT = Path("/home/ubuntu/romai_phase2")
    DATA_DIR = PROJECT_ROOT / "data"
    RAW_DATA_DIR = DATA_DIR / "raw"
    PROCESSED_DATA_DIR = DATA_DIR / "processed"
    CACHE_DIR = DATA_DIR / "cache"
    
    MODELS_DIR = PROJECT_ROOT / "models"
    CHECKPOINTS_DIR = MODELS_DIR / "checkpoints"
    EXPORTS_DIR = MODELS_DIR / "exports"
    
    LOGS_DIR = PROJECT_ROOT / "logs"
    RESULTS_DIR = PROJECT_ROOT / "results"
    
    # Dataset configurations
    DATASETS = {
        "fulg": {
            "name": "FuLG - Filtered uLM Gamma",
            "description": "150B token high-quality filtered dataset",
            "url": "https://huggingface.co/datasets/malteos/fulg",
            "size_gb": 589,
            "format": "jsonl",
            "priority": 1
        },
        "ronec": {
            "name": "RONEC - Romanian Named Entity Corpus",
            "description": "26K+ Romanian entities for cultural context",
            "url": "https://github.com/dumitrescustefan/ronec",
            "size_gb": 0.5,
            "format": "conllu",
            "priority": 2
        },
        "mathematical": {
            "name": "Mathematical Reasoning Dataset",
            "description": "Custom mathematical problems and solutions",
            "source": "generated",
            "size_gb": 2,
            "format": "json",
            "priority": 3
        }
    }
    
    # Processing configurations
    BATCH_SIZE = 1000
    MAX_SEQUENCE_LENGTH = 2048
    TOKENIZER_MODEL = "microsoft/DialoGPT-medium"
    
    # Training configurations (CPU optimized)
    DEVICE = "cpu"
    NUM_WORKERS = 4  # c5.2xlarge has 8 vCPUs, use 4 for processing
    LEARNING_RATE = 5e-5
    TRAIN_BATCH_SIZE = 4  # Small batch for CPU training
    EVAL_BATCH_SIZE = 8
    NUM_EPOCHS = 3
    WARMUP_STEPS = 1000
    
    # Logging and checkpointing
    LOG_LEVEL = "INFO"
    SAVE_STEPS = 5000
    EVAL_STEPS = 2500
    LOGGING_STEPS = 100
    
    # Resource management
    MAX_MEMORY_GB = 12  # c5.2xlarge has 16GB, leave some headroom
    CHECKPOINT_KEEP_LATEST = 3
    
    @classmethod
    def create_directories(cls):
        """Create all necessary directories"""
        directories = [
            cls.PROJECT_ROOT,
            cls.DATA_DIR,
            cls.RAW_DATA_DIR,
            cls.PROCESSED_DATA_DIR,
            cls.CACHE_DIR,
            cls.MODELS_DIR,
            cls.CHECKPOINTS_DIR,
            cls.EXPORTS_DIR,
            cls.LOGS_DIR,
            cls.RESULTS_DIR
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    @classmethod
    def get_dataset_path(cls, dataset_name, data_type="raw"):
        """Get path for specific dataset"""
        if data_type == "raw":
            return cls.RAW_DATA_DIR / dataset_name
        elif data_type == "processed":
            return cls.PROCESSED_DATA_DIR / dataset_name
        elif data_type == "cache":
            return cls.CACHE_DIR / dataset_name
        else:
            raise ValueError(f"Unknown data type: {data_type}")
"""
Memory Optimization Dependencies Installation Script
===================================================

Installs required packages for LoRA/QLoRA memory optimization system:
- PEFT (Parameter-Efficient Fine-Tuning)  
- BitsAndBytes (Quantization)
- Accelerate (Distributed Training)
- Additional optimization libraries

This enables 8GB VRAM efficient training on RTX 3060 Ti.
"""

import subprocess
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Required packages for memory optimization
MEMORY_OPTIMIZATION_PACKAGES = [
    "peft>=0.7.0",                    # Parameter-Efficient Fine-Tuning (LoRA/QLoRA)
    "bitsandbytes>=0.41.0",          # 4-bit/8-bit quantization
    "accelerate>=0.25.0",            # Distributed training and memory optimization
    "datasets>=2.15.0",              # Dataset handling for training
    "evaluate>=0.4.0",               # Model evaluation metrics
    "scipy>=1.11.0",                 # Scientific computing for optimization
    "scikit-learn>=1.3.0",           # Machine learning utilities
    "trl>=0.7.0",                    # Transformer Reinforcement Learning
    "optimum>=1.15.0",               # Hardware optimization
]

# Optional packages that enhance performance
OPTIONAL_PACKAGES = [
    "flash-attn>=2.3.0",             # Flash Attention (CUDA required)
    "deepspeed>=0.12.0",             # DeepSpeed for advanced optimization
    "triton>=2.1.0",                 # Triton for kernel optimization
]

def install_package(package_name: str) -> bool:
    """Install a single package."""
    try:
        logger.info(f"📦 Installing {package_name}...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", package_name],
            capture_output=True,
            text=True,
            check=True
        )
        logger.info(f"✅ Successfully installed {package_name}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install {package_name}: {e.stderr}")
        return False

def check_cuda_availability():
    """Check if CUDA is available for GPU acceleration."""
    try:
        import torch
        if torch.cuda.is_available():
            device_count = torch.cuda.device_count()
            device_name = torch.cuda.get_device_name(0) if device_count > 0 else "Unknown"
            logger.info(f"🎯 CUDA Available: {device_count} GPU(s) - {device_name}")
            return True
        else:
            logger.warning("⚠️ CUDA not available - CPU-only mode")
            return False
    except ImportError:
        logger.warning("⚠️ PyTorch not found - cannot check CUDA")
        return False

def install_memory_optimization_dependencies():
    """Install all memory optimization dependencies."""
    logger.info("🚀 Installing Memory Optimization Dependencies")
    logger.info("=" * 50)
    
    # Check CUDA availability
    cuda_available = check_cuda_availability()
    
    # Install core packages
    logger.info("📚 Installing core memory optimization packages...")
    successful_installs = 0
    failed_installs = 0
    
    for package in MEMORY_OPTIMIZATION_PACKAGES:
        if install_package(package):
            successful_installs += 1
        else:
            failed_installs += 1
    
    # Install optional packages (only if CUDA is available)
    if cuda_available:
        logger.info("🔥 Installing CUDA-accelerated packages...")
        for package in OPTIONAL_PACKAGES:
            if install_package(package):
                successful_installs += 1
            else:
                failed_installs += 1
                logger.warning(f"⚠️ Optional package {package} failed - continuing...")
    else:
        logger.info("⏭️ Skipping CUDA-specific packages (no CUDA detected)")
    
    # Summary
    logger.info("=" * 50)
    logger.info(f"📊 Installation Summary:")
    logger.info(f"   ✅ Successful: {successful_installs}")
    logger.info(f"   ❌ Failed: {failed_installs}")
    
    if failed_installs == 0:
        logger.info("🎉 All dependencies installed successfully!")
        logger.info("🚀 Memory optimization system is ready!")
    elif successful_installs >= len(MEMORY_OPTIMIZATION_PACKAGES):
        logger.info("✅ Core dependencies installed - system should work!")
        logger.warning(f"⚠️ {failed_installs} optional packages failed")
    else:
        logger.error("❌ Critical dependencies failed - system may not work properly")
        return False
    
    return True

def verify_installation():
    """Verify that key packages are properly installed."""
    logger.info("🔍 Verifying installation...")
    
    test_imports = [
        ("peft", "PEFT (Parameter-Efficient Fine-Tuning)"),
        ("bitsandbytes", "BitsAndBytes (Quantization)"),
        ("accelerate", "Accelerate (Memory Optimization)"),
        ("torch", "PyTorch (Deep Learning Framework)"),
        ("transformers", "Transformers (Model Library)")
    ]
    
    verification_success = True
    
    for module_name, description in test_imports:
        try:
            __import__(module_name)
            logger.info(f"✅ {description}: OK")
        except ImportError as e:
            logger.error(f"❌ {description}: FAILED - {e}")
            verification_success = False
    
    # Test specific functionality
    try:
        from peft import LoraConfig, get_peft_model
        from transformers import BitsAndBytesConfig  # Updated import location
        logger.info("✅ Memory optimization classes: OK")
    except ImportError as e:
        logger.error(f"❌ Memory optimization classes: FAILED - {e}")
        verification_success = False
    
    return verification_success

if __name__ == "__main__":
    logger.info("🧠 Memory Optimization Dependencies Installer")
    logger.info("=" * 50)
    
    # Install dependencies
    install_success = install_memory_optimization_dependencies()
    
    if install_success:
        logger.info("\n🔍 Verifying installation...")
        verification_success = verify_installation()
        
        if verification_success:
            logger.info("\n🎉 SUCCESS: Memory optimization system is ready!")
            logger.info("🚀 You can now run memory optimization tests")
            logger.info("📝 Next steps:")
            logger.info("   1. Run: python test_memory_optimization.py")
            logger.info("   2. Integrate with ROMAI AGI system")
            logger.info("   3. Test with your specific models")
        else:
            logger.error("\n❌ VERIFICATION FAILED: Some packages not working properly")
            logger.info("🔧 Try running the installer again or install packages manually")
    else:
        logger.error("\n❌ INSTALLATION FAILED: Critical dependencies missing")
        logger.info("🔧 Check internet connection and try again")
    
    logger.info("=" * 50)
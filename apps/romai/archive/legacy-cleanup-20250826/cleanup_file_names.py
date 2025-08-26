#!/usr/bin/env python3
"""
File Naming Cleanup Script - Remove Marketing Prefixes
=====================================================

This script systematically renames ALL files with marketing prefixes
following Microsoft's professional naming guidelines.
"""

import os
import shutil
from pathlib import Path

def get_clean_filename(filepath):
    """Convert marketing filename to professional name following Microsoft guidelines"""
    
    # Get path components
    path = Path(filepath)
    directory = path.parent
    filename = path.name
    stem = path.stem  # filename without extension
    suffix = path.suffix  # file extension
    
    # Define naming conversions following Microsoft guidelines
    # Remove adjective prefixes, keep functional nouns
    conversions = {
        # Advanced -> removed (Microsoft guideline: avoid marketing adjectives)
        'advanced_reasoning_training_system': 'reasoning_trainer',
        'advanced_romanian_tokenizer': 'romanian_tokenizer', 
        'advanced_programming_engine': 'programming_engine',
        'advanced_training_methodologies': 'training_methodologies',
        'advanced_training_pipeline': 'training_pipeline',
        'advanced_memory_core': 'memory_core',
        'advanced_multimodal_integration': 'multimodal_integration',
        'advanced_architecture_integrator': 'architecture_integrator',
        'advanced_performance_optimizer': 'performance_optimizer',
        'advanced_neuro_symbolic_engine': 'neuro_symbolic_engine',
        'advanced_code_generation_engine': 'code_generation_engine',
        'advanced_learning_system': 'learning_system',
        'advanced_analytics_intelligence_engine': 'analytics_engine',
        'advanced_romanian_language_model': 'romanian_language_model',
        'romai_advanced_neural_architecture_v3': 'romai_neural_architecture_v3',
        'romai_advanced_transformer_engine': 'romai_transformer_engine',
        'advanced_transformer_architecture': 'transformer_architecture',
        'advanced_knowledge_synthesis': 'knowledge_synthesis',
        'advanced_caching_system': 'caching_system',
        'advanced_self_improvement': 'self_improvement',
        'mixture_of_experts_advanced': 'mixture_of_experts',
        'simple_advanced_transformer': 'simple_transformer',
        'audio_processing_advanced': 'audio_processing',
        
        # Enterprise -> removed
        'enterprise_security_manager': 'security_manager',
        'enterprise_monitoring_alerting': 'monitoring_service',
        'cbd_enterprise_security': 'cbd_security',
        
        # Simple -> Basic (Microsoft guideline: use precise terms)
        'production_test_runner_simple': 'test_runner',
        'test_simple_training': 'training_tests',
        'demo_gateway_simple': 'gateway_demo',
        
        # Day/Week/Phase references -> remove timeline marketing
        'day_14_consciousness_awakening': 'consciousness_awakening',
        'day_15_consciousness_amplification': 'consciousness_amplification', 
        'day_16_romanian_consciousness_integration': 'romanian_consciousness_integration',
        'day_17_consciousness_stimulation': 'consciousness_stimulation',
        'test_phase_5_advanced_integration': 'integration_tests',
        
        # Specialized domain files with advanced prefix
        'vision_processing_advanced': 'vision_processing',
        'medical_reasoning_advanced': 'medical_reasoning',
        'financial_modeling_advanced': 'financial_modeling',
        'execute_advanced_training': 'execute_training',
        'advanced_intelligence_optimization': 'intelligence_optimization',
    }
    
    # Apply conversions
    clean_stem = stem
    for old_name, new_name in conversions.items():
        if old_name in stem:
            clean_stem = stem.replace(old_name, new_name)
            break
    
    # Construct clean filename
    if clean_stem != stem:
        clean_filename = clean_stem + suffix
        clean_filepath = directory / clean_filename
        return str(clean_filepath)
    
    return None  # No change needed

def rename_file_safely(old_path, new_path):
    """Safely rename a file with proper error handling"""
    try:
        if os.path.exists(new_path):
            print(f"⚠️  Target exists: {new_path}")
            return False
        
        # Create directory if needed
        os.makedirs(os.path.dirname(new_path), exist_ok=True)
        
        # Rename the file
        shutil.move(old_path, new_path)
        print(f"✅ Renamed: {os.path.basename(old_path)} → {os.path.basename(new_path)}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to rename {old_path}: {e}")
        return False

def main():
    """Find and rename all files with marketing prefixes"""
    base_path = Path(".")
    
    print("🧹 Finding files with marketing prefixes...")
    
    # Find all files with marketing terms
    marketing_patterns = ['*advanced*', '*enterprise*', '*simple*', '*day_*', '*phase_*']
    
    files_to_rename = []
    for pattern in marketing_patterns:
        for file_path in base_path.rglob(pattern):
            if file_path.is_file():
                # Skip .git, .cache, and backup files
                if '.git' in str(file_path) or '.cache' in str(file_path) or '.backup' in str(file_path):
                    continue
                files_to_rename.append(str(file_path))
    
    print(f"📊 Found {len(files_to_rename)} files with marketing prefixes")
    
    renamed_count = 0
    for file_path in sorted(set(files_to_rename)):
        clean_path = get_clean_filename(file_path)
        if clean_path and clean_path != file_path:
            if rename_file_safely(file_path, clean_path):
                renamed_count += 1
    
    print(f"\n✅ Cleanup completed!")
    print(f"📊 Successfully renamed {renamed_count} files")
    print(f"📋 Applied Microsoft naming conventions:")
    print(f"   • Removed marketing adjectives ('advanced', 'enterprise', 'simple')")
    print(f"   • Removed timeline references ('day_X', 'phase_X')")
    print(f"   • Used functional nouns instead of descriptive adjectives")
    print(f"   • Followed clarity-over-brevity principle")

if __name__ == "__main__":
    main()
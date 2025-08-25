#!/usr/bin/env python3
"""
Marketing Terms Cleanup Script - Apply Microsoft Naming Conventions
=================================================================

This script systematically removes ALL marketing terminology from RomAI project
following Microsoft's professional naming guidelines:
- Use functional nouns instead of marketing adjectives
- Avoid "advanced", "enterprise", "simple", "world class", etc.
- Prefer clarity over marketing appeal
"""

import re
import os

def clean_marketing_terms(content):
    """Remove all marketing terminology following Microsoft guidelines"""
    
    # Step 1: Clean flag names and variables
    replacements = [
        # Flags and constants
        ('ADVANCED_CONSCIOUSNESS_AVAILABLE', 'CONSCIOUSNESS_AVAILABLE'),
        ('ADVANCED_SYSTEMS_INITIALIZED', 'SYSTEMS_INITIALIZED'),
        ('ADVANCED_TRANSFORMER_AVAILABLE', 'TRANSFORMER_AVAILABLE'),
        ('ADVANCED_REASONING_AVAILABLE', 'REASONING_TRAINING_AVAILABLE'),
        ('ADVANCED_REASONING_INTEGRATION_AVAILABLE', 'REASONING_INTEGRATION_AVAILABLE'),
        ('ADVANCED_TESTING_AVAILABLE', 'TESTING_AVAILABLE'),
        
        # Class and function names
        ('AdvancedReasoningTrainingSystem', 'ReasoningTrainingSystem'),
        ('AdvancedReasoningIntegrationEngine', 'ReasoningIntegrationEngine'),
        ('advanced_reasoning_training_system', 'reasoning_training_system'),
        ('advanced_reasoning_integration_engine', 'reasoning_integration_engine'),
        ('advanced_monitoring_system', 'monitoring_system'),
        ('advanced_intelligence_orchestrator', 'intelligence_orchestrator'),
        ('advanced_reasoning_system', 'reasoning_system'),
        ('advanced_reasoning_integration_engine', 'reasoning_integration_engine'),
        ('RomAIAdvancedTransformerEngine', 'RomAITransformerEngine'),
        ('romAI_advanced_transformer_engine', 'romAI_transformer_engine'),
        
        # Method and variable names
        ('initialize_advanced_systems', 'initialize_systems'),
        ('initialize_advanced_transformer', 'initialize_transformer'),
        ('_initialize_advanced_transformer', '_initialize_transformer'),
        ('advanced_transformer_engine', 'transformer_engine'),
        ('advanced_transformer', 'transformer'),
        ('_generate_advanced_romanian_response', '_generate_romanian_response'),
        ('advanced_romanian_ai', 'romanian_ai'),
        ('Advanced Romanian response generation', 'Romanian response generation'),
        
        # Comments and strings - remove "Advanced" adjective
        ('Advanced AGI Systems', 'AGI Systems'),
        ('Advanced Neural Architecture', 'Neural Architecture'),
        ('Advanced Transformer Architecture', 'Transformer Architecture'),
        ('Advanced Reasoning Training System', 'Reasoning Training System'),
        ('Advanced Reasoning Integration Engine', 'Reasoning Integration Engine'),
        ('Advanced consciousness systems', 'Consciousness systems'),
        ('Advanced monitoring system', 'Monitoring system'),
        ('Advanced Real-World Testing System', 'Real-World Testing System'),
        ('Advanced multimodal task', 'Multimodal task'),
        ('advanced AI processing', 'AI processing'),
        ('Advanced neural architectures', 'Neural architectures'),
        ('Advanced Features', 'Features'),
        ('advanced meta-learning model', 'meta-learning model'),
        ('Advanced Real-World Testing System', 'Real-World Testing System'),
        ('Advanced Testing System', 'Testing System'),
        ('Generate advanced AGI Romanian content', 'Generate AGI Romanian content'),
        ('Advanced ML Infrastructure', 'ML Infrastructure'),
        
        # Day references - remove marketing timeline references
        ('Day 5 Enhanced', 'Enhanced'),
        ('- Day 5 Enhanced', '- Enhanced'),
        
        # Simple references
        ('Simple complexity metric', 'Complexity metric'),
        ('Simple fallback', 'Fallback'),
        ('SIMPLE = "simple"', 'BASIC = "basic"'),
        ('"simple"', '"basic"'),
        
        # Enterprise references
        ('enterprise capabilities', 'capabilities'),
        ('ENTERPRISE_CAPABILITIES_AVAILABLE', 'CAPABILITIES_AVAILABLE'),
        
        # Phase references
        ('Phase 2', 'Implementation'),
        ('phase', 'stage'),
        
        # Import path cleanups
        ('ml.training.advanced_reasoning_training_system', 'ml.training.reasoning_training_system'),
        ('ml.reasoning.advanced_reasoning_integration_engine', 'ml.reasoning.reasoning_integration_engine'),
        ('ml.monitoring.advanced_monitoring_system', 'ml.monitoring.monitoring_system'),
        ('ml.models.romAI_advanced_transformer_engine', 'ml.models.romAI_transformer_engine'),
        
        # Memory systems cleanup
        ('"Advanced+Episodic+Working+LongTerm+Consolidation+Pattern"', '"Episodic+Working+LongTerm+Consolidation+Pattern"'),
        
        # Model stats cleanup
        ('advanced_reasoning', 'reasoning'),
    ]
    
    # Apply all replacements
    for old, new in replacements:
        content = content.replace(old, new)
    
    return content

def main():
    """Clean marketing terms from model_server.py"""
    file_path = "src/ml/serving/model_server.py"
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🧹 Cleaning marketing terms from model_server.py...")
    print(f"📊 Original file size: {len(content):,} characters")
    
    # Clean marketing terms
    cleaned_content = clean_marketing_terms(content)
    
    print(f"📊 Cleaned file size: {len(cleaned_content):,} characters")
    
    # Create backup
    backup_path = file_path + ".backup"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"💾 Backup created: {backup_path}")
    
    # Write cleaned content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    
    print("✅ Marketing terms cleanup completed!")
    print("📋 Summary of changes:")
    print("   • Removed 'Advanced' from all system names")
    print("   • Cleaned up flag and variable names")
    print("   • Updated class and method names")
    print("   • Removed timeline references (Day X)")
    print("   • Applied Microsoft naming conventions")

if __name__ == "__main__":
    main()
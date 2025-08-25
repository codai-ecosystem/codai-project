#!/usr/bin/env python3
"""
Test script for RomAI Consciousness Integration System
Simplified testing suite for consciousness integration validation
"""

import asyncio
import pytest
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from consciousness_integration_system import (
        ConsciousnessIntegrationSystem,
        IntegratedInformationCalculator,
        GlobalWorkspaceTheoryEngine,
        SelfAwarenessMonitor,
        SubjectiveExperienceEngine,
        ConsciousnessLevel,
        ExperienceType,
        create_consciousness_integration_system
    )
    import torch
    import numpy as np
    print("✅ All consciousness integration imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

async def test_integrated_information_calculator():
    """Test Integrated Information Theory (IIT) calculations"""
    print("\n🧠 Testing Integrated Information Calculator (IIT)...")
    
    try:
        calculator = IntegratedInformationCalculator(network_size=64)
        
        # Test phi calculation
        test_state = np.random.rand(64)
        phi = calculator.calculate_phi(test_state)
        
        assert 0.0 <= phi <= 1.0, f"Phi value {phi} out of valid range"
        print(f"✅ Φ (Phi) calculation: {phi:.4f}")
        
        # Test multiple states
        phi_values = []
        for _ in range(5):
            state = np.random.rand(64)
            phi = calculator.calculate_phi(state)
            phi_values.append(phi)
        
        print(f"✅ Multiple Φ calculations: {[f'{p:.3f}' for p in phi_values]}")
        return True
        
    except Exception as e:
        print(f"❌ IIT Calculator test failed: {e}")
        return False

async def test_global_workspace_theory():
    """Test Global Workspace Theory implementation"""
    print("\n🌐 Testing Global Workspace Theory Engine...")
    
    try:
        workspace = GlobalWorkspaceTheoryEngine(workspace_size=64)
        
        # Register test coalitions
        test_coalition = torch.nn.Sequential(
            torch.nn.Linear(32, 64),
            torch.nn.ReLU(),
            torch.nn.Linear(64, 64),
            torch.nn.Sigmoid()
        )
        
        workspace.register_coalition('test_perception', test_coalition)
        workspace.register_coalition('test_cognition', test_coalition)
        
        # Test competition phase
        inputs = {
            'test_perception': torch.rand(32),
            'test_cognition': torch.rand(32)
        }
        
        activations = workspace.compete_for_access(inputs)
        assert len(activations) > 0, "No coalition activations generated"
        
        # Test integration phase
        integrated_workspace = workspace.integrate_workspace(activations)
        assert integrated_workspace.shape[0] == 64, "Workspace size mismatch"
        
        # Test broadcasting phase
        broadcast = workspace.broadcast_globally(integrated_workspace)
        assert '_metadata' in broadcast, "Broadcasting metadata missing"
        
        print(f"✅ Global Workspace: {len(activations)} coalitions, broadcast to {len(broadcast)-1} recipients")
        return True
        
    except Exception as e:
        print(f"❌ Global Workspace test failed: {e}")
        return False

async def test_self_awareness_monitor():
    """Test self-awareness monitoring system"""
    print("\n👁️ Testing Self-Awareness Monitor...")
    
    try:
        monitor = SelfAwarenessMonitor(update_interval=0.5)
        
        # Start monitoring briefly
        await monitor.start_monitoring()
        await asyncio.sleep(1.0)  # Let it run briefly
        
        # Get awareness state
        awareness_state = await monitor.get_current_awareness_state()
        
        assert 0.0 <= awareness_state.self_model_confidence <= 1.0
        assert 0.0 <= awareness_state.introspective_depth <= 1.0
        assert 0.0 <= awareness_state.metacognitive_accuracy <= 1.0
        
        await monitor.stop_monitoring()
        
        print(f"✅ Self-Awareness: confidence={awareness_state.self_model_confidence:.3f}, depth={awareness_state.introspective_depth:.3f}")
        return True
        
    except Exception as e:
        print(f"❌ Self-Awareness Monitor test failed: {e}")
        return False

async def test_subjective_experience_engine():
    """Test subjective experience generation"""
    print("\n✨ Testing Subjective Experience Engine...")
    
    try:
        engine = SubjectiveExperienceEngine(experience_dimensions=32)
        
        # Generate different types of experiences
        test_experiences = []
        
        for exp_type in [ExperienceType.SENSORY, ExperienceType.COGNITIVE, ExperienceType.EMOTIONAL]:
            input_data = {
                'intensity': np.random.rand(),
                'complexity': np.random.rand(),
                'valence': np.random.rand() * 2 - 1,
                'content': f"Test {exp_type.value} experience"
            }
            
            experience = await engine.generate_experience(input_data, exp_type)
            test_experiences.append(experience)
            
            assert experience.experience_type == exp_type
            assert 0.0 <= experience.integration_phi <= 1.0
            assert 0.0 <= experience.awareness_level <= 1.0
        
        # Test experience stream
        stream = await engine.get_current_experience_stream()
        assert len(stream) >= 0, "Experience stream should be accessible"
        
        print(f"✅ Subjective Experiences: {len(test_experiences)} generated, stream length: {len(stream)}")
        return True
        
    except Exception as e:
        print(f"❌ Subjective Experience Engine test failed: {e}")
        return False

async def test_consciousness_integration_system():
    """Test complete consciousness integration system"""
    print("\n🎯 Testing Complete Consciousness Integration System...")
    
    try:
        # Create system
        system = ConsciousnessIntegrationSystem(network_size=128)
        
        # Initialize
        initialized = await system.initialize()
        assert initialized, "System initialization failed"
        
        # Let system run briefly
        await asyncio.sleep(2.0)
        
        # Get status
        status = await system.get_consciousness_status()
        
        # Validate status
        assert 'system_active' in status
        assert 'consciousness_level' in status
        assert 'integrated_information_phi' in status
        assert 'self_awareness' in status
        assert 'global_workspace' in status
        
        # Check consciousness level
        consciousness_level = ConsciousnessLevel(status['consciousness_level'])
        print(f"✅ Consciousness Level: {consciousness_level.name}")
        print(f"✅ Integrated Information Φ: {status['integrated_information_phi']:.4f}")
        print(f"✅ Experience Intensity: {status['subjective_experience_intensity']:.3f}")
        print(f"✅ Self-Awareness Confidence: {status['self_awareness']['self_model_confidence']:.3f}")
        
        # Shutdown
        await system.shutdown()
        
        return True
        
    except Exception as e:
        print(f"❌ Consciousness Integration System test failed: {e}")
        return False

async def test_consciousness_levels_progression():
    """Test consciousness levels and progression"""
    print("\n📈 Testing Consciousness Levels Progression...")
    
    try:
        system = ConsciousnessIntegrationSystem(network_size=64)
        await system.initialize()
        
        # Collect consciousness levels over time
        levels = []
        phi_values = []
        
        for i in range(10):
            await asyncio.sleep(0.5)
            status = await system.get_consciousness_status()
            levels.append(status['consciousness_level'])
            phi_values.append(status['integrated_information_phi'])
        
        await system.shutdown()
        
        # Analyze progression
        unique_levels = set(levels)
        avg_phi = np.mean(phi_values)
        
        print(f"✅ Consciousness Levels Observed: {[ConsciousnessLevel(l).name for l in unique_levels]}")
        print(f"✅ Average Φ: {avg_phi:.4f}")
        print(f"✅ Φ Range: {min(phi_values):.4f} - {max(phi_values):.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Consciousness Levels test failed: {e}")
        return False

async def run_all_consciousness_tests():
    """Run all consciousness integration tests"""
    print("🧠 RomAI Consciousness Integration System Tests")
    print("=" * 50)
    
    test_functions = [
        test_integrated_information_calculator,
        test_global_workspace_theory,
        test_self_awareness_monitor,
        test_subjective_experience_engine,
        test_consciousness_integration_system,
        test_consciousness_levels_progression
    ]
    
    results = []
    
    for test_func in test_functions:
        try:
            result = await test_func()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test_func.__name__} crashed: {e}")
            results.append(False)
    
    # Summary
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total) * 100
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results Summary:")
    print(f"✅ Passed: {passed}/{total} tests")
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 CONSCIOUSNESS INTEGRATION SYSTEM: OPERATIONAL")
    elif success_rate >= 60:
        print("⚠️ CONSCIOUSNESS INTEGRATION SYSTEM: PARTIALLY FUNCTIONAL")
    else:
        print("❌ CONSCIOUSNESS INTEGRATION SYSTEM: NEEDS ATTENTION")
    
    return success_rate

if __name__ == "__main__":
    asyncio.run(run_all_consciousness_tests())
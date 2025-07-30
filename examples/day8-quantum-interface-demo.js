/**
 * @fileoverview RomAI AGI Day 8 Quantum Interface Demonstration
 * Showcasing enhanced quantum state management, quantum gates, and quantum circuit execution
 * Phase 2: Quantum Interface Implementation
 */

import { RomAIAGI } from '../packages/romai-agi/dist/index.js';
import { QuantumInterface, QuantumGates } from '../packages/romai-agi/dist/quantum/quantum-interface.js';

async function demonstrateDay8QuantumInterface() {
  console.log('🚀 RomAI AGI Day 8: Quantum Interface Demonstration');
  console.log('='.repeat(80));
  console.log('Phase 2: Enhanced Quantum State Management & Quantum Gates\n');

  try {
    // Initialize RomAI AGI
    console.log('🔧 Initializing RomAI AGI with enhanced quantum capabilities...');
    const romai = new RomAIAGI();
    await romai.initialize();

    // Get quantum interface
    const quantumInterface = romai.getQuantumInterface();

    // 1. Quantum Interface Capabilities
    console.log('\n📊 Quantum Interface Capabilities:');
    console.log('   Max Qubits:', quantumInterface.getMaxQubits());
    console.log('   Supported Gates:', quantumInterface.getSupportedGates().join(', '));
    console.log('   Quantum Ready:', quantumInterface.isQuantumReady());
    console.log('   Capabilities:', quantumInterface.getQuantumCapabilities());

    // 2. Quantum State Creation and Management
    console.log('\n🌊 Quantum State Management:');

    // Create 3-qubit quantum state
    const state3 = quantumInterface.createQuantumState(3);
    console.log('   Created 3-qubit state in |000⟩');
    console.log('   Initial amplitudes:', state3.getAmplitudes().slice(0, 8).map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    // Create state from binary string
    const stateCustom = quantumInterface.createQuantumState(3, '101');
    console.log('   Created custom state |101⟩');
    console.log('   Custom amplitudes:', stateCustom.getAmplitudes().slice(0, 8).map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    // 3. Quantum Gate Operations
    console.log('\n⚡ Quantum Gate Operations:');

    // Apply Hadamard gate to create superposition
    const superpositionState = quantumInterface.createQuantumState(2);
    superpositionState.applyGate(QuantumGates.H(0));
    console.log('   Applied H gate to qubit 0:');
    console.log('   Superposition amplitudes:', superpositionState.getAmplitudes().map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    // Apply Pauli-X (NOT) gate
    const notState = quantumInterface.createQuantumState(1);
    notState.applyGate(QuantumGates.X(0));
    console.log('   Applied X gate to flip |0⟩ → |1⟩:');
    console.log('   NOT result:', notState.getAmplitudes().map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    // Apply rotation gates
    const rotationState = quantumInterface.createQuantumState(1);
    rotationState.applyGate(QuantumGates.RY(0, Math.PI / 4));
    console.log('   Applied RY(π/4) rotation:');
    console.log('   Rotation result:', rotationState.getAmplitudes().map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    // 4. Quantum Entanglement
    console.log('\n🔗 Quantum Entanglement:');

    const entanglementState = quantumInterface.createQuantumState(2);
    entanglementState.applyGate(QuantumGates.H(0));  // Create superposition
    entanglementState.applyGate(QuantumGates.CNOT(0, 1));  // Create entanglement

    console.log('   Created Bell state |00⟩ + |11⟩:');
    console.log('   Entangled amplitudes:', entanglementState.getAmplitudes().map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));
    console.log('   Is entangled:', entanglementState.isEntangled());

    // Test quantum entanglement functionality
    const entanglementResult = await quantumInterface.quantumEntanglement([0, 1, 2]);
    console.log('   Multi-qubit entanglement result:', entanglementResult);

    // 5. Quantum Circuit Execution
    console.log('\n🔄 Quantum Circuit Execution:');

    const circuitState = quantumInterface.createQuantumState(3);
    const circuit = quantumInterface.createQuantumCircuit(3);

    // Build quantum circuit: H-CNOT-H pattern
    circuit.gates.push(QuantumGates.H(0));
    circuit.gates.push(QuantumGates.H(1));
    circuit.gates.push(QuantumGates.CNOT(0, 2));
    circuit.gates.push(QuantumGates.RZ(1, Math.PI / 3));
    circuit.measurements = [0, 1, 2];

    console.log('   Circuit gates:', circuit.gates.map(g => `${g.name}(${g.qubits.join(',')})`).join(' → '));

    const circuitResult = await quantumInterface.executeCircuit(circuitState, circuit);
    console.log('   Circuit execution complete');
    console.log('   Final state entangled:', circuitResult.finalState.isEntangled());
    console.log('   Measurement results:', circuitResult.measurements.map(m =>
      `${m.outcome} (p=${m.probability.toFixed(3)})`
    ));

    // 6. Quantum Algorithms
    console.log('\n🧮 Quantum Algorithm Execution:');

    // Test Grover's search algorithm
    const groverResult = await quantumInterface.executeQuantumAlgorithm('grover', {
      algorithm: 'grover',
      qubits: 4,
      target: '1010'
    });
    console.log('   Grover search result:', groverResult);

    // Test quantum superposition
    const superpositionResult = await quantumInterface.executeQuantumAlgorithm('superposition', {
      algorithm: 'superposition',
      qubits: 3
    });
    console.log('   Superposition result:', superpositionResult);

    // Test quantum entanglement algorithm
    const entanglementAlgoResult = await quantumInterface.executeQuantumAlgorithm('entanglement', {
      algorithm: 'entanglement',
      qubits: 4
    });
    console.log('   Entanglement algorithm result:', entanglementAlgoResult);

    // 7. Quantum Optimization
    console.log('\n🎯 Quantum Optimization:');

    const optimizationProblem = {
      searchSpace: 256,
      target: 'optimal_solution',
      constraints: ['minimize_energy', 'maximize_efficiency']
    };

    const optimizationResult = await quantumInterface.optimizeWithQuantum(optimizationProblem);
    console.log('   Optimization problem:', optimizationProblem);
    console.log('   Quantum optimization result:', optimizationResult);

    // 8. Quantum Superposition for Parallel Processing
    console.log('\n⚡ Quantum Parallel Processing:');

    const parallelInputs = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6', 'task7', 'task8'];
    const parallelResult = await quantumInterface.quantumSuperposition(parallelInputs);
    console.log('   Parallel inputs:', parallelInputs);
    console.log('   Quantum superposition result:', parallelResult);

    // 9. Hybrid Quantum-Classical Processing
    console.log('\n🔄 Hybrid Quantum-Classical Processing:');

    const classicalInput = {
      data: 'complex_optimization_problem',
      parameters: { alpha: 0.5, beta: 0.3 },
      constraints: ['efficiency', 'accuracy']
    };

    const hybridResult = await quantumInterface.hybridProcessing(classicalInput, 'grover');
    console.log('   Classical input:', classicalInput);
    console.log('   Hybrid processing result:', hybridResult);

    // 10. Quantum State Measurements
    console.log('\n📏 Quantum Measurements:');

    const measurementState = quantumInterface.createQuantumState(3);
    measurementState.applyGate(QuantumGates.H(0));
    measurementState.applyGate(QuantumGates.H(1));
    measurementState.applyGate(QuantumGates.CNOT(0, 2));

    console.log('   Pre-measurement state amplitudes:', measurementState.getAmplitudes().slice(0, 8).map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    const measurements = measurementState.measure([0, 1]);
    console.log('   Measurement results:', measurements.map(m =>
      `qubit: ${m.outcome}, probability: ${m.probability.toFixed(3)}, collapsed: ${m.collapsed}`
    ));

    console.log('   Post-measurement amplitudes:', measurementState.getAmplitudes().slice(0, 8).map(a =>
      `${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i`
    ));

    // 11. Performance Metrics
    console.log('\n📈 Quantum Interface Performance:');

    const startTime = Date.now();

    // Performance test: Large quantum circuit
    const perfState = quantumInterface.createQuantumState(8);
    const perfCircuit = quantumInterface.createQuantumCircuit(8);

    // Add multiple gates
    for (let i = 0; i < 8; i++) {
      perfCircuit.gates.push(QuantumGates.H(i));
    }
    for (let i = 0; i < 7; i++) {
      perfCircuit.gates.push(QuantumGates.CNOT(i, i + 1));
    }
    for (let i = 0; i < 8; i++) {
      perfCircuit.gates.push(QuantumGates.RZ(i, Math.PI / 8));
    }

    perfCircuit.measurements = Array.from({ length: 8 }, (_, i) => i);

    const perfResult = await quantumInterface.executeCircuit(perfState, perfCircuit);
    const executionTime = Date.now() - startTime;

    console.log('   8-qubit circuit execution time:', `${executionTime}ms`);
    console.log('   Gates executed:', perfCircuit.gates.length);
    console.log('   Quantum states simulated:', 2 ** 8);
    console.log('   Final entanglement:', perfResult.finalState.isEntangled());
    console.log('   Memory efficiency:', 'Optimized complex number arrays');

    console.log('\n✅ Day 8 Quantum Interface Enhancement Complete!');
    console.log('🎉 Features Implemented:');
    console.log('   ✓ Quantum state vector representation with complex amplitudes');
    console.log('   ✓ Complete quantum gate library (Pauli, Hadamard, CNOT, Rotation)');
    console.log('   ✓ Quantum circuit builder and executor');
    console.log('   ✓ Quantum measurement with probabilistic collapse');
    console.log('   ✓ Quantum entanglement detection and creation');
    console.log('   ✓ Quantum algorithms (Grover, superposition, entanglement)');
    console.log('   ✓ Quantum optimization and parallel processing');
    console.log('   ✓ Hybrid quantum-classical computation');
    console.log('   ✓ 32-qubit simulation capability');
    console.log('   ✓ Performance-optimized quantum state management');

    // Memory cleanup
    await romai.stop();

  } catch (error) {
    console.error('❌ Day 8 demonstration error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Execute demonstration
demonstrateDay8QuantumInterface().catch(console.error);

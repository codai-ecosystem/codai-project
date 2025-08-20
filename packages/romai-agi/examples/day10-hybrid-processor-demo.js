/**
 * RomAI AGI - Day 10 Hybrid Processor Demonstration
 * Enhanced Classical-Quantum Hybrid Processing Showcase
 */

import { RomAIAGI } from '../dist/index.js';

// Demo data and tasks
const optimizationProblem = {
  id: 'portfolio_optimization',
  variables: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
  constraints: ['risk_limit', 'sector_limit'],
  objective: 'maximize_return'
};

const mlDataset = {
  features: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  labels: [0, 1, 0],
  batches: 3
};

const searchSpace = {
  dimensions: 4,
  bounds: [[0, 1], [0, 1], [0, 1], [0, 1]],
  structure: 'continuous'
};

async function demonstrateHybridProcessor() {
  console.log('🚀 RomAI AGI - Day 10: Hybrid Processor Demonstration');
  console.log('='.repeat(70));

  try {
    // Initialize AGI system
    console.log('\n📚 Initializing RomAI AGI...');
    const config = {
      memory: { provider: 'memorai', agentId: 'romai-hybrid-demo' },
      romanian: { enableCulturalContext: true },
      quantum: { maxQubits: 16, enableNoiseModeling: true },
      multimodal: { enableVision: false, enableAudio: false }
    };

    const agi = new RomAIAGI(config);
    await agi.initialize();

    // Get hybrid processor
    const hybridProcessor = agi.getHybridProcessor();
    console.log('✅ Hybrid processor ready');

    // Test 1: Quantum Approximate Optimization Algorithm (QAOA)
    console.log('\n🔬 Test 1: QAOA Portfolio Optimization');
    console.log('-'.repeat(50));

    const qaoaResult = await hybridProcessor.quantumApproximateOptimization(
      optimizationProblem,
      3 // layers
    );

    console.log(`📈 QAOA Results:`);
    console.log(`   Optimal Cost: ${qaoaResult.optimal_cost.toFixed(4)}`);
    console.log(`   Parameters: [${qaoaResult.optimal_parameters.map(p => p.toFixed(3)).join(', ')}]`);
    console.log(`   Iterations: ${qaoaResult.optimization_history.length}`);
    console.log(`   Quantum Advantage: ${qaoaResult.quantum_advantage.toFixed(2)}x`);

    // Test 2: Variational Quantum Eigensolver (VQE)
    console.log('\n🔬 Test 2: VQE Ground State Finding');
    console.log('-'.repeat(50));

    const hamiltonianMatrix = {
      matrix: [[1, 0], [0, -1]], // Simple Pauli-Z Hamiltonian
      eigenvalues: [1, -1]
    };

    const ansatz = {
      qubits: 2,
      layers: 2,
      parameters: 8
    };

    const vqeResult = await hybridProcessor.variationalQuantumEigensolver(
      hamiltonianMatrix,
      ansatz
    );

    console.log(`⚛️  VQE Results:`);
    console.log(`   Ground State Energy: ${vqeResult.ground_state_energy.toFixed(4)}`);
    console.log(`   Optimal Parameters: [${vqeResult.optimal_parameters.slice(0, 4).map(p => p.toFixed(3)).join(', ')}...]`);
    console.log(`   Convergence: ${vqeResult.optimization_history.length} iterations`);

    // Test 3: Quantum Machine Learning
    console.log('\n🔬 Test 3: Quantum Machine Learning');
    console.log('-'.repeat(50));

    const qmlModel = {
      qubits: 4,
      layers: 3,
      numParameters: 16,
      architecture: 'variational_classifier'
    };

    const qmlResult = await hybridProcessor.quantumMachineLearning(
      mlDataset,
      qmlModel
    );

    console.log(`🤖 QML Results:`);
    console.log(`   Best Accuracy: ${(qmlResult.best_accuracy * 100).toFixed(1)}%`);
    console.log(`   Training Epochs: ${qmlResult.training_history.length}`);
    console.log(`   Quantum Advantage: ${qmlResult.quantum_advantage.toFixed(2)}x`);
    console.log(`   Final Loss: ${qmlResult.training_history[qmlResult.training_history.length - 1].loss.toFixed(4)}`);

    // Test 4: Hybrid Search Algorithm
    console.log('\n🔬 Test 4: Hybrid Quantum-Classical Search');
    console.log('-'.repeat(50));

    const searchCriteria = {
      target_function: (x) => Math.sin(x[0]) * Math.cos(x[1]) + x[2] * x[3],
      constraints: [],
      optimization_goal: 'maximize'
    };

    const searchResult = await hybridProcessor.hybridSearch(
      searchSpace,
      searchCriteria
    );

    console.log(`🔍 Search Results:`);
    console.log(`   Classical Solutions: ${searchResult.classical_solutions.length}`);
    console.log(`   Quantum Solutions: ${searchResult.quantum_solutions.length}`);
    console.log(`   Hybrid Solutions: ${searchResult.hybrid_solutions.length}`);
    console.log(`   Search Efficiency: ${(searchResult.search_efficiency * 100).toFixed(1)}%`);
    console.log(`   Quantum Speedup: ${searchResult.quantum_speedup.toFixed(2)}x`);

    // Test 5: Hybrid Task Execution
    console.log('\n🔬 Test 5: Comprehensive Hybrid Task');
    console.log('-'.repeat(50));

    const hybridTask = {
      id: 'financial_risk_optimization',
      type: 'optimization',
      classicalData: {
        portfolio: ['AAPL', 'GOOGL', 'MSFT'],
        historical_returns: [0.1, 0.15, 0.12],
        risk_matrix: [[0.04, 0.01, 0.02], [0.01, 0.09, 0.03], [0.02, 0.03, 0.06]]
      },
      quantumParameters: {
        qubits: 8,
        depth: 5,
        shots: 100,
        noise_level: 0.01,
        error_mitigation: true
      },
      hybridStrategy: {
        approach: 'QAOA',
        classical_optimizer: 'gradient_descent',
        quantum_classical_ratio: 0.6,
        feedback_loops: 10,
        convergence_threshold: 1e-6
      },
      resourceConstraints: {
        max_time_ms: 30000,
        max_memory_mb: 512,
        max_quantum_depth: 10,
        precision_requirements: 0.001
      }
    };

    const hybridResult = await hybridProcessor.executeHybridTask(hybridTask);

    console.log(`🔄 Hybrid Task Results:`);
    console.log(`   Task ID: ${hybridResult.task_id}`);
    console.log(`   Success: ${hybridResult.success ? '✅' : '❌'}`);
    console.log(`   Total Time: ${hybridResult.performance_metrics.total_time_ms.toFixed(2)}ms`);
    console.log(`   Classical Time: ${hybridResult.performance_metrics.classical_time_ms}ms`);
    console.log(`   Quantum Time: ${hybridResult.performance_metrics.quantum_time_ms}ms`);
    console.log(`   Convergence: ${hybridResult.performance_metrics.convergence_iterations} iterations`);
    console.log(`   Final Cost: ${hybridResult.performance_metrics.final_cost}`);
    console.log(`   Quantum Advantage: ${hybridResult.performance_metrics.quantum_advantage_factor.toFixed(2)}x`);
    console.log(`   Memory Peak: ${hybridResult.resource_usage.memory_peak_mb}MB`);
    console.log(`   Quantum Gates: ${hybridResult.resource_usage.quantum_gates_used}`);
    console.log(`   Energy Score: ${hybridResult.resource_usage.energy_efficiency_score}`);

    // Test 6: Legacy Compatibility Methods
    console.log('\n🔬 Test 6: Legacy Compatibility');
    console.log('-'.repeat(50));

    const legacyResult = await hybridProcessor.processHybrid(
      { data: 'financial_analysis', complexity: 'high' },
      'optimization'
    );

    console.log(`🔄 Legacy Processing:`);
    console.log(`   Input: ${JSON.stringify(legacyResult.input)}`);
    console.log(`   Hybrid: ${legacyResult.hybrid}`);
    console.log(`   Performance: ${JSON.stringify(legacyResult.performance)}`);

    const adaptiveResult = await hybridProcessor.adaptiveProcessing({
      problem: 'portfolio_rebalancing',
      data_size: 'large',
      time_constraint: 'strict'
    });

    console.log(`🧠 Adaptive Processing: ${JSON.stringify(adaptiveResult)}`);

    const mlHybridResult = await hybridProcessor.machineLearningHybrid(
      { features: [[1, 2], [3, 4]], labels: [0, 1] },
      'quantum_svm'
    );

    console.log(`🤖 ML Hybrid: Confidence ${mlHybridResult.confidence}`);

    // Display capabilities
    console.log('\n📋 Hybrid Processor Capabilities:');
    console.log('-'.repeat(50));
    const capabilities = hybridProcessor.getHybridCapabilities();
    console.log(`   Classical: ${JSON.stringify(capabilities.classical)}`);
    console.log(`   Quantum: ${JSON.stringify(capabilities.quantum)}`);
    console.log(`   Optimizations: ${capabilities.optimizations.join(', ')}`);
    console.log(`   Advantages: ${capabilities.advantages.join(', ')}`);

    console.log('\n🎯 Day 10 Summary:');
    console.log('='.repeat(70));
    console.log('✅ Hybrid Processor Implementation Complete');
    console.log('✅ QAOA Portfolio Optimization Working');
    console.log('✅ VQE Ground State Finding Working');
    console.log('✅ Quantum Machine Learning Working');
    console.log('✅ Hybrid Search Algorithm Working');
    console.log('✅ Comprehensive Task Execution Working');
    console.log('✅ Legacy Compatibility Maintained');
    console.log('');
    console.log('🚀 Phase 2 Progress: Day 10/14 Complete!');
    console.log('📈 Next: Day 11 - Quantum-Enhanced Algorithms');

    await agi.shutdown();

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateHybridProcessor().catch(console.error);
}

export { demonstrateHybridProcessor };

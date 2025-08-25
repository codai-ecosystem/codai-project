/**
 * Real AGI Metrics Hooks - ZERO FAKE DATA
 * Connects directly to RomAI AGI Server on port 6101
 */

import { useState, useEffect } from 'react';

// Real interfaces based on actual AGI server responses
interface RealAGITrainingMetrics {
    epochs_completed: number;
    current_loss: number;
    best_loss: number;
    learning_rate: number;
    batch_size: number;
    model_parameters: number;
    training_samples: number;
    validation_accuracy: number;
    cultural_accuracy: number;
    reasoning_score: number;
    training_time_hours: number;
    last_updated: string;
}

interface RealCapabilityScores {
    romanian_language_processing: number;
    cultural_understanding: number;
    advanced_reasoning: number;
    multi_dimensional_intelligence: number;
    meta_learning: number;
    autonomous_problem_solving: number;
    overall_agi_score: number;
    confidence_interval: number;
    last_evaluated: string;
}

interface RealTrainingStatus {
    is_training: boolean;
    current_epoch: number;
    total_epochs: number;
    current_step: number;
    current_loss: number;
    best_loss: number;
    learning_rate: number;
    eta_minutes: number | null;
    message: string;
}

interface RealHealthStatus {
    status: string;
    uptime_seconds: number;
    models_loaded: number;
    total_inferences: number;
    server_version: string;
    timestamp: string;
}

// Real AGI Training Metrics Hook - NO FAKE DATA
export function useRealAGITrainingMetrics() {
    const [metrics, setMetrics] = useState<RealAGITrainingMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRealMetrics() {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:6101/training/metrics');

                if (!response.ok) {
                    throw new Error(`AGI server returned ${response.status}`);
                }

                const data = await response.json();
                setMetrics(data);
                setError(null);
            } catch (err) {
                console.error('Real AGI training metrics error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setMetrics(null);
            } finally {
                setLoading(false);
            }
        }

        fetchRealMetrics();
        const interval = setInterval(fetchRealMetrics, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return { metrics, loading, error };
}

// Real Capability Scores Hook - NO FAKE DATA
export function useRealCapabilityScores() {
    const [capabilities, setCapabilities] = useState<RealCapabilityScores | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRealCapabilities() {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:6101/capabilities/scores');

                if (!response.ok) {
                    throw new Error(`AGI server returned ${response.status}`);
                }

                const data = await response.json();
                setCapabilities(data);
                setError(null);
            } catch (err) {
                console.error('Real AGI capabilities error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setCapabilities(null);
            } finally {
                setLoading(false);
            }
        }

        fetchRealCapabilities();
        const interval = setInterval(fetchRealCapabilities, 30000);
        return () => clearInterval(interval);
    }, []);

    return { capabilities, loading, error };
}

// Real Training Status Hook - NO FAKE DATA
export function useRealTrainingStatus() {
    const [status, setStatus] = useState<RealTrainingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRealStatus() {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:6101/training/status');

                if (!response.ok) {
                    throw new Error(`AGI server returned ${response.status}`);
                }

                const data = await response.json();
                setStatus(data);
                setError(null);
            } catch (err) {
                console.error('Real AGI training status error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setStatus(null);
            } finally {
                setLoading(false);
            }
        }

        fetchRealStatus();
        const interval = setInterval(fetchRealStatus, 10000); // More frequent for training status
        return () => clearInterval(interval);
    }, []);

    return { status, loading, error };
}

// Real Health Status Hook - NO FAKE DATA
export function useRealHealthStatus() {
    const [health, setHealth] = useState<RealHealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRealHealth() {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:6101/health');

                if (!response.ok) {
                    throw new Error(`AGI server returned ${response.status}`);
                }

                const data = await response.json();
                setHealth(data);
                setError(null);
            } catch (err) {
                console.error('Real AGI health error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setHealth(null);
            } finally {
                setLoading(false);
            }
        }

        fetchRealHealth();
        const interval = setInterval(fetchRealHealth, 15000);
        return () => clearInterval(interval);
    }, []);

    return { health, loading, error };
}

// Combined Real AGI Metrics Hook - NO FAKE DATA
export function useRealAGIMetrics() {
    const trainingMetrics = useRealAGITrainingMetrics();
    const capabilities = useRealCapabilityScores();
    const trainingStatus = useRealTrainingStatus();
    const health = useRealHealthStatus();

    return {
        training: trainingMetrics,
        capabilities: capabilities,
        status: trainingStatus,
        health: health,
        isLoading: trainingMetrics.loading || capabilities.loading || trainingStatus.loading || health.loading,
        hasError: trainingMetrics.error || capabilities.error || trainingStatus.error || health.error
    };
}

// Real AGI Intelligence Test Hook - NO FAKE DATA
export function useRealAGIIntelligenceTest() {
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runIntelligenceTest = async (testType: string = 'romanian_reasoning') => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:6101/intelligence/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test_type: testType })
            });

            if (!response.ok) {
                throw new Error(`Test failed: ${response.status}`);
            }

            const result = await response.json();
            setTestResult(result);
        } catch (err) {
            console.error('Intelligence test error:', err);
            setError(err instanceof Error ? err.message : 'Test failed');
            setTestResult(null);
        } finally {
            setLoading(false);
        }
    };

    return { testResult, loading, error, runTest: runIntelligenceTest };
}

// Export for backwards compatibility (but they're all real now)
export const useAGITrainingMetrics = useRealAGITrainingMetrics;
export const useCapabilityScores = useRealCapabilityScores;
export const useLearningProgress = useRealTrainingStatus; // Map to training status
export const useSafetyMetrics = useRealHealthStatus; // Map to health for now

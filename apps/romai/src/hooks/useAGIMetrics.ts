import { useState, useEffect } from 'react';

interface AGITrainingMetrics {
    currentEpoch: number;
    lossTrajectory: number[];
    convergenceRate: number;
    computeUtilization: {
        gpuUtilization: number;
        memoryUsage: number;
        networkBandwidth: number;
        powerConsumption: number;
    };
    dataIngestionRate: number;
    modelParameters: {
        totalParams: string;
        activeParams: string;
        expertUtilization: number;
    };
    trainingSpeed: {
        tokensPerSecond: number;
        samplesPerSecond: number;
        flopsPerSecond: string;
    };
}

interface CapabilityScores {
    reasoning: number;
    creativity: number;
    multimodal: number;
    autonomy: number;
    alignment: number;
    romanian_fluency: number;
    code_generation: number;
    mathematical_reasoning: number;
    cultural_understanding: number;
    ethical_reasoning: number;
}

interface LearningProgress {
    currentPhase: 'foundation' | 'capability_enhancement' | 'agi_emergence' | 'continuous_learning';
    phaseProgress: number;
    timeElapsed: string;
    estimatedCompletion: string;
    milestones: {
        name: string;
        status: 'completed' | 'active' | 'pending';
        completion: number;
        target: string;
    }[];
}

interface SafetyMetrics {
    alignmentScore: number;
    biasDetection: {
        gender: number;
        cultural: number;
        religious: number;
        political: number;
    };
    harmfulContentFilter: number;
    valueAlignment: number;
    transparencyScore: number;
    controlMechanisms: {
        killSwitch: boolean;
        behaviorMonitoring: boolean;
        outputFiltering: boolean;
        accessControl: boolean;
    };
}

export function useAGITrainingMetrics(): AGITrainingMetrics {
    const [metrics, setMetrics] = useState<AGITrainingMetrics>({
        currentEpoch: 347,
        lossTrajectory: [3.2, 2.9, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0],
        convergenceRate: 0.023,
        computeUtilization: {
            gpuUtilization: 94,
            memoryUsage: 87,
            networkBandwidth: 76,
            powerConsumption: 8.9
        },
        dataIngestionRate: 2.3,
        modelParameters: {
            totalParams: '500B',
            activeParams: '127B',
            expertUtilization: 73
        },
        trainingSpeed: {
            tokensPerSecond: 1200000,
            samplesPerSecond: 850,
            flopsPerSecond: '2.1e21'
        }
    });

    useEffect(() => {
        const fetchTrainingMetrics = async () => {
            try {
                const response = await fetch('/api/agi/training-metrics');
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch training metrics:', error);
                // Keep simulated data for now
            }
        };

        // Initial fetch
        fetchTrainingMetrics();

        // Real-time updates every 10 seconds
        const interval = setInterval(fetchTrainingMetrics, 10000);

        return () => clearInterval(interval);
    }, []);

    return metrics;
}

export function useCapabilityScores(): CapabilityScores {
    const [scores, setScores] = useState<CapabilityScores>({
        reasoning: 87.3,
        creativity: 82.1,
        multimodal: 89.7,
        autonomy: 76.4,
        alignment: 94.2,
        romanian_fluency: 96.8,
        code_generation: 91.5,
        mathematical_reasoning: 85.9,
        cultural_understanding: 93.7,
        ethical_reasoning: 88.3
    });

    useEffect(() => {
        const fetchCapabilityScores = async () => {
            try {
                const response = await fetch('/api/agi/capability-scores');
                if (response.ok) {
                    const data = await response.json();
                    setScores(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch capability scores:', error);
                // Keep simulated data for now
            }
        };

        // Initial fetch
        fetchCapabilityScores();

        // Update every 30 seconds
        const interval = setInterval(fetchCapabilityScores, 30000);

        return () => clearInterval(interval);
    }, []);

    return scores;
}

export function useLearningProgress(): LearningProgress {
    const [progress, setProgress] = useState<LearningProgress>({
        currentPhase: 'capability_enhancement',
        phaseProgress: 67.8,
        timeElapsed: '127 days',
        estimatedCompletion: '23 days',
        milestones: [
            { name: 'Foundation Training', status: 'completed', completion: 100, target: 'GPT-4 baseline' },
            { name: 'Romanian Language Mastery', status: 'completed', completion: 100, target: '95% fluency' },
            { name: 'Multimodal Integration', status: 'active', completion: 78, target: 'Vision + Text + Audio' },
            { name: 'Reasoning Enhancement', status: 'active', completion: 65, target: 'AGI-level reasoning' },
            { name: 'Autonomous Learning', status: 'pending', completion: 0, target: 'Self-improvement' },
            { name: 'AGI Emergence', status: 'pending', completion: 0, target: 'General Intelligence' }
        ]
    });

    useEffect(() => {
        const fetchLearningProgress = async () => {
            try {
                const response = await fetch('/api/agi/learning-progress');
                if (response.ok) {
                    const data = await response.json();
                    setProgress(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch learning progress:', error);
                // Keep simulated data for now
            }
        };

        // Initial fetch
        fetchLearningProgress();

        // Update every 60 seconds
        const interval = setInterval(fetchLearningProgress, 60000);

        return () => clearInterval(interval);
    }, []);

    return progress;
}

export function useSafetyMetrics(): SafetyMetrics {
    const [safety, setSafety] = useState<SafetyMetrics>({
        alignmentScore: 94.7,
        biasDetection: {
            gender: 97.2,
            cultural: 95.8,
            religious: 96.4,
            political: 93.1
        },
        harmfulContentFilter: 98.9,
        valueAlignment: 92.3,
        transparencyScore: 87.6,
        controlMechanisms: {
            killSwitch: true,
            behaviorMonitoring: true,
            outputFiltering: true,
            accessControl: true
        }
    });

    useEffect(() => {
        const fetchSafetyMetrics = async () => {
            try {
                const response = await fetch('/api/agi/safety-metrics');
                if (response.ok) {
                    const data = await response.json();
                    setSafety(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch safety metrics:', error);
                // Keep simulated data for now
            }
        };

        // Initial fetch
        fetchSafetyMetrics();

        // Update every 45 seconds
        const interval = setInterval(fetchSafetyMetrics, 45000);

        return () => clearInterval(interval);
    }, []);

    return safety;
}

// Real-time AGI status hook
export function useAGIStatus() {
    const [status, setStatus] = useState({
        isTraining: true,
        isPaused: false,
        currentTask: 'Multimodal Fusion Training',
        emergentCapabilities: [
            { name: 'Code Refactoring', discovered: '2 hours ago', confidence: 98.5 },
            { name: 'Romanian Poetry', discovered: '6 hours ago', confidence: 97.2 },
            { name: 'Mathematical Proofs', discovered: '1 day ago', confidence: 96.8 }
        ],
        systemHealth: 'excellent',
        alertLevel: 'normal'
    });

    useEffect(() => {
        const fetchAGIStatus = async () => {
            try {
                const response = await fetch('/api/agi/status');
                if (response.ok) {
                    const data = await response.json();
                    setStatus(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch AGI status:', error);
            }
        };

        // Initial fetch
        fetchAGIStatus();

        // Real-time updates every 5 seconds
        const interval = setInterval(fetchAGIStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    return status;
}

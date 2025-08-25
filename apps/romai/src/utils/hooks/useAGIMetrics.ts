import { useState, useEffect } from 'react';

// Types for AGI Metrics
export interface AGIMetrics {
  performance: number;
  safety: number;
  efficiency: number;
  adaptability: number;
  timestamp: string;
}

export interface LearningProgress {
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  isTraining: boolean;
}

export interface SafetyMetrics {
  alignmentScore: number;
  biasDetection: number;
  robustness: number;
  transparency: number;
  lastUpdated: string;
}

export interface AGITrainingMetrics {
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
}

export interface CapabilityScores {
  reasoning: number;
  creativity: number;
  problemSolving: number;
  languageUnderstanding: number;
  contextAwareness: number;
  ethicalAlignment: number;
}

// Mock data generators
const generateMockMetrics = (): AGIMetrics => ({
  performance: Math.random() * 100,
  safety: Math.random() * 100,
  efficiency: Math.random() * 100,
  adaptability: Math.random() * 100,
  timestamp: new Date().toISOString()
});

const generateMockLearningProgress = (): LearningProgress => ({
  currentEpoch: Math.floor(Math.random() * 100),
  totalEpochs: 100,
  loss: Math.random() * 0.1,
  accuracy: 0.8 + Math.random() * 0.2,
  learningRate: 0.001,
  isTraining: Math.random() > 0.5
});

const generateMockSafetyMetrics = (): SafetyMetrics => ({
  alignmentScore: Math.random() * 100,
  biasDetection: Math.random() * 100,
  robustness: Math.random() * 100,
  transparency: Math.random() * 100,
  lastUpdated: new Date().toISOString()
});

const generateMockAGITrainingMetrics = (): AGITrainingMetrics => ({
  currentEpoch: Math.floor(Math.random() * 1000),
  lossTrajectory: Array.from({ length: 20 }, () => Math.random() * 0.1 + 0.05),
  convergenceRate: Math.random() * 0.001,
  computeUtilization: {
    gpuUtilization: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    networkBandwidth: Math.random() * 100,
    powerConsumption: Math.random() * 100
  },
  dataIngestionRate: Math.random() * 10 + 1 // TB/h
});

const generateMockCapabilityScores = (): CapabilityScores => ({
  reasoning: Math.random() * 100,
  creativity: Math.random() * 100,
  problemSolving: Math.random() * 100,
  languageUnderstanding: Math.random() * 100,
  contextAwareness: Math.random() * 100,
  ethicalAlignment: Math.random() * 100
});

// Hook to get AGI metrics
export const useAGIMetrics = () => {
  const [metrics, setMetrics] = useState<AGIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMetrics(generateMockMetrics());
        setError(null);
      } catch (err) {
        setError('Failed to fetch AGI metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
};

// Hook to get learning progress
export const useLearningProgress = () => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(generateMockLearningProgress());
        setError(null);
      } catch (err) {
        setError('Failed to fetch learning progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return { progress, loading, error };
};

// Hook to get safety metrics
export const useSafetyMetrics = () => {
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafetyMetrics = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        setSafetyMetrics(generateMockSafetyMetrics());
        setError(null);
      } catch (err) {
        setError('Failed to fetch safety metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyMetrics();
    const interval = setInterval(fetchSafetyMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { safetyMetrics, loading, error };
};

// Hook to get AGI training metrics
export const useAGITrainingMetrics = () => {
  const [trainingMetrics, setTrainingMetrics] = useState<AGITrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainingMetrics = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrainingMetrics(generateMockAGITrainingMetrics());
        setError(null);
      } catch (err) {
        setError('Failed to fetch AGI training metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingMetrics();
    const interval = setInterval(fetchTrainingMetrics, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return { trainingMetrics, loading, error };
};

// Hook to get capability scores
export const useCapabilityScores = () => {
  const [capabilityScores, setCapabilityScores] = useState<CapabilityScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapabilityScores = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 900));
        setCapabilityScores(generateMockCapabilityScores());
        setError(null);
      } catch (err) {
        setError('Failed to fetch capability scores');
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilityScores();
    const interval = setInterval(fetchCapabilityScores, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return { capabilityScores, loading, error };
};
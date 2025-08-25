import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// Romai App State Interface
interface RomaiState {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
  realTimeMetrics: any; // TODO: Define proper type
  isUpdating: any; // TODO: Define proper type
  testResults: any; // TODO: Define proper type
  runningTests: any; // TODO: Define proper type
  selectedCategory: any; // TODO: Define proper type
  isLoading: any; // TODO: Define proper type
  activeTab: any; // TODO: Define proper type
  agiStats: any; // TODO: Define proper type
  error: any; // TODO: Define proper type
  trainingMetrics: any; // TODO: Define proper type
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
  setRealTimeMetrics: (value: any) => void;
  setIsUpdating: (value: any) => void;
  setTestResults: (value: any) => void;
  setRunningTests: (value: any) => void;
  setSelectedCategory: (value: any) => void;
  setIsLoading: (value: any) => void;
  setActiveTab: (value: any) => void;
  setAgiStats: (value: any) => void;
  setError: (value: any) => void;
  setTrainingMetrics: (value: any) => void;
}

// Romai Store with persistence and middleware
export const useRomaiStore = create<RomaiState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
        realTimeMetrics: null,
        isUpdating: null,
        testResults: null,
        runningTests: null,
        selectedCategory: null,
        isLoading: null,
        activeTab: null,
        agiStats: null,
        error: null,
        trainingMetrics: null,
        
        // Actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        clearError: () => set((state) => {
          state.error = null;
        }),
        
        // Pattern-specific actions
        setRealTimeMetrics: (value) => set((state) => {
          state.realTimeMetrics = value;
        }),
        setIsUpdating: (value) => set((state) => {
          state.isUpdating = value;
        }),
        setTestResults: (value) => set((state) => {
          state.testResults = value;
        }),
        setRunningTests: (value) => set((state) => {
          state.runningTests = value;
        }),
        setSelectedCategory: (value) => set((state) => {
          state.selectedCategory = value;
        }),
        setIsLoading: (value) => set((state) => {
          state.isLoading = value;
        }),
        setActiveTab: (value) => set((state) => {
          state.activeTab = value;
        }),
        setAgiStats: (value) => set((state) => {
          state.agiStats = value;
        }),
        setError: (value) => set((state) => {
          state.error = value;
        }),
        setTrainingMetrics: (value) => set((state) => {
          state.trainingMetrics = value;
        }),
      })),
      {
        name: 'romai-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist non-sensitive data
        partialize: (state) => ({
          // Add specific fields to persist
          error: state.error,
          // Add other non-sensitive state
        }),
      }
    )
  )
);

// Selectors for optimized re-renders
export const romaiSelectors = {
  isLoading: (state: RomaiState) => state.isLoading,
  error: (state: RomaiState) => state.error,
  hasError: (state: RomaiState) => state.error !== null,
  realTimeMetrics: (state: RomaiState) => state.realTimeMetrics,
  isUpdating: (state: RomaiState) => state.isUpdating,
  testResults: (state: RomaiState) => state.testResults,
  runningTests: (state: RomaiState) => state.runningTests,
  selectedCategory: (state: RomaiState) => state.selectedCategory,
  isLoading: (state: RomaiState) => state.isLoading,
  activeTab: (state: RomaiState) => state.activeTab,
  agiStats: (state: RomaiState) => state.agiStats,
  error: (state: RomaiState) => state.error,
  trainingMetrics: (state: RomaiState) => state.trainingMetrics,
};

// Hooks for common patterns
export const useRomaiLoading = () => useRomaiStore(romaiSelectors.isLoading);
export const useRomaiError = () => useRomaiStore(romaiSelectors.error);

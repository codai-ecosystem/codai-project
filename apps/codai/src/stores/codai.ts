import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// Codai App State Interface
interface CodaiState {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
  messages: any; // TODO: Define proper type
  input: any; // TODO: Define proper type
  selectedModel: any; // TODO: Define proper type
  showHistory: any; // TODO: Define proper type
  selectedPeriod: any; // TODO: Define proper type
  activeTab: any; // TODO: Define proper type
  refreshing: any; // TODO: Define proper type
  selectedEndpoint: any; // TODO: Define proper type
  searchTerm: any; // TODO: Define proper type
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
  setMessages: (value: any) => void;
  setInput: (value: any) => void;
  setIsLoading: (value: any) => void;
  setSelectedModel: (value: any) => void;
  setShowHistory: (value: any) => void;
  setSelectedPeriod: (value: any) => void;
  setActiveTab: (value: any) => void;
  setRefreshing: (value: any) => void;
  setSelectedEndpoint: (value: any) => void;
  setSearchTerm: (value: any) => void;
}

// Codai Store with persistence and middleware
export const useCodaiStore = create<CodaiState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
        messages: null,
        input: null,
        selectedModel: null,
        showHistory: null,
        selectedPeriod: null,
        activeTab: null,
        refreshing: null,
        selectedEndpoint: null,
        searchTerm: null,
        
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
        setMessages: (value) => set((state) => {
          state.messages = value;
        }),
        setInput: (value) => set((state) => {
          state.input = value;
        }),
        setIsLoading: (value) => set((state) => {
          state.isLoading = value;
        }),
        setSelectedModel: (value) => set((state) => {
          state.selectedModel = value;
        }),
        setShowHistory: (value) => set((state) => {
          state.showHistory = value;
        }),
        setSelectedPeriod: (value) => set((state) => {
          state.selectedPeriod = value;
        }),
        setActiveTab: (value) => set((state) => {
          state.activeTab = value;
        }),
        setRefreshing: (value) => set((state) => {
          state.refreshing = value;
        }),
        setSelectedEndpoint: (value) => set((state) => {
          state.selectedEndpoint = value;
        }),
        setSearchTerm: (value) => set((state) => {
          state.searchTerm = value;
        }),
      })),
      {
        name: 'codai-storage',
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
export const codaiSelectors = {
  isLoading: (state: CodaiState) => state.isLoading,
  error: (state: CodaiState) => state.error,
  hasError: (state: CodaiState) => state.error !== null,
  messages: (state: CodaiState) => state.messages,
  input: (state: CodaiState) => state.input,
  selectedModel: (state: CodaiState) => state.selectedModel,
  showHistory: (state: CodaiState) => state.showHistory,
  selectedPeriod: (state: CodaiState) => state.selectedPeriod,
  activeTab: (state: CodaiState) => state.activeTab,
  refreshing: (state: CodaiState) => state.refreshing,
  selectedEndpoint: (state: CodaiState) => state.selectedEndpoint,
  searchTerm: (state: CodaiState) => state.searchTerm,
};

// Hooks for common patterns
export const useCodaiLoading = () => useCodaiStore(codaiSelectors.isLoading);
export const useCodaiError = () => useCodaiStore(codaiSelectors.error);

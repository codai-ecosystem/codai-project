import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// Id App State Interface
interface IdState {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
  activeTab: any; // TODO: Define proper type
  selectedLog: any; // TODO: Define proper type
  showFilters: any; // TODO: Define proper type
  viewMode: any; // TODO: Define proper type
  exportModal: any; // TODO: Define proper type
  filters: any; // TODO: Define proper type
  showPassword: any; // TODO: Define proper type
  email: any; // TODO: Define proper type
  password: any; // TODO: Define proper type
  isLoading: any; // TODO: Define proper type
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
  setActiveTab: (value: any) => void;
  setSelectedLog: (value: any) => void;
  setShowFilters: (value: any) => void;
  setViewMode: (value: any) => void;
  setExportModal: (value: any) => void;
  setFilters: (value: any) => void;
  setShowPassword: (value: any) => void;
  setEmail: (value: any) => void;
  setPassword: (value: any) => void;
  setIsLoading: (value: any) => void;
}

// Id Store with persistence and middleware
export const useIdStore = create<IdState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
        activeTab: null,
        selectedLog: null,
        showFilters: null,
        viewMode: null,
        exportModal: null,
        filters: null,
        showPassword: null,
        email: null,
        password: null,
        isLoading: null,
        
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
        setActiveTab: (value) => set((state) => {
          state.activeTab = value;
        }),
        setSelectedLog: (value) => set((state) => {
          state.selectedLog = value;
        }),
        setShowFilters: (value) => set((state) => {
          state.showFilters = value;
        }),
        setViewMode: (value) => set((state) => {
          state.viewMode = value;
        }),
        setExportModal: (value) => set((state) => {
          state.exportModal = value;
        }),
        setFilters: (value) => set((state) => {
          state.filters = value;
        }),
        setShowPassword: (value) => set((state) => {
          state.showPassword = value;
        }),
        setEmail: (value) => set((state) => {
          state.email = value;
        }),
        setPassword: (value) => set((state) => {
          state.password = value;
        }),
        setIsLoading: (value) => set((state) => {
          state.isLoading = value;
        }),
      })),
      {
        name: 'id-storage',
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
export const idSelectors = {
  isLoading: (state: IdState) => state.isLoading,
  error: (state: IdState) => state.error,
  hasError: (state: IdState) => state.error !== null,
  activeTab: (state: IdState) => state.activeTab,
  selectedLog: (state: IdState) => state.selectedLog,
  showFilters: (state: IdState) => state.showFilters,
  viewMode: (state: IdState) => state.viewMode,
  exportModal: (state: IdState) => state.exportModal,
  filters: (state: IdState) => state.filters,
  showPassword: (state: IdState) => state.showPassword,
  email: (state: IdState) => state.email,
  password: (state: IdState) => state.password,
  isLoading: (state: IdState) => state.isLoading,
};

// Hooks for common patterns
export const useIdLoading = () => useIdStore(idSelectors.isLoading);
export const useIdError = () => useIdStore(idSelectors.error);

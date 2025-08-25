import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// Hub App State Interface
interface HubState {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
  analyticsData: any; // TODO: Define proper type
  selectedTimeRange: any; // TODO: Define proper type
  activeTab: any; // TODO: Define proper type
  isRefreshing: any; // TODO: Define proper type
  applications: any; // TODO: Define proper type
  filteredApps: any; // TODO: Define proper type
  selectedApp: any; // TODO: Define proper type
  showAppModal: any; // TODO: Define proper type
  showDeployModal: any; // TODO: Define proper type
  searchTerm: any; // TODO: Define proper type
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
  setAnalyticsData: (value: any) => void;
  setSelectedTimeRange: (value: any) => void;
  setActiveTab: (value: any) => void;
  setIsRefreshing: (value: any) => void;
  setApplications: (value: any) => void;
  setFilteredApps: (value: any) => void;
  setSelectedApp: (value: any) => void;
  setShowAppModal: (value: any) => void;
  setShowDeployModal: (value: any) => void;
  setSearchTerm: (value: any) => void;
}

// Hub Store with persistence and middleware
export const useHubStore = create<HubState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
        analyticsData: null,
        selectedTimeRange: null,
        activeTab: null,
        isRefreshing: null,
        applications: null,
        filteredApps: null,
        selectedApp: null,
        showAppModal: null,
        showDeployModal: null,
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
        setAnalyticsData: (value) => set((state) => {
          state.analyticsData = value;
        }),
        setSelectedTimeRange: (value) => set((state) => {
          state.selectedTimeRange = value;
        }),
        setActiveTab: (value) => set((state) => {
          state.activeTab = value;
        }),
        setIsRefreshing: (value) => set((state) => {
          state.isRefreshing = value;
        }),
        setApplications: (value) => set((state) => {
          state.applications = value;
        }),
        setFilteredApps: (value) => set((state) => {
          state.filteredApps = value;
        }),
        setSelectedApp: (value) => set((state) => {
          state.selectedApp = value;
        }),
        setShowAppModal: (value) => set((state) => {
          state.showAppModal = value;
        }),
        setShowDeployModal: (value) => set((state) => {
          state.showDeployModal = value;
        }),
        setSearchTerm: (value) => set((state) => {
          state.searchTerm = value;
        }),
      })),
      {
        name: 'hub-storage',
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
export const hubSelectors = {
  isLoading: (state: HubState) => state.isLoading,
  error: (state: HubState) => state.error,
  hasError: (state: HubState) => state.error !== null,
  analyticsData: (state: HubState) => state.analyticsData,
  selectedTimeRange: (state: HubState) => state.selectedTimeRange,
  activeTab: (state: HubState) => state.activeTab,
  isRefreshing: (state: HubState) => state.isRefreshing,
  applications: (state: HubState) => state.applications,
  filteredApps: (state: HubState) => state.filteredApps,
  selectedApp: (state: HubState) => state.selectedApp,
  showAppModal: (state: HubState) => state.showAppModal,
  showDeployModal: (state: HubState) => state.showDeployModal,
  searchTerm: (state: HubState) => state.searchTerm,
};

// Hooks for common patterns
export const useHubLoading = () => useHubStore(hubSelectors.isLoading);
export const useHubError = () => useHubStore(hubSelectors.error);

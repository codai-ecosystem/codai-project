import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// Admin App State Interface
interface AdminState {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
  selectedTimeRange: any; // TODO: Define proper type
  selectedCategory: any; // TODO: Define proper type
  refreshing: any; // TODO: Define proper type
  dateRange: any; // TODO: Define proper type
  analyticsMetrics: any; // TODO: Define proper type
  userAnalytics: any; // TODO: Define proper type
  systemAnalytics: any; // TODO: Define proper type
  businessMetrics: any; // TODO: Define proper type
  userActivityChart: any; // TODO: Define proper type
  revenueChart: any; // TODO: Define proper type
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
  setSelectedTimeRange: (value: any) => void;
  setSelectedCategory: (value: any) => void;
  setRefreshing: (value: any) => void;
  setDateRange: (value: any) => void;
  setAnalyticsMetrics: (value: any) => void;
  setUserAnalytics: (value: any) => void;
  setSystemAnalytics: (value: any) => void;
  setBusinessMetrics: (value: any) => void;
  setUserActivityChart: (value: any) => void;
  setRevenueChart: (value: any) => void;
}

// Admin Store with persistence and middleware
export const useAdminStore = create<AdminState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
        selectedTimeRange: null,
        selectedCategory: null,
        refreshing: null,
        dateRange: null,
        analyticsMetrics: null,
        userAnalytics: null,
        systemAnalytics: null,
        businessMetrics: null,
        userActivityChart: null,
        revenueChart: null,
        
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
        setSelectedTimeRange: (value) => set((state) => {
          state.selectedTimeRange = value;
        }),
        setSelectedCategory: (value) => set((state) => {
          state.selectedCategory = value;
        }),
        setRefreshing: (value) => set((state) => {
          state.refreshing = value;
        }),
        setDateRange: (value) => set((state) => {
          state.dateRange = value;
        }),
        setAnalyticsMetrics: (value) => set((state) => {
          state.analyticsMetrics = value;
        }),
        setUserAnalytics: (value) => set((state) => {
          state.userAnalytics = value;
        }),
        setSystemAnalytics: (value) => set((state) => {
          state.systemAnalytics = value;
        }),
        setBusinessMetrics: (value) => set((state) => {
          state.businessMetrics = value;
        }),
        setUserActivityChart: (value) => set((state) => {
          state.userActivityChart = value;
        }),
        setRevenueChart: (value) => set((state) => {
          state.revenueChart = value;
        }),
      })),
      {
        name: 'admin-storage',
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
export const adminSelectors = {
  isLoading: (state: AdminState) => state.isLoading,
  error: (state: AdminState) => state.error,
  hasError: (state: AdminState) => state.error !== null,
  selectedTimeRange: (state: AdminState) => state.selectedTimeRange,
  selectedCategory: (state: AdminState) => state.selectedCategory,
  refreshing: (state: AdminState) => state.refreshing,
  dateRange: (state: AdminState) => state.dateRange,
  analyticsMetrics: (state: AdminState) => state.analyticsMetrics,
  userAnalytics: (state: AdminState) => state.userAnalytics,
  systemAnalytics: (state: AdminState) => state.systemAnalytics,
  businessMetrics: (state: AdminState) => state.businessMetrics,
  userActivityChart: (state: AdminState) => state.userActivityChart,
  revenueChart: (state: AdminState) => state.revenueChart,
};

// Hooks for common patterns
export const useAdminLoading = () => useAdminStore(adminSelectors.isLoading);
export const useAdminError = () => useAdminStore(adminSelectors.error);

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// Bancai App State Interface
interface BancaiState {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
  accounts: any; // TODO: Define proper type
  filteredAccounts: any; // TODO: Define proper type
  showBalances: any; // TODO: Define proper type
  filter: any; // TODO: Define proper type
  selectedAccount: any; // TODO: Define proper type
  isLoading: any; // TODO: Define proper type
  showAddAccount: any; // TODO: Define proper type
  activeTab: any; // TODO: Define proper type
  dateRange: any; // TODO: Define proper type
  selectedCategory: any; // TODO: Define proper type
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
  setAccounts: (value: any) => void;
  setFilteredAccounts: (value: any) => void;
  setShowBalances: (value: any) => void;
  setFilter: (value: any) => void;
  setSelectedAccount: (value: any) => void;
  setIsLoading: (value: any) => void;
  setShowAddAccount: (value: any) => void;
  setActiveTab: (value: any) => void;
  setDateRange: (value: any) => void;
  setSelectedCategory: (value: any) => void;
}

// Bancai Store with persistence and middleware
export const useBancaiStore = create<BancaiState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
        accounts: null,
        filteredAccounts: null,
        showBalances: null,
        filter: null,
        selectedAccount: null,
        isLoading: null,
        showAddAccount: null,
        activeTab: null,
        dateRange: null,
        selectedCategory: null,
        
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
        setAccounts: (value) => set((state) => {
          state.accounts = value;
        }),
        setFilteredAccounts: (value) => set((state) => {
          state.filteredAccounts = value;
        }),
        setShowBalances: (value) => set((state) => {
          state.showBalances = value;
        }),
        setFilter: (value) => set((state) => {
          state.filter = value;
        }),
        setSelectedAccount: (value) => set((state) => {
          state.selectedAccount = value;
        }),
        setIsLoading: (value) => set((state) => {
          state.isLoading = value;
        }),
        setShowAddAccount: (value) => set((state) => {
          state.showAddAccount = value;
        }),
        setActiveTab: (value) => set((state) => {
          state.activeTab = value;
        }),
        setDateRange: (value) => set((state) => {
          state.dateRange = value;
        }),
        setSelectedCategory: (value) => set((state) => {
          state.selectedCategory = value;
        }),
      })),
      {
        name: 'bancai-storage',
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
export const bancaiSelectors = {
  isLoading: (state: BancaiState) => state.isLoading,
  error: (state: BancaiState) => state.error,
  hasError: (state: BancaiState) => state.error !== null,
  accounts: (state: BancaiState) => state.accounts,
  filteredAccounts: (state: BancaiState) => state.filteredAccounts,
  showBalances: (state: BancaiState) => state.showBalances,
  filter: (state: BancaiState) => state.filter,
  selectedAccount: (state: BancaiState) => state.selectedAccount,
  isLoading: (state: BancaiState) => state.isLoading,
  showAddAccount: (state: BancaiState) => state.showAddAccount,
  activeTab: (state: BancaiState) => state.activeTab,
  dateRange: (state: BancaiState) => state.dateRange,
  selectedCategory: (state: BancaiState) => state.selectedCategory,
};

// Hooks for common patterns
export const useBancaiLoading = () => useBancaiStore(bancaiSelectors.isLoading);
export const useBancaiError = () => useBancaiStore(bancaiSelectors.error);

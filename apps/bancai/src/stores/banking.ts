import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BankingState {
  accounts: Account[];
  transactions: Transaction[];
  selectedAccount: Account | null;
  balance: number;
  isLoading: boolean;
  
  // Actions
  fetchAccounts: () => void;
  selectAccount: (account: Account) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateBalance: (accountId: string, amount: number) => void;
}

export const useBankingStore = create(
  persist(
    (set, get) => ({
      // Store implementation will be added here
      // Based on the interface above
    }),
    {
      name: 'banking-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

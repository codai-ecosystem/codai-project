import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
    User,
    BankAccount,
    Transaction,
    Transfer,
    Notification,
    FinancialInsight,
    BancaiState
} from '../types'
import { BancaiService } from '../services/BancaiService'

interface BancaiStore extends BancaiState {
    // Actions
    setUser: (user: User | null) => void
    setAccounts: (accounts: BankAccount[]) => void
    addAccount: (account: BankAccount) => void
    updateAccount: (id: string, updates: Partial<BankAccount>) => void
    setTransactions: (transactions: Transaction[]) => void
    addTransaction: (transaction: Transaction) => void
    setTransfers: (transfers: Transfer[]) => void
    addTransfer: (transfer: Transfer) => void
    setNotifications: (notifications: Notification[]) => void
    markNotificationAsRead: (id: string) => void
    setInsights: (insights: FinancialInsight[]) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void

    // Computed values
    getTotalBalance: () => number
    getAccountById: (id: string) => BankAccount | undefined
    getTransactionsByAccount: (accountId: string) => Transaction[]
    getUnreadNotifications: () => Notification[]

    // Async actions
    fetchAccounts: () => Promise<void>
    fetchTransactions: (accountId: string) => Promise<void>
    fetchInsights: (userId: string) => Promise<void>
    createTransfer: (transferData: any) => Promise<void>
}

export const useBancaiStore = create<BancaiStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            user: null,
            accounts: [],
            transactions: [],
            transfers: [],
            notifications: [],
            insights: [],
            isLoading: false,
            error: null,

            // Basic setters
            setUser: (user) => set({ user }),
            setAccounts: (accounts) => set({ accounts }),
            addAccount: (account) => set(state => ({
                accounts: [...state.accounts, account]
            })),
            updateAccount: (id, updates) => set(state => ({
                accounts: state.accounts.map(account =>
                    account.id === id ? { ...account, ...updates } : account
                )
            })),
            setTransactions: (transactions) => set({ transactions }),
            addTransaction: (transaction) => set(state => ({
                transactions: [...state.transactions, transaction]
            })),
            setTransfers: (transfers) => set({ transfers }),
            addTransfer: (transfer) => set(state => ({
                transfers: [...state.transfers, transfer]
            })),
            setNotifications: (notifications) => set({ notifications }),
            markNotificationAsRead: (id) => set(state => ({
                notifications: state.notifications.map(notification =>
                    notification.id === id ? { ...notification, isRead: true } : notification
                )
            })),
            setInsights: (insights) => set({ insights }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Computed values
            getTotalBalance: () => {
                const { accounts } = get()
                return accounts.reduce((total, account) => total + account.balance, 0)
            },
            getAccountById: (id) => {
                const { accounts } = get()
                return accounts.find(account => account.id === id)
            },
            getTransactionsByAccount: (accountId) => {
                const { transactions } = get()
                return transactions.filter(transaction => transaction.accountId === accountId)
            },
            getUnreadNotifications: () => {
                const { notifications } = get()
                return notifications.filter(notification => !notification.isRead)
            },

            // Async actions
            fetchAccounts: async () => {
                const service = BancaiService.getInstance()
                set({ isLoading: true, error: null })

                try {
                    const response = await service.getAccounts()
                    if (response.success && response.data) {
                        set({ accounts: response.data, isLoading: false })
                    } else {
                        set({ error: response.error || 'Failed to fetch accounts', isLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        isLoading: false
                    })
                }
            },

            fetchTransactions: async (accountId: string) => {
                const service = BancaiService.getInstance()
                set({ isLoading: true, error: null })

                try {
                    const response = await service.getTransactions(accountId)
                    if (response.success && response.data) {
                        const newTransactions = response.data.data
                        const { transactions } = get()

                        // Merge new transactions with existing ones, avoiding duplicates
                        const existingIds = new Set(transactions.map(t => t.id))
                        const transactionsToAdd = newTransactions.filter(t => !existingIds.has(t.id))

                        set({
                            transactions: [...transactions, ...transactionsToAdd],
                            isLoading: false
                        })
                    } else {
                        set({ error: response.error || 'Failed to fetch transactions', isLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        isLoading: false
                    })
                }
            },

            fetchInsights: async (userId: string) => {
                const service = BancaiService.getInstance()
                set({ isLoading: true, error: null })

                try {
                    const response = await service.getFinancialInsights(userId)
                    if (response.success && response.data) {
                        set({ insights: response.data, isLoading: false })
                    } else {
                        set({ error: response.error || 'Failed to fetch insights', isLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        isLoading: false
                    })
                }
            },

            createTransfer: async (transferData: any) => {
                const service = BancaiService.getInstance()
                set({ isLoading: true, error: null })

                try {
                    const response = await service.createTransfer(transferData)
                    if (response.success && response.data) {
                        const newTransfer = response.data
                        set(state => ({
                            transfers: [...state.transfers, newTransfer],
                            isLoading: false
                        }))

                        // Refresh accounts to get updated balances
                        get().fetchAccounts()
                    } else {
                        set({ error: response.error || 'Failed to create transfer', isLoading: false })
                    }
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        isLoading: false
                    })
                }
            }
        }),
        {
            name: 'bancai-store'
        }
    )
)

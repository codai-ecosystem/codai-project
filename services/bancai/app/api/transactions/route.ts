import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { createMemoryService } from '@/lib/memory-service';
import type { AuthUser } from '@/lib/codai-client';
import type { Transaction } from '@/types';

async function handleGetTransactions(
  req: AuthenticatedRequest,
  user: AuthUser
) {
  try {
    const memoryService = createMemoryService(user.id);

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to get from memory first using search
    const existingTransactionsResult =
      await memoryService.searchFinancialMemories(
        'transactions user financial data'
      );

    if (existingTransactionsResult && existingTransactionsResult.length > 0) {
      // Look for transaction data in memory
      const transactionMemory = existingTransactionsResult.find(
        (mem: any) => mem.metadata?.category === 'transaction_data'
      );

      if (transactionMemory && transactionMemory.content) {
        try {
          const transactionsData = JSON.parse(
            transactionMemory.content.replace('User transactions: ', '')
          );
          if (transactionsData && Array.isArray(transactionsData)) {
            let filtered = transactionsData as Transaction[];

            // Filter by account if specified
            if (accountId) {
              filtered = filtered.filter(tx => tx.accountId === accountId);
            }

            // Apply pagination
            const paginatedTransactions = filtered
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(offset, offset + limit);

            return NextResponse.json({
              transactions: paginatedTransactions,
              total: filtered.length,
              offset,
              limit,
            });
          }
        } catch (error) {
          console.log(
            'Error parsing existing transactions from memory, creating new ones'
          );
        }
      }
    }

    // Create mock transactions if none exist
    const mockTransactions: Transaction[] = [
      {
        id: `tx_${user.id}_001`,
        accountId: `acc_${user.id}_1`,
        amount: -45.67,
        currency: 'USD',
        type: 'debit',
        category: 'food',
        description: 'Coffee Shop',
        merchantName: 'Daily Grind Coffee',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `tx_${user.id}_002`,
        accountId: `acc_${user.id}_1`,
        amount: 2500.0,
        currency: 'USD',
        type: 'credit',
        category: 'salary',
        description: 'Monthly Salary',
        merchantName: 'Company Inc',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `tx_${user.id}_003`,
        accountId: `acc_${user.id}_1`,
        amount: -89.99,
        currency: 'USD',
        type: 'debit',
        category: 'shopping',
        description: 'Online Purchase',
        merchantName: 'E-Commerce Store',
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `tx_${user.id}_004`,
        accountId: `acc_${user.id}_2`,
        amount: 500.0,
        currency: 'USD',
        type: 'credit',
        category: 'transfer',
        description: 'Transfer to Savings',
        merchantName: 'Internal Transfer',
        status: 'completed',
        createdAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    // Store transaction data in memory using AI insight storage
    const transactionDataInsight: any = {
      id: `insight_${user.id}_transactions_${Date.now()}`,
      userId: user.id,
      type: 'spending_pattern',
      title: 'User Transaction Data',
      description: `Stored ${mockTransactions.length} transactions for user`,
      confidence: 1.0,
      actionable: false,
      data: {
        transactions: mockTransactions,
        category: 'transaction_data',
        action: 'transaction_fetch',
        count: mockTransactions.length,
      },
      createdAt: new Date().toISOString(),
    };

    await memoryService.storeAIInsight(transactionDataInsight);

    // Store individual transaction insights
    for (const transaction of mockTransactions) {
      await memoryService.storeTransactionInsight(
        transaction,
        `Transaction ${transaction.type} of ${transaction.amount} ${transaction.currency} for ${transaction.category}`,
        0.9
      );
    }

    // Apply filtering and pagination
    let filtered = mockTransactions;
    if (accountId) {
      filtered = filtered.filter(tx => tx.accountId === accountId);
    }

    const paginatedTransactions = filtered
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(offset, offset + limit);

    return NextResponse.json({
      transactions: paginatedTransactions,
      total: filtered.length,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export const GET = withAuthApi(handleGetTransactions as any);

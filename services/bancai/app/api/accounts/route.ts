import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { createMemoryService } from '@/lib/memory-service';
import type { AuthUser } from '@/lib/codai-client';
import type { BankAccount } from '@/types';

async function getAccountsHandler(
  req: AuthenticatedRequest,
  user: AuthUser
): Promise<NextResponse> {
  try {
    const memoryService = createMemoryService(user.id);

    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data and store in memory
    const mockAccounts: BankAccount[] = [
      {
        id: `acc_${user.id}_1`,
        userId: user.id,
        accountNumber: '****1234',
        accountType: 'checking',
        balance: 2500.75,
        currency: 'USD',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `acc_${user.id}_2`,
        userId: user.id,
        accountNumber: '****5678',
        accountType: 'savings',
        balance: 15000.0,
        currency: 'USD',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Store account information in memory for AI insights
    for (const account of mockAccounts) {
      await memoryService.storeAccountInsight(
        account,
        `Account created with balance ${account.balance} ${account.currency}`,
        { action: 'account_fetch' }
      );
    }

    return NextResponse.json({
      success: true,
      data: mockAccounts,
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export const GET = withAuthApi(getAccountsHandler);

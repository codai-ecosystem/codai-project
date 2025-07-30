import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * Individual Account API
 * Handles operations on specific bank accounts
 */

/**
 * GET /api/banking/accounts/[accountId] - Get specific account details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { accountId: string } }
) {
    try {
        await bancaiService.initialize();

        const { accountId } = params;

        if (!accountId) {
            return NextResponse.json({
                success: false,
                error: 'Account ID is required'
            }, { status: 400 });
        }

        const account = await bancaiService.getAccount(accountId);

        if (!account) {
            return NextResponse.json({
                success: false,
                error: 'Account not found'
            }, { status: 404 });
        }

        // Get recent transactions for this account
        const transactions = await bancaiService.getAccountTransactions(accountId, 10);

        return NextResponse.json({
            success: true,
            data: {
                account,
                recentTransactions: transactions
            }
        });

    } catch (error) {
        console.error('Error retrieving account:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve account',
            message: error.message
        }, { status: 500 });
    }
}

/**
 * PATCH /api/banking/accounts/[accountId] - Update account balance
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { accountId: string } }
) {
    try {
        await bancaiService.initialize();

        const { accountId } = params;
        const body = await request.json();
        const { balance } = body;

        if (!accountId) {
            return NextResponse.json({
                success: false,
                error: 'Account ID is required'
            }, { status: 400 });
        }

        if (typeof balance !== 'number') {
            return NextResponse.json({
                success: false,
                error: 'Balance must be a number'
            }, { status: 400 });
        }

        const updatedAccount = await bancaiService.updateAccountBalance(accountId, balance);

        return NextResponse.json({
            success: true,
            data: updatedAccount,
            message: 'Account balance updated successfully'
        });

    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update account',
            message: error.message
        }, { status: 500 });
    }
}

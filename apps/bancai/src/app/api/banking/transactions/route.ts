import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * Banking Transactions API
 * Handles transaction processing, retrieval, and monitoring
 */

/**
 * GET /api/banking/transactions - Get transactions (with optional filters)
 */
export async function GET(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const url = new URL(request.url);
        const { searchParams } = url;
        const accountId = searchParams.get('accountId');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (accountId) {
            // Get transactions for specific account
            const transactions = await bancaiService.getAccountTransactions(accountId, limit);
            return NextResponse.json({
                success: true,
                data: transactions,
                count: transactions.length,
                accountId
            });
        } else {
            // For demo purposes, return guidance message
            return NextResponse.json({
                success: true,
                data: [],
                message: 'Specify accountId parameter to get account transactions'
            });
        }

    } catch (error) {
        console.error('Error retrieving transactions:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve transactions',
            message: error.message
        }, { status: 500 });
    }
}

/**
 * POST /api/banking/transactions - Process new transaction
 */
export async function POST(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const body = await request.json();
        const {
            fromAccountId,
            toAccountId,
            type,
            amount,
            currency = 'USD',
            description,
            reference
        } = body;

        // Validate required fields
        if (!fromAccountId || !type || !amount) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: fromAccountId, type, amount'
            }, { status: 400 });
        }

        // Validate transaction type
        const validTypes = ['deposit', 'withdrawal', 'transfer', 'payment', 'fee'];
        if (!validTypes.includes(type)) {
            return NextResponse.json({
                success: false,
                error: `Invalid transaction type. Must be one of: ${validTypes.join(', ')}`
            }, { status: 400 });
        }

        // Validate amount
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({
                success: false,
                error: 'Amount must be a positive number'
            }, { status: 400 });
        }

        // For transfers, toAccountId is required
        if (type === 'transfer' && !toAccountId) {
            return NextResponse.json({
                success: false,
                error: 'toAccountId is required for transfer transactions'
            }, { status: 400 });
        }

        // Process the transaction
        const transaction = await bancaiService.processTransaction({
            fromAccountId,
            toAccountId,
            type,
            amount,
            currency,
            description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
            reference: reference || `REF-${Date.now()}`,
            status: 'pending',
            riskScore: 0,
            complianceFlags: []
        });

        return NextResponse.json({
            success: true,
            data: transaction,
            message: 'Transaction processed successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error processing transaction:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process transaction',
            message: error.message
        }, { status: 500 });
    }
}

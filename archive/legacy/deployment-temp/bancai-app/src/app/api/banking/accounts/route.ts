import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * Banking Accounts API
 * Handles account creation, retrieval, and management
 */

/**
 * GET /api/banking/accounts - Get accounts (with optional user filter)
 */
export async function GET(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const url = new URL(request.url);
        const { searchParams } = url;
        const userId = searchParams.get('userId');

        if (userId) {
            // Get accounts for specific user
            const accounts = await bancaiService.getAccountsByUser(userId);
            return NextResponse.json({
                success: true,
                data: accounts,
                count: accounts.length
            });
        } else {
            // For demo purposes, return empty array - in production, implement pagination
            return NextResponse.json({
                success: true,
                data: [],
                message: 'Specify userId parameter to get user accounts'
            });
        }

    } catch (error) {
        console.error('Error retrieving accounts:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve accounts',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * POST /api/banking/accounts - Create new bank account
 */
export async function POST(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const body = await request.json();
        const { userId, accountType, currency = 'USD', initialBalance = 0 } = body;

        // Validate required fields
        if (!userId || !accountType) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: userId, accountType'
            }, { status: 400 });
        }

        // Validate account type
        const validAccountTypes = ['checking', 'savings', 'investment', 'business'];
        if (!validAccountTypes.includes(accountType)) {
            return NextResponse.json({
                success: false,
                error: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`
            }, { status: 400 });
        }

        // Create new account
        const newAccount = await bancaiService.createAccount({
            userId,
            accountType,
            balance: initialBalance,
            currency,
            status: 'active'
        });

        return NextResponse.json({
            success: true,
            data: newAccount,
            message: 'Bank account created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating account:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create account',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

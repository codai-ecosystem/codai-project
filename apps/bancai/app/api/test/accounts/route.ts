import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PUBLIC TEST ENDPOINT - BYPASSES AUTHENTICATION
 * This endpoint allows testing database functionality during development
 */

// GET /api/test/accounts - List all accounts (for testing)
export async function GET() {
    try {
        const accounts = await prisma.account.findMany({
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            take: 10 // Limit results
        });

        return NextResponse.json({
            success: true,
            data: {
                accounts,
                count: accounts.length,
                message: 'BancAI database connection successful'
            }
        });
    } catch (error) {
        console.error('BancAI test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            message: 'Database connection failed'
        }, { status: 500 });
    }
}

// POST /api/test/accounts - Create test account (for testing)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email || `test-${Date.now()}@bancai.ro`;

        // Create test customer first
        const customer = await prisma.customer.upsert({
            where: { email },
            update: {},
            create: {
                email,
                firstName: body.firstName || 'Test',
                lastName: body.lastName || 'Customer',
                nationalId: `TEST${Date.now()}`,
                dateOfBirth: new Date('1990-01-01'),
                kycStatus: 'VERIFIED',
                riskLevel: 'LOW'
            }
        });

        // Create account
        const account = await prisma.account.create({
            data: {
                accountNumber: `RO49AAAA1B31007593840000${Date.now().toString().slice(-4)}`,
                accountType: 'CURRENT',
                currency: 'RON',
                balance: parseFloat(body.balance || '1000.00'),
                customerId: customer.id
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                account,
                message: 'Test account created successfully'
            }
        });
    } catch (error) {
        console.error('BancAI account creation error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            message: 'Failed to create test account'
        }, { status: 500 });
    }
}

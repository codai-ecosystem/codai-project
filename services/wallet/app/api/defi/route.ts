import { NextRequest, NextResponse } from 'next/server';

/**
 * DeFi API Endpoints
 * Handles DeFi protocols, yield farming, and liquidity management
 */

// Mock DeFi data
const mockProtocols = [
    {
        id: '1',
        name: 'Aave',
        category: 'lending',
        apy: 4.2,
        tvl: 12500000000,
        risk: 'low',
        chain: 'Ethereum',
        token: 'USDC',
        userPosition: {
            amount: 5000,
            value: 5000,
            earnings: 210
        }
    },
    {
        id: '2',
        name: 'Uniswap V3',
        category: 'dex',
        apy: 12.8,
        tvl: 8200000000,
        risk: 'medium',
        chain: 'Ethereum',
        token: 'ETH/USDC'
    },
    {
        id: '3',
        name: 'Compound',
        category: 'lending',
        apy: 3.8,
        tvl: 3400000000,
        risk: 'low',
        chain: 'Ethereum',
        token: 'DAI'
    }
];

const mockPositions = [
    {
        id: '1',
        protocol: 'Aave',
        strategy: 'USDC Lending',
        amount: 5000,
        token: 'USDC',
        apy: 4.2,
        dailyEarnings: 0.58,
        totalEarnings: 210,
        startDate: new Date('2024-01-01'),
        status: 'active',
        autoCompound: true
    },
    {
        id: '2',
        protocol: 'Yearn Finance',
        strategy: 'yvUSDC Vault',
        amount: 2500,
        token: 'USDC',
        apy: 8.5,
        dailyEarnings: 0.58,
        totalEarnings: 187,
        startDate: new Date('2024-01-15'),
        status: 'active',
        autoCompound: true
    }
];

const mockLiquidityPools = [
    {
        id: '1',
        name: 'ETH/USDC',
        tokens: ['ETH', 'USDC'],
        apy: 12.8,
        fee: 0.3,
        volume24h: 45000000,
        userLiquidity: {
            amount: 1000,
            share: 0.002,
            earnings: 45
        }
    },
    {
        id: '2',
        name: 'DAI/USDC',
        tokens: ['DAI', 'USDC'],
        apy: 2.1,
        fee: 0.05,
        volume24h: 12000000
    }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const protocolId = searchParams.get('protocolId');
    const category = searchParams.get('category');

    try {
        switch (action) {
            case 'protocols':
                let filteredProtocols = mockProtocols;

                if (category) {
                    filteredProtocols = mockProtocols.filter(p => p.category === category);
                }

                return NextResponse.json({
                    success: true,
                    data: filteredProtocols,
                    total: filteredProtocols.length
                });

            case 'protocol':
                if (!protocolId) {
                    return NextResponse.json(
                        { success: false, error: 'Protocol ID required' },
                        { status: 400 }
                    );
                }

                const protocol = mockProtocols.find(p => p.id === protocolId);
                if (!protocol) {
                    return NextResponse.json(
                        { success: false, error: 'Protocol not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    data: protocol
                });

            case 'positions':
                return NextResponse.json({
                    success: true,
                    data: mockPositions,
                    total: mockPositions.length,
                    metrics: {
                        totalValue: mockPositions.reduce((sum, pos) => sum + pos.amount, 0),
                        totalEarnings: mockPositions.reduce((sum, pos) => sum + pos.totalEarnings, 0),
                        dailyEarnings: mockPositions.reduce((sum, pos) => sum + pos.dailyEarnings, 0)
                    }
                });

            case 'liquidity-pools':
                return NextResponse.json({
                    success: true,
                    data: mockLiquidityPools,
                    total: mockLiquidityPools.length
                });

            case 'yield-opportunities':
                // Return top yielding opportunities
                const opportunities = mockProtocols
                    .filter(p => p.apy > 5)
                    .sort((a, b) => b.apy - a.apy)
                    .slice(0, 5);

                return NextResponse.json({
                    success: true,
                    data: opportunities
                });

            case 'portfolio-analytics':
                return NextResponse.json({
                    success: true,
                    data: {
                        totalValue: 7500,
                        totalReturn: 397,
                        totalReturnPercent: 5.3,
                        bestPerformer: {
                            protocol: 'Uniswap V3',
                            return: 12.8
                        },
                        riskScore: 3.2,
                        diversificationScore: 7.5,
                        recommendations: [
                            'Consider diversifying across different chains',
                            'Your lending exposure is high - consider some DEX positions',
                            'Compound your earnings to maximize returns'
                        ]
                    }
                });

            case 'gas-tracker':
                return NextResponse.json({
                    success: true,
                    data: {
                        ethereum: {
                            slow: { gwei: 15, time: '5+ min', usd: 2.1 },
                            standard: { gwei: 20, time: '2-5 min', usd: 2.8 },
                            fast: { gwei: 25, time: '<2 min', usd: 3.5 }
                        },
                        polygon: {
                            slow: { gwei: 30, time: '2+ min', usd: 0.01 },
                            standard: { gwei: 35, time: '1-2 min', usd: 0.015 },
                            fast: { gwei: 40, time: '<1 min', usd: 0.02 }
                        }
                    }
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('DeFi API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'deposit':
                const { protocolId, amount, token } = body;

                if (!protocolId || !amount || !token) {
                    return NextResponse.json(
                        { success: false, error: 'Protocol ID, amount, and token are required' },
                        { status: 400 }
                    );
                }

                const protocol = mockProtocols.find(p => p.id === protocolId);
                if (!protocol) {
                    return NextResponse.json(
                        { success: false, error: 'Protocol not found' },
                        { status: 404 }
                    );
                }

                // Simulate deposit
                const newPosition = {
                    id: String(mockPositions.length + 1),
                    protocol: protocol.name,
                    strategy: `${token} ${protocol.category}`,
                    amount: parseFloat(amount),
                    token,
                    apy: protocol.apy,
                    dailyEarnings: (parseFloat(amount) * protocol.apy / 100) / 365,
                    totalEarnings: 0,
                    startDate: new Date(),
                    status: 'active' as const,
                    autoCompound: true
                };

                mockPositions.push(newPosition);

                return NextResponse.json({
                    success: true,
                    data: newPosition,
                    message: 'Deposit successful'
                });

            case 'withdraw':
                const { positionId, withdrawAmount } = body;

                if (!positionId) {
                    return NextResponse.json(
                        { success: false, error: 'Position ID required' },
                        { status: 400 }
                    );
                }

                const positionIndex = mockPositions.findIndex(p => p.id === positionId);
                if (positionIndex === -1) {
                    return NextResponse.json(
                        { success: false, error: 'Position not found' },
                        { status: 404 }
                    );
                }

                const position = mockPositions[positionIndex];
                const amountToWithdraw = withdrawAmount || position.amount;

                if (amountToWithdraw >= position.amount) {
                    // Full withdrawal - remove position
                    mockPositions.splice(positionIndex, 1);
                } else {
                    // Partial withdrawal - update position
                    position.amount -= amountToWithdraw;
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        withdrawnAmount: amountToWithdraw,
                        remainingPosition: amountToWithdraw >= position.amount ? null : position
                    },
                    message: 'Withdrawal successful'
                });

            case 'add-liquidity':
                const { poolId, token0Amount, token1Amount } = body;

                if (!poolId || !token0Amount || !token1Amount) {
                    return NextResponse.json(
                        { success: false, error: 'Pool ID and token amounts required' },
                        { status: 400 }
                    );
                }

                const pool = mockLiquidityPools.find(p => p.id === poolId);
                if (!pool) {
                    return NextResponse.json(
                        { success: false, error: 'Pool not found' },
                        { status: 404 }
                    );
                }

                // Simulate adding liquidity
                const totalValue = parseFloat(token0Amount) + parseFloat(token1Amount);

                if (!pool.userLiquidity) {
                    pool.userLiquidity = {
                        amount: totalValue,
                        share: 0.001,
                        earnings: 0
                    };
                } else {
                    pool.userLiquidity.amount += totalValue;
                    pool.userLiquidity.share += 0.001;
                }

                return NextResponse.json({
                    success: true,
                    data: pool.userLiquidity,
                    message: 'Liquidity added successfully'
                });

            case 'compound-earnings':
                const { positionId: compoundPositionId } = body;

                if (!compoundPositionId) {
                    return NextResponse.json(
                        { success: false, error: 'Position ID required' },
                        { status: 400 }
                    );
                }

                const compoundPosition = mockPositions.find(p => p.id === compoundPositionId);
                if (!compoundPosition) {
                    return NextResponse.json(
                        { success: false, error: 'Position not found' },
                        { status: 404 }
                    );
                }

                // Simulate compounding
                const earnings = compoundPosition.totalEarnings;
                compoundPosition.amount += earnings;
                compoundPosition.totalEarnings = 0;

                return NextResponse.json({
                    success: true,
                    data: {
                        compoundedAmount: earnings,
                        newTotalAmount: compoundPosition.amount
                    },
                    message: 'Earnings compounded successfully'
                });

            case 'estimate-apy':
                const { strategy, inputAmount } = body;

                // Simulate APY estimation based on strategy and amount
                let estimatedApy = 5.0; // base APY

                if (strategy === 'lending') estimatedApy = 4.2;
                else if (strategy === 'dex') estimatedApy = 12.8;
                else if (strategy === 'yield') estimatedApy = 8.5;
                else if (strategy === 'staking') estimatedApy = 5.2;

                // Adjust for amount (larger amounts might get slightly lower APY)
                if (inputAmount > 10000) estimatedApy *= 0.95;

                return NextResponse.json({
                    success: true,
                    data: {
                        estimatedApy,
                        projectedDaily: (inputAmount * estimatedApy / 100) / 365,
                        projectedMonthly: (inputAmount * estimatedApy / 100) / 12,
                        projectedYearly: inputAmount * estimatedApy / 100
                    }
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('DeFi API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, positionId } = body;

        if (!positionId) {
            return NextResponse.json(
                { success: false, error: 'Position ID required' },
                { status: 400 }
            );
        }

        const position = mockPositions.find(p => p.id === positionId);
        if (!position) {
            return NextResponse.json(
                { success: false, error: 'Position not found' },
                { status: 404 }
            );
        }

        switch (action) {
            case 'toggle-auto-compound':
                position.autoCompound = !position.autoCompound;

                return NextResponse.json({
                    success: true,
                    data: position,
                    message: `Auto-compound ${position.autoCompound ? 'enabled' : 'disabled'}`
                });

            case 'update-position':
                const { newAmount, newApy } = body;

                if (newAmount !== undefined) {
                    position.amount = parseFloat(newAmount);
                }
                if (newApy !== undefined) {
                    position.apy = parseFloat(newApy);
                    position.dailyEarnings = (position.amount * position.apy / 100) / 365;
                }

                return NextResponse.json({
                    success: true,
                    data: position,
                    message: 'Position updated successfully'
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('DeFi API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

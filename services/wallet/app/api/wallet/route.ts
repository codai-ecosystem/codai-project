import { NextRequest, NextResponse } from 'next/server';

/**
 * Wallet API Endpoints
 * Handles wallet management, transactions, and multi-chain operations
 */

// Mock data for demonstration
const mockWallets = [
    {
        id: '1',
        name: 'Main Wallet',
        address: '0x742d35Cc6678F79c532f5E27d1Fc4FA36424B2b4',
        chain: 'Ethereum',
        balance: 2.4521,
        balanceUSD: 6234.52,
        currency: 'ETH',
        isActive: true,
        transactions: 156,
        yield: 4.2
    },
    {
        id: '2',
        name: 'Trading Account',
        address: '0x8ba1f109551bD432803012645Hac136c22C61',
        chain: 'Polygon',
        balance: 1250.75,
        balanceUSD: 1247.32,
        currency: 'USDC',
        isActive: true,
        transactions: 89,
        yield: 8.5
    }
];

const mockTransactions = [
    {
        id: '1',
        type: 'receive',
        amount: 0.5,
        currency: 'ETH',
        amountUSD: 1267.50,
        from: '0x8ba1f109551bD432803012645Hac136c22C61',
        to: '0x742d35Cc6678F79c532f5E27d1Fc4FA36424B2b4',
        timestamp: new Date('2024-01-15T10:30:00'),
        status: 'confirmed',
        gasUsed: 21000,
        hash: '0x1234567890abcdef...',
        chain: 'Ethereum'
    },
    {
        id: '2',
        type: 'send',
        amount: 100,
        currency: 'USDC',
        amountUSD: 100.00,
        from: '0x8ba1f109551bD432803012645Hac136c22C61',
        to: '0x9cd11f109551bD432803012645Hac136c22C78',
        timestamp: new Date('2024-01-15T09:15:00'),
        status: 'pending',
        hash: '0xabcdef1234567890...',
        chain: 'Polygon'
    }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const walletId = searchParams.get('walletId');

    try {
        switch (action) {
            case 'wallets':
                return NextResponse.json({
                    success: true,
                    data: mockWallets,
                    total: mockWallets.length
                });

            case 'wallet':
                if (!walletId) {
                    return NextResponse.json(
                        { success: false, error: 'Wallet ID required' },
                        { status: 400 }
                    );
                }

                const wallet = mockWallets.find(w => w.id === walletId);
                if (!wallet) {
                    return NextResponse.json(
                        { success: false, error: 'Wallet not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    data: wallet
                });

            case 'transactions':
                const filteredTransactions = walletId
                    ? mockTransactions.filter(t =>
                        t.from.includes(walletId) || t.to.includes(walletId)
                    )
                    : mockTransactions;

                return NextResponse.json({
                    success: true,
                    data: filteredTransactions,
                    total: filteredTransactions.length
                });

            case 'balance':
                if (!walletId) {
                    return NextResponse.json(
                        { success: false, error: 'Wallet ID required' },
                        { status: 400 }
                    );
                }

                const balanceWallet = mockWallets.find(w => w.id === walletId);
                if (!balanceWallet) {
                    return NextResponse.json(
                        { success: false, error: 'Wallet not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        balance: balanceWallet.balance,
                        balanceUSD: balanceWallet.balanceUSD,
                        currency: balanceWallet.currency,
                        chain: balanceWallet.chain
                    }
                });

            case 'supported-chains':
                return NextResponse.json({
                    success: true,
                    data: [
                        {
                            id: 'ethereum',
                            name: 'Ethereum',
                            symbol: 'ETH',
                            chainId: 1,
                            rpcUrl: 'https://ethereum.publicnode.com',
                            explorerUrl: 'https://etherscan.io',
                            isTestnet: false
                        },
                        {
                            id: 'polygon',
                            name: 'Polygon',
                            symbol: 'MATIC',
                            chainId: 137,
                            rpcUrl: 'https://polygon.llamarpc.com',
                            explorerUrl: 'https://polygonscan.com',
                            isTestnet: false
                        },
                        {
                            id: 'bsc',
                            name: 'Binance Smart Chain',
                            symbol: 'BNB',
                            chainId: 56,
                            rpcUrl: 'https://bsc.publicnode.com',
                            explorerUrl: 'https://bscscan.com',
                            isTestnet: false
                        },
                        {
                            id: 'arbitrum',
                            name: 'Arbitrum One',
                            symbol: 'ETH',
                            chainId: 42161,
                            rpcUrl: 'https://arbitrum.llamarpc.com',
                            explorerUrl: 'https://arbiscan.io',
                            isTestnet: false
                        }
                    ]
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Wallet API error:', error);
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
            case 'create-wallet':
                const { name, chain } = body;

                if (!name || !chain) {
                    return NextResponse.json(
                        { success: false, error: 'Name and chain are required' },
                        { status: 400 }
                    );
                }

                // Simulate wallet creation
                const newWallet = {
                    id: String(mockWallets.length + 1),
                    name,
                    address: `0x${Math.random().toString(16).substr(2, 40)}`,
                    chain,
                    balance: 0,
                    balanceUSD: 0,
                    currency: chain === 'Ethereum' ? 'ETH' : 'MATIC',
                    isActive: true,
                    transactions: 0,
                    yield: 0
                };

                mockWallets.push(newWallet);

                return NextResponse.json({
                    success: true,
                    data: newWallet,
                    message: 'Wallet created successfully'
                });

            case 'send-transaction':
                const { from, to, amount, currency, chain: txChain } = body;

                if (!from || !to || !amount || !currency) {
                    return NextResponse.json(
                        { success: false, error: 'Missing required transaction parameters' },
                        { status: 400 }
                    );
                }

                // Simulate transaction creation
                const newTransaction = {
                    id: String(mockTransactions.length + 1),
                    type: 'send' as const,
                    amount: parseFloat(amount),
                    currency,
                    amountUSD: parseFloat(amount) * (currency === 'ETH' ? 2535 : 1),
                    from,
                    to,
                    timestamp: new Date(),
                    status: 'pending' as const,
                    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
                    chain: txChain || 'Ethereum'
                };

                mockTransactions.push(newTransaction);

                // Simulate transaction confirmation after delay
                setTimeout(() => {
                    newTransaction.status = 'confirmed';
                }, 30000); // 30 seconds

                return NextResponse.json({
                    success: true,
                    data: newTransaction,
                    message: 'Transaction submitted successfully'
                });

            case 'estimate-gas':
                const { fromAddr, toAddr, value, data } = body;

                // Simulate gas estimation
                const gasEstimate = {
                    gasLimit: 21000,
                    gasPrice: '20000000000', // 20 Gwei
                    estimatedFee: 0.00042, // ETH
                    estimatedFeeUSD: 1.07
                };

                return NextResponse.json({
                    success: true,
                    data: gasEstimate
                });

            case 'import-wallet':
                const { privateKey, mnemonic, address } = body;

                if (!privateKey && !mnemonic && !address) {
                    return NextResponse.json(
                        { success: false, error: 'Private key, mnemonic, or address required' },
                        { status: 400 }
                    );
                }

                // Simulate wallet import
                const importedWallet = {
                    id: String(mockWallets.length + 1),
                    name: 'Imported Wallet',
                    address: address || `0x${Math.random().toString(16).substr(2, 40)}`,
                    chain: 'Ethereum',
                    balance: Math.random() * 10,
                    balanceUSD: Math.random() * 25000,
                    currency: 'ETH',
                    isActive: true,
                    transactions: Math.floor(Math.random() * 100),
                    yield: 0
                };

                mockWallets.push(importedWallet);

                return NextResponse.json({
                    success: true,
                    data: importedWallet,
                    message: 'Wallet imported successfully'
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Wallet API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, walletId } = body;

        if (!walletId) {
            return NextResponse.json(
                { success: false, error: 'Wallet ID required' },
                { status: 400 }
            );
        }

        const walletIndex = mockWallets.findIndex(w => w.id === walletId);
        if (walletIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Wallet not found' },
                { status: 404 }
            );
        }

        switch (action) {
            case 'update-wallet':
                const { name, isActive } = body;

                if (name !== undefined) {
                    mockWallets[walletIndex].name = name;
                }
                if (isActive !== undefined) {
                    mockWallets[walletIndex].isActive = isActive;
                }

                return NextResponse.json({
                    success: true,
                    data: mockWallets[walletIndex],
                    message: 'Wallet updated successfully'
                });

            case 'refresh-balance':
                // Simulate balance refresh
                mockWallets[walletIndex].balance = Math.random() * 10;
                mockWallets[walletIndex].balanceUSD = mockWallets[walletIndex].balance * 2535;

                return NextResponse.json({
                    success: true,
                    data: {
                        balance: mockWallets[walletIndex].balance,
                        balanceUSD: mockWallets[walletIndex].balanceUSD
                    },
                    message: 'Balance refreshed successfully'
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Wallet API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletId = searchParams.get('walletId');

        if (!walletId) {
            return NextResponse.json(
                { success: false, error: 'Wallet ID required' },
                { status: 400 }
            );
        }

        const walletIndex = mockWallets.findIndex(w => w.id === walletId);
        if (walletIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'Wallet not found' },
                { status: 404 }
            );
        }

        const deletedWallet = mockWallets.splice(walletIndex, 1)[0];

        return NextResponse.json({
            success: true,
            data: deletedWallet,
            message: 'Wallet deleted successfully'
        });
    } catch (error) {
        console.error('Wallet API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

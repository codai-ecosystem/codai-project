/**
 * Wallet Management Component
 * Advanced multi-chain wallet functionality with programmable transactions
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
    Wallet,
    Send,
    Receive,
    History,
    Shield,
    Zap,
    Settings,
    PlusCircle,
    ExternalLink,
    Copy,
    Eye,
    EyeOff,
    RefreshCw,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

interface WalletAccount {
    id: string;
    name: string;
    address: string;
    chain: string;
    balance: number;
    balanceUSD: number;
    currency: string;
    isActive: boolean;
    transactions: number;
    yield: number;
}

interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'swap' | 'stake' | 'defi';
    amount: number;
    currency: string;
    amountUSD: number;
    from: string;
    to: string;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
    gasUsed?: number;
    hash: string;
    chain: string;
}

export default function WalletManagement() {
    const [wallets, setWallets] = useState<WalletAccount[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<string>('');
    const [showBalances, setShowBalances] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize with mock data
        setWallets([
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
            },
            {
                id: '3',
                name: 'DeFi Vault',
                address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                chain: 'Bitcoin',
                balance: 0.0875,
                balanceUSD: 3892.15,
                currency: 'BTC',
                isActive: false,
                transactions: 23,
                yield: 0.0
            }
        ]);

        setTransactions([
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
        ]);

        setSelectedWallet('1');
    }, []);

    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);
    const totalYield = wallets.reduce((sum, wallet) => sum + (wallet.balanceUSD * wallet.yield / 100), 0);

    const handleCreateWallet = () => {
        setIsLoading(true);
        // Simulate wallet creation
        setTimeout(() => {
            const newWallet: WalletAccount = {
                id: String(wallets.length + 1),
                name: `Wallet ${wallets.length + 1}`,
                address: `0x${Math.random().toString(16).substr(2, 40)}`,
                chain: 'Ethereum',
                balance: 0,
                balanceUSD: 0,
                currency: 'ETH',
                isActive: true,
                transactions: 0,
                yield: 0
            };
            setWallets([...wallets, newWallet]);
            setIsLoading(false);
        }, 2000);
    };

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        // Could add toast notification here
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Balance</p>
                                <p className="text-2xl font-bold">
                                    {showBalances ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowBalances(!showBalances)}
                            >
                                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Yield</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {showBalances ? `$${totalYield.toFixed(2)}` : '••••••'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Wallet className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Active Wallets</p>
                                <p className="text-2xl font-bold">{wallets.filter(w => w.isActive).length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <History className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold">{wallets.reduce((sum, w) => sum + w.transactions, 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Wallet Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Wallet List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Wallets</CardTitle>
                                <CardDescription>Manage your multi-chain wallet accounts</CardDescription>
                            </div>
                            <Button onClick={handleCreateWallet} disabled={isLoading}>
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                )}
                                Create Wallet
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedWallet === wallet.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedWallet(wallet.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium">{wallet.name}</h4>
                                        <Badge variant={wallet.isActive ? "default" : "secondary"}>
                                            {wallet.chain}
                                        </Badge>
                                        {wallet.yield > 0 && (
                                            <Badge className="bg-green-100 text-green-800">
                                                {wallet.yield}% APY
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyAddress(wallet.address);
                                            }}
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-2">
                                    {formatAddress(wallet.address)}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            {showBalances ? `${wallet.balance} ${wallet.currency}` : '•••••'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {showBalances ? `$${wallet.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '•••••'}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="text-gray-600">{wallet.transactions} txns</p>
                                        {wallet.yield > 0 && (
                                            <p className="text-green-600">+${(wallet.balanceUSD * wallet.yield / 100).toFixed(2)}/year</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest wallet activity across all chains</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-green-100' :
                                            tx.type === 'send' ? 'bg-red-100' :
                                                'bg-blue-100'
                                        }`}>
                                        {tx.type === 'receive' ? (
                                            <Receive className="w-4 h-4 text-green-600" />
                                        ) : tx.type === 'send' ? (
                                            <Send className="w-4 h-4 text-red-600" />
                                        ) : (
                                            <Zap className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-medium capitalize">{tx.type}</p>
                                            <Badge
                                                variant={tx.status === 'confirmed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                                            >
                                                {tx.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {tx.chain} • {tx.timestamp.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={`font-medium ${tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                        {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.currency}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        ${tx.amountUSD.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common wallet operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="flex flex-col items-center space-y-2 h-auto py-4">
                            <Send className="w-6 h-6" />
                            <span>Send</span>
                        </Button>

                        <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                            <Receive className="w-6 h-6" />
                            <span>Receive</span>
                        </Button>

                        <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                            <Zap className="w-6 h-6" />
                            <span>Swap</span>
                        </Button>

                        <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                            <Shield className="w-6 h-6" />
                            <span>Stake</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Security Status</span>
                    </CardTitle>
                    <CardDescription>Wallet security and protection status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="font-medium">Multi-Signature</p>
                                <p className="text-sm text-gray-600">2/3 signatures required</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                                <p className="font-medium">Hardware Wallet</p>
                                <p className="text-sm text-gray-600">Connected & verified</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div>
                                <p className="font-medium">Backup Status</p>
                                <p className="text-sm text-gray-600">Last backup: 2 days ago</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Security Score</span>
                            <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="mt-2" />
                        <p className="text-xs text-gray-600 mt-1">
                            Recommendation: Enable transaction monitoring alerts
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

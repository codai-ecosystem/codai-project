'use client'

import { useState, useEffect } from 'react'
// Import types directly since agent-runtime may not be available in frontend
interface EarningsData {
	totalEarnings: number;
	platformFees: number;
	netEarnings: number;
	pendingPayouts: number;
	lastPayout: Date | null;
	transactionCount: number;
	period: 'week' | 'month' | 'year' | 'all';
}

interface TransactionData {
	id: string;
	amount: number;
	platformFee: number;
	netAmount: number;
	status: 'pending' | 'completed' | 'failed';
	createdAt: Date;
	description: string;
	metadata?: Record<string, any>;
}

interface PayoutData {
	id: string;
	amount: number;
	status: 'pending' | 'in_transit' | 'paid' | 'failed';
	arrivalDate: Date;
	method: string;
	currency: string;
}
import { useAuth } from '../../lib/auth-context'
import { useNotifications } from '../ui/Notifications'
import {
	CurrencyDollarIcon,
	ArrowTrendingUpIcon,
	ClockIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

/**
 * Earnings and Payouts View Component
 * Displays user earnings, transaction history, and payout management
 */
export function EarningsView() {
	const { user } = useAuth()
	const { addNotification } = useNotifications()
	const [earnings, setEarnings] = useState<EarningsData | null>(null)
	const [transactions, setTransactions] = useState<TransactionData[]>([])
	const [payouts, setPayouts] = useState<PayoutData[]>([])
	const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
	const [refreshing, setRefreshing] = useState(false)

	useEffect(() => {
		if (user?.uid) {
			loadEarningsData()
		}
	}, [user, selectedPeriod])

	const loadEarningsData = async () => {
		try {
			setLoading(true)
			setError(null)

			// Get user's Stripe account ID and earnings data from backend API
			const response = await fetch(`/api/users/${user?.uid}/stripe-connect`)
			if (response.ok) {
				const data = await response.json()
				setStripeAccountId(data.accountId)

				if (data.accountId) {
					// Load earnings data via API
					const earningsResponse = await fetch(`/api/payments/earnings/${data.accountId}?period=${selectedPeriod}`)
					if (earningsResponse.ok) {
						const earningsData = await earningsResponse.json()
						setEarnings(earningsData)
					}

					// Load recent transactions via API
					const transactionsResponse = await fetch(`/api/payments/transactions/${data.accountId}?limit=20`)
					if (transactionsResponse.ok) {
						const transactionData = await transactionsResponse.json()
						setTransactions(transactionData)
					}

					// Load payouts via API
					const payoutsResponse = await fetch(`/api/payments/payouts/${data.accountId}?limit=10`)
					if (payoutsResponse.ok) {
						const payoutData = await payoutsResponse.json()
						setPayouts(payoutData)
					}
				}
			}
		} catch (err) {
			console.error('Failed to load earnings data:', err)
			setError(err instanceof Error ? err.message : 'Failed to load earnings data')
			addNotification({
				type: 'error',
				title: 'Error',
				message: 'Failed to load earnings data'
			})
		} finally {
			setLoading(false)
		}
	}

	const requestPayout = async () => {
		if (!stripeAccountId) return

		try {
			const response = await fetch(`/api/payments/payouts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					accountId: stripeAccountId,
					amount: earnings?.netEarnings || 0
				})
			})

			if (response.ok) {
				addNotification({
					type: 'success',
					title: 'Success',
					message: 'Payout requested successfully'
				})
				loadEarningsData() // Refresh data
			} else {
				throw new Error('Failed to request payout')
			}
		} catch (err) {
			console.error('Failed to request payout:', err)
			addNotification({
				type: 'error',
				title: 'Error',
				message: 'Failed to request payout'
			})
		}
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount / 100) // Convert from cents
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date)
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
			case 'paid':
				return <CheckCircleIcon className="h-5 w-5 text-green-500" />
			case 'pending':
			case 'in_transit':
				return <ClockIcon className="h-5 w-5 text-yellow-500" />
			case 'failed':
				return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
			default:
				return <ClockIcon className="h-5 w-5 text-gray-500" />
		}
	}

	if (loading) {
		return (
			<div className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-gray-200 rounded w-1/4"></div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[1, 2, 3].map(i => (
							<div key={i} className="h-24 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="flex">
						<ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Error Loading Earnings</h3>
							<p className="mt-1 text-sm text-red-700">{error}</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!stripeAccountId) {
		return (
			<div className="p-6">
				<div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
					<div className="flex">
						<ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
						<div className="ml-3">
							<h3 className="text-sm font-medium text-yellow-800">Stripe Connect Setup Required</h3>
							<p className="mt-1 text-sm text-yellow-700">
								You need to set up a Stripe Connect account to view earnings and receive payouts.
							</p>
							<button className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900">
								Set up Stripe Connect →
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">Earnings & Payouts</h1>
					<p className="text-sm text-gray-600">Track your AIDE platform earnings and manage payouts</p>
				</div>
				<div className="flex space-x-3">
					<select
						value={selectedPeriod}
						onChange={(e) => setSelectedPeriod(e.target.value as any)}
						className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					>
						<option value="week">Last Week</option>
						<option value="month">Last Month</option>
						<option value="year">Last Year</option>
						<option value="all">All Time</option>
					</select>
					<button
						onClick={loadEarningsData}
						className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
					>
						Refresh
					</button>
				</div>
			</div>

			{/* Earnings Overview */}
			{earnings && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-white p-6 rounded-lg shadow border">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<CurrencyDollarIcon className="h-8 w-8 text-green-600" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-500">Total Earnings</p>
								<p className="text-2xl font-semibold text-gray-900">
									{formatCurrency(earnings.totalEarnings)}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-lg shadow border">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-500">Net Earnings</p>
								<p className="text-2xl font-semibold text-gray-900">
									{formatCurrency(earnings.netEarnings)}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-lg shadow border">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<ClockIcon className="h-8 w-8 text-yellow-600" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-500">Pending Payouts</p>
								<p className="text-2xl font-semibold text-gray-900">
									{formatCurrency(earnings.pendingPayouts)}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-lg shadow border">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<CheckCircleIcon className="h-8 w-8 text-indigo-600" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-500">Transactions</p>
								<p className="text-2xl font-semibold text-gray-900">
									{earnings.transactionCount}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Payout Actions */}
			{earnings && earnings.netEarnings > 0 && (
				<div className="bg-white p-6 rounded-lg shadow border">
					<div className="flex justify-between items-center">
						<div>
							<h3 className="text-lg font-medium text-gray-900">Available for Payout</h3>
							<p className="text-sm text-gray-600">
								{formatCurrency(earnings.netEarnings)} available to transfer to your bank account
							</p>
						</div>
						<button
							onClick={requestPayout}
							className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							Request Payout
						</button>
					</div>
				</div>
			)}

			{/* Recent Transactions */}
			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
				</div>
				<div className="divide-y divide-gray-200">
					{transactions.length > 0 ? (
						transactions.map((transaction) => (
							<div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
								<div className="flex items-center space-x-3">
									{getStatusIcon(transaction.status)}
									<div>
										<p className="text-sm font-medium text-gray-900">{transaction.description}</p>
										<p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900">
										{formatCurrency(transaction.netAmount)}
									</p>
									<p className="text-xs text-gray-500">
										Platform fee: {formatCurrency(transaction.platformFee)}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="px-6 py-8 text-center">
							<p className="text-sm text-gray-500">No transactions yet</p>
						</div>
					)}
				</div>
			</div>

			{/* Recent Payouts */}
			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">Recent Payouts</h3>
				</div>
				<div className="divide-y divide-gray-200">
					{payouts.length > 0 ? (
						payouts.map((payout) => (
							<div key={payout.id} className="px-6 py-4 flex items-center justify-between">
								<div className="flex items-center space-x-3">
									{getStatusIcon(payout.status)}
									<div>
										<p className="text-sm font-medium text-gray-900">
											Payout to {payout.method}
										</p>
										<p className="text-sm text-gray-500">
											Expected: {formatDate(payout.arrivalDate)}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900">
										{formatCurrency(payout.amount)}
									</p>
									<p className="text-xs text-gray-500 capitalize">
										{payout.status.replace('_', ' ')}
									</p>
								</div>
							</div>
						))
					) : (
						<div className="px-6 py-8 text-center">
							<p className="text-sm text-gray-500">No payouts yet</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

import Stripe from 'stripe';
import { CentralizedAPIClient } from '../config/CentralizedAPIClient.js';

/**
 * Stripe Connect Integration
 * Implements user earnings and payout system per milestone1.prompt.md
 */
export interface EarningsData {
	totalEarnings: number;
	platformFees: number;
	netEarnings: number;
	pendingPayouts: number;
	lastPayout: Date | null;
	transactionCount: number;
	period: 'week' | 'month' | 'year' | 'all';
}

export interface TransactionData {
	id: string;
	amount: number;
	platformFee: number;
	netAmount: number;
	status: 'pending' | 'completed' | 'failed';
	createdAt: Date;
	description: string;
	metadata?: Record<string, any>;
}

export interface PayoutData {
	id: string;
	amount: number;
	status: 'pending' | 'in_transit' | 'paid' | 'failed';
	arrivalDate: Date;
	method: string;
	currency: string;
}

export class StripeConnectService {
	private static instance: StripeConnectService;
	private stripe: Stripe;
	private apiClient: CentralizedAPIClient;

	private constructor() {
		this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
			apiVersion: '2023-08-16',
		});
		this.apiClient = CentralizedAPIClient.getInstance();
	}

	public static getInstance(): StripeConnectService {
		if (!StripeConnectService.instance) {
			StripeConnectService.instance = new StripeConnectService();
		}
		return StripeConnectService.instance;
	}

	/**
	 * Create Stripe Connect account for user
	 */
	public async createConnectAccount(userId: string, email: string, businessInfo?: any): Promise<string> {
		try {
			const account = await this.stripe.accounts.create({
				type: 'express',
				email,
				capabilities: {
					card_payments: { requested: true },
					transfers: { requested: true },
				},
				business_type: businessInfo?.type || 'individual',
				metadata: {
					userId,
					createdBy: 'aide-platform'
				}
			});

			// Store account ID in user profile via backend
			await this.apiClient.post('/api/users/stripe-connect', {
				userId,
				accountId: account.id,
				email
			});

			return account.id;
		} catch (error) {
			console.error('Failed to create Stripe Connect account:', error);
			throw new Error('Failed to create payment account');
		}
	}

	/**
	 * Create account link for onboarding
	 */
	public async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
		try {
			const accountLink = await this.stripe.accountLinks.create({
				account: accountId,
				refresh_url: refreshUrl,
				return_url: returnUrl,
				type: 'account_onboarding',
			});

			return accountLink.url;
		} catch (error) {
			console.error('Failed to create account link:', error);
			throw new Error('Failed to create onboarding link');
		}
	}

	/**
	 * Process payment with platform fee
	 */
	public async processPayment(
		amount: number, // in cents
		currency: string,
		accountId: string,
		platformFeePercent: number = 10, // Default 10% platform fee
		metadata?: Record<string, any>
	): Promise<string> {
		try {
			const platformFee = Math.round(amount * (platformFeePercent / 100));

			const paymentIntent = await this.stripe.paymentIntents.create({
				amount,
				currency,
				application_fee_amount: platformFee,
				transfer_data: {
					destination: accountId,
				},
				metadata: {
					...metadata,
					platformFee: platformFee.toString(),
					platformFeePercent: platformFeePercent.toString()
				}
			});

			return paymentIntent.id;
		} catch (error) {
			console.error('Failed to process payment:', error);
			throw new Error('Payment processing failed');
		}
	}

	/**
	 * Get earnings data for user
	 */
	public async getUserEarnings(accountId: string, period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<EarningsData> {
		try {
			// Calculate date range based on period
			const now = new Date();
			let startDate: Date;

			switch (period) {
				case 'week':
					startDate = new Date(now.setDate(now.getDate() - 7));
					break;
				case 'month':
					startDate = new Date(now.setMonth(now.getMonth() - 1));
					break;
				case 'year':
					startDate = new Date(now.setFullYear(now.getFullYear() - 1));
					break;
				default:
					startDate = new Date(0); // Beginning of time
			}
			// Get transfers (earnings)
			const transfers = await this.stripe.transfers.list({
				destination: accountId,
				...(period !== 'all' ? { created: { gte: Math.floor(startDate.getTime() / 1000) } } : {}),
				limit: 100
			});

			// Get charges to calculate platform fees
			const charges = await this.stripe.charges.list({
				transfer_group: accountId,
				...(period !== 'all' ? { created: { gte: Math.floor(startDate.getTime() / 1000) } } : {}),
				limit: 100
			});// Calculate totals
			const totalEarnings = transfers.data.reduce((sum: number, transfer: any) => sum + transfer.amount, 0);
			const platformFees = charges.data.reduce((sum: number, charge: any) => {
				const fee = charge.metadata?.platformFee ? parseInt(charge.metadata.platformFee) : 0;
				return sum + fee;
			}, 0);
			const netEarnings = totalEarnings - platformFees;

			// Get pending payouts
			const balance = await this.stripe.balance.retrieve({
				stripeAccount: accountId
			});
			const pendingPayouts = balance.pending.reduce((sum: number, pending: any) => sum + pending.amount, 0);
			// Get last payout
			const payouts = await this.stripe.payouts.list(
				{ limit: 1 },
				{ stripeAccount: accountId }
			);
			const lastPayout = payouts.data.length > 0 ? new Date(payouts.data[0].created * 1000) : null;

			return {
				totalEarnings,
				platformFees,
				netEarnings,
				pendingPayouts,
				lastPayout,
				transactionCount: transfers.data.length,
				period
			};
		} catch (error) {
			console.error('Failed to get user earnings:', error);
			throw new Error('Failed to retrieve earnings data');
		}
	}

	/**
	 * Get transaction history
	 */
	public async getTransactionHistory(accountId: string, limit: number = 50): Promise<TransactionData[]> {
		try {
			const transfers = await this.stripe.transfers.list({
				destination: accountId,
				limit
			});

			return transfers.data.map((transfer: any) => ({
				id: transfer.id,
				amount: transfer.amount,
				platformFee: transfer.metadata?.platformFee ? parseInt(transfer.metadata.platformFee) : 0,
				netAmount: transfer.amount,
				status: transfer.reversed ? 'failed' : 'completed',
				createdAt: new Date(transfer.created * 1000),
				description: transfer.description || 'Payment received',
				metadata: transfer.metadata
			}));
		} catch (error) {
			console.error('Failed to get transaction history:', error);
			throw new Error('Failed to retrieve transaction history');
		}
	}

	/**
	 * Get payout history
	 */
	public async getPayoutHistory(accountId: string, limit: number = 20): Promise<PayoutData[]> {
		try {
			const payouts = await this.stripe.payouts.list(
				{ limit },
				{ stripeAccount: accountId }
			);

			return payouts.data.map((payout: any) => ({
				id: payout.id,
				amount: payout.amount,
				status: payout.status as any,
				arrivalDate: new Date(payout.arrival_date * 1000),
				method: payout.method,
				currency: payout.currency
			}));
		} catch (error) {
			console.error('Failed to get payout history:', error);
			throw new Error('Failed to retrieve payout history');
		}
	}

	/**
	 * Create manual payout
	 */
	public async createPayout(accountId: string, amount: number, currency: string = 'usd'): Promise<string> {
		try {
			const payout = await this.stripe.payouts.create({
				amount,
				currency
			}, {
				stripeAccount: accountId
			});

			return payout.id;
		} catch (error) {
			console.error('Failed to create payout:', error);
			throw new Error('Payout creation failed');
		}
	}

	/**
	 * Get account status and requirements
	 */
	public async getAccountStatus(accountId: string): Promise<any> {
		try {
			const account = await this.stripe.accounts.retrieve(accountId);

			return {
				id: account.id,
				chargesEnabled: account.charges_enabled,
				payoutsEnabled: account.payouts_enabled,
				requirements: account.requirements,
				currentlyDue: account.requirements?.currently_due || [],
				pendingVerification: account.requirements?.pending_verification || []
			};
		} catch (error) {
			console.error('Failed to get account status:', error);
			throw new Error('Failed to retrieve account status');
		}
	}

	/**
	 * Create login link for Connect dashboard
	 */
	public async createLoginLink(accountId: string): Promise<string> {
		try {
			const loginLink = await this.stripe.accounts.createLoginLink(accountId);
			return loginLink.url;
		} catch (error) {
			console.error('Failed to create login link:', error);
			throw new Error('Failed to create dashboard login link');
		}
	}
}

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe (using test keys)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
    apiVersion: '2025-06-30.basil'
})

interface PaymentIntent {
    id: string
    amount: number
    currency: string
    status: string
    clientSecret?: string
    description?: string
    metadata?: Record<string, string>
}

interface PaymentMethod {
    id: string
    type: 'card' | 'bank_transfer' | 'digital_wallet'
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
    isDefault: boolean
    nickname?: string
}

// Mock payment methods for demo
function getMockPaymentMethods(): PaymentMethod[] {
    return [
        {
            id: 'pm_1',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            expiryMonth: 12,
            expiryYear: 2027,
            isDefault: true,
            nickname: 'Personal Visa'
        },
        {
            id: 'pm_2',
            type: 'card',
            last4: '0005',
            brand: 'mastercard',
            expiryMonth: 8,
            expiryYear: 2026,
            isDefault: false,
            nickname: 'Business Card'
        },
        {
            id: 'pm_3',
            type: 'bank_transfer',
            isDefault: false,
            nickname: 'BRD Bank Account'
        }
    ]
}

// Generate mock payment history
function generatePaymentHistory() {
    const merchants = [
        'Netflix România', 'Spotify', 'Adobe Creative Cloud', 'Amazon Prime',
        'Disney+ România', 'HBO Max', 'Microsoft Office', 'Steam',
        'PlayStation Store', 'Google Workspace', 'Zoom Pro', 'Canva Pro'
    ]

    const payments: any[] = []
    const now = new Date()

    for (let i = 0; i < 15; i++) {
        const paymentDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Last 90 days
        const amount = Math.round((Math.random() * 200 + 10) * 100) / 100 // 10-210 RON

        payments.push({
            id: `pi_${Date.now()}_${i}`,
            amount,
            currency: 'ron',
            status: Math.random() > 0.05 ? 'succeeded' : 'failed', // 95% success rate
            description: `Payment to ${merchants[Math.floor(Math.random() * merchants.length)]}`,
            created: Math.floor(paymentDate.getTime() / 1000),
            paymentMethod: getMockPaymentMethods()[Math.floor(Math.random() * 3)],
            metadata: {
                merchant: merchants[Math.floor(Math.random() * merchants.length)],
                category: 'subscription'
            }
        })
    }

    return payments.sort((a, b) => b.created - a.created)
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'overview'

        switch (action) {
            case 'payment-methods':
                return NextResponse.json({
                    paymentMethods: getMockPaymentMethods(),
                    total: getMockPaymentMethods().length
                })

            case 'payment-history':
                const limit = parseInt(searchParams.get('limit') || '10')
                const offset = parseInt(searchParams.get('offset') || '0')
                const history = generatePaymentHistory()

                return NextResponse.json({
                    payments: history.slice(offset, offset + limit),
                    total: history.length,
                    hasMore: offset + limit < history.length,
                    summary: {
                        totalAmount: history.reduce((sum, p) => sum + p.amount, 0),
                        successfulPayments: history.filter(p => p.status === 'succeeded').length,
                        failedPayments: history.filter(p => p.status === 'failed').length
                    }
                })

            case 'analytics':
                const allPayments = generatePaymentHistory()
                const successful = allPayments.filter(p => p.status === 'succeeded')
                const thisMonth = new Date()
                thisMonth.setDate(1)
                thisMonth.setHours(0, 0, 0, 0)

                const monthlyPayments = successful.filter(p => p.created * 1000 >= thisMonth.getTime())
                const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

                return NextResponse.json({
                    analytics: {
                        totalPayments: successful.length,
                        totalAmount: successful.reduce((sum, p) => sum + p.amount, 0),
                        averagePayment: successful.length > 0
                            ? Math.round((successful.reduce((sum, p) => sum + p.amount, 0) / successful.length) * 100) / 100
                            : 0,
                        successRate: Math.round((successful.length / allPayments.length) * 100 * 100) / 100,
                        monthlyPayments: monthlyPayments.length,
                        monthlyTotal: Math.round(monthlyTotal * 100) / 100,
                        topMerchants: [
                            { name: 'Netflix România', amount: 29.99, count: 3 },
                            { name: 'Spotify', amount: 19.99, count: 2 },
                            { name: 'Adobe Creative Cloud', amount: 89.99, count: 1 }
                        ],
                        paymentMethodUsage: {
                            card: Math.round(Math.random() * 40 + 60), // 60-100%
                            bank_transfer: Math.round(Math.random() * 20 + 10), // 10-30%
                            digital_wallet: Math.round(Math.random() * 15 + 5) // 5-20%
                        }
                    }
                })

            case 'overview':
            default:
                const recentPayments = generatePaymentHistory().slice(0, 5)
                const paymentMethods = getMockPaymentMethods()

                return NextResponse.json({
                    recentPayments,
                    paymentMethods,
                    quickStats: {
                        paymentsThisMonth: Math.floor(Math.random() * 15 + 5), // 5-20 payments
                        totalSpent: Math.round((Math.random() * 1000 + 500) * 100) / 100, // 500-1500 RON
                        averageTransaction: Math.round((Math.random() * 50 + 30) * 100) / 100, // 30-80 RON
                        savedMethods: paymentMethods.length
                    },
                    alerts: [
                        {
                            type: 'info',
                            message: 'Your card ending in 4242 expires in 3 months',
                            action: 'Update card'
                        },
                        {
                            type: 'success',
                            message: 'All payments processed successfully this month',
                            action: null
                        }
                    ]
                })
        }
    } catch (error) {
        console.error('Error fetching payment data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payment data' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, data } = body

        switch (action) {
            case 'create-payment-intent':
                const { amount, currency = 'ron', description, metadata } = data

                // Validate amount
                if (!amount || amount <= 0) {
                    return NextResponse.json(
                        { error: 'Invalid amount' },
                        { status: 400 }
                    )
                }

                // In a real implementation, you would create a Stripe PaymentIntent
                // For demo purposes, we'll simulate this
                const paymentIntent: PaymentIntent = {
                    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: currency.toLowerCase(),
                    status: 'requires_payment_method',
                    clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
                    description,
                    metadata
                }

                return NextResponse.json({
                    success: true,
                    paymentIntent,
                    message: 'Payment intent created successfully'
                })

            case 'confirm-payment':
                const { paymentIntentId, paymentMethodId: confirmPaymentMethodId } = data

                // Simulate payment processing
                await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000)) // 1-4 seconds

                // 95% success rate simulation
                const isSuccessful = Math.random() > 0.05

                if (isSuccessful) {
                    return NextResponse.json({
                        success: true,
                        paymentIntent: {
                            id: paymentIntentId,
                            status: 'succeeded',
                            amount: data.amount,
                            currency: 'ron'
                        },
                        message: 'Payment processed successfully',
                        receipt: {
                            receiptNumber: `REC${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            paymentMethod: confirmPaymentMethodId
                        }
                    })
                } else {
                    return NextResponse.json({
                        success: false,
                        error: 'Payment failed',
                        paymentIntent: {
                            id: paymentIntentId,
                            status: 'requires_payment_method',
                            lastPaymentError: {
                                type: 'card_error',
                                code: 'card_declined',
                                message: 'Your card was declined.'
                            }
                        }
                    }, { status: 402 })
                }

            case 'add-payment-method':
                const { type, cardData, bankData, nickname } = data

                // Validate payment method data
                if (type === 'card' && (!cardData?.number || !cardData?.expiryMonth || !cardData?.expiryYear)) {
                    return NextResponse.json(
                        { error: 'Invalid card data' },
                        { status: 400 }
                    )
                }

                // Simulate adding payment method
                const newPaymentMethod: PaymentMethod = {
                    id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type,
                    ...(type === 'card' && {
                        last4: cardData.number.slice(-4),
                        brand: cardData.number.startsWith('4') ? 'visa' : 'mastercard',
                        expiryMonth: cardData.expiryMonth,
                        expiryYear: cardData.expiryYear
                    }),
                    isDefault: false,
                    nickname
                }

                return NextResponse.json({
                    success: true,
                    paymentMethod: newPaymentMethod,
                    message: 'Payment method added successfully'
                })

            case 'set-default-payment-method':
                const { paymentMethodId: defaultPaymentMethodId } = data

                return NextResponse.json({
                    success: true,
                    message: `Payment method ${defaultPaymentMethodId} set as default`,
                    paymentMethodId: defaultPaymentMethodId
                })

            case 'remove-payment-method':
                const { paymentMethodId: removeId } = data

                return NextResponse.json({
                    success: true,
                    message: `Payment method ${removeId} removed successfully`
                })

            case 'refund-payment':
                const { paymentId, amount: refundAmount, reason } = data

                // Simulate refund processing
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

                const refundId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

                return NextResponse.json({
                    success: true,
                    refund: {
                        id: refundId,
                        paymentIntent: paymentId,
                        amount: refundAmount,
                        currency: 'ron',
                        status: 'succeeded',
                        reason,
                        created: Math.floor(Date.now() / 1000)
                    },
                    message: 'Refund processed successfully'
                })

            default:
                return NextResponse.json(
                    { error: 'Unknown action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Error processing payment action:', error)
        return NextResponse.json(
            { error: 'Failed to process payment request' },
            { status: 500 }
        )
    }
}

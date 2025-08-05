'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'bank';
    last4?: string;
    brand?: string;
    expiresAt?: string;
    email?: string;
    isDefault: boolean;
}

interface BillingDetails {
    email: string;
    name: string;
    company?: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    taxId?: string;
}

interface PlanDetails {
    id: string;
    name: string;
    price: number;
    period: 'month' | 'year';
    features: string[];
    discount?: number;
}

interface PromoCode {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    validUntil?: string;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [billingDetails, setBillingDetails] = useState<BillingDetails>({
        email: '',
        name: '',
        company: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US'
        },
        taxId: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<{
        type: 'card' | 'paypal';
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        cardholderName: string;
    }>({
        type: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    });

    const [promoCode, setPromoCode] = useState<string>('');
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // Plan details from URL params
    const [planDetails, setPlanDetails] = useState<PlanDetails>({
        id: 'pro',
        name: 'Pro',
        price: 29,
        period: 'month',
        features: [
            'Unlimited memories',
            'AI-powered search',
            'Team collaboration',
            'API access',
            'Priority support'
        ]
    });

    useEffect(() => {
        const plan = searchParams.get('plan');
        const billing = searchParams.get('billing') as 'month' | 'year';

        if (plan === 'pro') {
            setPlanDetails(prev => ({
                ...prev,
                price: billing === 'year' ? 23 : 29,
                period: billing || 'month',
                discount: billing === 'year' ? 20 : undefined
            }));
        }
    }, [searchParams]);

    const countries = [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'AU', name: 'Australia' },
        { code: 'JP', name: 'Japan' },
        { code: 'Other', name: 'Other' }
    ];

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1: // Billing details
                return !!(
                    billingDetails.email &&
                    billingDetails.name &&
                    billingDetails.address.line1 &&
                    billingDetails.address.city &&
                    billingDetails.address.state &&
                    billingDetails.address.postalCode &&
                    billingDetails.address.country
                );
            case 2: // Payment method
                if (paymentMethod.type === 'card') {
                    return !!(
                        paymentMethod.cardNumber &&
                        paymentMethod.expiryDate &&
                        paymentMethod.cvv &&
                        paymentMethod.cardholderName
                    );
                }
                return true;
            case 3: // Review
                return agreeToTerms;
            default:
                return false;
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        setIsLoading(true);

        // Simulate API call to validate promo code
        await new Promise(resolve => setTimeout(resolve, 1000));

        const validPromoCodes: { [key: string]: PromoCode } = {
            'SAVE20': { code: 'SAVE20', discount: 20, type: 'percentage' },
            'WELCOME10': { code: 'WELCOME10', discount: 10, type: 'fixed' },
            'STUDENT50': { code: 'STUDENT50', discount: 50, type: 'percentage' }
        };

        if (validPromoCodes[promoCode.toUpperCase()]) {
            setAppliedPromo(validPromoCodes[promoCode.toUpperCase()]);
            setError(null);
        } else {
            setError('Invalid promo code');
            setAppliedPromo(null);
        }

        setIsLoading(false);
    };

    const calculateTotal = () => {
        let total = planDetails.price;

        if (appliedPromo) {
            if (appliedPromo.type === 'percentage') {
                total = total * (1 - appliedPromo.discount / 100);
            } else {
                total = Math.max(0, total - appliedPromo.discount);
            }
        }

        return total;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleCompletePayment = async () => {
        if (!validateStep(3)) return;

        setIsLoading(true);
        setError(null);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Simulate random success/failure for demo
            if (Math.random() > 0.1) { // 90% success rate
                router.push('/checkout/success?plan=' + planDetails.id);
            } else {
                throw new Error('Payment processing failed. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 3) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Complete Your Purchase
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Subscribe to {planDetails.name} - ${planDetails.price}/{planDetails.period}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left side - Form */}
                    <div className="lg:col-span-2">
                        {/* Progress steps */}
                        <div className="mb-8">
                            <div className="flex items-center">
                                {[1, 2, 3].map((step, index) => (
                                    <React.Fragment key={step}>
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {step < currentStep ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    step
                                                )}
                                            </div>
                                            <span className={`ml-2 text-sm font-medium ${step <= currentStep
                                                    ? 'text-gray-900 dark:text-white'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {step === 1 && 'Billing'}
                                                {step === 2 && 'Payment'}
                                                {step === 3 && 'Review'}
                                            </span>
                                        </div>
                                        {index < 2 && (
                                            <div className={`flex-1 h-px mx-4 ${step < currentStep
                                                    ? 'bg-blue-600'
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                }`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Billing Details */}
                        {currentStep === 1 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Billing Information
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={billingDetails.email}
                                            onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="john@company.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.name}
                                            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Company (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.company}
                                            onChange={(e) => setBillingDetails(prev => ({ ...prev, company: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Acme Corp"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Address Line 1 *
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.address.line1}
                                            onChange={(e) => setBillingDetails(prev => ({
                                                ...prev,
                                                address: { ...prev.address, line1: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Address Line 2 (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.address.line2}
                                            onChange={(e) => setBillingDetails(prev => ({
                                                ...prev,
                                                address: { ...prev.address, line2: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Apartment, suite, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.address.city}
                                            onChange={(e) => setBillingDetails(prev => ({
                                                ...prev,
                                                address: { ...prev.address, city: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="New York"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            State/Province *
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.address.state}
                                            onChange={(e) => setBillingDetails(prev => ({
                                                ...prev,
                                                address: { ...prev.address, state: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="NY"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.address.postalCode}
                                            onChange={(e) => setBillingDetails(prev => ({
                                                ...prev,
                                                address: { ...prev.address, postalCode: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="10001"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Country *
                                        </label>
                                        <select
                                            value={billingDetails.address.country}
                                            onChange={(e) => setBillingDetails(prev => ({
                                                ...prev,
                                                address: { ...prev.address, country: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            {countries.map(country => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tax ID (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={billingDetails.taxId}
                                            onChange={(e) => setBillingDetails(prev => ({ ...prev, taxId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="VAT number, EIN, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Payment Method
                                </h2>

                                {/* Payment method selector */}
                                <div className="mb-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod(prev => ({ ...prev, type: 'card' }))}
                                            className={`p-4 border rounded-lg text-left transition-all ${paymentMethod.type === 'card'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                                </svg>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Credit Card
                                                </span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod(prev => ({ ...prev, type: 'paypal' }))}
                                            className={`p-4 border rounded-lg text-left transition-all ${paymentMethod.type === 'paypal'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.99-.232 1.215-.334 2.04-.334 2.04s-.013.013-.026.013c-.013 0-.026-.013-.026-.013 0 0-.102-.825-.334-2.04-.015-.815-.028-.914-.041-.99-.201.193-.407.367-.607.541-.013.076-.026.175-.041.99-.232 1.215-.334 2.04-.334 2.04s-.013.013-.026.013c-.013 0-.026-.013-.026-.013 0 0-.102-.825-.334-2.04-.015-.815-.028-.914-.041-.99z" />
                                                </svg>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    PayPal
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Card details form */}
                                {paymentMethod.type === 'card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Card Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentMethod.cardNumber}
                                                onChange={(e) => setPaymentMethod(prev => ({
                                                    ...prev,
                                                    cardNumber: formatCardNumber(e.target.value)
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Expiry Date *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentMethod.expiryDate}
                                                    onChange={(e) => setPaymentMethod(prev => ({
                                                        ...prev,
                                                        expiryDate: formatExpiryDate(e.target.value)
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    CVV *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentMethod.cvv}
                                                    onChange={(e) => setPaymentMethod(prev => ({
                                                        ...prev,
                                                        cvv: e.target.value.replace(/\D/g, '')
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                    placeholder="123"
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Cardholder Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentMethod.cardholderName}
                                                onChange={(e) => setPaymentMethod(prev => ({
                                                    ...prev,
                                                    cardholderName: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* PayPal placeholder */}
                                {paymentMethod.type === 'paypal' && (
                                    <div className="text-center py-8">
                                        <div className="text-6xl mb-4">💳</div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            You'll be redirected to PayPal to complete your payment securely.
                                        </p>
                                        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                PayPal integration will be activated after proceeding to the next step.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Review Your Order
                                </h2>

                                {/* Order summary */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {planDetails.name} Plan
                                        </span>
                                        <span className="text-gray-900 dark:text-white">
                                            ${planDetails.price}/{planDetails.period}
                                        </span>
                                    </div>

                                    {planDetails.discount && (
                                        <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                            <span>Yearly discount ({planDetails.discount}% off)</span>
                                            <span>-${Math.round(planDetails.price * planDetails.discount / 100 * (planDetails.period === 'year' ? 12 : 1))}</span>
                                        </div>
                                    )}

                                    {appliedPromo && (
                                        <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                                            <span>Promo code: {appliedPromo.code}</span>
                                            <span>
                                                -{appliedPromo.type === 'percentage' ? `${appliedPromo.discount}%` : `$${appliedPromo.discount}`}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600 font-semibold text-lg">
                                        <span className="text-gray-900 dark:text-white">Total</span>
                                        <span className="text-blue-600 dark:text-blue-400">
                                            ${calculateTotal().toFixed(2)}/{planDetails.period}
                                        </span>
                                    </div>
                                </div>

                                {/* Billing details summary */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Billing Information
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
                                        <p className="text-gray-900 dark:text-white font-medium">{billingDetails.name}</p>
                                        {billingDetails.company && (
                                            <p className="text-gray-600 dark:text-gray-300">{billingDetails.company}</p>
                                        )}
                                        <p className="text-gray-600 dark:text-gray-300">{billingDetails.email}</p>
                                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                                            {billingDetails.address.line1}
                                            {billingDetails.address.line2 && `, ${billingDetails.address.line2}`}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {billingDetails.address.city}, {billingDetails.address.state} {billingDetails.address.postalCode}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {countries.find(c => c.code === billingDetails.address.country)?.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment method summary */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Payment Method
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
                                        {paymentMethod.type === 'card' ? (
                                            <div className="flex items-center">
                                                <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                                </svg>
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        •••• •••• •••• {paymentMethod.cardNumber.slice(-4)}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        {paymentMethod.cardholderName}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.99-.232 1.215-.334 2.04-.334 2.04s-.013.013-.026.013c-.013 0-.026-.013-.026-.013 0 0-.102-.825-.334-2.04-.015-.815-.028-.914-.041-.99-.201.193-.407.367-.607.541-.013.076-.026.175-.041.99-.232 1.215-.334 2.04-.334 2.04s-.013.013-.026.013c-.013 0-.026-.013-.026-.013 0 0-.102-.825-.334-2.04-.015-.815-.028-.914-.041-.99z" />
                                                </svg>
                                                <p className="text-gray-900 dark:text-white font-medium">PayPal</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Terms and conditions */}
                                <div className="mb-6">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={agreeToTerms}
                                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                                            I agree to the{' '}
                                            <a href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                Terms of Service
                                            </a>{' '}
                                            and{' '}
                                            <a href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                Privacy Policy
                                            </a>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={handleCompletePayment}
                                    disabled={!validateStep(3) || isLoading}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        `Complete Payment - $${calculateTotal().toFixed(2)}`
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right side - Order summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Order Summary
                            </h3>

                            {/* Plan details */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {planDetails.name}
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                        ${planDetails.price}/{planDetails.period}
                                    </span>
                                </div>

                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    {planDetails.features.slice(0, 5).map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Promo code */}
                            <div className="mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Promo code"
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={isLoading || !promoCode.trim()}
                                        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>

                                {appliedPromo && (
                                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Promo code applied!
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span className="text-gray-900 dark:text-white">Total</span>
                                    <span className="text-blue-600 dark:text-blue-400">
                                        ${calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Billed {planDetails.period}ly
                                </p>
                            </div>

                            {/* Security badges */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        SSL Secured
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Money Back Guarantee
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading component for checkout page
 */
function CheckoutLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-96"></div>
                        </div>
                        <div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 h-64"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<CheckoutLoading />}>
            <CheckoutContent />
        </Suspense>
    );
}

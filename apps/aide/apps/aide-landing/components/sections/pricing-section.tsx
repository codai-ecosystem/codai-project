'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/lib/hooks/use-in-view';
import { Check, Zap, Crown, Rocket, Star, ExternalLink } from 'lucide-react';
import {
	Button,
	Badge,
	Card,
	CardContent,
	LoadingSpinner,
	useTranslation
} from '@codai/shared-ui';

export function PricingSection() {
	const { t } = useTranslation();
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
	const [isLoading, setIsLoading] = useState<string | null>(null);
	// Stripe Price IDs from environment variables
	const stripePriceIds = {
		professional: {
			monthly: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_monthly',
			yearly: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || 'price_professional_yearly',
		},
		enterprise: {
			monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
			yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly',
		}
	};

	const handleSubscribe = async (planName: string, priceId?: string) => {
		if (planName === 'Starter') {
			// Redirect to free signup
			window.open(`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup`, '_blank');
			return;
		}

		if (planName === 'Enterprise' && !priceId) {
			// Redirect to contact sales
			window.open('mailto:sales@aide.dev?subject=Enterprise%20Plan%20Inquiry', '_blank');
			return;
		}

		if (!priceId) return;

		setIsLoading(planName);

		try {
			// Create Stripe Checkout session
			const response = await fetch('/api/stripe/create-checkout-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					priceId,
					mode: 'subscription',
					successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
					cancelUrl: window.location.href,
				}),
			});

			const { sessionId, url } = await response.json();

			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			console.error('Error creating checkout session:', error);
			// Fallback to control panel signup
			window.open(`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup?plan=${planName.toLowerCase()}`, '_blank');
		} finally {
			setIsLoading(null);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
			},
		},
	};

	const plans = [
		{
			name: t('aide.pricing.plans.starter.name'),
			icon: Zap,
			description: t('aide.pricing.plans.starter.description'),
			price: {
				monthly: 0,
				yearly: 0,
			},
			features: [
				t('aide.pricing.plans.starter.features.requests'),
				t('aide.pricing.plans.starter.features.projects'),
				t('aide.pricing.plans.starter.features.integration'),
				t('aide.pricing.plans.starter.features.support'),
				t('aide.pricing.plans.starter.features.deployment'),
				t('aide.pricing.plans.starter.features.storage'),
			],
			popular: false,
			cta: t('aide.pricing.plans.starter.cta'),
		}, {
			name: t('aide.pricing.plans.professional.name'),
			icon: Crown,
			description: t('aide.pricing.plans.professional.description'),
			price: {
				monthly: 29,
				yearly: 24,
			},
			priceId: {
				monthly: stripePriceIds.professional.monthly,
				yearly: stripePriceIds.professional.yearly,
			},
			features: [
				t('aide.pricing.plans.professional.features.requests'),
				t('aide.pricing.plans.professional.features.projects'),
				t('aide.pricing.plans.professional.features.advanced'),
				t('aide.pricing.plans.professional.features.support'),
				t('aide.pricing.plans.professional.features.deployment'),
				t('aide.pricing.plans.professional.features.storage'),
				t('aide.pricing.plans.professional.features.collaboration'),
				t('aide.pricing.plans.professional.features.integrations'),
			],
			popular: true,
			cta: t('aide.pricing.plans.professional.cta'),
		},
		{
			name: t('aide.pricing.plans.enterprise.name'),
			icon: Rocket,
			description: t('aide.pricing.plans.enterprise.description'),
			price: {
				monthly: 99,
				yearly: 79,
			},
			priceId: {
				monthly: stripePriceIds.enterprise.monthly,
				yearly: stripePriceIds.enterprise.yearly,
			},
			features: [
				t('aide.pricing.plans.enterprise.features.requests'),
				t('aide.pricing.plans.enterprise.features.projects'),
				t('aide.pricing.plans.enterprise.features.models'),
				t('aide.pricing.plans.enterprise.features.support'),
				t('aide.pricing.plans.enterprise.features.deployment'),
				t('aide.pricing.plans.enterprise.features.storage'),
				t('aide.pricing.plans.enterprise.features.security'),
				t('aide.pricing.plans.enterprise.features.integrations'),
				t('aide.pricing.plans.enterprise.features.sla'),
				t('aide.pricing.plans.enterprise.features.onPremise'),
			],
			popular: false,
			cta: t('aide.pricing.plans.enterprise.cta'),
		},
	];

	return (
		<section id="pricing" className="py-24 bg-background">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					ref={ref}
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="text-center mb-16"
				>
					<motion.div variants={itemVariants}>
						<Badge
							variant="secondary"
							size="lg"
							className="inline-flex items-center space-x-2 mb-6"
						>
							<Star className="h-4 w-4" />
							<span>{t('aide.pricing.badge')}</span>
						</Badge>
					</motion.div>

					<motion.h2
						variants={itemVariants}
						className="text-3xl sm:text-5xl font-bold text-foreground mb-6"
					>
						{t('aide.pricing.title.part1')}
						<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
							{' '}{t('aide.pricing.title.part2')}
						</span>
					</motion.h2>

					<motion.p
						variants={itemVariants}
						className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
					>
						{t('aide.pricing.subtitle')}
					</motion.p>

					{/* Billing Toggle */}
					<motion.div
						variants={itemVariants}
						className="inline-flex items-center bg-muted rounded-lg p-1"
					>
						<button
							onClick={() => setBillingPeriod('monthly')}
							className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${billingPeriod === 'monthly'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
								}`}
						>
							{t('aide.pricing.billing.monthly')}
						</button>
						<button
							onClick={() => setBillingPeriod('yearly')}
							className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${billingPeriod === 'yearly'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
								}`}
						>
							{t('aide.pricing.billing.yearly')}
							<Badge variant="outline" size="sm" className="ml-2 bg-green-100 text-green-700">
								{t('aide.pricing.billing.save')}
							</Badge>
						</button>
					</motion.div>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
				>
					{plans.map((plan, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
						>
							<Card
								className={`relative h-full ${plan.popular
									? 'border-primary shadow-xl scale-105'
									: 'hover:border-primary/50'
									} transition-all duration-300 hover:shadow-lg`}
							>
								{/* Popular Badge */}
								{plan.popular && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<Badge variant="default" size="lg">
											{t('aide.pricing.mostPopular')}
										</Badge>
									</div>
								)}

								<CardContent className="p-8">
									{/* Plan Header */}
									<div className="text-center mb-8">
										<div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-4">
											<plan.icon className="h-6 w-6" />
										</div>
										<h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
										<p className="text-muted-foreground">{plan.description}</p>
									</div>

									{/* Pricing */}
									<div className="text-center mb-8">
										<div className="flex items-baseline justify-center">
											<span className="text-5xl font-bold text-foreground">
												${plan.price[billingPeriod]}
											</span>
											<span className="text-muted-foreground ml-2">
												/{t('aide.pricing.billing.month')}
											</span>
										</div>
										{billingPeriod === 'yearly' && plan.price.yearly > 0 && (
											<p className="text-sm text-muted-foreground mt-2">
												{t('aide.pricing.billing.billedAnnually', {
													amount: plan.price.yearly * 12
												})}
											</p>
										)}
									</div>

									{/* Features */}
									<ul className="space-y-4 mb-8">
										{plan.features.map((feature, featureIndex) => (
											<li key={featureIndex} className="flex items-start space-x-3">
												<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
												<span className="text-muted-foreground">{feature}</span>
											</li>
										))}
									</ul>

									{/* CTA Button */}
									<Button
										onClick={() => handleSubscribe(
											plan.name,
											plan.priceId ? plan.priceId[billingPeriod] : undefined
										)}
										disabled={isLoading === plan.name}
										className="w-full"
										variant={plan.popular ? 'default' : 'outline'}
										size="lg"
									>
										{isLoading === plan.name ? (
											<>
												<LoadingSpinner size="sm" className="mr-2" />
												{t('aide.pricing.processing')}
											</>
										) : (
											<>
												{plan.cta}
												{plan.name !== t('aide.pricing.plans.starter.name') && (
													<ExternalLink className="w-4 h-4 ml-2" />
												)}
											</>
										)}
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>

				{/* Enterprise Contact */}
				<motion.div
					variants={itemVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="mt-16"
				>
					<Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border-primary/20 max-w-4xl mx-auto">
						<CardContent className="text-center p-8">
							<h3 className="text-2xl font-bold text-foreground mb-3">
								{t('aide.pricing.enterprise.title')}
							</h3>
							<p className="text-muted-foreground mb-6">
								{t('aide.pricing.enterprise.description')}
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
								<Button size="lg">
									{t('aide.pricing.enterprise.scheduleDemo')}
								</Button>
								<Button variant="outline" size="lg">
									{t('aide.pricing.enterprise.contactSales')}
								</Button>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}

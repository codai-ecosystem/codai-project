'use client'

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	Button,
	Input,
	Card,
	CardContent,
	Badge,
	AnimatedBackground,
	useTranslation
} from '@codai/shared-ui';
import { useInView } from '@/lib/hooks/use-in-view';
import { Check, Users, Shield, Headphones, ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
	const [ref, isInView] = useInView({ threshold: 0.1 });
	const [email, setEmail] = useState('');
	const { t } = useTranslation();

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.8,
				staggerChildren: 0.2
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" }
		}
	};

	const handleSignUp = () => {
		if (email) {
			// Redirect to control panel with email pre-filled
			window.open(`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup?email=${encodeURIComponent(email)}`, '_blank');
		} else {
			// Redirect to control panel without email
			window.open(`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup`, '_blank');
		}
	};

	const handleGetStarted = () => {
		window.open(`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup`, '_blank');
	};

	const trustIndicators = [
		{
			icon: Check,
			text: t('aide.cta.trust.moneyBack')
		},
		{
			icon: Shield,
			text: t('aide.cta.trust.security')
		},
		{
			icon: Headphones,
			text: t('aide.cta.trust.support')
		}
	];

	const companies = [
		'Microsoft', 'Google', 'Meta', 'Netflix', 'Spotify'
	];

	return (
		<section className="py-24 relative overflow-hidden">
			<AnimatedBackground variant="gradient" intensity="strong" />

			<div className="container mx-auto px-4 relative z-10">
				<motion.div
					ref={ref}
					variants={containerVariants}
					initial="hidden"
					animate={isInView ? "visible" : "hidden"}
					className="text-center"
				>
					{/* Main CTA Content */}
					<motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-12">
						<Badge
							variant="primary"
							size="lg"
							className="inline-flex items-center space-x-2 mb-6"
						>
							<Sparkles className="h-4 w-4" />
							<span>{t('aide.cta.badge')}</span>
						</Badge>

						<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
							{t('aide.cta.title.part1')}
							<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
								{' '}{t('aide.cta.title.part2')}
							</span>
						</h2>

						<p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
							{t('aide.cta.subtitle')}
						</p>
					</motion.div>

					{/* CTA Options */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12"
					>
						{/* Primary CTA */}
						<div className="flex flex-col items-center">
							<Button
								onClick={handleGetStarted}
								size="lg"
								className="text-lg px-8 py-4 h-auto group"
							>
								{t('aide.cta.primaryButton')}
								<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
							</Button>
							<p className="text-sm text-muted-foreground mt-2">
								{t('aide.cta.primaryButtonSubtext')}
							</p>
						</div>

						{/* Email Signup */}
						<Card className="w-full max-w-md">
							<CardContent className="p-6">
								<div className="flex flex-col sm:flex-row items-center gap-4">
									<Input
										type="email"
										placeholder={t('aide.cta.emailPlaceholder')}
										value={email}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
										className="flex-1"
										onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSignUp()}
									/>
									<Button
										onClick={handleSignUp}
										variant="outline"
										size="lg"
									>
										{t('aide.cta.getStarted')}
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Trust Indicators */}
					<motion.div variants={itemVariants} className="mb-12">
						<div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
							{trustIndicators.map((indicator, index) => (
								<div key={index} className="flex items-center gap-2">
									<indicator.icon className="w-5 h-5 text-green-500" />
									<span>{indicator.text}</span>
								</div>
							))}
						</div>
					</motion.div>

					{/* Social Proof */}
					<motion.div variants={itemVariants} className="text-center">
						<p className="text-sm text-muted-foreground mb-6">
							{t('aide.cta.socialProof.title')}
						</p>
						<div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
							{companies.map((company, index) => (
								<div
									key={index}
									className="text-2xl font-bold text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors"
								>
									{company}
								</div>
							))}
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}


'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/lib/hooks/use-in-view';
import {
	Brain,
	Code2,
	Rocket,
	Shield,
	Zap,
	GitBranch,
	Database,
	Cloud,
	Users,
	Bot,
	Layers,
	Target
} from 'lucide-react';
import {
	Card,
	CardContent,
	Badge,
	Button,
	useTranslation
} from '@codai/shared-ui';

export function FeaturesSection() {
	const { t } = useTranslation();
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

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

	const features = [
		{
			icon: Brain,
			title: t('aide.features.autonomous.title'),
			description: t('aide.features.autonomous.description'),
			category: t('aide.features.categories.aiPowered'),
		},
		{
			icon: Code2,
			title: t('aide.features.vscode.title'),
			description: t('aide.features.vscode.description'),
			category: t('aide.features.categories.development'),
		},
		{
			icon: Rocket,
			title: t('aide.features.deployment.title'),
			description: t('aide.features.deployment.description'),
			category: t('aide.features.categories.devops'),
		},
		{
			icon: Database,
			title: t('aide.features.database.title'),
			description: t('aide.features.database.description'),
			category: t('aide.features.categories.data'),
		},
		{
			icon: GitBranch,
			title: t('aide.features.versionControl.title'),
			description: t('aide.features.versionControl.description'),
			category: t('aide.features.categories.collaboration'),
		},
		{
			icon: Shield,
			title: t('aide.features.security.title'),
			description: t('aide.features.security.description'),
			category: t('aide.features.categories.security'),
		},
		{
			icon: Cloud,
			title: t('aide.features.multiCloud.title'),
			description: t('aide.features.multiCloud.description'),
			category: t('aide.features.categories.infrastructure'),
		},
		{
			icon: Users,
			title: t('aide.features.collaboration.title'),
			description: t('aide.features.collaboration.description'),
			category: t('aide.features.categories.collaboration'),
		},
		{
			icon: Zap,
			title: t('aide.features.performance.title'),
			description: t('aide.features.performance.description'),
			category: t('aide.features.categories.performance'),
		},
	];

	return (
		<section id="features" className="py-24 bg-muted/30">
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
							<Target className="h-4 w-4" />
							<span>{t('aide.features.badge')}</span>
						</Badge>
					</motion.div>

					<motion.h2
						variants={itemVariants}
						className="text-3xl sm:text-5xl font-bold text-foreground mb-6"
					>
						{t('aide.features.title.part1')}
						<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
							{' '}{t('aide.features.title.part2')}
						</span>
					</motion.h2>

					<motion.p
						variants={itemVariants}
						className="text-xl text-muted-foreground max-w-3xl mx-auto"
					>
						{t('aide.features.subtitle')}
					</motion.p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
						>
							<Card className="group relative h-full hover:shadow-lg hover:border-primary/20 transition-all duration-300">
								{/* Category Badge */}
								<div className="absolute top-6 right-6">
									<Badge variant="outline" size="sm">
										{feature.category}
									</Badge>
								</div>

								<CardContent className="p-8">
									{/* Icon */}
									<div className="mb-6">
										<div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
											<feature.icon className="h-6 w-6" />
										</div>
									</div>

									{/* Content */}
									<h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
										{feature.title}
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</CardContent>

								{/* Hover Effect */}
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
							</Card>
						</motion.div>
					))}
				</motion.div>

				{/* Bottom CTA */}
				<motion.div
					variants={itemVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="mt-16"
				>
					<Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border-primary/20">
						<CardContent className="text-center p-8">
							<Bot className="h-12 w-12 text-primary mx-auto mb-4" />
							<h3 className="text-2xl font-bold text-foreground mb-3">
								{t('aide.features.cta.title')}
							</h3>
							<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
								{t('aide.features.cta.description')}
							</p>
							<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
								<Layers className="h-4 w-4" />
								<span>{t('aide.features.cta.noCreditCard')}</span>
								<span>•</span>
								<span>{t('aide.features.cta.freeTrial')}</span>
								<span>•</span>
								<span>{t('aide.features.cta.cancelAnytime')}</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}

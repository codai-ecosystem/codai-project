'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Code2, Zap, Brain, Rocket, Download, Github, MessageSquare } from 'lucide-react';
import {
	Button,
	Badge,
	Card,
	CardContent,
	CodeBlock,
	AnimatedBackground,
	useTranslation
} from '@codai/shared-ui';
import { DownloadButton } from '@/components/ui/download-button';

export function HeroSection() {
	const { t } = useTranslation();

	const fadeInUp = {
		initial: { opacity: 0, y: 60 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.6 }
	};

	const stagger = {
		animate: {
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const iconVariants = {
		initial: { scale: 0.8, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		hover: { scale: 1.2, rotate: 10 }
	};

	const heroFeatures = [
		{ icon: Brain, text: t('aide.hero.features.aiPowered') },
		{ icon: Code2, text: t('aide.hero.features.vscodeIntegration') },
		{ icon: Rocket, text: t('aide.hero.features.oneClickDeploy') },
		{ icon: Zap, text: t('aide.hero.features.realTimeCollab') },
	];

	const terminalCommands = [
		{ text: '$ aide create next-app my-project', type: 'command' },
		{ text: t('aide.hero.terminal.analyzing'), type: 'info' },
		{ text: t('aide.hero.terminal.generating'), type: 'info' },
		{ text: t('aide.hero.terminal.installing'), type: 'info' },
		{ text: t('aide.hero.terminal.deploying'), type: 'info' },
		{ text: t('aide.hero.terminal.success'), type: 'success' },
		{ text: t('aide.hero.terminal.liveUrl'), type: 'link' },
	];

	return (
		<section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 pt-16">
			{/* Enhanced Background Effects with AnimatedBackground */}
			<AnimatedBackground variant="floating-orbs" />

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<motion.div
					variants={stagger}
					initial="initial"
					animate="animate"
					className="text-center max-w-5xl mx-auto"
				>
					{/* Badge */}
					<motion.div variants={fadeInUp}>
						<Badge
							variant="secondary"
							size="lg"
							className="inline-flex items-center space-x-2 mb-8"
						>
							<Zap className="h-4 w-4" />
							<span>{t('aide.hero.badge')}</span>
						</Badge>
					</motion.div>

					{/* Main Heading */}
					<motion.h1
						variants={fadeInUp}
						className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6"
					>
						{t('aide.hero.title.part1')}
						<span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
							{' '}{t('aide.hero.title.part2')}
						</span>
					</motion.h1>

					{/* Subheading */}
					<motion.p
						variants={fadeInUp}
						className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
					>
						{t('aide.hero.subtitle')}
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						variants={fadeInUp}
						className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
					>
						<DownloadButton
							variant="primary"
							size="lg"
							className="shadow-2xl hover:shadow-primary/25"
						/>
						<div className="flex space-x-4">
							<Link href={`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup`}>
								<Button variant="outline" size="lg" className="group bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10">
									<MessageSquare className="mr-2 h-4 w-4" />
									{t('aide.hero.cta.tryWeb')}
									<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
								</Button>
							</Link>
							<Button variant="ghost" size="lg" className="group text-white/80 hover:text-white">
								<Github className="mr-2 h-4 w-4" />
								{t('aide.hero.cta.viewGithub')}
							</Button>
						</div>
					</motion.div>

					{/* Feature Pills */}
					<motion.div
						variants={fadeInUp}
						className="flex flex-wrap items-center justify-center gap-4 mb-16"
					>
						{heroFeatures.map((feature, index) => (
							<Badge
								key={index}
								variant="outline"
								size="lg"
								className="flex items-center space-x-2"
							>
								<feature.icon className="h-4 w-4 text-primary" />
								<span>{feature.text}</span>
							</Badge>
						))}
					</motion.div>

					{/* Hero Visual */}
					<motion.div
						variants={fadeInUp}
						className="relative"
					>
						<Card className="shadow-2xl overflow-hidden">
							<div className="bg-muted p-4 border-b border-border flex items-center space-x-3">
								<div className="flex space-x-2">
									<div className="w-3 h-3 bg-red-500 rounded-full"></div>
									<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								</div>
								<div className="text-sm text-muted-foreground">{t('aide.hero.terminal.title')}</div>
							</div>
							<CardContent className="p-6">
								<CodeBlock
									code={terminalCommands.map(cmd => cmd.text).join('\n')}
									language="bash"
									showLineNumbers={false}
									className="text-left"
								/>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}

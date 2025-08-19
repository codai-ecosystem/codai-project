'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	Button,
	Badge,
	LanguageSelector,
	useTranslation
} from '@codai/shared-ui';
import { Code2, Sparkles, Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
	const { t } = useTranslation();

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.8,
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" }
		}
	};

	const navigation = {
		product: [
			{ name: t('aide.footer.product.features'), href: '#features' },
			{ name: t('aide.footer.product.pricing'), href: '#pricing' },
			{ name: t('aide.footer.product.documentation'), href: '/docs' },
			{ name: t('aide.footer.product.api'), href: '/api' },
		],
		company: [
			{ name: t('aide.footer.company.about'), href: '/about' },
			{ name: t('aide.footer.company.blog'), href: '/blog' },
			{ name: t('aide.footer.company.careers'), href: '/careers' },
			{ name: t('aide.footer.company.contact'), href: '/contact' },
		],
		support: [
			{ name: t('aide.footer.support.helpCenter'), href: '/help' },
			{ name: t('aide.footer.support.community'), href: '/community' },
			{ name: t('aide.footer.support.status'), href: '/status' },
			{ name: t('aide.footer.support.security'), href: '/security' },
		],
		legal: [
			{ name: t('aide.footer.legal.privacy'), href: '/privacy' },
			{ name: t('aide.footer.legal.terms'), href: '/terms' },
			{ name: t('aide.footer.legal.cookies'), href: '/cookies' },
		],
	};

	const socialLinks = [
		{ name: 'GitHub', href: '#', icon: Github },
		{ name: 'Twitter', href: '#', icon: Twitter },
		{ name: 'LinkedIn', href: '#', icon: Linkedin },
		{ name: 'Email', href: 'mailto:hello@aide.dev', icon: Mail },
	];

	return (
		<footer className="bg-background border-t border-border relative overflow-hidden">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-t from-muted/20 to-transparent" />

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8"
				>
					{/* Logo and Description */}
					<motion.div variants={itemVariants} className="lg:col-span-2">
						<div className="flex items-center space-x-2 mb-4">
							<div className="relative">
								<Code2 className="h-8 w-8 text-primary" />
								<Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1" />
							</div>
							<span className="text-2xl font-bold text-foreground">AIDE</span>
							<Badge variant="secondary" size="sm">
								{t('aide.footer.badge')}
							</Badge>
						</div>
						<p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
							{t('aide.footer.description')}
						</p>

						{/* Newsletter Signup */}
						<div className="mb-6">
							<h4 className="text-sm font-semibold text-foreground mb-3">
								{t('aide.footer.newsletter.title')}
							</h4>
							<div className="flex gap-2">
								<input
									type="email"
									placeholder={t('aide.footer.newsletter.placeholder')}
									className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
								/>
								<Button size="sm" className="shrink-0">
									{t('aide.footer.newsletter.subscribe')}
								</Button>
							</div>
						</div>

						{/* Social Links */}
						<div className="flex space-x-4">
							{socialLinks.map((social) => (
								<Link
									key={social.name}
									href={social.href}
									className="text-muted-foreground hover:text-primary transition-colors duration-200 group"
									aria-label={social.name}
								>
									<social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
								</Link>
							))}
						</div>
					</motion.div>

					{/* Navigation Links */}
					<motion.div variants={itemVariants}>
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
							{t('aide.footer.sections.product')}
						</h3>
						<ul className="space-y-3">
							{navigation.product.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center text-sm"
									>
										{item.name}
										{item.href.startsWith('http') && (
											<ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
										)}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					<motion.div variants={itemVariants}>
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
							{t('aide.footer.sections.company')}
						</h3>
						<ul className="space-y-3">
							{navigation.company.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center text-sm"
									>
										{item.name}
										{item.href.startsWith('http') && (
											<ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
										)}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					<motion.div variants={itemVariants}>
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
							{t('aide.footer.sections.support')}
						</h3>
						<ul className="space-y-3">
							{navigation.support.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center text-sm"
									>
										{item.name}
										{item.href.startsWith('http') && (
											<ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
										)}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					<motion.div variants={itemVariants}>
						<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
							{t('aide.footer.sections.legal')}
						</h3>
						<ul className="space-y-3">
							{navigation.legal.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center text-sm"
									>
										{item.name}
										{item.href.startsWith('http') && (
											<ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
										)}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>
				</motion.div>

				{/* Bottom Section */}
				<motion.div
					variants={itemVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="mt-12 pt-8 border-t border-border"
				>
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="flex flex-col md:flex-row items-center gap-4">
							<p className="text-muted-foreground text-sm">
								{t('aide.footer.copyright', { year: new Date().getFullYear() })}
							</p>
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground text-sm">
									{t('aide.footer.language')}:
								</span>
								<LanguageSelector size="sm" />
							</div>
						</div>
						<p className="text-muted-foreground text-sm">
							{t('aide.footer.madeWith')}
						</p>
					</div>
				</motion.div>
			</div>
		</footer>
	);
}

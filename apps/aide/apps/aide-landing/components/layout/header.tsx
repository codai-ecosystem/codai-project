'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	Button,
	LanguageSelector,
	ThemeSelector,
	useTranslationEnhanced,
	useEnhancedTheme,
	AppThemeWrapper
} from '@codai/shared-ui';
import { Menu, X, Code2, Sparkles } from 'lucide-react';

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { t } = useTranslationEnhanced();
	const { themeConfig } = useEnhancedTheme();

	const navigation = [
		{ name: t('navigation.features'), href: '#features' },
		{ name: t('navigation.pricing'), href: '#pricing' },
		{ name: t('navigation.testimonials'), href: '#testimonials' },
		{ name: t('navigation.docs'), href: '/docs' },
	];

	return (
		<AppThemeWrapper>
			<header className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-md border-b border-white/20">
				<nav className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="flex items-center space-x-2"
						>
							<div className="relative">
								<Code2 className="h-8 w-8 text-white" />
								<Sparkles className="h-4 w-4 text-white absolute -top-1 -right-1" />
							</div>
							<span className="text-2xl font-bold text-white">AIDE</span>
						</motion.div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-8">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
								>
									{item.name}
								</Link>
							))}
						</div>

						{/* Controls & CTA Buttons */}
						<div className="hidden md:flex items-center space-x-4">
							<LanguageSelector />
							<ThemeSelector />
							<Link href={`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/login`}>
								<Button variant="ghost" className="text-white border-white/30 hover:bg-white/10">
									{t('auth.signIn')}
								</Button>
							</Link>
							<Link href={`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup`}>
								<Button className="bg-white text-slate-900 hover:bg-white/90">
									{t('auth.getStarted')}
								</Button>
							</Link>
						</div>

						{/* Mobile Menu Button */}
						<button
							className="md:hidden text-white"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label={t('navigation.toggleMenu')}
						>
							{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</button>
					</div>

					{/* Mobile Navigation */}
					{isMenuOpen && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="md:hidden py-4 border-t border-white/20"
						>
							<div className="flex flex-col space-y-4">
								{navigation.map((item) => (
									<Link
										key={item.name}
										href={item.href}
										className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
										onClick={() => setIsMenuOpen(false)}
									>
										{item.name}
									</Link>
								))}
								<div className="flex flex-col space-y-3 pt-4 border-t border-white/20">
									<div className="flex gap-2">
										<LanguageSelector />
										<ThemeSelector />
									</div>
									<Link href={`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/login`}>
										<Button variant="ghost" className="w-full text-white border-white/30 hover:bg-white/10">
											{t('auth.signIn')}
										</Button>
									</Link>
									<Link href={`${process.env.NEXT_PUBLIC_CONTROL_PANEL_URL}/signup`}>
										<Button className="w-full bg-white text-slate-900 hover:bg-white/90">
											{t('auth.getStarted')}
										</Button>
									</Link>
								</div>
							</div>
						</motion.div>
					)}
				</nav>
			</header>
		</AppThemeWrapper>
	);
}

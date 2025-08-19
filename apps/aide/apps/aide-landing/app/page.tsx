'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedThemeProvider, TranslationProvider, useTranslationEnhanced } from '@codai/shared-ui';
import { HeroSection } from '@/components/sections/hero-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { CTASection } from '@/components/sections/cta-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

function HomePageContent() {
	const { t } = useTranslationEnhanced();

	return (
		<div className="min-h-screen">
			<Header />
			<main>
				<HeroSection />
				<FeaturesSection />
				<TestimonialsSection />
				<PricingSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}

export default function HomePage() {
	return (
		<EnhancedThemeProvider appName="aide" defaultThemeMode="system">
			<TranslationProvider defaultLocale="en" supportedLocales={['en', 'ro']}>
				<HomePageContent />
			</TranslationProvider>
		</EnhancedThemeProvider>
	);
}

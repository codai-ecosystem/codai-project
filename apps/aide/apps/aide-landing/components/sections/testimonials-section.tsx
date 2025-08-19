'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/lib/hooks/use-in-view';
import { Star, Quote } from 'lucide-react';
import {
	Card,
	CardContent,
	Badge,
	Avatar,
	useTranslation
} from '@codai/shared-ui';

export function TestimonialsSection() {
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

	const testimonials = [
		{
			content: t('aide.testimonials.testimonial1.content'),
			author: t('aide.testimonials.testimonial1.author'),
			role: t('aide.testimonials.testimonial1.role'),
			company: t('aide.testimonials.testimonial1.company'),
			avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=faces&auto=format",
			rating: 5,
		},
		{
			content: t('aide.testimonials.testimonial2.content'),
			author: t('aide.testimonials.testimonial2.author'),
			role: t('aide.testimonials.testimonial2.role'),
			company: t('aide.testimonials.testimonial2.company'),
			avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces&auto=format",
			rating: 5,
		},
		{
			content: t('aide.testimonials.testimonial3.content'),
			author: t('aide.testimonials.testimonial3.author'),
			role: t('aide.testimonials.testimonial3.role'),
			company: t('aide.testimonials.testimonial3.company'),
			avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces&auto=format",
			rating: 5,
		},
		{
			content: t('aide.testimonials.testimonial4.content'),
			author: t('aide.testimonials.testimonial4.author'),
			role: t('aide.testimonials.testimonial4.role'),
			company: t('aide.testimonials.testimonial4.company'),
			avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&auto=format",
			rating: 5,
		},
		{
			content: t('aide.testimonials.testimonial5.content'),
			author: t('aide.testimonials.testimonial5.author'),
			role: t('aide.testimonials.testimonial5.role'),
			company: t('aide.testimonials.testimonial5.company'),
			avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&auto=format",
			rating: 5,
		},
		{
			content: t('aide.testimonials.testimonial6.content'),
			author: t('aide.testimonials.testimonial6.author'),
			role: t('aide.testimonials.testimonial6.role'),
			company: t('aide.testimonials.testimonial6.company'),
			avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&auto=format",
			rating: 5,
		},
	];

	return (
		<section id="testimonials" className="py-24 bg-muted/30">
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
							<Quote className="h-4 w-4" />
							<span>{t('aide.testimonials.badge')}</span>
						</Badge>
					</motion.div>

					<motion.h2
						variants={itemVariants}
						className="text-3xl sm:text-5xl font-bold text-foreground mb-6"
					>
						{t('aide.testimonials.title.part1')}
						<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
							{' '}{t('aide.testimonials.title.part2')}
						</span>
					</motion.h2>

					<motion.p
						variants={itemVariants}
						className="text-xl text-muted-foreground max-w-3xl mx-auto"
					>
						{t('aide.testimonials.subtitle')}
					</motion.p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
						>
							<Card className="h-full hover:shadow-lg hover:border-primary/20 transition-all duration-300">
								<CardContent className="p-8">
									{/* Rating */}
									<div className="flex items-center space-x-1 mb-6">
										{[...Array(testimonial.rating)].map((_, i) => (
											<Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
										))}
									</div>

									{/* Quote */}
									<blockquote className="text-muted-foreground leading-relaxed mb-6">
										"{testimonial.content}"
									</blockquote>

									{/* Author */}
									<div className="flex items-center space-x-4">
										<Avatar
											src={testimonial.avatar}
											alt={testimonial.author}
											size="md"
											className="object-cover"
										/>
										<div>
											<div className="font-semibold text-foreground">
												{testimonial.author}
											</div>
											<div className="text-sm text-muted-foreground">
												{testimonial.role}
											</div>
											<div className="text-sm text-primary">
												{testimonial.company}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</motion.div>

				{/* Stats Section */}
				<motion.div
					variants={itemVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="mt-20"
				>
					<Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border-primary/20">
						<CardContent className="p-8">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
								<div>
									<div className="text-3xl font-bold text-foreground mb-2">
										{t('aide.testimonials.stats.developers')}
									</div>
									<div className="text-muted-foreground">
										{t('aide.testimonials.stats.developersLabel')}
									</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-foreground mb-2">
										{t('aide.testimonials.stats.linesOfCode')}
									</div>
									<div className="text-muted-foreground">
										{t('aide.testimonials.stats.linesOfCodeLabel')}
									</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-foreground mb-2">
										{t('aide.testimonials.stats.uptime')}
									</div>
									<div className="text-muted-foreground">
										{t('aide.testimonials.stats.uptimeLabel')}
									</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-foreground mb-2">
										{t('aide.testimonials.stats.fasterDev')}
									</div>
									<div className="text-muted-foreground">
										{t('aide.testimonials.stats.fasterDevLabel')}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}

'use client';

import {
  Code,
  Database,
  Github,
  Globe,
  Heart,
  Palette,
  Rocket,
  Shield,
  Smartphone,
  Twitter,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

export default function Home(): JSX.Element {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
                <span className="text-3xl font-bold">M</span>
              </div>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Welcome to METU
            </h1>

            <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
              A comprehensive Next.js 15 starter template with{' '}
              <span className="font-semibold text-primary">Firebase</span>,{' '}
              <span className="font-semibold text-primary">TypeScript</span>,{' '}
              <span className="font-semibold text-primary">Tailwind CSS</span>,
              and modern best practices.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <div className="space-y-4 text-center">
                  <p className="text-lg text-muted-foreground">
                    Welcome back,{' '}
                    <span className="font-semibold text-foreground">
                      {user?.displayName ?? user?.email}
                    </span>
                    !
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button size="lg" asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/docs">View Documentation</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button size="lg" asChild>
                    <Link href="/auth/register" data-testid="hero-sign-up">
                      <Rocket className="mr-2 h-5 w-5" />
                      Get Started
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/auth/login" data-testid="hero-sign-in">
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to build modern web apps
            </h2>
            <p className="text-xl text-muted-foreground">
              Built with the latest technologies and best practices for maximum
              developer experience and performance.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Code className="h-8 w-8" />}
              title="TypeScript First"
              description="Fully typed with strict TypeScript configuration for better code quality and developer experience."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Lightning Fast"
              description="Built on Next.js 15 with App Router, optimized for performance and modern web standards."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure Authentication"
              description="Firebase Authentication with Google OAuth, email/password, and comprehensive user management."
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8" />}
              title="Beautiful UI"
              description="Modern design system with Tailwind CSS, dark/light themes, and accessible components."
            />
            <FeatureCard
              icon={<Database className="h-8 w-8" />}
              title="Real-time Database"
              description="Firebase Firestore integration with type-safe queries and real-time updates."
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8" />}
              title="PWA Ready"
              description="Progressive Web App features with offline support and native app-like experience."
            />
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built with modern technologies
            </h2>
            <p className="text-xl text-muted-foreground">
              A carefully curated stack for building scalable and maintainable
              applications.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <TechCard
              name="Next.js 15"
              description="React framework with App Router"
            />
            <TechCard name="TypeScript" description="Type-safe JavaScript" />
            <TechCard
              name="Tailwind CSS"
              description="Utility-first CSS framework"
            />
            <TechCard
              name="Firebase"
              description="Backend-as-a-Service platform"
            />
            <TechCard
              name="Zustand"
              description="Lightweight state management"
            />
            <TechCard
              name="React Hook Form"
              description="Performant forms with validation"
            />
            <TechCard
              name="Playwright"
              description="End-to-end testing framework"
            />
            <TechCard
              name="Vercel"
              description="Deployment and hosting platform"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to build something amazing?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Get started with METU Template and ship your next project faster
              than ever.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  <Users className="mr-2 h-5 w-5" />
                  Start Building
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://github.com/metu-template/metu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-muted-foreground">
              <a
                href="https://twitter.com/metu_template"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://github.com/metu-template"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="/docs" className="transition-colors hover:text-primary">
                <Globe className="h-6 w-6" />
                <span className="sr-only">Documentation</span>
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>by the METU community</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface TechCardProps {
  name: string;
  description: string;
}

function TechCard({ name, description }: TechCardProps) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

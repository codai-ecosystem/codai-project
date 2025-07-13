'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface ExampleLink {
  title: string;
  description: string;
  href: string;
}

const examples: ExampleLink[] = [
  {
    title: 'Users Table',
    description: 'Advanced data table with sorting, filtering, and pagination',
    href: '/examples/users-table',
  },
  {
    title: 'Form Controls',
    description: 'Form components with validation and error handling',
    href: '/examples/forms',
  },
  {
    title: 'Firebase Auth',
    description: 'Firebase authentication integration examples',
    href: '/examples/auth',
  },
  {
    title: 'Toast Notifications',
    description: 'Interactive toast notification examples',
    href: '/examples/toasts',
  },
];

export default function ExamplesPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Examples</h1>
        <p className="mt-2 text-muted-foreground">
          Explore these example components and implementations to help you build
          your application.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {examples.map(example => (
          <Card key={example.href} className="group hover:border-primary">
            <CardHeader>
              <CardTitle className="text-xl">{example.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{example.description}</p>
              <Link
                href={example.href}
                className="inline-flex items-center text-sm font-medium text-primary group-hover:underline"
              >
                View Example
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

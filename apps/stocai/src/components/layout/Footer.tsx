import React from 'react'
import { Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-xs font-bold">M</span>
              </div>
              <span className="font-semibold">METU</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern Next.js 15 template with Firebase, TypeScript, and Tailwind
              CSS. Built for developers who want to ship fast.
            </p>
            <div className="flex gap-2">
              <Link href="https://github.com" aria-label="GitHub">
                <Button variant="ghost" size="sm">
                  <Github className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://twitter.com" aria-label="Twitter">
                <Button variant="ghost" size="sm">
                  <Twitter className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn">
                <Button variant="ghost" size="sm">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Product</h3>
            <nav className="space-y-2">
              <Link
                href="/features"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/changelog"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Changelog
              </Link>
              <Link
                href="/roadmap"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Roadmap
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <nav className="space-y-2">
              <Link
                href="/docs"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Documentation
              </Link>
              <Link
                href="/examples"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Examples
              </Link>
              <Link
                href="/guides"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Guides
              </Link>
              <Link
                href="/templates"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Templates
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Company</h3>
            <nav className="space-y-2">
              <Link
                href="/about"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Blog
              </Link>
              <Link
                href="/careers"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Careers
              </Link>
              <Link
                href="/contact"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} METU. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


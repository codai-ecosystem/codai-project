/**
 * @fileoverview UI Showcase Component
 * @description Demonstrates all base UI components with the design system
 */

'use client';

import React, { useState } from 'react';
import { Button, IconButton } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { LoadingSpinner, LoadingDots, LoadingSkeleton } from '../ui/loading';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { ThemeToggle } from '../theme/ThemeToggle';

export function UIShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              MemorAI Design System
            </h1>
            <p className="text-muted-foreground">
              Comprehensive UI components with light/dark theme support
            </p>
          </div>
          <ThemeToggle variant="button" size="lg" showLabel />
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Various button styles with semantic colors and states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Primary Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="tertiary" size="sm">Tertiary</Button>
                </div>
              </div>

              {/* Status Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Status Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="success" size="sm">Success</Button>
                  <Button variant="warning" size="sm">Warning</Button>
                  <Button variant="danger" size="sm">Danger</Button>
                  <Button variant="info" size="sm">Info</Button>
                </div>
              </div>

              {/* Utility Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Utility Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="link" size="sm">Link</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Sizes</h4>
                <div className="flex items-center flex-wrap gap-2">
                  <Button size="xs">XS</Button>
                  <Button size="sm">SM</Button>
                  <Button size="md">MD</Button>
                  <Button size="lg">LG</Button>
                  <Button size="xl">XL</Button>
                </div>
              </div>

              {/* Button States */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">States</h4>
                <div className="flex flex-wrap gap-2">
                  <Button loading={loading} onClick={handleLoadingDemo}>
                    Loading Demo
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button 
                    leftIcon={<span>🔍</span>}
                  >
                    With Icon
                  </Button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Icon Buttons</h4>
                <div className="flex items-center gap-2">
                  <IconButton
                    icon={<span>❤️</span>}
                    aria-label="Like"
                    variant="primary"
                    size="sm"
                  />
                  <IconButton
                    icon={<span>⚙️</span>}
                    aria-label="Settings"
                    variant="secondary"
                  />
                  <IconButton
                    icon={<span>🗑️</span>}
                    aria-label="Delete"
                    variant="danger"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Components */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Form inputs with validation states and helper text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Basic Input"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="This is a helpful description"
                />
                
                <Input
                  label="Required Input"
                  placeholder="Required field"
                  required
                />
                
                <Input
                  label="Input with Icon"
                  placeholder="Search..."
                  leftIcon={<span>🔍</span>}
                />
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Success State"
                  placeholder="Valid input"
                  success="Great! This looks good."
                  defaultValue="valid@example.com"
                />
                
                <Input
                  label="Warning State"
                  placeholder="Warning input"
                  warning="Please double-check this value"
                  defaultValue="check-this"
                />
                
                <Input
                  label="Error State"
                  placeholder="Invalid input"
                  error="This field is required"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with subtle shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Default card content with standard styling.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Enhanced shadow for emphasis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Elevated card with stronger shadow effect.</p>
            </CardContent>
          </Card>

          <Card variant="primary" interactive>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Clickable with hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This card has interactive hover and scale effects.</p>
            </CardContent>
          </Card>

          <Card variant="success">
            <CardHeader>
              <CardTitle>Success Card</CardTitle>
              <CardDescription>Positive status indicator</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Success-themed card with green accents.</p>
            </CardContent>
          </Card>

          <Card variant="warning">
            <CardHeader>
              <CardTitle>Warning Card</CardTitle>
              <CardDescription>Caution status indicator</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Warning-themed card with yellow accents.</p>
            </CardContent>
          </Card>

          <Card variant="danger">
            <CardHeader>
              <CardTitle>Danger Card</CardTitle>
              <CardDescription>Error or critical status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Danger-themed card with red accents.</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading Components */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Various loading indicators for different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Spinners</h4>
                <div className="flex items-center gap-4">
                  <LoadingSpinner size="xs" color="primary" />
                  <LoadingSpinner size="sm" color="success" />
                  <LoadingSpinner size="md" color="warning" />
                  <LoadingSpinner size="lg" color="danger" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Dots</h4>
                <div className="flex flex-col gap-2">
                  <LoadingDots size="sm" color="primary" />
                  <LoadingDots size="md" color="success" />
                  <LoadingDots size="lg" color="info" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Skeleton</h4>
                <LoadingSkeleton lines={3} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog Component</CardTitle>
            <CardDescription>
              Modal dialogs with proper accessibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Example Dialog</DialogTitle>
                  <DialogDescription>
                    This is an example dialog demonstrating the modal component with proper theming.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-foreground">
                    The dialog automatically adapts to the current theme and provides 
                    proper focus management and accessibility features.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="tertiary">Cancel</Button>
                  <Button variant="primary">Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Click the button above to see the dialog in action
            </p>
          </CardFooter>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color System</CardTitle>
            <CardDescription>
              Semantic color tokens that adapt to light/dark themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Primary', class: 'bg-primary text-primary-foreground' },
                { name: 'Secondary', class: 'bg-secondary text-secondary-foreground' },
                { name: 'Success', class: 'bg-success text-success-foreground' },
                { name: 'Warning', class: 'bg-warning text-warning-foreground' },
                { name: 'Danger', class: 'bg-danger text-danger-foreground' },
                { name: 'Info', class: 'bg-info text-info-foreground' },
              ].map((color) => (
                <div
                  key={color.name}
                  className={`${color.class} p-4 rounded-md text-center text-sm font-medium`}
                >
                  {color.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
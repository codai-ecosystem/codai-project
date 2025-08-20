import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Heart, Star, Share2, BookOpen, TrendingUp, Users } from 'lucide-react';

const meta: Meta<typeof Card> = {
    title: 'UI Components/Card',
    component: Card,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A flexible card component with multiple variants and composable parts including header, content, and footer sections.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'glass', 'outline', 'gradient'],
            description: 'The visual variant of the card',
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'xl'],
            description: 'The padding size of the card',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is the main content of the card.</p>
            </CardContent>
        </Card>
    ),
};

export const Glass: Story = {
    render: () => (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg">
            <Card variant="glass" className="w-[350px]">
                <CardHeader>
                    <CardTitle>Glass Card</CardTitle>
                    <CardDescription>A glass-morphism style card</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This card has a glass effect with backdrop blur.</p>
                </CardContent>
            </Card>
        </div>
    ),
};

export const Outline: Story = {
    render: () => (
        <Card variant="outline" className="w-[350px]">
            <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>A card with outline style</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This card has a transparent background with border only.</p>
            </CardContent>
        </Card>
    ),
};

export const Gradient: Story = {
    render: () => (
        <Card variant="gradient" className="w-[350px]">
            <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>A card with gradient background</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This card has a subtle gradient background.</p>
            </CardContent>
        </Card>
    ),
};

// Size variants
export const Small: Story = {
    render: () => (
        <Card size="sm" className="w-[300px]">
            <CardHeader>
                <CardTitle>Small Card</CardTitle>
                <CardDescription>Compact card with small padding</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is a small card with reduced padding.</p>
            </CardContent>
        </Card>
    ),
};

export const Large: Story = {
    render: () => (
        <Card size="lg" className="w-[400px]">
            <CardHeader>
                <CardTitle>Large Card</CardTitle>
                <CardDescription>Spacious card with large padding</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is a large card with increased padding for more breathing room.</p>
            </CardContent>
        </Card>
    ),
};

export const ExtraLarge: Story = {
    render: () => (
        <Card size="xl" className="w-[450px]">
            <CardHeader>
                <CardTitle>Extra Large Card</CardTitle>
                <CardDescription>Very spacious card with extra large padding</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is an extra large card with maximum padding for premium layouts.</p>
            </CardContent>
        </Card>
    ),
};

// With footer
export const WithFooter: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>This card includes a footer section</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Main content goes here. The footer will contain action buttons.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
            </CardFooter>
        </Card>
    ),
};

// Real-world examples
export const ProjectCard: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    CODAI Project
                </CardTitle>
                <CardDescription>AI-powered development platform</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span>94% completion</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>12 team members</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" className="ml-auto">View Project</Button>
            </CardFooter>
        </Card>
    ),
};

export const StatsCard: Story = {
    render: () => (
        <Card className="w-[300px]">
            <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                <CardDescription>January 2025</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-green-600">$45,231</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+20.1% from last month</span>
                </div>
            </CardContent>
        </Card>
    ),
};

export const ProfileCard: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        JD
                    </div>
                    <div>
                        <CardTitle className="text-lg">John Doe</CardTitle>
                        <CardDescription>Senior Developer</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Passionate about creating innovative solutions with modern technologies.
                    Specialized in React, TypeScript, and cloud architecture.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full">View Profile</Button>
            </CardFooter>
        </Card>
    ),
};

export const NotificationCard: Story = {
    render: () => (
        <Card variant="outline" className="w-[350px]">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base">New message received</CardTitle>
                        <CardDescription>2 minutes ago</CardDescription>
                    </div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm">
                    You have received a new message from Sarah Wilson regarding the project update.
                </p>
            </CardContent>
            <CardFooter className="gap-2">
                <Button variant="outline" size="sm">Dismiss</Button>
                <Button size="sm">Reply</Button>
            </CardFooter>
        </Card>
    ),
};

// Layout examples
export const CardGrid: Story = {
    render: () => (
        <div className="grid grid-cols-2 gap-4 w-[600px]">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <div className="text-sm text-green-600">+12% this month</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$23,456</div>
                    <div className="text-sm text-green-600">+8% this month</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">456</div>
                    <div className="text-sm text-red-600">-3% this month</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3.2%</div>
                    <div className="text-sm text-green-600">+0.5% this month</div>
                </CardContent>
            </Card>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Example of cards used in a grid layout for dashboard metrics.',
            },
        },
    },
};

// All variants showcase
export const AllVariants: Story = {
    render: () => (
        <div className="grid grid-cols-2 gap-4 w-[700px]">
            <Card>
                <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>Standard card variant</CardDescription>
                </CardHeader>
                <CardContent>Default styling with standard background and border.</CardContent>
            </Card>

            <Card variant="outline">
                <CardHeader>
                    <CardTitle>Outline Card</CardTitle>
                    <CardDescription>Outline variant</CardDescription>
                </CardHeader>
                <CardContent>Transparent background with border only.</CardContent>
            </Card>

            <Card variant="gradient">
                <CardHeader>
                    <CardTitle>Gradient Card</CardTitle>
                    <CardDescription>Gradient variant</CardDescription>
                </CardHeader>
                <CardContent>Subtle gradient background for visual interest.</CardContent>
            </Card>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-lg">
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Glass Card</CardTitle>
                        <CardDescription>Glass morphism variant</CardDescription>
                    </CardHeader>
                    <CardContent>Glass effect with backdrop blur.</CardContent>
                </Card>
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available card variants displayed together for comparison.',
            },
        },
    },
};

// Interactive playground
export const Playground: Story = {
    render: (args) => (
        <Card {...args} className="w-[350px]">
            <CardHeader>
                <CardTitle>Playground Card</CardTitle>
                <CardDescription>Interactive card for testing configurations</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Use the controls to test different card configurations.</p>
            </CardContent>
            <CardFooter>
                <Button>Action Button</Button>
            </CardFooter>
        </Card>
    ),
    args: {
        variant: 'default',
        size: 'default',
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different card configurations.',
            },
        },
    },
};


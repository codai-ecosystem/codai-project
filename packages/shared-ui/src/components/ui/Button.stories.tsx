import React from 'react'
import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonProps } from './Button';
import { ChevronRight, Download, Heart, Settings, Trash2, User } from 'lucide-react';

const meta: Meta<typeof Button> = {
    title: 'UI Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A versatile button component with multiple variants, sizes, and states. Built with class-variance-authority for consistent styling.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning', 'info', 'gradient', 'glass'],
            description: 'The visual variant of the button',
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
            description: 'The size of the button',
        },
        loading: {
            control: 'boolean',
            description: 'Shows loading spinner when true',
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the button when true',
        },
        asChild: {
            control: 'boolean',
            description: 'When true, renders as a Slot component',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
    args: {
        children: 'Button',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Delete',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        children: 'Link',
    },
};

export const Success: Story = {
    args: {
        variant: 'success',
        children: 'Success',
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        children: 'Warning',
    },
};

export const Info: Story = {
    args: {
        variant: 'info',
        children: 'Info',
    },
};

export const Gradient: Story = {
    args: {
        variant: 'gradient',
        children: 'Gradient',
    },
};

export const Glass: Story = {
    args: {
        variant: 'glass',
        children: 'Glass',
    },
};

// Size variants
export const Small: Story = {
    args: {
        size: 'sm',
        children: 'Small',
    },
};

export const Large: Story = {
    args: {
        size: 'lg',
        children: 'Large',
    },
};

export const ExtraLarge: Story = {
    args: {
        size: 'xl',
        children: 'Extra Large',
    },
};

// Icon variants
export const Icon: Story = {
    args: {
        size: 'icon',
        children: <Settings className="h-4 w-4" />,
    },
};

export const SmallIcon: Story = {
    args: {
        size: 'icon-sm',
        children: <User className="h-3 w-3" />,
    },
};

export const LargeIcon: Story = {
    args: {
        size: 'icon-lg',
        children: <Heart className="h-5 w-5" />,
    },
};

// With icons
export const WithLeftIcon: Story = {
    args: {
        children: 'Download',
        leftIcon: <Download className="h-4 w-4" />,
    },
};

export const WithRightIcon: Story = {
    args: {
        children: 'Continue',
        rightIcon: <ChevronRight className="h-4 w-4" />,
    },
};

export const WithBothIcons: Story = {
    args: {
        children: 'Save',
        leftIcon: <Download className="h-4 w-4" />,
        rightIcon: <ChevronRight className="h-4 w-4" />,
    },
};

// States
export const Loading: Story = {
    args: {
        loading: true,
        children: 'Loading...',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled',
    },
};

export const LoadingDisabled: Story = {
    args: {
        loading: true,
        disabled: true,
        children: 'Processing...',
    },
};

// Complex examples
export const DestructiveWithIcon: Story = {
    args: {
        variant: 'destructive',
        children: 'Delete Account',
        leftIcon: <Trash2 className="h-4 w-4" />,
    },
};

export const GradientLoading: Story = {
    args: {
        variant: 'gradient',
        loading: true,
        children: 'Processing Payment...',
    },
};

// All variants showcase
export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="glass">Glass</Button>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available button variants displayed together for comparison.',
            },
        },
    },
};

// All sizes showcase
export const AllSizes: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon-sm"><User className="h-3 w-3" /></Button>
            <Button size="icon"><Settings className="h-4 w-4" /></Button>
            <Button size="icon-lg"><Heart className="h-5 w-5" /></Button>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available button sizes displayed together for comparison.',
            },
        },
    },
};

// Interactive playground
export const Playground: Story = {
    args: {
        variant: 'default',
        size: 'default',
        children: 'Playground Button',
        loading: false,
        disabled: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different button configurations.',
            },
        },
    },
};


import type { Meta, StoryObj } from '@storybook/react';
import { Input, InputProps } from './Input';
import { Search, Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react';
import React, { useState } from 'react';

const meta: Meta<typeof Input> = {
    title: 'UI Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A flexible input component with support for various types, states, and styling options.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'file'],
            description: 'The type of input',
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text',
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the input when true',
        },
        required: {
            control: 'boolean',
            description: 'Makes the input required',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const WithValue: Story = {
    args: {
        value: 'Sample text',
        placeholder: 'Enter text...',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled input',
        disabled: true,
    },
};

export const Required: Story = {
    args: {
        placeholder: 'Required field',
        required: true,
    },
};

// Input types
export const Email: Story = {
    args: {
        type: 'email',
        placeholder: 'Enter your email...',
    },
};

export const Password: Story = {
    args: {
        type: 'password',
        placeholder: 'Enter password...',
    },
};

export const Number: Story = {
    args: {
        type: 'number',
        placeholder: 'Enter number...',
    },
};

export const SearchInput: Story = {
    args: {
        type: 'search',
        placeholder: 'Search...',
    },
};

export const Tel: Story = {
    args: {
        type: 'tel',
        placeholder: 'Enter phone number...',
    },
};

export const URL: Story = {
    args: {
        type: 'url',
        placeholder: 'Enter URL...',
    },
};

export const Date: Story = {
    args: {
        type: 'date',
    },
};

export const Time: Story = {
    args: {
        type: 'time',
    },
};

export const File: Story = {
    args: {
        type: 'file',
    },
};

// Styled examples
export const WithCustomStyling: Story = {
    args: {
        placeholder: 'Custom styled input',
        className: 'border-2 border-blue-500 focus:border-blue-700 bg-blue-50 dark:bg-blue-950',
    },
};

export const LargeInput: Story = {
    args: {
        placeholder: 'Large input',
        className: 'h-12 text-lg px-4',
    },
};

export const SmallInput: Story = {
    args: {
        placeholder: 'Small input',
        className: 'h-8 text-sm px-2',
    },
};

// Form examples with labels
export const WithLabel: Story = {
    render: () => (
        <div className="space-y-2">
            <label htmlFor="email-input" className="text-sm font-medium">
                Email Address
            </label>
            <Input
                id="email-input"
                type="email"
                placeholder="Enter your email..."
                required
            />
        </div>
    ),
};

export const WithErrorState: Story = {
    render: () => (
        <div className="space-y-2">
            <label htmlFor="error-input" className="text-sm font-medium text-red-600">
                Email Address *
            </label>
            <Input
                id="error-input"
                type="email"
                placeholder="Enter your email..."
                className="border-red-500 focus:border-red-700 bg-red-50 dark:bg-red-950"
                required
            />
            <p className="text-sm text-red-600">Please enter a valid email address</p>
        </div>
    ),
};

export const WithSuccessState: Story = {
    render: () => (
        <div className="space-y-2">
            <label htmlFor="success-input" className="text-sm font-medium text-green-600">
                Email Address
            </label>
            <Input
                id="success-input"
                type="email"
                value="user@example.com"
                className="border-green-500 focus:border-green-700 bg-green-50 dark:bg-green-950"
            />
            <p className="text-sm text-green-600">Email address is valid</p>
        </div>
    ),
};

// Interactive examples
export const PasswordToggle: Story = {
    render: () => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="space-y-2">
                <label htmlFor="password-toggle" className="text-sm font-medium">
                    Password
                </label>
                <div className="relative">
                    <Input
                        id="password-toggle"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password..."
                        className="pr-10"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
        );
    },
};

export const SearchWithIcon: Story = {
    render: () => (
        <div className="space-y-2">
            <label htmlFor="search-icon" className="text-sm font-medium">
                Search
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                    id="search-icon"
                    type="search"
                    placeholder="Search..."
                    className="pl-10"
                />
            </div>
        </div>
    ),
};

// Form group example
export const LoginForm: Story = {
    render: () => (
        <div className="space-y-4 w-80">
            <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email..."
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password..."
                        className="pl-10"
                        required
                    />
                </div>
            </div>
        </div>
    ),
};

// All input types showcase
export const AllTypes: Story = {
    render: () => (
        <div className="space-y-4 w-80">
            <div className="grid grid-cols-1 gap-3">
                <Input type="text" placeholder="Text input" />
                <Input type="email" placeholder="Email input" />
                <Input type="password" placeholder="Password input" />
                <Input type="number" placeholder="Number input" />
                <Input type="tel" placeholder="Phone input" />
                <Input type="url" placeholder="URL input" />
                <Input type="search" placeholder="Search input" />
                <Input type="date" />
                <Input type="time" />
                <Input type="file" />
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available input types displayed together for comparison.',
            },
        },
    },
};

// Interactive playground
export const Playground: Story = {
    args: {
        type: 'text',
        placeholder: 'Playground input...',
        disabled: false,
        required: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test different input configurations.',
            },
        },
    },
};

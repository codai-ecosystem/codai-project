/**
 * 🔧 Fixed Test Component - Phase 2 Testing Infrastructure
 * A properly fixed version of TestComponent to resolve React rendering issues
 */

import React from 'react';

export interface FixedTestComponentProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

const FixedTestComponent: React.FC<FixedTestComponentProps> = ({
    title,
    description,
    children
}) => {
    return (
        <div className="p-4 test-component" data-testid="fixed-test-component">
            <h2 className="text-xl font-bold mb-2" data-testid="fixed-test-component-title">
                {title}
            </h2>
            {description && (
                <p className="text-gray-600 mb-4" data-testid="fixed-test-component-description">
                    {description}
                </p>
            )}
            {children && (
                <div className="mt-4" data-testid="fixed-test-component-children">
                    {children}
                </div>
            )}
        </div>
    );
};

FixedTestComponent.displayName = 'FixedTestComponent';

export default FixedTestComponent;

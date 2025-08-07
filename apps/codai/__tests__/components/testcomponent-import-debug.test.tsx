/**
 * 🧪 TestComponent Import Debug - Phase 2 Investigation
 * Testing if the TestComponent import itself is causing the issue
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// First test with inline component
const InlineTestComponent = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};

describe('TestComponent Import Debug', () => {
  it('works with inline component', () => {
    render(<InlineTestComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('works with inline component and description', () => {
    render(<InlineTestComponent title="Test Title" description="Test Description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Plus, Upload, Sparkles } from 'lucide-react';

function ComponentWithIcons() {
  return (
    <div>
      <h2>Memory Actions</h2>
      <button>
        <Plus className="w-5 h-5" />
        Add Memory
      </button>
      <button>
        <Upload className="w-5 h-5" />
        Bulk Import
      </button>
      <button>
        <Sparkles className="w-5 h-5" />
        AI Assist
      </button>
    </div>
  );
}

describe('Component With Icons Test', () => {
  it('should render with lucide icons', () => {
    render(<ComponentWithIcons />);
    expect(screen.getByText('Memory Actions')).toBeInTheDocument();
    expect(screen.getByText('Add Memory')).toBeInTheDocument();
    expect(screen.getByText('Bulk Import')).toBeInTheDocument();
    expect(screen.getByText('AI Assist')).toBeInTheDocument();
  });
});

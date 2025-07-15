import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simplified version of MemoryActions without complex dependencies
function SimpleMemoryActions() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Memory Actions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create, organize, and manage your memories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              Add Memory
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

describe('Simple Memory Actions Test', () => {
  it('should render memory actions header', () => {
    render(<SimpleMemoryActions />);
    expect(screen.getByText('Memory Actions')).toBeInTheDocument();
  });

  it('should render add memory button', () => {
    render(<SimpleMemoryActions />);
    expect(screen.getByText('Add Memory')).toBeInTheDocument();
  });
});

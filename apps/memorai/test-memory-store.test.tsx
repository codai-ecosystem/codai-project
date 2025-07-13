import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the memory store exactly like in the real test
const mockMemoryStore = vi.hoisted(() => ({
  addMemory: vi.fn(),
  isLoading: false,
}));

vi.mock('./src/stores/memory-store', () => ({
  useMemoryStore: () => mockMemoryStore,
}));

// Import after mocking
import { useMemoryStore } from './src/stores/memory-store';

function ComponentWithMemoryStore() {
  const { addMemory, isLoading } = useMemoryStore();

  return (
    <div>
      <h2>Memory Actions</h2>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <button onClick={() => addMemory('test')}>
        Add Memory
      </button>
    </div>
  );
}

describe('Component With Memory Store Test', () => {
  it('should render with memory store', () => {
    render(<ComponentWithMemoryStore />);
    expect(screen.getByText('Memory Actions')).toBeInTheDocument();
    expect(screen.getByText('Loading: No')).toBeInTheDocument();
    expect(screen.getByText('Add Memory')).toBeInTheDocument();
  });
});

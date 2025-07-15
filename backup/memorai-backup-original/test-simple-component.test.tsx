import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function SimpleComponent() {
  return <div>Hello Test</div>;
}

describe('Simple Component Test', () => {
  it('should render simple text', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});

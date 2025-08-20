import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Input } from '../input';

describe('Input Component', () => {
  test('renders with basic props', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  test('handles value changes', async () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello World');

    expect(handleChange).toHaveBeenCalled();
  });

  test('applies custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  test('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

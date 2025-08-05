import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

console.log('Testing actual Button component rendering...');

// Simple test to see what gets rendered
const result = render(React.createElement(Button, {}, 'Test Button'));
const button = result.container.querySelector('button');

console.log('Button element found:', !!button);
console.log('Button className:', button?.className || 'NO CLASSNAME');
console.log('Button outerHTML:', button?.outerHTML || 'NO BUTTON');

// Clean up
result.unmount();

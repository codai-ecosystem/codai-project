import React from 'react';

interface TestComponentProps {
  title: string;
  description?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ title, description }) => {
  return (
    <div className="p-4 test-component" data-testid="test-component">
      <h2 className="text-xl font-bold" data-testid="test-component-title">{title}</h2>
      {description && (
        <p className="text-gray-600 mt-2" data-testid="test-component-description">
          {description}
        </p>
      )}
    </div>
  );
};

TestComponent.displayName = 'TestComponent';

export default TestComponent;
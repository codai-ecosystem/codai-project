import React from 'react';

interface TestComponentProps {
  title: string;
  description?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ title, description }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};

export default TestComponent;
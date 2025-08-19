import React from 'react';

interface WorkingComponentProps {
  title: string;
  description?: string;
}

const WorkingComponent: React.FC<WorkingComponentProps> = ({ title, description }) => {
  return (
    <div className="p-4 working-component" data-testid="working-component">
      <h2 className="text-xl font-bold" data-testid="working-component-title">{title}</h2>
      {description && (
        <p className="text-gray-600 mt-2" data-testid="working-component-description">
          {description}
        </p>
      )}
    </div>
  );
};

WorkingComponent.displayName = 'WorkingComponent';

export default WorkingComponent;

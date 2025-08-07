import React from 'react';

interface WorkingComponentProps {
  title: string;
  description?: string;
}

const WorkingComponent: React.FC<WorkingComponentProps> = ({ title, description }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};

export default WorkingComponent;

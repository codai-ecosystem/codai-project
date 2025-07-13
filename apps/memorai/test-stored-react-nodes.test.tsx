import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Plus, Upload, Sparkles } from 'lucide-react';

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode  // This could be the issue
}

function ComponentWithStoredReactNodes() {
  const quickActions: QuickAction[] = [
    {
      id: 'add-memory',
      title: 'Add Memory',
      icon: <Plus className="w-6 h-6" />,  // Storing JSX in object
    },
    {
      id: 'bulk-import',
      title: 'Bulk Import',
      icon: <Upload className="w-6 h-6" />,
    },
    {
      id: 'ai-assist',
      title: 'AI Assist',
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  return (
    <div>
      <h2>Memory Actions</h2>
      {quickActions.map((action) => (
        <button key={action.id}>
          {action.icon}
          {action.title}
        </button>
      ))}
    </div>
  );
}

describe('Component With Stored React Nodes Test', () => {
  it('should render with react nodes stored in objects', () => {
    render(<ComponentWithStoredReactNodes />);
    expect(screen.getByText('Memory Actions')).toBeInTheDocument();
    expect(screen.getByText('Add Memory')).toBeInTheDocument();
    expect(screen.getByText('Bulk Import')).toBeInTheDocument();
    expect(screen.getByText('AI Assist')).toBeInTheDocument();
  });
});

interface ActionPanelProps {
  title: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  className?: string;
}

export default function ActionPanel({ title, actions = [], className = '' }: ActionPanelProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full px-4 py-2 rounded-xl font-medium transition-all ${action.variant === 'primary'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

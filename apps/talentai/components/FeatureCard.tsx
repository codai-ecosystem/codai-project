import React from 'react'
interface FeatureCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  feature?: {
    id: string;
    title: string;
    description: string;
    status: string;
    icon: string;
    progress: number;
  };
  colorScheme?: any;
  delay?: number;
  className?: string;
}

export default function FeatureCard({ title, description, icon, feature, className = '' }: FeatureCardProps) {
  const displayTitle = title || feature?.title || '';
  const displayDescription = description || feature?.description || '';

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 ${className}`}>
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{displayTitle}</h3>
      <p className="text-gray-400">{displayDescription}</p>
      {feature && (
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{feature.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${feature.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


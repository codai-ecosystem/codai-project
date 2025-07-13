import React, { useState } from 'react';
import { Plus, Folder, MessageCircle, Settings, Terminal, Activity } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: string;
  conversations: number;
  status: 'active' | 'building' | 'completed' | 'idle';
  icon: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    type: 'web',
    conversations: 3,
    status: 'active',
    icon: '📦'
  },
  {
    id: '2',
    name: 'AI Chat Bot',
    type: 'ai',
    conversations: 5,
    status: 'completed',
    icon: '🤖'
  },
  {
    id: '3',
    name: 'Dashboard Analytics',
    type: 'data',
    conversations: 2,
    status: 'building',
    icon: '📊'
  }
];

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'active': return 'bg-blue-500';
    case 'building': return 'bg-yellow-500 animate-pulse';
    case 'completed': return 'bg-green-500';
    case 'idle': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const getProjectBorderColor = (status: Project['status']) => {
  switch (status) {
    case 'active': return 'border-blue-500/30 bg-blue-500/20';
    case 'building': return 'border-yellow-500/30 bg-yellow-500/10';
    case 'completed': return 'border-green-500/30 bg-green-500/10';
    case 'idle': return 'border-white/10 bg-white/5';
    default: return 'border-white/10 bg-white/5';
  }
};

export const ProjectSidebar: React.FC = () => {
  const [activeProject, setActiveProject] = useState<string>('1');

  return (
    <aside className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* Projects Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Projects</h2>
          <button className="p-1 rounded hover:bg-white/10 transition-colors">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <button className="w-full p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center justify-center space-x-2">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {mockProjects.map((project) => (
          <div
            key={project.id}
            className={`rounded-lg p-3 transition-all cursor-pointer ${activeProject === project.id
                ? getProjectBorderColor(project.status) + ' border'
                : 'border border-transparent hover:border-white/10 hover:bg-white/5'
              }`}
            onClick={() => setActiveProject(project.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{project.icon}</span>
                <div>
                  <h3 className="font-medium text-white text-sm">{project.name}</h3>
                  <p className="text-xs text-gray-400">{project.conversations} conversations</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {project.status === 'active' && (
                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                    1
                  </span>
                )}
                <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-400">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>

        <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-400">
          <Terminal className="w-4 h-4" />
          <span className="text-sm">Terminal</span>
        </button>
      </div>
    </aside>
  );
};

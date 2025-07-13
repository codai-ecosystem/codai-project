import React, { useState, useEffect } from 'react';
import { MessageCircle, Terminal, Clock, Activity } from 'lucide-react';

interface StatusItem {
  id: string;
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'loading';
  icon?: React.ReactNode;
}

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeView, setActiveView] = useState<'chat' | 'terminal'>('chat');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const statusItems: StatusItem[] = [
    {
      id: 'build',
      label: 'Building',
      value: '75%',
      status: 'loading',
      icon: <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
    },
    {
      id: 'tests',
      label: 'Tests',
      value: '42/45 Passed',
      status: 'success',
      icon: <div className="w-2 h-2 rounded-full bg-green-500"></div>
    },
    {
      id: 'deploy',
      label: 'Deploy Ready',
      value: '',
      status: 'info',
      icon: <div className="w-2 h-2 rounded-full bg-gray-500"></div>
    }
  ];

  return (
    <footer className="h-8 bg-black/30 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 text-xs">
      {/* Left Side - Status Items */}
      <div className="flex items-center space-x-6">
        {statusItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            {item.icon}
            <span className="text-gray-300">
              {item.label}
              {item.value && `: ${item.value}`}
            </span>
          </div>
        ))}
      </div>

      {/* Right Side - Controls and Info */}
      <div className="flex items-center space-x-4 text-gray-400">
        {/* View Toggle Buttons */}
        <button
          onClick={() => setActiveView('chat')}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${activeView === 'chat'
              ? 'bg-blue-500/20 text-blue-400'
              : 'hover:bg-white/10'
            }`}
        >
          <MessageCircle className="w-3 h-3" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveView('terminal')}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${activeView === 'terminal'
              ? 'bg-blue-500/20 text-blue-400'
              : 'hover:bg-white/10'
            }`}
        >
          <Terminal className="w-3 h-3" />
          <span>Terminal</span>
        </button>

        {/* App Info */}
        <span>AIDE v2.0.0</span>
        <span>Connected</span>

        {/* Clock */}
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{currentTime}</span>
        </div>
      </div>
    </footer>
  );
};

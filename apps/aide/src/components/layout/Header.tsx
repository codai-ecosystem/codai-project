import { Settings, Activity } from 'lucide-react';
import type { JSX } from 'react';

export function Header(): JSX.Element {
  return (
    <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
      {/* AIDE Branding */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <h1 className="text-xl font-bold text-white">AIDE</h1>
        <span className="text-gray-400 text-sm">AI Development Environment</span>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Connected</span>
        </div>
      </div>
    </header>
  );
}

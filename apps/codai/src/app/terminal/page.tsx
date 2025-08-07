'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Square,
  RotateCcw,
  Download,
  Copy,
  Settings,
  Plus,
  X,
  Minimize2,
  Maximize2,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  History,
  Zap,
  Monitor,
  Server,
  Database,
  Cloud
} from 'lucide-react';

interface TerminalTab {
  id: string;
  title: string;
  type: 'local' | 'ssh' | 'docker' | 'cloud';
  status: 'running' | 'stopped' | 'connecting';
  path: string;
}

interface CommandHistory {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  exitCode: number;
  duration: number;
}

const initialTabs: TerminalTab[] = [
  {
    id: '1',
    title: 'Local Terminal',
    type: 'local',
    status: 'running',
    path: '/workspace/codai-project'
  },
  {
    id: '2',
    title: 'Production Server',
    type: 'ssh',
    status: 'running',
    path: '/var/www/codai'
  }
];

const commandHistory: CommandHistory[] = [
  {
    id: '1',
    command: 'npm run build',
    output: '✓ Compiled successfully\n✓ Build completed in 12.3s\n✓ Generated 145 static pages',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    exitCode: 0,
    duration: 12300
  },
  {
    id: '2',
    command: 'git status',
    output: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    exitCode: 0,
    duration: 150
  },
  {
    id: '3',
    command: 'docker ps',
    output: 'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                    NAMES\n5a8b9c1d2e3f   codai:latest   "npm start"              2 hours ago     Up 2 hours     0.0.0.0:3000->3000/tcp   codai-app',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    exitCode: 0,
    duration: 890
  }
];

const predefinedCommands = [
  { category: 'Git', commands: ['git status', 'git log --oneline', 'git branch', 'git pull origin main'] },
  { category: 'NPM', commands: ['npm install', 'npm run build', 'npm run dev', 'npm test'] },
  { category: 'Docker', commands: ['docker ps', 'docker images', 'docker logs', 'docker-compose up'] },
  { category: 'System', commands: ['ls -la', 'pwd', 'ps aux', 'df -h'] }
];

export default function TerminalPage() {
  const [tabs, setTabs] = useState<TerminalTab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState('1');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([
    'Welcome to CODAI Terminal',
    'Type help for available commands',
    'user@codai:~/workspace/codai-project$ '
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('dark');

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = async () => {
    if (!command.trim()) return;

    setIsRunning(true);
    const newOutput = [...output, `user@codai:~/workspace/codai-project$ ${command}`];
    setOutput(newOutput);
    setCommand('');

    // Simulate command execution
    setTimeout(() => {
      let commandOutput = '';

      switch (command.toLowerCase()) {
        case 'help':
          commandOutput = `Available commands:
  ls          - List directory contents
  pwd         - Print working directory
  git status  - Show git repository status
  npm run dev - Start development server
  docker ps   - List running containers
  clear       - Clear terminal
  help        - Show this help message`;
          break;
        case 'ls':
          commandOutput = `apps/     packages/     scripts/     docker-compose.yml
node_modules/     README.md     package.json     .gitignore`;
          break;
        case 'pwd':
          commandOutput = '/workspace/codai-project';
          break;
        case 'git status':
          commandOutput = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   apps/codai/src/app/terminal/page.tsx

no changes added to commit (use "git add ." or "git commit -a")`;
          break;
        case 'npm run dev':
          commandOutput = `> codai@1.0.0 dev
> next dev

  ▲ Next.js 15.4.5
  - Local:        http://localhost:4001
  - Environments: .env.local

 ✓ Ready in 2.3s
 ○ Compiling / ...
 ✓ Compiled / in 1.2s (356 modules)`;
          break;
        case 'docker ps':
          commandOutput = `CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS         PORTS                              NAMES
5a8b9c1d2e3f   codai:latest            "npm start"              2 hours ago     Up 2 hours     0.0.0.0:4001->3000/tcp            codai-app
7b9c2d4e5f6a   postgres:13             "docker-entrypoint.s…"   3 hours ago     Up 3 hours     0.0.0.0:5432->5432/tcp            codai-db
8c0d3e5f7a1b   redis:alpine            "docker-entrypoint.s…"   3 hours ago     Up 3 hours     0.0.0.0:6379->6379/tcp            codai-cache`;
          break;
        case 'clear':
          setOutput(['user@codai:~/workspace/codai-project$ ']);
          setIsRunning(false);
          return;
        default:
          commandOutput = `bash: ${command}: command not found`;
      }

      setOutput(prev => [...prev, commandOutput, 'user@codai:~/workspace/codai-project$ ']);
      setIsRunning(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const addNewTab = () => {
    const newTab: TerminalTab = {
      id: Date.now().toString(),
      title: `Terminal ${tabs.length + 1}`,
      type: 'local',
      status: 'running',
      path: '/workspace/codai-project'
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const getTabIcon = (type: TerminalTab['type']) => {
    switch (type) {
      case 'local': return <Monitor className="w-4 h-4" />;
      case 'ssh': return <Server className="w-4 h-4" />;
      case 'docker': return <Database className="w-4 h-4" />;
      case 'cloud': return <Cloud className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-80">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terminal</h1>
              <p className="text-gray-600 mt-2">Integrated development terminal with multiple environments</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => setShowCommands(!showCommands)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Zap className="w-4 h-4" />
                <span>Commands</span>
              </button>
              <button
                onClick={addNewTab}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Terminal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Main Terminal */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Terminal Header with Tabs */}
              <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-1">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer ${activeTab === tab.id
                          ? 'bg-white border border-gray-200 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {getTabIcon(tab.type)}
                      <span className="text-sm font-medium">{tab.title}</span>
                      <div className={`w-2 h-2 rounded-full ${tab.status === 'running' ? 'bg-green-400' :
                          tab.status === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                      {tabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={12}>12px</option>
                    <option value={14}>14px</option>
                    <option value={16}>16px</option>
                    <option value={18}>18px</option>
                  </select>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="high-contrast">High Contrast</option>
                  </select>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Terminal Content */}
              <div className={`${theme === 'dark' ? 'bg-gray-900 text-green-400' : 'bg-white text-gray-900'}`}>
                <div
                  ref={terminalRef}
                  className="p-4 h-96 overflow-y-auto font-mono"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {output.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                      <span>Executing...</span>
                    </div>
                  )}
                </div>

                {/* Command Input */}
                <div className="border-t border-gray-700 p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">user@codai:~/workspace/codai-project$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`flex-1 bg-transparent outline-none font-mono ${theme === 'dark' ? 'text-green-400' : 'text-gray-900'
                        }`}
                      style={{ fontSize: `${fontSize}px` }}
                      placeholder="Type your command here..."
                      disabled={isRunning}
                    />
                    <button
                      onClick={executeCommand}
                      disabled={isRunning || !command.trim()}
                      className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Command History */}
            {showHistory && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Command History</h3>
                <div className="space-y-3">
                  {commandHistory.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-blue-600">{item.command}</code>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${item.exitCode === 0 ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                          <button
                            onClick={() => setCommand(item.command)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()} • {item.duration}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Commands */}
            {showCommands && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Commands</h3>
                <div className="space-y-4">
                  {predefinedCommands.map((category) => (
                    <div key={category.category}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h4>
                      <div className="space-y-1">
                        {category.commands.map((cmd) => (
                          <button
                            key={cmd}
                            onClick={() => setCommand(cmd)}
                            className="block w-full text-left px-3 py-2 text-sm font-mono text-gray-600 hover:bg-gray-50 rounded-lg"
                          >
                            {cmd}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terminal Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Session</span>
                  <span className="text-gray-900 font-medium">
                    {tabs.find(tab => tab.id === activeTab)?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Path</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {tabs.find(tab => tab.id === activeTab)?.path}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commands Run</span>
                  <span className="text-gray-900 font-medium">{commandHistory.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

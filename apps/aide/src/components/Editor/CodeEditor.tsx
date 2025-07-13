import React, { useRef, useEffect, useState } from 'react';
import { X, Save, Undo, Redo, Search, Replace, Settings } from 'lucide-react';

interface FileTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
}

interface CodeEditorProps {
  activeFile?: FileTab;
  onFileClose?: (fileId: string) => void;
  onFileSave?: (fileId: string, content: string) => void;
}

// Mock file content
const getFileContent = (path: string): string => {
  switch (path) {
    case '/src/components/Auth/LoginForm.tsx':
      return `import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};`;

    case '/src/components/Layout/Header.tsx':
      return `import React from 'react';
import { Settings, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <h1 className="text-xl font-bold text-white">AIDE</h1>
        <span className="text-gray-400 text-sm">AI Development Environment</span>
      </div>
      
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
};`;

    default:
      return `// File: ${path}
// This is a placeholder file content

export default function Component() {
  return (
    <div>
      <h1>Welcome to AIDE</h1>
      <p>This file contains example content for ${path}</p>
    </div>
  );
}`;
  }
};

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return 'typescript';
    case 'ts':
      return 'typescript';
    case 'js':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeFile,
  onFileClose,
  onFileSave
}) => {
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeFile) {
      const fileContent = getFileContent(activeFile.path);
      setContent(fileContent);
      setIsDirty(false);
    }
  }, [activeFile]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (activeFile && onFileSave) {
      onFileSave(activeFile.id, content);
      setIsDirty(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/10 backdrop-blur-md">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-purple-400/20 to-blue-400/20 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-white font-semibold mb-2">No file selected</h3>
          <p className="text-gray-400 text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black/10 backdrop-blur-md">
      {/* Tab Bar */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="flex items-center">
          <div className="flex items-center px-4 py-3 border-r border-white/10 bg-black/10">
            <span className="text-white text-sm font-medium mr-2">
              {activeFile.name}
              {isDirty && <span className="text-yellow-400 ml-1">●</span>}
            </span>
            <button
              onClick={() => onFileClose?.(activeFile.id)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="border-b border-white/10 bg-black/20 px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="p-2 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/10" />

          <button className="p-2 rounded hover:bg-white/10 transition-colors">
            <Undo className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 rounded hover:bg-white/10 transition-colors">
            <Redo className="w-4 h-4 text-gray-400" />
          </button>

          <div className="w-px h-6 bg-white/10" />

          <button className="p-2 rounded hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 rounded hover:bg-white/10 transition-colors">
            <Replace className="w-4 h-4 text-gray-400" />
          </button>

          <div className="flex-1" />

          <span className="text-xs text-gray-400">
            {getLanguageFromPath(activeFile.path)}
          </span>

          <button className="p-2 rounded hover:bg-white/10 transition-colors">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
          style={{
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            lineHeight: '1.5',
            tabSize: 2
          }}
          placeholder="Start typing..."
          spellCheck={false}
        />

        {/* Line numbers could be added here */}
        <div className="absolute top-0 left-0 w-12 h-full bg-black/20 border-r border-white/10 pointer-events-none">
          <div className="p-4 text-xs text-gray-500 font-mono">
            {content.split('\n').map((_, index) => (
              <div key={index} className="h-[1.5em] text-right pr-2">
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="ml-12">
          {/* This creates space for line numbers */}
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-white/10 bg-black/20 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Lines: {content.split('\n').length}</span>
            <span>Characters: {content.length}</span>
            <span>Language: {getLanguageFromPath(activeFile.path)}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>UTF-8</span>
            <span>LF</span>
            {isDirty && <span className="text-yellow-400">● Unsaved</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

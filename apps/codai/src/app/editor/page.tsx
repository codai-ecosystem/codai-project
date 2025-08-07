'use client';

import React, { useState } from 'react';
import {
  Code2,
  Play,
  Save,
  Download,
  Upload,
  Settings,
  Brain,
  FileText,
  FolderTree,
  Search,
  Terminal,
  GitBranch,
  Bug,
  Lightbulb,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';

const languages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'
];

const themes = [
  'Dark', 'Light', 'Monokai', 'Solarized', 'GitHub', 'VS Code', 'Atom', 'Material'
];

const codeTemplates = [
  {
    name: 'React Component', language: 'tsx', code: `import React from 'react';

interface Props {
  title: string;
}

const MyComponent: React.FC<Props> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;` },
  {
    name: 'Express API', language: 'javascript', code: `const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});` },
  {
    name: 'Python Function', language: 'python', code: `def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Example usage
result = calculate_fibonacci(10)
print(f"The 10th Fibonacci number is: {result}")` }
];

export default function EditorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('TypeScript');
  const [selectedTheme, setSelectedTheme] = useState('Dark');
  const [code, setCode] = useState(codeTemplates[0].code);
  const [showPreview, setShowPreview] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [showFileTree, setShowFileTree] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-white ml-80">
      {/* Header */}
      <div className="border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code2 className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-semibold">AI-Powered Code Editor</h1>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* File Tree Sidebar */}
        {showFileTree && (
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">File Explorer</h3>
                <button
                  onClick={() => setShowFileTree(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <FolderTree className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">src</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm">App.tsx</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">index.css</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">utils.ts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800">
            <div className="px-4 py-2 bg-gray-700 border-r border-gray-600 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-green-400" />
              <span className="text-sm">MyComponent.tsx</span>
              <button className="text-gray-400 hover:text-white ml-2">×</button>
            </div>
            <div className="px-4 py-2 hover:bg-gray-700 border-r border-gray-600 flex items-center space-x-2 cursor-pointer">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm">utils.ts</span>
            </div>
          </div>

          <div className="flex flex-1">
            {/* Code Editor */}
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none"
                style={{ lineHeight: '1.5' }}
                spellCheck={false}
              />

              {/* Line Numbers */}
              <div className="absolute left-0 top-0 p-4 text-gray-500 font-mono text-sm pointer-events-none">
                {code.split('\n').map((_, index) => (
                  <div key={index} style={{ lineHeight: '1.5' }}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Sidebar */}
            {showAI && (
              <div className="w-80 bg-gray-800 border-l border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <h3 className="font-medium">AI Assistant</h3>
                    </div>
                    <button
                      onClick={() => setShowAI(false)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ask AI to help with your code..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-purple-400">Suggestions</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Add error handling</p>
                            <p className="text-xs text-gray-400">Consider adding try-catch blocks</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Bug className="w-4 h-4 text-red-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Potential issue found</p>
                            <p className="text-xs text-gray-400">Missing dependency in useEffect</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-blue-400">Code Templates</h4>
                    <div className="space-y-2">
                      {codeTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setCode(template.code)}
                          className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                        >
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-gray-400">{template.language}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          <div className="h-48 bg-gray-800 border-t border-gray-700">
            <div className="flex border-b border-gray-700">
              <button className="px-4 py-2 bg-gray-700 text-sm">Terminal</button>
              <button className="px-4 py-2 hover:bg-gray-700 text-sm">Output</button>
              <button className="px-4 py-2 hover:bg-gray-700 text-sm">Problems</button>
              <button className="px-4 py-2 hover:bg-gray-700 text-sm">Git</button>
            </div>
            <div className="p-4 font-mono text-sm">
              <div className="text-green-400">$ npm run dev</div>
              <div className="text-gray-400">Starting development server...</div>
              <div className="text-blue-400">✓ Local: http://localhost:3000</div>
              <div className="text-gray-400">Ready in 1.2s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-2">
        {!showFileTree && (
          <button
            onClick={() => setShowFileTree(true)}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg"
          >
            <FolderTree className="w-6 h-6" />
          </button>
        )}
        {!showAI && (
          <button
            onClick={() => setShowAI(true)}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center shadow-lg"
          >
            <Brain className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

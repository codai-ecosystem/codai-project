import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Code,
  Settings
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  expanded?: boolean;
  size?: number;
  modified?: Date;
}

const mockFileTree: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    expanded: true,
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        expanded: true,
        children: [
          {
            id: '3',
            name: 'Auth',
            type: 'folder',
            path: '/src/components/Auth',
            children: [
              { id: '4', name: 'LoginForm.tsx', type: 'file', path: '/src/components/Auth/LoginForm.tsx', size: 2400 },
              { id: '5', name: 'SignupForm.tsx', type: 'file', path: '/src/components/Auth/SignupForm.tsx', size: 1800 }
            ]
          },
          {
            id: '6',
            name: 'Layout',
            type: 'folder',
            path: '/src/components/Layout',
            expanded: true,
            children: [
              { id: '7', name: 'Header.tsx', type: 'file', path: '/src/components/Layout/Header.tsx', size: 1200 },
              { id: '8', name: 'Sidebar.tsx', type: 'file', path: '/src/components/Layout/Sidebar.tsx', size: 3600 }
            ]
          }
        ]
      },
      {
        id: '9',
        name: 'hooks',
        type: 'folder',
        path: '/src/hooks',
        children: [
          { id: '10', name: 'useAuth.ts', type: 'file', path: '/src/hooks/useAuth.ts', size: 800 }
        ]
      },
      {
        id: '11',
        name: 'pages',
        type: 'folder',
        path: '/src/pages',
        children: [
          { id: '12', name: 'index.tsx', type: 'file', path: '/src/pages/index.tsx', size: 600 },
          { id: '13', name: 'dashboard.tsx', type: 'file', path: '/src/pages/dashboard.tsx', size: 1400 }
        ]
      }
    ]
  },
  {
    id: '14',
    name: 'public',
    type: 'folder',
    path: '/public',
    children: [
      { id: '15', name: 'favicon.ico', type: 'file', path: '/public/favicon.ico', size: 15086 },
      { id: '16', name: 'logo.png', type: 'file', path: '/public/logo.png', size: 24567 }
    ]
  },
  {
    id: '17',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    size: 892
  },
  {
    id: '18',
    name: 'tsconfig.json',
    type: 'file',
    path: '/tsconfig.json',
    size: 445
  }
];

interface FileExplorerProps {
  onFileSelect?: (file: FileNode) => void;
  selectedFile?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'jsx':
    case 'ts':
    case 'js':
      return <Code className="w-4 h-4 text-blue-400" />;
    case 'json':
      return <Settings className="w-4 h-4 text-yellow-400" />;
    case 'md':
      return <FileText className="w-4 h-4 text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'svg':
      return <File className="w-4 h-4 text-green-400" />;
    default:
      return <File className="w-4 h-4 text-gray-400" />;
  }
};

const FileTreeNode: React.FC<{
  node: FileNode;
  level: number;
  onToggle: (id: string) => void;
  onSelect: (node: FileNode) => void;
  selectedFile?: string;
}> = ({ node, level, onToggle, onSelect, selectedFile }) => {
  const isSelected = selectedFile === node.id;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-white/5 cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/20 border-r-2 border-blue-500' : ''
          }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {node.type === 'folder' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="mr-1 p-0.5 rounded hover:bg-white/10"
          >
            {node.expanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-4 mr-1" />
        )}

        <div className="mr-2">
          {node.type === 'folder' ? (
            node.expanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-400" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </div>

        <span className="text-sm text-white flex-1 truncate">{node.name}</span>

        {node.type === 'file' && node.size && (
          <span className="text-xs text-gray-500 ml-2">
            {formatFileSize(node.size)}
          </span>
        )}
      </div>

      {node.type === 'folder' && node.expanded && node.children && (
        <div>
          {node.children.map(child => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  onFileSelect,
  selectedFile
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>(mockFileTree);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (id: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    setFileTree(updateNode(fileTree));
  };

  const handleFileSelect = (node: FileNode) => {
    if (node.type === 'file') {
      onFileSelect?.(node);
    } else {
      toggleFolder(node.id);
    }
  };

  return (
    <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Explorer</h2>
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded hover:bg-white/10 transition-colors">
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-white/10 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {fileTree.map(node => (
            <FileTreeNode
              key={node.id}
              node={node}
              level={0}
              onToggle={toggleFolder}
              onSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="p-2 border-t border-white/10 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>18 files</span>
          <span>2.1 MB</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ProjectSidebar } from '@/components/layout/ProjectSidebar';
import { EnhancedChatInterface } from '@/components/Chat/EnhancedChatInterface';
import { StatusBar } from '@/components/layout/StatusBar';
import { FileExplorer } from '@/components/FileExplorer/FileExplorer';
import { CodeEditor } from '@/components/Editor/CodeEditor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

interface FileTab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export default function AIDEDashboard() {
  const [activeView, setActiveView] = useState<'chat' | 'code'>('chat');
  const [openFiles, setOpenFiles] = useState<FileTab[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file.id);

      // Check if file is already open
      const existingFile = openFiles.find(f => f.path === file.path);
      if (existingFile) {
        setActiveFileId(existingFile.id);
        setActiveView('code');
        return;
      }

      // Open new file
      const newFile: FileTab = {
        id: file.id,
        name: file.name,
        path: file.path,
        content: '',
        isDirty: false,
        language: file.name.split('.').pop() || 'plaintext'
      };

      setOpenFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
      setActiveView('code');
    }
  };

  const handleFileClose = (fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));

    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[remainingFiles.length - 1].id);
      } else {
        setActiveFileId('');
        setActiveView('chat');
      }
    }
  };

  const handleFileSave = (fileId: string, content: string) => {
    setOpenFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, content, isDirty: false }
          : f
      )
    );
    console.log('Saved file:', fileId, 'with content length:', content.length);
  };

  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Main Layout */}
      <div className="h-full flex flex-col">

        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Projects and File Explorer */}
          <div className="flex">
            <ProjectSidebar />
            {activeView === 'code' && (
              <FileExplorer
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            )}
          </div>

          {/* Main Content - Enhanced Chat or Code Editor */}
          <div className="flex-1 flex flex-col">
            {/* View Toggle */}
            <div className="border-b border-white/10 bg-black/20">
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'chat' | 'code')}>
                <TabsList className="bg-transparent border-b-0">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                    🤖 AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                    💻 Code Editor
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content Based on Active View */}
            {activeView === 'chat' ? (
              <EnhancedChatInterface />
            ) : (
              <CodeEditor
                activeFile={activeFile}
                onFileClose={handleFileClose}
                onFileSave={handleFileSave}
              />
            )}
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />
      </div>
    </div>
  );
}

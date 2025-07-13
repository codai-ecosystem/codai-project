'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCollaborativeEditing, useRealtimeFileSystem, useRealtimeTerminal } from '../hooks/useRealtime';

interface CollaborativeEditorProps {
  fileId: string;
  initialContent?: string;
  language?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

interface CursorPosition {
  line: number;
  column: number;
  userId: string;
  color: string;
}

export function CollaborativeEditor({
  fileId,
  initialContent = '',
  language = 'typescript',
  onChange,
  readOnly = false,
}: CollaborativeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isComposing, setIsComposing] = useState(false);

  const {
    collaborators,
    cursors: realtimeCursors,
    selections,
    broadcastCursorPosition,
    broadcastSelection,
    broadcastEdit,
  } = useCollaborativeEditing(fileId);

  // Convert real-time cursors to display format
  useEffect(() => {
    const cursorPositions: CursorPosition[] = realtimeCursors.map(([userId, position], index) => ({
      line: position.line,
      column: position.column,
      userId,
      color: getCollaboratorColor(userId, index),
    }));
    setCursors(cursorPositions);
  }, [realtimeCursors]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);

    // Don't broadcast while composing (IME input)
    if (!isComposing) {
      broadcastEdit({
        type: 'content_change',
        content: newContent,
        timestamp: Date.now(),
      });
    }
  };

  // Handle cursor position changes
  const handleCursorChange = () => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length - 1;
    const column = lines[lines.length - 1].length;

    broadcastCursorPosition({ line, column });
  };

  // Handle selection changes
  const handleSelectionChange = () => {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const startTextBefore = content.substring(0, start);
      const endTextBefore = content.substring(0, end);
      
      const startLines = startTextBefore.split('\n');
      const endLines = endTextBefore.split('\n');

      const selection = {
        start: {
          line: startLines.length - 1,
          column: startLines[startLines.length - 1].length,
        },
        end: {
          line: endLines.length - 1,
          column: endLines[endLines.length - 1].length,
        },
      };

      broadcastSelection(selection);
    }
  };

  // Get unique color for each collaborator
  const getCollaboratorColor = (userId: string, index: number) => {
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#EC4899', // Pink
      '#6B7280', // Gray
    ];
    return colors[index % colors.length];
  };

  // Render collaborator cursors (simplified for textarea)
  const renderCollaboratorCursors = () => {
    return cursors.map((cursor) => (
      <div
        key={cursor.userId}
        className="absolute pointer-events-none z-10"
        style={{
          borderLeft: `2px solid ${cursor.color}`,
          // This is a simplified positioning - in a real editor you'd calculate exact pixel positions
          top: `${cursor.line * 1.5}rem`,
          left: `${cursor.column * 0.5}rem`,
        }}
      >
        <div
          className="absolute -top-6 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
          style={{ backgroundColor: cursor.color }}
        >
          User {cursor.userId.slice(0, 8)}
        </div>
      </div>
    ));
  };

  return (
    <div className="relative w-full h-full">
      {/* Collaborator indicator */}
      {collaborators.length > 0 && (
        <div className="absolute top-2 right-2 z-20 flex items-center space-x-1">
          <div className="flex -space-x-1">
            {collaborators.slice(0, 5).map(([userId], index) => (
              <div
                key={userId}
                className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: getCollaboratorColor(userId, index) }}
                title={`User ${userId.slice(0, 8)}`}
              >
                {userId.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {collaborators.length > 5 && (
            <span className="text-xs text-gray-500 ml-1">
              +{collaborators.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Editor container */}
      <div className="relative w-full h-full">
        {/* Cursor overlays */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {renderCollaboratorCursors()}
        </div>

        {/* Text editor */}
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onSelect={handleSelectionChange}
          onKeyUp={handleCursorChange}
          onClick={handleCursorChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          readOnly={readOnly}
          className="w-full h-full resize-none border-0 outline-none bg-transparent font-mono text-sm leading-6 p-4"
          style={{
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
            tabSize: 2,
          }}
          placeholder={readOnly ? 'Read-only mode' : 'Start typing...'}
          spellCheck={false}
        />
      </div>

      {/* Real-time activity indicator */}
      {cursors.length > 0 && (
        <div className="absolute bottom-2 left-2 z-20">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {cursors.length} active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Real-time file tree component
export function RealtimeFileTree({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<any[]>([]);
  const { fileChanges, broadcastFileChange } = useRealtimeFileSystem();

  useEffect(() => {
    // Load initial file structure
    // This would connect to your file system API
    setFiles([
      { path: 'src/index.ts', type: 'file' },
      { path: 'src/components/', type: 'directory' },
      { path: 'package.json', type: 'file' },
    ]);
  }, [projectId]);

  useEffect(() => {
    // Handle real-time file changes
    fileChanges.forEach((change) => {
      console.log('File change received:', change);
      // Update file tree based on changes
    });
  }, [fileChanges]);

  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Project Files
      </h3>
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.path}
            className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {file.type === 'directory' ? '📁' : '📄'}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {file.path}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Real-time terminal component
export function RealtimeTerminal({ sessionId }: { sessionId: string }) {
  const { terminalOutput, isSharing, shareOutput, toggleSharing } = useRealtimeTerminal(sessionId);
  const [command, setCommand] = useState('');

  const handleCommand = (cmd: string) => {
    // This would execute the command and get output
    const output = `$ ${cmd}\nCommand executed successfully\n`;
    shareOutput(cmd, output);
    setCommand('');
  };

  return (
    <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">Terminal</span>
        <button
          onClick={toggleSharing}
          className={`text-xs px-2 py-1 rounded ${
            isSharing
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          {isSharing ? 'Sharing' : 'Share'}
        </button>
      </div>
      
      <div className="h-64 overflow-y-auto mb-2">
        {terminalOutput.map((output, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {output}
          </div>
        ))}
      </div>
      
      <div className="flex items-center">
        <span className="mr-1">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCommand(command)}
          className="flex-1 bg-transparent outline-none"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
}

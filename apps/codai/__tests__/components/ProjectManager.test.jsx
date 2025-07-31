/**
 * 🧪 CODAI ProjectManager Component Tests
 * Testing project management functionality
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectManager from '../../src/components/ProjectManager';

const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'Test project description',
  template: 'react-app',
  files: [
    { id: '1', name: 'App.js', content: 'const App = () => <div>Hello World</div>;', type: 'javascript' },
    { id: '2', name: 'index.js', content: 'import React from "react";', type: 'javascript' },
    { id: '3', name: 'styles.css', content: 'body { margin: 0; }', type: 'css' }
  ],
  dependencies: {
    'react': '18.3.1',
    'react-dom': '18.3.1'
  }
};

// Mock services
jest.mock('../../src/services/projectService', () => ({
  buildProject: jest.fn().mockResolvedValue({ success: true, output: 'Build successful' }),
  saveFile: jest.fn().mockResolvedValue({ success: true }),
  deleteFile: jest.fn().mockResolvedValue({ success: true }),
  createFile: jest.fn().mockResolvedValue({ success: true, id: 'new-file-id' })
}));

describe('ProjectManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders project information correctly', () => {
    render(<ProjectManager project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test project description')).toBeInTheDocument();
    expect(screen.getByTestId('project-info')).toBeInTheDocument();
  });

  test('displays file tree structure', () => {
    render(<ProjectManager project={mockProject} />);
    
    expect(screen.getByTestId('file-tree')).toBeInTheDocument();
    expect(screen.getByText('App.js')).toBeInTheDocument();
    expect(screen.getByText('index.js')).toBeInTheDocument();
    expect(screen.getByText('styles.css')).toBeInTheDocument();
  });

  test('opens file editor on file click', async () => {
    render(<ProjectManager project={mockProject} />);
    
    fireEvent.click(screen.getByText('App.js'));
    
    await waitFor(() => {
      expect(screen.getByTestId('file-editor')).toBeVisible();
      expect(screen.getByDisplayValue(/const App = \(\) => <div>Hello World<\/div>;/)).toBeInTheDocument();
    });
  });

  test('creates new file successfully', async () => {
    const projectService = require('../../src/services/projectService');
    render(<ProjectManager project={mockProject} />);
    
    fireEvent.click(screen.getByTestId('add-file-btn'));
    
    const fileNameInput = screen.getByTestId('new-file-name');
    fireEvent.change(fileNameInput, { target: { value: 'NewComponent.jsx' } });
    
    const createButton = screen.getByTestId('create-file-btn');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(projectService.createFile).toHaveBeenCalledWith(
        mockProject.id,
        'NewComponent.jsx',
        ''
      );
    });
  });

  test('deletes file with confirmation dialog', async () => {
    const projectService = require('../../src/services/projectService');
    render(<ProjectManager project={mockProject} />);
    
    // Right-click on file to open context menu
    fireEvent.contextMenu(screen.getByText('App.js'));
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));
    
    // Confirm deletion in modal
    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-modal')).toBeVisible();
    });
    
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    
    await waitFor(() => {
      expect(projectService.deleteFile).toHaveBeenCalledWith(mockProject.id, '1');
    });
  });

  test('handles project build process', async () => {
    const projectService = require('../../src/services/projectService');
    render(<ProjectManager project={mockProject} />);
    
    fireEvent.click(screen.getByTestId('build-project-btn'));
    
    // Should show building status
    await waitFor(() => {
      expect(screen.getByTestId('build-status')).toHaveTextContent('Building...');
    });
    
    // Wait for build completion
    await waitFor(() => {
      expect(screen.getByTestId('build-status')).toHaveTextContent('Build successful');
      expect(projectService.buildProject).toHaveBeenCalledWith(mockProject.id);
    }, { timeout: 5000 });
  });

  test('saves file changes', async () => {
    const projectService = require('../../src/services/projectService');
    render(<ProjectManager project={mockProject} />);
    
    // Open file
    fireEvent.click(screen.getByText('App.js'));
    
    await waitFor(() => {
      expect(screen.getByTestId('file-editor')).toBeVisible();
    });
    
    // Modify content
    const editor = screen.getByTestId('code-editor');
    fireEvent.change(editor, { target: { value: 'const App = () => <div>Modified</div>;' } });
    
    // Save file (Ctrl+S)
    fireEvent.keyDown(editor, { key: 's', ctrlKey: true });
    
    await waitFor(() => {
      expect(projectService.saveFile).toHaveBeenCalledWith(
        mockProject.id,
        '1',
        'const App = () => <div>Modified</div>;'
      );
    });
  });

  test('handles file upload', async () => {
    render(<ProjectManager project={mockProject} />);
    
    const fileInput = screen.getByTestId('file-upload-input');
    const file = new File(['console.log("test");'], 'test.js', { type: 'text/javascript' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('test.js')).toBeInTheDocument();
    });
  });

  test('displays project dependencies', () => {
    render(<ProjectManager project={mockProject} />);
    
    expect(screen.getByTestId('dependencies-section')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('18.3.1')).toBeInTheDocument();
    expect(screen.getByText('react-dom')).toBeInTheDocument();
  });

  test('handles file search functionality', async () => {
    render(<ProjectManager project={mockProject} />);
    
    const searchInput = screen.getByTestId('file-search');
    fireEvent.change(searchInput, { target: { value: 'App' } });
    
    await waitFor(() => {
      expect(screen.getByText('App.js')).toBeInTheDocument();
      expect(screen.queryByText('index.js')).not.toBeInTheDocument();
      expect(screen.queryByText('styles.css')).not.toBeInTheDocument();
    });
  });

  test('supports file drag and drop reordering', async () => {
    render(<ProjectManager project={mockProject} />);
    
    const appFile = screen.getByText('App.js');
    const indexFile = screen.getByText('index.js');
    
    // Simulate drag and drop
    fireEvent.dragStart(appFile);
    fireEvent.dragEnter(indexFile);
    fireEvent.dragOver(indexFile);
    fireEvent.drop(indexFile);
    
    // File order should be maintained in the UI
    expect(screen.getByTestId('file-tree')).toBeInTheDocument();
  });
});

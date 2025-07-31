/**
 * 🧪 CODAI Dashboard Component Tests
 * Comprehensive testing for the main dashboard interface
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../src/components/Dashboard';

// Mock dependencies
jest.mock('../../src/hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [
      { id: '1', name: 'Test Project', status: 'active', template: 'react-app' },
      { id: '2', name: 'Demo Project', status: 'completed', template: 'vue-app' }
    ],
    loading: false,
    error: null,
    createProject: jest.fn(),
    deleteProject: jest.fn(),
    updateProject: jest.fn()
  })
}));

jest.mock('../../src/services/apiService', () => ({
  fetchProjects: jest.fn().mockResolvedValue([]),
  createProject: jest.fn().mockResolvedValue({ id: '3', name: 'New Project' })
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard title and main elements', () => {
    render(<Dashboard />);
    
    expect(screen.getByText(/CODAI Dashboard/i)).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
    expect(screen.getByTestId('create-project-btn')).toBeInTheDocument();
  });

  test('displays project list correctly', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Demo Project')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  test('opens project creation modal on button click', async () => {
    render(<Dashboard />);
    
    const createButton = screen.getByTestId('create-project-btn');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeVisible();
      expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
    });
  });

  test('filters projects by status', async () => {
    render(<Dashboard />);
    
    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByText('Demo Project')).not.toBeInTheDocument();
    });
  });

  test('handles empty project state', () => {
    // Mock empty projects
    jest.doMock('../../src/hooks/useProjects', () => ({
      useProjects: () => ({
        projects: [],
        loading: false,
        error: null
      })
    }));
    
    const EmptyDashboard = require('../../src/components/Dashboard').default;
    render(<EmptyDashboard />);
    
    expect(screen.getByText(/No projects found/i)).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    jest.doMock('../../src/hooks/useProjects', () => ({
      useProjects: () => ({
        projects: [],
        loading: true,
        error: null
      })
    }));
    
    const LoadingDashboard = require('../../src/components/Dashboard').default;
    render(<LoadingDashboard />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/Loading projects/i)).toBeInTheDocument();
  });

  test('handles error state gracefully', () => {
    jest.doMock('../../src/hooks/useProjects', () => ({
      useProjects: () => ({
        projects: [],
        loading: false,
        error: 'Failed to load projects'
      })
    }));
    
    const ErrorDashboard = require('../../src/components/Dashboard').default;
    render(<ErrorDashboard />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load projects/i)).toBeInTheDocument();
  });

  test('supports keyboard navigation', () => {
    render(<Dashboard />);
    
    const createButton = screen.getByTestId('create-project-btn');
    createButton.focus();
    
    expect(createButton).toHaveFocus();
    
    fireEvent.keyDown(createButton, { key: 'Enter' });
    expect(screen.getByTestId('project-modal')).toBeVisible();
  });

  test('project search functionality', async () => {
    render(<Dashboard />);
    
    const searchInput = screen.getByTestId('project-search');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByText('Demo Project')).not.toBeInTheDocument();
    });
  });

  test('project sorting functionality', async () => {
    render(<Dashboard />);
    
    const sortSelect = screen.getByTestId('project-sort');
    fireEvent.change(sortSelect, { target: { value: 'name-desc' } });
    
    await waitFor(() => {
      const projectItems = screen.getAllByTestId('project-item');
      expect(projectItems[0]).toHaveTextContent('Test Project');
      expect(projectItems[1]).toHaveTextContent('Demo Project');
    });
  });
});

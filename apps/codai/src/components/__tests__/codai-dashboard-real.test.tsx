/**
 * CODAI DASHBOARD REAL FUNCTIONAL TESTS - NO MOCKS
 * Tests actual Dashboard component functionality with real user interactions
 * Uses React Testing Library for genuine user behavior testing
 * NO mock data, NO simulated responses, ONLY real functionality
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../Dashboard';

// Real CODAI Dashboard Test Component with authentic functionality
const CodaiDashboardTestWrapper = () => {
    const [projects, setProjects] = React.useState([
        {
            id: '1',
            name: 'AI Chat Application',
            description: 'Modern chat interface with AI capabilities',
            status: 'active' as const,
            progress: 75,
            members: 4,
            updatedAt: new Date('2025-01-15')
        },
        {
            id: '2',
            name: 'Data Analytics Platform',
            description: 'Real-time data processing and visualization',
            status: 'completed' as const,
            progress: 100,
            members: 6,
            updatedAt: new Date('2025-01-20')
        },
        {
            id: '3',
            name: 'E-commerce Integration',
            description: 'Seamless payment processing system',
            status: 'paused' as const,
            progress: 45,
            members: 2,
            updatedAt: new Date('2025-01-18')
        }
    ]);

    const [newProjectCount, setNewProjectCount] = React.useState(0);
    const [lastClickedProject, setLastClickedProject] = React.useState<string | null>(null);

    const handleCreateProject = () => {
        const newProject = {
            id: `new-${Date.now()}`,
            name: `New Project ${newProjectCount + 1}`,
            description: 'Automatically created project for testing',
            status: 'active' as const,
            progress: 0,
            members: 1,
            updatedAt: new Date()
        };
        setProjects(prev => [...prev, newProject]);
        setNewProjectCount(prev => prev + 1);
    };

    const handleProjectClick = (project: any) => {
        setLastClickedProject(project.id);
    };

    return (
        <div>
            <div data-testid="project-creation-count">Projects Created: {newProjectCount}</div>
            <div data-testid="last-clicked-project">Last Clicked: {lastClickedProject || 'None'}</div>
            <Dashboard
                projects={projects}
                onCreateProject={handleCreateProject}
                onProjectClick={handleProjectClick}
            />
        </div>
    );
};

describe('CODAI Dashboard - Real Functionality Tests', () => {
    it('renders the main dashboard interface correctly', () => {
        render(<CodaiDashboardTestWrapper />);

        // Check main title and description
        expect(screen.getByText('CODAI Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Manage your AI-powered development projects')).toBeInTheDocument();

        // Check main sections exist
        expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('displays project statistics correctly with real calculations', () => {
        render(<CodaiDashboardTestWrapper />);

        // Verify real stat calculations using more specific queries
        expect(screen.getByText('3')).toBeInTheDocument(); // Total Projects

        // Use getByText with more specific context for duplicate text
        const statisticsSection = screen.getByText('Active Projects').closest('div');
        expect(statisticsSection).toBeInTheDocument();

        // Check for "Completed" text in statistics (appears as stat label)
        expect(screen.getByText('Completed', { selector: 'p.text-sm.font-medium.text-gray-600' })).toBeInTheDocument();

        expect(screen.getByText('12')).toBeInTheDocument(); // Total Members (4+6+2)
    });

    it('creates new projects with real user interactions', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        // Verify initial state
        expect(screen.getByTestId('project-creation-count')).toHaveTextContent('Projects Created: 0');

        // Find and click the "New Project" button
        const newProjectBtn = screen.getByRole('button', { name: /new project/i });
        await user.click(newProjectBtn);

        // Verify project was created
        await waitFor(() => {
            expect(screen.getByTestId('project-creation-count')).toHaveTextContent('Projects Created: 1');
        });

        // Verify the new project appears in the list
        expect(screen.getByText('New Project 1')).toBeInTheDocument();
        expect(screen.getByText('Automatically created project for testing')).toBeInTheDocument();

        // Create another project
        await user.click(newProjectBtn);
        await waitFor(() => {
            expect(screen.getByTestId('project-creation-count')).toHaveTextContent('Projects Created: 2');
        });
        expect(screen.getByText('New Project 2')).toBeInTheDocument();
    });

    it('performs real search functionality', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        const searchInput = screen.getByPlaceholderText('Search projects...');

        // Search for "chat" - should find AI Chat Application
        await user.type(searchInput, 'chat');

        await waitFor(() => {
            expect(screen.getByText('AI Chat Application')).toBeInTheDocument();
            expect(screen.queryByText('Data Analytics Platform')).not.toBeInTheDocument();
            expect(screen.queryByText('E-commerce Integration')).not.toBeInTheDocument();
        });

        // Clear search and search for "data"
        await user.clear(searchInput);
        await user.type(searchInput, 'data');

        await waitFor(() => {
            expect(screen.getByText('Data Analytics Platform')).toBeInTheDocument();
            expect(screen.queryByText('AI Chat Application')).not.toBeInTheDocument();
            expect(screen.queryByText('E-commerce Integration')).not.toBeInTheDocument();
        });
    });

    it('filters projects by status with real filtering logic', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        const statusFilter = screen.getByDisplayValue('All Status');

        // Filter by active status
        await user.selectOptions(statusFilter, 'active');

        await waitFor(() => {
            expect(screen.getByText('AI Chat Application')).toBeInTheDocument();
            expect(screen.queryByText('Data Analytics Platform')).not.toBeInTheDocument();
            expect(screen.queryByText('E-commerce Integration')).not.toBeInTheDocument();
        });

        // Filter by completed status
        await user.selectOptions(statusFilter, 'completed');

        await waitFor(() => {
            expect(screen.getByText('Data Analytics Platform')).toBeInTheDocument();
            expect(screen.queryByText('AI Chat Application')).not.toBeInTheDocument();
            expect(screen.queryByText('E-commerce Integration')).not.toBeInTheDocument();
        });

        // Filter by paused status
        await user.selectOptions(statusFilter, 'paused');

        await waitFor(() => {
            expect(screen.getByText('E-commerce Integration')).toBeInTheDocument();
            expect(screen.queryByText('AI Chat Application')).not.toBeInTheDocument();
            expect(screen.queryByText('Data Analytics Platform')).not.toBeInTheDocument();
        });
    });

    it('handles project clicks with real interaction tracking', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        // Verify initial state
        expect(screen.getByTestId('last-clicked-project')).toHaveTextContent('Last Clicked: None');

        // Click on first project
        const aiChatProject = screen.getByText('AI Chat Application');
        await user.click(aiChatProject);

        await waitFor(() => {
            expect(screen.getByTestId('last-clicked-project')).toHaveTextContent('Last Clicked: 1');
        });

        // Click on second project
        const analyticsProject = screen.getByText('Data Analytics Platform');
        await user.click(analyticsProject);

        await waitFor(() => {
            expect(screen.getByTestId('last-clicked-project')).toHaveTextContent('Last Clicked: 2');
        });
    });

    it('displays project progress bars with correct percentages', () => {
        render(<CodaiDashboardTestWrapper />);

        // Check progress percentages are displayed
        expect(screen.getByText('75%')).toBeInTheDocument(); // AI Chat Application
        expect(screen.getByText('100%')).toBeInTheDocument(); // Data Analytics Platform
        expect(screen.getByText('45%')).toBeInTheDocument(); // E-commerce Integration

        // Verify progress elements exist by checking for progress text
        const progressTexts = screen.getAllByText(/%$/);
        expect(progressTexts).toHaveLength(3);
    });

    it('displays correct status badges with proper styling', () => {
        render(<CodaiDashboardTestWrapper />);

        // Check status badges by looking for specific badge elements with styling
        const statusBadges = screen.getAllByText('Active');
        expect(statusBadges.length).toBeGreaterThan(0);

        // Find the badge element specifically (not the select option)
        const activeBadge = statusBadges.find(element =>
            element.className.includes('bg-green-100')
        );
        expect(activeBadge).toBeInTheDocument();

        // Check other status badges by their specific styling
        const completedBadge = screen.getByText('Completed', {
            selector: '.bg-purple-100'
        });
        expect(completedBadge).toBeInTheDocument();

        const pausedBadge = screen.getByText('Paused', {
            selector: '.bg-yellow-100'
        });
        expect(pausedBadge).toBeInTheDocument();
    });

    it('shows team member counts correctly', () => {
        render(<CodaiDashboardTestWrapper />);

        // Check individual project member counts are displayed
        const memberCounts = screen.getAllByText('4');
        expect(memberCounts.length).toBeGreaterThan(0);
        expect(screen.getByText('6')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('combines search and filter functionality correctly', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        const searchInput = screen.getByPlaceholderText('Search projects...');
        const statusFilter = screen.getByDisplayValue('All Status');

        // Search for "a" (matches all projects) and filter by active
        await user.type(searchInput, 'a');
        await user.selectOptions(statusFilter, 'active');

        await waitFor(() => {
            // Should show only "AI Chat Application" (active and contains "a")
            expect(screen.getByText('AI Chat Application')).toBeInTheDocument();
            expect(screen.queryByText('Data Analytics Platform')).not.toBeInTheDocument(); // completed, not active
            expect(screen.queryByText('E-commerce Integration')).not.toBeInTheDocument(); // paused, not active
        });
    });

    it('handles empty search results gracefully', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        const searchInput = screen.getByPlaceholderText('Search projects...');

        // Search for something that doesn't exist
        await user.type(searchInput, 'nonexistent project');

        await waitFor(() => {
            expect(screen.getByText('No projects found')).toBeInTheDocument();
            expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
        });
    });

    it('handles accessibility features correctly', () => {
        render(<CodaiDashboardTestWrapper />);

        // Check for proper button roles and labels
        expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();

        // Check for proper input elements (use placeholder instead of name since no label)
        expect(screen.getByPlaceholderText(/search projects/i)).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();

        // Check for proper headings structure
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CODAI Dashboard');
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Projects');
    });

    it('maintains state consistency during complex interactions', async () => {
        const user = userEvent.setup();
        render(<CodaiDashboardTestWrapper />);

        // Perform multiple operations
        const newProjectBtn = screen.getByRole('button', { name: /new project/i });
        const searchInput = screen.getByPlaceholderText('Search projects...');
        const statusFilter = screen.getByDisplayValue('All Status');

        // Create a new project
        await user.click(newProjectBtn);

        // Search for the new project
        await user.type(searchInput, 'New Project 1');

        // Verify it's found
        await waitFor(() => {
            expect(screen.getByText('New Project 1')).toBeInTheDocument();
        });

        // Change filter to completed (new project should disappear as it's active)
        await user.selectOptions(statusFilter, 'completed');

        await waitFor(() => {
            expect(screen.queryByText('New Project 1')).not.toBeInTheDocument();
            expect(screen.getByText('No projects found')).toBeInTheDocument();
        });

        // Reset filter to all
        await user.selectOptions(statusFilter, 'all');

        // New project should appear again
        await waitFor(() => {
            expect(screen.getByText('New Project 1')).toBeInTheDocument();
        });
    });
});
/**
 * 🧪 Admin UserList Component Tests
 * Testing user management functionality
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../../src/components/UserList';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'inactive' }
];

// Mock services
jest.mock('../../src/services/userService', () => ({
  getUsers: jest.fn().mockResolvedValue(mockUsers),
  deleteUser: jest.fn().mockResolvedValue({ success: true }),
  updateUserStatus: jest.fn().mockResolvedValue({ success: true })
}));

describe('UserList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user list with correct data', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  test('displays user roles correctly', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getAllByText('user')).toHaveLength(2);
    });
  });

  test('filters users by role', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('role-filter')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByTestId('role-filter'), { target: { value: 'admin' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('filters users by status', async () => {
    render(<UserList />);
    
    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  test('searches users by name or email', async () => {
    render(<UserList />);
    
    const searchInput = screen.getByTestId('user-search');
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  test('opens user detail modal on row click', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('John Doe'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-detail-modal')).toBeVisible();
    });
  });

  test('deletes user with confirmation', async () => {
    const userService = require('../../src/services/userService');
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('delete-user-1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('delete-user-1'));
    
    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-modal')).toBeVisible();
    });
    
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    
    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  test('updates user status', async () => {
    const userService = require('../../src/services/userService');
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('status-toggle-3')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('status-toggle-3'));
    
    await waitFor(() => {
      expect(userService.updateUserStatus).toHaveBeenCalledWith('3', 'active');
    });
  });

  test('handles loading state', () => {
    jest.doMock('../../src/services/userService', () => ({
      getUsers: jest.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
    }));
    
    render(<UserList />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/Loading users/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    jest.doMock('../../src/services/userService', () => ({
      getUsers: jest.fn().mockRejectedValue(new Error('Failed to load users'))
    }));
    
    const ErrorUserList = require('../../src/components/UserList').default;
    render(<ErrorUserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument();
    });
  });

  test('supports pagination', async () => {
    // Mock large user list
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'user',
      status: 'active'
    }));
    
    jest.doMock('../../src/services/userService', () => ({
      getUsers: jest.fn().mockResolvedValue(manyUsers)
    }));
    
    const PaginatedUserList = require('../../src/components/UserList').default;
    render(<PaginatedUserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('User 20')).toBeInTheDocument();
    });
  });

  test('bulk actions functionality', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('select-user-1')).toBeInTheDocument();
    });
    
    // Select multiple users
    fireEvent.click(screen.getByTestId('select-user-1'));
    fireEvent.click(screen.getByTestId('select-user-2'));
    
    expect(screen.getByTestId('bulk-actions')).toBeVisible();
    expect(screen.getByText('2 users selected')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('bulk-delete-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('bulk-delete-modal')).toBeVisible();
    });
  });
});

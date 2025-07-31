/**
 * 🧪 Admin UserDetail Component Tests  
 * Testing detailed user view and management functionality
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDetail from '../../src/components/UserDetail';

const mockUser = {
  id: 'user-123',
  username: 'john.doe',
  email: 'john.doe@codai.com',
  fullName: 'John Doe',
  role: 'developer',
  status: 'active',
  createdAt: '2024-01-15T08:00:00Z',
  lastLogin: '2025-01-21T09:30:00Z',
  profile: {
    avatar: '/avatars/john.jpg',
    department: 'Engineering',
    title: 'Senior Developer',
    phone: '+1-555-0123',
    location: 'San Francisco, CA'
  },
  projects: [
    { id: 'proj-1', name: 'CODAI Core', role: 'Lead Developer', status: 'active' },
    { id: 'proj-2', name: 'Admin Panel', role: 'Contributor', status: 'completed' }
  ],
  permissions: ['read', 'write', 'admin'],
  activityLog: [
    { id: 1, action: 'Login', timestamp: '2025-01-21T09:30:00Z', ip: '192.168.1.100' },
    { id: 2, action: 'Updated profile', timestamp: '2025-01-20T14:15:00Z', ip: '192.168.1.100' }
  ]
};

// Mock services
jest.mock('../../src/services/userService', () => ({
  getUserById: jest.fn().mockResolvedValue(mockUser),
  updateUser: jest.fn().mockResolvedValue({ success: true }),
  deleteUser: jest.fn().mockResolvedValue({ success: true }),
  getUserActivity: jest.fn().mockResolvedValue(mockUser.activityLog),
  resetPassword: jest.fn().mockResolvedValue({ success: true, tempPassword: 'temp123' })
}));

// Mock router
const mockNavigate = jest.fn();
const mockParams = { userId: 'user-123' };
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams
}));

describe('UserDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user information correctly', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@codai.com')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
  });

  test('displays user avatar and status', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-avatar')).toHaveAttribute('src', '/avatars/john.jpg');
      expect(screen.getByTestId('user-status')).toHaveTextContent('active');
      expect(screen.getByTestId('user-status')).toHaveClass('status-active');
    });
  });

  test('shows user projects and roles', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByText('CODAI Core')).toBeInTheDocument();
      expect(screen.getByText('Lead Developer')).toBeInTheDocument();
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('Contributor')).toBeInTheDocument();
    });
  });

  test('displays user permissions', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('permission-read')).toBeInTheDocument();
      expect(screen.getByTestId('permission-write')).toBeInTheDocument();
      expect(screen.getByTestId('permission-admin')).toBeInTheDocument();
    });
  });

  test('enables user editing mode', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-user-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('edit-user-btn'));
    
    expect(screen.getByTestId('user-edit-form')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@codai.com')).toBeInTheDocument();
  });

  test('saves user changes', async () => {
    const userService = require('../../src/services/userService');
    render(<UserDetail />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-user-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-edit-form')).toBeInTheDocument();
    });
    
    // Update user data
    fireEvent.change(screen.getByTestId('fullName-input'), {
      target: { value: 'John Smith' }
    });
    
    fireEvent.change(screen.getByTestId('role-select'), {
      target: { value: 'admin' }
    });
    
    fireEvent.click(screen.getByTestId('save-user-btn'));
    
    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('user-123', 
        expect.objectContaining({
          fullName: 'John Smith',
          role: 'admin'
        })
      );
    });
  });

  test('cancels user editing', async () => {
    render(<UserDetail />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-user-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-edit-form')).toBeInTheDocument();
    });
    
    // Cancel editing
    fireEvent.click(screen.getByTestId('cancel-edit-btn'));
    
    expect(screen.queryByTestId('user-edit-form')).not.toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument(); // Original name restored
  });

  test('resets user password', async () => {
    const userService = require('../../src/services/userService');
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('reset-password-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('reset-password-btn'));
    
    // Confirm reset in modal
    await waitFor(() => {
      expect(screen.getByTestId('confirm-reset-modal')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('confirm-reset-btn'));
    
    await waitFor(() => {
      expect(userService.resetPassword).toHaveBeenCalledWith('user-123');
      expect(screen.getByText('temp123')).toBeInTheDocument(); // Shows temp password
    });
  });

  test('deletes user with confirmation', async () => {
    const userService = require('../../src/services/userService');
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('delete-user-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('delete-user-btn'));
    
    // Confirm deletion in modal
    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-modal')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    
    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('user-123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });
  });

  test('displays user activity log', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('activity-log')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Updated profile')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });
  });

  test('filters activity log by action type', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('activity-filter')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByTestId('activity-filter'), {
      target: { value: 'login' }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.queryByText('Updated profile')).not.toBeInTheDocument();
    });
  });

  test('handles permission updates', async () => {
    const userService = require('../../src/services/userService');
    render(<UserDetail />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-user-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('permissions-section')).toBeInTheDocument();
    });
    
    // Toggle permission
    fireEvent.click(screen.getByTestId('permission-checkbox-admin'));
    
    fireEvent.click(screen.getByTestId('save-user-btn'));
    
    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('user-123', 
        expect.objectContaining({
          permissions: ['read', 'write'] // admin removed
        })
      );
    });
  });

  test('shows user status change options', async () => {
    const userService = require('../../src/services/userService');
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByTestId('status-dropdown'), {
      target: { value: 'suspended' }
    });
    
    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('user-123', 
        expect.objectContaining({
          status: 'suspended'
        })
      );
    });
  });

  test('handles loading state', () => {
    jest.doMock('../../src/services/userService', () => ({
      getUserById: jest.fn().mockImplementation(() => new Promise(() => {}))
    }));
    
    const LoadingUserDetail = require('../../src/components/UserDetail').default;
    render(<LoadingUserDetail />);
    
    expect(screen.getByTestId('user-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading user details/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    jest.doMock('../../src/services/userService', () => ({
      getUserById: jest.fn().mockRejectedValue(new Error('User not found'))
    }));
    
    const ErrorUserDetail = require('../../src/components/UserDetail').default;
    render(<ErrorUserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-error')).toBeInTheDocument();
      expect(screen.getByText(/User not found/i)).toBeInTheDocument();
    });
  });

  test('validates form inputs', async () => {
    render(<UserDetail />);
    
    // Enter edit mode
    fireEvent.click(screen.getByTestId('edit-user-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('user-edit-form')).toBeInTheDocument();
    });
    
    // Clear required field
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: '' }
    });
    
    fireEvent.click(screen.getByTestId('save-user-btn'));
    
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });

  test('handles navigation back to user list', async () => {
    render(<UserDetail />);
    
    await waitFor(() => {
      expect(screen.getByTestId('back-to-users-btn')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('back-to-users-btn'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
  });
});

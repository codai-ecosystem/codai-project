import { ApiService } from './api';

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  emailVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
  enrollments?: Record<string, any>;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
}

/**
 * User service for working with user data
 */
export class UserService {
  /**
   * Get current user details from backend
   */
  static async getCurrentUser(): Promise<User | null> {
    const response = await ApiService.get<User>('/users/me');

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  /**
   * Get user details by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const response = await ApiService.get<User>(`/users/${id}`);

    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(profile: Partial<UserProfile>): Promise<boolean> {
    const response = await ApiService.patch<User>('/users/profile', profile);
    return !response.error;
  }

  /**
   * Update user email (requires authentication)
   */
  static async updateEmail(email: string): Promise<boolean> {
    const response = await ApiService.patch<User>('/users/email', { email });
    return !response.error;
  }

  /**
   * Delete user account (requires authentication)
   */
  static async deleteAccount(): Promise<boolean> {
    const response = await ApiService.delete<{ success: boolean }>('/users/me');
    return !response.error && response.data?.success === true;
  }
}

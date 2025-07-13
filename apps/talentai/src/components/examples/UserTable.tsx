'use client';

import type { JSX } from 'react';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    status: string;
}

export function UserTable(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Mock user data
        const mockUsers: User[] = [
            { id: '1', email: 'user1@talentai.com', name: 'Alice Johnson', status: 'active' },
            { id: '2', email: 'user2@talentai.com', name: 'Bob Smith', status: 'inactive' },
            { id: '3', email: 'user3@talentai.com', name: 'Carol Davis', status: 'active' }
        ];
        setUsers(mockUsers);
    }, []);

    return (

import { Button, Skeleton } from '@/components/ui';
    import { useFirestore } from '@/hooks';

    interface UserData {
        id: string;
        displayName?: string;
        email: string;
        createdAt: Date | string | number;
        lastLoginAt: Date | string | number;
        role?: string;
    }

    export function UserTable(): JSX.Element {
        const { getDocuments, subscribeToQuery, loading, error } =
            useFirestore<UserData>('users');

        const [users, setUsers] = useState<UserData[]>([]);
        const [isRealtime, setIsRealtime] = useState(false);

        // Load users initially
        useEffect(() => {
            const loadUsers = async () => {
                const constraints = [orderBy('createdAt', 'desc'), limit(10)];

                const usersData = await getDocuments(constraints);
                setUsers(usersData);
            };

            if (isRealtime === false) {
                loadUsers();
            }
        }, [getDocuments, isRealtime]);

        // Set up real-time subscription
        useEffect(() => {
            if (!isRealtime) return;

            const constraints = [orderBy('createdAt', 'desc'), limit(10)];

            // Start real-time subscription
            const unsubscribe = subscribeToQuery(constraints, data => {
                setUsers(data);
            });

            // Clean up subscription
            return () => {
                unsubscribe();
            };
        }, [subscribeToQuery, isRealtime]);

        // Toggle between real-time and on-demand data
        const toggleRealtime = () => {
            setIsRealtime(prev => !prev);
        }; // Format date display
        const formatDate = (
            date: Date | string | number | { toDate: () => Date } | null | undefined
        ) => {
            if (date === null || date === undefined) return 'N/A';

            // Firebase Timestamp object
            if (
                typeof date === 'object' &&
                'toDate' in date &&
                typeof date.toDate === 'function'
            ) {
                return new Date(date.toDate()).toLocaleDateString();
            } // Date object
            if (date instanceof Date) {
                return date.toLocaleDateString();
            }

            // Fallback for other formats (string or number)
            if (typeof date === 'string' || typeof date === 'number') {
                return new Date(date).toLocaleDateString();
            }

            return 'Invalid Date';
        };

        // Show loading state
        if (loading === true && users.length === 0) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Users</h2>
                        <Skeleton className="h-10 w-40" />
                    </div>

                    <div className="overflow-x-auto rounded-md border">
                        <div className="min-w-full divide-y">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="px-6 py-4">
                                    <Skeleton className="h-6 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Show error state
        if (error != null) {
            return (
                <div className="rounded-md bg-destructive/10 p-4">
                    <h2 className="text-xl font-semibold text-destructive">Error</h2>
                    <p className="text-destructive">{error.message}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <Button
                        onClick={toggleRealtime}
                        variant={isRealtime ? 'success' : 'outline'}
                    >
                        {isRealtime ? 'Real-time: On' : 'Real-time: Off'}
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="min-w-full divide-y">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    Last Login
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y bg-background">
                            {users.map(user => (
                                <tr key={user.id} className="transition-colors hover:bg-muted/50">
                                    <td className="px-6 py-4">{user.displayName ?? 'N/A'}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.role ?? 'user'}</td>
                                    <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                                    <td className="px-6 py-4">{formatDate(user.lastLoginAt)}</td>
                                </tr>
                            ))}

                            {users.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-4 text-center text-muted-foreground"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {loading === true && users.length > 0 ? (
                    <div className="p-4 text-center">
                        <LoadingSpinner className="mx-auto h-6 w-6" />
                    </div>
                ) : null}
            </div>
        );
    }

    function LoadingSpinner({ className }: { className?: string }) {
        return (
            <svg
                className={`animate-spin ${className}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        );
    }

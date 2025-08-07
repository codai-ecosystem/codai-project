'use client'

import React from 'react';

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

interface User {
    id: string;
    email: string;
    name: string;
    status: string;
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

export function UserTable(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock user data
        const mockUsers: User[] = [
            { id: '1', email: 'user1@example.com', name: 'User One', status: 'active' },
            { id: '2', email: 'user2@example.com', name: 'User Two', status: 'inactive' },
            { id: '3', email: 'user3@example.com', name: 'User Three', status: 'active' }
        ];

        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="overflow-x-auto rounded-md border">
                    <div className="min-w-full divide-y">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="px-6 py-4">
                                <div className="h-6 w-full bg-gray-200 animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Users</h2>
                <Button variant="outline">
                    Refresh
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
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y bg-background">
                        {users.map(user => (
                            <tr key={user.id} className="transition-colors hover:bg-muted/50">
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-4 text-center text-muted-foreground"
                                >
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


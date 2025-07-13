import dynamic from 'next/dynamic';
'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState, type JSX } from 'react';

const DataTable = dynamic(() => import('@/components/ui/DataTable.dynamic'), { ssr: false });

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  [key: string]: unknown; // Allow additional properties
}

const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 5 === 0 ? 'Admin' : i % 3 === 0 ? 'Moderator' : 'User',
  status: i % 4 === 0 ? 'inactive' : i % 7 === 0 ? 'pending' : 'active',
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
}));

export default function UsersTablePage(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);

  // Memoized event handlers
  const handleEdit = useCallback((userId: string) => {
    console.log('Edit user:', userId);
  }, []);

  const handleDelete = useCallback((userId: string) => {
    console.log('Delete user:', userId);
  }, []);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setUsers(mockUsers);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const columns: {
    id: string;
    header: string;
    accessorKey?: keyof User;
    cell?: (item: User) => React.ReactNode;
    enableSorting?: boolean;
  }[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      enableSorting: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      enableSorting: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      enableSorting: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: (user: User) => {
        const statusMap = {
          active: {
            label: 'Active',
            className:
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          },
          inactive: {
            label: 'Inactive',
            className:
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
          },
          pending: {
            label: 'Pending',
            className:
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          },
        };

        const statusInfo = statusMap[user.status];

        return (
          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorKey: 'createdAt',
      enableSorting: true,
      cell: (user: User) => {
        return new Date(user.createdAt).toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: (user: User) => {
        return (
          <div className="flex space-x-2">
            <button
              className="p-1 text-primary hover:text-primary/80"
              onClick={() => handleEdit(user.id)}
              aria-label={`Edit ${user.name}`}
              type="button"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-destructive hover:text-destructive/80"
              onClick={() => handleDelete(user.id)}
              aria-label={`Delete ${user.name}`}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container py-10">
      <DataTable<User> data={users} columns={columns} title="Users" />
    </div>
  );
}

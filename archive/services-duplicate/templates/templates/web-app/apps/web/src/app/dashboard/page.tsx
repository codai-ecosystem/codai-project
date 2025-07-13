'use client';

import type { JSX } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

function DashboardContent(): JSX.Element {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.displayName ?? user?.email}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        <Button variant="outline" onClick={() => void signOut()}>
          Sign Out
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <p className="text-sm font-medium text-muted-foreground">Status</p>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">Active</p>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <p className="text-sm font-medium text-muted-foreground">
              Projects
            </p>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
            <p className="text-sm font-medium text-muted-foreground">Tasks</p>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground">3 due today</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-purple-500" />
            <p className="text-sm font-medium text-muted-foreground">
              Messages
            </p>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">7</p>
            <p className="text-xs text-muted-foreground">2 unread</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Project Updated
                </p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  New Message Received
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Task Completed
                </p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="ghost">
              <span className="mr-2">📝</span>
              Create New Project
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <span className="mr-2">👥</span>
              Invite Team Members
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <span className="mr-2">📊</span>
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <span className="mr-2">⚙️</span>
              Account Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* User Info */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Account Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-foreground">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Display Name
            </p>
            <p className="text-foreground">{user?.displayName ?? 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="font-mono text-xs text-foreground">{user?.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Member Since
            </p>
            <p className="text-foreground">Recently joined</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function DashboardPage(): JSX.Element {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  );
}

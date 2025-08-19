'use client';

import type { JSX } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

function SettingsContent(): JSX.Element {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useThemeContext();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      {/* Theme Settings */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Account</h3>
        <div className="space-y-4">
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
          <div className="pt-4">
            <Button variant="destructive" onClick={() => void signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SettingsPage(): JSX.Element {
  return (
    <AuthGuard requireAuth={true}>
      <SettingsContent />
    </AuthGuard>
  );
}

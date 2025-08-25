import { vi } from 'vitest'
import React from 'react'

// Mock Lucide React icons - comprehensive set
vi.mock('lucide-react', () => ({
    User: vi.fn(() => React.createElement('svg', { 'data-testid': 'user-icon' })),
    LogOut: vi.fn(() => React.createElement('svg', { 'data-testid': 'logout-icon' })),
    Settings: vi.fn(() => React.createElement('svg', { 'data-testid': 'settings-icon' })),
    Shield: vi.fn(() => React.createElement('svg', { 'data-testid': 'shield-icon' })),
    Key: vi.fn(() => React.createElement('svg', { 'data-testid': 'key-icon' })),
    Loader2: vi.fn(() => React.createElement('svg', { 'data-testid': 'loader2-icon' })),
    ChevronDown: vi.fn(() => React.createElement('svg', { 'data-testid': 'chevron-down-icon' })),
    Plus: vi.fn(() => React.createElement('svg', { 'data-testid': 'plus-icon' })),
    CheckCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'check-circle-icon' })),
    Mail: vi.fn(() => React.createElement('svg', { 'data-testid': 'mail-icon' })),
    Eye: vi.fn(() => React.createElement('svg', { 'data-testid': 'eye-icon' })),
    EyeOff: vi.fn(() => React.createElement('svg', { 'data-testid': 'eye-off-icon' })),
    Info: vi.fn(() => React.createElement('svg', { 'data-testid': 'info-icon' })),
    XCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'x-circle-icon' })),
    AlertCircle: vi.fn(() => React.createElement('svg', { 'data-testid': 'alert-circle-icon' })),
    AlertTriangle: vi.fn(() => React.createElement('svg', { 'data-testid': 'alert-triangle-icon' })),
    X: vi.fn(() => React.createElement('svg', { 'data-testid': 'x-icon' })),
    Check: vi.fn(() => React.createElement('svg', { 'data-testid': 'check-icon' }))
}))

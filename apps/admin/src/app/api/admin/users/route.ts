import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator' | 'developer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: Date;
  createdAt: Date;
  permissions: string[];
  services: string[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  suspendedUsers: number;
}

// Mock user data - in production, this would connect to a real database
const generateMockUsers = (): User[] => [
  {
    id: '1',
    email: 'admin@codai.ro',
    name: 'System Administrator',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 3600000),
    createdAt: new Date('2024-01-01'),
    permissions: ['all'],
    services: ['*'],
  },
  {
    id: '2',
    email: 'dev@codai.ro',
    name: 'Lead Developer',
    role: 'developer',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 7200000),
    createdAt: new Date('2024-01-15'),
    permissions: ['read', 'write', 'deploy'],
    services: ['codai', 'memorai', 'logai'],
  },
  {
    id: '3',
    email: 'alice.johnson@example.com',
    name: 'Alice Johnson',
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 14400000),
    createdAt: new Date('2024-02-01'),
    permissions: ['read'],
    services: ['bancai', 'wallet'],
  },
  {
    id: '4',
    email: 'bob.smith@example.com',
    name: 'Bob Smith',
    role: 'moderator',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 86400000),
    createdAt: new Date('2024-01-20'),
    permissions: ['read', 'moderate'],
    services: ['sociai', 'publicai'],
  },
  {
    id: '5',
    email: 'charlie.brown@example.com',
    name: 'Charlie Brown',
    role: 'user',
    status: 'suspended',
    lastLogin: new Date(Date.now() - Math.random() * 604800000),
    createdAt: new Date('2024-03-01'),
    permissions: ['read'],
    services: ['studiai'],
  },
  {
    id: '6',
    email: 'diana.prince@example.com',
    name: 'Diana Prince',
    role: 'user',
    status: 'pending',
    lastLogin: new Date(Date.now() - Math.random() * 172800000),
    createdAt: new Date(Date.now() - 86400000),
    permissions: ['read'],
    services: [],
  },
  {
    id: '7',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 7200000),
    createdAt: new Date('2024-02-15'),
    permissions: ['read'],
    services: ['bancai', 'studiai'],
  },
  {
    id: '8',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'developer',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 3600000),
    createdAt: new Date('2024-01-30'),
    permissions: ['read', 'write'],
    services: ['fabricai', 'hub', 'explorer'],
  },
  {
    id: '9',
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    role: 'moderator',
    status: 'inactive',
    lastLogin: new Date(Date.now() - Math.random() * 2592000000),
    createdAt: new Date('2024-01-10'),
    permissions: ['read', 'moderate'],
    services: ['sociai'],
  },
  {
    id: '10',
    email: 'sarah.connor@example.com',
    name: 'Sarah Connor',
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - Math.random() * 10800000),
    createdAt: new Date('2024-03-10'),
    permissions: ['read'],
    services: ['wallet', 'explorer'],
  },
];

const generateUserStats = (users: User[]): UserStats => ({
  totalUsers: 1247 + Math.floor(Math.random() * 100),
  activeUsers:
    users.filter(u => u.status === 'active').length * 100 +
    Math.floor(Math.random() * 50),
  newUsers: 23 + Math.floor(Math.random() * 10),
  suspendedUsers:
    users.filter(u => u.status === 'suspended').length * 5 +
    Math.floor(Math.random() * 10),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let users = generateMockUsers();

    // Apply filters
    if (role && role !== 'all') {
      users = users.filter(user => user.role === role);
    }

    if (status && status !== 'all') {
      users = users.filter(user => user.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);

    const stats = generateUserStats(users);

    return NextResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        stats,
        pagination: {
          page,
          limit,
          total: users.length,
          totalPages: Math.ceil(users.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validate required fields
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Simulate user creation
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email,
      name: userData.name,
      role: userData.role || 'user',
      status: 'pending',
      lastLogin: new Date(),
      createdAt: new Date(),
      permissions: userData.permissions || ['read'],
      services: userData.services || [],
    };

    return NextResponse.json({
      success: true,
      data: { user: newUser },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

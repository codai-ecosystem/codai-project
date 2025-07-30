// Mock Prisma client for development
interface MockUser {
  id: string;
  email: string;
  password?: string;
  name?: string;
  image?: string;
  role: string;
}

interface MockUserModel {
  findUnique(args: { where: { email: string } }): Promise<MockUser | null>;
  create(args: { data: Partial<MockUser> }): Promise<MockUser>;
  update(args: { where: { id: string }, data: Partial<MockUser> }): Promise<MockUser>;
}

interface MockPrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: () => Promise<T>): Promise<T>;
  user: MockUserModel;
}

class MockPrismaClientImpl implements MockPrismaClient {
  user: MockUserModel = {
    async findUnique(_args): Promise<MockUser | null> {
      console.log('Mock Prisma: Finding user', _args);
      return null; // Mock implementation - no users found
    },

    async create(args): Promise<MockUser> {
      console.log('Mock Prisma: Creating user', args);
      return {
        id: 'mock-user-id',
        email: args.data.email || 'test@example.com',
        name: args.data.name,
        image: args.data.image,
        password: args.data.password,
        role: args.data.role || 'user'
      };
    },

    async update(args): Promise<MockUser> {
      console.log('Mock Prisma: Updating user', args);
      return {
        id: args.where.id,
        email: 'updated@example.com',
        name: args.data.name,
        image: args.data.image,
        password: args.data.password,
        role: args.data.role || 'user'
      };
    }
  };

  async $connect(): Promise<void> {
    console.log('Mock Prisma: Connected');
  }

  async $disconnect(): Promise<void> {
    console.log('Mock Prisma: Disconnected');
  }

  async $transaction<T>(fn: () => Promise<T>): Promise<T> {
    console.log('Mock Prisma: Transaction started');
    try {
      const result = await fn();
      console.log('Mock Prisma: Transaction completed');
      return result;
    } catch (error) {
      console.log('Mock Prisma: Transaction failed', error);
      throw error;
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: MockPrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new MockPrismaClientImpl()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

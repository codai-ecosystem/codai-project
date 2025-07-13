import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client with robust error handling
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.__prisma;
}

// Add connection testing
async function testConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.warn('Prisma connection test failed:', (error as Error).message);
    return false;
  }
}

// Graceful shutdown
async function disconnect() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.warn('Prisma disconnect warning:', (error as Error).message);
  }
}

// Export with connection testing capability
export default prisma;
export { testConnection, disconnect };
export type { PrismaClient } from '@prisma/client';

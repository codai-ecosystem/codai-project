// Dynamic import for Prisma client to handle potential import issues
let PrismaClientClass: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaImport = require('@prisma/client') as any;
  PrismaClientClass = prismaImport.PrismaClient;
} catch (error) {
  console.warn('Prisma client not available in prisma.ts:', error);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  var __prisma: any | undefined;
}

// Create a singleton Prisma client with robust error handling
let prisma: any;

if (PrismaClientClass && process.env.NODE_ENV === 'production') {
  prisma = new PrismaClientClass({
    log: ['error'],
    errorFormat: 'minimal',
  });
} else {
  if (PrismaClientClass && !global.__prisma) {
    global.__prisma = new PrismaClientClass({
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
// Remove problematic type export
// export type { PrismaClient } from '@prisma/client';

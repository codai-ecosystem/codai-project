// import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  {} as any // new PrismaClient({
//  log: ['query'],
// })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

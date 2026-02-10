// ============================================
// 📚 LEARNING: Prisma Client Setup
// ============================================
// This creates a SINGLETON database client
// "Singleton" means we reuse the SAME connection
// instead of creating new connections every time
// (which would be slow and waste resources)

import { PrismaClient } from '@prisma/client';

// ============================================
// Why use globalThis?
// ============================================
// In Next.js development mode, hot-reloading would
// create NEW PrismaClient instances on every change,
// eventually exhausting database connections!
// 
// globalThis stores the client ONCE across hot-reloads

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ============================================
// Create or reuse Prisma client
// ============================================

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] // Show errors and warnings in dev
      : ['error'],         // Only errors in production
  });

// Store in globalThis for development hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================
// 📚 HOW TO USE:
// ============================================
// Import this in your server actions:
// 
// import { prisma } from '@database/postgresql/client';
//
// Then use it like:
// const users = await prisma.user.findMany();
// const user = await prisma.user.create({ data: { ... } });
// const updated = await prisma.user.update({ where: { id }, data: { ... } });
// const deleted = await prisma.user.delete({ where: { id } });
//
// ============================================

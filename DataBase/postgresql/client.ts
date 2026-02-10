// ============================================
// 📚 LEARNING: Prisma Client Setup
// ============================================
// This creates a SINGLETON database client
// "Singleton" means we reuse the SAME connection
// instead of creating new connections every time.

import { PrismaClient } from '@prisma/client';

// ============================================
// 🔧 CONNECTION LIMIT FIX
// ============================================
// Decrease connection limits in development to prevent
// "Too many connections" errors during hot-reloading.

const originalUrl = process.env.DATABASE_URL;

if (originalUrl && !originalUrl.includes('connection_limit')) {
  const limit = process.env.NODE_ENV === 'development' ? 5 : 10;
  const separator = originalUrl.includes('?') ? '&' : '?';
  process.env.DATABASE_URL = `${originalUrl}${separator}connection_limit=${limit}`;
}

// ============================================
// Global Singleton Pattern
// ============================================
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Use: import { prisma } from '@database/postgresql/client';

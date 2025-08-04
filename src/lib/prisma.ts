// Importación dinámica para evitar problemas de generación del cliente
let PrismaClient: any;

try {
  // Intentar importación estándar primero
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch (error) {
  console.error('Error loading PrismaClient:', error);
  // Fallback para desarrollo - crear un cliente mock
  PrismaClient = class MockPrismaClient {
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
    user: any;
    team: any;
    reservation: any;
    systemConfig: any;

    constructor(options?: any) {
      console.warn('Using MockPrismaClient - Prisma client not properly generated');
      this.$connect = async () => {};
      this.$disconnect = async () => {};
      this.user = { findMany: async () => [], findUnique: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) };
      this.team = { findMany: async () => [], findUnique: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) };
      this.reservation = { findMany: async () => [], findUnique: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) };
      this.systemConfig = { findMany: async () => [], findUnique: async () => null, create: async () => ({}), update: async () => ({}), delete: async () => ({}) };
    }
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 
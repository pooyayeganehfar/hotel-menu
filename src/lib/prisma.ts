import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('Successfully disconnected from the database');
  } catch (error) {
    console.error('Failed to disconnect from the database:', error);
  }
}
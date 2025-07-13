import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    const categories = await prisma.category.findMany();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed', details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

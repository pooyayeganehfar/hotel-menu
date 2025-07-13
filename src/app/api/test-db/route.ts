import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // تست اتصال با یک کوئری ساده
    const categoriesCount = await prisma.category.count();
    const foodsCount = await prisma.food.count();

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        categoriesCount,
        foodsCount
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

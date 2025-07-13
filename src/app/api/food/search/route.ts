import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const foods = await prisma.food.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query
            }
          },
          {
            category: {
              name: {
                contains: query
              }
            }
          }
        ]
      },
      include: {
        category: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'خطا در جستجوی غذاها' },
      { status: 500 }
    );
  }
}

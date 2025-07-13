import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// GET: دریافت همه غذاها با دسته‌بندی
export async function GET() {
  const foods = await prisma.food.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
  return NextResponse.json(foods);
}


// POST: افزودن غذا جدید با دسته‌بندی
export async function POST(request: Request) {
  const body = await request.json();
  const { name, price, image, categoryId } = body;

  if (!name || !price || !image || !categoryId) {
    return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
  }

  const newFood = await prisma.food.create({
    data: {
      name,
      price: parseInt(price),
      image,
      categoryId: parseInt(categoryId),
    },
    include: { category: true },
  });

  return NextResponse.json(newFood);
}
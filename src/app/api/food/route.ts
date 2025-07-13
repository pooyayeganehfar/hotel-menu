import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// GET: دریافت همه غذاها با دسته‌بندی
export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      include: { category: true },
      orderBy: [{ id: 'desc' }]
    });
    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات غذاها' }, { status: 500 });
  }
}


// POST: افزودن غذا جدید با دسته‌بندی
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, image, categoryId } = body;

    if (!name || !price || !image || !categoryId) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const newFood = await prisma.food.create({
      data: {
        name,
        price: Number(price),
        image,
        categoryId: Number(categoryId),
      },
      include: { category: true },
    });

    return NextResponse.json(newFood);
  } catch (error) {
    console.error('Error creating food:', error);
    return NextResponse.json({ error: 'خطا در ایجاد غذای جدید' }, { status: 500 });
  }
}
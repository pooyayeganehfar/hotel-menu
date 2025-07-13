import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// GET: دریافت همه غذاها با دسته‌بندی
export async function GET() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    const foods = await prisma.food.findMany({
      include: { category: true },
      orderBy: [{ id: 'desc' }]
    });
    
    console.log('Found foods:', foods.length);
    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json({ 
      error: 'خطا در دریافت اطلاعات غذاها',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// POST: افزودن غذا جدید با دسته‌بندی
export async function POST(request: Request) {
  try {
    await prisma.$connect();
    console.log('Connected to database for POST request');
    
    const body = await request.json();
    console.log('Received body:', body);
    
    const { name, price, image, categoryId } = body;

    if (!name || !price || !image || !categoryId) {
      console.log('Validation failed:', { name, price, image, categoryId });
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

    console.log('Created new food:', newFood);
    return NextResponse.json(newFood);
  } catch (error) {
    console.error('Error creating food:', error);
    return NextResponse.json({ 
      error: 'خطا در ایجاد غذای جدید',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
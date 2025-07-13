import { NextResponse } from 'next/server';
import { prisma, connectDB, disconnectDB } from '@/lib/prisma';


// GET: دریافت همه غذاها با دسته‌بندی
export async function GET() {
  try {
    await connectDB();
    console.log('Connected to database for GET request');
    
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
    await disconnectDB();
  }
}


// POST: افزودن غذای جدید
export async function POST(request: Request) {
  try {
    await connectDB();
    console.log('Connected to database for POST request');
    
    const body = await request.json();
    console.log('Received body:', body);
    
    const { name, price, image, categoryId } = body;

    if (!name || !price || !image || !categoryId) {
      console.log('Validation failed:', { name, price, image, categoryId });
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    // تبدیل قیمت و شناسه دسته‌بندی به عدد
    const priceNum = Number(price);
    const categoryIdNum = Number(categoryId);

    if (isNaN(priceNum)) {
      return NextResponse.json({ error: 'قیمت باید عدد باشد' }, { status: 400 });
    }

    if (isNaN(categoryIdNum)) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی باید عدد باشد' }, { status: 400 });
    }

    // بررسی وجود دسته‌بندی
    const category = await prisma.category.findUnique({
      where: { id: categoryIdNum }
    });

    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی مورد نظر یافت نشد' }, { status: 404 });
    }

    // ایجاد غذای جدید با تراکنش
    const newFood = await prisma.$transaction(async (tx) => {
      return await tx.food.create({
        data: {
          name,
          price: priceNum,
          image,
          categoryId: categoryIdNum,
        },
        include: { category: true },
      });
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
    await disconnectDB();
  }
}
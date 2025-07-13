import { NextResponse } from 'next/server';
import { prisma, connectDB, disconnectDB } from '@/lib/prisma';

// GET: دریافت همه دسته‌بندی‌ها
export async function GET() {
  try {
    await connectDB();
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/category:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await disconnectDB();
  }
}

// POST: افزودن دسته‌بندی جدید
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'نام دسته‌بندی الزامی است' }, { status: 400 });
    }

    console.log('Creating new category:', { name });
    const newCategory = await prisma.category.create({
      data: { name },
    });
    console.log('Created category:', newCategory);

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error in POST /api/category:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد دسته‌بندی', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await disconnectDB();
  }
}

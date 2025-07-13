import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: دریافت همه دسته‌بندی‌ها
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}

// POST: افزودن دسته‌بندی جدید
export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'نام دسته‌بندی الزامی است' }, { status: 400 });
  }

  const newCategory = await prisma.category.create({
    data: { name },
  });

  return NextResponse.json(newCategory);
}

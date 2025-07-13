import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await request.json();

    const food = await prisma.food.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی غذا' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در حذف غذا' },
      { status: 500 }
    );
  }
}

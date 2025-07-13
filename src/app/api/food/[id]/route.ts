import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    const cookiesList = await cookies();
    const adminToken = cookiesList.get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { error: 'دسترسی غیر مجاز' },
        { status: 401 }
      );
    }

    // استخراج id از URL
    const pathname = request.nextUrl.pathname;
    const id = Number(pathname.split('/').pop());
    
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
  } catch (err) {
    console.error('Error updating food:', err);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی غذا' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // بررسی توکن احراز هویت
    const cookiesList = await cookies();
    const adminToken = cookiesList.get('admin_token');
    
    if (!adminToken?.value) {
      return NextResponse.json(
        { error: 'دسترسی غیر مجاز' },
        { status: 401 }
      );
    }

    // استخراج id از URL
    const pathname = request.nextUrl.pathname;
    const id = Number(pathname.split('/').pop());
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'شناسه نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی وجود غذا
    const food = await prisma.food.findUnique({
      where: { id }
    });

    if (!food) {
      return NextResponse.json(
        { error: 'غذای مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    // حذف غذا
    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'غذا با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting food:', error);
    return NextResponse.json(
      { error: 'خطا در حذف غذا' },
      { status: 500 }
    );
  }
}

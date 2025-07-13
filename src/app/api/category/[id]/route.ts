import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی توکن احراز هویت
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'دسترسی غیر مجاز' },
        { status: 401 }
      );
    }

    const id = Number(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'شناسه نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی وجود دسته‌بندی
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        foods: true
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'دسته‌بندی مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    // اگر غذایی در این دسته‌بندی وجود دارد، categoryId آنها را null کنیم
    if (category.foods.length > 0) {
      await prisma.food.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
    }

    // حذف دسته‌بندی
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'خطا در حذف دسته‌بندی' },
      { status: 500 }
    );
  }
}

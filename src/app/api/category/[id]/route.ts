import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma, connectDB, disconnectDB } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // بررسی توکن احراز هویت
    const adminToken = request.cookies.get('admin_token');
    
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

    console.log('Attempting to delete category:', id);

    // حذف دسته‌بندی با تراکنش
    const result = await prisma.$transaction(async (tx) => {
      // بررسی وجود دسته‌بندی
      const category = await tx.category.findUnique({
        where: { id },
        include: { foods: true }
      });

      if (!category) {
        throw new Error('دسته‌بندی مورد نظر یافت نشد');
      }

      // آپدیت غذاهای مرتبط
      if (category.foods.length > 0) {
        await tx.food.updateMany({
          where: { categoryId: id },
          data: { categoryId: null }
        });
      }

      // حذف دسته‌بندی
      return await tx.category.delete({
        where: { id }
      });
    });

    console.log('Successfully deleted category:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in DELETE /api/category/[id]:', error);
    const status = error instanceof Error && error.message === 'دسته‌بندی مورد نظر یافت نشد' ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطا در حذف دسته‌بندی' },
      { status }
    );
  } finally {
    await disconnectDB();
  }
}

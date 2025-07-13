import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // تست اتصال به دیتابیس
    await prisma.$connect();
    console.log('✅ Successfully connected to database');

    // تست خواندن از دیتابیس
    const categoriesCount = await prisma.category.count();
    const foodsCount = await prisma.food.count();
    
    console.log(`📊 Current database status:
    - Categories: ${categoriesCount}
    - Foods: ${foodsCount}`);

    // تست نوشتن در دیتابیس
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category'
      }
    });
    console.log('✅ Successfully created test category');

    // پاک کردن داده تست
    await prisma.category.delete({
      where: {
        id: testCategory.id
      }
    });
    console.log('✅ Successfully cleaned up test data');

    console.log('🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

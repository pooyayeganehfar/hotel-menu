import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // پاک کردن داده‌های قبلی
  await prisma.food.deleteMany();
  await prisma.category.deleteMany();

  // ایجاد دسته‌بندی‌های اولیه
  const pizzaCategory = await prisma.category.create({
    data: {
      name: 'پیتزا',
    },
  });

  const kebabCategory = await prisma.category.create({
    data: {
      name: 'کباب',
    },
  });

  const beverageCategory = await prisma.category.create({
    data: {
      name: 'نوشیدنی',
    },
  });

  // ایجاد غذاهای اولیه
  await prisma.food.createMany({
    data: [
      {
        name: 'پیتزا مخصوص',
        price: 140000,
        image: '/images/special-pizza.jpg',
        categoryId: pizzaCategory.id,
      },
      {
        name: 'پیتزا مرغ',
        price: 125000,
        image: '/images/chicken-pizza.jpg',
        categoryId: pizzaCategory.id,
      },
      {
        name: 'کباب کوبیده',
        price: 160000,
        image: '/images/koobideh.jpg',
        categoryId: kebabCategory.id,
      },
      {
        name: 'جوجه کباب',
        price: 140000,
        image: '/images/joojeh.jpg',
        categoryId: kebabCategory.id,
      },
      {
        name: 'نوشابه',
        price: 12000,
        image: '/images/soda.jpg',
        categoryId: beverageCategory.id,
      },
      {
        name: 'دوغ',
        price: 10000,
        image: '/images/doogh.jpg',
        categoryId: beverageCategory.id,
      },
    ],
  });

  console.log('داده‌های اولیه با موفقیت اضافه شدند');
}

main()
  .catch((e) => {
    console.error('خطا در اضافه کردن داده‌های اولیه:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

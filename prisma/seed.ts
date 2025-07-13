import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.food.createMany({
    data: [
      {
        name: 'چلو کباب کوبیده',
        price: 180000,
        image: '/foods/kebab.jpg'
      },
      {
        name: 'زرشک پلو با مرغ',
        price: 165000,
        image: '/foods/zereshk-polo.jpg'
      },
      {
        name: 'قیمه',
        price: 145000,
        image: '/foods/gheimeh.jpg'
      }
    ]
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

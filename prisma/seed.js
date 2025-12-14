// prisma/seed.js
require('dotenv/config');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// We'll instantiate PrismaClient the same way as in src/db.js:
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' }) });

async function main() {
  const hashed = await bcrypt.hash('password', 10);
  const user = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', password: hashed, name: 'Alice' },
  });
  console.log('Created user:', user.email);

  const products = [];
  for (let i = 1; i <= 50; i++) {
    products.push(
      prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          priceCents: faker.number.int({ min: 100, max: 20000 }),
          sku: `SKU-${Date.now().toString().slice(-6)}-${i}`,
          inventory: faker.number.int({ min: 5, max: 200 }),
          imageUrl: `https://picsum.photos/seed/product-${i}/600/400`,
        },
      })
    );
  }

  await Promise.all(products);
  console.log('Inserted 50 products.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

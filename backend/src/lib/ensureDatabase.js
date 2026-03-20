const prisma = require('./prisma');

async function ensureProductColumns() {
  const existingColumns = await prisma.$queryRawUnsafe(
    'PRAGMA table_info("Product")'
  );
  const existingNames = new Set(existingColumns.map((column) => column.name));

  const optionalColumns = [
    {
      name: 'colorway',
      sql: 'ALTER TABLE "Product" ADD COLUMN "colorway" TEXT NOT NULL DEFAULT \'Multi\''
    },
    {
      name: 'sizeRange',
      sql: 'ALTER TABLE "Product" ADD COLUMN "sizeRange" TEXT NOT NULL DEFAULT \'M-L\''
    },
    {
      name: 'aesthetic',
      sql: 'ALTER TABLE "Product" ADD COLUMN "aesthetic" TEXT NOT NULL DEFAULT \'Classic\''
    },
    {
      name: 'imageUrl',
      sql: 'ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT'
    },
    {
      name: 'active',
      sql: 'ALTER TABLE "Product" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true'
    }
  ];

  for (const column of optionalColumns) {
    if (!existingNames.has(column.name)) {
      await prisma.$executeRawUnsafe(column.sql);
    }
  }
}

async function ensureDatabase() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "price" REAL NOT NULL,
      "stock" INTEGER NOT NULL,
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "colorway" TEXT NOT NULL DEFAULT 'Multi',
      "sizeRange" TEXT NOT NULL DEFAULT 'M-L',
      "aesthetic" TEXT NOT NULL DEFAULT 'Classic',
      "imageUrl" TEXT,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureProductColumns();

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ShopOrder" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "customerName" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "subtotal" REAL NOT NULL,
      "shipping" REAL NOT NULL,
      "total" REAL NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PLACED',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "orderId" INTEGER NOT NULL,
      "productId" INTEGER NOT NULL,
      "productName" TEXT NOT NULL,
      "unitPrice" REAL NOT NULL,
      "quantity" INTEGER NOT NULL,
      "size" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("orderId") REFERENCES "ShopOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")'
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId")'
  );
}

module.exports = {
  ensureDatabase
};

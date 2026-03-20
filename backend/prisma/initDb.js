require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { ensureDatabase } = require('../src/lib/ensureDatabase');

ensureDatabase()
  .then(async () => {
    await prisma.$disconnect();
    console.log('SQLite schema initialized.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

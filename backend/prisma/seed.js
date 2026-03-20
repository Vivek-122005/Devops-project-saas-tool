const { PrismaClient } = require('@prisma/client');
const { ensureDatabase } = require('../src/lib/ensureDatabase');

const prisma = new PrismaClient();

const starterProducts = [
  {
    id: 1,
    name: 'Nebula Drift Crew Socks',
    category: 'Crew Socks',
    description:
      'Galaxy-inspired gradient socks with cushioned sole and breathable weave.',
    price: 18.99,
    stock: 42,
    featured: true,
    colorway: 'Midnight Violet',
    sizeRange: 'S-M-L',
    aesthetic: 'Cosmic',
    imageUrl:
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=900&q=80',
    active: true
  },
  {
    id: 2,
    name: 'Pastel Pop Ankle Socks',
    category: 'Ankle Socks',
    description:
      'Playful pastel palette socks with reinforced heel and soft combed cotton.',
    price: 14.5,
    stock: 35,
    featured: true,
    colorway: 'Mint Peach',
    sizeRange: 'XS-S-M',
    aesthetic: 'Cute',
    imageUrl:
      'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=900&q=80',
    active: true
  },
  {
    id: 3,
    name: 'Noir Luxe Knee Socks',
    category: 'Knee High',
    description:
      'Elegant ribbed knee-high socks with silk touch finish for elevated outfits.',
    price: 21.0,
    stock: 18,
    featured: false,
    colorway: 'Jet Black',
    sizeRange: 'M-L',
    aesthetic: 'Minimal Luxe',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    active: true
  },
  {
    id: 4,
    name: 'Retro Arcade Sport Socks',
    category: 'Athletic',
    description:
      'Retro striped sport socks built for movement with moisture-control threads.',
    price: 16.75,
    stock: 27,
    featured: false,
    colorway: 'Neon Cherry',
    sizeRange: 'M-L-XL',
    aesthetic: 'Retro',
    imageUrl:
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
    active: true
  }
];

async function main() {
  await ensureDatabase();
  await Promise.all(
    starterProducts.map((product) =>
      prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

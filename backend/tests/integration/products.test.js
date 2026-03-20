const fs = require('fs');
const path = require('path');
const request = require('supertest');

const databasePath = path.join(__dirname, 'test.db');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = `file:${databasePath}`;
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ADMIN_KEY = 'test-admin';

const app = require('../../src/app');
const { ensureDatabase } = require('../../src/lib/ensureDatabase');
const prisma = require('../../src/lib/prisma');

describe('products API', () => {
  beforeAll(async () => {
    if (fs.existsSync(databasePath)) {
      fs.unlinkSync(databasePath);
    }

    await ensureDatabase();
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();

    if (fs.existsSync(databasePath)) {
      fs.unlinkSync(databasePath);
    }

    const journalPath = `${databasePath}-journal`;
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
    }
  });

  it('creates, reads, updates, and deletes a product', async () => {
    const createResponse = await request(app)
      .post('/api/admin/products')
      .set('x-admin-key', process.env.ADMIN_KEY)
      .send({
      name: 'Comet Trail Socks',
      category: 'Crew Socks',
      description: 'Soft combed-cotton socks designed for all-day comfort.',
      price: 17.5,
      stock: 19,
      featured: true,
      colorway: 'Electric Blue',
      sizeRange: 'S-M-L',
      aesthetic: 'Y2K'
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.name).toBe('Comet Trail Socks');

    const listResponse = await request(app).get('/api/products?scope=store');
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.total).toBe(1);

    const productId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/admin/products/${productId}`)
      .set('x-admin-key', process.env.ADMIN_KEY)
      .send({
        stock: 11,
        featured: false
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.stock).toBe(11);

    const deleteResponse = await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set('x-admin-key', process.env.ADMIN_KEY);

    expect(deleteResponse.statusCode).toBe(204);

    const finalListResponse = await request(app).get('/api/products');
    expect(finalListResponse.body.total).toBe(0);
  });

  it('places an order and returns persisted order items', async () => {
    const productResponse = await request(app)
      .post('/api/admin/products')
      .set('x-admin-key', process.env.ADMIN_KEY)
      .send({
        name: 'Dreamwave Socks',
        category: 'Ankle Socks',
        description: 'Dreamy pastel socks with lightweight stretch and padding.',
        price: 13.25,
        stock: 20,
        featured: true,
        colorway: 'Sky Melon',
        sizeRange: 'XS-S-M',
        aesthetic: 'Pastelcore'
      });

    const orderResponse = await request(app).post('/api/orders').send({
      customerName: 'Alex Rider',
      email: 'alex@example.com',
      address: '221B Baker Street, London',
      items: [
        {
          productId: productResponse.body.id,
          quantity: 2,
          size: 'M'
        }
      ]
    });

    expect(orderResponse.statusCode).toBe(201);
    expect(orderResponse.body.items).toHaveLength(1);
    expect(orderResponse.body.total).toBeGreaterThan(0);
  });
});

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

const adminHeaders = { 'x-admin-key': process.env.ADMIN_KEY };

async function createProduct(overrides = {}) {
  return request(app)
    .post('/api/admin/products')
    .set(adminHeaders)
    .send({
      name: 'Comet Trail Socks',
      category: 'Crew Socks',
      description: 'Soft combed-cotton socks designed for all-day comfort.',
      price: 17.5,
      stock: 19,
      featured: true,
      colorway: 'Electric Blue',
      sizeRange: 'S-M-L',
      aesthetic: 'Y2K',
      ...overrides
    });
}

describe('products API', () => {
  beforeAll(async () => {
    if (fs.existsSync(databasePath)) {
      fs.unlinkSync(databasePath);
    }

    await ensureDatabase();
  });

  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.shopOrder.deleteMany();
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
    const createResponse = await createProduct();

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body.name).toBe('Comet Trail Socks');

    const listResponse = await request(app).get('/api/products?scope=store');
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.total).toBe(1);

    const productId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/admin/products/${productId}`)
      .set(adminHeaders)
      .send({
        stock: 11,
        featured: false
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.stock).toBe(11);

    const deleteResponse = await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set(adminHeaders);

    expect(deleteResponse.statusCode).toBe(204);

    const finalListResponse = await request(app).get('/api/products');
    expect(finalListResponse.body.total).toBe(0);
  });

  it('blocks admin CRUD when x-admin-key is missing', async () => {
    const response = await request(app).post('/api/admin/products').send({
      name: 'Unauthorized Socks',
      category: 'Crew Socks',
      description: 'This request should fail because key is not provided.',
      price: 12.99,
      stock: 3
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatch(/admin access denied/i);
  });

  it('places an order and returns persisted order items', async () => {
    const productResponse = await createProduct({
      name: 'Dreamwave Socks',
      category: 'Ankle Socks',
      description: 'Dreamy pastel socks with lightweight stretch and padding.',
      price: 13.25,
      stock: 20,
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

  it('rejects order placement when stock is insufficient', async () => {
    const productResponse = await createProduct({
      name: 'Limited Socks',
      stock: 1
    });

    const orderResponse = await request(app).post('/api/orders').send({
      customerName: 'Jamie Lowstock',
      email: 'jamie@example.com',
      address: '742 Evergreen Terrace, Springfield',
      items: [
        {
          productId: productResponse.body.id,
          quantity: 2,
          size: 'M'
        }
      ]
    });

    expect(orderResponse.statusCode).toBe(409);
    expect(orderResponse.body.message).toMatch(/stock/i);
  });

  it('supports cancellation and restocks product inventory', async () => {
    const productResponse = await createProduct({
      name: 'Restock Test Socks',
      stock: 5
    });

    const orderResponse = await request(app).post('/api/orders').send({
      customerName: 'Taylor Buyer',
      email: 'taylor@example.com',
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

    const productsAfterOrder = await request(app)
      .get('/api/admin/products')
      .set(adminHeaders);
    const productAfterOrder = productsAfterOrder.body.items.find(
      (item) => item.id === productResponse.body.id
    );
    expect(productAfterOrder.stock).toBe(3);

    const cancelResponse = await request(app)
      .patch(`/api/admin/orders/${orderResponse.body.id}/status`)
      .set(adminHeaders)
      .send({ status: 'CANCELLED' });

    expect(cancelResponse.statusCode).toBe(200);
    expect(cancelResponse.body.status).toBe('CANCELLED');

    const productsAfterCancel = await request(app)
      .get('/api/admin/products')
      .set(adminHeaders);
    const productAfterCancel = productsAfterCancel.body.items.find(
      (item) => item.id === productResponse.body.id
    );
    expect(productAfterCancel.stock).toBe(5);

    const invalidTransitionResponse = await request(app)
      .patch(`/api/admin/orders/${orderResponse.body.id}/status`)
      .set(adminHeaders)
      .send({ status: 'SHIPPED' });

    expect(invalidTransitionResponse.statusCode).toBe(400);
  });

  it('deletes orders from admin API and restores inventory', async () => {
    const productResponse = await createProduct({
      name: 'Delete Order Socks',
      stock: 4
    });

    const orderResponse = await request(app).post('/api/orders').send({
      customerName: 'Robin Cart',
      email: 'robin@example.com',
      address: '1600 Amphitheatre Parkway, Mountain View',
      items: [
        {
          productId: productResponse.body.id,
          quantity: 1,
          size: 'L'
        }
      ]
    });

    const getAdminOrder = await request(app)
      .get(`/api/admin/orders/${orderResponse.body.id}`)
      .set(adminHeaders);
    expect(getAdminOrder.statusCode).toBe(200);
    expect(getAdminOrder.body.id).toBe(orderResponse.body.id);

    const deleteResponse = await request(app)
      .delete(`/api/admin/orders/${orderResponse.body.id}`)
      .set(adminHeaders);
    expect(deleteResponse.statusCode).toBe(204);

    const productsAfterDelete = await request(app)
      .get('/api/admin/products')
      .set(adminHeaders);
    const productAfterDelete = productsAfterDelete.body.items.find(
      (item) => item.id === productResponse.body.id
    );
    expect(productAfterDelete.stock).toBe(4);

    const getDeletedOrder = await request(app).get(
      `/api/orders/${orderResponse.body.id}`
    );
    expect(getDeletedOrder.statusCode).toBe(404);
  });
});

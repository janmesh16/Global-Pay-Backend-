const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Admin & Compliance Endpoints', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    // 1. Register admin user
    const adminRes = await request(app).post('/api/auth/register').send({
      email: 'admin@globalpay.com',
      password: 'AdminPassword123!',
      name: 'Admin User',
      country: 'US',
    });
    adminToken = adminRes.body.data.token;
    const adminId = adminRes.body.data.user._id;

    // Promote user to admin role in DB
    await User.findByIdAndUpdate(adminId, { role: 'admin' });

    // 2. Register regular user
    const userRes = await request(app).post('/api/auth/register').send({
      email: 'regular@example.com',
      password: 'UserPassword123!',
      name: 'Regular User',
      country: 'US',
    });
    userToken = userRes.body.data.token;
  });

  test('GET /api/admin/metrics - admin can fetch dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toBeDefined();
    expect(res.body.data.transfers).toBeDefined();
  });

  test('GET /api/admin/metrics - non-admin receives 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/admin/settings - admin can get and update global settings', async () => {
    const getRes = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.statusCode).toBe(200);

    const updateRes = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dailyLimit: 20000 });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.dailyLimit).toBe(20000);
  });
});

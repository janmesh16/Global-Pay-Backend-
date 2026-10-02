const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
    country: 'US',
    phone: '+1234567890',
  };

  test('POST /api/auth/register - should register user and auto-create wallet', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();

    const dbUser = await User.findOne({ email: testUser.email });
    expect(dbUser).not.toBeNull();
  });

  test('POST /api/auth/login - should authenticate existing user', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('GET /api/users/profile - should return user profile with auth token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.wallet.currency).toBe('USD');
  });
});

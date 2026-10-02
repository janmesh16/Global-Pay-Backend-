const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Transfer & Compliance Endpoints', () => {
  let token;
  let recipientId;

  beforeEach(async () => {
    // 1. Register user
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'transferuser@example.com',
      password: 'Password123!',
      name: 'Transfer User',
      country: 'US',
    });
    token = regRes.body.data.token;
    const userId = regRes.body.data.user._id;

    // Verify KYC so transfers aren't blocked by unverified limit
    await User.findByIdAndUpdate(userId, { kycStatus: 'verified' });

    // 2. Add funds to wallet
    await request(app)
      .post('/api/wallet/fund')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000, method: 'bank_transfer' });

    // 3. Create a recipient
    const recRes = await request(app)
      .post('/api/recipients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+919876543210',
        accountNumber: '9876543210',
        bankName: 'HDFC Bank',
        bankCode: 'HDFC0001234',
        currency: 'INR',
        country: 'IN',
      });

    recipientId = recRes.body.data._id;
  });

  test('POST /api/transfers - should initiate transfer and complete when compliance passes', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId,
        amount: 100,
        sourceCurrency: 'USD',
        targetCurrency: 'INR',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reference).toBeDefined();
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.complianceStatus).toBe('cleared');
  });

  test('GET /api/transfers - should list user transfers', async () => {
    await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientId,
        amount: 50,
        sourceCurrency: 'USD',
        targetCurrency: 'INR',
      });

    const res = await request(app)
      .get('/api/transfers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

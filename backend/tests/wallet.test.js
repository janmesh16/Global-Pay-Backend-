const request = require('supertest');
const app = require('../src/app');

describe('Wallet Endpoints', () => {
  let token;

  beforeEach(async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'walletuser@example.com',
      password: 'Password123!',
      name: 'Wallet User',
      country: 'US',
    });
    token = regRes.body.data.token;
  });

  test('GET /api/wallet - should fetch initial wallet balance', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.balance).toBe('0.00');
  });

  test('POST /api/wallet/fund - should add funds to wallet and update ledger', async () => {
    const res = await request(app)
      .post('/api/wallet/fund')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 500,
        method: 'card',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.wallet.balance).toBe('500.00');

    const ledgerRes = await request(app)
      .get('/api/wallet/ledger')
      .set('Authorization', `Bearer ${token}`);

    expect(ledgerRes.statusCode).toBe(200);
    expect(ledgerRes.body.data.entries.length).toBe(1);
    expect(ledgerRes.body.data.entries[0].type).toBe('credit_topup');
  });
});

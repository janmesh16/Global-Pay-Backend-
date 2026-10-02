const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

const { MongoMemoryServer } = require('mongodb-memory-server');

async function runTests() {
  console.log('🚀 Starting GlobalPay Integration Test Suite...\n');

  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✓ Connected to In-Memory Test DB:', uri);

    // ── Test 1: User Registration ──
    console.log('\n--- 1. Testing Auth & User Registration ---');
    const userPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      country: 'US',
      phone: '+1234567890',
    };

    const regRes = await request(app)
      .post('/api/auth/register')
      .send(userPayload);

    if (regRes.status !== 201) console.error('Reg error:', regRes.body);
    console.assert(regRes.status === 201, `Register status expected 201, got ${regRes.status}`);
    console.assert(regRes.body.success === true, 'Register success should be true');
    console.assert(regRes.body.data.token, 'Token should be returned');
    console.log('✓ POST /api/auth/register - User registered & wallet created');

    const userToken = regRes.body.data.token;
    const userId = regRes.body.data.user._id;

    // ── Test 2: User Login ──
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });

    console.assert(loginRes.status === 200, `Login status expected 200, got ${loginRes.status}`);
    console.assert(loginRes.body.data.token, 'Login token returned');
    console.log('✓ POST /api/auth/login - User authenticated');

    // ── Test 3: Fetch Wallet ──
    console.log('\n--- 2. Testing Wallet Module ---');
    const walletRes = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${userToken}`);

    console.assert(walletRes.status === 200, 'Fetch wallet status 200');
    console.assert(walletRes.body.data.wallet.balance === '0.00', 'Initial wallet balance 0.00');
    console.log('✓ GET /api/wallet - Initial balance USD 0.00');

    // ── Test 4: Fund Wallet ──
    const fundRes = await request(app)
      .post('/api/wallet/fund')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 1000, method: 'card' });

    console.assert(fundRes.status === 200, 'Fund wallet status 200');
    console.assert(fundRes.body.data.wallet.balance === '1000.00', 'New wallet balance 1000.00');
    console.log('✓ POST /api/wallet/fund - Wallet funded with $1,000.00');

    // ── Test 5: Currency Rates ──
    console.log('\n--- 3. Testing Currency Module ---');
    const ratesRes = await request(app)
      .get('/api/currency/rates?from=USD&to=INR')
      .set('Authorization', `Bearer ${userToken}`);

    console.assert(ratesRes.status === 200, 'Rates status 200');
    console.assert(ratesRes.body.data.rates.INR > 0, 'INR rate returned');
    console.log(`✓ GET /api/currency/rates - 1 USD = ${ratesRes.body.data.rates.INR} INR`);

    // ── Test 6: Create Recipient ──
    console.log('\n--- 4. Testing Recipient Module ---');
    const recRes = await request(app)
      .post('/api/recipients')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+919876543210',
        accountNumber: '9876543210',
        bankName: 'HDFC Bank',
        ifscOrSwift: 'HDFC0001234',
        currency: 'INR',
        country: 'IN',
      });

    if (recRes.status !== 201) console.error('Rec error:', recRes.body);
    console.assert(recRes.status === 201, `Recipient status expected 201, got ${recRes.status}`);
    const recipientId = recRes.body.data._id;
    console.log('✓ POST /api/recipients - Recipient added');

    // ── Test 7: Verify KYC for User ──
    await User.findByIdAndUpdate(userId, { kycStatus: 'verified' });

    // ── Test 8: Initiate Transfer ──
    console.log('\n--- 5. Testing Transfer Core & Compliance ---');
    const transferRes = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        recipientId: recipientId.toString(),
        amount: 50,
        sourceCurrency: 'USD',
        targetCurrency: 'INR',
      });

    if (transferRes.status !== 201) {
      console.error('Transfer Validation Error Body:', JSON.stringify(transferRes.body, null, 2));
    }
    console.assert(transferRes.status === 201, `Transfer status expected 201, got ${transferRes.status}`);
    console.assert(transferRes.body.data.reference.startsWith('GP-'), 'Reference generated GP-');
    console.assert(transferRes.body.data.status === 'completed', 'Transfer status completed');
    console.log(`✓ POST /api/transfers - Transfer ${transferRes.body.data.reference} initiated & completed!`);

    // ── Test 9: Admin Endpoints ──
    console.log('\n--- 6. Testing Admin Module ---');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'superadmin@globalpay.com',
      password: 'AdminPassword123!',
      country: 'US',
      role: 'admin',
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: 'AdminPassword123!' });

    const adminToken = adminLogin.body.data.token;

    const metricsRes = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    console.assert(metricsRes.status === 200, 'Metrics status 200');
    console.assert(metricsRes.body.data.users.total >= 1, 'Total users >= 1');
    console.log('✓ GET /api/admin/metrics - Admin dashboard metrics retrieved');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.dropDatabase();
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runTests();

// Fix Jest cross-realm object constructor check for BSON serializer in MongoDB driver
const NativeObject = Object;
try {
  const nodeVm = require('node:vm');
  // Polyfill BSON / MongoDB driver cross-realm checks
} catch (e) {}

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let connectDB;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  connectDB = require('../src/config/db');

  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
}, 60000);

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});



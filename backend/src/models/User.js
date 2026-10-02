const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUS, KYC_STATUS } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    kycStatus: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.UNVERIFIED,
    },
    kycDocuments: {
      type: {
        type: String,
      },
      number: String,
      submittedAt: Date,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const env = require('../config/env');
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    if (ret.kycDocuments && ret.kycDocuments.number) {
      const num = ret.kycDocuments.number;
      ret.kycDocuments.number = num.length > 4
        ? '*'.repeat(num.length - 4) + num.slice(-4)
        : '****';
    }
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);

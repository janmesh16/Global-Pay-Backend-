const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Recipient full name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Recipient country is required'],
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    currency: {
      type: String,
      required: [true, 'Recipient currency is required'],
      uppercase: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
    },
    ifscOrSwift: {
      type: String,
      required: [true, 'IFSC/SWIFT code is required'],
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

recipientSchema.index({ user: 1, isActive: 1 });
recipientSchema.index({ user: 1, country: 1 });

// Mask account number in JSON responses
recipientSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    if (ret.accountNumber) {
      const acct = ret.accountNumber;
      ret.accountNumber = acct.length > 4
        ? '*'.repeat(acct.length - 4) + acct.slice(-4)
        : '****';
    }
    return ret;
  },
});

module.exports = mongoose.model('Recipient', recipientSchema);

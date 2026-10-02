const mongoose = require('mongoose');
const { COMPLIANCE_CHECK_TYPES, COMPLIANCE_RESULT } = require('../utils/constants');

const complianceLogSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkType: {
      type: String,
      enum: Object.values(COMPLIANCE_CHECK_TYPES),
      required: true,
    },
    result: {
      type: String,
      enum: Object.values(COMPLIANCE_RESULT),
      required: true,
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    reasons: {
      type: [String],
      default: [],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

complianceLogSchema.index({ transaction: 1 });
complianceLogSchema.index({ user: 1 });
complianceLogSchema.index({ result: 1 });
complianceLogSchema.index({ checkType: 1 });
complianceLogSchema.index({ createdAt: -1 });

complianceLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ComplianceLog', complianceLogSchema);

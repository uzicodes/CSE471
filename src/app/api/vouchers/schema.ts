import { Schema, model, models } from 'mongoose';

const voucherSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  isSpecial: {
    type: Boolean,
    default: false,
  },
  // ✅ New field to store emails of users allowed to use special vouchers
  allowedEmails: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Voucher = models.Voucher || model('Voucher', voucherSchema);

export default Voucher;

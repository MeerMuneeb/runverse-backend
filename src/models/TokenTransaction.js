import mongoose from 'mongoose';

const TokenTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  reason: { type: String, required: true },
  metadata: { type: Object, default: {} },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TokenTransaction', TokenTransactionSchema);
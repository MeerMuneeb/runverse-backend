import mongoose from 'mongoose';

const tokenTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['allocated', 'deducted'], required: true },
  reason: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('TokenTransaction', tokenTransactionSchema);

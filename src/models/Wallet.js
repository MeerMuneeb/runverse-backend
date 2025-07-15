import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: { type: [transactionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Wallet', walletSchema);

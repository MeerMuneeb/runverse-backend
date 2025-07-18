import mongoose from 'mongoose';

// Transaction schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// Wallet schema
const walletSchema = new mongoose.Schema({
  id: { type: String }, // Add custom 'id' field for wallet
  uid: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: { type: [transactionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to set 'id' as '_id' for wallet schema
walletSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id' for wallet
  }
  next();
});

export default mongoose.model('Wallet', walletSchema);

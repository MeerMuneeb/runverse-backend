import mongoose from 'mongoose';

const tokenTransactionSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['allocated', 'deducted'], required: true },
  reason: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to set 'id' as '_id'
tokenTransactionSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

// Register the schema as a model, but avoid re-registering if already defined
const TokenTransaction = mongoose.models.TokenTransaction || mongoose.model('TokenTransaction', tokenTransactionSchema);

export default TokenTransaction;

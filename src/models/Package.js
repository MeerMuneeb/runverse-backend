import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  distance: { type: String, required: true },
  type: { type: String, required: true, enum: ['team', 'individual'] },
  price: { type: Number, required: true }, // stored in cents
  t_min: { type: Number, default: null },
  t_max: { type: Number, default: null },
  desc: { type: String, default: '' },
  eventId: { type: String, required: true },
  status: { type: String, default: 'active' },
  tokens: { type: Number, default: 0 },        // 💡 NEW: number of tokens given
  mvtPrice: { type: Number, default: 0 },      // 💡 NEW: alternate price used in Stripe
  updatedAt: {
    _seconds: { type: Number },
    _nanoseconds: { type: Number }
  }                                           // 💡 NEW: Firestore-compatible timestamp
});

export default mongoose.model('Package', packageSchema);

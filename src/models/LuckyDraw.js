import mongoose from 'mongoose';

// Reward schema
const rewardSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field for reward
  title: { type: String, required: true },
  picture: { type: String, required: true },
  position: { type: Number, required: true },
});

// Pre-save hook to set 'id' as '_id' in reward schema
rewardSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

// Lucky draw schema
const luckyDrawSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field for lucky draw
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  drawDate: { type: Date, required: true },
  maxEntries: { type: Number, required: true },
  maxTotalEntries: { type: Number, required: true },
  entryPriceCurrency: { type: Number, default: 0 },
  entryPriceTokens: { type: Number, default: 0 },
  numWinners: { type: Number, required: true },
  active: { type: Boolean, default: true },
  participants: [{ type: String }], // Firebase UIDs
  rewards: [rewardSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to set 'id' as '_id' in lucky draw schema
luckyDrawSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('LuckyDraw', luckyDrawSchema);

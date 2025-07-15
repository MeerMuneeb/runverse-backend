import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  picture: { type: String, required: true },
  position: { type: Number, required: true },
});

const luckyDrawSchema = new mongoose.Schema({
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

export default mongoose.model('LuckyDraw', luckyDrawSchema);
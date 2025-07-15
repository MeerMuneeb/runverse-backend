import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  position: { type: Number, required: true },
  reward: { type: String, default: 'No reward assigned' },
  drawDate: { type: String, required: true },
});

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
});

const luckyDrawHistorySchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  winners: [winnerSchema],
  participants: [participantSchema],
  drawDate: { type: String, required: true },
  numWinners: { type: Number, required: true },
  maxEntries: { type: Number, required: true },
  entryPrice: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String },
});

export default mongoose.model('LuckyDrawHistory', luckyDrawHistorySchema);
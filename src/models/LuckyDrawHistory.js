import mongoose from 'mongoose';

// Winner schema
const winnerSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
  userId: { type: String, required: true }, // Firebase UID
  position: { type: Number, required: true },
  reward: { type: String, default: 'No reward assigned' },
  drawDate: { type: String, required: true },
});

// Pre-save hook to set 'id' as '_id' in winner schema
winnerSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

// Participant schema
const participantSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
  userId: { type: String, required: true }, // Firebase UID
});

// Pre-save hook to set 'id' as '_id' in participant schema
participantSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

// Lucky draw history schema
const luckyDrawHistorySchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
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

// Pre-save hook to set 'id' as '_id' in luckyDrawHistory schema
luckyDrawHistorySchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('LuckyDrawHistory', luckyDrawHistorySchema);

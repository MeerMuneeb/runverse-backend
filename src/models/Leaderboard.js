import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  name: { type: String },
  picture: { type: String },
  eventId: { type: String, required: true },
  packageId: { type: String, required: true },
  duration: { type: Number, required: true },
  rank: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Leaderboard', leaderboardSchema);

import mongoose from 'mongoose';

const teamLeaderboardSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  name: String,
  created_by: String,
  logo: String,
  members: Number,
  eventId: String,
  packageId: String,
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  rank: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('TeamLeaderboard', teamLeaderboardSchema);

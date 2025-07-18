import mongoose from 'mongoose';

const teamLeaderboardSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
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

// Pre-save hook to set 'id' as '_id'
teamLeaderboardSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('TeamLeaderboard', teamLeaderboardSchema);

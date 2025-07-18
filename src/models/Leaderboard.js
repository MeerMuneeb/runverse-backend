import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
  uid: { type: String, required: true },
  name: { type: String },
  picture: { type: String },
  eventId: { type: String, required: true },
  packageId: { type: String, required: true },
  duration: { type: Number, required: true },
  rank: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Pre-save hook to set 'id' as '_id'
leaderboardSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('Leaderboard', leaderboardSchema);

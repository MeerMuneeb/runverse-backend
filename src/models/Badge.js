import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  id: { type: String }, // Add the custom 'id' field
  name: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: String, required: true },
  status: { type: String, default: 'active' },
  tokens: { type: Number },
  created_at: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }, // ✅ Added
});

// Pre-save hook to set 'id' as '_id'
badgeSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('Badge', badgeSchema);

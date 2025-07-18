import mongoose from 'mongoose';

// Milestone schema
const milestoneSchema = new mongoose.Schema({
  milestone_name: { type: String, required: true }, // was 'title'
  milestone_point: { type: Number, required: true }, // was 'target'
  reward_id: { type: String, default: '' },
  badge_id: { type: String, default: '' },
  spinner_id: { type: String, default: '' },
}, { _id: false });

// Achievement schema
const achievementSchema = new mongoose.Schema({
  id: { type: String, unique: true },  // Adding custom 'id' field
  name: { type: String, required: true },
  pkg_id: { type: String, required: true, unique: true },  // Retaining the original pkg_id
  milestone_count: { type: Number, required: true },
  milestones: { type: [milestoneSchema], required: true },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Pre-save hook to set 'id' as '_id' before saving
achievementSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = this._id.toString();  // Use MongoDB's default '_id' as 'id'
  }
  next();
});

// Creating and exporting the model
export default mongoose.model('Achievement', achievementSchema);

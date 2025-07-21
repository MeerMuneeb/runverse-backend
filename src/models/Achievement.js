import mongoose from 'mongoose';

// Distance-based Milestone schema
const milestoneSchema = new mongoose.Schema({
  milestone_name: { type: String, required: true },
  milestone_point: { type: Number, required: true },
  reward_id: { type: String, default: '' },
  badge_id: { type: String, default: '' },
  spinner_id: { type: String, default: '' },
}, { _id: false });

// QR-based Milestone schema
const qrMilestoneSchema = new mongoose.Schema({
  qr_milestone_name: { type: String, required: true },
  reward_id: { type: String, default: '' },
}, { _id: false });

// Achievement schema
const achievementSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  pkg_id: { type: String, required: true, unique: true },
  milestone_count: { type: Number, required: true },       // for distance milestones
  qr_milestone_count: { type: Number, required: true },    // for QR milestones
  milestones: { type: [milestoneSchema], default: [] },    // optional
  qr_milestones: { type: [qrMilestoneSchema], default: [] }, // optional
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// Set 'id' before saving
achievementSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

export default mongoose.model('Achievement', achievementSchema);

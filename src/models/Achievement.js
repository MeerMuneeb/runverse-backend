import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  milestone_name: { type: String, required: true }, // was 'title'
  milestone_point: { type: Number, required: true }, // was 'target'
  reward_id: { type: String, default: '' },
  badge_id: { type: String, default: '' },
  spinner_id: { type: String, default: '' },
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pkg_id: { type: String, required: true, unique: true },
  milestone_count: { type: Number, required: true },
  milestones: { type: [milestoneSchema], required: true },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Achievement', achievementSchema);

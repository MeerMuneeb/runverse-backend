import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: String, required: true },
  status: { type: String, default: 'active' },
  tokens: { type: Number },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Badge', badgeSchema);

import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  type: { type: String, required: true },
  productId: { type: String },
  vendorId: { type: String },
  discountPercentage: { type: Number },
  productPicture: { type: String, default: '' },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Reward', rewardSchema);

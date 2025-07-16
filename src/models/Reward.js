import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['free_item', 'product_discount', 'vendor_discount', 'sitewide_discount']
  },
  productId: { type: String, default: null },
  vendorId: { type: String, default: null },
  discountPercentage: { type: Number, default: null },
  tokens: { type: Number, default: 0 }, // 🟢 Added field
  productPicture: { type: String, default: '' },
  status: { type: String, default: 'active' },
  created_at: {
    _seconds: { type: Number },
    _nanoseconds: { type: Number }
  }, // 🟢 Firestore format
  updatedAt: {
    _seconds: { type: Number },
    _nanoseconds: { type: Number }
  } // 🟢 Firestore format
});

export default mongoose.model('Reward', rewardSchema);

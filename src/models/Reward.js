import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
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

// Pre-save hook to set 'id' as '_id'
rewardSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('Reward', rewardSchema);

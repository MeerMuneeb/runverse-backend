// ✅ Mongoose Ad model
import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  adType: { type: String, required: true },
  format: { type: String, enum: ['custom', 'image'], required: true },
  heading: String,
  subheading: String,
  description: String,
  url: { type: String, required: true },
  logo: String,
  image: String,
  bgColor: String,
  bgGradient: String,
  fontColor: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  displayCount: { type: Number, required: true },
  perDayDisplayCount: { type: Number, required: true },
  displayedToday: { type: Number, default: 0 },
  displayedThisMonth: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

adSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

const Ad = mongoose.model('Ad', adSchema);

// ✅ Ad click rate setting schema
const adSettingsSchema = new mongoose.Schema({
  perAdClickRate: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const AdSettings = mongoose.model('AdSettings', adSettingsSchema);

export { Ad, AdSettings };

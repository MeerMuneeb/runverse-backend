import mongoose from 'mongoose';

// Item schema
const itemSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field for Item
  item_name: { type: String, required: true },
  reward_id: { type: String, required: true },
}, { _id: false });

// Pre-save hook to set 'id' as '_id' for Item schema
itemSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

// Spinner schema
const spinnerSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field for Spinner
  name: { type: String, required: true },
  pkg_id: { type: String, required: true },
  status: { type: String, default: 'active' },
  items: { type: [itemSchema], default: [] },
  created_at: { type: Date, default: Date.now },
});

// Pre-save hook to set 'id' as '_id' for Spinner schema
spinnerSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('Spinner', spinnerSchema);

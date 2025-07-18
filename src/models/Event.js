import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field
  name: { type: String, required: true },
  logo: { type: String, required: true },
  status: { type: String, default: 'inactive' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  scanDescription: { type: String, default: '' }, // newly added
  scanUrl: { type: String, default: '' },         // newly added
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to set 'id' as '_id'
eventSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('Event', eventSchema);

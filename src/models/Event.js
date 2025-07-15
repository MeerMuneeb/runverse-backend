import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  status: { type: String, default: 'inactive' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Event', eventSchema);

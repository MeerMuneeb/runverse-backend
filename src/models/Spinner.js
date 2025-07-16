import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  reward_id: { type: String, required: true },
}, { _id: false });

const spinnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pkg_id: { type: String, required: true },
  status: { type: String, default: 'active' },
  items: { type: [itemSchema], default: [] },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model('Spinner', spinnerSchema);

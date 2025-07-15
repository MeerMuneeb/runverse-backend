import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    index: true
  },
  name: String,
  map: {
    id: String,
    name: String,
    area_type: String,
  },
  package: {
    id: String,
    name: String,
  },
  payment_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  rewards: [
    {
      id: String,
      name: String,
    }
  ],
  spinners: [
    {
      id: String,
      name: String,
    }
  ],
  badges: [
    {
      id: String,
      name: String,
    }
  ],
  goal: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  team: {
    id: String,
    name: String,
    members: [String],
  },
  stats: {
    distance: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    race: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  completedMilestones: { type: Number, default: 0 },
  totalMilestones: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('UserHistory', HistorySchema);

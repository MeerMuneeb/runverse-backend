import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  id: { type: String },  // Add custom 'id' field for the main document
  uid: {
    type: String,
    required: true,
    index: true
  },
  name: String,

  map: {
    id: String,
    name: String,
    area_type: String
  },

  package: {
    id: String,
    name: String
  },

  payment_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  rewards: [{
    id: String,
    name: String
  }],

  spinners: [{
    id: String,
    name: String
  }],

  badges: [{
    id: String,
    name: String
  }],

  goal: {
    type: Number,
    default: 0
  },

  team: {
    id: String,
    name: String,
    members: {
      type: mongoose.Schema.Types.Mixed,
      default: 0 // can be number or array depending on use
    }
  },

  stats: {
    distance: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    race: { type: String, default: null }
  },

  completedMilestones: { type: Number, default: 0 },
  totalMilestones: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to set 'id' as '_id' for the main document only
HistorySchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id' for the main document
  }
  next();
});

export default mongoose.model('UserHistory', HistorySchema);

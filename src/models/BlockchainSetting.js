import mongoose from 'mongoose';

const PackageTokenSchema = new mongoose.Schema({
  pkgId: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], required: true },
  tokens: { type: Number, required: true }
}, { _id: false });

const BlockchainSettingSchema = new mongoose.Schema({
  allocatedTokens: { type: Number, default: 0 },

  badgesStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  badgesTokens: { type: Number, default: 0 },

  distanceStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  distanceTokens: {
    type: Map,
    of: new mongoose.Schema({
      tokens: { type: Number }
    }, { _id: false }),
    default: {}
  },

  loginStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  loginTokens: { type: Number, default: 0 },

  packagesStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  packageTokens: { type: [PackageTokenSchema], default: [] },

  registrationStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  registrationTokens: { type: Number, default: 0 },

  rewardsStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  rewardsTokens: { type: Number, default: 0 },

  spentTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },

  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('BlockchainSetting', BlockchainSettingSchema);

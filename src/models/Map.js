import mongoose from 'mongoose';

// Coordinate schema
const CoordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

// Route schema
const RouteSchema = new mongoose.Schema({
  id: { type: Number, required: true },  // Custom 'id' field for Route
  name: { type: String, required: true },
  coordinates: [CoordinateSchema]
}, { _id: false });

// Map schema
const MapSchema = new mongoose.Schema({
  id: { type: String },  // Custom 'id' field for Map
  area_type: { type: String, enum: ['indoor', 'outdoor'], required: true },
  name: { type: String },
  img: { type: String },
  eventId: { type: String, required: true },
  created_at: {
    _seconds: { type: Number, required: true },
    _nanoseconds: { type: Number, required: true }
  },
  routes: { type: [RouteSchema], default: [] },
  coordinates: { type: [CoordinateSchema], default: [] }
});

// Pre-save hook to set 'id' as '_id' for MapSchema
MapSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

// Pre-save hook to set 'id' as '_id' for RouteSchema
RouteSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();  // Set 'id' to MongoDB's '_id'
  }
  next();
});

export default mongoose.model('Map', MapSchema);

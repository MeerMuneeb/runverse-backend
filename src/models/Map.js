import mongoose from 'mongoose';

const CoordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const RouteSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  coordinates: [CoordinateSchema]
}, { _id: false });

const MapSchema = new mongoose.Schema({
  id: { type: String, required: true },
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

export default mongoose.model('Map', MapSchema);

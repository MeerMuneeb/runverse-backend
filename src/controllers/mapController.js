// import admin from 'firebase-admin';
// import { uploadToWordPress } from '../utils/uploadToWordPress.js';

// export const createMap = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const { area_type, name, eventId } = req.body;
//         let img;

//         if (req.file) {
//             const imageUrl = await uploadToWordPress(req.file);
//             img = imageUrl;
//             console.log('Image uploaded successfully:', imageUrl);
//         }

//         if (!area_type || !name || !img || !eventId) {
//             return res.status(400).json({ message: 'Invalid input data' });
//         }

//         const newMap = {
//             area_type,
//             name,
//             img,
//             eventId,
//             created_at: new Date(),
//         };

//         const docRef = await db.collection('map').add(newMap);
//         console.log("Document created with ID:", docRef.id);  // Ensure doc creation is logged
//         res.status(201).json({ id: docRef.id, ...newMap });
//     } catch (error) {
//         console.log("Error while creating map:", error);  // Log error for debugging
//         res.status(500).json({ message: 'Failed to create map', error });
//     }
// };


// // GET /maps?area_type=...&eventId=...
// export const getMaps = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const { area_type, eventId } = req.query;
//         let query = db.collection('map');
//         if (area_type) {
//             query = query.where('area_type', '==', area_type);
//         }
//         if (eventId) {
//             query = query.where('eventId', '==', eventId);
//         }
//         const snapshot = await query.get();
//         const maps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         res.status(200).json(maps);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch maps', error });
//     }
// };

// export const getMapById = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const { id } = req.params;
//         const doc = await db.collection('map').doc(id).get();
//         if (!doc.exists) {
//             return res.status(404).json({ message: 'Map not found' });
//         }
//         res.status(200).json({ id: doc.id, ...doc.data() });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch map', error });
//     }
// };

// export const updateMap = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const { id } = req.params;
//         let updates = req.body;

//         // Handle image upload if file is present
//         if (req.file) {
//             const imageUrl = await uploadToWordPress(req.file);
//             updates.img = imageUrl;
//             console.log('Image uploaded successfully:', imageUrl);
//         }

//         await db.collection('map').doc(id).update(updates);
//         res.status(200).json({ message: 'Map updated successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to update map', error });
//     }
// };

// export const deleteMap = async (req, res) => {
//     try {
//         const db = admin.firestore();
//         const { id } = req.params;
//         await db.collection('map').doc(id).delete();
//         res.status(200).json({ message: 'Map deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to delete map', error });
//     }
// };

import Map from '../models/Map.js';
import { uploadToWordPress } from '../utils/uploadToWordPress.js';

// Utility: convert JS Date to Firestore-like timestamp format
const generateFirestoreTimestamp = (date = new Date()) => ({
  _seconds: Math.floor(date.getTime() / 1000),
  _nanoseconds: (date.getMilliseconds() % 1000) * 1e6,
});

// ✅ Create Map
export const createMap = async (req, res) => {
  try {
    const { id, area_type, name, eventId, routes = [], coordinates = [] } = req.body;
    let img;

    if (req.file) {
      img = await uploadToWordPress(req.file);
      console.log('Image uploaded successfully:', img);
    }

    if (!id || !area_type || !name || !img || !eventId) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const newMap = new Map({
      id,
      area_type,
      name,
      img,
      eventId,
      routes,
      coordinates,
      created_at: generateFirestoreTimestamp(),
    });

    const saved = await newMap.save();
    console.log('Document created with ID:', saved.id);
    res.status(201).json({ id: saved.id, ...saved._doc });
  } catch (error) {
    console.error('Error while creating map:', error);
    res.status(500).json({ message: 'Failed to create map', error });
  }
};

// ✅ Get Maps with optional filters
export const getMaps = async (req, res) => {
  try {
    const { area_type, eventId } = req.query;
    const filter = {};

    if (area_type) filter.area_type = area_type;
    if (eventId) filter.eventId = eventId;

    const maps = await Map.find(filter).lean();
    res.status(200).json(maps.map(doc => ({ id: doc.id, ...doc })));
  } catch (error) {
    console.error('Error fetching maps:', error);
    res.status(500).json({ message: 'Failed to fetch maps', error });
  }
};

// ✅ Get Map by ID
export const getMapById = async (req, res) => {
  try {
    const { id } = req.params;
    const map = await Map.findOne({ id }).lean();
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    res.status(200).json({ id: map.id, ...map });
  } catch (error) {
    console.error('Error fetching map:', error);
    res.status(500).json({ message: 'Failed to fetch map', error });
  }
};

// ✅ Update Map
export const updateMap = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      updates.img = await uploadToWordPress(req.file);
      console.log('Image uploaded successfully:', updates.img);
    }

    const updated = await Map.findOneAndUpdate({ id }, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Map not found' });
    }

    res.status(200).json({ message: 'Map updated successfully' });
  } catch (error) {
    console.error('Error updating map:', error);
    res.status(500).json({ message: 'Failed to update map', error });
  }
};

// ✅ Delete Map
export const deleteMap = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Map.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ message: 'Map not found' });
    }

    res.status(200).json({ message: 'Map deleted successfully' });
  } catch (error) {
    console.error('Error deleting map:', error);
    res.status(500).json({ message: 'Failed to delete map', error });
  }
};


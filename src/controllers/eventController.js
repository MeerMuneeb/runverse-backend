// import admin from '../config/firebase.js';
// import { uploadToWordPress } from '../utils/uploadToWordPress.js';
// import { sendPushNotificationToMultipleDevices } from '../utils/sendPushNotification.js';

// const COLLECTION = 'events';

// export const createEvent = async (req, res) => {
//   try {
//     const db = admin.firestore();
//     const { name, startDate, endDate, description, location, status} = req.body;
//     let logo;

//     // Upload logo if file present
//     if (req.file) {
//       logo = await uploadToWordPress(req.file);
//       console.log('Logo uploaded:', logo);
//     }

//     if (!name || !startDate || !endDate || !logo) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Determine status based on dates (optional: compute here or keep updated on client/cron)
//     const now = new Date();
//     const sDate = new Date(startDate);
//     const eDate = new Date(endDate);
//     const computedStatus = now >= sDate && now <= eDate ? 'active' : 'inactive';

//     const newEvent = {
//       name,
//       logo,
//       status: computedStatus,
//       startDate: admin.firestore.Timestamp.fromDate(sDate),
//       endDate: admin.firestore.Timestamp.fromDate(eDate),
//       description: description || '',
//       location: location || '',
//       createdAt: admin.firestore.Timestamp.now(),
//       updatedAt: admin.firestore.Timestamp.now(),
//     };

//     const docRef = await db.collection(COLLECTION).add(newEvent);

//     // Send notifications to all users
//     const usersSnapshot = await db.collection('users').get();  // Fetch all users from Firestore
//     const userTokens = usersSnapshot.docs.map(doc => doc.data().fcmToken).filter(token => token); // Get all valid FCM tokens
    
//     if (userTokens.length > 0) {
//       sendPushNotificationToMultipleDevices(userTokens, `New Event: ${name}`, 'Join the event to get new and exciting prizes!');
//     } else {
//       return res.status(404).json({ error: 'No valid FCM tokens found' });
//     }

//     // Respond with success
//     res.status(201).json({ id: docRef.id, ...newEvent });
//   } catch (error) {
//     console.error('Failed to create event:', error);
//     res.status(500).json({ message: 'Failed to create event' });
//   }
// };

// export const getEvents = async (req, res) => {
//   try {
//     const db = admin.firestore();
//     let query = db.collection(COLLECTION);

//     // Optional: filter by status query param
//     if (req.query.status) {
//       query = query.where('status', '==', req.query.status);
//     }

//     // Optional: filter by luckydraw query param
//     if (req.query.luckydraw === 'true') {
//       // Get all eventIds from the 'luckydraws' collection
//       const luckydrawSnapshot = await db.collection('luckydraws').get();
//       const luckydrawEventIds = luckydrawSnapshot.docs.map(doc => doc.data().eventId); // Assuming 'eventId' is a field inside each lucky draw document

//       // If no luckydraw eventIds found, return empty result
//       if (luckydrawEventIds.length === 0) {
//         return res.status(200).json([]);
//       }

//       // Filter the events by the eventIds found in luckydraws
//       query = query.where('eventId', 'in', luckydrawEventIds);
//     }


//     const snapshot = await query.get();
//     const now = new Date();
//     const batch = db.batch();
//     let hasBatchOperations = false; // Flag to check if any updates are added to batch

//     const events = snapshot.docs.map(doc => {
//       const data = doc.data();
//       let endDate = data.endDate;

//       // Convert Firestore Timestamp to Date object if needed
//       if (endDate && endDate.toDate) {
//         endDate = endDate.toDate();
//       } else if (typeof endDate === 'string') {
//         endDate = new Date(endDate); // Handle string format and convert to Date
//       }

//       // If event has ended (endDate <= now) and status is not inactive, update it
//       if (endDate && now >= endDate && data.status !== 'inactive') {
//         batch.update(doc.ref, { status: 'inactive' });
//         hasBatchOperations = true; // Mark batch operation
//         data.status = 'inactive';  // Update local event data
//       }

//       return { id: doc.id, ...data };
//     });

//     // Commit batch updates only if there are any batch operations
//     if (hasBatchOperations) {
//       await batch.commit();
//     }

//     res.status(200).json(events);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch events', error });
//   }
// };

// export const getEventById = async (req, res) => {
//   try {
//     const db = admin.firestore();
//     const doc = await db.collection(COLLECTION).doc(req.params.id).get();
//     if (!doc.exists) {
//       return res.status(404).json({ message: 'Event not found' });
//     }
//     const data = doc.data();
//     let endDate = data.endDate;
//     if (endDate && endDate.toDate) {
//       endDate = endDate.toDate();
//     }
//     const now = new Date();
//     // If event has ended and status is not inactive, update it
//     if (endDate && now > endDate && data.status !== 'inactive') {
//       await doc.ref.update({ status: 'inactive' });
//       data.status = 'inactive';
//     }
//     res.status(200).json({ id: doc.id, ...data });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch event', error });
//   }
// };

// export const updateEvent = async (req, res) => {
//   try {
//     const db = admin.firestore();
//     const updates = { ...req.body };

//     if (req.file) {
//       const logo = await uploadToWordPress(req.file);
//       updates.logo = logo;
//       console.log('Logo uploaded:', logo);
//     }

//     // Update updatedAt timestamp
//     updates.updatedAt = admin.firestore.Timestamp.now();

//     await db.collection(COLLECTION).doc(req.params.id).update(updates);
//     res.status(200).json({ message: 'Event updated successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update event', error });
//   }
// };

// export const deleteEvent = async (req, res) => {
//   try {
//     const db = admin.firestore();
//     await db.collection(COLLECTION).doc(req.params.id).delete();
//     res.status(200).json({ message: 'Event deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to delete event', error });
//   }
// };

import Event from '../models/Event.js';
import { uploadToWordPress } from '../utils/uploadToWordPress.js';
import { sendPushNotificationToMultipleDevices } from '../utils/sendPushNotification.js';
import admin from '../config/firebase.js'; // Only used to fetch FCM tokens from Firebase

export const createEvent = async (req, res) => {
  try {
    const { name, startDate, endDate, description, location } = req.body;
    let logo;

    if (req.file) {
      logo = await uploadToWordPress(req.file);
      console.log('Logo uploaded:', logo);
    }

    if (!name || !startDate || !endDate || !logo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const now = new Date();
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const computedStatus = now >= sDate && now <= eDate ? 'active' : 'inactive';

    const newEvent = new Event({
      name,
      logo,
      startDate: sDate,
      endDate: eDate,
      description: description || '',
      location: location || '',
      status: computedStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await newEvent.save();

    // Send push notifications
    const usersSnapshot = await admin.firestore().collection('users').get();
    const userTokens = usersSnapshot.docs.map(doc => doc.data().fcmToken).filter(Boolean);

    if (userTokens.length > 0) {
      await sendPushNotificationToMultipleDevices(
        userTokens,
        `New Event: ${name}`,
        'Join the event to get new and exciting prizes!'
      );
    } else {
      return res.status(404).json({ error: 'No valid FCM tokens found' });
    }

    res.status(201).json({ id: saved._id, ...saved._doc });
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { status, luckydraw } = req.query;
    const now = new Date();
    let filter = {};

    if (status) filter.status = status;

    // Handle lucky draw filter
    if (luckydraw === 'true') {
      const snapshot = await admin.firestore().collection('luckydraws').get();
      const luckydrawEventIds = snapshot.docs.map(doc => doc.data().eventId);
      if (!luckydrawEventIds.length) return res.status(200).json([]);
      filter._id = { $in: luckydrawEventIds };
    }

    const events = await Event.find(filter);
    const updates = [];

    const result = events.map(event => {
      const e = event.toObject();

      if (e.endDate && now >= e.endDate && e.status !== 'inactive') {
        updates.push(Event.updateOne({ _id: e._id }, { status: 'inactive' }));
        e.status = 'inactive';
      }

      return { id: e._id, ...e };
    });

    if (updates.length > 0) await Promise.all(updates);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const now = new Date();
    const e = event.toObject();

    if (e.endDate && now > e.endDate && e.status !== 'inactive') {
      await Event.updateOne({ _id: e._id }, { status: 'inactive' });
      e.status = 'inactive';
    }

    res.status(200).json({ id: e._id, ...e });
  } catch (error) {
    console.error('Failed to fetch event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      const logo = await uploadToWordPress(req.file);
      updates.logo = logo;
      console.log('Logo uploaded:', logo);
    }

    updates.updatedAt = new Date();

    await Event.findByIdAndUpdate(req.params.id, updates);
    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ message: 'Failed to update event', error });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ message: 'Failed to delete event', error });
  }
};

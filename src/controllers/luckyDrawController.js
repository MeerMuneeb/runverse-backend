import admin from '../config/firebase.js'; // Firebase Admin SDK
import { getRandomParticipants } from '../utils/randomDraw.js'; // Utility to get random winners
import { uploadToWordPress } from '../utils/uploadToWordPress.js';

const COLLECTION = 'luckyDraws'; // Firebase collection for lucky draws

// Create a new Lucky Draw
export const createLuckyDraw = async (req, res) => {
  try {
    const db = admin.firestore();
    const {
      eventId,
      drawDate,
      maxEntries,
      maxTotalEntries,
      entryPriceCurrency,
      entryPriceTokens,
      numWinners,
    } = req.body;

    const existingDraw = await db.collection(COLLECTION).where('eventId', '==', eventId).get();
    if (!existingDraw.empty) {
      return res.status(400).json({ message: 'Lucky draw already exists for this event.' });
    }

    const luckyDraw = {
      eventId,
      drawDate: admin.firestore.Timestamp.fromDate(new Date(drawDate)),
      maxEntries,
      maxTotalEntries,
      entryPriceCurrency,
      entryPriceTokens,
      numWinners,
      active: true,
      participants: [], // Empty until users join
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection(COLLECTION).add(luckyDraw);
    res.status(201).json({ id: docRef.id, ...luckyDraw });
  } catch (error) {
    console.error('Failed to create lucky draw:', error);
    res.status(500).json({ message: 'Failed to create lucky draw' });
  }
};

// Update an existing Lucky Draw (e.g., draw date)
export const updateLuckyDraw = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId } = req.params;
    const updateFields = req.body;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];

    // If drawDate is present, convert to Firestore Timestamp
    if (updateFields.drawDate) {
      updateFields.drawDate = admin.firestore.Timestamp.fromDate(new Date(updateFields.drawDate));
    }

    updateFields.updatedAt = admin.firestore.Timestamp.now();

    await luckyDraw.ref.update(updateFields);

    res.status(200).json({ message: 'Lucky draw updated successfully' });
  } catch (error) {
    console.error('Failed to update lucky draw:', error);
    res.status(500).json({ message: 'Failed to update lucky draw' });
  }
};

// User joins a lucky draw
export const joinLuckyDraw = async (req, res) => {
  try {
    const db = admin.firestore();
    const { userId, eventId } = req.body;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    const participants = luckyDraw.data().participants;

    if (participants.includes(userId)) {
      return res.status(400).json({ message: 'You have already joined this lucky draw.' });
    }

    // Add the user to the participants list
    participants.push(userId);
    await luckyDraw.ref.update({ participants });

    res.status(200).json({ message: 'You have successfully joined the lucky draw.' });
  } catch (error) {
    console.error('Failed to join lucky draw:', error);
    res.status(500).json({ message: 'Failed to join lucky draw' });
  }
};

// User buys additional entries (either via tokens or currency)
export const buyEntry = async (req, res) => {
  try {
    const db = admin.firestore();
    const { userId, eventId, entryCount, paymentMethod } = req.body;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    const { maxEntries, participants, entryPriceTokens, entryPriceCurrency } = luckyDraw.data();

    // Calculate the user's current entries in the draw
    const userEntries = participants.filter(user => user === userId).length;
    if (userEntries + entryCount > maxEntries) {
      return res.status(400).json({ message: 'You cannot buy more than the maximum entries allowed.' });
    }

    // Deduct payment based on method
    if (paymentMethod === 'tokens') {
      // Deduct tokens (logic here will depend on your app's user system)
      // Assuming you have a User model with `tokens` field
      // User.updateUserTokens(userId, entryPriceTokens * entryCount); 
    } else if (paymentMethod === 'currency') {
      // Handle Stripe payment (integration logic here)
      // Assuming you have implemented Stripe integration
    } else {
      return res.status(400).json({ message: 'Invalid payment method.' });
    }

    // Add new entries for the user
    for (let i = 0; i < entryCount; i++) {
      participants.push(userId);
    }

    await luckyDraw.ref.update({ participants });

    res.status(200).json({ message: 'Entries purchased successfully.' });
  } catch (error) {
    console.error('Failed to buy entry:', error);
    res.status(500).json({ message: 'Failed to buy entry' });
  }
};

// Admin draws the lucky draw (random selection of winners)
export const drawWinners = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId } = req.params;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    const participants = luckyDraw.data().participants;
    const numWinners = luckyDraw.data().numWinners;

    if (participants.length < numWinners) {
      return res.status(400).json({ message: 'Not enough participants for the draw.' });
    }

    // Select random winners
    const winners = getRandomParticipants(participants, numWinners);

    // Prepare winners with position and reward info
    const rewards = luckyDraw.data().rewards || [];
    const drawDate = luckyDraw.data().drawDate?.toDate?.() || new Date();
    const formattedDrawDate = drawDate.toISOString().split('T')[0];

    const winnersWithDetails = winners.map((userId, idx) => ({
      userId,
      position: idx + 1,
      reward: rewards[idx]?.title || null,
      drawDate: formattedDrawDate,
    }));

    // Prepare participants in the required format
    const participantsFormatted = participants.map(userId => ({ userId }));

    // Save to history collection
    await db.collection('luckyDrawHistory').add({
      eventId,
      winners: winnersWithDetails,
      participants: participantsFormatted,
      drawDate: formattedDrawDate,
      numWinners: luckyDraw.data().numWinners,
      maxEntries: luckyDraw.data().maxEntries,
      entryPrice: luckyDraw.data().entryPriceTokens || luckyDraw.data().entryPriceCurrency || null,
      createdAt: luckyDraw.data().createdAt?.toDate?.().toISOString().split('T')[0] || null,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    // Deactivate the lucky draw and save winners
    await luckyDraw.ref.update({
      active: false,
      winners: winnersWithDetails,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    res.status(200).json({ message: 'Lucky draw completed successfully', winners });
  } catch (error) {
    console.error('Failed to draw winners:', error);
    res.status(500).json({ message: 'Failed to draw winners' });
  }
};

// Add a reward to the lucky draw
export const addReward = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId } = req.params;
    const { title, position } = req.body;
    let picture;

    // Upload picture if file is present
    if (req.file) {
      const imageUrl = await uploadToWordPress(req.file);
      picture = imageUrl; // Save the image URL in picture
      console.log('Reward image uploaded successfully:', imageUrl);
    }

    // Validate input data
    if (!title || !position || !picture) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Fetch the lucky draw document by eventId
    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    console.log('Fetching lucky draw for eventId:', luckyDrawRef.get());
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    // Get the lucky draw document and its rewards
    const luckyDraw = snapshot.docs[0];
    let rewards = luckyDraw.data().rewards || [];  // Ensure rewards is initialized as an empty array if undefined

    // Add the new reward to the rewards array
    const newReward = { title, picture, position };
    rewards.push(newReward);

    // Update the lucky draw with the new rewards list
    await luckyDraw.ref.update({ rewards });

    res.status(200).json({ message: 'Reward added successfully', newReward });
  } catch (error) {
    console.error('Failed to add reward:', error);
    res.status(500).json({ message: 'Failed to add reward' });
  }
};

// Edit an existing reward in the lucky draw
export const editReward = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId, rewardId } = req.params;
    const { title, position } = req.body;
    let picture;

    // Upload picture if file present
    if (req.file) {
      const imageUrl = await uploadToWordPress(req.file);
      picture = imageUrl; // Save the image URL in picture
      console.log('Reward image uploaded successfully:', imageUrl);
    }

    // Fetch the lucky draw document for the given eventId
    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    let rewards = luckyDraw.data().rewards || [];  // Ensure rewards is initialized as an empty array if undefined

    // Find the reward by array index (rewardId is the index)
    const rewardIndex = parseInt(rewardId, 10);

    if (rewardIndex === -1) {
      return res.status(404).json({ message: 'Reward not found.' });
    }

    // Update the reward details
    rewards[rewardIndex] = {
      ...rewards[rewardIndex],
      title: title || rewards[rewardIndex].title,
      picture: picture || rewards[rewardIndex].picture,
      position: position || rewards[rewardIndex].position,
    };

    // Update the lucky draw with the updated rewards array
    await luckyDraw.ref.update({ rewards });

    res.status(200).json({
      message: 'Reward updated successfully',
      updatedReward: rewards[rewardIndex],
    });
  } catch (error) {
    console.error('Failed to edit reward:', error);
    res.status(500).json({ message: 'Failed to edit reward' });
  }
};

// Delete a reward from the lucky draw
export const deleteReward = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId, rewardId } = req.params;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    let rewards = luckyDraw.data().rewards;

    // Remove the reward by position (or ID if you have one)
    rewards = rewards.filter(reward => reward.position !== parseInt(rewardId));

    // Update the lucky draw with the modified rewards list
    await luckyDraw.ref.update({ rewards });

    res.status(200).json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Failed to delete reward:', error);
    res.status(500).json({ message: 'Failed to delete reward' });
  }
};

// Get a lucky draw by eventId
export const getLuckyDraw = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId } = req.params;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    res.status(200).json({ id: luckyDraw.id, ...luckyDraw.data() });
  } catch (error) {
    console.error('Failed to get lucky draw:', error);
    res.status(500).json({ message: 'Failed to get lucky draw' });
  }
};

// Get all lucky draws
export const getAllLuckyDraws = async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection(COLLECTION).get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const luckyDraws = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(luckyDraws);
  } catch (error) {
    console.error('Failed to get all lucky draws:', error);
    res.status(500).json({ message: 'Failed to get all lucky draws' });
  }
};

// Get all lucky draws (history)
export const getLuckyDrawHistory = async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('luckyDrawHistory').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error('Failed to get lucky draw history:', error);
    res.status(500).json({ message: 'Failed to get lucky draw history' });
  }
};

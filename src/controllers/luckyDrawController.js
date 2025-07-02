import admin from '../config/firebase.js'; // Firebase Admin SDK
import { getRandomParticipants } from '../utils/randomDraw.js'; // Utility to get random winners

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
    const { drawDate } = req.body;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    await luckyDraw.ref.update({
      drawDate: admin.firestore.Timestamp.fromDate(new Date(drawDate)),
      updatedAt: admin.firestore.Timestamp.now(),
    });

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

    // Save the winners to the lucky draw history (you can also create a separate collection for history)
    await luckyDraw.ref.update({
      active: false, // Deactivate the lucky draw after the draw is complete
      winners,
    });

    res.status(200).json({ message: 'Lucky draw completed successfully', winners });
  } catch (error) {
    console.error('Failed to draw winners:', error);
    res.status(500).json({ message: 'Failed to draw winners' });
  }
};

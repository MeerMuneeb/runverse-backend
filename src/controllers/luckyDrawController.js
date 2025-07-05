import admin from '../config/firebase.js'; // Firebase Admin SDK
import { getRandomParticipants } from '../utils/randomDraw.js'; // Utility to get random winners
import { uploadToWordPress } from '../utils/uploadToWordPress.js';
import stripe from '../config/stripe.js';

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

    // Convert entryPriceCurrency to a number if it's a string
    const parsedEntryPriceCurrency = typeof entryPriceCurrency === 'string' ? Number(entryPriceCurrency) : entryPriceCurrency;

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
export const joinLuckyDraw = async (userId, eventId) => {
  try {
    const db = admin.firestore();

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return { success: false, message: 'Lucky draw not found for this event.' };
    }

    const luckyDraw = snapshot.docs[0];
    const data = luckyDraw.data();
    const participants = data.participants || [];
    const maxEntries = data.maxEntries;

    // Count how many times the user has already joined
    const userEntries = participants.filter(uid => uid === userId).length;

    if (userEntries >= maxEntries) {
      return { success: false, message: `You have reached the maximum allowed entries (${maxEntries}) for this lucky draw.` };
    }

    // Add the user to the participants list
    participants.push(userId);
    await luckyDraw.ref.update({ participants });

    return { success: true, message: 'You have successfully joined the lucky draw.' };
  } catch (error) {
    console.error('Failed to join lucky draw:', error);
    return { success: false, message: 'Failed to join lucky draw' };
  }
};

// User buys additional entries (either via tokens or currency)
// export const buyEntry = async (req, res) => {
//   const { userId, eventId, entryCount, paymentMethod } = req.body;

//   if (!userId || !eventId || !entryCount || !paymentMethod) {
//     return res.status(400).json({ message: 'userId, eventId, entryCount, and paymentMethod are required' });
//   }

//   const db = admin.firestore();
//   const luckyDrawRef = db.collection('luckyDraws').where('eventId', '==', eventId);
//   const userRef = db.collection('users').doc(userId);
//   const walletRef = db.collection('wallets').doc(userId);

//   try {
//     const [luckyDrawSnap, userSnap, walletSnap] = await Promise.all([luckyDrawRef.get(), userRef.get(), walletRef.get()]);

//     if (luckyDrawSnap.empty) {
//       return res.status(404).json({ message: 'Lucky draw not found for this event.' });
//     }

//     if (!userSnap.exists) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     if (!walletSnap.exists) {
//       return res.status(404).json({ message: 'Wallet not found for user.' });
//     }

//     const luckyDraw = luckyDrawSnap.docs[0].data();
//     const { maxEntries, participants, entryPriceCurrency, entryPrice } = luckyDraw.data();
//     const wallet = walletSnap.data();

//     // Check if the user has enough entries or if they exceed max entries
//     const userEntries = participants.filter(user => user === userId).length;
//     if (userEntries + entryCount > maxEntries) {
//       return res.status(400).json({ message: 'You cannot buy more than the maximum entries allowed.' });
//     }

//     // Check if the user has sufficient balance
//     if (paymentMethod === 'currency') {
//       //STRIPE PAYMENT LOGIC HERE
//       }

//     else if (paymentMethod === 'tokens') {
//       if (wallet.balance < entryPrice * entryCount) {
//         return res.status(400).json({ message: 'Insufficient wallet balance' });
//       }

//       // Deduct the balance and add the transaction record
//       const createdAt = admin.firestore.Timestamp.now();
//       const newTransaction = {
//         type: 'debit',
//         amount: entryPrice * entryCount,
//         description: `Lucky Draw entry purchase: ${eventId}`,
//         eventId,
//         createdAt,
//       };

//       await walletRef.update({
//         balance: admin.firestore.FieldValue.increment(-(entryPrice * entryCount)),
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         transactions: admin.firestore.FieldValue.arrayUnion(newTransaction),
//       });
//     } else {
//       return res.status(400).json({ message: 'Invalid payment method. Only wallet currency is accepted.' });
//     }

//     // Add the user's new entries to the participants
//     for (let i = 0; i < entryCount; i++) {
//       participants.push(userId);
//     }

//     // Update the lucky draw participants list
//     await luckyDrawSnap.docs[0].ref.update({ participants });

//     res.status(200).json({ message: 'Entries purchased successfully.' });
//   } catch (error) {
//     console.error('Failed to buy entry:', error);
//     res.status(500).json({ message: 'Failed to buy entry' });
//   }
// };

export const buyEntry = async (req, res) => {
  const { userId, eventId, entryCount, paymentMethod } = req.body;

  if (!userId || !eventId || !entryCount || !paymentMethod) {
    return res.status(400).json({ message: 'userId, eventId, entryCount, and paymentMethod are required' });
  }

  const db = admin.firestore();
  const luckyDrawRef = db.collection('luckyDraws').where('eventId', '==', eventId);
  const userRef = db.collection('users').doc(userId);

  try {
    const [luckyDrawSnap, userSnap] = await Promise.all([luckyDrawRef.get(), userRef.get()]);

    if (luckyDrawSnap.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Accessing data correctly
    const luckyDraw = luckyDrawSnap.docs[0].data();
    const { maxEntries, participants, entryPriceCurrency, entryPriceTokens } = luckyDraw;

    // Log the values of entryPriceCurrency, entryPriceTokens, and entryCount for debugging
    console.log('Entry Price Currency:', entryPriceCurrency, 'Entry Price Tokens:', entryPriceTokens, 'Entry Count:', entryCount);

    // Ensure entryPriceCurrency and entryPriceTokens are valid numbers
    const parsedEntryPriceCurrency = parseFloat(entryPriceCurrency);
    const parsedEntryPriceTokens = parseFloat(entryPriceTokens);
    const parsedEntryCount = parseInt(entryCount, 10);

    console.log('Parsed Entry Price Currency:', parsedEntryPriceCurrency, 'Parsed Entry Price Tokens:', parsedEntryPriceTokens, 'Parsed Entry Count:', parsedEntryCount);

    // Check if entryPriceCurrency, entryPriceTokens, or entryCount is NaN
    if (isNaN(parsedEntryPriceCurrency) && isNaN(parsedEntryPriceTokens)) {
      return res.status(400).json({ message: 'Invalid entry price' });
    }

    if (isNaN(parsedEntryCount)) {
      return res.status(400).json({ message: 'Invalid entry count' });
    }

    // Check if the user has enough entries or if they exceed max entries
    const userEntries = participants.filter(user => user === userId).length;
    if (userEntries + parsedEntryCount > maxEntries) {
      return res.status(400).json({ message: 'You cannot buy more than the maximum entries allowed.' });
    }

    // Handle Stripe payment (currency method)
    if (paymentMethod === 'currency') {
      // Use existing customerId from user document
      const userDoc = userSnap.data();
      const customerId = userDoc.stripeCustomerId;

      if (!customerId) {
        return res.status(400).json({ message: 'User does not have a Stripe customer ID.' });
      }

      // Create Ephemeral Key for Stripe
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2024-04-10' }
      );

      // Create PaymentIntent for Stripe using entryPriceCurrency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parsedEntryPriceCurrency * parsedEntryCount, // Total price for the entries
        currency: 'usd',   // The currency you are using, ensure it matches entryPriceCurrency if needed
        customer: customerId,
        metadata: {
          firebaseUID: userId,
          eventId,
          entryCount: parsedEntryCount,
        },
      });

      // Return the PaymentIntent and EphemeralKey to the frontend
      return res.status(200).json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
        paymentIntentId: paymentIntent.id,
      });
    }

    else if (paymentMethod === 'tokens') {
      // Handle wallet payment method (using entryPriceTokens)
      const walletRef = db.collection('wallets').doc(userId);
      const walletSnap = await walletRef.get();
      const wallet = walletSnap.data();

      if (!wallet || wallet.balance < parsedEntryPriceTokens * parsedEntryCount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct the balance and add the transaction record
      const createdAt = admin.firestore.Timestamp.now();
      const newTransaction = {
        type: 'debit',
        amount: parsedEntryPriceTokens * parsedEntryCount,
        description: `Lucky Draw entry purchase: ${eventId}`,
        eventId,
        createdAt,
      };

      await walletRef.update({
        balance: admin.firestore.FieldValue.increment(-(parsedEntryPriceTokens * parsedEntryCount)),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        transactions: admin.firestore.FieldValue.arrayUnion(newTransaction),
      });

      // Add the user's new entries to the participants
      for (let i = 0; i < parsedEntryCount; i++) {
        participants.push(userId);
      }

      // Update the lucky draw participants list
      await luckyDrawSnap.docs[0].ref.update({ participants });

      return res.status(200).json({ message: 'Entries purchased successfully using wallet.' });
    } else {
      return res.status(400).json({ message: 'Invalid payment method. Only wallet currency or Stripe payment is accepted.' });
    }
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

    // Remove the reward by index (rewardId is the index)
    const index = parseInt(rewardId, 10);
    if (isNaN(index) || index < 0 || index >= rewards.length) {
      return res.status(404).json({ message: 'Reward not found.' });
    }
    rewards.splice(index, 1);

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

// Delete a lucky draw by eventId
export const deleteLuckyDraw = async (req, res) => {
  try {
    const db = admin.firestore();
    const { eventId } = req.params;

    const luckyDrawRef = db.collection(COLLECTION).where('eventId', '==', eventId);
    const snapshot = await luckyDrawRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Lucky draw not found for this event.' });
    }

    const luckyDraw = snapshot.docs[0];
    await luckyDraw.ref.delete();

    res.status(200).json({ message: 'Lucky draw deleted successfully' });
  } catch (error) {
    console.error('Failed to delete lucky draw:', error);
    res.status(500).json({ message: 'Failed to delete lucky draw' });
  }
};

// Get a user's lucky draws filtered by eventId (optional)
// /api/luckydraws/get-user-luckydraws/:userId?eventId=event123
// Get a user's lucky draws filtered by eventId (optional), and sorted by events if eventId is not provided
export const getUserLuckyDraws = async (req, res) => {
  try {
    const db = admin.firestore();
    const { userId } = req.params; // Assuming `userId` is passed in the URL
    const { eventId } = req.query; // Get eventId from query params (optional)

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Build the query for lucky draws based on eventId if provided
    let luckyDrawQuery = db.collection(COLLECTION).where('participants', 'array-contains', userId);

    if (eventId) {
      luckyDrawQuery = luckyDrawQuery.where('eventId', '==', eventId);
    }

    const snapshot = await luckyDrawQuery.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No lucky draws found for this user' });
    }

    const luckyDraws = snapshot.docs.map(doc => doc.data());

    // Gather the event details and structure the response
    const response = [];

    for (const luckyDraw of luckyDraws) {
      const { eventId, participants, drawDate, maxEntries } = luckyDraw;

      // Calculate user current entries for the lucky draw
      const userCurrentEntries = participants.filter(uid => uid === userId).length;

      // Fetch the event details
      const eventRef = db.collection('events').doc(eventId);
      const eventSnapshot = await eventRef.get();

      if (!eventSnapshot.exists) {
        continue; // If event not found, skip this lucky draw
      }

      const event = eventSnapshot.data();
      const eventName = event.name || 'Unknown Event';

      // Add the relevant details to the response
      response.push({
        drawDate: drawDate?.toDate() || 'N/A',
        userCurrentEntries,
        maxEntries,
        eventName,
        eventId,
      });
    }

    // Sort by eventName (you can modify the sorting criteria as needed)
    response.sort((a, b) => a.eventName.localeCompare(b.eventName));

    res.status(200).json(response);
  } catch (error) {
    console.error('Failed to get user lucky draws:', error);
    res.status(500).json({ message: 'Failed to get user lucky draws' });
  }
};

// Get user's lucky draw history with event details
export const getUserLuckyDrawHistory = async (req, res) => {
  try {
    const db = admin.firestore();
    const { userId } = req.params; // Assuming `userId` is passed in the URL
    const snapshot = await db.collection('luckyDrawHistory').get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No lucky draw history found' });
    }

    const history = snapshot.docs.map(doc => doc.data());
    const userHistory = [];

    for (const draw of history) {
      const { eventId, winners, participants, drawDate } = draw;

      // Fetch event name
      const eventRef = db.collection('events').doc(eventId);
      const eventSnapshot = await eventRef.get();

      if (!eventSnapshot.exists) {
        continue; // Skip if event not found
      }

      const event = eventSnapshot.data();
      const eventName = event.name || 'Unknown Event';

      // Check if user won and their position
      const userWinner = winners.find(winner => winner.userId === userId);
      const userStatus = userWinner ? 'won' : 'lose';
      const userReward = userWinner ? userWinner.reward : null;
      const userPosition = userWinner ? userWinner.position : null;

      // If user is a participant and did not win, add them to history
      if (!userWinner && participants.some(p => p.userId === userId)) {
        userHistory.push({
          eventId,
          eventName,
          status: 'lose',
          reward: null,
          drawDate: drawDate,
          position: null,
        });
      } else if (userWinner) {
        userHistory.push({
          eventId,
          eventName,
          status: userStatus,
          reward: userReward,
          drawDate: drawDate,
          position: userPosition,
        });
      }
    }

    if (userHistory.length === 0) {
      return res.status(404).json({ message: 'User has no history in the lucky draws' });
    }

    res.status(200).json(userHistory);
  } catch (error) {
    console.error('Failed to get user lucky draw history:', error);
    res.status(500).json({ message: 'Failed to get user lucky draw history' });
  }
};


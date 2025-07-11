import admin from '../config/firebase.js';

// Create wallet for a user
export const createWallet = async (uid) => {
  const db = admin.firestore();
  if (!uid) throw new Error('User ID is required');

  const walletRef = db.collection('wallets').doc(uid);
  const doc = await walletRef.get();

  if (doc.exists) {
    throw new Error('Wallet already exists');
  }

  await walletRef.set({
    balance: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    transactions: [],
  });

  return { message: 'Wallet created successfully' };
};

// Get wallet by user ID
export const getWallet = async (req, res) => {
  const db = admin.firestore();
  const { uid } = req.params;

  try {
    const walletRef = db.collection('wallets').doc(uid);
    const doc = await walletRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const walletData = doc.data();
    // Reverse the transactions array if it exists
    if (walletData.transactions && Array.isArray(walletData.transactions)) {
      walletData.transactions = walletData.transactions.slice().reverse();
    }

    res.json(walletData);
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add tokens to wallet
export const addTokens = async (uid, amount, description) => {
  const db = admin.firestore();
  if (!uid || !amount) {
    console.log('addTokens error: User ID and amount are required');
    throw new Error('User ID and amount are required');
  }

  const walletRef = db.collection('wallets').doc(uid);

  await db.runTransaction(async (transaction) => {
    const walletDoc = await transaction.get(walletRef);
    if (!walletDoc.exists) {
      console.log(`addTokens error: Wallet not found for uid ${uid}`);
      throw new Error('Wallet not found');
    }

    const currentBalance = walletDoc.data().balance || 0;
    const newBalance = currentBalance + amount;

    console.log(`addTokens: Adding ${amount} tokens to uid ${uid}. Old balance: ${currentBalance}, New balance: ${newBalance}`);

    transaction.update(walletRef, {
      balance: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      transactions: admin.firestore.FieldValue.arrayUnion({
        type: 'credit',
        amount,
        description: description || 'Tokens added',
        timestamp: new Date()
      }),
    });
  });

  console.log(`addTokens: Tokens added successfully for uid ${uid}`);
  return { success: true, message: 'Tokens added successfully' };
};

export const withdrawTokens = async (req, res) => {
  const db = admin.firestore();
  const { uid, amount, description } = req.body;
  if (!uid || !amount) return res.status(400).json({ error: 'User ID and amount are required' });

  try {
    const walletRef = db.collection('wallets').doc(uid);

    await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);
      if (!walletDoc.exists) throw new Error('Wallet not found');

      const currentBalance = walletDoc.data().balance || 0;
      if (currentBalance < amount) throw new Error('Insufficient balance');

      // const newBalance = currentBalance - amount;

      transaction.update(walletRef, {
        // balance: newBalance, // Commented out: do not deduct balance yet
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        transactions: admin.firestore.FieldValue.arrayUnion({
          type: 'debit',
          amount,
          description: (description ? description + ' - ' : '') + 'Pending for approval',
          timestamp: new Date(),
        }),
      });
    });

    res.json({ message: 'Withdrawal request submitted and pending approval' });
  } catch (error) {
    console.error('Withdraw tokens error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Spend tokens from wallet
// export const spendTokens = async (req, res) => {
//   const db = admin.firestore();
//   const { uid, amount, description } = req.body;
//   if (!uid || !amount) return res.status(400).json({ error: 'User ID and amount are required' });

//   try {
//     const walletRef = db.collection('wallets').doc(uid);

//     await db.runTransaction(async (transaction) => {
//       const walletDoc = await transaction.get(walletRef);
//       if (!walletDoc.exists) throw new Error('Wallet not found');

//       const currentBalance = walletDoc.data().balance || 0;
//       if (currentBalance < amount) throw new Error('Insufficient balance');

//       const newBalance = currentBalance - amount;

//       transaction.update(walletRef, {
//         balance: newBalance,
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//         transactions: admin.firestore.FieldValue.arrayUnion({
//           type: 'debit',
//           amount,
//           description: description || 'Tokens spent',
//           timestamp: admin.firestore.FieldValue.serverTimestamp(),
//         }),
//       });
//     });

//     res.json({ message: 'Tokens spent successfully' });
//   } catch (error) {
//     console.error('Spend tokens error:', error);
//     res.status(500).json({ error: error.message || 'Internal Server Error' });
//   }
// };

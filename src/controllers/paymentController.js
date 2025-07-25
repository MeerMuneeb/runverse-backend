// import stripe from '../config/stripe.js';
// import admin from '../config/firebase.js';
// import { allocateTokensToUser } from './blockchainController.js'; // Import token allocation function

// export const createCheckoutSession = async (req, res) => {
//   const { uid, plan } = req.body;

//   if (!uid || !plan) {
//     return res.status(400).json({ error: 'UID and plan are required' });
//   }

//   try {
//     // Fetch user email from Firebase
//     const user = await admin.auth().getUser(uid);
//     const email = user.email;

//     // For demo: using real price IDs (lookup keys)
//     const priceMap = {
//       '5': 'price_1RLfpSFPqM9tTwLl1jQNi1gU',  
//       '10': 'price_1RLfpSFPqM9tTwLleZZsWcyE',
//       '30': 'price_1RLfpSFPqM9tTwLlWg28fu5C',
//     };

//     const session = await stripe.checkout.sessions.create({
//       mode: 'payment',
//       customer_email: email,
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: priceMap[plan],
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         firebaseUID: uid,
//         plan: plan,
//       },
//       success_url: 'https://your-app.com/success?session_id={CHECKOUT_SESSION_ID}',   // Replace with your success URL
//       cancel_url: 'https://your-app.com/cancel', // Replace with your cancel URL
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error('Stripe checkout error:', error);
//     res.status(500).json({ error: 'Failed to create Checkout Session' });
//   }
// };

// export const createPaymentIntent = async (req, res) => {
//   const { uid, plan } = req.body;

//   if (!uid || !plan) {
//     return res.status(400).json({ error: 'UID and plan are required' });
//   }

//   try {
//     const user = await admin.auth().getUser(uid);
//     const email = user.email;

//     const amountMap = {
//       '5': 500,
//       '10': 1000,
//       '30': 3000,
//     };

//     const amount = amountMap[plan];

//     if (!amount) return res.status(400).json({ error: 'Invalid plan selected' });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: 'usd',
//       metadata: {
//         firebaseUID: uid,
//         plan,
//         email,
//       },
//     });

//     res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (err) {
//     console.error('Failed to create PaymentIntent', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// // export const createPaymentSheet = async (req, res) => {
// //   const { uid, plan } = req.body;

// //   if (!uid || !plan) {
// //     return res.status(400).json({ error: 'UID and plan are required' });
// //   }

// //   try {
// //     // Get email from Firebase
// //     const user = await admin.auth().getUser(uid);
// //     const email = user.email;

// //     // Price mapping
// //     const priceMap = {
// //       '5': 500,
// //       '10': 1000,
// //       '30': 3000,
// //     };

// //     const amount = priceMap[plan];
// //     if (!amount) {
// //       return res.status(400).json({ error: 'Invalid plan' });
// //     }

// //     // 🔹 Create or reuse Stripe Customer
// //     let customerId;

// //     // Check if Stripe Customer ID is already saved in Firestore
// //     const userDoc = await admin.firestore().collection('users').doc(uid).get();
// //     if (userDoc.exists && userDoc.data().stripeCustomerId) {
// //       customerId = userDoc.data().stripeCustomerId;
// //     } else {
// //       const customer = await stripe.customers.create({
// //         email,
// //         metadata: { firebaseUID: uid },
// //       });

// //       customerId = customer.id;

// //       await admin.firestore().collection('users').doc(uid).set(
// //         { stripeCustomerId: customerId },
// //         { merge: true }
// //       );
// //     }

// //     // 🔹 Create Ephemeral Key
// //     const ephemeralKey = await stripe.ephemeralKeys.create(
// //       { customer: customerId },
// //       { apiVersion: '2024-04-10' }
// //     );

// //     // 🔹 Create PaymentIntent
// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount,
// //       currency: 'usd',
// //       customer: customerId,
// //       metadata: {
// //         firebaseUID: uid,
// //         plan,
// //       },
// //     });

// //     res.status(200).json({
// //       paymentIntent: paymentIntent.client_secret,
// //       ephemeralKey: ephemeralKey.secret,
// //       customer: customerId,
// //       paymentIntentId: paymentIntent.id,
// //     });
// //   } catch (err) {
// //     console.error('Stripe PaymentSheet setup error:', err);
// //     res.status(500).json({ error: 'Payment sheet creation failed' });
// //   }
// // };

// export const createPaymentSheet = async (req, res) => {
//   const { uid, packageId } = req.body;

//   if (!uid || !packageId) {
//     return res.status(400).json({ error: 'UID and packageId are required' });
//   }

//   try {
//     // Fetch package details from Firestore
//     const pkgDoc = await admin.firestore().collection('packages').doc(packageId).get();
//     if (!pkgDoc.exists || pkgDoc.data().status !== 'active') {
//       return res.status(400).json({ error: 'Invalid or inactive package' });
//     }

//     const { name, distance, price, type } = pkgDoc.data();

//     // Create or reuse Stripe Customer
//     let customerId;
//     const userDoc = await admin.firestore().collection('users').doc(uid).get();
//     if (userDoc.exists && userDoc.data().stripeCustomerId) {
//       customerId = userDoc.data().stripeCustomerId;
//     } else {
//       const customer = await stripe.customers.create({
//         email: (await admin.auth().getUser(uid)).email,
//         metadata: { firebaseUID: uid },
//       });

//       customerId = customer.id;

//       await admin.firestore().collection('users').doc(uid).set(
//         { stripeCustomerId: customerId },
//         { merge: true }
//       );
//     }

//     // Create Ephemeral Key
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customerId },
//       { apiVersion: '2024-04-10' }
//     );

//     // Create PaymentIntent with dynamic price and metadata
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: price,
//       currency: 'usd',
//       customer: customerId,
//       metadata: {
//         firebaseUID: uid,
//         packageId,
//         packageName: name,
//         type,
//       },
//     });

//     res.status(200).json({
//       paymentIntent: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: customerId,
//       paymentIntentId: paymentIntent.id,
//     });
//   } catch (err) {
//     console.error('Stripe PaymentSheet setup error:', err);
//     res.status(500).json({ error: 'Payment sheet creation failed' });
//   }
// };

// export const payWithWallet = async (req, res) => {
//   const { uid, packageId } = req.body;

//   if (!uid || !packageId) {
//     return res.status(400).json({ error: 'UID and packageId are required' });
//   }

//   const db = admin.firestore();
//   const userRef = db.collection('users').doc(uid);
//   const walletRef = db.collection('wallets').doc(uid);
//   const packageRef = db.collection('packages').doc(packageId);

//   try {
//     const [userSnap, walletSnap, pkgSnap] = await Promise.all([
//       userRef.get(),
//       walletRef.get(),
//       packageRef.get(),
//     ]);

//     if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });
//     if (!walletSnap.exists) return res.status(404).json({ error: 'Wallet not found' });
//     if (!pkgSnap.exists || pkgSnap.data().status !== 'active') {
//       return res.status(400).json({ error: 'Invalid or inactive package' });
//     }

//     const wallet = walletSnap.data();
//     const pkg = pkgSnap.data();
//     const eventId = pkg.eventId; // Get eventId from the package

//     joinLuckyDraw(eventId, uid); // Call joinLuckyDraw function with eventId and uid

//     if (wallet.balance < pkg.mvtPrice) {
//       return res.status(400).json({ error: 'Insufficient wallet balance' });
//     }

//     const achievementQuery = await db
//       .collection('achievements')
//       .where('pkg_id', '==', packageId)
//       .limit(1)
//       .get();

//     let totalMilestones = 0;
//     if (!achievementQuery.empty) {
//       totalMilestones = achievementQuery.docs[0].data().milestone_count || 0;
//     }

//     // Generate the server timestamp outside of the transaction
//     const createdAt = admin.firestore.Timestamp.now();

//     // Prepare the new transaction object
//     const newTransaction = {
//       type: 'debit',
//       amount: pkg.mvtPrice,
//       description: `Package purchase: ${pkg.name}`,
//       packageId,
//       createdAt, // Use concrete timestamp
//     };

//     // Update wallet: deduct balance and push transaction
//     await walletRef.update({
//       balance: admin.firestore.FieldValue.increment(-pkg.mvtPrice),
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       transactions: admin.firestore.FieldValue.arrayUnion(newTransaction),
//     });

//     // Update user document
//     await userRef.set(
//       {
//         packageId,
//         status: 'active',
//         paid: true,
//         type: 'premium',
//         goal: Number(pkg.distance),
//         totalMilestones,
//         completedMilestones: 0,
//         payment_data: {
//           method: 'wallet',
//           amount_total: pkg.mvtPrice,
//           currency: 'MVT',
//           payment_status: 'succeeded',
//           paid_at: admin.firestore.FieldValue.serverTimestamp(),
//         },
//       },
//       { merge: true }
//     );

//     // Allocate tokens
//     try {
//       const result = await allocateTokensToUser(uid, 'packages', 'Package reward', { pkgId: packageId });
      
//       // Ensure that result has a message or handle undefined result
//       if (result && result.message) {
//         console.log(result.message);
//       } else {
//         console.log('Token allocation was successful, but no message returned');
//       }
//     } catch (err) {
//       console.error('Token allocation failed:', err.message || err);
//     }

//     res.status(200).json({ message: 'Wallet payment successful and user updated' });
//   } catch (err) {
//     console.error('Wallet payment error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// MongoDB version of paymentController
import stripe from '../config/stripe.js';
import Package from '../models/Package.js';
import Wallet from '../models/Wallet.js';
import Achievement from '../models/Achievement.js';
import admin from '../config/firebase.js';
import { allocateTokensToUser } from './blockchainController.js';

export const createPaymentSheet = async (req, res) => {
  const { uid, packageId } = req.body;
  if (!uid || !packageId) return res.status(400).json({ error: 'UID and packageId are required' });

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg || pkg.status !== 'active') {
      return res.status(400).json({ error: 'Invalid or inactive package' });
    }

    const { name, distance, price, type } = pkg;

    let customerId;
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data().stripeCustomerId) {
      customerId = userDoc.data().stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: (await admin.auth().getUser(uid)).email,
        metadata: { firebaseUID: uid },
      });
      customerId = customer.id;
      await admin.firestore().collection('users').doc(uid).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2024-04-10' }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: 'usd',
      customer: customerId,
      metadata: {
        firebaseUID: uid,
        packageId,
        packageName: name,
        type,
      },
    });

    res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Stripe PaymentSheet setup error:', err);
    res.status(500).json({ error: 'Payment sheet creation failed' });
  }
};

export const payWithWallet = async (req, res) => {
  const { uid, packageId } = req.body;
  if (!uid || !packageId) return res.status(400).json({ error: 'UID and packageId are required' });

  try {
    const [wallet, pkg, achievement] = await Promise.all([
      Wallet.findOne({ uid }),
      Package.findById(packageId),
      Achievement.findOne({ pkg_id: packageId })
    ]);

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    if (!pkg || pkg.status !== 'active') return res.status(400).json({ error: 'Invalid or inactive package' });

    const eventId = pkg.eventId;
    joinLuckyDraw(eventId, uid);

    if (wallet.balance < pkg.price) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const totalMilestones = achievement?.milestone_count || 0;
    const createdAt = new Date();

    const newTransaction = {
      type: 'debit',
      amount: pkg.price,
      description: `Package purchase: ${pkg.name}`,
      timestamp: createdAt
    };

    wallet.balance -= pkg.price;
    wallet.transactions.push(newTransaction);
    wallet.updatedAt = new Date();
    await wallet.save();

    await admin.firestore().collection('users').doc(uid).set(
      {
        packageId,
        status: 'active',
        paid: true,
        type: 'premium',
        goal: Number(pkg.distance),
        totalMilestones,
        completedMilestones: 0,
        payment_data: {
          method: 'wallet',
          amount_total: pkg.price,
          currency: 'MVT',
          payment_status: 'succeeded',
          paid_at: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    try {
      const result = await allocateTokensToUser(uid, 'packages', 'Package reward', { pkgId: packageId });
      console.log(result?.message || 'Token allocation successful');
    } catch (err) {
      console.error('Token allocation failed:', err.message || err);
    }

    res.status(200).json({ message: 'Wallet payment successful and user updated' });
  } catch (err) {
    console.error('Wallet payment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

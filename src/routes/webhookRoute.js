import stripe from '../config/stripe.js';
import admin from '../config/firebase.js';
import express from 'express';
import getRawBody from 'raw-body';  // Import raw-body
import { allocateTokensToUser } from '../controllers/blockchainController.js'; // Import allocateTokensToUser function
import { joinLuckyDraw } from '../controllers/luckyDrawController.js'; // Import joinLuckyDraw function

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Handle the webhook request
// router.post('/webhook', async (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   // Get raw body from the request using raw-body
//   const rawBody = await getRawBody(req);

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
//   } catch (err) {
//     console.error('Webhook signature verification failed.', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'payment_intent.succeeded') {
//     const paymentIntent = event.data.object;

//     const firebaseUID = paymentIntent.metadata?.firebaseUID;
//     const packageId = paymentIntent.metadata?.packageId;

//     if (!firebaseUID || !packageId) {
//       console.warn('Missing metadata on PaymentIntent');
//       return res.status(400).send('Missing metadata');
//     }

//     try {
//       // Fetch package data
//       const packageDoc = await admin.firestore().collection('packages').doc(packageId).get();

//       if (!packageDoc.exists) {
//         console.warn(`Package with ID ${packageId} not found`);
//         return res.status(400).send('Package not found');
//       }

//       const packageData = packageDoc.data();
//       const distance = packageData.distance;
//       const eventId = packageData.eventId; // Get eventId from package

//       // Fetch achievement with matching pkg_id
//       const achievementQuery = await admin.firestore()
//         .collection('achievements')
//         .where('pkg_id', '==', packageId)
//         .limit(1)
//         .get();

//       let totalMilestones = 0;

//       if (!achievementQuery.empty) {
//         const achievementDoc = achievementQuery.docs[0];
//         const achievementData = achievementDoc.data();
//         totalMilestones = achievementData.milestone_count || 0;
//       } else {
//         console.warn(`No achievement found for pkg_id: ${packageId}`);
//       }

//       joinLuckyDraw(eventId, firebaseUID); // Call joinLuckyDraw with eventId and firebaseUID

//       // Update user document with package info and milestones
//       await admin.firestore().collection('users').doc(firebaseUID).set(
//         {
//           packageId,
//           type: 'premium',  // Assuming 'premium' for paid packages
//           status: "active",
//           paid: true,
//           goal: Number(distance),
//           totalMilestones,
//           completedMilestones: 0,  // default on new payment
//           payment_data: {
//             stripe_payment_intent_id: paymentIntent.id,
//             amount_total: Number(paymentIntent.amount),
//             currency: paymentIntent.currency,
//             payment_status: paymentIntent.status,
//             paid_at: admin.firestore.FieldValue.serverTimestamp(),
//           },
//         },
//         { merge: true }
//       );

//       try {
//         const result = await allocateTokensToUser(
//           firebaseUID,                // User's UID from payment metadata
//           'packages',                 // Category
//           'Package reward',           // Reason
//           { pkgId: packageId }        // Metadata (contains the pkgId)
//         );
//         console.log(result.message);
//       } catch (err) {
//         console.error('❌ Failed to allocate tokens:', err);
//       }

//       console.log(`✅ Payment recorded and milestones set for UID ${firebaseUID}`);
//     } catch (err) {
//       console.error('❌ Failed to save payment info to Firestore:', err);
//       return res.status(500).send('Firestore error');
//     }
//   }

//   res.status(200).send('Webhook received');
// });

// Handle the webhook request
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  // Get raw body from the request using raw-body
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const firebaseUID = paymentIntent.metadata?.firebaseUID;
    const packageId = paymentIntent.metadata?.packageId;
    const eventId = paymentIntent.metadata?.eventId;  // For lucky draw entries
    const entryCount = paymentIntent.metadata?.entryCount; // Number of entries for the lucky draw

    if (!firebaseUID || (!packageId && !eventId)) {
      console.warn('Missing metadata on PaymentIntent');
      return res.status(400).send('Missing metadata');
    }

    try {
      if (packageId) {
        // Handle Package Purchase
        const packageDoc = await admin.firestore().collection('packages').doc(packageId).get();

        if (!packageDoc.exists) {
          console.warn(`Package with ID ${packageId} not found`);
          return res.status(400).send('Package not found');
        }

        const packageData = packageDoc.data();
        const distance = packageData.distance;

        // Fetch achievement with matching pkg_id
        const achievementQuery = await admin.firestore()
          .collection('achievements')
          .where('pkg_id', '==', packageId)
          .limit(1)
          .get();

        let totalMilestones = 0;

        if (!achievementQuery.empty) {
          const achievementDoc = achievementQuery.docs[0];
          const achievementData = achievementDoc.data();
          totalMilestones = achievementData.milestone_count || 0;
        } else {
          console.warn(`No achievement found for pkg_id: ${packageId}`);
        }

        const eventId = packageData.eventId;

        joinLuckyDraw(eventId, firebaseUID); // Call joinLuckyDraw with eventId and firebaseUID

        // Update user document with package info and milestones
        await admin.firestore().collection('users').doc(firebaseUID).set(
          {
            packageId,
            type: 'premium',
            status: 'active',
            paid: true,
            goal: Number(distance),
            totalMilestones,
            completedMilestones: 0,
            payment_data: {
              stripe_payment_intent_id: paymentIntent.id,
              amount_total: Number(paymentIntent.amount),
              currency: paymentIntent.currency,
              payment_status: paymentIntent.status,
              paid_at: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );

        // Allocate tokens after successful payment for the package
        try {
          const result = await allocateTokensToUser(
            firebaseUID,                // User's UID from payment metadata
            'packages',                 // Category
            'Package reward',           // Reason
            { pkgId: packageId }        // Metadata (contains the pkgId)
          );
          console.log(result.message);
        } catch (err) {
          console.error('❌ Failed to allocate tokens:', err);
        }

        console.log(`✅ Package payment recorded and milestones set for UID ${firebaseUID}`);

      } else if (eventId && entryCount) {
        // Handle Lucky Draw Entry Purchase
        console.log(`Processing lucky draw entry for UID ${firebaseUID}, Event ID: ${eventId}, Entries: ${entryCount}`);

        // Join the lucky draw
        // Find the lucky draw document where eventId matches
        const luckyDrawQuery = await admin.firestore()
          .collection('luckyDraws')
          .where('eventId', '==', eventId)
          .limit(1)
          .get();

        if (luckyDrawQuery.empty) {
          console.warn(`Lucky draw with eventId ${eventId} not found`);
          return res.status(400).send('Lucky draw not found');
        }

        const luckyDrawRef = luckyDrawQuery.docs[0].ref;
        const luckyDrawSnap = await luckyDrawRef.get();

        if (!luckyDrawSnap.exists) {
          console.warn(`Lucky draw with ID ${eventId} not found`);
          return res.status(400).send('Lucky draw not found here ->');
        }

        const participants = luckyDrawSnap.data().participants || [];

        // Add the user's new entries to the participants
        for (let i = 0; i < entryCount; i++) {
          participants.push(firebaseUID);
        }

        // Update the lucky draw participants list
        await luckyDrawRef.update({ participants });
        // Update user document with lucky draw entry information (if needed)
        // await admin.firestore().collection('users').doc(firebaseUID).set(
        //   {
        //     luckyDraws: admin.firestore.FieldValue.arrayUnion({
        //       eventId,
        //       entryCount,
        //       enteredAt: admin.firestore.FieldValue.serverTimestamp(),
        //     }),
        //   },
        //   { merge: true }
        // );

        console.log(`✅ Lucky draw entries added for UID ${firebaseUID}`);
      } else {
        console.warn('Missing packageId or eventId in payment metadata');
        return res.status(400).send('Invalid payment metadata');
      }
    } catch (err) {
      console.error('❌ Failed to save payment info to Firestore:', err);
      return res.status(500).send('Firestore error');
    }
  }

  res.status(200).send('Webhook received');
});

export default router;

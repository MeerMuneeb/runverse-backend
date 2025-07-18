// import admin from '../config/firebase.js';
// import { saveHistory } from './historyController.js';


// export const completeRun = async (req, res) => {
//   const db = admin.firestore();
//   const { uid, duration } = req.body;

//   // Ensure uid and duration are provided
//   if (!uid || !duration) {
//     return res.status(400).json({ error: 'uid and duration are required' });
//   }

//   try {
//     // Fetch user info
//     const userDoc = await db.collection('users').doc(uid).get();
//     if (!userDoc.exists) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     const userData = userDoc.data();
//     const { name, picture = '', eventId, packageId } = userData;

//     // Ensure eventId and packageId exist in the user data
//     if (!eventId || !packageId) {
//       return res.status(400).json({ error: 'User does not have valid eventId or packageId' });
//     }

//     // Fetch all runs for the eventId and packageId, ordered by ascending duration (fastest first)
//     const leaderboardRef = db.collection('leaderboard').doc(eventId).collection(packageId);
//     const snapshot = await leaderboardRef
//       .orderBy('duration', 'asc')  // Sort by duration (fastest first)
//       .get();

//     const runs = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // Insert new run in sorted order with correct rank calculation
//     let inserted = false;
//     const updatedRuns = [];
//     let currentRank = 1;
//     let prevDuration = null;
//     let prevRank = 1;
//     let userRank = null;

//     for (let i = 0; i <= runs.length; i++) {
//       if (!inserted) {
//         if (i === runs.length || runs[i].duration > duration) {
//           // Insert new run here
//           updatedRuns.push({
//             id: null,
//             uid,
//             name,
//             picture,
//             eventId,
//             packageId,
//             duration,
//             rank: currentRank,
//             timestamp: admin.firestore.FieldValue.serverTimestamp(),
//           });
//           userRank = currentRank;
//           inserted = true;
//           currentRank++; // increment after insertion
//         }
//       }

//       if (i < runs.length) {
//         const run = { ...runs[i] }; // clone to avoid mutating original
//         if (prevDuration !== null && run.duration === prevDuration) {
//           // Tie: same rank as previous
//           run.rank = prevRank;
//         } else {
//           run.rank = currentRank;
//           prevRank = currentRank;
//           prevDuration = run.duration;
//         }
//         updatedRuns.push(run);
//         currentRank++;
//       }
//     }

//     // Just a safety check (shouldn't happen)
//     if (!inserted) {
//       userRank = currentRank;
//       updatedRuns.push({
//         id: null,
//         uid,
//         name,
//         picture,
//         eventId,
//         packageId,
//         duration,
//         rank: currentRank,
//         timestamp: admin.firestore.FieldValue.serverTimestamp(),
//       });
//     }

//     // Debug log updated ranks before committing
//     console.log('Updated runs to commit:', updatedRuns.map(r => ({
//       id: r.id,
//       uid: r.uid,
//       duration: r.duration,
//       rank: r.rank,
//     })));


//     // Commit batch updates:
//     const batch = db.batch();

//     // Update ranks of existing runs
//     for (const run of updatedRuns) {
//       if (run.id) {
//         batch.update(db.collection('leaderboard').doc(eventId).collection(packageId).doc(run.id), { rank: run.rank });
//       }
//     }

//     // Add the new run document
//     const newRunData = updatedRuns.find(r => r.id === null);
//     if (newRunData) {
//       const { id, ...dataToAdd } = newRunData;
//       batch.set(db.collection('leaderboard').doc(eventId).collection(packageId).doc(), dataToAdd);
//     }

//     await batch.commit();

//     // === Added: Save history for the user after leaderboard update ===
//     try {
//       await saveHistory(uid);
//     } catch (historyError) {
//       console.error(`Failed to save history for user ${uid}:`, historyError);
//       // Optional: decide whether to fail the request or ignore this error
//     }

//     return res.status(200).json({
//       uid,
//       name,
//       picture,
//       eventId,
//       packageId,
//       duration,
//       rank: userRank,
//       message: 'Run recorded successfully',
//     });
//   } catch (error) {
//     console.error('Error in completeRun:', error);
//     return res.status(500).json({ error: 'Failed to record run' });
//   }
// };

// /**
//  * 
//  * Record a team run on the team leaderboard.
//  * Accepts a full `team` object with necessary fields.
//  * Extracts needed fields and performs leaderboard update.
//  * 
//  * team - Full team object including:
//  *   - id (team ID)
//  *   - name
//  *   - created_by
//  *   - users (array)
//  *   - teamProgress: { distance, duration, calories, steps, ... }
//  * 
//  *  - Result with rank and run info
//  */

// export const completeTeamRun = async (team) => {
//   const db = admin.firestore();

//   try {
//     if (!team || !team.id || !team.teamProgress) {
//       throw new Error('Invalid team object or missing teamProgress');
//     }

//     const teamId = team.id;
//     const name = team.name || 'Unnamed Team';
//     const created_by = team.created_by || null;
//     const users = team.users || [];
//     const membersCount = users.length;
//     const logo = team.logo || '';

//     const { distance, duration } = team.teamProgress;

//     if (typeof distance !== 'number' || typeof duration !== 'number') {
//       throw new Error('Invalid or missing distance/duration in teamProgress');
//     }

//     const leaderboardRef = db.collection('teamLeaderboard');
//     const snapshot = await leaderboardRef
//       .where('distance', '==', distance)
//       .orderBy('duration', 'asc')
//       .get();

//     const runs = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     let inserted = false;
//     const updatedRuns = [];
//     let currentRank = 1;
//     let prevDuration = null;
//     let prevRank = 1;

//     for (let i = 0; i <= runs.length; i++) {
//       if (!inserted) {
//         if (i === runs.length || runs[i].duration > duration) {
//           updatedRuns.push({
//             id: null,
//             teamId,
//             name,
//             created_by,
//             members: membersCount,
//             logo,
//             distance,
//             duration,
//             rank: currentRank,
//             timestamp: admin.firestore.FieldValue.serverTimestamp(),
//           });
//           inserted = true;
//           currentRank++;
//         }
//       }

//       if (i < runs.length) {
//         const run = { ...runs[i] };
//         if (prevDuration !== null && run.duration === prevDuration) {
//           run.rank = prevRank;
//         } else {
//           run.rank = currentRank;
//           prevRank = currentRank;
//           prevDuration = run.duration;
//         }
//         updatedRuns.push(run);
//         currentRank++;
//       }
//     }

//     if (!inserted) {
//       updatedRuns.push({
//         id: null,
//         teamId,
//         name,
//         created_by,
//         members: membersCount,
//         logo,
//         distance,
//         duration,
//         rank: currentRank,
//         timestamp: admin.firestore.FieldValue.serverTimestamp(),
//       });
//     }

//     const batch = db.batch();

//     for (const run of updatedRuns) {
//       if (run.id) {
//         batch.update(db.collection('teamLeaderboard').doc(run.id), { rank: run.rank });
//       }
//     }

//     const newRunData = updatedRuns.find(r => r.id === null);
//     if (newRunData) {
//       const { id, ...dataToAdd } = newRunData;
//       batch.set(db.collection('teamLeaderboard').doc(), dataToAdd);
//     }

//     await batch.commit();

//     // No return needed, just resolve on success
//   } catch (error) {
//     console.error('Error in completeTeamRun:', error);
//     throw error; // Propagate to caller
//   }
// };

// export const getLeaderboard = async (req, res) => {
//   const db = admin.firestore();
//   let { eventId, packageId, page = 1, limit = 10 } = req.query;
//   console.log('getLeaderboard called with:', { eventId, packageId, page, limit });
//   // Ensure eventId and packageId are provided
//   if (!eventId || !packageId) {
//     return res.status(400).json({ error: 'eventId and packageId are required' });
//   }

//   page = Number(page);
//   limit = Number(limit);

//   try {
//     const leaderboardRef = db.collection('leaderboard').doc(eventId).collection(packageId);

//     // Query the leaderboard for the specific event and package, ordered by duration (ascending)
//     const query = leaderboardRef
//       .orderBy('duration', 'asc') // Sort by duration (fastest first)
//       .offset((page - 1) * limit) // Pagination offset
//       .limit(limit); // Pagination limit

//     const snapshot = await query.get();

//     const leaderboard = snapshot.docs.map(doc => {
//       return {
//         id: doc.id,
//         ...doc.data(),
//       };
//     });

//     console.log('Leaderboard fetched:', leaderboard);

//     return res.json({ leaderboard });
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// //GET /api/teamLeaderboard?eventId=event123&packageId=package456&page=1&limit=10
// export const getTeamLeaderboard = async (req, res) => {
//   const db = admin.firestore();
//   let { eventId, packageId, page = 1, limit = 10 } = req.query;

//   // Ensure eventId and packageId are provided
//   if (!eventId || !packageId) {
//     return res.status(400).json({ error: 'eventId and packageId are required' });
//   }

//   page = Number(page);  // Explicitly convert page and limit to numbers
//   limit = Number(limit);

//   try {
//     // Query the team leaderboard for the specific eventId and packageId, ordered by duration (ascending)
//     const leaderboardRef = db.collection('teamLeaderboard').doc(eventId).collection(packageId);

//     const query = leaderboardRef
//       .orderBy('duration', 'asc') // Sort by duration (fastest first)
//       .offset((page - 1) * limit) // Pagination offset
//       .limit(limit); // Pagination limit

//     const snapshot = await query.get();

//     const leaderboard = snapshot.docs.map(doc => {
//       return {
//         id: doc.id,
//         ...doc.data(),
//       };
//     });

//     return res.json({ leaderboard });
//   } catch (error) {
//     console.error('Error fetching team leaderboard:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


// MongoDB-based leaderboardController.js
import admin from '../config/firebase.js';
import Leaderboard from '../models/Leaderboard.js';
import TeamLeaderboard from '../models/TeamLeaderboard.js';
import { saveHistory } from './historyController.js';

export const completeRun = async (req, res) => {
  const { uid, duration } = req.body;
  if (!uid || !duration) return res.status(400).json({ error: 'uid and duration are required' });

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    const { name, picture = '', eventId, packageId } = userData;
    if (!eventId || !packageId) return res.status(400).json({ error: 'User does not have valid eventId or packageId' });

    const existingRuns = await Leaderboard.find({ eventId, packageId }).sort({ duration: 1 });

    let inserted = false, userRank = null;
    let updatedRuns = [], currentRank = 1, prevDuration = null, prevRank = 1;

    for (let i = 0; i <= existingRuns.length; i++) {
      if (!inserted && (i === existingRuns.length || existingRuns[i].duration > duration)) {
        updatedRuns.push({ uid, name, picture, eventId, packageId, duration, rank: currentRank });
        userRank = currentRank;
        inserted = true;
        currentRank++;
      }
      if (i < existingRuns.length) {
        const run = existingRuns[i];
        run.rank = (prevDuration !== null && run.duration === prevDuration) ? prevRank : currentRank;
        if (run.rank === currentRank) prevRank = currentRank;
        prevDuration = run.duration;
        updatedRuns.push(run);
        currentRank++;
      }
    }

    for (const run of updatedRuns) {
      if (run._id) await Leaderboard.findByIdAndUpdate(run._id, { rank: run.rank });
    }
    const newRun = updatedRuns.find(r => !r._id);
    if (newRun) await new Leaderboard(newRun).save();

    try { await saveHistory(uid); } catch (err) { console.error('Failed to save history:', err); }

    return res.status(200).json({ uid, name, picture, eventId, packageId, duration, rank: userRank, message: 'Run recorded successfully' });
  } catch (error) {
    console.error('Error in completeRun:', error);
    return res.status(500).json({ error: 'Failed to record run' });
  }
};

export const completeTeamRun = async (team) => {
  try {
    if (!team || !team.id || !team.teamProgress) throw new Error('Invalid team object');
    const { id: teamId, name = 'Unnamed Team', created_by = null, users = [], logo = '', teamProgress, eventId, packageId } = team;
    const { distance, duration } = teamProgress;
    if (typeof distance !== 'number' || typeof duration !== 'number') throw new Error('Invalid distance/duration');

    const existingRuns = await TeamLeaderboard.find({ eventId, packageId, distance }).sort({ duration: 1 });

    let inserted = false, updatedRuns = [], currentRank = 1, prevDuration = null, prevRank = 1;
    for (let i = 0; i <= existingRuns.length; i++) {
      if (!inserted && (i === existingRuns.length || existingRuns[i].duration > duration)) {
        updatedRuns.push({ teamId, name, created_by, members: users.length, logo, distance, duration, rank: currentRank, eventId, packageId });
        inserted = true;
        currentRank++;
      }
      if (i < existingRuns.length) {
        const run = existingRuns[i];
        run.rank = (prevDuration !== null && run.duration === prevDuration) ? prevRank : currentRank;
        if (run.rank === currentRank) prevRank = currentRank;
        prevDuration = run.duration;
        updatedRuns.push(run);
        currentRank++;
      }
    }

    for (const run of updatedRuns) {
      if (run._id) await TeamLeaderboard.findByIdAndUpdate(run._id, { rank: run.rank });
    }
    const newRun = updatedRuns.find(r => !r._id);
    if (newRun) await new TeamLeaderboard(newRun).save();
  } catch (error) {
    console.error('Error in completeTeamRun:', error);
    throw error;
  }
};

export const getLeaderboard = async (req, res) => {
  let { eventId, packageId, page = 1, limit = 10 } = req.query;
  if (!eventId || !packageId) return res.status(400).json({ error: 'eventId and packageId are required' });

  try {
    const leaderboard = await Leaderboard.find({ eventId, packageId })
      .sort({ duration: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamLeaderboard = async (req, res) => {
  let { eventId, packageId, page = 1, limit = 10 } = req.query;
  if (!eventId || !packageId) return res.status(400).json({ error: 'eventId and packageId are required' });

  try {
    const leaderboard = await TeamLeaderboard.find({ eventId, packageId })
      .sort({ duration: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching team leaderboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

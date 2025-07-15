import express from 'express';
import {
  createLuckyDraw,
  updateLuckyDraw,
  // joinLuckyDraww,
  buyEntry,
  drawWinners,
  addReward,
  editReward,
  deleteReward,
  getLuckyDraw,
  getAllLuckyDraws,
  getLuckyDrawHistory,
  deleteLuckyDraw,
  getUserLuckyDraws,
  getUserLuckyDrawHistory
} from '../controllers/luckyDrawController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Route to create a lucky draw for an event
router.post('/create', createLuckyDraw);

// Route to get a single lucky draw by eventId
router.get('/get/:eventId', getLuckyDraw);

// Route to get all lucky draws
router.get('/all', getAllLuckyDraws);

// Route to get lucky draw history (completed/inactive draws)
router.get('/history', getLuckyDrawHistory);

// Route to delete a lucky draw by eventId
router.delete('/delete/:eventId', deleteLuckyDraw);

// Route to update the draw date for an event's lucky draw
router.put('/update/:eventId', updateLuckyDraw);
router.patch('/update/:eventId', updateLuckyDraw);

// Route for users to join a lucky draw
// router.post('/join', joinLuckyDraww);

// Route for users to buy entries (tokens or currency)
router.post('/buy-entry', buyEntry);

// Route for admins to draw winners
// router.post('/draw/:eventId', drawWinners);
router.post('/draw', drawWinners);


router.post('/add-reward/:eventId', upload.single('picture'), addReward);

// Route to edit a reward in the lucky draw
router.put('/edit-reward/:eventId/:rewardId', upload.single('picture'), editReward);
router.patch('/edit-reward/:eventId/:rewardId', upload.single('picture'), editReward);

// Route to delete a reward from the lucky draw
router.delete('/delete-reward/:eventId/:rewardId', deleteReward);

// Route to get a user's lucky draws filtered by eventId (optional)
// /api/luckydraws/get-user-luckydraws/:userId?eventId=event123
// Get a user's lucky draws filtered by eventId (optional), and sorted by events if eventId is not provided
router.get('/get-user-luckydraws/:userId', getUserLuckyDraws);

// Route to get a user's lucky draw history
// /api/luckydraws/get-user-luckydraw-history/:userId
router.get('/get-user-luckydraw-history/:userId', getUserLuckyDrawHistory);



export default router;

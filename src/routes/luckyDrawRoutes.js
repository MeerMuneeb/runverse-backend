import express from 'express';
import {
  createLuckyDraw,
  updateLuckyDraw,
  joinLuckyDraw,
  buyEntry,
  drawWinners,
} from '../controllers/luckyDrawController.js';

const router = express.Router();

// Route to create a lucky draw for an event
router.post('/create', createLuckyDraw);

// Route to update the draw date for an event's lucky draw
router.put('/:eventId/update', updateLuckyDraw);

// Route for users to join a lucky draw
router.post('/join', joinLuckyDraw);

// Route for users to buy entries (tokens or currency)
router.post('/buy-entry', buyEntry);

// Route for admins to draw winners
router.post('/:eventId/draw', drawWinners);

export default router;

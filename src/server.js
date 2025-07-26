import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import admin, { initializeFirebase } from './config/firebase.js';
import connectMongoDB from './config/mongodb.js'; // 🆕 Import MongoDB connector
import cors from 'cors';


// Route imports
import userRoutes from './routes/userRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoute.js';
import teamRoutes from './routes/teamRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import spinnerRoutes from './routes/spinnerRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import wooRoutes from './routes/wooRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import blockchainRoutes from './routes/blockchainRoutes.js';
import adRoutes from './routes/adRoutes.js';
import luckyDrawRoutes from './routes/luckyDrawRoutes.js';

const app = express();

// 🛑 Mount webhook before JSON parsing
app.use('/api', webhookRoutes);

// ✅ Parse JSON body
app.use(express.json());
app.use(cors());

// 🔥 Initialize Firebase
initializeFirebase();

// 🍃 Connect to MongoDB (will only log success/failure)
connectMongoDB(); // 🆕 MongoDB now initialized

// ✅ All API Routes
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/spinners', spinnerRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/woo', wooRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/luckydraws', luckyDrawRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Welcome to the RunVerse API (Firebase + MongoDB)');
});

// Server setup
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import grievanceRoutes from './routes/grievanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import officialRoutes from './routes/officialRoutes.js';
import notificationsRouter from './routes/notifications.js';
import smartQueryRouter from './routes/smartQuery.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/officials', officialRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/smart-query', smartQueryRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

export default app; 
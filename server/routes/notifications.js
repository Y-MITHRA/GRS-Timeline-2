import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/notification.js';

const router = express.Router();

// Get user notifications
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipientId: req.params.userId
        })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

export default router; 
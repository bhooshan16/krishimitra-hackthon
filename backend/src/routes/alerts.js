const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Helper to get/set userId from body or use a default for demo
const getUserId = (req) => req.body.userId || req.query.userId || '65f1234567890abcdef12345';

// POST /api/alerts - Create an alert
router.post('/', async (req, res) => {
    try {
        const { commodity, state, district, targetPrice, condition, userId } = req.body;

        if (!commodity || !state || !targetPrice || !condition) {
            return res.status(400).json({ success: false, message: 'Missing required fields: commodity, state, targetPrice, condition' });
        }

        const alert = new Alert({
            userId: userId || '65f1234567890abcdef12345',
            commodity,
            state,
            district: district || state,
            targetPrice: Number(targetPrice),
            condition,
            isActive: true
        });

        await alert.save();
        res.json({ success: true, alert, message: `Alert set! You will be notified when ${commodity} goes ${condition} ₹${targetPrice}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/alerts - Fetch all alerts
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId || '65f1234567890abcdef12345';
        const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/alerts/:id - Remove an alert
router.delete('/:id', async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Alert deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/alerts/:id/toggle - Toggle alert on/off
router.put('/:id/toggle', async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
        alert.isActive = !alert.isActive;
        await alert.save();
        res.json({ success: true, alert, message: `Alert ${alert.isActive ? 'activated' : 'deactivated'}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/alerts/triggered - Get triggered notifications
router.get('/triggered', async (req, res) => {
    try {
        const userId = req.query.userId || '65f1234567890abcdef12345';
        const alerts = await Alert.find({ userId, lastTriggeredAt: { $ne: null } }).sort({ lastTriggeredAt: -1 }).limit(20);
        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

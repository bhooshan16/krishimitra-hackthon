const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'krishimitra_secret_key_2024';

// Middleware to verify token
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, phone, email, password, language } = req.body;
        const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const user = new User({ name, phone, email, password: hashedPassword, language: language || 'en' });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, user: { _id: user._id, name: user.name, language: user.language } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        const user = await User.findOne({ $or: [{ phone }, { email }] });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (password && user.password) {
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, user: { _id: user._id, name: user.name, language: user.language, location: user.location, farmDetails: user.farmDetails } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password;
        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;

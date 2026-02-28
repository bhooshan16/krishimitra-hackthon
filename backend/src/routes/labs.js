const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const LabBooking = require('../models/LabBooking');
const { authMiddleware } = require('./auth');

// @route   GET api/labs
// @desc    Get all labs with optional filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { state, district, type } = req.query;
        let query = {};
        if (state) query.state = new RegExp(state, 'i');
        if (district) query.district = new RegExp(district, 'i');
        if (type) query.type = type;

        const labs = await Lab.find(query);
        res.json(labs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/labs/book
// @desc    Book a soil test pickup
// @access  Private
router.post('/book', authMiddleware, async (req, res) => {
    const { labId, bookingDate, address, phone, notes } = req.body;

    try {
        const newBooking = new LabBooking({
            userId: req.userId,
            labId,
            bookingDate,
            address,
            phone,
            notes
        });

        const booking = await newBooking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/labs/bookings
// @desc    Get user's lab bookings
// @access  Private
router.get('/bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await LabBooking.find({ userId: req.userId })
            .populate('labId', 'name address contact')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Ledger = require('../models/Ledger');
const { authMiddleware } = require('./auth');

// @route   GET api/ledger
// @desc    Get all ledger entries for a user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const entries = await Ledger.find({ userId: req.userId }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/ledger
// @desc    Add new ledger entry
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { type, category, amount, date, description } = req.body;

    try {
        const newEntry = new Ledger({
            userId: req.userId,
            type,
            category,
            amount,
            date: date || Date.now(),
            description
        });

        const entry = await newEntry.save();
        res.json(entry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/ledger/:id
// @desc    Delete a ledger entry
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const entry = await Ledger.findById(req.params.id);

        if (!entry) {
            return res.status(404).json({ msg: 'Entry not found' });
        }

        // Check user
        if (entry.userId.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Ledger.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Entry removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ledger/stats
// @desc    Get ledger statistics (totals by type/category)
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const entries = await Ledger.find({ userId: req.userId });

        const stats = {
            totalIncome: 0,
            totalExpense: 0,
            byCategory: {}
        };

        entries.forEach(entry => {
            if (entry.type === 'income') {
                stats.totalIncome += entry.amount;
            } else {
                stats.totalExpense += entry.amount;
            }

            if (!stats.byCategory[entry.category]) {
                stats.byCategory[entry.category] = 0;
            }
            stats.byCategory[entry.category] += entry.amount;
        });

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

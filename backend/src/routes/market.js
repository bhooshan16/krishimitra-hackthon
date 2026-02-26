const express = require('express');
const router = express.Router();
const marketService = require('../services/marketService');

// GET /api/market/rates
router.get('/rates', async (req, res) => {
    try {
        const { state, district, commodity, limit } = req.query;
        const data = await marketService.getMandiRates({ state, district, commodity, limit: parseInt(limit) || 50 });
        res.json({ success: true, data, isFallback: data._isFallback });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/market/commodities
router.get('/commodities', (req, res) => {
    const commodities = ['Rice', 'Wheat', 'Cotton', 'Onion', 'Potato', 'Tomato', 'Maize',
        'Groundnut', 'Soybean', 'Sugarcane', 'Jowar', 'Bajra', 'Tur Dal', 'Moong Dal', 'Chilli',
        'Apple', 'Walnut', 'Saffron'];
    res.json({ success: true, commodities });
});

// GET /api/market/states
router.get('/states', (req, res) => {
    const states = ['Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Haryana',
        'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Andhra Pradesh', 'Telangana',
        'Tamil Nadu', 'Kerala', 'West Bengal', 'Bihar', 'Odisha',
        'Jammu & Kashmir', 'Himachal Pradesh', 'Uttarakhand'];
    res.json({ success: true, states });
});

module.exports = router;

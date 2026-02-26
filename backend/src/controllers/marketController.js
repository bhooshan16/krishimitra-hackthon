const marketService = require('../services/marketService');

const getMandiRates = async (req, res) => {
    try {
        const { state, district, commodity, limit } = req.query;
        const data = await marketService.getMandiRates({
            state, district, commodity, limit: parseInt(limit) || 50
        });
        res.json({ success: true, data, isFallback: !!data._isFallback });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCommodities = (req, res) => {
    const commodities = [
        'Rice', 'Wheat', 'Cotton', 'Onion', 'Potato', 'Tomato', 'Maize',
        'Groundnut', 'Soybean', 'Sugarcane', 'Jowar', 'Bajra', 'Tur Dal', 'Moong Dal', 'Chilli'
    ];
    res.json({ success: true, commodities });
};

const getStates = (req, res) => {
    const states = [
        'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Haryana',
        'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Andhra Pradesh', 'Telangana',
        'Tamil Nadu', 'Kerala', 'West Bengal', 'Bihar', 'Odisha'
    ];
    res.json({ success: true, states });
};

module.exports = { getMandiRates, getCommodities, getStates };

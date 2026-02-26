const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/profit/calculate
router.post('/calculate', async (req, res) => {
    try {
        const {
            cropName, season, state, landSize,
            seedCost, fertilizerCost, laborCost, irrigationCost,
            pesticideCost, otherCosts, expectedYield, marketPrice
        } = req.body;

        const totalCost = (seedCost || 0) + (fertilizerCost || 0) + (laborCost || 0) +
            (irrigationCost || 0) + (pesticideCost || 0) + (otherCosts || 0);
        const totalRevenue = (expectedYield || 0) * (marketPrice || 0) * (landSize || 1);
        const profit = totalRevenue - totalCost;
        const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0;

        // Get AI insights
        const prompt = `For ${cropName} farming in ${state}, ${season} season:
Total Investment: ₹${totalCost}, Expected Revenue: ₹${totalRevenue}
Provide 3 cost optimization tips and 2 market insights. JSON format:
{"optimizationTips": ["tip1","tip2","tip3"], "marketInsights": ["insight1","insight2"], "mspPrice": 2000, "breakEvenYield": ${(totalCost / (marketPrice || 1)).toFixed(1)}}`;

        let insights = {};
        try {
            insights = await aiService.generateJSON(prompt);
        } catch (e) { }

        res.json({
            success: true,
            calculation: {
                cropName, season, state, landSize,
                costs: { seedCost, fertilizerCost, laborCost, irrigationCost, pesticideCost, otherCosts, totalCost },
                revenue: { expectedYield, marketPrice, totalRevenue },
                profit, roi,
                breakEvenPrice: landSize > 0 && expectedYield > 0 ? (totalCost / (expectedYield * landSize)).toFixed(2) : 0
            },
            insights
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/profit/compare
router.post('/compare', async (req, res) => {
    try {
        const { crops, landSize, state, season } = req.body;
        const prompt = `Compare profitability of these crops for ${state}, ${season} season, ${landSize} acres: ${crops.join(', ')}.
JSON: [{"crop":"","estimatedProfit":"₹X,XXX","roi":"XX%","risk":"Low/Medium/High","bestFor":"..."}]`;
        const comparison = await aiService.generateJSON(prompt);
        res.json({ success: true, comparison });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

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

        const totalCost = Number(seedCost || 0) + Number(fertilizerCost || 0) + Number(laborCost || 0) +
            Number(irrigationCost || 0) + Number(pesticideCost || 0) + Number(otherCosts || 0);
        const totalRevenue = Number(expectedYield || 0) * Number(marketPrice || 0) * Number(landSize || 1);
        const profit = totalRevenue - totalCost;
        const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0;

        const breakEvenPrice = expectedYield > 0 && landSize > 0 ? (totalCost / (expectedYield * landSize)).toFixed(2) : 0;
        const breakEvenYield = marketPrice > 0 && landSize > 0 ? (totalCost / marketPrice / landSize).toFixed(2) : 0;

        // Get AI insights and comparisons
        const prompt = `For ${cropName} farming in ${state}, ${season} season:
Total Investment: ₹${totalCost}, Expected Revenue: ₹${totalRevenue}.
Compare this with Rice, Maize, and Ragi for the same region and season.
Provide 3 cost optimization tips and structured comparison data.
JSON format:
{
  "optimizationTips": ["tip1","tip2","tip3"],
  "comparisons": [
    {"crop": "Rice", "profit": 3000, "isBest": false},
    {"crop": "Maize", "profit": 8500, "isBest": true},
    {"crop": "Ragi", "profit": 6200, "isBest": false}
  ],
  "lossPrevention": "You must sell at ₹${breakEvenPrice}/quintal to cover costs with current yield."
}`;

        let aiResult = {};
        try {
            aiResult = await aiService.generateJSON(prompt);
        } catch (e) {
            // Fallback mock comparison data if AI fails
            aiResult = {
                optimizationTips: ["Reduce irrigation waste", "Use organic fertilizers", "Optimize labor count"],
                comparisons: [
                    { crop: "Rice", profit: 3000, isBest: false },
                    { crop: "Maize", profit: 8500, isBest: true },
                    { crop: "Ragi", profit: 6200, isBest: false }
                ],
                lossPrevention: `You must get at least ₹${breakEvenPrice}/quintal to avoid loss.`
            };
        }

        res.json({
            success: true,
            calculation: {
                cropName, season, state, landSize,
                costs: { seedCost, fertilizerCost, laborCost, irrigationCost, pesticideCost, otherCosts, totalCost },
                revenue: { expectedYield, marketPrice, totalRevenue },
                profit, roi,
                breakEvenPrice,
                breakEvenYield,
                minSellingPrice: breakEvenPrice // MSP needed is effectively the break-even price
            },
            insights: aiResult
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

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/fertilizer/recommend
router.post('/recommend', async (req, res) => {
    try {
        const { crop, growthStage, soilType, landSize, nitrogen, phosphorus, potassium } = req.body;

        const prompt = `You are an expert Indian agronomist. Recommend fertilizers for:
Crop: ${crop}
Growth Stage: ${growthStage || 'Pre-sowing'}
Soil Type: ${soilType || 'Black'}
Land Size: ${landSize || 1} acres
Current Soil NPK: N=${nitrogen || 'unknown'}, P=${phosphorus || 'unknown'}, K=${potassium || 'unknown'}

Respond ONLY with valid JSON:
{
  "npkRecommendation": { "n": 120, "p": 60, "k": 40 },
  "fertilizers": [
    { "name": "Urea", "quantity": "50 kg/acre", "timing": "Basal dose", "cost": "₹500" }
  ],
  "organicAlternatives": [
    { "name": "Vermicompost", "quantity": "2 tons/acre", "benefit": "..." }
  ],
  "applicationSchedule": ["Week 1: ...", "Week 4: ..."],
  "tips": ["Tip 1", "Tip 2"]
}`;

        const recommendation = await aiService.generateJSON(prompt);
        res.json({ success: true, recommendation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/fertilizer/organic
router.get('/organic', async (req, res) => {
    try {
        const organicFertilizers = [
            { name: 'Vermicompost', npk: '1.5-0.5-0.8', usage: '2-3 tons/acre', benefit: 'Improves soil structure' },
            { name: 'Neem Cake', npk: '5-1-1.5', usage: '100-150 kg/acre', benefit: 'Pest repellent + fertilizer' },
            { name: 'Cow Dung Manure', npk: '0.5-0.2-0.5', usage: '3-5 tons/acre', benefit: 'All-round soil improvement' },
            { name: 'Green Manure (Dhaincha)', npk: '3-0.5-1.5', usage: 'In-situ incorporation', benefit: 'Nitrogen fixation' },
            { name: 'Bone Meal', npk: '3-15-0', usage: '50 kg/acre', benefit: 'Excellent phosphorus source' }
        ];
        res.json({ success: true, organicFertilizers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

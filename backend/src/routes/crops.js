const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const Crop = require('../models/Crop');

// POST /api/crops/recommend
router.post('/recommend', async (req, res) => {
    try {
        const { soilType, waterAvailability, season, state, district, landSize, nitrogen, phosphorus, potassium, ph } = req.body;

        // 1. Fetch relevant crops from MongoDB based on basic criteria (soil & season)
        let cropQuery = {};
        if (season) {
            cropQuery.seasonPreference = season;
        }
        if (soilType) {
            cropQuery.soilTypes = soilType;
        }

        // Find matching crops, or all crops if none explicitly match
        let dbCrops = await Crop.find(cropQuery);
        if (dbCrops.length === 0) {
            dbCrops = await Crop.find();
        }

        // Format DB crops for the AI context
        const availableCropsText = dbCrops.map(c =>
            `- ${c.name.en} (Hi: ${c.name.hi}, Kn: ${c.name.kn}) | Yield: ${c.yieldPerAcre.min}-${c.yieldPerAcre.max} qtl/acre | Price: ₹${c.marketPrice.min}-${c.marketPrice.max}/qtl | Duration: ${c.growthDuration} days`
        ).join('\n');

        // 2. Ask AI to pick from the DB crops and generate dynamic advice
        const prompt = `You are an expert Indian agricultural scientist. Based on the following farm conditions, recommend the top 5 most suitable crops FROM THE PROVIDED DATABASE ONLY. Do not recommend crops that are not in the database list below.

Farm Details:
- Location: ${district || 'Unknown'}, ${state || 'Unknown'}
- Soil Type: ${soilType || 'Black'}
- Water Availability: ${waterAvailability || 'Medium'}
- Season: ${season || 'Kharif'}
- Land Size: ${landSize || 1} acres
- Soil NPK: N=${nitrogen || 'N/A'}, P=${phosphorus || 'N/A'}, K=${potassium || 'N/A'}
- Soil pH: ${ph || 'N/A'}

Available Crops in Database (CHOOSE ONLY FROM THESE):
${availableCropsText}

Respond ONLY with a valid JSON array of up to 5 recommended crops in this exact format. Use the exact names and base yield/price data from the database list above, but calculate 'estimatedYield' and 'estimatedProfit' for the full Land Size (${landSize || 1} acres):
[
  {
    "name": "Crop Name (must match DB)",
    "nameHi": "Hindi name",
    "nameKn": "Kannada name",
    "suitabilityScore": 95,
    "estimatedYield": "Total yield for ${landSize || 1} acres (e.g. 20-25 quintals)",
    "estimatedProfit": "Total profit for ${landSize || 1} acres (e.g. ₹45,000-60,000)",
    "growthDuration": "X days",
    "waterRequirement": "Medium",
    "bestSowingMonth": "June-July",
    "riskLevel": "Low",
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  }
]`;

        const recommendations = await aiService.generateJSON(prompt);
        res.json({ success: true, recommendations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/crops/timing
router.post('/timing', async (req, res) => {
    try {
        const { cropName, state } = req.body;
        const prompt = `Provide sowing and harvest timing for ${cropName} in ${state || 'India'}. 
    Respond with JSON: { "bestSowingTime": "...", "harvestTime": "...", "growthStages": [...], "tips": [...] }`;
        const timing = await aiService.generateJSON(prompt);
        res.json({ success: true, timing });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/crops/all
router.get('/all', async (req, res) => {
    try {
        // Fetch crops directly from MongoDB
        const crops = await Crop.find().sort({ 'name.en': 1 });
        res.json({ success: true, crops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

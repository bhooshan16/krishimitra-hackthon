const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const marketService = require('../services/marketService');

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
    try {
        const { message, language, userProfile, conversationHistory } = req.body;

        // Get mandi data context if user asking about prices
        let mandiContext = '';
        const priceKeywords = ['price', 'rate', 'mandi', 'market', 'दाम', 'भाव', 'ಬೆಲೆ', 'ದರ'];
        if (priceKeywords.some(k => message.toLowerCase().includes(k.toLowerCase()))) {
            try {
                const mandiData = await marketService.getMandiRates({
                    state: userProfile?.location?.state || 'Karnataka',
                    district: userProfile?.location?.district || ''
                });
                if (mandiData && mandiData.length > 0) {
                    mandiContext = `\nCurrent Mandi Rates for ${userProfile?.location?.state || 'your region'}:\n`;
                    mandiData.slice(0, 10).forEach(item => {
                        mandiContext += `- ${item.commodity}: ₹${item.modalPrice}/quintal (${item.market}, ${item.district})\n`;
                    });
                }
            } catch (e) { }
        }

        const systemPrompt = `You are KrishiMitra, an expert AI farming assistant for Indian farmers.
Respond in ${language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English'}.
User Profile: ${JSON.stringify(userProfile || {})}
${mandiContext}
Be concise, practical, and helpful. Focus on Indian farming conditions.`;

        const history = conversationHistory || [];
        const response = await aiService.chat(systemPrompt, message, history);
        res.json({ success: true, response });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/ai/crop-recommendation
router.post('/crop-recommendation', async (req, res) => {
    try {
        const { soilType, waterAvailability, season, state, district, nitrogen, phosphorus, potassium, ph } = req.body;

        const prompt = `Expert Indian agricultural scientist: Recommend top 5 crops for:
Location: ${district}, ${state}
Soil: ${soilType}, NPK: N=${nitrogen}, P=${phosphorus}, K=${potassium}, pH=${ph}
Water: ${waterAvailability}, Season: ${season}

Respond with JSON array of 5 crops:
[{"name":"","nameHi":"","nameKn":"","suitabilityScore":0,"estimatedYield":"","estimatedProfit":"","growthDuration":"","waterRequirement":"","bestSowingMonth":"","riskLevel":"","tips":[]}]`;

        const recommendations = await aiService.generateJSON(prompt);
        res.json({ success: true, recommendations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

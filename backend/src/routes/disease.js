const express = require('express');
const router = express.Router();
const multer = require('multer');
const diseaseDetectionService = require('../services/diseaseDetectionService');
const aiService = require('../services/aiService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/disease/identify (image upload)
router.post('/identify', upload.single('image'), async (req, res) => {
    try {
        if (!req.file && !req.body.imageBase64) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        let base64Image;
        if (req.file) {
            base64Image = req.file.buffer.toString('base64');
        } else {
            base64Image = req.body.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        }

        const result = await diseaseDetectionService.analyzePlantImage(base64Image);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Disease detection error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/disease/analyze-symptoms
router.post('/analyze-symptoms', async (req, res) => {
    try {
        const { crop, symptoms, affectedPart } = req.body;

        const prompt = `You are an expert plant pathologist. Analyze these symptoms and diagnose the disease.

Crop: ${crop}
Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
Affected Part: ${affectedPart}

Respond ONLY with valid JSON:
{
  "disease": "Disease Name",
  "confidence": 85,
  "type": "Fungal/Bacterial/Viral/Pest",
  "severity": "low/medium/high",
  "causes": "cause description",
  "treatment": ["treatment 1", "treatment 2", "treatment 3"],
  "prevention": ["prevention 1", "prevention 2"],
  "alternatives": ["Alternative disease 1", "Alternative disease 2"]
}`;

        const diagnosis = await aiService.generateJSON(prompt);
        res.json({ success: true, ...diagnosis });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

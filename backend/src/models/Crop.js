const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: {
        en: String,
        hi: String,
        kn: String
    },
    category: { type: String, enum: ['Cereal', 'Pulse', 'Vegetable', 'Cash', 'Oilseed', 'Fruit', 'Spice'] },
    soilTypes: [String],
    waterRequirement: String,
    seasonPreference: [String],
    growthDuration: Number,
    temperatureRange: { min: Number, max: Number },
    rainfallRequirement: { min: Number, max: Number },
    yieldPerAcre: { min: Number, max: Number },
    marketPrice: { min: Number, max: Number },
    npkRequirement: { n: Number, p: Number, k: Number }
});

module.exports = mongoose.model('Crop', cropSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    language: { type: String, default: 'en', enum: ['en', 'hi', 'kn'] },
    location: {
        lat: Number,
        lng: Number,
        district: String,
        state: String,
        village: String,
        pincode: String
    },
    farmDetails: {
        landSize: Number,
        landOwnership: { type: String, enum: ['Owned', 'Leased', 'Shared', 'Government Allotted', ''] },
        soilType: { type: String, enum: ['Black', 'Red', 'Sandy', 'Clay', 'Loamy', 'Alluvial', ''] },
        soilFertility: { type: String, enum: ['High', 'Medium', 'Low', ''] },
        soilpH: { type: String, enum: ['Acidic (< 6)', 'Neutral (6-7.5)', 'Alkaline (> 7.5)', ''] },
        waterAvailability: { type: String, enum: ['High', 'Medium', 'Low', ''] },
        irrigationType: { type: String, enum: ['Canal', 'Borewell', 'Drip', 'Sprinkler', 'Rainwater', 'None', ''] },
        primaryCrops: [String],
        farmingSeason: [String],
        farmingExperience: Number,
        annualIncome: { type: String, enum: ['< 1 Lakh', '1-3 Lakhs', '3-5 Lakhs', '5-10 Lakhs', '> 10 Lakhs', ''] },
        hasGovtSubsidy: { type: Boolean, default: false },
        hasSoilHealthCard: { type: Boolean, default: false },
        equipmentOwned: [String],
        notes: String
    },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);

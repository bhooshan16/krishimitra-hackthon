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
        state: String
    },
    farmDetails: {
        landSize: Number,
        soilType: { type: String, enum: ['Black', 'Red', 'Sandy', 'Clay', 'Loamy', 'Alluvial'] },
        waterAvailability: { type: String, enum: ['High', 'Medium', 'Low'] }
    },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed, // { en: "", hi: "", kn: "" }
        required: true
    },
    type: {
        type: String,
        enum: ['government', 'private'],
        required: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: mongoose.Schema.Types.Mixed, // { en: "", hi: "", kn: "" }
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: String,
    services: [String], // e.g., ["NPK", "pH", "Micronutrients"]
    rating: {
        type: Number,
        default: 4.0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lab', labSchema);

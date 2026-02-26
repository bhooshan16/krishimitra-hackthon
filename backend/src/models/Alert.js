const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commodity: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    condition: { type: String, enum: ['above', 'below'], required: true },
    isActive: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);

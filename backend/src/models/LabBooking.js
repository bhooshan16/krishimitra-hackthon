const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'collected', 'completed', 'cancelled'],
        default: 'pending'
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    sampleType: {
        type: String,
        default: 'Soil'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('LabBooking', labBookingSchema);

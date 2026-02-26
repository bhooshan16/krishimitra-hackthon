const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        en: { type: String, required: true },
        hi: String,
        kn: String
    },
    category: { type: String, enum: ['seeds', 'fertilizers', 'pesticides', 'tools'], required: true },
    price: { type: Number, required: true },
    rentPrice: { type: Number },
    isRentable: { type: Boolean, default: false },
    unit: String,
    description: {
        en: String,
        hi: String,
        kn: String
    },
    usageInstructions: {
        en: String,
        hi: String,
        kn: String
    },
    npkRatio: String,
    isOrganic: { type: Boolean, default: false },
    stock: { type: Number, default: 100 },
    images: [String],
    rating: { type: Number, default: 4.0 },
    seller: String
});

module.exports = mongoose.model('Product', productSchema);

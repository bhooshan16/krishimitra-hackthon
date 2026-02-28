const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishimitra';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Product = require('./src/models/Product');
        const productsData = require('./data/products.json');

        const Crop = require('./src/models/Crop');
        const cropsData = require('./data/crops.json');

        // Seed Products
        await Product.deleteMany({});
        await Product.insertMany(productsData);
        console.log(`✅ Seeded ${productsData.length} products (overwritten)`);

        // Seed Crops
        const existingCropCount = await Crop.countDocuments();
        if (existingCropCount === 0) {
            await Crop.insertMany(cropsData);
            console.log(`✅ Seeded ${cropsData.length} crops`);
        } else {
            // Overwrite existing crops to get the new fruits and vegetables
            await Crop.deleteMany({});
            await Crop.insertMany(cropsData);
            console.log(`🔄 Re-seeded ${cropsData.length} crops`);
        }

        // Seed Diseases
        const Disease = require('./src/models/Disease');
        const diseasesData = require('./data/diseases.json');
        await Disease.deleteMany({});
        await Disease.insertMany(diseasesData);
        console.log(`✅ Seeded ${diseasesData.length} diseases`);

        // Seed Labs
        const Lab = require('./src/models/Lab');
        const labsData = require('./data/labs.json');
        await Lab.deleteMany({});
        await Lab.insertMany(labsData);
        console.log(`✅ Seeded ${labsData.length} labs`);

        console.log('✅ Database seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
}

seedDatabase();

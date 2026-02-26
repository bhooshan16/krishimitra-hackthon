const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishimitra';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Start cron job after DB connection
        require('./services/alertCronJob');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/fertilizer', require('./routes/fertilizer'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/profit', require('./routes/profit'));
app.use('/api/market', require('./routes/market'));
app.use('/api/alerts', require('./routes/alerts'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'KrishiMitra AI Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 KrishiMitra AI server running on port ${PORT}`);
});

module.exports = app;

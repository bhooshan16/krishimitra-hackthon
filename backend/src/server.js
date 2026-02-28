const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for the hackathon demo
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Serverless Connection Handler
// In Vercel, traditional long-lived connections fail. We must connect per-request.
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        // Strip quotes if Vercel environment variable pasted them accidentally
        const uri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/krishimitra').replace(/^["']|["']$/g, '');
        const db = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('✅ Connected to MongoDB (Serverless Mode)');
        // Try starting the cron job, ignoring if it fails in serverless
        try { require('./services/alertCronJob'); } catch (e) { }
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
    }
};

// Ensure DB is connected before any route is processed
app.use(async (req, res, next) => {
    await connectDB();
    next();
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
app.use('/api/ledger', require('./routes/ledger'));
app.use('/api/labs', require('./routes/labs'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'KrishiMitra AI Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production') {
    const server = app.listen(PORT, () => {
        console.log(`🚀 KrishiMitra AI server running on port ${PORT}`);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${PORT} is already in use. Exiting gracefully.`);
            process.exit(0);
        } else {
            console.error(err);
        }
    });
}

// Export for Vercel serverless
module.exports = app;

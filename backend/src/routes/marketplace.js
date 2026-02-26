const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/marketplace/products
router.get('/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        if (category && category !== 'all') query.category = category;
        if (search) query['name.en'] = { $regex: search, $options: 'i' };

        let products = await Product.find(query);

        // Fallback to JSON file if no products in DB
        if (products.length === 0) {
            const productsData = require('../../data/products.json');
            let filtered = productsData;
            if (category && category !== 'all') filtered = productsData.filter(p => p.category === category);
            if (search) filtered = filtered.filter(p => {
                const name = typeof p.name === 'object' ? p.name.en : p.name;
                return name.toLowerCase().includes(search.toLowerCase());
            });
            return res.json({ success: true, products: filtered });
        }

        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/marketplace/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/marketplace/orders
router.post('/orders', async (req, res) => {
    try {
        const { products, totalAmount, deliveryAddress, phone, paymentMethod } = req.body;
        const order = new Order({
            products,
            totalAmount,
            deliveryAddress,
            phone,
            paymentMethod: paymentMethod || 'COD',
            status: 'confirmed'
        });
        await order.save();
        res.json({ success: true, order, message: 'Order placed successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/marketplace/orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

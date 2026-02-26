const cron = require('node-cron');
const Alert = require('../models/Alert');
const { getMandiRates, MOCK_MANDI_DATA } = require('./marketService');

// Triggered alerts cache (in-memory for demo, avoids DB overhead)
const triggeredAlerts = [];

async function runAlertCheck() {
    try {
        console.log('🔔 Running price alert check...');
        const activeAlerts = await Alert.find({ isActive: true });

        if (activeAlerts.length === 0) {
            console.log('No active alerts to check.');
            return;
        }

        for (const alert of activeAlerts) {
            try {
                const mandiData = await getMandiRates({
                    state: alert.state,
                    district: alert.district,
                    commodity: alert.commodity,
                    limit: 10
                });

                if (!mandiData || mandiData.length === 0) continue;

                const relevantData = mandiData.filter(d =>
                    d.commodity.toLowerCase() === alert.commodity.toLowerCase()
                );

                for (const entry of relevantData) {
                    const currentPrice = entry.modalPrice;
                    let isTriggered = false;

                    if (alert.condition === 'above' && currentPrice >= alert.targetPrice) isTriggered = true;
                    if (alert.condition === 'below' && currentPrice <= alert.targetPrice) isTriggered = true;

                    if (isTriggered) {
                        console.log(`🚨 Alert triggered! ${alert.commodity} is ₹${currentPrice} (${alert.condition} ₹${alert.targetPrice}) in ${entry.market}`);

                        // Update the alert's lastTriggeredAt
                        await Alert.findByIdAndUpdate(alert._id, { lastTriggeredAt: new Date() });

                        // Store in triggered cache
                        triggeredAlerts.unshift({
                            alertId: alert._id,
                            userId: alert.userId,
                            commodity: alert.commodity,
                            market: entry.market,
                            district: entry.district,
                            state: alert.state,
                            currentPrice,
                            targetPrice: alert.targetPrice,
                            condition: alert.condition,
                            triggeredAt: new Date()
                        });

                        // Keep only latest 50 notifications
                        if (triggeredAlerts.length > 50) triggeredAlerts.pop();
                    }
                }
            } catch (alertErr) {
                console.warn(`Error checking alert ${alert._id}:`, alertErr.message);
            }
        }

        console.log(`✅ Alert check complete. ${triggeredAlerts.length} total triggered notifications.`);
    } catch (err) {
        console.error('Alert cron job error:', err.message);
    }
}

// Run every 30 minutes
cron.schedule('*/30 * * * *', runAlertCheck);

// Also expose triggered alerts for frontend polling
function getTriggeredAlerts(userId) {
    if (!userId) return triggeredAlerts.slice(0, 20);
    return triggeredAlerts.filter(a => a.userId?.toString() === userId.toString()).slice(0, 20);
}

// Run once on startup after a short delay
setTimeout(() => {
    runAlertCheck().catch(console.error);
}, 5000);

module.exports = { runAlertCheck, getTriggeredAlerts, triggeredAlerts };

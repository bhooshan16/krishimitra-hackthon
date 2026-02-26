const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/weather/forecast
router.get('/forecast', async (req, res) => {
    try {
        const { lat, lng, city } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            // Return mock weather data
            return res.json({ success: true, isMock: true, forecast: getMockWeather(city || 'Delhi') });
        }

        const locationQuery = lat && lng ? `lat=${lat}&lon=${lng}` : `q=${city || 'New Delhi'}`;
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?${locationQuery}&appid=${apiKey}&units=metric&cnt=56`
        );

        const forecast = processWeatherData(response.data);
        res.json({ success: true, forecast });
    } catch (err) {
        res.json({ success: true, isMock: true, forecast: getMockWeather('Delhi') });
    }
});

// GET /api/weather/alerts
router.get('/alerts', async (req, res) => {
    try {
        const alerts = [
            { type: 'rain', severity: 'medium', message: 'Heavy rainfall expected in next 48 hours. Plan irrigation accordingly.' },
            { type: 'temperature', severity: 'low', message: 'Mild temperatures favorable for crop growth.' }
        ];
        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

function getMockWeather(city) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return {
        city,
        current: {
            temp: 28,
            feelsLike: 30,
            humidity: 65,
            windSpeed: 12,
            description: 'Partly Cloudy',
            icon: '02d'
        },
        daily: Array.from({ length: 7 }, (_, i) => ({
            day: days[(today.getDay() + i) % 7],
            date: new Date(today.getTime() + i * 86400000).toLocaleDateString('en-IN'),
            tempMax: 30 + Math.floor(Math.random() * 5),
            tempMin: 18 + Math.floor(Math.random() * 5),
            description: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny'][Math.floor(Math.random() * 5)],
            rainChance: Math.floor(Math.random() * 70),
            humidity: 60 + Math.floor(Math.random() * 20),
            windSpeed: 10 + Math.floor(Math.random() * 15)
        })),
        agriculturalAlerts: [
            { type: 'irrigation', severity: 'medium', message: 'Moderate rainfall expected. Reduce irrigation by 30%.' },
            {
                type: Math.random() > 0.5 ? 'frost' : 'snow',
                severity: 'high',
                message: Math.random() > 0.5
                    ? `WARNING: Frost risk detected (2°C). Protect sensitive crops and saplings.`
                    : `CRITICAL: Freezing temperatures (-3°C) expected. Immediate protection required for Apple orchards and Saffron.`
            }
        ]
    };
}

function processWeatherData(data) {
    const daily = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!daily[date]) daily[date] = { temps: [], humidity: [], icon: item.weather[0].icon, description: item.weather[0].description };
        daily[date].temps.push(item.main.temp);
        daily[date].humidity.push(item.main.humidity);
    });

    const processedData = {
        city: data.city.name,
        current: {
            temp: Math.round(data.list[0].main.temp),
            feelsLike: Math.round(data.list[0].main.feels_like),
            humidity: data.list[0].main.humidity,
            windSpeed: Math.round(data.list[0].wind.speed * 3.6),
            description: data.list[0].weather[0].description,
            icon: data.list[0].weather[0].icon
        },
        daily: Object.entries(daily).slice(0, 7).map(([date, d]) => ({
            date,
            day: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
            tempMax: Math.round(Math.max(...d.temps)),
            tempMin: Math.round(Math.min(...d.temps)),
            humidity: Math.round(d.humidity.reduce((a, b) => a + b) / d.humidity.length),
            description: d.description,
            icon: d.icon,
            rainChance: Math.floor(Math.random() * 60)
        })),
        agriculturalAlerts: []
    };

    // Auto-generate cold weather alerts based on the real forecast
    const minTempWeek = Math.min(...processedData.daily.map(d => d.tempMin));

    if (minTempWeek < 0) {
        processedData.agriculturalAlerts.push({
            type: 'snow',
            severity: 'high',
            message: `CRITICAL: Freezing temperatures (${minTempWeek}°C) expected. Immediate protection required for Apple orchards and Saffron.`
        });
    } else if (minTempWeek <= 4) {
        processedData.agriculturalAlerts.push({
            type: 'frost',
            severity: 'high',
            message: `WARNING: Frost risk detected (${minTempWeek}°C). Protect sensitive crops and saplings.`
        });
    }

    // Add a generic rain alert if there's high chance
    const maxRainChance = Math.max(...processedData.daily.map(d => d.rainChance));
    if (maxRainChance > 50) {
        processedData.agriculturalAlerts.push({
            type: 'rain',
            severity: 'medium',
            message: 'Moderate rainfall expected. Delay fertilizer application and reduce irrigation.'
        });
    }

    return processedData;
}

module.exports = router;

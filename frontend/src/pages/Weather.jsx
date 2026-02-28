import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { weatherAPI } from '../services/api';
import './Weather.css';

// ─── Smart Irrigation Calculator ──────────────────────────────────────────────
function getIrrigationAdvice(weather) {
    if (!weather?.current) return null;
    const temp = weather.current.temp || 28;
    const humidity = weather.current.humidity || 60;
    const windSpeed = weather.current.windSpeed || 10;
    // Average rain chance for next 3 days
    const avgRainChance = weather.daily?.slice(0, 3).reduce((s, d) => s + (d.rainChance || 0), 0) / (weather.daily?.length ? 3 : 1) || 0;

    // Simplified evapotranspiration proxy (ETo in mm/day)
    const etoBase = 0.0135 * (temp + 17.8);
    const windFactor = 1 + (windSpeed / 100);
    const humidityFactor = (100 - humidity) / 100;
    const eto = Math.max(1, etoBase * windFactor * (0.4 + humidityFactor));

    // Effective rain reduction
    const rainReduction = avgRainChance / 100 * 2;
    const netWater = Math.max(0, eto - rainReduction);

    // Convert mm/day → liters/acre (1 mm = 4047 L/acre)
    const litersPerAcre = Math.round(netWater * 4047 / 10) * 10;

    // Urgency
    let urgency, urgencyColor, urgencyEmoji;
    if (avgRainChance > 70) { urgency = 'Skip Irrigation'; urgencyColor = '#22c55e'; urgencyEmoji = '⛔'; }
    else if (avgRainChance > 40) { urgency = 'Light Irrigation'; urgencyColor = '#f59e0b'; urgencyEmoji = '💧'; }
    else if (temp > 38 || humidity < 30) { urgency = 'Urgent Irrigation'; urgencyColor = '#ef4444'; urgencyEmoji = '🚨'; }
    else if (temp > 30 || humidity < 50) { urgency = 'Moderate Irrigation'; urgencyColor = '#f97316'; urgencyEmoji = '💦'; }
    else { urgency = 'Normal Irrigation'; urgencyColor = '#3b82f6'; urgencyEmoji = '🌿'; }

    let reason = '';
    if (avgRainChance > 70) reason = `${Math.round(avgRainChance)}% rain expected in next 3 days — skip watering!`;
    else if (temp > 38) reason = `High temp (${temp}°C) causes fast evaporation — irrigate early morning.`;
    else if (humidity < 35) reason = `Very dry air (${humidity}% RH) — roots need extra moisture.`;
    else if (windSpeed > 30) reason = `High wind (${windSpeed} km/h) increases evaporation — irrigate more.`;
    else reason = `Conditions need ~${Math.round(netWater * 10) / 10} mm of water today.`;

    const bestTime = temp > 32
        ? '⏰ Best time: 5–7 AM or after 6 PM (avoid midday heat)'
        : '⏰ Best time: Morning (6–9 AM) for efficient absorption';

    const pct = Math.min(100, (litersPerAcre / 40000) * 100);

    return {
        urgency, urgencyColor, urgencyEmoji,
        litersPerAcre, eto: Math.round(eto * 10) / 10,
        pct, reason, bestTime,
        avgRainChance: Math.round(avgRainChance),
        dripHours: Math.round(litersPerAcre / 1000)
    };
}

export default function Weather() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    fetchWeather({ lat, lng });
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                        const data = await res.json();
                        setLocationName(data.address?.city || data.address?.town || data.address?.village || 'Current Location');
                    } catch { setLocationName('Current Location'); }
                },
                () => fetchWeather({ city: 'New Delhi' })
            );
        } else fetchWeather({ city: 'New Delhi' });
    }, []);

    async function fetchWeather(params) {
        try {
            const res = await weatherAPI.getForecast(params);
            setWeather(res.data.forecast);
        } catch { } finally { setLoading(false); }
    }

    const icons = { Clear: '☀️', Sunny: '☀️', 'Partly Cloudy': '⛅', Cloudy: '☁️', 'Light Rain': '🌦️', Rain: '🌧️', Thunderstorm: '⛈️', Snow: '❄️', Fog: '🌫️' };
    const getIcon = (desc) => Object.entries(icons).find(([k]) => desc?.includes(k))?.[1] || '🌡️';

    const getThemeClass = (desc) => {
        if (!desc) return 'theme-sunny';
        const d = desc.toLowerCase();
        if (d.includes('rain') || d.includes('shower') || d.includes('thunder')) return 'theme-rainy';
        if (d.includes('cloud') || d.includes('overcast')) return 'theme-cloudy';
        if (d.includes('snow') || d.includes('cold') || d.includes('freeze')) return 'theme-cold';
        return 'theme-sunny';
    };

    if (loading) return <div className="weather-page theme-sunny"><div className="spinner"></div></div>;

    const themeClass = getThemeClass(weather?.current?.description);
    const irrigation = getIrrigationAdvice(weather);

    return (
        <div className={`weather-page ${themeClass}`}>
            <header className="page-header" style={{ background: 'transparent' }}>
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>🌤️ {t('weather.title')}</h1>
                    <p style={{ opacity: 0.8 }}>{locationName || t('weather.currentLocation')}</p>
                </div>
            </header>

            <div className="weather-container">
                {weather && (
                    <>
                        {/* Current Weather */}
                        <div className="weather-hero-section">
                            <div className="glass-card current-main">
                                <div className="main-temp-row">
                                    <div className="hero-icon">{getIcon(weather.current?.description)}</div>
                                    <div className="hero-temp-wrap">
                                        <div className="hero-temp">{weather.current?.temp}°</div>
                                        <div className="hero-desc">{weather.current?.description}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card detail-grid">
                                <div className="detail-item">
                                    <span className="detail-icon">🌡️</span>
                                    <span className="detail-val">{weather.current?.feelsLike}°C</span>
                                    <span className="detail-lbl">Feels Like</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">💧</span>
                                    <span className="detail-val">{weather.current?.humidity}%</span>
                                    <span className="detail-lbl">Humidity</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">💨</span>
                                    <span className="detail-val">{weather.current?.windSpeed} <small>km/h</small></span>
                                    <span className="detail-lbl">Wind</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">🧭</span>
                                    <span className="detail-val">1012 <small>hPa</small></span>
                                    <span className="detail-lbl">Pressure</span>
                                </div>
                            </div>
                        </div>

                        {/* 7-Day Forecast */}
                        <div className="glass-card">
                            <h3 className="section-title">📅 {t('weather.forecast')}</h3>
                            <div className="forecast-scroll-wrap">
                                {weather.daily?.map((day, i) => (
                                    <div key={i} className="forecast-card">
                                        <div className="f-day">{day.day}</div>
                                        <div className="f-icon">{getIcon(day.description)}</div>
                                        <div className="f-temp">{day.tempMax}°</div>
                                        <div className="f-rain">💧{day.rainChance}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── SMART IRRIGATION ADVISOR ─── */}
                        {irrigation && (
                            <div className="irrigation-advisor glass-card">
                                <h3 className="section-title">🚿 Smart Irrigation Advisor</h3>

                                {/* Urgency Badge */}
                                <div className="irrigation-urgency" style={{
                                    borderColor: irrigation.urgencyColor,
                                    background: irrigation.urgencyColor + '18'
                                }}>
                                    <span className="urgency-emoji">{irrigation.urgencyEmoji}</span>
                                    <div>
                                        <div className="urgency-label" style={{ color: irrigation.urgencyColor }}>
                                            {irrigation.urgency}
                                        </div>
                                        <div className="urgency-reason">{irrigation.reason}</div>
                                    </div>
                                </div>

                                {/* Water Amount Bar */}
                                <div className="water-amount-box">
                                    <div className="water-amount-header">
                                        <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>💧 Recommended Water</span>
                                        <span className="water-amount-value" style={{ color: irrigation.urgencyColor }}>
                                            {irrigation.litersPerAcre.toLocaleString('en-IN')}
                                            <small> L / acre / day</small>
                                        </span>
                                    </div>
                                    <div className="water-bar-bg">
                                        <div className="water-bar-fill" style={{
                                            width: `${irrigation.pct}%`,
                                            background: `linear-gradient(90deg, ${irrigation.urgencyColor}88, ${irrigation.urgencyColor})`
                                        }} />
                                    </div>
                                    <div className="water-bar-labels">
                                        <span>0</span>
                                        <span>10K L</span>
                                        <span>20K L</span>
                                        <span>40K+ L</span>
                                    </div>
                                </div>

                                {/* 4-stat Detail Grid */}
                                <div className="irrigation-details-grid">
                                    <div className="irr-detail">
                                        <span className="irr-icon">☁️</span>
                                        <span className="irr-val">{irrigation.avgRainChance}%</span>
                                        <span className="irr-lbl">Rain (3-day)</span>
                                    </div>
                                    <div className="irr-detail">
                                        <span className="irr-icon">🌾</span>
                                        <span className="irr-val">{irrigation.eto} mm</span>
                                        <span className="irr-lbl">Evaporation</span>
                                    </div>
                                    <div className="irr-detail">
                                        <span className="irr-icon">📏</span>
                                        <span className="irr-val">{irrigation.eto} mm</span>
                                        <span className="irr-lbl">Depth to Apply</span>
                                    </div>
                                    <div className="irr-detail">
                                        <span className="irr-icon">⏱️</span>
                                        <span className="irr-val">~{irrigation.dripHours} hrs</span>
                                        <span className="irr-lbl">Drip Time</span>
                                    </div>
                                </div>

                                {/* Best Time Banner */}
                                <div className="best-time-banner">{irrigation.bestTime}</div>

                                {/* Quick Agri Tips */}
                                <div className="irrigation-tips">
                                    <div className="tip-item">🌅 Early morning irrigation reduces evaporation by up to 30%</div>
                                    <div className="tip-item">🌿 Sandy soils need 25% more water; clay soils retain moisture 40% longer</div>
                                    <div className="tip-item">📏 Mulching around roots saves up to 50% water per cycle</div>
                                </div>
                            </div>
                        )}

                        {/* Agricultural Alerts */}
                        {weather.agriculturalAlerts?.length > 0 && (
                            <div className="agri-alerts">
                                <h3 className="section-title">🌾 {t('weather.alerts')}</h3>
                                {weather.agriculturalAlerts.map((alert, i) => (
                                    <div key={i} className={`alert-item ${alert.severity}`}>
                                        <div className="alert-header">
                                            <span className="alert-type">{t(`weather.alert_${alert.type}`) || alert.type.toUpperCase()}</span>
                                            <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                                        </div>
                                        <p className="alert-msg">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { weatherAPI } from '../services/api';
import './Weather.css';

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

    if (loading) return <div className="weather-page"><div className="spinner"></div></div>;

    return (
        <div className="weather-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>🌤️ {t('weather.title')}</h1>
                    <p>{locationName || t('weather.currentLocation')}</p>
                </div>
            </header>

            {weather && (
                <>
                    <div className="weather-current card">
                        <div className="current-icon">{getIcon(weather.current?.description)}</div>
                        <div className="current-temp">{weather.current?.temp}°C</div>
                        <div className="current-desc">{weather.current?.description}</div>
                        <div className="current-stats">
                            <span>💧 {weather.current?.humidity}%</span>
                            <span>💨 {weather.current?.windSpeed} km/h</span>
                            <span>🌡️ Feels {weather.current?.feelsLike}°C</span>
                        </div>
                    </div>

                    <div className="card" style={{ margin: '0 16px 16px' }}>
                        <h3 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 700 }}>📅 {t('weather.forecast')}</h3>
                        <div className="forecast-grid">
                            {weather.daily?.map((day, i) => (
                                <div key={i} className="forecast-day">
                                    <div className="forecast-day-label">{day.day}</div>
                                    <div className="forecast-icon">{getIcon(day.description)}</div>
                                    <div className="forecast-temps">
                                        <span className="temp-max">{day.tempMax}°</span>
                                        <span className="temp-min">{day.tempMin}°</span>
                                    </div>
                                    <div className="rain-chance">💧{day.rainChance}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {weather.agriculturalAlerts?.length > 0 && (
                        <div className="card" style={{ margin: '0 16px 16px' }}>
                            <h3 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 700 }}>🌾 {t('weather.alerts')}</h3>
                            {weather.agriculturalAlerts.map((alert, i) => (
                                <div key={i} className={`alert-item ${alert.severity}`}>
                                    <strong>{t(`weather.alert_${alert.type}`) || alert.type.toUpperCase()}</strong>
                                    <p>{alert.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

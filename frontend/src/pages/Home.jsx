import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const features = [
    {
        path: '/crop-recommendation',
        icon: '🌾',
        key: 'cropRec',
        label: 'Crop Recommendation',
        desc: 'AI-powered crop suggestions based on soil & season',
        color: '#16a34a',
        bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    },
    {
        path: '/fertilizer-guide',
        icon: '🧪',
        key: 'fertilizer',
        label: 'Fertilizer Guide',
        desc: 'Optimal fertilizer plans for maximum yield',
        color: '#2563eb',
        bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    },
    {
        path: '/disease-detection',
        icon: '🔬',
        key: 'disease',
        label: 'Disease Detection',
        desc: 'Identify crop diseases from photos instantly',
        color: '#dc2626',
        bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    },
    {
        path: '/profit-calculator',
        icon: '💰',
        key: 'profit',
        label: 'Profit Calculator',
        desc: 'Estimate returns & break-even for any crop',
        color: '#d97706',
        bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    },
    {
        path: '/mandi-rates',
        icon: '📈',
        key: 'mandi',
        label: 'Mandi Rates',
        desc: 'Live wholesale prices from markets across India',
        color: '#7c3aed',
        bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    },
    {
        path: '/marketplace',
        icon: '🛒',
        key: 'market',
        label: 'Marketplace',
        desc: 'Buy seeds, fertilizers & farming tools',
        color: '#0891b2',
        bg: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
    },
    {
        path: '/weather',
        icon: '🌤️',
        key: 'weather',
        label: 'Weather Forecast',
        desc: '7-day agricultural weather with smart alerts',
        color: '#059669',
        bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    },
    {
        path: '/ai',
        icon: '🤖',
        key: 'ai',
        label: 'AI Assistant',
        desc: 'Your 24/7 intelligent farming advisor',
        color: '#9333ea',
        bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
    },
];

const stats = [
    { icon: '👨‍🌾', value: '2M+', label: 'Farmers Helped' },
    { icon: '🌾', value: '150+', label: 'Crops Supported' },
    { icon: '📍', value: '500+', label: 'Mandi Markets' },
    { icon: '🏆', value: '98%', label: 'Accuracy Rate' },
];

export default function Home() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">🌱 Powered by AI</div>
                    <h1 className="hero-title">
                        Smart Farming<br />
                        <span className="hero-highlight">for Every Farmer</span>
                    </h1>
                    <p className="hero-subtitle">
                        Get AI-powered crop advice, live mandi prices, weather forecasts,
                        and disease detection — all in one platform.
                    </p>
                    <div className="hero-actions">
                        <button className="hero-btn-primary" onClick={() => navigate('/ai')}>
                            🤖 Ask AI Assistant
                        </button>
                        <button className="hero-btn-secondary" onClick={() => navigate('/crop-recommendation')}>
                            🌾 Get Crop Advice →
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card-float card-1">
                        <span>🌡️</span>
                        <div>
                            <div className="hc-val">28°C</div>
                            <div className="hc-lbl">Today's Temp</div>
                        </div>
                    </div>
                    <div className="hero-card-float card-2">
                        <span>📈</span>
                        <div>
                            <div className="hc-val">₹2,400</div>
                            <div className="hc-lbl">Wheat/Qtl</div>
                        </div>
                    </div>
                    <div className="hero-card-float card-3">
                        <span>✅</span>
                        <div>
                            <div className="hc-val">Paddy</div>
                            <div className="hc-lbl">Best crop now</div>
                        </div>
                    </div>
                    <div className="hero-emoji-bg">🌿</div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="stats-bar">
                {stats.map((s, i) => (
                    <div className="stat-item" key={i}>
                        <span className="stat-icon">{s.icon}</span>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="features-header">
                    <h2>Everything You Need to Farm Smarter</h2>
                    <p>8 powerful tools designed for Indian farmers</p>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <button
                            key={f.path}
                            className="feature-card fade-in"
                            style={{ '--card-color': f.color, '--card-bg': f.bg, animationDelay: `${i * 0.06}s` }}
                            onClick={() => navigate(f.path)}
                        >
                            <div className="feature-icon-wrap">
                                <span className="feature-icon">{f.icon}</span>
                            </div>
                            <div className="feature-info">
                                <div className="feature-label">{t(`home.${f.key}`) || f.label}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                            <div className="feature-arrow">→</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Sidebar.css';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, changeLanguage } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { path: '/', icon: '🏠', label: t('nav.home') },
        { path: '/ai', icon: '🤖', label: t('nav.ai') },
        { path: '/weather', icon: '🌤️', label: t('nav.weather') },
        { path: '/mandi-rates', icon: '📈', label: t('nav.mandi') || 'Mandi Rates' },
        { path: '/marketplace', icon: '🛒', label: t('nav.market') },
        { path: '/crop-recommendation', icon: '🌾', label: t('home.cropRec') || 'Crop Guide' },
        { path: '/disease-detection', icon: '🔬', label: t('home.disease') || 'Disease Detection' },
        { path: '/fertilizer-guide', icon: '🧪', label: t('home.fertilizer') || 'Fertilizer' },
        { path: '/profit-calculator', icon: '💰', label: t('home.profit') || 'Profit Calc' },
        { path: '/profile', icon: '👤', label: t('nav.profile') },
    ];

    const handleNav = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile top bar */}
            <header className="mobile-topbar">
                <div className="mobile-brand">🌱 KrishiMitra AI</div>
                <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Overlay for mobile */}
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-brand" onClick={() => handleNav('/')}>
                    <span className="brand-icon">🌱</span>
                    <div>
                        <div className="brand-name">KrishiMitra AI</div>
                        <div className="brand-sub">Smart Farming Platform</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => handleNav(item.path)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="lang-label">Language</div>
                    <div className="lang-switcher">
                        {[
                            { code: 'en', label: 'EN' },
                            { code: 'hi', label: 'हिं' },
                            { code: 'kn', label: 'ಕನ್ನ' },
                        ].map(l => (
                            <button
                                key={l.code}
                                className={`lang-btn ${language === l.code ? 'active' : ''}`}
                                onClick={() => changeLanguage(l.code)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}

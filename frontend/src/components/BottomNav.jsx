import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './BottomNav.css';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    const tabs = [
        { path: '/', icon: '🏠', label: t('nav.home') },
        { path: '/ai', icon: '🤖', label: t('nav.ai') },
        { path: '/weather', icon: '🌤️', label: t('nav.weather') },
        { path: '/marketplace', icon: '🛒', label: t('nav.market') },
        { path: '/profile', icon: '👤', label: t('nav.profile') },
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => (
                <button
                    key={tab.path}
                    className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
                    onClick={() => navigate(tab.path)}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}

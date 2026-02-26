import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { authAPI } from '../services/api';
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const { t, language, changeLanguage } = useLanguage();
    const [profile, setProfile] = useState(() => {
        try { return JSON.parse(localStorage.getItem('km_user')) || {}; } catch { return {}; }
    });
    const [saved, setSaved] = useState(false);

    const update = (key, val) => setProfile(p => ({ ...p, [key]: val }));
    const updateLocation = (key, val) => setProfile(p => ({ ...p, location: { ...p.location, [key]: val } }));
    const updateFarm = (key, val) => setProfile(p => ({ ...p, farmDetails: { ...p.farmDetails, [key]: val } }));

    const saveProfile = async () => {
        localStorage.setItem('km_user', JSON.stringify(profile));
        try { await authAPI.updateProfile(profile); } catch { }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const states = ['Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Kerala'];

    return (
        <div className="profile-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>👤 {t('profile.title')}</h1>
                </div>
            </header>

            <div className="card">
                <div className="profile-avatar">👨‍🌾</div>
                <div className="form-group">
                    <label>{t('profile.name')}</label>
                    <input type="text" value={profile.name || ''} onChange={e => update('name', e.target.value)} placeholder="Your name" />
                </div>
                <div className="form-group">
                    <label>{t('profile.language')}</label>
                    <div className="lang-options">
                        {[['en', 'English'], ['hi', 'हिंदी'], ['kn', 'ಕನ್ನಡ']].map(([code, label]) => (
                            <button key={code} className={`lang-option ${language === code ? 'active' : ''}`} onClick={() => { changeLanguage(code); update('language', code); }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="section-title" style={{ margin: '0 0 12px' }}>📍 Location</h3>
                <div className="form-group">
                    <label>{t('profile.state')}</label>
                    <select value={profile.location?.state || ''} onChange={e => updateLocation('state', e.target.value)}>
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>{t('profile.district')}</label>
                    <input type="text" value={profile.location?.district || ''} onChange={e => updateLocation('district', e.target.value)} placeholder="Your district" />
                </div>
            </div>

            <div className="card">
                <h3 className="section-title" style={{ margin: '0 0 12px' }}>🌾 Farm Details</h3>
                <div className="form-group">
                    <label>{t('profile.soilType')}</label>
                    <select value={profile.farmDetails?.soilType || ''} onChange={e => updateFarm('soilType', e.target.value)}>
                        <option value="">Select Soil Type</option>
                        {['Black', 'Red', 'Sandy', 'Clay', 'Loamy', 'Alluvial'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>{t('profile.water')}</label>
                    <select value={profile.farmDetails?.waterAvailability || ''} onChange={e => updateFarm('waterAvailability', e.target.value)}>
                        <option value="">Select</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>{t('profile.landSize')}</label>
                    <input type="number" value={profile.farmDetails?.landSize || ''} onChange={e => updateFarm('landSize', e.target.value)} placeholder="Land in acres" />
                </div>
            </div>

            <div style={{ padding: '0 16px 24px' }}>
                <button className="btn btn-primary btn-full" onClick={saveProfile}>
                    {saved ? '✅ Saved!' : `💾 ${t('profile.save')}`}
                </button>
            </div>
        </div>
    );
}

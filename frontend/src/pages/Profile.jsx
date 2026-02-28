import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { authAPI } from '../services/api';
import './Profile.css';

const CROP_OPTIONS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Groundnut', 'Tomato', 'Onion', 'Pulses', 'Bajra', 'Jowar', 'Turmeric', 'Chilli'];
const EQUIPMENT_OPTIONS = ['Tractor', 'Pump Set', 'Drip System', 'Sprayer', 'Thresher', 'Power Tiller', 'Harvester', 'Rotavator'];
const SEASON_OPTIONS = ['Kharif (Jun–Oct)', 'Rabi (Nov–Apr)', 'Zaid (Apr–Jun)', 'Year-round'];

export default function Profile() {
    const navigate = useNavigate();
    const { t, language, changeLanguage } = useLanguage();
    const [tab, setTab] = useState('about'); // 'about' or 'edit'
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState(() => {
        try { return JSON.parse(localStorage.getItem('km_user')) || {}; } catch { return {}; }
    });

    const update = (key, val) => setProfile(p => ({ ...p, [key]: val }));
    const updateLocation = (key, val) => setProfile(p => ({ ...p, location: { ...p.location, [key]: val } }));
    const updateFarm = (key, val) => setProfile(p => ({ ...p, farmDetails: { ...p.farmDetails, [key]: val } }));

    const toggleMulti = (key, val) => {
        const arr = profile.farmDetails?.[key] || [];
        updateFarm(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    };

    const saveProfile = async () => {
        localStorage.setItem('km_user', JSON.stringify(profile));
        try { await authAPI.updateProfile(profile); } catch { }
        setSaved(true);
        setTimeout(() => { setSaved(false); setTab('about'); }, 1500);
    };

    const states = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

    const fd = profile.farmDetails || {};
    const loc = profile.location || {};

    // Smart insight for About Me
    const getInsight = () => {
        if (!fd.soilType || !fd.waterAvailability) return null;
        if (fd.soilType === 'Black' && fd.waterAvailability === 'High') return '💡 Black soil + high water = ideal for cotton & sugarcane!';
        if (fd.soilType === 'Alluvial' && fd.soilFertility === 'High') return '💡 Alluvial + high fertility = excellent for wheat & rice!';
        if (fd.waterAvailability === 'Low') return '💡 Low water? Consider drip irrigation & drought-resistant crops like bajra.';
        if (fd.soilType === 'Red') return '💡 Red soil is great for groundnut, ragi, and pulses!';
        return '💡 Complete your soil health card to get personalised insights!';
    };

    const profileComplete = Math.round(
        [profile.name, loc.state, loc.district, fd.landSize, fd.soilType, fd.landOwnership,
        fd.soilFertility, fd.irrigationType, fd.farmingExperience, fd.annualIncome,
        (fd.primaryCrops?.length > 0) ? 'x' : null].filter(Boolean).length / 11 * 100
    );

    return (
        <div className="profile-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48, flex: 1 }}>
                    <h1>👤 {t('profile.title')}</h1>
                </div>
            </header>

            {/* Tab Switcher */}
            <div className="profile-tabs">
                <button className={`profile-tab ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>
                    🪪 About Me
                </button>
                <button className={`profile-tab ${tab === 'edit' ? 'active' : ''}`} onClick={() => setTab('edit')}>
                    ✏️ Edit Profile
                </button>
            </div>

            {/* ====== ABOUT ME TAB ====== */}
            {tab === 'about' && (
                <div className="about-me-view">
                    {/* Farmer ID Card */}
                    <div className="farmer-id-card">
                        <div className="farmer-avatar-large">👨‍🌾</div>
                        <div className="farmer-id-info">
                            <h2>{profile.name || 'Farmer'}</h2>
                            <p className="farmer-location">
                                {[loc.village, loc.district, loc.state].filter(Boolean).join(', ') || 'Location not set'}
                            </p>
                            {fd.farmingExperience && (
                                <span className="experience-tag">🌾 {fd.farmingExperience} yrs experience</span>
                            )}
                        </div>
                        {/* Profile completion ring */}
                        <div className="completion-ring" title={`Profile ${profileComplete}% complete`}>
                            <svg viewBox="0 0 36 36" style={{ width: 52, height: 52 }}>
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle cx="18" cy="18" r="15.9" fill="none"
                                    stroke={profileComplete >= 80 ? '#16a34a' : profileComplete >= 50 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="3" strokeDasharray={`${profileComplete} ${100 - profileComplete}`}
                                    strokeDashoffset="25" strokeLinecap="round" />
                                <text x="18" y="20.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1e293b">{profileComplete}%</text>
                            </svg>
                        </div>
                    </div>

                    {/* Smart Insight Banner */}
                    {getInsight() && (
                        <div className="insight-banner">{getInsight()}</div>
                    )}

                    {/* Stats Grid */}
                    <div className="farm-stats-grid">
                        <StatCard icon="🏡" label="Land" value={fd.landSize ? `${fd.landSize} acres` : '—'} />
                        <StatCard icon="📜" label="Ownership" value={fd.landOwnership || '—'} />
                        <StatCard icon="🌱" label="Soil Type" value={fd.soilType || '—'} />
                        <StatCard icon="🧪" label="Fertility" value={fd.soilFertility || '—'} color={fd.soilFertility === 'High' ? '#16a34a' : fd.soilFertility === 'Medium' ? '#f59e0b' : '#ef4444'} />
                        <StatCard icon="⚗️" label="Soil pH" value={fd.soilpH?.split(' ')[0] || '—'} />
                        <StatCard icon="💧" label="Water" value={fd.waterAvailability || '—'} />
                        <StatCard icon="🚿" label="Irrigation" value={fd.irrigationType || '—'} />
                        <StatCard icon="💰" label="Income" value={fd.annualIncome || '—'} />
                    </div>

                    {/* Primary Crops */}
                    {fd.primaryCrops?.length > 0 && (
                        <div className="about-section-card">
                            <h3>🌾 Crops I Grow</h3>
                            <div className="tags-display">
                                {fd.primaryCrops.map(c => <span key={c} className="info-tag green">{c}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Farming Season */}
                    {fd.farmingSeason?.length > 0 && (
                        <div className="about-section-card">
                            <h3>📅 Farming Seasons</h3>
                            <div className="tags-display">
                                {fd.farmingSeason.map(s => <span key={s} className="info-tag blue">{s}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Equipment */}
                    {fd.equipmentOwned?.length > 0 && (
                        <div className="about-section-card">
                            <h3>🚜 Equipment I Own</h3>
                            <div className="tags-display">
                                {fd.equipmentOwned.map(e => <span key={e} className="info-tag gray">{e}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Benefits */}
                    <div className="about-section-card">
                        <h3>🏛️ Government Benefits</h3>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div className={`benefit-badge ${fd.hasGovtSubsidy ? 'active' : ''}`}>
                                {fd.hasGovtSubsidy ? '✅' : '❌'} Govt Subsidy
                            </div>
                            <div className={`benefit-badge ${fd.hasSoilHealthCard ? 'active' : ''}`}>
                                {fd.hasSoilHealthCard ? '✅' : '❌'} Soil Health Card
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {fd.notes && (
                        <div className="about-section-card">
                            <h3>📝 Notes</h3>
                            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>{fd.notes}</p>
                        </div>
                    )}

                    <button className="btn btn-primary btn-full" style={{ margin: '0 16px 24px' }} onClick={() => setTab('edit')}>
                        ✏️ Edit My Profile
                    </button>
                </div>
            )}

            {/* ====== EDIT PROFILE TAB ====== */}
            {tab === 'edit' && (
                <div className="edit-profile-view">

                    {/* Basic Info */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">👤 Basic Info</h3>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" value={profile.name || ''} onChange={e => update('name', e.target.value)} placeholder="Your full name" />
                        </div>
                        <div className="form-group">
                            <label>{t('profile.language')}</label>
                            <div className="lang-options">
                                {[['en', 'English'], ['hi', 'हिंदी'], ['kn', 'ಕನ್ನಡ']].map(([code, label]) => (
                                    <button key={code} className={`lang-option ${language === code ? 'active' : ''}`}
                                        onClick={() => { changeLanguage(code); update('language', code); }}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">📍 Location</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>State</label>
                                <select value={loc.state || ''} onChange={e => updateLocation('state', e.target.value)}>
                                    <option value="">Select State</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>District</label>
                                <input type="text" value={loc.district || ''} onChange={e => updateLocation('district', e.target.value)} placeholder="District" />
                            </div>
                            <div className="form-group">
                                <label>Village / Town</label>
                                <input type="text" value={loc.village || ''} onChange={e => updateLocation('village', e.target.value)} placeholder="Village name" />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input type="text" value={loc.pincode || ''} onChange={e => updateLocation('pincode', e.target.value)} placeholder="6-digit pincode" />
                            </div>
                        </div>
                    </div>

                    {/* Land Details */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">🏡 Land Details</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Land Size (acres)</label>
                                <input type="number" value={fd.landSize || ''} onChange={e => updateFarm('landSize', e.target.value)} placeholder="e.g. 2.5" />
                            </div>
                            <div className="form-group">
                                <label>Land Ownership</label>
                                <select value={fd.landOwnership || ''} onChange={e => updateFarm('landOwnership', e.target.value)}>
                                    <option value="">Select</option>
                                    {['Owned', 'Leased', 'Shared', 'Government Allotted'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Soil Details */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">🌱 Soil Health</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Soil Type</label>
                                <select value={fd.soilType || ''} onChange={e => updateFarm('soilType', e.target.value)}>
                                    <option value="">Select</option>
                                    {['Black', 'Red', 'Sandy', 'Clay', 'Loamy', 'Alluvial'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Soil Fertility</label>
                                <select value={fd.soilFertility || ''} onChange={e => updateFarm('soilFertility', e.target.value)}>
                                    <option value="">Select</option>
                                    {['High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Soil pH Level</label>
                                <select value={fd.soilpH || ''} onChange={e => updateFarm('soilpH', e.target.value)}>
                                    <option value="">Select</option>
                                    {['Acidic (< 6)', 'Neutral (6-7.5)', 'Alkaline (> 7.5)'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Water Availability</label>
                                <select value={fd.waterAvailability || ''} onChange={e => updateFarm('waterAvailability', e.target.value)}>
                                    <option value="">Select</option>
                                    {['High', 'Medium', 'Low'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Irrigation Type</label>
                                <select value={fd.irrigationType || ''} onChange={e => updateFarm('irrigationType', e.target.value)}>
                                    <option value="">Select</option>
                                    {['Canal', 'Borewell', 'Drip', 'Sprinkler', 'Rainwater', 'None'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Crops & Seasons */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">🌾 Crops & Seasons</h3>
                        <div className="form-group">
                            <label>Primary Crops (select all that apply)</label>
                            <div className="chip-selector">
                                {CROP_OPTIONS.map(c => (
                                    <button key={c} type="button"
                                        className={`chip ${(fd.primaryCrops || []).includes(c) ? 'selected' : ''}`}
                                        onClick={() => toggleMulti('primaryCrops', c)}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Farming Seasons</label>
                            <div className="chip-selector">
                                {SEASON_OPTIONS.map(s => (
                                    <button key={s} type="button"
                                        className={`chip ${(fd.farmingSeason || []).includes(s) ? 'selected' : ''}`}
                                        onClick={() => toggleMulti('farmingSeason', s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Experience & Income */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">📊 Experience & Income</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Farming Experience (years)</label>
                                <input type="number" value={fd.farmingExperience || ''} onChange={e => updateFarm('farmingExperience', e.target.value)} placeholder="e.g. 15" />
                            </div>
                            <div className="form-group">
                                <label>Annual Farm Income</label>
                                <select value={fd.annualIncome || ''} onChange={e => updateFarm('annualIncome', e.target.value)}>
                                    <option value="">Select Range</option>
                                    {['< 1 Lakh', '1-3 Lakhs', '3-5 Lakhs', '5-10 Lakhs', '> 10 Lakhs'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">🚜 Equipment I Own</h3>
                        <div className="chip-selector">
                            {EQUIPMENT_OPTIONS.map(e => (
                                <button key={e} type="button"
                                    className={`chip ${(fd.equipmentOwned || []).includes(e) ? 'selected' : ''}`}
                                    onClick={() => toggleMulti('equipmentOwned', e)}>
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Govt Benefits */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">🏛️ Government Benefits</h3>
                        <div className="toggle-row">
                            <label className="toggle-label">
                                <input type="checkbox" checked={fd.hasGovtSubsidy || false} onChange={e => updateFarm('hasGovtSubsidy', e.target.checked)} />
                                <span>Receiving Government Subsidy (PM-KISAN / Fertilizer)</span>
                            </label>
                        </div>
                        <div className="toggle-row">
                            <label className="toggle-label">
                                <input type="checkbox" checked={fd.hasSoilHealthCard || false} onChange={e => updateFarm('hasSoilHealthCard', e.target.checked)} />
                                <span>I have a Soil Health Card</span>
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">📝 Additional Notes</h3>
                        <div className="form-group">
                            <textarea rows={4} value={fd.notes || ''} onChange={e => updateFarm('notes', e.target.value)}
                                placeholder="Any other details about your farm, specific challenges, or goals..." />
                        </div>
                    </div>

                    <div style={{ padding: '0 16px 32px' }}>
                        <button className="btn btn-primary btn-full" onClick={saveProfile}>
                            {saved ? '✅ Saved!' : '💾 Save Profile'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color: color || '#1e293b' }}>{value}</div>
        </div>
    );
}

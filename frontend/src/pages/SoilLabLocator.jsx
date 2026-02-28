import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { labsAPI } from '../services/api';
import './SoilLabLocator.css';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function SoilLabLocator() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ state: '', type: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedLab, setSelectedLab] = useState(null);
    const [bookingDone, setBookingDone] = useState(false);
    const [bookingData, setBookingData] = useState({
        bookingDate: new Date().toISOString().split('T')[0],
        address: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            setBookingData(prev => ({
                ...prev,
                phone: user.phone || '',
                address: (user.farmDetails && user.farmDetails.location) || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        fetchLabs();
    }, [filters]);

    const fetchLabs = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.state) params.state = filters.state;
            if (filters.type) params.type = filters.type;
            const res = await labsAPI.getAll(params);
            setLabs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching labs:', err);
            setError(t('common.error'));
            setLabs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (lab) => {
        if (!user) { navigate('/login'); return; }
        setSelectedLab(lab);
        setBookingDone(false);
        setShowModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await labsAPI.book({ labId: selectedLab._id, ...bookingData });
            setBookingDone(true);
        } catch (err) {
            console.error('Booking error:', err);
            alert(t('common.error'));
        }
    };

    const getName = (lab) => {
        if (!lab || !lab.name) return '';
        if (typeof lab.name === 'object') return lab.name[language] || lab.name.en || '';
        return lab.name;
    };

    const getAddress = (lab) => {
        if (!lab || !lab.address) return '';
        if (typeof lab.address === 'object') return lab.address[language] || lab.address.en || '';
        return lab.address;
    };

    return (
        <div className="soil-labs-page">
            <div className="labs-header">
                <h1>🧪 {t('soilLab.title')}</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.95rem' }}>{t('soilLab.subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="search-filters">
                <div className="filter-group">
                    <label>{t('soilLab.state')}</label>
                    <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}>
                        <option value="">{t('soilLab.allStates')}</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>{t('soilLab.type')}</label>
                    <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                        <option value="">{t('soilLab.allTypes')}</option>
                        <option value="government">🏛️ {t('soilLab.government')}</option>
                        <option value="private">🏢 {t('soilLab.private')}</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>🔍 {t('soilLab.searching')}</div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>⚠️ {error}</div>
            ) : (
                <div className="labs-grid">
                    {labs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('soilLab.noResults')}</div>
                    ) : labs.map(lab => (
                        <div key={lab._id} className="lab-card">
                            <span className={`lab-badge ${lab.type}`}>
                                {lab.type === 'government' ? `🏛️ ${t('soilLab.government')}` : `🏢 ${t('soilLab.private')}`}
                            </span>
                            <h2 className="lab-name">{getName(lab)}</h2>
                            <div className="lab-info">
                                <div className="lab-info-item">📍 {getAddress(lab)}</div>
                                <div className="lab-info-item">📞 {lab.contact}</div>
                                <div className="lab-info-item">📍 {lab.state}, {lab.district}</div>
                                <div className="lab-info-item">⭐ {lab.rating} / 5.0</div>
                            </div>
                            {lab.services && lab.services.length > 0 && (
                                <div className="lab-services">
                                    {lab.services.map(s => <span key={s} className="service-tag">{s}</span>)}
                                </div>
                            )}
                            <button className="book-btn" onClick={() => handleBookClick(lab)}>
                                📅 {t('soilLab.book')}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {showModal && selectedLab && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="lab-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📅 {t('soilLab.bookTitle')}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="booking-summary">
                            <h4>{getName(selectedLab)}</h4>
                            <p>{getAddress(selectedLab)}</p>
                        </div>

                        {bookingDone ? (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <div style={{ fontSize: '3rem' }}>✅</div>
                                <h3 style={{ color: '#16a34a', margin: '12px 0 8px' }}>{t('soilLab.success')}</h3>
                                <p style={{ color: '#64748b' }}>{t('soilLab.successMsg')}</p>
                                <button className="book-btn" style={{ marginTop: '16px' }} onClick={() => setShowModal(false)}>
                                    {t('soilLab.close')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit}>
                                <div className="form-group">
                                    <label>{t('soilLab.date')}</label>
                                    <input type="date" value={bookingData.bookingDate} min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setBookingData(d => ({ ...d, bookingDate: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('soilLab.address')}</label>
                                    <input type="text" value={bookingData.address}
                                        onChange={e => setBookingData(d => ({ ...d, address: e.target.value }))}
                                        placeholder={t('soilLab.address')} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('soilLab.phone')}</label>
                                    <input type="tel" value={bookingData.phone}
                                        onChange={e => setBookingData(d => ({ ...d, phone: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('soilLab.notes')}</label>
                                    <input type="text" value={bookingData.notes}
                                        onChange={e => setBookingData(d => ({ ...d, notes: e.target.value }))} />
                                </div>
                                <button type="submit" className="submit-btn" style={{ background: '#16a34a' }}>
                                    ✅ {t('soilLab.confirm')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

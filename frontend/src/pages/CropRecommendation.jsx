import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cropsAPI } from '../services/api';
import { indianStatesAndDistricts } from '../utils/indiaData';
import './CropRecommendation.css';

export default function CropRecommendation() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [form, setForm] = useState({
        soilType: '', waterAvailability: '', season: 'Kharif',
        state: '', district: '', landSize: 1,
        nitrogen: '', phosphorus: '', potassium: '', ph: ''
    });

    // Extract state names for dropdown
    const statesList = Object.keys(indianStatesAndDistricts).sort();

    // Get districts for currently selected state
    const districtsList = form.state ? indianStatesAndDistricts[form.state].sort() : [];
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const set = (k, v) => {
        setForm(f => {
            const newState = { ...f, [k]: v };
            // If state changes, clear the district
            if (k === 'state') newState.district = '';
            return newState;
        });
    };

    const getRecommendations = async () => {
        setLoading(true);
        try {
            const res = await cropsAPI.recommend(form);
            setResults(res.data.recommendations);
        } catch (e) {
            alert('Error: ' + (e.response?.data?.message || e.message));
        } finally { setLoading(false); }
    };

    const riskColor = { Low: '#4caf50', Medium: '#ff8f00', High: '#e53935' };

    return (
        <div className="crop-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>🌾 {t('cropRec.title')}</h1>
                    <p>AI-powered recommendations</p>
                </div>
            </header>

            <div className="card">
                <div className="form-group">
                    <label>{t('cropRec.soilType')}</label>
                    <select value={form.soilType} onChange={e => set('soilType', e.target.value)}>
                        <option value="">Select Soil Type</option>
                        {['Black', 'Red', 'Sandy', 'Clay', 'Loamy', 'Alluvial'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>{t('cropRec.water')}</label>
                        <select value={form.waterAvailability} onChange={e => set('waterAvailability', e.target.value)}>
                            <option value="">Select</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('cropRec.season')}</label>
                        <select value={form.season} onChange={e => set('season', e.target.value)}>
                            <option value="Kharif">Kharif</option>
                            <option value="Rabi">Rabi</option>
                            <option value="Zaid">Zaid</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>State</label>
                        <select value={form.state} onChange={e => set('state', e.target.value)}>
                            <option value="">Select State</option>
                            {statesList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>District</label>
                        <select value={form.district} onChange={e => set('district', e.target.value)} disabled={!form.state}>
                            <option value="">Select District</option>
                            {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                    {showAdvanced ? '▲' : '▼'} Advanced Soil Metrics (NPK, pH)
                </button>

                {showAdvanced && (
                    <div className="form-row" style={{ marginTop: 12 }}>
                        <div className="form-group"><label>Nitrogen (N)</label><input type="number" value={form.nitrogen} onChange={e => set('nitrogen', e.target.value)} placeholder="kg/ha" /></div>
                        <div className="form-group"><label>Phosphorus (P)</label><input type="number" value={form.phosphorus} onChange={e => set('phosphorus', e.target.value)} placeholder="kg/ha" /></div>
                        <div className="form-group"><label>Potassium (K)</label><input type="number" value={form.potassium} onChange={e => set('potassium', e.target.value)} placeholder="kg/ha" /></div>
                        <div className="form-group"><label>pH Level</label><input type="number" value={form.ph} onChange={e => set('ph', e.target.value)} placeholder="6.5" step="0.1" /></div>
                    </div>
                )}

                <button className="btn btn-primary btn-full" onClick={getRecommendations} disabled={loading || !form.soilType || !form.state || !form.district}>
                    {loading ? '⏳ ' + t('cropRec.loading') : '🌾 ' + t('cropRec.recommend')}
                </button>
            </div>

            {results && (
                <div className="results-section">
                    <h3 className="section-title">Top Crop Recommendations</h3>
                    {results.map((crop, i) => (
                        <div key={i} className="crop-result-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="crop-rank">#{i + 1}</div>
                            <div className="crop-info">
                                <h4>{crop.name}</h4>
                                <div className="crop-names-local">{crop.nameHi} · {crop.nameKn}</div>
                                <div className="crop-stats">
                                    <span>📦 {crop.estimatedYield}</span>
                                    <span>💰 {crop.estimatedProfit}</span>
                                    <span>⏱️ {crop.growthDuration}</span>
                                    <span style={{ color: riskColor[crop.riskLevel] }}>⚡ {crop.riskLevel} Risk</span>
                                </div>
                                <div className="crop-sowing">🗓️ Sow: {crop.bestSowingMonth}</div>
                                {crop.tips?.length > 0 && (
                                    <ul className="crop-tips">
                                        {crop.tips.slice(0, 2).map((tip, j) => <li key={j}>✅ {tip}</li>)}
                                    </ul>
                                )}
                            </div>
                            <div className="suitability-bar">
                                <div className="suitability-fill" style={{ height: `${crop.suitabilityScore}%` }}></div>
                                <div className="suitability-label">{crop.suitabilityScore}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

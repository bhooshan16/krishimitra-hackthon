import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fertilizerAPI, cropsAPI } from '../services/api';
import './FertilizerGuide.css';

export default function FertilizerGuide() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [form, setForm] = useState({ crop: '', growthStage: 'Pre-sowing', soilType: '', landSize: 1, nitrogen: '', phosphorus: '', potassium: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dynamic crops from database
    const [dbCrops, setDbCrops] = useState([]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // Fetch crops on load
    React.useEffect(() => {
        cropsAPI.getAll().then(res => {
            if (res.data.success) setDbCrops(res.data.crops);
        }).catch(err => console.error("Failed to fetch crops", err));
    }, []);

    const stages = ['Pre-sowing', 'Basal Dose', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];

    const getRecommendation = async () => {
        setLoading(true);
        try {
            const res = await fertilizerAPI.recommend(form);
            setResult(res.data.recommendation);
        } catch (e) { alert(e.response?.data?.message || e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fertilizer-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>🧪 {t('home.fertilizer')}</h1>
                    <p>AI-powered NPK recommendations</p>
                </div>
            </header>

            <div className="card">
                <div className="form-group">
                    <label>{t('fertilizer.crop')}</label>
                    <select value={form.crop} onChange={e => set('crop', e.target.value)}>
                        <option value="">{t('fertilizer.selectCrop')}</option>
                        {dbCrops.map(c => (
                            <option key={c._id} value={c.name.en}>
                                {c.name[language] || c.name.en}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>{t('fertilizer.growthStage')}</label>
                        <select value={form.growthStage} onChange={e => set('growthStage', e.target.value)}>
                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('fertilizer.soilType')}</label>
                        <select value={form.soilType} onChange={e => set('soilType', e.target.value)}>
                            <option value="">Select</option>
                            {['Black', 'Red', 'Sandy', 'Clay', 'Loamy'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>{t('fertilizer.landSize')}</label>
                    <input type="number" value={form.landSize} onChange={e => set('landSize', e.target.value)} min="0.5" step="0.5" />
                </div>
                <h4 style={{ marginBottom: 8, fontSize: '0.88rem', color: '#555' }}>{t('fertilizer.npkRequired')}</h4>
                <div className="form-row">
                    <div className="form-group"><label>N (kg/ha)</label><input type="number" value={form.nitrogen} onChange={e => set('nitrogen', e.target.value)} placeholder="120" /></div>
                    <div className="form-group"><label>P (kg/ha)</label><input type="number" value={form.phosphorus} onChange={e => set('phosphorus', e.target.value)} placeholder="60" /></div>
                    <div className="form-group"><label>K (kg/ha)</label><input type="number" value={form.potassium} onChange={e => set('potassium', e.target.value)} placeholder="40" /></div>
                </div>
                <button className="btn btn-primary btn-full" onClick={getRecommendation} disabled={loading || !form.crop}>
                    {loading ? '⏳ ' + t('fertilizer.loading') : '🧪 ' + t('fertilizer.getRec')}
                </button>
            </div>

            {result && (
                <div className="fert-results fade-in">
                    {result.npkRecommendation && (
                        <div className="npk-summary card">
                            <h3>{t('fertilizer.recNPK')}</h3>
                            <div className="npk-pills">
                                <div className="npk-pill n">N: {result.npkRecommendation.n}<small>kg/ha</small></div>
                                <div className="npk-pill p">P: {result.npkRecommendation.p}<small>kg/ha</small></div>
                                <div className="npk-pill k">K: {result.npkRecommendation.k}<small>kg/ha</small></div>
                            </div>
                        </div>
                    )}
                    {result.fertilizers?.length > 0 && (
                        <div className="card">
                            <h3>💊 {t('fertilizer.chemFert')}</h3>
                            {result.fertilizers.map((f, i) => (
                                <div key={i} className="fert-item">
                                    <div className="fert-name">{f.name}</div>
                                    <div className="fert-details">{f.quantity} · {f.timing}</div>
                                    {f.cost && <div className="fert-cost">{t('fertilizer.estCost')} {f.cost}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                    {result.organicAlternatives?.length > 0 && (
                        <div className="card">
                            <h3>🍃 {t('fertilizer.orgAlt')}</h3>
                            {result.organicAlternatives.map((o, i) => (
                                <div key={i} className="fert-item organic">
                                    <div className="fert-name">🌿 {o.name}</div>
                                    <div className="fert-details">{o.quantity}</div>
                                    {o.benefit && <div className="fert-benefit">{o.benefit}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                    {result.tips?.length > 0 && (
                        <div className="card">
                            <h3>💡 {t('fertilizer.tips')}</h3>
                            <ul style={{ paddingLeft: 20 }}>
                                {result.tips.map((tip, i) => <li key={i} style={{ fontSize: '0.88rem', margin: '5px 0', color: '#444' }}>{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

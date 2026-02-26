import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { profitAPI } from '../services/api';
import './ProfitCalculator.css';

export default function ProfitCalculator() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [form, setForm] = useState({
        cropName: '', season: 'Kharif', state: '', landSize: 1,
        seedCost: '', fertilizerCost: '', laborCost: '', irrigationCost: '', pesticideCost: '', otherCosts: '',
        expectedYield: '', marketPrice: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const crops = ['Rice', 'Wheat', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Maize', 'Groundnut', 'Soybean', 'Sugarcane'];

    const calculate = async () => {
        setLoading(true);
        try {
            const res = await profitAPI.calculate(form);
            setResult(res.data);
        } catch (e) { alert(e.message); }
        finally { setLoading(false); }
    };

    const profitColor = result?.calculation?.profit >= 0 ? '#2d7a3a' : '#e53935';

    return (
        <div className="profit-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48 }}>
                    <h1>💰 {t('profit.title')}</h1>
                    <p>Calculate your expected earnings</p>
                </div>
            </header>

            <div className="card">
                <div className="form-row">
                    <div className="form-group">
                        <label>{t('profit.crop')}</label>
                        <select value={form.cropName} onChange={e => set('cropName', e.target.value)}>
                            <option value="">Select crop</option>
                            {crops.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Season</label>
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
                        <input type="text" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Karnataka" />
                    </div>
                    <div className="form-group">
                        <label>{t('profit.land')} (acres)</label>
                        <input type="number" value={form.landSize} onChange={e => set('landSize', e.target.value)} min="0.5" step="0.5" />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 700 }}>💸 {t('profit.costs')} (₹)</h3>
                <div className="form-row">
                    <div className="form-group"><label>{t('profit.seed')}</label><input type="number" value={form.seedCost} onChange={e => set('seedCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>{t('profit.fertilizer')}</label><input type="number" value={form.fertilizerCost} onChange={e => set('fertilizerCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>{t('profit.labor')}</label><input type="number" value={form.laborCost} onChange={e => set('laborCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>{t('profit.irrigation')}</label><input type="number" value={form.irrigationCost} onChange={e => set('irrigationCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Pesticide Cost</label><input type="number" value={form.pesticideCost} onChange={e => set('pesticideCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Other Costs</label><input type="number" value={form.otherCosts} onChange={e => set('otherCosts', e.target.value)} placeholder="0" /></div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 700 }}>📦 Expected Revenue</h3>
                <div className="form-row">
                    <div className="form-group"><label>Expected Yield (quintal/acre)</label><input type="number" value={form.expectedYield} onChange={e => set('expectedYield', e.target.value)} placeholder="20" /></div>
                    <div className="form-group"><label>Market Price (₹/quintal)</label><input type="number" value={form.marketPrice} onChange={e => set('marketPrice', e.target.value)} placeholder="2000" /></div>
                </div>
                <button className="btn btn-primary btn-full" onClick={calculate} disabled={loading || !form.cropName}>
                    {loading ? '⏳ Calculating...' : '💰 ' + t('profit.calculate')}
                </button>
            </div>

            {result && (
                <div className="profit-result fade-in">
                    <div className="profit-summary card">
                        <div className="profit-row"><span>{t('profit.totalCost')}</span><span>₹{result.calculation.costs.totalCost?.toLocaleString('en-IN')}</span></div>
                        <div className="profit-row"><span>{t('profit.revenue')}</span><span>₹{result.calculation.revenue.totalRevenue?.toLocaleString('en-IN')}</span></div>
                        <div className="profit-divider"></div>
                        <div className="profit-row big"><span>{t('profit.profit')}</span><span style={{ color: profitColor }}>₹{result.calculation.profit?.toLocaleString('en-IN')}</span></div>
                        <div className="profit-row"><span>{t('profit.roi')}</span><span style={{ color: profitColor }}>{result.calculation.roi}%</span></div>
                    </div>

                    {result.insights?.optimizationTips?.length > 0 && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>💡 Cost Optimization Tips</h3>
                            <ul style={{ paddingLeft: 20 }}>
                                {result.insights.optimizationTips.map((tip, i) => <li key={i} style={{ fontSize: '0.86rem', margin: '5px 0', color: '#444' }}>{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

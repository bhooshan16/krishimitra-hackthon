import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { profitAPI, mandiAPI } from '../services/api';
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
    const [priceLoading, setPriceLoading] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const crops = ['Rice', 'Wheat', 'Cotton', 'Onion', 'Tomato', 'Potato', 'Maize', 'Groundnut', 'Soybean', 'Sugarcane'];

    // Auto-price fetching
    React.useEffect(() => {
        const fetchPrice = async () => {
            if (form.cropName && form.state) {
                setPriceLoading(true);
                try {
                    const res = await mandiAPI.getRates({ state: form.state, commodity: form.cropName, limit: 1 });
                    if (res.data?.length > 0) {
                        set('marketPrice', res.data[0].modalPrice);
                    }
                } catch (e) {
                    console.warn('Auto-price fetch failed', e);
                } finally {
                    setPriceLoading(false);
                }
            }
        };
        fetchPrice();
    }, [form.cropName, form.state]);

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
                    <h1>🧠 Smart Profit Advisor</h1>
                    <p>Optimized crop insights & loss prevention</p>
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
                        <input type="text" value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Karnataka" />
                    </div>
                    <div className="form-group">
                        <label>{t('profit.land')} (acres)</label>
                        <input type="number" value={form.landSize} onChange={e => set('landSize', e.target.value)} min="0.5" step="0.5" />
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="section-title">💸 {t('profit.costs')} (₹)</h3>
                <div className="form-row costs-grid">
                    <div className="form-group"><label>{t('profit.seed')}</label><input type="number" value={form.seedCost} onChange={e => set('seedCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>{t('profit.fertilizer')}</label><input type="number" value={form.fertilizerCost} onChange={e => set('fertilizerCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>{t('profit.labor')}</label><input type="number" value={form.laborCost} onChange={e => set('laborCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>{t('profit.irrigation')}</label><input type="number" value={form.irrigationCost} onChange={e => set('irrigationCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Pesticide</label><input type="number" value={form.pesticideCost} onChange={e => set('pesticideCost', e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Other</label><input type="number" value={form.otherCosts} onChange={e => set('otherCosts', e.target.value)} placeholder="0" /></div>
                </div>
            </div>

            <div className="card">
                <h3 className="section-title">📦 Expected Revenue</h3>
                <div className="form-row">
                    <div className="form-group"><label>Expected Yield (quintal/acre)</label><input type="number" value={form.expectedYield} onChange={e => set('expectedYield', e.target.value)} placeholder="20" /></div>
                    <div className="form-group">
                        <label>Market Price (₹/quintal)</label>
                        <div className="price-input-wrapper">
                            <input type="number" value={form.marketPrice} onChange={e => set('marketPrice', e.target.value)} placeholder="2000" />
                            {priceLoading && <span className="price-loader">⏳</span>}
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary btn-full calculate-btn" onClick={calculate} disabled={loading || !form.cropName}>
                    {loading ? '⏳ Analyzing Market Trends...' : '🚀 Get Smart Profit Report'}
                </button>
            </div>

            {result && (
                <div className="profit-result fade-in">
                    <div className="card loss-prevention-card">
                        <div className="warning-icon">⚠️</div>
                        <div className="loss-prevention-content">
                            <h4>Loss Prevention Advice</h4>
                            <p>{result.insights.lossPrevention}</p>
                            <div className="break-even-metrics">
                                <div className="metric"><span>Min. Price Needed:</span> <strong>₹{result.calculation.minSellingPrice}/q</strong></div>
                                <div className="metric"><span>Break-even Yield:</span> <strong>{result.calculation.breakEvenYield} q/acre</strong></div>
                            </div>
                        </div>
                    </div>

                    <div className="results-grid">
                        <div className="profit-summary card">
                            <h3 className="card-title">Economic Summary</h3>
                            <div className="profit-row"><span>Total Cost</span><span>₹{result.calculation.costs.totalCost?.toLocaleString('en-IN')}</span></div>
                            <div className="profit-row"><span>Expected Revenue</span><span>₹{result.calculation.revenue.totalRevenue?.toLocaleString('en-IN')}</span></div>
                            <div className="profit-divider"></div>
                            <div className="profit-row big"><span>Estimated Net Profit</span><span style={{ color: profitColor }}>₹{result.calculation.profit?.toLocaleString('en-IN')}</span></div>
                            <div className="profit-row"><span>Return on Investment</span><span style={{ color: profitColor }}>{result.calculation.roi}%</span></div>
                        </div>

                        <div className="card comparisons-card">
                            <h3 className="card-title">Regional Comparison ({form.state})</h3>
                            <div className="comparison-list">
                                {result.insights.comparisons?.map((c, i) => (
                                    <div key={i} className={`comparison-item ${c.isBest ? 'best-choice' : ''}`}>
                                        <div className="crop-info">
                                            <span className="crop-name">{c.crop}</span>
                                            {c.isBest && <span className="best-tag">BEST CHOICE</span>}
                                        </div>
                                        <span className="crop-profit">₹{c.profit.toLocaleString('en-IN')} Profit</span>
                                    </div>
                                ))}
                            </div>
                            <p className="insight-note">* Based on current seasonal trends in {form.state}.</p>
                        </div>
                    </div>

                    {result.insights?.optimizationTips?.length > 0 && (
                        <div className="card">
                            <h3 className="card-title">💡 Expert Optimization Tips</h3>
                            <ul className="tips-list">
                                {result.insights.optimizationTips.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
